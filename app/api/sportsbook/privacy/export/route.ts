import { keystoneContext } from '@/features/keystone/context'
// A closed or paused account still receives the copy of its own data it asked for.
import { authenticateCustomerServicingRequest } from '@/features/sportsbook/customer/auth'
import { errorResponse } from '@/features/sportsbook/customer/errors'
import { buildCustomerPrivacyExport } from '@/features/sportsbook/customer/privacy-export'

export async function GET(request: Request) {
  try {
    const actor = await authenticateCustomerServicingRequest(keystoneContext.prisma, request)
    const result = await buildCustomerPrivacyExport(keystoneContext.prisma, actor, new URL(request.url).searchParams.get('requestId'))
    return new Response(JSON.stringify(result.body, null, 2), { headers: { 'content-type': 'application/json; charset=utf-8', 'content-disposition': `attachment; filename="${result.filename}"`, 'cache-control': 'no-store' } })
  } catch (error) { return errorResponse(error) }
}
