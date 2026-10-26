# Sportsbook: design ready (2026-10-25)

Brief: `~/Code/Euler/state/briefs/batches-2-6-full-redesign-2026-10-25.md`. The owner ordered the work directly, so impeccable's interview steps ran unattended. `PRODUCT.md` is inferred from the repository and labelled as inferred.

## Commits

- `da56087` (pushed, deployed SUCCESS): Redesign operator desks and customer site from the trader's and bettor's main tasks.
- `ca3d7d5` (**committed locally, push pending**): Rename the root stylesheet.
  - Why: the live deploy served the old compile of `app/globals.css`. The served CSS still had `--color-sb-night:#0a0e14` and Barlow, which is the known Railway/Turbopack stale-CSS trap.
  - Change: `app/globals.css` → `app/sportsbook.css`, with `components.json` updated to match.
  - The push timed out because the macOS keychain credential helper hung for every session.

## Gates

| Gate | Result |
|---|---|
| `tsc --noEmit` (heavy-exec, real) | exit 0 |
| `npm test` | exit 0, but **0 tests ran**: the script's glob `features/sportsbook/**/*.test.ts` matches no files. This is pre-existing and not a pass claim. |
| Parity check | drift 0, missing 0, sidebar ok |

## Directions (impeccable `concept-seed`)

- **Platform (Operate):** sports-page agate tables, candidate 6 of 7, `seed:d140e31c56d2e64a`.
- **Customer site (Persuade):** the fixed-odds coupon, candidate 6 of 7, `seed:4ea10229f9d39ee4`.

## Skills used, per screen

| Skill | Screen(s) | What it changed |
|---|---|---|
| impeccable | All | `PRODUCT.md`, the contracts, and these bans: tracked caps labels, mono costume, pill tracks, halo dots. |
| industrial-brutalist-ui | Operator `RecordList`, `MetricGrid` | Agate table: 2px ink rule under each head, denser rows, bold leaders, tabular figures. |
| minimalist-ui | Operator and customer buttons | Square keylined buttons. |
| design-taste-frontend | Customer site | Coupon world; price boxes as ruled cells that fill when marked. |
| emil-design-eng | Kits | Colour-only transitions; the translate-on-press effect was removed. |
| high-end-visual-design | — | Consulted and rejected: pill CTA rules. |

## What changed

**Operator desks** (`features/platform/components/kit.tsx`, `WorkflowUI.tsx`, and a sweep across 48 files):
- Flat choices are underline tabs; tab rows sit on a hairline.
- Buttons are square (4px).
- State marks are square; the red live halo is gone.
- Monospace was replaced by tabular figures in the shell sans.
- Tables are agate-style.
- Metric labels are sentence case.

**Customer site:**
- The storefront kit has square 2px buttons, underline tabs for sport, view and bet type, and keylined cards.
- Price boxes are 2px-ruled ink cells that fill book-blue when marked.
- Tokens move from night board to coupon: white stock, the book's blue (#155eef) as printed bands, white instead of lime flood, flash red for live.
- Barlow Condensed and JetBrains Mono were replaced by Antonio and Geist.
- Text on the bands was raised from 40–60% white to 80% white.
- The practice-play and closed-state notices are unchanged.

## Screenshots

- `before/` and `after/`: desktop 1440 and phone 390 for every operator page (MFA step-up through `/dashboard/platform/security`), plus `/`, `/sports`, `/promotions`, `/betslip`, `/account/bets` and `/account/wallet`.
- The after shots are WebKit captures.
- **The customer-site after shots show the stale CSS.** Recapture once `ca3d7d5` is pushed and deployed.

## Open

- Push `ca3d7d5`, then recapture the customer site.
- No finish-reviewer pass or DESIGN.md yet.
