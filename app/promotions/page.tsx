import { PromotionsScreen } from '@/features/storefront/customer/promotions/screens/PromotionsScreen'
import { storefrontTitle } from '@/features/storefront/lib/data/brand'

export async function generateMetadata() {
  return { title: await storefrontTitle('Promotions') }
}

export default function Page(){return <PromotionsScreen />}
