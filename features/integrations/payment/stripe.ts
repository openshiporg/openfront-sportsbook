import Stripe from "stripe";

// Stripe adapter (shared six-function shape, after Openfront E-commerce features/integrations/payment/stripe.ts).
// Card data never reaches this server: the browser tokenizes with Stripe Elements and we receive a PaymentMethod id
// as opaqueData { dataDescriptor: "stripe.payment_method", dataValue: "pm_..." }. The server creates and confirms the
// PaymentIntent with the attempt's stable idempotency key, so a retry never charges twice.

type OpaqueData = { dataDescriptor: string; dataValue: string };
type Input = {
  amount?: number;
  currency?: string;
  paymentId?: string;
  idempotencyKey?: string;
  opaqueData?: OpaqueData;
  captureNow?: boolean;
  rawBody?: string;
  headers?: Record<string, string>;
};

export const STRIPE_PAYMENT_METHOD_DESCRIPTOR = "stripe.payment_method";

const client = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Stripe secret key is not configured");
  return new Stripe(key, { apiVersion: "2025-08-27.basil", maxNetworkRetries: 2, timeout: 30_000 });
};

/** Metadata key the status lookup searches by; Stripe keys are at most 255 chars. */
const keyMetadata = (idempotencyKey: string) => idempotencyKey.slice(0, 255);

const STATUS: Record<string, string> = {
  succeeded: "succeeded",
  canceled: "failed",
  requires_payment_method: "failed",
  processing: "pending",
  requires_action: "pending",
  requires_confirmation: "pending",
  requires_capture: "authorized",
};

function shape(intent: Stripe.PaymentIntent) {
  return {
    status: STATUS[intent.status] ?? "pending",
    paymentIntentId: intent.id,
    amount: intent.amount_received || intent.amount,
    currency: intent.currency.toUpperCase(),
    data: { id: intent.id, status: intent.status, lastError: intent.last_payment_error?.code ?? null },
  };
}

export async function createPaymentFunction({ amount, currency, idempotencyKey, opaqueData, captureNow = true }: Input) {
  if (!amount || amount <= 0 || !currency) throw new Error("Stripe payment amount and currency are required");
  if (!idempotencyKey) throw new Error("Stripe payment requires an idempotency key");
  if (opaqueData?.dataDescriptor !== STRIPE_PAYMENT_METHOD_DESCRIPTOR || !/^pm_[A-Za-z0-9_]{6,}$/.test(opaqueData.dataValue)) {
    return { status: "failed", paymentIntentId: "", data: { error: "PAYMENT_METHOD_REQUIRED" } };
  }
  const stripe = client();
  try {
    const intent = await stripe.paymentIntents.create(
      {
        amount,
        currency: currency.toLowerCase(),
        payment_method: opaqueData.dataValue,
        confirm: true,
        capture_method: captureNow ? "automatic" : "manual",
        automatic_payment_methods: { enabled: true, allow_redirects: "never" },
        metadata: { idempotency_key: keyMetadata(idempotencyKey) },
      },
      { idempotencyKey: `sportsbook:${idempotencyKey}`.slice(0, 255) },
    );
    return shape(intent);
  } catch (error) {
    // A card error is a definitive decline; anything else (network, API) leaves the outcome unknown for reconciliation.
    if (error instanceof Stripe.errors.StripeCardError) {
      return { status: "failed", paymentIntentId: (error.payment_intent as any)?.id ?? "", data: { error: error.code ?? "card_declined" } };
    }
    throw error;
  }
}

/** Looks up the attempt by the original provider key (never dispatches anything new). */
export async function getPaymentStatusFunction({ paymentId }: Input) {
  if (!paymentId) throw new Error("Stripe status lookup requires the attempt key");
  const stripe = client();
  if (/^pi_[A-Za-z0-9]+$/.test(paymentId)) return shape(await stripe.paymentIntents.retrieve(paymentId));
  const found = await stripe.paymentIntents.search({ query: `metadata['idempotency_key']:'${keyMetadata(paymentId).replace(/'/g, "\\'")}'`, limit: 1 });
  const intent = found.data[0];
  if (!intent) return { status: "pending", paymentIntentId: "", data: { error: "NOT_FOUND_YET" } };
  return shape(intent);
}

export async function capturePaymentFunction({ paymentId, amount, idempotencyKey }: Input) {
  if (!paymentId) throw new Error("Stripe capture requires a PaymentIntent id");
  const intent = await client().paymentIntents.capture(paymentId, amount ? { amount_to_capture: amount } : {}, idempotencyKey ? { idempotencyKey } : undefined);
  return shape(intent);
}

export async function refundPaymentFunction({ paymentId, amount, idempotencyKey }: Input) {
  if (!paymentId) throw new Error("Stripe refund requires a PaymentIntent id");
  const refund = await client().refunds.create({ payment_intent: paymentId, ...(amount ? { amount } : {}) }, idempotencyKey ? { idempotencyKey: `refund:${idempotencyKey}`.slice(0, 255) } : undefined);
  return {
    status: refund.status === "succeeded" ? "refunded" : refund.status === "failed" || refund.status === "canceled" ? "failed" : "pending",
    amount: refund.amount,
    currency: refund.currency.toUpperCase(),
    method: "refund",
    data: { transId: refund.id },
  };
}

export async function generatePaymentLinkFunction({ paymentId }: Input) {
  const live = (process.env.STRIPE_SECRET_KEY ?? "").startsWith("sk_live_");
  return `https://dashboard.stripe.com/${live ? "" : "test/"}payments/${paymentId}`;
}

export async function handleWebhookFunction({ rawBody, headers }: Input) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("Stripe webhook secret is not configured");
  if (!rawBody) throw new Error("Raw webhook body is required");
  const event = client().webhooks.constructEvent(rawBody, headers?.["stripe-signature"] ?? "", secret);
  return { isValid: true, event, type: event.type, resource: event.data.object };
}

/** Publishable key for Stripe Elements; only a pk_ value is ever exposed to the browser. */
export function stripePublishableKey() {
  const key = process.env.NEXT_PUBLIC_STRIPE_KEY || process.env.STRIPE_PUBLISHABLE_KEY || "";
  return /^pk_(test|live)_/.test(key) ? key : "";
}
