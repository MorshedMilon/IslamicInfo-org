# Design — Search Slice 3: Frontend Federation

**Date:** 2026-07-25
**Status:** Approved (design)
**Program:** Hero search federation (Slice 3 of 3). Slice 1 = Qur'an search (LIVE), Slice 2 = Dua search (LIVE, pill gated on owner license clearance).

## Goal

Make the hero search user-visible and federated: a dedicated, indexable `search-results.html?q=&scope=` page renders real results from the live backends; the active pill selects the dataset; Verify routes claims to the live QuranlyAI panel; unbuilt/held scopes show honest states. Mic + submit already work and are preserved.

## Owner decisions (locked)

- Dedicated **`search-results.html?q=&scope=`** (shareable/indexable); reuse hadith card style; keep `hadith.html?q=` working as an alias.
- Verify: **claim → live QuranlyAI panel** (which already shows sources + "Educational only · No Fatwas" disclaimer); **keyword → Hadith search**.
- `scope=all` federates **top-5 per section**; **Verify is excluded** from `all` (it's a panel interaction, not a result list).
- **Dua pill ships OFF** behind `DUA_SEARCH_PUBLIC = false` (backend live, held per the ADR-051 owner license/attribution gate; flip is a one-line change later).
- Verify-claim opens the **floating QuranlyAI panel** (not embedded AI in the page).

### `detectClaim(q)` heuristic (tightened — word count alone must NEVER trigger claim)
Return `'claim'` iff ANY sentence-like signal is present:
1. trimmed text ends with `.`, `?`, `!`, or `؟` (Arabic question mark); OR
2. contains a quotation mark (`"`, `'`, `«`, `»`, `“`, `”`, `‘`, `’`); OR
3. contains an English claim marker as a whole word/phrase (case-insensitive): `said`, `narrated`, `reported`, `claims`, `claim that`, `prophet`, `sunnah says`; OR
4. has **≥ 5 words AND** contains a whole-word sentence-verb from `{is, was, are, were, will, would, should, must, did, does, has, have, can}`.
Otherwise `'keyword'`. Rationale: multi-word keyword queries (e.g. `sahih bukhari fasting ramadan`, Arabic `صحيح البخاري الصيام`) must route as keyword; Arabic text (RTL, no Latin punctuation/markers) never false-positives unless it carries `؟` or quotes.
**Required test cases:** `sahih bukhari fasting ramadan` → keyword; `prayer` → keyword; `The Prophet said charity purifies wealth` → claim (marker); `Did the Prophet permit this?` → claim (punct); `fasting is obligatory in ramadan` → claim (≥5 words + verb); Arabic `صحيح البخاري الصيام` → keyword; Arabic `احاديث الصبر والصلاة` → keyword; Arabic `هل الصيام واجب؟` → claim (؟).

## Components

### 1. Pure core — `src/js/search-results-core.js` (UMD, TDD)
Frontend UMD (like `home-search-core.js`): `module.exports` for `worker/test/*`, else `window.II.searchResults`. Exports:
- `validateScope(s)` → one of `all|hadith|quran|dua|verify`, default `all` for unknown/empty.
- `detectClaim(q)` → `'claim' | 'keyword'` (heuristic above).
- `escapeHTML(s)`.
- `buildVerseCardHTML(v)` — from `{verseKey, surahName, ayah, arabic, translation}`; renders Arabic (RTL) + translation + `Qur'an · {surahName} {verseKey}` citation + `Saheeh International · quran.com` attribution; a "Read in context" link to `quran.html` (surah). Escaped.
- `buildDuaCardHTML(d)` — from `{id, category, arabic, transliteration, translation}`; renders category label + Arabic (RTL) + transliteration (muted) + translation + `Hisn al-Muslim` attribution. Escaped.
- `resultsHeading(scope, q, total)` — plain copy, no urgency: e.g. `{total} results for "{q}"` / `No results for "{q}"`.
- `SCOPES` config: per-scope `{ key, label, state: 'live'|'held'|'panel' }` — quran/hadith `live`, dua `held` (gated by `DUA_SEARCH_PUBLIC`), verify `panel`, all `live`.

### 2. API client — `src/js/api.js`
Add (mirroring `fetchHadithSearch`, non-cached `_getHadith`):
```js
function fetchQuranSearch(q, page, limit) { return _getHadith(`/api/quran/search?q=${encodeURIComponent(q)}&page=${page||1}&limit=${limit||20}`); }
function fetchDuaSearch(q, page, limit)   { return _getHadith(`/api/dua/search?q=${encodeURIComponent(q)}&page=${page||1}&limit=${limit||20}`); }
```
Expose both on the `api` object. Envelope: `{ ok, data:{ query, page, totalPages, total, results, source, edition? }, source }`.

### 3. Routing — `src/js/home-search-core.js` `dispatchTarget` (update + tests)
New behavior (keeps `{kind}` shape; adds a `kind:'panel'` for verify-claim):
- `hadith` → `{kind:'navigate', url:'search-results.html?scope=hadith&q=…'}`
- `quran`  → `{kind:'navigate', url:'search-results.html?scope=quran&q=…'}`
- `all`    → `{kind:'navigate', url:'search-results.html?scope=all&q=…'}`
- `dua`    → if `DUA_SEARCH_PUBLIC` → navigate `scope=dua`; else `{kind:'note', message: <honest "Dua search is coming soon…">}`
- `verify` → `detectClaim(q)==='claim'` ? `{kind:'panel', query:q}` : `{kind:'navigate', url:'search-results.html?scope=hadith&q=…'}`
- empty → `{kind:'noop'}`
`DUA_SEARCH_PUBLIC` is a module const in home-search-core (default `false`); `detectClaim` imported from search-results-core (or duplicated minimally — prefer a shared import; both are UMD so `home-search-core` can `require`/read `II.searchResults` in browser). To avoid load-order coupling, **move `detectClaim` into `home-search-core.js`** and have `search-results-core.js` re-export it, OR keep `detectClaim` in search-results-core and ensure it loads before home-search-core on index.html. Chosen: `detectClaim` lives in `search-results-core.js`; on `index.html`, load `search-results-core.js` before `home-search-core.js`; `dispatchTarget` calls `II.searchResults.detectClaim`.

`home.js` `submitSearch()` handles the new `kind:'panel'`: `window.QuranlyAI.setContext({ type:'claim', rawText:query, language: II.i18n?.lang || 'en' }); window.QuranlyAI.ask('custom', query);` (guarded if `window.QuranlyAI` absent → fall back to a note). Existing `navigate`/`note`/`noop` unchanged.

### 4. Page — `search-results.html` + `src/js/search-results.js`
- **Skeleton** copied from `verify.html` head (fonts, `:root` + `[data-theme=dark]` tokens, lang-FOUC guard) + the standard inline header/footer + bottom scripts: `i18n.js`, `global.js`, `api.js`, `search-results-core.js`, `hadith-citation-core.js`, `hadith-feed-core.js` (for hadith card reuse), `search-results.js`, then `quranlyai-widget.js`, `select-to-ask.js`.
- **SEO:** `<title>` default `Search | IslamicInfo`; when `?q=` present, `search-results.js` sets `document.title = 'Search: {q} | IslamicInfo'` and updates the meta description to `Search results for "{q}" across Qur'an and Hadith on IslamicInfo.org.`
- **Markup:** scope tab bar (mirrors hero pills, `data-scope`), a search box (`#sr-input` + mic `#sr-mic` + submit) pre-filled from `?q=`, `#sr-results` container, `#sr-note` for states.
- **Controller `search-results.js`:**
  - Parse `?q=` + `?scope=` (via `validateScope`). Pre-fill input; set title/meta.
  - **Empty-query state** (no `?q=`): render a neutral prompt — "Search the Qur'an and Hadith. Type a query above to begin." No fetch, no error.
  - **Single live scope (hadith/quran):** call the matching API; render cards (hadith via `II.hadithFeed.buildCardHTML`; quran via `buildVerseCardHTML`); "Load more" increments page. Hadith cards link to the deep view on `hadith.html`.
  - **`scope=all`:** fetch Hadith + Qur'an (Dua only if `DUA_SEARCH_PUBLIC`) in parallel; render a titled section per scope with **top 5** + "See all N in {scope} →" linking to `search-results.html?scope={scope}&q=…`. **Verify is NOT a section.**
  - **`scope=dua`:** if `DUA_SEARCH_PUBLIC` render dua cards; else honest "Dua search is coming soon" note.
  - **`scope=verify`:** don't list results — `detectClaim`; claim → open QuranlyAI panel (as in home.js); keyword → redirect to `scope=hadith`. Show a one-line explainer that Verify uses the AI assistant.
  - **States (site rules — no urgency, no shimmer):** loading → existing skeleton/spinner pattern (reuse `.dv-empty`/skeleton classes or a simple spinner, NOT a shimmer); empty → `No results for "{q}" — try different or more general terms.`; error → `Search is temporarily unavailable. Please try again.` (retriable, plain).
  - Re-run search on tab change and on in-page submit (updates URL via `history.pushState` so results stay shareable).

### 5. Alias preservation — `hadith.html?q=`
`hadith.js` is **not modified**; its `?q=` path (`hadith.js:1695` `runGlobalHadithSearch`) keeps working for any direct/old link. The hero no longer emits `hadith.html?q=` (it now emits `search-results.html?scope=hadith`), but the alias must still function. **Test:** an assertion that the shared contract is intact — `api.fetchHadithSearch` builds `/api/hadith/search?q=…` (unchanged), and a note that live smoke verifies `hadith.html?q=fasting` still renders. (No browser-automation harness in-repo; the alias is proven by the unchanged code path + post-deploy manual smoke.)

### 6. DECISION entry — `doc/DECISIONS.md` (ADR-052)
Log: dedicated indexable `search-results.html?q=&scope=`; **Verify-claim → QuranlyAI floating panel** (disclaimer/sources already in-panel), **keyword → Hadith**; the exact **`detectClaim` heuristic definition**; `scope=all` = top-5-per-section with **Verify excluded**; **`DUA_SEARCH_PUBLIC` flag gate** (default false, reference ADR-051 — flipping to true is the documented one-line go-public step once the owner clears the Hisn al-Muslim license/attribution). Reference this spec.

## "Done" checklist
1. `search-results-core` tests green (incl. all `detectClaim` cases + Arabic no-false-positive + card builders escape); full worker suite green.
2. `dispatchTarget` tests updated + green (hadith/quran/all navigate; dua held-note; verify claim=panel / keyword=navigate).
3. Live: hero Hadith + Qur'an queries land on `search-results.html` with real sourced cards; `scope=all` federates both; Verify-claim opens QuranlyAI with the claim; Dua pill shows coming-soon; empty `search-results.html` shows the neutral prompt; `hadith.html?q=fasting` still renders (alias).
4. SEO: title/meta reflect `{q}`.

## Out of scope
- Flipping `DUA_SEARCH_PUBLIC` on (owner license gate, ADR-051).
- Real `/api/verify` fact-check engine (Verify uses QuranlyAI; verify.html demo stays a labeled preview).
- Wiring full hadith interaction stack (bookmarks/notes) on the results page — cards are display + deep-link; interactions live on hadith.html.
- Non-English translation search corpora.

## Verification
- `cd worker && npm test` green (new core + dispatch tests).
- Post-deploy manual smoke of the checklist item 3 flows in light + dark.
