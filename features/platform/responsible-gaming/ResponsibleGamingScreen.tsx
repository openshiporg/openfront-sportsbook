import { MutationForm } from "../components/MutationForm";
import { OperatorShell, TenantRequired } from "../components/OperatorShell";
import { Mono, Pill, Track } from "../components/kit";
import { MetricGrid, RecordList, StatusBadge, WorkflowNote } from "../components/WorkflowUI";
import { dateTime, money, shortId, windowState } from "../lib/format";
import { getOperatorContext, platformPrisma as prisma } from "../lib/operator";
import type { PlatformSearchParams } from "../lib/paging";

const limitMutation = `mutation RGLimit($playerId:ID!,$type:String!,$period:String!,$amountMinor:String!,$currency:String!){setResponsibleGamingLimit(playerId:$playerId,type:$type,period:$period,amountMinor:$amountMinor,currency:$currency)}`;
const excludeMutation = `mutation Exclude($playerId:ID!,$scope:String!,$endsAt:String!){selfExclude(playerId:$playerId,scope:$scope,endsAt:$endsAt)}`;

export async function ResponsibleGamingScreen({ searchParams }: { searchParams?: PlatformSearchParams } = {}) {
  const rawSearch = (await searchParams)?.player;
  const playerSearch = (Array.isArray(rawSearch) ? rawSearch[0] : rawSearch ?? "").trim().slice(0, 100);
  const operator = await getOperatorContext("canManageCompliance");
  if (!operator) return <OperatorShell active="RG" title="Responsible gaming"><TenantRequired /></OperatorShell>;
  const now = new Date();
  // Player picker: a bounded, searchable candidate list. Search matches the full player ID or part of the subject,
  // so every player is reachable without loading the whole tenant.
  const playerWhere = { tenantId: operator.tenantId, ...(playerSearch ? { OR: [{ id: playerSearch }, { subject: { contains: playerSearch, mode: "insensitive" } }] } : {}) };
  const [players, playerTotal, limits, exclusions, restrictions, effectiveExclusions, currencies] = await Promise.all([
    prisma.player.findMany({ where: playerWhere, orderBy: [{ subject: "asc" }, { id: "asc" }], take: 50 }),
    prisma.player.count({ where: { tenantId: operator.tenantId } }),
    prisma.playerLimit.findMany({ where: { tenantId: operator.tenantId }, orderBy: { effectiveFrom: "desc" }, take: 100, include: { player: true } }),
    prisma.selfExclusion.findMany({ where: { tenantId: operator.tenantId }, orderBy: { startsAt: "desc" }, take: 100, include: { player: true } }),
    // Wager acceptance enforces any ACTIVE account restriction regardless of its dates, so the count matches that policy.
    prisma.accountRestriction.count({ where: { tenantId: operator.tenantId, status: "ACTIVE" } }),
    // Same effective window wager acceptance applies to self-exclusions.
    prisma.selfExclusion.count({ where: { tenantId: operator.tenantId, status: "ACTIVE", startsAt: { lte: now }, OR: [{ endsAt: null }, { endsAt: { gt: now } }] } }),
    prisma.tenantCurrency.findMany({ where: { tenantId: operator.tenantId, status: "ACTIVE" }, include: { currency: true } }),
  ]);
  const limitState = (limit: any) => limit.effectiveFrom && new Date(limit.effectiveFrom) > now ? "SCHEDULED" : limit.effectiveTo && new Date(limit.effectiveTo) <= now ? "ENDED" : "EFFECTIVE";
  const limitValue = (limit: any) => limit.type === "SESSION" ? `${limit.amountMinor} minutes` : money(limit.amountMinor, limit.currency);
  const canCompliance = operator.capabilities.canManageCompliance;
  const disabledReason = canCompliance ? undefined : "Your role does not include compliance capability.";
  const playerOptions = players.map((player: any) => ({ label: `${player.subject} · ${shortId(player.id)}`, value: player.id }));
  const periodOptions = ["DAILY", "WEEKLY", "MONTHLY"].map((value) => ({ label: value, value }));
  const inForce = exclusions.filter((item: any) => windowState(item, now) === "EFFECTIVE");
  const pastExclusions = exclusions.filter((item: any) => windowState(item, now) !== "EFFECTIVE");
  const pendingLimits = limits.filter((limit: any) => limitState(limit) === "SCHEDULED");
  const currentLimits = limits.filter((limit: any) => limitState(limit) === "EFFECTIVE");
  const endedLimits = limits.filter((limit: any) => limitState(limit) === "ENDED");
  const playerCell = (row: any) => <span key="player" className="break-all">{row.player?.subject || <Mono>{shortId(row.playerId || "Unknown")}</Mono>}</span>;
  const limitRow = (limit: any) => ({
    id: limit.id,
    href: limit.playerId ? `/dashboard/platform/customers/${limit.playerId}` : undefined,
    status: limitState(limit) === "EFFECTIVE" ? "ACTIVE" : limitState(limit),
    cells: [
      playerCell(limit),
      `${limit.type} · ${limit.period}`,
      <Mono key="limit">{limitValue(limit)}</Mono>,
      <span key="effective" className="flex flex-wrap items-center justify-end gap-x-2 gap-y-1 md:justify-start"><Mono className="text-xs">{dateTime(limit.effectiveFrom)}{limit.effectiveTo ? ` → ${dateTime(limit.effectiveTo)}` : ""}</Mono><StatusBadge value={limitState(limit)} /></span>,
    ],
  });
  const exclusionRow = (item: any) => ({
    id: item.id,
    href: item.playerId ? `/dashboard/platform/customers/${item.playerId}` : undefined,
    status: windowState(item, now) === "EFFECTIVE" ? "ACTIVE" : windowState(item, now),
    cells: [
      playerCell(item),
      item.scope,
      <Mono key="window" className="text-xs">{dateTime(item.startsAt)} → {item.endsAt ? dateTime(item.endsAt) : "indefinite"}</Mono>,
      <span key="state" className="flex flex-wrap items-center justify-end gap-2 md:justify-start"><StatusBadge value={windowState(item, now)} /><span className="text-xs text-muted-foreground">stored {item.status}</span></span>,
    ],
  });
  const limitColumns = ["Player", "Type / period", "Limit", "Effective"];
  const exclusionColumns = ["Player", "Scope", "Window", "Now / stored"];

  return <OperatorShell
    active="RG"
    title="Responsible gaming"
    tenantName={operator.tenantName}
    tone={effectiveExclusions || pendingLimits.length ? "wait" : "ok"}
    meta={`${effectiveExclusions} exclusions in force · ${pendingLimits.length} pending limits · ${restrictions} restrictions`}
  >
    <MetricGrid items={[
      { label: "Exclusions in force", value: effectiveExclusions, tone: effectiveExclusions ? "wait" : "ok" },
      { label: "Pending limits", value: pendingLimits.length, detail: "scheduled", tone: pendingLimits.length ? "wait" : "ok" },
      { label: "Restrictions", value: restrictions, detail: "active" },
      { label: "Limits", value: currentLimits.length, detail: `effective · newest ${limits.length}` },
    ]} />

    <RecordList title="Exclusions in force" tone={inForce.length ? "wait" : undefined} columns={exclusionColumns} rows={inForce.map(exclusionRow)} emptyTitle="No exclusions in force" />

    <div className="grid gap-4 xl:grid-cols-2">
      <RecordList title="Pending limit changes" tone={pendingLimits.length ? "wait" : undefined} columns={limitColumns} rows={pendingLimits.map(limitRow)} emptyTitle="No pending limit changes" />
      <RecordList title="Effective limits" columns={limitColumns} rows={currentLimits.map(limitRow)} emptyTitle="No effective limits" />
    </div>

    <section className="min-w-0 space-y-4">
      <form method="get" role="search" aria-label="Find player" className="flex flex-wrap items-center gap-2">
        <label htmlFor="rg-player-search" className="sr-only">Find player</label>
        <input id="rg-player-search" name="player" type="search" defaultValue={playerSearch} placeholder="Player reference or ID" className="h-9 min-w-0 flex-1 basis-56 rounded-full border bg-background px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
        <Track><Pill type="submit" size="sm" variant="primary">Find player</Pill></Track>
        <p className="w-full font-mono text-xs tabular-nums text-muted-foreground">{playerSearch ? `${players.length} matching “${playerSearch}” · max 50` : `${players.length} of ${playerTotal} players`}</p>
      </form>
      {players.length ? <div className="grid gap-4 xl:grid-cols-3">
        <MutationForm title="Set money limit" description="Deposit, stake or loss" requireReview mutation={limitMutation} fields={[{ name: "playerId", label: "Player", type: "select", options: playerOptions }, { name: "type", label: "Limit type", type: "select", options: ["DEPOSIT", "STAKE", "LOSS"].map((value) => ({ label: value, value })) }, { name: "period", label: "Period", type: "select", options: periodOptions }, { name: "amountMinor", label: "Amount (minor units of the currency)", type: "number", defaultValue: 10000 }, { name: "currency", label: "Currency", type: "select", options: currencies.map((item: any) => ({ label: `${item.currency?.code} (exponent ${item.currency?.exponent})`, value: item.currency?.code })) }]} submitLabel="Set money limit" successMessage="Responsible-gaming limit set." disabledReason={disabledReason} />
        <MutationForm title="Set session duration limit" requireReview mutation={limitMutation} fields={[{ name: "playerId", label: "Player", type: "select", options: playerOptions }, { name: "type", label: "Limit type", type: "hidden", defaultValue: "SESSION" }, { name: "period", label: "Period", type: "select", options: periodOptions }, { name: "amountMinor", label: "Duration (minutes)", type: "number", defaultValue: 60 }, { name: "currency", label: "Unit", type: "hidden", defaultValue: "MIN" }]} submitLabel="Set session limit" successMessage="Session duration limit set." disabledReason={disabledReason} />
        <MutationForm title="Self-exclude player" requireReview mutation={excludeMutation} fields={[{ name: "playerId", label: "Player", type: "select", options: playerOptions }, { name: "scope", label: "Scope", type: "select", options: [{ label: "All wagering", value: "ALL_WAGERING" }, { label: "All brands", value: "ALL_BRANDS" }] }, { name: "endsAt", label: "Ends at (optional)", type: "datetime-local", required: false, help: "Blank = indefinite" }]} submitLabel="Activate self-exclusion" successMessage="Self-exclusion activated." disabledReason={disabledReason} />
      </div> : <WorkflowNote title={playerSearch ? "No matching players" : "No players"} />}
    </section>

    <div className="grid gap-4 xl:grid-cols-2">
      <RecordList title="Scheduled & past exclusions" columns={exclusionColumns} rows={pastExclusions.map(exclusionRow)} emptyTitle="No other exclusions" />
      <RecordList title="Ended limits" columns={limitColumns} rows={endedLimits.map(limitRow)} emptyTitle="No ended limits" />
    </div>
  </OperatorShell>;
}
