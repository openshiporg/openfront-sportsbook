import { runWithTenantScope } from '../../keystone/tenant-scope'
import { claimFenceWhere } from './lease-fencing'

async function claimTenantQueue(
  prisma: any,
  modelName: 'outboxMessage' | 'inboxMessage' | 'scheduledJob',
  tenantId: string,
  workerId: string,
  limit: number,
  leaseUntil: Date,
  eligibility: (now: Date) => Record<string, unknown>[],
  orderBy: Record<string, string>,
  mapJob: (row: any, attempts: number) => any,
) {
  return runWithTenantScope(tenantId, () => prisma.$transaction(async (tx: any) => {
    const now = new Date()
    const rows = await tx[modelName].findMany({
      where: { tenantId, OR: eligibility(now) },
      orderBy,
      take: limit,
    })
    const claimed = []
    for (const row of rows) {
      const attempts = Number(row.attempts ?? 0) + 1
      const updated = await tx[modelName].updateMany({
        where: claimFenceWhere(modelName, row, now),
        data: { status: 'PROCESSING', leaseUntil, leaseOwner: workerId, attempts, lastError: '' },
      })
      if (updated.count === 1) claimed.push(mapJob(row, attempts))
    }
    return claimed
  }))
}

export async function claimOutbox(prisma: any, tenantId: string, workerId: string, limit: number, leaseUntil: Date) {
  return claimTenantQueue(prisma, 'outboxMessage', tenantId, workerId, limit, leaseUntil,
    (now) => [{ status: 'PENDING', availableAt: { lte: now } }, { status: 'PROCESSING', leaseUntil: { lte: now } }],
    { createdAt: 'asc' },
    (row, attempts) => ({ ...row, attempts, maxAttempts: Number(row.maxAttempts ?? 10) }),
  )
}

export async function claimInbox(prisma: any, tenantId: string, workerId: string, limit: number, leaseUntil: Date) {
  return claimTenantQueue(prisma, 'inboxMessage', tenantId, workerId, limit, leaseUntil,
    (now) => [{ status: 'PENDING', availableAt: { lte: now } }, { status: 'PROCESSING', leaseUntil: { lte: now } }],
    { createdAt: 'asc' },
    (row, attempts) => ({ ...row, attempts, maxAttempts: 10 }),
  )
}

export async function claimScheduledJobs(prisma: any, tenantId: string, workerId: string, limit: number, leaseUntil: Date) {
  return claimTenantQueue(prisma, 'scheduledJob', tenantId, workerId, limit, leaseUntil,
    (now) => [{ status: 'SCHEDULED', dueAt: { lte: now } }, { status: 'PROCESSING', leaseUntil: { lte: now } }],
    { dueAt: 'asc' },
    (row, attempts) => ({ ...row, attempts, maxAttempts: Number(row.maxAttempts ?? 10), availableAt: row.dueAt }),
  )
}

export async function releaseWorkerLeases(prisma: any, workerId: string) {
  const tenants = await prisma.tenant.findMany({ select: { id: true } })
  return Promise.all(tenants.map(({ id }: { id: string }) => runWithTenantScope(id, () => Promise.all([
    prisma.outboxMessage.updateMany({ where: { tenantId: id, status: 'PROCESSING', leaseOwner: workerId }, data: { status: 'PENDING', leaseOwner: '', leaseUntil: null, availableAt: new Date() } }),
    prisma.inboxMessage.updateMany({ where: { tenantId: id, status: 'PROCESSING', leaseOwner: workerId }, data: { status: 'PENDING', leaseOwner: '', leaseUntil: null, availableAt: new Date() } }),
    prisma.scheduledJob.updateMany({ where: { tenantId: id, status: 'PROCESSING', leaseOwner: workerId }, data: { status: 'SCHEDULED', leaseOwner: '', leaseUntil: null, dueAt: new Date() } }),
  ]))))
}
