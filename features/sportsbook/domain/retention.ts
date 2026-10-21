import { evidenceHash } from './engine'

type RetentionPolicy = { id: string; recordClass: string; deletionMode?: string | null; retentionDays: number; version: number }
type Candidate = { id: string; playerId: string | null }
type Hold = { id: string; scopeType: string; scopeId: string }

/** Record class / disposition pairs with a real, verifiable effect. Everything else is rejected before an executable plan exists. */
const SUPPORTED = new Set(['CUSTOMER_SESSION:DELETE', 'GEO:TOKENIZE'])
const RECORD_CLASS_SCOPES = new Set(['AUDIT', 'CUSTOMER_SESSION', 'GEO'])
export const MAX_RETENTION_CANDIDATES = 5_000
export const GEO_TOKENIZED_MARKER = 'TOKENIZED_BY_POLICY'

export function retentionUnsupportedReason(policy: Pick<RetentionPolicy, 'recordClass' | 'deletionMode'>): string | null {
  const key = `${policy.recordClass}:${policy.deletionMode ?? ''}`
  return SUPPORTED.has(key) ? null : `RETENTION_DISPOSITION_NOT_SUPPORTED:${key}`
}

/**
 * A hold protects a candidate when it targets the whole tenant, the candidate's player, the candidate's record class
 * (optionally one record id) or the exact record. A hold whose scope this code cannot interpret protects every candidate:
 * legal hold wins rather than being guessed away.
 */
function holdProtects(hold: Hold, recordClass: string, candidate: Candidate) {
  const scopeType = String(hold.scopeType ?? '').trim().toUpperCase(), scopeId = String(hold.scopeId ?? '').trim()
  if (scopeType === 'TENANT') return true
  if (scopeType === 'PLAYER') return !!candidate.playerId && scopeId === candidate.playerId
  if (scopeType === 'RECORD') return scopeId === candidate.id
  if (RECORD_CLASS_SCOPES.has(scopeType)) return scopeType === recordClass && (!scopeId || scopeId === '*' || scopeId === candidate.id)
  return true
}

/**
 * Exact candidate manifest for one policy and window. The same selection is used by the dry run and by the approved apply,
 * so the reviewed manifest is the executed effect set. `eligibilityAsOf` fixes the retention-age cutoff (the dry-run instant);
 * `holdsAsOf` evaluates the legal holds that are in force when the effect would commit.
 */
export async function retentionCandidates(tx: any, tenantId: string, policy: RetentionPolicy, windowFrom: Date, windowTo: Date, eligibilityAsOf: Date, holdsAsOf: Date) {
  const unsupported = retentionUnsupportedReason(policy)
  if (unsupported) throw new Error(unsupported)
  if (!Number.isInteger(policy.retentionDays) || policy.retentionDays < 0) throw new Error('RETENTION_POLICY_INVALID')
  if (Number.isNaN(windowFrom.getTime()) || Number.isNaN(windowTo.getTime()) || windowFrom >= windowTo) throw new Error('INVALID_RETENTION_RUN')
  const cutoff = new Date(eligibilityAsOf.getTime() - policy.retentionDays * 86_400_000)
  const upper = windowTo < cutoff ? windowTo : cutoff
  let candidates: Candidate[] = []
  if (upper > windowFrom) {
    if (policy.recordClass === 'CUSTOMER_SESSION') {
      const rows = await tx.customerSession.findMany({ where: { tenantId, expiresAt: { gte: windowFrom, lt: upper }, OR: [{ revokedAt: { not: null } }, { expiresAt: { lt: eligibilityAsOf } }] }, select: { id: true, playerId: true }, orderBy: { id: 'asc' }, take: MAX_RETENTION_CANDIDATES + 1 })
      candidates = rows.map((row: any) => ({ id: row.id, playerId: row.playerId ?? null }))
    } else {
      const rows = await tx.geoCheck.findMany({ where: { tenantId, checkedAt: { gte: windowFrom, lt: upper } }, select: { id: true, coarseEvidence: true, geoSession: { select: { playerId: true } } }, orderBy: { id: 'asc' }, take: MAX_RETENTION_CANDIDATES + 1 })
      candidates = rows.filter((row: any) => (row.coarseEvidence as any)?.retained !== GEO_TOKENIZED_MARKER).map((row: any) => ({ id: row.id, playerId: row.geoSession?.playerId ?? null }))
    }
  }
  if (candidates.length > MAX_RETENTION_CANDIDATES) throw new Error('RETENTION_WINDOW_TOO_LARGE')
  const holds: Hold[] = await tx.legalHold.findMany({ where: { tenantId, status: 'ACTIVE', OR: [{ endsAt: null }, { endsAt: { gt: holdsAsOf } }] }, select: { id: true, scopeType: true, scopeId: true }, orderBy: { id: 'asc' } })
  const held: string[] = [], eligible: string[] = []
  for (const candidate of candidates) (holds.some(hold => holdProtects(hold, policy.recordClass, candidate)) ? held : eligible).push(candidate.id)
  const manifestHash = evidenceHash({ policyId: policy.id, policyVersion: policy.version, recordClass: policy.recordClass, deletionMode: policy.deletionMode, retentionDays: policy.retentionDays, windowFrom: windowFrom.toISOString(), windowTo: windowTo.toISOString(), cutoff: cutoff.toISOString(), eligible, held })
  return { cutoff, eligible, held, holdIds: holds.map(hold => hold.id), candidateCount: candidates.length, manifestHash }
}
