import { SportsbookHome } from '@/features/storefront/sportsbook/screens/SportsbookHome'
import { storefrontTitle } from '@/features/storefront/lib/data/brand'

export async function generateMetadata() {
  return { title: await storefrontTitle('Bet slip') }
}

export default function Page(){return <SportsbookHome />}
