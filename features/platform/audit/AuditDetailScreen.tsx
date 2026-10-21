import { notFound } from "next/navigation";
import { OperatorShell, TenantRequired } from "../components/OperatorShell";
import { DetailGrid, WorkflowNote } from "../components/WorkflowUI";
import { dateTime } from "../lib/format";
import { getOperatorContext } from "../lib/operator";
import { ReadFailed } from "../components/ReadFailed";
import { getAuditEvent } from "./actions";

export async function AuditDetailScreen({ auditId }: { auditId: string }) {
  const operator = await getOperatorContext("canReadAudit");
  if (!operator) return <OperatorShell active="Audit" detail eyebrow="Audit detail" title="Audit event" description="Details of a recorded operator action."><TenantRequired /></OperatorShell>;
  if (!operator.capabilities.canReadAudit) return <OperatorShell active="Audit" detail eyebrow="Audit detail" title="Audit event" description="Details of a recorded operator action." tenantName={operator.tenantName}><WorkflowNote title="Audit access denied" tone="warning">Your role does not include audit-read capability. No event data was queried.</WorkflowNote></OperatorShell>;
  const result = await getAuditEvent(auditId);
  if (!result.success) return <OperatorShell active="Audit" detail eyebrow="Audit detail" title="Audit event" description="Details of a recorded operator action." tenantName={operator.tenantName}><ReadFailed subject="this audit event" /></OperatorShell>;
  const { event, previous, next } = result.data;
  if (!event) notFound();
  return <OperatorShell active="Audit" detail eyebrow="Audit detail" title={event.action || "Audit event"} description="Who did what, when, why and to which record." tenantName={operator.tenantName}>
    <DetailGrid items={[{ label: "Audit ID", value: event.id }, { label: "Recorded", value: dateTime(event.createdAt) }, { label: "Actor", value: event.actorId }, { label: "Action", value: event.action }, { label: "Target type", value: event.targetType }, { label: "Target ID", value: event.targetId }, { label: "Reason", value: event.reason || "No reason recorded" }, { label: "Payload hash", value: <code className="break-all text-xs">{event.payloadHash}</code> }, { label: "Event hash", value: <code className="break-all text-xs">{event.hash}</code> }, { label: "Previous hash", value: <code className="break-all text-xs">{event.previousHash || "Genesis"}</code> }, { label: "Previous record found", value: event.previousHash ? (previous ? "Yes" : "No") : "Genesis" }, { label: "Next record found", value: next ? next.id : "Not in current chain" }]} />
    <WorkflowNote title="Evidence boundary">This detail verifies only whether adjacent records can be located by stored pointers. It does not claim database-level append-only enforcement or external anchoring.</WorkflowNote>
  </OperatorShell>;
}
