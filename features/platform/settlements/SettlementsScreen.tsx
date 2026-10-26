import { MutationForm } from "../components/MutationForm";
import { OperatorShell, TenantRequired } from "../components/OperatorShell";
import { Mono, PillLink, Track } from "../components/kit";
import { MetricGrid, RecordList, StatusBadge, WorkflowNote } from "../components/WorkflowUI";
import { dateTime, money, shortId } from "../lib/format";
import { getOperatorContext, platformPrisma as prisma } from "../lib/operator";
import { keystoneClient } from "@/features/dashboard/lib/keystoneClient";
import type { FullStraightPlan } from "@/features/sportsbook/settlement/full-straight";
import { STRAIGHT_PLAN_QUERY } from "./settlement-intent";
import { FullStraightSettlementActions } from "./FullStraightSettlementActions";
import { hrefWith, pageFrom, PLATFORM_PAGE_SIZE, type PlatformSearchParams } from "../lib/paging";

export async function SettlementsScreen({ searchParams }: { searchParams?: PlatformSearchParams } = {}) {
  const page = pageFrom((await searchParams) ?? {});
  const operator = await getOperatorContext("canManageRisk");
  if (!operator) return <OperatorShell active="Settlement" title="Settlement"><TenantRequired /></OperatorShell>;
  const [candidates, settlements, settlementTotal, approvalRows, cashOuts, runRows] = await Promise.all([
    prisma.wager.findMany({ where: { tenantId: operator.tenantId, status: { in: ["ACCEPTED", "OPEN", "PARTIALLY_CASHED_OUT", "GRADED"] }, from_Settlement_wager: { none: {} } }, orderBy: { acceptedAt: "asc" }, take: 20 }),
    prisma.settlement.findMany({ where: { tenantId: operator.tenantId }, orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: PLATFORM_PAGE_SIZE, skip: (page - 1) * PLATFORM_PAGE_SIZE, include: { wager: true, resultVersion: true } }),
    prisma.settlement.count({ where: { tenantId: operator.tenantId } }),
    prisma.approvalRequest.findMany({ where: { tenantId: operator.tenantId, OR: [{ action: { startsWith: "RESETTLE_WAGER:" } }, { action: { startsWith: "FULL_RESETTLEMENT:" } }, { action: { startsWith: "CASHOUT_CORRECTION:" } }] }, orderBy:{createdAt:'desc'}, take:100 }),
    prisma.cashOutAcceptance.findMany({where:{tenantId:operator.tenantId,status:{in:['ACCEPTED','REVERSED']}},orderBy:{acceptedAt:'desc'},take:100}),
    prisma.settlementRun.findMany({ where: { tenantId: operator.tenantId }, orderBy: [{ startedAt: "desc" }, { id: "desc" }], take: 25, include: { resultVersion: { select: { version: true, event: { select: { name: true } } } } } }),
  ]);
  // Failed and running runs lead; ties keep newest-first.
  const runRank: Record<string, number> = { FAILED: 0, RUNNING: 1, PENDING: 2 };
  const runs = runRows.map((run: any, index: number) => ({ run, index })).sort((a: any, b: any) => (runRank[a.run.status] ?? 3) - (runRank[b.run.status] ?? 3) || a.index - b.index).map(({ run }: any) => run);
  const failedRuns = runs.filter((run: any) => run.status === "FAILED").length;
  const reversedAcceptanceIds = new Set(cashOuts.flatMap((item: any) => item.status === 'REVERSED' && item.reversalOfId ? [item.reversalOfId] : []));
  const activeCashOuts = cashOuts.filter((item: any) => item.status === 'ACCEPTED' && !reversedAcceptanceIds.has(item.id));
  const readiness = await Promise.all(candidates.map(async (wager: any) => {
    try {
      const response = await keystoneClient<{ fullStraightSettlementPlan: string }>(STRAIGHT_PLAN_QUERY, { wagerId: wager.id });
      if (!response.success) throw new Error(response.error);
      const plan = JSON.parse(response.data.fullStraightSettlementPlan) as FullStraightPlan;
      if (plan.state !== "READY" || plan.wagerId !== wager.id || plan.tenantId !== operator.tenantId) throw new Error("SETTLEMENT_PLAN_SCOPE_CHANGED");
      return { wager, plan, reason: null };
    }
    catch (error) { const reason = error instanceof Error ? /^([A-Z][A-Z0-9_:]+)(?:\s|$)/.exec(error.message)?.[1] ?? "SETTLEMENT_PLAN_UNAVAILABLE" : "SETTLEMENT_PLAN_UNAVAILABLE"; return { wager, plan: null, reason }; }
  }));
  const ready = readiness.flatMap(item => item.plan ? [item.plan] : []);
  const combinationCorrections = settlements.filter((item: any) => item.wager?.structure && item.wager.structure !== 'STRAIGHT');
  const pendingApprovals=approvalRows.filter((item:any)=>item.status==='PENDING').length;
  const payoutByCurrency = new Map<string, bigint>();
  let incompletePayout = false;
  for (const settlement of settlements) {
    const currency = settlement.wager?.currency;
    if (!currency || !/^\d+$/.test(settlement.payoutMinor)) { incompletePayout = true; continue; }
    payoutByCurrency.set(currency, (payoutByCurrency.get(currency) || 0n) + BigInt(settlement.payoutMinor));
  }
  const payoutSummary = [...payoutByCurrency].map(([currency, amount]) => `${amount} minor ${currency}`).join(" · ") || "No amount evidence";
  const notReady = readiness.filter(item => !item.plan);
  return <OperatorShell active="Settlement" title="Settlement" tone={ready.length || pendingApprovals ? "wait" : "ok"} meta={`${ready.length} ready · ${notReady.length} not ready · ${pendingApprovals} approvals pending`} tenantName={operator.tenantName}>
    <MetricGrid items={[
      { label: "Ready", value: ready.length, detail: "Full straight", tone: ready.length ? "wait" : "ok" },
      { label: "Not ready", value: notReady.length, detail: `of ${candidates.length} oldest`, tone: notReady.length ? "alert" : undefined },
      { label: "Resettle approvals", value: pendingApprovals, detail: "pending", tone: pendingApprovals ? "wait" : undefined },
      { label: "Payouts on page", value: payoutSummary, detail: incompletePayout ? "incomplete · not net" : "by currency · not net", tone: incompletePayout ? "alert" : undefined },
    ]} />
    <FullStraightSettlementActions key={`${operator.tenantId}:${operator.userId}`} tenantId={operator.tenantId} actorId={operator.userId} plans={ready} />
    <RecordList title="Not ready" tone={notReady.length ? "alert" : undefined} columns={["Wager", "Structure", "Blocked by"]} rows={notReady.map(item => ({ id: item.wager.id, href: `/dashboard/platform/settlements/${item.wager.id}`, cells: [<Mono key="wager">{shortId(item.wager.id)}</Mono>, item.wager.structure || "LEGACY", <Mono key="reason" className="break-all text-xs">{item.reason}</Mono>] }))} emptyTitle="No blocked candidates" />
    <RecordList title="Ledger" columns={["Wager", "Outcome", "Payout", "Version"]} rows={settlements.map((settlement: any) => ({ id: settlement.id, href: settlement.wagerId ? `/dashboard/platform/settlements/${settlement.wagerId}` : undefined, cells: [<Mono key="wager">{shortId(settlement.wagerId || settlement.id)}</Mono>, <StatusBadge key="outcome" value={settlement.outcome} />, <span key="payout"><Mono className="text-foreground">{money(settlement.payoutMinor, settlement.wager?.currency)}</Mono><span className="block text-xs">{dateTime(settlement.createdAt)}</span></span>, <span key="version"><Mono>v{settlement.version}</Mono> · {settlement.reversalOfId ? "correction" : "original"}</span>] }))} emptyTitle="No settlements" emptyAction={<Track><PillLink size="sm" href="/dashboard/platform/results">Open Results</PillLink></Track>} pagination={{ page, pageSize: PLATFORM_PAGE_SIZE, total: settlementTotal, hrefForPage: (next) => hrefWith("/dashboard/platform/settlements", { page: next }) }} />
    <RecordList title="Runs" tone={failedRuns ? "alert" : undefined} columns={["Event", "Trigger", "Wagers settled", "Started", "Completed"]} rows={runs.map((run: any) => ({ id: run.id, status: run.status ?? undefined, cells: [<span key="event">{run.resultVersion?.event?.name || "Event unavailable"}<span className="block text-xs font-normal text-muted-foreground">result <Mono>v{run.resultVersion?.version ?? "—"}</Mono> · {String(run.status || "unknown").toLowerCase()}</span>{run.status === "FAILED" && run.errorSummary ? <Mono className="block break-all text-xs font-normal text-red-600 dark:text-red-400">{run.errorSummary}</Mono> : null}</span>, String(run.triggerType || "—").replaceAll("_", " ").toLowerCase(), <Mono key="counts">{run.wagersSettled ?? 0} / {run.wagersConsidered ?? 0}</Mono>, dateTime(run.startedAt), dateTime(run.completedAt)] }))} emptyTitle="No settlement runs" />
    <section aria-labelledby="settlement-corrections" className="space-y-3">
      <h2 id="settlement-corrections" className="text-sm font-semibold">Corrections</h2>
      {combinationCorrections.length > 0 ? <div className="grid gap-4 xl:grid-cols-2"><MutationForm compact title="Request combination resettlement" description="Non-STRAIGHT only" mutation={`mutation($settlementId:ID!,$reason:String!){requestCombinationResettlement(settlementId:$settlementId,reason:$reason)}`} fields={[{name:'settlementId',label:'Settlement',type:'select',options:combinationCorrections.map((item:any)=>({label:`${shortId(item.id)} · wager ${shortId(item.wagerId)}`,value:item.id}))},{name:'reason',label:'Correction reason',placeholder:'Why this is needed and what you reviewed'}]} submitLabel="Request correction" successMessage="Combination correction approval requested."/><MutationForm compact title="Apply combination resettlement" mutation={`mutation($settlementId:ID!,$approvalId:ID!,$idempotencyKey:String!){resettleCombinationWager(settlementId:$settlementId,approvalId:$approvalId,idempotencyKey:$idempotencyKey)}`} fields={[{name:'settlementId',label:'Original settlement',type:'select',options:combinationCorrections.map((item:any)=>({label:`${shortId(item.id)} · v${item.version}`,value:item.id}))},{name:'approvalId',label:'Approved request',type:'select',options:approvalRows.filter((item:any)=>item.status==='APPROVED'&&item.action.startsWith('FULL_RESETTLEMENT:')).map((item:any)=>({label:`${shortId(item.id)} · ${item.action}`,value:item.id}))},{name:'idempotencyKey',label:'Correction reference',defaultValue:'ui:full-resettle:key'}]} submitLabel="Post compensating resettlement" successMessage="Combination settlement corrected with reversal evidence."/></div> : <WorkflowNote title="No combination corrections">FULL STRAIGHT corrections unavailable</WorkflowNote>}
      <div className="grid gap-4 xl:grid-cols-2"><MutationForm compact title="Request cash-out correction" mutation={`mutation($acceptanceId:ID!,$reason:String!){requestCashOutCorrection(acceptanceId:$acceptanceId,reason:$reason)}`} fields={[{name:'acceptanceId',label:'Cash-out acceptance',type:'select',options:activeCashOuts.map((item:any)=>({label:`${shortId(item.id)} · ${money(item.amountMinor,item.currency)}`,value:item.id}))},{name:'reason',label:'Correction reason',placeholder:'Why this is needed and what you reviewed'}]} submitLabel="Request reversal" successMessage="Cash-out correction approval requested."/><MutationForm compact title="Apply cash-out correction" mutation={`mutation($acceptanceId:ID!,$approvalId:ID!,$idempotencyKey:String!){correctCashOut(acceptanceId:$acceptanceId,approvalId:$approvalId,idempotencyKey:$idempotencyKey)}`} fields={[{name:'acceptanceId',label:'Cash-out acceptance',type:'select',options:activeCashOuts.map((item:any)=>({label:`${shortId(item.id)} · ${money(item.amountMinor,item.currency)}`,value:item.id}))},{name:'approvalId',label:'Approved request',type:'select',options:approvalRows.filter((item:any)=>item.status==='APPROVED'&&item.action.startsWith('CASHOUT_CORRECTION:')).map((item:any)=>({label:`${shortId(item.id)} · ${item.action}`,value:item.id}))},{name:'idempotencyKey',label:'Correction reference',defaultValue:'ui:cashout-correction:key'}]} submitLabel="Post cash-out reversal" successMessage="Cash-out correction posted with compensating evidence."/></div>
    </section>
  </OperatorShell>;
}
