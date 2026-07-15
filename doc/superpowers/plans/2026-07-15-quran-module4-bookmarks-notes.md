# Module 4 — Bookmarks + Notes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Make per-verse bookmarks and inline notes real — persist to `localStorage`, populate the bookmarks panel (category filter + jump-to-verse), and re-apply saved visual state whenever Module 2 re-renders cards.

**Architecture:** Static site + vanilla JS. Pure array logic in UMD `quran-marks-core.js` (unit-tested); controller `quran-marks.js` overrides the locked inline demo globals (`toggleBookmark`/`toggleNote`/`saveNote`/`toggleBookmarks`/`jumpTo`) and uses a `MutationObserver` on `#versesCardList` to re-apply state. No API, no DB — user data only.

**Tech Stack:** ES5-safe browser JS, Node `node:test`, `localStorage`.

**Spec:** `doc/superpowers/specs/2026-07-15-quran-module4-bookmarks-notes-design.md`

---

## File Structure

| File | Responsibility |
|---|---|
| `src/js/quran-marks-core.js` (NEW) | Pure array logic: isBookmarked, toggleBookmark, filterByCategory, findNote, upsertNote, removeNote, capText. UMD. |
| `src/js/quran-marks.js` (NEW) | Controller: overrides + bookmarks panel + notes editor + MutationObserver |
| `tests/quran/marks-core.test.js` (NEW) | `node:test` |
| `quran.html` (MODIFY) | 2 `<script>` includes only |
| `DATA.md` (MODIFY) | Register `ii-quran-bookmarks` / `ii-quran-notes` + `Bookmark` / `Note` shapes |

**Interfaces:** core (`window.II.marksCore` / Node): `isBookmarked(bookmarks,verseKey)`, `toggleBookmark(bookmarks,bm)`, `filterByCategory(bookmarks,category)`, `findNote(notes,verseKey)`, `upsertNote(notes,note)`, `removeNote(notes,verseKey)`, `capText(s,max?)`. `Bookmark={verseKey,surahName,surahId,ayahNo,arabic,translation,category,addedAt}`, `Note={verseKey,text,updatedAt}`.

---

## Task 1: Pure core (TDD)

**Files:** Create `src/js/quran-marks-core.js`, `tests/quran/marks-core.test.js`

- [ ] **Step 1: Failing tests** — create `tests/quran/marks-core.test.js`:
```js
'use strict';
const test = require('node:test');
const assert = require('node:assert');
const core = require('../../src/js/quran-marks-core.js');

test('isBookmarked', () => {
  assert.equal(core.isBookmarked([{verseKey:'1:1'}], '1:1'), true);
  assert.equal(core.isBookmarked([{verseKey:'1:1'}], '1:2'), false);
  assert.equal(core.isBookmarked(null, '1:1'), false);
});

test('toggleBookmark adds then removes, immutably', () => {
  const a = [];
  const b = core.toggleBookmark(a, {verseKey:'1:1',category:'General'});
  assert.equal(b.length, 1);
  assert.equal(a.length, 0); // original untouched
  const c = core.toggleBookmark(b, {verseKey:'1:1'});
  assert.equal(c.length, 0);
});

test('filterByCategory', () => {
  const bms = [{verseKey:'1:1',category:'General'},{verseKey:'1:2',category:'Memorization'}];
  assert.equal(core.filterByCategory(bms, 'All').length, 2);
  assert.equal(core.filterByCategory(bms, 'Memorization').length, 1);
  assert.equal(core.filterByCategory(bms, 'Memorization')[0].verseKey, '1:2');
});

test('upsertNote replaces or appends', () => {
  let notes = core.upsertNote([], {verseKey:'1:1', text:'a', updatedAt:1});
  assert.equal(notes.length, 1);
  notes = core.upsertNote(notes, {verseKey:'1:1', text:'b', updatedAt:2});
  assert.equal(notes.length, 1);
  assert.equal(notes[0].text, 'b');
  notes = core.upsertNote(notes, {verseKey:'1:2', text:'c', updatedAt:3});
  assert.equal(notes.length, 2);
});

test('removeNote + findNote', () => {
  const notes = [{verseKey:'1:1',text:'a'},{verseKey:'1:2',text:'b'}];
  assert.equal(core.findNote(notes,'1:2').text, 'b');
  assert.equal(core.findNote(notes,'9:9'), null);
  assert.equal(core.removeNote(notes,'1:1').length, 1);
});

test('capText: trims + caps at 2000', () => {
  assert.equal(core.capText('  hi  '), 'hi');
  assert.equal(core.capText(null), '');
  assert.equal(core.capText('x'.repeat(2500)).length, 2000);
});
```

- [ ] **Step 2: Run — expect FAIL**: `node --test tests/quran/marks-core.test.js`

- [ ] **Step 3: Create `src/js/quran-marks-core.js`:**
```js
/* IslamicInfo.org — quran-marks-core.js
   Pure, DOM-free bookmark/note array logic. UMD: Node + browser. */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  else { root.II = root.II || {}; root.II.marksCore = api; }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function isBookmarked(bookmarks, verseKey) {
    return (bookmarks || []).some(function (b) { return b.verseKey === verseKey; });
  }
  function toggleBookmark(bookmarks, bm) {
    var arr = bookmarks || [];
    if (arr.some(function (b) { return b.verseKey === bm.verseKey; })) {
      return arr.filter(function (b) { return b.verseKey !== bm.verseKey; });
    }
    return arr.concat([bm]);
  }
  function filterByCategory(bookmarks, category) {
    if (!category || category === 'All') return (bookmarks || []).slice();
    return (bookmarks || []).filter(function (b) { return b.category === category; });
  }
  function findNote(notes, verseKey) {
    var m = (notes || []).filter(function (n) { return n.verseKey === verseKey; });
    return m.length ? m[0] : null;
  }
  function upsertNote(notes, note) {
    var arr = notes || [], found = false;
    var out = arr.map(function (n) { if (n.verseKey === note.verseKey) { found = true; return note; } return n; });
    if (!found) out.push(note);
    return out;
  }
  function removeNote(notes, verseKey) {
    return (notes || []).filter(function (n) { return n.verseKey !== verseKey; });
  }
  function capText(s, max) {
    if (typeof max !== 'number') max = 2000;
    s = String(s == null ? '' : s).trim();
    return s.length > max ? s.slice(0, max) : s;
  }

  return { isBookmarked, toggleBookmark, filterByCategory, findNote, upsertNote, removeNote, capText };
});
```

- [ ] **Step 4: Run — expect PASS** (6 tests): `node --test tests/quran/marks-core.test.js`

- [ ] **Step 5: Commit**
```bash
git add src/js/quran-marks-core.js tests/quran/marks-core.test.js
git commit -m "feat(quran): tested pure core for bookmarks/notes (toggle/filter/upsert/cap)"
```

---

## Task 2: Register keys + shapes

**Files:** Modify `doc/DATA.md`

- [ ] **Step 1: Add key rows** — in §1 after the `ii-audio-{surah}-{reciter}` row:
```
| `ii-quran-bookmarks` | `Bookmark[]` (JSON) | Quran Explorer | Permanent |
| `ii-quran-notes` | `Note[]` (JSON) | Quran Explorer | Permanent |
```

- [ ] **Step 2: Add shapes** — in §2 after the `AyahAudio` line:
```
Bookmark       = { verseKey: string; surahName: string; surahId: number; ayahNo: number; arabic: string; translation: string; category: string; addedAt: number }
Note           = { verseKey: string; text: string; updatedAt: number }
```

- [ ] **Step 3: Commit**
```bash
git add doc/DATA.md
git commit -m "docs(quran): register bookmark/note keys + shapes"
```

---

## Task 3: Controller

**Files:** Create `src/js/quran-marks.js`

- [ ] **Step 1: Create `src/js/quran-marks.js`:**
```js
/* IslamicInfo.org — quran-marks.js
   Bookmarks + Notes controller (Module 4). Overrides the locked inline demo
   globals; persists to localStorage; re-applies state on card re-render.
   Depends on: window.II.marksCore. */
(function () {
  'use strict';

  var core = window.II && window.II.marksCore;
  var BM_KEY = 'ii-quran-bookmarks', NOTE_KEY = 'ii-quran-notes';
  var bookmarks = readArr(BM_KEY), notes = readArr(NOTE_KEY);
  var activeCat = 'All';

  function readArr(k) { try { var r = localStorage.getItem(k); var a = r ? JSON.parse(r) : []; return Array.isArray(a) ? a : []; } catch (e) { try { localStorage.removeItem(k); } catch (_) {} return []; } }
  function saveArr(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function toast(m) { if (window.showToast) window.showToast(m); }
  function keyId(vk) { return vk.replace(':', '-'); }
  function cardFor(vk) { return document.getElementById('a-' + keyId(vk)); }
  function currentSurahFromDom() { var c = document.querySelector('#versesCardList .ayah-card[data-key]'); return c ? Number(c.dataset.key.split(':')[0]) : null; }
  function surahNameFromDom() { var bc = document.getElementById('bcTitle'); return bc ? bc.textContent.split('·')[0].trim() : ''; }

  var BM_FILL = '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>';
  var BM_OUTLINE = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>';

  // ---- bookmarks ----
  window.toggleBookmark = function (btn, e) {
    if (e && e.stopPropagation) e.stopPropagation();
    var card = btn && btn.closest ? btn.closest('.ayah-card') : null;
    if (!card || !card.dataset.key) return;
    var vk = card.dataset.key, parts = vk.split(':');
    var wasBm = core.isBookmarked(bookmarks, vk);
    var bm = {
      verseKey: vk, surahName: surahNameFromDom(), surahId: Number(parts[0]), ayahNo: Number(parts[1]),
      arabic: (card.querySelector('.ayah-arabic') || {}).textContent || '',
      translation: (card.querySelector('.ayah-translation') || {}).textContent || '',
      category: 'General', addedAt: Date.now()
    };
    bookmarks = core.toggleBookmark(bookmarks, bm);
    saveArr(BM_KEY, bookmarks);
    setBookmarkIcon(btn, !wasBm);
    toast(wasBm ? 'Bookmark removed' : 'Verse bookmarked');
    var panel = document.getElementById('bookmarksPanel');
    if (panel && panel.classList.contains('open')) renderPanel();
  };
  function setBookmarkIcon(btn, on) { btn.classList.toggle('bookmarked', on); btn.innerHTML = on ? BM_FILL : BM_OUTLINE; }

  // ---- panel ----
  window.toggleBookmarks = function () {
    var panel = document.getElementById('bookmarksPanel'); if (!panel) return;
    panel.classList.toggle('open');
    var settings = document.getElementById('settingsPanel'); if (settings) settings.classList.remove('open');
    if (panel.classList.contains('open')) renderPanel();
  };
  function renderPanel() {
    var listEl = document.querySelector('#bookmarksPanel .bp-list'); if (!listEl) return;
    listEl.innerHTML = '';
    var items = core.filterByCategory(bookmarks, activeCat).slice().sort(function (a, b) { return b.addedAt - a.addedAt; });
    if (!items.length) {
      var empty = document.createElement('div'); empty.className = 'bp-empty';
      empty.style.cssText = 'padding:24px 14px;font-size:13px;color:var(--ink-muted);';
      empty.textContent = 'No bookmarks yet — tap the bookmark icon on any verse.';
      listEl.appendChild(empty); return;
    }
    items.forEach(function (bm) {
      var it = document.createElement('div'); it.className = 'bp-item';
      var ar = document.createElement('div'); ar.className = 'bp-ar'; ar.textContent = bm.arabic;
      var en = document.createElement('div'); en.className = 'bp-en'; en.textContent = bm.translation;
      var meta = document.createElement('div'); meta.className = 'bp-meta';
      var ref = document.createElement('span'); ref.textContent = bm.surahName + ' ' + bm.verseKey;
      var tag = document.createElement('span'); tag.className = 'bp-tag'; tag.textContent = bm.category;
      meta.appendChild(ref); meta.appendChild(tag);
      it.appendChild(ar); it.appendChild(en); it.appendChild(meta);
      it.addEventListener('click', function () { jumpToVerse(bm); });
      listEl.appendChild(it);
    });
  }
  function wireChips() {
    Array.prototype.forEach.call(document.querySelectorAll('#bookmarksPanel .bp-cat'), function (chip) {
      chip.addEventListener('click', function () {
        var label = chip.textContent.trim();
        if (label.indexOf('New') !== -1) return; // "+ New" deferred
        activeCat = label;
        Array.prototype.forEach.call(document.querySelectorAll('#bookmarksPanel .bp-cat'), function (c) { c.classList.remove('on'); });
        chip.classList.add('on');
        renderPanel();
      });
    });
  }

  // ---- jump ----
  function scrollToCard(vk) {
    var card = cardFor(vk); if (!card) return false;
    try { card.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
    card.classList.add('pulse-hl'); setTimeout(function () { card.classList.remove('pulse-hl'); }, 3800);
    return true;
  }
  function jumpToVerse(bm) {
    var panel = document.getElementById('bookmarksPanel'); if (panel) panel.classList.remove('open');
    if (currentSurahFromDom() === bm.surahId) { scrollToCard(bm.verseKey); return; }
    var row = document.querySelector('.surah-row[data-id="' + bm.surahId + '"]');
    if (row && window.selectSurah) { window.selectSurah(row); }
    else if (window.loadSurah) { window.loadSurah(bm.surahId); }
    var tries = 0, iv = setInterval(function () { tries++; if (scrollToCard(bm.verseKey) || tries > 40) clearInterval(iv); }, 50);
  }
  window.jumpTo = function (id) {
    var el = document.getElementById(id);
    if (el) { try { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {} el.classList.add('pulse-hl'); setTimeout(function () { el.classList.remove('pulse-hl'); }, 3800); }
    var p = document.getElementById('bookmarksPanel'); if (p) p.classList.remove('open');
  };

  // ---- notes ----
  window.toggleNote = function (id) {
    var ed = document.getElementById(id); if (!ed) return;
    var k = id.slice(2), vk = k.replace('-', ':');
    if (!ed.dataset.built) {
      var ta = document.createElement('textarea'); ta.className = 'note-input'; ta.setAttribute('maxlength', '2000'); ta.setAttribute('placeholder', 'Your reflection…');
      var acts = document.createElement('div'); acts.className = 'note-acts';
      var cancel = document.createElement('button'); cancel.className = 'note-cancel'; cancel.type = 'button'; cancel.textContent = 'Cancel';
      var save = document.createElement('button'); save.className = 'note-save'; save.type = 'button'; save.textContent = 'Save note';
      cancel.addEventListener('click', function () { ed.classList.remove('show'); });
      save.addEventListener('click', function () { window.saveNote(id, 'nbtn-' + k); });
      acts.appendChild(cancel); acts.appendChild(save);
      ed.appendChild(ta); ed.appendChild(acts);
      ed.dataset.built = '1';
    }
    var input = ed.querySelector('.note-input');
    if (input && !ed.classList.contains('show')) { var ex = core.findNote(notes, vk); input.value = ex ? ex.text : ''; }
    ed.classList.toggle('show');
    if (ed.classList.contains('show') && input) input.focus();
  };
  window.saveNote = function (editorId, btnId) {
    var ed = document.getElementById(editorId); if (!ed) return;
    var k = editorId.slice(2), vk = k.replace('-', ':');
    var input = ed.querySelector('.note-input');
    var text = core.capText(input ? input.value : '', 2000);
    if (text) notes = core.upsertNote(notes, { verseKey: vk, text: text, updatedAt: Date.now() });
    else notes = core.removeNote(notes, vk);
    var ok = saveArr(NOTE_KEY, notes);
    ed.classList.remove('show');
    applyNoteState(vk, !!text);
    toast(ok ? (text ? 'Note saved' : 'Note removed') : 'Storage full — couldn’t save');
  };
  function applyNoteState(vk, hasNote) {
    var card = cardFor(vk); if (!card) return;
    var btn = document.getElementById('nbtn-' + keyId(vk));
    if (btn) btn.style.color = hasNote ? 'var(--gold-500)' : '';
    var badge = card.querySelector('.ayah-num-badge'); if (!badge) return;
    var dot = badge.querySelector('.ndot');
    if (hasNote && !dot) { var d = document.createElement('div'); d.className = 'ndot'; badge.appendChild(d); badge.style.position = 'relative'; }
    else if (!hasNote && dot) { dot.parentNode.removeChild(dot); }
  }

  // ---- re-apply on render ----
  function applyMarks(card) {
    if (!card || !card.dataset || !card.dataset.key) return;
    var vk = card.dataset.key;
    if (core.isBookmarked(bookmarks, vk)) {
      var btns = card.querySelectorAll('.ayah-actions .ayah-btn');
      if (btns[1]) setBookmarkIcon(btns[1], true);
    }
    if (core.findNote(notes, vk)) applyNoteState(vk, true);
  }
  function scanAll() { Array.prototype.forEach.call(document.querySelectorAll('#versesCardList .ayah-card'), applyMarks); }

  function init() {
    if (!core) return;
    wireChips();
    scanAll();
    var list = document.getElementById('versesCardList');
    if (list && window.MutationObserver) {
      var mo = new MutationObserver(function (muts) {
        muts.forEach(function (m) {
          Array.prototype.forEach.call(m.addedNodes || [], function (n) {
            if (n.nodeType !== 1) return;
            if (n.classList && n.classList.contains('ayah-card')) applyMarks(n);
            else if (n.querySelectorAll) Array.prototype.forEach.call(n.querySelectorAll('.ayah-card'), applyMarks);
          });
        });
      });
      mo.observe(list, { childList: true, subtree: true });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  window.II = window.II || {};
  window.II.quranMarks = { _bookmarks: function () { return bookmarks; }, _notes: function () { return notes; }, renderPanel: renderPanel };
})();
```

- [ ] **Step 2: Syntax-check**: `node --check src/js/quran-marks.js` (expect exit 0)

- [ ] **Step 3: Commit**
```bash
git add src/js/quran-marks.js
git commit -m "feat(quran): bookmarks + notes controller — persist, panel, jump, re-apply observer"
```

---

## Task 4: Wire `quran.html`

**Files:** Modify `quran.html`

- [ ] **Step 1: Add 2 script includes** — FIND:
```html
<script src="src/js/quran-audio-core.js"></script>
<script src="src/js/quran-audio.js"></script>
```
REPLACE:
```html
<script src="src/js/quran-audio-core.js"></script>
<script src="src/js/quran-audio.js"></script>
<script src="src/js/quran-marks-core.js"></script>
<script src="src/js/quran-marks.js"></script>
```

- [ ] **Step 2: Confirm minimal diff**: `git diff quran.html` → exactly 2 added `<script>` lines.

- [ ] **Step 3: Re-run all module tests**:
```bash
node --test tests/quran/marks-core.test.js tests/quran/audio-core.test.js tests/quran/verses-core.test.js tests/quran/sidebar-core.test.js
```
Expected: all pass.

- [ ] **Step 4: Commit**
```bash
git add quran.html
git commit -m "feat(quran): wire bookmarks + notes into quran.html"
```

---

## Task 5: Headless verification + DoD gate

**Files:** none (jsdom harness in scratchpad).

- [ ] **Step 1: Build the harness** — jsdom with `#bcTitle`, `#settingsPanel`, a `#bookmarksPanel` (`.bp-cats` with `.bp-cat` chips All/General/Memorization/Reflection/"+ New", `.bp-list`), and `#versesCardList` holding 2 `.ayah-card` (ids `a-1-1`/`a-1-2`, `data-key`, `.ayah-num-badge`, a 6-button `.ayah-actions` where index 1 is the bookmark btn, `.ayah-arabic`, `.ayah-translation`, empty `.note-editor` `n-1-1`/`n-1-2`, note btn `nbtn-1-1`/`nbtn-1-2`). Inject `quran-marks-core.js` + `quran-marks.js`; set `win.showToast=()=>{}`.
  - **A (bookmark persist + icon):** call `win.toggleBookmark(bmBtnOf('a-1-1'), {stopPropagation(){}})`; assert `ii-quran-bookmarks` has 1 entry with `verseKey:'1:1'`, `arabic`/`translation` captured, `category:'General'`; btn has `.bookmarked`. Toggle again → 0 entries, `.bookmarked` removed.
  - **B (re-apply on re-render):** bookmark `1:2`; remove and re-add card `a-1-2` to `#versesCardList` (simulate Module-2 re-render); after a tick assert the new card's bookmark btn got `.bookmarked` via the MutationObserver.
  - **C (note save + ndot + prefill):** `win.toggleNote('n-1-1')` (builds editor); set textarea value "my reflection"; `win.saveNote('n-1-1','nbtn-1-1')`; assert `ii-quran-notes` has `{verseKey:'1:1',text:'my reflection'}`, `a-1-1 .ayah-num-badge .ndot` exists, note btn gold. Reopen `toggleNote('n-1-1')` → textarea prefilled with saved text.
  - **D (empty note removes):** save empty text on `n-1-1` → note removed from storage, `.ndot` gone.
  - **E (panel render + filter):** `win.toggleBookmarks()` → `.bp-list` has a `.bp-item` per bookmark with `.bp-ar`/`.bp-en`/`.bp-tag`; click the "Memorization" chip → list filters (empty since all are General); click "All" → shows again.
  - **F (jump same surah):** click a `.bp-item` for `1:1` → `a-1-1` gets `.pulse-hl` and panel closes.
  - **G (empty state):** clear bookmarks, open panel → "No bookmarks yet…" text present.
  - **H:** assert **zero console errors** across all scenarios.

- [ ] **Step 2: Run harness** — expect all pass, 0 console errors.

- [ ] **Step 3: Serve + eyeball** — `npx --yes serve -l 5000 .`, `/quran.html`: bookmark a verse → icon gold + persists on reload; open Bookmarks panel → verse listed, click → jumps + highlights; add a note → gold dot on badge, persists on reload; dark theme OK; Console clean.

- [ ] **Step 4: DoD report** — pass/fail per spec §8. Content gate is N/A beyond no-fabrication (user content + verse copies); **no 🕌 human-review gate triggered.**

---

## Self-Review (author checklist — completed)

- **Spec coverage:** bookmarks persist/toggle/icon → Task 3 (`toggleBookmark`); panel + filter + jump → Task 3 (`renderPanel`/`wireChips`/`jumpToVerse`); notes save/prefill/ndot → Task 3 (`toggleNote`/`saveNote`/`applyNoteState`); re-apply on render → Task 3 (`MutationObserver`/`applyMarks`); pure logic → Task 1; keys → Task 2. Deferred (custom categories, deep-link pulse) correctly absent.
- **Placeholder scan:** none.
- **Type/name consistency:** core exports match Task 3 usage; `Bookmark`/`Note` shapes consistent across Tasks 2,3; overrides match locked inline global names (`toggleBookmark`/`toggleNote`/`saveNote`/`toggleBookmarks`/`jumpTo`); card id scheme (`a-{k}`/`n-{k}`/`nbtn-{k}`) matches Module 2's `buildCard`; bookmark btn is index 1 of `.ayah-actions` (Module 2 order: play·bookmark·copy·share·note·ai).
```
