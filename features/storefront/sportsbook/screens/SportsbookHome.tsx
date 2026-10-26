'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Heart, RefreshCw, Search, X } from 'lucide-react'
import type { CatalogEvent, CatalogMarket, CatalogResponse, CatalogSelection, CustomerSessionSummary } from '@/features/sportsbook/customer/contracts'
import type { CombinationPlacementResponse, CombinationQuoteResponse } from '@/features/sportsbook/customer/combination-wagering'
import type { WagerStructure } from '@/features/sportsbook/domain/combination'
import { cn } from '@/lib/utils'
import { CustomerShell } from '../../customer/components/CustomerShell'
import { ClosedPanel, isClosedError } from '../../customer/components/AccountStates'
import { Dot, Pill, PillLink, Track, checkClass, fieldClass, pillClass } from '../../customer/components/kit'
import { placementOutcome, resolvePlacementIntent, type PlacementIntent } from '../placement-intent'
import { amountInputToMinor, currencyExponent, customerApi, CustomerApiError, formatDate, formatMinor, formatOdds, useCustomerResource, customerMessage } from '../../customer/lib/customer-api'

type Selected = { event: CatalogEvent; market: CatalogMarket; selection: CatalogSelection }
type FavoriteResponse = { favorites: Array<{ targetType: string; targetId: string }> }
type PromotionResponse = { promotions:Array<{id:string;name:string;type:string;eligibility:string}>; awards: Array<{ id: string; type: string; remainingMinor: string; currency: string; status: string; expiresAt: string }> }
type SlipState = 'IDLE' | 'QUOTING' | 'QUOTED' | 'PLACING' | 'ACCEPTED' | 'PARTIALLY_ACCEPTED' | 'REJECTED' | 'REQUOTE_REQUIRED' | 'UNRESOLVED'
const structures: Array<{value:WagerStructure;label:string;minimum:number;help:string}>=[
 {value:'STRAIGHT',label:'Straight',minimum:1,help:'One selection'}, {value:'PARLAY',label:'Parlay',minimum:2,help:'All legs must qualify'},
 {value:'SYSTEM',label:'System',minimum:3,help:'Multiple combinations'}, {value:'ROUND_ROBIN',label:'Round robin',minimum:3,help:'Generated parlays'},
]
const errorCopy:Record<string,string>={UNSUPPORTED_SETTLEMENT_STRUCTURE:'This bet type is not available right now.',PROMOTION_SETTLEMENT_UNSUPPORTED:'This promotion is not available right now.',CORRELATED_SELECTIONS_DENIED:'These selections are from the same event and can’t be combined.',TEASER_RULE_UNAVAILABLE:'These selections do not have approved teaser lines and pricing.',MAX_PAYOUT_EXCEEDED:'This bet would exceed the maximum payout. Lower the stake or remove a selection.',QUOTE_EXPIRED:'The quote expired. Request current terms.',PRICE_OR_MARKET_CHANGED:'A price changed or a market was suspended. Get a new quote.',INSUFFICIENT_FUNDS:'Available cash or selected bonus funds are below the accepted stake.',LIMIT_EXCEEDED:'The accepted stake exceeds an active safer-play limit.',STAKE_LIMIT_EXCEEDED:'This wager would exceed the active stake limit.',LOSS_LIMIT_REACHED:'Betting is paused because you have reached your net-loss limit.',LOSS_LIMIT_EVIDENCE_UNAVAILABLE:'Betting is paused while your net-loss total is confirmed. Try again shortly.',LIMIT_UNAVAILABLE:'Betting is paused while your limits are checked. Try again shortly.',SESSION_LIMIT_REACHED:'Betting is paused because this session has reached your session-time limit.',SELF_EXCLUDED:'Wagering is unavailable while self-exclusion is active.',AFFORDABILITY_REVIEW:'Wagering is paused for an affordability review.',BONUS_UNAVAILABLE:'The selected restricted award cannot fund this wager.'}

export function SportsbookHome({initialSport,initialCompetition,initialEventId,initialEventName,initialEventCompetition}:{initialSport?:string;initialCompetition?:string;initialEventId?:string;initialEventName?:string;initialEventCompetition?:string}={}) {
 const session=useCustomerResource<CustomerSessionSummary>('/api/sandbox/sportsbook/session'),signedIn=Boolean(session.data?.authenticated),favorites=useCustomerResource<FavoriteResponse>(signedIn?'/api/sandbox/sportsbook/favorites':null),promotions=useCustomerResource<PromotionResponse>(signedIn?'/api/sandbox/sportsbook/promotions':null)
 const[selected,setSelected]=useState<Selected[]>([]),[stake,setStake]=useState('10.00'),[structure,setStructure]=useState<WagerStructure>('STRAIGHT'),[systemSize,setSystemSize]=useState(2),[priceConsent,setPriceConsent]=useState('EXACT'),[allowPartial,setAllowPartial]=useState(false),[bonusAwardId,setBonusAwardId]=useState(''),[quote,setQuote]=useState<CombinationQuoteResponse|null>(null),[slipState,setSlipState]=useState<SlipState>('IDLE'),[message,setMessage]=useState(''),[receipt,setReceipt]=useState<CombinationPlacementResponse|null>(null),[placeKey,setPlaceKey]=useState(''),[query,setQuery]=useState(''),[competition,setCompetition]=useState(initialCompetition??'All'),[view,setView]=useState<'ALL'|'LIVE'|'FAVORITES'>('ALL'),[now,setNow]=useState(Date.now())
 const pendingPlacement=useRef<PlacementIntent|null>(null),placementSending=useRef(false)
 const[placementLocked,setPlacementLocked]=useState(false)
 const quoteGeneration=useRef(0)
 // Filters, search and paging run in the catalog query itself, before the page limit (never over a truncated subset).
 const[sport,setSport]=useState(initialSport??'All'),[debouncedQuery,setDebouncedQuery]=useState(''),[cursors,setCursors]=useState<string[]>([])
 useEffect(()=>{const timer=window.setTimeout(()=>setDebouncedQuery(query.trim()),300);return()=>window.clearTimeout(timer)},[query])
 useEffect(()=>{setCursors([])},[sport,competition,debouncedQuery,view])
 const favoriteIdList=useMemo(()=>(favorites.data?.favorites??[]).filter(item=>item.targetType==='EVENT').map(item=>item.targetId).slice(0,100).join(','),[favorites.data])
 const catalogPath=useMemo(()=>{const params=new URLSearchParams();if(initialEventId)params.set('event',initialEventId);if(sport!=='All')params.set('sport',sport);if(competition!=='All')params.set('competition',competition);if(debouncedQuery)params.set('q',debouncedQuery);if(view==='LIVE')params.set('live','1');if(view==='FAVORITES')params.set('ids',favoriteIdList);const cursor=cursors[cursors.length-1];if(cursor)params.set('cursor',cursor);const search=params.toString();return`/api/sandbox/sportsbook/catalog${search?`?${search}`:''}`},[competition,cursors,debouncedQuery,favoriteIdList,initialEventId,sport,view])
 const catalog=useCustomerResource<CatalogResponse>(catalogPath)
 useEffect(()=>{if(!quote)return;const timer=window.setInterval(()=>setNow(Date.now()),1000);return()=>window.clearInterval(timer)},[quote])
 const favoriteIds=useMemo(()=>new Set(favorites.data?.favorites.map(item=>item.targetId)??[]),[favorites.data])
 const sportNames=useMemo(()=>new Map((catalog.data?.facets.sports??[]).map(item=>[item.key,item.name])),[catalog.data])
 const sports=useMemo(()=>['All',...sportNames.keys(),...(sport!=='All'&&!sportNames.has(sport)?[sport]:[])],[sport,sportNames])
 const competitions=useMemo(()=>['All',...new Set((catalog.data?.facets.competitions??[]).filter(item=>sport==='All'||item.sportKey===sport).map(item=>item.name)),...(competition!=='All'&&!(catalog.data?.facets.competitions??[]).some(item=>item.name===competition)?[competition]:[])],[catalog.data,competition,sport])
 const events=useMemo(()=>catalog.error||(view==='FAVORITES'&&favorites.error)?[]:(catalog.data?.events??[]),[catalog.data,catalog.error,favorites.error,view])
 const stakeMinor=amountInputToMinor(stake,currencyExponent(session.data?.currency??catalog.data?.currency??'',session.data?.currencyExponent)),quoteSeconds=quote?Math.max(0,Math.ceil((new Date(quote.expiresAt).getTime()-now)/1000)):0
 const eligibleStructures=structures.filter(item=>selected.length>=item.minimum&&(item.value!=='STRAIGHT'||selected.length===1))
 useEffect(()=>{if(selected.length===1&&structure!=='STRAIGHT')setStructure('STRAIGHT');if(selected.length>1&&structure==='STRAIGHT')setStructure('PARLAY')},[selected.length,structure])
 function resetQuote(){if(pendingPlacement.current)return;quoteGeneration.current++;setQuote(null);setReceipt(null);setSlipState('IDLE');setMessage('');setPlaceKey('')}
 function choose(event:CatalogEvent,market:CatalogMarket,selection:CatalogSelection){if(pendingPlacement.current||selection.state!=='OPEN'||market.state!=='OPEN')return;setSelected(current=>{const exists=current.some(item=>item.selection.selectionId===selection.selectionId);if(exists)return current.filter(item=>item.selection.selectionId!==selection.selectionId);if(current.length>=12){setMessage('A bet slip supports at most 12 distinct legs.');return current}return[...current,{event,market,selection}]});resetQuote()}
 function remove(id:string){if(pendingPlacement.current)return;setSelected(current=>current.filter(item=>item.selection.selectionId!==id));resetQuote()}
 async function toggleFavorite(eventId:string){if(!session.data?.authenticated){setMessage('Sign in before saving favorites.');return}const favorite=!favoriteIds.has(eventId);await customerApi('/api/sandbox/sportsbook/favorites',{method:'PUT',body:JSON.stringify({targetType:'EVENT',targetId:eventId,favorite})});favorites.reload()}
 async function requestQuote(){if(pendingPlacement.current)return;if(!session.data?.authenticated){setMessage('Sign in or create an account first.');return}if(!stakeMinor||selected.length===0){setMessage('Choose at least one selection and enter a stake.');return}
  // The quote is bound to the exact draft it was requested for; any edit while pricing discards the late response.
  const generation=++quoteGeneration.current
  setSlipState('QUOTING');setMessage('');try{const result=await customerApi<CombinationQuoteResponse>('/api/sandbox/sportsbook/quote-combination',{method:'POST',body:JSON.stringify({selectionIds:selected.map(item=>item.selection.selectionId),structure,stakeMinor,systemSize,priceChangeConsent:priceConsent})});if(generation!==quoteGeneration.current)return;setQuote(result);setPlaceKey(`combination_${crypto.randomUUID()}`);setNow(Date.now());setSlipState('QUOTED')}catch(error){if(generation!==quoteGeneration.current)return;const code=error instanceof CustomerApiError?error.code:'REQUEST_FAILED';setMessage(errorCopy[code]??customerMessage(error,'No quote is available for this slip right now.'));setSlipState('REJECTED')}}
 function receivePlacement(result:CombinationPlacementResponse){pendingPlacement.current=null;setPlacementLocked(false);setReceipt(result);setSlipState(result.accepted?(result.state==='PARTIALLY_ACCEPTED'?'PARTIALLY_ACCEPTED':'ACCEPTED'):'REJECTED');setMessage(result.accepted?'':errorCopy[result.rejectionCode??'']??'Bet not accepted. No stake reserved.');session.reload();promotions.reload()}
 async function place(){
  if(!quote||!placeKey||placementSending.current)return
  if(!pendingPlacement.current&&quoteSeconds===0){resetQuote();setMessage('The quote expired. Request current terms.');return}
  const intent=resolvePlacementIntent(pendingPlacement.current,{quoteId:quote.quoteId,idempotencyKey:placeKey,allowPartial,bonusAwardId})
  pendingPlacement.current=intent;placementSending.current=true;setPlacementLocked(true);setSlipState('PLACING');setMessage('')
  try{
   const response=await customerApi<CombinationPlacementResponse>('/api/sandbox/sportsbook/wager-combination',{method:'POST',body:intent.body})
   const result=placementOutcome(response)
   if(!result)throw new Error('PLACEMENT_OUTCOME_UNCONFIRMED')
   receivePlacement(result)
  }catch(error){
   const result=error instanceof CustomerApiError?placementOutcome(error.payload):null
   if(result)receivePlacement(result)
   else{setSlipState('UNRESOLVED');setMessage('We couldn’t confirm this bet. Retry the same bet (even if the quote expired) or check My bets before placing another one.')}
  }finally{placementSending.current=false}
 }

 const currency=quote?.currency??session.data?.currency??catalog.data?.currency??'USD'
 const closed=isClosedError(catalog.error)
 const activeAwards=(promotions.data?.awards??[]).filter(award=>['AWARDED','ACTIVE'].includes(award.status)&&BigInt(award.remainingMinor)>0n)
 const sportLabel=(item:string)=>item==='All'?'All sports':sportNames.get(item)??item
 const pickSport=(item:string)=>{setSport(item);setCompetition('All')}

 return <CustomerShell authenticated={Boolean(session.data?.authenticated)} accountReference={session.data?.accountReference}><div className="mx-auto grid max-w-[1560px] grid-cols-1 gap-6 px-4 py-5 pb-28 sm:py-6 xl:grid-cols-[208px_minmax(0,1fr)_380px] xl:px-6 xl:pb-8">
  <aside className="hidden xl:block" aria-label="Catalog navigation">
   <div className="sticky top-24 space-y-6">
    <div><Link href="/sports" className="mb-2 block px-3 text-[11px] font-semibold  text-sb-mute hover:text-sb-ink">Sports</Link><div className="flex flex-col border-t border-sb-line [&>*]:justify-start">{sports.map(item=><button key={item} type="button" aria-pressed={sport===item} onClick={()=>pickSport(item)} className={cn(pillClass('flat','sm'),'justify-start px-3.5')}>{sportLabel(item)}</button>)}</div></div>
    {competitions.length>1&&<div><p className="mb-2 px-3 text-[11px] font-semibold  text-sb-mute">Competitions</p><div className="flex flex-col gap-0.5">{competitions.map(item=><button key={item} type="button" aria-pressed={competition===item} onClick={()=>setCompetition(item)} className="min-h-9 truncate rounded-[2px] px-3.5 text-left text-sm text-sb-mute hover:text-sb-ink aria-pressed:font-semibold aria-pressed:text-sb-ink">{competition===item&&<Dot tone="info" />}{item==='All'?'All competitions':item}</button>)}</div></div>}
   </div>
  </aside>

  <section className="min-w-0" aria-labelledby="events-heading">
   <div className="rounded-[2px] bg-sb-night p-4 text-white sm:p-6">
    <div className="flex flex-wrap items-end justify-between gap-3">
     <div className="min-w-0">
      <h1 id="events-heading" className="break-words font-sb-display text-4xl font-bold uppercase leading-none tracking-tight sm:text-5xl">{catalog.data&&catalog.data.liveCount>0&&<Dot tone="live" className="size-2.5 align-[0.35em]" />}{initialEventId?(initialEventName??'Event'):view==='LIVE'?'Live now':view==='FAVORITES'?'Favorites':competition!=='All'?competition:sport!=='All'?sportLabel(sport):'Live & upcoming'}</h1>
      <p className="mt-2 text-xs  text-white/80">{initialEventId&&initialEventCompetition?<>{initialEventCompetition} · </>:null}{catalog.data?<>{catalog.data.liveCount} live · {catalog.data.total} event{catalog.data.total===1?'':'s'} · {formatDate(catalog.data.generatedAt)}</>:closed?'Closed':'Loading prices'}</p>
     </div>
     {session.data?.authenticated&&<div className="text-right"><p className="text-[11px] font-semibold  text-white/80">Cash</p><p className="tabular-nums text-2xl font-semibold  text-sb-flood">{formatMinor(session.data.availableMinor??'0',session.data.currency??catalog.data?.currency??'USD')}</p></div>}
    </div>
    <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
     <label className="relative block"><Search aria-hidden="true" className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/80"/><span className="sr-only">Search catalog</span><input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Teams, leagues, markets" className="min-h-11 w-full rounded-[2px] bg-black/40 pl-11 pr-4 text-sm text-white shadow-[inset_0_1px_2px_rgb(0_0_0/0.6)] ring-1 ring-inset ring-white/10 placeholder:text-white/35"/></label>
     <Track dark label="Catalog view">{(['ALL','LIVE','FAVORITES'] as const).map(item=><button key={item} type="button" aria-pressed={view===item} onClick={()=>setView(item)} className={pillClass('flatDark','sm')}>{item==='LIVE'&&<Dot tone="live" className="mr-0" />}{item==='ALL'?'All':item==='LIVE'?'Live':'Favorites'}</button>)}</Track>
    </div>
   </div>

   <div className="mt-4 space-y-2 xl:hidden">
    <div className="sb-scroll -mx-4 px-4"><Track label="Sport">{sports.map(item=><button key={item} type="button" aria-pressed={sport===item} onClick={()=>pickSport(item)} className={pillClass('flat','sm')}>{sportLabel(item)}</button>)}</Track></div>
    {competitions.length>1&&<div className="sb-scroll -mx-4 px-4"><div role="group" aria-label="Competition" className="inline-flex gap-1">{competitions.map(item=><button key={item} type="button" aria-pressed={competition===item} onClick={()=>setCompetition(item)} className="min-h-9 shrink-0 whitespace-nowrap rounded-[2px] px-3.5 text-xs font-semibold text-sb-mute ring-1 ring-sb-line aria-pressed:bg-sb-ink aria-pressed:text-white aria-pressed:ring-sb-ink">{item==='All'?'All competitions':item}</button>)}</div></div>}
   </div>

   {closed?<ClosedPanel coupon/>:<>
   {catalog.loading&&!catalog.data&&<div role="status" className="mt-4 space-y-3">{[0,1,2].map(i=><div key={i} className="h-36 animate-pulse rounded-[2px] bg-sb-card ring-1 ring-sb-line motion-reduce:animate-none"/>)}<span className="sr-only">Loading events…</span></div>}
   {catalog.error&&<div role="alert" className="mt-4 rounded-[2px] bg-red-50 p-5 text-sm text-red-950 ring-1 ring-red-200"><p className="font-semibold"><Dot tone="alert"/>Prices unavailable</p><div className="mt-3"><Track><Pill size="sm" onClick={catalog.reload}><RefreshCw aria-hidden="true"/>Retry</Pill></Track></div></div>}
   {!catalog.loading&&!catalog.error&&events.length===0&&<p className="mt-4 rounded-[2px] border  border-sb-line px-4 py-10 text-center text-sm text-sb-mute">{view==='FAVORITES'&&favorites.error?'Favorites unavailable.':view==='FAVORITES'?'No favorite events.':view==='LIVE'?'Nothing live.':'No events.'}</p>}
   </>}

   <div className="mt-4 space-y-3">{events.map(event=>{const live=event.state==='LIVE',favorite=favoriteIds.has(event.eventId);return <article key={event.eventId} className="overflow-hidden rounded-[2px] bg-sb-card ring-1 ring-sb-line">
    <header className="flex items-start justify-between gap-3 px-4 pb-3 pt-4 sm:px-5">
     <div className="min-w-0">
      <p className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs">
       <Link href={`/sports/${encodeURIComponent(event.sportKey)}/${encodeURIComponent(event.competitionSlug)}`} className="truncate font-semibold  text-sb-mute hover:text-sb-ink">{event.competition}</Link>
       <span className={cn('tabular-nums ',live?'font-semibold text-sb-live':'text-sb-mute')}>{live?`LIVE ${event.livePhase??''} · ${event.clockSeconds??0}s`:formatDate(event.startsAt)}</span>
      </p>
      <h2 className="mt-1.5 break-words font-sb-display text-2xl font-bold uppercase leading-tight tracking-normal"><Link href={`/events/${event.eventId}`} className="hover:text-sb-brand">{live&&<Dot tone="live"/>}{event.name}</Link></h2>
     </div>
     <button type="button" aria-label={`${favorite?'Remove':'Add'} ${event.name} favorite`} aria-pressed={favorite} onClick={()=>toggleFavorite(event.eventId)} className="-mr-1 grid size-10 shrink-0 place-items-center rounded-[2px] hover:bg-sb-well"><Heart className={cn('size-4',favorite?'fill-sb-live text-sb-live':'text-sb-mute')}/></button>
    </header>
    <div className="divide-y divide-sb-line border-t border-sb-line">{event.markets.map(market=><section key={market.marketId} className="grid gap-2.5 px-4 py-3 sm:px-5 md:grid-cols-[180px_minmax(0,1fr)] md:items-center">
     <p className="text-sm font-semibold">{market.state!=='OPEN'&&<Dot tone="wait"/>}{market.name}<span className="ml-2 tabular-nums text-[11px] font-normal uppercase text-sb-mute">{market.state==='OPEN'?(live?'In-play':'Pre-match'):market.state.toLowerCase()}</span></p>
     <div className={cn('grid gap-2',market.selections.length===2?'grid-cols-2':'grid-cols-1 min-[360px]:grid-cols-3')}>{market.selections.map(selection=>{const active=selected.some(item=>item.selection.selectionId===selection.selectionId),disabled=placementLocked||selection.state!=='OPEN'||market.state!=='OPEN';return <button key={selection.selectionId} type="button" onClick={()=>choose(event,market,selection)} disabled={disabled} aria-pressed={active} aria-label={`${selection.label}, odds ${selection.decimalOdds?formatOdds(selection.decimalOdds):'unavailable'}, ${selection.state.toLowerCase()}`} className={cn('flex min-h-14 min-w-0 items-center justify-between gap-2 rounded-[2px] border-2 px-3 text-left transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-45',active?'border-sb-brand bg-sb-brand text-white':'border-sb-ink/80 bg-sb-card hover:bg-sb-well')}><span className={cn('min-w-0 break-words text-xs font-medium',active?'text-white/75':'text-sb-mute')}>{selection.label}</span><span className={cn('shrink-0 tabular-nums text-base font-semibold ',active?'text-sb-flood':'text-sb-ink')}>{selection.state==='OPEN'?formatOdds(selection.decimalOdds):selection.state.toLowerCase()}</span></button>})}</div>
    </section>)}</div>
   </article>})}</div>
   {catalog.data&&(cursors.length>0||catalog.data.nextCursor)&&<nav aria-label="Event pages" className="mt-4 flex items-center justify-between gap-3"><Track><Pill size="sm" disabled={cursors.length===0||catalog.loading} onClick={()=>setCursors(current=>current.slice(0,-1))}>Previous</Pill><Pill size="sm" disabled={!catalog.data.nextCursor||catalog.loading} onClick={()=>{const next=catalog.data?.nextCursor;if(next)setCursors(current=>[...current,next])}}>Next</Pill></Track><span className="tabular-nums text-xs  text-sb-mute">{catalog.data.total} event{catalog.data.total===1?'':'s'}</span></nav>}
  </section>

  <aside id="bet-slip" className="min-w-0 scroll-mt-24 xl:sticky xl:top-24 xl:h-fit" aria-label="Bet slip">
   <div className="overflow-hidden rounded-[2px] bg-sb-card ring-1 ring-sb-line">
    <div className="flex items-center justify-between gap-3 bg-sb-night px-5 py-4 text-white">
     <p className="font-sb-display text-2xl font-bold uppercase leading-none tracking-wide">Bet slip<span className="ml-2 tabular-nums text-sm font-normal  text-sb-flood">{selected.length}</span></p>
     {selected.length>0&&<button type="button" aria-label="Clear bet slip" disabled={placementLocked} onClick={()=>{if(pendingPlacement.current)return;setSelected([]);resetQuote()}} className="inline-flex min-h-9 items-center gap-1.5 rounded-[2px] px-3 text-xs font-semibold text-white/70 ring-1 ring-white/15 hover:bg-white/10 hover:text-white disabled:opacity-50"><X className="size-3.5"/>Clear</button>}
    </div>
    {selected.length===0?<p className="px-5 py-10 text-center text-sm text-sb-mute">No selections</p>:<>
     <ol className="max-h-72 divide-y divide-sb-line overflow-y-auto px-5">{selected.map(item=><li key={item.selection.selectionId} className="flex items-start justify-between gap-3 py-3">
      <div className="min-w-0"><p className="break-words text-sm font-semibold">{item.event.state==='LIVE'&&<Dot tone="live"/>}{item.selection.label}</p><p className="mt-0.5 truncate text-xs text-sb-mute">{item.market.name} · {item.event.name}</p></div>
      <div className="flex shrink-0 items-center gap-1"><span className="tabular-nums text-base font-semibold ">{formatOdds(item.selection.decimalOdds)}</span><button type="button" aria-label={`Remove ${item.selection.label}`} disabled={placementLocked} onClick={()=>remove(item.selection.selectionId)} className="grid size-8 place-items-center rounded-[2px] text-sb-mute hover:bg-sb-well hover:text-sb-ink disabled:opacity-50"><X className="size-3.5"/></button></div>
     </li>)}</ol>
     <div className="sb-tear mx-0 mt-1"/>
     <div className="px-5 pb-5 pt-4">
      <fieldset disabled={placementLocked} className="space-y-4 disabled:opacity-60"><legend className="sr-only">Reviewed wager configuration</legend>
       {eligibleStructures.length>1&&<div><p className="mb-1.5 text-[11px] font-semibold  text-sb-mute">Bet type</p><Track block label="Bet type">{eligibleStructures.map(item=><button key={item.value} type="button" aria-pressed={structure===item.value} onClick={()=>{setStructure(item.value);resetQuote()}} className={pillClass('flat','sm')}>{item.label}</button>)}</Track></div>}
       <div className="grid grid-cols-2 gap-3">
        {['SYSTEM','ROUND_ROBIN'].includes(structure)?<label className="grid gap-1.5 text-[11px] font-semibold  text-sb-mute">Combination size<select value={systemSize} onChange={e=>{setSystemSize(Number(e.target.value));resetQuote()}} className={fieldClass}>{Array.from({length:Math.max(1,selected.length-1)},(_,i)=>i+2).filter(n=>n<=selected.length).map(n=><option key={n}>{n}</option>)}</select></label>:<label className="grid gap-1.5 text-[11px] font-semibold  text-sb-mute">Price changes<select value={priceConsent} onChange={e=>{setPriceConsent(e.target.value);resetQuote()}} className={fieldClass}><option value="EXACT">Exact only</option><option value="ACCEPT_BETTER">Better only</option><option value="ACCEPT_WITHIN_TOLERANCE">Within policy</option></select></label>}
        <label className="grid gap-1.5 text-[11px] font-semibold  text-sb-mute">Stake · {catalog.data?.currency??'—'}<input inputMode="decimal" value={stake} onChange={e=>{if(/^\d{0,6}(\.\d{0,2})?$/.test(e.target.value)){setStake(e.target.value);resetQuote()}}} className={cn(fieldClass,'text-right tabular-nums text-lg font-semibold ')}/></label>
       </div>
       {promotions.data?.promotions.some(item=>item.type==='ODDS_BOOST')&&<p className="text-xs text-sb-mute"><Dot tone="off"/>Odds boosts unavailable</p>}
       {activeAwards.length>0&&<label className="grid gap-1.5 text-[11px] font-semibold  text-sb-mute">Funding<select value={bonusAwardId} onChange={e=>{setBonusAwardId(e.target.value);resetQuote()}} className={fieldClass}><option value="">Cash wallet</option>{activeAwards.map(award=><option key={award.id} value={award.id}>{award.type.replaceAll('_',' ')} · {formatMinor(award.remainingMinor,award.currency)}</option>)}</select></label>}
       <label className="flex items-start gap-2.5 text-sm"><input type="checkbox" checked={allowPartial} onChange={e=>setAllowPartial(e.target.checked)} className={checkClass}/><span className="font-medium">Allow partial acceptance</span></label>
      </fieldset>

      {quote&&<div className="mt-4 rounded-[2px] bg-sb-night p-4 text-white">
       <div className="flex items-center justify-between gap-3 text-xs"><span className="font-semibold  text-white/80">{quote.structure.replaceAll('_',' ')} · {quote.parts.length} part{quote.parts.length===1?'':'s'}</span><span className={cn('tabular-nums ',quoteSeconds<=5?'text-sb-live':'text-white/70')}><Dot tone={quoteSeconds>0?'win':'alert'}/>{quoteSeconds}s</span></div>
       <ul className="mt-3 space-y-1 tabular-nums text-xs text-white/75">{(receipt?.accepted&&receipt.acceptedParts?receipt.acceptedParts:quote.parts).map(part=><li key={part.index} className="flex justify-between gap-2"><span className="truncate">{part.key} · {formatMinor(part.stakeMinor,quote.currency)} @ {part.decimalOdds}</span><span className="text-white">{formatMinor(part.potentialReturnMinor,quote.currency)}</span></li>)}</ul>
       <div className="mt-3 flex items-end justify-between gap-3 border-t border-white/10 pt-3"><span className="text-[11px] font-semibold  text-white/80">Potential return</span><span className="tabular-nums text-2xl font-semibold  text-sb-flood">{receipt?.accepted?formatMinor(receipt.potentialReturnMinor??'0',quote.currency):formatMinor(quote.potentialReturnMinor,quote.currency)}</span></div>
       {quote.liveDelayMs>0&&<p className="mt-2 text-xs text-white/70"><Dot tone="live"/>Live delay {quote.liveDelayMs/1000}s</p>}
       <details className="mt-2 text-xs text-white/80"><summary className="cursor-pointer font-semibold">References</summary><p className="mt-1 break-all tabular-nums text-[11px]">Quote {quote.quoteId}<br/>Terms {quote.termsHash}<br/>Prices {quote.legs.map(leg=>leg.priceSnapshotId).join(', ')}</p></details>
      </div>}

      <div className="mt-4">{!session.data?.authenticated?<Track block><PillLink href="/account/auth" variant="primary" size="lg">Sign in to bet</PillLink></Track>:!quote||slipState==='REJECTED'?<Track block><Pill variant="primary" size="lg" onClick={requestQuote} disabled={slipState==='QUOTING'}>{slipState==='QUOTING'?'Getting quote…':'Get quote'}</Pill></Track>:!['ACCEPTED','PARTIALLY_ACCEPTED'].includes(slipState)&&<Track block><Pill variant="primary" size="lg" onClick={place} disabled={slipState==='PLACING'}>{slipState==='PLACING'?(quote.liveDelayMs?'Live bet delay…':'Placing bet…'):slipState==='UNRESOLVED'?'Retry original placement':quoteSeconds===0?'Quote expired · Requote':`Place bet · ${formatMinor(quote.stakeMinor??stakeMinor??'0',quote.currency)}`}</Pill></Track>}</div>

      {(slipState==='UNRESOLVED'||(receipt&&!receipt.accepted))&&<div className="mt-3 text-xs text-sb-mute">{receipt?.receiptId&&<p className="break-all tabular-nums">Decision receipt {receipt.receiptId}</p>}<Link href="/account/bets" className="mt-1 inline-block min-h-10 py-2 font-semibold text-sb-ink underline underline-offset-4">Check My bets</Link></div>}
      {message&&<p role="alert" className="mt-3 rounded-[2px] bg-amber-50 px-3.5 py-2.5 text-sm text-amber-950 ring-1 ring-amber-200"><Dot tone="wait"/>{message}</p>}
      {receipt?.accepted&&<div role="status" aria-live="polite" className="mt-3 rounded-[2px] bg-emerald-50 p-4 text-sm text-emerald-950 ring-1 ring-emerald-200">
       <p className="font-sb-display text-xl font-bold uppercase tracking-wide"><Dot tone="win"/>{receipt.state==='PARTIALLY_ACCEPTED'?'Partially accepted':'Bet accepted'}</p>
       <dl className="mt-2 space-y-1 tabular-nums text-xs">
        <div className="flex justify-between gap-3"><dt>Stake</dt><dd>{formatMinor(receipt.acceptedStakeMinor??'',currency)}</dd></div>
        <div className="flex justify-between gap-3"><dt>Return</dt><dd>{formatMinor(receipt.potentialReturnMinor??'',currency)}</dd></div>
        {receipt.acceptedParts?.map(part=><div key={part.index} className="flex justify-between gap-3"><dt className="truncate">{part.key}</dt><dd>{formatMinor(part.stakeMinor,quote?.currency??'USD')} @ {part.decimalOdds}</dd></div>)}
        {receipt.acceptedPrices?.length?<div className="flex justify-between gap-3"><dt>Prices</dt><dd className="text-right">{receipt.acceptedPrices.map(price=>`#${price.legIndex+1} ${price.decimalOdds}${price.line?` (${price.line})`:''}`).join(' · ')}</dd></div>:null}
        {receipt.rejectedPartIndexes?.length?<div className="flex justify-between gap-3"><dt>Rejected parts</dt><dd>{receipt.rejectedPartIndexes.join(', ')}</dd></div>:null}
       </dl>
       <p className="mt-2 break-all tabular-nums text-[11px] text-emerald-900/70">Receipt {receipt.receiptId} · Terms {receipt.termsHash}</p>
       <Link href="/account/bets" className="mt-2 inline-block font-semibold underline underline-offset-4">Open My bets</Link>
      </div>}
     </div>
    </>}
   </div>
  </aside>

  {selected.length>0&&<a href="#bet-slip" className="fixed inset-x-4 bottom-4 z-20 flex min-h-14 items-center justify-between gap-3 rounded-[2px] bg-sb-night px-5 text-white ring-1 ring-white/10 xl:hidden"><span className="font-sb-display text-xl font-bold uppercase tracking-wide">Bet slip <span className="tabular-nums text-sm font-normal text-sb-flood">{selected.length}</span></span><span className="tabular-nums text-sm  text-white/80">{stakeMinor?formatMinor(stakeMinor,currency):'—'}</span></a>}
 </div></CustomerShell>
}
