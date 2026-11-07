import test from 'node:test'
import assert from 'node:assert/strict'
import { pooledDatabaseUrl } from '../keystone/database-url'

test('each Prisma client gets a bounded pool instead of cpus*2+1', () => {
  const url = 'postgresql://u:p@postgres.railway.internal:5432/railway'
  assert.equal(new URL(pooledDatabaseUrl(url, 'web')!).searchParams.get('connection_limit'), '20')
  assert.equal(new URL(pooledDatabaseUrl(url, 'worker')!).searchParams.get('connection_limit'), '8')
  assert.equal(new URL(pooledDatabaseUrl(url, 'feed')!).searchParams.get('connection_limit'), '3')
})

test('an explicit connection_limit and other params are kept', () => {
  const url = 'postgresql://u:p@h:5432/db?sslmode=require&connection_limit=50'
  assert.equal(pooledDatabaseUrl(url, 'web'), url)
  const withSsl = new URL(pooledDatabaseUrl('postgresql://u:p@h:5432/db?sslmode=require', 'web')!)
  assert.equal(withSsl.searchParams.get('sslmode'), 'require')
  assert.equal(withSsl.searchParams.get('connection_limit'), '20')
})

test('non-postgres or missing URLs pass through', () => {
  assert.equal(pooledDatabaseUrl(undefined, 'web'), undefined)
  assert.equal(pooledDatabaseUrl('file:./dev.db', 'web'), 'file:./dev.db')
})
