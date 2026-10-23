import { SecurityScreen } from '@/features/storefront/customer/security/screens/SecurityScreen'
import { storefrontTitle } from '@/features/storefront/lib/data/brand'

export async function generateMetadata() {
  return { title: await storefrontTitle('Security') }
}

export default function Page(){return <SecurityScreen />}
