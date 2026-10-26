import { OperatorShell, TenantRequired } from "../components/OperatorShell";
import { MetricGrid, RecordList, StatusBadge, WorkflowNote, statusDotTone } from "../components/WorkflowUI";
import { Mono, PillLink, Track, type Tone } from "../components/kit";
import { dateTime, shortId } from "../lib/format";
import { getOperatorContext, platformPrisma as prisma } from "../lib/operator";

// Display order only: failing first, then waiting, neutral, healthy.
const toneRank: Record<Tone, number> = { alert: 0, live: 1, wait: 1, off: 2, info: 2, ok: 3 };
function attentionFirst<T>(rows: T[], status: (row: T) => string | null | undefined) {
  return rows.map((row, index) => ({ row, index })).sort((a, b) => toneRank[statusDotTone(status(a.row))] - toneRank[statusDotTone(status(b.row))] || a.index - b.index).map(({ row }) => row);
}

export async function IntegrationsScreen() {
  const operator = await getOperatorContext("canManageIntegrations");
  if (!operator) return <OperatorShell active="Integrations" eyebrow="Provider operations" title="Integrations and inbox"><TenantRequired /></OperatorShell>;
  const [connections, inbox, dead, raw, outboxPending] = await Promise.all([
    prisma.providerConnection.findMany({ where: { tenantId: operator.tenantId }, orderBy: { adapterId: "asc" } }),
    prisma.inboxMessage.findMany({ where: { tenantId: operator.tenantId }, orderBy: { createdAt: "desc" }, take: 100, include: { rawEnvelope: true } }),
    prisma.deadLetter.count({ where: { tenantId: operator.tenantId, resolvedAt: null } }),
    prisma.rawEnvelope.count({ where: { tenantId: operator.tenantId } }),
    prisma.outboxMessage.count({ where: { tenantId: operator.tenantId, status: { in: ["PENDING", "PROCESSING"] } } }),
  ]);
  const failingConnections = connections.filter((connection: any) => statusDotTone(connection.status) === "alert").length;
  const degradedConnections = connections.filter((connection: any) => statusDotTone(connection.status) === "wait").length;
  const failedInbox = inbox.filter((message: any) => statusDotTone(message.status) === "alert").length;
  const pageTone: Tone = failingConnections || dead ? "alert" : degradedConnections || failedInbox || outboxPending ? "wait" : "ok";
  return <OperatorShell
    active="Integrations"
    eyebrow="Provider operations"
    title="Integrations and inbox"
    tone={pageTone}
    meta={`${connections.length} connections · ${failingConnections} failing · ${dead} dead letters`}
    tenantName={operator.tenantName}
    actions={<Track label="Integration queues"><PillLink size="sm" variant="flat" href="/dashboard/platform/integrations/inbox">Inbox</PillLink><PillLink size="sm" variant="flat" href="/dashboard/platform/integrations/webhooks">Webhooks</PillLink><PillLink size="sm" variant="flat" href="/dashboard/platform/integrations/dlq">Dead letters</PillLink></Track>}
  >
    {dead ? <WorkflowNote title={`${dead} unresolved dead letters`} tone="warning"><Track className="mt-1"><PillLink size="sm" variant="primary" href="/dashboard/platform/integrations/dlq">Review dead letters</PillLink><PillLink size="sm" href="/dashboard/platform/recovery">Recovery</PillLink></Track></WorkflowNote> : null}
    <MetricGrid items={[
      { label: "Failing", value: failingConnections, detail: degradedConnections ? `${degradedConnections} degraded` : undefined, tone: failingConnections ? "alert" : degradedConnections ? "wait" : "ok" },
      { label: "Dead letters", value: dead, tone: dead ? "alert" : "ok" },
      { label: "Outbox active", value: outboxPending, tone: outboxPending ? "wait" : undefined },
      { label: "Raw envelopes", value: raw, detail: `${inbox.length} inbox (newest 100)` },
    ]} />
    <RecordList title="Connections" tone={failingConnections ? "alert" : degradedConnections ? "wait" : undefined} columns={["Adapter", "State", "Certification", "Capabilities"]} rows={attentionFirst(connections, (connection: any) => connection.status).map((connection: any) => ({ id: connection.id, href: `/dashboard/platform/integrations/${connection.id}`, status: connection.status, cells: [<span key="adapter"><span className="break-all">{connection.adapterId}</span><span className="block tabular-nums text-xs font-normal text-muted-foreground">v{connection.adapterVersion}</span></span>, <StatusBadge key="state" value={connection.status} />, <StatusBadge key="cert" value={connection.certificationStatus} />, <span key="cap" className="break-words text-xs">{Object.keys((connection.capabilities as object) || {}).join(", ") || "Not declared"}</span>] }))} emptyTitle="No provider connections" />
    <RecordList title="Inbox" tone={failedInbox ? "alert" : undefined} action={<PillLink size="sm" href="/dashboard/platform/integrations/inbox">Open inbox</PillLink>} columns={["Message", "Type", "Attempts · received", "State"]} rows={attentionFirst(inbox, (message: any) => message.status).map((message: any) => ({ id: message.id, status: message.status, cells: [<span key="id"><Mono>{shortId(message.id)}</Mono><span className="block break-all tabular-nums text-xs font-normal text-muted-foreground">{message.messageKey}</span></span>, message.type, <Mono key="attempts">{`${message.attempts ?? 0} · ${dateTime(message.rawEnvelope?.receivedAt || message.createdAt)}`}</Mono>, <StatusBadge key="state" value={message.status} />] }))} emptyTitle="No inbox messages" />
  </OperatorShell>;
}
