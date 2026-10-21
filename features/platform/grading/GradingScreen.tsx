import { MutationForm } from '../components/MutationForm'
import { OperatorShell, TenantRequired } from '../components/OperatorShell'
import { MetricGrid, RecordList, StatusBadge, WorkflowNote } from '../components/WorkflowUI'
import { dateTime, shortId } from '../lib/format'
import { getOperatorContext, platformPrisma as prisma } from '../lib/operator'
import { resolveCanonicalSelectionFact } from '@/features/sportsbook/domain/result-facts'

const gradeMutation = `mutation GradeSelection($marketId:ID!,$selectionId:ID!,$resultVersionId:ID!,$reason:String!){gradeMarketSelection(marketId:$marketId,selectionId:$selectionId,resultVersionId:$resultVersionId,reason:$reason)}`

export async function GradingScreen() {
  const operator = await getOperatorContext('canManageRisk')
  if (!operator) return <OperatorShell active="Grading" eyebrow="Grading operations" title="Selection grading" description="Grade selections from approved results under the current house rules."><TenantRequired /></OperatorShell>

  const [markets, grades] = await Promise.all([
    prisma.market.findMany({
      where: { tenantId: operator.tenantId },
      orderBy: { updatedAt: 'desc' },
      take: 100,
      include: {
        event: { include: { from_ResultVersion_event: { where: { status: 'APPROVED' }, orderBy: { version: 'desc' } } } },
        from_Selection_market: true,
        from_MarketGrade_market: true,
      },
    }),
    prisma.marketGrade.findMany({
      where: { tenantId: operator.tenantId },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { market: { include: { event: true } }, resultVersion: true, from_LegGrade_marketGrade: true },
    }),
  ])

  const actions = markets.flatMap((market: any) => (market.event?.from_ResultVersion_event ?? []).flatMap((result: any) =>
    (market.from_Selection_market ?? []).flatMap((selection: any) => {
      const alreadyGraded = market.from_MarketGrade_market.some((grade: any) => grade.resultVersionId === result.id && (grade.trace as any)?.selectionId === selection.id)
      if (alreadyGraded) return []
      try {
        const fact = resolveCanonicalSelectionFact(result.payload, result.eventId, market.id, selection.key)
        return fact ? [{ market, result, selection, fact }] : []
      } catch {
        return []
      }
    }),
  ))

  return <OperatorShell active="Grading" eyebrow="Grading operations" title="Selection grading" description="Each selection is graded from its approved official result. A single result can’t be applied to every selection in a market." tenantName={operator.tenantName}>
    <MetricGrid items={[
      { label: 'Markets loaded', value: markets.length, detail: 'Newest 100' },
      { label: 'Selection grades ready', value: actions.length, detail: 'Approved canonical fact + active rule' },
      { label: 'Grades', value: grades.length, detail: 'Newest 100' },
      { label: 'Wager legs resolved', value: grades.reduce((sum: number, grade: any) => sum + grade.from_LegGrade_marketGrade.length, 0), detail: 'Selection-specific' },
    ]} />
    <RecordList title="Grade evidence" description="Selection identity, canonical fact hash, result version and house-rule version are retained." columns={['Event / market / selection', 'Outcome', 'Rule / result', 'Created']} rows={grades.map((grade: any) => ({
      id: grade.id,
      href: grade.marketId ? `/dashboard/platform/trading/${grade.marketId}` : undefined,
      cells: [<span key="market">{grade.market?.event?.name || 'Unknown event'}<span className="block text-xs text-muted-foreground">{grade.market?.definitionKey || shortId(grade.marketId || 'Unknown')} · {(grade.trace as any)?.selectionKey || 'selection unavailable'}</span></span>, <StatusBadge key="outcome" value={grade.outcome} />, `${grade.ruleVersion} · result v${grade.resultVersion?.version ?? '—'} · ${grade.from_LegGrade_marketGrade.length} legs`, dateTime(grade.createdAt)],
    }))} emptyTitle="No selections graded" emptyDescription="Enter, approve and apply an official result before grading." />
    <section className="space-y-4">
      <div><h2 className="font-semibold">Canonical selection facts ready</h2><p className="mt-1 text-sm text-muted-foreground">A result/selection can be graded only once per version. The mutation derives outcome and dead-heat factors from the approved payload.</p></div>
      {actions.length === 0
        ? <WorkflowNote title="No grade action available">No approved canonical selection facts remain ungraded. Unsupported or incomplete result payloads stay blocked.</WorkflowNote>
        : actions.map(({ market, result, selection, fact }: any) => <MutationForm
          key={`${market.id}:${selection.id}:${result.id}`}
          compact
          title={`${market.event?.name} · ${market.definitionKey} · ${selection.label}`}
          description={`Canonical result v${result.version} says ${fact.outcome}${fact.factorNumerator ? ` (${fact.factorNumerator}/${fact.factorDenominator})` : ''}. The active house rule and result hash are bound server-side.`}
          mutation={gradeMutation}
          fields={[
            { name: 'marketId', label: 'Market', type: 'hidden', defaultValue: market.id },
            { name: 'selectionId', label: 'Selection', type: 'hidden', defaultValue: selection.id },
            { name: 'resultVersionId', label: 'Approved result', type: 'hidden', defaultValue: result.id },
            { name: 'reason', label: 'Grading reason', placeholder:'Why this is needed and what you reviewed' },
          ]}
          submitLabel="Grade selection"
          successMessage="Selection and matching wager legs graded."
          disabledReason={operator.capabilities.canManageRisk ? undefined : 'Your role does not include grading capability.'}
        />)}
    </section>
  </OperatorShell>
}
