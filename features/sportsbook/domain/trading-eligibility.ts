export function isEventTradingEligible(status: unknown): status is 'SCHEDULED' | 'LIVE' {
  return status === 'SCHEDULED' || status === 'LIVE'
}

/** Reopening terminal, suspended, or unknown event state has no reviewed policy yet. */
export function assertEventTradingTransition(currentStatus: unknown, nextStatus: unknown) {
  if (isEventTradingEligible(nextStatus) && !isEventTradingEligible(currentStatus)) {
    throw new Error('TRADING_REOPENING_REQUIRES_REVIEWED_POLICY')
  }
}

/** OPEN is not a generic recovery action; the current market and parent must already be eligible. */
export function assertMarketOpenAllowed(marketStatus: unknown, eventStatus: unknown) {
  if (!isEventTradingEligible(eventStatus)) throw new Error('PARENT_EVENT_NOT_TRADING_ELIGIBLE')
  if (marketStatus !== 'OPEN') throw new Error('MARKET_REOPENING_REQUIRES_REVIEWED_POLICY')
}

export function assertEventAllowsNewMarket(eventStatus: unknown) {
  if (!isEventTradingEligible(eventStatus)) throw new Error('PARENT_EVENT_NOT_TRADING_ELIGIBLE')
}

/** Status-change source marking a market created suspended until a trader prices it. */
export const AWAITING_PRICES = 'AWAITING_PRICES'

/**
 * A market created suspended for pricing may open exactly once, before it has ever traded: its parent must be
 * trading-eligible and every selection must hold a current price. Any later reopening keeps the reviewed policy.
 */
export function assertMarketFirstOpenAllowed(input: { eventStatus: unknown; createdAwaitingPrices: boolean; everOpened: boolean; unpricedSelections: number; selections: number }) {
  if (!isEventTradingEligible(input.eventStatus)) throw new Error('PARENT_EVENT_NOT_TRADING_ELIGIBLE')
  if (!input.createdAwaitingPrices || input.everOpened) throw new Error('MARKET_REOPENING_REQUIRES_REVIEWED_POLICY')
  if (input.selections === 0 || input.unpricedSelections > 0) throw new Error('MARKET_NOT_FULLY_PRICED')
}

/**
 * A pre-match event only takes bets before its start time: a SCHEDULED event that has passed its start without
 * going LIVE is withdrawn from the board, so nobody can bet on a game already under way (past-posting).
 */
export function isEventAcceptingBets(event: { status?: unknown; startAt?: Date | string | null }, now: Date = new Date()) {
  if (event.status === 'LIVE') return true
  if (event.status !== 'SCHEDULED' || !event.startAt) return false
  return new Date(event.startAt).getTime() > now.getTime()
}

/** Where-clause fragment matching the same rule as `isEventAcceptingBets` for listing (SUSPENDED stays visible). */
export function pastStartScheduledExclusion(now: Date = new Date()) {
  return { NOT: { status: 'SCHEDULED', startAt: { lte: now } } }
}

/**
 * Price freshness. In-play prices expire quickly (MAX_PRICE_AGE_MS, default 30s) because the game moves; a
 * pre-match price set by a trader or feed stands until it is replaced, bounded by MAX_PREMATCH_PRICE_AGE_MS
 * (default 24h).
 */
export function maxPriceAgeMs(live: boolean) {
  const value = Number(live ? process.env.MAX_PRICE_AGE_MS ?? 30_000 : process.env.MAX_PREMATCH_PRICE_AGE_MS ?? 86_400_000)
  return Number.isFinite(value) && value > 0 ? value : live ? 30_000 : 86_400_000
}

export function isLivePricing(eventStatus: unknown, tradingMode?: unknown) {
  return eventStatus === 'LIVE' || tradingMode === 'LIVE'
}

/** Reviewed lifecycle maps. A same-state write is always allowed (idempotent retry); anything else must be listed. */
const EVENT_TRANSITIONS: Record<string, string[]> = {
  SCHEDULED: ['LIVE', 'SUSPENDED', 'ENDED', 'CANCELLED'],
  LIVE: ['SUSPENDED', 'ENDED', 'CANCELLED'],
  SUSPENDED: ['ENDED', 'CANCELLED'],
  ENDED: [],
  CANCELLED: [],
}
const MARKET_TRANSITIONS: Record<string, string[]> = {
  OPEN: ['SUSPENDED', 'CLOSED', 'GRADED'],
  SUSPENDED: ['OPEN', 'CLOSED', 'GRADED'],
  CLOSED: ['GRADED'],
  GRADED: [],
}
const SUPPORT_CASE_TRANSITIONS: Record<string, string[]> = {
  OPEN: ['TRIAGED', 'WAITING_CUSTOMER', 'WAITING_OPERATOR', 'RESOLVED', 'CLOSED'],
  TRIAGED: ['WAITING_CUSTOMER', 'WAITING_OPERATOR', 'RESOLVED', 'CLOSED'],
  WAITING_CUSTOMER: ['TRIAGED', 'WAITING_OPERATOR', 'RESOLVED', 'CLOSED'],
  WAITING_OPERATOR: ['TRIAGED', 'WAITING_CUSTOMER', 'RESOLVED', 'CLOSED'],
  RESOLVED: ['TRIAGED', 'WAITING_OPERATOR', 'CLOSED'],
  CLOSED: [],
}

function assertTransition(map: Record<string, string[]>, kind: string, from: unknown, to: unknown) {
  if (from === to) return
  if (!map[String(from)]?.includes(String(to))) throw new Error(`${kind}_TRANSITION_NOT_ALLOWED:${String(from)}->${String(to)}`)
}
export const assertEventTransition = (from: unknown, to: unknown) => assertTransition(EVENT_TRANSITIONS, 'EVENT', from, to)
export const assertMarketTransition = (from: unknown, to: unknown) => assertTransition(MARKET_TRANSITIONS, 'MARKET', from, to)
export const assertSupportCaseTransition = (from: unknown, to: unknown) => assertTransition(SUPPORT_CASE_TRANSITIONS, 'SUPPORT_CASE', from, to)
