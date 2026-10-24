import type { ReactNode } from "react";
import { PageBreadcrumbs } from "@/features/dashboard/components/PageBreadcrumbs";
import { platformNavItems, type PlatformNavItem } from "../lib/navigation";
import { getOperatorAccessState, type OperatorAccessState } from "../lib/operator";
import { PillLink, StatusDot, Track, type Tone } from "./kit";

// Screen keys -> platform registry routes. Labels, descriptions and breadcrumb
// hierarchy all come from the single registry in ../lib/navigation.ts, which the
// shared sidebar also renders.
const screenRoutes = {
  Overview: "/platform",
  Catalog: "/platform/catalog",
  CatalogReference: "/platform/catalog/reference",
  Trading: "/platform/trading",
  Wagers: "/platform/wagers",
  Risk: "/platform/risk",
  Results: "/platform/results",
  Grading: "/platform/grading",
  Settlement: "/platform/settlements",
  Customers: "/platform/customers",
  Compliance: "/platform/compliance",
  RG: "/platform/responsible-gaming",
  Closures: "/platform/closures",
  Support: "/platform/support",
  Notifications: "/platform/notifications",
  Finance: "/platform/finance",
  Reconciliation: "/platform/finance/reconciliation",
  Tax: "/platform/finance/tax",
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
  tone,
  meta,
  tenantName,
  detail = false,
  actions,
  children,
}: {
  active: PlatformScreenKey;
  /** Retained for existing callers; the canonical page header has no eyebrow. */
  eyebrow?: string;
  title: string;
  /** Status dot on the title line. */
  tone?: Tone;
  /** Short state line under the title: counts, freshness, scope. Never an explanation. */
  meta?: ReactNode;
  tenantName?: string;
  /** Record pages add the workflow list as a breadcrumb link before the record title. */
  detail?: boolean;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex min-w-0 flex-col">
      <PageBreadcrumbs items={breadcrumbsFor(active, title, detail)} actions={actions} />
      <div className="flex flex-wrap items-end justify-between gap-3 px-4 pt-4 md:px-6 md:pt-6">
        <div className="min-w-0 max-w-3xl">
          <h1 id="platform-page-title" tabIndex={-1} className="break-words text-2xl font-semibold tracking-tight text-gray-900 outline-none dark:text-gray-50">{tone ? <StatusDot tone={tone} /> : null}{title}</h1>
          {meta ? <p className="mt-1 font-mono text-xs tabular-nums text-muted-foreground">{meta}</p> : null}
        </div>
        {tenantName ? (
          <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-black/5 dark:ring-white/5">
            <span className="sr-only">Operator: </span>
            <StatusDot tone="ok" className="mr-1.5 size-1.5 align-middle" />
            {tenantName}
          </span>
        ) : null}
      </div>
      <div className="min-w-0 space-y-6 px-4 py-4 md:px-6 md:py-6">{children}</div>
    </section>
  );
}

const accessCopy: Record<OperatorAccessState["kind"], { title: string; body: string }> = {
  signed_out: { title: "Signed out", body: "Your session has ended." },
  step_up_required: { title: "MFA verification required", body: "Verify MFA to show tenant data." },
  unassigned: { title: "No operator assigned", body: "Your account isn't assigned to an operator yet." },
  forbidden: { title: "No access", body: "Your role doesn't include this workflow." },
  service_unavailable: { title: "Access couldn't be checked", body: "No data was shown." },
  allowed: { title: "No access", body: "Your role doesn't include this workflow." },
};

/** Typed denial: each access condition gets its own next action and no unrelated setup loop. */
export async function TenantRequired() {
  const state = await getOperatorAccessState();
  const copy = accessCopy[state.kind];
  const body = state.kind === "unassigned"
    ? state.canSetUp ? "Complete operator setup to create your tenant." : "Ask a tenant administrator to admit you to their operator."
    : copy.body;
  return (
    <section role="status" className="rounded-xl bg-amber-50 px-4 py-4 text-amber-950 ring-1 ring-amber-200 dark:bg-amber-950/30 dark:text-amber-100 dark:ring-amber-900/50">
      <h2 className="font-semibold"><StatusDot tone="wait" />{copy.title}</h2>
      <p className="mt-0.5 pl-4 text-sm opacity-80">{body}</p>
      {state.kind === "signed_out" || state.kind === "step_up_required" || (state.kind === "unassigned" && state.canSetUp) || state.kind === "service_unavailable" ? (
        <div className="mt-3 pl-4">
          <Track>
            {state.kind === "signed_out" ? <PillLink size="sm" href="/dashboard/signin">Sign in</PillLink> : null}
            {state.kind === "step_up_required" ? <PillLink size="sm" href="/dashboard/platform/security">Verify MFA</PillLink> : null}
            {state.kind === "unassigned" && state.canSetUp ? <PillLink size="sm" href="/dashboard/platform/onboarding">Set up operator</PillLink> : null}
            {state.kind === "service_unavailable" ? <PillLink size="sm" href="/dashboard/platform">Try again</PillLink> : null}
          </Track>
        </div>
      ) : null}
    </section>
  );
}

export function ExternalGateNotice() {
  return (
    <aside role="status" className="rounded-xl bg-muted/60 px-4 py-3 text-sm">
      <p className="font-medium"><StatusDot tone="wait" />Not approved for real-money operation</p>
      <p className="mt-0.5 pl-4 text-xs text-muted-foreground">Licence, contracted providers, jurisdiction policy and certification required</p>
    </aside>
  );
}
