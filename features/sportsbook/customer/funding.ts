import type { PrismaClient } from '../../keystone/prisma'
import { executePaymentProvider, getPaymentProviderStatus } from '../../keystone/utils/paymentProviderAdapter'
import { assertCurrentCustomerActor, type CustomerActor } from './auth'
import type { FundingResult } from './contracts'
import { CustomerError, assertSandboxEnabled } from './errors'
import { isRetryableTransactionError, transactionBackoff } from '../domain/transaction'
import { appendCustomerAudit } from './audit'
import { resolveTenantCurrency } from './currency'
import { captureChange, nextProjection, postedChange, releaseChange, reserveChange } from '../domain/balance'
import {
  claimCustomerCommand,
  commandResult,
  finishCustomerCommand,
  recordCustomerCommandProgress,
  validateIdempotencyKey,
} from './idempotency'

/**
 * Sandbox funding bounds are 5 to 500 major units of the wallet currency, scaled by the currency's
 * stored CurrencyDefinition.exponent (never an assumed two decimals).
 */
export function fundingBoundsMinor(exponent: number) {
  const scale = 10n ** BigInt(exponent)
  return { minMinor: 5n * scale, maxMinor: 500n * scale }
}

function validateFundingAmount(value: unknown, exponent: number) {
  const text = String(value ?? '')
  if (!/^\d{1,15}$/.test(text)) throw new CustomerError('INVALID_AMOUNT', 400)
  const amount = BigInt(text)
  const { minMinor, maxMinor } = fundingBoundsMinor(exponent)
  if (amount < minMinor || amount > maxMinor) throw new CustomerError('INVALID_AMOUNT', 400)
  return amount
}

const periodStart = (period: string, now: Date) => {
  const days = period === 'DAILY' ? 1 : period === 'WEEKLY' ? 7 : 30
  return new Date(now.getTime() - days * 86_400_000)
}

async function assertDepositLimits(tx: any, actor: CustomerActor, amount: bigint, now: Date) {
  const limits = await tx.playerLimit.findMany({
    where: {
      tenantId: actor.tenantId,
      playerId: actor.playerId,
      type: 'DEPOSIT',
      effectiveFrom: { lte: now },
      OR: [{ effectiveTo: null }, { effectiveTo: { gt: now } }],
    },
  })
  const currency = actor.currency ?? 'USD'
  for (const limit of limits) {
    // Money limits bind amount and currency together; usage in another currency is never converted 1:1.
    if (limit.currency && limit.currency !== currency) continue
    const deposited = await tx.paymentIntent.findMany({
      where: {
        tenantId: actor.tenantId,
        playerId: actor.playerId,
        type: 'DEPOSIT',
        currency,
        // In-flight and unresolved deposits reserve limit headroom until they are definitively failed.
        status: { in: ['SUCCEEDED', 'PROCESSING', 'PENDING', 'UNKNOWN'] },
        createdAt: { gte: periodStart(limit.period ?? 'DAILY', now) },
      },
      select: { amountMinor: true },
    })
    const total = deposited.reduce((sum: bigint, item: { amountMinor: string }) => sum + BigInt(item.amountMinor), 0n)
    if (total + amount > BigInt(limit.amountMinor)) throw new CustomerError('DEPOSIT_LIMIT_EXCEEDED', 422)
  }
}

async function serializable<T>(prisma: PrismaClient, fn: (tx: any) => Promise<T>) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await prisma.$transaction(fn, { isolationLevel: 'Serializable' })
    } catch (error) {
      if (attempt >= 6 || !isRetryableTransactionError(error)) throw error
      await transactionBackoff(attempt)
    }
  }
}

type FundingKind = 'DEPOSIT' | 'WITHDRAWAL'
export type DispatchOutcome = { status: 'SUCCEEDED' | 'FAILED' | 'UNKNOWN'; externalRef: string; reasonCode: string }

/** Intent states whose provider effect is not yet definitive; reserved funds and limit headroom stay held. */
const IN_FLIGHT = new Set(['PENDING', 'PROCESSING', 'UNKNOWN'])
/** Adapter refusals raised before any provider I/O. */
const PRE_DISPATCH_REFUSALS = new Set(['PAYMENT_PROVIDER_UNAVAILABLE', 'PAYMENT_ADAPTER_UNSUPPORTED', 'PAYMENT_ADAPTER_INVALID_CONFIG'])

function fundingResultFor(intent: any, duplicate: boolean, availableMinor: string | undefined, currencyExponent: number): FundingResult {
  const base = { duplicate, paymentId: intent.id, amountMinor: intent.amountMinor, currency: intent.currency, currencyExponent, ...(availableMinor === undefined ? {} : { availableMinor }) }
  if (intent.status === 'SUCCEEDED') return { state: 'SUCCEEDED', ...base }
  if (IN_FLIGHT.has(intent.status ?? '')) return { state: 'PENDING', ...base, pendingCode: intent.type === 'WITHDRAWAL' ? 'WITHDRAWAL_OUTCOME_PENDING' : 'DEPOSIT_OUTCOME_PENDING' }
  return { state: 'REJECTED', ...base, rejectionCode: intent.type === 'WITHDRAWAL' ? 'WITHDRAWAL_FAILED' : 'PAYMENT_FAILED' }
}

async function availableFor(tx: any, actor: CustomerActor, currency: string) {
  const cash = await tx.ledgerAccount.findFirst({ where: { tenantId: actor.tenantId, playerId: actor.playerId, key: 'PLAYER_CASH', currency } })
  if (!cash) return undefined
  const projection = await tx.balanceProjection.findFirst({ where: { tenantId: actor.tenantId, accountId: cash.id }, orderBy: { version: 'desc' } })
  return projection?.availableMinor ?? undefined
}

async function lockedProjection(tx: any, tenantId: string, accountId: string) {
  const current = await tx.balanceProjection.findFirst({ where: { tenantId, accountId }, orderBy: { version: 'desc' } })
  if (!current) return null
  await tx.$queryRaw`SELECT id FROM "BalanceProjection" WHERE id = ${current.id} FOR UPDATE`
  return tx.balanceProjection.findFirst({ where: { tenantId, accountId }, orderBy: { version: 'desc' } })
}

/** Dispatch only to the installation pinned on the prepared intent, with that attempt's stable provider key. */
export async function dispatchPinnedPayment(intent: any, provider: any, fresh: boolean): Promise<DispatchOutcome> {
  if (!provider) return { status: 'UNKNOWN', externalRef: '', reasonCode: 'PROVIDER_INSTALLATION_MISSING' }
  const snapshot = (intent.riskEvidence as any)?.provider
  if (snapshot && (snapshot.adapterId !== provider.adapterId || snapshot.adapterVersion !== provider.adapterVersion || snapshot.configReference !== provider.configReference)) {
    return { status: 'UNKNOWN', externalRef: '', reasonCode: 'PROVIDER_CONFIGURATION_CHANGED' }
  }
  try {
    const result = await executePaymentProvider(provider, { type: intent.type === 'DEPOSIT' ? 'deposit' : 'withdrawal', payload: { amountMinor: intent.amountMinor, currency: intent.currency } }, `${provider.id}:${intent.idempotencyKey}`)
    if (result.status === 'SUCCEEDED') return { status: 'SUCCEEDED', externalRef: result.externalRef, reasonCode: '' }
    if (result.status === 'FAILED') return { status: 'FAILED', externalRef: result.externalRef, reasonCode: 'PROVIDER_DECLINED' }
    return { status: 'UNKNOWN', externalRef: result.externalRef, reasonCode: 'PROVIDER_PENDING' }
  } catch (error) {
    const code = error instanceof Error ? error.message : ''
    // A refusal before I/O proves non-effect only for an attempt first dispatched by this request.
    if (fresh && PRE_DISPATCH_REFUSALS.has(code)) return { status: 'FAILED', externalRef: '', reasonCode: code }
    return { status: 'UNKNOWN', externalRef: '', reasonCode: PRE_DISPATCH_REFUSALS.has(code) ? code : 'PROVIDER_OUTCOME_UNKNOWN' }
  }
}

const isCustomerOrigin = (intent: any) => /^customer(-withdrawal)?:/.test(String(intent.idempotencyKey ?? ''))

/**
 * Apply one provider outcome to a locked, still in-flight intent: definitive success posts the journal and
 * captures/credits; definitive failure releases a withdrawal hold; anything else stays UNKNOWN with funds held.
 * Shared by the customer finalize step and the payment.unknown.v1 reconciliation consumer.
 */
async function applyPaymentOutcome(tx: any, current: any, outcome: DispatchOutcome, now: Date) {
  const tenantId = current.tenantId as string
  const amountMinor = BigInt(current.amountMinor)
  const [cash, clearing] = await Promise.all([
    tx.ledgerAccount.findFirst({ where: { tenantId, playerId: current.playerId, key: 'PLAYER_CASH', currency: current.currency } }),
    tx.ledgerAccount.findFirst({ where: { tenantId, playerId: null, key: 'PAYMENT_CLEARING', currency: current.currency } }),
  ])
  if (!cash || !clearing) throw new Error('PAYMENT_LEDGER_UNAVAILABLE')
  let status: 'SUCCEEDED' | 'FAILED' | 'UNKNOWN' = outcome.status
  if (outcome.status === 'SUCCEEDED') {
    const deposit = current.type === 'DEPOSIT'
    // Same journal identity as the path that dispatched the attempt (customer withdrawals use withdrawal:, all else payment:).
    const journalKey = !deposit && isCustomerOrigin(current) ? `withdrawal:${current.idempotencyKey}` : `payment:${current.idempotencyKey}`
    if (await tx.journalTransaction.findFirst({ where: { tenantId, idempotencyKey: journalKey } })) throw new Error('JOURNAL_ALREADY_POSTED')
    const journal = await tx.journalTransaction.create({ data: { tenantId, type: deposit ? 'DEPOSIT' : 'WITHDRAWAL', idempotencyKey: journalKey, correlationId: current.id, status: 'POSTED', effectiveAt: now } })
    await tx.journalEntry.createMany({ data: [
      { tenantId, transactionId: journal.id, accountId: clearing.id, side: deposit ? 'DEBIT' : 'CREDIT', amountMinor: current.amountMinor, currency: current.currency },
      { tenantId, transactionId: journal.id, accountId: cash.id, side: deposit ? 'CREDIT' : 'DEBIT', amountMinor: current.amountMinor, currency: current.currency },
    ] })
    if (!deposit) {
      const captured = await tx.hold.updateMany({ where: { id: current.holdId ?? '', tenantId, status: 'ACTIVE' }, data: { status: 'CAPTURED', version: { increment: 1 } } })
      if (captured.count !== 1) throw new Error('WITHDRAWAL_HOLD_NOT_ACTIVE')
    }
    const projection = await lockedProjection(tx, tenantId, cash.id)
    if (!projection) throw new Error('PAYMENT_LEDGER_UNAVAILABLE')
    await tx.balanceProjection.create({ data: { tenantId, accountId: cash.id, ...nextProjection(projection, deposit ? postedChange(amountMinor) : captureChange(amountMinor), now) } })
  } else if (outcome.status === 'FAILED') {
    if (current.type === 'WITHDRAWAL' && current.holdId) {
      const released = await tx.hold.updateMany({ where: { id: current.holdId, tenantId, status: 'ACTIVE' }, data: { status: 'RELEASED', version: { increment: 1 } } })
      if (released.count === 1) {
        const projection = await lockedProjection(tx, tenantId, cash.id)
        if (!projection) throw new Error('PAYMENT_LEDGER_UNAVAILABLE')
        await tx.balanceProjection.create({ data: { tenantId, accountId: cash.id, ...nextProjection(projection, releaseChange(amountMinor), now) } })
      }
    }
  } else {
    status = 'UNKNOWN'
  }
  const intent = await tx.paymentIntent.update({ where: { id: current.id }, data: { status, completedAt: status === 'UNKNOWN' ? null : now, ...(outcome.externalRef ? { providerSessionReference: outcome.externalRef } : {}) } })
  const attempt = await tx.paymentAttempt.findFirst({ where: { tenantId, paymentIntentId: current.id }, orderBy: { attempt: 'desc' } })
  if (attempt) await tx.paymentAttempt.update({ where: { id: attempt.id }, data: { status, reasonCode: outcome.reasonCode, ...(outcome.externalRef ? { externalReference: outcome.externalRef } : {}) } })
  return { status, intent }
}

export type UnknownPaymentReconciliation = { state: 'SUCCEEDED' | 'FAILED' | 'ALREADY_RESOLVED'; intentId: string }

/**
 * payment.unknown.v1 consumer. Re-queries ONLY the installation pinned on the intent, by the original attempt's
 * provider key (no new dispatch, no replacement key), and converges the intent with the same settle/release logic
 * as the customer finalize step. A provider that still cannot answer, a changed installation/config, or an
 * observation whose amount/currency differs from the intent leaves the intent UNKNOWN with funds held and throws,
 * so the outbox item retries with backoff and dead-letters after its bounded attempts for operator review.
 * `fence` re-asserts the worker's live lease inside the committing transaction.
 */
export async function reconcileUnknownPayment(
  prisma: any,
  tenantId: string,
  intentId: string,
  fence: (tx: any) => Promise<void>,
  audit: (tx: any, action: string, intentId: string, payload: Record<string, unknown>) => Promise<unknown>,
): Promise<UnknownPaymentReconciliation> {
  const intent = await prisma.paymentIntent.findFirst({ where: { id: intentId, tenantId }, include: { providerConnection: true } })
  if (!intent) throw new Error('PAYMENT_INTENT_NOT_FOUND')
  if (!IN_FLIGHT.has(intent.status ?? '')) return { state: 'ALREADY_RESOLVED', intentId }
  const provider = intent.providerConnection
  if (!provider || provider.tenantId !== tenantId) throw new Error('PAYMENT_STILL_UNKNOWN:PROVIDER_INSTALLATION_MISSING')
  const snapshot = (intent.riskEvidence as any)?.provider
  if (!snapshot || snapshot.connectionId !== provider.id || snapshot.adapterId !== provider.adapterId || snapshot.adapterVersion !== provider.adapterVersion || snapshot.configReference !== provider.configReference) {
    throw new Error('PAYMENT_STILL_UNKNOWN:PROVIDER_CONFIGURATION_CHANGED')
  }
  let observed: { status: string; externalRef: string; payload?: unknown }
  try {
    observed = await getPaymentProviderStatus(provider, `${provider.id}:${intent.idempotencyKey}`)
  } catch (error) {
    throw new Error(`PAYMENT_STILL_UNKNOWN:${error instanceof Error ? error.message : 'PROVIDER_QUERY_FAILED'}`)
  }
  if (observed.status !== 'SUCCEEDED' && observed.status !== 'FAILED') throw new Error('PAYMENT_STILL_UNKNOWN:PROVIDER_PENDING')
  // The observation must be for this exact request; a mismatch never settles or releases anything.
  const payload = (observed.payload ?? {}) as { amountMinor?: unknown; currency?: unknown }
  if (String(payload.amountMinor ?? '') !== String(intent.amountMinor) || String(payload.currency ?? '') !== String(intent.currency)) throw new Error('PAYMENT_STILL_UNKNOWN:PROVIDER_OBSERVATION_MISMATCH')
  const outcome: DispatchOutcome = { status: observed.status, externalRef: observed.externalRef, reasonCode: observed.status === 'SUCCEEDED' ? 'RECONCILED_PROVIDER_CONFIRMED' : 'RECONCILED_PROVIDER_DECLINED' }

  return serializable(prisma, async tx => {
    await fence(tx)
    await tx.$queryRaw`SELECT id FROM "PaymentIntent" WHERE id = ${intent.id} AND tenant = ${tenantId} FOR UPDATE`
    const current = await tx.paymentIntent.findFirst({ where: { id: intent.id, tenantId } })
    if (!current) throw new Error('PAYMENT_INTENT_NOT_FOUND')
    if (!IN_FLIGHT.has(current.status ?? '')) return { state: 'ALREADY_RESOLVED' as const, intentId: current.id }
    const now = new Date()
    const { status, intent: settled } = await applyPaymentOutcome(tx, current, outcome, now)
    if (status === 'UNKNOWN') throw new Error('PAYMENT_STILL_UNKNOWN')
    await tx.outboxMessage.create({ data: { tenantId, aggregateType: 'PAYMENT', aggregateId: current.id, eventType: status === 'SUCCEEDED' ? 'payment.completed.v1' : 'payment.failed.v1', payload: { type: current.type, amountMinor: current.amountMinor, currency: current.currency, providerConnectionId: current.providerConnectionId, reasonCode: outcome.reasonCode }, status: 'PENDING', attempts: 0, maxAttempts: 10, availableAt: now } })
    await audit(tx, status === 'SUCCEEDED' ? 'payment.reconciled_completed' : 'payment.reconciled_failed', current.id, { type: current.type, amountMinor: current.amountMinor, currency: current.currency, providerConnectionId: current.providerConnectionId, externalReference: outcome.externalRef, reasonCode: outcome.reasonCode })
    // Complete the originating customer command (if still in progress) with the converged receipt.
    const commandId = String(current.idempotencyKey ?? '').match(/^customer(?:-withdrawal)?:(.+)$/)?.[1]
    if (commandId) {
      const command = await tx.customerCommand.findFirst({ where: { id: commandId, tenantId, playerId: current.playerId, status: 'IN_PROGRESS' } })
      const exponent = Number((command?.result as any)?.currencyExponent)
      if (command && Number.isInteger(exponent)) {
        const result = fundingResultFor(settled, true, await availableFor(tx, { tenantId, playerId: current.playerId } as CustomerActor, current.currency), exponent)
        await finishCustomerCommand(tx, command.id, status === 'SUCCEEDED' ? 'SUCCEEDED' : 'REJECTED', result)
      }
    }
    return { state: status, intentId: current.id }
  })
}

/**
 * Customer funding lifecycle (sandbox-payments only):
 * 1. prepare under current customer authority: validate restriction, funds and limits, reserve funds
 *    (withdrawal hold) and persist the attempt pinned to one provider installation BEFORE any I/O;
 * 2. dispatch to that pinned installation;
 * 3. finalize atomically with the command receipt. PENDING/unknown outcomes stay UNKNOWN with funds
 *    still held; only a definitive provider failure releases them. A retry with the same key recovers
 *    the original attempt and never dispatches a replacement.
 */
async function runFundingCommand(
  prisma: PrismaClient,
  actor: CustomerActor,
  kind: FundingKind,
  input: { amountMinor: unknown; idempotencyKey: unknown; currency?: unknown },
): Promise<FundingResult> {
  assertSandboxEnabled()
  const currency = await resolveTenantCurrency(prisma, actor.tenantId, kind)
  if (actor.currency && actor.currency !== currency.code) throw new CustomerError('CUSTOMER_CURRENCY_CHANGED', 409)
  // A client-declared currency must equal the wallet currency; an amount is never re-denominated.
  if (input.currency !== undefined && input.currency !== currency.code) throw new CustomerError('CURRENCY_MISMATCH', 409)
  const amount = validateFundingAmount(input.amountMinor, currency.exponent)
  const idempotencyKey = validateIdempotencyKey(input.idempotencyKey)
  const request = kind === 'WITHDRAWAL' ? { type: 'WITHDRAWAL', amountMinor: String(amount), currency: currency.code } : { amountMinor: String(amount), currency: currency.code }
  const claimed = await claimCustomerCommand(prisma, { tenantId: actor.tenantId, playerId: actor.playerId, type: 'FUND', idempotencyKey, request })
  const commandId = claimed.command.id
  const paymentKey = kind === 'WITHDRAWAL' ? `customer-withdrawal:${commandId}` : `customer:${commandId}`
  const unavailable = kind === 'WITHDRAWAL' ? 'WITHDRAWAL_UNAVAILABLE' : 'FUNDING_UNAVAILABLE'

  type Prepared = { kind: 'DONE'; result: FundingResult } | { kind: 'ATTEMPT'; intent: any; provider: any; fresh: boolean }
  let prepared: Prepared
  try {
    prepared = await serializable(prisma, async (tx): Promise<Prepared> => {
      await assertCurrentCustomerActor(tx, actor, true)
      const command = await tx.customerCommand.findUnique({ where: { id: commandId } })
      const stored = command ? commandResult(command) : null
      if (command && command.status !== 'IN_PROGRESS' && stored) return { kind: 'DONE', result: stored as FundingResult }
      const existing = await tx.paymentIntent.findFirst({ where: { tenantId: actor.tenantId, playerId: actor.playerId, idempotencyKey: paymentKey }, include: { providerConnection: true } })
      if (existing) {
        if (!IN_FLIGHT.has(existing.status ?? '')) {
          const result = fundingResultFor(existing, true, await availableFor(tx, actor, existing.currency), currency.exponent)
          await finishCustomerCommand(tx, commandId, result.state === 'SUCCEEDED' ? 'SUCCEEDED' : 'REJECTED', result)
          return { kind: 'DONE', result }
        }
        return { kind: 'ATTEMPT', intent: existing, provider: existing.providerConnection, fresh: false }
      }
      const [cash, clearing, restriction] = await Promise.all([
        tx.ledgerAccount.findFirst({ where: { tenantId: actor.tenantId, playerId: actor.playerId, key: 'PLAYER_CASH', currency: currency.code, status: 'ACTIVE' } }),
        tx.ledgerAccount.findFirst({ where: { tenantId: actor.tenantId, playerId: null, key: 'PAYMENT_CLEARING', currency: currency.code, status: 'ACTIVE' } }),
        kind === 'WITHDRAWAL' ? tx.accountRestriction.findFirst({ where: { tenantId: actor.tenantId, playerId: actor.playerId, capability: 'WITHDRAW', status: 'ACTIVE' } }) : null,
      ])
      if (restriction) throw new CustomerError('WITHDRAWAL_REVIEW_REQUIRED', 409)
      if (!cash || !clearing) throw new CustomerError(unavailable, 409)
      const projection = await lockedProjection(tx, actor.tenantId, cash.id)
      if (!projection) throw new CustomerError(unavailable, 409)
      if (kind === 'DEPOSIT') await assertDepositLimits(tx, actor, amount, new Date())
      if (kind === 'WITHDRAWAL' && BigInt(projection.availableMinor) < amount) throw new CustomerError('INSUFFICIENT_FUNDS', 422)
      const provider = await tx.providerConnection.findFirst({ where: { tenantId: actor.tenantId, adapterId: 'sandbox-payments', status: 'ACTIVE' }, orderBy: [{ failoverPriority: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }] })
      if (!provider) throw new CustomerError(unavailable, 409)
      let holdId: string | null = null
      if (kind === 'WITHDRAWAL') {
        // Reserve before dispatch: spendable funds drop now; posted moves only on confirmed payout.
        const hold = await tx.hold.create({ data: { tenantId: actor.tenantId, accountId: cash.id, purposeType: 'WITHDRAWAL', purposeId: paymentKey, amountMinor: String(amount), status: 'ACTIVE', expiresAt: null, version: 1 } })
        holdId = hold.id
        await tx.balanceProjection.create({ data: { tenantId: actor.tenantId, accountId: cash.id, ...nextProjection(projection, reserveChange(amount)) } })
      }
      const intent = await tx.paymentIntent.create({ data: {
        tenantId: actor.tenantId, playerId: actor.playerId, providerConnectionId: provider.id, holdId, type: kind, amountMinor: String(amount), feeMinor: '0', currency: currency.code, idempotencyKey: paymentKey,
        paymentMethodReference: kind === 'DEPOSIT' ? 'sandbox-hosted-token' : 'sandbox-tokenized-payout', providerSessionReference: '',
        riskEvidence: { mode: 'SANDBOX', requestHash: claimed.command.requestHash, currencyExponent: currency.exponent, provider: { connectionId: provider.id, adapterId: provider.adapterId, adapterVersion: provider.adapterVersion, configReference: provider.configReference, certificationStatus: provider.certificationStatus } },
        status: 'PROCESSING', completedAt: null,
      } })
      await tx.paymentAttempt.create({ data: { tenantId: actor.tenantId, paymentIntentId: intent.id, attempt: 1, externalReference: '', status: 'PENDING', reasonCode: 'PREPARED' } })
      await recordCustomerCommandProgress(tx, commandId, { state: 'PENDING', paymentId: intent.id, amountMinor: String(amount), currency: currency.code, currencyExponent: currency.exponent })
      await appendCustomerAudit(tx, { tenantId: actor.tenantId, playerId: actor.playerId, action: kind === 'DEPOSIT' ? 'customer.deposit_prepared' : 'customer.withdrawal_prepared', targetType: 'PaymentIntent', targetId: intent.id, reason: 'SANDBOX_PAYMENT_PREPARED', payload: { amountMinor: String(amount), currency: currency.code, holdId, providerConnectionId: provider.id } })
      return { kind: 'ATTEMPT', intent, provider, fresh: true }
    })
  } catch (error) {
    if (error instanceof CustomerError && error.status !== 401 && error.code !== 'CUSTOMER_CURRENCY_CHANGED') {
      // Refused before any provider I/O: a definitive, effect-free receipt for this key.
      const result: FundingResult = { state: 'REJECTED', duplicate: claimed.duplicate, rejectionCode: error.code, currencyExponent: currency.exponent }
      // Fenced: the rejection is recorded only while no concurrent duplicate has prepared an intent for this key.
      const recorded = await serializable(prisma, async tx => {
        await tx.$queryRaw`SELECT id FROM "CustomerCommand" WHERE id = ${commandId} FOR UPDATE`
        if (await tx.paymentIntent.findFirst({ where: { tenantId: actor.tenantId, playerId: actor.playerId, idempotencyKey: paymentKey }, select: { id: true } })) return false
        return finishCustomerCommand(tx, commandId, 'REJECTED', result)
      })
      if (!recorded) {
        const current = await prisma.customerCommand.findUnique({ where: { id: commandId } })
        const stored = current ? commandResult(current) : null
        if (stored) return stored as FundingResult
        throw new CustomerError('PAYMENT_IN_PROGRESS', 409)
      }
      return result
    }
    throw error
  }
  if (prepared.kind === 'DONE') return prepared.result

  const outcome = await dispatchPinnedPayment(prepared.intent, prepared.provider, prepared.fresh)

  return serializable(prisma, async tx => {
    await tx.$queryRaw`SELECT id FROM "PaymentIntent" WHERE id = ${prepared.intent.id} FOR UPDATE`
    const current = await tx.paymentIntent.findUnique({ where: { id: prepared.intent.id } })
    if (!current) throw new Error('PAYMENT_INTENT_MISSING')
    const duplicate = claimed.duplicate || !prepared.fresh
    if (!IN_FLIGHT.has(current.status ?? '')) {
      const settled = fundingResultFor(current, true, await availableFor(tx, actor, current.currency), currency.exponent)
      await finishCustomerCommand(tx, commandId, settled.state === 'SUCCEEDED' ? 'SUCCEEDED' : 'REJECTED', settled)
      return settled
    }
    const now = new Date()
    const { status, intent } = await applyPaymentOutcome(tx, current, outcome, now)
    await tx.outboxMessage.create({ data: { tenantId: actor.tenantId, aggregateType: 'PAYMENT', aggregateId: current.id, eventType: status === 'SUCCEEDED' ? 'payment.completed.v1' : status === 'FAILED' ? 'payment.failed.v1' : 'payment.unknown.v1', payload: { type: current.type, amountMinor: current.amountMinor, currency: current.currency, providerConnectionId: current.providerConnectionId, reasonCode: outcome.reasonCode }, status: 'PENDING', attempts: 0, maxAttempts: 10, availableAt: now } })
    await appendCustomerAudit(tx, { tenantId: actor.tenantId, playerId: actor.playerId, action: current.type === 'DEPOSIT' ? 'customer.wallet_funded' : 'customer.withdrawal_requested', targetType: 'PaymentIntent', targetId: current.id, reason: status === 'SUCCEEDED' ? 'SANDBOX_CONFIRMED' : status === 'FAILED' ? 'SANDBOX_PROVIDER_FAILED' : 'PROVIDER_OUTCOME_UNKNOWN', payload: { amountMinor: current.amountMinor, currency: current.currency, holdId: current.holdId, externalReference: outcome.externalRef, reasonCode: outcome.reasonCode } })
    const result = fundingResultFor(intent, duplicate, await availableFor(tx, actor, current.currency), currency.exponent)
    if (status === 'UNKNOWN') await recordCustomerCommandProgress(tx, commandId, result)
    else await finishCustomerCommand(tx, commandId, status === 'SUCCEEDED' ? 'SUCCEEDED' : 'REJECTED', result)
    return result
  })
}

export async function withdrawCustomerWallet(
  prisma: PrismaClient,
  actor: CustomerActor,
  input: { amountMinor: unknown; idempotencyKey: unknown; currency?: unknown },
): Promise<FundingResult> {
  return runFundingCommand(prisma, actor, 'WITHDRAWAL', input)
}

export async function fundCustomerWallet(
  prisma: PrismaClient,
  actor: CustomerActor,
  input: { amountMinor: unknown; idempotencyKey: unknown; currency?: unknown },
): Promise<FundingResult> {
  return runFundingCommand(prisma, actor, 'DEPOSIT', input)
}

