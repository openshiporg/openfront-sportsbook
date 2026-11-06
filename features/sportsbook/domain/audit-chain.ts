import { evidenceHash } from './engine'

/** Appends to the tenant's hash-chained audit log under the tenant advisory lock. */
export async function appendChainedAudit(tx: any, tenantId: string, actorId: string, action: string, targetType: string, targetId: string, reason: string, payload: unknown) {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${tenantId}))`
  const previous = await tx.auditEvent.findFirst({ where: { tenantId }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] })
  const payloadHash = evidenceHash(payload)
  const hash = evidenceHash({ tenantId, previousHash: previous?.hash ?? '', actorId, action, targetType, targetId, reason, payloadHash })
  return tx.auditEvent.create({ data: { tenantId, actorId, action, targetType, targetId, reason, payloadHash, previousHash: previous?.hash ?? '', hash } })
}
