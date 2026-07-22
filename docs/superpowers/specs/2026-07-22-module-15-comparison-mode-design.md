# Module 15 — Comparison Mode (US-H19) — Design

**Date:** 2026-07-22
**Covers:** PRD §3.4 US-H19 · TechSpec §3.13
**Status:** Approved (brainstorm) → pending implementation plan
**Precedent:** Module 14 Hadith Trace View (route + full-screen overlay pattern)

---

## §0 — Honesty framing (the governing constraint)

Comparison Mode reads as "diff this narration against that one." The diff must be
**textually honest**:

1. The **Arabic matn IS the narration.** A word-level diff over `arabicMatn` is a
   genuine narration-level diff — every highlighted word is a real difference in the
   narration wording.
2. A **translation diff is NOT a narration diff.** Two translations of the *same*
   narration differ by translator word-choice, not by narration content. Highlighting
   translation differences as if they were matn differences would misrepresent the data.
   Therefore translations are shown side-by-side for reading but **never diff-highlighted.**
3. **Isnad/narrator-chain data is universally absent** in today's dataset (Modules 8 &
   14 render it as honest "not available"). Computing chain-divergence (`◆`) markers with
   no narrator arrays would either render nothing or fabricate content — a §0 violation.
   The chain-diverge layer is therefore **built and unit-tested but dormant in
   production**, showing an honest "not yet available" note; it activates automatically
   when narrator data lands, with no rebuild.

This matches the honest-scaffold posture established across Modules 7–14.

---

## Goal

Let users select 2–3 hadiths and compare their matn (Arabic, word-diffed) and
translation (side-by-side, not diffed) in a side-by-side view, with the isnad/chain
layer scaffolded honestly for future data.

## Scope — IN

- **Selection:** "Add to comparison" in the card action row → in-memory `Set` of refs
  (`slug:book:num`), max 3, no duplicates. At capacity the Add control is disabled.
- **Drawer:** persistent bottom drawer on the feed listing selected items as removable
  chips + a "Compare →" button, enabled at ≥2 selections.
- **Compare view:** full-screen overlay driven by route `/hadith/compare?refs=a,b,c`.
  - Header: "Comparing" label + removable chips (× per item) + "+ Add Hadith".
  - Layout: 2 or 3 equal columns; **≤900px switches to tabs** (not squeezed columns).
  - Each column: collection + number label, Arabic matn, "┃" teal-bar translation.
  - `.diff-highlight` (gold-50 bg, 3px radius) on Arabic matn words that genuinely differ.
  - Honest "Isnad comparison not yet available — chains are being compiled" where the
    `◆` chain-diverge layer will live.
- **Deep-link / share:** `/hadith/compare?refs=…` renders on a fresh load by fetching
  each ref; honest empty/error state for any missing/unfetchable ref.

## Scope — OUT (YAGNI / deferred)

- Live `.chain-diverge ◆` markers (dormant until isnad data exists).
- Translation diff-highlighting (deliberately excluded, §0).
- sessionStorage persistence of the selection Set (in-memory + URL only; no new DATA.md key).
- An in-overlay hadith search/picker for "+ Add Hadith" (it returns to the feed instead).
- Any authored/curated content (no hadith text, grades, or chains authored — 🕌 gate N/A
  because nothing is authored; only already-authenticated data is reformatted).

---

## Architecture

Two new files mirroring the Module 14 split, plus edits to three existing files.

### New: `src/js/compare-view-core.js` (pure, UMD, unit-tested)

`window.II.compareViewCore` in the browser; `module.exports` in tests. **No DOM, no
network.** Self-contained `esc()` matching `ui-utils.escapeHTML` (same as trace-view-core).

Responsibilities:

- **Ref serialize/parse** for the URL:
  - `serializeRefs(refs: string[]) → "a,b,c"` (comma-joined, each ref already
    `slug:book:num`; commas are safe because refs contain only slug/digits/colons).
  - `parseRefs(param: string) → string[]` (split on `,`, trim, drop empties, dedupe,
    cap at 3).
- **Selection set logic** (mirrors `hadith-actions-core` toggle style, but Set-shaped):
  - `MAX_COMPARE = 3`.
  - `addRef(list, ref) → { list, added, full }` — append if absent and under cap; report
    `full` when at capacity.
  - `removeRef(list, ref) → list`.
  - `canCompare(list) → boolean` (≥2).
- **Arabic diff (the honest core):**
  - `normalizeArabicToken(tok) → key` — strip tashkeel/diacritics
    (`ؐ-ؚ`, `ً-ٟ`, `ٰ`), tatweel (`ـ`), and surrounding
    punctuation; used for **comparison only**. The original token is what displays.
  - `tokenizeMatn(text) → [{ raw, key }]` — split on whitespace, attach normalized key.
  - `diffTwo(aTokens, bTokens) → { a: bool[], b: bool[] }` — classic **LCS over `key`**;
    tokens outside the alignment are marked `true` (differing). This is the real,
    order-aware word diff for the 2-item case (DoD-2).
  - `diffMany(tokenLists) → bool[][]` — for N≥2: a token is "shared" iff its `key` is
    present (frequency-aware, via per-list key multiset intersection) in **every** other
    matn; the rest are marked differing. For N=2 this MAY be delegated to `diffTwo` for a
    tighter order-aware result; N=3 uses the shared-token model (order-independent, honest
    "this word isn't in all three"). *(Decision recorded in the plan which path N=2 takes;
    both are honest — LCS is preferred for N=2 precision.)*
- **Column HTML builders:**
  - `buildColumnHTML(hadith, diffFlags) → string` — label (collection + number), Arabic
    matn with `<span class="diff-highlight">` around differing tokens (or honest
    "Arabic unavailable — cannot diff narration" when `arabicMatn` empty), "┃" teal-bar
    translation (plain, never highlighted), and the honest chain-diverge placeholder.
  - `buildCompareHTML(hadiths) → string` — tokenizes, runs the diff, emits all columns.
  - `buildHeaderChipsHTML(hadiths) → string` — "Comparing" + removable × chips + "+ Add".
  - `buildEmptyStateHTML(reason) → string` — honest empty/error (no refs, unfetchable).
- **Dormant chain-diverge (built + tested, inert in prod):**
  - `diffChains(isnadArrays) → { diverge: bool[][], sameChain: boolean }` — computes, per
    narrator position, whether narrators differ across the compared chains; `sameChain`
    true when all chains are identical. **Only invoked when every compared hadith has a
    non-empty `isnad.narrators` array** — which never happens with today's data, so prod
    always renders the honest placeholder. Unit-tested against realistic mock narrator
    arrays (including the "Same chain" case).

### New: `src/js/compare-view.js` (DOM controller)

`window.II.compareView`. Reuses `II.ui.focusTrap` and the Module-14 overlay discipline.

- `open(refs, opts)` / `close(opts)` with `state.open` flag; `isOpen()`.
- On `open`: read refs, fetch any not already in `FEED.byRef` via
  `api.fetchSingleHadith(slug, book, num)` (host-injected; parses each `slug:book:num`
  ref, provider-aware per ADR-024), render via `compareViewCore`, capture focus
  **before** the await
  (production-proven focus-trap ordering), trap focus, wire Escape + chip × + "+ Add".
- `close({ skipNav })`: set `state.open = false` **before** any navigation (prevents the
  popstate reentry loop, exactly as trace-view does).
- Chip × removes a ref → rewrites `?refs=…` (replaceState) → re-renders; dropping below 2
  refs shows an honest "select at least 2" state (does not auto-exit).
- "+ Add Hadith": `close()` back to the feed (selection Set preserved in `hadith.js`).
- Escape / Exit: close overlay; if opened via route, `replaceState` back to `/hadith.html`
  (or prior route), matching trace's exit contract.

### Edit: `src/js/hadith-feed-core.js`

Add a `compare-add` action to the card action row:
`actionBtn('compare-add', 'Add to comparison', SVG_COMPARE)` with a new two-column SVG
icon. `data-act="compare-add"` — wired by the DOM layer (no dead onclick), same as the
existing `trace` button added in Module 14.

### Edit: `hadith.html`

- One `.compare-overlay` (z-index sibling of shell, like `.trace-overlay`), initially
  hidden, no static demo content.
- One `.compare-drawer` fixed to the bottom of the feed, hidden when the Set is empty.
- CSS: columns grid (`repeat(N, 1fr)`), ≤900px → tabbed layout, `.diff-highlight`
  (gold-50 bg / 3px radius, design-token vars only — no raw hex), teal "┃" bar, drawer +
  chip styles. All from existing design-system tokens.

### Edit: `src/js/hadith.js`

- **State:** `state.compareSet = []` (in-memory array acting as an ordered Set).
- **Card wiring:** delegate `data-act="compare-add"` → `compareViewCore.addRef` → update
  drawer; toggle the button's disabled/added state at capacity.
- **Drawer:** render chips from `state.compareSet`; "Compare →" (≥2) calls
  `openCompareRoute()`.
- **Routing:**
  - `parseRoute`: add a branch — `if (path === '/hadith/compare') return { compare: true }`
    (placed before the generic 3-seg match; refs are read from `location.search`, not the
    path, mirroring the grade-filter pattern at `hadith.js:1077`).
  - `routePath`: `{ compare:true }` → `/hadith/compare` (query appended by the caller).
  - `renderRoute`: `if (r.compare)` branch — read refs from
    `new URLSearchParams(location.search).get('refs')`, `parseRefs`, then
    `II.compareView.open(refs, { viaRoute:true })`. Guard: like trace, if the compare
    overlay is open and we navigate to a non-compare route, `close({ skipNav:true })`.
  - `openCompareRoute()`: `history.pushState` to `/hadith/compare?refs=` +
    `encodeURIComponent(serializeRefs(set))`, then `renderRoute`. Navigates
    **programmatically** (not via `<a href>`) so the anchor handler's query-stripping
    regex is bypassed.
  - `popstate` already calls `renderRoute(parseRoute())`; the compare branch reads
    `location.search` fresh, so Back/Forward reconcile correctly.

---

## Data flow

```
[feed card] --click compare-add--> hadith.js: addRef(compareSet, ref)
                                         |
                                         v
                                   render .compare-drawer (chips, Compare→ enabled at ≥2)
                                         |
                        --click Compare→--> openCompareRoute()
                                         |
                     history.pushState('/hadith/compare?refs=a,b,c'); renderRoute()
                                         |
                                         v
            renderRoute(compare) --> compareView.open(refs)
                                         |
              fetch missing refs (api.fetchSingleHadith) ; FEED.byRef cache
                                         |
                                         v
          compareViewCore.buildCompareHTML([h1,h2,h3])  (tokenize → diffMany → columns)
                                         |
                                         v
                     .compare-overlay renders; focusTrap; Escape/×/+Add wired

Deep-link / share:  GET /hadith/compare?refs=a,b,c  (fresh load)
     -> renderRoute reads location.search -> compareView.open fetches each ref
     -> any missing/unfetchable ref -> buildEmptyStateHTML (honest error, no silent blank)
```

## Error / edge handling

- **< 2 resolvable refs** (deep-link with 1 valid ref, or chips reduced to 1): honest
  "Select at least 2 hadiths to compare" state; never a one-column "comparison."
- **Ref unfetchable** (network/404): that column shows an honest per-ref error; the
  compare still renders the resolvable ones if ≥2 remain, else the empty state.
- **Missing Arabic** on a resolvable hadith: honest "Arabic unavailable — cannot diff
  narration" for that column; other columns still diff among those that have Arabic.
- **Same collection / same chain:** diff computed normally; with dormant chain logic the
  isnad note stays the honest placeholder. (Once chains exist: "Same chain" note rather
  than a forced marker.)
- **> 3 refs in a crafted URL:** `parseRefs` caps at 3 (silently drops extras — logged in
  the plan's verification note as a known cap, not silent coverage loss of user intent).
- **All escaping:** every model-derived string (`arabicMatn`, `translation.text`,
  collection/number labels, narrator names) passes through `esc()` (XSS-safe, same as
  trace-view-core).

## Testing

**Unit (`compare-view-core`):**
- `normalizeArabicToken`: tashkeel/tatweel/punctuation stripped; base letters preserved.
- `diffTwo`: identical matns → no highlights; a single changed word → exactly that word
  flagged on each side; whitespace-only and punctuation-only differences → **no** false
  positive (satisfies the VERIFICATION NOTE).
- `diffMany` (N=3): a word present in all three → not flagged; a word missing from one →
  flagged in the ones that have it.
- `addRef`/`removeRef`/`canCompare`: max-3 enforced, dedupe, `full` flag, ≥2 gate.
- `serializeRefs`/`parseRefs`: round-trip, cap at 3, drop empties/dupes.
- `diffChains` (dormant): over mock narrator arrays, computes divergence flags and the
  `sameChain` case correctly — proving the logic is real and will light up with data.
- HTML builders: `.diff-highlight` wraps only flagged tokens; translation never wrapped;
  honest placeholders emitted for empty Arabic / empty chains; all output escaped.

**DOM smoke (`compare-view`):** overlay open/close, focus captured before await, Escape,
chip × updates URL + view, "+ Add" returns to feed with Set intact.

**Deferred (flagged, not marked done):** manual VoiceOver/NVDA focus-trap verification and
live-browser route/overlay/deep-link flows — same deferral as Modules 7–14 (needs
Worker/hadithapi reachable for real hadith data).

## Definition of Done (from the module spec)

- [ ] Max 3 items enforced; UI disables "Add" at capacity.
- [ ] Diff highlighting is a real word-level text diff (LCS/shared-token over normalized
      Arabic tokens), not decorative.
- [ ] Mobile ≤900px uses tabs, not squeezed columns.
- [ ] Verification note satisfied: one real 2-hadith Arabic diff example showing the
      highlighted words are genuinely different, not whitespace/punctuation false positives.

## DECISIONS log entries (to append to `docs/DECISIONS.md`)

1. **Chain-diverge `◆` not shipped live.** Isnad/narrator data is universally absent
   today; computing divergence with no narrator arrays would render nothing or fabricate
   content, violating §0. The `diffChains` logic is built and unit-tested against mock
   data but dormant, activating automatically when narrator data lands. Honest
   "not yet available" placeholder shown in prod.
2. **Translation text excluded from diff-highlighting.** Per §0, translator wording
   differences are not narration differences; highlighting them as such would mislead.
   `.diff-highlight` runs only on `arabicMatn`. Translations shown side-by-side, unhighlighted.
3. **Compare selection is in-memory + URL-encoded refs** (`/hadith/compare?refs=…`), no
   sessionStorage/new DATA.md key. Deep-links/shares work via fresh per-ref fetch; a
   narrower "lost selection on accidental reload" case is deferred until it proves real.
```