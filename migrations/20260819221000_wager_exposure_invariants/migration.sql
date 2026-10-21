ALTER TABLE "WagerExposureAllocation" ADD CONSTRAINT "WagerExposureAllocation_economic_check" CHECK (
  "stakeMinor" ~ '^[0-9]+$' AND "liabilityMinor" ~ '^[0-9]+$'
  AND "remainingStakeMinor" ~ '^[0-9]+$' AND "remainingLiabilityMinor" ~ '^[0-9]+$'
  AND "stakeMinor"::numeric >= 0 AND "liabilityMinor"::numeric >= 0
  AND "remainingStakeMinor"::numeric >= 0 AND "remainingStakeMinor"::numeric <= "stakeMinor"::numeric
  AND "remainingLiabilityMinor"::numeric >= 0 AND "remainingLiabilityMinor"::numeric <= "liabilityMinor"::numeric
  AND version > 0
);
CREATE TRIGGER wager_exposure_wager_tenant_reference BEFORE INSERT OR UPDATE ON "WagerExposureAllocation" FOR EACH ROW EXECUTE FUNCTION sportsbook_assert_tenant_reference('tenant','wager','Wager');
CREATE TRIGGER wager_exposure_market_tenant_reference BEFORE INSERT OR UPDATE ON "WagerExposureAllocation" FOR EACH ROW EXECUTE FUNCTION sportsbook_assert_tenant_reference('tenant','market','Market');
ALTER TABLE "WagerExposureAllocation" ENABLE ROW LEVEL SECURITY;
CREATE POLICY wagerexposureallocation_tenant_isolation ON "WagerExposureAllocation" USING (tenant = nullif(current_setting('app.tenant_id', true), '')) WITH CHECK (tenant = nullif(current_setting('app.tenant_id', true), ''));
