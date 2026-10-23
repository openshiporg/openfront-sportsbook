'use client'

import { useRef, useState } from 'react'
import { ExternalLink } from 'lucide-react'
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
import { AccountPageHeader, ErrorPanel, LoadingPanel, isClosedError } from '../../components/AccountStates'
import { CustomerShell } from '../../components/CustomerShell'
import { Card, Dot, Notice, Pill, Readouts, Section, Track, label, pillClass, toneFor } from '../../components/kit'
import { CustomerApiError, formatDate, useCustomerResource, useFrozenSubmission, customerMessage } from '../../lib/customer-api'

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
      setError(`Your earlier ${durationLabel(frozenDuration)} request wasn’t confirmed. Activate it again to retry the same request.`)
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
      setStatus(`${durationLabel(duration)} active${result.endsAt ? ` until ${formatDate(result.endsAt)}` : ''}. Betting is blocked.`)
      setPendingDuration(undefined)
      setFrozenDuration(undefined)
      responsible.reload()
      session.reload()
    } catch (reason) {
      const definitive = reason instanceof CustomerApiError && reason.status >= 400 && reason.status < 500 && reason.status !== 408 && reason.status !== 429
      if (definitive) setFrozenDuration(undefined)
      if (reason instanceof CustomerApiError && reason.payload.state === 'IN_PROGRESS') setError('The original exclusion request is still processing. Activate again to check that same request.')
      else if (definitive) setError(customerMessage(reason, 'The break wasn’t started. Try again.'))
      else setError('No response received. Activate again to retry the same request.')
    } finally {
      setSaving(false)
    }
  }

  const active = responsible.data?.selfExclusion

  return <CustomerShell current="responsible-play" authenticated={Boolean(session.data?.authenticated)} accountReference={session.data?.accountReference} closed={isClosedError(session.error)}>
    <AccountPageHeader title="Safer play" tone={responsible.data ? (responsible.data.wageringRestricted ? 'alert' : 'win') : undefined} meta={responsible.data ? (responsible.data.wageringRestricted ? 'Betting restricted' : 'Betting available') : undefined} />
    {responsible.loading && <LoadingPanel label="Loading controls" />}
    {responsible.error && <ErrorPanel error={responsible.error} retry={responsible.reload} />}
    {responsible.data && <>
      <Readouts className="mt-6" items={[
        { label: 'Betting', value: responsible.data.wageringRestricted ? 'Restricted' : 'Available', tone: responsible.data.wageringRestricted ? 'alert' : 'win' },
        { label: 'Identity', value: label(responsible.data.kycStatus), tone: toneFor(responsible.data.kycStatus) },
        { label: 'Location', value: label(responsible.data.geoStatus), tone: toneFor(responsible.data.geoStatus) },
      ]} />

      {active && <div role="status" className="mt-6 rounded-3xl bg-red-50 p-5 text-red-950 ring-1 ring-red-200"><p className="font-sb-display text-2xl font-bold uppercase tracking-wide"><Dot tone="alert" />Exclusion active</p><p className="mt-1 font-sb-mono text-xs">{label(active.scope)} · from {formatDate(active.startsAt)} · {active.endsAt ? `until ${formatDate(active.endsAt)}` : 'no end date'}</p></div>}

      <section aria-labelledby="take-break-heading" className="mt-6 rounded-3xl bg-sb-card p-5 ring-1 ring-sb-line sm:p-6">
        <h2 id="take-break-heading" className="font-sb-display text-2xl font-bold uppercase tracking-wide">Take a break</h2>
        <p className="mt-1 text-xs text-sb-mute">Starts immediately · can’t be shortened or cancelled here</p>
        <div className="mt-4 sb-scroll -mx-1 px-1"><Track label="Break length">
          {[1, 7, 42].map(days => <Pill key={days} disabled={Boolean(active)} onClick={event => begin(days, event.currentTarget)}>{days === 1 ? '24 hours' : days === 7 ? '7 days' : '6 weeks'}</Pill>)}
          <Pill variant="danger" disabled={Boolean(active)} onClick={event => begin(null, event.currentTarget)}>Self-exclude</Pill>
        </Track></div>
        {status && <Notice tone="ok" className="mt-4">{status}</Notice>}
        {error && <Notice tone="alert" className="mt-4">{error}</Notice>}
      </section>

      <Section id="support-heading" title="Independent help">
        <Track label="Independent help"><a href="https://www.ncpgambling.org/help-treatment/" target="_blank" rel="noreferrer" className={pillClass('raised')}>NCPG help and treatment <ExternalLink aria-hidden="true" /></a><a href="https://www.gamblersanonymous.org/" target="_blank" rel="noreferrer" className={pillClass('raised')}>Gamblers Anonymous <ExternalLink aria-hidden="true" /></a></Track>
      </Section>

      {responsible.data.history.length > 0 && <Section id="exclusion-history" title="History" count={responsible.data.history.length}><Card className="divide-y divide-sb-line">{responsible.data.history.map(item => <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3.5"><div className="min-w-0"><p className="text-sm font-semibold"><Dot tone={toneFor(item.status)} />{label(item.scope)} exclusion<span className="ml-2 text-xs font-normal text-sb-mute">{label(item.status)}</span></p><p className="mt-0.5 font-sb-mono text-[11px] text-sb-mute">{label(item.source)} · from {formatDate(item.startsAt)} · {item.endsAt ? `until ${formatDate(item.endsAt)}` : 'no end date'}</p></div></div>)}</Card></Section>}
    </>}

    <AlertDialog open={pendingDuration !== undefined} onOpenChange={open => { if (!open) closeDialog() }}>
      <AlertDialogContent onCloseAutoFocus={event => { event.preventDefault(); returnFocusRef.current?.focus() }} className="max-h-[90vh] w-[calc(100%-2rem)] overflow-y-auto rounded-3xl">
        <AlertDialogHeader><AlertDialogTitle>Start {pendingDuration === undefined ? 'exclusion' : durationLabel(pendingDuration)}?</AlertDialogTitle><AlertDialogDescription>Starts now and blocks new bets. It can’t be undone here.</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter><AlertDialogCancel disabled={saving} onClick={closeDialog} className="min-h-11 rounded-full">Cancel</AlertDialogCancel><AlertDialogAction disabled={saving} onClick={event => { event.preventDefault(); void confirm() }} className="min-h-11 rounded-full bg-sb-live text-white hover:bg-red-700 focus-visible:ring-red-800">{saving ? 'Starting…' : unresolved ? 'Retry original request' : 'Start now'}</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </CustomerShell>
}
