import { hasOperatorMfaAssurance } from './session-assurance'

export type Session = {
  itemId: string
  listKey: string
  operatorMfaAssurance?: { issuedAt: number; expiresAt: number; nonce: string }
  data: {
    name: string
    tenant?: { id: string } | null
    role: {
      id: string
      name: string
      canSeeOtherPeople: boolean
      canEditOtherPeople: boolean
      canManagePeople: boolean
      canManageRoles: boolean
      canAccessDashboard: boolean
      canManageSportsbook: boolean
      canTrade: boolean
      canManageRisk: boolean
      canManageCompliance: boolean
      canManageFinance: boolean
      canManageIntegrations: boolean
      canApproveSensitiveActions: boolean
      canReadAudit: boolean
    }
  }
}

type AccessArgs = {
  session?: Session
  context?: any
}

export function isSignedIn({ session }: AccessArgs) {
  return Boolean(session)
}

export const isOperatorSessionAssured = (session: AccessArgs['session']) => hasOperatorMfaAssurance(session)

async function currentUser({ session, context }: AccessArgs) {
  if (!session?.itemId || !context?.prisma) return null
  return context.prisma.user.findUnique({ where: { id: session.itemId }, include: { role: true } })
}

export const currentOperatorPermission = (capability: string) => async (args: AccessArgs) => {
  if (!isOperatorSessionAssured(args.session)) return false
  const user = await currentUser(args)
  return Boolean(user?.role?.[capability])
}

export const currentCapability = (capability: string) => async (args: AccessArgs) => {
  if (!isOperatorSessionAssured(args.session)) return false
  const user = await currentUser(args)
  return Boolean(user?.tenantId && user.role?.[capability])
}

export const currentTenantId = async (args: AccessArgs) => {
  const user = await currentUser(args)
  return user?.tenantId ?? null
}

export const currentTenantScope = async (args: AccessArgs) => {
  const tenantId = await currentTenantId(args)
  return tenantId ? { tenant: { id: { equals: tenantId } } } : false
}

export const currentTenantItemScope = async (args: AccessArgs) => {
  const tenantId = await currentTenantId(args)
  return tenantId ? { id: { equals: tenantId } } : false
}

const assuredPermission = (capability: string) => ({ session }: AccessArgs) =>
  isOperatorSessionAssured(session) && Boolean(session?.data.role?.[capability as keyof Session['data']['role']])

// Cached session permissions are used only for UI hints. Authorization paths below
// re-read the current role so revocation takes effect immediately.
export const permissions = {
  canManagePeople: assuredPermission('canManagePeople'),
  canManageRoles: assuredPermission('canManageRoles'),
  canManageSportsbook: assuredPermission('canManageSportsbook'),
  canTrade: assuredPermission('canTrade'),
  canManageRisk: assuredPermission('canManageRisk'),
  canManageCompliance: assuredPermission('canManageCompliance'),
  canManageFinance: assuredPermission('canManageFinance'),
  canManageIntegrations: assuredPermission('canManageIntegrations'),
  canApproveSensitiveActions: assuredPermission('canApproveSensitiveActions'),
  canReadAudit: assuredPermission('canReadAudit'),
}

export const rules = {
  sameTenant: ({ session }: AccessArgs) =>
    session?.data.tenant?.id ? { tenant: { id: { equals: session.data.tenant.id } } } : false,
  canReadPeople: async (args: AccessArgs) => {
    const { session } = args
    if (!session) return false
    const user = await currentUser(args)
    if (isOperatorSessionAssured(session) && user?.tenantId && user.role?.canSeeOtherPeople) {
      return { OR: [{ id: { equals: session.itemId } }, { tenant: { id: { equals: user.tenantId } } }] }
    }
    return { id: { equals: session.itemId } }
  },
  canUpdatePeople: async (args: AccessArgs) => {
    const { session } = args
    if (!session) return false
    const user = await currentUser(args)
    if (isOperatorSessionAssured(session) && user?.tenantId && user.role?.canEditOtherPeople) {
      return { OR: [{ id: { equals: session.itemId } }, { tenant: { id: { equals: user.tenantId } } }] }
    }
    return { id: { equals: session.itemId } }
  },
  canDeletePeople: async (args: AccessArgs) => {
    const { session } = args
    if (!session || !isOperatorSessionAssured(session)) return false
    const user = await currentUser(args)
    if (!user?.tenantId || !user.role?.canManagePeople) return false
    return { AND: [{ tenant: { id: { equals: user.tenantId } } }, { id: { not: { equals: session.itemId } } }] }
  },
}
