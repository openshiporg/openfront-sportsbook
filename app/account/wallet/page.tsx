import { WalletScreen } from '@/features/storefront/customer/wallet/screens/WalletScreen'
import { storefrontTitle } from '@/features/storefront/lib/data/brand'

export async function generateMetadata() {
  return { title: await storefrontTitle('Wallet') }
}

export default function Page() {
  return <WalletScreen />
}
