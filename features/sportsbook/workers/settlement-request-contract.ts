/** A requested settlement is work, not a notification that an audit write can complete. */
export function assertSettlementRequestHasHandler(eventType: unknown) {
  if (eventType === 'settlement.requested') {
    throw new Error('SETTLEMENT_EXECUTION_NOT_IMPLEMENTED')
  }
}
