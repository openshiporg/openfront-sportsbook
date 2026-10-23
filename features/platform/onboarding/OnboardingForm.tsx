'use client';

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useOnboardingApi, type SportsbookOnboardingInput } from "./hooks/useOnboardingApi";
import { useUnsavedChangesGuard } from "../components/useUnsavedChangesGuard";
import { Pill, StatusDot, Track } from "../components/kit";

/**
 * New setup edits the seed; resume replays the exact persisted setup manifest for the operator's own
 * tenant (read-only), so only missing stages run and a changed body is rejected server-side.
 */
export function OnboardingForm({ resumeInput }: { resumeInput?: SportsbookOnboardingInput } = {}) {
  const router = useRouter();
  const onboarding = useOnboardingApi();
  const resuming = Boolean(resumeInput);
  const [baseline] = useState(() => ({ ...(resumeInput ?? onboarding.seed) }));
  const [form, setForm] = useState(() => ({ ...baseline }));
  const [state, setState] = useState<{ busy: boolean; error?: string; hash?: string }>({ busy: false });
  // Edited-but-unsubmitted setup (or a run in flight) is protected from reload, close and in-app navigation.
  const dirty = !state.hash && JSON.stringify(form) !== JSON.stringify(baseline);
  useUnsavedChangesGuard(dirty || state.busy);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ busy: true });
    try {
      const result = await onboarding.run(form);
      setState({ busy: false, hash: result.fixtureHash });
      router.refresh();
    } catch (error) {
      setState({ busy: false, error: error instanceof Error ? error.message : "Onboarding failed" });
    }
  }
  const fields = [["operatorName", "Operator name"], ["brandName", "Brand name"], ["slug", "Tenant slug"], ["domain", "Brand domain"], ["currency", "Currency"], ["jurisdictionCode", "Jurisdiction policy"], ["timezone", "Time zone"]] as const;
  const inputClass = "mt-1.5 block h-9 w-full min-w-0 rounded-md border bg-background px-3 text-sm font-normal shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring read-only:bg-muted/60 read-only:text-muted-foreground";
  return <form onSubmit={submit} className="min-w-0 overflow-hidden rounded-xl border bg-card text-card-foreground">
    <header className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
      <h2 className="text-sm font-semibold"><StatusDot tone={state.hash ? "ok" : state.error ? "alert" : resuming ? "wait" : "info"} />{resuming ? "Resume setup" : "New operator"}</h2>
      <span className="font-mono text-xs tabular-nums text-muted-foreground">{resuming ? "saved manifest · read-only" : "sandbox"}</span>
    </header>
    <div className="grid gap-4 p-4 sm:grid-cols-2">{fields.map(([key, label]) => <label key={key} className="min-w-0 text-sm font-medium">{label}<input required readOnly={resuming} value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} className={`${inputClass}${key === "slug" || key === "domain" || key === "currency" || key === "jurisdictionCode" || key === "timezone" ? " font-mono" : ""}`} /></label>)}<label className="min-w-0 text-sm font-medium">Currency exponent<input required readOnly={resuming} type="number" min={0} max={6} value={form.currencyExponent} onChange={(event) => setForm({ ...form, currencyExponent: Number.parseInt(event.target.value, 10) })} className={`${inputClass} font-mono tabular-nums`} /><span className="mt-1 block text-xs font-normal text-muted-foreground">0–6 · USD is 2</span></label></div>
    <div className="flex flex-wrap items-center gap-3 border-t px-4 py-3">
      <Track>
        <Pill type="submit" variant="primary" disabled={state.busy || Boolean(state.hash)}>{state.busy ? "Applying…" : state.hash ? "Configured" : resuming ? "Resume setup" : "Configure sandbox operator"}</Pill>
        {dirty && !state.busy ? <Pill variant="flat" onClick={() => setForm({ ...baseline })}>Discard changes</Pill> : null}
      </Track>
      {dirty && !state.busy ? <span className="text-xs text-muted-foreground"><StatusDot tone="wait" />Unsaved changes</span> : null}
    </div>
    <div aria-live="polite" className="px-4">{state.error ? <p role="alert" className="pb-3 text-sm text-red-700 dark:text-red-400"><StatusDot tone="alert" />{state.error}</p> : null}{state.hash ? <p role="status" className="break-all pb-3 font-mono text-xs text-emerald-700 dark:text-emerald-400"><StatusDot tone="ok" />{state.hash}</p> : null}</div>
  </form>;
}
