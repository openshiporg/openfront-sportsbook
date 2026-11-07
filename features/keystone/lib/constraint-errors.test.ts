import assert from 'node:assert/strict'
import test from 'node:test'
import { GraphQLError } from 'graphql'
import { CONSTRAINT_MESSAGES, constraintRefusal } from './constraint-errors'

test('a unique index named in the Prisma message maps to its refusal', () => {
  const error = Object.assign(new Error('Unique constraint failed on the constraint: `Season_competition_key_uq`'), { code: 'P2002', meta: { target: 'Season_competition_key_uq' } })
  assert.deepEqual(constraintRefusal(error), { code: 'CATALOG_KEY_EXISTS', message: 'This competition already has a season with that key.', status: 409 })
})

test('a unique violation reported by fields maps through the field list', () => {
  const error = Object.assign(new Error('Unique constraint failed on the fields: (`tenant`,`externalKey`)'), { code: 'P2002', meta: { target: ['tenant', 'externalKey'] } })
  assert.equal(constraintRefusal(error)?.code, 'EXTERNAL_KEY_EXISTS')
})

test('a CHECK refusal raised from raw SQL is named by its constraint', () => {
  const error = new Error('Raw query failed. Code: `23514`. Message: `new row for relation "Settlement" violates check constraint "Settlement_payout_arithmetic"`')
  assert.equal(constraintRefusal(error)?.code, 'SETTLEMENT_ARITHMETIC')
})

test('raw Postgres key detail maps to the same rule', () => {
  const error = new Error('duplicate key value violates unique constraint — Key (tenant, market, key)=(t1, m1, home) already exists.')
  assert.equal(constraintRefusal(error)?.code, 'SELECTION_KEY_EXISTS')
})

test('the rule is found through a GraphQL error wrapper', () => {
  const inner = Object.assign(new Error('violates check constraint "SelfExclusion_range_check"'), { code: 'P2010' })
  assert.equal(constraintRefusal(new GraphQLError('Prisma error', { originalError: inner }))?.code, 'INVALID_EXCLUSION_END')
})

test('unknown errors are not mapped (they stay masked)', () => {
  assert.equal(constraintRefusal(new Error('connection refused')), null)
  assert.equal(constraintRefusal(Object.assign(new Error('Unique constraint failed on the fields: (`foo`)'), { code: 'P2002', meta: { target: ['foo'] } })), null)
})

test('every rule has a code and a sentence', () => {
  for (const [name, rule] of Object.entries(CONSTRAINT_MESSAGES)) {
    assert.match(rule.code, /^[A-Z][A-Z0-9_]+$/, name)
    assert.ok(rule.message.endsWith('.') && rule.message.length > 10, name)
  }
})
