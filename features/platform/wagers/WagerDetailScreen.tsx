import { notFound } from "next/navigation";
import { MutationForm } from "../components/MutationForm";
import { OperatorShell, TenantRequired } from "../components/OperatorShell";
import { Mono, PillLink, Track } from "../components/kit";
import { DetailGrid, RecordList, StatusBadge, statusDotTone, WorkflowNote } from "../components/WorkflowUI";
import { dateTime, jsonText, money, shortId } from "../lib/format";
import { getOperatorContext, platformPrisma as prisma } from "../lib/operator";
import { projectCashOutState } from "@/features/sportsbook/domain/cashout-economics";

const investigateMutation = `mutation Investigate($wagerId:ID!,$category:String!,$reason:String!){openWagerInvestigation(wagerId:$wagerId,category:$category,reason:$reason)}`;

export async function WagerDetailScreen({ wagerId }: { wagerId: string }) {
  const operator = await getOperatorContext("canManageRisk");
  if (!operator) return <OperatorShell active="Wagers" detail title="Wager"><TenantRequired /></OperatorShell>;
  const wager = await prisma.wager.findFirst({ where: { id: wagerId, tenantId: operator.tenantId }, include: { player: true, quote: true, from_WagerLeg_wager: { include: { from_LegGrade_wagerLeg: true } }, from_AcceptanceDecision_wager: { take: 50 }, from_Settlement_wager: { orderBy: { version: "desc" }, take: 50 }, from_Dispute_wager: { orderBy: { createdAt: "desc" }, take: 50 }, from_CashOutAcceptance_wager: { orderBy: { acceptedAt: "asc" }, take: 100 }, from_WagerPart_wager: { orderBy: { partIndex: "asc" } } } });
  if (!wager) notFound();
  // Receipt names and prices come from immutable quote terms and accepted legs/parts, never the
  // current (mutable) catalog or the pre-acceptance quote price.
  const [terms, legTerms] = wager.quoteId ? await Promise.all([
    prisma.customerQuoteTerms.findFirst({ where: { tenantId: operator.tenantId, quoteKey: wager.quoteId } }),
    prisma.customerQuoteLegTerms.findMany({ where: { tenantId: operator.tenantId, quoteKey: wager.quoteId }, take: 500 }),
  ]) : [null, []];
  const legTermsByIndex = new Map(legTerms.map((leg: any) => [Number(leg.legIndex), leg]));
  const acceptedLegs = [...wager.from_WagerLeg_wager].sort((a: any, b: any) => Number(a.legIndex ?? 0) - Number(b.legIndex ?? 0));
  const firstLeg: any = acceptedLegs[0];
  const firstLegTerms: any = firstLeg ? legTermsByIndex.get(Number(firstLeg.legIndex ?? 0)) : undefined;
  const acceptedOdds = wager.from_WagerPart_wager.length === 1 ? wager.from_WagerPart_wager[0].decimalOdds : acceptedLegs.length === 1 ? firstLeg.decimalOdds : null;
  const decision = wager.from_AcceptanceDecision_wager[0];
  const cashOutParts = wager.from_WagerPart_wager;
  const cashOutState = projectCashOutState(wager.stakeMinor, wager.from_CashOutAcceptance_wager, cashOutParts.length ? cashOutParts : undefined);
  const reversedById = new Map(cashOutState.reversals.map(item => [item.reversalOfId, item.id]));
  // Offers and exposure share this screen's risk gate; tax is finance-only and is not read without it.
  const canSeeTax = operator.capabilities.canManageFinance;
  const [offers, exposure, taxAssessments] = await Promise.all([
    prisma.cashOutOffer.findMany({ where: { tenantId: operator.tenantId, wagerId: wager.id }, orderBy: [{ offeredAt: "desc" }, { createdAt: "desc" }], take: 50, include: { from_CashOutAcceptance_offer: { where: { tenantId: operator.tenantId }, select: { id: true, status: true, reversalOfId: true } } } }),
    prisma.wagerExposureAllocation.findMany({ where: { tenantId: operator.tenantId, wagerId: wager.id }, orderBy: { createdAt: "asc" }, take: 100, include: { market: { select: { line: true, definitionKey: true, definition: { select: { name: true } }, event: { select: { name: true } } } } } }),
    canSeeTax ? prisma.taxAssessment.findMany({ where: { tenantId: operator.tenantId, wagerId: wager.id }, orderBy: { createdAt: "desc" }, take: 50 }) : Promise.resolve([]),
  ]);
  const offerAcceptance = (offer: any) => { const accepted = offer.from_CashOutAcceptance_offer.find((item: any) => !item.reversalOfId); return accepted ? (reversedById.has(accepted.id) ? "Accepted · reversed" : "Accepted") : "Not accepted"; };
  const portion = (numerator: string, denominator: string) => numerator && denominator && denominator !== "0" ? (numerator === denominator ? "Full" : `${numerator}/${denominator}`) : "—";
  const openDisputes = wager.from_Dispute_wager.filter((dispute: any) => ["OPEN", "INVESTIGATING"].includes(String(dispute.status))).length;
  return <OperatorShell active="Wagers" detail title={`Wager ${shortId(wager.id)}`} tone={statusDotTone(wager.status)} meta={`${(wager.status || "unknown").toLowerCase()} · ${wager.structure || terms?.structure || "—"} · ${acceptedLegs.length} legs · ${openDisputes} open disputes`} tenantName={operator.tenantName}>
    {decision && !decision.accepted ? <WorkflowNote title={`Rejected · ${decision.rejectionCode || "REJECTED"}`} tone="warning" /> : null}
    <DetailGrid items={[
      { label: "Status", value: <StatusBadge value={wager.status} /> },
      { label: "Player", value: <span className="break-all">{wager.player?.subject || wager.playerId}</span> },
      { label: "Stake", value: <Mono>{money(wager.stakeMinor, wager.currency)}</Mono> },
      { label: "Accepted odds", value: <Mono>{acceptedOdds || (acceptedLegs.length ? "per leg" : "—")}</Mono> },
      { label: "Potential return", value: <Mono>{money(wager.potentialReturnMinor, wager.currency)}</Mono> },
      { label: "Quoted odds", value: <Mono>{terms?.decimalOdds || "—"}</Mono> },
      { label: "Stake after net cash-outs", value: <Mono>{money(cashOutState.remainingStakeMinor, wager.currency)}</Mono> },
      { label: "Net cash-out", value: <Mono>{money(cashOutState.acceptedAmountMinor, wager.currency)} · {Number(cashOutState.closedMillionths) / 10_000}%</Mono> },
      { label: "Structure", value: <span>{wager.structure || terms?.structure || "—"} · <Mono>{acceptedLegs.length}</Mono> legs · <Mono>{wager.from_WagerPart_wager.length}</Mono> parts</span> },
      { label: "Event (as quoted)", value: firstLegTerms?.eventName || terms?.eventName || "Terms snapshot unavailable" },
      { label: "Selection (as quoted)", value: firstLegTerms ? `${firstLegTerms.marketName} · ${firstLegTerms.selectionName}` : terms ? `${terms.marketName} · ${terms.selectionName}` : firstLeg?.selectionKey || "Terms snapshot unavailable" },
      { label: "Accepted", value: dateTime(wager.acceptedAt) },
      { label: "Created", value: dateTime(wager.createdAt) },
      { label: "Price snapshot", value: <Mono className="break-all">{firstLeg?.snapshotId ? `${shortId(firstLeg.snapshotId)}${acceptedLegs.length > 1 ? " (leg 1)" : ""}` : "Unavailable"}</Mono> },
      { label: "Policy", value: <Mono className="break-all">{firstLeg?.ruleVersion || wager.quote?.policyVersion || "—"}</Mono> },
      { label: "Terms hash", value: <code className="break-all font-mono text-xs">{wager.termsHash}</code> },
    ]} />
    <RecordList title="Legs" columns={["Leg", "Selection (as quoted)", "Odds / line", "Snapshot"]} rows={acceptedLegs.map((leg: any) => { const legTerm: any = legTermsByIndex.get(Number(leg.legIndex ?? 0)); return { id: leg.id, cells: [<span key="leg"><Mono>#{Number(leg.legIndex ?? 0) + 1}</Mono>{leg.live ? " · live" : ""}</span>, legTerm ? `${legTerm.eventName} · ${legTerm.marketName} · ${legTerm.selectionName}` : <Mono key="keys" className="break-all text-xs">{leg.eventKey} · {leg.marketKey} · {leg.selectionKey}</Mono>, <span key="odds"><Mono className="font-semibold text-foreground">{leg.decimalOdds}</Mono>{leg.line ? <Mono> · line {leg.line}</Mono> : null}{legTerm && legTerm.decimalOdds !== leg.decimalOdds ? <Mono className="block text-xs">quoted {legTerm.decimalOdds}</Mono> : null}</span>, <code key="snapshot" className="break-all font-mono text-xs">{leg.snapshotId || "—"}</code>] }; })} emptyTitle="No accepted legs" />
    {wager.from_WagerPart_wager.length ? <RecordList title="Parts" columns={["Part", "Combination", "Stake / odds", "Potential return"]} rows={wager.from_WagerPart_wager.map((part: any) => ({ id: part.id, status: part.status ?? undefined, cells: [<span key="part"><Mono>#{part.partIndex + 1}</Mono> · {String(part.status || "unknown").toLowerCase()}</span>, <code key="key" className="break-all font-mono text-xs">{part.combinationKey || "—"}</code>, <Mono key="stake">{money(part.stakeMinor, wager.currency)} @ {part.decimalOdds}</Mono>, <Mono key="return">{money(part.potentialReturnMinor, wager.currency)}</Mono>] }))} emptyTitle="No parts" /> : null}
    <RecordList title="Investigations" tone={openDisputes ? "wait" : undefined} columns={["Reference", "Category", "Resolution", "State"]} rows={wager.from_Dispute_wager.map((dispute: any) => ({ id: dispute.id, status: dispute.status ?? undefined, cells: [<Mono key="ref">{shortId(dispute.id)}</Mono>, dispute.category, dispute.resolution || "No resolution", String(dispute.status || "unknown").replaceAll("_", " ").toLowerCase()] }))} emptyTitle="No investigation" />
    <MutationForm title="Open investigation" mutation={investigateMutation} fields={[{ name: "wagerId", label: "Wager", type: "hidden", defaultValue: wager.id }, { name: "category", label: "Category", type: "select", options: [{ label: "Terms dispute", value: "TERMS" }, { label: "Acceptance decision", value: "ACCEPTANCE" }, { label: "Settlement", value: "SETTLEMENT" }, { label: "Integrity review", value: "INTEGRITY" }] }, { name: "reason", label: "Evidence-based reason", type: "textarea", placeholder: "Describe the discrepancy and evidence to review." }]} submitLabel="Open investigation" successMessage="Investigation opened." disabledReason={operator.capabilities.canManageRisk ? undefined : "Risk permission required."} />
    <section aria-labelledby="wager-acceptance" className="min-w-0 overflow-hidden rounded-xl border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3"><h2 id="wager-acceptance" className="text-sm font-semibold">Acceptance decision</h2>{decision ? <StatusBadge value={decision.accepted ? "ACCEPTED" : decision.rejectionCode || "REJECTED"} /> : null}</div>
      {decision ? <pre className="max-h-80 overflow-auto bg-muted/40 p-4 font-mono text-xs text-foreground">{jsonText(decision.gateResults)}</pre> : <p role="status" className="px-4 py-3 text-sm text-muted-foreground">No decision linked</p>}
    </section>
    <RecordList title="Settlement versions" columns={["Version", "Outcome", "Payout", "Created"]} rows={wager.from_Settlement_wager.map((settlement: any) => ({ id: settlement.id, cells: [<Mono key="v">v{settlement.version}</Mono>, settlement.outcome, <Mono key="payout">{money(settlement.payoutMinor, wager.currency)}</Mono>, dateTime(settlement.createdAt)] }))} emptyTitle="Not settled" />
    <RecordList title="Cash-out offers" columns={["Offer", "Amount", "Portion / fee", "Offered", "Acceptance"]} rows={offers.map((offer: any) => ({ id: offer.id, status: offer.status ?? undefined, cells: [<span key="offer"><Mono>{shortId(offer.id)}</Mono> · {String(offer.status || "unknown").toLowerCase()}</span>, <Mono key="amount" className="text-foreground">{money(offer.amountMinor, offer.currency || wager.currency)}</Mono>, <Mono key="portion">{portion(offer.portionNumerator, offer.portionDenominator)} · fee {money(offer.feeMinor || "0", offer.currency || wager.currency)}</Mono>, <span key="offered">{dateTime(offer.offeredAt || offer.createdAt)}{offer.expiresAt ? <span className="block text-xs">expires {dateTime(offer.expiresAt)}</span> : null}</span>, offerAcceptance(offer)] }))} emptyTitle="No cash-out offers" />
    <RecordList title="Exposure" columns={["Market", "Stake", "Liability", "Remaining stake / liability"]} rows={exposure.map((item: any) => ({ id: item.id, status: item.status ?? undefined, cells: [<span key="market">{item.market?.definition?.name || item.market?.definitionKey || "Market"}{item.market?.line ? <Mono> · {item.market.line}</Mono> : null}<span className="block text-xs font-normal text-muted-foreground">{item.market?.event?.name ? `${item.market.event.name} · ` : ""}{String(item.status || "unknown").replaceAll("_", " ").toLowerCase()}</span></span>, <Mono key="stake">{money(item.stakeMinor, wager.currency)}</Mono>, <Mono key="liability">{money(item.liabilityMinor, wager.currency)}</Mono>, <Mono key="remaining">{money(item.remainingStakeMinor, wager.currency)} / {money(item.remainingLiabilityMinor, wager.currency)}</Mono>] }))} emptyTitle="No exposure allocated" />
    {canSeeTax ? <RecordList title="Tax" columns={["Rule version", "Basis", "Amount", "Assessed"]} rows={taxAssessments.map((item: any) => { const identity = /^(.*):v(\d+):[^:]+$/.exec(item.ruleVersion || ""); return { id: item.id, status: item.status ?? undefined, cells: [<span key="rule" className="break-all">{identity ? `${identity[1]} v${identity[2]}` : item.ruleVersion || "—"} · {String(item.status || "unknown").toLowerCase()}</span>, <Mono key="basis">{money(item.basisMinor, item.currency || wager.currency)}</Mono>, <Mono key="amount" className="text-foreground">{money(item.amountMinor, item.currency || wager.currency)}</Mono>, dateTime(item.createdAt)] }; })} emptyTitle="Not assessed" emptyAction={<Track><PillLink size="sm" href="/dashboard/platform/finance/tax">Open Tax</PillLink></Track>} /> : null}
    <RecordList title="Cash-outs" columns={["Record", "Amount", "Effect", "Created"]} rows={wager.from_CashOutAcceptance_wager.map((item: any) => ({ id: item.id, cells: [<span key="record">{item.reversalOfId ? "Reversal of " : "Acceptance "}<Mono>{shortId(item.reversalOfId || item.id)}</Mono></span>, <Mono key="amount">{money(item.amountMinor, item.currency || wager.currency)}</Mono>, item.reversalOfId ? "Reversal posted" : reversedById.has(item.id) ? `Reversed by ${shortId(reversedById.get(item.id)!)}` : "Effective", dateTime(item.acceptedAt)] }))} emptyTitle="No cash-outs" />
  </OperatorShell>;
}
