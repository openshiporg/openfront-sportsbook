import { cache } from 'react'
import { keystoneContext } from '@/features/keystone/context'
import { getStorefrontDisplayBrand } from './brand'
import { PUBLIC_EVENT_STATUSES } from '@/features/sportsbook/customer/catalog'

/**
 * Route lookups for the storefront's catalog pages: a slug only renders when it names a record the operator has
 * published (same published rules as the catalog read). No operator, or no match, is a 404.
 */
async function tenantId() {
  return (await getStorefrontDisplayBrand())?.tenantId ?? null
}

export const findPublishedCompetition = cache(async function (sportKey: string, competition: string) {
  const tenant = await tenantId()
  if (!tenant) return null
  const prisma: any = keystoneContext.prisma
  const match = await prisma.competition.findFirst({
    where: { tenantId: tenant, status: 'ACTIVE', OR: [{ id: competition }, { name: competition }], sport: { is: { tenantId: tenant, active: true, key: sportKey } } },
    select: { name: true, sport: { select: { name: true } } },
  })
  return match ? { competition: match.name as string, sport: match.sport?.name as string } : null
})

export const findPublishedEvent = cache(async function (eventId: string) {
  const tenant = await tenantId()
  if (!tenant) return null
  const prisma: any = keystoneContext.prisma
  const match = await prisma.event.findFirst({
    where: { id: eventId, tenantId: tenant, status: { in: [...PUBLIC_EVENT_STATUSES] }, competition: { is: { tenantId: tenant, status: 'ACTIVE', sport: { is: { tenantId: tenant, active: true } } } } },
    select: { name: true },
  })
  return match ? { name: match.name as string } : null
})

/** Published sports with their published competitions and upcoming/live event counts, for the sports index. */
export const listPublishedSports = cache(async function () {
  const tenant = await tenantId()
  if (!tenant) return []
  const prisma: any = keystoneContext.prisma
  const sports = await prisma.sport.findMany({
    where: { tenantId: tenant, active: true },
    orderBy: [{ name: 'asc' }, { id: 'asc' }],
    take: 100,
    select: { key: true, name: true, from_Competition_sport: { where: { tenantId: tenant, status: 'ACTIVE' }, orderBy: [{ name: 'asc' }, { id: 'asc' }], take: 100, select: { id: true, name: true } } },
  })
  const counts = await prisma.event.groupBy({
    by: ['competitionId'],
    where: { tenantId: tenant, status: { in: [...PUBLIC_EVENT_STATUSES] }, competition: { is: { tenantId: tenant, status: 'ACTIVE', sport: { is: { tenantId: tenant, active: true } } } } },
    _count: { _all: true },
  })
  const eventsByCompetition = new Map<string, number>(counts.map((row: any) => [row.competitionId, row._count._all]))
  return sports.map((sport: any) => {
    const competitions = sport.from_Competition_sport.map((competition: any) => ({ name: competition.name as string, events: eventsByCompetition.get(competition.id) ?? 0 }))
    return { key: sport.key as string, name: sport.name as string, events: competitions.reduce((sum: number, item: { events: number }) => sum + item.events, 0), competitions }
  }) as Array<{ key: string; name: string; events: number; competitions: Array<{ name: string; events: number }> }>
})

export const findPublishedSport = cache(async function (sportKey: string) {
  const tenant = await tenantId()
  if (!tenant) return null
  const prisma: any = keystoneContext.prisma
  const match = await prisma.sport.findFirst({ where: { tenantId: tenant, active: true, key: sportKey }, select: { name: true } })
  return match ? { name: match.name as string } : null
})
