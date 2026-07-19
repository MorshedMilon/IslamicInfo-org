# Universal "Select & Ask QuranlyAI" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a user highlight text in any marked content block on any page and send it — with source metadata — to the existing QuranlyAI widget via a floating action menu.

**Architecture:** One self-loading DOM module (`select-to-ask.js`) + a pure logic core (`select-to-ask-core.js`) detect selections inside `[data-ai-selectable]` containers, render a Shadow-DOM menu, and hand off to `window.QuranlyAI.route(action, meta)`. Shared routing/labels live in the existing `quranly-ai-core.js`; a new generic `summarize` backend action is added. Verify routes to `verify.html`; Save persists locally. No new chat UI.

**Tech Stack:** Vanilla ES5-style browser JS (UMD/IIFE, matching existing `src/js`), Web Components + Shadow DOM, Cloudflare Worker (Gemini) backend, Node's built-in test runner (`node --test`).

**Spec:** `doc/superpowers/specs/2026-07-19-select-to-ask-global-design.md`

**Conventions in this repo:**
- Frontend modules are UMD/IIFE using `var`/`function` (no ES modules, no arrow functions). Match that style.
- Frontend pure-logic modules expose themselves on `window.II.<name>` and also `module.exports` (see `src/js/quranly-ai-core.js`).
- Tests for UMD frontend modules use **CommonJS** (`require`) so the UMD's `this`-based root resolves to `module.exports`. Worker tests use ESM `import` (worker files use `export`).
- Run a single test file: `node --test test/<file>.test.js` (frontend) or from `worker/`: `node --test test/<file>.test.js`.

---

## File Structure

**New:**
- `src/js/select-to-ask-core.js` — pure logic: content-type → menu model, metadata builder, eligibility.
- `src/js/select-to-ask.js` — self-loading DOM controller: selection listeners, Shadow-DOM menu, positioning, handoff.
- `test/select-to-ask-core.test.js` — unit tests for the core.
- `test/quranly-ai-core.test.js` — unit tests for the new `quranly-ai-core.js` additions (chips per type, router helpers).

**Modified:**
- `worker/src/lib/prompts.js` — generic `summarize` task wording + token cap.
- `worker/src/quranlyai.js` — add `summarize` to `VALID_ACTIONS`.
- `worker/test/prompts.test.js` — tests for `summarize`.
- `src/js/quranly-ai-core.js` — content-type-aware `CHIPS`; add `routeKind` / `verifyUrl` / `saveSelection`.
- `src/js/quranly-ai.js` — add `QuranlyAI.route(action, meta)`.
- `src/js/quranly-ai-panel.js` — chip clicks dispatch through `route` for non-AI actions.
- `verify.html` — `?q=&ref=&mode=` prefill + auto-run.
- `hadith.js`, `dua.html`, `knowledge-hub.html`, `islamic-studies.html`, `src/js/quran-verses.js` — mark `data-ai-selectable` containers.
- All 15 top-level HTML pages — add the `select-to-ask.js` script tag.

---

## Phase A — Backend: generic `summarize` action

### Task 1: Failing tests for `summarize`

**Files:**
- Test: `worker/test/prompts.test.js`

- [ ] **Step 1: Add failing tests**

Append to `worker/test/prompts.test.js`:

```js
test('summarize builds a context-aware task line per type', () => {
  const h = buildUserPrompt('summarize', { rawText: 'X', type: 'hadith' }, '', null);
  assert.match(h, /Summarize the provided hadith in at most 5 bullet points/i);
  const d = buildUserPrompt('summarize', { rawText: 'X', type: 'dua' }, '', null);
  assert.match(d, /Summarize the provided dua/i);
  const a = buildUserPrompt('summarize', { rawText: 'X', type: 'article' }, '', null);
  assert.match(a, /Summarize the provided passage/i);
  const q = buildUserPrompt('summarize', { rawText: 'X', type: 'quran' }, '', null);
  assert.match(q, /Summarize the provided ayah/i);
});

test('summarize is capped at 400 output tokens', () => {
  assert.ok(maxTokensFor('summarize') <= 400);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run (from `worker/`): `node --test test/prompts.test.js`
Expected: FAIL — the summarize task line is currently the generic `explain` fallback, and `maxTokensFor('summarize')` returns 600.

### Task 2: Implement `summarize`

**Files:**
- Modify: `worker/src/lib/prompts.js`
- Modify: `worker/src/quranlyai.js:15-18`

- [ ] **Step 1: Add the per-type label map + special-case the task line**

In `worker/src/lib/prompts.js`, add above `buildUserPrompt`:

```js
// Generic summarize: one action, per-type wording (no separate summarize functions).
const SUMMARIZE_LABEL = { hadith: 'hadith', dua: 'dua', article: 'passage', quran: 'ayah' };
```

Then in `buildUserPrompt`, replace this line:

```js
  parts.push('TASK: ' + (ACTION_INSTRUCTION[action] || ACTION_INSTRUCTION.explain));
```

with:

```js
  let task;
  if (action === 'summarize') {
    const label = SUMMARIZE_LABEL[ctx.type] || 'text';
    task = 'Summarize the provided ' + label + ' in at most 5 bullet points. Do not exceed 5 bullets.';
  } else {
    task = ACTION_INSTRUCTION[action] || ACTION_INSTRUCTION.explain;
  }
  parts.push('TASK: ' + task);
```

(`ctx` already exists at the top of `buildUserPrompt` as `const ctx = context || {};`.)

- [ ] **Step 2: Cap summarize tokens**

In `worker/src/lib/prompts.js`, change `maxTokensFor`:

```js
export function maxTokensFor(action) {
  if (action === 'summarize' || action === 'summarize_tafsir' || action === 'key_lessons') return 400;
  if (action === 'custom') return 800;
  return 600;
}
```

- [ ] **Step 3: Allow the action through the handler gate**

In `worker/src/quranlyai.js`, add `'summarize'` to `VALID_ACTIONS`:

```js
const VALID_ACTIONS = new Set([
  'explain', 'simple', 'summarize', 'summarize_tafsir', 'key_lessons', 'related_verses',
  'related_hadith', 'asbab_al_nuzul', 'compare_translations', 'vocabulary', 'custom',
]);
```

- [ ] **Step 4: Run tests to verify pass**

Run (from `worker/`): `node --test test/prompts.test.js`
Expected: PASS (all prompt tests).

- [ ] **Step 5: Commit**

```bash
git add worker/src/lib/prompts.js worker/src/quranlyai.js worker/test/prompts.test.js
git commit -m "feat(quranlyai): generic summarize action (per-type wording, provided-text)"
```

---

## Phase B — Shared core: chips per type + router helpers

### Task 3: Failing tests for `quranly-ai-core.js` additions

**Files:**
- Test: `test/quranly-ai-core.test.js` (new)

- [ ] **Step 1: Write the failing test (CommonJS)**

Create `test/quranly-ai-core.test.js`:

```js
const { test } = require('node:test');
const assert = require('node:assert');
const core = require('../src/js/quranly-ai-core.js');

function memStore() {
  const m = {};
  return { getItem: (k) => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); } };
}

test('chips are content-type aware with 5 buttons each', () => {
  assert.equal(core.chipsFor('quran')[0].label, 'Explain this Ayah');
  assert.equal(core.chipsFor('quran')[4].action, 'related_hadith');
  assert.equal(core.chipsFor('hadith')[0].label, 'Explain this Hadith');
  assert.equal(core.chipsFor('hadith')[4].action, 'verify');
  assert.equal(core.chipsFor('article')[0].label, 'Explain this Passage');
  assert.equal(core.chipsFor('dua')[0].label, 'Explain this Dua');
  ['quran', 'hadith', 'article', 'dua'].forEach((t) => {
    assert.equal(core.chipsFor(t).length, 5);
    assert.equal(core.chipsFor(t)[1].action, 'simple');
    assert.equal(core.chipsFor(t)[2].action, 'key_lessons');
  });
});

test('routeKind classifies actions', () => {
  assert.equal(core.routeKind('verify'), 'verify');
  assert.equal(core.routeKind('save'), 'save');
  assert.equal(core.routeKind('explain'), 'ai');
  assert.equal(core.routeKind('summarize'), 'ai');
  assert.equal(core.routeKind('related_verses'), 'ai');
});

test('verifyUrl encodes selected text + ref for the verify page', () => {
  assert.equal(core.verifyUrl({ rawText: 'x y', sourceRef: 'Bukhari:1' }),
    'verify.html?mode=hadith&q=x%20y&ref=Bukhari%3A1');
  assert.equal(core.verifyUrl({ rawText: 'a' }), 'verify.html?mode=hadith&q=a');
});

test('saveSelection persists and de-dupes', () => {
  const s = memStore();
  assert.equal(core.saveSelection(s, { rawText: 'hello world', type: 'hadith', sourceRef: 'Bukhari:1', ts: 1 }).saved, true);
  assert.equal(core.saveSelection(s, { rawText: 'hello world', type: 'hadith', ts: 2 }).saved, false);
  assert.equal(JSON.parse(s.getItem('ii-saved-selections')).length, 1);
  assert.equal(core.saveSelection(s, { rawText: '   ', type: 'dua', ts: 3 }).saved, false);
});
```

- [ ] **Step 2: Run to verify it fails**

Run (repo root): `node --test test/quranly-ai-core.test.js`
Expected: FAIL — `routeKind`/`verifyUrl`/`saveSelection` are undefined and `chipsFor('hadith')` currently has 2 items.

### Task 4: Implement chips + router helpers

**Files:**
- Modify: `src/js/quranly-ai-core.js:17-36` (CHIPS) and the returned object

- [ ] **Step 1: Replace the `CHIPS` object**

In `src/js/quranly-ai-core.js`, replace the whole `var CHIPS = {...};` block with:

```js
  var CHIPS = {
    quran: [
      { action: 'explain', label: 'Explain this Ayah' },
      { action: 'simple', label: 'Explain Simply' },
      { action: 'key_lessons', label: 'Key Lessons' },
      { action: 'related_verses', label: 'Related Verses' },
      { action: 'related_hadith', label: 'Related Hadith' }
    ],
    hadith: [
      { action: 'explain', label: 'Explain this Hadith' },
      { action: 'simple', label: 'Explain Simply' },
      { action: 'key_lessons', label: 'Key Lessons' },
      { action: 'related_verses', label: 'Related Verses' },
      { action: 'verify', label: 'Verify Hadith' }
    ],
    article: [
      { action: 'explain', label: 'Explain this Passage' },
      { action: 'simple', label: 'Explain Simply' },
      { action: 'key_lessons', label: 'Key Lessons' },
      { action: 'related_verses', label: 'Related Verses' },
      { action: 'related_hadith', label: 'Related Hadith' }
    ],
    dua: [
      { action: 'explain', label: 'Explain this Dua' },
      { action: 'simple', label: 'Explain Simply' },
      { action: 'key_lessons', label: 'Key Lessons' },
      { action: 'related_verses', label: 'Related Verses' },
      { action: 'related_hadith', label: 'Related Hadith' }
    ],
    search: [{ action: 'custom', label: 'Explain these Results' }]
  };
```

- [ ] **Step 2: Add the router helpers**

In `src/js/quranly-ai-core.js`, add these functions before the `return {` block:

```js
  // Route classification shared by the widget chips and the selection menu.
  function routeKind(action) {
    if (action === 'verify') return 'verify';
    if (action === 'save') return 'save';
    return 'ai';
  }

  // Build the verify-page URL that prefills + auto-runs (contract defined in verify.html).
  function verifyUrl(meta) {
    var m = meta || {};
    var url = 'verify.html?mode=hadith&q=' + encodeURIComponent((m.rawText || '').trim());
    if (m.sourceRef) url += '&ref=' + encodeURIComponent(m.sourceRef);
    return url;
  }

  // Persist a highlighted snippet to a unified store (separate from per-item bookmarks).
  function saveSelection(storage, meta) {
    var KEY = 'ii-saved-selections';
    var m = meta || {};
    var text = String(m.rawText || '').trim();
    if (!text) return { saved: false, reason: 'empty' };
    var list;
    try { list = JSON.parse(storage.getItem(KEY) || '[]'); } catch (e) { list = []; }
    if (!Array.isArray(list)) list = [];
    var dup = list.some(function (x) { return x && x.text === text && x.type === (m.type || ''); });
    if (dup) return { saved: false, reason: 'duplicate' };
    list.push({ text: text, type: m.type || '', sourceRef: m.sourceRef || '', ts: m.ts || 0 });
    storage.setItem(KEY, JSON.stringify(list));
    return { saved: true, count: list.length };
  }
```

- [ ] **Step 3: Export the new helpers**

In the returned object at the bottom of `src/js/quranly-ai-core.js`, add:

```js
    routeKind: routeKind,
    verifyUrl: verifyUrl,
    saveSelection: saveSelection,
```

- [ ] **Step 4: Run to verify pass**

Run (repo root): `node --test test/quranly-ai-core.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/js/quranly-ai-core.js test/quranly-ai-core.test.js
git commit -m "feat(quranlyai): content-type-aware chips + shared route/verify/save helpers"
```

---

## Phase C — Selection core

### Task 5: Failing tests for `select-to-ask-core.js`

**Files:**
- Test: `test/select-to-ask-core.test.js` (new)

- [ ] **Step 1: Write the failing test (CommonJS)**

Create `test/select-to-ask-core.test.js`:

```js
const { test } = require('node:test');
const assert = require('node:assert');
const core = require('../src/js/select-to-ask-core.js');

test('maps data-ai-selectable values to QuranlyAI context types', () => {
  assert.equal(core.contextTypeFor('hadith'), 'hadith');
  assert.equal(core.contextTypeFor('dua'), 'dua');
  assert.equal(core.contextTypeFor('ayah'), 'quran');
  assert.equal(core.contextTypeFor('tafsir'), 'article');
  assert.equal(core.contextTypeFor('article'), 'article');
  assert.equal(core.contextTypeFor('unknown'), 'article');
});

test('menu is always 4 buttons; contextual 4th swaps by type', () => {
  const h = core.menuModel('hadith');
  assert.equal(h.length, 4);
  assert.deepEqual(h.map((i) => i.action), ['summarize', 'explain', 'verify', 'save']);
  const t = core.menuModel('tafsir');
  assert.deepEqual(t.map((i) => i.action), ['summarize', 'explain', 'related_verses', 'save']);
  assert.equal(core.menuModel('dua')[2].action, 'related_verses');
});

test('eligible requires a minimum trimmed length', () => {
  assert.equal(core.eligible('   a   '), false);
  assert.equal(core.eligible('intentions'), true);
});

test('buildMeta parses key, caps text, passes ref + ts', () => {
  const m = core.buildMeta({ selectable: 'ayah', key: '2:255', ref: '' }, '  Ayat al-Kursi  ', 42);
  assert.equal(m.type, 'quran');
  assert.equal(m.surah, 2);
  assert.equal(m.ayah, 255);
  assert.equal(m.rawText, 'Ayat al-Kursi');
  assert.equal(m.ts, 42);
  const h = core.buildMeta({ selectable: 'hadith', ref: 'Bukhari:1' }, 'text', 1);
  assert.equal(h.sourceRef, 'Bukhari:1');
  assert.equal('surah' in h, false);
  assert.equal(core.buildMeta({ selectable: 'dua' }, 'x'.repeat(5000), 1).rawText.length, core.MAX_TEXT);
});
```

- [ ] **Step 2: Run to verify it fails**

Run (repo root): `node --test test/select-to-ask-core.test.js`
Expected: FAIL — `Cannot find module '../src/js/select-to-ask-core.js'`.

### Task 6: Implement `select-to-ask-core.js`

**Files:**
- Create: `src/js/select-to-ask-core.js`

- [ ] **Step 1: Write the module**

Create `src/js/select-to-ask-core.js`:

```js
/* Select-to-Ask — pure, DOM-free logic (UMD). Shared by select-to-ask.js + tests. */
(function (root, factory) {
  var mod = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = mod;
  (root.II = root.II || {}).selectCore = mod;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var MAX_TEXT = 4000;
  var MIN_LEN = 6;

  // data-ai-selectable value -> QuranlyAI context type (drives chips + grounding).
  var TYPE_MAP = { hadith: 'hadith', dua: 'dua', ayah: 'quran', tafsir: 'article', article: 'article' };

  function contextTypeFor(selectable) {
    return TYPE_MAP[selectable] || 'article';
  }

  // Always 4 buttons. Contextual 4th swaps (never hides): Verify Hadith on hadith,
  // Related Verses elsewhere. Kind is resolved at click time via quranlyCore.routeKind.
  function menuModel(selectable) {
    var contextual = (selectable === 'hadith')
      ? { action: 'verify', label: 'Verify Hadith' }
      : { action: 'related_verses', label: 'Related Verses' };
    return [
      { action: 'summarize', label: 'Summarize' },
      { action: 'explain', label: 'Explain' },
      contextual,
      { action: 'save', label: 'Save' }
    ];
  }

  function capText(t) {
    return String(t || '').trim().slice(0, MAX_TEXT);
  }

  function eligible(text) {
    return capText(text).length >= MIN_LEN;
  }

  // attrs: { selectable, ref, key } -> selection payload for setContext/route.
  function buildMeta(attrs, rawText, ts) {
    attrs = attrs || {};
    var meta = {
      type: contextTypeFor(attrs.selectable),
      rawText: capText(rawText),
      sourceRef: attrs.ref || '',
      ts: ts || 0
    };
    var key = attrs.key || '';
    if (key.indexOf(':') !== -1) {
      var p = key.split(':');
      if (p[0]) meta.surah = +p[0];
      if (p[1]) meta.ayah = +p[1];
    }
    return meta;
  }

  return {
    MIN_LEN: MIN_LEN,
    MAX_TEXT: MAX_TEXT,
    contextTypeFor: contextTypeFor,
    menuModel: menuModel,
    capText: capText,
    eligible: eligible,
    buildMeta: buildMeta
  };
});
```

- [ ] **Step 2: Run to verify pass**

Run (repo root): `node --test test/select-to-ask-core.test.js`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/js/select-to-ask-core.js test/select-to-ask-core.test.js
git commit -m "feat(select-to-ask): pure core — type map, 4-button menu model, metadata builder"
```

---

## Phase D — Widget wiring (controller router + panel dispatch)

### Task 7: Add `QuranlyAI.route`

**Files:**
- Modify: `src/js/quranly-ai.js:91-130` (public API object)

Router logic delegates to the unit-tested core (`routeKind`/`verifyUrl`/`saveSelection`), so this is a thin, manually-verified DOM/navigation shim.

- [ ] **Step 1: Add `route` to the public API**

In `src/js/quranly-ai.js`, inside the `window.QuranlyAI = { ... }` object, add this method (e.g. right after `ask: function (...) {...},`):

```js
    route: function (action, meta) {
      var kind = core.routeKind ? core.routeKind(action) : 'ai';
      if (kind === 'verify') {
        window.location.href = core.verifyUrl(meta || state.context);
        return;
      }
      if (kind === 'save') {
        var res;
        try { res = core.saveSelection(window.localStorage, meta || state.context); }
        catch (e) { res = { saved: false }; }
        var msg = (res && res.saved) ? 'Saved to your selections ✦'
          : (res && res.reason === 'duplicate') ? 'Already saved'
          : 'Could not save';
        if (window.showToast) window.showToast(msg);
        return;
      }
      // ai
      if (meta) this.setContext(meta);
      this.ask(action);
    },
```

- [ ] **Step 2: Manual smoke check**

Serve the site on `http://localhost:3000` (an allowed origin), open the console on any page and run:
```js
QuranlyAI.route('save', { rawText: 'test snippet', type: 'dua' });
JSON.parse(localStorage.getItem('ii-saved-selections'));
```
Expected: a toast (if the page has `showToast`) and one stored item.

- [ ] **Step 3: Commit**

```bash
git add src/js/quranly-ai.js
git commit -m "feat(quranlyai): QuranlyAI.route dispatches ai/verify/save via shared core"
```

### Task 8: Panel chips dispatch non-AI actions through `route`

**Files:**
- Modify: `src/js/quranly-ai-panel.js:61-70` (`_renderChips`)

- [ ] **Step 1: Update the chip click handler**

In `src/js/quranly-ai-panel.js`, in `_renderChips`, replace this line:

```js
      b.addEventListener('click', function () { self.runAsk(chip.action, ''); });
```

with:

```js
      b.addEventListener('click', function () {
        var kind = core.routeKind ? core.routeKind(chip.action) : 'ai';
        if (kind === 'ai') { self.runAsk(chip.action, ''); }
        else if (window.QuranlyAI && window.QuranlyAI.route) { window.QuranlyAI.route(chip.action, self._context); }
      });
```

This keeps the SSE streaming path unchanged for AI chips and routes `verify` (hadith chip #5) out to the verify flow.

- [ ] **Step 2: Manual check**

On `hadith.html` (after Phase G), open the widget from a hadith selection → chip row shows "Verify Hadith" as #5 → clicking it navigates to `verify.html` prefilled. AI chips still stream.

- [ ] **Step 3: Commit**

```bash
git add src/js/quranly-ai-panel.js
git commit -m "feat(quranlyai): panel chips route verify/save out, keep AI streaming"
```

---

## Phase E — Selection DOM controller

### Task 9: Implement `select-to-ask.js` (self-loading controller)

**Files:**
- Create: `src/js/select-to-ask.js`

- [ ] **Step 1: Write the module**

Create `src/js/select-to-ask.js`:

```js
/* QuranlyAI — global "Select & Ask" menu. One tag on any page:
     <script src="src/js/select-to-ask.js?v=..."></script>
   Highlight text inside any [data-ai-selectable] container -> a floating Shadow-DOM
   menu appears at the selection -> the chosen action routes into window.QuranlyAI.
   Self-loads its pure core (select-to-ask-core.js) from the same folder. */
(function () {
  'use strict';
  var self = document.currentScript;
  var src = (self && self.src) || '';
  var q = (src.match(/[?&]v=[^&]+/) || [''])[0].replace(/^&/, '?');
  var dir = src.replace(/[?#].*$/, '').replace(/[^/]*$/, '');

  function boot() {
    var core = (window.II && window.II.selectCore) || {};
    var qcore = (window.II && window.II.quranlyCore) || {};
    if (!core.menuModel) { console.error('[select-to-ask] core did not load'); return; }

    var CSS =
      '.m{position:fixed;display:none;align-items:stretch;background:#0F2A2C;' +
      'border:.5px solid rgba(197,160,89,.4);border-radius:11px;overflow:hidden;' +
      'box-shadow:0 12px 34px rgba(0,0,0,.34);font:600 13px/1 var(--font-body,Inter,system-ui,sans-serif);}' +
      '.m.open{display:inline-flex;}' +
      '.mi{display:inline-flex;align-items:center;padding:10px 13px;color:#e9e3d5;white-space:nowrap;' +
      'cursor:pointer;border:0;background:transparent;border-right:.5px solid rgba(255,255,255,.08);}' +
      '.mi:last-child{border-right:0;}.mi:hover{background:rgba(255,255,255,.07);}';

    var host = document.createElement('div');
    host.setAttribute('data-qai-select', '1');
    var shadow = host.attachShadow({ mode: 'open' });
    shadow.innerHTML = '<style>' + CSS + '</style><div class="m" role="menu"></div>';
    var menuEl = shadow.querySelector('.m');
    document.body.appendChild(host);

    var current = null; // { attrs, text }

    function hide() { menuEl.classList.remove('open'); current = null; }

    function selectableAncestor(node) {
      var el = node ? (node.nodeType === 1 ? node : node.parentElement) : null;
      while (el) {
        if (el.getAttribute && el.getAttribute('data-ai-selectable')) return el;
        el = el.parentElement;
      }
      return null;
    }

    function readAttrs(el) {
      return {
        selectable: el.getAttribute('data-ai-selectable'),
        ref: el.getAttribute('data-ai-ref') || '',
        key: el.getAttribute('data-ai-key') || el.getAttribute('data-key') || ''
      };
    }

    function renderMenu(selectable) {
      menuEl.innerHTML = '';
      core.menuModel(selectable).forEach(function (it) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'mi'; b.textContent = it.label;
        b.addEventListener('mousedown', function (e) { e.preventDefault(); }); // keep selection alive
        b.addEventListener('click', function (e) { e.preventDefault(); pick(it.action); });
        menuEl.appendChild(b);
      });
    }

    function position(rect) {
      var mw = menuEl.offsetWidth || 260, mh = menuEl.offsetHeight || 42;
      var top = rect.top - mh - 8;
      if (top < 6) top = rect.bottom + 8;
      var left = rect.left + rect.width / 2 - mw / 2;
      left = Math.max(6, Math.min(left, window.innerWidth - mw - 6));
      menuEl.style.top = top + 'px';
      menuEl.style.left = left + 'px';
    }

    function onSelect() {
      var sel = window.getSelection && window.getSelection();
      if (!sel || sel.isCollapsed || !sel.rangeCount) { hide(); return; }
      var text = sel.toString();
      if (!core.eligible(text)) { hide(); return; }
      var a = selectableAncestor(sel.anchorNode), f = selectableAncestor(sel.focusNode);
      if (!a || a !== f) { hide(); return; }
      var rect = sel.getRangeAt(0).getBoundingClientRect();
      if (!rect || (!rect.width && !rect.height)) { hide(); return; }
      current = { attrs: readAttrs(a), text: text };
      renderMenu(current.attrs.selectable);
      menuEl.classList.add('open');
      position(rect);
    }

    function pick(action) {
      if (!current) return;
      var meta = core.buildMeta(current.attrs, current.text, Date.now());
      hide();
      try { window.getSelection().removeAllRanges(); } catch (e) {}
      if (window.QuranlyAI && window.QuranlyAI.route) window.QuranlyAI.route(action, meta);
    }

    var deb;
    function schedule() { clearTimeout(deb); deb = setTimeout(onSelect, 120); }

    document.addEventListener('mouseup', schedule);
    document.addEventListener('selectionchange', schedule);
    document.addEventListener('scroll', function () { if (current) hide(); }, true);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hide(); });
    // silence unused lint on qcore (reserved for future kind-aware styling)
    void qcore;
  }

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  if (window.II && window.II.selectCore) { ready(boot); return; }
  var s = document.createElement('script');
  s.src = dir + 'select-to-ask-core.js' + q;
  s.onload = function () { ready(boot); };
  s.onerror = function () { console.error('[select-to-ask] failed to load core'); };
  document.head.appendChild(s);
})();
```

- [ ] **Step 2: Commit**

```bash
git add src/js/select-to-ask.js
git commit -m "feat(select-to-ask): self-loading Shadow-DOM selection menu controller"
```

(Manual verification happens in Phase H after containers are marked.)

---

## Phase F — Verify page prefill

### Task 10: `verify.html` accepts `?q=&ref=&mode=`

**Files:**
- Modify: `verify.html` (add a script just before `</body>`, after the page's existing scripts so `setMode`/`runVerify` are defined)

- [ ] **Step 1: Add the prefill script**

Add immediately before `</body>` in `verify.html`:

```html
<!-- Select & Ask handoff: prefill + auto-run when arriving with ?q= -->
<script>
(function () {
  try {
    var p = new URLSearchParams(location.search);
    var q = p.get('q'); if (!q) return;
    var ref = p.get('ref'); var mode = p.get('mode');
    function run() {
      var input = document.getElementById('verifyInput');
      if (!input) return;
      input.value = ref ? (q + '\n\n(' + ref + ')') : q;
      if (mode && typeof setMode === 'function') {
        var btn = document.querySelector('.vmode[onclick*="\'' + mode + '\'"]');
        if (btn) setMode(btn, mode);
      }
      if (typeof runVerify === 'function') runVerify();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
    else run();
  } catch (e) { /* non-fatal */ }
})();
</script>
```

- [ ] **Step 2: Manual check**

Open `verify.html?mode=hadith&q=Actions%20are%20by%20intentions&ref=Bukhari%3A1`.
Expected: the textarea is prefilled with the text + `(Bukhari:1)`, the Hadith mode is active, and the verify runs automatically.

- [ ] **Step 3: Commit**

```bash
git add verify.html
git commit -m "feat(verify): accept ?q=&ref=&mode= prefill + auto-run for Select & Ask"
```

---

## Phase G — Rollout: script tag + marked containers

### Task 11: Add the `select-to-ask.js` tag to all pages

**Files:**
- Modify: `about.html`, `contact.html`, `dua.html`, `habits.html`, `hadith.html`, `index.html`, `inheritance.html`, `islamic-studies.html`, `knowledge-hub.html`, `privacy.html`, `quran.html`, `terms.html`, `tools.html`, `verify.html` (14 pages)

- [ ] **Step 1: Add the tag next to the widget tag**

On each page, find the existing line:

```html
<script src="src/js/quranlyai-widget.js?v=20260718c"></script>
```

and add immediately **after** it:

```html
<script src="src/js/select-to-ask.js?v=20260719a"></script>
```

(If a page uses a different `?v=` on the widget tag, keep your added tag's version as `20260719a` — the selection module manages its own cache-bust.)

- [ ] **Step 2: Commit**

```bash
git add about.html contact.html dua.html habits.html hadith.html index.html inheritance.html islamic-studies.html knowledge-hub.html privacy.html quran.html terms.html tools.html verify.html
git commit -m "feat(select-to-ask): include the selection module site-wide"
```

### Task 12: Mark hadith cards

**Files:**
- Modify: `src/js/hadith.js:67` (inside `_buildCard`)

- [ ] **Step 1: Add data attributes to the card element**

In `src/js/hadith.js`, change the card's opening tag from:

```js
    <article class="hadith-card reveal" id="${cardId}" role="article">
```

to:

```js
    <article class="hadith-card reveal" id="${cardId}" role="article"
             data-ai-selectable="hadith" data-ai-ref="${h.collection}:${h.number}">
```

- [ ] **Step 2: Commit**

```bash
git add src/js/hadith.js
git commit -m "feat(select-to-ask): mark hadith cards selectable (ref = collection:number)"
```

### Task 13: Mark dua cards

**Files:**
- Modify: `dua.html` (each `<div class="card dua-card ...">`)

- [ ] **Step 1: Add the attribute to every dua card**

In `dua.html`, add `data-ai-selectable="dua"` to each dua card container. Every occurrence of a dua card opens like:

```html
<div class="card dua-card reveal">
```

Change each to include the attribute, e.g.:

```html
<div class="card dua-card reveal" data-ai-selectable="dua">
```

(Apply to all `dua-card` variants, including those with extra reveal classes like `reveal-d1`.)

- [ ] **Step 2: Commit**

```bash
git add dua.html
git commit -m "feat(select-to-ask): mark dua cards selectable"
```

### Task 14: Mark knowledge-hub article cards

**Files:**
- Modify: `knowledge-hub.html` (each `<div class="article-card reveal">`)

- [ ] **Step 1: Add the attribute to every article card**

In `knowledge-hub.html`, change each article card opening from:

```html
<div class="article-card reveal">
```

to:

```html
<div class="article-card reveal" data-ai-selectable="tafsir">
```

- [ ] **Step 2: Commit**

```bash
git add knowledge-hub.html
git commit -m "feat(select-to-ask): mark knowledge-hub article cards selectable"
```

### Task 15: Mark islamic-studies lesson items

**Files:**
- Modify: `islamic-studies.html` (each `<div class="lesson-item">`)

- [ ] **Step 1: Add the attribute to every lesson item**

In `islamic-studies.html`, change each lesson item opening from:

```html
<div class="lesson-item">
```

to:

```html
<div class="lesson-item" data-ai-selectable="tafsir">
```

- [ ] **Step 2: Commit**

```bash
git add islamic-studies.html
git commit -m "feat(select-to-ask): mark islamic-studies lesson items selectable"
```

### Task 16: Mark Quran ayah cards

**Files:**
- Modify: `src/js/quran-verses.js` (the card element creation, near the click-listener line `card.addEventListener('click', function () { window.setActiveVerse(card); });`)

- [ ] **Step 1: Set the attributes where the card is built**

In `src/js/quran-verses.js`, locate where each ayah `card` element is created and its `data-key` (verse key `vk`, e.g. `"2:255"`) is assigned. Immediately after the card's `data-key`/class is set, add:

```js
    card.setAttribute('data-ai-selectable', 'ayah');
    card.setAttribute('data-ai-key', vk);
```

(`vk` is the verse key already used for `data-key`; if the local variable has a different name, use whichever holds the `"surah:ayah"` string.)

- [ ] **Step 2: Commit**

```bash
git add src/js/quran-verses.js
git commit -m "feat(select-to-ask): mark Quran ayah cards selectable (key = surah:ayah)"
```

---

## Phase H — Full verification

### Task 17: Run all tests + live manual pass

- [ ] **Step 1: Run every test suite**

Run (repo root): `node --test test/quranly-ai-core.test.js test/select-to-ask-core.test.js`
Run (from `worker/`): `node --test test/prompts.test.js`
Expected: all PASS.

- [ ] **Step 2: Serve locally on an allowed origin**

Serve the repo root at `http://localhost:3000` (in `ALLOWED_ORIGINS`) — e.g. `npx http-server -p 3000 .` or any static server.

- [ ] **Step 3: Manual checklist (each of the 4 page types + Quran)**

For `hadith.html`, `dua.html`, `knowledge-hub.html`, `islamic-studies.html`, `quran.html`:
- Highlight a phrase inside a marked block → the floating menu appears at the selection (above, or flipped below near the top).
- Menu shows exactly 4 buttons; 3rd is **Verify Hadith** on hadith, **Related Verses** elsewhere.
- **Summarize** / **Explain** → the QuranlyAI widget opens and streams an answer grounded on the selected text; the chip row matches the content type (e.g. "Explain this Hadith", chip #5 "Verify Hadith" on hadith).
- **Verify Hadith** → navigates to `verify.html`, prefilled with the text + `(ref)`, auto-running.
- **Related Verses** on a block with a verse key → real related verses; on a dua with no key → "not documented in available sources" (never invented).
- **Save** → toast + an entry in `localStorage['ii-saved-selections']`.
- Dismissal: click elsewhere, `Escape`, or scroll hides the menu.
- Arabic/RTL: highlight Arabic hadith/ayah text → menu still positions correctly.

- [ ] **Step 4: Confirm no regression to the existing widget**

Open the floating ✨ widget cold on `quran.html` → still shows the 5 Quran chips (Phase B changed labels/actions but kept the quran set). Verse click still seeds context.

- [ ] **Step 5: Final commit (if any manual-fix tweaks were needed)**

```bash
git add -A
git commit -m "test(select-to-ask): verification pass fixes"
```

---

## Self-Review notes (author)

- **Spec coverage:** menu (Task 6/9), contextual 4th swap (Task 6), reuse existing widget (Task 7/9), metadata contract (Task 6 + Tasks 12–16), chip content-awareness (Task 4), generic summarize (Tasks 1–2), verify routing (Tasks 4/10), save store (Task 4), grounding fallback (unchanged; verified Task 17), rollout scope (Tasks 11–16), quota untouched (route reuses `ask`). All spec sections map to a task.
- **Router placement note:** `routeKind`/`verifyUrl`/`saveSelection` live in `quranly-ai-core.js` (not `select-to-ask-core.js` as the spec's §8 prose suggested) because the lazy-loaded panel already depends on `quranly-ai-core` and both the chips and the menu need them from one source. Behavior is identical to the spec.
- **Type consistency:** `route(action, meta)`, `routeKind`, `verifyUrl`, `saveSelection`, `menuModel`, `buildMeta`, `contextTypeFor`, `eligible` names are used identically across tasks. Context types (`quran`/`hadith`/`article`/`dua`) match `CHIPS` keys and `TYPE_MAP` outputs.
