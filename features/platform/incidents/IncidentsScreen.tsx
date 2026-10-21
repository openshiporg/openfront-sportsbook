import { MutationForm } from "../components/MutationForm";
import { OperatorShell, TenantRequired } from "../components/OperatorShell";
import { MetricGrid, RecordList, StatusBadge, WorkflowNote } from "../components/WorkflowUI";
import { dateTime, shortId } from "../lib/format";
import { getOperatorContext, platformPrisma as prisma } from "../lib/operator";
import Link from "next/link";
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
  if (!operator) return <OperatorShell active="Incidents" eyebrow="Operational response" title="Incidents" description="Open, mitigate and resolve incidents."><TenantRequired /></OperatorShell>;
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
  return <OperatorShell active="Incidents" eyebrow="Operational response" title="Incidents" description="Open, mitigate and resolve incidents. Every change is recorded in the audit log." tenantName={operator.tenantName}>
    <MetricGrid items={[{ label: "Open", value: openCount, detail: "Awaiting mitigation" }, { label: "Mitigating", value: mitigatingCount, detail: "Active response" }, { label: "Resolved", value: resolvedCount, detail: "All time" }, { label: "Severe active", value: severeCount, detail: "SEV1 or SEV2" }]} />
    <RecordList title="Incident register" description="A zero count means no incident record exists, not that resilience has been certified." columns={["Incident", "Severity", "Commander / opened", "State"]} rows={incidents.map((incident: any) => ({ id: incident.id, cells: [<span key="title">{incident.title}<span className="block font-mono text-xs text-muted-foreground">{shortId(incident.id)}</span></span>, <StatusBadge key="severity" value={incident.severity} />, `${shortId(incident.commanderId || "Unassigned")} · ${dateTime(incident.createdAt)}`, <StatusBadge key="state" value={incident.status} />] }))} emptyTitle={status ? "No matching incidents" : "No incident records"} emptyDescription={status ? "No incident has this state." : "Open an incident below when an observed operational condition requires coordinated response."} filtered={Boolean(status)} emptyAction={status ? <Link href={basePath} className="inline-flex rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted">Show all incidents</Link> : <a href="#open-incident" className="inline-flex rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted">Open an incident</a>} action={<nav aria-label="Filter by state" className="flex flex-wrap gap-1">{[undefined, ...incidentStatuses].map((value) => <Link key={value ?? "all"} href={hrefWith(basePath, { status: value })} aria-current={value === status ? "page" : undefined} className={`rounded-md border px-2 py-1 text-xs ${value === status ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>{value ? value.toLowerCase() : "all"}</Link>)}</nav>} pagination={{ page, pageSize: PLATFORM_PAGE_SIZE, total, hrefForPage: (next) => hrefWith(basePath, { status, page: next }) }} />
    <div id="open-incident" />
    <MutationForm title="Open incident" description="Stores structured evidence, assigns the current operator as commander, and emits an audit event." mutation={createMutation} fields={[{ name: "severity", label: "Severity", type: "select", options: ["SEV1", "SEV2", "SEV3", "SEV4"].map((value) => ({ label: value, value })) }, { name: "title", label: "Incident title", placeholder: "Provider sequence gap" }, { name: "evidenceObserved", jsonPath: "evidence.observed", label: "What was observed", type: "textarea", placeholder: "Symptoms, alerts and timestamps" }, { name: "evidenceImpact", jsonPath: "evidence.impact", label: "Customer / business impact", type: "textarea", placeholder: "Who or what is affected" }, { name: "evidenceRunbook", jsonPath: "evidence.runbook", label: "Runbook or first action", required: false, placeholder: "Runbook reference or first step taken" }]} submitLabel="Open incident" successMessage="Incident opened." disabledReason={canManage ? undefined : "Your role does not include incident management capability."} />
    <section className="space-y-4"><h2 className="font-semibold">Active response actions</h2>{activeTotal > open.length ? <p className="text-sm text-muted-foreground">Showing the oldest {open.length} of {activeTotal} active incidents; resolve these to reach the rest.</p> : null}{open.length === 0 ? <WorkflowNote title="No active incident">There is no open or mitigating incident.</WorkflowNote> : open.map((incident: any) => <MutationForm key={incident.id} compact title={`${incident.severity} · ${incident.title}`} description={`Current state ${incident.status}. State changes preserve the incident record.`} mutation={stateMutation} fields={[{ name: "incidentId", label: "Incident", type: "hidden", defaultValue: incident.id }, { name: "status", label: "New state", type: "select", defaultValue: incident.status === "OPEN" ? "MITIGATING" : "RESOLVED", options: [{ label: "Open", value: "OPEN" }, { label: "Mitigating", value: "MITIGATING" }, { label: "Resolved", value: "RESOLVED" }] }, { name: "reason", label: "State-change evidence", placeholder: "Mitigation applied and metrics observed" }]} submitLabel="Update incident" successMessage="Incident state updated." disabledReason={canManage ? undefined : "Your role does not include incident management capability."} />)}</section>
  </OperatorShell>;
}
