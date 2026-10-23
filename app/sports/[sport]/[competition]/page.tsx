import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { storefrontTitle } from '@/features/storefront/lib/data/brand'
import { SportsbookHome } from '@/features/storefront/sportsbook/screens/SportsbookHome'
import { findPublishedCompetition } from '@/features/storefront/lib/data/catalog-route'

type Params = { params: Promise<{ sport: string; competition: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const value = await params
  const match = await findPublishedCompetition(value.sport, decodeURIComponent(value.competition))
  return { title: await storefrontTitle(match ? `${match.competition} · ${match.sport}` : 'Not found') }
}

export default async function Page({ params }: Params) {
  const value = await params
  const competition = decodeURIComponent(value.competition)
  if (!(await findPublishedCompetition(value.sport, competition))) notFound()
  return <SportsbookHome initialSport={value.sport} initialCompetition={competition} />
}
