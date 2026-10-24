import type { PrismaClient } from '../../keystone/prisma'
import { assertCurrentCustomerActor, type CustomerActor } from './auth'
import { appendCustomerAudit } from './audit'
import { CustomerError, assertSandboxEnabled } from './errors'
import { claimCustomerCommand, commandResult, finishCustomerCommand, validateIdempotencyKey } from './idempotency'
import { evidenceHash } from '../domain/engine'
import { isRetryableTransactionError, transactionBackoff } from '../domain/transaction'
import { resolveTenantCurrency } from './currency'

const serializable=async<T>(prisma:PrismaClient,work:(tx:any)=>Promise<T>)=>{for(let attempt=0;;attempt++){try{return await prisma.$transaction(work,{isolationLevel:'Serializable'})}catch(error){if(attempt>=7||!isRetryableTransactionError(error))throw error;await transactionBackoff(attempt)}}}

const promotionFixtures = [
  { key: 'sandbox-free-bet', name: 'First play free bet', description: 'A $5 restricted free bet. Stake is not returned on a win.', type: 'FREE_BET', budgetMinor: '500000', economics: { amountMinor: '500', stakeReturned: false }, requirements: { minimumOdds: '1.50', validStructures: ['STRAIGHT', 'PARLAY'] } },
  { key: 'sandbox-odds-boost', name: 'Weekend odds boost', description: 'A 10% profit boost capped at $10 for eligible pre-match wagers.', type: 'ODDS_BOOST', budgetMinor: '100000', economics: { boostBasisPoints: 1000, maxBoostMinor: '1000' }, requirements: { minimumOdds: '1.80', validStructures: ['STRAIGHT', 'PARLAY'] } },
  { key: 'sandbox-deposit-match', name: 'Deposit match sandbox', description: 'A $10 restricted bonus wallet award with 3× wagering evidence.', type: 'DEPOSIT_MATCH', budgetMinor: '500000', economics: { amountMinor: '1000', stakeReturned: true }, requirements: { wageringMultiple: 3, validStructures: ['STRAIGHT', 'PARLAY', 'SYSTEM'] } },
] as const

/**
 * Operator-side provisioning from onboarding (an authenticated operator mutation). It only writes the tenant's
 * promotion records; customers still reach them solely through the gated customer API, so it does not depend on
 * whether practice play is open.
 */
export async function ensureSandboxPromotions(prisma: PrismaClient, tenantId: string) {
  const now = new Date()
  const currency = (await resolveTenantCurrency(prisma, tenantId)).code
  await serializable(prisma, async tx => {
    for (const fixture of promotionFixtures) {
      let promotion = await tx.promotion.findFirst({ where: { tenantId, key: fixture.key } })
      if (!promotion) {
        const termsHash = evidenceHash({ key: fixture.key, economics: fixture.economics, requirements: fixture.requirements, version: 'sandbox-full-v1' })
        promotion = await tx.promotion.create({ data: { tenantId, key: fixture.key, name: fixture.name, description: fixture.description, type: fixture.type, status: 'ACTIVE', startsAt: new Date(now.getTime() - 86_400_000), endsAt: new Date(now.getTime() + 30 * 86_400_000), budgetMinor: fixture.budgetMinor, currency: currency, termsVersion: 'sandbox-full-v1', termsHash } })
        const rule = await tx.promotionRuleVersion.create({ data: { tenantId, promotionId: promotion.id, version: 1, eligibility: { kyc: 'APPROVED', onePerPlayer: true }, economics: fixture.economics, wageringRequirements: fixture.requirements, abuseControls: { duplicateAccount: 'DENY', linkedPaymentMethod: 'REVIEW', maxAwardsPerPlayer: 1 }, contributionRules: { sportsbook: 100 }, status: 'ACTIVE', effectiveFrom: now, evidenceHash: termsHash } })
        await tx.campaignBudget.create({ data: { tenantId, promotionId: promotion.id, allocatedMinor: fixture.budgetMinor, awardedMinor: '0', redeemedMinor: '0', forfeitedMinor: '0', currency: currency, version: 1, status: 'ACTIVE' } })
        await tx.outboxMessage.create({ data: { tenantId, aggregateType: 'PROMOTION', aggregateId: promotion.id, eventType: 'promotion.activated.v1', payload: { promotionId: promotion.id, ruleVersionId: rule.id, termsHash }, status: 'PENDING', attempts: 0, maxAttempts: 10, availableAt: now } })
      }
    }
  })
}

const SUPPORTED_ELIGIBILITY_KEYS = new Set(['kyc', 'onePerPlayer'])
type Eligibility = { eligible: true; qualifyingDepositId: string | null } | { eligible: false; reason: string }

/**
 * The single eligibility evaluator used both to display a promotion and inside the claim transaction.
 * Unsupported rule keys fail closed; a deposit match needs an owned, unused, successful deposit in the
 * promotion's currency made during the promotion window.
 */
async function evaluatePromotionEligibility(tx: any, actor: CustomerActor, promotion: any, rule: any, now: Date): Promise<Eligibility> {
  if (!rule) return { eligible: false, reason: 'RULE_UNAVAILABLE' }
  const eligibility = (rule.eligibility && typeof rule.eligibility === 'object' && !Array.isArray(rule.eligibility) ? rule.eligibility : {}) as Record<string, unknown>
  if (Object.keys(eligibility).some(key => !SUPPORTED_ELIGIBILITY_KEYS.has(key))) return { eligible: false, reason: 'RULE_UNSUPPORTED' }
  const [player, exclusion, restriction, redemption] = await Promise.all([
    tx.player.findFirst({ where: { id: actor.playerId, tenantId: actor.tenantId } }),
    tx.selfExclusion.findFirst({ where: { tenantId: actor.tenantId, playerId: actor.playerId, status: 'ACTIVE', startsAt: { lte: now }, OR: [{ endsAt: null }, { endsAt: { gt: now } }] } }),
    tx.accountRestriction.findFirst({ where: { tenantId: actor.tenantId, playerId: actor.playerId, capability: 'WAGER', status: 'ACTIVE' } }),
    eligibility.onePerPlayer === false ? null : tx.promotionRedemption.findFirst({ where: { tenantId: actor.tenantId, playerId: actor.playerId, promotionId: promotion.id, status: 'CLAIMED' } }),
  ])
  if (redemption) return { eligible: false, reason: 'ALREADY_CLAIMED' }
  if (!player || player.status !== 'ACTIVE') return { eligible: false, reason: 'ACCOUNT_INACTIVE' }
  if ((eligibility.kyc ?? 'APPROVED') === 'APPROVED' && player.kycStatus !== 'APPROVED') return { eligible: false, reason: 'VERIFICATION_REQUIRED' }
  if (exclusion || restriction) return { eligible: false, reason: 'ACCOUNT_RESTRICTED' }
  if (promotion.currency !== (actor.currency ?? '')) return { eligible: false, reason: 'CURRENCY_MISMATCH' }
  if (promotion.brandId && player.brandId !== promotion.brandId) return { eligible: false, reason: 'BRAND_MISMATCH' }
  // No verified player jurisdiction exists to compare with a jurisdiction-scoped promotion.
  if (promotion.jurisdictionId) return { eligible: false, reason: 'JURISDICTION_UNVERIFIED' }
  if (promotion.type !== 'DEPOSIT_MATCH') return { eligible: true, qualifyingDepositId: null }
  const deposits = await tx.paymentIntent.findMany({ where: { tenantId: actor.tenantId, playerId: actor.playerId, type: 'DEPOSIT', status: 'SUCCEEDED', currency: promotion.currency, createdAt: { gte: promotion.startsAt, lte: now } }, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }], select: { id: true } })
  if (!deposits.length) return { eligible: false, reason: 'QUALIFYING_DEPOSIT_REQUIRED' }
  const used = await tx.promotionRedemption.findMany({ where: { tenantId: actor.tenantId, playerId: actor.playerId, reasonCode: { in: deposits.map((deposit: { id: string }) => `DEPOSIT:${deposit.id}`) } }, select: { reasonCode: true } })
  const usedIds = new Set(used.map((row: { reasonCode: string }) => row.reasonCode.slice('DEPOSIT:'.length)))
  const qualifying = deposits.find((deposit: { id: string }) => !usedIds.has(deposit.id))
  return qualifying ? { eligible: true, qualifyingDepositId: qualifying.id } : { eligible: false, reason: 'QUALIFYING_DEPOSIT_REQUIRED' }
}

export async function getCustomerPromotions(prisma: PrismaClient, actor: CustomerActor) {
  // Promotions are provisioned by operator setup/onboarding; a customer read never creates them.
  await assertCurrentCustomerActor(prisma, actor)
  const now = new Date()
  const [promotions, redemptions, awards] = await Promise.all([
    prisma.promotion.findMany({ where: { tenantId: actor.tenantId, status: 'ACTIVE', startsAt: { lte: now }, endsAt: { gt: now } }, orderBy: { endsAt: 'asc' }, take: 30 }),
    prisma.promotionRedemption.findMany({ where: { tenantId: actor.tenantId, playerId: actor.playerId }, orderBy: { redeemedAt: 'desc' }, take: 50 }),
    prisma.bonusAward.findMany({ where: { tenantId: actor.tenantId, playerId: actor.playerId }, orderBy: { awardedAt: 'desc' }, take: 50 }),
  ])
  const redemptionByPromotion = new Map(redemptions.map(item => [item.promotionId, item]))
  const eligibilityByPromotion = new Map<string, Eligibility>()
  for (const promotion of promotions) {
    if (redemptionByPromotion.has(promotion.id)) continue
    const rule = await prisma.promotionRuleVersion.findFirst({ where: { tenantId: actor.tenantId, promotionId: promotion.id, status: 'ACTIVE', effectiveFrom: { lte: now }, OR: [{ effectiveTo: null }, { effectiveTo: { gt: now } }] }, orderBy: { version: 'desc' } })
    eligibilityByPromotion.set(promotion.id, await evaluatePromotionEligibility(prisma, actor, promotion, rule, now))
  }
  const awardById = new Map(awards.map(item => [item.id, item]))
  return {
    promotions: promotions.map(promotion => {
      const redemption = redemptionByPromotion.get(promotion.id)
      const award = redemption?.bonusAwardId ? awardById.get(redemption.bonusAwardId) : undefined
      return { id: promotion.id, key: promotion.key, name: promotion.name, description: promotion.description, type: promotion.type, startsAt: promotion.startsAt.toISOString(), endsAt: promotion.endsAt.toISOString(), currency: promotion.currency, termsVersion: promotion.termsVersion, termsHash: promotion.termsHash, status: promotion.status, eligibility: redemption ? 'CLAIMED' : eligibilityByPromotion.get(promotion.id)?.eligible ? 'ELIGIBLE' : 'INELIGIBLE', ineligibleReason: (() => { const result = eligibilityByPromotion.get(promotion.id); return result && !result.eligible ? result.reason : null })(), redemptionId: redemption?.id ?? null, award: award ? { id: award.id, type: award.awardType, amountMinor: award.amountMinor, remainingMinor: award.remainingMinor, stakeReturned: award.stakeReturned, status: award.status, expiresAt: award.expiresAt.toISOString() } : null }
    }),
    awards: awards.map(award => ({ id: award.id, promotionId: award.promotionId, type: award.awardType, amountMinor: award.amountMinor, remainingMinor: award.remainingMinor, currency: award.currency, stakeReturned: award.stakeReturned, status: award.status, expiresAt: award.expiresAt.toISOString(), evidenceHash: award.evidenceHash })),
  }
}

export async function claimCustomerPromotion(prisma: PrismaClient, actor: CustomerActor, input: { promotionId: unknown; idempotencyKey: unknown }) {
  assertSandboxEnabled()
  const promotionId = String(input.promotionId ?? '')
  const idempotencyKey = validateIdempotencyKey(input.idempotencyKey)
  const requestedPromotion = await prisma.promotion.findFirst({ where: { id: promotionId, tenantId: actor.tenantId, status: 'ACTIVE' }, select: { type: true } })
  if (requestedPromotion?.type === 'ODDS_BOOST') throw new CustomerError('PROMOTION_SETTLEMENT_UNSUPPORTED', 422)
  await assertCurrentCustomerActor(prisma, actor)
  const claimed = await claimCustomerCommand(prisma, { tenantId: actor.tenantId, playerId: actor.playerId, type: 'PROMOTION', idempotencyKey, request: { promotionId } })
  const stored = commandResult(claimed.command)
  if (stored && claimed.command.status !== 'IN_PROGRESS') return stored
  const result = await serializable(prisma, async tx => {
    const now = new Date()
    await assertCurrentCustomerActor(tx, actor, true, now)
    const [promotion, rule] = await Promise.all([
      tx.promotion.findFirst({ where: { id: promotionId, tenantId: actor.tenantId, status: 'ACTIVE', startsAt: { lte: now }, endsAt: { gt: now } } }),
      tx.promotionRuleVersion.findFirst({ where: { tenantId: actor.tenantId, promotionId, status: 'ACTIVE', effectiveFrom: { lte: now }, OR: [{ effectiveTo: null }, { effectiveTo: { gt: now } }] }, orderBy: { version: 'desc' } }),
    ])
    if (!promotion || !rule) throw new CustomerError('PROMOTION_UNAVAILABLE', 404)
    const currency = promotion.currency
    const eligibility = await evaluatePromotionEligibility(tx, actor, promotion, rule, now)
    if (!eligibility.eligible) throw new CustomerError(eligibility.reason === 'ALREADY_CLAIMED' ? 'PROMOTION_ALREADY_CLAIMED' : 'PROMOTION_INELIGIBLE', eligibility.reason === 'ALREADY_CLAIMED' ? 409 : 422, { reason: eligibility.reason })
    const budget = await tx.campaignBudget.findFirst({ where: { tenantId: actor.tenantId, promotionId, status: 'ACTIVE' }, orderBy: { version: 'desc' } })
    if (!budget) throw new CustomerError('PROMOTION_BUDGET_UNAVAILABLE', 409)
    await tx.$queryRaw`SELECT id FROM "CampaignBudget" WHERE id = ${budget.id} FOR UPDATE`
    const economics = (rule.economics ?? {}) as Record<string, unknown>
    const amountMinor = String(economics.amountMinor ?? '0')
    const amount = /^\d+$/.test(amountMinor) ? BigInt(amountMinor) : 0n
    if (BigInt(budget.awardedMinor) + amount > BigInt(budget.allocatedMinor)) throw new CustomerError('PROMOTION_BUDGET_EXHAUSTED', 409)
    let award: any = null
    if (promotion.type !== 'ODDS_BOOST') {
      if (amount <= 0n) throw new CustomerError('PROMOTION_RULE_INVALID', 409)
      const [bonusAccount, bonusExpense] = await Promise.all([
        tx.ledgerAccount.findFirst({ where: { tenantId: actor.tenantId, playerId: actor.playerId, key: 'PLAYER_BONUS', currency: currency } }),
        tx.ledgerAccount.findFirst({ where: { tenantId: actor.tenantId, playerId: null, key: 'BONUS_EXPENSE', currency: currency } }),
      ])
      if (!bonusAccount || !bonusExpense) throw new CustomerError('PROMOTION_LEDGER_UNAVAILABLE', 409)
      const projection = await tx.balanceProjection.findFirst({ where: { tenantId: actor.tenantId, accountId: bonusAccount.id }, orderBy: { version: 'desc' } })
      if (!projection) throw new CustomerError('PROMOTION_LEDGER_UNAVAILABLE', 409)
      const awardEvidence = evidenceHash({ promotionId, ruleVersionId: rule.id, playerId: actor.playerId, amountMinor, stakeReturned: Boolean(economics.stakeReturned), commandId: claimed.command.id })
      award = await tx.bonusAward.create({ data: { tenantId: actor.tenantId, promotionId, ruleVersionId: rule.id, playerId: actor.playerId, amountMinor, remainingMinor: amountMinor, currency: currency, awardType: promotion.type === 'FREE_BET' ? 'FREE_BET' : 'BONUS_CASH', stakeReturned: Boolean(economics.stakeReturned), status: 'ACTIVE', awardedAt: now, activatedAt: now, expiresAt: promotion.endsAt, idempotencyKey: `promotion:${claimed.command.id}`, evidenceHash: awardEvidence } })
      const journal = await tx.journalTransaction.create({ data: { tenantId: actor.tenantId, type: 'BONUS_AWARD', idempotencyKey: `bonus-award:${claimed.command.id}`, correlationId: award.id, status: 'POSTED', effectiveAt: now } })
      await tx.journalEntry.createMany({ data: [
        { tenantId: actor.tenantId, transactionId: journal.id, accountId: bonusExpense.id, side: 'DEBIT', amountMinor, currency: currency },
        { tenantId: actor.tenantId, transactionId: journal.id, accountId: bonusAccount.id, side: 'CREDIT', amountMinor, currency: currency },
      ] })
      const next = BigInt(projection.postedMinor) + amount
      await tx.balanceProjection.create({ data: { tenantId: actor.tenantId, accountId: bonusAccount.id, postedMinor: String(next), pendingMinor: projection.pendingMinor, availableMinor: String(BigInt(projection.availableMinor) + (next - BigInt(projection.postedMinor))), version: Number(projection.version) + 1, asOf: now } })
      await tx.bonusTransaction.create({ data: { tenantId: actor.tenantId, awardId: award.id, type: 'AWARD', amountMinor, remainingMinor: amountMinor, currency: currency, journalTransactionId: journal.id, idempotencyKey: `bonus-transaction:${claimed.command.id}`, evidenceHash: awardEvidence } })
    }
    const redemptionEvidence = evidenceHash({ promotionId, ruleVersionId: rule.id, playerId: actor.playerId, awardId: award?.id ?? null, qualifyingDepositId: eligibility.qualifyingDepositId, commandId: claimed.command.id })
    const redemption = await tx.promotionRedemption.create({ data: { tenantId: actor.tenantId, promotionId, ruleVersionId: rule.id, playerId: actor.playerId, bonusAwardId: award?.id, status: 'CLAIMED', reasonCode: eligibility.qualifyingDepositId ? `DEPOSIT:${eligibility.qualifyingDepositId}` : '', idempotencyKey: `promotion:${claimed.command.id}`, evidenceHash: redemptionEvidence, redeemedAt: now } })
    await tx.campaignBudget.create({ data: { tenantId: actor.tenantId, promotionId, allocatedMinor: budget.allocatedMinor, awardedMinor: String(BigInt(budget.awardedMinor) + amount), redeemedMinor: budget.redeemedMinor, forfeitedMinor: budget.forfeitedMinor, currency: budget.currency, version: Number(budget.version) + 1, status: BigInt(budget.awardedMinor) + amount >= BigInt(budget.allocatedMinor) ? 'EXHAUSTED' : 'ACTIVE' } })
    await tx.outboxMessage.create({ data: { tenantId: actor.tenantId, aggregateType: 'PROMOTION_REDEMPTION', aggregateId: redemption.id, eventType: 'promotion.claimed.v1', payload: { promotionId, playerId: actor.playerId, awardId: award?.id ?? null, amountMinor, evidenceHash: redemptionEvidence }, status: 'PENDING', attempts: 0, maxAttempts: 10, availableAt: now } })
    await appendCustomerAudit(tx, { tenantId: actor.tenantId, playerId: actor.playerId, action: 'promotion.claimed', targetType: 'PromotionRedemption', targetId: redemption.id, reason: promotion.type ?? 'PROMOTION', payload: { promotionId, awardId: award?.id ?? null, amountMinor, evidenceHash: redemptionEvidence } })
    const claimedResult = { state: 'CLAIMED', duplicate: claimed.duplicate, redemptionId: redemption.id, promotionId, award: award ? { id: award.id, amountMinor: award.amountMinor, remainingMinor: award.remainingMinor, currency: award.currency, type: award.awardType, stakeReturned: award.stakeReturned, expiresAt: award.expiresAt.toISOString() } : null }
    // Effect and terminal receipt commit together.
    await finishCustomerCommand(tx, claimed.command.id, 'SUCCEEDED', claimedResult)
    return claimedResult
  })
  return result
}
