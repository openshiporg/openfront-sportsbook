import { ExternalGateNotice, OperatorShell, TenantRequired } from '../components/OperatorShell'
import { MutationForm } from '../components/MutationForm'
import { Mono, PillLink, Track } from '../components/kit'
import { MetricGrid, RecordList, StatusBadge, type RecordRow } from '../components/WorkflowUI'
import { dateTime, money, moneyTotals, shortId, sumByCurrency } from '../lib/format'
import { getOperatorContext, platformPrisma as prisma } from '../lib/operator'
import Link from 'next/link'
import { hrefWith, pageFrom, PLATFORM_PAGE_SIZE, type PlatformSearchParams } from '../lib/paging'

const structureOptions = ['STRAIGHT', 'PARLAY', 'SYSTEM'].map(value => ({ label: value.toLowerCase(), value }))

/** Every stored budget version for one campaign, newest first: the history behind the current totals. */
async function BudgetHistory({ tenantId, promotion, page }: { tenantId: string; promotion: any; page: number }) {
  const where = { tenantId, promotionId: promotion.id },
    [versions, total] = await Promise.all([
      prisma.campaignBudget.findMany({ where, orderBy: [{ version: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }], take: PLATFORM_PAGE_SIZE, skip: (page - 1) * PLATFORM_PAGE_SIZE }),
      prisma.campaignBudget.count({ where }),
    ])
  return <div id="budget-history">
    <RecordList
      title={`Budget history · ${promotion.name}`}
      action={<Track><PillLink size="sm" href="/dashboard/platform/promotions">Close</PillLink></Track>}
      columns={['Version', 'Allocated / awarded', 'Redeemed / forfeited', 'State']}
      rows={versions.map((item: any, index: number) => ({
        id: item.id,
        status: item.status,
        cells: [
          <span key="v"><Mono className="font-semibold">v{item.version} · {item.currency}</Mono><span className="block tabular-nums text-xs font-normal  text-muted-foreground">{dateTime(item.createdAt)}</span></span>,
          <Mono key="alloc">{money(item.allocatedMinor, item.currency)} / {money(item.awardedMinor, item.currency)}</Mono>,
          <Mono key="redeem">{money(item.redeemedMinor, item.currency)} / {money(item.forfeitedMinor, item.currency)}</Mono>,
          <span key="s" className="flex flex-wrap gap-2"><StatusBadge value={item.status} />{page === 1 && index === 0 ? <StatusBadge value="CURRENT" /> : null}</span>,
        ],
      }))}
      emptyTitle="No budget versions"
      pagination={{ page, pageSize: PLATFORM_PAGE_SIZE, total, hrefForPage: (next) => hrefWith('/dashboard/platform/promotions', { campaign: promotion.id, bpage: next }) + '#budget-history' }}
    />
  </div>
}

export async function PromotionsScreen({ searchParams }: { searchParams?: PlatformSearchParams } = {}) {
  const params = (await searchParams) ?? {},
    campaignParam = typeof params.campaign === 'string' ? params.campaign : undefined,
    budgetPage = pageFrom({ page: params.bpage })
  const operator = await getOperatorContext('canManageSportsbook')
  if (!operator) return <OperatorShell active="Promotions" title="Promotions"><TenantRequired /></OperatorShell>
  const tenantId = operator.tenantId,
    [promotions, budgets, awards, redemptions] = await Promise.all([
      prisma.promotion.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' }, take: 50, include: { approvalRequest: true } }),
      prisma.campaignBudget.findMany({ where: { tenantId }, orderBy: { version: 'desc' }, take: 100 }),
      prisma.bonusAward.count({ where: { tenantId } }),
      prisma.promotionRedemption.findMany({ where: { tenantId }, orderBy: { redeemedAt: 'desc' }, take: 100 }),
    ])
  const historyPromotion = campaignParam ? (promotions.find((item: any) => item.id === campaignParam) ?? await prisma.promotion.findFirst({ where: { tenantId, id: campaignParam } })) : null
  const currentBudgetByKey = new Map<string, any>()
  for (const item of budgets) {
    const key = `${item.promotionId}\u0000${item.currency}`
    const prior = currentBudgetByKey.get(key)
    if (!prior || Number(item.version) > Number(prior.version)) currentBudgetByKey.set(key, item)
  }
  const currentBudgets = [...currentBudgetByKey.values()],
    allocated = sumByCurrency(currentBudgets, (item: any) => item.allocatedMinor, (item: any) => item.currency),
    awarded = sumByCurrency(currentBudgets, (item: any) => item.awardedMinor, (item: any) => item.currency),
    redeemed = sumByCurrency(currentBudgets, (item: any) => item.redeemedMinor, (item: any) => item.currency)

  const asOf = new Date()
  const live = promotions.filter((item: any) => item.status === 'ACTIVE')
  const drafts = promotions.filter((item: any) => item.status === 'DRAFT')
  const others = promotions.filter((item: any) => item.status !== 'ACTIVE' && item.status !== 'DRAFT')
  const draftOptions = drafts.map((item: any) => ({ label: item.name, value: item.id }))
  const columns = ['Campaign', 'Window', 'Awarded / budget', 'State']
  const campaignRow = (item: any): RecordRow => {
    const budget = currentBudgets.find((row: any) => row.promotionId === item.id && row.currency === item.currency)
    return {
      id: item.id,
      href: `/dashboard/platform/promotions/${item.id}`,
      status: item.status,
      cells: [
        <span key="id"><span className="font-semibold">{item.name}</span><span className="block break-all tabular-nums text-xs font-normal text-muted-foreground">{shortId(item.id)} · {item.termsHash}</span></span>,
        <Mono key="window" className="text-xs">{dateTime(item.startsAt)} → {dateTime(item.endsAt)}</Mono>,
        budget
          ? <span key="budget"><Mono>{money(budget.awardedMinor, item.currency)} / {money(budget.allocatedMinor, item.currency)}</Mono><Link href={hrefWith('/dashboard/platform/promotions', { campaign: item.id }) + '#budget-history'} className="mt-1 block text-xs font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground">History</Link></span>
          : 'No budget',
        <StatusBadge key="status" value={item.status} />,
      ],
    }
  }

  return <OperatorShell
    active="Promotions"
    title="Promotions"
    tenantName={operator.tenantName}
    tone={live.length ? 'live' : drafts.length ? 'wait' : undefined}
    meta={`${live.length} live · ${drafts.length} draft · ${awards} awards · ${redemptions.length} redemptions`}
  >
    <MetricGrid items={[
      { label: 'Live', value: live.length, detail: `of ${promotions.length} campaigns`, tone: live.length ? 'live' : 'off' },
      { label: 'Awarded', value: moneyTotals(awarded), detail: `redeemed ${moneyTotals(redeemed)}` },
      { label: 'Allocated', value: moneyTotals(allocated), detail: `${currentBudgets.length} current budgets` },
      { label: 'Redemptions', value: redemptions.length, detail: `${awards} awards` },
    ]} />

    <RecordList title="Live" tone={live.length ? 'live' : undefined} columns={columns} rows={live.map(campaignRow)} emptyTitle="No live campaigns" />

    {historyPromotion ? <BudgetHistory tenantId={tenantId} promotion={historyPromotion} page={budgetPage} /> : null}

    <div className="grid gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <RecordList title="Drafts" tone={drafts.length ? 'wait' : undefined} columns={columns} rows={drafts.map(campaignRow)} emptyTitle="No drafts" />
      <div className="grid content-start gap-4">
        <MutationForm compact title="Request activation" mutation={`mutation($promotionId:ID!,$reason:String!){requestPromotionActivation(promotionId:$promotionId,reason:$reason)}`} fields={[{ name: 'promotionId', label: 'Draft promotion', type: 'select', options: draftOptions }, { name: 'reason', label: 'Reason' }]} submitLabel="Request approval" successMessage="Activation approval requested." />
        <MutationForm compact title="Apply approved activation" mutation={`mutation($promotionId:ID!,$approvalId:ID!){applyPromotionActivation(promotionId:$promotionId,approvalId:$approvalId)}`} fields={[{ name: 'promotionId', label: 'Draft promotion', type: 'select', options: draftOptions }, { name: 'approvalId', label: 'Approved request ID' }]} submitLabel="Activate campaign" successMessage="Campaign activated with immutable evidence." />
      </div>
    </div>

    {others.length ? <RecordList title="Scheduled, paused & ended" columns={columns} rows={others.map(campaignRow)} emptyTitle="No other campaigns" /> : null}

    <MutationForm title="Create campaign draft" mutation={`mutation($key:String!,$name:String!,$description:String!,$type:String!,$startsAt:String!,$endsAt:String!,$budgetMinor:String!,$currency:String!,$economics:String!,$requirements:String!){createPromotionCampaign(key:$key,name:$name,description:$description,type:$type,startsAt:$startsAt,endsAt:$endsAt,budgetMinor:$budgetMinor,currency:$currency,economics:$economics,requirements:$requirements)}`} fields={[{ name: 'key', label: 'Unique key', placeholder: 'e.g. weekend-free-bet' }, { name: 'name', label: 'Campaign name', placeholder: 'e.g. Weekend free bet' }, { name: 'description', label: 'Customer description' }, { name: 'type', label: 'Type', type: 'select', options: ['FREE_BET', 'ODDS_BOOST', 'DEPOSIT_MATCH', 'CASHBACK'].map(value => ({ label: value, value })) }, { name: 'startsAt', label: 'Starts at (ISO)', defaultValue: new Date(asOf.getTime() + 3_600_000).toISOString() }, { name: 'endsAt', label: 'Ends at (ISO)', defaultValue: new Date(asOf.getTime() + 30 * 86_400_000).toISOString() }, { name: 'budgetMinor', label: 'Budget minor units', defaultValue: '100000' }, { name: 'currency', label: 'Currency', defaultValue: 'USD' }, { name: 'economicsAmount', jsonPath: 'economics.amountMinor', label: 'Award amount (minor units)', defaultValue: '500', required: false, help: 'Blank for odds boost' }, { name: 'economicsStakeReturned', jsonPath: 'economics.stakeReturned', label: 'Stake returned on a win', type: 'select', transform: 'boolean', defaultValue: 'false', options: [{ label: 'No', value: 'false' }, { label: 'Yes', value: 'true' }] }, { name: 'economicsBoost', jsonPath: 'economics.boostBasisPoints', label: 'Boost (basis points)', transform: 'int', required: false, placeholder: 'e.g. 1000 for 10%', help: 'Odds boost only' }, { name: 'economicsMaxBoost', jsonPath: 'economics.maxBoostMinor', label: 'Maximum boost (minor units)', required: false, help: 'Odds boost only' }, { name: 'requirementsMinimumOdds', jsonPath: 'requirements.minimumOdds', label: 'Minimum decimal odds', defaultValue: '1.50', required: false }, { name: 'requirementsWagering', jsonPath: 'requirements.wageringMultiple', label: 'Wagering multiple', transform: 'int', required: false, placeholder: 'e.g. 3', help: 'Deposit match only' }, { name: 'requirementsStructures', jsonPath: 'requirements.validStructures', label: 'Eligible bet structures', type: 'checkboxes', options: structureOptions, defaultValue: '{"STRAIGHT":true,"PARLAY":true}' }]} submitLabel="Create draft" successMessage="Campaign draft and budget created." />

    <ExternalGateNotice />
  </OperatorShell>
}
