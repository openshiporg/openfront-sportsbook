'use client'

import { useState } from 'react'
import { Ban, Banknote, CheckCircle2, Clock3, ReceiptText } from 'lucide-react'
import type { BetsResponse, CustomerSessionSummary } from '@/features/sportsbook/customer/contracts'
import { AccountPageHeader, ErrorPanel, LoadingPanel } from '../../components/AccountStates'
import { CustomerShell } from '../../components/CustomerShell'
import { customerApi, CustomerApiError, formatDate, formatMinor, formatOdds, shortId, useCustomerResource, useFrozenSubmission } from '../../lib/customer-api'

const badgeClass = (status: string) => status === 'REJECTED'
  ? 'bg-red-100 text-red-800'
  : status === 'SETTLED' || status === 'VOID'
    ? 'bg-slate-100 text-slate-700'
    : 'bg-emerald-100 text-emerald-800'

type CashOffer={offerId:string;wagerId:string;amountMinor:string;currency:string;portionNumerator:string;portionDenominator:string;feeMinor:string;valuationHash:string;expiresAt:string}
export function BetsScreen() {
  const frozen = useFrozenSubmission()
  const session = useCustomerResource<CustomerSessionSummary>('/api/sandbox/sportsbook/session')
  const [betCursors, setBetCursors] = useState<string[]>([])
  // Paged with a stable server cursor so older bets stay reachable.
  const bets = useCustomerResource<BetsResponse>(`/api/sandbox/sportsbook/bets${betCursors.length ? `?cursor=${encodeURIComponent(betCursors[betCursors.length - 1])}` : ''}`)
  const [cashOffers,setCashOffers]=useState<Record<string,CashOffer>>({}),[cashPending,setCashPending]=useState(''),[cashMessage,setCashMessage]=useState('')
  async function requestCashOut(wagerId:string,portionBps:number){setCashPending(wagerId);setCashMessage('');try{const offer=await customerApi<CashOffer>('/api/sandbox/sportsbook/cashout',{method:'POST',body:JSON.stringify({wagerId,portionBps})});setCashOffers(current=>({...current,[wagerId]:offer}))}catch(error){setCashMessage(error instanceof CustomerApiError?error.code.replaceAll('_',' ').toLowerCase():'Cash-out quote failed.')}finally{setCashPending('')}}
  async function acceptCashOut(wagerId:string){const offer=cashOffers[wagerId];if(!offer)return;setCashPending(wagerId);setCashMessage('');try{const result=await frozen.submit<{amountMinor:string;currency:string;fullyClosed:boolean}>(`cashout:${offer.offerId}`,'/api/sandbox/sportsbook/cashout','PUT',idempotencyKey=>({offerId:offer.offerId,idempotencyKey}),'cashout');setCashMessage(`${result.fullyClosed?'Full':'Partial'} cash-out accepted for ${formatMinor(result.amountMinor,result.currency)}.`);setCashOffers(current=>{const next={...current};delete next[wagerId];return next});bets.reload();session.reload()}catch(error){setCashMessage(error instanceof CustomerApiError?error.code.replaceAll('_',' ').toLowerCase():'Cash-out acceptance failed.')}finally{setCashPending('')}}

  return <CustomerShell current="bets" authenticated={Boolean(session.data?.authenticated)} accountReference={session.data?.accountReference}>
    <AccountPageHeader title="My bets" description="Your bets, their accepted prices and how they settled." aside={bets.data ? <span className="w-fit rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">{bets.data.bets.length} on this page</span> : undefined} />
    {bets.loading && <LoadingPanel label="Loading your bets" />}
    {bets.error && <ErrorPanel error={bets.error} retry={bets.reload} />}
    {bets.data && bets.data.bets.length === 0 && betCursors.length === 0 && <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center"><ReceiptText aria-hidden="true" className="mx-auto size-7 text-slate-300" /><h2 className="mt-3 font-semibold">No bets yet</h2><p className="mt-1 text-sm text-slate-600">Bets you place will appear here.</p></div>}
    {bets.data && bets.data.bets.length > 0 && <div className="mt-6 grid gap-4">
      {bets.data.bets.map(bet => <article key={bet.id} className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass(bet.status)}`}>{bet.status}</span>
          <span className="inline-flex items-center gap-1 text-xs text-slate-500"><Clock3 aria-hidden="true" className="size-3.5" />{formatDate(bet.acceptedAt ?? bet.createdAt)}</span>
        </div>
        <div className="grid min-w-0 gap-5 p-4 sm:p-5 md:grid-cols-[minmax(0,1fr)_auto]">
          <div className="min-w-0">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[.12em] text-emerald-700">{bet.structure.replaceAll('_',' ')} · {bet.parts.length||1} part{bet.parts.length===1?'':'s'}</p><h2 className="break-words text-lg font-semibold">{bet.eventName}</h2>
            <p className="mt-2 break-words text-sm"><strong>{bet.selectionName}</strong> <span className="text-slate-500">· {bet.marketName}</span></p>
            <p className="mt-1 text-sm text-slate-600">Decimal odds <span className="font-semibold tabular-nums text-slate-950">{bet.decimalOdds}</span></p>
            {bet.priceEvidenceSource==='QUOTED'&&<p className="mt-2 text-xs text-slate-600">{bet.status==='REJECTED'?'Quoted terms for this rejected request; no stake was reserved.':'Quoted prices shown; the accepted price for each selection isn’t available for this bet.'}</p>}{bet.legs.length>0&&<div className="mt-3 grid gap-1.5">{bet.legs.map(leg=><div key={`${leg.index}:${leg.priceSnapshotId}`} className="rounded-md border border-slate-200 px-3 py-2 text-xs"><p><strong>{leg.index+1}. {leg.selectionName} @ {formatOdds(leg.decimalOdds)}</strong>{leg.live?' · LIVE':''}</p><p className="mt-1 text-slate-500">{leg.eventName} · {leg.marketName}{leg.line?` · line ${leg.line}`:''}</p><p className="mt-1 break-all text-[11px] text-slate-600">Price ref {shortId(leg.priceSnapshotId)}</p></div>)}</div>}{bet.parts.length>1&&<div className="mt-3 grid gap-1.5">{bet.parts.map(part=><div key={part.id} className="flex flex-wrap justify-between gap-2 rounded-md bg-slate-50 px-3 py-2 text-xs"><span>{part.key} · {formatMinor(part.stakeMinor,bet.currency)} @ {formatOdds(part.decimalOdds)}</span><strong>{part.status} · {formatMinor(part.potentialReturnMinor,bet.currency)}</strong></div>)}</div>}{bet.cashOut&&<p className="mt-3 inline-flex items-center gap-2 rounded-lg bg-violet-50 px-3 py-2 text-xs font-medium text-violet-900"><Banknote className="size-3.5"/>Net cash-out {bet.cashOut.acceptedPortion} · {formatMinor(bet.cashOut.acceptedMinor,bet.currency)}</p>}{bet.cashOutHistory.length>0&&<div className="mt-3 rounded-lg border border-violet-100 bg-violet-50/50 p-3"><p className="text-xs font-semibold text-violet-950">Cash-out and correction history</p><ul className="mt-2 grid gap-1.5 text-xs text-violet-900">{bet.cashOutHistory.map(item=><li key={item.id} className="break-all">{item.reversalOfId?`Reversal of ${shortId(item.reversalOfId)}`:item.reversedById?`Reversed by ${shortId(item.reversedById)}`:'Accepted'} · {formatMinor(item.amountMinor,item.currency)} · {formatDate(item.acceptedAt)}</li>)}</ul></div>}{bet.rejectionCode && <p role="status" className="mt-3 inline-flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-800"><Ban aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />{bet.rejectionCode==='PARTIAL_ACCEPTANCE'?`Partial acceptance · rejected parts: ${bet.rejectedPartIndexes.join(', ')}`:`Rejected: ${bet.rejectionCode.replaceAll('_', ' ').toLowerCase()}`}</p>}
          </div>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 border-t border-slate-200 pt-4 text-sm md:min-w-56 md:grid-cols-1 md:border-l md:border-t-0 md:pl-5 md:pt-0">
            <div><dt className="text-xs text-slate-500">Stake</dt><dd className="mt-1 font-semibold tabular-nums">{formatMinor(bet.stakeMinor, bet.currency)}</dd></div>
            <div><dt className="text-xs text-slate-500">Potential return</dt><dd className="mt-1 font-semibold tabular-nums">{formatMinor(bet.potentialReturnMinor, bet.currency)}</dd></div>
            {bet.netRemainingStakeMinor !== null && <div><dt className="text-xs text-slate-500">Stake after net cash-outs</dt><dd className="mt-1 font-semibold tabular-nums">{formatMinor(bet.netRemainingStakeMinor, bet.currency)}</dd></div>}
            {bet.payoutMinor !== null && <div><dt className="text-xs text-slate-500">Settled payout</dt><dd className="mt-1 font-semibold tabular-nums">{formatMinor(bet.payoutMinor, bet.currency)}</dd></div>}
          </dl>
        </div>
        {['ACCEPTED','OPEN','PARTIALLY_CASHED_OUT'].includes(bet.status)&&<div className="border-t border-slate-200 px-4 py-3 sm:px-5">{cashOffers[bet.id]?<div className="flex flex-col gap-3 rounded-lg border border-violet-200 bg-violet-50 p-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold text-violet-950">Cash-out offer · {formatMinor(cashOffers[bet.id].amountMinor,bet.currency)}</p><p className="mt-1 break-all text-xs text-violet-800">Expires {formatDate(cashOffers[bet.id].expiresAt)}</p></div><button type="button" onClick={()=>acceptCashOut(bet.id)} disabled={cashPending===bet.id} className="min-h-10 shrink-0 rounded-lg bg-violet-900 px-4 text-sm font-semibold text-white disabled:opacity-60">{cashPending===bet.id?'Revalidating…':'Accept offer'}</button></div>:<div className="flex flex-wrap gap-2"><button type="button" onClick={()=>requestCashOut(bet.id,5000)} disabled={cashPending===bet.id} className="min-h-10 rounded-lg border px-3 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60">Quote 50% cash-out</button><button type="button" onClick={()=>requestCashOut(bet.id,10000)} disabled={cashPending===bet.id} className="min-h-10 rounded-lg bg-slate-900 px-3 text-sm font-semibold text-white disabled:opacity-60">Quote full cash-out</button></div>}</div>}
        <details className="border-t border-slate-200 px-4 py-3 text-xs text-slate-600 sm:px-5">
          <summary className="cursor-pointer font-semibold text-slate-800 focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">Receipt and reference numbers</summary>
          <dl className="mt-3 grid min-w-0 gap-2 break-all rounded-lg bg-slate-50 p-3">
            <div><dt className="inline font-semibold">Wager </dt><dd className="inline">{bet.id}</dd></div>
            <div><dt className="inline font-semibold">Quote </dt><dd className="inline">{bet.quoteId || '—'}</dd></div>
            <div><dt className="inline font-semibold">Price snapshot </dt><dd className="inline">{bet.priceSnapshotId || '—'}</dd></div>
            <div><dt className="inline font-semibold">Terms reference </dt><dd className="inline">{bet.termsHash || '—'}</dd></div>
            {bet.settlementEvidence ? <>
              <div><dt className="inline font-semibold">Original FULL settlement </dt><dd className="inline">{bet.settlementEvidence.receiptId} · {bet.settlementEvidence.outcome}</dd></div>
              <div><dt className="inline font-semibold">Original payout </dt><dd className="inline">{bet.settlementEvidence.payoutMinor} minor {bet.currency} · exponent {bet.settlementEvidence.currencyExponent}</dd></div>
              <div><dt className="inline font-semibold">Result / accepted rule </dt><dd className="inline">{bet.settlementEvidence.resultVersionId} · {bet.settlementEvidence.ruleVersion}</dd></div>
              <div><dt className="inline font-semibold">Payment reference </dt><dd className="inline">{bet.settlementEvidence.journalId} · {bet.settlementEvidence.capturedHoldId}</dd></div>
              <div><dt className="inline font-semibold">Settlement reference </dt><dd className="inline">{bet.settlementEvidence.planHash}</dd></div>
            </> : bet.status === 'SETTLED' ? <div>Detailed settlement records aren’t available for this older bet.</div> : null}
          </dl>
        </details>
        {['ACCEPTED','OPEN','GRADED','SETTLED','VOID','PARTIALLY_CASHED_OUT','CASHED_OUT'].includes(bet.status) && <div className="sr-only"><CheckCircle2 />Accepted wager {shortId(bet.id)}</div>}
      </article>)}
    </div>}{bets.data && (betCursors.length > 0 || bets.data.nextCursor) && <nav aria-label="Bet pages" className="mt-4 flex justify-between gap-3 text-sm"><button type="button" disabled={betCursors.length === 0 || bets.loading} onClick={() => setBetCursors(current => current.slice(0, -1))} className="min-h-10 rounded-lg border bg-white px-3 font-semibold disabled:opacity-50">Newer bets</button><button type="button" disabled={!bets.data.nextCursor || bets.loading} onClick={() => { const next = bets.data?.nextCursor; if (next) setBetCursors(current => [...current, next]) }} className="min-h-10 rounded-lg border bg-white px-3 font-semibold disabled:opacity-50">Older bets</button></nav>}{cashMessage&&<div role="status" className="mt-4 rounded-lg border bg-white p-3 text-sm">{cashMessage}</div>}
  </CustomerShell>
}
