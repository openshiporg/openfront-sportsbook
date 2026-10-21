'use client'

import { useState } from 'react'
import { CheckCircle2, Gauge, LoaderCircle } from 'lucide-react'
import type { CustomerSessionSummary, LimitActionResult, LimitsResponse } from '@/features/sportsbook/customer/contracts'
import { AccountPageHeader, ErrorPanel, LoadingPanel } from '../../components/AccountStates'
import { CustomerShell } from '../../components/CustomerShell'
import { amountInputToMinor, currencyExponent, CustomerApiError, formatDate, formatMinor, useCustomerResource, useFrozenSubmission } from '../../lib/customer-api'

const SESSION_PERIOD_MINUTES: Record<'DAILY' | 'WEEKLY' | 'MONTHLY', number> = { DAILY: 1_440, WEEKLY: 10_080, MONTHLY: 43_200 }

export function LimitsScreen() {
  const session = useCustomerResource<CustomerSessionSummary>('/api/sandbox/sportsbook/session')
  const limits = useCustomerResource<LimitsResponse>('/api/sandbox/sportsbook/limits')
  const [type, setType] = useState<'STAKE' | 'DEPOSIT' | 'LOSS' | 'SESSION'>('STAKE')
  const [period, setPeriod] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('DAILY')
  const [amount, setAmount] = useState('100.00')
  // Session limits are whole minutes with their own input; they are never parsed as money.
  const [minutes, setMinutes] = useState('60')
  const [saving, setSaving] = useState(false)
  // The first submit freezes the exact body and key; edits are locked until the server answers definitively.
  const frozen = useFrozenSubmission()
  const unresolved = frozen.isUnresolved('limit')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  async function saveLimit() {
    const walletCurrency = session.data?.currency ?? ''
    const maxMinutes = SESSION_PERIOD_MINUTES[period]
    if (type === 'SESSION' && (!/^\d{1,5}$/.test(minutes) || Number(minutes) < 1 || Number(minutes) > maxMinutes)) {
      setError(`Enter whole minutes from 1 to ${maxMinutes.toLocaleString()}.`)
      return
    }
    const amountMinor = type === 'SESSION' ? String(Number(minutes)) : walletCurrency ? amountInputToMinor(amount, currencyExponent(walletCurrency, session.data?.currencyExponent)) : null
    if (amountMinor === null) {
      setError('Enter a valid non-negative amount.')
      return
    }
    setSaving(true)
    setStatus('')
    setError('')
    try {
      const result = await frozen.submit<LimitActionResult>('limit', '/api/sandbox/sportsbook/limits', 'POST', idempotencyKey => ({ type, period, amountMinor, idempotencyKey }))
      setStatus(result.state === 'PENDING' ? `Increase saved. It becomes effective ${formatDate(result.effectiveFrom ?? null)} after the cooling-off period.` : 'Limit saved and effective immediately.')
      limits.reload()
    } catch (reason) {
      const definitive = reason instanceof CustomerApiError && reason.status >= 400 && reason.status < 500 && reason.status !== 408 && reason.status !== 429
      if (reason instanceof CustomerApiError && reason.payload.state === 'IN_PROGRESS') setError('The original request is still processing. Retry to check the same request.')
      else if (definitive) setError(`The limit was not saved (${reason.code.replaceAll('_', ' ').toLowerCase()}).`)
      else setError('The response was interrupted. Retry sends the original request unchanged; the form stays locked until it is confirmed.')
    } finally {
      setSaving(false)
    }
  }

  return <CustomerShell current="limits" authenticated={Boolean(session.data?.authenticated)} accountReference={session.data?.accountReference}>
    <AccountPageHeader title="Limits" description="Set deposit, stake, net-loss and session-time limits. Lower limits apply straight away; higher limits take effect after 24 hours." />
    {limits.loading && <LoadingPanel label="Loading player limits" />}
    {limits.error && <ErrorPanel error={limits.error} retry={limits.reload} />}
    {limits.data && <>
      <section aria-labelledby="set-limit-heading" className="mt-6 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex items-start gap-3"><Gauge aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-emerald-800" /><div><h2 id="set-limit-heading" className="text-lg font-semibold">Set a player limit</h2><p className="mt-1 text-sm leading-6 text-slate-600">Stake, net-loss and session limits are checked each time you place a bet, and deposit limits each time you deposit. Periods are rolling (the last 24 hours, 7 days or 30 days). A session limit counts the time since you signed in on this device. Net loss is what you staked on settled or cashed-out bets minus what they returned.</p></div></div>
        <div className="mt-5 grid min-w-0 gap-4 sm:grid-cols-3">
          <div><label htmlFor="limit-type" className="mb-1.5 block text-xs font-semibold text-slate-700">Limit type</label><select id="limit-type" value={type} onChange={event => { setType(event.target.value as 'STAKE' | 'DEPOSIT' | 'LOSS' | 'SESSION') }} disabled={unresolved || saving} className="min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"><option value="STAKE">Stake</option><option value="DEPOSIT">Deposit</option><option value="LOSS">Net loss</option><option value="SESSION">Session time</option></select></div>
          <div><label htmlFor="limit-period" className="mb-1.5 block text-xs font-semibold text-slate-700">Period</label><select id="limit-period" value={period} onChange={event => { setPeriod(event.target.value as 'DAILY' | 'WEEKLY' | 'MONTHLY') }} disabled={unresolved || saving} className="min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"><option value="DAILY">Last 24 hours</option><option value="WEEKLY">Last 7 days</option><option value="MONTHLY">Last 30 days</option></select></div>
          <div><label htmlFor="limit-amount" className="mb-1.5 block text-xs font-semibold text-slate-700">{type==='SESSION'?'Minutes':`Amount (${session.data?.currency ?? 'wallet currency'})`}</label>{type==='SESSION'?<input id="limit-amount" value={minutes} onChange={event => { if (/^\d{0,5}$/.test(event.target.value)) { setMinutes(event.target.value) } }} disabled={unresolved || saving} inputMode="numeric" autoComplete="off" className="min-h-12 w-full rounded-lg border border-slate-300 px-3 text-right font-semibold tabular-nums focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700" />:<input id="limit-amount" value={amount} onChange={event => { if (/^\d{0,9}(\.\d{0,6})?$/.test(event.target.value)) { setAmount(event.target.value) } }} disabled={unresolved || saving} inputMode="decimal" autoComplete="off" className="min-h-12 w-full rounded-lg border border-slate-300 px-3 text-right font-semibold tabular-nums focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700" />}</div>
        </div>
        <button type="button" onClick={saveLimit} disabled={saving} className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-emerald-800 px-5 text-sm font-semibold text-white hover:bg-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800 disabled:cursor-wait disabled:opacity-60">{saving && <LoaderCircle aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />}{saving ? 'Saving limit…' : unresolved ? 'Retry original request' : 'Save limit'}</button>
        {status && <p role="status" className="mt-4 flex items-start gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900"><CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0" />{status}</p>}
        {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-900">{error}</p>}
      </section>

      <section aria-labelledby="saved-limits" className="mt-6">
        <div className="flex items-center justify-between gap-3"><h2 id="saved-limits" className="text-lg font-semibold">Saved limits</h2><span className="text-xs text-slate-500">Cooling-off: {limits.data.coolingOffHours} hours</span></div>
        {limits.data.limits.length === 0 ? <div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">You have no limits set.</div> : <div className="mt-3 grid gap-3">
          {limits.data.limits.map(limit => <article key={limit.id} className="grid min-w-0 gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{limit.type.toLowerCase()} limit</h3><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${limit.state === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : limit.state === 'PENDING' ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-600'}`}>{limit.state}</span></div><p className="mt-1 text-xs text-slate-500">{limit.period.toLowerCase()} · effective {formatDate(limit.effectiveFrom)}{limit.effectiveTo ? ` · ends ${formatDate(limit.effectiveTo)}` : ''}</p></div>
            <p className="text-lg font-semibold tabular-nums sm:text-right">{limit.type==='SESSION'?`${limit.amountMinor} minutes`:formatMinor(limit.amountMinor, limit.currency)}</p>
          </article>)}
        </div>}
      </section>
    </>}
  </CustomerShell>
}
