import { keystoneContext } from '@/features/keystone/context'
import { getCustomerCatalog, parseCatalogFilters } from '@/features/sportsbook/customer/catalog'
import { advanceOperatorClock } from '@/features/sportsbook/adapters/catalog-rollover'
import { errorResponse } from '@/features/sportsbook/customer/errors'

export async function GET(request: Request) {
  try {
    await advanceOperatorClock(keystoneContext.prisma)
    return Response.json(await getCustomerCatalog(keystoneContext.prisma, parseCatalogFilters(new URL(request.url).searchParams)), { headers: { 'cache-control': 'no-store' } })
  } catch (error) {
    return errorResponse(error)
  }
}
