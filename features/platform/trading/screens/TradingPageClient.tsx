'use client';

import Link from "next/link";
import { ListFilters } from "../../components/ListFilters";
import { MutationForm } from "../../components/MutationForm";
import { MetricGrid, RecordList, StatusBadge } from "../../components/WorkflowUI";
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
const linkClass = "inline-flex rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted";

export function TradingPageClient({ data }: { data: TradingPageData }) {
  const filtered = Boolean(data.search || data.status);
  return <>
    <MetricGrid items={[
      { label: filtered ? "Matching markets" : "Markets", value: data.total, detail: `${data.live} in-play of ${data.allMarkets}` },
      { label: "Suspended", value: data.suspended, detail: "Operator or safety state" },
      { label: "Price snapshots", value: data.priceSnapshots, detail: `${data.feedExceptions} feed exceptions in the newest 100 health checks you can see` },
      { label: "Active overrides", value: data.activeOverrides, detail: `Unexpired only · ${data.unpriced} unpriced selections in open markets` },
    ]} />
    <div className="grid gap-4 xl:grid-cols-3">
      <MutationForm compact title="Event clock & state" description="Live transitions are explicit; suspension or completion closes affected acceptance safely." mutation={`mutation($eventId:ID!,$status:String!,$livePhase:String,$clockSeconds:Int,$reason:String!){setEventTradingState(eventId:$eventId,status:$status,livePhase:$livePhase,clockSeconds:$clockSeconds,reason:$reason)}`} fields={[{ name: 'eventId', label: 'Event ID' }, { name: 'status', label: 'State', type: 'select', options: ['SCHEDULED', 'LIVE', 'SUSPENDED', 'ENDED', 'CANCELLED'].map(value => ({ label: value, value })) }, { name: 'livePhase', label: 'Live phase', defaultValue: 'Q2', required: false }, { name: 'clockSeconds', label: 'Clock seconds', type: 'number', transform: 'int', defaultValue: 0, required: false, help: 'A clock-only change (same state and phase) is applied and versioned; an identical submission is a no-op.' }, { name: 'reason', label: 'Reason', placeholder: 'Why this is needed and what you reviewed' }]} submitLabel="Apply event state" successMessage="Event state, clock and safety action persisted." />
      <MutationForm compact title="Request market status override" description="Suspend or close a market with bounded expiry plus independent approval. Price, line, stake, payout, liability and cash-out overrides are unavailable: no pricing, admission or cash-out path applies them yet." mutation={`mutation($targetType:String!,$targetId:ID!,$overrideType:String!,$value:String!,$expiresAt:String!,$reason:String!){requestTraderOverride(targetType:$targetType,targetId:$targetId,overrideType:$overrideType,value:$value,expiresAt:$expiresAt,reason:$reason)}`} fields={[{ name: 'targetType', label: 'Target type', type: 'hidden', defaultValue: 'MARKET' }, { name: 'targetId', label: 'Market', type: 'select', options: data.overrideTargetOptions, help: 'The 100 most recently updated markets.' }, { name: 'overrideType', label: 'Override', type: 'hidden', defaultValue: 'STATUS' }, { name: 'value', label: 'Status', type: 'select', options: [{ label: 'Suspend', value: '{"status":"SUSPENDED"}' }, { label: 'Close', value: '{"status":"CLOSED"}' }] }, { name: 'expiresAt', label: 'Expires at', defaultValue: data.overrideExpiresAt }, { name: 'reason', label: 'Reason', placeholder: 'Why this is needed and what you reviewed' }]} submitLabel="Request override" successMessage="Override approval requested." />
      <MutationForm compact title="Apply approved override" description="The exact target, value and expiry are re-hashed before application; an expired request cannot be applied." mutation={`mutation($overrideId:ID!,$approvalId:ID!){applyTraderOverride(overrideId:$overrideId,approvalId:$approvalId)}`} fields={[{ name: 'overrideId', label: 'Override ID' }, { name: 'approvalId', label: 'Approved request ID' }]} submitLabel="Apply override" successMessage="Override activated and audited." />
    </div>
    <RecordList
      title="Market book"
      description="Open a market to enter a price or change its trading state. Search by event name, market type or exact market ID."
      action={<ListFilters searchLabel="Search markets" searchPlaceholder="Event, market type or ID" filters={[{ key: "status", label: "State", options: statusOptions }]} />}
      columns={["Event / market", "Selections", "Latest update", "State"]}
      rows={data.rows.map((market) => ({ id: market.id, href: `${basePath}/${market.id}`, cells: [<span key="market">{market.eventName}<span className="mt-1 block font-mono text-xs text-muted-foreground">{market.definitionKey}</span></span>, market.selections, market.latestPrice, <StatusBadge key="status" value={market.status} />] }))}
      filtered={filtered}
      emptyTitle={filtered ? "No matching markets" : "No markets to trade"}
      emptyDescription={filtered ? "No market matches this search or state." : "Create an event and its first market in Catalog."}
      emptyAction={filtered ? <Link href={basePath} className={linkClass}>Clear search and filters</Link> : <Link href="/dashboard/platform/catalog#create-event" className={linkClass}>Create an event in Catalog</Link>}
      pagination={{ page: data.page, pageSize: data.pageSize, total: data.total, hrefForPage: (next) => hrefWith(basePath, { q: data.search, status: data.status, page: next }) }}
    />
  </>;
}
