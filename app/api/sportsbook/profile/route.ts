import { keystoneContext } from '@/features/keystone/context'
import { getCustomerProfile, updateCustomerProfile } from '@/features/sportsbook/customer/account'
// Owned private servicing stays available while new business is paused (closure, suspension).
import { authenticateCustomerServicingRequest as authenticateCustomerRequest } from '@/features/sportsbook/customer/auth'
import { assertCustomerMutationRequest, errorResponse, readJsonObject } from '@/features/sportsbook/customer/errors'
export async function GET(request: Request) { try { return Response.json(await getCustomerProfile(keystoneContext.prisma, await authenticateCustomerRequest(keystoneContext.prisma, request)), { headers: { 'cache-control': 'no-store' } }) } catch (error) { return errorResponse(error) } }
export async function PUT(request: Request) { try { assertCustomerMutationRequest(request); const actor=await authenticateCustomerRequest(keystoneContext.prisma,request),body=await readJsonObject(request); return Response.json(await updateCustomerProfile(keystoneContext.prisma,actor,{locale:body.locale,timezone:body.timezone,preferredOddsFormat:body.preferredOddsFormat,marketingAllowed:body.marketingAllowed,idempotencyKey:body.idempotencyKey})) } catch(error){return errorResponse(error)} }
