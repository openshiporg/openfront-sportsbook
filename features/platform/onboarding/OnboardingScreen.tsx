import Link from "next/link";
import { OnboardingForm } from "./OnboardingForm";
import { ExternalGateNotice, OperatorShell } from "../components/OperatorShell";
import { MetricGrid, RecordList, StatusBadge, WorkflowNote } from "../components/WorkflowUI";
import { dateTime } from "../lib/format";
import { getOperatorSession, platformPrisma as prisma } from "../lib/operator";

export async function OnboardingScreen() {
  const auth = await getOperatorSession();
  if (!auth.success) throw new Error(auth.error);
  const item = auth.data?.authenticatedItem;
  if(!item?.role?.canManageOnboarding)return <OperatorShell active="Onboarding" eyebrow="Operator launch" title="Onboarding unavailable" description="Your role doesn’t include sportsbook setup."><WorkflowNote title="Access denied">Ask a tenant administrator for the onboarding capability.</WorkflowNote></OperatorShell>
  if(!auth.data?.operatorSessionAssured)return <OperatorShell active="Onboarding" eyebrow="Operator launch" title="Complete MFA enrollment" description="Set up two-factor authentication before configuring your sportsbook."><WorkflowNote title="Privileged session required">Enroll an authenticator before continuing. <Link className="font-semibold underline" href="/dashboard/platform/security">Open operator security</Link></WorkflowNote></OperatorShell>
  const tenantId = item?.tenant?.id;
  if (!tenantId) return <OperatorShell active="Onboarding" eyebrow="Operator launch" title="Configure operator tenant" description="Set up your sportsbook, brand, jurisdiction, providers, catalog and default limits."><OnboardingForm /><WorkflowNote title="No tenant yet">Complete onboarding to unlock the other workflows.</WorkflowNote><ExternalGateNotice /></OperatorShell>;
  const [tenant, brands, jurisdictions, providers, settings, sports, competitions, profiles, progress] = await Promise.all([
    prisma.tenant.findUnique({ where: { id: tenantId } }),
    prisma.brand.findMany({ where: { tenantId } }),
    prisma.operatorJurisdiction.findMany({ where: { tenantId }, include: { jurisdiction: true } }),
    prisma.providerConnection.findMany({ where: { tenantId }, orderBy: { adapterId: "asc" } }),
    prisma.configValue.findMany({ where: { tenantId, effectiveTo: null } }),
    prisma.sport.count({ where: { tenantId } }),
    prisma.competition.count({ where: { tenantId } }),
    prisma.limitProfile.findMany({ where: { tenantId } }),
    prisma.onboardingProgress.findMany({where:{tenantId},orderBy:{stage:'asc'}}),
  ]);
  // Local stages must all be COMPLETE; LICENSING/CERTIFICATION stay BLOCKED as external gates and never count as setup work.
  const localStages = ["OPERATOR","BRAND","POLICY","PROVIDERS","CATALOG","GOVERNANCE","FINANCE","PROMOTIONS","OPERATIONS"];
  const operator = await prisma.user.findUnique({ where: { id: item.id }, select: { onboardingStatus: true } });
  const manifest = (progress.find((stage: any) => stage.stage === "OPERATOR")?.details as any)?.manifest;
  const incompleteStages = localStages.filter((stage) => progress.find((row: any) => row.stage === stage)?.status !== "COMPLETE");
  const setupIncomplete = incompleteStages.length > 0 || operator?.onboardingStatus === "in_progress";
  return <OperatorShell active="Onboarding" eyebrow="Operator launch" title="Operator configuration" description="Your sportsbook setup and what remains before going live." tenantName={tenant?.name || item.tenant?.name}>
    {setupIncomplete ? manifest?.input ? <OnboardingForm resumeInput={manifest.input} /> : <WorkflowNote title="Setup can't be resumed automatically">This tenant's setup has no recorded setup manifest, so it can't be verified or replayed safely. Ask support to review the incomplete stages{incompleteStages.length ? `: ${incompleteStages.join(", ")}` : ""}.</WorkflowNote> : null}
    <MetricGrid items={[{ label: "Brands", value: brands.length, detail: "Tenant-owned" }, { label: "Providers", value: providers.length, detail: "Configured adapters" }, { label: "Current settings", value: settings.length, detail: "Effective values" }, { label: "Catalog roots", value: sports + competitions, detail: `${sports} sports · ${competitions} competitions` }]} />
    <RecordList title="Jurisdiction readiness" description="Pending authority, license, or policy records are never promoted to launch-ready." columns={["Code", "Authority", "Policy / license", "State"]} rows={jurisdictions.map((item: any) => ({ id: item.id, cells: [item.jurisdiction?.code || "Unknown", item.jurisdiction?.authority || "Unconfigured", `${item.policyVersion} · ${item.licenseReference}`, <StatusBadge key="state" value={item.status} />] }))} emptyTitle="No jurisdiction record" emptyDescription="Add a jurisdiction before going live." />
    <RecordList title="Onboarding progress" description={setupIncomplete ? "Completed steps are saved. Use Resume setup above to finish the remaining stages." : "Every local setup stage is complete. Licensing and certification remain external gates."} columns={["Stage","Evidence","Completed","State"]} rows={progress.map((stage:any)=>({id:stage.id,cells:[stage.stage,<code key="hash" className="text-xs">{stage.evidenceHash.slice(0,16)}…</code>,dateTime(stage.completedAt),<StatusBadge key="state" value={stage.status}/>]}))} emptyTitle="No progress evidence" emptyDescription="Complete onboarding to see your setup here." />
    <RecordList title="Provider adapters" description="Current certification status for each provider." columns={["Adapter", "Version", "Configuration", "State"]} rows={providers.map((provider: any) => ({ id: provider.id, href: `/dashboard/platform/integrations/${provider.id}`, cells: [provider.adapterId, provider.adapterVersion, provider.configReference, <span key="state" className="flex flex-wrap gap-2"><StatusBadge value={provider.certificationStatus} /><StatusBadge value={provider.status} /></span>] }))} emptyTitle="No providers configured" emptyDescription="No providers are connected." />
    <section className="rounded-xl border bg-card p-5 shadow-sm"><h2 className="font-semibold">Configuration evidence</h2><dl className="mt-4 grid gap-4 sm:grid-cols-2"><div><dt className="text-xs text-muted-foreground">Tenant state</dt><dd className="mt-1"><StatusBadge value={tenant?.status} /></dd></div><div><dt className="text-xs text-muted-foreground">Created</dt><dd className="mt-1 text-sm">{dateTime(tenant?.createdAt)}</dd></div><div><dt className="text-xs text-muted-foreground">Limit profiles</dt><dd className="mt-1 text-sm">{profiles.map((profile: any) => `${profile.name} · ${profile.status}`).join(", ") || "None"}</dd></div><div><dt className="text-xs text-muted-foreground">Brands</dt><dd className="mt-1 text-sm">{brands.map((brand: any) => `${brand.name} · ${brand.domain}`).join(", ") || "None"}</dd></div></dl></section>
    <ExternalGateNotice />
  </OperatorShell>;
}
