-- CreateEnum
CREATE TYPE "WagerExposureAllocationStatusType" AS ENUM ('OPEN', 'PARTIALLY_CLOSED', 'CLOSED');

-- CreateTable
CREATE TABLE "WagerExposureAllocation" (
    "id" TEXT NOT NULL,
    "tenant" TEXT NOT NULL,
    "wager" TEXT NOT NULL,
    "market" TEXT NOT NULL,
    "stakeMinor" TEXT NOT NULL DEFAULT '',
    "liabilityMinor" TEXT NOT NULL DEFAULT '',
    "remainingStakeMinor" TEXT NOT NULL DEFAULT '',
    "remainingLiabilityMinor" TEXT NOT NULL DEFAULT '',
    "version" INTEGER NOT NULL,
    "status" "WagerExposureAllocationStatusType" DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WagerExposureAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WagerExposureAllocation_tenant_idx" ON "WagerExposureAllocation"("tenant");

-- CreateIndex
CREATE INDEX "WagerExposureAllocation_wager_idx" ON "WagerExposureAllocation"("wager");

-- CreateIndex
CREATE INDEX "WagerExposureAllocation_market_idx" ON "WagerExposureAllocation"("market");

-- CreateIndex
CREATE UNIQUE INDEX "WagerExposureAllocation_wager_market_uq" ON "WagerExposureAllocation"("tenant", "wager", "market");

-- AddForeignKey
ALTER TABLE "WagerExposureAllocation" ADD CONSTRAINT "WagerExposureAllocation_tenant_fkey" FOREIGN KEY ("tenant") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WagerExposureAllocation" ADD CONSTRAINT "WagerExposureAllocation_wager_fkey" FOREIGN KEY ("wager") REFERENCES "Wager"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WagerExposureAllocation" ADD CONSTRAINT "WagerExposureAllocation_market_fkey" FOREIGN KEY ("market") REFERENCES "Market"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Backfill upgrade-safe per-wager allocations for still-open historical wagers.
WITH wager_markets AS (
  SELECT DISTINCT w.id AS wager, w.tenant, l."marketKey" AS market,
         w."stakeMinor"::numeric AS stake,
         greatest(w."potentialReturnMinor"::numeric - w."stakeMinor"::numeric, 0) AS liability
  FROM "Wager" w JOIN "WagerLeg" l ON l.wager = w.id
  WHERE w.status IN ('PENDING','DELAYED','ACCEPTED','OPEN','PARTIALLY_CASHED_OUT','GRADED')
), ranked AS (
  SELECT *, row_number() OVER (PARTITION BY wager ORDER BY market) AS position,
            count(*) OVER (PARTITION BY wager) AS market_count
  FROM wager_markets
), accepted_portions AS (
  SELECT wager, coalesce(sum("portionNumerator"::numeric / "portionDenominator"::numeric),0) AS closed
  FROM "CashOutAcceptance" WHERE status='ACCEPTED' GROUP BY wager
)
INSERT INTO "WagerExposureAllocation" (id,tenant,wager,market,"stakeMinor","liabilityMinor","remainingStakeMinor","remainingLiabilityMinor",version,status,"createdAt","updatedAt")
SELECT 'exp_' || md5(r.wager || ':' || r.market), r.tenant, r.wager, r.market,
       floor(r.stake/r.market_count + CASE WHEN r.position <= mod(r.stake,r.market_count) THEN 1 ELSE 0 END)::text,
       floor(r.liability/r.market_count + CASE WHEN r.position <= mod(r.liability,r.market_count) THEN 1 ELSE 0 END)::text,
       floor((r.stake/r.market_count + CASE WHEN r.position <= mod(r.stake,r.market_count) THEN 1 ELSE 0 END) * greatest(0,1-coalesce(a.closed,0)))::text,
       floor((r.liability/r.market_count + CASE WHEN r.position <= mod(r.liability,r.market_count) THEN 1 ELSE 0 END) * greatest(0,1-coalesce(a.closed,0)))::text,
       1, CASE WHEN coalesce(a.closed,0)>0 THEN 'PARTIALLY_CLOSED'::"WagerExposureAllocationStatusType" ELSE 'OPEN'::"WagerExposureAllocationStatusType" END, now(), now()
FROM ranked r LEFT JOIN accepted_portions a ON a.wager=r.wager;

