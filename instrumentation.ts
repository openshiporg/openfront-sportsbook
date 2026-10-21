import { registerOTel } from '@vercel/otel'

/** Next.js request, route, fetch and server spans exported through standard OTLP env. */
export function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') registerOTel({ serviceName: 'openfront-sportsbook' })
}
