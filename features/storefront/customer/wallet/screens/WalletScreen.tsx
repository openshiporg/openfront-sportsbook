'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowDownToLine, FileText, LoaderCircle, RefreshCw } from 'lucide-react'
import type { CustomerSessionSummary, FundingResult, WalletResponse } from '@/features/sportsbook/customer/contracts'
import { AccountPageHeader, AuthenticationRequired, ErrorPanel, LoadingPanel, isClosedError } from '../../components/AccountStates'
import { CustomerShell } from '../../components/CustomerShell'
import { Card, Dot, Empty, Notice, Pill, Section, Track, fieldClass, label, toneFor } from '../../components/kit'
import { amountInputToMinor, customerApi, CustomerApiError, formatDate, formatMinor, minorToAmountInput, shortId, useCustomerResource, useFrozenSubmission, customerMessage } from '../../lib/customer-api'
import { clearPersistedFundingIntent, fundingRequestInit, loadPersistedFundingIntent, persistFundingIntent, resolveFundingIntent, type FundingIntent } from '../funding-intent'
import AuthorizeNetCardForm from '../components/authorizenet-card-form'

type Statements={statements:Array<{id:string;periodStart:string;periodEnd:string;openingMinor:string;closingMinor:string;currency:string;journalHash:string;artifactReference:string;status:string}>;nextCursor:string|null}
export function WalletScreen() {
  const session = useCustomerResource<CustomerSessionSummary>('/api/sandbox/sportsbook/session')
  const wallet = useCustomerResource<WalletResponse>(session.data?.authenticated ? '/api/sandbox/sportsbook/wallet' : null)
  const signedOut = session.data?.authenticated === false
  const [statementCursors,setStatementCursors]=useState<string[]>([])
  const statementCursor=statementCursors[statementCursors.length-1]
  const statements = useCustomerResource<Statements>(session.data?.authenticated ? `/api/sandbox/sportsbook/statements${statementCursor?`?cursor=${encodeURIComponent(statementCursor)}`:''}` : null)
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
  const [opaqueData, setOpaqueData] = useState<{dataDescriptor:string;dataValue:string}|null>(null)
  const [cageAmount, setCageAmount] = useState('')
  const [cageBusy, setCageBusy] = useState(false)
  const [cageNotice, setCageNotice] = useState<{ reference: string; amount: string } | null>(null)
  const [cageError, setCageError] = useState('')
  async function requestCage() {
    if (cageBusy || !wallet.data) return
    const amountMinor = amountInputToMinor(cageAmount, wallet.data.currencyExponent)
    if (!amountMinor || BigInt(amountMinor) < BigInt(wallet.data.fundingMinMinor) || BigInt(amountMinor) > BigInt(wallet.data.fundingMaxMinor)) { setCageError(`Enter an amount from ${formatMinor(wallet.data.fundingMinMinor, wallet.data.currency, wallet.data.currencyExponent)} to ${formatMinor(wallet.data.fundingMaxMinor, wallet.data.currency, wallet.data.currencyExponent)}.`); return }
    setCageBusy(true); setCageError('')
    try {
      const result = await customerApi<{ reference: string; amountMinor: string; currency: string }>('/api/sandbox/sportsbook/cage-deposit', { method: 'POST', body: JSON.stringify({ amountMinor, idempotencyKey: `cage_${crypto.randomUUID()}` }) })
      setCageNotice({ reference: result.reference, amount: formatMinor(result.amountMinor, result.currency, wallet.data.currencyExponent) })
      setCageAmount(''); wallet.reload()
    } catch (reason) { setCageError(customerMessage(reason, 'The deposit request wasn’t created. Try again.')) }
    finally { setCageBusy(false) }
  }
  const owner = session.data?.accountReference ?? ''
  const exponent = wallet.data?.currencyExponent ?? 0
  // Restore an unresolved original attempt for this account before any new action is offered.
  useEffect(() => {
    if (!owner || pendingIntentRef.current) return
    const restored = loadPersistedFundingIntent(owner)
    if (restored) { pendingIntentRef.current = restored; setPendingIntent(restored) }
  }, [owner])
  // Back from Stripe Checkout: confirm the same deposit attempt once (same key; nothing new is charged).
  const returnChecked = useRef(false)
  useEffect(() => {
    if (returnChecked.current || !pendingIntent || !wallet.data) return
    const params = new URLSearchParams(window.location.search)
    const back = params.get('deposit')
    if (!back) return
    returnChecked.current = true
    window.history.replaceState(null, '', window.location.pathname)
    if (back === 'cancelled') setStatus('Card payment cancelled. Check again if you finished paying, or wait for it to expire.')
    void fund()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingIntent, wallet.data])

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

      if (intent.action === 'DEPOSIT' && wallet.data?.card?.provider === 'authorizenet' && !opaqueData) {
        setError('Enter your card details and securely tokenize them before adding funds.')
        return
      }
      requestStarted = true
      const init = fundingRequestInit(intent)
      if (intent.action === 'DEPOSIT' && opaqueData) init.body = JSON.stringify({ ...JSON.parse(String(init.body)), opaqueData })
      const result = await customerApi<FundingResult>('/api/sandbox/sportsbook/wallet', init)
      const actionLabel = intent.action.toLowerCase()
      const amountLabel = formatMinor(result.amountMinor ?? intent.amountMinor, result.currency ?? intent.currency, result.currencyExponent ?? exponent)
      wallet.reload()
      session.reload()
      if (result.state === 'PENDING' && result.redirectUrl && /^https:\/\/checkout\.stripe\.com\//.test(result.redirectUrl)) {
        setStatus('Opening secure card payment…')
        window.location.assign(result.redirectUrl)
        return
      }
      if (result.state === 'PENDING' || result.state === 'IN_PROGRESS') {
        // Not definitive: keep the original attempt locked (funds stay reserved server-side for withdrawals).
        setStatus(`Your ${actionLabel} of ${amountLabel} isn’t confirmed yet. ${intent.action === 'WITHDRAWAL' ? 'The amount stays reserved. ' : ''}Check again to follow up on the same request.`)
        return
      }
      setStatus(result.duplicate
        ? `This ${actionLabel} of ${amountLabel} was already completed.`
        : intent.action === 'DEPOSIT'
          ? `${amountLabel} was added to your wallet.`
          : `${amountLabel} withdrawal completed.`)
      pendingIntentRef.current = null
      setPendingIntent(null)
      clearPersistedFundingIntent(owner)
    } catch (reason) {
      if (reason instanceof CustomerApiError && reason.payload.state === 'REJECTED') {
        // A definitive server receipt for this key: nothing was moved, so a new draft is allowed.
        setError(`${customerMessage(reason, 'This request was declined.')} No funds were moved.`)
        pendingIntentRef.current = null
        setPendingIntent(null)
        clearPersistedFundingIntent(owner)
        wallet.reload()
        return
      }
      const responseCode = reason instanceof CustomerApiError ? customerMessage(reason, 'The request was declined.') : null
      setError(responseCode
        ? `${responseCode} The original request stays locked; retry repeats it exactly.`
        : requestStarted
          ? 'No response received. The original request stays locked; retry repeats it exactly.'
          : 'The request wasn’t sent. Check the amount and try again.')
    } finally {
      fundingLockRef.current = false
      setFunding(false)
    }
  }

  async function generateStatement(){setStatementPending(true);setError('');try{const end=new Date(),start=new Date(end.getTime()-30*86_400_000);await frozen.submit('statement','/api/sandbox/sportsbook/statements','POST',idempotencyKey=>({periodStart:start.toISOString(),periodEnd:end.toISOString(),idempotencyKey}));setStatus('30-day statement ready.');if(statementCursors.length)setStatementCursors([]);else statements.reload()}catch(reason){setError(customerMessage(reason,'The statement couldn’t be prepared. Try again.'))}finally{setStatementPending(false)}}

  const enabled = wallet.data ? (action==='DEPOSIT'?wallet.data.depositsEnabled&&Boolean(wallet.data.card):wallet.data.withdrawalsEnabled) : false
  return <CustomerShell current="wallet" authenticated={Boolean(session.data?.authenticated)} accountReference={session.data?.accountReference} closed={isClosedError(session.error)}>
    <AccountPageHeader title="Wallet" meta={wallet.data ? `Wallet · as of ${formatDate(wallet.data.asOf)}` : 'Wallet'} />
    {(session.loading || wallet.loading) && <LoadingPanel label="Loading wallet" />}
    {signedOut && <AuthenticationRequired />}
    {wallet.error && <ErrorPanel error={wallet.error} retry={wallet.reload} />}
    {wallet.data && <>
      <div className="mt-6 overflow-hidden rounded-[2px] bg-sb-night text-white">
        <div className="grid gap-px bg-sb-rule sm:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="bg-sb-night px-5 py-5"><p className="text-xs font-semibold  text-white/95">Available cash</p><p className="mt-1 break-words tabular-nums text-3xl font-semibold  text-sb-flood sm:text-4xl">{formatMinor(wallet.data.availableMinor, wallet.data.currency, exponent)}</p></div>
          <div className="bg-sb-night px-5 py-4 sm:py-5"><p className="text-xs font-semibold  text-white/95">Posted</p><p className="mt-1 break-words tabular-nums text-lg font-semibold ">{formatMinor(wallet.data.postedMinor, wallet.data.currency, exponent)}</p></div>
          <div className="bg-sb-night px-5 py-4 sm:py-5"><p className="text-xs font-semibold  text-white/95">On hold</p><p className="mt-1 break-words tabular-nums text-lg font-semibold ">{formatMinor(wallet.data.heldMinor, wallet.data.currency, exponent)}</p><p className="tabular-nums text-xs text-white/95">Pending {formatMinor(wallet.data.pendingMinor, wallet.data.currency, exponent)}</p></div>
          <div className="bg-sb-night px-5 py-4 sm:py-5"><p className="text-xs font-semibold  text-white/95">Bonus</p><p className="mt-1 break-words tabular-nums text-lg font-semibold ">{formatMinor(wallet.data.bonusAvailableMinor, wallet.data.currency, exponent)}</p><p className="tabular-nums text-xs text-white/95">{wallet.data.bonusAwards.filter(item=>['AWARDED','ACTIVE'].includes(item.status)).length} active</p></div>
        </div>
      </div>

      <section aria-labelledby="fund-wallet" className="mt-6 rounded-[2px] bg-sb-card p-5 ring-1 ring-sb-line sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="fund-wallet" className="font-sb-display text-2xl font-bold uppercase tracking-wide">{pendingIntent ? <Dot tone="wait" /> : null}Move funds</h2>
          <Track label="Wallet action"><Pill variant="flat" size="sm" onClick={()=>{setAction('DEPOSIT');setStatus('');setError('')}} disabled={funding || Boolean(pendingIntent)} aria-pressed={action==='DEPOSIT'}>Deposit</Pill><Pill variant="flat" size="sm" onClick={()=>{setAction('WITHDRAWAL');setStatus('');setError('')}} disabled={funding || Boolean(pendingIntent)} aria-pressed={action==='WITHDRAWAL'}>Withdraw</Pill></Track>
        </div>
        {action === 'DEPOSIT' && (wallet.data.card?.provider === 'authorizenet' ? <AuthorizeNetCardForm apiLoginId={wallet.data.card.apiLoginId} clientKey={wallet.data.card.clientKey} env={wallet.data.card.env} onToken={setOpaqueData} /> : wallet.data.card?.provider === 'stripe' ? <p className="mt-4 text-sm text-sb-mute">Pay by card on Stripe&apos;s secure page. Your balance updates as soon as the payment clears.</p> : <p role="status" className="mt-4 text-sm text-sb-mute">Card deposits open soon</p>)}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1"><label htmlFor="funding-amount" className="mb-1.5 block text-xs font-semibold  text-sb-mute">{(pendingIntent?.action ?? action)==='DEPOSIT'?'Deposit':'Withdrawal'} · {wallet.data.currency}</label><input id="funding-amount" value={pendingIntent?.amountInput ?? amount} onChange={event => { if (new RegExp(exponent > 0 ? `^\\d{0,12}(\\.\\d{0,${exponent}})?$` : '^\\d{0,12}$').test(event.target.value)) setAmount(event.target.value) }} disabled={funding || Boolean(pendingIntent)} placeholder={minorToAmountInput(wallet.data.fundingMinMinor, exponent)} inputMode="decimal" autoComplete="off" aria-describedby="funding-help" className={`${fieldClass} min-h-12 text-right tabular-nums text-xl font-semibold `} /><p id="funding-help" className="mt-1.5 tabular-nums text-xs text-sb-mute">{formatMinor(wallet.data.fundingMinMinor, wallet.data.currency, exponent)} – {formatMinor(wallet.data.fundingMaxMinor, wallet.data.currency, exponent)}</p></div>
          <Track className="self-start sm:mb-6 sm:self-auto"><Pill variant="primary" size="lg" onClick={fund} disabled={funding || Boolean(pendingIntent) || !enabled}>{funding ? <LoaderCircle aria-hidden="true" className="animate-spin motion-reduce:animate-none" /> : <ArrowDownToLine aria-hidden="true" />}{funding ? 'Submitting…' : pendingIntent ? 'Awaiting recovery' : !enabled ? (action==='DEPOSIT'&&wallet.data.depositsEnabled?'Card deposits open soon':`${action==='DEPOSIT'?'Deposits':'Withdrawals'} off for ${wallet.data.currency}`) : action==='DEPOSIT'?'Add funds':'Withdraw funds'}</Pill></Track>
        </div>
        {action === 'DEPOSIT' && wallet.data.cage && <div className="mt-6 border-t border-sb-line pt-5">
          <h3 className="font-sb-display text-xl font-bold uppercase tracking-wide">Deposit at the cage</h3>
          <p className="mt-1 text-sm text-sb-mute">Request an amount, then pay cash at the retail counter with your reference code.</p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1"><label htmlFor="cage-amount" className="mb-1.5 block text-[12px] font-semibold text-sb-mute">Cash deposit · {wallet.data.currency}</label><input id="cage-amount" value={cageAmount} onChange={event => { if (/^\d{0,12}(\.\d{0,2})?$/.test(event.target.value)) setCageAmount(event.target.value) }} inputMode="decimal" autoComplete="off" placeholder={minorToAmountInput(wallet.data.fundingMinMinor, exponent)} className={`${fieldClass} min-h-12 text-right tabular-nums text-xl font-semibold`} /></div>
            <Track className="self-start sm:self-auto"><Pill variant="primary" size="lg" onClick={requestCage} disabled={cageBusy}>{cageBusy ? 'Requesting…' : 'Request cage deposit'}</Pill></Track>
          </div>
          {cageNotice && <Notice tone="ok" className="mt-4">Show reference <span className="font-semibold tabular-nums">{cageNotice.reference}</span> at the cage to deposit {cageNotice.amount}. Your balance updates when the cage confirms receipt.</Notice>}
          {cageError && <p role="alert" className="mt-3 text-sm text-red-800">{cageError}</p>}
        </div>}
        {status && <Notice tone="ok" className="mt-4">{status}</Notice>}
        {pendingIntent && !error && !funding && <div role="status" className="mt-4 rounded-[2px] bg-amber-50 p-4 text-sm text-amber-950 ring-1 ring-amber-200"><p><Dot tone="wait" />Unconfirmed {pendingIntent.action.toLowerCase()} · <span className="tabular-nums">{pendingIntent.amountInput} {pendingIntent.currency}</span></p><div className="mt-3"><Track><Pill size="sm" onClick={fund}><RefreshCw aria-hidden="true" />Check again</Pill></Track></div></div>}
        {error && <div role="alert" className="mt-4 rounded-[2px] bg-red-50 p-4 text-sm text-red-950 ring-1 ring-red-200"><p><Dot tone="alert" />{error}</p>{pendingIntent && <><p className="mt-2 tabular-nums text-xs">{pendingIntent.action.toLowerCase()} {pendingIntent.amountInput} {pendingIntent.currency} · {pendingIntent.amountMinor} minor units</p><div className="mt-3"><Track><Pill size="sm" onClick={fund} disabled={funding}><RefreshCw aria-hidden="true" />Retry original {pendingIntent.action.toLowerCase()}</Pill></Track></div></>}</div>}
      </section>

      {wallet.data.bonusAwards.length>0&&<Section id="bonus-wallet" title="Bonus awards" count={wallet.data.bonusAwards.length}><div className="grid gap-3 sm:grid-cols-2">{wallet.data.bonusAwards.map(award=><Card key={award.id} className="p-4"><p className="text-sm font-semibold"><Dot tone={toneFor(award.status)} />{label(award.type)}<span className="ml-2 text-xs font-normal text-sb-mute">{label(award.status)}</span></p><p className="mt-2 tabular-nums text-xl font-semibold ">{formatMinor(award.remainingMinor,wallet.data!.currency,exponent)}</p><p className="mt-0.5 tabular-nums text-xs text-sb-mute">Expires {formatDate(award.expiresAt)}</p></Card>)}</div></Section>}

      <Section id="statements" title="Statements" actions={<Track><Pill size="sm" onClick={generateStatement} disabled={statementPending}><FileText aria-hidden="true" />{statementPending?'Preparing…':'30-day statement'}</Pill></Track>}>{statements.loading?<p role="status" className="text-sm text-sb-mute">Loading statements…</p>:statements.error?<div role="alert" className="flex flex-wrap items-center gap-3 rounded-[2px] bg-red-50 px-4 py-3 text-sm text-red-950 ring-1 ring-red-200"><span><Dot tone="alert" />Statements unavailable</span><Track><Pill size="sm" onClick={statements.reload}>Retry</Pill></Track></div>:statements.data?.statements.length?<Card className="divide-y divide-sb-line">{statements.data.statements.map(item=><div key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5"><div className="min-w-0"><p className="text-sm font-semibold"><Dot tone={toneFor(item.status)} />{formatDate(item.periodStart,false)} – {formatDate(item.periodEnd,false)}</p><p className="mt-0.5 break-all tabular-nums text-xs text-sb-mute">Ref {item.journalHash.slice(0, 12)}</p></div><div className="text-right tabular-nums text-sm "><p className="text-sb-mute">{formatMinor(item.openingMinor,item.currency,item.currency===wallet.data?.currency?exponent:undefined)}</p><p className="font-semibold">{formatMinor(item.closingMinor,item.currency,item.currency===wallet.data?.currency?exponent:undefined)}</p></div></div>)}</Card>:<Empty>No statements</Empty>}{statements.data&&(statementCursors.length>0||statements.data.nextCursor)&&<nav aria-label="Statement pages" className="mt-4"><Track><Pill size="sm" disabled={statementCursors.length===0} onClick={()=>setStatementCursors(current=>current.slice(0,-1))}>Newer</Pill><Pill size="sm" disabled={!statements.data.nextCursor} onClick={()=>{const next=statements.data?.nextCursor;if(next)setStatementCursors(current=>[...current,next])}}>Older</Pill></Track></nav>}</Section>

      <Section id="payment-history" title="Payments" count={wallet.data.transactions.length || undefined}>
        {wallet.data.transactions.length === 0 ? <Empty>No deposits or withdrawals</Empty> : <Card className="divide-y divide-sb-line">
          {wallet.data.transactions.map(transaction => <div key={transaction.id} className="flex min-w-0 items-center justify-between gap-3 px-4 py-3.5">
            <div className="min-w-0"><p className="text-sm font-semibold"><Dot tone={toneFor(transaction.status)} />{label(transaction.type)}<span className="ml-2 text-xs font-normal text-sb-mute">{label(transaction.status)}</span></p><p className="mt-0.5 break-all tabular-nums text-xs text-sb-mute">{formatDate(transaction.createdAt)} · {shortId(transaction.id)}{transaction.externalReference ? ` · ${transaction.externalReference}` : ''}</p></div>
            <p className={`shrink-0 tabular-nums text-base font-semibold  ${transaction.type==='WITHDRAWAL'?'':'text-sb-win'}`}>{transaction.type==='WITHDRAWAL'?'−':'+'}{formatMinor(transaction.amountMinor, transaction.currency, transaction.currency===wallet.data?.currency?exponent:undefined)}</p>
          </div>)}
        </Card>}
      </Section>
    </>}
  </CustomerShell>
}
