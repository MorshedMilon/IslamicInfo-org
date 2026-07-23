# Hadith Endless List + In-Collection Search — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn every hadith collection into one endless, searchable list — "Load More" streams 25 more continuously across book boundaries, a search box jumps to a hadith number or filters by keyword (current collection), and "Open Full View" works everywhere.

**Architecture:** Frontend-led. Endless pagination for hadithapi collections uses a **chapter-walk** (page book 1 → book 2 → … via the existing per-book route + cached book list); direct-source collections page one flat sequence (already supported). One additive Worker route resolves a typed hadith number → its book (hadithapi's proven `hadithNumber` filter) and optionally serves a flat list. Keyword search reuses the existing `/api/hadith/search`, scoped by an optional `collection` param. Testable logic (search-input parsing, load-more state, chapter-walk advance) lives in a new pure core with unit tests; DOM wiring is verified manually (repo convention).

**Tech Stack:** Vanilla ES5-style browser JS (UMD cores + DOM layers), Cloudflare Worker (ESM), `node --test` (run from `worker/`).

**Spec:** [docs/superpowers/specs/2026-07-23-hadith-endless-list-and-search-design.md](../specs/2026-07-23-hadith-endless-list-and-search-design.md)

**Conventions:**
- Run tests from the `worker/` directory: `cd worker && npm test`.
- Pure cores live in `src/js/*-core.js` (UMD); their tests live in `worker/test/*.test.js` and import via `../../src/js/<name>.js`.
- Commit after each task. No pushing (owner pushes).
- **No content/authenticity changes** anywhere in this plan: cards render through the unit-locked `feed.buildCardHTML`; grades/isnad/translations are untouched.

---

## File Structure

| File | Responsibility | Change |
|---|---|---|
| `worker/src/hadith.js` | `/api/hadith/*` router | Modify: add `collectionFlat` handler + route; add `collection` scoping to `search` |
| `worker/test/hadith-router.test.js` | Router tests | Modify: add tests for the new route + scoped search |
| `src/js/api.js` | Client REST wrappers + provider routing | Modify: add `fetchHadithCollectionFlat`, `fetchHadithByNumber`; extend `fetchHadithSearch`; export them |
| `src/js/hadith-list-core.js` | **New** pure logic: search-input parse, load-more mode, chapter-walk advance | Create |
| `worker/test/hadith-list-core.test.js` | Unit tests for the new core | Create |
| `src/js/tier3-deep-view.js` | Tier-3a list + Tier-3b deep view (DOM) | Modify: rewrite `renderList` for endless pagination; add search bar; remove book Prev/Next |
| `src/js/hadith.js` | Page host (landing feed, routing, wiring) | Modify: fix landing-feed "Open Full View" to route into the deep view |
| `hadith.html` | Markup/CSS | Modify: add minimal CSS for the Tier-3a search bar + load-more (reuse existing tokens) |

---

## Task 1: Worker — number-resolver route (`/collections/:slug/hadiths`)

**Files:**
- Modify: `worker/src/hadith.js` (add handler after `singleHadith`, ~line 147; add dispatch in `handleHadith`, ~line 211)
- Test: `worker/test/hadith-router.test.js`

- [ ] **Step 1: Write the failing tests**

Add to `worker/test/hadith-router.test.js` (reuse the existing `ENV`, `ORIGIN`, `listFetcher` already defined in that file):

```js
test('flat collection list returns a paginated envelope (book-only, no chapter)', async () => {
  let calledUrl = '';
  const spyFetcher = async (url) => { calledUrl = url; return {
    ok: true, status: 200, json: async () => ({
      hadiths: { data: [{ hadithNumber: '26', hadithArabic: 'ن', hadithEnglish: 'text',
        englishNarrator: 'Anas', status: 'Sahih',
        book: { bookSlug: 'sahih-bukhari', bookName: 'Sahih Bukhari' },
        chapter: { chapterNumber: '2', chapterEnglish: 'Faith' } }], last_page: 5, total: 120 },
    }) }; };
  const res = await handleHadith('/api/hadith/collections/sahih-bukhari/hadiths',
    new URLSearchParams('page=2&limit=25'), ENV(), ORIGIN, { fetcher: spyFetcher });
  assert.equal(res.status, 200);
  const b = await res.json();
  assert.equal(b.ok, true);
  assert.equal(b.data.hadiths.length, 1);
  assert.equal(b.data.page, 2);
  assert.equal(b.data.lastPage, 5);
  assert.equal(b.data.total, 120);
  assert.ok(!/chapter=/.test(calledUrl), 'flat list must NOT send a chapter param');
  assert.ok(/book=sahih-bukhari/.test(calledUrl), 'flat list filters by book slug');
});

test('flat collection route resolves a hadith number to its record', async () => {
  const res = await handleHadith('/api/hadith/collections/sahih-bukhari/hadiths',
    new URLSearchParams('hadithNumber=26'), ENV(), ORIGIN, { fetcher: async () => ({
      ok: true, status: 200, json: async () => ({
        hadiths: { data: [{ hadithNumber: '26', hadithArabic: 'ن', hadithEnglish: 'text',
          book: { bookSlug: 'sahih-bukhari', bookName: 'Sahih Bukhari' },
          chapter: { chapterNumber: '2', chapterEnglish: 'Faith' } }], last_page: 1, total: 1 },
      }) }) });
  const b = await res.json();
  assert.equal(b.ok, true);
  assert.equal(b.data.hadiths[0].hadithNumber, 26);
  assert.equal(b.data.hadiths[0].bookNumber, 2, 'resolver exposes the real book number');
});

test('flat collection route rejects a slug outside the allowlist', async () => {
  const res = await handleHadith('/api/hadith/collections/evil/hadiths',
    new URLSearchParams(), ENV(), ORIGIN, {});
  assert.equal(res.status, 400);
  assert.equal((await res.json()).error.retryable, false);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd worker && node --test test/hadith-router.test.js`
Expected: FAIL (route returns 404 `unknown hadith endpoint`, so status assertions fail).

- [ ] **Step 3: Add the `collectionFlat` handler**

In `worker/src/hadith.js`, insert after the `singleHadith` function (after ~line 147):

```js
/* Flat whole-collection list (book-only, no chapter) + number resolver.
   ?page=&limit= → paginated flat list (VERIFY §5.1 before relying on this for
   listing; chapter-walk in the client does not depend on it).
   ?hadithNumber= → single-record resolve to expose its real bookNumber (used by
   the client to route a typed number into the deep view). */
async function collectionFlat(slug, searchParams, env, origin, deps) {
  if (!ALLOWED_SLUGS.has(slug)) return fail('bad_slug', `unknown collection: ${slug}`, origin, 400, false);
  if (!env.HADITH_API_KEY) return fail('no_key', 'Hadith service temporarily unavailable', origin, 503, true);
  const num = posInt(searchParams.get('hadithNumber'));
  const page = posInt(searchParams.get('page')) || 1;
  const limit = Math.min(posInt(searchParams.get('limit')) || 25, 200);
  const param = num
    ? { book: slug, hadithNumber: num, paginate: 1 }
    : { book: slug, paginate: limit, page };
  const key = num ? hKey('flatone', slug, num) : hKey('flatlist', slug, page);
  try {
    const { data, source } = await liveOrCache(
      env.QURANLYAI_KV, key, TTL.DAY,
      () => hadithsUrl(env.HADITH_API_BASE_URL, env.HADITH_API_KEY, param),
      (raw) => {
        const wrap = raw.hadiths || {};                       // hadithapi shape: hadiths.data
        return {
          hadiths: safeMap(wrap.data, (h) => normalizeHadith(h, {})),
          page: num ? 1 : page, limit: num ? 1 : limit,
          total: wrap.total ?? null, lastPage: wrap.last_page ?? null,
        };
      },
      deps,
    );
    return ok(data, source, origin, source === 'live' ? TTL.DAY : 0);
  } catch (_) {
    return fail('upstream', 'Hadiths temporarily unavailable — try again', origin, 502, true);
  }
}
```

- [ ] **Step 4: Add the route dispatch**

In `handleHadith` (`worker/src/hadith.js`), add BEFORE the 5-segment per-book route (before ~line 211 `// /api/hadith/collections/:slug/books/:bookNum/hadiths`):

```js
  // /api/hadith/collections/:slug/hadiths  (flat list + number resolver)
  if (seg[0] === 'collections' && seg.length === 3 && seg[2] === 'hadiths') {
    return collectionFlat(seg[1], searchParams, env, origin, deps);
  }
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd worker && node --test test/hadith-router.test.js`
Expected: PASS (all three new tests green; existing tests still pass).

- [ ] **Step 6: Commit**

```bash
git add worker/src/hadith.js worker/test/hadith-router.test.js
git commit -m "feat(hadith): flat collection route + hadith-number resolver (additive)"
```

---

## Task 2: Worker — scope keyword search by collection

**Files:**
- Modify: `worker/src/hadith.js` (`search`, ~lines 149-169)
- Test: `worker/test/hadith-router.test.js`

- [ ] **Step 1: Write the failing test**

Add to `worker/test/hadith-router.test.js`:

```js
test('search scoped by collection sends the book filter and keeps the query', async () => {
  let calledUrl = '';
  const spy = async (url) => { calledUrl = url; return { ok: true, status: 200, json: async () => ({
    hadiths: { data: [{ hadithNumber: '5', hadithEnglish: 'patience is light',
      book: { bookSlug: 'sahih-muslim', bookName: 'Sahih Muslim' },
      chapter: { chapterNumber: '1' } }] },
  }) }; };
  const res = await handleHadith('/api/hadith/search',
    new URLSearchParams('q=patience&collection=sahih-muslim'), ENV(), ORIGIN, { fetcher: spy });
  assert.equal(res.status, 200);
  const b = await res.json();
  assert.equal(b.data.results.length, 1);
  assert.ok(/book=sahih-muslim/.test(calledUrl), 'scoped search filters by book slug');
  assert.ok(/hadithEnglish=patience/.test(calledUrl), 'scoped search keeps the text query');
});

test('search with an invalid collection is rejected', async () => {
  const res = await handleHadith('/api/hadith/search',
    new URLSearchParams('q=patience&collection=evil'), ENV(), ORIGIN, {});
  assert.equal(res.status, 400);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd worker && node --test test/hadith-router.test.js`
Expected: FAIL (`book=` not present in the URL; invalid collection not rejected).

- [ ] **Step 3: Extend `search`**

Replace the body of `search` (`worker/src/hadith.js` ~lines 149-169) with:

```js
async function search(searchParams, env, origin, deps) {
  const q = (searchParams.get('q') || '').trim();
  if (q.length < 2) return fail('bad_query', 'search query must be at least 2 characters', origin, 400, false);
  if (q.length > 100) return fail('bad_query', 'search query too long (max 100 chars)', origin, 400, false);
  const collection = searchParams.get('collection');
  if (collection && !ALLOWED_SLUGS.has(collection)) {
    return fail('bad_slug', `unknown collection: ${collection}`, origin, 400, false);
  }
  if (!env.HADITH_API_KEY) return fail('no_key', 'Hadith service temporarily unavailable', origin, 503, true);
  const page = posInt(searchParams.get('page')) || 1;
  const lang = searchParams.get('lang') === 'ar' ? 'ar' : 'en';
  const base = lang === 'ar' ? { hadithArabic: q } : { hadithEnglish: q };
  const param = collection ? { book: collection, ...base } : base;
  try {
    const { data, source } = await liveOrCache(
      env.QURANLYAI_KV, hKey('search', lang, collection || 'all', page, q), TTL.HOUR,
      () => hadithsUrl(env.HADITH_API_BASE_URL, env.HADITH_API_KEY, { ...param, paginate: 25, page }),
      (raw) => ({ results: safeMap(raw.hadiths && raw.hadiths.data, (h) => normalizeHadith(h, { language: lang })),
                  page, query: q }),
      deps,
    );
    return ok(data, source, origin, source === 'live' ? TTL.HOUR : 0);
  } catch (_) {
    return fail('upstream', 'Search temporarily unavailable — try again', origin, 502, true);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd worker && node --test test/hadith-router.test.js`
Expected: PASS (both new tests green; existing search test still passes).

- [ ] **Step 5: Commit**

```bash
git add worker/src/hadith.js worker/test/hadith-router.test.js
git commit -m "feat(hadith): scope keyword search by collection (optional ?collection=)"
```

---

## Task 3: Client — api.js wrappers

**Files:**
- Modify: `src/js/api.js` (add functions near `fetchHadithSearch` ~line 349; extend `fetchHadithSearch`; add to the exported `II.api` object ~lines 537-547)

> No unit test here — `api.js` is a browser IIFE with no test harness; these thin URL builders are covered by the Worker route tests (Tasks 1-2) and the live smoke in Task 9. Keep them one-liners so there is nothing to unit-test.

- [ ] **Step 1: Add the flat-list + number-resolver wrappers**

In `src/js/api.js`, immediately after `fetchHadithOne` (~line 348), add:

```js
  // Flat whole-collection page (hadithapi) — used by the chapter-walk's direct-source
  // sibling and available if a caller wants the flat listing. Same envelope as the list.
  function fetchHadithCollectionFlat(slug, page, limit) {
    return _getHadith(`/api/hadith/collections/${encodeURIComponent(slug)}/hadiths?page=${page || 1}&limit=${limit || 25}`);
  }
  // Resolve a typed hadith number → its record (with real bookNumber) for hadithapi
  // collections, so a number search can route into the deep view.
  function fetchHadithByNumber(slug, num) {
    return _getHadith(`/api/hadith/collections/${encodeURIComponent(slug)}/hadiths?hadithNumber=${encodeURIComponent(num)}`);
  }
```

- [ ] **Step 2: Extend `fetchHadithSearch` with an optional collection scope**

Replace `fetchHadithSearch` (~lines 349-351) with:

```js
  function fetchHadithSearch(q, lang, page, collection) {
    var scope = collection ? ('&collection=' + encodeURIComponent(collection)) : '';
    return _getHadith(`/api/hadith/search?q=${encodeURIComponent(q)}&lang=${lang || 'en'}&page=${page || 1}${scope}`);
  }
```

- [ ] **Step 3: Export the new functions**

In the `II.api` export object (~lines 537-547), add `fetchHadithCollectionFlat` and `fetchHadithByNumber` alongside `fetchHadithSearch`:

```js
    fetchHadithSearch,
    fetchHadithCollectionFlat,
    fetchHadithByNumber,
```

- [ ] **Step 4: Sanity-check the file parses**

Run: `node -e "require('fs').readFileSync('src/js/api.js','utf8'); new Function(require('fs').readFileSync('src/js/api.js','utf8')); console.log('parse OK')"`
Expected: `parse OK` (no syntax error). *Note: this only checks parse, not behavior.*

- [ ] **Step 5: Commit**

```bash
git add src/js/api.js
git commit -m "feat(hadith): api.js wrappers for flat list, number resolver, scoped search"
```

---

## Task 4: New pure core — `hadith-list-core.js`

**Files:**
- Create: `src/js/hadith-list-core.js`
- Test: `worker/test/hadith-list-core.test.js`

- [ ] **Step 1: Write the failing tests**

Create `worker/test/hadith-list-core.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert';
import core from '../../src/js/hadith-list-core.js';

test('parseSearchInput classifies numbers, keywords, empty, and too-short', () => {
  assert.deepEqual(core.parseSearchInput('  2500 '), { kind: 'number', number: 2500, query: '2500' });
  assert.deepEqual(core.parseSearchInput('patience'), { kind: 'keyword', number: null, query: 'patience' });
  assert.deepEqual(core.parseSearchInput(''), { kind: 'empty', number: null, query: '' });
  assert.deepEqual(core.parseSearchInput('a'), { kind: 'too-short', number: null, query: 'a' });
});

test('computeListAdvance: direct source advances page until lastPage', () => {
  assert.deepEqual(
    core.computeListAdvance({ provider: 'ahmedbaset', book: 1, page: 1, lastPage: 3, bookOrder: null }),
    { done: false, book: 1, page: 2 });
  assert.deepEqual(
    core.computeListAdvance({ provider: 'ahmedbaset', book: 1, page: 3, lastPage: 3, bookOrder: null }),
    { done: true });
});

test('computeListAdvance: hadithapi walks to the next book when a book is exhausted', () => {
  // more pages left in the current book
  assert.deepEqual(
    core.computeListAdvance({ provider: 'hadithapi', book: 2, page: 1, lastPage: 4, bookOrder: [1,2,3] }),
    { done: false, book: 2, page: 2 });
  // book exhausted → jump to the next book, page 1
  assert.deepEqual(
    core.computeListAdvance({ provider: 'hadithapi', book: 2, page: 4, lastPage: 4, bookOrder: [1,2,3] }),
    { done: false, book: 3, page: 1 });
  // last book exhausted → done
  assert.deepEqual(
    core.computeListAdvance({ provider: 'hadithapi', book: 3, page: 4, lastPage: 4, bookOrder: [1,2,3] }),
    { done: true });
});

test('computeListAdvance: hadithapi with no book list falls back to single-book paging', () => {
  assert.deepEqual(
    core.computeListAdvance({ provider: 'hadithapi', book: 2, page: 1, lastPage: 2, bookOrder: null }),
    { done: false, book: 2, page: 2 });
  assert.deepEqual(
    core.computeListAdvance({ provider: 'hadithapi', book: 2, page: 2, lastPage: 2, bookOrder: null }),
    { done: true });
});

test('loadMoreMode maps fresh/append/end states', () => {
  assert.equal(core.loadMoreMode({ freshCount: 0, append: false, done: true }), 'hide');   // empty first load
  assert.equal(core.loadMoreMode({ freshCount: 25, append: false, done: false }), 'idle');
  assert.equal(core.loadMoreMode({ freshCount: 10, append: true, done: true }), 'end');
  assert.equal(core.loadMoreMode({ freshCount: 25, append: true, done: false }), 'idle');
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd worker && node --test test/hadith-list-core.test.js`
Expected: FAIL (`Cannot find module '../../src/js/hadith-list-core.js'`).

- [ ] **Step 3: Create the core**

Create `src/js/hadith-list-core.js`:

```js
/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — hadith-list-core.js
   Pure, framework-free logic for the Tier-3a endless collection list.
   NO DOM, NO network. UMD (window.II.hadithList in the browser;
   module.exports in tests). Companion to the DOM layer in tier3-deep-view.js.
   ═══════════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  // Classify a raw search-box value.
  //   all-digits            → { kind:'number' }  (jump to that hadith number)
  //   >=2 non-numeric chars → { kind:'keyword' } (text filter)
  //   empty                 → { kind:'empty' }
  //   1 non-numeric char    → { kind:'too-short' } (below the 2-char search floor)
  function parseSearchInput(raw) {
    var s = String(raw == null ? '' : raw).trim();
    if (!s) return { kind: 'empty', number: null, query: '' };
    if (/^\d+$/.test(s)) return { kind: 'number', number: parseInt(s, 10), query: s };
    if (s.length < 2) return { kind: 'too-short', number: null, query: s };
    return { kind: 'keyword', number: null, query: s };
  }

  // Given the page just loaded, decide the next fetch target (or that the stream is done).
  //   cur = { provider, book, page, lastPage, bookOrder }
  //   bookOrder = ordered array of hadithapi book numbers, or null (direct sources /
  //   hadithapi with no book list → single flat sequence within the current book).
  function computeListAdvance(cur) {
    cur = cur || {};
    var walk = (cur.provider === 'hadithapi' && Array.isArray(cur.bookOrder));
    var morePages = (cur.lastPage == null) ? false : (cur.page < cur.lastPage);
    if (morePages) return { done: false, book: cur.book, page: cur.page + 1 };
    if (!walk) return { done: true };                                  // flat sequence exhausted
    var i = cur.bookOrder.map(String).indexOf(String(cur.book));
    if (i === -1 || i >= cur.bookOrder.length - 1) return { done: true };  // last book exhausted
    return { done: false, book: cur.bookOrder[i + 1], page: 1 };       // walk to next book
  }

  // Load-More button state after a load.
  //   'hide'  → nothing loaded on the first page (empty collection/book)
  //   'end'   → stream is done
  //   'idle'  → more available
  function loadMoreMode(s) {
    s = s || {};
    if (!s.append && !s.freshCount) return 'hide';
    if (s.done) return 'end';
    return 'idle';
  }

  var core = { parseSearchInput: parseSearchInput, computeListAdvance: computeListAdvance, loadMoreMode: loadMoreMode };
  if (typeof module !== 'undefined' && module.exports) { module.exports = core; }
  else { root.II = root.II || {}; root.II.hadithList = core; }

}(typeof globalThis !== 'undefined' ? globalThis : window));
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd worker && node --test test/hadith-list-core.test.js`
Expected: PASS (all cases green).

- [ ] **Step 5: Load the core in the page**

In `hadith.html`, find where the other hadith cores are included (search for `hadith-feed-core.js`) and add a `<script>` tag for `hadith-list-core.js` on the line immediately after it, matching the existing tag style, e.g.:

```html
<script src="src/js/hadith-list-core.js"></script>
```

- [ ] **Step 6: Commit**

```bash
git add src/js/hadith-list-core.js worker/test/hadith-list-core.test.js hadith.html
git commit -m "feat(hadith): pure list-core (search parse, chapter-walk advance, load-more mode)"
```

---

## Task 5: Frontend — endless Tier-3a list (chapter-walk + Load More)

**Files:**
- Modify: `src/js/tier3-deep-view.js` (`renderList` + helpers, lines ~40-156)
- Modify: `hadith.html` (minimal CSS for `.t3a-load-more`)

> DOM task — verified manually (repo convention; the pure logic is unit-tested in Task 4). The new list references `II.hadithList` (Task 4) and `host.api.fetchHadithByNumber` / `host.api.hadithProviderOf` (Task 3).

- [ ] **Step 1: Add the load-more markup + state helpers**

In `src/js/tier3-deep-view.js`, add near the top of the file after the `GRADES` line (~line 17):

```js
  var listCore = II.hadithList;                      // pure logic (Task 4)
```

Then replace `bookNavHTML` (lines ~77-88) with the load-more helpers:

```js
  // Endless Load-More button (replaces the old book Prev/Next). One button; a
  // state machine drives its label/visibility. Reuses the .load-more-btn styles.
  function loadMoreHTML() {
    return '<div class="t3a-load-more" id="ii-t3a-lm-wrap" style="text-align:center;margin:8px 0 24px;">' +
      '<button class="load-more-btn" id="ii-t3a-lm" type="button">' +
      '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 5v14M5 12l7 7 7-7"/></svg> ' +
      '<span>Load more hadiths</span></button></div>';
  }
  function setListLoadMore(mode) {
    var wrap = $('#ii-t3a-lm-wrap'), btn = $('#ii-t3a-lm');
    if (!wrap || !btn) return;
    var lbl = btn.querySelector('span');
    var end = $('#ii-t3a-lm-end'); if (end) end.remove();
    if (mode === 'hide') { wrap.style.display = 'none'; return; }
    wrap.style.display = '';
    if (mode === 'end') {
      btn.style.display = 'none';
      var n = document.createElement('div'); n.id = 'ii-t3a-lm-end';
      n.style.cssText = 'font-size:12px;color:var(--ink-muted);';
      n.textContent = 'You’ve reached the end of this collection.';
      wrap.appendChild(n); return;
    }
    btn.style.display = '';
    if (mode === 'loading') { btn.disabled = true; if (lbl) lbl.textContent = 'Loading…'; }
    else if (mode === 'error') { btn.disabled = false; if (lbl) lbl.textContent = 'Retry — load more'; }
    else { btn.disabled = false; if (lbl) lbl.textContent = 'Load more hadiths'; }
  }
```

- [ ] **Step 2: Add the list state + `loadListPage`**

In `src/js/tier3-deep-view.js`, add above `renderList` (~line 90):

```js
  // Tier-3a endless list state. `next` holds the target for the following Load More.
  var LIST = { slug: null, provider: null, book: null, page: 0, lastPage: null,
               bookOrder: null, next: null, refs: null, byRef: {}, grade: 'all',
               loading: false, token: null, ctx: null };

  // Fetch one page for the current provider. hadithapi → per-book route (chapter-walk);
  // direct sources → flat page. Returns the Worker envelope.
  function fetchListPage(book, page) {
    if (LIST.provider === 'hadithapi') return host.api.fetchHadithList(LIST.slug, book, page, 25);
    return host.api.fetchHadithsByBook(LIST.slug, BOOKLESS_DEFAULT, page, 25);
  }

  async function loadListPage(append) {
    var listEl = $('#ii-t3a-list'); if (!listEl || LIST.loading) return;
    LIST.loading = true;
    var target = append ? (LIST.next || { book: LIST.book, page: LIST.page + 1 })
                        : { book: LIST.book, page: 1 };
    if (append) setListLoadMore('loading');
    var token = LIST.token;
    var res; try { res = await fetchListPage(target.book, target.page); } catch (_) { res = null; }
    if (token !== LIST.token) { LIST.loading = false; return; }         // route changed mid-fetch
    LIST.loading = false;

    if (!res || !res.ok || !res.data || !Array.isArray(res.data.hadiths)) {
      if (append) { setListLoadMore('error'); if (host.ui.showToast) host.ui.showToast('Could not load more — try again'); }
      else {
        listEl.innerHTML = '<div class="books-error"><div class="books-empty-title">Hadiths temporarily unavailable</div>' +
          '<div>We couldn’t load the hadiths for this collection.</div>' +
          '<button class="btn-glass" id="ii-t3a-retry" type="button" style="margin-top:14px;">Try again</button></div>';
        var retry = $('#ii-t3a-retry'); if (retry) retry.addEventListener('click', function () { loadListPage(false); });
      }
      return;
    }

    var data = res.data;
    var fresh = host.feed.dedupeByRef(LIST.refs, data.hadiths);
    fresh.forEach(function (h) { var r = host.feed.refOf(h); LIST.refs.add(r); LIST.byRef[r] = h; });
    var html = fresh.map(host.feed.buildCardHTML).join('');
    if (append) { if (html) listEl.insertAdjacentHTML('beforeend', html); }
    else { listEl.innerHTML = html || '<div class="books-empty"><div class="books-empty-title">No hadiths in this collection.</div></div>'; }
    if (host.observeFeed) host.observeFeed(listEl);

    LIST.book = target.book; LIST.page = data.page || target.page; LIST.lastPage = data.lastPage;
    var adv = listCore.computeListAdvance({ provider: LIST.provider, book: LIST.book,
      page: LIST.page, lastPage: LIST.lastPage, bookOrder: LIST.bookOrder });
    LIST.next = adv.done ? null : { book: adv.book, page: adv.page };

    applyListGradeFilter(listEl, LIST.grade);
    setListLoadMore(listCore.loadMoreMode({ freshCount: fresh.length, append: append, done: adv.done }));
  }
```

- [ ] **Step 3: Rewrite `renderList`**

Replace the whole `renderList` function (lines ~90-156) with:

```js
  async function renderList(r, c) {
    host.setTier(2);
    if (host.resetReadingProgress) host.resetReadingProgress();
    var el = host.tier2El(); if (!el) return;
    var slug = c.slug;
    var grade = readGradeParam();
    var token = slug + ':' + Date.now();
    el.dataset.t3aToken = token;

    // reset list state for this collection
    LIST.slug = slug;
    LIST.provider = (host.api.hadithProviderOf ? host.api.hadithProviderOf(slug) : 'hadithapi');
    LIST.page = 0; LIST.lastPage = null; LIST.bookOrder = null; LIST.next = null;
    LIST.refs = new Set(); LIST.byRef = {}; LIST.grade = grade; LIST.loading = false;
    LIST.token = token; LIST.ctx = { r: r, c: c };
    // anchor book: books-grid entry (r.book) for hadithapi, else first book / bookless default
    LIST.book = (LIST.provider === 'hadithapi' && r.book != null && r.book !== '') ? r.book
              : (LIST.provider === 'hadithapi' ? 1 : BOOKLESS_DEFAULT);

    var skeleton = '';
    for (var i = 0; i < 4; i++) skeleton += '<div class="hadith-card" aria-hidden="true" style="opacity:.5;height:120px;"></div>';
    el.innerHTML = listHeaderHTML(c, null, c.nameEnglish, null) + searchBarHTML() + gradePillsHTML(grade) +
      '<div id="t3a-status" class="ii-sr-live" aria-live="polite" style="font-size:12px;color:var(--ink-muted);margin:8px 0;"></div>' +
      '<div class="t3a-list" id="ii-t3a-list">' + skeleton + '</div>' + loadMoreHTML();

    wireListGradePills(el);
    wireListLoadMore();
    wireListFullView(el);
    wireListSearch(el, c);

    // hadithapi: fetch the ordered book list first so the walk can cross books.
    if (LIST.provider === 'hadithapi') {
      try {
        var b = await host.api.fetchHadithBooks(slug);
        if (LIST.token !== token) return;
        if (b && b.ok && Array.isArray(b.data)) {
          LIST.bookOrder = b.data.map(function (x) { return x.bookNumber; })
            .filter(function (n) { return n != null; });
          // if entered without a specific book, start at the first book in order
          if ((r.book == null || r.book === '') && LIST.bookOrder.length) LIST.book = LIST.bookOrder[0];
        }
      } catch (_) { /* no book list → single-book fallback via computeListAdvance */ }
    }
    if (LIST.token !== token) return;
    loadListPage(false);
  }
```

- [ ] **Step 4: Add the wiring helpers**

In `src/js/tier3-deep-view.js`, add these helpers just below `loadListPage` (the `searchBarHTML`, `wireListSearch`, and `runKeywordSearch` bodies are defined in Task 6 — add stubs now so this task’s wiring compiles, then Task 6 fills them in):

```js
  function wireListGradePills(el) {
    el.querySelectorAll('.t3a-grade-filter .grade-filter-pill').forEach(function (pill) {
      pill.addEventListener('click', function () {
        LIST.grade = pill.getAttribute('data-grade');
        el.querySelectorAll('.t3a-grade-filter .grade-filter-pill').forEach(function (p) {
          var on = p === pill; p.classList.toggle('on', on); p.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        applyListGradeFilter($('#ii-t3a-list'), LIST.grade);
      });
    });
  }
  function wireListLoadMore() {
    var btn = $('#ii-t3a-lm'); if (btn) btn.addEventListener('click', function () { loadListPage(true); });
  }
  function wireListFullView(el) {
    el.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('[data-act="full"]');
      if (!btn || !el.contains(btn)) return;
      var card = btn.closest('.hadith-card'); if (!card) return;
      var ref = card.getAttribute('data-ref'); if (!ref) return;
      var parts = ref.split(':');                                       // slug:book:num
      host.routeTo({ collection: parts[0], book: parts[1], hadith: parts[2] }, true);
    });
  }
  // Task 6 fills these in:
  function searchBarHTML() { return ''; }
  function wireListSearch(el, c) { /* Task 6 */ }
```

- [ ] **Step 5: Add minimal CSS**

In `hadith.html`, near the existing `.load-more-btn` / `.dv-prevnext` styles (search for `.load-more-btn`), add:

```css
    .t3a-load-more { min-height: 44px; }
    .t3a-search { display: flex; gap: 8px; margin: 4px 0 12px; }
    .t3a-search input { flex: 1; padding: 10px 14px; border: 1px solid var(--line); border-radius: 10px; font: inherit; background: var(--surface); color: var(--ink); }
    .t3a-search button { padding: 10px 16px; border-radius: 10px; border: 1px solid var(--teal-200, rgba(0,105,110,.25)); background: rgba(0,105,110,.08); color: var(--teal-700, #00696e); cursor: pointer; }
    .t3a-search-clear { font-size: 12px; color: var(--ink-muted); margin: 0 0 12px; }
```

> If any CSS var above is not defined in this stylesheet, substitute the nearest existing token used by `.load-more-btn` / inputs — do not introduce raw hex beyond the fallbacks already shown.

- [ ] **Step 6: Manual verification**

Run the app (`/hadith.html`), open a **direct-source** collection (e.g. Bulugh al-Maram) and a **hadithapi** collection (e.g. Sahih al-Bukhari). Verify:
- Initial list shows 25 cards, then a centered "Load more hadiths" button.
- Clicking Load More appends 25 more each time; for Bukhari it continues past the end of a book into the next book without a "next book" jump; button shows "You've reached the end of this collection." at the true end.
- Grade pills still filter the loaded set.
- No "← Previous book / Next book →" nav remains.
- Console: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/js/tier3-deep-view.js hadith.html
git commit -m "feat(hadith): endless Tier-3a list via chapter-walk + Load More (removes book Prev/Next)"
```

---

## Task 6: Frontend — in-collection search bar (number jump + keyword)

**Files:**
- Modify: `src/js/tier3-deep-view.js` (fill in `searchBarHTML`, `wireListSearch`; add `runKeywordSearch`, `openHadithByNumber`)

> DOM task — verified manually. Uses `listCore.parseSearchInput` (Task 4) and `host.api.fetchHadithByNumber` / `host.api.fetchHadithSearch` (Task 3).

- [ ] **Step 1: Implement `searchBarHTML`**

Replace the Task-5 stub `function searchBarHTML() { return ''; }` with:

```js
  function searchBarHTML() {
    return '<form class="t3a-search" id="ii-t3a-search" role="search" aria-label="Search this collection">' +
      '<input id="ii-t3a-search-input" type="search" inputmode="text" ' +
      'placeholder="Search this collection — hadith number or keyword" ' +
      'aria-label="Search this collection by hadith number or keyword" autocomplete="off">' +
      '<button type="submit">Search</button></form>';
  }
```

- [ ] **Step 2: Implement `wireListSearch`, `openHadithByNumber`, `runKeywordSearch`**

Replace the Task-5 stub `function wireListSearch(el, c) { /* Task 6 */ }` with:

```js
  function wireListSearch(el, c) {
    var form = $('#ii-t3a-search', el), input = $('#ii-t3a-search-input', el);
    if (!form || !input) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var parsed = listCore.parseSearchInput(input.value);
      var status = $('#t3a-status');
      if (parsed.kind === 'number') { openHadithByNumber(c, parsed.number); return; }
      if (parsed.kind === 'keyword') { runKeywordSearch(c, parsed.query); return; }
      if (parsed.kind === 'too-short') { if (status) status.textContent = 'Type at least 2 characters, or a hadith number.'; return; }
      // empty → restore the full endless list
      restoreFullList();
    });
  }

  // Number jump. hadithapi: resolve the number → its book, then open the deep view.
  // Direct sources: the deep view finds the hadith by number itself (book segment ignored).
  function openHadithByNumber(c, num) {
    var status = $('#t3a-status');
    if (LIST.provider !== 'hadithapi') {
      host.routeTo({ collection: c.slug, book: BOOKLESS_DEFAULT, hadith: num }, true);
      return;
    }
    if (status) status.textContent = 'Finding hadith #' + num + '…';
    host.api.fetchHadithByNumber(c.slug, num).then(function (res) {
      var h = res && res.ok && res.data && Array.isArray(res.data.hadiths) ? res.data.hadiths[0] : null;
      if (h && h.bookNumber != null) {
        host.routeTo({ collection: c.slug, book: h.bookNumber, hadith: num }, true);
      } else if (status) {
        status.textContent = 'No hadith #' + num + ' found in ' + c.nameEnglish + '.';
      }
    }).catch(function () { if (status) status.textContent = 'Couldn’t look up hadith #' + num + ' — try again.'; });
  }

  // Keyword search, scoped to the current collection. Renders results in the list
  // container and swaps Load More for a "clear search" control.
  function runKeywordSearch(c, q) {
    var listEl = $('#ii-t3a-list'), status = $('#t3a-status');
    if (!listEl) return;
    setListLoadMore('hide');
    listEl.innerHTML = '<div class="books-empty"><div class="books-empty-title">Searching “' + esc(q) + '”…</div></div>';
    host.api.fetchHadithSearch(q, readLang(), 1, c.slug).then(function (res) {
      if (LIST.token == null) return;
      var results = res && res.ok && res.data && Array.isArray(res.data.results) ? res.data.results : null;
      if (!results) {
        listEl.innerHTML = '<div class="books-error"><div class="books-empty-title">Search unavailable</div>' +
          '<div>Please try again in a moment.</div></div>';
        return;
      }
      // defensive: if the upstream ignored the book scope, keep only this collection
      results = results.filter(function (h) { return !h.collectionSlug || h.collectionSlug === c.slug; });
      if (!results.length) {
        listEl.innerHTML = '<div class="books-empty"><div class="books-empty-title">No matches for “' + esc(q) + '” in ' + esc(c.nameEnglish) + '.</div></div>';
      } else {
        results.forEach(function (h) { var r = host.feed.refOf(h); if (r) LIST.byRef[r] = h; });
        listEl.innerHTML = results.map(host.feed.buildCardHTML).join('');
        if (host.observeFeed) host.observeFeed(listEl);
        applyListGradeFilter(listEl, LIST.grade);
      }
      renderSearchClear(q, results.length);
    }).catch(function () {
      listEl.innerHTML = '<div class="books-error"><div class="books-empty-title">Search unavailable</div><div>Please try again.</div></div>';
    });
  }

  function renderSearchClear(q, count) {
    var listEl = $('#ii-t3a-list'); if (!listEl) return;
    var bar = document.createElement('div');
    bar.className = 't3a-search-clear';
    bar.innerHTML = count + ' result' + (count === 1 ? '' : 's') + ' for “' + esc(q) + '” · ' +
      '<a href="#" id="ii-t3a-clear">Clear search — back to all hadith</a>';
    listEl.parentNode.insertBefore(bar, listEl);
    var link = $('#ii-t3a-clear');
    if (link) link.addEventListener('click', function (e) { e.preventDefault(); restoreFullList(); });
  }

  function restoreFullList() {
    var clear = document.querySelector('.t3a-search-clear'); if (clear) clear.remove();
    var input = $('#ii-t3a-search-input'); if (input) input.value = '';
    // reset the endless stream from the top of the collection
    LIST.page = 0; LIST.lastPage = null; LIST.next = null; LIST.refs = new Set(); LIST.byRef = {};
    LIST.book = (LIST.provider === 'hadithapi' && LIST.bookOrder && LIST.bookOrder.length) ? LIST.bookOrder[0]
              : (LIST.provider === 'hadithapi' ? 1 : BOOKLESS_DEFAULT);
    loadListPage(false);
  }
```

- [ ] **Step 3: Manual verification**

Run the app. In **Sahih al-Bukhari**:
- Type `2500`, submit → opens the full view for hadith #2500 (status shows "Finding…" then routes).
- Type `patience`, submit → shows in-collection results; "Clear search — back to all hadith" restores the endless list.
- Type `a`, submit → status hints to type ≥2 chars / a number.
In **Bulugh al-Maram** (direct source):
- Type a valid number → opens that hadith; keyword → filters within the collection.
- Console: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/js/tier3-deep-view.js
git commit -m "feat(hadith): in-collection search — number jump + scoped keyword results"
```

---

## Task 7: Fix "Open Full View" on the landing feed

**Files:**
- Modify: `src/js/hadith.js` (`wireFeedActions`, ~lines 1383-1396)

> The Tier-3a list already routes correctly (Task 5 `wireListFullView`). The landing feed (`#hadith-feed`) still shows a stale toast "Full hadith view arrives in a later stage" for `data-act="full"`. Route it into the deep view instead.

- [ ] **Step 1: Replace the `full` toast with a route**

In `src/js/hadith.js`, in `wireFeedActions` (~lines 1383-1396), change the handler so `full` routes and remove the stale `MSG.full`:

```js
  function wireFeedActions() {
    var el = feedEl(); if (!el) return;
    el.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('[data-act]');
      if (!btn || !el.contains(btn)) return;
      var act = btn.getAttribute('data-act');
      if (act === 'isnad') { toggleIsnad(btn.closest('.hadith-card'), btn); return; }
      if (act === 'full') {
        var card = btn.closest('.hadith-card'); var ref = card && card.getAttribute('data-ref');
        if (ref) { var p = ref.split(':'); routeTo({ collection: p[0], book: p[1], hadith: p[2] }, true); }
        return;
      }
    });
  }
```

- [ ] **Step 2: Manual verification**

Run the app. On the hadith landing page (the default feed at the top of `/hadith.html`), click **"Open Full View"** on a card → it opens the Tier-3b deep view for that hadith (no toast, no dead click). Use the browser Back button → returns to the landing feed. Console: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/js/hadith.js
git commit -m "fix(hadith): landing-feed Open Full View routes into the deep view (was a stale toast)"
```

---

## Task 8: Verify books-grid entry anchoring (D3)

**Files:** none (verification of Task 5 behavior); if a defect is found, fix in `src/js/tier3-deep-view.js`.

> The books grid (`loadBooksGrid` in `src/js/hadith.js`) is unchanged and still links each book to `/hadith/:slug/:book`, which calls `renderList` with `r.book` set. Task 5 anchors the walk at `r.book`. This task confirms it end-to-end.

- [ ] **Step 1: Manual verification — anchored entry**

Run the app. Open **Sahih al-Bukhari** from the sidebar. Because Bukhari is a hadithapi collection, confirm the books grid still appears (Tier 2). Click a mid-collection book (e.g. "Book 10"):
- The list opens anchored at Book 10's hadith (first cards belong to Book 10).
- Load More continues into Book 11, 12, … to the end of the collection (endless forward), never a "next book" button.
- The breadcrumb/header reflects the collection.

- [ ] **Step 2: Manual verification — default entry**

Open **Sahih al-Bukhari** and (if the sidebar links straight to the collection) confirm default entry starts at the first book and flows forward. Open a **direct-source** collection and confirm it opens the flat endless list directly (no books grid, per existing `isBookless`).

- [ ] **Step 3: If a defect is found**

If anchored entry does not start at the chosen book, verify in `renderList` (Task 5, Step 3) that `LIST.book` is set from `r.book` for hadithapi and NOT overwritten by the `bookOrder[0]` line (that line must run only when `r.book` is empty). Fix and re-verify. Otherwise, no code change.

- [ ] **Step 4: Commit (only if a fix was needed)**

```bash
git add src/js/tier3-deep-view.js
git commit -m "fix(hadith): anchor endless list at the books-grid-selected book"
```

---

## Task 9: Full regression, live VERIFY probe, and wrap-up

**Files:** none (verification); update the spec checkbox for the live probe.

- [ ] **Step 1: Run the whole test suite**

Run: `cd worker && npm test`
Expected: PASS — all `worker/test/*.test.js` green, including the new `hadith-router.test.js` cases and `hadith-list-core.test.js`. Confirm the count of passing tests did not drop for any pre-existing file.

- [ ] **Step 2: Live VERIFY probe (spec §5.1) — flat-list bonus only**

The flat-list mode of the new route is optional (pagination uses chapter-walk). If you want to enable/keep it, confirm against a live hadithapi response that a book-only query returns paginated hadith with `total`/`last_page`:

Run (with a real key): `curl -s "https://hadithapi.com/api/hadiths/?apiKey=$HADITH_API_KEY&book=sahih-bukhari&paginate=25&page=2" | head -c 400`
Expected: JSON with `hadiths.data` (length 25) and non-null `hadiths.last_page` / `hadiths.total`. If empty or unsupported, leave pagination on chapter-walk (default) — no code change needed; note the result in the spec §7 checklist.

- [ ] **Step 3: Cross-collection manual smoke**

For at least one collection of each provider family — hadithapi (Bukhari), direct AhmedBaset (Bulugh al-Maram), direct fawazahmed0 (Nawawi40) — confirm: 25 → Load More → endless to end; number jump; keyword search + clear; Open Full View. Note any provider-specific quirks.

- [ ] **Step 4: Update the spec DoD**

In [the spec](../specs/2026-07-23-hadith-endless-list-and-search-design.md) §7, check off the items now verified and record the §5.1 probe result (supported / left on chapter-walk).

- [ ] **Step 5: Final commit**

```bash
git add docs/superpowers/specs/2026-07-23-hadith-endless-list-and-search-design.md
git commit -m "docs(hadith): record endless-list verification results"
```

- [ ] **Step 6: Offer the branch for review**

Summarize what shipped on `feat/hadith-endless-list-search` and ask the owner whether to open a PR / merge (do not push or merge without the owner's go-ahead). Live browser + assistive-tech sign-off follows the repo's usual human-gated posture.

---

## Self-Review Notes (for the executor)

- **Spec coverage:** endless across books (Tasks 4-5, chapter-walk) · number+keyword scoped search (Tasks 2-3, 6) · every collection incl. direct sources (Task 5 provider routing) · books-grid kept + anchored (Task 8) · Open Full View everywhere (Tasks 5 + 7). Backend refinement (chapter-walk, narrow resolver route) is documented in the spec's §5.1 refinement note.
- **Type consistency:** `LIST` fields, `computeListAdvance` return shape (`{done, book?, page?}`), and `parseSearchInput` kinds (`number|keyword|empty|too-short`) are used identically across Tasks 4-6.
- **No content/authenticity change:** cards always render via `host.feed.buildCardHTML`; no grade/isnad/translation logic touched.
