import { OperatorShell, TenantRequired } from '../components/OperatorShell'
import { DetailGrid, WorkflowNote } from '../components/WorkflowUI'
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
    return <OperatorShell active="Security" eyebrow="Privileged identity" title="Operator security" description="Two-factor authentication for your operator account."><TenantRequired /></OperatorShell>
  }

  const user = await prisma.user.findUnique({ where: { id: item.id } })
  if (!user) return <OperatorShell active="Security" eyebrow="Privileged identity" title="Operator security" description="Two-factor authentication for your operator account."><TenantRequired /></OperatorShell>

  return <OperatorShell active="Security" eyebrow="Privileged identity" title="Operator security" description="Set up an authenticator app to protect your operator account." tenantName={item.tenant?.name}>
    <DetailGrid items={[
      { label: 'Operator', value: user.email },
      { label: 'MFA', value: user.operatorMfaEnabled ? 'ENABLED' : 'NOT ENROLLED' },
      { label: 'Enrolled', value: user.operatorMfaEnrolledAt?.toISOString() ?? '—' },
      { label: 'Failed attempts', value: user.operatorMfaFailedAttempts ?? 0 },
    ]} />
    <MfaEnrollment enabled={Boolean(user.operatorMfaEnabled)} assured={Boolean(auth.data?.operatorSessionAssured)} returnTo={continueTo} />
    <WorkflowNote title="Production identity boundary">TOTP is the built-in baseline. Operators may replace password/TOTP with a certified workforce IdP through the PAM/SSO adapter, but production must never weaken to password-only access.</WorkflowNote>
  </OperatorShell>
}
