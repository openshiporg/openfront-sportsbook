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
