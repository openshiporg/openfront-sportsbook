import { keystoneContext } from '@/features/keystone/context'
// Owned private servicing stays available while new business is paused (closure, suspension).
import { authenticateCustomerServicingRequest as authenticateCustomerRequest } from '@/features/sportsbook/customer/auth'
import { assertCustomerMutationRequest, errorResponse, readJsonObject } from '@/features/sportsbook/customer/errors'
import { createCustomerStatement, getCustomerStatements } from '@/features/sportsbook/customer/statements'
export async function GET(request:Request){try{return Response.json(await getCustomerStatements(keystoneContext.prisma,await authenticateCustomerRequest(keystoneContext.prisma,request),{cursor:new URL(request.url).searchParams.get('cursor')??undefined}),{headers:{'cache-control':'no-store'}})}catch(error){return errorResponse(error)}}
export async function POST(request:Request){try{assertCustomerMutationRequest(request);const actor=await authenticateCustomerRequest(keystoneContext.prisma,request),body=await readJsonObject(request);return Response.json(await createCustomerStatement(keystoneContext.prisma,actor,{periodStart:body.periodStart,periodEnd:body.periodEnd,idempotencyKey:body.idempotencyKey}),{status:201})}catch(error){return errorResponse(error)}}
