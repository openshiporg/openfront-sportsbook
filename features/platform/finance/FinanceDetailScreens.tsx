import Link from "next/link";
import { notFound } from "next/navigation";
import { OperatorShell, TenantRequired } from "../components/OperatorShell";
import { Mono, PillLink, Track } from "../components/kit";
import { DetailGrid, RecordList, StatusBadge, statusDotTone, WorkflowNote } from "../components/WorkflowUI";
import { dateTime, jsonText, money, moneyTotals, sumByCurrency } from "../lib/format";
import { getOperatorContext, platformPrisma as prisma } from "../lib/operator";
import { MutationForm } from "../components/MutationForm";
import { ReadFailed } from "../components/ReadFailed";
import { getLedgerAdjustment, getReconciliationItem, getSafeguardingControl } from "./actions";

const journalHref = (id: string) => `/dashboard/platform/finance/journals/${id}`;
const paymentHref = (id: string) => `/dashboard/platform/finance/payments/${id}`;

function perCurrencySides(entries: any[]) {
  const sides = new Map<string, { debit: bigint; credit: bigint }>();
  for (const entry of entries) {
    const side = sides.get(entry.currency || "") ?? { debit: 0n, credit: 0n };
    if (entry.side === "DEBIT") side.debit += BigInt(entry.amountMinor || "0"); else side.credit += BigInt(entry.amountMinor || "0");
    sides.set(entry.currency || "", side);
  }
  return sides;
}

/** One journal transaction with its exact entries, per-currency balance and linked business records. */
export async function JournalDetailScreen({ journalId }: { journalId: string }) {
  const operator = await getOperatorContext("canManageFinance");
  if (!operator) return <OperatorShell active="Finance" detail title="Journal transaction"><TenantRequired /></OperatorShell>;
  const journal = await prisma.journalTransaction.findFirst({ where: { id: journalId, tenantId: operator.tenantId }, include: { from_JournalEntry_transaction: { include: { account: true } }, reversalOf: true, from_JournalTransaction_reversalOf: true, from_Settlement_journalTransaction: true, from_LedgerAdjustmentRequest_journalTransaction: true, from_ReconciliationItem_resolutionJournal: true, from_CashOutAcceptance_journalTransaction: true } });
  if (!journal) notFound();
  const payment = journal.correlationId ? await prisma.paymentIntent.findFirst({ where: { id: journal.correlationId, tenantId: operator.tenantId }, select: { id: true, type: true } }) : null;
  const sides = perCurrencySides(journal.from_JournalEntry_transaction);
  const balanced = sides.size > 0 && [...sides.entries()].every(([currency, side]) => currency !== "" && side.debit === side.credit);
  const links: { label: string; href?: string; detail: string }[] = [
    ...(payment ? [{ label: `Payment intent (${payment.type})`, href: paymentHref(payment.id), detail: payment.id }] : []),
    ...(journal.reversalOf ? [{ label: "Reverses journal", href: journalHref(journal.reversalOf.id), detail: journal.reversalOf.id }] : []),
    ...journal.from_JournalTransaction_reversalOf.map((item: any) => ({ label: "Reversed by journal", href: journalHref(item.id), detail: item.id })),
    ...journal.from_Settlement_journalTransaction.map((item: any) => ({ label: `Settlement v${item.version}`, href: item.wagerId ? `/dashboard/platform/settlements/${item.wagerId}` : undefined, detail: item.id })),
    ...journal.from_LedgerAdjustmentRequest_journalTransaction.map((item: any) => ({ label: `Ledger adjustment (${item.status})`, detail: `${item.id} · approval ${item.approvalRequestId}` })),
    ...journal.from_ReconciliationItem_resolutionJournal.map((item: any) => ({ label: "Resolves reconciliation item", href: item.runId ? `/dashboard/platform/finance/reconciliation/runs/${item.runId}` : undefined, detail: item.id })),
    ...journal.from_CashOutAcceptance_journalTransaction.map((item: any) => ({ label: "Cash-out acceptance", href: item.wagerId ? `/dashboard/platform/wagers/${item.wagerId}` : undefined, detail: item.id })),
  ];
  return <OperatorShell active="Finance" detail title={`${journal.type} journal`} tenantName={operator.tenantName} tone={balanced ? statusDotTone(journal.status) : "alert"} meta={`${balanced ? "balanced" : "unbalanced"} · ${journal.from_JournalEntry_transaction.length} entries · ${dateTime(journal.effectiveAt)}`}>
    <DetailGrid items={[{ label: "Journal ID", value: <code className="text-xs">{journal.id}</code> }, { label: "State", value: <StatusBadge value={balanced ? journal.status : "UNBALANCED"} /> }, { label: "Effective", value: <Mono>{dateTime(journal.effectiveAt)}</Mono> }, { label: "Recorded", value: <Mono>{dateTime(journal.createdAt)}</Mono> }, { label: "Idempotency key", value: <code className="break-all text-xs">{journal.idempotencyKey}</code> }, { label: "Correlation", value: <code className="break-all text-xs">{journal.correlationId || "—"}</code> }, { label: "Debits / credits", value: <Mono>{[...sides.entries()].map(([currency, side]) => `${money(side.debit, currency || null)} / ${money(side.credit, currency || null)}`).join(" · ") || "No entries"}</Mono> }]} />
    <RecordList title="Entries" columns={["Account", "Side", "Amount", "Minor units"]} rows={journal.from_JournalEntry_transaction.map((entry: any) => ({ id: entry.id, cells: [<span key="account">{entry.account?.key || "Unknown account"}<span className="block break-all tabular-nums text-xs font-normal text-muted-foreground">{entry.accountId}</span></span>, entry.side, <Mono key="amount">{money(entry.amountMinor, entry.currency || null)}</Mono>, <Mono key="raw" className="text-xs">{entry.amountMinor} {entry.currency}</Mono>] }))} emptyTitle="No entries" />
    <RecordList title="Linked records" columns={["Record", "Reference"]} rows={links.map((link, index) => ({ id: `${index}`, href: link.href, cells: [link.label, <Mono key="ref" className="break-all text-xs">{link.detail}</Mono>] }))} emptyTitle="No linked records" />
  </OperatorShell>;
}

/** One payment intent with attempts, posted journals and provider evidence references, under finance capability. */
export async function PaymentDetailScreen({ paymentId }: { paymentId: string }) {
  const operator = await getOperatorContext("canManageFinance");
  if (!operator) return <OperatorShell active="Finance" detail title="Payment intent"><TenantRequired /></OperatorShell>;
  const payment = await prisma.paymentIntent.findFirst({ where: { id: paymentId, tenantId: operator.tenantId }, include: { player: { select: { id: true, subject: true } }, from_PaymentAttempt_paymentIntent: { orderBy: { attempt: "asc" } } } });
  if (!payment) notFound();
  const journals = await prisma.journalTransaction.findMany({ where: { tenantId: operator.tenantId, correlationId: payment.id }, orderBy: { effectiveAt: "asc" }, include: { from_JournalEntry_transaction: true } });
  return <OperatorShell active="Finance" detail title={`${payment.type} · ${money(payment.amountMinor, payment.currency)}`} tenantName={operator.tenantName} tone={statusDotTone(payment.status)} meta={`${String(payment.status ?? "unknown").toLowerCase()} · ${payment.from_PaymentAttempt_paymentIntent.length} attempts · ${journals.length} journals`}>
    <DetailGrid items={[{ label: "Payment ID", value: <code className="text-xs">{payment.id}</code> }, { label: "State", value: <StatusBadge value={payment.status} /> }, { label: "Player", value: payment.player?.subject || payment.playerId || "—" }, { label: "Amount", value: <Mono>{money(payment.amountMinor, payment.currency)} ({payment.amountMinor} minor {payment.currency})</Mono> }, { label: "Fee", value: <Mono>{money(payment.feeMinor || null, payment.currency)}</Mono> }, { label: "Created", value: <Mono>{dateTime(payment.createdAt)}</Mono> }, { label: "Completed", value: <Mono>{dateTime(payment.completedAt)}</Mono> }, { label: "Idempotency key", value: <code className="break-all text-xs">{payment.idempotencyKey}</code> }, { label: "Provider session", value: <code className="break-all text-xs">{payment.providerSessionReference || "—"}</code> }]} />
    <RecordList title="Attempts" columns={["Attempt", "External reference", "Reason", "State"]} rows={payment.from_PaymentAttempt_paymentIntent.map((attempt: any) => ({ id: attempt.id, status: attempt.status, cells: [<Mono key="n" className="text-xs">#{attempt.attempt ?? "—"} · {dateTime(attempt.createdAt)}</Mono>, <code key="ref" className="break-all text-xs">{attempt.externalReference || "—"}</code>, attempt.reasonCode || "—", <StatusBadge key="state" value={attempt.status} />] }))} emptyTitle="No attempts" />
    <RecordList title="Posted journals" columns={["Journal", "Type", "Amounts", "State"]} rows={journals.map((journal: any) => { const totals = sumByCurrency(journal.from_JournalEntry_transaction.filter((entry: any) => entry.side === "DEBIT"), (entry: any) => entry.amountMinor, (entry: any) => entry.currency); return { id: journal.id, href: journalHref(journal.id), status: journal.status, cells: [<span key="id" className="break-all tabular-nums text-xs">{journal.id}<span className="block text-muted-foreground">{dateTime(journal.effectiveAt)}</span></span>, journal.type, <Mono key="amounts">Debits {moneyTotals(totals)}</Mono>, <StatusBadge key="state" value={journal.status} />] }; })} emptyTitle="No journal posted" />
    {payment.riskEvidence ? <section className="min-w-0 rounded-[4px] border bg-card p-4"><h2 className="text-sm font-semibold">Risk evidence</h2><pre className="mt-3 max-h-80 overflow-auto rounded-[4px] bg-muted p-4 text-xs">{jsonText(payment.riskEvidence)}</pre></section> : null}
    {payment.playerId ? <Track><PillLink size="sm" href={`/dashboard/platform/customers/${payment.playerId}`}>Customer</PillLink></Track> : null}
  </OperatorShell>;
}

/** One reconciliation run with its per-currency exception items and resolution journals. */
export async function ReconciliationRunDetailScreen({ runId }: { runId: string }) {
  const operator = await getOperatorContext("canManageFinance");
  if (!operator) return <OperatorShell active="Reconciliation" detail title="Reconciliation run"><TenantRequired /></OperatorShell>;
  const run = await prisma.reconciliationRun.findFirst({ where: { id: runId, tenantId: operator.tenantId }, include: { from_ReconciliationItem_run: { orderBy: { createdAt: "asc" } } } });
  if (!run) notFound();
  const items = run.from_ReconciliationItem_run;
  const open = sumByCurrency(items.filter((item: any) => item.status === "OPEN"), (item: any) => { const value = BigInt(item.differenceMinor || "0"); return value < 0n ? -value : value; }, (item: any) => item.currency);
  return <OperatorShell active="Reconciliation" detail title={`${run.type} run`} tenantName={operator.tenantName} tone={open.size ? "alert" : statusDotTone(run.status)} meta={`${items.length} items · ${items.filter((item: any) => item.status === "OPEN").length} open`}>
    <DetailGrid items={[{ label: "Run ID", value: <code className="text-xs">{run.id}</code> }, { label: "State", value: <StatusBadge value={run.status} /> }, { label: "Window", value: <Mono>{dateTime(run.windowFrom)} → {dateTime(run.windowTo)}</Mono> }, { label: "Exact window (ISO)", value: <code className="text-xs">{run.windowFrom?.toISOString?.() ?? "—"} → {run.windowTo?.toISOString?.() ?? "—"}</code> }, { label: "Open differences", value: <Mono>{open.size ? moneyTotals(open) : "None"}</Mono> }, { label: "Input hash", value: <code className="break-all text-xs">{run.inputHash}</code> }]} />
    <RecordList title="Exception items" columns={["Internal reference", "Provider reference", "Difference", "State"]} rows={items.map((item: any) => { const journalId = String(item.internalReference || "").startsWith("journal:") ? String(item.internalReference).slice("journal:".length) : null; return { id: item.id, href: journalId ? journalHref(journalId) : item.resolutionJournalId ? journalHref(item.resolutionJournalId) : undefined, status: item.status === "OPEN" ? "UNMATCHED" : item.status, cells: [<code key="internal" className="break-all text-xs">{item.internalReference}</code>, <span key="provider" className="break-all">{item.providerReference || "—"}</span>, <Mono key="diff">{money(item.differenceMinor, item.currency || null)}</Mono>, <span key="state" className="flex flex-wrap gap-2"><StatusBadge value={item.status} />{item.resolutionJournalId ? <span className="break-all tabular-nums text-xs text-muted-foreground">resolved by {item.resolutionJournalId}</span> : null}</span>] }; })} emptyTitle="No exception items" />
  </OperatorShell>;
}

const reconciliationHref = "/dashboard/platform/finance/reconciliation";
const absoluteMinor = (value: string | null | undefined) => { const amount = BigInt(value || "0"); return amount < 0n ? -amount : amount; };

/** One reconciliation exception: its run, the internal journal it names, provider reference, resolution and a request linked to this exact item. */
export async function ReconciliationItemDetailScreen({ itemId }: { itemId: string }) {
  const operator = await getOperatorContext("canManageFinance");
  if (!operator) return <OperatorShell active="Reconciliation" detail title="Reconciliation exception"><TenantRequired /></OperatorShell>;
  const result = await getReconciliationItem(itemId);
  if (!result.success) return <OperatorShell active="Reconciliation" detail title="Reconciliation exception" tenantName={operator.tenantName}><ReadFailed subject="this reconciliation exception" /></OperatorShell>;
  const { item, internalJournal, resolvingAdjustments, candidateAccounts } = result.data;
  if (!item) notFound();
  const open = item.status === "OPEN";
  return <OperatorShell active="Reconciliation" detail title={`${item.currency || "Unknown currency"} difference ${money(item.differenceMinor, item.currency)}`} tenantName={operator.tenantName} tone={open ? "alert" : statusDotTone(item.status)} meta={open ? "unmatched" : item.resolutionJournal ? "resolved" : String(item.status ?? "unknown").toLowerCase()}>
    <DetailGrid items={[
      { label: "Item ID", value: <code className="break-all text-xs">{item.id}</code> },
      { label: "State", value: <StatusBadge value={item.status} /> },
      { label: "Difference", value: <Mono>{money(item.differenceMinor, item.currency)} ({item.differenceMinor ?? "—"} minor {item.currency ?? ""})</Mono> },
      { label: "Internal reference", value: internalJournal ? <Link className="break-all underline" href={journalHref(internalJournal.id)}>{item.internalReference}</Link> : <code className="break-all text-xs">{item.internalReference || "—"}</code> },
      { label: "Provider reference", value: <code className="break-all text-xs">{item.providerReference || "—"}</code> },
      { label: "Run", value: item.run ? <Link className="underline" href={`${reconciliationHref}/runs/${item.run.id}`}>{item.run.type} · {item.run.status}</Link> : "—" },
      { label: "Run window", value: item.run ? <Mono>{dateTime(item.run.windowFrom)} → {dateTime(item.run.windowTo)}</Mono> : "—" },
      { label: "Recorded", value: <Mono>{dateTime(item.createdAt)}</Mono> },
      { label: "Resolution journal", value: item.resolutionJournal ? <Link className="break-all underline" href={journalHref(item.resolutionJournal.id)}>{item.resolutionJournal.id}</Link> : "Not resolved" },
    ]} />
    {internalJournal ? <RecordList title="Internal journal" columns={["Journal", "Type", "Effective", "State"]} rows={[{ id: internalJournal.id, href: journalHref(internalJournal.id), cells: [<code key="id" className="break-all text-xs">{internalJournal.id}</code>, internalJournal.type || "—", dateTime(internalJournal.effectiveAt), <StatusBadge key="state" value={internalJournal.status} />] }]} emptyTitle="No journal" /> : null}
    <RecordList title="Resolving adjustment" columns={["Request", "Amount", "Reason", "State"]} rows={resolvingAdjustments.map((adjustment) => ({ id: adjustment.id, href: `/dashboard/platform/finance/adjustments/${adjustment.id}`, status: adjustment.status ?? undefined, cells: [<code key="id" className="break-all text-xs">{adjustment.id}</code>, <Mono key="amount">{adjustment.direction || "—"} {money(adjustment.amountMinor, adjustment.currency)}</Mono>, adjustment.reasonCode || "—", <StatusBadge key="state" value={adjustment.status} />] }))} emptyTitle={open ? "Not resolved yet" : "No linked adjustment"} emptyAction={open ? undefined : <Track><PillLink size="sm" href={reconciliationHref}>Worklist</PillLink></Track>} />
    {open ? <MutationForm requireReview title="Request adjustment for this exception" mutation={`mutation($accountId:ID!,$amountMinor:String!,$direction:String!,$reasonCode:String!,$evidence:String!){requestLedgerAdjustment(accountId:$accountId,amountMinor:$amountMinor,direction:$direction,reasonCode:$reasonCode,evidence:$evidence)}`} fields={[
      { name: "accountId", label: `Ledger account (${item.currency || "same currency"})`, type: "select", options: candidateAccounts.map((account) => ({ label: `${account.key || "Account"}${account.player?.subject ? ` · ${account.player.subject}` : ""} · ${account.id}`, value: account.id })), emptyOptionsMessage: `No active ledger account in ${item.currency || "this currency"}.` },
      { name: "amountMinor", label: "Amount (minor units)", defaultValue: absoluteMinor(item.differenceMinor).toString() },
      { name: "direction", label: "Direction", type: "select", options: ["CREDIT", "DEBIT"].map((value) => ({ label: value, value })) },
      { name: "reasonCode", label: "Reason code", defaultValue: "RECONCILIATION_CORRECTION" },
      { name: "evidence", label: "Evidence", type: "hidden", defaultValue: JSON.stringify({ reconciliationItemId: item.id, internalReference: item.internalReference, providerReference: item.providerReference }) },
    ]} submitLabel="Request linked adjustment" successMessage="Adjustment approval requested for this exception." resultHref="/dashboard/platform/finance/adjustments/{id}" /> : null}
  </OperatorShell>;
}

/** One safeguarding comparison: attested asset, ledger liability, difference, account and recent history. */
export async function SafeguardingControlDetailScreen({ controlId }: { controlId: string }) {
  const operator = await getOperatorContext("canManageFinance");
  if (!operator) return <OperatorShell active="Reconciliation" detail title="Safeguarding control"><TenantRequired /></OperatorShell>;
  const result = await getSafeguardingControl(controlId);
  if (!result.success) return <OperatorShell active="Reconciliation" detail title="Safeguarding control" tenantName={operator.tenantName}><ReadFailed subject="this safeguarding control" /></OperatorShell>;
  const { control, history } = result.data;
  if (!control) notFound();
  const currency = control.safeguardingAccount?.currency ?? null;
  return <OperatorShell active="Reconciliation" detail title={`${control.safeguardingAccount?.accountReference || "Safeguarding account"} · ${dateTime(control.asOf)}`} tenantName={operator.tenantName} tone={statusDotTone(control.status)} meta={`${String(control.status ?? "unknown").toLowerCase()} · difference ${money(control.differenceMinor, currency)}`}>
    {control.status === "SHORTFALL" ? <WorkflowNote title="Shortfall · readiness blocked" tone="warning"><Link className="underline underline-offset-2" href="/dashboard/platform/incidents">Incidents</Link></WorkflowNote> : null}
    <DetailGrid items={[
      { label: "Control ID", value: <code className="break-all text-xs">{control.id}</code> },
      { label: "State", value: <StatusBadge value={control.status} /> },
      { label: "As of", value: <Mono>{dateTime(control.asOf)}</Mono> },
      { label: "Attested asset", value: <Mono>{money(control.safeguardedAssetMinor, currency)}</Mono> },
      { label: "Player liability (ledger)", value: <Mono>{money(control.playerLiabilityMinor, currency)}</Mono> },
      { label: "Difference", value: <Mono>{money(control.differenceMinor, currency)} ({control.differenceMinor ?? "—"} minor {currency ?? ""})</Mono> },
      { label: "Account", value: control.safeguardingAccount ? `${control.safeguardingAccount.accountReference} · ${control.safeguardingAccount.classification} · ${control.safeguardingAccount.status}` : "—" },
      { label: "Disclosure version", value: control.safeguardingAccount?.disclosureVersion || "—" },
      { label: "Reconciliation run", value: control.reconciliationRun ? <Link className="underline" href={`${reconciliationHref}/runs/${control.reconciliationRun.id}`}>{control.reconciliationRun.type} · {control.reconciliationRun.status}</Link> : "None linked" },
      { label: "Evidence hash", value: <code className="break-all text-xs">{control.evidenceHash || "—"}</code> },
      { label: "Recorded", value: <Mono>{dateTime(control.createdAt)}</Mono> },
    ]} />
    <RecordList title="Recent controls" columns={["Control", "As of", "Difference", "State"]} rows={history.map((item) => ({ id: item.id, href: item.id === control.id ? undefined : `/dashboard/platform/finance/safeguarding/${item.id}`, status: item.status ?? undefined, cells: [<code key="id" className="break-all text-xs">{item.id}</code>, <Mono key="asof" className="text-xs">{dateTime(item.asOf)}</Mono>, <Mono key="diff">{money(item.differenceMinor, currency)}</Mono>, <StatusBadge key="state" value={item.status} />] }))} emptyTitle="No history" />
  </OperatorShell>;
}

/** One ledger adjustment request: exact amount and evidence, approval decision, posted journal and the exception it resolves. */
export async function LedgerAdjustmentDetailScreen({ adjustmentId }: { adjustmentId: string }) {
  const operator = await getOperatorContext("canManageFinance");
  if (!operator) return <OperatorShell active="Reconciliation" detail title="Ledger adjustment request"><TenantRequired /></OperatorShell>;
  const result = await getLedgerAdjustment(adjustmentId);
  if (!result.success) return <OperatorShell active="Reconciliation" detail title="Ledger adjustment request" tenantName={operator.tenantName}><ReadFailed subject="this adjustment request" /></OperatorShell>;
  const { adjustment, linkedItem } = result.data;
  if (!adjustment) notFound();
  const approval = adjustment.approvalRequest;
  return <OperatorShell active="Reconciliation" detail title={`${adjustment.direction || "—"} ${money(adjustment.amountMinor, adjustment.currency)}`} tenantName={operator.tenantName} tone={statusDotTone(adjustment.status)} meta={`${String(adjustment.status ?? "unknown").toLowerCase()} · ${adjustment.journalTransaction ? "posted" : "not posted"}`}>
    {adjustment.status === "APPROVED" && !adjustment.journalTransaction ? <WorkflowNote title="Approved · not posted"><Link className="underline underline-offset-2" href={reconciliationHref}>Post from Reconciliation</Link></WorkflowNote> : null}
    <DetailGrid items={[
      { label: "Request ID", value: <code className="break-all text-xs">{adjustment.id}</code> },
      { label: "State", value: <StatusBadge value={adjustment.status} /> },
      { label: "Amount", value: <Mono>{money(adjustment.amountMinor, adjustment.currency)} ({adjustment.amountMinor ?? "—"} minor {adjustment.currency ?? ""})</Mono> },
      { label: "Account", value: adjustment.account ? <Mono className="break-all">{adjustment.account.key} · {adjustment.account.id}</Mono> : "—" },
      { label: "Player", value: adjustment.player?.subject || (operator.capabilities.canManageCompliance ? "—" : "Hidden") },
      { label: "Reason code", value: adjustment.reasonCode || "—" },
      { label: "Requested by", value: <code className="break-all text-xs">{adjustment.requesterId || "—"}</code> },
      { label: "Requested", value: <Mono>{dateTime(adjustment.createdAt)}</Mono> },
      { label: "Approval", value: approval ? <span className="flex flex-wrap items-center gap-2"><StatusBadge value={approval.status} />{approval.decidedAt ? dateTime(approval.decidedAt) : "Undecided"}{approval.consumedAt ? ` · applied ${dateTime(approval.consumedAt)}` : ""}</span> : operator.capabilities.canManageRoles ? "Not linked" : "Hidden (role-management access)" },
      { label: "Approval fingerprint", value: <code className="break-all text-xs">{approval?.payloadHash || "—"}</code> },
      { label: "Posted journal", value: adjustment.journalTransaction ? <Link className="break-all underline" href={journalHref(adjustment.journalTransaction.id)}>{adjustment.journalTransaction.type} · {adjustment.journalTransaction.id}</Link> : "Not posted" },
      { label: "Resolves exception", value: linkedItem ? <Link className="break-all underline" href={`${reconciliationHref}/items/${linkedItem.id}`}>{linkedItem.id} ({linkedItem.status})</Link> : "No linked reconciliation item" },
    ]} />
    <section className="min-w-0 rounded-[4px] border bg-card p-4"><h2 className="text-sm font-semibold">Evidence</h2><pre className="mt-3 max-h-80 overflow-auto rounded-[4px] bg-muted p-4 text-xs">{jsonText(adjustment.evidence)}</pre></section>
  </OperatorShell>;
}
