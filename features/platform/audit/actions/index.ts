'use server';

import type { KeystoneResponse } from "@/features/dashboard/lib/keystoneClient";
import { platformRead } from "../../lib/graphql";

/* AuditEvent is a canReadAudit list; Keystone applies the tenant filter. */

export type AuditEventRecord = { id: string; actorId: string | null; action: string | null; targetType: string | null; targetId: string | null; reason: string | null; payloadHash: string | null; previousHash: string | null; hash: string | null; createdAt: string | null };

const eventFields = "id actorId action targetType targetId reason payloadHash previousHash hash createdAt";
const WORKER = "sportsbook-worker";

export async function getAuditEvents({ page, pageSize }: { page: number; pageSize: number }): Promise<KeystoneResponse<{ events: AuditEventRecord[]; total: number; operatorEvents: number; workerEvents: number; resolvedOutside: string[] }>> {
  const response = await platformRead<{ auditEvents: AuditEventRecord[]; total: number; operatorEvents: number; workerEvents: number }>(`
    query AuditEvents($take: Int!, $skip: Int!, $worker: String!) {
      auditEvents(orderBy: [{ createdAt: desc }, { id: desc }], take: $take, skip: $skip) { ${eventFields} }
      total: auditEventsCount
      operatorEvents: auditEventsCount(where: { actorId: { not: { equals: $worker } } })
      workerEvents: auditEventsCount(where: { actorId: { equals: $worker } })
    }
  `, { take: pageSize, skip: (page - 1) * pageSize, worker: WORKER });
  if (!response.success) return response;
  // Predecessors outside the loaded page are looked up before a link counts as missing.
  const loaded = new Set(response.data.auditEvents.map((event) => event.hash));
  const outside = [...new Set(response.data.auditEvents.map((event) => event.previousHash).filter((hash): hash is string => Boolean(hash) && !loaded.has(hash)))];
  let resolvedOutside: string[] = [];
  if (outside.length) {
    const found = await platformRead<{ auditEvents: { hash: string | null }[] }>(`
      query AuditPredecessors($hashes: [String!]!, $take: Int!) { auditEvents(where: { hash: { in: $hashes } }, take: $take) { hash } }
    `, { hashes: outside, take: Math.min(100, outside.length) });
    if (!found.success) return found;
    resolvedOutside = found.data.auditEvents.map((event) => event.hash).filter((hash): hash is string => Boolean(hash));
  }
  return { success: true, data: { events: response.data.auditEvents, total: response.data.total, operatorEvents: response.data.operatorEvents, workerEvents: response.data.workerEvents, resolvedOutside } };
}

export async function getAuditEvent(auditId: string): Promise<KeystoneResponse<{ event: AuditEventRecord | null; previous: { id: string } | null; next: { id: string } | null }>> {
  const response = await platformRead<{ auditEvent: AuditEventRecord | null }>(`query AuditEvent($id: ID!) { auditEvent(where: { id: $id }) { ${eventFields} } }`, { id: auditId });
  if (!response.success) return response;
  const event = response.data.auditEvent;
  if (!event) return { success: true, data: { event: null, previous: null, next: null } };
  const links = await platformRead<{ previous?: { id: string }[]; next?: { id: string }[] }>(`
    query AuditNeighbours($previousHash: String!, $hash: String!, $hasPrevious: Boolean!, $hasHash: Boolean!) {
      previous: auditEvents(where: { hash: { equals: $previousHash } }, take: 1) @include(if: $hasPrevious) { id }
      next: auditEvents(where: { previousHash: { equals: $hash } }, orderBy: [{ createdAt: asc }, { id: asc }], take: 1) @include(if: $hasHash) { id }
    }
  `, { previousHash: event.previousHash ?? "", hash: event.hash ?? "", hasPrevious: Boolean(event.previousHash), hasHash: Boolean(event.hash) });
  if (!links.success) return links;
  return { success: true, data: { event, previous: links.data.previous?.[0] ?? null, next: links.data.next?.[0] ?? null } };
}
