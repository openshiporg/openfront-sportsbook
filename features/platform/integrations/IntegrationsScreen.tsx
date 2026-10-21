import { OperatorShell, TenantRequired } from "../components/OperatorShell";
import { MetricGrid, RecordList, StatusBadge, WorkflowNote } from "../components/WorkflowUI";
import { dateTime, shortId } from "../lib/format";
import { getOperatorContext, platformPrisma as prisma } from "../lib/operator";

export async function IntegrationsScreen() {
  const operator = await getOperatorContext("canManageIntegrations");
  if (!operator) return <OperatorShell active="Integrations" eyebrow="Provider operations" title="Integrations and inbox" description="Provider connections, inbound messages and webhooks."><TenantRequired /></OperatorShell>;
  const [connections, inbox, dead, raw, outboxPending] = await Promise.all([
    prisma.providerConnection.findMany({ where: { tenantId: operator.tenantId }, orderBy: { adapterId: "asc" } }),
    prisma.inboxMessage.findMany({ where: { tenantId: operator.tenantId }, orderBy: { createdAt: "desc" }, take: 100, include: { rawEnvelope: true } }),
    prisma.deadLetter.count({ where: { tenantId: operator.tenantId, resolvedAt: null } }),
    prisma.rawEnvelope.count({ where: { tenantId: operator.tenantId } }),
    prisma.outboxMessage.count({ where: { tenantId: operator.tenantId, status: { in: ["PENDING", "PROCESSING"] } } }),
  ]);
  return <OperatorShell active="Integrations" eyebrow="Provider operations" title="Integrations and inbox" description="Provider connections, inbound messages and webhooks." tenantName={operator.tenantName}>
    <MetricGrid items={[{ label: "Connections", value: connections.length, detail: "Configured for tenant" }, { label: "Raw envelopes", value: raw, detail: "Inbound and outbound" }, { label: "Inbox messages", value: inbox.length, detail: "Newest 100" }, { label: "Queue attention", value: dead + outboxPending, detail: `${dead} dead · ${outboxPending} active` }]} />
    <RecordList title="Provider connections" description="Certification and runtime state are separate; sandbox does not imply production certification." columns={["Adapter", "Capabilities", "Certification", "State"]} rows={connections.map((connection: any) => ({ id: connection.id, href: `/dashboard/platform/integrations/${connection.id}`, cells: [<span key="adapter">{connection.adapterId}<span className="block text-xs text-muted-foreground">v{connection.adapterVersion}</span></span>, Object.keys((connection.capabilities as object) || {}).join(", ") || "Not declared", <StatusBadge key="cert" value={connection.certificationStatus} />, <StatusBadge key="state" value={connection.status} />] }))} emptyTitle="No provider connections" emptyDescription="Providers are connected during onboarding." />
    <RecordList title="Durable inbox" description="Webhook normalization messages with raw-envelope references and retry state." columns={["Message", "Type", "Attempts / received", "State"]} rows={inbox.map((message: any) => ({ id: message.id, cells: [<span key="id">{shortId(message.id)}<span className="block text-xs text-muted-foreground">{message.messageKey}</span></span>, message.type, `${message.attempts ?? 0} · ${dateTime(message.rawEnvelope?.receivedAt || message.createdAt)}`, <StatusBadge key="state" value={message.status} />] }))} emptyTitle="No inbox messages" emptyDescription="No provider messages have been received yet." />
    <WorkflowNote title="Recovery is explicit" tone={dead ? "warning" : "neutral"}>{dead ? `${dead} unresolved dead-letter item(s) require review.` : "No unresolved dead-letter records exist."} Use the Recovery workflow to replay a bounded queue item with a reason.</WorkflowNote>
  </OperatorShell>;
}
