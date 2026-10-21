import type { PrismaClient } from '../../keystone/prisma'
import { assertCurrentCustomerActor, type CustomerActor } from './auth'
import { appendCustomerAudit } from './audit'
import { CustomerError, assertSandboxEnabled } from './errors'
import { claimCustomerCommand, commandResult, finishCustomerCommand, validateIdempotencyKey } from './idempotency'
import { evidenceHash } from '../domain/engine'
import { cashOutPortionMillionths, cashOutStakeForPortion, projectCashOutState, remainingStakeByPart } from '../domain/cashout-economics'

const OFFER_MS = 20_000

function parsePortionBps(value: unknown) {
  const bps = Number(value ?? 10_000)
  if (!Number.isInteger(bps) || bps < 1_000 || bps > 10_000) throw new CustomerError('INVALID_CASH_OUT_PORTION', 400)
  return bps
}

async function eligibleWager(prisma: PrismaClient, actor: CustomerActor, wagerId: string) {
  const wager = await prisma.wager.findFirst({ where: { id: wagerId, tenantId: actor.tenantId, playerId: actor.playerId, status: { in: ['ACCEPTED', 'OPEN', 'PARTIALLY_CASHED_OUT'] } } })
  if (!wager) throw new CustomerError('WAGER_NOT_CASHOUT_ELIGIBLE', 404)
  // Restricted bonus value has no admitted cash-out conversion policy; never credit it to spendable cash.
  if (wager.bonusAwardId) throw new CustomerError('BONUS_CASHOUT_UNSUPPORTED', 409)
  if (await prisma.settlement.findFirst({ where: { tenantId: actor.tenantId, wagerId } })) throw new CustomerError('WAGER_ALREADY_SETTLED', 409)
  const legs = await prisma.wagerLeg.findMany({ where: { tenantId: actor.tenantId, wagerId } })
  if (!legs.length) throw new CustomerError('WAGER_NOT_CASHOUT_ELIGIBLE', 409)
  const markets = await prisma.market.findMany({ where: { tenantId: actor.tenantId, id: { in: [...new Set(legs.map(leg => leg.marketKey))] } } })
  if (markets.some(market => market.status !== 'OPEN' || !market.cashOutEnabled)) throw new CustomerError('CASH_OUT_SUSPENDED', 409)
  return { wager, legs, markets }
}

export async function requestCustomerCashOut(prisma: PrismaClient, actor: CustomerActor, input: { wagerId: unknown; portionBps?: unknown }) {
  assertSandboxEnabled()
  const wagerId = String(input.wagerId ?? '')
  const portionBps = parsePortionBps(input.portionBps)
  await assertCurrentCustomerActor(prisma, actor)
  const { wager, legs } = await eligibleWager(prisma, actor, wagerId)
  const acceptanceRows = await prisma.cashOutAcceptance.findMany({ where: { tenantId: actor.tenantId, wagerId } })
  const cashOutState = projectCashOutState(wager.stakeMinor, acceptanceRows)
  const remainingMillionths = cashOutState.remainingMillionths
  const requestedMillionths = BigInt(portionBps) * 100n
  if (remainingMillionths <= 0n || requestedMillionths > remainingMillionths) throw new CustomerError('CASH_OUT_PORTION_UNAVAILABLE', 409)
  const closedStakeMinor = cashOutStakeForPortion(BigInt(wager.stakeMinor), cashOutState.closedMillionths, requestedMillionths)
  const currentSnapshots = await prisma.priceSnapshot.findMany({ where: { tenantId: actor.tenantId, selectionId: { in: [...new Set(legs.map(leg => leg.selectionKey))] } }, orderBy: [{ selectionId: 'asc' }, { receivedAt: 'desc' }, { id: 'desc' }], distinct: ['selectionId'] }) // exactly one latest price per selection (no shared cap)
  const currentBySelection = new Map<string, (typeof currentSnapshots)[number]>()
  for (const snapshot of currentSnapshots) if (snapshot.selectionId && !currentBySelection.has(snapshot.selectionId)) currentBySelection.set(snapshot.selectionId, snapshot)
  if (legs.some(leg => !currentBySelection.get(leg.selectionKey) || currentBySelection.get(leg.selectionKey)?.status !== 'OPEN')) throw new CustomerError('CASH_OUT_SUSPENDED', 409)
  // Deterministic sandbox valuation: 85% of the open stake portion, capped by
  // that portion's contractual maximum return. Production values come from a
  // certified cash-out pricing capability and use the same evidence boundary.
  const grossValue = closedStakeMinor * 85n / 100n
  const maxForPortion = BigInt(wager.potentialReturnMinor) * requestedMillionths / 1_000_000n
  const amountMinor = grossValue < maxForPortion ? grossValue : maxForPortion
  const feeMinor = closedStakeMinor > amountMinor ? closedStakeMinor - amountMinor : 0n
  const offeredAt = new Date(), expiresAt = new Date(offeredAt.getTime() + OFFER_MS)
  const valuationInputs = { mode: 'DETERMINISTIC_SANDBOX', wagerId, wagerVersion: wager.version, portionBps, closedStakeMinor: String(closedStakeMinor), contractualReturnMinor: wager.potentialReturnMinor, currentSnapshots: legs.map(leg => ({ selectionId: leg.selectionKey, acceptedSnapshotId: leg.snapshotId, currentSnapshotId: currentBySelection.get(leg.selectionKey)?.id, currentOdds: currentBySelection.get(leg.selectionKey)?.decimalOdds })), marginBasisPoints: 1500, offeredAt }
  const valuationHash = evidenceHash(valuationInputs)
  const offer = await prisma.$transaction(async tx => {
    await assertCurrentCustomerActor(tx, actor, true)
    await tx.cashOutOffer.updateMany({ where: { tenantId: actor.tenantId, wagerId, status: 'OPEN', expiresAt: { lte: offeredAt } }, data: { status: 'EXPIRED' } })
    const row = await tx.cashOutOffer.create({ data: { tenantId: actor.tenantId, wagerId, amountMinor: String(amountMinor), currency: wager.currency, portionNumerator: String(requestedMillionths), portionDenominator: '1000000', feeMinor: String(feeMinor), marginBasisPoints: 1500, valuationInputs, valuationHash, wagerVersion: wager.version, offeredAt, expiresAt, status: 'OPEN' } })
    await tx.outboxMessage.create({ data: { tenantId: actor.tenantId, aggregateType: 'WAGER', aggregateId: wagerId, eventType: 'cashout.offered.v1', payload: { offerId: row.id, amountMinor: String(amountMinor), currency: wager.currency, portionNumerator: String(requestedMillionths), portionDenominator: '1000000', valuationHash, expiresAt }, status: 'PENDING', attempts: 0, maxAttempts: 10, availableAt: offeredAt } })
    await appendCustomerAudit(tx, { tenantId: actor.tenantId, playerId: actor.playerId, action: 'cashout.offered', targetType: 'CashOutOffer', targetId: row.id, reason: 'DETERMINISTIC_SANDBOX_VALUATION', payload: { wagerId, amountMinor: String(amountMinor), portionBps, valuationHash, expiresAt } })
    return row
  })
  return { state: 'OFFERED', offerId: offer.id, wagerId, amountMinor: offer.amountMinor, currency: offer.currency, portionNumerator: offer.portionNumerator, portionDenominator: offer.portionDenominator, feeMinor: offer.feeMinor, valuationHash: offer.valuationHash, offeredAt: offer.offeredAt?.toISOString(), expiresAt: offer.expiresAt?.toISOString(), wagerVersion: offer.wagerVersion }
}

export async function acceptCustomerCashOut(prisma: PrismaClient, actor: CustomerActor, input: { offerId: unknown; idempotencyKey: unknown }) {
  assertSandboxEnabled()
  const offerId = String(input.offerId ?? '')
  const idempotencyKey = validateIdempotencyKey(input.idempotencyKey)
  const claimed = await claimCustomerCommand(prisma, { tenantId: actor.tenantId, playerId: actor.playerId, type: 'CASH_OUT', idempotencyKey, request: { offerId } })
  const stored = commandResult(claimed.command)
  if (stored && claimed.command.status !== 'IN_PROGRESS') {
    // A stored receipt is private: only the current, still-valid owner may read it back.
    await assertCurrentCustomerActor(prisma, actor)
    return stored
  }
  const result = await prisma.$transaction(async tx => {
    await assertCurrentCustomerActor(tx, actor, true)
    // Recover a committed acceptance for this command (effect committed, receipt not yet finished) instead of failing on the closed offer.
    const committed = await tx.cashOutAcceptance.findFirst({ where: { tenantId: actor.tenantId, playerId: actor.playerId, idempotencyKey: `cashout:${claimed.command.id}` } })
    if (committed) {
      const recovered = { state: committed.status === 'ACCEPTED' ? 'RECOVERED' : String(committed.status), duplicate: true, acceptanceId: committed.id, wagerId: committed.wagerId, amountMinor: committed.amountMinor, currency: committed.currency, evidenceHash: committed.evidenceHash }
      await finishCustomerCommand(tx, claimed.command.id, 'SUCCEEDED', recovered)
      return recovered
    }
    const offer = await tx.cashOutOffer.findFirst({ where: { id: offerId, tenantId: actor.tenantId, status: 'OPEN' }, include: { wager: true } })
    if (!offer?.wager || offer.wager.playerId !== actor.playerId) throw new CustomerError('CASH_OUT_OFFER_NOT_FOUND', 404)
    await tx.$queryRaw`SELECT id FROM "Wager" WHERE id = ${offer.wager.id} FOR UPDATE`
    await tx.$queryRaw`SELECT id FROM "CashOutOffer" WHERE id = ${offer.id} FOR UPDATE`
    const currentOffer = await tx.cashOutOffer.findUnique({ where: { id: offer.id } })
    const wager = await tx.wager.findUnique({ where: { id: offer.wager.id } })
    if (!currentOffer || currentOffer.status !== 'OPEN' || !currentOffer.expiresAt || currentOffer.expiresAt <= new Date()) throw new CustomerError('CASH_OUT_OFFER_EXPIRED', 409)
    if (!wager || wager.version !== currentOffer.wagerVersion || !['ACCEPTED', 'OPEN', 'PARTIALLY_CASHED_OUT'].includes(wager.status ?? '')) throw new CustomerError('CASH_OUT_WAGER_CHANGED', 409)
    if (wager.bonusAwardId) throw new CustomerError('BONUS_CASHOUT_UNSUPPORTED', 409)
    if (await tx.settlement.findFirst({ where: { tenantId: actor.tenantId, wagerId: wager.id } })) throw new CustomerError('WAGER_ALREADY_SETTLED', 409)
    const legs = await tx.wagerLeg.findMany({ where: { tenantId: actor.tenantId, wagerId: wager.id } })
    const markets = await tx.market.findMany({ where: { tenantId: actor.tenantId, id: { in: [...new Set(legs.map(leg => leg.marketKey))] } } })
    if (markets.some(market => market.status !== 'OPEN' || !market.cashOutEnabled)) throw new CustomerError('CASH_OUT_SUSPENDED', 409)
    const acceptanceRows = await tx.cashOutAcceptance.findMany({ where: { tenantId: actor.tenantId, wagerId: wager.id } })
    const priorCashOutState = projectCashOutState(wager.stakeMinor, acceptanceRows)
    const priorMillionths = priorCashOutState.closedMillionths
    const offerMillionths = cashOutPortionMillionths(currentOffer.portionNumerator, currentOffer.portionDenominator)
    if (priorMillionths + offerMillionths > 1_000_000n) throw new CustomerError('CASH_OUT_PORTION_UNAVAILABLE', 409)
    const closedStake = cashOutStakeForPortion(BigInt(wager.stakeMinor), priorMillionths, offerMillionths)
    const payout = BigInt(currentOffer.amountMinor)
    const [cash, pending, revenue, expense] = await Promise.all([
      tx.ledgerAccount.findFirst({ where: { tenantId: actor.tenantId, playerId: actor.playerId, key: 'PLAYER_CASH', currency: wager.currency } }),
      tx.ledgerAccount.findFirst({ where: { tenantId: actor.tenantId, playerId: null, key: 'WAGERS_PENDING', currency: wager.currency } }),
      tx.ledgerAccount.findFirst({ where: { tenantId: actor.tenantId, playerId: null, key: 'GAMING_REVENUE', currency: wager.currency } }),
      tx.ledgerAccount.findFirst({ where: { tenantId: actor.tenantId, playerId: null, key: 'WINNINGS_EXPENSE', currency: wager.currency } }),
    ])
    if (!cash || !pending || !revenue || !expense) throw new CustomerError('CASH_OUT_LEDGER_UNAVAILABLE', 409)
    const projection = await tx.balanceProjection.findFirst({ where: { tenantId: actor.tenantId, accountId: cash.id }, orderBy: { version: 'desc' } })
    if (!projection) throw new CustomerError('CASH_OUT_LEDGER_UNAVAILABLE', 409)
    const journal = await tx.journalTransaction.create({ data: { tenantId: actor.tenantId, type: 'CASH_OUT', idempotencyKey: `cashout:${claimed.command.id}`, correlationId: wager.id, status: 'POSTED', effectiveAt: new Date() } })
    const entries: Array<{ tenantId: string; transactionId: string; accountId: string; side: 'DEBIT' | 'CREDIT'; amountMinor: string; currency: string }> = [{ tenantId: actor.tenantId, transactionId: journal.id, accountId: pending.id, side: 'DEBIT', amountMinor: String(closedStake), currency: wager.currency }]
    if (payout > closedStake) entries.push({ tenantId: actor.tenantId, transactionId: journal.id, accountId: expense.id, side: 'DEBIT', amountMinor: String(payout - closedStake), currency: wager.currency })
    entries.push({ tenantId: actor.tenantId, transactionId: journal.id, accountId: cash.id, side: 'CREDIT', amountMinor: String(payout), currency: wager.currency })
    if (closedStake > payout) entries.push({ tenantId: actor.tenantId, transactionId: journal.id, accountId: revenue.id, side: 'CREDIT', amountMinor: String(closedStake - payout), currency: wager.currency })
    await tx.journalEntry.createMany({ data: entries })
    const next = BigInt(projection.postedMinor) + payout
    await tx.balanceProjection.create({ data: { tenantId: actor.tenantId, accountId: cash.id, postedMinor: String(next), pendingMinor: projection.pendingMinor, availableMinor: String(BigInt(projection.availableMinor) + payout), version: Number(projection.version) + 1, asOf: new Date() } })
    const acceptanceEvidence = evidenceHash({ offerId, wagerId: wager.id, wagerVersion: wager.version, amountMinor: String(payout), portionNumerator: currentOffer.portionNumerator, portionDenominator: currentOffer.portionDenominator, valuationHash: currentOffer.valuationHash, commandId: claimed.command.id })
    const acceptance = await tx.cashOutAcceptance.create({ data: { tenantId: actor.tenantId, offerId, wagerId: wager.id, playerId: actor.playerId, amountMinor: String(payout), currency: wager.currency, portionNumerator: currentOffer.portionNumerator, portionDenominator: currentOffer.portionDenominator, wagerVersion: Number(wager.version ?? 1), acceptedAt: new Date(), journalTransactionId: journal.id, status: 'ACCEPTED', idempotencyKey: `cashout:${claimed.command.id}`, evidenceHash: acceptanceEvidence } })
    const fullyClosed = priorMillionths + offerMillionths === 1_000_000n
    await tx.cashOutOffer.update({ where: { id: offerId }, data: { status: 'ACCEPTED' } })
    await tx.wager.update({ where: { id: wager.id }, data: { status: fullyClosed ? 'CASHED_OUT' : 'PARTIALLY_CASHED_OUT', version: { increment: 1 } } })
    if (fullyClosed) await tx.wagerPart.updateMany({ where: { tenantId: actor.tenantId, wagerId: wager.id, status: 'OPEN' }, data: { status: 'CASHED_OUT' } })
    const allocations=await tx.wagerExposureAllocation.findMany({where:{tenantId:actor.tenantId,wagerId:wager.id}}),closedMillionths=priorMillionths+offerMillionths,remainingStakes=remainingStakeByPart(allocations,closedMillionths),remainingLiabilities=remainingStakeByPart(allocations.map((item:any)=>({stakeMinor:item.liabilityMinor})),closedMillionths)
    for(const [index,allocation] of allocations.entries()){const remainingStake=remainingStakes[index],remainingLiability=remainingLiabilities[index];await tx.wagerExposureAllocation.update({where:{id:allocation.id},data:{remainingStakeMinor:String(remainingStake),remainingLiabilityMinor:String(remainingLiability),version:{increment:1},status:fullyClosed?'CLOSED':remainingStake===BigInt(allocation.stakeMinor)?'OPEN':'PARTIALLY_CLOSED'}})}
    for(const market of markets){const active=await tx.wagerExposureAllocation.findMany({where:{tenantId:actor.tenantId,marketId:market.id,status:{not:'CLOSED'}}}),stake=active.reduce((sum:bigint,item:any)=>sum+BigInt(item.remainingStakeMinor),0n),liability=active.reduce((sum:bigint,item:any)=>sum+BigInt(item.remainingLiabilityMinor),0n),exposure=await tx.exposurePosition.findFirst({where:{tenantId:actor.tenantId,scopeType:'MARKET',scopeId:market.id,currency:wager.currency}});if(exposure)await tx.exposurePosition.update({where:{id:exposure.id},data:{stakeMinor:String(stake),liabilityMinor:String(liability),version:{increment:1},asOf:new Date()}})}
    await tx.outboxMessage.create({ data: { tenantId: actor.tenantId, aggregateType: 'WAGER', aggregateId: wager.id, eventType: 'wager.cashed_out.v1', payload: { acceptanceId: acceptance.id, offerId, amountMinor: String(payout), currency: wager.currency, fullyClosed, evidenceHash: acceptanceEvidence }, status: 'PENDING', attempts: 0, maxAttempts: 10, availableAt: new Date() } })
    await appendCustomerAudit(tx, { tenantId: actor.tenantId, playerId: actor.playerId, action: fullyClosed ? 'wager.cashed_out' : 'wager.partially_cashed_out', targetType: 'Wager', targetId: wager.id, reason: 'CUSTOMER_ACCEPTED_OFFER', payload: { acceptanceId: acceptance.id, offerId, amountMinor: String(payout), fullyClosed, evidenceHash: acceptanceEvidence } })
    const accepted = { state: fullyClosed ? 'FULLY_CASHED_OUT' : 'PARTIALLY_CASHED_OUT', duplicate: claimed.duplicate, acceptanceId: acceptance.id, wagerId: wager.id, amountMinor: String(payout), currency: wager.currency, fullyClosed, evidenceHash: acceptanceEvidence }
    // Effect and terminal receipt commit together.
    await finishCustomerCommand(tx, claimed.command.id, 'SUCCEEDED', accepted)
    return accepted
  }, { isolationLevel: 'Serializable' })
  return result
}

export async function getCustomerCashOuts(prisma: PrismaClient, actor: CustomerActor) {
  const offers = await prisma.cashOutOffer.findMany({ where: { tenantId: actor.tenantId, wager: { playerId: actor.playerId } }, orderBy: { createdAt: 'desc' }, take: 50 })
  const wagerIds = [...new Set(offers.flatMap(offer => offer.wagerId ? [offer.wagerId] : []))]
  const [acceptanceRows, wagers] = await Promise.all([
    wagerIds.length ? prisma.cashOutAcceptance.findMany({ where: { tenantId: actor.tenantId, playerId: actor.playerId, wagerId: { in: wagerIds } }, orderBy: { acceptedAt: 'asc' } }) : [],
    wagerIds.length ? prisma.wager.findMany({ where: { tenantId: actor.tenantId, playerId: actor.playerId, id: { in: wagerIds } }, select: { id: true, stakeMinor: true } }) : [],
  ])
  const rowsByWager = new Map<string, typeof acceptanceRows>()
  for (const row of acceptanceRows) rowsByWager.set(row.wagerId, [...(rowsByWager.get(row.wagerId) ?? []), row])
  const projections = wagers.map(wager => {
    const state = projectCashOutState(wager.stakeMinor, rowsByWager.get(wager.id) ?? [])
    const reversedIds = new Set(state.reversals.map(row => row.reversalOfId))
    return { wagerId: wager.id, acceptedAmountMinor: String(state.acceptedAmountMinor), reversedAmountMinor: String(state.reversedAmountMinor), closedMillionths: String(state.closedMillionths), remainingStakeMinor: String(state.remainingStakeMinor), reversedIds: [...reversedIds] }
  })
  const projectionByWager = new Map(projections.map(item => [item.wagerId, item]))
  return {
    offers: offers.map(offer => ({ id: offer.id, wagerId: offer.wagerId, amountMinor: offer.amountMinor, currency: offer.currency, portionNumerator: offer.portionNumerator, portionDenominator: offer.portionDenominator, feeMinor: offer.feeMinor, valuationHash: offer.valuationHash, status: offer.status, offeredAt: offer.offeredAt?.toISOString() ?? null, expiresAt: offer.expiresAt?.toISOString() ?? null })),
    acceptances: acceptanceRows.map(item => ({ id: item.id, offerId: item.offerId, wagerId: item.wagerId, amountMinor: item.amountMinor, currency: item.currency, status: item.status, reversalOfId: item.reversalOfId, acceptedAt: item.acceptedAt.toISOString(), evidenceHash: item.evidenceHash, effective: !item.reversalOfId && !(projectionByWager.get(item.wagerId)?.reversedIds.includes(item.id) ?? false) })),
    projections: projections.map(({ reversedIds: _reversedIds, ...projection }) => projection),
  }
}
