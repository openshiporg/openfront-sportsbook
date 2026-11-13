-- Retire the old trial-mode vocabulary from mutable operator data. The in-house operator desk adapters are "house"
-- adapters with INTERNAL certification; contracted providers replace them by installing their own adapter.
-- Immutable evidence tables (AuditEvent, RawEnvelope, JournalEntry, WagerLeg, PriceSnapshot, ...) are NOT touched:
-- their historic text is retained as recorded evidence.

-- 1. Certification enum value.
ALTER TYPE "ProviderConnectionCertificationStatusType" RENAME VALUE 'SANDBOX' TO 'INTERNAL';
ALTER TABLE "ProviderConnection" ALTER COLUMN "certificationStatus" SET DEFAULT 'INTERNAL';

-- 2. Provider installations: house adapters and the card processors.
UPDATE "ProviderConnection"
SET "adapterId" = 'house-' || substr("adapterId", 9),
    "configReference" = 'house:' || substr("configReference", 9)
WHERE "adapterId" LIKE 'sandbox-%';
UPDATE "ProviderConnection" SET "configReference" = 'authorizenet:test' WHERE "configReference" = 'authorizenet:sandbox';
UPDATE "ProviderConnection" SET "configReference" = 'stripe:test', "status" = 'ACTIVE', "failoverPriority" = 10
WHERE "adapterId" = 'stripe' AND "configReference" = 'stripe-checkout-test';
UPDATE "ProviderConnection" SET "capabilities" = "capabilities" - 'mode' WHERE "capabilities" ? 'mode';

-- In-flight payment intents pin their provider snapshot; keep the snapshot equal to the renamed installation.
UPDATE "PaymentIntent" pi
SET "riskEvidence" = jsonb_set(
      jsonb_set(pi."riskEvidence" - 'mode', '{provider,configReference}', to_jsonb(pc."configReference")),
      '{provider,certificationStatus}', '"INTERNAL"')
FROM "ProviderConnection" pc
WHERE pc.id = pi."providerConnection" AND pi."riskEvidence"::text ILIKE '%sandbox%';
UPDATE "PaymentIntent" SET "paymentMethodReference" = 'manual-bank-payout' WHERE "paymentMethodReference" = 'sandbox-tokenized-payout';
UPDATE "PaymentIntent" SET "paymentMethodReference" = 'stripe-card-token' WHERE "paymentMethodReference" = 'sandbox-hosted-token';

-- 3. Fabricated provider-health probe readings are not evidence of anything; remove them.
ALTER TABLE "ProviderHealthSample" DISABLE TRIGGER provider_health_sample_immutable;
DELETE FROM "ProviderHealthSample" WHERE "details"->>'source' = 'sandbox-probe';
ALTER TABLE "ProviderHealthSample" ENABLE TRIGGER provider_health_sample_immutable;

-- 4. Jurisdiction, operator channel, brand domain and onboarding manifest.
UPDATE "Jurisdiction" SET "code" = 'US-NJ' WHERE "code" = 'SANDBOX';
UPDATE "JurisdictionPolicyVersion"
SET "policyDocument" = '{"source": "onboarding", "productionActivation": false}',
    "evidenceHash" = 'd533890b8f89a42605ae0af4d735f0337dc4ce0d42eb9241410a0bd0dc6200f4'
WHERE "evidenceHash" = '1382c6b9ea2a63321601b5b143dfe63c8abca04437118abade06212d95b13327';
UPDATE "OperatorChannel" SET "key" = 'web', "status" = 'ACTIVE', "capabilities" = '{"channel": "web"}' WHERE "key" = 'sandbox-web';
UPDATE "Brand" SET "domain" = 'sportsbook.openship.org' WHERE "domain" = 'sportsbook.local';

-- Onboarding evidence is evidenceHash({fixtureHash, stage}) over the setup input; recompute for the renamed input.
UPDATE "OnboardingProgress" SET "details" = "details" - 'mode' WHERE "details" ? 'mode';
UPDATE "OnboardingProgress"
SET "details" = jsonb_set(jsonb_set(jsonb_set("details",
      '{manifest,input,jurisdictionCode}', '"US-NJ"'),
      '{manifest,input,domain}', '"sportsbook.openship.org"'),
      '{manifest,fixtureHash}', '"3f7e64b28cd1cebb37045db54ea208ba701e3d65c292dc364093c0a8cd0c485c"')
WHERE "details"->'manifest'->>'fixtureHash' = 'd343106a53999675d27b79c1b4e918075d1618fab5f13c0ca7596f5a2b24cb8e';
UPDATE "OnboardingProgress" SET "evidenceHash" = CASE "evidenceHash"
  WHEN '87c909420742b6c955c096ac8399337c1a199187c9969b5f71e0cde4c17652a4' THEN 'f63681cd14befa02cf2e2f10539910bcda7bafb16a1fb9f10e57a37c6719a58a'
  WHEN 'e59664ea3f4e3b03b86765b8d93478554aedea12d83d9616f094b9ab39b02f33' THEN '0bbbb8cb22bf1b97b2805b799d5d0fd93abb608e7eb5424c550fab33de01c8ac'
  WHEN 'ff040d55c0ad125b53461e303e6b577f60222e22e86c30a986c348d906fdcd4a' THEN '5ed2db7098a2b2dc9a284dfffcbd752e4f27b8f67179f4e22ade9f952967eb4b'
  WHEN '7d948c4f3638c8cef44ae55597d7da0b76ed8ae8fb23d41b72b67624151752c3' THEN '9d071ecfa072e4a91c04f21694696b9c29b84d585cd2998c42e3e984628a0ad4'
  WHEN '628c75d5f6816de8f12dd98bbb1817939d52d71b8e21ab71014bf01d6e198b80' THEN 'e6e979f608faaa8fb9b90761529f18e47ddf9fdca5814c82692d5dea6a93e3a2'
  WHEN 'd02b014d266c45ee9695b4e44c4c77538b6a3f167c53e836310606bd5a2c1d3c' THEN 'f8ee09fb5956161752f1e850872de7b44ce1120616b97f9f2957a88a3276e377'
  WHEN 'fb097d1cd6b1024c347848fc149cfe1d1060cc49122733f9c9d66c579fdf13cb' THEN 'c83adee7f6c286d85d79b19a9b1025d438071ae7614c3aeca203d95fd1283201'
  WHEN '45930869bd30e7ad1f868723b469ff481c2b21454f88367104fed687e28272b1' THEN 'dcf0508028fb278a1c3a5b31caf8b784f6f28311f35992f780cfd8e066521e5d'
  WHEN '209594f4ab8a35f6559cbde85a9d1998729ec2fb89dc35c80828582f37f61341' THEN '9f1034f8c971dbfac47a7284ca0fc78222492892faaba802ff1e2464a91488a8'
  ELSE "evidenceHash" END;

-- 5. Configuration, flags, limits, safeguarding, currency names.
UPDATE "ConfigValue" SET "policyVersion" = 'operator-v1' WHERE "policyVersion" ILIKE 'sandbox%';
UPDATE "ConfigDefinition" SET "validationSchema" = '{}' WHERE "validationSchema" ? 'mode';
UPDATE "FeatureFlag" SET "key" = 'wagering.' || substr("key", 9) WHERE "key" LIKE 'sandbox.%';
UPDATE "FeatureFlag" SET "key" = 'wagering.full-structures' WHERE "key" = 'wagering.full-wagering';
UPDATE "LimitProfile" SET "name" = 'Default limits' WHERE "name" = 'Sandbox defaults';
UPDATE "SafeguardingAccount" SET "accountReference" = 'player-funds', "disclosureVersion" = 'disclosure-v1' WHERE "accountReference" = 'sandbox-safeguarding';
UPDATE "CurrencyDefinition" SET "name" = 'US dollar' WHERE "code" = 'USD' AND "name" ILIKE '%sandbox%';
UPDATE "User" SET "name" = 'Sportsbook Admin' WHERE "email" = 'sportsbook@openship.org' AND "name" = 'Demo Admin';

-- 6. Customer terms: the published terms revision is renamed; prior customer consents keep their accepted version.
UPDATE "BrandLocale" SET "termsVersion" = 'terms-v1', "termsContentHash" = 'c341136d66dd90d718b258bf9f7b1eb22600eaa896b9608db3fbeadde17347d1'
WHERE "termsVersion" = 'sandbox-full-v1';

-- 7. Promotions: termsHash = evidenceHash({key, economics, requirements, version}).
UPDATE "Promotion" SET "key" = 'first-play-free-bet', "termsVersion" = 'promotions-v1', "termsHash" = 'f734f86d35bdc7aa75de686396d8ec409b29299e27868cf3c4c2d62a3ce56d21'
WHERE "key" = 'sandbox-free-bet' AND "termsHash" = 'af40d65603c5de34c31f364ecdbc1f89fc55bf46eedc308ae38a32dc190b4993';
UPDATE "Promotion" SET "key" = 'weekend-odds-boost', "termsVersion" = 'promotions-v1', "termsHash" = '8f422fa2ebc3a243c895df74ea922af5b7a9de52a400d26a6e072aae05ed49b6'
WHERE "key" = 'sandbox-odds-boost' AND "termsHash" = 'e72ed59f528066bb6990448b140e78ff459b66d84bc953a4e6cf5acc813c59ca';
UPDATE "Promotion" SET "key" = 'deposit-match', "name" = 'Deposit match', "termsVersion" = 'promotions-v1', "termsHash" = '36ee32a4e8eff055e5831c9dc2ea4ab81ad779e604195fbde2a1ecf2eec9fb45'
WHERE "key" = 'sandbox-deposit-match' AND "termsHash" = '17d78cd6edffe9fabd8dc6422148b33c68206a6a5e6e86768651f598c5148162';

-- 8. Catalog: the cancelled starter fixture.
UPDATE "Competition" SET "key" = 'starter-league', "name" = 'Starter League' WHERE "key" = 'sandbox-league';
UPDATE "Event" SET "externalKey" = 'starter-event', "name" = 'Harbor FC v Test United' WHERE "externalKey" = 'sandbox-event';
UPDATE "Selection" SET "label" = 'Harbor FC' WHERE "label" = 'Sandbox FC';

-- 9. Customer verification records. The old automatic approval is not an operator policy check: clear it so every
-- customer passes the real DOB/age and permitted-country checks again before wagering.
UPDATE "GeoSession" SET "sessionKey" = 'customer:' || substr("sessionKey", 9), "status" = 'REVOKED' WHERE "sessionKey" LIKE 'sandbox:%';
UPDATE "GeoCheck" SET "reasonCode" = 'LEGACY_AUTO_APPROVAL_REVOKED', "decision" = 'UNKNOWN', "coarseEvidence" = "coarseEvidence" - 'mode' - 'method'
WHERE "reasonCode" ILIKE 'SANDBOX%';
UPDATE "VerificationCase" v SET "status" = 'EXPIRED', "expiresAt" = now()
WHERE EXISTS (SELECT 1 FROM "VerificationCheck" c WHERE c."verificationCase" = v.id AND c."reasonCode" ILIKE 'SANDBOX%');
UPDATE "VerificationCase" SET "evidenceReference" = 'customer:' || substr("evidenceReference", 9) WHERE "evidenceReference" LIKE 'sandbox:%';
UPDATE "VerificationCheck" SET "reasonCode" = 'LEGACY_AUTO_APPROVAL_REVOKED' WHERE "reasonCode" ILIKE 'SANDBOX%';
UPDATE "Player" p SET "kycStatus" = 'REQUIRED'
WHERE p."kycStatus" = 'APPROVED' AND NOT EXISTS (
  SELECT 1 FROM "VerificationCase" v WHERE v.player = p.id AND v.type = 'KYC' AND v.status = 'APPROVED');
UPDATE "PlayerIdentity" SET "encryptionKeyRef" = 'derived:session-secret' WHERE "encryptionKeyRef" = 'sandbox:derived-key';

-- 10. House rules: the comprehensive rule becomes 'house-rules' (the name onboarding now creates). Its semantic hash
-- and the dual-control approval that admitted it are evidenceHash({action,name,sportKey,marketDefinitionKey,rules,
-- effectiveFrom}); both are recomputed for the new name with every other field unchanged.
UPDATE "HouseRuleVersion" SET "name" = 'house-rules', "semanticHash" = CASE "version"
  WHEN 1 THEN '4888f62ec634e36646149363e5fbfaf16b02d12c34113f4347b96be26d07fec8'
  WHEN 2 THEN '1375e5c91c711b013efee97d224aefe70fd052618615bc456b67853dadb5c35c'
  WHEN 3 THEN 'f5686d07b711a88cb4e8c91c39f1cc2476312aaf0bcc4d37026a12f6f2a393f6' END
WHERE "name" = 'sandbox-comprehensive' AND "version" IN (1, 2, 3);
UPDATE "ApprovalRequest" SET "action" = 'HOUSE_RULE:house-rules',
  "requestPayload" = jsonb_set("requestPayload", '{name}', '"house-rules"'),
  "payloadHash" = CASE "payloadHash"
    WHEN '6be18da56081d6cf28f958c60d7a6e1aa1ec8c80842efddc68f954696c01793d' THEN '1375e5c91c711b013efee97d224aefe70fd052618615bc456b67853dadb5c35c'
    WHEN '18bd590f197c9c34447028c19a94f36dea924dfe5b810089053fc5b3f1771ac2' THEN 'f5686d07b711a88cb4e8c91c39f1cc2476312aaf0bcc4d37026a12f6f2a393f6' END
WHERE "action" = 'HOUSE_RULE:sandbox-comprehensive'
  AND "payloadHash" IN ('6be18da56081d6cf28f958c60d7a6e1aa1ec8c80842efddc68f954696c01793d', '18bd590f197c9c34447028c19a94f36dea924dfe5b810089053fc5b3f1771ac2');
