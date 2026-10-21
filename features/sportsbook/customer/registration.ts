import { randomBytes } from 'node:crypto'
import type { PrismaClient } from '../../keystone/prisma'
import { provisionSandboxInTransaction } from '../api/sandbox-domain'
import {
  CUSTOMER_SESSION_MAX_AGE_SECONDS,
  digestCustomerToken,
  newCustomerToken,
  type CustomerActor,
} from './auth'
import { assertSandboxEnabled } from './errors'
import { appendCustomerAudit } from './audit'
import { isRetryableTransactionError, transactionBackoff } from '../domain/transaction'

async function withSerializableRetry<T>(work: () => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try { return await work() }
    catch (error) {
      if (attempt >= 9 || !isRetryableTransactionError(error)) throw error
      await transactionBackoff(attempt)
    }
  }
}

export async function registerSandboxCustomer(prisma: PrismaClient) {
  assertSandboxEnabled()
  const subject = `customer_${randomBytes(24).toString('base64url')}`
  const token = newCustomerToken()
  // Provisioning and the owning session commit together, so a failure leaves no unowned player.
  const { provisioned, session } = await withSerializableRetry(() => prisma.$transaction(async tx=>{const provisioned=await provisionSandboxInTransaction(tx, subject);const created=await tx.customerSession.create({
    data: {
      tenantId: provisioned.tenant.id,
      playerId: provisioned.player.id,
      tokenDigest: digestCustomerToken(token),
      expiresAt: new Date(Date.now() + CUSTOMER_SESSION_MAX_AGE_SECONDS * 1000),
    },
  });await appendCustomerAudit(tx,{tenantId:provisioned.tenant.id,playerId:provisioned.player.id,action:'customer.registered',targetType:'Player',targetId:provisioned.player.id,reason:'SANDBOX_REGISTRATION',payload:{sessionId:created.id}});return { provisioned, session: created }}, { isolationLevel: 'Serializable' }))
  const actor: CustomerActor = {
    sessionId: session.id,
    tenantId: provisioned.tenant.id,
    playerId: provisioned.player.id,
    accountReference: session.id.slice(-8).toUpperCase(),
    currency: provisioned.currency,
  }
  return { token, actor }
}
