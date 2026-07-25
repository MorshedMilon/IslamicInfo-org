# Light-mode body color + three-font system swap

**Date:** 2026-07-25
**Status:** Approved (owner-directed override of the locked design system)
**Scope:** All 14 site pages' inline `:root` tokens + Google Fonts links; DESIGN-SYSTEM.md
+ brand skill. Dark mode is NOT touched.

## Owner decisions
1. Override the **locked** design system (charter invariant) — authorized by the owner;
   update DESIGN-SYSTEM.md + `skills/main/SKILL.md` to match.
2. Darken muted text too (nav/labels/captions), not only body copy.
3. Use the specified **16.5px** base size.

## Changes (light `:root` only — never `[data-theme="dark"]`)

### Color
- `--ink-body: #243738` → **`#111111`** (drives body copy, inputs, table text).
- `--ink-muted: #6D797A` → **`#3A4A4B`** (drives nav links, labels, captions; kept one
  step lighter than body for hierarchy). Contrast on light surfaces ≈ 8.4:1 (AA pass).
- `#111111` on `#F4F7F7`/`#FAFBFB`/white ≈ 17–19:1 (AA + AAA pass).
- Dark-mode `--ink-body: #D4DCDD` and `--ink-muted: #9AAAAB` **unchanged** (replacements
  match only the light hex values, so dark values are never touched).

### Fonts (three roles)
- `--font-serif` / `--font-display` → **Cormorant Garamond** (unchanged; already drives
  H1–H3, `.r-title`, `.oc-topic`, wordmark, `em` accents).
- `--font-body` value → **`'Libre Baskerville', Georgia, serif`**, and **add**
  `--font-sans: 'Libre Baskerville', Georgia, serif`. All existing `var(--font-body)`
  references (body, nav, buttons, inputs, tables) update automatically.
- `--font-mono` value → **`'Shippori Mincho', ui-monospace, 'SF Mono', monospace`** (all
  numeric/machine text already uses `var(--font-mono)`: KPIs, counts, timestamps, pills,
  chips, code). The `ui-monospace` fallback is kept **before** falling through so a failed
  Shippori load still yields a monospace for numbers.
- `--font-arabic` (**Amiri**) **untouched** — Arabic Quran/hadith text must not render in a
  Latin serif.
- Base: `html { font-size: 15px }` → **`16.5px`** (weight 400 default).

### Font loading — one canonical Google Fonts link on all 14 pages
Replace each page's `css2` href (currently drifting: varying weights, Inter, some
JetBrains Mono) with a single canonical URL:
```
https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Shippori+Mincho:wght@400;500;600;700&family=Amiri:ital,wght@0,400;0,700;1,400&display=swap
```
Drops **Inter** and **JetBrains Mono**; keeps Cormorant + Amiri; adds Libre Baskerville +
Shippori Mincho. `display=swap` + full fallback stacks (`Georgia, serif` / `ui-monospace`)
guard against web-font load failure.

## Known tradeoffs (accepted, documented)
- `--font-sans`→Libre Baskerville and `--font-mono`→Shippori Mincho are **serifs**; the
  variable names are role labels, not classifications.
- Libre Baskerville ships only 400/700 (+400i): existing `font-weight:500/600` on body
  text renders as 400 (browser may synthesize). Headings keep Cormorant weights.
- Shippori Mincho is **not monospaced** → digits are proportional. Add
  `font-variant-numeric: tabular-nums` to numeric table/KPI columns where alignment
  matters (audited during implementation).

## Out of scope
- Canvas share-card fonts (`quran-share-core.js` TOKENS) — a separate rendering system
  with its own font set; deliberately unchanged.
- Any layout redesign beyond the size bump.

## Implementation & verification
- A Node transform script applies value-based replacements per page and prints per-file
  change counts; every page must show exactly: ink-body ×1, ink-muted ×1, font-body ×1
  (+font-sans added), font-mono ×1, base-size ×1, css2 link ×(its count). Any 0/unexpected
  count is investigated before commit.
- Audit for hardcoded `font-family:'Inter'|'JetBrains Mono'` literals bypassing the vars;
  spot-fix.
- Grep gates: no light `--ink-body:#243738` remains; dark `#D4DCDD`/`#9AAAAB` intact
  (14×); `--font-sans` present 14×; `16.5px` base 14×; no `Inter`/`JetBrains` in links.
- Visual check in light + dark on representative pages (home, quran, hadith, tools).
