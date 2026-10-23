'use client';

import { FormEvent, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUnsavedChangesGuard } from "./useUnsavedChangesGuard";
import { Pill, StatusDot, Track } from "./kit";

export type MutationFieldColumn = { name: string; label: string; placeholder?: string };

export type MutationField = {
  name: string;
  label: string;
  /**
   * `checkboxes` submits a JSON object of `{ [option.value]: boolean }`.
   * `rows` submits a JSON array of objects keyed by `columns`.
   */
  type?: "text" | "password" | "email" | "number" | "datetime-local" | "textarea" | "select" | "hidden" | "checkboxes" | "rows";
  defaultValue?: string | number;
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  /** `list` sends a comma-separated value as a string array (only meaningful with `jsonPath`). */
  transform?: "int" | "boolean" | "list";
  /**
   * `variable.key`: instead of its own variable, the value is placed at `key` of a JSON object sent as
   * the String variable `variable` — typed fields for a known document shape. Blank optional values are omitted.
   * A bare `variable` (no key) sends this field's typed value itself as JSON (e.g. a `list` as an array).
   */
  jsonPath?: string;
  help?: string;
  /** Shown instead of the select when a required select has nothing to choose from. */
  emptyOptionsMessage?: string;
  columns?: MutationFieldColumn[];
  minRows?: number;
};

type Draft = Record<string, string>;
type Status = "idle" | "submitting" | "succeeded" | "failed" | "unknown";

const visible = (field: MutationField) => field.type !== "hidden";
const isRequired = (field: MutationField) => field.required !== false;

function initialDraft(fields: MutationField[]): Draft {
  return Object.fromEntries(fields.filter(visible).map((field) => {
    if (field.type === "checkboxes") {
      let initial: Record<string, boolean> = {};
      try { initial = field.defaultValue ? JSON.parse(String(field.defaultValue)) : {}; } catch { initial = {}; }
      return [field.name, JSON.stringify(Object.fromEntries((field.options ?? []).map((option) => [option.value, Boolean(initial[option.value])])))];
    }
    if (field.type === "rows") {
      let rows: Record<string, string>[] = [];
      try { rows = field.defaultValue ? JSON.parse(String(field.defaultValue)) : []; } catch { rows = []; }
      const blank = Object.fromEntries((field.columns ?? []).map((column) => [column.name, ""]));
      while (rows.length < (field.minRows ?? 1)) rows.push({ ...blank });
      return [field.name, JSON.stringify(rows)];
    }
    return [field.name, field.defaultValue === undefined || field.defaultValue === null ? "" : String(field.defaultValue)];
  }));
}

/** Exact integer parsing: the whole value must be a safe integer (no prefixes, exponents or fractions). */
function parseExactInteger(value: string): number | null {
  const trimmed = value.trim();
  if (!/^-?\d+$/.test(trimmed)) return null;
  const parsed = Number(trimmed);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

function validate(fields: MutationField[], draft: Draft): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of fields.filter(visible)) {
    const value = draft[field.name] ?? "";
    if (field.type === "rows") {
      const rows: Record<string, string>[] = JSON.parse(value || "[]");
      const columns = field.columns ?? [];
      if (rows.length < (field.minRows ?? 1)) errors[field.name] = `Add at least ${field.minRows ?? 1} rows.`;
      else if (rows.some((row) => columns.some((column) => !String(row[column.name] ?? "").trim()))) errors[field.name] = "Complete every row or remove the empty ones.";
      else if (columns[0] && new Set(rows.map((row) => String(row[columns[0].name]).trim())).size !== rows.length) errors[field.name] = `Each ${columns[0].label.toLowerCase()} must be unique.`;
      continue;
    }
    if (field.type === "checkboxes") continue;
    if (!value.trim()) {
      if (isRequired(field)) errors[field.name] = field.type === "select" ? `Select ${field.label.toLowerCase()}.` : `Enter ${field.label.toLowerCase()}.`;
      continue;
    }
    if (field.transform === "int" && parseExactInteger(value) === null) errors[field.name] = "Enter a whole number without decimals or exponents.";
  }
  return errors;
}

function toVariables(fields: MutationField[], draft: Draft) {
  const documents = new Map<string, unknown>();
  for (const field of fields.filter((item) => item.jsonPath)) {
    const [variable, path] = field.jsonPath!.split(".", 2);
    const key = path ?? "value";
    const raw = field.type === "hidden" ? (field.defaultValue === undefined ? "" : String(field.defaultValue)) : (draft[field.name] ?? "");
    const document: Record<string, unknown> = path === undefined ? {} : ((documents.get(variable) as Record<string, unknown> | undefined) ?? {});
    documents.set(variable, document);
    if (field.transform === "boolean") document[key] = raw === "true";
    else if (raw.trim() === "") continue;
    else if (field.transform === "int") document[key] = parseExactInteger(raw);
    else if (field.transform === "list") document[key] = raw.split(",").map((item) => item.trim()).filter(Boolean);
    else if (field.type === "rows") document[key] = (JSON.parse(raw || "[]") as Record<string, string>[]).map((row) => Object.fromEntries((field.columns ?? []).map((column) => [column.name, String(row[column.name] ?? "").trim()])));
    else if (field.type === "checkboxes") document[key] =Object.entries(JSON.parse(raw || "{}") as Record<string, boolean>).filter(([, checked]) => checked).map(([value]) => value);
    else document[key] = raw.trim();
    if (path === undefined) documents.set(variable, document[key] ?? null);
  }
  return Object.fromEntries([...fields.filter((field) => !field.jsonPath).map((field) => {
    const raw = field.type === "hidden" ? (field.defaultValue === undefined ? "" : String(field.defaultValue)) : (draft[field.name] ?? "");
    if (field.type === "rows") {
      const columns = field.columns ?? [];
      const rows: Record<string, string>[] = JSON.parse(raw || "[]");
      return [field.name, JSON.stringify(rows.map((row) => Object.fromEntries(columns.map((column) => [column.name, String(row[column.name] ?? "").trim()]))))];
    }
    if (field.transform === "int") return [field.name, raw.trim() === "" ? null : parseExactInteger(raw)];
    if (field.transform === "boolean") return [field.name, raw === "true"];
    return [field.name, raw];
  }), ...[...documents.entries()].map(([variable, document]) => [variable, JSON.stringify(document)])]);
}

/** Pulls the created/affected record reference out of a mutation result, when it returns one. */
function resultReference(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const first = Object.values(data as Record<string, unknown>)[0];
  if (typeof first === "string" && first) return first;
  if (first && typeof first === "object" && typeof (first as { id?: unknown }).id === "string") return (first as { id: string }).id;
  return undefined;
}

class AmbiguousOutcome extends Error {}

function displayValue(field: MutationField, value: string): string {
  if (field.type === "select") return field.options?.find((option) => option.value === value)?.label ?? (value || "—");
  if (field.type === "checkboxes") {
    const checked: Record<string, boolean> = JSON.parse(value || "{}");
    return (field.options ?? []).filter((option) => checked[option.value]).map((option) => option.label).join(", ") || "None";
  }
  if (field.type === "rows") return (JSON.parse(value || "[]") as Record<string, string>[]).map((row) => Object.values(row).join(" · ")).join("; ");
  if (field.type === "password") return "••••••••";
  return value || "—";
}

export function MutationForm({
  title,
  description,
  mutation,
  fields,
  submitLabel,
  successMessage,
  disabledReason,
  compact = false,
  resultHref,
  requireReview = false,
}: {
  title: string;
  /** Short scope label only (what the form acts on); never an explanation. */
  description?: string;
  mutation: string;
  fields: MutationField[];
  submitLabel: string;
  successMessage: string;
  disabledReason?: string;
  compact?: boolean;
  /** Detail URL for the returned record; `{id}` is replaced with the returned reference. */
  resultHref?: string;
  /** Sensitive decisions show a read-only summary of the chosen target and action before sending. */
  requireReview?: boolean;
}) {
  const router = useRouter();
  const formId = useId();
  const statusRef = useRef<HTMLDivElement>(null);
  const succeededRef = useRef(false);

  const serverDraft = useMemo(() => initialDraft(fields), [fields]);
  const serverSignature = JSON.stringify(serverDraft);
  const [baseline, setBaseline] = useState<Draft>(serverDraft);
  const [draft, setDraft] = useState<Draft>(serverDraft);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ reference?: string }>();
  const [pendingBody, setPendingBody] = useState<string>();
  const [serverChanged, setServerChanged] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const reviewRef = useRef<HTMLDivElement>(null);

  const dirty = JSON.stringify(draft) !== JSON.stringify(baseline);
  const locked = status === "submitting" || status === "unknown" || reviewing;

  // Reconcile refreshed server values: adopt them when there are no local edits,
  // otherwise keep the draft and tell the operator the record changed underneath it.
  const lastSignature = useRef(serverSignature);
  useEffect(() => {
    if (lastSignature.current === serverSignature) return;
    lastSignature.current = serverSignature;
    if (dirty) { setServerChanged(true); setBaseline(serverDraft); return; }
    setBaseline(serverDraft);
    setDraft(serverDraft);
  }, [serverSignature, serverDraft, dirty]);

  // Unsaved edits or an unresolved request: confirm before reload/close and before in-app link navigation.
  useUnsavedChangesGuard(dirty || locked);

  // A successful action often removes this form from the refreshed page; keep focus on the page.
  useEffect(() => () => {
    if (succeededRef.current) requestAnimationFrame(() => document.getElementById("platform-page-title")?.focus());
  }, []);

  const unavailable = fields.filter((field) => field.type === "select" && isRequired(field) && (field.options?.length ?? 0) === 0);

  const send = useCallback(async (body: string, submittedDraft: Draft | null) => {
    setStatus("submitting");
    setError(undefined);
    setResult(undefined);
    try {
      let response: Response;
      try {
        response = await fetch("/api/graphql", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body });
      } catch {
        throw new AmbiguousOutcome();
      }
      let payload: { data?: unknown; errors?: { message?: string }[] };
      try { payload = await response.json(); } catch { throw new AmbiguousOutcome(); }
      if (response.status >= 500 && !payload.errors) throw new AmbiguousOutcome();
      if (!response.ok || payload.errors?.length) {
        const message = payload.errors?.[0]?.message || `The request was rejected (${response.status}).`;
        const variables = submittedDraft ? Object.keys(submittedDraft) : [];
        const matched = variables.filter((name) => message.toLowerCase().includes(name.toLowerCase()));
        setFieldErrors(matched.length === 1 ? { [matched[0]]: message } : {});
        setError(message);
        setStatus("failed");
        setPendingBody(undefined);
        requestAnimationFrame(() => statusRef.current?.focus());
        return;
      }
      setPendingBody(undefined);
      setFieldErrors({});
      setResult({ reference: resultReference(payload.data) });
      setStatus("succeeded");
      setServerChanged(false);
      if (submittedDraft) setBaseline(submittedDraft);
      succeededRef.current = true;
      requestAnimationFrame(() => statusRef.current?.focus());
      router.refresh();
    } catch (caught) {
      if (caught instanceof AmbiguousOutcome) {
        // Keep the exact submitted request; it can only be retried as-is until the operator resolves it.
        setPendingBody(body);
        setStatus("unknown");
        requestAnimationFrame(() => statusRef.current?.focus());
        return;
      }
      setError(caught instanceof Error ? caught.message : "The request failed.");
      setStatus("failed");
    }
  }, [router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if ((locked && !reviewing) || disabledReason || unavailable.length) return;
    const errors = validate(fields, draft);
    setFieldErrors(errors);
    const firstInvalid = fields.find((field) => errors[field.name]);
    if (firstInvalid) {
      setError(undefined);
      setStatus("failed");
      document.getElementById(`${formId}-${firstInvalid.name}`)?.focus();
      return;
    }
    if (requireReview && !reviewing) {
      setReviewing(true);
      requestAnimationFrame(() => reviewRef.current?.focus());
      return;
    }
    setReviewing(false);
    succeededRef.current = false;
    const submittedDraft = { ...draft };
    await send(JSON.stringify({ query: mutation, variables: toVariables(fields, submittedDraft) }), submittedDraft);
  }

  function update(name: string, value: string) {
    setDraft((current) => ({ ...current, [name]: value }));
    if (status === "succeeded") setStatus("idle");
    if (fieldErrors[name]) setFieldErrors(({ [name]: _removed, ...rest }) => rest);
  }

  const visibleFields = fields.filter(visible);
  const href = result?.reference && resultHref ? resultHref.replace("{id}", encodeURIComponent(result.reference)) : undefined;
  const controlClass = "mt-1 block min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-normal outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive";

  return <form onSubmit={submit} noValidate aria-labelledby={`${formId}-title`} className={`min-w-0 rounded-xl border bg-card text-card-foreground ${compact ? "p-4" : "p-5"}`}>
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div className="min-w-0"><h2 id={`${formId}-title`} className="text-sm font-semibold">{status === "unknown" ? <StatusDot tone="wait" /> : status === "failed" ? <StatusDot tone="alert" /> : status === "succeeded" ? <StatusDot tone="ok" /> : disabledReason || unavailable.length > 0 ? <StatusDot tone="off" /> : null}{title}</h2>{description ? <p className="mt-0.5 text-xs text-muted-foreground">{description}</p> : null}</div>
      {dirty && !locked ? <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"><StatusDot tone="wait" className="mr-1.5 size-1.5 align-middle" />Unsaved</span> : null}
    </div>
    {serverChanged ? <div role="status" className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100"><span><StatusDot tone="wait" />Record changed since you started editing</span><Track><Pill size="sm" onClick={() => { setDraft(baseline); setServerChanged(false); }}>Use latest values</Pill></Track></div> : null}
    <fieldset disabled={locked} className="mt-4 min-w-0 disabled:opacity-70">
      <legend className="sr-only">{title}</legend>
      <div className={`grid gap-4 ${visibleFields.length > 1 ? "md:grid-cols-2" : ""}`}>
        {visibleFields.map((field) => {
          const id = `${formId}-${field.name}`;
          const describedBy = [field.help ? `${id}-help` : "", fieldErrors[field.name] ? `${id}-error` : ""].filter(Boolean).join(" ") || undefined;
          const invalid = Boolean(fieldErrors[field.name]) || undefined;
          const wide = field.type === "textarea" || field.type === "rows" || field.type === "checkboxes";
          const value = draft[field.name] ?? "";
          let control;
          if (field.type === "select") {
            control = (field.options?.length ?? 0) === 0 && isRequired(field)
              ? <p id={id} tabIndex={-1} className="mt-1 rounded-md border border-dashed px-3 py-2 text-sm font-normal text-muted-foreground">{field.emptyOptionsMessage ?? `No ${field.label.toLowerCase()} is available yet.`}</p>
              : <select id={id} name={field.name} value={value} onChange={(event) => update(field.name, event.target.value)} aria-invalid={invalid} aria-describedby={describedBy} aria-required={isRequired(field)} className={controlClass}><option value="">{isRequired(field) ? `Select ${field.label.toLowerCase()}…` : "None"}</option>{field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>;
          } else if (field.type === "textarea") {
            control = <Textarea id={id} name={field.name} value={value} onChange={(event) => update(field.name, event.target.value)} placeholder={field.placeholder} aria-invalid={invalid} aria-describedby={describedBy} aria-required={isRequired(field)} rows={4} className="mt-1 text-sm font-normal" />;
          } else if (field.type === "checkboxes") {
            const checked: Record<string, boolean> = JSON.parse(value || "{}");
            control = <div id={id} tabIndex={-1} role="group" aria-describedby={describedBy} className="mt-2 grid gap-2 sm:grid-cols-2">{field.options?.map((option) => <label key={option.value} className="flex items-center gap-2 text-sm font-normal"><input type="checkbox" className="h-4 w-4 accent-primary" checked={Boolean(checked[option.value])} onChange={(event) => update(field.name, JSON.stringify({ ...checked, [option.value]: event.target.checked }))} />{option.label}</label>)}</div>;
          } else if (field.type === "rows") {
            const columns = field.columns ?? [];
            const rows: Record<string, string>[] = JSON.parse(value || "[]");
            const setRows = (next: Record<string, string>[]) => update(field.name, JSON.stringify(next));
            control = <div id={id} tabIndex={-1} role="group" aria-describedby={describedBy} className="mt-2 space-y-2">
              {rows.map((row, index) => <div key={index} className="flex items-end gap-2">{columns.map((column) => <label key={column.name} className="min-w-0 flex-1 text-xs font-normal text-muted-foreground">{column.label} {index + 1}<Input value={row[column.name] ?? ""} placeholder={column.placeholder} aria-invalid={invalid} onChange={(event) => setRows(rows.map((current, rowIndex) => rowIndex === index ? { ...current, [column.name]: event.target.value } : current))} className="mt-1 h-10 text-sm text-foreground" /></label>)}<Button type="button" variant="ghost" size="icon" aria-label={`Remove row ${index + 1}`} disabled={rows.length <= (field.minRows ?? 1)} onClick={() => setRows(rows.filter((_, rowIndex) => rowIndex !== index))}><Trash2 className="h-4 w-4" aria-hidden="true" /></Button></div>)}
              <Track><Pill size="sm" onClick={() => setRows([...rows, Object.fromEntries(columns.map((column) => [column.name, ""]))])}><Plus aria-hidden="true" />Add row</Pill></Track>
            </div>;
          } else {
            control = <Input id={id} name={field.name} type={field.type === "number" ? "text" : field.type ?? "text"} inputMode={field.type === "number" || field.transform === "int" ? "numeric" : undefined} value={value} onChange={(event) => update(field.name, event.target.value)} placeholder={field.placeholder} aria-invalid={invalid} aria-describedby={describedBy} aria-required={isRequired(field)} autoComplete={field.type === "password" ? "new-password" : undefined} className="mt-1 h-10 text-sm font-normal" />;
          }
          return <div key={field.name} className={`text-sm font-medium ${wide ? "md:col-span-2" : ""}`}>
            {field.type === "checkboxes" || field.type === "rows" ? <span id={`${id}-label`}>{field.label}</span> : <label htmlFor={id}>{field.label}</label>}
            {control}
            {field.help ? <span id={`${id}-help`} className="mt-1 block text-xs font-normal text-muted-foreground">{field.help}</span> : null}
            {fieldErrors[field.name] ? <span id={`${id}-error`} className="mt-1 block text-xs font-normal text-destructive">{fieldErrors[field.name]}</span> : null}
          </div>;
        })}
      </div>
    </fieldset>
    {reviewing ? <div ref={reviewRef} tabIndex={-1} role="region" aria-label="Review before submitting" className="mt-4 rounded-lg bg-muted/60 p-3 text-sm outline-none"><p className="font-medium"><StatusDot tone="info" />Review</p><dl className="mt-2 grid gap-1">{visibleFields.map((field) => <div key={field.name} className="grid grid-cols-[minmax(0,10rem)_minmax(0,1fr)] gap-2"><dt className="text-muted-foreground">{field.label}</dt><dd className="break-words">{displayValue(field, draft[field.name] ?? "")}</dd></div>)}</dl><div className="mt-3"><Track><Pill type="submit" size="sm" variant="primary">Confirm: {submitLabel}</Pill><Pill size="sm" onClick={() => setReviewing(false)}>Back to edit</Pill></Track></div></div> : null}
    {disabledReason ? <p className="mt-4 text-sm text-muted-foreground"><StatusDot tone="off" />{disabledReason}</p> : null}
    {status === "unknown" || reviewing ? null : <div className="mt-4"><Track><Pill type="submit" variant="primary" disabled={locked || Boolean(disabledReason) || unavailable.length > 0}>{status === "submitting" ? "Saving…" : submitLabel}</Pill></Track></div>}
    <div ref={statusRef} tabIndex={-1} aria-live="polite" className="mt-3 min-h-5 text-sm outline-none">
      {status === "failed" && error ? <p role="alert" className="text-destructive"><StatusDot tone="alert" />{error}</p> : null}
      {status === "failed" && !error && Object.keys(fieldErrors).length ? <p role="alert" className="text-destructive">Check the highlighted fields.</p> : null}
      {status === "unknown" ? <div role="alert" className="rounded-lg bg-amber-50 p-3 text-amber-950 ring-1 ring-amber-200 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100"><p className="font-medium"><StatusDot tone="wait" />Not confirmed whether this was saved</p><p className="mt-0.5 pl-4 text-xs opacity-80">Values are locked. Retry sends the same request.</p><div className="mt-2 pl-4"><Track><Pill size="sm" onClick={() => pendingBody && send(pendingBody, draft)}>Retry same request</Pill><Pill size="sm" onClick={() => { setPendingBody(undefined); setStatus("idle"); router.refresh(); }}>Checked — edit again</Pill></Track></div></div> : null}
      {status === "succeeded" ? <p role="status" className="text-emerald-700 dark:text-emerald-400"><StatusDot tone="ok" />{successMessage}{result?.reference ? <> Reference <code className="text-xs">{result.reference}</code>.</> : null}{href ? <> <Link href={href} className="underline underline-offset-2">View record</Link></> : null}</p> : null}
    </div>
  </form>;
}
