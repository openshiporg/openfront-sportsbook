import { BetsScreen } from '@/features/storefront/customer/bets/screens/BetsScreen'
import { storefrontTitle } from '@/features/storefront/lib/data/brand'

export async function generateMetadata() {
  return { title: await storefrontTitle('My bets') }
}

export default function Page() {
  return <BetsScreen />
}
