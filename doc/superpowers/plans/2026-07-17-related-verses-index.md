# Related Verses Knowledge Index — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a topic-based "Related Verses" feature in the Quran reader, powered by a pre-built, hand-curated, fully-sourced static JSON index — zero AI, zero backend, client-side lookup.

**Architecture:** A shared DOM-free core module (`quran-related-core.js`) holds all pure logic: verse-key validation, source-file validation, index compilation, and runtime lookup. An operator-run ESM build script (`tools/related-verses-build.mjs`) validates a hand-authored `topics.source.json`, bakes in Saheeh International translations at build time, and emits two runtime artifacts under `src/data/related-verses/`. A thin browser wrapper (`quran-related.js`) loads those artifacts and renders a per-verse panel in `quran.html`. The build is **fail-closed**: any row missing a citation or referencing an invalid verse aborts the build, so nothing unsourced can ship.

**Tech Stack:** Vanilla JS (UMD core + browser wrapper), Node built-in test runner (`node:test`), Node ESM for the build script, static JSON data, `api.alquran.cloud` (`en.sahih` edition) for build-time translation baking.

**Spec:** `doc/superpowers/specs/2026-07-17-related-verses-index-design.md`

---

## File Structure

| File | Responsibility | New/Modify |
|---|---|---|
| `src/js/quran-related-core.js` | Pure logic: `isValidVerseKey`, `validateSource`, `compileIndex`, `topicsForVerse`, `relatedVerses`. Shared by build + runtime. | Create |
| `src/js/quran-related.js` | Browser wrapper: load JSON, wire the per-verse "Related Verses" panel. | Create |
| `tools/related-verses/topics.source.json` | Hand-authored curation source of truth (topics → verses + score + citation). | Create |
| `tools/related-verses-build.mjs` | Operator-run: validate source → bake translations → emit runtime JSON. Fail-closed. | Create |
| `src/data/related-verses/topics.json` | Generated: compiled topic → verses runtime index. | Generated |
| `src/data/related-verses/verse-index.json` | Generated: reverse map verse → topic slugs. | Generated |
| `tests/quran/related-core.test.js` | Unit tests for the core module. | Create |
| `quran.html` | Panel markup hook, CSS, and `<script>` include for the wrapper. | Modify |
| `doc/DATA.md`, `doc/API-SPEC.md`, `TASKS.md` | Document new static data files + client-direct feature. | Modify |

**Runtime data shapes** (produced by `compileIndex`, consumed by `relatedVerses`):

`topics.json`:
```json
{
  "patience": {
    "label": "Patience (Sabr)",
    "verses": [
      { "key": "2:153", "ref": "Al-Baqarah 2:153", "score": 9,
        "translation": "O you who have believed, seek help through patience and prayer…",
        "translator": "Saheeh International",
        "sourceCitation": "…verified citation…" }
    ]
  }
}
```

`verse-index.json`:
```json
{ "2:153": ["patience", "prayer"] }
```

---

## Task 1: Core module scaffold + `isValidVerseKey`

**Files:**
- Create: `src/js/quran-related-core.js`
- Test: `tests/quran/related-core.test.js`

- [ ] **Step 1: Write the failing test**

```js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const core = require('../../src/js/quran-related-core.js');

// verses_count for a few surahs, mirroring src/data/chapters.json
const AYAH_COUNTS = { 1: 7, 2: 286, 114: 6 };

test('isValidVerseKey accepts real keys, rejects malformed/out-of-range', () => {
  assert.equal(core.isValidVerseKey('2:153', AYAH_COUNTS), true);
  assert.equal(core.isValidVerseKey('1:7', AYAH_COUNTS), true);
  assert.equal(core.isValidVerseKey('114:6', AYAH_COUNTS), true);
  assert.equal(core.isValidVerseKey('2:287', AYAH_COUNTS), false); // ayah past end
  assert.equal(core.isValidVerseKey('115:1', AYAH_COUNTS), false); // no surah 115
  assert.equal(core.isValidVerseKey('2:0', AYAH_COUNTS), false);   // ayah 0
  assert.equal(core.isValidVerseKey('2-153', AYAH_COUNTS), false); // wrong separator
  assert.equal(core.isValidVerseKey('', AYAH_COUNTS), false);
  assert.equal(core.isValidVerseKey(153, AYAH_COUNTS), false);     // not a string
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/quran/related-core.test.js`
Expected: FAIL — `Cannot find module '../../src/js/quran-related-core.js'`

- [ ] **Step 3: Write minimal implementation**

```js
/* Related Verses — pure core (DOM-free, UMD). Shared by the build script and the browser. */
(function (root, factory) {
  var mod = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = mod;
  (root.II = root.II || {}).relatedCore = mod;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function isValidVerseKey(key, ayahCounts) {
    if (typeof key !== 'string') return false;
    var m = /^(\d+):(\d+)$/.exec(key);
    if (!m) return false;
    var s = +m[1], a = +m[2];
    if (s < 1 || s > 114) return false;
    var max = ayahCounts && ayahCounts[s];
    if (!max) return false;
    return a >= 1 && a <= max;
  }

  return {
    isValidVerseKey: isValidVerseKey
  };
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/quran/related-core.test.js`
Expected: PASS (1 test)

- [ ] **Step 5: Commit**

```bash
git add src/js/quran-related-core.js tests/quran/related-core.test.js
git commit -m "feat(quran): related-verses core — isValidVerseKey"
```

---

## Task 2: `validateSource` (fail-closed rules)

**Files:**
- Modify: `src/js/quran-related-core.js`
- Test: `tests/quran/related-core.test.js`

- [ ] **Step 1: Write the failing test**

Append to `tests/quran/related-core.test.js`:

```js
test('validateSource passes a clean source', () => {
  const src = {
    patience: { label: 'Patience (Sabr)', verses: [
      { key: '2:153', score: 9, sourceCitation: 'Index X, p.12' },
      { key: '1:5', score: 5, sourceCitation: 'Index X, p.12' }
    ] }
  };
  const r = core.validateSource(src, AYAH_COUNTS);
  assert.equal(r.ok, true);
  assert.deepEqual(r.errors, []);
});

test('validateSource rejects every violation with a message', () => {
  const src = {
    'Bad Slug': { label: 'x', verses: [{ key: '2:153', score: 5, sourceCitation: 'c' }] }, // bad slug
    empty: { label: 'E', verses: [] },                                                     // empty verses
    noLabel: { label: '  ', verses: [{ key: '1:1', score: 5, sourceCitation: 'c' }] },     // blank label
    scores: { label: 'S', verses: [{ key: '1:1', score: 0, sourceCitation: 'c' }] },       // score < 1
    cite: { label: 'C', verses: [{ key: '1:1', score: 5, sourceCitation: '' }] },          // missing citation
    badkey: { label: 'K', verses: [{ key: '9:999', score: 5, sourceCitation: 'c' }] },     // invalid key
    dup: { label: 'D', verses: [                                                            // duplicate key
      { key: '1:1', score: 5, sourceCitation: 'c' },
      { key: '1:1', score: 6, sourceCitation: 'c' }
    ] }
  };
  const r = core.validateSource(src, AYAH_COUNTS);
  assert.equal(r.ok, false);
  assert.ok(r.errors.some(e => /Bad Slug|kebab/.test(e)));
  assert.ok(r.errors.some(e => /empty.*non-empty|verses/i.test(e)));
  assert.ok(r.errors.some(e => /noLabel.*label/i.test(e)));
  assert.ok(r.errors.some(e => /score/i.test(e)));
  assert.ok(r.errors.some(e => /sourceCitation/i.test(e)));
  assert.ok(r.errors.some(e => /invalid verse key/i.test(e)));
  assert.ok(r.errors.some(e => /duplicate/i.test(e)));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/quran/related-core.test.js`
Expected: FAIL — `core.validateSource is not a function`

- [ ] **Step 3: Write minimal implementation**

Add inside the factory (before `return`):

```js
  function validateSource(source, ayahCounts) {
    var errors = [];
    if (!source || typeof source !== 'object' || Array.isArray(source)) {
      return { ok: false, errors: ['source must be an object keyed by topic slug'] };
    }
    Object.keys(source).forEach(function (slug) {
      var topic = source[slug];
      if (!/^[a-z0-9-]+$/.test(slug)) errors.push(slug + ': slug must be kebab-case [a-z0-9-]');
      if (!topic || typeof topic !== 'object') { errors.push(slug + ': topic must be an object'); return; }
      if (typeof topic.label !== 'string' || !topic.label.trim()) errors.push(slug + ': missing/blank label');
      if (!Array.isArray(topic.verses) || topic.verses.length === 0) {
        errors.push(slug + ': verses must be a non-empty array'); return;
      }
      var seen = {};
      topic.verses.forEach(function (v, i) {
        var at = slug + '[' + i + ']';
        if (!v || typeof v !== 'object') { errors.push(at + ': row must be an object'); return; }
        if (!isValidVerseKey(v.key, ayahCounts)) errors.push(at + ': invalid verse key ' + JSON.stringify(v.key));
        else if (seen[v.key]) errors.push(at + ': duplicate key ' + v.key + ' within topic');
        seen[v.key] = true;
        if (!Number.isInteger(v.score) || v.score < 1 || v.score > 10) errors.push(at + ': score must be an integer 1-10');
        if (typeof v.sourceCitation !== 'string' || !v.sourceCitation.trim()) errors.push(at + ': missing sourceCitation');
      });
    });
    return { ok: errors.length === 0, errors: errors };
  }
```

Add `validateSource: validateSource,` to the returned object.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/quran/related-core.test.js`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/js/quran-related-core.js tests/quran/related-core.test.js
git commit -m "feat(quran): related-verses core — validateSource (fail-closed rules)"
```

---

## Task 3: `compileIndex` (bake translations + reverse map)

**Files:**
- Modify: `src/js/quran-related-core.js`
- Test: `tests/quran/related-core.test.js`

- [ ] **Step 1: Write the failing test**

Append:

```js
test('compileIndex sorts by score desc, bakes translation + ref, builds reverse map', () => {
  const src = {
    patience: { label: 'Patience (Sabr)', verses: [
      { key: '1:5', score: 5, sourceCitation: 'c1' },
      { key: '2:153', score: 9, sourceCitation: 'c2' }
    ] },
    prayer: { label: 'Prayer (Salah)', verses: [
      { key: '2:153', score: 7, sourceCitation: 'c3' }
    ] }
  };
  const translations = {
    '1:5': { translation: 'It is You we worship…', translator: 'Saheeh International' },
    '2:153': { translation: 'seek help through patience…', translator: 'Saheeh International' }
  };
  const surahNames = { 1: 'Al-Fatihah', 2: 'Al-Baqarah' };
  const out = core.compileIndex(src, translations, surahNames);

  // sorted desc by score within a topic
  assert.deepEqual(out.topics.patience.verses.map(v => v.key), ['2:153', '1:5']);
  // baked fields
  const row = out.topics.patience.verses[0];
  assert.equal(row.ref, 'Al-Baqarah 2:153');
  assert.equal(row.translation, 'seek help through patience…');
  assert.equal(row.translator, 'Saheeh International');
  assert.equal(row.sourceCitation, 'c2');
  // reverse map: 2:153 tagged under both topics, deduped
  assert.deepEqual(out.verseIndex['2:153'].sort(), ['patience', 'prayer']);
  assert.deepEqual(out.verseIndex['1:5'], ['patience']);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/quran/related-core.test.js`
Expected: FAIL — `core.compileIndex is not a function`

- [ ] **Step 3: Write minimal implementation**

Add inside the factory:

```js
  function compileIndex(source, translations, surahNames) {
    var topics = {}, verseIndex = {};
    translations = translations || {};
    surahNames = surahNames || {};
    Object.keys(source).forEach(function (slug) {
      var t = source[slug];
      var rows = t.verses.slice().sort(function (a, b) { return b.score - a.score; }).map(function (v) {
        var tr = translations[v.key] || {};
        var s = +v.key.split(':')[0];
        return {
          key: v.key,
          ref: (surahNames[s] ? surahNames[s] + ' ' : '') + v.key,
          score: v.score,
          translation: tr.translation || '',
          translator: tr.translator || '',
          sourceCitation: v.sourceCitation
        };
      });
      topics[slug] = { label: t.label, verses: rows };
      t.verses.forEach(function (v) {
        var arr = verseIndex[v.key] = verseIndex[v.key] || [];
        if (arr.indexOf(slug) === -1) arr.push(slug);
      });
    });
    return { topics: topics, verseIndex: verseIndex };
  }
```

Add `compileIndex: compileIndex,` to the returned object.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/quran/related-core.test.js`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/js/quran-related-core.js tests/quran/related-core.test.js
git commit -m "feat(quran): related-verses core — compileIndex"
```

---

## Task 4: `topicsForVerse` + `relatedVerses` (runtime lookup)

**Files:**
- Modify: `src/js/quran-related-core.js`
- Test: `tests/quran/related-core.test.js`

- [ ] **Step 1: Write the failing test**

Append:

```js
// Minimal compiled fixtures (as compileIndex would emit)
const TOPICS = {
  patience: { label: 'Patience (Sabr)', verses: [
    { key: '2:153', ref: 'Al-Baqarah 2:153', score: 9, translation: 'A', translator: 'Saheeh International', sourceCitation: 'c' },
    { key: '3:200', ref: 'Aal-Imran 3:200', score: 8, translation: 'B', translator: 'Saheeh International', sourceCitation: 'c' },
    { key: '1:5', ref: 'Al-Fatihah 1:5', score: 4, translation: 'C', translator: 'Saheeh International', sourceCitation: 'c' }
  ] },
  prayer: { label: 'Prayer (Salah)', verses: [
    { key: '2:153', ref: 'Al-Baqarah 2:153', score: 6, translation: 'A', translator: 'Saheeh International', sourceCitation: 'c' },
    { key: '1:5', ref: 'Al-Fatihah 1:5', score: 7, translation: 'C', translator: 'Saheeh International', sourceCitation: 'c' }
  ] }
};
const VERSE_INDEX = { '2:153': ['patience', 'prayer'], '3:200': ['patience'], '1:5': ['patience', 'prayer'] };

test('topicsForVerse returns the verse slugs, or [] when untagged', () => {
  assert.deepEqual(core.topicsForVerse('2:153', VERSE_INDEX), ['patience', 'prayer']);
  assert.deepEqual(core.topicsForVerse('9:1', VERSE_INDEX), []);
});

test('relatedVerses excludes self, dedups across topics (highest score), sorts desc', () => {
  const out = core.relatedVerses('2:153', TOPICS, VERSE_INDEX, { limit: 8 });
  // self excluded; 1:5 appears in both topics → highest score (7 from prayer) kept
  assert.deepEqual(out.map(r => r.key), ['3:200', '1:5']);
  assert.equal(out.find(r => r.key === '1:5').score, 7);
});

test('relatedVerses respects limit and returns [] for untagged verse', () => {
  assert.equal(core.relatedVerses('2:153', TOPICS, VERSE_INDEX, { limit: 1 }).length, 1);
  assert.deepEqual(core.relatedVerses('9:1', TOPICS, VERSE_INDEX), []);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/quran/related-core.test.js`
Expected: FAIL — `core.topicsForVerse is not a function`

- [ ] **Step 3: Write minimal implementation**

Add inside the factory:

```js
  function topicsForVerse(verseKey, verseIndex) {
    return (verseIndex && verseIndex[verseKey]) ? verseIndex[verseKey].slice() : [];
  }

  function relatedVerses(verseKey, topics, verseIndex, opts) {
    opts = opts || {};
    var limit = opts.limit == null ? 8 : opts.limit;
    var slugs = topicsForVerse(verseKey, verseIndex);
    var best = {};
    slugs.forEach(function (slug) {
      var t = topics && topics[slug];
      if (!t || !t.verses) return;
      t.verses.forEach(function (row) {
        if (row.key === verseKey) return; // exclude the queried verse
        var cur = best[row.key];
        if (!cur || row.score > cur.score) {
          best[row.key] = {
            key: row.key, ref: row.ref, score: row.score,
            translation: row.translation, translator: row.translator,
            sourceCitation: row.sourceCitation, topic: t.label, topicSlug: slug
          };
        }
      });
    });
    var list = Object.keys(best).map(function (k) { return best[k]; });
    list.sort(function (a, b) {
      return (b.score - a.score) || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0);
    });
    return list.slice(0, limit);
  }
```

Add `topicsForVerse: topicsForVerse,` and `relatedVerses: relatedVerses` to the returned object.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/quran/related-core.test.js`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add src/js/quran-related-core.js tests/quran/related-core.test.js
git commit -m "feat(quran): related-verses core — topicsForVerse + relatedVerses lookup"
```

---

## Task 5: Build script (`tools/related-verses-build.mjs`)

Operator-run script that turns the curation source into shipped JSON. Reuses the core for validation + compilation (DRY), loads `chapters.json` for ayah counts + surah names, and bakes Saheeh International translations from `api.alquran.cloud`. **Fail-closed:** aborts on any validation error.

**Files:**
- Create: `tools/related-verses-build.mjs`
- Uses (read-only): `src/data/chapters.json`, `src/js/quran-related-core.js`

- [ ] **Step 1: Write the build script**

```js
#!/usr/bin/env node
/* Related Verses — build CLI (operator-run).
   Usage: node tools/related-verses-build.mjs [--in tools/related-verses/topics.source.json]
   Validates the curation source (fail-closed), bakes Saheeh Int'l translations,
   and emits src/data/related-verses/topics.json + verse-index.json. */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const core = require('../src/js/quran-related-core.js');

function arg(name, def) { const i = process.argv.indexOf('--' + name); return (i !== -1 && process.argv[i + 1]) ? process.argv[i + 1] : def; }

const inFile = arg('in', 'tools/related-verses/topics.source.json');
const OUT_DIR = 'src/data/related-verses';
const TRANSLATOR = 'Saheeh International';

// 1. Load source + chapters
let source;
try { source = JSON.parse(fs.readFileSync(inFile, 'utf8')); }
catch (e) { console.error('Cannot read/parse ' + inFile + ': ' + e.message); process.exit(1); }

const chapters = JSON.parse(fs.readFileSync('src/data/chapters.json', 'utf8'));
const chapterList = Array.isArray(chapters) ? chapters : (chapters.chapters || chapters.data || []);
const ayahCounts = {}, surahNames = {};
chapterList.forEach(function (c) { ayahCounts[c.id] = c.verses_count; surahNames[c.id] = c.name_simple; });

// 2. Validate — fail closed
const v = core.validateSource(source, ayahCounts);
if (!v.ok) {
  console.error('❌ Source validation failed (' + v.errors.length + ' error(s)):');
  v.errors.forEach(function (e) { console.error('  - ' + e); });
  process.exit(1);
}

// 3. Bake translations for each unique key
const keys = [];
Object.keys(source).forEach(function (slug) {
  source[slug].verses.forEach(function (row) { if (keys.indexOf(row.key) === -1) keys.push(row.key); });
});

async function fetchTranslation(key) {
  const url = 'https://api.alquran.cloud/v1/ayah/' + key + '/en.sahih';
  const res = await fetch(url, { headers: { 'User-Agent': 'IslamicInfo.org build (hello@islamicinfo.org)' } });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const data = await res.json();
  const text = data && data.data && data.data.text;
  if (!text) throw new Error('unexpected upstream shape');
  return String(text).trim();
}

const translations = {};
for (const key of keys) {
  try {
    translations[key] = { translation: await fetchTranslation(key), translator: TRANSLATOR };
    console.log('  ✓ ' + key);
  } catch (e) {
    console.error('❌ Could not fetch translation for ' + key + ': ' + e.message);
    process.exit(1); // fail closed — never ship a row without its baked translation
  }
  await new Promise(function (r) { setTimeout(r, 120); }); // gentle throttle
}

// 4. Compile + write
const out = core.compileIndex(source, translations, surahNames);
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, 'topics.json'), JSON.stringify(out.topics, null, 2) + '\n');
fs.writeFileSync(path.join(OUT_DIR, 'verse-index.json'), JSON.stringify(out.verseIndex, null, 2) + '\n');
console.log('✅ Wrote ' + Object.keys(out.topics).length + ' topics, ' + Object.keys(out.verseIndex).length + ' verses to ' + OUT_DIR);
```

- [ ] **Step 2: Verify it fails closed on a missing source file**

Run: `node tools/related-verses-build.mjs --in tools/related-verses/does-not-exist.json`
Expected: prints `Cannot read/parse …` and exits non-zero. (Full run happens in Task 6 once the source exists.)

- [ ] **Step 3: Commit**

```bash
git add tools/related-verses-build.mjs
git commit -m "feat(quran): related-verses build script (validate + bake + emit, fail-closed)"
```

---

## Task 6: Author the starter curation set + generate the index

The curation content is **human scholarship**, not code. Author a real starter set of ~25–40 well-known topics. **Every `sourceCitation` must be a real, verifiable reference** (a named thematic index, a tafsir, or a classical source) — per the project invariant *"never invent citations."* Do NOT fabricate citations to satisfy the validator; if a verse's topic association can't be sourced, leave it out.

**Files:**
- Create: `tools/related-verses/topics.source.json`
- Generates: `src/data/related-verses/topics.json`, `src/data/related-verses/verse-index.json`

- [ ] **Step 1: Create the source file with the documented shape**

Start from this structure (expand to the full starter set during execution; the two topics below show the exact required shape — replace the citation text with your verified references):

```json
{
  "patience": {
    "label": "Patience (Sabr)",
    "verses": [
      { "key": "2:153", "score": 9, "sourceCitation": "REPLACE WITH VERIFIED CITATION" },
      { "key": "3:200", "score": 8, "sourceCitation": "REPLACE WITH VERIFIED CITATION" },
      { "key": "103:3", "score": 8, "sourceCitation": "REPLACE WITH VERIFIED CITATION" }
    ]
  },
  "gratitude": {
    "label": "Gratitude (Shukr)",
    "verses": [
      { "key": "14:7", "score": 9, "sourceCitation": "REPLACE WITH VERIFIED CITATION" },
      { "key": "2:152", "score": 8, "sourceCitation": "REPLACE WITH VERIFIED CITATION" }
    ]
  }
}
```

**Authoring rules (enforced by the build):** kebab-case slug; non-blank `label`; `score` integer 1–10; every row has a real `sourceCitation`; no duplicate key within a topic; every key valid for its surah's ayah count.

- [ ] **Step 2: Run the build**

Run: `node tools/related-verses-build.mjs`
Expected: a `✓ {key}` line per verse, then `✅ Wrote N topics, M verses to src/data/related-verses`. If validation fails, the script lists each error and exits non-zero — fix the source and re-run.

- [ ] **Step 3: Sanity-check the generated data integrity**

Run:
```bash
node -e "const t=require('./src/data/related-verses/topics.json'); const vi=require('./src/data/related-verses/verse-index.json'); const inT={}; Object.values(t).forEach(o=>o.verses.forEach(v=>inT[v.key]=1)); const keysT=Object.keys(inT).sort(); const keysVI=Object.keys(vi).sort(); const a=JSON.stringify(keysT), b=JSON.stringify(keysVI); console.log('topics keys == verse-index keys:', a===b); if(a!==b) process.exit(1); Object.values(t).forEach(o=>o.verses.forEach(v=>{if(!v.translation||!v.sourceCitation){console.error('missing baked field on '+v.key);process.exit(1);}})); console.log('all rows have translation + citation: OK');"
```
Expected: both lines print `OK`/`true` and exit 0.

- [ ] **Step 4: Commit**

```bash
git add tools/related-verses/topics.source.json src/data/related-verses/topics.json src/data/related-verses/verse-index.json
git commit -m "feat(quran): related-verses starter curation set + generated index"
```

---

## Task 7: Browser wrapper + `quran.html` panel

Thin wrapper: load the two JSON files once, expose a per-verse "Related Verses" panel that renders `relatedVerses()` output. Mirror the existing `quran-tafsir.js` wrapper style (module tracks the active `verseKey`, renders into a panel, degrades to an empty state).

**Files:**
- Create: `src/js/quran-related.js`
- Modify: `quran.html` (CSS block, panel markup hook near the per-verse tool row, `<script>` include)

- [ ] **Step 1: Write the wrapper**

```js
/* Related Verses — browser wrapper. Loads the pre-built static index and renders
   a per-verse panel. Zero AI, zero backend, one-time JSON load. */
(function () {
  'use strict';
  var core = (window.II && window.II.relatedCore);
  var TOPICS_URL = 'src/data/related-verses/topics.json';
  var VERSE_INDEX_URL = 'src/data/related-verses/verse-index.json';

  var state = { topics: null, verseIndex: null, loaded: false, loading: null };

  function loadIndex() {
    if (state.loaded) return Promise.resolve();
    if (state.loading) return state.loading;
    state.loading = Promise.all([
      fetch(TOPICS_URL).then(function (r) { return r.json(); }),
      fetch(VERSE_INDEX_URL).then(function (r) { return r.json(); })
    ]).then(function (res) {
      state.topics = res[0]; state.verseIndex = res[1]; state.loaded = true;
    });
    return state.loading;
  }

  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }

  function render(panel, verseKey) {
    panel.innerHTML = '';
    var rows = core.relatedVerses(verseKey, state.topics, state.verseIndex, { limit: 8 });
    if (!rows.length) {
      panel.appendChild(el('p', 'rv-empty', 'No related verses indexed yet.'));
      return;
    }
    rows.forEach(function (r) {
      var row = el('a', 'rv-row');
      row.href = '#' + r.key;
      row.setAttribute('data-verse', r.key);
      row.appendChild(el('span', 'rv-ref', r.ref));
      row.appendChild(el('span', 'rv-chip', r.topic));
      row.appendChild(el('p', 'rv-text', r.translation));
      row.appendChild(el('span', 'rv-attr', r.translator + ' · ' + r.sourceCitation));
      panel.appendChild(row);
    });
  }

  // Public entry: called by the verse UI when the user opens the panel for a verse.
  window.IIRelated = {
    open: function (panel, verseKey) {
      loadIndex().then(function () { render(panel, verseKey); })
        .catch(function () { panel.innerHTML = ''; panel.appendChild(el('p', 'rv-empty', 'Related verses unavailable.')); });
    }
  };
})();
```

- [ ] **Step 2: Add the CSS block to `quran.html`**

Place next to the existing `.ai-card` / tafsir styles (search for `.ai-card{` and add after that rule). Use existing design tokens — no raw new hex beyond the same rgba brand values already used by `.ai-card`:

```html
<style>
.rv-panel{display:none;margin-top:14px;padding:14px 16px;background:rgba(0,105,110,.03);border:.5px solid rgba(197,160,89,.25);border-radius:14px;}
.rv-panel.show{display:block;animation:slideUp .35s var(--ease-reverent) both;}
.rv-row{display:block;padding:10px 0;border-bottom:.5px solid rgba(197,160,89,.18);text-decoration:none;color:inherit;}
.rv-row:last-child{border-bottom:0;}
.rv-ref{font-weight:600;}
.rv-chip{margin-inline-start:8px;font-size:.72rem;padding:2px 8px;border-radius:999px;background:rgba(197,160,89,.14);}
.rv-text{margin:4px 0 2px;opacity:.9;}
.rv-attr{font-size:.72rem;opacity:.6;}
.rv-empty{opacity:.6;margin:6px 0;}
</style>
```

- [ ] **Step 3: Add the entry point + panel hook + script include to `quran.html`**

In the per-verse tool row (peer to the existing Tafsir / AI-card trigger), add a trigger button and an empty panel container. Wire the trigger to toggle the panel and call `IIRelated.open`. Add this near the other verse-tool buttons (adapt the selector to match the existing tool-row markup):

```html
<button type="button" class="v-tool rv-trigger" aria-expanded="false">Related Verses</button>
<div class="rv-panel" role="region" aria-label="Related verses"></div>
```

And near the bottom `<script>` includes (after `quran-related-core.js`):

```html
<script src="src/js/quran-related-core.js"></script>
<script src="src/js/quran-related.js"></script>
<script>
document.addEventListener('click', function (e) {
  var btn = e.target.closest && e.target.closest('.rv-trigger');
  if (!btn) return;
  var panel = btn.parentElement.querySelector('.rv-panel');
  var verseKey = btn.closest('[data-verse-key]') && btn.closest('[data-verse-key]').getAttribute('data-verse-key');
  var open = panel.classList.toggle('show');
  btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  if (open && verseKey) window.IIRelated.open(panel, verseKey);
});
</script>
```

> Note for the implementer: confirm the actual per-verse container attribute that carries the verse key (grep `quran.html` / `quran-verses-core.js` for how tafsir resolves its `verseKey`) and match it in the `closest('[data-verse-key]')` selector above before wiring.

- [ ] **Step 4: Manually verify in the browser**

Run: `python -m http.server 8000` (or the project's usual static server), open `http://localhost:8000/quran.html`, navigate to Surah Al-Baqarah, open verse 2:153, click **Related Verses**.
Expected: the panel lists other patience verses (e.g. 3:200) with a topic chip, translation snippet, and a `Saheeh International · {citation}` line; clicking a row navigates to that verse. Open an untagged verse → panel shows *"No related verses indexed yet."*

- [ ] **Step 5: Commit**

```bash
git add src/js/quran-related.js quran.html
git commit -m "feat(quran): Related Verses per-verse panel in the reader"
```

---

## Task 8: Docs + final verification

**Files:**
- Modify: `doc/DATA.md`, `doc/API-SPEC.md`, `TASKS.md`

- [ ] **Step 1: Document the new static data + client-direct feature**

- In `doc/DATA.md`: add `src/data/related-verses/topics.json` and `verse-index.json` to the data-file registry, noting they are **generated** by `tools/related-verses-build.mjs` from `tools/related-verses/topics.source.json` (do not hand-edit the generated files).
- In `doc/API-SPEC.md`: under the "client-direct, keyless" section, add a short note that Related Verses is served from static JSON (no `/api/` route in this slice; `/api/index/*` is deferred to the D1/Hadith cycle).
- In `TASKS.md`: move Related Verses to done; add the deferred-ledger items (Related Hadith, Vocabulary, D1 adoption, `/api/index/*`, AI blurb, admin UI, tag-coverage scale-up) to the backlog.

- [ ] **Step 2: Run the full core test suite**

Run: `node --test tests/quran/related-core.test.js`
Expected: PASS (6 tests, 0 failures).

- [ ] **Step 3: Re-run the data-integrity sanity check (Task 6 Step 3)**

Expected: prints `true` / `OK`, exits 0.

- [ ] **Step 4: Commit**

```bash
git add doc/DATA.md doc/API-SPEC.md TASKS.md
git commit -m "docs(quran): register Related Verses data files + update task board"
```

---

## Deferred-work ledger (to finish the full 3-feature set)

Carried from the spec — surface these when this slice completes:

- ⏳ **Related Hadith** — corpus import + topic tags; grade+gradedBy, hadith-verifier skill, human-review gate, un-501 `/api/hadith`.
- ⏳ **Vocabulary** — terms + cross-references into verses & hadith; FTS lookup.
- ⏳ **Adopt D1 + FTS5** for the corpus (introduced with Hadith).
- ⏳ **`/api/index/*` worker routes** (introduced with D1).
- ⏳ **AI connecting-explanation blurb** (reuses `/api/ask-claude` guardrails + human-review gate).
- ⏳ **Web-based admin bulk-review UI**.
- ⏳ **Scale tag coverage** via external thematic index / staged suggestions.
