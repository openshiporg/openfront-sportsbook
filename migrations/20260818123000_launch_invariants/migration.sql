-- Launch invariants layered over Keystone-generated relations. Additive and safe for starter upgrades.

-- Economic/idempotency/provenance uniqueness.
CREATE UNIQUE INDEX IF NOT EXISTS "Settlement_tenant_input_uq" ON "Settlement"("tenant","inputHash");
CREATE UNIQUE INDEX IF NOT EXISTS "Settlement_wager_version_uq" ON "Settlement"("tenant","wager","version");
CREATE UNIQUE INDEX IF NOT EXISTS "BalanceProjection_account_version_uq" ON "BalanceProjection"("tenant","account","version");
CREATE UNIQUE INDEX IF NOT EXISTS "PriceSnapshot_selection_sequence_uq" ON "PriceSnapshot"("tenant","selection","sequence");
CREATE UNIQUE INDEX IF NOT EXISTS "ResultVersion_event_version_uq" ON "ResultVersion"("tenant","event","version");
CREATE UNIQUE INDEX IF NOT EXISTS "ProviderEntityMapping_external_uq" ON "ProviderEntityMapping"("tenant","providerConnection","entityType","externalId");
CREATE UNIQUE INDEX IF NOT EXISTS "WebhookReplay_connection_hash_uq" ON "WebhookReplay"("providerConnection","messageHash");
CREATE UNIQUE INDEX IF NOT EXISTS "ApiRateBucket_active_key_uq" ON "ApiRateBucket"(COALESCE("tenant",''),"keyHash","scope","windowStartedAt");
CREATE UNIQUE INDEX IF NOT EXISTS "CustomerCommand_key_uq" ON "CustomerCommand"("commandKey");
CREATE UNIQUE INDEX IF NOT EXISTS "CustomerQuoteTerms_key_uq" ON "CustomerQuoteTerms"("quoteKey");

-- Required relationships and exact-value checks. NOT VALID then VALIDATE supports explicit upgrade diagnosis.
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_launch_check" CHECK ("tenant" IS NOT NULL AND "player" IS NOT NULL AND "selection" IS NOT NULL AND "priceSnapshot" IS NOT NULL AND CASE WHEN "stakeMinor" ~ '^[0-9]+$' THEN "stakeMinor"::numeric > 0 ELSE false END AND CASE WHEN "decimalOdds" ~ '^[0-9]+(\.[0-9]+)?$' THEN "decimalOdds"::numeric >= 1.01 ELSE false END AND length("currency")=3 AND length("termsHash")>=32 AND "expiresAt" IS NOT NULL) NOT VALID;
ALTER TABLE "Wager" ADD CONSTRAINT "Wager_launch_check" CHECK ("tenant" IS NOT NULL AND "player" IS NOT NULL AND "quote" IS NOT NULL AND length("idempotencyKey")>=8 AND CASE WHEN "stakeMinor" ~ '^[0-9]+$' THEN "stakeMinor"::numeric > 0 ELSE false END AND CASE WHEN "potentialReturnMinor" ~ '^[0-9]+$' THEN "potentialReturnMinor"::numeric >= 0 ELSE false END AND length("currency")=3 AND length("termsHash")>=32) NOT VALID;
ALTER TABLE "WagerLeg" ADD CONSTRAINT "WagerLeg_launch_check" CHECK ("tenant" IS NOT NULL AND "wager" IS NOT NULL AND length("eventKey")>0 AND length("marketKey")>0 AND length("selectionKey")>0 AND length("snapshotId")>0 AND CASE WHEN "decimalOdds" ~ '^[0-9]+(\.[0-9]+)?$' THEN "decimalOdds"::numeric >= 1.01 ELSE false END) NOT VALID;
ALTER TABLE "AcceptanceDecision" ADD CONSTRAINT "AcceptanceDecision_launch_check" CHECK ("tenant" IS NOT NULL AND "wager" IS NOT NULL AND "quote" IS NOT NULL AND length("inputHash")>=32) NOT VALID;
ALTER TABLE "JournalTransaction" ADD CONSTRAINT "JournalTransaction_launch_check" CHECK ("tenant" IS NOT NULL AND length("idempotencyKey")>=8 AND length("correlationId")>0 AND "effectiveAt" IS NOT NULL) NOT VALID;
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_launch_check" CHECK ("tenant" IS NOT NULL AND "transaction" IS NOT NULL AND "account" IS NOT NULL AND CASE WHEN "amountMinor" ~ '^[0-9]+$' THEN "amountMinor"::numeric > 0 ELSE false END AND length("currency")=3) NOT VALID;
ALTER TABLE "Hold" ADD CONSTRAINT "Hold_launch_check" CHECK ("tenant" IS NOT NULL AND "account" IS NOT NULL AND CASE WHEN "amountMinor" ~ '^[0-9]+$' THEN "amountMinor"::numeric > 0 ELSE false END AND length("purposeType")>0 AND length("purposeId")>0 AND "version">0) NOT VALID;
ALTER TABLE "BalanceProjection" ADD CONSTRAINT "BalanceProjection_launch_check" CHECK ("tenant" IS NOT NULL AND "account" IS NOT NULL AND CASE WHEN "postedMinor" ~ '^-?[0-9]+$' AND "pendingMinor" ~ '^[0-9]+$' AND "availableMinor" ~ '^[0-9]+$' THEN "availableMinor"::numeric >= 0 AND "pendingMinor"::numeric >= 0 ELSE false END AND "version">0 AND "asOf" IS NOT NULL) NOT VALID;
ALTER TABLE "PaymentIntent" ADD CONSTRAINT "PaymentIntent_launch_check" CHECK ("tenant" IS NOT NULL AND "player" IS NOT NULL AND "providerConnection" IS NOT NULL AND CASE WHEN "amountMinor" ~ '^[0-9]+$' THEN "amountMinor"::numeric > 0 ELSE false END AND length("currency")=3 AND length("idempotencyKey")>=8) NOT VALID;
ALTER TABLE "PriceSnapshot" ADD CONSTRAINT "PriceSnapshot_launch_check" CHECK ("tenant" IS NOT NULL AND "selection" IS NOT NULL AND "providerConnection" IS NOT NULL AND CASE WHEN "decimalOdds" ~ '^[0-9]+(\.[0-9]+)?$' THEN "decimalOdds"::numeric >= 1.01 ELSE false END AND length("sequence")>0 AND "effectiveAt" IS NOT NULL AND "receivedAt" IS NOT NULL) NOT VALID;
ALTER TABLE "ResultVersion" ADD CONSTRAINT "ResultVersion_launch_check" CHECK ("tenant" IS NOT NULL AND "event" IS NOT NULL AND "providerConnection" IS NOT NULL AND "version">0 AND length("payloadHash")>=8) NOT VALID;
ALTER TABLE "Settlement" ADD CONSTRAINT "Settlement_launch_check" CHECK ("tenant" IS NOT NULL AND "wager" IS NOT NULL AND "resultVersion" IS NOT NULL AND "journalTransaction" IS NOT NULL AND "version">0 AND CASE WHEN "payoutMinor" ~ '^[0-9]+$' THEN "payoutMinor"::numeric >= 0 ELSE false END AND length("inputHash")>=8) NOT VALID;
ALTER TABLE "RawEnvelope" ADD CONSTRAINT "RawEnvelope_launch_check" CHECK ("tenant" IS NOT NULL AND "providerConnection" IS NOT NULL AND length("externalId")>0 AND length("schemaVersion")>0 AND length("payloadHash")>=32 AND "receivedAt" IS NOT NULL) NOT VALID;
ALTER TABLE "InboxMessage" ADD CONSTRAINT "InboxMessage_launch_check" CHECK ("tenant" IS NOT NULL AND "rawEnvelope" IS NOT NULL AND length("messageKey")>0 AND length("type")>0 AND "attempts">=0) NOT VALID;
ALTER TABLE "OutboxMessage" ADD CONSTRAINT "OutboxMessage_launch_check" CHECK ("tenant" IS NOT NULL AND length("aggregateType")>0 AND length("aggregateId")>0 AND length("eventType")>0 AND "attempts">=0 AND "maxAttempts">0) NOT VALID;
ALTER TABLE "ApprovalRequest" ADD CONSTRAINT "ApprovalRequest_dual_control_check" CHECK ((status IN ('PENDING','EXPIRED') AND "approverId"='') OR (status IN ('APPROVED','REJECTED') AND length("approverId")>0 AND "approverId"<>"requesterId")) NOT VALID;
ALTER TABLE "VerificationCase" ADD CONSTRAINT "VerificationCase_launch_check" CHECK ("tenant" IS NOT NULL AND "player" IS NOT NULL AND "providerConnection" IS NOT NULL) NOT VALID;
ALTER TABLE "GeoCheck" ADD CONSTRAINT "GeoCheck_launch_check" CHECK ("tenant" IS NOT NULL AND "geoSession" IS NOT NULL AND "providerConnection" IS NOT NULL AND "checkedAt" IS NOT NULL) NOT VALID;
ALTER TABLE "CustomerSession" ADD CONSTRAINT "CustomerSession_launch_check" CHECK ("tenant" IS NOT NULL AND "player" IS NOT NULL AND length("tokenDigest")=64 AND "expiresAt" IS NOT NULL) NOT VALID;
ALTER TABLE "CustomerCommand" ADD CONSTRAINT "CustomerCommand_launch_check" CHECK ("tenant" IS NOT NULL AND "player" IS NOT NULL AND length("idempotencyKey")>=8 AND length("requestHash")>=32) NOT VALID;
ALTER TABLE "CustomerQuoteTerms" ADD CONSTRAINT "CustomerQuoteTerms_launch_check" CHECK ("tenant" IS NOT NULL AND "player" IS NOT NULL AND "quote" IS NOT NULL AND CASE WHEN "stakeMinor" ~ '^[0-9]+$' THEN "stakeMinor"::numeric > 0 ELSE false END AND CASE WHEN "potentialReturnMinor" ~ '^[0-9]+$' THEN "potentialReturnMinor"::numeric >= 0 ELSE false END AND length("termsHash")>=32) NOT VALID;

-- Database-enforced append-only evidence.
CREATE OR REPLACE FUNCTION sportsbook_deny_evidence_mutation() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'sportsbook evidence is append-only'; END $$;
DROP TRIGGER IF EXISTS audit_event_immutable ON "AuditEvent";
CREATE TRIGGER audit_event_immutable BEFORE UPDATE OR DELETE ON "AuditEvent" FOR EACH ROW EXECUTE FUNCTION sportsbook_deny_evidence_mutation();
CREATE TRIGGER raw_envelope_immutable BEFORE UPDATE OR DELETE ON "RawEnvelope" FOR EACH ROW EXECUTE FUNCTION sportsbook_deny_evidence_mutation();
CREATE TRIGGER price_snapshot_immutable BEFORE UPDATE OR DELETE ON "PriceSnapshot" FOR EACH ROW EXECUTE FUNCTION sportsbook_deny_evidence_mutation();
CREATE TRIGGER wager_leg_immutable BEFORE UPDATE OR DELETE ON "WagerLeg" FOR EACH ROW EXECUTE FUNCTION sportsbook_deny_evidence_mutation();
CREATE TRIGGER acceptance_decision_immutable BEFORE UPDATE OR DELETE ON "AcceptanceDecision" FOR EACH ROW EXECUTE FUNCTION sportsbook_deny_evidence_mutation();
CREATE TRIGGER customer_quote_terms_immutable BEFORE UPDATE OR DELETE ON "CustomerQuoteTerms" FOR EACH ROW EXECUTE FUNCTION sportsbook_deny_evidence_mutation();
CREATE TRIGGER audit_anchor_immutable BEFORE UPDATE OR DELETE ON "AuditAnchor" FOR EACH ROW EXECUTE FUNCTION sportsbook_deny_evidence_mutation();
DROP TRIGGER IF EXISTS journal_transaction_immutable ON "JournalTransaction";
CREATE TRIGGER journal_transaction_immutable BEFORE UPDATE OR DELETE ON "JournalTransaction" FOR EACH ROW EXECUTE FUNCTION sportsbook_deny_evidence_mutation();

-- Deferred transaction-level journal balance/currency invariant.
CREATE OR REPLACE FUNCTION sportsbook_check_journal_balance() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE txid text; imbalance numeric; currencies int;
BEGIN txid:=COALESCE(NEW."transaction",OLD."transaction"); SELECT COALESCE(SUM(CASE WHEN side='DEBIT' THEN "amountMinor"::numeric ELSE -"amountMinor"::numeric END),0),COUNT(DISTINCT currency) INTO imbalance,currencies FROM "JournalEntry" WHERE "transaction"=txid; IF imbalance<>0 OR currencies>1 THEN RAISE EXCEPTION 'unbalanced or cross-currency journal %',txid; END IF; RETURN NULL; END $$;
DROP TRIGGER IF EXISTS journal_balance_deferred ON "JournalEntry";
CREATE CONSTRAINT TRIGGER journal_balance_deferred AFTER INSERT OR UPDATE OR DELETE ON "JournalEntry" DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION sportsbook_check_journal_balance();

-- Audit chain head must match at insert; app takes a tenant advisory lock.
CREATE OR REPLACE FUNCTION sportsbook_check_audit_chain() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE expected text; BEGIN SELECT COALESCE(hash,'') INTO expected FROM "AuditEvent" WHERE tenant=NEW.tenant ORDER BY "createdAt" DESC,id DESC LIMIT 1; expected:=COALESCE(expected,''); IF NEW."previousHash"<>expected OR length(NEW.hash)<32 OR length(NEW."payloadHash")<32 THEN RAISE EXCEPTION 'invalid audit chain'; END IF; RETURN NEW; END $$;
DROP TRIGGER IF EXISTS audit_chain_insert ON "AuditEvent";
CREATE TRIGGER audit_chain_insert BEFORE INSERT ON "AuditEvent" FOR EACH ROW EXECUTE FUNCTION sportsbook_check_audit_chain();

-- Validate checks explicitly so an upgrade fails rather than silently retaining invalid rows.
ALTER TABLE "Quote" VALIDATE CONSTRAINT "Quote_launch_check";
ALTER TABLE "Wager" VALIDATE CONSTRAINT "Wager_launch_check";
ALTER TABLE "WagerLeg" VALIDATE CONSTRAINT "WagerLeg_launch_check";
ALTER TABLE "AcceptanceDecision" VALIDATE CONSTRAINT "AcceptanceDecision_launch_check";
ALTER TABLE "JournalTransaction" VALIDATE CONSTRAINT "JournalTransaction_launch_check";
ALTER TABLE "JournalEntry" VALIDATE CONSTRAINT "JournalEntry_launch_check";
ALTER TABLE "Hold" VALIDATE CONSTRAINT "Hold_launch_check";
ALTER TABLE "BalanceProjection" VALIDATE CONSTRAINT "BalanceProjection_launch_check";
ALTER TABLE "PaymentIntent" VALIDATE CONSTRAINT "PaymentIntent_launch_check";
ALTER TABLE "PriceSnapshot" VALIDATE CONSTRAINT "PriceSnapshot_launch_check";
ALTER TABLE "ResultVersion" VALIDATE CONSTRAINT "ResultVersion_launch_check";
ALTER TABLE "Settlement" VALIDATE CONSTRAINT "Settlement_launch_check";
ALTER TABLE "RawEnvelope" VALIDATE CONSTRAINT "RawEnvelope_launch_check";
ALTER TABLE "InboxMessage" VALIDATE CONSTRAINT "InboxMessage_launch_check";
ALTER TABLE "OutboxMessage" VALIDATE CONSTRAINT "OutboxMessage_launch_check";
ALTER TABLE "ApprovalRequest" VALIDATE CONSTRAINT "ApprovalRequest_dual_control_check";
ALTER TABLE "VerificationCase" VALIDATE CONSTRAINT "VerificationCase_launch_check";
ALTER TABLE "GeoCheck" VALIDATE CONSTRAINT "GeoCheck_launch_check";
ALTER TABLE "CustomerSession" VALIDATE CONSTRAINT "CustomerSession_launch_check";
ALTER TABLE "CustomerCommand" VALIDATE CONSTRAINT "CustomerCommand_launch_check";
ALTER TABLE "CustomerQuoteTerms" VALIDATE CONSTRAINT "CustomerQuoteTerms_launch_check";
