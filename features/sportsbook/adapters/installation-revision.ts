import { evidenceHash } from '../domain/engine'

type Installation = { id: string; adapterId?: string | null; adapterVersion?: string | null; configReference?: string | null }

/**
 * Immutable identity of the provider installation/config that verified an inbound envelope. Recorded on the raw
 * envelope at ingress and compared at dispatch so a reconfigured installation never reinterprets an old receipt.
 */
export const providerInstallationRevision = (connection: Installation) =>
  evidenceHash({ connectionId: connection.id, adapterId: connection.adapterId ?? '', adapterVersion: connection.adapterVersion ?? '', configReference: connection.configReference ?? '' })
