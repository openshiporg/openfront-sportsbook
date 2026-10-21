import type { CombinationPlacementResponse } from '@/features/sportsbook/customer/combination-wagering'

export type PlacementDraft = Readonly<{
  quoteId: string
  idempotencyKey: string
  allowPartial: boolean
  bonusAwardId: string
}>
export type PlacementIntent = Readonly<PlacementDraft & { body: string }>

/** Once sent, retries must resolve this exact command, even after quote expiry. */
export function resolvePlacementIntent(pending: PlacementIntent | null, draft: PlacementDraft): PlacementIntent {
  if (pending) return pending
  return Object.freeze({ ...draft, body: JSON.stringify({
    quoteId: draft.quoteId,
    idempotencyKey: draft.idempotencyKey,
    allowPartial: draft.allowPartial,
    bonusAwardId: draft.bonusAwardId || undefined,
  }) })
}

/** Only an explicit command outcome releases the unresolved intent; transport errors do not. */
export function placementOutcome(value: unknown): CombinationPlacementResponse | null {
  if (!value || typeof value !== 'object') return null
  const result = value as CombinationPlacementResponse
  if (typeof result.duplicate !== 'boolean') return null
  if (result.state === 'REJECTED' && result.accepted === false && typeof result.rejectionCode === 'string') return result
  if (['ACCEPTED', 'PARTIALLY_ACCEPTED'].includes(result.state) && result.accepted === true &&
    typeof result.receiptId === 'string' && result.receiptId.length > 0 && typeof result.wagerId === 'string' &&
    result.wagerId === result.receiptId && typeof result.termsHash === 'string' &&
    typeof result.acceptedStakeMinor === 'string' && typeof result.potentialReturnMinor === 'string') return result
  return null
}
