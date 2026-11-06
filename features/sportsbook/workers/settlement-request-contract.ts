/** A requested settlement is work, not a notification that an audit write can complete. The worker implements it in settlement-request.ts. */
export function assertSettlementRequestHasHandler(eventType: unknown) {
  void eventType
}
