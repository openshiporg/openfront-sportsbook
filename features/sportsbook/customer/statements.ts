import type { PrismaClient } from '../../keystone/prisma'
import { assertCurrentCustomerActor, type CustomerActor } from './auth'
import { resolveTenantCurrency } from './currency'
import { parseStatementPeriod, summarizeAccountLedger } from './statement-ledger'
import { CustomerError } from './errors'
import { appendCustomerAudit } from './audit'
import { claimCustomerCommand, commandResult, finishCustomerCommand, validateIdempotencyKey } from './idempotency'
const STATEMENT_PAGE_SIZE=50
/** Owned statement history, newest period first, with a stable owner-checked cursor so older periods stay retrievable. */
export async function getCustomerStatements(prisma:PrismaClient,actor:CustomerActor,input:{cursor?:unknown}={}){
  const cursor=typeof input.cursor==='string'&&input.cursor.trim()?input.cursor.trim():undefined
  if(cursor&&!/^[A-Za-z0-9_-]{1,64}$/.test(cursor))throw new CustomerError('INVALID_CURSOR',400)
  if(cursor&&!(await prisma.playerStatement.findFirst({where:{id:cursor,tenantId:actor.tenantId,playerId:actor.playerId},select:{id:true}})))throw new CustomerError('INVALID_CURSOR',400)
  const rows=await prisma.playerStatement.findMany({where:{tenantId:actor.tenantId,playerId:actor.playerId},orderBy:[{periodEnd:'desc'},{id:'desc'}],take:STATEMENT_PAGE_SIZE+1,...(cursor?{cursor:{id:cursor},skip:1}:{})}),page=rows.slice(0,STATEMENT_PAGE_SIZE)
  return{nextCursor:rows.length>STATEMENT_PAGE_SIZE?page[page.length-1]?.id??null:null,statements:page.map(row=>({id:row.id,periodStart:row.periodStart.toISOString(),periodEnd:row.periodEnd.toISOString(),openingMinor:row.openingMinor,closingMinor:row.closingMinor,currency:row.currency,journalHash:row.journalHash,artifactReference:row.artifactReference,status:row.status,createdAt:row.createdAt.toISOString()}))}
}
export async function createCustomerStatement(prisma:PrismaClient,actor:CustomerActor,input:{periodStart:unknown;periodEnd:unknown;idempotencyKey:unknown}){
  const {periodStart,periodEnd}=parseStatementPeriod(input.periodStart,input.periodEnd)
  const currency=await resolveTenantCurrency(prisma,actor.tenantId)
  if(actor.currency&&actor.currency!==currency.code)throw new CustomerError('CUSTOMER_CURRENCY_CHANGED',409)
  const idempotencyKey=validateIdempotencyKey(input.idempotencyKey),claimed=await claimCustomerCommand(prisma,{tenantId:actor.tenantId,playerId:actor.playerId,type:'PROFILE',idempotencyKey,request:{action:'STATEMENT',periodStart,periodEnd,currency:currency.code}}),stored=commandResult(claimed.command)
  // Statements are private servicing: still available to the owner while new business is paused (B-028).
  if(stored&&claimed.command.status!=='IN_PROGRESS'){await assertCurrentCustomerActor(prisma,actor,false,new Date(),true);return stored}
  // One serializable snapshot: authority, complete ledger aggregation, statement row and command receipt commit together.
  return prisma.$transaction(async tx=>{
    await assertCurrentCustomerActor(tx,actor,true,new Date(),true)
    const command=await tx.customerCommand.findUnique({where:{id:claimed.command.id}}),prior=command?commandResult(command):null
    if(command&&command.status!=='IN_PROGRESS'&&prior)return prior
    const account=await tx.ledgerAccount.findFirst({where:{tenantId:actor.tenantId,playerId:actor.playerId,key:'PLAYER_CASH',currency:currency.code}})
    if(!account)throw new CustomerError('WALLET_UNAVAILABLE',409)
    const summary=await summarizeAccountLedger(tx,{tenantId:actor.tenantId,accountId:account.id,currency:currency.code,periodStart,periodEnd})
    // A ledger summary only: no statement document is generated or stored, so no artifact is claimed.
    const statement=await tx.playerStatement.create({data:{tenantId:actor.tenantId,playerId:actor.playerId,periodStart,periodEnd,openingMinor:String(summary.opening),closingMinor:String(summary.closing),currency:currency.code,journalHash:summary.journalHash,artifactReference:'',status:'READY'}})
    await appendCustomerAudit(tx,{tenantId:actor.tenantId,playerId:actor.playerId,action:'customer.statement_generated',targetType:'PlayerStatement',targetId:statement.id,reason:'CUSTOMER_REQUEST',payload:{periodStart,periodEnd,currency:currency.code,openingMinor:String(summary.opening),closingMinor:String(summary.closing),journalHash:summary.journalHash,rowCount:summary.rowCount,entriesCovered:summary.entriesCovered}})
    const result={state:'READY',kind:'LEDGER_SUMMARY',duplicate:claimed.duplicate,statementId:statement.id,periodStart:periodStart.toISOString(),periodEnd:periodEnd.toISOString(),openingMinor:String(summary.opening),closingMinor:String(summary.closing),currency:currency.code,currencyExponent:currency.exponent,journalHash:summary.journalHash,artifactReference:'',rowCount:summary.rowCount}
    await finishCustomerCommand(tx,claimed.command.id,'SUCCEEDED',result)
    return result
  },{isolationLevel:'Serializable'})
}
