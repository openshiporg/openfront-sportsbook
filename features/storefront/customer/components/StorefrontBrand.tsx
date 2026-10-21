'use client'

import { createContext, useContext, type ReactNode } from 'react'

export type StorefrontBrand = { name: string; logoIcon: string; logoColor: string }

const StorefrontBrandContext = createContext<StorefrontBrand | null>(null)

/** Storefront-only provider for the brand's Store Settings; the operator dashboard never reads it. */
export function StorefrontBrandProvider({ brand, children }: { brand: StorefrontBrand | null; children: ReactNode }) {
  return <StorefrontBrandContext.Provider value={brand}>{children}</StorefrontBrandContext.Provider>
}

export function useStorefrontBrand() {
  return useContext(StorefrontBrandContext)
}

/** Style for a brand-colored surface (header, hero banner): rotates its brand hue like the E-commerce hero. */
export function useBrandSurfaceStyle() {
  return { filter: `hue-rotate(${brandHue(useContext(StorefrontBrandContext))}deg)` }
}

/** Normalized hue rotation (degrees) for brand surfaces; invalid values fall back to the original color. */
export function brandHue(brand: StorefrontBrand | null) {
  const numeric = Number.parseFloat(brand?.logoColor ?? '0')
  return Number.isFinite(numeric) ? ((numeric % 360) + 360) % 360 : 0
}
