'use client';

import type { ReactNode } from "react";
import { Mono, PillLink, Track } from "../../components/kit";
import { MetricGrid, RecordList, StatusBadge, statusDotTone } from "../../components/WorkflowUI";
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
const toneRank = { alert: 0, live: 0, wait: 1, info: 2, ok: 3, off: 4 } as const;
/** Exceptions and pending items lead each page; ties keep the server's newest-first order. */
function needsAttentionFirst<T>(rows: T[], status: (row: T) => string | null) {
  return rows.map((row, index) => ({ row, index })).sort((a, b) => toneRank[statusDotTone(status(a.row))] - toneRank[statusDotTone(status(b.row))] || a.index - b.index).map(({ row }) => row);
}

/** Finance lists with independent URL pages (?jpage, ?rpage, ?ppage); forms are rendered by the server screen. */
export function FinancePageClient({ data, forms }: { data: FinancePageData; forms: ReactNode }) {
  const pages = { jpage: data.journalPage.page, rpage: data.runPage.page, ppage: data.paymentPage.page };
  const hrefFor = (key: keyof typeof pages) => (next: number) => hrefWith(basePath, { ...pages, [key]: next === 1 ? undefined : next });
  const pendingPayments = data.payments.filter((payment) => statusDotTone(payment.status) === "wait").length;
  const unbalanced = data.journals.filter((journal) => journal.state === "UNBALANCED").length;
  return <>
    <MetricGrid items={[
      { label: "Recon exceptions", value: data.metrics.openReconItems, detail: "open", tone: data.metrics.openReconItems ? "alert" : "ok" },
      { label: "Pending payments", value: pendingPayments, detail: "on page", tone: pendingPayments ? "wait" : "ok" },
      { label: "Balanced journals", value: data.metrics.balanced, detail: data.metrics.balancedDetail, tone: unbalanced ? "alert" : "ok" },
      { label: "Player available", value: data.metrics.available, detail: data.metrics.availableDetail },
    ]} />
    <div className="flex flex-wrap items-center gap-2">
      <Track label="Finance areas">
        <PillLink size="sm" href={`${basePath}/reconciliation`}>Reconciliation</PillLink>
      </Track>
    </div>
    <RecordList title="Payments" tone={pendingPayments ? "wait" : undefined} columns={["Player", "Type", "Amount", "State"]}
      rows={needsAttentionFirst(data.payments, (payment) => payment.status).map((payment) => ({ id: payment.id, href: `${basePath}/payments/${payment.id}`, status: payment.status ?? undefined, cells: [<span key="player" className="break-all">{payment.player}</span>, <Mono key="type" className="break-all">{payment.type}</Mono>, <Mono key="amount">{payment.amount}</Mono>, <StatusBadge key="state" value={payment.status} />] }))}
      emptyTitle="No payments"
      pagination={{ ...data.paymentPage, hrefForPage: hrefFor("ppage") }} />
    <RecordList title="Reconciliation runs" tone={data.metrics.openReconItems ? "alert" : undefined} columns={["Run", "Type / window", "Difference", "State"]}
      rows={needsAttentionFirst(data.runs, (run) => run.status).map((run) => ({ id: run.id, href: `${basePath}/reconciliation/runs/${run.id}`, status: run.status ?? undefined, cells: [<Mono key="ref" className="break-all">{run.reference}</Mono>, <Mono key="window" className="text-xs">{run.window}</Mono>, <Mono key="diff">{run.difference}</Mono>, <StatusBadge key="status" value={run.status} />] }))}
      emptyTitle="No reconciliation runs"
      emptyAction={<Track><PillLink size="sm" href={`${basePath}/reconciliation`}>Reconciliation</PillLink></Track>}
      pagination={{ ...data.runPage, hrefForPage: hrefFor("rpage") }} />
    <RecordList title="Journals" tone={unbalanced ? "alert" : undefined} columns={["Transaction", "Type", "Debits / credits", "State"]}
      rows={needsAttentionFirst(data.journals, (journal) => journal.state).map((journal) => ({ id: journal.id, href: `${basePath}/journals/${journal.id}`, status: journal.state, cells: [<span key="id"><Mono className="break-all">{journal.reference}</Mono><span className="block font-mono text-xs font-normal tabular-nums text-muted-foreground">{journal.effectiveAt}</span></span>, journal.type, <Mono key="amounts">{journal.amounts}</Mono>, <StatusBadge key="status" value={journal.state} />] }))}
      emptyTitle="No journal transactions"
      emptyAction={<Track><PillLink size="sm" href="/dashboard/platform/wagers">Wagers</PillLink></Track>}
      pagination={{ ...data.journalPage, hrefForPage: hrefFor("jpage") }} />
    {forms}
  </>;
}
