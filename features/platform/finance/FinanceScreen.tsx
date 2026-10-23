import type { ReactNode } from "react";
import { MutationForm } from "../components/MutationForm";
import { OperatorShell, TenantRequired } from "../components/OperatorShell";
import { ReadFailed } from "../components/ReadFailed";
import { WorkflowNote } from "../components/WorkflowUI";
import { dateTime, displayTimeZone, money, moneyTotals, shortId } from "../lib/format";
import { getOperatorContext } from "../lib/operator";
import { pageFrom, PLATFORM_PAGE_SIZE, type PlatformSearchParams } from "../lib/paging";
import { getFinanceOverview } from "./actions";
import { journalSideTotals, playerAvailableTotals, runDifferenceTotals } from "../lib/aggregates";
import { FinancePageClient } from "./screens/FinancePageClient";

const paymentMutation = `mutation Payment($playerId:ID!,$type:String!,$amountMinor:String!,$currency:String!,$idempotencyKey:String!){sandboxPayment(playerId:$playerId,type:$type,amountMinor:$amountMinor,currency:$currency,idempotencyKey:$idempotencyKey)}`;
const reconMutation = `mutation Reconcile($type:String!,$windowFrom:String!,$windowTo:String!){runReconciliation(type:$type,windowFrom:$windowFrom,windowTo:$windowTo)}`;

// Debits and credits are compared per currency: a USD debit never balances a EUR credit.
function journalSides(entries: { currency: string; side: string; amountMinor: bigint }[]) { const sides = new Map<string, { debit: bigint; credit: bigint }>(); for (const entry of entries) { const side = sides.get(entry.currency || "") ?? { debit: 0n, credit: 0n }; if (entry.side === "DEBIT") side.debit += entry.amountMinor; else side.credit += entry.amountMinor; sides.set(entry.currency || "", side); } return sides; }
const journalIsBalanced = (sides: Map<string, { debit: bigint; credit: bigint }>) => sides.size > 0 && [...sides.entries()].every(([currency, side]) => currency !== "" && side.debit === side.credit);

/** Server screen: authorizes finance, reads ledger/payment/reconciliation lists through GraphQL and formats them for the client screen. */
export async function FinanceScreen({ searchParams }: { searchParams?: PlatformSearchParams } = {}) {
  const params = (await searchParams) ?? {};
  const paging = (key: string) => ({ page: pageFrom({ page: params[key] }), pageSize: PLATFORM_PAGE_SIZE });
  const operator = await getOperatorContext("canManageFinance");
  if (!operator) return <OperatorShell active="Finance" title="Finance"><TenantRequired /></OperatorShell>;
  const journals = paging("jpage"), payments = paging("ppage"), runs = paging("rpage");
  const result = await getFinanceOverview({ journals, payments, runs });
  const shell = (children: ReactNode, state?: { tone: "ok" | "wait" | "alert"; meta: string }) => <OperatorShell active="Finance" title="Finance" tenantName={operator.tenantName} tone={state?.tone ?? "alert"} meta={state?.meta}>{children}</OperatorShell>;
  if (!result.success) return shell(<ReadFailed subject="finance records" />);
  const data = result.data;
  // Exact aggregates (server-only SQL, finance capability + tenant re-checked): every PLAYER_CASH
  // account's latest projection, every entry of each listed journal, every item of each listed run.
  const [cash, sidesByJournal, differencesByRun] = await Promise.all([
    playerAvailableTotals(operator),
    journalSideTotals(operator, data.journals.map((journal) => journal.id)),
    runDifferenceTotals(operator, data.runs.map((run) => run.id)),
  ]);
  const available = cash.totals;
  const unprojected = cash.accounts - cash.projected;
  const journalRows = data.journals.map((journal) => { const sides = journalSides(sidesByJournal.get(journal.id) ?? []); return { id: journal.id, reference: shortId(journal.id), effectiveAt: dateTime(journal.effectiveAt), type: journal.type || "—", amounts: [...sides.entries()].map(([currency, side]) => `${money(side.debit, currency || null)} / ${money(side.credit, currency || null)}`).join(" · ") || "No entries", state: journalIsBalanced(sides) ? journal.status || "UNKNOWN" : "UNBALANCED", balanced: journalIsBalanced(sides) }; });
  const canFinance = operator.capabilities.canManageFinance;
  const currencies = [...new Set([...cash.currencies])];
  const playerPickerMessage = data.players.length ? null : operator.capabilities.canManageCompliance ? "Needs a player with ledger accounts" : "Compliance access required to choose a player";
  const forms = <div className="grid gap-4 xl:grid-cols-2">{data.players.length ? <MutationForm title="Run sandbox payment" description="Sandbox only" mutation={paymentMutation} fields={[{ name: "playerId", label: "Player", type: "select", options: data.players.map((player) => ({ label: `${player.subject || "Player"} · ${shortId(player.id)}`, value: player.id })), help: data.players.length >= 100 ? "First 100 active players" : undefined }, { name: "type", label: "Type", type: "select", options: [{ label: "Deposit", value: "DEPOSIT" }, { label: "Withdrawal", value: "WITHDRAWAL" }] }, { name: "amountMinor", label: "Amount (minor units)", type: "number", defaultValue: 1000 }, { name: "currency", label: "Currency (player cash account)", type: "select", options: currencies.map((code) => ({ label: code, value: code })) }, { name: "idempotencyKey", label: "Request key (reuse only to retry this payment)", defaultValue: `payment:${crypto.randomUUID()}` }]} submitLabel="Post sandbox payment" successMessage="Sandbox payment recorded." disabledReason={canFinance ? undefined : "Your role does not include finance capability."} /> : <WorkflowNote title="No player available">{playerPickerMessage}</WorkflowNote>}
      <MutationForm title="Run ledger reconciliation" mutation={reconMutation} fields={[{ name: "type", label: "Control", type: "select", options: [{ label: "Journal balance", value: "JOURNAL_BALANCE" }, { label: "Daily close", value: "DAILY_CLOSE" }] }, { name: "windowFrom", label: `From (${displayTimeZone()})`, type: "datetime-local" }, { name: "windowTo", label: `To (${displayTimeZone()})`, type: "datetime-local", help: "No DST-gap times; repeated DST times need an offset" }]} submitLabel="Run reconciliation" successMessage="Reconciliation run completed." disabledReason={canFinance ? undefined : "Your role does not include finance capability."} /></div>;
  const unbalanced = journalRows.filter((row) => !row.balanced).length;
  const financeState = { tone: data.openReconItems || unbalanced ? "alert" as const : "ok" as const, meta: `${data.openReconItems} recon exceptions · ${unbalanced} unbalanced on page · ${data.paymentTotal} payments` };
  return shell(<FinancePageClient forms={forms} data={{
    metrics: {
      journalTotal: data.journalTotal,
      balanced: `${journalRows.filter((row) => row.balanced).length}/${journalRows.length}`,
      balancedDetail: "per currency",
      available: moneyTotals(available),
      availableDetail: `${cash.projected} accounts${unprojected ? ` · ${unprojected} unknown` : ""}`,
      openReconItems: data.openReconItems,
    },
    journals: journalRows.map(({ balanced: _balanced, ...row }) => row),
    journalPage: { ...journals, total: data.journalTotal },
    runs: data.runs.map((run) => { const differences = differencesByRun.get(run.id) ?? new Map<string, bigint>(); return { id: run.id, reference: shortId(run.id), window: `${run.type || "—"} · ${dateTime(run.windowFrom)} → ${dateTime(run.windowTo)}`, difference: differences.size ? moneyTotals(differences) : "None", status: run.status }; }),
    runPage: { ...runs, total: data.runTotal },
    payments: data.payments.map((payment) => ({ id: payment.id, player: payment.player?.subject || (operator.capabilities.canManageCompliance ? "Unknown player" : "Player hidden"), type: `${payment.type || "—"} · ${shortId(payment.id)}`, amount: `${money(payment.amountMinor, payment.currency)} · ${dateTime(payment.createdAt)}`, status: payment.status })),
    paymentPage: { ...payments, total: data.paymentTotal },
  }} />, financeState);
}
