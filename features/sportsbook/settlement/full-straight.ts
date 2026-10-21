import type { PrismaClient } from '../../keystone/prisma'
import { appendAudit, emit, lockWagerForSettlement, postJournal, serializable } from '../../keystone/mutations/sportsbook'
import { evidenceHash } from '../domain/engine'
import { parseExactDecimal, settleCombinationPart } from '../domain/combination'
import { settlementJournal } from '../domain/ledger'
import { resolveCanonicalSelectionFact } from '../domain/result-facts'
import { resultApprovalHash } from '../domain/result-approval'
import { hasOperatorMfaAssurance } from '../../keystone/session-assurance'

type HumanRiskSession = { itemId?: string; operatorMfaAssurance?: { issuedAt: number; expiresAt: number; nonce: string } } | null | undefined
const assertHumanSession = (session: HumanRiskSession, actorId: string) => { if (session?.itemId !== actorId || !hasOperatorMfaAssurance(session)) fail('SETTLEMENT_SESSION_ASSURANCE_REQUIRED') }

const CONTRACT = 'openfront.full-straight.initial.v1'
const fail: (reason: string) => never = reason => { throw new Error(reason) }
const minor = (value: unknown): bigint => typeof value === 'string' && /^\d{1,24}$/.test(value) ? BigInt(value) : fail('INVALID_SETTLEMENT_MONEY')
const one = <T>(rows: T[], reason: string): T => rows.length === 1 ? rows[0] : fail(reason)

export type FullStraightPlan = {
  state: 'READY'; contract: string; planHash: string; tenantId: string; wagerId: string
  playerId: string; outcome: string; stakeMinor: string; payoutMinor: string; currency: string
  currencyExponent: number; resultVersionId: string; ruleVersion: string
  bundle: Record<string, unknown>
}

/** Human risk authority is refreshed inside the transaction. This is NOT a worker delegation. */
export async function assertCurrentRiskOperator(tx: any, tenantId: string, actorId: string) {
  await tx.$queryRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`
  await tx.$queryRaw`SELECT id FROM "Tenant" WHERE id = ${tenantId} FOR SHARE`
  await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${actorId} AND tenant = ${tenantId} FOR SHARE`
  const user = await tx.user.findFirst({ where: { id: actorId, tenantId }, include: { role: true } })
  if (!user?.roleId) fail('SETTLEMENT_AUTHORITY_REQUIRED')
  await tx.$queryRaw`SELECT id FROM "Role" WHERE id = ${user.roleId} FOR SHARE`
  const current = await tx.user.findFirst({ where: { id: actorId, tenantId }, include: { role: true } })
  const tenant = await tx.tenant.findFirst({ where: { id: tenantId, status: 'ACTIVE' } })
  if (!tenant || current?.roleId !== user.roleId || !current?.role?.canManageRisk || !current.operatorMfaEnabled) fail('SETTLEMENT_AUTHORITY_REQUIRED')
}

async function assertApprovalIdentities(tx: any, tenantId: string, approval: any) {
  for (const [id, approver] of [[approval.requesterId, false], [approval.approverId, true]] as const) {
    await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${id} AND tenant = ${tenantId} FOR SHARE`
    const user = await tx.user.findFirst({ where: { id, tenantId }, include: { role: true } })
    if (!user?.roleId) fail('APPROVAL_PRINCIPAL_SCOPE_REQUIRED')
    await tx.$queryRaw`SELECT id FROM "Role" WHERE id = ${user.roleId} FOR SHARE`
    const current = await tx.user.findFirst({ where: { id, tenantId }, include: { role: true } })
    if (!current?.operatorMfaEnabled || (approver ? !current.role?.canApproveSensitiveActions : !current.role?.canTrade && !current.role?.canManageSportsbook)) fail('APPROVAL_PRINCIPAL_SCOPE_REQUIRED')
  }
}

/** Complete coverage for ONE cash-funded full-engine leg/part. No default LOSS or latest-first guess. */
export async function loadFullStraightPlan(tx: any, tenantId: string, wagerId: string) {
  await lockWagerForSettlement(tx, tenantId, wagerId)
  const wager = await tx.wager.findFirst({ where: { id: wagerId, tenantId } })
  if (!wager?.playerId || wager.structure !== 'STRAIGHT') fail('UNSUPPORTED_FULL_STRAIGHT_CONTRACT')
  if (!['ACCEPTED', 'OPEN', 'GRADED'].includes(wager.status) || wager.bonusAwardId || wager.promotionId) fail('UNSUPPORTED_FULL_STRAIGHT_STATE_OR_FUNDING')
  const settled = await tx.settlement.findFirst({ where: { tenantId, wagerId } })
  if (settled) fail('WAGER_ALREADY_SETTLED')
  const part = one<any>(await tx.wagerPart.findMany({ where: { tenantId, wagerId }, take: 2 }), 'FULL_STRAIGHT_PART_COVERAGE_REQUIRED')
  const leg = one<any>(await tx.wagerLeg.findMany({ where: { tenantId, wagerId }, take: 2 }), 'FULL_STRAIGHT_LEG_COVERAGE_REQUIRED')
  if (part.partIndex !== 0 || part.status !== 'OPEN' || leg.wagerPartId !== part.id || leg.legIndex !== 0 || minor(part.stakeMinor) !== minor(wager.stakeMinor) || minor(part.potentialReturnMinor) !== minor(wager.potentialReturnMinor)) fail('ACCEPTED_PART_EVIDENCE_MISMATCH')
  if (await tx.cashOutAcceptance.findFirst({ where: { tenantId, wagerId } })) fail('CASHOUT_SETTLEMENT_PLAN_REQUIRED')
  await tx.$queryRaw`SELECT id FROM "Player" WHERE id = ${wager.playerId} AND tenant = ${tenantId} FOR SHARE`
  if (!await tx.player.findFirst({ where: { id: wager.playerId, tenantId } })) fail('SETTLEMENT_PLAYER_SCOPE_MISMATCH')
  const selection = await tx.selection.findFirst({ where: { id: leg.selectionKey, tenantId }, include: { market: true } })
  if (!selection?.market || selection.market.id !== leg.marketKey || selection.market.eventId !== leg.eventKey) fail('SETTLEMENT_SELECTION_SCOPE_MISMATCH')
  const acceptedSnapshot = await tx.priceSnapshot.findFirst({ where: { id: leg.snapshotId, tenantId, selectionId: leg.selectionKey } })
  if (!acceptedSnapshot?.providerConnectionId || acceptedSnapshot.decimalOdds !== leg.decimalOdds || String(acceptedSnapshot.line ?? '') !== leg.line || !await tx.providerConnection.findFirst({ where: { id: acceptedSnapshot.providerConnectionId, tenantId } })) fail('ACCEPTED_PRICE_SOURCE_SCOPE_REQUIRED')
  await tx.$queryRaw`SELECT id FROM "Event" WHERE id = ${leg.eventKey} AND tenant = ${tenantId} FOR SHARE`
  await tx.$queryRaw`SELECT id FROM "Selection" WHERE id = ${leg.selectionKey} AND tenant = ${tenantId} FOR SHARE`
  const result = one<any>(await tx.resultVersion.findMany({ where: { tenantId, eventId: leg.eventKey, status: 'APPROVED' }, take: 2 }), 'ONE_APPROVED_RESULT_REQUIRED')
  await tx.$queryRaw`SELECT id FROM "ResultVersion" WHERE id = ${result.id} AND tenant = ${tenantId} FOR SHARE`
  const approval = await tx.approvalRequest.findFirst({ where: { tenantId, action: 'APPROVE_RESULT', payloadHash: resultApprovalHash(result), status: 'APPROVED' } })
  if (!approval?.approverId || approval.requesterId === approval.approverId || !result.approvedAt) fail('INDEPENDENT_RESULT_EVIDENCE_REQUIRED')
  await assertApprovalIdentities(tx, tenantId, approval)
  if (!await tx.providerConnection.findFirst({ where: { id: result.providerConnectionId, tenantId } })) fail('RESULT_SOURCE_SCOPE_MISMATCH')
  const fact = resolveCanonicalSelectionFact(result.payload, leg.eventKey, leg.marketKey, selection.key)
  if (!fact) fail('CANONICAL_SELECTION_RESULT_REQUIRED')
  if (!['WIN', 'LOSS', 'VOID'].includes(fact.outcome)) fail('UNSUPPORTED_FULL_STRAIGHT_OUTCOME')
  const grade = one<any>(await tx.legGrade.findMany({ where: { tenantId, wagerLegId: leg.id, marketGrade: { resultVersionId: result.id } }, include: { marketGrade: true }, take: 2 }), 'EXACT_SELECTION_GRADE_COVERAGE_REQUIRED')
  const marketGrade = grade.marketGrade, trace = marketGrade?.trace
  if (!marketGrade || marketGrade.tenantId !== tenantId || marketGrade.marketId !== leg.marketKey || marketGrade.resultVersionId !== result.id || trace?.selectionId !== leg.selectionKey || trace?.selectionKey !== selection.key || trace?.resultHash !== result.payloadHash || trace?.factHash !== evidenceHash(fact) || grade.outcome !== fact.outcome || marketGrade.outcome !== fact.outcome || grade.factorNumerator || grade.factorDenominator || marketGrade.factorNumerator || marketGrade.factorDenominator) fail('SELECTION_GRADE_EVIDENCE_MISMATCH')
  if (marketGrade.inputHash !== evidenceHash({ marketId: leg.marketKey, selectionId: leg.selectionKey, resultVersionId: result.id, outcome: fact.outcome, factorNumerator: null, factorDenominator: null, ruleVersion: marketGrade.ruleVersion, ruleHash: trace.ruleHash, resultHash: result.payloadHash }) || grade.inputHash !== evidenceHash({ gradeId: marketGrade.id, legId: leg.id, selectionId: leg.selectionKey })) fail('GRADE_CONTENT_EVIDENCE_MISMATCH')
  const rule = await tx.houseRuleVersion.findFirst({ where: { id: trace.ruleId, tenantId } })
  if (!rule || `${rule.name}@${rule.version}` !== leg.ruleVersion || marketGrade.ruleVersion !== leg.ruleVersion || rule.semanticHash !== trace.ruleHash) fail('ACCEPTED_RULE_EVIDENCE_REQUIRED')
  await tx.$queryRaw`SELECT id FROM "HouseRuleVersion" WHERE id = ${rule.id} AND tenant = ${tenantId} FOR SHARE`
  const ruleApproval = await tx.approvalRequest.findFirst({ where: { id: rule.approvalRequestId ?? '', tenantId, action: `HOUSE_RULE:${rule.name}`, payloadHash: rule.semanticHash, status: 'APPROVED' } })
  if (!ruleApproval?.approverId || ruleApproval.approverId === ruleApproval.requesterId || !wager.acceptedAt || rule.effectiveFrom > wager.acceptedAt || (rule.effectiveTo && rule.effectiveTo <= wager.acceptedAt)) fail('ACCEPTED_RULE_APPROVAL_REQUIRED')
  await assertApprovalIdentities(tx, tenantId, ruleApproval)
  if (rule.semanticHash !== evidenceHash({ action: 'HOUSE_RULE', name: rule.name, sportKey: rule.sportKey, marketDefinitionKey: rule.marketDefinitionKey, rules: rule.rules, effectiveFrom: rule.effectiveFrom })) fail('RULE_CONTENT_EVIDENCE_MISMATCH')
  if (rule.rules?.taxPolicy !== 'NONE') fail('SETTLEMENT_TAX_POLICY_REQUIRED')
  if (rule.rules?.currencyExponent !== 2) fail('ACCEPTED_CURRENCY_EXPONENT_EVIDENCE_REQUIRED')
  if (!Array.isArray(rule.rules?.structures) || !rule.rules.structures.includes('STRAIGHT') || (fact.outcome === 'VOID' && rule.rules.void !== true)) fail('OUTCOME_NOT_ALLOWED_BY_ACCEPTED_RULE')
  const quoteLeg = one<any>(await tx.customerQuoteLegTerms.findMany({ where: { tenantId, playerId: wager.playerId, quoteId: wager.quoteId, quoteKey: wager.quoteId, legIndex: '0' }, take: 2 }), 'ORIGINAL_QUOTE_EVIDENCE_REQUIRED')
  if (quoteLeg.eventId !== leg.eventKey || quoteLeg.marketId !== leg.marketKey || quoteLeg.selectionId !== leg.selectionKey || quoteLeg.ruleVersion !== leg.ruleVersion || quoteLeg.evidenceHash !== evidenceHash({ quoteId: wager.quoteId, index: 0, selectionId: quoteLeg.selectionId, snapshotId: quoteLeg.priceSnapshotId, decimalOdds: quoteLeg.decimalOdds, line: quoteLeg.line, ruleVersion: quoteLeg.ruleVersion, ruleHash: rule.semanticHash, currency: wager.currency, currencyExponent: rule.rules.currencyExponent })) fail('ORIGINAL_QUOTE_EVIDENCE_REQUIRED')
  const decision = one<any>(await tx.acceptanceDecision.findMany({ where: { tenantId, wagerId }, take: 2 }), 'ACCEPTANCE_EVIDENCE_REQUIRED')
  const price = decision.gateResults?.acceptedPriceEvidence?.[0]
  if (!decision.accepted || decision.inputHash !== wager.termsHash || decision.gateResults?.rejectedParts?.length || decision.gateResults?.acceptedParts?.length !== 1 || decision.gateResults.acceptedParts[0] !== 0 || !price || price.legIndex !== 0 || price.snapshotId !== leg.snapshotId || price.decimalOdds !== leg.decimalOdds || price.line !== leg.line) fail('ACCEPTED_PRICE_EVIDENCE_MISMATCH')
  const commandId = /^combination:([A-Za-z0-9_-]+)$/.exec(wager.idempotencyKey)?.[1]
  if (!commandId) fail('ORIGINAL_CUSTOMER_COMMAND_REQUIRED')
  await tx.$queryRaw`SELECT id FROM "CustomerCommand" WHERE id = ${commandId} AND tenant = ${tenantId} AND player = ${wager.playerId} FOR SHARE`
  const command = await tx.customerCommand.findFirst({ where: { id: commandId, tenantId, playerId: wager.playerId, type: 'WAGER', status: 'SUCCEEDED' } })
  if (!command?.result || command.result.wagerId !== wagerId || command.result.receiptId !== wagerId || command.result.state !== 'ACCEPTED' || command.result.accepted !== true || command.result.termsHash !== wager.termsHash || command.result.acceptedStakeMinor !== wager.stakeMinor || command.result.potentialReturnMinor !== wager.potentialReturnMinor || command.result.acceptedPartIndexes?.length !== 1 || command.result.acceptedPartIndexes[0] !== 0 || command.result.rejectedPartIndexes?.length || !/^[a-f0-9]{64}$/.test(command.requestHash)) fail('ORIGINAL_CUSTOMER_COMMAND_REQUIRED')
  const receiptPart = command.result.acceptedParts?.[0], receiptPrice = command.result.acceptedPrices?.[0]
  if (command.result.acceptedParts?.length !== 1 || !receiptPart || receiptPart.index !== part.partIndex || receiptPart.key !== part.combinationKey || receiptPart.stakeMinor !== part.stakeMinor || receiptPart.potentialReturnMinor !== part.potentialReturnMinor || receiptPart.decimalOdds !== part.decimalOdds || command.result.acceptedPrices?.length !== 1 || !receiptPrice || receiptPrice.legIndex !== 0 || receiptPrice.selectionId !== leg.selectionKey || receiptPrice.priceSnapshotId !== leg.snapshotId || receiptPrice.decimalOdds !== leg.decimalOdds || receiptPrice.line !== leg.line) fail('ORIGINAL_CUSTOMER_COMMAND_REQUIRED')
  const oldPrice = parseExactDecimal(part.decimalOdds), acceptedPrice = parseExactDecimal(leg.decimalOdds)
  if (oldPrice.numerator * acceptedPrice.denominator !== acceptedPrice.numerator * oldPrice.denominator) fail('ACCEPTED_PRICE_EVIDENCE_MISMATCH')
  const configured = await tx.tenantCurrency.findFirst({ where: { tenantId, status: 'ACTIVE', currency: { code: wager.currency } }, include: { currency: true } })
  if (!configured?.currency || configured.currency.code !== wager.currency || !Number.isInteger(configured.currency.exponent) || configured.currency.exponent !== rule.rules.currencyExponent) fail('SETTLEMENT_CURRENCY_EVIDENCE_REQUIRED')
  const accounts: Record<string, any> = {}
  for (const key of ['PLAYER_CASH', 'WAGERS_PENDING', 'GAMING_REVENUE', 'WINNINGS_EXPENSE']) accounts[key] = one<any>(await tx.ledgerAccount.findMany({ where: { tenantId, playerId: key === 'PLAYER_CASH' ? wager.playerId : null, currency: wager.currency, key, status: 'ACTIVE' }, take: 2 }), `EXACT_LEDGER_ACCOUNT_REQUIRED:${key}`)
  await tx.$queryRaw`SELECT id FROM "LedgerAccount" WHERE id = ${accounts.PLAYER_CASH.id} AND tenant = ${tenantId} FOR UPDATE`
  const balance = await tx.balanceProjection.findFirst({ where: { tenantId, accountId: accounts.PLAYER_CASH.id }, orderBy: { version: 'desc' } })
  if (!balance || minor(balance.availableMinor) > minor(balance.postedMinor)) fail('SETTLEMENT_BALANCE_EVIDENCE_REQUIRED')
  minor(balance.pendingMinor)
  await tx.$queryRaw`SELECT id FROM "BalanceProjection" WHERE id = ${balance.id} AND tenant = ${tenantId} FOR UPDATE`
  const hold = one<any>(await tx.hold.findMany({ where: { tenantId, accountId: accounts.PLAYER_CASH.id, purposeType: 'WAGER', purposeId: wagerId }, take: 2 }), 'EXACT_CAPTURED_HOLD_REQUIRED')
  if (hold.status !== 'CAPTURED' || minor(hold.amountMinor) !== minor(wager.stakeMinor)) fail('EXACT_CAPTURED_HOLD_REQUIRED')
  const stakeJournal = one<any>(await tx.journalTransaction.findMany({ where: { tenantId, correlationId: wagerId, type: 'WAGER_STAKE', status: 'POSTED' }, take: 2 }), 'STAKE_JOURNAL_EVIDENCE_REQUIRED')
  const entries = await tx.journalEntry.findMany({ where: { tenantId, transactionId: stakeJournal.id }, take: 3 })
  if (entries.length !== 2 || !entries.some((entry: any) => entry.accountId === accounts.PLAYER_CASH.id && entry.side === 'DEBIT') || !entries.some((entry: any) => entry.accountId === accounts.WAGERS_PENDING.id && entry.side === 'CREDIT') || entries.some((entry: any) => entry.currency !== wager.currency || minor(entry.amountMinor) !== minor(wager.stakeMinor))) fail('STAKE_JOURNAL_EVIDENCE_MISMATCH')
  await tx.$queryRaw`SELECT id FROM "ExposurePosition" WHERE tenant = ${tenantId} AND "scopeType" = 'MARKET' AND "scopeId" = ${leg.marketKey} AND currency = ${wager.currency} FOR UPDATE`
  const allocation = one<any>(await tx.wagerExposureAllocation.findMany({ where: { tenantId, wagerId }, take: 2 }), 'EXACT_EXPOSURE_ALLOCATION_REQUIRED')
  const exposure = one<any>(await tx.exposurePosition.findMany({ where: { tenantId, scopeType: 'MARKET', scopeId: leg.marketKey, currency: wager.currency }, take: 2 }), 'EXACT_EXPOSURE_POSITION_REQUIRED')
  const liability = minor(wager.potentialReturnMinor) - minor(wager.stakeMinor)
  if (allocation.marketId !== leg.marketKey || allocation.status !== 'OPEN' || minor(allocation.remainingStakeMinor) !== minor(wager.stakeMinor) || minor(allocation.remainingLiabilityMinor) !== liability || minor(exposure.stakeMinor) < minor(wager.stakeMinor) || minor(exposure.liabilityMinor) < liability) fail('EXPOSURE_CONSERVATION_EVIDENCE_REQUIRED')
  const calculated = settleCombinationPart({ stakeMinor: minor(part.stakeMinor), acceptedPotentialReturnMinor: minor(part.potentialReturnMinor), stakeReturned: true, legs: [{ decimalOdds: leg.decimalOdds, outcome: fact.outcome }] })
  if (calculated.payoutMinor > minor(wager.maxPayoutMinor)) fail('ACCEPTED_PAYOUT_CAP_EXCEEDED')
  const bundle = { contract: CONTRACT, tenantId, wagerId, playerId: wager.playerId, wagerVersion: wager.version, termsHash: wager.termsHash, quoteLegEvidenceHash: quoteLeg.evidenceHash, partId: part.id, legId: leg.id, commandId: command.id, commandRequestHash: command.requestHash, commandReceiptHash: evidenceHash(command.result), stakeMinor: wager.stakeMinor, potentialReturnMinor: wager.potentialReturnMinor, decimalOdds: leg.decimalOdds, line: leg.line, snapshotId: leg.snapshotId, priceProviderConnectionId: acceptedSnapshot.providerConnectionId, currency: wager.currency, currencyExponent: configured.currency.exponent, eventId: leg.eventKey, marketId: leg.marketKey, selectionId: leg.selectionKey, selectionKey: selection.key, resultVersionId: result.id, resultVersion: result.version, resultHash: result.payloadHash, providerConnectionId: result.providerConnectionId, approvalId: approval.id, gradeId: grade.id, gradeHash: grade.inputHash, marketGradeId: marketGrade.id, marketGradeHash: marketGrade.inputHash, ruleId: rule.id, ruleVersion: leg.ruleVersion, ruleHash: rule.semanticHash, ruleApprovalId: ruleApproval.id, outcome: fact.outcome, payoutMinor: String(calculated.payoutMinor), roundingRule: 'DOWN_AT_POSTING', stakeJournalId: stakeJournal.id, stakeEntries: entries.map((entry: any) => ({ id: entry.id, accountId: entry.accountId, side: entry.side, amountMinor: entry.amountMinor, currency: entry.currency })).sort((a: any, b: any) => a.id.localeCompare(b.id)), holdId: hold.id, holdVersion: hold.version, allocationId: allocation.id, allocationVersion: allocation.version, accounts: Object.fromEntries(Object.entries(accounts).map(([key, row]) => [key, row.id])) }
  const plan: FullStraightPlan = { state: 'READY', contract: CONTRACT, planHash: evidenceHash(bundle), tenantId, wagerId, playerId: wager.playerId, outcome: fact.outcome, stakeMinor: wager.stakeMinor, payoutMinor: String(calculated.payoutMinor), currency: wager.currency, currencyExponent: configured.currency.exponent, resultVersionId: result.id, ruleVersion: leg.ruleVersion, bundle }
  return { plan, wager, part, leg, result, grade, balance, hold, accounts, allocation, exposure }
}

export function getFullStraightPlan(prisma: PrismaClient, tenantId: string, actorId: string, wagerId: string, session?: HumanRiskSession): Promise<FullStraightPlan> {
  return serializable(prisma, async (tx: any) => {
    assertHumanSession(session, actorId)
    await assertCurrentRiskOperator(tx, tenantId, actorId)
    const plan = (await loadFullStraightPlan(tx, tenantId, wagerId)).plan
    assertHumanSession(session, actorId)
    return plan
  })
}

/** Called by the existing FULL mutation, never the legacy engine or an audit fallback. */
export async function settleFullStraight(tx: any, tenantId: string, actorId: string, input: { wagerId: string; idempotencyKey: string; planHash?: string; expectedActorId?: string; expectedTenantId?: string }, session?: HumanRiskSession) {
  assertHumanSession(session, actorId)
  if (!/^[A-Za-z0-9:_-]{8,128}$/.test(input.idempotencyKey) || !/^[a-f0-9]{64}$/.test(input.planHash ?? '')) fail('REVIEWED_SETTLEMENT_PLAN_REQUIRED')
  if (input.expectedActorId !== actorId || input.expectedTenantId !== tenantId) fail('SETTLEMENT_INTENT_SCOPE_CHANGED')
  await assertCurrentRiskOperator(tx, tenantId, actorId)
  await lockWagerForSettlement(tx, tenantId, input.wagerId)
  const wager = await tx.wager.findFirst({ where: { id: input.wagerId, tenantId } })
  if (!wager?.playerId) fail('SETTLEMENT_PLAYER_SCOPE_MISMATCH')
  await tx.$queryRaw`SELECT id FROM "Player" WHERE id = ${wager.playerId} AND tenant = ${tenantId} FOR SHARE`
  if (!await tx.player.findFirst({ where: { id: wager.playerId, tenantId } })) fail('SETTLEMENT_PLAYER_SCOPE_MISMATCH')
  const requestHash = evidenceHash({ contract: CONTRACT, tenantId, actorId, wagerId: input.wagerId, planHash: input.planHash, idempotencyKey: input.idempotencyKey })
  const prior = await tx.settlement.findFirst({ where: { tenantId, inputHash: input.idempotencyKey } })
  if (prior) {
    const line = one<any>(await tx.settlementLine.findMany({ where: { tenantId, settlementId: prior.id }, take: 2 }), 'ORIGINAL_SETTLEMENT_RECEIPT_REQUIRED')
    if (prior.wagerId !== input.wagerId || line.trace?.contract !== CONTRACT || line.trace?.requestHash !== requestHash || line.trace?.planHash !== input.planHash) fail('SETTLEMENT_IDEMPOTENCY_CONFLICT')
    const bundle = line.trace.bundle
    if (!bundle || evidenceHash(bundle) !== input.planHash || bundle.tenantId !== tenantId || bundle.wagerId !== input.wagerId || bundle.playerId !== wager.playerId || bundle.termsHash !== wager.termsHash || bundle.stakeMinor !== wager.stakeMinor || bundle.currency !== wager.currency || bundle.payoutMinor !== prior.payoutMinor || bundle.payoutMinor !== line.amountMinor || bundle.resultVersionId !== prior.resultVersionId || bundle.outcome !== prior.outcome || line.trace.capturedHoldId !== bundle.holdId) fail('ORIGINAL_SETTLEMENT_RECEIPT_REQUIRED')
    if (!await tx.journalTransaction.findFirst({ where: { id: prior.journalTransactionId, tenantId, status: 'POSTED', correlationId: input.wagerId, idempotencyKey: `full-straight:${input.idempotencyKey}` } })) fail('ORIGINAL_SETTLEMENT_RECEIPT_REQUIRED')
    const originalCommand = await tx.customerCommand.findFirst({ where: { id: bundle.commandId, tenantId, playerId: wager.playerId, type: 'WAGER', status: 'SUCCEEDED', requestHash: bundle.commandRequestHash } })
    if (!originalCommand || evidenceHash(originalCommand.result) !== bundle.commandReceiptHash) fail('ORIGINAL_SETTLEMENT_RECEIPT_SCOPE_REQUIRED')
    for (const [key, accountId] of Object.entries(bundle.accounts)) if (!await tx.ledgerAccount.findFirst({ where: { id: accountId, tenantId, currency: bundle.currency, key, playerId: key === 'PLAYER_CASH' ? wager.playerId : null } })) fail('ORIGINAL_SETTLEMENT_RECEIPT_SCOPE_REQUIRED')
    const originalJournal = settlementJournal({ idempotencyKey: `full-straight:${input.idempotencyKey}`, stake: minor(bundle.stakeMinor), payout: minor(bundle.payoutMinor), currency: bundle.currency, pendingAccountId: bundle.accounts.WAGERS_PENDING, cashAccountId: bundle.accounts.PLAYER_CASH, revenueAccountId: bundle.accounts.GAMING_REVENUE, winningsExpenseAccountId: bundle.accounts.WINNINGS_EXPENSE })
    const originalEntries = await tx.journalEntry.findMany({ where: { tenantId, transactionId: prior.journalTransactionId }, take: originalJournal.entries.length + 1 })
    const signature = (entry: any) => `${entry.accountId}:${entry.side}:${entry.currency}:${entry.amountMinor ?? String(entry.amount)}`
    if (evidenceHash(originalEntries.map(signature).sort()) !== evidenceHash(originalJournal.entries.map(signature).sort())) fail('ORIGINAL_SETTLEMENT_RECEIPT_REQUIRED')
    assertHumanSession(session, actorId)
    return prior.id // Recover committed original acknowledgement before reevaluating current result/rule.
  }
  const data = await loadFullStraightPlan(tx, tenantId, input.wagerId), { plan, accounts, balance } = data
  if (plan.planHash !== input.planHash) fail('STALE_SETTLEMENT_PLAN')
  const journal = settlementJournal({ idempotencyKey: `full-straight:${input.idempotencyKey}`, stake: minor(plan.stakeMinor), payout: minor(plan.payoutMinor), currency: plan.currency, pendingAccountId: accounts.WAGERS_PENDING.id, cashAccountId: accounts.PLAYER_CASH.id, revenueAccountId: accounts.GAMING_REVENUE.id, winningsExpenseAccountId: accounts.WINNINGS_EXPENSE.id })
  if (await tx.journalTransaction.findFirst({ where: { tenantId, idempotencyKey: journal.idempotencyKey } })) fail('ORIGINAL_SETTLEMENT_RECEIPT_REQUIRED')
  const now = new Date()
  const run = await tx.settlementRun.create({ data: { tenantId, triggerType: 'RESULT_APPROVED', resultVersionId: plan.resultVersionId, inputHash: requestHash, status: 'RUNNING', wagersConsidered: 1, wagersSettled: 0, startedAt: now } })
  assertHumanSession(session, actorId)
  const posted = await postJournal(tx, tenantId, journal, input.wagerId)
  await tx.balanceProjection.create({ data: { tenantId, accountId: accounts.PLAYER_CASH.id, postedMinor: String(minor(balance.postedMinor) + minor(plan.payoutMinor)), availableMinor: String(minor(balance.availableMinor) + minor(plan.payoutMinor)), pendingMinor: balance.pendingMinor, version: balance.version + 1, asOf: now } })
  const settlement = await tx.settlement.create({ data: { tenantId, wagerId: input.wagerId, resultVersionId: plan.resultVersionId, settlementRunId: run.id, version: 1, outcome: plan.outcome, grossPayoutMinor: plan.payoutMinor, payoutMinor: plan.payoutMinor, taxMinor: '0', inputHash: input.idempotencyKey, journalTransactionId: posted.id } })
  await tx.settlementLine.create({ data: { tenantId, settlementId: settlement.id, wagerPartId: data.part.id, wagerLegId: data.leg.id, lineType: plan.outcome === 'LOSS' ? 'LOSS' : plan.outcome === 'VOID' ? 'STAKE_RETURN' : 'PROFIT', amountMinor: plan.payoutMinor, unroundedValue: `${plan.payoutMinor}.000000`, scale: 6, roundingRule: 'DOWN_AT_POSTING', residualMinor: '0', trace: { contract: CONTRACT, requestHash, planHash: plan.planHash, bundle: plan.bundle, capturedHoldId: data.hold.id, grades: [{ legId: data.leg.id, gradeId: data.grade.id, outcome: plan.outcome }] } } })
  const changed = await tx.wager.updateMany({ where: { id: input.wagerId, tenantId, version: data.wager.version, status: data.wager.status }, data: { status: 'SETTLED', version: { increment: 1 } } })
  if (changed.count !== 1) fail('STALE_WAGER_STATE')
  await tx.wagerPart.update({ where: { id: data.part.id }, data: { status: 'SETTLED', settlementId: settlement.id, gradeSummary: { outcome: plan.outcome, payoutMinor: plan.payoutMinor, resultVersionId: plan.resultVersionId, ruleVersion: plan.ruleVersion } } })
  const closedStake = minor(data.allocation.remainingStakeMinor), closedLiability = minor(data.allocation.remainingLiabilityMinor)
  const closed = await tx.wagerExposureAllocation.updateMany({ where: { id: data.allocation.id, tenantId, wagerId: input.wagerId, version: data.allocation.version, status: 'OPEN' }, data: { remainingStakeMinor: '0', remainingLiabilityMinor: '0', status: 'CLOSED', version: { increment: 1 } } })
  if (closed.count !== 1) fail('STALE_EXPOSURE_ALLOCATION')
  await tx.exposurePosition.update({ where: { id: data.exposure.id }, data: { stakeMinor: String(minor(data.exposure.stakeMinor) - closedStake), liabilityMinor: String(minor(data.exposure.liabilityMinor) - closedLiability), version: { increment: 1 }, asOf: now } })
  // Acceptance already debited the source and CAPTURED its hold. Preserve that fact; no second release.
  await tx.settlementRun.update({ where: { id: run.id }, data: { status: 'COMPLETED', wagersSettled: 1, completedAt: now } })
  await appendAudit(tx, tenantId, actorId, 'wager.settled_full', 'Wager', input.wagerId, 'REVIEWED_FULL_STRAIGHT_PLAN', { settlementId: settlement.id, requestHash, planHash: plan.planHash, resultVersionId: plan.resultVersionId, payoutMinor: plan.payoutMinor })
  await emit(tx, tenantId, 'WAGER', input.wagerId, 'wager.settled.v2', { settlementId: settlement.id, planHash: plan.planHash, payoutMinor: plan.payoutMinor, currency: plan.currency })
  assertHumanSession(session, actorId)
  return settlement.id
}
