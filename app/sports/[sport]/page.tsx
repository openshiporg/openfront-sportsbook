import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SportsbookHome } from '@/features/storefront/sportsbook/screens/SportsbookHome'
import { findPublishedSport } from '@/features/storefront/lib/data/catalog-route'
import { storefrontTitle } from '@/features/storefront/lib/data/brand'

type Params = { params: Promise<{ sport: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const match = await findPublishedSport((await params).sport)
  return { title: await storefrontTitle(match ? match.name : 'Not found') }
}

export default async function Page({ params }: Params) {
  const value = await params
  if (!(await findPublishedSport(value.sport))) notFound()
  return <SportsbookHome initialSport={value.sport} />
}
