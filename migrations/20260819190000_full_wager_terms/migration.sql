-- CreateEnum
CREATE TYPE "CustomerQuoteTermsStructureType" AS ENUM ('STRAIGHT', 'PARLAY', 'SYSTEM', 'ROUND_ROBIN', 'TEASER', 'EACH_WAY');

-- AlterEnum
ALTER TYPE "QuoteStructureType" ADD VALUE 'EACH_WAY';

-- AlterEnum
ALTER TYPE "WagerStructureType" ADD VALUE 'EACH_WAY';

-- AlterTable
ALTER TABLE "CustomerQuoteTerms" ADD COLUMN     "bonusEconomics" JSONB,
ADD COLUMN     "legCount" TEXT NOT NULL DEFAULT '1',
ADD COLUMN     "liveDelayMs" TEXT NOT NULL DEFAULT '0',
ADD COLUMN     "partCount" TEXT NOT NULL DEFAULT '1',
ADD COLUMN     "partPlan" JSONB,
ADD COLUMN     "priceChangeConsent" TEXT NOT NULL DEFAULT 'EXACT',
ADD COLUMN     "structure" "CustomerQuoteTermsStructureType" DEFAULT 'STRAIGHT';

-- AlterTable
ALTER TABLE "Quote" ADD COLUMN     "promotion" TEXT;

-- AlterTable
ALTER TABLE "Wager" ADD COLUMN     "bonusAward" TEXT,
ADD COLUMN     "promotion" TEXT;

-- CreateIndex
CREATE INDEX "Quote_promotion_idx" ON "Quote"("promotion");

-- CreateIndex
CREATE INDEX "Wager_promotion_idx" ON "Wager"("promotion");

-- CreateIndex
CREATE INDEX "Wager_bonusAward_idx" ON "Wager"("bonusAward");

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_promotion_fkey" FOREIGN KEY ("promotion") REFERENCES "Promotion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wager" ADD CONSTRAINT "Wager_promotion_fkey" FOREIGN KEY ("promotion") REFERENCES "Promotion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wager" ADD CONSTRAINT "Wager_bonusAward_fkey" FOREIGN KEY ("bonusAward") REFERENCES "BonusAward"("id") ON DELETE SET NULL ON UPDATE CASCADE;

