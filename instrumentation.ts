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
}
