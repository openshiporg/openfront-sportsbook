import { keystoneContext } from '@/features/keystone/context'
import { sandboxRateLimit } from '@/features/sportsbook/api/rate-limit'
import { authenticateCustomerRequest } from '@/features/sportsbook/customer/auth'
import { assertCustomerMutationRequest, assertSandboxEnabled, CustomerError, errorResponse, readJsonObject } from '@/features/sportsbook/customer/errors'
import { createCustomerQuote } from '@/features/sportsbook/customer/wagering'

export async function POST(request: Request) {
  try {
    assertSandboxEnabled()
    assertCustomerMutationRequest(request)
    const actor = await authenticateCustomerRequest(keystoneContext.prisma, request)
    if (await sandboxRateLimit(keystoneContext.prisma, request, 60, 60_000, 'customer-quote', { tenantId: actor.tenantId, identity: actor.playerId })) throw new CustomerError('RATE_LIMITED', 429)
    const body = await readJsonObject(request)
    if ('subject' in body || 'playerId' in body || 'tenantId' in body || 'decimalOdds' in body || 'priceSnapshotId' in body) {
      throw new CustomerError('CALLER_TERMS_FORBIDDEN', 400)
    }
    const quote = await createCustomerQuote(keystoneContext.prisma, actor, {
      selectionId: body.selectionId,
      stakeMinor: body.stakeMinor,
    })
    return Response.json(quote, { status: 201, headers: { 'cache-control': 'no-store' } })
  } catch (error) {
    return errorResponse(error)
  }
}
