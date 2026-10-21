import type { Prisma, PrismaClient } from '../../keystone/prisma'
import { evidenceHash } from '../domain/engine'
import { fullCombinationEvidence, materializeCombination, parseExactDecimal, type WagerStructure } from '../domain/combination'
import { loadQuoteCandidate } from './catalog'
import { assertCurrentCustomerActor, type CustomerActor } from './auth'
import { appendCustomerAudit } from './audit'
import { CustomerError, assertSandboxEnabled } from './errors'
import { claimCustomerCommand, commandResult, finishCustomerCommand, validateIdempotencyKey } from './idempotency'
import { wagerLimitViolation } from './limit-enforcement'
import { currentGeoApproved, currentKycApproved, currentWagerProvenance, riskLimitViolation, splitAcrossMarkets } from './acceptance-gates'
import { isRetryableTransactionError, transactionBackoff } from '../domain/transaction'
import { resolveCustomerPolicy } from './policy'
import { activeHouseRule, approvedHouseRuleEvidence } from '../domain/house-rules'

const MAX_LEGS = 12
const MAX_PAYOUT_MINOR = 1_000_000n
const MAX_PRICE_AGE_MS = () => Number(process.env.MAX_PRICE_AGE_MS ?? 30_000)

export function orderQuoteLegTerms<T extends { legIndex: string }>(legs: T[]): T[] {
  const ordered = [...legs].sort((left, right) => Number(left.legIndex) - Number(right.legIndex))
  for (let index = 0; index < ordered.length; index++) {
    const value = ordered[index].legIndex
    if (!/^(0|[1-9]\d*)$/.test(value) || !Number.isSafeInteger(Number(value)) || Number(value) !== index) {
      throw new CustomerError('QUOTE_CORRUPT', 409)
    }
  }
  return ordered
}
const structures = new Set<WagerStructure>(['STRAIGHT', 'PARLAY', 'SYSTEM', 'ROUND_ROBIN', 'TEASER', 'EACH_WAY'])
const settlementSupportedStructures = new Set<WagerStructure>(['STRAIGHT', 'PARLAY', 'SYSTEM', 'ROUND_ROBIN'])

function withinWorsePriceTolerance(quoted: string, current: string, toleranceBps: number): boolean {
  const oldPrice = parseExactDecimal(quoted)
  const newPrice = parseExactDecimal(current)
  const difference = oldPrice.numerator * newPrice.denominator - newPrice.numerator * oldPrice.denominator
  if (difference <= 0n) return true
  return difference * 10_000n <= oldPrice.numerator * newPrice.denominator * BigInt(Math.max(0, toleranceBps))
}

type PersistedPart = { index: number; key: string; legIndexes: number[]; stakeMinor: string; decimalOdds: string; potentialReturnMinor: string }
type QuoteLeg = { legIndex: string; eventId: string; marketId: string; selectionId: string; priceSnapshotId: string; eventName: string; marketName: string; selectionName: string; decimalOdds: string; line: string; live: string; correlationGroupKey: string; ruleVersion: string; evidenceHash: string }

export type CombinationQuoteResponse = {
  state: 'QUOTED'
  quoteId: string
  structure: WagerStructure
  legs: Array<{ eventId: string; marketId: string; selectionId: string; priceSnapshotId: string; eventName: string; marketName: string; selectionName: string; decimalOdds: string; line?: string; live: boolean }>
  parts: PersistedPart[]
  stakeMinor: string
  potentialReturnMinor: string
  currency: string
  termsHash: string
  expiresAt: string
  priceChangeConsent: string
  liveDelayMs: number
  bonusEconomics?: Record<string, unknown> | null
}

export type CombinationPlacementResponse = {
  state: 'ACCEPTED' | 'PARTIALLY_ACCEPTED' | 'REJECTED' | 'REQUOTE_REQUIRED' | 'IN_PROGRESS'
  accepted: boolean
  duplicate: boolean
  wagerId?: string
  receiptId?: string
  rejectionCode?: string
  acceptedStakeMinor?: string
  potentialReturnMinor?: string
  termsHash?: string
  acceptedPartIndexes?: number[]
  rejectedPartIndexes?: number[]
  acceptedParts?: Array<{ index: number; key: string; stakeMinor: string; decimalOdds: string; potentialReturnMinor: string }>
  acceptedPrices?: Array<{ legIndex: number; selectionId: string; priceSnapshotId: string; decimalOdds: string; line: string }>
}

function positiveStake(value: unknown) {
  const text = String(value ?? '')
  if (!/^\d{2,9}$/.test(text)) throw new CustomerError('INVALID_STAKE', 400)
  const stake = BigInt(text)
  if (stake < 100n || stake > 1_000_000_000n) throw new CustomerError('INVALID_STAKE', 400)
  return stake
}
function parseSelectionIds(value: unknown) {
  if (!Array.isArray(value) || value.length < 1 || value.length > MAX_LEGS) throw new CustomerError('INVALID_LEGS', 400)
  const ids = value.map(item => String(item ?? ''))
  if (ids.some(id => !/^[A-Za-z0-9_-]{8,128}$/.test(id)) || new Set(ids).size !== ids.length) throw new CustomerError('INVALID_LEGS', 400)
  return ids
}
function parseStructure(value: unknown): WagerStructure {
  const structure = String(value ?? '').toUpperCase() as WagerStructure
  if (!structures.has(structure)) throw new CustomerError('INVALID_STRUCTURE', 400)
  return structure
}
function parsePriceConsent(value: unknown): 'EXACT' | 'ACCEPT_BETTER' | 'ACCEPT_WITHIN_TOLERANCE' {
  const consent = String(value ?? 'EXACT').toUpperCase()
  if (!['EXACT', 'ACCEPT_BETTER', 'ACCEPT_WITHIN_TOLERANCE'].includes(consent)) throw new CustomerError('INVALID_PRICE_CONSENT', 400)
  return consent as 'EXACT' | 'ACCEPT_BETTER' | 'ACCEPT_WITHIN_TOLERANCE'
}
function asPartPlan(value: unknown): PersistedPart[] {
  if (!Array.isArray(value)) throw new CustomerError('QUOTE_CORRUPT', 409)
  return value.map(item => {
    if (!item || typeof item !== 'object') throw new CustomerError('QUOTE_CORRUPT', 409)
    const row = item as Record<string, unknown>
    if (!Array.isArray(row.legIndexes)) throw new CustomerError('QUOTE_CORRUPT', 409)
    return { index: Number(row.index), key: String(row.key), legIndexes: row.legIndexes.map(Number), stakeMinor: String(row.stakeMinor), decimalOdds: String(row.decimalOdds), potentialReturnMinor: String(row.potentialReturnMinor) }
  })
}

async function allowedCorrelationPairs(prisma: PrismaClient, tenantId: string) {
  const rules = await prisma.correlationRule.findMany({ where: { tenantId, decision: 'ALLOW', group: { status: 'ACTIVE' } }, take: 100 })
  const pairs = new Set<string>()
  for (const rule of rules) {
    const left = rule.leftPattern as Record<string, unknown> | null
    const right = rule.rightPattern as Record<string, unknown> | null
    if (left?.marketId && right?.marketId) pairs.add([String(left.marketId), String(right.marketId)].sort().join(':'))
  }
  return pairs
}

export async function createCombinationQuote(prisma: PrismaClient, actor: CustomerActor, input: {
  selectionIds: unknown
  structure: unknown
  stakeMinor: unknown
  systemSize?: unknown
  teaserPoints?: unknown
  priceChangeConsent?: unknown
  promotionId?: unknown
}): Promise<CombinationQuoteResponse> {
  assertSandboxEnabled()
  await assertCurrentCustomerActor(prisma, actor)
  const selectionIds = parseSelectionIds(input.selectionIds)
  const structure = parseStructure(input.structure)
  if (!settlementSupportedStructures.has(structure)) throw new CustomerError('UNSUPPORTED_SETTLEMENT_STRUCTURE', 422)
  const stakeMinor = positiveStake(input.stakeMinor)
  const currency = actor.currency ?? 'USD'
  const policy = await resolveCustomerPolicy(prisma, actor.tenantId)
  if (stakeMinor > policy.maxStakeMinor) throw new CustomerError('MAX_STAKE_EXCEEDED', 422)
  const priceChangeConsent = parsePriceConsent(input.priceChangeConsent)
  const candidates: Awaited<ReturnType<typeof loadQuoteCandidate>>[] = []
  for (let index = 0; index < selectionIds.length; index++) candidates.push(await loadQuoteCandidate(prisma, actor.tenantId, selectionIds[index]))
  const allowedPairs = await allowedCorrelationPairs(prisma, actor.tenantId)
  for (let left = 0; left < candidates.length; left++) for (let right = left + 1; right < candidates.length; right++) {
    if (candidates[left].event.id === candidates[right].event.id) {
      const pair = [candidates[left].market.id, candidates[right].market.id].sort().join(':')
      if (!allowedPairs.has(pair)) throw new CustomerError('CORRELATED_SELECTIONS_DENIED', 422)
    }
  }
  const teaserPoints = String(input.teaserPoints ?? '')
  const teaserRule = structure === 'TEASER'
    ? await prisma.houseRuleVersion.findFirst({ where: { tenantId: actor.tenantId, status: 'ACTIVE', name: `teaser:${teaserPoints}` }, orderBy: { version: 'desc' } })
    : null
  const teaserDocument = teaserRule?.rules as Record<string, unknown> | null
  if (structure === 'TEASER' && (!teaserRule || typeof teaserDocument?.decimalOdds !== 'string')) throw new CustomerError('TEASER_RULE_UNAVAILABLE', 422)
  const parts = materializeCombination({
    structure,
    legs: candidates.map(candidate => ({ id: candidate.selection.id, decimalOdds: candidate.snapshot.decimalOdds, line: candidate.snapshot.line || undefined, live: candidate.event.status === 'LIVE' })),
    stakeMinor,
    systemSize: input.systemSize === undefined ? undefined : Number(input.systemSize),
    teaserPoints,
    teaserPrice: typeof teaserDocument?.decimalOdds === 'string' ? teaserDocument.decimalOdds : undefined,
    eachWayPlaceFraction: { numerator: 1n, denominator: 4n },
  })
  const now = new Date()
  const houseRules = await Promise.all(candidates.map(candidate => activeHouseRule(prisma, actor.tenantId, candidate.market, now)))
  if (houseRules.some(rule => { const supported = (rule?.rules as { structures?: unknown } | null)?.structures; return !rule || !Array.isArray(supported) || !supported.includes(structure) })) throw new CustomerError('APPROVED_HOUSE_RULE_REQUIRED', 422)
  for (const rule of houseRules) if (!rule || !await approvedHouseRuleEvidence(prisma, actor.tenantId, rule)) throw new CustomerError('APPROVED_HOUSE_RULE_REQUIRED', 422)
  const ruleEvidence = houseRules.map((rule, legIndex) => ({ legIndex, ruleId: rule!.id, ruleVersion: `${rule!.name}@${rule!.version}`, ruleHash: rule!.semanticHash }))
  const live = candidates.some(candidate => candidate.event.status === 'LIVE' || candidate.market.tradingMode === 'LIVE')
  const liveDelayMs = live ? policy.liveDelayMs : 0
  const expiresAt = new Date(now.getTime() + (live ? 8_000 : 25_000))
  let promotion: Awaited<ReturnType<typeof prisma.promotion.findFirst>> = null
  let bonusEconomics: Record<string, unknown> | null = null
  if (input.promotionId) {
    promotion = await prisma.promotion.findFirst({ where: { id: String(input.promotionId), tenantId: actor.tenantId, status: 'ACTIVE', startsAt: { lte: now }, endsAt: { gt: now } } })
    if (!promotion) throw new CustomerError('PROMOTION_UNAVAILABLE', 422)
    const [redemption,rule]=await Promise.all([prisma.promotionRedemption.findFirst({where:{tenantId:actor.tenantId,playerId:actor.playerId,promotionId:promotion.id,status:'CLAIMED'}}),prisma.promotionRuleVersion.findFirst({where:{tenantId:actor.tenantId,promotionId:promotion.id,status:'ACTIVE'},orderBy:{version:'desc'}})])
    if(!redemption||!rule)throw new CustomerError('PROMOTION_NOT_CLAIMED',422)
    const requirements=(rule.wageringRequirements??{}) as Record<string,unknown>,validStructures=Array.isArray(requirements.validStructures)?requirements.validStructures.map(String):[]
    if(validStructures.length&&!validStructures.includes(structure))throw new CustomerError('PROMOTION_STRUCTURE_INELIGIBLE',422)
    if(promotion.type==='ODDS_BOOST')throw new CustomerError('PROMOTION_SETTLEMENT_UNSUPPORTED',422)
    bonusEconomics={promotionId:promotion.id,type:promotion.type,termsVersion:promotion.termsVersion,termsHash:promotion.termsHash,ruleVersionId:rule.id,requirements}
  }
  const potentialReturnMinor = parts.reduce((total, part) => total + part.potentialReturnMinor, 0n)
  if (potentialReturnMinor > policy.maxPayoutMinor) throw new CustomerError('MAX_PAYOUT_EXCEEDED', 422)
  const persistedParts: PersistedPart[] = parts.map(part => ({ ...part, stakeMinor: String(part.stakeMinor), potentialReturnMinor: String(part.potentialReturnMinor) }))
  const rulesHash = fullCombinationEvidence(parts, candidates.map(candidate => ({ id: candidate.selection.id, decimalOdds: candidate.snapshot.decimalOdds, line: candidate.snapshot.line || undefined, live: candidate.event.status === 'LIVE' })))
  const termsHash = evidenceHash({ tenantId: actor.tenantId, playerId: actor.playerId, structure, selectionIds, snapshots: candidates.map(candidate => candidate.snapshot.id), persistedParts, stakeMinor, potentialReturnMinor, priceChangeConsent, liveDelayMs, expiresAt, rulesHash, ruleEvidence, bonusEconomics })

  return serializable(prisma, async tx => {
    await assertCurrentCustomerActor(tx, actor, true)
    for (const candidate of candidates) {
      const index = candidates.indexOf(candidate)
      await tx.$queryRaw`SELECT id FROM "HouseRuleVersion" WHERE id = ${ruleEvidence[index].ruleId} AND tenant = ${actor.tenantId} FOR SHARE`
      const rule = await activeHouseRule(tx, actor.tenantId, candidate.market, new Date())
      if (!rule || rule.id !== ruleEvidence[index].ruleId || rule.semanticHash !== ruleEvidence[index].ruleHash || !await approvedHouseRuleEvidence(tx, actor.tenantId, rule)) throw new CustomerError('HOUSE_RULE_CHANGED', 409)
      const current = await tx.priceSnapshot.findFirst({ where: { id: candidate.snapshot.id, tenantId: actor.tenantId, selectionId: candidate.selection.id, status: 'OPEN' } })
      if (!current) throw new CustomerError('PRICE_UNAVAILABLE', 409)
    }
    const first = candidates[0]
    const quote = await tx.quote.create({ data: {
      tenantId: actor.tenantId, playerId: actor.playerId, selectionId: first.selection.id, priceSnapshotId: first.snapshot.id,
      structure, promotionId: promotion?.id, legCount: candidates.length, partCount: parts.length,
      stakeMinor: String(stakeMinor), potentialReturnMinor: String(potentialReturnMinor), currency: currency,
      decimalOdds: parts[0].decimalOdds, priceChangeConsent, liveDelayMs,
      expiresAt, termsHash, policyVersion: 'sandbox-full-v1',
    } })
    await tx.customerQuoteTerms.create({ data: {
      tenantId: actor.tenantId, playerId: actor.playerId, quoteId: quote.id, quoteKey: quote.id,
      structure, legCount: String(candidates.length), partCount: String(parts.length), partPlan: persistedParts,
      priceChangeConsent, liveDelayMs: String(liveDelayMs), bonusEconomics: bonusEconomics ? bonusEconomics as Prisma.InputJsonValue : undefined,
      eventId: first.event.id, marketId: first.market.id, selectionId: first.selection.id, priceSnapshotId: first.snapshot.id,
      eventName: first.event.name, marketName: first.marketName, selectionName: first.selection.label,
      decimalOdds: quote.decimalOdds, stakeMinor: String(stakeMinor), potentialReturnMinor: String(potentialReturnMinor),
      currency: currency, termsHash, expiresAt,
    } })
    await tx.customerQuoteLegTerms.createMany({ data: candidates.map((candidate, index) => ({
      tenantId: actor.tenantId, playerId: actor.playerId, quoteId: quote.id, quoteKey: quote.id, legIndex: String(index),
      eventId: candidate.event.id, marketId: candidate.market.id, selectionId: candidate.selection.id, priceSnapshotId: candidate.snapshot.id,
      eventName: candidate.event.name, marketName: candidate.marketName, selectionName: candidate.selection.label,
      decimalOdds: candidate.snapshot.decimalOdds, line: candidate.snapshot.line || '', live: candidate.event.status === 'LIVE' ? 'LIVE' : 'PREMATCH',
      correlationGroupKey: '', ruleVersion: ruleEvidence[index].ruleVersion, evidenceHash: evidenceHash({ quoteId: quote.id, index, selectionId: candidate.selection.id, snapshotId: candidate.snapshot.id, decimalOdds: candidate.snapshot.decimalOdds, line: candidate.snapshot.line || '', ruleVersion: ruleEvidence[index].ruleVersion, ruleHash: ruleEvidence[index].ruleHash, currency, currencyExponent: (houseRules[index]!.rules as { currencyExponent?: number } | null)?.currencyExponent ?? null }),
    })) })
    await appendCustomerAudit(tx, { tenantId: actor.tenantId, playerId: actor.playerId, action: 'customer.combination_quoted', targetType: 'Quote', targetId: quote.id, reason: structure, payload: { termsHash, structure, legCount: candidates.length, partCount: parts.length, stakeMinor: String(stakeMinor), potentialReturnMinor: String(potentialReturnMinor), liveDelayMs } })
    return { state: 'QUOTED', quoteId: quote.id, structure, legs: candidates.map(candidate => ({ eventId: candidate.event.id, marketId: candidate.market.id, selectionId: candidate.selection.id, priceSnapshotId: candidate.snapshot.id, eventName: candidate.event.name, marketName: candidate.marketName, selectionName: candidate.selection.label, decimalOdds: candidate.snapshot.decimalOdds, ...(candidate.snapshot.line ? { line: candidate.snapshot.line } : {}), live: candidate.event.status === 'LIVE' })), parts: persistedParts, stakeMinor: String(stakeMinor), potentialReturnMinor: String(potentialReturnMinor), currency: currency, termsHash, expiresAt: expiresAt.toISOString(), priceChangeConsent, liveDelayMs, bonusEconomics }
  })
}

async function serializable<T>(prisma: PrismaClient, work: (tx: any) => Promise<T>) {
  for (let attempt = 0; ; attempt++) {
    try { return await prisma.$transaction(work, { isolationLevel: 'Serializable' }) }
    catch (error) { if (attempt >= 6 || !isRetryableTransactionError(error)) throw error; await transactionBackoff(attempt) }
  }
}

export async function placeCombinationWager(prisma: PrismaClient, actor: CustomerActor, input: { quoteId: unknown; idempotencyKey: unknown; allowPartial?: unknown; bonusAwardId?: unknown }): Promise<CombinationPlacementResponse> {
  assertSandboxEnabled()
  await assertCurrentCustomerActor(prisma, actor)
  const quoteId = String(input.quoteId ?? '')
  const idempotencyKey = validateIdempotencyKey(input.idempotencyKey)
  const allowPartial = input.allowPartial === true
  const bonusAwardId = input.bonusAwardId ? String(input.bonusAwardId) : null
  const terms = await prisma.customerQuoteTerms.findFirst({ where: { quoteKey: quoteId, tenantId: actor.tenantId, playerId: actor.playerId } })
  if (!terms) throw new CustomerError('QUOTE_NOT_FOUND', 404)
  const currency = terms.currency
  const legs = orderQuoteLegTerms(await prisma.customerQuoteLegTerms.findMany({ where: { quoteKey: quoteId, tenantId: actor.tenantId, playerId: actor.playerId } }))
  const parts = asPartPlan(terms.partPlan)
  if (!legs.length || !parts.length) throw new CustomerError('QUOTE_CORRUPT', 409)
  const claimed = await claimCustomerCommand(prisma, { tenantId: actor.tenantId, playerId: actor.playerId, type: 'WAGER', idempotencyKey, request: { quoteId, allowPartial, bonusAwardId } })
  if (claimed.command.status === 'IN_PROGRESS' && Number(terms.liveDelayMs) > 0) await new Promise(resolve => setTimeout(resolve, Number(terms.liveDelayMs)))

  return serializable(prisma, async tx => {
    await assertCurrentCustomerActor(tx, actor, true)
    // Every retry rechecks the durable outcome under the same scoped command lock.
    // Serializable conflicts must restart this read, not blindly repeat reservation writes.
    const locked = await tx.$queryRaw`SELECT id FROM "CustomerCommand" WHERE id = ${claimed.command.id} AND tenant = ${actor.tenantId} AND player = ${actor.playerId} FOR UPDATE`
    if (!locked.length) throw new CustomerError('COMMAND_NOT_FOUND', 404)
    const command = await tx.customerCommand.findFirst({ where: { id: claimed.command.id, tenantId: actor.tenantId, playerId: actor.playerId, type: 'WAGER' } })
    if (!command || command.requestHash !== claimed.command.requestHash) throw new CustomerError('IDEMPOTENCY_KEY_CONFLICT', 409)
    const committed = commandResult(command)
    if (committed && command.status !== 'IN_PROGRESS') {
      const result = committed as CombinationPlacementResponse
      if (!result.wagerId || result.receiptId !== result.wagerId || typeof result.accepted !== 'boolean') throw new CustomerError('COMMAND_RECOVERY_EVIDENCE_MISSING', 409)
      const owned = await tx.wager.findFirst({ where: { id: result.wagerId, tenantId: actor.tenantId, playerId: actor.playerId } })
      const decision = owned ? await tx.acceptanceDecision.findFirst({ where: { tenantId: actor.tenantId, wagerId: owned.id } }) : null
      const rejected = (decision?.gateResults as { rejectedParts?: number[] } | null)?.rejectedParts ?? []
      const validState = decision?.accepted ? result.state === (rejected.length ? 'PARTIALLY_ACCEPTED' : 'ACCEPTED') : ['REJECTED', 'REQUOTE_REQUIRED'].includes(result.state)
      if (!owned || !decision || result.accepted !== decision.accepted || result.termsHash !== owned.termsHash || decision.inputHash !== owned.termsHash || !validState || command.status !== (result.accepted ? 'SUCCEEDED' : 'REJECTED') || (result.accepted && (result.acceptedStakeMinor !== owned.stakeMinor || result.potentialReturnMinor !== owned.potentialReturnMinor))) throw new CustomerError('COMMAND_RECOVERY_EVIDENCE_MISSING', 409)
      return result
    }

    // Recover pre-R02 reservations whose command completion was a separate write.
    const prior = await tx.wager.findFirst({ where: { tenantId: actor.tenantId, playerId: actor.playerId, idempotencyKey: `combination:${command.id}` }, include: { from_WagerLeg_wager: true, from_WagerPart_wager: true } })
    if (prior) {
      const decision = await tx.acceptanceDecision.findFirst({ where: { tenantId: actor.tenantId, wagerId: prior.id } })
      if (!decision) throw new CustomerError('COMMAND_RECOVERY_EVIDENCE_MISSING', 409)
      const gates = decision.gateResults as { acceptedParts?: number[]; rejectedParts?: number[] } | null
      const rejectedPartIndexes = gates?.rejectedParts ?? (decision.accepted ? [] : parts.map(part => part.index))
      const recovered: CombinationPlacementResponse = {
        state: decision.accepted ? (rejectedPartIndexes.length ? 'PARTIALLY_ACCEPTED' : 'ACCEPTED') : 'REJECTED',
        accepted: decision.accepted, duplicate: true, wagerId: prior.id, receiptId: prior.id,
        rejectionCode: decision.rejectionCode || undefined,
        ...(decision.accepted ? { acceptedStakeMinor: prior.stakeMinor } : {}),
        potentialReturnMinor: prior.potentialReturnMinor, termsHash: prior.termsHash,
        acceptedPartIndexes: gates?.acceptedParts ?? prior.from_WagerPart_wager.map((part: any) => part.partIndex),
        rejectedPartIndexes,
        acceptedParts: prior.from_WagerPart_wager.map((part: any) => ({ index: part.partIndex, key: part.combinationKey, stakeMinor: part.stakeMinor, decimalOdds: part.decimalOdds, potentialReturnMinor: part.potentialReturnMinor })),
        acceptedPrices: [...new Map<number, any>(prior.from_WagerLeg_wager.map((leg: any) => [leg.legIndex, leg])).values()].sort((a, b) => a.legIndex - b.legIndex).map(leg => ({ legIndex: leg.legIndex, selectionId: leg.selectionKey, priceSnapshotId: leg.snapshotId, decimalOdds: leg.decimalOdds, line: leg.line })),
      }
      await finishCustomerCommand(tx, command.id, recovered.accepted ? 'SUCCEEDED' : 'REJECTED', recovered)
      return recovered
    }
    const now = new Date()
    const currentPolicy=await resolveCustomerPolicy(tx,actor.tenantId)
    const quote = await tx.quote.findFirst({ where: { id: quoteId, tenantId: actor.tenantId, playerId: actor.playerId } })
    if (!quote || quote.expiresAt <= now) return rejectCombination(tx, actor, claimed.command.id, quoteId, terms, 'QUOTE_EXPIRED')
    const invalidLegIndexes: number[] = []
    const acceptedLegPrices = new Map<number, { snapshotId: string; decimalOdds: string; line: string }>()
    for (const leg of legs as unknown as QuoteLeg[]) {
      const index = Number(leg.legIndex)
      const [selection, latest] = await Promise.all([
        tx.selection.findFirst({ where: { id: leg.selectionId, tenantId: actor.tenantId }, include: { market: { include: { event: true } } } }),
        tx.priceSnapshot.findFirst({ where: { tenantId: actor.tenantId, selectionId: leg.selectionId }, orderBy: { receivedAt: 'desc' } }),
      ])
      if (selection?.market) {
        const rule = await activeHouseRule(tx, actor.tenantId, selection.market, now)
        if (!rule || `${rule.name}@${rule.version}` !== leg.ruleVersion || !await approvedHouseRuleEvidence(tx, actor.tenantId, rule) || leg.evidenceHash !== evidenceHash({ quoteId, index, selectionId: leg.selectionId, snapshotId: leg.priceSnapshotId, decimalOdds: leg.decimalOdds, line: leg.line, ruleVersion: leg.ruleVersion, ruleHash: rule.semanticHash, currency, currencyExponent: (rule.rules as { currencyExponent?: number } | null)?.currencyExponent ?? null })) return rejectCombination(tx, actor, claimed.command.id, quoteId, terms, 'HOUSE_RULE_CHANGED')
        await tx.$queryRaw`SELECT id FROM "HouseRuleVersion" WHERE id = ${rule.id} AND tenant = ${actor.tenantId} FOR SHARE`
      }
      const currentLine = latest ? String(latest.line ?? '') : ''
      const lineChanged = currentLine !== leg.line
      const priceChanged = Boolean(latest && latest.decimalOdds !== leg.decimalOdds)
      const changed = lineChanged || priceChanged
      const sameContract = !lineChanged
      const better = latest ? parseExactDecimal(latest.decimalOdds).numerator * parseExactDecimal(leg.decimalOdds).denominator >= parseExactDecimal(leg.decimalOdds).numerator * parseExactDecimal(latest.decimalOdds).denominator : false
      const exactDenied = changed && terms.priceChangeConsent === 'EXACT'
      const betterDenied = changed && terms.priceChangeConsent === 'ACCEPT_BETTER' && (!sameContract || !better)
      const toleranceDenied = changed && terms.priceChangeConsent === 'ACCEPT_WITHIN_TOLERANCE' && (!sameContract || !latest || !withinWorsePriceTolerance(leg.decimalOdds, latest.decimalOdds, currentPolicy.priceToleranceBps))
      const invalid = !selection?.market?.event || selection.status !== 'OPEN' || selection.market.status !== 'OPEN' || !['SCHEDULED', 'LIVE'].includes(selection.market.event.status ?? '') || !latest || latest.status !== 'OPEN' || now.getTime() - latest.receivedAt.getTime() > MAX_PRICE_AGE_MS() || exactDenied || betterDenied || toleranceDenied
      if (invalid) invalidLegIndexes.push(index)
      else acceptedLegPrices.set(index, { snapshotId: changed ? latest!.id : leg.priceSnapshotId, decimalOdds: latest!.decimalOdds, line: currentLine })
    }
    const acceptedParts = parts.filter(part => part.legIndexes.every(index => !invalidLegIndexes.includes(index)))
    const rejectedParts = parts.filter(part => !acceptedParts.includes(part))
    if (!acceptedParts.length || (rejectedParts.length && !allowPartial)) return rejectCombination(tx, actor, claimed.command.id, quoteId, terms, invalidLegIndexes.length ? 'PRICE_OR_MARKET_CHANGED' : 'NO_ACCEPTABLE_PARTS')
    const pricedAcceptedParts = acceptedParts.map(part => {
      const currentLegs = part.legIndexes.map(index => ({ id: String(index), ...(acceptedLegPrices.get(index) ?? (() => { throw new CustomerError('QUOTE_CORRUPT', 409) })()), live: (legs[index] as unknown as QuoteLeg).live === 'LIVE' }))
      const repriced = materializeCombination({ structure: currentLegs.length === 1 ? 'STRAIGHT' : 'PARLAY', legs: currentLegs, stakeMinor: BigInt(part.stakeMinor) })[0]
      return { ...part, decimalOdds: repriced.decimalOdds, potentialReturnMinor: String(repriced.potentialReturnMinor) }
    })
    const acceptedPriceEvidence = [...acceptedLegPrices.entries()].filter(([index]) => acceptedParts.some(part => part.legIndexes.includes(index))).sort(([left], [right]) => left - right).map(([index, price]) => ({ legIndex: index, ...price }))
    const acceptedLegIndexes = new Set(acceptedParts.flatMap(part => part.legIndexes))
    const acceptedStake = acceptedParts.reduce((total, part) => total + BigInt(part.stakeMinor), 0n)
    const potentialReturn = pricedAcceptedParts.reduce((total, part) => total + BigInt(part.potentialReturnMinor), 0n)
    if(acceptedStake>currentPolicy.maxStakeMinor||potentialReturn>currentPolicy.maxPayoutMinor)return rejectCombination(tx,actor,claimed.command.id,quoteId,terms,acceptedStake>currentPolicy.maxStakeMinor?'MAX_STAKE_EXCEEDED':'MAX_PAYOUT_EXCEEDED')
    const [tenant, player, exclusion, restriction, geoApproved, affordability] = await Promise.all([
      tx.tenant.findFirst({ where: { id: actor.tenantId, status: 'ACTIVE' } }),
      tx.player.findFirst({ where: { id: actor.playerId, tenantId: actor.tenantId, status: 'ACTIVE' } }),
      tx.selfExclusion.findFirst({ where: { tenantId: actor.tenantId, playerId: actor.playerId, status: 'ACTIVE', startsAt: { lte: now }, OR: [{ endsAt: null }, { endsAt: { gt: now } }] } }),
      tx.accountRestriction.findFirst({ where: { tenantId: actor.tenantId, playerId: actor.playerId, status: 'ACTIVE', capability: 'WAGER' } }),
      currentGeoApproved(tx, actor.tenantId, actor.playerId, now),
      tx.affordabilityAssessment.findFirst({ where: { tenantId: actor.tenantId, playerId: actor.playerId, decision: { in: ['RESTRICT', 'REVIEW'] }, expiresAt: { gt: now } }, orderBy: { assessedAt: 'desc' } }),
    ])
    const limitViolation = await wagerLimitViolation(tx, actor.tenantId, actor.playerId, acceptedStake, now, actor.sessionId)
    const kycApproved = player ? await currentKycApproved(tx, actor.tenantId, player, now) : false
    let rejectionCode = !tenant ? 'TENANT_INACTIVE' : !player ? 'PLAYER_INACTIVE' : !kycApproved ? 'KYC_REQUIRED' : !geoApproved ? 'GEO_REQUIRED' : exclusion ? 'SELF_EXCLUDED' : restriction ? 'ACCOUNT_RESTRICTED' : affordability ? 'AFFORDABILITY_REVIEW' : limitViolation?.code ?? null
    const bonus = bonusAwardId ? await tx.bonusAward.findFirst({ where: { id: bonusAwardId, tenantId: actor.tenantId, playerId: actor.playerId, status: { in: ['AWARDED', 'ACTIVE'] }, expiresAt: { gt: now } }, include:{ruleVersion:true} }) : null
    if (bonusAwardId && (!bonus || BigInt(bonus.remainingMinor) < acceptedStake)) rejectionCode = 'BONUS_UNAVAILABLE'
    if(bonus?.ruleVersion){const requirements=(bonus.ruleVersion.wageringRequirements??{}) as Record<string,unknown>,valid=Array.isArray(requirements.validStructures)?requirements.validStructures.map(String):[];if(valid.length&&!valid.includes(String(terms.structure)))rejectionCode='BONUS_STRUCTURE_INELIGIBLE'}
    // Every award requirement must be enforced at acceptance; unknown requirement kinds fail closed.
    let bonusTerms: Record<string, unknown> | null = null
    if (bonus) {
      const requirements = (bonus.ruleVersion?.wageringRequirements ?? {}) as Record<string, unknown>
      const supported = new Set(['validStructures', 'minimumOdds', 'wageringMultiple'])
      const minimumOdds = requirements.minimumOdds === undefined ? null : String(requirements.minimumOdds)
      const belowMinimum = minimumOdds !== null && (!/^\d+(\.\d+)?$/.test(minimumOdds) || pricedAcceptedParts.some(part => { const odds = parseExactDecimal(part.decimalOdds), floor = parseExactDecimal(minimumOdds); return odds.numerator * floor.denominator < floor.numerator * odds.denominator }))
      if (!bonus.ruleVersion || Object.keys(requirements).some(key => !supported.has(key))) rejectionCode = 'BONUS_REQUIREMENT_UNSUPPORTED'
      else if (bonus.currency !== currency) rejectionCode = 'BONUS_CURRENCY_MISMATCH'
      else if (belowMinimum) rejectionCode = 'BONUS_MINIMUM_ODDS_NOT_MET'
      bonusTerms = { awardId: bonus.id, awardType: bonus.awardType, amountMinor: bonus.amountMinor, remainingBeforeMinor: bonus.remainingMinor, currency: bonus.currency, stakeReturned: bonus.stakeReturned, awardEvidenceHash: bonus.evidenceHash, ruleVersionId: bonus.ruleVersion?.id ?? null, ruleVersion: bonus.ruleVersion?.version ?? null, ruleEvidenceHash: bonus.ruleVersion?.evidenceHash ?? null, economics: bonus.ruleVersion?.economics ?? null, requirements }
    }
    const acceptedMarkets = [...new Map(legs.filter((_, index) => acceptedLegIndexes.has(index)).map(leg => [leg.marketId, { marketId: leg.marketId, eventId: leg.eventId ?? null }])).values()]
    const riskViolation = rejectionCode ? null : await riskLimitViolation(tx, { tenantId: actor.tenantId, playerId: actor.playerId, currency, stakeMinor: acceptedStake, potentialReturnMinor: potentialReturn, allocations: splitAcrossMarkets(acceptedMarkets, acceptedStake, potentialReturn > acceptedStake ? potentialReturn - acceptedStake : 0n), now })
    if (riskViolation) rejectionCode = riskViolation.code
    const provenance = await currentWagerProvenance(tx, actor.tenantId)
    const sourceKey = bonus ? 'PLAYER_BONUS' : 'PLAYER_CASH'
    const source = await tx.ledgerAccount.findFirst({ where: { tenantId: actor.tenantId, playerId: actor.playerId, key: sourceKey, currency: currency, status: 'ACTIVE' } })
    const pending = await tx.ledgerAccount.findFirst({ where: { tenantId: actor.tenantId, playerId: null, key: 'WAGERS_PENDING', currency: currency, status: 'ACTIVE' } })
    let projection = source ? await tx.balanceProjection.findFirst({ where: { tenantId: actor.tenantId, accountId: source.id }, orderBy: { version: 'desc' } }) : null
    if (projection) { await tx.$queryRaw`SELECT id FROM "BalanceProjection" WHERE id = ${projection.id} FOR UPDATE`; projection = await tx.balanceProjection.findFirst({ where: { tenantId: actor.tenantId, accountId: source!.id }, orderBy: { version: 'desc' } }) }
    if (!rejectionCode && (!source || !pending || !projection || BigInt(projection.availableMinor) < acceptedStake)) rejectionCode = 'INSUFFICIENT_FUNDS'
    if (rejectionCode) return rejectCombination(tx, actor, claimed.command.id, quoteId, terms, rejectionCode)

    const acceptedTermsHash = evidenceHash({ quoteTermsHash: terms.termsHash, acceptedPartIndexes: acceptedParts.map(part => part.index), rejectedPartIndexes: rejectedParts.map(part => part.index), acceptedPriceEvidence, pricedParts: pricedAcceptedParts, allowPartial, bonusAwardId, bonusTerms, provenance })
    const wager = await tx.wager.create({ data: { tenantId: actor.tenantId, playerId: actor.playerId, quoteId, structure: terms.structure, promotionId: quote.promotionId, bonusAwardId: bonus?.id, ...provenance, version: 1, idempotencyKey: `combination:${claimed.command.id}`, stakeMinor: String(acceptedStake), potentialReturnMinor: String(potentialReturn), maxPayoutMinor: String(currentPolicy.maxPayoutMinor), currency: currency, termsHash: acceptedTermsHash, priceChangeConsent: terms.priceChangeConsent, liveDelayMs: Number(terms.liveDelayMs), requestedAt: claimed.command.createdAt, status: 'ACCEPTED', acceptedAt: now } })
    await tx.acceptanceDecision.create({ data: { tenantId: actor.tenantId, wagerId: wager.id, quoteId, accepted: true, rejectionCode: rejectedParts.length ? 'PARTIAL_ACCEPTANCE' : '', gateResults: { tenant: true, player: true, kyc: true, geo: true, rg: true, affordability: true, funds: true, price: true, riskLimits: true, acceptedPriceEvidence, provenance, bonusTerms: bonusTerms as any, acceptedParts: acceptedParts.map(part => part.index), rejectedParts: rejectedParts.map(part => part.index) }, inputHash: acceptedTermsHash } })
    for (const part of pricedAcceptedParts) {
      const wagerPart = await tx.wagerPart.create({ data: { tenantId: actor.tenantId, wagerId: wager.id, partIndex: part.index, combinationKey: part.key, stakeMinor: part.stakeMinor, decimalOdds: part.decimalOdds, potentialReturnMinor: part.potentialReturnMinor, status: 'OPEN' } })
      await tx.wagerLeg.createMany({ data: part.legIndexes.map(index => { const leg = legs[index] as unknown as QuoteLeg, acceptedPrice = acceptedLegPrices.get(index)!; return { tenantId: actor.tenantId, wagerId: wager.id, wagerPartId: wagerPart.id, legIndex: index, eventKey: leg.eventId, marketKey: leg.marketId, selectionKey: leg.selectionId, snapshotId: acceptedPrice.snapshotId, decimalOdds: acceptedPrice.decimalOdds, line: acceptedPrice.line, ruleVersion: leg.ruleVersion, correlationGroupKey: leg.correlationGroupKey || '', live: leg.live === 'LIVE' } }) })
    }
    const journal = await tx.journalTransaction.create({ data: { tenantId: actor.tenantId, type: bonus ? 'BONUS_WAGER_STAKE' : 'WAGER_STAKE', idempotencyKey: `stake:combination:${claimed.command.id}`, correlationId: wager.id, status: 'POSTED', effectiveAt: now } })
    await tx.journalEntry.createMany({ data: [
      { tenantId: actor.tenantId, transactionId: journal.id, accountId: source!.id, side: 'DEBIT', amountMinor: String(acceptedStake), currency: currency },
      { tenantId: actor.tenantId, transactionId: journal.id, accountId: pending!.id, side: 'CREDIT', amountMinor: String(acceptedStake), currency: currency },
    ] })
    const nextAvailable = BigInt(projection!.availableMinor) - acceptedStake
    const nextPosted = BigInt(projection!.postedMinor) - acceptedStake
    await tx.balanceProjection.create({ data: { tenantId: actor.tenantId, accountId: source!.id, postedMinor: String(nextPosted), pendingMinor: projection!.pendingMinor, availableMinor: String(nextAvailable), version: Number(projection!.version) + 1, asOf: now } })
    await tx.hold.create({ data: { tenantId: actor.tenantId, accountId: source!.id, purposeType: 'WAGER', purposeId: wager.id, amountMinor: String(acceptedStake), status: 'CAPTURED', version: 1 } })
    if (bonus) {
      const remaining = BigInt(bonus.remainingMinor) - acceptedStake
      await tx.bonusAward.update({ where: { id: bonus.id }, data: { remainingMinor: String(remaining), status: remaining === 0n ? 'CONSUMED' : 'ACTIVE' } })
      await tx.bonusTransaction.create({ data: { tenantId: actor.tenantId, awardId: bonus.id, type: 'CONSUME', amountMinor: String(acceptedStake), remainingMinor: String(remaining), currency: currency, wagerId: wager.id, journalTransactionId: journal.id, idempotencyKey: `bonus-consume:${claimed.command.id}`, evidenceHash: evidenceHash({ bonusAwardId: bonus.id, wagerId: wager.id, acceptedStake }) } })
    }
    const liability = potentialReturn > acceptedStake ? potentialReturn - acceptedStake : 0n
    const marketIds=[...new Set(legs.filter((_, index) => acceptedLegIndexes.has(index)).map(leg => leg.marketId))]
    const marketCount=BigInt(marketIds.length)
    for (const [marketIndex,marketId] of marketIds.entries()) {
      await tx.$queryRaw`SELECT id FROM "ExposurePosition" WHERE tenant = ${actor.tenantId} AND "scopeType" = 'MARKET' AND "scopeId" = ${marketId} AND currency = ${currency} FOR UPDATE`
      const exposure = await tx.exposurePosition.findFirst({ where: { tenantId: actor.tenantId, scopeType: 'MARKET', scopeId: marketId, currency: currency } })
      const allocatedStake = acceptedStake / marketCount+(BigInt(marketIndex)<acceptedStake%marketCount?1n:0n), allocatedLiability = liability / marketCount+(BigInt(marketIndex)<liability%marketCount?1n:0n)
      await tx.wagerExposureAllocation.create({ data: { tenantId: actor.tenantId, wagerId: wager.id, marketId, stakeMinor: String(allocatedStake), liabilityMinor: String(allocatedLiability), remainingStakeMinor: String(allocatedStake), remainingLiabilityMinor: String(allocatedLiability), version: 1, status: 'OPEN' } })
      if (exposure) await tx.exposurePosition.update({ where: { id: exposure.id }, data: { stakeMinor: String(BigInt(exposure.stakeMinor) + allocatedStake), liabilityMinor: String(BigInt(exposure.liabilityMinor) + allocatedLiability), version: { increment: 1 }, asOf: now } })
      else await tx.exposurePosition.create({ data: { tenantId: actor.tenantId, scopeType: 'MARKET', scopeId: marketId, currency: currency, stakeMinor: String(allocatedStake), liabilityMinor: String(allocatedLiability), version: 1, asOf: now } })
    }
    await tx.outboxMessage.create({ data: { tenantId: actor.tenantId, aggregateType: 'WAGER', aggregateId: wager.id, eventType: 'wager.accepted.v2', payload: { structure: terms.structure, acceptedPartIndexes: acceptedParts.map(part => part.index), rejectedPartIndexes: rejectedParts.map(part => part.index), stakeMinor: String(acceptedStake), currency: currency, termsHash: acceptedTermsHash, bonusAwardId: bonus?.id ?? null }, status: 'PENDING', attempts: 0, maxAttempts: 10, availableAt: now } })
    await appendCustomerAudit(tx, { tenantId: actor.tenantId, playerId: actor.playerId, action: rejectedParts.length ? 'wager.partially_accepted' : 'wager.accepted', targetType: 'Wager', targetId: wager.id, reason: terms.structure ?? 'STRAIGHT', payload: { acceptedTermsHash, acceptedPartIndexes: acceptedParts.map(part => part.index), rejectedPartIndexes: rejectedParts.map(part => part.index), acceptedStakeMinor: String(acceptedStake), potentialReturnMinor: String(potentialReturn), bonusAwardId: bonus?.id ?? null } })
    const result = { state: rejectedParts.length ? 'PARTIALLY_ACCEPTED' : 'ACCEPTED', accepted: true, duplicate: claimed.duplicate, wagerId: wager.id, receiptId: wager.id, acceptedStakeMinor: String(acceptedStake), potentialReturnMinor: String(potentialReturn), termsHash: acceptedTermsHash, acceptedPartIndexes: acceptedParts.map(part => part.index), rejectedPartIndexes: rejectedParts.map(part => part.index), acceptedParts: pricedAcceptedParts.map(part => ({ index: part.index, key: part.key, stakeMinor: part.stakeMinor, decimalOdds: part.decimalOdds, potentialReturnMinor: part.potentialReturnMinor })), acceptedPrices: acceptedPriceEvidence.map(({ legIndex, snapshotId, decimalOdds, line }) => ({ legIndex, selectionId: (legs[legIndex] as unknown as QuoteLeg).selectionId, priceSnapshotId: snapshotId, decimalOdds, line })) } satisfies CombinationPlacementResponse
    await finishCustomerCommand(tx, command.id, 'SUCCEEDED', result)
    return result
  })
}

async function rejectCombination(tx: any, actor: CustomerActor, commandId: string, quoteId: string, terms: any, rejectionCode: string): Promise<CombinationPlacementResponse> {
  const inputHash = evidenceHash({ quoteId, rejectionCode, termsHash: terms.termsHash })
  const wager = await tx.wager.create({ data: { tenantId: actor.tenantId, playerId: actor.playerId, quoteId, structure: terms.structure, version: 1, idempotencyKey: `combination:${commandId}`, stakeMinor: terms.stakeMinor, potentialReturnMinor: terms.potentialReturnMinor, maxPayoutMinor: String(MAX_PAYOUT_MINOR), currency: terms.currency, termsHash: inputHash, priceChangeConsent: terms.priceChangeConsent, liveDelayMs: Number(terms.liveDelayMs), status: 'REJECTED' } })
  await tx.acceptanceDecision.create({ data: { tenantId: actor.tenantId, wagerId: wager.id, quoteId, accepted: false, rejectionCode, gateResults: { rejected: rejectionCode }, inputHash } })
  await tx.outboxMessage.create({ data: { tenantId: actor.tenantId, aggregateType: 'WAGER', aggregateId: wager.id, eventType: 'wager.rejected.v2', payload: { rejectionCode, termsHash: inputHash }, status: 'PENDING', attempts: 0, maxAttempts: 10, availableAt: new Date() } })
  await appendCustomerAudit(tx, { tenantId: actor.tenantId, playerId: actor.playerId, action: 'wager.rejected', targetType: 'Wager', targetId: wager.id, reason: rejectionCode, payload: { quoteId, inputHash } })
  const result = { state: 'REJECTED', accepted: false, duplicate: false, wagerId: wager.id, receiptId: wager.id, rejectionCode, termsHash: inputHash, acceptedPartIndexes: [], rejectedPartIndexes: asPartPlan(terms.partPlan).map(part => part.index) } satisfies CombinationPlacementResponse
  await finishCustomerCommand(tx, commandId, 'REJECTED', result)
  return result
}
