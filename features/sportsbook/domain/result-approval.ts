import { evidenceHash } from './engine'

/** Approval binds immutable content/source/subject, not only an editable row identifier. */
export function resultApprovalHash(result: { id: string; tenantId: string | null; eventId: string | null; providerConnectionId: string | null; version: number; payload: unknown; payloadHash: string }) {
  if (!result.tenantId || !result.eventId || !result.providerConnectionId || evidenceHash(result.payload) !== result.payloadHash) throw new Error('RESULT_CONTENT_EVIDENCE_MISMATCH')
  return evidenceHash({ action: 'APPROVE_RESULT', tenantId: result.tenantId, resultVersionId: result.id, eventId: result.eventId, providerConnectionId: result.providerConnectionId, version: result.version, payloadHash: result.payloadHash })
}
