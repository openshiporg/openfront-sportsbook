import { keystoneContext } from '@/features/keystone/context'
import { getCustomerFavorites, toggleCustomerFavorite } from '@/features/sportsbook/customer/account'
import { authenticateCustomerRequest } from '@/features/sportsbook/customer/auth'
import { assertCustomerMutationRequest, errorResponse, readJsonObject } from '@/features/sportsbook/customer/errors'
export async function GET(request: Request) { try { return Response.json(await getCustomerFavorites(keystoneContext.prisma, await authenticateCustomerRequest(keystoneContext.prisma, request)), { headers: { 'cache-control': 'no-store' } }) } catch(error){return errorResponse(error)} }
export async function PUT(request: Request) { try { assertCustomerMutationRequest(request); const actor=await authenticateCustomerRequest(keystoneContext.prisma,request),body=await readJsonObject(request); return Response.json(await toggleCustomerFavorite(keystoneContext.prisma,actor,{targetType:body.targetType,targetId:body.targetId,favorite:body.favorite})) } catch(error){return errorResponse(error)} }
