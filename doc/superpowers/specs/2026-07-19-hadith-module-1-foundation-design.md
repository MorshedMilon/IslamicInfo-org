# Hadith Module 1 — Stage 1 Foundation (Sidebar · Collections · Stats · Hadith of the Day)

> Design spec · 2026-07-19 · Page: `hadith.html` (Hadith Library)
> Branch: `feat/hadith-module-1-foundation` (stacked on `feat/hadith-module-0-foundation`)
> Status: **Approved** (design), → implementation plan
> Depends on: Module 0 (`/api/hadith/*` endpoints, `window.II.api.fetchHadith*`, `window.II.ui`)

---

## 1. Purpose & Scope

Wire the **Stage-1 static regions** of the locked `hadith.html` to real Module 0 data,
with **no visual redesign** — only the minimum markup for loading / error / empty /
a11y / route-shell / bottom-sheet states. Mockup content is placeholder → replaced by
live/cached normalized data at render.

**In scope (locked elements):** `aside.sidebar` (collection rows, `.count-badge`,
`.sidebar-section-label`, classical-scholar rows, `.reading-path-row` display shell,
`.sidebar-cta`), `.stats-strip`, `.daily-strip` (Hadith of the Day), `.collections-grid` /
`.collection-card`, collection filter tabs, "Browse →" affordances, a new hero
"Continue Reading" slot, mobile bottom-sheet.

**Out of scope (later modules):** hadith feed / grade filter (Module 2), isnad panel
(Module 3), Tier-2 books view (Module 4), reading-path progress (Module 7), full
bookmark/notes system, multi-provider aggregation (dedicated backend module).

---

## 2. Resolved Decisions (brainstorm)

| # | Decision |
|---|---|
| D1 | **Data-driven on the current 9 hadithapi collections.** Grid/sidebar render whatever `/api/hadith/collections` returns; multi-provider (fawazahmed0 + islamhouse → the other ~13) is a **separate backend module next** and appears with zero UI change. Live set differs from the mockup's specific cards (shows `mishkat`/`al-silsila-sahiha`; not `Riyad`/`40 Nawawi`) — accepted. |
| D2 | **Routing = `?collection=slug` query param** + in-page loading shell. Reload-safe on GitHub Pages, shareable, no host config. Module 4 replaces the shell at the same URL. |
| D3 | **Testing = pure-core unit tests now** (`node:test` via worker suite, repo `-core.js` convention). Full **Playwright E2E deferred** to a test-harness module (honestly flagged, not silently skipped). |
| D4 | **Curated static presentation-metadata map** `src/data/hadith/collections-meta.json` fills Arabic name / lifespan / motif / category the API lacks. Reference data, **committed pending human ð review**. Authoritative counts/English-name/compiler always from the API. |
| D5 | **Minimal accessible mobile bottom-sheet** — net-new but token-consistent; reuses the rendered sidebar rows; Escape / click-outside / focus-return. |

---

## 3. Architecture

**Single data source → two renders.** One `fetchHadithCollections()` call feeds both the
sidebar rows and the grid cards; both merge each API record with the curated meta map.

```
/api/hadith/collections  ──►  fetchHadithCollections() (api.js, envelope {ok,data,source})
                                     │
   src/data/hadith/collections-meta.json ──► mergeCollection(apiRecord, meta)  [core]
                                     │
                   ┌─────────────────┼──────────────────┐
              renderSidebar     renderGrid          aggregateStats → renderStats
```

**Files:**
- **New** `src/js/hadith-collections-core.js` — UMD pure logic (mirrors `api.js`/`ui-utils.js` pattern), unit-tested from the worker suite.
- **New** `src/data/hadith/collections-meta.json` — curated slug → `{arabicName, lifespan, motif, category, featured}` (ð review).
- **New** `worker/test/hadith-collections-core.test.js`.
- **Rewrite** `src/js/hadith.js` — DOM layer targeting the *real* `hadith.html` classes/IDs (current scaffolding targets non-existent IDs), using `window.II.api`, `window.II.ui`, and the core. Preserves existing theme/nav/toast helpers already inline in the page.
- **Edit** `hadith.html` — minimum markup only: hero Continue-Reading slot, filter `aria-live` region, container id hooks (sidebar collection list, grid, stats), route loading-shell container, disabled-isnad state, dark-mode grade-badge overrides, bottom-sheet trigger + sheet. No design/copy/token changes to existing content.

### 3.1 Core functions (pure, tested)
- `mergeCollection(api, meta)` → `{slug, nameEnglish, nameArabic|null, compiler, lifespan|null, motif|null, hadithCount|null, chaptersCount|null, category, featured:boolean}`. API wins for authoritative fields; meta fills presentation; missing → null (never fabricated).
- `categoryOf(slug)` / `inCategory(slug, tab)` — tab ∈ `all|sittah|musnad|selected`. Sittah = {bukhari, muslim, abu-dawood, tirmidhi, sunan-nasai, ibn-e-majah}; Musnad = {musnad-ahmad}; Selected = {mishkat, al-silsila-sahiha}; All = every slug.
- `aggregateStats(collections)` → `{totalHadiths:number|null, collectionCount:number, verifiedPct:100}`. Total = sum of confirmable `hadithCount`; if any is null, total still sums the known ones but flags `partial:true` (→ honest "K+" not a fabricated exact).
- `formatCountK(n)` → preserves the locked `"N,"` + `"K+"` visual (e.g. 60123 → `{lead:'60,', suffix:'K+'}`); null → honest fallback (`{lead:'—', suffix:''}`).
- `hotdFields(daily)` → `{arabic, translation, reference, narrator|null, gradeValue, gradeLabel, grader|null}`; missing grade → `gradeValue:'unknown'`, `gradeLabel:'Grade Unknown'`, never omitted.

### 3.2 DOM layer (`hadith.js`) responsibilities
Skeleton on load (matching `.collection-card` / `.stats-strip` shapes) → fetch → render →
error/retry state on failure (cache/seed first per envelope `source`, then visible retry).
Wires: sidebar rows, grid cards, filter tabs (aria-live count), Browse/route, stats, HotD,
Continue-Reading, mobile bottom-sheet. All `JSON.parse`/`localStorage` via `window.II.ui`
safe helpers (QuotaExceeded → locked toast string).

---

## 4. Per-element behavior (acceptance-shaping)

- **Sidebar collection rows** (`.sidebar-item` + `.count-badge`): rendered from data; active state on click; `?collection=slug`; loading shell; no fake Tier 2.
- **Collections grid**: full locked anatomy preserved. **Only `sahih-bukhari`** gets `.collection-card.featured` + `✦ Most Authentic` seal + gold aura.
- **Filter tabs**: in-place; `role`/keyboard preserved; `aria-live="polite"` announces "Showing N collections"; no route change.
- **Classical scholars**: non-clickable info rows (no scholar page exists → no fake hrefs).
- **`.reading-path-row`**: display shell only (progress is Module 7) — left visually intact, not wired.
- **Stats strip**: total (summed live counts, locked `N,K+` visual), collection count (live), languages (locked `12+`), "100% Source-Verified" retained with accessible qualifier (`aria-description`/title) because every rendered card is a source-verified record; unconfirmable total → `—` fallback, never fabricated.
- **Hadith of the Day**: `/api/hadith/daily`; Arabic + translation + reference (collection · book · hadith · narrator) + **grade + named grader always** (or "Grade Unknown"); fallback = backend verified Bukhari #1 (not mock text); "View Full Isnad" → disabled `verified isnad data unavailable` until Module 3; bookmark/share reuse existing toast.
- **Continue Reading**: minimal hidden hero slot; shows only for a valid `islamicinfo-hadith-last-read`; read-only.
- **Mobile bottom-sheet**: minimal, token-consistent, reuses sidebar rows; Escape / click-outside / focus-return.
- **Dark mode**: add `[data-theme="dark"]` grade-badge overrides (TechSpec §2.6) so HotD grade passes WCAG AA.

---

## 5. Data & Storage
- Read-only this module: `islamicinfo-hadith-last-read` (Continue Reading; not written here — Module 7 writes it). Client cache of collections is optional (envelope already served from Worker KV); if added, key per DATA.md (`islamicinfo-hadith-{...}`) — otherwise no new localStorage keys.
- Curated `collections-meta.json` is bundled static (no localStorage, no API).

---

## 6. Content-safety
- Every rendered hadith (HotD) shows grade + named grader or "Grade Unknown" — enforced in `hotdFields`.
- No fabricated Arabic/matn/counts: authoritative fields from API; curated meta is human-reviewed reference data; gaps → honest fallback.
- Enrichment (isnad) stays `unavailable` (disabled state), consistent with Module 0.
- No fatwa/ruling surface. Curated meta + any surfaced hadith → CONTENT-POLICY §5 ð sign-off.

---

## 7. Testing
- **Unit (now):** `hadith-collections-core.test.js` — merge (API-wins, gap→null), category membership (all 4 tabs), stats aggregation (+ partial/null total), `formatCountK` (+ null fallback), `hotdFields` (grade present + missing→Grade Unknown), featured only for bukhari.
- **Manual browser pass:** both themes; 9 cards + sidebar rows render; filters (no route change) + aria-live; Bukhari-only featured; HotD grade always present; API-failure → cache/seed then retry; mobile bottom-sheet Escape/outside/focus.
- **Playwright E2E:** deferred to a test-harness module (flagged, not done).

---

## 8. Definition of Done (Module 1)
- [ ] Sidebar rows + grid cards render from one live source (9 collections), full anatomy preserved.
- [ ] Bukhari-only featured seal/aura.
- [ ] Filter tabs in-place + aria-live count, no navigation.
- [ ] Browse/sidebar → active state + `?collection=slug` + loading shell (no faked Tier 2).
- [ ] Classical scholars non-clickable; reading-path rows untouched shells.
- [ ] Stats from live data, locked labels/visual, honest fallback for unconfirmable counts.
- [ ] HotD: grade + named grader (or Grade Unknown) always; verified fallback; disabled isnad state.
- [ ] Continue-Reading slot shows only with valid last-read.
- [ ] Mobile bottom-sheet accessible (Escape/outside/focus-return).
- [ ] Dark-mode grade-badge overrides present.
- [ ] Core unit tests green; no console errors; both themes; degrades w/o JS (static mockup remains legible).
- [ ] Standard Module report + ð review flag on `collections-meta.json`.
