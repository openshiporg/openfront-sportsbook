import { notFound } from "next/navigation";
import { MutationForm } from "../components/MutationForm";
import { OperatorShell, TenantRequired } from "../components/OperatorShell";
import { DetailGrid, MetricGrid, RecordList, StatusBadge, statusDotTone } from "../components/WorkflowUI";
import { Mono } from "../components/kit";
import { dateTime, shortId } from "../lib/format";
import { getOperatorContext, platformPrisma as prisma } from "../lib/operator";
import { outboxEventUnavailableReason } from "../../sportsbook/workers/replay-contract";

const recoverMutation = `mutation Recover($aggregateType:String!,$aggregateId:ID!,$eventType:String!){enqueueRecovery(aggregateType:$aggregateType,aggregateId:$aggregateId,eventType:$eventType)}`;

export async function IntegrationDetailScreen({ connectionId }: { connectionId: string }) {
  const operator = await getOperatorContext("canManageIntegrations");
  if (!operator) return <OperatorShell active="Integrations" detail eyebrow="Provider detail" title="Integration evidence"><TenantRequired /></OperatorShell>;
  const connection = await prisma.providerConnection.findFirst({ where: { id: connectionId, tenantId: operator.tenantId } });
  if (!connection) notFound();
  const recoveryUnavailable = outboxEventUnavailableReason("recovery.requested") ? "No recovery handler implemented." : null;
  const [envelopes, mappings, results, prices] = await Promise.all([
    prisma.rawEnvelope.findMany({ where: { tenantId: operator.tenantId, providerConnectionId: connection.id }, orderBy: { receivedAt: "desc" }, take: 100, include: { from_InboxMessage_rawEnvelope: true } }),
    prisma.providerEntityMapping.findMany({ where: { tenantId: operator.tenantId, providerConnectionId: connection.id }, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.resultVersion.count({ where: { tenantId: operator.tenantId, providerConnectionId: connection.id } }),
    prisma.priceSnapshot.count({ where: { tenantId: operator.tenantId, providerConnectionId: connection.id } }),
  ]);
  const unnormalized = envelopes.filter((envelope: any) => !envelope.from_InboxMessage_rawEnvelope.length).length;
  const failedEnvelopes = envelopes.filter((envelope: any) => envelope.from_InboxMessage_rawEnvelope.some((item: any) => statusDotTone(item.status) === "alert")).length;
  const connectionTone = statusDotTone(connection.status);
  return <OperatorShell
    active="Integrations"
    detail
    eyebrow="Provider detail"
    title={connection.adapterId}
    tone={connectionTone}
    meta={`${connection.status} · cert ${connection.certificationStatus} · ${envelopes.length} envelopes · ${failedEnvelopes} failed`}
    tenantName={operator.tenantName}
  >
    <MetricGrid items={[
      { label: "State", value: <StatusBadge value={connection.status} />, tone: connectionTone },
      { label: "Failed inbox", value: failedEnvelopes, detail: unnormalized ? `${unnormalized} not normalized` : undefined, tone: failedEnvelopes ? "alert" : unnormalized ? "wait" : "ok" },
      { label: "Price snapshots", value: prices },
      { label: "Result versions", value: results },
    ]} />
    <RecordList title="Envelopes" tone={failedEnvelopes ? "alert" : undefined} columns={["External ID", "Direction · schema", "Inbox", "Received"]} rows={envelopes.map((envelope: any) => {
      const inboxStates = envelope.from_InboxMessage_rawEnvelope.map((item: any) => item.status);
      const worst = inboxStates.find((value: string) => statusDotTone(value) === "alert") ?? inboxStates[0];
      return { id: envelope.id, status: worst ?? "PENDING", cells: [<span key="external"><span className="break-all">{envelope.externalId}</span><span className="block break-all font-mono text-xs font-normal text-muted-foreground">{shortId(envelope.payloadHash)}</span></span>, <Mono key="dir">{`${envelope.direction} · ${envelope.schemaVersion}`}</Mono>, inboxStates.length ? <span key="inbox" className="flex flex-wrap gap-x-3">{inboxStates.map((value: string, index: number) => <StatusBadge key={index} value={value} />)}</span> : "Not normalized", <Mono key="received">{dateTime(envelope.receivedAt)}</Mono>] };
    })} emptyTitle="No envelopes" />
    <RecordList title="Entity mappings" columns={["External", "Entity type", "Canonical", "State"]} rows={mappings.map((mapping: any) => ({ id: mapping.id, status: mapping.status, cells: [<span key="external" className="break-all">{mapping.externalId}</span>, mapping.entityType, <span key="canonical">{mapping.canonicalType} · <Mono>{shortId(mapping.canonicalId)}</Mono></span>, <StatusBadge key="state" value={mapping.status} />] }))} emptyTitle="No mappings" />
    <DetailGrid items={[
      { label: "Connection ID", value: <Mono className="break-all">{connection.id}</Mono> },
      { label: "Adapter version", value: <Mono>{connection.adapterVersion}</Mono> },
      { label: "Configuration reference", value: <Mono className="break-all">{connection.configReference}</Mono> },
      { label: "Certification", value: <StatusBadge value={connection.certificationStatus} /> },
      { label: "Raw envelopes", value: <Mono>{envelopes.length}</Mono> },
      { label: "Mappings", value: <Mono>{mappings.length}</Mono> },
      { label: "Sandbox webhook", value: <code className="break-all font-mono text-xs">/api/sandbox/webhooks/[kind]</code> },
      { label: "Headers", value: <code className="break-all font-mono text-xs">x-openfront-tenant-id · x-openfront-connection-id</code> },
      { label: "Signature covers", value: "Timestamp, tenant, connection, raw body" },
    ]} />
    <MutationForm title="Connection recovery unavailable" mutation={recoverMutation} fields={[{ name: "aggregateType", label: "Aggregate type", type: "hidden", defaultValue: "PROVIDER_CONNECTION" }, { name: "aggregateId", label: "Connection", type: "hidden", defaultValue: connection.id }, { name: "eventType", label: "Recovery event", type: "hidden", defaultValue: "recovery.requested" }]} submitLabel="Unavailable" successMessage="No recovery was queued." disabledReason={recoveryUnavailable ?? (operator.capabilities.canManageIntegrations ? undefined : "Integration management required.")} />
  </OperatorShell>;
}
