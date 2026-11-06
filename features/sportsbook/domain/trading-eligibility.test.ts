import test from 'node:test'
import assert from 'node:assert/strict'
import { isEventAcceptingBets, maxPriceAgeMs, isLivePricing } from './trading-eligibility'

const now = new Date('2026-11-05T12:00:00Z')

test('scheduled events take bets only before their start', () => {
  assert.equal(isEventAcceptingBets({ status: 'SCHEDULED', startAt: new Date('2026-11-05T13:00:00Z') }, now), true)
  assert.equal(isEventAcceptingBets({ status: 'SCHEDULED', startAt: new Date('2026-11-05T12:00:00Z') }, now), false)
  assert.equal(isEventAcceptingBets({ status: 'SCHEDULED', startAt: '2026-10-26T16:00:00Z' }, now), false)
  assert.equal(isEventAcceptingBets({ status: 'LIVE', startAt: '2026-10-26T16:00:00Z' }, now), true)
  assert.equal(isEventAcceptingBets({ status: 'SUSPENDED', startAt: '2026-12-01T00:00:00Z' }, now), false)
  assert.equal(isEventAcceptingBets({ status: 'SCHEDULED', startAt: null }, now), false)
})

test('pre-match prices stand longer than in-play prices', () => {
  delete process.env.MAX_PRICE_AGE_MS; delete process.env.MAX_PREMATCH_PRICE_AGE_MS
  assert.equal(maxPriceAgeMs(true), 30_000)
  assert.equal(maxPriceAgeMs(false), 86_400_000)
  process.env.MAX_PREMATCH_PRICE_AGE_MS = 'nope'
  assert.equal(maxPriceAgeMs(false), 86_400_000)
  delete process.env.MAX_PREMATCH_PRICE_AGE_MS
  assert.equal(isLivePricing('LIVE', 'PREMATCH'), true)
  assert.equal(isLivePricing('SCHEDULED', 'LIVE'), true)
  assert.equal(isLivePricing('SCHEDULED', 'PREMATCH'), false)
})
