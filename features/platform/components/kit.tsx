import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

/*
 * Sportsbook operator kit: the sports-page agate table. Square state marks,
 * underline tabs, square 4px buttons, tabular figures and one flash red for
 * live and suspended. Built on the dashboard's own tokens for light and dark.
 */

export type Tone = "live" | "ok" | "wait" | "info" | "alert" | "off";

const toneClass: Record<Tone, string> = {
  live: "bg-red-600",
  ok: "bg-emerald-500",
  wait: "bg-amber-500",
  info: "bg-blue-600 dark:bg-blue-500",
  alert: "bg-red-500",
  off: "bg-zinc-400 dark:bg-zinc-500",
};

/** Inline dot that sits on the title line, before the title text. */
export function StatusDot({ tone, className }: { tone: Tone; className?: string }) {
  return <span aria-hidden="true" className={cn("mr-2 inline-block size-2 shrink-0 rounded-[1px] align-[0.18em]", toneClass[tone], className)} />;
}

export function Track({ children, className, label, block = false }: { children: ReactNode; className?: string; label?: string; block?: boolean }) {
  return (
    <div
      role={label ? "group" : undefined}
      aria-label={label}
      className={cn(
        "max-w-full flex-wrap items-center gap-1.5 [&:has(>[aria-pressed])]:gap-0 [&:has(>[aria-pressed])]:border-b [&:has(>[aria-current])]:gap-0 [&:has(>[aria-current])]:border-b",
        block ? "flex w-full [&>*]:flex-1" : "inline-flex",
        className,
      )}
    >
      {children}
    </div>
  );
}

export type PillVariant = "raised" | "primary" | "flat" | "danger";

export function pillClass(variant: PillVariant = "raised", size: "sm" | "md" = "md") {
  return cn(
    "inline-flex min-w-0 items-center justify-center gap-1.5 whitespace-nowrap font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4 [&_svg]:shrink-0",
    variant === "flat" ? (size === "sm" ? "h-8 px-2.5 text-xs" : "h-9 px-3 text-sm") : cn("rounded-[4px] border", size === "sm" ? "h-7 px-2.5 text-xs" : "h-8 px-3 text-sm"),
    variant === "raised" && "border-border bg-background text-foreground hover:bg-muted",
    variant === "primary" && "border-foreground bg-foreground text-background hover:bg-foreground/85",
    variant === "danger" && "border-red-600/40 bg-background text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40",
    // Flat choices are underline tabs: the pressed or current one carries a 2px ink rule.
    variant === "flat" && "-mb-px border-b-2 border-transparent text-muted-foreground hover:text-foreground aria-pressed:border-foreground aria-pressed:text-foreground aria-[current=page]:border-foreground aria-[current=page]:text-foreground",
  );
}

export function Pill({ variant = "raised", size = "md", className, type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: PillVariant; size?: "sm" | "md" }) {
  return <button type={type} className={cn(pillClass(variant, size), className)} {...props} />;
}

export function PillLink({ href, variant = "raised", size = "md", className, children, current }: { href: string; variant?: PillVariant; size?: "sm" | "md"; className?: string; children: ReactNode; current?: boolean }) {
  return <Link href={href} aria-current={current ? "page" : undefined} className={cn(pillClass(variant, size), className)}>{children}</Link>;
}

/** Native select styled to match the shadcn Input. */
export const selectClass = "h-8 w-full min-w-0 rounded-[4px] border bg-background px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50";

/** Tabular figures for odds, money and counts (agate type, not a costume monospace). */
export function Mono({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("tabular-nums", className)}>{children}</span>;
}
