-- CreateEnum
CREATE TYPE "WebhookDeliveryStatusType" AS ENUM ('PENDING', 'PROCESSING', 'DELIVERED', 'FAILED', 'DEAD');

-- CreateEnum
CREATE TYPE "WebhookEndpointStatusType" AS ENUM ('PENDING', 'ACTIVE', 'DEGRADED', 'DISABLED');

-- CreateTable
CREATE TABLE "IntegrationDeliveryAttempt" (
    "id" TEXT NOT NULL,
    "tenant" TEXT NOT NULL,
    "delivery" TEXT NOT NULL,
    "attempt" INTEGER NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "responseCode" INTEGER,
    "latencyMs" INTEGER,
    "responseHash" TEXT NOT NULL DEFAULT '',
    "errorClass" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntegrationDeliveryAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookDelivery" (
    "id" TEXT NOT NULL,
    "tenant" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "outboxMessage" TEXT,
    "deliveryId" TEXT NOT NULL DEFAULT '',
    "eventType" TEXT NOT NULL DEFAULT '',
    "eventVersion" TEXT NOT NULL DEFAULT '',
    "payloadHash" TEXT NOT NULL DEFAULT '',
    "signatureKeyId" TEXT NOT NULL DEFAULT '',
    "status" "WebhookDeliveryStatusType" DEFAULT 'PENDING',
    "attempts" INTEGER DEFAULT 0,
    "availableAt" TIMESTAMP(3) NOT NULL,
    "deliveredAt" TIMESTAMP(3),
    "lastResponseCode" INTEGER,
    "lastError" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookEndpoint" (
    "id" TEXT NOT NULL,
    "tenant" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "url" TEXT NOT NULL DEFAULT '',
    "secretReference" TEXT NOT NULL DEFAULT '',
    "eventTypes" JSONB,
    "status" "WebhookEndpointStatusType" DEFAULT 'PENDING',
    "failureCount" INTEGER DEFAULT 0,
    "disabledAt" TIMESTAMP(3),
    "approvalRequest" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookEndpoint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IntegrationDeliveryAttempt_tenant_idx" ON "IntegrationDeliveryAttempt"("tenant");

-- CreateIndex
CREATE INDEX "IntegrationDeliveryAttempt_delivery_idx" ON "IntegrationDeliveryAttempt"("delivery");

-- CreateIndex
CREATE UNIQUE INDEX "IntegrationDeliveryAttempt_number_uq" ON "IntegrationDeliveryAttempt"("tenant", "delivery", "attempt");

-- CreateIndex
CREATE INDEX "WebhookDelivery_tenant_idx" ON "WebhookDelivery"("tenant");

-- CreateIndex
CREATE INDEX "WebhookDelivery_endpoint_idx" ON "WebhookDelivery"("endpoint");

-- CreateIndex
CREATE INDEX "WebhookDelivery_outboxMessage_idx" ON "WebhookDelivery"("outboxMessage");

-- CreateIndex
CREATE INDEX "WebhookDelivery_claim_idx" ON "WebhookDelivery"("status", "availableAt");

-- CreateIndex
CREATE UNIQUE INDEX "WebhookDelivery_delivery_uq" ON "WebhookDelivery"("tenant", "deliveryId");

-- CreateIndex
CREATE INDEX "WebhookEndpoint_tenant_idx" ON "WebhookEndpoint"("tenant");

-- CreateIndex
CREATE INDEX "WebhookEndpoint_approvalRequest_idx" ON "WebhookEndpoint"("approvalRequest");

-- CreateIndex
CREATE UNIQUE INDEX "WebhookEndpoint_url_uq" ON "WebhookEndpoint"("tenant", "url");

-- AddForeignKey
ALTER TABLE "IntegrationDeliveryAttempt" ADD CONSTRAINT "IntegrationDeliveryAttempt_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationDeliveryAttempt" ADD CONSTRAINT "IntegrationDeliveryAttempt_delivery_fkey" FOREIGN KEY ("delivery") REFERENCES "WebhookDelivery"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookDelivery" ADD CONSTRAINT "WebhookDelivery_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookDelivery" ADD CONSTRAINT "WebhookDelivery_endpoint_fkey" FOREIGN KEY ("endpoint") REFERENCES "WebhookEndpoint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookDelivery" ADD CONSTRAINT "WebhookDelivery_outboxMessage_fkey" FOREIGN KEY ("outboxMessage") REFERENCES "OutboxMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookEndpoint" ADD CONSTRAINT "WebhookEndpoint_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookEndpoint" ADD CONSTRAINT "WebhookEndpoint_approvalRequest_fkey" FOREIGN KEY ("approvalRequest") REFERENCES "ApprovalRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

