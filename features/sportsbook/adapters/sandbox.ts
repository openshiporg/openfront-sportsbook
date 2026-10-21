import { createHmac, timingSafeEqual } from 'node:crypto'
import type { CanonicalEnvelope, ProviderAdapter } from './contracts'

type Command = { type: string; externalRef?: string; payload?: unknown }
type Result = { status: 'SUCCEEDED' | 'PENDING' | 'FAILED'; externalRef: string; payload?: unknown }
type Event = { id: string; type: string; occurredAt: string; payload: unknown }

/** Deterministic credential-free adapter for local tests. Never silently represents production certification. */
export class SandboxAdapter implements ProviderAdapter<Record<string, never>, Command, Result, Event> {
  private readonly results = new Map<string, Result>()
  private readonly fingerprints = new Map<string, string>()
  constructor(private readonly kind: 'sports' | 'results' | 'kyc' | 'aml' | 'geo' | 'payments' | 'messaging' | 'analytics' | 'tax' | 'reporting' | 'integrity' | 'affiliates' | 'pam', private readonly webhookSecret = 'sandbox-only') {}
  manifest() { return { id: `sandbox-${this.kind}`, version: '1.0.0', schemas: ['sandbox.v1'] } }
  async capabilities() { return { supported: [this.kind, 'query', 'webhook', 'reconcile'], unsupported: ['production-certified'] } }
  async validateConfig(configRef: string) { return { valid: configRef.startsWith('sandbox:'), errors: configRef.startsWith('sandbox:') ? [] : ['Sandbox config must start with sandbox:'] } }
  async execute(_ctx: Record<string, never>, command: Command, idempotencyKey: string): Promise<Result> {
    // The key is bound to the exact command: a different command under the same key is a conflict, never the old receipt.
    const fingerprint = JSON.stringify([command.type, command.externalRef ?? null, command.payload ?? null])
    const prior = this.results.get(idempotencyKey)
    if (prior) {
      if (this.fingerprints.get(idempotencyKey) !== fingerprint) throw new Error('ADAPTER_IDEMPOTENCY_CONFLICT')
      return prior
    }
    const result: Result = { status: command.type === 'simulate_pending' ? 'PENDING' : command.type === 'simulate_failure' ? 'FAILED' : 'SUCCEEDED', externalRef: command.externalRef ?? `${this.kind}-${idempotencyKey}`, payload: command.payload }
    this.results.set(idempotencyKey, result)
    this.fingerprints.set(idempotencyKey, fingerprint)
    this.results.set(result.externalRef, result)
    return result
  }
  /** Process-local memory only: a miss (e.g. after restart) is not evidence of non-effect, so it reports PENDING. */
  async query(_ctx: Record<string, never>, externalRef: string): Promise<Result> { return this.results.get(externalRef) ?? { status: 'PENDING', externalRef } }
  /** `binding` (e.g. tenant + installation id) is covered by the MAC so signed bytes cannot be replayed against another installation. */
  sign(raw: Uint8Array, timestamp: string, binding?: string) { const mac = createHmac('sha256', this.webhookSecret).update(timestamp).update('.'); if (binding !== undefined) mac.update(binding).update('.'); return mac.update(raw).digest('hex') }
  verifyWebhook(raw: Uint8Array, headers: Headers, binding?: string) {
    const timestamp = headers.get('x-sandbox-timestamp') ?? ''
    const supplied = headers.get('x-sandbox-signature') ?? ''
    const expected = this.sign(raw, timestamp, binding)
    if (!supplied || supplied.length !== expected.length || !timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) return { valid: false, reason: 'INVALID_SIGNATURE' }
    try { return { valid: true, event: JSON.parse(Buffer.from(raw).toString()) as Event } } catch { return { valid: false, reason: 'INVALID_JSON' } }
  }
  normalize(event: Event): CanonicalEnvelope[] { return [{ id: event.id, type: event.type, occurredAt: event.occurredAt, payload: event.payload, source: { adapterId: this.manifest().id, version: '1.0.0', externalId: event.id } }] }
  async health() { return { ok: true, latencyMs: 0, details: 'sandbox' } }
  async *reconcile() { for (const result of new Set(this.results.values())) yield result }
}

export const sandboxAdapters = Object.fromEntries((['sports','results','kyc','aml','geo','payments','messaging','analytics','tax','reporting','integrity','affiliates','pam'] as const).map(kind => [kind, new SandboxAdapter(kind)]))

type InstalledConnection = { adapterId?: string | null; certificationStatus?: string | null; configReference?: string | null; capabilities?: unknown }
/**
 * Resolve the deterministic sandbox implementation only for a connection that is actually installed as that
 * sandbox adapter (exact adapter id, SANDBOX certification, sandbox: config). A capability kind label never
 * lends the sandbox implementation to another installation, so no live/fictitious adapter can borrow its evidence.
 */
export function installedSandboxAdapter(connection: InstalledConnection): SandboxAdapter | null {
  const kind = String((connection.capabilities as { kind?: unknown } | null)?.kind ?? '')
  const adapter = (sandboxAdapters as Record<string, SandboxAdapter | undefined>)[kind]
  if (!adapter || connection.adapterId !== adapter.manifest().id || connection.certificationStatus !== 'SANDBOX' || !String(connection.configReference ?? '').startsWith('sandbox:')) return null
  return adapter
}
