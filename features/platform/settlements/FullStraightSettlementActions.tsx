'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mono, Pill, PillLink, pillClass, StatusDot, Track } from '../components/kit'
import { StatusBadge } from '../components/WorkflowUI'
import { createSettlementIntent, restoreSettlementIntent, settlementAcknowledgement, settlementIntentStorageKey, type SettlementIntent } from './settlement-intent'

type ReviewedPlan = { wagerId: string; planHash: string; outcome: string; stakeMinor: string; payoutMinor: string; currency: string; currencyExponent: number; resultVersionId: string; ruleVersion: string }

export function FullStraightSettlementActions({ tenantId, actorId, plans }: { tenantId: string; actorId: string; plans: ReviewedPlan[] }) {
  const router = useRouter()
  const [loaded, setLoaded] = useState(false)
  const [pending, setPending] = useState<SettlementIntent | null>(null)
  const [blocked, setBlocked] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const inFlight = useRef(false)
  const storageKey = settlementIntentStorageKey(tenantId, actorId)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(storageKey)
      if (raw) setPending(restoreSettlementIntent(raw, { tenantId, actorId }))
    } catch { setBlocked(true); setMessage('Local recovery evidence unavailable. No new settlement will be sent; reconcile in settlement history.') }
    setLoaded(true)
  }, [storageKey, tenantId, actorId])

  async function send(plan?: ReviewedPlan) {
    if (inFlight.current || !loaded || blocked) return
    inFlight.current = true; setBusy(true)
    try {
      // Persist exact bytes BEFORE first I/O. Pending work survives refreshed server readiness.
      let intent = pending
      if (!intent) {
        if (!plan) throw new Error('No original settlement intent available')
        intent = createSettlementIntent({ tenantId, actorId }, plan.wagerId, plan.planHash, `ui:straight:${crypto.randomUUID()}`)
        sessionStorage.setItem(storageKey, JSON.stringify(intent))
        setPending(intent)
      }
      const response = await fetch('/api/graphql', { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: intent.requestBody })
      const payload: unknown = await response.json()
      const receipt = response.ok ? settlementAcknowledgement(payload) : null
      if (!receipt) throw new Error('Settlement unresolved or denied. Retry the same request or reconcile history.')
      // If local cleanup fails, retain the original intent; repeating it is safe server-side.
      sessionStorage.removeItem(storageKey)
      setPending(null); setMessage(`Committed settlement receipt: ${receipt}`)
      router.refresh()
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Original settlement remains unresolved') }
    finally { inFlight.current = false; setBusy(false) }
  }

  return <section className="space-y-3" aria-labelledby="settlement-ready">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 id="settlement-ready" className="text-sm font-semibold"><StatusDot tone={pending || blocked ? 'alert' : plans.length ? 'wait' : 'ok'} />Ready to settle<span className="ml-2 font-mono text-xs font-normal tabular-nums text-muted-foreground">{plans.length}</span></h2>
      <Track><PillLink size="sm" variant="flat" href="/dashboard/platform/configuration">House rules</PillLink><PillLink size="sm" variant="flat" href="/dashboard/platform/grading">Grading</PillLink></Track>
    </div>
    {pending ? <div role="status" className="min-w-0 rounded-xl bg-amber-50 px-4 py-3 text-amber-950 ring-1 ring-amber-200 dark:bg-amber-950/30 dark:text-amber-100 dark:ring-amber-900/50">
      <p className="break-all text-sm font-medium"><StatusDot tone="wait" />Unresolved attempt · <Mono>{pending.wagerId}</Mono></p>
      <p className="mt-1 break-all pl-4 font-mono text-xs opacity-80">plan {pending.planHash} · key {pending.idempotencyKey}</p>
      <div className="mt-3 pl-4"><Track><Pill size="sm" variant="primary" onClick={() => void send()} disabled={busy || blocked}>{busy ? 'Resolving…' : 'Retry original settlement'}</Pill><a className={pillClass('flat', 'sm')} href={`/dashboard/platform/settlements/${encodeURIComponent(pending.wagerId)}`}>Reconcile history</a></Track></div>
    </div> : null}
    {plans.length ? <ul className="min-w-0 divide-y overflow-hidden rounded-xl border bg-card">{plans.map(plan => <li key={plan.wagerId} className="flex min-w-0 flex-wrap items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0 flex-1 basis-64">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium"><Mono className="break-all">{plan.wagerId}</Mono><StatusBadge value={plan.outcome} /></p>
        <p className="mt-1 font-mono text-sm tabular-nums">{plan.stakeMinor} → <span className="font-semibold">{plan.payoutMinor}</span> <span className="text-xs text-muted-foreground">minor {plan.currency} · exp {plan.currencyExponent}</span></p>
        <p className="mt-1 break-all font-mono text-[11px] text-muted-foreground">result {plan.resultVersionId} · rule {plan.ruleVersion} · plan {plan.planHash}</p>
      </div>
      <Track><Pill size="sm" variant="primary" onClick={() => void send(plan)} disabled={!loaded || busy || blocked || Boolean(pending)}>Settle reviewed {plan.outcome}</Pill></Track>
    </li>)}</ul> : <p role="status" className="rounded-xl bg-muted/60 px-4 py-3 text-sm font-medium"><StatusDot tone="off" />No READY plans</p>}
    <p role="status" aria-live="polite" className="break-words text-sm empty:hidden">{message}</p>
  </section>
}
