'use server';

import type { KeystoneResponse } from "@/features/dashboard/lib/keystoneClient";
import { platformRead } from "../../lib/graphql";

export type CatalogEventRecord = { id: string; name: string | null; externalKey: string | null; startAt: string | null; status: string | null; competition: { name: string | null } | null };
export type CatalogCompetitionRecord = { id: string; name: string | null; sport: { name: string | null } | null };
export type CatalogDefinitionRecord = { id: string; key: string | null; name: string | null; sportKey: string | null; version: number | null };

export type CatalogListResult = {
  events: CatalogEventRecord[];
  total: number;
  allEvents: number;
  markets: number;
  competitions: CatalogCompetitionRecord[];
  competitionTotal: number;
  allCompetitions: number;
  pendingMappings: number;
  definitions: CatalogDefinitionRecord[];
};

const eventStatuses = ["SCHEDULED", "LIVE", "ENDED", "CANCELLED", "SUSPENDED"] as const;
export type CatalogEventStatus = (typeof eventStatuses)[number];

/**
 * Event catalog through GraphQL: Event, Market, Competition, MarketDefinition and
 * ProviderEntityMapping are trading lists, tenant-filtered by Keystone access.
 * The competition picker is its own bounded, searchable query.
 */
export async function getCatalog({ page, pageSize, search, status, competitionSearch }: { page: number; pageSize: number; search?: string; status?: CatalogEventStatus; competitionSearch?: string }): Promise<KeystoneResponse<CatalogListResult>> {
  const where = {
    AND: [
      search ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { externalKey: { contains: search, mode: "insensitive" } }, { id: { equals: search } }] } : {},
      status && eventStatuses.includes(status) ? { status: { equals: status } } : {},
    ],
  };
  const competitionWhere = competitionSearch ? { OR: [{ name: { contains: competitionSearch, mode: "insensitive" } }, { id: { equals: competitionSearch } }] } : {};
  const response = await platformRead<{ events: CatalogEventRecord[]; eventsCount: number; allEvents: number; marketsCount: number; competitions: CatalogCompetitionRecord[]; competitionsCount: number; allCompetitions: number; pendingMappings: number; marketDefinitions: CatalogDefinitionRecord[] }>(`
    query CatalogEvents($where: EventWhereInput!, $take: Int!, $skip: Int!, $competitionWhere: CompetitionWhereInput!) {
      events(where: $where, orderBy: [{ startAt: asc }, { id: asc }], take: $take, skip: $skip) { id name externalKey startAt status competition { name } }
      eventsCount(where: $where)
      allEvents: eventsCount
      marketsCount
      competitions(where: $competitionWhere, orderBy: [{ name: asc }, { id: asc }], take: 50) { id name sport { name } }
      competitionsCount(where: $competitionWhere)
      allCompetitions: competitionsCount
      pendingMappings: providerEntityMappingsCount(where: { status: { equals: PENDING } })
      marketDefinitions(where: { status: { equals: ACTIVE } }, orderBy: [{ name: asc }, { version: desc }], take: 100) { id key name sportKey version }
    }
  `, { where, take: pageSize, skip: (page - 1) * pageSize, competitionWhere });
  if (!response.success) return response;
  return {
    success: true,
    data: {
      events: response.data.events,
      total: response.data.eventsCount,
      allEvents: response.data.allEvents,
      markets: response.data.marketsCount,
      competitions: response.data.competitions,
      competitionTotal: response.data.competitionsCount,
      allCompetitions: response.data.allCompetitions,
      pendingMappings: response.data.pendingMappings,
      definitions: response.data.marketDefinitions,
    },
  };
}
