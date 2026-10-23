'use client';

import { ListFilters } from "../../components/ListFilters";
import { MutationForm } from "../../components/MutationForm";
import { Mono, PillLink, StatusDot, Track } from "../../components/kit";
import { DetailGrid, EmptyState, MetricGrid, RecordList, StatusBadge, WorkflowNote } from "../../components/WorkflowUI";
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
  const state = item.expired ? 'EXPIRED' : item.status;
  return <article id={`approval-${item.id}`} className="min-w-0 overflow-hidden rounded-xl border bg-card text-card-foreground">
    <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 border-b px-4 py-3">
      <div className="min-w-0">
        <h3 className="break-words font-semibold capitalize"><StatusDot tone={item.self ? 'off' : item.expired ? 'alert' : 'wait'} />{item.title.toLowerCase()}</h3>
        <p className="mt-0.5 pl-4 text-xs text-muted-foreground">{item.requester} · {item.requestedAt}{item.self ? ' · your request' : ''}</p>
      </div>
      <StatusBadge value={state} />
    </header>
    <div className="grid min-w-0 gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
      <div className="min-w-0 space-y-3">
        <DetailGrid items={[{ label: 'Expires', value: <Mono>{item.expiresAt}</Mono> }, { label: 'Reason', value: item.reason }, { label: 'Action', value: <span className="break-all font-mono text-xs">{item.action}</span> }, { label: 'Fingerprint', value: <code className="break-all font-mono text-xs">{item.payloadHash}</code> }]} />
        {hasBody ? <div className="min-w-0"><p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Submitted body</p><pre className="mt-1 max-h-80 overflow-auto rounded-lg bg-muted p-3 font-mono text-xs">{item.body}</pre></div> : <WorkflowNote title="Body not recorded" tone="warning">Reject and ask for resubmission.</WorkflowNote>}
      </div>
      <div className="min-w-0">
    <MutationForm compact requireReview title="Decision" mutation={decideMutation} fields={[{ name: 'approvalId', label: 'Approval', type: 'hidden', defaultValue: item.id }, { name: 'payloadHash', label: 'Fingerprint', type: 'hidden', defaultValue: item.payloadHash }, { name: 'approve', label: 'Decision', type: 'select', transform: 'boolean', options: hasBody ? [{ label: 'Approve this exact body', value: 'true' }, { label: 'Reject', value: 'false' }] : [{ label: 'Reject', value: 'false' }] }, { name: 'reason', label: 'Decision reason', type: 'textarea', placeholder: 'What you reviewed and why' }]} submitLabel="Record independent decision" successMessage="Decision recorded." disabledReason={item.self ? 'Your request. Another approver must decide.' : item.expired ? 'Expired. Ask for resubmission.' : undefined} />
      </div>
    </div>
  </article>;
}

export function ApprovalsPageClient({ data }: { data: ApprovalsPageData }) {
  const pendingPages = Math.max(1, Math.ceil(data.pendingTotal / data.pageSize));
  const params = { status: data.status, page: data.historyPage, ppage: data.pendingPage };
  return <>
    <section className="space-y-3" aria-labelledby="pending-approvals">
      <h2 id="pending-approvals" className="text-sm font-semibold"><StatusDot tone={data.pendingTotal > 0 ? 'wait' : 'ok'} />Awaiting decision<span className="ml-2 font-mono text-xs font-normal tabular-nums text-muted-foreground">{data.pendingTotal}</span></h2>
      {data.pending.length === 0 ? <div className="rounded-xl border bg-card"><EmptyState title="No pending requests" action={<Track><PillLink size="sm" href="/dashboard/platform/audit">Audit log</PillLink></Track>} /></div> : data.pending.map((item) => <PendingApproval key={item.id} item={item} />)}
      {pendingPages > 1 ? <nav aria-label="Pending request pages" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card px-4 py-2.5"><Track>{data.pendingPage > 1 ? <PillLink size="sm" href={hrefWith(basePath, { ...params, ppage: data.pendingPage - 1 })}>Previous</PillLink> : <span aria-disabled="true" className="inline-flex h-8 items-center px-3 text-xs text-muted-foreground/60">Previous</span>}{data.pendingPage < pendingPages ? <PillLink size="sm" href={hrefWith(basePath, { ...params, ppage: data.pendingPage + 1 })}>Next</PillLink> : <span aria-disabled="true" className="inline-flex h-8 items-center px-3 text-xs text-muted-foreground/60">Next</span>}</Track><Mono className="text-xs text-muted-foreground">{data.pendingPage} / {pendingPages}</Mono></nav> : null}
    </section>
    <MetricGrid items={[
      { label: 'Pending', value: data.pendingTotal, tone: data.pendingTotal > 0 ? 'wait' : 'ok' },
      { label: 'Approved', value: data.approved, tone: 'ok' },
      { label: 'Rejected', value: data.rejected, tone: 'off' },
      { label: 'Self-decisions', value: data.selfDecisions, tone: data.selfDecisions > 0 ? 'alert' : 'ok' },
    ]} />
    <RecordList
      title="History"
      action={<ListFilters filters={[{ key: "status", label: "State", options: data.statuses.map((value) => ({ label: value.toLowerCase(), value })) }]} />}
      columns={['Request', 'Action', 'Actors', 'State']}
      rows={data.history.map((item) => ({ id: item.id, status: item.status ?? undefined, cells: [
        <span key="request" className="inline-block min-w-0 align-top"><span className="block font-mono font-semibold">{item.reference}</span><span className="block break-all font-mono text-xs font-normal text-muted-foreground">{item.payloadHash}</span></span>,
        <div key="action"><p className="max-w-md break-all font-mono text-xs">{item.action}</p><p className="text-xs text-muted-foreground">{item.createdAt}</p></div>,
        <div key="actors"><p>Requester {item.requester}</p><p className="text-xs text-muted-foreground">Approver {item.approver}</p>{item.applied ? <p className="text-xs text-muted-foreground">{item.applied}</p> : null}</div>,
        <span key="state" className="flex flex-wrap gap-2"><StatusBadge value={item.status} />{item.consumed ? <StatusBadge value="APPLIED" /> : item.approvedButExpired ? <StatusBadge value="EXPIRED" /> : null}</span>,
      ] }))}
      filtered={Boolean(data.status)}
      emptyTitle={data.status ? "No requests in this state" : "No approval requests"}
      emptyAction={data.status ? <Track><PillLink size="sm" href={hrefWith(basePath, { ppage: data.pendingPage })}>Show all</PillLink></Track> : undefined}
      pagination={{ page: data.historyPage, pageSize: data.pageSize, total: data.historyTotal, hrefForPage: (next) => hrefWith(basePath, { ...params, page: next }) }}
    />
  </>;
}
