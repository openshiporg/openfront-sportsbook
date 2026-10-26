'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, type ReactNode } from 'react'
import { BadgeHelp, Gauge, Gift, LifeBuoy, LockKeyhole, LogOut, Menu, TicketCheck, UserRound, WalletCards, X } from 'lucide-react'
import { customerApi } from '../lib/customer-api'
import { DEFAULT_STORE_LOGO_ICON } from '@/features/platform/store-settings/lib/store-logo'
import { brandHue, useStorefrontBrand } from './StorefrontBrand'
import { Track, pillClass } from './kit'
import { ClosedPanel } from './AccountStates'
import { cn } from '@/lib/utils'

const accountLinks = [
  { href: '/account/profile', label: 'Profile', icon: UserRound, key: 'profile' },
  { href: '/account/wallet', label: 'Wallet', icon: WalletCards, key: 'wallet' },
  { href: '/account/bets', label: 'My bets', icon: TicketCheck, key: 'bets' },
  { href: '/account/promotions', label: 'Promotions', icon: Gift, key: 'promotions' },
  { href: '/account/limits', label: 'Limits', icon: Gauge, key: 'limits' },
  { href: '/account/responsible-play', label: 'Safer play', icon: LifeBuoy, key: 'responsible-play' },
  { href: '/account/disputes', label: 'Support', icon: BadgeHelp, key: 'disputes' },
  { href: '/account/security', label: 'Security', icon: LockKeyhole, key: 'security' },
]

const primaryLinks = [
  { href: '/', label: 'Live & upcoming' },
  { href: '/sports', label: 'Sports' },
  { href: '/account/bets', label: 'My bets' },
  { href: '/promotions', label: 'Promotions' },
  { href: '/account/responsible-play', label: 'Safer play' },
]

export function CustomerShell({
  children,
  current,
  authenticated = false,
  accountReference,
  closed = false,
}: {
  children: ReactNode
  current?: string
  authenticated?: boolean
  accountReference?: string
  /** The customer API is switched off: every page shows the same closed state. */
  closed?: boolean
}) {
  const pathname = usePathname() ?? '/'
  const [menuOpen, setMenuOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  // Store Settings branding: one hue rotation covers the logo and every brand accent in the header.
  const brand = useStorefrontBrand()
  const brandFilter = { filter: `hue-rotate(${brandHue(brand)}deg)` }
  const brandName = brand?.name || 'Sportsbook'
  const logoSvg = brand?.logoIcon || DEFAULT_STORE_LOGO_ICON
  const isCurrent = (href: string) => href === '/' ? pathname === '/' || pathname.startsWith('/events') || pathname.startsWith('/betslip') : href === '/sports' ? pathname.startsWith('/sports') : pathname === href

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
    <div className="flex min-h-screen flex-col overflow-x-clip bg-sb-paper text-sb-ink">
      <a href="#main-content" className="sr-only z-50 rounded-[2px] bg-white px-4 py-3 text-sm font-semibold text-sb-ink focus:not-sr-only focus:fixed focus:left-3 focus:top-3">
        Skip to content
      </a>
      <header className="sticky top-0 z-30 bg-sb-night text-white">
        <div className="mx-auto flex min-h-16 max-w-[1560px] flex-wrap items-center gap-3 px-4 py-2.5 lg:px-6">
          <button
            type="button"
            aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={menuOpen}
            aria-controls="customer-navigation"
            onClick={() => setMenuOpen(value => !value)}
            className="-ml-1 grid size-11 place-items-center rounded-full text-white/80 hover:bg-white/10 md:hidden"
          >
            {menuOpen ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
          </button>
          <Link href="/" data-testid="nav-store-link" className="flex min-w-0 flex-1 items-center gap-2.5 md:flex-none">
            <span style={brandFilter} aria-hidden="true" dangerouslySetInnerHTML={{ __html: logoSvg }} className="box-content h-6 w-5 shrink-0 rounded-[2px] bg-white px-1 py-0.5 [&>svg]:block [&>svg]:h-full [&>svg]:w-full" />
            <span className="min-w-0 truncate font-sb-display text-xl font-bold uppercase leading-none tracking-wide sm:text-2xl">{brandName}</span>
          </Link>
          <nav className="ml-4 hidden md:block" aria-label="Primary navigation">
            <Track dark>
              {primaryLinks.map(link => <Link key={link.href} href={link.href} aria-current={isCurrent(link.href) ? 'page' : undefined} className={pillClass('flatDark', 'sm')}>{link.label}</Link>)}
            </Track>
          </nav>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            {authenticated ? (
              <>
                <Link href="/account/profile" className="hidden items-center gap-2 rounded-[2px] px-3 py-1.5 tabular-nums text-xs text-white/70 hover:bg-white/10 hover:text-white sm:inline-flex">
                  <span aria-hidden="true" className="size-1.5 rounded-full bg-sb-win" />{accountReference ?? 'Account'}
                </Link>
                <button
                  type="button"
                  aria-label={signingOut ? 'Signing out' : 'Sign out'}
                  onClick={signOut}
                  disabled={signingOut}
                  className="inline-flex min-h-10 items-center gap-2 whitespace-nowrap rounded-[2px] px-3.5 text-sm font-semibold text-white/80 ring-1 ring-white/15 hover:bg-white/10 hover:text-white disabled:cursor-wait disabled:opacity-60"
                >
                  <LogOut aria-hidden="true" className="size-4" />
                  <span className="hidden sm:inline">{signingOut ? 'Signing out…' : 'Sign out'}</span>
                </button>
              </>
            ) : (
              <Link href="/account/auth" className={cn(pillClass('raised', 'sm'), 'border-white bg-white text-sb-brand hover:bg-white/90')}>Sign in</Link>
            )}
          </div>
          <nav id="customer-navigation" hidden={!menuOpen} className="w-full border-t border-white/10 pb-2 pt-3 md:hidden" aria-label="Mobile navigation">
            <div className="grid grid-cols-2 gap-1">
              {[{ href: '/', label: 'Live & upcoming', key: 'board' }, { href: '/sports', label: 'Sports', key: 'sports' }, ...accountLinks].map(link => <Link key={link.key} onClick={() => setMenuOpen(false)} aria-current={isCurrent(link.href) ? 'page' : undefined} className="rounded-[2px] px-4 py-2.5 text-sm text-white/75 hover:bg-white/10 aria-[current=page]:bg-sb-rule aria-[current=page]:text-white" href={link.href}>{link.label}</Link>)}
            </div>
          </nav>
        </div>
        <div aria-hidden="true" style={brandFilter} className="h-1 bg-[linear-gradient(90deg,#fff_0_38%,transparent_38%_40%,#fff_40%_62%,transparent_62%)] opacity-40" />
      </header>

      {current ? (
        <div className="mx-auto grid w-full max-w-6xl flex-1 gap-6 px-4 py-6 md:grid-cols-[200px_minmax(0,1fr)] md:gap-10 md:py-10">
          <nav aria-label="Account sections" className="min-w-0">
            <div className="sb-scroll -mx-4 px-4 md:mx-0 md:px-0">
              <div className="inline-flex gap-1 rounded-[2px] bg-sb-well p-1 shadow-[inset_0_1px_2px_rgb(16_20_27/0.12)] ring-1 ring-inset ring-black/5 md:flex md:flex-col md:rounded-[2px] md:p-1.5">
                {accountLinks.map(link => {
                  const Icon = link.icon
                  const active = current === link.key
                  return <Link
                    key={link.key}
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(pillClass('flat', 'sm'), 'md:justify-start md:px-3.5')}
                  >
                    <Icon aria-hidden="true" />{link.label}
                  </Link>
                })}
              </div>
            </div>
          </nav>
          <main id="main-content" className="min-w-0">{closed ? <ClosedState /> : children}</main>
        </div>
      ) : <main id="main-content" className="flex-1">{closed ? <div className="mx-auto w-full max-w-3xl px-4 py-6"><ClosedState /></div> : children}</main>}

      <footer className="bg-sb-night px-4 py-6 text-xs text-white/80">
        <div className="mx-auto flex max-w-[1560px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:px-2">
          <p className=""><span aria-hidden="true" className="mr-2 inline-block size-1.5 rounded-full bg-sb-flood align-middle" />Practice play · no real money</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/account/responsible-play" className="hover:text-white">Safer play</Link>
            <Link href="/account/disputes" className="hover:text-white">Support</Link>
            <a className="hover:text-white" href="https://www.ncpgambling.org/help-treatment/" target="_blank" rel="noreferrer">Independent help</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

function ClosedState() {
  return <>
    <ClosedPanel />
    <div className="mt-4"><Track label="Independent help"><a href="https://www.ncpgambling.org/help-treatment/" target="_blank" rel="noreferrer" className={pillClass('raised', 'sm')}>NCPG help and treatment</a><a href="https://www.gamblersanonymous.org/" target="_blank" rel="noreferrer" className={pillClass('raised', 'sm')}>Gamblers Anonymous</a></Track></div>
  </>
}

export const customerAccountLinks = accountLinks
