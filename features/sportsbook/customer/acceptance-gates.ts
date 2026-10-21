// Shared current-state gates evaluated inside every committing wager transaction
// (straight and combination), so no caller can rely on an earlier preflight.
type Tx = any

const GEO_DECISION_MAX_AGE_MS = 86_400_000

/**
 * The newest geolocation decision across the player's sessions is authoritative: a newer DENY
 * or UNKNOWN supersedes an older ALLOW. It must also belong to a session that is still ACTIVE
 * and unexpired, and be no older than the accepted validity window.
 */
export async function currentGeoApproved(tx: Tx, tenantId: string, playerId: string, now: Date) {
  const latest = await tx.geoCheck.findFirst({
    where: { tenantId, checkedAt: { not: null, lte: now }, geoSession: { tenantId, playerId } },
    include: { geoSession: true },
    orderBy: [{ checkedAt: 'desc' }, { createdAt: 'desc' }],
  })
  if (!latest || latest.decision !== 'ALLOW' || !latest.checkedAt) return false
  if (now.getTime() - latest.checkedAt.getTime() > GEO_DECISION_MAX_AGE_MS) return false
  const session = latest.geoSession
  return Boolean(session && session.status === 'ACTIVE' && (!session.expiresAt || session.expiresAt > now))
}

/** KYC requires both the player summary and the latest KYC case (not AGE/ADDRESS) to be currently approved. */
export async function currentKycApproved(tx: Tx, tenantId: string, player: { id: string; kycStatus: string | null }, now: Date) {
  if (player.kycStatus !== 'APPROVED') return false
  const latest = await tx.verificationCase.findFirst({ where: { tenantId, playerId: player.id, type: 'KYC' }, orderBy: { createdAt: 'desc' } })
  return Boolean(latest && latest.status === 'APPROVED' && (!latest.expiresAt || latest.expiresAt > now))
}

/** Legal/operator/brand/channel identities in force for the web channel at acceptance time. */
export async function currentWagerProvenance(tx: Tx, tenantId: string) {
  const channel = await tx.operatorChannel.findFirst({
    where: { tenantId, type: 'WEB', status: { in: ['ACTIVE', 'PENDING'] } },
    orderBy: [{ status: 'asc' }, { createdAt: 'asc' }],
  })
  return {
    channelId: channel?.id ?? null,
    brandId: channel?.brandId ?? null,
    legalEntityId: channel?.legalEntityId ?? null,
    operatorJurisdictionId: channel?.operatorJurisdictionId ?? null,
  }
}

type Allocation = { marketId: string; eventId: string | null; stakeMinor: bigint; liabilityMinor: bigint }

const money = (value: string | null | undefined) => (value && /^\d+$/.test(value) ? BigInt(value) : null)

/**
 * Operator risk rules (LimitRule under an ACTIVE, effective LimitProfile) are operative caps: stake and
 * payout per wager, and aggregate open liability for the rule's scope after this wager's allocation.
 * Supported scopes: TENANT, PLAYER, EVENT, MARKET. Rules for another currency do not apply.
 */
export async function riskLimitViolation(tx: Tx, input: { tenantId: string; playerId: string; currency: string; stakeMinor: bigint; potentialReturnMinor: bigint; allocations: Allocation[]; now: Date }) {
  const { tenantId, playerId, currency, now } = input
  const rules = await tx.limitRule.findMany({
    where: { tenantId, currency, profile: { tenantId, status: 'ACTIVE', OR: [{ effectiveFrom: null }, { effectiveFrom: { lte: now } }], AND: [{ OR: [{ effectiveTo: null }, { effectiveTo: { gt: now } }] }] } },
    orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
  })
  const marketIds = new Set(input.allocations.map(item => item.marketId))
  const eventIds = new Set(input.allocations.flatMap(item => item.eventId ? [item.eventId] : []))
  const newLiability = input.allocations.reduce((sum, item) => sum + item.liabilityMinor, 0n)
  for (const rule of rules) {
    const scope = String(rule.scopeType || '').toUpperCase()
    const scopeId = String(rule.scopeId || '')
    const applies = scope === 'TENANT' ? (!scopeId || scopeId === tenantId)
      : scope === 'PLAYER' ? scopeId === playerId
      : scope === 'EVENT' ? eventIds.has(scopeId)
      : scope === 'MARKET' ? marketIds.has(scopeId)
      : false
    if (!applies) continue
    const maxStake = money(rule.maxStakeMinor), maxPayout = money(rule.maxPayoutMinor), maxLiability = money(rule.maxLiabilityMinor)
    if (maxStake !== null && input.stakeMinor > maxStake) return { code: 'LIMIT_RULE_EXCEEDED', limitRuleId: rule.id }
    if (maxPayout !== null && input.potentialReturnMinor > maxPayout) return { code: 'LIMIT_RULE_EXCEEDED', limitRuleId: rule.id }
    if (maxLiability === null) continue
    let added = 0n
    let where: Record<string, unknown>
    if (scope === 'MARKET') { added = input.allocations.filter(item => item.marketId === scopeId).reduce((sum, item) => sum + item.liabilityMinor, 0n); where = { marketId: scopeId } }
    else if (scope === 'EVENT') {
      const markets = await tx.market.findMany({ where: { tenantId, eventId: scopeId }, select: { id: true } })
      const ids = markets.map((item: { id: string }) => item.id)
      added = input.allocations.filter(item => item.eventId === scopeId).reduce((sum, item) => sum + item.liabilityMinor, 0n)
      where = { marketId: { in: ids } }
    } else if (scope === 'PLAYER') { added = newLiability; where = { wager: { playerId } } }
    else { added = newLiability; where = {} }
    const open = await tx.wagerExposureAllocation.findMany({ where: { tenantId, status: { not: 'CLOSED' }, wager: { currency }, ...where }, select: { remainingLiabilityMinor: true } })
    const current = open.reduce((sum: bigint, item: { remainingLiabilityMinor: string }) => sum + (money(item.remainingLiabilityMinor) ?? 0n), 0n)
    if (current + added > maxLiability) return { code: 'LIABILITY_LIMIT_EXCEEDED', limitRuleId: rule.id }
  }
  return null
}

/** Equal split of stake/liability across markets, matching the allocation written at acceptance. */
export function splitAcrossMarkets(markets: Array<{ marketId: string; eventId: string | null }>, stakeMinor: bigint, liabilityMinor: bigint): Allocation[] {
  const count = BigInt(markets.length || 1)
  return markets.map((market, index) => ({
    ...market,
    stakeMinor: stakeMinor / count + (BigInt(index) < stakeMinor % count ? 1n : 0n),
    liabilityMinor: liabilityMinor / count + (BigInt(index) < liabilityMinor % count ? 1n : 0n),
  }))
}
