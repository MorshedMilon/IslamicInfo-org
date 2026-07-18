# Vocabulary Knowledge Index — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a per-verse "Key Terms" panel (curated Arabic-term glossary) completing the reader trio — static JSON, term→topic mapping that reuses the shipped Related Verses/Hadith indexes, per-term sourced definitions enforced by a fail-closed build.

**Architecture:** A shared DOM-free core (`quran-vocab-core.js`) holds pure logic: fail-closed source validation (non-blank fields + topic-in-taxonomy), index compilation (term records + reverse topic→terms map), and runtime lookup (`keyTermsForVerse`, `termCrossRefs`). An operator-run ESM build (`tools/vocab-build.mjs`) validates a hand-authored `terms.source.json` against the slice-1 taxonomy and emits `terms.json` + `topic-terms.json`. A thin browser wrapper (`quran-vocab.js`) renders a per-verse panel; a term's cross-ref verses/hadith are inherited from the shipped `related-verses`/`related-hadith` data via the term's topic(s). No database — this completes the Knowledge Index as static JSON.

**Tech Stack:** Vanilla JS (UMD core + browser wrapper), Node built-in test runner (`node:test`), Node ESM build script, static JSON. Definitions grounded in cited references (Lane's Lexicon etc.) at curation. No API key, no worker route, no D1/FTS5.

**Spec:** `doc/superpowers/specs/2026-07-17-vocabulary-index-design.md`
**Predecessors (patterns to mirror):** `src/js/quran-related-hadith-core.js`, `src/js/quran-related-hadith.js`, `tools/related-hadith-build.mjs`, `tests/quran/related-hadith-core.test.js`.

---

## File Structure

| File | Responsibility | New/Modify |
|---|---|---|
| `src/js/quran-vocab-core.js` | Pure: `validateSource`, `compileIndex`, `keyTermsForVerse`, `termCrossRefs`. Shared by build + runtime. | Create |
| `src/js/quran-vocab.js` | Browser wrapper: load JSON, render per-verse Key Terms panel with expand. | Create |
| `tools/vocab/terms.source.json` | Hand-authored, sourced curation source. | Create |
| `tools/vocab-build.mjs` | Operator-run: validate vs taxonomy (fail-closed) → emit terms.json + topic-terms.json. | Create |
| `src/data/vocab/terms.json` | Generated: term slug → record. | Generated |
| `src/data/vocab/topic-terms.json` | Generated: reverse map, topic slug → [term slugs]. | Generated |
| `tests/quran/vocab-core.test.js` | Unit tests. | Create |
| `quran.html` | Panel CSS, script includes. | Modify |
| `src/js/quran-verses.js` | "Key Terms" footer button + `kt-<k>` panel container in `buildCard`. | Modify |
| `doc/DATA.md`, `doc/API-SPEC.md`, `doc/TASKS.md` | Register data files + feature. | Modify |

**Reused unchanged:** `src/data/related-verses/verse-index.json` (verse → topics), `src/data/related-verses/topics.json` (taxonomy `{slug:label}` + cross-ref verses), `src/data/related-hadith/topics.json` (cross-ref hadith).

**Generated term record shape** (`terms.json`):
```json
{
  "taqwa": {
    "arabic": "تَقْوَىٰ", "translit": "Taqwā",
    "shortDef": "God-consciousness; mindful reverence of Allah.",
    "longDef": "Fuller definition, compiled from the cited source(s)…",
    "source": "Lane's Arabic-English Lexicon (root و-ق-ي)…",
    "topics": ["fear-of-allah"]
  }
}
```

---

## Task 1: Core — `validateSource` (fail-closed)

**Files:**
- Create: `src/js/quran-vocab-core.js`
- Test: `tests/quran/vocab-core.test.js`

- [ ] **Step 1: Write the failing test**

```js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const core = require('../../src/js/quran-vocab-core.js');

const TAX = { patience: 'Patience (Sabr)', 'fear-of-allah': 'Fear of Allah (Taqwa)' };

function goodTerm(over) {
  return Object.assign({
    arabic: 'تَقْوَىٰ', translit: 'Taqwā', shortDef: 'God-consciousness.',
    longDef: 'A fuller definition compiled from cited sources.',
    source: "Lane's Lexicon", topics: ['fear-of-allah']
  }, over || {});
}

test('validateSource passes a clean source', () => {
  const src = { taqwa: goodTerm() };
  const r = core.validateSource(src, TAX);
  assert.equal(r.ok, true);
  assert.deepEqual(r.errors, []);
});

test('validateSource enforces every fail-closed rule', () => {
  const src = {
    'Bad Slug': goodTerm(),
    blankdef: goodTerm({ shortDef: '  ' }),
    nosrc: goodTerm({ source: '' }),
    noar: goodTerm({ arabic: '' }),
    notopics: goodTerm({ topics: [] }),
    badtopic: goodTerm({ topics: ['nonexistent-topic'] })
  };
  const r = core.validateSource(src, TAX);
  assert.equal(r.ok, false);
  assert.ok(r.errors.some(e => /Bad Slug|kebab/.test(e)));
  assert.ok(r.errors.some(e => /blankdef.*shortDef/i.test(e)));
  assert.ok(r.errors.some(e => /nosrc.*source/i.test(e)));
  assert.ok(r.errors.some(e => /noar.*arabic/i.test(e)));
  assert.ok(r.errors.some(e => /notopics.*non-empty/i.test(e)));
  assert.ok(r.errors.some(e => /not in .*taxonomy/i.test(e)));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/quran/vocab-core.test.js`
Expected: FAIL — `Cannot find module '../../src/js/quran-vocab-core.js'`

- [ ] **Step 3: Write minimal implementation**

```js
/* Vocabulary — pure core (DOM-free, UMD). Shared by the build script and the browser. */
(function (root, factory) {
  var mod = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = mod;
  (root.II = root.II || {}).vocabCore = mod;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function validateSource(source, taxonomy) {
    var errors = [];
    if (!source || typeof source !== 'object' || Array.isArray(source)) {
      return { ok: false, errors: ['source must be an object keyed by term slug'] };
    }
    taxonomy = taxonomy || {};
    Object.keys(source).forEach(function (slug) {
      var t = source[slug];
      if (!/^[a-z0-9-]+$/.test(slug)) errors.push(slug + ': term slug must be kebab-case [a-z0-9-]');
      if (!t || typeof t !== 'object') { errors.push(slug + ': term must be an object'); return; }
      ['arabic', 'translit', 'shortDef', 'longDef', 'source'].forEach(function (f) {
        if (typeof t[f] !== 'string' || !t[f].trim()) errors.push(slug + ': missing/blank ' + f);
      });
      if (!Array.isArray(t.topics) || t.topics.length === 0) { errors.push(slug + ': topics must be a non-empty array'); return; }
      t.topics.forEach(function (topic) {
        if (!(topic in taxonomy)) errors.push(slug + ': topic "' + topic + '" not in shared verses taxonomy');
      });
    });
    return { ok: errors.length === 0, errors: errors };
  }

  return { validateSource: validateSource };
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/quran/vocab-core.test.js`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/js/quran-vocab-core.js tests/quran/vocab-core.test.js
git commit -m "feat(vocab): vocab core — validateSource (fail-closed)"
```

---

## Task 2: Core — `compileIndex` (records + reverse topic→terms map)

**Files:**
- Modify: `src/js/quran-vocab-core.js`
- Test: `tests/quran/vocab-core.test.js`

- [ ] **Step 1: Write the failing test**

Append (reuses `goodTerm`/`TAX`):

```js
test('compileIndex emits term records + reverse topicTerms map (term under two topics appears under both)', () => {
  const src = {
    taqwa: goodTerm({ topics: ['fear-of-allah'] }),
    sabr: goodTerm({ translit: 'Sabr', topics: ['patience', 'fear-of-allah'] })
  };
  const out = core.compileIndex(src, TAX);
  assert.deepEqual(Object.keys(out.terms).sort(), ['sabr', 'taqwa']);
  assert.equal(out.terms.taqwa.translit, 'Taqwā');
  assert.deepEqual(out.terms.sabr.topics, ['patience', 'fear-of-allah']);
  // reverse map
  assert.deepEqual(out.topicTerms.patience, ['sabr']);
  assert.deepEqual(out.topicTerms['fear-of-allah'].sort(), ['sabr', 'taqwa']);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/quran/vocab-core.test.js`
Expected: FAIL — `core.compileIndex is not a function`

- [ ] **Step 3: Write minimal implementation**

Add inside the factory:

```js
  function compileIndex(source, taxonomy) {
    var terms = {}, topicTerms = {};
    Object.keys(source).forEach(function (slug) {
      var t = source[slug];
      terms[slug] = {
        arabic: t.arabic, translit: t.translit, shortDef: t.shortDef,
        longDef: t.longDef, source: t.source, topics: t.topics.slice()
      };
      t.topics.forEach(function (topic) {
        var arr = topicTerms[topic] = topicTerms[topic] || [];
        if (arr.indexOf(slug) === -1) arr.push(slug);
      });
    });
    return { terms: terms, topicTerms: topicTerms };
  }
```

Add `compileIndex: compileIndex,` to the returned object.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/quran/vocab-core.test.js`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/js/quran-vocab-core.js tests/quran/vocab-core.test.js
git commit -m "feat(vocab): vocab core — compileIndex (records + reverse topicTerms)"
```

---

## Task 3: Core — `keyTermsForVerse` + `termCrossRefs`

**Files:**
- Modify: `src/js/quran-vocab-core.js`
- Test: `tests/quran/vocab-core.test.js`

- [ ] **Step 1: Write the failing test**

Append:

```js
// Compiled fixtures
const TERMS = {
  taqwa: { arabic: 'تقوى', translit: 'Taqwā', shortDef: 'God-consciousness.', longDef: 'L', source: 'S', topics: ['fear-of-allah'] },
  sabr:  { arabic: 'صبر', translit: 'Sabr', shortDef: 'Patient perseverance.', longDef: 'L', source: 'S', topics: ['patience', 'fear-of-allah'] }
};
const TOPICTERMS = { 'fear-of-allah': ['taqwa', 'sabr'], patience: ['sabr'] };
const VINDEX = { '2:153': ['patience', 'fear-of-allah'], '14:7': ['gratitude'] };

test('keyTermsForVerse returns the verse topics\' terms, dedups, sorts by translit', () => {
  const out = core.keyTermsForVerse('2:153', TOPICTERMS, VINDEX, TERMS);
  // sabr (patience + fear-of-allah) deduped to once; sorted by translit: Sabr < Taqwā
  assert.deepEqual(out.map(t => t.slug), ['sabr', 'taqwa']);
  assert.equal(out[0].shortDef, 'Patient perseverance.');
  assert.deepEqual(core.keyTermsForVerse('9:1', TOPICTERMS, VINDEX, TERMS), []);
});

const RV_TOPICS = {
  patience: { label: 'Patience (Sabr)', verses: [
    { key: '2:153', ref: 'Al-Baqarah 2:153', score: 9, translation: 'A', translator: 'Saheeh International', sourceCitation: 'c' },
    { key: '3:200', ref: 'Aal-Imran 3:200', score: 8, translation: 'B', translator: 'Saheeh International', sourceCitation: 'c' }
  ] },
  'fear-of-allah': { label: 'Fear of Allah (Taqwa)', verses: [
    { key: '2:153', ref: 'Al-Baqarah 2:153', score: 5, translation: 'A', translator: 'Saheeh International', sourceCitation: 'c' }
  ] }
};
const RH_TOPICS = {
  patience: { label: 'Patience (Sabr)', hadith: [
    { collection: 'Sahih al-Bukhari', number: 1469, ref: 'Sahih al-Bukhari 1469', grade: 'Sahih', gradedBy: 'Al-Bukhari', english: 'E', arabic: 'A', narrator: 'N', isnadSummary: 'i', url: 'https://x', score: 9 }
  ] }
};

test('termCrossRefs gathers a term\'s topics\' verses+hadith, dedups, caps', () => {
  const out = core.termCrossRefs('sabr', TERMS, RV_TOPICS, RH_TOPICS, { vLimit: 3, hLimit: 2 });
  // sabr topics = patience + fear-of-allah; 2:153 appears in both → deduped, highest score (9) kept
  assert.deepEqual(out.verses.map(v => v.key), ['2:153', '3:200']);
  assert.equal(out.verses[0].score, 9);
  assert.deepEqual(out.hadith.map(h => h.ref), ['Sahih al-Bukhari 1469']);
  assert.equal(core.termCrossRefs('unknown', TERMS, RV_TOPICS, RH_TOPICS).verses.length, 0);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/quran/vocab-core.test.js`
Expected: FAIL — `core.keyTermsForVerse is not a function`

- [ ] **Step 3: Write minimal implementation**

Add inside the factory:

```js
  function keyTermsForVerse(verseKey, topicTerms, verseIndex, terms) {
    var topics = (verseIndex && verseIndex[verseKey]) ? verseIndex[verseKey] : [];
    var seen = {}, out = [];
    topics.forEach(function (topic) {
      var list = (topicTerms && topicTerms[topic]) ? topicTerms[topic] : [];
      list.forEach(function (slug) {
        if (seen[slug]) return;
        seen[slug] = true;
        var t = terms && terms[slug];
        if (!t) return;
        out.push({ slug: slug, arabic: t.arabic, translit: t.translit, shortDef: t.shortDef });
      });
    });
    out.sort(function (a, b) {
      var x = a.translit.toLowerCase(), y = b.translit.toLowerCase();
      return x < y ? -1 : x > y ? 1 : 0;
    });
    return out;
  }

  function termCrossRefs(termSlug, terms, relatedVersesTopics, relatedHadithTopics, opts) {
    opts = opts || {};
    var vLimit = opts.vLimit == null ? 3 : opts.vLimit;
    var hLimit = opts.hLimit == null ? 2 : opts.hLimit;
    var t = terms && terms[termSlug];
    if (!t) return { verses: [], hadith: [] };
    var vBest = {}, hBest = {};
    t.topics.forEach(function (topic) {
      var vt = relatedVersesTopics && relatedVersesTopics[topic];
      if (vt && vt.verses) vt.verses.forEach(function (v) {
        if (!vBest[v.key] || v.score > vBest[v.key].score) vBest[v.key] = v;
      });
      var ht = relatedHadithTopics && relatedHadithTopics[topic];
      if (ht && ht.hadith) ht.hadith.forEach(function (h) {
        var k = h.collection + '|' + h.number;
        if (!hBest[k] || h.score > hBest[k].score) hBest[k] = h;
      });
    });
    var verses = Object.keys(vBest).map(function (k) { return vBest[k]; })
      .sort(function (a, b) { return (b.score - a.score) || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0); })
      .slice(0, vLimit);
    var hadith = Object.keys(hBest).map(function (k) { return hBest[k]; })
      .sort(function (a, b) { return (b.score - a.score) || ((a.collection + a.number) < (b.collection + b.number) ? -1 : 1); })
      .slice(0, hLimit);
    return { verses: verses, hadith: hadith };
  }
```

Add `keyTermsForVerse: keyTermsForVerse,` and `termCrossRefs: termCrossRefs` to the returned object.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/quran/vocab-core.test.js`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/js/quran-vocab-core.js tests/quran/vocab-core.test.js
git commit -m "feat(vocab): vocab core — keyTermsForVerse + termCrossRefs lookup"
```

---

## Task 4: Build script (`tools/vocab-build.mjs`)

**Files:**
- Create: `tools/vocab-build.mjs`
- Uses (read-only): `src/data/related-verses/topics.json`, `src/js/quran-vocab-core.js`

- [ ] **Step 1: Write the script**

```js
#!/usr/bin/env node
/* Vocabulary — build CLI (operator-run).
   Usage: node tools/vocab-build.mjs [--in tools/vocab/terms.source.json]
   Validates the curation source against the slice-1 taxonomy (fail-closed) and emits
   src/data/vocab/terms.json + topic-terms.json. */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const core = require('../src/js/quran-vocab-core.js');

function arg(name, def) { const i = process.argv.indexOf('--' + name); return (i !== -1 && process.argv[i + 1]) ? process.argv[i + 1] : def; }

const inFile = arg('in', 'tools/vocab/terms.source.json');
const OUT_DIR = 'src/data/vocab';

let source;
try { source = JSON.parse(fs.readFileSync(inFile, 'utf8')); }
catch (e) { console.error('Cannot read/parse ' + inFile + ': ' + e.message); process.exit(1); }

// Shared taxonomy { slug: label } from slice 1 — build fails if a term maps outside it.
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
fs.writeFileSync(path.join(OUT_DIR, 'terms.json'), JSON.stringify(out.terms, null, 2) + '\n');
fs.writeFileSync(path.join(OUT_DIR, 'topic-terms.json'), JSON.stringify(out.topicTerms, null, 2) + '\n');
console.log('✅ Wrote ' + Object.keys(out.terms).length + ' terms across ' + Object.keys(out.topicTerms).length + ' topic(s) to ' + OUT_DIR);
```

- [ ] **Step 2: Verify fail-closed on a missing source file**

Run: `node tools/vocab-build.mjs --in tools/vocab/nope.json`
Expected: prints `Cannot read/parse …` and exits non-zero (echo $? = 1). Full run happens in Task 5. Also confirm `src/data/related-verses/topics.json` exists (it does — slice 1).

- [ ] **Step 3: Commit**

```bash
git add tools/vocab-build.mjs
git commit -m "feat(vocab): vocab build script (validate vs taxonomy, fail-closed)"
```

---

## Task 5: Curation source (sourced definitions) + generate the index

Author `tools/vocab/terms.source.json` — a starter set of well-established Arabic terms, each with a definition **grounded in a real, cited reference**. **Anti-hallucination: never invent a definition or a source. Ground each in a fetched reference (Lane's Arabic-English Lexicon, a recognized Islamic/tafsir glossary) and cite it.** Only lexical/spiritual terms — NO contested, sectarian, or ruling-adjacent terms.

**Files:**
- Create: `tools/vocab/terms.source.json`
- Generates: `src/data/vocab/terms.json`, `src/data/vocab/topic-terms.json`

- [ ] **Step 1: Read the taxonomy for valid topic slugs**

Read `src/data/related-verses/topics.json` — every `topics` entry a term maps to MUST be one of those slugs (the build fails otherwise). Current slugs include: patience, gratitude, prayer, charity, fasting, forgiveness, mercy, justice, truthfulness, humility, fear-of-allah, reliance-on-allah, repentance, kindness-to-parents, remembrance-of-allah, knowledge, hope, oneness-of-allah, pilgrimage, orphans.

- [ ] **Step 2: Ground each definition in a cited reference**

For each candidate term, use WebSearch/WebFetch to confirm the transliteration + meaning against an established reference; write `shortDef` + `longDef` in your own words grounded in that source, and put the reference in `source`. Discard any term you cannot ground.

- [ ] **Step 3: Author the source file**

Aim for ~10–15 terms mapping to existing topics (e.g. taqwa→fear-of-allah, sabr→patience, shukr→gratitude, salah→prayer, zakat→charity, sawm→fasting, rahmah→mercy, adl→justice, sidq→truthfulness, tawadu→humility, tawakkul→reliance-on-allah, tawbah→repentance, dhikr→remembrance-of-allah, tawhid→oneness-of-allah, hajj→pilgrimage). Every field required; `topics` must be existing slugs:

```json
{
  "taqwa": {
    "arabic": "تَقْوَىٰ",
    "translit": "Taqwā",
    "shortDef": "<sourced short definition>",
    "longDef": "<sourced fuller definition, in your own words from the cited reference>",
    "source": "<real cited reference, e.g. Lane's Arabic-English Lexicon, root و-ق-ي>",
    "topics": ["fear-of-allah"]
  }
}
```

- [ ] **Step 4: Run the build**

Run: `node tools/vocab-build.mjs`
Expected: `✅ Wrote N terms across M topic(s) to src/data/vocab`. If validation fails, the script lists each error — fix the source and re-run.

- [ ] **Step 5: Integrity check**

Run:
```bash
node -e "const t=require('./src/data/vocab/terms.json'); const tt=require('./src/data/vocab/topic-terms.json'); const rv=require('./src/data/related-verses/topics.json'); let bad=0,n=0; Object.entries(t).forEach(([s,x])=>{n++; if(!x.source||!x.source.trim())bad++; if(!Array.isArray(x.topics)||!x.topics.length)bad++; x.topics.forEach(tp=>{if(!(tp in rv))bad++;});}); console.log('terms',n,'violations',bad); if(bad)process.exit(1); console.log('OK: all terms sourced + mapped to real topics');"
```
Expected: `violations 0` then `OK`.

- [ ] **Step 6: Commit**

```bash
git add tools/vocab/terms.source.json src/data/vocab/terms.json src/data/vocab/topic-terms.json
git commit -m "feat(vocab): sourced curation set + generated glossary index"
```

Report the terms authored and, for each, the reference you grounded its definition in (with URL).

---

## Task 6: Browser wrapper + Key Terms panel

Thin wrapper mirroring `src/js/quran-related-hadith.js`: lazy-load the vocab index + the reused indexes, render a per-verse "Key Terms" panel with term chips that expand to definition + source + cross-refs.

**Files:**
- Create: `src/js/quran-vocab.js`
- Modify: `quran.html` (CSS + `<script>` includes), `src/js/quran-verses.js` ("Key Terms" footer button + panel container)

- [ ] **Step 1: Write the wrapper**

```js
/* Vocabulary — browser wrapper. Loads the glossary index + reused related indexes,
   renders a per-verse "Key Terms" panel. Zero AI, zero backend, one-time JSON load. */
(function () {
  'use strict';
  var core = (window.II && window.II.vocabCore);
  var URLS = {
    terms: 'src/data/vocab/terms.json',
    topicTerms: 'src/data/vocab/topic-terms.json',
    verseIndex: 'src/data/related-verses/verse-index.json',
    rvTopics: 'src/data/related-verses/topics.json',
    rhTopics: 'src/data/related-hadith/topics.json'
  };
  var state = { d: null, loaded: false, loading: null };

  function loadIndex() {
    if (state.loaded) return Promise.resolve();
    if (state.loading) return state.loading;
    var keys = Object.keys(URLS);
    var p = Promise.all(keys.map(function (k) {
      return fetch(URLS[k]).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
    })).then(function (res) {
      var d = {}; keys.forEach(function (k, i) { d[k] = res[i]; }); state.d = d; state.loaded = true;
    });
    state.loading = p;
    p.catch(function () { state.loading = null; });
    return p;
  }

  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }

  function renderTermDetail(box, slug) {
    var d = state.d, t = d.terms[slug];
    box.appendChild(el('p', 'kt-long', t.longDef));
    box.appendChild(el('p', 'kt-source', 'Source: ' + t.source));
    var refs = core.termCrossRefs(slug, d.terms, d.rvTopics, d.rhTopics, { vLimit: 3, hLimit: 2 });
    if (refs.verses.length) {
      box.appendChild(el('p', 'kt-xlabel', 'In the Qur’an'));
      refs.verses.forEach(function (v) { box.appendChild(el('p', 'kt-xref', v.ref + ' — ' + v.translation)); });
    }
    if (refs.hadith.length) {
      box.appendChild(el('p', 'kt-xlabel', 'In hadith'));
      refs.hadith.forEach(function (h) {
        var row = el('p', 'kt-xref');
        row.appendChild(el('span', 'kt-grade', h.grade));
        row.appendChild(document.createTextNode(' ' + h.ref + ' — ' + h.english));
        box.appendChild(row);
      });
    }
  }

  function render(panel, verseKey) {
    panel.innerHTML = '';
    if (!core) { panel.appendChild(el('p', 'kt-empty', 'Key terms unavailable.')); return; }
    var d = state.d;
    var terms = core.keyTermsForVerse(verseKey, d.topicTerms, d.verseIndex, d.terms);
    if (!terms.length) { panel.appendChild(el('p', 'kt-empty', 'No key terms indexed for this verse yet.')); return; }
    terms.forEach(function (t) {
      var chip = el('div', 'kt-term');
      var head = el('button', 'kt-head');
      var ar = el('span', 'kt-ar', t.arabic); ar.setAttribute('dir', 'rtl');
      head.appendChild(ar);
      head.appendChild(el('span', 'kt-translit', t.translit));
      chip.appendChild(head);
      chip.appendChild(el('p', 'kt-short', t.shortDef));
      var detail = el('div', 'kt-detail'); detail.style.display = 'none';
      var built = false;
      head.addEventListener('click', function () {
        var open = detail.style.display === 'none';
        detail.style.display = open ? 'block' : 'none';
        if (open && !built) { renderTermDetail(detail, t.slug); built = true; }
      });
      chip.appendChild(detail);
      panel.appendChild(chip);
    });
  }

  window.toggleKeyTerms = function (panelId) {
    var panel = document.getElementById(panelId);
    if (!panel) return;
    var card = document.getElementById(panelId.replace(/^kt-/, 'a-'));
    var verseKey = card && card.dataset ? card.dataset.key : null;
    var open = panel.classList.toggle('show');
    if (!open) return;
    if (panel.dataset.rendered === verseKey) return;
    loadIndex().then(function () { render(panel, verseKey); panel.dataset.rendered = verseKey; })
      .catch(function () { panel.innerHTML = ''; panel.appendChild(el('p', 'kt-empty', 'Key terms unavailable.')); });
  };
})();
```

- [ ] **Step 2: Footer button + panel container in `src/js/quran-verses.js`**

Grep `src/js/quran-verses.js` for `toggleRelatedHadith` / `'rh-'` to find where the Related Hadith button + panel are built in `buildCard`. Alongside them, add a sibling "Key Terms" button + a `kt-<k>` panel, mirroring the EXACT idiom (same element/button helper, same footer location, same `k` verse-key variable, card id `a-<k>` with `dataset.key`). The button calls `toggleKeyTerms('kt-' + k)` and must NOT call stopPropagation (match the sibling buttons). Panel:
```js
var kt = el('div', 'kt-panel'); kt.id = 'kt-' + k; card.appendChild(kt);
```
Confirm the real local names in buildCard and match them.

- [ ] **Step 3: CSS block in `quran.html`**

Place next to the `.rh-panel` rules (search `.rh-panel{`). Reuse existing brand rgba tokens only — no new hex. For `.kt-ar`, grep `.ayah-arabic` and copy its `font-family`:
```html
<style>
.kt-panel{display:none;margin-top:14px;padding:14px 16px;background:rgba(0,105,110,.03);border:.5px solid rgba(197,160,89,.25);border-radius:14px;}
.kt-panel.show{display:block;animation:slideUp .35s var(--ease-reverent) both;}
.kt-term{padding:10px 0;border-bottom:.5px solid rgba(197,160,89,.18);}
.kt-term:last-child{border-bottom:0;}
.kt-head{display:flex;align-items:center;gap:10px;background:none;border:0;color:inherit;cursor:pointer;padding:0;width:100%;text-align:start;}
.kt-ar{font-size:1.2rem;}
.kt-translit{font-weight:600;}
.kt-short{margin:4px 0 0;opacity:.9;}
.kt-detail{margin-top:8px;}
.kt-long{margin:4px 0;opacity:.92;}
.kt-source{font-size:.74rem;opacity:.6;margin:4px 0;}
.kt-xlabel{font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em;opacity:.6;margin:8px 0 2px;}
.kt-xref{font-size:.82rem;opacity:.9;margin:2px 0;}
.kt-grade{font-size:.68rem;font-weight:700;padding:1px 6px;border-radius:999px;background:rgba(0,105,110,.14);}
.kt-empty{opacity:.6;margin:6px 0;}
</style>
```
(Add the copied `font-family:…;` into `.kt-ar{}`.)

- [ ] **Step 4: Script includes in `quran.html`**

After the Related Hadith includes (search `quran-related-hadith.js`), add:
```html
<script src="src/js/quran-vocab-core.js"></script>
<script src="src/js/quran-vocab.js"></script>
```

- [ ] **Step 5: Headless verification (fixture; do NOT commit)**

In the scratchpad dir (jsdom installed there — mirror `verify-related-hadith.mjs`), write `verify-vocab.mjs` that: loads `quran-vocab-core.js` then `quran-vocab.js` into jsdom; stubs `window.fetch` to return the 5 URLs — `terms.json` (2 terms: taqwa→[fear-of-allah], sabr→[patience,fear-of-allah]), `topic-terms.json`, `verse-index.json` (`{"2:153":["patience","fear-of-allah"]}`), a small `rvTopics`, `rhTopics`; builds card `<div id="a-2:153" data-key="2:153">` + panel `<div id="kt-2:153" class="kt-panel">`; calls `window.toggleKeyTerms('kt-2:153')`; asserts: 2 `.kt-term` chips, sorted Sabr before Taqwā; clicking `.kt-head` reveals `.kt-detail` with `.kt-long` + `.kt-source` + cross-ref `.kt-xref`; untagged `9:1` shows `.kt-empty`. Run it; all assertions pass. Paste output.

- [ ] **Step 6: Unit suite + commit**

Run: `node --test tests/quran/vocab-core.test.js` (expect 5 pass).
```bash
git add src/js/quran-vocab.js src/js/quran-verses.js quran.html
git commit -m "feat(vocab): Key Terms per-verse panel in the reader"
```

---

## Task 7: Docs + final verification

**Files:**
- Modify: `doc/DATA.md`, `doc/API-SPEC.md`, `doc/TASKS.md`

- [ ] **Step 1: Document the new static data + feature**

- `doc/DATA.md`: register `src/data/vocab/terms.json` + `topic-terms.json` — **generated** by `tools/vocab-build.mjs` from `tools/vocab/terms.source.json` (do not hand-edit generated files); each term carries a sourced definition; reuses the slice-1/2 taxonomy + related indexes for cross-refs. Give the term record shape.
- `doc/API-SPEC.md`: add a "Vocabulary (Key Terms — knowledge index slice 3)" client-direct note: static JSON, no `/api/` route, AI not involved, per-term sourced definitions, term→topic mapping reusing the shipped indexes. **State that D1 + FTS5 + `/api/index/*` are now DROPPED as unnecessary — the whole Knowledge Index ships as static JSON.**
- `doc/TASKS.md`: mark Vocabulary (slice 3) DONE; mark the Knowledge Index (all 3 slices) complete; update the deferred backlog (global glossary search, hadith-page cross-linking, disputed-grade handling, AI blurb, admin UI, contested-terms) and record that D1/FTS5/`/api/index/*` were dropped.

- [ ] **Step 2: Run the full core suite**

Run: `node --test tests/quran/vocab-core.test.js`
Expected: PASS (5 tests, 0 failures).

- [ ] **Step 3: Re-run the integrity check (Task 5 Step 5)**

Expected: `violations 0` then `OK`, exit 0.

- [ ] **Step 4: Commit**

```bash
git add doc/DATA.md doc/API-SPEC.md doc/TASKS.md
git commit -m "docs(vocab): register Vocabulary data files + Knowledge Index complete"
```

---

## Deferred-work ledger (after this slice — Knowledge Index complete)

- ⏳ **Global glossary term-search** (type any term → definition; net-new floating-search surface).
- ⏳ **Hadith-page cross-linking** (`hadith.html`).
- ⏳ **Disputed-grade handling** (`[GRADE DISPUTED]`).
- ⏳ **AI connecting-explanation blurb** (reuses `/api/ask-claude` guardrails + human-review gate).
- ⏳ **Web-based admin bulk-review UI**.
- ⏳ **Scale coverage** (more terms/tags via external references / staged suggestions).
- ⏳ **Contested / ruling-adjacent terms** (would need a review gate — out of this slice).
- ✅ **DROPPED as unnecessary:** D1 + FTS5 + `/api/index/*` — the Knowledge Index ships entirely as static JSON.
