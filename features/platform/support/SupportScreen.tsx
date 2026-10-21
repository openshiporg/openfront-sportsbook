import { ExternalGateNotice, OperatorShell, TenantRequired } from '../components/OperatorShell'
import { ReadFailed } from '../components/ReadFailed'
import { WorkflowNote } from '../components/WorkflowUI'
import { dateTime, shortId } from '../lib/format'
import { searchFrom } from '../lib/graphql'
import { getOperatorContext, platformPrisma as prisma } from '../lib/operator'
import { allowedParam, pageFrom, PLATFORM_PAGE_SIZE, type PlatformSearchParams } from '../lib/paging'
import { getSupportQueue } from './actions'
import { SupportPageClient } from './screens/SupportPageClient'

const caseStatuses = ['OPEN', 'TRIAGED', 'WAITING_CUSTOMER', 'WAITING_OPERATOR', 'RESOLVED', 'CLOSED'] as const
const disputeStatuses = ['OPEN', 'TRIAGED', 'INVESTIGATING', 'PROPOSED_RESOLUTION', 'RESOLVED', 'REJECTED', 'APPEALED'] as const

/**
 * Disputes (a risk list) and dispute-resolution approvals (a roles list) are part of the
 * compliance support workflow, but their Keystone list access doesn't include
 * canManageCompliance, so a GraphQL read would hide them from the operators this
 * screen is for. They stay a bounded, tenant-filtered server-only read here (never a
 * client-callable action) until the backend exposes a compliance-scoped projection.
 */
async function getDisputeRegister(tenantId: string, page: number, status?: string) {
  const where = { tenantId, ...(status ? { status } : {}) }
  const option = { select: { id: true, category: true, resolution: true }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: 100 }
  const [disputes, total, all, open, appeals, reviewable, proposed, approvals] = await Promise.all([
    prisma.dispute.findMany({ where, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: PLATFORM_PAGE_SIZE, skip: (page - 1) * PLATFORM_PAGE_SIZE, select: { id: true, category: true, wagerId: true, resolution: true, status: true } }),
    prisma.dispute.count({ where }),
    prisma.dispute.count({ where: { tenantId } }),
    prisma.dispute.count({ where: { tenantId, status: { notIn: ['RESOLVED', 'REJECTED'] } } }),
    prisma.dispute.count({ where: { tenantId, status: 'APPEALED' } }),
    prisma.dispute.findMany({ where: { tenantId, status: { in: ['OPEN', 'TRIAGED', 'INVESTIGATING', 'APPEALED'] } }, ...option }),
    prisma.dispute.findMany({ where: { tenantId, status: 'PROPOSED_RESOLUTION' }, ...option }),
    prisma.approvalRequest.findMany({ where: { tenantId, action: { startsWith: 'DISPUTE_RESOLUTION:' }, status: 'APPROVED', consumedAt: null, expiresAt: { gt: new Date() } }, orderBy: [{ decidedAt: 'desc' }, { id: 'desc' }], take: 100, select: { id: true, action: true } }),
  ])
  return { disputes, total, all, open, appeals, reviewable, proposed, approvals }
}

/** Server screen: authorizes the operator, reads the support queue through GraphQL and hands formatted rows to the client screen. */
export async function SupportScreen({ searchParams }: { searchParams?: PlatformSearchParams } = {}) {
  const params = (await searchParams) ?? {}
  const casePage = pageFrom(params)
  const disputePage = pageFrom({ page: params.dpage })
  const caseStatus = allowedParam(params, 'status', caseStatuses)
  const disputeStatus = allowedParam(params, 'dstatus', disputeStatuses)
  const search = searchFrom(params)
  const operator = await getOperatorContext('canManageCompliance')
  if (!operator) return <OperatorShell active="Support" eyebrow="Customer resolution" title="Support & disputes" description="Support cases, disputes, resolutions and appeals."><TenantRequired /></OperatorShell>
  const [queue, register] = await Promise.all([getSupportQueue({ page: casePage, pageSize: PLATFORM_PAGE_SIZE, search, status: caseStatus }), getDisputeRegister(operator.tenantId, disputePage, disputeStatus)])
  const disputeOption = (item: any) => ({ label: `${shortId(item.id)} · ${item.category}`, value: item.id })
  return <OperatorShell active="Support" eyebrow="Customer resolution" title="Support & disputes" description="Support cases, disputes, resolutions and appeals." tenantName={operator.tenantName}>
    {queue.success ? <SupportPageClient data={{
      cases: queue.data.cases.map((item) => ({ id: item.id, subject: item.subject || shortId(item.id), reference: shortId(item.id), category: item.category || '—', player: item.player ? shortId(item.player.id) : 'Restricted', openedAt: dateTime(item.openedAt), slaDueAt: dateTime(item.slaDueAt), status: item.status })),
      casesTotal: queue.data.total, allCases: queue.data.allCases, openCases: queue.data.openCases, customerVisibleEvents: queue.data.customerVisibleEvents, casePage, caseStatus, search,
      disputes: register.disputes.map((item: any) => ({ id: item.id, category: item.category, reference: shortId(item.id), wager: item.wagerId ? shortId(item.wagerId) : 'No wager', resolution: item.resolution || 'No proposal', status: item.status })),
      disputesTotal: register.total, allDisputes: register.all, openDisputes: register.open, appeals: register.appeals, disputePage, disputeStatus,
      pageSize: PLATFORM_PAGE_SIZE, caseStatuses, disputeStatuses,
      openCaseOptions: queue.data.openCasePicker.map((item) => ({ label: `${shortId(item.id)} · ${item.subject}`, value: item.id })),
      reviewableDisputeOptions: register.reviewable.map(disputeOption),
      proposedDisputeOptions: register.proposed.map(disputeOption),
      proposedDisputeWithResolutionOptions: register.proposed.map((item: any) => ({ label: `${shortId(item.id)} · ${item.category} · ${item.resolution || 'proposal'}`, value: item.id })),
      approvalOptions: register.approvals.map((item: any) => ({ label: `${shortId(item.id)} · ${item.action}`, value: item.id })),
    }} /> : <ReadFailed subject="support cases" />}
    <WorkflowNote title="No impersonation">This workbench is read/action scoped. It does not create a customer session or reveal restricted AML decision logic.</WorkflowNote>
    <ExternalGateNotice />
  </OperatorShell>
}
