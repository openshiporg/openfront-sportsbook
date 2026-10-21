-- Rebuild the non-accounting exposure cache from authoritative per-wager allocations.
UPDATE "ExposurePosition" projection
SET "stakeMinor" = totals.stake::text,
    "liabilityMinor" = totals.liability::text,
    version = projection.version + 1,
    "asOf" = now(),
    "updatedAt" = now()
FROM (
  SELECT p.id,
         coalesce(sum(a."remainingStakeMinor"::numeric) FILTER (WHERE a.status <> 'CLOSED'),0) AS stake,
         coalesce(sum(a."remainingLiabilityMinor"::numeric) FILTER (WHERE a.status <> 'CLOSED'),0) AS liability
  FROM "ExposurePosition" p
  LEFT JOIN "WagerExposureAllocation" a ON a.tenant=p.tenant AND a.market=p."scopeId"
  WHERE p."scopeType"='MARKET'
  GROUP BY p.id
) totals
WHERE projection.id=totals.id;
