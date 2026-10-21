'use client';

import type { ReactNode } from "react";
import Link from "next/link";
import { MetricGrid, RecordList, StatusBadge } from "../../components/WorkflowUI";
import { hrefWith } from "../../lib/paging";

export type FinanceJournalRow = { id: string; reference: string; effectiveAt: string; type: string; amounts: string; state: string };
export type FinancePaymentRow = { id: string; player: string; type: string; amount: string; status: string | null };
export type FinanceRunRow = { id: string; reference: string; window: string; difference: string; status: string | null };
export type FinanceListPage = { page: number; pageSize: number; total: number };

export type FinancePageData = {
  metrics: { journalTotal: number; balanced: string; balancedDetail: string; available: string; availableDetail: string; openReconItems: number };
  journals: FinanceJournalRow[];
  journalPage: FinanceListPage;
  runs: FinanceRunRow[];
  runPage: FinanceListPage;
  payments: FinancePaymentRow[];
  paymentPage: FinanceListPage;
};

const basePath = "/dashboard/platform/finance";
const actionLink = "inline-flex rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted";

/** Finance lists with independent URL pages (?jpage, ?rpage, ?ppage); forms are rendered by the server screen. */
export function FinancePageClient({ data, forms }: { data: FinancePageData; forms: ReactNode }) {
  const pages = { jpage: data.journalPage.page, rpage: data.runPage.page, ppage: data.paymentPage.page };
  const hrefFor = (key: keyof typeof pages) => (next: number) => hrefWith(basePath, { ...pages, [key]: next === 1 ? undefined : next });
  return <>
    <MetricGrid items={[
      { label: "Journal transactions", value: data.metrics.journalTotal, detail: `Showing ${data.journals.length} on page ${data.journalPage.page}` },
      { label: "Balanced on page", value: data.metrics.balanced, detail: data.metrics.balancedDetail },
      { label: "Player available", value: data.metrics.available, detail: data.metrics.availableDetail },
      { label: "Recon exceptions", value: data.metrics.openReconItems, detail: "Open items" },
    ]} />
    <RecordList title="Journal transactions" description="Newest first. Totals are calculated from each journal's ledger entries." columns={["Transaction", "Type", "Debits / credits", "State"]}
      rows={data.journals.map((journal) => ({ id: journal.id, href: `${basePath}/journals/${journal.id}`, cells: [<span key="id">{journal.reference}<span className="block text-xs text-muted-foreground">{journal.effectiveAt}</span></span>, journal.type, journal.amounts, <StatusBadge key="status" value={journal.state} />] }))}
      emptyTitle="No journal transactions" emptyDescription="Ledger journals appear here as wagers and payments are posted."
      emptyAction={<Link href="/dashboard/platform/wagers" className={actionLink}>Open wagers</Link>}
      pagination={{ ...data.journalPage, hrefForPage: hrefFor("jpage") }} />
    <RecordList title="Reconciliation runs" description={`${data.metrics.openReconItems} unresolved item(s) across tenant runs.`} columns={["Run", "Type / window", "Difference", "State"]}
      rows={data.runs.map((run) => ({ id: run.id, href: `${basePath}/reconciliation/runs/${run.id}`, cells: [run.reference, run.window, run.difference, <StatusBadge key="status" value={run.status} />] }))}
      emptyTitle="No reconciliation runs" emptyDescription="Run a ledger check below to see its results here."
      emptyAction={<Link href={`${basePath}/reconciliation`} className={actionLink}>Open reconciliation</Link>}
      pagination={{ ...data.runPage, hrefForPage: hrefFor("rpage") }} />
    <RecordList title="Payment intents" description="Sandbox adapter operations are labeled and remain separate from production funding." columns={["Player", "Type", "Amount", "State"]}
      rows={data.payments.map((payment) => ({ id: payment.id, href: `${basePath}/payments/${payment.id}`, cells: [payment.player, payment.type, payment.amount, <StatusBadge key="state" value={payment.status} />] }))}
      emptyTitle="No payments" emptyDescription="No payments have been made yet. Use the sandbox payment action below to post one."
      pagination={{ ...data.paymentPage, hrefForPage: hrefFor("ppage") }} />
    {forms}
  </>;
}
