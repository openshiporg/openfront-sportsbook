/**
 * Configuration values split the same way sportsbook commands read them
 * (features/sportsbook/customer/policy.ts): a value is effective when
 * effectiveFrom <= now and effectiveTo is empty or later than now, and the newest
 * effective version per scope + key wins. Everything else is history or scheduled.
 */
export type ConfigValueRow = {
  id: string;
  key: string;
  value: unknown;
  valueType: string;
  scopeType: string;
  scopeId: string | null;
  policyVersion: string;
  effectiveFrom: Date | null;
  effectiveTo: Date | null;
};

export async function loadConfigValues(prisma: any, tenantId: string, now = new Date()) {
  const [inWindow, outsideWindow] = await Promise.all([
    prisma.configValue.findMany({
      where: { tenantId, effectiveFrom: { lte: now }, OR: [{ effectiveTo: null }, { effectiveTo: { gt: now } }] },
      orderBy: [{ key: "asc" }, { effectiveFrom: "desc" }, { id: "desc" }],
      take: 500,
    }) as Promise<ConfigValueRow[]>,
    prisma.configValue.findMany({
      where: { tenantId, OR: [{ effectiveFrom: null }, { effectiveFrom: { gt: now } }, { effectiveTo: { lte: now } }] },
      orderBy: [{ effectiveFrom: "desc" }, { id: "desc" }],
      take: 200,
    }) as Promise<ConfigValueRow[]>,
  ]);
  const seen = new Set<string>();
  const effective: ConfigValueRow[] = [];
  const superseded: ConfigValueRow[] = [];
  for (const row of inWindow) {
    const identity = `${row.scopeType}\u0000${row.scopeId ?? ""}\u0000${row.key}`;
    if (seen.has(identity)) superseded.push(row);
    else { seen.add(identity); effective.push(row); }
  }
  const scheduled = outsideWindow.filter((row) => row.effectiveFrom && row.effectiveFrom > now);
  const history = [...superseded, ...outsideWindow.filter((row) => !scheduled.includes(row))]
    .sort((a, b) => (b.effectiveFrom?.getTime() ?? 0) - (a.effectiveFrom?.getTime() ?? 0));
  return { effective, scheduled, history };
}

export function versionState(row: ConfigValueRow, now = new Date()) {
  if (!row.effectiveFrom) return "DRAFT";
  if (row.effectiveFrom > now) return "SCHEDULED";
  if (row.effectiveTo && row.effectiveTo <= now) return "ENDED";
  return "SUPERSEDED";
}
