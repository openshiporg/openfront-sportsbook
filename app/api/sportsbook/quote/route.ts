import { keystoneContext } from '@/features/keystone/context'
import { customerRateLimit } from '@/features/sportsbook/api/rate-limit'
import { authenticateCustomerRequest } from '@/features/sportsbook/customer/auth'
import { createCombinationQuote } from '@/features/sportsbook/customer/combination-wagering'
import { assertCustomerMutationRequest, CustomerError, errorResponse, readJsonObject } from '@/features/sportsbook/customer/errors'

/** Single-selection quote: the same quote engine as the bet slip, as a STRAIGHT with exact price consent. */
export async function POST(request: Request) {
  try {
    assertCustomerMutationRequest(request)
    const actor = await authenticateCustomerRequest(keystoneContext.prisma, request)
    if (await customerRateLimit(keystoneContext.prisma, request, 60, 60_000, 'customer-quote', { tenantId: actor.tenantId, identity: actor.playerId })) throw new CustomerError('RATE_LIMITED', 429)
    const body = await readJsonObject(request)
    if ('subject' in body || 'playerId' in body || 'tenantId' in body || 'decimalOdds' in body || 'priceSnapshotId' in body) {
      throw new CustomerError('CALLER_TERMS_FORBIDDEN', 400)
    }
    const quote = await createCombinationQuote(keystoneContext.prisma, actor, { selectionIds: [body.selectionId], structure: 'STRAIGHT', stakeMinor: body.stakeMinor, priceChangeConsent: 'EXACT' })
    return Response.json(quote, { status: 201, headers: { 'cache-control': 'no-store' } })
  } catch (error) {
    return errorResponse(error)
  }
}
