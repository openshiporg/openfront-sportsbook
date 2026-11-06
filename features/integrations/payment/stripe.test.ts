import assert from 'node:assert/strict'
import test from 'node:test'

import { mapCheckoutSession } from './stripe'

test('a deposit is only confirmed once Stripe reports the session paid and the payment succeeded', () => {
  assert.equal(mapCheckoutSession({ status: 'complete', payment_status: 'paid', payment_intent: { status: 'succeeded' } }), 'succeeded')
  assert.equal(mapCheckoutSession({ status: 'complete', payment_status: 'unpaid', payment_intent: { status: 'processing' } }), 'pending')
  assert.equal(mapCheckoutSession({ status: 'open', payment_status: 'unpaid', payment_intent: null }), 'pending')
})

test('an expired or cancelled checkout is a definitive failure that releases the attempt', () => {
  assert.equal(mapCheckoutSession({ status: 'expired', payment_status: 'unpaid' }), 'canceled')
  assert.equal(mapCheckoutSession({ status: 'open', payment_status: 'unpaid', payment_intent: { status: 'canceled' } }), 'canceled')
})
