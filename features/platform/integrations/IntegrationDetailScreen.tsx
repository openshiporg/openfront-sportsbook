import { notFound } from "next/navigation";
import { MutationForm } from "../components/MutationForm";
import { OperatorShell, TenantRequired } from "../components/OperatorShell";
import { DetailGrid, RecordList, StatusBadge, WorkflowNote } from "../components/WorkflowUI";
import { dateTime, shortId } from "../lib/format";
import { getOperatorContext, platformPrisma as prisma } from "../lib/operator";
import { outboxEventUnavailableReason } from "../../sportsbook/workers/replay-contract";

const recoverMutation = `mutation Recover($aggregateType:String!,$aggregateId:ID!,$eventType:String!){enqueueRecovery(aggregateType:$aggregateType,aggregateId:$aggregateId,eventType:$eventType)}`;

export async function IntegrationDetailScreen({ connectionId }: { connectionId: string }) {
  const operator = await getOperatorContext("canManageIntegrations");
  if (!operator) return <OperatorShell active="Integrations" detail eyebrow="Provider detail" title="Integration evidence" description="Provider connection details."><TenantRequired /></OperatorShell>;
  const connection = await prisma.providerConnection.findFirst({ where: { id: connectionId, tenantId: operator.tenantId } });
  if (!connection) notFound();
  const recoveryUnavailable = outboxEventUnavailableReason("recovery.requested") ? "Provider connection recovery is not implemented (no worker handler); the action is disabled rather than queueing work that cannot complete." : null;
  const [envelopes, mappings, results, prices] = await Promise.all([
    prisma.rawEnvelope.findMany({ where: { tenantId: operator.tenantId, providerConnectionId: connection.id }, orderBy: { receivedAt: "desc" }, take: 100, include: { from_InboxMessage_rawEnvelope: true } }),
    prisma.providerEntityMapping.findMany({ where: { tenantId: operator.tenantId, providerConnectionId: connection.id }, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.resultVersion.count({ where: { tenantId: operator.tenantId, providerConnectionId: connection.id } }),
    prisma.priceSnapshot.count({ where: { tenantId: operator.tenantId, providerConnectionId: connection.id } }),
  ]);
  return <OperatorShell active="Integrations" detail eyebrow="Provider detail" title={connection.adapterId} description="Connection settings, received messages, mappings and recovery." tenantName={operator.tenantName}>
    <DetailGrid items={[{ label: "Connection ID", value: connection.id }, { label: "Adapter version", value: connection.adapterVersion }, { label: "Configuration reference", value: connection.configReference }, { label: "Certification", value: <StatusBadge value={connection.certificationStatus} /> }, { label: "Runtime state", value: <StatusBadge value={connection.status} /> }, { label: "Price snapshots", value: prices }, { label: "Result versions", value: results }, { label: "Raw envelopes", value: envelopes.length }, { label: "Mappings", value: mappings.length }]} />
    <RecordList title="Webhook and transport envelopes" description="Payload bodies remain in the evidence store; this view shows bounded provenance metadata." columns={["External ID", "Direction / schema", "Inbox", "Received"]} rows={envelopes.map((envelope: any) => ({ id: envelope.id, cells: [<span key="external">{envelope.externalId}<span className="block font-mono text-xs text-muted-foreground">{shortId(envelope.payloadHash)}</span></span>, `${envelope.direction} · ${envelope.schemaVersion}`, envelope.from_InboxMessage_rawEnvelope.length ? envelope.from_InboxMessage_rawEnvelope.map((item: any) => item.status).join(", ") : "Not normalized", dateTime(envelope.receivedAt)] }))} emptyTitle="No envelopes for this connection" emptyDescription="No messages have been received from this provider yet." />
    <RecordList title="Entity mappings" description="Provider identifiers mapped to your events, competitors and markets." columns={["External", "Entity type", "Canonical", "State"]} rows={mappings.map((mapping: any) => ({ id: mapping.id, cells: [mapping.externalId, mapping.entityType, `${mapping.canonicalType} · ${shortId(mapping.canonicalId)}`, <StatusBadge key="state" value={mapping.status} />] }))} emptyTitle="No provider mappings" emptyDescription="No mappings have been added for this provider." />
    <MutationForm title="Connection recovery unavailable" description="No provider recovery/gap-query handler is implemented, so a recovery request could only dead-letter. Suspended markets are reopened manually after operator verification." mutation={recoverMutation} fields={[{ name: "aggregateType", label: "Aggregate type", type: "hidden", defaultValue: "PROVIDER_CONNECTION" }, { name: "aggregateId", label: "Connection", type: "hidden", defaultValue: connection.id }, { name: "eventType", label: "Recovery event", type: "hidden", defaultValue: "recovery.requested" }]} submitLabel="Unavailable" successMessage="No recovery was queued." disabledReason={recoveryUnavailable ?? (operator.capabilities.canManageIntegrations ? undefined : "Your role does not include integration management capability.")} />
    <WorkflowNote title="Webhook endpoint">Sandbox callbacks use <code>/api/sandbox/webhooks/[kind]</code> with <code>x-openfront-tenant-id</code> and <code>x-openfront-connection-id</code>; the signature covers the timestamp, that tenant and connection identity, and the raw body. Production enablement remains a separate certification concern.</WorkflowNote>
  </OperatorShell>;
}
