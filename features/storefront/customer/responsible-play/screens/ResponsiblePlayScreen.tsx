'use client'

import { useRef, useState } from 'react'
import { ExternalLink, HeartHandshake, ShieldAlert, TimerReset } from 'lucide-react'
import type { CustomerSessionSummary, ExclusionActionResult, ResponsiblePlayResponse } from '@/features/sportsbook/customer/contracts'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { AccountPageHeader, ErrorPanel, LoadingPanel } from '../../components/AccountStates'
import { CustomerShell } from '../../components/CustomerShell'
import { CustomerApiError, formatDate, useCustomerResource, useFrozenSubmission } from '../../lib/customer-api'

const durationLabel = (days: number | null) => days === null ? 'permanent self-exclusion' : days === 1 ? '24-hour break' : days === 7 ? '7-day break' : '6-week break'

export function ResponsiblePlayScreen() {
  const session = useCustomerResource<CustomerSessionSummary>('/api/sandbox/sportsbook/session')
  const responsible = useCustomerResource<ResponsiblePlayResponse>('/api/sandbox/sportsbook/responsible-play')
  const [pendingDuration, setPendingDuration] = useState<number | null | undefined>(undefined)
  // An unconfirmed exclusion stays frozen (exact duration and key) until the server answers definitively;
  // starting another break meanwhile reopens the original request instead of minting a new key.
  const frozen = useFrozenSubmission()
  const [frozenDuration, setFrozenDuration] = useState<number | null | undefined>(undefined)
  const unresolved = frozen.isUnresolved('exclusion')
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const returnFocusRef = useRef<HTMLButtonElement | null>(null)

  function begin(duration: number | null, trigger: HTMLButtonElement) {
    returnFocusRef.current = trigger
    setStatus('')
    if (unresolved && frozenDuration !== undefined) {
      setPendingDuration(frozenDuration)
      setError(`Your earlier ${durationLabel(frozenDuration)} request was not confirmed. Activate it again to retry that same request before choosing another control.`)
      return
    }
    setPendingDuration(duration)
    setError('')
  }

  function closeDialog() {
    if (saving) return
    setPendingDuration(undefined)
    window.requestAnimationFrame(() => returnFocusRef.current?.focus())
  }

  async function confirm() {
    if (pendingDuration === undefined) return
    const duration = unresolved && frozenDuration !== undefined ? frozenDuration : pendingDuration
    setFrozenDuration(duration)
    setSaving(true)
    setError('')
    try {
      const result = await frozen.submit<ExclusionActionResult>('exclusion', '/api/sandbox/sportsbook/responsible-play', 'POST', idempotencyKey => ({ durationDays: duration, idempotencyKey }), 'exclude')
      setStatus(`${durationLabel(duration)} is active${result.endsAt ? ` until ${formatDate(result.endsAt)}` : ''}. Wager acceptance is now blocked.`)
      setPendingDuration(undefined)
      setFrozenDuration(undefined)
      responsible.reload()
      session.reload()
    } catch (reason) {
      const definitive = reason instanceof CustomerApiError && reason.status >= 400 && reason.status < 500 && reason.status !== 408 && reason.status !== 429
      if (definitive) setFrozenDuration(undefined)
      if (reason instanceof CustomerApiError && reason.payload.state === 'IN_PROGRESS') setError('The original exclusion request is still processing. Activate again to check that same request.')
      else if (definitive) setError(`The control was not activated (${reason.code.replaceAll('_', ' ').toLowerCase()}).`)
      else setError('The response was interrupted. Activate again to retry the same request safely.')
    } finally {
      setSaving(false)
    }
  }

  const active = responsible.data?.selfExclusion

  return <CustomerShell current="responsible-play" authenticated={Boolean(session.data?.authenticated)} accountReference={session.data?.accountReference}>
    <AccountPageHeader title="Responsible play" description="Take a break or exclude yourself from betting. These controls work straight away and stay available even when betting is paused." />
    {responsible.loading && <LoadingPanel label="Loading responsible-play controls" />}
    {responsible.error && <ErrorPanel error={responsible.error} retry={responsible.reload} />}
    {responsible.data && <>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Wagering</p><p className={`mt-2 font-semibold ${responsible.data.wageringRestricted ? 'text-red-800' : 'text-emerald-800'}`}>{responsible.data.wageringRestricted ? 'Restricted' : 'Available'}</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Identity check</p><p className="mt-2 font-semibold">{responsible.data.kycStatus}</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Location check</p><p className="mt-2 font-semibold">{responsible.data.geoStatus}</p></div>
      </div>

      {active && <div role="status" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-red-950"><div className="flex items-start gap-3"><ShieldAlert aria-hidden="true" className="mt-0.5 size-6 shrink-0" /><div><h2 className="font-semibold">Exclusion active</h2><p className="mt-1 text-sm leading-6">Scope {active.scope.toLowerCase()} · started {formatDate(active.startsAt)} · {active.endsAt ? `ends ${formatDate(active.endsAt)}` : 'no end date'}. Customer actions cannot revoke it.</p></div></div></div>}

      <section aria-labelledby="take-break-heading" className="mt-6 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex items-start gap-3"><TimerReset aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-emerald-800" /><div><h2 id="take-break-heading" className="text-lg font-semibold">Take a break or self-exclude</h2><p className="mt-1 text-sm leading-6 text-slate-600">Activation is immediate and blocks wager acceptance. Choose carefully: the customer UI cannot shorten or revoke an active exclusion.</p></div></div>
        <div className="mt-5 grid min-w-0 gap-3 sm:grid-cols-2">
          {[1, 7, 42].map(days => <button key={days} type="button" disabled={Boolean(active)} onClick={event => begin(days, event.currentTarget)} className="min-h-14 rounded-lg border border-slate-300 px-4 text-left text-sm font-semibold hover:border-emerald-700 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400">{durationLabel(days)}</button>)}
          <button type="button" disabled={Boolean(active)} onClick={event => begin(null, event.currentTarget)} className="min-h-14 rounded-lg border border-red-300 px-4 text-left text-sm font-semibold text-red-900 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-800 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400">Permanent self-exclusion</button>
        </div>
        {status && <p role="status" className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">{status}</p>}
        {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-900">{error}</p>}
      </section>

      <section aria-labelledby="support-heading" className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
        <div className="flex items-start gap-3"><HeartHandshake aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-amber-900" /><div className="min-w-0"><h2 id="support-heading" className="text-lg font-semibold text-amber-950">Independent support</h2><p className="mt-1 text-sm leading-6 text-amber-900">If gambling is causing harm, free and confidential support is available.</p><div className="mt-4 flex flex-col gap-2 sm:flex-row"><a href="https://www.ncpgambling.org/help-treatment/" target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-amber-950 px-4 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-950">NCPG help and treatment <ExternalLink aria-hidden="true" className="size-4" /></a><a href="https://www.gamblersanonymous.org/" target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-amber-400 bg-white px-4 text-sm font-semibold text-amber-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-950">Gamblers Anonymous <ExternalLink aria-hidden="true" className="size-4" /></a></div></div></div>
      </section>

      {responsible.data.history.length > 0 && <section aria-labelledby="exclusion-history" className="mt-6"><h2 id="exclusion-history" className="text-lg font-semibold">Control history</h2><div className="mt-3 grid gap-3">{responsible.data.history.map(item => <article key={item.id} className="grid gap-2 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_auto]"><div><p className="font-semibold">{item.scope.toLowerCase()} exclusion</p><p className="mt-1 text-xs text-slate-500">Source {item.source.toLowerCase()} · started {formatDate(item.startsAt)} · {item.endsAt ? `ends ${formatDate(item.endsAt)}` : 'no end date'}</p></div><span className="w-fit rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{item.status}</span></article>)}</div></section>}
    </>}

    <AlertDialog open={pendingDuration !== undefined} onOpenChange={open => { if (!open) closeDialog() }}>
      <AlertDialogContent onCloseAutoFocus={event => { event.preventDefault(); returnFocusRef.current?.focus() }} className="max-h-[90vh] w-[calc(100%-2rem)] overflow-y-auto rounded-xl">
        <AlertDialogHeader><AlertDialogTitle>Activate {pendingDuration === undefined ? 'exclusion' : durationLabel(pendingDuration)}?</AlertDialogTitle><AlertDialogDescription>This takes effect immediately for the owned account and blocks new wagers. It cannot be reversed from this customer interface.</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter><AlertDialogCancel disabled={saving} onClick={closeDialog} className="min-h-11">Cancel</AlertDialogCancel><AlertDialogAction disabled={saving} onClick={event => { event.preventDefault(); void confirm() }} className="min-h-11 bg-red-800 text-white hover:bg-red-900 focus-visible:ring-red-800">{saving ? 'Activating…' : unresolved ? 'Retry original request' : 'Activate control'}</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </CustomerShell>
}
