import type { ReactNode } from 'react'
import { getStorefrontBrand } from '@/features/storefront/lib/data/brand'
import { StorefrontBrandProvider } from './StorefrontBrand'

/** Storefront-only layout: supplies the brand's Store Settings (logo and hue) to customer screens. */
export async function StorefrontLayout({ children }: { children: ReactNode }) {
  const brand = await getStorefrontBrand()
  return <StorefrontBrandProvider brand={brand}>{children}</StorefrontBrandProvider>
}
