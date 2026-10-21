import { createHash, randomBytes } from 'node:crypto'
import type { Prisma, PrismaClient } from '../../keystone/prisma'
import { CustomerError } from './errors'
import { resolveTenantCurrency } from './currency'
import { bootstrapCustomerSessionTenant } from '../../keystone/identity-bootstrap'
import { enterTenantScope, runWithTenantScope } from '../../keystone/tenant-scope'

export const CUSTOMER_COOKIE = 'openfront_customer'
export const CUSTOMER_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7

export type CustomerActor = {
  sessionId: string
  tenantId: string
  playerId: string
  accountReference: string
  assuranceLevel?: 'GUEST' | 'PASSWORD' | 'MFA'
  currency?: string
}

export const digestCustomerToken = (token: string) =>
  createHash('sha256').update(token).digest('hex')

export const newCustomerToken = () => randomBytes(32).toString('base64url')

function cookieValue(request: Request, name: string) {
  const cookie = request.headers.get('cookie') ?? ''
  for (const part of cookie.split(';')) {
    const [key, ...value] = part.trim().split('=')
    if (key === name) return decodeURIComponent(value.join('='))
  }
  return null
}

export function customerCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge: CUSTOMER_SESSION_MAX_AGE_SECONDS,
  }
}

type SessionEvidence = {
  id: string; tenantId: string | null; playerId: string | null
  expiresAt: Date; revokedAt: Date | null; assuranceLevel: CustomerActor['assuranceLevel'] | null
  tenant: { id: string; status: string | null } | null
  player: { id: string; tenantId: string | null; status: string | null } | null
}

/**
 * Identity validity is separate from new-business admission. `servicing` sessions belong to an owner whose
 * account or operator is paused/closed: they may still read their own receipts, limits and statements, open
 * support/privacy cases, set protections and sign out, but every new wager/deposit path keeps requiring ACTIVE.
 */
const SERVICING_STATUSES = new Set(['ACTIVE', 'SUSPENDED', 'CLOSED'])
function validatedSession(session: SessionEvidence | null, now: Date, servicing = false) {
  if (
    !session?.tenant || !session.player ||
    !session.tenantId || !session.playerId ||
    session.tenantId !== session.tenant.id ||
    session.playerId !== session.player.id ||
    session.player.tenantId !== session.tenantId ||
    session.revokedAt || !(session.expiresAt instanceof Date) || !Number.isFinite(session.expiresAt.getTime()) ||
    session.expiresAt <= now ||
    (servicing ? !SERVICING_STATUSES.has(session.tenant.status ?? '') : session.tenant.status !== 'ACTIVE') ||
    (servicing ? !SERVICING_STATUSES.has(session.player.status ?? '') : session.player.status !== 'ACTIVE')
  ) throw new CustomerError('AUTHENTICATION_REQUIRED', 401)
  return { ...session, tenant: session.tenant, player: session.player }
}

/** Stored actors/receipts are not authority. Share locks join consequential transactions. */
export async function assertCurrentCustomerActor(
  prisma: Pick<PrismaClient, 'customerSession' | '$queryRaw' | 'tenantCurrency' | 'configValue'>,
  actor: CustomerActor,
  lock = false,
  now = new Date(),
  servicing = false,
) {
  if (!actor.sessionId || !actor.tenantId || !actor.playerId) throw new CustomerError('AUTHENTICATION_REQUIRED', 401)
  if (lock) {
    await prisma.$queryRaw`SELECT set_config('app.tenant_id', ${actor.tenantId}, true)`
    // Same order for all callers. Updates/moves/revocation contend with these row locks.
    await prisma.$queryRaw`SELECT id FROM "Tenant" WHERE id = ${actor.tenantId} FOR SHARE`
    await prisma.$queryRaw`SELECT id FROM "Player" WHERE id = ${actor.playerId} AND tenant = ${actor.tenantId} FOR SHARE`
    await prisma.$queryRaw`SELECT id FROM "CustomerSession" WHERE id = ${actor.sessionId} AND tenant = ${actor.tenantId} AND player = ${actor.playerId} FOR SHARE`
  }
  const session = validatedSession(await prisma.customerSession.findUnique({ where: { id: actor.sessionId }, include: { tenant: true, player: true } }), now, servicing)
  if (session.id !== actor.sessionId || session.tenantId !== actor.tenantId || session.playerId !== actor.playerId ||
      (actor.assuranceLevel && actor.assuranceLevel !== (session.assuranceLevel ?? 'GUEST'))) {
    throw new CustomerError('AUTHENTICATION_REQUIRED', 401)
  }
  const currency = await resolveTenantCurrency(prisma, session.tenant.id)
  if (actor.currency && currency.code !== actor.currency) throw new CustomerError('CUSTOMER_CURRENCY_CHANGED', 409)
}

export function withCurrentCustomer<T>(prisma: PrismaClient, actor: CustomerActor, work: (tx: Prisma.TransactionClient) => Promise<T>, servicing = false) {
  return prisma.$transaction(async tx => {
    await assertCurrentCustomerActor(tx, actor, true, new Date(), servicing)
    return work(tx)
  }, { isolationLevel: 'Serializable' })
}

export async function authenticateCustomerToken(
  prisma: PrismaClient,
  token: string,
  now = new Date(),
  servicing = false,
): Promise<CustomerActor> {
  if (!/^[A-Za-z0-9_-]{40,128}$/.test(token)) {
    throw new CustomerError('AUTHENTICATION_REQUIRED', 401)
  }

  // Pre-tenant discovery is limited to the one session row named by this token's digest; the full session,
  // player and tenant evidence is then read inside that tenant's own scope (no global identity lookup).
  const tokenDigest = digestCustomerToken(token)
  const tenantId = await bootstrapCustomerSessionTenant(prisma, tokenDigest)
  if (!tenantId) throw new CustomerError('AUTHENTICATION_REQUIRED', 401)
  const { session, currency } = await runWithTenantScope(tenantId, async () => {
    const session = validatedSession(await prisma.customerSession.findFirst({
      where: { tokenDigest, tenantId },
      include: { tenant: true, player: true },
    }), now, servicing)
    return { session, currency: await resolveTenantCurrency(prisma, session.tenant.id) }
  })
  // The rest of this customer request runs in the authenticated session's tenant scope.
  enterTenantScope(session.tenant.id)
  return {
    sessionId: session.id,
    tenantId: session.tenant.id,
    playerId: session.player.id,
    accountReference: session.id.slice(-8).toUpperCase(),
    assuranceLevel: session.assuranceLevel ?? 'GUEST',
    currency: currency.code,
  }
}

export async function authenticateCustomerRequest(prisma: PrismaClient, request: Request, servicing = false) {
  const token = cookieValue(request, CUSTOMER_COOKIE)
  if (!token) throw new CustomerError('AUTHENTICATION_REQUIRED', 401)
  return authenticateCustomerToken(prisma, token, new Date(), servicing)
}

/** Owned private servicing (receipts, statements, cases, protections, sign-out) that survives a business pause. */
export function authenticateCustomerServicingRequest(prisma: PrismaClient, request: Request) {
  return authenticateCustomerRequest(prisma, request, true)
}

export async function optionalCustomerRequest(prisma: PrismaClient, request: Request, servicing = false) {
  try {
    return await authenticateCustomerRequest(prisma, request, servicing)
  } catch (error) {
    if (error instanceof CustomerError && error.code === 'AUTHENTICATION_REQUIRED') return null
    throw error
  }
}

export async function revokeCustomerRequest(prisma: PrismaClient, request: Request) {
  const actor = await authenticateCustomerRequest(prisma, request, true)
  await prisma.customerSession.update({
    where: { id: actor.sessionId },
    data: { revokedAt: new Date() },
  })
}
