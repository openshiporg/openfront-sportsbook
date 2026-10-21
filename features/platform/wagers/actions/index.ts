'use server';

import type { KeystoneResponse } from "@/features/dashboard/lib/keystoneClient";
import { perIdSelections, perIdValue, platformRead } from "../../lib/graphql";

export type WagerListRecord = {
  id: string;
  /** Null when the operator's role can't read the Player list (compliance). */
  player: { id: string; subject: string | null } | null;
  stakeMinor: string | null;
  potentialReturnMinor: string | null;
  currency: string | null;
  status: string | null;
  createdAt: string | null;
  hasAcceptedDecision: boolean;
  disputes: number;
};

export type WagerListResult = {
  wagers: WagerListRecord[];
  total: number;
  accepted: number;
  rejected: number;
  openDisputes: number;
};

const wagerStatuses = ["PENDING", "DELAYED", "ACCEPTED", "REJECTED", "OPEN", "PARTIALLY_CASHED_OUT", "CASHED_OUT", "GRADED", "SETTLED", "VOID"] as const;
export type WagerStatusFilter = (typeof wagerStatuses)[number];

/**
 * Wager receipts through GraphQL: Wager, AcceptanceDecision and Dispute are
 * risk lists, tenant-filtered by Keystone access; the nested player resolves only
 * for operators who may read players.
 */
export async function getWagers({ page, pageSize, search, status }: { page: number; pageSize: number; search?: string; status?: WagerStatusFilter }): Promise<KeystoneResponse<WagerListResult>> {
  const where = {
    AND: [
      status && wagerStatuses.includes(status) ? { status: { equals: status } } : {},
      search ? { OR: [{ id: { equals: search } }, { idempotencyKey: { equals: search } }] } : {},
    ],
  };
  const list = await platformRead<{ wagers: Omit<WagerListRecord, "hasAcceptedDecision" | "disputes">[]; wagersCount: number; accepted: number; rejected: number; openDisputes: number }>(`
    query WagerReceipts($where: WagerWhereInput!, $take: Int!, $skip: Int!) {
      wagers(where: $where, orderBy: [{ createdAt: desc }, { id: desc }], take: $take, skip: $skip) {
        id stakeMinor potentialReturnMinor currency status createdAt
        player { id subject }
      }
      wagersCount(where: $where)
      accepted: wagersCount(where: { status: { equals: ACCEPTED } })
      rejected: wagersCount(where: { status: { equals: REJECTED } })
      openDisputes: disputesCount(where: { status: { in: [OPEN, INVESTIGATING] } })
    }
  `, { where, take: pageSize, skip: (page - 1) * pageSize });
  if (!list.success) return list;
  const ids = list.data.wagers.map((wager) => wager.id);
  const decisions = perIdSelections(ids, "d", (id) => `acceptanceDecisionsCount(where: { wager: { id: { equals: ${id} } }, accepted: { equals: true } })`);
  const disputes = perIdSelections(ids, "x", (id) => `disputesCount(where: { wager: { id: { equals: ${id} } } })`);
  const counts = ids.length ? await platformRead<Record<string, number>>(`
    query WagerReceiptCounts(${decisions.declarations} ${disputes.declarations}) {
      ${decisions.selections}
      ${disputes.selections}
    }
  `, { ...decisions.variables, ...disputes.variables }) : null;
  if (counts && !counts.success) return counts;
  const countData = counts?.success ? counts.data : {};
  return {
    success: true,
    data: {
      wagers: list.data.wagers.map((wager, index) => ({
        ...wager,
        hasAcceptedDecision: (perIdValue<number>(countData, "d", index) ?? 0) > 0,
        disputes: perIdValue<number>(countData, "x", index) ?? 0,
      })),
      total: list.data.wagersCount,
      accepted: list.data.accepted,
      rejected: list.data.rejected,
      openDisputes: list.data.openDisputes,
    },
  };
}
