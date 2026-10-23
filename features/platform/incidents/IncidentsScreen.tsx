import { MutationForm } from "../components/MutationForm";
import { OperatorShell, TenantRequired } from "../components/OperatorShell";
import { MetricGrid, RecordList, StatusBadge, WorkflowNote } from "../components/WorkflowUI";
import { dateTime, shortId } from "../lib/format";
import { getOperatorContext, platformPrisma as prisma } from "../lib/operator";
import { Mono, PillLink, StatusDot, Track, pillClass } from "../components/kit";
import { allowedParam, hrefWith, pageFrom, PLATFORM_PAGE_SIZE, type PlatformSearchParams } from "../lib/paging";

const incidentStatuses = ["OPEN", "MITIGATING", "RESOLVED"] as const;
const basePath = "/dashboard/platform/incidents";

const createMutation = `mutation Incident($severity:String!,$title:String!,$evidence:String!){openOperationalIncident(severity:$severity,title:$title,evidence:$evidence)}`;
const stateMutation = `mutation IncidentState($incidentId:ID!,$status:String!,$reason:String!){setIncidentStatus(incidentId:$incidentId,status:$status,reason:$reason)}`;

export async function IncidentsScreen({ searchParams }: { searchParams?: PlatformSearchParams } = {}) {
  const params = (await searchParams) ?? {};
  const page = pageFrom(params);
  const status = allowedParam(params, "status", incidentStatuses);
  const operator = await getOperatorContext("canManageIntegrations");
  if (!operator) return <OperatorShell active="Incidents" eyebrow="Operational response" title="Incidents"><TenantRequired /></OperatorShell>;
  // The register is paged; active incidents are loaded on their own (oldest first) so none falls out of a recent window.
  const where = { tenantId: operator.tenantId, ...(status ? { status } : {}) };
  const activeWhere = { tenantId: operator.tenantId, status: { in: ["OPEN", "MITIGATING"] } };
  const [incidents, total, open, activeTotal, openCount, mitigatingCount, resolvedCount, severeCount] = await Promise.all([
    prisma.incident.findMany({ where, orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: PLATFORM_PAGE_SIZE, skip: (page - 1) * PLATFORM_PAGE_SIZE }),
    prisma.incident.count({ where }),
    prisma.incident.findMany({ where: activeWhere, orderBy: [{ createdAt: "asc" }, { id: "asc" }], take: PLATFORM_PAGE_SIZE }),
    prisma.incident.count({ where: activeWhere }),
    prisma.incident.count({ where: { tenantId: operator.tenantId, status: "OPEN" } }),
    prisma.incident.count({ where: { tenantId: operator.tenantId, status: "MITIGATING" } }),
    prisma.incident.count({ where: { tenantId: operator.tenantId, status: "RESOLVED" } }),
    prisma.incident.count({ where: { ...activeWhere, severity: { in: ["SEV1", "SEV2"] } } }),
  ]);
  const canManage = operator.capabilities.canManageIntegrations;
  // Display order only: most severe active incident first, oldest first within a severity.
  const severityRank = (value: string | null | undefined) => { const match = /^SEV(\d)$/.exec(String(value ?? "")); return match ? Number(match[1]) : 9; };
  const active = open.map((incident: any, index: number) => ({ incident, index })).sort((a: { incident: any; index: number }, b: { incident: any; index: number }) => severityRank(a.incident.severity) - severityRank(b.incident.severity) || a.index - b.index).map(({ incident }: { incident: any }) => incident);
  const pageTone = severeCount ? "alert" : activeTotal ? "wait" : "ok";
  return <OperatorShell
    active="Incidents"
    eyebrow="Operational response"
    title="Incidents"
    tone={pageTone}
    meta={`${severeCount} SEV1/SEV2 active · ${openCount} open · ${mitigatingCount} mitigating`}
    tenantName={operator.tenantName}
    actions={<Track><PillLink size="sm" variant="primary" href="#open-incident">Open incident</PillLink></Track>}
  >
    <MetricGrid items={[
      { label: "SEV1/SEV2 active", value: severeCount, tone: severeCount ? "alert" : "ok" },
      { label: "Open", value: openCount, tone: openCount ? "wait" : undefined },
      { label: "Mitigating", value: mitigatingCount, tone: mitigatingCount ? "wait" : undefined },
      { label: "Resolved", value: resolvedCount },
    ]} />
    <section className="space-y-3">
      <h2 className="text-sm font-semibold">{activeTotal ? <StatusDot tone={severeCount ? "alert" : "wait"} /> : null}Active<span className="ml-2 font-mono text-xs font-normal tabular-nums text-muted-foreground">{activeTotal > open.length ? `oldest ${open.length} of ${activeTotal}` : open.length}</span></h2>
      {active.length === 0 ? <WorkflowNote title="No active incident" /> : <div className="grid gap-4 lg:grid-cols-2">{active.map((incident: any) => <MutationForm key={incident.id} compact title={`${incident.severity} · ${incident.title}`} description={`${incident.status} · opened ${dateTime(incident.createdAt)}`} mutation={stateMutation} fields={[{ name: "incidentId", label: "Incident", type: "hidden", defaultValue: incident.id }, { name: "status", label: "New state", type: "select", defaultValue: incident.status === "OPEN" ? "MITIGATING" : "RESOLVED", options: [{ label: "Open", value: "OPEN" }, { label: "Mitigating", value: "MITIGATING" }, { label: "Resolved", value: "RESOLVED" }] }, { name: "reason", label: "State-change evidence", placeholder: "Mitigation applied" }]} submitLabel="Update incident" successMessage="Incident state updated." disabledReason={canManage ? undefined : "Your role does not include incident management capability."} />)}</div>}
    </section>
    <RecordList title="Register" columns={["Incident", "Severity", "Commander · opened", "State"]} rows={incidents.map((incident: any) => ({ id: incident.id, status: incident.status === "RESOLVED" ? "RESOLVED" : incident.severity, cells: [<span key="title"><span className="break-words">{incident.title}</span><span className="block font-mono text-xs font-normal text-muted-foreground">{shortId(incident.id)}</span></span>, <StatusBadge key="severity" value={incident.severity} />, <Mono key="commander">{`${shortId(incident.commanderId || "Unassigned")} · ${dateTime(incident.createdAt)}`}</Mono>, <StatusBadge key="state" value={incident.status} />] }))} emptyTitle={status ? "No matching incidents" : "No incidents"} filtered={Boolean(status)} emptyAction={<Track>{status ? <PillLink size="sm" href={basePath}>Show all incidents</PillLink> : <a href="#open-incident" className={pillClass("raised", "sm")}>Open an incident</a>}</Track>} action={<Track label="Filter by state">{[undefined, ...incidentStatuses].map((value) => <PillLink key={value ?? "all"} size="sm" variant="flat" href={hrefWith(basePath, { status: value })} current={value === status}>{value ? value.toLowerCase() : "all"}</PillLink>)}</Track>} pagination={{ page, pageSize: PLATFORM_PAGE_SIZE, total, hrefForPage: (next) => hrefWith(basePath, { status, page: next }) }} />
    <div id="open-incident" className="scroll-mt-20">
      <MutationForm title="Open incident" mutation={createMutation} fields={[{ name: "severity", label: "Severity", type: "select", options: ["SEV1", "SEV2", "SEV3", "SEV4"].map((value) => ({ label: value, value })) }, { name: "title", label: "Incident title", placeholder: "Provider sequence gap" }, { name: "evidenceObserved", jsonPath: "evidence.observed", label: "What was observed", type: "textarea", placeholder: "Symptoms, alerts, timestamps" }, { name: "evidenceImpact", jsonPath: "evidence.impact", label: "Customer / business impact", type: "textarea", placeholder: "Who or what is affected" }, { name: "evidenceRunbook", jsonPath: "evidence.runbook", label: "Runbook or first action", required: false, placeholder: "Runbook reference" }]} submitLabel="Open incident" successMessage="Incident opened." disabledReason={canManage ? undefined : "Your role does not include incident management capability."} />
    </div>
  </OperatorShell>;
}
