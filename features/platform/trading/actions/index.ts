'use server';

import type { KeystoneResponse } from "@/features/dashboard/lib/keystoneClient";
import { platformRead } from "../../lib/graphql";

export type TradingMarketRecord = {
  id: string;
  definitionKey: string | null;
  status: string | null;
  tradingMode: string | null;
  event: { id: string; name: string | null } | null;
};

export type TradingOverrideTarget = { id: string; definitionKey: string | null; status: string | null; event: { name: string | null } | null };

export type TradingListResult = {
  markets: TradingMarketRecord[];
  total: number;
  allMarkets: number;
  live: number;
  suspended: number;
  priceSnapshots: number;
  feedExceptions: number;
  activeOverrides: number;
  overrideTargets: TradingOverrideTarget[];
};

const marketStatuses = ["OPEN", "SUSPENDED", "CLOSED", "GRADED"] as const;
export type TradingMarketStatus = (typeof marketStatuses)[number];

/**
 * Market rows and counts through GraphQL (per-market selection/price summaries and the
 * unpriced-selection count are exact server-side aggregates, lib/aggregates.ts): Market, Selection, PriceSnapshot, TraderOverride are
 * trading lists and FeedHealthSnapshot an integrations list; Keystone applies the
 * operator's list access and tenant filter to each.
 */
export async function getTradingBook({ page, pageSize, search, status, now }: { page: number; pageSize: number; search?: string; status?: TradingMarketStatus; now: string }): Promise<KeystoneResponse<TradingListResult>> {
  const where = {
    AND: [
      search ? { OR: [{ definitionKey: { contains: search, mode: "insensitive" } }, { event: { name: { contains: search, mode: "insensitive" } } }, { id: { equals: search } }] } : {},
      status && marketStatuses.includes(status) ? { status: { equals: status } } : {},
    ],
  };
  const list = await platformRead<{ markets: TradingMarketRecord[]; marketsCount: number; allMarkets: number; live: number; suspended: number; priceSnapshotsCount: number; feedHealthSnapshots: { status: string | null }[]; activeOverrides: number; overrideTargets: TradingOverrideTarget[] }>(`
    query TradingBook($where: MarketWhereInput!, $take: Int!, $skip: Int!, $now: DateTime!) {
      markets(where: $where, orderBy: [{ updatedAt: desc }, { id: desc }], take: $take, skip: $skip) { id definitionKey status tradingMode event { id name } }
      marketsCount(where: $where)
      allMarkets: marketsCount
      live: marketsCount(where: { tradingMode: { equals: LIVE } })
      suspended: marketsCount(where: { status: { equals: SUSPENDED } })
      priceSnapshotsCount
      feedHealthSnapshots(orderBy: [{ checkedAt: desc }, { id: desc }], take: 100) { status }
      activeOverrides: traderOverridesCount(where: { status: { equals: ACTIVE }, expiresAt: { gt: $now } })
      overrideTargets: markets(orderBy: [{ updatedAt: desc }, { id: desc }], take: 100) { id definitionKey status event { name } }
    }
  `, { where, take: pageSize, skip: (page - 1) * pageSize, now });
  if (!list.success) return list;
  return {
    success: true,
    data: {
      markets: list.data.markets,
      total: list.data.marketsCount,
      allMarkets: list.data.allMarkets,
      live: list.data.live,
      suspended: list.data.suspended,
      priceSnapshots: list.data.priceSnapshotsCount,
      feedExceptions: list.data.feedHealthSnapshots.filter((item) => ["STALE", "GAPPED", "DOWN"].includes(String(item.status))).length,
      activeOverrides: list.data.activeOverrides,
      overrideTargets: list.data.overrideTargets,
    },
  };
}
