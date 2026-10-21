/**
 * Keep unresolved payment outcomes out of the generic audit-only success path. payment.unknown.v1 is handled by
 * the reconciliation consumer (customer/funding.ts reconcileUnknownPayment) before this fallback; reaching it here
 * means it was routed wrongly, so it must never be completed by an audit write.
 */
export async function runOutboxAuditFallback(eventType: unknown, appendAudit: () => Promise<unknown>) {
  if (eventType === 'payment.unknown.v1') {
    throw new Error('PAYMENT_UNKNOWN_REQUIRES_RECONCILIATION_CONSUMER')
  }
  return appendAudit()
}
