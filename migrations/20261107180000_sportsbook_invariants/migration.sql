-- Round-2 invariants (2026-11-07). Live data had 0 violations of every rule below before it was added.
-- Each unique/check is named; features/keystone/lib/constraint-errors.ts maps the names to readable refusals.

-- Uniqueness the code already assumes (findFirst by key, then create; no index behind it).
-- Catalog keys: createCatalogSport/Competition check first, but two operators (or a retry) can both pass the check.
CREATE UNIQUE INDEX "Sport_tenant_key_uq" ON "Sport"("tenant", "key");
CREATE UNIQUE INDEX "Competition_sport_key_uq" ON "Competition"("tenant", "sport", "key");
-- createCatalogCompetitor has no check at all.
CREATE UNIQUE INDEX "Competitor_tenant_key_uq" ON "Competitor"("tenant", "key");
-- Selection keys are how bets, prices and grading find a runner.
CREATE UNIQUE INDEX "Selection_market_key_uq" ON "Selection"("tenant", "market", "key");
-- Feed events are matched by external key (createCatalogEvent checks EXTERNAL_KEY_EXISTS first).
CREATE UNIQUE INDEX "Event_external_key_uq" ON "Event"("tenant", "externalKey") WHERE "externalKey" <> '';
-- Ledger lookups are findFirst({ tenant, player, key, currency }): two rows would split a balance.
CREATE UNIQUE INDEX "LedgerAccount_owner_key_currency_uq" ON "LedgerAccount"("tenant", "player", "key", "currency") NULLS NOT DISTINCT;
-- Market exposure is read-then-create on the first bet of a market; two first bets would open two positions.
CREATE UNIQUE INDEX "ExposurePosition_scope_currency_uq" ON "ExposurePosition"("tenant", "scopeType", "scopeId", "currency");
-- Responsible gaming: one active self-exclusion per player (writers extend the active one, never add a second).
CREATE UNIQUE INDEX "SelfExclusion_one_active_per_player" ON "SelfExclusion"("tenant", "player") WHERE "status" = 'ACTIVE';
-- One open verification case of a type per player (openVerificationCase had no check; a double submit opened two).
CREATE UNIQUE INDEX "VerificationCase_one_pending_per_type" ON "VerificationCase"("tenant", "player", "type") WHERE "status" = 'PENDING';

-- Money stored as minor-unit strings: digits only, never negative, three-letter currency.
ALTER TABLE "PlayerLimit" ADD CONSTRAINT "PlayerLimit_amount_check" CHECK ("amountMinor" ~ '^[0-9]+$' AND length("currency") = 3);
ALTER TABLE "LimitRule" ADD CONSTRAINT "LimitRule_amounts_check" CHECK (
  ("maxStakeMinor" = '' OR "maxStakeMinor" ~ '^[0-9]+$') AND ("maxPayoutMinor" = '' OR "maxPayoutMinor" ~ '^[0-9]+$')
  AND ("maxLiabilityMinor" = '' OR "maxLiabilityMinor" ~ '^[0-9]+$') AND length("currency") = 3
);
ALTER TABLE "PaymentIntent" ADD CONSTRAINT "PaymentIntent_fee_check" CHECK ("feeMinor" = '' OR "feeMinor" ~ '^[0-9]+$');
-- A settlement pays its gross less withheld tax.
ALTER TABLE "Settlement" ADD CONSTRAINT "Settlement_payout_arithmetic" CHECK (
  "grossPayoutMinor" ~ '^[0-9]+$' AND "taxMinor" ~ '^[0-9]+$'
  AND "payoutMinor"::numeric = "grossPayoutMinor"::numeric - "taxMinor"::numeric
);
ALTER TABLE "ExposurePosition" ADD CONSTRAINT "ExposurePosition_amounts_check" CHECK (
  "stakeMinor" ~ '^[0-9]+$' AND "liabilityMinor" ~ '^[0-9]+$' AND length("currency") = 3 AND "scopeType" <> '' AND "scopeId" <> ''
);
ALTER TABLE "TaxAssessment" ADD CONSTRAINT "TaxAssessment_amounts_check" CHECK ("basisMinor" ~ '^[0-9]+$' AND "amountMinor" ~ '^[0-9]+$' AND length("currency") = 3);
ALTER TABLE "ReconciliationItem" ADD CONSTRAINT "ReconciliationItem_difference_check" CHECK ("differenceMinor" ~ '^-?[0-9]+$');

-- Time ranges.
ALTER TABLE "SelfExclusion" ADD CONSTRAINT "SelfExclusion_range_check" CHECK ("endsAt" IS NULL OR "endsAt" > "startsAt");
ALTER TABLE "TraderOverride" ADD CONSTRAINT "TraderOverride_range_check" CHECK ("expiresAt" > "startsAt");
ALTER TABLE "Season" ADD CONSTRAINT "Season_range_check" CHECK ("endsAt" > "startsAt");
ALTER TABLE "AccountRestriction" ADD CONSTRAINT "AccountRestriction_range_check" CHECK ("endsAt" IS NULL OR "startsAt" IS NULL OR "endsAt" > "startsAt");
ALTER TABLE "LegalHold" ADD CONSTRAINT "LegalHold_range_check" CHECK ("endsAt" IS NULL OR "startsAt" IS NULL OR "endsAt" > "startsAt");
ALTER TABLE "ComplianceReport" ADD CONSTRAINT "ComplianceReport_period_check" CHECK ("periodEnd" >= "periodStart");
ALTER TABLE "PlayerStatement" ADD CONSTRAINT "PlayerStatement_period_check" CHECK ("periodEnd" >= "periodStart");
