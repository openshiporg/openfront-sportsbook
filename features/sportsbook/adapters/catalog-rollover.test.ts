import assert from 'node:assert/strict'
import test from 'node:test'

import { nextFixtureStart } from './catalog-rollover'

test('the next feed fixture is always at least a day ahead at its catalog kickoff time', () => {
  const now = new Date('2026-11-06T22:00:00Z')
  assert.equal(nextFixtureStart(2, '17:00', now).toISOString(), '2026-11-08T17:00:00.000Z')
  assert.equal(nextFixtureStart(0, '00:20', now).toISOString(), '2026-11-07T00:20:00.000Z')
})
