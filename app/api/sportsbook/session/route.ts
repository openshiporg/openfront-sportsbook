import { NextResponse } from 'next/server'
import { keystoneContext } from '@/features/keystone/context'
import { CUSTOMER_COOKIE, customerCookieOptions, optionalCustomerRequest, revokeCustomerRequest } from '@/features/sportsbook/customer/auth'
import { assertCustomerMutationRequest, assertSandboxEnabled, errorResponse } from '@/features/sportsbook/customer/errors'
import { getCustomerSessionSummary } from '@/features/sportsbook/customer/queries'

export async function GET(request: Request) {
  try {
    assertSandboxEnabled()
    const actor = await optionalCustomerRequest(keystoneContext.prisma, request, true)
    if (!actor) return Response.json({ authenticated: false, mode: 'sandbox' }, { headers: { 'cache-control': 'no-store' } })
    return Response.json(await getCustomerSessionSummary(keystoneContext.prisma, actor), { headers: { 'cache-control': 'no-store' } })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function DELETE(request: Request) {
  try {
    assertSandboxEnabled()
    assertCustomerMutationRequest(request)
    await revokeCustomerRequest(keystoneContext.prisma, request)
    const response = NextResponse.json({ authenticated: false, mode: 'sandbox' }, { headers: { 'cache-control': 'no-store' } })
    response.cookies.set(CUSTOMER_COOKIE, '', { ...customerCookieOptions(), maxAge: 0 })
    return response
  } catch (error) {
    return errorResponse(error)
  }
}
