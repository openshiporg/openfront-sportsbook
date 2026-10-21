import { MutationForm } from "../components/MutationForm";
import { OperatorShell, TenantRequired } from "../components/OperatorShell";
import { MetricGrid, RecordList, StatusBadge, WorkflowNote } from "../components/WorkflowUI";
import { shortId } from "../lib/format";
import { getOperatorContext, platformPrisma as prisma } from "../lib/operator";
import { hrefWith, pageFrom, PLATFORM_PAGE_SIZE, type PlatformSearchParams } from "../lib/paging";
import { replaySourceModel, replayUnavailableReason, type ReplaySource } from "../../sportsbook/workers/replay-contract";
const replay = `mutation ReplayDead($sourceType:String!,$sourceId:ID!,$reason:String!){replayQueueItem(sourceType:$sourceType,sourceId:$sourceId,reason:$reason)}`;
export async function DeadLetterScreen({ searchParams }: { searchParams?: PlatformSearchParams } = {}) {
  const page = pageFrom((await searchParams) ?? {});
  const operator = await getOperatorContext("canManageIntegrations");
  if (!operator) return <OperatorShell active="DLQ" eyebrow="Failure recovery" title="Dead-letter queue" description="Review failed jobs and retry them."><TenantRequired /></OperatorShell>;
  // Evidence is paged; unresolved letters are loaded on their own (oldest first) so old failures stay actionable.
  const where = { tenantId: operator.tenantId };
  const [letters, total, unresolved, unresolvedTotal, attempts] = await Promise.all([
    prisma.deadLetter.findMany({ where, orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: PLATFORM_PAGE_SIZE, skip: (page - 1) * PLATFORM_PAGE_SIZE }),
    prisma.deadLetter.count({ where }),
    prisma.deadLetter.findMany({ where: { ...where, resolvedAt: null }, orderBy: [{ createdAt: "asc" }, { id: "asc" }], take: PLATFORM_PAGE_SIZE }),
    prisma.deadLetter.count({ where: { ...where, resolvedAt: null } }),
    prisma.deadLetter.aggregate({ where, _sum: { attempts: true } }),
  ]);
  // Source-specific recoverability from the same finite replay table the mutation enforces.
  const sourceIds = (kind: string) => unresolved.filter((item: any) => item.sourceType === kind).map((item: any) => item.sourceId);
  const [outboxSources, inboxSources, jobSources] = await Promise.all([
    prisma.outboxMessage.findMany({ where: { tenantId: operator.tenantId, id: { in: sourceIds("OUTBOX") } }, select: { id: true, status: true, eventType: true } }),
    prisma.inboxMessage.findMany({ where: { tenantId: operator.tenantId, id: { in: sourceIds("INBOX") } }, select: { id: true, status: true } }),
    prisma.scheduledJob.findMany({ where: { tenantId: operator.tenantId, id: { in: sourceIds("SCHEDULED_JOB") } }, select: { id: true, status: true, type: true } }),
  ]);
  const sources = new Map<string, ReplaySource>([
    ...outboxSources.map((row: any) => [`OUTBOX:${row.id}`, { kind: "OUTBOX", status: row.status, eventType: row.eventType }] as [string, ReplaySource]),
    ...inboxSources.map((row: any) => [`INBOX:${row.id}`, { kind: "INBOX", status: row.status }] as [string, ReplaySource]),
    ...jobSources.map((row: any) => [`SCHEDULED_JOB:${row.id}`, { kind: "SCHEDULED_JOB", status: row.status, jobType: row.type }] as [string, ReplaySource]),
  ]);
  const replayBlocked = (item: any) => replayUnavailableReason(sources.get(`${item.sourceType}:${item.sourceId}`) ?? (replaySourceModel(item.sourceType) ? null : { kind: item.sourceType }));
  return <OperatorShell active="DLQ" eyebrow="Failure recovery" title="Dead-letter queue" description="Failed jobs and their last error. Retry them one at a time." tenantName={operator.tenantName}>
    <MetricGrid items={[{ label: "Dead letters", value: total, detail: `Showing ${letters.length} on page ${page}` }, { label: "Unresolved", value: unresolvedTotal, detail: "Actionable failures" }, { label: "Resolved", value: total - unresolvedTotal, detail: "Evidence retained" }, { label: "Total attempts", value: attempts?._sum?.attempts ?? 0, detail: "Across all dead letters" }]} />
    <RecordList title="Dead-letter evidence" description="Resolution timestamps do not delete original reason or source reference." columns={["Source", "Reason", "Attempts / payload", "State"]} rows={letters.map((item: any) => ({ id: item.id, cells: [`${item.sourceType} · ${shortId(item.sourceId)}`, item.reason, `${item.attempts ?? 0} · ${item.payloadReference || "No payload reference"}`, <StatusBadge key="state" value={item.resolvedAt ? "RESOLVED" : "DEAD"} />] }))} emptyTitle="No dead letters" emptyDescription="No queue item has reached its terminal retry state." pagination={{ page, pageSize: PLATFORM_PAGE_SIZE, total, hrefForPage: (next) => hrefWith("/dashboard/platform/integrations/dlq", { page: next }) }} />
    <section className="space-y-4"><h2 className="font-semibold">Unresolved recovery actions</h2>{unresolvedTotal > unresolved.length ? <p className="text-sm text-muted-foreground">Showing the oldest {unresolved.length} of {unresolvedTotal} unresolved dead letters.</p> : null}{unresolved.length === 0 ? <WorkflowNote title="No dead letter requires replay">Resolved evidence remains visible above.</WorkflowNote> : unresolved.map((item: any) => <MutationForm key={item.id} compact title={`${item.sourceType} · ${shortId(item.sourceId)}`} description={item.reason} mutation={replay} fields={[{ name: "sourceType", label: "Source", type: "hidden", defaultValue: "DEAD_LETTER" }, { name: "sourceId", label: "Dead letter", type: "hidden", defaultValue: item.id }, { name: "reason", label: "Recovery reason", placeholder: "Root cause and verification before replay" }]} submitLabel="Resolve and replay" successMessage="Dead letter resolved and source recovery queued." disabledReason={replayBlocked(item) ? `Replay unavailable for this source: ${replayBlocked(item)}` : operator.capabilities.canManageIntegrations ? undefined : "Your role cannot recover dead letters."} />)}</section>
  </OperatorShell>;
}
