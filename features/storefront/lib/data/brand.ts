import { cache } from 'react'
import { headers } from 'next/headers'
import { keystoneContext } from '@/features/keystone/context'
import { resolveSandboxBrand, resolveSandboxTenant } from '@/features/sportsbook/api/sandbox-tenant'
import type { StorefrontBrand } from '@/features/storefront/customer/components/StorefrontBrand'

type DisplayBrand = { tenantId: string; name: string; logoIcon: string; logoColor: string }

/**
 * The operator brand this storefront displays. Display only (header, logo, titles, which records a page may
 * show); customer actions keep the customer API's own tenant resolution. Order: the configured sandbox origin,
 * then a brand whose domain is the host being served, then the install's single operator-owned brand.
 */
export const getStorefrontDisplayBrand = cache(async function (): Promise<DisplayBrand | null> {
  const prisma: any = keystoneContext.prisma
  try {
    const tenant = await resolveSandboxTenant(prisma)
    const brand = await resolveSandboxBrand(prisma, tenant.id)
    return { tenantId: tenant.id, name: brand.name, logoIcon: brand.logoIcon, logoColor: brand.logoColor }
  } catch {}
  try {
    const active = { status: 'ACTIVE', tenant: { status: 'ACTIVE' } }
    const host = ((await headers()).get('host') ?? '').toLowerCase().replace(/:\d+$/, '')
    const select = { tenantId: true, name: true, logoIcon: true, logoColor: true }
    const byHost = host ? await prisma.brand.findFirst({ where: { ...active, domain: host }, orderBy: { createdAt: 'asc' }, select }) : null
    if (byHost) return byHost
    const brands = await prisma.brand.findMany({ where: active, orderBy: { createdAt: 'asc' }, select, take: 50 })
    const owned = []
    for (const brand of brands) {
      if (await prisma.user.findFirst({ where: { tenantId: brand.tenantId, role: { canAccessDashboard: true } }, select: { id: true } })) owned.push(brand)
    }
    return new Set(owned.map(brand => brand.tenantId)).size === 1 ? owned[0] : null
  } catch {
    return null
  }
})

/** The storefront's Store Settings (brand name, logo and hue). Read-only; null when no brand is configured. */
export const getStorefrontBrand = cache(async function (): Promise<StorefrontBrand | null> {
  const brand = await getStorefrontDisplayBrand()
  return brand ? { name: brand.name || '', logoIcon: brand.logoIcon || '', logoColor: brand.logoColor || '0' } : null
})

/** Page title with the brand's name, e.g. "My bets · Northline". */
export async function storefrontTitle(page?: string) {
  const name = (await getStorefrontBrand())?.name || 'Sportsbook'
  return page ? `${page} · ${name}` : name
}
