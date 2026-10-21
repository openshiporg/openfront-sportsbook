export interface Job {
  id: string
  attempts: number
  maxAttempts: number
  availableAt: Date
}

export interface JobStore<T extends Job> {
  claim(workerId: string, limit: number, leaseUntil: Date): Promise<T[]>
  complete(job: T, workerId: string): Promise<void>
  retry(job: T, workerId: string, availableAt: Date, reason: string): Promise<void>
  deadLetter(job: T, workerId: string, reason: string): Promise<void>
  renew?(job: T, workerId: string, leaseUntil: Date): Promise<void>
}

export interface WorkerOptions {
  batchSize?: number
  leaseMs?: number
  baseBackoffMs?: number
  maxBackoffMs?: number
  signal?: AbortSignal
  now?: () => Date
  scheduleRenewal?: (callback: () => void, intervalMs: number) => () => void
}

export const retryDelay = (attempt: number, base = 1_000, max = 300_000) => Math.min(max, base * 2 ** Math.max(0, attempt))

const scheduleIntervalRenewal: NonNullable<WorkerOptions['scheduleRenewal']> = (callback, intervalMs) => {
  const timer = setInterval(callback, intervalMs)
  return () => clearInterval(timer)
}

export async function runBatch<T extends Job>(
  workerId: string,
  store: JobStore<T>,
  handler: (job: T, workerId: string) => Promise<void>,
  options: WorkerOptions = {},
) {
  const now = options.now ?? (() => new Date())
  if (options.signal?.aborted) return { claimed: 0, completed: 0, retried: 0, deadLettered: 0 }

  const leaseMs = options.leaseMs ?? 30_000
  if (!Number.isInteger(leaseMs) || leaseMs < 1_000 || leaseMs > 600_000) throw new Error('INVALID_WORKER_LEASE_MS')
  const batchSize = options.batchSize ?? 50
  if (!Number.isInteger(batchSize) || batchSize < 1 || batchSize > 500) throw new Error('INVALID_WORKER_BATCH_SIZE')

  const jobs = await store.claim(workerId, batchSize, new Date(now().getTime() + leaseMs))
  const result = { claimed: jobs.length, completed: 0, retried: 0, deadLettered: 0 }

  for (const job of jobs) {
    if (options.signal?.aborted) break

    let renewalFailed = false
    let renewalFailure: unknown
    let renewalInFlight: Promise<void> | null = null
    let stopRenewalTimer: (() => void) | null = null
    let renewalStopped = false

    const stopAndDrainRenewal = async () => {
      renewalStopped = true
      stopRenewalTimer?.()
      stopRenewalTimer = null
      const inFlight = renewalInFlight
      if (inFlight) await inFlight
    }

    const renewInBackground = () => {
      if (renewalStopped || renewalFailed || renewalInFlight || !store.renew) return
      renewalInFlight = Promise.resolve()
        .then(() => store.renew!(job, workerId, new Date(now().getTime() + leaseMs)))
        .catch(error => {
          renewalFailed = true
          renewalFailure = error
        })
        .finally(() => { renewalInFlight = null })
    }

    try {
      if (store.renew) {
        // Validate ownership and extend before handler effects, including jobs delayed in a serial batch.
        await store.renew(job, workerId, new Date(now().getTime() + leaseMs))
        stopRenewalTimer = (options.scheduleRenewal ?? scheduleIntervalRenewal)(
          renewInBackground,
          Math.max(1, Math.floor(leaseMs / 3)),
        )
      }

      // Handlers receive the worker identity so effect transactions can re-assert the live lease fence.
      await handler(job, workerId)
      await stopAndDrainRenewal()
      if (renewalFailed) throw renewalFailure
      await store.complete(job, workerId)
      result.completed++
    } catch (error) {
      await stopAndDrainRenewal()
      const finalError = renewalFailed ? renewalFailure : error
      const reason = finalError instanceof Error ? finalError.message : 'UNKNOWN_ERROR'
      if (job.attempts >= job.maxAttempts) {
        await store.deadLetter(job, workerId, reason)
        result.deadLettered++
      } else {
        await store.retry(
          job,
          workerId,
          new Date(now().getTime() + retryDelay(job.attempts - 1, options.baseBackoffMs, options.maxBackoffMs)),
          reason,
        )
        result.retried++
      }
    } finally {
      await stopAndDrainRenewal()
    }
  }

  return result
}
