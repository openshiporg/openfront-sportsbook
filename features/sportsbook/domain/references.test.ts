import assert from 'node:assert/strict'
import test from 'node:test'
import { accountNumber, betReference, playerDisplay } from './references'

test('bet reference and account number are short, stable and uppercase', () => {
  assert.equal(betReference('cmw4qyrq0001mla0133gm074e'), 'BET-33GM074E')
  assert.equal(betReference(null), '—')
  assert.equal(accountNumber('cmvzkwqg50001mk01nbqnnpv6'), 'ACC-NBQNNPV6')
})

test('player display never falls back to the raw auth subject', () => {
  const masked = playerDisplay({ id: 'cmvzkwqg50001mk01nbqnnpv6', subject: 'customer_secret', from_CustomerCredential_player: [{ emailMasked: 'q•••@openship.org' }] })
  assert.equal(masked.primary, 'q•••@openship.org')
  assert.equal(masked.account, 'ACC-NBQNNPV6')
  const guest = playerDisplay({ id: 'cmvzkwqg50001mk01nbqnnpv6', subject: 'customer_secret' })
  assert.equal(guest.primary, 'Guest · ACC-NBQNNPV6')
  assert.ok(!JSON.stringify([masked, guest]).includes('customer_secret'))
})
