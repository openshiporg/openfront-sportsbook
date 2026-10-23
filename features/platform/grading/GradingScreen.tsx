import { MutationForm } from '../components/MutationForm'
import { OperatorShell, TenantRequired } from '../components/OperatorShell'
import { Mono, StatusDot } from '../components/kit'
import { MetricGrid, RecordList, StatusBadge, WorkflowNote } from '../components/WorkflowUI'
import { dateTime, shortId } from '../lib/format'
import { getOperatorContext, platformPrisma as prisma } from '../lib/operator'
import { resolveCanonicalSelectionFact } from '@/features/sportsbook/domain/result-facts'

const gradeMutation = `mutation GradeSelection($marketId:ID!,$selectionId:ID!,$resultVersionId:ID!,$reason:String!){gradeMarketSelection(marketId:$marketId,selectionId:$selectionId,resultVersionId:$resultVersionId,reason:$reason)}`

export async function GradingScreen() {
  const operator = await getOperatorContext('canManageRisk')
  if (!operator) return <OperatorShell active="Grading" title="Grading"><TenantRequired /></OperatorShell>

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

  const legsResolved = grades.reduce((sum: number, grade: any) => sum + grade.from_LegGrade_marketGrade.length, 0)
  return <OperatorShell active="Grading" title="Grading" tone={actions.length ? 'wait' : 'ok'} meta={`${actions.length} ready · ${grades.length} graded · newest 100 markets`} tenantName={operator.tenantName}>
    <MetricGrid items={[
      { label: 'Ready to grade', value: actions.length, tone: actions.length ? 'wait' : 'ok' },
      { label: 'Grades', value: grades.length, detail: 'newest 100' },
      { label: 'Legs resolved', value: legsResolved },
      { label: 'Markets loaded', value: markets.length, detail: 'newest 100' },
    ]} />
    <section className="space-y-3" aria-labelledby="grading-queue">
      <h2 id="grading-queue" className="text-sm font-semibold"><StatusDot tone={actions.length ? 'wait' : 'ok'} />Ready to grade<span className="ml-2 font-mono text-xs font-normal tabular-nums text-muted-foreground">{actions.length}</span></h2>
      {actions.length === 0
        ? <WorkflowNote title="No grades ready" />
        : <div className="grid gap-4 xl:grid-cols-2">{actions.map(({ market, result, selection, fact }: any) => <MutationForm
          key={`${market.id}:${selection.id}:${result.id}`}
          compact
          title={`${market.event?.name} · ${market.definitionKey} · ${selection.label}`}
          description={`v${result.version} · ${fact.outcome}${fact.factorNumerator ? ` ${fact.factorNumerator}/${fact.factorDenominator}` : ''}`}
          mutation={gradeMutation}
          fields={[
            { name: 'marketId', label: 'Market', type: 'hidden', defaultValue: market.id },
            { name: 'selectionId', label: 'Selection', type: 'hidden', defaultValue: selection.id },
            { name: 'resultVersionId', label: 'Approved result', type: 'hidden', defaultValue: result.id },
            { name: 'reason', label: 'Grading reason', placeholder:'Why this is needed and what you reviewed' },
          ]}
          submitLabel="Grade selection"
          successMessage="Selection and matching wager legs graded."
          disabledReason={operator.capabilities.canManageRisk ? undefined : 'Grading permission required.'}
        />)}</div>}
    </section>
    <RecordList title="Grades" columns={['Event / market / selection', 'Outcome', 'Rule / result', 'Created']} rows={grades.map((grade: any) => ({
      id: grade.id,
      href: grade.marketId ? `/dashboard/platform/trading/${grade.marketId}` : undefined,
      cells: [<span key="market">{grade.market?.event?.name || 'Unknown event'}<Mono className="block break-all text-xs text-muted-foreground">{grade.market?.definitionKey || shortId(grade.marketId || 'Unknown')} · {(grade.trace as any)?.selectionKey || 'selection unavailable'}</Mono></span>, <StatusBadge key="outcome" value={grade.outcome} />, <Mono key="rule" className="break-all text-xs">{grade.ruleVersion} · v{grade.resultVersion?.version ?? '—'} · {grade.from_LegGrade_marketGrade.length} legs</Mono>, dateTime(grade.createdAt)],
    }))} emptyTitle="No grades" />
  </OperatorShell>
}
