import { ResponsiblePlayScreen } from '@/features/storefront/customer/responsible-play/screens/ResponsiblePlayScreen'
import { storefrontTitle } from '@/features/storefront/lib/data/brand'

export async function generateMetadata() {
  return { title: await storefrontTitle('Safer play') }
}

export default function Page() {
  return <ResponsiblePlayScreen />
}
