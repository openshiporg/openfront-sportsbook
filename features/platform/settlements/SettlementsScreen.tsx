import { MutationForm } from "../components/MutationForm";
import { OperatorShell, TenantRequired } from "../components/OperatorShell";
import { MetricGrid, RecordList, StatusBadge } from "../components/WorkflowUI";
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
  if (!operator) return <OperatorShell active="Settlement" eyebrow="Settlement operations" title="Settlement and resettlement" description="Settle graded wagers and review corrections."><TenantRequired /></OperatorShell>;
  const [candidates, settlements, settlementTotal, approvalRows, cashOuts] = await Promise.all([
    prisma.wager.findMany({ where: { tenantId: operator.tenantId, status: { in: ["ACCEPTED", "OPEN", "PARTIALLY_CASHED_OUT", "GRADED"] }, from_Settlement_wager: { none: {} } }, orderBy: { acceptedAt: "asc" }, take: 20 }),
    prisma.settlement.findMany({ where: { tenantId: operator.tenantId }, orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: PLATFORM_PAGE_SIZE, skip: (page - 1) * PLATFORM_PAGE_SIZE, include: { wager: true, resultVersion: true } }),
    prisma.settlement.count({ where: { tenantId: operator.tenantId } }),
    prisma.approvalRequest.findMany({ where: { tenantId: operator.tenantId, OR: [{ action: { startsWith: "RESETTLE_WAGER:" } }, { action: { startsWith: "FULL_RESETTLEMENT:" } }, { action: { startsWith: "CASHOUT_CORRECTION:" } }] }, orderBy:{createdAt:'desc'}, take:100 }),
    prisma.cashOutAcceptance.findMany({where:{tenantId:operator.tenantId,status:{in:['ACCEPTED','REVERSED']}},orderBy:{acceptedAt:'desc'},take:100}),
  ]);
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
  return <OperatorShell active="Settlement" eyebrow="Settlement operations" title="Settlement and resettlement" description="Settle graded wagers and review corrections." tenantName={operator.tenantName}>
    <MetricGrid items={[{ label: "Ready", value: ready.length, detail: "Reviewed FULL STRAIGHT plans" }, { label: "Settlement versions", value: settlementTotal, detail: `Showing ${settlements.length} on page ${page}` }, { label: "Payouts on this page", value: payoutSummary, detail: incompletePayout ? "Incomplete evidence; not net payments" : "By currency; not net payments" }, { label: "Resettle approvals", value: pendingApprovals, detail: "Pending dual control" }]} />
    <RecordList title="Settlement ledger" description="Open a wager for journal and resettlement details." columns={["Wager", "Outcome", "Payout", "Version / state"]} rows={settlements.map((settlement: any) => ({ id: settlement.id, href: settlement.wagerId ? `/dashboard/platform/settlements/${settlement.wagerId}` : undefined, cells: [shortId(settlement.wagerId || settlement.id), <StatusBadge key="outcome" value={settlement.outcome} />, `${money(settlement.payoutMinor, settlement.wager?.currency)} · ${dateTime(settlement.createdAt)}`, `v${settlement.version} · ${settlement.reversalOfId ? "correction" : "original"}`] }))} emptyTitle="No settlements" emptyDescription="A wager must be accepted, independently resulted, and graded before settlement." emptyAction={<a href="/dashboard/platform/results" className="inline-flex rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted">Open Results</a>} pagination={{ page, pageSize: PLATFORM_PAGE_SIZE, total: settlementTotal, hrefForPage: (next) => hrefWith("/dashboard/platform/settlements", { page: next }) }} />
    <FullStraightSettlementActions key={`${operator.tenantId}:${operator.userId}`} tenantId={operator.tenantId} actorId={operator.userId} plans={ready} />
    <RecordList title="Not READY / other contracts" description="Exact backend readiness, not a first-leg or market-status inference. Legacy, expanded structure, cash-out, bonus and policy cases require their own reviewed execution plan." columns={["Wager", "Structure", "Required boundary"]} rows={readiness.filter(item => !item.plan).map(item => ({ id: item.wager.id, href: `/dashboard/platform/settlements/${item.wager.id}`, cells: [shortId(item.wager.id), item.wager.structure || "LEGACY", item.reason] }))} emptyTitle="No denied candidates" emptyDescription="All loaded candidates have an admitted reviewed plan." />
    {combinationCorrections.length > 0 ? <div className="grid gap-4 xl:grid-cols-2"><MutationForm compact title="Request combination resettlement" description="Existing non-STRAIGHT combination correction only. Reviewed FULL STRAIGHT corrections require a separately bound replacement plan and remain unavailable." mutation={`mutation($settlementId:ID!,$reason:String!){requestCombinationResettlement(settlementId:$settlementId,reason:$reason)}`} fields={[{name:'settlementId',label:'Settlement',type:'select',options:combinationCorrections.map((item:any)=>({label:`${shortId(item.id)} · wager ${shortId(item.wagerId)}`,value:item.id}))},{name:'reason',label:'Correction reason',placeholder:'Why this is needed and what you reviewed'}]} submitLabel="Request correction" successMessage="Combination correction approval requested."/><MutationForm compact title="Apply combination resettlement" description="Reverses the original journal, recomputes every part and posts a replacement." mutation={`mutation($settlementId:ID!,$approvalId:ID!,$idempotencyKey:String!){resettleCombinationWager(settlementId:$settlementId,approvalId:$approvalId,idempotencyKey:$idempotencyKey)}`} fields={[{name:'settlementId',label:'Original settlement',type:'select',options:combinationCorrections.map((item:any)=>({label:`${shortId(item.id)} · v${item.version}`,value:item.id}))},{name:'approvalId',label:'Approved request',type:'select',options:approvalRows.filter((item:any)=>item.status==='APPROVED'&&item.action.startsWith('FULL_RESETTLEMENT:')).map((item:any)=>({label:`${shortId(item.id)} · ${item.action}`,value:item.id}))},{name:'idempotencyKey',label:'Correction reference',defaultValue:'ui:full-resettle:key'}]} submitLabel="Post compensating resettlement" successMessage="Combination settlement corrected with reversal evidence."/></div> : <p className="text-sm text-muted-foreground">No generic combination correction candidates. FULL STRAIGHT corrections need an independently approved old-current/new-economic plan; that boundary remains unavailable.</p>}
    <div className="grid gap-4 xl:grid-cols-2"><MutationForm compact title="Request cash-out correction" description="Cash-out economics can only be reversed by an independent approval." mutation={`mutation($acceptanceId:ID!,$reason:String!){requestCashOutCorrection(acceptanceId:$acceptanceId,reason:$reason)}`} fields={[{name:'acceptanceId',label:'Cash-out acceptance',type:'select',options:activeCashOuts.map((item:any)=>({label:`${shortId(item.id)} · ${money(item.amountMinor,item.currency)}`,value:item.id}))},{name:'reason',label:'Correction reason',placeholder:'Why this is needed and what you reviewed'}]} submitLabel="Request reversal" successMessage="Cash-out correction approval requested."/><MutationForm compact title="Apply cash-out correction" description="Posts a linked reversal journal and reopens the wager under a new version." mutation={`mutation($acceptanceId:ID!,$approvalId:ID!,$idempotencyKey:String!){correctCashOut(acceptanceId:$acceptanceId,approvalId:$approvalId,idempotencyKey:$idempotencyKey)}`} fields={[{name:'acceptanceId',label:'Cash-out acceptance',type:'select',options:activeCashOuts.map((item:any)=>({label:`${shortId(item.id)} · ${money(item.amountMinor,item.currency)}`,value:item.id}))},{name:'approvalId',label:'Approved request',type:'select',options:approvalRows.filter((item:any)=>item.status==='APPROVED'&&item.action.startsWith('CASHOUT_CORRECTION:')).map((item:any)=>({label:`${shortId(item.id)} · ${item.action}`,value:item.id}))},{name:'idempotencyKey',label:'Correction reference',defaultValue:'ui:cashout-correction:key'}]} submitLabel="Post cash-out reversal" successMessage="Cash-out correction posted with compensating evidence."/></div>
  </OperatorShell>;
}
