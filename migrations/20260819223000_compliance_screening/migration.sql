-- CreateEnum
CREATE TYPE "ScreeningHitScreeningTypeType" AS ENUM ('SANCTIONS', 'PEP', 'ADVERSE_MEDIA', 'SOURCE_OF_FUNDS');

-- CreateEnum
CREATE TYPE "ScreeningHitStatusType" AS ENUM ('POTENTIAL', 'REVIEW', 'CONFIRMED', 'CLEARED', 'FALSE_POSITIVE');

-- CreateTable
CREATE TABLE "ScreeningHit" (
    "id" TEXT NOT NULL,
    "tenant" TEXT NOT NULL,
    "amlCase" TEXT NOT NULL,
    "providerConnection" TEXT NOT NULL,
    "screeningType" "ScreeningHitScreeningTypeType" DEFAULT 'SANCTIONS',
    "matchToken" TEXT NOT NULL DEFAULT '',
    "status" "ScreeningHitStatusType" DEFAULT 'POTENTIAL',
    "dispositionReason" TEXT NOT NULL DEFAULT '',
    "evidenceReference" TEXT NOT NULL DEFAULT '',
    "screenedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "ownerId" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScreeningHit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScreeningHit_tenant_idx" ON "ScreeningHit"("tenant");

-- CreateIndex
CREATE INDEX "ScreeningHit_amlCase_idx" ON "ScreeningHit"("amlCase");

-- CreateIndex
CREATE INDEX "ScreeningHit_providerConnection_idx" ON "ScreeningHit"("providerConnection");

-- CreateIndex
CREATE UNIQUE INDEX "ScreeningHit_provider_match_uq" ON "ScreeningHit"("tenant", "providerConnection", "screeningType", "matchToken");

-- AddForeignKey
ALTER TABLE "ScreeningHit" ADD CONSTRAINT "ScreeningHit_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScreeningHit" ADD CONSTRAINT "ScreeningHit_amlCase_fkey" FOREIGN KEY ("amlCase") REFERENCES "AMLCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScreeningHit" ADD CONSTRAINT "ScreeningHit_providerConnection_fkey" FOREIGN KEY ("providerConnection") REFERENCES "ProviderConnection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

