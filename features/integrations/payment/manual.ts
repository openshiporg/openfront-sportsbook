type Input = { amount?: number; currency?: string; paymentId?: string; idempotencyKey?: string; captureNow?: boolean }

export async function createPaymentFunction(input: Input) {
  if (!Number.isSafeInteger(input.amount) || (input.amount ?? 0) <= 0) throw new Error('Invalid payment amount')
  return { status: 'pending', amount: input.amount, currency: input.currency ?? 'USD', paymentIntentId: input.idempotencyKey ?? '' }
}
export async function capturePaymentFunction(input: Input) {
  return { status: 'succeeded', paymentIntentId: input.paymentId, amount: input.amount, currency: input.currency ?? 'USD' }
}
export async function refundPaymentFunction(input: Input) { return { status: 'unknown', paymentIntentId: input.paymentId, amount: input.amount, currency: input.currency ?? 'USD' } }
export async function getPaymentStatusFunction(input: Input) { return { status: 'unknown', paymentIntentId: input.paymentId } }
export async function generatePaymentLinkFunction(input: Input) { return { status: 'pending', paymentIntentId: input.paymentId } }
export async function handleWebhookFunction() { return { isValid: false } }
