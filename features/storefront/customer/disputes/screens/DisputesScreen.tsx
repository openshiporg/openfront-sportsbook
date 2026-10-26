'use client'
import { useState } from 'react'
import { Send } from 'lucide-react'
import type { BetsResponse, CustomerSessionSummary, WalletResponse } from '@/features/sportsbook/customer/contracts'
import { AccountPageHeader, AuthenticationRequired, ClosedPanel, ErrorPanel, LoadingPanel, isClosedError } from '../../components/AccountStates'
import { Card, Dot, Empty, Notice, Pill, Section, Track, fieldClass, labelClass, toneFor } from '../../components/kit'
import { CustomerShell } from '../../components/CustomerShell'
import { customerApi, CustomerApiError, formatDate, shortId, useCustomerResource, useFrozenSubmission, customerMessage } from '../../lib/customer-api'

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
  const signedIn = Boolean(session.data?.authenticated)
  const cases = useCustomerResource<Cases>(signedIn ? `/api/sandbox/sportsbook/disputes${casesCursor ? `?cursor=${encodeURIComponent(casesCursor)}` : ''}` : null)
  const bets = useCustomerResource<BetsResponse>(signedIn ? '/api/sandbox/sportsbook/bets' : null)
  const wallet = useCustomerResource<WalletResponse>(signedIn ? '/api/sandbox/sportsbook/wallet' : null)
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
      setMessage('Request sent.')
      setForm(v => ({ ...v, subject: '', details: '' }))
      setCasesCursors([]); cases.reload()
    } catch (error) {
      setMessage(error instanceof CustomerApiError ? (frozen.isUnresolved('support-case') ? 'We couldn’t confirm your request was sent. Submit again to retry the same request.' : customerMessage(error, 'We couldn’t open the case. Try again.')) : 'We couldn’t open the case. Try again.')
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
      setMessage(customerMessage(error, 'Your reply wasn’t sent. Try again.'))
    } finally { setPending('') }
  }

  const wagerCase = form.category === 'WAGER'
  return <CustomerShell current="disputes" authenticated={Boolean(session.data?.authenticated)} accountReference={session.data?.accountReference} closed={isClosedError(session.error)}>
    <AccountPageHeader title="Support" meta="Account, payments, safer play, privacy and bet disputes" />
    {session.data && !session.data.authenticated ? <AuthenticationRequired /> : <>
    {isClosedError(cases.error) ? <ClosedPanel /> : <form onSubmit={submit} className="mt-6 rounded-[2px] bg-sb-card p-5 ring-1 ring-sb-line sm:p-6">
      <h2 className="font-sb-display text-2xl font-bold uppercase tracking-wide">{wagerCase ? 'Dispute a bet' : 'New request'}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>About<select value={form.category} onChange={e => setForm(v => ({ ...v, category: e.target.value, wagerId: '', paymentIntentId: '' }))} className={fieldClass}>{categories.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
        {wagerCase && <label className={labelClass}>Issue<select value={form.topic} onChange={e => setForm(v => ({ ...v, topic: e.target.value }))} className={fieldClass}>{topics.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>}
        {wagerCase && <div className={`${labelClass} sm:col-span-2`}><label htmlFor="case-wager">Bet</label>
          {bets.loading ? <p role="status" className="text-sm font-normal normal-case tracking-normal text-sb-mute">Loading your bets…</p>
            : bets.error ? <p role="alert" className="flex flex-wrap items-center gap-3 text-sm font-normal normal-case tracking-normal text-red-800"><span><Dot tone="alert" />Bets couldn’t be loaded</span><Track><Pill size="sm" onClick={bets.reload}>Retry</Pill></Track></p>
            : <><select id="case-wager" required value={form.wagerId} onChange={e => setForm(v => ({ ...v, wagerId: e.target.value }))} className={fieldClass}><option value="">Choose a bet</option>{allBets.map(bet => <option key={bet.id} value={bet.id}>{formatDate(bet.createdAt, false)} · {bet.selectionName} · {shortId(bet.id)}</option>)}</select>
              {nextBetsCursor && <div><Track><Pill size="sm" onClick={loadOlderBets} disabled={loadingOlder}>{loadingOlder ? 'Loading…' : 'Older bets'}</Pill></Track></div>}</>}
        </div>}
        {form.category === 'PAYMENT' && <label className={`${labelClass} sm:col-span-2`}>Payment (optional)<select value={form.paymentIntentId} onChange={e => setForm(v => ({ ...v, paymentIntentId: e.target.value }))} className={fieldClass}><option value="">Not a specific payment</option>{(wallet.data?.transactions ?? []).map(item => <option key={item.id} value={item.id}>{item.type.toLowerCase()} · {formatDate(item.createdAt)} · {item.status.toLowerCase()}</option>)}</select>{wallet.error && <span className="text-xs font-normal normal-case tracking-normal text-red-800">Recent payments couldn’t be loaded</span>}</label>}
        <label className={`${labelClass} sm:col-span-2`}>Subject<input required maxLength={160} value={form.subject} onChange={e => setForm(v => ({ ...v, subject: e.target.value }))} className={fieldClass} /></label>
        <label className={`${labelClass} sm:col-span-2`}>What happened?<textarea required minLength={10} maxLength={4000} rows={5} value={form.details} onChange={e => setForm(v => ({ ...v, details: e.target.value }))} className={`${fieldClass} py-2.5`} /></label>
      </div>
      <div className="mt-4"><Track><Pill type="submit" variant="primary" disabled={Boolean(pending) || (wagerCase && (Boolean(bets.error) || bets.loading))}><Send aria-hidden="true" />{pending === 'open' ? 'Sending…' : wagerCase ? 'Open dispute' : 'Send request'}</Pill></Track></div>
    </form>}
    {message && <Notice className="mt-4">{message}</Notice>}
    <Section title="Your cases" count={cases.data?.supportCases.length}>
      {cases.loading && <LoadingPanel label="Loading your cases" />}
      {cases.error && !isClosedError(cases.error) && <ErrorPanel error={cases.error} retry={cases.reload} />}
      {cases.data && (cases.data.supportCases.length === 0 && casesCursors.length === 0
        ? <Empty>No cases</Empty>
        : <div className="grid gap-3">{cases.data.supportCases.map(item => <Card key={item.id} className="p-4 sm:p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2"><h3 className="min-w-0 break-words font-semibold"><Dot tone={toneFor(item.status)} />{item.subject}</h3><span className="text-xs font-semibold  text-sb-mute">{statusLabel[item.status] ?? item.status}</span></div>
          <p className="mt-1 tabular-nums text-[11px] text-sb-mute">{categories.find(c => c.value === item.category)?.label ?? item.category} · {shortId(item.id)} · {formatDate(item.openedAt)}{item.wagerId ? ` · bet ${shortId(item.wagerId)}` : ''}</p>
          {item.dispute && <p className="mt-2 text-xs font-semibold"><Dot tone={toneFor(item.dispute.status)} />Dispute {item.dispute.status.toLowerCase()}{item.dispute.resolution ? ` · ${item.dispute.resolution}` : ''}</p>}
          <ol className="mt-3 grid gap-2">{item.messages.map(entry => <li key={entry.id} className={`max-w-[92%] rounded-[2px] px-3.5 py-2.5 text-sm ${entry.from === 'YOU' ? 'justify-self-end bg-sb-night text-white' : 'justify-self-start bg-sb-paper ring-1 ring-inset ring-sb-line'}`}><p className={`tabular-nums text-[11px] ${entry.from === 'YOU' ? 'text-white/55' : 'text-sb-mute'}`}>{entry.from === 'YOU' ? 'You' : 'Support'} · {formatDate(entry.createdAt)}</p><p className="mt-1 whitespace-pre-wrap break-words">{entry.body}</p></li>)}</ol>
          {item.status !== 'CLOSED' && <div className="mt-3 grid gap-2"><label className="sr-only" htmlFor={`reply-${item.id}`}>Reply</label><textarea id={`reply-${item.id}`} rows={2} maxLength={4000} placeholder="Reply" value={replies[item.id] ?? ''} onChange={e => setReplies(current => ({ ...current, [item.id]: e.target.value }))} className={`${fieldClass} py-2.5`} /><div><Track><Pill size="sm" onClick={() => reply(item.id)} disabled={Boolean(pending) || (replies[item.id] ?? '').trim().length < 2}>{pending === item.id ? 'Sending…' : 'Send reply'}</Pill></Track></div></div>}
        </Card>)}</div>)}
      {cases.data && (casesCursors.length > 0 || cases.data.nextCursor) && <nav aria-label="Case pages" className="mt-4"><Track><Pill size="sm" disabled={casesCursors.length === 0} onClick={() => setCasesCursors(current => current.slice(0, -1))}>Newer</Pill><Pill size="sm" disabled={!cases.data.nextCursor} onClick={() => { const next = cases.data?.nextCursor; if (next) setCasesCursors(current => [...current, next]) }}>Older</Pill></Track></nav>}
    </Section>
    </>}
  </CustomerShell>
}
