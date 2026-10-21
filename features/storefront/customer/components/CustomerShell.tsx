'use client'

import Link from 'next/link'
import { useState, type ReactNode } from 'react'
import { BadgeHelp, Gauge, Gift, LifeBuoy, LockKeyhole, LogOut, Menu, TicketCheck, UserRound, WalletCards, X } from 'lucide-react'
import { customerApi } from '../lib/customer-api'
import { DEFAULT_STORE_LOGO_ICON } from '@/features/platform/store-settings/lib/store-logo'
import { brandHue, useStorefrontBrand } from './StorefrontBrand'

const accountLinks = [
  { href: '/account/profile', label: 'Profile', icon: UserRound, key: 'profile' },
  { href: '/account/wallet', label: 'Wallet', icon: WalletCards, key: 'wallet' },
  { href: '/account/bets', label: 'My bets', icon: TicketCheck, key: 'bets' },
  { href: '/account/promotions', label: 'Promotions', icon: Gift, key: 'promotions' },
  { href: '/account/limits', label: 'Limits', icon: Gauge, key: 'limits' },
  { href: '/account/responsible-play', label: 'Responsible play', icon: LifeBuoy, key: 'responsible-play' },
  { href: '/account/disputes', label: 'Support & disputes', icon: BadgeHelp, key: 'disputes' },
  { href: '/account/security', label: 'Security', icon: LockKeyhole, key: 'security' },
]

export function CustomerShell({
  children,
  current,
  authenticated = false,
  accountReference,
}: {
  children: ReactNode
  current?: string
  authenticated?: boolean
  accountReference?: string
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  // Store Settings branding: the header carries the brand hue, so the logo inside it and the
  // header accents rotate together (one rotation, never applied twice).
  const brand = useStorefrontBrand()
  const brandFilter = { filter: `hue-rotate(${brandHue(brand)}deg)` }
  const brandName = brand?.name || 'Sportsbook'
  const logoSvg = brand?.logoIcon || DEFAULT_STORE_LOGO_ICON

  async function signOut() {
    setSigningOut(true)
    try {
      await customerApi('/api/sandbox/sportsbook/session', { method: 'DELETE', body: '{}' })
      window.location.assign('/')
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <div className="min-h-screen overflow-x-clip bg-slate-50 text-slate-950">
      <a href="#main-content" className="sr-only z-50 rounded-md bg-white px-4 py-3 text-sm font-semibold text-slate-950 focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:outline-2 focus:outline-offset-2 focus:outline-emerald-300">
        Skip to content
      </a>
      <header style={brandFilter} className="sticky top-0 z-30 border-b border-white/10 bg-[#092f28] text-white shadow-sm">
        <div className="mx-auto flex min-h-16 max-w-[1500px] flex-wrap items-center gap-3 px-4 py-2 lg:px-5">
          <button
            type="button"
            aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={menuOpen}
            aria-controls="customer-navigation"
            onClick={() => setMenuOpen(value => !value)}
            className="grid size-11 place-items-center rounded-lg text-emerald-50 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 md:hidden"
          >
            {menuOpen ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
          </button>
          <Link href="/" data-testid="nav-store-link" className="flex min-w-0 items-center gap-2 text-sm font-bold tracking-tight focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-300 sm:text-base">
            <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: logoSvg }} className="size-5 shrink-0 [&>svg]:block [&>svg]:h-full [&>svg]:w-full" />
            <span className="truncate">{brandName}</span>
          </Link>
          <nav className="ml-4 hidden items-center gap-5 text-sm md:flex" aria-label="Primary navigation">
            <Link className="whitespace-nowrap text-emerald-100 hover:text-white focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-300" href="/">Sports</Link>
            <Link className="whitespace-nowrap text-emerald-100 hover:text-white focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-300" href="/account/bets">My bets</Link>
            <Link className="whitespace-nowrap text-emerald-100 hover:text-white focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-300" href="/account/promotions">Promotions</Link>
            <Link className="whitespace-nowrap text-emerald-100 hover:text-white focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-300" href="/account/responsible-play">Safer play</Link>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            {authenticated ? (
              <>
                <span className="hidden text-xs text-emerald-100 sm:inline">Account {accountReference ?? ''}</span>
                <button
                  type="button"
                  aria-label={signingOut ? 'Signing out' : 'Sign out'}
                  onClick={signOut}
                  disabled={signingOut}
                  className="inline-flex min-h-10 items-center gap-2 whitespace-nowrap rounded-lg border border-white/25 px-3 text-sm font-medium hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 disabled:cursor-wait disabled:opacity-60"
                >
                  <LogOut aria-hidden="true" className="size-4" />
                  <span className="hidden sm:inline">{signingOut ? 'Signing out…' : 'Sign out'}</span>
                </button>
              </>
            ) : (
              <Link href="/account/auth" className="inline-flex min-h-10 items-center rounded-lg bg-white px-3 text-sm font-semibold text-emerald-950 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300">Create account / Sign in</Link>
            )}
          </div>
          <nav id="customer-navigation" hidden={!menuOpen} className="w-full border-t border-white/10 py-2 md:hidden" aria-label="Mobile navigation">
            <div className="grid gap-1">
              <Link onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-sm hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-emerald-300" href="/">Sports</Link>
              {accountLinks.map(link => <Link key={link.key} onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-sm hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-emerald-300" href={link.href}>{link.label}</Link>)}
            </div>
          </nav>
        </div>
      </header>

      {current ? (
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 md:grid-cols-[210px_minmax(0,1fr)] md:py-9">
          <nav aria-label="Account sections" className="flex max-w-full gap-2 overflow-x-auto pb-1 md:flex-col md:overflow-visible">
            {accountLinks.map(link => {
              const Icon = link.icon
              const active = current === link.key
              return <Link
                key={link.key}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                style={active ? brandFilter : undefined}
                className={`inline-flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 ${active ? 'bg-emerald-800 text-white' : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-slate-950'}`}
              >
                <Icon aria-hidden="true" className="size-4" />{link.label}
              </Link>
            })}
          </nav>
          <main id="main-content" className="min-w-0">{children}</main>
        </div>
      ) : <main id="main-content">{children}</main>}

      <footer className="border-t bg-white px-4 py-6 text-xs text-slate-600">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p>Practice play only. No real money is wagered or paid out.</p>
          <a style={brandFilter} className="w-fit font-semibold text-emerald-800 underline-offset-4 hover:underline focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700" href="https://www.ncpgambling.org/help-treatment/" target="_blank" rel="noreferrer">Independent support resources</a>
        </div>
      </footer>
    </div>
  )
}

export const customerAccountLinks = accountLinks
