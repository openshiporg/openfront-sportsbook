const LOCAL_INPUT = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/
const EXPLICIT_OFFSET = /(?:Z|[+-]\d{2}:?\d{2})$/i

function wallClockMs(instant: number, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).formatToParts(new Date(instant))
  const value = (type: string) => Number(parts.find((part) => part.type === type)?.value)
  return Date.UTC(value('year'), value('month') - 1, value('day'), value('hour'), value('minute'), value('second')) + (((instant % 1000) + 1000) % 1000)
}

export function validTimeZone(timeZone: string | null | undefined) {
  if (!timeZone) return null
  try { new Intl.DateTimeFormat('en-US', { timeZone }); return timeZone } catch { return null }
}

/**
 * Resolves an operator-entered time to an exact instant. Values carrying `Z` or an explicit
 * offset are used as-is. Offset-free datetime-local values are interpreted in the tenant's
 * configured IANA timezone (never the server process zone); nonexistent DST-gap times and
 * repeated DST-fold times are rejected so the operator must supply an explicit offset.
 */
export function resolveOperatorInstant(value: unknown, timeZone: string | null | undefined, label = 'TIME') {
  const text = typeof value === 'string' ? value.trim() : ''
  if (!text) throw new Error(`INVALID_${label}`)
  if (EXPLICIT_OFFSET.test(text)) {
    const instant = new Date(text)
    if (Number.isNaN(instant.getTime())) throw new Error(`INVALID_${label}`)
    return instant
  }
  const match = LOCAL_INPUT.exec(text)
  if (!match) throw new Error(`INVALID_${label}`)
  const zone = validTimeZone(timeZone)
  if (!zone) throw new Error(`${label}_TIMEZONE_NOT_CONFIGURED`)
  const [, y, mo, d, h, mi, s, ms] = match
  const local = Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s ?? 0), Number((ms ?? '0').padEnd(3, '0')))
  const check = new Date(local)
  if (check.getUTCFullYear() !== Number(y) || check.getUTCMonth() !== Number(mo) - 1 || check.getUTCDate() !== Number(d) || check.getUTCHours() !== Number(h) || check.getUTCMinutes() !== Number(mi)) throw new Error(`INVALID_${label}`)
  const offsets = new Set([-2, 0, 2].map((days) => { const probe = local + days * 86_400_000; return wallClockMs(probe, zone) - probe }))
  const candidates = [...new Set([...offsets].map((offset) => local - offset))].filter((instant) => wallClockMs(instant, zone) === local)
  if (candidates.length === 0) throw new Error(`NONEXISTENT_LOCAL_${label}`)
  if (candidates.length > 1) throw new Error(`AMBIGUOUS_LOCAL_${label}_PROVIDE_OFFSET`)
  return new Date(candidates[0])
}

/** Same resolution the operator display context uses: tenant default, then active brand locale, then UTC. */
export async function tenantTimeZone(tx: any, tenantId: string) {
  const [tenant, locale] = await Promise.all([
    tx.tenant.findUnique({ where: { id: tenantId }, select: { defaultTimezone: true } }),
    tx.brandLocale.findFirst({ where: { tenantId, status: 'ACTIVE' }, orderBy: [{ default: 'desc' }, { createdAt: 'asc' }], select: { timezone: true } }),
  ])
  return validTimeZone(tenant?.defaultTimezone) ?? validTimeZone(locale?.timezone) ?? 'UTC'
}
