import assert from 'node:assert/strict'
import test from 'node:test'
import { handleSettlementRequested } from './settlement-request'
import { automaticSettlementKey } from '../settlement/full-straight'

const prismaWith = (result: unknown) => ({ resultVersion: { findFirst: async () => result } })

test('settlement.requested needs a result version', async () => {
  await assert.rejects(handleSettlementRequested(prismaWith(null), 't1', {}, async () => undefined), /SETTLEMENT_REQUEST_RESULT_REQUIRED/)
})

test('a superseded or withdrawn result settles nothing', async () => {
  for (const status of ['SUPERSEDED', 'WITHDRAWN', 'PENDING']) {
    const outcome = await handleSettlementRequested(prismaWith({ id: 'r1', eventId: 'e1', status }), 't1', { resultVersionId: 'r1' }, async () => undefined)
    assert.deepEqual(outcome, { resultVersionId: 'r1', graded: 0, settled: [], skipped: [{ id: 'r1', reason: `RESULT_${status}` }] })
  }
})

test('a lost lease fails the job so it retries; an evidence refusal is left for the operator', async () => {
  const prisma = (error: Error) => ({
    ...prismaWith({ id: 'r1', eventId: 'e1', status: 'APPROVED' }),
    selection: { findMany: async () => [{ id: 's1', marketId: 'm1' }] },
    wagerLeg: { findMany: async () => [] },
    wager: { findMany: async () => [] },
    $transaction: async () => { throw error },
  })
  await assert.rejects(handleSettlementRequested(prisma(new Error('WORKER_LEASE_LOST')), 't1', { resultVersionId: 'r1' }, async () => undefined), /WORKER_LEASE_LOST/)
  const outcome = await handleSettlementRequested(prisma(new Error('APPROVED_HOUSE_RULE_REQUIRED')), 't1', { resultVersionId: 'r1' }, async () => undefined)
  assert.deepEqual(outcome.skipped, [{ id: 's1', reason: 'APPROVED_HOUSE_RULE_REQUIRED' }])
})

test('the automatic settlement key is stable per wager and result, so a replay returns the original settlement', () => {
  assert.equal(automaticSettlementKey('w1', 'r1'), automaticSettlementKey('w1', 'r1'))
  assert.notEqual(automaticSettlementKey('w1', 'r1'), automaticSettlementKey('w1', 'r2'))
  assert.match(automaticSettlementKey('cmw4o3owq001znx019dcsjj7v', 'cmw4odq4000zzupcd0000abcd'), /^[A-Za-z0-9:_-]{8,128}$/)
})
