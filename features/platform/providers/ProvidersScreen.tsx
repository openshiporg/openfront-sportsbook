import { ExternalGateNotice, OperatorShell, TenantRequired } from '../components/OperatorShell'
import { MutationForm } from '../components/MutationForm'
import { MetricGrid, RecordList, StatusBadge, statusDotTone } from '../components/WorkflowUI'
import { Mono, type Tone } from '../components/kit'
import { dateTime, shortId } from '../lib/format'
import { getOperatorContext, platformPrisma as prisma } from '../lib/operator'

// Display order only: failing feeds first, then waiting, unmeasured, healthy.
const toneRank: Record<Tone, number> = { alert: 0, live: 1, wait: 1, off: 2, info: 2, ok: 3 }

export async function ProvidersScreen() {
  const operator = await getOperatorContext('canManageIntegrations')
  if (!operator) return <OperatorShell active="Providers" eyebrow="Capability control" title="Providers & certification"><TenantRequired /></OperatorShell>
  const tenantId = operator.tenantId,
    [connections, health, runs, replays] = await Promise.all([
      prisma.providerConnection.findMany({ where: { tenantId }, orderBy: [{ failoverPriority: 'asc' }, { adapterId: 'asc' }], take: 100 }),
      prisma.providerHealthSample.findMany({ where: { tenantId }, orderBy: { checkedAt: 'desc' }, take: 200 }),
      prisma.adapterCertificationRun.findMany({ where: { tenantId }, orderBy: { startedAt: 'desc' }, take: 100 }),
      prisma.tradingReplayRun.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' }, take: 50 }),
    ])
  const connectionOptions = connections.map((item: any) => ({ label: item.adapterId, value: item.id }))
  type Feed = { item: any; latest: any; run: any; state: string; tone: Tone }
  const feeds: Feed[] = connections.map((item: any): Feed => {
    const latest: any = health.find((row: any) => row.providerConnectionId === item.id)
    const run: any = runs.find((row: any) => row.providerConnectionId === item.id)
    // Effective state shown on the row: administrative state wins when it is not ACTIVE.
    const state: string = item.status === 'DISABLED' ? 'DISABLED' : item.status === 'DEGRADED' ? 'DEGRADED' : latest?.status ?? 'UNKNOWN'
    return { item, latest, run, state, tone: statusDotTone(state) }
  })
  const ordered = feeds.map((feed: Feed, index: number) => ({ feed, index })).sort((a: { feed: Feed; index: number }, b: { feed: Feed; index: number }) => toneRank[a.feed.tone] - toneRank[b.feed.tone] || a.index - b.index).map(({ feed }: { feed: Feed }) => feed)
  const failing = feeds.filter((feed) => feed.tone === 'alert').length
  const degraded = connections.filter((item: any) => item.status === 'DEGRADED').length
  const unmeasured = feeds.filter((feed) => feed.item.status !== 'DISABLED' && !feed.latest).length
  const active = connections.filter((item: any) => item.status === 'ACTIVE').length
  const passed = runs.filter((item: any) => item.status === 'PASSED').length
  const pageTone: Tone | undefined = connections.length === 0 ? undefined : failing ? 'alert' : degraded || unmeasured ? 'wait' : 'ok'
  return <OperatorShell
    active="Providers"
    eyebrow="Capability control"
    title="Providers & certification"
    tone={pageTone}
    meta={`${connections.length} feeds · ${failing} failing · ${degraded} degraded · ${unmeasured} unprobed`}
    tenantName={operator.tenantName}
  >
    <MetricGrid items={[
      { label: 'Failing', value: failing, tone: failing ? 'alert' : 'ok' },
      { label: 'Degraded', value: degraded, tone: degraded ? 'wait' : 'ok' },
      { label: 'Active', value: `${active}/${connections.length}`, detail: unmeasured ? `${unmeasured} unprobed` : undefined, tone: unmeasured ? 'wait' : undefined },
      { label: 'Certification', value: `${passed}/${runs.length}`, detail: `${replays.length} replay rows` },
    ]} />
    <RecordList
      title="Feed health"
      tone={pageTone}
      columns={['Adapter', 'Health', 'Certification', 'Capabilities']}
      rows={ordered.map(({ item, latest, run, state }) => ({
        id: item.id,
        href: `/dashboard/platform/integrations/${item.id}`,
        status: state,
        cells: [
          <span key="adapter" className="inline min-w-0"><span className="break-all">{item.adapterId}</span><span className="block text-xs font-normal text-muted-foreground"><Mono>v{item.adapterVersion} · p{item.failoverPriority}</Mono></span></span>,
          item.status === 'DISABLED'
            ? <div key="health"><StatusBadge value="DISABLED" /><p className="mt-1 text-xs text-muted-foreground">Not probed</p></div>
            : latest
              ? <div key="health"><StatusBadge value={latest.status} /><p className="mt-1 text-xs text-muted-foreground">{(latest.details as any)?.source === 'sandbox-probe' ? 'Simulated probe' : String((latest.details as any)?.source ?? 'Unlabeled sample')} · <Mono>{dateTime(latest.checkedAt)}{typeof latest.latencyMs === 'number' ? ` · ${latest.latencyMs}ms` : ''}</Mono></p></div>
              : <span key="health" className="text-xs">Unmeasured</span>,
          <div key="cert"><StatusBadge value={item.certificationStatus} /><p className="mt-1 text-xs text-muted-foreground">{run ? <Mono>{`${run.passed}/${run.passed + run.failed} · ${shortId(run.id)}`}</Mono> : 'No run'}</p></div>,
          <span key="cap" className="break-all font-mono text-xs">{JSON.stringify(item.capabilities)}</span>,
        ],
      }))}
      emptyTitle="No providers"
    />
    <section className="space-y-3">
      <h2 className="text-sm font-semibold">Controls</h2>
      <div className="grid gap-4 xl:grid-cols-3">
        <MutationForm compact title="Change provider state" mutation={`mutation($connectionId:ID!,$status:String!,$reason:String!){setProviderOperationalState(connectionId:$connectionId,status:$status,reason:$reason)}`} fields={[{ name: 'connectionId', label: 'Connection', type: 'select', options: connectionOptions }, { name: 'status', label: 'State', type: 'select', options: ['ACTIVE', 'DEGRADED', 'DISABLED'].map((value) => ({ label: value, value })) }, { name: 'reason', label: 'Reason', placeholder: 'Reason' }]} submitLabel="Apply state" successMessage="Provider state saved." />
        <MutationForm compact title="Run sandbox conformance suite" description="Sandbox adapters only" mutation={`mutation($connectionId:ID!){runAdapterCertification(connectionId:$connectionId)}`} fields={[{ name: 'connectionId', label: 'Provider connection', type: 'select', options: connectionOptions }]} submitLabel="Run suite" successMessage="Conformance run saved." />
        <MutationForm compact title="Deterministic replay unavailable" mutation={`mutation($connectionId:ID!,$scopeType:String!,$scopeId:ID!,$frontier:String!){runTradingReplay(connectionId:$connectionId,scopeType:$scopeType,scopeId:$scopeId,frontier:$frontier)}`} fields={[{ name: 'connectionId', label: 'Connection', type: 'select', options: connectionOptions }, { name: 'scopeType', label: 'Scope type', defaultValue: 'TENANT' }, { name: 'scopeId', label: 'Scope ID', defaultValue: tenantId }, { name: 'frontier', label: 'Envelope frontier', defaultValue: '0' }]} submitLabel="Unavailable" successMessage="No replay was run." disabledReason="Replay comparator not implemented." />
      </div>
    </section>
    <ExternalGateNotice />
  </OperatorShell>
}
