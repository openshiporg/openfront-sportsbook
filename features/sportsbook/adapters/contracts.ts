export interface CapabilitySet { supported: string[]; unsupported: string[] }
export interface HealthReport { ok: boolean; latencyMs: number; details?: string }
export interface CanonicalEnvelope<T = unknown> { id: string; type: string; occurredAt: string; payload: T; source: { adapterId: string; version: string; externalId: string } }
export interface ProviderAdapter<C, Command, Result, Event> {
  manifest(): { id: string; version: string; schemas: string[] }
  capabilities(ctx: C): Promise<CapabilitySet>
  validateConfig(configRef: string): Promise<{ valid: boolean; errors: string[] }>
  execute(ctx: C, command: Command, idempotencyKey: string): Promise<Result>
  query(ctx: C, externalRef: string): Promise<Result>
  verifyWebhook(raw: Uint8Array, headers: Headers): { valid: boolean; event?: Event; reason?: string }
  normalize(event: Event): CanonicalEnvelope[]
  health(ctx: C): Promise<HealthReport>
  reconcile(ctx: C, window: { from: Date; to: Date }): AsyncIterable<Result>
}
