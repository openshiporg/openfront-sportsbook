import { PrismaClient } from '../../keystone/prisma'
import { evidenceHash } from '../domain/engine'

const prisma=new PrismaClient()
async function main(){const tenants=await prisma.tenant.findMany({select:{id:true}});for(const tenant of tenants){const events=await prisma.auditEvent.findMany({where:{tenantId:tenant.id},orderBy:[{createdAt:'asc'},{id:'asc'}]});let previous='';for(const event of events){if(event.previousHash!==previous)throw new Error(`AUDIT_PREVIOUS_HASH_MISMATCH:${tenant.id}:${event.id}`);const expected=evidenceHash({tenantId:tenant.id,previousHash:previous,actorId:event.actorId,action:event.action,targetType:event.targetType,targetId:event.targetId,reason:event.reason,payloadHash:event.payloadHash});if(event.hash!==expected)throw new Error(`AUDIT_HASH_MISMATCH:${tenant.id}:${event.id}`);previous=event.hash}process.stdout.write(JSON.stringify({tenantId:tenant.id,eventCount:events.length,chainHeadHash:previous})+'\n')}}
main().finally(()=>prisma.$disconnect())
