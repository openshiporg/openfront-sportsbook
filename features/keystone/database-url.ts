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
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return url
  }
  // Do not retain one-off nested access-filter statements; preserve an explicit operator choice.
  if (!parsed.searchParams.has('statement_cache_size')) parsed.searchParams.set('statement_cache_size', '0')
  // OLTP access filters do not benefit from LLVM JIT, whose compiled allocation stays resident.
  let options = parsed.searchParams.get('options') ?? ''
  if (!/\bjit\s*=/.test(options)) options = `${options} -c jit=off`.trim()
  // The server closes a backend idle for 60 s; the app recycles idle connections first (30 s).
  if (!/\bidle_session_timeout\s*=/.test(options)) options = `${options} -c idle_session_timeout=60000`.trim()
  parsed.searchParams.set('options', options)
  if (!parsed.searchParams.has('max_idle_connection_lifetime')) parsed.searchParams.set('max_idle_connection_lifetime', '30')
  if (!parsed.searchParams.has('pool_timeout')) parsed.searchParams.set('pool_timeout', '20')
  if (!parsed.searchParams.has('connection_limit')) {
    const override = Number(process.env[`DATABASE_POOL_${role.toUpperCase()}`])
    parsed.searchParams.set('connection_limit', String(Number.isInteger(override) && override > 0 ? override : POOL_SIZES[role]))
  }
  return parsed.toString()
}
