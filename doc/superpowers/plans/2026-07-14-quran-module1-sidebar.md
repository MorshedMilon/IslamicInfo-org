# Module 1 — Sidebar Surah List & Navigation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render all 114 Surahs in the locked Quran Explorer sidebar from live Quran.com data (static-seed + `localStorage` 24h cache, no DB), and wire real-time search, Makki/Madani filtering, and surah selection with a `?surah=<slug>` deep-link URL.

**Architecture:** Static multi-page site + vanilla JS. Pure, DOM-free logic lives in a UMD module (`src/js/quran-sidebar-core.js`) unit-tested in Node; the DOM controller (`src/js/quran-sidebar.js`) fetches/caches/renders and overrides the locked page's inline demo functions (`filterSurahs`, `filterReveal`, `selectSurah`) after load. Chapters are fetched client-side directly from `api.quran.com` (public, keyless) with a bundled seed fallback. No server route, no Supabase.

**Tech Stack:** Vanilla ES5-safe JS (browser `<script>`), Node `node:test` for unit tests, Quran.com API v4, `localStorage`.

**Spec:** `doc/superpowers/specs/2026-07-14-quran-module1-sidebar-design.md`

---

## File Structure

| File | Responsibility |
|---|---|
| `src/data/chapters.json` (NEW) | 114-chapter seed (real API data); offline/error fallback |
| `src/js/quran-sidebar-core.js` (NEW) | Pure logic: `slugify`, `revelationToType`, `typeToChipClass`, `typeToLabel`, `normalizeChapter`, `matchesSearch`, `matchesFilter`, `isFresh`. UMD (Node + browser). No DOM. |
| `src/js/quran-sidebar.js` (NEW) | DOM controller: fetch/cache/seed, render rows, skeleton/empty states, override globals, URL sync, keyboard, `loadSurah` hook |
| `tests/quran/sidebar-core.test.js` (NEW) | Node unit tests for the core module |
| `quran.html` (MODIFY) | Remove 12 demo `.surah-row`; add 2 `<script>` includes; add skeleton placeholder |
| `DATA.md` (MODIFY) | Register `ii-quran-chapters` key |
| `DECISIONS.md` (MODIFY) | ADR for `?surah=<slug>` deep-link scheme |

**Interfaces locked in (used across tasks — keep names identical):**
- Core exports (browser: `window.II.sidebarCore.*`; Node: `module.exports`): `slugify(name) → string`, `revelationToType(place) → 'makki'|'madinah'`, `typeToChipClass(type) → 'chip-makki'|'chip-madani'`, `typeToLabel(type) → 'Makki'|'Madani'`, `normalizeChapter(raw) → chapter|null`, `matchesSearch(chapter, q) → bool`, `matchesFilter(chapter, type) → bool`, `isFresh(fetchedAt, now, maxAgeMs?) → bool`.
- Chapter object: `{ id:number, name_simple:string, name_arabic:string, revelation_place:string, verses_count:number, slug:string }`.
- Cache: `localStorage['ii-quran-chapters'] = { fetchedAt:number, data:Chapter[] }`.

---

## Task 1: Generate the real chapters seed

**Files:**
- Create: `src/data/chapters.json`

- [ ] **Step 1: Fetch live chapters and write the normalized seed**

Run (Git Bash / Node one-off — real API data, never fabricated):

```bash
node -e '
const https=require("https");
https.get("https://api.quran.com/api/v4/chapters?language=en",res=>{
  let b="";res.on("data",d=>b+=d);res.on("end",()=>{
    const raw=JSON.parse(b).chapters;
    const slug=n=>String(n).toLowerCase().replace(/[’'"'"'"']/g,"").normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
    const out=raw.map(c=>({id:c.id,name_simple:c.name_simple,name_arabic:c.name_arabic,revelation_place:c.revelation_place,verses_count:c.verses_count,slug:slug(c.name_simple)}));
    require("fs").mkdirSync("src/data",{recursive:true});
    require("fs").writeFileSync("src/data/chapters.json",JSON.stringify(out,null,2));
    console.log("wrote",out.length,"chapters");
  });
});'
```

Expected: `wrote 114 chapters`

- [ ] **Step 2: Verify the seed integrity**

Run:

```bash
node -e '
const c=require("./src/data/chapters.json");
const a=require("assert");
a.equal(c.length,114,"expected 114 chapters");
a.equal(c[0].name_simple,"Al-Fatihah"); a.equal(c[0].slug,"al-fatihah"); a.equal(c[0].revelation_place,"makkah");
a.equal(c[8].id,9); a.equal(c[8].name_simple,"At-Tawbah"); a.equal(c[8].revelation_place,"madinah");
a.equal(c[113].id,114); a.equal(c[113].name_simple,"An-Nas");
console.log("seed OK");'
```

Expected: `seed OK`

- [ ] **Step 3: Commit**

```bash
git add src/data/chapters.json
git commit -m "feat(quran): add 114-chapter seed from Quran.com API"
```

---

## Task 2: Pure core module (TDD)

**Files:**
- Create: `src/js/quran-sidebar-core.js`
- Test: `tests/quran/sidebar-core.test.js`

- [ ] **Step 1: Write the failing tests**

Create `tests/quran/sidebar-core.test.js`:

```js
'use strict';
const test = require('node:test');
const assert = require('node:assert');
const core = require('../../src/js/quran-sidebar-core.js');

test('slugify', () => {
  assert.equal(core.slugify('Al-Fatihah'), 'al-fatihah');
  assert.equal(core.slugify('Aal-Imran'), 'aal-imran');
  assert.equal(core.slugify("Al-An'am"), 'al-anam');
  assert.equal(core.slugify('An-Nisa'), 'an-nisa');
  assert.equal(core.slugify('An-Nas'), 'an-nas');
});

test('revelationToType', () => {
  assert.equal(core.revelationToType('makkah'), 'makki');
  assert.equal(core.revelationToType('madinah'), 'madinah');
});

test('typeToChipClass / typeToLabel', () => {
  assert.equal(core.typeToChipClass('makki'), 'chip-makki');
  assert.equal(core.typeToChipClass('madinah'), 'chip-madani');
  assert.equal(core.typeToLabel('makki'), 'Makki');
  assert.equal(core.typeToLabel('madinah'), 'Madani');
});

test('normalizeChapter valid + invalid', () => {
  const c = core.normalizeChapter({ id: 2, name_simple: 'Al-Baqarah', name_arabic: 'البقرة', revelation_place: 'madinah', verses_count: 286 });
  assert.equal(c.slug, 'al-baqarah');
  assert.equal(c.verses_count, 286);
  assert.equal(core.normalizeChapter(null), null);
  assert.equal(core.normalizeChapter({ id: 'x' }), null);
});

test('matchesSearch: english, arabic, numeric, empty', () => {
  const c = { id: 2, name_simple: 'Al-Baqarah', name_arabic: 'البقرة' };
  assert.equal(core.matchesSearch(c, ''), true);
  assert.equal(core.matchesSearch(c, 'baq'), true);
  assert.equal(core.matchesSearch(c, 'BAQ'), true);
  assert.equal(core.matchesSearch(c, 'البقرة'), true);
  assert.equal(core.matchesSearch(c, '2'), true);
  assert.equal(core.matchesSearch(c, '3'), false);
  assert.equal(core.matchesSearch(c, 'zzz'), false);
});

test('matchesFilter', () => {
  const makki = { revelation_place: 'makkah' };
  const madani = { revelation_place: 'madinah' };
  assert.equal(core.matchesFilter(makki, 'all'), true);
  assert.equal(core.matchesFilter(makki, 'makki'), true);
  assert.equal(core.matchesFilter(makki, 'madinah'), false);
  assert.equal(core.matchesFilter(madani, 'madinah'), true);
});

test('isFresh (24h window)', () => {
  const now = 1_000_000_000_000;
  assert.equal(core.isFresh(now - 23 * 3600e3, now), true);
  assert.equal(core.isFresh(now - 25 * 3600e3, now), false);
  assert.equal(core.isFresh(undefined, now), false);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/quran/`
Expected: FAIL — `Cannot find module '../../src/js/quran-sidebar-core.js'`

- [ ] **Step 3: Write the core module**

Create `src/js/quran-sidebar-core.js`:

```js
/* IslamicInfo.org — quran-sidebar-core.js
   Pure, DOM-free logic for the Quran sidebar. UMD: Node + browser. */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  else { root.II = root.II || {}; root.II.sidebarCore = api; }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function slugify(name) {
    return String(name == null ? '' : name)
      .toLowerCase()
      .replace(/['’]/g, '')                       // drop apostrophes: Al-An'am -> al-anam
      .normalize('NFD').replace(/[̀-ͯ]/g, '') // strip Latin diacritics
      .replace(/[^a-z0-9]+/g, '-')                      // non-alnum runs -> single hyphen
      .replace(/^-+|-+$/g, '');                         // trim hyphens
  }

  function revelationToType(place) {
    return place === 'makkah' ? 'makki' : 'madinah';
  }
  function typeToChipClass(type) { return type === 'makki' ? 'chip-makki' : 'chip-madani'; }
  function typeToLabel(type)     { return type === 'makki' ? 'Makki' : 'Madani'; }

  function normalizeChapter(raw) {
    if (!raw || typeof raw.id !== 'number' || !raw.name_simple) return null;
    return {
      id: raw.id,
      name_simple: raw.name_simple,
      name_arabic: raw.name_arabic || '',
      revelation_place: raw.revelation_place,
      verses_count: typeof raw.verses_count === 'number' ? raw.verses_count : 0,
      slug: slugify(raw.name_simple)
    };
  }

  function matchesSearch(chapter, q) {
    q = String(q == null ? '' : q).trim().toLowerCase();
    if (!q) return true;
    if (/^\d+$/.test(q)) return String(chapter.id).indexOf(q) === 0;
    return chapter.name_simple.toLowerCase().indexOf(q) !== -1
        || (chapter.name_arabic || '').toLowerCase().indexOf(q) !== -1;
  }

  function matchesFilter(chapter, type) {
    if (!type || type === 'all') return true;
    return revelationToType(chapter.revelation_place) === type;
  }

  function isFresh(fetchedAt, now, maxAgeMs) {
    if (typeof maxAgeMs !== 'number') maxAgeMs = 24 * 60 * 60 * 1000;
    return typeof fetchedAt === 'number' && (now - fetchedAt) < maxAgeMs;
  }

  return { slugify, revelationToType, typeToChipClass, typeToLabel,
           normalizeChapter, matchesSearch, matchesFilter, isFresh };
});
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/quran/`
Expected: PASS — all 7 tests pass, 0 failures

- [ ] **Step 5: Commit**

```bash
git add src/js/quran-sidebar-core.js tests/quran/sidebar-core.test.js
git commit -m "feat(quran): add tested pure core for sidebar (slug/filter/search/cache)"
```

---

## Task 3: Register storage key + ADR (docs-first, satisfies DoD)

**Files:**
- Modify: `DATA.md` (§1 registry table)
- Modify: `DECISIONS.md` (append ADR)

- [ ] **Step 1: Add the `ii-quran-chapters` row to `DATA.md` §1**

Insert this row into the registry table (after the `ii-quran-reading-mode` row):

```
| `ii-quran-chapters` | `{ fetchedAt:number, data:Chapter[] }` (JSON) | Quran Explorer | 1 day (24h revalidate) |
```

- [ ] **Step 2: Append the ADR to `DECISIONS.md`**

Add:

```markdown
## ADR-015: Quran deep-link URL scheme = `?surah=<slug>` (query param)

**Status:** Accepted · 2026-07-14 · Module 1 (Sidebar)

**Context:** The Quran Explorer is a static page (no server router). PRD §2.3 envisions `/quran/<surah>` paths, but clean paths require Cloudflare Worker rewrite config.

**Decision:** Surah selection uses `history.pushState('?surah=<slug>')`. Static-safe, crawlable, shareable. Path-based `/quran/<slug>` is deferred to a future Worker-rewrite ADR.

**Consequences:** No server change needed now; URLs upgrade to clean paths later without breaking `?surah=` links (a redirect can be added).
```

- [ ] **Step 3: Commit**

```bash
git add DATA.md DECISIONS.md
git commit -m "docs(quran): register ii-quran-chapters key + ADR-015 deep-link scheme"
```

> Note: `DECISIONS.md` may not yet exist. If `test -f DECISIONS.md` fails, create it with a `# Architecture Decision Records` H1 before appending.

---

## Task 4: Sidebar controller — fetch, cache, render, states

**Files:**
- Create: `src/js/quran-sidebar.js`

- [ ] **Step 1: Write the controller (fetch/cache/seed/render + states)**

Create `src/js/quran-sidebar.js`:

```js
/* IslamicInfo.org — quran-sidebar.js
   DOM controller for the Quran Explorer sidebar (Module 1).
   Depends on: window.II.sidebarCore (quran-sidebar-core.js) loaded first. */
(function () {
  'use strict';

  var core = window.II && window.II.sidebarCore;
  var CACHE_KEY = 'ii-quran-chapters';
  var API_URL   = 'https://api.quran.com/api/v4/chapters?language=en';
  var SEED_URL  = 'src/data/chapters.json';

  var chapters = [];        // normalized Chapter[]
  var currentQuery = '';
  var currentFilter = 'all';

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function sbList() { return document.getElementById('sbList'); }

  // ---- cache ----------------------------------------------------------------
  function readCache() {
    try {
      var raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var obj = JSON.parse(raw);
      if (!obj || !Array.isArray(obj.data)) return null;
      return obj;
    } catch (e) {
      try { localStorage.removeItem(CACHE_KEY); } catch (_) {}
      return null;
    }
  }
  function writeCache(data) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ fetchedAt: Date.now(), data: data })); }
    catch (e) { /* quota/unavailable — render still proceeds */ }
  }

  // ---- fetch ----------------------------------------------------------------
  function fetchChapters() {
    var ctrl = new AbortController();
    var t = setTimeout(function () { ctrl.abort(); }, 8000); // TechSpec §5.2: 8s
    return fetch(API_URL, { signal: ctrl.signal })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (j) {
        clearTimeout(t);
        var list = (j.chapters || []).map(core.normalizeChapter).filter(Boolean);
        if (list.length < 1) throw new Error('empty chapters');
        return list;
      });
  }
  function fetchSeed() {
    return fetch(SEED_URL).then(function (r) {
      if (!r.ok) throw new Error('seed HTTP ' + r.status);
      return r.json();
    }).then(function (arr) { return arr.map(core.normalizeChapter).filter(Boolean); });
  }

  // ---- render ---------------------------------------------------------------
  function clearRows() {
    var list = sbList(); if (!list) return;
    Array.prototype.slice.call(list.querySelectorAll('.surah-row, .sb-skeleton, .sb-empty'))
      .forEach(function (n) { n.parentNode.removeChild(n); });
  }
  function insertPoint() {
    var list = sbList();
    return list ? list.querySelector('.sb-divider') : null; // rows go before divider
  }
  function buildRow(ch) {
    var type = core.revelationToType(ch.revelation_place);
    var row = document.createElement('div');
    row.className = 'surah-row';
    row.setAttribute('role', 'button');
    row.setAttribute('tabindex', '0');
    row.setAttribute('aria-label', ch.name_simple + ', ' + ch.verses_count + ' ayahs, ' + core.typeToLabel(type));
    row.dataset.id = String(ch.id);
    row.dataset.slug = ch.slug;
    row.dataset.type = type;
    row.dataset.name = ch.name_simple;
    row.dataset.ar = ch.name_arabic;
    row.dataset.meta = ch.verses_count + ' Ayahs';
    row.dataset.letter = (ch.name_arabic || '').charAt(0);

    var num = document.createElement('div');
    num.className = 'surah-num'; num.textContent = String(ch.id);

    var info = document.createElement('div'); info.className = 'surah-info';
    var en = document.createElement('div'); en.className = 'surah-en'; en.textContent = ch.name_simple;
    var metaRow = document.createElement('div'); metaRow.className = 'surah-meta-row';
    var chip = document.createElement('span');
    chip.className = 'surah-chip ' + core.typeToChipClass(type); chip.textContent = core.typeToLabel(type);
    var ayahs = document.createElement('span');
    ayahs.className = 'surah-ayahs'; ayahs.textContent = '· ' + ch.verses_count + ' ayahs';
    metaRow.appendChild(chip); metaRow.appendChild(ayahs);
    info.appendChild(en); info.appendChild(metaRow);

    var ar = document.createElement('div'); ar.className = 'surah-ar'; ar.textContent = ch.name_arabic;

    row.appendChild(num); row.appendChild(info); row.appendChild(ar);

    row.addEventListener('click', function () { window.selectSurah(row); });
    row.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); window.selectSurah(row); }
    });
    return row;
  }
  function renderRows(list) {
    var container = sbList(); if (!container) return;
    clearRows();
    var frag = document.createDocumentFragment();
    list.forEach(function (ch) { frag.appendChild(buildRow(ch)); });
    var before = insertPoint();
    if (before) container.insertBefore(frag, before); else container.appendChild(frag);
    applyVisibility();
  }
  function renderSkeleton() {
    var container = sbList(); if (!container) return;
    clearRows();
    var frag = document.createDocumentFragment();
    for (var i = 0; i < 8; i++) {
      var s = document.createElement('div');
      s.className = 'surah-row sb-skeleton';
      s.setAttribute('aria-hidden', 'true');
      s.innerHTML = '<div class="surah-num"></div><div class="surah-info">' +
        '<div class="surah-en">&nbsp;</div><div class="surah-meta-row">' +
        '<span class="surah-chip">&nbsp;</span></div></div><div class="surah-ar"></div>';
      s.style.opacity = '0.5';
      frag.appendChild(s);
    }
    var before = insertPoint();
    if (before) container.insertBefore(frag, before); else container.appendChild(frag);
  }
  function renderEmpty() {
    var container = sbList(); if (!container) return;
    clearRows();
    var box = document.createElement('div');
    box.className = 'sb-empty';
    box.style.cssText = 'padding:16px 14px;font-size:12px;color:var(--ink-muted);';
    box.innerHTML = 'Couldn’t load the surah list. ' +
      '<button type="button" class="sb-retry" style="margin-top:8px;display:block;' +
      'font:inherit;font-size:12px;color:var(--teal-700);background:transparent;' +
      'border:.5px solid var(--teal-200);border-radius:8px;padding:6px 12px;cursor:pointer;">Retry</button>';
    box.querySelector('.sb-retry').addEventListener('click', initSidebar);
    var before = insertPoint();
    if (before) container.insertBefore(box, before); else container.appendChild(box);
  }

  // ---- visibility (search + filter) -----------------------------------------
  function applyVisibility() {
    var rows = sbList() ? sbList().querySelectorAll('.surah-row:not(.sb-skeleton)') : [];
    var shown = 0;
    Array.prototype.forEach.call(rows, function (row) {
      var id = Number(row.dataset.id);
      var ch = chapters.filter(function (c) { return c.id === id; })[0];
      if (!ch) { row.style.display = ''; return; }
      var vis = core.matchesSearch(ch, currentQuery) && core.matchesFilter(ch, currentFilter);
      row.style.display = vis ? '' : 'none';
      if (vis) shown++;
    });
    toggleNoMatch(shown === 0 && chapters.length > 0);
  }
  function toggleNoMatch(on) {
    var container = sbList(); if (!container) return;
    var existing = container.querySelector('.sb-nomatch');
    if (on && !existing) {
      var n = document.createElement('div');
      n.className = 'sb-nomatch';
      n.style.cssText = 'padding:12px 14px;font-size:12px;color:var(--ink-subtle);';
      n.textContent = 'No surahs match.';
      var before = insertPoint();
      if (before) container.insertBefore(n, before); else container.appendChild(n);
    } else if (!on && existing) {
      existing.parentNode.removeChild(existing);
    }
  }

  // ---- init -----------------------------------------------------------------
  function useData(list) { chapters = list; renderRows(list); applyUrlSurah(); }

  function initSidebar() {
    if (!core || !sbList()) return;
    var cached = readCache();
    if (cached && core.isFresh(cached.fetchedAt, Date.now())) {
      var norm = cached.data.map(core.normalizeChapter).filter(Boolean);
      useData(norm);
      fetchChapters().then(function (fresh) { writeCache(fresh); chapters = fresh; renderRows(fresh); })
        .catch(function () { /* keep cached */ });
      return;
    }
    renderSkeleton();
    fetchChapters()
      .then(function (fresh) { writeCache(fresh); useData(fresh); })
      .catch(function (e) {
        console.warn('[quran] chapters API failed, using seed:', e && e.message);
        return fetchSeed().then(useData);
      })
      .catch(function (e) {
        console.warn('[quran] seed failed:', e && e.message);
        renderEmpty();
      });
  }

  // placeholder hooks — defined fully in Task 6
  window.selectSurah = window.selectSurah || function () {};
  function applyUrlSurah() {}   // replaced in Task 6

  // expose for Task 6 to extend + for tests/manual
  window.II = window.II || {};
  window.II.quranSidebar = {
    init: initSidebar,
    getChapters: function () { return chapters; },
    setQuery: function (q) { currentQuery = q; applyVisibility(); },
    setFilter: function (f) { currentFilter = f; applyVisibility(); },
    _applyVisibility: applyVisibility
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSidebar);
  } else { initSidebar(); }
})();
```

- [ ] **Step 2: Syntax-check the controller**

Run: `node --check src/js/quran-sidebar.js`
Expected: no output (exit 0 = valid syntax)

- [ ] **Step 3: Commit**

```bash
git add src/js/quran-sidebar.js
git commit -m "feat(quran): sidebar controller — fetch/cache/seed/render + loading/empty states"
```

---

## Task 5: Wire into the locked `quran.html`

**Files:**
- Modify: `quran.html`

- [ ] **Step 1: Remove the 12 demo `.surah-row` nodes**

In `quran.html`, inside `<div class="sb-list" id="sbList">`, delete the 12 `<div class="surah-row" ...>…</div>` blocks (surah 1 through surah 12), **up to but NOT including** `<div class="sb-divider"></div>`. Replace them with a single skeleton placeholder that shows before JS runs:

```html
<div class="sb-list" id="sbList">
  <div class="surah-row sb-skeleton" aria-hidden="true" style="opacity:.5;"><div class="surah-num"></div><div class="surah-info"><div class="surah-en">&nbsp;</div><div class="surah-meta-row"><span class="surah-chip">&nbsp;</span></div></div><div class="surah-ar"></div></div>
  <div class="sb-divider"></div>
```

Keep everything from `<div class="sb-divider"></div>` onward (Browse-by-Topic label + `.topic-item`s) **byte-identical**.

- [ ] **Step 2: Add the two script includes**

At the bottom of `quran.html`, change the existing script block so core + controller load before `quran.js`:

Find:
```html
<script src="src/js/i18n.js"></script>
<script src="src/js/global.js"></script>
<script src="src/js/api.js"></script>
<script src="src/js/quran.js"></script>
```
Replace with:
```html
<script src="src/js/i18n.js"></script>
<script src="src/js/global.js"></script>
<script src="src/js/api.js"></script>
<script src="src/js/quran-sidebar-core.js"></script>
<script src="src/js/quran-sidebar.js"></script>
<script src="src/js/quran.js"></script>
```

- [ ] **Step 3: Verify no other markup/class/id changed**

Run:
```bash
git diff --stat quran.html
git diff quran.html | grep -E '^[+-]' | grep -vE 'surah-row|sb-skeleton|sb-divider|quran-sidebar' | grep -E '^[+-][^+-]' || echo "no unexpected changes"
```
Expected: only the row removal, skeleton line, and 2 script includes appear; final line prints `no unexpected changes`.

- [ ] **Step 4: Commit**

```bash
git add quran.html
git commit -m "feat(quran): wire sidebar scripts; replace demo rows with live-rendered list"
```

---

## Task 6: Override globals — search, filter, selection, URL

**Files:**
- Modify: `src/js/quran-sidebar.js` (replace the placeholder hooks from Task 4 Step 1)

- [ ] **Step 1: Replace the placeholder hooks with production `filterSurahs`, `filterReveal`, `selectSurah`, `applyUrlSurah`, `loadSurah`**

In `src/js/quran-sidebar.js`, delete these two placeholder lines:
```js
  window.selectSurah = window.selectSurah || function () {};
  function applyUrlSurah() {}   // replaced in Task 6
```
and replace with:

```js
  // ---- global overrides (reassign the locked page's inline demo fns) --------
  window.filterSurahs = function (value) {
    currentQuery = value || '';
    applyVisibility();
  };

  window.filterReveal = function (type, btn) {
    currentFilter = type || 'all';
    Array.prototype.forEach.call(document.querySelectorAll('.sb-filter'),
      function (b) { b.classList.remove('on'); });
    if (btn) btn.classList.add('on');
    applyVisibility();
  };

  // Minimal Module-1 hook; Module 2 replaces the body with real verse fetch.
  window.loadSurah = window.loadSurah || function (id) {
    /* Module 2: fetch + render verses for `id` here. */
  };

  window.selectSurah = function (row, name, ar, meta, type, letter) {
    if (!row) return;
    name   = name   || row.dataset.name;
    ar     = ar     || row.dataset.ar;
    meta   = meta   || row.dataset.meta;
    type   = type   || (row.dataset.type === 'makki' ? 'Makki' : 'Madani');
    letter = letter || row.dataset.letter || '';
    var id   = Number(row.dataset.id) || null;
    var slug = row.dataset.slug || (name ? core.slugify(name) : '');

    Array.prototype.forEach.call(document.querySelectorAll('.surah-row'),
      function (r) { r.classList.remove('active'); });
    row.classList.add('active');

    var set = function (sel, txt) { var el = $(sel); if (el) el.textContent = txt; };
    set('#bcTitle', name + ' · ' + ar);
    set('#bcType', type);
    set('#bcMeta', meta + ' · Juz 1');
    set('#apSurah', name + ' · ' + ar);
    set('#apArt', letter);
    var mName = $('.mushaf-surah-name'); if (mName) mName.textContent = 'سورة ' + ar;
    var mPage = $('.mushaf-page-num'); if (mPage) mPage.textContent = 'Page 1 · Juz 1 · ' + name;

    if (typeof window.masterStop === 'function') window.masterStop();

    if (slug) {
      try { history.pushState({ surah: id, slug: slug }, '', '?surah=' + slug); } catch (e) {}
    }
    if (typeof window.showToast === 'function') window.showToast('Loading ' + name + '…');
    window.loadSurah(id);
  };

  function selectSurahBySlug(slug) {
    if (!slug) return false;
    var row = document.querySelector('.surah-row[data-slug="' + slug + '"]');
    if (row) { window.selectSurah(row); return true; }
    return false;
  }

  function applyUrlSurah() {
    var params = new URLSearchParams(window.location.search);
    var slug = params.get('surah');
    if (slug && selectSurahBySlug(slug)) return;
    // default: Al-Fatihah (id 1) — set active only, no URL push, no toast spam
    var first = document.querySelector('.surah-row[data-id="1"]');
    if (first) first.classList.add('active');
  }

  window.addEventListener('popstate', function () {
    var params = new URLSearchParams(window.location.search);
    var slug = params.get('surah');
    if (slug) selectSurahBySlug(slug);
  });
```

- [ ] **Step 2: Syntax-check**

Run: `node --check src/js/quran-sidebar.js`
Expected: no output (exit 0)

- [ ] **Step 3: Re-run core unit tests (unchanged, must still pass)**

Run: `node --test tests/quran/`
Expected: PASS — 7 tests, 0 failures

- [ ] **Step 4: Commit**

```bash
git add src/js/quran-sidebar.js
git commit -m "feat(quran): wire search/filter/select + ?surah=slug deep-link and popstate"
```

---

## Task 7: Browser verification + DoD gate

**Files:** none (verification only)

- [ ] **Step 1: Serve and load the page**

Run: `npx --yes serve -l 5000 .` (or `python -m http.server 5000`), open `http://localhost:5000/quran.html`.

- [ ] **Step 2: Functional smoke test (record pass/fail for each)**

- [ ] 114 rows render in `#sbList`; row 1 = Al-Fatihah (Makki, 7 ayahs), row 9 = At-Tawbah (Madani), row 114 = An-Nas.
- [ ] Divider + "Browse by Topic" + topic items still present below the list.
- [ ] Search "baq" → only Al-Baqarah; "2" → surahs starting with 2; Arabic "الفاتحة" → Al-Fatihah; clear → all 114.
- [ ] Makki filter → only Makki rows; Madani → only Madani; combine with search text; "All" resets.
- [ ] Click Al-Baqarah → row gets `.active`, breadcrumb shows "Al-Baqarah · البقرة", URL becomes `?surah=al-baqarah`.
- [ ] Reload `http://localhost:5000/quran.html?surah=al-baqarah` → Al-Baqarah is active on load.
- [ ] Browser Back/Forward updates the active surah (popstate).
- [ ] Keyboard: Tab to a row, press Enter → selects; visible focus ring present.
- [ ] Toggle dark theme (header button) → rows styled correctly in both themes.
- [ ] DevTools Console: zero errors/warnings (except the intentional seed `console.warn` only when API is blocked).

- [ ] **Step 3: Fallback test**

In DevTools → Network, block `api.quran.com`, reload. Expected: list still renders 114 rows from `src/data/chapters.json`; one `console.warn` "chapters API failed, using seed"; no user-facing error. Then also block `src/data/chapters.json` and reload → "Couldn't load the surah list." + working Retry button.

- [ ] **Step 4: Self-review the diff against the DoD**

Run: `git diff main --stat` and re-read `doc/DEFINITION-OF-DONE.md` §1 (Universal), §2 (Design), §4 (Data). Confirm: matches PRD US-Q01; only requested changes; both themes; no console errors; degrades to seed; no banned hrefs; `ii-quran-chapters` in DATA.md; `localStorage` in try/catch; rows keyboard-operable.

- [ ] **Step 5: Report Module 1 complete**

Produce a pass/fail line per DoD criterion (§8 of the spec). Only claim "done" if every checked item passed and Step 2/3 are green.

---

## Self-Review (author checklist — completed)

- **Spec coverage:** T1 seed+cache → Tasks 1,4; T2 search → Task 6 (`filterSurahs`) + Task 2 (`matchesSearch`); T3 filter → Task 6 (`filterReveal`) + Task 2 (`matchesFilter`); T4 select+URL → Task 6; states → Task 4; DATA.md/ADR → Task 3; testing → Task 2; DoD → Task 7. Deferred T5/T6 correctly untouched.
- **Placeholder scan:** none — all code steps contain complete code; the only intentional stub is `loadSurah` (documented Module-2 boundary).
- **Type/name consistency:** core exports (`slugify`, `revelationToType`, `typeToChipClass`, `typeToLabel`, `normalizeChapter`, `matchesSearch`, `matchesFilter`, `isFresh`) match usage in Tasks 4 & 6; cache key `ii-quran-chapters` and shape `{fetchedAt,data}` consistent across Tasks 3,4; `selectSurah` signature matches the locked `.next-surah-btn` inline caller.
```
