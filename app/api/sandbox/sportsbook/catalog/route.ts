import { keystoneContext } from '@/features/keystone/context'
import { getSandboxCatalog, parseCatalogFilters } from '@/features/sportsbook/customer/catalog'
import { assertSandboxEnabled, errorResponse } from '@/features/sportsbook/customer/errors'

export async function GET(request: Request) {
  try {
    assertSandboxEnabled()
    return Response.json(await getSandboxCatalog(keystoneContext.prisma, parseCatalogFilters(new URL(request.url).searchParams)), { headers: { 'cache-control': 'no-store' } })
  } catch (error) {
    return errorResponse(error)
  }
}
