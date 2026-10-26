'use client';

import { ListFilters } from "../../components/ListFilters";
import { Mono, PillLink, Track } from "../../components/kit";
import { RecordList, StatusBadge } from "../../components/WorkflowUI";
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
const kycValues = ["PENDING", "REQUIRED", "REJECTED", "APPROVED"] as const;

export function CustomersPageClient({ data }: { data: CustomersPageData }) {
  const filtered = Boolean(data.search || data.kycStatus);
  return <>
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="min-w-0 flex-1"><ListFilters searchLabel="Search players" searchPlaceholder="Player reference or ID" /></div>
      <Track label="KYC">
        <PillLink size="sm" variant="flat" href={hrefWith(basePath, { q: data.search })} current={!data.kycStatus}>All</PillLink>
        {kycValues.map((value) => <PillLink key={value} size="sm" variant="flat" href={hrefWith(basePath, { q: data.search, kyc: value })} current={data.kycStatus === value}>
          {value.toLowerCase()}{value === "PENDING" ? <Mono className="text-muted-foreground">{data.pendingKyc}</Mono> : null}
        </PillLink>)}
      </Track>
    </div>
    <RecordList
      title={filtered ? "Matching players" : "Players"}
      tone={data.restricted ? "wait" : undefined}
      columns={["Player", "KYC", "Account", "Risk / cases"]}
      rows={data.rows.map((player) => ({
        id: player.id,
        href: `${basePath}/${player.id}`,
        status: player.restricted ? "RESTRICTED" : player.status ?? undefined,
        cells: [
          <span key="subject" className="break-all">{player.subject}<span className="block tabular-nums text-xs font-normal text-muted-foreground">{player.reference} · {player.createdAt}</span></span>,
          <StatusBadge key="kyc" value={player.kycStatus} />,
          <span key="state" className="flex flex-wrap gap-x-3 gap-y-1"><StatusBadge value={player.status} />{player.restricted ? <StatusBadge value="RESTRICTED" /> : null}</span>,
          <span key="risk" className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 md:justify-start"><StatusBadge value={player.riskBand} /><Mono className="text-xs">{player.verificationCases} KYC · {player.amlCases} AML</Mono></span>,
        ],
      }))}
      filtered={filtered}
      emptyTitle={filtered ? "No matching players" : "No players"}
      emptyAction={filtered ? <Track><PillLink size="sm" href={basePath}>Clear filters</PillLink></Track> : <Track><PillLink size="sm" href="/dashboard/platform/compliance">Compliance</PillLink></Track>}
      pagination={{ page: data.page, pageSize: data.pageSize, total: data.total, hrefForPage: (next) => hrefWith(basePath, { q: data.search, kyc: data.kycStatus, page: next }) }}
    />
  </>;
}
