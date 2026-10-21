import type { PrismaClient } from '../../keystone/prisma'
import { CustomerError } from './errors'

export type CurrencyOperation = 'WAGER' | 'DEPOSIT' | 'WITHDRAWAL'
export type TenantCurrencySelection = { code: string; exponent: number; depositsEnabled: boolean; withdrawalsEnabled: boolean; wageringEnabled: boolean }

/**
 * The wallet currency is the tenant's single ACTIVE default TenantCurrency whose CurrencyDefinition is
 * ACTIVE, with the definition's stored exponent. No USD/two-decimal fallback: missing or ambiguous
 * configuration fails closed. When an operation is supplied, that operation's enablement flag is required.
 */
export async function resolveTenantCurrency(prisma: PrismaClient | any, tenantId: string, operation?: CurrencyOperation): Promise<TenantCurrencySelection> {
  const rows: any[] = await prisma.tenantCurrency.findMany({ where: { tenantId, status: 'ACTIVE' }, include: { currency: true }, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }], take: 100 })
  const usable = rows.filter(row => row.currency?.status === 'ACTIVE' && typeof row.currency.code === 'string' && row.currency.code.length > 0 && Number.isInteger(row.currency.exponent) && row.currency.exponent >= 0 && row.currency.exponent <= 6)
  const defaults = usable.filter(row => row.defaultForBrand)
  if (defaults.length > 1) throw new CustomerError('CURRENCY_CONFIGURATION_AMBIGUOUS', 409)
  const selected = defaults[0] ?? (usable.length === 1 ? usable[0] : null)
  if (!selected) throw new CustomerError(usable.length > 1 ? 'CURRENCY_CONFIGURATION_AMBIGUOUS' : 'CURRENCY_UNAVAILABLE', 409)
  if (operation) {
    const enabled = operation === 'DEPOSIT' ? selected.depositsEnabled : operation === 'WITHDRAWAL' ? selected.withdrawalsEnabled : selected.wageringEnabled
    if (!enabled) throw new CustomerError(`${operation}_CURRENCY_DISABLED`, 409)
  }
  return { code: selected.currency.code, exponent: selected.currency.exponent, depositsEnabled: Boolean(selected.depositsEnabled), withdrawalsEnabled: Boolean(selected.withdrawalsEnabled), wageringEnabled: Boolean(selected.wageringEnabled) }
}
