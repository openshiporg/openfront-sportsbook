import { keystoneClient } from "@/features/dashboard/lib/keystoneClient";
import { keystoneContext } from "@/features/keystone/context";
import { enterTenantScope } from "@/features/keystone/tenant-scope";
import { setDisplayContext } from "./format";

export type OperatorCapabilities = {
  canManageOnboarding: boolean;
  canManageSportsbook: boolean;
  canTrade: boolean;
  canManageRisk: boolean;
  canManageCompliance: boolean;
  canManageFinance: boolean;
  canManageIntegrations: boolean;
  canApproveSensitiveActions: boolean;
  canManageRoles: boolean;
  canManagePeople: boolean;
  canReadAudit: boolean;
};

export type OperatorContext = {
  userId: string;
  tenantId: string;
  tenantName: string;
  capabilities: OperatorCapabilities;
};

const capabilityKeys: (keyof OperatorCapabilities)[] = [
  "canManageOnboarding",
  "canManageSportsbook",
  "canTrade",
  "canManageRisk",
  "canManageCompliance",
  "canManageFinance",
  "canManageIntegrations",
  "canApproveSensitiveActions",
  "canManageRoles",
  "canManagePeople",
  "canReadAudit",
];

export type OperatorSession = {
  operatorSessionAssured: boolean;
  authenticatedItem: {
    id: string;
    email: string;
    name: string;
    tenant: { id: string; name: string } | null;
    role: (Partial<OperatorCapabilities> & { canAccessDashboard?: boolean }) | null;
  } | null;
};

/**
 * The signed-in operator's tenant, role capabilities and MFA assurance. The shared
 * core's getAuthenticatedUser selects only family fields, so platform screens read
 * the sportsbook session here; an assured session also enters the request's tenant
 * scope for the tenant-scoped Prisma client (features/keystone/tenant-scope.ts).
 */
export async function getOperatorSession() {
  const response = await keystoneClient<OperatorSession>(`
    query OperatorSession {
      operatorSessionAssured
      authenticatedItem {
        ... on User {
          id
          email
          name
          tenant { id name }
          role {
            canAccessDashboard
            canManageOnboarding
            canManageSportsbook
            canManageRoles
            canManagePeople
            canApproveSensitiveActions
            canTrade
            canManageRisk
            canManageCompliance
            canManageFinance
            canManageIntegrations
            canReadAudit
          }
        }
      }
    }
  `);
  if (response.success && response.data.operatorSessionAssured && response.data.authenticatedItem?.tenant?.id) {
    enterTenantScope(response.data.authenticatedItem.tenant.id);
  }
  return response;
}

export async function getOperatorContext(requiredCapability?:keyof OperatorCapabilities, allowPreAssurance = false): Promise<OperatorContext | null> {
  const response = await getOperatorSession();
  // A failed identity query denies data; TenantRequired renders the typed retry state instead of a raw error page.
  if (!response.success) return null;
  const item = response.data.authenticatedItem;
  if (!item?.id || !item.tenant?.id || (!allowPreAssurance && !response.data.operatorSessionAssured)) return null;
  const role: Partial<OperatorCapabilities> = item.role ?? {};
  const capabilities = Object.fromEntries(
    capabilityKeys.map((key) => [key, Boolean(role[key])]),
  ) as OperatorCapabilities;
  if(requiredCapability&&!capabilities[requiredCapability])return null
  await loadDisplayContext(item.tenant.id);
  return {
    userId: item.id,
    tenantId: item.tenant.id,
    tenantName: item.tenant.name,
    capabilities,
  };
}

export const platformPrisma = keystoneContext.prisma as any;

export type OperatorAccessState =
  | { kind: "signed_out" }
  | { kind: "step_up_required" }
  | { kind: "unassigned"; canSetUp: boolean }
  | { kind: "forbidden"; tenantName: string }
  | { kind: "service_unavailable" }
  | { kind: "allowed" };

/**
 * Why a platform workflow is unavailable, so each condition reaches its own next
 * action (sign in, MFA step-up, setup, access denied, retry) instead of one
 * generic setup link. Never returns tenant data.
 */
export async function getOperatorAccessState(): Promise<OperatorAccessState> {
  const response = await getOperatorSession();
  if (!response.success) return { kind: "service_unavailable" };
  const item = response.data.authenticatedItem;
  if (!item?.id) return { kind: "signed_out" };
  if (!response.data.operatorSessionAssured) return { kind: "step_up_required" };
  if (!item.tenant?.id) return { kind: "unassigned", canSetUp: Boolean(item.role?.canManageOnboarding) };
  return { kind: "forbidden", tenantName: item.tenant.name };
}

/** Persisted currency exponents and the tenant's configured locale/timezone for platform formatters. */
async function loadDisplayContext(tenantId: string) {
  const [tenant, locale, currencies] = await Promise.all([
    platformPrisma.tenant.findUnique({ where: { id: tenantId }, select: { defaultTimezone: true } }),
    platformPrisma.brandLocale.findFirst({ where: { tenantId, status: "ACTIVE" }, orderBy: [{ default: "desc" }, { createdAt: "asc" }], select: { locale: true, timezone: true } }),
    platformPrisma.currencyDefinition.findMany({ select: { code: true, exponent: true } }),
  ]);
  setDisplayContext({ locale: locale?.locale, timeZone: tenant?.defaultTimezone || locale?.timezone, currencies });
}
