'use client'

import { LoaderCircle, RefreshCw } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { customerApi, CustomerApiError, customerMessage } from '../lib/customer-api'
import { Dot, Pill, PillLink, PageTitle, Track, type Tone } from './kit'

export function AccountPageHeader({ title, tone, meta, aside }: { title: string; tone?: Tone; meta?: ReactNode; aside?: ReactNode }) {
  return <PageTitle title={title} tone={tone} meta={meta} aside={aside} />
}

export function LoadingPanel({ label = 'Loading' }: { label?: string }) {
  return <div role="status" className="mt-6 flex min-h-40 items-center justify-center rounded-[2px] bg-sb-card text-sm text-sb-mute ring-1 ring-sb-line">
    <LoaderCircle aria-hidden="true" className="mr-2 size-5 animate-spin motion-reduce:animate-none" />{label}
  </div>
}

/** The API refuses every customer action while the operator's betting runtime is switched off. */
export const isClosedError = (error: CustomerApiError | null | undefined) => Boolean(error && ['SANDBOX_DISABLED', 'SANDBOX_ISOLATION_REQUIRED'].includes(error.code))

/** Closed state. On the coupon it keeps the coupon's own frame (ruled 1 / X / 2 heads) with one row saying so;
 *  elsewhere it is a single ruled notice. No events or prices are shown because none are offered. */
export function ClosedPanel({ coupon = false }: { coupon?: boolean }) {
  if (coupon) return <div role="status" className="mt-4 overflow-hidden rounded-[2px] bg-sb-card ring-1 ring-sb-ink/15">
    <div className="grid grid-cols-[minmax(0,1fr)_3.5rem_3.5rem_3.5rem] border-b-2 border-sb-ink px-4 py-2 text-xs font-semibold text-sb-mute sm:px-5">
      <span>Event</span><span className="text-center">1</span><span className="text-center">X</span><span className="text-center">2</span>
    </div>
    <div className="px-4 py-6 sm:px-5">
      <p className="font-sb-display text-3xl font-bold uppercase leading-none text-sb-ink">Betting closed</p>
      <p className="mt-2 text-sm text-sb-mute">No prices are offered. Accounts, prices and bets are unavailable.</p>
    </div>
  </div>
  return <div role="status" className="mt-6 rounded-[2px] border-l-0 bg-sb-card px-5 py-5 ring-1 ring-sb-ink/15">
    <p className="font-sb-display text-3xl font-bold uppercase leading-none text-sb-ink">Betting closed</p>
    <p className="mt-2 text-sm text-sb-mute">Accounts, prices and bets are unavailable</p>
  </div>
}

export function ErrorPanel({ error, retry }: { error: CustomerApiError; retry: () => void }) {
  if (error.status === 401) return <AuthenticationRequired />
  if (isClosedError(error)) return <ClosedPanel />
  return <div role="alert" className="mt-6 rounded-[2px] bg-red-50 p-5 text-sm text-red-950 ring-1 ring-red-200">
    <p className="font-semibold"><Dot tone="alert" />Couldn’t load this page</p>
    <div className="mt-4"><Track><Pill size="sm" onClick={retry}><RefreshCw aria-hidden="true" />Retry</Pill></Track></div>
  </div>
}

export function AuthenticationRequired() {
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  async function createAccount() {
    setCreating(true)
    setError('')
    try {
      await customerApi('/api/sandbox/sportsbook/register', { method: 'POST', body: '{}' })
      window.location.reload()
    } catch (reason) {
      setError(customerMessage(reason, 'The account couldn’t be created. Try again.'))
      setCreating(false)
    }
  }
  return <div className="mt-6 overflow-hidden rounded-[2px] bg-sb-card ring-1 ring-sb-line">
    <div className="bg-sb-night px-5 py-5 text-white sm:px-6">
      <p className="font-sb-display text-3xl font-bold uppercase leading-none tracking-wide"><Dot tone="off" className="bg-white/40" />Signed out</p>
    </div>
    <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
      <div>
        <p className="text-sm font-semibold">Existing account</p>
        <div className="mt-3"><Track><PillLink href="/account/auth" variant="primary">Sign in or recover</PillLink></Track></div>
      </div>
      <div className="border-t border-sb-line pt-5 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
        <p className="text-sm font-semibold">Guest account</p>
        <p className="mt-1 text-xs text-sb-mute">New and separate. Not linked to earlier accounts.</p>
        <div className="mt-3"><Track><Pill onClick={createAccount} disabled={creating}>{creating ? 'Creating…' : 'Start guest account'}</Pill></Track></div>
      </div>
    </div>
    {error && <p role="alert" className="border-t border-sb-line px-5 py-3 text-sm font-medium text-red-800 sm:px-6"><Dot tone="alert" />{error}</p>}
  </div>
}
