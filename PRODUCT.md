# Product

<!-- impeccable:product-schema 1 -->

> Inferred on 2026-10-25 from the README, routes, onboarding seed and the owner's redesign brief (`~/Code/Euler/state/briefs/batches-2-6-full-redesign-2026-10-25.md`). The owner ordered the work without an interview round; every fact below is read from the repository, not confirmed in conversation.

## Platform

web

## Users

- **Sportsbook operators** (inferred): traders pricing and suspending markets, risk and limits staff, result approvers and graders, settlement and finance, responsible-gaming, compliance and support teams. MFA-verified sessions.
- **Customers** (inferred): practice-play bettors browsing sports and events, building a betslip, and managing account, wallet, limits and bet history.

## Product Purpose

Openfront Sportsbook is a self-hostable sportsbook development and operator application. Customer screens cover sports, events, markets, betslips, accounts, wallets and wager history. Operators manage trading, risk, grading, settlement, finance, responsible gaming, compliance and provider workflows.

## Positioning

An open-source sportsbook core where every price, result and settlement goes through explicit, audited operator controls.

## Operating Context

- Live book: **Northline Sports** (Northline Gaming) at sportsbook.openship.org: four sports, twelve priced events, twenty-five markets, three promotions. Customers register, verify, deposit by card (Stripe test keys on the live site) or at the cage, wager and get paid on settlement.
- "Not approved for real-money operation" stays visible on the operator dashboard until the operator records its licence, contracted providers, jurisdiction policy and certification.

## Capabilities and Constraints

- Shared dashboard shell byte-identical to E-commerce; no new env vars; onboarding/seed files untouched by design work. Operator data requires an MFA-verified session.

## Evidence on Hand

- No real teams, leagues, odds history, testimonials or volumes. Teams and events are fictional catalog data; never invent real fixtures or win claims.

## Product Principles

1. A trader sees which markets need a price or a decision before anything else.
2. Odds, money and times are exact, tabular and aligned.
3. Safer-play and non-real-money status are always visible, never decorative.
