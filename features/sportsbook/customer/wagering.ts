import type { PrismaClient } from '../../keystone/prisma'
import { evidenceHash, potentialReturn } from '../domain/engine'
import { sportsbookResolvers } from '../../keystone/mutations/sportsbook'
import { assertCurrentCustomerActor, type CustomerActor } from './auth'
import { loadQuoteCandidate } from './catalog'
import { resolveCustomerPolicy } from './policy'
import type { CustomerQuote, CustomerWagerResult } from './contracts'
import { CustomerError, assertSandboxEnabled } from './errors'
import {
  claimCustomerCommand,
  commandResult,
  finishCustomerCommand,
  validateIdempotencyKey,
} from './idempotency'

const QUOTE_LIFETIME_MS = 25_000
const MAX_PRICE_AGE_MS = () => Number(process.env.MAX_PRICE_AGE_MS ?? 30_000)

function validateStake(value: unknown) {
  const text = String(value ?? '')
  if (!/^\d{1,9}$/.test(text)) throw new CustomerError('INVALID_STAKE', 400)
  const stake = BigInt(text)
  if (stake < 100n || stake > 1_000_000_000n) throw new CustomerError('INVALID_STAKE', 400)
  return stake
}

function quoteDto(terms: {
  quoteKey: string
  eventId: string
  marketId: string
  selectionId: string
  priceSnapshotId: string
  eventName: string
  marketName: string
  selectionName: string
  decimalOdds: string
  stakeMinor: string
  potentialReturnMinor: string
  currency: string
  termsHash: string
  expiresAt: Date
}): CustomerQuote {
  return {
    state: 'QUOTED',
    quoteId: terms.quoteKey,
    eventId: terms.eventId,
    marketId: terms.marketId,
    selectionId: terms.selectionId,
    priceSnapshotId: terms.priceSnapshotId,
    eventName: terms.eventName,
    marketName: terms.marketName,
    selectionName: terms.selectionName,
    decimalOdds: terms.decimalOdds,
    stakeMinor: terms.stakeMinor,
    potentialReturnMinor: terms.potentialReturnMinor,
    currency: terms.currency,
    termsHash: terms.termsHash,
    expiresAt: terms.expiresAt.toISOString(),
  }
}

export async function createCustomerQuote(
  prisma: PrismaClient,
  actor: CustomerActor,
  input: { selectionId: unknown; stakeMinor: unknown },
): Promise<CustomerQuote> {
  assertSandboxEnabled()
  const selectionId = String(input.selectionId ?? '')
  if (!selectionId) throw new CustomerError('SELECTION_REQUIRED', 400)
  const stake = validateStake(input.stakeMinor)
  await assertCurrentCustomerActor(prisma, actor)
  const currency = actor.currency ?? 'USD'
  const policy=await resolveCustomerPolicy(prisma,actor.tenantId)
  if(stake>policy.maxStakeMinor)throw new CustomerError('MAX_STAKE_EXCEEDED',422)
  const candidate = await loadQuoteCandidate(prisma, actor.tenantId, selectionId)
  const potential=potentialReturn(stake,candidate.snapshot.decimalOdds)
  if(potential>policy.maxPayoutMinor)throw new CustomerError('MAX_PAYOUT_EXCEEDED',422)
  const expiresAt = new Date(Date.now() + QUOTE_LIFETIME_MS)
  const policyVersion = 'sandbox-customer-v1'
  const baseTermsHash = evidenceHash({
    eventId: candidate.event.id,
    eventName: candidate.event.name,
    marketId: candidate.market.id,
    marketName: candidate.marketName,
    selectionId: candidate.selection.id,
    selectionName: candidate.selection.label,
    priceSnapshotId: candidate.snapshot.id,
    decimalOdds: candidate.snapshot.decimalOdds,
    stakeMinor: String(stake),
    potentialReturnMinor: String(potentialReturn(stake, candidate.snapshot.decimalOdds)),
    currency: currency,
    expiresAt,
    policyVersion,
  })

  return prisma.$transaction(async tx => {
    const currentSnapshot = await tx.priceSnapshot.findFirst({
      where: { id: candidate.snapshot.id, tenantId: actor.tenantId, selectionId: candidate.selection.id, status: 'OPEN' },
    })
    if (!currentSnapshot) throw new CustomerError('PRICE_UNAVAILABLE', 409, { state: 'SUSPENDED' })
    const quote = await tx.quote.create({
      data: {
        tenantId: actor.tenantId,
        playerId: actor.playerId,
        selectionId: candidate.selection.id,
        priceSnapshotId: currentSnapshot.id,
        stakeMinor: String(stake),
        currency: currency,
        decimalOdds: currentSnapshot.decimalOdds,
        expiresAt,
        termsHash: baseTermsHash,
        policyVersion,
      },
    })
    const acceptanceTermsHash = evidenceHash({
      id: quote.id,
      tenantId: actor.tenantId,
      playerId: actor.playerId,
      selectionId: candidate.selection.id,
      snapshotId: currentSnapshot.id,
      decimalOdds: currentSnapshot.decimalOdds,
      stake,
      currency: currency,
      expiresAt,
      policyVersion,
      rulesHash: baseTermsHash,
    })
    const terms = await tx.customerQuoteTerms.create({
      data: {
        tenantId: actor.tenantId,
        playerId: actor.playerId,
        quoteId: quote.id,
        quoteKey: quote.id,
        eventId: candidate.event.id,
        marketId: candidate.market.id,
        selectionId: candidate.selection.id,
        priceSnapshotId: currentSnapshot.id,
        eventName: candidate.event.name,
        marketName: candidate.marketName,
        selectionName: candidate.selection.label,
        decimalOdds: currentSnapshot.decimalOdds,
        stakeMinor: String(stake),
        potentialReturnMinor: String(potentialReturn(stake, currentSnapshot.decimalOdds)),
        currency: currency,
        termsHash: acceptanceTermsHash,
        expiresAt,
      },
    })
    return quoteDto(terms)
  }, { isolationLevel: 'Serializable' })
}

async function replayWager(
  prisma: PrismaClient,
  actor: CustomerActor,
  command: { id: string; status: string | null; result: unknown },
  duplicate: boolean,
): Promise<CustomerWagerResult | null> {
  // A receipt is returned only to the current, still-valid owner.
  await assertCurrentCustomerActor(prisma, actor)
  const stored = commandResult(command)
  if (stored && command.status !== 'IN_PROGRESS') return stored as CustomerWagerResult

  const wager = await prisma.wager.findFirst({
    where: { tenantId: actor.tenantId, playerId: actor.playerId, idempotencyKey: `customer:${command.id}` },
  })
  if (!wager) return null
  const decision = await prisma.acceptanceDecision.findFirst({ where: { tenantId: actor.tenantId, wagerId: wager.id } })
  const result: CustomerWagerResult = {
    state: wager.status === 'REJECTED' ? 'REJECTED' : 'ACCEPTED',
    accepted: wager.status !== 'REJECTED',
    duplicate,
    wagerId: wager.id,
    receiptId: wager.id,
    rejectionCode: decision?.rejectionCode || null,
    termsHash: wager.termsHash,
    potentialReturnMinor: wager.potentialReturnMinor,
  }
  await finishCustomerCommand(prisma, command.id, result.accepted ? 'SUCCEEDED' : 'REJECTED', result)
  return result
}

async function finishPreflight(
  prisma: PrismaClient,
  commandId: string,
  result: CustomerWagerResult,
): Promise<CustomerWagerResult> {
  // Fenced with the acceptance transaction (both lock the command row): a pre-effect rejection is recorded only
  // while no wager exists for this command; otherwise the committed wager's receipt is returned.
  return prisma.$transaction(async tx => {
    await tx.$queryRaw`SELECT id FROM "CustomerCommand" WHERE id = ${commandId} FOR UPDATE`
    const command = await tx.customerCommand.findUnique({ where: { id: commandId } })
    const stored = command ? commandResult(command) : null
    if (command && command.status !== 'IN_PROGRESS' && stored) return stored as CustomerWagerResult
    if (await tx.wager.findFirst({ where: { tenantId: command?.tenantId ?? undefined, idempotencyKey: `customer:${commandId}` }, select: { id: true } })) return null
    await finishCustomerCommand(tx, commandId, 'REJECTED', result)
    return result
  }).then(async settled => settled ?? (await recoverCommand(prisma, commandId, result.duplicate)))
}

async function recoverCommand(prisma: PrismaClient, commandId: string, duplicate: boolean): Promise<CustomerWagerResult> {
  const command = await prisma.customerCommand.findUnique({ where: { id: commandId } })
  const wager = command ? await prisma.wager.findFirst({ where: { tenantId: command.tenantId ?? undefined, playerId: command.playerId ?? undefined, idempotencyKey: `customer:${commandId}` } }) : null
  if (!command || !wager) throw new CustomerError('COMMAND_NOT_FOUND', 404)
  const stored = commandResult(command)
  if (stored && command.status !== 'IN_PROGRESS') return stored as CustomerWagerResult
  const decision = await prisma.acceptanceDecision.findFirst({ where: { tenantId: wager.tenantId ?? undefined, wagerId: wager.id } })
  return { state: wager.status === 'REJECTED' ? 'REJECTED' : 'ACCEPTED', accepted: wager.status !== 'REJECTED', duplicate, wagerId: wager.id, receiptId: wager.id, rejectionCode: decision?.rejectionCode || null, termsHash: wager.termsHash, potentialReturnMinor: wager.potentialReturnMinor }
}

export async function placeCustomerWager(
  prisma: PrismaClient,
  actor: CustomerActor,
  input: { quoteId: unknown; idempotencyKey: unknown },
): Promise<CustomerWagerResult> {
  assertSandboxEnabled()
  const quoteId = String(input.quoteId ?? '')
  if (!quoteId) throw new CustomerError('QUOTE_REQUIRED', 400)
  const idempotencyKey = validateIdempotencyKey(input.idempotencyKey)
  const terms = await prisma.customerQuoteTerms.findFirst({
    where: { quoteKey: quoteId, tenantId: actor.tenantId, playerId: actor.playerId },
  })
  if (!terms) throw new CustomerError('QUOTE_NOT_FOUND', 404)

  const claimed = await claimCustomerCommand(prisma, {
    tenantId: actor.tenantId,
    playerId: actor.playerId,
    type: 'WAGER',
    idempotencyKey,
    request: { quoteId },
  })
  const replay = await replayWager(prisma, actor, claimed.command, true)
  if (replay) return replay

  const quote = await prisma.quote.findFirst({
    where: { id: quoteId, tenantId: actor.tenantId, playerId: actor.playerId },
    include: { selection: { include: { market: { include: { event: true } } } }, priceSnapshot: true },
  })
  if (!quote?.selection?.market?.event || !quote.priceSnapshot) {
    throw new CustomerError('QUOTE_NOT_FOUND', 404)
  }

  const latest = await prisma.priceSnapshot.findFirst({
    where: { tenantId: actor.tenantId, selectionId: quote.selectionId },
    orderBy: { receivedAt: 'desc' },
  })
  const suspended = quote.selection.status !== 'OPEN' || quote.selection.market.status !== 'OPEN' ||
    !['SCHEDULED', 'LIVE'].includes(quote.selection.market.event.status ?? '') || latest?.status !== 'OPEN'
  if (suspended) {
    return finishPreflight(prisma, claimed.command.id, {
      state: 'SUSPENDED', accepted: false, duplicate: claimed.duplicate, rejectionCode: 'SELECTION_SUSPENDED', termsHash: terms.termsHash,
    })
  }

  const expired = quote.expiresAt <= new Date()
  const stale = Date.now() - quote.priceSnapshot.receivedAt.getTime() > MAX_PRICE_AGE_MS()
  const changed = Boolean(latest && latest.id !== quote.priceSnapshotId && latest.decimalOdds !== quote.decimalOdds)
  if (expired || stale || changed) {
    const replacement = await createCustomerQuote(prisma, actor, { selectionId: quote.selectionId, stakeMinor: quote.stakeMinor })
    return finishPreflight(prisma, claimed.command.id, {
      state: 'REQUOTE_REQUIRED',
      accepted: false,
      duplicate: claimed.duplicate,
      rejectionCode: expired ? 'QUOTE_EXPIRED' : stale ? 'STALE_PRICE' : 'PRICE_CHANGED',
      termsHash: terms.termsHash,
      quote: replacement,
    })
  }

  let accepted: Awaited<ReturnType<typeof sportsbookResolvers.Mutation.acceptStraightWager>>
  try {
    accepted = await sportsbookResolvers.Mutation.acceptStraightWager(
      null,
      { quoteId, idempotencyKey: `customer:${claimed.command.id}` },
      // The resolver relocks and revalidates this customer's session, tenant, event, price and limits in its own
      // transaction, and commits the command's terminal receipt together with the wager.
      {prisma,trustedTenantId:actor.tenantId,trustedActorId:actor.playerId,trustedCapabilities:['canManageSportsbook'],customerActor:actor,customerCommand:{id:claimed.command.id,duplicate:claimed.duplicate}},
    )
  } catch (error) {
    if ((error as Error)?.message !== 'CUSTOMER_COMMAND_ALREADY_COMPLETED') throw error
    const current = await prisma.customerCommand.findUnique({ where: { id: claimed.command.id } })
    const stored = current ? commandResult(current) : null
    if (!stored) throw new CustomerError('COMMAND_NOT_FOUND', 404)
    return stored as CustomerWagerResult
  }
  if (accepted.termsHash !== terms.termsHash || accepted.potentialReturnMinor !== terms.potentialReturnMinor) {
    throw new Error('PERSISTED_TERMS_MISMATCH')
  }
  const result: CustomerWagerResult = {
    state: accepted.accepted ? 'ACCEPTED' : 'REJECTED',
    accepted: accepted.accepted,
    duplicate: claimed.duplicate,
    wagerId: accepted.wagerId ?? undefined,
    receiptId: accepted.wagerId ?? undefined,
    rejectionCode: accepted.rejectionCode ?? null,
    termsHash: accepted.termsHash,
    potentialReturnMinor: accepted.potentialReturnMinor,
  }
  await finishCustomerCommand(prisma, claimed.command.id, result.accepted ? 'SUCCEEDED' : 'REJECTED', result)
  return result
}
