# Module 5A — Share PNG Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Make the share modal's Download PNG and Share ↗ buttons real — rasterize the verse card to a PNG via manual `<canvas>` (matching locked design tokens), download it, offer native share with graceful fallback — and fix the hardcoded `· Sahih International` attribution so the real translation edition is shown.

**Architecture:** Pure logic in `quran-share-core.js` (UMD, node:test): dims, filename slug, quote-strip, edition extraction, injected-measurer word-wrap, token constants. DOM controller `quran-share.js` overrides the locked inline `openShareModal` (to read the real edition from the source card) and wires `.share-dl`/`.share-native` to a canvas renderer (`drawShareCard`) + `toBlob` download / Web Share API.

**Tech Stack:** Vanilla JS (UMD/ES5-ish), Node `node:test`, jsdom (scratchpad harness, mocked canvas). No build, no deps, no backend, no localStorage.

**Governing spec:** `doc/superpowers/specs/2026-07-15-quran-module5a-share-png-design.md`. Read it first. No 🕌 gate (renders an already-attributed verse). No CSS/markup change beyond 2 script includes.

---

### Task 1: Pure core `quran-share-core.js` + unit tests (TDD)

**Files:** Create `src/js/quran-share-core.js`; Test `tests/quran/share-core.test.js`.

- [ ] **Step 1: Write the failing test** — `tests/quran/share-core.test.js`:

```js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const core = require('../../src/js/quran-share-core.js');

test('dims square/story', () => {
  assert.deepEqual(core.dims('square'), { w:1080, h:1080 });
  assert.deepEqual(core.dims('story'), { w:1080, h:1920 });
  assert.deepEqual(core.dims(), { w:1080, h:1080 });
});
test('slugFilename maps : to - and slugifies name', () => {
  assert.equal(core.slugFilename('Al-Fatihah', '1:1'), 'islamicinfo-al-fatihah-1-1.png');
  assert.equal(core.slugFilename("Ali 'Imran", '3:7'), 'islamicinfo-ali-imran-3-7.png');
});
test('stripQuotes trims straight and curly quotes', () => {
  assert.equal(core.stripQuotes('"hello"'), 'hello');
  assert.equal(core.stripQuotes('“hi”'), 'hi');
  assert.equal(core.stripQuotes('  plain  '), 'plain');
});
test('editionFromAttr takes text before middle dot', () => {
  assert.equal(core.editionFromAttr('Saheeh International · Al-Fatihah 1:1'), 'Saheeh International');
  assert.equal(core.editionFromAttr('Dr. Mustafa Khattab · X'), 'Dr. Mustafa Khattab');
  assert.equal(core.editionFromAttr('no dot'), 'no dot');
  assert.equal(core.editionFromAttr(''), '');
});
test('wrapText greedily wraps with an injected measurer', () => {
  const measure = (s) => s.length * 10; // 10px/char
  assert.deepEqual(core.wrapText('a b c', 100, measure), ['a b c']);
  assert.deepEqual(core.wrapText('aa bb cc dd', 50, measure), ['aa bb', 'cc dd']);
  assert.deepEqual(core.wrapText('supercalifragilistic short', 50, measure), ['supercalifragilistic', 'short']);
  assert.deepEqual(core.wrapText('   ', 100, measure), ['']);
  assert.deepEqual(core.wrapText('', 100, measure), ['']);
});
```

- [ ] **Step 2: Run it, verify FAIL** — `node --test tests/quran/share-core.test.js` → "Cannot find module".

- [ ] **Step 3: Implement `src/js/quran-share-core.js`:**

```js
/* Module 5A — Share PNG pure core (DOM-free, UMD). */
(function (root, factory) {
  var mod = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = mod;
  (root.II = root.II || {}).shareCore = mod;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function dims(fmt) { return fmt === 'story' ? { w: 1080, h: 1920 } : { w: 1080, h: 1080 }; }
  function slug(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }
  function slugFilename(surahName, verseKey) {
    return 'islamicinfo-' + slug(surahName) + '-' + String(verseKey || '').replace(/:/g, '-') + '.png';
  }
  function stripQuotes(s) { return String(s || '').replace(/^\s*["“”]+|["“”]+\s*$/g, '').trim(); }
  function editionFromAttr(attr) {
    var s = String(attr || ''); var i = s.indexOf('·');
    return (i === -1 ? s : s.slice(0, i)).trim();
  }
  function wrapText(text, maxWidth, measure) {
    var words = String(text == null ? '' : text).split(/\s+/).filter(Boolean);
    if (!words.length) return [''];
    var lines = [], line = words[0];
    for (var i = 1; i < words.length; i++) {
      var test = line + ' ' + words[i];
      if (measure(test) <= maxWidth) line = test;
      else { lines.push(line); line = words[i]; }
    }
    lines.push(line);
    return lines;
  }

  var TOKENS = {
    bgTop: '#004E55', bgBot: '#062628',
    glowTeal: 'rgba(0,105,110,0.30)', glowTeal0: 'rgba(0,105,110,0)',
    glowGold: 'rgba(197,160,89,0.20)', glowGold0: 'rgba(197,160,89,0)',
    gold: '#C5A059',
    white95: 'rgba(255,255,255,0.95)', white80: 'rgba(255,255,255,0.80)', white40: 'rgba(255,255,255,0.40)',
    fontDisplay: "'Cormorant Garamond', Georgia, serif",
    fontArabic: "'Amiri', serif",
    fontMono: "'JetBrains Mono', monospace"
  };

  return { dims: dims, slug: slug, slugFilename: slugFilename, stripQuotes: stripQuotes,
           editionFromAttr: editionFromAttr, wrapText: wrapText, TOKENS: TOKENS };
});
```

- [ ] **Step 4: Run tests, verify PASS** — `node --test tests/quran/share-core.test.js` → all pass.

- [ ] **Step 5: Commit** — `git add src/js/quran-share-core.js tests/quran/share-core.test.js && git commit -m "feat(quran-m5a): share PNG pure core + unit tests"`

---

### Task 2: Controller `quran-share.js`

**Files:** Create `src/js/quran-share.js`.

- [ ] **Step 1: Implement** (override `openShareModal` for the real edition; canvas draw; wire buttons). NOTE: `drawShareCard` layout constants are a reasonable first pass — pixel fidelity vs. the locked preview is verified visually in-browser by the user; the harness verifies call-sequence/attribution/format/download wiring, not pixel positions.

```js
/* Module 5A — Share PNG controller. Overrides inline openShareModal + wires Download/Share. */
(function () {
  'use strict';
  var core = (window.II && window.II.shareCore);
  if (!core) { console.warn('[quran-share] shareCore missing'); return; }
  var T = core.TOKENS;
  var current = null;

  function $(id) { return document.getElementById(id); }
  function toast(m) { if (typeof window.showToast === 'function') window.showToast(m); }

  function currentFmt() {
    var btns = document.querySelectorAll('.share-fmt button');
    for (var i = 0; i < btns.length; i++) { if (btns[i].classList.contains('on')) return i === 1 ? 'story' : 'square'; }
    return 'square';
  }

  // ---- override: attribution-correct open ----
  window.openShareModal = function (ar, en, ref) {
    ref = String(ref || '');
    var parts = ref.trim().split(/\s+/);
    var vk = parts[parts.length - 1] || '';
    var surahName = ref.replace(new RegExp('\\s*' + vk.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*$'), '').trim();
    var card = vk ? document.querySelector('.ayah-card[data-key="' + vk + '"]') : null;
    var attr = card ? ((card.querySelector('.ayah-trans-attr') || {}).textContent || '') : '';
    var edition = core.editionFromAttr(attr);

    if ($('shareAr')) $('shareAr').textContent = ar;
    if ($('shareEn')) $('shareEn').textContent = '"' + en + '"';
    if ($('shareRef')) $('shareRef').textContent = ref + (edition ? ' · ' + edition : '');

    current = { ar: String(ar || ''), en: core.stripQuotes(en), ref: ref, edition: edition, vk: vk, surahName: surahName || ref };
    if ($('shareModal')) $('shareModal').classList.add('open');
  };

  // ---- canvas draw (recording-stub testable) ----
  function drawShareCard(ctx, m, d) {
    var W = d.w, H = d.h, cx = W / 2, pad = W * 0.11, maxW = W - pad * 2;

    var g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, T.bgTop); g.addColorStop(1, T.bgBot);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    var r1 = ctx.createRadialGradient(W * 0.2, H * 0.3, 0, W * 0.2, H * 0.3, W * 0.8);
    r1.addColorStop(0, T.glowTeal); r1.addColorStop(1, T.glowTeal0);
    ctx.fillStyle = r1; ctx.fillRect(0, 0, W, H);
    var r2 = ctx.createRadialGradient(W * 0.8, H * 0.2, 0, W * 0.8, H * 0.2, W * 0.7);
    r2.addColorStop(0, T.glowGold); r2.addColorStop(1, T.glowGold0);
    ctx.fillStyle = r2; ctx.fillRect(0, 0, W, H);

    ctx.textAlign = 'center';

    // logo (top)
    ctx.direction = 'ltr'; ctx.fillStyle = T.white40;
    ctx.font = '600 ' + Math.round(W * 0.026) + 'px ' + T.fontDisplay;
    ctx.fillText('I S L A M I C I N F O . O R G', cx, H * 0.15);

    var arSize = Math.round(W * 0.062), arLH = arSize * 1.9;
    var enSize = Math.round(W * 0.038), enLH = enSize * 1.65;
    var divGap = W * 0.05, divH = 2;

    ctx.font = arSize + 'px ' + T.fontArabic;
    var arLines = core.wrapText(m.ar, maxW, function (s) { return ctx.measureText(s).width; });
    ctx.font = 'italic ' + enSize + 'px ' + T.fontDisplay;
    var enLines = core.wrapText('“' + m.en + '”', maxW, function (s) { return ctx.measureText(s).width; });

    var blockH = arLines.length * arLH + divGap * 2 + divH + enLines.length * enLH;
    var y = (H - blockH) / 2 + arSize;

    // arabic
    ctx.direction = 'rtl'; ctx.fillStyle = T.white95; ctx.font = arSize + 'px ' + T.fontArabic;
    for (var i = 0; i < arLines.length; i++) { ctx.fillText(arLines[i], cx, y); y += arLH; }

    // divider
    y += divGap;
    ctx.strokeStyle = T.gold; ctx.lineWidth = divH;
    ctx.beginPath(); ctx.moveTo(cx - W * 0.028, y); ctx.lineTo(cx + W * 0.028, y); ctx.stroke();
    y += divGap + enSize;

    // translation
    ctx.direction = 'ltr'; ctx.fillStyle = T.white80; ctx.font = 'italic ' + enSize + 'px ' + T.fontDisplay;
    for (var j = 0; j < enLines.length; j++) { ctx.fillText(enLines[j], cx, y); y += enLH; }

    // ref (bottom)
    ctx.fillStyle = T.white40; ctx.font = Math.round(W * 0.024) + 'px ' + T.fontMono;
    ctx.fillText(m.ref + (m.edition ? ' · ' + m.edition : ''), cx, H * 0.9);
  }

  function ensureFonts() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    var fams = ['20px Amiri', 'italic 20px "Cormorant Garamond"', '600 20px "Cormorant Garamond"', '20px "JetBrains Mono"'];
    return Promise.all(fams.map(function (f) { try { return document.fonts.load(f); } catch (_) { return Promise.resolve(); } })).catch(function () {});
  }

  function buildCanvas() {
    if (!current) return null;
    var d = core.dims(currentFmt());
    var cv = document.createElement('canvas'); cv.width = d.w; cv.height = d.h;
    var ctx = cv.getContext && cv.getContext('2d');
    if (!ctx) return null;
    drawShareCard(ctx, current, d);
    return { cv: cv, filename: core.slugFilename(current.surahName, current.vk) };
  }

  function withBlob(cb) {
    if (!current) { toast('Open a verse to share'); return; }
    ensureFonts().then(function () {
      var built = buildCanvas();
      if (!built) { toast('Image export not supported on this browser'); return; }
      if (!built.cv.toBlob) { toast('Image export not supported on this browser'); return; }
      built.cv.toBlob(function (blob) {
        if (!blob) { toast('Could not create image'); return; }
        cb(blob, built.filename);
      }, 'image/png');
    });
  }

  function downloadBlob(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a'); a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { try { URL.revokeObjectURL(url); } catch (_) {} }, 1000);
  }

  function downloadPNG() { withBlob(function (blob, filename) { downloadBlob(blob, filename); toast('Image saved'); }); }

  function shareNative() {
    withBlob(function (blob, filename) {
      try {
        var file = new File([blob], filename, { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
          navigator.share({ files: [file], title: 'IslamicInfo.org', text: current ? current.ref : '' })
            .catch(function (e) { if (!e || e.name !== 'AbortError') { downloadBlob(blob, filename); toast('Sharing not supported — image downloaded'); } });
          return;
        }
      } catch (_) {}
      downloadBlob(blob, filename); toast('Sharing not supported — image downloaded');
    });
  }

  function init() {
    var dl = document.querySelector('.share-dl');
    var nat = document.querySelector('.share-native');
    if (dl) dl.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); downloadPNG(); });
    if (nat) nat.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); shareNative(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  window.II = window.II || {};
  window.II.quranShare = { _draw: drawShareCard, _model: function () { return current; }, downloadPNG: downloadPNG, shareNative: shareNative, _fmt: currentFmt };
})();
```

- [ ] **Step 2: Syntax check** — `node --check src/js/quran-share.js` → clean.

- [ ] **Step 3: Commit** — `git add src/js/quran-share.js && git commit -m "feat(quran-m5a): share PNG controller (canvas render, real edition, download + web share)"`

---

### Task 3: Wire into `quran.html` + jsdom controller verification

**Files:** Modify `quran.html`; Verify via scratchpad harness (NOT committed).

- [ ] **Step 1: Add script includes** — in `quran.html`, immediately after the AI-explain includes (the `<script src="src/js/quran-ai.js"></script>` line, ~3213), add:

```html
<script src="src/js/quran-share-core.js"></script>
<script src="src/js/quran-share.js"></script>
```

- [ ] **Step 2: Write a scratchpad jsdom harness** at `<scratchpad>/verify-share.mjs` (model the jsdom+vm setup on the existing `<scratchpad>/verify-marks.mjs` / `verify-ai.mjs`). Because jsdom has no real canvas, STUB it:
  - `win.HTMLCanvasElement.prototype.getContext = () => recCtx` where `recCtx` records calls and implements `measureText: s => ({ width: s.length * 12 })`, `createLinearGradient`/`createRadialGradient: () => ({ addColorStop(){} })`, and no-op `fillRect/fillText/beginPath/moveTo/lineTo/stroke` plus settable props (`fillStyle/font/direction/textAlign/strokeStyle/lineWidth`).
  - `win.HTMLCanvasElement.prototype.toBlob = (cb) => cb(new win.Blob(['x'], { type:'image/png' }))`.
  - `win.URL.createObjectURL = () => 'blob:x'`; `win.URL.revokeObjectURL = () => {}`.
  - stub `win.showToast = (m) => toasts.push(m)`; leave `document.fonts` undefined (controller must tolerate it).
  - Provide DOM: the share modal markup (`#shareModal`, `.share-fmt` two buttons with the 1st `.on`, `#sharePreview`, `#shareAr/#shareEn/#shareRef`, `.share-acts` with `.share-dl` + `.share-native`) and one `.ayah-card[data-key="1:1"]` whose `.ayah-trans-attr` = "Dr. Mustafa Khattab · Al-Fatihah 1:1".
  - Inject `quran-share-core.js` + `quran-share.js`; dispatch `DOMContentLoaded`.
  Assert:
  - **Attribution fix:** `win.openShareModal('ARB', 'the mercy', 'Al-Fatihah 1:1')` → `#shareRef.textContent` ends with **"· Dr. Mustafa Khattab"** (NOT "Sahih International"); `II.quranShare._model().edition === 'Dr. Mustafa Khattab'`.
  - **Download wiring:** click `.share-dl` → after a tick, `getContext('2d')` was used, `fillText` was called with the logo and with the ref line, `toBlob` fired, an `<a>` with `download === 'islamicinfo-al-fatihah-1-1.png'` was clicked (spy `HTMLAnchorElement.prototype.click`), and a toast 'Image saved' pushed.
  - **Format:** set the 2nd `.share-fmt` button `.on` (clear 1st) → the canvas created in the next download has `width===1080 && height===1920` (spy canvas creation or read the last canvas).
  - **Native share fallback:** with `navigator.canShare`/`navigator.share` undefined → click `.share-native` → falls back to a download + toast contains 'downloaded'.
  - **Native share present:** define `navigator.canShare = () => true` and `navigator.share = (o) => { shared = o; return Promise.resolve(); }` → click `.share-native` → `shared.files` is a 1-element array.
  - **No current model guard:** fresh controller, click `.share-dl` before any openShareModal → toast 'Open a verse to share', no throw.
  - zero `console.error`.

- [ ] **Step 3: Run it** — `node <scratchpad>/verify-share.mjs` → `RESULT: N passed, 0 failed`, zero console errors. Iterate on the controller until green.

- [ ] **Step 4: Commit** — `git add quran.html && git commit -m "feat(quran-m5a): wire share PNG scripts into quran.html"`

---

## Final review

After Task 3, dispatch an adversarial reviewer over `git diff main...HEAD` for: (a) the `openShareModal` override wins over the inline one (load order after quran-verses.js) and never re-introduces the hardcoded edition; (b) attribution shows the REAL edition in both preview and image; (c) no CSS/markup change beyond the 2 includes; (d) all failure states graceful (no canvas, no toBlob, no Web Share, share-cancel AbortError) with no console errors or unhandled rejections; (e) filename slug correct; (f) no fabricated content. Then merge via superpowers:finishing-a-development-branch (note: pixel fidelity is a user visual check, not asserted).
