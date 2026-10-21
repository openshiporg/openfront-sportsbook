import { OperatorShell, TenantRequired } from "../components/OperatorShell";
import { ReadFailed } from "../components/ReadFailed";
import { dateTime } from "../lib/format";
import { searchFrom } from "../lib/graphql";
import { getOperatorContext } from "../lib/operator";
import { allowedParam, pageFrom, PLATFORM_PAGE_SIZE, type PlatformSearchParams } from "../lib/paging";
import { getTradingBook } from "./actions";
import { TradingPageClient } from "./screens/TradingPageClient";
import { marketPriceSummaries, unpricedOpenSelections } from "../lib/aggregates";

const marketStatuses = ["OPEN", "SUSPENDED", "CLOSED", "GRADED"] as const;

/** Server screen: authorizes the trader, reads the market book through GraphQL and hands typed rows to the client screen. */
export async function TradingScreen({ searchParams }: { searchParams?: PlatformSearchParams } = {}) {
  const params = (await searchParams) ?? {};
  const page = pageFrom(params);
  const search = searchFrom(params);
  const status = allowedParam(params, "status", marketStatuses);
  const operator = await getOperatorContext("canTrade");
  if (!operator) return <OperatorShell active="Trading" eyebrow="Trading operations" title="Markets and prices" description="Market status and prices, with suspend and reopen controls."><TenantRequired /></OperatorShell>;
  const formNow = new Date();
  const result = await getTradingBook({ page, pageSize: PLATFORM_PAGE_SIZE, search, status, now: formNow.toISOString() });
  // Exact per-market selection/priced counts, newest price, and tenant-wide unpriced selections in
  // OPEN markets (Selection has no GraphQL price relation): server-only, canTrade + tenant re-checked.
  const [summaries, unpriced] = result.success ? await Promise.all([marketPriceSummaries(operator, result.data.markets.map((market) => market.id)), unpricedOpenSelections(operator)]) : [new Map(), 0];
  return <OperatorShell active="Trading" eyebrow="Trading operations" title="Markets and prices" description="Market status and prices, with suspend and reopen controls." tenantName={operator.tenantName}>
    {result.success ? <TradingPageClient data={{
      rows: result.data.markets.map((market) => { const summary = summaries.get(market.id) ?? { selections: 0, priced: 0, latest: null }; return { id: market.id, eventName: market.event?.name || "Event not visible", definitionKey: market.definitionKey || "—", selections: `${summary.selections} total · ${summary.priced} priced`, latestPrice: summary.latest ? `${summary.latest.decimalOdds} · ${dateTime(summary.latest.receivedAt)}` : "No price received", status: market.status }; }),
      total: result.data.total, allMarkets: result.data.allMarkets, live: result.data.live, suspended: result.data.suspended, priceSnapshots: result.data.priceSnapshots, feedExceptions: result.data.feedExceptions, activeOverrides: result.data.activeOverrides,
      unpriced,
      overrideTargetOptions: result.data.overrideTargets.map((market) => ({ label: `${market.event?.name || "Event"} · ${market.definitionKey} · ${market.status}`, value: market.id })),
      overrideExpiresAt: new Date(formNow.getTime() + 3_600_000).toISOString(),
      page, pageSize: PLATFORM_PAGE_SIZE, search, status,
    }} /> : <ReadFailed subject="the market book" />}
  </OperatorShell>;
}
