'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { CustomerShell } from '../../components/CustomerShell'
import { customerApi, CustomerApiError, useCustomerResource } from '../../lib/customer-api'
import { isClosedError } from '../../components/AccountStates'
import { Notice, Pill, Track, checkClass, fieldClass, labelClass } from '../../components/kit'

type Mode = 'register' | 'login' | 'recover'
type Terms = { termsVersion: string; termsContentHash: string }
const MODES = [['register', 'Create'], ['login', 'Sign in'], ['recover', 'Recover']] as const

export function AuthScreen() {
  const session = useCustomerResource<{ authenticated?: boolean }>('/api/sandbox/sportsbook/session')
  const [mode, setMode] = useState<Mode>('register')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [terms, setTerms] = useState<Terms | null>(null)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [recoveryToken, setRecoveryToken] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const tabRefs = useRef<Record<Mode, HTMLButtonElement | null>>({ register: null, login: null, recover: null })

  // A recovery link from email carries its code once; remove it from the address bar immediately.
  useEffect(() => {
    try {
      const url = new URL(window.location.href)
      const code = url.searchParams.get('recovery')
      if (!code) return
      url.searchParams.delete('recovery')
      window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`)
      setMode('recover'); setRecoveryToken(code)
    } catch {}
  }, [])

  useEffect(() => {
    // Terms are read only once the session read says the customer API is open.
    if (mode !== 'register' || terms || !session.data) return
    let cancelled = false
    customerApi<Terms>('/api/sandbox/sportsbook/auth/register').then(result => { if (!cancelled) setTerms(result) }).catch(() => { if (!cancelled) setError('Registration is unavailable until the operator publishes its terms.') })
    return () => { cancelled = true }
  }, [mode, terms, session.data])

  function switchMode(next: Mode, focus = false) {
    if (pending || next === mode) return
    setMode(next); setError(''); setSuccess(''); setPassword(''); setRecoveryToken(''); setTermsAccepted(false)
    if (focus) tabRefs.current[next]?.focus()
  }

  function onTabKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    const index = MODES.findIndex(([value]) => value === mode)
    const target = event.key === 'ArrowRight' ? MODES[(index + 1) % MODES.length] : event.key === 'ArrowLeft' ? MODES[(index + MODES.length - 1) % MODES.length] : event.key === 'Home' ? MODES[0] : event.key === 'End' ? MODES[MODES.length - 1] : null
    if (!target) return
    event.preventDefault(); switchMode(target[0], true)
  }

  const errors: Record<string, string> = {
    INVALID_EMAIL: 'Enter a valid email address.', WEAK_PASSWORD: 'Use at least 12 characters with three of: uppercase, lowercase, number, symbol.',
    ACCOUNT_EXISTS: 'An account already exists for this email. Sign in or recover it.', INVALID_CREDENTIALS: 'The email or password was not accepted.',
    ACCOUNT_LOCKED: 'This account is temporarily locked after repeated attempts. Recover it or wait 15 minutes.', INVALID_RECOVERY_TOKEN: 'The recovery link is invalid, expired, or already used. Request a new one.', RATE_LIMITED: 'Too many attempts. Wait before trying again.',
    TERMS_ACCEPTANCE_REQUIRED: 'Accept the terms and privacy notice to create an account.', TERMS_CHANGED: 'The terms were updated while you were registering. Review the current version and accept again.', TERMS_UNAVAILABLE: 'Registration is unavailable until the operator publishes its terms.',
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault(); if (pending) return
    setPending(true); setError(''); setSuccess('')
    try {
      if (mode === 'register') {
        if (!terms || !termsAccepted) { setError(errors.TERMS_ACCEPTANCE_REQUIRED); return }
        await customerApi('/api/sandbox/sportsbook/auth/register', { method: 'POST', body: JSON.stringify({ email, password, locale: navigator.language || 'en-US', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC', marketingConsent, acceptedTermsVersion: terms.termsVersion, acceptedTermsContentHash: terms.termsContentHash }) })
        window.location.assign('/')
      } else if (mode === 'login') {
        await customerApi('/api/sandbox/sportsbook/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
        window.location.assign('/')
      } else if (!recoveryToken) {
        await customerApi<{ accepted: boolean }>('/api/sandbox/sportsbook/auth/recovery', { method: 'POST', body: JSON.stringify({ email }) })
        setSuccess('If an account exists for that email, a recovery link was sent. It works once and expires in 15 minutes.')
      } else {
        await customerApi('/api/sandbox/sportsbook/auth/recovery', { method: 'PUT', body: JSON.stringify({ token: recoveryToken, password }) })
        setMode('login'); setRecoveryToken(''); setPassword(''); setSuccess('Password updated. Sign in with the new password.')
      }
    } catch (reason) {
      const code = reason instanceof CustomerApiError ? reason.code : 'REQUEST_FAILED'
      if (code === 'TERMS_CHANGED') { setTerms(null); setTermsAccepted(false) }
      setError(errors[code] ?? 'The request could not be completed safely.')
    } finally { setPending(false) }
  }

  const title = mode==='register' ? 'Create account' : mode==='login' ? 'Sign in' : recoveryToken ? 'New password' : 'Recover access'
  return <CustomerShell closed={isClosedError(session.error)}>
    <div className="mx-auto w-full max-w-md px-4 py-10 sm:py-16">
      <section className="overflow-hidden rounded-[2px] bg-sb-card ring-1 ring-sb-line" aria-labelledby="auth-heading">
        <div className="bg-sb-night px-5 pb-5 pt-6 text-white sm:px-7">
          <h1 id="auth-heading" className="font-sb-display text-4xl font-bold uppercase leading-none tracking-tight">{title}</h1>
          <p className="mt-2 text-xs  text-white/95">Practice play · no real money</p>
          <div className="mt-5 grid grid-cols-3 gap-1 rounded-[2px] bg-black/40 p-1 shadow-[inset_0_1px_2px_rgb(0_0_0/0.6)] ring-1 ring-inset ring-white/5" role="tablist" aria-label="Account access">
            {MODES.map(([value,label]) => <button key={value} ref={element=>{tabRefs.current[value]=element}} id={`auth-tab-${value}`} type="button" role="tab" aria-selected={mode===value} aria-controls="auth-panel" tabIndex={mode===value?0:-1} disabled={pending&&mode!==value} onKeyDown={onTabKeyDown} onClick={()=>switchMode(value)} className="min-h-9 rounded-[2px] px-2 text-sm font-semibold text-white/95 transition-colors hover:text-white aria-selected:bg-sb-rule aria-selected:text-white aria-selected:shadow-[0_1px_2px_rgb(0_0_0/0.5)]">{label}</button>)}
          </div>
        </div>
        <div role="tabpanel" id="auth-panel" aria-labelledby={`auth-tab-${mode}`} className="px-5 pb-6 pt-5 sm:px-7">
        <form className="grid gap-4" onSubmit={submit} noValidate>
          {(!recoveryToken || mode!=='recover') && <label className={labelClass}>Email<input type="email" name="email" autoComplete="email" required value={email} onChange={event=>setEmail(event.target.value)} className={fieldClass} /></label>}
          {(mode!=='recover'||recoveryToken) && <label className={labelClass}>{mode==='recover'?'New password':'Password'}<input type="password" name={mode==='recover'?'new-password':'password'} autoComplete={mode==='login'?'current-password':'new-password'} required minLength={12} value={password} onChange={event=>setPassword(event.target.value)} aria-describedby="password-help" className={fieldClass} /><span id="password-help" className="text-xs font-normal normal-case tracking-normal text-sb-mute">12–128 characters, three character types</span></label>}
          {mode==='register' && <label className="flex items-start gap-3 rounded-[2px] bg-sb-paper p-3.5 text-sm ring-1 ring-inset ring-sb-line"><input type="checkbox" required checked={termsAccepted} disabled={!terms} onChange={event=>setTermsAccepted(event.target.checked)} className={checkClass} /><span><span className="font-semibold">I accept the terms and privacy notice</span><span className="mt-0.5 block tabular-nums text-[11px] text-sb-mute">{terms?`Revision ${terms.termsVersion}`:'Loading revision…'}</span></span></label>}
          {mode==='register' && <label className="flex items-start gap-3 rounded-[2px] bg-sb-paper p-3.5 text-sm ring-1 ring-inset ring-sb-line"><input type="checkbox" checked={marketingConsent} onChange={event=>setMarketingConsent(event.target.checked)} className={checkClass} /><span className="font-semibold">Marketing messages <span className="font-normal text-sb-mute">(optional)</span></span></label>}
          {mode==='recover'&&recoveryToken&&<label className={labelClass}>Recovery code<input value={recoveryToken} onChange={event=>setRecoveryToken(event.target.value)} autoComplete="one-time-code" className={`${fieldClass} tabular-nums text-xs`} /></label>}
          {error && <Notice tone="alert">{error}</Notice>}
          {success && <Notice tone="ok">{success}</Notice>}
          <Track block><Pill type="submit" variant="primary" size="lg" disabled={pending}>{pending&&<Loader2 aria-hidden="true" className="animate-spin" />}{mode==='register'?'Create account':mode==='login'?'Sign in':recoveryToken?'Set new password':'Send recovery link'}</Pill></Track>
        </form>
        </div>
      </section>
      <p className="mt-5 text-center text-xs text-sb-mute"><Link href="/account/responsible-play" className="font-semibold text-sb-ink underline-offset-4 hover:underline">Safer play</Link></p>
    </div>
  </CustomerShell>
}
