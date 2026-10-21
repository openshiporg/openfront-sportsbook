-- Narrow pre-tenant identity lookup for non-bypass runtime roles (additive, SELECT only).
-- A request that holds an already-authenticated opaque key may read exactly the one row that key names,
-- by setting it transaction-locally; tenant isolation policies are unchanged and still govern all other access.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'User' AND policyname = 'user_session_bootstrap') THEN
    CREATE POLICY user_session_bootstrap ON "User" FOR SELECT
      USING (id = nullif(current_setting('app.bootstrap_user_id', true), ''));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'CustomerSession' AND policyname = 'customersession_token_bootstrap') THEN
    CREATE POLICY customersession_token_bootstrap ON "CustomerSession" FOR SELECT
      USING ("tokenDigest" = nullif(current_setting('app.bootstrap_customer_token', true), ''));
  END IF;
END $$;
