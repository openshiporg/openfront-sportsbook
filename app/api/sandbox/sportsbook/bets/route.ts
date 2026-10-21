import { keystoneContext } from '@/features/keystone/context'
// Owned private servicing stays available while new business is paused (closure, suspension).
import { authenticateCustomerServicingRequest as authenticateCustomerRequest } from '@/features/sportsbook/customer/auth'
import { assertSandboxEnabled, errorResponse } from '@/features/sportsbook/customer/errors'
import { getCustomerBets } from '@/features/sportsbook/customer/queries'

export async function GET(request: Request) {
  try {
    assertSandboxEnabled()
    const actor = await authenticateCustomerRequest(keystoneContext.prisma, request)
    return Response.json(await getCustomerBets(keystoneContext.prisma, actor, new URL(request.url).searchParams.get('cursor')), { headers: { 'cache-control': 'no-store' } })
  } catch (error) {
    return errorResponse(error)
  }
}
