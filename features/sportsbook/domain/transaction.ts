export function isRetryableTransactionError(error: unknown) {
  const value = error as { code?: string; name?: string; message?: string; cause?: unknown }
  const detail = `${value?.name ?? ''} ${value?.message ?? ''} ${String(value?.cause ?? '')}`
  return ['P2034', 'P2002', '40001', '40P01'].includes(value?.code ?? '') || /TransactionWriteConflict|write conflict|deadlock|serialization/i.test(detail)
}
export const transactionBackoff = (attempt: number) => new Promise(resolve => setTimeout(resolve, Math.min(15 * 2 ** attempt, 300)))
