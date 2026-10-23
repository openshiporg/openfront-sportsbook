import { OnboardingForm } from "./OnboardingForm";
import { ExternalGateNotice, OperatorShell } from "../components/OperatorShell";
import { PillLink, StatusDot, Track } from "../components/kit";
import { DetailGrid, MetricGrid, RecordList, StatusBadge, statusDotTone, WorkflowNote } from "../components/WorkflowUI";
import { dateTime } from "../lib/format";
import { getOperatorSession, platformPrisma as prisma } from "../lib/operator";

export async function OnboardingScreen() {
  const auth = await getOperatorSession();
  if (!auth.success) throw new Error(auth.error);
  const item = auth.data?.authenticatedItem;
  if(!item?.role?.canManageOnboarding)return <OperatorShell active="Onboarding" eyebrow="Operator launch" title="Onboarding unavailable" tone="off"><WorkflowNote title="No onboarding capability" tone="warning" /></OperatorShell>
  if(!auth.data?.operatorSessionAssured)return <OperatorShell active="Onboarding" eyebrow="Operator launch" title="Complete MFA enrollment" tone="wait"><WorkflowNote title="Privileged session required" tone="warning"><Track><PillLink size="sm" href="/dashboard/platform/security">Operator security</PillLink></Track></WorkflowNote></OperatorShell>
  const tenantId = item?.tenant?.id;
  if (!tenantId) return <OperatorShell active="Onboarding" eyebrow="Operator launch" title="Configure operator tenant" tone="wait" meta="No tenant yet"><WorkflowNote title="No tenant yet" tone="warning" /><OnboardingForm /><ExternalGateNotice /></OperatorShell>;
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
  const externalStages = ["LICENSING", "CERTIFICATION"];
  const stageRow = (stage: string) => progress.find((row: any) => row.stage === stage) as any;
  const stageStatus = (stage: string) => String(stageRow(stage)?.status ?? "NOT_STARTED");
  const stageLabel = (stage: string) => stage.charAt(0) + stage.slice(1).toLowerCase();
  const nextStage = incompleteStages[0];
  const doneCount = localStages.length - incompleteStages.length;
  const stageTone = (stage: string) => stageStatus(stage) === "COMPLETE" ? "ok" as const : stageRow(stage) ? statusDotTone(stageStatus(stage)) : "off" as const;
  return <OperatorShell active="Onboarding" eyebrow="Operator launch" title="Operator configuration" tone={setupIncomplete ? "wait" : "ok"} meta={`${doneCount}/${localStages.length} stages complete${nextStage ? ` · next ${stageLabel(nextStage)}` : ""}`} tenantName={tenant?.name || item.tenant?.name}>
    <section aria-labelledby="setup-stages" className="min-w-0 overflow-hidden rounded-xl border bg-card text-card-foreground">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
        <h2 id="setup-stages" className="text-sm font-semibold"><StatusDot tone={setupIncomplete ? "wait" : "ok"} />{nextStage ? `Next: ${stageLabel(nextStage)}` : "Setup complete"}</h2>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">{doneCount}/{localStages.length}</span>
      </header>
      <ol className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-3 lg:grid-cols-6">
        {localStages.map((stage, index) => {
          const isNext = stage === nextStage;
          return <li key={stage} aria-current={isNext ? "step" : undefined} className={`min-w-0 rounded-lg px-3 py-2 ${isNext ? "bg-amber-50 ring-1 ring-amber-200 dark:bg-amber-950/30 dark:ring-amber-900/50" : "bg-muted/50"}`}>
            <p className="font-mono text-[11px] tabular-nums text-muted-foreground">{String(index + 1).padStart(2, "0")}</p>
            <p className="mt-0.5 truncate text-sm font-medium"><StatusDot tone={isNext ? "wait" : stageTone(stage)} />{stageLabel(stage)}</p>
            <p className="mt-0.5 truncate pl-4 text-xs text-muted-foreground">{stageStatus(stage).replaceAll("_", " ").toLowerCase()}</p>
          </li>;
        })}
        {externalStages.map((stage) => <li key={stage} className="min-w-0 rounded-lg px-3 py-2 border border-dashed">
          <p className="font-mono text-[11px] text-muted-foreground">ext</p>
          <p className="mt-0.5 truncate text-sm font-medium"><StatusDot tone={stageRow(stage) ? statusDotTone(stageStatus(stage)) : "off"} />{stageLabel(stage)}</p>
          <p className="mt-0.5 truncate pl-4 text-xs text-muted-foreground">{stageStatus(stage).replaceAll("_", " ").toLowerCase()}</p>
        </li>)}
      </ol>
    </section>
    {setupIncomplete ? manifest?.input ? <OnboardingForm resumeInput={manifest.input} /> : <WorkflowNote title="Setup can't be resumed" tone="warning">{incompleteStages.length ? `No setup manifest. Incomplete: ${incompleteStages.map(stageLabel).join(", ")}` : "No setup manifest."}</WorkflowNote> : null}
    <MetricGrid items={[{ label: "Brands", value: brands.length, tone: brands.length ? "ok" : "wait" }, { label: "Providers", value: providers.length, tone: providers.length ? "ok" : "wait" }, { label: "Current settings", value: settings.length }, { label: "Catalog roots", value: sports + competitions, detail: `${sports} sports · ${competitions} competitions` }]} />
    <RecordList title="Jurisdictions" columns={["Code", "Authority", "Policy / license", "State"]} rows={jurisdictions.map((item: any) => ({ id: item.id, status: item.status, cells: [<span key="code" className="font-mono">{item.jurisdiction?.code || "Unknown"}</span>, item.jurisdiction?.authority || "Unconfigured", <span key="policy" className="break-all">{`${item.policyVersion} · ${item.licenseReference}`}</span>, <StatusBadge key="state" value={item.status} />] }))} emptyTitle="No jurisdiction record" />
    <RecordList title="Stage evidence" columns={["Stage","Evidence","Completed","State"]} rows={progress.map((stage:any)=>({id:stage.id,status:stage.status,cells:[stageLabel(String(stage.stage)),<code key="hash" className="font-mono text-xs">{stage.evidenceHash.slice(0,16)}…</code>,dateTime(stage.completedAt),<StatusBadge key="state" value={stage.status}/>]}))} emptyTitle="No progress evidence" />
    <RecordList title="Provider adapters" columns={["Adapter", "Version", "Configuration", "State"]} rows={providers.map((provider: any) => ({ id: provider.id, href: `/dashboard/platform/integrations/${provider.id}`, status: provider.status, cells: [<span key="adapter" className="break-all font-mono text-sm">{provider.adapterId}</span>, <span key="version" className="font-mono text-xs">{provider.adapterVersion}</span>, <span key="config" className="break-all font-mono text-xs">{provider.configReference}</span>, <span key="state" className="flex flex-wrap gap-2"><StatusBadge value={provider.certificationStatus} /><StatusBadge value={provider.status} /></span>] }))} emptyTitle="No providers configured" />
    <section aria-labelledby="tenant-evidence" className="space-y-3"><h2 id="tenant-evidence" className="text-sm font-semibold">Tenant</h2><DetailGrid items={[{ label: "Tenant state", value: <StatusBadge value={tenant?.status} /> }, { label: "Created", value: dateTime(tenant?.createdAt) }, { label: "Limit profiles", value: profiles.map((profile: any) => `${profile.name} · ${profile.status}`).join(", ") || "None" }, { label: "Brands", value: <span className="break-all">{brands.map((brand: any) => `${brand.name} · ${brand.domain}`).join(", ") || "None"}</span> }]} /></section>
    <ExternalGateNotice />
  </OperatorShell>;
}
