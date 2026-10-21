import { evidenceHash } from '../domain/engine'
import { sportsbookResolvers } from '../../keystone/mutations/sportsbook'
import { assertSandboxRuntime } from './sandbox-policy'
import { resolveSandboxBrand, resolveSandboxTenant } from './sandbox-tenant'
import { isRetryableTransactionError, transactionBackoff } from '../domain/transaction'
import { resolveTenantCurrency } from '../customer/currency'
import { assertEventAllowsNewMarket } from '../domain/trading-eligibility'

// These helpers are internal-only. Public customer routes derive ownership from an
// opaque CustomerSession and never accept this subject from a caller.
type Prisma = any
const findOrCreate = async (find: () => Promise<any>, create: () => Promise<any>) =>
  (await find()) ?? create()
const serializable = async (prisma: Prisma, work: (tx: any) => Promise<any>) => {
  for (let attempt = 0; ; attempt++) {
    try { return await prisma.$transaction(work, { isolationLevel: 'Serializable' }) }
    catch (error) {
      if (attempt >= 9 || !isRetryableTransactionError(error)) throw error
      await transactionBackoff(attempt)
    }
  }
}

export async function provisionSandbox(prisma: Prisma, subject: string) {
  return serializable(prisma, (tx: any) => provisionSandboxInTransaction(tx, subject))
}

/** Same provisioning inside a caller-owned transaction, so registration commits it atomically with the credential. */
export async function provisionSandboxInTransaction(tx: any, subject: string) {
  assertSandboxRuntime()
  if (!/^[a-zA-Z0-9@._-]{3,128}$/.test(subject)) throw new Error('INVALID_SUBJECT')

  {
    const tenant = await resolveSandboxTenant(tx)
    const brand = await resolveSandboxBrand(tx, tenant.id)
    const walletCurrency = await resolveTenantCurrency(tx, tenant.id)
    const currency = walletCurrency.code

    const providers: Record<string, any> = {}
    for (const kind of ['sports', 'results', 'kyc', 'aml', 'geo', 'payments', 'messaging', 'analytics', 'tax', 'reporting', 'integrity', 'affiliates', 'pam'] as const) {
      providers[kind] = await findOrCreate(
        () => tx.providerConnection.findFirst({ where: { tenantId: tenant.id, adapterId: `sandbox-${kind}` } }),
        () => tx.providerConnection.create({
          data: {
            tenantId: tenant.id,
            adapterId: `sandbox-${kind}`,
            adapterVersion: '1.0.0',
            configReference: `sandbox:${kind}`,
            capabilities: { kind, mode: 'sandbox' },
            certificationStatus: 'SANDBOX',
            status: 'ACTIVE',
          },
        }),
      )
    }

    const player = await findOrCreate(
      () => tx.player.findFirst({ where: { tenantId: tenant.id, subject } }),
      () => tx.player.create({ data: { tenantId: tenant.id, brandId: brand.id, subject, status: 'ACTIVE', kycStatus: 'APPROVED', locale: 'en', riskBand: 'LOW' } }),
    )

    const account = async (key: string, accountClass: string, playerId: string | null = null) => findOrCreate(
      () => tx.ledgerAccount.findFirst({ where: { tenantId: tenant.id, key, currency, playerId } }),
      () => tx.ledgerAccount.create({ data: { tenantId: tenant.id, key, currency, accountClass, status: 'ACTIVE', playerId } }),
    )
    const cash = await account('PLAYER_CASH', 'LIABILITY', player.id)
    const bonus = await account('PLAYER_BONUS', 'LIABILITY', player.id)
    await account('WAGERS_PENDING', 'LIABILITY')
    await account('GAMING_REVENUE', 'REVENUE')
    await account('WINNINGS_EXPENSE', 'EXPENSE')
    await account('BONUS_EXPENSE', 'EXPENSE')
    await account('CHARGEBACK_LOSS', 'EXPENSE')
    await account('TAX_EXPENSE', 'EXPENSE')
    await account('TAX_PAYABLE', 'LIABILITY')
    await account('PAYMENT_CLEARING', 'ASSET')

    let projection = await tx.balanceProjection.findFirst({ where: { tenantId: tenant.id, accountId: cash.id }, orderBy: { version: 'desc' } })
    if (!projection) {
      projection = await tx.balanceProjection.create({
        data: { tenantId: tenant.id, accountId: cash.id, postedMinor: '0', pendingMinor: '0', availableMinor: '0', version: 1, asOf: new Date() },
      })
    }

    if (!await tx.balanceProjection.findFirst({ where: { tenantId: tenant.id, accountId: bonus.id } })) {
      await tx.balanceProjection.create({ data: { tenantId: tenant.id, accountId: bonus.id, postedMinor: '0', pendingMinor: '0', availableMinor: '0', version: 1, asOf: new Date() } })
    }

    const verificationCase = await findOrCreate(
      () => tx.verificationCase.findFirst({ where: { tenantId: tenant.id, playerId: player.id, type: 'KYC' } }),
      () => tx.verificationCase.create({ data: { tenantId: tenant.id, playerId: player.id, providerConnectionId: providers.kyc.id, type: 'KYC', status: 'APPROVED', evidenceReference: `sandbox:${player.id}` } }),
    )
    await findOrCreate(
      () => tx.verificationCheck.findFirst({ where: { tenantId: tenant.id, verificationCaseId: verificationCase.id, decision: 'PASS' } }),
      () => tx.verificationCheck.create({ data: { tenantId: tenant.id, verificationCaseId: verificationCase.id, attempt: 1, decision: 'PASS', reasonCode: 'SANDBOX_APPROVED' } }),
    )

    const geoSession = await findOrCreate(
      () => tx.geoSession.findFirst({ where: { tenantId: tenant.id, playerId: player.id, status: 'ACTIVE' } }),
      () => tx.geoSession.create({ data: { tenantId: tenant.id, playerId: player.id, sessionKey: `sandbox:${player.id}`, status: 'ACTIVE', expiresAt: new Date(Date.now() + 86_400_000) } }),
    )
    await findOrCreate(
      () => tx.geoCheck.findFirst({ where: { tenantId: tenant.id, geoSessionId: geoSession.id, decision: 'ALLOW' } }),
      () => tx.geoCheck.create({ data: { tenantId: tenant.id, geoSessionId: geoSession.id, providerConnectionId: providers.geo.id, decision: 'ALLOW', reasonCode: 'SANDBOX', coarseEvidence: { mode: 'sandbox' }, checkedAt: new Date() } }),
    )

    // Retained as a narrow internal compatibility fixture for backend tests.
    const sport = await findOrCreate(
      () => tx.sport.findFirst({ where: { tenantId: tenant.id, key: 'football' } }),
      () => tx.sport.create({ data: { tenantId: tenant.id, key: 'football', name: 'Football', active: true } }),
    )
    const competition = await findOrCreate(
      () => tx.competition.findFirst({ where: { tenantId: tenant.id, key: 'sandbox-league' } }),
      () => tx.competition.create({ data: { tenantId: tenant.id, sportId: sport.id, key: 'sandbox-league', name: 'Sandbox League' } }),
    )
    const event = await findOrCreate(
      () => tx.event.findFirst({ where: { tenantId: tenant.id, externalKey: 'sandbox-event' } }),
      () => tx.event.create({ data: { tenantId: tenant.id, competitionId: competition.id, externalKey: 'sandbox-event', name: 'Sandbox FC v Test United', startAt: new Date(Date.now() + 86_400_000), status: 'SCHEDULED', version: 1 } }),
    )
    assertEventAllowsNewMarket(event.status)
    const market = await findOrCreate(
      () => tx.market.findFirst({ where: { tenantId: tenant.id, eventId: event.id, definitionKey: 'match-winner' } }),
      () => tx.market.create({ data: { tenantId: tenant.id, eventId: event.id, definitionKey: 'match-winner', parameters: { name: 'Match result' }, status: 'OPEN', version: 1 } }),
    )
    const selection = await findOrCreate(
      () => tx.selection.findFirst({ where: { tenantId: tenant.id, marketId: market.id, key: 'home' } }),
      () => tx.selection.create({ data: { tenantId: tenant.id, marketId: market.id, key: 'home', label: 'Sandbox FC', status: 'OPEN' } }),
    )

    return { tenant, brand, player, cash, projection, selection, providers, currency }
  }
}

export async function placeSandboxWager(prisma: Prisma, input: { subject: string; stakeMinor: string; idempotencyKey: string }) {
  const p = await provisionSandbox(prisma, input.subject)
  const stake = BigInt(input.stakeMinor)
  if (stake <= 0n || stake > 100000n) throw new Error('INVALID_STAKE')
  if (!/^[A-Za-z0-9:_-]{8,128}$/.test(input.idempotencyKey)) throw new Error('INVALID_IDEMPOTENCY_KEY')
  const prior = await prisma.wager.findFirst({ where: { tenantId: p.tenant.id, idempotencyKey: input.idempotencyKey }, include: { quote: true } })
  if (prior) {
    if (prior.playerId !== p.player.id || prior.quote.stakeMinor !== String(stake)) throw new Error('IDEMPOTENCY_KEY_CONFLICT')
    return { accepted: prior.status !== 'REJECTED', wagerId: prior.id, rejectionCode: prior.status === 'REJECTED' ? 'PREVIOUSLY_REJECTED' : null, termsHash: prior.termsHash, potentialReturnMinor: prior.potentialReturnMinor }
  }
  const snapshot = await prisma.priceSnapshot.create({ data: { tenantId: p.tenant.id, selectionId: p.selection.id, providerConnectionId:p.providers.sports.id, decimalOdds: '2.50', sequence: `sandbox:${input.idempotencyKey}`, effectiveAt: new Date(), receivedAt: new Date(), status: 'OPEN' } })
  const quote = await prisma.quote.create({ data: { tenantId: p.tenant.id, playerId: p.player.id, selectionId: p.selection.id, priceSnapshotId: snapshot.id, stakeMinor: String(stake), currency: p.currency, decimalOdds: '2.50', expiresAt: new Date(Date.now() + 60_000), termsHash: evidenceHash({ snapshotId: snapshot.id, stake: String(stake) }), policyVersion: 'sandbox-v1' } })
  return sportsbookResolvers.Mutation.acceptStraightWager(null, { quoteId: quote.id, idempotencyKey: input.idempotencyKey }, {prisma,trustedTenantId:p.tenant.id,trustedActorId:p.player.id,trustedCapabilities:['canManageSportsbook']})
}
