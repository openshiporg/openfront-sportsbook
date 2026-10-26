'use client';

import type { ReactNode } from "react";
import { ListFilters } from "../../components/ListFilters";
import { Mono, PillLink, Track } from "../../components/kit";
import { MetricGrid, RecordList, StatusBadge, statusDotTone } from "../../components/WorkflowUI";
import { hrefWith } from "../../lib/paging";

export type ReconciliationItemRow = { id: string; run: string; runId: string | null; createdAt: string; internalReference: string; providerReference: string; difference: string; status: string | null; resolution: string | null };
export type SafeguardingAccountRow = { id: string; reference: string; shortId: string; classification: string; currency: string; status: string | null };
export type SafeguardingControlRow = { id: string; reference: string; account: string; asOf: string; difference: string; status: string | null };
export type AdjustmentRow = { id: string; reference: string; account: string; amount: string; reason: string; createdAt: string; status: string | null; journal: string | null };
type ListPage = { page: number; pageSize: number; total: number };

export type ReconciliationPageData = {
  metrics: { runCount: number; completedRuns: number; openItems: number; openDifferences: string; controlTotal: number; shortfalls: number; adjustmentTotal: number; pendingAdjustments: number };
  items: ReconciliationItemRow[];
  itemPage: ListPage;
  search?: string;
  status?: string;
  accounts: SafeguardingAccountRow[];
  controls: SafeguardingControlRow[];
  controlPage: ListPage;
  adjustments: AdjustmentRow[];
  adjustmentPage: ListPage;
};

const basePath = "/dashboard/platform/finance/reconciliation";
const statusValues = ["OPEN", "MATCHED", "RESOLVED"] as const;
const toneRank = { alert: 0, live: 0, wait: 1, info: 2, ok: 3, off: 4 } as const;
/** Shortfalls, open and pending rows lead each page; ties keep the server order. */
function needsAttentionFirst<T>(rows: T[], status: (row: T) => string | null) {
  return rows.map((row, index) => ({ row, index })).sort((a, b) => toneRank[statusDotTone(status(a.row))] - toneRank[statusDotTone(status(b.row))] || a.index - b.index).map(({ row }) => row);
}
// OPEN reconciliation items are unmatched differences: dot them as waiting, not as neutral "open".
const itemDot = (status: string | null) => (status === "OPEN" ? "UNMATCHED" : status ?? undefined);

/** Exception worklist (URL search/status/page), safeguarding register and controls, adjustment requests. */
export function ReconciliationPageClient({ data, forms, trailing }: { data: ReconciliationPageData; forms: ReactNode; trailing: ReactNode }) {
  const state = { q: data.search, status: data.status, page: data.itemPage.page, cpage: data.controlPage.page, apage: data.adjustmentPage.page };
  const hrefFor = (key: "page" | "cpage" | "apage") => (next: number) => { const pages = { ...state, [key]: next }; return hrefWith(basePath, { ...pages, cpage: pages.cpage === 1 ? undefined : pages.cpage, apage: pages.apage === 1 ? undefined : pages.apage }); };
  const statusHref = (status?: string) => hrefWith(basePath, { q: data.search, status, cpage: data.controlPage.page === 1 ? undefined : data.controlPage.page, apage: data.adjustmentPage.page === 1 ? undefined : data.adjustmentPage.page });
  const filtered = Boolean(data.search || data.status);
  return <>
    <MetricGrid items={[
      { label: "Open items", value: data.metrics.openItems, detail: data.metrics.openDifferences, tone: data.metrics.openItems ? "alert" : "ok" },
      { label: "Shortfalls", value: data.metrics.shortfalls, detail: `${data.metrics.controlTotal} controls`, tone: data.metrics.shortfalls ? "alert" : "ok" },
      { label: "Pending adjustments", value: data.metrics.pendingAdjustments, detail: `${data.metrics.adjustmentTotal} requests`, tone: data.metrics.pendingAdjustments ? "wait" : "ok" },
      { label: "Runs", value: data.metrics.runCount, detail: `${data.metrics.completedRuns} complete` },
    ]} />

    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="min-w-0 flex-1"><ListFilters searchLabel="Search exceptions" searchPlaceholder="Internal or provider reference, or item ID" /></div>
      <Track label="Item state">
        <PillLink size="sm" variant="flat" href={statusHref()} current={!data.status}>All</PillLink>
        {statusValues.map((value) => <PillLink key={value} size="sm" variant="flat" href={statusHref(value)} current={data.status === value}>{value === "OPEN" ? "unmatched" : value.toLowerCase()}</PillLink>)}
      </Track>
    </div>
    <RecordList title="Exceptions" tone={data.metrics.openItems ? "alert" : undefined}
      columns={["Item", "References", "Difference", "State"]}
      rows={needsAttentionFirst(data.items, (item) => itemDot(item.status) ?? null).map((item) => ({ id: item.id, href: `${basePath}/items/${item.id}`, status: itemDot(item.status), cells: [
        <span key="id"><Mono className="break-all text-xs">{item.id}</Mono><span className="block tabular-nums text-xs font-normal  text-muted-foreground">run {item.run} · {item.createdAt}</span></span>,
        <span key="refs" className="block tabular-nums text-xs"><span className="block break-all">int {item.internalReference}</span><span className="block break-all">prov {item.providerReference}</span></span>,
        <Mono key="diff">{item.difference}</Mono>,
        <span key="state" className="block"><StatusBadge value={item.status} />{item.resolution ? <span className="mt-1 block tabular-nums text-xs text-muted-foreground">journal {item.resolution}</span> : null}</span>,
      ] }))}
      filtered={filtered}
      emptyTitle={filtered ? "No matching exceptions" : "No reconciliation items"}
      emptyAction={filtered ? <Track><PillLink size="sm" href={basePath}>Clear filters</PillLink></Track> : undefined}
      pagination={{ ...data.itemPage, hrefForPage: hrefFor("page") }} />

    <div className="grid gap-4 xl:grid-cols-2">
      <RecordList title="Safeguarding controls" tone={data.metrics.shortfalls ? "alert" : undefined} columns={["Control", "As of", "Difference", "State"]}
        rows={needsAttentionFirst(data.controls, (item) => item.status).map((item) => ({ id: item.id, href: `/dashboard/platform/finance/safeguarding/${item.id}`, status: item.status ?? undefined, cells: [<span key="id"><Mono className="break-all">{item.reference}</Mono><span className="block break-all text-xs font-normal text-muted-foreground">{item.account}</span></span>, <Mono key="asof" className="text-xs">{item.asOf}</Mono>, <Mono key="diff">{item.difference}</Mono>, <StatusBadge key="state" value={item.status} />] }))}
        emptyTitle="No safeguarding controls"
        pagination={{ ...data.controlPage, hrefForPage: hrefFor("cpage") }} />
      <RecordList title="Adjustment requests" tone={data.metrics.pendingAdjustments ? "wait" : undefined} columns={["Request", "Account", "Amount / reason", "State"]}
        rows={needsAttentionFirst(data.adjustments, (item) => item.status).map((item) => ({ id: item.id, href: `/dashboard/platform/finance/adjustments/${item.id}`, status: item.status ?? undefined, cells: [<span key="id"><Mono className="break-all">{item.reference}</Mono><span className="block tabular-nums text-xs font-normal  text-muted-foreground">{item.createdAt}</span></span>, <Mono key="account" className="break-all text-xs">{item.account}</Mono>, <span key="amount"><Mono>{item.amount}</Mono><span className="block text-xs text-muted-foreground">{item.reason}</span></span>, <span key="state" className="block"><StatusBadge value={item.status} />{item.journal ? <span className="mt-1 block tabular-nums text-xs text-muted-foreground">journal {item.journal}</span> : null}</span>] }))}
        emptyTitle="No adjustment requests"
        pagination={{ ...data.adjustmentPage, hrefForPage: hrefFor("apage") }} />
    </div>

    {forms}

    <RecordList title="Safeguarding accounts" columns={["Account", "Classification", "Currency", "State"]}
      rows={data.accounts.map((item) => ({ id: item.id, status: item.status ?? undefined, cells: [<span key="id"><span className="break-all font-semibold">{item.reference}</span><span className="block break-all tabular-nums text-xs font-normal text-muted-foreground">{item.shortId}</span></span>, item.classification, <Mono key="cur">{item.currency}</Mono>, <StatusBadge key="state" value={item.status} />] }))}
      emptyTitle="No safeguarding account"
      emptyAction={<Track><PillLink size="sm" href="/dashboard/platform/onboarding">Onboarding</PillLink></Track>} />
    {trailing}
  </>;
}
