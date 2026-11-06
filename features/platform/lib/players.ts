import { accountNumber } from "../../sportsbook/domain/references";
import { platformPrisma as prisma } from "./operator";

export type PlayerLabel = { primary: string; account: string; id: string };

/** Tenant-scoped player labels (masked sign-in email + account number) for operator screens. */
export async function playerLabels(tenantId: string, ids: (string | null | undefined)[]): Promise<Map<string, PlayerLabel>> {
  const unique = [...new Set(ids.filter((id): id is string => Boolean(id)))];
  const credentials = unique.length
    ? await prisma.customerCredential.findMany({ where: { tenantId, playerId: { in: unique } }, orderBy: { createdAt: "asc" }, select: { playerId: true, emailMasked: true } })
    : [];
  const email = new Map<string, string>();
  for (const credential of credentials) if (credential.emailMasked && !email.has(credential.playerId)) email.set(credential.playerId, credential.emailMasked);
  return new Map(unique.map(id => [id, { primary: email.get(id) || `Guest · ${accountNumber(id)}`, account: accountNumber(id), id }]));
}

export function playerLabelText(label: PlayerLabel | undefined) {
  if (!label) return "Unknown player";
  return label.primary.startsWith("Guest") ? label.primary : `${label.primary} · ${label.account}`;
}
