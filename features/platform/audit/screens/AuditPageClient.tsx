'use client';

import { MetricGrid, RecordList, WorkflowNote } from "../../components/WorkflowUI";
import { Mono, PillLink, StatusDot, Track, type Tone } from "../../components/kit";
import { hrefWith } from "../../lib/paging";

export type AuditRow = { id: string; action: string; target: string; actor: string; recorded: string };

export type AuditAnchorRow = { id: string; status: string; chainHead: string; eventCount: number | null; anchored: string; externalReference: string };

export type AuditAnchorData = { rows: AuditAnchorRow[]; total: number; latestAnchoredCount: number | null; latestAnchoredAt: string | null; sinceLastAnchor: number | null };

export type AuditPageData = {
  rows: AuditRow[];
  page: number;
  pageSize: number;
  total: number;
  operatorEvents: number;
  workerEvents: number;
  brokenPointers: number;
  forks: number;
  /** Null when the anchor read failed. */
  anchors: AuditAnchorData | null;
};

const anchorTone: Record<string, Tone> = { ANCHORED: "ok", PENDING: "wait", FAILED: "alert" };
// RecordList derives the row dot from a status value; ANCHORED maps to one with the same tone.
const anchorDotStatus: Record<string, string> = { ANCHORED: "CONFIRMED", PENDING: "PENDING", FAILED: "FAILED" };

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
      { label: "Audit events", value: data.total, detail: !data.anchors ? "anchors unavailable" : data.anchors.sinceLastAnchor === null ? "never anchored" : `${data.anchors.sinceLastAnchor} events since last anchor`, tone: data.anchors?.sinceLastAnchor ? "wait" : undefined },
    ]} />
    <RecordList title="Latest events"
      tone={issues ? "alert" : undefined}
      pagination={{ page: data.page, pageSize: data.pageSize, total: data.total, hrefForPage: (next) => hrefWith(basePath, { page: next }) }}
      columns={["Action", "Target", "Actor · reason", "Recorded"]}
      rows={data.rows.map((row) => ({ id: row.id, href: `${basePath}/${row.id}`, cells: [<span key="action" className="break-words">{row.action}</span>, <span key="target" className="break-words font-mono text-xs">{row.target}</span>, <span key="actor" className="break-words">{row.actor}</span>, <Mono key="recorded" className="text-xs">{row.recorded}</Mono>] }))}
      emptyTitle="No audit events"
      emptyAction={<Track><PillLink size="sm" href="/dashboard/platform/approvals">Open approvals</PillLink></Track>} />
    {data.anchors ? <RecordList title="Anchors"
      tone={data.anchors.rows.some((row) => row.status === "FAILED") ? "alert" : undefined}
      description={[data.anchors.latestAnchoredAt ? `Last anchored ${data.anchors.latestAnchoredAt} · ${data.anchors.latestAnchoredCount ?? "—"} of ${data.total} events` : "", data.anchors.total > data.anchors.rows.length ? `latest ${data.anchors.rows.length} of ${data.anchors.total}` : ""].filter(Boolean).join(" · ") || undefined}
      columns={["Chain head", "Events", "Anchored", "External reference"]}
      rows={data.anchors.rows.map((row) => ({ id: row.id, status: anchorDotStatus[row.status] ?? "UNKNOWN", cells: [<span key="head"><Mono className="break-all">{row.chainHead}</Mono><span className="mt-1 block text-xs font-normal text-foreground"><StatusDot tone={anchorTone[row.status] ?? "off"} className="mr-1.5 size-1.5 align-middle" />{row.status.toLowerCase()}</span></span>, <Mono key="count">{row.eventCount ?? "—"}</Mono>, <Mono key="anchored" className="text-xs">{row.anchored}</Mono>, <span key="ref" className="break-all font-mono text-xs">{row.externalReference}</span>] }))}
      emptyTitle="No anchors" /> : <WorkflowNote title="Anchors could not be read" tone="warning" />}
  </>;
}
