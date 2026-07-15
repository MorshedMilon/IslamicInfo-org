# Module 2 — Study Mode: Live Ayah Rendering — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** When a surah is selected, fetch its verses live from Quran.com and render real `.ayah-card`s (Arabic, word-by-word base, sanitized translation, attribution) into `#versesCardList`, replacing the demo cards — with batched rendering for long surahs and real copy-with-attribution.

**Architecture:** Static site + vanilla JS. Pure DOM-free logic in a UMD, unit-tested `quran-verses-core.js`; DOM controller `quran-verses.js` fills `window.loadSurah`, fetches+paginates+caches verses (client-direct to `api.quran.com`, keyless), and renders cards in batches. Deferred features (Tajweed, POS, audio, bookmark/note/share/AI, Mushaf) are out of scope; their buttons keep existing handlers.

**Tech Stack:** ES5-safe browser JS, Node `node:test`, Quran.com API v4, `localStorage`.

**Spec:** `doc/superpowers/specs/2026-07-14-quran-module2-study-mode-design.md`

---

## File Structure

| File | Responsibility |
|---|---|
| `src/data/verses-1.json` (NEW) | Raw Quran.com `verses` for Surah 1 (edition 20) — offline seed |
| `src/js/quran-verses-core.js` (NEW) | Pure: `sanitizeTranslation`, `wbwWords`, `pickTranslation`, `normalizeVerse`, `showBismillah`, `versesCacheKey`, `isFresh`, `attributionText`, `editionName`. UMD, no DOM. |
| `src/js/quran-verses.js` (NEW) | Controller: `window.loadSurah`, fetch/paginate/cache/seed, batched render, `setActiveVerse`, `copyVerse` |
| `tests/quran/verses-core.test.js` (NEW) | `node:test` for the pure core |
| `quran.html` (MODIFY) | Remove 7 demo cards + demo next-btn (keep `.bismillah-banner`); add skeleton + 2 `<script>` includes |
| `src/js/quran-sidebar.js` (MODIFY) | 1 line — default `applyUrlSurah` triggers `loadSurah(1)` |
| `DATA.md` (MODIFY) | Register `ii-verses-{surah}-{edition}` + `Verse` shape |

**Interfaces (keep names identical across tasks):**
- Core exports (browser `window.II.versesCore`, Node `module.exports`): `sanitizeTranslation(s)→string`, `wbwWords(apiWords)→{ar,en}[]`, `pickTranslation(translations,editionId)→string`, `normalizeVerse(apiVerse,editionId)→Verse`, `showBismillah(surahId)→bool`, `versesCacheKey(surahId,editionId)→string`, `isFresh(fetchedAt,now,maxAge?)→bool`, `attributionText({verseKey,arabic,translation},surahName,editionName,url)→string`, `editionName(id)→string`.
- `Verse = { verse_key, verse_number, text_uthmani, translation, words:{ar,en}[] }`.
- Cache: `localStorage['ii-verses-{surahId}-{editionId}'] = { fetchedAt:number, verses:Verse[] }`.

---

## Task 1: Generate the Surah-1 seed

**Files:** Create `src/data/verses-1.json`

- [ ] **Step 1: Fetch + save raw Surah-1 verses (real API, never fabricated)**

Run:
```bash
node -e '
const https=require("https");
const base="https://api.quran.com/api/v4/verses/by_chapter/1?language=en&words=true&word_fields=text_uthmani,translation&fields=text_uthmani&translations=20&per_page=50";
https.get(base,r=>{let b="";r.on("data",d=>b+=d);r.on("end",()=>{
  const j=JSON.parse(b);
  require("fs").writeFileSync("src/data/verses-1.json",JSON.stringify(j.verses,null,2));
  console.log("wrote",j.verses.length,"verses");
});}).on("error",e=>{console.error(e.message);process.exit(1);});'
```
Expected: `wrote 7 verses`. If the network is unavailable, report BLOCKED — do NOT hand-write verse content.

- [ ] **Step 2: Verify**
```bash
node -e '
const v=require("./src/data/verses-1.json");const a=require("assert");
a.equal(v.length,7);
a.equal(v[0].verse_key,"1:1"); a.ok(v[0].text_uthmani.length>0);
a.ok(Array.isArray(v[0].words)&&v[0].words.length>0);
a.ok(v[0].translations&&v[0].translations[0].text);
console.log("seed OK");'
```
Expected: `seed OK`

- [ ] **Step 3: Commit**
```bash
git add src/data/verses-1.json
git commit -m "feat(quran): add Surah 1 verse seed (raw Quran.com response)"
```

---

## Task 2: Pure core (TDD)

**Files:** Create `src/js/quran-verses-core.js`, `tests/quran/verses-core.test.js`

- [ ] **Step 1: Write failing tests** — create `tests/quran/verses-core.test.js`:

```js
'use strict';
const test = require('node:test');
const assert = require('node:assert');
const core = require('../../src/js/quran-verses-core.js');

test('sanitizeTranslation strips sup footnotes and tags', () => {
  assert.equal(
    core.sanitizeTranslation('In the name of Allah,<sup foot_note=195932>1</sup> the Merciful.'),
    'In the name of Allah, the Merciful.');
  assert.equal(core.sanitizeTranslation('Plain text'), 'Plain text');
  assert.equal(core.sanitizeTranslation('<i>x</i> y'), 'x y');
});

test('wbwWords keeps words, drops end markers, maps ar/en', () => {
  const out = core.wbwWords([
    { char_type_name: 'word', text_uthmani: 'بِسْمِ', translation: { text: 'In (the) name' } },
    { char_type_name: 'end',  text_uthmani: '١',      translation: { text: '(1)' } }
  ]);
  assert.deepEqual(out, [{ ar: 'بِسْمِ', en: 'In (the) name' }]);
});

test('pickTranslation selects by resource_id, falls back to first', () => {
  const t = [{ resource_id: 85, text: 'A' }, { resource_id: 20, text: 'B' }];
  assert.equal(core.pickTranslation(t, 20), 'B');
  assert.equal(core.pickTranslation(t, 999), 'A');
  assert.equal(core.pickTranslation([], 20), '');
});

test('normalizeVerse shape', () => {
  const v = core.normalizeVerse({
    verse_key: '1:2', verse_number: 2, text_uthmani: 'ٱلْحَمْدُ',
    translations: [{ resource_id: 20, text: 'All praise<sup foot_note=1>x</sup>' }],
    words: [{ char_type_name: 'word', text_uthmani: 'ٱلْحَمْدُ', translation: { text: 'All praises' } }]
  }, 20);
  assert.equal(v.verse_key, '1:2');
  assert.equal(v.text_uthmani, 'ٱلْحَمْدُ');
  assert.equal(v.translation, 'All praise');
  assert.deepEqual(v.words, [{ ar: 'ٱلْحَمْدُ', en: 'All praises' }]);
});

test('showBismillah true except Surah 9', () => {
  assert.equal(core.showBismillah(1), true);
  assert.equal(core.showBismillah(2), true);
  assert.equal(core.showBismillah(9), false);
});

test('versesCacheKey + isFresh', () => {
  assert.equal(core.versesCacheKey(2, 20), 'ii-verses-2-20');
  const now = 1e12;
  assert.equal(core.isFresh(now - 23 * 3600e3, now), true);
  assert.equal(core.isFresh(now - 25 * 3600e3, now), false);
});

test('attributionText format', () => {
  const s = core.attributionText(
    { verseKey: '1:2', arabic: 'ٱلْحَمْدُ', translation: 'All praise' },
    'Al-Fatihah', 'Saheeh International', 'https://x/quran?surah=al-fatihah');
  assert.equal(s,
    'All praise\nٱلْحَمْدُ\n\n— Al-Fatihah 1:2 · Saheeh International\nhttps://x/quran?surah=al-fatihah');
});

test('editionName maps 20, falls back', () => {
  assert.equal(core.editionName(20), 'Saheeh International');
  assert.equal(core.editionName(99999), 'Translation');
});
```

- [ ] **Step 2: Run — expect FAIL** (`Cannot find module`):
```bash
node --test tests/quran/verses-core.test.js
```

- [ ] **Step 3: Write `src/js/quran-verses-core.js`:**

```js
/* IslamicInfo.org — quran-verses-core.js
   Pure, DOM-free logic for Study Mode verse rendering. UMD: Node + browser. */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  else { root.II = root.II || {}; root.II.versesCore = api; }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var EDITIONS = { 20: 'Saheeh International', 85: 'Abdul Haleem', 95: 'Maududi' };
  function editionName(id) { return EDITIONS[id] || 'Translation'; }

  function sanitizeTranslation(html) {
    return String(html == null ? '' : html)
      .replace(/<sup[^>]*>[\s\S]*?<\/sup>/gi, '')  // drop footnote markers
      .replace(/<[^>]+>/g, '')                     // strip any remaining tags
      .replace(/\s+/g, ' ')                        // collapse whitespace
      .trim();
  }

  function wbwWords(apiWords) {
    return (apiWords || [])
      .filter(function (w) { return w && w.char_type_name === 'word'; })
      .map(function (w) {
        return { ar: w.text_uthmani || '', en: (w.translation && w.translation.text) || '' };
      });
  }

  function pickTranslation(translations, editionId) {
    var list = translations || [];
    var hit = null;
    for (var i = 0; i < list.length; i++) {
      if (list[i].resource_id === editionId) { hit = list[i]; break; }
    }
    if (!hit) hit = list[0];
    return hit ? sanitizeTranslation(hit.text) : '';
  }

  function normalizeVerse(apiVerse, editionId) {
    return {
      verse_key: apiVerse.verse_key,
      verse_number: apiVerse.verse_number,
      text_uthmani: apiVerse.text_uthmani || '',
      translation: pickTranslation(apiVerse.translations, editionId),
      words: wbwWords(apiVerse.words)
    };
  }

  function showBismillah(surahId) { return Number(surahId) !== 9; }

  function versesCacheKey(surahId, editionId) { return 'ii-verses-' + surahId + '-' + editionId; }

  function isFresh(fetchedAt, now, maxAgeMs) {
    if (typeof maxAgeMs !== 'number') maxAgeMs = 24 * 60 * 60 * 1000;
    return typeof fetchedAt === 'number' && (now - fetchedAt) < maxAgeMs;
  }

  function attributionText(v, surahName, editionNm, url) {
    return v.translation + '\n' + v.arabic + '\n\n— ' + surahName + ' ' + v.verseKey +
           ' · ' + editionNm + '\n' + url;
  }

  return { sanitizeTranslation, wbwWords, pickTranslation, normalizeVerse,
           showBismillah, versesCacheKey, isFresh, attributionText, editionName };
});
```

- [ ] **Step 4: Run — expect PASS** (8 tests):
```bash
node --test tests/quran/verses-core.test.js
```

- [ ] **Step 5: Commit**
```bash
git add src/js/quran-verses-core.js tests/quran/verses-core.test.js
git commit -m "feat(quran): tested pure core for verse rendering (normalize/sanitize/wbw/attribution)"
```

---

## Task 3: Register storage key + Verse shape

**Files:** Modify `doc/DATA.md`

- [ ] **Step 1: Add the key row** — in `doc/DATA.md` §1, after the `ii-quran-chapters` row:
```
| `ii-verses-{surah}-{edition}` | `{ fetchedAt:number, verses:Verse[] }` (JSON) | Quran Explorer | 1 day (24h revalidate) |
```

- [ ] **Step 2: Add the `Verse` shape** — in `doc/DATA.md` §2, after the `Chapter` line:
```
Verse          = { verse_key: string; verse_number: number; text_uthmani: string; translation: string; words: { ar: string; en: string }[] }
```

- [ ] **Step 3: Commit**
```bash
git add doc/DATA.md
git commit -m "docs(quran): register ii-verses key + Verse shape"
```

---

## Task 4: Verse controller

**Files:** Create `src/js/quran-verses.js`

- [ ] **Step 1: Write `src/js/quran-verses.js`:**

```js
/* IslamicInfo.org — quran-verses.js
   Study Mode controller (Module 2): window.loadSurah, fetch/paginate/cache/seed,
   batched card render, setActiveVerse, copyVerse.
   Depends on: window.II.versesCore (quran-verses-core.js). */
(function () {
  'use strict';

  var core = window.II && window.II.versesCore;
  var API = 'https://api.quran.com/api/v4/verses/by_chapter/';
  var SEED1 = 'src/data/verses-1.json';
  var BATCH = 20;

  var byKey = {};            // verse_key -> Verse (current surah)
  var ctxSurahId = 1, ctxSurahName = '', ctxSlug = 'al-fatihah', ctxEditionId = 20;
  var pending = null;        // remaining Verse[] to batch-render
  var io = null;             // IntersectionObserver for the sentinel

  function list() { return document.getElementById('versesCardList'); }
  function edition() {
    var v = 20; try { v = Number(localStorage.getItem('ii-quran-translation')) || 20; } catch (e) {}
    return v;
  }
  function surahMeta(id) {
    // name + slug from active row (Module 1) or chapters cache; fallbacks are safe
    var row = document.querySelector('.surah-row[data-id="' + id + '"]');
    if (row) return { name: row.dataset.name || ('Surah ' + id), slug: row.dataset.slug || String(id) };
    try {
      var c = JSON.parse(localStorage.getItem('ii-quran-chapters'));
      var ch = c && c.data && c.data.filter(function (x) { return x.id === Number(id); })[0];
      if (ch) return { name: ch.name_simple, slug: ch.slug };
    } catch (e) {}
    return { name: 'Surah ' + id, slug: String(id) };
  }

  // ---- cache ----------------------------------------------------------------
  function readCache(key) {
    try {
      var raw = localStorage.getItem(key); if (!raw) return null;
      var o = JSON.parse(raw); return (o && Array.isArray(o.verses)) ? o : null;
    } catch (e) { try { localStorage.removeItem(key); } catch (_) {} return null; }
  }
  function writeCache(key, verses) {
    try { localStorage.setItem(key, JSON.stringify({ fetchedAt: Date.now(), verses: verses })); }
    catch (e) { /* quota — skip */ }
  }

  // ---- fetch (paginated) ----------------------------------------------------
  function fetchPage(id, ed, page) {
    var url = API + id + '?language=en&words=true&word_fields=text_uthmani,translation' +
              '&fields=text_uthmani&translations=' + ed + '&per_page=50&page=' + page;
    var ctrl = new AbortController();
    var t = setTimeout(function () { ctrl.abort(); }, 8000);
    return fetch(url, { signal: ctrl.signal })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .finally(function () { clearTimeout(t); });
  }
  function fetchAllVerses(id, ed) {
    return fetchPage(id, ed, 1).then(function (first) {
      var total = (first.pagination && first.pagination.total_pages) || 1;
      var verses = (first.verses || []).slice();
      if (total <= 1) return verses.map(function (v) { return core.normalizeVerse(v, ed); });
      var rest = [];
      for (var p = 2; p <= total; p++) rest.push(fetchPage(id, ed, p));
      return Promise.all(rest).then(function (pages) {
        pages.forEach(function (pg) { verses = verses.concat(pg.verses || []); });
        return verses.map(function (v) { return core.normalizeVerse(v, ed); });
      });
    });
  }
  function fetchSeed1(ed) {
    return fetch(SEED1).then(function (r) { if (!r.ok) throw new Error('seed HTTP'); return r.json(); })
      .then(function (raw) { return raw.map(function (v) { return core.normalizeVerse(v, ed); }); });
  }

  // ---- DOM helpers ----------------------------------------------------------
  function clearDynamic() {
    var c = list(); if (!c) return;
    Array.prototype.slice.call(c.querySelectorAll(
      '.ayah-card, .next-surah-btn, .verses-skeleton, .verses-error, .verses-sentinel'))
      .forEach(function (n) { n.parentNode.removeChild(n); });
    if (io) { io.disconnect(); io = null; }
  }
  function banner() { return list() ? list().querySelector('.bismillah-banner') : null; }

  var SVG = {
    play: '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    book: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>',
    copy: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    share:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>',
    note: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    ai:   '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>',
    taf:  '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/></svg>',
    trace:'<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83"/></svg>'
  };
  function btn(cls, html) {
    var b = document.createElement('button'); b.type = 'button';
    b.className = cls; b.innerHTML = html; return b;
  }
  function el(tag, cls, txt) {
    var e = document.createElement(tag); if (cls) e.className = cls;
    if (txt != null) e.textContent = txt; return e;
  }

  function buildCard(v) {
    var k = v.verse_key.replace(':', '-');
    var card = el('div', 'ayah-card'); card.id = 'a-' + k; card.dataset.key = v.verse_key;
    card.addEventListener('click', function () { window.setActiveVerse(card); });

    var header = el('div', 'ayah-header');
    header.appendChild(el('div', 'ayah-num-badge', String(v.verse_number)));
    var actions = el('div', 'ayah-actions');
    var bPlay = btn('ayah-btn', SVG.play);   bPlay.addEventListener('click', function (e) { e.stopPropagation(); window.toggleAyahPlay(bPlay, e); });
    var bBook = btn('ayah-btn', SVG.book);   bBook.addEventListener('click', function (e) { e.stopPropagation(); window.toggleBookmark(bBook, e); });
    var bCopy = btn('ayah-btn', SVG.copy);   bCopy.addEventListener('click', function (e) { e.stopPropagation(); window.copyVerse(e, v.verse_key); });
    var bShare= btn('ayah-btn', SVG.share);  bShare.addEventListener('click', function (e) { e.stopPropagation(); window.openShareModal(v.text_uthmani, v.translation, ctxSurahName + ' ' + v.verse_key); });
    var bNote = btn('ayah-btn', SVG.note);   bNote.id = 'nbtn-' + k; bNote.addEventListener('click', function (e) { e.stopPropagation(); window.toggleNote('n-' + k); });
    var bAI   = btn('ayah-btn ai-btn', SVG.ai); bAI.addEventListener('click', function (e) { e.stopPropagation(); window.toggleAI('ai-' + k); });
    [bPlay, bBook, bCopy, bShare, bNote, bAI].forEach(function (x) { actions.appendChild(x); });
    header.appendChild(actions);
    card.appendChild(header);

    card.appendChild(el('div', 'ayah-arabic', v.text_uthmani)); // plain (Tajweed deferred)

    var wbw = el('div', 'wbw-row');
    v.words.forEach(function (w) {
      var word = el('div', 'wbw-word');
      word.appendChild(el('div', 'wbw-ar', w.ar));
      word.appendChild(el('div', 'wbw-en', w.en));   // no .wbw-pos (deferred)
      wbw.appendChild(word);
    });
    card.appendChild(wbw);

    card.appendChild(el('div', 'ayah-translation', '"' + v.translation + '"'));
    card.appendChild(el('div', 'ayah-trans-attr', core.editionName(ctxEditionId) + ' · ' + ctxSurahName + ' ' + v.verse_key));

    // Deferred empty containers (Modules 4-5 fill) — present so handlers don't throw
    var cmp = el('div', 'cmp-block'); cmp.id = 'cmp-' + k; card.appendChild(cmp);
    var ai = el('div', 'ai-card'); ai.id = 'ai-' + k; card.appendChild(ai);
    var note = el('div', 'note-editor'); note.id = 'n-' + k; card.appendChild(note);

    var footer = el('div', 'ayah-footer');
    footer.appendChild(el('span', 'ayah-ref', v.verse_key));
    var taf = btn('tafsir-btn', SVG.taf + 'Tafsir'); taf.addEventListener('click', function () { if (window.openTafsir) window.openTafsir(); });
    var tr = btn('trace-btn', SVG.trace + 'Trace View →'); tr.addEventListener('click', function () { if (window.openTrace) window.openTrace(ctxSurahName + ' ' + v.verse_key, v.text_uthmani, v.translation); });
    footer.appendChild(taf); footer.appendChild(tr);
    card.appendChild(footer);
    return card;
  }

  // ---- render (batched) -----------------------------------------------------
  function renderSkeleton() {
    var c = list(); if (!c) return; clearDynamic();
    var b = banner(); if (b) b.style.display = core.showBismillah(ctxSurahId) ? '' : 'none';
    for (var i = 0; i < 3; i++) {
      var s = el('div', 'ayah-card verses-skeleton'); s.setAttribute('aria-hidden', 'true');
      s.style.opacity = '0.5'; s.style.pointerEvents = 'none';
      s.innerHTML = '<div class="ayah-header"><div class="ayah-num-badge"></div></div>' +
        '<div class="ayah-arabic">&nbsp;</div><div class="ayah-translation">&nbsp;</div>';
      c.appendChild(s);
    }
  }
  function renderError(surahId) {
    var c = list(); if (!c) return; clearDynamic();
    var box = el('div', 'verses-error');
    box.style.cssText = 'padding:28px clamp(18px,3vw,32px);color:var(--ink-muted);font-size:14px;';
    box.appendChild(document.createTextNode('Verses temporarily unavailable — please try again. '));
    var retry = btn('', 'Retry');
    retry.style.cssText = 'margin-left:8px;font:inherit;font-size:13px;color:var(--teal-700);background:transparent;border:.5px solid var(--teal-200);border-radius:10px;padding:6px 14px;cursor:pointer;';
    retry.addEventListener('click', function () { window.loadSurah(surahId); });
    box.appendChild(retry); c.appendChild(box);
  }
  function appendBatch() {
    var c = list(); if (!c || !pending) return;
    var frag = document.createDocumentFragment();
    var slice = pending.splice(0, BATCH);
    slice.forEach(function (v) { frag.appendChild(buildCard(v)); });
    var sentinel = c.querySelector('.verses-sentinel');
    if (sentinel) c.insertBefore(frag, sentinel); else c.appendChild(frag);
    if (pending.length === 0) {
      if (sentinel) sentinel.parentNode.removeChild(sentinel);
      if (io) { io.disconnect(); io = null; }
      appendNextSurahBtn();
    }
  }
  function appendNextSurahBtn() {
    var c = list(); if (!c) return;
    if (ctxSurahId >= 114) return;
    var next = surahMeta(ctxSurahId + 1);
    var b = el('div', 'next-surah-btn');
    var left = el('div');
    left.appendChild(el('div', 'nsb-label', 'Next Surah'));
    left.appendChild(el('div', 'nsb-name', next.name));
    b.appendChild(left);
    b.innerHTML += '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--teal-600)" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>';
    b.addEventListener('click', function () { window.loadSurah(ctxSurahId + 1); });
    c.appendChild(b);
  }
  function renderSurah(verses, surahId) {
    var c = list(); if (!c) return;
    ctxSurahId = Number(surahId);
    var meta = surahMeta(ctxSurahId); ctxSurahName = meta.name; ctxSlug = meta.slug;
    ctxEditionId = edition();
    byKey = {}; verses.forEach(function (v) { byKey[v.verse_key] = v; });
    clearDynamic();
    var b = banner(); if (b) b.style.display = core.showBismillah(ctxSurahId) ? '' : 'none';
    pending = verses.slice();
    appendBatch();                                  // first batch
    if (pending.length > 0) {                       // more remain → add sentinel + observer
      var sentinel = el('div', 'verses-sentinel'); sentinel.setAttribute('aria-hidden', 'true');
      sentinel.style.height = '1px';
      c.appendChild(sentinel);
      if (window.IntersectionObserver) {
        io = new IntersectionObserver(function (entries) {
          if (entries[0].isIntersecting) appendBatch();
        }, { root: null, rootMargin: '400px' });
        io.observe(sentinel);
      } else {
        while (pending.length > 0) appendBatch();   // no IO → render all
      }
    }
  }

  // ---- public: loadSurah ----------------------------------------------------
  window.loadSurah = function (surahId) {
    if (!core || !list()) return;
    surahId = Number(surahId) || 1;
    ctxSurahId = surahId; ctxEditionId = edition();
    var key = core.versesCacheKey(surahId, ctxEditionId);
    renderSkeleton();
    var cached = readCache(key);
    if (cached && core.isFresh(cached.fetchedAt, Date.now())) {
      renderSurah(cached.verses, surahId);
      fetchAllVerses(surahId, ctxEditionId)
        .then(function (v) { writeCache(key, v); renderSurah(v, surahId); })
        .catch(function () { /* keep cached */ });
      return;
    }
    fetchAllVerses(surahId, ctxEditionId)
      .then(function (v) { writeCache(key, v); renderSurah(v, surahId); })
      .catch(function (e) {
        console.warn('[quran] verses API failed for surah ' + surahId + ':', e && e.message);
        if (surahId === 1) { return fetchSeed1(ctxEditionId).then(function (v) { renderSurah(v, 1); }); }
        renderError(surahId);
      })
      .catch(function (e) { console.warn('[quran] seed failed:', e && e.message); renderError(surahId); });
  };

  // ---- public: setActiveVerse (override; keeps behavior, works on dynamic cards) ----
  window.setActiveVerse = function (card) {
    Array.prototype.forEach.call(document.querySelectorAll('.ayah-card.active-verse'),
      function (c) { c.classList.remove('active-verse'); });
    if (card) card.classList.add('active-verse');
  };

  // ---- public: copyVerse (real clipboard + attribution) ----
  window.copyVerse = function (evt, verseKey) {
    if (evt && evt.stopPropagation) evt.stopPropagation();
    var v = byKey[verseKey]; if (!v) return;
    var url = window.location.origin + window.location.pathname + '?surah=' + ctxSlug;
    var payload = core.attributionText(
      { verseKey: v.verse_key, arabic: v.text_uthmani, translation: v.translation },
      ctxSurahName, core.editionName(ctxEditionId), url);
    var done = function () { if (window.showToast) window.showToast('Copied with attribution'); };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(payload).then(done, done);
      } else {
        var ta = document.createElement('textarea'); ta.value = payload;
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta); done();
      }
    } catch (e) { done(); }
  };

  window.II = window.II || {};
  window.II.quranVerses = { loadSurah: window.loadSurah, _byKey: function () { return byKey; } };
})();
```

- [ ] **Step 2: Syntax-check**
```bash
node --check src/js/quran-verses.js
```
Expected: exit 0.

- [ ] **Step 3: Commit**
```bash
git add src/js/quran-verses.js
git commit -m "feat(quran): verse controller — fetch/paginate/cache/seed, batched render, copyVerse"
```

---

## Task 5: Wire `quran.html` + Module-1 initial-load fix

**Files:** Modify `quran.html`, `src/js/quran-sidebar.js`

- [ ] **Step 1: Remove the 7 demo ayah-cards + demo next-surah-btn**

In `quran.html`, inside `<div id="versesCardList">`: keep the `<div class="bismillah-banner">…</div>` block, then DELETE everything from `<!-- AYAH 1 -->` / the first `<div class="ayah-card active-verse" id="a1"…>` through the demo `<div class="next-surah-btn" …>…</div>` (the block ending just before `</div><!-- end versesCardList -->`). Replace all of it with one skeleton placeholder:

```html
      <div class="ayah-card verses-skeleton" aria-hidden="true" style="opacity:.5;pointer-events:none;"><div class="ayah-header"><div class="ayah-num-badge"></div></div><div class="ayah-arabic">&nbsp;</div><div class="ayah-translation">&nbsp;</div></div>
```

Result:
```html
      <div id="versesCardList">
      <div class="bismillah-banner"> … keep exactly … </div>
      <div class="ayah-card verses-skeleton" …>…</div>
      </div><!-- end versesCardList -->
```
Do NOT touch `#mushafPageView` (the Mushaf block after it) or anything else.

- [ ] **Step 2: Add the two script includes**

Change the tail script block (from Module 1) — insert verses scripts after the sidebar scripts, before the `quran.js` comment:
```html
<script src="src/js/quran-sidebar-core.js"></script>
<script src="src/js/quran-sidebar.js"></script>
<script src="src/js/quran-verses-core.js"></script>
<script src="src/js/quran-verses.js"></script>
<!-- src/js/quran.js deferred to Module 3 (audio/reciter): … (existing comment) … -->
```
(Update the existing deferral comment's "Module 2" reference to "Module 3" if present; leave the rest.)

- [ ] **Step 3: Module-1 initial-load fix** — in `src/js/quran-sidebar.js`, `applyUrlSurah()` default branch:

FIND:
```
    var first = document.querySelector('.surah-row[data-id="1"]');
    if (first) { activeId = 1; first.classList.add('active'); }
```
REPLACE:
```
    var first = document.querySelector('.surah-row[data-id="1"]');
    if (first) { activeId = 1; first.classList.add('active'); }
    if (typeof window.loadSurah === 'function') window.loadSurah(1); // Module 2: render default surah
```

- [ ] **Step 4: Verify the quran.html diff is only the intended changes**
```bash
git diff quran.html | grep -E '^[+-]' | grep -vE 'ayah-card|verses-skeleton|next-surah|ayah-|bismillah|wbw-|cmp-block|ai-card|note-editor|tj-|quran-verses|AYAH|surah-ar|surah-num|Al-|bsm-|In the name|praise|Merciful|Sovereign|worship|Guide|straight|path|Recompense|QuranlyAI|Sahih|Pickthall|Yusuf|Ibn Kathir|al-Tabari|al-Qurtubi|1:|note|reflection|Trace|Tafsir|cmp|ai1|n1|nbtn|active-verse|ndot|pos-|NOUN|VERB|ADJ|PRONOUN|PREP|hl' | grep -E '^[+-][^+-]' || echo "diff limited to versesCardList + script includes"
git diff --stat quran.html src/js/quran-sidebar.js
```
Manually confirm `#versesCardList` inner cards were removed, skeleton + 2 scripts added, and the one sidebar line added. Nothing else.

- [ ] **Step 5: Re-run Module-1 + Module-2 unit tests (must still pass)**
```bash
node --test tests/quran/sidebar-core.test.js
node --test tests/quran/verses-core.test.js
```

- [ ] **Step 6: Commit**
```bash
git add quran.html src/js/quran-sidebar.js
git commit -m "feat(quran): wire verse engine into quran.html; render default surah on load"
```

---

## Task 6: Headless verification + DoD gate

**Files:** none (verification). Harness lives in the scratchpad (jsdom), not the repo.

- [ ] **Step 1: Build a jsdom harness** (in the scratchpad dir; `npm i jsdom` already available from Module 1) that:
  - loads `quran.html` with `runScripts:'outside-only'`, injects `quran-sidebar-core.js`, `quran-sidebar.js`, `quran-verses-core.js`, `quran-verses.js` via `vm.runInContext`, sets `win.AbortController`, `win.fetch` (mock), `win.IntersectionObserver` (a stub that immediately fires when `.observe` is called so batching can be driven).
  - **Scenario A (Surah 1 via API):** `fetch` returns a 1-page response built from `src/data/verses-1.json`. Assert: 7 `.ayah-card` render in `#versesCardList`; `.bismillah-banner` visible; card 1 `.ayah-arabic` non-empty; `.wbw-row` has words with `.wbw-ar`+`.wbw-en` and NO `.wbw-pos`; `.ayah-translation` has no `<sup>`/tags; `.ayah-trans-attr` contains "Saheeh International · Al-Fatihah 1:1"; cache `ii-verses-1-20` written.
  - **Scenario B (paginated):** mock a 2-page surah (e.g. 55 verses across per_page=50); with the IO stub firing, assert all 55 cards eventually render, then a `.next-surah-btn` appears and `.verses-sentinel` is gone.
  - **Scenario C (Surah 9 no bismillah):** loadSurah(9) with a mocked response → `.bismillah-banner` `display:none`.
  - **Scenario D (copyVerse):** stub `navigator.clipboard.writeText` to capture; call `win.copyVerse({stopPropagation(){}}, '1:2')`; assert captured payload equals `translation\narabic\n\n— Al-Fatihah 1:2 · Saheeh International\n<url>`.
  - **Scenario E (seed fallback):** `fetch(API…)` rejects, `fetch(SEED1)` resolves with `verses-1.json` → 7 cards render; one `console.warn`; assert **no `console.error`/uncaught** in any scenario.

- [ ] **Step 2: Run the harness** — expect all assertions pass, 0 console errors.

- [ ] **Step 3: Serve + eyeball (optional but recommended)** — `npx --yes serve -l 5000 .`, open `/quran.html`: Al-Fatihah renders on load; click Al-Baqarah in the sidebar → 286 ayahs render in batches on scroll; copy a verse → clipboard has attribution; dark theme OK; Console clean.

- [ ] **Step 4: DoD gate report** — produce pass/fail per criterion (spec §10). Flag the 🕌 Content human-review sign-off as **pending reviewer** (name/date/sources), not "done".

---

## Self-Review (author checklist — completed)

- **Spec coverage:** T1 render → Tasks 1,2,4; T2 WBW base → Task 2 (`wbwWords`) + Task 4 (`buildCard`, no `.wbw-pos`); T4 setActiveVerse+copyVerse → Task 4; T5 batched render → Task 4 (`appendBatch`/sentinel/IO); bismillah/next-btn → Task 4; states → Task 4 (`renderSkeleton`/`renderError`/seed); DATA.md → Task 3; initial-load fix → Task 5; tests → Task 2 + Task 6. Deferred (Tajweed, POS, audio, bookmark/note/share/AI, Mushaf) correctly absent — buttons keep existing handlers, empty containers prevent throws.
- **Placeholder scan:** none — full code in every step; deferred containers are intentional and documented.
- **Type/name consistency:** core exports (`sanitizeTranslation`/`wbwWords`/`pickTranslation`/`normalizeVerse`/`showBismillah`/`versesCacheKey`/`isFresh`/`attributionText`/`editionName`) match usage in Task 4; `Verse` shape + cache `{fetchedAt,verses}` consistent across Tasks 2,3,4; `window.loadSurah` defined in Task 4, called by Task 5's sidebar fix.
```
