import { keystoneContext } from '@/features/keystone/context'
import { sandboxRateLimit } from '@/features/sportsbook/api/rate-limit'
import { authenticateCustomerRequest } from '@/features/sportsbook/customer/auth'
import { assertCustomerMutationRequest, assertSandboxEnabled, CustomerError, errorResponse, readJsonObject } from '@/features/sportsbook/customer/errors'
import { fundCustomerWallet, withdrawCustomerWallet } from '@/features/sportsbook/customer/funding'
import { getCustomerWallet } from '@/features/sportsbook/customer/queries'

export async function GET(request: Request) {
  try {
    assertSandboxEnabled()
    const actor = await authenticateCustomerRequest(keystoneContext.prisma, request, true)
    return Response.json(await getCustomerWallet(keystoneContext.prisma, actor), { headers: { 'cache-control': 'no-store' } })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function PUT(request: Request) {
  try {
    assertSandboxEnabled(); assertCustomerMutationRequest(request)
    const actor = await authenticateCustomerRequest(keystoneContext.prisma, request)
    if (await sandboxRateLimit(keystoneContext.prisma, request, 10, 60_000, 'customer-withdrawal', { tenantId: actor.tenantId, identity: actor.playerId })) throw new CustomerError('RATE_LIMITED', 429)
    const body = await readJsonObject(request)
    if ('subject' in body || 'playerId' in body || 'tenantId' in body) throw new CustomerError('CALLER_OWNERSHIP_FORBIDDEN', 400)
    const result = await withdrawCustomerWallet(keystoneContext.prisma, actor, { amountMinor: body.amountMinor, idempotencyKey: body.idempotencyKey, currency: body.currency })
    return Response.json(result, { status: result.state === 'SUCCEEDED' ? (result.duplicate ? 200 : 201) : result.state === 'PENDING' || result.state === 'IN_PROGRESS' ? 202 : 422, headers: { 'cache-control': 'no-store' } })
  } catch (error) { return errorResponse(error) }
}

export async function POST(request: Request) {
  try {
    assertSandboxEnabled()
    assertCustomerMutationRequest(request)
    const actor = await authenticateCustomerRequest(keystoneContext.prisma, request)
    if (await sandboxRateLimit(keystoneContext.prisma, request, 20, 60_000, 'customer-funding', { tenantId: actor.tenantId, identity: actor.playerId })) throw new CustomerError('RATE_LIMITED', 429)
    const body = await readJsonObject(request)
    if ('subject' in body || 'playerId' in body || 'tenantId' in body) throw new CustomerError('CALLER_OWNERSHIP_FORBIDDEN', 400)
    const result = await fundCustomerWallet(keystoneContext.prisma, actor, { amountMinor: body.amountMinor, idempotencyKey: body.idempotencyKey, currency: body.currency })
    return Response.json(result, { status: result.state === 'SUCCEEDED' ? (result.duplicate ? 200 : 201) : result.state === 'PENDING' || result.state === 'IN_PROGRESS' ? 202 : 422, headers: { 'cache-control': 'no-store' } })
  } catch (error) {
    return errorResponse(error)
  }
}
