import assert from 'node:assert/strict'
import { test } from 'node:test'
import { remainingAcceptedReturn, settleCombinationPart } from './combination'

test('a winning part after a 50% cash-out pays the return on the half still open, not the original return', () => {
  const remaining = remainingAcceptedReturn(30_000n, 10_000n, 5_000n)
  assert.equal(remaining, 15_000n)
  const settled = settleCombinationPart({ stakeMinor: 5_000n, acceptedPotentialReturnMinor: remaining, legs: [{ decimalOdds: '1.7320', outcome: 'WIN' }, { decimalOdds: '1.7321', outcome: 'WIN' }] })
  assert.equal(settled.payoutMinor, 15_000n)
})

test('with no cash-out the accepted return is unchanged', () => {
  assert.equal(remainingAcceptedReturn(30_000n, 10_000n, 10_000n), 30_000n)
  assert.equal(remainingAcceptedReturn(30_000n, 0n, 0n), 0n)
})
