'use client';

import Link from "next/link";
import { ListFilters } from "../../components/ListFilters";
import { MutationForm } from "../../components/MutationForm";
import { MetricGrid, RecordList, StatusBadge } from "../../components/WorkflowUI";
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
const statusOptions = ["SCHEDULED", "LIVE", "SUSPENDED", "ENDED", "CANCELLED"].map((value) => ({ label: value.toLowerCase(), value }));
const linkClass = "inline-flex rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted";

export function CatalogPageClient({ data }: { data: CatalogPageData }) {
  const filtered = Boolean(data.search || data.status);
  const hasCompetitions = data.allCompetitions > 0;
  return <>
    <MetricGrid items={[
      { label: filtered ? "Matching events" : "Events", value: data.total, detail: `Showing ${data.rows.length} on page ${data.page}${filtered ? ` · ${data.allEvents} in catalog` : ""}` },
      { label: "Markets", value: data.markets, detail: "Across all events" },
      { label: "Competitions", value: data.allCompetitions, detail: "Tenant catalog" },
      { label: "Mapping review", value: data.pendingMappings, detail: "Pending provider mappings" },
    ]} />
    <RecordList
      title="Event catalog"
      description="Open a record to inspect markets, selections, and current price provenance. Search by event name, external key or exact ID."
      action={<ListFilters searchLabel="Search events" searchPlaceholder="Event name, external key or ID" filters={[{ key: "status", label: "State", options: statusOptions }]} />}
      columns={["Event", "Competition", `Starts (${data.timeZone})`, "State"]}
      rows={data.rows.map((event) => ({ id: event.id, href: `${basePath}/${event.id}`, cells: [<span key="name">{event.name}<span className="mt-1 block font-mono text-xs text-muted-foreground">{event.reference}</span></span>, event.competition, event.startsAt, <StatusBadge key="status" value={event.status} />] }))}
      filtered={filtered}
      emptyTitle={filtered ? "No matching events" : "No catalog events"}
      emptyDescription={filtered ? "No event matches this search or state." : hasCompetitions ? "Create your first event below." : "A competition must exist before you can add events."}
      emptyAction={filtered ? <Link href={basePath} className={linkClass}>Clear search and filters</Link> : hasCompetitions ? <a href="#create-event" className={linkClass}>Create an event</a> : <Link href="/dashboard/platform/onboarding" className={linkClass}>Open onboarding</Link>}
      pagination={{ page: data.page, pageSize: data.pageSize, total: data.total, hrefForPage: (next) => hrefWith(basePath, { q: data.search, status: data.status, competition: data.competitionSearch, page: next }) }}
    />
    {hasCompetitions ? <form method="get" role="search" aria-label="Find competition" className="flex flex-wrap items-end gap-2 rounded-xl border bg-card p-4">
      {data.search ? <input type="hidden" name="q" value={data.search} /> : null}
      {data.status ? <input type="hidden" name="status" value={data.status} /> : null}
      <label className="min-w-0 flex-1 text-sm font-medium">Find competition for the forms below<input name="competition" defaultValue={data.competitionSearch} placeholder="Competition name or ID" className="mt-1 block h-10 w-full rounded-md border border-input bg-background px-3 text-sm font-normal" /></label>
      <button type="submit" className="h-10 rounded-md border px-4 text-sm font-medium hover:bg-muted">Search</button>
      <p className="w-full text-xs text-muted-foreground">{data.competitionSearch ? `Showing ${data.competitionOptions.length} of ${data.competitionTotal} competitions matching “${data.competitionSearch}”.` : `Showing the first ${data.competitionOptions.length} of ${data.competitionTotal} competitions. Search to find others.`}</p>
    </form> : null}
    <div className="grid gap-4 xl:grid-cols-3">
      <MutationForm compact title="Create competition season" description="Schedules an effective season under an existing competition." mutation={`mutation($competitionId:ID!,$key:String!,$name:String!,$startsAt:String!,$endsAt:String!){createCompetitionSeason(competitionId:$competitionId,key:$key,name:$name,startsAt:$startsAt,endsAt:$endsAt)}`} fields={[{ name: 'competitionId', label: 'Competition', type: 'select', options: data.competitionOptions, emptyOptionsMessage: data.competitionSearch ? "No competition matches this search." : undefined }, { name: 'key', label: 'Season key', defaultValue: '2026-27' }, { name: 'name', label: 'Season name', defaultValue: '2026 / 2027' }, { name: 'startsAt', label: 'Starts (ISO)', defaultValue: data.seasonStartsAt }, { name: 'endsAt', label: 'Ends (ISO)', defaultValue: data.seasonEndsAt }]} submitLabel="Create season" successMessage="Season created and audited." />
      <MutationForm compact title="Create venue" description="Retains country and event-local time-zone semantics." mutation={`mutation($key:String!,$name:String!,$countryCode:String!,$timezone:String!){createCatalogVenue(key:$key,name:$name,countryCode:$countryCode,timezone:$timezone)}`} fields={[{ name: 'key', label: 'Venue key', placeholder: 'e.g. wembley' }, { name: 'name', label: 'Venue name', placeholder: 'e.g. Wembley Stadium' }, { name: 'countryCode', label: 'Country code', placeholder: 'e.g. GB' }, { name: 'timezone', label: 'Time zone', defaultValue: 'UTC' }]} submitLabel="Create venue" successMessage="Venue created." />
      <MutationForm compact title="Create competitor" description="Provider aliases remain separate mappings, never display-name identity." mutation={`mutation($key:String!,$name:String!){createCatalogCompetitor(key:$key,name:$name)}`} fields={[{ name: 'key', label: 'Canonical key', placeholder: 'e.g. arsenal' }, { name: 'name', label: 'Competitor name', placeholder: 'e.g. Arsenal' }]} submitLabel="Create competitor" successMessage="Competitor created." />
    </div>
    {hasCompetitions ? <div id="create-event"><MutationForm title="Create event and initial market" description="Creates the event together with its first market and selections. The initial market is created without parameters; add a parameterised market (for example a line) from the event page." mutation={createMutation} fields={[
      { name: "competitionId", label: "Competition", type: "select", options: data.competitionOptions, emptyOptionsMessage: data.competitionSearch ? "No competition matches this search." : undefined },
      { name: "externalKey", label: "External reference", placeholder: "provider:event:2026-001" },
      { name: "name", label: "Event name", placeholder: "Home v Away" },
      { name: "startAt", label: `Scheduled start (${data.timeZone})`, type: "datetime-local", help: `Interpreted in the tenant timezone ${data.timeZone}, not your browser or the server. DST-gap times are rejected; repeated DST times need an explicit offset.` },
      { name: "marketDefinition", label: "Market type", type: "select", options: data.definitionOptions, emptyOptionsMessage: "No active market types. Activate a market definition in Configuration first." },
      { name: "selections", label: "Selections", type: "rows", minRows: 2, columns: [{ name: "key", label: "Key", placeholder: "home" }, { name: "label", label: "Name", placeholder: "Home" }], help: "At least two selections, each with a unique key." },
    ]} submitLabel="Create catalog event" successMessage="Event and initial market created." resultHref={`${basePath}/{id}`} disabledReason={data.canTrade ? undefined : "Your role does not include trading capability."} /></div> : <div className="rounded-xl border bg-card p-5"><p className="font-semibold">A competition is required</p><p className="mt-1 text-sm text-muted-foreground">Complete onboarding or create a competition before adding events.</p><Link href="/dashboard/platform/onboarding" className={`mt-3 ${linkClass}`}>Open onboarding</Link></div>}
  </>;
}
