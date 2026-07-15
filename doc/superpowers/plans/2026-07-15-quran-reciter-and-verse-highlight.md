# Quran Audio — Reciter Fix + Verse-Highlight Layers — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`).

**Goal:** (1) Reciter dropdown shows the full real list, default **Mishary Rashid Alafasy** (id 7), player always shows current reciter. (2) Add two independent, dev-toggleable verse-highlight layers (strengthened whole-verse block + progressive word-fill) on top of the unchanged `.word-active` single-word highlight; default both; keyboard/query-param toggle for live A/B.

**Architecture:** Pure helpers in `quran-audio-core.js` (node:test). Robust `init()` + highlight logic + injected `<style>` in `quran-audio.js`. No `quran.html`/CSS-file edit (styles injected via JS, easily strippable).

**Spec:** `doc/superpowers/specs/2026-07-15-quran-reciter-and-verse-highlight-design.md`. Read first.

---

### Task 1: Pure core helpers + tests (TDD)

**Files:** Edit `src/js/quran-audio-core.js`; Edit `tests/quran/audio-core.test.js`.

- [ ] **Step 1: Add failing tests** to `tests/quran/audio-core.test.js`:

```js
test('parseHighlightMode reads ?highlight, defaults both', () => {
  assert.equal(core.parseHighlightMode('?highlight=block'), 'block');
  assert.equal(core.parseHighlightMode('?x=1&highlight=fill'), 'fill');
  assert.equal(core.parseHighlightMode('?highlight=both'), 'both');
  assert.equal(core.parseHighlightMode(''), 'both');
  assert.equal(core.parseHighlightMode('?highlight=bogus'), 'both');
});
test('modeFlags', () => {
  assert.deepEqual(core.modeFlags('both'), { block: true, fill: true });
  assert.deepEqual(core.modeFlags('block'), { block: true, fill: false });
  assert.deepEqual(core.modeFlags('fill'), { block: false, fill: true });
});
test('wordFillStates: active = current, filled = up to current (1-based w)', () => {
  assert.deepEqual(core.wordFillStates(0, 3), [
    { active: false, filled: false }, { active: false, filled: false }, { active: false, filled: false }]);
  assert.deepEqual(core.wordFillStates(1, 3), [
    { active: true, filled: true }, { active: false, filled: false }, { active: false, filled: false }]);
  assert.deepEqual(core.wordFillStates(3, 3), [
    { active: false, filled: true }, { active: false, filled: true }, { active: true, filled: true }]);
});
test('nextHighlightMode cycles both->block->fill->both', () => {
  assert.equal(core.nextHighlightMode('both'), 'block');
  assert.equal(core.nextHighlightMode('block'), 'fill');
  assert.equal(core.nextHighlightMode('fill'), 'both');
});
```

- [ ] **Step 2: Run, verify FAIL** — `node --test tests/quran/audio-core.test.js`.

- [ ] **Step 3: Implement** — add inside the `quran-audio-core.js` factory (before `return`), and add the four names to the returned object:

```js
  function parseHighlightMode(search) {
    var m = /[?&]highlight=(block|fill|both)\b/.exec(String(search || ''));
    return m ? m[1] : 'both';
  }
  function modeFlags(mode) {
    return { block: mode === 'block' || mode === 'both', fill: mode === 'fill' || mode === 'both' };
  }
  function wordFillStates(w, count) {
    var out = [];
    for (var i = 0; i < count; i++) out.push({ active: i === (w - 1), filled: w > 0 && i <= (w - 1) });
    return out;
  }
  function nextHighlightMode(mode) {
    return mode === 'both' ? 'block' : (mode === 'block' ? 'fill' : 'both');
  }
```

- [ ] **Step 4: Run, verify PASS** — `node --test tests/quran/audio-core.test.js`.

- [ ] **Step 5: Commit** — `git add src/js/quran-audio-core.js tests/quran/audio-core.test.js && git commit -m "feat(quran-audio): highlight-mode + word-fill pure helpers + tests"`

---

### Task 2: Reciter robustness + highlight layers in `quran-audio.js`

**Files:** Edit `src/js/quran-audio.js`. (Multiple surgical edits — do NOT rewrite the file.)

- [ ] **Step 1: Add constants** near the state block (after `var gen = 0;`):

```js
  var DEFAULT_RECITER_ID = 7;
  var DEFAULT_RECITER = { id: DEFAULT_RECITER_ID, name: 'Mishary Rashid Alafasy', style: '' };
  var highlightMode = 'both';
```

- [ ] **Step 2: `clearHighlights()`** — add a third line clearing `.word-filled`:

```js
    Array.prototype.forEach.call(document.querySelectorAll('.wbw-word.word-filled'), function (w) { w.classList.remove('word-filled'); });
```

- [ ] **Step 3: `onTime()` word loop** — replace the existing `words` forEach with (adds `.word-filled`, keeps `.word-active` unchanged):

```js
    var words = card.querySelectorAll('.wbw-row .wbw-word');
    Array.prototype.forEach.call(words, function (el, i) {
      el.classList.toggle('word-active', i === (w - 1));
      el.classList.toggle('word-filled', w > 0 && i <= (w - 1));
    });
```

- [ ] **Step 4: Add highlight-mode helpers** — insert just above `function populatePicker()`:

```js
  function injectHighlightStyles() {
    if (document.getElementById('vhl-styles')) return;
    var css =
      '#versesCardList.vhl-block .ayah-card.ayah-playing{' +
      'background:linear-gradient(135deg,rgba(197,160,89,.15),rgba(197,160,89,.05))!important;' +
      'border-left:4px solid var(--gold-500)!important;}' +
      '[data-theme="dark"] #versesCardList.vhl-block .ayah-card.ayah-playing{' +
      'background:linear-gradient(135deg,rgba(197,160,89,.22),rgba(197,160,89,.08))!important;}' +
      '#versesCardList.vhl-fill .wbw-word.word-filled{background:rgba(197,160,89,.10);border-radius:8px;}' +
      '#versesCardList.vhl-fill .wbw-word.word-filled .wbw-ar{color:var(--gold-700);}' +
      '[data-theme="dark"] #versesCardList.vhl-fill .wbw-word.word-filled .wbw-ar{color:#C9AE72;}';
    var st = document.createElement('style'); st.id = 'vhl-styles'; st.textContent = css;
    (document.head || document.documentElement).appendChild(st);
  }
  function applyHighlightMode(mode) {
    highlightMode = mode;
    injectHighlightStyles();
    var el = document.getElementById('versesCardList') || document.body;
    var f = core.modeFlags(mode);
    el.classList.toggle('vhl-block', f.block);
    el.classList.toggle('vhl-fill', f.fill);
  }
```

- [ ] **Step 5: `init()` rewrite** — replace the whole `function init() { … }` body with the robust version (immediate demo-replace + default Alafasy + full-list load + highlight mode):

```js
  function init() {
    if (!core) return;
    reciterId = DEFAULT_RECITER_ID;
    try { var saved = Number(localStorage.getItem('ii-quran-reciter')); if (saved > 0) reciterId = saved; } catch (e) {}
    // Immediately replace the locked Al-Hussary demo with at least the default reciter.
    if (!reciters.length) reciters = [DEFAULT_RECITER];
    populatePicker();
    applyHighlightMode(core.parseHighlightMode(window.location.search));
    source.listReciters().then(function (list) {
      if (list && list.length) reciters = list;
      if (!reciters.some(function (r) { return r.id === reciterId; })) {
        reciterId = reciters.some(function (r) { return r.id === DEFAULT_RECITER_ID; })
          ? DEFAULT_RECITER_ID : (reciters[0] ? reciters[0].id : DEFAULT_RECITER_ID);
      }
      populatePicker();
    }).catch(function (e) { console.warn('[quran] reciters load failed:', e && e.message); });
  }
```

- [ ] **Step 6: Dev keyboard toggle** — immediately after the `if (document.readyState === 'loading') … else init();` line, add:

```js
  // Dev-only (temporary): Shift+H cycles highlight modes live for A/B — remove after the mode is chosen.
  document.addEventListener('keydown', function (e) {
    if (e.shiftKey && (e.key === 'H' || e.key === 'h')) {
      applyHighlightMode(core.nextHighlightMode(highlightMode));
      toast('Highlight: ' + highlightMode);
    }
  });
```

- [ ] **Step 7: Expose test hooks** — add to the `window.II.quranAudio = { … }` object:

```js
    _setHighlightMode: function (m) { applyHighlightMode(m); },
    _mode: function () { return highlightMode; },
```

- [ ] **Step 8: Syntax check** — `node --check src/js/quran-audio.js` → clean.

- [ ] **Step 9: Commit** — `git add src/js/quran-audio.js && git commit -m "feat(quran-audio): robust reciter init (Alafasy default, full list) + block/fill highlight layers + dev toggle"`

---

### Task 3: jsdom verification (reciter + highlight) + confirm no quran.html edit

**Files:** scratchpad harnesses (NOT committed); no `quran.html` change.

- [ ] **Step 1: Reciter harness** `<scratchpad>/verify-reciter.mjs` (model on prior `verify-audio*.mjs`/`verify-ai.mjs` jsdom+vm setup). Provide the audio DOM (`#reciterPicker` with the hardcoded 5 demo opts incl. Al-Hussary `.on`, `#reciterLabel`=Al-Hussary, `#apReciterName`=Al-Hussary, `#versesCardList`). Stub `core` by injecting `quran-audio-core.js`; stub `quran-qul-core.js`; inject `quran-audio.js`; mock the Quran.com fetch (`RECITERS_URL`) → 12 reciters incl. `{id:7,reciter_name:'Mishary Rashid Alafasy'}`; dispatch `DOMContentLoaded`. Assert:
  - After the async settles, `#reciterPicker .reciter-opt` count is the real list (12), NOT the 5 demo; the `.on` opt is Alafasy (id 7); `#reciterLabel` + `#apReciterName` reflect Alafasy (not Al-Hussary).
  - Clicking a different `.reciter-opt` → `window.selectReciter` runs → `#apReciterName` updates + `localStorage['ii-quran-reciter']` set.
  - With the fetch mocked to reject/empty → picker still shows the default (Alafasy) and never the Al-Hussary demo.
  - zero `console.error`.

- [ ] **Step 2: Highlight harness** `<scratchpad>/verify-highlight.mjs`. Build a `#versesCardList` with one `.ayah-card[data-key="1:2"]` (id `a-1-2`) containing a `.wbw-row` of 3 `.wbw-word`s. Drive the engine's `window.II.quranAudio` test hooks + a mock `<audio>` (settable `currentTime`/`duration`, dispatch `timeupdate`) with segments `[[1,0,300],[2,300,600],[3,600,900]]`. Assert:
  - On play, active card gets `.ayah-playing`.
  - As `currentTime` advances 0.1→0.4→0.7s and `timeupdate` fires, `.word-filled` accumulates (0 → word1 → word1-2 → word1-3) and `.word-active` is only the current word.
  - `_setHighlightMode('block')` → `#versesCardList` has `vhl-block`, not `vhl-fill`; `'fill'` → opposite; `'both'` → both; `_mode()` reflects it.
  - `Shift+H` keydown cycles the mode (`both→block→fill→both`) via `_mode()`.
  - Injected `<style id="vhl-styles">` exists; `.word-active` behavior unchanged; playback (playAt/onEnded) not broken.
  - zero `console.error`.
  (Reuse the Module-3 audio harness stubbing approach for `<audio>` if one exists in scratchpad; otherwise stub `HTMLMediaElement` play/pause + a settable `currentTime`.)

- [ ] **Step 3: Run both** — `node <scratchpad>/verify-reciter.mjs` and `node <scratchpad>/verify-highlight.mjs` → each `RESULT: N passed, 0 failed`, zero console errors. Iterate on `quran-audio.js` until green.

- [ ] **Step 4: Confirm scope** — `git diff --stat main...HEAD` must NOT list `quran.html` or any CSS file. Nothing to commit here (harnesses not committed).

---

## Final review

Adversarial pass over `git diff main...HEAD`: (a) reciter default = Alafasy id 7, demo reliably replaced, player/label always synced, saved pref respected, empty-list → default not demo; (b) `.word-active` untouched; word-fill accumulates + clears on ayah change/stop; (c) block + fill are independent (toggling one doesn't affect the other or `.word-active`); (d) injected CSS only, no `quran.html`/CSS-file edit, tokens not raw hex (except the one dark-mode fill color); (e) dev toggle works (query param + Shift+H) and is clearly marked temporary; (f) no console errors / unhandled rejections; (g) core helpers correct. Then finish via superpowers:finishing-a-development-branch.
