import { registerOTel } from '@vercel/otel'

/** Next.js request, route, fetch and server spans exported through standard OTLP env. */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  registerOTel({ serviceName: 'openfront-sportsbook' })
}
