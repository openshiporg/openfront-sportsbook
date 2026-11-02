// Cash deposit at the retail cage/counter. The player requests an amount online and gets a reference code; the
// deposit stays PENDING until an operator confirms the cash was received (confirmCageDeposit), which posts the
// ledger journal and credits the wallet. Operators turn the option on by keeping an ACTIVE `manual` payment
// installation, and off by disabling it. Age, location, exclusion and deposit-limit checks run before the request.
import { randomBytes } from 'node:crypto'
import type { PrismaClient } from '../../keystone/prisma'
import { assertCurrentCustomerActor, type CustomerActor } from './auth'
import { currentGeoApproved, currentKycApproved } from './acceptance-gates'
import { appendCustomerAudit } from './audit'
import { resolveTenantCurrency } from './currency'
import { CustomerError, assertSandboxEnabled } from './errors'
import { assertDepositLimits, validateFundingAmount } from './funding'
import { validateIdempotencyKey } from './idempotency'

export type CageDepositResult = { state: 'PENDING'; duplicate: boolean; paymentId: string; reference: string; amountMinor: string; currency: string; currencyExponent: number }

const REFERENCE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
export const newCageReference = () => `CG-${Array.from(randomBytes(6), byte => REFERENCE_ALPHABET[byte % REFERENCE_ALPHABET.length]).join('')}`

/** The cage option is offered only while an ACTIVE manual installation exists for the operator. */
export async function cageDepositsEnabled(db: any, tenantId: string) {
  return Boolean(await db.providerConnection.findFirst({ where: { tenantId, adapterId: 'manual', status: 'ACTIVE' }, select: { id: true } }))
}

export async function requestCageDeposit(prisma: PrismaClient, actor: CustomerActor, input: { amountMinor: unknown; idempotencyKey: unknown }): Promise<CageDepositResult> {
  assertSandboxEnabled()
  const key = validateIdempotencyKey(input.idempotencyKey)
  const currency = await resolveTenantCurrency(prisma, actor.tenantId, 'DEPOSIT')
  const amount = validateFundingAmount(input.amountMinor, currency.exponent)
  const paymentKey = `cage:${actor.playerId}:${key}`
  return prisma.$transaction(async (tx: any) => {
    await assertCurrentCustomerActor(tx, actor, true)
    const base = { state: 'PENDING' as const, currency: currency.code, currencyExponent: currency.exponent }
    const existing = await tx.paymentIntent.findFirst({ where: { tenantId: actor.tenantId, playerId: actor.playerId, idempotencyKey: paymentKey } })
    if (existing) {
      if (String(existing.amountMinor) !== String(amount)) throw new CustomerError('IDEMPOTENCY_KEY_CONFLICT', 409)
      return { ...base, duplicate: true, paymentId: existing.id, reference: existing.providerSessionReference, amountMinor: existing.amountMinor }
    }
    const provider = await tx.providerConnection.findFirst({ where: { tenantId: actor.tenantId, adapterId: 'manual', status: 'ACTIVE' }, orderBy: { createdAt: 'asc' } })
    if (!provider) throw new CustomerError('CAGE_DEPOSITS_UNAVAILABLE', 409)
    const now = new Date()
    const player = await tx.player.findFirst({ where: { id: actor.playerId, tenantId: actor.tenantId, status: 'ACTIVE' } })
    if (!player) throw new CustomerError('ACCOUNT_UNAVAILABLE', 409)
    if (!await currentKycApproved(tx, actor.tenantId, player, now)) throw new CustomerError('KYC_REQUIRED', 422)
    if (!await currentGeoApproved(tx, actor.tenantId, actor.playerId, now)) throw new CustomerError('GEO_REQUIRED', 422)
    const [exclusion, restriction] = await Promise.all([
      tx.selfExclusion.findFirst({ where: { tenantId: actor.tenantId, playerId: actor.playerId, status: 'ACTIVE', startsAt: { lte: now }, OR: [{ endsAt: null }, { endsAt: { gt: now } }] } }),
      tx.accountRestriction.findFirst({ where: { tenantId: actor.tenantId, playerId: actor.playerId, status: 'ACTIVE', capability: { in: ['DEPOSIT', 'WAGER'] } } }),
    ])
    if (exclusion) throw new CustomerError('SELF_EXCLUDED', 422)
    if (restriction) throw new CustomerError('ACCOUNT_RESTRICTED', 422)
    await assertDepositLimits(tx, actor, amount, now)
    const reference = newCageReference()
    const intent = await tx.paymentIntent.create({ data: {
      tenantId: actor.tenantId, playerId: actor.playerId, providerConnectionId: provider.id, type: 'DEPOSIT', amountMinor: String(amount), feeMinor: '0', currency: currency.code,
      idempotencyKey: paymentKey, paymentMethodReference: 'cage-cash', providerSessionReference: reference, status: 'PENDING', completedAt: null,
      riskEvidence: { mode: 'CAGE_CASH', provider: { connectionId: provider.id, adapterId: provider.adapterId, adapterVersion: provider.adapterVersion, configReference: provider.configReference } },
    } })
    await tx.paymentAttempt.create({ data: { tenantId: actor.tenantId, paymentIntentId: intent.id, attempt: 1, externalReference: reference, status: 'PENDING', reasonCode: 'AWAITING_CASH' } })
    await appendCustomerAudit(tx, { tenantId: actor.tenantId, playerId: actor.playerId, action: 'customer.cage_deposit_requested', targetType: 'PaymentIntent', targetId: intent.id, reason: 'AWAITING_CASH', payload: { amountMinor: String(amount), currency: currency.code, reference } })
    return { ...base, duplicate: false, paymentId: intent.id, reference, amountMinor: String(amount) }
  }, { isolationLevel: 'Serializable' })
}
