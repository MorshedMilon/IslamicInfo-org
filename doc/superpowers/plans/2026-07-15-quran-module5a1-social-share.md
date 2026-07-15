# Module 5A.1 — WhatsApp / SMS / Copy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`).

**Goal:** Add WhatsApp / SMS / Copy pills to the share modal that pre-fill the verse text (Arabic + translation + ref + edition + surah link). Extends Module 5A. Text-only (no image via these schemes). No 🕌 gate, no backend, no HTML/CSS edit (row injected by JS).

**Spec:** `doc/superpowers/specs/2026-07-15-quran-module5a1-social-share-design.md`.

---

### Task 1: Core — `buildShareText` / `waHref` / `smsHref` (TDD)

**Files:** Edit `src/js/quran-share-core.js`; Edit `tests/quran/share-core.test.js`.

- [ ] **Step 1: Add failing tests** to `tests/quran/share-core.test.js`:

```js
test('buildShareText composes verse + translation + attribution + url', () => {
  const m = { ar: 'ARB', en: 'the mercy', ref: 'Al-Fatihah 1:1', edition: 'Saheeh International' };
  const t = core.buildShareText(m, 'https://x/?surah=al-fatihah');
  assert.equal(t, 'ARB\n"the mercy"\n— Al-Fatihah 1:1 (Saheeh International)\nhttps://x/?surah=al-fatihah');
  assert.equal(core.buildShareText({ ar:'A', en:'e', ref:'R', edition:'' }, ''), 'A\n"e"\n— R');
  assert.equal(core.buildShareText({ en:'e', ref:'R', edition:'Ed' }, 'u'), '"e"\n— R (Ed)\nu'); // no ar line
});
test('waHref / smsHref encode the text', () => {
  assert.equal(core.waHref('a b\nc'), 'https://wa.me/?text=a%20b%0Ac');
  assert.equal(core.smsHref('a b\nc'), 'sms:?&body=a%20b%0Ac');
});
```

- [ ] **Step 2: Run, verify FAIL** — `node --test tests/quran/share-core.test.js` (new tests fail: not a function).

- [ ] **Step 3: Implement** — add to `quran-share-core.js` (inside the factory, before `return`):

```js
  function buildShareText(m, url) {
    m = m || {};
    var lines = [];
    if (m.ar) lines.push(String(m.ar));
    if (m.en) lines.push('"' + String(m.en) + '"');
    var attr = String(m.ref || '') + (m.edition ? ' (' + m.edition + ')' : '');
    if (attr.trim()) lines.push('— ' + attr);
    if (url) lines.push(String(url));
    return lines.join('\n');
  }
  function waHref(text) { return 'https://wa.me/?text=' + encodeURIComponent(String(text || '')); }
  function smsHref(text) { return 'sms:?&body=' + encodeURIComponent(String(text || '')); }
```
  and add `buildShareText: buildShareText, waHref: waHref, smsHref: smsHref` to the returned object.

- [ ] **Step 4: Run, verify PASS** — `node --test tests/quran/share-core.test.js` → all pass (5 existing + 2 new = 7).

- [ ] **Step 5: Commit** — `git add src/js/quran-share-core.js tests/quran/share-core.test.js && git commit -m "feat(quran-m5a1): buildShareText + wa/sms href encoders + tests"`

---

### Task 2: Controller — inject quick row + WhatsApp/SMS/Copy handlers

**Files:** Edit `src/js/quran-share.js`.

- [ ] **Step 1: Add** the following to `quran-share.js`. Put the SVGs + helpers above `init()`, and call `injectQuickRow()` inside `init()`:

```js
  // ---- inline monochrome icons (currentColor; NOT WhatsApp brand green) ----
  var SVG_WA = '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.8-1.5A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-2.8.9.9-2.8-.2-.3A8 8 0 1 1 12 20zm4.4-6c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.8 1-.3.2-.5.1a6.5 6.5 0 0 1-3.2-2.8c-.2-.4.2-.4.6-1.2.1-.2 0-.3 0-.5s-.5-1.3-.7-1.7-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-1 2.3 5.3 5.3 0 0 0 1.1 2.8 12 12 0 0 0 4.6 4c2.3 1 2.3.7 2.7.6a2.5 2.5 0 0 0 1.6-1.1 2 2 0 0 0 .1-1.1c0-.1-.2-.2-.5-.4z"/></svg>';
  var SVG_SMS = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-4-.9L3 21l1-4.3A8.4 8.4 0 1 1 21 11.5z"/></svg>';
  var SVG_COPY = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>';

  function shareUrl() {
    try {
      if (window.location.search && /[?&]surah=/.test(window.location.search)) return window.location.href;
      var sl = current ? core.slug(current.surahName || '') : '';
      return window.location.origin + window.location.pathname + (sl ? '?surah=' + sl : '');
    } catch (_) { return 'https://islamicinfo.org/quran.html'; }
  }

  function shareText() { return core.buildShareText(current, shareUrl()); }

  function openWA() { if (!current) { toast('Open a verse to share'); return; } window.open(core.waHref(shareText()), '_blank', 'noopener'); }
  function openSMS() { if (!current) { toast('Open a verse to share'); return; } window.open(core.smsHref(shareText()), '_blank'); }
  function fallbackCopy(text) {
    try {
      var ta = document.createElement('textarea'); ta.value = text;
      ta.style.position = 'fixed'; ta.style.opacity = '0'; ta.style.left = '-9999px';
      document.body.appendChild(ta); ta.focus(); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta); toast('Copied');
    } catch (_) { toast('Could not copy'); }
  }
  function copyText() {
    if (!current) { toast('Open a verse to share'); return; }
    var text = shareText();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast('Copied'); }, function () { fallbackCopy(text); });
    } else { fallbackCopy(text); }
  }

  function mkQuickBtn(label, svg, handler) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'sq-btn';
    b.innerHTML = svg + '<span>' + label + '</span>';
    b.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); handler(); });
    return b;
  }
  function injectQuickRow() {
    var content = document.querySelector('.share-content');
    if (!content || document.querySelector('.share-quick')) return;
    var row = document.createElement('div'); row.className = 'share-fmt share-quick';
    row.appendChild(mkQuickBtn('WhatsApp', SVG_WA, openWA));
    row.appendChild(mkQuickBtn('SMS', SVG_SMS, openSMS));
    row.appendChild(mkQuickBtn('Copy', SVG_COPY, copyText));
    var acts = content.querySelector('.share-acts');
    if (acts && acts.nextSibling) content.insertBefore(row, acts.nextSibling);
    else content.appendChild(row);
  }
```
  Then, in the existing `init()` (which already wires `.share-dl` / `.share-native`), add a call to `injectQuickRow();` at the end. And extend the `window.II.quranShare` export object with: `openWA: openWA, openSMS: openSMS, copyText: copyText, _shareText: shareText`.

- [ ] **Step 2: Syntax check** — `node --check src/js/quran-share.js` → clean.

- [ ] **Step 3: Commit** — `git add src/js/quran-share.js && git commit -m "feat(quran-m5a1): inject WhatsApp/SMS/Copy quick-share row + handlers"`

---

### Task 3: jsdom verification (extend the M5A harness) + no quran.html change

**Files:** Verify via scratchpad harness (NOT committed). No `quran.html` edit (row is injected).

- [ ] **Step 1: Extend** `<scratchpad>/verify-share.mjs` (or write `verify-share2.mjs`) modeled on the existing M5A harness. Stubs: `win.open = (url, t) => { opened.push({ url: url, target: t }); return null; }`; `win.navigator.clipboard = { writeText: (t) => { copied.push(t); return Promise.resolve(); } }`; `win.showToast = (m) => toasts.push(m)`. Inject `quran-share-core.js` + `quran-share.js`; dispatch `DOMContentLoaded`. Provide the same share-modal DOM as the M5A harness PLUS the `.share-content` wrapper and one `.ayah-card[data-key="1:1"]` with `.ayah-trans-attr` = "Dr. Mustafa Khattab · Al-Fatihah 1:1". Assert:
  - `.share-quick` row injected inside `.share-content`, immediately after `.share-acts`, with 3 buttons (WhatsApp/SMS/Copy).
  - `win.openShareModal('ARB','the mercy','Al-Fatihah 1:1')` then click WhatsApp button → last `opened.url` starts with `https://wa.me/?text=`, and `decodeURIComponent(url)` contains `the mercy`, `Dr. Mustafa Khattab`, and `surah=` (the link).
  - click SMS button → last `opened.url` starts with `sms:?&body=`.
  - click Copy button → `copied[last]` is the §9 text (contains `Dr. Mustafa Khattab`), toast includes `'Copied'`.
  - guard: fresh state, click WhatsApp before any openShareModal → toast `'Open a verse to share'`, no `window.open`.
  - re-running injectQuickRow (dispatch DOMContentLoaded twice) does NOT create a 2nd `.share-quick` row (idempotent).
  - zero `console.error`.

- [ ] **Step 2: Run** — `node <scratchpad>/verify-share2.mjs` → `RESULT: N passed, 0 failed`. Iterate until green.

- [ ] **Step 3: Confirm no page change** — `git status` shows only `src/js/*` staged/committed; `quran.html` unchanged (`git diff --stat main...HEAD` must NOT list quran.html). Nothing to commit for this task (harness not committed).

---

## Final review

Adversarial pass over `git diff main...HEAD`: (a) shared text is §9-attributed (edition present) and mirrors the image; (b) no HTML/CSS change, no new hex/brand color, monochrome icons; (c) all handlers guard null `current`, no console errors / unhandled rejections; (d) `injectQuickRow` idempotent and inserts in the right place; (e) `shareUrl` builds a valid link and degrades gracefully; (f) WhatsApp/SMS encoders correct. Then finish via superpowers:finishing-a-development-branch.
