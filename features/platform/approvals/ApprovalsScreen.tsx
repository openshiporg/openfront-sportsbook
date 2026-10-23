import { OperatorShell, TenantRequired } from '../components/OperatorShell'
import { dateTime, jsonText, shortId } from '../lib/format'
import { getOperatorContext, platformPrisma as prisma } from '../lib/operator'
import { allowedParam, pageFrom, PLATFORM_PAGE_SIZE, type PlatformSearchParams } from '../lib/paging'
import { ApprovalsPageClient } from './screens/ApprovalsPageClient'

const approvalStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'EXPIRED'] as const

/**
 * The inbox is gated on canApproveSensitiveActions, but the ApprovalRequest list's
 * Keystone query access is canManageRoles, so a GraphQL read would show an
 * independent approver (who normally lacks role management) an empty inbox. Until
 * the backend grants approvers a scoped read, this stays a bounded, tenant-filtered,
 * server-only read (never a client-callable action); the client screen renders it.
 */
async function getApprovalInbox(tenantId: string, pendingPage: number, historyPage: number, status?: string) {
  const order = [{ createdAt: 'desc' }, { id: 'desc' }]
  const historyWhere = { tenantId, ...(status ? { status } : {}) }
  const [pending, pendingTotal, history, historyTotal, approved, rejected, selfDecisions] = await Promise.all([
    prisma.approvalRequest.findMany({ where: { tenantId, status: 'PENDING' }, orderBy: order, take: PLATFORM_PAGE_SIZE, skip: (pendingPage - 1) * PLATFORM_PAGE_SIZE }),
    prisma.approvalRequest.count({ where: { tenantId, status: 'PENDING' } }),
    prisma.approvalRequest.findMany({ where: historyWhere, orderBy: order, take: PLATFORM_PAGE_SIZE, skip: (historyPage - 1) * PLATFORM_PAGE_SIZE }),
    prisma.approvalRequest.count({ where: historyWhere }),
    prisma.approvalRequest.count({ where: { tenantId, status: 'APPROVED' } }),
    prisma.approvalRequest.count({ where: { tenantId, status: 'REJECTED' } }),
    prisma.approvalRequest.count({ where: { tenantId, approverId: { not: null, equals: prisma.approvalRequest.fields.requesterId } } }),
  ])
  const actorIds = [...new Set([...pending, ...history].flatMap((item: any) => [item.requesterId, item.approverId, item.consumedById]).filter(Boolean))]
  const actors = actorIds.length ? await prisma.user.findMany({ where: { tenantId, id: { in: actorIds } }, select: { id: true, name: true } }) : []
  return { pending, pendingTotal, history, historyTotal, approved, rejected, selfDecisions, actors }
}

/** Server screen: authorizes the approver, loads the paged inbox and history and hands formatted rows to the client screen. */
export async function ApprovalsScreen({ searchParams }: { searchParams?: PlatformSearchParams } = {}) {
  const params = (await searchParams) ?? {}
  const historyPage = pageFrom(params)
  const pendingPage = pageFrom({ page: params.ppage })
  const status = allowedParam(params, 'status', approvalStatuses)
  const operator = await getOperatorContext('canApproveSensitiveActions')
  if (!operator) return <OperatorShell active="Approvals" eyebrow="Independent control" title="Approval inbox"><TenantRequired /></OperatorShell>
  const inbox = await getApprovalInbox(operator.tenantId, pendingPage, historyPage, status)
  const actorName = (id: string) => inbox.actors.find((actor: any) => actor.id === id)?.name ?? shortId(id)
  const now = new Date()
  return <OperatorShell active="Approvals" eyebrow="Independent control" title="Approval inbox" tone={inbox.pendingTotal > 0 ? 'wait' : 'ok'} meta={`${inbox.pendingTotal} pending · ${inbox.historyTotal} in history`} tenantName={operator.tenantName}>
    <ApprovalsPageClient data={{
      pending: inbox.pending.map((item: any) => ({ id: item.id, title: String(item.action).split(':')[0].replaceAll('_', ' '), action: String(item.action), status: item.status, expired: Boolean(item.expiresAt && new Date(item.expiresAt) <= now), requester: actorName(item.requesterId), requestedAt: dateTime(item.createdAt), expiresAt: item.expiresAt ? dateTime(item.expiresAt) : 'Not recorded', reason: item.reason || '—', payloadHash: item.payloadHash, body: item.requestPayload !== null && item.requestPayload !== undefined ? jsonText(item.requestPayload) : null, self: item.requesterId === operator.userId })),
      pendingTotal: inbox.pendingTotal, pendingPage,
      history: inbox.history.map((item: any) => ({ id: item.id, reference: shortId(item.id), payloadHash: item.payloadHash, action: String(item.action), createdAt: dateTime(item.createdAt), requester: actorName(item.requesterId), approver: item.approverId ? actorName(item.approverId) : '—', applied: item.consumedAt ? `Applied by ${actorName(item.consumedById)} · ${dateTime(item.consumedAt)}` : null, status: item.status, consumed: Boolean(item.consumedAt), approvedButExpired: item.status === 'APPROVED' && Boolean(item.expiresAt && new Date(item.expiresAt) <= now) })),
      historyTotal: inbox.historyTotal, historyPage, status, pageSize: PLATFORM_PAGE_SIZE,
      approved: inbox.approved, rejected: inbox.rejected, selfDecisions: inbox.selfDecisions, statuses: approvalStatuses,
    }} />
  </OperatorShell>
}
