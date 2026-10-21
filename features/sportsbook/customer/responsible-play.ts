import type { PrismaClient } from '../../keystone/prisma'
import { assertCurrentCustomerActor, type CustomerActor } from './auth'
import type { ExclusionActionResult, LimitActionResult } from './contracts'
import { CustomerError, assertSandboxEnabled } from './errors'
import { appendCustomerAudit } from './audit'
import {
  claimCustomerCommand,
  commandResult,
  finishCustomerCommand,
  validateIdempotencyKey,
} from './idempotency'

const LIMIT_TYPES = new Set(['DEPOSIT', 'STAKE', 'LOSS', 'SESSION'])
const PERIODS = new Set(['DAILY', 'WEEKLY', 'MONTHLY'])
const SESSION_PERIOD_MINUTES: Record<string, number> = { DAILY: 1_440, WEEKLY: 10_080, MONTHLY: 43_200 }

export async function setCustomerLimit(
  prisma: PrismaClient,
  actor: CustomerActor,
  input: { type: unknown; period: unknown; amountMinor: unknown; idempotencyKey: unknown },
): Promise<LimitActionResult> {
  assertSandboxEnabled()
  const type = String(input.type ?? '')
  const period = String(input.period ?? '')
  const amountText = String(input.amountMinor ?? '')
  if (!LIMIT_TYPES.has(type) || !PERIODS.has(period)) throw new CustomerError('INVALID_LIMIT', 400)
  if (!/^\d{1,9}$/.test(amountText) || BigInt(amountText) > 10_000_000n) throw new CustomerError('INVALID_LIMIT', 400)
  // Session limits are whole minutes, never money; they cannot exceed the minutes in the chosen period.
  if (type === 'SESSION' && (!/^\d{1,5}$/.test(amountText) || Number(amountText) < 1 || Number(amountText) > SESSION_PERIOD_MINUTES[period])) throw new CustomerError('INVALID_SESSION_LIMIT', 400)
  const idempotencyKey = validateIdempotencyKey(input.idempotencyKey)
  // Request authentication is not commit authority: a revoked/moved actor gets neither a stored result nor a new effect.
  await assertCurrentCustomerActor(prisma, actor, false, new Date(), true)
  const claimed = await claimCustomerCommand(prisma, {
    tenantId: actor.tenantId,
    playerId: actor.playerId,
    type: 'LIMIT',
    idempotencyKey,
    request: { type, period, amountMinor: amountText, currency: actor.currency ?? 'USD' },
  })
  const stored = commandResult(claimed.command)
  if (stored && claimed.command.status !== 'IN_PROGRESS') return stored as LimitActionResult

  const now = new Date()
  // Effect and terminal receipt commit together, so an IN_PROGRESS command has no committed effect and is
  // safely completed by whichever duplicate holds the command lock (never an eternal IN_PROGRESS).
  const outcome = await prisma.$transaction(async tx => {
    await assertCurrentCustomerActor(tx, actor, true, new Date(), true)
    await tx.$queryRaw`SELECT id FROM "CustomerCommand" WHERE id = ${claimed.command.id} FOR UPDATE`
    const current = await tx.customerCommand.findUnique({ where: { id: claimed.command.id } })
    const finished = current && current.status !== 'IN_PROGRESS' ? commandResult(current) : null
    if (finished) return { response: finished as LimitActionResult }
    const active = await tx.playerLimit.findFirst({
      where: {
        tenantId: actor.tenantId,
        playerId: actor.playerId,
        type: type as 'DEPOSIT' | 'STAKE' | 'LOSS' | 'SESSION',
        period: period as 'DAILY' | 'WEEKLY' | 'MONTHLY',
        effectiveFrom: { lte: now },
        OR: [{ effectiveTo: null }, { effectiveTo: { gt: now } }],
      },
      orderBy: { effectiveFrom: 'desc' },
    })
    const increase = Boolean(active && BigInt(amountText) > BigInt(active.amountMinor))
    const effectiveFrom = increase ? new Date(now.getTime() + 24 * 3_600_000) : now

    await tx.playerLimit.updateMany({
      where: {
        tenantId: actor.tenantId,
        playerId: actor.playerId,
        type: type as 'DEPOSIT' | 'STAKE' | 'LOSS' | 'SESSION',
        period: period as 'DAILY' | 'WEEKLY' | 'MONTHLY',
        effectiveFrom: { gt: now },
        OR: [{ effectiveTo: null }, { effectiveTo: { gt: now } }],
      },
      data: { effectiveTo: now },
    })
    if (active) await tx.playerLimit.update({ where: { id: active.id }, data: { effectiveTo: effectiveFrom } })
    const limit = await tx.playerLimit.create({
      data: {
        tenantId: actor.tenantId,
        playerId: actor.playerId,
        type: type as 'DEPOSIT' | 'STAKE' | 'LOSS' | 'SESSION',
        period: period as 'DAILY' | 'WEEKLY' | 'MONTHLY',
        amountMinor: amountText,
        currency: type === 'SESSION' ? 'MIN' : actor.currency ?? 'USD',
        effectiveFrom,
      },
    })
    await appendCustomerAudit(tx,{tenantId:actor.tenantId,playerId:actor.playerId,action:'customer.limit_set',targetType:'PlayerLimit',targetId:limit.id,reason:increase?'COOLING_OFF':'IMMEDIATE_PROTECTION',payload:{type,period,amountMinor:amountText,effectiveFrom:effectiveFrom.toISOString()}})
    const response: LimitActionResult = {
      state: increase ? 'PENDING' : 'ACTIVE',
      duplicate: claimed.duplicate,
      limitId: limit.id,
      effectiveFrom: effectiveFrom.toISOString(),
    }
    await finishCustomerCommand(tx, claimed.command.id, 'SUCCEEDED', response)
    return { response }
  }, { isolationLevel: 'Serializable' })
  return outcome.response
}

export async function selfExcludeCustomer(
  prisma: PrismaClient,
  actor: CustomerActor,
  input: { durationDays: unknown; idempotencyKey: unknown },
): Promise<ExclusionActionResult> {
  assertSandboxEnabled()
  const rawDuration = input.durationDays
  const durationDays = rawDuration === null ? null : Number(rawDuration)
  if (durationDays !== null && ![1, 7, 42].includes(durationDays)) throw new CustomerError('INVALID_EXCLUSION_DURATION', 400)
  const idempotencyKey = validateIdempotencyKey(input.idempotencyKey)
  await assertCurrentCustomerActor(prisma, actor, false, new Date(), true)
  const claimed = await claimCustomerCommand(prisma, {
    tenantId: actor.tenantId,
    playerId: actor.playerId,
    type: 'EXCLUSION',
    idempotencyKey,
    request: { durationDays, scope: 'OPERATOR' },
  })
  const stored = commandResult(claimed.command)
  if (stored && claimed.command.status !== 'IN_PROGRESS') return stored as ExclusionActionResult
  // Re-running an unfinished exclusion is idempotent (it keeps or extends protection), so a duplicate of an
  // IN_PROGRESS command completes it instead of reporting IN_PROGRESS forever.

  // Effect and terminal receipt commit together; a concurrent duplicate waits on the command row and returns
  // the first committed receipt instead of re-running or finishing a second time.
  return prisma.$transaction(async tx => {
    await assertCurrentCustomerActor(tx, actor, true, new Date(), true)
    await tx.$queryRaw`SELECT id FROM "CustomerCommand" WHERE id = ${claimed.command.id} FOR UPDATE`
    const current = await tx.customerCommand.findUnique({ where: { id: claimed.command.id } })
    if (current && current.status !== 'IN_PROGRESS') return (commandResult(current) ?? { state: current.status, duplicate: true }) as ExclusionActionResult
    const exclusion = await applyCustomerExclusion(tx)
    const response: ExclusionActionResult = {
      state: 'ACTIVE',
      duplicate: claimed.duplicate,
      exclusionId: exclusion.id,
      endsAt: exclusion.endsAt?.toISOString() ?? null,
    }
    await finishCustomerCommand(tx, claimed.command.id, 'SUCCEEDED', response)
    return response
  })

  async function applyCustomerExclusion(tx: any) {
    // Serialize even first-time requests: there is no row to lock before the first exclusion exists.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`self-exclusion:${actor.tenantId}:${actor.playerId}`}))`
    const now = new Date()
    const active = await tx.selfExclusion.findFirst({
      where: {
        tenantId: actor.tenantId,
        playerId: actor.playerId,
        status: 'ACTIVE',
        startsAt: { lte: now },
        OR: [{ endsAt: null }, { endsAt: { gt: now } }],
      },
      orderBy: { startsAt: 'desc' },
    })
    const requestedEndsAt = durationDays === null ? null : new Date(now.getTime() + durationDays * 86_400_000)

    if (!active) {
      const created = await tx.selfExclusion.create({
        data: {
          tenantId: actor.tenantId,
          playerId: actor.playerId,
          scope: 'OPERATOR',
          startsAt: now,
          endsAt: requestedEndsAt,
          status: 'ACTIVE',
          source: 'CUSTOMER',
        },
      })
      await appendCustomerAudit(tx, {
        tenantId: actor.tenantId,
        playerId: actor.playerId,
        action: 'customer.self_excluded',
        targetType: 'SelfExclusion',
        targetId: created.id,
        reason: 'CUSTOMER_REQUEST',
        payload: { durationDays, scope: 'OPERATOR' },
      })
      return created
    }

    const extendsProtection = requestedEndsAt === null
      ? active.endsAt !== null
      : active.endsAt !== null && requestedEndsAt.getTime() > active.endsAt.getTime()
    if (!extendsProtection) return active

    const updated = await tx.selfExclusion.update({
      where: { id: active.id },
      data: { endsAt: requestedEndsAt },
    })
    await appendCustomerAudit(tx, {
      tenantId: actor.tenantId,
      playerId: actor.playerId,
      action: 'customer.self_exclusion_extended',
      targetType: 'SelfExclusion',
      targetId: active.id,
      reason: 'CUSTOMER_REQUEST',
      payload: {
        previousEndsAt: active.endsAt?.toISOString() ?? null,
        requestedDurationDays: durationDays,
        endsAt: updated.endsAt?.toISOString() ?? null,
        scope: active.scope,
      },
    })
    return updated
  }
}
