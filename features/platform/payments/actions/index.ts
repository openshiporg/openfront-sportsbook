'use server'

import { getOperatorContext, platformPrisma as prisma } from '../../lib/operator'
import { appendAudit } from '@/features/keystone/mutations/sportsbook'
import { applyPaymentOutcome } from '@/features/sportsbook/customer/funding'

export async function saveOperatorLicence(input: { id?: string; licenceNumber: string; regulator: string; expiresAt: string; permittedRegions: string; status: string }) {
  const operator = await getOperatorContext('canManageCompliance')
  if (!operator) throw new Error('FORBIDDEN')
  const regions = input.permittedRegions.split(/[\s,]+/).map((x) => x.trim().toUpperCase()).filter(Boolean)
  if (!input.licenceNumber.trim() || !input.regulator.trim() || !Number.isFinite(Date.parse(input.expiresAt)) || !regions.length || !['ACTIVE','SUSPENDED','EXPIRED'].includes(input.status)) throw new Error('INVALID_LICENCE')
  const data = { tenantId: operator.tenantId, licenceNumber: input.licenceNumber.trim(), regulator: input.regulator.trim(), expiresAt: new Date(input.expiresAt), permittedRegions: regions, status: input.status }
  return input.id ? prisma.operatorLicence.updateMany({ where: { id: input.id, tenantId: operator.tenantId }, data }) : prisma.operatorLicence.create({ data })
}

import { canMarkWithdrawalPaid, withdrawalAlreadyResolved } from '../withdrawal-policy'

const adapters = ['authorizenet','paysafe','aeropay','manual'] as const
export async function savePaymentProvider(input: { id?: string; adapterId: string; adapterVersion: string; configReference: string; secretReference: string; status: string }) {
  const operator = await getOperatorContext('canManageIntegrations')
  if (!operator) throw new Error('FORBIDDEN')
  if (!(adapters as readonly string[]).includes(input.adapterId) || !['ACTIVE','DISABLED','DEGRADED'].includes(input.status)) throw new Error('INVALID_PAYMENT_PROVIDER')
  const data = { tenantId: operator.tenantId, adapterId: input.adapterId, adapterVersion: input.adapterVersion || '1', configReference: input.configReference, secretReference: input.secretReference, status: input.status, capabilities: { kind: 'payments' } }
  return input.id ? prisma.providerConnection.updateMany({ where: { id: input.id, tenantId: operator.tenantId }, data }) : prisma.providerConnection.create({ data })
}

export async function settleOperatorWithdrawal(intentId: string, decision: 'SUCCEEDED'|'FAILED', bankReference: string) {
  const operator = await getOperatorContext('canManageFinance')
  if (!operator || !canMarkWithdrawalPaid(operator.capabilities)) throw new Error('FORBIDDEN')
  if (decision === 'SUCCEEDED' && !bankReference.trim()) throw new Error('BANK_REFERENCE_REQUIRED')
  return prisma.$transaction(async (tx: any) => {
    await tx.$queryRaw`SELECT id FROM "PaymentIntent" WHERE id = ${intentId} AND tenant = ${operator.tenantId} FOR UPDATE`
    const intent = await tx.paymentIntent.findFirst({ where: { id: intentId, tenantId: operator.tenantId, type: 'WITHDRAWAL' } })
    if (!intent) throw new Error('PAYMENT_INTENT_NOT_FOUND')
    if (withdrawalAlreadyResolved(intent.status)) return { changed: false, status: intent.status }
    if (!['PROCESSING','UNKNOWN','PENDING'].includes(intent.status)) throw new Error('WITHDRAWAL_NOT_SETTLEABLE')
    const result = await applyPaymentOutcome(tx, intent, { status: decision, externalRef: bankReference.trim(), reasonCode: decision === 'SUCCEEDED' ? 'OPERATOR_BANK_TRANSFER_CONFIRMED' : 'OPERATOR_PAYOUT_REJECTED' }, new Date())
    await appendAudit(tx, operator.tenantId, operator.userId, decision === 'SUCCEEDED' ? 'withdrawal.marked_paid' : 'withdrawal.rejected', 'PaymentIntent', intent.id, decision === 'SUCCEEDED' ? 'BANK_TRANSFER' : 'OPERATOR_REJECTED', { bankReference: decision === 'SUCCEEDED' ? bankReference.trim() : null, status: result.status })
    return { changed: true, status: result.status }
  })
}
