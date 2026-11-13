import { keystoneContext } from '@/features/keystone/context'
import { customerRateLimit } from '@/features/sportsbook/api/rate-limit'
import { authenticateCustomerRequest } from '@/features/sportsbook/customer/auth'
import { placeCombinationWager } from '@/features/sportsbook/customer/combination-wagering'
import { assertCustomerMutationRequest, CustomerError, errorResponse, readJsonObject } from '@/features/sportsbook/customer/errors'

/** Places a quoted single through the same engine as the bet slip, so every wager carries settleable parts. */
export async function POST(request: Request) {
  try {
    assertCustomerMutationRequest(request)
    const actor = await authenticateCustomerRequest(keystoneContext.prisma, request)
    if (await customerRateLimit(keystoneContext.prisma, request, 30, 60_000, 'customer-wager', { tenantId: actor.tenantId, identity: actor.playerId })) throw new CustomerError('RATE_LIMITED', 429)
    const body = await readJsonObject(request)
    if ('subject' in body || 'playerId' in body || 'tenantId' in body) throw new CustomerError('CALLER_OWNERSHIP_FORBIDDEN', 400)
    const result = await placeCombinationWager(keystoneContext.prisma, actor, { quoteId: body.quoteId, idempotencyKey: body.idempotencyKey, allowPartial: false })
    return Response.json(result, { status: result.accepted ? (result.duplicate ? 200 : 201) : 422, headers: { 'cache-control': 'no-store' } })
  } catch (error) {
    return errorResponse(error)
  }
}
