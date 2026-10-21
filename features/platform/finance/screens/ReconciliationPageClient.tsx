'use client';

import type { ReactNode } from "react";
import Link from "next/link";
import { ListFilters } from "../../components/ListFilters";
import { MetricGrid, RecordList, StatusBadge } from "../../components/WorkflowUI";
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
const actionLink = "inline-flex rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted";
const statusOptions = ["OPEN", "MATCHED", "RESOLVED"].map((value) => ({ label: value.toLowerCase(), value }));

/** Exception worklist (URL search/status/page), safeguarding register and controls, adjustment requests. */
export function ReconciliationPageClient({ data, forms, trailing }: { data: ReconciliationPageData; forms: ReactNode; trailing: ReactNode }) {
  const state = { q: data.search, status: data.status, page: data.itemPage.page, cpage: data.controlPage.page, apage: data.adjustmentPage.page };
  const hrefFor = (key: "page" | "cpage" | "apage") => (next: number) => { const pages = { ...state, [key]: next }; return hrefWith(basePath, { ...pages, cpage: pages.cpage === 1 ? undefined : pages.cpage, apage: pages.apage === 1 ? undefined : pages.apage }); };
  const filtered = Boolean(data.search || data.status);
  return <>
    <MetricGrid items={[
      { label: "Reconciliation runs", value: data.metrics.runCount, detail: `${data.metrics.completedRuns} complete` },
      { label: "Open differences", value: data.metrics.openItems, detail: data.metrics.openDifferences },
      { label: "Safeguarding controls", value: data.metrics.controlTotal, detail: `${data.metrics.shortfalls} shortfalls` },
      { label: "Adjustment requests", value: data.metrics.adjustmentTotal, detail: `${data.metrics.pendingAdjustments} pending` },
    ]} />
    {forms}
    <RecordList title="Safeguarding account register" description="Database labels do not substitute for approved bank and legal arrangements." columns={["Account", "Classification", "Currency", "State"]}
      rows={data.accounts.map((item) => ({ id: item.id, cells: [<div key="id"><p className="font-semibold">{item.reference}</p><p className="text-xs text-muted-foreground">{item.shortId}</p></div>, item.classification, item.currency, <StatusBadge key="state" value={item.status} />] }))}
      emptyTitle="No safeguarding account" emptyDescription="Funds protection is configured during onboarding."
      emptyAction={<Link href="/dashboard/platform/onboarding" className={actionLink}>Open onboarding</Link>} />
    <RecordList title="Reconciliation exception worklist" description="Open an item for its run, references and resolution. Resolve it by requesting a ledger adjustment linked to the item; the approved adjustment posts its journal and resolves the item atomically."
      action={<ListFilters searchLabel="Search exceptions" searchPlaceholder="Internal or provider reference, or item ID" filters={[{ key: "status", label: "State", options: statusOptions }]} />}
      columns={["Item", "References", "Difference", "State"]}
      rows={data.items.map((item) => ({ id: item.id, href: `${basePath}/items/${item.id}`, cells: [<div key="id"><p className="font-mono text-xs">{item.id}</p><p className="text-xs text-muted-foreground">Run {item.run} · {item.createdAt}</p></div>, <div key="refs" className="text-xs"><p className="break-all">Internal {item.internalReference}</p><p className="break-all">Provider {item.providerReference}</p></div>, item.difference, <div key="state"><StatusBadge value={item.status} />{item.resolution ? <p className="mt-1 text-xs text-muted-foreground">Journal {item.resolution}</p> : null}</div>] }))}
      filtered={filtered}
      emptyTitle={filtered ? "No matching exceptions" : "No reconciliation items"}
      emptyDescription={filtered ? "No exception matches this search or state." : "Run a journal control above to compare the ledger for a window."}
      emptyAction={filtered ? <Link href={basePath} className={actionLink}>Clear search and filters</Link> : undefined}
      pagination={{ ...data.itemPage, hrefForPage: hrefFor("page") }} />
    <RecordList title="Control history" description="Operator-attested asset, ledger liability and difference amounts are immutable evidence; they do not certify a bank balance." columns={["Control", "As of", "Difference", "State"]}
      rows={data.controls.map((item) => ({ id: item.id, href: `/dashboard/platform/finance/safeguarding/${item.id}`, cells: [<span key="id">{item.reference}<span className="block text-xs text-muted-foreground">{item.account}</span></span>, item.asOf, item.difference, <StatusBadge key="state" value={item.status} />] }))}
      emptyTitle="No safeguarding controls" emptyDescription="Run a safeguarding comparison above."
      pagination={{ ...data.controlPage, hrefForPage: hrefFor("cpage") }} />
    <RecordList title="Ledger adjustment requests" description="Each request posts nothing until another operator approves its exact payload; open one for approval and journal linkage." columns={["Request", "Account", "Amount / reason", "State"]}
      rows={data.adjustments.map((item) => ({ id: item.id, href: `/dashboard/platform/finance/adjustments/${item.id}`, cells: [<span key="id">{item.reference}<span className="block text-xs text-muted-foreground">{item.createdAt}</span></span>, item.account, <span key="amount">{item.amount}<span className="block text-xs text-muted-foreground">{item.reason}</span></span>, <div key="state"><StatusBadge value={item.status} />{item.journal ? <p className="mt-1 text-xs text-muted-foreground">Journal {item.journal}</p> : null}</div>] }))}
      emptyTitle="No adjustment requests" emptyDescription="Request a ledger adjustment above, or open an exception to request one linked to it."
      pagination={{ ...data.adjustmentPage, hrefForPage: hrefFor("apage") }} />
    {trailing}
  </>;
}
