'use server'

import { revalidatePath } from 'next/cache'
import { keystoneClient } from '@/features/dashboard/lib/keystoneClient'

// User.onboardingStatus stays update: denyAll for raw writes. "Skip for now" goes through the narrow
// dismissOperatorOnboarding command, which only moves the signed-in user's own not_started/in_progress
// status to dismissed (completed setup is never overwritten), mirroring E-commerce's persisted dismissal.
export async function dismissOnboarding() {
  try {
    const response = await keystoneClient<{ dismissOperatorOnboarding: string }>(`
      mutation DismissOperatorOnboarding {
        dismissOperatorOnboarding
      }
    `)
    if (!response.success) {
      return { success: false, error: response.error }
    }
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/(admin)')
    return { success: true, data: { onboardingStatus: response.data?.dismissOperatorOnboarding } }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' }
  }
}
