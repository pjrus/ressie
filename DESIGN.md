---
name: Ressie
description: A local-first LaTeX résumé workbench — the ledger of drafts and the sheet on the desk.
colors:
  ultramarine: "#2e35d4"
  ultramarine-deep: "#242ab4"
  ultramarine-wash: "#ecedfd"
  ultramarine-ink: "#262ca8"
  warm-paper: "#fbfbf9"
  lifted-white: "#ffffff"
  paper-shade: "#f3f3ef"
  chrome-shade: "#f5f5f1"
  ink: "#15171c"
  muted-slate: "#5f6670"
  hairline: "#e7e7e1"
  input-line: "#d6d6ce"
  brass: "#a96a0b"
  rust: "#b33a1b"
  pine: "#276b4e"
typography:
  display:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.018em"
  title:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.018em"
  body:
    fontFamily: "IBM Plex Sans, ui-sans-serif, system-ui"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "0.625rem"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0.09em"
rounded:
  sm: "0px"
  md: "0px"
  lg: "0px"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "0.75rem"
  lg: "1rem"
  xl: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.ultramarine}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "0 0.875rem"
    height: "2.25rem"
  button-secondary:
    backgroundColor: "{colors.lifted-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 0.875rem"
    height: "2.25rem"
  card:
    backgroundColor: "{colors.lifted-white}"
    rounded: "{rounded.lg}"
    padding: "0.875rem"
  input:
    backgroundColor: "{colors.warm-paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 0.75rem"
    height: "2.25rem"
---

# Design System: Ressie

## Overview

**Creative North Star: "The Ledger & the Sheet"**

Ressie reads as ruled paper, not a dashboard: a faintly warm near-white canvas, square corners without exception, and hairlines doing almost all of the separating that shadows or fills would do elsewhere. Against that quiet field sits exactly one brand colour — a saturated ultramarine — so every appearance of it registers as a decision rather than decoration. This is a workbench someone re-enters daily to revise the same few documents, so the interface stays restrained and a little austere: closer to a well-kept drafting table than a marketing surface.

The second half of the system is **the sheet**. The right-hand pane holds a compiled PDF page, and that page is the only object in the product that is genuinely physical — so it is the one place a real drop shadow is allowed, describing an actual piece of paper lying on a desk. Everything around it stays flat so the sheet can be the thing that lifts.

The two panes are titled by the same ruled band, which is what makes the split read as two columns of one ledger rather than two unrelated applications bolted together.

Confirmed anti-references: no gradients, no glass or backdrop blur, no decorative shadows or glows, no rounded corners anywhere in the system.

**Key characteristics:**
- One brand colour (ultramarine) on a warm near-white ground; everything else is neutral ink/paper or compile-state colour.
- Every corner in the system is square — radius tokens exist by name but resolve to zero.
- Hairline borders (1px, `--border` / `--border-muted`) carry separation that shadow or fill would carry elsewhere.
- All figures are tabular monospace (IBM Plex Mono); display type is Bricolage Grotesque; interface prose is IBM Plex Sans.

## Colours

Warm, restrained and almost monochrome at rest. Ultramarine is the only colour that means "brand"; every other hue on screen is reporting a state.

### Primary
- **Ultramarine** (`#2e35d4`, `--accent`): the sole brand accent — primary buttons, focus rings, active filters, hovered card titles, the resize gutter. Deepens to **`#242ab4`** on hover.
- **Ultramarine Wash** (`#ecedfd`, `--accent-wash`) / **Ultramarine Ink** (`#262ca8`, `--accent-ink`): the tint-and-ink pairing for selected chips, the chosen template row, and hovered menu items — used wherever a full ultramarine fill would shout.

### Neutral
- **Warm Paper** (`#fbfbf9`, `--bg-base`): the page canvas, with a faint warm tint so pure-white cards lift off it without a shadow doing the work.
- **Lifted White** (`#ffffff`, `--bg-surface`): card, panel and popover surfaces — one step whiter than the canvas.
- **Paper Shade** (`#f3f3ef`, `--bg-overlay`): recessed fills — the preview pane, section headers, muted chips.
- **Chrome Shade** (`#f5f5f1`, `--navbar-bg`): the toolbar. Chrome recedes below the canvas so content is the thing that lifts.
- **Ink** (`#15171c`) / **Muted Slate** (`#5f6670`): primary and secondary text.
- **Hairline** (`#e7e7e1`) / **Input Line** (`#d6d6ce`): the default separator, and a half-step darker rule reserved for form controls so fields read as more defined than static dividers.

### Status
Colour outside ultramarine exists only to report the state of a compile:
- **Brass** (`#a96a0b`): saving / in-flight.
- **Rust** (`#b33a1b`): the build failed — the error log, its 3px leading rail, and destructive actions.
- **Pine** (`#276b4e`): saved / compiled.

### Dark mode
Dark mode inverts rather than dims: the canvas becomes near-black ink (`#0e0f12`), cards lift to `#17191e`, and ultramarine itself shifts lighter and slightly desaturated (`#9095ff`) to hold contrast on a dark ground rather than reusing the light-mode hex at reduced opacity. Brass, rust and pine each get their own lighter dark-mode value for the same reason. Light is the default; dark is taken only when the system explicitly asks for it.

### Named rules
**The Colour Reports, It Doesn't Decorate Rule.** Ultramarine is the only brand signal. Brass, rust and pine exist solely to report compile and save state — never as a second brand colour, never applied for variety. A template name is a category, not a status, so its badge stays neutral. If a new element needs colour and isn't reporting brand identity or a state, it stays neutral.

## Typography

**Display:** Bricolage Grotesque — every heading, wordmark, card title and section title, pulled in with `-0.018em` tracking so it doesn't run loose.
**Body:** IBM Plex Sans — all interface prose, inputs, buttons, menu items. Completely neutral.
**Label / mono:** IBM Plex Mono — reserved for anything that is, functionally, a number or a legend.

### Hierarchy
- **Display** (600, 24px): empty-state headlines.
- **Title** (600, 18px / 15px): dialog titles, resume card names, toolbar wordmark.
- **Body** (400, 13px): all interface prose, inputs, table cells.
- **Eyebrow** (mono, 500, 10px, uppercase, `0.09em`): field labels, pane labels, section headings, template badges, tag chips, status text.

### Named rules
**The Tabular Numerals Rule.** Every number that can change — dates, page counts, zoom levels, years — is set in IBM Plex Mono with `font-variant-numeric: tabular-nums`, so a column of figures never shifts width as its digits change.

**The Eyebrow Rule.** Anything that labels rather than says something is a mono caps eyebrow. Prose is never uppercased — note that the eyebrow selector is scoped to `.form-group > label` precisely so nested option rows keep reading as sentences.

## Layout

The dashboard is a single scrolling column at `2rem` page margins: controls, filters, a ruled "recent" list, then the card grid. The editor is a resizable two-pane split — form on the left on warm paper, compiled preview on the right on paper shade — each pane titled by an identical ruled header band, with a 4px gutter between them that turns ultramarine on hover.

Below `640px` the split stacks, the add-section menu becomes a squared bottom sheet, the toolbar overflow becomes a right-hand drawer, and the recent list turns into a horizontal strip where each entry takes a full hairline box instead of the single rule it carries when stacked.

## Elevation & depth

Mostly flat. Shadow is used sparingly and only where it earns its place.

- **Ambient** (`--shadow-sm`, `0 1px 2px rgb(21 23 28 / 0.05)`): resting state for cards and buttons — barely there next to the hairlines doing the actual separating.
- **Hover** (`--shadow-md`): a resume card on hover, paired with a 1px lift and a shift to an ultramarine-tinted border. Also the compiled PDF page, which carries it at rest because it is a real sheet.
- **Overlay** (`--shadow-lg`): dialogs, dropdowns, the quick-actions menu, the mobile sheet and drawer — things that genuinely leave the page's plane.

### Named rule
**The Earned Shadow Rule.** A resting surface stays flat and lets its hairline border do the separating. Shadow escalates only for hover lift, a true overlay, or the compiled page itself. Never for decoration or default "card polish."

## Shapes

Every corner is square. `--radius-sm`, `--radius-md` and `--radius-lg` all resolve to `0` in `frontend/src/styles/variables.css`; components still request a radius by name so the zero stays a single reversible decision rather than something hand-edited per component. Even the bullet marker in the form pane is a 4px square rather than a round dot, and status markers are chips rather than beads.

With no soft corners anywhere, edges carry the structure: hairline rules between recent-resume rows, ruled header bands above each pane, and 1px borders around every card, input and button. The one deliberate flourish is the **3px leading rail** — a solid colour bar on the left edge of the compile error log and of the import result messages, in rust or pine. It is the sharpest visual signal in the interface, reserved for exactly one meaning.

### Named rule
**The Square by Design Rule.** No border-radius anywhere in the product. Every component still asks the theme for a radius by name — the zero is a one-place decision in `variables.css`, so the system could reintroduce curvature in a single line if it ever needed to.

## Do's and don'ts

### Do
- **Do** keep every corner square — reach for a hairline or spacing to differentiate a surface, not a radius change.
- **Do** reserve ultramarine for brand, selection and focus, and brass/rust/pine strictly for compile and save state.
- **Do** set every changing figure in tabular IBM Plex Mono so controls don't shift under the cursor.
- **Do** let shadow escalate only for hover, true overlays and the compiled sheet.
- **Do** keep focus visible — a 2px ultramarine ring on every interactive element.
- **Do** press buttons mechanically (`:active { transform: translateY(1px) }`) rather than lifting or scaling them.

### Don't
- **Don't** add gradients, glows, or backdrop blur — the system is explicitly flat colour on solid ground.
- **Don't** introduce a second brand colour alongside ultramarine; new semantic needs map to brass/rust/pine or stay neutral.
- **Don't** round any corner without a deliberate system-wide decision — that means touching the single `--radius-*` source of truth, not overriding one component.
- **Don't** use colour as the sole indicator of state; pair it with an icon, weight or text.
- **Don't** ignore `prefers-reduced-motion` — all transition and animation durations collapse to near-zero under it, as they already do globally in `base.css`.

## Where the system lives

| File | Holds |
| --- | --- |
| `frontend/src/styles/variables.css` | The whole token layer: palette, radii, shadows, fonts, and the dark-mode inversion. |
| `frontend/src/styles/base.css` | Reset, type rules (mono figures, display headings, the eyebrow), toolbar, buttons. |
| `frontend/src/styles/dashboard.css` | Resume cards, tags, filters, modals, quick-actions menu. |
| `frontend/src/styles/editor.css` | The two-pane split, form fields, section cards, PDF viewer, error log. |
| `frontend/src/styles/responsive.css` | Mobile sheet and drawer, tablet and desktop adjustments. |
| `frontend/index.html` | Loads Bricolage Grotesque, IBM Plex Sans and IBM Plex Mono. |
