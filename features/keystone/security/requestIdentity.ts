import { createHmac, timingSafeEqual } from 'node:crypto'
import { signInternalClientIdentity } from './internalIdentity'

// Verifier for the loopback-only forwarded client identity (copied from openfront-hospital graphqlSecurity.ts).
// The identity is accepted only from a LOOPBACK socket with a fresh, valid HMAC of SESSION_SECRET.
export { signInternalClientIdentity }

const INTERNAL_IDENTITY_MAX_AGE_MS = 90_000

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer)
}

export function verifiedInternalIdentity(
  headers: Record<string, string | string[] | undefined>,
  socketAddress: string | null | undefined,
  secret: string,
  now: number,
) {
  const loopback = /^(?:127\.|::1$|::ffff:127\.)/.test(String(socketAddress || ''))
  if (!loopback || secret.length < 32) return null
  const identity = String(headers['x-openfront-client-identity'] || '')
  const timestamp = String(headers['x-openfront-client-timestamp'] || '')
  const signature = String(headers['x-openfront-client-signature'] || '')
  if (!/^[a-f0-9]{64}$/.test(identity) || !/^\d{10}$/.test(timestamp) || !/^[a-f0-9]{64}$/.test(signature)) return null
  const age = Math.abs(now - Number(timestamp) * 1_000)
  if (!Number.isFinite(age) || age > INTERNAL_IDENTITY_MAX_AGE_MS) return null
  const expected = createHmac('sha256', secret).update(`${timestamp}:${identity}`).digest('hex')
  return safeEqual(signature, expected) ? `forwarded:${identity}` : null
}

/**
 * Identity order: (1) verified internal identity (loopback + valid HMAC), (2) x-real-ip on Railway,
 * (3) the socket. The sportsbook limiter (sandboxRateLimit) keys by player or cookie+user-agent and does
 * not call this today; it is here so a future per-IP limiter counts the end user, not loopback.
 */
export function requestIdentity(
  headers: Record<string, string | string[] | undefined>,
  socketAddress?: string | null,
  secret = String(process.env.SESSION_SECRET || ''),
  now = Date.now(),
) {
  const internal = verifiedInternalIdentity(headers, socketAddress, secret, now)
  if (internal) return internal
  if (process.env.RAILWAY_ENVIRONMENT) {
    const realIp = String(headers['x-real-ip'] || '').split(',')[0]?.trim()
    if (realIp) return realIp
  } else if (process.env.TRUST_PROXY === '1') {
    const chain = String(headers['x-forwarded-for'] || '').split(',').map(value => value.trim()).filter(Boolean)
    const configuredHops = Number(process.env.TRUST_PROXY_HOPS || 1)
    const hops = Number.isInteger(configuredHops) && configuredHops > 0 ? configuredHops : 1
    const vouched = chain[chain.length - hops]
    if (vouched) return vouched
    const realIp = String(headers['x-real-ip'] || '').split(',')[0]?.trim()
    if (realIp) return realIp
  }
  return socketAddress || 'unknown-local-client'
}
