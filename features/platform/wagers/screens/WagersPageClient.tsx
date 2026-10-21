'use client';

import Link from "next/link";
import { ListFilters } from "../../components/ListFilters";
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
const linkClass = "inline-flex rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted";

export function WagersPageClient({ data }: { data: WagersPageData }) {
  const filtered = Boolean(data.status || data.search);
  return <>
    <MetricGrid items={[
      { label: data.status ? `${data.status.replaceAll("_", " ").toLowerCase()} wagers` : data.search ? "Matching wagers" : "Wagers", value: data.total, detail: `Showing ${data.rows.length} on page ${data.page}` },
      { label: "Accepted", value: data.accepted, detail: "Current accepted state" },
      { label: "Rejected", value: data.rejected, detail: "Evidence retained" },
      { label: "Accepted handle (this page)", value: data.handle, detail: data.handleDetail },
    ]} />
    <RecordList
      title="Wager receipts"
      description={`${data.openDisputes} open or investigating disputes. Open a receipt for terms and gate-level evidence. Search by exact wager ID or request key.`}
      action={<ListFilters searchLabel="Search wagers" searchPlaceholder="Wager ID or request key" filters={[{ key: "status", label: "Status", options: data.statuses.map((value) => ({ label: value.replaceAll("_", " ").toLowerCase(), value })) }]} />}
      columns={["Reference", "Player", "Stake / return", "State"]}
      rows={data.rows.map((wager) => ({
        id: wager.id,
        href: `${basePath}/${wager.id}`,
        cells: [
          <span key="id" className="font-mono">{wager.reference}</span>,
          wager.player,
          wager.stakeAndReturn,
          <span key="state" className="flex flex-wrap gap-2"><StatusBadge value={wager.status} />{wager.disputed ? <StatusBadge value="INVESTIGATING" /> : null}</span>,
        ],
      }))}
      filtered={filtered}
      emptyTitle={filtered ? "No matching wagers" : "No wager receipts"}
      emptyDescription={filtered ? "No wagers match this status or search." : "Accepted and rejected wagers will appear here."}
      emptyAction={filtered ? <Link href={basePath} className={linkClass}>Show all wagers</Link> : <Link href="/dashboard/platform/trading" className={linkClass}>Check markets open for betting</Link>}
      pagination={{ page: data.page, pageSize: data.pageSize, total: data.total, hrefForPage: (next) => hrefWith(basePath, { status: data.status, q: data.search, page: next }) }}
    />
  </>;
}
