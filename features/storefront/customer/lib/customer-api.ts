'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export class CustomerApiError extends Error {
  constructor(
    public readonly code: string,
    public readonly status: number,
    public readonly payload: Record<string, unknown> = {},
  ) {
    super(code)
  }
}

export async function customerApi<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      ...(init?.body ? { 'content-type': 'application/json' } : {}),
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  })
  const payload = await response.json().catch(() => ({})) as Record<string, unknown>
  if (!response.ok) throw new CustomerApiError(String(payload.code ?? payload.error ?? 'REQUEST_FAILED'), response.status, payload)
  return payload as T
}

/** Pass `null` to skip the request (e.g. customer-scoped data while signed out). */
export function useCustomerResource<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(path !== null)
  const [error, setError] = useState<CustomerApiError | null>(null)
  const [version, setVersion] = useState(0)
  const reload = useCallback(() => { setLoading(true); setError(null); setVersion(value => value + 1) }, [])
  const [loadedPath, setLoadedPath] = useState<string | null>(path)

  useEffect(() => {
    if (path === null) { setData(null); setError(null); setLoading(false); setLoadedPath(path); return }
    const controller = new AbortController()
    setLoading(true)
    // A different resource (filters, cursor, account) never shows the previous resource's rows as current.
    if (loadedPath !== path) { setData(null); setError(null); setLoadedPath(path) }
    customerApi<T>(path, { signal: controller.signal })
      .then(result => {
        // Only the newest request may publish; a late response for an older path/version is dropped.
        if (controller.signal.aborted) return
        if (path.startsWith('/api/sandbox/sportsbook/session')) applyDisplayPreferences(result as DisplayPreferenceSource)
        setError(null)
        setData(result)
      })
      .catch(reason => {
        if (reason instanceof DOMException && reason.name === 'AbortError') return
        if (controller.signal.aborted) return
        // A failed refresh is unavailable, not empty: drop rows that can no longer be shown as current.
        setData(null)
        setError(reason instanceof CustomerApiError ? reason : new CustomerApiError('REQUEST_FAILED', 500))
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [path, version])

  return { data, loading, error, reload, setData }
}

/**
 * Minor-unit exponent for display. Pass the server-supplied CurrencyDefinition.exponent whenever the
 * response carries it; otherwise the ISO 4217 minor-unit count for the code is used. No currency is assumed.
 */
export function currencyExponent(currency: string, exponent?: number | null) {
  if (Number.isInteger(exponent) && (exponent as number) >= 0 && (exponent as number) <= 6) return exponent as number
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).resolvedOptions().maximumFractionDigits ?? 0
  } catch {
    return 0
  }
}

export function formatMinor(value: string, currency: string, exponent?: number | null) {
  if (!/^-?\d+$/.test(value) || !currency) return '—'
  const places = currencyExponent(currency, exponent)
  const negative = value.startsWith('-')
  const digits = negative ? value.slice(1) : value
  const padded = digits.padStart(places + 1, '0')
  const whole = (places ? padded.slice(0, -places) : padded).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  const fraction = places ? `.${padded.slice(-places)}` : ''
  const symbol = currency === 'USD' ? '$' : `${currency} `
  return `${negative ? '-' : ''}${symbol}${whole}${fraction}`
}

/** Parse a major-unit input into exact minor units using the currency's exponent (no float math). */
export function amountInputToMinor(value: string, exponent: number) {
  const pattern = exponent > 0 ? new RegExp(`^\\d{0,12}(\\.\\d{0,${exponent}})?$`) : /^\d{0,12}$/
  if (!pattern.test(value)) return null
  if (!value || value === '.') return null
  const [whole, fraction = ''] = value.split('.')
  return String(BigInt(whole || '0') * 10n ** BigInt(exponent) + BigInt(fraction.padEnd(exponent, '0') || '0'))
}

/** Render minor units as a plain major-unit input string. */
export function minorToAmountInput(value: string, exponent: number) {
  if (!/^\d+$/.test(value)) return ''
  if (!exponent) return value
  const padded = value.padStart(exponent + 1, '0')
  return `${padded.slice(0, -exponent)}.${padded.slice(-exponent)}`
}

export function potentialReturnMinor(stakeMinor: string, decimalOdds: string) {
  if (!/^\d+$/.test(stakeMinor) || !/^\d+(\.\d+)?$/.test(decimalOdds)) return null
  const [whole, fraction = ''] = decimalOdds.split('.')
  const scale = 10n ** BigInt(fraction.length)
  return String((BigInt(stakeMinor) * (BigInt(whole) * scale + BigInt(fraction || '0'))) / scale)
}

export const shortId = (value: string) => value ? `${value.slice(0, 7)}…${value.slice(-5)}` : '—'

type DisplayPreferenceSource = { authenticated?: boolean; locale?: string; timezone?: string; preferredOddsFormat?: string }
const displayPreferences: { locale: string; timeZone?: string; oddsFormat: 'DECIMAL' | 'AMERICAN' | 'FRACTIONAL' } = { locale: 'en-US', oddsFormat: 'DECIMAL' }

/** The signed-in customer's saved locale, time zone and odds format drive every customer display. */
export function applyDisplayPreferences(source: DisplayPreferenceSource | null) {
  if (!source?.authenticated) return
  try { if (source.locale) { new Intl.DateTimeFormat(source.locale); displayPreferences.locale = source.locale } } catch {}
  try { if (source.timezone) { new Intl.DateTimeFormat('en-US', { timeZone: source.timezone }); displayPreferences.timeZone = source.timezone } } catch {}
  if (source.preferredOddsFormat === 'AMERICAN' || source.preferredOddsFormat === 'FRACTIONAL' || source.preferredOddsFormat === 'DECIMAL') displayPreferences.oddsFormat = source.preferredOddsFormat
}

export function formatDate(value: string | null, includeTime = true) {
  if (!value) return '—'
  return new Intl.DateTimeFormat(displayPreferences.locale, includeTime
    ? { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: displayPreferences.timeZone, timeZoneName: displayPreferences.timeZone ? 'short' : undefined }
    : { month: 'short', day: 'numeric', year: 'numeric', timeZone: displayPreferences.timeZone }).format(new Date(value))
}

const gcd = (a: bigint, b: bigint): bigint => b === 0n ? a : gcd(b, a % b)
/**
 * Display a decimal price in the customer's preferred format. The accepted decimal price remains the
 * contract; American and fractional values are exact conversions of it, shown for readability only.
 */
export function formatOdds(decimalOdds: string, format = displayPreferences.oddsFormat) {
  if (!/^\d+(\.\d+)?$/.test(decimalOdds)) return decimalOdds || '—'
  if (format === 'DECIMAL') return decimalOdds
  const [whole, fraction = ''] = decimalOdds.split('.')
  const scale = 10n ** BigInt(fraction.length)
  const scaled = BigInt(whole) * scale + BigInt(fraction || '0')
  const profit = scaled - scale
  if (profit <= 0n) return format === 'FRACTIONAL' ? '0/1' : decimalOdds
  if (format === 'FRACTIONAL') { const divisor = gcd(profit, scale); return `${profit / divisor}/${scale / divisor}` }
  // American: +100×profit when profit ≥ stake, otherwise −100/profit; rounded to whole points.
  if (profit >= scale) return `+${(profit * 100n + scale / 2n) / scale}`
  return `-${(scale * 100n + profit / 2n) / profit}`
}

/**
 * Per-form safe drafts: the first submit of a slot freezes the exact request body and idempotency key; a retry
 * after a lost/5xx response resends them unchanged (edited form values cannot alter it). Only a definitive server
 * answer (2xx, or a 4xx refusal/receipt) clears the slot so a new draft can start.
 */
export function useFrozenSubmission() {
  const drafts = useRef(new Map<string, { method: string; path: string; body: string }>())
  const [unresolved, setUnresolved] = useState<string[]>([])
  const sync = () => setUnresolved([...drafts.current.keys()])
  const submit = useCallback(async <T,>(slot: string, path: string, method: 'POST' | 'PUT' | 'PATCH' | 'DELETE', build: (idempotencyKey: string) => Record<string, unknown>, prefix = slot): Promise<T> => {
    let draft = drafts.current.get(slot)
    if (!draft) {
      const idempotencyKey = `${prefix}_${crypto.randomUUID()}`
      draft = { method, path, body: JSON.stringify(build(idempotencyKey)) }
      drafts.current.set(slot, draft)
      sync()
    }
    try {
      const result = await customerApi<T>(draft.path, { method: draft.method, body: draft.body })
      drafts.current.delete(slot)
      sync()
      return result
    } catch (error) {
      if (error instanceof CustomerApiError && error.status >= 400 && error.status < 500 && error.status !== 408 && error.status !== 429) {
        drafts.current.delete(slot)
        sync()
      }
      throw error
    }
  }, [])
  return { submit, isUnresolved: (slot: string) => unresolved.includes(slot) }
}

const customerCopy: Record<string, string> = {
  SANDBOX_DISABLED: 'Betting is closed right now.',
  SANDBOX_ISOLATION_REQUIRED: 'Betting is closed right now.',
  SANDBOX_OPERATOR_NOT_CONFIGURED: 'This sportsbook isn’t open yet.',
  SANDBOX_BRAND_NOT_CONFIGURED: 'This sportsbook isn’t open yet.',
  SANDBOX_TENANT_NOT_CONFIGURED: 'This sportsbook isn’t open yet.',
  ORIGIN_DENIED: 'The request was blocked. Reload the page and try again.',
  UNAUTHENTICATED: 'Sign in to continue.',
  AUTHENTICATION_REQUIRED: 'Sign in to continue.',
  RATE_LIMITED: 'Too many attempts. Wait a moment and try again.',
  PAYLOAD_TOO_LARGE: 'That’s too long. Shorten it and try again.',
  INVALID_REQUEST: 'Check the details and try again.',
  INVALID_JSON: 'Check the details and try again.',
  INSUFFICIENT_FUNDS: 'Your available balance is too low.',
  SELF_EXCLUDED: 'Unavailable while self-exclusion is active.',
  ACCOUNT_RESTRICTED: 'Unavailable while your account is restricted.',
  VERIFICATION_REQUIRED: 'Verify your identity in Profile first.',
  LIMIT_EXCEEDED: 'This would exceed one of your limits.',
  OFFER_EXPIRED: 'The offer expired. Get a new one.',
  REQUEST_FAILED: 'Something went wrong. Try again.',
}

/** Customer-facing copy for an API refusal; internal codes are never shown raw. */
export function customerMessage(error: unknown, fallback = 'Something went wrong. Try again.') {
  if (!(error instanceof CustomerApiError)) return fallback
  const code = String(error.payload.rejectionCode ?? error.code)
  return customerCopy[code] ?? fallback
}
