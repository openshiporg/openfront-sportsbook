import Link from "next/link";
import { OperatorShell, TenantRequired } from "../components/OperatorShell";
import { Mono, PillLink, Track } from "../components/kit";
import { MetricGrid, RecordList, StatusBadge } from "../components/WorkflowUI";
import { dateTime } from "../lib/format";
import { getOperatorContext, platformPrisma as prisma } from "../lib/operator";
import { allowedParam, hrefWith, pageFrom, PLATFORM_PAGE_SIZE, type PlatformSearchParams } from "../lib/paging";

const basePath = "/dashboard/platform/notifications";
const channels = ["EMAIL", "SMS", "PUSH", "IN_APP", "WEBHOOK"] as const;
const channelLabels: Record<(typeof channels)[number], string> = { EMAIL: "Email", SMS: "SMS", PUSH: "Push", IN_APP: "In-app", WEBHOOK: "Webhook" };
const statuses = ["failed", "pending", "sent", "delivered", "suppressed", "all"] as const;
type StatusTrack = (typeof statuses)[number];
const statusLabels: Record<StatusTrack, string> = { failed: "Failed", pending: "Pending", sent: "Sent", delivered: "Delivered", suppressed: "Suppressed", all: "All" };
// Ordered status segments per track; with "all", failed and pending page first.
const segmentsFor: Record<StatusTrack, string[][]> = {
  failed: [["FAILED"]],
  pending: [["PENDING"]],
  sent: [["SENT"]],
  delivered: [["DELIVERED"]],
  suppressed: [["SUPPRESSED"]],
  all: [["FAILED"], ["PENDING"], ["SENT", "DELIVERED", "SUPPRESSED"]],
};
// The payload may carry personal data and is never selected.
const rowSelect = { id: true, playerId: true, userId: true, channel: true, templateKey: true, templateVersion: true, locale: true, status: true, externalReference: true, sentAt: true, createdAt: true, player: { select: { id: true, subject: true } }, user: { select: { id: true, name: true } } };

/** Outbound message log: what was sent and what failed, failed first. */
export async function NotificationsScreen({ searchParams }: { searchParams?: PlatformSearchParams } = {}) {
  const params = (await searchParams) ?? {};
  const page = pageFrom(params);
  const channel = allowedParam(params, "channel", channels);
  const status: StatusTrack = allowedParam(params, "status", statuses) ?? "failed";
  const operator = await getOperatorContext("canManageSportsbook");
  if (!operator) return <OperatorShell active="Notifications" title="Notifications"><TenantRequired /></OperatorShell>;
  const tenantId = operator.tenantId;
  const now = new Date();
  const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const scope = { tenantId, ...(channel ? { channel } : {}) };
  const segments = segmentsFor[status];

  const [failed, pending, sentDay, ...segmentCounts] = await Promise.all([
    prisma.notification.count({ where: { ...scope, status: "FAILED" } }),
    prisma.notification.count({ where: { ...scope, status: "PENDING" } }),
    prisma.notification.count({ where: { ...scope, status: { in: ["SENT", "DELIVERED"] }, sentAt: { gte: since } } }),
    ...segments.map((values) => prisma.notification.count({ where: { ...scope, status: { in: values } } })),
  ]);
  const counts = segmentCounts as number[];
  const total = counts.reduce((sum, value) => sum + value, 0);

  let skip = (page - 1) * PLATFORM_PAGE_SIZE;
  let remaining = PLATFORM_PAGE_SIZE;
  const reads: Promise<any[]>[] = [];
  segments.forEach((values, index) => {
    if (remaining <= 0) return;
    if (skip >= counts[index]) { skip -= counts[index]; return; }
    const take = Math.min(remaining, counts[index] - skip);
    reads.push(prisma.notification.findMany({ where: { ...scope, status: { in: values } }, orderBy: [{ createdAt: "desc" }, { id: "desc" }], skip, take, select: rowSelect }));
    remaining -= take;
    skip = 0;
  });
  const rows = (await Promise.all(reads)).flat();

  const tone = failed ? "alert" : pending ? "wait" : "ok";
  const linkClass = "underline underline-offset-2 hover:text-foreground";
  const href = (next: { channel?: string; status?: StatusTrack; page?: number }) => hrefWith(basePath, { channel: next.channel, status: next.status === "failed" ? undefined : next.status, page: next.page });

  return <OperatorShell
    active="Notifications"
    title="Notifications"
    tenantName={operator.tenantName}
    tone={tone}
    meta={`${failed} failed · ${pending} pending · ${sentDay} sent 24h${channel ? ` · ${channelLabels[channel].toLowerCase()}` : ""}`}
  >
    <Track label="Filter by channel" className="rounded-2xl">
      <PillLink size="sm" variant="flat" href={href({ status })} current={!channel}>All</PillLink>
      {channels.map((value) => <PillLink key={value} size="sm" variant="flat" href={href({ channel: value, status })} current={channel === value}>{channelLabels[value]}</PillLink>)}
    </Track>
    <MetricGrid items={[
      { label: "Failed", value: failed, tone: failed ? "alert" : "ok" },
      { label: "Pending", value: pending, tone: pending ? "wait" : undefined },
      { label: "Sent 24h", value: sentDay, detail: "sent or delivered" },
    ]} />
    <RecordList
      title={`${statusLabels[status]} notifications`}
      tone={status === "failed" && failed ? "alert" : undefined}
      action={<Track label="Filter by state" className="rounded-2xl">{statuses.map((value) => <PillLink key={value} size="sm" variant="flat" href={href({ channel, status: value })} current={value === status}>{statusLabels[value]}</PillLink>)}</Track>}
      columns={["Recipient", "Template", "Channel · locale", "State", "Sent", "Reference"]}
      rows={rows.map((item: any) => ({
        id: item.id,
        status: item.status,
        cells: [
          item.playerId
            ? <Link key="recipient" className={`break-all ${linkClass}`} href={`/dashboard/platform/customers/${item.playerId}`}>{item.player?.subject || "Player"}</Link>
            : item.userId ? <span key="recipient" className="break-all">{item.user?.name || "Staff"}</span> : "No recipient",
          <span key="template" className="break-all"><Mono className="text-xs">{item.templateKey || "—"}</Mono>{item.templateVersion ? <Mono className="text-xs text-muted-foreground"> v{item.templateVersion}</Mono> : null}</span>,
          <span key="channel">{item.channel ? channelLabels[item.channel as (typeof channels)[number]] ?? item.channel : "—"}{item.locale ? <Mono className="text-xs text-muted-foreground"> · {item.locale}</Mono> : null}</span>,
          <StatusBadge key="state" value={item.status} />,
          <Mono key="sent" className="text-xs">{dateTime(item.sentAt)}</Mono>,
          item.externalReference ? <Mono key="reference" className="break-all text-xs">{item.externalReference}</Mono> : "—",
        ],
      }))}
      emptyTitle={status === "all" ? "No notifications" : `No ${statusLabels[status].toLowerCase()} notifications`}
      filtered={status !== "all" || Boolean(channel)}
      pagination={{ page, pageSize: PLATFORM_PAGE_SIZE, total, hrefForPage: (next) => href({ channel, status, page: next }) }}
    />
  </OperatorShell>;
}
