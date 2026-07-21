# Module 7 — Tier 3a Hadith-in-Book List & Tier 3b Deep-View Page

**Date:** 2026-07-21
**Branch:** `feat/hadith-module-1-foundation`
**Covers:** PRD §3.2 US-H09/H10, §4.7 · TechSpec §2.7 (block order), §3.5 (deep-link scroll), §5.2 (partial-fetch empty states) · PRD DoD-15 (Lighthouse)
**Status:** Approved 2026-07-21 — ready for implementation plan.

---

## 1. Goal

Build the scoped hadith-in-book list (**Tier 3a**, `/hadith/[collection]/[book]`) and the
single-hadith deep-view page (**Tier 3b**, `/hadith/[collection]/[book]/[hadith]`) — the
canonical, shareable URL for every hadith. Tier 3b is the Lighthouse CI benchmark route
(`bukhari/1/1`).

## 2. Context this builds on (verified in recon)

- **Routing (ADR-026):** client-side SPA on GitHub Pages via History API. `renderRoute()`
  in `src/js/hadith.js` dispatches tiers; `renderTier3Placeholder(r, c)` is the current stub
  Module 7 replaces (it currently serves BOTH `/hadith/[collection]/[book]` and
  `/hadith/[collection]/[book]/[hadith]`). `parseRoute` yields `{collection, book, hadith}`;
  `routePath` builds the canonical URL; `wireRouting` intercepts `/hadith/*` `<a href>` clicks.
- **Card component (Module 4):** the canonical runtime builder is
  `II.hadithFeed.buildCardHTML(h)` in `src/js/hadith-feed-core.js` (pure, unit-tested,
  string-returning). Its footer `data-act="full"` button is the Tier 3b entry point. Tier 3a
  reuses this builder **as-is** — no second card component.
- **Data client:** `api.fetchHadithList(slug, book, page, limit)` (Tier 3a) and
  `api.fetchSingleHadith(...)` / `fetchHadithOne(slug, book, num)` (Tier 3b).
- **Grade badge:** `gradeParts(h)` + `gradeBadgeHTML(p)` in `hadith-feed-core.js` already
  render `"<Grade> · grader not individually cited"` for the always-null live `grader`, and
  never emit blank/undefined (verified `hadith-feed-core.js:42-46, 100-101`). **Not a DoD-8
  gap** — it is the intended permanent behavior per ADR-022/024. Tier 3b reuses this exact
  pair for both the enlarged body-card badge and the alternate-gradings table, so the two can
  never disagree.

### Live data reality (drives every "unavailable" state below)

The single-hadith payload (`normalizeHadith`, `worker/src/lib/hadith-adapter.js`) returns:

| Field | Live value | Consequence for Tier 3b |
|---|---|---|
| `isnad.narrators` | `[]` (always) | Isnad block renders honest "not available" |
| `grade.grader` | `null` (always) | "grader not individually cited" fallback |
| `grade.alternateGradings` | `[]` (always) | Gradings table = single honest row + gap note |
| `translation` | single object, `en` (or `ar`) | One tab only; no dead tabs |
| `topics` | `[]` (always) | Topics chips hidden |
| `audio` | `unavailable` | (existing feed behavior) |

None of these are fabricated to fill the spec. This is consistent with the Stage-1
"honest unavailable, never faked" posture and the binding decisions in the
`hadith-module-decisions` memory.

## 3. File structure (decision)

- **New file `src/js/tier3-deep-view.js`** (TechSpec's planned name), exposing `II.tier3`.
  Houses **both** the Tier 3a scoped-list render and the Tier 3b deep-view render — they
  share routing/data plumbing and 3a's "Open →" flows into 3b. Pure render helpers kept
  separable for unit testing (mirroring `hadith-feed-core.js`).
- **CSS stays inline** in `hadith.html` `<style>`, matching Modules 1–6.
- `renderRoute` / `renderTier3Placeholder` in `src/js/hadith.js` rewired to call
  `II.tier3.renderList(r)` and `II.tier3.renderDeepView(r)`.

**General convention (record in DECISIONS.md, applies to Modules 8+):** any module whose JS
would meaningfully bloat `hadith.js` gets its own feature-named file (e.g. `tier3-deep-view.js`,
`narrator-panel.js`, `trace-view.js`). CSS stays inline everywhere until/unless we deliberately
run a full whole-page CSS extraction as its own planned pass — not per-module. Modules 8+ do
not re-ask this.

## 4. Tier 3a — `/hadith/[collection]/[book]`

- **Sticky header:** `"[Collection] › [Book name] · N hadiths"`; the collection segment links
  back to Tier 2.
- **List:** `api.fetchHadithList(slug, book, page, 25)` → each item rendered with the existing
  `II.hadithFeed.buildCardHTML` (reused as-is). Card's `data-act="full"` routes to Tier 3b via
  `routeTo`.
- **Grade filter pills:** reuse Module 2 machinery; `?grade=` deep-link preserved.
- **Prev/Next book nav** at the bottom, derived from the collection's book list (same source
  Tier 2's `loadBooksGrid` uses).
- **Bookless collections** (`riyad-assalihin`, `nawawi40`, `musnad-ahmad`) already route
  straight here (ADR-026 `BOOKLESS` map); Tier 3a handles a null/`0` book segment gracefully.
- **Generalization note:** the Module-2 feed is currently hard-locked to Bukhari Book 1. Tier 3a
  must load an arbitrary `slug`+`book` from the route. Approach: Tier 3a owns its own scoped
  list loader in `tier3-deep-view.js` calling `fetchHadithList(routeSlug, routeBook, …)` +
  `buildCardHTML` per item, rather than mutating the shared Tier-1 `FEED` state. Grade-filter
  DOM show/hide helpers are reused.

## 5. Tier 3b — `/hadith/[collection]/[book]/[hadith]` (block order EXACTLY per TechSpec §2.7)

1. **Page header** — breadcrumb (`Hadith › Collection › Book · Name › Hadith N`, collection →
   Tier 2, book → Tier 3a) + 🔖 / ↗ / 📋 action buttons. Buttons render with honest `data-act`
   hooks; **wiring deferred to Module 10** (no dead `onclick`).
2. **Hadith body card** — enlarged variant of the same markup shape as the feed card; Arabic
   **≥24px**. A CSS size-variant class (e.g. `.hadith-card--deep`), not a parallel structure.
   Badge via shared `gradeParts`/`gradeBadgeHTML`.
3. **Isnad chain — INLINE** (deliberately not modal, unlike the feed card). Live `narrators:[]`
   → honest state ("Chain of narration not available for this hadith"). Renders real nodes the
   moment `narrators[]` is populated — data-gated only, no UI rework needed.
4. **Alternate gradings table** — single honest row: grade badge + "grader not individually
   cited" + gap note *"Additional scholarly gradings not yet available for this narration."*
   The multi-row table structure is preserved for future curated data. **Never a fabricated
   second scholar.** (Religious-accuracy gate: live = all single-sourced, none invented.)
5. **Translation tabs (EN · UR · FR · ID · TR)** — full tab-bar component + localStorage
   translation-preference machinery built now, but **only a tab per language actually present
   in the payload is rendered.** Explicit rule: render the tab strip **only when ≥2 languages
   are present**; with a single language (today: EN alone) render the translation block with **no
   tab strip at all**. **Zero dead/disabled tabs.** The saved preference is honored the instant a
   second language lands.
6. **Topics chips** — hidden while `topics:[]` (always, live).
7. **Related narrations** — placeholder section; **Module 11** fills it.
8. **Previous / Next hadith nav** — within the same book, derived from the book's hadith list
   (neighbors by list order, not by assuming contiguous `hadithNumber`).

### Out of scope for Module 7 (confirmed deferrals)

- **Trace View** (§2.8, `.trace-layout`, Stage 4) — deep-view leaves a hook, does not build it.
- **Reading-path strip** ("Reading: [Path] · Hadith N of M", Stage 4) — hook only.

## 6. Error handling (FIX-4 / TechSpec §5.2)

- Per-block `—` fallback on partial fetch failure (each block degrades independently).
- **"Hadith temporarily unavailable"** specifically on the body block when the core fetch fails.
- **Prev/Next stays functional** even if the current hadith's data partially failed (nav is
  derived from the book list, not the failed single-hadith payload).

## 7. Side-artifacts

- **TASKS.md:** content-sourcing item — "Source additional translation editions (UR/FR/ID/TR)
  for hadith deep-view"; flagged **unblocked-by-engineering, blocked-by-content-sourcing** (the
  tab machinery is done; only content is missing).
- **DECISIONS.md:** the §3 file-structure convention entry.
- **Unit tests** (Worker `node:test`, mirroring `hadith-feed-core.test`): pure render helpers —
  deep-view block builders, prev/next neighbor resolution, translation-tab selection (present
  languages only), gap-note rendering, and per-block empty-state fallbacks.

## 8. Definition of Done

- [ ] Every hadith has a canonical, shareable URL (`/hadith/[collection]/[book]/[hadith]`).
- [ ] Deep-view block order matches TechSpec §2.7 exactly.
- [ ] Alternate gradings never show a fabricated second scholar (single honest row + gap note).
- [ ] Body-card + gradings-table grade badges share one source of truth (`gradeParts`).
- [ ] Tier 3a reuses `buildCardHTML` as-is (no second card component).
- [ ] Translation tabs render only present languages; localStorage machinery in place.
- [ ] Per-block partial-failure fallbacks; body-block "temporarily unavailable"; Prev/Next
      survives partial failure.
- [ ] TASKS.md + DECISIONS.md entries added.
- [ ] Unit tests pass (`npm test` / Worker `node:test`).
- [ ] Lighthouse Perf/A11y/Best-Practices/SEO ≥ 90 on `bukhari/1/1` — **run it if the
      environment allows; otherwise state explicitly it was not run rather than claim a score.**

## 9. Verification note (required at session end)

- Report actual Lighthouse scores if runnable in this environment; else say so explicitly.
- List which alternate-gradings entries were verified via hadith-verifier vs left
  single-sourced (live expectation: all single-sourced, none fabricated).
