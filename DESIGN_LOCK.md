# DESIGN LOCK

**Status: LOCKED — 2026-07-30, approved by the project owner (Morshed Milon).**

The design system is not open for edits. If a task seems to require changing
anything in this document, stop and ask the owner first. "It looked better to me"
is not an approval.

---

## 1. Single source of truth

All design tokens live in **[`src/css/tokens.css`](src/css/tokens.css)**.

Every page links it in `<head>` *before* its own inline `<style>`:

```html
<link rel="stylesheet" href="/src/css/tokens.css?v=20260730">
<link rel="stylesheet" href="/src/css/fonts.css?v=20260730">
```

Do **not** re-declare a token inside a page. Before this lock, all 18 pages
carried their own duplicated `:root` block — 987 duplicate declarations, which is
how the system drifted apart in the first place. If you find yourself copying a
token into a page, you are recreating that bug.

`404.html` is excluded: it is a JavaScript redirect shim with no visible UI.

## 2. The three font roles

Locked by the owner. There are three fonts and each has exactly one job.

| Token | Font | Owns |
|---|---|---|
| `--font-serif` | Cormorant Garamond | H1 / H2 / H3, page titles, card and row titles (`.r-title`, `.oc-topic`), the wordmark, `<em>` gradient/gold accents |
| `--font-sans` | Baskerville — Libre Baskerville is the web fallback | Everything else: body, nav, buttons, labels, inputs, table text. Body base **16.5px / 400** |
| `--font-mono` | Shippori Mincho | **All numbers and machine-ish text**: KPI values, counts, currency, deltas, percentages, timestamps, freshness lines, kbd hints, pills, chips, scores, IDs, code |

`--font-arabic` (Amiri) is for Arabic script only.

**`--font-display` and `--font-body` are deprecated aliases.** They exist only so
nothing breaks if a page is missed. Every call site in the repo has been migrated
off them (405 rewrites across 14 pages). Never add a new use of either — and
never hardcode a family name in a `font-family:` declaration.

Rule of thumb for the mono role: if a human would read it as *data* rather than
as *prose*, it is mono. Note that a class name is not evidence — `.about-stat-num`
holds prose ("Qur'an, Hadith & Duas"), so it is serif.

## 3. Fonts are self-hosted, and the build script is load-bearing

`src/css/fonts.css` and everything in `src/fonts/` are **generated** by
`scripts/build-fonts.mjs`. Do not hand-edit either. Run:

```
node scripts/build-fonts.mjs
```

⚠️ **The regression this lock exists to prevent.** That script once read each
subset label from the wrong block. Google Fonts prints the label as a comment
*before* each `@font-face`, so splitting the CSS on `"@font-face"` leaves face
N's label in chunk N-1. Every subset name shifted by one, the real basic-Latin
face (`U+0000-00FF` — all normal English text) collided with an already-taken
filename and was silently skipped, and its `@font-face` ended up pointing at the
Vietnamese woff2. Shippori Mincho got no basic-Latin face at all, so `--font-mono`
numerals silently fell back to generic monospace.

Nothing in the CSS looked wrong. `document.fonts.check()` returned `true`. The
only visible symptom was that headings rendered ~25% wider and heavier, which
read as "the design drifted."

**How to verify a font change — measure, do not read.** Render the text and
compare its width against a known-good source:

```js
// homepage hero, 78px / 600, letter-spacing -.025em, 880px container
// real Cormorant Garamond : 845.6px  -> H1 fits on two lines  ✅
// the broken build        : 1056px   -> H1 wraps to three     ❌
```

The script now throws on a filename collision instead of dropping a face. Keep
that guard.

**When you regenerate fonts, bump the `?v=` on both stylesheet links.** The woff2
filenames do not change, only their bytes, so returning visitors would otherwise
keep the broken files.

## 4. Approved page-level overrides

These are the *only* places a page may legitimately re-declare a token. Anything
else in a page's `:root` is drift and should be deleted.

| Pages | Override | Why |
|---|---|---|
| `about`, `contact`, `dua`, `inheritance`, `privacy`, `terms` | `--grade-hasan: #5D8A3A`<br>`--grade-daif: #A86932` | Pre-contrast-pass grading colours. **These should be retired** — the canonical darker pair (`#4A7030` / `#8A5228`) is in `tokens.css`. Needs a visual check on the grading badges before removal. |
| `tools` | `--grade-daif: #A86932` | Same as above. |
| `sign-in`, `sign-up`, `forgot-password` | Separate teal/gold palette (`--teal-900: #0F2A2C`, `--teal-800: #003F44`, `--teal-50: #EAF5F5`, `--gold-300: #E2C896`, `--gold-50: #FBF6EA`), `--surface: #0C1A1C` in dark | The mock auth pages were built against a slightly different palette. Harmonise when real auth lands. |
| `habits`, `sign-in`, `sign-up`, `forgot-password` | `--ease-premium: cubic-bezier(.25,.46,.45,.94)` | Identical curve to canonical, different notation. Cosmetic; safe to delete. |

## 5. What is locked

- **No new colours and no new fonts.** Compose from `tokens.css`.
- **No raw hex in a page.** Use a token. The 30 generated `duas/**` pages still
  carry a private token block with raw hex (`#7A6A45`, `#223436`, `#0C1A1C`) —
  that is known outstanding work, not a precedent.
- **No `backdrop-filter` removal.** The glass surfaces are part of the identity.
- Light-mode `--ink-body: #111111` and `--ink-muted: #3A4A4B` are the
  WCAG-corrected values. **Do not lighten them back**, even to match an old
  mockup.

## 6. Careful with old mockups

Mockup HTML files predating 2026-07 carry the *pre-override* typography:
`--font-body: 'Inter'`, base `15px`, `--ink-body: #243738`, `--ink-muted: #6D797A`,
and a Google Fonts `@import`. Matching those would undo both the locked font
table and the contrast fix. **`tokens.css` wins over any mockup.** If a mockup and
this document disagree, raise it with the owner rather than guessing.

## 7. Verifying a design change

Do not claim a design change works from reading CSS. Measure it in a real browser
— `playwright-core` with `chromium.launch({channel:'chrome'})` against a local
static server is already set up and works on this machine.

The check that guards this lock: snapshot every resolved custom property on every
page in light and dark, make the change, snapshot again, and diff. Normalise
whitespace and quote style when comparing values (a pretty-printed `tokens.css`
against a minified inline block is not a change), and compare the *computed*
font/size/weight/colour of the key roles verbatim. Disable transitions before
sampling — the theme swap animates `color`, and sampling mid-transition produces
1–3 RGB units of noise that reads as a false regression.

The consolidation this document describes was landed with **0 real token changes,
0 rendered role changes, and 330 previously-undefined tokens newly resolving**
(`islamic-studies.html` was referencing `var(--font-body)` without ever defining
it).
