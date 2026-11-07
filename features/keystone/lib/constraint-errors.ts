/**
 * Database rules and what a person should read when one refuses a write. Names come from the migrations
 * (20261107180000_sportsbook_invariants adds the round-2 rules). `fields` lets a unique violation that Prisma
 * reports by column list instead of index name still find its message.
 */
export type Refusal = { code: string; message: string; status: number }
type Rule = { code: string; message: string; fields?: string[]; status?: number }

export const CONSTRAINT_MESSAGES: Record<string, Rule> = {
  // Round 2
  Sport_tenant_key_uq: { code: 'CATALOG_KEY_EXISTS', message: 'A sport with this key already exists.' },
  Competition_sport_key_uq: { code: 'CATALOG_KEY_EXISTS', message: 'This sport already has a competition with that key.', fields: ['tenant', 'sport', 'key'] },
  Competitor_tenant_key_uq: { code: 'CATALOG_KEY_EXISTS', message: 'A competitor with this key already exists.', fields: ['tenant', 'key'] },
  Selection_market_key_uq: { code: 'SELECTION_KEY_EXISTS', message: 'This market already has a selection with that key.', fields: ['tenant', 'market', 'key'] },
  Event_external_key_uq: { code: 'EXTERNAL_KEY_EXISTS', message: 'An event with this external key already exists.', fields: ['tenant', 'externalKey'] },
  LedgerAccount_owner_key_currency_uq: { code: 'LEDGER_ACCOUNT_EXISTS', message: 'That ledger account already exists. Nothing was posted; try again.', fields: ['tenant', 'player', 'key', 'currency'] },
  ExposurePosition_scope_currency_uq: { code: 'EXPOSURE_CHANGED', message: 'Market exposure changed while this bet was placed. Nothing was taken; try again.', fields: ['tenant', 'scopeType', 'scopeId', 'currency'] },
  SelfExclusion_one_active_per_player: { code: 'SELF_EXCLUSION_ACTIVE', message: 'This player already has an active self-exclusion. Extend it instead.', fields: ['tenant', 'player'] },
  VerificationCase_one_pending_per_type: { code: 'VERIFICATION_ALREADY_OPEN', message: 'This player already has an open verification case of that type. Decide it first.', fields: ['tenant', 'player', 'type'] },
  PlayerLimit_amount_check: { code: 'INVALID_LIMIT', message: 'A limit must be a whole, non-negative amount in a three-letter currency.' },
  LimitRule_amounts_check: { code: 'INVALID_LIMIT', message: 'Stake, payout and liability limits must be whole, non-negative amounts.' },
  PaymentIntent_fee_check: { code: 'INVALID_AMOUNT', message: 'A payment fee can’t be negative.' },
  Settlement_payout_arithmetic: { code: 'SETTLEMENT_ARITHMETIC', message: 'A settlement must pay its gross payout less withheld tax.' },
  ExposurePosition_amounts_check: { code: 'INVALID_AMOUNT', message: 'Exposure can’t be negative.' },
  TaxAssessment_amounts_check: { code: 'INVALID_AMOUNT', message: 'Tax basis and amount can’t be negative.' },
  ReconciliationItem_difference_check: { code: 'INVALID_AMOUNT', message: 'A reconciliation difference must be a whole amount.' },
  SelfExclusion_range_check: { code: 'INVALID_EXCLUSION_END', message: 'A self-exclusion must end after it starts.' },
  TraderOverride_range_check: { code: 'INVALID_EXPIRY', message: 'An override must expire after it starts.' },
  Season_range_check: { code: 'INVALID_SEASON', message: 'A season must end after it starts.' },
  AccountRestriction_range_check: { code: 'INVALID_TIME_RANGE', message: 'A restriction must end after it starts.' },
  LegalHold_range_check: { code: 'INVALID_TIME_RANGE', message: 'A legal hold must end after it starts.' },
  ComplianceReport_period_check: { code: 'INVALID_PERIOD', message: 'A report period can’t end before it starts.' },
  PlayerStatement_period_check: { code: 'INVALID_PERIOD', message: 'A statement period can’t end before it starts.' },
  // Earlier migrations: operator-reachable uniques that surfaced as "Unexpected error."
  Season_competition_key_uq: { code: 'CATALOG_KEY_EXISTS', message: 'This competition already has a season with that key.', fields: ['tenant', 'competition', 'key'] },
  CompetitionStage_season_key_uq: { code: 'CATALOG_KEY_EXISTS', message: 'This season already has a stage with that key.', fields: ['tenant', 'season', 'key'] },
  Venue_key_uq: { code: 'CATALOG_KEY_EXISTS', message: 'A venue with this key already exists.' },
  Region_key_uq: { code: 'CATALOG_KEY_EXISTS', message: 'A region with this key already exists.' },
  Promotion_key_uq: { code: 'PROMOTION_KEY_EXISTS', message: 'A promotion with this key already exists.' },
  OperatorChannel_key_uq: { code: 'CHANNEL_KEY_EXISTS', message: 'A channel with this key already exists.' },
  WebhookEndpoint_url_uq: { code: 'WEBHOOK_URL_EXISTS', message: 'A webhook endpoint with this URL already exists.', fields: ['tenant', 'url'] },
  TenantCurrency_currency_uq: { code: 'CURRENCY_ALREADY_ENABLED', message: 'This currency is already enabled.', fields: ['tenant', 'currency'] },
  TenantCurrency_one_default_uq: { code: 'DEFAULT_CURRENCY_EXISTS', message: 'Another currency is already the default.' },
  ConfigDefinition_key_uq: { code: 'CONFIG_KEY_EXISTS', message: 'A setting with this key already exists.' },
  FeatureFlag_scope_uq: { code: 'FEATURE_FLAG_EXISTS', message: 'This flag is already set for that scope.' },
  MarketDefinition_key_version_uq: { code: 'MARKET_DEFINITION_VERSION_EXISTS', message: 'That market definition version already exists.' },
  HouseRuleVersion_name_version_uq: { code: 'RULE_VERSION_EXISTS', message: 'That house-rule version already exists.' },
  LegalEntity_registration_uq: { code: 'LEGAL_ENTITY_EXISTS', message: 'A legal entity with this registration already exists.' },
  Brand_domain_uq: { code: 'BRAND_DOMAIN_EXISTS', message: 'Another brand already uses this domain.', fields: ['domain'] },
  Promotion_budget_check: { code: 'INVALID_PROMOTION', message: 'A promotion needs a non-negative budget in a three-letter currency and must end after it starts.' },
  ApprovalRequest_dual_control_check: { code: 'DUAL_CONTROL_REQUIRED', message: 'Needs approval by a different operator.' },
}

type ErrorLink = { message?: unknown; code?: unknown; meta?: Record<string, unknown>; originalError?: unknown; cause?: unknown; extensions?: { debug?: { message?: unknown }; prisma?: { meta?: unknown } } }

function chain(error: unknown) {
  const out: ErrorLink[] = []
  let current = error as ErrorLink
  for (let depth = 0; current && depth < 6; depth++) { out.push(current); current = (current.originalError ?? current.cause) as ErrorLink }
  return out
}

const refusal = (rule: Rule): Refusal => ({ code: rule.code, message: rule.message, status: rule.status ?? 409 })

/** The readable, coded refusal for a known database rule anywhere in the error's cause chain, or null. */
export function constraintRefusal(error: unknown): Refusal | null {
  for (const link of chain(error)) {
    const meta = link?.meta && typeof link.meta === 'object' ? link.meta : undefined
    const text = [
      String(link?.message ?? ''), meta ? JSON.stringify(meta) : '',
      String(link?.extensions?.debug?.message ?? ''), link?.extensions?.prisma?.meta ? JSON.stringify(link.extensions.prisma.meta) : '',
    ].join(' ')
    for (const [name, rule] of Object.entries(CONSTRAINT_MESSAGES)) if (text.includes(name)) return refusal(rule)
    // Prisma reports some unique violations by column list instead of index name; raw SQL by Postgres's own detail.
    const listed = /Unique constraint failed on the fields: \(([^)]*)\)/.exec(text)?.[1]?.match(/`([^`]+)`/g)?.map(field => field.slice(1, -1))
    const keyed = /Key \(([^)]*)\)=\(.*\) already exists/.exec(text)?.[1]?.split(',').map(field => field.trim().replace(/^"|"$/g, ''))
    const target = link?.code === 'P2002' && Array.isArray(meta?.target) ? meta!.target as string[] : listed ?? keyed
    if (target?.length) {
      const key = [...target].map(String).sort().join(',')
      const match = Object.values(CONSTRAINT_MESSAGES).find(rule => rule.fields && [...rule.fields].sort().join(',') === key)
      if (match) return refusal(match)
    }
  }
  return null
}
