import type { PrismaClient } from '../../keystone/prisma'
import { assertCurrentCustomerActor, type CustomerActor } from './auth'
import { appendCustomerAudit } from './audit'
import { CustomerError } from './errors'
import { claimCustomerCommand, commandResult, finishCustomerCommand, validateIdempotencyKey } from './idempotency'
import { evidenceHash } from '../domain/engine'
import { validTimeZone } from '../domain/zoned-time'
import { currentGeoApproved } from './acceptance-gates'
import { resolveCustomerTerms } from './credentials'
import { privacyExportAvailable } from './privacy-export'

const locales = new Set(['en-US', 'en-GB', 'fr-CA', 'es-US'])
const oddsFormats = new Set(['DECIMAL', 'AMERICAN', 'FRACTIONAL'])
const PAGE_SIZE = 20
const OPEN_WAGER_STATUSES = ['PENDING', 'DELAYED', 'ACCEPTED', 'OPEN', 'PARTIALLY_CASHED_OUT', 'GRADED'] as const
const UNRESOLVED_PAYMENT_STATUSES = ['PENDING', 'REVIEW', 'PROCESSING', 'UNKNOWN'] as const
const SUPPORT_CATEGORIES = new Set(['ACCOUNT', 'WAGER', 'PAYMENT', 'RESPONSIBLE_GAMING', 'PRIVACY', 'TECHNICAL'])
const DISPUTE_TOPICS = new Set(['SETTLEMENT', 'TERMS', 'CASH_OUT'])

/** Current, owned authority for private servicing; replays and new effects both pass through it. */
const servicingAuthority = (prisma: any, actor: CustomerActor) => assertCurrentCustomerActor(prisma, actor, false, new Date(), true)
const lockedServicingAuthority = (tx: any, actor: CustomerActor) => assertCurrentCustomerActor(tx, actor, true, new Date(), true)

/** Serialize duplicate submissions of one command: a later duplicate returns the first committed receipt. */
async function lockCommand(tx: any, commandId: string): Promise<any> {
  await tx.$queryRaw`SELECT id FROM "CustomerCommand" WHERE id = ${commandId} FOR UPDATE`
  const command = await tx.customerCommand.findUnique({ where: { id: commandId } })
  return command && command.status !== 'IN_PROGRESS' ? commandResult(command) ?? { state: command.status, duplicate: true } : null
}

function cursorText(value: unknown) {
  const text = typeof value === 'string' ? value.trim() : ''
  if (!text) return undefined
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(text)) throw new CustomerError('INVALID_CURSOR', 400)
  return text
}

export async function getCustomerProfile(prisma: PrismaClient, actor: CustomerActor) {
  await servicingAuthority(prisma, actor)
  const [player, credential, consents, verification, geo, devices] = await Promise.all([
    prisma.player.findFirst({ where: { id: actor.playerId, tenantId: actor.tenantId } }),
    prisma.customerCredential.findFirst({ where: { tenantId: actor.tenantId, playerId: actor.playerId } }),
    prisma.consent.findMany({ where: { tenantId: actor.tenantId, playerId: actor.playerId }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: 50 }),
    prisma.verificationCase.findMany({ where: { tenantId: actor.tenantId, playerId: actor.playerId }, orderBy: { createdAt: 'desc' }, take: 20 }),
    prisma.geoCheck.findFirst({ where: { tenantId: actor.tenantId, geoSession: { playerId: actor.playerId } }, orderBy: { checkedAt: 'desc' } }),
    prisma.customerDevice.findMany({ where: { tenantId: actor.tenantId, playerId: actor.playerId }, orderBy: { lastSeenAt: 'desc' }, take: 20 }),
  ])
  if (!player) throw new CustomerError('ACCOUNT_NOT_FOUND', 404)
  // Consent history is append-only: the newest row of a purpose is its current state; older rows are history.
  const latestByType = new Map<string, string>()
  for (const item of consents) if (!latestByType.has(item.type)) latestByType.set(item.type, item.id)
  const geoStatus = geo?.decision === 'ALLOW' ? (await currentGeoApproved(prisma, actor.tenantId, actor.playerId, new Date()) ? 'ALLOW' : 'EXPIRED') : geo?.decision ?? 'UNKNOWN'
  return { accountReference: actor.accountReference, assuranceLevel: actor.assuranceLevel ?? 'GUEST', emailMasked: credential?.emailMasked ?? null, status: player.status, locale: player.locale, timezone: player.timezone || 'UTC', preferredOddsFormat: player.preferredOddsFormat ?? 'DECIMAL', marketingAllowed: player.marketingAllowed, kycStatus: player.kycStatus, geoStatus, geoCheckedAt: geo?.checkedAt?.toISOString() ?? null, verification: verification.map(item => ({ id: item.id, type: item.type, status: item.status, evidenceReference: item.evidenceReference, expiresAt: item.expiresAt?.toISOString() ?? null, createdAt: item.createdAt.toISOString() })), consents: consents.map(item => ({ id: item.id, type: item.type, policyVersion: item.policyVersion, givenAt: item.givenAt?.toISOString() ?? null, withdrawnAt: item.withdrawnAt?.toISOString() ?? null, evidenceHash: item.evidenceHash, state: latestByType.get(item.type) !== item.id ? 'HISTORY' : item.withdrawnAt ? 'WITHDRAWN' : 'ACTIVE' })), devices: devices.map(item => ({ id: item.id, label: item.label, current: item.sessionId === actor.sessionId, firstSeenAt: item.firstSeenAt.toISOString(), lastSeenAt: item.lastSeenAt.toISOString(), revoked: Boolean(item.revokedAt) })) }
}

export async function updateCustomerProfile(prisma: PrismaClient, actor: CustomerActor, input: { locale?: unknown; timezone?: unknown; preferredOddsFormat?: unknown; marketingAllowed?: unknown; idempotencyKey: unknown }) {
  const idempotencyKey = validateIdempotencyKey(input.idempotencyKey)
  const locale = String(input.locale ?? 'en-US')
  const timezone = String(input.timezone ?? 'UTC')
  const preferredOddsFormat = String(input.preferredOddsFormat ?? 'DECIMAL').toUpperCase()
  const marketingAllowed = input.marketingAllowed === true
  // Time zones must be real IANA zones the runtime can format, not merely zone-shaped strings.
  if (!locales.has(locale) || !oddsFormats.has(preferredOddsFormat) || timezone.length > 64 || !validTimeZone(timezone)) throw new CustomerError('INVALID_PROFILE', 400)
  await servicingAuthority(prisma, actor)
  const claimed = await claimCustomerCommand(prisma, { tenantId: actor.tenantId, playerId: actor.playerId, type: 'PROFILE', idempotencyKey, request: { locale, timezone, preferredOddsFormat, marketingAllowed } })
  const stored = commandResult(claimed.command)
  if (stored && claimed.command.status !== 'IN_PROGRESS') return stored
  return prisma.$transaction(async tx => {
    await lockedServicingAuthority(tx, actor)
    const completed = await lockCommand(tx, claimed.command.id); if (completed) return completed
    const player = await tx.player.findFirst({ where: { id: actor.playerId, tenantId: actor.tenantId } })
    if (!player) throw new CustomerError('ACCOUNT_NOT_FOUND', 404)
    await tx.player.update({ where: { id: player.id }, data: { locale, timezone, preferredOddsFormat: preferredOddsFormat as 'DECIMAL' | 'AMERICAN' | 'FRACTIONAL', marketingAllowed } })
    const latestMarketing = await tx.consent.findFirst({ where: { tenantId: actor.tenantId, playerId: actor.playerId, type: 'MARKETING' }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] })
    const marketingActive = Boolean(latestMarketing && !latestMarketing.withdrawnAt)
    const now = new Date()
    if (marketingAllowed && !marketingActive) {
      // Grant against the operator-published terms revision the customer is shown, never a literal label.
      const terms = await resolveCustomerTerms(tx, actor.tenantId)
      await tx.consent.create({ data: { tenantId: actor.tenantId, playerId: actor.playerId, type: 'MARKETING', policyVersion: terms.termsVersion, givenAt: now, evidenceHash: evidenceHash({ playerId: actor.playerId, type: 'MARKETING', action: 'GRANT', policyVersion: terms.termsVersion, contentHash: terms.termsContentHash, locale: terms.locale, commandId: claimed.command.id }) } })
    }
    if (!marketingAllowed && marketingActive && latestMarketing) {
      // Withdrawal is a new immutable event linked to the grant it withdraws; the grant row is left untouched.
      await tx.consent.create({ data: { tenantId: actor.tenantId, playerId: actor.playerId, type: 'MARKETING', policyVersion: latestMarketing.policyVersion, givenAt: null, withdrawnAt: now, evidenceHash: evidenceHash({ playerId: actor.playerId, type: 'MARKETING', action: 'WITHDRAW', withdraws: latestMarketing.id, withdrawsEvidence: latestMarketing.evidenceHash, commandId: claimed.command.id }) } })
    }
    await appendCustomerAudit(tx, { tenantId: actor.tenantId, playerId: actor.playerId, action: 'customer.profile_updated', targetType: 'Player', targetId: actor.playerId, reason: 'CUSTOMER_ACTION', payload: { locale, timezone, preferredOddsFormat, marketingAllowed } })
    const result = { state: 'UPDATED', duplicate: claimed.duplicate, locale, timezone, preferredOddsFormat, marketingAllowed }
    await finishCustomerCommand(tx, claimed.command.id, 'SUCCEEDED', result)
    return result
  })
}

export async function getCustomerFavorites(prisma: PrismaClient, actor: CustomerActor) {
  await servicingAuthority(prisma, actor)
  const rows = await prisma.customerFavorite.findMany({ where: { tenantId: actor.tenantId, playerId: actor.playerId }, orderBy: { createdAt: 'desc' }, take: 100 })
  return { favorites: rows.map(row => ({ id: row.id, targetType: row.targetType, targetId: row.targetId, createdAt: row.createdAt.toISOString() })) }
}
export async function toggleCustomerFavorite(prisma: PrismaClient, actor: CustomerActor, input: { targetType: unknown; targetId: unknown; favorite: unknown }) {
  const targetType = String(input.targetType ?? '').toUpperCase()
  const targetId = String(input.targetId ?? '')
  if (!['SPORT', 'COMPETITION', 'EVENT', 'COMPETITOR'].includes(targetType) || !/^[A-Za-z0-9_-]{1,64}$/.test(targetId)) throw new CustomerError('INVALID_FAVORITE', 400)
  await assertCurrentCustomerActor(prisma, actor)
  const existing = await prisma.customerFavorite.findFirst({ where: { tenantId: actor.tenantId, playerId: actor.playerId, targetType: targetType as 'SPORT' | 'COMPETITION' | 'EVENT' | 'COMPETITOR', targetId } })
  if (input.favorite === false) { if (existing) await prisma.customerFavorite.delete({ where: { id: existing.id } }); return { favorite: false, targetType, targetId } }
  // Only the tenant's own catalog records can be saved; arbitrary or foreign identifiers are rejected.
  const target = targetType === 'EVENT' ? await prisma.event.findFirst({ where: { id: targetId, tenantId: actor.tenantId }, select: { id: true } })
    : targetType === 'COMPETITION' ? await prisma.competition.findFirst({ where: { id: targetId, tenantId: actor.tenantId }, select: { id: true } })
    : targetType === 'SPORT' ? await prisma.sport.findFirst({ where: { id: targetId, tenantId: actor.tenantId }, select: { id: true } })
    : await prisma.competitor.findFirst({ where: { id: targetId, tenantId: actor.tenantId }, select: { id: true } })
  if (!target) throw new CustomerError('FAVORITE_TARGET_NOT_FOUND', 404)
  const row = existing ?? await prisma.customerFavorite.create({ data: { tenantId: actor.tenantId, playerId: actor.playerId, targetType: targetType as 'SPORT' | 'COMPETITION' | 'EVENT' | 'COMPETITOR', targetId } })
  return { favorite: true, id: row.id, targetType, targetId }
}

/** Owned privacy cases, newest first, with customer-safe progress; completed access/export/portability requests can be downloaded. */
export async function getCustomerPrivacyRequests(prisma: PrismaClient, actor: CustomerActor, input: { cursor?: unknown } = {}) {
  await servicingAuthority(prisma, actor)
  const cursor = cursorText(input.cursor)
  if (cursor && !(await prisma.customerPrivacyRequest.findFirst({ where: { id: cursor, tenantId: actor.tenantId, playerId: actor.playerId }, select: { id: true } }))) throw new CustomerError('INVALID_CURSOR', 400)
  const rows = await prisma.customerPrivacyRequest.findMany({ where: { tenantId: actor.tenantId, playerId: actor.playerId }, orderBy: [{ requestedAt: 'desc' }, { id: 'desc' }], take: PAGE_SIZE + 1, ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}) })
  const page = rows.slice(0, PAGE_SIZE)
  return { requests: page.map(row => ({ id: row.id, type: row.type, status: row.status, requestedAt: row.requestedAt.toISOString(), dueAt: row.dueAt.toISOString(), completedAt: row.completedAt?.toISOString() ?? null, decisionReason: row.decisionReason || null, artifactAvailable: privacyExportAvailable(row) })), nextCursor: rows.length > PAGE_SIZE ? page[page.length - 1]?.id ?? null : null }
}

export async function requestCustomerPrivacy(prisma: PrismaClient, actor: CustomerActor, input: { type: unknown; details?: unknown; idempotencyKey: unknown }) {
  const type = String(input.type ?? '').toUpperCase()
  if (!['ACCESS', 'EXPORT', 'CORRECT', 'DELETE', 'RESTRICT', 'PORTABILITY'].includes(type)) throw new CustomerError('INVALID_PRIVACY_REQUEST', 400)
  const details = typeof input.details === 'string' ? input.details.trim().slice(0, 2000) : ''
  if (type === 'CORRECT' && details.length < 5) throw new CustomerError('CORRECTION_DETAILS_REQUIRED', 400)
  const idempotencyKey = validateIdempotencyKey(input.idempotencyKey)
  await servicingAuthority(prisma, actor)
  const claimed = await claimCustomerCommand(prisma, { tenantId: actor.tenantId, playerId: actor.playerId, type: 'PRIVACY', idempotencyKey, request: { type, details } })
  const stored = commandResult(claimed.command); if (stored && claimed.command.status !== 'IN_PROGRESS') return stored
  return prisma.$transaction(async tx => {
    await lockedServicingAuthority(tx, actor)
    const completed = await lockCommand(tx, claimed.command.id); if (completed) return completed
    const request = await tx.customerPrivacyRequest.create({ data: { tenantId: actor.tenantId, playerId: actor.playerId, type: type as any, status: 'OPEN', requestedAt: new Date(), dueAt: new Date(Date.now() + 30 * 86_400_000), identityEvidenceHash: evidenceHash({ playerId: actor.playerId, sessionId: actor.sessionId, assuranceLevel: actor.assuranceLevel }) } })
    // Correction details travel with an owned support case so staff can respond in the customer-visible conversation.
    if (details) {
      const support = await tx.supportCase.create({ data: { tenantId: actor.tenantId, playerId: actor.playerId, category: 'PRIVACY', priority: 'NORMAL', status: 'OPEN', subject: `Privacy ${type.toLowerCase()} request`, openedAt: new Date(), slaDueAt: request.dueAt } })
      await tx.supportCaseEvent.create({ data: { tenantId: actor.tenantId, supportCaseId: support.id, type: 'OPENED', actorType: 'PLAYER', actorId: actor.playerId, body: details, evidenceHash: evidenceHash({ privacyRequestId: request.id, details }), visibility: 'CUSTOMER' } })
    }
    await appendCustomerAudit(tx, { tenantId: actor.tenantId, playerId: actor.playerId, action: 'privacy.requested', targetType: 'CustomerPrivacyRequest', targetId: request.id, reason: type, payload: { dueAt: request.dueAt, assuranceLevel: actor.assuranceLevel, detailsProvided: Boolean(details) } })
    const result = { state: 'OPEN', duplicate: claimed.duplicate, requestId: request.id, type, dueAt: request.dueAt.toISOString() }
    await finishCustomerCommand(tx, claimed.command.id, 'SUCCEEDED', result)
    return result
  })
}

/**
 * Everything that must be resolved before an account can close, read from complete owned evidence across every
 * player ledger account and currency. A ledger account without a balance projection is unknown, never zero.
 */
async function closureBlockers(tx: any, actor: CustomerActor) {
  const accounts = await tx.ledgerAccount.findMany({ where: { tenantId: actor.tenantId, playerId: actor.playerId }, select: { id: true, key: true, currency: true } })
  const blockers: Array<{ code: string; detail?: string }> = []
  for (const account of accounts) {
    const projection = await tx.balanceProjection.findFirst({ where: { tenantId: actor.tenantId, accountId: account.id }, orderBy: { version: 'desc' } })
    if (!projection) { blockers.push({ code: 'BALANCE_UNAVAILABLE', detail: `${account.key} ${account.currency}` }); continue }
    const nonZero = [projection.postedMinor, projection.pendingMinor, projection.availableMinor].some(value => !/^-?\d+$/.test(value || '0') || BigInt(value || '0') !== 0n)
    if (nonZero) blockers.push({ code: account.key === 'PLAYER_BONUS' ? 'RESTRICTED_VALUE_REMAINS' : 'FUNDS_REMAIN', detail: `${account.key} ${account.currency}` })
  }
  const accountIds = accounts.map((account: { id: string }) => account.id)
  const [holds, payments, wagers, awards] = await Promise.all([
    accountIds.length ? tx.hold.count({ where: { tenantId: actor.tenantId, accountId: { in: accountIds }, status: 'ACTIVE' } }) : 0,
    tx.paymentIntent.count({ where: { tenantId: actor.tenantId, playerId: actor.playerId, status: { in: [...UNRESOLVED_PAYMENT_STATUSES] } } }),
    tx.wager.count({ where: { tenantId: actor.tenantId, playerId: actor.playerId, status: { in: [...OPEN_WAGER_STATUSES] } } }),
    tx.bonusAward.count({ where: { tenantId: actor.tenantId, playerId: actor.playerId, status: { in: ['AWARDED', 'ACTIVE'] } } }),
  ])
  if (holds) blockers.push({ code: 'ACTIVE_HOLDS', detail: String(holds) })
  if (payments) blockers.push({ code: 'PAYMENTS_IN_PROGRESS', detail: String(payments) })
  if (wagers) blockers.push({ code: 'OPEN_WAGERS', detail: String(wagers) })
  if (awards) blockers.push({ code: 'ACTIVE_PROMOTION_AWARDS', detail: String(awards) })
  return blockers
}

export async function getAccountClosure(prisma: PrismaClient, actor: CustomerActor) {
  await servicingAuthority(prisma, actor)
  const closure = await prisma.accountClosure.findFirst({ where: { tenantId: actor.tenantId, playerId: actor.playerId }, orderBy: [{ requestedAt: 'desc' }, { id: 'desc' }] })
  if (!closure) return { closure: null, blockers: [] }
  const blockers = closure.status === 'CLOSED' || closure.status === 'CANCELLED' ? [] : await closureBlockers(prisma, actor)
  return { closure: { id: closure.id, status: closure.status, reasonCode: closure.reasonCode, requestedAt: closure.requestedAt.toISOString(), completedAt: closure.completedAt?.toISOString() ?? null }, blockers }
}

export async function requestAccountClosure(prisma: PrismaClient, actor: CustomerActor, input: { reasonCode: unknown; idempotencyKey: unknown }) {
  const reasonCode = String(input.reasonCode ?? '').slice(0, 80)
  if (!reasonCode) throw new CustomerError('CLOSURE_REASON_REQUIRED', 400)
  const idempotencyKey = validateIdempotencyKey(input.idempotencyKey)
  await servicingAuthority(prisma, actor)
  const claimed = await claimCustomerCommand(prisma, { tenantId: actor.tenantId, playerId: actor.playerId, type: 'PROFILE', idempotencyKey, request: { action: 'CLOSE', reasonCode } })
  const stored = commandResult(claimed.command); if (stored && claimed.command.status !== 'IN_PROGRESS') return stored
  return prisma.$transaction(async tx => {
    await lockedServicingAuthority(tx, actor)
    const completed = await lockCommand(tx, claimed.command.id); if (completed) return completed
    // Exclusive player lock: every financial writer holds a share lock on this row, so closure and a concurrent
    // deposit/wager/withdrawal serialize instead of racing the balance snapshot.
    await tx.$queryRaw`SELECT id FROM "Player" WHERE id = ${actor.playerId} AND tenant = ${actor.tenantId} FOR UPDATE`
    const now = new Date()
    const blockers = await closureBlockers(tx, actor)
    const blocked = blockers.length > 0
    const evidence = evidenceHash({ playerId: actor.playerId, blockers, reasonCode, at: now.toISOString() })
    // A blocked closure is resumable: asking again re-checks the evidence and completes it once everything is resolved.
    const open = await tx.accountClosure.findFirst({ where: { tenantId: actor.tenantId, playerId: actor.playerId, status: { in: ['REQUESTED', 'REVIEW', 'BLOCKED_FUNDS'] } }, orderBy: [{ requestedAt: 'desc' }, { id: 'desc' }] })
    const closure = open
      ? await tx.accountClosure.update({ where: { id: open.id }, data: { status: blocked ? 'BLOCKED_FUNDS' : 'CLOSED', completedAt: blocked ? null : now, evidenceHash: evidence } })
      : await tx.accountClosure.create({ data: { tenantId: actor.tenantId, playerId: actor.playerId, requestedBy: actor.playerId, reasonCode, requestedAt: now, status: blocked ? 'BLOCKED_FUNDS' : 'CLOSED', completedAt: blocked ? null : now, evidenceHash: evidence } })
    const restriction = await tx.accountRestriction.findFirst({ where: { tenantId: actor.tenantId, playerId: actor.playerId, reasonCode: 'ACCOUNT_CLOSURE_REQUESTED', status: 'ACTIVE' } })
    if (!restriction) await tx.accountRestriction.create({ data: { tenantId: actor.tenantId, playerId: actor.playerId, capability: 'WAGER', reasonCode: 'ACCOUNT_CLOSURE_REQUESTED', startsAt: now, status: 'ACTIVE' } })
    if (!blocked) await tx.player.update({ where: { id: actor.playerId }, data: { status: 'CLOSED' } })
    await appendCustomerAudit(tx, { tenantId: actor.tenantId, playerId: actor.playerId, action: open ? 'account.closure_rechecked' : 'account.closure_requested', targetType: 'AccountClosure', targetId: closure.id, reason: reasonCode, payload: { blocked, blockers } })
    const result = { state: closure.status, duplicate: claimed.duplicate, closureId: closure.id, blocked, blockers }
    await finishCustomerCommand(tx, claimed.command.id, 'SUCCEEDED', result)
    return result
  }, { isolationLevel: 'Serializable' })
}

/** Owned support cases with their customer-visible conversation only (internal/restricted notes never leave). */
export async function getCustomerCases(prisma: PrismaClient, actor: CustomerActor, input: { cursor?: unknown } = {}) {
  await servicingAuthority(prisma, actor)
  const cursor = cursorText(input.cursor)
  if (cursor && !(await prisma.supportCase.findFirst({ where: { id: cursor, tenantId: actor.tenantId, playerId: actor.playerId }, select: { id: true } }))) throw new CustomerError('INVALID_CURSOR', 400)
  const rows = await prisma.supportCase.findMany({ where: { tenantId: actor.tenantId, playerId: actor.playerId }, orderBy: [{ openedAt: 'desc' }, { id: 'desc' }], take: PAGE_SIZE + 1, ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}) })
  const support = rows.slice(0, PAGE_SIZE)
  const disputeIds = support.map(item => item.disputeId).filter((id): id is string => Boolean(id))
  const [disputes, events] = await Promise.all([
    disputeIds.length ? prisma.dispute.findMany({ where: { tenantId: actor.tenantId, playerId: actor.playerId, id: { in: disputeIds } } }) : [],
    support.length ? prisma.supportCaseEvent.findMany({ where: { tenantId: actor.tenantId, supportCaseId: { in: support.map(item => item.id) }, visibility: 'CUSTOMER' }, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }], select: { id: true, supportCaseId: true, type: true, actorType: true, body: true, createdAt: true } }) : [],
  ])
  const disputeById = new Map(disputes.map(item => [item.id, item]))
  return {
    supportCases: support.map(item => {
      const dispute = item.disputeId ? disputeById.get(item.disputeId) : undefined
      return { id: item.id, wagerId: item.wagerId, paymentIntentId: item.paymentIntentId, disputeId: item.disputeId, category: item.category, status: item.status, subject: item.subject, openedAt: item.openedAt.toISOString(), resolvedAt: item.resolvedAt?.toISOString() ?? null, dispute: dispute ? { id: dispute.id, topic: dispute.category, status: dispute.status, resolution: dispute.resolution || null } : null, messages: events.filter(event => event.supportCaseId === item.id).map(event => ({ id: event.id, type: event.type, from: event.actorType === 'PLAYER' ? 'YOU' : 'SUPPORT', body: event.body, createdAt: event.createdAt.toISOString() })) }
    }),
    nextCursor: rows.length > PAGE_SIZE ? support[support.length - 1]?.id ?? null : null,
  }
}

/**
 * Open an owned support case. Wager disputes still create an immutable Dispute linked to the owned wager; account,
 * payment, safer-play, privacy and technical issues need no wager. Related resources must belong to this customer.
 */
export async function openCustomerDispute(prisma: PrismaClient, actor: CustomerActor, input: { wagerId?: unknown; paymentIntentId?: unknown; category: unknown; topic?: unknown; subject: unknown; details: unknown; idempotencyKey: unknown }) {
  const rawCategory = String(input.category ?? '').toUpperCase()
  // Older clients sent the dispute topic as the category; treat those as wager cases.
  const category = DISPUTE_TOPICS.has(rawCategory) ? 'WAGER' : rawCategory
  const topic = DISPUTE_TOPICS.has(rawCategory) ? rawCategory : String(input.topic ?? 'SETTLEMENT').toUpperCase()
  const wagerId = typeof input.wagerId === 'string' ? input.wagerId : '', paymentIntentId = typeof input.paymentIntentId === 'string' ? input.paymentIntentId : ''
  const subject = String(input.subject ?? '').trim().slice(0, 160), details = String(input.details ?? '').trim().slice(0, 4000)
  if (!SUPPORT_CATEGORIES.has(category) || !subject || details.length < 10) throw new CustomerError('INVALID_SUPPORT_CASE', 400)
  if (category === 'WAGER' && (!wagerId || !DISPUTE_TOPICS.has(topic))) throw new CustomerError('WAGER_REQUIRED', 400)
  if (category !== 'WAGER' && wagerId) throw new CustomerError('INVALID_SUPPORT_CASE', 400)
  if (category !== 'PAYMENT' && paymentIntentId) throw new CustomerError('INVALID_SUPPORT_CASE', 400)
  const idempotencyKey = validateIdempotencyKey(input.idempotencyKey)
  await servicingAuthority(prisma, actor)
  const claimed = await claimCustomerCommand(prisma, { tenantId: actor.tenantId, playerId: actor.playerId, type: 'DISPUTE', idempotencyKey, request: { category, topic: category === 'WAGER' ? topic : null, wagerId, paymentIntentId, subject, details } })
  const stored = commandResult(claimed.command); if (stored && claimed.command.status !== 'IN_PROGRESS') return stored
  return prisma.$transaction(async tx => {
    await lockedServicingAuthority(tx, actor)
    const completed = await lockCommand(tx, claimed.command.id); if (completed) return completed
    if (wagerId && !(await tx.wager.findFirst({ where: { id: wagerId, tenantId: actor.tenantId, playerId: actor.playerId }, select: { id: true } }))) throw new CustomerError('WAGER_NOT_FOUND', 404)
    if (paymentIntentId && !(await tx.paymentIntent.findFirst({ where: { id: paymentIntentId, tenantId: actor.tenantId, playerId: actor.playerId }, select: { id: true } }))) throw new CustomerError('PAYMENT_NOT_FOUND', 404)
    const evidenceHashValue = evidenceHash({ category, topic, wagerId, paymentIntentId, playerId: actor.playerId, subject, details })
    const dispute = category === 'WAGER' ? await tx.dispute.create({ data: { tenantId: actor.tenantId, playerId: actor.playerId, wagerId, category: topic, status: 'OPEN', evidence: { subject, customerStatement: details, evidenceHash: evidenceHashValue }, resolution: '' } }) : null
    if (dispute) await tx.disputeEvent.create({ data: { tenantId: actor.tenantId, disputeId: dispute.id, type: 'OPENED_BY_CUSTOMER', actorId: actor.playerId, evidenceHash: evidenceHashValue, details: { subject } } })
    const support = await tx.supportCase.create({ data: { tenantId: actor.tenantId, playerId: actor.playerId, wagerId: wagerId || null, paymentIntentId: paymentIntentId || null, disputeId: dispute?.id ?? null, category: category as any, priority: 'NORMAL', status: 'OPEN', subject, openedAt: new Date(), slaDueAt: new Date(Date.now() + 48 * 3_600_000) } })
    await tx.supportCaseEvent.create({ data: { tenantId: actor.tenantId, supportCaseId: support.id, type: 'OPENED', actorType: 'PLAYER', actorId: actor.playerId, body: details, evidenceHash: evidenceHashValue, visibility: 'CUSTOMER' } })
    await tx.outboxMessage.create({ data: { tenantId: actor.tenantId, aggregateType: dispute ? 'DISPUTE' : 'SUPPORT_CASE', aggregateId: dispute?.id ?? support.id, eventType: dispute ? 'dispute.opened.v1' : 'support_case.opened.v1', payload: { wagerId: wagerId || null, paymentIntentId: paymentIntentId || null, supportCaseId: support.id, evidenceHash: evidenceHashValue }, status: 'PENDING', attempts: 0, maxAttempts: 10, availableAt: new Date() } })
    await appendCustomerAudit(tx, { tenantId: actor.tenantId, playerId: actor.playerId, action: dispute ? 'dispute.opened' : 'support_case.opened', targetType: dispute ? 'Dispute' : 'SupportCase', targetId: dispute?.id ?? support.id, reason: category, payload: { wagerId: wagerId || null, paymentIntentId: paymentIntentId || null, supportCaseId: support.id, evidenceHash: evidenceHashValue } })
    const result = { state: 'OPEN', duplicate: claimed.duplicate, disputeId: dispute?.id ?? null, supportCaseId: support.id, wagerId: wagerId || null, evidenceHash: evidenceHashValue }
    await finishCustomerCommand(tx, claimed.command.id, 'SUCCEEDED', result)
    return result
  })
}

/** Customer reply inside an owned, still-open support case conversation. */
export async function replyToCustomerCase(prisma: PrismaClient, actor: CustomerActor, input: { supportCaseId: unknown; body: unknown; idempotencyKey: unknown }) {
  const supportCaseId = String(input.supportCaseId ?? ''), body = String(input.body ?? '').trim().slice(0, 4000)
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(supportCaseId) || body.length < 2) throw new CustomerError('INVALID_SUPPORT_REPLY', 400)
  const idempotencyKey = validateIdempotencyKey(input.idempotencyKey)
  await servicingAuthority(prisma, actor)
  const claimed = await claimCustomerCommand(prisma, { tenantId: actor.tenantId, playerId: actor.playerId, type: 'DISPUTE', idempotencyKey, request: { action: 'REPLY', supportCaseId, body } })
  const stored = commandResult(claimed.command); if (stored && claimed.command.status !== 'IN_PROGRESS') return stored
  return prisma.$transaction(async tx => {
    await lockedServicingAuthority(tx, actor)
    const completed = await lockCommand(tx, claimed.command.id); if (completed) return completed
    const supportCase = await tx.supportCase.findFirst({ where: { id: supportCaseId, tenantId: actor.tenantId, playerId: actor.playerId } })
    if (!supportCase) throw new CustomerError('SUPPORT_CASE_NOT_FOUND', 404)
    if (supportCase.status === 'CLOSED') throw new CustomerError('SUPPORT_CASE_CLOSED', 409)
    const event = await tx.supportCaseEvent.create({ data: { tenantId: actor.tenantId, supportCaseId, type: 'CUSTOMER_MESSAGE', actorType: 'PLAYER', actorId: actor.playerId, body, evidenceHash: evidenceHash({ supportCaseId, body, commandId: claimed.command.id }), visibility: 'CUSTOMER' } })
    if (supportCase.status === 'WAITING_CUSTOMER' || supportCase.status === 'RESOLVED') await tx.supportCase.update({ where: { id: supportCaseId }, data: { status: 'WAITING_OPERATOR', resolvedAt: null } })
    await appendCustomerAudit(tx, { tenantId: actor.tenantId, playerId: actor.playerId, action: 'support_case.customer_message', targetType: 'SupportCase', targetId: supportCaseId, reason: 'CUSTOMER_MESSAGE', payload: { eventId: event.id } })
    const result = { state: 'SENT', duplicate: claimed.duplicate, supportCaseId, messageId: event.id }
    await finishCustomerCommand(tx, claimed.command.id, 'SUCCEEDED', result)
    return result
  })
}
