import { createHash, createHmac } from 'node:crypto'
import { HouseAdapter, HOUSE_ENVELOPE_SCHEMA, type HouseKind } from '../adapters/internal'
import { enforceDurableRate, trustedClientKey } from './durable-abuse'
import { readBoundedWebhookBody, WebhookBodyError } from './bounded-webhook-body'
import { evidenceHash } from '../domain/engine'
import { runWithTenantScope } from '../../keystone/tenant-scope'
import { normalizeCanonicalInTx } from '../adapters/inbox-handler'
import { appendAudit } from '../../keystone/mutations/sportsbook'
import { providerInstallationRevision } from '../adapters/installation-revision'

const REPLAY_MS=5*60_000
/** PROVIDER_WEBHOOK_SECRET when set (32+ chars), else a domain-separated key derived from SESSION_SECRET, which every deployment has. */
export function providerWebhookSecret(){const configured=process.env.PROVIDER_WEBHOOK_SECRET;if(configured&&configured.length>=32)return configured;const session=process.env.SESSION_SECRET;return session&&session.length>=32?createHmac('sha256',session).update('provider-webhook:v1').digest('hex'):null}
/** Signed inbound event for one house integration installation (tenant + connection bound into the MAC). */
export async function handleProviderWebhook(request:Request,kind:HouseKind){
 let raw:Uint8Array
 try{raw=await readBoundedWebhookBody(request)}catch(error){const tooLarge=error instanceof WebhookBodyError&&error.code==='PAYLOAD_TOO_LARGE';return Response.json({error:tooLarge?'payload_too_large':'invalid_payload'},{status:tooLarge?413:400})}
 const timestamp=request.headers.get('x-openfront-timestamp')??'',timestampMs=Number(timestamp),now=Date.now();if(!Number.isFinite(timestampMs)||Math.abs(now-timestampMs)>REPLAY_MS)return Response.json({error:'stale_timestamp'},{status:401})
 const secret=providerWebhookSecret();if(!secret)return Response.json({error:'secret_not_configured'},{status:503})
 // Installation identity (tenant + connection) is part of the signed MAC input, so the headers cannot be substituted for another installation.
 const tenantId=request.headers.get('x-openfront-tenant-id')??'',connectionId=request.headers.get('x-openfront-connection-id')??'';if(!OPAQUE_ID.test(tenantId)||!OPAQUE_ID.test(connectionId))return Response.json({error:'installation_required'},{status:401})
 const adapter=new HouseAdapter(kind,secret),verified=adapter.verifyWebhook(raw,request.headers,`${tenantId}.${connectionId}`);if(!verified.valid||!verified.event)return Response.json({error:'invalid_signature'},{status:401})
 const event=canonicalProviderEvent(verified.event);if(!event)return Response.json({error:'invalid_event'},{status:400})
 const {keystoneContext}=await import('../../keystone/context');const prisma:any=keystoneContext.prisma
 // All reads and writes run under the signed tenant's transaction-local scope (no global provider discovery).
 return runWithTenantScope(tenantId,async()=>{
 const connection=await prisma.providerConnection.findFirst({where:{id:connectionId,tenantId,adapterId:`house-${kind}`,certificationStatus:'INTERNAL',status:{in:['ACTIVE','DEGRADED']}}});if(!connection)return Response.json({error:'installation_not_admitted'},{status:401})
 const messageHash=createHash('sha256').update(kind).update(timestamp).update(raw).digest('hex'),client=trustedClientKey(request,connection.id),messageKey=`${connection.id}:${event.id}`,bodyHash=evidenceHash(event)
 const priorDecision=async(db:any)=>{const prior=await db.inboxMessage.findFirst({where:{tenantId,messageKey},include:{rawEnvelope:true}});if(!prior)return null;const priorEvent=canonicalProviderEvent(prior.rawEnvelope?.payload);return priorEvent&&evidenceHash(priorEvent)===bodyHash?'REPLAY':'CONFLICT'}
 try{const receipt=await prisma.$transaction(async(tx:any)=>{await enforceDurableRate(tx,tenantId,client,'provider-webhook',60,60_000);const replay=await tx.webhookReplay.findFirst({where:{tenantId,providerConnectionId:connection.id,messageHash}});if(replay)throw new Error('REPLAY');const decision=await priorDecision(tx);if(decision)throw new Error(decision);await tx.webhookReplay.create({data:{tenantId,providerConnectionId:connection.id,messageHash,occurredAt:new Date(timestampMs),expiresAt:new Date(now+REPLAY_MS)}});const envelope=await tx.rawEnvelope.create({data:{tenantId,providerConnectionId:connection.id,direction:'INBOUND',externalId:event.id,schemaVersion:HOUSE_ENVELOPE_SCHEMA,installationRevision:providerInstallationRevision(connection),payload:verified.event,payloadHash:messageHash,receivedAt:new Date()}});const inbox=await tx.inboxMessage.create({data:{tenantId,rawEnvelopeId:envelope.id,messageKey,type:event.type,status:'PROCESSING',attempts:1,availableAt:new Date()}});const result=await normalizeCanonicalInTx(tx,{id:inbox.id,tenantId,type:event.type,rawEnvelopeId:envelope.id});await appendAudit(tx,tenantId,'sportsbook-webhook',result.action,result.targetType,result.targetId,'INBOUND_EVENT_NORMALIZED',{inboxMessageId:inbox.id,rawEnvelopeId:envelope.id,...result.details});await tx.inboxMessage.update({where:{id:inbox.id},data:{status:'COMPLETED'}});return{inboxId:inbox.id,envelopeId:envelope.id}} ,{isolationLevel:'Serializable'});return Response.json({accepted:true,durable:true,...receipt},{status:202})}catch(error){let message=error instanceof Error?error.message:'FAILED';if((error as any)?.code==='P2002')message=(await priorDecision(prisma).catch(()=>null))??'UNAVAILABLE';if(message==='REPLAY')return Response.json({error:'replay'},{status:409});if(message==='CONFLICT')return Response.json({error:'event_conflict'},{status:409});if(message==='RATE_LIMITED')return Response.json({error:'rate_limited'},{status:429,headers:{'retry-after':'60'}});return Response.json({error:'temporarily_unavailable'},{status:503})}
 })
}

const OPAQUE_ID=/^[A-Za-z0-9_-]{1,64}$/,EVENT_ID=/^[A-Za-z0-9_.:-]{1,128}$/,EVENT_TYPE=/^[a-z][a-z0-9_]*(\.[a-z0-9_]+){1,6}\.v[0-9]{1,3}$/,INSTANT=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,9})?)?(Z|[+-]\d{2}:\d{2})$/
const jsonDepth=(value:unknown,level=0):number=>value&&typeof value==='object'?Math.max(level+1,...Object.values(value as object).map(item=>jsonDepth(item,level+1))):level
/** Versioned canonical contract for signed provider events: bounded id/type, explicit provider occurrence instant, bounded object payload. */
function canonicalProviderEvent(value:unknown){if(!value||typeof value!=='object'||Array.isArray(value))return null;const event=value as Record<string,unknown>,occurred=typeof event.occurredAt==='string'&&INSTANT.test(event.occurredAt)?new Date(event.occurredAt):null;if(typeof event.id!=='string'||!EVENT_ID.test(event.id)||typeof event.type!=='string'||!EVENT_TYPE.test(event.type)||!occurred||Number.isNaN(occurred.getTime())||occurred.getTime()>Date.now()+REPLAY_MS||!event.payload||typeof event.payload!=='object'||Array.isArray(event.payload)||jsonDepth(event.payload)>8)return null;return{id:event.id,type:event.type,occurredAt:event.occurredAt as string,payload:event.payload as Record<string,unknown>}}
