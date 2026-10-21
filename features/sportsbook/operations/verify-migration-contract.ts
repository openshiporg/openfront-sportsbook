import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { PrismaClient } from '../../keystone/prisma'
import { retainedStarterTableNames } from '../../keystone/prisma-contract'

export const protectedIndexes = [
  ['ApiRateBucket_active_key_uq', 'ApiRateBucket', true, ['coalesce(tenant', 'keyhash', 'scope', 'windowstartedat']],
  ['BalanceProjection_account_version_uq', 'BalanceProjection', true, ['tenant', 'account', 'version']],
  ['CustomerCommand_commandKey_key', 'CustomerCommand', true, ['commandkey']],
  ['CustomerQuoteTerms_quoteKey_key', 'CustomerQuoteTerms', true, ['quotekey']],
  ['Hold_tenant_purpose_key', 'Hold', true, ['tenant', 'purposetype', 'purposeid']],
  ['InboxMessage_tenant_message_key', 'InboxMessage', true, ['tenant', 'messagekey']],
  ['JournalTransaction_tenant_idempotency_key', 'JournalTransaction', true, ['tenant', 'idempotencykey']],
  ['JournalTransaction_tenant_reversal_uq', 'JournalTransaction', true, ['tenant', 'reversalof']],
  ['OutboxMessage_claim_idx', 'OutboxMessage', false, ['status', 'availableat', 'leaseuntil']],
  ['PaymentIntent_tenant_idempotency_key', 'PaymentIntent', true, ['tenant', 'idempotencykey']],
  ['PriceSnapshot_current_idx', 'PriceSnapshot', false, ['selection', 'receivedat desc']],
  ['PriceSnapshot_selection_sequence_uq', 'PriceSnapshot', true, ['tenant', 'selection', 'sequence']],
  ['ProviderEntityMapping_external_uq', 'ProviderEntityMapping', true, ['tenant', 'providerconnection', 'entitytype', 'externalid']],
  ['ResultVersion_event_version_uq', 'ResultVersion', true, ['tenant', 'event', 'version']],
  ['Settlement_tenant_input_uq', 'Settlement', true, ['tenant', 'inputhash']],
  ['Settlement_tenant_reversal_uq', 'Settlement', true, ['tenant', 'reversalof']],
  ['Settlement_wager_version_uq', 'Settlement', true, ['tenant', 'wager', 'version']],
  ['Wager_tenant_idempotency_key', 'Wager', true, ['tenant', 'idempotencykey']],
  ['WebhookReplay_connection_hash_uq', 'WebhookReplay', true, ['providerconnection', 'messagehash']],
  ['LegalEntity_registration_uq', 'LegalEntity', true, ['tenant', 'countrycode', 'registrationreference']],
  ['TenantCurrency_currency_uq', 'TenantCurrency', true, ['tenant', 'currency']],
  ['JurisdictionPolicyVersion_scope_version_uq', 'JurisdictionPolicyVersion', true, ['tenant', 'jurisdiction', 'version']],
  ['HouseRuleVersion_name_version_uq', 'HouseRuleVersion', true, ['tenant', 'name', 'version']],
  ['FeatureFlag_scope_uq', 'FeatureFlag', true, ['tenant', 'key', 'scopetype', 'scopeid']],
  ['ConfigDefinition_key_uq', 'ConfigDefinition', true, ['tenant', 'key']],
  ['BrandLocale_terms_uq', 'BrandLocale', true, ['tenant', 'brand', 'locale', 'termsversion']],
  ['OperatorChannel_key_uq', 'OperatorChannel', true, ['tenant', 'key']],
  ['Region_key_uq', 'Region', true, ['tenant', 'key']],
  ['Season_competition_key_uq', 'Season', true, ['tenant', 'competition', 'key']],
  ['CompetitionStage_season_key_uq', 'CompetitionStage', true, ['tenant', 'season', 'key']],
  ['Venue_key_uq', 'Venue', true, ['tenant', 'key']],
  ['MarketDefinition_key_version_uq', 'MarketDefinition', true, ['tenant', 'key', 'version']],
  ['CorrelationGroup_key_version_uq', 'CorrelationGroup', true, ['tenant', 'key', 'version']],
  ['WagerPart_wager_index_uq', 'WagerPart', true, ['tenant', 'wager', 'partindex']],
  ['SettlementRun_input_uq', 'SettlementRun', true, ['tenant', 'inputhash']],
  ['CashOutAcceptance_idempotency_uq', 'CashOutAcceptance', true, ['tenant', 'idempotencykey']],
  ['CashOutAcceptance_reversal_parent_uq', 'CashOutAcceptance', true, ['tenant', 'reversalof', 'where', 'is not null']],
  ['Promotion_key_uq', 'Promotion', true, ['tenant', 'key']],
  ['PromotionRuleVersion_promotion_version_uq', 'PromotionRuleVersion', true, ['tenant', 'promotion', 'version']],
  ['BonusAward_idempotency_uq', 'BonusAward', true, ['tenant', 'idempotencykey']],
  ['BonusTransaction_idempotency_uq', 'BonusTransaction', true, ['tenant', 'idempotencykey']],
  ['PromotionRedemption_player_key_uq', 'PromotionRedemption', true, ['tenant', 'player', 'promotion', 'idempotencykey']],
  ['CustomerFavorite_target_uq', 'CustomerFavorite', true, ['tenant', 'player', 'targettype', 'targetid']],
  ['CustomerQuoteLegTerms_quote_index_uq', 'CustomerQuoteLegTerms', true, ['quotekey', 'legindex']],
  ['ScheduledJob_idempotency_uq', 'ScheduledJob', true, ['tenant', 'idempotencykey']],
  ['ScheduledJob_claim_idx', 'ScheduledJob', false, ['status', 'dueat', 'leaseuntil']],
  ['AffiliateAttribution_campaign_uq', 'AffiliateAttribution', true, ['tenant', 'player', 'campaignreference']],
  ['PamSubjectMapping_subject_uq', 'PamSubjectMapping', true, ['tenant', 'providerconnection', 'externalsubjectdigest']],
  ['WebhookEndpoint_url_uq', 'WebhookEndpoint', true, ['tenant', 'url']],
  ['WebhookDelivery_delivery_uq', 'WebhookDelivery', true, ['tenant', 'deliveryid']],
  ['WebhookDelivery_claim_idx', 'WebhookDelivery', false, ['status', 'availableat']],
  ['IntegrationDeliveryAttempt_number_uq', 'IntegrationDeliveryAttempt', true, ['tenant', 'delivery', 'attempt']],
  ['Brand_domain_uq', 'Brand', true, ['domain']],
  ['TenantCurrency_one_default_uq', 'TenantCurrency', true, ['tenant', 'where', 'defaultforbrand = true', 'status = active']],
  ['WagerExposureAllocation_wager_market_uq', 'WagerExposureAllocation', true, ['tenant', 'wager', 'market']],
  ['ScreeningHit_provider_match_uq', 'ScreeningHit', true, ['tenant', 'providerconnection', 'screeningtype', 'matchtoken']],
  ['WorkerHeartbeat_workerId_key', 'WorkerHeartbeat', true, ['workerid']],
] as const

export const protectedChecks = [
  ['AcceptanceDecision_launch_check', 'AcceptanceDecision', ['tenant is not null', 'wager is not null', 'quote is not null', 'length(inputhash) >= 32']],
  ['ApprovalRequest_dual_control_check', 'ApprovalRequest', ['pending', 'expired', 'approved', 'rejected', 'approverid <> requesterid']],
  ['BalanceProjection_launch_check', 'BalanceProjection', ['tenant is not null', 'account is not null', 'availableminor', 'pendingminor', 'version > 0', 'asof is not null']],
  ['CustomerCommand_launch_check', 'CustomerCommand', ['tenant is not null', 'player is not null', 'length(idempotencykey) >= 8', 'length(requesthash) >= 32']],
  ['CustomerQuoteTerms_launch_check', 'CustomerQuoteTerms', ['tenant is not null', 'player is not null', 'quote is not null', 'stakeminor', 'potentialreturnminor', 'length(termshash) >= 32']],
  ['CustomerSession_launch_check', 'CustomerSession', ['tenant is not null', 'player is not null', 'length(tokendigest) = 64', 'expiresat is not null']],
  ['GeoCheck_launch_check', 'GeoCheck', ['tenant is not null', 'geosession is not null', 'providerconnection is not null', 'checkedat is not null']],
  ['Hold_launch_check', 'Hold', ['tenant is not null', 'account is not null', 'amountminor', 'length(purposetype) > 0', 'length(purposeid) > 0', 'version > 0']],
  ['InboxMessage_launch_check', 'InboxMessage', ['tenant is not null', 'rawenvelope is not null', 'length(messagekey) > 0', 'length(type) > 0', 'attempts >= 0']],
  ['JournalEntry_launch_check', 'JournalEntry', ['tenant is not null', 'transaction is not null', 'account is not null', 'amountminor', 'length(currency) = 3']],
  ['JournalTransaction_launch_check', 'JournalTransaction', ['tenant is not null', 'length(idempotencykey) >= 8', 'length(correlationid) > 0', 'effectiveat is not null']],
  ['OutboxMessage_launch_check', 'OutboxMessage', ['tenant is not null', 'length(aggregatetype) > 0', 'length(aggregateid) > 0', 'length(eventtype) > 0', 'attempts >= 0', 'maxattempts > 0']],
  ['PaymentIntent_launch_check', 'PaymentIntent', ['tenant is not null', 'player is not null', 'providerconnection is not null', 'amountminor', 'length(currency) = 3', 'length(idempotencykey) >= 8']],
  ['PriceSnapshot_launch_check', 'PriceSnapshot', ['tenant is not null', 'selection is not null', 'providerconnection is not null', 'decimalodds', 'length(sequence) > 0', 'effectiveat is not null', 'receivedat is not null']],
  ['Quote_launch_check', 'Quote', ['tenant is not null', 'player is not null', 'selection is not null', 'pricesnapshot is not null', 'stakeminor', 'decimalodds', 'length(currency) = 3', 'length(termshash) >= 32', 'expiresat is not null']],
  ['RawEnvelope_launch_check', 'RawEnvelope', ['tenant is not null', 'providerconnection is not null', 'length(externalid) > 0', 'length(schemaversion) > 0', 'length(payloadhash) >= 32', 'receivedat is not null']],
  ['ResultVersion_launch_check', 'ResultVersion', ['tenant is not null', 'event is not null', 'providerconnection is not null', 'version > 0', 'length(payloadhash) >= 8']],
  ['Settlement_launch_check', 'Settlement', ['tenant is not null', 'wager is not null', 'resultversion is not null', 'journaltransaction is not null', 'version > 0', 'payoutminor', 'length(inputhash) >= 8']],
  ['VerificationCase_launch_check', 'VerificationCase', ['tenant is not null', 'player is not null', 'providerconnection is not null']],
  ['Wager_launch_check', 'Wager', ['tenant is not null', 'player is not null', 'quote is not null', 'length(idempotencykey) >= 8', 'stakeminor', 'potentialreturnminor', 'length(currency) = 3', 'length(termshash) >= 32']],
  ['WagerLeg_launch_check', 'WagerLeg', ['tenant is not null', 'wager is not null', 'length(eventkey) > 0', 'length(marketkey) > 0', 'length(selectionkey) > 0', 'length(snapshotid) > 0', 'decimalodds']],
  ['Wager_full_contract_check', 'Wager', ['version > 0', 'livedelayms >= 0', 'stakeminor', 'potentialreturnminor', 'maxpayoutminor']],
  ['Quote_full_contract_check', 'Quote', ['legcount > 0', 'partcount > 0', 'livedelayms >= 0', 'potentialreturnminor']],
  ['WagerPart_economic_check', 'WagerPart', ['partindex >= 0', 'stakeminor', 'potentialreturnminor', 'decimalodds']],
  ['CashOutOffer_economic_check', 'CashOutOffer', ['amountminor', 'portionnumerator', 'portiondenominator', 'feeminor']],
  ['CashOutAcceptance_economic_check', 'CashOutAcceptance', ['amountminor', 'portionnumerator', 'portiondenominator', 'wagerversion > 0', 'length(idempotencykey) >= 8', 'length(evidencehash) = 64']],
  ['SettlementLine_amount_check', 'SettlementLine', ['amountminor', 'residualminor', 'scale >= 0']],
  ['Promotion_budget_check', 'Promotion', ['budgetminor', 'length(currency) = 3', 'startsat < endsat', 'length(termshash) = 64']],
  ['CampaignBudget_economic_check', 'CampaignBudget', ['allocatedminor', 'awardedminor', 'redeemedminor', 'forfeitedminor', 'version > 0']],
  ['BonusAward_economic_check', 'BonusAward', ['amountminor', 'remainingminor', 'length(currency) = 3', 'length(idempotencykey) >= 8', 'length(evidencehash) = 64']],
  ['BonusTransaction_economic_check', 'BonusTransaction', ['amountminor', 'remainingminor', 'length(currency) = 3', 'length(idempotencykey) >= 8', 'length(evidencehash) = 64']],
  ['SafeguardingReconciliation_amount_check', 'SafeguardingReconciliation', ['safeguardedassetminor', 'playerliabilityminor', 'differenceminor']],
  ['LedgerAdjustmentRequest_amount_check', 'LedgerAdjustmentRequest', ['amountminor', 'length(currency) = 3']],
  ['TaxRuleVersion_rate_check', 'TaxRuleVersion', ['ratenumerator', 'ratedenominator', 'version > 0']],
  ['ScheduledJob_attempt_check', 'ScheduledJob', ['attempts >= 0', 'maxattempts > 0', 'length(idempotencykey) >= 8']],
  ['WebhookEndpoint_security_check', 'WebhookEndpoint', ['https://', 'length(name) > 0', 'length(secretreference) > 0', 'failurecount >= 0']],
  ['WebhookDelivery_evidence_check', 'WebhookDelivery', ['length(deliveryid) >= 8', 'length(eventtype) > 0', 'length(eventversion) > 0', 'length(payloadhash) = 64', 'attempts >= 0']],
  ['IntegrationDeliveryAttempt_number_check', 'IntegrationDeliveryAttempt', ['attempt > 0', 'latencyms >= 0']],
  ['WagerExposureAllocation_economic_check', 'WagerExposureAllocation', ['stakeminor', 'liabilityminor', 'remainingstakeminor', 'remainingliabilityminor', 'version > 0']],
  ['ScreeningHit_evidence_check', 'ScreeningHit', ['length(matchtoken) = 64', 'length(evidencereference) > 0', 'screenedat is not null', 'resolvedat is not null']],
  ['WorkerHeartbeat_state_check', 'WorkerHeartbeat', ['heartbeatat >= startedat', 'length(workerid) >= 8', 'length(buildversion) > 0', 'stoppedat is not null']],
  ['User_operator_mfa_check', 'User', ['operatormfafailedattempts >= 0', 'totp:v1:', 'operatormfaenabled = false', 'operatormfaenrolledat is not null']],
] as const

export const protectedTriggers = [
  ['acceptance_decision_immutable', 'AcceptanceDecision', 'sportsbook_deny_evidence_mutation', ['before delete or update']],
  ['audit_anchor_immutable', 'AuditAnchor', 'sportsbook_deny_evidence_mutation', ['before delete or update']],
  ['audit_chain_insert', 'AuditEvent', 'sportsbook_check_audit_chain', ['before insert']],
  ['audit_event_immutable', 'AuditEvent', 'sportsbook_deny_evidence_mutation', ['before delete or update']],
  ['customer_quote_terms_immutable', 'CustomerQuoteTerms', 'sportsbook_deny_evidence_mutation', ['before delete or update']],
  ['journal_balance_deferred', 'JournalEntry', 'sportsbook_check_journal_balance', ['after insert or delete or update', 'deferrable initially deferred']],
  ['journal_reversal_entries_immutable', 'JournalEntry', 'sportsbook_check_journal_reversal_entries', ['after insert', 'deferrable initially deferred']],
  ['journal_entry_immutable', 'JournalEntry', 'sportsbook_deny_financial_mutation', ['before delete or update']],
  ['journal_reversal_lineage', 'JournalTransaction', 'sportsbook_assert_journal_reversal', ['before insert']],
  ['journal_transaction_immutable', 'JournalTransaction', 'sportsbook_deny_evidence_mutation', ['before delete or update']],
  ['leg_grade_immutable', 'LegGrade', 'sportsbook_deny_evidence_mutation', ['before delete or update']],
  ['market_grade_immutable', 'MarketGrade', 'sportsbook_deny_evidence_mutation', ['before delete or update']],
  ['price_snapshot_immutable', 'PriceSnapshot', 'sportsbook_deny_evidence_mutation', ['before delete or update']],
  ['raw_envelope_immutable', 'RawEnvelope', 'sportsbook_deny_evidence_mutation', ['before delete or update']],
  ['wager_leg_immutable', 'WagerLeg', 'sportsbook_deny_evidence_mutation', ['before delete or update']],
  ['customer_quote_leg_terms_immutable', 'CustomerQuoteLegTerms', 'sportsbook_deny_evidence_mutation', ['before delete or update']],
  ['settlement_correction_lineage', 'Settlement', 'sportsbook_assert_settlement_correction', ['before insert']],
  ['settlement_correction_grade_versions', 'Settlement', 'sportsbook_assert_settlement_grade_versions', ['after insert', 'deferrable initially deferred']],
  ['settlement_line_correction_grade_versions', 'SettlementLine', 'sportsbook_assert_settlement_grade_versions', ['after insert', 'deferrable initially deferred']],
  ['settlement_immutable', 'Settlement', 'sportsbook_deny_evidence_mutation', ['before delete or update']],
  ['settlement_line_immutable', 'SettlementLine', 'sportsbook_deny_evidence_mutation', ['before delete or update']],
  ['result_version_approval_evidence_insert', 'ResultVersion', 'sportsbook_guard_result_version_mutation', ['before insert']],
  ['result_version_immutable', 'ResultVersion', 'sportsbook_guard_result_version_mutation', ['before delete or update']],
  ['cashout_acceptance_immutable', 'CashOutAcceptance', 'sportsbook_deny_evidence_mutation', ['before delete or update']],
  ['cashout_acceptance_reversal_lineage', 'CashOutAcceptance', 'sportsbook_assert_cashout_reversal', ['before insert']],
  ['bonus_transaction_immutable', 'BonusTransaction', 'sportsbook_deny_financial_mutation', ['before delete or update']],
  ['promotion_redemption_immutable', 'PromotionRedemption', 'sportsbook_deny_evidence_mutation', ['before delete or update']],
  ['provider_health_sample_immutable', 'ProviderHealthSample', 'sportsbook_deny_evidence_mutation', ['before delete or update']],
  ['safeguarding_reconciliation_immutable', 'SafeguardingReconciliation', 'sportsbook_deny_financial_mutation', ['before delete or update']],
  ['report_artifact_immutable', 'ReportArtifact', 'sportsbook_deny_evidence_mutation', ['before delete or update']],
  ['wager_part_tenant_reference', 'WagerPart', 'sportsbook_assert_tenant_reference', ['before insert or update']],
  ['cashout_offer_tenant_reference', 'CashOutOffer', 'sportsbook_assert_tenant_reference', ['before insert or update']],
  ['cashout_acceptance_tenant_reference', 'CashOutAcceptance', 'sportsbook_assert_tenant_reference', ['before insert or update']],
  ['bonus_award_player_tenant_reference', 'BonusAward', 'sportsbook_assert_tenant_reference', ['before insert or update']],
  ['promotion_redemption_player_tenant_reference', 'PromotionRedemption', 'sportsbook_assert_tenant_reference', ['before insert or update']],
  ['customer_credential_tenant_reference', 'CustomerCredential', 'sportsbook_assert_tenant_reference', ['before insert or update']],
  ['customer_favorite_tenant_reference', 'CustomerFavorite', 'sportsbook_assert_tenant_reference', ['before insert or update']],
  ['support_case_tenant_reference', 'SupportCase', 'sportsbook_assert_tenant_reference', ['before insert or update']],
  ['webhook_delivery_tenant_reference', 'WebhookDelivery', 'sportsbook_assert_tenant_reference', ['before insert or update']],
  ['integration_delivery_attempt_tenant_reference', 'IntegrationDeliveryAttempt', 'sportsbook_assert_tenant_reference', ['before insert or update']],
  ['integration_delivery_attempt_immutable', 'IntegrationDeliveryAttempt', 'sportsbook_deny_evidence_mutation', ['before delete or update']],
  ['webhook_delivery_final_immutable', 'WebhookDelivery', 'sportsbook_protect_final_delivery', ['before delete or update']],
  ['wager_exposure_wager_tenant_reference', 'WagerExposureAllocation', 'sportsbook_assert_tenant_reference', ['before insert or update']],
  ['wager_exposure_market_tenant_reference', 'WagerExposureAllocation', 'sportsbook_assert_tenant_reference', ['before insert or update']],
  ['screening_hit_aml_tenant_reference', 'ScreeningHit', 'sportsbook_assert_tenant_reference', ['before insert or update']],
  ['screening_hit_provider_tenant_reference', 'ScreeningHit', 'sportsbook_assert_tenant_reference', ['before insert or update']],
  ['screening_hit_delete_prohibited', 'ScreeningHit', 'sportsbook_deny_evidence_delete', ['before delete']],
] as const

const protectedFunctions = [
  ['sportsbook_check_audit_chain', ['previoushash', 'expected', 'invalid audit chain']],
  ['sportsbook_check_journal_balance', ['imbalance', 'currencies', 'unbalanced or cross-currency journal']],
  ['sportsbook_deny_evidence_mutation', ['raise exception', 'sportsbook evidence is append-only']],
  ['sportsbook_deny_financial_mutation', ['raise exception', 'sportsbook financial evidence is append-only']],
  ['sportsbook_assert_journal_reversal', ['journal reversal must retain its tenant and correlation', 'journal reversal parent is missing']],
  ['sportsbook_assert_settlement_correction', ['parent_version + 1', 'tenant and wager', 'cannot regress its result version']],
  ['sportsbook_assert_settlement_grade_versions', ['wager-leg result version', 'requires a newer result version', 'approved tenant-bound grades', 'approvedat is not null']],
  ['sportsbook_assert_tenant_reference', ['expected_tenant', 'referenced_tenant', 'cross-tenant relationship rejected']],
  ['sportsbook_guard_result_version_mutation', ['result version facts are immutable', 'approval evidence is immutable', 'approved result version requires approval evidence', 'result version evidence is append-only']],
  ['sportsbook_check_journal_reversal_entries', ['exactly negate the original ledger transaction', 'reversalof']],
  ['sportsbook_assert_cashout_reversal', ['CASHOUT_CORRECTION_REQUIRES_SETTLEMENT_CORRECTION', 'CASH_OUT_AFTER_SETTLEMENT_UNSUPPORTED', 'cash-out reversal parent is missing', 'cash-out reversal must retain parent economics and scope', 'cash-out reversal journal must reverse the accepted journal']],
  ['sportsbook_protect_final_delivery', ['old.status', 'delivered', 'final webhook delivery evidence is immutable']],
  ['sportsbook_deny_evidence_delete', ['raise exception', 'sportsbook evidence deletion is prohibited']],
] as const

const protectedMigrationHashes: Record<string, string> = {
  '20260817175949_sportsbook_backend_core/migration.sql': '0461179c8a0f0a3400330146e31c4a37d33efd96d253f3d501dc409c35c6b895',
  '20260818123000_launch_invariants/migration.sql': 'dfdcfdc2dc01e507bfedb72ab4f797aeb4b45d1daa2841d395f502724ff5ff68',
  '20260818124000_remove_todo_runtime/migration.sql': 'cbbb621ff40ea860c3d4d606dc9e976279b2eb655c459455899d859e72cb08bb',
  '20260819182234_full_sportsbook_capabilities/migration.sql': '75a4649394241153f8d62d112904d552d844f40bffb0b2cea6188f1643008960',
  '20260819182300_full_wager_pending_default/migration.sql': '014002be862367906d14bc463a7a9aa41b196718f569f3ed43f005c6c40fb5a9',
  '20260819183000_full_product_invariants/migration.sql': '8bea569846ae2b8a553867a9e01b0571bb1c356a883d9425f951719af6351d04',
  '20260819211000_outbound_webhook_invariants/migration.sql': '5a787dd3a25d208a84a91ced04f08f64bcbf76260f846104186c64f091a5445e',
  '20260819213100_full_tenant_currency_default/migration.sql': '6d82b3eb45b0993c128bd7db202eade9c25407c44617436bb5d1868fbf335e61',
  '20260819220000_wager_exposure_allocations/migration.sql': '0cc76756874c7c66f74f1ee4e7f781ccad269df06b61bdb308893a68f4e49356',
  '20260819221000_wager_exposure_invariants/migration.sql': 'b8fdd7bcd78af1259ac5b09839f24697888e26cae8c6736b3927219648af6733',
  '20260819222000_rebuild_exposure_projection/migration.sql': '66ab808bd5dd33d823ec46da5e4577466c7aef506851978d4bd1ad94c6f9c3aa',
  '20260819224000_compliance_screening_invariants/migration.sql': 'a707202fb44f74c4b9de9aea59bb9fa7efe5903cc0e97ae00a3efe6e79754bdd',
  '20260819225100_worker_heartbeat_invariants/migration.sql': 'aae28bcea15e5d8a81e5c80e36f44daf9aaf6095d30dffa698f080cd82562b29',
  '20260819230100_operator_mfa_invariants/migration.sql': '346a53eb3c4a3578082cb6935c6888201a6831136b77ebbe44e7feadf5904928',
  '20260923104000_result_approval_evidence/migration.sql': 'f791b3c94e21173e4a7b277644fcfa24af8bdcb225dcd766a39409f1c7d6c037',
}

const canonical = (value: string) => value.toLowerCase().replace(/["']/g, '').replace(/public\./g, '').replace(/\s+/g, ' ')
const stripComments = (sql: string) => sql.replace(/--.*$/gm, '')

export function assertEphemeralDatabaseUrl(value: string | undefined, label: string) {
  assert.ok(value, `${label} is required`)
  const database = decodeURIComponent(new URL(value).pathname.slice(1))
  const approvedRuntimeEphemeral = /^runtime_sportsbook_[a-z0-9_]*_ephemeral_[a-z0-9_]+$/i.test(database)
  const approvedBatch5Disposable = /^openfront_sportsbook_batch5_\d{8}_\d{6}_[a-f0-9]{10}(?:_shadow)?$/i.test(database)
  assert.ok(approvedRuntimeEphemeral || approvedBatch5Disposable, `${label} must name an approved runtime sportsbook ephemeral DB or unique openfront_sportsbook_batch5 rehearsal DB`)
  return database
}

export function findUnsafeMigrationStatements(migrationsDir = resolve('migrations')) {
  for (const [relative, expected] of Object.entries(protectedMigrationHashes)) {
    const actual = createHash('sha256').update(readFileSync(resolve(migrationsDir, relative))).digest('hex')
    assert.equal(actual, expected, `Protected custom-DDL migration changed in place: ${relative}`)
  }

  const protectedNames = [
    ...protectedIndexes.map(item => item[0]),
    ...protectedChecks.map(item => item[0]),
    ...protectedTriggers.map(item => item[0]),
    ...protectedFunctions.map(item => item[0]),
    ...protectedIndexes.map(item => item[1]),
    ...protectedChecks.map(item => item[1]),
    ...retainedStarterTableNames,
  ].map(name => canonical(name))
  const protectedPatterns = protectedNames.map(name => new RegExp(`(^|[^a-z0-9_])${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z0-9_]|$)`))
  const findings: string[] = []
  const migrationDirs = readdirSync(migrationsDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && entry.name > '20260818123000_launch_invariants')
    .sort((a, b) => a.name.localeCompare(b.name))

  for (const entry of migrationDirs) {
    const relative = `${entry.name}/migration.sql`
    if (relative in protectedMigrationHashes) continue
    const sql = stripComments(readFileSync(resolve(migrationsDir, relative), 'utf8'))
    for (const statement of sql.split(';').map(value => value.trim()).filter(Boolean)) {
      const normalized = canonical(statement)
      const destructive = /\bdrop\s+(table|index|trigger|function|column|constraint)\b|\btruncate\b|\bdelete\s+from\b|\bdisable\s+trigger\b|\brename\s+to\b|\bcreate\s+or\s+replace\s+function\b/.test(normalized)
      if (destructive && protectedPatterns.some(pattern => pattern.test(normalized))) {
        findings.push(`${entry.name}: ${statement.replace(/\s+/g, ' ').slice(0, 240)}`)
      }
    }
  }
  return findings
}

type IndexRow = { name: string; tableName: string; isUnique: boolean; definition: string }
type ConstraintRow = { name: string; tableName: string; type: string; validated: boolean; definition: string }
type TriggerRow = { name: string; tableName: string; enabled: string; definition: string }

export async function verifyDatabaseMigrationContract(prisma: PrismaClient) {
  const indexes = await prisma.$queryRaw<IndexRow[]>`
    SELECT index_class.relname AS name, table_class.relname AS "tableName",
           index_meta.indisunique AS "isUnique", pg_get_indexdef(index_meta.indexrelid) AS definition
    FROM pg_index index_meta
    JOIN pg_class index_class ON index_class.oid = index_meta.indexrelid
    JOIN pg_class table_class ON table_class.oid = index_meta.indrelid
    JOIN pg_namespace namespace ON namespace.oid = table_class.relnamespace
    WHERE namespace.nspname = 'public'
  `
  for (const [name, tableName, unique, fragments] of protectedIndexes) {
    const row = indexes.find(item => item.name === name)
    assert.ok(row, `Protected index is missing: ${name}`)
    assert.equal(row.tableName, tableName, `Protected index moved tables: ${name}`)
    assert.equal(row.isUnique, unique, `Protected index uniqueness changed: ${name}`)
    const definition = canonical(row.definition)
    for (const fragment of fragments) assert.ok(definition.includes(canonical(fragment)), `Protected index definition changed: ${name} lacks ${fragment}`)
  }

  const constraints = await prisma.$queryRaw<ConstraintRow[]>`
    SELECT constraint_meta.conname AS name, table_class.relname AS "tableName",
           constraint_meta.contype::text AS type, constraint_meta.convalidated AS validated,
           pg_get_constraintdef(constraint_meta.oid) AS definition
    FROM pg_constraint constraint_meta
    JOIN pg_class table_class ON table_class.oid = constraint_meta.conrelid
    JOIN pg_namespace namespace ON namespace.oid = table_class.relnamespace
    WHERE namespace.nspname = 'public'
  `
  for (const [name, tableName, fragments] of protectedChecks) {
    const row = constraints.find(item => item.name === name)
    assert.ok(row, `Protected check is missing: ${name}`)
    assert.equal(row.tableName, tableName, `Protected check moved tables: ${name}`)
    assert.equal(row.type, 'c', `Protected constraint is not a check: ${name}`)
    assert.equal(row.validated, true, `Protected check is not validated: ${name}`)
    const definition = canonical(row.definition)
    for (const fragment of fragments) assert.ok(definition.includes(canonical(fragment)), `Protected check definition changed: ${name} lacks ${fragment}`)
  }
  const retainedPrimaryKey = constraints.find(item => item.name === '_Todo_todoImages_AB_pkey')
  assert.ok(retainedPrimaryKey && retainedPrimaryKey.type === 'p' && retainedPrimaryKey.validated, 'Retained starter link primary key is missing')

  const triggers = await prisma.$queryRaw<TriggerRow[]>`
    SELECT trigger_meta.tgname AS name, table_class.relname AS "tableName",
           trigger_meta.tgenabled::text AS enabled, pg_get_triggerdef(trigger_meta.oid) AS definition
    FROM pg_trigger trigger_meta
    JOIN pg_class table_class ON table_class.oid = trigger_meta.tgrelid
    JOIN pg_namespace namespace ON namespace.oid = table_class.relnamespace
    WHERE namespace.nspname = 'public' AND NOT trigger_meta.tgisinternal
  `
  for (const [name, tableName, functionName, fragments] of protectedTriggers) {
    const row = triggers.find(item => item.name === name)
    assert.ok(row, `Protected trigger is missing: ${name}`)
    assert.equal(row.tableName, tableName, `Protected trigger moved tables: ${name}`)
    assert.equal(row.enabled, 'O', `Protected trigger is disabled: ${name}`)
    const definition = canonical(row.definition)
    assert.ok(definition.includes(canonical(functionName)), `Protected trigger function changed: ${name}`)
    for (const fragment of fragments) assert.ok(definition.includes(canonical(fragment)), `Protected trigger definition changed: ${name} lacks ${fragment}`)
  }

  const functions = await prisma.$queryRaw<Array<{ name: string; definition: string }>>`
    SELECT routine.proname AS name, pg_get_functiondef(routine.oid) AS definition
    FROM pg_proc routine
    JOIN pg_namespace namespace ON namespace.oid = routine.pronamespace
    WHERE namespace.nspname = 'public'
  `
  for (const [name, fragments] of protectedFunctions) {
    const row = functions.find(item => item.name === name)
    assert.ok(row, `Protected function is missing: ${name}`)
    const definition = canonical(row.definition)
    for (const fragment of fragments) assert.ok(definition.includes(canonical(fragment)), `Protected function definition changed: ${name} lacks ${fragment}`)
  }

  const tables = await prisma.$queryRaw<Array<{ name: string }>>`
    SELECT table_name AS name FROM information_schema.tables WHERE table_schema = 'public'
  `
  for (const name of retainedStarterTableNames) assert.ok(tables.some(item => item.name === name), `Retained upgrade table is missing: ${name}`)

  const migrationFolders = readdirSync(resolve('migrations'), { withFileTypes: true }).filter(entry => entry.isDirectory()).map(entry => entry.name).sort()
  const applied = await prisma.$queryRaw<Array<{ migrationName: string }>>`
    SELECT migration_name AS "migrationName" FROM "_prisma_migrations"
    WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL ORDER BY migration_name
  `
  assert.deepEqual(applied.map(item => item.migrationName), migrationFolders, 'Database does not contain exactly the repository migration chain')

  return {
    migrations: applied.length,
    indexes: protectedIndexes.length,
    checks: protectedChecks.length,
    triggers: protectedTriggers.length,
    functions: protectedFunctions.length,
    retainedTables: retainedStarterTableNames.length,
  }
}

export function verifyGeneratedMigrationDiff(_shadowDatabaseUrl: string) {
  const command = spawnSync(process.execPath, [
    resolve('node_modules/prisma/build/index.js'), 'migrate', 'diff',
    '--from-migrations', 'migrations',
    '--to-schema', 'schema.prisma',
    '--script',
  ], { cwd: resolve('.'), encoding: 'utf8', env: process.env })
  assert.equal(command.status, 0, `prisma migrate diff failed:\n${command.stderr || command.stdout}`)
  const executableSql = stripComments(command.stdout).trim()
  assert.equal(executableSql, '', `Generated schema has executable migration drift:\n${command.stdout}`)
  return command.stdout.trim()
}

async function main() {
  const target = assertEphemeralDatabaseUrl(process.env.DATABASE_URL, 'DATABASE_URL')
  const shadow = assertEphemeralDatabaseUrl(process.env.MIGRATION_SHADOW_DATABASE_URL, 'MIGRATION_SHADOW_DATABASE_URL')
  assert.notEqual(target, shadow, 'Migration shadow and target databases must differ')
  const unsafe = findUnsafeMigrationStatements()
  assert.deepEqual(unsafe, [], `Protected custom DDL is targeted by later migrations:\n${unsafe.join('\n')}`)
  const diff = verifyGeneratedMigrationDiff(process.env.MIGRATION_SHADOW_DATABASE_URL!)
  const prisma = new PrismaClient()
  try {
    const verified = await verifyDatabaseMigrationContract(prisma)
    process.stdout.write(`${JSON.stringify({ status: 'valid', target, shadow, diff, ...verified })}\n`)
  } finally {
    await prisma.$disconnect()
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(error => {
    process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`)
    process.exitCode = 1
  })
}
