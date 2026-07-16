# Authentic Madina Mushaf + Tajweed — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render the exact QCF v2 604-page Madina Mushaf for any surah, add authentic Tajweed color-coding in both the Mushaf view (QCF Tajweed V4 colored font) and the flowing Study view (`text_uthmani_tajweed`).

**Architecture:** New pure core (`quran-mushaf-core.js`: fetch/normalize page model, line grouping, header derivation, font URL helper) + DOM module (`quran-mushaf.js`: page-sheet render, mode switch, nav) + tajweed module (`quran-tajweed.js`: flow-view coloring + Mushaf font swap). `quran-verses.js` gains a tajweed layer. `quran.html` gets page-sheet CSS and script includes; hardcoded Al-Fatihah Mushaf markup is removed.

**Tech Stack:** Vanilla ES5-style JS (UMD cores, `window.II` namespace), `node:test` for unit tests, quran.com API v4 (`api.quran.com`), QCF fonts from `verses.quran.foundation` via `FontFace`.

**Spec:** `doc/superpowers/specs/2026-07-15-quran-mushaf-tajweed-design.md`

**Conventions to follow (verified):**
- Core UMD wrapper (copy exactly from `quran-verses-core.js:3-7`):
  ```js
  (function (root, factory) {
    var api = factory();
    if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
    else { root.II = root.II || {}; root.II.mushafCore = api; }
  })(typeof self !== 'undefined' ? self : this, function () {
    'use strict';
    /* ... */
    return { /* exports */ };
  });
  ```
- Tests: `tests/quran/<name>-core.test.js`, run `node --test tests/quran/`.
- Network: `AbortController` + 8s timeout (match `quran-verses.js:57-65`).

---

## Task 0: Browser spike — verify V2 (same code_v2 renders in v2 AND v4 fonts)

**Files:** Create (throwaway): scratchpad `mushaf-spike.html`

- [ ] **Step 1: Build a minimal spike page**

Create an HTML file that, for page 1, fetches `https://api.quran.com/api/v4/verses/by_page/1?words=true&word_fields=code_v2,line_number` and renders the glyph runs twice — once in `@font-face` family loaded from `.../hafs/v2/woff2/p1.woff2`, once from `.../hafs/v4/colrv1/woff2/p1.woff2`. Inject glyphs via `el.innerHTML = word.code_v2`.

```html
<!doctype html><meta charset="utf-8">
<style>
  @font-face{font-family:'p1-v2';src:url('https://verses.quran.foundation/fonts/quran/hafs/v2/woff2/p1.woff2') format('woff2');}
  @font-face{font-family:'p1-v4';src:url('https://verses.quran.foundation/fonts/quran/hafs/v4/colrv1/woff2/p1.woff2') format('woff2');}
  .line{direction:rtl;text-align:justify;text-align-last:justify;font-size:34px;line-height:2.2;margin:10px;border:1px solid #ccc;}
  #v2 .line{font-family:'p1-v2';} #v4 .line{font-family:'p1-v4';}
</style>
<h3>v2 (plain)</h3><div id="v2"></div>
<h3>v4 (tajweed color)</h3><div id="v4"></div>
<script>
fetch('https://api.quran.com/api/v4/verses/by_page/1?words=true&word_fields=code_v2,line_number')
 .then(r=>r.json()).then(d=>{
  const lines={}; (d.verses||[]).forEach(v=>(v.words||[]).forEach(w=>{(lines[w.line_number]=lines[w.line_number]||[]).push(w.code_v2);}));
  for(const box of ['v2','v4']){ const host=document.getElementById(box);
    Object.keys(lines).sort((a,b)=>a-b).forEach(ln=>{const d=document.createElement('div');d.className='line';d.innerHTML=lines[ln].join('');host.appendChild(d);});
  }
});
</script>
```

- [ ] **Step 2: Open it and confirm**

Open in a browser. Expected: BOTH boxes show identical Madina glyph layout; the v4 box shows the same text in tajweed colors. If v4 glyphs render as tofu/wrong, STOP — the v4 font uses different codes and the spec's font-swap assumption needs revisiting (fallback: keep v2 in Mushaf, apply tajweed only in Study view).

- [ ] **Step 3: Record result** in the plan/PR notes, delete the spike file. No commit (throwaway).

---

## Task 1: `quran-mushaf-core.js` — pure page model

**Files:**
- Create: `src/js/quran-mushaf-core.js`
- Test: `tests/quran/mushaf-core.test.js`

- [ ] **Step 1: Write failing tests**

```js
'use strict';
const test = require('node:test');
const assert = require('node:assert');
const core = require('../../src/js/quran-mushaf-core.js');

const chapters = { data: [
  { id: 1, pages: [1, 1], bismillah_pre: false },
  { id: 2, pages: [2, 49], bismillah_pre: true }
]};

test('pageOfSurah returns first page from chapters', () => {
  assert.equal(core.pageOfSurah(1, chapters), 1);
  assert.equal(core.pageOfSurah(2, chapters), 2);
  assert.equal(core.pageOfSurah(999, chapters), 1); // fallback
});

test('fontUrl builds correct CDN paths', () => {
  assert.equal(core.fontUrl(1, 'v2'),
    'https://verses.quran.foundation/fonts/quran/hafs/v2/woff2/p1.woff2');
  assert.equal(core.fontUrl(42, 'v4', 'light', false),
    'https://verses.quran.foundation/fonts/quran/hafs/v4/colrv1/woff2/p42.woff2');
  assert.equal(core.fontUrl(42, 'v4', 'dark', true),
    'https://verses.quran.foundation/fonts/quran/hafs/v4/ot-svg/dark/woff2/p42.woff2');
});

test('buildPageModel groups words by line, keeps end markers, extracts juz/hizb', () => {
  const apiJson = { verses: [
    { verse_key: '1:1', verse_number: 1, juz_number: 1, hizb_number: 1, words: [
      { char_type_name: 'word', code_v2: 'A', line_number: 2, position: 1 },
      { char_type_name: 'word', code_v2: 'B', line_number: 2, position: 2 },
      { char_type_name: 'end',  code_v2: '١', line_number: 2, position: 3 }
    ]},
    { verse_key: '1:2', verse_number: 2, juz_number: 1, hizb_number: 1, words: [
      { char_type_name: 'word', code_v2: 'C', line_number: 3, position: 1 }
    ]}
  ]};
  const m = core.buildPageModel(apiJson, chapters, 1);
  assert.equal(m.page, 1);
  assert.equal(m.juz, 1);
  assert.equal(m.hizb, 1);
  const line2 = m.lines.find(l => l.n === 2);
  assert.equal(line2.type, 'ayah');
  assert.equal(line2.words.length, 3);
  assert.equal(line2.words[2].type, 'end');
  assert.equal(line2.words[0].code, 'A');
});

test('buildPageModel derives a surah_name header (+basmala) above a surah start', () => {
  // Surah 2 starts on page 2; first ayah word sits on line 4 → lines above are header/basmala
  const apiJson = { verses: [
    { verse_key: '2:1', verse_number: 1, juz_number: 1, hizb_number: 1, words: [
      { char_type_name: 'word', code_v2: 'X', line_number: 4, position: 1 }
    ]}
  ]};
  const m = core.buildPageModel(apiJson, chapters, 2);
  const types = m.lines.map(l => l.type);
  assert.ok(types.includes('surah_name'));
  assert.ok(types.includes('basmallah')); // surah 2 has bismillah_pre
  const header = m.lines.find(l => l.type === 'surah_name');
  assert.equal(header.surah, 2);
  assert.equal(header.centered, true);
});

test('buildPageModel: surah 9 (no bismillah) gets header but NO basmala', () => {
  const ch = { data: [{ id: 9, pages: [187, 207], bismillah_pre: false }] };
  const apiJson = { verses: [
    { verse_key: '9:1', verse_number: 1, juz_number: 10, hizb_number: 19, words: [
      { char_type_name: 'word', code_v2: 'Y', line_number: 3, position: 1 }
    ]}
  ]};
  const m = core.buildPageModel(apiJson, ch, 187);
  assert.ok(m.lines.some(l => l.type === 'surah_name'));
  assert.ok(!m.lines.some(l => l.type === 'basmallah'));
});
```

- [ ] **Step 2: Run — verify fail**

Run: `node --test tests/quran/mushaf-core.test.js`
Expected: FAIL (`Cannot find module ... quran-mushaf-core.js`).

- [ ] **Step 3: Implement `quran-mushaf-core.js`**

```js
/* IslamicInfo.org — quran-mushaf-core.js
   Pure, DOM-free logic for Madina Mushaf (QCF v2) page rendering. UMD: Node + browser. */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  else { root.II = root.II || {}; root.II.mushafCore = api; }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var PAGE_MIN = 1, PAGE_MAX = 604;
  var API = 'https://api.quran.com/api/v4/verses/by_page/';
  var FONT_BASE = 'https://verses.quran.foundation/fonts/quran/hafs/';

  function chapterOf(surahId, chapters) {
    var data = chapters && chapters.data;
    if (!data) return null;
    for (var i = 0; i < data.length; i++) if (Number(data[i].id) === Number(surahId)) return data[i];
    return null;
  }
  function pageOfSurah(surahId, chapters) {
    var ch = chapterOf(surahId, chapters);
    return (ch && ch.pages && ch.pages[0]) ? Number(ch.pages[0]) : 1;
  }
  function hasBismillah(surahId, chapters) {
    var ch = chapterOf(surahId, chapters);
    if (ch && typeof ch.bismillah_pre === 'boolean') return ch.bismillah_pre;
    return Number(surahId) !== 1 && Number(surahId) !== 9; // safe default
  }

  // variant 'v2' -> plain glyphs; 'v4' -> tajweed color font (colrv1 default, ot-svg for Firefox)
  function fontUrl(page, variant, theme, isFirefox) {
    if (variant === 'v4') {
      if (isFirefox) return FONT_BASE + 'v4/ot-svg/' + (theme === 'dark' ? 'dark' : 'light') + '/woff2/p' + page + '.woff2';
      return FONT_BASE + 'v4/colrv1/woff2/p' + page + '.woff2';
    }
    return FONT_BASE + 'v2/woff2/p' + page + '.woff2';
  }
  function fontFamily(page, variant) { return 'p' + page + '-' + variant; }

  function buildPageModel(apiJson, chapters, page) {
    var verses = (apiJson && apiJson.verses) || [];
    var byLine = {}; // line_number -> [{code,type,verseKey,position}]
    var juz = null, hizb = null;
    var surahStarts = {}; // line_number -> surahId (first ayah/word of a surah on this line)

    verses.forEach(function (v) {
      if (juz == null && typeof v.juz_number === 'number') juz = v.juz_number;
      if (hizb == null && typeof v.hizb_number === 'number') hizb = v.hizb_number;
      var surahId = Number(String(v.verse_key || '').split(':')[0]) || null;
      (v.words || []).forEach(function (w) {
        var ln = Number(w.line_number) || 0; if (!ln) return;
        (byLine[ln] = byLine[ln] || []).push({
          code: w.code_v2 || '', type: w.char_type_name === 'end' ? 'end' : 'word',
          verseKey: v.verse_key, position: Number(w.position) || 0
        });
        if (v.verse_number === 1 && Number(w.position) === 1 && surahStarts[ln] == null) {
          surahStarts[ln] = surahId;
        }
      });
    });

    // Assemble lines 1..15 that have content, inserting header/basmala above each surah start.
    var lineNums = Object.keys(byLine).map(Number).sort(function (a, b) { return a - b; });
    var lines = [];
    var minLine = lineNums.length ? lineNums[0] : 1;

    // For each surah start, the empty line(s) directly above the first ayah line are header (+ basmala).
    Object.keys(surahStarts).map(Number).forEach(function (startLine) {
      var surahId = surahStarts[startLine];
      var slotsAbove = [];
      for (var L = startLine - 1; L >= 1 && !byLine[L]; L--) slotsAbove.unshift(L);
      // Need at least 1 slot for header; 2 if basmala. If none free (surah starts at top), synthesize.
      var wantBasmala = hasBismillah(surahId, chapters);
      var needed = wantBasmala ? 2 : 1;
      // Use available empty slots closest to the ayah; if not enough, prepend synthetic negatives.
      var chosen = slotsAbove.slice(-needed);
      while (chosen.length < needed) chosen.unshift((chosen[0] || startLine) - 0.5 * (needed - chosen.length));
      if (wantBasmala) {
        lines.push({ n: chosen[0], type: 'surah_name', surah: surahId, centered: true, words: [] });
        lines.push({ n: chosen[1], type: 'basmallah', surah: surahId, centered: true, words: [] });
      } else {
        lines.push({ n: chosen[0], type: 'surah_name', surah: surahId, centered: true, words: [] });
      }
    });

    lineNums.forEach(function (ln) {
      lines.push({ n: ln, type: 'ayah', centered: false, words: byLine[ln] });
    });
    lines.sort(function (a, b) { return a.n - b.n; });

    return { page: Number(page) || minLine, juz: juz, hizb: hizb, lines: lines };
  }

  function fetchPage(page, opts) {
    opts = opts || {};
    var url = API + page + '?words=true&word_fields=code_v2,line_number,page_number,char_type_name,position' +
              '&fields=juz_number,hizb_number,page_number&per_page=50&mushaf=1';
    var ctrl = new AbortController();
    var t = setTimeout(function () { ctrl.abort(); }, opts.timeout || 8000);
    return fetch(url, { signal: ctrl.signal })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (json) { return buildPageModel(json, opts.chapters, page); })
      .finally(function () { clearTimeout(t); });
  }

  return {
    PAGE_MIN: PAGE_MIN, PAGE_MAX: PAGE_MAX,
    pageOfSurah: pageOfSurah, hasBismillah: hasBismillah,
    fontUrl: fontUrl, fontFamily: fontFamily,
    buildPageModel: buildPageModel, fetchPage: fetchPage
  };
});
```

- [ ] **Step 4: Run — verify pass**

Run: `node --test tests/quran/mushaf-core.test.js`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/js/quran-mushaf-core.js tests/quran/mushaf-core.test.js
git commit -m "feat(quran): mushaf-core — page model, line grouping, header derivation, font URLs"
```

---

## Task 2: `quran-tajweed.js` core map (unit-tested part first)

**Files:**
- Create: `src/js/quran-tajweed.js`
- Test: `tests/quran/tajweed-core.test.js`

> Note: `quran-tajweed.js` also contains DOM code (Task 5). To keep `mapTajweedClass` unit-testable, expose it on `window.II.tajweedCore` via a small UMD core section OR put the map in a tiny separate `quran-tajweed-core.js`. We use a separate core file for testability, matching the repo pattern.

- [ ] **Step 1: Failing test**

```js
'use strict';
const test = require('node:test');
const assert = require('node:assert');
const core = require('../../src/js/quran-tajweed-core.js');

test('mapClass folds API tajweed classes into 5 families', () => {
  assert.equal(core.mapClass('madda_normal'), 'tj-madd');
  assert.equal(core.mapClass('madda_obligatory'), 'tj-madd');
  assert.equal(core.mapClass('ghunnah'), 'tj-ghunna');
  assert.equal(core.mapClass('ikhafa'), 'tj-ikhfa');
  assert.equal(core.mapClass('ikhafa_shafawi'), 'tj-ikhfa');
  assert.equal(core.mapClass('idgham_wo_ghunnah'), 'tj-idgham');
  assert.equal(core.mapClass('iqlab'), 'tj-idgham');
  assert.equal(core.mapClass('qalqalah'), 'tj-qalqalah');
  assert.equal(core.mapClass('ham_wasl'), '');   // neutral
  assert.equal(core.mapClass('unknown_x'), '');
});

test('colorize replaces <tajweed class> spans with mapped classes, strips unknowns', () => {
  const html = '<tajweed class=madda_normal>ءَا</tajweed>ب<tajweed class="ham_wasl">ٱ</tajweed>';
  const out = core.colorize(html);
  assert.ok(out.indexOf('class="tj-madd"') !== -1);
  assert.ok(out.indexOf('tajweed') === -1);        // no raw <tajweed> tags
  assert.ok(out.indexOf('ham_wasl') === -1);       // neutral: span unwrapped to plain text
  assert.ok(out.indexOf('ب') !== -1);
});
```

- [ ] **Step 2: Run — verify fail**

Run: `node --test tests/quran/tajweed-core.test.js` → FAIL (module missing).

- [ ] **Step 3: Implement `quran-tajweed-core.js`**

```js
/* IslamicInfo.org — quran-tajweed-core.js
   Pure map from quran.com text_uthmani_tajweed classes to the site's 5 tj-* families. UMD. */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  else { root.II = root.II || {}; root.II.tajweedCore = api; }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var MAP = {
    madda_normal: 'tj-madd', madda_permissible: 'tj-madd',
    madda_necessary: 'tj-madd', madda_necesary: 'tj-madd', madda_obligatory: 'tj-madd',
    ghunnah: 'tj-ghunna',
    ikhafa: 'tj-ikhfa', ikhafa_shafawi: 'tj-ikhfa',
    idgham_ghunnah: 'tj-idgham', idgham_wo_ghunnah: 'tj-idgham', idgham_shafawi: 'tj-idgham',
    idgham_mutajanisayn: 'tj-idgham', idgham_mutaqaribayn: 'tj-idgham', iqlab: 'tj-idgham',
    qalqalah: 'tj-qalqalah'
    /* ham_wasl, slnt, laam_shamsiyah, unknown -> '' (neutral) */
  };
  function mapClass(cls) { return MAP[String(cls || '').trim()] || ''; }

  // Rewrite <tajweed class="X">...</tajweed> -> <span class="tj-*">...</span> (or plain text if neutral).
  function colorize(html) {
    return String(html == null ? '' : html).replace(
      /<tajweed\s+class=(?:"([^"]*)"|'([^']*)'|([^\s>]+))\s*>([\s\S]*?)<\/tajweed>/gi,
      function (_, a, b, c, inner) {
        var fam = mapClass(a || b || c);
        return fam ? '<span class="' + fam + '">' + inner + '</span>' : inner;
      });
  }

  return { mapClass: mapClass, colorize: colorize };
});
```

- [ ] **Step 4: Run — verify pass**

Run: `node --test tests/quran/tajweed-core.test.js` → PASS.

- [ ] **Step 5: Commit**

```bash
git add src/js/quran-tajweed-core.js tests/quran/tajweed-core.test.js
git commit -m "feat(quran): tajweed-core — class->family map + colorize()"
```

---

## Task 3: `quran-mushaf.js` — page-sheet DOM render (browser-verified)

**Files:**
- Create: `src/js/quran-mushaf.js`
- Modify: `quran.html` (empty `#mushafPageView` render target; script include) — done in Task 6.

- [ ] **Step 1: Implement render + font loader**

```js
/* IslamicInfo.org — quran-mushaf.js
   Madina Mushaf (QCF v2) page rendering, font loading, mode switch + page nav.
   Depends on window.II.mushafCore. Ayah-level highlight only (word audio-sync out of scope). */
(function () {
  'use strict';
  var core = window.II && window.II.mushafCore;
  var host = function () { return document.getElementById('mushafPageView'); };
  var loaded = {};           // family -> true (font registered)
  var state = { active: false, page: 1, variant: 'v2' };

  function isFirefox() { return /firefox/i.test(navigator.userAgent); }
  function theme() { return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; }
  function chapters() { try { return JSON.parse(localStorage.getItem('ii-quran-chapters')); } catch (e) { return null; } }

  function ensureFont(page, variant) {
    var fam = core.fontFamily(page, variant);
    if (loaded[fam] || !window.FontFace) return Promise.resolve(fam);
    var url = core.fontUrl(page, variant, theme(), isFirefox());
    var ff = new FontFace(fam, "url('" + url + "') format('woff2')");
    return ff.load().then(function (f) { document.fonts.add(f); loaded[fam] = true; return fam; });
  }

  function surahNameArabic(surahId) {
    try {
      var c = chapters(); var ch = c && c.data && c.data.filter(function (x) { return x.id === Number(surahId); })[0];
      return (ch && (ch.name_arabic || ch.name_simple)) || '';
    } catch (e) { return ''; }
  }

  function renderModel(model, variant) {
    var h = host(); if (!h) return;
    var fam = core.fontFamily(model.page, variant);
    var sheet = document.createElement('div'); sheet.className = 'mushaf-sheet';
    var pageEl = document.createElement('div'); pageEl.className = 'mushaf-page'; pageEl.setAttribute('dir', 'rtl');

    model.lines.forEach(function (line) {
      var row = document.createElement('div');
      row.className = 'm-line m-line--' + line.type + (line.centered ? ' m-line--center' : '');
      if (line.type === 'surah_name') {
        row.innerHTML = '<span class="m-surah-frame">﴿ ' + surahNameArabic(line.surah) + ' ﴾</span>';
      } else if (line.type === 'basmallah') {
        row.innerHTML = '<span class="m-basmala">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</span>';
      } else {
        var words = line.words.map(function (w) {
          return '<span class="mushaf-word' + (w.type === 'end' ? ' m-end' : '') +
                 '" data-vk="' + (w.verseKey || '') + '">' + w.code + '</span>';
        }).join('');
        row.style.fontFamily = "'" + fam + "', 'Amiri', serif";
        row.innerHTML = words;   // PUA glyphs — must be innerHTML
      }
      pageEl.appendChild(row);
    });

    var footer = document.createElement('div'); footer.className = 'mushaf-foot';
    footer.textContent = 'Page ' + model.page + (model.juz ? ' · Juz ' + model.juz : '') + (model.hizb ? ' · Hizb ' + model.hizb : '');
    sheet.appendChild(pageEl); sheet.appendChild(footer);
    h.innerHTML = ''; h.appendChild(sheet);
  }

  function showLoading() { var h = host(); if (h) h.innerHTML = '<div class="mushaf-loading">Loading page…</div>'; }
  function showError() {
    var h = host();
    if (h) h.innerHTML = '<div class="mushaf-error">Mushaf temporarily unavailable — staying in Study Mode.</div>';
  }

  window.mushafGoToPage = function (page) {
    if (!core) return;
    page = Math.max(core.PAGE_MIN, Math.min(core.PAGE_MAX, Number(page) || 1));
    state.page = page; showLoading();
    var variant = state.variant;
    Promise.all([ core.fetchPage(page, { chapters: chapters() }), ensureFont(page, variant) ])
      .then(function (res) {
        renderModel(res[0], variant);
        try { localStorage.setItem('ii-quran-mushaf-page', String(page)); } catch (e) {}
        if (page < core.PAGE_MAX) ensureFont(page + 1, variant).catch(function () {}); // prefetch
      })
      .catch(function (e) { console.warn('[mushaf] page ' + page + ' failed:', e && e.message); showError(); });
  };

  window.mushafChangePage = function (dir) { window.mushafGoToPage(state.page + dir); };

  window.II = window.II || {};
  window.II.mushaf = {
    current: function () { return state.page; },
    isActive: function () { return state.active; },
    _setActive: function (b) { state.active = b; },
    _setVariant: function (v) { state.variant = v; return ensureFont(state.page, v).then(function () {
      return core.fetchPage(state.page, { chapters: chapters() }); }).then(function (m) { renderModel(m, v); }); },
    _variant: function () { return state.variant; }
  };
})();
```

- [ ] **Step 2: Browser verify (deferred to Task 6 wiring)** — noted; page render is exercised after `quran.html` wiring. No standalone test (DOM/font).

- [ ] **Step 3: Commit**

```bash
git add src/js/quran-mushaf.js
git commit -m "feat(quran): mushaf page-sheet render + on-demand font loader + page nav"
```

---

## Task 4: `quran-tajweed.js` — DOM controller (flow + mushaf swap)

**Files:**
- Create: `src/js/quran-tajweed.js`

- [ ] **Step 1: Implement**

```js
/* IslamicInfo.org — quran-tajweed.js
   Context-aware Tajweed: colors flowing Study view (text_uthmani_tajweed) and swaps
   Mushaf page font v2<->v4. Depends on window.II.tajweedCore + window.II.mushaf. */
(function () {
  'use strict';
  var tcore = window.II && window.II.tajweedCore;
  var on = false;

  function inMushaf() { return window.II && window.II.mushaf && window.II.mushaf.isActive(); }
  function legend(show) {
    var l = document.getElementById('tjLegend'); if (l) l.classList.toggle('show', show);
    var m = document.getElementById('mushafTjLegend'); if (m) m.classList.toggle('show', show);
  }

  // Study view: show/hide the .ayah-tajweed layer vs the per-word .ayah-arabic layer.
  function applyFlow() {
    document.querySelectorAll('.ayah-card').forEach(function (card) {
      var plain = card.querySelector('.ayah-arabic');
      var tj = card.querySelector('.ayah-tajweed');
      if (!tj) return;
      if (on) { if (plain) plain.style.display = 'none'; tj.style.display = ''; }
      else    { if (plain) plain.style.display = '';     tj.style.display = 'none'; }
    });
  }

  function applyMushaf() {
    if (!(window.II && window.II.mushaf)) return;
    window.II.mushaf._setVariant(on ? 'v4' : 'v2');
  }

  window.toggleTajweed = function (btn) {
    on = !on;
    if (btn) btn.classList.toggle('tajweed-active', on);
    legend(on);
    if (inMushaf()) applyMushaf(); else applyFlow();
    if (window.showToast) window.showToast(on ? 'Tajweed color-coding on ✦' : 'Tajweed off');
  };

  window.II = window.II || {};
  window.II.tajweed = {
    isOn: function () { return on; },
    reapply: function () { if (on) { inMushaf() ? applyMushaf() : applyFlow(); } },
    colorize: function (html) { return tcore ? tcore.colorize(html) : html; }
  };
})();
```

- [ ] **Step 2: Commit**

```bash
git add src/js/quran-tajweed.js
git commit -m "feat(quran): tajweed DOM controller — flow layer toggle + mushaf font swap"
```

---

## Task 5: Add tajweed layer to Study cards (`quran-verses.js`)

**Files:**
- Modify: `src/js/quran-verses.js` (fetch fields + buildCard)

- [ ] **Step 1: Add `text_uthmani_tajweed` to the fetch** — edit `fetchPage` (`quran-verses.js:58-59`):

```js
    var url = API + id + '?language=en&words=true&word_fields=text_uthmani,translation' +
              '&fields=text_uthmani,text_uthmani_tajweed&translations=' + ed + '&per_page=50&page=' + page;
```

- [ ] **Step 2: Carry it through normalize** — in `quran-verses-core.js` `normalizeVerse`, add `text_uthmani_tajweed: apiVerse.text_uthmani_tajweed || ''` to the returned object; add a test in `tests/quran/verses-core.test.js` asserting it passes through. Run `node --test tests/quran/verses-core.test.js` → PASS.

- [ ] **Step 3: Render a hidden tajweed layer** — in `buildCard` (`quran-verses.js`), right after the `arabic` block is appended (`:139`), add:

```js
    var tj = el('div', 'ayah-tajweed'); tj.setAttribute('dir', 'rtl');
    tj.style.display = 'none';
    tj.innerHTML = (window.II && window.II.tajweed)
      ? window.II.tajweed.colorize(v.text_uthmani_tajweed || '')
      : (v.text_uthmani_tajweed || '');
    card.appendChild(tj);
```

- [ ] **Step 4: Re-apply tajweed after (re)render** — at the end of `renderSurah` (`quran-verses.js:240`, before closing), add: `if (window.II && window.II.tajweed) window.II.tajweed.reapply();` and the same at the end of `appendBatch`.

- [ ] **Step 5: Commit**

```bash
git add src/js/quran-verses.js src/js/quran-verses-core.js tests/quran/verses-core.test.js
git commit -m "feat(quran): fetch text_uthmani_tajweed + hidden tajweed layer per card"
```

---

## Task 6: `quran.html` — CSS, script includes, mode wiring, remove hardcoded Mushaf

**Files:**
- Modify: `quran.html`

- [ ] **Step 1: Add page-sheet + tajweed-layer CSS** (near the existing Mushaf CSS block, ~line 289). Uses design tokens; fit-to-height via `--m-scale`:

```css
/* Madina Mushaf — dynamic page sheet */
#mushafPageView{display:none;}
.mushaf-mode-active #mushafPageView{display:flex;justify-content:center;align-items:center;min-height:100%;padding:18px;}
.mushaf-sheet{width:min(680px,94%);background:var(--surface-card);border:1px solid rgba(197,160,89,.4);
  border-radius:10px;box-shadow:0 10px 40px rgba(0,0,0,.10);padding:clamp(14px,3vw,30px);}
.mushaf-page{direction:rtl;text-align:justify;text-align-last:justify;
  font-size:clamp(20px,var(--m-scale,3.4vw),34px);line-height:2.15;color:var(--ink-primary);}
.m-line{display:block;}
.m-line--center{text-align:center;text-align-last:center;}
.m-surah-frame{font-family:var(--font-arabic);color:var(--teal-700);font-size:.8em;letter-spacing:.04em;}
.m-basmala{font-family:var(--font-arabic);color:var(--ink-muted);font-size:.7em;}
.mushaf-word{cursor:default;}
.mushaf-word.word-active{color:var(--gold-600);}
.m-line.ayah-playing,.ayah-playing .mushaf-word{color:var(--teal-700);}
.mushaf-foot{margin-top:14px;text-align:center;font-family:var(--font-mono);font-size:11px;color:var(--ink-subtle);}
.mushaf-loading,.mushaf-error{padding:40px;text-align:center;color:var(--ink-muted);font-size:14px;}
/* Study-view tajweed layer */
.ayah-tajweed{font-family:var(--font-arabic);font-size:var(--ar-sz,28px);line-height:2.1;
  direction:rtl;text-align:right;margin-bottom:16px;color:var(--ink-primary);}
```

- [ ] **Step 2: Remove hardcoded Al-Fatihah Mushaf markup** — replace the entire static `#mushafPageView` inner content with an empty render target:

```html
<div id="mushafPageView"></div>
```
(Keep the `#mushafTjLegend` element if it lives outside `#mushafPageView`; otherwise re-add it just above `#mushafPageView`.)

- [ ] **Step 3: Delete the now-dead inline JS** in `quran.html`: the hardcoded `getMushafWords` reliance stays (guarded), but remove the inline `toggleTajweed` (Task 4 owns it) and the body of `switchToMushafMode`/`switchToStudyMode` — replace with thin wrappers:

```js
function switchToMushafMode(btn){
  mushafModeActive = true;
  var va=document.getElementById('versesArea'), cl=document.getElementById('versesCardList');
  va.classList.add('mushaf-mode-active'); if(cl) cl.style.display='none';
  document.getElementById('mushafModeBtn').classList.add('on');
  document.getElementById('studyModeBtn').classList.remove('on');
  if(window.II&&window.II.mushaf) window.II.mushaf._setActive(true);
  var sid = (window.II&&window.II.quranVerses&&window.currentSurahId)||1;
  var start = (window.II&&window.II.mushafCore)
    ? window.II.mushafCore.pageOfSurah(sid, JSON.parse(localStorage.getItem('ii-quran-chapters')||'null')) : 1;
  window.mushafGoToPage(start);
  if(window.II&&window.II.tajweed&&window.II.tajweed.isOn()) window.II.tajweed.reapply();
  showToast('Mushaf Mode — Madina page ✦');
}
function switchToStudyMode(btn){
  mushafModeActive = false;
  var va=document.getElementById('versesArea'), cl=document.getElementById('versesCardList');
  va.classList.remove('mushaf-mode-active'); if(cl) cl.style.display='';
  document.getElementById('studyModeBtn').classList.add('on');
  document.getElementById('mushafModeBtn').classList.remove('on');
  if(window.II&&window.II.mushaf) window.II.mushaf._setActive(false);
  if(window.II&&window.II.tajweed&&window.II.tajweed.isOn()) window.II.tajweed.reapply();
  showToast('Study Mode — verse cards ✦');
}
```

Also set `window.currentSurahId` in `quran-verses.js` `renderSurah` (`ctxSurahId` is known): add `window.currentSurahId = ctxSurahId;`.

- [ ] **Step 4: Add script includes** — after the existing quran module scripts, before `</body>`:

```html
<script src="src/js/quran-mushaf-core.js"></script>
<script src="src/js/quran-tajweed-core.js"></script>
<script src="src/js/quran-mushaf.js"></script>
<script src="src/js/quran-tajweed.js"></script>
```
(Order: cores before DOM modules; ensure they load after `quran-verses.js` so `window.II` exists.)

- [ ] **Step 5: Browser verify** — serve locally and check:
  - Load `?surah=2` → Mushaf Mode → page 2 renders centered, glyphs correct, 15-line justified, header + basmala present.
  - Prev/next nav works; footer shows Page/Juz/Hizb.
  - Tajweed in Mushaf → colors appear, **no reflow**; toggle off → back to black.
  - Tajweed in Study → flowing text colors; toggle off → plain per-word returns.
  - Theme toggle → tajweed recolors (v4 dark palette / dark tj-* tokens).

Run local server: `python -m http.server 8080` (or existing dev command); open `http://localhost:8080/quran.html?surah=2`.

- [ ] **Step 6: Commit**

```bash
git add quran.html src/js/quran-verses.js
git commit -m "feat(quran): wire dynamic Mushaf + context-aware Tajweed into quran.html"
```

---

## Task 7: Fallbacks + fit-to-height polish

**Files:** Modify `quran.html` (JS), `src/js/quran-mushaf.js`

- [ ] **Step 1: Study-Mode revert on Mushaf failure** — in `mushafGoToPage`'s `.catch`, after `showError()`, auto-revert: `if (typeof switchToStudyMode==='function') setTimeout(switchToStudyMode, 1600);` so the user isn't stranded.

- [ ] **Step 2: Font fallback** — `ensureFont` already resolves the family; if `ff.load()` rejects, catch and resolve to `'Amiri'` so glyph rows fall back to Amiri (degraded but readable). Update `ensureFont`:

```js
    return ff.load().then(function (f) { document.fonts.add(f); loaded[fam] = true; return fam; })
                    .catch(function () { return 'Amiri'; });
```
And in `renderModel`, when the resolved family is `'Amiri'`, render `w.verseKey`-based `text_uthmani` instead of glyph codes — **note:** since glyph codes are meaningless in Amiri, on font failure fetch a plain-text fallback. Simplest robust behavior: on font-load failure, call `showError()` + revert to Study Mode (Step 1) rather than render broken glyphs. Choose this: treat font failure the same as page failure.

- [ ] **Step 3: Fit-to-height** — compute `--m-scale` from the reading-pane height so the whole page fits without inner scroll. Add to `renderModel` after append:

```js
    requestAnimationFrame(function () {
      var va = document.getElementById('versesArea');
      var pageEl2 = sheet.querySelector('.mushaf-page');
      if (!va || !pageEl2) return;
      var avail = va.clientHeight - 90;                    // minus footer/padding
      var over = pageEl2.scrollHeight;
      if (over > avail) {
        var cur = parseFloat(getComputedStyle(pageEl2).fontSize);
        pageEl2.style.fontSize = Math.max(16, cur * (avail / over)) + 'px';
      }
    });
```

- [ ] **Step 4: Browser verify** — throttle network / block the font URL in devtools → confirm graceful "unavailable + revert to Study". Resize window → page always fits height, stays centered and balanced.

- [ ] **Step 5: Commit**

```bash
git add src/js/quran-mushaf.js quran.html
git commit -m "feat(quran): mushaf fallbacks (revert to Study) + fit-to-height scaling"
```

---

## Task 8: Docs + final integration pass

**Files:** Modify `doc/API-SPEC.md`, `doc/DATA.md`

- [ ] **Step 1: `doc/API-SPEC.md`** — add a section documenting: `GET /verses/by_page/{page}` (params, keyless host, fallback host), `text_uthmani_tajweed` field on `by_chapter`, and the `verses.quran.foundation` font CDN URL patterns (v2, v4 colrv1, v4 ot-svg).

- [ ] **Step 2: `doc/DATA.md`** — register new localStorage key `ii-quran-mushaf-page` (last viewed mushaf page, integer 1–604).

- [ ] **Step 3: Full test run** — `node --test tests/quran/` → all PASS.

- [ ] **Step 4: Final manual pass** — Al-Fatihah (page 1 decorative), Al-Baqarah (page 2 header+basmala), At-Tawbah (page 187, header no basmala), a mid-page surah transition (e.g. Juz Amma), dark mode, mobile width.

- [ ] **Step 5: Commit + finish branch**

```bash
git add doc/API-SPEC.md doc/DATA.md
git commit -m "docs(quran): document by_page, tajweed field, QCF font CDN + mushaf-page key"
```
Then use `superpowers:finishing-a-development-branch`.

---

## Self-Review

- **Spec coverage:** Task 1 (§4.1 layout, §6.1 core, §7 juz/hizb), Task 2/5 (§4.3, §5 map, §6.3, Task 3 flow layer), Task 3/6 (§6.2 render, §7 presentation, §8 interaction), Task 4 (§6.3 swap), Task 7 (§4.4 fallbacks, §7 fit-to-height), Task 8 (§10 docs/tests). All spec sections mapped. ✔
- **Placeholder scan:** all code shown in full; no TBD. ✔
- **Type consistency:** `buildPageModel`/`fetchPage`/`fontUrl`/`fontFamily`/`pageOfSurah`/`hasBismillah` (core) used consistently in `quran-mushaf.js`; `mapClass`/`colorize` (tajweedCore) used in tajweed controller + verses card; `window.II.mushaf._setVariant/_setActive/isActive/current` consistent across Tasks 3/4/6. ✔
- **Known heuristic (flagged honestly):** surah_name/basmala line placement is derived from empty-line gaps above a surah's first ayah word (Task 1), verified against real pages in Task 8 — not from a QUL line_type dataset (live-API choice). Acceptable per spec §4.1.
