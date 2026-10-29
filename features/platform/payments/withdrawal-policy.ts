export function canMarkWithdrawalPaid(capabilities: { canManageFinance?: boolean }) { return capabilities.canManageFinance === true }
export function withdrawalAlreadyResolved(status: string) { return status === 'SUCCEEDED' || status === 'FAILED' }
