import type { ReactNode } from "react";
import { OperatorShell, TenantRequired } from "../../components/OperatorShell";
import { ListFilters } from "../../components/ListFilters";
import { MutationForm, type MutationField } from "../../components/MutationForm";
import { Mono, Pill, PillLink, Track } from "../../components/kit";
import { RecordList, StatusBadge, type RecordRow } from "../../components/WorkflowUI";
import { dateTime, displayTimeZone, shortId } from "../../lib/format";
import { searchFrom } from "../../lib/graphql";
import { getOperatorContext, platformPrisma as prisma } from "../../lib/operator";
import { allowedParam, hrefWith, pageFrom, PLATFORM_PAGE_SIZE, type PlatformSearchParams } from "../../lib/paging";

const basePath = "/dashboard/platform/catalog/reference";
const types = ["sports", "competitions", "seasons", "stages", "venues", "competitors"] as const;
type ReferenceType = (typeof types)[number];
const typeLabels: Record<ReferenceType, string> = { sports: "Sports", competitions: "Competitions", seasons: "Seasons", stages: "Stages", venues: "Venues", competitors: "Competitors" };
const typeCodes: Record<ReferenceType, string> = { sports: "SPORT", competitions: "COMPETITION", seasons: "SEASON", stages: "STAGE", venues: "VENUE", competitors: "COMPETITOR" };
const modelFor: Record<ReferenceType, string> = { sports: "sport", competitions: "competition", seasons: "season", stages: "competitionStage", venues: "venue", competitors: "competitor" };
const PICKER_SIZE = 100;
const statusMutation = `mutation($type:String!,$id:ID!,$active:Boolean!,$reason:String!){setCatalogReferenceStatus(type:$type,id:$id,active:$active,reason:$reason)}`;

type Row = { id: string; name: string; status: string; cells: ReactNode[] };

/** Rows count as active while they can still take events: sports/competitions/venues/competitors ACTIVE, seasons SCHEDULED/ACTIVE, stages SCHEDULED/ACTIVE. */
const isActive = (status: string) => status === "ACTIVE" || status === "SCHEDULED";
const nameCell = (name: string, key: string) => <span key="name">{name}<Mono className="mt-1 block break-all text-xs text-muted-foreground">{key}</Mono></span>;
const count = (key: string, value: number | undefined) => <Mono key={key}>{value ?? 0}</Mono>;

function searchWhere(search: string | undefined) {
  return search ? { OR: [{ id: search }, { name: { contains: search, mode: "insensitive" } }, { key: { contains: search, mode: "insensitive" } }] } : {};
}

/** Server screen: reference data events hang off, one type at a time, active rows first. */
export async function ReferenceScreen({ searchParams }: { searchParams?: PlatformSearchParams } = {}) {
  const params = (await searchParams) ?? {};
  const type: ReferenceType = allowedParam(params, "type", types) ?? "sports";
  const page = pageFrom(params);
  const search = searchFrom(params);
  const actId = searchFrom(params, "act");
  const parentSearch = searchFrom(params, "parent");
  const operator = await getOperatorContext("canTrade");
  if (!operator) return <OperatorShell active="CatalogReference" title="Reference data"><TenantRequired /></OperatorShell>;
  const tenantId = operator.tenantId;
  const where = { tenantId, ...searchWhere(search) };
  const skip = (page - 1) * PLATFORM_PAGE_SIZE;
  const take = PLATFORM_PAGE_SIZE;
  const statusOrder = [{ status: "asc" }, { name: "asc" }, { id: "asc" }];

  const [sportCount, competitionCount, seasonCount, stageCount, venueCount, competitorCount, total] = await Promise.all([
    prisma.sport.count({ where: { tenantId } }),
    prisma.competition.count({ where: { tenantId } }),
    prisma.season.count({ where: { tenantId } }),
    prisma.competitionStage.count({ where: { tenantId } }),
    prisma.venue.count({ where: { tenantId } }),
    prisma.competitor.count({ where: { tenantId } }),
    prisma[modelFor[type]].count({ where }),
  ]);
  const typeCounts: Record<ReferenceType, number> = { sports: sportCount, competitions: competitionCount, seasons: seasonCount, stages: stageCount, venues: venueCount, competitors: competitorCount };

  let columns: string[] = [];
  let rows: Row[] = [];
  if (type === "sports") {
    const items = await prisma.sport.findMany({ where, orderBy: [{ active: "desc" }, { name: "asc" }, { id: "asc" }], skip, take, include: { _count: { select: { from_Competition_sport: true } } } });
    columns = ["Sport", "Competitions", "State"];
    rows = items.map((item: any) => { const status = item.active ? "ACTIVE" : "INACTIVE"; return { id: item.id, name: item.name || item.key, status, cells: [nameCell(item.name || shortId(item.id), item.key), count("from_Competition_sport", item._count.from_Competition_sport), <StatusBadge key="state" value={status} />] }; });
  } else if (type === "competitions") {
    const items = await prisma.competition.findMany({ where, orderBy: statusOrder, skip, take, include: { sport: { select: { name: true } }, region: { select: { name: true } }, _count: { select: { from_Season_competition: true, from_Event_competition: true } } } });
    columns = ["Competition", "Sport", "Region", "Time zone", "Seasons", "Events", "State"];
    rows = items.map((item: any) => { const status = item.status ?? "ACTIVE"; return { id: item.id, name: item.name || item.key, status, cells: [nameCell(item.name || shortId(item.id), item.key), item.sport?.name || "—", item.region?.name || "—", <Mono key="tz" className="break-all text-xs">{item.timezone || "—"}</Mono>, count("from_Season_competition", item._count.from_Season_competition), count("from_Event_competition", item._count.from_Event_competition), <StatusBadge key="state" value={status} />] }; });
  } else if (type === "seasons") {
    const items = await prisma.season.findMany({ where, orderBy: [{ status: "asc" }, { startsAt: "desc" }, { id: "asc" }], skip, take, include: { competition: { select: { name: true } }, _count: { select: { from_CompetitionStage_season: true, from_Event_season: true } } } });
    columns = ["Season", "Competition", "Starts", "Ends", "Stages", "Events", "State"];
    rows = items.map((item: any) => { const status = item.status ?? "SCHEDULED"; return { id: item.id, name: item.name || item.key, status, cells: [nameCell(item.name || shortId(item.id), item.key), item.competition?.name || "—", <Mono key="starts" className="text-xs">{dateTime(item.startsAt)}</Mono>, <Mono key="ends" className="text-xs">{dateTime(item.endsAt)}</Mono>, count("from_CompetitionStage_season", item._count.from_CompetitionStage_season), count("from_Event_season", item._count.from_Event_season), <StatusBadge key="state" value={status} />] }; });
  } else if (type === "stages") {
    const items = await prisma.competitionStage.findMany({ where, orderBy: [{ status: "asc" }, { sortOrder: "asc" }, { name: "asc" }, { id: "asc" }], skip, take, include: { season: { select: { name: true, competition: { select: { name: true } } } }, _count: { select: { from_Event_stage: true } } } });
    columns = ["Stage", "Season", "Order", "Events", "State"];
    rows = items.map((item: any) => { const status = item.status ?? "SCHEDULED"; return { id: item.id, name: item.name || item.key, status, cells: [nameCell(item.name || shortId(item.id), item.key), item.season ? `${item.season.competition?.name || "—"} · ${item.season.name}` : "—", <Mono key="order">{item.sortOrder}</Mono>, count("from_Event_stage", item._count.from_Event_stage), <StatusBadge key="state" value={status} />] }; });
  } else if (type === "venues") {
    const items = await prisma.venue.findMany({ where, orderBy: statusOrder, skip, take, include: { _count: { select: { from_Event_venue: true } } } });
    columns = ["Venue", "Country", "Time zone", "Events", "State"];
    rows = items.map((item: any) => { const status = item.status ?? "ACTIVE"; return { id: item.id, name: item.name || item.key, status, cells: [nameCell(item.name || shortId(item.id), item.key), <Mono key="country">{item.countryCode || "—"}</Mono>, <Mono key="tz" className="break-all text-xs">{item.timezone || "—"}</Mono>, count("from_Event_venue", item._count.from_Event_venue), <StatusBadge key="state" value={status} />] }; });
  } else {
    const items = await prisma.competitor.findMany({ where, orderBy: statusOrder, skip, take, include: { _count: { select: { from_EventParticipant_competitor: true } } } });
    columns = ["Competitor", "Events", "State"];
    rows = items.map((item: any) => { const status = item.status ?? "ACTIVE"; return { id: item.id, name: item.name || item.key, status, cells: [nameCell(item.name || shortId(item.id), item.key), count("from_EventParticipant_competitor", item._count.from_EventParticipant_competitor), <StatusBadge key="state" value={status} />] }; });
  }

  // Selected row for an explicit status change (?act=<id>), always re-read tenant-scoped.
  const target = actId ? await prisma[modelFor[type]].findFirst({ where: { id: actId, tenantId } }) : null;
  const targetStatus = target ? (type === "sports" ? (target.active ? "ACTIVE" : "INACTIVE") : String(target.status ?? "")) : "";
  const targetActivate = target ? !isActive(targetStatus) || (type === "stages" && targetStatus === "SCHEDULED") : false;

  const typeHref = (next: ReferenceType) => hrefWith(basePath, { type: next });
  const listHref = (extra: Record<string, string | number | undefined> = {}) => hrefWith(basePath, { type, q: search, page, ...extra });
  const canTrade = operator.capabilities.canTrade;
  const disabledReason = canTrade ? undefined : "Trading permission required.";
  const singular = typeLabels[type].slice(0, -1).toLowerCase();

  const recordRows: RecordRow[] = rows.map((row) => {
    const activate = !isActive(row.status) || (type === "stages" && row.status === "SCHEDULED");
    return { id: row.id, status: row.status, cells: [...row.cells, <Track key="action"><PillLink size="sm" variant={activate ? "raised" : "danger"} href={listHref({ act: row.id })} current={actId === row.id}>{activate ? "Activate" : type === "stages" ? "Complete" : "Deactivate"}</PillLink></Track>] };
  });

  const createForm = await createFormFor(type, tenantId, parentSearch, disabledReason);

  return <OperatorShell active="CatalogReference" title="Reference data" tone={sportCount ? "ok" : "wait"} meta={`${sportCount} sports · ${competitionCount} competitions · ${seasonCount} seasons · ${stageCount} stages · ${venueCount} venues · ${competitorCount} competitors`} tenantName={operator.tenantName}>
    <Track label="Reference type" className="w-full sm:w-auto">
      {types.map((item) => <PillLink key={item} size="sm" variant="flat" href={typeHref(item)} current={item === type}>{typeLabels[item]}<Mono className="text-[11px] text-muted-foreground">{typeCounts[item]}</Mono></PillLink>)}
    </Track>
    {target ? <div className="space-y-2">
      <MutationForm compact key={target.id} title={`${targetActivate ? "Activate" : type === "stages" ? "Complete" : "Deactivate"} ${target.name || target.key || shortId(target.id)}`} description={`${singular} · ${targetStatus.toLowerCase()}`} mutation={statusMutation} fields={[
        { name: "type", label: "Type", type: "hidden", defaultValue: typeCodes[type] },
        { name: "id", label: "Record", type: "hidden", defaultValue: target.id },
        { name: "active", label: "Active", type: "hidden", transform: "boolean", defaultValue: targetActivate ? "true" : "false" },
        { name: "reason", label: "Reason", placeholder: "Reason" },
      ]} submitLabel={targetActivate ? "Activate" : type === "stages" ? "Complete" : "Deactivate"} successMessage="Status updated." disabledReason={disabledReason} />
      <Track><PillLink size="sm" href={listHref()}>Close</PillLink></Track>
    </div> : null}
    <RecordList
      title={typeLabels[type]}
      action={<ListFilters searchLabel={`Search ${typeLabels[type].toLowerCase()}`} searchPlaceholder="Name, key or ID" />}
      columns={[...columns, "Action"]}
      rows={recordRows}
      filtered={Boolean(search)}
      emptyTitle={search ? `No matching ${typeLabels[type].toLowerCase()}` : `No ${typeLabels[type].toLowerCase()}`}
      emptyAction={search ? <Track><PillLink size="sm" href={typeHref(type)}>Clear search</PillLink></Track> : undefined}
      pagination={{ page, pageSize: PLATFORM_PAGE_SIZE, total, hrefForPage: (next) => hrefWith(basePath, { type, q: search, page: next }) }}
    />
    <section id="create-reference" aria-labelledby="create-reference-title" className="space-y-3">
      <h2 id="create-reference-title" className="text-sm font-semibold">New {singular}</h2>
      {createForm.parent ? <form method="get" role="search" aria-label={`Find ${createForm.parent.noun}`} className="flex flex-wrap items-center gap-2 rounded-[4px] border bg-card px-4 py-3">
        <input type="hidden" name="type" value={type} />
        {search ? <input type="hidden" name="q" value={search} /> : null}
        <label className="sr-only" htmlFor="reference-parent-search">Find {createForm.parent.noun}</label>
        <input id="reference-parent-search" type="search" name="parent" defaultValue={parentSearch} placeholder={`Find ${createForm.parent.noun}: name or ID`} className="h-9 min-w-0 flex-1 basis-48 rounded-[4px] border bg-background px-4 text-sm" />
        <Track><Pill size="sm" type="submit">Find</Pill></Track>
        <Mono className="w-full text-xs text-muted-foreground">{createForm.parent.shown} of {createForm.parent.total} {createForm.parent.noun}s{parentSearch ? ` · “${parentSearch}”` : ""}</Mono>
      </form> : null}
      {createForm.form}
    </section>
  </OperatorShell>;
}

type CreateForm = { form: ReactNode; parent?: { noun: string; shown: number; total: number } };

async function createFormFor(type: ReferenceType, tenantId: string, parentSearch: string | undefined, disabledReason: string | undefined): Promise<CreateForm> {
  const form = (title: string, mutation: string, fields: MutationField[], submitLabel: string, successMessage: string) => <MutationForm title={title} mutation={mutation} fields={fields} submitLabel={submitLabel} successMessage={successMessage} disabledReason={disabledReason} />;
  const parentWhere = (extra: Record<string, unknown>) => ({ tenantId, ...extra, ...(parentSearch ? { OR: [{ id: parentSearch }, { name: { contains: parentSearch, mode: "insensitive" } }, { key: { contains: parentSearch, mode: "insensitive" } }] } : {}) });
  if (type === "sports") return { form: form("Sport", `mutation($key:String!,$name:String!){createCatalogSport(key:$key,name:$name)}`, [{ name: "key", label: "Sport key", placeholder: "e.g. basketball" }, { name: "name", label: "Sport name", placeholder: "e.g. Basketball" }], "Create sport", "Sport created.") };
  if (type === "competitions") {
    const where = parentWhere({ active: true });
    const [sports, total] = await Promise.all([prisma.sport.findMany({ where, orderBy: [{ name: "asc" }, { id: "asc" }], take: PICKER_SIZE, select: { id: true, name: true } }), prisma.sport.count({ where })]);
    return { parent: { noun: "active sport", shown: sports.length, total }, form: form("Competition", `mutation($sportId:ID!,$key:String!,$name:String!,$timezone:String!){createCatalogCompetition(sportId:$sportId,key:$key,name:$name,timezone:$timezone)}`, [{ name: "sportId", label: "Sport", type: "select", options: sports.map((sport: any) => ({ label: sport.name, value: sport.id })), emptyOptionsMessage: parentSearch ? "No sport matches." : "Create a sport first." }, { name: "key", label: "Competition key", placeholder: "e.g. nba" }, { name: "name", label: "Competition name", placeholder: "e.g. NBA" }, { name: "timezone", label: "Time zone", defaultValue: displayTimeZone() }], "Create competition", "Competition created.") };
  }
  if (type === "seasons") {
    const where = parentWhere({ status: "ACTIVE" });
    const [competitions, total] = await Promise.all([prisma.competition.findMany({ where, orderBy: [{ name: "asc" }, { id: "asc" }], take: PICKER_SIZE, select: { id: true, name: true, sport: { select: { name: true } } } }), prisma.competition.count({ where })]);
    const now = new Date();
    return { parent: { noun: "active competition", shown: competitions.length, total }, form: form("Season", `mutation($competitionId:ID!,$key:String!,$name:String!,$startsAt:String!,$endsAt:String!){createCompetitionSeason(competitionId:$competitionId,key:$key,name:$name,startsAt:$startsAt,endsAt:$endsAt)}`, [{ name: "competitionId", label: "Competition", type: "select", options: competitions.map((competition: any) => ({ label: `${competition.sport?.name || "Sport"} · ${competition.name || shortId(competition.id)}`, value: competition.id })), emptyOptionsMessage: parentSearch ? "No competition matches." : "Create a competition first." }, { name: "key", label: "Season key", defaultValue: "2026-27" }, { name: "name", label: "Season name", defaultValue: "2026 / 2027" }, { name: "startsAt", label: "Starts (ISO)", defaultValue: now.toISOString() }, { name: "endsAt", label: "Ends (ISO)", defaultValue: new Date(now.getTime() + 365 * 86_400_000).toISOString() }], "Create season", "Season created and audited.") };
  }
  if (type === "stages") {
    const where = parentWhere({ status: { in: ["SCHEDULED", "ACTIVE", "COMPLETE"] } });
    const [seasons, total] = await Promise.all([prisma.season.findMany({ where, orderBy: [{ startsAt: "desc" }, { id: "asc" }], take: PICKER_SIZE, select: { id: true, name: true, competition: { select: { name: true } } } }), prisma.season.count({ where })]);
    return { parent: { noun: "season", shown: seasons.length, total }, form: form("Stage", `mutation($seasonId:ID!,$key:String!,$name:String!,$sortOrder:Int!){createCatalogStage(seasonId:$seasonId,key:$key,name:$name,sortOrder:$sortOrder)}`, [{ name: "seasonId", label: "Season", type: "select", options: seasons.map((season: any) => ({ label: `${season.competition?.name || "Competition"} · ${season.name || shortId(season.id)}`, value: season.id })), emptyOptionsMessage: parentSearch ? "No season matches." : "Create a season first." }, { name: "key", label: "Stage key", placeholder: "e.g. group-a" }, { name: "name", label: "Stage name", placeholder: "e.g. Group A" }, { name: "sortOrder", label: "Order", type: "number", transform: "int", defaultValue: 1 }], "Create stage", "Stage created.") };
  }
  if (type === "venues") return { form: form("Venue", `mutation($key:String!,$name:String!,$countryCode:String!,$timezone:String!){createCatalogVenue(key:$key,name:$name,countryCode:$countryCode,timezone:$timezone)}`, [{ name: "key", label: "Venue key", placeholder: "e.g. wembley" }, { name: "name", label: "Venue name", placeholder: "e.g. Wembley Stadium" }, { name: "countryCode", label: "Country code", placeholder: "e.g. GB" }, { name: "timezone", label: "Time zone", defaultValue: "UTC" }], "Create venue", "Venue created.") };
  return { form: form("Competitor", `mutation($key:String!,$name:String!){createCatalogCompetitor(key:$key,name:$name)}`, [{ name: "key", label: "Canonical key", placeholder: "e.g. arsenal" }, { name: "name", label: "Competitor name", placeholder: "e.g. Arsenal" }], "Create competitor", "Competitor created.") };
}
