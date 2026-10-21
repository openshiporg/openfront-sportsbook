'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowDownToLine, CheckCircle2, FileText, Landmark, LoaderCircle, RefreshCw } from 'lucide-react'
import type { CustomerSessionSummary, FundingResult, WalletResponse } from '@/features/sportsbook/customer/contracts'
import { AccountPageHeader, ErrorPanel, LoadingPanel } from '../../components/AccountStates'
import { CustomerShell } from '../../components/CustomerShell'
import { amountInputToMinor, customerApi, CustomerApiError, formatDate, formatMinor, minorToAmountInput, shortId, useCustomerResource, useFrozenSubmission } from '../../lib/customer-api'
import { clearPersistedFundingIntent, fundingRequestInit, loadPersistedFundingIntent, persistFundingIntent, resolveFundingIntent, type FundingIntent } from '../funding-intent'

type Statements={statements:Array<{id:string;periodStart:string;periodEnd:string;openingMinor:string;closingMinor:string;currency:string;journalHash:string;artifactReference:string;status:string}>;nextCursor:string|null}
export function WalletScreen() {
  const session = useCustomerResource<CustomerSessionSummary>('/api/sandbox/sportsbook/session')
  const wallet = useCustomerResource<WalletResponse>('/api/sandbox/sportsbook/wallet')
  const [statementCursors,setStatementCursors]=useState<string[]>([])
  const statementCursor=statementCursors[statementCursors.length-1]
  const statements = useCustomerResource<Statements>(`/api/sandbox/sportsbook/statements${statementCursor?`?cursor=${encodeURIComponent(statementCursor)}`:''}`)
  const [amount, setAmount] = useState('')
  const [action, setAction] = useState<'DEPOSIT'|'WITHDRAWAL'>('DEPOSIT')
  const [funding, setFunding] = useState(false)
  const [pendingIntent, setPendingIntent] = useState<FundingIntent | null>(null)
  const pendingIntentRef = useRef<FundingIntent | null>(null)
  const fundingLockRef = useRef(false)
  const [status, setStatus] = useState('')
  const [statementPending,setStatementPending]=useState(false)
  const frozen = useFrozenSubmission()
  const [error, setError] = useState('')
  const owner = session.data?.accountReference ?? ''
  const exponent = wallet.data?.currencyExponent ?? 0
  // Restore an unresolved original attempt for this account before any new action is offered.
  useEffect(() => {
    if (!owner || pendingIntentRef.current) return
    const restored = loadPersistedFundingIntent(owner)
    if (restored) { pendingIntentRef.current = restored; setPendingIntent(restored) }
  }, [owner])

  async function fund() {
    if (fundingLockRef.current) return
    fundingLockRef.current = true
    setFunding(true)
    setError('')
    setStatus('')
    let requestStarted = false
    try {
      const currentIntent = pendingIntentRef.current ?? pendingIntent
      let intent: FundingIntent
      if (currentIntent) {
        intent = resolveFundingIntent(currentIntent, currentIntent, () => `fund_${crypto.randomUUID()}`)
      } else {
        const amountMinor = wallet.data ? amountInputToMinor(amount, wallet.data.currencyExponent) : null
        if (!wallet.data || !amountMinor || BigInt(amountMinor) < BigInt(wallet.data.fundingMinMinor) || BigInt(amountMinor) > BigInt(wallet.data.fundingMaxMinor)) {
          setError(wallet.data ? `Enter an amount from ${formatMinor(wallet.data.fundingMinMinor, wallet.data.currency, exponent)} to ${formatMinor(wallet.data.fundingMaxMinor, wallet.data.currency, exponent)}.` : 'The wallet is unavailable.')
          return
        }
        intent = resolveFundingIntent(null, {
          action,
          amountInput: amount,
          amountMinor,
          currency: wallet.data.currency,
        }, () => `fund_${crypto.randomUUID()}`)
        pendingIntentRef.current = intent
        setPendingIntent(intent)
        persistFundingIntent(owner, intent)
      }

      requestStarted = true
      const result = await customerApi<FundingResult>('/api/sandbox/sportsbook/wallet', fundingRequestInit(intent))
      const actionLabel = intent.action.toLowerCase()
      const amountLabel = formatMinor(result.amountMinor ?? intent.amountMinor, result.currency ?? intent.currency, result.currencyExponent ?? exponent)
      wallet.reload()
      session.reload()
      if (result.state === 'PENDING' || result.state === 'IN_PROGRESS') {
        // Not definitive: keep the original attempt locked (funds stay reserved server-side for withdrawals).
        setStatus(`Your ${actionLabel} of ${amountLabel} hasn’t been confirmed yet. ${intent.action === 'WITHDRAWAL' ? 'The amount stays reserved. ' : ''}Select “Check again” to follow up on this same request; it won’t be sent twice.`)
        return
      }
      setStatus(result.duplicate
        ? `This ${actionLabel} of ${amountLabel} was already completed.`
        : intent.action === 'DEPOSIT'
          ? `${amountLabel} practice funds were added (no real money moved).`
          : `${amountLabel} practice withdrawal completed (no real payout).`)
      pendingIntentRef.current = null
      setPendingIntent(null)
      clearPersistedFundingIntent(owner)
    } catch (reason) {
      if (reason instanceof CustomerApiError && reason.payload.state === 'REJECTED') {
        // A definitive server receipt for this key: nothing was moved, so a new draft is allowed.
        setError(`The server rejected this ${String(reason.payload.rejectionCode ?? reason.code).replaceAll('_', ' ').toLowerCase()} request. No funds were moved.`)
        pendingIntentRef.current = null
        setPendingIntent(null)
        clearPersistedFundingIntent(owner)
        wallet.reload()
        return
      }
      const responseCode = reason instanceof CustomerApiError
        ? String(reason.payload.rejectionCode ?? reason.code).replaceAll('_', ' ').toLowerCase()
        : null
      setError(responseCode
        ? `The server responded: ${responseCode}. The original attempt remains locked; retry repeats its exact method, amount and request key. This page cannot verify a provider outcome or start a replacement.`
        : requestStarted
          ? 'No definitive response was received. The original attempt remains locked; retry repeats its exact method, body and request key. No replacement attempt will be created while this page retains the original intent.'
          : 'The original request could not be prepared and was not sent. You may review the amount and try again.')
    } finally {
      fundingLockRef.current = false
      setFunding(false)
    }
  }

  async function generateStatement(){setStatementPending(true);setError('');try{const end=new Date(),start=new Date(end.getTime()-30*86_400_000);await frozen.submit('statement','/api/sandbox/sportsbook/statements','POST',idempotencyKey=>({periodStart:start.toISOString(),periodEnd:end.toISOString(),idempotencyKey}));setStatus('Your 30-day statement summary is ready below.');if(statementCursors.length)setStatementCursors([]);else statements.reload()}catch(reason){setError(reason instanceof CustomerApiError?reason.code:'Statement generation failed.')}finally{setStatementPending(false)}}

  return <CustomerShell current="wallet" authenticated={Boolean(session.data?.authenticated)} accountReference={session.data?.accountReference}>
    <AccountPageHeader title="Wallet" description="Your balance, amounts on hold and payment history. Practice funds only — no real money." />
    {wallet.loading && <LoadingPanel label="Loading wallet ledger" />}
    {wallet.error && <ErrorPanel error={wallet.error} retry={wallet.reload} />}
    {wallet.data && <>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs font-medium text-slate-500">Available cash</p><p className="mt-2 break-words text-2xl font-semibold tabular-nums">{formatMinor(wallet.data.availableMinor, wallet.data.currency, exponent)}</p><p className="mt-1 text-xs text-slate-500">As of {formatDate(wallet.data.asOf)}</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs font-medium text-slate-500">Posted balance</p><p className="mt-2 break-words text-2xl font-semibold tabular-nums">{formatMinor(wallet.data.postedMinor, wallet.data.currency, exponent)}</p><p className="mt-1 text-xs text-slate-500">Ledger projection</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs font-medium text-slate-500">Active holds</p><p className="mt-2 break-words text-2xl font-semibold tabular-nums">{formatMinor(wallet.data.heldMinor, wallet.data.currency, exponent)}</p><p className="mt-1 text-xs text-slate-500">Pending {formatMinor(wallet.data.pendingMinor, wallet.data.currency, exponent)}</p></div>
        <div className="rounded-xl border border-violet-200 bg-violet-50 p-4"><p className="text-xs font-medium text-violet-700">Restricted bonus</p><p className="mt-2 break-words text-2xl font-semibold tabular-nums text-violet-950">{formatMinor(wallet.data.bonusAvailableMinor, wallet.data.currency, exponent)}</p><p className="mt-1 text-xs text-violet-700">{wallet.data.bonusAwards.filter(item=>['AWARDED','ACTIVE'].includes(item.status)).length} active awards</p></div>
      </div>

      <section aria-labelledby="fund-wallet" className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5 sm:p-6">
        <div className="flex items-start gap-3"><Landmark aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-emerald-800" /><div><h2 id="fund-wallet" className="text-lg font-semibold text-emerald-950">Add or withdraw practice funds</h2><p className="mt-1 text-sm leading-6 text-emerald-900">Practice funds only: no real payment method is connected and no real money moves. Withdrawals are held from your balance until they complete.</p></div></div>
        <div className="mt-4 inline-flex rounded-lg bg-emerald-100 p-1" role="group" aria-label="Wallet action"><button type="button" onClick={()=>{setAction('DEPOSIT');setStatus('');setError('')}} disabled={funding || Boolean(pendingIntent)} aria-pressed={action==='DEPOSIT'} className={`min-h-10 rounded-md px-4 text-sm font-semibold ${action==='DEPOSIT'?'bg-white text-emerald-950 shadow-sm':'text-emerald-800'}`}>Deposit</button><button type="button" onClick={()=>{setAction('WITHDRAWAL');setStatus('');setError('')}} disabled={funding || Boolean(pendingIntent)} aria-pressed={action==='WITHDRAWAL'} className={`min-h-10 rounded-md px-4 text-sm font-semibold ${action==='WITHDRAWAL'?'bg-white text-emerald-950 shadow-sm':'text-emerald-800'}`}>Withdraw</button></div>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1"><label htmlFor="funding-amount" className="mb-1.5 block text-xs font-semibold text-emerald-950">{(pendingIntent?.action ?? action)==='DEPOSIT'?'Deposit':'Withdrawal'} amount ({wallet.data.currency})</label><input id="funding-amount" value={pendingIntent?.amountInput ?? amount} onChange={event => { if (new RegExp(exponent > 0 ? `^\\d{0,12}(\\.\\d{0,${exponent}})?$` : '^\\d{0,12}$').test(event.target.value)) setAmount(event.target.value) }} disabled={funding || Boolean(pendingIntent)} placeholder={minorToAmountInput(wallet.data.fundingMinMinor, exponent)} inputMode="decimal" autoComplete="off" aria-describedby="funding-help" className="min-h-12 w-full rounded-lg border border-emerald-300 bg-white px-3 text-right font-semibold tabular-nums focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800" /><p id="funding-help" className="mt-1 text-xs text-emerald-800">{formatMinor(wallet.data.fundingMinMinor, wallet.data.currency, exponent)}–{formatMinor(wallet.data.fundingMaxMinor, wallet.data.currency, exponent)} ({exponent} decimal place{exponent === 1 ? '' : 's'} for {wallet.data.currency}). Your deposit limits, account restrictions and available balance are checked first.</p></div>
          <button type="button" onClick={fund} disabled={funding || Boolean(pendingIntent) || !(action==='DEPOSIT'?wallet.data.depositsEnabled:wallet.data.withdrawalsEnabled)} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-emerald-800 px-5 text-sm font-semibold text-white hover:bg-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800 disabled:cursor-wait disabled:opacity-60">{funding ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" /> : <ArrowDownToLine aria-hidden="true" className="size-4" />}{funding ? 'Submitting original request…' : pendingIntent ? 'Attempt awaiting recovery' : !(action==='DEPOSIT'?wallet.data.depositsEnabled:wallet.data.withdrawalsEnabled) ? `${action==='DEPOSIT'?'Deposits':'Withdrawals'} disabled for ${wallet.data.currency}` : action==='DEPOSIT'?'Add practice funds':'Withdraw practice funds'}</button>
        </div>
        {status && <p role="status" className="mt-4 flex items-start gap-2 rounded-lg bg-white p-3 text-sm text-emerald-900"><CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0" />{status}</p>}
        {pendingIntent && !error && !funding && <div role="status" className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950"><p>An earlier {pendingIntent.action.toLowerCase()} of {pendingIntent.amountInput} {pendingIntent.currency} has no definitive outcome on this device. Recover it before starting another; recovery repeats the exact original request and key.</p><button type="button" onClick={fund} className="mt-2 inline-flex min-h-10 items-center gap-2 rounded-lg bg-amber-900 px-3 font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-900"><RefreshCw aria-hidden="true" className="size-4" />Recover original {pendingIntent.action.toLowerCase()} request</button></div>}
        {error && <div role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900"><p>{error}</p>{pendingIntent && <><p className="mt-2">Frozen intent: {pendingIntent.action.toLowerCase()} {pendingIntent.amountInput} {pendingIntent.currency} ({pendingIntent.amountMinor} minor units). A retry uses the same HTTP method, body and request key.</p><button type="button" onClick={fund} disabled={funding} className="mt-2 inline-flex min-h-10 items-center gap-2 rounded-lg bg-red-900 px-3 font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-900 disabled:cursor-wait disabled:opacity-60"><RefreshCw aria-hidden="true" className="size-4" />Retry original {pendingIntent.action.toLowerCase()} request</button></>}</div>}
      </section>

      {wallet.data.bonusAwards.length>0&&<section aria-labelledby="bonus-wallet" className="mt-6"><h2 id="bonus-wallet" className="text-lg font-semibold">Restricted awards</h2><div className="mt-3 grid gap-3 sm:grid-cols-2">{wallet.data.bonusAwards.map(award=><article key={award.id} className="rounded-xl border border-violet-200 bg-white p-4"><div className="flex items-center justify-between gap-3"><p className="font-semibold">{award.type.replaceAll('_',' ')}</p><span className="text-xs font-semibold text-violet-800">{award.status}</span></div><p className="mt-2 text-xl font-semibold tabular-nums">{formatMinor(award.remainingMinor,wallet.data!.currency,exponent)}</p><p className="mt-1 text-xs text-slate-500">Expires {formatDate(award.expiresAt)}</p></article>)}</div></section>}

      <section aria-labelledby="statements" className="mt-6"><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 id="statements" className="text-lg font-semibold">Statements</h2><p className="mt-1 text-sm text-slate-500">Statement summaries show your opening and closing balance for each period. Downloadable statements aren’t available yet.</p></div><button type="button" onClick={generateStatement} disabled={statementPending} className="inline-flex min-h-10 items-center gap-2 rounded-lg border bg-white px-3 text-sm font-semibold disabled:opacity-60"><FileText className="size-4"/>{statementPending?'Preparing…':'Get 30-day summary'}</button></div>{statements.loading?<p role="status" className="mt-3 text-sm text-slate-600">Loading statements…</p>:statements.error?<div role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">Statements are unavailable right now. <button type="button" onClick={statements.reload} className="font-semibold underline">Retry</button></div>:statements.data?.statements.length?<div className="mt-3 grid gap-3">{statements.data.statements.map(item=><article key={item.id} className="rounded-xl border bg-white p-4"><div className="flex flex-wrap justify-between gap-3"><div><p className="font-semibold">{formatDate(item.periodStart,false)} – {formatDate(item.periodEnd,false)}</p><p className="mt-1 break-all text-xs text-slate-500">Reference {item.journalHash.slice(0, 12)}</p></div><div className="text-right text-sm"><p>Opening {formatMinor(item.openingMinor,item.currency,item.currency===wallet.data?.currency?exponent:undefined)}</p><p className="font-semibold">Closing {formatMinor(item.closingMinor,item.currency,item.currency===wallet.data?.currency?exponent:undefined)}</p></div></div></article>)}</div>:<div className="mt-3 rounded-xl border border-dashed bg-white p-6 text-center text-sm text-slate-500">You have no statement summaries yet.</div>}{statements.data&&(statementCursors.length>0||statements.data.nextCursor)&&<nav aria-label="Statement pages" className="mt-4 flex justify-between gap-3 text-sm"><button type="button" disabled={statementCursors.length===0} onClick={()=>setStatementCursors(current=>current.slice(0,-1))} className="min-h-10 rounded-lg border bg-white px-3 font-semibold disabled:opacity-50">Newer</button><button type="button" disabled={!statements.data.nextCursor} onClick={()=>{const next=statements.data?.nextCursor;if(next)setStatementCursors(current=>[...current,next])}} className="min-h-10 rounded-lg border bg-white px-3 font-semibold disabled:opacity-50">Older</button></nav>}</section>

      <section aria-labelledby="payment-history" className="mt-6">
        <h2 id="payment-history" className="text-lg font-semibold">Payment history</h2>
        {wallet.data.transactions.length === 0 ? <div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">You haven’t made any deposits or withdrawals yet.</div> : <div className="mt-3 grid gap-3">
          {wallet.data.transactions.map(transaction => <article key={transaction.id} className="grid min-w-0 gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="min-w-0"><p className="flex items-center gap-2 font-semibold"><ArrowDownToLine aria-hidden="true" className="size-4 text-emerald-700" />{transaction.type}</p><p className="mt-1 break-all text-xs text-slate-500">Payment {shortId(transaction.id)}{transaction.externalReference ? ` · Ref ${transaction.externalReference}` : ''}</p><p className="mt-1 text-xs text-slate-500">{formatDate(transaction.createdAt)}</p></div>
            <div className="sm:text-right"><p className="font-semibold tabular-nums">{transaction.type==='WITHDRAWAL'?'-':'+'}{formatMinor(transaction.amountMinor, transaction.currency, transaction.currency===wallet.data?.currency?exponent:undefined)}</p><p className={`mt-1 text-xs font-semibold ${transaction.status === 'SUCCEEDED' ? 'text-emerald-700' : 'text-amber-800'}`}>{transaction.status}</p></div>
          </article>)}
        </div>}
      </section>
    </>}
  </CustomerShell>
}
