'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, KeyRound, Loader2, ShieldCheck } from 'lucide-react'
import { CustomerShell } from '../../components/CustomerShell'
import { customerApi, CustomerApiError } from '../../lib/customer-api'

type Mode = 'register' | 'login' | 'recover'
type Terms = { termsVersion: string; termsContentHash: string }
const MODES = [['register', 'Create'], ['login', 'Sign in'], ['recover', 'Recover']] as const

export function AuthScreen() {
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
    if (mode !== 'register' || terms) return
    let cancelled = false
    customerApi<Terms>('/api/sandbox/sportsbook/auth/register').then(result => { if (!cancelled) setTerms(result) }).catch(() => { if (!cancelled) setError('Registration is unavailable until the operator publishes its terms.') })
    return () => { cancelled = true }
  }, [mode, terms])

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
        setSuccess('If an account exists for that email, a recovery link has been sent to it. The link works once and expires in 15 minutes.')
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

  return <CustomerShell>
    <div className="mx-auto grid min-h-[calc(100vh-9rem)] max-w-5xl items-center gap-8 px-4 py-10 lg:grid-cols-[1fr_440px]">
      <section className="max-w-xl">
        <p className="text-xs font-semibold uppercase tracking-[.16em] text-emerald-700">Customer account</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">One account. Verifiable ownership.</h1>
        <p className="mt-5 text-base leading-7 text-slate-600">Your password is stored securely and you can sign out of any session from Security. You’ll be asked to verify your identity and location before you can bet.</p>
        <ul className="mt-7 grid gap-3 text-sm text-slate-700">
          {['Password-manager compatible fields','Sign out of any session at any time','Recovery links go only to the account email and revoke every existing session','Your acceptance is recorded against the published terms revision'].map(item => <li key={item} className="flex items-start gap-3"><ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-emerald-700" />{item}</li>)}
        </ul>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7" aria-labelledby="auth-heading">
        <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1" role="tablist" aria-label="Account access">
          {MODES.map(([value,label]) => <button key={value} ref={element=>{tabRefs.current[value]=element}} id={`auth-tab-${value}`} type="button" role="tab" aria-selected={mode===value} aria-controls="auth-panel" tabIndex={mode===value?0:-1} disabled={pending&&mode!==value} onKeyDown={onTabKeyDown} onClick={()=>switchMode(value)} className={`min-h-10 rounded-md px-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 ${mode===value?'bg-white text-slate-950 shadow-sm':'text-slate-600 hover:text-slate-950'}`}>{label}</button>)}
        </div>
        <div role="tabpanel" id="auth-panel" aria-labelledby={`auth-tab-${mode}`}>
        <div className="mt-6 flex items-center gap-3"><div className="grid size-10 place-items-center rounded-full bg-emerald-50 text-emerald-800"><KeyRound aria-hidden="true" className="size-5" /></div><div><h2 id="auth-heading" className="font-semibold">{mode==='register'?'Create your sportsbook account':mode==='login'?'Sign in securely':'Recover account access'}</h2><p className="text-xs text-slate-500">Practice play · no real money</p></div></div>
        <form className="mt-6 grid gap-4" onSubmit={submit} noValidate>
          {(!recoveryToken || mode!=='recover') && <label className="grid gap-1.5 text-sm font-medium">Email address<input type="email" name="email" autoComplete="email" required value={email} onChange={event=>setEmail(event.target.value)} className="min-h-12 rounded-lg border border-slate-300 px-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700" /></label>}
          {(mode!=='recover'||recoveryToken) && <label className="grid gap-1.5 text-sm font-medium">{mode==='recover'?'New password':'Password'}<input type="password" name={mode==='recover'?'new-password':'password'} autoComplete={mode==='login'?'current-password':'new-password'} required minLength={12} value={password} onChange={event=>setPassword(event.target.value)} aria-describedby="password-help" className="min-h-12 rounded-lg border border-slate-300 px-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700" /><span id="password-help" className="text-xs font-normal leading-5 text-slate-500">12–128 characters and at least three character classes.</span></label>}
          {mode==='register' && <label className="flex items-start gap-3 rounded-lg border border-slate-200 p-3 text-sm"><input type="checkbox" required checked={termsAccepted} disabled={!terms} onChange={event=>setTermsAccepted(event.target.checked)} className="mt-0.5 size-6 min-w-6 accent-emerald-700" /><span><strong className="font-medium">I accept the terms and privacy notice</strong><span className="mt-1 block text-xs leading-5 text-slate-500">{terms?`Published revision ${terms.termsVersion}. Your acceptance is recorded against this exact revision.`:'Loading the published revision…'}</span></span></label>}
          {mode==='register' && <label className="flex items-start gap-3 rounded-lg border border-slate-200 p-3 text-sm"><input type="checkbox" checked={marketingConsent} onChange={event=>setMarketingConsent(event.target.checked)} className="mt-0.5 size-6 min-w-6 accent-emerald-700" /><span><strong className="font-medium">Optional marketing</strong><span className="mt-1 block text-xs leading-5 text-slate-500">Separate from required terms and privacy consent. You can withdraw it in Profile.</span></span></label>}
          {mode==='recover'&&recoveryToken&&<label className="grid gap-1.5 text-sm font-medium">Recovery code from your email<input value={recoveryToken} onChange={event=>setRecoveryToken(event.target.value)} autoComplete="one-time-code" className="min-h-12 rounded-lg border border-slate-300 px-3 font-mono text-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700" /></label>}
          {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">{error}</div>}
          {success && <div role="status" className="flex gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-950"><CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0" />{success}</div>}
          <button type="submit" disabled={pending} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-emerald-800 px-4 font-semibold text-white hover:bg-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-wait disabled:opacity-60">{pending&&<Loader2 aria-hidden="true" className="size-4 animate-spin" />}{mode==='register'?'Create account':mode==='login'?'Sign in':recoveryToken?'Set new password':'Send recovery link'}</button>
        </form>
        </div>
        <p className="mt-5 text-center text-xs text-slate-500"><Link href="/account/responsible-play" className="font-semibold text-emerald-800 underline-offset-4 hover:underline">Safer-play controls remain accessible</Link></p>
      </section>
    </div>
  </CustomerShell>
}
