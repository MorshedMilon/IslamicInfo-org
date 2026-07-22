# Module 15 — Comparison Mode (US-H19) — Verification

**Date:** 2026-07-22
**Branch:** `feat/hadith-module-15-comparison-mode`
**Spec:** `docs/superpowers/specs/2026-07-22-module-15-comparison-mode-design.md`
**Plan:** `docs/superpowers/plans/2026-07-22-module-15-comparison-mode.md`

---

## 1. DoD-4 — required real 2-hadith Arabic diff example (VERIFICATION NOTE)

Ran the Arabic word-diff on two genuinely different narrations of the "intentions"
hadith that share most of their wording:

- A: `إنما الأعمال بالنيات وإنما لكل امرئ ما نوى`
- B: `إنما الأعمال بالنيات وإنما لكل امرئ ما هاجر إليه`

Output:

```
A differing words: [ 'نوى' ]
B differing words: [ 'هاجر', 'إليه' ]
punct/diacritic-only variant diffs (must be empty): []
```

**Interpretation (confirms the highlight is genuine, not a false positive):**
- The long shared chain `إنما الأعمال بالنيات وإنما لكل امرئ ما` is **not** highlighted.
- Only the true tail difference highlights: `نوى` ("what he intended") vs
  `هاجر إليه` ("what he migrated to") — a real narration-level (matn) difference.
- A variant of A that changes **only** whitespace, punctuation (Arabic comma), and
  diacritics (tashkeel) produced an **empty** diff — **zero false positives**. This is
  the exact guarantee the VERIFICATION NOTE and DoD-4 require.

Diff runs on `arabicMatn` only; translations are shown side-by-side but never
highlighted (§0 / ADR-038). Confirmed in code and unit tests.

## 2. Automated test suite

```
cd worker && node --test "test/*.test.js"
→ tests 343   pass 343   fail 0
```

- `compare-view-core.test.js`: 31 tests (selection Set, ref serde, Arabic
  tokenize/normalize, 2-way LCS diff, 3-way shared-token diff, dormant chain-diverge over
  mock narrator arrays, HTML builders, XSS-escaping, never-throw on malformed input, plus
  3 edge-case tests).
- `hadith-feed-core.test.js`: +1 test for the `compare-add` card button.
- No regressions across the full worker suite.

Parse checks (no node test for DOM controllers, mirroring trace-view.js):
- `node -e "require('./src/js/compare-view.js')"` → ReferenceError (parses; no SyntaxError).
- `node -e "require('./src/js/hadith.js')"` → ReferenceError (parses; no SyntaxError).

## 3. Definition of Done

- [x] **DoD-1** Max 3 items enforced; "Add" disabled at capacity. (`addRef` caps at
      `MAX_COMPARE`; `reflectCompareButtons` disables buttons at capacity — unit-tested +
      wired.)
- [x] **DoD-2** Diff highlighting is a real word-level text diff (LCS for 2, shared-token
      for 3, over diacritic/punctuation-normalized Arabic tokens), not decorative.
- [x] **DoD-3** Mobile ≤900px uses tabs, not squeezed columns. (`applyTabs` emits
      `.cmp-tabbar` + `.cmp-tab-active`; CSS hides side-by-side columns ≤900px.)
- [x] **DoD-4** Verification note satisfied — §1 above.

## 4. Honesty posture (spec §0 / ADRs 037–039)

- [x] Chain-diverge ◆ is **dormant** — `diffChains` is built + unit-tested against mock
      narrator arrays but never called by prod builders (narrator data is universally
      absent). Prod renders the honest "Isnad comparison not yet available — chains are
      being compiled" note. No fabricated ◆ markers. (ADR-037)
- [x] Translation excluded from diff-highlighting (ADR-038). Missing Arabic → honest
      "Arabic unavailable — cannot diff narration", never a translation fallback.
- [x] Selection is in-memory + URL-encoded refs; no new storage key (ADR-039).
- [x] All model-derived strings `esc()`-escaped (XSS unit tests assert this).
- [x] Bonus: replacing the old static Stage-4 mockup **removed** pre-existing fabricated
      content (hardcoded fake Arabic + a fabricated "◆ Chain diverges at Tabi'i level"
      note) from `hadith.html`.

## 5. OUTSTANDING — manual verification (NOT done; requires a human + live data)

These cannot be driven headless and require the Worker/hadithapi reachable for real
hadith data (same deferral as Modules 7–14). **Do not mark these done without a human.**

- [ ] **Live browser flows:** select 2 then 3 hadiths via card "Add to comparison";
      confirm the 4th attempt is blocked + toast; drawer "Compare →" opens
      `/hadith/compare?refs=…` with 2/3 columns; a real Arabic diff highlights only
      differing words; translations are NOT highlighted; the isnad note reads "not yet
      available"; chip × removes an item and updates the URL; dropping to 1 shows "select
      at least 2"; "+ Add Hadith" returns to the feed with the drawer intact; deep-linking
      a `/hadith/compare?refs=…` URL renders on fresh load; a bad ref shows an honest error.
- [ ] **`.diff-highlight` legibility (flagged):** the highlight background uses
      `var(--gold-50)` per the spec's "gold-50 bg" wording, but `--gold-50` is `#FDF8EC`
      (near-white) in light mode, so the highlight may read too faintly against the card
      background. **Confirm in-browser.** If too subtle, a concrete in-token fix is to add
      an inset gold underline (e.g. `box-shadow: inset 0 -2px 0 var(--gold-300/500)`) or
      bump the background to `--gold-100/200` — the token is mode-aware (semi-transparent
      in dark), so keep the dark-mode subtlety in mind.
- [ ] **≤900px tabs:** confirm the tabbar renders and switches columns on a real narrow
      viewport (unit logic present; visual unverified).
- [ ] **VoiceOver / NVDA:** overlay focus-trap + Escape returns focus to the invoking
      element (built on the production-proven trace-view focus-trap; AT not driven headless).

## 6. Ships-live posture

Like Module 14 (ADR-036), Comparison Mode authors no content and runs no LLM — it
reformats already-authenticated matn + honest "not yet available" states — so it carries
no runtime flag and needs no content-review gate. The manual/AT items in §5 remain
outstanding for human sign-off before relying on the live flows.
