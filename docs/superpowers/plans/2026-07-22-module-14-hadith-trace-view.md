# Module 14 — Hadith Trace View — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the signature 3-column Trace View (Matn · Isnad · Scholarly Grading) as one overlay driven by two entry points — a real route `/hadith/trace/[c]/[b]/[h]` and a card-action-row button — with only real data populated and every absent section rendered as an honest "not yet available" state.

**Architecture:** One `.trace-overlay` (z-index 300) fed by a pure core (`trace-view-core.js`, unit-tested) and a DOM controller (`trace-view.js`, host-injected in `hadith.js`). Reuses `II.ui.focusTrap`, the bookmarks-panel Escape/focus-return pattern, `II.hadithActions.buildCopyText` (via a hadith-object adapter), and — when isnad data ever lands — the already-document-wired `II.narratorPanelDom`. Ships live (no runtime flag); manual AT verification is tracked outstanding QA.

**Tech Stack:** Vanilla UMD IIFE modules (`module.exports` for `node:test`, `window.II.*` in the browser), History-API routing, existing design tokens.

**Spec:** `docs/superpowers/specs/2026-07-22-module-14-hadith-trace-view-design.md`
**Test command:** `cd worker && node --test "test/*.test.js"`

---

## File Structure

| File | New/Mod | Responsibility |
|------|---------|----------------|
| `src/js/trace-view-core.js` | New | PURE: column/breadcrumb/copy-content builders + honest states + exit-target |
| `worker/test/trace-view-core.test.js` | New | Unit tests incl. honesty + XSS-escaping |
| `hadith.html` | Mod | Overlay markup + CSS; REMOVE static demo `.trace-layout` (markup + demo grid CSS) |
| `src/js/hadith-feed-core.js` | Mod | Add `data-act="trace"` button to card `.hadith-actions` |
| `worker/test/hadith-feed-core.test.js` | Mod | Assert the trace button renders |
| `src/js/tier3-deep-view-core.js` | Mod | "View as Trace →" link in the deep-view header |
| `worker/test/tier3-deep-view-core.test.js` | Mod | Assert the link renders with the right href |
| `src/js/trace-view.js` | New | DOM controller: open/close, focus trap, Escape, render, wire `.trace-act` |
| `src/js/hadith.js` | Mod | Trace host handlers, init, `wireTraceView`, card `trace` case, routing branch |
| `doc/DECISIONS.md` | Mod | 1 entry: Trace View ships live (no flag) |

**Reused, not rebuilt:** `II.narratorPanelDom` (Module 8), `II.hadithActions` (Modules 10/12), `II.ui.focusTrap`. **Not touched:** hadith API/adapter, grade/narrator data shape, `QURANLYAI_SYSTEM_PROMPT`/worker LLM code.

---

## Task 1: `trace-view-core.js` — pure builders + honesty/escaping tests

**Files:** Create `src/js/trace-view-core.js`, `worker/test/trace-view-core.test.js`

- [ ] **Step 1: Confirm the UMD footer to mirror.** Open `src/js/tier3-deep-view-core.js` and read its LAST ~12 lines — the dual-mode export shim (`if (module.exports) module.exports = core; else { root.II = root.II || {}; root.II.<name> = core; }` wrapped in an IIFE taking `globalThis`). Your new file MUST use the identical pattern so `import core from '../../src/js/trace-view-core.js'` works in `node:test` and `window.II.traceViewCore` is set in the browser.

- [ ] **Step 2: Write the failing test** — Create `worker/test/trace-view-core.test.js`:

```javascript
import { test } from 'node:test';
import assert from 'node:assert';
import core from '../../src/js/trace-view-core.js';

// Mirrors the normalized hadith shape (worker/src/lib/hadith-adapter.js): live data yields
// grade sahih/unknown, grader:null, isnad.narrators:[], topics:[], gradeCharacterization for direct source.
function bukhari(over = {}) {
  return Object.assign({
    collectionSlug: 'sahih-bukhari', collectionName: 'Sahih al-Bukhari',
    bookNumber: 1, bookName: 'Revelation', hadithNumber: 1, reference: 'Sahih al-Bukhari 1',
    arabicMatn: 'إنما الأعمال بالنيات', translation: { text: 'Actions are but by intentions', language: 'en' },
    narrator: { name: 'Umar ibn al-Khattab' },
    grade: { value: 'sahih', label: 'Sahih', grader: null, sourceCitation: null, disputed: false, alternateGradings: [] },
    isnad: { status: 'unavailable', narrators: [] }, topics: [],
  }, over);
}

test('buildBreadcrumb: Collection › Book › #N', () => {
  const b = core.buildBreadcrumb(bukhari());
  assert.match(b, /Sahih al-Bukhari/);
  assert.match(b, /Revelation/);
  assert.match(b, /#1/);
});

test('matn column: real arabic + translation present', () => {
  const h = core.buildMatnColHTML(bukhari());
  assert.match(h, /إنما الأعمال بالنيات/);
  assert.match(h, /Actions are but by intentions/);
});

test('matn column: empty topics + no qverses render honest states (never invented)', () => {
  const h = core.buildMatnColHTML(bukhari());
  assert.match(h, /Topics are being compiled/i);
  assert.match(h, /No linked Qur/i);
  assert.ok(!/topic-chip/.test(h)); // no chips fabricated when topics:[]
});

test('isnad column: empty narrators → honest "not available", no fabricated chain', () => {
  const h = core.buildIsnadColHTML(bukhari());
  assert.match(h, /Chain of narration not available for this hadith\./);
  assert.ok(!/trace-isnad-node/.test(h));
});

test('isnad column: when narrators present, rows carry data-narrator-id for Module 8 reuse', () => {
  const h = core.buildIsnadColHTML(bukhari({ isnad: { status: 'ok', narrators: [{ id: 'n1', fullName: 'Yahya', role: 'Tabii' }] } }));
  assert.match(h, /data-narrator-id="n1"/);
  assert.match(h, /role="button"/);
  assert.match(h, /Yahya/);
});

test('grading column: real sahih grade block + grader-not-cited honesty', () => {
  const h = core.buildGradingColHTML(bukhari());
  assert.match(h, /grade-sahih/);
  assert.match(h, /Sahih/);
  assert.match(h, /grader not individually cited/);
});

test('grading column: ADVERSARIAL — Ibn Hajar + an-Nawawi boxes are honest-empty, NEVER paraphrased', () => {
  const h = core.buildGradingColHTML(bukhari());
  assert.match(h, /Ibn Hajar/);
  assert.match(h, /an-Nawawi/i);
  // Both boxes must contain ONLY the honest unavailable string — no scholar prose.
  const boxes = h.match(/Commentary not yet available\./g) || [];
  assert.equal(boxes.length, 2, 'both commentary boxes must be honest-empty');
  assert.match(h, /Related narrations are being compiled/);
});

test('grading column: no grade + characterization → collection-level honesty', () => {
  const h = core.buildGradingColHTML(bukhari({ grade: null, gradeCharacterization: 'Sahih (collection-level)' }));
  assert.match(h, /Sahih \(collection-level\)/);
  assert.match(h, /collection-level characterization/);
});

test('buildCopyContent: maps hadith → the content shape buildCopyText expects', () => {
  const c = core.buildCopyContent(bukhari(), 'https://islamicinfo.org/hadith/sahih-bukhari/1/1');
  assert.equal(c.arabic, 'إنما الأعمال بالنيات');
  assert.equal(c.translation, 'Actions are but by intentions');
  assert.equal(c.reference, 'Sahih al-Bukhari 1');
  assert.equal(c.grade, 'Sahih');
  assert.equal(c.sourceUrl, 'https://islamicinfo.org/hadith/sahih-bukhari/1/1');
});

test('resolveExitTarget: viaRoute → nav to deep-view route; card → no nav', () => {
  const r = { collection: 'sahih-bukhari', book: 1, hadith: 1 };
  assert.deepEqual(core.resolveExitTarget({ viaRoute: true, route: r }), { nav: true, route: r });
  assert.deepEqual(core.resolveExitTarget({ viaRoute: false }), { nav: false, route: null });
});

test('XSS: matn/translation are escaped', () => {
  const h = core.buildMatnColHTML(bukhari({ arabicMatn: '<script>x</script>', translation: { text: '<img src=x onerror=1>' } }));
  assert.ok(!/<script>/.test(h));
  assert.ok(!/<img /.test(h));
  assert.match(h, /&lt;script&gt;/);
});
```

- [ ] **Step 3: Run test to verify it fails** — `cd worker && node --test test/trace-view-core.test.js` → FAIL (module not found).

- [ ] **Step 4: Write minimal implementation** — Create `src/js/trace-view-core.js` (use the UMD footer confirmed in Step 1; the body below is the logic):

```javascript
/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — trace-view-core.js  (Module 14)
   Pure builders for the 3-column Hadith Trace View. NO DOM, NO network.
   Only matn/translation/grade are real; isnad, scholar commentary,
   related narrations/verses, topics render honest "not yet available"
   states — NEVER a paraphrase attributed to a named scholar.
   UMD (window.II.traceViewCore in browser; module.exports in tests).
   ═══════════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  var UNAVAIL_ISNAD = 'Chain of narration not available for this hadith.';
  var UNAVAIL_COMMENTARY = 'Commentary not yet available.'; // never a paraphrase attributed to a named scholar
  var UNAVAIL_RELATED = 'Related narrations are being compiled and will appear once verified against source chains.';
  var UNAVAIL_TOPICS = 'Topics are being compiled for this hadith.';
  var UNAVAIL_QVERSES = 'No linked Qur’anic verses yet.';

  function collectionTitle(h) { return (h && (h.collectionName || h.collectionSlug)) || 'Hadith'; }
  function bookTitle(h) { if (!h) return ''; if (h.bookName) return h.bookName; if (h.bookNumber != null) return 'Book ' + h.bookNumber; return ''; }

  function buildBreadcrumb(h) {
    var parts = [collectionTitle(h)];
    var b = bookTitle(h); if (b) parts.push(b);
    var num = (h && h.hadithNumber != null) ? ('#' + h.hadithNumber) : '';
    return parts.map(esc).join(' › ') + (num ? ' › <strong>' + esc(num) + '</strong>' : '');
  }

  function buildMatnColHTML(h) {
    h = h || {};
    var ar = h.arabicMatn || '';
    var tr = (h.translation && h.translation.text) || '';
    var narr = (h.narrator && h.narrator.name) || '';
    var topics = Array.isArray(h.topics) ? h.topics : [];
    var out = '<div class="trace-col trace-col-1"><div class="trace-col-label">Matn</div>';
    out += ar ? '<div class="trace-matn font-arabic" dir="rtl" lang="ar">' + esc(ar) + '</div>' : '<div class="dv-empty">Arabic text not available.</div>';
    if (tr) out += '<div class="trace-trans">' + esc(tr) + '</div>';
    if (narr) out += '<div class="trace-narrator">Narrated by ' + esc(narr) + '</div>';
    out += '<div class="trace-topics">' + (topics.length
      ? topics.map(function (t) { return '<span class="topic-chip">' + esc(t) + '</span>'; }).join('')
      : '<div class="dv-empty">' + UNAVAIL_TOPICS + '</div>') + '</div>';
    out += '<div class="trace-qverses"><div class="trace-sub-label">Related Qur’anic Verses</div><div class="dv-empty">' + UNAVAIL_QVERSES + '</div></div>';
    return out + '</div>';
  }

  function buildIsnadColHTML(h) {
    h = h || {};
    var nodes = (h.isnad && Array.isArray(h.isnad.narrators)) ? h.isnad.narrators : [];
    var head = '<div class="trace-col trace-col-2"><div class="trace-col-label">Isnad Chain (Click narrators for reliability)</div>';
    if (!nodes.length) return head + '<div class="dv-empty">' + UNAVAIL_ISNAD + '</div></div>';
    var chain = nodes.map(function (n, i) {
      n = n || {};
      var nm = n.fullName || n.arabicName || ('Narrator ' + (i + 1));
      var meta = [n.role, n.lifespan || n.era].filter(Boolean).map(esc).join(' · ');
      var idAttr = n.id ? ' data-narrator-id="' + esc(n.id) + '" tabindex="0" role="button" aria-expanded="false"' : '';
      var diverge = n.divergence ? '<span class="chain-diverge" title="Chain divergence">◆</span>' : '';
      return '<li class="trace-isnad-node"' + idAttr + '><span class="trace-isnad-name">' + esc(nm) + '</span>' +
        (meta ? '<span class="trace-isnad-meta">' + meta + '</span>' : '') + diverge + '</li>';
    }).join('');
    return head + '<ol class="trace-isnad-chain">' + chain + '</ol></div>';
  }

  function gradeBlockHTML(h) {
    var g = h && h.grade;
    if (g && g.value && g.value !== 'unknown') {
      var grader = g.grader ? esc(g.grader) : 'grader not individually cited';
      return '<div class="trace-grade grade-' + esc(g.value) + '"><span class="trace-grade-label">' + esc(g.label || g.value) + '</span>' +
        '<span class="trace-grade-grader">' + grader + '</span></div>';
    }
    if (h && h.gradeCharacterization) {
      return '<div class="trace-grade grade-unknown"><span class="trace-grade-label">' + esc(h.gradeCharacterization) + '</span>' +
        '<span class="trace-grade-grader">collection-level characterization; per-hadith grade not individually recorded.</span></div>';
    }
    return '<div class="dv-empty">Scholarly grading not individually recorded for this narration.</div>';
  }

  function commentaryBoxHTML(scholar) {
    return '<div class="trace-commentary"><div class="trace-sub-label">' + esc(scholar) + '</div><div class="dv-empty">' + UNAVAIL_COMMENTARY + '</div></div>';
  }

  function buildGradingColHTML(h) {
    return '<div class="trace-col trace-col-3"><div class="trace-col-label">Scholarly Grading</div>' +
      gradeBlockHTML(h) +
      commentaryBoxHTML('Ibn Hajar al-ʿAsqalani') +
      commentaryBoxHTML('Imam an-Nawawi') +
      '<div class="trace-related"><div class="trace-sub-label">Related Narrations</div><div class="dv-empty">' + UNAVAIL_RELATED + '</div></div>' +
      '</div>';
  }

  function buildTraceHTML(h) { return buildMatnColHTML(h) + buildIsnadColHTML(h) + buildGradingColHTML(h); }

  function buildCopyContent(h, sourceUrl) {
    h = h || {};
    return {
      arabic: h.arabicMatn || '',
      translation: (h.translation && h.translation.text) || '',
      narrator: (h.narrator && h.narrator.name) || '',
      reference: h.reference || '',
      grade: (h.grade && h.grade.label) || (h.gradeCharacterization || ''),
      sourceUrl: sourceUrl || '',
    };
  }

  function resolveExitTarget(state) {
    state = state || {};
    return (state.viaRoute && state.route) ? { nav: true, route: state.route } : { nav: false, route: null };
  }

  var api = {
    esc: esc, buildBreadcrumb: buildBreadcrumb,
    buildMatnColHTML: buildMatnColHTML, buildIsnadColHTML: buildIsnadColHTML, buildGradingColHTML: buildGradingColHTML,
    buildTraceHTML: buildTraceHTML, buildCopyContent: buildCopyContent, resolveExitTarget: resolveExitTarget,
    UNAVAIL_ISNAD: UNAVAIL_ISNAD, UNAVAIL_COMMENTARY: UNAVAIL_COMMENTARY, UNAVAIL_RELATED: UNAVAIL_RELATED,
  };
  // UMD footer — MIRROR tier3-deep-view-core.js exactly (Step 1):
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  else { root.II = root.II || {}; root.II.traceViewCore = api; }
}(typeof globalThis !== 'undefined' ? globalThis : this));
```

- [ ] **Step 5: Run test to verify it passes** — `cd worker && node --test test/trace-view-core.test.js` → PASS (all). Then full suite `cd worker && node --test "test/*.test.js"` → no regressions.

- [ ] **Step 6: Commit**
```bash
git add src/js/trace-view-core.js worker/test/trace-view-core.test.js
git commit -m "feat(hadith): Module 14 — trace-view-core pure builders + honest states (US-H18)"
```

---

## Task 2: `hadith.html` — overlay CSS + markup; remove static demo

**Files:** Modify `hadith.html`

- [ ] **Step 1: Remove the static demo.** Delete the demo Trace section markup at `hadith.html:1752-1815` (the section header + the `<div class="trace-layout fade-up" …>…</div>` block — verify the exact span; it opens ~1756 and closes at the matching `</div>` ~1815). There must be exactly ONE `.trace-layout` after this task (the overlay's).

- [ ] **Step 2: Replace the demo grid CSS** at `hadith.html:786-793`. Change the `.trace-layout` rule to the canonical grid and add overlay + column CSS. Keep `.chain-diverge`/`.diff-highlight` (still used). Replace the block with:

```css
/* ─── TRACE VIEW (Module 14) ─── */
.trace-overlay{position:fixed;inset:0;z-index:300;background:var(--surface-canvas);display:none;flex-direction:column;}
.trace-overlay.open{display:flex;}
.trace-top{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 24px;border-bottom:.5px solid rgba(0,105,110,.10);background:var(--surface-raised);flex-shrink:0;}
.trace-bc{font-size:14px;color:var(--ink-subtle);}
.trace-bc strong{color:var(--teal-700);}
.trace-top-acts{display:flex;gap:8px;align-items:center;}
.trace-act{width:34px;height:34px;border-radius:50%;border:.5px solid var(--ink-faint);background:transparent;color:var(--ink-subtle);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;transition:all .18s;}
.trace-act:hover{border-color:var(--teal-700);color:var(--teal-700);}
.trace-exit{background:var(--teal-700);color:#fff;border:none;border-radius:12px;padding:8px 16px;font-size:13px;font-weight:600;cursor:pointer;margin-left:6px;}
.trace-layout{flex:1;display:grid;grid-template-columns:1fr 1.2fr 1fr;gap:20px;padding:20px 24px;overflow:hidden;}
@media(max-width:1300px){.trace-layout{grid-template-columns:1fr 1fr;}.trace-col-3{grid-column:1/-1;}}
@media(max-width:900px){.trace-layout{grid-template-columns:1fr;overflow-y:auto;}}
.trace-col{background:var(--surface-base);border:.5px solid rgba(0,105,110,.10);border-radius:var(--r-lg);padding:20px;overflow-y:auto;}
.trace-col-label{font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-subtle);margin-bottom:16px;}
.trace-sub-label{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--gold-500);margin:14px 0 6px;}
.trace-matn{font-size:19px;line-height:1.9;background:rgba(0,105,110,.05);border-radius:12px;padding:16px;margin-bottom:12px;}
.trace-trans{border-inline-start:3px solid var(--teal-700);padding-inline-start:12px;font-style:italic;line-height:1.7;color:var(--ink-body);}
.trace-narrator{font-size:12px;color:var(--ink-subtle);margin-top:8px;}
.trace-isnad-chain{list-style:none;padding:0;margin:0;}
.trace-isnad-node{padding:10px 12px;border-inline-start:2px dashed var(--ink-faint);margin-inline-start:6px;}
.trace-isnad-node[data-narrator-id]{cursor:pointer;}
.trace-isnad-name{display:block;font-weight:600;}
.trace-isnad-meta{display:block;font-size:12px;color:var(--ink-subtle);}
.trace-grade{border-radius:12px;padding:12px 14px;margin-bottom:12px;background:rgba(15,110,86,.10);}
.trace-grade.grade-unknown{background:rgba(0,105,110,.06);}
.trace-grade-label{display:block;font-weight:700;color:var(--grade-sahih);}
.trace-grade.grade-unknown .trace-grade-label{color:var(--ink-body);}
.trace-grade-grader{display:block;font-size:12px;color:var(--ink-subtle);margin-top:2px;}
.trace-commentary,.trace-related,.trace-qverses,.trace-topics{margin-top:10px;}
```

**IMPORTANT:** before committing, verify every `var(--…)` used above EXISTS in hadith.html's `:root` (grep each: `--surface-canvas`, `--surface-raised`, `--surface-base`, `--ink-subtle`, `--ink-faint`, `--ink-body`, `--teal-700`, `--gold-500`, `--grade-sahih`, `--r-lg`). If any is missing, substitute the nearest existing token (do NOT invent a hex). Report what you verified/substituted. (`--ink-body` is referenced by the demo already; if it is not in `:root`, use `--ink-primary` or the existing body text token.)

- [ ] **Step 3: Add the overlay markup** as a top-level sibling of the page shell (just before the closing `</body>`/script block, OUTSIDE `.main`), mirroring the Qur'an overlay structure but with hadith classes:

```html
<div class="trace-overlay" id="trace-overlay" role="dialog" aria-modal="true" aria-label="Hadith Trace View" hidden>
  <div class="trace-top">
    <div class="trace-bc" id="trace-breadcrumb"></div>
    <div class="trace-top-acts">
      <button class="trace-act" type="button" data-trace-act="bookmark" title="Bookmark" aria-label="Bookmark">🔖</button>
      <button class="trace-act" type="button" data-trace-act="share" title="Share" aria-label="Share">↗</button>
      <button class="trace-act" type="button" data-trace-act="copy" title="Copy with citation" aria-label="Copy with citation">📋</button>
      <button class="trace-exit" type="button" id="trace-exit">Exit Trace View →</button>
    </div>
  </div>
  <div class="trace-layout" id="trace-layout"></div>
</div>
```

- [ ] **Step 4: Add script includes** — after `narrator-panel.js` (line ~2039) and BEFORE `hadith.js` (so `II.traceViewCore` exists and `II.traceView` is defined before hadith.js `init()` runs). Add:
```html
<script src="src/js/trace-view-core.js"></script>
<script src="src/js/trace-view.js"></script>
```
Wait — `hadith.js` calls `II.traceView.init(...)`, so `trace-view.js` must load before `hadith.js`. Place BOTH new tags immediately before the `<script src="src/js/hadith.js"></script>` line.

- [ ] **Step 5: Verify** — open `hadith.html` in a browser: page renders, no console errors, the overlay is `hidden` (not visible), exactly one `.trace-layout` exists (grep). Run `cd worker && node --test "test/*.test.js"` → still green (unaffected).

- [ ] **Step 6: Commit**
```bash
git add hadith.html
git commit -m "feat(hadith): Module 14 — trace overlay markup + CSS; remove static demo (US-H18)"
```

---

## Task 3: `hadith-feed-core.js` — trace button in the card action row

**Files:** Modify `src/js/hadith-feed-core.js`, `worker/test/hadith-feed-core.test.js`

- [ ] **Step 1: Write the failing test** — append to `worker/test/hadith-feed-core.test.js` (match its existing import/fixture style; it already tests `buildCardHTML`):

```javascript
test('card action row includes a View-as-Trace button (data-act="trace")', () => {
  const html = core.buildCardHTML(/* use the file's existing sample-hadith fixture/helper */);
  assert.match(html, /data-act="trace"/);
  assert.match(html, /View as Trace|Trace/i);
});
```
(Open the file first to use its real `buildCardHTML` fixture — do not invent a new one.)

- [ ] **Step 2: Run** → FAIL (no trace button yet).

- [ ] **Step 3: Implement** — in `src/js/hadith-feed-core.js`, add a trace SVG const near the other `SVG_*` consts and add the button to the `.hadith-actions` row (after `copy-arabic`):

```javascript
var SVG_TRACE = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="6" y1="3" x2="6" y2="21"/><line x1="18" y1="3" x2="18" y2="21"/><rect x="3" y="3" width="18" height="18" rx="2"/></svg>';
```
and in the `.hadith-actions` string, add:
```javascript
              actionBtn('trace', 'View as Trace', SVG_TRACE) +
```

- [ ] **Step 4: Run** → PASS; full suite green.

- [ ] **Step 5: Commit**
```bash
git add src/js/hadith-feed-core.js worker/test/hadith-feed-core.test.js
git commit -m "feat(hadith): Module 14 — card action-row 'View as Trace' button"
```

---

## Task 4: `tier3-deep-view-core.js` — "View as Trace →" link in the deep-view header

**Files:** Modify `src/js/tier3-deep-view-core.js`, `worker/test/tier3-deep-view-core.test.js`

- [ ] **Step 1: Write the failing test** — append to `worker/test/tier3-deep-view-core.test.js`:

```javascript
test('deep-view header has a "View as Trace" link to /hadith/trace/{c}/{b}/{h}', () => {
  const r = { collection: 'sahih-bukhari', book: 1, hadith: 1 };
  const html = core.deepViewHTML(r, { name: 'Sahih al-Bukhari' }, bukhari(), {}); // reuse the file's bukhari() fixture
  assert.match(html, /href="\/hadith\/trace\/sahih-bukhari\/1\/1"/);
  assert.match(html, /View as Trace/i);
});
```
(Use the file's existing route/fixture helpers; confirm `deepViewHTML`'s real signature first.)

- [ ] **Step 2: Run** → FAIL.

- [ ] **Step 3: Implement** — in `tier3-deep-view-core.js`, add a trace link builder and include it in the `dv-header` (next to `actionButtonsHTML()`), using the resolved collection/book/hadith:

```javascript
  function traceLinkHTML(r, h) {
    var book = (h && h.bookNumber != null) ? h.bookNumber : r.book;
    var num = (h && h.hadithNumber != null) ? h.hadithNumber : r.hadith;
    var href = '/hadith/trace/' + encodeURIComponent(r.collection) + '/' + encodeURIComponent(book) + '/' + encodeURIComponent(num);
    return '<a class="dv-trace-link" href="' + href + '">View as Trace →</a>';
  }
```
and in `deepViewHTML`'s header string, change:
```javascript
      '<header class="dv-header">' + breadcrumbHTML(r, c, h) + actionButtonsHTML() + '</header>' +
```
to:
```javascript
      '<header class="dv-header">' + breadcrumbHTML(r, c, h) + traceLinkHTML(r, h) + actionButtonsHTML() + '</header>' +
```

- [ ] **Step 4: Run** → PASS; full suite green. (Optionally add a `.dv-trace-link` style in hadith.html in Task 2's CSS pass, or here — a plain teal link is fine; reuse existing link tokens.)

- [ ] **Step 5: Commit**
```bash
git add src/js/tier3-deep-view-core.js worker/test/tier3-deep-view-core.test.js
git commit -m "feat(hadith): Module 14 — 'View as Trace' link in deep-view header"
```

---

## Task 5: `trace-view.js` — DOM controller (open/close/focus trap/render/wire)

**Files:** Create `src/js/trace-view.js`

**Note:** DOM glue, no unit test (project convention). Verify via `node --check` + manual. Host-injected by `hadith.js` (Task 6).

- [ ] **Step 1: Write the controller** — Create `src/js/trace-view.js`:

```javascript
/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — trace-view.js  (Module 14)
   DOM controller for the 3-column Hadith Trace View overlay.
   Host-injected by hadith.js init(). Reuses II.ui.focusTrap + the
   bookmarks-panel Escape/focus-return pattern; ships live (no flag).
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var II = window.II || {};
  var core = II.traceViewCore;
  var host = null;          // { ui, fetchHadithByRef, onTraceBookmark, onTraceShare, onTraceCopy, exitTrace }
  var state = { open: false, viaRoute: false, ref: null, route: null, hadith: null, lastFocus: null };
  var untrap = function () {};

  function el(id) { return document.getElementById(id); }
  function overlay() { return el('trace-overlay'); }

  function onKey(e) { if (e.key === 'Escape' && state.open) { e.preventDefault(); close(); } }

  function wireActs() {
    var ov = overlay(); if (!ov || ov.dataset.wired) return;
    ov.dataset.wired = '1';
    if (II.ui && II.ui.focusTrap) untrap = II.ui.focusTrap(ov); // Tab-cycle (applied once)
    ov.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-trace-act], #trace-exit');
      if (!b) return;
      if (b.id === 'trace-exit') { close(); return; }
      var act = b.getAttribute('data-trace-act');
      if (!state.hadith || !host) return;
      if (act === 'bookmark') host.onTraceBookmark(state.hadith, b);
      else if (act === 'share') host.onTraceShare(state.hadith);
      else if (act === 'copy') host.onTraceCopy(state.hadith);
    });
  }

  function renderInto(hadith) {
    var bc = el('trace-breadcrumb'), layout = el('trace-layout');
    if (bc) bc.innerHTML = core.buildBreadcrumb(hadith);
    if (layout) layout.innerHTML = core.buildTraceHTML(hadith);
    // isnad rows with data-narrator-id are handled by the already-document-wired II.narratorPanelDom.
  }

  async function open(ref, opts) {
    opts = opts || {};
    if (!core || !host) return;
    wireActs();
    var hadith = opts.hadith || (host.fetchHadithByRef ? await host.fetchHadithByRef(ref) : null);
    var ov = overlay(); if (!ov) return;
    state.lastFocus = document.activeElement;
    state.open = true; state.viaRoute = !!opts.viaRoute; state.ref = ref; state.route = opts.route || null; state.hadith = hadith;
    if (hadith) renderInto(hadith);
    else { var l = el('trace-layout'); if (l) l.innerHTML = '<div class="dv-empty">This hadith could not be loaded. Please try again.</div>'; var bc = el('trace-breadcrumb'); if (bc) bc.textContent = ''; }
    ov.hidden = false; ov.classList.add('open');
    var main = document.querySelector('.main'); if (main) main.setAttribute('aria-hidden', 'true');
    document.addEventListener('keydown', onKey);
    var first = el('trace-exit'); if (first) first.focus();
  }

  function close(opts) {
    opts = opts || {};
    var ov = overlay();
    var exit = core ? core.resolveExitTarget({ viaRoute: state.viaRoute, route: state.route }) : { nav: false };
    if (ov) { ov.classList.remove('open'); ov.hidden = true; }
    var main = document.querySelector('.main'); if (main) main.removeAttribute('aria-hidden');
    document.removeEventListener('keydown', onKey);
    var lf = state.lastFocus;
    state.open = false; state.hadith = null; state.viaRoute = false; state.route = null; state.ref = null;
    // skipNav: caller (renderRoute reconcile during popstate) is ALREADY rendering the target,
    // so suppress exitTrace's redundant replaceState+renderRoute. The Exit button / Escape omit it.
    if (!opts.skipNav && exit.nav && host && host.exitTrace) host.exitTrace(exit.route); // route entry → sync URL to deep-view
    if (lf && lf.focus) { try { lf.focus(); } catch (_) {} }
  }

  function isOpen() { return state.open; }

  II.traceView = {
    init: function (h) { host = h; wireActs(); },
    open: open, close: close, isOpen: isOpen,
    _state: state,
  };
  window.II = II;
}());
```

- [ ] **Step 2: Syntax check** — `node --check src/js/trace-view.js` → clean. Full suite still green (not imported by tests).

- [ ] **Step 3: Commit**
```bash
git add src/js/trace-view.js
git commit -m "feat(hadith): Module 14 — trace-view DOM controller (overlay, focus trap, Escape, render)"
```

---

## Task 6: `hadith.js` — host handlers + init + card 'trace' wiring (card entry works)

**Files:** Modify `src/js/hadith.js`

**Note:** DOM glue in hadith.js is not unit-tested; verify via `node --check` + full suite + manual. After this task the **card-button overlay entry works end-to-end** (route entry is Task 7).

- [ ] **Step 1: Add trace host handlers** — near the other action handlers in `hadith.js` (after `onCopy`/`onShare`), add functions that reuse the Module 10/12 CORE via a hadith-object adapter:

```javascript
  // --- Module 14 Trace View host handlers (reuse hadith-actions core, read a hadith OBJECT) ---
  function refPartsToRoute(ref) { var r = parseRefParts(ref); return { collection: r.slug, book: r.book, hadith: r.num }; }

  async function fetchHadithByRef(ref) {
    if (!api || !api.fetchSingleHadith) return null;
    var r = parseRefParts(ref);
    try { var res = await api.fetchSingleHadith(r.slug, r.book, r.num); return (res && res.ok) ? res.data : null; }
    catch (_) { return null; }
  }
  function traceCopyContent(hadith) {
    var ref = hadith && (hadith.reference || (hadith.id));
    // canonical source URL from the hadith's own identifiers (never location.origin)
    var url = SITE + routePath({ collection: hadith.collectionSlug, book: hadith.bookNumber, hadith: hadith.hadithNumber });
    return II.traceViewCore.buildCopyContent(hadith, url);
  }
  function onTraceCopy(hadith) {
    if (!actions || !hadith) return;
    var text = actions.buildCopyText(traceCopyContent(hadith));
    if (!text) { ui.showToast('Nothing to copy'); return; }
    copyToClipboard(text, 'Copied with citation ✦');
  }
  function onTraceShare(hadith) {
    if (!hadith) return;
    var content = traceCopyContent(hadith);
    if (navigator.share) { navigator.share({ title: 'Hadith · ' + (content.reference || 'IslamicInfo.org'), text: (actions ? actions.buildCopyText(content) : ''), url: content.sourceUrl }).catch(function () {}); }
    else if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(content.sourceUrl).then(function () { ui.showToast('Link copied'); }, function () { ui.showToast('Couldn’t copy link'); }); }
    else { ui.showToast('Sharing isn’t supported in this browser'); }
  }
  function onTraceBookmark(hadith, btn) {
    if (!actions || !hadith) return;
    var ref = hadith.reference || hadith.id;
    var res = actions.toggleBookmark(getBookmarks(), { ref: ref, collectionSlug: hadith.collectionSlug, bookNum: hadith.bookNumber, hadithNum: hadith.hadithNumber }, Date.now());
    setBookmarks(res.list);
    if (btn) btn.classList.toggle('active', res.added);
    ui.showToast(res.added ? 'Bookmarked ✦' : 'Bookmark removed');
  }
  function exitTrace(route) { try { history.replaceState(route, '', routePath(route)); } catch (_) {} renderRoute(route); }
```

(Confirm `parseRefParts`, `SITE`, `getBookmarks`, `setBookmarks`, `copyToClipboard`, `routePath` are all in scope in hadith.js — they are, per recon. If `hadith.id` isn't the right ref for `toggleBookmark`, use `hadith.reference`.)

- [ ] **Step 2: Register the trace view in `init()`** — after the `II.narratorPanelDom` block, add:

```javascript
    if (II.traceView && II.traceView.init) {
      II.traceView.init({ ui: ui, fetchHadithByRef: fetchHadithByRef,
        onTraceBookmark: onTraceBookmark, onTraceShare: onTraceShare, onTraceCopy: onTraceCopy, exitTrace: exitTrace });
    }
```

- [ ] **Step 3: Wire the card 'trace' button** — in `wireCardActions()`, add `'trace'` to the allowed acts and dispatch to the overlay (no route change):

```javascript
      if (act !== 'bookmark' && act !== 'note' && act !== 'listen' && act !== 'share' &&
          act !== 'copy' && act !== 'copy-arabic' && act !== 'trace') return;
      ...
      else if (act === 'trace') { if (II.traceView) II.traceView.open(ref, { viaRoute: false }); }
```

- [ ] **Step 4: Verify** — `node --check src/js/hadith.js` clean; `cd worker && node --test "test/*.test.js"` green. Manual: open the app, click a card's ✦-trace button → overlay opens with matn/grade real + honest states; 🔖/↗/📋 work; Exit/Escape closes back to the feed with focus returned to the trigger.

- [ ] **Step 5: Commit**
```bash
git add src/js/hadith.js
git commit -m "feat(hadith): Module 14 — trace host handlers + card overlay entry (reuses actions core)"
```

---

## Task 7: `hadith.js` — routing branch (route entry + Exit + popstate)

**Files:** Modify `src/js/hadith.js`

**Note:** After this task the **route entry `/hadith/trace/...` works** (deep-view "View as Trace →" link + fresh deep-link + Exit-to-deep-view + Back button).

- [ ] **Step 1: `parseRoute` — add a trace branch FIRST** (a 4-segment path won't match the existing 3-segment regex). At the top of `parseRoute`, before the existing `.match`, add:

```javascript
    var t = path.match(/^\/hadith\/trace\/([^\/?#]+)\/([^\/?#]+)\/([^\/?#]+)\/?$/);
    if (t) return { trace: true, collection: t[1], book: t[2], hadith: t[3] };
```
(The existing return objects gain an implicit `trace: undefined` — harmless.)

- [ ] **Step 2: `routePath` — handle trace**:
```javascript
    if (r && r.trace && r.collection) {
      return '/hadith/trace/' + encodeURIComponent(r.collection) + '/' + encodeURIComponent(r.book) + '/' + encodeURIComponent(r.hadith);
    }
```
(add near the top of `routePath`.)

- [ ] **Step 3: `renderRoute` — trace branch + overlay reconcile.** At the START of `renderRoute` (after `r = r || parseRoute();`), add:

```javascript
    if (r.trace) {
      var tc = collectionBySlug(r.collection);
      if (!tc) { setTier(1); applyFilter(); try { history.replaceState(null, '', '/hadith.html'); } catch (_) {} return; }
      // render the deep-view UNDERNEATH first, then open the overlay on top
      if (II.tier3) II.tier3.renderDeepView({ collection: r.collection, book: r.book, hadith: r.hadith }, tc);
      if (II.traceView) II.traceView.open((r.collection + ':' + r.book + ':' + r.hadith), { viaRoute: true, route: { collection: r.collection, book: r.book, hadith: r.hadith } });
      return;
    }
    // Navigating to a NON-trace route while the overlay is open (e.g. Back button/popstate):
    // hide the overlay but pass skipNav — renderRoute is ALREADY rendering the target, so
    // exitTrace's replaceState+renderRoute must not fire (would double-render / fight history).
    if (II.traceView && II.traceView.isOpen && II.traceView.isOpen()) { II.traceView.close({ skipNav: true }); }
```

**Ref format note:** `II.traceView.open` passes `ref` to `fetchHadithByRef` → `parseRefParts(ref)`. Confirm `parseRefParts` accepts the `"{slug}:{book}:{num}"` form (it is the `hadith.id` format from the adapter). If `parseRefParts` expects a different shape (e.g. the card's `data-ref`), pass whatever `parseRefParts` accepts — inspect `parseRefParts` and match it exactly. The route already has `{collection,book,hadith}`, so if `fetchHadithByRef` is simpler to call with those parts, add an overload `fetchHadithByParts(slug,book,num)` and have `open` accept `{route}` to fetch by parts. Pick the form that matches the REAL `parseRefParts`/`fetchSingleHadith` contract; do not guess.

- [ ] **Step 4: Verify the wireRouting interception already covers `/hadith/trace/...`** — the existing `wireRouting` matches `/^\/hadith(\/|$)/`, so the deep-view `<a href="/hadith/trace/...">` is intercepted → `routeTo(parseRoute(href), true)` → pushState + `renderRoute` (trace branch). No change to `wireRouting` needed. Confirm by reading it.

- [ ] **Step 5: Verify** — `node --check src/js/hadith.js` clean; full suite green. Manual, all three route flows:
  1. On a deep-view page, click "View as Trace →" → URL becomes `/hadith/trace/{c}/{b}/{h}`, overlay opens over the deep-view; Exit → URL back to `/hadith/{c}/{b}/{h}`, deep-view shown, focus restored.
  2. Fresh load / refresh of `/hadith/trace/{c}/{b}/{h}` (via the 404.html redirect) → deep-view renders underneath, overlay opens; Exit reveals the deep-view.
  3. Browser Back from an in-app-opened trace → overlay closes, deep-view shown.
  Record which flows you could verify in-environment (the feed/deep-view need the Worker/hadithapi to be reachable — if data can't load here, say so and mark browser verification of the live flows as outstanding, like prior hadith modules).

- [ ] **Step 6: Commit**
```bash
git add src/js/hadith.js
git commit -m "feat(hadith): Module 14 — /hadith/trace route branch + Exit + popstate reconcile"
```

---

## Task 8: `doc/DECISIONS.md` — ships-live decision

**Files:** Modify `doc/DECISIONS.md`

- [ ] **Step 1: Match the file's ADR format** (open it; continue from the highest existing number — Module 13 added through ADR-035, so this is likely **ADR-036**). Append one entry:

> **ADR-036 · Hadith Trace View ships live (no runtime flag) · Accepted · 2026-07-22**
> **Context.** Module 13 (hadith AI explanation) shipped behind `HADITH_AI_EXPLAIN_ENABLED=false` pending human sign-off, because it generates Islamic content at runtime via an LLM. Module 14 (Trace View) is different in kind.
> **Decision.** Trace View ships live, with both entry points (route + card overlay) visible on merge. **Rationale:** it authors no content and runs no LLM — it reformats already-authenticated matn/grade and renders honest "not yet available" states for all absent data (isnad, Ibn Hajar/an-Nawawi commentary, related narrations/verses, topics). The residual risk is assistive-tech behavior on a REUSED, production-proven focus mechanism (`II.ui.focusTrap` + the bookmarks-panel Escape/focus-return pattern), not content correctness, so a content-style review gate does not apply.
> **Consequences.** Manual VoiceOver + NVDA verification of the focus trap (DoD-13) is an explicit OUTSTANDING QA item — tracked and never marked done until a human runs it. No fabricated scholar commentary ships (honest-empty boxes only).
> **References.** `docs/superpowers/specs/2026-07-22-module-14-hadith-trace-view-design.md`; `docs/superpowers/plans/2026-07-22-module-14-hadith-trace-view.md`.

- [ ] **Step 2: Commit**
```bash
git add doc/DECISIONS.md
git commit -m "docs(hadith): Module 14 — ADR ships-live rationale (no flag), AT verification outstanding"
```

---

## Task 9: Full suite + automated a11y + DoD / verification doc

**Files:** Create `docs/superpowers/specs/2026-07-22-module-14-verification.md`

- [ ] **Step 1: Run the full suite** — `cd worker && node --test "test/*.test.js"` — record literal totals. Note the Module 14 test additions (trace-view-core, hadith-feed-core, tier3-deep-view-core).

- [ ] **Step 2: Automated a11y check (best-effort).** If an automated a11y tool (axe-core, pa11y) is available in-environment, run it against the overlay open state and record the literal result. If NONE is available, state that plainly — do not claim an a11y pass that wasn't run.

- [ ] **Step 3: Write `docs/superpowers/specs/2026-07-22-module-14-verification.md`** with:
  - **A. Automated tests:** literal suite totals + the honesty/escaping assertions that passed in `trace-view-core.test.js` (ruling-free, both commentary boxes honest-empty, no fabricated isnad/topics/qverses, XSS-escaped).
  - **B. DoD checklist** mapped to evidence: 3-column layout (not 4) ✓ code; both entry points ✓ (note which were browser-verifiable here vs outstanding if data couldn't load); honest states / no fabricated commentary ✓ (unit-proven); `.trace-act` reuse of buildCopyText ✓; focus trap built on proven blocks ✓ code; automated a11y result (or "not runnable here"); **manual VoiceOver + NVDA — OUTSTANDING QA, not done**; 1 ADR entry ✓.
  - **C. Verification note (required):** state EXACTLY which screen readers (if any) were testable in this environment — if none, say so and flag manual AT focus-trap verification as an outstanding QA task, per the module brief. Do not mark DoD-13 done.

- [ ] **Step 4: Commit**
```bash
git add docs/superpowers/specs/2026-07-22-module-14-verification.md
git commit -m "docs(hadith): Module 14 — verification + DoD (manual AT flagged outstanding, US-H18)"
```

---

## Self-review notes for the implementer

- **Never fabricate scholar commentary.** The Ibn Hajar / an-Nawawi boxes and every absent section emit ONLY the honest strings in `trace-view-core.js`. If a task tempts you to add scholar prose, stop.
- **Do not rebuild** the narrator panel, action handlers, or focus-trap helper — reuse them. `.trace-act` buttons reuse `actions.buildCopyText` via `traceCopyContent`.
- **3 columns, not 4** (FIX-3 settled).
- **Token safety:** every `var(--…)` in the CSS must already exist in hadith.html; substitute the nearest real token, never invent a hex.
- **Ref/parseRoute contract:** verify `parseRefParts` and `fetchSingleHadith` shapes against the real code before finalizing Task 6/7 — pass the form they actually accept.
- **Do not flip anything to production-deploy the Worker** — this module is client-only; no Worker change.
```
