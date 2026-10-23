import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

/*
 * Sportsbook operator kit: title-line status dots, raised pills in a recessed
 * track and mono readouts. Built on the dashboard's own tokens so it follows
 * the shared shell in light and dark.
 */

export type Tone = "live" | "ok" | "wait" | "info" | "alert" | "off";

const toneClass: Record<Tone, string> = {
  live: "bg-red-500 shadow-[0_0_0_3px_rgb(239_68_68/0.18)]",
  ok: "bg-emerald-500",
  wait: "bg-amber-500",
  info: "bg-blue-600 dark:bg-blue-500",
  alert: "bg-red-500",
  off: "bg-zinc-400 dark:bg-zinc-500",
};

/** Inline dot that sits on the title line, before the title text. */
export function StatusDot({ tone, className }: { tone: Tone; className?: string }) {
  return <span aria-hidden="true" className={cn("mr-2 inline-block size-2 shrink-0 rounded-full align-[0.18em]", toneClass[tone], className)} />;
}

export function Track({ children, className, label, block = false }: { children: ReactNode; className?: string; label?: string; block?: boolean }) {
  return (
    <div
      role={label ? "group" : undefined}
      aria-label={label}
      className={cn(
        "max-w-full flex-wrap items-center gap-1 rounded-full bg-muted p-1 shadow-[inset_0_1px_2px_rgb(0_0_0/0.08)] ring-1 ring-inset ring-black/5 dark:bg-zinc-900 dark:shadow-[inset_0_1px_2px_rgb(0_0_0/0.5)] dark:ring-white/5",
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
    "inline-flex min-w-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full font-medium transition-[background-color,color,box-shadow,transform] active:translate-y-px disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4 [&_svg]:shrink-0",
    size === "sm" ? "h-8 px-3 text-xs" : "h-9 px-4 text-sm",
    variant === "raised" && "bg-background text-foreground shadow-sm ring-1 ring-black/5 hover:bg-accent dark:bg-zinc-800 dark:ring-white/10 dark:hover:bg-zinc-700",
    variant === "primary" && "bg-foreground text-background shadow-sm hover:bg-foreground/85",
    variant === "danger" && "bg-background text-red-600 shadow-sm ring-1 ring-black/5 hover:bg-red-50 dark:bg-zinc-800 dark:text-red-400 dark:ring-white/10 dark:hover:bg-red-950/40",
    variant === "flat" && "text-muted-foreground hover:text-foreground aria-pressed:bg-background aria-pressed:text-foreground aria-pressed:shadow-sm aria-pressed:ring-1 aria-pressed:ring-black/5 aria-[current=page]:bg-background aria-[current=page]:text-foreground aria-[current=page]:shadow-sm aria-[current=page]:ring-1 aria-[current=page]:ring-black/5 dark:aria-pressed:bg-zinc-800 dark:aria-[current=page]:bg-zinc-800",
  );
}

export function Pill({ variant = "raised", size = "md", className, type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: PillVariant; size?: "sm" | "md" }) {
  return <button type={type} className={cn(pillClass(variant, size), className)} {...props} />;
}

export function PillLink({ href, variant = "raised", size = "md", className, children, current }: { href: string; variant?: PillVariant; size?: "sm" | "md"; className?: string; children: ReactNode; current?: boolean }) {
  return <Link href={href} aria-current={current ? "page" : undefined} className={cn(pillClass(variant, size), className)}>{children}</Link>;
}

/** Native select styled to match the shadcn Input. */
export const selectClass = "h-9 w-full min-w-0 rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50";

/** Mono numerals for odds, money and counts. */
export function Mono({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("font-mono tabular-nums", className)}>{children}</span>;
}
