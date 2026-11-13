import type { PrismaClient } from '../../keystone/prisma'

/**
 * The storefront's public hostname: the host of PUBLIC_APP_URL (set on every deployment), else the
 * tenant brand's own domain is matched by the single operator-owned tenant below.
 */
export const publicStorefrontDomain = (): string | null => {
  const value = process.env.PUBLIC_APP_URL
  if (!value) return null
  try { return new URL(value).hostname.toLowerCase() }
  catch { return null }
}

/**
 * Resolve the operator tenant that owns this storefront: the ACTIVE brand on the public domain whose tenant
 * has a dashboard operator. A single-operator deployment whose brand domain was never updated still resolves
 * to its one operator. Runtime traffic never manufactures a tenant: an operator must finish onboarding first.
 */
export async function resolvePublicTenant(tx: PrismaClient | any) {
  const configuredSlug = process.env.STOREFRONT_TENANT_SLUG?.trim()
  if (configuredSlug) {
    const configured = await tx.tenant.findUnique({ where: { slug: configuredSlug } })
    if (!configured || configured.status !== 'ACTIVE') throw new Error('OPERATOR_NOT_CONFIGURED')
    return configured
  }
  const domain = publicStorefrontDomain()
  const operatorOwned = async (brands: any[]) => {
    const tenants: any[] = []
    for (const brand of brands) {
      const operator = await tx.user.findFirst({ where: { tenantId: brand.tenantId, role: { canAccessDashboard: true } }, select: { id: true } })
      if (operator) tenants.push(brand.tenant)
    }
    return [...new Map(tenants.map(tenant => [tenant.id, tenant])).values()]
  }
  if (domain) {
    const onDomain = await operatorOwned(await tx.brand.findMany({ where: { domain, status: 'ACTIVE', tenant: { status: 'ACTIVE' } }, include: { tenant: true }, orderBy: { createdAt: 'asc' } }))
    if (onDomain.length === 1) return onDomain[0]
    if (onDomain.length > 1) throw new Error('OPERATOR_AMBIGUOUS')
  }
  const all = await operatorOwned(await tx.brand.findMany({ where: { status: 'ACTIVE', tenant: { status: 'ACTIVE' } }, include: { tenant: true }, orderBy: { createdAt: 'asc' } }))
  if (all.length === 1) return all[0]
  if (all.length > 1) throw new Error('OPERATOR_AMBIGUOUS')
  throw new Error('OPERATOR_NOT_CONFIGURED')
}

/** The tenant's storefront brand: the one on the public domain, else its first ACTIVE brand. Never manufactured. */
export async function resolvePublicBrand(tx: PrismaClient | any, tenantId: string) {
  const domain = publicStorefrontDomain()
  const exact = domain ? await tx.brand.findFirst({ where: { tenantId, domain, status: 'ACTIVE' }, orderBy: { createdAt: 'asc' } }) : null
  if (exact) return exact
  const first = await tx.brand.findFirst({ where: { tenantId, status: 'ACTIVE' }, orderBy: { createdAt: 'asc' } })
  if (first) return first
  throw new Error('BRAND_NOT_CONFIGURED')
}
