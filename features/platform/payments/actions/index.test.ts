import { test } from 'node:test'
import assert from 'node:assert/strict'
import { canMarkWithdrawalPaid, withdrawalAlreadyResolved } from '../withdrawal-policy'

test('mark-paid requires finance permission',()=>{assert.equal(canMarkWithdrawalPaid({canManageFinance:true}),true);assert.equal(canMarkWithdrawalPaid({canManageFinance:false}),false);assert.equal(canMarkWithdrawalPaid({}),false)})
test('resolved withdrawal replay is a no-op',()=>{assert.equal(withdrawalAlreadyResolved('SUCCEEDED'),true);assert.equal(withdrawalAlreadyResolved('FAILED'),true);assert.equal(withdrawalAlreadyResolved('PROCESSING'),false)})

import { paymentActionCode, paymentActionMessage } from '../withdrawal-policy'
test('action errors become plain staff text, never a raw code',()=>{
 assert.equal(paymentActionCode(new Error('PAYMENT_STILL_UNKNOWN:PROVIDER_PENDING')),'PAYMENT_STILL_UNKNOWN')
 assert.equal(paymentActionCode(new Error('Minified React error #441')),'UNEXPECTED')
 assert.match(paymentActionMessage({ok:false,code:'PAYMENT_STILL_UNKNOWN'},'x'),/funds stay on hold/)
 assert.doesNotMatch(paymentActionMessage({ok:false,code:'UNEXPECTED'},'x'),/[A-Z]{3,}_/)
 assert.equal(paymentActionMessage({ok:true,state:'ALREADY_RESOLVED'},'x'),'Already resolved.')
})
