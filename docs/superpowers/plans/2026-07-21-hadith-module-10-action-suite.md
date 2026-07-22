# Hadith Module 10 — Per-Hadith Action Suite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire Bookmark, Notes, Audio (honest-unavailable), and tier-aware Verify/Ask sidebar CTAs to the shared hadith card component (Tier-1 feed + Tier-3a list) + sidebar.

**Architecture:** New pure `hadith-actions-core.js` (UMD, unit-tested) holds all testable bookmark/note/category/URL logic. `hadith.js` does DOM wiring via a document-delegated handler on `.hadith-card`. `hadith-feed-core.js` gains one `data-act="note"` header button. Reuses existing `ui.safeLocalStorage*` (QuotaExceededError already handled), `ui.showToast`, `ui.focusTrap`, and Module 9's `pulseRing`. Net-new UI (panel/note-editor/audio-mini) built from locked design-system tokens.

**Tech Stack:** Vanilla ES5-style IIFE JS (matches existing `-core.js` + `hadith.js`), `node:test`/`assert` unit tests run from `worker/`, static HTML/CSS with design-system tokens.

**Spec:** `docs/superpowers/specs/2026-07-21-hadith-module-10-action-suite-design.md`

**Branch:** `feat/hadith-module-10-action-suite` (already created).

---

## File Structure

| File | Responsibility |
|---|---|
| `src/js/hadith-actions-core.js` | **NEW** — pure bookmark/note/category/CTA-URL logic (UMD `II.hadithActions`). |
| `worker/test/hadith-actions-core.test.js` | **NEW** — unit tests for the core. |
| `src/js/hadith-feed-core.js` | **MODIFY** — add `data-act="note"` header button. |
| `worker/test/hadith-feed-core.test.js` | **MODIFY** — assert note button renders. |
| `hadith.html` | **MODIFY** — load core; add CSS (gold dot, note-editor, audio-mini, panel, cat-tooltip); bookmarks-panel + backdrop markup; sidebar "My Bookmarks" trigger; CTA ids (drop inline onclick). |
| `src/js/hadith.js` | **MODIFY** — storage helpers, gold-dot on render, delegated bookmark/note/listen handler, category tooltip, note editor, audio-unavailable player, bookmarks panel, tier-aware CTAs. |
| `tools/hadith-module10-fixture.html` | **NEW (throwaway)** — local harness to screenshot the 3 net-new components. |

---

## Task 1: Core — bookmark toggle/dedupe/build/setCategory (TDD)

**Files:**
- Create: `src/js/hadith-actions-core.js`
- Test: `worker/test/hadith-actions-core.test.js`

- [ ] **Step 1: Write the failing test**

Create `worker/test/hadith-actions-core.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert';
import core from '../../src/js/hadith-actions-core.js';

const entry = (over = {}) => Object.assign(
  { ref: 'sahih-bukhari:1:1', collectionSlug: 'sahih-bukhari', bookNum: 1, hadithNum: 1 }, over);

test('toggleBookmark: adds when absent, sets added:true', () => {
  const { list, added } = core.toggleBookmark([], entry(), 100);
  assert.equal(added, true);
  assert.equal(list.length, 1);
  assert.equal(list[0].ref, 'sahih-bukhari:1:1');
  assert.equal(list[0].category, 'General');
  assert.equal(list[0].createdAt, 100);
});

test('toggleBookmark: idempotent — second toggle removes (added:false)', () => {
  const first = core.toggleBookmark([], entry(), 100);
  const second = core.toggleBookmark(first.list, entry(), 200);
  assert.equal(second.added, false);
  assert.equal(second.list.length, 0);
});

test('dedupeByRef: drops duplicate refs, keeps first', () => {
  const out = core.dedupeByRef([entry({ category: 'A' }), entry({ category: 'B' }), null]);
  assert.equal(out.length, 1);
  assert.equal(out[0].category, 'A');
});

test('setCategory: updates matching ref only', () => {
  const list = [core.buildBookmark(entry(), 0), core.buildBookmark(entry({ ref: 'x:0:9', hadithNum: 9 }), 0)];
  const out = core.setCategory(list, 'sahih-bukhari:1:1', 'Reflection');
  assert.equal(core.getBookmarkCategory(out, 'sahih-bukhari:1:1'), 'Reflection');
  assert.equal(core.getBookmarkCategory(out, 'x:0:9'), 'General');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd worker && node --test test/hadith-actions-core.test.js`
Expected: FAIL — `Cannot find module '../../src/js/hadith-actions-core.js'`.

- [ ] **Step 3: Write minimal implementation**

Create `src/js/hadith-actions-core.js`:

```js
/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — hadith-actions-core.js  (Module 10)
   Pure, framework-free bookmark + note + category + CTA-URL logic for the
   per-hadith action suite. UMD (window.II.hadithActions in the browser;
   module.exports in tests). NO DOM, NO network, NO localStorage — all I/O
   is done by hadith.js. Keys (registered in doc/DATA.md §2):
   islamicinfo-hadith-bookmarks (HadithBookmark[]), islamicinfo-hadith-notes.
   Custom categories are DERIVED from bookmarks in use (no separate key).
   ═══════════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  var BUILTIN_CATEGORIES = ['General', 'For Memorisation', 'Reflection', 'To Verify'];
  var MAX_CUSTOM = 5;
  var MAX_NOTE = 2000;

  function isBuiltin(cat) { return BUILTIN_CATEGORIES.indexOf(cat) !== -1; }

  function buildBookmark(entry, now) {
    entry = entry || {};
    return {
      ref: entry.ref,
      collectionSlug: entry.collectionSlug || null,
      bookNum: (entry.bookNum == null ? null : entry.bookNum),
      hadithNum: (entry.hadithNum == null ? null : entry.hadithNum),
      category: entry.category || 'General',
      createdAt: (typeof now === 'number' ? now : 0),
    };
  }

  function indexOfRef(list, ref) {
    for (var i = 0; i < list.length; i++) { if (list[i] && list[i].ref === ref) return i; }
    return -1;
  }

  function dedupeByRef(list) {
    var seen = {}, out = [];
    (Array.isArray(list) ? list : []).forEach(function (b) {
      if (!b || !b.ref || seen[b.ref]) return;
      seen[b.ref] = 1; out.push(b);
    });
    return out;
  }

  // Idempotent: present → remove; absent → add. Returns { list, added }.
  function toggleBookmark(list, entry, now) {
    var arr = dedupeByRef(list);
    var i = indexOfRef(arr, entry.ref);
    if (i !== -1) { arr.splice(i, 1); return { list: arr, added: false }; }
    arr.push(buildBookmark(entry, now));
    return { list: arr, added: true };
  }

  function setCategory(list, ref, category) {
    var arr = dedupeByRef(list);
    var i = indexOfRef(arr, ref);
    if (i !== -1) arr[i] = Object.assign({}, arr[i], { category: category });
    return arr;
  }

  function getBookmarkCategory(list, ref) {
    var i = indexOfRef(Array.isArray(list) ? list : [], ref);
    return i !== -1 ? list[i].category : null;
  }

  var core = {
    BUILTIN_CATEGORIES: BUILTIN_CATEGORIES, MAX_CUSTOM: MAX_CUSTOM, MAX_NOTE: MAX_NOTE,
    isBuiltin: isBuiltin, buildBookmark: buildBookmark, dedupeByRef: dedupeByRef,
    toggleBookmark: toggleBookmark, setCategory: setCategory, getBookmarkCategory: getBookmarkCategory,
  };

  if (typeof module !== 'undefined' && module.exports) { module.exports = core; }
  else { root.II = root.II || {}; root.II.hadithActions = core; }

}(typeof globalThis !== 'undefined' ? globalThis : window));
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd worker && node --test test/hadith-actions-core.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/js/hadith-actions-core.js worker/test/hadith-actions-core.test.js
git commit -m "feat(hadith): Module 10 — bookmark core (toggle/dedupe/category)"
```

---

## Task 2: Core — categories (customs derive/cap) + panel filter (TDD)

**Files:**
- Modify: `src/js/hadith-actions-core.js`
- Test: `worker/test/hadith-actions-core.test.js`

- [ ] **Step 1: Add failing tests** (append to the test file):

```js
test('customCategoriesOf: distinct non-builtins in use', () => {
  const list = [
    core.buildBookmark({ ref: 'a:0:1', category: 'General' }, 0),
    core.buildBookmark({ ref: 'a:0:2', category: 'Fiqh' }, 0),
    core.buildBookmark({ ref: 'a:0:3', category: 'Fiqh' }, 0),
  ];
  assert.deepEqual(core.customCategoriesOf(list), ['Fiqh']);
});

test('addCustomCategory: rejects a 6th distinct custom (max 5)', () => {
  let list = [];
  ['c1','c2','c3','c4','c5'].forEach((name, i) => {
    list = list.concat(core.buildBookmark({ ref: 'a:0:' + i, category: name }, 0));
  });
  const res = core.addCustomCategory(list, 'c6');
  assert.equal(res.ok, false);
  assert.equal(res.customs.length, 5);
});

test('addCustomCategory: existing custom is ok (no new slot consumed)', () => {
  const list = [core.buildBookmark({ ref: 'a:0:1', category: 'Fiqh' }, 0)];
  const res = core.addCustomCategory(list, 'Fiqh');
  assert.equal(res.ok, true);
});

test('addCustomCategory: blank or builtin name rejected', () => {
  assert.equal(core.addCustomCategory([], '  ').ok, false);
  assert.equal(core.addCustomCategory([], 'General').ok, false);
});

test('panelFilter: all returns everything; a category filters', () => {
  const list = [
    core.buildBookmark({ ref: 'a:0:1', category: 'General' }, 0),
    core.buildBookmark({ ref: 'a:0:2', category: 'Reflection' }, 0),
  ];
  assert.equal(core.panelFilter(list, 'all').length, 2);
  assert.equal(core.panelFilter(list, 'Reflection').length, 1);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `cd worker && node --test test/hadith-actions-core.test.js`
Expected: FAIL — `core.customCategoriesOf is not a function`.

- [ ] **Step 3: Implement** — add these functions before the `var core = {` block, and add them to the exports object:

```js
  function customCategoriesOf(list) {
    var seen = {}, out = [];
    (Array.isArray(list) ? list : []).forEach(function (b) {
      if (!b || !b.category || isBuiltin(b.category)) return;
      if (!seen[b.category]) { seen[b.category] = 1; out.push(b.category); }
    });
    return out;
  }

  // Returns { ok, customs }. ok:false when name blank/builtin, or 5 distinct customs already in use.
  function addCustomCategory(list, name) {
    var customs = customCategoriesOf(list);
    name = (name == null ? '' : String(name)).trim();
    if (!name || isBuiltin(name)) return { ok: false, customs: customs };
    if (customs.indexOf(name) !== -1) return { ok: true, customs: customs };
    if (customs.length >= MAX_CUSTOM) return { ok: false, customs: customs };
    return { ok: true, customs: customs.concat([name]) };
  }

  function panelFilter(list, category) {
    var arr = dedupeByRef(list);
    if (!category || category === 'all') return arr;
    return arr.filter(function (b) { return b.category === category; });
  }
```

Add to exports: `customCategoriesOf: customCategoriesOf, addCustomCategory: addCustomCategory, panelFilter: panelFilter,`

- [ ] **Step 4: Run to verify pass**

Run: `cd worker && node --test test/hadith-actions-core.test.js`
Expected: PASS (9 tests).

- [ ] **Step 5: Commit**

```bash
git add src/js/hadith-actions-core.js worker/test/hadith-actions-core.test.js
git commit -m "feat(hadith): Module 10 — derived custom categories (max 5) + panel filter"
```

---

## Task 3: Core — notes (clamp/build/get/upsert) (TDD)

**Files:**
- Modify: `src/js/hadith-actions-core.js`
- Test: `worker/test/hadith-actions-core.test.js`

- [ ] **Step 1: Add failing tests** (append):

```js
test('clampNoteText: caps at 2000 chars', () => {
  assert.equal(core.clampNoteText('x'.repeat(2500)).length, 2000);
});

test('upsertNote: inserts then replaces by hadithRef', () => {
  let list = core.upsertNote([], core.buildNote('a:0:1', 'first', 10));
  assert.equal(list.length, 1);
  list = core.upsertNote(list, core.buildNote('a:0:1', 'second', 20));
  assert.equal(list.length, 1);
  assert.equal(core.getNote(list, 'a:0:1').text, 'second');
});

test('upsertNote: empty text removes the note', () => {
  let list = core.upsertNote([], core.buildNote('a:0:1', 'hi', 10));
  list = core.upsertNote(list, core.buildNote('a:0:1', '', 20));
  assert.equal(list.length, 0);
  assert.equal(core.getNote(list, 'a:0:1'), null);
});

test('buildNote: clamps text and stamps updatedAt', () => {
  const n = core.buildNote('a:0:1', 'y'.repeat(3000), 55);
  assert.equal(n.hadithRef, 'a:0:1');
  assert.equal(n.text.length, 2000);
  assert.equal(n.updatedAt, 55);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `cd worker && node --test test/hadith-actions-core.test.js`
Expected: FAIL — `core.clampNoteText is not a function`.

- [ ] **Step 3: Implement** — add before the `var core = {` block and to exports:

```js
  function clampNoteText(s) { return String(s == null ? '' : s).slice(0, MAX_NOTE); }

  function buildNote(ref, text, now) {
    return { hadithRef: ref, text: clampNoteText(text), updatedAt: (typeof now === 'number' ? now : 0) };
  }

  function getNote(list, ref) {
    var arr = Array.isArray(list) ? list : [];
    for (var i = 0; i < arr.length; i++) { if (arr[i] && arr[i].hadithRef === ref) return arr[i]; }
    return null;
  }

  // Upsert by hadithRef; a note whose text is empty is removed (a cleared note is not stored).
  function upsertNote(list, note) {
    var arr = (Array.isArray(list) ? list : []).filter(function (n) { return n && n.hadithRef !== note.hadithRef; });
    if (note.text && note.text.length) arr.push(note);
    return arr;
  }
```

Add to exports: `clampNoteText: clampNoteText, buildNote: buildNote, getNote: getNote, upsertNote: upsertNote,`

- [ ] **Step 4: Run to verify pass**

Run: `cd worker && node --test test/hadith-actions-core.test.js`
Expected: PASS (13 tests).

- [ ] **Step 5: Commit**

```bash
git add src/js/hadith-actions-core.js worker/test/hadith-actions-core.test.js
git commit -m "feat(hadith): Module 10 — note core (clamp 2000, upsert/get)"
```

---

## Task 4: Core — tier-aware Ask CTA URL (TDD)

**Files:**
- Modify: `src/js/hadith-actions-core.js`
- Test: `worker/test/hadith-actions-core.test.js`

- [ ] **Step 1: Add failing tests** (append):

```js
test('buildAskUrl: Tier 1 (no hadith in route) → empty verify.html', () => {
  assert.equal(core.buildAskUrl({ collection: null }, null), 'verify.html');
});

test('buildAskUrl: Tier 3 with matn → prefilled q/ref/mode=claim', () => {
  const url = core.buildAskUrl(
    { collection: 'sahih-bukhari', book: 1, hadith: 1 },
    { translation: { text: 'The reward of deeds...' }, reference: 'Sahih al-Bukhari · Book 1 · Hadith 1' });
  assert.ok(url.indexOf('verify.html?') === 0);
  assert.ok(url.indexOf('q=' + encodeURIComponent('The reward of deeds...')) !== -1);
  assert.ok(url.indexOf('ref=' + encodeURIComponent('Sahih al-Bukhari · Book 1 · Hadith 1')) !== -1);
  assert.ok(url.indexOf('mode=claim') !== -1);
});

test('buildAskUrl: Tier 3 route but no resolvable matn → empty verify.html', () => {
  assert.equal(core.buildAskUrl({ collection: 'x', book: 1, hadith: 5 }, null), 'verify.html');
});

test('buildAskUrl: falls back to arabicMatn when translation missing', () => {
  const url = core.buildAskUrl({ collection: 'x', book: 1, hadith: 5 }, { arabicMatn: 'نص' });
  assert.ok(url.indexOf('q=' + encodeURIComponent('نص')) !== -1);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `cd worker && node --test test/hadith-actions-core.test.js`
Expected: FAIL — `core.buildAskUrl is not a function`.

- [ ] **Step 3: Implement** — add before the `var core = {` block and to exports:

```js
  // Tier-aware "Ask a Question" target. Tier 3 (route.hadith present) with a resolvable
  // matn → verify.html prefill (?q=&ref=&mode=claim, matching verify.html's real handoff
  // contract at verify.html:1036). Otherwise → empty verify.html (Tier 1 focus behavior).
  function buildAskUrl(route, hadith) {
    var onTier3 = !!(route && route.hadith);
    var matn = hadith && ((hadith.translation && hadith.translation.text) || hadith.arabicMatn);
    if (!onTier3 || !matn) return 'verify.html';
    var ref = (hadith && hadith.reference) || '';
    var qs = 'q=' + encodeURIComponent(matn) + (ref ? '&ref=' + encodeURIComponent(ref) : '') + '&mode=claim';
    return 'verify.html?' + qs;
  }
```

Add to exports: `buildAskUrl: buildAskUrl,`

- [ ] **Step 4: Run to verify pass**

Run: `cd worker && node --test test/hadith-actions-core.test.js`
Expected: PASS (17 tests).

- [ ] **Step 5: Commit**

```bash
git add src/js/hadith-actions-core.js worker/test/hadith-actions-core.test.js
git commit -m "feat(hadith): Module 10 — tier-aware Ask CTA url builder"
```

---

## Task 5: feed-core — add `data-act="note"` header button (TDD)

**Files:**
- Modify: `src/js/hadith-feed-core.js:148-152` (header actions) + add `SVG_NOTE`
- Test: `worker/test/hadith-feed-core.test.js`

- [ ] **Step 1: Add failing test** (append to `worker/test/hadith-feed-core.test.js`):

```js
test('buildCardHTML: renders a data-act="note" header button between bookmark and share', () => {
  const html = core.buildCardHTML(bukhari());
  assert.ok(html.indexOf('data-act="note"') !== -1, 'note button present');
  // order: bookmark then note then share
  assert.ok(html.indexOf('data-act="bookmark"') < html.indexOf('data-act="note"'));
  assert.ok(html.indexOf('data-act="note"') < html.indexOf('data-act="share"'));
});
```

- [ ] **Step 2: Run to verify failure**

Run: `cd worker && node --test test/hadith-feed-core.test.js`
Expected: FAIL — `note button present`.

- [ ] **Step 3: Implement**

In `src/js/hadith-feed-core.js`, after the `SVG_BOOKMARK` declaration (line ~114) add:

```js
  var SVG_NOTE = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
```

In `buildCardHTML`, change the header actions block (currently `actionBtn('bookmark'...) + actionBtn('share'...) + actionBtn('copy'...)`) to insert note after bookmark:

```js
            '<div class="hadith-actions">' +
              actionBtn('bookmark', 'Bookmark', SVG_BOOKMARK) +
              actionBtn('note', 'Add a private note', SVG_NOTE) +
              actionBtn('share', 'Share', SVG_SHARE) +
              actionBtn('copy', 'Copy with attribution', SVG_COPY) +
            '</div>' +
```

- [ ] **Step 4: Run to verify pass**

Run: `cd worker && node --test test/hadith-feed-core.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/js/hadith-feed-core.js worker/test/hadith-feed-core.test.js
git commit -m "feat(hadith): Module 10 — add note button to card header (Bookmark/Note/Share/Copy)"
```

---

## Task 6: hadith.html — load core, CSS, panel markup, CTA ids (node --check via browser)

**Files:**
- Modify: `hadith.html` (script load ~line 1916; CSS in `<style>`; panel markup near sidebar; CTA block 1096-1108; sidebar trigger)

- [ ] **Step 1: Load the core** — after `<script src="src/js/reading-progress-core.js"></script>` (line 1916) add:

```html
<script src="src/js/hadith-actions-core.js"></script>
```

- [ ] **Step 2: Add CSS** — inside the page `<style>` block (append near the other hadith component styles). Uses locked tokens only (no raw hex, no new colors):

```css
/* ── Module 10: gold dot on bookmarked/noted cards ── */
.hadith-card.has-bookmark .hadith-num::after,
.hadith-card.has-note .hadith-num::after {
  content: ""; display: inline-block; width: 6px; height: 6px; border-radius: 50%;
  background: var(--gold-500); margin-left: 6px; vertical-align: middle;
}
.hadith-action-btn.active { color: var(--gold-500); }

/* ── Module 10: note editor (sibling below card) ── */
.note-editor { background: var(--surface-base); border: 0.5px solid rgba(0,105,110,.14);
  border-radius: 12px; box-shadow: var(--elev-1); padding: 14px; margin: -6px 0 16px; }
.note-textarea { width: 100%; min-height: 72px; resize: vertical; font: inherit;
  color: var(--ink-body); background: transparent; border: 0.5px solid rgba(0,105,110,.18);
  border-radius: 8px; padding: 10px; box-sizing: border-box; }
.note-editor-actions { display: flex; align-items: center; gap: 10px; margin-top: 10px; }
.note-count { font-size: 12px; color: var(--ink-muted); margin-right: auto; }

/* ── Module 10: audio mini-player (unavailable-only state) ── */
.audio-mini-player { background: var(--surface-base); border: 0.5px solid rgba(0,105,110,.14);
  border-radius: 12px; padding: 12px 14px; margin: -6px 0 16px; }
.amp-controls { display: flex; align-items: center; gap: 12px; opacity: .5; }
.amp-play { width: 34px; height: 34px; border-radius: 50%; border: none; background: var(--teal-700);
  color: #fff; cursor: not-allowed; }
.amp-progress { flex: 1; height: 4px; border-radius: 2px; background: rgba(0,105,110,.15); }
.amp-progress-fill { width: 0; height: 100%; border-radius: 2px; background: var(--teal-700); }
.amp-speed { font-size: 12px; color: var(--ink-muted); }
.amp-unavailable { margin-top: 8px; font-size: 12.5px; color: var(--ink-muted); }

/* ── Module 10: bookmarks panel (slide from right) ── */
.bm-backdrop { display: none; position: fixed; inset: 0; background: rgba(0,0,0,.28); z-index: 90; }
.bm-panel { position: fixed; top: 0; right: 0; height: 100%; width: min(380px, 92vw);
  background: var(--surface-base); box-shadow: var(--elev-3); z-index: 91;
  transform: translateX(100%); transition: transform .28s ease; display: flex; flex-direction: column; }
.bm-panel.open { transform: translateX(0); }
@media (prefers-reduced-motion: reduce) { .bm-panel { transition: none; } }
.bm-panel-head { display: flex; align-items: center; justify-content: space-between;
  padding: 16px; border-bottom: 0.5px solid rgba(0,105,110,.1); }
.bm-panel-title { font-weight: 600; color: var(--teal-700); }
.bm-chips { display: flex; flex-wrap: wrap; gap: 6px; padding: 12px 16px; }
.bm-chip { font-size: 12px; padding: 4px 10px; border-radius: 999px; cursor: pointer;
  border: 0.5px solid rgba(0,105,110,.2); background: transparent; color: var(--ink-body); }
.bm-chip.on { background: var(--teal-700); color: #fff; border-color: var(--teal-700); }
.bm-list { overflow-y: auto; padding: 0 12px 16px; flex: 1; }
.bm-row { display: flex; align-items: center; gap: 8px; padding: 10px;
  border-bottom: 0.5px solid rgba(0,105,110,.08); }
.bm-row-main { flex: 1; min-width: 0; }
.bm-row-title { font-size: 13.5px; color: var(--ink-body); }
.bm-row-cat { font-size: 11.5px; color: var(--ink-muted); margin-top: 2px; }
.bm-jump, .bm-remove { border: none; background: transparent; cursor: pointer;
  color: var(--teal-700); font-size: 15px; padding: 4px 6px; }
.bm-remove { color: var(--ink-muted); }
.bm-empty { padding: 28px 12px; text-align: center; color: var(--ink-muted); }

/* ── Module 10: category tooltip ── */
.bm-cat-tooltip { background: var(--surface-base); border: 0.5px solid rgba(0,105,110,.16);
  border-radius: 10px; box-shadow: var(--elev-2); padding: 6px; min-width: 180px; }
.bm-cat-opt { display: block; width: 100%; text-align: left; border: none; background: transparent;
  padding: 7px 10px; border-radius: 6px; cursor: pointer; font: inherit; color: var(--ink-body); }
.bm-cat-opt:hover { background: rgba(0,105,110,.08); }
.bm-cat-new { color: var(--teal-700); font-weight: 600; }
```

> If any token (`--elev-1`, `--elev-3`, `--ink-body`) is not defined in this page's `:root`, substitute the nearest defined equivalent (`--elev-2`, `--ink-muted`) — grep `:root` in hadith.html first. Do NOT introduce new hex values.

- [ ] **Step 3: Add the panel markup** — immediately before the closing `</body>` (before the script tags at ~line 1913):

```html
<div class="bm-backdrop" id="ii-bookmarks-backdrop"></div>
<aside class="bm-panel" id="ii-bookmarks-panel" role="dialog" aria-modal="true" aria-label="Your bookmarks" aria-hidden="true">
  <div class="bm-panel-head">
    <span class="bm-panel-title">Your Bookmarks</span>
    <button type="button" class="bm-close" id="ii-bookmarks-close" aria-label="Close bookmarks">✕</button>
  </div>
  <div class="bm-chips" id="ii-bookmarks-chips"></div>
  <div class="bm-list" id="ii-bookmarks-list"></div>
</aside>
```

- [ ] **Step 4: Add the sidebar trigger** — after the Topic Index sidebar item (after line 1094, before `.sidebar-cta-dock`):

```html
    <a class="sidebar-item" href="#" id="ii-bookmarks-trigger">
      <svg class="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
      <span>My Bookmarks</span>
    </a>
```

- [ ] **Step 5: Rewire CTA block** — replace the two `onclick="location.href='verify.html'"` handlers (lines 1096, 1103) with ids and drop the inline onclick:

```html
      <div class="sidebar-cta" id="ii-cta-verify">
```
```html
      <div class="sidebar-cta" style="margin-top:10px;" id="ii-cta-ask">
```

Also update the Ask description copy for honesty:
```html
          <div style="font-size:11.5px;color:var(--ink-subtle);font-weight:400;margin-top:1px;" data-i18n="hadith.sidebar.askDesc">Prefills the verify engine with this hadith</div>
```

- [ ] **Step 6: Verify HTML is well-formed**

Open `hadith.html` in a browser (or `npx serve` the root) and confirm no console errors and the page still renders. (The feed itself needs the Worker backend — that's expected to be empty here; you're checking the page loads and the new markup/CSS parse.)

- [ ] **Step 7: Commit**

```bash
git add hadith.html
git commit -m "feat(hadith): Module 10 — load actions-core, panel markup, CTA ids, component CSS (locked tokens)"
```

---

## Task 7: hadith.js — storage helpers, gold-dot on render, bookmark toggle + category tooltip

**Files:**
- Modify: `src/js/hadith.js`

- [ ] **Step 1: Add core ref + storage helpers** — near the top, after `var RP = II.readingProgress;` add:

```js
  var actions = II.hadithActions;
  var BM_KEY = 'islamicinfo-hadith-bookmarks', NOTE_KEY = 'islamicinfo-hadith-notes';
  function getBookmarks() { var v = ui.safeLocalStorageGet(BM_KEY, []); return Array.isArray(v) ? v : []; }
  function setBookmarks(list) { ui.safeLocalStorageSet(BM_KEY, actions ? actions.dedupeByRef(list) : list); }
  function getNotes() { var v = ui.safeLocalStorageGet(NOTE_KEY, []); return Array.isArray(v) ? v : []; }
  function setNotes(list) { ui.safeLocalStorageSet(NOTE_KEY, list); }
  function parseRefParts(ref) {
    var parts = String(ref).split(':');
    return { slug: parts[0] || null, book: parts.length > 2 ? parts[1] : null, num: parts[parts.length - 1] || null };
  }
```

- [ ] **Step 2: Add gold-dot application** — add this function (near `observeFeed`):

```js
  // Module 10: apply .has-bookmark / .has-note (→ gold dot via CSS) to every card in a container.
  function markCardStates(container) {
    container = container || document;
    if (!actions) return;
    var bm = {}; getBookmarks().forEach(function (b) { if (b && b.ref) bm[b.ref] = 1; });
    var nt = {}; getNotes().forEach(function (n) { if (n && n.hadithRef) nt[n.hadithRef] = 1; });
    container.querySelectorAll('.hadith-card[data-ref]').forEach(function (card) {
      var ref = card.getAttribute('data-ref');
      card.classList.toggle('has-bookmark', !!bm[ref]);
      card.classList.toggle('has-note', !!nt[ref]);
    });
  }
```

- [ ] **Step 3: Hook gold-dot into the shared render path** — modify the existing `observeFeed` so it also marks states (this function is called for the Tier-1 feed AND injected to Tier-3a via `host.observeFeed`, so it covers both without touching tier3 files). Replace:

```js
  function observeFeed(container) {
    if (!rpObserver || !container) return;
    container.querySelectorAll('.hadith-card[data-ref]').forEach(function (card) { rpObserver.observe(card); });
  }
```

with:

```js
  function observeFeed(container) {
    if (!container) return;
    markCardStates(container);                       // Module 10: gold dots (runs even if IO unsupported)
    if (!rpObserver) return;
    container.querySelectorAll('.hadith-card[data-ref]').forEach(function (card) { rpObserver.observe(card); });
  }
```

- [ ] **Step 4: Add bookmark handler + category tooltip**:

```js
  /* ── Module 10: bookmark toggle + category tooltip ── */
  var catTimer = null, catEl = null;
  function hideCategoryTooltip() {
    if (catTimer) { clearTimeout(catTimer); catTimer = null; }
    if (catEl && catEl.parentNode) catEl.parentNode.removeChild(catEl);
    catEl = null;
  }
  function positionTooltip(el, anchor) {
    var rect = anchor.getBoundingClientRect();
    el.style.position = 'absolute';
    el.style.top = (window.pageYOffset + rect.bottom + 6) + 'px';
    el.style.left = (window.pageXOffset + rect.left) + 'px';
  }
  function showCategoryTooltip(btn, ref) {
    hideCategoryTooltip();
    var cats = actions.BUILTIN_CATEGORIES.concat(actions.customCategoriesOf(getBookmarks()));
    catEl = document.createElement('div');
    catEl.className = 'bm-cat-tooltip'; catEl.setAttribute('role', 'menu');
    catEl.innerHTML = cats.map(function (c) {
      return '<button type="button" class="bm-cat-opt" role="menuitem" data-cat="' + esc(c) + '">' + esc(c) + '</button>';
    }).join('') + '<button type="button" class="bm-cat-opt bm-cat-new" data-cat="__new__">+ New category</button>';
    document.body.appendChild(catEl);
    positionTooltip(catEl, btn);
    catEl.addEventListener('click', function (e) {
      var opt = e.target.closest && e.target.closest('.bm-cat-opt'); if (!opt) return;
      var cat = opt.getAttribute('data-cat');
      if (cat === '__new__') {
        var name = window.prompt('New category name:'); if (name == null) return;
        var add = actions.addCustomCategory(getBookmarks(), name);
        if (!add.ok) { ui.showToast('Maximum 5 custom categories.'); return; }
        cat = String(name).trim();
      }
      setBookmarks(actions.setCategory(getBookmarks(), ref, cat));
      ui.showToast('Saved to “' + cat + '”');
      hideCategoryTooltip();
    });
    catTimer = setTimeout(hideCategoryTooltip, 2500);   // 2.5s auto-dismiss
  }
  function onBookmark(card, btn, ref) {
    if (!actions) return;
    var r = parseRefParts(ref);
    var res = actions.toggleBookmark(getBookmarks(),
      { ref: ref, collectionSlug: r.slug, bookNum: r.book, hadithNum: r.num }, Date.now());
    setBookmarks(res.list);
    card.classList.toggle('has-bookmark', res.added);
    if (res.added) { btn.classList.add('active'); showCategoryTooltip(btn, ref); }
    else { btn.classList.remove('active'); hideCategoryTooltip(); }
  }
```

- [ ] **Step 5: `node --check`**

Run: `node --check src/js/hadith.js`
Expected: no output (syntax OK). (onNote/onListen/wireCardActions land in Tasks 8–9; this step only checks the code added so far parses — it will, since these are standalone functions. Full wiring is verified after Task 9.)

- [ ] **Step 6: Commit**

```bash
git add src/js/hadith.js
git commit -m "feat(hadith): Module 10 — storage helpers, gold-dot render hook, bookmark toggle + category tooltip"
```

---

## Task 8: hadith.js — note editor (sibling below card)

**Files:**
- Modify: `src/js/hadith.js`

- [ ] **Step 1: Add the note editor handler**:

```js
  /* ── Module 10: note editor (sibling below card — Module 4 DoD) ── */
  function onNote(card, ref) {
    if (!actions) return;
    var next = card.nextElementSibling;
    if (next && next.classList.contains('note-editor')) { next.parentNode.removeChild(next); return; } // toggle closed
    var existing = actions.getNote(getNotes(), ref);
    var ed = document.createElement('div');
    ed.className = 'note-editor';
    ed.innerHTML =
      '<textarea class="note-textarea" maxlength="' + actions.MAX_NOTE + '" ' +
        'placeholder="Your note (private, saved on this device)…"></textarea>' +
      '<div class="note-editor-actions">' +
        '<span class="note-count"></span>' +
        '<button type="button" class="btn-glass note-cancel">Cancel</button>' +
        '<button type="button" class="btn-glass primary note-save">Save</button>' +
      '</div>';
    card.parentNode.insertBefore(ed, card.nextSibling);
    var ta = ed.querySelector('.note-textarea'), count = ed.querySelector('.note-count');
    ta.value = existing ? existing.text : '';           // set via .value (never innerHTML) — no injection
    function updateCount() { count.textContent = ta.value.length + ' / ' + actions.MAX_NOTE; }
    updateCount(); ta.addEventListener('input', updateCount); ta.focus();
    ed.querySelector('.note-cancel').addEventListener('click', function () {
      if (ed.parentNode) ed.parentNode.removeChild(ed);   // discard — never persists
    });
    ed.querySelector('.note-save').addEventListener('click', function () {
      var list = actions.upsertNote(getNotes(), actions.buildNote(ref, ta.value, Date.now()));
      setNotes(list);
      card.classList.toggle('has-note', !!ta.value.trim());
      ui.showToast('Note saved');
      if (ed.parentNode) ed.parentNode.removeChild(ed);
    });
  }
```

- [ ] **Step 2: `node --check`**

Run: `node --check src/js/hadith.js`
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/js/hadith.js
git commit -m "feat(hadith): Module 10 — note editor sibling (2000-char cap, cancel discards)"
```

---

## Task 9: hadith.js — audio-unavailable player + delegated card handler wiring

**Files:**
- Modify: `src/js/hadith.js` (add `onListen`, `wireCardActions`; remove `bookmark`/`listen` from `wireFeedActions` MSG map; call `wireCardActions()` in `init`)

- [ ] **Step 1: Add the audio-unavailable handler**:

```js
  /* ── Module 10: audio mini-player — honest unavailable-only.
     No hadith audio source exists (adapter audio.url/reciter are null for all;
     see api.js). We render the player chrome disabled + an honest notice, and
     NEVER print a reciter (null → would be fabrication). A functional player
     arrives when a real audio source lands. ── */
  function onListen(card, ref) {
    var next = card.nextElementSibling;
    if (next && next.classList.contains('audio-mini-player')) { next.parentNode.removeChild(next); return; }
    var p = document.createElement('div');
    p.className = 'audio-mini-player';
    p.innerHTML =
      '<div class="amp-controls">' +
        '<button type="button" class="amp-play" aria-disabled="true" disabled title="Audio unavailable">▶</button>' +
        '<div class="amp-progress"><div class="amp-progress-fill"></div></div>' +
        '<span class="amp-speed" aria-disabled="true">1×</span>' +
      '</div>' +
      '<div class="amp-unavailable">Audio unavailable for this hadith</div>';
    card.parentNode.insertBefore(p, card.nextSibling);
  }
```

- [ ] **Step 2: Add the document-delegated card-action handler**:

```js
  // Module 10: one document-delegated handler for bookmark/note/listen — works in the
  // Tier-1 feed AND the Tier-3a list (both render via feed.buildCardHTML). isnad/share/
  // copy/full stay with wireFeedActions on #hadith-feed.
  function wireCardActions() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('.hadith-card [data-act]');
      if (!btn) return;
      var act = btn.getAttribute('data-act');
      if (act !== 'bookmark' && act !== 'note' && act !== 'listen') return;
      var card = btn.closest('.hadith-card'); if (!card) return;
      var ref = card.getAttribute('data-ref'); if (!ref) return;
      e.preventDefault();
      if (act === 'bookmark') onBookmark(card, btn, ref);
      else if (act === 'note') onNote(card, ref);
      else if (act === 'listen') onListen(card, ref);
    });
  }
```

- [ ] **Step 3: Remove now-live acts from the deferral map** — in `wireFeedActions`, delete the `bookmark` and `listen` entries from `MSG` (leave `full`, `share`, `copy`). Result:

```js
    var MSG = {
      full: 'Full hadith view arrives in a later stage',
      share: 'Sharing arrives in a later stage',
      copy: 'Copying arrives in a later stage',
    };
```

- [ ] **Step 4: Call `wireCardActions()` in `init`** — add it right after `wireFeedActions()` is set up. In the `if (feed) { … }` line of `init`, add `wireCardActions();`:

```js
    if (feed) { FEED.filter = readGradeFromUrl(); wireGradeFilter(); wireLoadMore(); wireFeedActions(); wireCardActions(); loadHadithFeed(false); }
```

- [ ] **Step 5: `node --check`**

Run: `node --check src/js/hadith.js`
Expected: no output.

- [ ] **Step 6: Commit**

```bash
git add src/js/hadith.js
git commit -m "feat(hadith): Module 10 — audio unavailable player + delegated bookmark/note/listen handler"
```

---

## Task 10: hadith.js — bookmarks panel (open/filter/jump/remove)

**Files:**
- Modify: `src/js/hadith.js` (add panel functions; wire trigger/close in `init`)

- [ ] **Step 1: Add the panel functions**:

```js
  /* ── Module 10: bookmarks panel ── */
  var bmLastFocus = null;
  function onBmKey(e) { if (e.key === 'Escape') closeBookmarksPanel(); }
  function renderBookmarksPanel(filter) {
    var listEl = $('#ii-bookmarks-list'), chipRow = $('#ii-bookmarks-chips'); if (!listEl) return;
    var all = getBookmarks();
    var cats = ['all'].concat(actions.BUILTIN_CATEGORIES, actions.customCategoriesOf(all))
      .filter(function (c, i, a) { return a.indexOf(c) === i; });
    if (chipRow) chipRow.innerHTML = cats.map(function (c) {
      return '<button type="button" class="bm-chip' + (c === filter ? ' on' : '') + '" data-cat="' + esc(c) + '">' +
        esc(c === 'all' ? 'All' : c) + '</button>';
    }).join('');
    var rows = actions.panelFilter(all, filter);
    if (!rows.length) {
      listEl.innerHTML = '<div class="bm-empty">No bookmarks' + (filter === 'all' ? ' yet.' : ' in this category.') + '</div>';
      return;
    }
    listEl.innerHTML = rows.map(function (b) {
      var c = collectionBySlug(b.collectionSlug);
      var name = c ? c.nameEnglish : (b.collectionSlug || 'Hadith');
      return '<div class="bm-row" data-ref="' + esc(b.ref) + '">' +
        '<div class="bm-row-main"><div class="bm-row-title">' + esc(name) + ' · Hadith ' + esc(b.hadithNum) + '</div>' +
        '<div class="bm-row-cat">' + esc(b.category) + '</div></div>' +
        '<button type="button" class="bm-jump" data-ref="' + esc(b.ref) + '" title="Jump to hadith" aria-label="Jump to hadith">→</button>' +
        '<button type="button" class="bm-remove" data-ref="' + esc(b.ref) + '" title="Remove bookmark" aria-label="Remove bookmark">✕</button>' +
      '</div>';
    }).join('');
  }
  function openBookmarksPanel() {
    var panel = $('#ii-bookmarks-panel'), backdrop = $('#ii-bookmarks-backdrop');
    if (!panel || !backdrop || !actions) return;
    renderBookmarksPanel('all');
    backdrop.style.display = 'block';
    panel.classList.add('open'); panel.setAttribute('aria-hidden', 'false');
    bmLastFocus = document.activeElement;
    document.addEventListener('keydown', onBmKey);
    ui.focusTrap(panel);
    var first = panel.querySelector('button, a'); if (first) first.focus();
  }
  function closeBookmarksPanel() {
    var panel = $('#ii-bookmarks-panel'), backdrop = $('#ii-bookmarks-backdrop');
    if (backdrop) backdrop.style.display = 'none';
    if (panel) { panel.classList.remove('open'); panel.setAttribute('aria-hidden', 'true'); }
    document.removeEventListener('keydown', onBmKey);
    if (bmLastFocus && bmLastFocus.focus) bmLastFocus.focus();
  }
  function jumpToBookmark(ref) {
    closeBookmarksPanel();
    var r = parseRefParts(ref);
    routeTo({ collection: r.slug, book: r.book, hadith: r.num }, true);
    setTimeout(function () {                              // let the target view render, then pulse
      var card = document.querySelector('.hadith-card[data-ref="' + ref + '"]');
      if (card) { card.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' }); pulseRing(card); }
    }, 350);
  }
  function wireBookmarksPanel() {
    var trigger = $('#ii-bookmarks-trigger'), closeBtn = $('#ii-bookmarks-close'),
        backdrop = $('#ii-bookmarks-backdrop'), panel = $('#ii-bookmarks-panel'),
        chipRow = $('#ii-bookmarks-chips'), listEl = $('#ii-bookmarks-list');
    if (trigger) trigger.addEventListener('click', function (e) { e.preventDefault(); openBookmarksPanel(); });
    if (closeBtn) closeBtn.addEventListener('click', closeBookmarksPanel);
    if (backdrop) backdrop.addEventListener('click', closeBookmarksPanel);
    if (chipRow) chipRow.addEventListener('click', function (e) {
      var chip = e.target.closest && e.target.closest('.bm-chip'); if (!chip) return;
      renderBookmarksPanel(chip.getAttribute('data-cat'));
    });
    if (listEl) listEl.addEventListener('click', function (e) {
      var jump = e.target.closest && e.target.closest('.bm-jump');
      var rem = e.target.closest && e.target.closest('.bm-remove');
      if (jump) { jumpToBookmark(jump.getAttribute('data-ref')); return; }
      if (rem) {
        var ref = rem.getAttribute('data-ref');
        var res = actions.toggleBookmark(getBookmarks(), { ref: ref }, Date.now());
        setBookmarks(res.list);                          // toggle of a present ref → removes
        var active = $('#ii-bookmarks-chips .bm-chip.on');
        renderBookmarksPanel(active ? active.getAttribute('data-cat') : 'all');
        markCardStates(document);                        // clear the gold dot on any visible card
      }
    });
  }
```

- [ ] **Step 2: Wire the panel in `init`** — add `wireBookmarksPanel();` after `wireSheet();`:

```js
    wireSheet();
    wireBookmarksPanel();
```

- [ ] **Step 3: `node --check`**

Run: `node --check src/js/hadith.js`
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add src/js/hadith.js
git commit -m "feat(hadith): Module 10 — bookmarks panel (chip filter, jump+pulse, remove)"
```

---

## Task 11: hadith.js — tier-aware Verify/Ask CTAs

**Files:**
- Modify: `src/js/hadith.js` (add `ctaContext`, `wireSidebarCtas`; call in `init`)

- [ ] **Step 1: Add the CTA wiring**:

```js
  /* ── Module 10: tier-aware sidebar CTAs ──
     Verify a Source → verify.html always. Ask a Question → verify.html prefilled
     with the current hadith on Tier 3 (via actions.buildAskUrl), empty on Tier 1. ── */
  function ctaContext() {
    var r = parseRoute();
    if (!r.hadith) return { route: r, hadith: null };
    var ref = r.collection + ':' + (r.book == null ? 0 : r.book) + ':' + r.hadith;
    var h = FEED.byRef[ref];                              // prefer loaded feed data
    if (!h) {                                             // else read the rendered deep view (displayed = sourced)
      var tEl = document.querySelector('#ii-tier2 .hadith-text, #ii-tier2 .hadith-translation, #ii-tier2 .dv-body');
      var matn = tEl ? tEl.textContent.trim() : '';
      if (matn) {
        var c = collectionBySlug(r.collection);
        var reference = [(c && c.nameEnglish) || r.collection,
          r.book != null ? ('Book ' + r.book) : null, 'Hadith ' + r.hadith].filter(Boolean).join(' · ');
        h = { translation: { text: matn }, reference: reference };
      }
    }
    return { route: r, hadith: h || null };
  }
  function wireSidebarCtas() {
    var verify = $('#ii-cta-verify'), ask = $('#ii-cta-ask');
    if (verify) { verify.style.cursor = 'pointer'; verify.addEventListener('click', function () { location.href = 'verify.html'; }); }
    if (ask) {
      ask.style.cursor = 'pointer';
      ask.addEventListener('click', function () {
        var ctx = ctaContext();
        location.href = actions ? actions.buildAskUrl(ctx.route, ctx.hadith) : 'verify.html';
      });
    }
  }
```

- [ ] **Step 2: Call in `init`** — add `wireSidebarCtas();` after `wireBookmarksPanel();`.

- [ ] **Step 3: `node --check`**

Run: `node --check src/js/hadith.js`
Expected: no output.

- [ ] **Step 4: Full suite green**

Run: `cd worker && npm test`
Expected: PASS — all existing tests (204) + the new `hadith-actions-core.test.js` (17) + the feed-core note test.

- [ ] **Step 5: Commit**

```bash
git add src/js/hadith.js
git commit -m "feat(hadith): Module 10 — tier-aware Verify/Ask sidebar CTAs (real ?q/&ref/&mode contract)"
```

---

## Task 12: Fixture harness + screenshots (visual gate — user sign-off)

**Files:**
- Create: `tools/hadith-module10-fixture.html` (throwaway; not shipped)

The three net-new components have no mockup. Render them in isolation (no Worker/hadithapi needed) and screenshot for user approval before Module 10 is marked done.

- [ ] **Step 1: Create the fixture** `tools/hadith-module10-fixture.html`:

```html
<!doctype html><html><head><meta charset="utf-8">
<title>Module 10 fixture</title>
<link rel="stylesheet" href="../src/css/tokens.css">
<link rel="stylesheet" href="../src/css/hadith.css">
</head><body style="padding:24px;max-width:760px;margin:auto;">
<h2>Note editor</h2>
<div class="note-editor">
  <textarea class="note-textarea" maxlength="2000">Sample note text…</textarea>
  <div class="note-editor-actions"><span class="note-count">16 / 2000</span>
    <button class="btn-glass note-cancel">Cancel</button><button class="btn-glass primary note-save">Save</button></div>
</div>
<h2>Audio (unavailable)</h2>
<div class="audio-mini-player">
  <div class="amp-controls"><button class="amp-play" disabled>▶</button>
    <div class="amp-progress"><div class="amp-progress-fill"></div></div><span class="amp-speed">1×</span></div>
  <div class="amp-unavailable">Audio unavailable for this hadith</div>
</div>
<button id="open">Open bookmarks panel</button>
<div class="bm-backdrop" id="ii-bookmarks-backdrop"></div>
<aside class="bm-panel" id="ii-bookmarks-panel" role="dialog">
  <div class="bm-panel-head"><span class="bm-panel-title">Your Bookmarks</span><button class="bm-close">✕</button></div>
  <div class="bm-chips"><button class="bm-chip on">All</button><button class="bm-chip">General</button><button class="bm-chip">Reflection</button></div>
  <div class="bm-list">
    <div class="bm-row"><div class="bm-row-main"><div class="bm-row-title">Sahih al-Bukhari · Hadith 1</div><div class="bm-row-cat">Reflection</div></div><button class="bm-jump">→</button><button class="bm-remove">✕</button></div>
  </div>
</aside>
<script>document.getElementById('open').onclick=function(){document.getElementById('ii-bookmarks-backdrop').style.display='block';document.getElementById('ii-bookmarks-panel').classList.add('open');};</script>
</body></html>
```

> Adjust the two `<link>` hrefs to the actual stylesheet paths used by `hadith.html` (grep `hadith.html` for `<link rel="stylesheet"` — the page may inline its CSS, in which case copy the relevant `:root` token block + the Module 10 CSS into a `<style>` in this fixture instead).

- [ ] **Step 2: Screenshot each component**

Serve the repo root and open the fixture, or use a headless screenshot tool. Capture: (1) note editor, (2) audio-unavailable player, (3) bookmarks panel (open). Save to the scratchpad dir.

- [ ] **Step 3: Share screenshots with the user for sign-off.** Do NOT mark Module 10 done until approved. If the user requests visual changes, adjust the Task 6 CSS and re-screenshot.

- [ ] **Step 4: Commit the fixture** (kept in `tools/` as a dev aid, or delete if the user prefers):

```bash
git add tools/hadith-module10-fixture.html
git commit -m "chore(hadith): Module 10 — local fixture harness for net-new component screenshots"
```

---

## Task 13: QuotaExceededError verification + docs + wrap-up

**Files:**
- Modify: `doc/DATA.md` (confirm `HadithBookmark`/`HadithNote` schema note matches §3 of the spec)

- [ ] **Step 1: Verify the QuotaExceededError path (named requirement — do NOT assume)**

In a browser console on `hadith.html`, simulate a full quota and confirm the toast fires + existing data survives:

```js
// seed a real bookmark first
localStorage.setItem('islamicinfo-hadith-bookmarks', JSON.stringify([{ref:'sahih-bukhari:1:1',category:'General'}]));
// force quota failure on the next setItem
const orig = Storage.prototype.setItem;
Storage.prototype.setItem = function(){ const e = new Error('quota'); e.name = 'QuotaExceededError'; throw e; };
// now click a bookmark button in the UI (or call the handler) → expect the toast
// "Storage full — clear some bookmarks or notes."
Storage.prototype.setItem = orig;   // restore
JSON.parse(localStorage.getItem('islamicinfo-hadith-bookmarks'));  // → original entry still present
```

Expected: toast shown; the pre-existing bookmark array is unchanged (atomic setItem never partially wrote). Record the result in the Verification Note.

- [ ] **Step 2: Confirm DATA.md schema note** — ensure `doc/DATA.md` §2 rows for `islamicinfo-hadith-bookmarks` / `islamicinfo-hadith-notes` reference the `HadithBookmark { ref, collectionSlug, bookNum, hadithNum, category, createdAt }` / `HadithNote { hadithRef, text, updatedAt }` shapes. If a shape column exists and is vaguer, tighten it (no new keys).

- [ ] **Step 3: Full verification run**

```bash
node --check src/js/hadith.js && node --check src/js/hadith-actions-core.js && node --check src/js/hadith-feed-core.js
cd worker && npm test
```
Expected: syntax clean; full suite green.

- [ ] **Step 4: Update memory** — write/refresh `hadith-module-10-state.md` (build state, decisions: honest-unavailable audio, tier-aware CTA real contract, Tier-3b deferred, screenshots-approved) + add the MEMORY.md index line.

- [ ] **Step 5: Commit + finish the branch**

```bash
git add doc/DATA.md
git commit -m "docs(hadith): Module 10 — confirm bookmark/note localStorage schemas in DATA.md"
```
Then invoke `superpowers:finishing-a-development-branch` to choose merge/PR.

---

## Verification Note (fill in before done)
- [ ] QuotaExceededError path **tested** (not assumed) — toast fired, existing data survived. Result: ______
- [ ] Ask CTA prefill verified on a Tier-3 route (`?q=&ref=&mode=claim` lands in verify.html input). Result: ______
- [ ] Bookmark toggle idempotent in the live UI (second click removes, dot clears). Result: ______
- [ ] Notes cancel never persists; 2000-char maxlength enforced. Result: ______
- [ ] 3 net-new component screenshots shared + user-approved. Result: ______
- [ ] `npm test` green (existing 204 + new). Result: ______
