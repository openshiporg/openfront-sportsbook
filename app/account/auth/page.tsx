import { AuthScreen } from '@/features/storefront/customer/auth/screens/AuthScreen'
import { storefrontTitle } from '@/features/storefront/lib/data/brand'

export async function generateMetadata() {
  return { title: await storefrontTitle('Sign in') }
}

export default function Page(){return <AuthScreen />}
