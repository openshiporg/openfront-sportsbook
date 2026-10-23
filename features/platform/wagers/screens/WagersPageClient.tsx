'use client';

import { ListFilters } from "../../components/ListFilters";
import { Mono, PillLink, Track } from "../../components/kit";
import { MetricGrid, RecordList, StatusBadge } from "../../components/WorkflowUI";
import { hrefWith } from "../../lib/paging";

export type WagerRow = {
  id: string;
  reference: string;
  /** Player reference, or "Restricted" when the role can't read players. */
  player: string;
  stakeAndReturn: string;
  status: string | null;
  disputed: boolean;
};

export type WagersPageData = {
  rows: WagerRow[];
  total: number;
  accepted: number;
  rejected: number;
  openDisputes: number;
  handle: string;
  handleDetail: string;
  page: number;
  pageSize: number;
  status?: string;
  search?: string;
  statuses: readonly string[];
};

const basePath = "/dashboard/platform/wagers";
const stateText = (value: string | null | undefined) => (value || "unknown").replaceAll("_", " ").toLowerCase();

/** Server-formatted "stake → return · time" split back into mono figures and a time line. */
function StakeAndReturn({ value }: { value: string }) {
  const split = value.lastIndexOf(" · ");
  if (split < 0) return <Mono>{value}</Mono>;
  return <span><Mono className="text-foreground">{value.slice(0, split)}</Mono><span className="block text-xs">{value.slice(split + 3)}</span></span>;
}

export function WagersPageClient({ data }: { data: WagersPageData }) {
  const filtered = Boolean(data.status || data.search);
  return <>
    <MetricGrid items={[
      { label: "Open disputes", value: data.openDisputes, tone: data.openDisputes ? "alert" : "ok" },
      { label: data.status ? stateText(data.status) : data.search ? "Matching" : "Wagers", value: data.total },
      { label: "Accepted", value: data.accepted, detail: `${data.rejected} rejected` },
      { label: "Handle (page)", value: data.handle, detail: data.handleDetail },
    ]} />
    <RecordList
      title="Receipts"
      action={<ListFilters searchLabel="Search wagers" searchPlaceholder="Wager ID or request key" filters={[{ key: "status", label: "Status", options: data.statuses.map((value) => ({ label: stateText(value), value })) }]} />}
      columns={["Reference", "Player", "Stake → return", "State"]}
      rows={data.rows.map((wager) => ({
        id: wager.id,
        href: `${basePath}/${wager.id}`,
        status: wager.status ?? undefined,
        cells: [
          <Mono key="id" className="break-all">{wager.reference}</Mono>,
          <span key="player" className="break-all">{wager.player}</span>,
          <StakeAndReturn key="stake" value={wager.stakeAndReturn} />,
          <span key="state" className="flex flex-wrap items-center gap-x-3 gap-y-1"><span>{stateText(wager.status)}</span>{wager.disputed ? <StatusBadge value="INVESTIGATING" /> : null}</span>,
        ],
      }))}
      filtered={filtered}
      emptyTitle={filtered ? "No matching wagers" : "No wagers"}
      emptyAction={<Track>{filtered ? <PillLink size="sm" href={basePath}>Show all</PillLink> : <PillLink size="sm" href="/dashboard/platform/trading">Open Trading</PillLink>}</Track>}
      pagination={{ page: data.page, pageSize: data.pageSize, total: data.total, hrefForPage: (next) => hrefWith(basePath, { status: data.status, q: data.search, page: next }) }}
    />
  </>;
}
