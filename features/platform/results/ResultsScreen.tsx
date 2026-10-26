import { resultApprovalHash } from "@/features/sportsbook/domain/result-approval";
import { MutationForm } from "../components/MutationForm";
import { ResultOutcomeEditor, type ResultEditorMarket } from "./ResultOutcomeEditor";
import { OperatorShell, TenantRequired } from "../components/OperatorShell";
import { Mono, Pill, PillLink, StatusDot, Track } from "../components/kit";
import { MetricGrid, RecordList, StatusBadge, WorkflowNote } from "../components/WorkflowUI";
import { dateTime, shortId } from "../lib/format";
import { getOperatorContext, platformPrisma as prisma } from "../lib/operator";
import { hrefWith, pageFrom, PLATFORM_PAGE_SIZE, type PlatformSearchParams } from "../lib/paging";

const EVENT_PICKER_SIZE = 24;
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

const enterMutation = `mutation EnterResult($eventId:ID!,$payload:String!){ingestSandboxResult(eventId:$eventId,payload:$payload)}`;
const requestMutation = `mutation RequestResultApproval($resultVersionId:ID!,$reason:String!){requestResultApproval(resultVersionId:$resultVersionId,reason:$reason)}`;
const withdrawMutation = `mutation WithdrawResult($resultVersionId:ID!,$reason:String!){withdrawResultVersion(resultVersionId:$resultVersionId,reason:$reason)}`;
const approveMutation = `mutation ApproveResult($resultVersionId:ID!,$approvalId:ID!,$reason:String!){approveResultVersion(resultVersionId:$resultVersionId,approvalId:$approvalId,reason:$reason)}`;

export async function ResultsScreen({ eventId, searchParams }: { eventId?: string; searchParams?: PlatformSearchParams } = {}) {
  const params = (await searchParams) ?? {};
  const page = pageFrom(params);
  const eventPage = pageFrom({ page: params.epage });
  const eventSearch = first(params.eventq)?.trim().slice(0, 120) || undefined;
  // Result entry/requests need canTrade and application needs canManageRisk; either role opens the screen and each
  // action keeps its own server-checked capability.
  const context = await getOperatorContext();
  const operator = context && (context.capabilities.canTrade || context.capabilities.canManageRisk) ? context : null;
  if (!operator) return <OperatorShell active="Results" title="Results"><TenantRequired /></OperatorShell>;
  // Eligible events are searched and paged (not the first 100), and every pending result is loaded on
  // its own so old pending work stays reachable however many versions are newer.
  const eventWhere = { tenantId: operator.tenantId, status: { in: ["SCHEDULED", "LIVE", "ENDED"] }, startAt: { lte: new Date() }, ...(eventSearch ? { OR: [{ name: { contains: eventSearch, mode: "insensitive" } }, { externalKey: { contains: eventSearch, mode: "insensitive" } }, { id: eventSearch }] } : {}) };
  const resultWhere = { tenantId: operator.tenantId };
  const [events, eventTotal, eligibleTotal, results, resultTotal, pending, pendingTotal, approvedTotal, approvalTotal] = await Promise.all([
    prisma.event.findMany({ where: eventWhere, orderBy: [{ startAt: "desc" }, { id: "desc" }], take: EVENT_PICKER_SIZE, skip: (eventPage - 1) * EVENT_PICKER_SIZE }),
    prisma.event.count({ where: eventWhere }),
    prisma.event.count({ where: { tenantId: operator.tenantId, status: { in: ["SCHEDULED", "LIVE", "ENDED"] }, startAt: { lte: new Date() } } }),
    prisma.resultVersion.findMany({ where: resultWhere, orderBy: [{ createdAt: "desc" }, { version: "desc" }, { id: "desc" }], take: PLATFORM_PAGE_SIZE, skip: (page - 1) * PLATFORM_PAGE_SIZE, include: { event: true } }),
    prisma.resultVersion.count({ where: resultWhere }),
    prisma.resultVersion.findMany({ where: { ...resultWhere, status: "PENDING" }, orderBy: [{ createdAt: "asc" }, { id: "asc" }], take: PLATFORM_PAGE_SIZE, include: { event: true } }),
    prisma.resultVersion.count({ where: { ...resultWhere, status: "PENDING" } }),
    prisma.resultVersion.count({ where: { ...resultWhere, status: "APPROVED" } }),
    prisma.approvalRequest.count({ where: { tenantId: operator.tenantId, action: "APPROVE_RESULT" } }),
  ]);
  const hashFor = (result: any) => { try { return resultApprovalHash(result); } catch { return undefined; } };
  const shownHashes = [...new Set([...results, ...pending].map(hashFor).filter(Boolean))] as string[];
  const approvals = shownHashes.length ? await prisma.approvalRequest.findMany({ where: { tenantId: operator.tenantId, action: "APPROVE_RESULT", payloadHash: { in: shownHashes } }, orderBy: [{ createdAt: "desc" }, { id: "desc" }] }) : [];
  const approvalActorIds = [...new Set(approvals.flatMap((approval: any) => [approval.requesterId, approval.approverId]).filter(Boolean))] as string[];
  const approvalActors = approvalActorIds.length ? await prisma.user.findMany({ where: { tenantId: operator.tenantId, id: { in: approvalActorIds } }, select: { id: true, name: true } }) : [];
  const actorName = (id: string) => approvalActors.find((actor: any) => actor.id === id)?.name || "Unknown operator";
  const approvalFor = (resultId: string) => {
    const result = [...results, ...pending].find((item: any) => item.id === resultId);
    const hash = result ? hashFor(result) : undefined;
    return hash ? approvals.find((approval: any) => approval.payloadHash === hash) : undefined;
  };
  // The selected event's own complete market/selection tree feeds the typed outcome editor.
  const selectedEvent = eventId ? await prisma.event.findFirst({ where: { id: eventId, tenantId: operator.tenantId, status: { in: ["SCHEDULED", "LIVE", "ENDED"] }, startAt: { lte: new Date() } }, include: { from_Market_event: { orderBy: { createdAt: "asc" }, include: { from_Selection_market: { orderBy: { key: "asc" } } } } } }) : null;
  const editorMarkets: ResultEditorMarket[] = (selectedEvent?.from_Market_event ?? []).map((market: any) => ({ id: market.id, label: market.definitionKey, selections: market.from_Selection_market.map((selection: any) => ({ key: selection.key, label: selection.label })) }));
  const resultsPath = "/dashboard/platform/results";
  const eventPages = Math.max(1, Math.ceil(eventTotal / EVENT_PICKER_SIZE));
  return <OperatorShell active="Results" title="Results" tone={pendingTotal ? "wait" : "ok"} meta={`${pendingTotal} pending · ${approvedTotal} approved · ${resultTotal} versions`} tenantName={operator.tenantName}>
    <MetricGrid items={[
      { label: "Pending", value: pendingTotal, detail: pendingTotal > pending.length ? `oldest ${pending.length} shown` : undefined, tone: pendingTotal ? "wait" : "ok" },
      { label: "Approved", value: approvedTotal },
      { label: "Approval requests", value: approvalTotal },
      { label: "Result versions", value: resultTotal },
    ]} />
    <section className="space-y-3" aria-labelledby="result-pending">
      <h2 id="result-pending" className="text-sm font-semibold"><StatusDot tone={pendingTotal ? "wait" : "ok"} />Pending<span className="ml-2 tabular-nums text-xs font-normal  text-muted-foreground">{pendingTotal}</span></h2>
      {pending.length === 0 ? <WorkflowNote title="No pending results" /> : pending.map((result: any) => { const approval = approvalFor(result.id); return <article key={result.id} className="min-w-0 space-y-3 rounded-[4px] border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="min-w-0 break-words font-medium">{result.event?.name || shortId(result.id)} <Mono className="text-xs text-muted-foreground">v{result.version} · {dateTime(result.createdAt)}</Mono></h3>
          <StatusBadge value={approval ? `APPROVAL_${approval.status}` : "PENDING"} />
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {!approval || approval.status === "REJECTED" || approval.status === "EXPIRED" ? <MutationForm compact title="Request approval" description={`Result v${result.version}`} mutation={requestMutation} fields={[{ name: "resultVersionId", label: "Result", type: "hidden", defaultValue: result.id }, { name: "reason", label: "Approval reason", placeholder:'Why this is needed and what you reviewed' }]} submitLabel="Request independent approval" successMessage="Approval request created." disabledReason={operator.capabilities.canTrade ? undefined : "Your role cannot request result approval."} /> : <div className="min-w-0 rounded-[4px] bg-muted/60 px-4 py-3 text-sm"><p className="font-medium">Approval <Mono className="break-all">{shortId(approval.id)}</Mono></p><p className="mt-1 text-xs text-muted-foreground">requested by {actorName(approval.requesterId)}{approval.approverId ? <> · decided by {actorName(approval.approverId)}</> : null}</p></div>}
          {approval?.status === "APPROVED" ? <MutationForm compact title="Apply approved result" description={`Result v${result.version}`} mutation={approveMutation} fields={[{ name: "resultVersionId", label: "Result", type: "hidden", defaultValue: result.id }, { name: "approvalId", label: "Approval", type: "hidden", defaultValue: approval.id }, { name: "reason", label: "Application reason", placeholder:'Why this is needed and what you reviewed' }]} submitLabel="Approve result version" successMessage="Result approved for grading." disabledReason={operator.capabilities.canManageRisk ? undefined : "Your role does not include risk approval capability."} /> : <WorkflowNote title={approval ? `Approval ${approval.status.toLowerCase()}` : "Approval not requested"} tone={approval?.status === "REJECTED" ? "warning" : "neutral"}>Decided by another user</WorkflowNote>}
          <MutationForm compact requireReview title="Withdraw" description={`Result v${result.version}`} mutation={withdrawMutation} fields={[{ name: "resultVersionId", label: "Result", type: "hidden", defaultValue: result.id }, { name: "reason", label: "Withdrawal reason" }]} submitLabel="Withdraw version" successMessage="Result version withdrawn." disabledReason={operator.capabilities.canTrade ? undefined : "Your role cannot withdraw results."} />
        </div>
      </article>; })}
    </section>
    {eligibleTotal ? <section className="space-y-3" aria-labelledby="result-entry">
      <div className="min-w-0 space-y-3 rounded-[4px] border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="result-entry" className="text-sm font-semibold">Enter result</h2>
          <Mono className="text-xs text-muted-foreground" >{eventTotal} eligible{eventSearch ? " match" : ""} · {eventPage}/{eventPages}</Mono>
        </div>
        <form method="get" role="search" className="flex flex-wrap items-center gap-2">
          {eventId ? <input type="hidden" name="eventId" value={eventId} /> : null}
          <label className="sr-only" htmlFor="result-event-search">Search events</label>
          <input id="result-event-search" name="eventq" type="search" defaultValue={eventSearch ?? ""} placeholder="Event name or reference" className="h-9 min-w-0 flex-1 basis-48 rounded-[4px] border bg-background px-4 text-sm" />
          <Track><Pill size="sm" type="submit">Search</Pill>{eventSearch ? <PillLink size="sm" variant="flat" href={hrefWith(resultsPath, { eventId })}>Clear</PillLink> : null}</Track>
        </form>
        {events.length ? <Track label="Eligible events" className="rounded-[4px]">{events.map((event: any) => <PillLink key={event.id} size="sm" variant="flat" href={hrefWith(resultsPath, { eventId: event.id, eventq: eventSearch, epage: eventPage })} current={selectedEvent?.id === event.id} className="max-w-full"><span className="min-w-0 truncate">{event.name}</span><Mono className="text-[11px] opacity-70">{dateTime(event.startAt)}</Mono></PillLink>)}</Track> : <p role="status" className="text-sm text-muted-foreground">No eligible event matches</p>}
        {eventTotal > EVENT_PICKER_SIZE ? <nav aria-label="Event pages"><Track>{eventPage > 1 ? <PillLink size="sm" href={hrefWith(resultsPath, { eventId, eventq: eventSearch, epage: eventPage - 1 })}>Previous</PillLink> : null}{eventPage * EVENT_PICKER_SIZE < eventTotal ? <PillLink size="sm" href={hrefWith(resultsPath, { eventId, eventq: eventSearch, epage: eventPage + 1 })}>More</PillLink> : null}</Track></nav> : null}
        {selectedEvent && !events.some((event: any) => event.id === selectedEvent.id) ? <p className="text-xs text-muted-foreground">Selected: {selectedEvent.name} · <Mono>{dateTime(selectedEvent.startAt)}</Mono></p> : null}
      </div>
      {selectedEvent ? <ResultOutcomeEditor eventId={selectedEvent.id} eventLabel={selectedEvent.name} markets={editorMarkets} mutation={enterMutation} disabledReason={operator.capabilities.canTrade ? undefined : "Your role does not include result-entry capability."} /> : eventId ? <WorkflowNote title="Event not eligible" tone="warning">Not in this tenant, or not scheduled, live or ended</WorkflowNote> : null}
    </section> : <div className="space-y-3"><WorkflowNote title="No eligible events" tone="warning" /><Track><PillLink size="sm" href="/dashboard/platform/catalog">Open Catalog</PillLink></Track></div>}
    <RecordList title="Result versions" columns={["Event / version", "Payload hash", "Entered", "State"]} rows={results.map((result: any) => { const approval = approvalFor(result.id); return { id: result.id, status: result.status ?? undefined, cells: [<span key="event">{result.event?.name || shortId(result.eventId || "Unknown")}<Mono className="block text-xs text-muted-foreground">v{result.version}</Mono></span>, <code key="hash" className="break-all tabular-nums text-xs">{result.payloadHash}</code>, dateTime(result.createdAt), <span key="state" className="flex flex-wrap gap-x-3 gap-y-1"><span>{(result.status || "unknown").toLowerCase()}</span>{approval ? <StatusBadge value={`APPROVAL_${approval.status}`} /> : null}</span>] }; })} emptyTitle="No result versions" pagination={{ page, pageSize: PLATFORM_PAGE_SIZE, total: resultTotal, hrefForPage: (next) => hrefWith(resultsPath, { eventId, eventq: eventSearch, epage: eventPage, page: next }) }} />
  </OperatorShell>;
}

