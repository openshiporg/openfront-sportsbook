import { ProfileScreen } from '@/features/storefront/customer/profile/screens/ProfileScreen'
import { storefrontTitle } from '@/features/storefront/lib/data/brand'

export async function generateMetadata() {
  return { title: await storefrontTitle('Profile') }
}

export default function Page(){return <ProfileScreen />}
