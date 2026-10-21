import type { Prisma, PrismaClient } from '../../keystone/prisma'
import { withCurrentCustomer, type CustomerActor } from './auth'
import { orderQuoteLegTerms } from './combination-wagering'
import { currentGeoApproved } from './acceptance-gates'
import { projectCashOutState } from '../domain/cashout-economics'
import { CustomerError } from './errors'
import { resolveTenantCurrency } from './currency'
import { fundingBoundsMinor } from './funding'
import type {
  BetsResponse,
  CustomerSessionSummary,
  LimitsResponse,
  ResponsiblePlayResponse,
  WalletResponse,
} from './contracts'

const iso = (value: Date | null | undefined) => value?.toISOString() ?? null

async function playerCashAccount(prisma: Prisma.TransactionClient, actor: CustomerActor) {
  return prisma.ledgerAccount.findFirst({
    where: { tenantId: actor.tenantId, playerId: actor.playerId, key: 'PLAYER_CASH', currency: (actor.currency ?? 'USD') },
  })
}

async function latestBalance(prisma: Prisma.TransactionClient, actor: CustomerActor) {
  const account = await playerCashAccount(prisma, actor)
  if (!account) return { account: null, projection: null }
  const projection = await prisma.balanceProjection.findFirst({
    where: { tenantId: actor.tenantId, accountId: account.id },
    orderBy: { version: 'desc' },
  })
  return { account, projection }
}

async function activeExclusion(prisma: Prisma.TransactionClient, actor: CustomerActor, now = new Date()) {
  return prisma.selfExclusion.findFirst({
    where: {
      tenantId: actor.tenantId,
      playerId: actor.playerId,
      status: 'ACTIVE',
      startsAt: { lte: now },
      OR: [{ endsAt: null }, { endsAt: { gt: now } }],
    },
    orderBy: { startsAt: 'desc' },
  })
}

async function latestGeoStatus(prisma: Prisma.TransactionClient, actor: CustomerActor) {
  const geo = await prisma.geoCheck.findFirst({
    where: { tenantId: actor.tenantId, geoSession: { playerId: actor.playerId } },
    orderBy: { checkedAt: 'desc' },
  })
  // An old ALLOW is not current: use the same session/age rule wager acceptance enforces.
  if (geo?.decision === 'ALLOW') return await currentGeoApproved(prisma, actor.tenantId, actor.playerId, new Date()) ? 'ALLOW' : 'EXPIRED'
  return geo?.decision ?? 'UNKNOWN'
}

export function getCustomerSessionSummary(prisma: PrismaClient, actor: CustomerActor): Promise<CustomerSessionSummary> {
  return withCurrentCustomer(prisma, actor, tx => getCustomerSessionSummaryUnderAuthority(tx, actor), true)
}

async function getCustomerSessionSummaryUnderAuthority(prisma: Prisma.TransactionClient, actor: CustomerActor): Promise<CustomerSessionSummary> {
  const walletCurrency = await resolveTenantCurrency(prisma, actor.tenantId)
  const [{ projection }, player, geoStatus, exclusion] = await Promise.all([
    latestBalance(prisma, actor),
    prisma.player.findFirst({ where: { id: actor.playerId, tenantId: actor.tenantId } }),
    latestGeoStatus(prisma, actor),
    activeExclusion(prisma, actor),
  ])
  return {
    authenticated: true,
    mode: 'sandbox',
    accountReference: actor.accountReference,
    assuranceLevel: actor.assuranceLevel ?? 'GUEST',
    currency: walletCurrency.code,
    currencyExponent: walletCurrency.exponent,
    availableMinor: projection?.availableMinor ?? '0',
    kycStatus: player?.kycStatus ?? 'REQUIRED',
    geoStatus,
    selfExcluded: Boolean(exclusion),
    accountStatus: player?.status ?? 'ACTIVE',
    locale: player?.locale || 'en-US',
    timezone: player?.timezone || 'UTC',
    preferredOddsFormat: player?.preferredOddsFormat ?? 'DECIMAL',
  }
}

export function getCustomerWallet(prisma: PrismaClient, actor: CustomerActor): Promise<WalletResponse> {
  return withCurrentCustomer(prisma, actor, tx => getCustomerWalletUnderAuthority(tx, actor), true)
}

async function getCustomerWalletUnderAuthority(prisma: Prisma.TransactionClient, actor: CustomerActor): Promise<WalletResponse> {
  const walletCurrency = await resolveTenantCurrency(prisma, actor.tenantId)
  if (actor.currency && actor.currency !== walletCurrency.code) throw new CustomerError('CUSTOMER_CURRENCY_CHANGED', 409)
  const { account, projection } = await latestBalance(prisma, actor)
  // Missing ledger evidence is reported as unavailable, never substituted with zero.
  if (!account || !projection) throw new CustomerError('WALLET_UNAVAILABLE', 409)
  const bonusAccount = await prisma.ledgerAccount.findFirst({ where: { tenantId: actor.tenantId, playerId: actor.playerId, key: 'PLAYER_BONUS', currency: walletCurrency.code } })
  const [holds, intents, bonusProjection, bonusAwards] = await Promise.all([
    // Complete scoped aggregate of active reservations (no truncation).
    prisma.hold.findMany({ where: { tenantId: actor.tenantId, accountId: account.id, status: 'ACTIVE' }, select: { amountMinor: true } }),
    prisma.paymentIntent.findMany({
      where: { tenantId: actor.tenantId, playerId: actor.playerId },
      orderBy: { createdAt: 'desc' },
      take: 30,
    }),
    bonusAccount ? prisma.balanceProjection.findFirst({ where: { tenantId: actor.tenantId, accountId: bonusAccount.id }, orderBy: { version: 'desc' } }) : null,
    prisma.bonusAward.findMany({ where: { tenantId: actor.tenantId, playerId: actor.playerId }, orderBy: { awardedAt: 'desc' }, take: 30 }),
  ])
  const attempts = intents.length ? await prisma.paymentAttempt.findMany({
    where: { tenantId: actor.tenantId, paymentIntentId: { in: intents.map(intent => intent.id) } },
    // Latest attempt per payment intent, with a stable order.
    orderBy: [{ paymentIntentId: 'asc' }, { attempt: 'desc' }, { id: 'desc' }],
    distinct: ['paymentIntentId'],
  }) : []
  const latestAttempt = new Map<string, (typeof attempts)[number]>()
  for (const attempt of attempts) if (attempt.paymentIntentId && !latestAttempt.has(attempt.paymentIntentId)) latestAttempt.set(attempt.paymentIntentId, attempt)
  const heldMinor = holds.reduce((total, hold) => total + BigInt(hold.amountMinor), 0n)

  return {
    mode: 'sandbox',
    currency: walletCurrency.code,
    currencyExponent: walletCurrency.exponent,
    fundingMinMinor: String(fundingBoundsMinor(walletCurrency.exponent).minMinor),
    fundingMaxMinor: String(fundingBoundsMinor(walletCurrency.exponent).maxMinor),
    depositsEnabled: walletCurrency.depositsEnabled,
    withdrawalsEnabled: walletCurrency.withdrawalsEnabled,
    availableMinor: projection.availableMinor,
    postedMinor: projection.postedMinor,
    pendingMinor: projection.pendingMinor,
    heldMinor: String(heldMinor),
    bonusAvailableMinor: bonusProjection?.availableMinor ?? '0',
    bonusAwards: bonusAwards.map(award => ({ id: award.id, type: award.awardType ?? 'BONUS_CASH', remainingMinor: award.remainingMinor, status: award.status ?? 'EXPIRED', expiresAt: award.expiresAt.toISOString() })),
    asOf: iso(projection?.asOf),
    transactions: intents.map(intent => {
      const attempt = latestAttempt.get(intent.id)
      return {
        id: intent.id,
        type: intent.type ?? 'DEPOSIT',
        amountMinor: intent.amountMinor,
        currency: intent.currency,
        status: intent.status ?? 'UNKNOWN',
        createdAt: iso(intent.createdAt) ?? new Date(0).toISOString(),
        ...(attempt?.externalReference ? { externalReference: attempt.externalReference } : {}),
      }
    }),
  }
}

const BETS_PAGE_SIZE = 20
export function getCustomerBets(prisma: PrismaClient, actor: CustomerActor, cursor?: string | null): Promise<BetsResponse> {
  if (cursor && !/^[A-Za-z0-9_-]{1,64}$/.test(cursor)) throw new CustomerError('INVALID_CURSOR', 400)
  return withCurrentCustomer(prisma, actor, tx => getCustomerBetsUnderAuthority(tx, actor, cursor || undefined), true)
}

async function getCustomerBetsUnderAuthority(prisma: Prisma.TransactionClient, actor: CustomerActor, cursor?: string): Promise<BetsResponse> {
  // Owner filter and stable (createdAt, id) order come before the page limit; the cursor must be one of this owner's wagers.
  if (cursor && !(await prisma.wager.findFirst({ where: { id: cursor, tenantId: actor.tenantId, playerId: actor.playerId }, select: { id: true } }))) throw new CustomerError('INVALID_CURSOR', 400)
  const page = await prisma.wager.findMany({
    where: { tenantId: actor.tenantId, playerId: actor.playerId },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: BETS_PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  })
  const wagers = page.slice(0, BETS_PAGE_SIZE)
  const nextCursor = page.length > BETS_PAGE_SIZE ? wagers[wagers.length - 1]?.id ?? null : null
  const quoteIds = wagers.flatMap(wager => wager.quoteId ? [wager.quoteId] : [])
  const wagerIds = wagers.map(wager => wager.id)
  const [terms, legTerms, settlements, decisions, parts, cashOuts] = await Promise.all([
    // Children are complete for the page's wagers (no shared caps); settlement is the latest version per wager.
    quoteIds.length ? prisma.customerQuoteTerms.findMany({ where: { tenantId: actor.tenantId, playerId: actor.playerId, quoteKey: { in: quoteIds } } }) : [],
    quoteIds.length ? prisma.customerQuoteLegTerms.findMany({ where: { tenantId: actor.tenantId, playerId: actor.playerId, quoteKey: { in: quoteIds } } }) : [],
    wagerIds.length ? prisma.settlement.findMany({ where: { tenantId: actor.tenantId, wagerId: { in: wagerIds } }, orderBy: [{ wagerId: 'asc' }, { version: 'desc' }], distinct: ['wagerId'], include: { from_SettlementLine_settlement: true } }) : [],
    wagerIds.length ? prisma.acceptanceDecision.findMany({ where: { tenantId: actor.tenantId, wagerId: { in: wagerIds } } }) : [],
    wagerIds.length ? prisma.wagerPart.findMany({ where: { tenantId: actor.tenantId, wagerId: { in: wagerIds } }, orderBy: { partIndex: 'asc' } }) : [],
    wagerIds.length ? prisma.cashOutAcceptance.findMany({ where: { tenantId: actor.tenantId, wagerId: { in: wagerIds } }, orderBy: { acceptedAt: 'asc' } }) : [],
  ])
  const termsByQuote = new Map(terms.map(item => [item.quoteKey, item]))
  const latestSettlement = new Map<string, (typeof settlements)[number]>()
  for (const settlement of settlements) if (settlement.wagerId && !latestSettlement.has(settlement.wagerId)) latestSettlement.set(settlement.wagerId, settlement)
  const decisionByWager = new Map(decisions.flatMap(decision => decision.wagerId ? [[decision.wagerId, decision] as const] : []))

  return {
    bets: wagers.map(wager => {
      const snapshot = wager.quoteId ? termsByQuote.get(wager.quoteId) : undefined
      const settlement = latestSettlement.get(wager.id)
      const decision = decisionByWager.get(wager.id)
      const fullLine = settlement?.from_SettlementLine_settlement.find(line => (line.trace as { contract?: string } | null)?.contract === 'openfront.full-straight.initial.v1')
      const trace = fullLine?.trace as { planHash?: string; capturedHoldId?: string; bundle?: { tenantId?: string; playerId?: string; wagerId?: string; ruleVersion?: string; resultVersionId?: string; payoutMinor?: string; currencyExponent?: number } } | null
      if (fullLine && (fullLine.tenantId !== actor.tenantId || fullLine.settlementId !== settlement?.id || trace?.bundle?.tenantId !== actor.tenantId || trace.bundle.playerId !== actor.playerId || trace.bundle.wagerId !== wager.id || trace.bundle.payoutMinor !== settlement?.payoutMinor)) throw new CustomerError('SETTLEMENT_RECEIPT_SCOPE_MISMATCH', 409)
      const wagerParts = parts.filter(part => part.wagerId === wager.id)
      const wagerCashOuts = cashOuts.filter(item => item.wagerId === wager.id)
      const hasAcceptedTerms = !['REJECTED', 'PENDING'].includes(wager.status ?? '')
      const gates = decision?.gateResults as { rejectedParts?: number[]; acceptedPriceEvidence?: Array<{ legIndex: number; snapshotId: string; decimalOdds: string; line: string }> } | null
      const acceptedPrices = new Map((hasAcceptedTerms && Array.isArray(gates?.acceptedPriceEvidence) ? gates.acceptedPriceEvidence : []).map(price => [price.legIndex, price]))
      const displayLegs = orderQuoteLegTerms(legTerms.filter(leg => leg.quoteKey === wager.quoteId))
        .filter(leg => !acceptedPrices.size || acceptedPrices.has(Number(leg.legIndex)))
      const firstLeg = displayLegs[0]
      const cashOutState = projectCashOutState(wager.stakeMinor, wagerCashOuts, hasAcceptedTerms && wagerParts.length ? wagerParts : undefined)
      const reversedById = new Map(cashOutState.reversals.map(item => [item.reversalOfId, item.id]))
      return {
        id: wager.id,
        status: wager.status ?? 'REJECTED',
        structure: wager.structure ?? snapshot?.structure ?? 'STRAIGHT',
        eventName: firstLeg?.eventName ?? snapshot?.eventName ?? 'Terms snapshot unavailable',
        marketName: firstLeg?.marketName ?? snapshot?.marketName ?? '—',
        selectionName: firstLeg?.selectionName ?? snapshot?.selectionName ?? '—',
        decimalOdds: hasAcceptedTerms && wagerParts.length ? wagerParts[0].decimalOdds : snapshot?.decimalOdds ?? '—',
        priceEvidenceSource: acceptedPrices.size ? 'ACCEPTED' : 'QUOTED',
        rejectedPartIndexes: Array.isArray(gates?.rejectedParts) ? gates.rejectedParts : [],
        stakeMinor: wager.stakeMinor,
        potentialReturnMinor: wager.potentialReturnMinor,
        payoutMinor: settlement?.payoutMinor ?? null,
        settlementEvidence: fullLine && settlement && trace?.planHash && trace.capturedHoldId && trace.bundle?.ruleVersion && trace.bundle.resultVersionId && typeof trace.bundle.currencyExponent === 'number' ? { receiptId: settlement.id, journalId: settlement.journalTransactionId ?? '', planHash: trace.planHash, capturedHoldId: trace.capturedHoldId, resultVersionId: trace.bundle.resultVersionId, ruleVersion: trace.bundle.ruleVersion, outcome: settlement.outcome ?? 'UNKNOWN', payoutMinor: settlement.payoutMinor, currencyExponent: trace.bundle.currencyExponent } : null,
        currency: wager.currency,
        termsHash: wager.termsHash,
        quoteId: wager.quoteId ?? '',
        priceSnapshotId: firstLeg ? acceptedPrices.get(Number(firstLeg.legIndex))?.snapshotId ?? firstLeg.priceSnapshotId : snapshot?.priceSnapshotId ?? '',
        rejectionCode: decision?.rejectionCode || null,
        acceptedAt: iso(wager.acceptedAt),
        createdAt: iso(wager.createdAt) ?? new Date(0).toISOString(),
        legs: displayLegs.map(leg => {
          const price = acceptedPrices.get(Number(leg.legIndex))
          return { index: Number(leg.legIndex), eventName: leg.eventName, marketName: leg.marketName, selectionName: leg.selectionName, decimalOdds: price?.decimalOdds ?? leg.decimalOdds, line: price?.line ?? leg.line, priceSnapshotId: price?.snapshotId ?? leg.priceSnapshotId, live: leg.live === 'LIVE', evidenceHash: leg.evidenceHash }
        }),
        parts: wagerParts.map(part => ({ id: part.id, index: part.partIndex, key: part.combinationKey, stakeMinor: part.stakeMinor, decimalOdds: part.decimalOdds, potentialReturnMinor: part.potentialReturnMinor, status: part.status ?? 'OPEN' })),
        netRemainingStakeMinor: hasAcceptedTerms ? String(cashOutState.remainingStakeMinor) : null,
        cashOut: cashOutState.accepted.length ? { acceptedMinor: String(cashOutState.acceptedAmountMinor), acceptedPortion: `${Number(cashOutState.closedMillionths) / 10_000}%`, netRemainingStakeMinor: String(cashOutState.remainingStakeMinor) } : null,
        cashOutHistory: wagerCashOuts.map(item => ({ id: item.id, amountMinor: item.amountMinor, currency: item.currency, recordStatus: item.status ?? 'UNKNOWN', reversalOfId: item.reversalOfId, reversedById: reversedById.get(item.id) ?? null, effective: cashOutState.accepted.some(active => active.id === item.id), acceptedAt: iso(item.acceptedAt) })),
      }
    }),
    nextCursor,
  }
}

export function getCustomerLimits(prisma: PrismaClient, actor: CustomerActor): Promise<LimitsResponse> {
  return withCurrentCustomer(prisma, actor, tx => getCustomerLimitsUnderAuthority(tx, actor), true)
}

async function getCustomerLimitsUnderAuthority(prisma: Prisma.TransactionClient, actor: CustomerActor): Promise<LimitsResponse> {
  const now = new Date()
  // Every active or scheduled limit is returned (protections are never hidden by a cap); ended limits are recent history.
  const [current, ended] = await Promise.all([
    prisma.playerLimit.findMany({ where: { tenantId: actor.tenantId, playerId: actor.playerId, OR: [{ effectiveTo: null }, { effectiveTo: { gt: now } }] }, orderBy: [{ effectiveFrom: 'desc' }, { id: 'desc' }] }),
    prisma.playerLimit.findMany({ where: { tenantId: actor.tenantId, playerId: actor.playerId, effectiveTo: { lte: now } }, orderBy: [{ effectiveTo: 'desc' }, { id: 'desc' }], take: 20 }),
  ])
  const rows = [...current, ...ended]
  return {
    coolingOffHours: 24,
    limits: rows.map(row => ({
      id: row.id,
      type: row.type ?? 'STAKE',
      period: row.period ?? 'DAILY',
      amountMinor: row.amountMinor,
      currency: row.currency,
      effectiveFrom: row.effectiveFrom.toISOString(),
      effectiveTo: iso(row.effectiveTo),
      state: row.effectiveFrom > now ? 'PENDING' : row.effectiveTo && row.effectiveTo <= now ? 'EXPIRED' : 'ACTIVE',
    })),
  }
}

export function getResponsiblePlay(prisma: PrismaClient, actor: CustomerActor): Promise<ResponsiblePlayResponse> {
  return withCurrentCustomer(prisma, actor, tx => getResponsiblePlayUnderAuthority(tx, actor), true)
}

async function getResponsiblePlayUnderAuthority(prisma: Prisma.TransactionClient, actor: CustomerActor): Promise<ResponsiblePlayResponse> {
  const [current, history, player, geoStatus, restriction] = await Promise.all([
    activeExclusion(prisma, actor),
    prisma.selfExclusion.findMany({ where: { tenantId: actor.tenantId, playerId: actor.playerId }, orderBy: { startsAt: 'desc' }, take: 20 }),
    prisma.player.findFirst({ where: { id: actor.playerId, tenantId: actor.tenantId } }),
    latestGeoStatus(prisma, actor),
    prisma.accountRestriction.findFirst({ where: { tenantId: actor.tenantId, playerId: actor.playerId, capability: 'WAGER', status: 'ACTIVE' } }),
  ])
  const item = (row: (typeof history)[number]) => ({
    id: row.id,
    scope: row.scope,
    startsAt: row.startsAt.toISOString(),
    endsAt: iso(row.endsAt),
    status: row.status ?? 'ACTIVE',
    source: row.source,
  })
  return {
    selfExclusion: current ? item(current) : null,
    history: history.map(item),
    wageringRestricted: Boolean(current || restriction),
    kycStatus: player?.kycStatus ?? 'REQUIRED',
    geoStatus,
  }
}
