# Related Hadith Knowledge Index — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a topic-based "Related Hadith" panel in the Quran reader, powered by a pre-built, hand-curated, verifier-gated static JSON index that reuses the Related Verses taxonomy — with every authenticity rule enforced by a fail-closed build and production held behind a `reviewed` flag.

**Architecture:** A shared DOM-free core (`quran-related-hadith-core.js`) holds pure logic: fail-closed source validation (Sahih/Hasan-only, grade+gradedBy+isnad required, taxonomy consistency), index compilation (emit only `reviewed:true`, report pending count), and runtime lookup. An operator-run ESM build (`tools/related-hadith-build.mjs`) validates a hand-authored `topics.source.json` against the slice-1 taxonomy and emits `src/data/related-hadith/topics.json`. A thin browser wrapper (`quran-related-hadith.js`) renders a per-verse panel beside "Related Verses". It reuses `src/data/related-verses/verse-index.json` unchanged — a verse's topics drive both panels.

**Tech Stack:** Vanilla JS (UMD core + browser wrapper), Node built-in test runner (`node:test`), Node ESM build script, static JSON. hadithapi.com is the curation-time source; the hadith-verifier skill gates every entry. No API key in the build (text is authored + verified).

**Spec:** `doc/superpowers/specs/2026-07-17-related-hadith-index-design.md`
**Predecessor (patterns to mirror):** `src/js/quran-related-core.js`, `src/js/quran-related.js`, `tools/related-verses-build.mjs`, `tests/quran/related-core.test.js`.

---

## File Structure

| File | Responsibility | New/Modify |
|---|---|---|
| `src/js/quran-related-hadith-core.js` | Pure: `validateSource`, `compileIndex`, `relatedHadith` + constants. Shared by build + runtime. | Create |
| `src/js/quran-related-hadith.js` | Browser wrapper: load JSON, render per-verse panel with expand. | Create |
| `tools/related-hadith/topics.source.json` | Hand-authored, verifier-confirmed curation source (all entries, `reviewed` flag). | Create |
| `tools/related-hadith-build.mjs` | Operator-run: validate (fail-closed) against taxonomy → emit only `reviewed:true`. | Create |
| `src/data/related-hadith/topics.json` | Generated: topic slug → reviewed hadith rows. | Generated |
| `tests/quran/related-hadith-core.test.js` | Unit tests. | Create |
| `quran.html` | Panel CSS, script includes. | Modify |
| `src/js/quran-verses.js` | Footer "Related Hadith" button + panel container in `buildCard`. | Modify |
| `doc/DATA.md`, `doc/API-SPEC.md`, `doc/TASKS.md` | Register data files + feature. | Modify |

**Reused unchanged:** `src/data/related-verses/verse-index.json` (verse → topic slugs), `src/data/related-verses/topics.json` (source of the shared taxonomy `{slug: label}`).

**Generated row shape** (`topics.json`), consumed by `relatedHadith`:
```json
{
  "patience": {
    "label": "Patience (Sabr)",
    "hadith": [
      { "collection": "Sahih al-Bukhari", "number": 1469, "ref": "Sahih al-Bukhari 1469",
        "book": "Book of Patience", "arabic": "…", "english": "…", "narrator": "Abu Sa'id al-Khudri",
        "isnadSummary": "…", "grade": "Sahih", "gradedBy": "Al-Bukhari",
        "url": "https://…", "score": 9 }
    ]
  }
}
```

---

## Task 1: Core — constants + `validateSource` (fail-closed)

**Files:**
- Create: `src/js/quran-related-hadith-core.js`
- Test: `tests/quran/related-hadith-core.test.js`

- [ ] **Step 1: Write the failing test**

```js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const core = require('../../src/js/quran-related-hadith-core.js');

// Shared taxonomy = { slug: label } derived from related-verses/topics.json
const TAX = { patience: 'Patience (Sabr)', gratitude: 'Gratitude (Shukr)' };

function goodRow(over) {
  return Object.assign({
    collection: 'Sahih al-Bukhari', number: 1469, book: 'Book of Patience',
    arabic: 'ARABIC', english: 'ENGLISH', narrator: 'Abu Sa\'id al-Khudri',
    isnadSummary: 'A -> B -> Prophet', grade: 'Sahih', gradedBy: 'Al-Bukhari',
    url: 'https://hadithapi.com/x', score: 9, reviewed: false
  }, over || {});
}

test('validateSource passes a clean source', () => {
  const src = { patience: { label: 'Patience (Sabr)', hadith: [goodRow()] } };
  const r = core.validateSource(src, TAX);
  assert.equal(r.ok, true);
  assert.deepEqual(r.errors, []);
});

test('validateSource enforces every fail-closed rule', () => {
  const src = {
    'Bad Slug': { label: 'x', hadith: [goodRow()] },                                  // bad slug + not in taxonomy
    unknownslug: { label: 'Unknown', hadith: [goodRow()] },                           // slug not in taxonomy
    patience: { label: 'WRONG LABEL', hadith: [goodRow()] },                          // label mismatch vs taxonomy
    gratitude: { label: 'Gratitude (Shukr)', hadith: [
      goodRow({ grade: 'Da\'eef' }),                                                   // grade not whitelisted
      goodRow({ number: 2, gradedBy: '' }),                                           // blank gradedBy
      goodRow({ number: 3, isnadSummary: '  ' }),                                     // blank isnad
      goodRow({ number: 4, collection: 'Random Book' }),                              // collection not allowed
      goodRow({ number: 5, url: 'http://x' }),                                        // non-https url
      goodRow({ number: 6, score: 0 }),                                              // score out of range
      goodRow({ number: 7, reviewed: 'yes' }),                                        // reviewed not boolean
      goodRow({ number: 8, english: '' }),                                            // blank english
      goodRow({ number: 1469 }), goodRow({ number: 1469 })                            // duplicate (collection,number)
    ] }
  };
  const r = core.validateSource(src, TAX);
  assert.equal(r.ok, false);
  assert.ok(r.errors.some(e => /kebab/.test(e)));
  assert.ok(r.errors.some(e => /not in .*taxonomy/i.test(e)));
  assert.ok(r.errors.some(e => /label.*!=|!= taxonomy/i.test(e)));
  assert.ok(r.errors.some(e => /grade must be Sahih or Hasan/i.test(e)));
  assert.ok(r.errors.some(e => /gradedBy/i.test(e)));
  assert.ok(r.errors.some(e => /isnadSummary/i.test(e)));
  assert.ok(r.errors.some(e => /collection not in allowed/i.test(e)));
  assert.ok(r.errors.some(e => /url must be an https/i.test(e)));
  assert.ok(r.errors.some(e => /score/i.test(e)));
  assert.ok(r.errors.some(e => /reviewed must be a boolean/i.test(e)));
  assert.ok(r.errors.some(e => /missing\/blank english/i.test(e)));
  assert.ok(r.errors.some(e => /duplicate/i.test(e)));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/quran/related-hadith-core.test.js`
Expected: FAIL — `Cannot find module '../../src/js/quran-related-hadith-core.js'`

- [ ] **Step 3: Write minimal implementation**

```js
/* Related Hadith — pure core (DOM-free, UMD). Shared by the build script and the browser. */
(function (root, factory) {
  var mod = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = mod;
  (root.II = root.II || {}).relatedHadithCore = mod;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ALLOWED_COLLECTIONS = ['Sahih al-Bukhari', 'Sahih Muslim', "Jami' at-Tirmidhi",
    'Sunan Abu Dawud', 'Sunan Ibn Majah', "Sunan an-Nasa'i", 'Mishkat al-Masabih',
    'Musnad Ahmad', 'Al-Silsila as-Sahiha'];
  var ALLOWED_GRADES = ['Sahih', 'Hasan'];

  function validateSource(source, taxonomy) {
    var errors = [];
    if (!source || typeof source !== 'object' || Array.isArray(source)) {
      return { ok: false, errors: ['source must be an object keyed by topic slug'] };
    }
    taxonomy = taxonomy || {};
    Object.keys(source).forEach(function (slug) {
      var topic = source[slug];
      if (!/^[a-z0-9-]+$/.test(slug)) errors.push(slug + ': slug must be kebab-case [a-z0-9-]');
      if (!topic || typeof topic !== 'object') { errors.push(slug + ': topic must be an object'); return; }
      if (typeof topic.label !== 'string' || !topic.label.trim()) errors.push(slug + ': missing/blank label');
      if (!(slug in taxonomy)) errors.push(slug + ': slug not in shared verses taxonomy');
      else if (topic.label !== taxonomy[slug]) errors.push(slug + ': label "' + topic.label + '" != taxonomy label "' + taxonomy[slug] + '"');
      if (!Array.isArray(topic.hadith) || topic.hadith.length === 0) { errors.push(slug + ': hadith must be a non-empty array'); return; }
      var seen = {};
      topic.hadith.forEach(function (h, i) {
        var at = slug + '[' + i + ']';
        if (!h || typeof h !== 'object') { errors.push(at + ': row must be an object'); return; }
        if (ALLOWED_COLLECTIONS.indexOf(h.collection) === -1) errors.push(at + ': collection not in allowed list: ' + JSON.stringify(h.collection));
        if (!Number.isInteger(h.number) || h.number < 1) errors.push(at + ': number must be a positive integer');
        else {
          var dk = h.collection + '|' + h.number;
          if (seen[dk]) errors.push(at + ': duplicate ' + dk + ' within topic');
          seen[dk] = true;
        }
        ['arabic', 'english', 'narrator', 'isnadSummary', 'gradedBy'].forEach(function (f) {
          if (typeof h[f] !== 'string' || !h[f].trim()) errors.push(at + ': missing/blank ' + f);
        });
        if (ALLOWED_GRADES.indexOf(h.grade) === -1) errors.push(at + ': grade must be Sahih or Hasan (got ' + JSON.stringify(h.grade) + ')');
        if (typeof h.url !== 'string' || !/^https:\/\//.test(h.url)) errors.push(at + ': url must be an https link');
        if (!Number.isInteger(h.score) || h.score < 1 || h.score > 10) errors.push(at + ': score must be an integer 1-10');
        if (typeof h.reviewed !== 'boolean') errors.push(at + ': reviewed must be a boolean');
      });
    });
    return { ok: errors.length === 0, errors: errors };
  }

  return {
    ALLOWED_COLLECTIONS: ALLOWED_COLLECTIONS,
    ALLOWED_GRADES: ALLOWED_GRADES,
    validateSource: validateSource
  };
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/quran/related-hadith-core.test.js`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/js/quran-related-hadith-core.js tests/quran/related-hadith-core.test.js
git commit -m "feat(hadith): related-hadith core — validateSource (fail-closed authenticity gate)"
```

---

## Task 2: Core — `compileIndex` (reviewed filter + pending count)

**Files:**
- Modify: `src/js/quran-related-hadith-core.js`
- Test: `tests/quran/related-hadith-core.test.js`

- [ ] **Step 1: Write the failing test**

Append (reuses `goodRow`/`TAX` from Task 1):

```js
test('compileIndex emits only reviewed:true, strips flag, composes ref, sorts, counts pending', () => {
  const src = {
    patience: { label: 'Patience (Sabr)', hadith: [
      goodRow({ number: 100, score: 5, reviewed: true }),
      goodRow({ number: 200, score: 9, reviewed: true }),
      goodRow({ number: 300, score: 8, reviewed: false })   // pending — must not ship
    ] },
    gratitude: { label: 'Gratitude (Shukr)', hadith: [
      goodRow({ number: 400, reviewed: false })             // all pending → topic omitted
    ] }
  };
  const out = core.compileIndex(src, TAX);
  // gratitude omitted (no reviewed rows)
  assert.deepEqual(Object.keys(out.topics), ['patience']);
  // sorted desc by score; pending 300 excluded
  assert.deepEqual(out.topics.patience.hadith.map(h => h.number), [200, 100]);
  const row = out.topics.patience.hadith[0];
  assert.equal(row.ref, 'Sahih al-Bukhari 200');
  assert.equal('reviewed' in row, false);          // flag stripped
  assert.equal(row.grade, 'Sahih');
  assert.equal(out.pendingCount, 2);               // 300 + 400
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/quran/related-hadith-core.test.js`
Expected: FAIL — `core.compileIndex is not a function`

- [ ] **Step 3: Write minimal implementation**

Add inside the factory:

```js
  function compileIndex(source, taxonomy) {
    var topics = {}, pendingCount = 0;
    Object.keys(source).forEach(function (slug) {
      var t = source[slug];
      var reviewed = [];
      t.hadith.forEach(function (h) {
        if (h.reviewed === true) reviewed.push(h); else pendingCount++;
      });
      if (!reviewed.length) return;
      var rows = reviewed.slice().sort(function (a, b) {
        return (b.score - a.score) ||
          ((a.collection + a.number) < (b.collection + b.number) ? -1 : 1);
      }).map(function (h) {
        return {
          collection: h.collection, number: h.number, ref: h.collection + ' ' + h.number,
          book: h.book || '', arabic: h.arabic, english: h.english, narrator: h.narrator,
          isnadSummary: h.isnadSummary, grade: h.grade, gradedBy: h.gradedBy,
          url: h.url, score: h.score
        };
      });
      topics[slug] = { label: t.label, hadith: rows };
    });
    return { topics: topics, pendingCount: pendingCount };
  }
```

Add `compileIndex: compileIndex,` to the returned object.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/quran/related-hadith-core.test.js`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/js/quran-related-hadith-core.js tests/quran/related-hadith-core.test.js
git commit -m "feat(hadith): related-hadith core — compileIndex (reviewed-only + pending count)"
```

---

## Task 3: Core — `relatedHadith` (runtime lookup)

**Files:**
- Modify: `src/js/quran-related-hadith-core.js`
- Test: `tests/quran/related-hadith-core.test.js`

- [ ] **Step 1: Write the failing test**

Append:

```js
// Compiled fixtures (shape compileIndex emits)
const HTOPICS = {
  patience: { label: 'Patience (Sabr)', hadith: [
    { collection: 'Sahih al-Bukhari', number: 1469, ref: 'Sahih al-Bukhari 1469', book: '', arabic: 'A', english: 'EN-A', narrator: 'N1', isnadSummary: 'i', grade: 'Sahih', gradedBy: 'Al-Bukhari', url: 'https://x', score: 9 },
    { collection: 'Sahih Muslim', number: 55, ref: 'Sahih Muslim 55', book: '', arabic: 'B', english: 'EN-B', narrator: 'N2', isnadSummary: 'i', grade: 'Hasan', gradedBy: 'al-Albani', url: 'https://x', score: 4 }
  ] },
  gratitude: { label: 'Gratitude (Shukr)', hadith: [
    { collection: 'Sahih al-Bukhari', number: 1469, ref: 'Sahih al-Bukhari 1469', book: '', arabic: 'A', english: 'EN-A', narrator: 'N1', isnadSummary: 'i', grade: 'Sahih', gradedBy: 'Al-Bukhari', url: 'https://x', score: 6 }
  ] }
};
const VINDEX = { '2:153': ['patience', 'gratitude'], '14:7': ['gratitude'] };

test('relatedHadith gathers across a verse\'s topics, dedups by collection+number (highest score), sorts, caps', () => {
  const out = core.relatedHadith('2:153', HTOPICS, VINDEX, { limit: 5 });
  // Bukhari 1469 appears under both topics → kept once at highest score (9)
  assert.deepEqual(out.map(h => h.ref), ['Sahih al-Bukhari 1469', 'Sahih Muslim 55']);
  assert.equal(out[0].score, 9);
  assert.equal(out[0].topic, 'Patience (Sabr)');
  assert.equal(core.relatedHadith('2:153', HTOPICS, VINDEX, { limit: 1 }).length, 1);
});

test('relatedHadith returns [] for an untagged verse', () => {
  assert.deepEqual(core.relatedHadith('9:1', HTOPICS, VINDEX), []);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/quran/related-hadith-core.test.js`
Expected: FAIL — `core.relatedHadith is not a function`

- [ ] **Step 3: Write minimal implementation**

Add inside the factory:

```js
  function relatedHadith(verseKey, hadithTopics, verseIndex, opts) {
    opts = opts || {};
    var limit = opts.limit == null ? 5 : opts.limit;
    var slugs = (verseIndex && verseIndex[verseKey]) ? verseIndex[verseKey] : [];
    var best = {};
    slugs.forEach(function (slug) {
      var t = hadithTopics && hadithTopics[slug];
      if (!t || !t.hadith) return;
      t.hadith.forEach(function (h) {
        var k = h.collection + '|' + h.number;
        var cur = best[k];
        if (!cur || h.score > cur.score) {
          best[k] = {
            collection: h.collection, number: h.number, ref: h.ref, book: h.book,
            arabic: h.arabic, english: h.english, narrator: h.narrator,
            isnadSummary: h.isnadSummary, grade: h.grade, gradedBy: h.gradedBy,
            url: h.url, score: h.score, topic: t.label, topicSlug: slug
          };
        }
      });
    });
    var list = Object.keys(best).map(function (k) { return best[k]; });
    list.sort(function (a, b) {
      return (b.score - a.score) ||
        ((a.collection + a.number) < (b.collection + b.number) ? -1 : (a.collection + a.number) > (b.collection + b.number) ? 1 : 0);
    });
    return list.slice(0, limit);
  }
```

Add `relatedHadith: relatedHadith` to the returned object.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/quran/related-hadith-core.test.js`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/js/quran-related-hadith-core.js tests/quran/related-hadith-core.test.js
git commit -m "feat(hadith): related-hadith core — relatedHadith lookup"
```

---

## Task 4: Build script (`tools/related-hadith-build.mjs`)

Operator-run: loads the shared taxonomy from slice 1, validates the curation source fail-closed, emits only `reviewed:true` rows, and logs the pending count.

**Files:**
- Create: `tools/related-hadith-build.mjs`
- Uses (read-only): `src/data/related-verses/topics.json`, `src/js/quran-related-hadith-core.js`

- [ ] **Step 1: Write the build script**

```js
#!/usr/bin/env node
/* Related Hadith — build CLI (operator-run).
   Usage: node tools/related-hadith-build.mjs [--in tools/related-hadith/topics.source.json]
   Validates the curation source against the slice-1 taxonomy (fail-closed) and emits ONLY
   reviewed:true rows to src/data/related-hadith/topics.json. Logs pending (reviewed:false) count. */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const core = require('../src/js/quran-related-hadith-core.js');

function arg(name, def) { const i = process.argv.indexOf('--' + name); return (i !== -1 && process.argv[i + 1]) ? process.argv[i + 1] : def; }

const inFile = arg('in', 'tools/related-hadith/topics.source.json');
const OUT_DIR = 'src/data/related-hadith';

let source;
try { source = JSON.parse(fs.readFileSync(inFile, 'utf8')); }
catch (e) { console.error('Cannot read/parse ' + inFile + ': ' + e.message); process.exit(1); }

// Shared taxonomy { slug: label } from slice 1 — build fails if hadith drift from it.
const versesTopics = JSON.parse(fs.readFileSync('src/data/related-verses/topics.json', 'utf8'));
const taxonomy = {};
Object.keys(versesTopics).forEach(function (slug) { taxonomy[slug] = versesTopics[slug].label; });

const v = core.validateSource(source, taxonomy);
if (!v.ok) {
  console.error('❌ Source validation failed (' + v.errors.length + ' error(s)):');
  v.errors.forEach(function (e) { console.error('  - ' + e); });
  process.exit(1);
}

const out = core.compileIndex(source, taxonomy);
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, 'topics.json'), JSON.stringify(out.topics, null, 2) + '\n');
console.log('✅ Wrote ' + Object.keys(out.topics).length + ' topic(s) of reviewed hadith to ' + OUT_DIR);
console.log('ℹ ' + out.pendingCount + ' hadith held back pending 🕌 review (reviewed:false).');
```

- [ ] **Step 2: Verify it fails closed on a missing source file**

Run: `node tools/related-hadith-build.mjs --in tools/related-hadith/nope.json`
Expected: prints `Cannot read/parse …` and exits non-zero. (Full run happens in Task 5 once the source exists.)

- [ ] **Step 3: Commit**

```bash
git add tools/related-hadith-build.mjs
git commit -m "feat(hadith): related-hadith build script (validate vs taxonomy + reviewed filter, fail-closed)"
```

---

## Task 5: Curation source (verifier-gated) + generate the staged index

This is **hadith scholarship**, not code. Author `tools/related-hadith/topics.source.json` with a small set of well-known hadith, each **confirmed via the hadith-verifier skill** before writing. **Anti-hallucination is absolute: never invent Arabic, isnad, narrator, number, or grade — verify each against ≥2 trusted sources (sunnah.com / ihadis.com / islamqa.info) via the skill.** All entries start `reviewed: false`, so the generated index ships **empty** — production go-live is the operator's 🕌 sign-off.

**Files:**
- Create: `tools/related-hadith/topics.source.json`
- Generates: `src/data/related-hadith/topics.json` (empty on first build — all `reviewed:false`)

- [ ] **Step 1: Invoke the hadith-verifier skill**

Use the `hadith-verifier` skill (`skills/islamic-authenticity/SKILL.md`). For each candidate hadith run its full workflow: search trusted sources, confirm collection · number · narrator · **isnad chain** · grade · gradedBy · Arabic. Discard any hadith that cannot be confirmed.

- [ ] **Step 2: Author the source file**

Only include verifier-confirmed hadith. Tag each to a slug **that already exists in `src/data/related-verses/topics.json`** with the **exact same `label`**. Every field below is required and enforced by the build; `grade` must be `Sahih` or `Hasan`; `reviewed` stays `false`:

```json
{
  "patience": {
    "label": "Patience (Sabr)",
    "hadith": [
      {
        "collection": "Sahih al-Bukhari",
        "book": "<verified book/kitab name>",
        "number": 0,
        "arabic": "<verified Arabic incl. sanad — from the skill's confirmed source>",
        "english": "<verified translation>",
        "narrator": "<verified companion narrator>",
        "isnadSummary": "<verified key chain narrators → Prophet ﷺ>",
        "grade": "Sahih",
        "gradedBy": "<verified grading scholar>",
        "url": "https://<canonical source link>",
        "score": 8,
        "reviewed": false
      }
    ]
  }
}
```

Aim for ~6–10 hadith across 3–4 slugs. **Correctness over count** — a smaller fully-verified set is a success; one unverifiable row is a failure. To confirm the shared taxonomy slugs/labels available, read `src/data/related-verses/topics.json`.

- [ ] **Step 3: Run the build**

Run: `node tools/related-hadith-build.mjs`
Expected: validation passes; prints `✅ Wrote 0 topic(s) …` and `ℹ N hadith held back pending 🕌 review` (N = number authored, since all `reviewed:false`). If validation fails, the script lists each error — fix the source and re-run.

- [ ] **Step 4: Confirm the staged index is empty and the source is valid**

Run:
```bash
node -e "const t=require('./src/data/related-hadith/topics.json'); console.log('shipped topics:', Object.keys(t).length); if(Object.keys(t).length!==0){console.error('expected empty index (all reviewed:false)');process.exit(1)} console.log('OK: nothing ships pre-review');"
```
Expected: `shipped topics: 0` then `OK`.

- [ ] **Step 5: Commit**

```bash
git add tools/related-hadith/topics.source.json src/data/related-hadith/topics.json
git commit -m "feat(hadith): verifier-confirmed curation source (staged reviewed:false; empty index pre-signoff)"
```

Report the topics/hadith authored and the exact hadith-verifier confirmation for each (sources checked per hadith).

---

## Task 6: Browser wrapper + reader panel

Thin wrapper mirroring `src/js/quran-related.js`: lazy-load the index + reused `verse-index.json`, render a per-verse "Related Hadith" panel with an expand for Arabic + isnad + source.

**Files:**
- Create: `src/js/quran-related-hadith.js`
- Modify: `quran.html` (CSS block + `<script>` includes), `src/js/quran-verses.js` (footer button + panel container)

- [ ] **Step 1: Write the wrapper**

```js
/* Related Hadith — browser wrapper. Loads the pre-built static index + reused verse-index,
   renders a per-verse panel with expand. Zero AI, zero backend, one-time JSON load. */
(function () {
  'use strict';
  var core = (window.II && window.II.relatedHadithCore);
  var TOPICS_URL = 'src/data/related-hadith/topics.json';
  var VERSE_INDEX_URL = 'src/data/related-verses/verse-index.json';
  var state = { topics: null, verseIndex: null, loaded: false, loading: null };

  function loadIndex() {
    if (state.loaded) return Promise.resolve();
    if (state.loading) return state.loading;
    var p = Promise.all([
      fetch(TOPICS_URL).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }),
      fetch(VERSE_INDEX_URL).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    ]).then(function (res) { state.topics = res[0]; state.verseIndex = res[1]; state.loaded = true; });
    state.loading = p;
    p.catch(function () { state.loading = null; }); // retry after a transient failure
    return p;
  }

  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function gradeClass(g) { return g === 'Sahih' ? 'rh-grade-sahih' : 'rh-grade-hasan'; }

  function render(panel, verseKey) {
    panel.innerHTML = '';
    var rows = core.relatedHadith(verseKey, state.topics, state.verseIndex, { limit: 5 });
    if (!rows.length) { panel.appendChild(el('p', 'rh-empty', 'No reviewed related hadith yet.')); return; }
    rows.forEach(function (h) {
      var row = el('div', 'rh-row');
      var head = el('div', 'rh-head');
      head.appendChild(el('span', 'rh-grade ' + gradeClass(h.grade), h.grade));
      head.appendChild(el('span', 'rh-ref', h.ref));
      head.appendChild(el('span', 'rh-chip', h.topic));
      row.appendChild(head);
      row.appendChild(el('p', 'rh-narrator', 'Narrated ' + h.narrator));
      row.appendChild(el('p', 'rh-text', h.english));

      var full = el('div', 'rh-full'); full.style.display = 'none';
      var ar = el('p', 'rh-arabic', h.arabic); ar.setAttribute('dir', 'rtl'); full.appendChild(ar);
      full.appendChild(el('p', 'rh-isnad', 'Isnad: ' + h.isnadSummary));
      full.appendChild(el('p', 'rh-attr', h.grade + ' · graded by ' + h.gradedBy));
      var link = el('a', 'rh-src', 'Source ↗'); link.href = h.url; link.target = '_blank'; link.rel = 'noopener'; full.appendChild(link);

      var toggle = el('button', 'rh-expand', 'View full ▾');
      toggle.addEventListener('click', function () {
        var open = full.style.display === 'none';
        full.style.display = open ? 'block' : 'none';
        toggle.textContent = open ? 'Hide ▴' : 'View full ▾';
      });
      row.appendChild(toggle); row.appendChild(full);
      panel.appendChild(row);
    });
  }

  window.toggleRelatedHadith = function (panelId) {
    var panel = document.getElementById(panelId);
    if (!panel) return;
    var card = document.getElementById(panelId.replace(/^rh-/, 'a-'));
    var verseKey = card && card.dataset ? card.dataset.key : null;
    var open = panel.classList.toggle('show');
    if (!open) return;
    if (panel.dataset.rendered === verseKey) return;
    loadIndex().then(function () { render(panel, verseKey); panel.dataset.rendered = verseKey; })
      .catch(function () { panel.innerHTML = ''; panel.appendChild(el('p', 'rh-empty', 'Related hadith unavailable.')); });
  };
})();
```

- [ ] **Step 2: Add the footer button + panel container in `src/js/quran-verses.js`**

Find where the Related Verses button + panel are added in `buildCard` (grep for `toggleRelated` and `'rv-'`). Immediately after that Related Verses button, add a sibling "Related Hadith" button and (next to the `rv-` panel) an `rh-` panel, mirroring the exact idiom already there. The button must call `toggleRelatedHadith('rh-' + k)` and let the click bubble (do NOT add `stopPropagation` — match the Related Verses button, which allows card activation). The panel element:

```js
// mirrors the existing rv- panel; k is the verse key used for the card id a-<k>
var rhPanel = el('div', 'rh-panel'); rhPanel.id = 'rh-' + k;
// append rhPanel next to the existing rv- panel in the card footer/body
```

Confirm the verse-key variable name (`k`) and the card id scheme (`a-<k>` with `dataset.key`) match what Related Verses uses; adjust to the real local names in `buildCard`.

- [ ] **Step 3: Add the CSS block to `quran.html`**

Place next to the `.rv-panel` rules (search `.rv-panel{`). Reuse existing brand rgba tokens only — no new hex. For `.rh-arabic`, reuse the SAME font-family the reader's `.ayah-arabic` uses (grep `.ayah-arabic` in `quran.html` and copy its `font-family`):

```html
<style>
.rh-panel{display:none;margin-top:14px;padding:14px 16px;background:rgba(0,105,110,.03);border:.5px solid rgba(197,160,89,.25);border-radius:14px;}
.rh-panel.show{display:block;animation:slideUp .35s var(--ease-reverent) both;}
.rh-row{padding:12px 0;border-bottom:.5px solid rgba(197,160,89,.18);}
.rh-row:last-child{border-bottom:0;}
.rh-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
.rh-grade{font-size:.7rem;font-weight:700;padding:2px 8px;border-radius:999px;}
.rh-grade-sahih{background:rgba(0,105,110,.14);}
.rh-grade-hasan{background:rgba(197,160,89,.16);}
.rh-ref{font-weight:600;}
.rh-chip{font-size:.72rem;padding:2px 8px;border-radius:999px;background:rgba(197,160,89,.14);}
.rh-narrator{font-size:.8rem;opacity:.7;margin:4px 0 2px;}
.rh-text{margin:2px 0;opacity:.92;}
.rh-expand{background:none;border:0;color:inherit;opacity:.7;cursor:pointer;font-size:.78rem;padding:4px 0;}
.rh-full{margin-top:6px;}
.rh-arabic{font-size:1.15rem;line-height:2;text-align:right;}
.rh-isnad,.rh-attr{font-size:.74rem;opacity:.7;margin:4px 0;}
.rh-src{font-size:.74rem;}
.rh-empty{opacity:.6;margin:6px 0;}
</style>
```

- [ ] **Step 4: Add the script includes to `quran.html`**

After the Related Verses includes (search `quran-related.js`), add:

```html
<script src="src/js/quran-related-hadith-core.js"></script>
<script src="src/js/quran-related-hadith.js"></script>
```

- [ ] **Step 5: Verify behavior headlessly with a reviewed fixture**

Because the shipped index is empty (all `reviewed:false`), verify rendering against a temporary fixture in the scratchpad (do NOT commit it). Create `verify-related-hadith.mjs` in the scratchpad that: loads `quran-related-hadith-core.js` + `quran-related-hadith.js` into jsdom, stubs `fetch` to return a small compiled `topics.json` (2 reviewed hadith under `patience`) + a `verse-index.json` (`{"2:153":["patience"]}`), builds a card `<div id="a-2:153" data-key="2:153">` + panel `<div id="rh-2:153" class="rh-panel">`, calls `window.toggleRelatedHadith('rh-2:153')`, and asserts: 2 `.rh-row` rendered, grade badge text is `Sahih`/`Hasan`, expand toggles `.rh-full` visibility, an untagged verse shows `.rh-empty`. Run it and confirm all assertions pass. (Mirror the slice-1 harness `verify-related-dom.mjs`.)

- [ ] **Step 6: Run the unit suite + commit**

Run: `node --test tests/quran/related-hadith-core.test.js`
Expected: PASS (5 tests).

```bash
git add src/js/quran-related-hadith.js src/js/quran-verses.js quran.html
git commit -m "feat(hadith): Related Hadith per-verse panel in the reader"
```

---

## Task 7: Docs + final verification

**Files:**
- Modify: `doc/DATA.md`, `doc/API-SPEC.md`, `doc/TASKS.md`

- [ ] **Step 1: Document the new static data + feature**

- `doc/DATA.md`: register `src/data/related-hadith/topics.json` — **generated** by `tools/related-hadith-build.mjs` from `tools/related-hadith/topics.source.json` (do not hand-edit generated file); note it ships **only `reviewed:true`** rows, every row carries grade + gradedBy + verified isnadSummary, and it reuses `related-verses/verse-index.json`.
- `doc/API-SPEC.md`: under the client-direct/keyless section, add that Related Hadith is served from static JSON (`src/data/related-hadith/*.json`), no `/api/` route, hadithapi.com is the curation source, and the feature is **gated on 🕌 sign-off** (ships empty until entries are reviewed). Note `/api/index/*` + D1/FTS5 remain deferred to the Vocabulary slice.
- `doc/TASKS.md`: mark Related Hadith (slice 2) as **built, staged, pending 🕌 sign-off for go-live**; update the deferred backlog (Vocabulary + D1/FTS5 next; hadith-page cross-linking; disputed-grade handling; AI blurb; admin UI).

- [ ] **Step 2: Run the full core suite**

Run: `node --test tests/quran/related-hadith-core.test.js`
Expected: PASS (5 tests, 0 failures).

- [ ] **Step 3: Re-run the empty-index integrity check (Task 5 Step 4)**

Expected: `shipped topics: 0` then `OK` (nothing ships pre-review), exit 0.

- [ ] **Step 4: Commit**

```bash
git add doc/DATA.md doc/API-SPEC.md doc/TASKS.md
git commit -m "docs(hadith): register Related Hadith data files + update task board"
```

---

## Deferred-work ledger (after this slice)

- ⏳ **Vocabulary** — terms + cross-references into verses & hadith; **D1 + FTS5** (free-text search justifies the DB).
- ⏳ **`/api/index/*` worker routes** (with D1).
- ⏳ **Hadith-page cross-linking** (`hadith.html`; separate from the `/api/hadith` 501 route).
- ⏳ **Disputed-grade handling** (`[GRADE DISPUTED]`).
- ⏳ **AI connecting-explanation blurb** (reuses `/api/ask-claude` guardrails + human-review gate).
- ⏳ **Web-based admin bulk-review UI** (replaces flip-`reviewed`-in-JSON at scale).
- ⏳ **Scale tag coverage** via external index / staged suggestions.
- ⚠️ **Production go-live for Related Hadith is gated on the operator's 🕌 sign-off** (flip `reviewed:true`, rebuild).
