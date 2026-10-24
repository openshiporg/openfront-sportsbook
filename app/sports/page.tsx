import { SportsIndex } from '@/features/storefront/sportsbook/screens/SportsIndex'
import { listPublishedSports } from '@/features/storefront/lib/data/catalog-route'
import { storefrontTitle } from '@/features/storefront/lib/data/brand'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  return { title: await storefrontTitle('Sports') }
}

export default async function Page() {
  return <SportsIndex sports={await listPublishedSports()} />
}
