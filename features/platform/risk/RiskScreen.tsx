import { MutationForm } from "../components/MutationForm";
import { OperatorShell, TenantRequired } from "../components/OperatorShell";
import { Mono } from "../components/kit";
import { MetricGrid, RecordList, WorkflowNote } from "../components/WorkflowUI";
import { dateTime, money, moneyTotals, shortId } from "../lib/format";
import { getOperatorContext, platformPrisma as prisma } from "../lib/operator";

const limitMutation = `mutation RiskLimit($profileId:ID!,$scopeType:String!,$scopeId:String!,$maxStakeMinor:String!,$maxPayoutMinor:String!,$maxLiabilityMinor:String!,$currency:String!){createRiskLimit(profileId:$profileId,scopeType:$scopeType,scopeId:$scopeId,maxStakeMinor:$maxStakeMinor,maxPayoutMinor:$maxPayoutMinor,maxLiabilityMinor:$maxLiabilityMinor,currency:$currency)}`;

export async function RiskScreen() {
  const operator = await getOperatorContext("canManageRisk");
  if (!operator) return <OperatorShell active="Risk" title="Risk"><TenantRequired /></OperatorShell>;
  // liabilityMinor is stored as exact integer text, so rank, total and count in SQL numerically
  // (never lexicographically) before the 100-row worklist limit, with a stable id tie-break.
  const [rankedExposure, liabilityTotals, profiles, rules, correlationGroups, correlationRules] = await Promise.all([
    prisma.$queryRaw`SELECT id FROM "ExposurePosition" WHERE tenant = ${operator.tenantId} ORDER BY CAST(NULLIF("liabilityMinor", '') AS NUMERIC) DESC NULLS LAST, id ASC LIMIT 100` as Promise<{ id: string }[]>,
    prisma.$queryRaw`SELECT currency, CAST(SUM(CAST(NULLIF("liabilityMinor", '') AS NUMERIC)) AS TEXT) AS "liabilityMinor", COUNT(*)::int AS "count" FROM "ExposurePosition" WHERE tenant = ${operator.tenantId} GROUP BY currency` as Promise<{ currency: string; liabilityMinor: string | null; count: number }[]>,
    prisma.limitProfile.findMany({ where: { tenantId: operator.tenantId }, orderBy: { version: "desc" } }),
    prisma.limitRule.findMany({ where: { tenantId: operator.tenantId }, orderBy: [{ priority: "desc" }, { createdAt: "desc" }], take: 100, include: { profile: true } }),
    prisma.correlationGroup.findMany({where:{tenantId:operator.tenantId},orderBy:{version:'desc'},take:100}),
    prisma.correlationRule.findMany({where:{tenantId:operator.tenantId},orderBy:{priority:'desc'},take:200,include:{group:true}}),
  ]);
  const [scopeMarkets, scopeEvents, scopePlayers, limitCurrencies] = await Promise.all([
    prisma.market.findMany({ where: { tenantId: operator.tenantId, status: { in: ["OPEN", "SUSPENDED"] } }, orderBy: { createdAt: "desc" }, take: 100, include: { event: true } }),
    prisma.event.findMany({ where: { tenantId: operator.tenantId, status: { in: ["SCHEDULED", "LIVE"] } }, orderBy: { startAt: "asc" }, take: 100 }),
    prisma.player.findMany({ where: { tenantId: operator.tenantId, status: "ACTIVE" }, orderBy: { subject: "asc" }, take: 200 }),
    prisma.tenantCurrency.findMany({ where: { tenantId: operator.tenantId, status: "ACTIVE" }, include: { currency: true } }),
  ]);
  const exposureRows = rankedExposure.length ? await prisma.exposurePosition.findMany({ where: { tenantId: operator.tenantId, id: { in: rankedExposure.map((row) => row.id) } } }) : [];
  const exposureById = new Map(exposureRows.map((row: any) => [row.id, row]));
  const exposure: any[] = rankedExposure.map((row) => exposureById.get(row.id)).filter(Boolean);
  const exposureCount = liabilityTotals.reduce((sum, row) => sum + Number(row.count), 0);
  const marketIds = exposure.filter((item: any) => item.scopeType === "MARKET").map((item: any) => item.scopeId);
  const markets = marketIds.length ? await prisma.market.findMany({ where: { tenantId: operator.tenantId, id: { in: marketIds } }, include: { event: true } }) : [];
  const marketById = new Map(markets.map((market: any) => [market.id, market]));
  const totalLiability = new Map(liabilityTotals.filter((row) => row.liabilityMinor !== null).map((row) => [row.currency, BigInt(row.liabilityMinor as string)]));
  // Largest position per currency: different currencies are never compared as one unit.
  const largestByCurrency = new Map<string, any>();
  for (const item of exposure) if (item.liabilityMinor && !largestByCurrency.has(item.currency)) largestByCurrency.set(item.currency, item);
  const largest = [...largestByCurrency.values()];
  const activeProfile = profiles.find((profile: any) => profile.status === "ACTIVE");
  const activeGroups = correlationGroups.filter((item: any) => item.status === 'ACTIVE').length;
  return <OperatorShell active="Risk" title="Risk" tone={activeProfile ? (exposureCount ? "info" : "ok") : "wait"} meta={`${exposureCount} positions · ${rules.length} limit rules · profile ${activeProfile ? `v${activeProfile.version}` : "none"}`} tenantName={operator.tenantName}>
    <MetricGrid items={[
      { label: "Total liability", value: moneyTotals(totalLiability), detail: `${exposureCount} positions · per currency` },
      { label: "Largest position", value: largest.length ? largest.map((item: any) => money(item.liabilityMinor, item.currency)).join(" · ") : "—", detail: largest.length ? largest.map((item: any) => `${item.scopeType} · ${shortId(item.scopeId)}`).join(" · ") : undefined },
      { label: "Limit rules", value: rules.length, detail: `${profiles.length} profiles · ${activeGroups} corr. groups` },
      { label: "Active profile", value: activeProfile ? `v${activeProfile.version}` : "None", detail: activeProfile?.name || undefined, tone: activeProfile ? "ok" : "wait" },
    ]} />
    <RecordList title="Liability" description={exposure.length < exposureCount ? <Mono>top {exposure.length} of {exposureCount}</Mono> : undefined} columns={["Scope", "Liability", "Stake", "As of"]} rows={exposure.map((item: any) => { const market: any = marketById.get(item.scopeId); return { id: item.id, href: market ? `/dashboard/platform/trading/${market.id}` : undefined, cells: [market ? <span key="scope">{market.event?.name || "Event"}<Mono className="mt-1 block break-all text-xs text-muted-foreground">{market.definitionKey}</Mono></span> : <span key="scope">{item.scopeType}<Mono className="mt-1 block break-all text-xs text-muted-foreground">{shortId(item.scopeId)}</Mono></span>, <Mono key="liability" className="font-semibold text-foreground">{money(item.liabilityMinor, item.currency)}</Mono>, <Mono key="stake">{money(item.stakeMinor, item.currency)}</Mono>, dateTime(item.asOf)] }; })} emptyTitle="No exposure" />
    {activeProfile ? <MutationForm title="Add risk limit" description="Active profile" mutation={limitMutation} fields={[{ name: "profileId", label: "Profile", type: "hidden", defaultValue: activeProfile.id }, { name: "scopeType", label: "Scope type", type: "select", options: [{ label: "Tenant", value: "TENANT" }, { label: "Market", value: "MARKET" }, { label: "Event", value: "EVENT" }, { label: "Player", value: "PLAYER" }] }, { name: "scopeId", label: "Scope target", type: "select", required: false, help: "Must match scope type.", options: [{ label: "Tenant (no target)", value: "" }, ...scopeMarkets.map((market: any) => ({ label: `Market · ${market.event?.name || "Event"} · ${market.definitionKey}`, value: market.id })), ...scopeEvents.map((event: any) => ({ label: `Event · ${event.name}`, value: event.id })), ...scopePlayers.map((player: any) => ({ label: `Player · ${player.subject}`, value: player.id }))] }, { name: "maxStakeMinor", label: "Max stake (minor units)", type: "number", defaultValue: 100000 }, { name: "maxPayoutMinor", label: "Max payout (minor units)", type: "number", defaultValue: 500000 }, { name: "maxLiabilityMinor", label: "Max liability (minor units)", type: "number", defaultValue: 1000000 }, { name: "currency", label: "Currency", type: "select", options: limitCurrencies.map((item: any) => ({ label: `${item.currency?.code} (exponent ${item.currency?.exponent})`, value: item.currency?.code })) }]} submitLabel="Add limit rule" successMessage="Risk limit added." disabledReason={operator.capabilities.canManageRisk ? undefined : "Risk permission required."} /> : <WorkflowNote title="No active limit profile" tone="warning" />}
    <RecordList title="Limit rules" columns={["Profile", "Scope", "Stake / payout", "Liability"]} rows={rules.map((rule: any) => ({ id: rule.id, cells: [<span key="profile">{rule.profile?.name || "Unknown profile"}<Mono className="block text-xs text-muted-foreground">priority {rule.priority ?? "—"}</Mono></span>, <span key="scope">{rule.scopeType}{rule.scopeId ? <Mono className="block break-all text-xs">{shortId(rule.scopeId)}</Mono> : null}</span>, <Mono key="stake">{money(rule.maxStakeMinor, rule.currency)} / {money(rule.maxPayoutMinor, rule.currency)}</Mono>, <Mono key="liability">{money(rule.maxLiabilityMinor, rule.currency)}</Mono>] }))} emptyTitle="No limit rules" />
    <RecordList title="Correlation rules" columns={['Group','Patterns','Decision','Priority']} rows={correlationRules.map((rule:any)=>({id:rule.id,cells:[rule.group?.name??'Unknown',<span key="patterns" className="break-all tabular-nums text-xs">{JSON.stringify(rule.leftPattern)} ↔ {JSON.stringify(rule.rightPattern)}</span>,rule.decision,<Mono key="priority">{rule.priority}</Mono>]}))} emptyTitle="No correlation rules" emptyDescription="Same-event combinations denied"/>
    <div className="grid gap-4 xl:grid-cols-2"><MutationForm compact title="Request correlation rule" mutation={`mutation($groupKey:String!,$sportKey:String!,$leftMarketId:ID!,$rightMarketId:ID!,$decision:String!,$reason:String!){requestCorrelationRule(groupKey:$groupKey,sportKey:$sportKey,leftMarketId:$leftMarketId,rightMarketId:$rightMarketId,decision:$decision,reason:$reason)}`} fields={[{name:'groupKey',label:'Group key',defaultValue:'same-event-reviewed'},{name:'sportKey',label:'Sport key',defaultValue:'football'},{name:'leftMarketId',label:'First market ID'},{name:'rightMarketId',label:'Second market ID'},{name:'decision',label:'Decision',type:'select',options:['ALLOW','DENY','PROVIDER_PRICE_REQUIRED'].map(value=>({label:value,value}))},{name:'reason',label:'Reason',placeholder:'Why this is needed and what you reviewed'}]} submitLabel="Request approval" successMessage="Correlation approval requested."/><MutationForm compact title="Apply approved correlation rule" mutation={`mutation($groupKey:String!,$sportKey:String!,$leftMarketId:ID!,$rightMarketId:ID!,$decision:String!,$approvalId:ID!){applyCorrelationRule(groupKey:$groupKey,sportKey:$sportKey,leftMarketId:$leftMarketId,rightMarketId:$rightMarketId,decision:$decision,approvalId:$approvalId)}`} fields={[{name:'groupKey',label:'Exact group key'},{name:'sportKey',label:'Exact sport key'},{name:'leftMarketId',label:'First market ID'},{name:'rightMarketId',label:'Second market ID'},{name:'decision',label:'Exact decision',type:'select',options:['ALLOW','DENY','PROVIDER_PRICE_REQUIRED'].map(value=>({label:value,value}))},{name:'approvalId',label:'Approved request ID'}]} submitLabel="Apply rule" successMessage="Correlation rule activated and audited."/></div>
  </OperatorShell>;
}
