/**
 * Time-based lifecycle sweep, run inside the leased EXPIRY job transaction. Every update is a compare-and-set on the
 * non-terminal status plus the elapsed deadline, so it is idempotent and cannot overwrite a state another writer moved.
 * Reads already treat these rows as expired (queries filter on the deadline); this makes the stored status agree.
 */
export async function sweepExpiredStates(tx: any, tenantId: string, now: Date = new Date()) {
  const lapsed = { lte: now }
  const betSlips = await tx.betSlip.updateMany({ where: { tenantId, status: { in: ['OPEN', 'QUOTED'] }, expiresAt: lapsed }, data: { status: 'EXPIRED' } })
  const overrides = await tx.traderOverride.updateMany({ where: { tenantId, status: { in: ['PENDING', 'ACTIVE'] }, expiresAt: lapsed }, data: { status: 'EXPIRED' } })
  const approvals = await tx.approvalRequest.updateMany({ where: { tenantId, status: 'PENDING', expiresAt: lapsed }, data: { status: 'EXPIRED' } })
  const exclusions = await tx.selfExclusion.updateMany({ where: { tenantId, status: 'ACTIVE', endsAt: lapsed }, data: { status: 'EXPIRED' } })
  return { betSlips: betSlips.count, traderOverrides: overrides.count, approvals: approvals.count, selfExclusions: exclusions.count }
}
