# Module 17 — Saved Reading Paths (US-H22) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the 4 canonical built-in reading paths with progress-ring UI, deep-view reading-path strip, and localStorage progress tracking — with hadith references honestly deferred (curation-pending) so zero unverified citations ship.

**Architecture:** Pure `reading-paths-core.js` (ring geometry, progress math, next-unread, view-model, storage merge/serialize — all DOM/network/localStorage-free, unit-tested) + `reading-paths.js` DOM layer (fetch seed, render sidebar + deep-view strip, own localStorage I/O) + `reading-paths.json` seed (4 paths, empty `hadithRefs`). Mirrors the ADR-027 core+DOM split used by Modules 14–16. Fabricated static markup in `hadith.html` is removed.

**Tech Stack:** Vanilla ES5-style UMD JS (`window.II.*` in browser, `module.exports` in tests), `node --test` (node:test + node:assert), static JSON seed fetched like `collections-meta.json`.

**Design spec:** `docs/superpowers/specs/2026-07-22-module-17-reading-paths-design.md`

**Test command (all tasks):** `cd worker && npm test` (runs `node --test "test/*.test.js"`). Baseline is 369 passing — must stay green.

---

## File Structure

- **Create** `src/data/hadith/reading-paths.json` — 4 path definitions, `hadithRefs: []`.
- **Create** `src/js/reading-paths-core.js` — pure logic + UMD export `window.II.readingPaths`.
- **Create** `worker/test/reading-paths-core.test.js` — unit tests for the core.
- **Create** `src/js/reading-paths.js` — DOM layer (fetch, render, localStorage, strip).
- **Modify** `hadith.html` — remove fabricated rows + strip; add JS containers + `<script>` tags.
- **Modify** `doc/DATA.md` — register `islamicinfo-hadith-paths` localStorage key.
- **Modify** `doc/DECISIONS.md` — add ADR for curation-deferred posture.

**Storage key:** `islamicinfo-hadith-paths`, shape `{ [slug]: string[] }` (per-path array of read hadith-ref ids).

**Ref id format (future curated data):** a `hadithRefs` entry is `{ collection, book, hadith }`; its stable id is `` `${collection}:${book}:${hadith}` `` (used as the string stored in the read-array). Provided by core helper `refId()`.

---

## Task 1: Seed data file + shape test

**Files:**
- Create: `src/data/hadith/reading-paths.json`
- Test: `worker/test/reading-paths-core.test.js` (shape assertions added first; core tests appended in later tasks)

- [ ] **Step 1: Write the failing test**

Create `worker/test/reading-paths-core.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const seed = JSON.parse(
  readFileSync(join(__dirname, '../../src/data/hadith/reading-paths.json'), 'utf8')
);

// ── seed shape (DoD: exactly 4 canonical paths, no 5th) ──────────────
test('seed: exactly 4 canonical paths in canonical order', () => {
  assert.equal(seed.paths.length, 4);
  assert.deepEqual(
    seed.paths.map((p) => p.slug),
    ['nawawi-40', 'kutub-sittah-basics', 'faith-foundations', 'prophetic-character']
  );
});

test('seed: canonical target counts per FIX-2', () => {
  assert.deepEqual(
    seed.paths.map((p) => p.targetCount),
    [42, 50, 30, 25]
  );
});

test('seed: no 5th "Daily Sunnah" path (deferred post-v1)', () => {
  assert.ok(!seed.paths.some((p) => /daily.?sunnah/i.test(p.slug + p.name)));
});

test('seed: every path ships with deferred (empty) hadithRefs — no unverified refs', () => {
  for (const p of seed.paths) {
    assert.equal(p.status, 'curation-pending');
    assert.deepEqual(p.hadithRefs, []);
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd worker && node --test test/reading-paths-core.test.js`
Expected: FAIL — cannot read `reading-paths.json` (ENOENT).

- [ ] **Step 3: Create the seed file**

Create `src/data/hadith/reading-paths.json`:

```json
{
  "_note": "Built-in reading path definitions. hadithRefs deferred pending editorial + scholar curation (CONTENT-POLICY §5). Each ref, once curated, is {collection,book,hadith} resolving to a live /api/hadith route. Do not populate hadithRefs without scholar sign-off.",
  "paths": [
    {
      "slug": "nawawi-40",
      "name": "Start with 40 Nawawi",
      "targetCount": 42,
      "accent": "teal",
      "status": "curation-pending",
      "description": "A short, structured entry point into the Sunnah.",
      "hadithRefs": []
    },
    {
      "slug": "kutub-sittah-basics",
      "name": "Kutub al-Sittah basics",
      "targetCount": 50,
      "accent": "teal",
      "status": "curation-pending",
      "description": "Foundational narrations across the six major collections.",
      "hadithRefs": []
    },
    {
      "slug": "faith-foundations",
      "name": "Faith foundations",
      "targetCount": 30,
      "accent": "gold",
      "status": "curation-pending",
      "description": "Narrations on belief, worship, and the core of faith.",
      "hadithRefs": []
    },
    {
      "slug": "prophetic-character",
      "name": "Prophetic Character",
      "targetCount": 25,
      "accent": "gold",
      "status": "curation-pending",
      "description": "Narrations on the manners and character of the Prophet ﷺ.",
      "hadithRefs": []
    }
  ]
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd worker && node --test test/reading-paths-core.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/data/hadith/reading-paths.json worker/test/reading-paths-core.test.js
git commit -m "feat(hadith): Module 17 seed — 4 canonical reading paths, refs deferred (US-H22)"
```

---

## Task 2: Core — `ringGeometry` (DoD-critical: 0/50/100%)

**Files:**
- Create: `src/js/reading-paths-core.js`
- Test: `worker/test/reading-paths-core.test.js` (append)

- [ ] **Step 1: Write the failing test** (append to the test file)

```js
import core from '../../src/js/reading-paths-core.js';

// ── ringGeometry (DoD §5: stroke-dashoffset correct at 0/50/100%) ────
test('ringGeometry: circumference = 2πr for default r=12', () => {
  const g = core.ringGeometry(0);
  assert.ok(Math.abs(g.dashArray - 2 * Math.PI * 12) < 1e-6);
});

test('ringGeometry: 0% → dashOffset === full circumference (empty arc)', () => {
  const g = core.ringGeometry(0);
  assert.ok(Math.abs(g.dashOffset - g.dashArray) < 1e-6);
});

test('ringGeometry: 50% → dashOffset === half circumference', () => {
  const g = core.ringGeometry(50);
  assert.ok(Math.abs(g.dashOffset - g.dashArray / 2) < 1e-6);
});

test('ringGeometry: 100% → dashOffset === 0 (full arc)', () => {
  const g = core.ringGeometry(100);
  assert.ok(Math.abs(g.dashOffset - 0) < 1e-6);
});

test('ringGeometry: out-of-range percent is clamped to [0,100]', () => {
  assert.ok(Math.abs(core.ringGeometry(-20).dashOffset - core.ringGeometry(0).dashOffset) < 1e-6);
  assert.ok(Math.abs(core.ringGeometry(140).dashOffset - core.ringGeometry(100).dashOffset) < 1e-6);
});

test('ringGeometry: custom radius honored', () => {
  const g = core.ringGeometry(100, 20);
  assert.ok(Math.abs(g.dashArray - 2 * Math.PI * 20) < 1e-6);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd worker && node --test test/reading-paths-core.test.js`
Expected: FAIL — `Cannot find module '../../src/js/reading-paths-core.js'`.

- [ ] **Step 3: Create the core file with `ringGeometry`**

Create `src/js/reading-paths-core.js`:

```js
/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — reading-paths-core.js  (Module 17, US-H22)
   Pure, framework-free logic for built-in Reading Paths. NO DOM, NO
   network, NO localStorage — the DOM layer (reading-paths.js) does all
   I/O and delegates every decision here. UMD: window.II.readingPaths in
   the browser, module.exports in tests. Mirrors hadith-display-mode-core.js.

   Posture (see design spec 2026-07-22 + ADR): paths ship with EMPTY
   hadithRefs (curation-pending). Navigation/completion logic is fully
   implemented and unit-tested against mocked populated paths, but stays
   dormant against the live seed, which renders the honest "Coming soon"
   empty state. No hadith reference is authored here.
   ═══════════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  function clampPercent(p) {
    p = Number(p);
    if (!isFinite(p)) return 0;
    if (p < 0) return 0;
    if (p > 100) return 100;
    return p;
  }

  // ── ringGeometry ──────────────────────────────────────────────────
  // SVG progress ring. dashArray = full circumference; dashOffset shrinks
  // from full (0%) to 0 (100%). r defaults to 12 (matches hadith.html
  // viewBox 0 0 28 28, r=12, stroke-width 2.5).
  function ringGeometry(percent, r) {
    r = r == null ? 12 : Number(r);
    var circ = 2 * Math.PI * r;
    var pct = clampPercent(percent);
    return { dashArray: circ, dashOffset: circ * (1 - pct / 100) };
  }

  var core = {
    ringGeometry: ringGeometry,
    _clampPercent: clampPercent,
  };

  if (typeof module !== 'undefined' && module.exports) { module.exports = core; }
  else { root.II = root.II || {}; root.II.readingPaths = core; }

}(typeof globalThis !== 'undefined' ? globalThis : window));
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd worker && node --test test/reading-paths-core.test.js`
Expected: PASS (all Task 1 + Task 2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/js/reading-paths-core.js worker/test/reading-paths-core.test.js
git commit -m "feat(hadith): Module 17 core ringGeometry — DoD 0/50/100% dashoffset (US-H22)"
```

---

## Task 3: Core — `pathProgress`

**Files:**
- Modify: `src/js/reading-paths-core.js`
- Test: `worker/test/reading-paths-core.test.js` (append)

- [ ] **Step 1: Write the failing test** (append)

```js
// ── pathProgress ─────────────────────────────────────────────────────
const MOCK_PATH = {
  slug: 'mock', name: 'Mock', targetCount: 4, status: 'ready',
  hadithRefs: [
    { collection: 'sahih-bukhari', book: '1', hadith: '1' },
    { collection: 'sahih-bukhari', book: '1', hadith: '2' },
    { collection: 'sahih-muslim', book: '1', hadith: '3' },
    { collection: 'sahih-muslim', book: '1', hadith: '4' }
  ]
};

test('pathProgress: empty read set → 0 of targetCount, 0%, not complete', () => {
  const p = core.pathProgress(MOCK_PATH, new Set());
  assert.deepEqual(
    { readCount: p.readCount, targetCount: p.targetCount, percent: p.percent, complete: p.complete },
    { readCount: 0, targetCount: 4, percent: 0, complete: false }
  );
});

test('pathProgress: partial read set → correct count + rounded percent', () => {
  const p = core.pathProgress(MOCK_PATH, new Set(['sahih-bukhari:1:1', 'sahih-bukhari:1:2']));
  assert.equal(p.readCount, 2);
  assert.equal(p.percent, 50);
  assert.equal(p.complete, false);
});

test('pathProgress: all read → complete true, 100%', () => {
  const all = new Set(MOCK_PATH.hadithRefs.map(core.refId));
  const p = core.pathProgress(MOCK_PATH, all);
  assert.equal(p.readCount, 4);
  assert.equal(p.percent, 100);
  assert.equal(p.complete, true);
});

test('pathProgress: only refs IN the path count (stray read ids ignored)', () => {
  const p = core.pathProgress(MOCK_PATH, new Set(['some-other:9:9']));
  assert.equal(p.readCount, 0);
});

test('pathProgress: empty deferred path (targetCount>0, no refs) → 0%, not complete', () => {
  const deferred = { slug: 'x', targetCount: 42, hadithRefs: [] };
  const p = core.pathProgress(deferred, new Set());
  assert.deepEqual(
    { readCount: p.readCount, targetCount: p.targetCount, percent: p.percent, complete: p.complete },
    { readCount: 0, targetCount: 42, percent: 0, complete: false }
  );
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd worker && node --test test/reading-paths-core.test.js`
Expected: FAIL — `core.refId is not a function` / `core.pathProgress is not a function`.

- [ ] **Step 3: Implement `refId` + `pathProgress`**

In `src/js/reading-paths-core.js`, add above the `core` object:

```js
  // ── refId ─────────────────────────────────────────────────────────
  // Stable string id for a hadith reference (the value stored in the
  // per-path read array). Order: collection:book:hadith.
  function refId(ref) {
    if (!ref) return '';
    return [ref.collection, ref.book, ref.hadith].join(':');
  }

  // ── pathProgress ──────────────────────────────────────────────────
  // readSet is a Set of refId strings. Only refs that belong to THIS
  // path's hadithRefs count. percent is against targetCount (so a
  // deferred/empty path honestly reports 0%). complete requires a
  // non-empty target fully read.
  function pathProgress(path, readSet) {
    var refs = (path && path.hadithRefs) || [];
    var target = (path && path.targetCount) || 0;
    var read = 0;
    for (var i = 0; i < refs.length; i++) {
      if (readSet && readSet.has(refId(refs[i]))) read++;
    }
    var percent = target > 0 ? Math.round((read / target) * 100) : 0;
    return {
      readCount: read,
      targetCount: target,
      percent: percent,
      complete: target > 0 && read >= target,
    };
  }
```

Then add to the `core` object literal:

```js
    refId: refId,
    pathProgress: pathProgress,
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd worker && node --test test/reading-paths-core.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/js/reading-paths-core.js worker/test/reading-paths-core.test.js
git commit -m "feat(hadith): Module 17 core pathProgress + refId (US-H22)"
```

---

## Task 4: Core — `nextUnread`, `pathIndexOf`, `isEmptyPath`

**Files:**
- Modify: `src/js/reading-paths-core.js`
- Test: `worker/test/reading-paths-core.test.js` (append)

- [ ] **Step 1: Write the failing test** (append; reuses `MOCK_PATH` from Task 3)

```js
// ── nextUnread ───────────────────────────────────────────────────────
test('nextUnread: none read → first ref', () => {
  assert.equal(core.refId(core.nextUnread(MOCK_PATH, new Set())), 'sahih-bukhari:1:1');
});

test('nextUnread: some read → first not-yet-read in order', () => {
  const r = core.nextUnread(MOCK_PATH, new Set(['sahih-bukhari:1:1']));
  assert.equal(core.refId(r), 'sahih-bukhari:1:2');
});

test('nextUnread: all read → null (complete)', () => {
  const all = new Set(MOCK_PATH.hadithRefs.map(core.refId));
  assert.equal(core.nextUnread(MOCK_PATH, all), null);
});

test('nextUnread: empty deferred path → null', () => {
  assert.equal(core.nextUnread({ hadithRefs: [], targetCount: 42 }, new Set()), null);
});

// ── pathIndexOf ──────────────────────────────────────────────────────
test('pathIndexOf: member ref → 1-based position', () => {
  assert.equal(core.pathIndexOf(MOCK_PATH, 'sahih-muslim:1:3'), 3);
});

test('pathIndexOf: non-member → null', () => {
  assert.equal(core.pathIndexOf(MOCK_PATH, 'not:in:path'), null);
});

// ── isEmptyPath (drives "Coming soon" state) ─────────────────────────
test('isEmptyPath: curation-pending status → true', () => {
  assert.equal(core.isEmptyPath({ status: 'curation-pending', hadithRefs: [] }), true);
});

test('isEmptyPath: empty refs regardless of status → true', () => {
  assert.equal(core.isEmptyPath({ status: 'ready', hadithRefs: [] }), true);
});

test('isEmptyPath: populated path → false', () => {
  assert.equal(core.isEmptyPath(MOCK_PATH), false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd worker && node --test test/reading-paths-core.test.js`
Expected: FAIL — `core.nextUnread is not a function`.

- [ ] **Step 3: Implement the three functions**

In `src/js/reading-paths-core.js`, add above the `core` object:

```js
  // ── nextUnread ────────────────────────────────────────────────────
  // First hadithRef (in path order) whose id is not in readSet, else
  // null (path complete OR empty/deferred).
  function nextUnread(path, readSet) {
    var refs = (path && path.hadithRefs) || [];
    for (var i = 0; i < refs.length; i++) {
      if (!readSet || !readSet.has(refId(refs[i]))) return refs[i];
    }
    return null;
  }

  // ── pathIndexOf ───────────────────────────────────────────────────
  // 1-based position of a refId string within the path (for the strip's
  // "Hadith N of M"); null if not a member.
  function pathIndexOf(path, id) {
    var refs = (path && path.hadithRefs) || [];
    for (var i = 0; i < refs.length; i++) {
      if (refId(refs[i]) === id) return i + 1;
    }
    return null;
  }

  // ── isEmptyPath ───────────────────────────────────────────────────
  // True when the path has no curated refs yet (deferred). Drives the
  // "Coming soon" muted control instead of Continue.
  function isEmptyPath(path) {
    if (!path) return true;
    if (path.status === 'curation-pending') return true;
    return !(path.hadithRefs && path.hadithRefs.length > 0);
  }
```

Then add to the `core` object literal:

```js
    nextUnread: nextUnread,
    pathIndexOf: pathIndexOf,
    isEmptyPath: isEmptyPath,
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd worker && node --test test/reading-paths-core.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/js/reading-paths-core.js worker/test/reading-paths-core.test.js
git commit -m "feat(hadith): Module 17 core nextUnread/pathIndexOf/isEmptyPath (US-H22)"
```

---

## Task 5: Core — storage merge/serialize helpers (pure)

**Files:**
- Modify: `src/js/reading-paths-core.js`
- Test: `worker/test/reading-paths-core.test.js` (append)

- [ ] **Step 1: Write the failing test** (append)

```js
// ── storage pure helpers (DOM layer owns actual localStorage) ────────
test('parseStoredPaths: valid JSON object → same object', () => {
  assert.deepEqual(core.parseStoredPaths('{"mock":["a","b"]}'), { mock: ['a', 'b'] });
});

test('parseStoredPaths: null / garbage / array → empty object (never throws)', () => {
  assert.deepEqual(core.parseStoredPaths(null), {});
  assert.deepEqual(core.parseStoredPaths('not json'), {});
  assert.deepEqual(core.parseStoredPaths('[1,2,3]'), {});
});

test('mergeReadRefs: unions + dedupes, order-stable (existing first)', () => {
  assert.deepEqual(core.mergeReadRefs(['a', 'b'], ['b', 'c', 'c']), ['a', 'b', 'c']);
});

test('mergeReadRefs: missing/empty inputs handled', () => {
  assert.deepEqual(core.mergeReadRefs(undefined, ['a']), ['a']);
  assert.deepEqual(core.mergeReadRefs(['a'], undefined), ['a']);
});

test('serializeStoredPaths: round-trips through parse', () => {
  const obj = { mock: ['a', 'b'] };
  assert.deepEqual(core.parseStoredPaths(core.serializeStoredPaths(obj)), obj);
});

test('readSetFor: builds a Set of ids for a given slug', () => {
  const set = core.readSetFor({ mock: ['a', 'b'] }, 'mock');
  assert.ok(set.has('a') && set.has('b') && set.size === 2);
});

test('readSetFor: unknown slug → empty Set', () => {
  assert.equal(core.readSetFor({}, 'nope').size, 0);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd worker && node --test test/reading-paths-core.test.js`
Expected: FAIL — `core.parseStoredPaths is not a function`.

- [ ] **Step 3: Implement the storage helpers**

In `src/js/reading-paths-core.js`, add above the `core` object:

```js
  // ── storage pure helpers ──────────────────────────────────────────
  // The DOM layer reads/writes localStorage['islamicinfo-hadith-paths'];
  // these pure helpers do the parse/merge/serialize so all logic is
  // testable. Shape: { [slug]: string[] } (arrays of refId strings).
  function parseStoredPaths(raw) {
    if (raw == null) return {};
    try {
      var obj = JSON.parse(raw);
      if (obj && typeof obj === 'object' && !Array.isArray(obj)) return obj;
      return {};
    } catch (e) {
      return {};
    }
  }

  function serializeStoredPaths(obj) {
    return JSON.stringify(obj || {});
  }

  // Union two id arrays, dedupe, keep first-seen order (existing first).
  function mergeReadRefs(existing, add) {
    var seen = Object.create(null);
    var out = [];
    var lists = [existing || [], add || []];
    for (var l = 0; l < lists.length; l++) {
      for (var i = 0; i < lists[l].length; i++) {
        var id = lists[l][i];
        if (!seen[id]) { seen[id] = 1; out.push(id); }
      }
    }
    return out;
  }

  function readSetFor(store, slug) {
    return new Set((store && store[slug]) || []);
  }
```

Then add to the `core` object literal:

```js
    parseStoredPaths: parseStoredPaths,
    serializeStoredPaths: serializeStoredPaths,
    mergeReadRefs: mergeReadRefs,
    readSetFor: readSetFor,
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd worker && node --test test/reading-paths-core.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/js/reading-paths-core.js worker/test/reading-paths-core.test.js
git commit -m "feat(hadith): Module 17 core storage merge/serialize helpers (US-H22)"
```

---

## Task 6: Core — `pathRowViewModel` (drives sidebar + Continue state)

**Files:**
- Modify: `src/js/reading-paths-core.js`
- Test: `worker/test/reading-paths-core.test.js` (append)

- [ ] **Step 1: Write the failing test** (append; reuses `MOCK_PATH`)

```js
// ── pathRowViewModel (pure VM the DOM renders verbatim) ──────────────
test('pathRowViewModel: deferred/empty path → coming-soon, 0%, ring at full offset', () => {
  const deferred = { slug: 'nawawi-40', name: 'Start with 40 Nawawi', targetCount: 42, accent: 'teal', status: 'curation-pending', hadithRefs: [] };
  const vm = core.pathRowViewModel(deferred, new Set());
  assert.equal(vm.continueState, 'coming-soon');
  assert.equal(vm.percent, 0);
  assert.equal(vm.countLabel, '0 of 42 read');
  assert.equal(vm.accent, 'teal');
  assert.ok(Math.abs(vm.ring.dashOffset - vm.ring.dashArray) < 1e-6);
});

test('pathRowViewModel: partially-read populated path → continue', () => {
  const vm = core.pathRowViewModel(MOCK_PATH, new Set(['sahih-bukhari:1:1']));
  assert.equal(vm.continueState, 'continue');
  assert.equal(vm.percent, 25);
  assert.equal(vm.countLabel, '1 of 4 read');
});

test('pathRowViewModel: fully-read path → complete (Path complete ✓ state)', () => {
  const all = new Set(MOCK_PATH.hadithRefs.map(core.refId));
  const vm = core.pathRowViewModel(MOCK_PATH, all);
  assert.equal(vm.continueState, 'complete');
  assert.equal(vm.percent, 100);
});

test('pathRowViewModel: exposes name + slug for rendering', () => {
  const vm = core.pathRowViewModel(MOCK_PATH, new Set());
  assert.equal(vm.slug, 'mock');
  assert.equal(vm.name, 'Mock');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd worker && node --test test/reading-paths-core.test.js`
Expected: FAIL — `core.pathRowViewModel is not a function`.

- [ ] **Step 3: Implement `pathRowViewModel`**

In `src/js/reading-paths-core.js`, add above the `core` object:

```js
  // ── pathRowViewModel ──────────────────────────────────────────────
  // One sidebar row's fully-resolved view model. continueState:
  //   'coming-soon' → deferred/empty path (muted, non-interactive)
  //   'complete'    → fully read (Path complete ✓, gold, non-action)
  //   'continue'    → has an unread next hadith (Continue → link)
  function pathRowViewModel(path, readSet) {
    var prog = pathProgress(path, readSet);
    var state;
    if (isEmptyPath(path)) state = 'coming-soon';
    else if (prog.complete) state = 'complete';
    else state = 'continue';
    return {
      slug: path && path.slug,
      name: (path && path.name) || '',
      accent: (path && path.accent) || 'teal',
      percent: prog.percent,
      countLabel: prog.readCount + ' of ' + prog.targetCount + ' read',
      ring: ringGeometry(prog.percent),
      continueState: state,
    };
  }
```

Then add to the `core` object literal:

```js
    pathRowViewModel: pathRowViewModel,
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd worker && node --test test/reading-paths-core.test.js`
Expected: PASS.

- [ ] **Step 5: Run the FULL suite (regression gate)**

Run: `cd worker && npm test`
Expected: PASS — 369 baseline + all new core tests, zero failures.

- [ ] **Step 6: Commit**

```bash
git add src/js/reading-paths-core.js worker/test/reading-paths-core.test.js
git commit -m "feat(hadith): Module 17 core pathRowViewModel — sidebar + Continue states (US-H22)"
```

---

## Task 7: DOM layer — `reading-paths.js` (sidebar render + storage)

No node unit test (this codebase does not jsdom-test DOM layers — Modules 8/14/16 used manual DOM smoke). Verification is a manual browser smoke at the end of the task.

**Files:**
- Create: `src/js/reading-paths.js`

- [ ] **Step 1: Create the DOM layer**

Create `src/js/reading-paths.js`:

```js
/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — reading-paths.js  (Module 17, US-H22) — DOM layer.
   Fetches src/data/hadith/reading-paths.json, renders the sidebar
   Reading Paths section (first 3 rows + "View all →") and the deep-view
   reading-path strip, and owns all localStorage I/O. All decisions come
   from window.II.readingPaths (reading-paths-core.js).

   Curation-deferred posture: seed paths have empty hadithRefs, so every
   row renders the "Coming soon" state and the strip never mounts. The
   continue/complete/strip paths are built + covered by core unit tests
   against mocked populated paths, ready for the future curation task.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var core = (window.II && window.II.readingPaths) || null;
  if (!core) return;

  var SEED_URL = 'src/data/hadith/reading-paths.json';
  var STORAGE_KEY = 'islamicinfo-hadith-paths';
  var LIST_ID = 'reading-paths-list';
  var VISIBLE = 3; // sidebar shows first 3; rest behind "View all →"

  var paths = [];
  var expanded = false;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function loadStore() {
    var raw = null;
    try { raw = window.localStorage.getItem(STORAGE_KEY); } catch (e) {}
    return core.parseStoredPaths(raw);
  }

  // (used by the future curated Continue/Next flow; dormant for empty seed)
  function markRead(slug, id) {
    var store = loadStore();
    store[slug] = core.mergeReadRefs(store[slug], [id]);
    try { window.localStorage.setItem(STORAGE_KEY, core.serializeStoredPaths(store)); } catch (e) {}
  }

  function ringSVG(vm) {
    var stroke = vm.accent === 'gold' ? 'var(--gold-500)' : 'var(--teal-700)';
    return (
      '<div class="path-ring">' +
        '<svg viewBox="0 0 28 28" fill="none" width="28" height="28" aria-hidden="true">' +
          '<circle cx="14" cy="14" r="12" stroke="rgba(0,105,110,.15)" stroke-width="2.5"/>' +
          '<circle cx="14" cy="14" r="12" stroke="' + stroke + '" stroke-width="2.5" ' +
            'stroke-dasharray="' + vm.ring.dashArray.toFixed(2) + '" ' +
            'stroke-dashoffset="' + vm.ring.dashOffset.toFixed(2) + '" ' +
            'stroke-linecap="round" transform="rotate(-90 14 14)"/>' +
        '</svg>' +
        '<span class="path-ring-text">' + vm.percent + '%</span>' +
      '</div>'
    );
  }

  function continueControl(vm) {
    if (vm.continueState === 'coming-soon') {
      return '<span class="path-continue path-continue--soon" aria-disabled="true">Coming soon</span>';
    }
    if (vm.continueState === 'complete') {
      return '<span class="path-continue path-continue--done">Path complete ✓</span>';
    }
    return '<button class="path-continue" type="button" data-path-continue="' + esc(vm.slug) + '">Continue →</button>';
  }

  function rowHTML(path, readSet) {
    var vm = core.pathRowViewModel(path, readSet);
    return (
      '<div class="reading-path-row" data-path-slug="' + esc(vm.slug) + '">' +
        ringSVG(vm) +
        '<div class="reading-path-meta">' +
          '<div class="reading-path-name">' + esc(vm.name) + '</div>' +
          '<div class="reading-path-count">' + esc(vm.countLabel) + '</div>' +
        '</div>' +
        continueControl(vm) +
      '</div>'
    );
  }

  function render() {
    var list = document.getElementById(LIST_ID);
    if (!list) return;
    var store = loadStore();
    var shown = expanded ? paths : paths.slice(0, VISIBLE);
    var html = shown.map(function (p) {
      return rowHTML(p, core.readSetFor(store, p.slug));
    }).join('');
    if (!expanded && paths.length > VISIBLE) {
      html += '<button class="reading-path-viewall" type="button" id="reading-paths-viewall">View all →</button>';
    }
    list.innerHTML = html;
    var viewall = document.getElementById('reading-paths-viewall');
    if (viewall) viewall.addEventListener('click', function () { expanded = true; render(); });
    // Continue buttons are inert for the deferred seed (no rows emit them),
    // but wire them for the future curated data path.
    list.querySelectorAll('[data-path-continue]').forEach(function (btn) {
      btn.addEventListener('click', function () { openNextUnread(btn.getAttribute('data-path-continue')); });
    });
  }

  function openNextUnread(slug) {
    var path = paths.filter(function (p) { return p.slug === slug; })[0];
    if (!path) return;
    var next = core.nextUnread(path, core.readSetFor(loadStore(), slug));
    if (!next) return; // complete or empty
    location.hash = '#/hadith/' + next.collection + '/' + next.book + '/' + next.hadith;
  }

  function init() {
    var list = document.getElementById(LIST_ID);
    if (!list) return;
    fetch(SEED_URL)
      .then(function (r) { return r.json(); })
      .then(function (data) { paths = (data && data.paths) || []; render(); })
      .catch(function () { list.innerHTML = ''; }); // silent: sidebar section simply stays empty
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.II = window.II || {};
  window.II.readingPathsDOM = { render: render, markRead: markRead };
})();
```

- [ ] **Step 2: Verify the file parses (no syntax errors)**

Run: `node --check src/js/reading-paths.js`
Expected: no output (exit 0).

- [ ] **Step 3: Commit**

```bash
git add src/js/reading-paths.js
git commit -m "feat(hadith): Module 17 DOM layer reading-paths.js — sidebar render + storage (US-H22)"
```

---

## Task 8: Deep-view reading-path strip (membership-gated)

**Files:**
- Modify: `src/js/reading-paths.js`

- [ ] **Step 1: Add strip logic to `reading-paths.js`**

Before the final `window.II.readingPathsDOM = ...` line, add:

```js
  // ── deep-view reading-path strip ──────────────────────────────────
  // Renders ONLY when the given hadith ref belongs to an active path.
  // With the deferred seed no path has members, so this never mounts —
  // built + core-tested (pathIndexOf) for the future curated data.
  function findPathContaining(id) {
    for (var i = 0; i < paths.length; i++) {
      if (core.pathIndexOf(paths[i], id) != null) return paths[i];
    }
    return null;
  }

  // ref = { collection, book, hadith }; call from the deep-view painter.
  function mountStrip(ref) {
    var slot = document.getElementById('reading-path-strip-slot');
    if (!slot) return;
    var id = core.refId(ref);
    var path = findPathContaining(id);
    if (!path) { slot.innerHTML = ''; return; } // not in any path → hidden
    var n = core.pathIndexOf(path, id);
    slot.innerHTML =
      '<div class="reading-path-strip fade-up">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>' +
        '<span>Reading: <strong>' + esc(path.name) + '</strong> · Hadith ' + n + ' of ' + path.targetCount + '</span>' +
        '<div class="path-nav-btns">' +
          '<button class="path-nav-btn" type="button" data-path-prev>← Previous</button>' +
          '<button class="path-nav-btn" type="button" data-path-next>Next →</button>' +
        '</div>' +
      '</div>';
    var prev = path.hadithRefs[n - 2];
    var next = path.hadithRefs[n];
    var prevBtn = slot.querySelector('[data-path-prev]');
    var nextBtn = slot.querySelector('[data-path-next]');
    if (prevBtn) prevBtn.addEventListener('click', function () { if (prev) location.hash = '#/hadith/' + prev.collection + '/' + prev.book + '/' + prev.hadith; });
    if (nextBtn) nextBtn.addEventListener('click', function () { if (next) location.hash = '#/hadith/' + next.collection + '/' + next.book + '/' + next.hadith; });
  }
```

Then change the export line to expose `mountStrip`:

```js
  window.II.readingPathsDOM = { render: render, markRead: markRead, mountStrip: mountStrip };
```

- [ ] **Step 2: Verify the file parses**

Run: `node --check src/js/reading-paths.js`
Expected: no output (exit 0).

- [ ] **Step 3: Commit**

```bash
git add src/js/reading-paths.js
git commit -m "feat(hadith): Module 17 deep-view reading-path strip, membership-gated (US-H22)"
```

---

## Task 9: `hadith.html` — remove fabricated markup, add containers + scripts

**Files:**
- Modify: `hadith.html` (sidebar rows ~1306–1346; strip ~1847–1855; script tags near other hadith `<script>` includes)

- [ ] **Step 1: Replace the fabricated sidebar rows**

Find the three hard-coded `.reading-path-row` blocks under `<!-- Stage 4: Reading Paths -->` (the ones with `17 of 42 read` / `40%`, `11 of 50` / `21%`, `3 of 30` / `10%` and the `Faith topics` label). Replace **all three `<div class="reading-path-row">…</div>` blocks** with a single empty container:

```html
    <!-- Stage 4: Reading Paths (US-H22) — populated by reading-paths.js -->
    <div id="reading-paths-list"></div>
```

Leave the preceding `<div class="sidebar-section-label" data-i18n="hadith.sidebar.paths">Reading Paths</div>` in place.

- [ ] **Step 2: Replace the fabricated deep-view strip**

Find the `<!-- Reading Path Strip (Stage 4 §12.6.4) -->` block (the `<div class="reading-path-strip fade-up">…Kutub al-Sittah basics · Hadith 12 of 50…</div>`). Replace the entire `<div class="reading-path-strip fade-up">…</div>` with an empty slot:

```html
    <!-- Reading Path Strip (Stage 4 §12.6.4) — mounted by reading-paths.js only if hadith ∈ active path -->
    <div id="reading-path-strip-slot"></div>
```

- [ ] **Step 3: Add the script tags**

Find where the other hadith module scripts are included (search `hadith-display-mode-core.js` script tag). Immediately after that pair of includes, add:

```html
  <script src="src/js/reading-paths-core.js"></script>
  <script src="src/js/reading-paths.js"></script>
```

Ensure `reading-paths-core.js` is listed **before** `reading-paths.js` (the DOM layer reads `window.II.readingPaths`).

- [ ] **Step 4: Add minimal CSS for the new row sub-elements**

Find the `Reading Paths sidebar section` CSS block (near `.reading-path-row {`). Add these rules right after the existing `.reading-path-row:hover` rule (all reuse existing tokens — no new colors):

```css
.reading-path-row { display:flex; align-items:center; gap:10px; }
.reading-path-meta { flex:1; min-width:0; }
.reading-path-name { font-size:12.5px; color:var(--ink-body); font-weight:500; }
.reading-path-count { font-size:10.5px; color:var(--ink-subtle); }
.path-continue { font-size:11px; background:none; border:none; cursor:pointer; color:var(--teal-700); padding:0; white-space:nowrap; }
.path-continue--soon { color:var(--ink-subtle); cursor:default; font-style:italic; }
.path-continue--done { color:var(--gold-600); cursor:default; }
.reading-path-viewall { display:block; width:100%; text-align:left; font-size:11px; background:none; border:none; cursor:pointer; color:var(--teal-700); padding:6px 0 0; }
```

If `--gold-600` is not a defined token, use `--gold-500` (verify against `docs/DESIGN-SYSTEM.md` token list before choosing).

- [ ] **Step 5: Manual browser smoke (DOM verification)**

Run: `npx serve . -p 3000` then open `http://localhost:3000/hadith.html`.
Verify:
- Sidebar "Reading Paths" shows exactly 3 rows + "View all →"; clicking it reveals the 4th ("Prophetic Character").
- Every row ring reads **0%**, count reads `0 of 42` / `0 of 50` / `0 of 30` / `0 of 25`, and the control reads muted **"Coming soon"** (no link).
- No `.reading-path-strip` appears on any hadith deep-view (open one and confirm).
- No console errors; toggle dark mode and confirm rings/labels remain legible.

Record the result (pass/fail + notes) in the commit message.

- [ ] **Step 6: Commit**

```bash
git add hadith.html
git commit -m "feat(hadith): Module 17 wire reading-paths into hadith.html; remove fabricated demo (US-H22)"
```

---

## Task 10: Docs — DATA.md + DECISIONS.md

**Files:**
- Modify: `doc/DATA.md`
- Modify: `doc/DECISIONS.md`

- [ ] **Step 1: Register the storage key in DATA.md**

Find the localStorage key registry table/section in `doc/DATA.md` (search for `islamicinfo-hadith-reading-mode` — the Module 16 key — and add a sibling row/entry):

```
islamicinfo-hadith-paths — Module 17 (US-H22) reading-path progress.
Shape: { [slug]: string[] } — per-path array of read hadith-ref ids
("collection:book:hadith"). Written by src/js/reading-paths.js via
core.mergeReadRefs (deduped). Dormant against the deferred seed (empty
hadithRefs) until curation ships.
```

Match the surrounding entry's exact formatting/columns.

- [ ] **Step 2: Add the ADR to DECISIONS.md**

Find the last ADR (search `ADR-041` — the Module 16 entry) and append the next number:

```
### ADR-042 — Module 17 reading paths ship with deferred hadithRefs (curation-deferred)

Context: US-H22 defines 4 built-in reading paths totalling 147 hadith.
Three of the four ("Kutub al-Sittah basics", "Faith foundations",
"Prophetic Character") are editorial curations (which hadith belong is a
scholarly selection judgment), and the live data has no Nawawi collection
(the 9 served collections would each need per-hadith remapping + review).

Decision: Build the full engineering (rings, strip, progress, completion)
but ship all 4 paths with `hadithRefs: []` (status "curation-pending"),
rendering an honest "Coming soon" state. No hadith reference is authored
or self-certified. Curation is a separate scholar-gated content task.
Navigation/completion logic is fully built and unit-tested against mocked
populated paths (dormant-against-live, mirroring the disputed-grade
dead-code decision).

Consequence: The DoD "every seed reference verified" is satisfied
vacuously and honestly — zero references ship. Consistent with Modules 8
& 11 (no curated data → honest unavailable).
```

- [ ] **Step 2b: Verify the ADR number**

Run: `grep -o "ADR-04[0-9]" doc/DECISIONS.md | sort -u | tail -3`
Expected: confirms the highest existing is `ADR-041`; if higher exists, bump the new ADR to the next free number and update the heading.

- [ ] **Step 3: Commit**

```bash
git add doc/DATA.md doc/DECISIONS.md
git commit -m "docs(hadith): Module 17 register storage key + ADR-042 curation-deferred (US-H22)"
```

---

## Task 11: Full regression + Stage 4 closure note

**Files:**
- (verification only; optional memory update)

- [ ] **Step 1: Run the full test suite**

Run: `cd worker && npm test`
Expected: PASS — 369 baseline + ~30 new Module-17 core tests, zero failures. Record the exact final count.

- [ ] **Step 2: Verify the seed-shape DoD one more time**

Run: `cd worker && node --test test/reading-paths-core.test.js`
Expected: PASS, including the "exactly 4 canonical paths", "no 5th Daily Sunnah", and ringGeometry 0/50/100 tests.

- [ ] **Step 3: Write the Stage 4 closure verification note**

Confirm in the final session summary (and update the Module memory if used):
- All 4 path slugs ship with `hadithRefs: []` — **no hadith reference was authored, so none required hadith-verifier verification** (curation deferred, ADR-042).
- DoD items: exactly 4 paths ✓ · ring dashoffset @0/50/100 unit-tested ✓ · every shipped ref verified (vacuous/honest) ✓ · 100% → "Path complete ✓" built + tested ✓.
- Outstanding (human sign-off, matching every prior Stage-4 module): live browser check at 1440×900, VoiceOver/NVDA on the sidebar rows + (future) strip.
- Stage 4 (US-H18–H22) is engineering-complete at the curation-deferred posture consistent with Modules 14–16.

- [ ] **Step 4: (Optional) update memory**

Write/update `hadith-module-17-state.md` + the `MEMORY.md` pointer summarizing the above.

---

## Self-Review

**Spec coverage:** reading-paths.json (Task 1) · ring math 0/50/100 (Task 2) · progress/next/index/empty (Tasks 3–4) · storage merge+dedup (Task 5) · view-model + Continue/complete states (Task 6) · sidebar first-3 + View all (Task 7) · deep-view strip membership-gated (Task 8) · de-fabricate hadith.html + CSS + scripts (Task 9) · DATA.md + ADR (Task 10) · full regression + closure note (Task 11). All design §3–§5 items mapped.

**Placeholder scan:** No TBD/TODO. The one conditional ("if `--gold-600` not defined, use `--gold-500`") is an explicit verify-against-token-list instruction, not a placeholder. ADR number carries a verify step (2b).

**Type consistency:** `refId` shape `collection:book:hadith` used identically across Tasks 3–8. `readSet` is always a `Set` of refId strings. `pathRowViewModel.continueState` values `coming-soon`/`continue`/`complete` are consistent between core (Task 6) and DOM (`continueControl`, Task 7). Storage shape `{ [slug]: string[] }` consistent across Tasks 5, 7, 10.
