// Stripe adapter (shared six-function shape) for hosted card deposits. Card data never reaches this server: the
// player pays on Stripe Checkout and the deposit is confirmed by reading the Checkout Session back from Stripe.
// Test mode only (sk_test_), matching the rest of the fleet's sandbox payments.

type Input = {
  amount?: number
  currency?: string
  paymentId?: string
  idempotencyKey?: string
  captureNow?: boolean
  returnUrl?: string
  description?: string
}

type StripeObject = Record<string, any>

export function stripeConfigured() {
  return String(process.env.STRIPE_SECRET_KEY ?? '').startsWith('sk_test_')
}

function encode(body: Record<string, unknown>) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(body)) if (value !== undefined && value !== null) params.append(key, String(value))
  return params
}

async function stripe(path: string, method: 'GET' | 'POST' = 'GET', body?: Record<string, unknown>, idempotencyKey?: string): Promise<StripeObject> {
  const secret = process.env.STRIPE_SECRET_KEY
  if (!secret || !secret.startsWith('sk_test_')) throw new Error('PAYMENT_ADAPTER_INVALID_CONFIG')
  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    method,
    redirect: 'error',
    signal: AbortSignal.timeout(30_000),
    headers: { Authorization: `Bearer ${secret}`, ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey.slice(0, 255) } : {}), ...(body ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}) },
    body: body ? encode(body) : undefined,
  })
  const result = (await response.json()) as StripeObject
  if (!response.ok) throw new Error(`Stripe ${response.status}: ${String(result?.error?.code || result?.error?.type || 'request_failed')}`)
  return result
}

/** Session state to the shared vocabulary: paid → succeeded, expired → canceled, otherwise still pending. */
export function mapCheckoutSession(session: StripeObject) {
  const intent = session.payment_intent && typeof session.payment_intent === 'object' ? session.payment_intent : null
  if (session.payment_status === 'paid' && (!intent || intent.status === 'succeeded')) return 'succeeded'
  if (session.status === 'expired') return 'canceled'
  if (intent?.status === 'canceled') return 'canceled'
  return 'pending'
}

async function readSession(id: string) {
  return stripe(`checkout/sessions/${encodeURIComponent(id)}?expand[]=payment_intent`)
}

function sessionResult(session: StripeObject, amount?: number) {
  const intent = session.payment_intent && typeof session.payment_intent === 'object' ? session.payment_intent : null
  return {
    status: mapCheckoutSession(session),
    paymentIntentId: String(session.id),
    redirectUrl: session.status === 'open' ? String(session.url ?? '') : '',
    amount: intent ? Number(intent.amount_received || intent.amount) : Number(session.amount_total ?? amount ?? 0),
    currency: String(session.currency ?? 'usd').toUpperCase(),
    data: { sessionId: session.id, paymentIntent: intent?.id ?? null },
  }
}

/**
 * Creates (or, for the same attempt key, re-reads) the Checkout Session, then reports its current state. Stripe
 * replays the original session for a repeated Idempotency-Key, so a retry of the same attempt never opens a second
 * charge; the follow-up read tells us whether the player has paid.
 */
export async function createPaymentFunction({ amount, currency, idempotencyKey, returnUrl, description }: Input) {
  if (!Number.isSafeInteger(amount) || (amount as number) <= 0) throw new Error('Invalid payment amount')
  if (!idempotencyKey) throw new Error('Idempotency key is required')
  const back = returnUrl || `${String(process.env.PUBLIC_APP_URL ?? '').replace(/\/$/, '')}/account/wallet`
  if (!/^https?:\/\//.test(back)) throw new Error('PAYMENT_ADAPTER_INVALID_CONFIG')
  const join = back.includes('?') ? '&' : '?'
  const created = await stripe('checkout/sessions', 'POST', {
    mode: 'payment',
    success_url: `${back}${join}deposit=return`,
    cancel_url: `${back}${join}deposit=cancelled`,
    'line_items[0][quantity]': 1,
    'line_items[0][price_data][currency]': String(currency || 'USD').toLowerCase(),
    'line_items[0][price_data][unit_amount]': amount,
    'line_items[0][price_data][product_data][name]': description || 'Wallet deposit',
    'metadata[attempt]': idempotencyKey,
    'payment_intent_data[metadata][attempt]': idempotencyKey,
    // Short window: an abandoned deposit expires and releases its limit headroom the same day.
    expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
  }, idempotencyKey)
  return sessionResult(await readSession(String(created.id)), amount)
}

export async function capturePaymentFunction({ paymentId }: Input) {
  return getPaymentStatusFunction({ paymentId })
}

export async function getPaymentStatusFunction({ paymentId }: Input) {
  if (!paymentId) throw new Error('Payment reference is required')
  if (paymentId.startsWith('cs_')) return sessionResult(await readSession(paymentId))
  const intent = await stripe(`payment_intents/${encodeURIComponent(paymentId)}`)
  return { status: intent.status === 'succeeded' ? 'succeeded' : intent.status === 'canceled' ? 'canceled' : 'pending', paymentIntentId: String(intent.id), amount: Number(intent.amount_received || intent.amount), currency: String(intent.currency).toUpperCase() }
}

export async function refundPaymentFunction({ paymentId, amount, idempotencyKey }: Input) {
  if (!paymentId) throw new Error('Payment reference is required')
  let intentId = paymentId
  if (paymentId.startsWith('cs_')) {
    const session = await readSession(paymentId)
    intentId = typeof session.payment_intent === 'object' ? session.payment_intent?.id : session.payment_intent
  }
  if (!intentId) return { status: 'failed', error: 'No captured payment to refund' }
  const refund = await stripe('refunds', 'POST', { payment_intent: intentId, ...(amount ? { amount } : {}) }, idempotencyKey ? `refund:${idempotencyKey}` : undefined)
  const ok = refund.status === 'succeeded' || refund.status === 'pending'
  return { status: ok ? 'refunded' : refund.status === 'failed' ? 'failed' : 'unknown', amount: Number(refund.amount), currency: String(refund.currency).toUpperCase(), data: { transId: refund.id }, method: 'refund' }
}

export async function cancelPaymentFunction({ paymentId }: Input) {
  if (!paymentId?.startsWith('cs_')) return { status: 'unknown' }
  const session = await stripe(`checkout/sessions/${encodeURIComponent(paymentId)}/expire`, 'POST', {})
  return { status: session.status === 'expired' ? 'canceled' : 'unknown' }
}

export async function generatePaymentLinkFunction({ paymentId }: Input) {
  return `https://dashboard.stripe.com/test/payments/${encodeURIComponent(paymentId || '')}`
}

export async function handleWebhookFunction() {
  // Deposits are confirmed by reading the session back (player return or the reconciliation worker); no webhook needed.
  return { isValid: false }
}
