import type { PrismaClient } from '../../keystone/prisma'
import type { CatalogEvent, CatalogFilters, CatalogResponse } from './contracts'
import { CustomerError, assertSandboxEnabled } from './errors'
import { resolveSandboxTenant } from '../api/sandbox-tenant'
import { resolveTenantCurrency } from './currency'

const MAX_PRICE_AGE_MS = () => Number(process.env.MAX_PRICE_AGE_MS ?? 30_000)
const PUBLIC_EVENT_STATUSES = ['SCHEDULED', 'LIVE', 'SUSPENDED'] as const
const DEFAULT_PAGE_SIZE = 20
const MAX_PAGE_SIZE = 50
const MAX_FILTER_IDS = 100

function eventState(status: string): CatalogEvent['state'] {
  if (status === 'SCHEDULED' || status === 'LIVE' || status === 'SUSPENDED') return status
  return 'CLOSED'
}

const text = (value: unknown, max = 120) => typeof value === 'string' ? value.trim().slice(0, max) : ''

/** Parse untrusted query parameters into bounded catalog filters. */
export function parseCatalogFilters(params: URLSearchParams): CatalogFilters {
  const limit = Number(params.get('limit') ?? DEFAULT_PAGE_SIZE)
  const ids = (params.get('ids') ?? '').split(',').map(id => id.trim()).filter(id => /^[A-Za-z0-9_-]{1,64}$/.test(id))
  if (ids.length > MAX_FILTER_IDS) throw new CustomerError('INVALID_CATALOG_FILTER', 400)
  const cursor = text(params.get('cursor'), 64)
  if (cursor && !/^[A-Za-z0-9_-]+$/.test(cursor)) throw new CustomerError('INVALID_CATALOG_FILTER', 400)
  return {
    sport: text(params.get('sport'), 64) || undefined,
    competition: text(params.get('competition')) || undefined,
    eventId: text(params.get('event'), 64) || undefined,
    query: text(params.get('q')) || undefined,
    live: params.get('live') === '1',
    ids: params.has('ids') ? ids : undefined,
    cursor: cursor || undefined,
    limit: Number.isInteger(limit) && limit >= 1 ? Math.min(limit, MAX_PAGE_SIZE) : DEFAULT_PAGE_SIZE,
  }
}

/**
 * Public catalog read. It only projects persisted, operator-published records: it never provisions fixtures,
 * renews price observations or moves event schedules. Every filter is applied in the database before the page
 * limit, children are complete for the returned page and each selection carries its own latest price.
 */
export async function getSandboxCatalog(prisma: PrismaClient, filters: CatalogFilters = {}): Promise<CatalogResponse> {
  assertSandboxEnabled()
  const tenant = await resolveSandboxTenant(prisma)
  const tenantId: string = tenant.id
  const currency = (await resolveTenantCurrency(prisma, tenantId)).code
  const now = new Date()
  const limit = filters.limit ?? DEFAULT_PAGE_SIZE
  const insensitive = 'insensitive' as const
  const published: any = {
    tenantId,
    status: { in: [...PUBLIC_EVENT_STATUSES] },
    competition: { is: { tenantId, status: 'ACTIVE', sport: { is: { tenantId, active: true } } } },
  }
  const where: any = { AND: [published] }
  if (filters.eventId) where.AND.push({ id: filters.eventId })
  if (filters.ids) where.AND.push({ id: { in: filters.ids } })
  if (filters.live) where.AND.push({ status: 'LIVE' })
  if (filters.sport) where.AND.push({ competition: { is: { sport: { is: { key: filters.sport } } } } })
  if (filters.competition) where.AND.push({ OR: [{ competitionId: filters.competition }, { competition: { is: { name: filters.competition } } }] })
  if (filters.query) where.AND.push({ OR: [
    { name: { contains: filters.query, mode: insensitive } },
    { competition: { is: { name: { contains: filters.query, mode: insensitive } } } },
    { competition: { is: { sport: { is: { name: { contains: filters.query, mode: insensitive } } } } } },
    { from_Market_event: { some: { from_Selection_market: { some: { label: { contains: filters.query, mode: insensitive } } } } } },
  ] })

  const [page, total, liveCount, competitions] = await Promise.all([
    prisma.event.findMany({
      where,
      include: { competition: { include: { sport: true } } },
      orderBy: [{ startAt: 'asc' }, { id: 'asc' }],
      take: limit + 1,
      ...(filters.cursor ? { cursor: { id: filters.cursor }, skip: 1 } : {}),
    }),
    prisma.event.count({ where }),
    prisma.event.count({ where: { AND: [published, { status: 'LIVE' }] } }),
    prisma.competition.findMany({
      where: { tenantId, status: 'ACTIVE', sport: { is: { tenantId, active: true } }, from_Event_competition: { some: published } },
      include: { sport: true },
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
      take: 200,
    }),
  ])
  if (filters.cursor && !(await prisma.event.findFirst({ where: { AND: [where, { id: filters.cursor }] }, select: { id: true } }))) {
    throw new CustomerError('INVALID_CATALOG_CURSOR', 400)
  }
  const events = page.slice(0, limit)
  const markets = events.length ? await prisma.market.findMany({ where: { tenantId, eventId: { in: events.map(event => event.id) } }, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }] }) : []
  const selections = markets.length ? await prisma.selection.findMany({ where: { tenantId, marketId: { in: markets.map(market => market.id) } }, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }] }) : []
  // One latest snapshot per selection: a busy selection's history can never crowd out another selection's price.
  const snapshots = selections.length ? await prisma.priceSnapshot.findMany({
    where: { tenantId, selectionId: { in: selections.map(selection => selection.id) } },
    orderBy: [{ selectionId: 'asc' }, { receivedAt: 'desc' }, { id: 'desc' }],
    distinct: ['selectionId'],
  }) : []
  const latestBySelection = new Map<string, (typeof snapshots)[number]>()
  for (const snapshot of snapshots) if (snapshot.selectionId) latestBySelection.set(snapshot.selectionId, snapshot)

  const sports = new Map<string, { key: string; name: string }>()
  for (const competition of competitions) if (competition.sport?.key) sports.set(competition.sport.key, { key: competition.sport.key, name: competition.sport.name })

  return {
    mode: 'sandbox',
    currency,
    generatedAt: now.toISOString(),
    total,
    liveCount,
    nextCursor: page.length > limit ? events[events.length - 1]?.id ?? null : null,
    facets: {
      sports: [...sports.values()],
      competitions: competitions.map(competition => ({ id: competition.id, name: competition.name, sportKey: competition.sport?.key ?? '' })),
    },
    events: events.map(event => ({
      eventId: event.id,
      sportKey: event.competition?.sport?.key ?? 'unknown',
      sportName: event.competition?.sport?.name ?? 'Sport',
      competitionId: event.competition?.id ?? '',
      competition: event.competition?.name ?? 'Competition',
      name: event.name,
      startsAt: event.startAt.toISOString(),
      state: eventState(event.status ?? 'CLOSED'),
      ...(event.livePhase ? { livePhase: event.livePhase } : {}),
      clockSeconds: event.clockSeconds,
      markets: markets.filter(market => market.eventId === event.id).map(market => ({
        marketId: market.id,
        name: typeof market.parameters === 'object' && market.parameters && 'name' in market.parameters ? String(market.parameters.name) : market.definitionKey,
        state: market.status === 'OPEN' || market.status === 'SUSPENDED' ? market.status : 'CLOSED',
        selections: selections.filter(selection => selection.marketId === market.id).map(selection => {
          const snapshot = latestBySelection.get(selection.id)
          const stale = !snapshot || now.getTime() - snapshot.receivedAt.getTime() > MAX_PRICE_AGE_MS()
          const state = selection.status !== 'OPEN'
            ? selection.status === 'SUSPENDED' ? 'SUSPENDED' as const : 'CLOSED' as const
            : snapshot?.status !== 'OPEN' ? 'SUSPENDED' as const
            : stale ? 'STALE' as const : 'OPEN' as const
          return {
            selectionId: selection.id,
            priceSnapshotId: snapshot?.id ?? '',
            label: selection.label,
            decimalOdds: snapshot?.decimalOdds ?? '',
            state,
            priceIssuedAt: snapshot?.receivedAt.toISOString() ?? null,
          }
        }),
      })),
    })),
  }
}

export async function loadQuoteCandidate(prisma: PrismaClient, tenantId: string, selectionId: string) {
  const selection = await prisma.selection.findFirst({
    where: { id: selectionId, tenantId },
    include: { market: { include: { event: true } } },
  })
  if (!selection?.market?.event) throw new CustomerError('SELECTION_NOT_FOUND', 404)
  if (selection.market.event.status === 'SUSPENDED' || selection.market.status === 'SUSPENDED' || selection.status === 'SUSPENDED') {
    throw new CustomerError('SELECTION_SUSPENDED', 409, { state: 'SUSPENDED' })
  }
  if (selection.market.status !== 'OPEN' || selection.status !== 'OPEN' || !['SCHEDULED', 'LIVE'].includes(selection.market.event.status ?? '')) {
    throw new CustomerError('SELECTION_CLOSED', 409, { state: 'SUSPENDED' })
  }

  const snapshot = await prisma.priceSnapshot.findFirst({ where: { tenantId, selectionId, status: 'OPEN' }, orderBy: { receivedAt: 'desc' } })
  if (!snapshot) throw new CustomerError('PRICE_UNAVAILABLE', 409, { state: 'SUSPENDED' })
  if (Date.now() - snapshot.receivedAt.getTime() > MAX_PRICE_AGE_MS()) {
    throw new CustomerError('STALE_PRICE', 409, { state: 'REQUOTE_REQUIRED' })
  }

  const marketName = typeof selection.market.parameters === 'object' && selection.market.parameters && 'name' in selection.market.parameters
    ? String(selection.market.parameters.name)
    : selection.market.definitionKey
  return { selection, market: selection.market, event: selection.market.event, snapshot, marketName }
}
