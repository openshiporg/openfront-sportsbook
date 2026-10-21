import { MutationForm } from "../components/MutationForm";
import { OperatorShell, TenantRequired } from "../components/OperatorShell";
import { MetricGrid, RecordList, StatusBadge, WorkflowNote } from "../components/WorkflowUI";
import { dateTime, shortId } from "../lib/format";
import { getOperatorContext, platformPrisma as prisma } from "../lib/operator";
import Link from "next/link";
import { allowedParam, hrefWith, pageFrom, PLATFORM_PAGE_SIZE, type PlatformSearchParams } from "../lib/paging";
const inboxStatuses = ["PENDING", "PROCESSING", "COMPLETED", "DEAD"] as const;
const basePath = "/dashboard/platform/integrations/inbox";
const replay = `mutation ReplayInbox($sourceType:String!,$sourceId:ID!,$reason:String!){replayQueueItem(sourceType:$sourceType,sourceId:$sourceId,reason:$reason)}`;
export async function InboxScreen({ searchParams }: { searchParams?: PlatformSearchParams } = {}) {
  const params = (await searchParams) ?? {};
  const page = pageFrom(params);
  const status = allowedParam(params, "status", inboxStatuses);
  const operator = await getOperatorContext("canManageIntegrations");
  if (!operator) return <OperatorShell active="Inbox" eyebrow="Inbound operations" title="Integration inbox" description="Messages received from providers."><TenantRequired /></OperatorShell>;
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
  return <OperatorShell active="Inbox" eyebrow="Inbound operations" title="Integration inbox" description="Messages received from providers, their processing status and retries." tenantName={operator.tenantName}>
    <MetricGrid items={[{ label: "Messages", value: allTotal, detail: `Showing ${messages.length} on page ${page}` }, { label: "Pending", value: pendingCount, detail: "Available to workers" }, { label: "Processing", value: leased, detail: staleLeases ? `Live lease · ${staleLeases} expired lease${staleLeases === 1 ? "" : "s"} awaiting reclaim` : "Live lease" }, { label: "Dead", value: deadTotal, detail: "Replay candidates" }]} />
    <RecordList title="Inbox messages" description="Every row is a durable tenant record; absent normalization remains a separate webhook-envelope state." columns={["Message", "Provider / type", "Attempts / lease", "State"]} rows={messages.map((message: any) => ({ id: message.id, href: message.rawEnvelope?.providerConnectionId ? `/dashboard/platform/integrations/${message.rawEnvelope.providerConnectionId}` : undefined, cells: [<span key="id">{message.messageKey}<span className="block font-mono text-xs text-muted-foreground">{shortId(message.id)}</span></span>, `${message.rawEnvelope?.providerConnection?.adapterId || "Unlinked"} · ${message.type}`, `${message.attempts ?? 0} · ${dateTime(message.leaseUntil || message.availableAt)}`, <StatusBadge key="state" value={message.status === "PROCESSING" && !leaseLive(message) ? "LEASE_EXPIRED" : message.status} />] }))} emptyTitle={status ? "No matching messages" : "Inbox is empty"} emptyDescription={status ? "No inbox message has this state." : "No provider messages have been received yet. Check Webhooks for incoming deliveries."} filtered={Boolean(status)} emptyAction={<Link href={status ? basePath : "/dashboard/platform/integrations/webhooks"} className="inline-flex rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted">{status ? "Show all messages" : "Open Webhooks"}</Link>} action={<nav aria-label="Filter by state" className="flex flex-wrap gap-1">{[undefined, ...inboxStatuses].map((value) => <Link key={value ?? "all"} href={hrefWith(basePath, { status: value })} aria-current={value === status ? "page" : undefined} className={`rounded-md border px-2 py-1 text-xs ${value === status ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>{value ? value.toLowerCase() : "all"}</Link>)}</nav>} pagination={{ page, pageSize: PLATFORM_PAGE_SIZE, total, hrefForPage: (next) => hrefWith(basePath, { status, page: next }) }} />
    <section className="space-y-4"><h2 className="font-semibold">Dead inbox replay</h2>{deadTotal > dead.length ? <p className="text-sm text-muted-foreground">Showing the oldest {dead.length} of {deadTotal} dead messages.</p> : null}{dead.length === 0 ? <WorkflowNote title="No dead inbox item">Pending and processing items remain under worker lease control.</WorkflowNote> : dead.map((message: any) => <MutationForm key={message.id} compact title={`${message.type} · ${shortId(message.id)}`} description={message.lastError || "No error text recorded"} mutation={replay} fields={[{ name: "sourceType", label: "Source", type: "hidden", defaultValue: "INBOX" }, { name: "sourceId", label: "Message", type: "hidden", defaultValue: message.id }, { name: "reason", label: "Replay reason", placeholder: "Root cause fixed and payload remains valid" }]} submitLabel="Replay inbox message" successMessage="Inbox message reset and replay queued." disabledReason={operator.capabilities.canManageIntegrations ? undefined : "Your role cannot replay integration messages."} />)}</section>
  </OperatorShell>;
}
