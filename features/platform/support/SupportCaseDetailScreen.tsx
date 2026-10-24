import { notFound } from "next/navigation";
import Link from "next/link";
import { MutationForm } from "../components/MutationForm";
import { OperatorShell, TenantRequired } from "../components/OperatorShell";
import { Mono, PillLink, StatusDot, Track } from "../components/kit";
import { DetailGrid, StatusBadge, statusDotTone, WorkflowNote } from "../components/WorkflowUI";
import { dateTime, shortId } from "../lib/format";
import { getOperatorContext, platformPrisma as prisma } from "../lib/operator";

const updateMutation = `mutation($caseId:ID!,$status:String!,$customerMessage:String!,$reason:String!){setSupportCaseStatus(caseId:$caseId,status:$status,customerMessage:$customerMessage,reason:$reason)}`;
const PAGE = 100;
const DISPUTE_EVENTS = 50;

/** One short line from a dispute event's details: top-level scalar values only, truncated. */
function detailSummary(details: unknown) {
  if (details === null || details === undefined) return "";
  if (typeof details !== "object") return String(details).slice(0, 140);
  const parts = Object.entries(details as Record<string, unknown>)
    .filter(([, value]) => ["string", "number", "boolean"].includes(typeof value))
    .map(([key, value]) => `${key.replaceAll("_", " ")}: ${String(value)}`);
  const text = parts.join(" · ");
  return text.length > 140 ? `${text.slice(0, 139)}…` : text;
}

/**
 * One support case with its ordered conversation, so the operator replies from the real
 * history. RESTRICTED entries (AML/sensitive compartments) are listed but never rendered.
 */
export async function SupportCaseDetailScreen({ caseId, page = 1 }: { caseId: string; page?: number }) {
  const operator = await getOperatorContext("canManageCompliance");
  if (!operator) return <OperatorShell active="Support" detail title="Support case"><TenantRequired /></OperatorShell>;
  const tenantId = operator.tenantId;
  const item = await prisma.supportCase.findFirst({ where: { id: caseId, tenantId }, include: { player: true, dispute: true } });
  if (!item) notFound();
  const current = Math.max(1, Math.floor(page) || 1);
  const [events, total] = await Promise.all([
    prisma.supportCaseEvent.findMany({ where: { tenantId, supportCaseId: item.id }, orderBy: [{ createdAt: "asc" }, { id: "asc" }], skip: (current - 1) * PAGE, take: PAGE }),
    prisma.supportCaseEvent.count({ where: { tenantId, supportCaseId: item.id } }),
  ]);
  const staffIds = [...new Set(events.filter((event: any) => event.actorType === "STAFF").map((event: any) => event.actorId).concat(item.ownerId ? [item.ownerId] : []))];
  const staff = staffIds.length ? await prisma.user.findMany({ where: { tenantId, id: { in: staffIds } }, select: { id: true, name: true } }) : [];
  const staffName = (id: string) => staff.find((user: any) => user.id === id)?.name ?? shortId(id);
  // Dispute timeline: newest first, bounded; actor names resolved separately from the conversation staff lookup.
  const [disputeEvents, disputeEventTotal] = item.dispute ? await Promise.all([
    prisma.disputeEvent.findMany({ where: { tenantId, disputeId: item.dispute.id }, orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: DISPUTE_EVENTS, select: { id: true, type: true, actorId: true, details: true, createdAt: true } }),
    prisma.disputeEvent.count({ where: { tenantId, disputeId: item.dispute.id } }),
  ]) : [[], 0];
  const disputeActorIds = [...new Set(disputeEvents.map((event: any) => event.actorId).filter(Boolean))];
  const disputeActors = disputeActorIds.length ? await prisma.user.findMany({ where: { tenantId, id: { in: disputeActorIds } }, select: { id: true, name: true } }) : [];
  const disputeActor = (id: string) => (id ? disputeActors.find((user: any) => user.id === id)?.name : undefined);
  const closed = ["RESOLVED", "CLOSED"].includes(item.status);
  const pages = Math.max(1, Math.ceil(total / PAGE));
  const linkClass = "font-mono underline underline-offset-2 hover:text-foreground";
  return <OperatorShell
    active="Support"
    detail
    title={item.subject}
    tenantName={operator.tenantName}
    tone={statusDotTone(item.status)}
    meta={`${String(item.status ?? "unknown").replaceAll("_", " ").toLowerCase()} · SLA ${dateTime(item.slaDueAt)} · ${total} messages`}
  >
    <DetailGrid items={[
      { label: "Status", value: <StatusBadge value={item.status} /> },
      { label: "Category · priority", value: `${item.category} · ${item.priority}` },
      { label: "Owner", value: item.ownerId ? staffName(item.ownerId) : "Unassigned" },
      { label: "Player", value: item.player ? <Link className={linkClass} href={`/dashboard/platform/customers/${item.playerId}`}>{shortId(item.playerId)}</Link> : <Mono>{shortId(item.playerId || "")}</Mono> },
      { label: "Opened", value: <Mono>{dateTime(item.openedAt)}</Mono> },
      { label: "SLA due", value: <Mono>{dateTime(item.slaDueAt)}</Mono> },
      { label: "Wager", value: item.wagerId ? <Link className={linkClass} href={`/dashboard/platform/wagers/${item.wagerId}`}>{shortId(item.wagerId)}</Link> : "—" },
      { label: "Dispute", value: item.dispute ? <span className="flex flex-wrap items-center gap-2"><Mono>{shortId(item.dispute.id)}</Mono> <StatusBadge value={item.dispute.status} /></span> : "—" },
      { label: "Payment", value: item.paymentIntentId ? <Mono>{shortId(item.paymentIntentId)}</Mono> : "—" },
    ]} />
    {item.dispute ? <section aria-labelledby="dispute-timeline" className="min-w-0 overflow-hidden rounded-xl border bg-card text-card-foreground">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <h2 id="dispute-timeline" className="text-sm font-semibold"><StatusDot tone={statusDotTone(item.dispute.status)} />Dispute<span className="ml-2 font-mono text-xs font-normal tabular-nums text-muted-foreground">{disputeEventTotal > disputeEvents.length ? `latest ${disputeEvents.length} of ${disputeEventTotal}` : disputeEventTotal}</span></h2>
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground"><StatusBadge value={item.dispute.status} />{item.dispute.category ? <span>{item.dispute.category}</span> : null}{item.dispute.resolvedAt ? <Mono>resolved {dateTime(item.dispute.resolvedAt)}</Mono> : null}</span>
      </div>
      {disputeEvents.length === 0 ? <p role="status" className="px-4 py-3 text-sm text-muted-foreground">No dispute events</p> : <ol className="divide-y">{disputeEvents.map((event: any) => {
        const summary = detailSummary(event.details);
        const actor = disputeActor(event.actorId);
        return <li key={event.id} className="min-w-0 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs"><span className="font-medium text-foreground">{(event.type || "event").replaceAll("_", " ").toLowerCase()}{actor ? <span className="font-normal text-muted-foreground"> · {actor}</span> : null}</span><Mono className="text-muted-foreground">{dateTime(event.createdAt)}</Mono></div>
          {summary ? <p className="mt-1 break-words text-xs text-muted-foreground">{summary}</p> : null}
        </li>;
      })}</ol>}
    </section> : null}
    <section aria-labelledby="case-timeline" className="min-w-0 space-y-3">
      <h2 id="case-timeline" className="text-sm font-semibold">Conversation<span className="ml-2 font-mono text-xs font-normal tabular-nums text-muted-foreground">{total}</span></h2>
      {events.length === 0 ? <WorkflowNote title="No messages yet" /> : <ol className="space-y-3">{events.map((event: any) => <li key={event.id} className={`min-w-0 rounded-xl border p-4 ${event.actorType === "PLAYER" ? "bg-card" : "bg-muted/40"}`}>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground"><span className="font-medium text-foreground">{event.actorType === "STAFF" ? staffName(event.actorId) : event.actorType === "PLAYER" ? "Customer" : event.actorType}<span className="font-normal text-muted-foreground"> · {event.type.replaceAll("_", " ").toLowerCase()}</span></span><span className="flex flex-wrap items-center gap-2"><StatusBadge value={event.visibility} /><Mono>{dateTime(event.createdAt)}</Mono></span></div>
        {event.visibility === "RESTRICTED" ? <p className="mt-2 text-sm italic text-muted-foreground">Restricted entry</p> : <p className="mt-2 whitespace-pre-wrap break-words text-sm">{event.body || "—"}</p>}
      </li>)}</ol>}
      {pages > 1 ? <nav aria-label="Conversation pages" className="flex items-center justify-between gap-3">
        <Track>
          {current > 1 ? <PillLink size="sm" href={`?page=${current - 1}`}>Earlier</PillLink> : <span aria-disabled="true" className="inline-flex h-8 items-center px-3 text-xs text-muted-foreground/60">Earlier</span>}
          {current < pages ? <PillLink size="sm" href={`?page=${current + 1}`}>Later</PillLink> : <span aria-disabled="true" className="inline-flex h-8 items-center px-3 text-xs text-muted-foreground/60">Later</span>}
        </Track>
        <Mono className="text-xs text-muted-foreground">{current} / {pages}</Mono>
      </nav> : null}
    </section>
    {closed ? <WorkflowNote title={`Case ${item.status.toLowerCase()}`} /> : <MutationForm title="Reply and update status" mutation={updateMutation} fields={[{ name: "caseId", label: "Case", type: "hidden", defaultValue: item.id }, { name: "status", label: "New status", type: "select", options: ["TRIAGED", "WAITING_CUSTOMER", "WAITING_OPERATOR", "RESOLVED", "CLOSED"].map((value) => ({ label: value.replaceAll("_", " "), value })) }, { name: "customerMessage", label: "Message to customer", type: "textarea" }, { name: "reason", label: "Internal reason" }]} submitLabel="Send and update" successMessage="Case updated." />}
  </OperatorShell>;
}
