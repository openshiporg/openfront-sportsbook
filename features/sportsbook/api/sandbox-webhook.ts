import { createHash } from 'node:crypto'
import { SandboxAdapter } from '../adapters/sandbox'
import { assertSandboxRuntime } from './sandbox-policy'
import { enforceDurableRate, trustedClientKey } from './durable-abuse'
import { readBoundedWebhookBody, WebhookBodyError } from './bounded-webhook-body'
import { evidenceHash } from '../domain/engine'
import { runWithTenantScope } from '../../keystone/tenant-scope'
import { providerInstallationRevision } from '../adapters/installation-revision'

const REPLAY_MS=5*60_000
export async function handleSandboxWebhook(request:Request,kind:ConstructorParameters<typeof SandboxAdapter>[0]){
 try{assertSandboxRuntime()}catch{return Response.json({error:'disabled'},{status:404})}
 let raw:Uint8Array
 try{raw=await readBoundedWebhookBody(request)}catch(error){const tooLarge=error instanceof WebhookBodyError&&error.code==='PAYLOAD_TOO_LARGE';return Response.json({error:tooLarge?'payload_too_large':'invalid_payload'},{status:tooLarge?413:400})}
 const timestamp=request.headers.get('x-sandbox-timestamp')??'',timestampMs=Number(timestamp),now=Date.now();if(!Number.isFinite(timestampMs)||Math.abs(now-timestampMs)>REPLAY_MS)return Response.json({error:'stale_timestamp'},{status:401})
 const secret=process.env.SANDBOX_WEBHOOK_SECRET??(process.env.NODE_ENV==='production'?null:'sandbox-only');if(!secret)return Response.json({error:'secret_not_configured'},{status:503})
 // Installation identity (tenant + connection) is part of the signed MAC input, so the headers cannot be substituted for another installation.
 const tenantId=request.headers.get('x-openfront-tenant-id')??'',connectionId=request.headers.get('x-openfront-connection-id')??'';if(!OPAQUE_ID.test(tenantId)||!OPAQUE_ID.test(connectionId))return Response.json({error:'installation_required'},{status:401})
 const adapter=new SandboxAdapter(kind,secret),verified=adapter.verifyWebhook(raw,request.headers,`${tenantId}.${connectionId}`);if(!verified.valid||!verified.event)return Response.json({error:'invalid_signature'},{status:401})
 const event=canonicalSandboxEvent(verified.event);if(!event)return Response.json({error:'invalid_event'},{status:400})
 const {keystoneContext}=await import('../../keystone/context');const prisma:any=keystoneContext.prisma
 // All reads and writes run under the signed tenant's transaction-local scope (no global provider discovery).
 return runWithTenantScope(tenantId,async()=>{
 const connection=await prisma.providerConnection.findFirst({where:{id:connectionId,tenantId,adapterId:`sandbox-${kind}`,certificationStatus:'SANDBOX',status:{in:['ACTIVE','DEGRADED']}}});if(!connection)return Response.json({error:'installation_not_admitted'},{status:401})
 const messageHash=createHash('sha256').update(kind).update(timestamp).update(raw).digest('hex'),client=trustedClientKey(request,connection.id),messageKey=`${connection.id}:${event.id}`,bodyHash=evidenceHash(event)
 const priorDecision=async(db:any)=>{const prior=await db.inboxMessage.findFirst({where:{tenantId,messageKey},include:{rawEnvelope:true}});if(!prior)return null;const priorEvent=canonicalSandboxEvent(prior.rawEnvelope?.payload);return priorEvent&&evidenceHash(priorEvent)===bodyHash?'REPLAY':'CONFLICT'}
 try{const receipt=await prisma.$transaction(async(tx:any)=>{await enforceDurableRate(tx,tenantId,client,'sandbox-webhook',60,60_000);const replay=await tx.webhookReplay.findFirst({where:{tenantId,providerConnectionId:connection.id,messageHash}});if(replay)throw new Error('REPLAY');const decision=await priorDecision(tx);if(decision)throw new Error(decision);await tx.webhookReplay.create({data:{tenantId,providerConnectionId:connection.id,messageHash,occurredAt:new Date(timestampMs),expiresAt:new Date(now+REPLAY_MS)}});const envelope=await tx.rawEnvelope.create({data:{tenantId,providerConnectionId:connection.id,direction:'INBOUND',externalId:event.id,schemaVersion:'sandbox.v1',installationRevision:providerInstallationRevision(connection),payload:verified.event,payloadHash:messageHash,receivedAt:new Date()}});const inbox=await tx.inboxMessage.create({data:{tenantId,rawEnvelopeId:envelope.id,messageKey,type:event.type,status:'PENDING',attempts:0,availableAt:new Date()}});return{inboxId:inbox.id,envelopeId:envelope.id}} ,{isolationLevel:'Serializable'});return Response.json({accepted:true,durable:true,...receipt},{status:202})}catch(error){let message=error instanceof Error?error.message:'FAILED';if((error as any)?.code==='P2002')message=(await priorDecision(prisma).catch(()=>null))??'UNAVAILABLE';if(message==='REPLAY')return Response.json({error:'replay'},{status:409});if(message==='CONFLICT')return Response.json({error:'event_conflict'},{status:409});if(message==='RATE_LIMITED')return Response.json({error:'rate_limited'},{status:429,headers:{'retry-after':'60'}});return Response.json({error:'temporarily_unavailable'},{status:503})}
 })
}

const OPAQUE_ID=/^[A-Za-z0-9_-]{1,64}$/,EVENT_ID=/^[A-Za-z0-9_.:-]{1,128}$/,EVENT_TYPE=/^[a-z][a-z0-9_]*(\.[a-z0-9_]+){1,6}\.v[0-9]{1,3}$/,INSTANT=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,9})?)?(Z|[+-]\d{2}:\d{2})$/
const jsonDepth=(value:unknown,level=0):number=>value&&typeof value==='object'?Math.max(level+1,...Object.values(value as object).map(item=>jsonDepth(item,level+1))):level
/** Versioned canonical contract for signed sandbox events: bounded id/type, explicit provider occurrence instant, bounded object payload. */
function canonicalSandboxEvent(value:unknown){if(!value||typeof value!=='object'||Array.isArray(value))return null;const event=value as Record<string,unknown>,occurred=typeof event.occurredAt==='string'&&INSTANT.test(event.occurredAt)?new Date(event.occurredAt):null;if(typeof event.id!=='string'||!EVENT_ID.test(event.id)||typeof event.type!=='string'||!EVENT_TYPE.test(event.type)||!occurred||Number.isNaN(occurred.getTime())||occurred.getTime()>Date.now()+REPLAY_MS||!event.payload||typeof event.payload!=='object'||Array.isArray(event.payload)||jsonDepth(event.payload)>8)return null;return{id:event.id,type:event.type,occurredAt:event.occurredAt as string,payload:event.payload as Record<string,unknown>}}
