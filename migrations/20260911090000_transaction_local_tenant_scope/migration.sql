-- Keep anonymous/global rate buckets usable while all tenant-scoped rows remain denied
-- unless app.tenant_id is set locally within the current transaction.
DO $$
BEGIN
  IF to_regclass('public."ApiRateBucket"') IS NOT NULL
     AND NOT EXISTS (
       SELECT 1 FROM pg_policies
       WHERE schemaname = 'public'
         AND tablename = 'ApiRateBucket'
         AND policyname = 'apiratebucket_global_request_scope'
     ) THEN
    CREATE POLICY apiratebucket_global_request_scope
      ON "ApiRateBucket"
      USING (
        "tenant" IS NULL
        AND nullif(current_setting('app.tenant_id', true), '') IS NULL
      )
      WITH CHECK (
        "tenant" IS NULL
        AND nullif(current_setting('app.tenant_id', true), '') IS NULL
      );
  END IF;
END $$;
