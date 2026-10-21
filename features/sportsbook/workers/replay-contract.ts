import { assertArtifactDeliveryHasHandler } from './artifact-delivery-contract'
import { assertRecoveryEventHasHandler } from './recovery-event-contract'
import { assertScheduledJobHasHandler } from './scheduled-job-contract'
import { assertSettlementRequestHasHandler } from './settlement-request-contract'

const reasonOf = (error: unknown) => (error instanceof Error ? error.message : 'UNSUPPORTED')

/** Why an outbox event can never complete in the worker; null when the worker has a real handler for it. */
export function outboxEventUnavailableReason(eventType: unknown): string | null {
  try {
    assertRecoveryEventHasHandler(eventType)
    assertSettlementRequestHasHandler(eventType)
    assertArtifactDeliveryHasHandler(eventType)
    return null
  } catch (error) {
    return reasonOf(error)
  }
}

/** Why a scheduled job type can never complete in the worker; null when main.ts implements it. */
export function scheduledJobUnavailableReason(type: unknown): string | null {
  try {
    assertScheduledJobHasHandler(type)
    return null
  } catch (error) {
    return reasonOf(error)
  }
}

export type ReplaySource = { kind: string; status?: string | null; eventType?: string | null; jobType?: string | null }

/**
 * Finite replay transition table shared by the replay mutation and operator screens.
 * Only terminal-failed work whose source kind has a working handler may be re-queued;
 * active (PROCESSING), pending or completed work is never reset.
 */
export function replayUnavailableReason(source: ReplaySource | null): string | null {
  if (!source) return 'SOURCE_NOT_FOUND'
  if (source.kind === 'OUTBOX') return source.status === 'DEAD' ? outboxEventUnavailableReason(source.eventType) : `OUTBOX_NOT_DEAD:${String(source.status)}`
  if (source.kind === 'INBOX') return source.status === 'DEAD' ? null : `INBOX_NOT_DEAD:${String(source.status)}`
  if (source.kind === 'SCHEDULED_JOB') return source.status === 'FAILED' ? scheduledJobUnavailableReason(source.jobType) : `SCHEDULED_JOB_NOT_FAILED:${String(source.status)}`
  return `REPLAY_UNSUPPORTED_SOURCE:${source.kind}`
}

/** Model behind each replayable source kind. */
export const replaySourceModel = (kind: string) =>
  kind === 'OUTBOX' ? 'outboxMessage' : kind === 'INBOX' ? 'inboxMessage' : kind === 'SCHEDULED_JOB' ? 'scheduledJob' : null
