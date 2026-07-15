# Module 1 — Sidebar Surah List & Navigation — Design Spec

**Page:** `quran.html` (Quran Explorer) · **Stage:** 1 (Foundation) · **Date:** 2026-07-14
**Governing docs:** PRD US-Q01 · TechSpec §2.4 / §3.1 / §5 / §8 / §11 / §14 · DATA.md · DEFINITION-OF-DONE.md · CONTENT-POLICY (n/a — no 🕌 content surfaced by this module)
**Blueprint:** attached `quran.html` (locked; treated as canonical over `mockups/`)

---

## 1. Purpose & Scope

Make the locked sidebar functional: render all 114 Surahs from live Quran.com data, wire search + Makki/Madani filtering, and wire surah selection (active state, breadcrumb, deep-link URL, and a `loadSurah()` hook that Module 2 fills with real verse fetching).

### In scope
- **T1** — 114 chapters from `api.quran.com/api/v4/chapters`; **static seed + `localStorage` 24h cache; no DB**.
- **T2** — real-time client-side search across English name + Arabic name + surah number.
- **T3** — Makki/Madani filter driven by API `revelation_place` (not hardcoded `data-type`).
- **T4** — click `.surah-row` → `selectSurah()` → set active + update breadcrumb + `history.pushState('?surah=<slug>')` + call `loadSurah(id)` hook.

### Deferred (agreed)
- **T5 Browse-by-Topic** → its own content-reviewed module (topic→verse mapping is 🕌 content needing human review; not in Stage-1 sidebar ACs). Topic items remain inert placeholders.
- **T6 Streak → Habit Tracker** → Stage 4 (US-Q22); v1 has no session/account. `a[href="habits.html?source=quran"]` stays as-is; the "3-day streak" strip stays as a static placeholder for now.

### Non-goals
- No verse/ayah fetching (Module 2). No DB/Supabase. No server route (chapters is a public keyless GET, fetched client-side per TechSpec §5). No static pre-render of 114 rows (recommended follow-up SEO task, logged in §9).

---

## 2. HTML elements in scope (from locked `quran.html`)

| Element | Role |
|---|---|
| `#sidebar` | container |
| `#sbList` | holds `.surah-row` list, then `.sb-divider`, then "Browse by Topic" label + `.topic-item`s |
| `.surah-row` (×12 demo) | **replaced** by 114 live rows (T1); markup structure preserved exactly |
| `.sb-search input` (`oninput="filterSurahs(this.value)"`) | search (T2) |
| `.sb-filter` buttons (`onclick="filterReveal('all'|'makki'|'madinah', this)"`) | Makki/Madani filter (T3) |
| `.sb-section-label` ("114 Surahs") | keep static text "114 Surahs" (accurate); no dynamic count in this module |
| `.topic-item` list | inert placeholders (T5 deferred) |
| `.sb-streak` + `a[href="habits.html?source=quran"]` | unchanged (T6 deferred) |

**Row markup to replicate verbatim** (classes/structure identical; only data is dynamic):
```html
<div class="surah-row" data-id="{id}" data-slug="{slug}" data-type="{makki|madinah}"
     role="button" tabindex="0" aria-label="{name_simple}, {N} ayahs, {Makki|Madani}">
  <div class="surah-num">{id}</div>
  <div class="surah-info">
    <div class="surah-en">{name_simple}</div>
    <div class="surah-meta-row">
      <span class="surah-chip {chip-makki|chip-madani}">{Makki|Madani}</span>
      <span class="surah-ayahs">· {N} ayahs</span>
    </div>
  </div>
  <div class="surah-ar">{name_arabic}</div>
</div>
```
The active row additionally carries `class="surah-row active"`. `role`/`tabindex`/`aria-label` are added by JS (rows are `<div>`s) to satisfy the DoD A11y/keyboard requirement.

---

## 3. Data flow (all in `src/js/quran.js`, on `DOMContentLoaded`)

```
initSidebar():
  cached = readCache('ii-quran-chapters')          // try/catch JSON.parse
  if cached && fresh(<24h):
      render(cached.data); revalidate()             // background fetch, swap on success
  else:
      renderSkeleton()
      fetchChapters()
        .then(normalize → writeCache → render)
        .catch(loadSeed → render)                    // silent (console.warn), TechSpec §8
        .catch(renderEmptyState + Retry)             // both failed
  applyUrlSurah()                                    // if ?surah=<slug>, select it
```

- **Endpoint:** `GET https://api.quran.com/api/v4/chapters?language=en` (no auth, CORS-enabled).
- **Normalize** each chapter → `{ id, name_simple, name_arabic, revelation_place, verses_count, slug }`.
- **`revelationToType`**: `'makkah' → 'makki'` (chip `chip-makki`, label "Makki"); `'madinah' → 'madinah'` (chip `chip-madani`, label "Madani"). Matches existing `filterReveal` arg values and chip classes exactly.
- **`slugify(name_simple)`**: lowercase → strip apostrophes/diacritic marks → non-alphanumeric runs to single `-` → trim `-`. Examples: `Al-Fatihah`→`al-fatihah`, `Aal-Imran`→`aal-imran`, `An-Nisa`→`an-nisa`, `Al-An'am`→`al-anam`.
- **Render target:** remove existing `.surah-row` nodes inside `#sbList`, insert 114 rows **before** `.sb-divider` (preserves divider + Browse-by-Topic block).

### Cache shape — `localStorage['ii-quran-chapters']`
```json
{ "fetchedAt": 1752460800000, "data": [ { "id":1, "name_simple":"Al-Fatihah",
  "name_arabic":"الفاتحة", "revelation_place":"makkah", "verses_count":7, "slug":"al-fatihah" } ] }
```
Freshness window: 24h. On `JSON.parse` failure → `removeItem` + treat as absent. All writes in try/catch (`QuotaExceededError` tolerated; render still proceeds).

---

## 4. Interactions

### 4.1 Search (T2) — override `window.filterSurahs(value)`
- Predicate `matchesSearch(row, q)`: case-insensitive; true if `q` is a substring of `name_simple` **or** of `name_arabic` **or** (when `q` is all digits) `String(id).startsWith(q)`. Empty `q` → show all.
- Combines with active filter (§4.2): a row is visible iff `matchesSearch && matchesFilter`.
- No matches → inject a single "No surahs match" placeholder row (removed on next input).

### 4.2 Filter (T3) — override `window.filterReveal(type, btn)`
- `type ∈ {'all','makki','madinah'}`; toggles `.on` on the clicked `.sb-filter` (existing behavior).
- Visibility recomputed via `matchesFilter(row, type) && matchesSearch(row, currentQuery)`.
- Driven by `row.dataset.type` (set from API `revelation_place`), never a hardcoded attribute.

### 4.3 Selection + deep-link (T4) — production `window.selectSurah(row, name, ar, meta, type, letter)`
Keeps the existing signature (so the locked `.next-surah-btn` inline caller keeps working). Behavior:
1. Move `.active` to `row`; update breadcrumb (`#bcTitle`, `#bcType`, `#bcMeta`) and audio labels as the current inline version does.
2. Read `row.dataset.id` / `row.dataset.slug`; `history.pushState({surah:id}, '', '?surah=' + slug)`.
3. Call `loadSurah(id)` — **Module 1 provides a minimal hook** (sets breadcrumb + fires a `showToast('Loading …')`); Module 2 replaces the body with the real verse fetch/render. No verse loading in this module.
- **On load:** `applyUrlSurah()` reads `?surah=<slug>`, finds the matching row, calls `selectSurah` on it. Unknown/absent slug → default Al-Fatihah (row id 1), no error.
- **`popstate`:** re-apply the surah from the URL (back/forward support).

---

## 5. States (RULE 5 — no silent failures)

| State | Behavior |
|---|---|
| Loading (no cache) | Skeleton shimmer `.surah-row` placeholders (reuse existing shimmer pattern) |
| API error | Silent fallback to `src/data/chapters.json` seed; `console.warn`; no user-facing error |
| Total failure (API + seed) | Empty state in `#sbList`: "Couldn't load the surah list." + Retry button → re-run `initSidebar()` |
| Search no-match | "No surahs match" placeholder row |
| `localStorage` parse/quota error | try/catch; drop bad key / skip write; render still proceeds |

---

## 6. Files touched

| File | Change |
|---|---|
| `src/data/chapters.json` | **NEW** — 114-chapter seed, generated during implementation by a one-time **real** fetch of the live API (never fabricated). Path: `src/data/` (no `public/` dir in repo). |
| `src/js/quran.js` | **MODIFY** — sidebar module: fetch/cache/seed/render; slugify; `revelationToType`; production `filterSurahs`/`filterReveal`/`selectSurah` (override inline demos after load); `applyUrlSurah`/`popstate`; skeleton/empty/no-match; keyboard (Enter/Space) on rows; minimal `loadSurah(id)` hook. |
| `quran.html` | **MINIMAL** — remove only the 12 demo `.surah-row` nodes in `#sbList` (that removal *is* T1). Keep container, `.sb-divider`, Browse-by-Topic block, and **every class/id byte-identical**. |
| `DATA.md` | **MODIFY** — register key `ii-quran-chapters` in §1 registry (rule: add before implementing). |
| `DECISIONS.md` | **ADD ADR** — one line: deep-link scheme = `?surah=<slug>` query param (static-safe; path URLs deferred to a future Worker-rewrite ADR). |

**Override approach rationale:** the locked `quran.html` ships inline demo functions (`filterSurahs`, `filterReveal`, `selectSurah`). `src/js/quran.js` loads *after* the inline `<script>`, so it reassigns these globals to production versions — the locked file's JS is not edited (only the 12 demo rows are removed, which is the explicit task).

---

## 7. Testing (superpowers TDD)

Repo has **no test runner** (no `package.json`). Extract pure logic into testable, side-effect-free functions and cover with a minimal **Node** script (`node` is available); wire it as `tests/quran/module1.test.mjs`.

Pure functions to test: `slugify`, `revelationToType`, `matchesSearch`, `matchesFilter`, `isFresh(fetchedAt, now)`, `normalizeChapter`.

Cases (from TechSpec §14.1):
- slug: `Al-Fatihah`→`al-fatihah`; `Aal-Imran`→`aal-imran`; `Al-An'am`→`al-anam`; no trailing `-`.
- `revelationToType`: `makkah`→`makki`; `madinah`→`madinah`.
- search: matches English, Arabic, and numeric id; case-insensitive; empty query → all true.
- filter: `all` true for both; `makki` excludes madinah rows; combinable with search.
- cache: `isFresh` true at 23h59m, false at 24h01m; corrupt JSON → treated as absent.
- normalize: API object → required fields present; missing field → item skipped (`console.warn`), not crash.
- fallback (integration, DOM harness or manual): API reject → seed renders 114 rows.

---

## 8. Definition-of-Done gates (checked before "complete")

- **Universal:** matches PRD US-Q01 & functional doc; only requested changes; works light + dark; no console errors; degrades to seed; no banned hrefs; self-reviewed diff.
- **Design:** no CSS/token changes; rendered rows match blueprint markup exactly; DESIGN-SYSTEM §24 spot-check (nav `.active`, no raw hex added).
- **Data:** `ii-quran-chapters` registered in DATA.md; schema matches §3; all `localStorage` in try/catch.
- **A11y:** rows keyboard-operable (`role="button"`, `tabindex="0"`, Enter/Space), `aria-label` present; visible focus.
- **(No API gate:** no new `/api/` route — direct keyless client fetch per TechSpec §5. **No Content gate:** module surfaces no Quran/Hadith text.)**

---

## 9. Follow-ups (out of this module)

- **Static pre-render of 114 rows** into `quran.html` for no-JS/SEO (recommended; deliberately excluded here to avoid a large insertion into the locked file).
- **Path-based URLs** `/quran/<slug>` via Cloudflare Worker rewrite (needs its own ADR).
- **T5 Browse-by-Topic** module (content-reviewed).
- **T6 streak wiring** in Stage 4.
- Seed-refresh job to keep `src/data/chapters.json` current (chapters are effectively immutable, so low priority).
