'use client';

import { useMemo, useState } from "react";
import { MutationForm } from "../components/MutationForm";
import { Mono, Pill, StatusDot, Track } from "../components/kit";

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

  const factorInput = "mt-1 block h-9 w-full rounded-[4px] border bg-background px-3 tabular-nums text-sm ";
  return <div className="space-y-4">
    <section aria-labelledby="result-outcomes" className="min-w-0 overflow-hidden rounded-[4px] border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
        <h2 id="result-outcomes" className="min-w-0 break-words text-sm font-semibold"><StatusDot tone={missing.length ? "wait" : "ok"} />Outcomes · {eventLabel}</h2>
        <Mono className="text-xs text-muted-foreground">{rows.length - missing.length}/{rows.length} set · {markets.length} markets</Mono>
      </div>
      <div className="divide-y">
        {markets.map((market) => <fieldset key={market.id} className="min-w-0 px-4 py-3">
          <legend className="sr-only">{market.label}</legend>
          <p aria-hidden="true" className="break-all tabular-nums text-xs font-medium text-muted-foreground">{market.label}</p>
          <div className="mt-2 space-y-3">
            {market.selections.map((selection) => {
              const id = `${market.id}\u0000${selection.key}`;
              const fact = facts[id];
              return <div key={id} className="flex min-w-0 flex-wrap items-end justify-between gap-2 text-sm">
                <p className="min-w-0 flex-1 basis-40 break-words font-medium"><StatusDot tone={fact?.outcome ? "ok" : "wait"} />{selection.label} <Mono className="break-all text-xs font-normal text-muted-foreground">{selection.key}</Mono></p>
                <Track label={`Outcome for ${selection.label}`}>
                  {OUTCOMES.map((outcome) => <Pill key={outcome} size="sm" variant="flat" aria-pressed={fact?.outcome === outcome} onClick={() => update(id, { outcome: fact?.outcome === outcome ? "" : outcome })}>{outcome.replace("_", " ").toLowerCase()}</Pill>)}
                </Track>
                {fact?.outcome === "DEAD_HEAT" ? <div className="flex w-full flex-wrap items-end justify-end gap-2">
                  <label className="w-28 text-xs text-muted-foreground">Numerator<input inputMode="numeric" value={fact.factorNumerator} onChange={(event) => update(id, { factorNumerator: event.target.value.trim() })} className={factorInput} /></label>
                  <label className="w-28 text-xs text-muted-foreground">Denominator<input inputMode="numeric" value={fact.factorDenominator} onChange={(event) => update(id, { factorDenominator: event.target.value.trim() })} className={factorInput} /></label>
                  <span className="pb-2 text-xs text-muted-foreground">Factor ≤ 1</span>
                </div> : null}
              </div>;
            })}
          </div>
        </fieldset>)}
      </div>
    </section>
    <MutationForm title="Enter pending result" mutation={mutation} fields={[{ name: "eventId", label: "Event", type: "hidden", defaultValue: eventId }, { name: "payload", label: "Canonical result", type: "hidden", defaultValue: payload }]} submitLabel="Enter pending result" successMessage="Pending result version entered." disabledReason={disabledReason ?? (rows.length === 0 ? "No selections to result." : missing.length ? `${missing.length} selection(s) need a valid outcome.` : undefined)} />
  </div>;
}
