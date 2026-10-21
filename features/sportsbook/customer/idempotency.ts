import type { Prisma, PrismaClient } from '../../keystone/prisma'
import { evidenceHash } from '../domain/engine'
import { CustomerError } from './errors'

export type CustomerCommandType = 'WAGER' | 'FUND' | 'LIMIT' | 'EXCLUSION' | 'AUTH' | 'CASH_OUT' | 'PROMOTION' | 'DISPUTE' | 'PROFILE' | 'PRIVACY'

export function validateIdempotencyKey(value: unknown) {
  const key = String(value ?? '')
  if (!/^[A-Za-z0-9:_-]{8,128}$/.test(key)) {
    throw new CustomerError('INVALID_IDEMPOTENCY_KEY', 400)
  }
  return key
}

export async function claimCustomerCommand(
  prisma: PrismaClient,
  input: {
    tenantId: string
    playerId: string
    type: CustomerCommandType
    idempotencyKey: string
    request: unknown
  },
) {
  const requestHash = evidenceHash(input.request)
  const commandKey = evidenceHash({ playerId: input.playerId, type: input.type, idempotencyKey: input.idempotencyKey })
  try {
    const command = await prisma.customerCommand.create({
      data: {
        tenantId: input.tenantId,
        playerId: input.playerId,
        type: input.type,
        idempotencyKey: input.idempotencyKey,
        requestHash,
        commandKey,
        status: 'IN_PROGRESS',
      },
    })
    return { command, duplicate: false }
  } catch (error) {
    if ((error as { code?: string }).code !== 'P2002') throw error
    const command = await prisma.customerCommand.findUnique({ where: { commandKey } })
    if (!command) throw error
    // A globally unique player/type key is not proof of the command's tenant ownership.
    if (command.tenantId !== input.tenantId || command.playerId !== input.playerId || command.type !== input.type) {
      throw new CustomerError('COMMAND_NOT_FOUND', 404)
    }
    if (command.requestHash !== requestHash) {
      throw new CustomerError('IDEMPOTENCY_KEY_CONFLICT', 409)
    }
    return { command, duplicate: true }
  }
}

/**
 * Fenced completion: only an IN_PROGRESS command can be finished, so a late or concurrent finisher can
 * never overwrite the first recorded receipt. Pass the effect's transaction client so the effect and
 * its terminal result commit together.
 */
export async function finishCustomerCommand(
  prisma: PrismaClient | Prisma.TransactionClient,
  commandId: string,
  status: 'SUCCEEDED' | 'REJECTED',
  result: Record<string, unknown>,
) {
  const updated = await prisma.customerCommand.updateMany({ where: { id: commandId, status: 'IN_PROGRESS' }, data: { status, result: result as Prisma.InputJsonValue } })
  return updated.count === 1
}

/** Persist the in-flight receipt (e.g. a prepared payment) without completing the command. */
export async function recordCustomerCommandProgress(
  prisma: PrismaClient | Prisma.TransactionClient,
  commandId: string,
  result: Record<string, unknown>,
) {
  await prisma.customerCommand.updateMany({ where: { id: commandId, status: 'IN_PROGRESS' }, data: { result: result as Prisma.InputJsonValue } })
}

export function commandResult(command: { status: string | null; result: unknown }) {
  if (!command.result || typeof command.result !== 'object' || Array.isArray(command.result)) return null
  return { ...(command.result as Record<string, unknown>), duplicate: true, state: command.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : (command.result as Record<string, unknown>).state }
}
