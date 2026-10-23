import { MutationForm } from "../components/MutationForm";
import { OperatorShell, TenantRequired } from "../components/OperatorShell";
import { MetricGrid, RecordList, StatusBadge, WorkflowNote } from "../components/WorkflowUI";
import { dateTime, shortId } from "../lib/format";
import { Mono, StatusDot } from "../components/kit";
import { getOperatorContext, platformPrisma as prisma } from "../lib/operator";
import { hrefWith, pageFrom, PLATFORM_PAGE_SIZE, type PlatformSearchParams } from "../lib/paging";
import { replaySourceModel, replayUnavailableReason } from "../../sportsbook/workers/replay-contract";

const replayMutation = `mutation Replay($sourceType:String!,$sourceId:ID!,$reason:String!){replayQueueItem(sourceType:$sourceType,sourceId:$sourceId,reason:$reason)}`;

export async function RecoveryScreen({ searchParams }: { searchParams?: PlatformSearchParams } = {}) {
  const params = (await searchParams) ?? {};
  const page = pageFrom(params), deadPage = pageFrom({ page: params.dpage });
  const operator = await getOperatorContext("canManageIntegrations");
  if (!operator) return <OperatorShell active="Recovery" eyebrow="Worker operations" title="Queue and worker recovery"><TenantRequired /></OperatorShell>;
  const tenantWhere = { tenantId: operator.tenantId }, asOf = new Date();
  // Lists are paged and every metric is a count over all rows; recoverable work is queried by state
  // (oldest first) instead of being filtered out of a recent window.
  const [outbox, outboxTotal, dead, deadTotal, deadUnresolved, outboxDead, inboxDead, unresolvedTotal, outboxDeadTotal, inboxDeadTotal, outboxPending, outboxCompleted, processingTotal, liveLeases] = await Promise.all([
    prisma.outboxMessage.findMany({ where: tenantWhere, orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: PLATFORM_PAGE_SIZE, skip: (page - 1) * PLATFORM_PAGE_SIZE }),
    prisma.outboxMessage.count({ where: tenantWhere }),
    prisma.deadLetter.findMany({ where: tenantWhere, orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: PLATFORM_PAGE_SIZE, skip: (deadPage - 1) * PLATFORM_PAGE_SIZE }),
    prisma.deadLetter.count({ where: tenantWhere }),
    prisma.deadLetter.findMany({ where: { ...tenantWhere, resolvedAt: null }, orderBy: [{ createdAt: "asc" }, { id: "asc" }], take: 20 }),
    prisma.outboxMessage.findMany({ where: { ...tenantWhere, status: "DEAD" }, orderBy: [{ createdAt: "asc" }, { id: "asc" }], take: 20 }),
    prisma.inboxMessage.findMany({ where: { ...tenantWhere, status: "DEAD" }, orderBy: [{ createdAt: "asc" }, { id: "asc" }], take: 20 }),
    prisma.deadLetter.count({ where: { ...tenantWhere, resolvedAt: null } }),
    prisma.outboxMessage.count({ where: { ...tenantWhere, status: "DEAD" } }),
    prisma.inboxMessage.count({ where: { ...tenantWhere, status: "DEAD" } }),
    prisma.outboxMessage.count({ where: { ...tenantWhere, status: "PENDING" } }),
    prisma.outboxMessage.count({ where: { ...tenantWhere, status: "COMPLETED" } }),
    Promise.all([prisma.outboxMessage.count({ where: { ...tenantWhere, status: "PROCESSING" } }), prisma.inboxMessage.count({ where: { ...tenantWhere, status: "PROCESSING" } })]).then(([a, b]) => a + b),
    Promise.all([prisma.outboxMessage.count({ where: { ...tenantWhere, status: "PROCESSING", leaseUntil: { gt: asOf } } }), prisma.inboxMessage.count({ where: { ...tenantWhere, status: "PROCESSING", leaseUntil: { gt: asOf } } })]).then(([a, b]) => a + b),
  ]);
  const recoverableTotal = unresolvedTotal + outboxDeadTotal + inboxDeadTotal;
  const recoverable = [
    ...deadUnresolved.map((item: any) => ({ ...item, sourceKind: "DEAD_LETTER", label: `${item.sourceType} · ${item.reason}` })),
    ...outboxDead.map((item: any) => ({ ...item, sourceKind: "OUTBOX", label: `${item.eventType} · ${item.lastError}` })),
    ...inboxDead.map((item: any) => ({ ...item, sourceKind: "INBOX", label: `${item.type} · ${item.lastError}` })),
  ].sort((a: any, b: any) => +new Date(a.createdAt) - +new Date(b.createdAt)).slice(0, 20);
  // Each action is checked against the same finite replay table the mutation enforces; unsupported sources are shown with their reason instead of an action that would fail.
  const deadSourceIds = (kind: string) => recoverable.filter((item: any) => item.sourceKind === "DEAD_LETTER" && item.sourceType === kind).map((item: any) => item.sourceId);
  const [deadOutbox, deadInbox, deadJobs] = await Promise.all([
    prisma.outboxMessage.findMany({ where: { tenantId: operator.tenantId, id: { in: deadSourceIds("OUTBOX") } }, select: { id: true, status: true, eventType: true } }),
    prisma.inboxMessage.findMany({ where: { tenantId: operator.tenantId, id: { in: deadSourceIds("INBOX") } }, select: { id: true, status: true } }),
    prisma.scheduledJob.findMany({ where: { tenantId: operator.tenantId, id: { in: deadSourceIds("SCHEDULED_JOB") } }, select: { id: true, status: true, type: true } }),
  ]);
  const replayBlocked = (item: any): string | null => {
    if (item.sourceKind === "OUTBOX") return replayUnavailableReason({ kind: "OUTBOX", status: item.status, eventType: item.eventType });
    if (item.sourceKind === "INBOX") return replayUnavailableReason({ kind: "INBOX", status: item.status });
    const row: any = item.sourceType === "OUTBOX" ? deadOutbox.find((source: any) => source.id === item.sourceId) : item.sourceType === "INBOX" ? deadInbox.find((source: any) => source.id === item.sourceId) : item.sourceType === "SCHEDULED_JOB" ? deadJobs.find((source: any) => source.id === item.sourceId) : undefined;
    if (!replaySourceModel(item.sourceType)) return replayUnavailableReason({ kind: item.sourceType });
    return replayUnavailableReason(row ? { kind: item.sourceType, status: row.status, eventType: row.eventType, jobType: row.type } : null);
  };
  const expiredLeases = processingTotal - liveLeases;
  const outboxState = (item: any) => item.status === "PROCESSING" && !(item.leaseUntil && new Date(item.leaseUntil) > asOf) ? "LEASE_EXPIRED" : item.status;
  return <OperatorShell
    active="Recovery"
    eyebrow="Worker operations"
    title="Queue and worker recovery"
    tone={recoverableTotal ? "alert" : expiredLeases ? "wait" : "ok"}
    meta={`${expiredLeases} stuck leases · ${recoverableTotal} recoverable · ${outboxPending} pending · as of ${dateTime(asOf)}`}
    tenantName={operator.tenantName}
  >
    <MetricGrid items={[
      { label: "Stuck leases", value: expiredLeases, tone: expiredLeases ? "wait" : "ok" },
      { label: "Recoverable", value: recoverableTotal, detail: `${unresolvedTotal} dead letters · ${outboxDeadTotal + inboxDeadTotal} dead queue`, tone: recoverableTotal ? "alert" : "ok" },
      { label: "Processing", value: liveLeases, detail: "live leases" },
      { label: "Outbox pending", value: outboxPending, detail: `${outboxCompleted} completed` },
    ]} />
    <section className="space-y-3">
      <h2 className="text-sm font-semibold">{recoverableTotal ? <StatusDot tone="alert" /> : null}Recoverable<span className="ml-2 font-mono text-xs font-normal tabular-nums text-muted-foreground">{recoverableTotal > recoverable.length ? `oldest ${recoverable.length} of ${recoverableTotal}` : recoverable.length}</span></h2>
      {recoverable.length === 0 ? <WorkflowNote title="No replay action available" /> : <div className="grid gap-4 lg:grid-cols-2">{recoverable.map((item: any) => {
        const blocked = replayBlocked(item);
        return <MutationForm key={`${item.sourceKind}:${item.id}`} compact title={`${item.sourceKind} · ${shortId(item.id)}`} description={item.label} mutation={replayMutation} fields={[{ name: "sourceType", label: "Source", type: "hidden", defaultValue: item.sourceKind }, { name: "sourceId", label: "Source ID", type: "hidden", defaultValue: item.id }, { name: "reason", label: "Replay reason", placeholder: "Root cause fixed" }]} submitLabel="Replay selected item" successMessage="Queue item reset for replay." disabledReason={blocked ? `Replay unavailable: ${blocked}` : operator.capabilities.canManageIntegrations ? undefined : "Your role does not include recovery capability."} />;
      })}</div>}
    </section>
    <RecordList title="Outbox queue" tone={expiredLeases ? "wait" : undefined} columns={["Event", "Aggregate", "Attempts · available", "State"]} rows={outbox.map((item: any) => {
      const state = outboxState(item);
      return { id: item.id, status: state === "LEASE_EXPIRED" ? "STALE" : state, cells: [<span key="event"><span className="break-all">{item.eventType}</span><span className="block font-mono text-xs font-normal text-muted-foreground">{shortId(item.id)}</span></span>, <span key="aggregate">{item.aggregateType} · <Mono>{shortId(item.aggregateId)}</Mono></span>, <Mono key="attempts">{`${item.attempts ?? 0}/${item.maxAttempts ?? 10} · ${dateTime(item.availableAt)}`}</Mono>, <StatusBadge key="state" value={state} />] };
    })} emptyTitle="Outbox is empty" pagination={{ page, pageSize: PLATFORM_PAGE_SIZE, total: outboxTotal, hrefForPage: (next) => hrefWith("/dashboard/platform/recovery", { page: next, dpage: deadPage }) }} />
    <RecordList title="Dead letters" columns={["Source", "Reason", "Attempts", "State"]} rows={dead.map((item: any) => ({ id: item.id, status: item.resolvedAt ? "RESOLVED" : "DEAD", cells: [<span key="source">{item.sourceType} · <Mono>{shortId(item.sourceId)}</Mono></span>, <span key="reason" className="break-words">{item.reason}</span>, <Mono key="attempts">{item.attempts ?? 0}</Mono>, <StatusBadge key="state" value={item.resolvedAt ? "RESOLVED" : "DEAD"} />] }))} emptyTitle="No dead letters" pagination={{ page: deadPage, pageSize: PLATFORM_PAGE_SIZE, total: deadTotal, hrefForPage: (next) => hrefWith("/dashboard/platform/recovery", { page, dpage: next }) }} />
  </OperatorShell>;
}
