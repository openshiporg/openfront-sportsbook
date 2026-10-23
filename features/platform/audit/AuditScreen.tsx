import { OperatorShell, TenantRequired } from "../components/OperatorShell";
import { ReadFailed } from "../components/ReadFailed";
import { WorkflowNote } from "../components/WorkflowUI";
import { dateTime, shortId } from "../lib/format";
import { getOperatorContext } from "../lib/operator";
import { pageFrom, PLATFORM_PAGE_SIZE, type PlatformSearchParams } from "../lib/paging";
import { getAuditEvents } from "./actions";
import { AuditPageClient } from "./screens/AuditPageClient";

/** Server screen: authorizes audit read, loads one page of the trail through GraphQL and checks its hash links. */
export async function AuditScreen({ searchParams }: { searchParams?: PlatformSearchParams } = {}) {
  const page = pageFrom((await searchParams) ?? {});
  const operator = await getOperatorContext("canReadAudit");
  if (!operator) return <OperatorShell active="Audit" eyebrow="Audit evidence" title="Audit trail"><TenantRequired /></OperatorShell>;
  if (!operator.capabilities.canReadAudit) return <OperatorShell active="Audit" eyebrow="Audit evidence" title="Audit trail" tenantName={operator.tenantName}><WorkflowNote title="Audit access denied" tone="warning">No audit-read capability.</WorkflowNote></OperatorShell>;
  const result = await getAuditEvents({ page, pageSize: PLATFORM_PAGE_SIZE });
  if (!result.success) return <OperatorShell active="Audit" eyebrow="Audit evidence" title="Audit trail" tenantName={operator.tenantName}><ReadFailed subject="audit events" /></OperatorShell>;
  const { events, total, operatorEvents, workerEvents } = result.data;
  // Follow each record's explicit previousHash link instead of assuming timestamp order is chain order
  // (several records can share one timestamp). Links leaving the loaded window were looked up before
  // being counted as missing; two records claiming the same predecessor are a fork.
  const loadedHashes = new Set(events.map((event) => event.hash));
  const resolvedOutside = new Set(result.data.resolvedOutside);
  const brokenPointers = events.filter((event) => event.previousHash && !loadedHashes.has(event.previousHash) && !resolvedOutside.has(event.previousHash)).length;
  const successors = new Map<string, number>();
  for (const event of events) successors.set(event.previousHash || "", (successors.get(event.previousHash || "") ?? 0) + 1);
  const forks = [...successors.values()].filter((count) => count > 1).length;
  const chainIssues = brokenPointers + forks;
  return <OperatorShell active="Audit" eyebrow="Audit evidence" title="Audit trail" tone={chainIssues ? "alert" : "ok"} meta={`${chainIssues ? `${chainIssues} chain issues` : "Chain intact"} · ${total} events · page ${page}`} tenantName={operator.tenantName}>
    <AuditPageClient data={{ rows: events.map((event) => ({ id: event.id, action: event.action || "—", target: `${event.targetType || "—"} · ${shortId(event.targetId || "")}`, actor: `${shortId(event.actorId || "")} · ${event.reason || "No reason"}`, recorded: dateTime(event.createdAt) })), page, pageSize: PLATFORM_PAGE_SIZE, total, operatorEvents, workerEvents, brokenPointers, forks }} />
  </OperatorShell>;
}
