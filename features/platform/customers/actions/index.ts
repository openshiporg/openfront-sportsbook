'use server';

import type { KeystoneResponse } from "@/features/dashboard/lib/keystoneClient";
import { perIdSelections, perIdValue, platformRead } from "../../lib/graphql";

export type CustomerListRecord = {
  id: string;
  subject: string | null;
  status: string | null;
  kycStatus: string | null;
  riskBand: string | null;
  createdAt: string | null;
  verificationCases: number;
  amlCases: number;
  activeRestrictions: number;
};

export type CustomerListResult = {
  players: CustomerListRecord[];
  total: number;
  pendingKyc: number;
  openAml: number;
  restricted: number;
};

const kycStatuses = ["REQUIRED", "PENDING", "APPROVED", "REJECTED"] as const;
export type CustomerKycFilter = (typeof kycStatuses)[number];

/**
 * Customer review queue through GraphQL: Player, VerificationCase, AMLCase and
 * AccountRestriction are compliance lists, tenant-filtered by Keystone access.
 */
export async function getCustomers({ page, pageSize, search, kycStatus }: { page: number; pageSize: number; search?: string; kycStatus?: CustomerKycFilter }): Promise<KeystoneResponse<CustomerListResult>> {
  const where = {
    AND: [
      search ? { OR: [{ subject: { contains: search, mode: "insensitive" } }, { id: { equals: search } }] } : {},
      kycStatus && kycStatuses.includes(kycStatus) ? { kycStatus: { equals: kycStatus } } : {},
    ],
  };
  const list = await platformRead<{ players: Omit<CustomerListRecord, "verificationCases" | "amlCases" | "activeRestrictions">[]; playersCount: number; pendingKyc: number; openAml: number; restricted: number }>(`
    query CustomerQueue($where: PlayerWhereInput!, $take: Int!, $skip: Int!) {
      players(where: $where, orderBy: [{ createdAt: desc }, { id: desc }], take: $take, skip: $skip) { id subject status kycStatus riskBand createdAt }
      playersCount(where: $where)
      pendingKyc: verificationCasesCount(where: { status: { equals: PENDING } })
      openAml: aMLCasesCount(where: { status: { in: [OPEN, REVIEW] } })
      restricted: accountRestrictionsCount(where: { status: { equals: ACTIVE } })
    }
  `, { where, take: pageSize, skip: (page - 1) * pageSize });
  if (!list.success) return list;
  const ids = list.data.players.map((player) => player.id);
  const kyc = perIdSelections(ids, "k", (id) => `verificationCasesCount(where: { player: { id: { equals: ${id} } } })`);
  const aml = perIdSelections(ids, "a", (id) => `aMLCasesCount(where: { player: { id: { equals: ${id} } } })`);
  const restriction = perIdSelections(ids, "r", (id) => `accountRestrictionsCount(where: { player: { id: { equals: ${id} } }, status: { equals: ACTIVE } })`);
  const counts = ids.length ? await platformRead<Record<string, number>>(`
    query CustomerQueueCounts(${kyc.declarations} ${aml.declarations} ${restriction.declarations}) {
      ${kyc.selections}
      ${aml.selections}
      ${restriction.selections}
    }
  `, { ...kyc.variables, ...aml.variables, ...restriction.variables }) : null;
  if (counts && !counts.success) return counts;
  const countData = counts?.success ? counts.data : {};
  return {
    success: true,
    data: {
      players: list.data.players.map((player, index) => ({
        ...player,
        verificationCases: perIdValue<number>(countData, "k", index) ?? 0,
        amlCases: perIdValue<number>(countData, "a", index) ?? 0,
        activeRestrictions: perIdValue<number>(countData, "r", index) ?? 0,
      })),
      total: list.data.playersCount,
      pendingKyc: list.data.pendingKyc,
      openAml: list.data.openAml,
      restricted: list.data.restricted,
    },
  };
}
