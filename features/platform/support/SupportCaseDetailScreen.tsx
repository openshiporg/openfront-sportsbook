import { notFound } from "next/navigation";
import Link from "next/link";
import { MutationForm } from "../components/MutationForm";
import { OperatorShell, TenantRequired } from "../components/OperatorShell";
import { DetailGrid, StatusBadge, WorkflowNote } from "../components/WorkflowUI";
import { dateTime, shortId } from "../lib/format";
import { getOperatorContext, platformPrisma as prisma } from "../lib/operator";

const updateMutation = `mutation($caseId:ID!,$status:String!,$customerMessage:String!,$reason:String!){setSupportCaseStatus(caseId:$caseId,status:$status,customerMessage:$customerMessage,reason:$reason)}`;
const PAGE = 100;

/**
 * One support case with its ordered conversation, so the operator replies from the real
 * history. RESTRICTED entries (AML/sensitive compartments) are listed but never rendered.
 */
export async function SupportCaseDetailScreen({ caseId, page = 1 }: { caseId: string; page?: number }) {
  const operator = await getOperatorContext("canManageCompliance");
  if (!operator) return <OperatorShell active="Support" detail title="Support case" description="Case conversation and next actions."><TenantRequired /></OperatorShell>;
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
  const closed = ["RESOLVED", "CLOSED"].includes(item.status);
  const pages = Math.max(1, Math.ceil(total / PAGE));
  return <OperatorShell active="Support" detail title={item.subject} description="Case conversation, linked records and next actions." tenantName={operator.tenantName}>
    <DetailGrid items={[
      { label: "Status", value: <StatusBadge value={item.status} /> },
      { label: "Category · priority", value: `${item.category} · ${item.priority}` },
      { label: "Player", value: item.player ? <Link className="underline" href={`/dashboard/platform/customers/${item.playerId}`}>{shortId(item.playerId)}</Link> : shortId(item.playerId || "") },
      { label: "Owner", value: item.ownerId ? staffName(item.ownerId) : "Unassigned" },
      { label: "Opened", value: dateTime(item.openedAt) },
      { label: "SLA due", value: dateTime(item.slaDueAt) },
      { label: "Wager", value: item.wagerId ? <Link className="underline" href={`/dashboard/platform/wagers/${item.wagerId}`}>{shortId(item.wagerId)}</Link> : "—" },
      { label: "Dispute", value: item.dispute ? <span className="flex flex-wrap items-center gap-2">{shortId(item.dispute.id)} <StatusBadge value={item.dispute.status} /></span> : "—" },
      { label: "Payment", value: item.paymentIntentId ? shortId(item.paymentIntentId) : "—" },
    ]} />
    <section aria-labelledby="case-timeline" className="space-y-3">
      <div><h2 id="case-timeline" className="font-semibold">Conversation</h2><p className="mt-1 text-sm text-muted-foreground">Oldest first. Customer-visible and internal entries are labelled; restricted entries stay sealed.</p></div>
      {events.length === 0 ? <WorkflowNote title="No messages yet">This case has no recorded events.</WorkflowNote> : <ol className="space-y-3">{events.map((event: any) => <li key={event.id} className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground"><span>{event.actorType === "STAFF" ? staffName(event.actorId) : event.actorType === "PLAYER" ? "Customer" : event.actorType} · {event.type.replaceAll("_", " ").toLowerCase()}</span><span className="flex items-center gap-2"><StatusBadge value={event.visibility} />{dateTime(event.createdAt)}</span></div>
        {event.visibility === "RESTRICTED" ? <p className="mt-2 text-sm italic text-muted-foreground">Restricted entry. Open the compliance record with the appropriate access to review it.</p> : <p className="mt-2 whitespace-pre-wrap text-sm">{event.body || "—"}</p>}
      </li>)}</ol>}
      {pages > 1 ? <nav aria-label="Conversation pages" className="flex gap-3 text-sm">{current > 1 ? <Link className="underline" href={`?page=${current - 1}`}>Earlier</Link> : null}<span className="text-muted-foreground">Page {current} of {pages}</span>{current < pages ? <Link className="underline" href={`?page=${current + 1}`}>Later</Link> : null}</nav> : null}
    </section>
    {closed ? <WorkflowNote title="Case closed">This case is {item.status.toLowerCase()}. The conversation remains as evidence.</WorkflowNote> : <MutationForm title="Reply and update status" description="Adds a customer-visible message to this conversation and records your internal reason in the audit trail." mutation={updateMutation} fields={[{ name: "caseId", label: "Case", type: "hidden", defaultValue: item.id }, { name: "status", label: "New status", type: "select", options: ["TRIAGED", "WAITING_CUSTOMER", "WAITING_OPERATOR", "RESOLVED", "CLOSED"].map((value) => ({ label: value.replaceAll("_", " "), value })) }, { name: "customerMessage", label: "Message to customer", type: "textarea", placeholder: "Message the customer will see" }, { name: "reason", label: "Internal reason", placeholder: "What you reviewed" }]} submitLabel="Send and update" successMessage="Case updated." />}
  </OperatorShell>;
}
