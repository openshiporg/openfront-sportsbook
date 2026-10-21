export type JournalEntryFact = { transactionId: string; currency: string; side: string; amountMinor: string }
export type JournalDifference = { transactionId: string; currency: string; debitMinor: bigint; creditMinor: bigint; differenceMinor: bigint }

export function analyzeJournalBalances(entries: JournalEntryFact[]) {
  const groups = new Map<string, { transactionId: string; currency: string; debitMinor: bigint; creditMinor: bigint }>()
  for (const entry of entries) {
    const key = `${entry.transactionId}\u0000${entry.currency}`
    const group = groups.get(key) ?? { transactionId: entry.transactionId, currency: entry.currency, debitMinor: 0n, creditMinor: 0n }
    const amount = BigInt(entry.amountMinor)
    if (amount < 0n || !['DEBIT', 'CREDIT'].includes(entry.side)) throw new Error('INVALID_JOURNAL_ENTRY')
    if (entry.side === 'DEBIT') group.debitMinor += amount
    else group.creditMinor += amount
    groups.set(key, group)
  }
  const transactions: JournalDifference[] = [...groups.values()].map(group => ({ ...group, differenceMinor: group.debitMinor - group.creditMinor }))
  const unbalanced = transactions.filter(item => item.differenceMinor !== 0n)
  const absoluteDifferenceMinor = unbalanced.reduce((sum, item) => sum + (item.differenceMinor < 0n ? -item.differenceMinor : item.differenceMinor), 0n)
  return { transactions, unbalanced, absoluteDifferenceMinor }
}
