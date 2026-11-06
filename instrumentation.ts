import { registerOTel } from '@vercel/otel'

const FEED_INTERVAL_MS = 10 * 60_000

/** Next.js request, route, fetch and server spans exported through standard OTLP env, plus the sandbox fixture feed. */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  registerOTel({ serviceName: 'openfront-sportsbook' })
  if (process.env.NODE_ENV !== 'production' || process.env.SANDBOX_FIXTURE_FEED === '0') return
  const state = globalThis as unknown as { sportsbookFixtureFeed?: boolean }
  if (state.sportsbookFixtureFeed) return
  state.sportsbookFixtureFeed = true
  // In-process stand-in for the sandbox sports provider, so a deploy without `npm run worker` keeps a live slate.
  const [{ PrismaClient }, { runSandboxFixtureFeed }] = await Promise.all([
    import('./features/keystone/prisma'),
    import('./features/sportsbook/workers/sandbox-fixture-feed'),
  ])
  const prisma = new PrismaClient()
  let running = false
  const pass = async () => {
    if (running) return
    running = true
    try {
      const results = await runSandboxFixtureFeed(prisma)
      process.stdout.write(JSON.stringify({ service: 'sportsbook-fixture-feed', status: 'ok', results }) + '\n')
    } catch (error) {
      process.stderr.write(JSON.stringify({ service: 'sportsbook-fixture-feed', status: 'error', error: error instanceof Error ? error.message : 'unknown' }) + '\n')
    } finally { running = false }
  }
  setInterval(() => { void pass() }, FEED_INTERVAL_MS).unref?.()
  setTimeout(() => { void pass() }, 20_000).unref?.()
  if (process.env.WORKER_IN_PROCESS !== '0') await startEmbeddedWorker()
}

/**
 * Runs the queue worker (settlement, payment reconciliation, outbox, scheduled jobs) inside this service as a
 * supervised child process, so a single Railway service is a complete deployment. Leases make it safe alongside a
 * separately scaled worker. Set WORKER_IN_PROCESS=0 when running `npm run worker` as its own service.
 */
async function startEmbeddedWorker() {
  const [{ spawn }, path] = await Promise.all([import('node:child_process'), import('node:path')])
  const bin = path.join(process.cwd(), 'node_modules', '.bin', 'tsx')
  let backoffMs = 5_000
  const launch = () => {
    const startedAt = Date.now()
    const child = spawn(bin, ['features/sportsbook/workers/main.ts'], { cwd: process.cwd(), env: process.env, stdio: 'inherit' })
    child.on('exit', code => {
      if (Date.now() - startedAt > 60_000) backoffMs = 5_000
      process.stderr.write(JSON.stringify({ service: 'sportsbook-worker-supervisor', status: 'restarting', code, inMs: backoffMs }) + '\n')
      setTimeout(launch, backoffMs).unref?.()
      backoffMs = Math.min(backoffMs * 2, 300_000)
    })
    for (const signal of ['SIGTERM', 'SIGINT'] as const) process.once(signal, () => child.kill(signal))
  }
  launch()
}
