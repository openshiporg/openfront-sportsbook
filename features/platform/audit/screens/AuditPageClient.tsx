'use client';

import { MetricGrid, RecordList, WorkflowNote } from "../../components/WorkflowUI";
import { Mono, PillLink, Track } from "../../components/kit";
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
    {issues
      ? <WorkflowNote title="Chain gap found" tone="warning"><Mono>{`${data.brokenPointers} missing links · ${data.forks} forks · ${data.rows.length} records checked`}</Mono></WorkflowNote>
      : <WorkflowNote title="Chain intact on this page"><Mono>{`${data.rows.length} records checked`}</Mono></WorkflowNote>}
    <MetricGrid items={[
      { label: "Chain issues", value: issues, detail: `${data.brokenPointers} missing · ${data.forks} forks`, tone: issues ? "alert" : "ok" },
      { label: "Operator events", value: data.operatorEvents },
      { label: "Worker events", value: data.workerEvents },
      { label: "Audit events", value: data.total },
    ]} />
    <RecordList title="Latest events"
      tone={issues ? "alert" : undefined}
      pagination={{ page: data.page, pageSize: data.pageSize, total: data.total, hrefForPage: (next) => hrefWith(basePath, { page: next }) }}
      columns={["Action", "Target", "Actor · reason", "Recorded"]}
      rows={data.rows.map((row) => ({ id: row.id, href: `${basePath}/${row.id}`, cells: [<span key="action" className="break-words">{row.action}</span>, <span key="target" className="break-words font-mono text-xs">{row.target}</span>, <span key="actor" className="break-words">{row.actor}</span>, <Mono key="recorded" className="text-xs">{row.recorded}</Mono>] }))}
      emptyTitle="No audit events"
      emptyAction={<Track><PillLink size="sm" href="/dashboard/platform/approvals">Open approvals</PillLink></Track>} />
  </>;
}
