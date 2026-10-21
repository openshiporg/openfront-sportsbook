import type { PrismaClient } from '../../keystone/prisma'

export const sandboxPublicDomain = () => {
  try { return new URL(process.env.SANDBOX_PUBLIC_ORIGIN ?? 'https://sportsbook.local').hostname.toLowerCase() }
  catch { throw new Error('INVALID_SANDBOX_PUBLIC_ORIGIN') }
}

/**
 * Resolve the single operator-owned tenant exposed by the local sandbox origin.
 * Runtime traffic never manufactures a parallel tenant: an operator must finish
 * onboarding first. Test-only compatibility may still create the isolated fixture.
 */
export async function resolveSandboxTenant(tx: PrismaClient | any) {
  const configuredSlug = process.env.SANDBOX_TENANT_SLUG?.trim()
  if (configuredSlug) {
    const configured = await tx.tenant.findUnique({ where: { slug: configuredSlug } })
    if (!configured || configured.status !== 'ACTIVE') throw new Error('SANDBOX_TENANT_NOT_CONFIGURED')
    return configured
  }

  const brands = await tx.brand.findMany({
    where: { domain: sandboxPublicDomain(), status: 'ACTIVE', tenant: { status: 'ACTIVE' } },
    include: { tenant: true },
    orderBy: { createdAt: 'asc' },
  })
  const operatorOwned: any[] = []
  for (const brand of brands) {
    const operator = await tx.user.findFirst({ where: { tenantId: brand.tenantId, role: { canAccessDashboard: true } }, select: { id: true } })
    if (operator) operatorOwned.push(brand.tenant)
  }
  const unique = [...new Map(operatorOwned.map(tenant => [tenant.id, tenant])).values()]
  if (unique.length === 1) return unique[0]
  if (unique.length > 1) throw new Error('SANDBOX_TENANT_AMBIGUOUS')

  if (process.env.NODE_TEST_CONTEXT) {
    return tx.tenant.upsert({
      where: { slug: 'local-sandbox' },
      update: {},
      create: { name: 'Local Sandbox', slug: 'local-sandbox', status: 'ACTIVE', defaultTimezone: 'UTC' },
    })
  }
  throw new Error('SANDBOX_OPERATOR_NOT_CONFIGURED')
}

/** Resolve the host brand within the already trusted tenant; never manufacture a parallel runtime brand. */
export async function resolveSandboxBrand(tx: PrismaClient | any, tenantId: string) {
  const domain = sandboxPublicDomain()
  const exact = await tx.brand.findFirst({ where: { tenantId, domain, status: 'ACTIVE' }, orderBy: { createdAt: 'asc' } })
  if (exact) return exact
  if (process.env.NODE_TEST_CONTEXT) {
    return tx.brand.create({ data: { tenantId, name: 'Sandbox Sportsbook', domain, defaultLocale: 'en', status: 'ACTIVE' } })
  }
  throw new Error('SANDBOX_BRAND_NOT_CONFIGURED')
}
