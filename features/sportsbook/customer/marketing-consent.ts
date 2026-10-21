/**
 * Customer notification purpose. Only templates known to be transactional (account security and servicing) skip the
 * marketing-consent check; every other customer template is treated as marketing, so an unknown template can never be
 * sent without consent.
 */
export const TRANSACTIONAL_NOTIFICATION_TEMPLATES = new Set(['customer.password-reset'])

export const notificationPurpose = (templateKey: string | null | undefined): 'TRANSACTIONAL' | 'MARKETING' =>
  TRANSACTIONAL_NOTIFICATION_TEMPLATES.has(String(templateKey ?? '')) ? 'TRANSACTIONAL' : 'MARKETING'

export type MarketingConsentDecision = { allowed: true; consentId: string; evidenceHash: string } | { allowed: false; reason: 'PLAYER_NOT_FOUND' | 'PREFERENCE_OFF' | 'NO_CONSENT' | 'WITHDRAWN' }

/**
 * Evaluates the customer's current marketing consent inside the sending transaction. The player row is share-locked
 * first, the same row a profile update (grant/withdrawal) writes, so a withdrawal either commits before this decision
 * or waits for the send to finish; it can never be overtaken by a stale read.
 */
export async function evaluateMarketingConsent(tx: any, tenantId: string, playerId: string): Promise<MarketingConsentDecision> {
  await tx.$queryRaw`SELECT id FROM "Player" WHERE id = ${playerId} AND tenant = ${tenantId} FOR SHARE`
  const player = await tx.player.findFirst({ where: { id: playerId, tenantId }, select: { marketingAllowed: true } })
  if (!player) return { allowed: false, reason: 'PLAYER_NOT_FOUND' }
  // The latest immutable consent event decides: a withdrawal is appended after the grant it withdraws.
  const latest = await tx.consent.findFirst({ where: { tenantId, playerId, type: 'MARKETING' }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] })
  if (!latest) return { allowed: false, reason: 'NO_CONSENT' }
  if (latest.withdrawnAt || !latest.givenAt) return { allowed: false, reason: 'WITHDRAWN' }
  if (!player.marketingAllowed) return { allowed: false, reason: 'PREFERENCE_OFF' }
  return { allowed: true, consentId: latest.id, evidenceHash: latest.evidenceHash }
}
