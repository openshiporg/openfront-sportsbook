import { keystoneContext } from '@/features/keystone/context'
// Owned private servicing stays available while new business is paused (closure, suspension).
import { authenticateCustomerServicingRequest as authenticateCustomerRequest } from '@/features/sportsbook/customer/auth'
import { listCustomerDevices, revokeCustomerDevice } from '@/features/sportsbook/customer/credentials'
import { assertCustomerMutationRequest, errorResponse, readJsonObject } from '@/features/sportsbook/customer/errors'

export async function GET(request: Request) {
  try { return Response.json(await listCustomerDevices(keystoneContext.prisma, await authenticateCustomerRequest(keystoneContext.prisma, request), { cursor: new URL(request.url).searchParams.get('cursor') ?? undefined }), { headers: { 'cache-control': 'no-store' } }) }
  catch (error) { return errorResponse(error) }
}
export async function DELETE(request: Request) {
  try { assertCustomerMutationRequest(request); const actor = await authenticateCustomerRequest(keystoneContext.prisma, request); const body = await readJsonObject(request); return Response.json(await revokeCustomerDevice(keystoneContext.prisma, actor, body.deviceId)) }
  catch (error) { return errorResponse(error) }
}
