-- OperatorLicence carries a tenant column but was created without row-level security: give it the same
-- transaction-local tenant isolation policy every other tenant table has.
ALTER TABLE "OperatorLicence" ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'OperatorLicence' AND policyname = 'operatorlicence_tenant_isolation') THEN
    CREATE POLICY operatorlicence_tenant_isolation ON "OperatorLicence"
      USING (tenant = nullif(current_setting('app.tenant_id', true), ''))
      WITH CHECK (tenant = nullif(current_setting('app.tenant_id', true), ''));
  END IF;
END $$;
