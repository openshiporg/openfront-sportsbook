/**
 * Authoritative BalanceProjection arithmetic.
 *
 * availableMinor = postedMinor - active reservations (ACTIVE holds). Every writer moves posted and
 * available by explicit deltas so existing reservations and pendingMinor survive the write; no
 * command may recompute availability from the new posted balance.
 */
export type ProjectionRow = { postedMinor: string; pendingMinor: string; availableMinor: string; version: number | null }

export type ProjectionChange = {
  /** Change to the posted ledger balance (journal effect on this account). */
  postedDelta?: bigint
  /** Change to spendable funds. Defaults to postedDelta (a posting that does not touch a reservation). */
  availableDelta?: bigint
}

export function nextProjection(current: ProjectionRow, change: ProjectionChange, now = new Date()) {
  const postedDelta = change.postedDelta ?? 0n
  const availableDelta = change.availableDelta ?? postedDelta
  const posted = BigInt(current.postedMinor) + postedDelta
  const available = BigInt(current.availableMinor) + availableDelta
  if (available > posted) throw new Error('BALANCE_PROJECTION_INVARIANT')
  return {
    postedMinor: String(posted),
    pendingMinor: current.pendingMinor,
    availableMinor: String(available),
    version: Number(current.version ?? 0) + 1,
    asOf: now,
  }
}

/** Posting that credits/debits the account without touching any reservation. */
export const postedChange = (delta: bigint): ProjectionChange => ({ postedDelta: delta, availableDelta: delta })
/** Reserve funds for an in-flight outflow: spendable decreases, posted unchanged. */
export const reserveChange = (amount: bigint): ProjectionChange => ({ postedDelta: 0n, availableDelta: -amount })
/** Release a reservation after definitive non-effect: spendable restored, posted unchanged. */
export const releaseChange = (amount: bigint): ProjectionChange => ({ postedDelta: 0n, availableDelta: amount })
/** Capture a reservation into a posted debit: posted decreases, spendable already reduced. */
export const captureChange = (amount: bigint): ProjectionChange => ({ postedDelta: -amount, availableDelta: 0n })
