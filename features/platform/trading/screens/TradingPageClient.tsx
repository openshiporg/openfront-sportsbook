'use client';

import { ListFilters } from "../../components/ListFilters";
import { MutationForm } from "../../components/MutationForm";
import { Mono, PillLink, Track } from "../../components/kit";
import { MetricGrid, RecordList } from "../../components/WorkflowUI";
import { hrefWith } from "../../lib/paging";

export type TradingMarketRow = { id: string; eventName: string; definitionKey: string; selections: string; latestPrice: string; status: string | null };

export type TradingPageData = {
  rows: TradingMarketRow[];
  total: number;
  allMarkets: number;
  live: number;
  suspended: number;
  priceSnapshots: number;
  feedExceptions: number;
  activeOverrides: number;
  unpriced: number;
  overrideTargetOptions: { label: string; value: string }[];
  overrideExpiresAt: string;
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
};

const basePath = "/dashboard/platform/trading";
const statusOptions = ["OPEN", "SUSPENDED", "CLOSED", "GRADED"].map((value) => ({ label: value.toLowerCase(), value }));
const stateText = (value: string | null | undefined) => (value || "unknown").replaceAll("_", " ").toLowerCase();

/** Reads the server-formatted "N total · M priced" summary back into counts for display and ordering. */
function priceCoverage(selections: string) {
  const match = /^(\d+) total · (\d+) priced$/.exec(selections);
  return match ? { total: Number(match[1]), priced: Number(match[2]) } : null;
}

/** Suspended first, then markets with unpriced selections; otherwise the server order is kept. */
function actionRank(market: TradingMarketRow) {
  if (market.status === "SUSPENDED") return 0;
  const coverage = priceCoverage(market.selections);
  if (market.status === "OPEN" && (!coverage || coverage.priced < coverage.total)) return 1;
  return 2;
}

function LatestPrice({ value }: { value: string }) {
  const split = value.indexOf(" · ");
  if (split < 0) return <span className="text-red-600 dark:text-red-400">{value}</span>;
  return <span><Mono className="font-semibold text-foreground">{value.slice(0, split)}</Mono><span className="block text-xs">{value.slice(split + 3)}</span></span>;
}

export function TradingPageClient({ data }: { data: TradingPageData }) {
  const filtered = Boolean(data.search || data.status);
  const statusHref = (status?: string) => hrefWith(basePath, { q: data.search, status });
  const rows = data.rows.map((market, index) => ({ market, index, rank: actionRank(market) })).sort((a, b) => a.rank - b.rank || a.index - b.index);
  const needsAction = rows.filter((row) => row.rank < 2).length;
  return <>
    <MetricGrid items={[
      { label: "Suspended", value: data.suspended, tone: data.suspended ? "alert" : "ok" },
      { label: "Unpriced selections", value: data.unpriced, detail: "in open markets", tone: data.unpriced ? "alert" : "ok" },
      { label: "Feed exceptions", value: data.feedExceptions, detail: "last 100 checks", tone: data.feedExceptions ? "wait" : "ok" },
      { label: "Active overrides", value: data.activeOverrides, tone: data.activeOverrides ? "info" : undefined },
    ]} />
    <RecordList
      title={filtered ? "Matching markets" : "Market book"}
      tone={needsAction ? "alert" : undefined}
      action={<div className="flex min-w-0 flex-wrap items-center gap-2">
        <Track label="Market state">
          <PillLink size="sm" variant="flat" href={statusHref()} current={!data.status}>All</PillLink>
          {statusOptions.map((option) => <PillLink key={option.value} size="sm" variant="flat" href={statusHref(option.value)} current={data.status === option.value}>{option.label}</PillLink>)}
        </Track>
        <ListFilters searchLabel="Search markets" searchPlaceholder="Event, market type or ID" />
      </div>}
      columns={["Event / market", "Priced", "Latest price", "State"]}
      rows={rows.map(({ market }) => {
        const coverage = priceCoverage(market.selections);
        const short = coverage && coverage.priced < coverage.total;
        return { id: market.id, href: `${basePath}/${market.id}`, status: market.status ?? undefined, cells: [
          <span key="market">{market.eventName}<Mono className="mt-1 block break-all text-xs text-muted-foreground">{market.definitionKey}</Mono></span>,
          coverage ? <Mono key="priced" className={short ? "font-semibold text-red-600 dark:text-red-400" : undefined}>{coverage.priced}/{coverage.total}</Mono> : market.selections,
          <LatestPrice key="price" value={market.latestPrice} />,
          stateText(market.status),
        ] };
      })}
      filtered={filtered}
      emptyTitle={filtered ? "No matching markets" : "No markets"}
      emptyAction={<Track>{filtered ? <PillLink size="sm" href={basePath}>Clear filters</PillLink> : <PillLink size="sm" variant="primary" href="/dashboard/platform/catalog#create-event">Create event</PillLink>}</Track>}
      pagination={{ page: data.page, pageSize: data.pageSize, total: data.total, hrefForPage: (next) => hrefWith(basePath, { q: data.search, status: data.status, page: next }) }}
    />
    <section aria-labelledby="trading-controls" className="space-y-3">
      <h2 id="trading-controls" className="text-sm font-semibold">Controls</h2>
      <div className="grid gap-4 xl:grid-cols-3">
        <MutationForm compact title="Event clock & state" mutation={`mutation($eventId:ID!,$status:String!,$livePhase:String,$clockSeconds:Int,$reason:String!){setEventTradingState(eventId:$eventId,status:$status,livePhase:$livePhase,clockSeconds:$clockSeconds,reason:$reason)}`} fields={[{ name: 'eventId', label: 'Event ID' }, { name: 'status', label: 'State', type: 'select', options: ['SCHEDULED', 'LIVE', 'SUSPENDED', 'ENDED', 'CANCELLED'].map(value => ({ label: value, value })) }, { name: 'livePhase', label: 'Live phase', defaultValue: 'Q2', required: false }, { name: 'clockSeconds', label: 'Clock seconds', type: 'number', transform: 'int', defaultValue: 0, required: false }, { name: 'reason', label: 'Reason', placeholder: 'Why this is needed and what you reviewed' }]} submitLabel="Apply event state" successMessage="Event state, clock and safety action persisted." />
        <MutationForm compact title="Request status override" description="Suspend or close only" mutation={`mutation($targetType:String!,$targetId:ID!,$overrideType:String!,$value:String!,$expiresAt:String!,$reason:String!){requestTraderOverride(targetType:$targetType,targetId:$targetId,overrideType:$overrideType,value:$value,expiresAt:$expiresAt,reason:$reason)}`} fields={[{ name: 'targetType', label: 'Target type', type: 'hidden', defaultValue: 'MARKET' }, { name: 'targetId', label: 'Market', type: 'select', options: data.overrideTargetOptions }, { name: 'overrideType', label: 'Override', type: 'hidden', defaultValue: 'STATUS' }, { name: 'value', label: 'Status', type: 'select', options: [{ label: 'Suspend', value: '{"status":"SUSPENDED"}' }, { label: 'Close', value: '{"status":"CLOSED"}' }] }, { name: 'expiresAt', label: 'Expires at (ISO)', defaultValue: data.overrideExpiresAt }, { name: 'reason', label: 'Reason', placeholder: 'Why this is needed and what you reviewed' }]} submitLabel="Request override" successMessage="Override approval requested." />
        <MutationForm compact title="Apply approved override" mutation={`mutation($overrideId:ID!,$approvalId:ID!){applyTraderOverride(overrideId:$overrideId,approvalId:$approvalId)}`} fields={[{ name: 'overrideId', label: 'Override ID' }, { name: 'approvalId', label: 'Approved request ID' }]} submitLabel="Apply override" successMessage="Override activated and audited." />
      </div>
    </section>
  </>;
}
