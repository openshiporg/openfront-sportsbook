export const PORTION_SCALE = 1_000_000n

type PartStake = { stakeMinor: string | bigint }

export type CashOutAcceptanceFact = {
  id: string
  status: string | null
  reversalOfId?: string | null
  tenantId: string
  wagerId: string
  playerId: string
  offerId: string
  amountMinor: string
  currency: string
  portionNumerator: string
  portionDenominator: string
  journalTransactionId: string
}

function nonNegativeMinor(value: string, errorCode: string): bigint {
  if (!/^\d+$/.test(value)) throw new Error(errorCode)
  return BigInt(value)
}

export function cashOutPortionMillionths(portionNumerator: string, portionDenominator: string): bigint {
  if (!/^\d+$/.test(portionNumerator) || !/^\d+$/.test(portionDenominator)) {
    throw new Error('INVALID_CASH_OUT_PORTION')
  }
  const numerator = BigInt(portionNumerator)
  const denominator = BigInt(portionDenominator)
  if (numerator <= 0n || denominator <= 0n || numerator > denominator) throw new Error('INVALID_CASH_OUT_PORTION')
  const scaled = numerator * PORTION_SCALE
  if (scaled % denominator !== 0n) throw new Error('CASH_OUT_PORTION_PRECISION_UNSUPPORTED')
  return scaled / denominator
}

export function cashOutStakeForPortion(totalStakeMinor: bigint, alreadyClosedMillionths: bigint, nextMillionths: bigint): bigint {
  if (totalStakeMinor < 0n || alreadyClosedMillionths < 0n || nextMillionths < 0n || alreadyClosedMillionths + nextMillionths > PORTION_SCALE) {
    throw new Error('INVALID_CASH_OUT_PORTION')
  }
  const before = totalStakeMinor * alreadyClosedMillionths / PORTION_SCALE
  const after = totalStakeMinor * (alreadyClosedMillionths + nextMillionths) / PORTION_SCALE
  return after - before
}

function portionMillionths(row: CashOutAcceptanceFact): bigint {
  return cashOutPortionMillionths(row.portionNumerator, row.portionDenominator)
}

/**
 * Project the immutable accepted rows net of their exact, singly-linked reversal rows.
 * A malformed or incomplete lineage is an integrity failure, never an implicit no-op.
 */
export function projectCashOutAcceptanceState<T extends CashOutAcceptanceFact>(rows: T[]) {
  const byId = new Map<string, T>()
  for (const row of rows) {
    if (!row.id || byId.has(row.id)) throw new Error('DUPLICATE_CASH_OUT_ACCEPTANCE_ID')
    if (!row.tenantId || !row.wagerId || !row.playerId || !row.offerId || !row.currency || !row.journalTransactionId) {
      throw new Error('INVALID_CASH_OUT_ACCEPTANCE')
    }
    byId.set(row.id, row)
  }

  const acceptedRows: T[] = []
  const reversals: T[] = []
  const reversedIds = new Set<string>()
  for (const row of rows) {
    if (row.status === 'ACCEPTED') {
      if (row.reversalOfId) throw new Error('INVALID_CASH_OUT_REVERSAL_CHAIN')
      nonNegativeMinor(row.amountMinor, 'INVALID_CASH_OUT_AMOUNT')
      portionMillionths(row)
      acceptedRows.push(row)
      continue
    }
    if (row.status !== 'REVERSED' || !row.reversalOfId) throw new Error('INVALID_CASH_OUT_REVERSAL_CHAIN')
    const original = byId.get(row.reversalOfId)
    if (!original || original.status !== 'ACCEPTED' || original.reversalOfId) throw new Error('CASH_OUT_REVERSAL_PARENT_REQUIRED')
    if (reversedIds.has(original.id)) throw new Error('DUPLICATE_CASH_OUT_REVERSAL')
    if (
      row.tenantId !== original.tenantId || row.wagerId !== original.wagerId ||
      row.playerId !== original.playerId || row.offerId !== original.offerId ||
      row.amountMinor !== original.amountMinor || row.currency !== original.currency ||
      row.portionNumerator !== original.portionNumerator ||
      row.portionDenominator !== original.portionDenominator
    ) throw new Error('CASH_OUT_REVERSAL_ECONOMICS_MISMATCH')
    if (!row.journalTransactionId || !original.journalTransactionId || row.journalTransactionId === original.journalTransactionId) {
      throw new Error('CASH_OUT_REVERSAL_JOURNAL_REQUIRED')
    }
    nonNegativeMinor(row.amountMinor, 'INVALID_CASH_OUT_AMOUNT')
    portionMillionths(row)
    reversedIds.add(original.id)
    reversals.push(row)
  }

  const effectiveAcceptances = acceptedRows.filter(row => !reversedIds.has(row.id))
  const closedMillionths = effectiveAcceptances.reduce((sum, row) => sum + portionMillionths(row), 0n)
  if (closedMillionths > PORTION_SCALE) throw new Error('CASH_OUT_PORTION_OVERCOMMITTED')
  const acceptedAmountMinor = effectiveAcceptances.reduce((sum, row) => sum + nonNegativeMinor(row.amountMinor, 'INVALID_CASH_OUT_AMOUNT'), 0n)
  const reversedAmountMinor = reversals.reduce((sum, row) => sum + nonNegativeMinor(row.amountMinor, 'INVALID_CASH_OUT_AMOUNT'), 0n)

  return {
    accepted: effectiveAcceptances,
    reversals,
    closedMillionths,
    remainingMillionths: PORTION_SCALE - closedMillionths,
    acceptedAmountMinor,
    reversedAmountMinor,
  }
}

/** Allocate exact aggregate remaining stake; deterministic residual cents go to earlier indexes. */
export function remainingStakeByPart<T extends PartStake>(parts: T[], closedMillionths: bigint): bigint[] {
  if (closedMillionths < 0n || closedMillionths > PORTION_SCALE) throw new Error('INVALID_CASH_OUT_PORTION')
  const stakes = parts.map((part) => typeof part.stakeMinor === 'bigint' ? part.stakeMinor : nonNegativeMinor(part.stakeMinor, 'INVALID_STAKE'))
  if (stakes.some((stake) => stake < 0n)) throw new Error('INVALID_STAKE')
  const total = stakes.reduce((sum, stake) => sum + stake, 0n)
  const remainingTotal = total - total * closedMillionths / PORTION_SCALE
  const remaining = stakes.map((stake) => stake * (PORTION_SCALE - closedMillionths) / PORTION_SCALE)
  let residual = remainingTotal - remaining.reduce((sum, stake) => sum + stake, 0n)
  for (let index = 0; residual > 0n && index < remaining.length; index++, residual--) remaining[index] += 1n
  if (residual !== 0n) throw new Error('CASH_OUT_RESIDUAL_ALLOCATION_FAILED')
  return remaining
}

export function projectCashOutState<T extends CashOutAcceptanceFact, P extends PartStake = PartStake>(
  totalStakeMinor: string | bigint,
  rows: T[],
  parts?: P[],
) {
  const totalStake = typeof totalStakeMinor === 'bigint' ? totalStakeMinor : nonNegativeMinor(totalStakeMinor, 'INVALID_STAKE')
  if (totalStake < 0n) throw new Error('INVALID_STAKE')
  const acceptanceState = projectCashOutAcceptanceState(rows)
  const closedStakeMinor = totalStake * acceptanceState.closedMillionths / PORTION_SCALE
  const remainingStakeMinor = totalStake - closedStakeMinor
  let remainingPartStakeMinor: bigint[] | undefined
  if (parts !== undefined) {
    const partTotal = parts.reduce((sum, part) => sum + (typeof part.stakeMinor === 'bigint' ? part.stakeMinor : nonNegativeMinor(part.stakeMinor, 'INVALID_STAKE')), 0n)
    if (partTotal !== totalStake) throw new Error('CASH_OUT_PART_STAKE_MISMATCH')
    remainingPartStakeMinor = remainingStakeByPart(parts, acceptanceState.closedMillionths)
    if (remainingPartStakeMinor.reduce((sum, stake) => sum + stake, 0n) !== remainingStakeMinor) {
      throw new Error('CASH_OUT_PART_PROJECTION_MISMATCH')
    }
  }
  return { ...acceptanceState, totalStakeMinor: totalStake, closedStakeMinor, remainingStakeMinor, remainingPartStakeMinor }
}

/** Kept as a compatibility alias; new consumers should use the full state projection. */
export function effectiveCashOutAcceptances<T extends CashOutAcceptanceFact>(rows: T[]): T[] {
  return projectCashOutAcceptanceState(rows).accepted
}
