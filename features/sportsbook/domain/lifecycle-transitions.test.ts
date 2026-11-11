import test from 'node:test'
import assert from 'node:assert/strict'
import { assertEventTransition, assertMarketTransition, assertSupportCaseTransition } from './trading-eligibility'
import { sweepExpiredStates } from './expiry-sweep'

test('terminal event, market and case states cannot be left', () => {
  assert.throws(() => assertEventTransition('CANCELLED', 'LIVE'), /EVENT_TRANSITION_NOT_ALLOWED/)
  assert.throws(() => assertEventTransition('ENDED', 'SCHEDULED'), /EVENT_TRANSITION_NOT_ALLOWED/)
  assert.throws(() => assertMarketTransition('GRADED', 'OPEN'), /MARKET_TRANSITION_NOT_ALLOWED/)
  assert.throws(() => assertMarketTransition('CLOSED', 'OPEN'), /MARKET_TRANSITION_NOT_ALLOWED/)
  assert.throws(() => assertSupportCaseTransition('CLOSED', 'OPEN'), /SUPPORT_CASE_TRANSITION_NOT_ALLOWED/)
  assert.throws(() => assertSupportCaseTransition('RESOLVED', 'OPEN'), /SUPPORT_CASE_TRANSITION_NOT_ALLOWED/)
})
test('forward and same-state transitions pass', () => {
  assertEventTransition('SCHEDULED', 'LIVE'); assertEventTransition('LIVE', 'LIVE'); assertEventTransition('LIVE', 'ENDED')
  assertMarketTransition('OPEN', 'SUSPENDED'); assertMarketTransition('SUSPENDED', 'GRADED'); assertMarketTransition('OPEN', 'OPEN')
  assertSupportCaseTransition('OPEN', 'TRIAGED'); assertSupportCaseTransition('RESOLVED', 'WAITING_OPERATOR')
})
test('expiry sweep only touches non-terminal rows past their deadline', async () => {
  const calls: any[] = []
  const model = (name: string) => ({ updateMany: async (a: any) => { calls.push({ name, ...a }); return { count: 1 } } })
  const tx = { betSlip: model('betSlip'), traderOverride: model('traderOverride'), approvalRequest: model('approvalRequest'), selfExclusion: model('selfExclusion') }
  const now = new Date('2026-11-06T00:00:00Z')
  const r = await sweepExpiredStates(tx, 't1', now)
  assert.deepEqual(r, { betSlips: 1, traderOverrides: 1, approvals: 1, selfExclusions: 1 })
  for (const c of calls) { assert.equal(c.data.status, 'EXPIRED'); assert.equal(c.where.tenantId, 't1') }
  assert.deepEqual(calls.find(c => c.name === 'selfExclusion').where.endsAt, { lte: now })
})
