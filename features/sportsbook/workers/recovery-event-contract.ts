const unhandledRecoveryEvents = new Set(['recovery.requested', 'recovery.requested.v1'])

/** Keep recovery requests out of the generic audit-only success path. */
export function assertRecoveryEventHasHandler(eventType: unknown) {
  if (typeof eventType === 'string' && unhandledRecoveryEvents.has(eventType)) {
    throw new Error(`RECOVERY_HANDLER_NOT_IMPLEMENTED:${eventType}`)
  }
}
