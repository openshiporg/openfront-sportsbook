'use server';

import { revalidatePath } from 'next/cache';
import { getOperatorContext, platformPrisma as prisma } from '@/features/platform/lib/operator';
import { sandboxPublicDomain } from '@/features/sportsbook/api/sandbox-tenant';
import { normalizeStoreLogoColor } from '../lib/store-logo';
import { sanitizeStoreLogoSvg } from '@/features/keystone/utils/storeLogo';

const brandSelect = { id: true, name: true, logoIcon: true, logoColor: true, updatedAt: true };

/** The operator tenant's storefront brand: the brand served on the storefront domain, else its first brand. */
async function findStorefrontBrand(tenantId: string) {
  let domain = '';
  try { domain = sandboxPublicDomain(); } catch {}
  return (domain ? await prisma.brand.findFirst({ where: { tenantId, domain }, orderBy: { createdAt: 'asc' }, select: brandSelect }) : null)
    ?? await prisma.brand.findFirst({ where: { tenantId }, orderBy: { createdAt: 'asc' }, select: brandSelect });
}

export async function getStoreSettings() {
  const operator = await getOperatorContext('canManageSportsbook');
  if (!operator) return { success: false as const, error: 'Your role does not include sportsbook settings capability.' };
  const brand = await findStorefrontBrand(operator.tenantId);
  if (!brand) return { success: true as const, data: null };
  return { success: true as const, data: { id: brand.id, name: brand.name, logoIcon: brand.logoIcon, logoColor: brand.logoColor, revision: brand.updatedAt.toISOString() } };
}

export async function updateStoreSettings(brandId: string, revision: string, data: {
  name?: string;
  logoIcon?: string;
  logoColor?: string;
}) {
  const operator = await getOperatorContext('canManageSportsbook');
  if (!operator) return { success: false, error: 'Your role does not include sportsbook settings capability.' };

  // Sanitize SVG before saving to prevent XSS attacks
  const sanitizedData = {
    ...(data.name === undefined ? {} : { name: data.name.trim() }),
    logoIcon: data.logoIcon ? sanitizeStoreLogoSvg(data.logoIcon) : undefined,
    logoColor:
      data.logoColor === undefined ? undefined : normalizeStoreLogoColor(data.logoColor),
  };

  // If SVG sanitization failed (returned empty string), reject the update
  if (data.logoIcon && !sanitizedData.logoIcon) {
    return { success: false, error: 'Invalid SVG format' };
  }
  if (sanitizedData.name !== undefined && !sanitizedData.name) {
    return { success: false, error: 'Brand name is required' };
  }

  const expected = new Date(revision);
  if (!brandId || Number.isNaN(expected.getTime())) return { success: false, error: 'Reload the page and try again.' };

  // Scoped to the operator's own tenant and to the revision the form was loaded from,
  // so a concurrent edit is reported instead of silently overwritten.
  const updated = await prisma.brand.updateMany({
    where: { id: brandId, tenantId: operator.tenantId, updatedAt: expected },
    data: sanitizedData,
  });
  if (updated.count !== 1) {
    return { success: false, error: 'These settings changed since the page was loaded. Reload and try again.' };
  }

  const brand = await prisma.brand.findFirst({ where: { id: brandId, tenantId: operator.tenantId }, select: brandSelect });
  revalidatePath('/', 'layout');
  revalidatePath('/dashboard');

  return { success: true, data: brand ? { ...brand, revision: brand.updatedAt.toISOString() } : null };
}
