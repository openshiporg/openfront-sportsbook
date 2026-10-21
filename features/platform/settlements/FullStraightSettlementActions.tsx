'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
    } catch { setBlocked(true); setMessage('Local recovery evidence is unavailable or inconsistent. No new settlement will be sent. Reconcile the original attempt in settlement history.') }
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
      if (!receipt) throw new Error('Original settlement is unresolved or denied. Retry the SAME request or reconcile history; no new key or plan was substituted.')
      // If local cleanup fails, retain the original intent; repeating it is safe server-side.
      sessionStorage.removeItem(storageKey)
      setPending(null); setMessage(`Committed settlement receipt: ${receipt}`)
      router.refresh()
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Original settlement remains unresolved') }
    finally { inFlight.current = false; setBusy(false) }
  }

  return <section className="space-y-4" aria-label="Reviewed FULL STRAIGHT settlement">
    <div><h2 className="font-semibold">Reviewed FULL STRAIGHT plans</h2><p className="text-sm text-muted-foreground">Cash-funded WIN / LOSS / VOID only. Result, selected grade, accepted rule, stake and payout are bound by the plan hash. Other structures, tax policies and corrections require their own reviewed plans.</p><p className="mt-2 text-sm"><Link className="underline" href="/dashboard/platform/configuration">Review independently approved house-rule configuration</Link> · <Link className="underline" href="/dashboard/platform/grading">Grade the selected official result</Link></p></div>
    {pending ? <div className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/30 p-4"><p className="font-medium">Original attempt · {pending.wagerId}</p><p className="mt-1 break-all text-xs">Plan {pending.planHash} · key {pending.idempotencyKey}</p><p className="mt-2 text-sm">This private tab remembers exact request bytes across reload. It is not cross-device durable recovery. Even if the wager is no longer READY, this retry asks for the original receipt.</p><button type="button" onClick={() => void send()} disabled={busy || blocked} className="mt-3 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50">{busy ? 'Resolving…' : 'Retry original settlement'}</button><a className="ml-3 text-sm underline" href={`/dashboard/platform/settlements/${encodeURIComponent(pending.wagerId)}`}>Reconcile original history</a></div> : null}
    {plans.map(plan => <div key={plan.wagerId} className="rounded-xl border bg-card p-4"><h3 className="font-medium">{plan.wagerId} · {plan.outcome}</h3><p className="mt-1 text-sm">Stake {plan.stakeMinor} minor {plan.currency} → payout {plan.payoutMinor} minor {plan.currency} · exponent {plan.currencyExponent}</p><p className="mt-1 break-all text-xs">Result {plan.resultVersionId} · rule {plan.ruleVersion} · plan {plan.planHash}</p><button type="button" onClick={() => void send(plan)} disabled={!loaded || busy || blocked || Boolean(pending)} className="mt-3 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50">Settle reviewed {plan.outcome}</button></div>)}
    {!plans.length ? <p className="text-sm text-muted-foreground">No currently READY plans. An unresolved original request can still be retried above after reload.</p> : null}
    <p role="status" aria-live="polite" className="break-words text-sm">{message}</p>
  </section>
}
