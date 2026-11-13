import { keystoneContext } from '@/features/keystone/context'
import { sandboxRateLimit } from '@/features/sportsbook/api/rate-limit'
import { authenticateCustomerRequest } from '@/features/sportsbook/customer/auth'
import { placeCombinationWager } from '@/features/sportsbook/customer/combination-wagering'
import { assertCustomerMutationRequest, CustomerError, errorResponse, readJsonObject } from '@/features/sportsbook/customer/errors'

export async function POST(request: Request) {
  try {
    assertCustomerMutationRequest(request)
    if (await sandboxRateLimit(keystoneContext.prisma, request, 60, 60_000, 'customer-combination-wager')) throw new CustomerError('RATE_LIMITED', 429)
    const actor = await authenticateCustomerRequest(keystoneContext.prisma, request)
    const body = await readJsonObject(request)
    const result = await placeCombinationWager(keystoneContext.prisma, actor, { quoteId: body.quoteId, idempotencyKey: body.idempotencyKey, allowPartial: body.allowPartial, bonusAwardId: body.bonusAwardId })
    return Response.json(result, { status: result.accepted ? 201 : 422, headers: { 'cache-control': 'no-store' } })
  } catch (error) { return errorResponse(error) }
}
