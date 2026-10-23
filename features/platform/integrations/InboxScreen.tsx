import { MutationForm } from "../components/MutationForm";
import { OperatorShell, TenantRequired } from "../components/OperatorShell";
import { MetricGrid, RecordList, StatusBadge, WorkflowNote } from "../components/WorkflowUI";
import { dateTime, shortId } from "../lib/format";
import { getOperatorContext, platformPrisma as prisma } from "../lib/operator";
import { Mono, PillLink, StatusDot, Track } from "../components/kit";
import { allowedParam, hrefWith, pageFrom, PLATFORM_PAGE_SIZE, type PlatformSearchParams } from "../lib/paging";
const inboxStatuses = ["PENDING", "PROCESSING", "COMPLETED", "DEAD"] as const;
const basePath = "/dashboard/platform/integrations/inbox";
const replay = `mutation ReplayInbox($sourceType:String!,$sourceId:ID!,$reason:String!){replayQueueItem(sourceType:$sourceType,sourceId:$sourceId,reason:$reason)}`;
export async function InboxScreen({ searchParams }: { searchParams?: PlatformSearchParams } = {}) {
  const params = (await searchParams) ?? {};
  const page = pageFrom(params);
  const status = allowedParam(params, "status", inboxStatuses);
  const operator = await getOperatorContext("canManageIntegrations");
  if (!operator) return <OperatorShell active="Inbox" eyebrow="Inbound operations" title="Integration inbox"><TenantRequired /></OperatorShell>;
  // Lease state is projected against the server as-of time: an expired PROCESSING lease is stale (reclaimable), not current processing.
  const asOf = new Date(), leaseLive = (item: any) => item.status === "PROCESSING" && item.leaseUntil && new Date(item.leaseUntil) > asOf;
  const tenantWhere = { tenantId: operator.tenantId }, where = { ...tenantWhere, ...(status ? { status } : {}) };
  // Messages are paged; dead messages (replay work) are loaded on their own, oldest first.
  const [messages, total, allTotal, pendingCount, leased, staleLeases, dead, deadTotal] = await Promise.all([
    prisma.inboxMessage.findMany({ where, orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: PLATFORM_PAGE_SIZE, skip: (page - 1) * PLATFORM_PAGE_SIZE, include: { rawEnvelope: { include: { providerConnection: true } } } }),
    prisma.inboxMessage.count({ where }),
    prisma.inboxMessage.count({ where: tenantWhere }),
    prisma.inboxMessage.count({ where: { ...tenantWhere, status: "PENDING" } }),
    prisma.inboxMessage.count({ where: { ...tenantWhere, status: "PROCESSING", leaseUntil: { gt: asOf } } }),
    prisma.inboxMessage.count({ where: { ...tenantWhere, status: "PROCESSING", OR: [{ leaseUntil: null }, { leaseUntil: { lte: asOf } }] } }),
    prisma.inboxMessage.findMany({ where: { ...tenantWhere, status: "DEAD" }, orderBy: [{ createdAt: "asc" }, { id: "asc" }], take: PLATFORM_PAGE_SIZE }),
    prisma.inboxMessage.count({ where: { ...tenantWhere, status: "DEAD" } }),
  ]);
  const pageTone = deadTotal ? "alert" : staleLeases ? "wait" : "ok";
  return <OperatorShell
    active="Inbox"
    eyebrow="Inbound operations"
    title="Integration inbox"
    tone={pageTone}
    meta={`${deadTotal} dead · ${staleLeases} stale leases · ${pendingCount} pending · as of ${dateTime(asOf)}`}
    tenantName={operator.tenantName}
  >
    <MetricGrid items={[
      { label: "Dead", value: deadTotal, tone: deadTotal ? "alert" : "ok" },
      { label: "Processing", value: leased, detail: staleLeases ? `${staleLeases} expired lease${staleLeases === 1 ? "" : "s"}` : undefined, tone: staleLeases ? "wait" : undefined },
      { label: "Pending", value: pendingCount, tone: pendingCount ? "wait" : undefined },
      { label: "Messages", value: allTotal },
    ]} />
    <section className="space-y-3">
      <h2 className="text-sm font-semibold">{deadTotal ? <StatusDot tone="alert" /> : null}Dead replay<span className="ml-2 font-mono text-xs font-normal tabular-nums text-muted-foreground">{deadTotal > dead.length ? `oldest ${dead.length} of ${deadTotal}` : dead.length}</span></h2>
      {dead.length === 0 ? <WorkflowNote title="No dead inbox item" /> : <div className="grid gap-4 lg:grid-cols-2">{dead.map((message: any) => <MutationForm key={message.id} compact title={`${message.type} · ${shortId(message.id)}`} description={message.lastError || "No error recorded"} mutation={replay} fields={[{ name: "sourceType", label: "Source", type: "hidden", defaultValue: "INBOX" }, { name: "sourceId", label: "Message", type: "hidden", defaultValue: message.id }, { name: "reason", label: "Replay reason", placeholder: "Root cause fixed" }]} submitLabel="Replay inbox message" successMessage="Replay queued." disabledReason={operator.capabilities.canManageIntegrations ? undefined : "Your role cannot replay integration messages."} />)}</div>}
    </section>
    <RecordList title="Messages" columns={["Message", "Provider · type", "Attempts · lease", "State"]} rows={messages.map((message: any) => {
      const state = message.status === "PROCESSING" && !leaseLive(message) ? "LEASE_EXPIRED" : message.status;
      return { id: message.id, status: state === "LEASE_EXPIRED" ? "STALE" : state, href: message.rawEnvelope?.providerConnectionId ? `/dashboard/platform/integrations/${message.rawEnvelope.providerConnectionId}` : undefined, cells: [<span key="id"><span className="break-all">{message.messageKey}</span><span className="block font-mono text-xs font-normal text-muted-foreground">{shortId(message.id)}</span></span>, `${message.rawEnvelope?.providerConnection?.adapterId || "Unlinked"} · ${message.type}`, <Mono key="attempts">{`${message.attempts ?? 0} · ${dateTime(message.leaseUntil || message.availableAt)}`}</Mono>, <StatusBadge key="state" value={state} />] };
    })} emptyTitle={status ? "No matching messages" : "Inbox is empty"} filtered={Boolean(status)} emptyAction={<Track><PillLink size="sm" href={status ? basePath : "/dashboard/platform/integrations/webhooks"}>{status ? "Show all messages" : "Open Webhooks"}</PillLink></Track>} action={<Track label="Filter by state">{[undefined, ...inboxStatuses].map((value) => <PillLink key={value ?? "all"} size="sm" variant="flat" href={hrefWith(basePath, { status: value })} current={value === status}>{value ? value.toLowerCase() : "all"}</PillLink>)}</Track>} pagination={{ page, pageSize: PLATFORM_PAGE_SIZE, total, hrefForPage: (next) => hrefWith(basePath, { status, page: next }) }} />
  </OperatorShell>;
}
