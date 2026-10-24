export type CustomerSessionSummary = {
  authenticated: boolean
  mode: 'sandbox'
  accountReference?: string
  assuranceLevel?: 'GUEST' | 'PASSWORD' | 'MFA'
  currency?: string
  /** CurrencyDefinition.exponent of `currency`. */
  currencyExponent?: number
  availableMinor?: string
  kycStatus?: string
  geoStatus?: string
  selfExcluded?: boolean
  accountStatus?: string
  locale?: string
  timezone?: string
  preferredOddsFormat?: 'DECIMAL' | 'AMERICAN' | 'FRACTIONAL'
}

export type CatalogSelection = {
  selectionId: string
  priceSnapshotId: string
  label: string
  decimalOdds: string
  state: 'OPEN' | 'SUSPENDED' | 'STALE' | 'CLOSED'
  priceIssuedAt: string | null
}

export type CatalogMarket = {
  marketId: string
  name: string
  state: 'OPEN' | 'SUSPENDED' | 'CLOSED'
  selections: CatalogSelection[]
}

export type CatalogEvent = {
  eventId: string
  sportKey: string
  sportName: string
  competitionId: string
  /** URL slug for the competition: its catalog key, or its id when no key is set. */
  competitionSlug: string
  competition: string
  name: string
  startsAt: string
  state: 'SCHEDULED' | 'LIVE' | 'SUSPENDED' | 'CLOSED'
  livePhase?: string
  clockSeconds?: number | null
  markets: CatalogMarket[]
}

export type CatalogFilters = {
  sport?: string
  competition?: string
  eventId?: string
  query?: string
  live?: boolean
  ids?: string[]
  cursor?: string
  limit?: number
}

export type CatalogResponse = {
  mode: 'sandbox'
  currency: string
  generatedAt: string
  /** Count of every published event matching the filters (not just this page). */
  total: number
  liveCount: number
  nextCursor: string | null
  facets: { sports: Array<{ key: string; name: string }>; competitions: Array<{ id: string; name: string; sportKey: string }> }
  events: CatalogEvent[]
}

export type CustomerQuote = {
  state: 'QUOTED'
  quoteId: string
  eventId: string
  marketId: string
  selectionId: string
  priceSnapshotId: string
  eventName: string
  marketName: string
  selectionName: string
  decimalOdds: string
  stakeMinor: string
  potentialReturnMinor: string
  currency: string
  termsHash: string
  expiresAt: string
}

export type CustomerWagerResult = {
  state: 'ACCEPTED' | 'REJECTED' | 'REQUOTE_REQUIRED' | 'SUSPENDED' | 'IN_PROGRESS'
  accepted: boolean
  duplicate: boolean
  wagerId?: string
  receiptId?: string
  rejectionCode?: string | null
  termsHash?: string
  potentialReturnMinor?: string
  quote?: CustomerQuote
}

export type FundingResult = {
  /** PENDING: provider outcome not yet definitive; reserved funds stay held and the same key recovers it. */
  state: 'SUCCEEDED' | 'REJECTED' | 'IN_PROGRESS' | 'PENDING'
  duplicate: boolean
  paymentId?: string
  amountMinor?: string
  currency?: string
  /** CurrencyDefinition.exponent of `currency`. */
  currencyExponent?: number
  availableMinor?: string
  rejectionCode?: string
  pendingCode?: string
}

export type WalletTransaction = {
  id: string
  type: string
  amountMinor: string
  currency: string
  status: string
  createdAt: string
  externalReference?: string
}

export type WalletResponse = {
  mode: 'sandbox'
  currency: string
  /** CurrencyDefinition.exponent of the wallet currency. */
  currencyExponent: number
  /** Sandbox funding bounds in minor units of the wallet currency. */
  fundingMinMinor: string
  fundingMaxMinor: string
  depositsEnabled: boolean
  withdrawalsEnabled: boolean
  availableMinor: string
  postedMinor: string
  pendingMinor: string
  heldMinor: string
  bonusAvailableMinor: string
  bonusAwards: Array<{ id: string; type: string; remainingMinor: string; status: string; expiresAt: string }>
  asOf: string | null
  transactions: WalletTransaction[]
}

export type CustomerBet = {
  id: string
  settlementEvidence?: { receiptId: string; journalId: string; planHash: string; capturedHoldId: string; resultVersionId: string; ruleVersion: string; outcome: string; payoutMinor: string; currencyExponent: number } | null
  priceEvidenceSource: 'ACCEPTED' | 'QUOTED'
  rejectedPartIndexes: number[]
  status: string
  structure: string
  eventName: string
  marketName: string
  selectionName: string
  decimalOdds: string
  stakeMinor: string
  potentialReturnMinor: string
  payoutMinor: string | null
  currency: string
  termsHash: string
  quoteId: string
  priceSnapshotId: string
  rejectionCode: string | null
  acceptedAt: string | null
  createdAt: string
  legs: Array<{ index: number; eventName: string; marketName: string; selectionName: string; decimalOdds: string; line: string; priceSnapshotId: string; live: boolean; evidenceHash: string }>
  parts: Array<{ id: string; index: number; key: string; stakeMinor: string; decimalOdds: string; potentialReturnMinor: string; status: string }>
  netRemainingStakeMinor: string | null
  cashOut: { acceptedMinor: string; acceptedPortion: string; netRemainingStakeMinor: string } | null
  cashOutHistory: Array<{ id: string; amountMinor: string; currency: string; recordStatus: string; reversalOfId: string | null; reversedById: string | null; effective: boolean; acceptedAt: string | null }>
}

export type BetsResponse = { bets: CustomerBet[]; nextCursor?: string | null }

export type LimitRecord = {
  id: string
  type: 'DEPOSIT' | 'STAKE' | 'LOSS' | 'SESSION'
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY'
  amountMinor: string
  currency: string
  effectiveFrom: string
  effectiveTo: string | null
  state: 'ACTIVE' | 'PENDING' | 'EXPIRED'
}

export type LimitsResponse = {
  limits: LimitRecord[]
  coolingOffHours: number
}

export type LimitActionResult = {
  state: 'ACTIVE' | 'PENDING' | 'IN_PROGRESS'
  duplicate: boolean
  limitId?: string
  effectiveFrom?: string
}

export type ExclusionActionResult = {
  state: 'ACTIVE' | 'IN_PROGRESS'
  duplicate: boolean
  exclusionId?: string
  endsAt?: string | null
}

export type ResponsiblePlayResponse = {
  selfExclusion: null | {
    id: string
    scope: string
    startsAt: string
    endsAt: string | null
    status: string
    source: string
  }
  history: Array<{
    id: string
    scope: string
    startsAt: string
    endsAt: string | null
    status: string
    source: string
  }>
  wageringRestricted: boolean
  kycStatus: string
  geoStatus: string
}
