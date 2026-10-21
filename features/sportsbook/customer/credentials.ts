import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto'
import type { PrismaClient } from '../../keystone/prisma'
import { resolveSandboxBrand, resolveSandboxTenant } from '../api/sandbox-tenant'
import { provisionSandboxInTransaction } from '../api/sandbox-domain'
import { evidenceHash } from '../domain/engine'
import { isRetryableTransactionError, transactionBackoff } from '../domain/transaction'
import { sendCustomerRecoveryEmail } from '../../keystone/lib/mail'
import { appendCustomerAudit } from './audit'
import {
  assertCurrentCustomerActor,
  CUSTOMER_SESSION_MAX_AGE_SECONDS,
  digestCustomerToken,
  newCustomerToken,
  type CustomerActor,
} from './auth'
import { CustomerError, assertSandboxEnabled } from './errors'
import { resolveTenantCurrency } from './currency'

const derivePassword = (password: string, salt: Buffer, length: number) => new Promise<Buffer>((resolve, reject) => {
  scryptCallback(password, salt, length, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }, (error, derived) => error ? reject(error) : resolve(derived as Buffer))
})
const MAX_FAILED_ATTEMPTS = 5
const LOCK_MS = 15 * 60_000
const DUMMY_PASSWORD_HASH = 'scrypt$v1$BwcHBwcHBwcHBwcHBwcHBw$PwrbhqcmnULvCstrBom26QDz6e3onYku5pcBKfAgAeP7hqYXcPhorADBuD4ZTVohzUNXCw6CKKACR9BTllqusA'

function identitySecret() {
  const configured = process.env.CUSTOMER_IDENTITY_SECRET
  if (configured && configured.length >= 32) return configured
  if (process.env.NODE_ENV === 'production') throw new Error('CUSTOMER_IDENTITY_SECRET_REQUIRED')
  return 'local-sandbox-customer-identity-secret-only'
}

export function normalizeEmail(value: unknown) {
  const email = String(value ?? '').trim().toLowerCase()
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new CustomerError('INVALID_EMAIL', 400)
  return email
}

/**
 * Identity digests are tenant-scoped: the same human may hold separate accounts with
 * separate operators, and one tenant's registrations never reveal or block another's.
 * The tenant-less form is the legacy digest, read only for rows created before scoping.
 */
export function emailDigest(email: string, tenantId?: string) {
  return createHmac('sha256', identitySecret()).update(tenantId ? `${tenantId}\u0000${email}` : email).digest('hex')
}

async function findTenantCredential(db: any, tenantId: string, email: string) {
  const scoped = await db.customerCredential.findUnique({ where: { emailDigest: emailDigest(email, tenantId) } })
  if (scoped) return scoped.tenantId === tenantId ? scoped : null
  const legacy = await db.customerCredential.findUnique({ where: { emailDigest: emailDigest(email) } })
  return legacy && legacy.tenantId === tenantId ? legacy : null
}

/** The operator-published terms revision (BrandLocale) a registering customer must affirmatively accept. */
export async function resolveCustomerTerms(db: any, tenantId: string) {
  const brand = await resolveSandboxBrand(db, tenantId)
  const terms = await db.brandLocale.findFirst({
    where: { tenantId, brandId: brand.id, status: 'ACTIVE', termsVersion: { not: '' }, termsContentHash: { not: '' } },
    orderBy: [{ default: 'desc' }, { createdAt: 'asc' }],
    select: { locale: true, termsVersion: true, termsContentHash: true },
  })
  if (!terms) throw new CustomerError('TERMS_UNAVAILABLE', 503)
  return terms as { locale: string; termsVersion: string; termsContentHash: string }
}

/** Failed-attempt counting and lockout under a row lock, so concurrent failures cannot skip the threshold. */
async function recordFailedAttempt(prisma: PrismaClient, credentialId: string, now: Date) {
  await prisma.$transaction(async tx => {
    await tx.$queryRaw`SELECT id FROM "CustomerCredential" WHERE id = ${credentialId} FOR UPDATE`
    const current = await tx.customerCredential.findUnique({ where: { id: credentialId } })
    if (!current || current.status === 'CLOSED') return
    const attempts = Number(current.failedAttempts ?? 0) + 1
    await tx.customerCredential.update({ where: { id: current.id }, data: { failedAttempts: attempts, ...(attempts >= MAX_FAILED_ATTEMPTS ? { status: 'LOCKED', lockedUntil: new Date(now.getTime() + LOCK_MS) } : {}) } })
  })
}

export function maskEmail(email: string) {
  const [local, domain] = email.split('@')
  return `${local.slice(0, 2)}${'*'.repeat(Math.max(2, Math.min(8, local.length - 2)))}@${domain}`
}

export function validateCustomerPassword(value: unknown, email?: string) {
  const password = String(value ?? '')
  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter(pattern => pattern.test(password)).length
  const local = email?.split('@')[0] ?? ''
  if (password.length < 12 || password.length > 128 || classes < 3 || (local.length >= 4 && password.toLowerCase().includes(local))) {
    throw new CustomerError('WEAK_PASSWORD', 400)
  }
  return password
}

export async function hashCustomerPassword(password: string) {
  const salt = randomBytes(16)
  const derived = await derivePassword(password, salt, 64)
  return `scrypt$v1$${salt.toString('base64url')}$${derived.toString('base64url')}`
}

export async function verifyCustomerPassword(password: string, encoded: string) {
  const [algorithm, version, saltText, hashText] = encoded.split('$')
  if (algorithm !== 'scrypt' || version !== 'v1' || !saltText || !hashText) return false
  const expected = Buffer.from(hashText, 'base64url')
  const actual = await derivePassword(password, Buffer.from(saltText, 'base64url'), expected.length)
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}

function deviceDigest(value: string) {
  return createHmac('sha256', identitySecret()).update(value).digest('hex')
}

function deviceInput(request: Request) {
  const supplied = request.headers.get('x-openfront-device-id') ?? ''
  const userAgent = request.headers.get('user-agent') ?? 'unknown'
  const stable = /^[A-Za-z0-9_-]{16,128}$/.test(supplied) ? supplied : evidenceHash(userAgent)
  return { digest: deviceDigest(stable), label: userAgent.slice(0, 120) || 'Browser' }
}

async function createOwnedSession(tx: any, tenantId: string, playerId: string, request: Request, assuranceLevel: 'PASSWORD' | 'MFA' = 'PASSWORD') {
  const token = newCustomerToken()
  const device = deviceInput(request)
  const now = new Date()
  const session = await tx.customerSession.create({ data: {
    tenantId, playerId, tokenDigest: digestCustomerToken(token), assuranceLevel,
    deviceDigest: device.digest, lastSeenAt: now,
    expiresAt: new Date(now.getTime() + CUSTOMER_SESSION_MAX_AGE_SECONDS * 1000),
  } })
  await tx.customerDevice.create({ data: {
    tenantId, playerId, sessionId: session.id, deviceDigest: device.digest, label: device.label,
    firstSeenAt: now, lastSeenAt: now, riskSignals: { assuranceLevel },
  } })
  return { token, session }
}

export async function registerCredentialCustomer(
  prisma: PrismaClient,
  request: Request,
  input: { email: unknown; password: unknown; locale?: unknown; timezone?: unknown; marketingConsent?: unknown; acceptedTermsVersion?: unknown; acceptedTermsContentHash?: unknown },
) {
  assertSandboxEnabled()
  const email = normalizeEmail(input.email)
  const password = validateCustomerPassword(input.password, email)
  const tenant = await resolveSandboxTenant(prisma)
  const acceptedTermsVersion = String(input.acceptedTermsVersion ?? '')
  const acceptedTermsContentHash = String(input.acceptedTermsContentHash ?? '')
  if (!acceptedTermsVersion || !acceptedTermsContentHash) throw new CustomerError('TERMS_ACCEPTANCE_REQUIRED', 400)
  if (await findTenantCredential(prisma, tenant.id, email)) throw new CustomerError('ACCOUNT_EXISTS', 409)
  const digest = emailDigest(email, tenant.id)
  const passwordHash = await hashCustomerPassword(password)
  const subject = `customer_${randomBytes(24).toString('base64url')}`
  const locale = String(input.locale ?? 'en-US').slice(0, 20)
  const timezone = String(input.timezone ?? 'UTC').slice(0, 64)
  const marketingConsent = input.marketingConsent === true

  // Provisioning, credential, consent evidence, session and audit commit as one unit:
  // a duplicate or failed registration leaves no unowned player, accounts or fixtures behind.
  for (let attempt = 0; ; attempt++) {
    try {
      const created = await prisma.$transaction(async tx => {
        const provisioned = await provisionSandboxInTransaction(tx, subject)
        if (provisioned.tenant.id !== tenant.id) throw new CustomerError('ACCOUNT_UNAVAILABLE', 409)
        if (await findTenantCredential(tx, tenant.id, email)) throw new CustomerError('ACCOUNT_EXISTS', 409)
        const terms = await resolveCustomerTerms(tx, tenant.id)
        if (terms.termsVersion !== acceptedTermsVersion || terms.termsContentHash !== acceptedTermsContentHash) throw new CustomerError('TERMS_CHANGED', 409)
        const player = await tx.player.update({ where: { id: provisioned.player.id }, data: { locale, timezone, marketingAllowed: marketingConsent, kycStatus: 'REQUIRED' } })
        // Email ownership is not proven by typing it, so the credential starts unverified.
        const credential = await tx.customerCredential.create({ data: {
          tenantId: tenant.id, playerId: player.id, emailDigest: digest, emailMasked: maskEmail(email),
          passwordHash, status: 'ACTIVE', verifiedAt: null, failedAttempts: 0,
        } })
        const acceptedAt = new Date()
        const accepted = [
          { type: 'TERMS', policyVersion: terms.termsVersion, contentHash: terms.termsContentHash },
          { type: 'PRIVACY', policyVersion: terms.termsVersion, contentHash: terms.termsContentHash },
          ...(marketingConsent ? [{ type: 'MARKETING', policyVersion: terms.termsVersion, contentHash: terms.termsContentHash }] : []),
        ]
        for (const consent of accepted) {
          await tx.consent.create({ data: { tenantId: tenant.id, playerId: player.id, type: consent.type, policyVersion: consent.policyVersion, givenAt: acceptedAt, evidenceHash: evidenceHash({ playerId: player.id, type: consent.type, policyVersion: consent.policyVersion, contentHash: consent.contentHash, termsLocale: terms.locale, acceptedAt: acceptedAt.toISOString(), action: 'REGISTRATION_AFFIRMATIVE_CHECKBOX' }) } })
        }
        const owned = await createOwnedSession(tx, tenant.id, player.id, request)
        await appendCustomerAudit(tx, { tenantId: tenant.id, playerId: player.id, action: 'customer.credential_registered', targetType: 'CustomerCredential', targetId: credential.id, reason: 'PASSWORD_REGISTRATION', payload: { emailDigest: digest, locale, timezone, marketingConsent, termsVersion: terms.termsVersion, termsContentHash: terms.termsContentHash, sessionId: owned.session.id } })
        return { ...owned, player, credential, currency: provisioned.currency }
      }, { isolationLevel: 'Serializable' })
      return { token: created.token, actor: { sessionId: created.session.id, tenantId: tenant.id, playerId: created.player.id, accountReference: created.session.id.slice(-8).toUpperCase(), assuranceLevel: 'PASSWORD', currency: created.currency } satisfies CustomerActor, emailMasked: created.credential.emailMasked }
    } catch (error) {
      if ((error as { code?: string })?.code === 'P2002') throw new CustomerError('ACCOUNT_EXISTS', 409)
      if (attempt < 4 && isRetryableTransactionError(error)) { await transactionBackoff(attempt); continue }
      throw error
    }
  }
}

export async function loginCredentialCustomer(prisma: PrismaClient, request: Request, input: { email: unknown; password: unknown }) {
  assertSandboxEnabled()
  const email = normalizeEmail(input.email)
  const rawPassword = String(input.password ?? '')
  // Bound input before the memory-hard KDF; registration never accepts more than 128 characters.
  const oversized = rawPassword.length > 128
  const password = oversized ? '' : rawPassword
  const tenant = await resolveSandboxTenant(prisma)
  const credential = await findTenantCredential(prisma, tenant.id, email)
  const now = new Date()
  const scopedCredential = credential && credential.status !== 'CLOSED' ? credential : null
  const passwordValid = await verifyCustomerPassword(password, scopedCredential?.passwordHash ?? DUMMY_PASSWORD_HASH)
  if (!scopedCredential || !passwordValid || oversized) {
    if (scopedCredential) await recordFailedAttempt(prisma, scopedCredential.id, now)
    throw new CustomerError('INVALID_CREDENTIALS', 401)
  }
  const currency = await resolveTenantCurrency(prisma, tenant.id)

  return prisma.$transaction(async tx => {
    // Issue only against the exact credential revision whose password was verified:
    // a concurrent recovery, closure or lockout wins over this stale preflight.
    await tx.$queryRaw`SELECT id FROM "CustomerCredential" WHERE id = ${scopedCredential.id} FOR UPDATE`
    const current = await tx.customerCredential.findUnique({ where: { id: scopedCredential.id }, include: { player: true } })
    if (!current || current.tenantId !== tenant.id || current.playerId !== scopedCredential.playerId || current.status === 'CLOSED' ||
        current.passwordHash !== scopedCredential.passwordHash || Number(current.passwordVersion ?? 1) !== Number(scopedCredential.passwordVersion ?? 1)) {
      throw new CustomerError('INVALID_CREDENTIALS', 401)
    }
    if (current.status === 'LOCKED' && current.lockedUntil && current.lockedUntil > now) throw new CustomerError('ACCOUNT_LOCKED', 423)
    if (!current.player || current.player.tenantId !== tenant.id || current.player.status !== 'ACTIVE') throw new CustomerError('ACCOUNT_UNAVAILABLE', 403)
    const owned = await createOwnedSession(tx, tenant.id, current.player.id, request)
    await tx.customerCredential.update({ where: { id: current.id }, data: { status: current.status === 'LOCKED' ? 'ACTIVE' : current.status, failedAttempts: 0, lockedUntil: null, lastAuthenticatedAt: now } })
    await appendCustomerAudit(tx, { tenantId: tenant.id, playerId: current.player.id, action: 'customer.authenticated', targetType: 'CustomerSession', targetId: owned.session.id, reason: 'PASSWORD', payload: { deviceDigest: owned.session.deviceDigest } })
    return { token: owned.token, actor: { sessionId: owned.session.id, tenantId: tenant.id, playerId: current.player.id, accountReference: owned.session.id.slice(-8).toUpperCase(), assuranceLevel: 'PASSWORD', currency: currency.code } satisfies CustomerActor, emailMasked: current.emailMasked }
  }, { isolationLevel: 'Serializable' })
}

export async function requestCustomerRecovery(prisma: PrismaClient, input: { email: unknown }) {
  assertSandboxEnabled()
  const email = normalizeEmail(input.email)
  const tenant = await resolveSandboxTenant(prisma)
  const credential = await findTenantCredential(prisma, tenant.id, email)
  // The response is identical whether or not the account exists, and never carries the
  // recovery credential: only the account's mailbox receives it. Issuance and delivery run
  // after the response so mail latency or outage cannot reveal which addresses exist.
  if (credential && credential.status !== 'CLOSED') {
    void issueCustomerRecovery(prisma, tenant.id, credential, email).catch(() => console.error('Customer recovery could not be issued.'))
  }
  return { accepted: true as const }
}

async function issueCustomerRecovery(prisma: PrismaClient, tenantId: string, credential: { playerId: string; emailMasked: string }, email: string) {
  const token = newCustomerToken()
  const tokenDigest = digestCustomerToken(token)
  const expiresAt = new Date(Date.now() + 15 * 60_000)
  await prisma.customerRecoveryToken.create({ data: { tenantId, playerId: credential.playerId, tokenDigest, purpose: 'RESET_PASSWORD', expiresAt, attempts: 0 } })
  let delivered = false
  try { await sendCustomerRecoveryEmail(token, email); delivered = true }
  catch { console.error('Customer recovery email could not be sent.') }
  // Record the actual delivery outcome (no token, only its digest reference).
  await prisma.notification.create({ data: { tenantId, playerId: credential.playerId, channel: 'EMAIL', templateKey: 'customer.password-reset', templateVersion: 'v1', locale: 'en-US', payload: { emailMasked: credential.emailMasked, recoveryTokenReference: tokenDigest }, status: delivered ? 'SENT' : 'FAILED', sentAt: delivered ? new Date() : null } })
}

export async function completeCustomerRecovery(prisma: PrismaClient, input: { token: unknown; password: unknown }) {
  assertSandboxEnabled()
  const token = String(input.token ?? '')
  if (!/^[A-Za-z0-9_-]{40,128}$/.test(token)) throw new CustomerError('INVALID_RECOVERY_TOKEN', 400)
  const record = await prisma.customerRecoveryToken.findUnique({ where: { tokenDigest: digestCustomerToken(token) }, include: { player: true } })
  if (!record?.player || record.purpose !== 'RESET_PASSWORD' || record.consumedAt || record.expiresAt <= new Date()) throw new CustomerError('INVALID_RECOVERY_TOKEN', 400)
  const tenant = await resolveSandboxTenant(prisma)
  if (record.tenantId !== tenant.id || record.player.tenantId !== tenant.id) throw new CustomerError('INVALID_RECOVERY_TOKEN', 400)
  const password = validateCustomerPassword(input.password)
  const passwordHash = await hashCustomerPassword(password)
  await prisma.$transaction(async tx => {
    const consumedAt = new Date()
    const claimed = await tx.customerRecoveryToken.updateMany({
      where: { id: record.id, tenantId: record.tenantId, playerId: record.playerId, purpose: 'RESET_PASSWORD', consumedAt: null, expiresAt: { gt: consumedAt } },
      data: { consumedAt },
    })
    if (claimed.count !== 1) throw new CustomerError('INVALID_RECOVERY_TOKEN', 400)

    await tx.$queryRaw`SELECT id FROM "CustomerCredential" WHERE tenant = ${record.tenantId} AND player = ${record.playerId} FOR UPDATE`
    const credential = await tx.customerCredential.findFirst({ where: { tenantId: record.tenantId, playerId: record.playerId } })
    // Recovery restores a locked credential; it never reopens a closed one.
    if (!credential || credential.status === 'CLOSED') throw new CustomerError('INVALID_RECOVERY_TOKEN', 400)
    await tx.customerCredential.update({ where: { id: credential.id }, data: { passwordHash, passwordVersion: { increment: 1 }, status: credential.status === 'LOCKED' ? 'ACTIVE' : credential.status, failedAttempts: 0, lockedUntil: null } })
    // New credential generation: every other outstanding recovery token for this owner is superseded,
    // and every existing session and its device record stop authorizing.
    await tx.customerRecoveryToken.updateMany({ where: { tenantId: record.tenantId, playerId: record.playerId, purpose: 'RESET_PASSWORD', consumedAt: null }, data: { consumedAt } })
    await tx.customerSession.updateMany({ where: { tenantId: record.tenantId, playerId: record.playerId, revokedAt: null }, data: { revokedAt: consumedAt } })
    await tx.customerDevice.updateMany({ where: { tenantId: record.tenantId, playerId: record.playerId, revokedAt: null }, data: { revokedAt: consumedAt } })
    await appendCustomerAudit(tx, { tenantId: record.tenantId, playerId: record.playerId, action: 'customer.password_recovered', targetType: 'Player', targetId: record.playerId, reason: 'RECOVERY_TOKEN', payload: { passwordVersion: Number(credential.passwordVersion ?? 1) + 1 } })
  }, { isolationLevel: 'Serializable' })
  return { completed: true as const }
}

const DEVICE_PAGE_SIZE = 30

export async function listCustomerDevices(prisma: PrismaClient, actor: CustomerActor, input: { cursor?: unknown } = {}) {
  // These rows are sign-in sessions labelled with the browser's self-reported User-Agent, not proof of a
  // physical device. State is derived from the linked session's own revocation and expiry.
  const now = new Date()
  // Owner-checked keyset cursor (firstSeenAt desc, id desc) so older sign-ins stay reachable and revocable.
  const cursor = typeof input.cursor === 'string' && input.cursor.trim() ? input.cursor.trim() : undefined
  if (cursor && (!/^[A-Za-z0-9_-]{1,64}$/.test(cursor) || !(await prisma.customerDevice.findFirst({ where: { id: cursor, tenantId: actor.tenantId, playerId: actor.playerId }, select: { id: true } })))) throw new CustomerError('INVALID_CURSOR', 400)
  const found = await prisma.customerDevice.findMany({ where: { tenantId: actor.tenantId, playerId: actor.playerId }, include: { session: { select: { revokedAt: true, expiresAt: true } } }, orderBy: [{ firstSeenAt: 'desc' }, { id: 'desc' }], take: DEVICE_PAGE_SIZE + 1, ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}) })
  const rows = found.slice(0, DEVICE_PAGE_SIZE)
  return { nextCursor: found.length > DEVICE_PAGE_SIZE ? rows[rows.length - 1]?.id ?? null : null, devices: rows.map(row => {
    const revoked = Boolean(row.revokedAt || row.session?.revokedAt)
    const expired = !revoked && Boolean(row.session && row.session.expiresAt <= now)
    const current = row.sessionId === actor.sessionId
    return { id: row.id, label: row.label, firstSeenAt: row.firstSeenAt.toISOString(), lastSeenAt: row.lastSeenAt.toISOString(), signedInAt: row.firstSeenAt.toISOString(), expiresAt: row.session?.expiresAt.toISOString() ?? null, current, revoked: revoked || expired, state: revoked ? 'REVOKED' : expired ? 'EXPIRED' : current ? 'CURRENT' : 'ACTIVE' }
  }) }
}

export async function revokeCustomerDevice(prisma: PrismaClient, actor: CustomerActor, deviceId: unknown) {
  const id = String(deviceId ?? '')
  // The revoking session must itself still be current (servicing: sign-out stays available during a pause).
  await assertCurrentCustomerActor(prisma, actor, false, new Date(), true)
  const device = await prisma.customerDevice.findFirst({ where: { id, tenantId: actor.tenantId, playerId: actor.playerId, revokedAt: null } })
  if (!device) throw new CustomerError('DEVICE_NOT_FOUND', 404)
  await prisma.$transaction(async tx => {
    await tx.customerDevice.update({ where: { id }, data: { revokedAt: new Date() } })
    if (device.sessionId) await tx.customerSession.updateMany({ where: { id: device.sessionId, tenantId: actor.tenantId, playerId: actor.playerId }, data: { revokedAt: new Date() } })
    await appendCustomerAudit(tx, { tenantId: actor.tenantId, playerId: actor.playerId, action: 'customer.device_revoked', targetType: 'CustomerDevice', targetId: id, reason: 'CUSTOMER_ACTION', payload: { current: device.sessionId === actor.sessionId } })
  })
  return { revoked: true as const, current: device.sessionId === actor.sessionId }
}
