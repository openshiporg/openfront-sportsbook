import { notFound } from "next/navigation";
import { MutationForm } from "../components/MutationForm";
import { OperatorShell, TenantRequired } from "../components/OperatorShell";
import { Mono } from "../components/kit";
import { DetailGrid, RecordList, StatusBadge, statusDotTone, WorkflowNote } from "../components/WorkflowUI";
import { dateTime, shortId } from "../lib/format";
import { getOperatorContext, platformPrisma as prisma } from "../lib/operator";

const priceMutation = `mutation Price($selectionId:ID!,$decimalOdds:String!,$line:String,$sequence:String!,$externalId:String!){ingestSandboxPrice(selectionId:$selectionId,decimalOdds:$decimalOdds,line:$line,sequence:$sequence,externalId:$externalId)}`;
const stateMutation = `mutation MarketState($marketId:ID!,$status:String!,$reason:String!,$expectedVersion:Int!,$expectedStatus:String!){setMarketStatus(marketId:$marketId,status:$status,reason:$reason,expectedVersion:$expectedVersion,expectedStatus:$expectedStatus)}`;

export async function TradingDetailScreen({ marketId }: { marketId: string }) {
  const operator = await getOperatorContext("canTrade");
  if (!operator) return <OperatorShell active="Trading" detail title="Market"><TenantRequired /></OperatorShell>;
  const market = await prisma.market.findFirst({ where: { id: marketId, tenantId: operator.tenantId }, include: { event: true, from_Selection_market: { include: { from_PriceSnapshot_selection: { orderBy: { receivedAt: "desc" }, take: 10 } } } } });
  if (!market) notFound();
  const changes = await prisma.tradingStatusChange.findMany({ where: { tenantId: operator.tenantId, scopeType: "MARKET", scopeId: market.id }, orderBy: { effectiveAt: "desc" }, take: 20 });
  const canTrade = operator.capabilities.canTrade;
  const denied = canTrade ? undefined : "Trading permission required.";
  const unpriced = market.from_Selection_market.filter((selection: any) => selection.from_PriceSnapshot_selection.length === 0).length;
  const lastChange: any = changes[0];
  return <OperatorShell active="Trading" detail title={market.event?.name || market.definitionKey} tone={statusDotTone(market.status)} meta={`${market.definitionKey} · ${(market.status || "unknown").toLowerCase()} · v${market.version ?? 1} · ${unpriced} unpriced`} tenantName={operator.tenantName}>
    {market.status === "SUSPENDED" ? <WorkflowNote title="Suspended" tone="warning">{lastChange?.reason ? `${lastChange.reason} · ${dateTime(lastChange.effectiveAt)}` : null}</WorkflowNote> : null}
    {market.status === "OPEN" && unpriced ? <WorkflowNote title={`${unpriced} selection${unpriced === 1 ? "" : "s"} unpriced`} tone="warning" /> : null}
    <RecordList title="Prices" tone={unpriced ? "alert" : undefined} columns={["Selection", "Price", "Sequence", "Received"]} rows={market.from_Selection_market.flatMap((selection: any) => selection.from_PriceSnapshot_selection.map((price: any) => ({ id: price.id, cells: [selection.label, <Mono key="price" className="font-semibold text-foreground">{price.decimalOdds}</Mono>, <Mono key="seq" className="break-all">{price.sequence}</Mono>, dateTime(price.receivedAt)] })))} emptyTitle="No prices" />
    <div className="grid gap-4 xl:grid-cols-2">
      <MutationForm title="Trading state" mutation={stateMutation} fields={[{ name: "marketId", label: "Market", type: "hidden", defaultValue: market.id }, { name: "expectedVersion", label: "Reviewed version", type: "hidden", defaultValue: market.version ?? 1, transform: "int" }, { name: "expectedStatus", label: "Reviewed state", type: "hidden", defaultValue: market.status }, { name: "status", label: "New state", type: "select", defaultValue: market.status === "OPEN" ? "SUSPENDED" : "OPEN", options: [{ label: "Open", value: "OPEN" }, { label: "Suspended", value: "SUSPENDED" }, { label: "Closed", value: "CLOSED" }] }, { name: "reason", label: "Reason", placeholder: "Price feed gap, event delay, or reviewed reopen" }]} submitLabel="Apply state change" successMessage="Market state changed and recorded." disabledReason={denied} />
      <MutationForm title="Enter price" description="Sandbox adapter" mutation={priceMutation} fields={[{ name: "selectionId", label: "Selection", type: "select", options: market.from_Selection_market.map((selection: any) => ({ label: `${selection.label} (${shortId(selection.id)})`, value: selection.id })) }, { name: "decimalOdds", label: "Decimal odds", defaultValue: "2.00" }, {name:'line',label:'Line / points',defaultValue:'',required:false,help:'Required for spread/total.'}, { name: "sequence", label: "Provider sequence", placeholder: "provider sequence or monotonic reference" }, { name: "externalId", label: "External message ID", placeholder: `operator:${market.id}:unique-reference` }]} submitLabel="Append price" successMessage="Price snapshot appended." disabledReason={denied} />
    </div>
    <DetailGrid items={[{ label: "Market", value: <Mono className="break-all">{market.definitionKey}</Mono> }, { label: "Market ID", value: <Mono className="break-all">{market.id}</Mono> }, { label: "Event state", value: <StatusBadge value={market.event?.status} /> }, { label: "Trading state", value: <StatusBadge value={market.status} /> }, { label: "Version", value: <Mono>{market.version ?? 1}</Mono> }, { label: "Selections", value: <Mono>{market.from_Selection_market.length}</Mono> }]} />
    <RecordList title="Status history" columns={["Transition", "Reason", "Source", "Effective"]} rows={changes.map((change: any) => ({ id: change.id, status: change.toStatus ?? undefined, cells: [`${change.fromStatus} → ${change.toStatus}`, change.reason, <span key="source">{change.source} · <Mono>{shortId(change.actorId || "system")}</Mono></span>, dateTime(change.effectiveAt)] }))} emptyTitle="No state changes" />
  </OperatorShell>;
}
