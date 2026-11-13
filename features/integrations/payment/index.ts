export type { CapabilitySet, CanonicalEnvelope, HealthReport, ProviderAdapter } from '../../sportsbook/adapters/contracts'

export const paymentProviderAdapters = {
  authorizenet: () => import('./authorizenet'),
  stripe: () => import('./stripe'),
  manual: () => import('./manual'),
} as const
