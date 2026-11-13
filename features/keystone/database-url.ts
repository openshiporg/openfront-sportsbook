/**
 * Postgres URL with a bounded Prisma pool.
 *
 * Prisma's default pool is cpus*2+1. On a 48-core Railway host that is 97 connections per client, and the web
 * service runs three clients (Keystone, the catalog rollover and the embedded queue worker), which is far more
 * than Postgres's default max_connections of 100. Once the server is full, Keystone's access-control queries fail
 * and pages degrade. Each client therefore gets an explicit share. A connection_limit already in the URL wins.
 */
export const POOL_SIZES = { web: 20, worker: 8, feed: 3 } as const

export function pooledDatabaseUrl(url: string | undefined, role: keyof typeof POOL_SIZES): string | undefined {
  if (!url || !/^postgres(ql)?:\/\//.test(url)) return url
  const parsed = new URL(url)
  if (parsed.searchParams.has('connection_limit')) return url
  const override = Number(process.env[`DATABASE_POOL_${role.toUpperCase()}`])
  parsed.searchParams.set('connection_limit', String(Number.isInteger(override) && override > 0 ? override : POOL_SIZES[role]))
  return parsed.toString()
}
