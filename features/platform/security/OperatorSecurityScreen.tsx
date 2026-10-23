import { OperatorShell, TenantRequired } from '../components/OperatorShell'
import { Mono } from '../components/kit'
import { DetailGrid, StatusBadge } from '../components/WorkflowUI'
import { dateTime } from '../lib/format'
import { getOperatorSession, platformPrisma as prisma } from '../lib/operator'
import { MfaEnrollment } from './MfaEnrollment'
import { sanitizeDashboardRedirect } from '@/features/dashboard/lib/security'

const operatorCapabilities = [
  'canManagePeople',
  'canManageRoles',
  'canManageOnboarding',
  'canManageSportsbook',
  'canTrade',
  'canManageRisk',
  'canManageCompliance',
  'canManageFinance',
  'canManageIntegrations',
  'canApproveSensitiveActions',
  'canReadAudit',
] as const

export async function OperatorSecurityScreen({ returnTo }: { returnTo?: string } = {}) {
  const safeReturn = sanitizeDashboardRedirect(returnTo)
  const continueTo = safeReturn.startsWith('/dashboard/platform') ? safeReturn : '/dashboard/platform'
  const auth = await getOperatorSession()
  if (!auth.success) throw new Error(auth.error)
  const item = auth.data?.authenticatedItem
  const isOperator = operatorCapabilities.some((capability) => Boolean(item?.role?.[capability]))
  if (!item?.id || !isOperator) {
    return <OperatorShell active="Security" eyebrow="Privileged identity" title="Operator security"><TenantRequired /></OperatorShell>
  }

  const user = await prisma.user.findUnique({ where: { id: item.id } })
  if (!user) return <OperatorShell active="Security" eyebrow="Privileged identity" title="Operator security"><TenantRequired /></OperatorShell>

  const enrolled = Boolean(user.operatorMfaEnabled)
  const assured = Boolean(auth.data?.operatorSessionAssured)
  const failed = user.operatorMfaFailedAttempts ?? 0
  return <OperatorShell active="Security" eyebrow="Privileged identity" title="Operator security" tone={!enrolled ? 'alert' : assured ? 'ok' : 'wait'} meta={!enrolled ? 'MFA not enrolled' : assured ? 'MFA enrolled · session verified' : 'MFA enrolled · session not verified'} tenantName={item.tenant?.name}>
    <MfaEnrollment enabled={enrolled} assured={assured} returnTo={continueTo} />
    <DetailGrid items={[
      { label: 'Operator', value: <span className="break-all">{user.email}</span> },
      { label: 'MFA', value: <StatusBadge value={enrolled ? 'ENABLED' : 'NOT_ENROLLED'} /> },
      { label: 'Enrolled', value: <Mono>{user.operatorMfaEnrolledAt ? dateTime(user.operatorMfaEnrolledAt) : '—'}</Mono> },
      { label: 'Failed attempts', value: <Mono className={failed > 0 ? 'text-red-600 dark:text-red-400' : undefined}>{failed}</Mono> },
    ]} />
  </OperatorShell>
}
