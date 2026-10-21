ALTER TABLE "WebhookEndpoint" ADD CONSTRAINT "WebhookEndpoint_security_check" CHECK (
  url ~ '^https://[^[:space:]]+$' AND length(name) > 0 AND length("secretReference") > 0 AND "failureCount" >= 0
);
ALTER TABLE "WebhookDelivery" ADD CONSTRAINT "WebhookDelivery_evidence_check" CHECK (
  length("deliveryId") >= 8 AND length("eventType") > 0 AND length("eventVersion") > 0
  AND length("payloadHash") = 64 AND length("signatureKeyId") > 0 AND attempts >= 0
);
ALTER TABLE "IntegrationDeliveryAttempt" ADD CONSTRAINT "IntegrationDeliveryAttempt_number_check" CHECK (attempt > 0 AND ("latencyMs" IS NULL OR "latencyMs" >= 0));

CREATE TRIGGER webhook_delivery_tenant_reference BEFORE INSERT OR UPDATE ON "WebhookDelivery" FOR EACH ROW EXECUTE FUNCTION sportsbook_assert_tenant_reference('tenant','endpoint','WebhookEndpoint');
CREATE TRIGGER integration_delivery_attempt_tenant_reference BEFORE INSERT OR UPDATE ON "IntegrationDeliveryAttempt" FOR EACH ROW EXECUTE FUNCTION sportsbook_assert_tenant_reference('tenant','delivery','WebhookDelivery');
CREATE TRIGGER integration_delivery_attempt_immutable BEFORE UPDATE OR DELETE ON "IntegrationDeliveryAttempt" FOR EACH ROW EXECUTE FUNCTION sportsbook_deny_evidence_mutation();

CREATE FUNCTION sportsbook_protect_final_delivery() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' OR OLD.status IN ('DELIVERED','DEAD') THEN
    RAISE EXCEPTION 'final webhook delivery evidence is immutable';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER webhook_delivery_final_immutable BEFORE UPDATE OR DELETE ON "WebhookDelivery" FOR EACH ROW EXECUTE FUNCTION sportsbook_protect_final_delivery();

ALTER TABLE "WebhookEndpoint" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WebhookDelivery" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "IntegrationDeliveryAttempt" ENABLE ROW LEVEL SECURITY;
CREATE POLICY webhookendpoint_tenant_isolation ON "WebhookEndpoint" USING (tenant = nullif(current_setting('app.tenant_id', true), '')) WITH CHECK (tenant = nullif(current_setting('app.tenant_id', true), ''));
CREATE POLICY webhookdelivery_tenant_isolation ON "WebhookDelivery" USING (tenant = nullif(current_setting('app.tenant_id', true), '')) WITH CHECK (tenant = nullif(current_setting('app.tenant_id', true), ''));
CREATE POLICY integrationdeliveryattempt_tenant_isolation ON "IntegrationDeliveryAttempt" USING (tenant = nullif(current_setting('app.tenant_id', true), '')) WITH CHECK (tenant = nullif(current_setting('app.tenant_id', true), ''));
