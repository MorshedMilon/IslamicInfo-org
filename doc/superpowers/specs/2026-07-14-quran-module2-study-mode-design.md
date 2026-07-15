# Module 2 — Study Mode: Live Ayah Rendering — Design Spec

**Page:** `quran.html` (Quran Explorer) · **Stage:** 1 (verse engine) + batched-render · **Date:** 2026-07-14
**Governing docs:** PRD US-Q02 / US-Q02B (WBW base) · TechSpec §3.1 / §3.2 / §5 / §8 / §10 / §11 · DATA.md · CONTENT-POLICY (🕌 scripture surfaced) · DEFINITION-OF-DONE.md
**Blueprint:** attached `quran.html` (locked). **Builds on:** Module 1 (sidebar; `window.loadSurah` stub).

---

## 1. Purpose & Scope

Make Study Mode functional: when a surah is selected, fetch its verses live from Quran.com and render real `.ayah-card`s into `#versesCardList`, replacing the 7 hardcoded Al-Fatihah demo cards — Arabic, word-by-word (base), translation, attribution — with batched rendering for long surahs.

### In scope
- **T1** — Fill `window.loadSurah(id)`: fetch `…/verses/by_chapter/{id}`, render `.ayah-card`s (real `text_uthmani`, `.ayah-num-badge`, `.ayah-translation` sanitized, `.ayah-trans-attr`).
- **T2** — `.wbw-row` populated with real Arabic (`.wbw-ar`) + English gloss (`.wbw-en`). **`.wbw-pos` deferred** — the v4 word endpoint returns no part-of-speech; no-fabrication forbids inventing it (PRD: POS is Stage 3 / US-Q17).
- **T4 (partial)** — `setActiveVerse()` (active-verse state) + real `copyVerse()` (clipboard + attribution + toast).
- **T5** — Incremental batched render: first batch immediate, subsequent batches on an IntersectionObserver sentinel.
- `.bismillah-banner` shown above v1 for all surahs except Surah 9; `.next-surah-btn` after final verse.

### Deferred (agreed)
- **Tajweed (T3)** → dedicated module (API rule→5-class map is lossy + scripture-sensitive; PRD Stage 3 / US-Q18). Toggle stays inert; text renders plain `text_uthmani`.
- **`.wbw-pos`** → Stage 3 (needs a morphology dataset).
- **T4 remainder:** `toggleAyahPlay`/audio → Module 3; `toggleBookmark`/`toggleNote` → Module 4; `openShareModal`/`toggleAI` → Module 5. Buttons keep existing handlers; no faked success.
- `#mushafPageView` (Mushaf Mode, Stage 4); translation-dropdown switcher UI (renders with stored/default edition; switcher later).

### Non-goals
- No Tajweed, no POS, no audio, no bookmark/note/share/AI backends, no Mushaf, no read-tracking (US-Q11 is Stage 2), no DB.

---

## 2. HTML elements in scope (locked `quran.html`)

`#versesCardList` (7 demo `.ayah-card`s + demo `.next-surah-btn` → replaced), `.ayah-card` (`.active-verse`), `.ayah-num-badge`, `.ayah-arabic`, `.wbw-row`/`.wbw-word` (`.wbw-ar`/`.wbw-en`/`.wbw-pos`), `.bismillah-banner` (`.bsm-ar`/`.bsm-tr`), `.ayah-translation`, `.ayah-trans-attr`, `.ayah-footer` (`.ayah-ref`/`.tafsir-btn`/`.trace-btn`), `.ayah-actions` buttons + handlers `setActiveVerse`/`copyVerse` (wired) and `toggleAyahPlay`/`toggleBookmark`/`openShareModal`/`toggleNote`/`toggleAI` (deferred).

---

## 3. Data flow — `window.loadSurah(surahId)`

```
loadSurah(surahId):
  editionId = localStorage['ii-quran-translation'] || 20   // Saheeh Intl (ADR-014)
  key = 'ii-verses-' + surahId + '-' + editionId
  renderSkeleton()
  cached = readCache(key)                                   // try/catch
  if cached && isFresh(<24h):
      renderSurah(cached.verses, surahId); revalidate()
  else:
      fetchAllVerses(surahId, editionId)                    // paginate
        .then(v => { writeCache(key, v); renderSurah(v, surahId) })
        .catch(() => surahId===1 ? renderSurah(seed1, 1)    // src/data/verses-1.json
                                 : renderError(surahId))     // + Retry
```

- **Endpoint:** `GET https://api.quran.com/api/v4/verses/by_chapter/{id}?language=en&words=true&word_fields=text_uthmani,translation&translations={edition}&fields=text_uthmani&per_page=50&page={n}`
- **Pagination:** read `meta.pagination.total_pages`; fetch pages `1..total_pages` (sequential or `Promise.all`), concat `verses`. 8s AbortController per request (TechSpec §5.2).
- **Cache:** `ii-verses-{surahId}-{editionId}` = `{ fetchedAt:number, verses:Verse[] }`, 24h stale-while-revalidate (TechSpec §11).
- **Seed:** `src/data/verses-1.json` = normalized Surah 1 (real API data, generated once at build time), the offline fallback for the default surah (TechSpec §8).

### Normalized `Verse`
```ts
{ verse_key:string; verse_number:number;
  text_uthmani:string;
  translation:string;               // sanitized (tags + <sup> footnotes stripped)
  words:{ ar:string; en:string }[]  // char_type_name==='word' only
}
```

---

## 4. Pure logic (DOM-free, tested) — `quran-verses-core.js`

- `sanitizeTranslation(html)` → strip all tags incl. `<sup foot_note=…>…</sup>`; collapse whitespace. (API translation text carries footnote HTML.)
- `wbwWords(apiWords)` → filter `char_type_name==='word'`, map to `{ ar:text_uthmani, en:translation.text }`.
- `normalizeVerse(apiVerse, editionId)` → the `Verse` shape above; picks the matching `translations[0].text`.
- `showBismillah(surahId)` → `surahId !== 9`.
- `versesCacheKey(surahId, editionId)`, `isFresh(fetchedAt, now, maxAge=24h)` (reuse pattern from Module 1 core).
- `attributionText(verse, surahName, editionName, url)` → copy payload (PRD US-Q15): `"{translation}\n{arabic}\n\n— {surahName} {verse_key} · {editionName}\n{url}"`.

**Name sources (no fabrication):** `editionName` comes from a small static id→name map (`{20:'Saheeh International', …}`) — public edition names, verifiable against `api.quran.com/api/v4/resources/translations`; default edition 20. `surahName` comes from Module 1's cached `ii-quran-chapters` (or the active `.surah-row[data-name]`). Neither is scripture; both are reference metadata.

---

## 5. Rendering

- **Target:** clear existing `.ayah-card` + `.next-surah-btn` inside `#versesCardList`; **preserve `.bismillah-banner`** node (toggle its `display` by `showBismillah(surahId)`); insert cards after the banner.
- **Card template** reproduces the locked `.ayah-card` structure verbatim (classes/ids), per verse:
  - `.ayah-header` → `.ayah-num-badge` (verse_number) + `.ayah-actions` (6 buttons: play·bookmark·copy·share·note·AI)
  - `.ayah-arabic` → `text_uthmani` (plain; **no `.tj-*` spans** — Tajweed deferred)
  - `.wbw-row` → one `.wbw-word` per word: `.wbw-ar` + `.wbw-en` (**no `.wbw-pos`**)
  - `.ayah-translation` (sanitized) + `.ayah-trans-attr` (`"{editionName} · {surahName} {verse_key}"`)
  - Deferred **empty** containers included so existing handlers don't throw: `.cmp-block`, `.ai-card`, `.note-editor` with generated ids (`cmp-{k}` / `ai-{k}` / `n-{k}`, k = verse_key with `:`→`-`). Modules 4–5 fill them.
  - `.ayah-footer` → `.ayah-ref` (verse_key) + `.tafsir-btn` + `.trace-btn` (handlers deferred to later modules; markup preserved)
  - `data-key="{verse_key}"` on the card; card click → `setActiveVerse(card)`.
- **Batched render (T5):** render first `BATCH=20` cards + a `.verses-sentinel` div; IntersectionObserver on the sentinel appends the next 20 and moves the sentinel; when exhausted, remove sentinel and append `.next-surah-btn` (loads next surah via `loadSurah(surahId+1)`, capped at 114).
- **Wired handlers:**
  - `window.setActiveVerse(card)` — move `.active-verse` among cards (keeps existing behavior; works on dynamic cards).
  - `window.copyVerse(evt, verseKey)` — look up the in-memory verse, build `attributionText`, `navigator.clipboard.writeText` (fallback `execCommand`), toast "Copied with attribution". (Overrides the locked demo, which only toasts.)

---

## 6. Initial-load reconciliation (touches Module-1 file)

Module 1's `applyUrlSurah()` default branch (no `?surah`) set Al-Fatihah active but did **not** load verses. Add `window.loadSurah(1)` to that default branch in `src/js/quran-sidebar.js` so a plain `/quran.html` renders Surah 1. The `?surah=<slug>` path already routes `selectSurah → window.loadSurah(id)`. Load order in `quran.html`: `…-sidebar-core → …-sidebar → …-verses-core → …-verses`, all synchronous before `DOMContentLoaded`, so the real `window.loadSurah` (assigned unconditionally in `quran-verses.js`) is in place before the sidebar's boot runs.

---

## 7. States (RULE 5)

| State | Behavior |
|---|---|
| Loading | 3 skeleton `.ayah-card` shimmer placeholders in `#versesCardList` |
| API error, surah 1 | Silent fallback to `src/data/verses-1.json`; `console.warn` |
| API error, other surah | Error card "Verses temporarily unavailable — try again" + Retry → re-`loadSurah` |
| `localStorage` parse/quota | try/catch; drop bad key / skip write; render proceeds |

---

## 8. Files

| File | Change |
|---|---|
| `src/js/quran-verses-core.js` | **NEW** — pure logic (UMD, `window.II.versesCore`), unit-tested |
| `src/js/quran-verses.js` | **NEW** — controller: `window.loadSurah`, fetch/paginate/cache/seed, batched render, `setActiveVerse`, `copyVerse` |
| `tests/quran/verses-core.test.js` | **NEW** — `node:test` for pure logic |
| `src/data/verses-1.json` | **NEW** — normalized Surah 1 seed (real API data, generated once) |
| `quran.html` | **MINIMAL** — remove 7 demo `.ayah-card` + demo `.next-surah-btn` from `#versesCardList` (keep `.bismillah-banner`), add skeleton placeholder, add 2 `<script>` includes |
| `src/js/quran-sidebar.js` | **1-line** — `applyUrlSurah` default branch triggers `loadSurah(1)` |
| `DATA.md` | register `ii-verses-{surah}-{edition}` in §1 + note `Verse` shape in §2 |

---

## 9. Testing

- **Pure core** (`node:test`): `sanitizeTranslation` strips `<sup>`/tags; `wbwWords` filters `char_type_name==='end'`; `normalizeVerse` picks correct translation + shape; `showBismillah(9)===false`, `showBismillah(1)===true`; `versesCacheKey`/`isFresh`; `attributionText` format.
- **Controller** (jsdom headless harness, out-of-repo, like Module 1): renders correct card count for Surah 1 (7) and paginated surah; `.bismillah-banner` hidden for Surah 9; batched render appends on sentinel intersection; `copyVerse` writes correct attribution payload; seed fallback renders on API reject; **zero console errors** across happy / paginated / seed-fallback paths.

---

## 10. Definition-of-Done gates

- **Universal:** matches PRD US-Q02/US-Q02B; only requested changes; both themes; no console errors; degrades to seed (Surah 1) / error+Retry; self-reviewed diff.
- **Design:** no CSS/token change; rendered card markup matches blueprint exactly (classes/structure); no raw hex.
- **Data:** `ii-verses-{surah}-{edition}` registered; `Verse` shape documented; all `localStorage` in try/catch; keys swept by edition/surah.
- **Content (🕌 — scripture surfaced):** Arabic from authoritative `api.quran.com` verbatim (no fabrication); translation labeled with edition + reference; no hadith, no fatwa, no AI content in this module. **Human-review sign-off (CONTENT-POLICY §5) is the one item I cannot self-satisfy** — report as *pending reviewer* (name/date/sources), not "done".
- **(No API gate:** no new `/api/` route — keyless client fetch per TechSpec §5.)

---

## 11. Follow-ups (out of this module)

- Tajweed module (rule-map table, reviewed). WBW POS (morphology source). Audio (Module 3). Bookmarks/Notes (Module 4). Share/AI (Module 5). Mushaf rendering. Translation-switcher UI. Per-ayah deep-link + read-tracking (Stage 2). Seed-refresh for `verses-1.json`.
