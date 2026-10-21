export type FundingAction = 'DEPOSIT' | 'WITHDRAWAL'

export type FundingDraft = Readonly<{
  action: FundingAction
  amountInput: string
  amountMinor: string
  currency: string
}>

export type FundingIntent = Readonly<FundingDraft & {
  idempotencyKey: string
  method: 'POST' | 'PUT'
  body: string
}>

/** Freeze the customer-visible intent and exact existing wallet API request before the first send. */
export function resolveFundingIntent(
  pending: FundingIntent | null,
  draft: FundingDraft,
  createIdempotencyKey: () => string,
): FundingIntent {
  if (pending) return pending

  const idempotencyKey = createIdempotencyKey()
  const method = draft.action === 'DEPOSIT' ? 'POST' : 'PUT'
  // The displayed currency is sent so the server rejects the request if the wallet currency changed.
  const body = JSON.stringify({ amountMinor: draft.amountMinor, currency: draft.currency, idempotencyKey })

  return Object.freeze({ ...draft, idempotencyKey, method, body })
}

export function fundingRequestInit(intent: FundingIntent): Pick<RequestInit, 'method' | 'body'> {
  return { method: intent.method, body: intent.body }
}

const STORAGE_PREFIX = 'openfront-sportsbook:funding-intent:'

/**
 * Durable, owner-bound copy of an unresolved intent (no credentials or identity data), written before the
 * first send so a reload/navigation restores the exact original method, body and key instead of a new attempt.
 */
export function persistFundingIntent(owner: string, intent: FundingIntent) {
  if (!owner) return
  try { window.localStorage.setItem(STORAGE_PREFIX + owner, JSON.stringify(intent)) } catch { /* storage unavailable: in-page freezing still applies */ }
}

export function clearPersistedFundingIntent(owner: string) {
  if (!owner) return
  try { window.localStorage.removeItem(STORAGE_PREFIX + owner) } catch { /* ignore */ }
}

export function loadPersistedFundingIntent(owner: string): FundingIntent | null {
  if (!owner) return null
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + owner)
    if (!raw) return null
    const value = JSON.parse(raw) as Partial<FundingIntent>
    if ((value.action !== 'DEPOSIT' && value.action !== 'WITHDRAWAL') || !/^\d+$/.test(String(value.amountMinor)) || !/^[A-Za-z0-9:_-]{8,128}$/.test(String(value.idempotencyKey)) || typeof value.currency !== 'string' || typeof value.amountInput !== 'string') return null
    const method = value.action === 'DEPOSIT' ? 'POST' : 'PUT'
    const body = JSON.stringify({ amountMinor: value.amountMinor, currency: value.currency, idempotencyKey: value.idempotencyKey })
    // Only the exact original request shape is restorable.
    if (value.method !== method || value.body !== body) return null
    return Object.freeze({ action: value.action, amountInput: value.amountInput, amountMinor: String(value.amountMinor), currency: value.currency, idempotencyKey: String(value.idempotencyKey), method, body })
  } catch {
    return null
  }
}
