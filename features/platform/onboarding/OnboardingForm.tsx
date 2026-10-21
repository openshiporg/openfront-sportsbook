'use client';

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useOnboardingApi, type SportsbookOnboardingInput } from "./hooks/useOnboardingApi";
import { useUnsavedChangesGuard } from "../components/useUnsavedChangesGuard";

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
  return <form onSubmit={submit} className="rounded-xl border bg-card p-5 shadow-sm">
    <h2 className="font-semibold">{resuming ? "Resume sandbox setup" : "Sandbox operator configuration"}</h2><p className="mt-1 text-sm text-muted-foreground">{resuming ? "Setup stopped before every stage finished. Resuming replays your original settings and only completes the missing stages." : "Creates a new tenant for your account. An existing tenant slug can't be joined from here."}</p>
    <div className="mt-4 grid gap-4 md:grid-cols-2">{fields.map(([key, label]) => <label key={key} className="text-sm font-medium">{label}<input required readOnly={resuming} value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} className="mt-1 block min-h-10 w-full rounded-md border px-3 py-2 font-normal" /></label>)}<label className="text-sm font-medium">Currency exponent<input required readOnly={resuming} type="number" min={0} max={6} value={form.currencyExponent} onChange={(event) => setForm({ ...form, currencyExponent: Number.parseInt(event.target.value, 10) })} className="mt-1 block min-h-10 w-full rounded-md border px-3 py-2 font-normal" /><span className="mt-1 block text-xs font-normal text-muted-foreground">2 for cents-based currencies such as USD.</span></label></div>
    <div className="mt-5 rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30 p-3 text-xs text-amber-900 dark:text-amber-200">Creates tenant-owned local fixtures and sandbox adapters. It does not certify a licence, jurisdiction, payment provider, data rights, or production launch.</div>
    <button type="submit" disabled={state.busy || Boolean(state.hash)} className="mt-4 min-h-10 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">{state.busy ? "Applying safely…" : state.hash ? "Sandbox configured" : resuming ? "Resume setup" : "Configure sandbox operator"}</button>{dirty && !state.busy ? <><span className="ml-3 rounded-full border px-2 py-0.5 text-xs text-muted-foreground">Unsaved changes</span><button type="button" onClick={() => setForm({ ...baseline })} className="ml-2 text-xs font-medium underline underline-offset-2">Discard changes</button></> : null}
    <div aria-live="polite" className="mt-3 min-h-5">{state.error ? <p role="alert" className="text-sm text-red-700 dark:text-red-400">{state.error}</p> : null}{state.hash ? <p role="status" className="break-all text-xs text-emerald-700 dark:text-emerald-400">Configuration evidence: {state.hash}</p> : null}</div>
  </form>;
}
