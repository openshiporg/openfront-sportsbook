import { MutationForm } from "../components/MutationForm";
import { OperatorShell, TenantRequired } from "../components/OperatorShell";
import { MetricGrid, RecordList, StatusBadge, WorkflowNote } from "../components/WorkflowUI";
import { shortId } from "../lib/format";
import { Mono, StatusDot } from "../components/kit";
import { getOperatorContext, platformPrisma as prisma } from "../lib/operator";
import { hrefWith, pageFrom, PLATFORM_PAGE_SIZE, type PlatformSearchParams } from "../lib/paging";
import { replaySourceModel, replayUnavailableReason, type ReplaySource } from "../../sportsbook/workers/replay-contract";
const replay = `mutation ReplayDead($sourceType:String!,$sourceId:ID!,$reason:String!){replayQueueItem(sourceType:$sourceType,sourceId:$sourceId,reason:$reason)}`;
export async function DeadLetterScreen({ searchParams }: { searchParams?: PlatformSearchParams } = {}) {
  const page = pageFrom((await searchParams) ?? {});
  const operator = await getOperatorContext("canManageIntegrations");
  if (!operator) return <OperatorShell active="DLQ" eyebrow="Failure recovery" title="Dead-letter queue"><TenantRequired /></OperatorShell>;
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
  return <OperatorShell
    active="DLQ"
    eyebrow="Failure recovery"
    title="Dead-letter queue"
    tone={unresolvedTotal ? "alert" : "ok"}
    meta={`${unresolvedTotal} unresolved · ${total - unresolvedTotal} resolved · ${attempts?._sum?.attempts ?? 0} attempts`}
    tenantName={operator.tenantName}
  >
    <MetricGrid items={[
      { label: "Unresolved", value: unresolvedTotal, tone: unresolvedTotal ? "alert" : "ok" },
      { label: "Resolved", value: total - unresolvedTotal },
      { label: "Dead letters", value: total },
      { label: "Attempts", value: attempts?._sum?.attempts ?? 0 },
    ]} />
    <section className="space-y-3">
      <h2 className="text-sm font-semibold">{unresolvedTotal ? <StatusDot tone="alert" /> : null}Replay<span className="ml-2 font-mono text-xs font-normal tabular-nums text-muted-foreground">{unresolvedTotal > unresolved.length ? `oldest ${unresolved.length} of ${unresolvedTotal}` : unresolved.length}</span></h2>
      {unresolved.length === 0 ? <WorkflowNote title="No dead letter requires replay" /> : <div className="grid gap-4 lg:grid-cols-2">{unresolved.map((item: any) => {
        const blocked = replayBlocked(item);
        return <MutationForm key={item.id} compact title={`${item.sourceType} · ${shortId(item.sourceId)}`} description={item.reason} mutation={replay} fields={[{ name: "sourceType", label: "Source", type: "hidden", defaultValue: "DEAD_LETTER" }, { name: "sourceId", label: "Dead letter", type: "hidden", defaultValue: item.id }, { name: "reason", label: "Recovery reason", placeholder: "Root cause and verification" }]} submitLabel="Resolve and replay" successMessage="Resolved; recovery queued." disabledReason={blocked ? `Replay unavailable: ${blocked}` : operator.capabilities.canManageIntegrations ? undefined : "Your role cannot recover dead letters."} />;
      })}</div>}
    </section>
    <RecordList title="Dead letters" columns={["Source", "Reason", "Attempts · payload", "State"]} rows={letters.map((item: any) => ({ id: item.id, status: item.resolvedAt ? "RESOLVED" : "DEAD", cells: [<span key="source">{item.sourceType} · <Mono>{shortId(item.sourceId)}</Mono></span>, <span key="reason" className="break-words">{item.reason}</span>, <span key="attempts" className="break-all font-mono text-xs">{`${item.attempts ?? 0} · ${item.payloadReference || "No payload reference"}`}</span>, <StatusBadge key="state" value={item.resolvedAt ? "RESOLVED" : "DEAD"} />] }))} emptyTitle="No dead letters" pagination={{ page, pageSize: PLATFORM_PAGE_SIZE, total, hrefForPage: (next) => hrefWith("/dashboard/platform/integrations/dlq", { page: next }) }} />
  </OperatorShell>;
}
