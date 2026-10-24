import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { storefrontTitle } from '@/features/storefront/lib/data/brand'
import { SportsbookHome } from '@/features/storefront/sportsbook/screens/SportsbookHome'
import { findPublishedEvent } from '@/features/storefront/lib/data/catalog-route'

type Params = { params: Promise<{ event: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const match = await findPublishedEvent((await params).event)
  return { title: await storefrontTitle(match ? match.name : 'Not found') }
}

export default async function Page({ params }: Params) {
  const value = await params
  const match = await findPublishedEvent(value.event)
  if (!match) notFound()
  return <SportsbookHome initialEventId={value.event} initialEventName={match.name} initialEventCompetition={match.competition ?? undefined} />
}
