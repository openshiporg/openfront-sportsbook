export function canMarkWithdrawalPaid(capabilities: { canManageFinance?: boolean }) { return capabilities.canManageFinance === true }
export function withdrawalAlreadyResolved(status: string) { return status === 'SUCCEEDED' || status === 'FAILED' }

export type PaymentActionResult = { ok: true; state: string } | { ok: false; code: string }

/** Stable code from a thrown error (e.g. "PAYMENT_STILL_UNKNOWN:PROVIDER_PENDING" -> "PAYMENT_STILL_UNKNOWN"). */
export function paymentActionCode(error: unknown) {
  const message = error instanceof Error ? error.message : ''
  const code = message.split(':')[0]
  return /^[A-Z][A-Z0-9_]{2,63}$/.test(code) ? code : 'UNEXPECTED'
}

const messages: Record<string, string> = {
  FORBIDDEN: 'You don’t have permission to manage payouts.',
  BANK_REFERENCE_REQUIRED: 'Enter the bank transfer reference first.',
  PAYMENT_INTENT_NOT_FOUND: 'This withdrawal no longer exists.',
  WITHDRAWAL_NOT_SETTLEABLE: 'This withdrawal can’t be changed in its current state.',
  PAYMENT_STILL_UNKNOWN: 'The provider has no final answer yet. The funds stay on hold.',
  WITHDRAWAL_HOLD_NOT_ACTIVE: 'The held funds for this withdrawal are no longer active. Nothing was changed.',
  JOURNAL_ALREADY_POSTED: 'This payout is already in the ledger. Nothing was changed.',
  PAYMENT_LEDGER_UNAVAILABLE: 'The player’s ledger account is unavailable. Nothing was changed.',
}

/** Plain staff-facing text for an action result; never a raw code or framework error. */
export function paymentActionMessage(result: PaymentActionResult, done: string) {
  if (result.ok) return result.state === 'ALREADY_RESOLVED' ? 'Already resolved.' : done
  return messages[result.code] ?? 'That didn’t work. Nothing was changed. Try again.'
}
