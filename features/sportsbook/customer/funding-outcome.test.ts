import assert from 'node:assert/strict'
import test from 'node:test'
import { applyPaymentOutcome, dispatchPinnedPayment } from './funding'

// In-memory transaction double: one withdrawal intent with an ACTIVE hold and one balance projection.
function fakeTx() {
  const state = {
    hold: { id: 'hold1', status: 'ACTIVE' },
    projections: [{ id: 'p1', version: 1, postedMinor: '2500', availableMinor: '0', pendingMinor: '0', heldMinor: '2500', asOf: new Date(0) }] as any[],
    intent: { id: 'pi1', tenantId: 't1', playerId: 'pl1', type: 'WITHDRAWAL', amountMinor: '2500', currency: 'USD', holdId: 'hold1', idempotencyKey: 'customer-withdrawal:c1', status: 'PROCESSING' } as any,
    journals: 0,
  }
  const tx: any = {
    $queryRaw: async () => [],
    ledgerAccount: { findFirst: async () => ({ id: 'acct' }) },
    journalTransaction: { findFirst: async () => null, create: async () => { state.journals++; return { id: 'j1' } } },
    journalEntry: { createMany: async () => ({ count: 2 }) },
    hold: { updateMany: async ({ where, data }: any) => { if (where.id === state.hold.id && state.hold.status === where.status) { state.hold.status = data.status; return { count: 1 } } return { count: 0 } } },
    balanceProjection: {
      findFirst: async () => state.projections.at(-1),
      create: async ({ data }: any) => { state.projections.push({ ...data, id: `p${state.projections.length + 1}` }); return data },
    },
    paymentIntent: { update: async ({ data }: any) => (state.intent = { ...state.intent, ...data }) },
    paymentAttempt: { findFirst: async () => ({ id: 'a1' }), update: async () => ({}) },
  }
  return { tx, state }
}

test('a manual payout dispatch is in progress (PROCESSING), not unknown', async () => {
  const provider = { id: 'm1', adapterId: 'manual', adapterVersion: '1', configReference: 'cfg', status: 'ACTIVE' }
  const intent = { type: 'WITHDRAWAL', amountMinor: '2500', currency: 'USD', idempotencyKey: 'customer-withdrawal:c1', riskEvidence: { provider: { adapterId: 'manual', adapterVersion: '1', configReference: 'cfg' } } }
  const outcome = await dispatchPinnedPayment(intent, provider, true)
  assert.equal(outcome.status, 'PROCESSING')
})

test('PROCESSING and UNKNOWN keep the funds held and the intent open', async () => {
  for (const status of ['PROCESSING', 'UNKNOWN'] as const) {
    const { tx, state } = fakeTx()
    const result = await applyPaymentOutcome(tx, state.intent, { status, externalRef: '', reasonCode: 'X' }, new Date())
    assert.equal(result.status, status)
    assert.equal(state.hold.status, 'ACTIVE')
    assert.equal(state.projections.length, 1)
    assert.equal(state.intent.completedAt, null)
  }
})

test('a failed payout releases the hold exactly once', async () => {
  const { tx, state } = fakeTx()
  await applyPaymentOutcome(tx, state.intent, { status: 'FAILED', externalRef: '', reasonCode: 'REJECTED' }, new Date())
  assert.equal(state.hold.status, 'RELEASED')
  assert.equal(state.projections.length, 2)
  assert.equal(state.projections.at(-1).availableMinor, '2500')
  // A second release (replay) finds no ACTIVE hold and changes no balance.
  await applyPaymentOutcome(tx, state.intent, { status: 'FAILED', externalRef: '', reasonCode: 'REJECTED' }, new Date())
  assert.equal(state.projections.length, 2)
})
