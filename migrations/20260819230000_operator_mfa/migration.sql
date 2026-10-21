-- AlterTable
ALTER TABLE "User" ADD COLUMN     "operatorMfaEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "operatorMfaEnrolledAt" TIMESTAMP(3),
ADD COLUMN     "operatorMfaFailedAttempts" INTEGER DEFAULT 0,
ADD COLUMN     "operatorMfaLockedUntil" TIMESTAMP(3),
ADD COLUMN     "operatorMfaRecoveryHashes" JSONB,
ADD COLUMN     "operatorMfaSecret" TEXT;

