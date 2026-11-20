'use client'

import Link from 'next/link'
import type { CustomerSessionSummary } from '@/features/sportsbook/customer/contracts'
import { CustomerShell } from '../../customer/components/CustomerShell'
import { isClosedError } from '../../customer/components/AccountStates'
import { Dot, Empty, PageTitle } from '../../customer/components/kit'
import { useCustomerResource } from '../../customer/lib/customer-api'

export type SportsIndexEntry = { key: string; name: string; events: number; competitions: Array<{ slug: string; name: string; events: number }> }

/** Browse by sport: every published sport with its competitions and how many events each has on the board. */
export function SportsIndex({ sports }: { sports: SportsIndexEntry[] }) {
  const session = useCustomerResource<CustomerSessionSummary>('/api/sportsbook/session')
  const total = sports.reduce((sum, sport) => sum + sport.events, 0)
  return <CustomerShell authenticated={Boolean(session.data?.authenticated)} accountReference={session.data?.accountReference}>
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:py-10">
      <PageTitle title="Sports" meta={`${sports.length} sport${sports.length === 1 ? '' : 's'} · ${total} event${total === 1 ? '' : 's'}`} aside={<Link href="/" className="text-sm font-semibold text-sb-ink underline underline-offset-4 hover:text-sb-brand">All prices</Link>} />
      {/* The catalog of published sports stays browsable while betting is closed; only prices and bets are withheld. */}
      {isClosedError(session.error) && <p role="status" className="mt-6 max-w-prose border-t border-sb-line py-3 text-sm leading-relaxed text-sb-mute"><Dot tone="off" /><span className="font-semibold text-sb-ink">Betting closed.</span> 21+. Gambling problem? Call 1-800-GAMBLER.</p>}
      {sports.length === 0 ? <div className="mt-6"><Empty>No sports published</Empty></div> : <div className="mt-8 grid gap-x-10 md:grid-cols-2">
        {sports.map(sport => <section key={sport.key} className="border-t-2 border-sb-ink pb-6">
          <Link href={`/sports/${encodeURIComponent(sport.key)}`} className="flex items-baseline justify-between gap-3 py-3 text-sb-ink hover:text-sb-brand">
            <span className="min-w-0 truncate font-sb-display text-xl font-semibold">{sport.name}</span>
            <span className="shrink-0 tabular-nums text-xs text-sb-mute">{sport.events === 0 ? 'No events' : `${sport.events} event${sport.events === 1 ? '' : 's'}`}</span>
          </Link>
          {sport.competitions.length === 0 ? <p className="py-2 text-sm text-sb-mute">No competitions</p> : <ul className="divide-y divide-sb-line border-t border-sb-line">
            {sport.competitions.map(competition => <li key={competition.slug}><Link href={`/sports/${encodeURIComponent(sport.key)}/${encodeURIComponent(competition.slug)}`} className="flex items-center justify-between gap-3 py-2.5 text-sm hover:text-sb-brand">
              <span className="min-w-0 truncate">{competition.name}</span>
              <span className="shrink-0 tabular-nums text-xs text-sb-mute">{competition.events}</span>
            </Link></li>)}
          </ul>}
        </section>)}
      </div>}
    </div>
  </CustomerShell>
}
