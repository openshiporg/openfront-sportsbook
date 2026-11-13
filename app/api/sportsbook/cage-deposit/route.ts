import { keystoneContext } from '@/features/keystone/context'
import { sandboxRateLimit } from '@/features/sportsbook/api/rate-limit'
import { authenticateCustomerRequest } from '@/features/sportsbook/customer/auth'
import { requestCageDeposit } from '@/features/sportsbook/customer/cage-deposit'
import { assertCustomerMutationRequest, CustomerError, errorResponse, readJsonObject } from '@/features/sportsbook/customer/errors'

export async function POST(request: Request) {
  try {
    assertCustomerMutationRequest(request)
    const actor = await authenticateCustomerRequest(keystoneContext.prisma, request)
    if (await sandboxRateLimit(keystoneContext.prisma, request, 10, 60_000, 'customer-cage-deposit', { tenantId: actor.tenantId, identity: actor.playerId })) throw new CustomerError('RATE_LIMITED', 429)
    const body = await readJsonObject(request)
    if ('subject' in body || 'playerId' in body || 'tenantId' in body) throw new CustomerError('CALLER_OWNERSHIP_FORBIDDEN', 400)
    const result = await requestCageDeposit(keystoneContext.prisma, actor, { amountMinor: body.amountMinor, idempotencyKey: body.idempotencyKey })
    return Response.json(result, { status: result.duplicate ? 200 : 202, headers: { 'cache-control': 'no-store' } })
  } catch (error) { return errorResponse(error) }
}
