import { test } from 'node:test'
import assert from 'node:assert/strict'
import { canMarkWithdrawalPaid, withdrawalAlreadyResolved } from '../withdrawal-policy'

test('mark-paid requires finance permission',()=>{assert.equal(canMarkWithdrawalPaid({canManageFinance:true}),true);assert.equal(canMarkWithdrawalPaid({canManageFinance:false}),false);assert.equal(canMarkWithdrawalPaid({}),false)})
test('resolved withdrawal replay is a no-op',()=>{assert.equal(withdrawalAlreadyResolved('SUCCEEDED'),true);assert.equal(withdrawalAlreadyResolved('FAILED'),true);assert.equal(withdrawalAlreadyResolved('PROCESSING'),false)})
