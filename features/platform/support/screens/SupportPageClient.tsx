'use client';

import { ListFilters } from "../../components/ListFilters";
import { MutationForm } from "../../components/MutationForm";
import { Mono, PillLink, Track } from "../../components/kit";
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
const label = (value: string) => value.replaceAll("_", " ").toLowerCase();
// Cases waiting on the operator lead the page; the rest keep their server order.
const caseRank: Record<string, number> = { WAITING_OPERATOR: 0, OPEN: 1, TRIAGED: 2, WAITING_CUSTOMER: 3 };
const rank = (status: string | null) => caseRank[status ?? ""] ?? 9;

export function SupportPageClient({ data }: { data: SupportPageData }) {
  const casesFiltered = Boolean(data.caseStatus || data.search);
  const params = { q: data.search, status: data.caseStatus, page: data.casePage, dstatus: data.disputeStatus, dpage: data.disputePage };
  const disputeHref = (changes: Record<string, string | number | undefined>) => hrefWith(basePath, { ...params, ...changes, dpage: changes.dpage ?? 1 });
  const caseHref = (status?: string) => hrefWith(basePath, { q: data.search, status, dstatus: data.disputeStatus, dpage: data.disputePage });
  const cases = data.cases.map((item, index) => ({ item, index })).sort((a, b) => rank(a.item.status) - rank(b.item.status) || a.index - b.index).map(({ item }) => item);
  return <>
    <MetricGrid items={[
      { label: "Open cases", value: data.openCases, detail: `${data.allCases} total`, tone: data.openCases ? "wait" : "ok" },
      { label: "Open disputes", value: data.openDisputes, detail: `${data.allDisputes} total`, tone: data.openDisputes ? "wait" : "ok" },
      { label: "Appeals", value: data.appeals, tone: data.appeals ? "alert" : undefined },
      { label: "Customer messages", value: data.customerVisibleEvents },
    ]} />

    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="min-w-0 flex-1"><ListFilters searchLabel="Search support cases" searchPlaceholder="Subject or case ID" /></div>
      <Track label="Case state">
        <PillLink size="sm" variant="flat" href={caseHref()} current={!data.caseStatus}>All</PillLink>
        {data.caseStatuses.map((value) => <PillLink key={value} size="sm" variant="flat" href={caseHref(value)} current={data.caseStatus === value}>{value === "WAITING_OPERATOR" ? "waiting on us" : label(value)}</PillLink>)}
      </Track>
    </div>

    <RecordList
      title={casesFiltered ? "Matching cases" : "Support queue"}
      tone={data.openCases ? "wait" : undefined}
      columns={["Case", "Player", "Opened / SLA", "State"]}
      rows={cases.map((item) => ({
        id: item.id,
        href: `${basePath}/${item.id}`,
        status: item.status ?? undefined,
        cells: [
          <span key="case"><span className="font-semibold">{item.subject}</span><span className="block break-all font-mono text-xs font-normal text-muted-foreground">{item.reference} · {item.category}</span></span>,
          <Mono key="player" className="break-all">{item.player}</Mono>,
          <span key="time" className="font-mono text-xs tabular-nums"><span className="block">{item.openedAt}</span><span className="block text-muted-foreground">due {item.slaDueAt}</span></span>,
          <StatusBadge key="state" value={item.status} />,
        ],
      }))}
      filtered={casesFiltered}
      emptyTitle={casesFiltered ? "No matching cases" : "No support cases"}
      emptyAction={casesFiltered ? <Track><PillLink size="sm" href={hrefWith(basePath, { dstatus: data.disputeStatus, dpage: data.disputePage })}>Clear filters</PillLink></Track> : <Track><PillLink size="sm" href="/dashboard/platform/customers">Customers</PillLink></Track>}
      pagination={{ page: data.casePage, pageSize: data.pageSize, total: data.casesTotal, hrefForPage: (next) => hrefWith(basePath, { ...params, page: next }) }}
    />

    <div className="grid gap-4 xl:grid-cols-3">
      <MutationForm compact title="Update support case" mutation={`mutation($caseId:ID!,$status:String!,$customerMessage:String!,$reason:String!){setSupportCaseStatus(caseId:$caseId,status:$status,customerMessage:$customerMessage,reason:$reason)}`} fields={[{ name: 'caseId', label: 'Support case', type: 'select', options: data.openCaseOptions, help: data.openCases > data.openCaseOptions.length ? `Newest ${data.openCaseOptions.length} of ${data.openCases} open` : undefined }, { name: 'status', label: 'State', type: 'select', options: ['TRIAGED', 'WAITING_CUSTOMER', 'WAITING_OPERATOR', 'RESOLVED', 'CLOSED'].map(value => ({ label: value, value })) }, { name: 'customerMessage', label: 'Customer-safe message', type: 'textarea' }, { name: 'reason', label: 'Internal reason' }]} submitLabel="Update case" successMessage="Case updated." />
      <MutationForm compact title="Propose dispute resolution" mutation={`mutation($disputeId:ID!,$resolution:String!,$adjustmentMinor:String!,$reason:String!){requestDisputeResolution(disputeId:$disputeId,resolution:$resolution,adjustmentMinor:$adjustmentMinor,reason:$reason)}`} fields={[{ name: 'disputeId', label: 'Dispute', type: 'select', options: data.reviewableDisputeOptions }, { name: 'resolution', label: 'Customer resolution', type: 'textarea' }, { name: 'adjustmentMinor', label: "Signed adjustment (minor units, wager currency)", defaultValue: '0' }, { name: 'reason', label: 'Approval reason' }]} submitLabel="Request approval" successMessage="Exact dispute resolution approval requested." />
      <MutationForm compact title="Apply approved resolution" mutation={`mutation($disputeId:ID!,$resolution:String!,$adjustmentMinor:String!,$approvalId:ID!){applyDisputeResolution(disputeId:$disputeId,resolution:$resolution,adjustmentMinor:$adjustmentMinor,approvalId:$approvalId)}`} fields={[{ name: 'disputeId', label: 'Proposed dispute', type: 'select', options: data.proposedDisputeOptions }, { name: 'resolution', label: 'Exact approved resolution', type: 'textarea' }, { name: 'adjustmentMinor', label: 'Exact signed adjustment', defaultValue: '0' }, { name: 'approvalId', label: 'Approved request', type: 'select', options: data.approvalOptions }]} submitLabel="Resolve dispute" successMessage="Resolution and any compensating journal were persisted." />
    </div>

    <RecordList
      title="Disputes"
      tone={data.openDisputes ? "wait" : undefined}
      action={<Track label="Dispute state">{[undefined, ...data.disputeStatuses].map((value) => <PillLink key={value ?? "all"} size="sm" variant="flat" href={disputeHref({ dstatus: value })} current={value === data.disputeStatus}>{value ? label(value) : "all"}</PillLink>)}</Track>}
      columns={["Dispute", "Wager", "Resolution", "State"]}
      rows={data.disputes.map((item) => ({ id: item.id, status: item.status ?? undefined, cells: [<span key="id"><span className="font-semibold">{item.category}</span><span className="block break-all font-mono text-xs font-normal text-muted-foreground">{item.reference}</span></span>, <Mono key="wager" className="break-all">{item.wager}</Mono>, item.resolution, <StatusBadge key="state" value={item.status} />] }))}
      filtered={Boolean(data.disputeStatus)}
      emptyTitle={data.disputeStatus ? "No disputes in this state" : "No disputes"}
      emptyAction={data.disputeStatus ? <Track><PillLink size="sm" href={disputeHref({ dstatus: undefined })}>All disputes</PillLink></Track> : <Track><PillLink size="sm" href="/dashboard/platform/wagers">Wagers</PillLink></Track>}
      pagination={{ page: data.disputePage, pageSize: data.pageSize, total: data.disputesTotal, hrefForPage: (next) => disputeHref({ dpage: next }) }}
    />

    <MutationForm compact requireReview title="Withdraw proposal for revision" mutation={`mutation($disputeId:ID!,$reason:String!){withdrawDisputeProposal(disputeId:$disputeId,reason:$reason)}`} fields={[{ name: 'disputeId', label: 'Proposed dispute', type: 'select', options: data.proposedDisputeWithResolutionOptions }, { name: 'reason', label: 'Revision reason', type: 'textarea' }]} submitLabel="Withdraw and revise" successMessage="Proposal withdrawn. Request a revised resolution." />
  </>;
}
