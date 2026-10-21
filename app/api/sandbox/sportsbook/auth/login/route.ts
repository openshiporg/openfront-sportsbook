import { NextResponse } from 'next/server'
import { keystoneContext } from '@/features/keystone/context'
import { sandboxRateLimit } from '@/features/sportsbook/api/rate-limit'
import { CUSTOMER_COOKIE, customerCookieOptions } from '@/features/sportsbook/customer/auth'
import { loginCredentialCustomer } from '@/features/sportsbook/customer/credentials'
import { assertCustomerMutationRequest, CustomerError, errorResponse, readJsonObject } from '@/features/sportsbook/customer/errors'
import { getCustomerSessionSummary } from '@/features/sportsbook/customer/queries'

export async function POST(request: Request) {
  try {
    assertCustomerMutationRequest(request)
    if (await sandboxRateLimit(keystoneContext.prisma, request, 10, 60_000, 'customer-credential-login')) throw new CustomerError('RATE_LIMITED', 429)
    const body = await readJsonObject(request)
    const authenticated = await loginCredentialCustomer(keystoneContext.prisma, request, { email: body.email, password: body.password })
    const response = NextResponse.json({ ...(await getCustomerSessionSummary(keystoneContext.prisma, authenticated.actor)), emailMasked: authenticated.emailMasked }, { headers: { 'cache-control': 'no-store' } })
    response.cookies.set(CUSTOMER_COOKIE, authenticated.token, customerCookieOptions())
    return response
  } catch (error) { return errorResponse(error) }
}
