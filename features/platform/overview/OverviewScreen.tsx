import Link from "next/link";
import { ExternalGateNotice, OperatorShell, TenantRequired } from "../components/OperatorShell";
import { MetricGrid, RecordList, StatusBadge, WorkflowNote } from "../components/WorkflowUI";
import { dateTime, money, moneyTotals, shortId, sumByCurrency } from "../lib/format";
import { getOperatorContext, platformPrisma as prisma } from "../lib/operator";

export async function OverviewScreen() {
  const operator = await getOperatorContext("canManageSportsbook");
  if (!operator) return <OperatorShell active="Overview" eyebrow="Operator overview" title="Sportsbook control room" description="Today’s queues, exceptions and shortcuts into each workflow."><TenantRequired /></OperatorShell>;
  const tenantId = operator.tenantId;
  // General operators see aggregate counts only; risk, finance and integration breakdowns and player-linked
  // wagers follow the same domain capabilities as their source records.
  const can = operator.capabilities;
  const [wagers, openMarkets, exposure, pendingResults, reconExceptions, deadLetters, incidents, recent] = await Promise.all([
    prisma.wager.count({ where: { tenantId } }),
    prisma.market.count({ where: { tenantId, status: "OPEN" } }),
    can.canManageRisk ? prisma.exposurePosition.findMany({ where: { tenantId }, select: { liabilityMinor: true, currency: true } }) : null,
    prisma.resultVersion.count({ where: { tenantId, status: "PENDING" } }),
    can.canManageFinance ? prisma.reconciliationItem.count({ where: { tenantId, status: "OPEN" } }) : null,
    can.canManageIntegrations ? prisma.deadLetter.count({ where: { tenantId, resolvedAt: null } }) : null,
    prisma.incident.count({ where: { tenantId, status: { not: "RESOLVED" } } }),
    can.canManageRisk ? prisma.wager.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" }, take: 5, include: { player: { select: { subject: true } } } }) : null,
  ]);
  const liability = exposure ? sumByCurrency(exposure, (item: any) => item.liabilityMinor, (item: any) => item.currency) : null;
  return <OperatorShell active="Overview" eyebrow="Operator overview" title="Sportsbook control room" description="Today’s queues, exceptions and shortcuts into each workflow." tenantName={operator.tenantName}>
    <MetricGrid items={[
      { label: "Wagers", value: wagers, detail: "All lifecycle states" },
      { label: "Open-status markets", value: openMarkets, detail: "Stored OPEN status; price freshness and event state are checked at quote time, not here" },
      { label: "Open liability", value: liability && exposure ? moneyTotals(liability) : "Risk access required", detail: exposure ? `Per currency · ${exposure.length} exposure projections` : "Shown to operators with risk permission" },
      { label: "Needs attention", value: pendingResults + (reconExceptions ?? 0) + (deadLetters ?? 0) + incidents, detail: `Results, incidents${reconExceptions === null ? "" : ", recon"}${deadLetters === null ? "" : ", queue"}` },
    ]} />
    <div className="grid gap-4 lg:grid-cols-3">
      {([
        ["Trading", `${openMarkets} open markets`, "/dashboard/platform/trading"],
        ["Results & grading", `${pendingResults} results await approval`, "/dashboard/platform/results"],
        deadLetters === null ? null : ["Recovery", `${deadLetters} unresolved dead letters`, "/dashboard/platform/recovery"],
      ].filter(Boolean) as string[][]).map(([label, detail, href]) => <Link key={label} href={href} className="rounded-xl border bg-card p-4 shadow-sm hover:border-ring"><p className="font-semibold">{label}</p><p className="mt-1 text-sm text-muted-foreground">{detail}</p><p className="mt-3 text-sm font-medium text-emerald-700 dark:text-emerald-400">Open workflow →</p></Link>)}
    </div>
    {recent === null ? null : <RecordList title="Recent wagers" description="Latest immutable wager receipts for this tenant." columns={["Reference", "Player", "Stake", "State"]} rows={recent.map((wager: any) => ({ id: wager.id, href: `/dashboard/platform/wagers/${wager.id}`, cells: [shortId(wager.id), wager.player?.subject || "Unknown player", `${money(wager.stakeMinor, wager.currency)} · ${dateTime(wager.createdAt)}`, <StatusBadge key="status" value={wager.status} />] }))} emptyTitle="No wagers have been recorded" emptyDescription="Accepted and rejected wagers will appear here." />}
    <WorkflowNote title="Exception totals are not health claims">A zero means no matching tenant records were found. It does not certify an upstream provider, regulator, backup, or worker.</WorkflowNote>
    <ExternalGateNotice />
  </OperatorShell>;
}
