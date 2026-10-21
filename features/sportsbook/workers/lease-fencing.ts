type QueueModel = 'outboxMessage' | 'inboxMessage' | 'scheduledJob'

type LeaseRecord = {
  id: string
  tenantId: string
  status: string
  attempts: number
}

/** Reassert the eligibility observed by the claim query in the atomic update. */
export function claimFenceWhere(model: QueueModel, row: LeaseRecord, now: Date) {
  const timeFence = row.status === 'PROCESSING'
    ? { leaseUntil: { lte: now } }
    : model === 'scheduledJob' && row.status === 'SCHEDULED'
      ? { dueAt: { lte: now } }
      : model !== 'scheduledJob' && row.status === 'PENDING'
        ? { availableAt: { lte: now } }
        : null

  if (!timeFence) throw new Error(`UNCLAIMABLE_QUEUE_STATE:${model}:${row.status}`)

  return {
    id: row.id,
    tenantId: row.tenantId,
    status: row.status,
    attempts: row.attempts,
    ...timeFence,
  }
}

/** Fence all worker-owned mutations on identity, attempt, and a still-live lease. */
export function activeLeaseFenceWhere(job: LeaseRecord, workerId: string, now: Date) {
  return {
    id: job.id,
    tenantId: job.tenantId,
    status: 'PROCESSING',
    leaseOwner: workerId,
    attempts: job.attempts,
    leaseUntil: { gt: now },
  }
}
