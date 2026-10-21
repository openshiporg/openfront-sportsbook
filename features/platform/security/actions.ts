'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { keystoneClient } from '@/features/dashboard/lib/keystoneClient'

type Completion = { completeOperatorMfaEnrollment: { enabled: boolean; recoveryCodes: string[]; sessionToken: string } }

export async function completeMfaEnrollment(code: string): Promise<{ success: true; recoveryCodes: string[] } | { success: false; message: string }> {
  const cookieStore = await cookies()
  const currentToken = cookieStore.get('keystonejs-session')?.value
  if (!currentToken) return { success: false, message: 'Sign in again before completing enrollment.' }
  const response = await keystoneClient<Completion>(
    'mutation($code:String!){completeOperatorMfaEnrollment(code:$code){enabled recoveryCodes sessionToken}}',
    { code },
    { headers: { cookie: `keystonejs-session=${currentToken}` } },
  )
  const completion = response.success ? response.data.completeOperatorMfaEnrollment : null
  if (!completion?.enabled || !completion.sessionToken || !completion.recoveryCodes?.length) {
    return { success: false, message: response.success ? 'MFA enrollment did not complete.' : response.error }
  }
  cookieStore.set('keystonejs-session', completion.sessionToken, {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    httpOnly: true,
    maxAge: 60 * 60 * 12,
  })
  revalidatePath('/dashboard', 'layout')
  return { success: true, recoveryCodes: completion.recoveryCodes }
}

/** Step-up for an already enrolled operator: TOTP or one single-use recovery code. */
export async function verifyMfaSession(code: string): Promise<{ success: true } | { success: false; message: string }> {
  const supplied = String(code ?? '').trim()
  if (!/^(\d{6}|[A-Za-z0-9]{4}-[A-Za-z0-9]{4})$/.test(supplied)) return { success: false, message: 'Enter a six-digit authenticator code or a recovery code.' }
  const cookieStore = await cookies()
  const currentToken = cookieStore.get('keystonejs-session')?.value
  if (!currentToken) return { success: false, message: 'Sign in again before verifying this session.' }
  const response = await keystoneClient<{ verifyOperatorMfaSession: string }>(
    'mutation($code:String!){verifyOperatorMfaSession(code:$code)}',
    { code: supplied },
    { headers: { cookie: `keystonejs-session=${currentToken}` } },
  )
  const sessionToken = response.success ? response.data.verifyOperatorMfaSession : null
  if (!sessionToken) return { success: false, message: 'The code was not accepted, or verification is temporarily locked after repeated attempts.' }
  cookieStore.set('keystonejs-session', sessionToken, {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    httpOnly: true,
    maxAge: 60 * 60 * 12,
  })
  revalidatePath('/dashboard', 'layout')
  return { success: true }
}
