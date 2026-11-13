import { createHmac } from 'node:crypto'
import { appendFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { runWithTenantScope } from '../../keystone/tenant-scope'

/**
 * External audit anchoring. Each tenant's hash-chained AuditEvent head is periodically sealed outside the database:
 * an HMAC-signed record is appended to `<dir>/<tenant>.jsonl` on durable storage (the service's mounted volume) and an
 * ANCHORED AuditAnchor row points at it. Tampering with the database chain then disagrees with the off-database file.
 *
 * There is no worker: anchoring advances idempotently on the request that needs it (readiness probe, Audit screen).
 * Settings have working defaults: the directory is AUDIT_ANCHOR_DIR or the mounted volume, and the signing key is
 * AUDIT_ANCHOR_SECRET or a key derived from SESSION_SECRET.
 */
export function auditAnchorSettings(): { dir: string; secret: string } | null {
  const dir = process.env.AUDIT_ANCHOR_DIR?.trim() || process.env.RAILWAY_VOLUME_MOUNT_PATH?.trim() || ''
  const configured = process.env.AUDIT_ANCHOR_SECRET ?? ''
  const sessionSecret = process.env.SESSION_SECRET ?? ''
  const secret = configured.length >= 32 ? configured : sessionSecret.length >= 32 ? createHmac('sha256', sessionSecret).update('audit-anchor:v1').digest('hex') : ''
  return dir && secret ? { dir, secret } : null
}

/** Minimum spacing between anchors of a moving chain head, so busy tenants do not append on every request. */
const MIN_ANCHOR_INTERVAL_MS = 60_000

export async function advanceAuditAnchor(prisma: any, tenantId: string, now = new Date()): Promise<'ANCHORED' | 'CURRENT' | 'RECENT' | 'EMPTY' | 'UNCONFIGURED'> {
  const settings = auditAnchorSettings()
  if (!settings) return 'UNCONFIGURED'
  return runWithTenantScope(tenantId, () => prisma.$transaction(async (tx: any) => {
    // One anchoring writer per tenant at a time; a concurrent request waits, then sees the head already anchored.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`audit-anchor:${tenantId}`}))`
    const head = await tx.auditEvent.findFirst({ where: { tenantId }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], select: { id: true, hash: true, createdAt: true } })
    if (!head) return 'EMPTY'
    const latest = await tx.auditAnchor.findFirst({ where: { tenantId, status: 'ANCHORED' }, orderBy: { anchoredAt: 'desc' }, select: { chainHeadHash: true, anchoredAt: true } })
    if (latest?.chainHeadHash === head.hash) return 'CURRENT'
    if (latest?.anchoredAt && now.getTime() - new Date(latest.anchoredAt).getTime() < MIN_ANCHOR_INTERVAL_MS) return 'RECENT'
    const eventCount = await tx.auditEvent.count({ where: { tenantId, createdAt: { lte: head.createdAt } } })
    const evidence = { tenantId, chainHeadHash: head.hash, headEventId: head.id, eventCount, anchoredAt: now.toISOString() }
    const signature = createHmac('sha256', settings.secret).update(JSON.stringify(evidence)).digest('hex')
    await mkdir(settings.dir, { recursive: true })
    const file = path.join(settings.dir, `${tenantId.replace(/[^a-zA-Z0-9_-]/g, '_')}.jsonl`)
    // The external append happens before the row commits: a row never claims an anchor that is not on storage.
    await appendFile(file, JSON.stringify({ ...evidence, signature }) + '\n', { encoding: 'utf8', mode: 0o600 })
    await tx.auditAnchor.create({ data: { tenantId, chainHeadHash: head.hash, eventCount, anchoredAt: now, externalReference: `file:${file}#${signature}`, status: 'ANCHORED' } })
    return 'ANCHORED'
  }, { timeout: 20_000 }))
}

export async function advanceAuditAnchors(prisma: any, tenantIds: string[], now = new Date()) {
  const outcomes: Record<string, string> = {}
  for (const tenantId of tenantIds) {
    try { outcomes[tenantId] = await advanceAuditAnchor(prisma, tenantId, now) }
    catch { outcomes[tenantId] = 'FAILED' }
  }
  return outcomes
}
