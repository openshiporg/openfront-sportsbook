import type { PrismaClient } from '../../keystone/prisma'

export async function assertOperatorReady(prisma: PrismaClient | any, tenantId: string, request?: Request) {
  if (!tenantId) throw new Error('OPERATOR_NOT_LICENSED')
  const now = new Date()
  const licences = await prisma.operatorLicence.findMany({ where: { tenantId, status: 'ACTIVE', expiresAt: { gt: now } } })
  const licence = licences.find((item: any) => item.licenceNumber && item.regulator && Array.isArray(item.permittedRegions) && item.permittedRegions.length)
  if (!licence) throw new Error('OPERATOR_NOT_LICENSED')
  const payments = await prisma.providerConnection.findFirst({ where: { tenantId, status: 'ACTIVE', adapterId: { in: ['authorizenet', 'paysafe', 'aeropay', 'manual', 'sandbox-payments'] } }, select: { id: true } })
  if (!payments) throw new Error('PAYMENTS_NOT_CONFIGURED')
  const responsible = await prisma.responsibleGamingConfig.findFirst({ where: { tenantId } }).catch(() => null)
  if (prisma.responsibleGamingConfig && !responsible) throw new Error('RESPONSIBLE_GAMING_NOT_CONFIGURED')
  const region = request?.headers.get('x-vercel-ip-country-region') || request?.headers.get('cf-ipcountry') || request?.headers.get('x-geo-region') || (process.env.NODE_ENV !== 'production' ? process.env.GEO_DEV_REGION : '')
  if (!region || !licence.permittedRegions.includes(region.toUpperCase())) throw new Error('GEO_BLOCKED')
  return licence
}

export function assertSandboxRuntime() { /* Runtime admission is enforced by tenant-scoped assertOperatorReady. */ }

export function assertSameOrigin(request: Request) {
 const configured=process.env.SANDBOX_PUBLIC_ORIGIN;const origin=request.headers.get('origin');if(configured&&origin!==configured)throw new Error('ORIGIN_DENIED');const fetchSite=request.headers.get('sec-fetch-site');if(fetchSite&&fetchSite!=='same-origin'&&fetchSite!=='none')throw new Error('ORIGIN_DENIED')
}
