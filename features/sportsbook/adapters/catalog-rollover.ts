import { randomUUID } from 'node:crypto'
import { sweepExpiredStates } from '../domain/expiry-sweep'

import { evidenceHash } from '../domain/engine'
import { onboardingCatalog, writeSeedEvent } from '../../keystone/mutations/onboarding-catalog'
import { appendChainedAudit } from '../domain/audit-chain'
import { runWithTenantScope } from '../../keystone/tenant-scope'

// The house trading desk's standing slate: until the operator contracts a licensed data feed, the board keeps the
// operator's catalog fixtures scheduled ahead so customers always see the coming slate.
// - Each catalog fixture is kept scheduled ahead as a new house event (`feed:<fixture>:<date>`) once the previous
//   one has started. Seed and operator events are never modified.
// - Pre-match prices on house events are re-issued at the same odds before they pass the 24h freshness limit.
// Only tenants whose house sports installation is ACTIVE are rolled forward.

export const FEED_ACTOR = 'house-trading-desk'
const REFRESH_AFTER_MS = 12 * 60 * 60_000
const DAY_MS = 86_400_000

export function nextFixtureStart(startsInDays: number, startTimeUtc: string, now: Date) {
  const [hours, minutes] = startTimeUtc.split(':').map(Number)
  const start = new Date(now)
  start.setUTCDate(start.getUTCDate() + Math.max(1, startsInDays))
  start.setUTCHours(hours, minutes, 0, 0)
  return start
}

async function feedTenant(prisma: any, tenantId: string, now: Date) {
  let created = 0
  let refreshed = 0
  for (const sport of onboardingCatalog.sports) for (const competition of sport.competitions) for (const fixture of competition.events) {
    const upcoming = await prisma.event.findFirst({
      where: { tenantId, status: { in: ['SCHEDULED', 'LIVE'] }, startAt: { gt: now }, OR: [{ externalKey: `onboarding:${fixture.key}` }, { externalKey: { startsWith: `feed:${fixture.key}:` } }] },
      select: { id: true },
    })
    if (upcoming) continue
    const startAt = nextFixtureStart(fixture.startsInDays, fixture.startTimeUtc, now)
    const externalKey = `feed:${fixture.key}:${startAt.toISOString().slice(0, 10)}`
    const made = await prisma.$transaction(async (tx: any) => {
      if (await tx.event.findFirst({ where: { tenantId, externalKey }, select: { id: true } })) return false
      await writeSeedEvent(tx, { tenantId, actorId: FEED_ACTOR, seedCompetition: competition, seedEvent: fixture, externalKey, startAt, canOpen: true, source: 'FEED', reason: 'Opening prices from the house trading desk', auditReason: 'HOUSE_SLATE' }, appendChainedAudit)
      return true
    })
    if (made) created++
  }
  const markets = await prisma.market.findMany({
    where: { tenantId, status: 'OPEN', tradingMode: 'PREMATCH', event: { status: 'SCHEDULED', startAt: { gt: now, lt: new Date(now.getTime() + 8 * DAY_MS) }, externalKey: { startsWith: 'feed:' } } },
    select: { id: true, from_Selection_market: { where: { status: 'OPEN' }, select: { id: true } } },
    take: 200,
  })
  const provider = await prisma.providerConnection.findFirst({ where: { tenantId, adapterId: 'house-sports', certificationStatus: 'INTERNAL', status: 'ACTIVE' }, select: { id: true } })
  if (!provider) return { created, refreshed }
  for (const market of markets) for (const selection of market.from_Selection_market) {
    const latest = await prisma.priceSnapshot.findFirst({ where: { tenantId, selectionId: selection.id, status: 'OPEN' }, orderBy: [{ receivedAt: 'desc' }, { id: 'desc' }], select: { decimalOdds: true, line: true, sequence: true, receivedAt: true } })
    if (!latest || now.getTime() - latest.receivedAt.getTime() < REFRESH_AFTER_MS) continue
    const sequence = String((Number.parseInt(latest.sequence, 10) || 0) + 1)
    const payload = { source: 'HOUSE_SLATE', marketId: market.id, selectionId: selection.id, decimalOdds: String(latest.decimalOdds), line: latest.line, sequence, actorId: FEED_ACTOR }
    try {
      await prisma.$transaction(async (tx: any) => {
        const envelope = await tx.rawEnvelope.create({ data: { tenantId, providerConnectionId: provider.id, direction: 'INBOUND', externalId: `feed:${randomUUID()}`, schemaVersion: 'house.v1', payload, payloadHash: evidenceHash(payload), receivedAt: now } })
        await tx.priceSnapshot.create({ data: { tenantId, selectionId: selection.id, providerConnectionId: provider.id, decimalOdds: latest.decimalOdds, line: latest.line, sequence, effectiveAt: now, receivedAt: now, rawEnvelopeId: envelope.id, status: 'OPEN' } })
      })
      refreshed++
    } catch {
      // A concurrent replica issued this sequence first (unique tenant/selection/sequence); nothing to do.
    }
  }
  return { created, refreshed }
}

export async function runCatalogRollover(prisma: any, now = new Date()) {
  const tenants: { id: string }[] = await prisma.tenant.findMany({ where: { status: 'ACTIVE' }, select: { id: true }, orderBy: { id: 'asc' }, take: 500 })
  const results: Record<string, unknown> = {}
  for (const { id: tenantId } of tenants) {
    try {
      results[tenantId] = await runWithTenantScope(tenantId, async () => {
        // Roll forward only books that finished onboarding (house sports installation active, catalog roots present).
        const provider = await prisma.providerConnection.findFirst({ where: { tenantId, adapterId: 'house-sports', certificationStatus: 'INTERNAL', status: 'ACTIVE' }, select: { id: true } })
        const competition = provider ? await prisma.competition.findFirst({ where: { tenantId }, select: { id: true } }) : null
        return competition ? feedTenant(prisma, tenantId, now) : { skipped: true }
      })
    } catch (error) {
      results[tenantId] = { error: error instanceof Error ? error.message : String(error) }
    }
  }
  return results
}

const ADVANCE_EVERY_MS = 10 * 60_000
let lastAdvance = 0
let advancing: Promise<void> | null = null

/**
 * Clock-driven state, advanced by the request that reads the board (no timer, no worker): the fixture feed
 * keeps the slate stocked and lapsed slips/overrides/approvals/exclusions get their stored status. Every step is an
 * idempotent compare-and-set, so concurrent requests or replicas cannot double-apply it. At most one pass per interval per process.
 */
export function advanceOperatorClock(prisma: any, now = new Date()): Promise<void> {
  if (advancing) return advancing
  if (now.getTime() - lastAdvance < ADVANCE_EVERY_MS) return Promise.resolve()
  lastAdvance = now.getTime()
  advancing = (async () => {
    try {
      await runCatalogRollover(prisma, now)
      const tenants: { id: string }[] = await prisma.tenant.findMany({ where: { status: 'ACTIVE' }, select: { id: true }, orderBy: { id: 'asc' }, take: 500 })
      for (const { id: tenantId } of tenants) {
        await runWithTenantScope(tenantId, () => prisma.$transaction((tx: any) => sweepExpiredStates(tx, tenantId, now)))
      }
    } catch (error) {
      lastAdvance = 0
      console.error('operator clock advance failed', error instanceof Error ? error.message : error)
    } finally {
      advancing = null
    }
  })()
  return advancing
}
