'use client'

import Link from 'next/link'
import type { CustomerSessionSummary } from '@/features/sportsbook/customer/contracts'
import { CustomerShell } from '../../customer/components/CustomerShell'
import { isClosedError } from '../../customer/components/AccountStates'
import { Card, Dot, Empty, PageTitle, PillLink, Track } from '../../customer/components/kit'
import { useCustomerResource } from '../../customer/lib/customer-api'

export type SportsIndexEntry = { key: string; name: string; events: number; competitions: Array<{ name: string; events: number }> }

/** Browse by sport: every published sport with its competitions and how many events each has on the board. */
export function SportsIndex({ sports }: { sports: SportsIndexEntry[] }) {
  const session = useCustomerResource<CustomerSessionSummary>('/api/sandbox/sportsbook/session')
  const total = sports.reduce((sum, sport) => sum + sport.events, 0)
  return <CustomerShell authenticated={Boolean(session.data?.authenticated)} accountReference={session.data?.accountReference} closed={isClosedError(session.error)}>
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:py-10">
      <PageTitle title="Sports" meta={`${sports.length} sport${sports.length === 1 ? '' : 's'} · ${total} event${total === 1 ? '' : 's'}`} aside={<Track><PillLink href="/" variant="primary" size="sm">Live & upcoming</PillLink></Track>} />
      {sports.length === 0 ? <div className="mt-6"><Empty>No sports published</Empty></div> : <div className="mt-6 grid gap-4 md:grid-cols-2">
        {sports.map(sport => <Card key={sport.key} className="overflow-hidden">
          <Link href={`/sports/${encodeURIComponent(sport.key)}`} className="flex items-center justify-between gap-3 bg-sb-night px-5 py-4 text-white hover:bg-sb-board">
            <span className="min-w-0 truncate font-sb-display text-2xl font-bold uppercase tracking-wide">{sport.events > 0 ? <Dot tone="win" /> : <Dot tone="off" className="bg-white/40" />}{sport.name}</span>
            <span className="shrink-0 font-sb-mono text-xs text-sb-flood">{sport.events} event{sport.events === 1 ? '' : 's'}</span>
          </Link>
          {sport.competitions.length === 0 ? <p className="px-5 py-4 text-sm text-sb-mute">No competitions</p> : <ul className="divide-y divide-sb-line">
            {sport.competitions.map(competition => <li key={competition.name}><Link href={`/sports/${encodeURIComponent(sport.key)}/${encodeURIComponent(competition.name)}`} className="flex items-center justify-between gap-3 px-5 py-3 text-sm hover:bg-sb-paper">
              <span className="min-w-0 truncate font-semibold">{competition.name}</span>
              <span className="shrink-0 font-sb-mono text-xs text-sb-mute">{competition.events}</span>
            </Link></li>)}
          </ul>}
        </Card>)}
      </div>}
    </div>
  </CustomerShell>
}
