'use client'

import { useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import type { CustomerSessionSummary, LimitActionResult, LimitsResponse } from '@/features/sportsbook/customer/contracts'
import { AccountPageHeader, ErrorPanel, LoadingPanel, isClosedError } from '../../components/AccountStates'
import { CustomerShell } from '../../components/CustomerShell'
import { Card, Dot, Empty, Notice, Pill, Section, Track, fieldClass, label, toneFor } from '../../components/kit'
import { amountInputToMinor, currencyExponent, CustomerApiError, formatDate, formatMinor, useCustomerResource, useFrozenSubmission, customerMessage } from '../../lib/customer-api'

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
      else if (definitive) setError(customerMessage(reason, 'The limit wasn’t saved. Check the amount and try again.'))
      else setError('No response received. Retry sends the original request unchanged.')
    } finally {
      setSaving(false)
    }
  }

  const types = [['STAKE', 'Stake'], ['DEPOSIT', 'Deposit'], ['LOSS', 'Net loss'], ['SESSION', 'Session']] as const
  const periods = [['DAILY', '24 hours'], ['WEEKLY', '7 days'], ['MONTHLY', '30 days']] as const
  return <CustomerShell current="limits" authenticated={Boolean(session.data?.authenticated)} accountReference={session.data?.accountReference} closed={isClosedError(session.error)}>
    <AccountPageHeader title="Limits" meta={limits.data ? `Increases wait ${limits.data.coolingOffHours} h · decreases apply now` : undefined} />
    {limits.loading && <LoadingPanel label="Loading limits" />}
    {limits.error && <ErrorPanel error={limits.error} retry={limits.reload} />}
    {limits.data && <>
      <section aria-labelledby="set-limit-heading" className="mt-6 rounded-3xl bg-sb-card p-5 ring-1 ring-sb-line sm:p-6">
        <h2 id="set-limit-heading" className="font-sb-display text-2xl font-bold uppercase tracking-wide">{unresolved ? <Dot tone="wait" /> : null}Set a limit</h2>
        <div className="mt-4 space-y-4">
          <div><p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-sb-mute">Type</p><div className="sb-scroll -mx-1 px-1"><Track label="Limit type">{types.map(([value, text]) => <Pill key={value} variant="flat" size="sm" aria-pressed={type === value} disabled={unresolved || saving} onClick={() => setType(value)}>{text}</Pill>)}</Track></div></div>
          <div><p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-sb-mute">Rolling period</p><Track label="Period">{periods.map(([value, text]) => <Pill key={value} variant="flat" size="sm" aria-pressed={period === value} disabled={unresolved || saving} onClick={() => setPeriod(value)}>{text}</Pill>)}</Track></div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1 sm:max-w-xs"><label htmlFor="limit-amount" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-sb-mute">{type==='SESSION'?'Minutes':`Amount · ${session.data?.currency ?? 'wallet currency'}`}</label>{type==='SESSION'?<input id="limit-amount" value={minutes} onChange={event => { if (/^\d{0,5}$/.test(event.target.value)) { setMinutes(event.target.value) } }} disabled={unresolved || saving} inputMode="numeric" autoComplete="off" className={`${fieldClass} min-h-12 text-right font-sb-mono text-lg font-semibold tabular-nums`} />:<input id="limit-amount" value={amount} onChange={event => { if (/^\d{0,9}(\.\d{0,6})?$/.test(event.target.value)) { setAmount(event.target.value) } }} disabled={unresolved || saving} inputMode="decimal" autoComplete="off" className={`${fieldClass} min-h-12 text-right font-sb-mono text-lg font-semibold tabular-nums`} />}</div>
            <Track className="self-start sm:self-auto"><Pill variant="primary" size="lg" onClick={saveLimit} disabled={saving}>{saving && <LoaderCircle aria-hidden="true" className="animate-spin motion-reduce:animate-none" />}{saving ? 'Saving…' : unresolved ? 'Retry original request' : 'Save limit'}</Pill></Track>
          </div>
        </div>
        {status && <Notice tone="ok" className="mt-4">{status}</Notice>}
        {error && <Notice tone="alert" className="mt-4">{error}</Notice>}
      </section>

      <Section id="saved-limits" title="Saved limits" count={limits.data.limits.length}>
        {limits.data.limits.length === 0 ? <Empty>No limits set</Empty> : <Card className="divide-y divide-sb-line">
          {limits.data.limits.map(limit => <div key={limit.id} className="flex min-w-0 items-center justify-between gap-3 px-4 py-3.5">
            <div className="min-w-0"><p className="text-sm font-semibold"><Dot tone={toneFor(limit.state)} />{label(limit.type)} limit<span className="ml-2 text-xs font-normal text-sb-mute">{label(limit.state)}</span></p><p className="mt-0.5 font-sb-mono text-[11px] text-sb-mute">{label(limit.period)} · from {formatDate(limit.effectiveFrom)}{limit.effectiveTo ? ` · ends ${formatDate(limit.effectiveTo)}` : ''}</p></div>
            <p className="shrink-0 font-sb-mono text-lg font-semibold tabular-nums">{limit.type==='SESSION'?`${limit.amountMinor} min`:formatMinor(limit.amountMinor, limit.currency)}</p>
          </div>)}
        </Card>}
      </Section>
    </>}
  </CustomerShell>
}
