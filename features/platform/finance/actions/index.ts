'use server';

import type { KeystoneResponse } from "@/features/dashboard/lib/keystoneClient";
import { platformRead } from "../../lib/graphql";

/*
 * Finance reads go through GraphQL so Keystone's list access applies: ledger, payment,
 * reconciliation and safeguarding lists need canManageFinance; nested Player records
 * need canManageCompliance and ApprovalRequest needs canManageRoles, so for an operator
 * without those they resolve to null and the screens say so.
 */

export type FinanceOverview = {
  journals: { id: string; type: string | null; status: string | null; effectiveAt: string | null }[];
  journalTotal: number;
  payments: { id: string; type: string | null; amountMinor: string | null; currency: string | null; status: string | null; createdAt: string | null; player: { id: string; subject: string | null } | null }[];
  paymentTotal: number;
  runs: { id: string; type: string | null; windowFrom: string | null; windowTo: string | null; status: string | null }[];
  runTotal: number;
  openReconItems: number;
  players: { id: string; subject: string | null }[];
};

type Paging = { page: number; pageSize: number };
const skip = ({ page, pageSize }: Paging) => (page - 1) * pageSize;

/**
 * List rows only. Per-journal debit/credit totals, per-run differences and player available
 * balances are exact SQL aggregates computed by the server screen (lib/aggregates.ts).
 */
export async function getFinanceOverview({ journals, payments, runs }: { journals: Paging; payments: Paging; runs: Paging }): Promise<KeystoneResponse<FinanceOverview>> {
  const base = await platformRead<any>(`
    query FinanceOverview($jTake: Int!, $jSkip: Int!, $pTake: Int!, $pSkip: Int!, $rTake: Int!, $rSkip: Int!) {
      journalTransactions(orderBy: [{ effectiveAt: desc }, { id: desc }], take: $jTake, skip: $jSkip) { id type status effectiveAt }
      journalTransactionsCount
      paymentIntents(orderBy: [{ createdAt: desc }, { id: desc }], take: $pTake, skip: $pSkip) { id type amountMinor currency status createdAt player { id subject } }
      paymentIntentsCount
      reconciliationRuns(orderBy: [{ createdAt: desc }, { id: desc }], take: $rTake, skip: $rSkip) { id type windowFrom windowTo status }
      reconciliationRunsCount
      openReconItems: reconciliationItemsCount(where: { status: { equals: OPEN } })
      players(where: { status: { equals: ACTIVE } }, orderBy: [{ subject: asc }], take: 100) { id subject }
    }
  `, { jTake: journals.pageSize, jSkip: skip(journals), pTake: payments.pageSize, pSkip: skip(payments), rTake: runs.pageSize, rSkip: skip(runs) });
  if (!base.success) return base;
  return {
    success: true,
    data: {
      journals: base.data.journalTransactions,
      journalTotal: base.data.journalTransactionsCount,
      payments: base.data.paymentIntents,
      paymentTotal: base.data.paymentIntentsCount,
      runs: base.data.reconciliationRuns,
      runTotal: base.data.reconciliationRunsCount,
      openReconItems: base.data.openReconItems,
      players: base.data.players,
    },
  };
}

export type ReconciliationItemRecord = { id: string; internalReference: string | null; providerReference: string | null; differenceMinor: string | null; currency: string | null; status: string | null; createdAt: string | null; run: { id: string; type: string | null } | null; resolutionJournal: { id: string } | null };
export type SafeguardingAccountRecord = { id: string; accountReference: string | null; classification: string | null; currency: string | null; status: string | null };
export type SafeguardingControlRecord = { id: string; asOf: string | null; differenceMinor: string | null; status: string | null; safeguardingAccount: { id: string; currency: string | null; accountReference: string | null } | null };
export type AdjustmentRecord = { id: string; amountMinor: string | null; currency: string | null; direction: string | null; reasonCode: string | null; status: string | null; createdAt: string | null; account: { id: string; key: string | null } | null; journalTransaction: { id: string } | null };

export type ReconciliationWorkspace = {
  runCount: number;
  completedRuns: number;
  items: ReconciliationItemRecord[];
  itemTotal: number;
  openItems: number;
  accounts: SafeguardingAccountRecord[];
  controls: SafeguardingControlRecord[];
  controlTotal: number;
  shortfalls: number;
  adjustments: AdjustmentRecord[];
  adjustmentTotal: number;
  pendingAdjustments: number;
};

const itemStatuses = ["OPEN", "MATCHED", "RESOLVED"] as const;
export type ReconciliationItemStatusFilter = (typeof itemStatuses)[number];

const itemFields = `id internalReference providerReference differenceMinor currency status createdAt run { id type } resolutionJournal { id }`;

/** Exception worklist (searchable, status-filterable, paginated), safeguarding register/controls and adjustment requests. */
export async function getReconciliationWorkspace({ items, controls, adjustments, search, status }: { items: Paging; controls: Paging; adjustments: Paging; search?: string; status?: ReconciliationItemStatusFilter }): Promise<KeystoneResponse<ReconciliationWorkspace>> {
  const where = {
    AND: [
      search ? { OR: [{ internalReference: { contains: search, mode: "insensitive" } }, { providerReference: { contains: search, mode: "insensitive" } }, { id: { equals: search } }] } : {},
      status && itemStatuses.includes(status) ? { status: { equals: status } } : {},
    ],
  };
  const response = await platformRead<any>(`
    query ReconciliationWorkspace($where: ReconciliationItemWhereInput!, $iTake: Int!, $iSkip: Int!, $cTake: Int!, $cSkip: Int!, $aTake: Int!, $aSkip: Int!) {
      runCount: reconciliationRunsCount
      completedRuns: reconciliationRunsCount(where: { status: { equals: COMPLETED } })
      reconciliationItems(where: $where, orderBy: [{ createdAt: desc }, { id: desc }], take: $iTake, skip: $iSkip) { ${itemFields} }
      itemTotal: reconciliationItemsCount(where: $where)
      openItems: reconciliationItemsCount(where: { status: { equals: OPEN } })
      safeguardingAccounts(orderBy: [{ createdAt: asc }, { id: asc }], take: 100) { id accountReference classification currency status }
      safeguardingReconciliations(orderBy: [{ asOf: desc }, { id: desc }], take: $cTake, skip: $cSkip) { id asOf differenceMinor status safeguardingAccount { id currency accountReference } }
      controlTotal: safeguardingReconciliationsCount
      shortfalls: safeguardingReconciliationsCount(where: { status: { equals: SHORTFALL } })
      ledgerAdjustmentRequests(orderBy: [{ createdAt: desc }, { id: desc }], take: $aTake, skip: $aSkip) { id amountMinor currency direction reasonCode status createdAt account { id key } journalTransaction { id } }
      adjustmentTotal: ledgerAdjustmentRequestsCount
      pendingAdjustments: ledgerAdjustmentRequestsCount(where: { status: { equals: PENDING } })
    }
  `, { where, iTake: items.pageSize, iSkip: skip(items), cTake: controls.pageSize, cSkip: skip(controls), aTake: adjustments.pageSize, aSkip: skip(adjustments) });
  if (!response.success) return response;
  const data = response.data;
  return {
    success: true,
    data: {
      runCount: data.runCount,
      completedRuns: data.completedRuns,
      items: data.reconciliationItems,
      itemTotal: data.itemTotal,
      openItems: data.openItems,
      accounts: data.safeguardingAccounts,
      controls: data.safeguardingReconciliations,
      controlTotal: data.controlTotal,
      shortfalls: data.shortfalls,
      adjustments: data.ledgerAdjustmentRequests,
      adjustmentTotal: data.adjustmentTotal,
      pendingAdjustments: data.pendingAdjustments,
    },
  };
}

export type ReconciliationItemDetail = {
  item: (ReconciliationItemRecord & { updatedAt: string | null; run: { id: string; type: string | null; status: string | null; windowFrom: string | null; windowTo: string | null; inputHash: string | null } | null }) | null;
  internalJournal: { id: string; type: string | null; status: string | null; effectiveAt: string | null } | null;
  resolvingAdjustments: AdjustmentRecord[];
  candidateAccounts: { id: string; key: string | null; currency: string | null; player: { subject: string | null } | null }[];
};

/** One exception with its run, the internal journal it names, the resolving journal's adjustment and ledger accounts in its currency. */
export async function getReconciliationItem(itemId: string): Promise<KeystoneResponse<ReconciliationItemDetail>> {
  const response = await platformRead<any>(`
    query ReconciliationItemDetail($id: ID!) {
      reconciliationItem(where: { id: $id }) { id internalReference providerReference differenceMinor currency status createdAt updatedAt run { id type status windowFrom windowTo inputHash } resolutionJournal { id } }
    }
  `, { id: itemId });
  if (!response.success) return response;
  const item = response.data.reconciliationItem;
  if (!item) return { success: true, data: { item: null, internalJournal: null, resolvingAdjustments: [], candidateAccounts: [] } };
  const internal = String(item.internalReference || "");
  const internalJournalId = internal.startsWith("journal:") ? internal.slice("journal:".length) : null;
  const related = await platformRead<any>(`
    query ReconciliationItemRelated($journalId: ID!, $resolutionId: ID!, $hasResolution: Boolean!, $hasJournal: Boolean!, $currency: String!) {
      internalJournal: journalTransaction(where: { id: $journalId }) @include(if: $hasJournal) { id type status effectiveAt }
      resolvingAdjustments: ledgerAdjustmentRequests(where: { journalTransaction: { id: { equals: $resolutionId } } }, take: 10) @include(if: $hasResolution) { id amountMinor currency direction reasonCode status createdAt account { id key } journalTransaction { id } }
      candidateAccounts: ledgerAccounts(where: { currency: { equals: $currency }, status: { equals: ACTIVE } }, orderBy: [{ key: asc }, { id: asc }], take: 100) { id key currency player { subject } }
    }
  `, { journalId: internalJournalId ?? "", resolutionId: item.resolutionJournal?.id ?? "", hasResolution: Boolean(item.resolutionJournal?.id), hasJournal: Boolean(internalJournalId), currency: item.currency ?? "" });
  if (!related.success) return related;
  return { success: true, data: { item, internalJournal: related.data.internalJournal ?? null, resolvingAdjustments: related.data.resolvingAdjustments ?? [], candidateAccounts: related.data.candidateAccounts ?? [] } };
}

export type SafeguardingControlDetail = {
  id: string; asOf: string | null; safeguardedAssetMinor: string | null; playerLiabilityMinor: string | null; differenceMinor: string | null; status: string | null; evidenceHash: string | null; createdAt: string | null;
  safeguardingAccount: { id: string; accountReference: string | null; classification: string | null; currency: string | null; status: string | null; disclosureVersion: string | null } | null;
  reconciliationRun: { id: string; type: string | null; status: string | null } | null;
} | null;

export async function getSafeguardingControl(controlId: string): Promise<KeystoneResponse<{ control: SafeguardingControlDetail; history: { id: string; asOf: string | null; differenceMinor: string | null; status: string | null }[] }>> {
  const response = await platformRead<any>(`
    query SafeguardingControl($id: ID!) {
      safeguardingReconciliation(where: { id: $id }) { id asOf safeguardedAssetMinor playerLiabilityMinor differenceMinor status evidenceHash createdAt safeguardingAccount { id accountReference classification currency status disclosureVersion } reconciliationRun { id type status } }
    }
  `, { id: controlId });
  if (!response.success) return response;
  const control = response.data.safeguardingReconciliation;
  if (!control?.safeguardingAccount?.id) return { success: true, data: { control, history: [] } };
  const history = await platformRead<any>(`
    query SafeguardingHistory($accountId: ID!) {
      safeguardingReconciliations(where: { safeguardingAccount: { id: { equals: $accountId } } }, orderBy: [{ asOf: desc }, { id: desc }], take: 20) { id asOf differenceMinor status }
    }
  `, { accountId: control.safeguardingAccount.id });
  if (!history.success) return history;
  return { success: true, data: { control, history: history.data.safeguardingReconciliations } };
}

export type LedgerAdjustmentDetail = {
  id: string; amountMinor: string | null; currency: string | null; direction: string | null; reasonCode: string | null; evidence: unknown; status: string | null; requesterId: string | null; createdAt: string | null; updatedAt: string | null;
  player: { id: string; subject: string | null } | null;
  account: { id: string; key: string | null; currency: string | null } | null;
  approvalRequest: { id: string; status: string | null; approverId: string | null; decidedAt: string | null; payloadHash: string | null; consumedAt: string | null } | null;
  journalTransaction: { id: string; type: string | null; status: string | null; effectiveAt: string | null } | null;
} | null;

export async function getLedgerAdjustment(adjustmentId: string): Promise<KeystoneResponse<{ adjustment: LedgerAdjustmentDetail; linkedItem: { id: string; status: string | null; run: { id: string } | null } | null }>> {
  const response = await platformRead<any>(`
    query LedgerAdjustment($id: ID!) {
      ledgerAdjustmentRequest(where: { id: $id }) { id amountMinor currency direction reasonCode evidence status requesterId createdAt updatedAt player { id subject } account { id key currency } approvalRequest { id status approverId decidedAt payloadHash consumedAt } journalTransaction { id type status effectiveAt } }
    }
  `, { id: adjustmentId });
  if (!response.success) return response;
  const adjustment = response.data.ledgerAdjustmentRequest;
  const linkedId = adjustment?.evidence && typeof adjustment.evidence === "object" && !Array.isArray(adjustment.evidence) ? (adjustment.evidence as Record<string, unknown>).reconciliationItemId : undefined;
  if (!adjustment || linkedId === undefined || linkedId === null || String(linkedId) === "") return { success: true, data: { adjustment, linkedItem: null } };
  const linked = await platformRead<any>(`query AdjustmentLinkedItem($id: ID!) { reconciliationItem(where: { id: $id }) { id status run { id } } }`, { id: String(linkedId) });
  if (!linked.success) return linked;
  return { success: true, data: { adjustment, linkedItem: linked.data.reconciliationItem ?? null } };
}
