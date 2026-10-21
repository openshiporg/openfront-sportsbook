'use client';

import Link from "next/link";
import { ListFilters } from "../../components/ListFilters";
import { MutationForm } from "../../components/MutationForm";
import { MetricGrid, RecordList, StatusBadge } from "../../components/WorkflowUI";
import { hrefWith } from "../../lib/paging";

export type SupportCaseRow = { id: string; subject: string; reference: string; category: string; player: string; openedAt: string; slaDueAt: string; status: string | null };
export type DisputeRow = { id: string; category: string; reference: string; wager: string; resolution: string; status: string | null };
export type PickerOption = { label: string; value: string };

export type SupportPageData = {
  cases: SupportCaseRow[];
  casesTotal: number;
  allCases: number;
  openCases: number;
  customerVisibleEvents: number;
  casePage: number;
  caseStatus?: string;
  search?: string;
  disputes: DisputeRow[];
  disputesTotal: number;
  allDisputes: number;
  openDisputes: number;
  appeals: number;
  disputePage: number;
  disputeStatus?: string;
  pageSize: number;
  caseStatuses: readonly string[];
  disputeStatuses: readonly string[];
  openCaseOptions: PickerOption[];
  reviewableDisputeOptions: PickerOption[];
  proposedDisputeOptions: PickerOption[];
  proposedDisputeWithResolutionOptions: PickerOption[];
  approvalOptions: PickerOption[];
};

const basePath = "/dashboard/platform/support";
const linkClass = "inline-flex rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted";

export function SupportPageClient({ data }: { data: SupportPageData }) {
  const casesFiltered = Boolean(data.caseStatus || data.search);
  const params = { q: data.search, status: data.caseStatus, page: data.casePage, dstatus: data.disputeStatus, dpage: data.disputePage };
  const disputeHref = (changes: Record<string, string | number | undefined>) => hrefWith(basePath, { ...params, ...changes, dpage: changes.dpage ?? 1 });
  return <>
    <MetricGrid items={[
      { label: "Open support", value: data.openCases, detail: `${data.allCases} total` },
      { label: "Open disputes", value: data.openDisputes, detail: `${data.allDisputes} total` },
      { label: "Customer-visible events", value: data.customerVisibleEvents, detail: "Message evidence" },
      { label: "Appeals", value: data.appeals, detail: "Requires new review" },
    ]} />
    <div className="grid gap-4 xl:grid-cols-3">
      <MutationForm compact title="Update support case" description="Adds a customer-visible event and preserves the prior timeline." mutation={`mutation($caseId:ID!,$status:String!,$customerMessage:String!,$reason:String!){setSupportCaseStatus(caseId:$caseId,status:$status,customerMessage:$customerMessage,reason:$reason)}`} fields={[{ name: 'caseId', label: 'Support case', type: 'select', options: data.openCaseOptions, help: data.openCases > data.openCaseOptions.length ? `Newest ${data.openCaseOptions.length} of ${data.openCases} open cases. Open older cases from the queue below.` : undefined }, { name: 'status', label: 'State', type: 'select', options: ['TRIAGED', 'WAITING_CUSTOMER', 'WAITING_OPERATOR', 'RESOLVED', 'CLOSED'].map(value => ({ label: value, value })) }, { name: 'customerMessage', label: 'Customer-safe message', type: 'textarea', placeholder: 'Message the customer will see' }, { name: 'reason', label: 'Internal reason', placeholder: 'Why this is needed and what you reviewed' }]} submitLabel="Update case" successMessage="Case updated." />
      <MutationForm compact title="Propose dispute resolution" description="Any monetary adjustment is bound into an independent approval payload." mutation={`mutation($disputeId:ID!,$resolution:String!,$adjustmentMinor:String!,$reason:String!){requestDisputeResolution(disputeId:$disputeId,resolution:$resolution,adjustmentMinor:$adjustmentMinor,reason:$reason)}`} fields={[{ name: 'disputeId', label: 'Dispute', type: 'select', options: data.reviewableDisputeOptions }, { name: 'resolution', label: 'Customer resolution', type: 'textarea', placeholder: 'Resolution the customer will see' }, { name: 'adjustmentMinor', label: "Signed adjustment (minor units of the disputed wager's currency)", defaultValue: '0' }, { name: 'reason', label: 'Approval reason', placeholder: 'Why this is needed and what you reviewed' }]} submitLabel="Request approval" successMessage="Exact dispute resolution approval requested." />
      <MutationForm compact title="Apply approved resolution" description="Posts a balanced adjustment in the disputed wager's own currency and wallet when non-zero (disputes without a wager need review for money) and closes the evidence chain." mutation={`mutation($disputeId:ID!,$resolution:String!,$adjustmentMinor:String!,$approvalId:ID!){applyDisputeResolution(disputeId:$disputeId,resolution:$resolution,adjustmentMinor:$adjustmentMinor,approvalId:$approvalId)}`} fields={[{ name: 'disputeId', label: 'Proposed dispute', type: 'select', options: data.proposedDisputeOptions }, { name: 'resolution', label: 'Exact approved resolution', type: 'textarea' }, { name: 'adjustmentMinor', label: 'Exact signed adjustment', defaultValue: '0' }, { name: 'approvalId', label: 'Approved request', type: 'select', options: data.approvalOptions }]} submitLabel="Resolve dispute" successMessage="Resolution and any compensating journal were persisted." />
    </div>
    <MutationForm compact requireReview title="Withdraw proposal for revision" description="Use when the approval was rejected, has expired, or the pending proposal needs changes. The dispute returns to investigation so a revised proposal can be requested and independently approved again; the old decision is kept." mutation={`mutation($disputeId:ID!,$reason:String!){withdrawDisputeProposal(disputeId:$disputeId,reason:$reason)}`} fields={[{ name: 'disputeId', label: 'Proposed dispute', type: 'select', options: data.proposedDisputeWithResolutionOptions }, { name: 'reason', label: 'Why the proposal is being revised', type: 'textarea', placeholder: 'Approver feedback or new evidence' }]} submitLabel="Withdraw and revise" successMessage="Proposal withdrawn. Request a revised resolution." />
    <RecordList
      title="Support queue"
      description="SLA, owner and linked regulated records. Search by subject or exact case ID."
      action={<ListFilters searchLabel="Search support cases" searchPlaceholder="Subject or case ID" filters={[{ key: "status", label: "State", options: data.caseStatuses.map((value) => ({ label: value.replaceAll("_", " ").toLowerCase(), value })) }]} />}
      columns={['Case', 'Player', 'Opened / SLA', 'State']}
      rows={data.cases.map((item) => ({ id: item.id, href: `${basePath}/${item.id}`, cells: [<div key="case"><p className="font-semibold">{item.subject}</p><p className="text-xs text-muted-foreground">{item.reference} · {item.category}</p></div>, item.player, <div key="time"><p>{item.openedAt}</p><p className="text-xs text-muted-foreground">Due {item.slaDueAt}</p></div>, <StatusBadge key="state" value={item.status} />] }))}
      filtered={casesFiltered}
      emptyTitle={casesFiltered ? "No matching support cases" : "No support cases"}
      emptyDescription={casesFiltered ? "No case matches this search or state." : "Customer-created disputes automatically open linked support cases."}
      emptyAction={casesFiltered ? <Link href={hrefWith(basePath, { dstatus: data.disputeStatus, dpage: data.disputePage })} className={linkClass}>Clear case search and filters</Link> : <Link href="/dashboard/platform/customers" className={linkClass}>Review customers</Link>}
      pagination={{ page: data.casePage, pageSize: data.pageSize, total: data.casesTotal, hrefForPage: (next) => hrefWith(basePath, { ...params, page: next }) }}
    />
    <RecordList
      title="Dispute register"
      description="Resolution text and monetary effect require an exact payload match."
      action={<nav aria-label="Filter disputes by state" className="flex flex-wrap gap-1">{[undefined, ...data.disputeStatuses].map((value) => <Link key={value ?? "all"} href={disputeHref({ dstatus: value })} aria-current={value === data.disputeStatus ? "page" : undefined} className={`rounded-md border px-2 py-1 text-xs ${value === data.disputeStatus ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>{value ? value.replaceAll("_", " ").toLowerCase() : "all"}</Link>)}</nav>}
      columns={['Dispute', 'Wager', 'Resolution', 'State']}
      rows={data.disputes.map((item) => ({ id: item.id, cells: [<div key="id"><p className="font-semibold">{item.category}</p><p className="text-xs text-muted-foreground">{item.reference}</p></div>, item.wager, item.resolution, <StatusBadge key="state" value={item.status} />] }))}
      filtered={Boolean(data.disputeStatus)}
      emptyTitle={data.disputeStatus ? "No disputes in this state" : "No disputes"}
      emptyDescription={data.disputeStatus ? "No dispute currently has this state." : "Customer and operator investigations will appear here."}
      emptyAction={data.disputeStatus ? <Link href={disputeHref({ dstatus: undefined })} className={linkClass}>Show all disputes</Link> : <Link href="/dashboard/platform/wagers" className={linkClass}>Review wagers</Link>}
      pagination={{ page: data.disputePage, pageSize: data.pageSize, total: data.disputesTotal, hrefForPage: (next) => disputeHref({ dpage: next }) }}
    />
  </>;
}
