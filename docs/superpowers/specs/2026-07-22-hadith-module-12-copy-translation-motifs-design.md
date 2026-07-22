# Hadith Module 12 — Copy with Attribution, Translation Compare & Illustrated Motifs

**Date:** 2026-07-22
**Branch:** `feat/hadith-module-12-copy-translation-motifs`
**Covers:** PRD §3.3 US-H16/US-H17, §3.4 US-H23 (translation row) · TechSpec §3.11
**Status:** Design approved (brainstorming) — pending spec review, then writing-plans.

---

## 0. Framing — reconcile, not greenfield

The build prompt assumed a monorepo (`/packages/ui/src/illustrations/`, `src/js/hadith.js`
as a standalone) and a greenfield copy feature. **The repo differs** (same pattern as
Modules 8/9/10/11):

- **No monorepo, no SVG asset directory.** The site is static + a Cloudflare Worker.
  Icons are **inline SVG in `hadith.html`**. There is no `packages/` and no `assets/svg`.
- **Copy is already shipped.** Module 10 merged `buildCopyText()` + `onCopy` + a toast to
  `main` (live in prod). Module 12 *reshapes* that function; it does not create it.
- **Translation data is single-edition.** The adapter returns exactly one
  `translation: { text, language, edition: 'hadithapi.com', translator: null }` per hadith.
  No Darussalam / USC-MSA / Siddiqui editions exist in provider data.
- **9 collections, not 18.** `src/data/hadith/collections-meta.json` has 9 real collections.
  The PRD's 18 is aspirational (same gap as Module 1/2's held collections and Module 11's
  "16 vs 14").

All three sub-features are therefore built as an **honest engineering slice**: real plumbing
that upgrades automatically when data lands, and **zero fabricated content**.

---

## 1. Feature A — Copy with attribution (US-H16)

### A.1 Reshape `buildCopyText(content)` (pure core, `hadith-actions-core.js`)

Rewrite from the current multi-line format to the M12 single-string layout, with honest
fields:

```
"{translation}" — Narrated by {narrator}. {reference}. Grade: {grade}. Source: {sourceUrl}
```

**Field rules (all non-fabricating):**

| Field | Source | Honest handling |
|---|---|---|
| `{translation}` | `content.translation` (displayed `.hadith-text`) | wrapped in `"…"`; if empty, clause omitted |
| `{narrator}` | `content.narrator` (displayed `.hadith-narrator`) | **de-double**: if it already starts with `Narrated`, emit verbatim (minus trailing `:`); else prefix `Narrated by `. Omit clause if empty |
| `{reference}` | `content.reference` — already `"{Collection} · Book N · Hadith N"` | maps 1:1, no parsing. **Required** — returns `''` if absent |
| `{grade}` | `content.grade` (displayed `.grade-badge` text) | verbatim (displayed = sourced). For the 8 ungraded collections this is the characterization string. **`(grader, year)` clause is omitted** — both are `null` in our data and are never fabricated (binding rule, hadith-module-decisions) |
| `{sourceUrl}` | built in `onCopy`, passed in as `content.sourceUrl` | `https://islamicinfo.org` (constant canonical origin) `+ routePath(parseRefParts(ref))`. Not `location.origin` — a localhost URL must never leak into a citation. Clause omitted if absent |

**Invariant preserved:** returns `''` when `content.reference` is missing → the platform never
copies an unattributed hadith via this button.

### A.2 `onCopy` (DOM wiring, `hadith.js`)

- Compute `content.sourceUrl = CANONICAL_ORIGIN + routePath(parseRefParts(ref))` (both helpers
  already exist; `onShare` uses them). Add `CANONICAL_ORIGIN = 'https://islamicinfo.org'`.
- Toast copy changes from `Copied with attribution` → **`Copied with citation ✦`**
  (2.5s; reuse the existing `ui.showToast` — no second toast implementation).
- Keep the `navigator.clipboard` → `execCommand('textarea')` fallback already in place.

### A.3 Arabic-only copy button (new)

- New action button on the card action row (`data-act="copy-arabic"`), wired through the
  existing delegated `wireCardActions` handler.
- Copies **bare `.hadith-arabic` matn text only** — no attribution, per the literal spec
  (TechSpec §7.5: the Arabic-only button is the single reduced-copy option). Toast:
  `Copied Arabic text ✦`.
- **Authenticity note (for the 🕌 review gate):** this is a deliberate, non-fabricating
  decision, confirmed with the product owner. The Arabic matn is already displayed on-page
  with full attribution immediately adjacent; a bare-Arabic copy is functionally equivalent
  to the user manually selecting that Arabic text and pressing Ctrl+C. It **invents nothing**
  — fabrication (inventing a source, grader, year, or translation) is what the no-fabrication
  invariant guards against, and none occurs here. Attribution remains the main Copy button's
  job; the two buttons stay distinct.

### A.4 Tests (`worker/test/hadith-actions-core.test.js`)

- **Update** the 3 existing `buildCopyText` tests (lines ~125–138) to the new single-string
  format.
- **Add**: grade-with-no-grader (no `(…, …)` clause appears), sourceUrl included when present,
  narrator de-doubling (no `Narrated by Narrated …`), and the no-reference→`''` guard holds.

---

## 2. Feature B — Translation compare (US-H23 row)

### B.1 `buildTranslations(hadith)` (new pure core)

- Returns an array of only the editions **actually present** in provider data — filters out
  entries with empty `text`; **omits `translator` when null** (same never-fabricate rule as
  grader). Today this yields length 1.
- Each entry: `{ text, language, edition, translator? , primary: bool }`.

### B.2 Render (`hadith.js` + `hadith.html`)

- **length === 1** → render a single translation row, no tabs, no compare chrome (current
  visual is unchanged).
- **length > 1** → render stacked translations (up to 4), primary highlighted, tab/row
  selection, preference persisted. **This path activates automatically when multi-edition data
  ever lands** — it is not shown today because no such data exists. Never render an edition
  that is not in the array.

### B.3 Preference key

- New localStorage key `islamicinfo-hadith-translation-pref` (value = preferred `edition`
  string). **Registered in `doc/DATA.md`.** Dormant until multi-edition data exists.

---

## 3. Feature C — Illustrated motifs (US-H17)

- Replace the emoji in each `.card-motif` in `hadith.html` with a custom **inline SVG**
  (matching the existing inline-icon convention — no new asset directory, since none exists),
  for the **9 real collections**: `sahih-bukhari`, `sahih-muslim`, `abu-dawood`, `al-tirmidhi`,
  `sunan-nasai`, `ibn-e-majah`, `musnad-ahmad`, `mishkat`, `al-silsila-sahiha`.
- Spec per PRD: `viewBox="0 0 64 64"`, `currentColor` stroke line-art + a **single**
  `var(--gold-500)` accent, readable at 32px, **no fills** beyond the gold accent. Styles:
  8-pointed star variants, arabesque corners, calligraphic ligatures.
- **Per-asset** light + dark legibility verification (gold accent on dark surface) via a new
  dev fixture `tools/hadith-module12-fixture.html` (mirrors `tools/hadith-module11-fixture.html`,
  `?theme=dark` toggle). This is a per-SVG check, not a spot check.
- The other 9 motifs are **deferred** until those collections exist in the platform.

---

## 4. Files touched

| File | Change |
|---|---|
| `src/js/hadith-actions-core.js` | reshape `buildCopyText`; add `buildTranslations`; export both |
| `worker/test/hadith-actions-core.test.js` | update 3 copy tests; add copy + translation tests |
| `src/js/hadith.js` | `CANONICAL_ORIGIN`; `onCopy` sourceUrl + new toast; Arabic-only handler; translation panel render/wire |
| `hadith.html` | 9 inline SVG motifs; Arabic-only copy button; translation panel markup |
| `doc/DATA.md` | register `islamicinfo-hadith-translation-pref` |
| `tools/hadith-module12-fixture.html` | new — motif light/dark verification harness |

---

## 5. Out of scope / deferred

- Multi-edition compare **activation** (no data) — plumbing ships dormant.
- 9 motifs for collections not yet in the platform.
- Tier-3b deep-view copy / translation rows (deferred per the Module 10 boundary).

---

## 6. Definition of Done

- [ ] Copy payload matches the spec's single-string layout, honest fields, verified against a
      **real example** (pasted in the verification note), character-for-character.
- [ ] No translation edition rendered that is not actually present in data; translator omitted
      when null.
- [ ] All 9 motifs legible in both themes at 32px and 64px (per-asset check).
- [ ] `buildCopyText` still returns `''` with no reference (unattributed-copy guard holds).
- [ ] Full test suite green (existing copy tests updated, not just source).

---

## 7. Authenticity decisions log (for 🕌 review gate)

1. **No fabricated grade/grader/year.** The `(grader, year)` clause from the raw spec template
   is omitted because both are `null` in provider data. Grade text is the displayed (sourced)
   value; ungraded collections show characterization, not an invented grade.
2. **No fabricated translator.** `translator` omitted when null.
3. **Arabic-only copy is bare matn by deliberate decision** (§A.3) — non-fabricating, product
   owner confirmed. Main Copy button remains fully attributed; unattributed-copy guard on the
   main button is unchanged.
4. **Content authored: none.** No new hadith text, isnad, grade, narrator, or citation data is
   created in this module. Still 🕌 review-gated like all hadith modules.
