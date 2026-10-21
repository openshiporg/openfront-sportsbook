import { MutationForm } from "../components/MutationForm";
import { OperatorShell, TenantRequired } from "../components/OperatorShell";
import { MetricGrid, RecordList, StatusBadge, WorkflowNote } from "../components/WorkflowUI";
import { dateTime, shortId } from "../lib/format";
import { getOperatorContext, platformPrisma as prisma } from "../lib/operator";
import { hrefWith, pageFrom, PLATFORM_PAGE_SIZE, type PlatformSearchParams } from "../lib/paging";
import { replaySourceModel, replayUnavailableReason } from "../../sportsbook/workers/replay-contract";

const replayMutation = `mutation Replay($sourceType:String!,$sourceId:ID!,$reason:String!){replayQueueItem(sourceType:$sourceType,sourceId:$sourceId,reason:$reason)}`;

export async function RecoveryScreen({ searchParams }: { searchParams?: PlatformSearchParams } = {}) {
  const params = (await searchParams) ?? {};
  const page = pageFrom(params), deadPage = pageFrom({ page: params.dpage });
  const operator = await getOperatorContext("canManageIntegrations");
  if (!operator) return <OperatorShell active="Recovery" eyebrow="Worker operations" title="Queue and worker recovery" description="Background jobs, failed work and retries."><TenantRequired /></OperatorShell>;
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
  return <OperatorShell active="Recovery" eyebrow="Worker operations" title="Queue and worker recovery" description="Background jobs, failed work and retries." tenantName={operator.tenantName}>
    <MetricGrid items={[{ label: "Outbox pending", value: outboxPending, detail: "All pending outbox work" }, { label: "Processing", value: liveLeases, detail: processingTotal - liveLeases ? `Live leases · ${processingTotal - liveLeases} expired, awaiting reclaim` : "Live leases" }, { label: "Dead letters", value: unresolvedTotal, detail: "Unresolved" }, { label: "Completed outbox", value: outboxCompleted, detail: "All time" }]} />
    <RecordList title="Outbox worker queue" description="Lease, attempts, errors, and availability are real stored worker state." columns={["Event", "Aggregate", "Attempts / available", "State"]} rows={outbox.map((item: any) => ({ id: item.id, cells: [<span key="event">{item.eventType}<span className="block font-mono text-xs text-muted-foreground">{shortId(item.id)}</span></span>, `${item.aggregateType} · ${shortId(item.aggregateId)}`, `${item.attempts ?? 0}/${item.maxAttempts ?? 10} · ${dateTime(item.availableAt)}`, <StatusBadge key="state" value={item.status} />] }))} emptyTitle="Outbox is empty" emptyDescription="No background jobs have been queued." pagination={{ page, pageSize: PLATFORM_PAGE_SIZE, total: outboxTotal, hrefForPage: (next) => hrefWith("/dashboard/platform/recovery", { page: next, dpage: deadPage }) }} />
    <RecordList title="Dead-letter evidence" description="Resolved records remain visible after a replay is requested." columns={["Source", "Reason", "Attempts", "State"]} rows={dead.map((item: any) => ({ id: item.id, cells: [`${item.sourceType} · ${shortId(item.sourceId)}`, item.reason, item.attempts ?? 0, <StatusBadge key="state" value={item.resolvedAt ? "RESOLVED" : "DEAD"} />] }))} emptyTitle="No dead letters" emptyDescription="No jobs have failed." pagination={{ page: deadPage, pageSize: PLATFORM_PAGE_SIZE, total: deadTotal, hrefForPage: (next) => hrefWith("/dashboard/platform/recovery", { page, dpage: next }) }} />
    <section className="space-y-4"><div><h2 className="font-semibold">Recoverable items</h2><p className="mt-1 text-sm text-muted-foreground">Replay resets only the selected queue item and records an audit reason.{recoverableTotal > recoverable.length ? ` Showing the oldest ${recoverable.length} of ${recoverableTotal} recoverable items.` : ""}</p></div>{recoverable.length === 0 ? <WorkflowNote title="No replay action available">There is no unresolved dead letter or dead queue item. Pending work should be left for the worker lease process.</WorkflowNote> : recoverable.map((item: any) => <MutationForm key={`${item.sourceKind}:${item.id}`} compact title={`${item.sourceKind} · ${shortId(item.id)}`} description={item.label} mutation={replayMutation} fields={[{ name: "sourceType", label: "Source", type: "hidden", defaultValue: item.sourceKind }, { name: "sourceId", label: "Source ID", type: "hidden", defaultValue: item.id }, { name: "reason", label: "Replay reason", placeholder: "Root cause fixed; safe to replay once" }]} submitLabel="Replay selected item" successMessage="Selected queue item reset for replay." disabledReason={replayBlocked(item) ? `Replay unavailable for this source: ${replayBlocked(item)}` : operator.capabilities.canManageIntegrations ? undefined : "Your role does not include recovery capability."} />)}</section>
  </OperatorShell>;
}
