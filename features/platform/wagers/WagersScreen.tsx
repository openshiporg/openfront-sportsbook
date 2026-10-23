import { OperatorShell, TenantRequired } from "../components/OperatorShell";
import { ReadFailed } from "../components/ReadFailed";
import { dateTime, money, moneyTotals, shortId, sumByCurrency } from "../lib/format";
import { searchFrom } from "../lib/graphql";
import { getOperatorContext } from "../lib/operator";
import { allowedParam, pageFrom, PLATFORM_PAGE_SIZE, type PlatformSearchParams } from "../lib/paging";
import { getWagers } from "./actions";
import { WagersPageClient } from "./screens/WagersPageClient";

const wagerStatuses = ["PENDING", "DELAYED", "ACCEPTED", "REJECTED", "OPEN", "PARTIALLY_CASHED_OUT", "CASHED_OUT", "GRADED", "SETTLED", "VOID"] as const;

/** Server screen: authorizes the operator, reads receipts through GraphQL and hands formatted rows to the client screen. */
export async function WagersScreen({ searchParams }: { searchParams?: PlatformSearchParams } = {}) {
  const params = (await searchParams) ?? {};
  const page = pageFrom(params);
  const status = allowedParam(params, "status", wagerStatuses);
  const search = searchFrom(params);
  const operator = await getOperatorContext("canManageRisk");
  if (!operator) return <OperatorShell active="Wagers" title="Wagers"><TenantRequired /></OperatorShell>;
  const result = await getWagers({ page, pageSize: PLATFORM_PAGE_SIZE, search, status });
  if (!result.success) return <OperatorShell active="Wagers" title="Wagers" tone="alert" tenantName={operator.tenantName}><ReadFailed subject="wagers" /></OperatorShell>;
  const wagers = result.data.wagers;
  // Handle counts only wagers with an accepted decision that remain economically live or resolved;
  // rejected, pending/delayed and voided requests contributed no accepted stake.
  const acceptedEconomic = wagers.filter((wager) => !["PENDING", "DELAYED", "REJECTED", "VOID"].includes(String(wager.status)) && wager.hasAcceptedDecision);
  const handle = sumByCurrency(acceptedEconomic, (wager) => wager.stakeMinor, (wager) => wager.currency);
  const rejectedRequested = sumByCurrency(wagers.filter((wager) => wager.status === "REJECTED"), (wager) => wager.stakeMinor, (wager) => wager.currency);
  return <OperatorShell active="Wagers" title="Wagers" tone={result.data.openDisputes ? "wait" : "ok"} meta={`${result.data.total} wagers · ${result.data.openDisputes} open disputes`} tenantName={operator.tenantName}>
    <WagersPageClient data={{
      rows: wagers.map((wager) => ({ id: wager.id, reference: shortId(wager.id), player: wager.player ? wager.player.subject || shortId(wager.player.id) : "Restricted", stakeAndReturn: `${money(wager.stakeMinor, wager.currency)} → ${money(wager.potentialReturnMinor, wager.currency)} · ${dateTime(wager.createdAt)}`, status: wager.status, disputed: wager.disputes > 0 })),
      total: result.data.total, accepted: result.data.accepted, rejected: result.data.rejected, openDisputes: result.data.openDisputes,
      handle: moneyTotals(handle), handleDetail: `${acceptedEconomic.length}/${wagers.length} on page · rejected ${moneyTotals(rejectedRequested)}`,
      page, pageSize: PLATFORM_PAGE_SIZE, status, search, statuses: wagerStatuses,
    }} />
  </OperatorShell>;
}
