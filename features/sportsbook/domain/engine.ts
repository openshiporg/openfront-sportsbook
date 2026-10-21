import { createHash } from 'node:crypto'
import type { AcceptanceDecision, AcceptanceFacts, GateCode, GateResult, Grade, Minor, QuoteTerms } from './types'

const canonical = (value: unknown): string => {
  if (typeof value === 'bigint') return `"${value}"`
  if (value instanceof Date) return JSON.stringify(value.toISOString())
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`
  if (value && typeof value === 'object') return `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`).join(',')}}`
  return JSON.stringify(value)
}
export const evidenceHash = (value: unknown) => createHash('sha256').update(canonical(value)).digest('hex')

/** Decimal multiplication without floating point; final result rounds down to minor units. */
export function potentialReturn(stake: Minor, decimalOdds: string): Minor {
  if (!/^\d+(\.\d+)?$/.test(decimalOdds)) throw new Error('INVALID_ODDS')
  const [whole, fraction = ''] = decimalOdds.split('.')
  const scale = 10n ** BigInt(fraction.length)
  const numerator = BigInt(whole) * scale + BigInt(fraction || '0')
  if (numerator < scale) throw new Error('ODDS_BELOW_ONE')
  return (stake * numerator) / scale
}

export function evaluateAcceptance(quote: QuoteTerms, facts: AcceptanceFacts): AcceptanceDecision {
  const checks: Array<[string, boolean, GateCode]> = [
    ['tenant', facts.tenantActive, 'TENANT_INACTIVE'],
    ['player', facts.playerActive, 'PLAYER_INACTIVE'],
    ['kyc', facts.kycApproved, 'KYC_REQUIRED'],
    ['geo', facts.geoApproved, 'GEO_REQUIRED'],
    ['selfExclusion', !facts.selfExcluded, 'SELF_EXCLUDED'],
    ['responsibleGamingLimit', facts.periodLimit === undefined || facts.wageredInPeriod + quote.stake <= facts.periodLimit, 'LIMIT_EXCEEDED'],
    ['quoteExpiry', facts.now.getTime() < quote.expiresAt.getTime(), 'QUOTE_EXPIRED'],
    ['market', facts.marketOpen, 'MARKET_CLOSED'],
    ['priceFreshness', facts.now.getTime() - facts.priceReceivedAt.getTime() <= facts.maxPriceAgeMs, 'STALE_PRICE'],
    ['funds', facts.available >= quote.stake, 'INSUFFICIENT_FUNDS'],
  ]
  const returns = potentialReturn(quote.stake, quote.decimalOdds)
  const liability = returns - quote.stake
  checks.push(['liability', facts.currentLiability + liability <= facts.maxLiability, 'LIABILITY_EXCEEDED'])
  const gates: GateResult[] = checks.map(([gate, passed, code]) => ({ gate, passed, ...(passed ? {} : { code }) }))
  const rejectionCode = gates.find(g => !g.passed)?.code
  return { accepted: !rejectionCode, gates, rejectionCode, potentialReturn: returns, liability, termsHash: evidenceHash(quote) }
}

export function settlementAmount(stake: Minor, decimalOdds: string, grade: Grade): Minor {
  switch (grade.outcome) {
    case 'LOSS': return 0n
    case 'PUSH':
    case 'VOID': return stake
    case 'WIN': return potentialReturn(stake, decimalOdds)
    case 'DEAD_HEAT': {
      const n = grade.factorNumerator ?? 1n
      const d = grade.factorDenominator ?? 2n
      if (n < 0n || d <= 0n || n > d) throw new Error('INVALID_DEAD_HEAT_FACTOR')
      return stake + ((potentialReturn(stake, decimalOdds) - stake) * n) / d
    }
  }
}
