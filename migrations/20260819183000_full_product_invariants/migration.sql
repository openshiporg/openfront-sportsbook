-- Full-product invariants are forward-only. New tables are empty on upgrade, so
-- tenant ownership can be made mandatory without rewriting historical rows.
DO $$
DECLARE table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'AccessReview','AccountClosure','AdapterCertificationRun','AffiliateAttribution','AffordabilityAssessment',
    'BonusAward','BonusTransaction','BrandLocale','CampaignBudget','CashOutAcceptance','CompetitionStage',
    'ConfigDefinition','CorrelationGroup','CorrelationRule','CustomerCredential','CustomerDevice','CustomerFavorite',
    'CustomerPrivacyRequest','CustomerQuoteLegTerms','CustomerRecoveryToken','DataExport','EventScheduleChange',
    'FeatureFlag','FeedHealthSnapshot','HouseRuleVersion','IntegrityCase','JurisdictionPolicyVersion','LegalEntity',
    'LedgerAdjustmentRequest','MarketDefinition','Notification','OperatorChannel','PamSubjectMapping','PlayerStatement',
    'Promotion','PromotionRedemption','PromotionRuleVersion','ProviderHealthSample','Region','ReportArtifact',
    'RetentionExecution','RetentionPolicyVersion','SafeguardingAccount','SafeguardingReconciliation','ScheduledJob',
    'Season','SettlementLine','SettlementRun','SupportCase','SupportCaseEvent','TaxRuleVersion','TenantCurrency',
    'TraderOverride','TradingReplayRun','Venue','WagerPart'
  ] LOOP
    EXECUTE format('ALTER TABLE %I ALTER COLUMN tenant SET NOT NULL', table_name);
  END LOOP;
END $$;

-- Required ownership/provenance edges for immutable and economic evidence.
ALTER TABLE "CustomerCredential" ALTER COLUMN player SET NOT NULL;
ALTER TABLE "CustomerDevice" ALTER COLUMN player SET NOT NULL;
ALTER TABLE "CustomerFavorite" ALTER COLUMN player SET NOT NULL;
ALTER TABLE "CustomerQuoteLegTerms" ALTER COLUMN player SET NOT NULL, ALTER COLUMN quote SET NOT NULL;
ALTER TABLE "CustomerRecoveryToken" ALTER COLUMN player SET NOT NULL;
ALTER TABLE "WagerPart" ALTER COLUMN wager SET NOT NULL;
ALTER TABLE "SettlementRun" ALTER COLUMN "resultVersion" SET NOT NULL;
ALTER TABLE "SettlementLine" ALTER COLUMN settlement SET NOT NULL;
ALTER TABLE "CashOutAcceptance" ALTER COLUMN offer SET NOT NULL, ALTER COLUMN wager SET NOT NULL, ALTER COLUMN player SET NOT NULL, ALTER COLUMN "journalTransaction" SET NOT NULL;
ALTER TABLE "PromotionRuleVersion" ALTER COLUMN promotion SET NOT NULL;
ALTER TABLE "CampaignBudget" ALTER COLUMN promotion SET NOT NULL;
ALTER TABLE "BonusAward" ALTER COLUMN promotion SET NOT NULL, ALTER COLUMN "ruleVersion" SET NOT NULL, ALTER COLUMN player SET NOT NULL;
ALTER TABLE "BonusTransaction" ALTER COLUMN award SET NOT NULL;
ALTER TABLE "PromotionRedemption" ALTER COLUMN promotion SET NOT NULL, ALTER COLUMN "ruleVersion" SET NOT NULL, ALTER COLUMN player SET NOT NULL;
ALTER TABLE "SafeguardingReconciliation" ALTER COLUMN "safeguardingAccount" SET NOT NULL;
ALTER TABLE "LedgerAdjustmentRequest" ALTER COLUMN account SET NOT NULL, ALTER COLUMN "approvalRequest" SET NOT NULL;
ALTER TABLE "SupportCase" ALTER COLUMN player SET NOT NULL;
ALTER TABLE "SupportCaseEvent" ALTER COLUMN "supportCase" SET NOT NULL;
ALTER TABLE "ScheduledJob" ALTER COLUMN "idempotencyKey" SET NOT NULL;

-- Keystone originally emitted SET NULL foreign keys while these relationships
-- were nullable. Once required, align their referential action with the
-- generated Prisma contract without hand-maintaining dozens of constraint names.
DO $$
DECLARE row record; definition text;
BEGIN
  FOR row IN
    SELECT constraint_meta.conname AS name, table_class.relname AS table_name,
           pg_get_constraintdef(constraint_meta.oid) AS definition
    FROM pg_constraint constraint_meta
    JOIN pg_class table_class ON table_class.oid = constraint_meta.conrelid
    JOIN pg_attribute column_meta ON column_meta.attrelid = table_class.oid
      AND column_meta.attnum = constraint_meta.conkey[1]
    WHERE constraint_meta.contype = 'f' AND array_length(constraint_meta.conkey, 1) = 1
      AND constraint_meta.confdeltype = 'n' AND column_meta.attnotnull
  LOOP
    definition := replace(row.definition, 'ON DELETE SET NULL', 'ON DELETE RESTRICT');
    EXECUTE format('ALTER TABLE %I DROP CONSTRAINT %I', row.table_name, row.name);
    EXECUTE format('ALTER TABLE %I ADD CONSTRAINT %I %s', row.table_name, row.name, definition);
  END LOOP;
END $$;

ALTER TABLE "Wager" ADD CONSTRAINT "Wager_full_contract_check" CHECK (
  version > 0 AND "liveDelayMs" >= 0 AND "stakeMinor" ~ '^[0-9]+$' AND "stakeMinor"::numeric > 0
  AND "potentialReturnMinor" ~ '^[0-9]+$' AND "potentialReturnMinor"::numeric >= 0
  AND ("maxPayoutMinor" = '' OR ("maxPayoutMinor" ~ '^[0-9]+$' AND "maxPayoutMinor"::numeric >= 0))
);
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_full_contract_check" CHECK (
  "legCount" > 0 AND "partCount" > 0 AND "liveDelayMs" >= 0
  AND ("potentialReturnMinor" = '' OR ("potentialReturnMinor" ~ '^[0-9]+$' AND "potentialReturnMinor"::numeric >= 0))
);
ALTER TABLE "WagerPart" ADD CONSTRAINT "WagerPart_economic_check" CHECK (
  "partIndex" >= 0 AND "stakeMinor" ~ '^[0-9]+$' AND "stakeMinor"::numeric > 0
  AND "potentialReturnMinor" ~ '^[0-9]+$' AND "potentialReturnMinor"::numeric >= 0
  AND "decimalOdds" ~ '^[0-9]+(\.[0-9]+)?$' AND "decimalOdds"::numeric >= 1
);
ALTER TABLE "CashOutOffer" ADD CONSTRAINT "CashOutOffer_economic_check" CHECK (
  "amountMinor" ~ '^[0-9]+$' AND "amountMinor"::numeric >= 0
  AND "portionNumerator" ~ '^[0-9]+$' AND "portionDenominator" ~ '^[0-9]+$'
  AND "portionNumerator"::numeric > 0 AND "portionDenominator"::numeric > 0
  AND "portionNumerator"::numeric <= "portionDenominator"::numeric
  AND ("feeMinor" = '' OR ("feeMinor" ~ '^[0-9]+$' AND "feeMinor"::numeric >= 0))
);
ALTER TABLE "CashOutAcceptance" ADD CONSTRAINT "CashOutAcceptance_economic_check" CHECK (
  "amountMinor" ~ '^[0-9]+$' AND "amountMinor"::numeric >= 0
  AND "portionNumerator" ~ '^[0-9]+$' AND "portionDenominator" ~ '^[0-9]+$'
  AND "portionNumerator"::numeric > 0 AND "portionNumerator"::numeric <= "portionDenominator"::numeric
  AND "wagerVersion" > 0 AND length("idempotencyKey") >= 8 AND length("evidenceHash") = 64
);
ALTER TABLE "SettlementLine" ADD CONSTRAINT "SettlementLine_amount_check" CHECK (
  "amountMinor" ~ '^-?[0-9]+$' AND "residualMinor" ~ '^-?[0-9]+$' AND scale >= 0
);
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_budget_check" CHECK (
  "budgetMinor" ~ '^[0-9]+$' AND "budgetMinor"::numeric >= 0 AND length(currency) = 3 AND "startsAt" < "endsAt" AND length("termsHash") = 64
);
ALTER TABLE "CampaignBudget" ADD CONSTRAINT "CampaignBudget_economic_check" CHECK (
  "allocatedMinor" ~ '^[0-9]+$' AND "awardedMinor" ~ '^[0-9]+$' AND "redeemedMinor" ~ '^[0-9]+$' AND "forfeitedMinor" ~ '^[0-9]+$'
  AND "allocatedMinor"::numeric >= 0 AND "awardedMinor"::numeric >= 0 AND "redeemedMinor"::numeric >= 0 AND "forfeitedMinor"::numeric >= 0
  AND "awardedMinor"::numeric <= "allocatedMinor"::numeric AND version > 0
);
ALTER TABLE "BonusAward" ADD CONSTRAINT "BonusAward_economic_check" CHECK (
  "amountMinor" ~ '^[0-9]+$' AND "remainingMinor" ~ '^[0-9]+$' AND "amountMinor"::numeric > 0
  AND "remainingMinor"::numeric >= 0 AND "remainingMinor"::numeric <= "amountMinor"::numeric
  AND length(currency) = 3 AND length("idempotencyKey") >= 8 AND length("evidenceHash") = 64
);
ALTER TABLE "BonusTransaction" ADD CONSTRAINT "BonusTransaction_economic_check" CHECK (
  "amountMinor" ~ '^[0-9]+$' AND "remainingMinor" ~ '^[0-9]+$' AND "amountMinor"::numeric >= 0
  AND "remainingMinor"::numeric >= 0 AND length(currency) = 3 AND length("idempotencyKey") >= 8 AND length("evidenceHash") = 64
);
ALTER TABLE "SafeguardingReconciliation" ADD CONSTRAINT "SafeguardingReconciliation_amount_check" CHECK (
  "safeguardedAssetMinor" ~ '^[0-9]+$' AND "playerLiabilityMinor" ~ '^[0-9]+$' AND "differenceMinor" ~ '^-?[0-9]+$'
);
ALTER TABLE "LedgerAdjustmentRequest" ADD CONSTRAINT "LedgerAdjustmentRequest_amount_check" CHECK (
  "amountMinor" ~ '^[0-9]+$' AND "amountMinor"::numeric > 0 AND length(currency) = 3
);
ALTER TABLE "TaxRuleVersion" ADD CONSTRAINT "TaxRuleVersion_rate_check" CHECK (
  "rateNumerator" ~ '^[0-9]+$' AND "rateDenominator" ~ '^[0-9]+$' AND "rateDenominator"::numeric > 0 AND version > 0
);
ALTER TABLE "ScheduledJob" ADD CONSTRAINT "ScheduledJob_attempt_check" CHECK (attempts >= 0 AND "maxAttempts" > 0 AND length("idempotencyKey") >= 8);

-- Cross-tenant references are rejected below the application boundary. The
-- trigger is generic so future relationships can opt in without duplicating
-- security-sensitive PL/pgSQL.
CREATE FUNCTION sportsbook_assert_tenant_reference() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE expected_tenant text; referenced_tenant text; reference_id text;
BEGIN
  expected_tenant := to_jsonb(NEW)->>TG_ARGV[0];
  reference_id := to_jsonb(NEW)->>TG_ARGV[1];
  IF expected_tenant IS NULL OR reference_id IS NULL THEN RETURN NEW; END IF;
  EXECUTE format('SELECT tenant FROM %I WHERE id = $1', TG_ARGV[2]) INTO referenced_tenant USING reference_id;
  IF referenced_tenant IS NULL OR referenced_tenant <> expected_tenant THEN
    RAISE EXCEPTION 'cross-tenant relationship rejected: %.% -> %', TG_TABLE_NAME, TG_ARGV[1], TG_ARGV[2];
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER wager_part_tenant_reference BEFORE INSERT OR UPDATE ON "WagerPart" FOR EACH ROW EXECUTE FUNCTION sportsbook_assert_tenant_reference('tenant','wager','Wager');
CREATE TRIGGER cashout_offer_tenant_reference BEFORE INSERT OR UPDATE ON "CashOutOffer" FOR EACH ROW EXECUTE FUNCTION sportsbook_assert_tenant_reference('tenant','wager','Wager');
CREATE TRIGGER cashout_acceptance_tenant_reference BEFORE INSERT OR UPDATE ON "CashOutAcceptance" FOR EACH ROW EXECUTE FUNCTION sportsbook_assert_tenant_reference('tenant','wager','Wager');
CREATE TRIGGER bonus_award_player_tenant_reference BEFORE INSERT OR UPDATE ON "BonusAward" FOR EACH ROW EXECUTE FUNCTION sportsbook_assert_tenant_reference('tenant','player','Player');
CREATE TRIGGER promotion_redemption_player_tenant_reference BEFORE INSERT OR UPDATE ON "PromotionRedemption" FOR EACH ROW EXECUTE FUNCTION sportsbook_assert_tenant_reference('tenant','player','Player');
CREATE TRIGGER customer_credential_tenant_reference BEFORE INSERT OR UPDATE ON "CustomerCredential" FOR EACH ROW EXECUTE FUNCTION sportsbook_assert_tenant_reference('tenant','player','Player');
CREATE TRIGGER customer_favorite_tenant_reference BEFORE INSERT OR UPDATE ON "CustomerFavorite" FOR EACH ROW EXECUTE FUNCTION sportsbook_assert_tenant_reference('tenant','player','Player');
CREATE TRIGGER support_case_tenant_reference BEFORE INSERT OR UPDATE ON "SupportCase" FOR EACH ROW EXECUTE FUNCTION sportsbook_assert_tenant_reference('tenant','player','Player');

-- Evidence and economic facts can only be corrected by linked compensating rows.
CREATE TRIGGER customer_quote_leg_terms_immutable BEFORE UPDATE OR DELETE ON "CustomerQuoteLegTerms" FOR EACH ROW EXECUTE FUNCTION sportsbook_deny_evidence_mutation();
CREATE TRIGGER settlement_line_immutable BEFORE UPDATE OR DELETE ON "SettlementLine" FOR EACH ROW EXECUTE FUNCTION sportsbook_deny_evidence_mutation();
CREATE TRIGGER cashout_acceptance_immutable BEFORE UPDATE OR DELETE ON "CashOutAcceptance" FOR EACH ROW EXECUTE FUNCTION sportsbook_deny_evidence_mutation();
CREATE TRIGGER bonus_transaction_immutable BEFORE UPDATE OR DELETE ON "BonusTransaction" FOR EACH ROW EXECUTE FUNCTION sportsbook_deny_financial_mutation();
CREATE TRIGGER promotion_redemption_immutable BEFORE UPDATE OR DELETE ON "PromotionRedemption" FOR EACH ROW EXECUTE FUNCTION sportsbook_deny_evidence_mutation();
CREATE TRIGGER provider_health_sample_immutable BEFORE UPDATE OR DELETE ON "ProviderHealthSample" FOR EACH ROW EXECUTE FUNCTION sportsbook_deny_evidence_mutation();
CREATE TRIGGER safeguarding_reconciliation_immutable BEFORE UPDATE OR DELETE ON "SafeguardingReconciliation" FOR EACH ROW EXECUTE FUNCTION sportsbook_deny_financial_mutation();
CREATE TRIGGER report_artifact_immutable BEFORE UPDATE OR DELETE ON "ReportArtifact" FOR EACH ROW EXECUTE FUNCTION sportsbook_deny_evidence_mutation();

-- Strict tenant RLS policies are installed for non-owner/non-BYPASSRLS runtime
-- roles. PostgreSQL owners bypass unless FORCE RLS is selected by the deployment;
-- production readiness rejects an unapproved bypass role. Request transactions
-- set app.tenant_id locally before using such a role.
DO $$
DECLARE row record; policy_name text;
BEGIN
  FOR row IN
    SELECT table_name FROM information_schema.columns
    WHERE table_schema = 'public' AND column_name = 'tenant'
      AND table_name NOT IN ('Todo','TodoImage','_Todo_todoImages')
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', row.table_name);
    policy_name := lower(regexp_replace(row.table_name, '[^a-zA-Z0-9]+', '_', 'g')) || '_tenant_isolation';
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename=row.table_name AND policyname=policy_name) THEN
      EXECUTE format('CREATE POLICY %I ON %I USING (tenant = nullif(current_setting(''app.tenant_id'', true), '''')) WITH CHECK (tenant = nullif(current_setting(''app.tenant_id'', true), ''''))', policy_name, row.table_name);
    END IF;
  END LOOP;
END $$;
