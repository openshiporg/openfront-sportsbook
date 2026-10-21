/* Additive full-product capability migration. Existing relationship keys are preserved. */
-- CreateEnum
CREATE TYPE "CompetitionStatusType" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "EventOfficialResultStatusType" AS ENUM ('NONE', 'PROVISIONAL', 'APPROVED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "MarketTradingModeType" AS ENUM ('PREMATCH', 'LIVE');

-- CreateEnum
CREATE TYPE "PlayerPreferredOddsFormatType" AS ENUM ('DECIMAL', 'AMERICAN', 'FRACTIONAL');

-- CreateEnum
CREATE TYPE "QuoteStructureType" AS ENUM ('STRAIGHT', 'PARLAY', 'SYSTEM', 'ROUND_ROBIN', 'TEASER');

-- CreateEnum
CREATE TYPE "QuotePriceChangeConsentType" AS ENUM ('EXACT', 'ACCEPT_BETTER', 'ACCEPT_WITHIN_TOLERANCE');

-- CreateEnum
CREATE TYPE "WagerStructureType" AS ENUM ('STRAIGHT', 'PARLAY', 'SYSTEM', 'ROUND_ROBIN', 'TEASER');

-- CreateEnum
CREATE TYPE "WagerPriceChangeConsentType" AS ENUM ('EXACT', 'ACCEPT_BETTER', 'ACCEPT_WITHIN_TOLERANCE');

-- CreateEnum
CREATE TYPE "CustomerQuoteLegTermsLiveType" AS ENUM ('PREMATCH', 'LIVE');

-- CreateEnum
CREATE TYPE "CustomerSessionAssuranceLevelType" AS ENUM ('GUEST', 'PASSWORD', 'MFA');

-- CreateEnum
CREATE TYPE "AccessReviewStatusType" AS ENUM ('OPEN', 'IN_REVIEW', 'APPROVED', 'REMEDIATION', 'CLOSED');

-- CreateEnum
CREATE TYPE "AccountClosureStatusType" AS ENUM ('REQUESTED', 'REVIEW', 'BLOCKED_FUNDS', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AdapterCertificationRunStatusType" AS ENUM ('PENDING', 'RUNNING', 'PASSED', 'FAILED');

-- CreateEnum
CREATE TYPE "AffiliateAttributionStatusType" AS ENUM ('PENDING', 'ATTRIBUTED', 'REJECTED', 'REVERSED');

-- CreateEnum
CREATE TYPE "AffordabilityAssessmentRiskBandType" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'PROHIBITED');

-- CreateEnum
CREATE TYPE "AffordabilityAssessmentDecisionType" AS ENUM ('ALLOW', 'RESTRICT', 'REVIEW');

-- CreateEnum
CREATE TYPE "BonusAwardAwardTypeType" AS ENUM ('FREE_BET', 'BONUS_CASH', 'ODDS_BOOST');

-- CreateEnum
CREATE TYPE "BonusAwardStatusType" AS ENUM ('AWARDED', 'ACTIVE', 'CONSUMED', 'CONVERTED', 'EXPIRED', 'FORFEITED');

-- CreateEnum
CREATE TYPE "BonusTransactionTypeType" AS ENUM ('AWARD', 'ACTIVATE', 'RESERVE', 'CONSUME', 'RELEASE', 'CONVERT', 'EXPIRE', 'FORFEIT', 'REVERSE');

-- CreateEnum
CREATE TYPE "BrandLocaleStatusType" AS ENUM ('DRAFT', 'ACTIVE', 'RETIRED');

-- CreateEnum
CREATE TYPE "CampaignBudgetStatusType" AS ENUM ('ACTIVE', 'EXHAUSTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "CashOutAcceptanceStatusType" AS ENUM ('ACCEPTED', 'REVERSED');

-- CreateEnum
CREATE TYPE "CompetitionStageStatusType" AS ENUM ('SCHEDULED', 'ACTIVE', 'COMPLETE');

-- CreateEnum
CREATE TYPE "ConfigDefinitionValueTypeType" AS ENUM ('STRING', 'INTEGER', 'MONEY', 'BOOLEAN', 'JSON');

-- CreateEnum
CREATE TYPE "ConfigDefinitionMergeStrategyType" AS ENUM ('REPLACE', 'MIN', 'MAX', 'UNION', 'DENY_WINS');

-- CreateEnum
CREATE TYPE "CorrelationGroupStatusType" AS ENUM ('DRAFT', 'ACTIVE', 'RETIRED');

-- CreateEnum
CREATE TYPE "CorrelationRuleDecisionType" AS ENUM ('ALLOW', 'DENY', 'PROVIDER_PRICE_REQUIRED');

-- CreateEnum
CREATE TYPE "CurrencyDefinitionStatusType" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "CustomerCredentialStatusType" AS ENUM ('PENDING_VERIFICATION', 'ACTIVE', 'LOCKED', 'CLOSED');

-- CreateEnum
CREATE TYPE "CustomerFavoriteTargetTypeType" AS ENUM ('SPORT', 'COMPETITION', 'EVENT', 'COMPETITOR');

-- CreateEnum
CREATE TYPE "CustomerPrivacyRequestTypeType" AS ENUM ('ACCESS', 'EXPORT', 'CORRECT', 'DELETE', 'RESTRICT', 'PORTABILITY');

-- CreateEnum
CREATE TYPE "CustomerPrivacyRequestStatusType" AS ENUM ('OPEN', 'VERIFYING', 'IN_PROGRESS', 'COMPLETED', 'DENIED');

-- CreateEnum
CREATE TYPE "CustomerRecoveryTokenPurposeType" AS ENUM ('VERIFY_EMAIL', 'RESET_PASSWORD', 'RECOVER_ACCOUNT');

-- CreateEnum
CREATE TYPE "DataExportTypeType" AS ENUM ('AUDIT', 'WAGERS', 'FINANCE', 'CUSTOMERS', 'REGULATORY', 'PRIVACY');

-- CreateEnum
CREATE TYPE "DataExportClassificationType" AS ENUM ('INTERNAL', 'CONFIDENTIAL', 'RESTRICTED_PII', 'RESTRICTED_FINANCIAL', 'RESTRICTED_REGULATORY');

-- CreateEnum
CREATE TYPE "DataExportStatusType" AS ENUM ('PENDING', 'GENERATING', 'READY', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "FeatureFlagScopeTypeType" AS ENUM ('TENANT', 'BRAND', 'JURISDICTION', 'CHANNEL');

-- CreateEnum
CREATE TYPE "FeedHealthSnapshotStatusType" AS ENUM ('HEALTHY', 'DEGRADED', 'STALE', 'GAPPED', 'DOWN');

-- CreateEnum
CREATE TYPE "HouseRuleVersionStatusType" AS ENUM ('DRAFT', 'APPROVED', 'ACTIVE', 'RETIRED');

-- CreateEnum
CREATE TYPE "IntegrityCaseTypeType" AS ENUM ('SUSPICIOUS_BETTING', 'COLLUSION', 'INSIDER', 'RESULT_DISAGREEMENT', 'PROHIBITED_PARTICIPANT');

-- CreateEnum
CREATE TYPE "IntegrityCaseStatusType" AS ENUM ('OPEN', 'INVESTIGATING', 'REPORTED', 'CLEARED', 'CLOSED');

-- CreateEnum
CREATE TYPE "IntegrityCaseSeverityType" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "JurisdictionPolicyVersionStatusType" AS ENUM ('DRAFT', 'APPROVED', 'ACTIVE', 'RETIRED');

-- CreateEnum
CREATE TYPE "LedgerAdjustmentRequestDirectionType" AS ENUM ('DEBIT', 'CREDIT');

-- CreateEnum
CREATE TYPE "LedgerAdjustmentRequestStatusType" AS ENUM ('PENDING', 'APPROVED', 'POSTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "LegalEntityStatusType" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'CLOSED');

-- CreateEnum
CREATE TYPE "MarketDefinitionStatusType" AS ENUM ('DRAFT', 'ACTIVE', 'RETIRED');

-- CreateEnum
CREATE TYPE "NotificationChannelType" AS ENUM ('EMAIL', 'SMS', 'PUSH', 'IN_APP', 'WEBHOOK');

-- CreateEnum
CREATE TYPE "NotificationStatusType" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'FAILED', 'SUPPRESSED');

-- CreateEnum
CREATE TYPE "OperatorChannelTypeType" AS ENUM ('WEB', 'MOBILE_WEB', 'NATIVE', 'RETAIL', 'PAM');

-- CreateEnum
CREATE TYPE "OperatorChannelStatusType" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "PamSubjectMappingWalletModeType" AS ENUM ('OPENFRONT', 'PAM', 'TRANSFER');

-- CreateEnum
CREATE TYPE "PamSubjectMappingStatusType" AS ENUM ('ACTIVE', 'SUSPENDED', 'REVOKED');

-- CreateEnum
CREATE TYPE "PlayerStatementStatusType" AS ENUM ('GENERATING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "PromotionTypeType" AS ENUM ('FREE_BET', 'ODDS_BOOST', 'DEPOSIT_MATCH', 'CASHBACK');

-- CreateEnum
CREATE TYPE "PromotionStatusType" AS ENUM ('DRAFT', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'ENDED');

-- CreateEnum
CREATE TYPE "PromotionRedemptionStatusType" AS ENUM ('ELIGIBLE', 'CLAIMED', 'REJECTED', 'REVERSED');

-- CreateEnum
CREATE TYPE "PromotionRuleVersionStatusType" AS ENUM ('DRAFT', 'ACTIVE', 'RETIRED');

-- CreateEnum
CREATE TYPE "ProviderHealthSampleStatusType" AS ENUM ('HEALTHY', 'DEGRADED', 'DOWN');

-- CreateEnum
CREATE TYPE "RegionStatusType" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ReportArtifactFormatType" AS ENUM ('JSON', 'CSV', 'PDF', 'XML');

-- CreateEnum
CREATE TYPE "ReportArtifactStatusType" AS ENUM ('READY', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "RetentionExecutionStatusType" AS ENUM ('DRY_RUN', 'PENDING_APPROVAL', 'APPROVED', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "RetentionPolicyVersionDeletionModeType" AS ENUM ('DELETE', 'TOKENIZE', 'CRYPTO_SHRED', 'PRESERVE');

-- CreateEnum
CREATE TYPE "RetentionPolicyVersionStatusType" AS ENUM ('DRAFT', 'ACTIVE', 'RETIRED');

-- CreateEnum
CREATE TYPE "SafeguardingAccountClassificationType" AS ENUM ('NOT_PROTECTED', 'MEDIUM_PROTECTION', 'HIGH_PROTECTION', 'TRUST');

-- CreateEnum
CREATE TYPE "SafeguardingAccountStatusType" AS ENUM ('ACTIVE', 'SUSPENDED', 'CLOSED');

-- CreateEnum
CREATE TYPE "SafeguardingReconciliationStatusType" AS ENUM ('MATCHED', 'SHORTFALL', 'SURPLUS', 'RESOLVED');

-- CreateEnum
CREATE TYPE "ScheduledJobTypeType" AS ENUM ('RECONCILIATION', 'REPORT', 'NOTIFICATION', 'RETENTION', 'EXPIRY', 'PROVIDER_HEALTH', 'FEED_RECOVERY');

-- CreateEnum
CREATE TYPE "ScheduledJobStatusType" AS ENUM ('SCHEDULED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SeasonStatusType" AS ENUM ('SCHEDULED', 'ACTIVE', 'COMPLETE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SettlementLineLineTypeType" AS ENUM ('STAKE_RETURN', 'PROFIT', 'LOSS', 'VOID', 'PUSH', 'DEAD_HEAT', 'TAX', 'ROUNDING');

-- CreateEnum
CREATE TYPE "SettlementRunTriggerTypeType" AS ENUM ('RESULT_APPROVED', 'CORRECTION', 'MANUAL_REPLAY');

-- CreateEnum
CREATE TYPE "SettlementRunStatusType" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "SupportCaseCategoryType" AS ENUM ('ACCOUNT', 'WAGER', 'PAYMENT', 'RESPONSIBLE_GAMING', 'PRIVACY', 'TECHNICAL');

-- CreateEnum
CREATE TYPE "SupportCasePriorityType" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "SupportCaseStatusType" AS ENUM ('OPEN', 'TRIAGED', 'WAITING_CUSTOMER', 'WAITING_OPERATOR', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "SupportCaseEventTypeType" AS ENUM ('OPENED', 'NOTE', 'CUSTOMER_MESSAGE', 'OPERATOR_MESSAGE', 'ESCALATED', 'LINKED', 'RESOLVED', 'REOPENED');

-- CreateEnum
CREATE TYPE "SupportCaseEventActorTypeType" AS ENUM ('PLAYER', 'STAFF', 'SYSTEM', 'PROVIDER');

-- CreateEnum
CREATE TYPE "SupportCaseEventVisibilityType" AS ENUM ('CUSTOMER', 'INTERNAL', 'RESTRICTED');

-- CreateEnum
CREATE TYPE "TaxRuleVersionBasisType" AS ENUM ('STAKE', 'WINNINGS', 'GGR', 'PLAYER_WITHHOLDING', 'PROMOTION');

-- CreateEnum
CREATE TYPE "TaxRuleVersionStatusType" AS ENUM ('DRAFT', 'ACTIVE', 'RETIRED');

-- CreateEnum
CREATE TYPE "TenantCurrencyStatusType" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "TraderOverrideOverrideTypeType" AS ENUM ('PRICE', 'LINE', 'STATUS', 'MAX_STAKE', 'MAX_PAYOUT', 'MAX_LIABILITY', 'CASH_OUT');

-- CreateEnum
CREATE TYPE "TraderOverrideStatusType" AS ENUM ('PENDING', 'ACTIVE', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "TradingReplayRunStatusType" AS ENUM ('PENDING', 'RUNNING', 'MATCHED', 'DIFFERENT', 'FAILED');

-- CreateEnum
CREATE TYPE "VenueStatusType" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "WagerPartStatusType" AS ENUM ('OPEN', 'GRADED', 'SETTLED', 'CASHED_OUT', 'VOID');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "CustomerCommandTypeType" ADD VALUE 'AUTH';
ALTER TYPE "CustomerCommandTypeType" ADD VALUE 'CASH_OUT';
ALTER TYPE "CustomerCommandTypeType" ADD VALUE 'PROMOTION';
ALTER TYPE "CustomerCommandTypeType" ADD VALUE 'DISPUTE';
ALTER TYPE "CustomerCommandTypeType" ADD VALUE 'PROFILE';
ALTER TYPE "CustomerCommandTypeType" ADD VALUE 'PRIVACY';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "DisputeStatusType" ADD VALUE 'TRIAGED';
ALTER TYPE "DisputeStatusType" ADD VALUE 'PROPOSED_RESOLUTION';
ALTER TYPE "DisputeStatusType" ADD VALUE 'APPEALED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PaymentIntentStatusType" ADD VALUE 'REVIEW';
ALTER TYPE "PaymentIntentStatusType" ADD VALUE 'CANCELLED';

-- AlterEnum
ALTER TYPE "PaymentIntentTypeType" ADD VALUE 'ADJUSTMENT';

-- AlterEnum
ALTER TYPE "SettlementOutcomeType" ADD VALUE 'PARTIAL';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "WagerStatusType" ADD VALUE 'PENDING';
ALTER TYPE "WagerStatusType" ADD VALUE 'DELAYED';
ALTER TYPE "WagerStatusType" ADD VALUE 'PARTIALLY_CASHED_OUT';
ALTER TYPE "WagerStatusType" ADD VALUE 'CASHED_OUT';
ALTER TYPE "WagerStatusType" ADD VALUE 'GRADED';

-- AlterTable
ALTER TABLE "Brand" ADD COLUMN     "defaultTimezone" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "designTokens" JSONB,
ADD COLUMN     "supportedLocales" JSONB,
ADD COLUMN     "termsReference" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "CashOutOffer" ADD COLUMN     "feeMinor" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "marginBasisPoints" INTEGER,
ADD COLUMN     "offeredAt" TIMESTAMP(3),
ADD COLUMN     "valuationInputs" JSONB,
ADD COLUMN     "wagerVersion" INTEGER;

-- AlterTable
ALTER TABLE "Competition" ADD COLUMN     "region" TEXT,
ADD COLUMN     "status" "CompetitionStatusType" DEFAULT 'ACTIVE',
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "CustomerSession" ADD COLUMN     "assuranceLevel" "CustomerSessionAssuranceLevelType" DEFAULT 'GUEST',
ADD COLUMN     "deviceDigest" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "lastSeenAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Dispute" ADD COLUMN     "approvalRequest" TEXT,
ADD COLUMN     "resolvedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "clockSeconds" INTEGER,
ADD COLUMN     "livePhase" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "officialResultStatus" "EventOfficialResultStatusType" DEFAULT 'NONE',
ADD COLUMN     "season" TEXT,
ADD COLUMN     "stage" TEXT,
ADD COLUMN     "venue" TEXT;

-- AlterTable
ALTER TABLE "Market" ADD COLUMN     "cashOutEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "definition" TEXT,
ADD COLUMN     "line" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "marginBasisPoints" INTEGER,
ADD COLUMN     "tradingMode" "MarketTradingModeType" DEFAULT 'PREMATCH';

-- AlterTable
ALTER TABLE "PaymentIntent" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "feeMinor" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "hold" TEXT,
ADD COLUMN     "paymentMethodReference" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "providerSessionReference" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "riskEvidence" JSONB;

-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "marketingAllowed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "preferredOddsFormat" "PlayerPreferredOddsFormatType" DEFAULT 'DECIMAL',
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "ProviderConnection" ADD COLUMN     "dataResidencyRegion" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "failoverPriority" INTEGER DEFAULT 100,
ADD COLUMN     "jurisdiction" TEXT,
ADD COLUMN     "legalEntity" TEXT,
ADD COLUMN     "secretReference" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Quote" ADD COLUMN     "legCount" INTEGER DEFAULT 1,
ADD COLUMN     "liveDelayMs" INTEGER DEFAULT 0,
ADD COLUMN     "partCount" INTEGER DEFAULT 1,
ADD COLUMN     "potentialReturnMinor" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "priceChangeConsent" "QuotePriceChangeConsentType" DEFAULT 'EXACT',
ADD COLUMN     "structure" "QuoteStructureType" DEFAULT 'STRAIGHT';

-- AlterTable
ALTER TABLE "Settlement" ADD COLUMN     "grossPayoutMinor" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "settlementRun" TEXT,
ADD COLUMN     "taxMinor" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "dataResidencyRegion" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "supportedLocales" JSONB;

-- AlterTable
ALTER TABLE "Wager" ADD COLUMN     "brand" TEXT,
ADD COLUMN     "channel" TEXT,
ADD COLUMN     "legalEntity" TEXT,
ADD COLUMN     "liveDelayMs" INTEGER DEFAULT 0,
ADD COLUMN     "maxPayoutMinor" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "operatorJurisdiction" TEXT,
ADD COLUMN     "priceChangeConsent" "WagerPriceChangeConsentType" DEFAULT 'EXACT',
ADD COLUMN     "requestedAt" TIMESTAMP(3),
ADD COLUMN     "structure" "WagerStructureType" DEFAULT 'STRAIGHT',
ADD COLUMN     "version" INTEGER DEFAULT 1;

-- AlterTable
ALTER TABLE "WagerLeg" ADD COLUMN     "correlationGroupKey" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "legIndex" INTEGER,
ADD COLUMN     "live" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "wagerPart" TEXT;

-- CreateTable
CREATE TABLE "CustomerQuoteLegTerms" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "player" TEXT,
    "quote" TEXT,
    "quoteKey" TEXT NOT NULL DEFAULT '',
    "legIndex" TEXT NOT NULL DEFAULT '',
    "eventId" TEXT NOT NULL DEFAULT '',
    "marketId" TEXT NOT NULL DEFAULT '',
    "selectionId" TEXT NOT NULL DEFAULT '',
    "priceSnapshotId" TEXT NOT NULL DEFAULT '',
    "eventName" TEXT NOT NULL DEFAULT '',
    "marketName" TEXT NOT NULL DEFAULT '',
    "selectionName" TEXT NOT NULL DEFAULT '',
    "decimalOdds" TEXT NOT NULL DEFAULT '',
    "line" TEXT NOT NULL DEFAULT '',
    "live" "CustomerQuoteLegTermsLiveType" DEFAULT 'PREMATCH',
    "correlationGroupKey" TEXT NOT NULL DEFAULT '',
    "ruleVersion" TEXT NOT NULL DEFAULT '',
    "evidenceHash" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerQuoteLegTerms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessReview" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "scopeType" TEXT NOT NULL DEFAULT '',
    "scopeId" TEXT NOT NULL DEFAULT '',
    "status" "AccessReviewStatusType" DEFAULT 'OPEN',
    "openedBy" TEXT NOT NULL DEFAULT '',
    "reviewerId" TEXT NOT NULL DEFAULT '',
    "findings" JSONB,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccessReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountClosure" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "player" TEXT,
    "requestedBy" TEXT NOT NULL DEFAULT '',
    "reasonCode" TEXT NOT NULL DEFAULT '',
    "requestedAt" TIMESTAMP(3) NOT NULL,
    "coolingEndsAt" TIMESTAMP(3),
    "status" "AccountClosureStatusType" DEFAULT 'REQUESTED',
    "completedAt" TIMESTAMP(3),
    "evidenceHash" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountClosure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdapterCertificationRun" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "providerConnection" TEXT,
    "adapterId" TEXT NOT NULL DEFAULT '',
    "adapterVersion" TEXT NOT NULL DEFAULT '',
    "suiteVersion" TEXT NOT NULL DEFAULT '',
    "scenarios" JSONB,
    "passed" INTEGER DEFAULT 0,
    "failed" INTEGER DEFAULT 0,
    "status" "AdapterCertificationRunStatusType" DEFAULT 'PENDING',
    "inputHash" TEXT NOT NULL DEFAULT '',
    "artifactReference" TEXT NOT NULL DEFAULT '',
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdapterCertificationRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AffiliateAttribution" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "player" TEXT,
    "affiliateReference" TEXT NOT NULL DEFAULT '',
    "campaignReference" TEXT NOT NULL DEFAULT '',
    "clickReference" TEXT NOT NULL DEFAULT '',
    "attributedAt" TIMESTAMP(3) NOT NULL,
    "status" "AffiliateAttributionStatusType" DEFAULT 'PENDING',
    "evidenceHash" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AffiliateAttribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AffordabilityAssessment" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "player" TEXT,
    "source" TEXT NOT NULL DEFAULT '',
    "riskBand" "AffordabilityAssessmentRiskBandType" DEFAULT 'LOW',
    "evidenceReference" TEXT NOT NULL DEFAULT '',
    "assessedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "decision" "AffordabilityAssessmentDecisionType" DEFAULT 'ALLOW',
    "reasonCode" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AffordabilityAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BonusAward" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "promotion" TEXT,
    "ruleVersion" TEXT,
    "player" TEXT,
    "amountMinor" TEXT NOT NULL DEFAULT '',
    "remainingMinor" TEXT NOT NULL DEFAULT '',
    "currency" TEXT NOT NULL DEFAULT '',
    "awardType" "BonusAwardAwardTypeType" DEFAULT 'FREE_BET',
    "stakeReturned" BOOLEAN NOT NULL DEFAULT false,
    "status" "BonusAwardStatusType" DEFAULT 'AWARDED',
    "awardedAt" TIMESTAMP(3) NOT NULL,
    "activatedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "idempotencyKey" TEXT NOT NULL DEFAULT '',
    "evidenceHash" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BonusAward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BonusTransaction" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "award" TEXT,
    "type" "BonusTransactionTypeType" DEFAULT 'AWARD',
    "amountMinor" TEXT NOT NULL DEFAULT '',
    "remainingMinor" TEXT NOT NULL DEFAULT '',
    "currency" TEXT NOT NULL DEFAULT '',
    "wager" TEXT,
    "journalTransaction" TEXT,
    "idempotencyKey" TEXT NOT NULL DEFAULT '',
    "evidenceHash" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BonusTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandLocale" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "brand" TEXT,
    "locale" TEXT NOT NULL DEFAULT '',
    "language" TEXT NOT NULL DEFAULT '',
    "timezone" TEXT NOT NULL DEFAULT '',
    "termsVersion" TEXT NOT NULL DEFAULT '',
    "termsContentHash" TEXT NOT NULL DEFAULT '',
    "default" BOOLEAN NOT NULL DEFAULT false,
    "status" "BrandLocaleStatusType" DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BrandLocale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignBudget" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "promotion" TEXT,
    "allocatedMinor" TEXT NOT NULL DEFAULT '',
    "awardedMinor" TEXT NOT NULL DEFAULT '',
    "redeemedMinor" TEXT NOT NULL DEFAULT '',
    "forfeitedMinor" TEXT NOT NULL DEFAULT '',
    "currency" TEXT NOT NULL DEFAULT '',
    "version" INTEGER NOT NULL,
    "status" "CampaignBudgetStatusType" DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignBudget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashOutAcceptance" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "offer" TEXT,
    "wager" TEXT,
    "player" TEXT,
    "amountMinor" TEXT NOT NULL DEFAULT '',
    "currency" TEXT NOT NULL DEFAULT '',
    "portionNumerator" TEXT NOT NULL DEFAULT '',
    "portionDenominator" TEXT NOT NULL DEFAULT '',
    "wagerVersion" INTEGER NOT NULL,
    "acceptedAt" TIMESTAMP(3) NOT NULL,
    "journalTransaction" TEXT,
    "status" "CashOutAcceptanceStatusType" DEFAULT 'ACCEPTED',
    "reversalOf" TEXT,
    "idempotencyKey" TEXT NOT NULL DEFAULT '',
    "evidenceHash" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CashOutAcceptance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetitionStage" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "season" TEXT,
    "key" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL,
    "status" "CompetitionStageStatusType" DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompetitionStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfigDefinition" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "key" TEXT NOT NULL DEFAULT '',
    "valueType" "ConfigDefinitionValueTypeType" DEFAULT 'STRING',
    "mergeStrategy" "ConfigDefinitionMergeStrategyType" DEFAULT 'REPLACE',
    "allowedScopes" JSONB,
    "validationSchema" JSONB,
    "secret" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConfigDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CorrelationGroup" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "key" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL DEFAULT '',
    "sportKey" TEXT NOT NULL DEFAULT '',
    "status" "CorrelationGroupStatusType" DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CorrelationGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CorrelationRule" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "group" TEXT,
    "leftPattern" JSONB,
    "rightPattern" JSONB,
    "decision" "CorrelationRuleDecisionType" DEFAULT 'ALLOW',
    "reasonCode" TEXT NOT NULL DEFAULT '',
    "priority" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CorrelationRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CurrencyDefinition" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL DEFAULT '',
    "exponent" INTEGER NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "status" "CurrencyDefinitionStatusType" DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CurrencyDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerCredential" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "player" TEXT,
    "emailDigest" TEXT NOT NULL DEFAULT '',
    "emailMasked" TEXT NOT NULL DEFAULT '',
    "passwordHash" TEXT NOT NULL DEFAULT '',
    "passwordVersion" INTEGER DEFAULT 1,
    "status" "CustomerCredentialStatusType" DEFAULT 'PENDING_VERIFICATION',
    "failedAttempts" INTEGER DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "lastAuthenticatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerDevice" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "player" TEXT,
    "session" TEXT,
    "deviceDigest" TEXT NOT NULL DEFAULT '',
    "label" TEXT NOT NULL DEFAULT '',
    "firstSeenAt" TIMESTAMP(3) NOT NULL,
    "lastSeenAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "riskSignals" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerFavorite" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "player" TEXT,
    "targetType" "CustomerFavoriteTargetTypeType" DEFAULT 'SPORT',
    "targetId" TEXT NOT NULL DEFAULT '',
    "createdByDevice" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerFavorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerPrivacyRequest" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "player" TEXT,
    "type" "CustomerPrivacyRequestTypeType" DEFAULT 'ACCESS',
    "status" "CustomerPrivacyRequestStatusType" DEFAULT 'OPEN',
    "requestedAt" TIMESTAMP(3) NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "identityEvidenceHash" TEXT NOT NULL DEFAULT '',
    "artifactReference" TEXT NOT NULL DEFAULT '',
    "decisionReason" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerPrivacyRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerRecoveryToken" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "player" TEXT,
    "tokenDigest" TEXT NOT NULL DEFAULT '',
    "purpose" "CustomerRecoveryTokenPurposeType" DEFAULT 'VERIFY_EMAIL',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "attempts" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerRecoveryToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataExport" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "requestedBy" TEXT NOT NULL DEFAULT '',
    "type" "DataExportTypeType" DEFAULT 'AUDIT',
    "scope" JSONB,
    "classification" "DataExportClassificationType" DEFAULT 'INTERNAL',
    "status" "DataExportStatusType" DEFAULT 'PENDING',
    "rowCount" INTEGER DEFAULT 0,
    "contentHash" TEXT NOT NULL DEFAULT '',
    "storageReference" TEXT NOT NULL DEFAULT '',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "approvalRequest" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DataExport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventScheduleChange" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "event" TEXT,
    "fromStartAt" TIMESTAMP(3) NOT NULL,
    "toStartAt" TIMESTAMP(3) NOT NULL,
    "reasonCode" TEXT NOT NULL DEFAULT '',
    "source" TEXT NOT NULL DEFAULT '',
    "actorId" TEXT NOT NULL DEFAULT '',
    "evidenceHash" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventScheduleChange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureFlag" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "key" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "scopeType" "FeatureFlagScopeTypeType" DEFAULT 'TENANT',
    "scopeId" TEXT NOT NULL DEFAULT '',
    "safeDefault" BOOLEAN NOT NULL DEFAULT false,
    "ownerId" TEXT NOT NULL DEFAULT '',
    "expiresAt" TIMESTAMP(3),
    "approvalRequest" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeatureFlag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedHealthSnapshot" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "providerConnection" TEXT,
    "scopeType" TEXT NOT NULL DEFAULT '',
    "scopeId" TEXT NOT NULL DEFAULT '',
    "status" "FeedHealthSnapshotStatusType" DEFAULT 'HEALTHY',
    "heartbeatAt" TIMESTAMP(3),
    "lagMs" INTEGER,
    "lastSequence" TEXT NOT NULL DEFAULT '',
    "gapFrom" TEXT NOT NULL DEFAULT '',
    "gapTo" TEXT NOT NULL DEFAULT '',
    "checkedAt" TIMESTAMP(3) NOT NULL,
    "actionTaken" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeedHealthSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HouseRuleVersion" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "name" TEXT NOT NULL DEFAULT '',
    "version" INTEGER NOT NULL,
    "sportKey" TEXT NOT NULL DEFAULT '',
    "marketDefinitionKey" TEXT NOT NULL DEFAULT '',
    "rules" JSONB,
    "semanticHash" TEXT NOT NULL DEFAULT '',
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "status" "HouseRuleVersionStatusType" DEFAULT 'DRAFT',
    "approvalRequest" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HouseRuleVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrityCase" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "player" TEXT,
    "event" TEXT,
    "wager" TEXT,
    "providerConnection" TEXT,
    "type" "IntegrityCaseTypeType" DEFAULT 'SUSPICIOUS_BETTING',
    "status" "IntegrityCaseStatusType" DEFAULT 'OPEN',
    "severity" "IntegrityCaseSeverityType" DEFAULT 'LOW',
    "restrictedEvidence" JSONB,
    "ownerId" TEXT NOT NULL DEFAULT '',
    "reportedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntegrityCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JurisdictionPolicyVersion" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "jurisdiction" TEXT,
    "version" INTEGER NOT NULL,
    "authorityCitation" TEXT NOT NULL DEFAULT '',
    "policyDocument" JSONB,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "status" "JurisdictionPolicyVersionStatusType" DEFAULT 'DRAFT',
    "approvedBy" TEXT NOT NULL DEFAULT '',
    "approvedAt" TIMESTAMP(3),
    "evidenceHash" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JurisdictionPolicyVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LedgerAdjustmentRequest" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "player" TEXT,
    "account" TEXT,
    "amountMinor" TEXT NOT NULL DEFAULT '',
    "currency" TEXT NOT NULL DEFAULT '',
    "direction" "LedgerAdjustmentRequestDirectionType" DEFAULT 'DEBIT',
    "reasonCode" TEXT NOT NULL DEFAULT '',
    "evidence" JSONB,
    "status" "LedgerAdjustmentRequestStatusType" DEFAULT 'PENDING',
    "requesterId" TEXT NOT NULL DEFAULT '',
    "approvalRequest" TEXT,
    "journalTransaction" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LedgerAdjustmentRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegalEntity" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "name" TEXT NOT NULL DEFAULT '',
    "countryCode" TEXT NOT NULL DEFAULT '',
    "registrationReference" TEXT NOT NULL DEFAULT '',
    "status" "LegalEntityStatusType" DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LegalEntity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketDefinition" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "key" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL DEFAULT '',
    "sportKey" TEXT NOT NULL DEFAULT '',
    "parametersSchema" JSONB,
    "gradingRuleFamily" TEXT NOT NULL DEFAULT '',
    "allowedPhases" JSONB,
    "status" "MarketDefinitionStatusType" DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "player" TEXT,
    "user" TEXT,
    "channel" "NotificationChannelType" DEFAULT 'EMAIL',
    "templateKey" TEXT NOT NULL DEFAULT '',
    "templateVersion" TEXT NOT NULL DEFAULT '',
    "locale" TEXT NOT NULL DEFAULT '',
    "payload" JSONB,
    "status" "NotificationStatusType" DEFAULT 'PENDING',
    "consentEvidenceHash" TEXT NOT NULL DEFAULT '',
    "providerConnection" TEXT,
    "externalReference" TEXT NOT NULL DEFAULT '',
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperatorChannel" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "legalEntity" TEXT,
    "operatorJurisdiction" TEXT,
    "brand" TEXT,
    "key" TEXT NOT NULL DEFAULT '',
    "type" "OperatorChannelTypeType" DEFAULT 'WEB',
    "status" "OperatorChannelStatusType" DEFAULT 'PENDING',
    "capabilities" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OperatorChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PamSubjectMapping" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "providerConnection" TEXT,
    "externalSubjectDigest" TEXT NOT NULL DEFAULT '',
    "player" TEXT,
    "walletMode" "PamSubjectMappingWalletModeType" DEFAULT 'OPENFRONT',
    "status" "PamSubjectMappingStatusType" DEFAULT 'ACTIVE',
    "evidenceHash" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PamSubjectMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerStatement" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "player" TEXT,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "openingMinor" TEXT NOT NULL DEFAULT '',
    "closingMinor" TEXT NOT NULL DEFAULT '',
    "currency" TEXT NOT NULL DEFAULT '',
    "journalHash" TEXT NOT NULL DEFAULT '',
    "artifactReference" TEXT NOT NULL DEFAULT '',
    "status" "PlayerStatementStatusType" DEFAULT 'GENERATING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerStatement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Promotion" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "key" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "type" "PromotionTypeType" DEFAULT 'FREE_BET',
    "status" "PromotionStatusType" DEFAULT 'DRAFT',
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "jurisdiction" TEXT,
    "brand" TEXT,
    "budgetMinor" TEXT NOT NULL DEFAULT '',
    "currency" TEXT NOT NULL DEFAULT '',
    "termsVersion" TEXT NOT NULL DEFAULT '',
    "termsHash" TEXT NOT NULL DEFAULT '',
    "approvalRequest" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromotionRedemption" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "promotion" TEXT,
    "ruleVersion" TEXT,
    "player" TEXT,
    "bonusAward" TEXT,
    "status" "PromotionRedemptionStatusType" DEFAULT 'ELIGIBLE',
    "reasonCode" TEXT NOT NULL DEFAULT '',
    "idempotencyKey" TEXT NOT NULL DEFAULT '',
    "evidenceHash" TEXT NOT NULL DEFAULT '',
    "redeemedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromotionRedemption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromotionRuleVersion" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "promotion" TEXT,
    "version" INTEGER NOT NULL,
    "eligibility" JSONB,
    "economics" JSONB,
    "wageringRequirements" JSONB,
    "abuseControls" JSONB,
    "contributionRules" JSONB,
    "status" "PromotionRuleVersionStatusType" DEFAULT 'DRAFT',
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "evidenceHash" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromotionRuleVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderHealthSample" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "providerConnection" TEXT,
    "capability" TEXT NOT NULL DEFAULT '',
    "status" "ProviderHealthSampleStatusType" DEFAULT 'HEALTHY',
    "latencyMs" INTEGER,
    "errorRateBasisPoints" INTEGER,
    "sequenceLag" INTEGER,
    "oldestWebhookAgeMs" INTEGER,
    "reconciliationDifferenceMinor" TEXT NOT NULL DEFAULT '',
    "checkedAt" TIMESTAMP(3) NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProviderHealthSample_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Region" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "key" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL DEFAULT '',
    "countryCodes" JSONB,
    "status" "RegionStatusType" DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportArtifact" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "report" TEXT,
    "type" TEXT NOT NULL DEFAULT '',
    "format" "ReportArtifactFormatType" DEFAULT 'JSON',
    "schemaVersion" TEXT NOT NULL DEFAULT '',
    "rowCount" INTEGER DEFAULT 0,
    "contentHash" TEXT NOT NULL DEFAULT '',
    "storageReference" TEXT NOT NULL DEFAULT '',
    "encryptionKeyReference" TEXT NOT NULL DEFAULT '',
    "generatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "status" "ReportArtifactStatusType" DEFAULT 'READY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportArtifact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RetentionExecution" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "policyVersion" TEXT,
    "windowFrom" TIMESTAMP(3) NOT NULL,
    "windowTo" TIMESTAMP(3) NOT NULL,
    "candidateCount" INTEGER DEFAULT 0,
    "heldCount" INTEGER DEFAULT 0,
    "archivedCount" INTEGER DEFAULT 0,
    "deletedCount" INTEGER DEFAULT 0,
    "status" "RetentionExecutionStatusType" DEFAULT 'DRY_RUN',
    "dryRunHash" TEXT NOT NULL DEFAULT '',
    "approvalRequest" TEXT,
    "artifactReference" TEXT NOT NULL DEFAULT '',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RetentionExecution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RetentionPolicyVersion" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "recordClass" TEXT NOT NULL DEFAULT '',
    "jurisdiction" TEXT,
    "version" INTEGER NOT NULL,
    "retentionDays" INTEGER NOT NULL,
    "archiveDays" INTEGER,
    "deletionMode" "RetentionPolicyVersionDeletionModeType" DEFAULT 'DELETE',
    "legalHoldWins" BOOLEAN NOT NULL DEFAULT true,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "status" "RetentionPolicyVersionStatusType" DEFAULT 'DRAFT',
    "evidenceHash" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RetentionPolicyVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SafeguardingAccount" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "legalEntity" TEXT,
    "providerConnection" TEXT,
    "accountReference" TEXT NOT NULL DEFAULT '',
    "classification" "SafeguardingAccountClassificationType" DEFAULT 'NOT_PROTECTED',
    "currency" TEXT NOT NULL DEFAULT '',
    "status" "SafeguardingAccountStatusType" DEFAULT 'ACTIVE',
    "disclosureVersion" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SafeguardingAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SafeguardingReconciliation" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "safeguardingAccount" TEXT,
    "asOf" TIMESTAMP(3) NOT NULL,
    "safeguardedAssetMinor" TEXT NOT NULL DEFAULT '',
    "playerLiabilityMinor" TEXT NOT NULL DEFAULT '',
    "differenceMinor" TEXT NOT NULL DEFAULT '',
    "status" "SafeguardingReconciliationStatusType" DEFAULT 'MATCHED',
    "evidenceHash" TEXT NOT NULL DEFAULT '',
    "reconciliationRun" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SafeguardingReconciliation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledJob" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "type" "ScheduledJobTypeType" DEFAULT 'RECONCILIATION',
    "scopeType" TEXT NOT NULL DEFAULT '',
    "scopeId" TEXT NOT NULL DEFAULT '',
    "payload" JSONB,
    "status" "ScheduledJobStatusType" DEFAULT 'SCHEDULED',
    "dueAt" TIMESTAMP(3) NOT NULL,
    "leaseUntil" TIMESTAMP(3),
    "leaseOwner" TEXT NOT NULL DEFAULT '',
    "attempts" INTEGER DEFAULT 0,
    "maxAttempts" INTEGER DEFAULT 10,
    "idempotencyKey" TEXT NOT NULL DEFAULT '',
    "lastError" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScheduledJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Season" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "competition" TEXT,
    "key" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL DEFAULT '',
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "status" "SeasonStatusType" DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SettlementLine" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "settlement" TEXT,
    "wagerPart" TEXT,
    "wagerLeg" TEXT,
    "lineType" "SettlementLineLineTypeType" DEFAULT 'STAKE_RETURN',
    "amountMinor" TEXT NOT NULL DEFAULT '',
    "unroundedValue" TEXT NOT NULL DEFAULT '',
    "scale" INTEGER NOT NULL,
    "roundingRule" TEXT NOT NULL DEFAULT '',
    "residualMinor" TEXT NOT NULL DEFAULT '',
    "trace" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SettlementLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SettlementRun" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "triggerType" "SettlementRunTriggerTypeType" DEFAULT 'RESULT_APPROVED',
    "resultVersion" TEXT,
    "inputHash" TEXT NOT NULL DEFAULT '',
    "status" "SettlementRunStatusType" DEFAULT 'PENDING',
    "wagersConsidered" INTEGER DEFAULT 0,
    "wagersSettled" INTEGER DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "errorSummary" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SettlementRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportCase" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "player" TEXT,
    "wager" TEXT,
    "paymentIntent" TEXT,
    "dispute" TEXT,
    "category" "SupportCaseCategoryType" DEFAULT 'ACCOUNT',
    "priority" "SupportCasePriorityType" DEFAULT 'LOW',
    "status" "SupportCaseStatusType" DEFAULT 'OPEN',
    "subject" TEXT NOT NULL DEFAULT '',
    "ownerId" TEXT NOT NULL DEFAULT '',
    "openedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "slaDueAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupportCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportCaseEvent" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "supportCase" TEXT,
    "type" "SupportCaseEventTypeType" DEFAULT 'OPENED',
    "actorType" "SupportCaseEventActorTypeType" DEFAULT 'PLAYER',
    "actorId" TEXT NOT NULL DEFAULT '',
    "body" TEXT NOT NULL DEFAULT '',
    "evidenceHash" TEXT NOT NULL DEFAULT '',
    "visibility" "SupportCaseEventVisibilityType" DEFAULT 'CUSTOMER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupportCaseEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxRuleVersion" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "jurisdiction" TEXT,
    "key" TEXT NOT NULL DEFAULT '',
    "version" INTEGER NOT NULL,
    "basis" "TaxRuleVersionBasisType" DEFAULT 'STAKE',
    "rateNumerator" TEXT NOT NULL DEFAULT '',
    "rateDenominator" TEXT NOT NULL DEFAULT '',
    "roundingRule" TEXT NOT NULL DEFAULT '',
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "status" "TaxRuleVersionStatusType" DEFAULT 'DRAFT',
    "evidenceHash" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaxRuleVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantCurrency" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "currency" TEXT,
    "depositsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "withdrawalsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "wageringEnabled" BOOLEAN NOT NULL DEFAULT false,
    "defaultForBrand" BOOLEAN NOT NULL DEFAULT false,
    "status" "TenantCurrencyStatusType" DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TenantCurrency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TraderOverride" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "targetType" TEXT NOT NULL DEFAULT '',
    "targetId" TEXT NOT NULL DEFAULT '',
    "overrideType" "TraderOverrideOverrideTypeType" DEFAULT 'PRICE',
    "value" JSONB,
    "reasonCode" TEXT NOT NULL DEFAULT '',
    "startsAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "status" "TraderOverrideStatusType" DEFAULT 'PENDING',
    "requesterId" TEXT NOT NULL DEFAULT '',
    "approvalRequest" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TraderOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TradingReplayRun" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "providerConnection" TEXT,
    "scopeType" TEXT NOT NULL DEFAULT '',
    "scopeId" TEXT NOT NULL DEFAULT '',
    "frontier" TEXT NOT NULL DEFAULT '',
    "adapterVersion" TEXT NOT NULL DEFAULT '',
    "normalizerVersion" TEXT NOT NULL DEFAULT '',
    "ruleVersion" TEXT NOT NULL DEFAULT '',
    "inputHash" TEXT NOT NULL DEFAULT '',
    "outputHash" TEXT NOT NULL DEFAULT '',
    "comparison" JSONB,
    "dryRun" BOOLEAN NOT NULL DEFAULT true,
    "status" "TradingReplayRunStatusType" DEFAULT 'PENDING',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TradingReplayRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Venue" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "key" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL DEFAULT '',
    "countryCode" TEXT NOT NULL DEFAULT '',
    "timezone" TEXT NOT NULL DEFAULT '',
    "address" JSONB,
    "status" "VenueStatusType" DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Venue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WagerPart" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "wager" TEXT,
    "partIndex" INTEGER NOT NULL,
    "combinationKey" TEXT NOT NULL DEFAULT '',
    "stakeMinor" TEXT NOT NULL DEFAULT '',
    "decimalOdds" TEXT NOT NULL DEFAULT '',
    "potentialReturnMinor" TEXT NOT NULL DEFAULT '',
    "status" "WagerPartStatusType" DEFAULT 'OPEN',
    "gradeSummary" JSONB,
    "settlement" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WagerPart_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CustomerQuoteLegTerms_tenant_idx" ON "CustomerQuoteLegTerms"("tenant");

-- CreateIndex
CREATE INDEX "CustomerQuoteLegTerms_player_idx" ON "CustomerQuoteLegTerms"("player");

-- CreateIndex
CREATE INDEX "CustomerQuoteLegTerms_quote_idx" ON "CustomerQuoteLegTerms"("quote");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerQuoteLegTerms_quote_index_uq" ON "CustomerQuoteLegTerms"("quoteKey", "legIndex");

-- CreateIndex
CREATE INDEX "AccessReview_tenant_idx" ON "AccessReview"("tenant");

-- CreateIndex
CREATE INDEX "AccountClosure_tenant_idx" ON "AccountClosure"("tenant");

-- CreateIndex
CREATE INDEX "AccountClosure_player_idx" ON "AccountClosure"("player");

-- CreateIndex
CREATE INDEX "AdapterCertificationRun_tenant_idx" ON "AdapterCertificationRun"("tenant");

-- CreateIndex
CREATE INDEX "AdapterCertificationRun_providerConnection_idx" ON "AdapterCertificationRun"("providerConnection");

-- CreateIndex
CREATE INDEX "AffiliateAttribution_tenant_idx" ON "AffiliateAttribution"("tenant");

-- CreateIndex
CREATE INDEX "AffiliateAttribution_player_idx" ON "AffiliateAttribution"("player");

-- CreateIndex
CREATE UNIQUE INDEX "AffiliateAttribution_campaign_uq" ON "AffiliateAttribution"("tenant", "player", "campaignReference");

-- CreateIndex
CREATE INDEX "AffordabilityAssessment_tenant_idx" ON "AffordabilityAssessment"("tenant");

-- CreateIndex
CREATE INDEX "AffordabilityAssessment_player_idx" ON "AffordabilityAssessment"("player");

-- CreateIndex
CREATE INDEX "BonusAward_tenant_idx" ON "BonusAward"("tenant");

-- CreateIndex
CREATE INDEX "BonusAward_promotion_idx" ON "BonusAward"("promotion");

-- CreateIndex
CREATE INDEX "BonusAward_ruleVersion_idx" ON "BonusAward"("ruleVersion");

-- CreateIndex
CREATE INDEX "BonusAward_player_idx" ON "BonusAward"("player");

-- CreateIndex
CREATE UNIQUE INDEX "BonusAward_idempotency_uq" ON "BonusAward"("tenant", "idempotencyKey");

-- CreateIndex
CREATE INDEX "BonusTransaction_tenant_idx" ON "BonusTransaction"("tenant");

-- CreateIndex
CREATE INDEX "BonusTransaction_award_idx" ON "BonusTransaction"("award");

-- CreateIndex
CREATE INDEX "BonusTransaction_wager_idx" ON "BonusTransaction"("wager");

-- CreateIndex
CREATE INDEX "BonusTransaction_journalTransaction_idx" ON "BonusTransaction"("journalTransaction");

-- CreateIndex
CREATE UNIQUE INDEX "BonusTransaction_idempotency_uq" ON "BonusTransaction"("tenant", "idempotencyKey");

-- CreateIndex
CREATE INDEX "BrandLocale_tenant_idx" ON "BrandLocale"("tenant");

-- CreateIndex
CREATE INDEX "BrandLocale_brand_idx" ON "BrandLocale"("brand");

-- CreateIndex
CREATE UNIQUE INDEX "BrandLocale_terms_uq" ON "BrandLocale"("tenant", "brand", "locale", "termsVersion");

-- CreateIndex
CREATE INDEX "CampaignBudget_tenant_idx" ON "CampaignBudget"("tenant");

-- CreateIndex
CREATE INDEX "CampaignBudget_promotion_idx" ON "CampaignBudget"("promotion");

-- CreateIndex
CREATE INDEX "CashOutAcceptance_tenant_idx" ON "CashOutAcceptance"("tenant");

-- CreateIndex
CREATE INDEX "CashOutAcceptance_offer_idx" ON "CashOutAcceptance"("offer");

-- CreateIndex
CREATE INDEX "CashOutAcceptance_wager_idx" ON "CashOutAcceptance"("wager");

-- CreateIndex
CREATE INDEX "CashOutAcceptance_player_idx" ON "CashOutAcceptance"("player");

-- CreateIndex
CREATE INDEX "CashOutAcceptance_journalTransaction_idx" ON "CashOutAcceptance"("journalTransaction");

-- CreateIndex
CREATE INDEX "CashOutAcceptance_reversalOf_idx" ON "CashOutAcceptance"("reversalOf");

-- CreateIndex
CREATE UNIQUE INDEX "CashOutAcceptance_idempotency_uq" ON "CashOutAcceptance"("tenant", "idempotencyKey");

-- CreateIndex
CREATE INDEX "CompetitionStage_tenant_idx" ON "CompetitionStage"("tenant");

-- CreateIndex
CREATE INDEX "CompetitionStage_season_idx" ON "CompetitionStage"("season");

-- CreateIndex
CREATE UNIQUE INDEX "CompetitionStage_season_key_uq" ON "CompetitionStage"("tenant", "season", "key");

-- CreateIndex
CREATE INDEX "ConfigDefinition_tenant_idx" ON "ConfigDefinition"("tenant");

-- CreateIndex
CREATE UNIQUE INDEX "ConfigDefinition_key_uq" ON "ConfigDefinition"("tenant", "key");

-- CreateIndex
CREATE INDEX "CorrelationGroup_tenant_idx" ON "CorrelationGroup"("tenant");

-- CreateIndex
CREATE UNIQUE INDEX "CorrelationGroup_key_version_uq" ON "CorrelationGroup"("tenant", "key", "version");

-- CreateIndex
CREATE INDEX "CorrelationRule_tenant_idx" ON "CorrelationRule"("tenant");

-- CreateIndex
CREATE INDEX "CorrelationRule_group_idx" ON "CorrelationRule"("group");

-- CreateIndex
CREATE UNIQUE INDEX "CurrencyDefinition_code_key" ON "CurrencyDefinition"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerCredential_emailDigest_key" ON "CustomerCredential"("emailDigest");

-- CreateIndex
CREATE INDEX "CustomerCredential_tenant_idx" ON "CustomerCredential"("tenant");

-- CreateIndex
CREATE INDEX "CustomerCredential_player_idx" ON "CustomerCredential"("player");

-- CreateIndex
CREATE INDEX "CustomerDevice_tenant_idx" ON "CustomerDevice"("tenant");

-- CreateIndex
CREATE INDEX "CustomerDevice_player_idx" ON "CustomerDevice"("player");

-- CreateIndex
CREATE INDEX "CustomerDevice_session_idx" ON "CustomerDevice"("session");

-- CreateIndex
CREATE INDEX "CustomerFavorite_tenant_idx" ON "CustomerFavorite"("tenant");

-- CreateIndex
CREATE INDEX "CustomerFavorite_player_idx" ON "CustomerFavorite"("player");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerFavorite_target_uq" ON "CustomerFavorite"("tenant", "player", "targetType", "targetId");

-- CreateIndex
CREATE INDEX "CustomerPrivacyRequest_tenant_idx" ON "CustomerPrivacyRequest"("tenant");

-- CreateIndex
CREATE INDEX "CustomerPrivacyRequest_player_idx" ON "CustomerPrivacyRequest"("player");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerRecoveryToken_tokenDigest_key" ON "CustomerRecoveryToken"("tokenDigest");

-- CreateIndex
CREATE INDEX "CustomerRecoveryToken_tenant_idx" ON "CustomerRecoveryToken"("tenant");

-- CreateIndex
CREATE INDEX "CustomerRecoveryToken_player_idx" ON "CustomerRecoveryToken"("player");

-- CreateIndex
CREATE INDEX "DataExport_tenant_idx" ON "DataExport"("tenant");

-- CreateIndex
CREATE INDEX "DataExport_approvalRequest_idx" ON "DataExport"("approvalRequest");

-- CreateIndex
CREATE INDEX "EventScheduleChange_tenant_idx" ON "EventScheduleChange"("tenant");

-- CreateIndex
CREATE INDEX "EventScheduleChange_event_idx" ON "EventScheduleChange"("event");

-- CreateIndex
CREATE INDEX "FeatureFlag_tenant_idx" ON "FeatureFlag"("tenant");

-- CreateIndex
CREATE INDEX "FeatureFlag_approvalRequest_idx" ON "FeatureFlag"("approvalRequest");

-- CreateIndex
CREATE UNIQUE INDEX "FeatureFlag_scope_uq" ON "FeatureFlag"("tenant", "key", "scopeType", "scopeId");

-- CreateIndex
CREATE INDEX "FeedHealthSnapshot_tenant_idx" ON "FeedHealthSnapshot"("tenant");

-- CreateIndex
CREATE INDEX "FeedHealthSnapshot_providerConnection_idx" ON "FeedHealthSnapshot"("providerConnection");

-- CreateIndex
CREATE INDEX "HouseRuleVersion_tenant_idx" ON "HouseRuleVersion"("tenant");

-- CreateIndex
CREATE INDEX "HouseRuleVersion_approvalRequest_idx" ON "HouseRuleVersion"("approvalRequest");

-- CreateIndex
CREATE UNIQUE INDEX "HouseRuleVersion_name_version_uq" ON "HouseRuleVersion"("tenant", "name", "version");

-- CreateIndex
CREATE INDEX "IntegrityCase_tenant_idx" ON "IntegrityCase"("tenant");

-- CreateIndex
CREATE INDEX "IntegrityCase_player_idx" ON "IntegrityCase"("player");

-- CreateIndex
CREATE INDEX "IntegrityCase_event_idx" ON "IntegrityCase"("event");

-- CreateIndex
CREATE INDEX "IntegrityCase_wager_idx" ON "IntegrityCase"("wager");

-- CreateIndex
CREATE INDEX "IntegrityCase_providerConnection_idx" ON "IntegrityCase"("providerConnection");

-- CreateIndex
CREATE INDEX "JurisdictionPolicyVersion_tenant_idx" ON "JurisdictionPolicyVersion"("tenant");

-- CreateIndex
CREATE INDEX "JurisdictionPolicyVersion_jurisdiction_idx" ON "JurisdictionPolicyVersion"("jurisdiction");

-- CreateIndex
CREATE UNIQUE INDEX "JurisdictionPolicyVersion_scope_version_uq" ON "JurisdictionPolicyVersion"("tenant", "jurisdiction", "version");

-- CreateIndex
CREATE INDEX "LedgerAdjustmentRequest_tenant_idx" ON "LedgerAdjustmentRequest"("tenant");

-- CreateIndex
CREATE INDEX "LedgerAdjustmentRequest_player_idx" ON "LedgerAdjustmentRequest"("player");

-- CreateIndex
CREATE INDEX "LedgerAdjustmentRequest_account_idx" ON "LedgerAdjustmentRequest"("account");

-- CreateIndex
CREATE INDEX "LedgerAdjustmentRequest_approvalRequest_idx" ON "LedgerAdjustmentRequest"("approvalRequest");

-- CreateIndex
CREATE INDEX "LedgerAdjustmentRequest_journalTransaction_idx" ON "LedgerAdjustmentRequest"("journalTransaction");

-- CreateIndex
CREATE INDEX "LegalEntity_tenant_idx" ON "LegalEntity"("tenant");

-- CreateIndex
CREATE UNIQUE INDEX "LegalEntity_registration_uq" ON "LegalEntity"("tenant", "countryCode", "registrationReference");

-- CreateIndex
CREATE INDEX "MarketDefinition_tenant_idx" ON "MarketDefinition"("tenant");

-- CreateIndex
CREATE UNIQUE INDEX "MarketDefinition_key_version_uq" ON "MarketDefinition"("tenant", "key", "version");

-- CreateIndex
CREATE INDEX "Notification_tenant_idx" ON "Notification"("tenant");

-- CreateIndex
CREATE INDEX "Notification_player_idx" ON "Notification"("player");

-- CreateIndex
CREATE INDEX "Notification_user_idx" ON "Notification"("user");

-- CreateIndex
CREATE INDEX "Notification_providerConnection_idx" ON "Notification"("providerConnection");

-- CreateIndex
CREATE INDEX "OperatorChannel_tenant_idx" ON "OperatorChannel"("tenant");

-- CreateIndex
CREATE INDEX "OperatorChannel_legalEntity_idx" ON "OperatorChannel"("legalEntity");

-- CreateIndex
CREATE INDEX "OperatorChannel_operatorJurisdiction_idx" ON "OperatorChannel"("operatorJurisdiction");

-- CreateIndex
CREATE INDEX "OperatorChannel_brand_idx" ON "OperatorChannel"("brand");

-- CreateIndex
CREATE UNIQUE INDEX "OperatorChannel_key_uq" ON "OperatorChannel"("tenant", "key");

-- CreateIndex
CREATE INDEX "PamSubjectMapping_tenant_idx" ON "PamSubjectMapping"("tenant");

-- CreateIndex
CREATE INDEX "PamSubjectMapping_providerConnection_idx" ON "PamSubjectMapping"("providerConnection");

-- CreateIndex
CREATE INDEX "PamSubjectMapping_player_idx" ON "PamSubjectMapping"("player");

-- CreateIndex
CREATE UNIQUE INDEX "PamSubjectMapping_subject_uq" ON "PamSubjectMapping"("tenant", "providerConnection", "externalSubjectDigest");

-- CreateIndex
CREATE INDEX "PlayerStatement_tenant_idx" ON "PlayerStatement"("tenant");

-- CreateIndex
CREATE INDEX "PlayerStatement_player_idx" ON "PlayerStatement"("player");

-- CreateIndex
CREATE INDEX "Promotion_tenant_idx" ON "Promotion"("tenant");

-- CreateIndex
CREATE INDEX "Promotion_jurisdiction_idx" ON "Promotion"("jurisdiction");

-- CreateIndex
CREATE INDEX "Promotion_brand_idx" ON "Promotion"("brand");

-- CreateIndex
CREATE INDEX "Promotion_approvalRequest_idx" ON "Promotion"("approvalRequest");

-- CreateIndex
CREATE UNIQUE INDEX "Promotion_key_uq" ON "Promotion"("tenant", "key");

-- CreateIndex
CREATE INDEX "PromotionRedemption_tenant_idx" ON "PromotionRedemption"("tenant");

-- CreateIndex
CREATE INDEX "PromotionRedemption_promotion_idx" ON "PromotionRedemption"("promotion");

-- CreateIndex
CREATE INDEX "PromotionRedemption_ruleVersion_idx" ON "PromotionRedemption"("ruleVersion");

-- CreateIndex
CREATE INDEX "PromotionRedemption_player_idx" ON "PromotionRedemption"("player");

-- CreateIndex
CREATE INDEX "PromotionRedemption_bonusAward_idx" ON "PromotionRedemption"("bonusAward");

-- CreateIndex
CREATE UNIQUE INDEX "PromotionRedemption_player_key_uq" ON "PromotionRedemption"("tenant", "player", "promotion", "idempotencyKey");

-- CreateIndex
CREATE INDEX "PromotionRuleVersion_tenant_idx" ON "PromotionRuleVersion"("tenant");

-- CreateIndex
CREATE INDEX "PromotionRuleVersion_promotion_idx" ON "PromotionRuleVersion"("promotion");

-- CreateIndex
CREATE UNIQUE INDEX "PromotionRuleVersion_promotion_version_uq" ON "PromotionRuleVersion"("tenant", "promotion", "version");

-- CreateIndex
CREATE INDEX "ProviderHealthSample_tenant_idx" ON "ProviderHealthSample"("tenant");

-- CreateIndex
CREATE INDEX "ProviderHealthSample_providerConnection_idx" ON "ProviderHealthSample"("providerConnection");

-- CreateIndex
CREATE INDEX "Region_tenant_idx" ON "Region"("tenant");

-- CreateIndex
CREATE UNIQUE INDEX "Region_key_uq" ON "Region"("tenant", "key");

-- CreateIndex
CREATE INDEX "ReportArtifact_tenant_idx" ON "ReportArtifact"("tenant");

-- CreateIndex
CREATE INDEX "ReportArtifact_report_idx" ON "ReportArtifact"("report");

-- CreateIndex
CREATE INDEX "RetentionExecution_tenant_idx" ON "RetentionExecution"("tenant");

-- CreateIndex
CREATE INDEX "RetentionExecution_policyVersion_idx" ON "RetentionExecution"("policyVersion");

-- CreateIndex
CREATE INDEX "RetentionExecution_approvalRequest_idx" ON "RetentionExecution"("approvalRequest");

-- CreateIndex
CREATE INDEX "RetentionPolicyVersion_tenant_idx" ON "RetentionPolicyVersion"("tenant");

-- CreateIndex
CREATE INDEX "RetentionPolicyVersion_jurisdiction_idx" ON "RetentionPolicyVersion"("jurisdiction");

-- CreateIndex
CREATE INDEX "SafeguardingAccount_tenant_idx" ON "SafeguardingAccount"("tenant");

-- CreateIndex
CREATE INDEX "SafeguardingAccount_legalEntity_idx" ON "SafeguardingAccount"("legalEntity");

-- CreateIndex
CREATE INDEX "SafeguardingAccount_providerConnection_idx" ON "SafeguardingAccount"("providerConnection");

-- CreateIndex
CREATE INDEX "SafeguardingReconciliation_tenant_idx" ON "SafeguardingReconciliation"("tenant");

-- CreateIndex
CREATE INDEX "SafeguardingReconciliation_safeguardingAccount_idx" ON "SafeguardingReconciliation"("safeguardingAccount");

-- CreateIndex
CREATE INDEX "SafeguardingReconciliation_reconciliationRun_idx" ON "SafeguardingReconciliation"("reconciliationRun");

-- CreateIndex
CREATE INDEX "ScheduledJob_tenant_idx" ON "ScheduledJob"("tenant");

-- CreateIndex
CREATE INDEX "ScheduledJob_claim_idx" ON "ScheduledJob"("status", "dueAt", "leaseUntil");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduledJob_idempotency_uq" ON "ScheduledJob"("tenant", "idempotencyKey");

-- CreateIndex
CREATE INDEX "Season_tenant_idx" ON "Season"("tenant");

-- CreateIndex
CREATE INDEX "Season_competition_idx" ON "Season"("competition");

-- CreateIndex
CREATE UNIQUE INDEX "Season_competition_key_uq" ON "Season"("tenant", "competition", "key");

-- CreateIndex
CREATE INDEX "SettlementLine_tenant_idx" ON "SettlementLine"("tenant");

-- CreateIndex
CREATE INDEX "SettlementLine_settlement_idx" ON "SettlementLine"("settlement");

-- CreateIndex
CREATE INDEX "SettlementLine_wagerPart_idx" ON "SettlementLine"("wagerPart");

-- CreateIndex
CREATE INDEX "SettlementLine_wagerLeg_idx" ON "SettlementLine"("wagerLeg");

-- CreateIndex
CREATE INDEX "SettlementRun_tenant_idx" ON "SettlementRun"("tenant");

-- CreateIndex
CREATE INDEX "SettlementRun_resultVersion_idx" ON "SettlementRun"("resultVersion");

-- CreateIndex
CREATE UNIQUE INDEX "SettlementRun_input_uq" ON "SettlementRun"("tenant", "inputHash");

-- CreateIndex
CREATE INDEX "SupportCase_tenant_idx" ON "SupportCase"("tenant");

-- CreateIndex
CREATE INDEX "SupportCase_player_idx" ON "SupportCase"("player");

-- CreateIndex
CREATE INDEX "SupportCase_wager_idx" ON "SupportCase"("wager");

-- CreateIndex
CREATE INDEX "SupportCase_paymentIntent_idx" ON "SupportCase"("paymentIntent");

-- CreateIndex
CREATE INDEX "SupportCase_dispute_idx" ON "SupportCase"("dispute");

-- CreateIndex
CREATE INDEX "SupportCaseEvent_tenant_idx" ON "SupportCaseEvent"("tenant");

-- CreateIndex
CREATE INDEX "SupportCaseEvent_supportCase_idx" ON "SupportCaseEvent"("supportCase");

-- CreateIndex
CREATE INDEX "TaxRuleVersion_tenant_idx" ON "TaxRuleVersion"("tenant");

-- CreateIndex
CREATE INDEX "TaxRuleVersion_jurisdiction_idx" ON "TaxRuleVersion"("jurisdiction");

-- CreateIndex
CREATE INDEX "TenantCurrency_tenant_idx" ON "TenantCurrency"("tenant");

-- CreateIndex
CREATE INDEX "TenantCurrency_currency_idx" ON "TenantCurrency"("currency");

-- CreateIndex
CREATE UNIQUE INDEX "TenantCurrency_currency_uq" ON "TenantCurrency"("tenant", "currency");

-- CreateIndex
CREATE INDEX "TraderOverride_tenant_idx" ON "TraderOverride"("tenant");

-- CreateIndex
CREATE INDEX "TraderOverride_approvalRequest_idx" ON "TraderOverride"("approvalRequest");

-- CreateIndex
CREATE INDEX "TradingReplayRun_tenant_idx" ON "TradingReplayRun"("tenant");

-- CreateIndex
CREATE INDEX "TradingReplayRun_providerConnection_idx" ON "TradingReplayRun"("providerConnection");

-- CreateIndex
CREATE INDEX "Venue_tenant_idx" ON "Venue"("tenant");

-- CreateIndex
CREATE UNIQUE INDEX "Venue_key_uq" ON "Venue"("tenant", "key");

-- CreateIndex
CREATE INDEX "WagerPart_tenant_idx" ON "WagerPart"("tenant");

-- CreateIndex
CREATE INDEX "WagerPart_wager_idx" ON "WagerPart"("wager");

-- CreateIndex
CREATE INDEX "WagerPart_settlement_idx" ON "WagerPart"("settlement");

-- CreateIndex
CREATE UNIQUE INDEX "WagerPart_wager_index_uq" ON "WagerPart"("tenant", "wager", "partIndex");

-- CreateIndex
CREATE INDEX "Competition_region_idx" ON "Competition"("region");

-- CreateIndex
CREATE INDEX "Dispute_approvalRequest_idx" ON "Dispute"("approvalRequest");

-- CreateIndex
CREATE INDEX "Event_season_idx" ON "Event"("season");

-- CreateIndex
CREATE INDEX "Event_stage_idx" ON "Event"("stage");

-- CreateIndex
CREATE INDEX "Event_venue_idx" ON "Event"("venue");

-- CreateIndex
CREATE INDEX "Market_definition_idx" ON "Market"("definition");

-- CreateIndex
CREATE INDEX "PaymentIntent_hold_idx" ON "PaymentIntent"("hold");

-- CreateIndex
CREATE INDEX "ProviderConnection_legalEntity_idx" ON "ProviderConnection"("legalEntity");

-- CreateIndex
CREATE INDEX "ProviderConnection_jurisdiction_idx" ON "ProviderConnection"("jurisdiction");

-- CreateIndex
CREATE INDEX "Settlement_settlementRun_idx" ON "Settlement"("settlementRun");

-- CreateIndex
CREATE INDEX "Wager_legalEntity_idx" ON "Wager"("legalEntity");

-- CreateIndex
CREATE INDEX "Wager_operatorJurisdiction_idx" ON "Wager"("operatorJurisdiction");

-- CreateIndex
CREATE INDEX "Wager_brand_idx" ON "Wager"("brand");

-- CreateIndex
CREATE INDEX "Wager_channel_idx" ON "Wager"("channel");

-- CreateIndex
CREATE INDEX "WagerLeg_wagerPart_idx" ON "WagerLeg"("wagerPart");

-- AddForeignKey
ALTER TABLE "Competition" ADD CONSTRAINT "Competition_region_fkey" FOREIGN KEY ("region") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_season_fkey" FOREIGN KEY ("season") REFERENCES "Season"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_stage_fkey" FOREIGN KEY ("stage") REFERENCES "CompetitionStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_venue_fkey" FOREIGN KEY ("venue") REFERENCES "Venue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Market" ADD CONSTRAINT "Market_definition_fkey" FOREIGN KEY ("definition") REFERENCES "MarketDefinition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderConnection" ADD CONSTRAINT "ProviderConnection_legalEntity_fkey" FOREIGN KEY ("legalEntity") REFERENCES "LegalEntity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderConnection" ADD CONSTRAINT "ProviderConnection_jurisdiction_fkey" FOREIGN KEY ("jurisdiction") REFERENCES "Jurisdiction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settlement" ADD CONSTRAINT "Settlement_settlementRun_fkey" FOREIGN KEY ("settlementRun") REFERENCES "SettlementRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wager" ADD CONSTRAINT "Wager_legalEntity_fkey" FOREIGN KEY ("legalEntity") REFERENCES "LegalEntity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wager" ADD CONSTRAINT "Wager_operatorJurisdiction_fkey" FOREIGN KEY ("operatorJurisdiction") REFERENCES "OperatorJurisdiction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wager" ADD CONSTRAINT "Wager_brand_fkey" FOREIGN KEY ("brand") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wager" ADD CONSTRAINT "Wager_channel_fkey" FOREIGN KEY ("channel") REFERENCES "OperatorChannel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WagerLeg" ADD CONSTRAINT "WagerLeg_wagerPart_fkey" FOREIGN KEY ("wagerPart") REFERENCES "WagerPart"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_approvalRequest_fkey" FOREIGN KEY ("approvalRequest") REFERENCES "ApprovalRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentIntent" ADD CONSTRAINT "PaymentIntent_hold_fkey" FOREIGN KEY ("hold") REFERENCES "Hold"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerQuoteLegTerms" ADD CONSTRAINT "CustomerQuoteLegTerms_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerQuoteLegTerms" ADD CONSTRAINT "CustomerQuoteLegTerms_player_fkey" FOREIGN KEY ("player") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerQuoteLegTerms" ADD CONSTRAINT "CustomerQuoteLegTerms_quote_fkey" FOREIGN KEY ("quote") REFERENCES "Quote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessReview" ADD CONSTRAINT "AccessReview_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountClosure" ADD CONSTRAINT "AccountClosure_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountClosure" ADD CONSTRAINT "AccountClosure_player_fkey" FOREIGN KEY ("player") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdapterCertificationRun" ADD CONSTRAINT "AdapterCertificationRun_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdapterCertificationRun" ADD CONSTRAINT "AdapterCertificationRun_providerConnection_fkey" FOREIGN KEY ("providerConnection") REFERENCES "ProviderConnection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateAttribution" ADD CONSTRAINT "AffiliateAttribution_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateAttribution" ADD CONSTRAINT "AffiliateAttribution_player_fkey" FOREIGN KEY ("player") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffordabilityAssessment" ADD CONSTRAINT "AffordabilityAssessment_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffordabilityAssessment" ADD CONSTRAINT "AffordabilityAssessment_player_fkey" FOREIGN KEY ("player") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BonusAward" ADD CONSTRAINT "BonusAward_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BonusAward" ADD CONSTRAINT "BonusAward_promotion_fkey" FOREIGN KEY ("promotion") REFERENCES "Promotion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BonusAward" ADD CONSTRAINT "BonusAward_ruleVersion_fkey" FOREIGN KEY ("ruleVersion") REFERENCES "PromotionRuleVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BonusAward" ADD CONSTRAINT "BonusAward_player_fkey" FOREIGN KEY ("player") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BonusTransaction" ADD CONSTRAINT "BonusTransaction_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BonusTransaction" ADD CONSTRAINT "BonusTransaction_award_fkey" FOREIGN KEY ("award") REFERENCES "BonusAward"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BonusTransaction" ADD CONSTRAINT "BonusTransaction_wager_fkey" FOREIGN KEY ("wager") REFERENCES "Wager"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BonusTransaction" ADD CONSTRAINT "BonusTransaction_journalTransaction_fkey" FOREIGN KEY ("journalTransaction") REFERENCES "JournalTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandLocale" ADD CONSTRAINT "BrandLocale_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandLocale" ADD CONSTRAINT "BrandLocale_brand_fkey" FOREIGN KEY ("brand") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignBudget" ADD CONSTRAINT "CampaignBudget_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignBudget" ADD CONSTRAINT "CampaignBudget_promotion_fkey" FOREIGN KEY ("promotion") REFERENCES "Promotion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashOutAcceptance" ADD CONSTRAINT "CashOutAcceptance_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashOutAcceptance" ADD CONSTRAINT "CashOutAcceptance_offer_fkey" FOREIGN KEY ("offer") REFERENCES "CashOutOffer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashOutAcceptance" ADD CONSTRAINT "CashOutAcceptance_wager_fkey" FOREIGN KEY ("wager") REFERENCES "Wager"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashOutAcceptance" ADD CONSTRAINT "CashOutAcceptance_player_fkey" FOREIGN KEY ("player") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashOutAcceptance" ADD CONSTRAINT "CashOutAcceptance_journalTransaction_fkey" FOREIGN KEY ("journalTransaction") REFERENCES "JournalTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashOutAcceptance" ADD CONSTRAINT "CashOutAcceptance_reversalOf_fkey" FOREIGN KEY ("reversalOf") REFERENCES "CashOutAcceptance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitionStage" ADD CONSTRAINT "CompetitionStage_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitionStage" ADD CONSTRAINT "CompetitionStage_season_fkey" FOREIGN KEY ("season") REFERENCES "Season"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfigDefinition" ADD CONSTRAINT "ConfigDefinition_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorrelationGroup" ADD CONSTRAINT "CorrelationGroup_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorrelationRule" ADD CONSTRAINT "CorrelationRule_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorrelationRule" ADD CONSTRAINT "CorrelationRule_group_fkey" FOREIGN KEY ("group") REFERENCES "CorrelationGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerCredential" ADD CONSTRAINT "CustomerCredential_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerCredential" ADD CONSTRAINT "CustomerCredential_player_fkey" FOREIGN KEY ("player") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerDevice" ADD CONSTRAINT "CustomerDevice_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerDevice" ADD CONSTRAINT "CustomerDevice_player_fkey" FOREIGN KEY ("player") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerDevice" ADD CONSTRAINT "CustomerDevice_session_fkey" FOREIGN KEY ("session") REFERENCES "CustomerSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerFavorite" ADD CONSTRAINT "CustomerFavorite_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerFavorite" ADD CONSTRAINT "CustomerFavorite_player_fkey" FOREIGN KEY ("player") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerPrivacyRequest" ADD CONSTRAINT "CustomerPrivacyRequest_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerPrivacyRequest" ADD CONSTRAINT "CustomerPrivacyRequest_player_fkey" FOREIGN KEY ("player") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerRecoveryToken" ADD CONSTRAINT "CustomerRecoveryToken_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerRecoveryToken" ADD CONSTRAINT "CustomerRecoveryToken_player_fkey" FOREIGN KEY ("player") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataExport" ADD CONSTRAINT "DataExport_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataExport" ADD CONSTRAINT "DataExport_approvalRequest_fkey" FOREIGN KEY ("approvalRequest") REFERENCES "ApprovalRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventScheduleChange" ADD CONSTRAINT "EventScheduleChange_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventScheduleChange" ADD CONSTRAINT "EventScheduleChange_event_fkey" FOREIGN KEY ("event") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureFlag" ADD CONSTRAINT "FeatureFlag_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureFlag" ADD CONSTRAINT "FeatureFlag_approvalRequest_fkey" FOREIGN KEY ("approvalRequest") REFERENCES "ApprovalRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedHealthSnapshot" ADD CONSTRAINT "FeedHealthSnapshot_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedHealthSnapshot" ADD CONSTRAINT "FeedHealthSnapshot_providerConnection_fkey" FOREIGN KEY ("providerConnection") REFERENCES "ProviderConnection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HouseRuleVersion" ADD CONSTRAINT "HouseRuleVersion_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HouseRuleVersion" ADD CONSTRAINT "HouseRuleVersion_approvalRequest_fkey" FOREIGN KEY ("approvalRequest") REFERENCES "ApprovalRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrityCase" ADD CONSTRAINT "IntegrityCase_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrityCase" ADD CONSTRAINT "IntegrityCase_player_fkey" FOREIGN KEY ("player") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrityCase" ADD CONSTRAINT "IntegrityCase_event_fkey" FOREIGN KEY ("event") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrityCase" ADD CONSTRAINT "IntegrityCase_wager_fkey" FOREIGN KEY ("wager") REFERENCES "Wager"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrityCase" ADD CONSTRAINT "IntegrityCase_providerConnection_fkey" FOREIGN KEY ("providerConnection") REFERENCES "ProviderConnection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JurisdictionPolicyVersion" ADD CONSTRAINT "JurisdictionPolicyVersion_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JurisdictionPolicyVersion" ADD CONSTRAINT "JurisdictionPolicyVersion_jurisdiction_fkey" FOREIGN KEY ("jurisdiction") REFERENCES "Jurisdiction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerAdjustmentRequest" ADD CONSTRAINT "LedgerAdjustmentRequest_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerAdjustmentRequest" ADD CONSTRAINT "LedgerAdjustmentRequest_player_fkey" FOREIGN KEY ("player") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerAdjustmentRequest" ADD CONSTRAINT "LedgerAdjustmentRequest_account_fkey" FOREIGN KEY ("account") REFERENCES "LedgerAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerAdjustmentRequest" ADD CONSTRAINT "LedgerAdjustmentRequest_approvalRequest_fkey" FOREIGN KEY ("approvalRequest") REFERENCES "ApprovalRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerAdjustmentRequest" ADD CONSTRAINT "LedgerAdjustmentRequest_journalTransaction_fkey" FOREIGN KEY ("journalTransaction") REFERENCES "JournalTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegalEntity" ADD CONSTRAINT "LegalEntity_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketDefinition" ADD CONSTRAINT "MarketDefinition_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_player_fkey" FOREIGN KEY ("player") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_user_fkey" FOREIGN KEY ("user") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_providerConnection_fkey" FOREIGN KEY ("providerConnection") REFERENCES "ProviderConnection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperatorChannel" ADD CONSTRAINT "OperatorChannel_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperatorChannel" ADD CONSTRAINT "OperatorChannel_legalEntity_fkey" FOREIGN KEY ("legalEntity") REFERENCES "LegalEntity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperatorChannel" ADD CONSTRAINT "OperatorChannel_operatorJurisdiction_fkey" FOREIGN KEY ("operatorJurisdiction") REFERENCES "OperatorJurisdiction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperatorChannel" ADD CONSTRAINT "OperatorChannel_brand_fkey" FOREIGN KEY ("brand") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PamSubjectMapping" ADD CONSTRAINT "PamSubjectMapping_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PamSubjectMapping" ADD CONSTRAINT "PamSubjectMapping_providerConnection_fkey" FOREIGN KEY ("providerConnection") REFERENCES "ProviderConnection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PamSubjectMapping" ADD CONSTRAINT "PamSubjectMapping_player_fkey" FOREIGN KEY ("player") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerStatement" ADD CONSTRAINT "PlayerStatement_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerStatement" ADD CONSTRAINT "PlayerStatement_player_fkey" FOREIGN KEY ("player") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_jurisdiction_fkey" FOREIGN KEY ("jurisdiction") REFERENCES "Jurisdiction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_brand_fkey" FOREIGN KEY ("brand") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_approvalRequest_fkey" FOREIGN KEY ("approvalRequest") REFERENCES "ApprovalRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionRedemption" ADD CONSTRAINT "PromotionRedemption_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionRedemption" ADD CONSTRAINT "PromotionRedemption_promotion_fkey" FOREIGN KEY ("promotion") REFERENCES "Promotion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionRedemption" ADD CONSTRAINT "PromotionRedemption_ruleVersion_fkey" FOREIGN KEY ("ruleVersion") REFERENCES "PromotionRuleVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionRedemption" ADD CONSTRAINT "PromotionRedemption_player_fkey" FOREIGN KEY ("player") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionRedemption" ADD CONSTRAINT "PromotionRedemption_bonusAward_fkey" FOREIGN KEY ("bonusAward") REFERENCES "BonusAward"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionRuleVersion" ADD CONSTRAINT "PromotionRuleVersion_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionRuleVersion" ADD CONSTRAINT "PromotionRuleVersion_promotion_fkey" FOREIGN KEY ("promotion") REFERENCES "Promotion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderHealthSample" ADD CONSTRAINT "ProviderHealthSample_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderHealthSample" ADD CONSTRAINT "ProviderHealthSample_providerConnection_fkey" FOREIGN KEY ("providerConnection") REFERENCES "ProviderConnection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Region" ADD CONSTRAINT "Region_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportArtifact" ADD CONSTRAINT "ReportArtifact_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportArtifact" ADD CONSTRAINT "ReportArtifact_report_fkey" FOREIGN KEY ("report") REFERENCES "ComplianceReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetentionExecution" ADD CONSTRAINT "RetentionExecution_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetentionExecution" ADD CONSTRAINT "RetentionExecution_policyVersion_fkey" FOREIGN KEY ("policyVersion") REFERENCES "RetentionPolicyVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetentionExecution" ADD CONSTRAINT "RetentionExecution_approvalRequest_fkey" FOREIGN KEY ("approvalRequest") REFERENCES "ApprovalRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetentionPolicyVersion" ADD CONSTRAINT "RetentionPolicyVersion_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetentionPolicyVersion" ADD CONSTRAINT "RetentionPolicyVersion_jurisdiction_fkey" FOREIGN KEY ("jurisdiction") REFERENCES "Jurisdiction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafeguardingAccount" ADD CONSTRAINT "SafeguardingAccount_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafeguardingAccount" ADD CONSTRAINT "SafeguardingAccount_legalEntity_fkey" FOREIGN KEY ("legalEntity") REFERENCES "LegalEntity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafeguardingAccount" ADD CONSTRAINT "SafeguardingAccount_providerConnection_fkey" FOREIGN KEY ("providerConnection") REFERENCES "ProviderConnection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafeguardingReconciliation" ADD CONSTRAINT "SafeguardingReconciliation_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafeguardingReconciliation" ADD CONSTRAINT "SafeguardingReconciliation_safeguardingAccount_fkey" FOREIGN KEY ("safeguardingAccount") REFERENCES "SafeguardingAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafeguardingReconciliation" ADD CONSTRAINT "SafeguardingReconciliation_reconciliationRun_fkey" FOREIGN KEY ("reconciliationRun") REFERENCES "ReconciliationRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledJob" ADD CONSTRAINT "ScheduledJob_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Season" ADD CONSTRAINT "Season_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Season" ADD CONSTRAINT "Season_competition_fkey" FOREIGN KEY ("competition") REFERENCES "Competition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SettlementLine" ADD CONSTRAINT "SettlementLine_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SettlementLine" ADD CONSTRAINT "SettlementLine_settlement_fkey" FOREIGN KEY ("settlement") REFERENCES "Settlement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SettlementLine" ADD CONSTRAINT "SettlementLine_wagerPart_fkey" FOREIGN KEY ("wagerPart") REFERENCES "WagerPart"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SettlementLine" ADD CONSTRAINT "SettlementLine_wagerLeg_fkey" FOREIGN KEY ("wagerLeg") REFERENCES "WagerLeg"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SettlementRun" ADD CONSTRAINT "SettlementRun_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SettlementRun" ADD CONSTRAINT "SettlementRun_resultVersion_fkey" FOREIGN KEY ("resultVersion") REFERENCES "ResultVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportCase" ADD CONSTRAINT "SupportCase_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportCase" ADD CONSTRAINT "SupportCase_player_fkey" FOREIGN KEY ("player") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportCase" ADD CONSTRAINT "SupportCase_wager_fkey" FOREIGN KEY ("wager") REFERENCES "Wager"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportCase" ADD CONSTRAINT "SupportCase_paymentIntent_fkey" FOREIGN KEY ("paymentIntent") REFERENCES "PaymentIntent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportCase" ADD CONSTRAINT "SupportCase_dispute_fkey" FOREIGN KEY ("dispute") REFERENCES "Dispute"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportCaseEvent" ADD CONSTRAINT "SupportCaseEvent_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportCaseEvent" ADD CONSTRAINT "SupportCaseEvent_supportCase_fkey" FOREIGN KEY ("supportCase") REFERENCES "SupportCase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxRuleVersion" ADD CONSTRAINT "TaxRuleVersion_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxRuleVersion" ADD CONSTRAINT "TaxRuleVersion_jurisdiction_fkey" FOREIGN KEY ("jurisdiction") REFERENCES "Jurisdiction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantCurrency" ADD CONSTRAINT "TenantCurrency_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantCurrency" ADD CONSTRAINT "TenantCurrency_currency_fkey" FOREIGN KEY ("currency") REFERENCES "CurrencyDefinition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TraderOverride" ADD CONSTRAINT "TraderOverride_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TraderOverride" ADD CONSTRAINT "TraderOverride_approvalRequest_fkey" FOREIGN KEY ("approvalRequest") REFERENCES "ApprovalRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradingReplayRun" ADD CONSTRAINT "TradingReplayRun_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradingReplayRun" ADD CONSTRAINT "TradingReplayRun_providerConnection_fkey" FOREIGN KEY ("providerConnection") REFERENCES "ProviderConnection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venue" ADD CONSTRAINT "Venue_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WagerPart" ADD CONSTRAINT "WagerPart_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WagerPart" ADD CONSTRAINT "WagerPart_wager_fkey" FOREIGN KEY ("wager") REFERENCES "Wager"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WagerPart" ADD CONSTRAINT "WagerPart_settlement_fkey" FOREIGN KEY ("settlement") REFERENCES "Settlement"("id") ON DELETE SET NULL ON UPDATE CASCADE;
