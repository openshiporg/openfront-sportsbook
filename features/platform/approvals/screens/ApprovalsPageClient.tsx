'use client';

import Link from "next/link";
import { ListFilters } from "../../components/ListFilters";
import { MutationForm } from "../../components/MutationForm";
import { DetailGrid, MetricGrid, RecordList, StatusBadge, WorkflowNote } from "../../components/WorkflowUI";
import { hrefWith } from "../../lib/paging";

export type PendingApprovalItem = {
  id: string;
  title: string;
  action: string;
  status: string;
  expired: boolean;
  requester: string;
  requestedAt: string;
  expiresAt: string;
  reason: string;
  payloadHash: string;
  /** Exact submitted body as formatted JSON, or null when it was never recorded. */
  body: string | null;
  self: boolean;
};

export type ApprovalHistoryRow = {
  id: string;
  reference: string;
  payloadHash: string;
  action: string;
  createdAt: string;
  requester: string;
  approver: string;
  applied: string | null;
  status: string | null;
  consumed: boolean;
  approvedButExpired: boolean;
};

export type ApprovalsPageData = {
  pending: PendingApprovalItem[];
  pendingTotal: number;
  pendingPage: number;
  history: ApprovalHistoryRow[];
  historyTotal: number;
  historyPage: number;
  status?: string;
  pageSize: number;
  approved: number;
  rejected: number;
  selfDecisions: number;
  statuses: readonly string[];
};

const basePath = "/dashboard/platform/approvals";
const decideMutation = `mutation($approvalId:ID!,$approve:Boolean!,$reason:String!,$payloadHash:String){decideSensitiveApproval(approvalId:$approvalId,approve:$approve,reason:$reason,payloadHash:$payloadHash)}`;

/** Immutable review of one pending request: who asked, what effect, until when, and the exact submitted body. */
function PendingApproval({ item }: { item: PendingApprovalItem }) {
  const hasBody = item.body !== null;
  return <article id={`approval-${item.id}`} className="space-y-3 rounded-xl border bg-card p-4 shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="break-all font-semibold">{item.title}</h3><StatusBadge value={item.expired ? 'EXPIRED' : item.status} /></div>
    <DetailGrid items={[{ label: 'Requested by', value: item.requester }, { label: 'Requested', value: item.requestedAt }, { label: 'Expires', value: item.expiresAt }, { label: 'Reason', value: item.reason }, { label: 'Action', value: <span className="break-all">{item.action}</span> }, { label: 'Body fingerprint', value: <code className="break-all text-xs">{item.payloadHash}</code> }]} />
    {hasBody ? <div><p className="text-xs font-medium text-muted-foreground">Requested effect (exact submitted body)</p><pre className="mt-1 max-h-80 overflow-auto rounded-md bg-muted p-3 text-xs">{item.body}</pre></div> : <WorkflowNote title="Body not recorded" tone="warning">This request was created before reviewed bodies were stored, so its effect can’t be shown here. Reject it and ask the requester to submit it again.</WorkflowNote>}
    <MutationForm compact requireReview title="Record decision" description="Approve only if every field above is what you independently verified." mutation={decideMutation} fields={[{ name: 'approvalId', label: 'Approval', type: 'hidden', defaultValue: item.id }, { name: 'payloadHash', label: 'Fingerprint', type: 'hidden', defaultValue: item.payloadHash }, { name: 'approve', label: 'Decision', type: 'select', transform: 'boolean', options: hasBody ? [{ label: 'Approve this exact body', value: 'true' }, { label: 'Reject', value: 'false' }] : [{ label: 'Reject', value: 'false' }] }, { name: 'reason', label: 'Decision reason', type: 'textarea', placeholder: 'What you reviewed and why' }]} submitLabel="Record independent decision" successMessage="Decision recorded." disabledReason={item.self ? 'You requested this. Another approver must decide it.' : item.expired ? 'This request has expired. Ask the requester to submit it again.' : undefined} />
  </article>;
}

export function ApprovalsPageClient({ data }: { data: ApprovalsPageData }) {
  const pendingPages = Math.max(1, Math.ceil(data.pendingTotal / data.pageSize));
  const params = { status: data.status, page: data.historyPage, ppage: data.pendingPage };
  return <>
    <MetricGrid items={[
      { label: 'Pending', value: data.pendingTotal, detail: 'Awaiting another actor' },
      { label: 'Approved', value: data.approved, detail: 'Payload-bound' },
      { label: 'Rejected', value: data.rejected, detail: 'Retained evidence' },
      { label: 'Self-decisions', value: data.selfDecisions, detail: 'Must remain zero' },
    ]} />
    <section className="space-y-4" aria-labelledby="pending-approvals">
      <div><h2 id="pending-approvals" className="font-semibold">Pending requests</h2><p className="mt-1 text-sm text-muted-foreground">Each request shows the exact body that was submitted. Your decision is bound to this body’s fingerprint; if the request changed, the decision is refused.</p></div>
      {data.pending.length === 0 ? <WorkflowNote title="Nothing to review">There are no pending requests. <Link href="/dashboard/platform/audit" className="underline underline-offset-2">Review recent audit activity</Link>.</WorkflowNote> : data.pending.map((item) => <PendingApproval key={item.id} item={item} />)}
      {pendingPages > 1 ? <nav aria-label="Pending request pages" className="flex items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3 text-sm"><p className="text-muted-foreground">Page {data.pendingPage} of {pendingPages} · {data.pendingTotal} pending</p><div className="flex gap-2">{data.pendingPage > 1 ? <Link href={hrefWith(basePath, { ...params, ppage: data.pendingPage - 1 })} className="rounded-md border px-3 py-1.5 hover:bg-muted">Previous</Link> : null}{data.pendingPage < pendingPages ? <Link href={hrefWith(basePath, { ...params, ppage: data.pendingPage + 1 })} className="rounded-md border px-3 py-1.5 hover:bg-muted">Next</Link> : null}</div></nav> : null}
    </section>
    <RecordList
      title="Approval history"
      description="Payload hashes—not mutable form values—bind subsequent apply commands."
      action={<ListFilters filters={[{ key: "status", label: "State", options: data.statuses.map((value) => ({ label: value.toLowerCase(), value })) }]} />}
      columns={['Request', 'Action', 'Actors', 'State']}
      rows={data.history.map((item) => ({ id: item.id, cells: [
        <div key="request"><p className="font-semibold">{item.reference}</p><p className="break-all text-xs text-muted-foreground">{item.payloadHash}</p></div>,
        <div key="action"><p className="max-w-md break-all">{item.action}</p><p className="text-xs text-muted-foreground">{item.createdAt}</p></div>,
        <div key="actors"><p>Requester {item.requester}</p><p className="text-xs text-muted-foreground">Approver {item.approver}</p>{item.applied ? <p className="text-xs text-muted-foreground">{item.applied}</p> : null}</div>,
        <span key="state" className="flex flex-wrap gap-2"><StatusBadge value={item.status} />{item.consumed ? <StatusBadge value="APPLIED" /> : item.approvedButExpired ? <StatusBadge value="EXPIRED" /> : null}</span>,
      ] }))}
      filtered={Boolean(data.status)}
      emptyTitle={data.status ? "No requests in this state" : "No approval requests"}
      emptyDescription={data.status ? "No approval request currently has this state." : "Requests from other operators will appear here."}
      emptyAction={data.status ? <Link href={hrefWith(basePath, { ppage: data.pendingPage })} className="inline-flex rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted">Show all requests</Link> : undefined}
      pagination={{ page: data.historyPage, pageSize: data.pageSize, total: data.historyTotal, hrefForPage: (next) => hrefWith(basePath, { ...params, page: next }) }}
    />
  </>;
}
