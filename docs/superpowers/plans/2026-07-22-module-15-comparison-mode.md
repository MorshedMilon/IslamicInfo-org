# Module 15 — Comparison Mode (US-H19) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users select 2–3 hadiths and compare their Arabic matn (word-diff-highlighted) and translation (side-by-side, not highlighted) in a full-screen overlay, with the isnad/chain-diverge layer scaffolded honestly for future data.

**Architecture:** Two new files mirror the Module 14 trace-view split — `src/js/compare-view-core.js` (pure UMD builders + diff algorithm, unit-tested) and `src/js/compare-view.js` (DOM controller reusing `II.ui.focusTrap`). Three existing files get surgical edits: `hadith-feed-core.js` (card "Add to comparison" button), `hadith.html` (replace the static Stage-4 demo with a real `.compare-drawer` + `.compare-overlay`), and `hadith.js` (selection Set state, drawer render, `/hadith/compare?refs=…` routing). The Arabic matn is the ONLY diff target (§0 honesty); chain-diverge logic is built + tested but dormant until narrator data exists.

**Tech Stack:** Vanilla ES5-style UMD modules (no build step), Node.js built-in test runner (`node --test`, run from `worker/`), History API routing, design-system CSS tokens only.

---

## Design reference

Spec: `docs/superpowers/specs/2026-07-22-module-15-comparison-mode-design.md`

**Binding honesty rules (from §0):**
1. `.diff-highlight` runs ONLY on `arabicMatn` (the narration). Translations shown side-by-side, NEVER highlighted.
2. Missing Arabic → honest "Arabic unavailable — cannot diff narration"; never fall back to diffing translation.
3. Chain-diverge `◆` is built + unit-tested but dormant; prod shows an honest "not yet available" note (isnad data is universally absent).
4. Every model-derived string is `esc()`-escaped.

## Test commands

- Run one core test file (from repo root): `cd worker && node --test test/compare-view-core.test.js`
- Run the full worker suite: `cd worker && node --test "test/*.test.js"`

Core modules use UMD: `module.exports = core` in Node, `window.II.compareViewCore` in the browser. Tests `import core from '../../src/js/compare-view-core.js'`.

---

## File structure

- **Create `src/js/compare-view-core.js`** — pure builders + diff. Responsibilities: ref serialize/parse, selection Set logic, Arabic tokenize/normalize/diff, dormant chain diff, column/header/empty HTML. No DOM, no network.
- **Create `worker/test/compare-view-core.test.js`** — unit tests for all of the above.
- **Create `src/js/compare-view.js`** — DOM controller: overlay open/close, focus-trap, fetch-on-load, chip ×, "+ Add", route reconcile.
- **Modify `src/js/hadith-feed-core.js`** — add `compare-add` action button + SVG icon.
- **Modify `worker/test/hadith-feed-core.test.js`** — assert the new button renders.
- **Modify `hadith.html`** — replace static Stage-4 compare demo with `.compare-drawer` + `.compare-overlay`; add CSS; add the two new `<script>` tags.
- **Modify `src/js/hadith.js`** — `state.compareSet`, `compare-add` wiring, drawer render, `/hadith/compare` routing branch, `openCompareRoute`, `II.compareView.init(...)`.
- **Modify `doc/DECISIONS.md`** — three ADR entries.
- **Modify `docs/DATA.md`** — note: no new storage key (in-memory + URL only).

---

## Task 1: Core — ref serialize/parse + selection Set logic

**Files:**
- Create: `src/js/compare-view-core.js`
- Test: `worker/test/compare-view-core.test.js`

- [ ] **Step 1: Write the failing test**

Create `worker/test/compare-view-core.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert';
import core from '../../src/js/compare-view-core.js';

test('MAX_COMPARE is 3', () => {
  assert.equal(core.MAX_COMPARE, 3);
});

test('addRef: appends when absent and under cap', () => {
  const r = core.addRef(['a:0:1'], 'b:0:2');
  assert.deepEqual(r.list, ['a:0:1', 'b:0:2']);
  assert.equal(r.added, true);
  assert.equal(r.full, false);
});

test('addRef: no duplicates', () => {
  const r = core.addRef(['a:0:1'], 'a:0:1');
  assert.deepEqual(r.list, ['a:0:1']);
  assert.equal(r.added, false);
});

test('addRef: refuses beyond cap and reports full', () => {
  const r = core.addRef(['a:0:1', 'b:0:2', 'c:0:3'], 'd:0:4');
  assert.deepEqual(r.list, ['a:0:1', 'b:0:2', 'c:0:3']);
  assert.equal(r.added, false);
  assert.equal(r.full, true);
});

test('addRef: full flag true when adding the 3rd item', () => {
  const r = core.addRef(['a:0:1', 'b:0:2'], 'c:0:3');
  assert.equal(r.added, true);
  assert.equal(r.full, true);
});

test('removeRef: drops the ref', () => {
  assert.deepEqual(core.removeRef(['a:0:1', 'b:0:2'], 'a:0:1'), ['b:0:2']);
});

test('canCompare: true at >=2', () => {
  assert.equal(core.canCompare(['a:0:1']), false);
  assert.equal(core.canCompare(['a:0:1', 'b:0:2']), true);
});

test('serializeRefs / parseRefs round-trip, cap at 3, dedupe, drop empties', () => {
  assert.equal(core.serializeRefs(['a:0:1', 'b:0:2']), 'a:0:1,b:0:2');
  assert.deepEqual(core.parseRefs('a:0:1,b:0:2'), ['a:0:1', 'b:0:2']);
  assert.deepEqual(core.parseRefs('a:0:1, a:0:1 ,,b:0:2'), ['a:0:1', 'b:0:2']);
  assert.deepEqual(core.parseRefs('a,b,c,d,e'), ['a', 'b', 'c']);
  assert.deepEqual(core.parseRefs(''), []);
  assert.deepEqual(core.parseRefs(null), []);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd worker && node --test test/compare-view-core.test.js`
Expected: FAIL — `Cannot find module '../../src/js/compare-view-core.js'`

- [ ] **Step 3: Write minimal implementation**

Create `src/js/compare-view-core.js`:

```js
/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — compare-view-core.js  (Module 15)
   Pure builders + diff for Hadith Comparison Mode (2–3 items). NO DOM,
   NO network. §0 honesty: word-diff runs ONLY on arabicMatn (the
   narration); translations are shown but NEVER diff-highlighted; the
   chain-diverge (◆) layer is computed by diffChains but DORMANT in prod
   (isnad data is universally absent) — an honest "not yet available"
   note is shown instead. UMD (window.II.compareViewCore | module.exports).
   ═══════════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  var MAX_COMPARE = 3;

  /* ── selection Set logic (ordered, deduped, capped) ── */
  function addRef(list, ref) {
    var arr = Array.isArray(list) ? list.slice() : [];
    if (!ref || arr.indexOf(ref) !== -1) return { list: arr, added: false, full: arr.length >= MAX_COMPARE };
    if (arr.length >= MAX_COMPARE) return { list: arr, added: false, full: true };
    arr.push(ref);
    return { list: arr, added: true, full: arr.length >= MAX_COMPARE };
  }
  function removeRef(list, ref) { return (Array.isArray(list) ? list : []).filter(function (r) { return r !== ref; }); }
  function canCompare(list) { return (Array.isArray(list) ? list : []).length >= 2; }

  /* ── URL ref (de)serialization ── */
  function serializeRefs(refs) { return (Array.isArray(refs) ? refs : []).filter(Boolean).join(','); }
  function parseRefs(param) {
    var out = [], seen = {};
    String(param == null ? '' : param).split(',').forEach(function (r) {
      r = r.trim();
      if (!r || seen[r] || out.length >= MAX_COMPARE) return;
      seen[r] = 1; out.push(r);
    });
    return out;
  }

  var core = {
    esc: esc, MAX_COMPARE: MAX_COMPARE,
    addRef: addRef, removeRef: removeRef, canCompare: canCompare,
    serializeRefs: serializeRefs, parseRefs: parseRefs,
  };

  if (typeof module !== 'undefined' && module.exports) { module.exports = core; }
  else { root.II = root.II || {}; root.II.compareViewCore = core; }

}(typeof globalThis !== 'undefined' ? globalThis : window));
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd worker && node --test test/compare-view-core.test.js`
Expected: PASS (all Task 1 tests green)

- [ ] **Step 5: Commit**

```bash
git add src/js/compare-view-core.js worker/test/compare-view-core.test.js
git commit -m "feat(hadith): Module 15 — compare-view-core selection Set + ref serialization (US-H19)"
```

---

## Task 2: Core — Arabic tokenize/normalize + 2-way LCS diff

**Files:**
- Modify: `src/js/compare-view-core.js`
- Test: `worker/test/compare-view-core.test.js`

- [ ] **Step 1: Write the failing test** — append to `worker/test/compare-view-core.test.js`:

```js
test('normalizeArabicToken: strips tashkeel, tatweel, and punctuation; keeps base letters', () => {
  // "الأعمالُ،" (with damma + Arabic comma) normalizes to the bare word "الأعمال"
  assert.equal(core.normalizeArabicToken('الأعمالُ،'), core.normalizeArabicToken('الأعمال'));
  // tatweel (ـ) removed
  assert.equal(core.normalizeArabicToken('الأعمـال'), core.normalizeArabicToken('الأعمال'));
});

test('tokenizeMatn: splits on whitespace with raw + normalized key', () => {
  const t = core.tokenizeMatn('إنما الأعمال');
  assert.equal(t.length, 2);
  assert.equal(t[0].raw, 'إنما');
  assert.ok(t[0].key.length > 0);
});

test('diffTwo: identical matns → zero highlights', () => {
  const a = core.tokenizeMatn('إنما الأعمال بالنيات');
  const b = core.tokenizeMatn('إنما الأعمال بالنيات');
  const d = core.diffTwo(a, b);
  assert.deepEqual(d.a, [false, false, false]);
  assert.deepEqual(d.b, [false, false, false]);
});

test('diffTwo: one changed word → exactly that word flagged on each side', () => {
  const a = core.tokenizeMatn('إنما الأعمال بالنيات');
  const b = core.tokenizeMatn('إنما الصيام بالنيات');
  const d = core.diffTwo(a, b);
  assert.deepEqual(d.a, [false, true, false]);
  assert.deepEqual(d.b, [false, true, false]);
});

test('diffTwo: VERIFICATION NOTE — punctuation/diacritic differences are NOT false positives', () => {
  // Same words, one side has extra diacritics + a trailing comma. Must show zero diff.
  const a = core.tokenizeMatn('إنما الأعمال بالنيات');
  const b = core.tokenizeMatn('إنَّما الأعمالُ بالنياتِ،');
  const d = core.diffTwo(a, b);
  assert.ok(d.a.every(function (x) { return x === false; }), 'no side-a false positives');
  assert.ok(d.b.every(function (x) { return x === false; }), 'no side-b false positives');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd worker && node --test test/compare-view-core.test.js`
Expected: FAIL — `core.normalizeArabicToken is not a function`

- [ ] **Step 3: Write minimal implementation** — add these functions to `src/js/compare-view-core.js` (before the `var core = {...}` block) and export them:

```js
  /* ── Arabic tokenization + normalization (comparison key only; display uses raw) ──
     Strips Quranic annotation signs (U+0610–U+061A), harakat/tanwin (U+064B–U+065F),
     superscript alef (U+0670), and tatweel (U+0640); then drops anything that is not a
     letter or number. This is why whitespace / punctuation / diacritic-only differences
     never produce a false-positive highlight (VERIFICATION NOTE). */
  function normalizeArabicToken(tok) {
    return String(tok == null ? '' : tok)
      .replace(/[ؐ-ًؚ-ٰٟـ]/g, '')
      .replace(/[^\p{L}\p{N}]/gu, '')
      .trim();
  }
  function tokenizeMatn(text) {
    return String(text == null ? '' : text).split(/\s+/).filter(function (s) { return s.length; })
      .map(function (raw) { return { raw: raw, key: normalizeArabicToken(raw) }; });
  }

  // Classic LCS over normalized keys. Tokens inside the longest common subsequence are
  // "shared" (flag false); the rest differ (flag true). Empty keys (pure punctuation
  // tokens) are forced non-differing so they never highlight.
  function diffTwo(aTokens, bTokens) {
    var a = (aTokens || []).map(function (t) { return t.key; });
    var b = (bTokens || []).map(function (t) { return t.key; });
    var n = a.length, m = b.length, i, j;
    var dp = []; for (i = 0; i <= n; i++) { dp.push(new Array(m + 1).fill(0)); }
    for (i = 1; i <= n; i++) for (j = 1; j <= m; j++) {
      dp[i][j] = (a[i - 1] !== '' && a[i - 1] === b[j - 1]) ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
    var af = new Array(n).fill(true), bf = new Array(m).fill(true);
    i = n; j = m;
    while (i > 0 && j > 0) {
      if (a[i - 1] !== '' && a[i - 1] === b[j - 1]) { af[i - 1] = false; bf[j - 1] = false; i--; j--; }
      else if (dp[i - 1][j] >= dp[i][j - 1]) i--; else j--;
    }
    for (i = 0; i < n; i++) if (a[i] === '') af[i] = false;
    for (j = 0; j < m; j++) if (b[j] === '') bf[j] = false;
    return { a: af, b: bf };
  }
```

Add `normalizeArabicToken`, `tokenizeMatn`, `diffTwo` to the exported `core` object.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd worker && node --test test/compare-view-core.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/js/compare-view-core.js worker/test/compare-view-core.test.js
git commit -m "feat(hadith): Module 15 — Arabic tokenize/normalize + 2-way LCS matn diff (US-H19)"
```

---

## Task 3: Core — N-way shared-token diff + dispatcher

**Files:**
- Modify: `src/js/compare-view-core.js`
- Test: `worker/test/compare-view-core.test.js`

- [ ] **Step 1: Write the failing test** — append:

```js
test('diffMany (3-way): a word present in ALL three is not flagged; a word missing from one IS flagged', () => {
  const lists = [
    core.tokenizeMatn('إنما الأعمال بالنيات'),
    core.tokenizeMatn('إنما الصيام بالنيات'),
    core.tokenizeMatn('إنما الأعمال بالنيات'),
  ];
  const flags = core.diffMany(lists);
  // "إنما" and "بالنيات" appear in all three → false everywhere at those positions.
  assert.equal(flags[0][0], false); // إنما
  assert.equal(flags[0][2], false); // بالنيات
  // position 1: list0/list2 = الأعمال (2 of 3), list1 = الصيام (unique) → all flagged (not in ALL three)
  assert.equal(flags[0][1], true);  // الأعمال not in list1
  assert.equal(flags[1][1], true);  // الصيام not in list0/list2
  assert.equal(flags[2][1], true);
});

test('computeDiff: 2 lists → delegates to LCS (order-aware); 3 lists → shared-token', () => {
  const two = core.computeDiff([core.tokenizeMatn('إنما الأعمال'), core.tokenizeMatn('إنما الصيام')]);
  assert.deepEqual(two, [[false, true], [false, true]]);
  const three = core.computeDiff([
    core.tokenizeMatn('إنما الأعمال'),
    core.tokenizeMatn('إنما الأعمال'),
    core.tokenizeMatn('إنما الأعمال'),
  ]);
  assert.deepEqual(three, [[false, false], [false, false], [false, false]]);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd worker && node --test test/compare-view-core.test.js`
Expected: FAIL — `core.diffMany is not a function`

- [ ] **Step 3: Write minimal implementation** — add to `src/js/compare-view-core.js`:

```js
  // N-way (order-independent) diff: a token is "shared" only if its normalized key is
  // present (frequency-aware) in EVERY list; otherwise it differs. Honest signal
  // "this word isn't in all N". Empty keys never flag.
  function diffMany(tokenLists) {
    var lists = (tokenLists || []).map(function (t) { return (t || []).map(function (x) { return x.key; }); });
    function counts(arr) { var m = {}; arr.forEach(function (k) { if (k !== '') m[k] = (m[k] || 0) + 1; }); return m; }
    var cs = lists.map(counts);
    var common = {};
    Object.keys(cs[0] || {}).forEach(function (k) {
      var min = cs[0][k];
      for (var i = 1; i < cs.length; i++) { var c = cs[i][k] || 0; if (c < min) min = c; }
      if (min > 0) common[k] = min;
    });
    return lists.map(function (arr) {
      var budget = Object.assign({}, common);
      return arr.map(function (k) {
        if (k === '') return false;
        if (budget[k] > 0) { budget[k]--; return false; }
        return true;
      });
    });
  }

  // Dispatcher: 2 lists → order-aware LCS (tighter); N>2 → shared-token model.
  function computeDiff(tokenLists) {
    tokenLists = tokenLists || [];
    if (tokenLists.length === 2) { var d = diffTwo(tokenLists[0], tokenLists[1]); return [d.a, d.b]; }
    return diffMany(tokenLists);
  }
```

Add `diffMany`, `computeDiff` to the exported `core`.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd worker && node --test test/compare-view-core.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/js/compare-view-core.js worker/test/compare-view-core.test.js
git commit -m "feat(hadith): Module 15 — 3-way shared-token diff + computeDiff dispatcher (US-H19)"
```

---

## Task 4: Core — dormant chain-diverge diff (built + tested, inert in prod)

**Files:**
- Modify: `src/js/compare-view-core.js`
- Test: `worker/test/compare-view-core.test.js`

- [ ] **Step 1: Write the failing test** — append:

```js
test('diffChains: identical chains → sameChain true, no divergence', () => {
  const c1 = [{ id: 'n1' }, { id: 'n2' }, { id: 'n3' }];
  const c2 = [{ id: 'n1' }, { id: 'n2' }, { id: 'n3' }];
  const r = core.diffChains([c1, c2]);
  assert.equal(r.sameChain, true);
  assert.deepEqual(r.diverge[0], [false, false, false]);
  assert.deepEqual(r.diverge[1], [false, false, false]);
});

test('diffChains: chains diverge at a position where narrators differ', () => {
  const c1 = [{ id: 'n1' }, { id: 'n2' }, { id: 'n3' }];
  const c2 = [{ id: 'n1' }, { id: 'nX' }, { id: 'n3' }];
  const r = core.diffChains([c1, c2]);
  assert.equal(r.sameChain, false);
  assert.deepEqual(r.diverge[0], [false, true, false]);
  assert.deepEqual(r.diverge[1], [false, true, false]);
});

test('diffChains: uses fullName when id absent', () => {
  const r = core.diffChains([[{ fullName: 'Yahya' }], [{ fullName: 'Malik' }]]);
  assert.equal(r.sameChain, false);
  assert.equal(r.diverge[0][0], true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd worker && node --test test/compare-view-core.test.js`
Expected: FAIL — `core.diffChains is not a function`

- [ ] **Step 3: Write minimal implementation** — add to `src/js/compare-view-core.js`:

```js
  // DORMANT chain-diverge. Computes, per narrator position, whether narrators differ
  // across the compared chains, and whether all chains are identical (sameChain). Only
  // invoked by the DOM layer when EVERY compared hadith has a non-empty isnad.narrators
  // array — which never happens with today's data, so prod always renders the honest
  // "isnad comparison not yet available" note instead. Unit-tested against mocks so it
  // lights up automatically once narrator data lands.
  function narratorKey(n) { n = n || {}; return String(n.id || n.fullName || n.arabicName || '').trim(); }
  function diffChains(isnadArrays) {
    var chains = (isnadArrays || []).map(function (a) { return Array.isArray(a) ? a : []; });
    var same = chains.every(function (c) { return c.length === (chains[0] ? chains[0].length : 0); });
    var maxLen = chains.reduce(function (mx, c) { return Math.max(mx, c.length); }, 0);
    if (same) {
      for (var p = 0; p < maxLen && same; p++) {
        var k0 = narratorKey(chains[0][p]);
        for (var c = 1; c < chains.length; c++) { if (narratorKey(chains[c][p]) !== k0) { same = false; break; } }
      }
    }
    var diverge = chains.map(function (chain) {
      return chain.map(function (n, pos) {
        var k = narratorKey(n);
        for (var i = 0; i < chains.length; i++) { if (narratorKey(chains[i][pos] || {}) !== k) return true; }
        return false;
      });
    });
    return { diverge: diverge, sameChain: same };
  }
```

Add `diffChains` to the exported `core`.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd worker && node --test test/compare-view-core.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/js/compare-view-core.js worker/test/compare-view-core.test.js
git commit -m "feat(hadith): Module 15 — dormant chain-diverge diff (mock-tested, inert in prod) (US-H19)"
```

---

## Task 5: Core — HTML builders (columns, header chips, empty state)

**Files:**
- Modify: `src/js/compare-view-core.js`
- Test: `worker/test/compare-view-core.test.js`

- [ ] **Step 1: Write the failing test** — append. Add this fixture near the top of the test file (after the imports):

```js
function had(over = {}) {
  return Object.assign({
    collectionSlug: 'sahih-bukhari', collectionName: 'Sahih al-Bukhari',
    bookNumber: 1, hadithNumber: 1,
    arabicMatn: 'إنما الأعمال بالنيات', translation: { text: 'Actions are but by intentions' },
    isnad: { status: 'unavailable', narrators: [] },
  }, over);
}
```

Then the tests:

```js
test('buildCompareHTML: two hadiths → two columns, matn + translation both present', () => {
  const h = core.buildCompareHTML([had(), had({ hadithNumber: 2, arabicMatn: 'إنما الصيام بالنيات' })]);
  assert.match(h, /cmp-n2/);
  assert.match(h, /إنما/);
  assert.match(h, /Actions are but by intentions/);
});

test('buildCompareHTML: differing matn word gets .diff-highlight; translation NEVER highlighted', () => {
  const h = core.buildCompareHTML([had(), had({ hadithNumber: 2, arabicMatn: 'إنما الصيام بالنيات' })]);
  assert.match(h, /diff-highlight/);
  // the translation block must not contain a diff-highlight span
  const transBlocks = h.match(/<div class="cmp-trans">[\s\S]*?<\/div>/g) || [];
  transBlocks.forEach(function (b) { assert.ok(!/diff-highlight/.test(b), 'translation must not be highlighted'); });
});

test('buildCompareHTML: identical matns → NO diff-highlight', () => {
  const h = core.buildCompareHTML([had(), had({ hadithNumber: 2 })]);
  assert.ok(!/diff-highlight/.test(h));
});

test('buildCompareHTML: missing Arabic → honest state, no fallback to diffing translation', () => {
  const h = core.buildCompareHTML([had({ arabicMatn: '' }), had({ hadithNumber: 2, arabicMatn: 'إنما الصيام بالنيات' })]);
  assert.match(h, /Arabic unavailable — cannot diff narration/);
  // with only one Arabic column, nothing to diff → no highlight
  assert.ok(!/diff-highlight/.test(h));
});

test('buildCompareHTML: chain layer is the honest dormant note (never a fabricated ◆)', () => {
  const h = core.buildCompareHTML([had(), had({ hadithNumber: 2 })]);
  assert.match(h, /Isnad comparison not yet available/);
  assert.ok(!/chain-diverge/.test(h)); // no ◆ markers with empty narrator data
});

test('buildCompareHTML: fewer than 2 → honest empty state', () => {
  assert.match(core.buildCompareHTML([had()]), /Select at least 2 hadiths/);
  assert.match(core.buildCompareHTML([]), /Select at least 2 hadiths/);
});

test('buildHeaderChipsHTML: Comparing label + removable chips (data-cmp-remove=ref) + Add Hadith', () => {
  const h = core.buildHeaderChipsHTML([had(), had({ hadithNumber: 2 })]);
  assert.match(h, /Comparing/);
  assert.match(h, /data-cmp-remove="sahih-bukhari:1:1"/);
  assert.match(h, /data-cmp-remove="sahih-bukhari:1:2"/);
  assert.match(h, /data-cmp-add-more/);
});

test('buildEmptyStateHTML: unfetchable reason', () => {
  assert.match(core.buildEmptyStateHTML('unfetchable'), /could not be loaded/i);
});

test('XSS: matn, translation, and labels are escaped', () => {
  const h = core.buildCompareHTML([
    had({ arabicMatn: '<script>x</script>', translation: { text: '<img src=x onerror=1>' }, collectionName: '<b>c</b>' }),
    had({ hadithNumber: 2, arabicMatn: 'إنما الصيام' }),
  ]);
  assert.ok(!/<script>/.test(h));
  assert.ok(!/<img /.test(h));
  assert.ok(!/<b>c<\/b>/.test(h));
});

test('builders never throw on null/malformed input', () => {
  const inputs = [null, undefined, {}, { arabicMatn: 123 }, { translation: null }, { isnad: { narrators: 'nope' } }];
  inputs.forEach(function (x) {
    assert.doesNotThrow(function () { core.buildCompareHTML([x, had()]); });
    assert.doesNotThrow(function () { core.buildHeaderChipsHTML([x]); });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd worker && node --test test/compare-view-core.test.js`
Expected: FAIL — `core.buildCompareHTML is not a function`

- [ ] **Step 3: Write minimal implementation** — add to `src/js/compare-view-core.js`:

```js
  var CHAIN_UNAVAILABLE = 'Isnad comparison not yet available — chains are being compiled.';
  var ARABIC_UNAVAILABLE = 'Arabic unavailable — cannot diff narration.';

  function refOf(h) {
    h = h || {};
    if (!h.collectionSlug || h.hadithNumber == null) return '';
    var book = (h.bookNumber == null) ? 0 : h.bookNumber;
    return h.collectionSlug + ':' + book + ':' + h.hadithNumber;
  }
  function columnLabel(h) {
    h = h || {};
    var parts = [String(h.collectionName || h.collectionSlug || 'Hadith')];
    if (h.bookNumber != null) parts.push('Book ' + h.bookNumber);
    if (h.hadithNumber != null) parts.push('#' + h.hadithNumber);
    return esc(parts.join(' · '));
  }
  function matnHTML(h, flags) {
    var ar = (h && h.arabicMatn && typeof h.arabicMatn === 'string') ? h.arabicMatn : '';
    if (!ar) return '<div class="cmp-arabic-empty dv-empty">' + ARABIC_UNAVAILABLE + '</div>';
    var toks = tokenizeMatn(ar); flags = flags || [];
    var body = toks.map(function (t, i) {
      var raw = esc(t.raw);
      return flags[i] ? '<span class="diff-highlight">' + raw + '</span>' : raw;
    }).join(' ');
    return '<div class="cmp-arabic font-arabic" dir="rtl" lang="ar">' + body + '</div>';
  }
  function transHTML(h) {
    var tr = (h && h.translation && h.translation.text) || '';
    if (!tr) return '';
    return '<div class="cmp-trans">' + esc(tr) + '</div>';
  }
  function buildColumnHTML(h, flags) {
    return '<div class="cmp-col">' +
      '<div class="cmp-col-label">' + columnLabel(h) + '</div>' +
      matnHTML(h, flags) + transHTML(h) +
      '<div class="cmp-chain-note dv-empty">' + CHAIN_UNAVAILABLE + '</div>' +
      '</div>';
  }
  function buildEmptyStateHTML(reason) {
    var msg = reason === 'unfetchable' ? 'These hadiths could not be loaded. Please try again.'
      : 'Select at least 2 hadiths to compare.';
    return '<div class="cmp-empty dv-empty">' + esc(msg) + '</div>';
  }
  function buildCompareHTML(hadiths) {
    hadiths = (hadiths || []).filter(Boolean);
    if (hadiths.length < 2) return buildEmptyStateHTML('need2');
    var withAr = [];
    hadiths.forEach(function (h, i) { if (h && typeof h.arabicMatn === 'string' && h.arabicMatn) withAr.push(i); });
    var flagsByIndex = {};
    if (withAr.length >= 2) {
      var lists = withAr.map(function (i) { return tokenizeMatn(hadiths[i].arabicMatn); });
      var diff = computeDiff(lists);
      withAr.forEach(function (i, k) { flagsByIndex[i] = diff[k]; });
    }
    var cols = hadiths.map(function (h, i) { return buildColumnHTML(h, flagsByIndex[i] || []); }).join('');
    return '<div class="cmp-cols cmp-n' + hadiths.length + '">' + cols + '</div>';
  }
  function buildHeaderChipsHTML(hadiths) {
    hadiths = (hadiths || []).filter(Boolean);
    var chips = hadiths.map(function (h) {
      return '<span class="cmp-chip"><span class="cmp-chip-label">' + columnLabel(h) + '</span>' +
        '<button type="button" class="cmp-chip-x" data-cmp-remove="' + esc(refOf(h)) + '" aria-label="Remove from comparison">×</button></span>';
    }).join('');
    return '<span class="cmp-comparing">Comparing</span>' + chips +
      '<button type="button" class="cmp-add-more" data-cmp-add-more>+ Add Hadith</button>';
  }
```

Add `refOf`, `columnLabel`, `buildColumnHTML`, `buildCompareHTML`, `buildHeaderChipsHTML`, `buildEmptyStateHTML`, `CHAIN_UNAVAILABLE`, `ARABIC_UNAVAILABLE` to the exported `core`.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd worker && node --test test/compare-view-core.test.js`
Expected: PASS (all Task 1–5 tests green)

- [ ] **Step 5: Commit**

```bash
git add src/js/compare-view-core.js worker/test/compare-view-core.test.js
git commit -m "feat(hadith): Module 15 — compare HTML builders (columns/chips/empty), XSS-escaped (US-H19)"
```

---

## Task 6: Feed card — "Add to comparison" action button

**Files:**
- Modify: `src/js/hadith-feed-core.js:118-121` (SVG constants) and `:207-214` (action row)
- Test: `worker/test/hadith-feed-core.test.js`

- [ ] **Step 1: Write the failing test** — append to `worker/test/hadith-feed-core.test.js` (reuse that file's existing hadith fixture — find the local `function` that builds a hadith card input, e.g. `bukhari()`/`hadith()`; if unsure, run `grep -n "function .*(" worker/test/hadith-feed-core.test.js` and use the existing one):

```js
test('card action row includes an Add-to-comparison button (data-act="compare-add")', () => {
  const html = core.buildCardHTML(bukhari());
  assert.match(html, /data-act="compare-add"/);
  assert.match(html, /Add to comparison/);
});
```

> If the fixture in this file is named differently than `bukhari`, substitute the existing name. Do NOT add a new fixture.

- [ ] **Step 2: Run test to verify it fails**

Run: `cd worker && node --test test/hadith-feed-core.test.js`
Expected: FAIL — no `data-act="compare-add"` in output

- [ ] **Step 3: Write minimal implementation**

In `src/js/hadith-feed-core.js`, add a new SVG constant next to `SVG_TRACE` (after line 121):

```js
  // Add-to-comparison: two side-by-side panels (distinct from SVG_TRACE's single frame).
  var SVG_COMPARE = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="7" height="16" rx="1"/><rect x="14" y="4" width="7" height="16" rx="1"/></svg>';
```

Then in `buildCardHTML`, add the button to the `.hadith-actions` row (after the `trace` button, line 213):

```js
              actionBtn('trace', 'View as Trace', SVG_TRACE) +
              actionBtn('compare-add', 'Add to comparison', SVG_COMPARE) +
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd worker && node --test test/hadith-feed-core.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/js/hadith-feed-core.js worker/test/hadith-feed-core.test.js
git commit -m "feat(hadith): Module 15 — Add-to-comparison card action button (US-H19)"
```

---

## Task 7: DOM controller — `compare-view.js`

**Files:**
- Create: `src/js/compare-view.js`

No node unit test (DOM controller, mirrors trace-view.js which is also DOM-only). Verified by DOM smoke in Task 11 and manual browser flows (deferred). Write carefully.

- [ ] **Step 1: Create `src/js/compare-view.js`**

```js
/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — compare-view.js  (Module 15)
   DOM controller for the Comparison Mode overlay. Host-injected by
   hadith.js init(). Reuses II.ui.focusTrap + the trace-view Escape/
   focus-return + skipNav reconcile pattern. Fetches each ref fresh on
   open (deep-link/share safe); honest empty/error states, never a
   silent blank. Ships live (no flag) — reformats authenticated data only.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var II = window.II || {};
  var core = II.compareViewCore;
  var host = null;   // { ui, fetchHadithByRef, exitCompare, addMore }
  var state = { open: false, refs: [], hadiths: [], lastFocus: null };

  function el(id) { return document.getElementById(id); }
  function overlay() { return el('compare-overlay'); }

  function onKey(e) { if (e.key === 'Escape' && state.open) { e.preventDefault(); close(); } }

  function wireActs() {
    var ov = overlay(); if (!ov || ov.dataset.wired) return;
    ov.dataset.wired = '1';
    if (II.ui && II.ui.focusTrap) II.ui.focusTrap(ov);
    ov.addEventListener('click', function (e) {
      var exit = e.target.closest && e.target.closest('#compare-exit');
      if (exit) { close(); return; }
      var add = e.target.closest && e.target.closest('[data-cmp-add-more]');
      if (add) { close(); if (host && host.addMore) host.addMore(); return; }
      var rm = e.target.closest && e.target.closest('[data-cmp-remove]');
      if (rm) { removeRef(rm.getAttribute('data-cmp-remove')); return; }
    });
  }

  function isNarrow() { try { return window.matchMedia('(max-width:900px)').matches; } catch (_) { return false; } }

  function renderInto() {
    var header = el('compare-header'), body = el('compare-body');
    if (header) header.innerHTML = core.buildHeaderChipsHTML(state.hadiths);
    if (!body) return;
    if (!state.hadiths.length) { body.innerHTML = core.buildEmptyStateHTML('unfetchable'); return; }
    if (!core.canCompare(state.hadiths)) { body.innerHTML = core.buildEmptyStateHTML('need2'); return; }
    body.innerHTML = core.buildCompareHTML(state.hadiths);
    // DoD-3: on ≤900px the CSS hides all .cmp-col and shows only .cmp-tab-active, so we must
    // emit a tabbar and activate the first column; on wide screens columns show side-by-side.
    if (isNarrow()) applyTabs(body);
  }

  // Build a .cmp-tabbar (one button per column) and activate the first column.
  function applyTabs(body) {
    var cols = body.querySelectorAll('.cmp-col'); if (!cols.length) return;
    var bar = document.createElement('div'); bar.className = 'cmp-tabbar';
    cols.forEach(function (col, i) {
      var label = col.querySelector('.cmp-col-label');
      var btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'footer-action-btn cmp-tab-btn' + (i === 0 ? ' on' : '');
      btn.textContent = label ? label.textContent : ('Hadith ' + (i + 1));
      btn.setAttribute('data-cmp-tab', String(i));
      bar.appendChild(btn);
      col.classList.toggle('cmp-tab-active', i === 0);
    });
    var cont = body.querySelector('.cmp-cols');
    if (cont) cont.parentNode.insertBefore(bar, cont);
    bar.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-cmp-tab]'); if (!b) return;
      var idx = parseInt(b.getAttribute('data-cmp-tab'), 10);
      bar.querySelectorAll('.cmp-tab-btn').forEach(function (x, i) { x.classList.toggle('on', i === idx); });
      cols.forEach(function (col, i) { col.classList.toggle('cmp-tab-active', i === idx); });
    });
  }

  // Remove a ref via chip ×: rewrite ?refs= (replaceState, no history entry) and re-render.
  function removeRef(ref) {
    state.refs = core.removeRef(state.refs, ref);
    state.hadiths = state.hadiths.filter(function (h) { return refKey(h) !== ref; });
    syncUrl(true);
    renderInto();
  }
  function refKey(h) { h = h || {}; if (!h.collectionSlug || h.hadithNumber == null) return ''; return h.collectionSlug + ':' + (h.bookNumber == null ? 0 : h.bookNumber) + ':' + h.hadithNumber; }
  function syncUrl(replace) {
    var url = '/hadith/compare?refs=' + encodeURIComponent(core.serializeRefs(state.refs));
    try { if (replace) history.replaceState(history.state, '', url); else history.pushState(history.state, '', url); } catch (_) {}
  }

  async function open(refs, opts) {
    opts = opts || {};
    if (!core || !host) return;
    wireActs();
    state.lastFocus = document.activeElement;
    state.refs = (refs || []).slice(0, core.MAX_COMPARE);
    // Fetch each ref fresh (deep-link safe). Nulls dropped; honest state if <2 resolve.
    var fetched = [];
    for (var i = 0; i < state.refs.length; i++) {
      var h = host.fetchHadithByRef ? await host.fetchHadithByRef(state.refs[i]) : null;
      if (h) fetched.push(h);
    }
    state.hadiths = fetched;
    var ov = overlay(); if (!ov) return;
    state.open = true;
    renderInto();
    ov.hidden = false; ov.classList.add('open');
    var main = document.querySelector('.main'); if (main) main.setAttribute('aria-hidden', 'true');
    document.addEventListener('keydown', onKey);
    var first = el('compare-exit'); if (first) first.focus();
  }

  function close(opts) {
    opts = opts || {};
    var ov = overlay();
    if (ov) { ov.classList.remove('open'); ov.hidden = true; }
    var main = document.querySelector('.main'); if (main) main.removeAttribute('aria-hidden');
    document.removeEventListener('keydown', onKey);
    var lf = state.lastFocus;
    state.open = false; state.hadiths = []; state.refs = [];
    // skipNav: popstate reconcile is ALREADY rendering the target route → suppress our exit nav.
    if (!opts.skipNav && host && host.exitCompare) host.exitCompare();
    if (lf && lf.focus) { try { lf.focus(); } catch (_) {} }
  }

  function isOpen() { return state.open; }

  II.compareView = {
    init: function (h) { host = h; wireActs(); },
    open: open, close: close, isOpen: isOpen,
    _state: state,
  };
  window.II = II;
}());
```

- [ ] **Step 2: Sanity-check it parses** (no test framework for DOM):

Run: `node -e "require('./src/js/compare-view.js')" 2>&1 | head -3`
Expected: a `ReferenceError: window is not defined` (proves the file parses; it references `window` at top level by design). A **SyntaxError** would be a real failure — fix it.

- [ ] **Step 3: Commit**

```bash
git add src/js/compare-view.js
git commit -m "feat(hadith): Module 15 — compare-view DOM controller (overlay/focus-trap/fetch-on-load) (US-H19)"
```

---

## Task 8: `hadith.html` — replace static demo with drawer + overlay + CSS + scripts

**Files:**
- Modify: `hadith.html` — remove static demo (~1745–1762), add CSS (~788), add markup, add scripts (~2014)

- [ ] **Step 1: Remove the static Stage-4 demo section**

Find the block starting at the `<section>`/`<h2>` containing `data-i18n="hadith.compare.title"` (around line 1749) through its closing `</section>`/`</div>` that includes the `.compare-header`, both `.compare-item` demos, and the `+ Add Hadith` button (around line 1762). Delete that entire static demo block. (It is the mockup placeholder; the real feature replaces it.)

- [ ] **Step 2: Add CSS** — after the `.trace-overlay` rules (line 788), add:

```css
/* ── Module 15: Comparison Mode ── */
.compare-drawer{position:fixed;left:0;right:0;bottom:0;z-index:250;display:none;align-items:center;gap:12px;flex-wrap:wrap;padding:12px 20px;background:var(--surface-card);border-top:0.5px solid var(--border-hairline);box-shadow:0 -6px 24px rgba(0,0,0,.08);}
.compare-drawer.open{display:flex;}
.compare-drawer .cmp-drawer-label{font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-subtle);}
.compare-drawer .cmp-chip{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--ink-body);background:rgba(0,105,110,.06);border:0.5px solid rgba(0,105,110,.15);border-radius:20px;padding:5px 12px;}
.compare-drawer .cmp-chip-x{width:16px;height:16px;border-radius:50%;background:rgba(0,0,0,.08);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--ink-muted);font-size:12px;line-height:1;}
.compare-drawer .cmp-chip-x:hover{background:var(--grade-mawdu);color:#fff;}
.compare-drawer .cmp-compare-go{margin-left:auto;}
.compare-drawer .cmp-compare-go[disabled]{opacity:.45;cursor:not-allowed;}

.compare-overlay{position:fixed;inset:0;z-index:300;background:var(--surface-canvas);display:none;flex-direction:column;}
.compare-overlay.open{display:flex;}
.compare-overlay .compare-top{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:16px 24px;border-bottom:0.5px solid var(--border-hairline);}
.compare-overlay .cmp-comparing{font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-subtle);}
.compare-overlay .cmp-chip{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--ink-body);background:rgba(0,105,110,.06);border:0.5px solid rgba(0,105,110,.15);border-radius:20px;padding:5px 12px;}
.compare-overlay .cmp-chip-x{width:16px;height:16px;border-radius:50%;background:rgba(0,0,0,.08);border:none;cursor:pointer;color:var(--ink-muted);font-size:12px;line-height:1;}
.compare-overlay .cmp-add-more{background:none;border:0.5px solid var(--border-hairline);border-radius:20px;padding:5px 12px;font-size:13px;color:var(--ink-body);cursor:pointer;}
.compare-overlay #compare-exit{margin-left:auto;}
#compare-body{flex:1;overflow:auto;padding:24px;}
.cmp-cols{display:grid;gap:20px;}
.cmp-cols.cmp-n2{grid-template-columns:1fr 1fr;}
.cmp-cols.cmp-n3{grid-template-columns:1fr 1fr 1fr;}
.cmp-col{border:0.5px solid var(--border-hairline);border-radius:14px;padding:18px;background:var(--surface-card);}
.cmp-col-label{font-size:12px;font-weight:600;color:var(--ink-muted);margin-bottom:12px;}
.cmp-arabic{font-size:22px;line-height:2.1;color:var(--ink-body);margin-bottom:14px;}
.cmp-arabic-empty{margin-bottom:14px;}
.diff-highlight{background:var(--grade-daif-bg,rgba(212,160,23,.16));border-radius:3px;padding:0 3px;}
.cmp-trans{position:relative;padding-left:14px;color:var(--ink-muted);font-size:15px;line-height:1.7;}
.cmp-trans::before{content:"";position:absolute;left:0;top:2px;bottom:2px;width:3px;border-radius:2px;background:var(--brand-teal,#00696e);}
.cmp-chain-note{margin-top:14px;font-size:13px;}
.cmp-empty{padding:40px;text-align:center;}
/* Mobile: tabs instead of squeezed columns (DoD-3) */
@media (max-width:900px){
  .cmp-cols.cmp-n2,.cmp-cols.cmp-n3{grid-template-columns:1fr;}
  .cmp-col{display:none;}
  .cmp-col.cmp-tab-active{display:block;}
  .cmp-tabbar{display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;}
  .cmp-tab-btn.on{background:rgba(0,105,110,.10);border-color:rgba(0,105,110,.3);}
}
/* wide screens: tabbar never shows (columns are side-by-side) */
@media (min-width:901px){ .cmp-tabbar{display:none;} }
```

> If `--grade-daif-bg` / `--brand-teal` are not the exact token names in `docs/DESIGN-SYSTEM.md`, substitute the correct gold-50-background and teal tokens. The fallbacks after the comma are only a safety net; prefer the real token. Do NOT introduce a brand-new color.

- [ ] **Step 3: Add the drawer + overlay markup** — immediately after the existing `.trace-overlay` markup block (after line 1879, the closing `</div>` of trace-overlay), add:

```html
<!-- Module 15: Comparison Mode drawer (feed) + overlay -->
<div class="compare-drawer" id="compare-drawer" role="region" aria-label="Comparison selection"></div>

<div class="compare-overlay" id="compare-overlay" role="dialog" aria-modal="true" aria-label="Hadith Comparison" hidden>
  <div class="compare-top">
    <div id="compare-header"></div>
    <button class="footer-action-btn" type="button" id="compare-exit">Exit Comparison →</button>
  </div>
  <div id="compare-body"></div>
</div>
```

- [ ] **Step 4: Add the script tags** — after the `trace-view.js` script tag (line 2014) and BEFORE `hadith.js` (line 2015), add:

```html
<script src="src/js/compare-view-core.js"></script>
<script src="src/js/compare-view.js"></script>
```

Order matters: `compare-view-core.js` before `compare-view.js`, both before `hadith.js` (which injects the host on init).

- [ ] **Step 5: Verify no leftover static demo + scripts present**

Run: `grep -nE "compare-item|compare-overlay|compare-view" hadith.html`
Expected: NO `compare-item` (static demo gone); `compare-overlay` present; both `compare-view*.js` scripts present.

- [ ] **Step 6: Commit**

```bash
git add hadith.html
git commit -m "feat(hadith): Module 15 — replace static compare demo with real drawer+overlay markup/CSS (US-H19)"
```

---

## Task 9: `hadith.js` — state, wiring, drawer render, routing

**Files:**
- Modify: `src/js/hadith.js` (state block, `wireCardActions` ~717, `renderRoute` ~357, `parseRoute` ~182, `routePath` ~190, init ~1314)

- [ ] **Step 1: Add compare state + drawer render + open helper**

Near the other `state` fields / helper functions (place after `exitTrace` at line 712), add:

```js
  /* ── Module 15: Comparison Mode ── */
  var compareSet = [];   // in-memory ordered Set of refs (slug:book:num), max 3
  function compareCore() { return II.compareViewCore; }
  function renderCompareDrawer() {
    var drawer = document.getElementById('compare-drawer'); if (!drawer || !compareCore()) return;
    if (!compareSet.length) { drawer.classList.remove('open'); drawer.innerHTML = ''; return; }
    var hadiths = compareSet.map(function (ref) { return FEED.byRef[ref] || refStub(ref); });
    var chips = compareCore().buildHeaderChipsHTML(hadiths)
      .replace('<span class="cmp-comparing">Comparing</span>', '<span class="cmp-drawer-label">Comparing</span>')
      .replace(/<button type="button" class="cmp-add-more"[^>]*>[^<]*<\/button>/, '');
    var canGo = compareCore().canCompare(compareSet);
    drawer.innerHTML = chips +
      '<button class="footer-action-btn primary cmp-compare-go" type="button" data-cmp-go' +
      (canGo ? '' : ' disabled') + '>Compare →</button>';
    drawer.classList.add('open');
  }
  // Minimal hadith-like object so a drawer chip label renders before the feed object is present.
  function refStub(ref) {
    var p = parseRefParts(ref);
    return { collectionSlug: p.slug, collectionName: p.slug, bookNumber: p.book, hadithNumber: p.num };
  }
  function addToCompare(ref) {
    if (!compareCore()) return;
    var res = compareCore().addRef(compareSet, ref);
    compareSet = res.list;
    if (!res.added && res.full) ui.showToast('You can compare up to 3 hadiths');
    else if (res.added) ui.showToast('Added to comparison');
    reflectCompareButtons();
    renderCompareDrawer();
  }
  function removeFromCompare(ref) {
    if (!compareCore()) return;
    compareSet = compareCore().removeRef(compareSet, ref);
    reflectCompareButtons();
    renderCompareDrawer();
  }
  // Disable every compare-add button once at capacity; reflect "added" state per card.
  function reflectCompareButtons() {
    var full = compareSet.length >= (compareCore() ? compareCore().MAX_COMPARE : 3);
    document.querySelectorAll('.hadith-card [data-act="compare-add"]').forEach(function (b) {
      var card = b.closest('.hadith-card'); var ref = card && card.getAttribute('data-ref');
      var added = ref && compareSet.indexOf(ref) !== -1;
      b.classList.toggle('active', !!added);
      b.disabled = full && !added;
    });
  }
  function openCompareRoute() {
    if (!compareCore() || !compareCore().canCompare(compareSet)) return;
    var url = '/hadith/compare?refs=' + encodeURIComponent(compareCore().serializeRefs(compareSet));
    try { history.pushState({ compare: true }, '', url); } catch (_) {}
    renderRoute({ compare: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function exitCompare() { try { history.replaceState({ collection: null }, '', '/hadith.html'); } catch (_) {} renderRoute({ collection: null }); }
```

> `parseRefParts` and `FEED.byRef` already exist (used at `hadith.js:682` and `:308`). `refStub` uses them so a drawer chip shows before the feed object loads.

- [ ] **Step 2: Wire the `compare-add` card action**

In `wireCardActions` (line 723-724), extend the allow-list and add the dispatch (line 734):

```js
      if (act !== 'bookmark' && act !== 'note' && act !== 'listen' && act !== 'share' &&
          act !== 'copy' && act !== 'copy-arabic' && act !== 'trace' && act !== 'compare-add') return;
```

```js
      else if (act === 'trace') { if (II.traceView) II.traceView.open(ref, { viaRoute: false }); }
      else if (act === 'compare-add') { addToCompare(ref); }
```

- [ ] **Step 3: Wire the drawer's "Compare →" + chip × (delegated)**

Add a one-time delegated handler. Place this call inside the same init path that calls `wireCardActions()` (search for `wireCardActions();` and add `wireCompareDrawer();` right after it), and define:

```js
  function wireCompareDrawer() {
    var drawer = document.getElementById('compare-drawer'); if (!drawer || drawer.dataset.wired) return;
    drawer.dataset.wired = '1';
    drawer.addEventListener('click', function (e) {
      if (e.target.closest('[data-cmp-go]')) { openCompareRoute(); return; }
      var rm = e.target.closest('[data-cmp-remove]');
      if (rm) { removeFromCompare(rm.getAttribute('data-cmp-remove')); }
    });
  }
```

- [ ] **Step 4: Add the routing branches**

In `parseRoute` (after the trace match at line 185, before the generic `m` match at line 186), add:

```js
    if (/^\/hadith\/compare\/?$/.test(path)) return { compare: true };
```

In `routePath` (after the trace branch at line 193), add:

```js
    if (r && r.compare) return '/hadith/compare';
```

In `renderRoute` (at the very top of the function, right after `r = r || parseRoute();` on line 358, BEFORE the trace branch), add the compare branch. It reads refs from `location.search` (not the path), mirroring the grade-filter pattern:

```js
    if (r.compare) {
      var refsParam; try { refsParam = new URLSearchParams(location.search).get('refs'); } catch (_) { refsParam = ''; }
      var refs = compareCore() ? compareCore().parseRefs(refsParam) : [];
      if (II.compareView) II.compareView.open(refs, { viaRoute: true });
      return;
    }
    // Navigating to a NON-compare route while the compare overlay is open (Back/popstate):
    // close it with skipNav (renderRoute is already rendering the target).
    if (II.compareView && II.compareView.isOpen && II.compareView.isOpen()) { II.compareView.close({ skipNav: true }); }
```

> Place the `isOpen → close` guard alongside the existing trace guard at line 370 style — but the compare branch above `return`s early when entering compare, so the guard only runs when leaving compare. Put the guard right after the compare `if (r.compare){…}` block.

- [ ] **Step 5: Inject the compare host in init**

After the `II.traceView.init({...})` block (lines 1314-1316), add:

```js
    if (II.compareView && II.compareView.init) {
      II.compareView.init({ ui: ui, fetchHadithByRef: fetchHadithByRef, exitCompare: exitCompare, addMore: exitCompare });
    }
```

> `addMore` and `exitCompare` are the same action ("+ Add Hadith" returns to the feed with `compareSet` intact — the drawer is still rendered from in-memory state).

- [ ] **Step 6: Re-reflect compare buttons after each feed render**

Find where the feed re-renders cards and calls `markCardStates` (line 486 defines it; it's called after rendering — e.g. `markCardStates(listEl)` at line 329 and in the main feed render). In `markCardStates` (line 486), add a call to `reflectCompareButtons()` at its end so newly-rendered cards reflect capacity/added state:

```js
    // ... existing markCardStates body ...
    reflectCompareButtons();
  }
```

- [ ] **Step 7: Run the full worker suite (guard against regressions)**

Run: `cd worker && node --test "test/*.test.js"`
Expected: PASS — all prior tests plus the new compare-view-core + feed-core tests green.

- [ ] **Step 8: Manual parse check of hadith.js**

Run: `node -e "require('./src/js/hadith.js')" 2>&1 | head -3`
Expected: a `ReferenceError` about `window`/`document` (parses OK). A `SyntaxError` is a real failure — fix it.

- [ ] **Step 9: Commit**

```bash
git add src/js/hadith.js
git commit -m "feat(hadith): Module 15 — compareSet state, drawer, compare-add wiring, /hadith/compare routing (US-H19)"
```

---

## Task 10: Docs — DECISIONS + DATA note

**Files:**
- Modify: `doc/DECISIONS.md`
- Modify: `docs/DATA.md`

- [ ] **Step 1: Append three ADR entries to `doc/DECISIONS.md`**

Match the file's existing ADR heading/numbering style (open the file, use the next ADR numbers in sequence). Content:

```markdown
### ADR-0XX — Module 15: chain-diverge ◆ built but dormant

Comparison Mode's spec calls for `.chain-diverge` (◆) markers where narrators differ
between compared isnads. Isnad/narrator-chain data is universally absent in today's
dataset (Modules 8 & 14 render chains as honest "not available"). Computing divergence
with no narrator arrays would render nothing or fabricate content — a §0 violation. The
`diffChains` logic is implemented and unit-tested against mock narrator arrays but stays
dormant; prod shows an honest "Isnad comparison not yet available — chains are being
compiled" note. It activates automatically when narrator data lands. (Matches Modules 7–14.)

### ADR-0XX — Module 15: translation excluded from diff-highlighting

`.diff-highlight` runs ONLY on `arabicMatn`. Per §0, the Arabic matn IS the narration, so
a word-diff over it is a genuine narration-level diff. Translations differ by translator
word-choice, not narration content; highlighting them would misrepresent two translations
of the same narration as different narrations. Translations are shown side-by-side for
reading but never highlighted. Missing Arabic → honest "cannot diff narration", never a
translation fallback.

### ADR-0XX — Module 15: comparison selection is in-memory + URL-encoded refs

The comparison Set lives in memory during the session; activating "Compare →" writes refs
into the URL (`/hadith/compare?refs=slug:book:num,…`). Deep-links/shares work via fresh
per-ref fetch on load. No sessionStorage and no new DATA.md storage key — losing an
in-progress selection on accidental reload is a narrow edge case, deferred until it proves
real in practice.
```

- [ ] **Step 2: Add a note to `docs/DATA.md`**

In the localStorage key registry section, add a one-line note (no new key):

```markdown
> **Module 15 (Comparison Mode):** uses NO localStorage/sessionStorage key. The selected
> comparison set is held in memory and encoded in the URL (`/hadith/compare?refs=…`).
```

- [ ] **Step 3: Commit**

```bash
git add doc/DECISIONS.md docs/DATA.md
git commit -m "docs(hadith): Module 15 — ADRs (dormant chain-diverge, translation-not-diffed, in-memory+URL) (US-H19)"
```

---

## Task 11: Verification — DOM smoke + the required real diff example

**Files:**
- Create (temporary): `worker/test/compare-view-dom.smoke.mjs` (a throwaway smoke script; do NOT leave it committed unless it fits the repo's smoke-test convention — check `worker/test/` for an existing `*.smoke.*` pattern first)

- [ ] **Step 1: Prove the VERIFICATION NOTE with a real 2-hadith example**

Write a tiny script `worker/test/_verify-diff.mjs` and run it:

```js
import core from '../../src/js/compare-view-core.js';
// Two genuinely different narrations sharing most words.
const a = 'إنما الأعمال بالنيات وإنما لكل امرئ ما نوى';
const b = 'إنما الأعمال بالنيات وإنما لكل امرئ ما هاجر إليه';
const flags = core.computeDiff([core.tokenizeMatn(a), core.tokenizeMatn(b)]);
const ta = core.tokenizeMatn(a), tb = core.tokenizeMatn(b);
console.log('A differing words:', ta.filter((t, i) => flags[0][i]).map(t => t.raw));
console.log('B differing words:', tb.filter((t, i) => flags[1][i]).map(t => t.raw));
// Confirm a whitespace/punctuation-only variant of A shows ZERO diff:
const aPunct = ' إنما  الأعمالُ، بالنياتِ وإنما لكل امرئٍ ما نوى ';
const f2 = core.computeDiff([core.tokenizeMatn(a), core.tokenizeMatn(aPunct)]);
console.log('punct/diacritic-only variant diffs (must be empty):',
  core.tokenizeMatn(aPunct).filter((t, i) => f2[1][i]).map(t => t.raw));
```

Run: `cd worker && node test/_verify-diff.mjs`
Expected: the first two lines list only the genuinely different tail words (`نوى` vs `هاجر إليه`); the last line is an **empty array** (no whitespace/punctuation/diacritic false positives). Paste this output into the verification note.

Then delete the throwaway: `rm worker/test/_verify-diff.mjs`

- [ ] **Step 2: Run the full worker suite one final time**

Run: `cd worker && node --test "test/*.test.js"`
Expected: ALL PASS. Record the pass count.

- [ ] **Step 3: Manual browser flows (FLAG as outstanding — do NOT mark done)**

These require the Worker/hadithapi reachable for real hadith data (same deferral as Modules 7–14). Document them as outstanding in the verification note:
- Select 2, then 3 hadiths via card "Add to comparison"; confirm the 4th attempt is blocked + toast.
- Drawer "Compare →" opens `/hadith/compare?refs=…`; two/three columns render; a real Arabic diff highlights only differing words; translations are NOT highlighted; the isnad note reads "not yet available".
- Chip × removes an item and updates the URL; dropping to 1 shows "select at least 2".
- "+ Add Hadith" returns to the feed with the drawer intact.
- Deep-link a `/hadith/compare?refs=…` URL on a fresh load → renders; a bad ref → honest error.
- ≤900px viewport shows tabs, not squeezed columns.
- VoiceOver/NVDA: overlay focus-trap + Escape return focus.

- [ ] **Step 4: Write the verification note**

Create `docs/superpowers/specs/2026-07-22-module-15-verification.md` capturing: the Step-1 diff output (proving DoD-4 / VERIFICATION NOTE), the Step-2 pass count, and the Step-3 outstanding manual list. Commit:

```bash
git add docs/superpowers/specs/2026-07-22-module-15-verification.md
git commit -m "docs(hadith): Module 15 — verification (real diff example, test count, outstanding manual AT) (US-H19)"
```

---

## Self-review checklist (run before starting execution)

- **Spec coverage:** selection/drawer (T1,T6,T9), max-3 enforced (T1,T9 DoD-1), Arabic-only word diff (T2,T3,T5 DoD-2), translation not highlighted (T5), missing-Arabic honest (T5), dormant chain-diverge (T4,T5), overlay+URL routing/deep-link (T7,T9), mobile tabs (T8 DoD-3), verification note (T11 DoD-4), DECISIONS (T10). ✅ All spec sections mapped.
- **Type consistency:** `computeDiff` returns `bool[][]`; `diffTwo` returns `{a,b}` (wrapped into array form by `computeDiff`); `addRef` returns `{list,added,full}`; `buildHeaderChipsHTML`/`buildCompareHTML`/`buildEmptyStateHTML` take arrays and return strings; `refOf`/`refKey` produce `slug:book:num` identically in core and controller. Consistent across tasks.
- **No placeholders:** every code step shows complete code. The only "substitute the real token" notes (design-system color tokens, the feed-test fixture name) are explicit lookups against named files, not vague TODOs.
- **Mobile tabs (DoD-3):** Task 7 `renderInto()` calls `applyTabs()` on ≤900px, which emits the `.cmp-tabbar` + `.cmp-tab-active` markup that Task 8's CSS expects — controller and CSS now agree.