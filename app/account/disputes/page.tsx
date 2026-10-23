import { DisputesScreen } from '@/features/storefront/customer/disputes/screens/DisputesScreen'
import { storefrontTitle } from '@/features/storefront/lib/data/brand'

export async function generateMetadata() {
  return { title: await storefrontTitle('Support') }
}

export default function Page(){return <DisputesScreen />}
