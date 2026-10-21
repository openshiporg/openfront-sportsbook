-- CreateEnum
CREATE TYPE "BrandStatusType" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "EventStatusType" AS ENUM ('SCHEDULED', 'LIVE', 'ENDED', 'CANCELLED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "HoldStatusType" AS ENUM ('ACTIVE', 'CAPTURED', 'RELEASED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "InboxMessageStatusType" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'DEAD');

-- CreateEnum
CREATE TYPE "JournalEntrySideType" AS ENUM ('DEBIT', 'CREDIT');

-- CreateEnum
CREATE TYPE "JournalTransactionStatusType" AS ENUM ('POSTED', 'REVERSED');

-- CreateEnum
CREATE TYPE "JurisdictionStatusType" AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "LedgerAccountAccountClassType" AS ENUM ('ASSET', 'LIABILITY', 'REVENUE', 'EXPENSE', 'EQUITY');

-- CreateEnum
CREATE TYPE "LedgerAccountStatusType" AS ENUM ('ACTIVE', 'FROZEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "MarketStatusType" AS ENUM ('OPEN', 'SUSPENDED', 'CLOSED', 'GRADED');

-- CreateEnum
CREATE TYPE "OperatorJurisdictionStatusType" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "OutboxMessageStatusType" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'DEAD');

-- CreateEnum
CREATE TYPE "PlayerStatusType" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'CLOSED');

-- CreateEnum
CREATE TYPE "PlayerKycStatusType" AS ENUM ('REQUIRED', 'PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PlayerRiskBandType" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "PlayerLimitTypeType" AS ENUM ('DEPOSIT', 'STAKE', 'LOSS', 'SESSION');

-- CreateEnum
CREATE TYPE "PlayerLimitPeriodType" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "PriceSnapshotStatusType" AS ENUM ('OPEN', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "ProviderConnectionCertificationStatusType" AS ENUM ('SANDBOX', 'PENDING', 'CERTIFIED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "ProviderConnectionStatusType" AS ENUM ('ACTIVE', 'DEGRADED', 'DISABLED');

-- CreateEnum
CREATE TYPE "RawEnvelopeDirectionType" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "ResultVersionStatusType" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUPERSEDED');

-- CreateEnum
CREATE TYPE "SelectionStatusType" AS ENUM ('OPEN', 'SUSPENDED', 'CLOSED');

-- CreateEnum
CREATE TYPE "SelfExclusionStatusType" AS ENUM ('ACTIVE', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "SettlementOutcomeType" AS ENUM ('WIN', 'LOSS', 'PUSH', 'VOID', 'DEAD_HEAT');

-- CreateEnum
CREATE TYPE "TenantStatusType" AS ENUM ('ACTIVE', 'SUSPENDED', 'CLOSED');

-- CreateEnum
CREATE TYPE "WagerStatusType" AS ENUM ('ACCEPTED', 'REJECTED', 'OPEN', 'SETTLED', 'VOID');

-- CreateEnum
CREATE TYPE "AMLCaseStatusType" AS ENUM ('OPEN', 'REVIEW', 'CLOSED');

-- CreateEnum
CREATE TYPE "AMLCaseRiskBandType" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "AccountRestrictionStatusType" AS ENUM ('ACTIVE', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "ApprovalRequestStatusType" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "BetSlipStatusType" AS ENUM ('OPEN', 'QUOTED', 'EXPIRED', 'ACCEPTED');

-- CreateEnum
CREATE TYPE "CashOutOfferStatusType" AS ENUM ('OPEN', 'ACCEPTED', 'EXPIRED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "CompetitorStatusType" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ComplianceReportStatusType" AS ENUM ('DRAFT', 'APPROVED', 'SUBMITTED');

-- CreateEnum
CREATE TYPE "DataCorrectionCaseStatusType" AS ENUM ('PENDING', 'APPROVED', 'APPLIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DisputeStatusType" AS ENUM ('OPEN', 'INVESTIGATING', 'RESOLVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "GeoCheckDecisionType" AS ENUM ('ALLOW', 'DENY', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "GeoSessionStatusType" AS ENUM ('ACTIVE', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "IncidentSeverityType" AS ENUM ('SEV1', 'SEV2', 'SEV3', 'SEV4');

-- CreateEnum
CREATE TYPE "IncidentStatusType" AS ENUM ('OPEN', 'MITIGATING', 'RESOLVED');

-- CreateEnum
CREATE TYPE "LegalHoldStatusType" AS ENUM ('ACTIVE', 'RELEASED');

-- CreateEnum
CREATE TYPE "LimitProfileStatusType" AS ENUM ('DRAFT', 'ACTIVE', 'RETIRED');

-- CreateEnum
CREATE TYPE "PaymentAttemptStatusType" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "PaymentIntentTypeType" AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'REFUND', 'CHARGEBACK');

-- CreateEnum
CREATE TYPE "PaymentIntentStatusType" AS ENUM ('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "PlayerIdentityClassificationType" AS ENUM ('RESTRICTED_PII');

-- CreateEnum
CREATE TYPE "ProviderEntityMappingStatusType" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ReconciliationItemStatusType" AS ENUM ('MATCHED', 'OPEN', 'RESOLVED');

-- CreateEnum
CREATE TYPE "ReconciliationRunStatusType" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ResettlementCaseStatusType" AS ENUM ('PENDING', 'APPROVED', 'COMPLETED', 'REJECTED');

-- CreateEnum
CREATE TYPE "RoleGrantStatusType" AS ENUM ('ACTIVE', 'REVOKED');

-- CreateEnum
CREATE TYPE "TaxAssessmentStatusType" AS ENUM ('CALCULATED', 'POSTED', 'REVERSED');

-- CreateEnum
CREATE TYPE "TeamStatusType" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "VerificationCaseTypeType" AS ENUM ('KYC', 'AGE', 'ADDRESS');

-- CreateEnum
CREATE TYPE "VerificationCaseStatusType" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "VerificationCheckDecisionType" AS ENUM ('PENDING', 'PASS', 'FAIL', 'REVIEW');

-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "canManageSportsbook" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "tenant" TEXT;

-- AlterTable
ALTER TABLE "_Todo_todoImages" ADD CONSTRAINT "_Todo_todoImages_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_Todo_todoImages_AB_unique";

-- CreateTable
CREATE TABLE "AcceptanceDecision" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "wager" TEXT,
    "quote" TEXT,
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "rejectionCode" TEXT NOT NULL DEFAULT '',
    "gateResults" JSONB,
    "inputHash" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "AcceptanceDecision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "actorId" TEXT NOT NULL DEFAULT '',
    "action" TEXT NOT NULL DEFAULT '',
    "targetType" TEXT NOT NULL DEFAULT '',
    "targetId" TEXT NOT NULL DEFAULT '',
    "reason" TEXT NOT NULL DEFAULT '',
    "payloadHash" TEXT NOT NULL DEFAULT '',
    "previousHash" TEXT NOT NULL DEFAULT '',
    "hash" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "name" TEXT NOT NULL DEFAULT '',
    "domain" TEXT NOT NULL DEFAULT '',
    "defaultLocale" TEXT NOT NULL DEFAULT '',
    "status" "BrandStatusType" DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Competition" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "sport" TEXT,
    "key" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Competition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeadLetter" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "sourceType" TEXT NOT NULL DEFAULT '',
    "sourceId" TEXT NOT NULL DEFAULT '',
    "reason" TEXT NOT NULL DEFAULT '',
    "attempts" INTEGER,
    "payloadReference" TEXT NOT NULL DEFAULT '',
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "DeadLetter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "competition" TEXT,
    "externalKey" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL DEFAULT '',
    "startAt" TIMESTAMP(3) NOT NULL,
    "status" "EventStatusType" DEFAULT 'SCHEDULED',
    "version" INTEGER DEFAULT 1,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hold" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "account" TEXT,
    "purposeType" TEXT NOT NULL DEFAULT '',
    "purposeId" TEXT NOT NULL DEFAULT '',
    "amountMinor" TEXT NOT NULL DEFAULT '',
    "status" "HoldStatusType" DEFAULT 'ACTIVE',
    "expiresAt" TIMESTAMP(3),
    "version" INTEGER DEFAULT 1,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Hold_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InboxMessage" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "rawEnvelope" TEXT,
    "messageKey" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL DEFAULT '',
    "status" "InboxMessageStatusType" DEFAULT 'PENDING',
    "attempts" INTEGER DEFAULT 0,
    "availableAt" TIMESTAMP(3),
    "leaseUntil" TIMESTAMP(3),
    "lastError" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "InboxMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalEntry" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "transaction" TEXT,
    "account" TEXT,
    "side" "JournalEntrySideType" DEFAULT 'DEBIT',
    "amountMinor" TEXT NOT NULL DEFAULT '',
    "currency" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "JournalEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalTransaction" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "type" TEXT NOT NULL DEFAULT '',
    "idempotencyKey" TEXT NOT NULL DEFAULT '',
    "correlationId" TEXT NOT NULL DEFAULT '',
    "status" "JournalTransactionStatusType" DEFAULT 'POSTED',
    "reversalOf" TEXT,
    "effectiveAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "JournalTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Jurisdiction" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL DEFAULT '',
    "authority" TEXT NOT NULL DEFAULT '',
    "status" "JurisdictionStatusType" DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Jurisdiction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LedgerAccount" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "player" TEXT,
    "key" TEXT NOT NULL DEFAULT '',
    "accountClass" "LedgerAccountAccountClassType" DEFAULT 'ASSET',
    "currency" TEXT NOT NULL DEFAULT '',
    "status" "LedgerAccountStatusType" DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "LedgerAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Market" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "event" TEXT,
    "definitionKey" TEXT NOT NULL DEFAULT '',
    "parameters" JSONB,
    "status" "MarketStatusType" DEFAULT 'OPEN',
    "version" INTEGER DEFAULT 1,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Market_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperatorJurisdiction" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "jurisdiction" TEXT,
    "licenseReference" TEXT NOT NULL DEFAULT '',
    "policyVersion" TEXT NOT NULL DEFAULT '',
    "effectiveFrom" TIMESTAMP(3),
    "effectiveTo" TIMESTAMP(3),
    "status" "OperatorJurisdictionStatusType" DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "OperatorJurisdiction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutboxMessage" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "aggregateType" TEXT NOT NULL DEFAULT '',
    "aggregateId" TEXT NOT NULL DEFAULT '',
    "eventType" TEXT NOT NULL DEFAULT '',
    "payload" JSONB,
    "status" "OutboxMessageStatusType" DEFAULT 'PENDING',
    "attempts" INTEGER DEFAULT 0,
    "maxAttempts" INTEGER DEFAULT 10,
    "availableAt" TIMESTAMP(3),
    "leaseUntil" TIMESTAMP(3),
    "lastError" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "OutboxMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "brand" TEXT,
    "subject" TEXT NOT NULL DEFAULT '',
    "status" "PlayerStatusType" DEFAULT 'PENDING',
    "kycStatus" "PlayerKycStatusType" DEFAULT 'REQUIRED',
    "locale" TEXT NOT NULL DEFAULT '',
    "riskBand" "PlayerRiskBandType" DEFAULT 'LOW',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerLimit" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "player" TEXT,
    "type" "PlayerLimitTypeType" DEFAULT 'DEPOSIT',
    "period" "PlayerLimitPeriodType" DEFAULT 'DAILY',
    "amountMinor" TEXT NOT NULL DEFAULT '',
    "currency" TEXT NOT NULL DEFAULT '',
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "PlayerLimit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceSnapshot" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "selection" TEXT,
    "providerConnection" TEXT,
    "decimalOdds" TEXT NOT NULL DEFAULT '',
    "line" TEXT NOT NULL DEFAULT '',
    "sequence" TEXT NOT NULL DEFAULT '',
    "effectiveAt" TIMESTAMP(3) NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL,
    "rawEnvelope" TEXT,
    "status" "PriceSnapshotStatusType" DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "PriceSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderConnection" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "adapterId" TEXT NOT NULL DEFAULT '',
    "adapterVersion" TEXT NOT NULL DEFAULT '',
    "configReference" TEXT NOT NULL DEFAULT '',
    "capabilities" JSONB,
    "certificationStatus" "ProviderConnectionCertificationStatusType" DEFAULT 'SANDBOX',
    "status" "ProviderConnectionStatusType" DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "ProviderConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "player" TEXT,
    "selection" TEXT,
    "priceSnapshot" TEXT,
    "stakeMinor" TEXT NOT NULL DEFAULT '',
    "currency" TEXT NOT NULL DEFAULT '',
    "decimalOdds" TEXT NOT NULL DEFAULT '',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "termsHash" TEXT NOT NULL DEFAULT '',
    "policyVersion" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RawEnvelope" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "providerConnection" TEXT,
    "direction" "RawEnvelopeDirectionType" DEFAULT 'INBOUND',
    "externalId" TEXT NOT NULL DEFAULT '',
    "schemaVersion" TEXT NOT NULL DEFAULT '',
    "payload" JSONB,
    "payloadHash" TEXT NOT NULL DEFAULT '',
    "receivedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "RawEnvelope_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResultVersion" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "event" TEXT,
    "providerConnection" TEXT,
    "version" INTEGER NOT NULL,
    "status" "ResultVersionStatusType" DEFAULT 'PENDING',
    "payload" JSONB,
    "payloadHash" TEXT NOT NULL DEFAULT '',
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "ResultVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Selection" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "market" TEXT,
    "key" TEXT NOT NULL DEFAULT '',
    "label" TEXT NOT NULL DEFAULT '',
    "status" "SelectionStatusType" DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Selection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SelfExclusion" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "player" TEXT,
    "scope" TEXT NOT NULL DEFAULT '',
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "status" "SelfExclusionStatusType" DEFAULT 'ACTIVE',
    "source" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "SelfExclusion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settlement" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "wager" TEXT,
    "resultVersion" TEXT,
    "version" INTEGER NOT NULL,
    "outcome" "SettlementOutcomeType" DEFAULT 'WIN',
    "payoutMinor" TEXT NOT NULL DEFAULT '',
    "inputHash" TEXT NOT NULL DEFAULT '',
    "journalTransaction" TEXT,
    "reversalOf" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Settlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sport" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "key" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL DEFAULT '',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Sport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "slug" TEXT NOT NULL DEFAULT '',
    "status" "TenantStatusType" DEFAULT 'ACTIVE',
    "defaultTimezone" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wager" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "player" TEXT,
    "quote" TEXT,
    "idempotencyKey" TEXT NOT NULL DEFAULT '',
    "stakeMinor" TEXT NOT NULL DEFAULT '',
    "potentialReturnMinor" TEXT NOT NULL DEFAULT '',
    "currency" TEXT NOT NULL DEFAULT '',
    "termsHash" TEXT NOT NULL DEFAULT '',
    "status" "WagerStatusType" DEFAULT 'ACCEPTED',
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Wager_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WagerLeg" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "wager" TEXT,
    "eventKey" TEXT NOT NULL DEFAULT '',
    "marketKey" TEXT NOT NULL DEFAULT '',
    "selectionKey" TEXT NOT NULL DEFAULT '',
    "snapshotId" TEXT NOT NULL DEFAULT '',
    "decimalOdds" TEXT NOT NULL DEFAULT '',
    "line" TEXT NOT NULL DEFAULT '',
    "ruleVersion" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "WagerLeg_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AMLCase" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "player" TEXT,
    "status" "AMLCaseStatusType" DEFAULT 'OPEN',
    "riskBand" "AMLCaseRiskBandType" DEFAULT 'LOW',
    "restrictedEvidence" JSONB,
    "ownerId" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "AMLCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountRestriction" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "player" TEXT,
    "capability" TEXT NOT NULL DEFAULT '',
    "reasonCode" TEXT NOT NULL DEFAULT '',
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "status" "AccountRestrictionStatusType" DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "AccountRestriction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalRequest" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "action" TEXT NOT NULL DEFAULT '',
    "payloadHash" TEXT NOT NULL DEFAULT '',
    "requesterId" TEXT NOT NULL DEFAULT '',
    "approverId" TEXT NOT NULL DEFAULT '',
    "status" "ApprovalRequestStatusType" DEFAULT 'PENDING',
    "reason" TEXT NOT NULL DEFAULT '',
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "ApprovalRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BalanceProjection" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "account" TEXT,
    "postedMinor" TEXT NOT NULL DEFAULT '',
    "pendingMinor" TEXT NOT NULL DEFAULT '',
    "availableMinor" TEXT NOT NULL DEFAULT '',
    "version" INTEGER,
    "asOf" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "BalanceProjection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BetSlip" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "player" TEXT,
    "currency" TEXT NOT NULL DEFAULT '',
    "status" "BetSlipStatusType" DEFAULT 'OPEN',
    "expiresAt" TIMESTAMP(3),
    "version" INTEGER,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "BetSlip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BetSlipItem" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "betSlip" TEXT,
    "selection" TEXT,
    "priceSnapshot" TEXT,
    "requestedOdds" TEXT NOT NULL DEFAULT '',
    "line" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "BetSlipItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashOutOffer" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "wager" TEXT,
    "amountMinor" TEXT NOT NULL DEFAULT '',
    "currency" TEXT NOT NULL DEFAULT '',
    "portionNumerator" TEXT NOT NULL DEFAULT '',
    "portionDenominator" TEXT NOT NULL DEFAULT '',
    "valuationHash" TEXT NOT NULL DEFAULT '',
    "expiresAt" TIMESTAMP(3),
    "status" "CashOutOfferStatusType" DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "CashOutOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Competitor" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "key" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL DEFAULT '',
    "status" "CompetitorStatusType" DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Competitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceReport" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "type" TEXT NOT NULL DEFAULT '',
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),
    "version" INTEGER,
    "artifactHash" TEXT NOT NULL DEFAULT '',
    "artifactReference" TEXT NOT NULL DEFAULT '',
    "status" "ComplianceReportStatusType" DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "ComplianceReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfigValue" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "key" TEXT NOT NULL DEFAULT '',
    "value" JSONB,
    "valueType" TEXT NOT NULL DEFAULT '',
    "scopeType" TEXT NOT NULL DEFAULT '',
    "scopeId" TEXT NOT NULL DEFAULT '',
    "policyVersion" TEXT NOT NULL DEFAULT '',
    "effectiveFrom" TIMESTAMP(3),
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "ConfigValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Consent" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "player" TEXT,
    "type" TEXT NOT NULL DEFAULT '',
    "policyVersion" TEXT NOT NULL DEFAULT '',
    "givenAt" TIMESTAMP(3),
    "withdrawnAt" TIMESTAMP(3),
    "evidenceHash" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Consent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataCorrectionCase" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "scopeType" TEXT NOT NULL DEFAULT '',
    "scopeId" TEXT NOT NULL DEFAULT '',
    "reason" TEXT NOT NULL DEFAULT '',
    "dryRunHash" TEXT NOT NULL DEFAULT '',
    "approvalRequest" TEXT,
    "status" "DataCorrectionCaseStatusType" DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "DataCorrectionCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dispute" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "player" TEXT,
    "wager" TEXT,
    "category" TEXT NOT NULL DEFAULT '',
    "status" "DisputeStatusType" DEFAULT 'OPEN',
    "evidence" JSONB,
    "resolution" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Dispute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DisputeEvent" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "dispute" TEXT,
    "type" TEXT NOT NULL DEFAULT '',
    "actorId" TEXT NOT NULL DEFAULT '',
    "evidenceHash" TEXT NOT NULL DEFAULT '',
    "details" JSONB,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "DisputeEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventParticipant" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "event" TEXT,
    "competitor" TEXT,
    "role" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "EventParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExposurePosition" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "scopeType" TEXT NOT NULL DEFAULT '',
    "scopeId" TEXT NOT NULL DEFAULT '',
    "currency" TEXT NOT NULL DEFAULT '',
    "stakeMinor" TEXT NOT NULL DEFAULT '',
    "liabilityMinor" TEXT NOT NULL DEFAULT '',
    "version" INTEGER,
    "asOf" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "ExposurePosition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeoCheck" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "geoSession" TEXT,
    "providerConnection" TEXT,
    "decision" "GeoCheckDecisionType" DEFAULT 'ALLOW',
    "reasonCode" TEXT NOT NULL DEFAULT '',
    "coarseEvidence" JSONB,
    "checkedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "GeoCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeoSession" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "player" TEXT,
    "sessionKey" TEXT NOT NULL DEFAULT '',
    "status" "GeoSessionStatusType" DEFAULT 'ACTIVE',
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "GeoSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Incident" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "severity" "IncidentSeverityType" DEFAULT 'SEV1',
    "title" TEXT NOT NULL DEFAULT '',
    "status" "IncidentStatusType" DEFAULT 'OPEN',
    "commanderId" TEXT NOT NULL DEFAULT '',
    "evidence" JSONB,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegGrade" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "wagerLeg" TEXT,
    "marketGrade" TEXT,
    "outcome" TEXT NOT NULL DEFAULT '',
    "factorNumerator" TEXT NOT NULL DEFAULT '',
    "factorDenominator" TEXT NOT NULL DEFAULT '',
    "inputHash" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "LegGrade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegalHold" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "scopeType" TEXT NOT NULL DEFAULT '',
    "scopeId" TEXT NOT NULL DEFAULT '',
    "reason" TEXT NOT NULL DEFAULT '',
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "status" "LegalHoldStatusType" DEFAULT 'ACTIVE',
    "approvalRequest" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "LegalHold_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LimitProfile" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "name" TEXT NOT NULL DEFAULT '',
    "version" INTEGER,
    "status" "LimitProfileStatusType" DEFAULT 'DRAFT',
    "effectiveFrom" TIMESTAMP(3),
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "LimitProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LimitRule" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "profile" TEXT,
    "scopeType" TEXT NOT NULL DEFAULT '',
    "scopeId" TEXT NOT NULL DEFAULT '',
    "maxStakeMinor" TEXT NOT NULL DEFAULT '',
    "maxPayoutMinor" TEXT NOT NULL DEFAULT '',
    "maxLiabilityMinor" TEXT NOT NULL DEFAULT '',
    "currency" TEXT NOT NULL DEFAULT '',
    "priority" INTEGER,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "LimitRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketGrade" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "market" TEXT,
    "resultVersion" TEXT,
    "ruleVersion" TEXT NOT NULL DEFAULT '',
    "outcome" TEXT NOT NULL DEFAULT '',
    "factorNumerator" TEXT NOT NULL DEFAULT '',
    "factorDenominator" TEXT NOT NULL DEFAULT '',
    "trace" JSONB,
    "inputHash" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "MarketGrade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentAttempt" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "paymentIntent" TEXT,
    "attempt" INTEGER,
    "externalReference" TEXT NOT NULL DEFAULT '',
    "status" "PaymentAttemptStatusType" DEFAULT 'PENDING',
    "rawEnvelope" TEXT,
    "reasonCode" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "PaymentAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentIntent" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "player" TEXT,
    "type" "PaymentIntentTypeType" DEFAULT 'DEPOSIT',
    "amountMinor" TEXT NOT NULL DEFAULT '',
    "currency" TEXT NOT NULL DEFAULT '',
    "idempotencyKey" TEXT NOT NULL DEFAULT '',
    "status" "PaymentIntentStatusType" DEFAULT 'PENDING',
    "providerConnection" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "PaymentIntent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerIdentity" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "player" TEXT,
    "encryptedPayload" TEXT NOT NULL DEFAULT '',
    "tokenizedIdentifiers" JSONB,
    "encryptionKeyRef" TEXT NOT NULL DEFAULT '',
    "classification" "PlayerIdentityClassificationType" DEFAULT 'RESTRICTED_PII',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "PlayerIdentity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderEntityMapping" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "providerConnection" TEXT,
    "entityType" TEXT NOT NULL DEFAULT '',
    "externalId" TEXT NOT NULL DEFAULT '',
    "canonicalType" TEXT NOT NULL DEFAULT '',
    "canonicalId" TEXT NOT NULL DEFAULT '',
    "confidence" TEXT NOT NULL DEFAULT '',
    "status" "ProviderEntityMappingStatusType" DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "ProviderEntityMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReconciliationItem" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "run" TEXT,
    "internalReference" TEXT NOT NULL DEFAULT '',
    "providerReference" TEXT NOT NULL DEFAULT '',
    "differenceMinor" TEXT NOT NULL DEFAULT '',
    "currency" TEXT NOT NULL DEFAULT '',
    "status" "ReconciliationItemStatusType" DEFAULT 'MATCHED',
    "resolutionJournal" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "ReconciliationItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReconciliationRun" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "type" TEXT NOT NULL DEFAULT '',
    "windowFrom" TIMESTAMP(3),
    "windowTo" TIMESTAMP(3),
    "status" "ReconciliationRunStatusType" DEFAULT 'PENDING',
    "inputHash" TEXT NOT NULL DEFAULT '',
    "differenceMinor" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "ReconciliationRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResettlementCase" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "wager" TEXT,
    "oldSettlement" TEXT,
    "newResultVersion" TEXT,
    "reason" TEXT NOT NULL DEFAULT '',
    "approvalRequest" TEXT,
    "status" "ResettlementCaseStatusType" DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "ResettlementCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoleGrant" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "user" TEXT,
    "role" TEXT,
    "team" TEXT,
    "scope" JSONB,
    "effectiveFrom" TIMESTAMP(3),
    "effectiveTo" TIMESTAMP(3),
    "status" "RoleGrantStatusType" DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "RoleGrant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxAssessment" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "wager" TEXT,
    "ruleVersion" TEXT NOT NULL DEFAULT '',
    "basisMinor" TEXT NOT NULL DEFAULT '',
    "amountMinor" TEXT NOT NULL DEFAULT '',
    "currency" TEXT NOT NULL DEFAULT '',
    "status" "TaxAssessmentStatusType" DEFAULT 'CALCULATED',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "TaxAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "name" TEXT NOT NULL DEFAULT '',
    "status" "TeamStatusType" DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TradingStatusChange" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "scopeType" TEXT NOT NULL DEFAULT '',
    "scopeId" TEXT NOT NULL DEFAULT '',
    "fromStatus" TEXT NOT NULL DEFAULT '',
    "toStatus" TEXT NOT NULL DEFAULT '',
    "reason" TEXT NOT NULL DEFAULT '',
    "source" TEXT NOT NULL DEFAULT '',
    "actorId" TEXT NOT NULL DEFAULT '',
    "effectiveAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "TradingStatusChange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationCase" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "player" TEXT,
    "providerConnection" TEXT,
    "type" "VerificationCaseTypeType" DEFAULT 'KYC',
    "status" "VerificationCaseStatusType" DEFAULT 'PENDING',
    "evidenceReference" TEXT NOT NULL DEFAULT '',
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "VerificationCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationCheck" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "verificationCase" TEXT,
    "attempt" INTEGER,
    "decision" "VerificationCheckDecisionType" DEFAULT 'PENDING',
    "reasonCode" TEXT NOT NULL DEFAULT '',
    "rawEnvelope" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "VerificationCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WagerStatusEvent" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "wager" TEXT,
    "fromStatus" TEXT NOT NULL DEFAULT '',
    "toStatus" TEXT NOT NULL DEFAULT '',
    "reasonCode" TEXT NOT NULL DEFAULT '',
    "actorId" TEXT NOT NULL DEFAULT '',
    "effectiveAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "WagerStatusEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_Team_members" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_Team_members_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "AcceptanceDecision_tenant_idx" ON "AcceptanceDecision"("tenant");

-- CreateIndex
CREATE INDEX "AcceptanceDecision_wager_idx" ON "AcceptanceDecision"("wager");

-- CreateIndex
CREATE INDEX "AcceptanceDecision_quote_idx" ON "AcceptanceDecision"("quote");

-- CreateIndex
CREATE INDEX "AuditEvent_tenant_idx" ON "AuditEvent"("tenant");

-- CreateIndex
CREATE INDEX "Brand_tenant_idx" ON "Brand"("tenant");

-- CreateIndex
CREATE INDEX "Competition_tenant_idx" ON "Competition"("tenant");

-- CreateIndex
CREATE INDEX "Competition_sport_idx" ON "Competition"("sport");

-- CreateIndex
CREATE INDEX "DeadLetter_tenant_idx" ON "DeadLetter"("tenant");

-- CreateIndex
CREATE INDEX "Event_tenant_idx" ON "Event"("tenant");

-- CreateIndex
CREATE INDEX "Event_competition_idx" ON "Event"("competition");

-- CreateIndex
CREATE INDEX "Hold_tenant_idx" ON "Hold"("tenant");

-- CreateIndex
CREATE INDEX "Hold_account_idx" ON "Hold"("account");

-- CreateIndex
CREATE INDEX "InboxMessage_tenant_idx" ON "InboxMessage"("tenant");

-- CreateIndex
CREATE INDEX "InboxMessage_rawEnvelope_idx" ON "InboxMessage"("rawEnvelope");

-- CreateIndex
CREATE INDEX "JournalEntry_tenant_idx" ON "JournalEntry"("tenant");

-- CreateIndex
CREATE INDEX "JournalEntry_transaction_idx" ON "JournalEntry"("transaction");

-- CreateIndex
CREATE INDEX "JournalEntry_account_idx" ON "JournalEntry"("account");

-- CreateIndex
CREATE INDEX "JournalTransaction_tenant_idx" ON "JournalTransaction"("tenant");

-- CreateIndex
CREATE INDEX "JournalTransaction_reversalOf_idx" ON "JournalTransaction"("reversalOf");

-- CreateIndex
CREATE UNIQUE INDEX "Jurisdiction_code_key" ON "Jurisdiction"("code");

-- CreateIndex
CREATE INDEX "LedgerAccount_tenant_idx" ON "LedgerAccount"("tenant");

-- CreateIndex
CREATE INDEX "LedgerAccount_player_idx" ON "LedgerAccount"("player");

-- CreateIndex
CREATE INDEX "Market_tenant_idx" ON "Market"("tenant");

-- CreateIndex
CREATE INDEX "Market_event_idx" ON "Market"("event");

-- CreateIndex
CREATE INDEX "OperatorJurisdiction_tenant_idx" ON "OperatorJurisdiction"("tenant");

-- CreateIndex
CREATE INDEX "OperatorJurisdiction_jurisdiction_idx" ON "OperatorJurisdiction"("jurisdiction");

-- CreateIndex
CREATE INDEX "OutboxMessage_tenant_idx" ON "OutboxMessage"("tenant");

-- CreateIndex
CREATE INDEX "Player_tenant_idx" ON "Player"("tenant");

-- CreateIndex
CREATE INDEX "Player_brand_idx" ON "Player"("brand");

-- CreateIndex
CREATE INDEX "PlayerLimit_tenant_idx" ON "PlayerLimit"("tenant");

-- CreateIndex
CREATE INDEX "PlayerLimit_player_idx" ON "PlayerLimit"("player");

-- CreateIndex
CREATE INDEX "PriceSnapshot_tenant_idx" ON "PriceSnapshot"("tenant");

-- CreateIndex
CREATE INDEX "PriceSnapshot_selection_idx" ON "PriceSnapshot"("selection");

-- CreateIndex
CREATE INDEX "PriceSnapshot_providerConnection_idx" ON "PriceSnapshot"("providerConnection");

-- CreateIndex
CREATE INDEX "PriceSnapshot_rawEnvelope_idx" ON "PriceSnapshot"("rawEnvelope");

-- CreateIndex
CREATE INDEX "ProviderConnection_tenant_idx" ON "ProviderConnection"("tenant");

-- CreateIndex
CREATE INDEX "Quote_tenant_idx" ON "Quote"("tenant");

-- CreateIndex
CREATE INDEX "Quote_player_idx" ON "Quote"("player");

-- CreateIndex
CREATE INDEX "Quote_selection_idx" ON "Quote"("selection");

-- CreateIndex
CREATE INDEX "Quote_priceSnapshot_idx" ON "Quote"("priceSnapshot");

-- CreateIndex
CREATE INDEX "RawEnvelope_tenant_idx" ON "RawEnvelope"("tenant");

-- CreateIndex
CREATE INDEX "RawEnvelope_providerConnection_idx" ON "RawEnvelope"("providerConnection");

-- CreateIndex
CREATE INDEX "ResultVersion_tenant_idx" ON "ResultVersion"("tenant");

-- CreateIndex
CREATE INDEX "ResultVersion_event_idx" ON "ResultVersion"("event");

-- CreateIndex
CREATE INDEX "ResultVersion_providerConnection_idx" ON "ResultVersion"("providerConnection");

-- CreateIndex
CREATE INDEX "Selection_tenant_idx" ON "Selection"("tenant");

-- CreateIndex
CREATE INDEX "Selection_market_idx" ON "Selection"("market");

-- CreateIndex
CREATE INDEX "SelfExclusion_tenant_idx" ON "SelfExclusion"("tenant");

-- CreateIndex
CREATE INDEX "SelfExclusion_player_idx" ON "SelfExclusion"("player");

-- CreateIndex
CREATE INDEX "Settlement_tenant_idx" ON "Settlement"("tenant");

-- CreateIndex
CREATE INDEX "Settlement_wager_idx" ON "Settlement"("wager");

-- CreateIndex
CREATE INDEX "Settlement_resultVersion_idx" ON "Settlement"("resultVersion");

-- CreateIndex
CREATE INDEX "Settlement_journalTransaction_idx" ON "Settlement"("journalTransaction");

-- CreateIndex
CREATE INDEX "Settlement_reversalOf_idx" ON "Settlement"("reversalOf");

-- CreateIndex
CREATE INDEX "Sport_tenant_idx" ON "Sport"("tenant");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- CreateIndex
CREATE INDEX "Wager_tenant_idx" ON "Wager"("tenant");

-- CreateIndex
CREATE INDEX "Wager_player_idx" ON "Wager"("player");

-- CreateIndex
CREATE INDEX "Wager_quote_idx" ON "Wager"("quote");

-- CreateIndex
CREATE INDEX "WagerLeg_tenant_idx" ON "WagerLeg"("tenant");

-- CreateIndex
CREATE INDEX "WagerLeg_wager_idx" ON "WagerLeg"("wager");

-- CreateIndex
CREATE INDEX "AMLCase_tenant_idx" ON "AMLCase"("tenant");

-- CreateIndex
CREATE INDEX "AMLCase_player_idx" ON "AMLCase"("player");

-- CreateIndex
CREATE INDEX "AccountRestriction_tenant_idx" ON "AccountRestriction"("tenant");

-- CreateIndex
CREATE INDEX "AccountRestriction_player_idx" ON "AccountRestriction"("player");

-- CreateIndex
CREATE INDEX "ApprovalRequest_tenant_idx" ON "ApprovalRequest"("tenant");

-- CreateIndex
CREATE INDEX "BalanceProjection_tenant_idx" ON "BalanceProjection"("tenant");

-- CreateIndex
CREATE INDEX "BalanceProjection_account_idx" ON "BalanceProjection"("account");

-- CreateIndex
CREATE INDEX "BetSlip_tenant_idx" ON "BetSlip"("tenant");

-- CreateIndex
CREATE INDEX "BetSlip_player_idx" ON "BetSlip"("player");

-- CreateIndex
CREATE INDEX "BetSlipItem_tenant_idx" ON "BetSlipItem"("tenant");

-- CreateIndex
CREATE INDEX "BetSlipItem_betSlip_idx" ON "BetSlipItem"("betSlip");

-- CreateIndex
CREATE INDEX "BetSlipItem_selection_idx" ON "BetSlipItem"("selection");

-- CreateIndex
CREATE INDEX "BetSlipItem_priceSnapshot_idx" ON "BetSlipItem"("priceSnapshot");

-- CreateIndex
CREATE INDEX "CashOutOffer_tenant_idx" ON "CashOutOffer"("tenant");

-- CreateIndex
CREATE INDEX "CashOutOffer_wager_idx" ON "CashOutOffer"("wager");

-- CreateIndex
CREATE INDEX "Competitor_tenant_idx" ON "Competitor"("tenant");

-- CreateIndex
CREATE INDEX "ComplianceReport_tenant_idx" ON "ComplianceReport"("tenant");

-- CreateIndex
CREATE INDEX "ConfigValue_tenant_idx" ON "ConfigValue"("tenant");

-- CreateIndex
CREATE INDEX "Consent_tenant_idx" ON "Consent"("tenant");

-- CreateIndex
CREATE INDEX "Consent_player_idx" ON "Consent"("player");

-- CreateIndex
CREATE INDEX "DataCorrectionCase_tenant_idx" ON "DataCorrectionCase"("tenant");

-- CreateIndex
CREATE INDEX "DataCorrectionCase_approvalRequest_idx" ON "DataCorrectionCase"("approvalRequest");

-- CreateIndex
CREATE INDEX "Dispute_tenant_idx" ON "Dispute"("tenant");

-- CreateIndex
CREATE INDEX "Dispute_player_idx" ON "Dispute"("player");

-- CreateIndex
CREATE INDEX "Dispute_wager_idx" ON "Dispute"("wager");

-- CreateIndex
CREATE INDEX "DisputeEvent_tenant_idx" ON "DisputeEvent"("tenant");

-- CreateIndex
CREATE INDEX "DisputeEvent_dispute_idx" ON "DisputeEvent"("dispute");

-- CreateIndex
CREATE INDEX "EventParticipant_tenant_idx" ON "EventParticipant"("tenant");

-- CreateIndex
CREATE INDEX "EventParticipant_event_idx" ON "EventParticipant"("event");

-- CreateIndex
CREATE INDEX "EventParticipant_competitor_idx" ON "EventParticipant"("competitor");

-- CreateIndex
CREATE INDEX "ExposurePosition_tenant_idx" ON "ExposurePosition"("tenant");

-- CreateIndex
CREATE INDEX "GeoCheck_tenant_idx" ON "GeoCheck"("tenant");

-- CreateIndex
CREATE INDEX "GeoCheck_geoSession_idx" ON "GeoCheck"("geoSession");

-- CreateIndex
CREATE INDEX "GeoCheck_providerConnection_idx" ON "GeoCheck"("providerConnection");

-- CreateIndex
CREATE INDEX "GeoSession_tenant_idx" ON "GeoSession"("tenant");

-- CreateIndex
CREATE INDEX "GeoSession_player_idx" ON "GeoSession"("player");

-- CreateIndex
CREATE INDEX "Incident_tenant_idx" ON "Incident"("tenant");

-- CreateIndex
CREATE INDEX "LegGrade_tenant_idx" ON "LegGrade"("tenant");

-- CreateIndex
CREATE INDEX "LegGrade_wagerLeg_idx" ON "LegGrade"("wagerLeg");

-- CreateIndex
CREATE INDEX "LegGrade_marketGrade_idx" ON "LegGrade"("marketGrade");

-- CreateIndex
CREATE INDEX "LegalHold_tenant_idx" ON "LegalHold"("tenant");

-- CreateIndex
CREATE INDEX "LegalHold_approvalRequest_idx" ON "LegalHold"("approvalRequest");

-- CreateIndex
CREATE INDEX "LimitProfile_tenant_idx" ON "LimitProfile"("tenant");

-- CreateIndex
CREATE INDEX "LimitRule_tenant_idx" ON "LimitRule"("tenant");

-- CreateIndex
CREATE INDEX "LimitRule_profile_idx" ON "LimitRule"("profile");

-- CreateIndex
CREATE INDEX "MarketGrade_tenant_idx" ON "MarketGrade"("tenant");

-- CreateIndex
CREATE INDEX "MarketGrade_market_idx" ON "MarketGrade"("market");

-- CreateIndex
CREATE INDEX "MarketGrade_resultVersion_idx" ON "MarketGrade"("resultVersion");

-- CreateIndex
CREATE INDEX "PaymentAttempt_tenant_idx" ON "PaymentAttempt"("tenant");

-- CreateIndex
CREATE INDEX "PaymentAttempt_paymentIntent_idx" ON "PaymentAttempt"("paymentIntent");

-- CreateIndex
CREATE INDEX "PaymentAttempt_rawEnvelope_idx" ON "PaymentAttempt"("rawEnvelope");

-- CreateIndex
CREATE INDEX "PaymentIntent_tenant_idx" ON "PaymentIntent"("tenant");

-- CreateIndex
CREATE INDEX "PaymentIntent_player_idx" ON "PaymentIntent"("player");

-- CreateIndex
CREATE INDEX "PaymentIntent_providerConnection_idx" ON "PaymentIntent"("providerConnection");

-- CreateIndex
CREATE INDEX "PlayerIdentity_tenant_idx" ON "PlayerIdentity"("tenant");

-- CreateIndex
CREATE INDEX "PlayerIdentity_player_idx" ON "PlayerIdentity"("player");

-- CreateIndex
CREATE INDEX "ProviderEntityMapping_tenant_idx" ON "ProviderEntityMapping"("tenant");

-- CreateIndex
CREATE INDEX "ProviderEntityMapping_providerConnection_idx" ON "ProviderEntityMapping"("providerConnection");

-- CreateIndex
CREATE INDEX "ReconciliationItem_tenant_idx" ON "ReconciliationItem"("tenant");

-- CreateIndex
CREATE INDEX "ReconciliationItem_run_idx" ON "ReconciliationItem"("run");

-- CreateIndex
CREATE INDEX "ReconciliationItem_resolutionJournal_idx" ON "ReconciliationItem"("resolutionJournal");

-- CreateIndex
CREATE INDEX "ReconciliationRun_tenant_idx" ON "ReconciliationRun"("tenant");

-- CreateIndex
CREATE INDEX "ResettlementCase_tenant_idx" ON "ResettlementCase"("tenant");

-- CreateIndex
CREATE INDEX "ResettlementCase_wager_idx" ON "ResettlementCase"("wager");

-- CreateIndex
CREATE INDEX "ResettlementCase_oldSettlement_idx" ON "ResettlementCase"("oldSettlement");

-- CreateIndex
CREATE INDEX "ResettlementCase_newResultVersion_idx" ON "ResettlementCase"("newResultVersion");

-- CreateIndex
CREATE INDEX "ResettlementCase_approvalRequest_idx" ON "ResettlementCase"("approvalRequest");

-- CreateIndex
CREATE INDEX "RoleGrant_tenant_idx" ON "RoleGrant"("tenant");

-- CreateIndex
CREATE INDEX "RoleGrant_user_idx" ON "RoleGrant"("user");

-- CreateIndex
CREATE INDEX "RoleGrant_role_idx" ON "RoleGrant"("role");

-- CreateIndex
CREATE INDEX "RoleGrant_team_idx" ON "RoleGrant"("team");

-- CreateIndex
CREATE INDEX "TaxAssessment_tenant_idx" ON "TaxAssessment"("tenant");

-- CreateIndex
CREATE INDEX "TaxAssessment_wager_idx" ON "TaxAssessment"("wager");

-- CreateIndex
CREATE INDEX "Team_tenant_idx" ON "Team"("tenant");

-- CreateIndex
CREATE INDEX "TradingStatusChange_tenant_idx" ON "TradingStatusChange"("tenant");

-- CreateIndex
CREATE INDEX "VerificationCase_tenant_idx" ON "VerificationCase"("tenant");

-- CreateIndex
CREATE INDEX "VerificationCase_player_idx" ON "VerificationCase"("player");

-- CreateIndex
CREATE INDEX "VerificationCase_providerConnection_idx" ON "VerificationCase"("providerConnection");

-- CreateIndex
CREATE INDEX "VerificationCheck_tenant_idx" ON "VerificationCheck"("tenant");

-- CreateIndex
CREATE INDEX "VerificationCheck_verificationCase_idx" ON "VerificationCheck"("verificationCase");

-- CreateIndex
CREATE INDEX "VerificationCheck_rawEnvelope_idx" ON "VerificationCheck"("rawEnvelope");

-- CreateIndex
CREATE INDEX "WagerStatusEvent_tenant_idx" ON "WagerStatusEvent"("tenant");

-- CreateIndex
CREATE INDEX "WagerStatusEvent_wager_idx" ON "WagerStatusEvent"("wager");

-- CreateIndex
CREATE INDEX "_Team_members_B_index" ON "_Team_members"("B");

-- CreateIndex
CREATE INDEX "User_tenant_idx" ON "User"("tenant");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcceptanceDecision" ADD CONSTRAINT "AcceptanceDecision_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcceptanceDecision" ADD CONSTRAINT "AcceptanceDecision_wager_fkey" FOREIGN KEY ("wager") REFERENCES "Wager"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcceptanceDecision" ADD CONSTRAINT "AcceptanceDecision_quote_fkey" FOREIGN KEY ("quote") REFERENCES "Quote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Brand" ADD CONSTRAINT "Brand_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Competition" ADD CONSTRAINT "Competition_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Competition" ADD CONSTRAINT "Competition_sport_fkey" FOREIGN KEY ("sport") REFERENCES "Sport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeadLetter" ADD CONSTRAINT "DeadLetter_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_competition_fkey" FOREIGN KEY ("competition") REFERENCES "Competition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hold" ADD CONSTRAINT "Hold_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hold" ADD CONSTRAINT "Hold_account_fkey" FOREIGN KEY ("account") REFERENCES "LedgerAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InboxMessage" ADD CONSTRAINT "InboxMessage_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InboxMessage" ADD CONSTRAINT "InboxMessage_rawEnvelope_fkey" FOREIGN KEY ("rawEnvelope") REFERENCES "RawEnvelope"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_transaction_fkey" FOREIGN KEY ("transaction") REFERENCES "JournalTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_account_fkey" FOREIGN KEY ("account") REFERENCES "LedgerAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalTransaction" ADD CONSTRAINT "JournalTransaction_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalTransaction" ADD CONSTRAINT "JournalTransaction_reversalOf_fkey" FOREIGN KEY ("reversalOf") REFERENCES "JournalTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerAccount" ADD CONSTRAINT "LedgerAccount_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerAccount" ADD CONSTRAINT "LedgerAccount_player_fkey" FOREIGN KEY ("player") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Market" ADD CONSTRAINT "Market_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Market" ADD CONSTRAINT "Market_event_fkey" FOREIGN KEY ("event") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperatorJurisdiction" ADD CONSTRAINT "OperatorJurisdiction_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperatorJurisdiction" ADD CONSTRAINT "OperatorJurisdiction_jurisdiction_fkey" FOREIGN KEY ("jurisdiction") REFERENCES "Jurisdiction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutboxMessage" ADD CONSTRAINT "OutboxMessage_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_brand_fkey" FOREIGN KEY ("brand") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerLimit" ADD CONSTRAINT "PlayerLimit_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerLimit" ADD CONSTRAINT "PlayerLimit_player_fkey" FOREIGN KEY ("player") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceSnapshot" ADD CONSTRAINT "PriceSnapshot_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceSnapshot" ADD CONSTRAINT "PriceSnapshot_selection_fkey" FOREIGN KEY ("selection") REFERENCES "Selection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceSnapshot" ADD CONSTRAINT "PriceSnapshot_providerConnection_fkey" FOREIGN KEY ("providerConnection") REFERENCES "ProviderConnection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceSnapshot" ADD CONSTRAINT "PriceSnapshot_rawEnvelope_fkey" FOREIGN KEY ("rawEnvelope") REFERENCES "RawEnvelope"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderConnection" ADD CONSTRAINT "ProviderConnection_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_player_fkey" FOREIGN KEY ("player") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_selection_fkey" FOREIGN KEY ("selection") REFERENCES "Selection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_priceSnapshot_fkey" FOREIGN KEY ("priceSnapshot") REFERENCES "PriceSnapshot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawEnvelope" ADD CONSTRAINT "RawEnvelope_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawEnvelope" ADD CONSTRAINT "RawEnvelope_providerConnection_fkey" FOREIGN KEY ("providerConnection") REFERENCES "ProviderConnection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResultVersion" ADD CONSTRAINT "ResultVersion_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResultVersion" ADD CONSTRAINT "ResultVersion_event_fkey" FOREIGN KEY ("event") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResultVersion" ADD CONSTRAINT "ResultVersion_providerConnection_fkey" FOREIGN KEY ("providerConnection") REFERENCES "ProviderConnection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Selection" ADD CONSTRAINT "Selection_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Selection" ADD CONSTRAINT "Selection_market_fkey" FOREIGN KEY ("market") REFERENCES "Market"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SelfExclusion" ADD CONSTRAINT "SelfExclusion_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SelfExclusion" ADD CONSTRAINT "SelfExclusion_player_fkey" FOREIGN KEY ("player") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settlement" ADD CONSTRAINT "Settlement_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settlement" ADD CONSTRAINT "Settlement_wager_fkey" FOREIGN KEY ("wager") REFERENCES "Wager"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settlement" ADD CONSTRAINT "Settlement_resultVersion_fkey" FOREIGN KEY ("resultVersion") REFERENCES "ResultVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settlement" ADD CONSTRAINT "Settlement_journalTransaction_fkey" FOREIGN KEY ("journalTransaction") REFERENCES "JournalTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settlement" ADD CONSTRAINT "Settlement_reversalOf_fkey" FOREIGN KEY ("reversalOf") REFERENCES "Settlement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sport" ADD CONSTRAINT "Sport_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wager" ADD CONSTRAINT "Wager_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wager" ADD CONSTRAINT "Wager_player_fkey" FOREIGN KEY ("player") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wager" ADD CONSTRAINT "Wager_quote_fkey" FOREIGN KEY ("quote") REFERENCES "Quote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WagerLeg" ADD CONSTRAINT "WagerLeg_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WagerLeg" ADD CONSTRAINT "WagerLeg_wager_fkey" FOREIGN KEY ("wager") REFERENCES "Wager"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AMLCase" ADD CONSTRAINT "AMLCase_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AMLCase" ADD CONSTRAINT "AMLCase_player_fkey" FOREIGN KEY ("player") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountRestriction" ADD CONSTRAINT "AccountRestriction_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountRestriction" ADD CONSTRAINT "AccountRestriction_player_fkey" FOREIGN KEY ("player") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalRequest" ADD CONSTRAINT "ApprovalRequest_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BalanceProjection" ADD CONSTRAINT "BalanceProjection_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BalanceProjection" ADD CONSTRAINT "BalanceProjection_account_fkey" FOREIGN KEY ("account") REFERENCES "LedgerAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BetSlip" ADD CONSTRAINT "BetSlip_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BetSlip" ADD CONSTRAINT "BetSlip_player_fkey" FOREIGN KEY ("player") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BetSlipItem" ADD CONSTRAINT "BetSlipItem_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BetSlipItem" ADD CONSTRAINT "BetSlipItem_betSlip_fkey" FOREIGN KEY ("betSlip") REFERENCES "BetSlip"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BetSlipItem" ADD CONSTRAINT "BetSlipItem_selection_fkey" FOREIGN KEY ("selection") REFERENCES "Selection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BetSlipItem" ADD CONSTRAINT "BetSlipItem_priceSnapshot_fkey" FOREIGN KEY ("priceSnapshot") REFERENCES "PriceSnapshot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashOutOffer" ADD CONSTRAINT "CashOutOffer_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashOutOffer" ADD CONSTRAINT "CashOutOffer_wager_fkey" FOREIGN KEY ("wager") REFERENCES "Wager"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Competitor" ADD CONSTRAINT "Competitor_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceReport" ADD CONSTRAINT "ComplianceReport_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfigValue" ADD CONSTRAINT "ConfigValue_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consent" ADD CONSTRAINT "Consent_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consent" ADD CONSTRAINT "Consent_player_fkey" FOREIGN KEY ("player") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataCorrectionCase" ADD CONSTRAINT "DataCorrectionCase_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataCorrectionCase" ADD CONSTRAINT "DataCorrectionCase_approvalRequest_fkey" FOREIGN KEY ("approvalRequest") REFERENCES "ApprovalRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_player_fkey" FOREIGN KEY ("player") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_wager_fkey" FOREIGN KEY ("wager") REFERENCES "Wager"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisputeEvent" ADD CONSTRAINT "DisputeEvent_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisputeEvent" ADD CONSTRAINT "DisputeEvent_dispute_fkey" FOREIGN KEY ("dispute") REFERENCES "Dispute"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventParticipant" ADD CONSTRAINT "EventParticipant_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventParticipant" ADD CONSTRAINT "EventParticipant_event_fkey" FOREIGN KEY ("event") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventParticipant" ADD CONSTRAINT "EventParticipant_competitor_fkey" FOREIGN KEY ("competitor") REFERENCES "Competitor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExposurePosition" ADD CONSTRAINT "ExposurePosition_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeoCheck" ADD CONSTRAINT "GeoCheck_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeoCheck" ADD CONSTRAINT "GeoCheck_geoSession_fkey" FOREIGN KEY ("geoSession") REFERENCES "GeoSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeoCheck" ADD CONSTRAINT "GeoCheck_providerConnection_fkey" FOREIGN KEY ("providerConnection") REFERENCES "ProviderConnection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeoSession" ADD CONSTRAINT "GeoSession_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeoSession" ADD CONSTRAINT "GeoSession_player_fkey" FOREIGN KEY ("player") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegGrade" ADD CONSTRAINT "LegGrade_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegGrade" ADD CONSTRAINT "LegGrade_wagerLeg_fkey" FOREIGN KEY ("wagerLeg") REFERENCES "WagerLeg"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegGrade" ADD CONSTRAINT "LegGrade_marketGrade_fkey" FOREIGN KEY ("marketGrade") REFERENCES "MarketGrade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegalHold" ADD CONSTRAINT "LegalHold_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegalHold" ADD CONSTRAINT "LegalHold_approvalRequest_fkey" FOREIGN KEY ("approvalRequest") REFERENCES "ApprovalRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LimitProfile" ADD CONSTRAINT "LimitProfile_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LimitRule" ADD CONSTRAINT "LimitRule_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LimitRule" ADD CONSTRAINT "LimitRule_profile_fkey" FOREIGN KEY ("profile") REFERENCES "LimitProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketGrade" ADD CONSTRAINT "MarketGrade_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketGrade" ADD CONSTRAINT "MarketGrade_market_fkey" FOREIGN KEY ("market") REFERENCES "Market"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketGrade" ADD CONSTRAINT "MarketGrade_resultVersion_fkey" FOREIGN KEY ("resultVersion") REFERENCES "ResultVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentAttempt" ADD CONSTRAINT "PaymentAttempt_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentAttempt" ADD CONSTRAINT "PaymentAttempt_paymentIntent_fkey" FOREIGN KEY ("paymentIntent") REFERENCES "PaymentIntent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentAttempt" ADD CONSTRAINT "PaymentAttempt_rawEnvelope_fkey" FOREIGN KEY ("rawEnvelope") REFERENCES "RawEnvelope"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentIntent" ADD CONSTRAINT "PaymentIntent_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentIntent" ADD CONSTRAINT "PaymentIntent_player_fkey" FOREIGN KEY ("player") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentIntent" ADD CONSTRAINT "PaymentIntent_providerConnection_fkey" FOREIGN KEY ("providerConnection") REFERENCES "ProviderConnection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerIdentity" ADD CONSTRAINT "PlayerIdentity_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerIdentity" ADD CONSTRAINT "PlayerIdentity_player_fkey" FOREIGN KEY ("player") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderEntityMapping" ADD CONSTRAINT "ProviderEntityMapping_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderEntityMapping" ADD CONSTRAINT "ProviderEntityMapping_providerConnection_fkey" FOREIGN KEY ("providerConnection") REFERENCES "ProviderConnection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReconciliationItem" ADD CONSTRAINT "ReconciliationItem_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReconciliationItem" ADD CONSTRAINT "ReconciliationItem_run_fkey" FOREIGN KEY ("run") REFERENCES "ReconciliationRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReconciliationItem" ADD CONSTRAINT "ReconciliationItem_resolutionJournal_fkey" FOREIGN KEY ("resolutionJournal") REFERENCES "JournalTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReconciliationRun" ADD CONSTRAINT "ReconciliationRun_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResettlementCase" ADD CONSTRAINT "ResettlementCase_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResettlementCase" ADD CONSTRAINT "ResettlementCase_wager_fkey" FOREIGN KEY ("wager") REFERENCES "Wager"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResettlementCase" ADD CONSTRAINT "ResettlementCase_oldSettlement_fkey" FOREIGN KEY ("oldSettlement") REFERENCES "Settlement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResettlementCase" ADD CONSTRAINT "ResettlementCase_newResultVersion_fkey" FOREIGN KEY ("newResultVersion") REFERENCES "ResultVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResettlementCase" ADD CONSTRAINT "ResettlementCase_approvalRequest_fkey" FOREIGN KEY ("approvalRequest") REFERENCES "ApprovalRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleGrant" ADD CONSTRAINT "RoleGrant_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleGrant" ADD CONSTRAINT "RoleGrant_user_fkey" FOREIGN KEY ("user") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleGrant" ADD CONSTRAINT "RoleGrant_role_fkey" FOREIGN KEY ("role") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleGrant" ADD CONSTRAINT "RoleGrant_team_fkey" FOREIGN KEY ("team") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxAssessment" ADD CONSTRAINT "TaxAssessment_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxAssessment" ADD CONSTRAINT "TaxAssessment_wager_fkey" FOREIGN KEY ("wager") REFERENCES "Wager"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradingStatusChange" ADD CONSTRAINT "TradingStatusChange_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationCase" ADD CONSTRAINT "VerificationCase_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationCase" ADD CONSTRAINT "VerificationCase_player_fkey" FOREIGN KEY ("player") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationCase" ADD CONSTRAINT "VerificationCase_providerConnection_fkey" FOREIGN KEY ("providerConnection") REFERENCES "ProviderConnection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationCheck" ADD CONSTRAINT "VerificationCheck_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationCheck" ADD CONSTRAINT "VerificationCheck_verificationCase_fkey" FOREIGN KEY ("verificationCase") REFERENCES "VerificationCase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationCheck" ADD CONSTRAINT "VerificationCheck_rawEnvelope_fkey" FOREIGN KEY ("rawEnvelope") REFERENCES "RawEnvelope"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WagerStatusEvent" ADD CONSTRAINT "WagerStatusEvent_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WagerStatusEvent" ADD CONSTRAINT "WagerStatusEvent_wager_fkey" FOREIGN KEY ("wager") REFERENCES "Wager"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Team_members" ADD CONSTRAINT "_Team_members_A_fkey" FOREIGN KEY ("A") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Team_members" ADD CONSTRAINT "_Team_members_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Sportsbook financial/idempotency invariants not expressible by Keystone fields.
CREATE UNIQUE INDEX "Wager_tenant_idempotency_key" ON "Wager"("tenant", "idempotencyKey");
CREATE UNIQUE INDEX "JournalTransaction_tenant_idempotency_key" ON "JournalTransaction"("tenant", "idempotencyKey");
CREATE UNIQUE INDEX "PaymentIntent_tenant_idempotency_key" ON "PaymentIntent"("tenant", "idempotencyKey");
CREATE UNIQUE INDEX "InboxMessage_tenant_message_key" ON "InboxMessage"("tenant", "messageKey");
CREATE UNIQUE INDEX "Hold_tenant_purpose_key" ON "Hold"("tenant", "purposeType", "purposeId");
CREATE INDEX "OutboxMessage_claim_idx" ON "OutboxMessage"("status", "availableAt", "leaseUntil");
CREATE INDEX "PriceSnapshot_current_idx" ON "PriceSnapshot"("selection", "receivedAt" DESC);

CREATE OR REPLACE FUNCTION sportsbook_deny_financial_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'posted sportsbook financial evidence is append-only'; END $$;
CREATE TRIGGER journal_entry_immutable BEFORE UPDATE OR DELETE ON "JournalEntry" FOR EACH ROW EXECUTE FUNCTION sportsbook_deny_financial_mutation();
CREATE TRIGGER journal_transaction_immutable BEFORE DELETE ON "JournalTransaction" FOR EACH ROW EXECUTE FUNCTION sportsbook_deny_financial_mutation();

-- Deny-first operational capabilities; false unless explicitly granted.
ALTER TABLE "Role" ADD COLUMN IF NOT EXISTS "canTrade" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Role" ADD COLUMN IF NOT EXISTS "canManageRisk" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Role" ADD COLUMN IF NOT EXISTS "canManageCompliance" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Role" ADD COLUMN IF NOT EXISTS "canManageFinance" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Role" ADD COLUMN IF NOT EXISTS "canManageIntegrations" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Role" ADD COLUMN IF NOT EXISTS "canApproveSensitiveActions" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Role" ADD COLUMN IF NOT EXISTS "canReadAudit" BOOLEAN NOT NULL DEFAULT false;
