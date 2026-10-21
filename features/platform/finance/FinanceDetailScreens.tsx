import Link from "next/link";
import { notFound } from "next/navigation";
import { OperatorShell, TenantRequired } from "../components/OperatorShell";
import { DetailGrid, RecordList, StatusBadge, WorkflowNote } from "../components/WorkflowUI";
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
  if (!operator) return <OperatorShell active="Finance" detail eyebrow="Journal" title="Journal transaction" description="Append-only ledger evidence."><TenantRequired /></OperatorShell>;
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
  return <OperatorShell active="Finance" detail eyebrow="Journal transaction" title={`${journal.type} journal`} description="Exact persisted entries; debits and credits are compared per currency." tenantName={operator.tenantName}>
    <DetailGrid items={[{ label: "Journal ID", value: <code className="text-xs">{journal.id}</code> }, { label: "State", value: <StatusBadge value={balanced ? journal.status : "UNBALANCED"} /> }, { label: "Effective", value: dateTime(journal.effectiveAt) }, { label: "Recorded", value: dateTime(journal.createdAt) }, { label: "Idempotency key", value: <code className="break-all text-xs">{journal.idempotencyKey}</code> }, { label: "Correlation", value: <code className="break-all text-xs">{journal.correlationId || "—"}</code> }, { label: "Debits / credits", value: [...sides.entries()].map(([currency, side]) => `${money(side.debit, currency || null)} / ${money(side.credit, currency || null)}`).join(" · ") || "No entries" }]} />
    <RecordList title="Entries" description="Account, side and exact minor-unit amount of every entry." columns={["Account", "Side", "Amount", "Minor units"]} rows={journal.from_JournalEntry_transaction.map((entry: any) => ({ id: entry.id, cells: [<span key="account">{entry.account?.key || "Unknown account"}<span className="block font-mono text-xs text-slate-500">{entry.accountId}</span></span>, entry.side, money(entry.amountMinor, entry.currency || null), <code key="raw" className="text-xs">{entry.amountMinor} {entry.currency}</code>] }))} emptyTitle="No entries" emptyDescription="A journal without entries is an evidence gap." />
    <RecordList title="Linked records" description="Business records that reference or are referenced by this journal." columns={["Record", "Reference"]} rows={links.map((link, index) => ({ id: `${index}`, href: link.href, cells: [link.label, <code key="ref" className="break-all text-xs">{link.detail}</code>] }))} emptyTitle="No linked records" emptyDescription="No payment, settlement, adjustment, reconciliation or cash-out record references this journal." />
  </OperatorShell>;
}

/** One payment intent with attempts, posted journals and provider evidence references, under finance capability. */
export async function PaymentDetailScreen({ paymentId }: { paymentId: string }) {
  const operator = await getOperatorContext("canManageFinance");
  if (!operator) return <OperatorShell active="Finance" detail eyebrow="Payment" title="Payment intent" description="Payment evidence."><TenantRequired /></OperatorShell>;
  const payment = await prisma.paymentIntent.findFirst({ where: { id: paymentId, tenantId: operator.tenantId }, include: { player: { select: { id: true, subject: true } }, from_PaymentAttempt_paymentIntent: { orderBy: { attempt: "asc" } } } });
  if (!payment) notFound();
  const journals = await prisma.journalTransaction.findMany({ where: { tenantId: operator.tenantId, correlationId: payment.id }, orderBy: { effectiveAt: "asc" }, include: { from_JournalEntry_transaction: true } });
  return <OperatorShell active="Finance" detail eyebrow="Payment intent" title={`${payment.type} · ${money(payment.amountMinor, payment.currency)}`} description="Intent, attempts and the balanced journals it posted." tenantName={operator.tenantName}>
    <DetailGrid items={[{ label: "Payment ID", value: <code className="text-xs">{payment.id}</code> }, { label: "State", value: <StatusBadge value={payment.status} /> }, { label: "Player", value: payment.player?.subject || payment.playerId || "—" }, { label: "Amount", value: `${money(payment.amountMinor, payment.currency)} (${payment.amountMinor} minor ${payment.currency})` }, { label: "Fee", value: money(payment.feeMinor || null, payment.currency) }, { label: "Created", value: dateTime(payment.createdAt) }, { label: "Completed", value: dateTime(payment.completedAt) }, { label: "Idempotency key", value: <code className="break-all text-xs">{payment.idempotencyKey}</code> }, { label: "Provider session", value: <code className="break-all text-xs">{payment.providerSessionReference || "—"}</code> }]} />
    <RecordList title="Attempts" description="Provider attempts in order, with external reference and reason." columns={["Attempt", "External reference", "Reason", "State"]} rows={payment.from_PaymentAttempt_paymentIntent.map((attempt: any) => ({ id: attempt.id, cells: [`#${attempt.attempt ?? "—"} · ${dateTime(attempt.createdAt)}`, <code key="ref" className="break-all text-xs">{attempt.externalReference || "—"}</code>, attempt.reasonCode || "—", <StatusBadge key="state" value={attempt.status} />] }))} emptyTitle="No attempts" emptyDescription="No provider attempt has been recorded for this intent." />
    <RecordList title="Posted journals" description="Journals correlated to this payment intent." columns={["Journal", "Type", "Amounts", "State"]} rows={journals.map((journal: any) => { const totals = sumByCurrency(journal.from_JournalEntry_transaction.filter((entry: any) => entry.side === "DEBIT"), (entry: any) => entry.amountMinor, (entry: any) => entry.currency); return { id: journal.id, href: journalHref(journal.id), cells: [<span key="id" className="font-mono text-xs">{journal.id}<span className="block font-sans text-slate-500">{dateTime(journal.effectiveAt)}</span></span>, journal.type, `Debits ${moneyTotals(totals)}`, <StatusBadge key="state" value={journal.status} />] }; })} emptyTitle="No journal posted" emptyDescription="A pending or failed payment posts no ledger journal." />
    {payment.riskEvidence ? <section className="rounded-xl border bg-white p-5 shadow-sm"><h2 className="font-semibold">Risk evidence</h2><pre className="mt-3 max-h-80 overflow-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-100">{jsonText(payment.riskEvidence)}</pre></section> : null}
    {payment.playerId ? <WorkflowNote title="Customer record">Customer compliance detail requires compliance capability: <Link className="underline" href={`/dashboard/platform/customers/${payment.playerId}`}>open customer</Link>.</WorkflowNote> : null}
  </OperatorShell>;
}

/** One reconciliation run with its per-currency exception items and resolution journals. */
export async function ReconciliationRunDetailScreen({ runId }: { runId: string }) {
  const operator = await getOperatorContext("canManageFinance");
  if (!operator) return <OperatorShell active="Reconciliation" detail eyebrow="Reconciliation run" title="Reconciliation run" description="Control evidence."><TenantRequired /></OperatorShell>;
  const run = await prisma.reconciliationRun.findFirst({ where: { id: runId, tenantId: operator.tenantId }, include: { from_ReconciliationItem_run: { orderBy: { createdAt: "asc" } } } });
  if (!run) notFound();
  const items = run.from_ReconciliationItem_run;
  const open = sumByCurrency(items.filter((item: any) => item.status === "OPEN"), (item: any) => { const value = BigInt(item.differenceMinor || "0"); return value < 0n ? -value : value; }, (item: any) => item.currency);
  return <OperatorShell active="Reconciliation" detail eyebrow="Reconciliation run" title={`${run.type} run`} description="Window, input hash and every exception item, per currency." tenantName={operator.tenantName}>
    <DetailGrid items={[{ label: "Run ID", value: <code className="text-xs">{run.id}</code> }, { label: "State", value: <StatusBadge value={run.status} /> }, { label: "Window", value: `${dateTime(run.windowFrom)} → ${dateTime(run.windowTo)}` }, { label: "Exact window (ISO)", value: <code className="text-xs">{run.windowFrom?.toISOString?.() ?? "—"} → {run.windowTo?.toISOString?.() ?? "—"}</code> }, { label: "Open differences", value: open.size ? moneyTotals(open) : "None" }, { label: "Input hash", value: <code className="break-all text-xs">{run.inputHash}</code> }]} />
    <RecordList title="Exception items" description="Each item names the internal record and the exact signed difference in its own currency." columns={["Internal reference", "Provider reference", "Difference", "State"]} rows={items.map((item: any) => { const journalId = String(item.internalReference || "").startsWith("journal:") ? String(item.internalReference).slice("journal:".length) : null; return { id: item.id, href: journalId ? journalHref(journalId) : item.resolutionJournalId ? journalHref(item.resolutionJournalId) : undefined, cells: [<code key="internal" className="break-all text-xs">{item.internalReference}</code>, item.providerReference || "—", money(item.differenceMinor, item.currency || null), <span key="state" className="flex flex-wrap gap-2"><StatusBadge value={item.status} />{item.resolutionJournalId ? <span className="text-xs text-slate-500">resolved by {item.resolutionJournalId}</span> : null}</span>] }; })} emptyTitle="No exception items" emptyDescription="Every journal in the window balanced per currency." />
  </OperatorShell>;
}

const reconciliationHref = "/dashboard/platform/finance/reconciliation";
const absoluteMinor = (value: string | null | undefined) => { const amount = BigInt(value || "0"); return amount < 0n ? -amount : amount; };

/** One reconciliation exception: its run, the internal journal it names, provider reference, resolution and a request linked to this exact item. */
export async function ReconciliationItemDetailScreen({ itemId }: { itemId: string }) {
  const operator = await getOperatorContext("canManageFinance");
  if (!operator) return <OperatorShell active="Reconciliation" detail eyebrow="Reconciliation exception" title="Reconciliation exception" description="Exception evidence and resolution."><TenantRequired /></OperatorShell>;
  const result = await getReconciliationItem(itemId);
  if (!result.success) return <OperatorShell active="Reconciliation" detail eyebrow="Reconciliation exception" title="Reconciliation exception" description="Exception evidence and resolution." tenantName={operator.tenantName}><ReadFailed subject="this reconciliation exception" /></OperatorShell>;
  const { item, internalJournal, resolvingAdjustments, candidateAccounts } = result.data;
  if (!item) notFound();
  const open = item.status === "OPEN";
  return <OperatorShell active="Reconciliation" detail eyebrow="Reconciliation exception" title={`${item.currency || "Unknown currency"} difference ${money(item.differenceMinor, item.currency)}`} description="Original references, signed difference and how this exception was or can be resolved." tenantName={operator.tenantName}>
    <DetailGrid items={[
      { label: "Item ID", value: <code className="break-all text-xs">{item.id}</code> },
      { label: "State", value: <StatusBadge value={item.status} /> },
      { label: "Difference", value: `${money(item.differenceMinor, item.currency)} (${item.differenceMinor ?? "—"} minor ${item.currency ?? ""})` },
      { label: "Internal reference", value: internalJournal ? <Link className="break-all underline" href={journalHref(internalJournal.id)}>{item.internalReference}</Link> : <code className="break-all text-xs">{item.internalReference || "—"}</code> },
      { label: "Provider reference", value: <code className="break-all text-xs">{item.providerReference || "—"}</code> },
      { label: "Run", value: item.run ? <Link className="underline" href={`${reconciliationHref}/runs/${item.run.id}`}>{item.run.type} · {item.run.status}</Link> : "—" },
      { label: "Run window", value: item.run ? `${dateTime(item.run.windowFrom)} → ${dateTime(item.run.windowTo)}` : "—" },
      { label: "Recorded", value: dateTime(item.createdAt) },
      { label: "Resolution journal", value: item.resolutionJournal ? <Link className="break-all underline" href={journalHref(item.resolutionJournal.id)}>{item.resolutionJournal.id}</Link> : "Not resolved" },
    ]} />
    {internalJournal ? <RecordList title="Internal journal" description="The ledger record this exception names." columns={["Journal", "Type", "Effective", "State"]} rows={[{ id: internalJournal.id, href: journalHref(internalJournal.id), cells: [<code key="id" className="break-all text-xs">{internalJournal.id}</code>, internalJournal.type || "—", dateTime(internalJournal.effectiveAt), <StatusBadge key="state" value={internalJournal.status} />] }]} emptyTitle="No journal" emptyDescription="" /> : null}
    <RecordList title="Resolving adjustment" description="The approved ledger adjustment whose journal resolved this item." columns={["Request", "Amount", "Reason", "State"]} rows={resolvingAdjustments.map((adjustment) => ({ id: adjustment.id, href: `/dashboard/platform/finance/adjustments/${adjustment.id}`, cells: [<code key="id" className="break-all text-xs">{adjustment.id}</code>, `${adjustment.direction || "—"} ${money(adjustment.amountMinor, adjustment.currency)}`, adjustment.reasonCode || "—", <StatusBadge key="state" value={adjustment.status} />] }))} emptyTitle={open ? "Not resolved yet" : "No linked adjustment"} emptyDescription={open ? "Request an adjustment linked to this item below; it resolves the item when the approved adjustment is posted." : "This item was not resolved by a ledger adjustment."} emptyAction={open ? undefined : <Link href={reconciliationHref} className="inline-flex rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted">Back to worklist</Link>} />
    {open ? <MutationForm requireReview title="Request adjustment for this exception" description="Creates no money until another operator approves the exact payload. The request is bound to this item: when the approved adjustment is posted, its journal resolves this item in the same transaction, and posting is refused if the item is no longer open or the account currency differs." mutation={`mutation($accountId:ID!,$amountMinor:String!,$direction:String!,$reasonCode:String!,$evidence:String!){requestLedgerAdjustment(accountId:$accountId,amountMinor:$amountMinor,direction:$direction,reasonCode:$reasonCode,evidence:$evidence)}`} fields={[
      { name: "accountId", label: `Ledger account (${item.currency || "same currency"})`, type: "select", options: candidateAccounts.map((account) => ({ label: `${account.key || "Account"}${account.player?.subject ? ` · ${account.player.subject}` : ""} · ${account.id}`, value: account.id })), emptyOptionsMessage: `No active ledger account in ${item.currency || "this currency"}.` },
      { name: "amountMinor", label: "Amount (minor units)", defaultValue: absoluteMinor(item.differenceMinor).toString() },
      { name: "direction", label: "Direction", type: "select", options: ["CREDIT", "DEBIT"].map((value) => ({ label: value, value })) },
      { name: "reasonCode", label: "Reason code", defaultValue: "RECONCILIATION_CORRECTION" },
      { name: "evidence", label: "Evidence", type: "hidden", defaultValue: JSON.stringify({ reconciliationItemId: item.id, internalReference: item.internalReference, providerReference: item.providerReference }) },
    ]} submitLabel="Request linked adjustment" successMessage="Adjustment approval requested for this exception." resultHref="/dashboard/platform/finance/adjustments/{id}" /> : null}
    <WorkflowNote title="Pending linked requests">Requests already raised for this item are listed under Ledger adjustment requests on the reconciliation page; a pending request is matched to its item only when it is posted.</WorkflowNote>
  </OperatorShell>;
}

/** One safeguarding comparison: attested asset, ledger liability, difference, account and recent history. */
export async function SafeguardingControlDetailScreen({ controlId }: { controlId: string }) {
  const operator = await getOperatorContext("canManageFinance");
  if (!operator) return <OperatorShell active="Reconciliation" detail eyebrow="Safeguarding control" title="Safeguarding control" description="Safeguarding comparison evidence."><TenantRequired /></OperatorShell>;
  const result = await getSafeguardingControl(controlId);
  if (!result.success) return <OperatorShell active="Reconciliation" detail eyebrow="Safeguarding control" title="Safeguarding control" description="Safeguarding comparison evidence." tenantName={operator.tenantName}><ReadFailed subject="this safeguarding control" /></OperatorShell>;
  const { control, history } = result.data;
  if (!control) notFound();
  const currency = control.safeguardingAccount?.currency ?? null;
  return <OperatorShell active="Reconciliation" detail eyebrow="Safeguarding control" title={`${control.safeguardingAccount?.accountReference || "Safeguarding account"} · ${dateTime(control.asOf)}`} description="Operator-attested asset compared with ledger player liability at one instant. It does not certify a bank balance." tenantName={operator.tenantName}>
    <DetailGrid items={[
      { label: "Control ID", value: <code className="break-all text-xs">{control.id}</code> },
      { label: "State", value: <StatusBadge value={control.status} /> },
      { label: "As of", value: dateTime(control.asOf) },
      { label: "Attested asset", value: money(control.safeguardedAssetMinor, currency) },
      { label: "Player liability (ledger)", value: money(control.playerLiabilityMinor, currency) },
      { label: "Difference", value: `${money(control.differenceMinor, currency)} (${control.differenceMinor ?? "—"} minor ${currency ?? ""})` },
      { label: "Account", value: control.safeguardingAccount ? `${control.safeguardingAccount.accountReference} · ${control.safeguardingAccount.classification} · ${control.safeguardingAccount.status}` : "—" },
      { label: "Disclosure version", value: control.safeguardingAccount?.disclosureVersion || "—" },
      { label: "Reconciliation run", value: control.reconciliationRun ? <Link className="underline" href={`${reconciliationHref}/runs/${control.reconciliationRun.id}`}>{control.reconciliationRun.type} · {control.reconciliationRun.status}</Link> : "None linked" },
      { label: "Evidence hash", value: <code className="break-all text-xs">{control.evidenceHash || "—"}</code> },
      { label: "Recorded", value: dateTime(control.createdAt) },
    ]} />
    <RecordList title="Recent controls for this account" description="Newest 20 comparisons for the same safeguarding account." columns={["Control", "As of", "Difference", "State"]} rows={history.map((item) => ({ id: item.id, href: item.id === control.id ? undefined : `/dashboard/platform/finance/safeguarding/${item.id}`, cells: [<code key="id" className="break-all text-xs">{item.id}</code>, dateTime(item.asOf), money(item.differenceMinor, currency), <StatusBadge key="state" value={item.status} />] }))} emptyTitle="No history" emptyDescription="No other comparison has been recorded for this account." />
    {control.status === "SHORTFALL" ? <WorkflowNote title="Shortfall response" tone="warning">A negative difference blocks readiness for the scope, opens an incident and requires finance/compliance ownership. <Link className="underline" href="/dashboard/platform/incidents">Open incidents</Link>.</WorkflowNote> : null}
  </OperatorShell>;
}

/** One ledger adjustment request: exact amount and evidence, approval decision, posted journal and the exception it resolves. */
export async function LedgerAdjustmentDetailScreen({ adjustmentId }: { adjustmentId: string }) {
  const operator = await getOperatorContext("canManageFinance");
  if (!operator) return <OperatorShell active="Reconciliation" detail eyebrow="Ledger adjustment" title="Ledger adjustment request" description="Adjustment request evidence."><TenantRequired /></OperatorShell>;
  const result = await getLedgerAdjustment(adjustmentId);
  if (!result.success) return <OperatorShell active="Reconciliation" detail eyebrow="Ledger adjustment" title="Ledger adjustment request" description="Adjustment request evidence." tenantName={operator.tenantName}><ReadFailed subject="this adjustment request" /></OperatorShell>;
  const { adjustment, linkedItem } = result.data;
  if (!adjustment) notFound();
  const approval = adjustment.approvalRequest;
  return <OperatorShell active="Reconciliation" detail eyebrow="Ledger adjustment" title={`${adjustment.direction || "—"} ${money(adjustment.amountMinor, adjustment.currency)}`} description="Exact requested payload, independent approval and the journal it posted." tenantName={operator.tenantName}>
    <DetailGrid items={[
      { label: "Request ID", value: <code className="break-all text-xs">{adjustment.id}</code> },
      { label: "State", value: <StatusBadge value={adjustment.status} /> },
      { label: "Amount", value: `${money(adjustment.amountMinor, adjustment.currency)} (${adjustment.amountMinor ?? "—"} minor ${adjustment.currency ?? ""})` },
      { label: "Account", value: adjustment.account ? `${adjustment.account.key} · ${adjustment.account.id}` : "—" },
      { label: "Player", value: adjustment.player?.subject || (operator.capabilities.canManageCompliance ? "—" : "Hidden (needs compliance access)") },
      { label: "Reason code", value: adjustment.reasonCode || "—" },
      { label: "Requested by", value: <code className="break-all text-xs">{adjustment.requesterId || "—"}</code> },
      { label: "Requested", value: dateTime(adjustment.createdAt) },
      { label: "Approval", value: approval ? <span className="flex flex-wrap items-center gap-2"><StatusBadge value={approval.status} />{approval.decidedAt ? dateTime(approval.decidedAt) : "Undecided"}{approval.consumedAt ? ` · applied ${dateTime(approval.consumedAt)}` : ""}</span> : operator.capabilities.canManageRoles ? "Not linked" : "Hidden (approval records need role-management access)" },
      { label: "Approval fingerprint", value: <code className="break-all text-xs">{approval?.payloadHash || "—"}</code> },
      { label: "Posted journal", value: adjustment.journalTransaction ? <Link className="break-all underline" href={journalHref(adjustment.journalTransaction.id)}>{adjustment.journalTransaction.type} · {adjustment.journalTransaction.id}</Link> : "Not posted" },
      { label: "Resolves exception", value: linkedItem ? <Link className="break-all underline" href={`${reconciliationHref}/items/${linkedItem.id}`}>{linkedItem.id} ({linkedItem.status})</Link> : "No linked reconciliation item" },
    ]} />
    <section className="rounded-xl border bg-card p-5 shadow-sm"><h2 className="font-semibold">Evidence (exact submitted)</h2><pre className="mt-3 max-h-80 overflow-auto rounded-lg bg-muted p-4 text-xs">{jsonText(adjustment.evidence)}</pre></section>
    {adjustment.status === "APPROVED" && !adjustment.journalTransaction ? <WorkflowNote title="Ready to post">This request is approved but not posted. Post it from <Link className="underline" href={reconciliationHref}>Reconciliation</Link> with this request ID and its approved request ID.</WorkflowNote> : null}
  </OperatorShell>;
}
