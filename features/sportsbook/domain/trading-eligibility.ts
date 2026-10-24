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
