'use client'

import Link from 'next/link'
import type { CustomerSessionSummary } from '@/features/sportsbook/customer/contracts'
import { CustomerShell } from '../../customer/components/CustomerShell'
import { isClosedError } from '../../customer/components/AccountStates'
import { Card, Dot, Empty, PageTitle, PillLink, Track } from '../../customer/components/kit'
import { useCustomerResource } from '../../customer/lib/customer-api'

export type SportsIndexEntry = { key: string; name: string; events: number; competitions: Array<{ slug: string; name: string; events: number }> }

/** Browse by sport: every published sport with its competitions and how many events each has on the board. */
export function SportsIndex({ sports }: { sports: SportsIndexEntry[] }) {
  const session = useCustomerResource<CustomerSessionSummary>('/api/sandbox/sportsbook/session')
  const total = sports.reduce((sum, sport) => sum + sport.events, 0)
  return <CustomerShell authenticated={Boolean(session.data?.authenticated)} accountReference={session.data?.accountReference}>
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:py-10">
      <PageTitle title="Sports" meta={`${sports.length} sport${sports.length === 1 ? '' : 's'} · ${total} event${total === 1 ? '' : 's'}`} aside={<Track><PillLink href="/" variant="primary" size="sm">Live & upcoming</PillLink></Track>} />
      {/* The catalog of published sports stays browsable while betting is closed; only prices and bets are withheld. */}
      {isClosedError(session.error) && <p role="status" className="mt-6 max-w-prose rounded-[2px] bg-sb-card px-4 py-3 text-sm leading-relaxed text-sb-mute ring-1 ring-sb-line"><Dot tone="off" /><span className="font-semibold text-sb-ink">Betting closed.</span> Fixtures are listed for browsing; prices, bets and accounts open only in an isolated practice sandbox. No real money.</p>}
      {sports.length === 0 ? <div className="mt-6"><Empty>No sports published</Empty></div> : <div className="mt-6 grid gap-4 md:grid-cols-2">
        {sports.map(sport => <Card key={sport.key} className="overflow-hidden">
          <Link href={`/sports/${encodeURIComponent(sport.key)}`} className="flex items-center justify-between gap-3 bg-sb-night px-5 py-4 text-white hover:bg-sb-board">
            <span className="min-w-0 truncate font-sb-display text-2xl font-bold uppercase tracking-wide">{sport.events > 0 ? <Dot tone="win" /> : <Dot tone="off" className="bg-white/40" />}{sport.name}</span>
            <span className="shrink-0 tabular-nums text-xs text-sb-flood">{sport.events} event{sport.events === 1 ? '' : 's'}</span>
          </Link>
          {sport.competitions.length === 0 ? <p className="px-5 py-4 text-sm text-sb-mute">No competitions</p> : <ul className="divide-y divide-sb-line">
            {sport.competitions.map(competition => <li key={competition.slug}><Link href={`/sports/${encodeURIComponent(sport.key)}/${encodeURIComponent(competition.slug)}`} className="flex items-center justify-between gap-3 px-5 py-3 text-sm hover:bg-sb-paper">
              <span className="min-w-0 truncate font-semibold">{competition.name}</span>
              <span className="shrink-0 tabular-nums text-xs text-sb-mute">{competition.events}</span>
            </Link></li>)}
          </ul>}
        </Card>)}
      </div>}
    </div>
  </CustomerShell>
}
