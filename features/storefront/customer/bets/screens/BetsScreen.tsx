'use client'

import { useState } from 'react'
import type { BetsResponse, CustomerSessionSummary } from '@/features/sportsbook/customer/contracts'
import { AccountPageHeader, ErrorPanel, LoadingPanel, isClosedError } from '../../components/AccountStates'
import { CustomerShell } from '../../components/CustomerShell'
import { Dot, Empty, Ledger, Notice, Pill, PillLink, Track, label, toneFor } from '../../components/kit'
import { customerApi, formatDate, formatMinor, formatOdds, shortId, useCustomerResource, useFrozenSubmission, customerMessage } from '../../lib/customer-api'

type CashOffer={offerId:string;wagerId:string;amountMinor:string;currency:string;portionNumerator:string;portionDenominator:string;feeMinor:string;valuationHash:string;expiresAt:string}
export function BetsScreen() {
  const frozen = useFrozenSubmission()
  const session = useCustomerResource<CustomerSessionSummary>('/api/sandbox/sportsbook/session')
  const [betCursors, setBetCursors] = useState<string[]>([])
  // Paged with a stable server cursor so older bets stay reachable.
  const bets = useCustomerResource<BetsResponse>(`/api/sandbox/sportsbook/bets${betCursors.length ? `?cursor=${encodeURIComponent(betCursors[betCursors.length - 1])}` : ''}`)
  const [cashOffers,setCashOffers]=useState<Record<string,CashOffer>>({}),[cashPending,setCashPending]=useState(''),[cashMessage,setCashMessage]=useState('')
  async function requestCashOut(wagerId:string,portionBps:number){setCashPending(wagerId);setCashMessage('');try{const offer=await customerApi<CashOffer>('/api/sandbox/sportsbook/cashout',{method:'POST',body:JSON.stringify({wagerId,portionBps})});setCashOffers(current=>({...current,[wagerId]:offer}))}catch(error){setCashMessage(customerMessage(error,'No cash-out offer is available right now.'))}finally{setCashPending('')}}
  async function acceptCashOut(wagerId:string){const offer=cashOffers[wagerId];if(!offer)return;setCashPending(wagerId);setCashMessage('');try{const result=await frozen.submit<{amountMinor:string;currency:string;fullyClosed:boolean}>(`cashout:${offer.offerId}`,'/api/sandbox/sportsbook/cashout','PUT',idempotencyKey=>({offerId:offer.offerId,idempotencyKey}),'cashout');setCashMessage(`${result.fullyClosed?'Full':'Partial'} cash-out accepted for ${formatMinor(result.amountMinor,result.currency)}.`);setCashOffers(current=>{const next={...current};delete next[wagerId];return next});bets.reload();session.reload()}catch(error){setCashMessage(customerMessage(error,'The cash-out wasn’t accepted. Get a new offer.'))}finally{setCashPending('')}}

  return <CustomerShell current="bets" authenticated={Boolean(session.data?.authenticated)} accountReference={session.data?.accountReference} closed={isClosedError(session.error)}>
    <AccountPageHeader title="My bets" meta={bets.data ? `${bets.data.bets.length} on this page` : undefined} />
    {bets.loading && <LoadingPanel label="Loading your bets" />}
    {bets.error && <ErrorPanel error={bets.error} retry={bets.reload} />}
    {bets.data && bets.data.bets.length === 0 && betCursors.length === 0 && <div className="mt-6"><Empty>No bets yet</Empty><div className="mt-4 flex justify-center"><Track><PillLink href="/" variant="primary">Browse prices</PillLink></Track></div></div>}
    {cashMessage&&<Notice className="mt-6">{cashMessage}</Notice>}
    {bets.data && bets.data.bets.length > 0 && <div className="mt-6 grid gap-4">
      {bets.data.bets.map(bet => {const open=['ACCEPTED','OPEN','PARTIALLY_CASHED_OUT'].includes(bet.status);return <article key={bet.id} className="min-w-0 overflow-hidden rounded-[2px] bg-sb-card ring-1 ring-sb-line">
        <div className="grid min-w-0 md:grid-cols-[minmax(0,1fr)_220px]">
          <div className="min-w-0 p-4 sm:p-5">
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs"><span className="font-semibold  text-sb-mute">{label(bet.structure)} · {bet.parts.length||1} part{bet.parts.length===1?'':'s'}</span><span className="tabular-nums text-sb-mute">{formatDate(bet.acceptedAt ?? bet.createdAt)}</span></p>
            <h2 className="mt-1.5 break-words font-sb-display text-2xl font-bold uppercase leading-tight tracking-wide"><Dot tone={toneFor(bet.status)} />{bet.eventName}</h2>
            <p className="mt-1 break-words text-sm"><span className="font-semibold">{bet.selectionName}</span> <span className="text-sb-mute">· {bet.marketName}</span> <span className="ml-1 tabular-nums font-semibold ">@ {bet.decimalOdds}</span></p>
            <p className="mt-2 text-xs font-semibold  text-sb-mute">{label(bet.status)}</p>
            {bet.priceEvidenceSource==='QUOTED'&&<p className="mt-2 text-xs text-sb-mute">{bet.status==='REJECTED'?'Quoted terms · no stake reserved':'Quoted prices · accepted price per selection unavailable'}</p>}
            {bet.legs.length>0&&<ol className="mt-3 divide-y divide-sb-line rounded-[2px] bg-sb-paper px-3.5 ring-1 ring-inset ring-sb-line">{bet.legs.map(leg=><li key={`${leg.index}:${leg.priceSnapshotId}`} className="flex items-start justify-between gap-3 py-2.5 text-xs"><div className="min-w-0"><p className="font-semibold">{leg.live&&<Dot tone="live" />}{leg.index+1}. {leg.selectionName}</p><p className="mt-0.5 truncate text-sb-mute">{leg.eventName} · {leg.marketName}{leg.line?` · ${leg.line}`:''}</p><p className="mt-0.5 tabular-nums text-[11px] text-sb-mute">{shortId(leg.priceSnapshotId)}</p></div><span className="shrink-0 tabular-nums text-sm font-semibold ">{formatOdds(leg.decimalOdds)}</span></li>)}</ol>}
            {bet.parts.length>1&&<ul className="mt-3 space-y-1 tabular-nums text-xs">{bet.parts.map(part=><li key={part.id} className="flex flex-wrap justify-between gap-2"><span className="text-sb-mute"><Dot tone={toneFor(part.status)} />{part.key} · {formatMinor(part.stakeMinor,bet.currency)} @ {formatOdds(part.decimalOdds)}</span><span>{formatMinor(part.potentialReturnMinor,bet.currency)}</span></li>)}</ul>}
            {bet.cashOut&&<p className="mt-3 text-xs font-semibold"><Dot tone="win" />Cash-out {bet.cashOut.acceptedPortion} · <span className="tabular-nums">{formatMinor(bet.cashOut.acceptedMinor,bet.currency)}</span></p>}
            {bet.cashOutHistory.length>0&&<div className="mt-3"><p className="text-[11px] font-semibold  text-sb-mute">Cash-out history</p><ul className="mt-1.5 space-y-1 tabular-nums text-[11px] text-sb-mute">{bet.cashOutHistory.map(item=><li key={item.id} className="break-all">{item.reversalOfId?`Reversal of ${shortId(item.reversalOfId)}`:item.reversedById?`Reversed by ${shortId(item.reversedById)}`:'Accepted'} · {formatMinor(item.amountMinor,item.currency)} · {formatDate(item.acceptedAt)}</li>)}</ul></div>}
            {bet.rejectionCode && <p role="status" className="mt-3 text-xs font-semibold text-red-800"><Dot tone="alert" />{bet.rejectionCode==='PARTIAL_ACCEPTANCE'?`Partial acceptance · rejected parts ${bet.rejectedPartIndexes.join(', ')}`:`Rejected · ${bet.rejectionCode.replaceAll('_', ' ').toLowerCase()}`}</p>}
          </div>
          <dl className="sb-tear grid grid-cols-2 gap-x-4 gap-y-3 bg-sb-paper/60 p-4 text-sm md:border-l md:border-t-0 md: md:border-sb-line md:p-5 md:before:hidden md:after:hidden md:grid-cols-1">
            <div><dt className="text-[11px] font-semibold  text-sb-mute">Stake</dt><dd className="mt-0.5 tabular-nums text-lg font-semibold ">{formatMinor(bet.stakeMinor, bet.currency)}</dd></div>
            <div><dt className="text-[11px] font-semibold  text-sb-mute">Return</dt><dd className="mt-0.5 tabular-nums text-lg font-semibold ">{formatMinor(bet.potentialReturnMinor, bet.currency)}</dd></div>
            {bet.netRemainingStakeMinor !== null && <div><dt className="text-[11px] font-semibold  text-sb-mute">Stake after cash-out</dt><dd className="mt-0.5 tabular-nums font-semibold ">{formatMinor(bet.netRemainingStakeMinor, bet.currency)}</dd></div>}
            {bet.payoutMinor !== null && <div><dt className="text-[11px] font-semibold  text-sb-mute">Paid</dt><dd className="mt-0.5 tabular-nums text-lg font-semibold  text-sb-win">{formatMinor(bet.payoutMinor, bet.currency)}</dd></div>}
          </dl>
        </div>
        {open&&<div className="border-t border-sb-line px-4 py-3 sm:px-5">{cashOffers[bet.id]?<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold"><Dot tone="info" />Cash-out offer · <span className="tabular-nums">{formatMinor(cashOffers[bet.id].amountMinor,bet.currency)}</span></p><p className="mt-0.5 tabular-nums text-[11px] text-sb-mute">Expires {formatDate(cashOffers[bet.id].expiresAt)}</p></div><Track><Pill variant="primary" size="sm" onClick={()=>acceptCashOut(bet.id)} disabled={cashPending===bet.id}>{cashPending===bet.id?'Revalidating…':'Accept offer'}</Pill></Track></div>:<Track label="Cash out"><Pill size="sm" onClick={()=>requestCashOut(bet.id,5000)} disabled={cashPending===bet.id}>Cash out 50%</Pill><Pill size="sm" onClick={()=>requestCashOut(bet.id,10000)} disabled={cashPending===bet.id}>Cash out all</Pill></Track>}</div>}
        <details className="border-t border-sb-line px-4 py-3 text-xs text-sb-mute sm:px-5">
          <summary className="cursor-pointer font-semibold text-sb-ink">References</summary>
          <Ledger className="mt-2 text-xs" rows={[
            ['Wager', bet.id],
            ['Quote', bet.quoteId || '—'],
            ['Price snapshot', bet.priceSnapshotId || '—'],
            ['Terms', bet.termsHash || '—'],
            ...(bet.settlementEvidence ? [
              ['Settlement', `${bet.settlementEvidence.receiptId} · ${bet.settlementEvidence.outcome}`],
              ['Payout', `${bet.settlementEvidence.payoutMinor} minor ${bet.currency} · exp ${bet.settlementEvidence.currencyExponent}`],
              ['Result / rule', `${bet.settlementEvidence.resultVersionId} · ${bet.settlementEvidence.ruleVersion}`],
              ['Payment', `${bet.settlementEvidence.journalId} · ${bet.settlementEvidence.capturedHoldId}`],
              ['Plan', bet.settlementEvidence.planHash],
            ] as Array<[string, string]> : bet.status === 'SETTLED' ? [['Settlement', 'Not recorded for this bet']] as Array<[string, string]> : []),
          ]} />
        </details>
        {['ACCEPTED','OPEN','GRADED','SETTLED','VOID','PARTIALLY_CASHED_OUT','CASHED_OUT'].includes(bet.status) && <div className="sr-only">Accepted wager {shortId(bet.id)}</div>}
      </article>})}
    </div>}{bets.data && (betCursors.length > 0 || bets.data.nextCursor) && <nav aria-label="Bet pages" className="mt-4"><Track><Pill size="sm" disabled={betCursors.length === 0 || bets.loading} onClick={() => setBetCursors(current => current.slice(0, -1))}>Newer</Pill><Pill size="sm" disabled={!bets.data.nextCursor || bets.loading} onClick={() => { const next = bets.data?.nextCursor; if (next) setBetCursors(current => [...current, next]) }}>Older</Pill></Track></nav>}
  </CustomerShell>
}
