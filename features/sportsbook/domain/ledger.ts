import type { Minor } from './types'

export type AccountClass = 'ASSET' | 'LIABILITY' | 'REVENUE' | 'EXPENSE' | 'EQUITY'
export type EntrySide = 'DEBIT' | 'CREDIT'
export interface JournalEntry { accountId: string; currency: string; side: EntrySide; amount: Minor }
export interface Journal { idempotencyKey: string; type: string; entries: readonly JournalEntry[]; reversalOf?: string }
export interface Hold { id: string; accountId: string; amount: Minor; status: 'ACTIVE' | 'CAPTURED' | 'RELEASED'; version: number }

export function validateJournal(journal: Journal): void {
  if (!journal.idempotencyKey || journal.entries.length < 2) throw new Error('INVALID_JOURNAL')
  const currencies = new Set(journal.entries.map(e => e.currency))
  if (currencies.size !== 1) throw new Error('CROSS_CURRENCY_JOURNAL')
  if (journal.entries.some(e => e.amount <= 0n)) throw new Error('NON_POSITIVE_ENTRY')
  const debit = journal.entries.filter(e => e.side === 'DEBIT').reduce((n, e) => n + e.amount, 0n)
  const credit = journal.entries.filter(e => e.side === 'CREDIT').reduce((n, e) => n + e.amount, 0n)
  if (debit !== credit) throw new Error('UNBALANCED_JOURNAL')
}

export function availableBalance(posted: Minor, holds: readonly Hold[], reserves: Minor = 0n): Minor {
  return posted - reserves - holds.filter(h => h.status === 'ACTIVE').reduce((n, h) => n + h.amount, 0n)
}

export function placeHold(accountId: string, amount: Minor, available: Minor, purposeId: string): Hold {
  if (amount <= 0n) throw new Error('INVALID_HOLD_AMOUNT')
  if (available < amount) throw new Error('INSUFFICIENT_FUNDS')
  return { id: purposeId, accountId, amount, status: 'ACTIVE', version: 1 }
}

export function transitionHold(hold: Hold, next: 'CAPTURED' | 'RELEASED', expectedVersion: number): Hold {
  if (hold.version !== expectedVersion) throw new Error('VERSION_CONFLICT')
  if (hold.status !== 'ACTIVE') throw new Error('HOLD_ALREADY_FINAL')
  return { ...hold, status: next, version: hold.version + 1 }
}

export function settlementJournal(input:{idempotencyKey:string;stake:Minor;payout:Minor;currency:string;pendingAccountId:string;cashAccountId:string;revenueAccountId:string;winningsExpenseAccountId:string}):Journal {
  const {stake,payout,currency}=input
  const entries:JournalEntry[]=[{accountId:input.pendingAccountId,currency,side:'DEBIT',amount:stake}]
  if(payout===0n) entries.push({accountId:input.revenueAccountId,currency,side:'CREDIT',amount:stake})
  else {
    if(payout>stake) entries.push({accountId:input.winningsExpenseAccountId,currency,side:'DEBIT',amount:payout-stake})
    if(payout<stake) entries.push({accountId:input.revenueAccountId,currency,side:'CREDIT',amount:stake-payout})
    entries.push({accountId:input.cashAccountId,currency,side:'CREDIT',amount:payout})
  }
  const journal={idempotencyKey:input.idempotencyKey,type:'WAGER_SETTLEMENT',entries}
  validateJournal(journal); return journal
}

export function reverseJournal(original: Journal, idempotencyKey: string): Journal {
  const reversal: Journal = { idempotencyKey, type: `REVERSAL_${original.type}`, reversalOf: original.idempotencyKey, entries: original.entries.map(e => ({ ...e, side: e.side === 'DEBIT' ? 'CREDIT' : 'DEBIT' })) }
  validateJournal(reversal)
  return reversal
}
