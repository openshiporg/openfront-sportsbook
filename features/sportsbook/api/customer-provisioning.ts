import { resolvePublicBrand, resolvePublicTenant } from './public-tenant'
import { resolveTenantCurrency } from '../customer/currency'

// Internal-only. Public customer routes derive ownership from an opaque CustomerSession and never accept
// this subject from a caller.
const findOrCreate = async (find: () => Promise<any>, create: () => Promise<any>) => (await find()) ?? create()

/**
 * Customer account provisioning inside the caller's registration transaction: the player row and the wallet
 * ledger accounts with zero balances. Identity (age/KYC) and location are NOT decided here: the player starts
 * REQUIRED and passes the in-flow verification step before any wager or deposit is accepted.
 */
export async function provisionCustomerInTransaction(tx: any, subject: string) {
  if (!/^[a-zA-Z0-9@._-]{3,128}$/.test(subject)) throw new Error('INVALID_SUBJECT')
  const tenant = await resolvePublicTenant(tx)
  const brand = await resolvePublicBrand(tx, tenant.id)
  const currency = (await resolveTenantCurrency(tx, tenant.id)).code

  const player = await findOrCreate(
    () => tx.player.findFirst({ where: { tenantId: tenant.id, subject } }),
    () => tx.player.create({ data: { tenantId: tenant.id, brandId: brand.id, subject, status: 'ACTIVE', kycStatus: 'REQUIRED', locale: 'en', riskBand: 'LOW' } }),
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
    projection = await tx.balanceProjection.create({ data: { tenantId: tenant.id, accountId: cash.id, postedMinor: '0', pendingMinor: '0', availableMinor: '0', version: 1, asOf: new Date() } })
  }
  if (!await tx.balanceProjection.findFirst({ where: { tenantId: tenant.id, accountId: bonus.id } })) {
    await tx.balanceProjection.create({ data: { tenantId: tenant.id, accountId: bonus.id, postedMinor: '0', pendingMinor: '0', availableMinor: '0', version: 1, asOf: new Date() } })
  }

  return { tenant, brand, player, cash, projection, currency }
}
