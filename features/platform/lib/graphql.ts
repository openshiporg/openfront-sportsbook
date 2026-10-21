import { keystoneClient, type KeystoneResponse } from "@/features/dashboard/lib/keystoneClient";

/**
 * Operator reads go through the Keystone GraphQL API with the caller's session, so
 * list operation access, tenant filters and field/relationship access apply exactly
 * as they do for any other client. A related record the operator may not read
 * resolves to null and a denied count is 0 — screens show that, they never work
 * around it with a direct database read.
 */
export function platformRead<T>(query: string, variables: Record<string, unknown> = {}): Promise<KeystoneResponse<T>> {
  return keystoneClient<T>(query, variables);
}

/**
 * One aliased selection per id (`p0: field(where: … $p0 …)`), for per-row counts and
 * latest-row lookups across one-sided relationships that GraphQL can't nest.
 */
export function perIdSelections(ids: string[], prefix: string, selection: (variable: string) => string) {
  return {
    declarations: ids.map((_, index) => `$${prefix}${index}: ID!`).join(" "),
    selections: ids.map((_, index) => `${prefix}${index}: ${selection(`$${prefix}${index}`)}`).join("\n"),
    variables: Object.fromEntries(ids.map((id, index) => [`${prefix}${index}`, id])) as Record<string, string>,
  };
}

/** The aliased value for row `index` from a perIdSelections query. */
export function perIdValue<T>(data: Record<string, unknown> | null | undefined, prefix: string, index: number): T | undefined {
  return data?.[`${prefix}${index}`] as T | undefined;
}

/** Trimmed `?q=` search text (bounded) or undefined. */
export function searchFrom(params: Record<string, string | string[] | undefined>, key = "q") {
  const raw = params[key];
  const value = (Array.isArray(raw) ? raw[0] : raw)?.trim();
  return value ? value.slice(0, 120) : undefined;
}
