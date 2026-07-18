# QuranlyAI Frontend Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a single shared vanilla-JS module (`window.QuranlyAI`) — a floating button + Shadow-DOM slide-out panel that streams the backend's SSE `/api/quranlyai/ask` response — that any IslamicInfo.org page can load via `<script>` and drive with `setContext()` + inline `renderContextButton()`.

**Architecture:** All correctness lives in a pure UMD `quranly-ai-core.js` (SSE frame parser, chip config, payload builder, verdict backstop, quota text, FAB offset math) unit-tested with `node:test`. Two thin browser controllers sit on top: `quranly-ai.js` (always-loaded — global API + `<quranly-floating-button>` + lazy panel loader) and `quranly-ai-panel.js` (lazy-loaded — `<quranly-panel>` Shadow DOM + streaming render loop). Panel CSS is a separate file adopted into the shadow root on first open. Coexists with the existing `.ai-card`; no live page HTML is edited.

**Tech Stack:** Vanilla JS (classic IIFE, `window.QuranlyAI`), Web Components (`customElements`), Shadow DOM, Fetch `ReadableStream` + `TextDecoderStream`, Node built-in test runner (`node:test`), no bundler/npm.

**Reference:** Design spec `doc/superpowers/specs/2026-07-17-quranlyai-frontend-integration-design.md`.

**Execution environment note:** Node v24 is installed. Unit tests are CommonJS (`require`) run from the repo root via `node --test "tests/quran/quranly-ai-core.test.js"` (bare `node --test dir/` fails on Node 24/Windows — use an explicit file/glob). Browser controllers cannot be `node:test`'d (no jsdom, and we won't add one); they are verified by `node --check <file>` (syntax) + the Task 6 demo harness. All commands run via the **Bash** tool (Git Bash). Work on branch `feat/quranlyai-frontend` (already created; do NOT switch).

---

## File Structure

```
src/js/quranly-ai-core.js              NEW  pure UMD logic (no DOM/network) — unit-tested
tests/quran/quranly-ai-core.test.js    NEW  node:test unit tests
src/css/quranly-ai.css                 NEW  panel styles (design tokens), adopted into shadow root
src/js/quranly-ai.js                   NEW  always-loaded: window.QuranlyAI + <quranly-floating-button> + lazy loader
src/js/quranly-ai-panel.js             NEW  lazy-loaded: <quranly-panel> (Shadow DOM) + streaming render
tools/quranly-ai-demo.html             NEW  manual harness page
tools/quranly-ai-mock.mjs              NEW  local Node SSE mock server for the harness
doc/quranly-ai-integration.md          NEW  per-page copy-paste integration snippets
doc/API-SPEC.md                        MOD  one-line note: SSE client for /api/quranlyai/ask is quranly-ai.js
```

**Design tokens consumed (verified names, from `doc/DESIGN-SYSTEM.md` + `quran.html`):**
`--gold-500 #C5A059`, `--gold-400 #D9B358`, `--gold-aura` (AI accent); `--teal-700 #00696E`;
`--ink-primary #0F2A2C`, `--ink-body`, `--ink-muted`; `--surface #F4F7F7`, `--surface-card #FAFBFB`, `--white`;
`--elev-4` (drawer shadow); `--ease-reverent` = `cubic-bezier(.22,1,.36,1)`; `--r-md 14px`, `--r-lg 18px`;
`--font-display`, `--font-body`. Header z-index is `1000`; use FAB `900`, panel `950`.

---

### Task 1: Core — anon id, chips, payload, quota text, verdict backstop, FAB offset

**Files:**
- Create: `src/js/quranly-ai-core.js`
- Create: `tests/quran/quranly-ai-core.test.js`

- [ ] **Step 1: Write the failing test**

`tests/quran/quranly-ai-core.test.js`:
```js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const core = require('../../src/js/quranly-ai-core.js');

function fakeStorage(init) {
  const m = Object.assign({}, init);
  return { getItem: (k) => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); }, _m: m };
}

test('getOrCreateAnonId creates once and is stable on reread', () => {
  const s = fakeStorage();
  const a = core.getOrCreateAnonId(s);
  const b = core.getOrCreateAnonId(s);
  assert.equal(a, b);
  assert.equal(s._m['ii-anon-id'], a);
  assert.ok(a.length >= 8);
});

test('chipsFor returns the right chips per context type', () => {
  assert.deepEqual(core.chipsFor('quran').map((c) => c.action),
    ['explain', 'simple', 'key_lessons', 'related_verses', 'related_hadith']);
  assert.deepEqual(core.chipsFor('hadith').map((c) => c.action), ['explain', 'related_verses']);
  assert.deepEqual(core.chipsFor('dua').map((c) => c.action), ['explain']);
  assert.deepEqual(core.chipsFor('article').map((c) => c.action), ['summarize_tafsir']);
  assert.deepEqual(core.chipsFor('search').map((c) => c.action), ['custom']);
  // unknown/none → generic default
  assert.deepEqual(core.chipsFor(undefined).map((c) => c.action), ['explain', 'custom']);
});

test('buildAskPayload shapes the request body and omits customQuestion unless custom', () => {
  const ctx = { type: 'quran', surah: 2, ayah: 255, rawText: 'V' };
  const p = core.buildAskPayload(ctx, 'explain', '', 'fp-1');
  assert.deepEqual(p, { context: ctx, action: 'explain', userIdOrFingerprint: 'fp-1' });
  const p2 = core.buildAskPayload(ctx, 'custom', 'What is taqwa?', 'fp-1');
  assert.equal(p2.customQuestion, 'What is taqwa?');
});

test('quotaText formats remaining of max', () => {
  assert.equal(core.quotaText(2, 3), '2 of 3 questions remaining today');
  assert.equal(core.quotaText(null, 3), '3 of 3 questions remaining today');
});

test('containsVerdictLanguage matches parity with the AI backstop', () => {
  assert.equal(core.containsVerdictLanguage('This is haram.'), true);
  assert.equal(core.containsVerdictLanguage('This verse teaches patience.'), false);
  assert.match(core.SCHOLAR_REDIRECT, /qualified scholar/i);
});

test('fabBottomOffset clears the audio player bar when present', () => {
  assert.equal(core.fabBottomOffset(null, 800, 24, 12), 24); // no bar → default
  // bar top at y=740 in an 800px viewport → 800-740=60, +12 gap = 72 > default 24
  assert.equal(core.fabBottomOffset({ top: 740 }, 800, 24, 12), 72);
  // bar high up → default wins
  assert.equal(core.fabBottomOffset({ top: 100 }, 800, 24, 12), 24 > 712 ? 24 : 712);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test "tests/quran/quranly-ai-core.test.js"`
Expected: FAIL — cannot find module `../../src/js/quranly-ai-core.js`.

- [ ] **Step 3: Write minimal implementation**

`src/js/quranly-ai-core.js`:
```js
/* QuranlyAI — pure core (DOM-free, UMD). Shared by quranly-ai.js + quranly-ai-panel.js. */
(function (root, factory) {
  var mod = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = mod;
  (root.II = root.II || {}).quranlyCore = mod;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ANON_KEY = 'ii-anon-id';

  // Conservative v1 backstop — identical to quran-ai-core.js; final term set owned by the 🕌 reviewer (CONTENT-POLICY §4/§6).
  var VERDICT_FRAMING = /\b(?:is|are|it'?s|its|be|being|was|were|becomes?|remains?|considered|declared|deemed|ruled)\s+(?:(?:not|an?|clearly|strictly|definitely|therefore|thus|now|then)\s+)?(?:haram|haraam|halal|forbidden|impermissible|permissible|unlawful|lawful|obligatory|sinful|makruh|mustahabb|wajib|fard)\b/i;
  var VERDICT_TERMS = /\bfatwa\b|fatwā|\bit is a sin\b|\bit'?s a sin\b/i;

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
      { action: 'related_verses', label: 'Related Verses' }
    ],
    dua: [{ action: 'explain', label: 'Explain this Dua' }],
    article: [{ action: 'summarize_tafsir', label: 'Summarize this Article' }],
    search: [{ action: 'custom', label: 'Explain these Results' }]
  };
  var DEFAULT_CHIPS = [
    { action: 'explain', label: 'Explain' },
    { action: 'custom', label: 'Ask a question' }
  ];

  function getOrCreateAnonId(storage) {
    var id = storage.getItem(ANON_KEY);
    if (!id) {
      id = (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : ('a-' + Date.now() + '-' + Math.floor(Math.random() * 1e9).toString(16));
      storage.setItem(ANON_KEY, id);
    }
    return id;
  }

  function chipsFor(type) {
    return (CHIPS[type] || DEFAULT_CHIPS).slice();
  }

  function buildAskPayload(context, action, customQuestion, anonId) {
    var payload = { context: context || {}, action: action, userIdOrFingerprint: anonId };
    if (action === 'custom' && customQuestion) payload.customQuestion = customQuestion;
    return payload;
  }

  function quotaText(remaining, max) {
    var r = (remaining == null ? max : remaining);
    return r + ' of ' + max + ' questions remaining today';
  }

  function containsVerdictLanguage(text) {
    var s = String(text || '');
    return VERDICT_FRAMING.test(s) || VERDICT_TERMS.test(s);
  }

  // audioRect: a getBoundingClientRect()-like object ({top}) or null. Returns the FAB `bottom` px.
  function fabBottomOffset(audioRect, viewportH, defaultBottom, gap) {
    if (!audioRect) return defaultBottom;
    var fromBottom = viewportH - audioRect.top;
    return Math.max(defaultBottom, fromBottom + gap);
  }

  return {
    getOrCreateAnonId: getOrCreateAnonId,
    chipsFor: chipsFor,
    buildAskPayload: buildAskPayload,
    quotaText: quotaText,
    containsVerdictLanguage: containsVerdictLanguage,
    fabBottomOffset: fabBottomOffset,
    ANON_KEY: ANON_KEY,
    SCHOLAR_REDIRECT: 'For personal religious guidance, consult a qualified scholar.'
  };
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test "tests/quran/quranly-ai-core.test.js"`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/js/quranly-ai-core.js tests/quran/quranly-ai-core.test.js
git commit -m "feat(quranly): pure core — anon id, chips, payload, quota, verdict, FAB offset"
```
End commit body with: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`

---

### Task 2: Core — incremental SSE parser (`parseSSE`)

**Files:**
- Modify: `src/js/quranly-ai-core.js`
- Modify: `tests/quran/quranly-ai-core.test.js`

- [ ] **Step 1: Write the failing test** (append these tests to the file)

```js
test('parseSSE parses a single message frame and leaves no remainder', () => {
  const r = core.parseSSE('data: {"delta":"Hi"}\n\n');
  assert.equal(r.rest, '');
  assert.deepEqual(r.events, [{ event: 'message', data: { delta: 'Hi' } }]);
});

test('parseSSE returns multiple deltas in order', () => {
  const r = core.parseSSE('data: {"delta":"A"}\n\ndata: {"delta":"B"}\n\n');
  assert.deepEqual(r.events.map((e) => e.data.delta), ['A', 'B']);
  assert.equal(r.rest, '');
});

test('parseSSE carries an unterminated frame forward as rest', () => {
  const r = core.parseSSE('data: {"delta":"A"}\n\ndata: {"del');
  assert.equal(r.events.length, 1);
  assert.equal(r.rest, 'data: {"del');
});

test('parseSSE captures the done event with JSON metadata', () => {
  const r = core.parseSSE('event: done\ndata: {"remaining":2,"confidence":"High","sources":["Quran 2:255"]}\n\n');
  assert.equal(r.events[0].event, 'done');
  assert.equal(r.events[0].data.remaining, 2);
  assert.equal(r.events[0].data.confidence, 'High');
});

test('parseSSE ignores comments and blank lines, keeps raw string on non-JSON data', () => {
  const r = core.parseSSE(': keep-alive\n\ndata: plain text\n\n');
  // comment frame yields an event with null data; then a data frame with raw string
  assert.equal(r.events[r.events.length - 1].data, 'plain text');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test "tests/quran/quranly-ai-core.test.js"`
Expected: FAIL — `core.parseSSE is not a function`.

- [ ] **Step 3: Add `parseSSE` to the core**

In `src/js/quranly-ai-core.js`, add this function inside the factory (before the `return`):
```js
  // Incremental SSE frame parser. Pass the accumulated buffer (rest + newChunk);
  // returns { events: [{event, data}], rest } where rest is the unterminated remainder.
  // data is JSON-parsed when possible, else the raw string; frames with no data → null.
  function parseSSE(buffer) {
    var events = [];
    var idx;
    while ((idx = buffer.indexOf('\n\n')) !== -1) {
      var frame = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      var ev = 'message';
      var dataLines = [];
      frame.split('\n').forEach(function (line) {
        if (line.charAt(line.length - 1) === '\r') line = line.slice(0, -1);
        if (!line || line.charAt(0) === ':') return; // blank line or comment
        var c = line.indexOf(':');
        var field = c === -1 ? line : line.slice(0, c);
        var val = c === -1 ? '' : line.slice(c + 1);
        if (val.charAt(0) === ' ') val = val.slice(1);
        if (field === 'event') ev = val;
        else if (field === 'data') dataLines.push(val);
      });
      if (dataLines.length) {
        var raw = dataLines.join('\n');
        var data;
        try { data = JSON.parse(raw); } catch (e) { data = raw; }
        events.push({ event: ev, data: data });
      } else {
        events.push({ event: ev, data: null });
      }
    }
    return { events: events, rest: buffer };
  }
```
And add `parseSSE: parseSSE,` to the returned object.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test "tests/quran/quranly-ai-core.test.js"`
Expected: PASS (11 tests total).

- [ ] **Step 5: Commit**

```bash
git add src/js/quranly-ai-core.js tests/quran/quranly-ai-core.test.js
git commit -m "feat(quranly): incremental SSE frame parser in core"
```
End commit body with: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`

---

### Task 3: Panel stylesheet (`quranly-ai.css`)

**Files:**
- Create: `src/css/quranly-ai.css`

*(No unit test — CSS. Verified visually in Task 6. Consumes design tokens through the shadow boundary.)*

- [ ] **Step 1: Create `src/css/quranly-ai.css`**

```css
/* QuranlyAI panel — adopted into <quranly-panel>'s shadow root. Uses global design
   tokens (inherited through the shadow boundary); AI accent = gold. Dark mode flips
   automatically via the inherited [data-theme="dark"] token overrides on :root. */
:host {
  --qa-accent: var(--gold-500, #C5A059);
  --qa-accent-2: var(--gold-400, #D9B358);
  font-family: var(--font-body, Inter, system-ui, sans-serif);
  color: var(--ink-body, #26403f);
}
.qa-drawer {
  position: fixed; top: 60px; right: 0; bottom: 0; width: min(380px, 92vw);
  background: var(--surface-card, #FAFBFB);
  border-left: .5px solid rgba(197, 160, 89, .35);
  box-shadow: var(--elev-4, 0 24px 60px rgba(0,0,0,.22));
  z-index: 950; display: flex; flex-direction: column;
  transform: translateX(100%);
  transition: transform .35s var(--ease-reverent, cubic-bezier(.22,1,.36,1));
}
.qa-drawer.qa-open { transform: translateX(0); }
.qa-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 18px; border-bottom: .5px solid rgba(197,160,89,.25);
  font-family: var(--font-display, "Cormorant Garamond", serif);
  font-size: 1.25rem; color: var(--ink-primary, #0F2A2C);
}
.qa-head .qa-star { color: var(--qa-accent); }
.qa-close { background: none; border: 0; cursor: pointer; font-size: 1.1rem; color: var(--ink-muted, #5a6f6e); line-height: 1; }
.qa-thread { flex: 1; overflow-y: auto; padding: 16px 18px; display: flex; flex-direction: column; gap: 12px; }
.qa-msg { border-radius: var(--r-md, 14px); padding: 10px 12px; font-size: .92rem; line-height: 1.5; white-space: pre-wrap; }
.qa-msg.qa-user { align-self: flex-end; background: rgba(0,105,110,.10); color: var(--ink-primary, #0F2A2C); }
.qa-msg.qa-ai { align-self: flex-start; background: rgba(197,160,89,.10); border: .5px solid rgba(197,160,89,.28); }
.qa-sources { margin-top: 8px; font-size: .8rem; color: var(--ink-muted, #5a6f6e); }
.qa-confidence { display: inline-block; margin-top: 6px; font-size: .72rem; padding: 2px 8px; border-radius: 999px; background: rgba(197,160,89,.18); color: var(--ink-primary, #0F2A2C); }
.qa-error { align-self: stretch; color: #8a2b2b; font-size: .88rem; }
.qa-chips { display: flex; flex-wrap: wrap; gap: 8px; padding: 10px 18px; border-top: .5px solid rgba(197,160,89,.2); }
.qa-chip {
  border: .5px solid var(--qa-accent); background: transparent; color: var(--ink-primary, #0F2A2C);
  border-radius: 999px; padding: 6px 12px; font-size: .82rem; cursor: pointer;
  transition: background .2s var(--ease-reverent, cubic-bezier(.22,1,.36,1));
}
.qa-chip:hover { background: rgba(197,160,89,.14); }
.qa-inputrow { display: flex; gap: 8px; padding: 12px 18px; border-top: .5px solid rgba(197,160,89,.2); }
.qa-input { flex: 1; border: .5px solid rgba(0,0,0,.15); border-radius: var(--r-md, 14px); padding: 9px 12px; font: inherit; background: var(--white, #fff); color: var(--ink-body, #26403f); }
.qa-send { border: 0; border-radius: var(--r-md, 14px); padding: 9px 14px; cursor: pointer; background: var(--qa-accent); color: #1a1204; font-weight: 600; }
.qa-send:disabled { opacity: .5; cursor: default; }
.qa-foot { padding: 8px 18px; font-size: .72rem; color: var(--ink-muted, #5a6f6e); border-top: .5px solid rgba(197,160,89,.2); }
.qa-quota { padding: 4px 18px 10px; font-size: .74rem; color: var(--ink-muted, #5a6f6e); }
@media (max-width: 480px) { .qa-drawer { top: 52px; width: 100vw; } }
```

- [ ] **Step 2: Sanity-check it's non-empty and well-formed (brace balance)**

Run: `node -e "const c=require('fs').readFileSync('src/css/quranly-ai.css','utf8'); const o=(c.match(/{/g)||[]).length, cl=(c.match(/}/g)||[]).length; if(o!==cl){console.error('brace mismatch',o,cl);process.exit(1)} console.log('css ok, rules:',o)"`
Expected: `css ok, rules: <n>` (braces balanced).

- [ ] **Step 3: Commit**

```bash
git add src/css/quranly-ai.css
git commit -m "feat(quranly): panel stylesheet (design tokens, gold AI accent)"
```
End commit body with: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`

---

### Task 4: Always-loaded controller (`quranly-ai.js`) — global API + floating button

**Files:**
- Create: `src/js/quranly-ai.js`

*(Browser code — not node:test'able. Verified by `node --check` here and behavior in Task 6.)*

- [ ] **Step 1: Create `src/js/quranly-ai.js`**

```js
/* QuranlyAI — always-loaded controller. Exposes window.QuranlyAI, defines
   <quranly-floating-button>, and lazy-loads the panel on first open. Pure logic
   lives in quranly-ai-core.js (window.II.quranlyCore). */
(function () {
  'use strict';
  var core = (window.II && window.II.quranlyCore) || {};
  var SELF_SRC = (document.currentScript && document.currentScript.src) || '';
  var JS_DIR = SELF_SRC.replace(/[^/]*$/, '');            // .../src/js/
  var CSS_URL = JS_DIR.replace(/\/js\/$/, '/css/') + 'quranly-ai.css';
  var PANEL_URL = JS_DIR + 'quranly-ai-panel.js';

  var state = {
    inited: false,
    config: { apiBase: 'https://api.islamicinfo.org', maxPerDay: 3, cssUrl: CSS_URL },
    anonId: null,
    context: {},
    panelLoading: false,
    pending: []
  };

  /* ---- floating button web component ---- */
  var FAB_CSS =
    ':host{position:fixed;right:18px;bottom:24px;z-index:900;font-family:var(--font-body,Inter,system-ui,sans-serif);}' +
    'button{display:inline-flex;align-items:center;gap:8px;border:0;cursor:pointer;border-radius:999px;' +
    'padding:12px 18px;font-size:.9rem;font-weight:600;color:#1a1204;' +
    'background:linear-gradient(135deg,var(--gold-400,#D9B358),var(--gold-500,#C5A059));' +
    'box-shadow:var(--gold-aura,0 8px 24px rgba(197,160,89,.4));}' +
    '.label{white-space:nowrap;}' +
    '@media (max-width:480px){button{padding:12px;}.label{display:none;}}';

  function FloatingButton() { return Reflect.construct(HTMLElement, [], FloatingButton); }
  FloatingButton.prototype = Object.create(HTMLElement.prototype);
  FloatingButton.prototype.constructor = FloatingButton;
  FloatingButton.prototype.connectedCallback = function () {
    var sh = this.shadowRoot || this.attachShadow({ mode: 'open' });
    sh.innerHTML = '<style>' + FAB_CSS + '</style>' +
      '<button type="button" aria-label="Ask QuranlyAI"><span aria-hidden="true">✨</span>' +
      '<span class="label">Ask QuranlyAI</span></button>';
    var self = this;
    sh.querySelector('button').addEventListener('click', function () { window.QuranlyAI.open(); });
    this._reposition();
    this._onResize = function () { self._reposition(); };
    window.addEventListener('resize', this._onResize);
  };
  FloatingButton.prototype.disconnectedCallback = function () {
    if (this._onResize) window.removeEventListener('resize', this._onResize);
  };
  FloatingButton.prototype._reposition = function () {
    var bar = document.getElementById('audio-player') || document.querySelector('.audio-player');
    var rect = bar ? bar.getBoundingClientRect() : null;
    var bottom = core.fabBottomOffset(
      rect && rect.height ? { top: rect.top } : null,
      window.innerHeight, 24, 12
    );
    this.style.setProperty('--qa-fab-bottom', bottom + 'px');
    // :host bottom is fixed in CSS; override via inline style on the host element:
    this.style.bottom = bottom + 'px';
    this.style.position = 'fixed';
    this.style.right = '18px';
    this.style.zIndex = '900';
  };
  if (!customElements.get('quranly-floating-button')) {
    customElements.define('quranly-floating-button', FloatingButton);
  }

  /* ---- lazy panel loader ---- */
  function ensurePanel(cb) {
    if (customElements.get('quranly-panel')) { mountPanel(); if (cb) cb(); return; }
    state.pending.push(cb);
    if (state.panelLoading) return;
    state.panelLoading = true;
    var s = document.createElement('script');
    s.src = PANEL_URL;
    s.onload = function () {
      mountPanel();
      state.panelLoading = false;
      var q = state.pending.slice(); state.pending.length = 0;
      q.forEach(function (fn) { if (fn) fn(); });
    };
    s.onerror = function () { state.panelLoading = false; console.error('[QuranlyAI] panel failed to load'); };
    document.head.appendChild(s);
  }
  function panelEl() { return document.querySelector('quranly-panel'); }
  function mountPanel() {
    if (!panelEl()) document.body.appendChild(document.createElement('quranly-panel'));
  }

  /* ---- public API ---- */
  window.QuranlyAI = {
    init: function (config) {
      if (state.inited) return;
      Object.assign(state.config, config || {});
      try { state.anonId = core.getOrCreateAnonId(window.localStorage); } catch (e) { state.anonId = 'anon-nostore'; }
      if (!document.querySelector('quranly-floating-button')) {
        document.body.appendChild(document.createElement('quranly-floating-button'));
      }
      state.inited = true;
    },
    setContext: function (ctx) { state.context = ctx || {}; },
    getState: function () { return state; }, // used by the panel component
    open: function (prefilledAction) {
      ensurePanel(function () {
        var p = panelEl();
        if (p && p.openPanel) p.openPanel(state.context, prefilledAction || null);
      });
    },
    close: function () { var p = panelEl(); if (p && p.closePanel) p.closePanel(); },
    ask: function (action, customQuestion) {
      ensurePanel(function () {
        var p = panelEl();
        if (p && p.runAsk) { if (p.openPanel) p.openPanel(state.context, null); p.runAsk(action, customQuestion || ''); }
      });
    },
    renderContextButton: function (targetElementId, label, defaultAction) {
      var host = document.getElementById(targetElementId);
      if (!host) { console.warn('[QuranlyAI] renderContextButton: #' + targetElementId + ' not found'); return; }
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'qa-context-btn';
      btn.textContent = label;
      btn.style.cssText = 'cursor:pointer;border:.5px solid var(--gold-500,#C5A059);background:transparent;' +
        'color:var(--ink-primary,#0F2A2C);border-radius:999px;padding:4px 10px;font:inherit;font-size:.85em;';
      btn.addEventListener('click', function () { window.QuranlyAI.open(defaultAction); });
      host.appendChild(btn);
      return btn;
    }
  };
})();
```

- [ ] **Step 2: Verify syntax**

Run: `node --check src/js/quranly-ai.js`
Expected: no output, exit 0.

- [ ] **Step 3: Commit**

```bash
git add src/js/quranly-ai.js
git commit -m "feat(quranly): window.QuranlyAI + floating button + lazy panel loader"
```
End commit body with: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`

---

### Task 5: Lazy panel component (`quranly-ai-panel.js`) — Shadow DOM + streaming render

**Files:**
- Create: `src/js/quranly-ai-panel.js`

*(Browser code — verified by `node --check` here and behavior in Task 6.)*

- [ ] **Step 1: Create `src/js/quranly-ai-panel.js`**

```js
/* QuranlyAI — lazy-loaded panel. Defines <quranly-panel> (Shadow DOM). Streams the
   SSE response from /api/quranlyai/ask, rendering deltas live; correctness (SSE
   parsing, verdict backstop, quota text) comes from window.II.quranlyCore. */
(function () {
  'use strict';
  var core = (window.II && window.II.quranlyCore) || {};

  function QuranlyPanel() { return Reflect.construct(HTMLElement, [], QuranlyPanel); }
  QuranlyPanel.prototype = Object.create(HTMLElement.prototype);
  QuranlyPanel.prototype.constructor = QuranlyPanel;

  QuranlyPanel.prototype.connectedCallback = function () {
    if (this._built) return;
    this._built = true;
    var sh = this.attachShadow({ mode: 'open' });
    sh.innerHTML =
      '<div class="qa-drawer" part="drawer">' +
      '  <div class="qa-head"><span><span class="qa-star">✨</span> QuranlyAI</span>' +
      '    <button class="qa-close" aria-label="Close">✕</button></div>' +
      '  <div class="qa-thread"></div>' +
      '  <div class="qa-chips"></div>' +
      '  <div class="qa-inputrow"><input class="qa-input" type="text" placeholder="Ask a question…">' +
      '    <button class="qa-send">Send</button></div>' +
      '  <div class="qa-quota"></div>' +
      '  <div class="qa-foot">Powered by QuranlyAI · Educational purposes only · No Fatwas</div>' +
      '</div>';
    this._els = {
      drawer: sh.querySelector('.qa-drawer'),
      thread: sh.querySelector('.qa-thread'),
      chips: sh.querySelector('.qa-chips'),
      input: sh.querySelector('.qa-input'),
      send: sh.querySelector('.qa-send'),
      quota: sh.querySelector('.qa-quota')
    };
    var self = this;
    sh.querySelector('.qa-close').addEventListener('click', function () { self.closePanel(); });
    this._els.send.addEventListener('click', function () { self._sendFree(); });
    this._els.input.addEventListener('keydown', function (e) { if (e.key === 'Enter') self._sendFree(); });
    this._loadStyles(sh);
    var cfg = (window.QuranlyAI.getState && window.QuranlyAI.getState().config) || {};
    this._els.quota.textContent = core.quotaText(null, cfg.maxPerDay || 3);
  };

  QuranlyPanel.prototype._loadStyles = function (sh) {
    var cfg = (window.QuranlyAI.getState && window.QuranlyAI.getState().config) || {};
    var url = cfg.cssUrl;
    if (!url) return;
    fetch(url).then(function (r) { return r.text(); }).then(function (css) {
      var st = document.createElement('style'); st.textContent = css; sh.appendChild(st);
    }).catch(function () { /* unstyled but functional */ });
  };

  QuranlyPanel.prototype.openPanel = function (context, prefilledAction) {
    this._context = context || {};
    this._renderChips();
    var self = this; requestAnimationFrame(function () { self._els.drawer.classList.add('qa-open'); });
    if (prefilledAction) this.runAsk(prefilledAction, '');
  };
  QuranlyPanel.prototype.closePanel = function () { this._els.drawer.classList.remove('qa-open'); };

  QuranlyPanel.prototype._renderChips = function () {
    var self = this;
    this._els.chips.innerHTML = '';
    core.chipsFor(this._context && this._context.type).forEach(function (chip) {
      var b = document.createElement('button');
      b.className = 'qa-chip'; b.type = 'button'; b.textContent = chip.label;
      b.addEventListener('click', function () { self.runAsk(chip.action, ''); });
      self._els.chips.appendChild(b);
    });
  };

  QuranlyPanel.prototype._sendFree = function () {
    var q = this._els.input.value.trim();
    if (!q) return;
    this._els.input.value = '';
    this.runAsk('custom', q);
  };

  QuranlyPanel.prototype._bubble = function (cls, text) {
    var d = document.createElement('div');
    d.className = 'qa-msg ' + cls; d.textContent = text || '';
    this._els.thread.appendChild(d);
    this._els.thread.scrollTop = this._els.thread.scrollHeight;
    return d;
  };

  QuranlyPanel.prototype.runAsk = function (action, customQuestion) {
    var self = this;
    var st = window.QuranlyAI.getState();
    var cfg = st.config;
    this._bubble('qa-user', customQuestion || action.replace(/_/g, ' '));
    var ai = this._bubble('qa-ai', '');
    this._els.send.disabled = true;
    var payload = core.buildAskPayload(st.context, action, customQuestion, st.anonId);

    fetch(cfg.apiBase + '/api/quranlyai/ask', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    }).then(function (res) {
      if (res.status === 429) { self._fail(ai, 'Daily limit reached — you’ve used all ' + (cfg.maxPerDay || 3) + ' today.'); return null; }
      if (res.status === 403) { self._fail(ai, 'QuranlyAI isn’t available on this site.'); return null; }
      if (!res.ok || !res.body) { self._fail(ai, 'QuranlyAI is temporarily unavailable — please try again.'); return null; }
      return self._stream(res.body, ai);
    }).catch(function () {
      self._fail(ai, 'QuranlyAI is temporarily unavailable — please try again.');
    });
  };

  QuranlyPanel.prototype._stream = function (body, ai) {
    var self = this;
    var reader = body.pipeThrough(new TextDecoderStream()).getReader();
    var buffer = '', full = '';
    function pump() {
      return reader.read().then(function (res) {
        if (res.done) { self._finalize(ai, full, null); return; }
        buffer += res.value;
        var parsed = core.parseSSE(buffer);
        buffer = parsed.rest;
        parsed.events.forEach(function (ev) {
          if (ev.event === 'done') { self._finalize(ai, full, ev.data); }
          else if (ev.data && typeof ev.data.delta === 'string') { full += ev.data.delta; ai.textContent = full; self._els.thread.scrollTop = self._els.thread.scrollHeight; }
        });
        return pump();
      });
    }
    return pump();
  };

  QuranlyPanel.prototype._finalize = function (ai, full, meta) {
    if (core.containsVerdictLanguage(full)) { ai.textContent = core.SCHOLAR_REDIRECT; }
    if (meta) {
      if (meta.sources && meta.sources.length) {
        var s = document.createElement('div'); s.className = 'qa-sources';
        s.textContent = 'Sources: ' + meta.sources.join(' · '); ai.appendChild(s);
      }
      if (meta.confidence) {
        var c = document.createElement('span'); c.className = 'qa-confidence';
        c.textContent = 'Confidence: ' + meta.confidence; ai.appendChild(c);
      }
      var cfg = window.QuranlyAI.getState().config;
      this._els.quota.textContent = core.quotaText(meta.remaining, cfg.maxPerDay || 3);
    }
    this._els.send.disabled = false;
  };

  QuranlyPanel.prototype._fail = function (ai, msg) {
    ai.className = 'qa-msg qa-error'; ai.textContent = msg;
    this._els.send.disabled = false;
  };

  if (!customElements.get('quranly-panel')) customElements.define('quranly-panel', QuranlyPanel);
})();
```

- [ ] **Step 2: Verify syntax**

Run: `node --check src/js/quranly-ai-panel.js`
Expected: no output, exit 0.

- [ ] **Step 3: Commit**

```bash
git add src/js/quranly-ai-panel.js
git commit -m "feat(quranly): <quranly-panel> Shadow DOM component + SSE streaming render"
```
End commit body with: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`

---

### Task 6: Demo harness + local SSE mock (behavioral verification)

**Files:**
- Create: `tools/quranly-ai-mock.mjs`
- Create: `tools/quranly-ai-demo.html`

- [ ] **Step 1: Create the local SSE mock `tools/quranly-ai-mock.mjs`**

```js
/* Local mock of POST /api/quranlyai/ask for the demo harness. Streams SSE like the
   Worker. Run: node tools/quranly-ai-mock.mjs  (listens on http://localhost:8788) */
import http from 'node:http';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') { res.writeHead(204, CORS); return res.end(); }
  if (req.method !== 'POST' || !req.url.endsWith('/api/quranlyai/ask')) {
    res.writeHead(404, CORS); return res.end('not found');
  }
  let body = '';
  req.on('data', (c) => { body += c; });
  req.on('end', () => {
    // simulate quota exhaustion for a special fingerprint
    let payload = {}; try { payload = JSON.parse(body); } catch (_) {}
    if (payload.userIdOrFingerprint === 'over-quota') {
      res.writeHead(429, { ...CORS, 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ remaining: 0 }));
    }
    res.writeHead(200, { ...CORS, 'Content-Type': 'text/event-stream; charset=utf-8', 'X-Cache': 'MISS' });
    const chunks = [
      '**Answer**\nThis verse teaches reliance on Allah and patience. ',
      'It reminds the believer that help comes through steadfastness.\n\n',
      '**Key Lessons**\n- Trust in Allah\n- Patience in hardship\n\n',
      '**Sources**\n- Quran 2:255\n\n**Confidence**: High\n\n',
      '**Note**: Educational explanation only. Not a fatwa.'
    ];
    let i = 0;
    const tick = setInterval(() => {
      if (i < chunks.length) {
        res.write(`data: ${JSON.stringify({ delta: chunks[i++] })}\n\n`);
      } else {
        clearInterval(tick);
        res.write(`event: done\ndata: ${JSON.stringify({ sources: ['Quran 2:255'], confidence: 'High', model: 'mock', cached: false, remaining: 2 })}\n\n`);
        res.end();
      }
    }, 120);
  });
});
server.listen(8788, () => console.log('QuranlyAI mock on http://localhost:8788'));
```

- [ ] **Step 2: Create `tools/quranly-ai-demo.html`**

```html
<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>QuranlyAI demo</title>
<style>
  :root{ --gold-500:#C5A059; --gold-400:#D9B358; --gold-aura:0 8px 24px rgba(197,160,89,.4);
    --teal-700:#00696E; --ink-primary:#0F2A2C; --ink-body:#26403f; --ink-muted:#5a6f6e;
    --surface:#F4F7F7; --surface-card:#FAFBFB; --white:#fff; --elev-4:0 24px 60px rgba(0,0,0,.22);
    --ease-reverent:cubic-bezier(.22,1,.36,1); --r-md:14px; --r-lg:18px;
    --font-body:Inter,system-ui,sans-serif; --font-display:"Cormorant Garamond",serif; }
  body{ font-family:var(--font-body); background:var(--surface); color:var(--ink-body); padding:40px; }
  .audio-player{ position:fixed; left:0; right:0; bottom:0; height:56px; background:#fff;
    border-top:1px solid #ddd; display:flex; align-items:center; padding:0 20px; }
  button.demo{ margin:6px; padding:8px 12px; }
</style></head>
<body>
  <h1>QuranlyAI demo harness</h1>
  <p>Start the mock first: <code>node tools/quranly-ai-mock.mjs</code></p>
  <p>Inline context button target: <span id="ayah-btn"></span></p>
  <button class="demo" onclick="QuranlyAI.setContext({type:'quran',surah:2,ayah:255,translationId:'en-saheeh',language:'en',rawText:'Allah - there is no deity except Him...'});QuranlyAI.open()">Set quran context + open</button>
  <button class="demo" onclick="QuranlyAI.setContext({type:'hadith',hadithBook:'Sahih al-Bukhari',hadithNumber:1,language:'en',rawText:'Actions are by intentions...'});QuranlyAI.open()">Set hadith context + open</button>
  <div class="audio-player">mock audio player bar</div>

  <script src="../src/js/quranly-ai-core.js"></script>
  <script src="../src/js/quranly-ai.js"></script>
  <script>
    QuranlyAI.init({ apiBase: 'http://localhost:8788', maxPerDay: 3, cssUrl: '../src/css/quranly-ai.css' });
    QuranlyAI.setContext({ type: 'quran', surah: 2, ayah: 255, translationId: 'en-saheeh', language: 'en', rawText: 'Ayat al-Kursi text' });
    QuranlyAI.renderContextButton('ayah-btn', '✨', 'explain');
  </script>
</body></html>
```

- [ ] **Step 3: Drive the harness and verify behavior**

Start the mock in the background: `node tools/quranly-ai-mock.mjs &` (note the PID). Then open `tools/quranly-ai-demo.html` in a browser (or drive it with the `run` / `claude-playwright` skill) and confirm:
1. The **✨ Ask QuranlyAI** floating button appears bottom-right, sitting **above** the `.audio-player` bar (not overlapping it).
2. Clicking the inline **✨** or a **chip** opens the drawer (slides in from the right, gold accent).
3. The AI bubble fills **incrementally** as deltas stream, then shows a **Sources** line, a **Confidence: High** badge, and the quota updates to "2 of 3 questions remaining today".
4. The chips match the context type (quran shows 5 chips; switch to hadith → 2 chips).
5. Setting `apiBase` fingerprint to over-quota (edit init or use the mock's `over-quota` id) yields the **429** inline message.
6. Stopping the mock and asking again yields the **temporarily unavailable** inline message.

If browser automation isn't available, record that this step was verified manually (or note it as pending manual QA). Stop the mock afterward (`kill <PID>`).

- [ ] **Step 4: Commit**

```bash
git add tools/quranly-ai-demo.html tools/quranly-ai-mock.mjs
git commit -m "test(quranly): demo harness + local SSE mock for manual verification"
```
End commit body with: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`

---

### Task 7: Integration snippets doc + API-SPEC note

**Files:**
- Create: `doc/quranly-ai-integration.md`
- Modify: `doc/API-SPEC.md`

- [ ] **Step 1: Create `doc/quranly-ai-integration.md`** with copy-paste snippets

Include: a "how to add QuranlyAI to a page" preamble (load `quranly-ai-core.js` then `quranly-ai.js` at page bottom, call `QuranlyAI.init(...)`), then a section per page type with the exact `setContext` + `renderContextButton` calls. Use these verbatim examples:

```html
<!-- At the bottom of any page: load core then controller, then init -->
<script src="src/js/quranly-ai-core.js"></script>
<script src="src/js/quranly-ai.js"></script>
<script>QuranlyAI.init();</script>
```

```html
<!-- Quran reader -->
<script>
QuranlyAI.setContext({ type:'quran', surah:2, ayah:255, translationId:'en-saheeh',
  tafsirSource:'ibn-kathir', language:'en', rawText: currentAyahText });
QuranlyAI.renderContextButton('ayah-255-ai-btn', '✨', 'explain');
</script>
```

```html
<!-- Hadith page -->
<script>
QuranlyAI.setContext({ type:'hadith', hadithBook:'Sahih al-Bukhari', hadithNumber:50,
  language:'en', rawText: currentHadithText });
QuranlyAI.renderContextButton('hadith-ai-btn', '✨ Explain this Hadith', 'explain');
</script>
```

```html
<!-- Dua page -->
<script>
QuranlyAI.setContext({ type:'dua', duaId:'morning-dua-1', rawText: currentDuaText });
QuranlyAI.renderContextButton('dua-ai-btn', '✨ Explain this Dua', 'explain');
</script>
```

```html
<!-- Article page -->
<script>
QuranlyAI.setContext({ type:'article', articleId:'the-meaning-of-tawakkul', rawText: articleExcerpt });
QuranlyAI.renderContextButton('article-ai-btn', '✨ Summarize with QuranlyAI', 'summarize_tafsir');
</script>
```

```html
<!-- Search results (only when low/no results) -->
<script>
QuranlyAI.setContext({ type:'search', rawText: searchQuery });
QuranlyAI.renderContextButton('search-ai-btn',
  'Didn’t find what you’re looking for? ✨ Ask QuranlyAI', 'custom');
</script>
```

Also document `init({ apiBase, maxPerDay })` options, the `ii-anon-id` localStorage key, and that the panel + CSS lazy-load on first open. State clearly that enabling the `api.islamicinfo.org` Worker route is a prerequisite for live use.

- [ ] **Step 2: Add a note to `doc/API-SPEC.md`**

In the `## POST /api/quranlyai/ask` section, add a bullet: `**Client:** \`src/js/quranly-ai.js\` (window.QuranlyAI) consumes this SSE stream — floating button + Shadow-DOM panel, lazy-loaded; see \`doc/quranly-ai-integration.md\`.`

- [ ] **Step 3: Commit**

```bash
git add doc/quranly-ai-integration.md doc/API-SPEC.md
git commit -m "docs(quranly): per-page integration snippets + API-SPEC client note"
```
End commit body with: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`

---

### Task 8: Finish the branch

- [ ] **Step 1: Full verification sweep**

Run: `node --test "tests/quran/quranly-ai-core.test.js"` → all PASS (11 tests).
Run: `node --check src/js/quranly-ai.js && node --check src/js/quranly-ai-panel.js` → exit 0.
Run: `node --test "tests/quran/*.test.js"` → confirm no regression in the existing suite.

- [ ] **Step 2: Use the finishing-a-development-branch skill**

Invoke `superpowers:finishing-a-development-branch` to choose merge/PR/keep. Note for the human: live e2e is deferred until the backend endpoint is deployed and the `api.islamicinfo.org` route is enabled; generated output remains 🕌 human-review gated (CONTENT-POLICY §5).

---

## Self-Review

**Spec coverage:**
- §4 file layout → Tasks 1–7 create exactly those files ✓
- §5 core pure logic (anon id, chips, payload, parseSSE, verdict, quota, FAB offset) → Tasks 1–2 ✓
- §6 window.QuranlyAI API (init/setContext/open/close/ask/renderContextButton) → Task 4 ✓
- §7 `<quranly-panel>` Shadow DOM, chips table, footer, quota, gold accent → Tasks 3, 5 ✓
- §3 floating button (desktop pill / mobile icon), audio-player offset → Task 4 (FAB component + `_reposition`) ✓
- §9 SSE streaming flow → Task 5 `_stream`/`_finalize` over Task 2 `parseSSE` ✓
- §10 error handling (429/403/502/503/network) → Task 5 `runAsk`/`_fail` ✓
- §8 per-page context + snippets → Task 7 ✓
- §11 testing (unit + demo harness + mock) → Tasks 1,2,6 ✓
- §12 lazy-load performance → Task 4 `ensurePanel` + Task 5 (separate file) + Task 3 CSS fetched on open ✓
- §2 coexist / no live HTML edits → no task edits a live page; only `tools/` demo + `doc/` snippets ✓

**Placeholder scan:** No TBD/TODO. Every code step has complete code. Task 6 Step 3 is a behavioral checklist (browser), not a code placeholder; it names an explicit fallback (manual QA) when automation is unavailable.

**Type/name consistency:** `core.parseSSE(buffer)`→`{events, rest}` consistent (Tasks 2, 5). `core.chipsFor(type)`→`[{action,label}]` consistent (Tasks 1, 5). `core.buildAskPayload(context, action, customQuestion, anonId)` consistent (Tasks 1, 5). `core.fabBottomOffset(rect, viewportH, defaultBottom, gap)` consistent (Tasks 1, 4). `core.quotaText(remaining, max)` consistent (Tasks 1, 5). Panel public methods `openPanel(context, prefilledAction)`, `closePanel()`, `runAsk(action, customQuestion)` called by the controller in Task 4 match their definitions in Task 5. `window.QuranlyAI.getState()` defined in Task 4, consumed in Task 5. `config.cssUrl`/`config.apiBase`/`config.maxPerDay` set in Task 4, read in Task 5. All aligned.

**Known constraint flagged:** browser controllers aren't unit-tested (no jsdom by design) — mitigated by putting all correctness in the tested core and verifying the thin DOM shims via `node --check` + the Task 6 harness.
