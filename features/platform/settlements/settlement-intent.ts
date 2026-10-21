export const SETTLE_STRAIGHT_MUTATION = 'mutation SettleReviewedStraight($wagerId:ID!,$planHash:String!,$idempotencyKey:String!,$expectedActorId:ID!,$expectedTenantId:ID!){settleCombinationWager(wagerId:$wagerId,planHash:$planHash,idempotencyKey:$idempotencyKey,expectedActorId:$expectedActorId,expectedTenantId:$expectedTenantId)}'
export const STRAIGHT_PLAN_QUERY = 'query ReviewedStraightPlan($wagerId:ID!){fullStraightSettlementPlan(wagerId:$wagerId)}'
export type SettlementIntent = { version: 1; tenantId: string; actorId: string; wagerId: string; planHash: string; idempotencyKey: string; requestBody: string }
export const settlementIntentStorageKey = (tenantId: string, actorId: string) => `openfront:settlement-intent:v1:${tenantId}:${actorId}`

export function createSettlementIntent(scope: { tenantId: string; actorId: string }, wagerId: string, planHash: string, idempotencyKey: string): SettlementIntent {
  if (!scope.tenantId || !scope.actorId || !wagerId || !/^[a-f0-9]{64}$/.test(planHash) || !/^[A-Za-z0-9:_-]{8,128}$/.test(idempotencyKey)) throw new Error('INVALID_SETTLEMENT_INTENT')
  return { version: 1, ...scope, wagerId, planHash, idempotencyKey, requestBody: JSON.stringify({ query: SETTLE_STRAIGHT_MUTATION, variables: { wagerId, planHash, idempotencyKey, expectedActorId: scope.actorId, expectedTenantId: scope.tenantId } }) }
}

/** A corrupt/foreign local intent is not silently discarded or replaced. */
export function restoreSettlementIntent(raw: string, scope: { tenantId: string; actorId: string }): SettlementIntent {
  let row: SettlementIntent
  try { row = JSON.parse(raw) as SettlementIntent } catch { throw new Error('UNRESOLVED_SETTLEMENT_INTENT') }
  if (!row || row.version !== 1 || row.tenantId !== scope.tenantId || row.actorId !== scope.actorId) throw new Error('UNRESOLVED_SETTLEMENT_INTENT')
  const expected = createSettlementIntent(scope, row.wagerId, row.planHash, row.idempotencyKey)
  if (row.requestBody !== expected.requestBody) throw new Error('UNRESOLVED_SETTLEMENT_INTENT')
  return expected
}

export function settlementAcknowledgement(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null
  const row = payload as { errors?: unknown; data?: { settleCombinationWager?: unknown } }
  if (row.errors || typeof row.data?.settleCombinationWager !== 'string' || !row.data.settleCombinationWager) return null
  return row.data.settleCombinationWager
}
