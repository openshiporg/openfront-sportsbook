import { keystoneContext } from '@/features/keystone/context'
import { sandboxRateLimit } from '@/features/sportsbook/api/rate-limit'
import { authenticateCustomerRequest } from '@/features/sportsbook/customer/auth'
import { createCombinationQuote } from '@/features/sportsbook/customer/combination-wagering'
import { assertCustomerMutationRequest, CustomerError, errorResponse, readJsonObject } from '@/features/sportsbook/customer/errors'

export async function POST(request: Request) {
  try {
    assertCustomerMutationRequest(request)
    if (await sandboxRateLimit(keystoneContext.prisma, request, 120, 60_000, 'customer-combination-quote')) throw new CustomerError('RATE_LIMITED', 429)
    const actor = await authenticateCustomerRequest(keystoneContext.prisma, request)
    const body = await readJsonObject(request)
    return Response.json(await createCombinationQuote(keystoneContext.prisma, actor, { selectionIds: body.selectionIds, structure: body.structure, stakeMinor: body.stakeMinor, systemSize: body.systemSize, teaserPoints: body.teaserPoints, priceChangeConsent: body.priceChangeConsent, promotionId: body.promotionId }), { status: 201, headers: { 'cache-control': 'no-store' } })
  } catch (error) { return errorResponse(error) }
}
