// Operator reversals for the player funnel: void an accepted wager (stake goes back to the player's wallet) and
// refund a succeeded card deposit (wallet debited, processor refunded or voided). Both are single, audited,
// ledger-balanced commands under the operator's own tenant capability.
import { reverseJournal, type Journal } from '../../sportsbook/domain/ledger'
import { nextProjection, postedChange } from '../../sportsbook/domain/balance'
import { refundPaymentProvider } from '../utils/paymentProviderAdapter'
import { assertCurrentActor } from './approval-control'
import { applyPaymentOutcome } from '../../sportsbook/customer/funding'
import { appendAudit, lockWagerForSettlement, postJournal, requireTenant, serializable } from './sportsbook'

const graphql = String.raw

export const sportsbookCheckoutTypeDefs = graphql`
  extend type Mutation {
    voidWager(wagerId: ID!, reason: String!): ID!
    refundDeposit(paymentId: ID!, reason: String!): ID!
    confirmCageDeposit(reference: String!): ID!
    rejectCageDeposit(reference: String!, reason: String!): ID!
  }
`

const reasonOf = (value: unknown) => {
  const reason = String(value ?? '').trim()
  if (reason.length < 3 || reason.length > 500) throw new Error('REASON_REQUIRED')
  return reason
}

async function lockedProjection(tx: any, tenantId: string, accountId: string) {
  const current = await tx.balanceProjection.findFirst({ where: { tenantId, accountId }, orderBy: { version: 'desc' } })
  if (!current) throw new Error('WALLET_UNAVAILABLE')
  await tx.$queryRaw`SELECT id FROM "BalanceProjection" WHERE id = ${current.id} FOR UPDATE`
  return tx.balanceProjection.findFirst({ where: { tenantId, accountId }, orderBy: { version: 'desc' } })
}

const journalOf = (row: any): Journal => ({
  idempotencyKey: row.idempotencyKey,
  type: row.type,
  entries: row.from_JournalEntry_transaction.map((entry: any) => ({ accountId: entry.accountId, currency: entry.currency, side: entry.side, amount: BigInt(entry.amountMinor) })),
})

export const sportsbookCheckoutResolvers = {
  Mutation: {
    voidWager: async (_r: unknown, a: { wagerId: string; reason: string }, context: any) => {
      const tenantId = await requireTenant(context, 'canManageRisk')
      const reason = reasonOf(a.reason)
      return serializable(context.prisma, async (tx: any) => {
        const actorId = await assertCurrentActor(tx, context, tenantId, 'canManageRisk')
        await lockWagerForSettlement(tx, tenantId, a.wagerId)
        const wager = await tx.wager.findFirst({ where: { id: a.wagerId, tenantId } })
        if (!wager) throw new Error('Not found')
        if (wager.status === 'VOID') return wager.id
        if (!['ACCEPTED', 'OPEN'].includes(String(wager.status))) throw new Error('WAGER_NOT_VOIDABLE')
        if (wager.bonusAwardId) throw new Error('BONUS_WAGER_VOID_UNSUPPORTED')
        if (await tx.settlement.findFirst({ where: { tenantId, wagerId: wager.id } })) throw new Error('WAGER_ALREADY_SETTLED')
        const stakeJournal = await tx.journalTransaction.findFirst({ where: { tenantId, correlationId: wager.id, type: 'WAGER_STAKE' }, include: { from_JournalEntry_transaction: true } })
        if (!stakeJournal) throw new Error('STAKE_JOURNAL_NOT_FOUND')
        const original = journalOf(stakeJournal)
        const cashEntry = original.entries.find(entry => entry.side === 'DEBIT')
        if (!cashEntry) throw new Error('STAKE_JOURNAL_NOT_FOUND')
        const stake = BigInt(wager.stakeMinor)
        const now = new Date()

        await postJournal(tx, tenantId, reverseJournal(original, `void:${wager.id}`), wager.id)
        const projection = await lockedProjection(tx, tenantId, cashEntry.accountId)
        await tx.balanceProjection.create({ data: { tenantId, accountId: cashEntry.accountId, ...nextProjection(projection, postedChange(stake), now) } })
        await tx.hold.updateMany({ where: { tenantId, purposeType: 'WAGER', purposeId: wager.id }, data: { status: 'RELEASED', version: { increment: 1 } } })

        const allocations = await tx.wagerExposureAllocation.findMany({ where: { tenantId, wagerId: wager.id } })
        for (const allocation of allocations) {
          const position = await tx.exposurePosition.findFirst({ where: { tenantId, scopeType: 'MARKET', scopeId: allocation.marketId, currency: wager.currency } })
          if (position) {
            const less = (value: string, by: string) => { const next = BigInt(value) - BigInt(by); return String(next < 0n ? 0n : next) }
            await tx.exposurePosition.update({ where: { id: position.id }, data: { stakeMinor: less(position.stakeMinor, allocation.remainingStakeMinor), liabilityMinor: less(position.liabilityMinor, allocation.remainingLiabilityMinor), version: { increment: 1 }, asOf: now } })
          }
          await tx.wagerExposureAllocation.update({ where: { id: allocation.id }, data: { remainingStakeMinor: '0', remainingLiabilityMinor: '0', status: 'CLOSED', version: { increment: 1 } } })
        }
        await tx.wagerPart.updateMany({ where: { tenantId, wagerId: wager.id }, data: { status: 'VOID' } })
        await tx.wager.update({ where: { id: wager.id }, data: { status: 'VOID' } })
        await tx.wagerStatusEvent.create({ data: { tenantId, wagerId: wager.id, fromStatus: String(wager.status), toStatus: 'VOID', reasonCode: 'OPERATOR_VOID', actorId, effectiveAt: now } })
        
        await appendAudit(tx, tenantId, actorId, 'wager.voided', 'Wager', wager.id, reason, { stakeMinor: wager.stakeMinor, currency: wager.currency, refundedToWallet: true })
        return wager.id
      })
    },

    // Cash received at the cage: posts the deposit journal and credits the wallet exactly once.
    confirmCageDeposit: async (_r: unknown, a: { reference: string }, context: any) => {
      const tenantId = await requireTenant(context, 'canManageFinance')
      const reference = String(a.reference ?? '').trim().toUpperCase()
      if (!/^CG-[A-Z0-9]{6}$/.test(reference)) throw new Error('INVALID_REFERENCE')
      return serializable(context.prisma, async (tx: any) => {
        const actorId = await assertCurrentActor(tx, context, tenantId, 'canManageFinance')
        const found = await tx.paymentIntent.findFirst({ where: { tenantId, type: 'DEPOSIT', providerSessionReference: reference, paymentMethodReference: 'cage-cash' } })
        if (!found) throw new Error('Not found')
        await tx.$queryRaw`SELECT id FROM "PaymentIntent" WHERE id = ${found.id} AND tenant = ${tenantId} FOR UPDATE`
        const intent = await tx.paymentIntent.findFirst({ where: { id: found.id, tenantId } })
        if (intent.status === 'SUCCEEDED') return intent.id
        if (intent.status !== 'PENDING') throw new Error('DEPOSIT_NOT_PENDING')
        const result = await applyPaymentOutcome(tx, intent, { status: 'SUCCEEDED', externalRef: reference, reasonCode: 'CAGE_CASH_RECEIVED' }, new Date())
        
        await appendAudit(tx, tenantId, actorId, 'cage_deposit.confirmed', 'PaymentIntent', intent.id, 'CASH_RECEIVED', { reference, amountMinor: intent.amountMinor, currency: intent.currency, status: result.status })
        return intent.id
      })
    },

    rejectCageDeposit: async (_r: unknown, a: { reference: string; reason: string }, context: any) => {
      const tenantId = await requireTenant(context, 'canManageFinance')
      const reference = String(a.reference ?? '').trim().toUpperCase()
      const reason = reasonOf(a.reason)
      return serializable(context.prisma, async (tx: any) => {
        const actorId = await assertCurrentActor(tx, context, tenantId, 'canManageFinance')
        const found = await tx.paymentIntent.findFirst({ where: { tenantId, type: 'DEPOSIT', providerSessionReference: reference, paymentMethodReference: 'cage-cash' } })
        if (!found) throw new Error('Not found')
        await tx.$queryRaw`SELECT id FROM "PaymentIntent" WHERE id = ${found.id} AND tenant = ${tenantId} FOR UPDATE`
        const intent = await tx.paymentIntent.findFirst({ where: { id: found.id, tenantId } })
        if (intent.status === 'FAILED') return intent.id
        if (intent.status !== 'PENDING') throw new Error('DEPOSIT_NOT_PENDING')
        await applyPaymentOutcome(tx, intent, { status: 'FAILED', externalRef: reference, reasonCode: 'CAGE_CASH_NOT_RECEIVED' }, new Date())
        await appendAudit(tx, tenantId, actorId, 'cage_deposit.rejected', 'PaymentIntent', intent.id, reason, { reference })
        return intent.id
      })
    },

    refundDeposit: async (_r: unknown, a: { paymentId: string; reason: string }, context: any) => {
      const tenantId = await requireTenant(context, 'canManageFinance')
      const reason = reasonOf(a.reason)
      const refundKey = `refund:${a.paymentId}`

      // 1. Validate and record the refund attempt (PROCESSING) before any processor I/O.
      const prepared = await serializable(context.prisma, async (tx: any) => {
        const actorId = await assertCurrentActor(tx, context, tenantId, 'canManageFinance')
        await tx.$queryRaw`SELECT id FROM "PaymentIntent" WHERE id = ${a.paymentId} AND tenant = ${tenantId} FOR UPDATE`
        const deposit = await tx.paymentIntent.findFirst({ where: { id: a.paymentId, tenantId, type: 'DEPOSIT' }, include: { providerConnection: true } })
        if (!deposit) throw new Error('Not found')
        const existing = await tx.paymentIntent.findFirst({ where: { tenantId, idempotencyKey: refundKey } })
        if (existing?.status === 'SUCCEEDED') return { done: existing.id as string }
        if (deposit.status !== 'SUCCEEDED' && !(deposit.status === 'CANCELLED' && existing)) throw new Error('DEPOSIT_NOT_REFUNDABLE')
        if (!deposit.providerConnection || deposit.providerConnection.tenantId !== tenantId) throw new Error('PAYMENT_PROVIDER_UNAVAILABLE')
        const cash = await tx.ledgerAccount.findFirst({ where: { tenantId, playerId: deposit.playerId, key: 'PLAYER_CASH', currency: deposit.currency } })
        if (!cash) throw new Error('WALLET_UNAVAILABLE')
        const projection = await lockedProjection(tx, tenantId, cash.id)
        if (!existing && BigInt(projection.availableMinor) < BigInt(deposit.amountMinor)) throw new Error('INSUFFICIENT_WALLET_FUNDS')
        const intent = existing ?? await tx.paymentIntent.create({ data: {
          tenantId, playerId: deposit.playerId, providerConnectionId: deposit.providerConnectionId, type: 'REFUND', amountMinor: deposit.amountMinor, feeMinor: '0', currency: deposit.currency,
          idempotencyKey: refundKey, paymentMethodReference: deposit.paymentMethodReference, providerSessionReference: '', status: 'PROCESSING',
          riskEvidence: { refundOf: deposit.id, reason, actorId },
        } })
        return { done: null as string | null, depositId: deposit.id as string, intentId: intent.id as string, provider: deposit.providerConnection, reference: String(deposit.providerSessionReference ?? ''), amountMinor: String(deposit.amountMinor), currency: String(deposit.currency), actorId }
      })
      if (prepared.done) return prepared.done

      // 2. Processor refund (or void while unsettled), keyed to the original processor transaction.
      const p = prepared as Exclude<typeof prepared, { done: string }>
      let outcome: { status: string; externalRef: string; method?: string } = { status: 'UNKNOWN', externalRef: '' }
      try { outcome = await refundPaymentProvider(p.provider, p.reference, p.amountMinor, refundKey) } catch { /* stays UNKNOWN: nothing is released until the processor confirms */ }
      if (outcome.status !== 'SUCCEEDED') {
        await context.prisma.paymentIntent.updateMany({ where: { id: p.intentId, tenantId, status: { in: ['PROCESSING', 'PENDING', 'UNKNOWN'] } }, data: { status: outcome.status === 'FAILED' ? 'FAILED' : 'UNKNOWN' } })
        throw new Error('REFUND_NOT_CONFIRMED')
      }

      // 3. Settle: reverse the deposit journal, debit the wallet, close the intents.
      return serializable(context.prisma, async (tx: any) => {
        await tx.$queryRaw`SELECT id FROM "PaymentIntent" WHERE id = ${p.depositId} AND tenant = ${tenantId} FOR UPDATE`
        const refund = await tx.paymentIntent.findFirst({ where: { id: p.intentId, tenantId } })
        if (refund?.status === 'SUCCEEDED') return refund.id
        const depositJournal = await tx.journalTransaction.findFirst({ where: { tenantId, correlationId: p.depositId, type: 'DEPOSIT' }, include: { from_JournalEntry_transaction: true } })
        if (!depositJournal) throw new Error('DEPOSIT_JOURNAL_NOT_FOUND')
        const original = journalOf(depositJournal)
        const cashEntry = original.entries.find(entry => entry.side === 'CREDIT')
        if (!cashEntry) throw new Error('DEPOSIT_JOURNAL_NOT_FOUND')
        const now = new Date()
        await postJournal(tx, tenantId, reverseJournal(original, `deposit-refund:${p.depositId}`), p.depositId)
        const projection = await lockedProjection(tx, tenantId, cashEntry.accountId)
        if (BigInt(projection.availableMinor) < BigInt(p.amountMinor)) throw new Error('INSUFFICIENT_WALLET_FUNDS')
        await tx.balanceProjection.create({ data: { tenantId, accountId: cashEntry.accountId, ...nextProjection(projection, postedChange(-BigInt(p.amountMinor)), now) } })
        await tx.paymentIntent.update({ where: { id: p.intentId }, data: { status: 'SUCCEEDED', completedAt: now, providerSessionReference: outcome.externalRef } })
        await tx.paymentAttempt.create({ data: { tenantId, paymentIntentId: p.intentId, attempt: 1, externalReference: outcome.externalRef, status: 'SUCCEEDED', reasonCode: outcome.method === 'void' ? 'PROCESSOR_VOID' : 'PROCESSOR_REFUND' } })
        await tx.paymentIntent.update({ where: { id: p.depositId }, data: { status: 'CANCELLED' } })
        
        await appendAudit(tx, tenantId, p.actorId, 'deposit.refunded', 'PaymentIntent', p.depositId, reason, { refundIntentId: p.intentId, amountMinor: p.amountMinor, currency: p.currency, externalReference: outcome.externalRef })
        return p.intentId
      })
    },
  },
}
