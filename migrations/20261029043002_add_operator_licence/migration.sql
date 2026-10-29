-- CreateEnum
CREATE TYPE "OperatorLicenceStatusType" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateTable
CREATE TABLE "OperatorLicence" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "jurisdiction" TEXT,
    "licenceNumber" TEXT NOT NULL DEFAULT '',
    "regulator" TEXT NOT NULL DEFAULT '',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "permittedRegions" JSONB DEFAULT '[]',
    "status" "OperatorLicenceStatusType" DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OperatorLicence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OperatorLicence_tenant_idx" ON "OperatorLicence"("tenant");

-- CreateIndex
CREATE INDEX "OperatorLicence_jurisdiction_idx" ON "OperatorLicence"("jurisdiction");

-- AddForeignKey
ALTER TABLE "OperatorLicence" ADD CONSTRAINT "OperatorLicence_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperatorLicence" ADD CONSTRAINT "OperatorLicence_jurisdiction_fkey" FOREIGN KEY ("jurisdiction") REFERENCES "Jurisdiction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
