import assert from 'node:assert/strict'
import test from 'node:test'
import { GraphQLError } from 'graphql'
import { rethrowKeystonePrismaError } from '../tenant-scope'
import { constraintRefusal } from './constraint-errors'

// Keystone 6.5 returns (does not throw) a GraphQLError with code KS_PRISMA_ERROR from every failed Prisma query.
const returned = (prisma: Record<string, unknown>, message: string) => new GraphQLError(`Prisma error: ${message}`, { extensions: { code: 'KS_PRISMA_ERROR', prisma } })

test('a returned unique conflict is thrown with its Prisma code and target', () => {
  const value = returned({ code: 'P2002', meta: { modelName: 'Season', target: ['tenant', 'competition', 'key'] }, name: 'PrismaClientKnownRequestError' }, 'Unique constraint failed on the fields: (`tenant`,`competition`,`key`)')
  assert.throws(() => rethrowKeystonePrismaError(value), (error: any) => error.code === 'P2002' && constraintRefusal(error)?.code === 'CATALOG_KEY_EXISTS')
})

test('a returned missing-record update is thrown, so the transaction rolls back', () => {
  assert.throws(() => rethrowKeystonePrismaError(returned({ code: 'P2025' }, 'No record was found for an update.')), (error: any) => error.code === 'P2025')
})

test('rows and ordinary values pass through', () => {
  const row = { id: 'x' }
  assert.equal(rethrowKeystonePrismaError(row), row)
  assert.equal(rethrowKeystonePrismaError(3), 3)
  const other = new GraphQLError('other')
  assert.equal(rethrowKeystonePrismaError(other), other)
})
