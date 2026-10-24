import { StorefrontLayout } from '@/features/storefront/customer/components/StorefrontLayout'
import { StorefrontNotFound } from '@/features/storefront/customer/components/StorefrontNotFound'
import { storefrontTitle } from '@/features/storefront/lib/data/brand'

export async function generateMetadata() {
  return { title: await storefrontTitle('Not found') }
}

export default function NotFound() {
  return <StorefrontLayout><StorefrontNotFound /></StorefrontLayout>
}
