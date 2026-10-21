import { keystoneContext } from '@/features/keystone/context'
import { sandboxRateLimit } from '@/features/sportsbook/api/rate-limit'
// Owned private servicing stays available while new business is paused (closure, suspension).
import { authenticateCustomerServicingRequest as authenticateCustomerRequest } from '@/features/sportsbook/customer/auth'
import { assertCustomerMutationRequest, assertSandboxEnabled, CustomerError, errorResponse, readJsonObject } from '@/features/sportsbook/customer/errors'
import { getCustomerLimits } from '@/features/sportsbook/customer/queries'
import { setCustomerLimit } from '@/features/sportsbook/customer/responsible-play'

export async function GET(request: Request) {
  try {
    assertSandboxEnabled()
    const actor = await authenticateCustomerRequest(keystoneContext.prisma, request)
    return Response.json(await getCustomerLimits(keystoneContext.prisma, actor), { headers: { 'cache-control': 'no-store' } })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function POST(request: Request) {
  try {
    assertSandboxEnabled()
    assertCustomerMutationRequest(request)
    const actor = await authenticateCustomerRequest(keystoneContext.prisma, request)
    if (await sandboxRateLimit(keystoneContext.prisma, request, 20, 60_000, 'customer-limits', { tenantId: actor.tenantId, identity: actor.playerId })) throw new CustomerError('RATE_LIMITED', 429)
    const body = await readJsonObject(request)
    if ('subject' in body || 'playerId' in body || 'tenantId' in body) throw new CustomerError('CALLER_OWNERSHIP_FORBIDDEN', 400)
    const result = await setCustomerLimit(keystoneContext.prisma, actor, {
      type: body.type,
      period: body.period,
      amountMinor: body.amountMinor,
      idempotencyKey: body.idempotencyKey,
    })
    return Response.json(result, { status: result.state === 'IN_PROGRESS' ? 409 : 201, headers: { 'cache-control': 'no-store' } })
  } catch (error) {
    return errorResponse(error)
  }
}
