-- AlterTable
ALTER TABLE "ApprovalRequest" ADD COLUMN     "requestPayload" JSONB,
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "consumedAt" TIMESTAMP(3),
ADD COLUMN     "consumedById" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "consumedKey" TEXT NOT NULL DEFAULT '';
