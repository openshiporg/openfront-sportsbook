import { keystoneContext } from '@/features/keystone/context'
import { getCustomerPrivacyRequests, requestCustomerPrivacy } from '@/features/sportsbook/customer/account'
// Owned private servicing stays available while new business is paused (closure, suspension).
import { authenticateCustomerServicingRequest as authenticateCustomerRequest } from '@/features/sportsbook/customer/auth'
import { assertCustomerMutationRequest, errorResponse, readJsonObject } from '@/features/sportsbook/customer/errors'
export async function GET(request: Request) { try { const cursor=new URL(request.url).searchParams.get('cursor')??undefined; return Response.json(await getCustomerPrivacyRequests(keystoneContext.prisma,await authenticateCustomerRequest(keystoneContext.prisma,request),{cursor}),{headers:{'cache-control':'no-store'}}) } catch(error){return errorResponse(error)} }
export async function POST(request: Request) { try { assertCustomerMutationRequest(request); const actor=await authenticateCustomerRequest(keystoneContext.prisma,request),body=await readJsonObject(request); return Response.json(await requestCustomerPrivacy(keystoneContext.prisma,actor,{type:body.type,details:body.details,idempotencyKey:body.idempotencyKey}),{status:201}) } catch(error){return errorResponse(error)} }
