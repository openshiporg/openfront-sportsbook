import { SportsbookHome } from '@/features/storefront/sportsbook/screens/SportsbookHome'
import { StorefrontLayout } from '@/features/storefront/customer/components/StorefrontLayout'
import { storefrontTitle } from '@/features/storefront/lib/data/brand'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  return { title: await storefrontTitle('Sports') }
}

export default function Home() {
  return <StorefrontLayout><SportsbookHome /></StorefrontLayout>
}
