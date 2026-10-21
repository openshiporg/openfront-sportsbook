import { timingSafeEqual } from 'node:crypto'
import { readdirSync } from 'node:fs'
import path from 'node:path'
import { keystoneContext } from '@/features/keystone/context'
import { runWithTenantScope } from '@/features/keystone/tenant-scope'
export const dynamic = 'force-dynamic'

const safeEqual = (left: string, right: string) => { const a = Buffer.from(left), b = Buffer.from(right); return a.length === b.length && timingSafeEqual(a, b) }
/** Detailed operating state uses the same restricted boundary as /api/metrics; the public probe sees only status. */
const detailAllowed = (request: Request) => {
  if (process.env.NODE_ENV !== 'production') return true
  const configured = process.env.METRICS_BEARER_TOKEN
  return Boolean(configured) && safeEqual(request.headers.get('authorization') ?? '', `Bearer ${configured}`)
}
const shippedMigrations = (): string[] | null => {
  try { return readdirSync(path.join(process.cwd(), 'migrations'), { withFileTypes: true }).filter(entry => entry.isDirectory() && /^\d{14}_/.test(entry.name)).map(entry => entry.name).sort() }
  catch { return null }
}
const ANCHOR_GRACE_MS = 300_000

async function tenantAuditFrontier(tenantId: string, now: Date) {
  return runWithTenantScope(tenantId, async () => {
    const prisma = keystoneContext.prisma as any
    const [head, anchor] = await Promise.all([
      prisma.auditEvent.findFirst({ where: { tenantId }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], select: { hash: true, createdAt: true } }),
      prisma.auditAnchor.findFirst({ where: { tenantId, status: 'ANCHORED' }, orderBy: { anchoredAt: 'desc' }, select: { chainHeadHash: true, anchoredAt: true } }),
    ])
    if (!head || anchor?.chainHeadHash === head.hash) return { tenantId, anchored: true, lagMs: 0 }
    const oldestUnanchored = await prisma.auditEvent.findFirst({ where: { tenantId, ...(anchor ? { createdAt: { gt: anchor.anchoredAt } } : {}) }, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }], select: { createdAt: true } })
    // An anchor newer than the head that does not match it is invalid evidence, never a grace period.
    if (!oldestUnanchored) return { tenantId, anchored: false, lagMs: Number.POSITIVE_INFINITY }
    const lagMs = Math.max(0, now.getTime() - oldestUnanchored.createdAt.getTime())
    return { tenantId, anchored: lagMs < ANCHOR_GRACE_MS, lagMs }
  })
}

export async function GET(request: Request) {
  try {
    const now = new Date()
    const [migration, staleOutbox, staleInbox, staleScheduled, degradedProviders, oldestOutbox, oldestInbox, oldestScheduled, role, rlsTables, rlsCoverage, tenants, exposureMismatch, activeWorkers, staleWorkers, privilegedWithoutMfa] = await Promise.all([
      keystoneContext.prisma.$queryRaw<Array<{ migration_name: string; finished: boolean; rolled_back: boolean }>>`SELECT migration_name, finished_at IS NOT NULL AS finished, rolled_back_at IS NOT NULL AS rolled_back FROM "_prisma_migrations" ORDER BY started_at ASC`,
      keystoneContext.prisma.outboxMessage.count({ where: { status: 'PROCESSING', leaseUntil: { lt: now } } }),
      keystoneContext.prisma.inboxMessage.count({ where: { status: 'PROCESSING', leaseUntil: { lt: now } } }),
      keystoneContext.prisma.scheduledJob.count({ where: { status: 'PROCESSING', leaseUntil: { lt: now } } }),
      keystoneContext.prisma.providerConnection.count({ where: { status: 'DEGRADED' } }),
      keystoneContext.prisma.outboxMessage.findFirst({ where: { status: 'PENDING' }, orderBy: { availableAt: 'asc' }, select: { availableAt: true } }),
      keystoneContext.prisma.inboxMessage.findFirst({ where: { status: 'PENDING' }, orderBy: { availableAt: 'asc' }, select: { availableAt: true } }),
      keystoneContext.prisma.scheduledJob.findFirst({ where: { status: 'SCHEDULED', dueAt: { lte: now } }, orderBy: { dueAt: 'asc' }, select: { dueAt: true } }),
      keystoneContext.prisma.$queryRaw<Array<{ bypass: boolean; superuser: boolean }>>`SELECT rolbypassrls AS bypass, rolsuper AS superuser FROM pg_roles WHERE rolname = current_user`,
      keystoneContext.prisma.$queryRaw<Array<{ count: bigint }>>`SELECT count(*)::bigint AS count FROM pg_class table_meta JOIN pg_namespace namespace ON namespace.oid=table_meta.relnamespace WHERE namespace.nspname='public' AND table_meta.relrowsecurity`,
      keystoneContext.prisma.$queryRaw<Array<{ unprotected: bigint; owned_without_force: bigint }>>`SELECT
        (SELECT count(*)::bigint FROM information_schema.columns col JOIN pg_namespace ns ON ns.nspname = col.table_schema JOIN pg_class tbl ON tbl.relnamespace = ns.oid AND tbl.relname = col.table_name
          WHERE col.table_schema = 'public' AND col.column_name = 'tenant' AND tbl.relkind = 'r'
            AND (NOT tbl.relrowsecurity OR NOT EXISTS (SELECT 1 FROM pg_policies pol WHERE pol.schemaname = 'public' AND pol.tablename = col.table_name))) AS unprotected,
        (SELECT count(*)::bigint FROM pg_class tbl JOIN pg_namespace ns ON ns.oid = tbl.relnamespace
          WHERE ns.nspname = 'public' AND tbl.relkind = 'r' AND tbl.relrowsecurity AND NOT tbl.relforcerowsecurity AND pg_get_userbyid(tbl.relowner) = current_user) AS owned_without_force`,
      keystoneContext.prisma.tenant.findMany({ select: { id: true } }),
      keystoneContext.prisma.$queryRaw<Array<{count:bigint}>>`SELECT count(*)::bigint AS count FROM "ExposurePosition" p WHERE p."scopeType"='MARKET' AND (p."stakeMinor"::numeric,p."liabilityMinor"::numeric)<>(SELECT coalesce(sum(a."remainingStakeMinor"::numeric) FILTER (WHERE a.status<>'CLOSED'),0),coalesce(sum(a."remainingLiabilityMinor"::numeric) FILTER (WHERE a.status<>'CLOSED'),0) FROM "WagerExposureAllocation" a WHERE a.tenant=p.tenant AND a.market=p."scopeId")`,
      keystoneContext.prisma.workerHeartbeat.count({where:{status:'READY',heartbeatAt:{gte:new Date(now.getTime()-10_000)}}}),
      keystoneContext.prisma.workerHeartbeat.count({where:{status:'READY',heartbeatAt:{lt:new Date(now.getTime()-10_000)}}}),
      keystoneContext.prisma.user.count({where:{tenantId:{not:null},operatorMfaEnabled:false,role:{is:{OR:[{canManageSportsbook:true},{canTrade:true},{canManageRisk:true},{canManageCompliance:true},{canManageFinance:true},{canManageIntegrations:true},{canApproveSensitiveActions:true},{canManageRoles:true}]}}}}),
    ])
    const ages = [oldestOutbox?.availableAt, oldestInbox?.availableAt, oldestScheduled?.dueAt].filter(Boolean).map(value => Math.max(0, now.getTime() - value!.getTime()))
    const oldestPendingAgeMs = Math.max(0, ...ages)
    const staleWorkerLeases = staleOutbox + staleInbox + staleScheduled
    const externalAnchoringConfigured = Boolean(process.env.AUDIT_ANCHOR_DIR && (process.env.AUDIT_ANCHOR_SECRET?.length ?? 0) >= 32)
    const productionMoneyMode = process.env.NODE_ENV === 'production' && process.env.SPORTSBOOK_DEPLOYMENT_MODE !== 'sandbox'
    // Migrations: no failed/in-progress rows, and every migration shipped with this build is applied.
    const applied = new Set(migration.filter(row => row.finished && !row.rolled_back).map(row => row.migration_name))
    const failedMigrations = migration.filter(row => !row.finished && !row.rolled_back).length
    const shipped = shippedMigrations()
    const pendingMigrations = shipped ? shipped.filter(name => !applied.has(name)).length : null
    const migrationReady = failedMigrations === 0 && pendingMigrations === 0
    // RLS: non-bypass role, every tenant table protected by a policy, and no owned table without FORCE RLS.
    const unprotectedTenantTables = Number(rlsCoverage[0]?.unprotected ?? 0)
    const ownedTablesWithoutForce = Number(rlsCoverage[0]?.owned_without_force ?? 0)
    const rlsRuntimeApproved = !productionMoneyMode || (!role[0]?.bypass && !role[0]?.superuser && Number(rlsTables[0]?.count ?? 0) > 0 && unprotectedTenantTables === 0 && ownedTablesWithoutForce === 0)
    // Audit anchoring: evaluated per tenant chain; production money mode requires anchoring to be configured.
    const frontiers = externalAnchoringConfigured ? await Promise.all(tenants.map((tenant: { id: string }) => tenantAuditFrontier(tenant.id, now))) : []
    const unanchoredTenants = frontiers.filter(frontier => !frontier.anchored).length
    const anchorLagMs = frontiers.reduce((max, frontier) => Math.max(max, Number.isFinite(frontier.lagMs) ? frontier.lagMs : max), 0)
    const auditReady = externalAnchoringConfigured ? unanchoredTenants === 0 : !productionMoneyMode
    const exposureProjectionMismatches=Number(exposureMismatch[0]?.count??0),ready = migrationReady && staleWorkerLeases === 0 && degradedProviders === 0 && oldestPendingAgeMs < 300_000 && rlsRuntimeApproved && auditReady && exposureProjectionMismatches===0 && activeWorkers>0 && privilegedWithoutMfa===0
    const status = ready ? 'ready' : 'degraded'
    if (!detailAllowed(request)) return Response.json({ status }, { status: ready ? 200 : 503, headers: { 'cache-control': 'no-store' } })
    const latestMigration = [...applied].sort().at(-1) ?? null
    return Response.json({ status, database: 'ok', migration: latestMigration, failedMigrations, pendingMigrations, staleWorkerLeases, degradedProviders, oldestPendingAgeMs, rowSecurityPolicyTables: Number(rlsTables[0]?.count ?? 0), unprotectedTenantTables, ownedTablesWithoutForce, rlsRuntimeApproved, externalAnchoringConfigured, unanchoredTenants, auditAnchorLagMs: anchorLagMs, auditReady, exposureProjectionMismatches, activeWorkers, staleWorkers, privilegedWithoutMfa }, { status: ready ? 200 : 503, headers: { 'cache-control': 'no-store' } })
  } catch {
    return Response.json({ status: 'not_ready', database: 'unavailable' }, { status: 503, headers: { 'cache-control': 'no-store' } })
  }
}
