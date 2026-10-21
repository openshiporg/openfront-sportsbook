import type { Prisma } from '../../keystone/prisma'
import { evidenceHash } from './engine'

const specific = (key: string) => Boolean(key && key !== '*')

/** Native rule specificity/effectivity, shared by quote acceptance and grading. */
export async function activeHouseRule(tx: Prisma.TransactionClient, tenantId: string, market: { eventId: string | null; definitionKey: string }, now: Date) {
  const event = await tx.event.findFirst({ where: { id: market.eventId ?? '', tenantId }, include: { competition: { include: { sport: true } } } })
  const sportKey = event?.competition?.sport?.key ?? ''
  const candidates = await tx.houseRuleVersion.findMany({ where: { tenantId, status: 'ACTIVE', effectiveFrom: { lte: now }, OR: [{ effectiveTo: null }, { effectiveTo: { gt: now } }] } })
  const eligible = candidates.filter(rule => (!specific(rule.sportKey) || rule.sportKey === sportKey) && (!specific(rule.marketDefinitionKey) || rule.marketDefinitionKey === market.definitionKey))
  eligible.sort((left, right) => Number(specific(right.marketDefinitionKey)) - Number(specific(left.marketDefinitionKey)) || Number(specific(right.sportKey)) - Number(specific(left.sportKey)) || Number(right.version) - Number(left.version))
  if (eligible.length > 1) {
    const [left, right] = eligible
    if (specific(left.marketDefinitionKey) === specific(right.marketDefinitionKey) && specific(left.sportKey) === specific(right.sportKey) && left.version === right.version) throw new Error('AMBIGUOUS_HOUSE_RULE')
  }
  return eligible[0] ?? null
}

export async function approvedHouseRuleEvidence(tx: Prisma.TransactionClient, tenantId: string, rule: NonNullable<Awaited<ReturnType<typeof activeHouseRule>>>) {
  if (rule.tenantId !== tenantId || !rule.approvalRequestId || rule.semanticHash !== evidenceHash({ action: 'HOUSE_RULE', name: rule.name, sportKey: rule.sportKey, marketDefinitionKey: rule.marketDefinitionKey, rules: rule.rules, effectiveFrom: rule.effectiveFrom })) return null
  const approval = await tx.approvalRequest.findFirst({ where: { id: rule.approvalRequestId, tenantId, action: `HOUSE_RULE:${rule.name}`, payloadHash: rule.semanticHash, status: 'APPROVED' } })
  return approval?.approverId && approval.requesterId !== approval.approverId ? approval : null
}
