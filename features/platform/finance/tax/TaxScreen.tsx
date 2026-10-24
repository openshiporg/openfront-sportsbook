import { MutationForm } from "../../components/MutationForm";
import { OperatorShell, TenantRequired } from "../../components/OperatorShell";
import { ReadFailed } from "../../components/ReadFailed";
import { Mono, PillLink, StatusDot, Track } from "../../components/kit";
import { EmptyState, MetricGrid, RecordList, StatusBadge, statusDotTone } from "../../components/WorkflowUI";
import { dateTime, money, moneyTotals, shortId } from "../../lib/format";
import { getOperatorContext, platformPrisma as prisma } from "../../lib/operator";
import { allowedParam, hrefWith, pageFrom, PLATFORM_PAGE_SIZE, type PlatformSearchParams } from "../../lib/paging";

const basePath = "/dashboard/platform/finance/tax";
const statusValues = ["CALCULATED", "POSTED", "REVERSED"] as const;
const UNASSESSED_PAGE_SIZE = 12;
// Same mutation and variables as the Reconciliation "Assess settlement tax" form.
const assessMutation = `mutation($settlementId:ID!,$taxRuleId:ID!,$idempotencyKey:String!){assessSettlementTax(settlementId:$settlementId,taxRuleId:$taxRuleId,idempotencyKey:$idempotencyKey)}`;

type TotalsRow = { status: string | null; currency: string; amountMinor: string | null; count: number };
type Rule = { id: string; key: string; version: number; basis: string | null; rateNumerator: string; rateDenominator: string; jurisdictionId: string | null; effectiveFrom: Date; effectiveTo: Date | null; jurisdiction: { code: string } | null };

const toBigInt = (value: string | null | undefined) => BigInt(value && /^-?\d+$/.test(value) ? value : value ? value.split(".")[0] || "0" : "0");

/** `key:vN:ruleId` (assessSettlementTax rule identity) as `key vN`. */
function ruleLabel(identity: string) {
  const match = /^(.*):v(\d+):([^:]+)$/.exec(identity);
  return match ? { name: `${match[1]} v${match[2]}`, ruleId: match[3] } : { name: identity || "—", ruleId: null };
}

const ruleOption = (rule: Rule) => ({ label: `${rule.key} v${rule.version} · ${rule.basis || "—"} ${rule.rateNumerator}/${rule.rateDenominator}${rule.jurisdiction?.code ? ` · ${rule.jurisdiction.code}` : ""}`, value: rule.id });

/** Server screen: finance tax liability (exact per-currency totals), assessments by status, and settled wagers awaiting assessment. */
export async function TaxScreen({ searchParams }: { searchParams?: PlatformSearchParams } = {}) {
  const params = (await searchParams) ?? {};
  const operator = await getOperatorContext("canManageFinance");
  if (!operator) return <OperatorShell active="Tax" title="Tax"><TenantRequired /></OperatorShell>;
  const tenantId = operator.tenantId;
  const status = allowedParam(params, "status", statusValues);
  const page = pageFrom(params), unassessedPage = pageFrom({ page: params.upage });
  // Current settlement: not a reversal and not reversed (assessSettlementTax rejects anything else).
  const unassessedWhere = { tenantId, reversalOfId: null, from_Settlement_reversalOf: { none: {} }, wager: { is: { tenantId, from_TaxAssessment_wager: { none: { tenantId, status: { not: "REVERSED" } } } } } };
  const listWhere = { tenantId, ...(status ? { status } : {}) };
  let data;
  try {
    const [totals, assessments, assessmentTotal, rules, unassessed, unassessedTotal] = await Promise.all([
      prisma.$queryRaw`
        SELECT status::text AS status, currency,
               CAST(SUM(CAST(NULLIF("amountMinor", '') AS NUMERIC)) AS TEXT) AS "amountMinor",
               COUNT(*)::int AS count
        FROM "TaxAssessment"
        WHERE tenant = ${tenantId}
        GROUP BY status, currency` as Promise<TotalsRow[]>,
      prisma.taxAssessment.findMany({ where: listWhere, orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: PLATFORM_PAGE_SIZE, skip: (page - 1) * PLATFORM_PAGE_SIZE, include: { wager: { select: { id: true, player: { select: { subject: true } } } } } }),
      prisma.taxAssessment.count({ where: listWhere }),
      prisma.taxRuleVersion.findMany({ where: { tenantId, status: "ACTIVE" }, orderBy: [{ key: "asc" }, { version: "desc" }], take: 200, include: { jurisdiction: { select: { code: true } } } }) as Promise<Rule[]>,
      prisma.settlement.findMany({ where: unassessedWhere, orderBy: [{ createdAt: "asc" }, { id: "asc" }], take: UNASSESSED_PAGE_SIZE, skip: (unassessedPage - 1) * UNASSESSED_PAGE_SIZE, include: { wager: { select: { id: true, currency: true, stakeMinor: true, operatorJurisdiction: { select: { jurisdictionId: true } } } } } }),
      prisma.settlement.count({ where: unassessedWhere }),
    ]);
    data = { totals, assessments, assessmentTotal, rules, unassessed, unassessedTotal };
  } catch {
    data = null;
  }
  if (!data) return <OperatorShell active="Tax" title="Tax" tenantName={operator.tenantName} tone="alert"><ReadFailed subject="tax assessments" /></OperatorShell>;
  const { totals, assessments, assessmentTotal, rules, unassessed, unassessedTotal } = data;

  const liability = new Map<string, bigint>();
  const counts = { CALCULATED: 0, POSTED: 0, REVERSED: 0 };
  for (const row of totals) {
    const key = (row.status ?? "") as keyof typeof counts;
    if (key in counts) counts[key] += row.count;
    if (key === "CALCULATED" || key === "POSTED") liability.set(row.currency || "", (liability.get(row.currency || "") ?? 0n) + toBigInt(row.amountMinor));
  }
  const listHref = (next: { status?: string; page?: number; upage?: number }) => hrefWith(basePath, { status: next.status, page: next.page, upage: next.upage && next.upage > 1 ? next.upage : undefined });
  const rulesFor = (settlement: { createdAt: Date; wager: { operatorJurisdiction: { jurisdictionId: string | null } | null } | null }) => rules.filter((rule) =>
    rule.jurisdictionId && rule.jurisdictionId === settlement.wager?.operatorJurisdiction?.jurisdictionId
    && rule.effectiveFrom <= settlement.createdAt && (!rule.effectiveTo || rule.effectiveTo > settlement.createdAt));
  const unassessedPages = Math.max(1, Math.ceil(unassessedTotal / UNASSESSED_PAGE_SIZE));

  return <OperatorShell active="Tax" title="Tax" tenantName={operator.tenantName} tone={unassessedTotal ? "wait" : "ok"} meta={`${unassessedTotal} not yet assessed · ${counts.POSTED} posted · ${counts.CALCULATED} calculated · ${counts.REVERSED} reversed`}>
    <MetricGrid items={[
      { label: "Assessed", value: liability.size ? moneyTotals(liability) : "None", detail: "calculated + posted · by currency" },
      { label: "Not yet assessed", value: unassessedTotal, detail: "current settlements", tone: unassessedTotal ? "wait" : "ok" },
      { label: "Reversed", value: counts.REVERSED, detail: `of ${counts.CALCULATED + counts.POSTED + counts.REVERSED}`, tone: counts.REVERSED ? "off" : undefined },
      { label: "Active rules", value: rules.length, detail: rules.length ? "tax rule versions" : "none active", tone: rules.length ? "ok" : unassessedTotal ? "alert" : undefined },
    ]} />

    <section aria-labelledby="tax-unassessed" className="min-w-0 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="tax-unassessed" className="text-sm font-semibold">{unassessedTotal ? <StatusDot tone="wait" /> : null}Not yet assessed<span className="ml-2 font-mono text-xs font-normal tabular-nums text-muted-foreground">{unassessedTotal}</span></h2>
        {unassessedPages > 1 ? <Track label="Not yet assessed pages">
          {unassessedPage > 1 ? <PillLink size="sm" href={listHref({ status, page, upage: unassessedPage - 1 })}>Previous</PillLink> : null}
          <span className="px-2 font-mono text-xs tabular-nums text-muted-foreground">{unassessedPage} / {unassessedPages}</span>
          {unassessedPage < unassessedPages ? <PillLink size="sm" href={listHref({ status, page, upage: unassessedPage + 1 })}>Next</PillLink> : null}
        </Track> : null}
      </div>
      {unassessed.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {unassessed.map((settlement: any) => <MutationForm key={settlement.id} compact
          title={`Wager ${shortId(settlement.wagerId || settlement.id)}`}
          description={`${String(settlement.outcome || "—").toLowerCase()} · ${money(settlement.payoutMinor, settlement.wager?.currency)} payout · v${settlement.version} · ${dateTime(settlement.createdAt)}`}
          mutation={assessMutation}
          fields={[
            { name: "settlementId", label: "Settlement", type: "hidden", defaultValue: settlement.id },
            { name: "taxRuleId", label: "Active tax rule", type: "select", options: rulesFor(settlement).map(ruleOption), emptyOptionsMessage: rules.length ? "No active rule for this jurisdiction at settlement time" : "No active tax rule" },
            { name: "idempotencyKey", label: "Assessment request key", type: "hidden", defaultValue: `tax:${crypto.randomUUID()}` },
          ]}
          submitLabel="Assess tax" successMessage="Tax assessment recorded." />)}
      </div> : <div className="rounded-xl border bg-card"><EmptyState title="Every current settlement is assessed" /></div>}
    </section>

    <Track label="Assessment status">
      <PillLink size="sm" variant="flat" href={listHref({})} current={!status}>All</PillLink>
      {statusValues.map((value) => <PillLink key={value} size="sm" variant="flat" href={listHref({ status: value })} current={status === value}>{value.toLowerCase()}</PillLink>)}
    </Track>
    <RecordList title="Assessments" filtered={Boolean(status)}
      columns={["Wager", "Rule version", "Basis", "Amount", "Assessed"]}
      rows={assessments.map((item: any) => {
        const rule = ruleLabel(item.ruleVersion);
        return {
          id: item.id,
          status: item.status ?? undefined,
          href: item.wagerId ? `/dashboard/platform/wagers/${item.wagerId}` : undefined,
          cells: [
            <span key="wager"><Mono>{item.wagerId ? shortId(item.wagerId) : "—"}</Mono>{item.wager?.player?.subject ? <span className="block break-all text-xs font-normal text-muted-foreground">{item.wager.player.subject}</span> : null}</span>,
            <span key="rule" className="break-all">{rule.name}</span>,
            <Mono key="basis">{money(item.basisMinor, item.currency)}</Mono>,
            <span key="amount"><Mono className="text-foreground">{money(item.amountMinor, item.currency)}</Mono><span className="block"><StatusBadge value={item.status} /></span></span>,
            dateTime(item.createdAt),
          ],
        };
      })}
      emptyTitle={status ? `No ${status.toLowerCase()} assessments` : "No assessments"}
      tone={status ? statusDotTone(status) : undefined}
      pagination={{ page, pageSize: PLATFORM_PAGE_SIZE, total: assessmentTotal, hrefForPage: (next) => listHref({ status, page: next, upage: unassessedPage }) }} />
  </OperatorShell>;
}
