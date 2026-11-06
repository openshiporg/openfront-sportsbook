import { GraphQLClient } from 'graphql-request'
import { getAuthHeaders } from '../../dashboard/lib/cookies'
import { getServerGraphQLTarget } from '../../dashboard/lib/getBaseUrl'

const DOMAIN_CODE = /^[A-Z][A-Z0-9_:]{2,80}$/

/**
 * Operator read that keeps a sportsbook domain refusal code (for example SETTLEMENT_TAX_POLICY_REQUIRED) so a desk can
 * say why a record is blocked. Only bare UPPER_SNAKE codes pass through; any other error text stays server-side.
 */
export async function domainQuery<T>(query: string, variables: Record<string, unknown>): Promise<{ data: T; code: null } | { data: null; code: string }> {
  try {
    const { endpoint, fetch: internalFetch } = await getServerGraphQLTarget()
    const client = new GraphQLClient(endpoint, { credentials: 'include', ...(internalFetch ? { fetch: internalFetch } : {}), redirect: 'error', headers: (await getAuthHeaders()) || {} })
    return { data: await client.request<T>(query, variables), code: null }
  } catch (error) {
    const errors = (error as { response?: { errors?: Array<{ message?: unknown; extensions?: { code?: unknown } }> } })?.response?.errors ?? []
    const code = errors.map(entry => String(entry?.extensions?.code ?? entry?.message ?? '')).find(value => DOMAIN_CODE.test(value) && !value.startsWith('KS_') && value !== 'INTERNAL_SERVER_ERROR')
    return { data: null, code: code ?? 'SETTLEMENT_PLAN_UNAVAILABLE' }
  }
}
