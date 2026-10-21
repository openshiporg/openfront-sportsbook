'use client'
import { useState } from 'react'
import { MessageSquareWarning, Send } from 'lucide-react'
import type { BetsResponse, CustomerSessionSummary, WalletResponse } from '@/features/sportsbook/customer/contracts'
import { AccountPageHeader, ErrorPanel, LoadingPanel } from '../../components/AccountStates'
import { CustomerShell } from '../../components/CustomerShell'
import { customerApi, CustomerApiError, formatDate, shortId, useCustomerResource, useFrozenSubmission } from '../../lib/customer-api'

type SupportCase = { id: string; wagerId: string | null; paymentIntentId: string | null; category: string; status: string; subject: string; openedAt: string; resolvedAt: string | null; dispute: null | { id: string; topic: string; status: string; resolution: string | null }; messages: Array<{ id: string; type: string; from: 'YOU' | 'SUPPORT'; body: string; createdAt: string }> }
type Cases = { supportCases: SupportCase[]; nextCursor: string | null }
type Bet = BetsResponse['bets'][number]
const categories = [
  { value: 'ACCOUNT', label: 'My account' },
  { value: 'WAGER', label: 'A bet' },
  { value: 'PAYMENT', label: 'A deposit or withdrawal' },
  { value: 'RESPONSIBLE_GAMING', label: 'Safer play' },
  { value: 'PRIVACY', label: 'Privacy' },
  { value: 'TECHNICAL', label: 'Something isn’t working' },
] as const
const topics = [{ value: 'SETTLEMENT', label: 'Settlement or result' }, { value: 'TERMS', label: 'Odds or terms' }, { value: 'CASH_OUT', label: 'Cash out' }]
const statusLabel: Record<string, string> = { OPEN: 'Open', TRIAGED: 'Being reviewed', WAITING_CUSTOMER: 'Waiting for your reply', WAITING_OPERATOR: 'Waiting for support', RESOLVED: 'Resolved', CLOSED: 'Closed' }

export function DisputesScreen() {
  const frozen = useFrozenSubmission()
  const [casesCursors, setCasesCursors] = useState<string[]>([])
  const casesCursor = casesCursors[casesCursors.length - 1]
  const session = useCustomerResource<CustomerSessionSummary>('/api/sandbox/sportsbook/session')
  const cases = useCustomerResource<Cases>(`/api/sandbox/sportsbook/disputes${casesCursor ? `?cursor=${encodeURIComponent(casesCursor)}` : ''}`)
  const bets = useCustomerResource<BetsResponse>('/api/sandbox/sportsbook/bets')
  const wallet = useCustomerResource<WalletResponse>('/api/sandbox/sportsbook/wallet')
  const [olderBets, setOlderBets] = useState<{ bets: Bet[]; nextCursor: string | null } | null>(null)
  const [loadingOlder, setLoadingOlder] = useState(false)
  const [form, setForm] = useState({ category: 'ACCOUNT', topic: 'SETTLEMENT', wagerId: '', paymentIntentId: '', subject: '', details: '' })
  const [replies, setReplies] = useState<Record<string, string>>({})
  const [pending, setPending] = useState(''), [message, setMessage] = useState('')
  const allBets = [...(bets.data?.bets ?? []), ...(olderBets?.bets ?? [])]
  const nextBetsCursor = olderBets ? olderBets.nextCursor : bets.data?.nextCursor ?? null

  async function loadOlderBets() {
    if (!nextBetsCursor) return
    setLoadingOlder(true)
    try {
      const page = await customerApi<BetsResponse>(`/api/sandbox/sportsbook/bets?cursor=${encodeURIComponent(nextBetsCursor)}`)
      setOlderBets(current => ({ bets: [...(current?.bets ?? []), ...page.bets], nextCursor: page.nextCursor ?? null }))
    } catch {
      setMessage('Older bets couldn’t be loaded. Try again.')
    } finally { setLoadingOlder(false) }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setPending('open'); setMessage('')
    const body = { category: form.category, subject: form.subject, details: form.details, ...(form.category === 'WAGER' ? { wagerId: form.wagerId, topic: form.topic } : {}), ...(form.category === 'PAYMENT' && form.paymentIntentId ? { paymentIntentId: form.paymentIntentId } : {}) }
    try {
      await frozen.submit('support-case', '/api/sandbox/sportsbook/disputes', 'POST', idempotencyKey => ({ ...body, idempotencyKey }), 'case')
      setMessage('Your request was sent. You can follow the conversation below.')
      setForm(v => ({ ...v, subject: '', details: '' }))
      setCasesCursors([]); cases.reload()
    } catch (error) {
      setMessage(error instanceof CustomerApiError ? (frozen.isUnresolved('support-case') ? 'We couldn’t confirm your request was sent. Submit again to retry the same request.' : `We couldn’t open the case (${error.code.replaceAll('_', ' ').toLowerCase()}).`) : 'We couldn’t open the case. Try again.')
    } finally { setPending('') }
  }

  async function reply(caseId: string) {
    const text = (replies[caseId] ?? '').trim()
    if (text.length < 2) return
    setPending(caseId); setMessage('')
    try {
      await frozen.submit(`reply:${caseId}`, '/api/sandbox/sportsbook/disputes', 'PUT', idempotencyKey => ({ supportCaseId: caseId, body: text, idempotencyKey }), 'reply')
      setReplies(current => ({ ...current, [caseId]: '' }))
      cases.reload()
    } catch (error) {
      setMessage(error instanceof CustomerApiError ? `Your reply wasn’t sent (${error.code.replaceAll('_', ' ').toLowerCase()}).` : 'Your reply wasn’t sent. Try again.')
    } finally { setPending('') }
  }

  const wagerCase = form.category === 'WAGER'
  return <CustomerShell current="disputes" authenticated={Boolean(session.data?.authenticated)} accountReference={session.data?.accountReference}>
    <AccountPageHeader title="Support & disputes" description="Contact support about your account, payments, safer play or privacy, or dispute a bet." />
    <form onSubmit={submit} className="mt-6 rounded-xl border bg-white p-5">
      <div className="flex gap-3"><MessageSquareWarning className="size-5 text-emerald-700" /><div><h2 className="font-semibold">Contact support</h2><p className="mt-1 text-sm text-slate-600">You don’t need a bet to ask for help. Choose what your request is about.</p></div></div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium">About<select value={form.category} onChange={e => setForm(v => ({ ...v, category: e.target.value, wagerId: '', paymentIntentId: '' }))} className="min-h-11 rounded-lg border px-3">{categories.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
        {wagerCase && <label className="grid gap-1.5 text-sm font-medium">Issue<select value={form.topic} onChange={e => setForm(v => ({ ...v, topic: e.target.value }))} className="min-h-11 rounded-lg border px-3">{topics.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>}
        {wagerCase && <div className="grid gap-1.5 text-sm font-medium sm:col-span-2"><label htmlFor="case-wager">Bet</label>
          {bets.loading ? <p role="status" className="text-sm font-normal text-slate-600">Loading your bets…</p>
            : bets.error ? <p role="alert" className="text-sm font-normal text-red-800">Your bets couldn’t be loaded. <button type="button" onClick={bets.reload} className="font-semibold underline">Retry</button></p>
            : <><select id="case-wager" required value={form.wagerId} onChange={e => setForm(v => ({ ...v, wagerId: e.target.value }))} className="min-h-11 rounded-lg border px-3"><option value="">Choose a bet</option>{allBets.map(bet => <option key={bet.id} value={bet.id}>{formatDate(bet.createdAt, false)} · {bet.selectionName} · {shortId(bet.id)}</option>)}</select>
              {nextBetsCursor && <button type="button" onClick={loadOlderBets} disabled={loadingOlder} className="w-fit text-xs font-semibold text-emerald-800 underline disabled:opacity-60">{loadingOlder ? 'Loading older bets…' : 'Show older bets'}</button>}</>}
        </div>}
        {form.category === 'PAYMENT' && <label className="grid gap-1.5 text-sm font-medium sm:col-span-2">Payment (optional)<select value={form.paymentIntentId} onChange={e => setForm(v => ({ ...v, paymentIntentId: e.target.value }))} className="min-h-11 rounded-lg border px-3"><option value="">Not about a specific payment</option>{(wallet.data?.transactions ?? []).map(item => <option key={item.id} value={item.id}>{item.type.toLowerCase()} · {formatDate(item.createdAt)} · {item.status.toLowerCase()}</option>)}</select>{wallet.error && <span className="text-xs font-normal text-red-800">Recent payments couldn’t be loaded; you can still describe the payment below.</span>}</label>}
        <label className="grid gap-1.5 text-sm font-medium sm:col-span-2">Subject<input required maxLength={160} value={form.subject} onChange={e => setForm(v => ({ ...v, subject: e.target.value }))} className="min-h-11 rounded-lg border px-3" /></label>
        <label className="grid gap-1.5 text-sm font-medium sm:col-span-2">What happened?<textarea required minLength={10} maxLength={4000} rows={5} value={form.details} onChange={e => setForm(v => ({ ...v, details: e.target.value }))} className="rounded-lg border p-3" /></label>
      </div>
      <button disabled={Boolean(pending) || (wagerCase && (Boolean(bets.error) || bets.loading))} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg bg-emerald-800 px-4 text-sm font-semibold text-white disabled:opacity-60"><Send className="size-4" />{pending === 'open' ? 'Sending…' : wagerCase ? 'Open dispute' : 'Send request'}</button>
    </form>
    {message && <div role="status" className="mt-4 rounded-lg border bg-white p-3 text-sm">{message}</div>}
    <section className="mt-7">
      <h2 className="text-lg font-semibold">Your cases</h2>
      {cases.loading && <LoadingPanel label="Loading your cases" />}
      {cases.error && <ErrorPanel error={cases.error} retry={cases.reload} />}
      {cases.data && (cases.data.supportCases.length === 0 && casesCursors.length === 0
        ? <div className="mt-3 rounded-xl border border-dashed bg-white p-8 text-center text-sm text-slate-600">You haven’t contacted support yet.</div>
        : <div className="mt-3 grid gap-3">{cases.data.supportCases.map(item => <article key={item.id} className="rounded-xl border bg-white p-4">
          <div className="flex flex-wrap justify-between gap-2"><p className="font-semibold">{item.subject}</p><span className="text-xs font-semibold text-emerald-800">{statusLabel[item.status] ?? item.status}</span></div>
          <p className="mt-1 text-xs text-slate-500">{categories.find(c => c.value === item.category)?.label ?? item.category} · reference {shortId(item.id)} · opened {formatDate(item.openedAt)}{item.wagerId ? ` · bet ${shortId(item.wagerId)}` : ''}</p>
          {item.dispute && <p className="mt-2 text-xs">Dispute: {item.dispute.status.toLowerCase()}{item.dispute.resolution ? ` · ${item.dispute.resolution}` : ''}</p>}
          <ol className="mt-3 grid gap-2">{item.messages.map(entry => <li key={entry.id} className={`rounded-lg p-3 text-sm ${entry.from === 'YOU' ? 'bg-slate-50' : 'bg-emerald-50'}`}><p className="text-xs font-semibold">{entry.from === 'YOU' ? 'You' : 'Support'} · {formatDate(entry.createdAt)}</p><p className="mt-1 whitespace-pre-wrap">{entry.body}</p></li>)}</ol>
          {item.status !== 'CLOSED' && <div className="mt-3 grid gap-2"><label className="text-xs font-medium" htmlFor={`reply-${item.id}`}>Reply</label><textarea id={`reply-${item.id}`} rows={2} maxLength={4000} value={replies[item.id] ?? ''} onChange={e => setReplies(current => ({ ...current, [item.id]: e.target.value }))} className="rounded-lg border p-2 text-sm" /><button type="button" onClick={() => reply(item.id)} disabled={Boolean(pending) || (replies[item.id] ?? '').trim().length < 2} className="w-fit min-h-10 rounded-lg border px-3 text-sm font-semibold disabled:opacity-50">{pending === item.id ? 'Sending…' : 'Send reply'}</button></div>}
        </article>)}</div>)}
      {cases.data && (casesCursors.length > 0 || cases.data.nextCursor) && <nav aria-label="Case pages" className="mt-4 flex justify-between gap-3 text-sm"><button type="button" disabled={casesCursors.length === 0} onClick={() => setCasesCursors(current => current.slice(0, -1))} className="min-h-10 rounded-lg border bg-white px-3 font-semibold disabled:opacity-50">Newer</button><button type="button" disabled={!cases.data.nextCursor} onClick={() => { const next = cases.data?.nextCursor; if (next) setCasesCursors(current => [...current, next]) }} className="min-h-10 rounded-lg border bg-white px-3 font-semibold disabled:opacity-50">Older</button></nav>}
    </section>
  </CustomerShell>
}
