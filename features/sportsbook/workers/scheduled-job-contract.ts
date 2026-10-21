const handledScheduledJobTypes = [
  'PROVIDER_HEALTH',
  'NOTIFICATION',
  'EXPIRY',
  'RECONCILIATION',
] as const

type HandledScheduledJobType = (typeof handledScheduledJobTypes)[number]
const handledScheduledJobTypeSet = new Set<string>(handledScheduledJobTypes)

/** Reject job types before any handler effect unless main.ts has an explicit implementation. */
export function assertScheduledJobHasHandler(type: unknown): asserts type is HandledScheduledJobType {
  if (typeof type !== 'string' || !handledScheduledJobTypeSet.has(type)) {
    throw new Error(`UNSUPPORTED_SCHEDULED_JOB:${String(type)}`)
  }
}
