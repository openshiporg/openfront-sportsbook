'use client'
import { useState } from 'react'
import { recheckUnknownPayment, saveOperatorLicence, savePaymentProvider, settleOperatorWithdrawal } from '../actions'
import { paymentActionMessage, type PaymentActionResult } from '../withdrawal-policy'

export function PaymentsControls({kind,intentId,canSettle,canCheck}:{kind:'licence'|'provider'|'withdrawal';intentId?:string;canSettle?:boolean;canCheck?:boolean}) {
 const [msg,setMsg]=useState('')
 if(kind==='withdrawal')return <WithdrawalControls intentId={intentId!} canSettle={Boolean(canSettle)} canCheck={Boolean(canCheck)}/>
 if(kind==='licence')return <form className="flex flex-wrap gap-2" action={async(form)=>{try{await saveOperatorLicence({id:String(form.get('id')||'')||undefined,licenceNumber:String(form.get('licenceNumber')),regulator:String(form.get('regulator')),expiresAt:String(form.get('expiresAt')),permittedRegions:String(form.get('regions')),status:String(form.get('status'))});setMsg('Licence saved')}catch(e){setMsg(e instanceof Error?e.message:'Could not save')}}}><input name="id" placeholder="Licence ID to edit (optional)" className="rounded border px-2 py-1"/><input name="licenceNumber" required placeholder="Licence number" className="rounded border px-2 py-1"/><input name="regulator" required placeholder="Regulator" className="rounded border px-2 py-1"/><input name="expiresAt" required type="date" className="rounded border px-2 py-1"/><input name="regions" required placeholder="US-NJ, US-PA" className="rounded border px-2 py-1"/><select name="status" className="rounded border px-2 py-1"><option>ACTIVE</option><option>SUSPENDED</option><option>EXPIRED</option></select><button className="rounded border px-2 py-1">Save licence</button><span role="status">{msg}</span></form>
 return <form className="flex flex-wrap gap-2" action={async(form)=>{try{await savePaymentProvider({id:String(form.get('id')||'')||undefined,adapterId:String(form.get('adapter')),adapterVersion:'1',configReference:String(form.get('config')),secretReference:String(form.get('secret')),status:String(form.get('status'))});setMsg('Provider saved')}catch(e){setMsg(e instanceof Error?e.message:'Could not save')}}}><input name="id" placeholder="Connection ID to update (optional)" className="rounded border px-2 py-1"/><select name="adapter" className="rounded border px-2 py-1">{['authorizenet','paysafe','aeropay','manual'].map(x=><option key={x}>{x}</option>)}</select><input name="config" placeholder="Config reference" className="rounded border px-2 py-1"/><input name="secret" placeholder="Secret env variable name" className="rounded border px-2 py-1"/><select name="status" className="rounded border px-2 py-1"><option>ACTIVE</option><option>DISABLED</option></select><button className="rounded border px-2 py-1">Add provider</button><span role="status">{msg}</span></form>
}

/** Payout actions. Mark paid / Reject are the manual payout rail; Check status only reads the provider (never re-sends). */
function WithdrawalControls({intentId,canSettle,canCheck}:{intentId:string;canSettle:boolean;canCheck:boolean}) {
 const [msg,setMsg]=useState('')
 const [busy,setBusy]=useState(false)
 const [ref,setRef]=useState('')
 const [done,setDone]=useState(false)
 async function run(action:()=>Promise<PaymentActionResult>,success:string){
  if(busy)return
  setBusy(true);setMsg('')
  try{const result=await action();setMsg(paymentActionMessage(result,success));if(result.ok)setDone(true)}
  catch{setMsg('That didn’t work. Nothing was changed. Try again.')}
  finally{setBusy(false)}
 }
 const cls='min-h-11 rounded border px-3 py-1 disabled:opacity-60'
 return <div className="flex flex-wrap items-center gap-2">
  {canSettle&&!done&&<><input aria-label="Bank transfer reference" placeholder="Bank transfer reference" className="min-h-11 rounded border px-2 py-1" value={ref} onChange={e=>setRef(e.target.value)}/><button className={cls} disabled={busy} onClick={()=>run(()=>settleOperatorWithdrawal(intentId,'SUCCEEDED',ref),'Marked paid. Reload to refresh the queue.')}>Mark paid</button><button className={cls} disabled={busy} onClick={()=>run(()=>settleOperatorWithdrawal(intentId,'FAILED',''),'Rejected. The held funds are back in the player’s wallet.')}>Reject</button></>}
  {canCheck&&!done&&<button className={cls} disabled={busy} onClick={()=>run(()=>recheckUnknownPayment(intentId),'Provider confirmed the outcome. Reload to refresh the queue.')}>{busy?'Checking…':'Check status'}</button>}
  <span role="status" className="text-sm">{msg}</span>
 </div>
}
