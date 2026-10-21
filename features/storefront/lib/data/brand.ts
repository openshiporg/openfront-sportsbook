import { cache } from 'react'
import { keystoneContext } from '@/features/keystone/context'
import { resolveSandboxBrand, resolveSandboxTenant } from '@/features/sportsbook/api/sandbox-tenant'
import type { StorefrontBrand } from '@/features/storefront/customer/components/StorefrontBrand'

/** The storefront's Store Settings (brand name, logo and hue). Read-only; null when no brand is configured. */
export const getStorefrontBrand = cache(async function (): Promise<StorefrontBrand | null> {
  try {
    const prisma = keystoneContext.prisma
    const tenant = await resolveSandboxTenant(prisma)
    const brand = await resolveSandboxBrand(prisma, tenant.id)
    return { name: brand.name || '', logoIcon: brand.logoIcon || '', logoColor: brand.logoColor || '0' }
  } catch {
    return null
  }
})
