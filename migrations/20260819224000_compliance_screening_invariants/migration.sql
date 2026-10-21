ALTER TABLE "ScreeningHit" ADD CONSTRAINT "ScreeningHit_evidence_check" CHECK (
  length("matchToken") = 64 AND length("evidenceReference") > 0 AND "screenedAt" IS NOT NULL
  AND ((status IN ('CLEARED','FALSE_POSITIVE','CONFIRMED') AND "resolvedAt" IS NOT NULL) OR status IN ('POTENTIAL','REVIEW'))
);
CREATE TRIGGER screening_hit_aml_tenant_reference BEFORE INSERT OR UPDATE ON "ScreeningHit" FOR EACH ROW EXECUTE FUNCTION sportsbook_assert_tenant_reference('tenant','amlCase','AMLCase');
CREATE TRIGGER screening_hit_provider_tenant_reference BEFORE INSERT OR UPDATE ON "ScreeningHit" FOR EACH ROW EXECUTE FUNCTION sportsbook_assert_tenant_reference('tenant','providerConnection','ProviderConnection');
CREATE FUNCTION sportsbook_deny_evidence_delete() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'sportsbook evidence deletion is prohibited'; END $$;
CREATE TRIGGER screening_hit_delete_prohibited BEFORE DELETE ON "ScreeningHit" FOR EACH ROW EXECUTE FUNCTION sportsbook_deny_evidence_delete();
ALTER TABLE "ScreeningHit" ENABLE ROW LEVEL SECURITY;
CREATE POLICY screeninghit_tenant_isolation ON "ScreeningHit" USING (tenant = nullif(current_setting('app.tenant_id', true), '')) WITH CHECK (tenant = nullif(current_setting('app.tenant_id', true), ''));
