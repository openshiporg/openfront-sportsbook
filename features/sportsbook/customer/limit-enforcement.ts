import { resolveTenantCurrency } from './currency'
type Tx=any
const periodStart=(period:string,now:Date)=>new Date(now.getTime()-(period==='DAILY'?1:period==='WEEKLY'?7:30)*86_400_000)
const integerMinor=(value:unknown)=>typeof value==='string'&&/^-?\d+$/.test(value)?BigInt(value):null
/**
 * Money limits only count usage in the limit's own currency (no implicit FX); SESSION limits are whole minutes
 * (currency MIN) measured on the acting customer session, so a newer login elsewhere cannot reset the clock.
 * Periods are rolling windows (24h / 7d / 30d) ending now.
 */
export async function wagerLimitViolation(tx:Tx,tenantId:string,playerId:string,stakeMinor:bigint,now=new Date(),sessionId?:string,currency?:string){
 const wagerCurrency=currency??(await resolveTenantCurrency(tx,tenantId)).code
 const limits=await tx.playerLimit.findMany({where:{tenantId,playerId,type:{in:['STAKE','LOSS','SESSION']},effectiveFrom:{lte:now},OR:[{effectiveTo:null},{effectiveTo:{gt:now}}]},orderBy:{effectiveFrom:'desc'}})
 for(const limit of limits){const maximum=integerMinor(limit.amountMinor),from=periodStart(limit.period??'DAILY',now)
  if(maximum===null||maximum<0n)return{code:'LIMIT_UNAVAILABLE',limitId:limit.id,maximum:0n,used:0n}
  if(limit.type!=='SESSION'&&limit.currency&&limit.currency!==wagerCurrency)continue
  if(limit.type==='STAKE'){const wagers=await tx.wager.findMany({where:{tenantId,playerId,currency:wagerCurrency,status:{not:'REJECTED'},createdAt:{gte:from}},select:{stakeMinor:true}}),used=wagers.reduce((sum:bigint,item:{stakeMinor:string})=>sum+(integerMinor(item.stakeMinor)??0n),0n);if(used+stakeMinor>maximum)return{code:'STAKE_LIMIT_EXCEEDED',limitId:limit.id,maximum,used}}
  if(limit.type==='LOSS'){
   // Net loss = stakes of resolved wagers minus everything returned on them (latest settlement payout plus accepted cash-outs); wins offset losses.
   const wagers=await tx.wager.findMany({where:{tenantId,playerId,currency:wagerCurrency,status:{in:['SETTLED','CASHED_OUT']},createdAt:{gte:from}},select:{id:true,stakeMinor:true,status:true}}),ids=wagers.map((item:{id:string})=>item.id)
   const[settlements,cashouts]=await Promise.all([tx.settlement.findMany({where:{tenantId,wagerId:{in:ids}},orderBy:[{wagerId:'asc'},{version:'desc'}]}),tx.cashOutAcceptance.findMany({where:{tenantId,wagerId:{in:ids},status:'ACCEPTED',reversalOfId:null},select:{wagerId:true,amountMinor:true,currency:true}})])
   const latest=new Map<string,any>();for(const settlement of settlements)if(settlement.wagerId&&!latest.has(settlement.wagerId))latest.set(settlement.wagerId,settlement)
   const cashedOut=new Map<string,bigint>();for(const row of cashouts){const amount=integerMinor(row.amountMinor);if(amount===null||(row.currency&&row.currency!==wagerCurrency))return{code:'LOSS_LIMIT_EVIDENCE_UNAVAILABLE',limitId:limit.id,maximum,used:0n};cashedOut.set(row.wagerId,(cashedOut.get(row.wagerId)??0n)+amount)}
   let net=0n
   for(const wager of wagers){const stake=integerMinor(wager.stakeMinor),settlement=latest.get(wager.id),payout=settlement?integerMinor(settlement.payoutMinor):0n
    if(stake===null||payout===null||(wager.status==='SETTLED'&&!settlement))return{code:'LOSS_LIMIT_EVIDENCE_UNAVAILABLE',limitId:limit.id,maximum,used:net}
    net+=stake-payout-(cashedOut.get(wager.id)??0n)}
   if(net>=maximum)return{code:'LOSS_LIMIT_REACHED',limitId:limit.id,maximum,used:net}}
  if(limit.type==='SESSION'){const session=sessionId?await tx.customerSession.findFirst({where:{id:sessionId,tenantId,playerId}}):await tx.customerSession.findFirst({where:{tenantId,playerId,revokedAt:null,expiresAt:{gt:now}},orderBy:{createdAt:'asc'}});if(session){const minutes=BigInt(Math.floor((now.getTime()-session.createdAt.getTime())/60_000));if(minutes>=maximum)return{code:'SESSION_LIMIT_REACHED',limitId:limit.id,maximum,used:minutes}}}
 }
 return null
}
