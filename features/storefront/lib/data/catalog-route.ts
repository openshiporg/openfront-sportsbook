import { cache } from 'react'
import { keystoneContext } from '@/features/keystone/context'
import { resolveSandboxTenant } from '@/features/sportsbook/api/sandbox-tenant'
import { PUBLIC_EVENT_STATUSES } from '@/features/sportsbook/customer/catalog'

/**
 * Route lookups for the storefront's catalog pages: a slug only renders when it names a record the operator has
 * published (same published rules as the catalog read). No operator, or no match, is a 404.
 */
async function tenantId() {
  try {
    return (await resolveSandboxTenant(keystoneContext.prisma)).id as string
  } catch {
    return null
  }
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
