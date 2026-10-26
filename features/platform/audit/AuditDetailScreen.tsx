import Link from "next/link";
import { notFound } from "next/navigation";
import { Mono } from "../components/kit";
import { OperatorShell, TenantRequired } from "../components/OperatorShell";
import { DetailGrid, WorkflowNote } from "../components/WorkflowUI";
import { dateTime } from "../lib/format";
import { getOperatorContext } from "../lib/operator";
import { ReadFailed } from "../components/ReadFailed";
import { getAuditEvent } from "./actions";

export async function AuditDetailScreen({ auditId }: { auditId: string }) {
  const operator = await getOperatorContext("canReadAudit");
  if (!operator) return <OperatorShell active="Audit" detail eyebrow="Audit detail" title="Audit event"><TenantRequired /></OperatorShell>;
  if (!operator.capabilities.canReadAudit) return <OperatorShell active="Audit" detail eyebrow="Audit detail" title="Audit event" tenantName={operator.tenantName}><WorkflowNote title="Audit access denied" tone="warning">No audit-read capability.</WorkflowNote></OperatorShell>;
  const result = await getAuditEvent(auditId);
  if (!result.success) return <OperatorShell active="Audit" detail eyebrow="Audit detail" title="Audit event" tenantName={operator.tenantName}><ReadFailed subject="this audit event" /></OperatorShell>;
  const { event, previous, next } = result.data;
  if (!event) notFound();
  const previousMissing = Boolean(event.previousHash) && !previous;
  const hash = (value: string | null | undefined, fallback: string) => <code className="break-all tabular-nums text-xs">{value || fallback}</code>;
  return <OperatorShell active="Audit" detail eyebrow="Audit detail" title={event.action || "Audit event"} tone={previousMissing ? "alert" : "ok"} meta={`${dateTime(event.createdAt)} · ${previousMissing ? "predecessor missing" : event.previousHash ? "predecessor linked" : "genesis"}`} tenantName={operator.tenantName}>
    {previousMissing ? <WorkflowNote title="Chain gap found" tone="warning">Previous hash not found.</WorkflowNote> : null}
    <DetailGrid items={[
      { label: "Previous record", value: event.previousHash ? (previous ? <Link href={`/dashboard/platform/audit/${previous.id}`} className="break-all tabular-nums text-xs underline-offset-4 hover:underline">{previous.id}</Link> : "Not found") : "Genesis" },
      { label: "Next record", value: next ? <Link href={`/dashboard/platform/audit/${next.id}`} className="break-all tabular-nums text-xs underline-offset-4 hover:underline">{next.id}</Link> : "Not in current chain" },
      { label: "Recorded", value: <Mono>{dateTime(event.createdAt)}</Mono> },
      { label: "Actor", value: <Mono className="break-all">{event.actorId}</Mono> },
      { label: "Action", value: event.action },
      { label: "Reason", value: event.reason || "No reason recorded" },
      { label: "Target type", value: event.targetType },
      { label: "Target ID", value: <Mono className="break-all">{event.targetId}</Mono> },
      { label: "Audit ID", value: <Mono className="break-all">{event.id}</Mono> },
      { label: "Event hash", value: hash(event.hash, "—") },
      { label: "Previous hash", value: hash(event.previousHash, "Genesis") },
      { label: "Payload hash", value: hash(event.payloadHash, "—") },
    ]} />
  </OperatorShell>;
}
