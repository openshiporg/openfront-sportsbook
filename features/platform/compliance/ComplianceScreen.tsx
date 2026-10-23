import { ExternalGateNotice, OperatorShell, TenantRequired } from '../components/OperatorShell'
import { MutationForm } from '../components/MutationForm'
import { Mono } from '../components/kit'
import { MetricGrid, RecordList, StatusBadge } from '../components/WorkflowUI'
import { dateTime, shortId } from '../lib/format'
import { getOperatorContext, platformPrisma as prisma } from '../lib/operator'

const OPEN_SCREENING = ['POTENTIAL', 'REVIEW', 'CONFIRMED']
const CLOSED_INTEGRITY = ['CLEARED', 'CLOSED']
const CLOSED_PRIVACY = ['COMPLETED', 'DENIED']

export async function ComplianceScreen() {
  const operator = await getOperatorContext('canManageCompliance')
  if (!operator) return <OperatorShell active="Compliance" title="Compliance & integrity"><TenantRequired /></OperatorShell>
  const tenantId = operator.tenantId,
    [players, verification, aml, screening, geo, affordability, integrity, privacy, restrictions] = await Promise.all([
      prisma.player.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' }, take: 100 }),
      prisma.verificationCase.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' }, take: 100 }),
      prisma.aMLCase.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' }, take: 100 }),
      prisma.screeningHit.findMany({ where: { tenantId }, orderBy: { screenedAt: 'desc' }, take: 100 }),
      prisma.geoCheck.findMany({ where: { tenantId }, orderBy: { checkedAt: 'desc' }, take: 100, include: { geoSession: true } }),
      prisma.affordabilityAssessment.findMany({ where: { tenantId }, orderBy: { assessedAt: 'desc' }, take: 100 }),
      prisma.integrityCase.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' }, take: 100 }),
      prisma.customerPrivacyRequest.findMany({ where: { tenantId }, orderBy: { requestedAt: 'desc' }, take: 100 }),
      prisma.accountRestriction.findMany({ where: { tenantId, status: 'ACTIVE' }, take: 100 }),
    ])

  const pendingVerification = verification.filter((item: any) => item.status === 'PENDING')
  const openScreening = screening.filter((item: any) => OPEN_SCREENING.includes(item.status))
  const openIntegrity = integrity.filter((item: any) => !CLOSED_INTEGRITY.includes(item.status))
  const openPrivacy = privacy.filter((item: any) => !CLOSED_PRIVACY.includes(item.status))
  const needKyc = players.filter((item: any) => item.kycStatus !== 'APPROVED').length
  const amlOpen = aml.filter((item: any) => item.status !== 'CLOSED').length
  const affordabilityReviews = affordability.filter((item: any) => item.decision !== 'ALLOW' && item.expiresAt > new Date()).length
  const decisions = pendingVerification.length + openScreening.length + openIntegrity.length + openPrivacy.length
  // Open items first; each group keeps its newest-first order.
  const openFirst = <T,>(items: T[], isOpen: (item: T) => boolean) => [...items.filter(isOpen), ...items.filter((item) => !isOpen(item))]

  return <OperatorShell
    active="Compliance"
    title="Compliance & integrity"
    tenantName={operator.tenantName}
    tone={decisions ? 'wait' : 'ok'}
    meta={`${players.length} players · ${needKyc} need KYC · ${amlOpen} AML open · ${restrictions.length} restrictions · ${affordabilityReviews} affordability`}
  >
    <MetricGrid items={[
      { label: 'Verification', value: pendingVerification.length, detail: `${verification.length} cases`, tone: pendingVerification.length ? 'wait' : 'ok' },
      { label: 'Screening hits', value: openScreening.length, detail: 'open', tone: openScreening.length ? 'alert' : 'ok' },
      { label: 'Integrity', value: openIntegrity.length, detail: 'open', tone: openIntegrity.length ? 'alert' : 'ok' },
      { label: 'Privacy', value: openPrivacy.length, detail: 'open', tone: openPrivacy.length ? 'wait' : 'ok' },
    ]} />

    <div className="grid gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <RecordList
        title="Pending verification"
        tone={pendingVerification.length ? 'wait' : undefined}
        columns={['Case', 'Type', 'Player', 'Opened']}
        rows={pendingVerification.map((item: any) => ({
          id: item.id,
          status: item.status,
          href: item.playerId ? `/dashboard/platform/customers/${item.playerId}` : undefined,
          cells: [<Mono key="case" className="break-all">{shortId(item.id)}</Mono>, item.type ?? '—', item.playerId ? <Mono key="player" className="break-all">{shortId(item.playerId)}</Mono> : '—', dateTime(item.createdAt)],
        }))}
        emptyTitle="No pending verification"
      />
      <MutationForm compact title="Decide verification" mutation={`mutation($caseId:ID!,$decision:String!,$reason:String!){decideVerificationCase(caseId:$caseId,decision:$decision,reason:$reason)}`} fields={[{ name: 'caseId', label: 'Case ID' }, { name: 'decision', label: 'Decision', type: 'select', options: ['APPROVED', 'REJECTED'].map(value => ({ label: value, value })) }, { name: 'reason', label: 'Reason code' }]} submitLabel="Record decision" successMessage="Verification evidence decided." />
    </div>

    <div className="grid gap-4 xl:grid-cols-2">
      <RecordList
        title="Screening hits"
        tone={openScreening.length ? 'alert' : undefined}
        columns={['Reference', 'Type', 'Evidence', 'State']}
        rows={openFirst(screening, (item: any) => OPEN_SCREENING.includes(item.status)).map((item: any) => ({ id: item.id, status: item.status, cells: [<Mono key="ref" className="break-all">{shortId(item.id)}</Mono>, item.screeningType, <span key="evidence" className="break-all">{item.evidenceReference}</span>, <StatusBadge key="state" value={item.status} />] }))}
        emptyTitle="No screening hits"
      />
      <RecordList
        title="Integrity cases"
        tone={openIntegrity.length ? 'alert' : undefined}
        columns={['Case', 'Type', 'Severity', 'State']}
        rows={openFirst(integrity, (item: any) => !CLOSED_INTEGRITY.includes(item.status)).map((item: any) => ({ id: item.id, status: item.status, cells: [<Mono key="case" className="break-all">{shortId(item.id)}</Mono>, item.type, <StatusBadge key="severity" value={item.severity} />, <StatusBadge key="status" value={item.status} />] }))}
        emptyTitle="No integrity cases"
      />
    </div>

    <div className="grid gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <RecordList
        title="Privacy requests"
        tone={openPrivacy.length ? 'wait' : undefined}
        columns={['Request', 'Type', 'Due', 'State']}
        rows={openFirst(privacy, (item: any) => !CLOSED_PRIVACY.includes(item.status)).map((item: any) => ({ id: item.id, status: item.status, cells: [<Mono key="req" className="break-all">{shortId(item.id)}</Mono>, item.type, <Mono key="due">{dateTime(item.dueAt)}</Mono>, <StatusBadge key="status" value={item.status} />] }))}
        emptyTitle="No privacy requests"
      />
      <MutationForm compact requireReview title="Process privacy request" mutation={`mutation($requestId:ID!,$status:String!,$reason:String!,$artifactReference:String){transitionPrivacyRequest(requestId:$requestId,status:$status,reason:$reason,artifactReference:$artifactReference)}`} fields={[{ name: 'requestId', label: 'Privacy request', type: 'select', options: privacy.filter((item: any) => !CLOSED_PRIVACY.includes(item.status)).map((item: any) => ({ label: `${shortId(item.id)} · ${item.type} · ${item.status} · due ${dateTime(item.dueAt)}`, value: item.id })) }, { name: 'status', label: 'Next state', type: 'select', options: [{ label: 'Verifying identity', value: 'VERIFYING' }, { label: 'In progress', value: 'IN_PROGRESS' }, { label: 'Completed', value: 'COMPLETED' }, { label: 'Denied', value: 'DENIED' }] }, { name: 'reason', label: 'Decision reason', type: 'textarea' }, { name: 'artifactReference', label: 'Response artifact reference', required: false }]} submitLabel="Record privacy step" successMessage="Privacy request updated." />
    </div>

    <section className="min-w-0 space-y-3">
      <h2 className="text-sm font-semibold">Open & review</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MutationForm compact title="Open verification case" mutation={`mutation($playerId:ID!,$type:String!,$evidenceReference:String!){openVerificationCase(playerId:$playerId,type:$type,evidenceReference:$evidenceReference)}`} fields={[{ name: 'playerId', label: 'Player ID' }, { name: 'type', label: 'Type', type: 'select', options: ['KYC', 'AGE', 'ADDRESS'].map(value => ({ label: value, value })) }, { name: 'evidenceReference', label: 'Evidence reference' }]} submitLabel="Open case" successMessage="Verification case opened." />
        <MutationForm compact title="Review AML risk" mutation={`mutation($playerId:ID!,$status:String!,$riskBand:String!,$reason:String!){reviewAMLCase(playerId:$playerId,status:$status,riskBand:$riskBand,reason:$reason)}`} fields={[{ name: 'playerId', label: 'Player ID' }, { name: 'status', label: 'Case state', type: 'select', options: ['OPEN', 'REVIEW', 'CLOSED'].map(value => ({ label: value, value })) }, { name: 'riskBand', label: 'Risk band', type: 'select', options: ['LOW', 'MEDIUM', 'HIGH'].map(value => ({ label: value, value })) }, { name: 'reason', label: 'Restricted reason' }]} submitLabel="Update case" successMessage="AML case updated and audited." />
        <MutationForm compact title="Record screening" description="Sanctions / PEP" mutation={`mutation($playerId:ID!,$screeningType:String!,$status:String!,$reason:String!,$evidenceReference:String!){recordComplianceScreening(playerId:$playerId,screeningType:$screeningType,status:$status,reason:$reason,evidenceReference:$evidenceReference)}`} fields={[{ name: 'playerId', label: 'Player', type: 'select', options: players.map((item: any) => ({ label: shortId(item.id), value: item.id })) }, { name: 'screeningType', label: 'Screening type', type: 'select', options: ['SANCTIONS', 'PEP', 'ADVERSE_MEDIA', 'SOURCE_OF_FUNDS'].map(value => ({ label: value, value })) }, { name: 'status', label: 'Decision', type: 'select', options: ['POTENTIAL', 'REVIEW', 'CONFIRMED', 'CLEARED', 'FALSE_POSITIVE'].map(value => ({ label: value, value })) }, { name: 'reason', label: 'Disposition reason' }, { name: 'evidenceReference', label: 'Restricted evidence reference' }]} submitLabel="Record screening" successMessage="Screening result and restrictions saved." />
      </div>
    </section>

    <RecordList
      title="Players"
      columns={['Player', 'Identity', 'Latest geo', 'Restrictions']}
      rows={players.map((item: any) => {
        const latestGeo = geo.find((row: any) => row.geoSession?.playerId === item.id),
          activeRestrictions = restrictions.filter((row: any) => row.playerId === item.id)
        return {
          id: item.id,
          status: item.kycStatus,
          href: `/dashboard/platform/customers/${item.id}`,
          cells: [
            <span key="player"><Mono className="break-all font-semibold">{shortId(item.id)}</Mono><span className="block text-xs font-normal text-muted-foreground">{item.locale} · {item.riskBand}</span></span>,
            <StatusBadge key="kyc" value={item.kycStatus} />,
            latestGeo ? <div key="geo"><StatusBadge value={latestGeo.decision} /><p className="mt-1 font-mono text-xs tabular-nums text-muted-foreground">{dateTime(latestGeo.checkedAt)}</p></div> : <span key="geo">No check</span>,
            activeRestrictions.length ? <Mono key="restrictions">{activeRestrictions.length} active</Mono> : 'None',
          ],
        }
      })}
      emptyTitle="No players"
    />

    <ExternalGateNotice />
  </OperatorShell>
}
