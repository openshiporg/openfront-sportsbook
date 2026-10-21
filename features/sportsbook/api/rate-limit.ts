import { createHash } from 'node:crypto'
import type { PrismaClient } from '../../keystone/prisma'
import { enforceDurableRate, trustedClientKey } from './durable-abuse'
import { isRetryableTransactionError, transactionBackoff } from '../domain/transaction'

/** PostgreSQL-backed customer limiter shared by every web replica. */
export async function sandboxRateLimit(
  prisma: PrismaClient,
  request: Request,
  limit = 30,
  windowMs = 60_000,
  scope = 'customer',
  context: { tenantId?: string; identity?: string } = {},
) {
  const anonymous = createHash('sha256')
    .update(request.headers.get('cookie') ?? '')
    .update(':')
    .update(request.headers.get('user-agent') ?? 'unattributed')
    .digest('hex')
  const clientKey = trustedClientKey(request, context.identity ?? anonymous)

  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      await prisma.$transaction(tx => enforceDurableRate(tx, context.tenantId ?? null, clientKey, scope, limit, windowMs), { isolationLevel: 'Serializable' })
      return false
    } catch (error) {
      const message = error instanceof Error ? error.message : ''
      if (message === 'RATE_LIMITED') return true
      if (message === 'RATE_RETRY' || isRetryableTransactionError(error)) { await transactionBackoff(attempt); continue }
      throw error
    }
  }
  return true
}
