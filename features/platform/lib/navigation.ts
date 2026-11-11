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
  // Operator capabilities that open this page (any one suffices); the page itself checks the same ones.
  capabilities?: string[]
}

export interface PlatformNavGroup {
  id: string
  title: string
  icon: LucideIcon
  items: PlatformNavItem[]
}

// Sportsbook operations, relative to the dashboard basePath, in the order the sidebar lists them.
export const platformNavItems: PlatformNavItem[] = [
  { title: 'Control room', href: '/platform', capabilities: ['canManageSportsbook'], color: 'rose', description: 'Today’s queues, exceptions and shortcuts into each workflow.', icon: Radio, group: 'standalone', exact: true },
  { title: 'Catalog', href: '/platform/catalog', capabilities: ['canTrade'], color: 'green', description: 'Create and manage events, markets and selections.', icon: Package, group: 'standalone', exact: true },
  { title: 'Catalog reference', href: '/platform/catalog/reference', capabilities: ['canTrade'], color: 'green', description: 'Sports, competitions, seasons, stages, venues and competitors.', icon: Package, group: 'standalone' },
  { title: 'Trading & prices', href: '/platform/trading', capabilities: ['canTrade'], color: 'blue', description: 'Monitor market status and prices, and suspend or reopen markets.', icon: Radio, group: 'standalone' },
  { title: 'Wager investigation', href: '/platform/wagers', capabilities: ['canManageRisk'], color: 'indigo', description: 'Look up wagers, accepted terms and acceptance decisions.', icon: ReceiptText, group: 'standalone' },
  { title: 'Risk & limits', href: '/platform/risk', capabilities: ['canManageRisk'], color: 'red', description: 'Monitor liability and manage stake and payout limits.', icon: ShieldCheck, group: 'standalone' },
  { title: 'Result approval', href: '/platform/results', capabilities: ['canTrade', 'canManageRisk'], color: 'amber', description: 'Enter official results and send them for independent approval.', icon: ShieldCheck, group: 'standalone' },
  { title: 'Grading', href: '/platform/grading', capabilities: ['canManageRisk'], color: 'orange', description: 'Grade selections from approved results under the current house rules.', icon: ReceiptText, group: 'standalone' },
  { title: 'Settlement', href: '/platform/settlements', capabilities: ['canManageRisk'], color: 'emerald', description: 'Settle graded wagers and review corrections.', icon: WalletCards, group: 'standalone' },
  { title: 'Customers', href: '/platform/customers', capabilities: ['canManageCompliance'], color: 'purple', description: 'Review players, identity verification and AML cases.', icon: ShieldCheck, group: 'standalone' },
  { title: 'Compliance & integrity', href: '/platform/compliance', capabilities: ['canManageCompliance'], color: 'slate', description: 'Identity, AML, location, affordability, privacy and integrity reviews.', icon: ShieldCheck, group: 'standalone' },
  { title: 'Responsible gaming', href: '/platform/responsible-gaming', capabilities: ['canManageCompliance'], color: 'teal', description: 'Player limits, cool-offs and self-exclusions.', icon: ShieldCheck, group: 'standalone' },
  { title: 'Account closures', href: '/platform/closures', capabilities: ['canManageCompliance'], color: 'teal', description: 'Customer closure requests and their blockers.', icon: ShieldCheck, group: 'standalone' },
  { title: 'Support & disputes', href: '/platform/support', capabilities: ['canManageCompliance'], color: 'cyan', description: 'Support cases, disputes, resolutions and appeals.', icon: ReceiptText, group: 'standalone' },
  { title: 'Notifications', href: '/platform/notifications', capabilities: ['canManageSportsbook'], color: 'cyan', description: 'Messages sent to customers and staff.', icon: ReceiptText, group: 'standalone' },
  { title: 'Finance', href: '/platform/finance', capabilities: ['canManageFinance'], color: 'emerald', description: 'Ledger journals, payments and balances.', icon: WalletCards, group: 'standalone', exact: true },
  { title: 'Licences & payments', href: '/platform/payments', capabilities: ['canManageCompliance'], color: 'slate', description: 'Operator licences, payment providers and payout queue.', icon: ShieldCheck, group: 'standalone' },
  { title: 'Reconciliation & safeguarding', href: '/platform/finance/reconciliation', capabilities: ['canManageFinance'], color: 'emerald', description: 'Compare the ledger with provider, bank and safeguarded-funds records.', icon: WalletCards, group: 'standalone' },
  { title: 'Tax', href: '/platform/finance/tax', capabilities: ['canManageFinance'], color: 'emerald', description: 'Tax assessed on settled wagers.', icon: WalletCards, group: 'standalone' },
  { title: 'Promotions', href: '/platform/promotions', capabilities: ['canManageSportsbook'], color: 'pink', description: 'Campaigns, terms, budgets and player awards.', icon: Package, group: 'standalone' },
  { title: 'Providers & certification', href: '/platform/providers', capabilities: ['canManageIntegrations'], color: 'orange', description: 'Provider health and certification status.', icon: Plug, group: 'standalone' },
  { title: 'Integrations', href: '/platform/integrations', capabilities: ['canManageIntegrations'], color: 'orange', description: 'Provider connections, inbound messages and webhooks.', icon: Plug, group: 'standalone' },
  { title: 'Integration inbox', href: '/platform/integrations/inbox', capabilities: ['canManageIntegrations'], color: 'orange', description: 'Messages received from providers.', icon: Plug, group: 'standalone' },
  { title: 'Webhook evidence', href: '/platform/integrations/webhooks', capabilities: ['canManageIntegrations'], color: 'orange', description: 'Inbound and outbound webhook deliveries.', icon: Plug, group: 'standalone' },
  { title: 'Incidents', href: '/platform/incidents', capabilities: ['canManageIntegrations'], color: 'red', description: 'Open, mitigate and resolve incidents.', icon: Radio, group: 'standalone' },
  { title: 'Reports', href: '/platform/reports', capabilities: ['canManageCompliance', 'canReadAudit'], color: 'indigo', description: 'Request regulatory reports and exports.', icon: ReceiptText, group: 'standalone' },
  { title: 'Configuration', href: '/platform/configuration', capabilities: ['canManageSportsbook'], color: 'slate', description: 'Channels, currencies, languages, feature flags and effective policy values.', icon: Settings, group: 'standalone', exact: true },
  { title: 'Legal & jurisdictions', href: '/platform/configuration/jurisdictions', capabilities: ['canManageSportsbook'], color: 'slate', description: 'Legal entities and the jurisdictions you operate in.', icon: ShieldCheck, group: 'standalone' },
  { title: 'Settings', href: '/platform/settings', capabilities: ['canManageSportsbook'], color: 'slate', description: 'Storefront branding and policy settings.', icon: Settings, group: 'standalone' },
  { title: 'Roles', href: '/platform/roles', capabilities: ['canManageRoles', 'canManagePeople'], color: 'violet', description: 'Operator roles, permissions and role assignments.', icon: ShieldCheck, group: 'standalone' },
  { title: 'Operator security', href: '/platform/security', color: 'violet', description: 'Two-factor authentication for your operator account.', icon: ShieldCheck, group: 'standalone' },
  { title: 'Approval inbox', href: '/platform/approvals', capabilities: ['canApproveSensitiveActions'], color: 'amber', description: 'Approve or reject requests from other operators.', icon: ShieldCheck, group: 'standalone' },
  { title: 'Audit', href: '/platform/audit', capabilities: ['canReadAudit'], color: 'slate', description: 'History of privileged operator actions.', icon: ReceiptText, group: 'standalone' },
  { title: 'Onboarding', href: '/platform/onboarding', capabilities: ['canManageOnboarding'], color: 'slate', description: 'Set up your sportsbook, brand, jurisdictions and providers.', icon: Settings, group: 'standalone' },
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
