import { OperatorShell, TenantRequired } from "../components/OperatorShell";
import { Mono, PillLink, Track } from "../components/kit";
import { MetricGrid, RecordList, StatusBadge } from "../components/WorkflowUI";
import { dateTime, shortId } from "../lib/format";
import { getOperatorContext, platformPrisma as prisma } from "../lib/operator";
import { allowedParam, hrefWith, pageFrom, PLATFORM_PAGE_SIZE, type PlatformSearchParams } from "../lib/paging";

const basePath = "/dashboard/platform/closures";
const tracks = ["open", "closed", "cancelled", "all"] as const;
type ClosureTrack = (typeof tracks)[number];
const trackLabels: Record<ClosureTrack, string> = { open: "Open", closed: "Closed", cancelled: "Cancelled", all: "All" };
const OPEN_STATUSES = ["REQUESTED", "REVIEW", "BLOCKED_FUNDS"] as const;
// Same open sets the customer closure check uses (features/sportsbook/customer/account.ts).
const OPEN_WAGER_STATUSES = ["PENDING", "DELAYED", "ACCEPTED", "OPEN", "PARTIALLY_CASHED_OUT", "GRADED"];
const UNRESOLVED_PAYMENT_STATUSES = ["PENDING", "REVIEW", "PROCESSING", "UNKNOWN"];

// Each track is an ordered list of status segments; BLOCKED_FUNDS always pages first.
const segmentsFor: Record<ClosureTrack, string[][]> = {
  open: [["BLOCKED_FUNDS"], ["REQUESTED", "REVIEW"]],
  closed: [["CLOSED"]],
  cancelled: [["CANCELLED"]],
  all: [["BLOCKED_FUNDS"], ["REQUESTED", "REVIEW"], ["CLOSED"], ["CANCELLED"]],
};

function nonZero(value: string | null | undefined) {
  const text = value || "0";
  if (!/^-?\d+$/.test(text)) return true;
  return BigInt(text) !== 0n;
}

/** Closure requests and what blocks them: blocked funds first, then open requests, then history. */
export async function ClosuresScreen({ searchParams }: { searchParams?: PlatformSearchParams } = {}) {
  const params = (await searchParams) ?? {};
  const page = pageFrom(params);
  const track: ClosureTrack = allowedParam(params, "status", tracks) ?? "open";
  const operator = await getOperatorContext("canManageCompliance");
  if (!operator) return <OperatorShell active="Closures" title="Account closures"><TenantRequired /></OperatorShell>;
  const tenantId = operator.tenantId;
  const now = new Date();

  const segments = segmentsFor[track];
  const [grouped, coolingDue, ...segmentCounts] = await Promise.all([
    prisma.accountClosure.groupBy({ by: ["status"], where: { tenantId }, _count: { _all: true } }),
    prisma.accountClosure.count({ where: { tenantId, status: { in: [...OPEN_STATUSES] }, coolingEndsAt: { lte: now } } }),
    ...segments.map((statuses) => prisma.accountClosure.count({ where: { tenantId, status: { in: statuses } } })),
  ]);
  const byStatus = new Map<string, number>(grouped.map((row: any) => [String(row.status), Number(row._count?._all ?? 0)]));
  const count = (status: string) => byStatus.get(status) ?? 0;
  const total = (segmentCounts as number[]).reduce((sum, value) => sum + value, 0);

  // Page across the ordered segments without loading more than one page.
  let skip = (page - 1) * PLATFORM_PAGE_SIZE;
  let remaining = PLATFORM_PAGE_SIZE;
  const reads: Promise<any[]>[] = [];
  segments.forEach((statuses, index) => {
    const size = (segmentCounts as number[])[index];
    if (remaining <= 0) return;
    if (skip >= size) { skip -= size; return; }
    const take = Math.min(remaining, size - skip);
    reads.push(prisma.accountClosure.findMany({ where: { tenantId, status: { in: statuses } }, orderBy: [{ requestedAt: statuses.includes("CLOSED") || statuses.includes("CANCELLED") ? "desc" : "asc" }, { id: "asc" }], skip, take, include: { player: { select: { id: true, subject: true } } } }));
    remaining -= take;
    skip = 0;
  });
  const closures = (await Promise.all(reads)).flat();

  // Blockers computed from readable records for open requests on this page: balances, open wagers, unresolved payments.
  const openPlayerIds = [...new Set(closures.filter((item: any) => (OPEN_STATUSES as readonly string[]).includes(item.status) && item.playerId).map((item: any) => item.playerId as string))];
  const blockersByPlayer = new Map<string, string[]>();
  if (openPlayerIds.length) {
    const [accounts, wagers, payments] = await Promise.all([
      prisma.ledgerAccount.findMany({ where: { tenantId, playerId: { in: openPlayerIds } }, select: { id: true, playerId: true, key: true } }),
      prisma.wager.groupBy({ by: ["playerId"], where: { tenantId, playerId: { in: openPlayerIds }, status: { in: OPEN_WAGER_STATUSES } }, _count: { _all: true } }),
      prisma.paymentIntent.groupBy({ by: ["playerId"], where: { tenantId, playerId: { in: openPlayerIds }, status: { in: UNRESOLVED_PAYMENT_STATUSES } }, _count: { _all: true } }),
    ]);
    const projections = accounts.length ? await prisma.balanceProjection.findMany({ where: { tenantId, accountId: { in: accounts.map((account: any) => account.id) } }, orderBy: [{ accountId: "asc" }, { version: "desc" }], distinct: ["accountId"] }) : [];
    const projectionByAccount = new Map<string, any>(projections.map((projection: any) => [projection.accountId, projection]));
    for (const playerId of openPlayerIds) {
      const labels: string[] = [];
      const owned = accounts.filter((account: any) => account.playerId === playerId);
      if (owned.some((account: any) => !projectionByAccount.has(account.id))) labels.push("Balance unknown");
      if (owned.some((account: any) => account.key !== "PLAYER_BONUS" && nonZero(projectionByAccount.get(account.id)?.availableMinor))) labels.push("Funds remain");
      if (owned.some((account: any) => account.key === "PLAYER_BONUS" && nonZero(projectionByAccount.get(account.id)?.availableMinor))) labels.push("Bonus remains");
      const openWagers = Number(wagers.find((row: any) => row.playerId === playerId)?._count?._all ?? 0);
      if (openWagers) labels.push(`${openWagers} open wager${openWagers === 1 ? "" : "s"}`);
      const pendingPayments = Number(payments.find((row: any) => row.playerId === playerId)?._count?._all ?? 0);
      if (pendingPayments) labels.push(`${pendingPayments} pending payment${pendingPayments === 1 ? "" : "s"}`);
      blockersByPlayer.set(playerId, labels);
    }
  }

  const blocked = count("BLOCKED_FUNDS");
  const open = OPEN_STATUSES.reduce((sum, status) => sum + count(status), 0);
  const tone = blocked ? "alert" : open ? "wait" : "ok";
  const isOpen = (status: string) => (OPEN_STATUSES as readonly string[]).includes(status);

  return <OperatorShell
    active="Closures"
    title="Account closures"
    tenantName={operator.tenantName}
    tone={tone}
    meta={`${open} open · ${blocked} blocked funds · ${coolingDue} cooling ended`}
  >
    <MetricGrid items={[
      { label: "Blocked funds", value: blocked, tone: blocked ? "alert" : "ok" },
      { label: "Requested", value: count("REQUESTED"), detail: coolingDue ? `${coolingDue} cooling ended` : undefined, tone: count("REQUESTED") ? "wait" : undefined },
      { label: "Review", value: count("REVIEW"), tone: count("REVIEW") ? "wait" : undefined },
      { label: "Closed", value: count("CLOSED"), detail: `${count("CANCELLED")} cancelled` },
    ]} />
    <RecordList
      title={`${trackLabels[track]} closures`}
      tone={track === "open" && blocked ? "alert" : undefined}
      action={<Track label="Filter by state">{tracks.map((value) => <PillLink key={value} size="sm" variant="flat" href={hrefWith(basePath, { status: value === "open" ? undefined : value })} current={value === track}>{trackLabels[value]}</PillLink>)}</Track>}
      columns={["Player", "State", "Reason", "Requested", "Cooling ends", "Completed"]}
      rows={closures.map((item: any) => {
        const labels = item.playerId && isOpen(item.status) ? blockersByPlayer.get(item.playerId) ?? [] : [];
        const coolingEnded = isOpen(item.status) && item.coolingEndsAt && new Date(item.coolingEndsAt) <= now;
        return {
          id: item.id,
          href: item.playerId ? `/dashboard/platform/customers/${item.playerId}` : undefined,
          status: item.status,
          cells: [
            <span key="player" className="break-all">{item.player?.subject || (item.playerId ? <Mono>{shortId(item.playerId)}</Mono> : "Unknown player")}</span>,
            <span key="state" className="flex flex-wrap items-center justify-end gap-x-2 gap-y-1 md:justify-start"><StatusBadge value={item.status} />{labels.map((label) => <span key={label} className="whitespace-nowrap text-xs text-amber-700 dark:text-amber-400">{label}</span>)}{isOpen(item.status) && item.playerId && !labels.length ? <span className="text-xs text-muted-foreground">No blockers</span> : null}</span>,
            item.reasonCode || "—",
            <Mono key="requested" className="text-xs">{dateTime(item.requestedAt)}</Mono>,
            <Mono key="cooling" className="text-xs">{dateTime(item.coolingEndsAt)}{coolingEnded ? " · ended" : ""}</Mono>,
            <Mono key="completed" className="text-xs">{dateTime(item.completedAt)}</Mono>,
          ],
        };
      })}
      emptyTitle={track === "open" ? "No open closures" : `No ${trackLabels[track].toLowerCase()} closures`}
      filtered={track !== "all"}
      pagination={{ page, pageSize: PLATFORM_PAGE_SIZE, total, hrefForPage: (next) => hrefWith(basePath, { status: track === "open" ? undefined : track, page: next }) }}
    />
  </OperatorShell>;
}
