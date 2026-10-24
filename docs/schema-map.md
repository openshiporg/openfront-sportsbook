# Openfront Sportsbook schema map

Written 2026-10-23 from `features/keystone/models/**`, `schema.prisma` (142 lists), `features/keystone/mutations/**`, `features/sportsbook/**` and the onboarding fixture. Every list is tenant-scoped (`tenant` relation) unless noted; that relation is omitted below.

States read left to right as the usual lifecycle; terminal states are last. "Created by" names who writes the record in practice (merchant = an operator in the dashboard, customer = the storefront, system = a mutation side effect or worker).

## Operator

| List | Purpose | Key fields | States | Relations | Created by | Platform page (before this pass) |
|---|---|---|---|---|---|---|
| Tenant | The operator installation boundary; every record carries it. | name, slug, defaultTimezone, supportedLocales, dataResidencyRegion | status: ACTIVE → SUSPENDED → CLOSED | — | Merchant (onboarding) | (control room), approvals, audit, catalog, compliance, configuration, customers, finance, grading, incidents, integrations, onboarding, promotions, providers, recovery, reports, responsible-gaming, results, risk, roles, security, settings, settlements, support, trading, wagers |
| Brand | Customer-facing sportsbook brand: name, domain, logo, hue, terms reference. | name, domain, defaultLocale, defaultTimezone, supportedLocales, designTokens, termsReference, logoIcon, logoCo | status: ACTIVE → INACTIVE | — | Merchant (onboarding, Settings) | configuration, customers, onboarding, responsible-gaming, settings |
| BrandLocale | Per-locale terms revision and timezone the customer accepts at registration. | locale, language, timezone, termsVersion, termsContentHash, default | status: DRAFT → ACTIVE → RETIRED | Brand | Merchant (configuration) | configuration |
| LegalEntity | Licensed company that books wagers. | name, countryCode, registrationReference | status: PENDING → ACTIVE → SUSPENDED → CLOSED | — | Merchant (jurisdictions) | configuration |
| Jurisdiction | Regulatory jurisdiction catalogue (code, authority). | code, authority | status: PENDING → ACTIVE → INACTIVE | — | System seed / onboarding | configuration, finance, onboarding, settings |
| OperatorJurisdiction | The operator licence in a jurisdiction, with policy version. | licenseReference, policyVersion, effectiveFrom, effectiveTo | status: PENDING → ACTIVE → SUSPENDED | Jurisdiction | Merchant (onboarding, jurisdictions) | configuration, onboarding, settings |
| JurisdictionPolicyVersion | Approved policy document per jurisdiction. | version, authorityCitation, policyDocument, effectiveFrom, effectiveTo, approvedBy, approvedAt, evidenceHash | status: DRAFT → APPROVED → ACTIVE → RETIRED | Jurisdiction | Merchant (jurisdictions, approval) | configuration |
| OperatorChannel | Sales channel (web, mobile, retail, PAM) bound to entity, licence and brand. | key, capabilities | type: WEB, MOBILE_WEB, NATIVE, RETAIL, PAM; status: PENDING → ACTIVE → SUSPENDED | LegalEntity, OperatorJurisdiction, Brand | Merchant (configuration) | configuration |
| CurrencyDefinition | ISO currency with minor-unit exponent. | code, exponent, name | status: ACTIVE → INACTIVE | — | System seed | configuration (via TenantCurrency) |
| TenantCurrency | Which currencies the operator wagers, deposits and withdraws in. | depositsEnabled, withdrawalsEnabled, wageringEnabled, defaultForBrand | status: PENDING → ACTIVE → SUSPENDED | CurrencyDefinition | Merchant (configuration) | configuration, responsible-gaming, risk |
| OnboardingProgress | Per-stage evidence of operator setup. | stage, evidenceHash, completedAt, details | status: PENDING → COMPLETE → BLOCKED | — | System (onboarding mutation) | onboarding |

## Catalog

| List | Purpose | Key fields | States | Relations | Created by | Platform page (before this pass) |
|---|---|---|---|---|---|---|
| Region | Geographic grouping for competitions. | key, name, countryCodes | status: ACTIVE → INACTIVE | — | Merchant (catalog reference) | MISSING |
| Sport | Sport (football, basketball…). | key, name, active | — | — | Merchant (Catalog) | audit, catalog, configuration, grading, integrations, onboarding, recovery, reports, results, risk, settings, settlements, wagers |
| Competition | League or tournament within a sport. | key, name, timezone | status: ACTIVE → INACTIVE | Sport, Region | Merchant (Catalog) | catalog, onboarding |
| Season | Season of a competition. | key, name, startsAt, endsAt | status: SCHEDULED → ACTIVE → COMPLETE → CANCELLED | Competition | Merchant (Catalog) | catalog |
| CompetitionStage | Stage within a season (group, knockout…). | key, name, sortOrder | status: SCHEDULED → ACTIVE → COMPLETE | Season | Merchant (Catalog) | MISSING |
| Venue | Where an event is played. | key, name, countryCode, timezone, address | status: ACTIVE → INACTIVE | — | Merchant (Catalog) | catalog |
| Competitor | Team or player that takes part in events. | key, name | status: ACTIVE → INACTIVE | — | Merchant (Catalog) | catalog |
| Event | A fixture: start, live phase, official result status. | externalKey, name, startAt, livePhase, clockSeconds, version | status: SCHEDULED → LIVE → ENDED → CANCELLED → SUSPENDED; officialResultStatus: NONE, PROVISIONAL, APPROVED, DISPUTED | Competition, Season, CompetitionStage, Venue | Merchant (Catalog) / provider feed | audit, catalog, grading, integrations, onboarding, recovery, reports, results, risk, security, settlements, support, trading, wagers |
| EventParticipant | Competitor in an event with role (home/away). | role, sortOrder | — | Event, Competitor | Merchant (Catalog) | catalog |
| EventScheduleChange | History of event start-time changes. | fromStartAt, toStartAt, reasonCode, source, evidenceHash | — | Event | System (reschedule mutation) | MISSING |
| MarketDefinition | Market type template (match result, totals…). | key, name, sportKey, parametersSchema, gradingRuleFamily, allowedPhases, version | status: DRAFT → ACTIVE → RETIRED | — | System seed / configuration | catalog, configuration |

## Configuration

| List | Purpose | Key fields | States | Relations | Created by | Platform page (before this pass) |
|---|---|---|---|---|---|---|
| ConfigDefinition | Typed, scoped setting definition with merge strategy. | key, allowedScopes, validationSchema, secret, description | valueType: STRING, INTEGER, MONEY, BOOLEAN, JSON; mergeStrategy: REPLACE, MIN, MAX, UNION, DENY_WINS | — | System seed | configuration, settings |
| ConfigValue | Effective setting value per scope and policy version. | key, value, valueType, scopeType, policyVersion, effectiveFrom, effectiveTo | — | — | Merchant (Settings, dual control) | configuration, onboarding |
| FeatureFlag | Scoped feature switch with safe default. | key, description, enabled, safeDefault, expiresAt | scopeType: TENANT, BRAND, JURISDICTION, CHANNEL | ApprovalRequest | Merchant (configuration, approval) | configuration |
| HouseRuleVersion | Grading and settlement house rules per sport/market. | name, version, sportKey, marketDefinitionKey, rules, semanticHash, effectiveFrom, effectiveTo | status: DRAFT → APPROVED → ACTIVE → RETIRED | ApprovalRequest | Merchant (configuration, approval) | configuration |
| TaxRuleVersion | Tax basis and rate per jurisdiction. | key, version, rateNumerator, rateDenominator, roundingRule, effectiveFrom, effectiveTo, evidenceHash | basis: STAKE, WINNINGS, GGR, PLAYER_WITHHOLDING, PROMOTION; status: DRAFT → ACTIVE → RETIRED | Jurisdiction | Merchant (configuration) | configuration |
| RetentionPolicyVersion | Retention and deletion policy per record class. | recordClass, version, retentionDays, archiveDays, legalHoldWins, effectiveFrom, effectiveTo, evidenceHash | deletionMode: DELETE, TOKENIZE, CRYPTO_SHRED, PRESERVE; status: DRAFT → ACTIVE → RETIRED | Jurisdiction | Merchant (configuration) | configuration, reports |

## Risk

| List | Purpose | Key fields | States | Relations | Created by | Platform page (before this pass) |
|---|---|---|---|---|---|---|
| LimitProfile | Versioned set of stake/payout/liability limits. | name, version, effectiveFrom, effectiveTo | status: DRAFT → ACTIVE → RETIRED | — | Merchant (onboarding, Risk) | onboarding, risk |
| LimitRule | One limit in a profile, by scope and currency. | scopeType, maxStakeMinor, maxPayoutMinor, maxLiabilityMinor, currency, priority | — | LimitProfile | Merchant (Risk) | risk |
| CorrelationGroup | Named group of correlated selections. | key, name, sportKey, version | status: DRAFT → ACTIVE → RETIRED | — | Merchant (Risk) | risk |
| CorrelationRule | Allow/deny rule for combining selections. | leftPattern, rightPattern, reasonCode, priority | decision: ALLOW, DENY, PROVIDER_PRICE_REQUIRED | CorrelationGroup | Merchant (Risk) | risk |
| ExposurePosition | Projected stake and liability per scope. | scopeType, currency, stakeMinor, liabilityMinor, version, asOf | — | — | System (wager acceptance) | (control room), risk |
| WagerExposureAllocation | One wager's share of market exposure, released on settlement/cash-out. | stakeMinor, liabilityMinor, remainingStakeMinor, remainingLiabilityMinor, version | status: OPEN → PARTIALLY_CLOSED → CLOSED | Wager, Market | System (acceptance, settlement) | MISSING |

## Access

| List | Purpose | Key fields | States | Relations | Created by | Platform page (before this pass) |
|---|---|---|---|---|---|---|
| Team | Operator staff team used to scope role grants. | name | status: ACTIVE → INACTIVE | — | Merchant (roles) — no writer yet | roles (no writer) |
| User | Operator staff account with MFA. | name, email, passwordResetToken, passwordResetIssuedAt, passwordResetRedeemedAt, operatorMfaEnabled, operatorM | — | Role | Merchant (init, Roles) | approvals, onboarding, results, roles, security, settlements, support, trading |
| Role | Capability set for staff. | name, canSeeOtherPeople, canEditOtherPeople, canManagePeople, canManageRoles, canAccessDashboard, canManageOnb | — | — | Merchant (Roles, approval) | approvals, catalog, customers, finance, incidents, integrations, onboarding, recovery, reports, responsible-gaming, results, roles, security, settings, settlements, support, wagers |
| RoleGrant | Role grant to a user (optionally team-scoped). | scope, effectiveFrom, effectiveTo | status: ACTIVE → REVOKED | User, Role, Team | Merchant (Roles, approval) | roles |

## Trading

| List | Purpose | Key fields | States | Relations | Created by | Platform page (before this pass) |
|---|---|---|---|---|---|---|
| Market | A bettable market on an event; trading state and version. | definitionKey, parameters, line, marginBasisPoints, cashOutEnabled, version | tradingMode: PREMATCH, LIVE; status: OPEN → SUSPENDED → CLOSED → GRADED | Event, MarketDefinition | Merchant (Catalog) | (control room), catalog, configuration, grading, results, risk, trading, wagers |
| Selection | An outcome in a market. | key, label | status: OPEN → SUSPENDED → CLOSED | Market | Merchant (Catalog) | catalog, customers, grading, results, trading, wagers |
| PriceSnapshot | Append-only price per selection, with provenance. | decimalOdds, line, sequence, effectiveAt, receivedAt | status: OPEN → SUSPENDED | Selection, ProviderConnection, RawEnvelope | Trader (Set prices) / provider feed | catalog, integrations, trading |
| TradingStatusChange | Audit of market/event state transitions. | scopeType, fromStatus, toStatus, reason, source, effectiveAt | — | — | System (state mutations) | trading |
| TraderOverride | Temporary price/line/limit override, approval-gated. | targetType, value, reasonCode, startsAt, expiresAt | overrideType: PRICE, LINE, STATUS, MAX_STAKE, MAX_PAYOUT, MAX_LIABILITY, CASH_OUT; status: PENDING → ACTIVE → EXPIRED → REVOKED | ApprovalRequest | Trader (Trading, approval) | trading |
| FeedHealthSnapshot | Feed heartbeat, lag and gap status. | scopeType, heartbeatAt, lagMs, lastSequence, gapFrom, gapTo, checkedAt, actionTaken | status: HEALTHY → DEGRADED → STALE → GAPPED → DOWN | ProviderConnection | System (provider worker) | trading |

## Wagering

| List | Purpose | Key fields | States | Relations | Created by | Platform page (before this pass) |
|---|---|---|---|---|---|---|
| BetSlip | Customer draft slip before quoting. | currency, expiresAt, version | status: OPEN → QUOTED → EXPIRED → ACCEPTED | Player | Customer (storefront) | storefront only |
| BetSlipItem | Selection on a draft slip. | requestedOdds, line | — | BetSlip, Selection, PriceSnapshot | Customer (storefront) | storefront only |
| Quote | Server-issued price contract with expiry. | legCount, partCount, stakeMinor, potentialReturnMinor, currency, decimalOdds, liveDelayMs, expiresAt, termsHas | structure: STRAIGHT, PARLAY, SYSTEM, ROUND_ROBIN, TEASER, EACH_WAY; priceChangeConsent: EXACT, ACCEPT_BETTER, ACCEPT_WITHIN_TOLERANCE | Player, Selection, PriceSnapshot, Promotion | System (customer quote) | wagers |
| CustomerQuoteTerms | Immutable terms snapshot of a quote. | quoteKey, legCount, partCount, partPlan, priceChangeConsent, liveDelayMs, bonusEconomics, eventName, marketNam | structure: STRAIGHT, PARLAY, SYSTEM, ROUND_ROBIN, TEASER, EACH_WAY | Player, Quote | System (customer quote) | wagers |
| CustomerQuoteLegTerms | Per-leg immutable terms of a quote. | quoteKey, legIndex, eventName, marketName, selectionName, decimalOdds, line, correlationGroupKey, ruleVersion, | live: PREMATCH, LIVE | Player, Quote | System (customer quote) | wagers |
| AcceptanceDecision | Gate results for accepting or rejecting a wager. | accepted, rejectionCode, gateResults, inputHash | — | Wager, Quote | System (placement) | wagers |
| Wager | Accepted (or rejected) bet receipt. | version, idempotencyKey, stakeMinor, potentialReturnMinor, maxPayoutMinor, currency, termsHash, liveDelayMs, r | structure: STRAIGHT, PARLAY, SYSTEM, ROUND_ROBIN, TEASER, EACH_WAY; priceChangeConsent: EXACT, ACCEPT_BETTER, ACCEPT_WITHIN_TOLERANCE; status: PENDING → DELAYED → ACCEPTED → REJECT | Player, Quote, LegalEntity, OperatorJurisdiction, Brand, OperatorChannel, Promotion, BonusAward | Customer (storefront placement) | (control room), configuration, customers, finance, grading, integrations, promotions, responsible-gaming, settlements, support, wagers |
| WagerLeg | One leg of a wager. | legIndex, eventKey, marketKey, selectionKey, decimalOdds, line, ruleVersion, correlationGroupKey, live | — | Wager, WagerPart | System (placement) | settlements, wagers |
| WagerPart | One combination part of a multi-leg wager. | partIndex, combinationKey, stakeMinor, decimalOdds, potentialReturnMinor, gradeSummary | status: OPEN → GRADED → SETTLED → CASHED_OUT → VOID | Wager, Settlement | System (placement) | settlements, wagers |
| WagerStatusEvent | Wager status transitions. | fromStatus, toStatus, reasonCode, effectiveAt | — | Wager | No writer yet | wagers/[id] (no writer) |
| CashOutOffer | Priced cash-out offer for an open wager. | amountMinor, currency, portionNumerator, portionDenominator, feeMinor, marginBasisPoints, valuationInputs, val | status: OPEN → ACCEPTED → EXPIRED → WITHDRAWN | Wager | System (customer cash-out quote) | MISSING |
| CashOutAcceptance | Accepted cash-out, posted to the ledger. | amountMinor, currency, portionNumerator, portionDenominator, wagerVersion, acceptedAt, idempotencyKey, evidenc | status: ACCEPTED → REVERSED | CashOutOffer, Wager, Player, JournalTransaction, CashOutAcceptance | Customer (storefront) | finance, settlements, wagers |

## Results

| List | Purpose | Key fields | States | Relations | Created by | Platform page (before this pass) |
|---|---|---|---|---|---|---|
| ResultVersion | Entered official result, pending independent approval. | version, payload, payloadHash, approvedAt | status: PENDING → APPROVED → REJECTED → SUPERSEDED | Event, ProviderConnection | Trader (Results) | (control room), catalog, grading, integrations, results, settlements |
| MarketGrade | Grade of a market from an approved result. | ruleVersion, outcome, factorNumerator, factorDenominator, trace, inputHash | — | Market, ResultVersion | Merchant (Grading) | grading |
| LegGrade | Grade of a wager leg. | outcome, factorNumerator, factorDenominator, inputHash | — | WagerLeg, MarketGrade | System (grading) | grading, wagers |

## Settlement

| List | Purpose | Key fields | States | Relations | Created by | Platform page (before this pass) |
|---|---|---|---|---|---|---|
| SettlementRun | A settlement batch triggered by a result or correction. | inputHash, wagersConsidered, wagersSettled, startedAt, completedAt, errorSummary | triggerType: RESULT_APPROVED, CORRECTION, MANUAL_REPLAY; status: PENDING → RUNNING → COMPLETED → FAILED | ResultVersion | System / Merchant (Settlement) | MISSING |
| Settlement | Versioned settlement of a wager with payout and journal. | version, grossPayoutMinor, taxMinor, payoutMinor, inputHash | outcome: WIN, LOSS, PUSH, VOID, DEAD_HEAT, PARTIAL | Wager, ResultVersion, SettlementRun, JournalTransaction, Settlement | Merchant (Settlement) | finance, settlements, wagers |
| SettlementLine | Money line within a settlement (stake return, profit, tax…). | amountMinor, unroundedValue, scale, roundingRule, residualMinor, trace | lineType: STAKE_RETURN, PROFIT, LOSS, VOID, PUSH, DEAD_HEAT, TAX, ROUNDING | Settlement, WagerPart, WagerLeg | System (settlement) | settlements |
| ResettlementCase | Approval-gated correction of a settled wager. | reason | status: PENDING → APPROVED → COMPLETED → REJECTED | Wager, Settlement, ResultVersion, ApprovalRequest | No writer yet (corrections use Settlement versions) | settlements (no writer; corrections use Settlement versions) |

## Finance

| List | Purpose | Key fields | States | Relations | Created by | Platform page (before this pass) |
|---|---|---|---|---|---|---|
| TaxAssessment | Tax assessed on a settled wager, posted to the ledger. | ruleVersion, basisMinor, amountMinor, currency | status: CALCULATED → POSTED → REVERSED | Wager | Merchant (Finance) | MISSING |
| LedgerAccount | Double-entry account (player wallet, house, tax…). | key, currency | accountClass: ASSET, LIABILITY, REVENUE, EXPENSE, EQUITY; status: ACTIVE → FROZEN → CLOSED | Player | System (onboarding, registration) | customers, finance |
| JournalTransaction | Balanced posting of journal entries. | type, idempotencyKey, effectiveAt | status: POSTED → REVERSED | JournalTransaction | System (all money movements) | finance, settlements |
| JournalEntry | Debit/credit line of a journal transaction. | amountMinor, currency | side: DEBIT, CREDIT | JournalTransaction, LedgerAccount | System | finance, settlements |
| BalanceProjection | Posted/pending/available balance per account. | postedMinor, pendingMinor, availableMinor, version, asOf | — | LedgerAccount | System | customers |
| Hold | Reserved funds (stake, withdrawal). | purposeType, amountMinor, expiresAt, version | status: ACTIVE → CAPTURED → RELEASED → EXPIRED | LedgerAccount | System | reports, settlements |
| PaymentIntent | Deposit, withdrawal, refund or chargeback. | amountMinor, feeMinor, currency, idempotencyKey, paymentMethodReference, providerSessionReference, riskEvidenc | type: DEPOSIT, WITHDRAWAL, REFUND, CHARGEBACK, ADJUSTMENT; status: PENDING → REVIEW → PROCESSING → SUCCEEDED → FAILED → UNKNOWN → CANCELLED | Player, ProviderConnection, Hold | Customer (wallet) / Merchant (Finance) | customers, finance, support |
| PaymentAttempt | Provider attempt for a payment intent. | attempt, externalReference, reasonCode | status: PENDING → SUCCEEDED → FAILED → UNKNOWN | PaymentIntent, RawEnvelope | System (payment adapter) | finance |
| LedgerAdjustmentRequest | Manual ledger adjustment, approval-gated. | amountMinor, currency, reasonCode, evidence | direction: DEBIT, CREDIT; status: PENDING → APPROVED → POSTED → REJECTED | Player, LedgerAccount, ApprovalRequest, JournalTransaction | Merchant (Finance, approval) | finance |
| ReconciliationRun | Ledger vs provider/bank comparison over a window. | type, windowFrom, windowTo, inputHash, differenceMinor | status: PENDING → RUNNING → COMPLETED → FAILED | — | Merchant (Reconciliation) | finance |
| ReconciliationItem | One matched or open difference in a run. | internalReference, providerReference, differenceMinor, currency | status: MATCHED → OPEN → RESOLVED | ReconciliationRun, JournalTransaction | System (reconciliation) | (control room), finance |
| SafeguardingAccount | Protected player-funds account. | accountReference, currency, disclosureVersion | classification: NOT_PROTECTED, MEDIUM_PROTECTION, HIGH_PROTECTION, TRUST; status: ACTIVE → SUSPENDED → CLOSED | LegalEntity, ProviderConnection | Merchant (Reconciliation) | finance |
| SafeguardingReconciliation | Safeguarded assets vs player liability check. | asOf, safeguardedAssetMinor, playerLiabilityMinor, differenceMinor, evidenceHash | status: MATCHED → SHORTFALL → SURPLUS → RESOLVED | SafeguardingAccount, ReconciliationRun | Merchant (Reconciliation) | finance |

## Customers

| List | Purpose | Key fields | States | Relations | Created by | Platform page (before this pass) |
|---|---|---|---|---|---|---|
| Player | Customer account: status, KYC, risk band, preferences. | subject, locale, timezone, marketingAllowed | status: PENDING → ACTIVE → SUSPENDED → CLOSED; kycStatus: REQUIRED, PENDING, APPROVED, REJECTED; preferredOddsFormat: DECIMAL, AMERICAN, FRACTIONAL; riskBand: LOW, MEDIUM, HIGH | Brand | Customer (registration) | (control room), compliance, customers, finance, responsible-gaming, risk, settlements, support, wagers |
| PlayerIdentity | Encrypted identity payload (restricted PII). | encryptedPayload, tokenizedIdentifiers, encryptionKeyRef | classification: RESTRICTED_PII | Player | Customer (verification) | restricted PII (no page) |
| CustomerCredential | Password credential with lockout. | emailDigest, emailMasked, passwordHash, passwordVersion, failedAttempts, lockedUntil, verifiedAt, lastAuthenti | status: PENDING_VERIFICATION → ACTIVE → LOCKED → CLOSED | Player | Customer (registration) | customers/[id] (status only) |
| CustomerSession | Signed-in customer session. | tokenDigest, expiresAt, deviceDigest, lastSeenAt, revokedAt | assuranceLevel: GUEST, PASSWORD, MFA | Player | Customer (sign-in) | MISSING |
| CustomerDevice | Device seen for a customer session. | deviceDigest, label, firstSeenAt, lastSeenAt, revokedAt, riskSignals | — | Player, CustomerSession | Customer (sign-in) | MISSING |
| CustomerRecoveryToken | One-time recovery/reset token. | tokenDigest, expiresAt, consumedAt, attempts | purpose: VERIFY_EMAIL, RESET_PASSWORD, RECOVER_ACCOUNT | Player | Customer (recovery) | system (no page) |
| CustomerCommand | Idempotency record for customer commands. | commandKey, idempotencyKey, requestHash, result | type: WAGER, FUND, LIMIT, EXCLUSION, AUTH, CASH_OUT, PROMOTION, DISPUTE, PROFILE, PRIVACY; status: IN_PROGRESS → SUCCEEDED → REJECTED | Player | System | system (no page) |
| CustomerFavorite | Saved favourite event/competition. | createdByDevice | targetType: SPORT, COMPETITION, EVENT, COMPETITOR | Player | Customer (storefront) | storefront only (favourites view) |
| Consent | Terms, privacy and marketing consent with policy version. | type, policyVersion, givenAt, withdrawnAt, evidenceHash | — | Player | Customer (registration, profile) | MISSING |
| PlayerStatement | Customer statement for a period. | periodStart, periodEnd, openingMinor, closingMinor, currency, journalHash, artifactReference | status: GENERATING → READY → FAILED | Player | Customer (wallet) | MISSING |
| AccountClosure | Customer account closure request with blockers. | requestedBy, reasonCode, requestedAt, coolingEndsAt, completedAt, evidenceHash | status: REQUESTED → REVIEW → BLOCKED_FUNDS → CLOSED → CANCELLED | Player | Customer (security) | MISSING |
| AffiliateAttribution | Affiliate/campaign attribution of a player. | affiliateReference, campaignReference, clickReference, attributedAt, evidenceHash | status: PENDING → ATTRIBUTED → REJECTED → REVERSED | Player | No writer yet | MISSING (no writer) |
| PamSubjectMapping | Mapping to an external player-account system. | externalSubjectDigest, evidenceHash | walletMode: OPENFRONT, PAM, TRANSFER; status: ACTIVE → SUSPENDED → REVOKED | ProviderConnection, Player | System (PAM adapter) | system (no page) |
| Notification | Outbound message to a player or operator (email, SMS…). | templateKey, templateVersion, locale, payload, consentEvidenceHash, externalReference, sentAt | channel: EMAIL, SMS, PUSH, IN_APP, WEBHOOK; status: PENDING → SENT → DELIVERED → FAILED → SUPPRESSED | Player, User, ProviderConnection | System | MISSING |

## Compliance

| List | Purpose | Key fields | States | Relations | Created by | Platform page (before this pass) |
|---|---|---|---|---|---|---|
| VerificationCase | KYC/age/address verification case. | evidenceReference, expiresAt | type: KYC, AGE, ADDRESS; status: PENDING → APPROVED → REJECTED → EXPIRED | Player, ProviderConnection | Customer (profile) / Merchant (Compliance) | compliance, customers |
| VerificationCheck | Provider attempt within a verification case. | attempt, reasonCode | decision: PENDING, PASS, FAIL, REVIEW | VerificationCase, RawEnvelope | System (verification adapter) | MISSING |
| GeoSession | Location session for a player. | sessionKey, expiresAt | status: ACTIVE → EXPIRED → REVOKED | Player | System (geo adapter) | compliance, customers |
| GeoCheck | Location decision. | reasonCode, coarseEvidence, checkedAt | decision: ALLOW, DENY, UNKNOWN | GeoSession, ProviderConnection | System (geo adapter) | compliance, customers |
| AMLCase | Anti-money-laundering case and risk band. | restrictedEvidence | status: OPEN → REVIEW → CLOSED; riskBand: LOW, MEDIUM, HIGH | Player | Merchant (Compliance) | compliance, customers |
| ScreeningHit | Sanctions/PEP screening hit on an AML case. | matchToken, dispositionReason, evidenceReference, screenedAt, resolvedAt | screeningType: SANCTIONS, PEP, ADVERSE_MEDIA, SOURCE_OF_FUNDS; status: POTENTIAL → REVIEW → CONFIRMED → CLEARED → FALSE_POSITIVE | AMLCase, ProviderConnection | System / Merchant (Compliance) | compliance |
| AffordabilityAssessment | Affordability decision (allow/restrict/review). | source, evidenceReference, assessedAt, expiresAt, reasonCode | riskBand: LOW, MEDIUM, HIGH, PROHIBITED; decision: ALLOW, RESTRICT, REVIEW | Player | Merchant (Compliance) | compliance |
| IntegrityCase | Suspicious betting / integrity investigation. | restrictedEvidence, reportedAt, closedAt | type: SUSPICIOUS_BETTING, COLLUSION, INSIDER, RESULT_DISAGREEMENT, PROHIBITED_PARTICIPANT; status: OPEN → INVESTIGATING → REPORTED → CLEARED → CLOSED; severity: LOW, MEDIUM, HIGH,  | Player, Event, Wager, ProviderConnection | Merchant (Compliance) | compliance |
| CustomerPrivacyRequest | Data subject request (access, delete…). | requestedAt, dueAt, completedAt, identityEvidenceHash, artifactReference, decisionReason | type: ACCESS, EXPORT, CORRECT, DELETE, RESTRICT, PORTABILITY; status: OPEN → VERIFYING → IN_PROGRESS → COMPLETED → DENIED | Player | Customer (profile) | compliance |

## Responsible gaming

| List | Purpose | Key fields | States | Relations | Created by | Platform page (before this pass) |
|---|---|---|---|---|---|---|
| AccountRestriction | Capability restriction on a player. | capability, reasonCode, startsAt, endsAt | status: ACTIVE → EXPIRED → REVOKED | Player | Merchant (Customers, RG) | compliance, customers, responsible-gaming |
| PlayerLimit | Deposit/stake/loss/session limit. | amountMinor, currency, effectiveFrom, effectiveTo | type: DEPOSIT, STAKE, LOSS, SESSION; period: DAILY, WEEKLY, MONTHLY | Player | Customer (limits) / Merchant (RG) | responsible-gaming |
| SelfExclusion | Break or self-exclusion. | scope, startsAt, endsAt, source | status: ACTIVE → EXPIRED → REVOKED | Player | Customer (safer play) / Merchant (RG) | responsible-gaming |

## Support

| List | Purpose | Key fields | States | Relations | Created by | Platform page (before this pass) |
|---|---|---|---|---|---|---|
| SupportCase | Customer support case with SLA. | subject, openedAt, resolvedAt, slaDueAt | category: ACCOUNT, WAGER, PAYMENT, RESPONSIBLE_GAMING, PRIVACY, TECHNICAL; priority: LOW, NORMAL, HIGH, URGENT; status: OPEN → TRIAGED → WAITING_CUSTOMER → WAITING_OPERATOR → RESOL | Player, Wager, PaymentIntent, Dispute | Customer (support) / Merchant (Support) | support |
| SupportCaseEvent | Message or note on a support case. | body, evidenceHash | type: OPENED, NOTE, CUSTOMER_MESSAGE, OPERATOR_MESSAGE, ESCALATED, LINKED, RESOLVED, REOPENED; actorType: PLAYER, STAFF, SYSTEM, PROVIDER; visibility: CUSTOMER, INTERNAL, RESTRICTE | SupportCase | Customer / Merchant | support |
| Dispute | Bet dispute and its resolution. | category, evidence, resolution, resolvedAt | status: OPEN → TRIAGED → INVESTIGATING → PROPOSED_RESOLUTION → RESOLVED → REJECTED → APPEALED | Player, Wager, ApprovalRequest | Customer (support) / Merchant (Support) | support, wagers |
| DisputeEvent | Timeline of a dispute. | type, evidenceHash, details | — | Dispute | System (dispute mutations) | MISSING |

## Promotions

| List | Purpose | Key fields | States | Relations | Created by | Platform page (before this pass) |
|---|---|---|---|---|---|---|
| Promotion | Campaign: type, window, budget, terms. | key, name, description, startsAt, endsAt, budgetMinor, currency, termsVersion, termsHash | type: FREE_BET, ODDS_BOOST, DEPOSIT_MATCH, CASHBACK; status: DRAFT → SCHEDULED → ACTIVE → PAUSED → ENDED | Jurisdiction, Brand, ApprovalRequest | Merchant (Promotions, approval) | promotions |
| PromotionRuleVersion | Eligibility and economics of a campaign version. | version, eligibility, economics, wageringRequirements, abuseControls, contributionRules, effectiveFrom, effect | status: DRAFT → ACTIVE → RETIRED | Promotion | Merchant (Promotions) | MISSING |
| CampaignBudget | Allocated/awarded/redeemed budget. | allocatedMinor, awardedMinor, redeemedMinor, forfeitedMinor, currency, version | status: ACTIVE → EXHAUSTED → CLOSED | Promotion | System (promotions) | promotions |
| PromotionRedemption | A player's claim of a campaign. | reasonCode, idempotencyKey, evidenceHash, redeemedAt | status: ELIGIBLE → CLAIMED → REJECTED → REVERSED | Promotion, PromotionRuleVersion, Player, BonusAward | Customer (promotions) | promotions |
| BonusAward | Restricted value awarded to a player. | amountMinor, remainingMinor, currency, stakeReturned, awardedAt, activatedAt, expiresAt, idempotencyKey, evide | awardType: FREE_BET, BONUS_CASH, ODDS_BOOST; status: AWARDED → ACTIVE → CONSUMED → CONVERTED → EXPIRED → FORFEITED | Promotion, PromotionRuleVersion, Player | System (claim) | promotions |
| BonusTransaction | Award/consume/expire movement of a bonus. | amountMinor, remainingMinor, currency, idempotencyKey, evidenceHash | type: AWARD, ACTIVATE, RESERVE, CONSUME, RELEASE, CONVERT, EXPIRE, FORFEIT, REVERSE | BonusAward, Wager, JournalTransaction | System | MISSING |

## Integrations

| List | Purpose | Key fields | States | Relations | Created by | Platform page (before this pass) |
|---|---|---|---|---|---|---|
| ProviderConnection | Installed provider adapter with certification. | adapterVersion, configReference, secretReference, dataResidencyRegion, failoverPriority, capabilities | certificationStatus: SANDBOX, PENDING, CERTIFIED, SUSPENDED; status: ACTIVE → DEGRADED → DISABLED | LegalEntity, Jurisdiction | Merchant (onboarding, Providers) | catalog, integrations, onboarding, providers |
| ProviderHealthSample | Provider health probe sample. | capability, latencyMs, errorRateBasisPoints, sequenceLag, oldestWebhookAgeMs, reconciliationDifferenceMinor, c | status: HEALTHY → DEGRADED → DOWN | ProviderConnection | System | providers |
| ProviderEntityMapping | Provider entity to canonical mapping review. | entityType, canonicalType, confidence | status: PENDING → APPROVED → REJECTED | ProviderConnection | System / Merchant (Integrations) | catalog, integrations |
| AdapterCertificationRun | Conformance suite run for an adapter. | adapterVersion, suiteVersion, scenarios, passed, failed, inputHash, artifactReference, startedAt, completedAt | status: PENDING → RUNNING → PASSED → FAILED | ProviderConnection | Merchant (Providers) | providers |
| TradingReplayRun | Deterministic replay comparison of a feed. | scopeType, frontier, adapterVersion, normalizerVersion, ruleVersion, inputHash, outputHash, comparison, dryRun | status: PENDING → RUNNING → MATCHED → DIFFERENT → FAILED | ProviderConnection | Merchant (Providers) | providers |
| RawEnvelope | Raw inbound/outbound provider message. | schemaVersion, installationRevision, payload, payloadHash, receivedAt | direction: INBOUND, OUTBOUND | ProviderConnection | System | integrations |
| InboxMessage | Inbound processing queue item. | messageKey, type, attempts, availableAt, leaseUntil, leaseOwner, lastError | status: PENDING → PROCESSING → COMPLETED → DEAD | RawEnvelope | System | integrations, recovery |
| OutboxMessage | Outbound event queue item. | aggregateType, eventType, payload, attempts, maxAttempts, availableAt, leaseUntil, leaseOwner, lastError | status: PENDING → PROCESSING → COMPLETED → DEAD | — | System | integrations, recovery, reports |
| WebhookEndpoint | Operator webhook destination, approval-gated. | name, url, secretReference, eventTypes, failureCount, disabledAt | status: PENDING → ACTIVE → DEGRADED → DISABLED | ApprovalRequest | Merchant (Webhooks, approval) | integrations |
| WebhookDelivery | One webhook delivery. | eventType, eventVersion, payloadHash, attempts, availableAt, deliveredAt, lastResponseCode, lastError | status: PENDING → PROCESSING → DELIVERED → FAILED → DEAD | WebhookEndpoint, OutboxMessage | System (worker) | integrations |
| IntegrationDeliveryAttempt | Attempt of a webhook delivery. | attempt, requestedAt, completedAt, responseCode, latencyMs, responseHash, errorClass | — | WebhookDelivery | System (worker) | MISSING |
| WebhookReplay | Replay-protection record for inbound webhooks. | messageHash, occurredAt, expiresAt | — | ProviderConnection | System | system (no page) |

## Operations

| List | Purpose | Key fields | States | Relations | Created by | Platform page (before this pass) |
|---|---|---|---|---|---|---|
| DeadLetter | Failed job awaiting replay. | sourceType, reason, attempts, payloadReference, resolvedAt | — | — | System | (control room), integrations, recovery |
| ScheduledJob | Scheduled background job. | scopeType, payload, dueAt, leaseUntil, leaseOwner, attempts, maxAttempts, idempotencyKey, lastError | type: RECONCILIATION, REPORT, NOTIFICATION, RETENTION, EXPIRY, PROVIDER_HEALTH, FEED_RECOVERY; status: SCHEDULED → PROCESSING → COMPLETED → FAILED → CANCELLED | — | System | integrations, recovery |
| WorkerHeartbeat | Worker liveness. | startedAt, heartbeatAt, stoppedAt, buildVersion | status: STARTING → READY → STOPPING → STOPPED | — | System (worker) | MISSING |
| Incident | Operational incident with severity. | title, evidence, resolvedAt | severity: SEV1, SEV2, SEV3, SEV4; status: OPEN → MITIGATING → RESOLVED | — | Merchant (Incidents) / System | (control room), finance, incidents |
| ApiRateBucket | Rate-limit counter. | keyHash, scope, windowStartedAt, count, expiresAt | — | — | System | system (no page) |

## Governance

| List | Purpose | Key fields | States | Relations | Created by | Platform page (before this pass) |
|---|---|---|---|---|---|---|
| AuditEvent | Hash-chained audit trail. | action, targetType, reason, payloadHash, previousHash, hash | — | — | System (every mutation) | audit |
| AuditAnchor | External anchor of the audit chain head. | chainHeadHash, eventCount, anchoredAt, externalReference | status: PENDING → ANCHORED → FAILED | — | System (worker) | MISSING |
| ApprovalRequest | Dual-control request and decision. | action, payloadHash, reason, decidedAt, requestPayload, expiresAt, consumedAt, consumedKey | status: PENDING → APPROVED → REJECTED → EXPIRED | — | Merchant (every sensitive flow) | approvals, configuration, finance, integrations, promotions, reports, results, roles, settings, settlements, support |
| DataCorrectionCase | Approval-gated data correction. | scopeType, reason, dryRunHash | status: PENDING → APPROVED → APPLIED → REJECTED | ApprovalRequest | No writer yet | MISSING (no writer) |
| LegalHold | Hold that blocks retention deletion. | scopeType, reason, startsAt, endsAt | status: ACTIVE → RELEASED | ApprovalRequest | No writer yet | MISSING (no writer) |
| AccessReview | Periodic access review. | scopeType, openedBy, findings, dueAt, completedAt | status: OPEN → IN_REVIEW → APPROVED → REMEDIATION → CLOSED | — | No writer yet | MISSING (no writer) |
| ComplianceReport | Regulatory report draft/submission. | type, periodStart, periodEnd, version, artifactHash, artifactReference, submittedAt | status: DRAFT → APPROVED → SUBMITTED | — | Merchant (Reports) | reports |
| ReportArtifact | Generated report file. | type, schemaVersion, rowCount, contentHash, storageReference, encryptionKeyReference, generatedAt, expiresAt | format: JSON, CSV, PDF, XML; status: READY → EXPIRED → REVOKED | ComplianceReport | System (reports) | reports |
| DataExport | Approval-gated data export. | requestedBy, scope, rowCount, contentHash, storageReference, expiresAt | type: AUDIT, WAGERS, FINANCE, CUSTOMERS, REGULATORY, PRIVACY; classification: INTERNAL, CONFIDENTIAL, RESTRICTED_PII, RESTRICTED_FINANCIAL, RESTRICTED_REGULATORY; status: PENDING → | ApprovalRequest | Merchant (Reports) | reports |
| RetentionExecution | Retention run with dry run and approval. | windowFrom, windowTo, candidateCount, heldCount, archivedCount, deletedCount, dryRunHash, artifactReference, c | status: DRY_RUN → PENDING_APPROVAL → APPROVED → COMPLETED → FAILED | RetentionPolicyVersion, ApprovalRequest | Merchant (Reports) | reports |

## Starter

| List | Purpose | Key fields | States | Relations | Created by | Platform page (before this pass) |
|---|---|---|---|---|---|---|
| RetainedStarterTodo | Starter template example list (unused by the sportsbook). | label, description | — | — | None | starter leftover (no page) |
| RetainedStarterTodoImage | Starter template example (unused). | image_id, image_filesize, image_width, image_height, image_extension, imagePath, altText, metadata | — | — | None | starter leftover (no page) |
| RetainedStarterTodoImageLink | Starter template example (unused). | — | — | RetainedStarterTodo, RetainedStarterTodoImage | None | starter leftover (no page) |

## Merchant workflows end to end

1. **Set up the operator.** Tenant → Brand → BrandLocale (terms) → LegalEntity → OperatorJurisdiction → OperatorChannel → TenantCurrency → ProviderConnection (adapters) → LimitProfile → ConfigValue → OnboardingProgress. Pages: Onboarding, Configuration, Jurisdictions, Settings, Providers.
2. **Build the catalog.** Sport → Competition (Region) → Season → CompetitionStage → Venue → Competitor → Event (EventParticipant, EventScheduleChange) → Market (MarketDefinition) → Selection. Pages: Catalog, Catalog reference *(new)*, Event detail *(rebuilt)*.
3. **Price and trade.** PriceSnapshot (trader Set prices or feed) → Market first open → TradingStatusChange (suspend/close) → TraderOverride (approval) → FeedHealthSnapshot. Pages: Trading, Market detail.
4. **Take bets (customer).** BetSlip → Quote (CustomerQuoteTerms, CustomerQuoteLegTerms) → AcceptanceDecision → Wager (WagerLeg, WagerPart) → Hold → JournalTransaction → ExposurePosition, WagerExposureAllocation. Storefront board, bet slip, My bets; platform Wagers and Wager detail *(rebuilt)*, Risk.
5. **Manage risk.** LimitProfile → LimitRule, CorrelationGroup → CorrelationRule, ExposurePosition. Page: Risk.
6. **Result, grade and settle.** ResultVersion → ApprovalRequest (independent approver) → MarketGrade → LegGrade → SettlementRun → Settlement → SettlementLine → JournalTransaction → TaxAssessment. Pages: Results, Approvals, Grading, Settlement *(rebuilt: runs)*, Settlement detail, Tax *(new)*.
7. **Cash out (customer).** CashOutOffer → CashOutAcceptance → JournalTransaction. Storefront My bets; platform Wager detail *(rebuilt: offers)*.
8. **Move money.** PaymentIntent (deposit/withdrawal) → PaymentAttempt → Hold → JournalTransaction → BalanceProjection; LedgerAdjustmentRequest (approval); PlayerStatement. Pages: Finance, payment/journal/adjustment detail, Customer detail *(rebuilt: statements)*.
9. **Reconcile and safeguard.** ReconciliationRun → ReconciliationItem → resolution journal; SafeguardingAccount → SafeguardingReconciliation. Pages: Reconciliation, run/item/control detail.
10. **Know the customer.** Player → VerificationCase → VerificationCheck, GeoSession → GeoCheck, AMLCase → ScreeningHit, AffordabilityAssessment, IntegrityCase, Consent, CustomerPrivacyRequest. Pages: Customers, Customer detail *(rebuilt)*, Compliance.
11. **Protect the customer.** PlayerLimit, SelfExclusion, AccountRestriction, AccountClosure. Pages: Responsible gaming, Account closures *(new)*, Customer detail.
12. **Support and disputes.** SupportCase → SupportCaseEvent; Dispute → DisputeEvent; Notification. Pages: Support, Support case *(rebuilt: dispute timeline)*, Notifications *(new)*.
13. **Run promotions.** Promotion (approval) → PromotionRuleVersion → CampaignBudget → PromotionRedemption → BonusAward → BonusTransaction. Pages: Promotions, Promotion detail *(new)*.
14. **Integrate.** RawEnvelope → InboxMessage; OutboxMessage → WebhookDelivery → IntegrationDeliveryAttempt; WebhookEndpoint (approval); ProviderEntityMapping. Pages: Integrations, Inbox, Webhooks *(rebuilt: attempts)*, Dead letters.
15. **Operate.** ScheduledJob, DeadLetter, WorkerHeartbeat, Incident. Pages: Recovery *(rebuilt: workers)*, Incidents, Control room.
16. **Govern.** AuditEvent → AuditAnchor; ApprovalRequest; ComplianceReport → ReportArtifact; DataExport; RetentionPolicyVersion → RetentionExecution. Pages: Audit *(rebuilt: anchors)*, Approvals, Reports.
17. **Staff access.** User (MFA) → Role → RoleGrant. Pages: Roles, Operator security.

## Coverage table

Join tables, logs and system lists covered by a parent page name that parent. "Before" is the state at the start of this pass; "after" is this pass's commit.

| Workflow / list | Before | After |
|---|---|---|
| Catalog reference: Sport, Competition, Region, Season, CompetitionStage, Venue, Competitor | THIN: create forms only, no lists, no stage, no deactivate | `/platform/catalog/reference` (catalog slice): every list with status, type track, search, create forms (new `createCatalogStage`), activate/deactivate (`setCatalogReferenceStatus`). Region is shown on competitions but has no create form yet (`createCatalogCompetition` takes no region) |
| Event detail: EventParticipant, EventScheduleChange, Venue/Season/Stage | THIN: markets only | `/platform/events/[eventId]`: participants, schedule history, venue/season/stage |
| Wager detail: CashOutOffer, WagerExposureAllocation, TaxAssessment | THIN: no offers, exposure or tax | `/platform/wagers/[wagerId]`: offers, exposure allocations, tax |
| SettlementRun | MISSING | `/platform/settlements`: settlement runs with counts and errors |
| TaxAssessment | MISSING (assess form buried in Reconciliation) | `/platform/finance/tax` (finance slice): assessments by status/currency, totals, assess form |
| Customer detail: Consent, PlayerStatement, CustomerSession, CustomerDevice, AccountClosure, Notification, VerificationCheck | THIN | `/platform/customers/[playerId]`: all of these |
| AccountClosure queue | MISSING | `/platform/closures` (closures slice): status tabs, blockers, player links |
| Notification log | MISSING | `/platform/notifications` (notifications slice): channel/status filters, failed first |
| Dispute timeline: DisputeEvent | THIN | `/platform/support/[caseId]`: dispute event timeline |
| Promotion detail: PromotionRuleVersion, CampaignBudget, PromotionRedemption, BonusAward, BonusTransaction | MISSING (list page only) | `/platform/promotions/[promotionId]` |
| Webhook deliveries: IntegrationDeliveryAttempt | THIN | `/platform/integrations/webhooks`: attempts per delivery |
| WorkerHeartbeat | MISSING | `/platform/recovery`: workers |
| AuditAnchor | MISSING | `/platform/audit`: anchors |
| Team, AccessReview, AffiliateAttribution, DataCorrectionCase, LegalHold, ResettlementCase, WagerStatusEvent | MISSING | MISSING: no mutation or worker writes these lists, so there is no workflow to operate; a page would always be empty. Building them is new product scope (approval semantics, external inputs). |
| CustomerCommand, CustomerCredential, CustomerRecoveryToken, PlayerIdentity, PamSubjectMapping, ApiRateBucket, WebhookReplay, BetSlip, BetSlipItem, RetainedStarterTodo* | n/a | No page by design: idempotency/secret/PII/rate-limit/system records, storefront-only drafts, or unused starter lists |

## Customer (storefront) workflows

| Workflow | Lists | Storefront flow |
|---|---|---|
| Browse | Sport, Competition, Event, Market, Selection, PriceSnapshot | `/sports` index *(new)* → `/sports/[sport]` *(new)* → `/sports/[sport]/[competition]` → `/events/[event]`; board `/` with live/favourites views and search |
| Bet | BetSlip, Quote, CustomerQuoteTerms, Wager, AcceptanceDecision | bet slip (structure, stake, price-change consent, funding) → quote with countdown → place → receipt |
| History and cash-out | Wager, WagerLeg, WagerPart, CashOutOffer, CashOutAcceptance, Settlement | `/account/bets`: tickets, cash-out offer and accept, references |
| Account | Player, CustomerCredential, CustomerSession, CustomerDevice, Consent, CustomerPrivacyRequest, VerificationCase | `/account/auth` (create, sign in, recover), `/account/profile`, `/account/security` |
| Money | PaymentIntent, LedgerAccount, BalanceProjection, PlayerStatement, BonusAward | `/account/wallet`: deposit, withdraw, holds, bonus, statements, payments |
| Safer play | PlayerLimit, SelfExclusion, AccountRestriction, AccountClosure | `/account/limits`, `/account/responsible-play`, closure in `/account/security` |
| Promotions | Promotion, PromotionRedemption, BonusAward | `/promotions`, `/account/promotions`: claim |
| Support | SupportCase, SupportCaseEvent, Dispute | `/account/disputes`: request, dispute a bet, reply |

Customer flows run only while the customer API is open (see QA-004 in `audits/`); closed, every page shows the same closed state.
