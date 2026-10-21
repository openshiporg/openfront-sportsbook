import { cache } from "react";

/**
 * Per-request operator display context: persisted CurrencyDefinition exponents and the
 * tenant's configured locale/timezone. getOperatorContext loads it for every platform
 * screen; React's request cache keeps it scoped to the current server render.
 */
type DisplayContext = { locale: string; timeZone: string; exponents: Map<string, number> };
const requestDisplayContext = cache((): DisplayContext => ({ locale: "en-US", timeZone: "UTC", exponents: new Map() }));

function validLocale(locale: string | null | undefined) {
  if (!locale) return null;
  try { return Intl.NumberFormat.supportedLocalesOf([locale]).length ? locale : null; } catch { return null; }
}

function validTimeZone(timeZone: string | null | undefined) {
  if (!timeZone) return null;
  try { new Intl.DateTimeFormat("en-US", { timeZone }); return timeZone; } catch { return null; }
}

export function setDisplayContext(input: { locale?: string | null; timeZone?: string | null; currencies?: { code: string; exponent: number | null }[] }) {
  const context = requestDisplayContext();
  context.locale = validLocale(input.locale) ?? "en-US";
  context.timeZone = validTimeZone(input.timeZone) ?? "UTC";
  context.exponents = new Map((input.currencies ?? []).filter((item) => item.code && Number.isInteger(item.exponent) && Number(item.exponent) >= 0 && Number(item.exponent) <= 18).map((item) => [item.code.toUpperCase(), Number(item.exponent)]));
}

/** The configured IANA zone operator datetime-local inputs and timestamps are expressed in. */
export function displayTimeZone() {
  return requestDisplayContext().timeZone;
}

export function currencyExponent(currency: string | null | undefined) {
  if (!currency) return undefined;
  return requestDisplayContext().exponents.get(currency.toUpperCase());
}

/**
 * Exact minor-unit formatting. The amount is never converted to Number: the integer part
 * is formatted as a BigInt and the fraction digits come from the persisted currency exponent.
 * A missing currency or unknown exponent is shown as raw minor units rather than guessed.
 */
export function money(amountMinor: string | number | bigint | null | undefined, currency?: string | null, exponent?: number | null) {
  if (amountMinor === null || amountMinor === undefined || amountMinor === "") return "—";
  let amount: bigint;
  try { amount = BigInt(amountMinor); } catch { return `${String(amountMinor)} (invalid amount)`; }
  if (!currency) return `${amount} minor units (currency unknown)`;
  const scale = exponent ?? currencyExponent(currency);
  if (scale === undefined || scale === null || !Number.isInteger(scale) || scale < 0) return `${amount} minor units ${currency} (exponent unknown)`;
  const negative = amount < 0n;
  const absolute = negative ? -amount : amount;
  const divisor = 10n ** BigInt(scale);
  const whole = absolute / divisor;
  const fraction = (absolute % divisor).toString().padStart(scale, "0");
  try {
    const parts = new Intl.NumberFormat(requestDisplayContext().locale, { style: "currency", currency, minimumFractionDigits: scale, maximumFractionDigits: scale }).formatToParts(negative ? -(whole || 1n) : whole);
    let integerWritten = false;
    return parts.map((part) => {
      if (part.type === "fraction") return fraction;
      if (part.type === "integer" && whole === 0n) { if (integerWritten) return ""; integerWritten = true; return "0"; }
      return part.value;
    }).join("");
  } catch {
    return `${negative ? "-" : ""}${whole}${scale ? `.${fraction}` : ""} ${currency}`;
  }
}

/** Adds exact minor-unit amounts per currency; never combines different currencies. */
export function sumByCurrency<T>(rows: T[], amount: (row: T) => string | number | bigint | null | undefined, currency: (row: T) => string | null | undefined) {
  const totals = new Map<string, bigint>();
  for (const row of rows) {
    const value = amount(row);
    if (value === null || value === undefined || value === "") continue;
    const code = currency(row) || "";
    totals.set(code, (totals.get(code) ?? 0n) + BigInt(value));
  }
  return totals;
}

/** Renders per-currency totals as separate figures, e.g. "$10.00 · ¥500". */
export function moneyTotals(totals: Map<string, bigint>) {
  if (!totals.size) return "—";
  return [...totals.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([code, value]) => money(value, code || null)).join(" · ");
}

export function dateTime(value: Date | string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const context = requestDisplayContext();
  return new Intl.DateTimeFormat(context.locale, { dateStyle: "medium", timeStyle: "short", timeZone: context.timeZone }).format(date) + ` ${context.timeZone}`;
}

/**
 * Effective-now projection for windowed protections, matching wager acceptance for self-exclusions
 * (status ACTIVE and startsAt <= now < endsAt). Stored status is shown separately by callers.
 */
export function windowState(item: { status?: string | null; startsAt?: Date | string | null; endsAt?: Date | string | null }, now = new Date()) {
  if (item.status !== "ACTIVE") return item.status || "UNKNOWN";
  if (item.startsAt && new Date(item.startsAt) > now) return "SCHEDULED";
  if (item.endsAt && new Date(item.endsAt) <= now) return "ENDED";
  return "EFFECTIVE";
}

export function shortId(value: string) {
  return value.length > 16 ? `${value.slice(0, 8)}…${value.slice(-5)}` : value;
}

export function jsonText(value: unknown) {
  return JSON.stringify(value ?? {}, null, 2);
}
