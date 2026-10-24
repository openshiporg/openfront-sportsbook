import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ExternalGateNotice, OperatorShell, TenantRequired } from '../components/OperatorShell'
import { MutationForm } from '../components/MutationForm'
import { Mono, PillLink, Track } from '../components/kit'
import { DetailGrid, MetricGrid, RecordList, StatusBadge, statusDotTone, WorkflowNote } from '../components/WorkflowUI'
import { dateTime, jsonText, money, shortId } from '../lib/format'
import { getOperatorContext, platformPrisma as prisma } from '../lib/operator'
import { hrefWith, pageFrom, PLATFORM_PAGE_SIZE, type PlatformSearchParams } from '../lib/paging'

// Same mutation strings as the list page; here the promotion is fixed instead of chosen.
const requestActivationMutation = `mutation($promotionId:ID!,$reason:String!){requestPromotionActivation(promotionId:$promotionId,reason:$reason)}`
const applyActivationMutation = `mutation($promotionId:ID!,$approvalId:ID!){applyPromotionActivation(promotionId:$promotionId,approvalId:$approvalId)}`

const label = (value: string) => value.replace(/Minor$/, '').replace(/([a-z])([A-Z])/g, '$1 $2').replaceAll('_', ' ').toLowerCase()

/** Short readable line for a rule document: top-level keys and scalar values; money keys in the promotion currency. */
function ruleSummary(value: unknown, currency: string) {
  if (value === null || value === undefined) return '—'
  if (typeof value !== 'object' || Array.isArray(value)) return String(value)
  const entries = Object.entries(value as Record<string, unknown>)
  if (!entries.length) return '—'
  const part = ([key, item]: [string, unknown]) => {
    if (/Minor$/.test(key) && (typeof item === 'string' || typeof item === 'number') && /^-?\d+$/.test(String(item))) return `${label(key)} ${money(String(item), currency)}`
    if (Array.isArray(item)) return `${label(key)} ${item.map(String).join(', ').toLowerCase()}`
    if (item && typeof item === 'object') {
      const on = Object.entries(item as Record<string, unknown>).filter(([, flag]) => flag === true).map(([name]) => name.toLowerCase())
      return on.length ? `${label(key)} ${on.join(', ')}` : label(key)
    }
    return `${label(key)} ${typeof item === 'boolean' ? (item ? 'yes' : 'no') : String(item)}`
  }
  const shown = entries.slice(0, 4).map(part).join(' · ')
  return entries.length > 4 ? `${shown} · +${entries.length - 4}` : shown
}

function RuleDocument({ name, value, currency }: { name: string; value: unknown; currency: string }) {
  return <div className="min-w-0">
    <p className="break-words text-sm">{ruleSummary(value, currency)}</p>
    <details className="mt-1 text-xs text-muted-foreground">
      <summary className="cursor-pointer select-none hover:text-foreground">{name} JSON</summary>
      <pre className="mt-1 max-h-64 overflow-auto whitespace-pre-wrap break-all rounded-md bg-muted/60 p-2 font-mono text-[11px] text-foreground">{jsonText(value)}</pre>
    </details>
  </div>
}

export async function PromotionDetailScreen({ promotionId, searchParams }: { promotionId: string; searchParams?: PlatformSearchParams }) {
  const params = (await searchParams) ?? {},
    redemptionPage = pageFrom({ page: params.rpage }),
    awardPage = pageFrom({ page: params.apage })
  const operator = await getOperatorContext('canManageSportsbook')
  if (!operator) return <OperatorShell active="Promotions" detail title="Promotion"><TenantRequired /></OperatorShell>
  const tenantId = operator.tenantId
  const promotion = await prisma.promotion.findFirst({ where: { tenantId, id: promotionId }, include: { approvalRequest: true, brand: true, jurisdiction: true } })
  if (!promotion) notFound()
  const scope = { tenantId, promotionId: promotion.id }
  const [budget, budgetVersions, rules, redemptions, redemptionTotal, awards, awardTotal] = await Promise.all([
    prisma.campaignBudget.findFirst({ where: { ...scope, currency: promotion.currency }, orderBy: [{ version: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }] }),
    prisma.campaignBudget.count({ where: scope }),
    prisma.promotionRuleVersion.findMany({ where: scope, orderBy: [{ version: 'desc' }, { id: 'desc' }], take: 100 }),
    prisma.promotionRedemption.findMany({ where: scope, orderBy: [{ redeemedAt: 'desc' }, { id: 'desc' }], take: PLATFORM_PAGE_SIZE, skip: (redemptionPage - 1) * PLATFORM_PAGE_SIZE, include: { player: true, ruleVersion: true } }),
    prisma.promotionRedemption.count({ where: scope }),
    prisma.bonusAward.findMany({ where: scope, orderBy: [{ awardedAt: 'desc' }, { id: 'desc' }], take: PLATFORM_PAGE_SIZE, skip: (awardPage - 1) * PLATFORM_PAGE_SIZE, include: { player: true } }),
    prisma.bonusAward.count({ where: scope }),
  ])
  const movements = awards.length ? await prisma.bonusTransaction.findMany({ where: { tenantId, awardId: { in: awards.map((award: any) => award.id) } }, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }] }) : []
  const movementsByAward = new Map<string, any[]>()
  for (const item of movements) movementsByAward.set(item.awardId, [...(movementsByAward.get(item.awardId) ?? []), item])

  const currency: string = promotion.currency
  const remaining = budget ? (() => { try { return String(BigInt(budget.allocatedMinor || '0') - BigInt(budget.awardedMinor || '0')) } catch { return null } })() : null
  const activeRule = rules.find((rule: any) => rule.status === 'ACTIVE')
  const approval = promotion.approvalRequest
  const isDraft = promotion.status === 'DRAFT'
  const basePath = `/dashboard/platform/promotions/${promotion.id}`
  const linkClass = 'underline underline-offset-2 hover:text-foreground'
  const playerLink = (player: any, playerId: string) => <Link className={linkClass} href={`/dashboard/platform/customers/${playerId}`}>{player?.subject || shortId(playerId)}</Link>
  const statusLabel = String(promotion.status ?? 'unknown').toLowerCase()
  const typeLabel = String(promotion.type ?? '—').replaceAll('_', ' ').toLowerCase()

  return <OperatorShell
    active="Promotions"
    detail
    title={promotion.name || promotion.key}
    tenantName={operator.tenantName}
    tone={statusDotTone(promotion.status)}
    meta={`${statusLabel} · ${typeLabel} · ${dateTime(promotion.startsAt)} → ${dateTime(promotion.endsAt)}`}
    actions={<Track><PillLink size="sm" href="/dashboard/platform/promotions">All promotions</PillLink></Track>}
  >
    {budget ? <MetricGrid items={[
      { label: 'Remaining', value: remaining === null ? '—' : money(remaining, currency), detail: `of ${money(budget.allocatedMinor, currency)} allocated`, tone: budget.status === 'ACTIVE' ? 'ok' : budget.status === 'EXHAUSTED' ? 'alert' : 'off' },
      { label: 'Awarded', value: money(budget.awardedMinor, currency), detail: `${awardTotal} awards` },
      { label: 'Redeemed', value: money(budget.redeemedMinor, currency), detail: `${redemptionTotal} redemptions` },
      { label: 'Forfeited', value: money(budget.forfeitedMinor, currency), detail: `budget v${budget.version} · ${String(budget.status ?? 'unknown').toLowerCase()}` },
    ]} /> : <WorkflowNote title="No budget" tone="warning"><Mono>{currency || 'No currency'}</Mono></WorkflowNote>}

    <DetailGrid items={[
      { label: 'Status', value: <StatusBadge value={promotion.status} /> },
      { label: 'Key', value: <Mono className="break-all">{promotion.key}</Mono> },
      { label: 'Type', value: typeLabel },
      { label: 'Starts', value: <Mono>{dateTime(promotion.startsAt)}</Mono> },
      { label: 'Ends', value: <Mono>{dateTime(promotion.endsAt)}</Mono> },
      { label: 'Brand · jurisdiction', value: `${promotion.brand?.name || 'All brands'} · ${promotion.jurisdiction?.code || 'All jurisdictions'}` },
      { label: 'Terms', value: <span><Mono>{promotion.termsVersion || '—'}</Mono><span className="block break-all font-mono text-xs text-muted-foreground">{promotion.termsHash || '—'}</span></span> },
      { label: 'Approval', value: approval ? <span className="flex flex-wrap items-center gap-2"><StatusBadge value={approval.status} /><Link className={`font-mono text-xs ${linkClass}`} href="/dashboard/platform/approvals">{shortId(approval.id)}</Link></span> : 'None' },
      { label: 'Budget versions', value: <Link className={`font-mono ${linkClass}`} href={hrefWith('/dashboard/platform/promotions', { campaign: promotion.id }) + '#budget-history'}>{budgetVersions}</Link> },
    ]} />

    {isDraft ? <section aria-labelledby="promotion-activation" className="min-w-0 space-y-3">
      <h2 id="promotion-activation" className="text-sm font-semibold">Activation</h2>
      <div className="grid gap-4 lg:grid-cols-2">
        <MutationForm compact title="Request activation" mutation={requestActivationMutation} fields={[{ name: 'promotionId', label: 'Promotion', type: 'hidden', defaultValue: promotion.id }, { name: 'reason', label: 'Reason' }]} submitLabel="Request approval" successMessage="Activation approval requested." />
        <MutationForm compact title="Apply approved activation" mutation={applyActivationMutation} fields={[{ name: 'promotionId', label: 'Promotion', type: 'hidden', defaultValue: promotion.id }, { name: 'approvalId', label: 'Approved request', type: 'select', options: approval?.status === 'APPROVED' ? [{ label: `${shortId(approval.id)} · approved`, value: approval.id }] : [], emptyOptionsMessage: 'No approved request' }]} submitLabel="Activate campaign" successMessage="Campaign activated with immutable evidence." />
      </div>
    </section> : null}

    <RecordList
      title="Rule versions"
      tone={activeRule ? 'ok' : undefined}
      columns={['Version', 'Effective', 'Eligibility', 'Economics']}
      rows={rules.map((rule: any) => ({
        id: rule.id,
        status: rule.status,
        cells: [
          <span key="v"><Mono className="font-semibold">v{rule.version}</Mono><span className="mt-1 block"><StatusBadge value={rule.status} /></span></span>,
          <Mono key="window" className="text-xs">{dateTime(rule.effectiveFrom)} → {rule.effectiveTo ? dateTime(rule.effectiveTo) : 'open'}</Mono>,
          <RuleDocument key="eligibility" name="Eligibility" value={rule.eligibility} currency={currency} />,
          <RuleDocument key="economics" name="Economics" value={rule.economics} currency={currency} />,
        ],
      }))}
      emptyTitle="No rule versions"
    />

    <RecordList
      title="Awards"
      columns={['Player', 'Amount / remaining', 'Movements', 'Expiry']}
      rows={awards.map((award: any) => {
        const items = movementsByAward.get(award.id) ?? []
        return {
          id: award.id,
          status: award.status,
          cells: [
            <span key="player">{playerLink(award.player, award.playerId)}<span className="mt-1 flex flex-wrap items-center gap-2 text-xs font-normal text-muted-foreground"><StatusBadge value={award.status} />{String(award.awardType ?? '').replaceAll('_', ' ').toLowerCase()}</span></span>,
            <Mono key="amount">{money(award.amountMinor, award.currency)} / {money(award.remainingMinor, award.currency)}</Mono>,
            items.length
              ? <ol key="movements" className="space-y-0.5 text-xs">{items.map((item: any) => <li key={item.id} className="flex flex-wrap justify-between gap-x-2"><span>{String(item.type ?? '').toLowerCase()}</span><Mono>{money(item.amountMinor, item.currency)} → {money(item.remainingMinor, item.currency)}</Mono><Mono className="w-full text-muted-foreground">{dateTime(item.createdAt)}</Mono></li>)}</ol>
              : <span key="movements" className="text-xs">No movements</span>,
            <span key="expiry"><Mono className="text-xs">{dateTime(award.expiresAt)}</Mono><span className="block font-mono text-xs text-muted-foreground">awarded {dateTime(award.awardedAt)}</span></span>,
          ],
        }
      })}
      emptyTitle="No awards"
      pagination={{ page: awardPage, pageSize: PLATFORM_PAGE_SIZE, total: awardTotal, hrefForPage: (next) => hrefWith(basePath, { apage: next, rpage: redemptionPage }) }}
    />

    <RecordList
      title="Redemptions"
      columns={['Player', 'Rule', 'Reason', 'Redeemed']}
      rows={redemptions.map((item: any) => ({
        id: item.id,
        status: item.status,
        cells: [
          <span key="player">{playerLink(item.player, item.playerId)}<span className="mt-1 block"><StatusBadge value={item.status} /></span></span>,
          <Mono key="rule">{item.ruleVersion ? `v${item.ruleVersion.version}` : '—'}</Mono>,
          <span key="reason" className="break-words">{item.reasonCode || '—'}</span>,
          <Mono key="at" className="text-xs">{dateTime(item.redeemedAt)}</Mono>,
        ],
      }))}
      emptyTitle="No redemptions"
      pagination={{ page: redemptionPage, pageSize: PLATFORM_PAGE_SIZE, total: redemptionTotal, hrefForPage: (next) => hrefWith(basePath, { rpage: next, apage: awardPage }) }}
    />

    <ExternalGateNotice />
  </OperatorShell>
}
