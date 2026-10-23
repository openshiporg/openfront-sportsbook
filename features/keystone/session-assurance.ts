import { randomUUID } from 'node:crypto'

export const OPERATOR_MFA_ASSURANCE_TTL_MS = 12 * 60 * 60 * 1000

type AssuranceClaim = { issuedAt: number; expiresAt: number; nonce: string }
type SessionWithAssurance = { operatorMfaAssurance?: AssuranceClaim } | null | undefined

export function hasOperatorMfaAssurance(session: SessionWithAssurance, now = Date.now()): boolean {
  const claim = session?.operatorMfaAssurance
  if (!claim || !Number.isSafeInteger(claim.issuedAt) || !Number.isSafeInteger(claim.expiresAt)) return false
  return claim.issuedAt <= now && claim.expiresAt > now && claim.expiresAt - claim.issuedAt <= OPERATOR_MFA_ASSURANCE_TTL_MS && typeof claim.nonce === 'string' && claim.nonce.length >= 20
}

/** Mint a separately sealed, time-limited elevated session after a verified factor. */
export async function startOperatorMfaSession(context: any, itemId: string, now = Date.now()): Promise<string> {
  if (!context.sessionStrategy?.start) throw new Error('SESSION_ISSUANCE_UNAVAILABLE')
  const token = await context.sessionStrategy.start({
    context,
    data: {
      // @keystone-6/auth only resolves sessions sealed for its list.
      listKey: 'User',
      itemId,
      operatorMfaAssurance: {
        issuedAt: now,
        expiresAt: now + OPERATOR_MFA_ASSURANCE_TTL_MS,
        nonce: randomUUID(),
      },
    },
  })
  if (typeof token !== 'string' || token.length === 0) throw new Error('SESSION_ISSUANCE_FAILED')
  return token
}
