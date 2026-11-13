"use client";

import { useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";

type Token = { dataDescriptor: string; dataValue: string };

function CardFields({ onToken, tokenized }: { onToken: (token: Token | null) => void; tokenized: boolean }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function tokenize(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!stripe || !elements) return;
    const card = elements.getElement(CardElement);
    if (!card) return;
    setBusy(true);
    setError("");
    const result = await stripe.createPaymentMethod({ type: "card", card });
    setBusy(false);
    if (result.error || !result.paymentMethod) {
      setError(result.error?.message || "The card couldn’t be checked. Try again.");
      onToken(null);
      return;
    }
    // Only the PaymentMethod id leaves the browser; the server charges it with the attempt's idempotency key.
    onToken({ dataDescriptor: "stripe.payment_method", dataValue: result.paymentMethod.id });
  }
  return (
    <form onSubmit={tokenize} className="mt-4 space-y-3" aria-label="Card details">
      <div className="rounded-[2px] bg-white px-3 py-3.5 ring-1 ring-sb-line">
        <CardElement options={{ hidePostalCode: false, style: { base: { fontSize: "16px" } } }} onChange={() => { if (tokenized) onToken(null); }} />
      </div>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <button type="submit" disabled={!stripe || busy} className="rounded-[2px] bg-sb-night px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
        {busy ? "Checking card…" : tokenized ? "Card ready ✓" : "Use this card"}
      </button>
    </form>
  );
}

export default function StripeCardForm({ publishableKey, onToken, tokenized }: { publishableKey: string; onToken: (token: Token | null) => void; tokenized: boolean }) {
  const stripePromise = useMemo(() => loadStripe(publishableKey), [publishableKey]);
  return (
    <Elements stripe={stripePromise}>
      <CardFields onToken={onToken} tokenized={tokenized} />
    </Elements>
  );
}
