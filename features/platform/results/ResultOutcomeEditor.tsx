'use client';

import { useMemo, useState } from "react";
import { MutationForm } from "../components/MutationForm";

export type ResultEditorMarket = { id: string; label: string; selections: { key: string; label: string }[] };

const OUTCOMES = ["WIN", "LOSS", "PUSH", "VOID", "DEAD_HEAT"] as const;
type Fact = { outcome: string; factorNumerator: string; factorDenominator: string };

/**
 * Typed outcome editor for one selected event: every market/selection of that event gets an explicit
 * outcome, and the canonical openfront.selection-results.v1 document is built from those choices.
 * Submission stays blocked until every selection has a valid outcome; the server still validates
 * event/market/selection identity.
 */
export function ResultOutcomeEditor({ eventId, eventLabel, markets, mutation, disabledReason }: { eventId: string; eventLabel: string; markets: ResultEditorMarket[]; mutation: string; disabledReason?: string }) {
  const [facts, setFacts] = useState<Record<string, Fact>>({});
  const rows = useMemo(() => markets.flatMap((market) => market.selections.map((selection) => ({ id: `${market.id}\u0000${selection.key}`, market, selection }))), [markets]);
  const missing = rows.filter((row) => {
    const fact = facts[row.id];
    if (!fact?.outcome) return true;
    if (fact.outcome !== "DEAD_HEAT") return false;
    return !/^\d+$/.test(fact.factorNumerator) || !/^\d+$/.test(fact.factorDenominator) || BigInt(fact.factorNumerator) <= 0n || BigInt(fact.factorDenominator) <= 0n || BigInt(fact.factorNumerator) > BigInt(fact.factorDenominator);
  });
  const payload = JSON.stringify({
    schemaVersion: "openfront.selection-results.v1",
    eventId,
    selections: rows.map((row) => {
      const fact = facts[row.id];
      return { marketKey: row.market.id, selectionKey: row.selection.key, outcome: fact?.outcome ?? "", ...(fact?.outcome === "DEAD_HEAT" ? { factorNumerator: fact.factorNumerator, factorDenominator: fact.factorDenominator } : {}) };
    }),
  });
  const update = (id: string, patch: Partial<Fact>) => setFacts((current) => ({ ...current, [id]: { ...(current[id] ?? { outcome: "", factorNumerator: "", factorDenominator: "" }), ...patch } }));

  return <div className="space-y-4">
    <section className="rounded-xl border bg-card p-5 shadow-sm">
      <h2 className="font-semibold">Outcomes · {eventLabel}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{rows.length} selection(s) across {markets.length} market(s). Every selection needs an outcome; dead heats need a factor no greater than 1.</p>
      <div className="mt-4 space-y-4">
        {markets.map((market) => <fieldset key={market.id} className="rounded-lg border p-3">
          <legend className="px-1 text-sm font-semibold">{market.label}</legend>
          <div className="space-y-2">
            {market.selections.map((selection) => {
              const id = `${market.id}\u0000${selection.key}`;
              const fact = facts[id];
              return <div key={id} className="flex flex-wrap items-end gap-2 text-sm">
                <label className="min-w-48 flex-1">{selection.label} <span className="font-mono text-xs text-muted-foreground">{selection.key}</span>
                  <select value={fact?.outcome ?? ""} onChange={(event) => update(id, { outcome: event.target.value })} className="mt-1 block h-10 w-full rounded-md border bg-card px-3">
                    <option value="">Select outcome…</option>
                    {OUTCOMES.map((outcome) => <option key={outcome} value={outcome}>{outcome.replace("_", " ")}</option>)}
                  </select>
                </label>
                {fact?.outcome === "DEAD_HEAT" ? <>
                  <label className="w-28 text-xs">Numerator<input inputMode="numeric" value={fact.factorNumerator} onChange={(event) => update(id, { factorNumerator: event.target.value.trim() })} className="mt-1 block h-10 w-full rounded-md border px-2" /></label>
                  <label className="w-28 text-xs">Denominator<input inputMode="numeric" value={fact.factorDenominator} onChange={(event) => update(id, { factorDenominator: event.target.value.trim() })} className="mt-1 block h-10 w-full rounded-md border px-2" /></label>
                </> : null}
              </div>;
            })}
          </div>
        </fieldset>)}
      </div>
    </section>
    <MutationForm title="Enter pending result" description="Creates a pending, content-hashed result version for this event only. It cannot settle a wager until independently approved and graded." mutation={mutation} fields={[{ name: "eventId", label: "Event", type: "hidden", defaultValue: eventId }, { name: "payload", label: "Canonical result", type: "hidden", defaultValue: payload }]} submitLabel="Enter pending result" successMessage="Pending result version entered." disabledReason={disabledReason ?? (rows.length === 0 ? "This event has no selections to result." : missing.length ? `${missing.length} selection(s) still need a valid outcome.` : undefined)} />
  </div>;
}
