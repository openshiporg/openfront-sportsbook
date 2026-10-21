import { evidenceHash } from '../domain/engine'
import { providerInstallationRevision } from '../adapters/installation-revision'

type InboxJob={id:string;tenantId:string;type:string;rawEnvelopeId:string}
type InboxAuditAppender=(tx:any,tenantId:string,action:string,targetType:string,targetId:string,payload:unknown)=>Promise<unknown>
const payloadObject=(value:unknown)=>value&&typeof value==='object'&&!Array.isArray(value)?value as Record<string,unknown>:{}
const sequenceNumber=(value:string)=>/^\d{1,30}$/.test(value)?BigInt(value):null
/** Accept only explicit ISO-8601 UTC/offset instants; never substitute the current time for missing provider evidence. */
const strictInstant=(value:unknown)=>{if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,9})?)?(Z|[+-]\d{2}:\d{2})$/.test(value))return null;const parsed=new Date(value);return Number.isNaN(parsed.getTime())?null:parsed}
type InboxResult={action:string;targetType:string;targetId:string;details:Record<string,unknown>}
export type InboxEffectHooks={beforeEffects?:(tx:any)=>Promise<void>;afterEffects?:(tx:any,result:InboxResult)=>Promise<void>}

export async function processCanonicalInbox(prisma:any,job:InboxJob,hooks:InboxEffectHooks={}){
 if(!job.tenantId||!job.rawEnvelopeId)throw new Error('INVALID_INBOX')
 return prisma.$transaction(async(tx:any)=>{await hooks.beforeEffects?.(tx);const result=await normalizeCanonicalInTx(tx,job);await hooks.afterEffects?.(tx,result);return result})
}

async function normalizeCanonicalInTx(tx:any,job:InboxJob):Promise<InboxResult>{
 {
  const envelope=await tx.rawEnvelope.findFirst({where:{id:job.rawEnvelopeId,tenantId:job.tenantId},include:{providerConnection:true}});if(!envelope?.providerConnection)throw new Error('MISSING_ENVELOPE')
  // Current admission at effect time: same tenant, not disabled/suspended. FOR SHARE fences a concurrent state change until this effect commits.
  if(envelope.providerConnection.tenantId!==job.tenantId||envelope.schemaVersion!=='sandbox.v1')throw new Error('PROVIDER_ENVELOPE_NOT_ADMITTED')
  await tx.$queryRaw`SELECT id FROM "ProviderConnection" WHERE id = ${envelope.providerConnection.id} AND tenant = ${job.tenantId} FOR SHARE`
  const admitted=await tx.providerConnection.findFirst({where:{id:envelope.providerConnection.id,tenantId:job.tenantId}});if(!admitted||admitted.status==='DISABLED'||admitted.certificationStatus==='SUSPENDED')throw new Error('PROVIDER_NOT_ADMITTED')
  // The installation/config that verified the envelope at ingress must still be the installed one; a reconfigured installation never reinterprets an old receipt (it stays retained, the item dead-letters for review). Envelopes recorded before the revision existed carry '' and are judged by current admission only.
  if(envelope.installationRevision&&envelope.installationRevision!==providerInstallationRevision(admitted))throw new Error('PROVIDER_INSTALLATION_REVISION_CHANGED')
  const event=payloadObject(envelope.payload),payload=payloadObject(event.payload),type=String(event.type??job.type),kind=String((admitted.capabilities as any)?.kind??'')
  if(kind==='sports'&&type==='sports.price.v1'){
   const selectionId=String(payload.selectionId??''),sequence=String(payload.sequence??''),decimalOdds=String(payload.decimalOdds??''),selection=await tx.selection.findFirst({where:{id:selectionId,tenantId:job.tenantId},include:{market:true}}),occurredAt=strictInstant(event.occurredAt),effectiveAt=payload.effectiveAt===undefined?occurredAt:strictInstant(payload.effectiveAt);if(!selection?.market||!/^\d{1,12}(\.\d{1,8})?$/.test(decimalOdds)||sequenceNumber(sequence)===null||!occurredAt||!effectiveAt)throw new Error('INVALID_CANONICAL_PRICE')
   // Serialize normalization per selection stream so concurrent sequences observe one monotonic frontier.
   await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`price:${job.tenantId}:${selectionId}`}))`
   const appended=await tx.priceSnapshot.findFirst({where:{tenantId:job.tenantId,selectionId,rawEnvelopeId:envelope.id}});if(appended)return{action:'sports.price_duplicate_preserved',targetType:'Selection',targetId:selectionId,details:{sequence,priceSnapshotId:appended.id}}
   const latest=await tx.priceSnapshot.findFirst({where:{tenantId:job.tenantId,selectionId},orderBy:{receivedAt:'desc'}}),current=latest?sequenceNumber(latest.sequence):null,next=sequenceNumber(sequence),gap=current!==null&&next!==null&&next>current+1n,outOfOrder=current!==null&&next!==null&&next<=current
   if(gap||outOfOrder){const quarantine={providerConnectionId:envelope.providerConnection.id,scopeType:'MARKET',scopeId:selection.market.id,status:gap?'GAPPED':'DEGRADED',lastSequence:latest?.sequence??'',gapFrom:gap?String(current!+1n):sequence,gapTo:gap?String(next!-1n):sequence,actionTaken:'MARKET_SUSPENDED_MANUAL_RECOVERY_REQUIRED'},prior=await tx.feedHealthSnapshot.findFirst({where:{tenantId:job.tenantId,...quarantine}});if(prior)return{action:'sports.price_quarantine_preserved',targetType:'Market',targetId:selection.market.id,details:{gap,outOfOrder,sequence,feedHealthSnapshotId:prior.id}};await tx.feedHealthSnapshot.create({data:{tenantId:job.tenantId,...quarantine,heartbeatAt:new Date(),lagMs:0,checkedAt:new Date()}});if(selection.market.status==='OPEN'){await tx.market.update({where:{id:selection.market.id},data:{status:'SUSPENDED',version:{increment:1}}});await tx.tradingStatusChange.create({data:{tenantId:job.tenantId,scopeType:'MARKET',scopeId:selection.market.id,fromStatus:'OPEN',toStatus:'SUSPENDED',reason:gap?'PROVIDER_SEQUENCE_GAP':'PROVIDER_OUT_OF_ORDER',source:'PROVIDER',actorId:envelope.providerConnection.id,effectiveAt:new Date()}})}
    // No automated feed-recovery handler exists (provider gap query is not implemented); the market stays suspended for manual operator recovery instead of queueing work that can only dead-letter.
    return{action:'sports.price_quarantined',targetType:'Market',targetId:selection.market.id,details:{gap,outOfOrder,sequence,previousSequence:latest?.sequence??null,rawEnvelopeId:envelope.id,recovery:'MANUAL_REQUIRED'}}}
   await tx.priceSnapshot.create({data:{tenantId:job.tenantId,selectionId,providerConnectionId:envelope.providerConnection.id,decimalOdds,line:String(payload.line??''),sequence,effectiveAt,receivedAt:envelope.receivedAt,rawEnvelopeId:envelope.id,status:'OPEN'}})
   await tx.feedHealthSnapshot.create({data:{tenantId:job.tenantId,providerConnectionId:envelope.providerConnection.id,scopeType:'SELECTION',scopeId:selectionId,status:'HEALTHY',heartbeatAt:new Date(),lagMs:Math.max(0,envelope.receivedAt?new Date(envelope.receivedAt).getTime()-occurredAt.getTime():0),lastSequence:sequence,checkedAt:new Date(),actionTaken:'PRICE_APPENDED'}})
   return{action:'sports.price_normalized',targetType:'Selection',targetId:selectionId,details:{sequence,decimalOdds}}
  }
  if(kind==='results'&&type==='results.final.v1'){
   const eventId=typeof payload.eventId==='string'?payload.eventId:'';if(!eventId||!strictInstant(event.occurredAt))throw new Error('INVALID_CANONICAL_RESULT');await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`result:${job.tenantId}:${eventId}`}))`;const eventRow=await tx.event.findFirst({where:{id:eventId,tenantId:job.tenantId}});if(!eventRow)throw new Error('RESULT_EVENT_NOT_FOUND');const latest=await tx.resultVersion.findFirst({where:{tenantId:job.tenantId,eventId},orderBy:{version:'desc'}}),payloadHash=evidenceHash(payload),existing=await tx.resultVersion.findFirst({where:{tenantId:job.tenantId,eventId,payloadHash}});if(existing)return{action:'result.duplicate_preserved',targetType:'ResultVersion',targetId:existing.id,details:{payloadHash}};const result=await tx.resultVersion.create({data:{tenantId:job.tenantId,eventId,providerConnectionId:envelope.providerConnection.id,version:Number(latest?.version??0)+1,status:'PENDING',payload,payloadHash}});await tx.outboxMessage.create({data:{tenantId:job.tenantId,aggregateType:'RESULT_VERSION',aggregateId:result.id,eventType:'result.received.v1',payload:{eventId,payloadHash,rawEnvelopeId:envelope.id},status:'PENDING',attempts:0,maxAttempts:10,availableAt:new Date()}});return{action:'result.received',targetType:'ResultVersion',targetId:result.id,details:{eventId,payloadHash}}
  }
  if(kind==='integrity'&&type==='integrity.alert.v1'){
   const opened=await tx.integrityCase.findFirst({where:{tenantId:job.tenantId,providerConnectionId:envelope.providerConnection.id,restrictedEvidence:{path:['rawEnvelopeId'],equals:envelope.id}}});if(opened)return{action:'integrity.case_preserved',targetType:'IntegrityCase',targetId:opened.id,details:{severity:opened.severity}}
   const item=await tx.integrityCase.create({data:{tenantId:job.tenantId,playerId:payload.playerId?String(payload.playerId):null,eventId:payload.eventId?String(payload.eventId):null,wagerId:payload.wagerId?String(payload.wagerId):null,providerConnectionId:envelope.providerConnection.id,type:String(payload.type??'SUSPICIOUS_BETTING'),status:'OPEN',severity:String(payload.severity??'HIGH'),restrictedEvidence:{rawEnvelopeId:envelope.id,evidenceHash:envelope.payloadHash}}});return{action:'integrity.case_opened',targetType:'IntegrityCase',targetId:item.id,details:{severity:item.severity}}
  }
  throw new Error(`UNSUPPORTED_INBOX_TYPE:${kind||'unknown'}:${type||'unknown'}`)
 }
}

/** Domain effect, live-lease fence and audit commit atomically, so a lost ACK cannot strand an unaudited effect. */
export async function handleCanonicalInbox(prisma:any,job:InboxJob,appendAudit:InboxAuditAppender,fence?:(tx:any)=>Promise<void>){
 await processCanonicalInbox(prisma,job,{beforeEffects:fence,afterEffects:async(tx,result)=>{await appendAudit(tx,job.tenantId,result.action,result.targetType,result.targetId,{inboxMessageId:job.id,rawEnvelopeId:job.rawEnvelopeId,...result.details})}})
}
