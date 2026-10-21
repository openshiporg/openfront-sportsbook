import type { LucideIcon } from 'lucide-react'
import { Package, Plug, Radio, ReceiptText, Settings, ShieldCheck, WalletCards } from 'lucide-react'

export interface PlatformNavItem {
  title: string
  href: string
  color: string
  description: string
  icon: LucideIcon
  group?: string
  // Highlight only on this exact path, for entries whose sub-routes are other nav entries.
  exact?: boolean
}

export interface PlatformNavGroup {
  id: string
  title: string
  icon: LucideIcon
  items: PlatformNavItem[]
}

// Sportsbook operations, relative to the dashboard basePath, in the order the sidebar lists them.
export const platformNavItems: PlatformNavItem[] = [
  { title: 'Control room', href: '/platform', color: 'rose', description: 'Today’s queues, exceptions and shortcuts into each workflow.', icon: Radio, group: 'standalone', exact: true },
  { title: 'Catalog', href: '/platform/catalog', color: 'green', description: 'Create and manage events, markets and selections.', icon: Package, group: 'standalone' },
  { title: 'Trading & prices', href: '/platform/trading', color: 'blue', description: 'Monitor market status and prices, and suspend or reopen markets.', icon: Radio, group: 'standalone' },
  { title: 'Wager investigation', href: '/platform/wagers', color: 'indigo', description: 'Look up wagers, accepted terms and acceptance decisions.', icon: ReceiptText, group: 'standalone' },
  { title: 'Risk & limits', href: '/platform/risk', color: 'red', description: 'Monitor liability and manage stake and payout limits.', icon: ShieldCheck, group: 'standalone' },
  { title: 'Result approval', href: '/platform/results', color: 'amber', description: 'Enter official results and send them for independent approval.', icon: ShieldCheck, group: 'standalone' },
  { title: 'Grading', href: '/platform/grading', color: 'orange', description: 'Grade selections from approved results under the current house rules.', icon: ReceiptText, group: 'standalone' },
  { title: 'Settlement', href: '/platform/settlements', color: 'emerald', description: 'Settle graded wagers and review corrections.', icon: WalletCards, group: 'standalone' },
  { title: 'Customers', href: '/platform/customers', color: 'purple', description: 'Review players, identity verification and AML cases.', icon: ShieldCheck, group: 'standalone' },
  { title: 'Compliance & integrity', href: '/platform/compliance', color: 'slate', description: 'Identity, AML, location, affordability, privacy and integrity reviews.', icon: ShieldCheck, group: 'standalone' },
  { title: 'Responsible gaming', href: '/platform/responsible-gaming', color: 'teal', description: 'Player limits, cool-offs and self-exclusions.', icon: ShieldCheck, group: 'standalone' },
  { title: 'Support & disputes', href: '/platform/support', color: 'cyan', description: 'Support cases, disputes, resolutions and appeals.', icon: ReceiptText, group: 'standalone' },
  { title: 'Finance', href: '/platform/finance', color: 'emerald', description: 'Ledger journals, payments and balances.', icon: WalletCards, group: 'standalone', exact: true },
  { title: 'Reconciliation & safeguarding', href: '/platform/finance/reconciliation', color: 'emerald', description: 'Compare the ledger with provider, bank and safeguarded-funds records.', icon: WalletCards, group: 'standalone' },
  { title: 'Promotions', href: '/platform/promotions', color: 'pink', description: 'Campaigns, terms, budgets and player awards.', icon: Package, group: 'standalone' },
  { title: 'Providers & certification', href: '/platform/providers', color: 'orange', description: 'Provider health and certification status.', icon: Plug, group: 'standalone' },
  { title: 'Integrations', href: '/platform/integrations', color: 'orange', description: 'Provider connections, inbound messages and webhooks.', icon: Plug, group: 'standalone' },
  { title: 'Integration inbox', href: '/platform/integrations/inbox', color: 'orange', description: 'Messages received from providers.', icon: Plug, group: 'standalone' },
  { title: 'Webhook evidence', href: '/platform/integrations/webhooks', color: 'orange', description: 'Inbound and outbound webhook deliveries.', icon: Plug, group: 'standalone' },
  { title: 'Dead-letter queue', href: '/platform/integrations/dlq', color: 'orange', description: 'Review failed jobs and retry them.', icon: Plug, group: 'standalone' },
  { title: 'Worker recovery', href: '/platform/recovery', color: 'slate', description: 'Monitor background jobs and retry stuck work.', icon: Plug, group: 'standalone' },
  { title: 'Incidents', href: '/platform/incidents', color: 'red', description: 'Open, mitigate and resolve incidents.', icon: Radio, group: 'standalone' },
  { title: 'Reports', href: '/platform/reports', color: 'indigo', description: 'Request regulatory reports and exports.', icon: ReceiptText, group: 'standalone' },
  { title: 'Configuration', href: '/platform/configuration', color: 'slate', description: 'Channels, currencies, languages, feature flags and effective policy values.', icon: Settings, group: 'standalone', exact: true },
  { title: 'Legal & jurisdictions', href: '/platform/configuration/jurisdictions', color: 'slate', description: 'Legal entities and the jurisdictions you operate in.', icon: ShieldCheck, group: 'standalone' },
  { title: 'Settings', href: '/platform/settings', color: 'slate', description: 'Storefront branding and policy settings.', icon: Settings, group: 'standalone' },
  { title: 'Roles', href: '/platform/roles', color: 'violet', description: 'Operator roles, permissions and role assignments.', icon: ShieldCheck, group: 'standalone' },
  { title: 'Operator security', href: '/platform/security', color: 'violet', description: 'Two-factor authentication for your operator account.', icon: ShieldCheck, group: 'standalone' },
  { title: 'Approval inbox', href: '/platform/approvals', color: 'amber', description: 'Approve or reject requests from other operators.', icon: ShieldCheck, group: 'standalone' },
  { title: 'Audit', href: '/platform/audit', color: 'slate', description: 'History of privileged operator actions.', icon: ReceiptText, group: 'standalone' },
  { title: 'Onboarding', href: '/platform/onboarding', color: 'slate', description: 'Set up your sportsbook, brand, jurisdictions and providers.', icon: Settings, group: 'standalone' },
]

export const platformStandaloneItems = platformNavItems.filter((item) => item.group === 'standalone')

// Sportsbook lists every operation as a standalone entry, so it has no collapsible groups.
export const platformNavGroups: PlatformNavGroup[] = []

export function getPlatformNavItemsWithBasePath(basePath: string) {
  return platformNavItems.map((item) => ({ ...item, href: `${basePath}${item.href}` }))
}

export function getIconForNavItem(title: string): LucideIcon {
  return platformNavItems.find((item) => item.title === title)?.icon || Package
}
