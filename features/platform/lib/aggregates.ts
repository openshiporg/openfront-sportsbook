import { platformPrisma as prisma, type OperatorContext } from "./operator";

/**
 * Exact tenant-wide aggregates that GraphQL can't express (sums of text minor-unit columns,
 * latest-per-account projections, relation-less "no price" counts). Server-only: imported by
 * server screens, never exported as a server action. Every function re-checks the capability on
 * the operator context the screen obtained from getOperatorContext and scopes by its tenant.
 * Sums are done in SQL NUMERIC and returned as text, then parsed as BigInt — never through Number.
 */
function requireCapability(operator: OperatorContext, capability: keyof OperatorContext["capabilities"]) {
  if (!operator.capabilities[capability]) throw new Error("FORBIDDEN_AGGREGATE");
  return operator.tenantId;
}

const toBigInt = (value: string | null | undefined) => BigInt(value && /^-?\d+$/.test(value) ? value : (value ? value.split(".")[0] || "0" : "0"));

/** Available balance per currency from each PLAYER_CASH account's latest projection, across every account. */
export async function playerAvailableTotals(operator: OperatorContext) {
  const tenantId = requireCapability(operator, "canManageFinance");
  const rows = await prisma.$queryRaw`
    SELECT a.currency AS currency,
           CAST(SUM(CAST(NULLIF(p."availableMinor", '') AS NUMERIC)) AS TEXT) AS "availableMinor",
           COUNT(p.id)::int AS projected,
           COUNT(*)::int AS accounts
    FROM "LedgerAccount" a
    LEFT JOIN LATERAL (
      SELECT b.id, b."availableMinor" FROM "BalanceProjection" b
      WHERE b.account = a.id AND b.tenant = a.tenant
      ORDER BY b.version DESC NULLS LAST, b."createdAt" DESC, b.id DESC LIMIT 1
    ) p ON true
    WHERE a.tenant = ${tenantId} AND a.key = 'PLAYER_CASH'
    GROUP BY a.currency` as { currency: string; availableMinor: string | null; projected: number; accounts: number }[];
  const totals = new Map<string, bigint>();
  const currencies = new Set<string>();
  let projected = 0, accounts = 0;
  for (const row of rows) {
    projected += row.projected; accounts += row.accounts;
    if (row.currency) currencies.add(row.currency);
    if (row.projected && row.currency) totals.set(row.currency, toBigInt(row.availableMinor));
  }
  return { totals, projected, accounts, currencies };
}

/** Debit and credit totals per currency for each journal id, over all of its entries. */
export async function journalSideTotals(operator: OperatorContext, journalIds: string[]) {
  const tenantId = requireCapability(operator, "canManageFinance");
  const result = new Map<string, { currency: string; side: string; amountMinor: bigint }[]>();
  if (!journalIds.length) return result;
  const rows = await prisma.$queryRaw`
    SELECT "transaction" AS "journalId", currency, side::text AS side,
           CAST(SUM(CAST(NULLIF("amountMinor", '') AS NUMERIC)) AS TEXT) AS "amountMinor"
    FROM "JournalEntry"
    WHERE tenant = ${tenantId} AND "transaction" = ANY(${journalIds})
    GROUP BY "transaction", currency, side` as { journalId: string; currency: string; side: string; amountMinor: string | null }[];
  for (const row of rows) {
    const list = result.get(row.journalId) ?? [];
    list.push({ currency: row.currency, side: row.side, amountMinor: toBigInt(row.amountMinor) });
    result.set(row.journalId, list);
  }
  return result;
}

/** Absolute reconciliation differences per currency, per run, over every item of each run. */
export async function runDifferenceTotals(operator: OperatorContext, runIds: string[]) {
  const tenantId = requireCapability(operator, "canManageFinance");
  const result = new Map<string, Map<string, bigint>>();
  if (!runIds.length) return result;
  const rows = await prisma.$queryRaw`
    SELECT run AS "runId", currency, CAST(SUM(ABS(CAST(NULLIF("differenceMinor", '') AS NUMERIC))) AS TEXT) AS "differenceMinor"
    FROM "ReconciliationItem"
    WHERE tenant = ${tenantId} AND run = ANY(${runIds})
    GROUP BY run, currency` as { runId: string; currency: string; differenceMinor: string | null }[];
  for (const row of rows) {
    const value = toBigInt(row.differenceMinor);
    if (!value) continue;
    const totals = result.get(row.runId) ?? new Map<string, bigint>();
    totals.set(row.currency, value);
    result.set(row.runId, totals);
  }
  return result;
}

/** Absolute open reconciliation differences per currency across every OPEN item. */
export async function openDifferenceTotals(operator: OperatorContext) {
  const tenantId = requireCapability(operator, "canManageFinance");
  const rows = await prisma.$queryRaw`
    SELECT currency, CAST(SUM(ABS(CAST(NULLIF("differenceMinor", '') AS NUMERIC))) AS TEXT) AS "differenceMinor"
    FROM "ReconciliationItem"
    WHERE tenant = ${tenantId} AND status::text = 'OPEN'
    GROUP BY currency` as { currency: string; differenceMinor: string | null }[];
  const totals = new Map<string, bigint>();
  for (const row of rows) { const value = toBigInt(row.differenceMinor); if (value) totals.set(row.currency, value); }
  return totals;
}

/** Selections in OPEN markets with no price snapshot, tenant-wide. */
export async function unpricedOpenSelections(operator: OperatorContext): Promise<number> {
  const tenantId = requireCapability(operator, "canTrade");
  return prisma.selection.count({ where: { tenantId, market: { status: "OPEN" }, from_PriceSnapshot_selection: { none: {} } } });
}

/** Exact selection and priced-selection counts plus the newest price for each market id. */
export async function marketPriceSummaries(operator: OperatorContext, marketIds: string[]) {
  const tenantId = requireCapability(operator, "canTrade");
  const result = new Map<string, { selections: number; priced: number; latest: { decimalOdds: string | null; receivedAt: string | null } | null }>();
  if (!marketIds.length) return result;
  const [counts, latest] = await Promise.all([
    prisma.$queryRaw`
      SELECT s.market AS "marketId", COUNT(*)::int AS selections,
             COUNT(*) FILTER (WHERE EXISTS (SELECT 1 FROM "PriceSnapshot" p WHERE p.selection = s.id AND p.tenant = s.tenant))::int AS priced
      FROM "Selection" s
      WHERE s.tenant = ${tenantId} AND s.market = ANY(${marketIds})
      GROUP BY s.market` as Promise<{ marketId: string; selections: number; priced: number }[]>,
    prisma.$queryRaw`
      SELECT DISTINCT ON (s.market) s.market AS "marketId", p."decimalOdds" AS "decimalOdds", p."receivedAt" AS "receivedAt"
      FROM "PriceSnapshot" p JOIN "Selection" s ON s.id = p.selection AND s.tenant = p.tenant
      WHERE p.tenant = ${tenantId} AND s.market = ANY(${marketIds})
      ORDER BY s.market, p."receivedAt" DESC NULLS LAST, p.id DESC` as Promise<{ marketId: string; decimalOdds: string | null; receivedAt: Date | null }[]>,
  ]);
  for (const id of marketIds) result.set(id, { selections: 0, priced: 0, latest: null });
  for (const row of counts) result.set(row.marketId, { ...result.get(row.marketId)!, selections: row.selections, priced: row.priced });
  for (const row of latest) result.set(row.marketId, { ...result.get(row.marketId)!, latest: { decimalOdds: row.decimalOdds == null ? null : String(row.decimalOdds), receivedAt: row.receivedAt ? new Date(row.receivedAt).toISOString() : null } });
  return result;
}
