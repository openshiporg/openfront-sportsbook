import Link from 'next/link'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

/*
 * Storefront kit: title-line status dots, raised pills in a recessed track,
 * mono readouts and ruled sections on the night price-board palette.
 */

export type Tone = 'live' | 'win' | 'wait' | 'alert' | 'info' | 'off'

const toneClass: Record<Tone, string> = {
  live: 'bg-sb-live shadow-[0_0_0_3px_rgb(229_72_77/0.2)]',
  win: 'bg-sb-win',
  wait: 'bg-sb-wait',
  alert: 'bg-sb-live',
  info: 'bg-sb-brand',
  off: 'bg-sb-mute/60',
}

/** Inline dot that sits on the title line, before the title text. */
export function Dot({ tone, className }: { tone: Tone; className?: string }) {
  return <span aria-hidden="true" className={cn('mr-2 inline-block size-2 shrink-0 rounded-full align-[0.2em]', tone === 'live' && 'motion-safe:animate-pulse', toneClass[tone], className)} />
}

/** Status values from the API, mapped to a dot tone. Unknown values are neutral, never "good". */
export function toneFor(status: string | null | undefined): Tone {
  const value = String(status ?? '').toUpperCase()
  if (['LIVE', 'IN_PLAY'].includes(value)) return 'live'
  if (['ACTIVE', 'APPROVED', 'ACCEPTED', 'OPEN', 'SUCCEEDED', 'SETTLED', 'ALLOW', 'COMPLETED', 'RESOLVED', 'CLAIMED', 'AWARDED', 'CASHED_OUT', 'ELIGIBLE', 'CURRENT', 'VERIFIED', 'WON', 'WIN'].includes(value)) return 'win'
  if (['PENDING', 'IN_PROGRESS', 'PROCESSING', 'VERIFYING', 'TRIAGED', 'WAITING_CUSTOMER', 'WAITING_OPERATOR', 'PARTIALLY_ACCEPTED', 'PARTIALLY_CASHED_OUT', 'GRADED', 'REQUESTED', 'SUSPENDED', 'REVIEW', 'EXPIRED'].includes(value)) return 'wait'
  if (['REJECTED', 'FAILED', 'DENY', 'DENIED', 'BLOCKED', 'RESTRICTED', 'LOST', 'LOSE', 'REVOKED'].includes(value)) return 'alert'
  return 'off'
}

export const label = (value: string | null | undefined) => {
  const text = String(value ?? '').replaceAll('_', ' ').toLowerCase()
  return text ? text[0].toUpperCase() + text.slice(1) : '—'
}

export function Track({ children, className, label: ariaLabel, block = false, dark = false }: { children: ReactNode; className?: string; label?: string; block?: boolean; dark?: boolean }) {
  return <div
    role={ariaLabel ? 'group' : undefined}
    aria-label={ariaLabel}
    className={cn(
      'max-w-full items-center gap-1 rounded-full p-1',
      dark ? 'bg-black/40 shadow-[inset_0_1px_2px_rgb(0_0_0/0.6)] ring-1 ring-inset ring-white/5' : 'bg-sb-well shadow-[inset_0_1px_2px_rgb(16_20_27/0.12)] ring-1 ring-inset ring-black/5',
      block ? 'flex w-full [&>*]:flex-1' : 'inline-flex',
      className,
    )}
  >{children}</div>
}

export type PillVariant = 'raised' | 'primary' | 'flat' | 'danger' | 'flatDark'

export function pillClass(variant: PillVariant = 'raised', size: 'sm' | 'md' | 'lg' = 'md') {
  return cn(
    'inline-flex min-w-0 select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-full font-semibold transition-[background-color,color,box-shadow,transform] duration-150 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
    size === 'sm' ? 'min-h-9 px-3.5 text-xs' : size === 'lg' ? 'min-h-12 px-6 text-sm' : 'min-h-10 px-4 text-sm',
    variant === 'raised' && 'bg-sb-card text-sb-ink shadow-[0_1px_2px_rgb(16_20_27/0.12)] ring-1 ring-black/5 hover:bg-white',
    variant === 'primary' && 'bg-sb-brand text-white shadow-[0_1px_2px_rgb(16_20_27/0.25),inset_0_1px_0_rgb(255_255_255/0.18)] hover:brightness-110',
    variant === 'danger' && 'bg-sb-card text-sb-live shadow-[0_1px_2px_rgb(16_20_27/0.12)] ring-1 ring-black/5 hover:bg-red-50',
    variant === 'flat' && 'text-sb-mute hover:text-sb-ink aria-pressed:bg-sb-card aria-pressed:text-sb-ink aria-pressed:shadow-[0_1px_2px_rgb(16_20_27/0.12)] aria-pressed:ring-1 aria-pressed:ring-black/5 aria-selected:bg-sb-card aria-selected:text-sb-ink aria-selected:shadow-[0_1px_2px_rgb(16_20_27/0.12)] aria-[current=page]:bg-sb-card aria-[current=page]:text-sb-ink aria-[current=page]:shadow-[0_1px_2px_rgb(16_20_27/0.12)]',
    variant === 'flatDark' && 'text-white/60 hover:text-white aria-pressed:bg-sb-rule aria-pressed:text-white aria-pressed:shadow-[0_1px_2px_rgb(0_0_0/0.5)] aria-[current=page]:bg-sb-rule aria-[current=page]:text-white',
  )
}

export function Pill({ variant = 'raised', size = 'md', className, type = 'button', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: PillVariant; size?: 'sm' | 'md' | 'lg' }) {
  return <button type={type} className={cn(pillClass(variant, size), className)} {...props} />
}

export function PillLink({ href, variant = 'raised', size = 'md', className, children, current }: { href: string; variant?: PillVariant; size?: 'sm' | 'md' | 'lg'; className?: string; children: ReactNode; current?: boolean }) {
  return <Link href={href} aria-current={current ? 'page' : undefined} className={cn(pillClass(variant, size), className)}>{children}</Link>
}

/** Page title in display type, with an optional status dot on the title line. */
export function PageTitle({ title, tone, meta, aside }: { title: ReactNode; tone?: Tone; meta?: ReactNode; aside?: ReactNode }) {
  return <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div className="min-w-0">
      <h1 className="break-words font-sb-display text-4xl font-bold uppercase leading-none tracking-tight text-sb-ink sm:text-5xl">{tone ? <Dot tone={tone} className="size-2.5 align-[0.35em]" /> : null}{title}</h1>
      {meta ? <p className="mt-2 font-sb-mono text-xs uppercase tracking-wider text-sb-mute">{meta}</p> : null}
    </div>
    {aside}
  </div>
}

/** Ruled section with a small-caps heading. */
export function Section({ title, tone, count, actions, children, id, className }: { title: ReactNode; tone?: Tone; count?: ReactNode; actions?: ReactNode; children: ReactNode; id?: string; className?: string }) {
  return <section aria-labelledby={id} className={cn('mt-8 min-w-0', className)}>
    <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-sb-ink pb-2">
      <h2 id={id} className="font-sb-display text-xl font-bold uppercase tracking-wide text-sb-ink">{tone ? <Dot tone={tone} /> : null}{title}{count !== undefined ? <span className="ml-2 font-sb-mono text-xs font-normal tabular-nums text-sb-mute">{count}</span> : null}</h2>
      {actions}
    </div>
    <div className="pt-4">{children}</div>
  </section>
}

/** Headline figures: a ruled strip of mono readouts. */
export function Readouts({ items, className }: { items: Array<{ label: string; value: ReactNode; tone?: Tone; sub?: ReactNode }>; className?: string }) {
  return <dl className={cn('grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-sb-line ring-1 ring-sb-line', items.length >= 4 ? 'lg:grid-cols-4' : items.length === 3 ? 'sm:grid-cols-3' : '', className)}>
    {items.map(item => <div key={item.label} className="min-w-0 bg-sb-card px-4 py-3.5">
      <dt className="truncate text-[11px] font-semibold uppercase tracking-wider text-sb-mute">{item.tone ? <Dot tone={item.tone} /> : null}{item.label}</dt>
      <dd className="mt-1 truncate font-sb-mono text-xl font-semibold tabular-nums text-sb-ink sm:text-2xl">{item.value}</dd>
      {item.sub ? <dd className="mt-0.5 truncate text-xs text-sb-mute">{item.sub}</dd> : null}
    </div>)}
  </dl>
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('min-w-0 rounded-2xl bg-sb-card ring-1 ring-sb-line', className)}>{children}</div>
}

export function Notice({ tone = 'status', children, className }: { tone?: 'status' | 'alert' | 'ok'; children: ReactNode; className?: string }) {
  return <div role={tone === 'alert' ? 'alert' : 'status'} className={cn('rounded-xl px-3.5 py-2.5 text-sm', tone === 'alert' ? 'bg-red-50 text-red-900 ring-1 ring-red-200' : tone === 'ok' ? 'bg-emerald-50 text-emerald-950 ring-1 ring-emerald-200' : 'bg-sb-well text-sb-ink', className)}>
    <Dot tone={tone === 'alert' ? 'alert' : tone === 'ok' ? 'win' : 'info'} />{children}
  </div>
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-2xl border border-dashed border-sb-line px-4 py-8 text-center text-sm text-sb-mute">{children}</p>
}

/** Key/value rows with mono values. */
export function Ledger({ rows, className }: { rows: Array<[ReactNode, ReactNode]>; className?: string }) {
  return <dl className={cn('divide-y divide-sb-line text-sm', className)}>
    {rows.map(([key, value], index) => <div key={index} className="flex min-w-0 items-baseline justify-between gap-4 py-2">
      <dt className="shrink-0 text-sb-mute">{key}</dt>
      <dd className="min-w-0 break-all text-right font-sb-mono tabular-nums text-sb-ink">{value}</dd>
    </div>)}
  </dl>
}

export const fieldClass = 'min-h-11 w-full min-w-0 rounded-xl border border-sb-line bg-sb-card px-3 text-sm text-sb-ink shadow-[inset_0_1px_1px_rgb(16_20_27/0.04)] placeholder:text-sb-mute/70 focus-visible:border-sb-brand disabled:opacity-60'
export const labelClass = 'grid min-w-0 gap-1.5 text-xs font-semibold uppercase tracking-wider text-sb-mute'
export const checkClass = 'mt-0.5 size-5 min-w-5 accent-[#155eef]'
