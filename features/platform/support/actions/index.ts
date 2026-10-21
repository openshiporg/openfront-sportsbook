'use server';

import type { KeystoneResponse } from "@/features/dashboard/lib/keystoneClient";
import { platformRead } from "../../lib/graphql";

export type SupportCaseRecord = {
  id: string;
  subject: string | null;
  category: string | null;
  status: string | null;
  openedAt: string | null;
  slaDueAt: string | null;
  player: { id: string } | null;
};

export type SupportQueueResult = {
  cases: SupportCaseRecord[];
  total: number;
  allCases: number;
  openCases: number;
  customerVisibleEvents: number;
  /** Open cases for the update picker: newest-opened first, bounded at 100. */
  openCasePicker: { id: string; subject: string | null }[];
};

const caseStatuses = ["OPEN", "TRIAGED", "WAITING_CUSTOMER", "WAITING_OPERATOR", "RESOLVED", "CLOSED"] as const;
export type SupportCaseStatusFilter = (typeof caseStatuses)[number];

/**
 * Support queue through GraphQL: SupportCase and SupportCaseEvent are compliance
 * lists, tenant-filtered by Keystone access.
 */
export async function getSupportQueue({ page, pageSize, search, status }: { page: number; pageSize: number; search?: string; status?: SupportCaseStatusFilter }): Promise<KeystoneResponse<SupportQueueResult>> {
  const where = {
    AND: [
      status && caseStatuses.includes(status) ? { status: { equals: status } } : {},
      search ? { OR: [{ subject: { contains: search, mode: "insensitive" } }, { id: { equals: search } }] } : {},
    ],
  };
  const response = await platformRead<{ cases: SupportCaseRecord[]; total: number; allCases: number; openCases: number; customerVisibleEvents: number; openCasePicker: { id: string; subject: string | null }[] }>(`
    query SupportQueue($where: SupportCaseWhereInput!, $take: Int!, $skip: Int!) {
      cases: supportCases(where: $where, orderBy: [{ openedAt: desc }, { id: desc }], take: $take, skip: $skip) {
        id subject category status openedAt slaDueAt
        player { id }
      }
      total: supportCasesCount(where: $where)
      allCases: supportCasesCount
      openCases: supportCasesCount(where: { status: { notIn: [RESOLVED, CLOSED] } })
      customerVisibleEvents: supportCaseEventsCount(where: { visibility: { equals: CUSTOMER } })
      openCasePicker: supportCases(where: { status: { notIn: [RESOLVED, CLOSED] } }, orderBy: [{ openedAt: desc }, { id: desc }], take: 100) { id subject }
    }
  `, { where, take: pageSize, skip: (page - 1) * pageSize });
  return response;
}
