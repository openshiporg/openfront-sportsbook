import { MutationForm } from '../components/MutationForm'
import { OperatorShell, TenantRequired } from '../components/OperatorShell'
import { DetailGrid, MetricGrid, RecordList, StatusBadge, statusDotTone } from '../components/WorkflowUI'
import { Mono, type Tone } from '../components/kit'
import { dateTime, shortId } from '../lib/format'
import { getOperatorContext, platformPrisma as prisma } from '../lib/operator'

// Display order only: failed/dead first, then retrying, neutral, delivered.
const toneRank: Record<Tone, number> = { alert: 0, live: 1, wait: 1, off: 2, info: 2, ok: 3 }
function attentionFirst<T>(rows: T[], status: (row: T) => string | null | undefined) {
  return rows.map((row, index) => ({ row, index })).sort((a, b) => toneRank[statusDotTone(status(a.row))] - toneRank[statusDotTone(status(b.row))] || a.index - b.index).map(({ row }) => row)
}

export async function WebhooksScreen() {
  const operator = await getOperatorContext('canManageIntegrations')
  if (!operator) return <OperatorShell active="Webhooks" eyebrow="Transport evidence" title="Webhooks"><TenantRequired /></OperatorShell>
  const tenantId = operator.tenantId,
    [envelopes, endpoints, deliveries, approvals] = await Promise.all([
      prisma.rawEnvelope.findMany({ where: { tenantId, direction: 'INBOUND' }, orderBy: { receivedAt: 'desc' }, take: 200, include: { providerConnection: true, from_InboxMessage_rawEnvelope: true } }),
      prisma.webhookEndpoint.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' }, take: 100 }),
      prisma.webhookDelivery.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' }, take: 200, include: { endpoint: true } }),
      prisma.approvalRequest.findMany({ where: { tenantId, action: { startsWith: 'WEBHOOK_ENDPOINT:' } }, orderBy: { createdAt: 'desc' }, take: 100 }),
    ]),
    normalized = envelopes.filter((item: any) => item.from_InboxMessage_rawEnvelope.length > 0).length
  const failures = deliveries.filter((item: any) => ['FAILED', 'DEAD'].includes(item.status)).length
  const delivered = deliveries.filter((item: any) => item.status === 'DELIVERED').length
  const activeEndpoints = endpoints.filter((item: any) => item.status === 'ACTIVE').length
  const notNormalized = envelopes.length - normalized
  const envelopeState = (item: any) => item.from_InboxMessage_rawEnvelope.length ? item.from_InboxMessage_rawEnvelope[0].status : 'NOT_NORMALIZED'
  return <OperatorShell
    active="Webhooks"
    eyebrow="Transport evidence"
    title="Webhooks"
    tone={failures ? 'alert' : notNormalized ? 'wait' : 'ok'}
    meta={`${failures} failed deliveries · ${notNormalized} not normalized · ${activeEndpoints}/${endpoints.length} endpoints active`}
    tenantName={operator.tenantName}
  >
    <MetricGrid items={[
      { label: 'Failed deliveries', value: failures, tone: failures ? 'alert' : 'ok' },
      { label: 'Delivered', value: `${delivered}/${deliveries.length}` },
      { label: 'Inbound', value: envelopes.length, detail: notNormalized ? `${notNormalized} not normalized` : `${normalized} normalized`, tone: notNormalized ? 'wait' : undefined },
      { label: 'Endpoints', value: `${activeEndpoints}/${endpoints.length}`, detail: 'active' },
    ]} />
    <RecordList title="Outbound deliveries" tone={failures ? 'alert' : undefined} columns={['Delivery', 'Endpoint · event', 'Attempts · code', 'State']} rows={attentionFirst(deliveries, (item: any) => item.status).map((item: any) => ({ id: item.id, status: item.status, cells: [<span key="id"><Mono>{shortId(item.deliveryId)}</Mono><span className="block break-all font-mono text-xs font-normal text-muted-foreground">{item.payloadHash}</span></span>, <span key="endpoint" className="break-words">{item.endpoint?.name ?? 'Missing'} · <Mono>{`${item.eventType}.${item.eventVersion}`}</Mono></span>, <Mono key="attempts">{`${item.attempts} · ${item.lastResponseCode ?? '—'}`}</Mono>, <StatusBadge key="state" value={item.status} />] }))} emptyTitle="No outbound deliveries" />
    <RecordList title="Inbound envelopes" tone={notNormalized ? 'wait' : undefined} columns={['External message', 'Provider · schema', 'Normalization', 'Received']} rows={attentionFirst(envelopes, (item: any) => envelopeState(item) === 'NOT_NORMALIZED' ? 'PENDING' : envelopeState(item)).map((item: any) => ({ id: item.id, status: envelopeState(item) === 'NOT_NORMALIZED' ? 'PENDING' : envelopeState(item), href: item.providerConnectionId ? `/dashboard/platform/integrations/${item.providerConnectionId}` : undefined, cells: [<span key="external"><span className="break-all">{item.externalId}</span><span className="block font-mono text-xs font-normal text-muted-foreground">{shortId(item.payloadHash)}</span></span>, `${item.providerConnection?.adapterId || 'Unlinked'} · ${item.schemaVersion}`, <StatusBadge key="status" value={envelopeState(item)} />, <Mono key="received">{dateTime(item.receivedAt)}</Mono>] }))} emptyTitle="No inbound envelopes" />
    <section className="space-y-3">
      <h2 className="text-sm font-semibold">Endpoints</h2>
      {endpoints.length > 0 && <MutationForm compact title="Send signed test event" mutation={`mutation($endpointId:ID!){testWebhookEndpoint(endpointId:$endpointId)}`} fields={[{ name: 'endpointId', label: 'Active endpoint', type: 'select', options: endpoints.filter((item: any) => item.status === 'ACTIVE').map((item: any) => ({ label: item.name, value: item.id })) }]} submitLabel="Queue test delivery" successMessage="Test delivery queued." />}
      <div className="grid gap-4 xl:grid-cols-2">
        <MutationForm compact title="Request outbound endpoint" description="Dual approval required" mutation={`mutation($name:String!,$url:String!,$eventTypes:String!,$secretReference:String!,$reason:String!){requestWebhookEndpoint(name:$name,url:$url,eventTypes:$eventTypes,secretReference:$secretReference,reason:$reason)}`} fields={[{ name: 'name', label: 'Endpoint name', placeholder: 'Settlement events receiver' }, { name: 'url', label: 'HTTPS URL', placeholder: 'https://' }, { name: 'eventTypes', jsonPath: 'eventTypes', transform: 'list', label: 'Event types', defaultValue: 'wager.settled.v2, payment.completed.v1', help: 'Comma-separated, ordered' }, { name: 'secretReference', label: 'Key reference label', placeholder: 'Signed with platform-outbound-v1' }, { name: 'reason', label: 'Reason', placeholder: 'Reason' }]} submitLabel="Request endpoint approval" successMessage="Endpoint approval requested." />
        <MutationForm compact title="Apply approved endpoint" mutation={`mutation($name:String!,$url:String!,$eventTypes:String!,$secretReference:String!,$approvalId:ID!){applyWebhookEndpoint(name:$name,url:$url,eventTypes:$eventTypes,secretReference:$secretReference,approvalId:$approvalId)}`} fields={[{ name: 'name', label: 'Exact name' }, { name: 'url', label: 'Exact HTTPS URL' }, { name: 'eventTypes', jsonPath: 'eventTypes', transform: 'list', label: 'Exact event types', placeholder: 'wager.settled.v2, payment.completed.v1', help: 'Same list and order as approved' }, { name: 'secretReference', label: 'Exact key reference' }, { name: 'approvalId', label: 'Approved request', type: 'select', options: approvals.filter((item: any) => item.status === 'APPROVED').map((item: any) => ({ label: `${shortId(item.id)} · ${item.action}`, value: item.id })) }]} submitLabel="Activate endpoint" successMessage="Outbound endpoint activated." />
      </div>
    </section>
    <DetailGrid items={[
      { label: 'Inbound route', value: <code className="break-all font-mono text-xs">/api/sandbox/webhooks/[kind]</code> },
      { label: 'Outbound signature', value: <code className="break-all font-mono text-xs">timestamp + delivery ID + raw body</code> },
      { label: 'Outbound hosts', value: 'Approved HTTPS only; no private ranges or redirects' },
    ]} />
  </OperatorShell>
}
