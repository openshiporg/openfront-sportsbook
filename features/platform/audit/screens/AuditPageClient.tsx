'use client';

import Link from "next/link";
import { MetricGrid, RecordList, WorkflowNote } from "../../components/WorkflowUI";
import { hrefWith } from "../../lib/paging";

export type AuditRow = { id: string; action: string; target: string; actor: string; recorded: string };

export type AuditPageData = {
  rows: AuditRow[];
  page: number;
  pageSize: number;
  total: number;
  operatorEvents: number;
  workerEvents: number;
  brokenPointers: number;
  forks: number;
};

const basePath = "/dashboard/platform/audit";

export function AuditPageClient({ data }: { data: AuditPageData }) {
  const issues = data.brokenPointers + data.forks;
  return <>
    <MetricGrid items={[
      { label: "Audit events", value: data.total, detail: `Showing ${data.rows.length} on page ${data.page}` },
      { label: "Operator events", value: data.operatorEvents, detail: "Non-worker actors" },
      { label: "Worker events", value: data.workerEvents, detail: "Durable queue processing" },
      { label: "Chain issues", value: issues, detail: `${data.brokenPointers} missing link(s) · ${data.forks} fork(s)` },
    ]} />
    <RecordList title="Audit events" description="Newest first. Open a record for its full details."
      pagination={{ page: data.page, pageSize: data.pageSize, total: data.total, hrefForPage: (next) => hrefWith(basePath, { page: next }) }}
      columns={["Action", "Target", "Actor / reason", "Recorded"]}
      rows={data.rows.map((row) => ({ id: row.id, href: `${basePath}/${row.id}`, cells: [row.action, row.target, row.actor, row.recorded] }))}
      emptyTitle="No audit events" emptyDescription="No operator actions have been recorded yet. Privileged actions such as approvals and role changes are recorded here."
      emptyAction={<Link href="/dashboard/platform/approvals" className="inline-flex rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted">Open approvals</Link>} />
    <WorkflowNote title="Chain check" tone={issues ? "warning" : "neutral"}>{issues ? `${data.brokenPointers} record(s) point to a predecessor that doesn't exist and ${data.forks} predecessor(s) have more than one successor among the ${data.rows.length} records on this page.` : "Every record on this page links to an existing predecessor, with no forks."} This check doesn&apos;t prove the database hasn&apos;t been altered.</WorkflowNote>
  </>;
}
