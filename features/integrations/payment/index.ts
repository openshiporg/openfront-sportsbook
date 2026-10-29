export type { CapabilitySet, CanonicalEnvelope, HealthReport, ProviderAdapter } from '../../sportsbook/adapters/contracts'
export { SandboxAdapter, sandboxAdapters } from '../../sportsbook/adapters/sandbox'

export const paymentProviderAdapters = {
  authorizenet: () => import('./authorizenet'),
  manual: () => import('./manual'),
} as const
