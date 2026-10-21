/**
 * Current-authority and independent-approval controls shared by the operator
 * command resolvers. Every helper runs inside the committing transaction so a
 * role revocation, tenant move or factor removal is serialized against the
 * protected effect (Restaurant managerApproval.ts consume/approve pattern).
 */

// NEEDS OWNER: approval lifetime. Bounded so an approved request cannot be
// reused indefinitely; Restaurant uses 15 minutes for on-site manager approval.
export const APPROVAL_TTL_MS = 24 * 60 * 60 * 1000
export const approvalExpiry = (from: Date = new Date()) => new Date(from.getTime() + APPROVAL_TTL_MS)

/** Immutable reviewed body stored with the request so the approver reads the effect, not only its hash. */
export const reviewPayload = (value: unknown) => JSON.parse(JSON.stringify(value ?? null))
/** Fields every new approval request records alongside action/payloadHash. */
export const approvalReview = (payload: unknown) => ({ requestPayload: reviewPayload(payload), expiresAt: approvalExpiry() })

export const isTrustedInternalContext = (context: any, capability: string) =>
  Boolean(context?.trustedTenantId && context?.trustedActorId && context?.trustedCapabilities?.includes(capability)) &&
  (process.env.NODE_ENV === 'test' || Boolean(process.env.NODE_TEST_CONTEXT) || process.env.SPORTSBOOK_SANDBOX === 'true')

type OperatorRow = { id: string; tenantId: string | null; operatorMfaEnabled?: boolean | null; role?: Record<string, any> | null; tenant?: { status?: string | null } | null }

const lockUser = (tx: any, userId: string) => tx.$queryRaw`SELECT id FROM "User" WHERE id = ${userId} FOR SHARE`

const holdsTenantCapability = (user: OperatorRow | null, tenantId: string, capability: string) =>
  Boolean(user && user.tenantId === tenantId && user.role && user.role.tenantId === tenantId && user.role[capability] && user.tenant?.status === 'ACTIVE')

/**
 * Re-reads (and share-locks) the acting human inside the transaction: same
 * tenant, tenant-owned role with the capability, active tenant and an enrolled
 * operator factor. Returns the actor id.
 */
export async function assertCurrentActor(tx: any, context: any, tenantId: string, capability: string): Promise<string> {
  if (isTrustedInternalContext(context, capability)) {
    if (context.trustedTenantId !== tenantId) throw new Error('Not found')
    return String(context.trustedActorId)
  }
  const actorId = context?.session?.itemId
  if (!actorId) throw new Error('Not found')
  await lockUser(tx, actorId)
  const user = await tx.user.findUnique({ where: { id: actorId }, include: { role: true, tenant: true } })
  if (!holdsTenantCapability(user, tenantId, capability) || !user.operatorMfaEnabled) throw new Error('Not found')
  return actorId
}

/**
 * Current independent authority at application time. Policy (fail closed): the
 * approver must still be a tenant operator holding canApproveSensitiveActions and
 * the requester must still belong to the tenant. Historical decisions stay as
 * evidence; they simply cannot authorize a new effect once authority lapses.
 */
export async function assertApprovalAuthority(tx: any, approval: { tenantId: string; requesterId: string; approverId: string }, executorId: string) {
  if (!approval.approverId || approval.approverId === approval.requesterId) throw new Error('DUAL_CONTROL_REQUIRED')
  if (approval.approverId === executorId) throw new Error('DUAL_CONTROL_REQUIRED')
  await lockUser(tx, approval.approverId)
  const [approver, requester] = await Promise.all([
    tx.user.findUnique({ where: { id: approval.approverId }, include: { role: true, tenant: true } }),
    tx.user.findUnique({ where: { id: approval.requesterId }, select: { id: true, tenantId: true } }),
  ])
  if (!holdsTenantCapability(approver, approval.tenantId, 'canApproveSensitiveActions')) throw new Error('APPROVER_AUTHORITY_NOT_CURRENT')
  if (!requester || requester.tenantId !== approval.tenantId) throw new Error('REQUESTER_AUTHORITY_NOT_CURRENT')
}

/**
 * Claims an approved request exactly once for the protected effect committed in
 * the same transaction. Checks action/payload binding, expiry, current executor
 * and approver authority, then performs a conditional (consumedAt IS NULL)
 * claim. A retry carrying the same consumedKey (the command's idempotency key)
 * is returned so the caller's own idempotent lookup can return the original
 * effect; any other reuse is refused.
 */
export async function consumeApproval(tx: any, context: any, input: { tenantId: string; capability: string; approvalId: string; action: string; payloadHash: string; consumedKey?: string }) {
  const executorId = await assertCurrentActor(tx, context, input.tenantId, input.capability)
  await tx.$queryRaw`SELECT id FROM "ApprovalRequest" WHERE id = ${input.approvalId} AND tenant = ${input.tenantId} FOR UPDATE`
  const row = await tx.approvalRequest.findFirst({ where: { id: input.approvalId, tenantId: input.tenantId, action: input.action, payloadHash: input.payloadHash, status: 'APPROVED' } })
  if (!row?.approverId || row.approverId === row.requesterId) throw new Error('DUAL_CONTROL_REQUIRED')
  if (row.consumedAt) {
    if (input.consumedKey && row.consumedKey === input.consumedKey) return { ...row, replay: true }
    throw new Error('APPROVAL_ALREADY_CONSUMED')
  }
  // Approvals decided before expiry/consumption tracking existed carry no bound
  // and must be re-approved instead of being treated as permanent authority.
  if (!row.expiresAt) throw new Error('APPROVAL_REAPPROVAL_REQUIRED')
  if (new Date(row.expiresAt) <= new Date()) throw new Error('APPROVAL_EXPIRED')
  await assertApprovalAuthority(tx, { tenantId: input.tenantId, requesterId: row.requesterId, approverId: row.approverId }, executorId)
  const claimed = await tx.approvalRequest.updateMany({
    where: { id: row.id, tenantId: input.tenantId, status: 'APPROVED', consumedAt: null, expiresAt: { gt: new Date() } },
    data: { consumedAt: new Date(), consumedById: executorId, consumedKey: input.consumedKey ?? row.id },
  })
  if (claimed.count !== 1) throw new Error('APPROVAL_ALREADY_CONSUMED')
  return { ...row, replay: false }
}
