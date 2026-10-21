import { NextResponse } from 'next/server'
import { keystoneContext } from '@/features/keystone/context'
import { sandboxRateLimit } from '@/features/sportsbook/api/rate-limit'
import { CUSTOMER_COOKIE, customerCookieOptions } from '@/features/sportsbook/customer/auth'
import { registerCredentialCustomer, resolveCustomerTerms } from '@/features/sportsbook/customer/credentials'
import { assertCustomerMutationRequest, assertSandboxEnabled, CustomerError, errorResponse, readJsonObject } from '@/features/sportsbook/customer/errors'
import { getCustomerSessionSummary } from '@/features/sportsbook/customer/queries'
import { resolveSandboxTenant } from '@/features/sportsbook/api/sandbox-tenant'

/** The current operator-published terms revision the registration form must show and have accepted. */
export async function GET() {
  try {
    assertSandboxEnabled()
    const tenant = await resolveSandboxTenant(keystoneContext.prisma)
    const terms = await resolveCustomerTerms(keystoneContext.prisma, tenant.id)
    return Response.json({ termsVersion: terms.termsVersion, termsContentHash: terms.termsContentHash, locale: terms.locale }, { headers: { 'cache-control': 'no-store' } })
  } catch (error) { return errorResponse(error) }
}

export async function POST(request: Request) {
  try {
    assertCustomerMutationRequest(request)
    if (await sandboxRateLimit(keystoneContext.prisma, request, 5, 60_000, 'customer-credential-register')) throw new CustomerError('RATE_LIMITED', 429)
    const body = await readJsonObject(request)
    const created = await registerCredentialCustomer(keystoneContext.prisma, request, { email: body.email, password: body.password, locale: body.locale, timezone: body.timezone, marketingConsent: body.marketingConsent, acceptedTermsVersion: body.acceptedTermsVersion, acceptedTermsContentHash: body.acceptedTermsContentHash })
    const response = NextResponse.json({ ...(await getCustomerSessionSummary(keystoneContext.prisma, created.actor)), emailMasked: created.emailMasked }, { status: 201, headers: { 'cache-control': 'no-store' } })
    response.cookies.set(CUSTOMER_COOKIE, created.token, customerCookieOptions())
    return response
  } catch (error) { return errorResponse(error) }
}
