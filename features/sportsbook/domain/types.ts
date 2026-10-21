export type Minor = bigint
export type DecimalOdds = string

export type GateCode =
  | 'TENANT_INACTIVE' | 'PLAYER_INACTIVE' | 'KYC_REQUIRED' | 'GEO_REQUIRED'
  | 'SELF_EXCLUDED' | 'LIMIT_EXCEEDED' | 'QUOTE_EXPIRED' | 'MARKET_CLOSED'
  | 'STALE_PRICE' | 'INSUFFICIENT_FUNDS' | 'LIABILITY_EXCEEDED'

export type GateResult = { gate: string; passed: boolean; code?: GateCode }

export interface QuoteTerms {
  id: string
  tenantId: string
  playerId: string
  selectionId: string
  snapshotId: string
  decimalOdds: DecimalOdds
  line?: string
  stake: Minor
  currency: string
  expiresAt: Date
  policyVersion: string
  rulesHash: string
}

export interface AcceptanceFacts {
  now: Date
  tenantActive: boolean
  playerActive: boolean
  kycApproved: boolean
  geoApproved: boolean
  selfExcluded: boolean
  wageredInPeriod: Minor
  periodLimit?: Minor
  marketOpen: boolean
  priceReceivedAt: Date
  maxPriceAgeMs: number
  available: Minor
  currentLiability: Minor
  maxLiability: Minor
}

export interface AcceptanceDecision {
  accepted: boolean
  gates: GateResult[]
  rejectionCode?: GateCode
  potentialReturn: Minor
  liability: Minor
  termsHash: string
}

export type GradeOutcome = 'WIN' | 'LOSS' | 'PUSH' | 'VOID' | 'DEAD_HEAT'
export interface Grade { outcome: GradeOutcome; factorNumerator?: bigint; factorDenominator?: bigint }
