import { sandboxAdapters } from '../../integrations/payment'

type PaymentCommand = { type: 'deposit' | 'withdrawal'; payload: { amountMinor: string; currency: string } }
type PaymentProvider = { adapterId: string; configReference: string; certificationStatus?: string | null; status?: string | null }

/** Narrow provider dispatch used by customer and operator payment lifecycles. */
export async function executePaymentProvider(provider: PaymentProvider, command: PaymentCommand, idempotencyKey: string) {
  if (provider.status !== 'ACTIVE') throw new Error('PAYMENT_PROVIDER_UNAVAILABLE')
  if (provider.adapterId !== 'sandbox-payments' || provider.certificationStatus !== 'SANDBOX') throw new Error('PAYMENT_ADAPTER_UNSUPPORTED')
  const configuration = await sandboxAdapters.payments.validateConfig(provider.configReference)
  if (!configuration.valid) throw new Error('PAYMENT_ADAPTER_INVALID_CONFIG')
  return sandboxAdapters.payments.execute({}, command, idempotencyKey)
}

/**
 * Status lookup for an already-dispatched attempt (E-commerce getPaymentStatus equivalent) against the same
 * admitted installation, by the attempt's original provider key. Never dispatches anything new.
 */
export async function getPaymentProviderStatus(provider: PaymentProvider, idempotencyKey: string) {
  if (provider.status !== 'ACTIVE') throw new Error('PAYMENT_PROVIDER_UNAVAILABLE')
  if (provider.adapterId !== 'sandbox-payments' || provider.certificationStatus !== 'SANDBOX') throw new Error('PAYMENT_ADAPTER_UNSUPPORTED')
  const configuration = await sandboxAdapters.payments.validateConfig(provider.configReference)
  if (!configuration.valid) throw new Error('PAYMENT_ADAPTER_INVALID_CONFIG')
  return sandboxAdapters.payments.query({}, idempotencyKey)
}
