// One capability registry for the role editor, approval review and role summaries.
// `definable` matches the keys the requestRoleDefinition command accepts.
export const roleCapabilities = [
  { key: "canAccessDashboard", label: "Dashboard access", definable: true },
  { key: "canManageOnboarding", label: "Onboarding", definable: true },
  { key: "canManageSportsbook", label: "Sportsbook settings", definable: true },
  { key: "canTrade", label: "Trading", definable: true },
  { key: "canManageRisk", label: "Risk", definable: true },
  { key: "canManageCompliance", label: "Compliance", definable: true },
  { key: "canManageFinance", label: "Finance", definable: true },
  { key: "canManageIntegrations", label: "Integrations", definable: true },
  { key: "canApproveSensitiveActions", label: "Approve sensitive actions", definable: true },
  { key: "canReadAudit", label: "Audit log", definable: true },
  { key: "canManageRoles", label: "Manage roles", definable: true },
  { key: "canManagePeople", label: "Manage people", definable: true },
  { key: "canSeeOtherPeople", label: "View people", definable: false },
  { key: "canEditOtherPeople", label: "Edit people", definable: false },
] as const;

export const definableRoleCapabilities = roleCapabilities.filter((capability) => capability.definable);

/** Every granted capability by label; "No permissions" when nothing is granted. */
export function capabilitySummary(role: Record<string, unknown> | null | undefined): string {
  if (!role) return "No role";
  const granted = roleCapabilities.filter((capability) => role[capability.key] === true).map((capability) => capability.label);
  return granted.length ? granted.join(", ") : "No permissions";
}
