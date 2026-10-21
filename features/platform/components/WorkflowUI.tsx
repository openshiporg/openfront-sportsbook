import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Circle, Search, Square, Triangle, TriangleAlert } from "lucide-react";
import { EmptyState as SharedEmptyState } from "@/components/ui/empty-state";
import { coloredBadgeVariants } from "@/components/ui/badge";

export function MetricGrid({ items }: { items: { label: string; value: ReactNode; detail: string }[] }) {
  return <section aria-label="Current totals" className="grid grid-cols-2 gap-3 xl:grid-cols-4">{items.map((item) => <article key={item.label} className="rounded-xl border bg-card p-4 text-card-foreground shadow-sm"><p className="text-xs font-medium text-muted-foreground">{item.label}</p><p className="mt-2 text-xl font-semibold tabular-nums md:text-2xl">{item.value}</p><p className="mt-1 text-xs text-muted-foreground">{item.detail}</p></article>)}</section>;
}

export type RecordRow = { id: string; href?: string; cells: ReactNode[]; status?: string };

type StatusTone = "emerald" | "red" | "amber" | "blue" | "zinc";

// Exact enum value -> tone. Values not listed here render neutral so an unknown
// state is never presented as healthy or successful.
const statusTones: Record<StatusTone, readonly string[]> = {
  emerald: ["ACTIVE", "APPROVED", "COMPLETED", "COMPLETE", "POSTED", "MATCHED", "ACCEPTED", "HEALTHY", "SUCCEEDED", "SETTLED", "RESOLVED", "CONFIRMED", "CERTIFIED", "CLEARED", "DELIVERED", "PASSED", "PASS", "CAPTURED", "APPLIED", "ENABLED", "READY", "GRADED", "AWARDED", "RELEASED", "BALANCED"],
  red: ["REJECTED", "FAILED", "FAIL", "DEAD", "DENY", "DENIED", "SUSPENDED", "SEV1", "SEV2", "VOID", "DOWN", "BLOCKED", "UNBALANCED", "UNHEALTHY", "CRITICAL", "EXPIRED", "REVOKED", "FROZEN", "PROHIBITED", "FORFEITED", "SHORTFALL", "GAPPED", "STALE", "DISPUTED"],
  amber: ["PENDING", "PENDING_APPROVAL", "REQUESTED", "IN_REVIEW", "IN_PROGRESS", "PROCESSING", "VERIFYING", "DEGRADED", "DELAYED", "ESCALATED", "INVESTIGATING", "TRIAGED", "WAITING_CUSTOMER", "WAITING_OPERATOR", "APPEALED", "PROPOSED_RESOLUTION", "MITIGATING", "PAUSED", "PARTIAL", "PROVISIONAL", "REQUIRED", "SEV3", "RESTRICTED", "REVIEW", "SUBMITTED", "GENERATING", "RUNNING", "UNMATCHED"],
  blue: ["OPEN", "OPENED", "SCHEDULED", "LIVE", "DRAFT", "SANDBOX", "REOPENED"],
  zinc: ["INACTIVE", "CLOSED", "DISABLED", "ENDED", "RETIRED", "SUPERSEDED", "CANCELLED", "WITHDRAWN", "UNKNOWN", "SEV4"],
};
const statusToneByValue = new Map<string, StatusTone>(Object.entries(statusTones).flatMap(([tone, values]) => values.map((value) => [value, tone as StatusTone] as const)));

export function statusTone(value: string): StatusTone {
  const normalized = value.trim().toUpperCase();
  const exact = statusToneByValue.get(normalized);
  if (exact) return exact;
  // Composite labels such as APPROVAL_PENDING carry the state after a known prefix.
  const prefixed = /^APPROVAL_(.+)$/.exec(normalized);
  return (prefixed && statusToneByValue.get(prefixed[1])) || "zinc";
}

export function StatusBadge({ value }: { value: string | null | undefined }) {
  const label = value || "UNKNOWN";
  return <span title={label} className={coloredBadgeVariants({ color: statusTone(label) })}>{label.replaceAll("_", " ")}</span>;
}

export type RecordListPagination = { page: number; pageSize: number; total: number; hrefForPage: (page: number) => string };

export function RecordList({ title, description, columns, rows, emptyTitle, emptyDescription, action, emptyAction, filtered = false, pagination }: { title: string; description: string; columns: string[]; rows: RecordRow[]; emptyTitle: string; emptyDescription: string; action?: ReactNode; emptyAction?: ReactNode; filtered?: boolean; pagination?: RecordListPagination }) {
  const pageCount = pagination ? Math.max(1, Math.ceil(pagination.total / pagination.pageSize)) : 1;
  return <section className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3 border-b px-4 py-4"><div><h2 className="font-semibold">{title}</h2><p className="mt-1 text-xs text-muted-foreground">{description}</p></div>{action}</div>{rows.length === 0 ? <EmptyState variant={filtered ? "search" : "empty"} title={emptyTitle} description={emptyDescription} action={emptyAction} /> : <><div className="hidden md:block"><table className="w-full table-fixed text-left text-sm"><thead className="bg-muted/50 text-xs text-muted-foreground"><tr>{columns.map((column) => <th key={column} scope="col" className="px-4 py-3 font-medium">{column}</th>)}<th scope="col" className="w-16 px-4 py-3"><span className="sr-only">Details</span></th></tr></thead><tbody>{rows.map((row) => <tr key={row.id} className="border-t align-top">{row.cells.map((cell, index) => <td key={index} className={`break-words px-4 py-4 ${index === 0 ? "font-medium" : "text-muted-foreground"}`}>{cell}</td>)}<td className="px-4 py-3">{row.href ? <Link href={row.href} aria-label={`Open details for ${row.id}`} className="inline-flex rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"><ArrowRight className="h-4 w-4" aria-hidden="true" /></Link> : null}</td></tr>)}</tbody></table></div><div className="divide-y md:hidden">{rows.map((row) => <article key={row.id} className="space-y-3 p-4">{row.cells.map((cell, index) => <div key={index} className="grid grid-cols-[7rem_minmax(0,1fr)] gap-3 text-sm"><p className="text-xs font-medium text-muted-foreground">{columns[index]}</p><div className={index === 0 ? "break-words font-medium" : "break-words text-foreground/80"}>{cell}</div></div>)}{row.href ? <Link href={row.href} className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted">View details <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link> : null}</article>)}</div>{pagination && pageCount > 1 ? <nav aria-label={`${title} pages`} className="flex items-center justify-between gap-3 border-t px-4 py-3 text-sm"><p className="text-muted-foreground">Page {pagination.page} of {pageCount} · {pagination.total} records</p><div className="flex gap-2">{pagination.page > 1 ? <Link href={pagination.hrefForPage(pagination.page - 1)} className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 hover:bg-muted"><ChevronLeft className="h-4 w-4" aria-hidden="true" />Previous</Link> : null}{pagination.page < pageCount ? <Link href={pagination.hrefForPage(pagination.page + 1)} className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 hover:bg-muted">Next<ChevronRight className="h-4 w-4" aria-hidden="true" /></Link> : null}</div></nav> : null}</>}</section>;
}

/** Collection empty state built on the shared dashboard EmptyState ("empty" = no records, "search" = no results for the current filter). */
export function EmptyState({ title, description, action, variant = "empty" }: { title: string; description: string; action?: ReactNode; variant?: "empty" | "search" }) {
  return <div role="status"><SharedEmptyState title={title} description={description} icons={variant === "search" ? [Search] : [Triangle, Square, Circle]} />{action ? <div className="-mt-10 flex justify-center pb-10">{action}</div> : null}</div>;
}

export function WorkflowNote({ title, children, tone = "neutral" }: { title: string; children: ReactNode; tone?: "neutral" | "warning" }) {
  const warning = tone === "warning";
  return <aside className={`rounded-xl border p-4 ${warning ? "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100" : "bg-card text-card-foreground"}`}><div className="flex gap-3">{warning ? <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> : null}<div><h2 className="text-sm font-semibold">{title}</h2><div className="mt-1 text-sm leading-6 opacity-80">{children}</div></div></div></aside>;
}

export function DetailGrid({ items }: { items: { label: string; value: ReactNode }[] }) {
  return <dl className="grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2 xl:grid-cols-3">{items.map((item) => <div key={item.label} className="min-w-0 bg-card p-4"><dt className="text-xs font-medium text-muted-foreground">{item.label}</dt><dd className="mt-1 break-words text-sm text-foreground">{item.value}</dd></div>)}</dl>;
}
