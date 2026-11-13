import { keystoneContext } from '@/features/keystone/context'
import { sandboxRateLimit } from '@/features/sportsbook/api/rate-limit'
import { completeCustomerRecovery, requestCustomerRecovery } from '@/features/sportsbook/customer/credentials'
import { assertCustomerMutationRequest, CustomerError, errorResponse, readJsonObject } from '@/features/sportsbook/customer/errors'

export async function POST(request: Request) {
  try {
    assertCustomerMutationRequest(request)
    if (await sandboxRateLimit(keystoneContext.prisma, request, 5, 60_000, 'customer-recovery')) throw new CustomerError('RATE_LIMITED', 429)
    const body = await readJsonObject(request)
    return Response.json(await requestCustomerRecovery(keystoneContext.prisma, { email: body.email }), { headers: { 'cache-control': 'no-store' } })
  } catch (error) { return errorResponse(error) }
}

export async function PUT(request: Request) {
  try {
    assertCustomerMutationRequest(request)
    if (await sandboxRateLimit(keystoneContext.prisma, request, 10, 60_000, 'customer-recovery-complete')) throw new CustomerError('RATE_LIMITED', 429)
    const body = await readJsonObject(request)
    return Response.json(await completeCustomerRecovery(keystoneContext.prisma, { token: body.token, password: body.password }), { headers: { 'cache-control': 'no-store' } })
  } catch (error) { return errorResponse(error) }
}
