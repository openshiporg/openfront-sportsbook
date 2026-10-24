import { OperatorShell, TenantRequired } from "../components/OperatorShell";
import { ReadFailed } from "../components/ReadFailed";
import { dateTime, displayTimeZone, shortId } from "../lib/format";
import { searchFrom } from "../lib/graphql";
import { getOperatorContext } from "../lib/operator";
import { allowedParam, pageFrom, PLATFORM_PAGE_SIZE, type PlatformSearchParams } from "../lib/paging";
import { getCatalog } from "./actions";
import { CatalogPageClient } from "./screens/CatalogPageClient";

const eventStatuses = ["SCHEDULED", "LIVE", "ENDED", "CANCELLED", "SUSPENDED"] as const;

/** Server screen: authorizes the operator, reads the catalog through GraphQL and hands typed rows and picker options to the client screen. */
export async function CatalogScreen({ searchParams }: { searchParams?: PlatformSearchParams } = {}) {
  const params = (await searchParams) ?? {};
  const page = pageFrom(params);
  const search = searchFrom(params);
  const status = allowedParam(params, "status", eventStatuses);
  const competitionSearch = searchFrom(params, "competition");
  const operator = await getOperatorContext("canTrade");
  if (!operator) return <OperatorShell active="Catalog" title="Catalog"><TenantRequired /></OperatorShell>;
  const result = await getCatalog({ page, pageSize: PLATFORM_PAGE_SIZE, search, status, competitionSearch });
  return <OperatorShell active="Catalog" title="Catalog" tone={result.success ? (result.data.pendingMappings ? "wait" : "ok") : "alert"} meta={result.success ? `${result.data.allEvents} events · ${result.data.markets} markets · ${result.data.pendingMappings} mappings pending` : undefined} tenantName={operator.tenantName}>
    {result.success ? <CatalogPageClient data={{
      rows: result.data.events.map((event) => ({ id: event.id, name: event.name || shortId(event.id), reference: shortId(event.externalKey || event.id), competition: event.competition?.name || "Unassigned", startsAt: dateTime(event.startAt), status: event.status })),
      total: result.data.total, allEvents: result.data.allEvents, markets: result.data.markets, allCompetitions: result.data.allCompetitions, pendingMappings: result.data.pendingMappings,
      competitionOptions: result.data.competitions.map((competition) => ({ label: `${competition.sport?.name || "Sport"} · ${competition.name || shortId(competition.id)}`, value: competition.id })),
      competitionTotal: result.data.competitionTotal, competitionSearch,
      definitionOptions: Array.from(new Map(result.data.definitions.filter((definition) => definition.key).map((definition) => [definition.key as string, { label: definition.sportKey && definition.sportKey !== "*" ? `${definition.name} · ${definition.sportKey}` : `${definition.name} · all sports`, value: definition.key as string }])).values()),
      timeZone: displayTimeZone(),
      canTrade: operator.capabilities.canTrade, page, pageSize: PLATFORM_PAGE_SIZE, search, status,
    }} /> : <ReadFailed subject="the catalog" />}
  </OperatorShell>;
}
