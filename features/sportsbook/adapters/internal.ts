import { createHmac, timingSafeEqual } from 'node:crypto'
import type { CanonicalEnvelope, ProviderAdapter } from './contracts'

type Command = { type: string; externalRef?: string; payload?: unknown }
type Result = { status: 'SUCCEEDED' | 'PENDING' | 'FAILED'; externalRef: string; payload?: unknown }
type Event = { id: string; type: string; occurredAt: string; payload: unknown }

export const HOUSE_KINDS = ['sports', 'results', 'kyc', 'aml', 'geo', 'payments', 'messaging', 'analytics', 'tax', 'reporting', 'integrity', 'affiliates', 'pam'] as const
export type HouseKind = typeof HOUSE_KINDS[number]
/** Envelope schema for events the operator's own desk (traders, results staff) or a signed house integration records. */
export const HOUSE_ENVELOPE_SCHEMA = 'house.v1'

/**
 * The operator's in-house adapter for one capability kind: the operator's own trading desk, results desk and
 * compliance staff are the source (no third-party feed is contracted). It records operator decisions with a
 * stable reference, verifies HMAC-signed inbound events bound to one installation, and never claims third-party
 * certification. A contracted provider replaces it by installing that provider's adapter.
 */
export class HouseAdapter implements ProviderAdapter<Record<string, never>, Command, Result, Event> {
  private readonly results = new Map<string, Result>()
  private readonly fingerprints = new Map<string, string>()
  constructor(private readonly kind: HouseKind, private readonly webhookSecret: string) {}
  manifest() { return { id: `house-${this.kind}`, version: '1.0.0', schemas: [HOUSE_ENVELOPE_SCHEMA] } }
  async capabilities() { return { supported: [this.kind, 'query', 'webhook', 'reconcile'], unsupported: ['third-party-certified'] } }
  async validateConfig(configRef: string) { return { valid: configRef === `house:${this.kind}`, errors: configRef === `house:${this.kind}` ? [] : [`House config must be house:${this.kind}`] } }
  /** Records an operator decision under an idempotency key; a different command under the same key is a conflict. */
  async execute(_ctx: Record<string, never>, command: Command, idempotencyKey: string): Promise<Result> {
    const fingerprint = JSON.stringify([command.type, command.externalRef ?? null, command.payload ?? null])
    const prior = this.results.get(idempotencyKey)
    if (prior) {
      if (this.fingerprints.get(idempotencyKey) !== fingerprint) throw new Error('ADAPTER_IDEMPOTENCY_CONFLICT')
      return prior
    }
    const result: Result = { status: 'SUCCEEDED', externalRef: command.externalRef ?? `${this.kind}-${idempotencyKey}`, payload: command.payload }
    this.results.set(idempotencyKey, result)
    this.fingerprints.set(idempotencyKey, fingerprint)
    this.results.set(result.externalRef, result)
    return result
  }
  /** Process-local memory only: a miss (e.g. after restart) is not evidence of non-effect, so it reports PENDING. */
  async query(_ctx: Record<string, never>, externalRef: string): Promise<Result> { return this.results.get(externalRef) ?? { status: 'PENDING', externalRef } }
  /** `binding` (tenant + installation id) is covered by the MAC so signed bytes cannot be replayed against another installation. */
  sign(raw: Uint8Array, timestamp: string, binding?: string) { const mac = createHmac('sha256', this.webhookSecret).update(timestamp).update('.'); if (binding !== undefined) mac.update(binding).update('.'); return mac.update(raw).digest('hex') }
  verifyWebhook(raw: Uint8Array, headers: Headers, binding?: string) {
    const timestamp = headers.get('x-openfront-timestamp') ?? ''
    const supplied = headers.get('x-openfront-signature') ?? ''
    const expected = this.sign(raw, timestamp, binding)
    if (!supplied || supplied.length !== expected.length || !timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) return { valid: false, reason: 'INVALID_SIGNATURE' }
    try { return { valid: true, event: JSON.parse(Buffer.from(raw).toString()) as Event } } catch { return { valid: false, reason: 'INVALID_JSON' } }
  }
  normalize(event: Event): CanonicalEnvelope[] { return [{ id: event.id, type: event.type, occurredAt: event.occurredAt, payload: event.payload, source: { adapterId: this.manifest().id, version: '1.0.0', externalId: event.id } }] }
  async health() { return { ok: true, latencyMs: 0, details: 'in-house' } }
  async *reconcile() { for (const result of new Set(this.results.values())) yield result }
}

type InstalledConnection = { adapterId?: string | null; certificationStatus?: string | null; configReference?: string | null; capabilities?: unknown }
/**
 * The in-house implementation for a connection that is actually installed as that house adapter (exact adapter id,
 * INTERNAL certification, house:<kind> config). A capability label never lends it to another installation.
 */
export function installedHouseAdapter(connection: InstalledConnection, webhookSecret: string): HouseAdapter | null {
  const kind = String((connection.capabilities as { kind?: unknown } | null)?.kind ?? '') as HouseKind
  if (!HOUSE_KINDS.includes(kind)) return null
  const adapter = new HouseAdapter(kind, webhookSecret)
  if (connection.adapterId !== adapter.manifest().id || connection.certificationStatus !== 'INTERNAL' || connection.configReference !== `house:${kind}`) return null
  return adapter
}
