import { LimitsScreen } from '@/features/storefront/customer/limits/screens/LimitsScreen'
import { storefrontTitle } from '@/features/storefront/lib/data/brand'

export async function generateMetadata() {
  return { title: await storefrontTitle('Limits') }
}

export default function Page() {
  return <LimitsScreen />
}
