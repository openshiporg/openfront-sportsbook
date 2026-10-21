import { NextResponse } from 'next/server'
import { keystoneContext } from '@/features/keystone/context'
import { sandboxRateLimit } from '@/features/sportsbook/api/rate-limit'
import { CUSTOMER_COOKIE, customerCookieOptions, optionalCustomerRequest } from '@/features/sportsbook/customer/auth'
import { assertCustomerMutationRequest, assertSandboxEnabled, CustomerError, errorResponse, readJsonObject } from '@/features/sportsbook/customer/errors'
import { getCustomerSessionSummary } from '@/features/sportsbook/customer/queries'
import { registerSandboxCustomer } from '@/features/sportsbook/customer/registration'

export async function POST(request: Request) {
  try {
    assertSandboxEnabled()
    assertCustomerMutationRequest(request)
    if (await sandboxRateLimit(keystoneContext.prisma, request, 10, 60_000, 'customer-register')) {
      throw new CustomerError('RATE_LIMITED', 429)
    }
    const contentLength = Number(request.headers.get('content-length') ?? '0')
    if (contentLength > 0) {
      const body = await readJsonObject(request)
      if ('subject' in body || 'playerId' in body || 'tenantId' in body) {
        throw new CustomerError('CALLER_OWNERSHIP_FORBIDDEN', 400)
      }
    }
    const existing = await optionalCustomerRequest(keystoneContext.prisma, request)
    if (existing) {
      return NextResponse.json(await getCustomerSessionSummary(keystoneContext.prisma, existing), { headers: { 'cache-control': 'no-store' } })
    }
    const created = await registerSandboxCustomer(keystoneContext.prisma)
    const response = NextResponse.json(
      await getCustomerSessionSummary(keystoneContext.prisma, created.actor),
      { status: 201, headers: { 'cache-control': 'no-store' } },
    )
    response.cookies.set(CUSTOMER_COOKIE, created.token, customerCookieOptions())
    return response
  } catch (error) {
    return errorResponse(error)
  }
}
