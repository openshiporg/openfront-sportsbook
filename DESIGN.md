---
name: Openfront Sportsbook
description: A fixed-odds coupon for bettors and a sports-page agate table for the operators who price, settle and police it.
colors:
  coupon-blue: "#155eef"
  band-rule: "#4a82f3"
  coupon-stock: "#fbfbf8"
  slip-white: "#ffffff"
  coupon-keyline: "#d6d6cf"
  coupon-well: "#efefea"
  coupon-ink: "#111318"
  coupon-mute: "#636873"
  flash-red: "#d92d20"
  settled-green: "#12a05a"
  waiting-amber: "#e0920f"
  desk-ink: "oklch(0.141 0.005 285.823)"
  desk-paper: "oklch(1 0 0)"
  desk-rule: "oklch(0.92 0.004 286.32)"
  desk-muted: "oklch(0.967 0.001 286.375)"
  desk-mute-text: "oklch(0.552 0.016 285.938)"
  desk-live-red: "#dc2626"
  desk-ok-green: "#10b981"
  desk-wait-amber: "#f59e0b"
  desk-info-blue: "#2563eb"
  desk-off-grey: "#a1a1aa"
typography:
  display:
    fontFamily: "Antonio, Arial Narrow, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Antonio, Arial Narrow, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "normal"
  title:
    fontFamily: "Antonio, Arial Narrow, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0.025em"
  body:
    fontFamily: "Geist, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
  figure:
    fontFamily: "Geist, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.5
    fontFeature: "\"tnum\""
  readout:
    fontFamily: "Geist, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.33
    fontFeature: "\"tnum\""
  label:
    fontFamily: "Geist, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.33
    letterSpacing: "normal"
  desk-title:
    fontFamily: "Antonio, Arial Narrow, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1
  desk-section:
    fontFamily: "Antonio, Arial Narrow, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.25
  desk-cell:
    fontFamily: "Geist, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
    fontFeature: "\"tnum\""
  desk-table-head:
    fontFamily: "Geist, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.33
rounded:
  mark: "1px"
  coupon: "2px"
  desk: "4px"
spacing:
  row: "8px"
  cell: "12px"
  inset: "16px"
  slip: "20px"
  column: "24px"
  section: "32px"
components:
  price-box:
    backgroundColor: "{colors.slip-white}"
    textColor: "{colors.coupon-ink}"
    typography: "{typography.figure}"
    rounded: "{rounded.coupon}"
    padding: "0 12px"
    height: "56px"
  price-box-hover:
    backgroundColor: "{colors.coupon-well}"
  price-box-marked:
    backgroundColor: "{colors.coupon-blue}"
    textColor: "{colors.slip-white}"
  button-primary:
    backgroundColor: "{colors.coupon-blue}"
    textColor: "{colors.slip-white}"
    rounded: "{rounded.coupon}"
    padding: "0 16px"
    height: "40px"
  button-primary-large:
    backgroundColor: "{colors.coupon-blue}"
    textColor: "{colors.slip-white}"
    rounded: "{rounded.coupon}"
    padding: "0 24px"
    height: "48px"
  button-raised:
    backgroundColor: "{colors.slip-white}"
    textColor: "{colors.coupon-ink}"
    rounded: "{rounded.coupon}"
    padding: "0 16px"
    height: "40px"
  button-on-band:
    backgroundColor: "{colors.slip-white}"
    textColor: "{colors.coupon-blue}"
    rounded: "{rounded.coupon}"
    padding: "0 12px"
    height: "36px"
  tab-underline:
    textColor: "{colors.coupon-mute}"
    typography: "{typography.label}"
    padding: "0 12px"
    height: "36px"
  tab-underline-current:
    textColor: "{colors.coupon-ink}"
  coupon-band:
    backgroundColor: "{colors.coupon-blue}"
    textColor: "{colors.slip-white}"
    typography: "{typography.display}"
    rounded: "{rounded.coupon}"
    padding: "24px"
  field:
    backgroundColor: "{colors.slip-white}"
    textColor: "{colors.coupon-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.coupon}"
    padding: "0 12px"
    height: "44px"
  desk-button-primary:
    backgroundColor: "{colors.desk-ink}"
    textColor: "{colors.desk-paper}"
    rounded: "{rounded.desk}"
    padding: "0 12px"
    height: "32px"
  desk-button-raised:
    backgroundColor: "{colors.desk-paper}"
    textColor: "{colors.desk-ink}"
    rounded: "{rounded.desk}"
    padding: "0 12px"
    height: "32px"
  desk-tab:
    textColor: "{colors.desk-mute-text}"
    padding: "0 12px"
    height: "36px"
  desk-tab-current:
    textColor: "{colors.desk-ink}"
  desk-table-head:
    backgroundColor: "{colors.desk-muted}"
    textColor: "{colors.desk-ink}"
    typography: "{typography.desk-table-head}"
    padding: "6px 12px"
---

# Design System: Openfront Sportsbook

## Overview

**Creative North Star: "The Printed Book"**

Openfront Sportsbook is set like the two printed artefacts of a betting shop. The customer site is a **fixed-odds coupon**: white coupon stock, black ink, the book's blue printed as solid bands, and each event a row of square ruled price boxes that fill solid when marked. The operator desks are the **sports-page agate table**: black ink on white, thin column rules, condensed bold heads with a 2px ink rule beneath, and every figure in tabular numerals. Both worlds share one condensed head face (Antonio), one text face (Geist), and the same refusal of shadows, round shapes and monospace costume.

Density follows the reader. The bettor on a phone gets 56px price boxes and a bottom-sheet slip; the trader gets 8px row rhythm, 14px cells and the table header above the fold. Colour carries state, never decoration: blue is the book's ink on the customer side and absent from the desks' surfaces; red is live and alarm; amber is waiting; green is settled. Anything the system does not recognise reads neutral grey, never healthy.

The operator desks sit inside the shared dashboard shell and draw their neutrals from its tokens, so they work in light and dark. The customer site is light only, on its own `sb-*` palette.

**Key Characteristics:**
- Square everything: 2px corners on the coupon, 4px on the desks, 1px on state marks.
- Condensed bold uppercase heads (Antonio 700) over a 2px ink rule; sentence-case Geist for everything else.
- Odds, money, counts and times in tabular figures in the text face.
- Hairline rings and 1px keylines for structure; no shadows.
- Choices are underline tabs on a keyline, never pills or segmented tracks.
- A small square state mark on the title line is the only status ornament.

## Colors

A printed palette: paper, ink and one book colour, with three signal inks that mean exactly one thing each.

### Primary
- **Book Blue** (coupon-blue): the coupon's printed colour. Header and footer bands, the coupon band over the event list, the bet slip head, the quote panel, the marked price box and the primary button. Also the `info` mark and the hover colour of event links.
- **Band Rule Blue** (band-rule): the current item in the phone navigation drawer, the only lighter blue on a band.

### Neutral (customer coupon)
- **Coupon Stock** (coupon-stock): page ground behind every customer screen.
- **Slip White** (slip-white): event rows, the slip, cards, fields and unmarked price boxes; also the text and price colour on blue bands.
- **Coupon Keyline** (coupon-keyline): row dividers, tab keylines, hairline rings around rows and cards, the dashed tear line on the slip.
- **Coupon Well** (coupon-well): hover fill for price boxes and icon buttons; neutral notice ground.
- **Coupon Ink** (coupon-ink): headings, team names, prices, the 2px rule under section heads and the 2px rule under the current tab.
- **Coupon Mute** (coupon-mute): labels, meta lines, competition names, inactive tabs.

### Signal (customer coupon)
- **Flash Red** (flash-red): live and in-play only, plus alert and rejection marks and the danger button.
- **Settled Green** (settled-green): won, accepted, active marks and the signed-in dot.
- **Waiting Amber** (waiting-amber): pending marks and suspended markets.

### Neutral (operator desks)
- **Desk Ink** (desk-ink): text, primary button fill, the 2px rule under table heads and the current tab rule.
- **Desk Paper** (desk-paper): table and page ground.
- **Desk Rule** (desk-rule): column and row rules, table frame, figure-strip rules.
- **Desk Muted** (desk-muted): table header band (at 40%), row hover, note ground.
- **Desk Mute Text** (desk-mute-text): figure labels, meta lines, counts beside heads, inactive tabs.

### Signal (operator desks)
- **Live Red** (desk-live-red), **OK Green** (desk-ok-green), **Wait Amber** (desk-wait-amber), **Info Blue** (desk-info-blue), **Off Grey** (desk-off-grey): fills for the square state mark only. Statuses map by exact enum value: settled and approved states green; failed, suspended and void red; pending and in-review amber; open, scheduled and draft blue; closed and retired grey; LIVE and IN_PLAY take the live red.

### Named Rules
**The Printed Band Rule.** The book's blue appears as a solid band or a solid marked box. It is never a tint wash, a gradient fill or a background for body copy.

**The Flash Red Rule.** Red means live, or something refused. A price, a promotion or a call to action is never red.

**The Unknown Is Neutral Rule.** A status the mapping does not list renders grey. No unrecognised state is ever shown green.

## Typography

**Display Font:** Antonio (with Arial Narrow, sans-serif), loaded at 600 and 700
**Body Font:** Geist (with sans-serif)

**Character:** A tall condensed newspaper head over a quiet modern grotesque. Antonio shouts the section and the fixture; Geist does all the reading and all the numbers.

### Hierarchy
- **Display** (Antonio 700, 2.25rem rising to 3rem from 640px, line-height 1, -0.025em, uppercase): customer page titles and the coupon band title; "Betting closed" at 1.875rem.
- **Headline** (Antonio 700, 1.5rem, 1.25, uppercase): event names on the coupon; the bet slip head.
- **Title** (Antonio 700, 1.25rem, 0.025em, uppercase): customer section heads, the bet-accepted receipt head.
- **Desk title** (Antonio 700, 1.875rem, line-height 1, uppercase): operator page titles, with a one-line tabular meta line beneath in 0.75rem.
- **Desk section** (Antonio 700, 1.125rem, uppercase): agate table heads, with the row count beside in 0.75rem tabular mute.
- **Body** (Geist 400, 0.875rem, 1.43): all running text, market names (600), notices.
- **Figure** (Geist 600, 1rem, tabular): prices in price boxes and the slip; stakes; table cells use the same tabular figures at 0.875rem.
- **Readout** (Geist 600, 1.25rem rising to 1.5rem, tabular): figure strips, cash and potential return.
- **Label** (Geist 600, 0.75rem, or 0.6875rem in the slip and band; sentence case, no tracking): field labels, figure labels, table column heads, tabs.

### Named Rules
**The Condensed Head Rule.** Antonio is for heads only: titles, section heads, event names, slip and state heads. Never for labels, body, buttons or figures.

**The Agate Figure Rule.** Every odds, money, count, clock and reference value is set in Geist with tabular figures. No monospace face stands in for alignment.

## Layout

The coupon page is a three-column grid at 1280px and up (208px sport rail, fluid coupon, 380px sticky slip) inside a 1560px frame with a 24px column gap; below that the rails collapse, sports and competitions become horizontally scrolling tracks under the band, and the slip becomes a fixed bottom bar (inset 16px, 56px tall) that jumps to the slip. Account pages use a 200px ruled section list beside the content in a 1152px frame from 768px; on phones the list becomes a scrolling underline strip. Horizontal tracks scroll inside themselves, never the page.

Each event is a row: competition and kick-off meta, the event name in the headline face, then one ruled line per market with the market name in a 180px column and its price boxes in a 2- or 3-up grid. Rows stack with 12px gaps; sections open 32px apart with the head and its 2px rule.

The desks open on title and meta, one ruled figure strip (2 to 4 columns, separated by 1px rules, no outer box), underline tabs, then the agate table. Tables are fixed-layout with 12px cell padding and 8px row padding; first column bold, the rest at 75% ink; a 48px trailing column holds the row's open arrow. Under 768px each row becomes a stacked record with label-left, value-right lines.

## Elevation & Depth

Flat. No surface casts a shadow. Depth is printed: 1px hairline rings (`ring-1`, keyline or 15% ink) around rows, cards and the slip; 1px rules between rows and figures; a 2px ink rule under every section head; solid blue bands for the header, footer, coupon band, slip head and quote panel. State changes fill or rule, they never lift.

### Named Rules
**The Printed Depth Rule.** Separate with a rule, a ring or a solid band. If a surface needs a shadow to read as separate, the layout is wrong.

## Shapes

Rectangular throughout. Customer surfaces use 2px corners (coupon); operator surfaces use 4px (desk); state marks are 8px squares with 1px corners, set on the title line before the text. The bet slip carries a dashed 1px keyline tear between selections and the stake form. The customer header ends in a 4px broken white strip at 40% opacity.

**The Square Corner Rule.** No pills, circles or soft cards. Corners stop at 2px on the coupon and 4px on the desks.

## Components

### Price Box
The coupon's signature. A square-cornered cell (coupon radius, 56px minimum height) with a 2px border at 80% ink, the selection label left in 0.75rem mute and the price right in the figure face. Hover fills with Coupon Well. Marked (`aria-pressed`) fills solid Book Blue with white price and a 75% white label. Suspended or closed selections show their state in place of the price at 45% opacity. Boxes sit 2-up for two-way markets and 3-up (home / draw / away) otherwise.

### Buttons
- **Shape:** coupon radius (2px) on the customer site, desk radius (4px) on the desks; 1px border on every variant.
- **Primary:** solid Book Blue, white 600 text, 40px tall with 16px sides; 48px with 24px sides for slip actions (Get quote, Place bet, Sign in to bet), full width. Hover brightens 10%. On the desks, primary is solid Desk Ink, 32px.
- **Raised:** white with a 25% ink border, ink text; hover darkens the border to full ink. Desk raised is paper with a rule border and Desk Muted hover.
- **Danger:** white with a 50% red border and red text.
- **On band:** the header Sign in is a white raised button with blue text. Secondary band actions (Clear, Sign out) are text buttons with a 15% white ring.
- **Disabled:** 50% opacity, no pointer events.

### Tabs
Every choice set (primary nav, sport rail, catalog view, bet type, account sections, desk filters) is an underline tab row on a 1px keyline. Tabs are mute text; hover goes to ink; the current or pressed tab takes a 2px ink rule (a 2px white rule and white text on blue bands). Vertical rails use the same treatment, left-aligned.

### Coupon Band
A solid Book Blue block (coupon radius, 16px padding rising to 24px) heading the event list: display-face title with a live mark when anything is in play, a tabular meta line (live count, event count, timestamp), the signed-in cash readout right-aligned, then search and the All / Live / Favorites underline tabs.

### Bet Slip
A white column ringed in keyline. Blue head with the slip title and selection count; selections as ruled rows (label, market and event, price, remove); the dashed tear; bet-type tabs, stake and price-change fields in a 2-up grid; a blue quote panel with the parts, a countdown that turns red at 5 seconds, and the potential return as a white readout; full-width primary action. Accepted receipts sit in an emerald-tinted notice with an Antonio head.

### Inputs / Fields
- **Style:** white, 1px border at 25% ink, coupon radius, 44px minimum height, 12px sides; stakes right-aligned in the figure face at 1.125rem. Labels sit above in the label face, mute.
- **Focus:** the border turns Book Blue; the shared 2px outline with 2px offset applies.
- **Disabled:** 60% opacity. Checkboxes are 20px and tinted Book Blue.

### Notices and States
Notices are one line with a state mark: neutral on Coupon Well, alert on a red-50 ground with a red-200 ring, success on emerald. The closed state on the coupon keeps the coupon frame (Event / 1 / X / 2 heads over a 2px ink rule) with one "Betting closed" row; elsewhere it is a single ringed block. The coupon loads as pulsing ringed placeholder rows; account panels load as a ringed block with a spinner and label.

### Navigation
The customer header is a sticky Book Blue band: white logo plate, the book name in Antonio, white underline tabs on a 20% white keyline, sign-in right. Phones swap the tabs for a menu drawer of 2-up items. The footer is a blue band that always carries "Practice play · no real money" with safer-play, support and independent-help links.

### Agate Table (operator desks)
The desks' signature. A white table framed in a 1px rule with desk radius; the head carries the condensed bold section title and count over a 2px ink rule, with actions right. Column heads in the desk table-head face on a 40% Desk Muted band; rows divided by 1px rules, first cell bold with the row's state mark, figures tabular. Empty tables are one ruled line of text. Pagination is a pair of raised buttons and a tabular "page / pages" count.

### Figure Strip (operator desks)
A row of 2 to 4 readouts between top and bottom rules, separated by 1px vertical rules, no outer box: label in 0.75rem mute (with a state mark only for live, waiting or alert), figure in the readout face.

## Do's and Don'ts

### Do:
- **Do** fill a price box solid Book Blue when it is marked, and leave every unmarked box white with a 2px ink border.
- **Do** set every head in Antonio 700 uppercase over a 2px ink rule, and everything else in Geist sentence case.
- **Do** put odds, money, counts and clocks in tabular figures, right-aligned in tables and ledgers.
- **Do** mark state with the 8px square mark on the title line, and map unknown statuses to grey.
- **Do** keep "Practice play · no real money" visible in the customer footer on every page, and safer-play links beside account actions.
- **Do** separate with 1px rules and hairline rings; use solid blue bands for the header, footer, coupon band, slip head and quote panel.

### Don't:
- **Don't** use shadows, inset wells or glows on either world.
- **Don't** round anything past 2px on the coupon or 4px on the desks; no pills, circles or rounded cards.
- **Don't** use pill filters or segmented tracks; choices are underline tabs.
- **Don't** set figures in a monospace face, or use small tracked-caps labels or eyebrows above titles.
- **Don't** use red for anything but live or refusal, or blue as a tint wash.
- **Don't** bring the coupon's blue onto the desks' surfaces; the desks are ink on white with signal marks only.
