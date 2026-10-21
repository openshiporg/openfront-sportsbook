import { SportsbookHome } from '@/features/storefront/sportsbook/screens/SportsbookHome'
import { StorefrontLayout } from '@/features/storefront/customer/components/StorefrontLayout'

export const dynamic = 'force-dynamic'

export default function Home() {
  return <StorefrontLayout><SportsbookHome /></StorefrontLayout>
}
