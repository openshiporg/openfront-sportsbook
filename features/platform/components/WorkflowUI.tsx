import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Circle, Search, Square, Triangle } from "lucide-react";
import { EmptyState as SharedEmptyState } from "@/components/ui/empty-state";
import { PillLink, StatusDot, Track, type Tone } from "./kit";

/** Headline figures: a ruled strip of mono readouts. `detail` is a short state, never an explanation. */
export function MetricGrid({ items }: { items: { label: string; value: ReactNode; detail?: ReactNode; tone?: Tone }[] }) {
  return <dl aria-label="Current totals" className={`grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-border ring-1 ring-border ${items.length >= 4 ? "xl:grid-cols-4" : items.length === 3 ? "sm:grid-cols-3" : ""}`}>
    {items.map((item) => <div key={item.label} className="min-w-0 bg-background px-4 py-3">
      <dt className="truncate text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{item.tone ? <StatusDot tone={item.tone} /> : null}{item.label}</dt>
      <dd className="mt-1 break-words font-mono text-xl font-semibold tabular-nums sm:text-2xl">{item.value}</dd>
      {item.detail ? <dd className="mt-0.5 truncate text-xs text-muted-foreground">{item.detail}</dd> : null}
    </div>)}
  </dl>;
}

export type RecordRow = { id: string; href?: string; cells: ReactNode[]; status?: string };

type StatusTone = "emerald" | "red" | "amber" | "blue" | "zinc";

// Exact enum value -> tone. Values not listed here render neutral so an unknown
// state is never presented as healthy or successful.
const statusTones: Record<StatusTone, readonly string[]> = {
  emerald: ["ACTIVE", "EFFECTIVE", "CURRENT", "APPROVED", "COMPLETED", "COMPLETE", "POSTED", "MATCHED", "ACCEPTED", "HEALTHY", "SUCCEEDED", "SETTLED", "RESOLVED", "CONFIRMED", "CERTIFIED", "CLEARED", "DELIVERED", "PASSED", "PASS", "CAPTURED", "APPLIED", "ENABLED", "READY", "GRADED", "AWARDED", "RELEASED", "BALANCED"],
  red: ["REJECTED", "FAILED", "FAIL", "DEAD", "DENY", "DENIED", "SUSPENDED", "SEV1", "SEV2", "VOID", "DOWN", "BLOCKED", "UNBALANCED", "UNHEALTHY", "CRITICAL", "EXPIRED", "REVOKED", "FROZEN", "PROHIBITED", "FORFEITED", "SHORTFALL", "GAPPED", "STALE", "DISPUTED"],
  amber: ["PENDING", "PENDING_APPROVAL", "REQUESTED", "IN_REVIEW", "IN_PROGRESS", "PROCESSING", "VERIFYING", "DEGRADED", "DELAYED", "ESCALATED", "INVESTIGATING", "TRIAGED", "WAITING_CUSTOMER", "WAITING_OPERATOR", "APPEALED", "PROPOSED_RESOLUTION", "MITIGATING", "PAUSED", "PARTIAL", "PROVISIONAL", "REQUIRED", "SEV3", "RESTRICTED", "REVIEW", "SUBMITTED", "GENERATING", "RUNNING", "UNMATCHED"],
  blue: ["OPEN", "OPENED", "SCHEDULED", "LIVE", "DRAFT", "SANDBOX", "REOPENED"],
  zinc: ["INACTIVE", "CLOSED", "DISABLED", "ENDED", "RETIRED", "SUPERSEDED", "CANCELLED", "WITHDRAWN", "UNKNOWN", "SEV4"],
};
const statusToneByValue = new Map<string, StatusTone>(Object.entries(statusTones).flatMap(([tone, values]) => values.map((value) => [value, tone as StatusTone] as const)));
const dotByStatusTone: Record<StatusTone, Tone> = { emerald: "ok", red: "alert", amber: "wait", blue: "info", zinc: "off" };

export function statusTone(value: string): StatusTone {
  const normalized = value.trim().toUpperCase();
  const exact = statusToneByValue.get(normalized);
  if (exact) return exact;
  // Composite labels such as APPROVAL_PENDING carry the state after a known prefix.
  const prefixed = /^APPROVAL_(.+)$/.exec(normalized);
  return (prefixed && statusToneByValue.get(prefixed[1])) || "zinc";
}

/** Dot tone for a stored status value; LIVE gets the pulsing live dot. */
export function statusDotTone(value: string | null | undefined): Tone {
  const label = (value || "UNKNOWN").trim().toUpperCase();
  return label === "LIVE" || label === "IN_PLAY" ? "live" : dotByStatusTone[statusTone(label)];
}

export function StatusBadge({ value }: { value: string | null | undefined }) {
  const label = value || "UNKNOWN";
  return <span title={label} className="inline-flex items-center whitespace-nowrap text-xs font-medium text-foreground"><StatusDot tone={statusDotTone(label)} className="mr-1.5 size-1.5 align-middle" />{label.replaceAll("_", " ").toLowerCase()}</span>;
}

export type RecordListPagination = { page: number; pageSize: number; total: number; hrefForPage: (page: number) => string };

export function RecordList({ title, description, columns, rows, emptyTitle, emptyDescription, action, emptyAction, filtered = false, pagination, tone }: { title: string; description?: ReactNode; columns: string[]; rows: RecordRow[]; emptyTitle: string; emptyDescription?: string; action?: ReactNode; emptyAction?: ReactNode; filtered?: boolean; pagination?: RecordListPagination; tone?: Tone }) {
  const pageCount = pagination ? Math.max(1, Math.ceil(pagination.total / pagination.pageSize)) : 1;
  const count = pagination ? pagination.total : rows.length;
  return <section className="min-w-0 overflow-hidden rounded-xl border bg-card text-card-foreground">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
      <div className="min-w-0"><h2 className="text-sm font-semibold">{tone ? <StatusDot tone={tone} /> : null}{title}<span className="ml-2 font-mono text-xs font-normal tabular-nums text-muted-foreground">{count}</span></h2>{description ? <p className="mt-0.5 text-xs text-muted-foreground">{description}</p> : null}</div>
      {action}
    </div>
    {rows.length === 0 ? <EmptyState variant={filtered ? "search" : "empty"} title={emptyTitle} description={emptyDescription} action={emptyAction} /> : <>
      <div className="hidden md:block"><table className="w-full table-fixed text-left text-sm"><thead className="text-[11px] uppercase tracking-wider text-muted-foreground"><tr className="border-b">{columns.map((column) => <th key={column} scope="col" className="px-4 py-2 font-medium">{column}</th>)}<th scope="col" className="w-14 px-4 py-2"><span className="sr-only">Details</span></th></tr></thead>
        <tbody className="divide-y">{rows.map((row) => <tr key={row.id} className="align-top transition-colors hover:bg-muted/40">{row.cells.map((cell, index) => <td key={index} className={`break-words px-4 py-3 ${index === 0 ? "font-medium" : "text-muted-foreground"}`}>{index === 0 && row.status ? <StatusDot tone={statusDotTone(row.status)} /> : null}{cell}</td>)}<td className="px-4 py-2">{row.href ? <Link href={row.href} aria-label={`Open details for ${row.id}`} className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"><ArrowRight className="h-4 w-4" aria-hidden="true" /></Link> : null}</td></tr>)}</tbody></table></div>
      <div className="divide-y md:hidden">{rows.map((row) => <article key={row.id} className="space-y-1.5 px-4 py-3">
        {row.cells.map((cell, index) => index === 0
          ? <div key={index} className="flex min-w-0 items-start justify-between gap-3"><div className="min-w-0 break-words font-medium">{row.status ? <StatusDot tone={statusDotTone(row.status)} /> : null}{cell}</div>{row.href ? <Link href={row.href} aria-label={`Open details for ${row.id}`} className="-mr-1 inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"><ArrowRight className="h-4 w-4" aria-hidden="true" /></Link> : null}</div>
          : <div key={index} className="flex min-w-0 items-baseline justify-between gap-3 text-sm"><p className="shrink-0 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{columns[index]}</p><div className="min-w-0 break-words text-right text-foreground/80">{cell}</div></div>)}
      </article>)}</div>
      {pagination && pageCount > 1 ? <nav aria-label={`${title} pages`} className="flex items-center justify-between gap-3 border-t px-4 py-2.5">
        <Track>
          {pagination.page > 1 ? <PillLink size="sm" href={pagination.hrefForPage(pagination.page - 1)}>Previous</PillLink> : <span aria-disabled="true" className="inline-flex h-8 items-center px-3 text-xs text-muted-foreground/60">Previous</span>}
          {pagination.page < pageCount ? <PillLink size="sm" href={pagination.hrefForPage(pagination.page + 1)}>Next</PillLink> : <span aria-disabled="true" className="inline-flex h-8 items-center px-3 text-xs text-muted-foreground/60">Next</span>}
        </Track>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">{pagination.page} / {pageCount}</span>
      </nav> : null}
    </>}
  </section>;
}

/** Collection empty state built on the shared dashboard EmptyState ("empty" = no records, "search" = no results for the current filter). */
export function EmptyState({ title, description, action, variant = "empty" }: { title: string; description?: string; action?: ReactNode; variant?: "empty" | "search" }) {
  return <div role="status"><SharedEmptyState title={title} description={description ?? ""} icons={variant === "search" ? [Search] : [Triangle, Square, Circle]} />{action ? <div className="-mt-10 flex justify-center pb-10">{action}</div> : null}</div>;
}

/** One-line state: a dot on the title line, with optional short detail. */
export function WorkflowNote({ title, children, tone = "neutral" }: { title: string; children?: ReactNode; tone?: "neutral" | "warning" }) {
  const warning = tone === "warning";
  return <aside role="status" className={`rounded-xl px-4 py-3 text-sm ${warning ? "bg-amber-50 text-amber-950 ring-1 ring-amber-200 dark:bg-amber-950/30 dark:text-amber-100 dark:ring-amber-900/50" : "bg-muted/60 text-foreground"}`}>
    <h2 className="font-medium"><StatusDot tone={warning ? "wait" : "off"} />{title}</h2>
    {children ? <div className="mt-0.5 pl-4 text-xs leading-5 opacity-80">{children}</div> : null}
  </aside>;
}

export function DetailGrid({ items }: { items: { label: string; value: ReactNode }[] }) {
  // Columns follow the item count so the last row never leaves an empty filler cell.
  const columns = items.length === 3 ? "sm:grid-cols-3" : items.length % 6 === 0 ? "sm:grid-cols-2 xl:grid-cols-3" : items.length % 4 === 0 ? "sm:grid-cols-2 xl:grid-cols-4" : items.length % 2 === 0 ? "sm:grid-cols-2" : items.length === 1 ? "" : "sm:grid-cols-2 xl:grid-cols-3";
  return <dl className={`grid gap-px overflow-hidden rounded-xl border bg-border ${columns}`}>{items.map((item) => <div key={item.label} className="min-w-0 bg-card px-4 py-3"><dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{item.label}</dt><dd className="mt-1 break-words text-sm text-foreground">{item.value}</dd></div>)}</dl>;
}
