import { runWithTenantScope } from './tenant-scope'

/**
 * The only pre-tenant identity reads. Before a request knows its tenant, it may resolve exactly one row from an
 * opaque, already-authenticated key (the user id sealed in the signed operator session, or the digest of the customer
 * session token), and only that row's tenant (plus the operator reset instant used to revoke older sessions).
 * The key is set as a transaction-local setting that the matching row-level-security policy admits
 * (migration 20261021120000_identity_bootstrap_lookup); no tenant is ever trusted from the caller and nothing runs
 * as a bypass role. Every later read runs under that tenant's own scope.
 */
export async function bootstrapOperatorIdentity(prisma: any, userId: string): Promise<{ tenantId: string | null; passwordResetRedeemedAt: Date | null } | null> {
  if (!userId) return null
  return runWithTenantScope(null, () => prisma.$transaction(async (tx: any) => {
    await tx.$queryRaw`SELECT set_config('app.bootstrap_user_id', ${userId}, true)`
    const rows: Array<{ tenant: string | null; passwordResetRedeemedAt: Date | null }> = await tx.$queryRaw`SELECT tenant, "passwordResetRedeemedAt" FROM "User" WHERE id = ${userId} LIMIT 1`
    const row = rows[0]
    return row ? { tenantId: row.tenant ?? null, passwordResetRedeemedAt: row.passwordResetRedeemedAt ?? null } : null
  }))
}

export async function bootstrapCustomerSessionTenant(prisma: any, tokenDigest: string): Promise<string | null> {
  if (!/^[a-f0-9]{64}$/.test(tokenDigest)) return null
  return runWithTenantScope(null, () => prisma.$transaction(async (tx: any) => {
    await tx.$queryRaw`SELECT set_config('app.bootstrap_customer_token', ${tokenDigest}, true)`
    const rows: Array<{ tenant: string | null }> = await tx.$queryRaw`SELECT tenant FROM "CustomerSession" WHERE "tokenDigest" = ${tokenDigest} LIMIT 1`
    return rows[0]?.tenant ?? null
  }))
}
