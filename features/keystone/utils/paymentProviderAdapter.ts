import { paymentProviderAdapters } from '../../integrations/payment'

type PaymentCommand = { type: 'deposit' | 'withdrawal'; payload: { amountMinor: string; currency: string; opaqueData?: { dataDescriptor: string; dataValue: string } } }
type PaymentProvider = { id?: string; adapterId: string; configReference: string; secretReference?: string | null; certificationStatus?: string | null; status?: string | null }

/** Narrow provider dispatch used by customer and operator payment lifecycles. */
export async function executePaymentProvider(provider: PaymentProvider, command: PaymentCommand, idempotencyKey: string) {
  if (provider.status !== 'ACTIVE') throw new Error('PAYMENT_PROVIDER_UNAVAILABLE')
  if (!(provider.adapterId in paymentProviderAdapters)) throw new Error('PAYMENT_ADAPTER_UNSUPPORTED')
  if (provider.secretReference && !process.env[provider.secretReference]) throw new Error('PAYMENT_ADAPTER_INVALID_CONFIG')
  const adapter = await paymentProviderAdapters[provider.adapterId as keyof typeof paymentProviderAdapters]()
  if (command.type === 'withdrawal') {
    if (provider.adapterId !== 'manual') throw new Error('PAYMENT_ADAPTER_UNSUPPORTED')
    return { status: 'UNKNOWN', externalRef: idempotencyKey, reasonCode: 'OPERATOR_PAYOUT_REQUIRED' }
  }
  if (provider.adapterId === 'manual') throw new Error('PAYMENT_ADAPTER_UNSUPPORTED')
  const result = await adapter.createPaymentFunction({ amount: Number(command.payload.amountMinor), currency: command.payload.currency, idempotencyKey, captureNow: true, opaqueData: command.payload.opaqueData })
  if (result.status === 'succeeded') return { status: 'SUCCEEDED', externalRef: String(result.paymentIntentId ?? ''), reasonCode: '' }
  if (result.status === 'failed') return { status: 'FAILED', externalRef: '', reasonCode: 'PROVIDER_DECLINED' }
  return { status: 'UNKNOWN', externalRef: String(result.paymentIntentId ?? ''), reasonCode: 'PROVIDER_OUTCOME_UNKNOWN' }
}

/**
 * Status lookup for an already-dispatched attempt (E-commerce getPaymentStatus equivalent) against the same
 * admitted installation, by the attempt's original provider key. Never dispatches anything new.
 */
export async function getPaymentProviderStatus(provider: PaymentProvider, idempotencyKey: string) {
  if (provider.status !== 'ACTIVE') throw new Error('PAYMENT_PROVIDER_UNAVAILABLE')
  if (!(provider.adapterId in paymentProviderAdapters)) throw new Error('PAYMENT_ADAPTER_UNSUPPORTED')
  const adapter = await paymentProviderAdapters[provider.adapterId as keyof typeof paymentProviderAdapters]()
  const result: any = await adapter.getPaymentStatusFunction({ paymentId: idempotencyKey })
  return { status: result.status === 'succeeded' ? 'SUCCEEDED' : result.status === 'failed' ? 'FAILED' : 'UNKNOWN', externalRef: String(result.paymentIntentId ?? result.data?.transId ?? ''), payload: { amountMinor: result.amount, currency: result.currency } }
}

/**
 * Refund (settled) or void (unsettled) a captured payment at the processor, keyed to the original processor transaction.
 * Only SUCCEEDED means the money is back with the cardholder; anything else leaves the wallet untouched.
 */
export async function refundPaymentProvider(provider: PaymentProvider, reference: string, amountMinor: string, idempotencyKey: string): Promise<{ status: 'SUCCEEDED' | 'FAILED' | 'UNKNOWN'; externalRef: string; method?: string }> {
  if (provider.status !== 'ACTIVE') throw new Error('PAYMENT_PROVIDER_UNAVAILABLE')
  // Cage cash goes back over the counter: the operator's confirmation of the reversal is the record.
  if (provider.adapterId === 'manual') return { status: 'SUCCEEDED', externalRef: `cash-return:${reference || idempotencyKey}`, method: 'cash' }
  if ((provider.adapterId !== 'authorizenet' && provider.adapterId !== 'stripe') || !reference) throw new Error('PAYMENT_ADAPTER_UNSUPPORTED')
  const adapter: any = await paymentProviderAdapters[provider.adapterId]()
  const result = await adapter.refundPaymentFunction({ paymentId: reference, amount: Number(amountMinor), currency: 'USD', idempotencyKey })
  if (result.status === 'refunded') return { status: 'SUCCEEDED', externalRef: String(result.data?.transId && result.data.transId !== '0' ? result.data.transId : reference), method: result.method }
  return { status: result.status === 'failed' ? 'FAILED' : 'UNKNOWN', externalRef: '' }
}
