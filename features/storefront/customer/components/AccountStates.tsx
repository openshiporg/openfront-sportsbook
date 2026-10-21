'use client'

import { AlertCircle, LoaderCircle, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { useState, type ReactNode } from 'react'
import { customerApi, CustomerApiError } from '../lib/customer-api'

export function AccountPageHeader({ title, description, aside }: { title: string; description: string; aside?: ReactNode }) {
  return <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-800">Player account</p>
      <h1 className="mt-1 min-w-0 break-words text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
    </div>
    {aside}
  </div>
}

export function LoadingPanel({ label = 'Loading account data' }: { label?: string }) {
  return <div role="status" className="mt-6 flex min-h-40 items-center justify-center rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
    <LoaderCircle aria-hidden="true" className="mr-2 size-5 animate-spin motion-reduce:animate-none" />{label}
  </div>
}

export function ErrorPanel({ error, retry }: { error: CustomerApiError; retry: () => void }) {
  if (error.status === 401) return <AuthenticationRequired />
  return <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-900">
    <div className="flex items-start gap-3"><AlertCircle aria-hidden="true" className="mt-0.5 size-5 shrink-0" /><div><p className="font-semibold">Account data is unavailable</p><p className="mt-1">We couldn’t load this information. Nothing shown here is a guess, so please try again.</p></div></div>
    <button type="button" onClick={retry} className="mt-4 min-h-10 rounded-lg bg-red-900 px-4 font-semibold text-white hover:bg-red-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-900">Retry</button>
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
      setError(reason instanceof CustomerApiError ? reason.code : 'REQUEST_FAILED')
      setCreating(false)
    }
  }
  return <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-6">
    <ShieldCheck aria-hidden="true" className="size-6 text-emerald-800" />
    <h2 className="mt-3 text-lg font-semibold text-emerald-950">Sign in to your account</h2>
    <p className="mt-2 max-w-xl text-sm leading-6 text-emerald-900">You are signed out or your session ended. Sign in to return to your existing wallet, bets and history, or recover access by email if you no longer know your password.</p>
    <div className="mt-4 flex flex-wrap gap-2">
      <Link href="/account/auth" className="inline-flex min-h-11 items-center rounded-lg bg-emerald-800 px-4 text-sm font-semibold text-white hover:bg-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800">Sign in or recover access</Link>
    </div>
    <div className="mt-6 border-t border-emerald-200 pt-4">
      <p className="text-sm font-medium text-emerald-950">New here?</p>
      <p className="mt-1 max-w-xl text-xs leading-5 text-emerald-900">Starting a guest account creates a new, separate account. It does not restore or merge any account you used before.</p>
      <button type="button" onClick={createAccount} disabled={creating} className="mt-3 min-h-11 rounded-lg border border-emerald-800 px-4 text-sm font-semibold text-emerald-900 hover:bg-emerald-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800 disabled:cursor-wait disabled:opacity-60">{creating ? 'Creating account…' : 'Start a new guest account'}</button>
    </div>
    {error && <p role="alert" className="mt-3 text-sm font-medium text-red-800">Could not create the account: {error}</p>}
  </div>
}
