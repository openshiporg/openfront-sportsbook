import type { PrismaClient } from '../../keystone/prisma'
import { assertCurrentCustomerActor, type CustomerActor } from './auth'
import { appendCustomerAudit } from './audit'
import { CustomerError } from './errors'

/** Request types whose completed outcome is a copy of the customer's own data. */
export const PRIVACY_EXPORT_TYPES = ['ACCESS', 'EXPORT', 'PORTABILITY'] as const
export const privacyExportAvailable = (request: { type: string | null; status: string | null }) =>
  request.status === 'COMPLETED' && (PRIVACY_EXPORT_TYPES as readonly string[]).includes(request.type ?? '')

const iso = (value: Date | null | undefined) => value ? value.toISOString() : null

/**
 * Builds the customer's data copy for one completed access/export/portability request, on demand, from the
 * customer's own current records. Nothing is stored: each download is generated inside one snapshot for the
 * current owner, and is audited. Secrets (password hashes, token/email digests, device digests) and restricted
 * compliance compartments (AML, integrity, risk scoring, encrypted identity payloads) are never included.
 */
export async function buildCustomerPrivacyExport(prisma: PrismaClient, actor: CustomerActor, requestId: unknown) {
  const id = typeof requestId === 'string' ? requestId.trim() : ''
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(id)) throw new CustomerError('PRIVACY_REQUEST_NOT_FOUND', 404)
  const generatedAt = new Date()
  const data = await prisma.$transaction(async (tx: any) => {
    // Current owner authority (servicing: a closed or paused account still receives its own data).
    await assertCurrentCustomerActor(tx, actor, true, generatedAt, true)
    const request = await tx.customerPrivacyRequest.findFirst({ where: { id, tenantId: actor.tenantId, playerId: actor.playerId } })
    if (!request) throw new CustomerError('PRIVACY_REQUEST_NOT_FOUND', 404)
    if (!privacyExportAvailable(request)) throw new CustomerError('PRIVACY_EXPORT_UNAVAILABLE', 409)
    const owned = { tenantId: actor.tenantId, playerId: actor.playerId }
    const [player, credentials, consents, limits, selfExclusions, restrictions, sessions, devices, favorites, wagers, cashOuts, payments, ledgerAccounts, statements, bonusAwards, redemptions, supportCases, disputes, privacyRequests, closures, verifications, notifications] = await Promise.all([
      tx.player.findFirst({ where: { id: actor.playerId, tenantId: actor.tenantId }, select: { id: true, status: true, kycStatus: true, locale: true, timezone: true, preferredOddsFormat: true, marketingAllowed: true, createdAt: true, updatedAt: true } }),
      tx.customerCredential.findMany({ where: owned, orderBy: { createdAt: 'asc' }, select: { emailMasked: true, status: true, verifiedAt: true, lastAuthenticatedAt: true, createdAt: true } }),
      tx.consent.findMany({ where: owned, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }], select: { id: true, type: true, policyVersion: true, givenAt: true, withdrawnAt: true, evidenceHash: true, createdAt: true } }),
      tx.playerLimit.findMany({ where: owned, orderBy: { createdAt: 'asc' }, select: { id: true, type: true, period: true, amountMinor: true, currency: true, effectiveFrom: true, effectiveTo: true, createdAt: true } }),
      tx.selfExclusion.findMany({ where: owned, orderBy: { createdAt: 'asc' }, select: { id: true, scope: true, startsAt: true, endsAt: true, status: true, source: true, createdAt: true } }),
      tx.accountRestriction.findMany({ where: owned, orderBy: { createdAt: 'asc' }, select: { id: true, capability: true, startsAt: true, endsAt: true, status: true, createdAt: true } }),
      tx.customerSession.findMany({ where: owned, orderBy: { createdAt: 'asc' }, select: { id: true, assuranceLevel: true, createdAt: true, lastSeenAt: true, expiresAt: true, revokedAt: true } }),
      tx.customerDevice.findMany({ where: owned, orderBy: { firstSeenAt: 'asc' }, select: { id: true, label: true, firstSeenAt: true, lastSeenAt: true, revokedAt: true } }),
      tx.customerFavorite.findMany({ where: owned, orderBy: { createdAt: 'asc' }, select: { targetType: true, targetId: true, createdAt: true } }),
      tx.wager.findMany({ where: owned, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }], select: { id: true, structure: true, stakeMinor: true, potentialReturnMinor: true, maxPayoutMinor: true, currency: true, termsHash: true, priceChangeConsent: true, requestedAt: true, acceptedAt: true, status: true, createdAt: true } }),
      tx.cashOutAcceptance.findMany({ where: owned, orderBy: { acceptedAt: 'asc' }, select: { id: true, wagerId: true, amountMinor: true, currency: true, portionNumerator: true, portionDenominator: true, acceptedAt: true, status: true, reversalOfId: true } }),
      tx.paymentIntent.findMany({ where: owned, orderBy: { createdAt: 'asc' }, select: { id: true, type: true, amountMinor: true, feeMinor: true, currency: true, status: true, completedAt: true, createdAt: true } }),
      tx.ledgerAccount.findMany({ where: owned, orderBy: { createdAt: 'asc' }, select: { id: true, key: true, accountClass: true, currency: true, status: true, createdAt: true } }),
      tx.playerStatement.findMany({ where: owned, orderBy: { periodEnd: 'asc' }, select: { id: true, periodStart: true, periodEnd: true, openingMinor: true, closingMinor: true, currency: true, journalHash: true, status: true, createdAt: true } }),
      tx.bonusAward.findMany({ where: owned, orderBy: { awardedAt: 'asc' }, select: { id: true, promotionId: true, amountMinor: true, remainingMinor: true, currency: true, awardType: true, status: true, awardedAt: true, activatedAt: true, expiresAt: true } }),
      tx.promotionRedemption.findMany({ where: owned, orderBy: { redeemedAt: 'asc' }, select: { id: true, promotionId: true, bonusAwardId: true, status: true, reasonCode: true, redeemedAt: true } }),
      tx.supportCase.findMany({ where: owned, orderBy: { openedAt: 'asc' }, select: { id: true, wagerId: true, paymentIntentId: true, disputeId: true, category: true, status: true, subject: true, openedAt: true, resolvedAt: true } }),
      tx.dispute.findMany({ where: owned, orderBy: { createdAt: 'asc' }, select: { id: true, wagerId: true, category: true, status: true, resolution: true, resolvedAt: true, createdAt: true } }),
      tx.customerPrivacyRequest.findMany({ where: owned, orderBy: { requestedAt: 'asc' }, select: { id: true, type: true, status: true, requestedAt: true, dueAt: true, completedAt: true, decisionReason: true } }),
      tx.accountClosure.findMany({ where: owned, orderBy: { requestedAt: 'asc' }, select: { id: true, reasonCode: true, requestedAt: true, coolingEndsAt: true, status: true, completedAt: true } }),
      tx.verificationCase.findMany({ where: owned, orderBy: { createdAt: 'asc' }, select: { id: true, type: true, status: true, expiresAt: true, createdAt: true } }),
      tx.notification.findMany({ where: owned, orderBy: { createdAt: 'asc' }, select: { id: true, channel: true, templateKey: true, status: true, sentAt: true, createdAt: true } }),
    ])
    if (!player) throw new CustomerError('ACCOUNT_NOT_FOUND', 404)
    const wagerIds = wagers.map((wager: any) => wager.id), caseIds = supportCases.map((item: any) => item.id), accountIds = ledgerAccounts.map((item: any) => item.id)
    const [legs, caseEvents, balances] = await Promise.all([
      wagerIds.length ? tx.wagerLeg.findMany({ where: { tenantId: actor.tenantId, wagerId: { in: wagerIds } }, orderBy: [{ wagerId: 'asc' }, { legIndex: 'asc' }], select: { wagerId: true, legIndex: true, eventKey: true, marketKey: true, selectionKey: true, decimalOdds: true, line: true, ruleVersion: true, live: true } }) : [],
      // Only the conversation the customer can already see; internal and restricted notes stay compartmented.
      caseIds.length ? tx.supportCaseEvent.findMany({ where: { tenantId: actor.tenantId, supportCaseId: { in: caseIds }, visibility: 'CUSTOMER' }, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }], select: { supportCaseId: true, type: true, actorType: true, body: true, createdAt: true } }) : [],
      Promise.all(accountIds.map((accountId: string) => tx.balanceProjection.findFirst({ where: { tenantId: actor.tenantId, accountId }, orderBy: { version: 'desc' }, select: { accountId: true, postedMinor: true, pendingMinor: true, availableMinor: true, asOf: true } }))),
    ])
    return { request, player, credentials, consents, limits, selfExclusions, restrictions, sessions, devices, favorites, wagers, legs, cashOuts, payments, ledgerAccounts, balances: balances.filter(Boolean), statements, bonusAwards, redemptions, supportCases, caseEvents, disputes, privacyRequests, closures, verifications, notifications }
  }, { isolationLevel: 'RepeatableRead' })

  // Every disclosure of the copy is evidenced; a failed audit returns no data.
  await prisma.$transaction(async (tx: any) => {
    await appendCustomerAudit(tx, { tenantId: actor.tenantId, playerId: actor.playerId, action: 'privacy.export_downloaded', targetType: 'CustomerPrivacyRequest', targetId: data.request.id, reason: data.request.type, payload: { generatedAt: generatedAt.toISOString(), sessionId: actor.sessionId } })
  })

  const { request, ...records } = data
  const body = JSON.parse(JSON.stringify({
    format: 'openfront-sportsbook.customer-data-export.v1',
    generatedAt: generatedAt.toISOString(),
    request: { id: request.id, type: request.type, requestedAt: iso(request.requestedAt), completedAt: iso(request.completedAt) },
    accountReference: actor.accountReference,
    excluded: ['password and token secrets', 'email and device digests', 'restricted compliance, AML and integrity records', 'internal staff notes', 'encrypted identity documents'],
    ...records,
  }))
  return { filename: `sportsbook-data-${request.type.toLowerCase()}-${request.id}.json`, body }
}
