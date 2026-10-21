import { evidenceHash } from '../domain/engine'
import { CustomerError } from './errors'

const UTC_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?Z$/
const MAX_STATEMENT_DAYS = 366
const PAGE_SIZE = 1000

/** Strict UTC instants and a bounded, past period. */
export function parseStatementPeriod(start: unknown, end: unknown, now = new Date()) {
  const startText = String(start ?? ''), endText = String(end ?? '')
  if (!UTC_INSTANT.test(startText) || !UTC_INSTANT.test(endText)) throw new CustomerError('INVALID_STATEMENT_PERIOD', 400)
  const periodStart = new Date(startText), periodEnd = new Date(endText)
  if (Number.isNaN(periodStart.getTime()) || Number.isNaN(periodEnd.getTime()) || periodStart >= periodEnd || periodEnd > now) throw new CustomerError('INVALID_STATEMENT_PERIOD', 400)
  if (periodEnd.getTime() - periodStart.getTime() > MAX_STATEMENT_DAYS * 86_400_000) throw new CustomerError('STATEMENT_PERIOD_TOO_LONG', 400)
  return { periodStart, periodEnd }
}

type EntryRow = { id: string; transactionId: string | null; side: string | null; amountMinor: string; currency: string; transaction: { effectiveAt: Date } | null }

/**
 * Complete ledger summary for one account and currency: every entry before periodEnd is aggregated in
 * deterministic id-ordered pages (no truncation). Period rows are hashed in (effectiveAt, transaction, entry) order.
 * Run inside one transaction so opening, closing and the hash describe the same snapshot.
 */
export async function summarizeAccountLedger(tx: any, input: { tenantId: string; accountId: string; currency: string; periodStart: Date; periodEnd: Date }) {
  let opening = 0n, closing = 0n, count = 0, cursor: string | undefined
  const periodRows: EntryRow[] = []
  for (;;) {
    const rows: EntryRow[] = await tx.journalEntry.findMany({
      where: { tenantId: input.tenantId, accountId: input.accountId, currency: input.currency, transaction: { effectiveAt: { lt: input.periodEnd } } },
      select: { id: true, transactionId: true, side: true, amountMinor: true, currency: true, transaction: { select: { effectiveAt: true } } },
      orderBy: { id: 'asc' },
      take: PAGE_SIZE,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    })
    for (const row of rows) {
      if (!row.transaction) throw new CustomerError('STATEMENT_LEDGER_INCOMPLETE', 409)
      const signed = row.side === 'CREDIT' ? BigInt(row.amountMinor) : -BigInt(row.amountMinor)
      closing += signed
      if (row.transaction.effectiveAt < input.periodStart) opening += signed
      else periodRows.push(row)
    }
    count += rows.length
    if (rows.length < PAGE_SIZE) break
    cursor = rows[rows.length - 1].id
  }
  periodRows.sort((a, b) => a.transaction!.effectiveAt.getTime() - b.transaction!.effectiveAt.getTime() || String(a.transactionId).localeCompare(String(b.transactionId)) || a.id.localeCompare(b.id))
  const journalHash = evidenceHash(periodRows.map(row => ({ transactionId: row.transactionId, entryId: row.id, side: row.side, amountMinor: row.amountMinor, currency: row.currency, effectiveAt: row.transaction!.effectiveAt })))
  return { opening, closing, journalHash, rowCount: periodRows.length, entriesCovered: count }
}
