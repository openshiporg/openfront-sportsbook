import type { ReactNode } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { PageBreadcrumbs } from "@/features/dashboard/components/PageBreadcrumbs";
import { platformNavItems, type PlatformNavItem } from "../lib/navigation";
import { getOperatorAccessState, type OperatorAccessState } from "../lib/operator";

// Screen keys -> platform registry routes. Labels, descriptions and breadcrumb
// hierarchy all come from the single registry in ../lib/navigation.ts, which the
// shared sidebar also renders.
const screenRoutes = {
  Overview: "/platform",
  Catalog: "/platform/catalog",
  Trading: "/platform/trading",
  Wagers: "/platform/wagers",
  Risk: "/platform/risk",
  Results: "/platform/results",
  Grading: "/platform/grading",
  Settlement: "/platform/settlements",
  Customers: "/platform/customers",
  Compliance: "/platform/compliance",
  RG: "/platform/responsible-gaming",
  Support: "/platform/support",
  Finance: "/platform/finance",
  Reconciliation: "/platform/finance/reconciliation",
  Promotions: "/platform/promotions",
  Providers: "/platform/providers",
  Integrations: "/platform/integrations",
  Inbox: "/platform/integrations/inbox",
  Webhooks: "/platform/integrations/webhooks",
  DLQ: "/platform/integrations/dlq",
  Recovery: "/platform/recovery",
  Incidents: "/platform/incidents",
  Reports: "/platform/reports",
  Configuration: "/platform/configuration",
  Jurisdictions: "/platform/configuration/jurisdictions",
  Settings: "/platform/settings",
  Roles: "/platform/roles",
  Security: "/platform/security",
  Approvals: "/platform/approvals",
  Audit: "/platform/audit",
  Onboarding: "/platform/onboarding",
} as const;

export type PlatformScreenKey = keyof typeof screenRoutes;

function registryItem(href: string): PlatformNavItem | undefined {
  return platformNavItems.find((item) => item.href === href);
}

type Crumb = { type: "link" | "page"; label: string; href?: string };

function breadcrumbsFor(active: PlatformScreenKey, title: string, detail: boolean): Crumb[] {
  const href = screenRoutes[active];
  const item = registryItem(href);
  const crumbs: Crumb[] = [{ type: "link", label: "Dashboard", href: "/" }, { type: "page", label: "Platform" }];
  // Nested registry routes (e.g. Finance → Reconciliation) link back to their parent workflow.
  const parent = platformNavItems
    .filter((candidate) => candidate.href !== "/platform" && candidate.href !== href && href.startsWith(`${candidate.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];
  if (parent) crumbs.push({ type: "link", label: parent.title, href: parent.href });
  const label = item?.title ?? title;
  if (detail) crumbs.push({ type: "link", label, href }, { type: "page", label: title });
  else crumbs.push({ type: "page", label });
  return crumbs;
}

export function OperatorShell({
  active,
  title,
  description,
  tenantName,
  detail = false,
  actions,
  children,
}: {
  active: PlatformScreenKey;
  /** Retained for existing callers; the canonical page header has no eyebrow. */
  eyebrow?: string;
  title: string;
  description: string;
  tenantName?: string;
  /** Record pages add the workflow list as a breadcrumb link before the record title. */
  detail?: boolean;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex min-w-0 flex-col">
      <PageBreadcrumbs items={breadcrumbsFor(active, title, detail)} actions={actions} />
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-4 md:px-6 md:pt-6">
        <div className="min-w-0 max-w-3xl">
          <h1 id="platform-page-title" tabIndex={-1} className="text-2xl font-semibold text-gray-900 outline-none dark:text-gray-50">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        {tenantName ? (
          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            <span className="sr-only">Operator: </span>
            {tenantName}
          </span>
        ) : null}
      </div>
      <div className="min-w-0 space-y-6 px-4 py-4 md:px-6 md:py-6">{children}</div>
    </section>
  );
}

const accessCopy: Record<OperatorAccessState["kind"], { title: string; body: string }> = {
  signed_out: { title: "Sign in to continue", body: "Your session has ended. Sign in again to open this workflow." },
  step_up_required: { title: "MFA verification required", body: "This session still needs operator MFA verification before tenant data can be shown." },
  unassigned: { title: "No operator assigned", body: "Your account isn't assigned to an operator yet." },
  forbidden: { title: "You don't have access to this page", body: "Your current role doesn't include this workflow. Ask a tenant administrator for the capability." },
  service_unavailable: { title: "Access couldn't be checked", body: "Your access couldn't be verified right now. No data was shown. Try again shortly." },
  allowed: { title: "You don't have access to this page", body: "Your current role doesn't include this workflow." },
};

/** Typed denial: each access condition gets its own next action and no unrelated setup loop. */
export async function TenantRequired() {
  const state = await getOperatorAccessState();
  const copy = accessCopy[state.kind];
  const linkClass = "inline-flex rounded-md border border-current px-3 py-2 text-sm font-medium hover:bg-amber-100 dark:hover:bg-amber-900/40";
  const body = state.kind === "unassigned"
    ? state.canSetUp ? "Your account isn't assigned to an operator yet. Complete operator setup to create your tenant." : "Your account isn't assigned to an operator yet. Ask a tenant administrator to admit you to their operator."
    : copy.body;
  return (
    <section role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <div>
          <h2 className="font-semibold">{copy.title}</h2>
          <p className="mt-1 text-sm">{body}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {state.kind === "signed_out" ? <Link className={linkClass} href="/dashboard/signin">Sign in</Link> : null}
            {state.kind === "step_up_required" ? <Link className={linkClass} href="/dashboard/platform/security">Verify MFA</Link> : null}
            {state.kind === "unassigned" && state.canSetUp ? <Link className={linkClass} href="/dashboard/platform/onboarding">Set up operator</Link> : null}
            {state.kind === "service_unavailable" ? <Link className={linkClass} href="/dashboard/platform">Try again</Link> : null}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ExternalGateNotice() {
  return (
    <aside className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div><p className="font-medium">Not yet approved for real-money operation</p><p className="mt-1 text-xs opacity-80">A gaming licence, contracted providers, approved jurisdiction policy and independent certification are required before going live.</p></div>
    </aside>
  );
}
