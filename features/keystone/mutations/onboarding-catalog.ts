import { randomUUID } from 'node:crypto'
import onboardingSeed from '../../platform/onboarding/lib/seed.json'
import { evidenceHash } from '../../sportsbook/domain/engine'
import { assertMarketFirstOpenAllowed, AWAITING_PRICES } from '../../sportsbook/domain/trading-eligibility'

type SeedSelection = { key: string; label: string; odds: string }
type SeedMarket = { definition: string; name: string; line?: string; selections: SeedSelection[] }
type SeedEvent = { key: string; name: string; startsInDays: number; startTimeUtc: string; markets: SeedMarket[] }
type SeedCompetition = { key: string; name: string; season: { key: string; name: string }; events: SeedEvent[] }
type SeedSport = { key: string; name: string; competitions: SeedCompetition[] }
type AuditWriter = (tx: any, tenantId: string, actorId: string, action: string, targetType: string, targetId: string, reason: string, payload: unknown) => Promise<unknown>

export const onboardingCatalog = onboardingSeed.catalog as { region: { key: string; name: string; countryCodes: string[] }; sports: SeedSport[] }

const ODDS = /^\d{1,4}(\.\d{1,4})?$/

/** Validates the bundled demo catalog before anything is written, so a bad seed fails closed. */
export function assertOnboardingCatalog() {
  for (const sport of onboardingCatalog.sports) for (const competition of sport.competitions) for (const event of competition.events) {
    if (!/^[a-z0-9-]+$/.test(event.key) || !/^\d{2}:\d{2}$/.test(event.startTimeUtc) || !(event.startsInDays >= 1)) throw new Error('INVALID_ONBOARDING_CATALOG')
    for (const market of event.markets) {
      if (market.selections.length < 2 || new Set(market.selections.map(selection => selection.key)).size !== market.selections.length) throw new Error('INVALID_ONBOARDING_CATALOG')
      if (market.selections.some(selection => !ODDS.test(selection.odds) || Number(selection.odds) <= 1)) throw new Error('INVALID_ONBOARDING_CATALOG')
    }
  }
}

/**
 * Catalog roots for the onboarding CATALOG stage: region, sports, competitions and seasons, find-or-create by key
 * inside the onboarding transaction (a resume never duplicates them).
 */
export async function ensureOnboardingCatalogRoots(tx: any, tenantId: string, timezone: string) {
  const { region: seedRegion, sports } = onboardingCatalog
  const region = (await tx.region.findFirst({ where: { tenantId, key: seedRegion.key } })) ?? await tx.region.create({ data: { tenantId, key: seedRegion.key, name: seedRegion.name, countryCodes: seedRegion.countryCodes, status: 'ACTIVE' } })
  for (const seedSport of sports) {
    const sport = (await tx.sport.findFirst({ where: { tenantId, key: seedSport.key } })) ?? await tx.sport.create({ data: { tenantId, key: seedSport.key, name: seedSport.name, active: true } })
    for (const seedCompetition of seedSport.competitions) {
      const competition = (await tx.competition.findFirst({ where: { tenantId, key: seedCompetition.key } })) ?? await tx.competition.create({ data: { tenantId, sportId: sport.id, regionId: region.id, key: seedCompetition.key, name: seedCompetition.name, timezone, status: 'ACTIVE' } })
      if (!await tx.season.findFirst({ where: { tenantId, competitionId: competition.id, key: seedCompetition.season.key } })) {
        await tx.season.create({ data: { tenantId, competitionId: competition.id, key: seedCompetition.season.key, name: seedCompetition.season.name, startsAt: new Date(Date.now() - 30 * 86_400_000), endsAt: new Date(Date.now() + 180 * 86_400_000), status: 'ACTIVE' } })
      }
    }
  }
}

function eventStart(event: SeedEvent) {
  const [hours, minutes] = event.startTimeUtc.split(':').map(Number)
  const start = new Date()
  start.setUTCDate(start.getUTCDate() + event.startsInDays)
  start.setUTCHours(hours, minutes, 0, 0)
  return start
}

/**
 * Demo fixtures for the onboarded book: each event with its markets, selections and opening prices is written in
 * its own transaction through the sandbox sports feed (raw envelope + price snapshot), the same records a trader's
 * pricing produces. Markets are born suspended awaiting prices, exactly like operator-created events. They open
 * only when the onboarding operator also holds trading authority, through the same first-open guard a trader
 * uses; otherwise they stay suspended for a trader to open. Existing events (matched by external key) are kept.
 */
export async function ensureOnboardingCatalogEvents(prisma: any, tenantId: string, actorId: string, appendAudit: AuditWriter) {
  let created = 0
  for (const seedSport of onboardingCatalog.sports) for (const seedCompetition of seedSport.competitions) for (const seedEvent of seedCompetition.events) {
    const externalKey = `onboarding:${seedEvent.key}`
    const made = await prisma.$transaction(async (tx: any) => {
      if (await tx.event.findFirst({ where: { tenantId, externalKey }, select: { id: true } })) return false
      const actor = await tx.user.findUnique({ where: { id: actorId }, include: { role: true } })
      if (!actor?.role?.canManageOnboarding || actor.tenantId !== tenantId) throw new Error('Not found')
      const canOpen = actor.role.canTrade === true
      const competition = await tx.competition.findFirst({ where: { tenantId, key: seedCompetition.key } })
      const season = competition ? await tx.season.findFirst({ where: { tenantId, competitionId: competition.id, key: seedCompetition.season.key } }) : null
      const provider = await tx.providerConnection.findFirst({ where: { tenantId, adapterId: 'sandbox-sports', certificationStatus: 'SANDBOX', status: 'ACTIVE' } })
      if (!competition || !provider) throw new Error('ONBOARDING_CATALOG_ROOTS_MISSING')
      const now = new Date()
      const event = await tx.event.create({ data: { tenantId, competitionId: competition.id, seasonId: season?.id ?? null, externalKey, name: seedEvent.name, startAt: eventStart(seedEvent), status: 'SCHEDULED', version: 1 } })
      const marketIds: string[] = []
      for (const seedMarket of seedEvent.markets) {
        const definition = await tx.marketDefinition.findFirst({ where: { tenantId, key: seedMarket.definition, status: 'ACTIVE' }, orderBy: { version: 'desc' } })
        if (!definition) throw new Error('MARKET_DEFINITION_NOT_ACTIVE')
        const line = seedMarket.line ?? ''
        const market = await tx.market.create({ data: { tenantId, eventId: event.id, definitionId: definition.id, definitionKey: definition.key, parameters: line ? { name: seedMarket.name, line } : { name: seedMarket.name }, line, tradingMode: 'PREMATCH', cashOutEnabled: true, status: 'SUSPENDED', version: 1 } })
        await tx.tradingStatusChange.create({ data: { tenantId, scopeType: 'MARKET', scopeId: market.id, fromStatus: AWAITING_PRICES, toStatus: 'SUSPENDED', reason: 'Awaiting prices', source: 'CATALOG', actorId, effectiveAt: now } })
        for (const seedSelection of seedMarket.selections) {
          const selection = await tx.selection.create({ data: { tenantId, marketId: market.id, key: seedSelection.key, label: seedSelection.label, status: 'OPEN' } })
          const payload = { source: 'ONBOARDING_SEED', marketId: market.id, selectionId: selection.id, decimalOdds: seedSelection.odds, line, sequence: '1', actorId }
          const envelope = await tx.rawEnvelope.create({ data: { tenantId, providerConnectionId: provider.id, direction: 'INBOUND', externalId: `onboarding:${randomUUID()}`, schemaVersion: 'sandbox.v1', payload, payloadHash: evidenceHash(payload), receivedAt: now } })
          await tx.priceSnapshot.create({ data: { tenantId, selectionId: selection.id, providerConnectionId: provider.id, decimalOdds: seedSelection.odds, line, sequence: '1', effectiveAt: now, receivedAt: now, rawEnvelopeId: envelope.id, status: 'OPEN' } })
        }
        if (canOpen) {
          assertMarketFirstOpenAllowed({ eventStatus: event.status, createdAwaitingPrices: true, everOpened: false, unpricedSelections: 0, selections: seedMarket.selections.length })
          const opened = await tx.market.updateMany({ where: { id: market.id, tenantId, status: 'SUSPENDED', version: 1 }, data: { status: 'OPEN', version: 2 } })
          if (opened.count !== 1) throw new Error('STALE_MARKET_STATE')
          await tx.tradingStatusChange.create({ data: { tenantId, scopeType: 'MARKET', scopeId: market.id, fromStatus: 'SUSPENDED', toStatus: 'OPEN', reason: 'Opening prices set during onboarding', source: 'OPERATOR', actorId, effectiveAt: now } })
        }
        marketIds.push(market.id)
      }
      await appendAudit(tx, tenantId, actorId, 'catalog.event_created', 'Event', event.id, 'SANDBOX_ONBOARDING', { competitionId: competition.id, externalKey, marketIds, opened: canOpen })
      return true
    })
    if (made) created++
  }
  return created
}
