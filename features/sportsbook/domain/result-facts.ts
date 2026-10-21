export type SelectionOutcome = 'WIN' | 'LOSS' | 'PUSH' | 'VOID' | 'DEAD_HEAT'
export type CanonicalSelectionFact = {
  marketKey: string
  selectionKey: string
  outcome: SelectionOutcome
  factorNumerator?: string
  factorDenominator?: string
}

export const MAX_CANONICAL_SELECTION_FACTS = 1024
const MAX_KEY_LENGTH = 128
const MAX_FACTOR_DIGITS = 18
const outcomes = new Set<SelectionOutcome>(['WIN', 'LOSS', 'PUSH', 'VOID', 'DEAD_HEAT'])

export function parseCanonicalSelectionFacts(payload: unknown, expectedEventId?: string): { eventId: string; facts: CanonicalSelectionFact[] } {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new Error('INVALID_CANONICAL_RESULT')
  const body = payload as Record<string, unknown>
  if (body.schemaVersion !== 'openfront.selection-results.v1' || typeof body.eventId !== 'string' || !body.eventId.trim()) throw new Error('INVALID_CANONICAL_RESULT')
  if (body.eventId.length > MAX_KEY_LENGTH || body.eventId.includes('\u0000')) throw new Error('INVALID_CANONICAL_RESULT')
  if (expectedEventId && body.eventId !== expectedEventId) throw new Error('RESULT_EVENT_MISMATCH')
  if (!Array.isArray(body.selections) || body.selections.length === 0) throw new Error('CANONICAL_SELECTION_FACTS_REQUIRED')

  if (body.selections.length > MAX_CANONICAL_SELECTION_FACTS) throw new Error('CANONICAL_SELECTION_FACTS_LIMIT_EXCEEDED')
  const seen = new Set<string>()
  const facts = body.selections.map((value): CanonicalSelectionFact => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('INVALID_CANONICAL_SELECTION_FACT')
    const row = value as Record<string, unknown>
    if (typeof row.marketKey !== 'string' || !row.marketKey.trim() || typeof row.selectionKey !== 'string' || !row.selectionKey.trim() || typeof row.outcome !== 'string' || !outcomes.has(row.outcome as SelectionOutcome)) {
      throw new Error('INVALID_CANONICAL_SELECTION_FACT')
    }
    if (row.marketKey.length > MAX_KEY_LENGTH || row.selectionKey.length > MAX_KEY_LENGTH || row.marketKey.includes('\u0000') || row.selectionKey.includes('\u0000')) throw new Error('INVALID_CANONICAL_SELECTION_FACT')
    const identity = `${row.marketKey}\u0000${row.selectionKey}`
    if (seen.has(identity)) throw new Error('DUPLICATE_CANONICAL_SELECTION_FACT')
    seen.add(identity)

    const factorNumerator = row.factorNumerator
    const factorDenominator = row.factorDenominator
    if (row.outcome === 'DEAD_HEAT') {
      if (typeof factorNumerator !== 'string' || typeof factorDenominator !== 'string' || factorNumerator.length > MAX_FACTOR_DIGITS || factorDenominator.length > MAX_FACTOR_DIGITS || !/^\d+$/.test(factorNumerator) || !/^\d+$/.test(factorDenominator) || BigInt(factorNumerator) <= 0n || BigInt(factorDenominator) <= 0n || BigInt(factorNumerator) > BigInt(factorDenominator)) {
        throw new Error('INVALID_DEAD_HEAT_FACTOR')
      }
    } else if (factorNumerator !== undefined || factorDenominator !== undefined) {
      throw new Error('UNEXPECTED_SELECTION_FACTOR')
    }

    return {
      marketKey: row.marketKey,
      selectionKey: row.selectionKey,
      outcome: row.outcome as SelectionOutcome,
      ...(typeof factorNumerator === 'string' ? { factorNumerator } : {}),
      ...(typeof factorDenominator === 'string' ? { factorDenominator } : {}),
    }
  })
  return { eventId: body.eventId, facts }
}

export function resolveCanonicalSelectionFact(payload: unknown, eventId: string, marketKey: string, selectionKey: string): CanonicalSelectionFact | null {
  const { facts } = parseCanonicalSelectionFacts(payload, eventId)
  return facts.find((fact) => fact.marketKey === marketKey && fact.selectionKey === selectionKey) ?? null
}
