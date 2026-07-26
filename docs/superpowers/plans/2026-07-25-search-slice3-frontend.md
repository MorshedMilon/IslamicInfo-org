# Search Slice 3: Frontend Federation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: subagent-driven-development or executing-plans. Steps use `- [ ]`.

**Goal:** Make the hero search user-visible: a dedicated indexable `search-results.html?q=&scope=` renders real results from the live Qur'an + Hadith backends; Verify routes claims to the QuranlyAI panel; Dua/Verify handled per honest states; `hadith.html?q=` preserved.

**Architecture:** New pure UMD core (`search-results-core.js`) with scope validation, tightened claim detection, and escaped verse/dua card builders. `dispatchTarget` reroutes to the new page. New `search-results.html` + controller. Two new `api.js` methods. TDD for all pure logic.

**Conventions:**
- Frontend `src/js/*-core.js` are **UMD** (`module.exports` for tests, else `window.II.<name>`). Pattern: `src/js/home-search-core.js` tail.
- `worker/test/*.test.js` are ESM: `import core from '../../src/js/<name>.js'` (default import of the UMD module). Run: `cd worker && node --test test/<file>`.
- Escape ALL interpolated text in card builders (XSS) — copy the `escapeHTML` used in `home.js`.
- Page skeleton: copy `verify.html` head (fonts, `:root`+dark tokens, lang-FOUC snippet), inline header/footer, bottom script order.

---

## Task 1: Pure core `src/js/search-results-core.js` (TDD)

**Files:** Create `src/js/search-results-core.js`; Test `worker/test/search-results-core.test.js`

- [ ] **Step 1: failing test** `worker/test/search-results-core.test.js`:
```js
import { test } from 'node:test';
import assert from 'node:assert';
import core from '../../src/js/search-results-core.js';

test('validateScope', () => {
  ['all','hadith','quran','dua','verify'].forEach(s => assert.strictEqual(core.validateScope(s), s));
  assert.strictEqual(core.validateScope('xyz'), 'all');
  assert.strictEqual(core.validateScope(''), 'all');
  assert.strictEqual(core.validateScope(null), 'all');
});

test('detectClaim: multi-word keyword queries are NOT claims', () => {
  assert.strictEqual(core.detectClaim('sahih bukhari fasting ramadan'), 'keyword');
  assert.strictEqual(core.detectClaim('prayer'), 'keyword');
  assert.strictEqual(core.detectClaim('patience and gratitude'), 'keyword');
  assert.strictEqual(core.detectClaim('صحيح البخاري الصيام'), 'keyword');       // Arabic multi-word keyword
  assert.strictEqual(core.detectClaim('احاديث الصبر والصلاة'), 'keyword');       // Arabic keyword, no punct
});

test('detectClaim: sentence-like signals ARE claims', () => {
  assert.strictEqual(core.detectClaim('The Prophet said charity purifies wealth'), 'claim'); // marker
  assert.strictEqual(core.detectClaim('Did the Prophet permit this?'), 'claim');             // punctuation
  assert.strictEqual(core.detectClaim('fasting is obligatory in ramadan'), 'claim');         // >=5 words + verb
  assert.strictEqual(core.detectClaim('It was narrated by Abu Hurayrah'), 'claim');          // marker
  assert.strictEqual(core.detectClaim('هل الصيام واجب؟'), 'claim');                           // Arabic question mark
});

test('escapeHTML', () => {
  assert.strictEqual(core.escapeHTML('<b>"x"&\'</b>'), '&lt;b&gt;&quot;x&quot;&amp;&#39;&lt;/b&gt;');
});

test('buildVerseCardHTML escapes + carries attribution', () => {
  const html = core.buildVerseCardHTML({ verseKey:'2:255', surahName:'Al-Baqarah', ayah:255, arabic:'ا<x>', translation:'T<y>' });
  assert.ok(html.includes('Al-Baqarah'));
  assert.ok(html.includes('2:255'));
  assert.ok(/Saheeh International/i.test(html));
  assert.ok(!html.includes('<x>') && html.includes('&lt;x&gt;'));  // arabic escaped
  assert.ok(!html.includes('<y>') && html.includes('&lt;y&gt;'));  // translation escaped
});

test('buildDuaCardHTML escapes + carries Hisn al-Muslim attribution', () => {
  const html = core.buildDuaCardHTML({ id:'1:1', category:'Cat<x>', arabic:'ع', transliteration:'tr', translation:'T' });
  assert.ok(/Hisn al-Muslim/i.test(html));
  assert.ok(html.includes('&lt;x&gt;'));
});

test('resultsHeading is plain (no urgency), handles zero', () => {
  assert.ok(/No results for/i.test(core.resultsHeading('hadith','x',0)));
  assert.ok(/3 results for/i.test(core.resultsHeading('hadith','x',3)));
});
```

- [ ] **Step 2: run → FAIL** `cd worker && node --test test/search-results-core.test.js`

- [ ] **Step 3: implement** `src/js/search-results-core.js` (UMD). Requirements:
  - `escapeHTML(s)` — the 5-replacement escaper (`& < > " '`).
  - `validateScope(s)` — return s if in `['all','hadith','quran','dua','verify']`, else `'all'`.
  - `DUA_SEARCH_PUBLIC = false` — exported const (single source of truth for the Dua gate).
  - `detectClaim(q)`:
```js
function detectClaim(q) {
  var s = String(q == null ? '' : q).trim();
  if (!s) return 'keyword';
  if (/[.?!؟]$/.test(s)) return 'claim';                       // ends with . ? ! or Arabic ؟
  if (/["'«»“”‘’]/.test(s)) return 'claim'; // any quote
  if (/\b(said|narrated|reported|claims|claim that|prophet|sunnah says)\b/i.test(s)) return 'claim';
  var words = s.split(/\s+/).filter(Boolean);
  if (words.length >= 5 && /\b(is|was|are|were|will|would|should|must|did|does|has|have|can)\b/i.test(s)) return 'claim';
  return 'keyword';
}
```
  - `buildVerseCardHTML(v)` — return a card string; RTL Arabic block, translation, `Qur'an · {surahName} {verseKey}` citation, `Saheeh International · quran.com` attribution, a "Read in context" link to `quran.html`. Escape `arabic`, `translation`, `surahName`, `verseKey`. Use classes like `sr-card sr-card--verse` (define CSS on the page).
  - `buildDuaCardHTML(d)` — category label, RTL Arabic, transliteration (muted), translation, `Hisn al-Muslim` attribution. Escape all. Classes `sr-card sr-card--dua`.
  - `resultsHeading(scope, q, total)` — `total>0` → `{total} result(s) for "{escaped q}"`; `total===0` → `No results for "{escaped q}"`.
  - `SCOPES` — array `[{key:'all',label:'All',state:'live'},{key:'hadith',label:'Hadith',state:'live'},{key:'quran',label:"Qur'an",state:'live'},{key:'dua',label:'Dua',state: DUA_SEARCH_PUBLIC ? 'live':'held'},{key:'verify',label:'Verify',state:'panel'}]`.
  - UMD tail exposing all of the above on `module.exports` / `window.II.searchResults`.

- [ ] **Step 4: run → PASS**, then `cd worker && npm test` (all green).
- [ ] **Step 5: commit** `git add src/js/search-results-core.js worker/test/search-results-core.test.js && git commit -m "feat(search-results): pure core — scope, tightened claim detection, card builders + tests"` (+ Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>)

---

## Task 2: API methods — `src/js/api.js`

**Files:** Modify `src/js/api.js`

- [ ] **Step 1:** near `fetchHadithSearch` (api.js:354), add:
```js
function fetchQuranSearch(q, page, limit) { return _getHadith(`/api/quran/search?q=${encodeURIComponent(q)}&page=${page||1}&limit=${limit||20}`); }
function fetchDuaSearch(q, page, limit)   { return _getHadith(`/api/dua/search?q=${encodeURIComponent(q)}&page=${page||1}&limit=${limit||20}`); }
```
- [ ] **Step 2:** add `fetchQuranSearch` and `fetchDuaSearch` to the exposed `api` object (api.js ~554-582, where `fetchHadithSearch` is exposed).
- [ ] **Step 3:** sanity — `node -e "require('./src/js/api.js')"` must not throw (UMD loads under node). If api.js is browser-only (references window), instead verify with a grep that both names appear in the export object. Report which.
- [ ] **Step 4: commit** `git add src/js/api.js && git commit -m "feat(api): fetchQuranSearch + fetchDuaSearch clients"` (+ Co-Authored-By)

---

## Task 3: Reroute `dispatchTarget` + wire panel — `home-search-core.js` + `home.js`

**Files:** Modify `src/js/home-search-core.js`, `worker/test/home-search-core.test.js`, `src/js/home.js`

- [ ] **Step 1: update the test** `worker/test/home-search-core.test.js` — replace the hadith/verify expectations and add cases:
```js
// hadith → dedicated results page
assert.deepEqual(core.dispatchTarget('hadith', ' patience '), { kind:'navigate', url:'search-results.html?scope=hadith&q=patience' });
// quran → results page
assert.deepEqual(core.dispatchTarget('quran', 'mercy'), { kind:'navigate', url:'search-results.html?scope=quran&q=mercy' });
// all → results page
assert.deepEqual(core.dispatchTarget('all', 'zakat'), { kind:'navigate', url:'search-results.html?scope=all&q=zakat' });
// dua held (DUA_SEARCH_PUBLIC=false) → note
assert.strictEqual(core.dispatchTarget('dua', 'sleep').kind, 'note');
// verify keyword → hadith results page
assert.deepEqual(core.dispatchTarget('verify', 'ablution'), { kind:'navigate', url:'search-results.html?scope=hadith&q=ablution' });
// verify claim → panel
assert.deepEqual(core.dispatchTarget('verify', 'The Prophet said charity purifies wealth'), { kind:'panel', query:'The Prophet said charity purifies wealth' });
// empty → noop
assert.deepEqual(core.dispatchTarget('hadith',''), { kind:'noop' });
```
(Remove/replace any old assertions that expect `hadith.html?q=` or `verify.html?claim=` from the hero.)

- [ ] **Step 2: run → FAIL** `cd worker && node --test test/home-search-core.test.js`

- [ ] **Step 3: implement** in `src/js/home-search-core.js`:
  - At top of the IIFE, resolve the shared core: `var SR = (typeof require !== 'undefined') ? require('./search-results-core.js') : (root.II && root.II.searchResults) || {};`
  - Rewrite `dispatchTarget(mode, rawQuery)`:
```js
function dispatchTarget(mode, rawQuery) {
  var q = String(rawQuery == null ? '' : rawQuery).trim();
  if (!q) return { kind: 'noop' };
  var enc = encodeURIComponent(q);
  if (mode === 'hadith') return { kind:'navigate', url:'search-results.html?scope=hadith&q=' + enc };
  if (mode === 'quran')  return { kind:'navigate', url:'search-results.html?scope=quran&q=' + enc };
  if (mode === 'all')    return { kind:'navigate', url:'search-results.html?scope=all&q=' + enc };
  if (mode === 'dua') {
    if (SR.DUA_SEARCH_PUBLIC) return { kind:'navigate', url:'search-results.html?scope=dua&q=' + enc };
    return { kind:'note', message: COMING_SOON.dua };
  }
  if (mode === 'verify') {
    var isClaim = SR.detectClaim ? SR.detectClaim(q) === 'claim' : false;
    if (isClaim) return { kind:'panel', query: q };
    return { kind:'navigate', url:'search-results.html?scope=hadith&q=' + enc };
  }
  return { kind:'navigate', url:'search-results.html?scope=all&q=' + enc };
}
```
  Keep `COMING_SOON.dua` copy honest (e.g. "Dua search is coming soon."). Keep `placeholderFor`/`pickContinue`/`prettySlug` unchanged.

- [ ] **Step 4: run → PASS** the dispatch test, then `cd worker && npm test`.

- [ ] **Step 5: update `home.js` `submitSearch()`** to handle `kind:'panel'` (after the existing branches):
```js
else if (res.kind === 'panel') {
  if (window.QuranlyAI && typeof window.QuranlyAI.ask === 'function') {
    try { window.QuranlyAI.setContext({ type:'claim', rawText: res.query, language: (window.II && II.i18n && II.i18n.lang) || 'en' }); } catch (_){}
    window.QuranlyAI.ask('custom', res.query);
  } else { showNote('The assistant is still loading — please try again in a moment.'); }
}
```
(Keep the existing `navigate`/`note`/`noop` branches.)

- [ ] **Step 6: load-order on `index.html`** — ensure `src/js/search-results-core.js` is loaded BEFORE `src/js/home-search-core.js` (so `II.searchResults.detectClaim`/`DUA_SEARCH_PUBLIC` exist for the browser path). Add the `<script src="src/js/search-results-core.js"></script>` tag immediately before the existing `home-search-core.js` tag.

- [ ] **Step 7: commit** `git add src/js/home-search-core.js worker/test/home-search-core.test.js src/js/home.js index.html && git commit -m "feat(search): reroute hero search to search-results.html; verify-claim → QuranlyAI panel"` (+ Co-Authored-By)

---

## Task 4: Page + controller — `search-results.html` + `src/js/search-results.js`

**Files:** Create `search-results.html`, `src/js/search-results.js`

- [ ] **Step 1: scaffold `search-results.html`** from `verify.html`'s skeleton:
  - Head: same fonts/preconnect, the lang-FOUC guard snippet, `:root` + `[data-theme="dark"]` token block, `<title>Search | IslamicInfo</title>` + `<meta name="description" content="Search the Qur'an and Hadith on IslamicInfo.org." />`.
  - Copy the inline `<header class="site-header" id="siteHeader">…</header>` from `verify.html` (nav + theme/search/lang/account controls) and the `<footer id="ii-footer">…</footer>`.
  - Body main: a hero-lite search block — scope tab bar `<div class="sr-scopes" role="tablist">` with 5 tabs (`data-scope`, labels from SCOPES), a `<form id="sr-form"><input id="sr-input"> <button id="sr-mic"> <button type=submit></form>`, a `<div id="sr-note" hidden></div>` for states, and a `<div id="sr-results"></div>` container.
  - Page `<style>`: define `.sr-card`, `.sr-card--verse`, `.sr-card--dua`, `.sr-section`, `.sr-attrib`, RTL for `.sr-arabic { direction:rtl; font-family:var(--font-arabic); }`, a `.sr-spinner` (reuse existing spinner keyframes; **no shimmer**), using design tokens only (no raw hex).
  - Bottom scripts (order): `i18n.js`, `global.js`, `api.js`, `search-results-core.js`, `hadith-citation-core.js`, `hadith-feed-core.js`, `search-results.js`, then `quranlyai-widget.js?v=…`, `select-to-ask.js?v=…`.

- [ ] **Step 2: implement `src/js/search-results.js`** (controller; vanilla, guarded). Structure:
```
(function(){
  var api = window.II && window.II.api, core = window.II && window.II.searchResults;
  var qs = new URLSearchParams(location.search);
  var scope = core.validateScope(qs.get('scope'));
  var q = (qs.get('q') || '').trim();
  // --- init: set active tab, prefill #sr-input, SEO title/meta, wire form+mic+tabs
  // --- if !q -> renderEmptyPrompt() and return (no fetch)
  // --- else run(scope, q, page=1)
})();
```
  - `setSeo(q)`: if q → `document.title='Search: '+q+' | IslamicInfo'`; update meta description to `Search results for "…"`.
  - `renderEmptyPrompt()`: neutral copy "Search the Qur'an and Hadith. Type a query above to begin." into `#sr-results`.
  - `run(scope,q,page)`:
    - `scope==='verify'`: `core.detectClaim(q)==='claim'` → open QuranlyAI (`setContext({type:'claim',rawText:q}); ask('custom',q)`) + show explainer note; else `location.replace('search-results.html?scope=hadith&q='+encodeURIComponent(q))`.
    - `scope==='dua'` and not `core.DUA_SEARCH_PUBLIC`: show honest "Dua search is coming soon." note; stop.
    - `scope==='hadith'`: spinner → `api.fetchHadithSearch(q,'en',page)` → render via `II.hadithFeed.buildCardHTML` into cards; heading via `core.resultsHeading`; "Load more" if more pages.
    - `scope==='quran'`: `api.fetchQuranSearch(q,page)` → `core.buildVerseCardHTML`.
    - `scope==='dua'` (flag on): `api.fetchDuaSearch(q,page)` → `core.buildDuaCardHTML`.
    - `scope==='all'`: parallel `fetchHadithSearch` + `fetchQuranSearch` (+ dua if flag) → render a `.sr-section` per scope with **top 5** + a "See all {total} in {scope} →" link (`search-results.html?scope={scope}&q=`). Verify NOT included.
  - **States:** loading → inject a `.sr-spinner` (no shimmer); envelope `{ok:false}` or fetch null → error note "Search is temporarily unavailable. Please try again."; `total===0` → `core.resultsHeading` empty copy + "try different or more general terms."
  - Tab click / in-page submit → update URL via `history.pushState` and re-run (keeps results shareable).
  - Escape everything not produced by a trusted builder.

- [ ] **Step 3: manual smoke** (open the file with a local static server so `API_BASE` calls work, or after deploy): `search-results.html?scope=hadith&q=fasting`, `?scope=quran&q=mercy`, `?scope=all&q=charity`, `?scope=verify&q=The Prophet said...`, `?scope=dua&q=x` (coming soon), and bare `search-results.html` (empty prompt). Light + dark. If no local server, defer to post-deploy and note it.

- [ ] **Step 4: commit** `git add search-results.html src/js/search-results.js && git commit -m "feat(search): search-results.html federated results page + controller"` (+ Co-Authored-By)

---

## Task 5: Alias assertion + DECISION (ADR-052)

**Files:** Create `worker/test/search-alias.test.js`; Modify `doc/DECISIONS.md`

- [ ] **Step 1: alias contract test** `worker/test/search-alias.test.js` (ESM) — asserts the shared hadith-search contract the `hadith.html?q=` alias depends on is intact:
```js
import { test } from 'node:test';
import assert from 'node:assert';
import core from '../../src/js/home-search-core.js';
// The hero now routes hadith → search-results.html, but hadith.html?q= must still work as an alias.
// hadith.js is unmodified; its ?q= path calls api.fetchHadithSearch which hits /api/hadith/search?q=.
// This test locks the routing contract so the alias isn't silently broken.
test('hero hadith routing points at the results page (not hadith.html) but keeps the q intact', () => {
  const r = core.dispatchTarget('hadith', 'fasting');
  assert.match(r.url, /^search-results\.html\?scope=hadith&q=fasting$/);
});
test('verify keyword still reaches hadith search with the query preserved', () => {
  const r = core.dispatchTarget('verify', 'wudu');
  assert.match(r.url, /scope=hadith&q=wudu$/);
});
```
  (Full end-to-end `hadith.html?q=` render is verified by post-deploy manual smoke — noted in the plan; no browser-automation harness exists in-repo. `hadith.js` is NOT modified, so its `?q=` path is unchanged.)
- [ ] **Step 2: run** `cd worker && node --test test/search-alias.test.js` → PASS. Then full suite `cd worker && npm test`.
- [ ] **Step 3: DECISION ADR-052** — append to `doc/DECISIONS.md` (next number), covering: dedicated indexable `search-results.html?q=&scope=`; Verify-claim → QuranlyAI floating panel (in-panel sources + "No Fatwas" disclaimer), keyword → Hadith; the exact `detectClaim` heuristic definition (the four signals; word-count-alone never triggers); `scope=all` = top-5-per-section, **Verify excluded**; **`DUA_SEARCH_PUBLIC=false` flag gate** (in `search-results-core.js`) — flipping to `true` is the one-line go-public step once the owner clears the Hisn al-Muslim license/attribution (ref ADR-051). Reference the spec.
- [ ] **Step 4: commit** `git add worker/test/search-alias.test.js doc/DECISIONS.md && git commit -m "test(search): alias routing contract; docs(decisions): ADR-052 frontend federation"` (+ Co-Authored-By)

---

## Self-review notes
- **Pure logic is TDD'd** (scope, claim detection incl. Arabic no-false-positive + multi-word-keyword cases, card escaping, dispatch routing). Page/controller proven by post-deploy smoke (no in-repo browser harness — stated honestly).
- **detectClaim** never triggers on word count alone (signal 4 requires verb AND ≥5 words); Arabic without `؟`/quotes → keyword.
- **Honest states + site rules:** plain empty/error copy, no urgency, no shimmer (reuse spinner). Dua held behind `DUA_SEARCH_PUBLIC` (ADR-051 gate). Verify excluded from `all`.
- **Alias:** `hadith.js` untouched; contract test + smoke.
- **Consistency:** UMD cores; `II.searchResults` loaded before `home-search-core` on index.html; card builders escape all inputs.
