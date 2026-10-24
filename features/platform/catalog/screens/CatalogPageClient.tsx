'use client';

import { ListFilters } from "../../components/ListFilters";
import { MutationForm } from "../../components/MutationForm";
import { Mono, Pill, PillLink, Track } from "../../components/kit";
import { MetricGrid, RecordList, WorkflowNote } from "../../components/WorkflowUI";
import { hrefWith } from "../../lib/paging";

export type CatalogEventRow = { id: string; name: string; reference: string; competition: string; startsAt: string; status: string | null };
export type CatalogOption = { label: string; value: string };

export type CatalogPageData = {
  rows: CatalogEventRow[];
  total: number;
  allEvents: number;
  markets: number;
  allCompetitions: number;
  pendingMappings: number;
  competitionOptions: CatalogOption[];
  competitionTotal: number;
  competitionSearch?: string;
  definitionOptions: CatalogOption[];
  sportOptions: CatalogOption[];
  timeZone: string;
  seasonStartsAt: string;
  seasonEndsAt: string;
  canTrade: boolean;
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
};

const basePath = "/dashboard/platform/catalog";
const createMutation = `mutation CreateCatalog($competitionId:ID!,$externalKey:String!,$name:String!,$startAt:String!,$marketDefinition:String!,$selections:String!){createCatalogEvent(competitionId:$competitionId,externalKey:$externalKey,name:$name,startAt:$startAt,marketDefinition:$marketDefinition,selections:$selections)}`;
const statusOptions = ["LIVE", "SCHEDULED", "SUSPENDED", "ENDED", "CANCELLED"].map((value) => ({ label: value.toLowerCase(), value }));
const stateText = (value: string | null | undefined) => (value || "unknown").replaceAll("_", " ").toLowerCase();
const inputClass = "h-9 w-full min-w-0 rounded-full border bg-background px-4 text-sm";

export function CatalogPageClient({ data }: { data: CatalogPageData }) {
  const filtered = Boolean(data.search || data.status);
  const hasCompetitions = data.allCompetitions > 0;
  const statusHref = (status?: string) => hrefWith(basePath, { q: data.search, status, competition: data.competitionSearch });
  return <>
    <MetricGrid items={[
      { label: filtered ? "Matching events" : "Events", value: data.total, detail: filtered ? `${data.allEvents} in catalog` : undefined },
      { label: "Markets", value: data.markets },
      { label: "Competitions", value: data.allCompetitions, tone: hasCompetitions ? undefined : "wait" },
      { label: "Mapping review", value: data.pendingMappings, detail: data.pendingMappings ? "pending" : undefined, tone: data.pendingMappings ? "wait" : "ok" },
    ]} />
    <RecordList
      title="Events"
      action={<div className="flex min-w-0 flex-wrap items-center gap-2">
        <Track label="Event state">
          <PillLink size="sm" variant="flat" href={statusHref()} current={!data.status}>All</PillLink>
          {statusOptions.map((option) => <PillLink key={option.value} size="sm" variant="flat" href={statusHref(option.value)} current={data.status === option.value}>{option.label}</PillLink>)}
        </Track>
        <ListFilters searchLabel="Search events" searchPlaceholder="Event, key or ID" />
      </div>}
      columns={["Event", "Competition", `Starts (${data.timeZone})`, "State"]}
      rows={data.rows.map((event) => ({ id: event.id, href: `${basePath}/${event.id}`, status: event.status ?? undefined, cells: [<span key="name">{event.name}<Mono className="mt-1 block break-all text-xs text-muted-foreground">{event.reference}</Mono></span>, event.competition, <Mono key="starts">{event.startsAt}</Mono>, stateText(event.status)] }))}
      filtered={filtered}
      emptyTitle={filtered ? "No matching events" : "No events"}
      emptyAction={<Track>{filtered ? <PillLink size="sm" href={basePath}>Clear filters</PillLink> : hasCompetitions ? <PillLink size="sm" variant="primary" href="#create-event">Create event</PillLink> : <PillLink size="sm" href="/dashboard/platform/onboarding">Open onboarding</PillLink>}</Track>}
      pagination={{ page: data.page, pageSize: data.pageSize, total: data.total, hrefForPage: (next) => hrefWith(basePath, { q: data.search, status: data.status, competition: data.competitionSearch, page: next }) }}
    />
    {hasCompetitions ? <section aria-labelledby="create-event-title" className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="create-event-title" className="text-sm font-semibold">New event</h2>
        <form method="get" role="search" aria-label="Find competition" className="flex min-w-0 flex-1 basis-64 flex-wrap items-center justify-end gap-2">
          {data.search ? <input type="hidden" name="q" value={data.search} /> : null}
          {data.status ? <input type="hidden" name="status" value={data.status} /> : null}
          <label className="sr-only" htmlFor="catalog-competition-search">Find competition</label>
          <input id="catalog-competition-search" type="search" name="competition" defaultValue={data.competitionSearch} placeholder="Competition name or ID" className={`${inputClass} max-w-xs flex-1 basis-48`} />
          <Track><Pill size="sm" type="submit">Find</Pill></Track>
          <Mono className="w-full text-right text-xs text-muted-foreground">{data.competitionOptions.length} of {data.competitionTotal} competitions{data.competitionSearch ? ` · “${data.competitionSearch}”` : ""}</Mono>
        </form>
      </div>
      <div id="create-event"><MutationForm title="Create event" mutation={createMutation} fields={[
        { name: "competitionId", label: "Competition", type: "select", options: data.competitionOptions, emptyOptionsMessage: data.competitionSearch ? "No competition matches." : undefined },
        { name: "externalKey", label: "External reference", placeholder: "provider:event:2026-001" },
        { name: "name", label: "Event name", placeholder: "Home v Away" },
        { name: "startAt", label: `Scheduled start (${data.timeZone})`, type: "datetime-local", help: `Tenant time ${data.timeZone}. DST-gap times rejected; repeated times need an offset.` },
        { name: "marketDefinition", label: "Market type", type: "select", options: data.definitionOptions, emptyOptionsMessage: "No active market types." },
        { name: "selections", label: "Selections", type: "rows", minRows: 2, defaultValue: JSON.stringify([{ key: "home", label: "Home" }, { key: "away", label: "Away" }]), columns: [{ name: "key", label: "Key", placeholder: "draw" }, { name: "label", label: "Name", placeholder: "Draw" }], help: "Min 2, unique keys." },
      ]} submitLabel="Create catalog event" successMessage="Event created · market suspended until priced." resultHref={`${basePath}/{id}`} disabledReason={data.canTrade ? undefined : "Trading permission required."} /></div>
    </section> : <div className="space-y-3">
      <WorkflowNote title="No competition" tone="warning" />
      <Track><PillLink size="sm" href="/dashboard/platform/onboarding">Open onboarding</PillLink></Track>
    </div>}
    <section aria-labelledby="catalog-reference" className="space-y-3">
      <h2 id="catalog-reference" className="text-sm font-semibold">Reference data</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <MutationForm compact title="Sport" mutation={`mutation($key:String!,$name:String!){createCatalogSport(key:$key,name:$name)}`} fields={[{ name: 'key', label: 'Sport key', placeholder: 'e.g. basketball' }, { name: 'name', label: 'Sport name', placeholder: 'e.g. Basketball' }]} submitLabel="Create sport" successMessage="Sport created." disabledReason={data.canTrade ? undefined : "Trading permission required."} />
        <MutationForm compact title="Competition" mutation={`mutation($sportId:ID!,$key:String!,$name:String!,$timezone:String!){createCatalogCompetition(sportId:$sportId,key:$key,name:$name,timezone:$timezone)}`} fields={[{ name: 'sportId', label: 'Sport', type: 'select', options: data.sportOptions, emptyOptionsMessage: 'Create a sport first.' }, { name: 'key', label: 'Competition key', placeholder: 'e.g. nba' }, { name: 'name', label: 'Competition name', placeholder: 'e.g. NBA' }, { name: 'timezone', label: 'Time zone', defaultValue: data.timeZone }]} submitLabel="Create competition" successMessage="Competition created." disabledReason={data.canTrade ? undefined : "Trading permission required."} />
        <MutationForm compact title="Season" mutation={`mutation($competitionId:ID!,$key:String!,$name:String!,$startsAt:String!,$endsAt:String!){createCompetitionSeason(competitionId:$competitionId,key:$key,name:$name,startsAt:$startsAt,endsAt:$endsAt)}`} fields={[{ name: 'competitionId', label: 'Competition', type: 'select', options: data.competitionOptions, emptyOptionsMessage: data.competitionSearch ? "No competition matches." : undefined }, { name: 'key', label: 'Season key', defaultValue: '2026-27' }, { name: 'name', label: 'Season name', defaultValue: '2026 / 2027' }, { name: 'startsAt', label: 'Starts (ISO)', defaultValue: data.seasonStartsAt }, { name: 'endsAt', label: 'Ends (ISO)', defaultValue: data.seasonEndsAt }]} submitLabel="Create season" successMessage="Season created and audited." />
        <MutationForm compact title="Venue" mutation={`mutation($key:String!,$name:String!,$countryCode:String!,$timezone:String!){createCatalogVenue(key:$key,name:$name,countryCode:$countryCode,timezone:$timezone)}`} fields={[{ name: 'key', label: 'Venue key', placeholder: 'e.g. wembley' }, { name: 'name', label: 'Venue name', placeholder: 'e.g. Wembley Stadium' }, { name: 'countryCode', label: 'Country code', placeholder: 'e.g. GB' }, { name: 'timezone', label: 'Time zone', defaultValue: 'UTC' }]} submitLabel="Create venue" successMessage="Venue created." />
        <MutationForm compact title="Competitor" mutation={`mutation($key:String!,$name:String!){createCatalogCompetitor(key:$key,name:$name)}`} fields={[{ name: 'key', label: 'Canonical key', placeholder: 'e.g. arsenal' }, { name: 'name', label: 'Competitor name', placeholder: 'e.g. Arsenal' }]} submitLabel="Create competitor" successMessage="Competitor created." />
      </div>
    </section>
  </>;
}
