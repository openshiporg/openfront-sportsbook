import { keystoneContext } from '@/features/keystone/context'
import { authenticateCustomerRequest } from '@/features/sportsbook/customer/auth'
import { assertCustomerMutationRequest, errorResponse, readJsonObject } from '@/features/sportsbook/customer/errors'
import { claimCustomerPromotion, getCustomerPromotions } from '@/features/sportsbook/customer/promotions'

export async function GET(request: Request) {
  try { return Response.json(await getCustomerPromotions(keystoneContext.prisma, await authenticateCustomerRequest(keystoneContext.prisma, request)), { headers: { 'cache-control': 'no-store' } }) }
  catch (error) { return errorResponse(error) }
}
export async function POST(request: Request) {
  try { assertCustomerMutationRequest(request); const actor = await authenticateCustomerRequest(keystoneContext.prisma, request); const body = await readJsonObject(request); return Response.json(await claimCustomerPromotion(keystoneContext.prisma, actor, { promotionId: body.promotionId, idempotencyKey: body.idempotencyKey }), { status: 201, headers: { 'cache-control': 'no-store' } }) }
  catch (error) { return errorResponse(error) }
}
