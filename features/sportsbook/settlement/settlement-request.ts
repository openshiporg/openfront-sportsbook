import { gradeSelectionFromApprovedResult, serializable } from '../../keystone/mutations/sportsbook'
import { AUTOMATIC_SETTLEMENT_ACTOR, settleFullStraightAutomatically } from './full-straight'

type Fence = (tx: any) => Promise<void>
export type SettlementRequestOutcome = { resultVersionId: string; graded: number; settled: string[]; skipped: { id: string; reason: string }[] }

const reasonOf = (error: unknown) => (error instanceof Error ? error.message : 'UNKNOWN')
/** Lost lease / serialization failures must fail the job so it retries; evidence refusals are recorded and left for an operator. */
const isTransient = (reason: string) => /LEASE|lease|could not serialize|deadlock|P2034|ECONN|timeout/i.test(reason)

/**
 * settlement.requested is emitted when an independent approver approves a result. The worker then does what the
 * operator's Settle button does: grade every selection of the event from that approved result, then settle each open
 * straight bet on the event through the same reviewed-plan code. Every step is idempotent (grade input hash,
 * settlement key derived from wager + result), so a retried, reclaimed or replayed job never grades or pays twice.
 * Bets the plan refuses (cash-out, bonus funding, combinations, missing evidence) stay for the operator.
 */
export async function handleSettlementRequested(prisma: any, tenantId: string, payload: unknown, fence: Fence): Promise<SettlementRequestOutcome> {
  const resultVersionId = typeof (payload as any)?.resultVersionId === 'string' ? (payload as any).resultVersionId : ''
  if (!resultVersionId) throw new Error('SETTLEMENT_REQUEST_RESULT_REQUIRED')
  const result = await prisma.resultVersion.findFirst({ where: { id: resultVersionId, tenantId } })
  const outcome: SettlementRequestOutcome = { resultVersionId, graded: 0, settled: [], skipped: [] }
  // A superseded or withdrawn result is no longer the truth for this event; nothing to do.
  if (!result?.eventId || result.status !== 'APPROVED') { outcome.skipped.push({ id: resultVersionId, reason: `RESULT_${String(result?.status ?? 'MISSING')}` }); return outcome }

  const selections = await prisma.selection.findMany({ where: { tenantId, market: { eventId: result.eventId } }, select: { id: true, marketId: true }, orderBy: { id: 'asc' } })
  for (const selection of selections) {
    try {
      await prisma.$transaction(async (tx: any) => {
        await fence(tx)
        await gradeSelectionFromApprovedResult(tx, tenantId, AUTOMATIC_SETTLEMENT_ACTOR, { marketId: selection.marketId, selectionId: selection.id, resultVersionId, reason: 'Approved result graded by the settlement worker' })
      })
      outcome.graded++
    } catch (error) {
      const reason = reasonOf(error)
      if (isTransient(reason)) throw error
      outcome.skipped.push({ id: selection.id, reason })
    }
  }

  const legs = await prisma.wagerLeg.findMany({ where: { tenantId, eventKey: result.eventId }, select: { wagerId: true } })
  const wagerIds = [...new Set(legs.map((leg: any) => String(leg.wagerId ?? '')).filter(Boolean))] as string[]
  const open = await prisma.wager.findMany({ where: { tenantId, id: { in: wagerIds }, structure: 'STRAIGHT', status: { in: ['ACCEPTED', 'OPEN', 'GRADED'] } }, select: { id: true }, orderBy: { id: 'asc' } })
  for (const wager of open) {
    try {
      const settlementId = await serializable(prisma, async (tx: any) => {
        await fence(tx)
        return settleFullStraightAutomatically(tx, tenantId, wager.id, resultVersionId)
      })
      outcome.settled.push(String(settlementId))
    } catch (error) {
      const reason = reasonOf(error)
      if (isTransient(reason)) throw error
      outcome.skipped.push({ id: wager.id, reason })
    }
  }
  return outcome
}
