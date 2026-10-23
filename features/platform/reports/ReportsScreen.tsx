import { MutationForm } from '../components/MutationForm'
import { OperatorShell, TenantRequired } from '../components/OperatorShell'
import { MetricGrid, RecordList, StatusBadge, statusDotTone } from '../components/WorkflowUI'
import { Mono, type Tone } from '../components/kit'
import { dateTime, displayTimeZone, shortId } from '../lib/format'
import { getOperatorContext, platformPrisma as prisma } from '../lib/operator'
import { retentionUnsupportedReason } from '../../sportsbook/domain/retention'
import { outboxEventUnavailableReason } from '../../sportsbook/workers/replay-contract'

const exportUnavailable = outboxEventUnavailableReason('export.requested.v1') ? 'Export generation not implemented.' : undefined

const reportMutation = `mutation Report($type:String!,$periodStart:String!,$periodEnd:String!){generateComplianceReport(type:$type,periodStart:$periodStart,periodEnd:$periodEnd)}`

export async function ReportsScreen() {
  // Compliance reporting/retention and audit-only export are separate duties: either opens the screen, and each
  // action keeps its own server-checked capability.
  const context = await getOperatorContext()
  const operator = context && (context.capabilities.canManageCompliance || context.capabilities.canReadAudit) ? context : null
  if (!operator) return <OperatorShell active="Reports" eyebrow="Regulatory evidence" title="Reports"><TenantRequired /></OperatorShell>
  const complianceOnly = operator.capabilities.canManageCompliance ? undefined : 'Your role lacks compliance capability.'
  const tenantId = operator.tenantId
  const [reports, queued, artifacts, exports, retentionPolicies, retentionRuns, retentionApprovals] = await Promise.all([
    prisma.complianceReport.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' }, take: 100 }),
    prisma.outboxMessage.count({ where: { tenantId, eventType: 'report.generate', status: { in: ['PENDING', 'PROCESSING'] } } }),
    prisma.reportArtifact.findMany({ where: { tenantId }, orderBy: { generatedAt: 'desc' }, take: 100 }),
    prisma.dataExport.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' }, take: 100 }),
    prisma.retentionPolicyVersion.findMany({ where: { tenantId, status: 'ACTIVE' }, orderBy: { version: 'desc' }, take: 100 }),
    prisma.retentionExecution.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' }, take: 100 }),
    prisma.approvalRequest.findMany({where:{tenantId,action:{startsWith:'RETENTION_EXECUTION:'}},orderBy:{createdAt:'desc'},take:100}),
  ])
  // Display order only: generating/pending first, then failed, then neutral and done.
  const toneRank: Record<Tone, number> = { wait: 0, live: 0, alert: 1, info: 2, off: 3, ok: 4 }
  const dueFirst = <T,>(rows: T[], status: (row: T) => string | null | undefined) => rows.map((row, index) => ({ row, index })).sort((a, b) => toneRank[statusDotTone(status(a.row))] - toneRank[statusDotTone(status(b.row))] || a.index - b.index).map(({ row }) => row)
  const artifactState = (status: string) => status === 'READY' ? 'METADATA_ONLY' : status
  const artifactRows = artifacts.map((item: any) => ({ id: `artifact:${item.id}`, status: artifactState(item.status), cells: [<span key="id"><span>{item.type}</span><span className="block break-all font-mono text-xs font-normal text-muted-foreground">{item.contentHash}</span></span>, <Mono key="format">{`${item.format} · ${item.schemaVersion}`}</Mono>, <Mono key="rows">{String(item.rowCount)}</Mono>, <StatusBadge key="state" value={artifactState(item.status)} />] }))
  const exportRows = exports.map((item: any) => ({ id: `export:${item.id}`, status: artifactState(item.status), cells: [<span key="id"><span>Export {item.type}</span><span className="block font-mono text-xs font-normal text-muted-foreground">{shortId(item.id)}</span></span>, item.classification, <Mono key="rows">{String(item.rowCount)}</Mono>, <StatusBadge key="state" value={artifactState(item.status)} />] }))
  const formNow = new Date()
  const inProgress = reports.filter((report: any) => statusDotTone(report.status) === 'wait').length
  const failedReports = reports.filter((report: any) => statusDotTone(report.status) === 'alert').length
  const awaitingRetention = retentionRuns.filter((item: any) => item.status === 'PENDING_APPROVAL').length
  const unsupportedPolicies = retentionPolicies.filter((item: any) => retentionUnsupportedReason(item))
  const reportsTone: Tone | undefined = failedReports ? 'alert' : inProgress || queued ? 'wait' : undefined
  return <OperatorShell
    active="Reports"
    eyebrow="Regulatory evidence"
    title="Reports, exports & retention"
    tone={failedReports ? 'alert' : inProgress || queued || awaitingRetention ? 'wait' : 'ok'}
    meta={`${queued} jobs active · ${inProgress} in progress · ${failedReports} failed · ${awaitingRetention} retention awaiting approval`}
    tenantName={operator.tenantName}
  >
    <MetricGrid items={[
      { label: 'Jobs active', value: queued, tone: queued ? 'wait' : undefined },
      { label: 'Reports', value: reports.length, detail: failedReports ? `${failedReports} failed` : inProgress ? `${inProgress} in progress` : undefined, tone: failedReports ? 'alert' : inProgress ? 'wait' : undefined },
      { label: 'Retention', value: retentionRuns.length, detail: `${retentionPolicies.length} policies · ${awaitingRetention} awaiting`, tone: awaitingRetention ? 'wait' : undefined },
      { label: 'Artifacts', value: artifacts.length, detail: `${exports.length} exports · metadata only` },
    ]} />
    <RecordList title="Reports" tone={reportsTone} columns={['Report', 'Period', 'Artifact', 'State']} rows={dueFirst(reports, (report: any) => report.status).map((report: any) => ({ id: report.id, status: report.status, cells: [<span key="type"><span>{report.type}</span><span className="block font-mono text-xs font-normal text-muted-foreground">v{report.version} · {shortId(report.id)}</span></span>, <Mono key="period">{`${dateTime(report.periodStart)} → ${dateTime(report.periodEnd)}`}</Mono>, <span key="artifact" className="break-all font-mono text-xs">{shortId(report.artifactHash)}<span className="block text-muted-foreground">{report.artifactReference}</span></span>, <StatusBadge key="state" value={report.status} />] }))} emptyTitle="No reports" />
    <RecordList title="Retention executions" tone={awaitingRetention ? 'wait' : undefined} columns={['Execution', 'Window', 'Counts', 'State']} rows={dueFirst(retentionRuns, (item: any) => item.status).map((item: any) => ({ id: item.id, status: item.status, cells: [<span key="id"><Mono>{shortId(item.id)}</Mono><span className="block break-all font-mono text-xs font-normal text-muted-foreground">{item.dryRunHash}</span></span>, <Mono key="window">{`${dateTime(item.windowFrom)} → ${dateTime(item.windowTo)}`}</Mono>, <Mono key="counts">{`${item.candidateCount} candidate · ${item.heldCount} held · ${item.deletedCount} deleted · ${item.archivedCount ?? 0} tokenized`}</Mono>, <StatusBadge key="state" value={item.status} />] }))} emptyTitle="No retention executions" />
    <RecordList title="Artifacts & exports" columns={['Artifact', 'Classification · format', 'Rows', 'State']} rows={dueFirst([...artifactRows, ...exportRows], (row) => row.status)} emptyTitle="No artifact metadata" />
    <section className="space-y-3">
      <h2 className="text-sm font-semibold">Report draft</h2>
      <MutationForm disabledReason={complianceOnly} title="Record report draft" description="Metadata-only draft" mutation={reportMutation} fields={[{ name: 'type', label: 'Report type', type: 'select', options: ['WAGER_ACTIVITY', 'CUSTOMER_FUNDS', 'INTEGRITY_MONITORING', 'RESPONSIBLE_GAMING'].map(value => ({ label: value, value })) }, { name: 'periodStart', label: `Period start (${displayTimeZone()})`, type: 'datetime-local' }, { name: 'periodEnd', label: `Period end (${displayTimeZone()})`, type: 'datetime-local', help: 'DST-gap times rejected; repeated times need an offset' }]} submitLabel="Record draft" successMessage="Draft recorded; no artifact generated." />
    </section>
    <section className="space-y-3">
      <h2 className="text-sm font-semibold">Exports</h2>
      <div className="grid gap-4 xl:grid-cols-2">
        <MutationForm compact title="Request data export" mutation={`mutation($type:String!,$classification:String!,$scope:String!,$expiresAt:String!){requestDataExport(type:$type,classification:$classification,scope:$scope,expiresAt:$expiresAt)}`} fields={[{ name: 'type', label: 'Export type', type: 'select', options: ['AUDIT', 'WAGERS', 'FINANCE', 'CUSTOMERS', 'REGULATORY', 'PRIVACY'].map(value => ({ label: value, value })) }, { name: 'classification', label: 'Classification', type: 'select', options: ['INTERNAL', 'CONFIDENTIAL', 'RESTRICTED_PII', 'RESTRICTED_FINANCIAL', 'RESTRICTED_REGULATORY'].map(value => ({ label: value, value })) }, { name: 'scopeWindow', jsonPath: 'scope.window', label: 'Scope window', defaultValue: 'last-30-days' }, { name: 'scopeFields', jsonPath: 'scope.fields', label: 'Field set', defaultValue: 'approved-projection' }, { name: 'expiresAt', label: 'Expires', defaultValue: new Date(formNow.getTime() + 24 * 3_600_000).toISOString() }]} submitLabel="Request export" successMessage="Export request saved; no file generated." disabledReason={exportUnavailable ?? (operator.capabilities.canReadAudit ? undefined : 'Your role lacks audit/export capability.')} />
        <MutationForm compact title="Apply approved export" mutation={`mutation($exportId:ID!,$approvalId:ID!){applyApprovedDataExport(exportId:$exportId,approvalId:$approvalId)}`} fields={[{ name: 'exportId', label: 'Pending export ID' }, { name: 'approvalId', label: 'Approved request ID' }]} submitLabel="Queue approved export" successMessage="Export queued; file delivery unavailable." disabledReason={exportUnavailable ?? (operator.capabilities.canReadAudit ? undefined : 'Your role lacks audit/export capability.')} />
      </div>
    </section>
    <section className="space-y-3">
      <h2 className="text-sm font-semibold">Retention</h2>
      <div className="grid gap-4 xl:grid-cols-3">
        <MutationForm compact disabledReason={complianceOnly} title="Run retention dry-run" description={unsupportedPolicies.length ? `Not executable: ${unsupportedPolicies.map((item: any) => `${item.recordClass} (${item.deletionMode})`).join(', ')}` : undefined} mutation={`mutation($policyId:ID!,$windowFrom:String!,$windowTo:String!){runRetentionDryRun(policyId:$policyId,windowFrom:$windowFrom,windowTo:$windowTo)}`} fields={[{ name: 'policyId', label: 'Active policy', type: 'select', options: retentionPolicies.filter((item: any) => !retentionUnsupportedReason(item)).map((item: any) => ({ label: `${item.recordClass} v${item.version} · ${item.deletionMode} after ${item.retentionDays}d`, value: item.id })) }, { name: 'windowFrom', label: 'From', defaultValue: new Date(0).toISOString() }, { name: 'windowTo', label: 'To', defaultValue: new Date(formNow.getTime() - 31 * 86_400_000).toISOString() }]} submitLabel="Dry run" successMessage="Candidates and holds hashed." />
        <MutationForm compact disabledReason={complianceOnly} title="Request retention execution" mutation={`mutation($executionId:ID!,$reason:String!){requestRetentionExecution(executionId:$executionId,reason:$reason)}`} fields={[{ name: 'executionId', label: 'Dry-run execution', type: 'select', options: retentionRuns.filter((item: any) => item.status === 'DRY_RUN').map((item: any) => ({ label: `${shortId(item.id)} · ${item.candidateCount} candidates`, value: item.id })) }, { name: 'reason', label: 'Reason', placeholder: 'Reason' }]} submitLabel="Request approval" successMessage="Retention approval requested." />
        <MutationForm compact disabledReason={complianceOnly} title="Apply approved retention" mutation={`mutation($executionId:ID!,$approvalId:ID!){applyRetentionExecution(executionId:$executionId,approvalId:$approvalId)}`} fields={[{ name: 'executionId', label: 'Approved execution', type: 'select', options: retentionRuns.filter((item: any) => item.status === 'PENDING_APPROVAL').map((item: any) => ({ label: shortId(item.id), value: item.id })) }, { name: 'approvalId', label: 'Approved request', type: 'select', options: retentionApprovals.filter((item: any) => item.status === 'APPROVED').map((item: any) => ({ label: `${shortId(item.id)} · ${item.action}`, value: item.id })) }]} submitLabel="Execute policy" successMessage="Retention execution completed." />
      </div>
    </section>
  </OperatorShell>
}
