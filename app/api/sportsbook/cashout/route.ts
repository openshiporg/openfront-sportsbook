import { keystoneContext } from '@/features/keystone/context'
import { authenticateCustomerRequest } from '@/features/sportsbook/customer/auth'
import { acceptCustomerCashOut, getCustomerCashOuts, requestCustomerCashOut } from '@/features/sportsbook/customer/cashout'
import { assertCustomerMutationRequest, errorResponse, readJsonObject } from '@/features/sportsbook/customer/errors'

export async function GET(request: Request) {
  try { return Response.json(await getCustomerCashOuts(keystoneContext.prisma, await authenticateCustomerRequest(keystoneContext.prisma, request)), { headers: { 'cache-control': 'no-store' } }) }
  catch (error) { return errorResponse(error) }
}
export async function POST(request: Request) {
  try { assertCustomerMutationRequest(request); const actor = await authenticateCustomerRequest(keystoneContext.prisma, request); const body = await readJsonObject(request); return Response.json(await requestCustomerCashOut(keystoneContext.prisma, actor, { wagerId: body.wagerId, portionBps: body.portionBps }), { status: 201, headers: { 'cache-control': 'no-store' } }) }
  catch (error) { return errorResponse(error) }
}
export async function PUT(request: Request) {
  try { assertCustomerMutationRequest(request); const actor = await authenticateCustomerRequest(keystoneContext.prisma, request); const body = await readJsonObject(request); return Response.json(await acceptCustomerCashOut(keystoneContext.prisma, actor, { offerId: body.offerId, idempotencyKey: body.idempotencyKey }), { status: 201, headers: { 'cache-control': 'no-store' } }) }
  catch (error) { return errorResponse(error) }
}
