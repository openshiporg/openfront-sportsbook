import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ExternalGateNotice, OperatorShell, TenantRequired } from "../components/OperatorShell";
import { Mono, StatusDot, type Tone } from "../components/kit";
import { MetricGrid, RecordList } from "../components/WorkflowUI";
import { dateTime, money, moneyTotals, shortId, sumByCurrency } from "../lib/format";
import { getOperatorContext, platformPrisma as prisma } from "../lib/operator";

const stateText = (value: string | null | undefined) => (value || "unknown").replaceAll("_", " ").toLowerCase();

type Queue = { label: string; count: number; href?: string; tone: Tone };

export async function OverviewScreen() {
  const operator = await getOperatorContext("canManageSportsbook");
  if (!operator) return <OperatorShell active="Overview" title="Control room"><TenantRequired /></OperatorShell>;
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
  const attention = pendingResults + (reconExceptions ?? 0) + (deadLetters ?? 0) + incidents;
  const queues: Queue[] = [
    { label: "Results pending", count: pendingResults, href: "/dashboard/platform/results", tone: pendingResults ? "wait" : "ok" },
    { label: "Open incidents", count: incidents, tone: incidents ? "alert" : "ok" },
    ...(deadLetters === null ? [] : [{ label: "Dead letters", count: deadLetters, href: "/dashboard/platform/recovery", tone: (deadLetters ? "alert" : "ok") as Tone }]),
    ...(reconExceptions === null ? [] : [{ label: "Recon exceptions", count: reconExceptions, tone: (reconExceptions ? "wait" : "ok") as Tone }]),
    { label: "Open markets", count: openMarkets, href: "/dashboard/platform/trading", tone: "info" },
  ];
  return <OperatorShell active="Overview" title="Control room" tone={attention ? "wait" : "ok"} meta={`${attention} need attention · ${openMarkets} open markets · ${wagers} wagers`} tenantName={operator.tenantName}>
    <section aria-labelledby="overview-queues" className="min-w-0 overflow-hidden rounded-xl border bg-card text-card-foreground">
      <h2 id="overview-queues" className="border-b px-4 py-3 text-sm font-semibold">{attention ? <StatusDot tone="wait" /> : <StatusDot tone="ok" />}Queues<span className="ml-2 font-mono text-xs font-normal tabular-nums text-muted-foreground">{attention}</span></h2>
      <ul className="divide-y">
        {queues.map((queue) => {
          const body = <>
            <span className="min-w-0 truncate text-sm font-medium"><StatusDot tone={queue.tone} />{queue.label}</span>
            <span className="flex shrink-0 items-center gap-2"><Mono className="text-base font-semibold">{queue.count}</Mono>{queue.href ? <ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" /> : <span className="size-4" aria-hidden="true" />}</span>
          </>;
          return <li key={queue.label}>{queue.href
            ? <Link href={queue.href} className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/40">{body}</Link>
            : <div className="flex items-center justify-between gap-3 px-4 py-3">{body}</div>}</li>;
        })}
      </ul>
    </section>
    <MetricGrid items={[
      { label: "Open liability", value: liability && exposure ? moneyTotals(liability) : "Restricted", detail: exposure ? `${exposure.length} positions · per currency` : "Risk access required", tone: exposure ? undefined : "off" },
      { label: "Open markets", value: openMarkets, tone: "info" },
      { label: "Wagers", value: wagers },
      { label: "Needs attention", value: attention, tone: attention ? "wait" : "ok" },
    ]} />
    {recent === null ? null : <RecordList title="Latest wagers" columns={["Reference", "Player", "Stake", "State"]} rows={recent.map((wager: any) => ({ id: wager.id, href: `/dashboard/platform/wagers/${wager.id}`, status: wager.status, cells: [<Mono key="ref">{shortId(wager.id)}</Mono>, wager.player?.subject || "Unknown player", <span key="stake"><Mono className="text-foreground">{money(wager.stakeMinor, wager.currency)}</Mono><span className="block text-xs">{dateTime(wager.createdAt)}</span></span>, stateText(wager.status)] }))} emptyTitle="No wagers" />}
    <ExternalGateNotice />
  </OperatorShell>;
}
