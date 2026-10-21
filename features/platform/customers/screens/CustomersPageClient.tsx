'use client';

import Link from "next/link";
import { ListFilters } from "../../components/ListFilters";
import { MetricGrid, RecordList, StatusBadge } from "../../components/WorkflowUI";
import { hrefWith } from "../../lib/paging";

export type CustomerRow = {
  id: string;
  subject: string;
  reference: string;
  createdAt: string;
  kycStatus: string | null;
  riskBand: string;
  verificationCases: number;
  amlCases: number;
  status: string | null;
  restricted: boolean;
};

export type CustomersPageData = {
  rows: CustomerRow[];
  total: number;
  pendingKyc: number;
  openAml: number;
  restricted: number;
  page: number;
  pageSize: number;
  search?: string;
  kycStatus?: string;
};

const basePath = "/dashboard/platform/customers";
const kycOptions = ["REQUIRED", "PENDING", "APPROVED", "REJECTED"].map((value) => ({ label: value.toLowerCase(), value }));

export function CustomersPageClient({ data }: { data: CustomersPageData }) {
  const filtered = Boolean(data.search || data.kycStatus);
  return <>
    <MetricGrid items={[
      { label: filtered ? "Matching players" : "Players", value: data.total, detail: `Showing ${data.rows.length} on page ${data.page}` },
      { label: "KYC pending", value: data.pendingKyc, detail: "Verification cases" },
      { label: "AML open", value: data.openAml, detail: "Open or in review" },
      { label: "Restrictions", value: data.restricted, detail: "Stored ACTIVE; enforced by acceptance regardless of dates" },
    ]} />
    <RecordList
      title="Customer review queue"
      description="Player references, verification status and AML status. Search by player reference or exact ID."
      action={<ListFilters searchLabel="Search players" searchPlaceholder="Player reference or ID" filters={[{ key: "kyc", label: "KYC", options: kycOptions }]} />}
      columns={["Customer", "KYC", "Risk / cases", "State"]}
      rows={data.rows.map((player) => ({
        id: player.id,
        href: `${basePath}/${player.id}`,
        cells: [
          <span key="subject">{player.subject}<span className="block font-mono text-xs text-muted-foreground">{player.reference} · {player.createdAt}</span></span>,
          <StatusBadge key="kyc" value={player.kycStatus} />,
          `${player.riskBand} · ${player.verificationCases} KYC · ${player.amlCases} AML`,
          <span key="state" className="flex flex-wrap gap-2"><StatusBadge value={player.status} />{player.restricted ? <StatusBadge value="RESTRICTED" /> : null}</span>,
        ],
      }))}
      filtered={filtered}
      emptyTitle={filtered ? "No matching customers" : "No customers"}
      emptyDescription={filtered ? "No player matches this search or KYC filter." : "Players appear here after they register."}
      emptyAction={filtered ? <Link href={basePath} className="inline-flex rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted">Clear search and filters</Link> : <Link href="/dashboard/platform/compliance" className="inline-flex rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted">Review compliance setup</Link>}
      pagination={{ page: data.page, pageSize: data.pageSize, total: data.total, hrefForPage: (next) => hrefWith(basePath, { q: data.search, kyc: data.kycStatus, page: next }) }}
    />
  </>;
}
