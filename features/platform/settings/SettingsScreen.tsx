import { MutationForm } from "../components/MutationForm";
import { OperatorShell, TenantRequired } from "../components/OperatorShell";
import { StatusDot } from "../components/kit";
import { MetricGrid, RecordList, StatusBadge } from "../components/WorkflowUI";
import { dateTime, jsonText, shortId } from "../lib/format";
import { getOperatorContext, platformPrisma as prisma } from "../lib/operator";
import { loadConfigValues } from "../configuration/effectiveConfig";
import { getStoreSettings } from "../store-settings/actions";
import { StoreSettingsPageClient } from "../store-settings/screens/StoreSettingsPageClient";

const requestMutation = `mutation RequestSetting($key:String!,$value:String!,$reason:String!){requestSettingChange(key:$key,value:$value,reason:$reason)}`;
const applyMutation = `mutation ApplySetting($approvalId:ID!,$key:String!,$value:String!){applyApprovedSetting(approvalId:$approvalId,key:$key,value:$value)}`;
const proposal = (action: string) => { const [, key = "Unknown", encoded = ""] = action.split(":"); let value = ""; try { value = Buffer.from(encoded, "base64url").toString(); } catch {} return { key, value }; };

export async function SettingsScreen() {
  const operator = await getOperatorContext("canManageSportsbook");
  if (!operator) return <OperatorShell active="Settings" eyebrow="Operator configuration" title="Settings"><TenantRequired /></OperatorShell>;
  const [settings, jurisdictions, approvals, definitions] = await Promise.all([
    loadConfigValues(prisma, operator.tenantId),
    prisma.operatorJurisdiction.findMany({ where: { tenantId: operator.tenantId }, include: { jurisdiction: true } }),
    prisma.approvalRequest.findMany({ where: { tenantId: operator.tenantId, action: { startsWith: "SETTING_CHANGE:" } }, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.configDefinition.findMany({ where: { tenantId: operator.tenantId, secret: false }, orderBy: { key: "asc" } }),
  ]);
  const current = settings.effective;
  // Only declared, tenant-scoped, non-secret definitions can be changed; the API re-validates type and scope.
  const changeable = definitions.filter((definition: any) => Array.isArray(definition.allowedScopes) && definition.allowedScopes.includes("TENANT"));
  const applicable = approvals.filter((approval: any) => approval.status === "APPROVED" && !approval.consumedAt && approval.expiresAt && new Date(approval.expiresAt) > new Date());
  const storefront = await getStoreSettings();
  const pendingCount = approvals.filter((item: any) => item.status === "PENDING").length;
  const brandReady = storefront.success && Boolean(storefront.data);
  return <OperatorShell active="Settings" eyebrow="Operator configuration" title="Settings" tone={!brandReady ? "wait" : applicable.length > 0 ? "info" : pendingCount > 0 ? "wait" : "ok"} meta={`${current.length} in force · ${pendingCount} pending · ${applicable.length} ready to apply`} tenantName={operator.tenantName}>
    <section id="storefront-branding" aria-labelledby="storefront-branding-title" className="space-y-3"><h2 id="storefront-branding-title" className="text-sm font-semibold"><StatusDot tone={brandReady ? "ok" : "wait"} />Storefront brand</h2><StoreSettingsPageClient initialData={storefront.success ? storefront.data : null} initialError={storefront.success ? null : storefront.error} /></section>
    {applicable.length > 0 ? <section aria-labelledby="ready-settings" className="space-y-3"><h2 id="ready-settings" className="text-sm font-semibold"><StatusDot tone="info" />Ready to apply<span className="ml-2 font-mono text-xs font-normal tabular-nums text-muted-foreground">{applicable.length}</span></h2><div className="grid gap-3 lg:grid-cols-2">{applicable.map((approval: any) => { const item = proposal(approval.action); return <MutationForm key={approval.id} compact title={`${item.key} · ${shortId(approval.id)}`} description={`Expires ${dateTime(approval.expiresAt)}`} mutation={applyMutation} fields={[{ name: "approvalId", label: "Approval", type: "hidden", defaultValue: approval.id }, { name: "key", label: "Key", type: "hidden", defaultValue: item.key }, { name: "value", label: "Exact approved value", type: "textarea", defaultValue: item.value }]} submitLabel="Apply approved version" successMessage="Approved setting version applied." disabledReason={operator.capabilities.canManageSportsbook ? undefined : "Your role cannot manage settings."} />; })}</div></section> : null}
    <MetricGrid items={[{ label: "In force", value: current.length }, { label: "Other versions", value: settings.scheduled.length + settings.history.length, detail: `${settings.scheduled.length} scheduled` }, { label: "Jurisdictions", value: jurisdictions.length }, { label: "Pending", value: pendingCount, tone: pendingCount > 0 ? "wait" : "ok" }]} />
    <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] xl:items-start">
      <MutationForm title="Request change" mutation={requestMutation} fields={[{ name: "key", label: "Setting", type: "select", options: changeable.map((definition: any) => ({ label: `${definition.key} · ${definition.valueType} · ${definition.description}`, value: definition.key })) }, { name: "value", label: "Value", type: "textarea", placeholder: "MONEY minor units · INTEGER · true/false · JSON" }, { name: "reason", label: "Change reason", type: "textarea", placeholder: "Policy reference" }]} submitLabel="Request dual approval" successMessage="Setting change approval requested." disabledReason={operator.capabilities.canManageSportsbook ? undefined : "Your role cannot manage settings."} />
      <RecordList title="Change requests" columns={["Approval", "Key", "Actors", "State"]} rows={approvals.map((approval: any) => ({ id: approval.id, status: approval.status, cells: [<span key="id" className="font-mono">{shortId(approval.id)}</span>, <span key="key" className="break-all font-mono text-xs">{proposal(approval.action).key}</span>, `requester ${shortId(approval.requesterId)}${approval.approverId ? ` · approver ${shortId(approval.approverId)}` : ""}`, <StatusBadge key="state" value={approval.status} />] }))} emptyTitle="No setting approvals" />
    </div>
    <RecordList title="In force" columns={["Key", "Value", "Policy", "Effective"]} rows={current.map((setting: any) => ({ id: setting.id, cells: [<span key="key" className="break-all font-mono text-xs">{setting.key}</span>, <code key="value" className="break-all font-mono text-xs whitespace-pre-wrap">{jsonText(setting.value).slice(0, 180)}</code>, `${setting.policyVersion} · ${setting.valueType}`, dateTime(setting.effectiveFrom)] }))} emptyTitle="No current settings" />
    <RecordList title="Jurisdictions" columns={["Jurisdiction", "Authority", "License reference", "State"]} rows={jurisdictions.map((item: any) => ({ id: item.id, status: item.status, cells: [item.jurisdiction?.code || shortId(item.jurisdictionId || "Unknown"), item.jurisdiction?.authority || "Unconfigured", `${item.licenseReference} · ${item.policyVersion}`, <StatusBadge key="state" value={item.status} />] }))} emptyTitle="No jurisdiction assignment" />
  </OperatorShell>;
}
