// Human references for records whose primary key is a cuid. The same bet reference is shown to the
// customer (My bets) and to operators (settlement, finance), so support can match them by eye.
// Full ids stay available as secondary, copyable text.

function tail(id: string, length = 8) {
  return id.replace(/[^a-z0-9]/gi, '').slice(-length).toUpperCase()
}

/** Bet reference shown on My bets and every operator screen, e.g. `BET-33GM074E`. */
export function betReference(wagerId: string | null | undefined) {
  return wagerId ? `BET-${tail(wagerId)}` : '—'
}

/** Stable customer account number, e.g. `ACC-XRVMGVLT`. */
export function accountNumber(playerId: string | null | undefined) {
  return playerId ? `ACC-${tail(playerId)}` : '—'
}

type PlayerLike = {
  id?: string | null
  subject?: string | null
  from_CustomerCredential_player?: { emailMasked?: string | null }[] | null
} | null | undefined

/** Primary label for a player: the masked sign-in email, else the account number. Never the raw subject. */
export function playerDisplay(player: PlayerLike, playerId?: string | null) {
  const id = player?.id || playerId || ''
  const email = player?.from_CustomerCredential_player?.find(credential => credential?.emailMasked)?.emailMasked || ''
  return { primary: email || (id ? `Guest · ${accountNumber(id)}` : 'Unknown player'), account: accountNumber(id), id }
}

/** Prisma include fragment that loads what playerDisplay needs. */
export const playerDisplayInclude = {
  select: {
    id: true,
    subject: true,
    from_CustomerCredential_player: { select: { emailMasked: true }, orderBy: { createdAt: 'asc' as const }, take: 1 },
  },
}
