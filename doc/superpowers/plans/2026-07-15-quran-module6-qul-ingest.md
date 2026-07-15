# Module 6 — QUL Reciter Ingest Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`).

**Goal:** A build-time pipeline to add QUL word-segmented reciters to the picker via static-hosted timing JSON, plugged into Module 3's `AudioSource` seam. Ships with an EMPTY manifest (no fabricated/copyrighted data); operator ingests licensed reciters later.

**Architecture:** Pure transform in `quran-qul-core.js` (UMD, node:test). Operator CLI `tools/qul-ingest.mjs`. Runtime `QulAudioSource` + `CompositeAudioSource` added to `quran-audio.js`; QUL reciter ids offset +1,000,000 (collision-free, numeric). Static data at `src/data/qul/`.

**Spec:** `doc/superpowers/specs/2026-07-15-quran-module6-qul-ingest-design.md`. Read first.

---

### Task 1: Pure core `quran-qul-core.js` + tests (TDD)

**Files:** Create `src/js/quran-qul-core.js`; Test `tests/quran/qul-core.test.js`.

- [ ] **Step 1: Write failing test** — `tests/quran/qul-core.test.js`:

```js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const core = require('../../src/js/quran-qul-core.js');

test('id offset / detect / roundtrip', () => {
  assert.equal(core.QUL_OFFSET, 1000000);
  assert.equal(core.offsetId(406), 1000406);
  assert.equal(core.baseId(1000406), 406);
  assert.equal(core.isQulId(1000406), true);
  assert.equal(core.isQulId(7), false);
  assert.equal(core.isQulId('1000406'), true);
});
test('parseQulAyah tolerates field-name variants', () => {
  assert.deepEqual(core.parseQulAyah({ surah: 1, ayah: 2, audio_url: 'u', segments: [[1,0,5]] }),
    { surah: 1, ayah: 2, url: 'u', segments: [[1,0,5]] });
  assert.deepEqual(core.parseQulAyah({ sura_number: 3, verse_number: 4, audio: { url: 'a', segments: [[1,0,5]] } }),
    { surah: 3, ayah: 4, url: 'a', segments: [[1,0,5]] });
  assert.deepEqual(core.parseQulAyah({ chapter: 2, ayah_number: 5, url: 'z', segments: [] }),
    { surah: 2, ayah: 5, url: 'z', segments: [] });
});
test('qulSegments maps 3-tuple / 4-tuple / object; drops bad', () => {
  assert.deepEqual(core.qulSegments([[1, 0, 500], [2, 500, 900]]),
    [{ word: 1, start: 0, end: 500 }, { word: 2, start: 500, end: 900 }]);
  assert.deepEqual(core.qulSegments([[0, 2, 100, 400]]), [{ word: 2, start: 100, end: 400 }]); // 4-tuple
  assert.deepEqual(core.qulSegments([{ word: 3, start: 10, end: 20 }]), [{ word: 3, start: 10, end: 20 }]);
  assert.deepEqual(core.qulSegments('nope'), []);
});
test('toAyahAudio builds verse_key + segments; null on missing', () => {
  assert.deepEqual(core.toAyahAudio({ surah: 1, ayah: 1, audio_url: 'u', segments: [[1,0,9]] }),
    { verse_key: '1:1', url: 'u', segments: [{ word: 1, start: 0, end: 9 }] });
  assert.equal(core.toAyahAudio({ ayah: 1, audio_url: 'u' }), null);
});
test('groupBySurah groups + sorts by ayah', () => {
  const g = core.groupBySurah([
    { surah: 1, ayah: 2, audio_url: 'b', segments: [] },
    { surah: 1, ayah: 1, audio_url: 'a', segments: [] },
    { surah: 2, ayah: 1, audio_url: 'c', segments: [] },
  ]);
  assert.deepEqual(Object.keys(g).sort(), ['1', '2']);
  assert.deepEqual(g['1'].map(a => a.verse_key), ['1:1', '1:2']);
  assert.equal(g['2'][0].url, 'c');
});
```

- [ ] **Step 2: Run, verify FAIL** — `node --test tests/quran/qul-core.test.js`.

- [ ] **Step 3: Implement `src/js/quran-qul-core.js`:**

```js
/* Module 6 — QUL ingest pure core (DOM-free, UMD). */
(function (root, factory) {
  var mod = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = mod;
  (root.II = root.II || {}).qulCore = mod;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var QUL_OFFSET = 1000000;
  function isQulId(id) { return Number(id) >= QUL_OFFSET; }
  function offsetId(qulId) { return QUL_OFFSET + Number(qulId); }
  function baseId(offset) { return Number(offset) - QUL_OFFSET; }

  function firstDefined() { for (var i = 0; i < arguments.length; i++) { if (arguments[i] != null) return arguments[i]; } return undefined; }

  function parseQulAyah(raw) {
    raw = raw || {};
    var audioObj = (raw.audio && typeof raw.audio === 'object') ? raw.audio : null;
    var surah = firstDefined(raw.surah, raw.sura_number, raw.chapter, raw.chapter_id);
    var ayah = firstDefined(raw.ayah, raw.ayah_number, raw.verse_number, raw.verse);
    var url = firstDefined(raw.audio_url, (typeof raw.audio === 'string' ? raw.audio : undefined), raw.url, (audioObj ? audioObj.url : undefined), '');
    var segments = firstDefined(raw.segments, (audioObj ? audioObj.segments : undefined), []);
    return { surah: Number(surah), ayah: Number(ayah), url: String(url || ''), segments: segments };
  }

  function qulSegments(raw) {
    if (!Array.isArray(raw)) return [];
    return raw.map(function (s) {
      if (Array.isArray(s)) {
        if (s.length >= 4) return { word: s[1], start: s[2], end: s[3] };
        return { word: s[0], start: s[1], end: s[2] };
      }
      return s ? { word: s.word, start: s.start, end: s.end } : null;
    }).filter(function (x) { return x && x.start != null && x.end != null; });
  }

  function toAyahAudio(raw) {
    var p = parseQulAyah(raw);
    if (!p.surah || !p.ayah) return null;
    return { verse_key: p.surah + ':' + p.ayah, url: p.url, segments: qulSegments(p.segments) };
  }

  function groupBySurah(rawAyahs) {
    var out = {};
    (rawAyahs || []).forEach(function (r) {
      var a = toAyahAudio(r);
      if (!a) return;
      var s = a.verse_key.split(':')[0];
      (out[s] = out[s] || []).push(a);
    });
    Object.keys(out).forEach(function (s) {
      out[s].sort(function (a, b) { return Number(a.verse_key.split(':')[1]) - Number(b.verse_key.split(':')[1]); });
    });
    return out;
  }

  return {
    QUL_OFFSET: QUL_OFFSET, isQulId: isQulId, offsetId: offsetId, baseId: baseId,
    parseQulAyah: parseQulAyah, qulSegments: qulSegments, toAyahAudio: toAyahAudio, groupBySurah: groupBySurah
  };
});
```

- [ ] **Step 4: Run, verify PASS** — `node --test tests/quran/qul-core.test.js` (5 tests).

- [ ] **Step 5: Commit** — `git add src/js/quran-qul-core.js tests/quran/qul-core.test.js && git commit -m "feat(quran-m6): QUL ingest pure core + unit tests"`

---

### Task 2: Ingest CLI + empty manifest + README

**Files:** Create `tools/qul-ingest.mjs`, `src/data/qul/reciters.json`, `src/data/qul/README.md`.

- [ ] **Step 1: `src/data/qul/reciters.json`** — exactly: `[]`

- [ ] **Step 2: `tools/qul-ingest.mjs`:**

```js
#!/usr/bin/env node
/* Module 6 — QUL ingest CLI (operator-run).
   Usage: node tools/qul-ingest.mjs --in <export.json> --id <qulReciterId> --name "<name>" [--style "<style>"]
   Transforms a QUL ayah-by-ayah export into static per-surah AyahAudio JSON under src/data/qul/. */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const core = require('../src/js/quran-qul-core.js');

function arg(name, def) { const i = process.argv.indexOf('--' + name); return (i !== -1 && process.argv[i + 1]) ? process.argv[i + 1] : def; }

const inFile = arg('in'), qulId = arg('id'), name = arg('name'), style = arg('style', '');
if (!inFile || !qulId || !name) {
  console.error('Usage: node tools/qul-ingest.mjs --in <export.json> --id <qulReciterId> --name "<name>" [--style "<style>"]');
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(inFile, 'utf8'));
const ayahs = Array.isArray(raw) ? raw : (raw.ayahs || raw.data || raw.segments || []);
const grouped = core.groupBySurah(ayahs);
const offset = core.offsetId(qulId);
const outDir = path.join('src', 'data', 'qul', String(offset));
fs.mkdirSync(outDir, { recursive: true });

let surahCount = 0, ayahCount = 0;
for (const surah of Object.keys(grouped)) {
  fs.writeFileSync(path.join(outDir, surah + '.json'), JSON.stringify(grouped[surah]));
  surahCount++; ayahCount += grouped[surah].length;
}

const manifestPath = path.join('src', 'data', 'qul', 'reciters.json');
let manifest = [];
try { manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')); } catch (_) {}
manifest = manifest.filter((r) => r.id !== offset);
manifest.push({ id: offset, name, style });
manifest.sort((a, b) => a.id - b.id);
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

console.log(`Ingested "${name}" (QUL ${qulId} -> id ${offset}): ${surahCount} surahs, ${ayahCount} ayahs -> ${outDir}`);
console.log(`Manifest: ${manifestPath} (${manifest.length} QUL reciters)`);
console.log('REMINDER: confirm this reciter\'s QUL license permits redistribution AND that the audio URLs are hotlinkable before committing/pushing.');
```

- [ ] **Step 3: `src/data/qul/README.md`** — document: the id-offset scheme; the expected QUL export shape (ayah-by-ayah records with surah/ayah/audio-url/segments `[idx,startMs,endMs]`); the CLI usage; the file layout (`{offsetId}/{surahId}.json`); and the **operator gate**: (a) clear the reciter's QUL license (per-resource — some are restricted/attribution), (b) confirm audio URLs are hotlinkable (we host only timing JSON, audio streams from the export's URL), (c) scripture audio → attribution + 🕌 review before treating live (parity with Module 3). Keep it concise and operational.

- [ ] **Step 4: Verify the CLI on a synthetic fixture (scratchpad — do NOT pollute the repo).** Write `<scratchpad>/qul-sample.json` with 2 surahs of synthetic ayah records (fake urls + `[[1,0,500],[2,500,900]]` segments). Run from a temp copy or with a temp `--out`-less run then INSPECT + REVERT: simplest is to run it, confirm `src/data/qul/1000999/1.json` + `2.json` + manifest entry appear with the right shape, then `git checkout -- src/data/qul/reciters.json && rm -rf src/data/qul/1000999`. Confirm the generated `1.json` is `[{verse_key, url, segments:[{word,start,end}]}]`. (Nothing from this step is committed except the tool/README/empty-manifest.)

- [ ] **Step 5: Commit** — `git add tools/qul-ingest.mjs src/data/qul/reciters.json src/data/qul/README.md && git commit -m "feat(quran-m6): QUL ingest CLI + empty manifest + operator README"`

---

### Task 3: Runtime sources in `quran-audio.js`

**Files:** Edit `src/js/quran-audio.js`.

- [ ] **Step 1: Add** `QulAudioSource` + `CompositeAudioSource` immediately after the `QuranComAudioSource` definitions (i.e. after `finish()` at ~line 64, before `// ---- state ----`):

```js
  // ---- pluggable source: QUL (static-hosted timing JSON) ----
  var QUL_BASE = 'src/data/qul/';
  var qulCore = window.II && window.II.qulCore;
  var WEEK = 7 * 24 * 3600 * 1000;
  function QulAudioSource() {}
  QulAudioSource.prototype.listReciters = function () {
    var key = 'ii-qul-reciters';
    var c = readCache(key);
    if (c && Array.isArray(c.data) && core.isFresh(c.fetchedAt, Date.now(), WEEK)) return Promise.resolve(c.data);
    var ctrl = new AbortController(); var t = setTimeout(function () { ctrl.abort(); }, 8000);
    return fetch(QUL_BASE + 'reciters.json', { signal: ctrl.signal })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (list) { list = Array.isArray(list) ? list : []; writeCache(key, { fetchedAt: Date.now(), data: list }); return list; })
      .catch(function () { return []; })
      .finally(function () { clearTimeout(t); });
  };
  QulAudioSource.prototype.getSurahAudio = function (reciterId, surahId) {
    var key = 'ii-qul-audio-' + reciterId + '-' + surahId;
    var c = readCache(key);
    if (c && Array.isArray(c.ayahs) && core.isFresh(c.fetchedAt, Date.now(), WEEK)) return Promise.resolve(c.ayahs);
    var ctrl = new AbortController(); var t = setTimeout(function () { ctrl.abort(); }, 8000);
    return fetch(QUL_BASE + reciterId + '/' + surahId + '.json', { signal: ctrl.signal })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (ayahs) { ayahs = Array.isArray(ayahs) ? ayahs : []; writeCache(key, { fetchedAt: Date.now(), ayahs: ayahs }); return ayahs; })
      .catch(function () { return []; })
      .finally(function () { clearTimeout(t); });
  };

  // ---- composite: Quran.com + QUL ----
  function CompositeAudioSource(primary, qul) { this.primary = primary; this.qul = qul; }
  CompositeAudioSource.prototype.listReciters = function () {
    var p = this.primary.listReciters().catch(function () { return []; });
    var q = this.qul.listReciters().catch(function () { return []; });
    return Promise.all([p, q]).then(function (r) { return (r[0] || []).concat(r[1] || []); });
  };
  CompositeAudioSource.prototype.getSurahAudio = function (reciterId, surahId) {
    if (qulCore && qulCore.isQulId(reciterId)) return this.qul.getSurahAudio(reciterId, surahId);
    return this.primary.getSurahAudio(reciterId, surahId);
  };
```

- [ ] **Step 2: Swap the source** — change the existing `var source = new QuranComAudioSource();` (line ~67) to:

```js
  var source = new CompositeAudioSource(new QuranComAudioSource(), new QulAudioSource());
```

- [ ] **Step 3: Syntax check** — `node --check src/js/quran-audio.js` → clean.

- [ ] **Step 4: Commit** — `git add src/js/quran-audio.js && git commit -m "feat(quran-m6): QulAudioSource + CompositeAudioSource; route picker by id"`

---

### Task 4: Wire include + runtime jsdom verification

**Files:** Edit `quran.html`; verify via scratchpad harness (NOT committed).

- [ ] **Step 1: Add include** — in `quran.html`, immediately after line 3206 (`<script src="src/js/quran-audio-core.js"></script>`) and BEFORE `quran-audio.js`, add:

```html
<script src="src/js/quran-qul-core.js"></script>
```

- [ ] **Step 2: jsdom harness** at `<scratchpad>/verify-qul.mjs` (model on existing `verify-*.mjs`). Stub `window.fetch` to serve: `src/data/qul/reciters.json` → a manifest `[{id:1000406,name:'Abdul Basit',style:'Murattal'}]`; `src/data/qul/1000406/1.json` → `[{verse_key:'1:1',url:'u',segments:[{word:1,start:0,end:9}]}]`; the Quran.com reciters URL → `{recitations:[{id:7,reciter_name:'Alafasy',style:'Murattal'}]}`; the Quran.com verses URL → a minimal `{verses:[{verse_key:'1:1',audio:{url:'q',segments:[[0,1,0,9]]}}],pagination:{total_pages:1}}`; unknown → 404. Inject `quran-audio-core.js` + `quran-qul-core.js` + `quran-audio.js`; dispatch `DOMContentLoaded`. Access the composite via `window.II.quranAudio.source`. Assert:
  - `source.listReciters()` → contains BOTH id 7 (Alafasy) and id 1000406 (Abdul Basit).
  - `source.getSurahAudio(1000406, 1)` → the QUL ayah (`url:'u'`, segment word 1); fetched from `src/data/qul/1000406/1.json`.
  - `source.getSurahAudio(7, 1)` → routed to Quran.com (url from the verses stub).
  - QUL 404 (`getSurahAudio(1000999, 1)`) → `[]`, no throw.
  - **Empty-manifest parity:** re-run with `reciters.json` → `[]` → `listReciters()` returns ONLY id 7 (Module 3 unchanged).
  - zero console errors.

- [ ] **Step 3: Run** — `node <scratchpad>/verify-qul.mjs` → `RESULT: N passed, 0 failed`. Iterate until green.

- [ ] **Step 4: Commit** — `git add quran.html && git commit -m "feat(quran-m6): include quran-qul-core.js before quran-audio.js"`

---

### Task 5: Docs — DATA.md + ADR-017

**Files:** Edit `doc/DATA.md`, `doc/DECISIONS.md`.

- [ ] **Step 1: `doc/DATA.md`** — add rows: `ii-qul-reciters` → `{fetchedAt:number, data:Reciter[]}` (7d); `ii-qul-audio-{reciter}-{surah}` → `{fetchedAt:number, ayahs:AyahAudio[]}` (7d). Add a short note on the static file layout `src/data/qul/reciters.json` + `src/data/qul/{offsetId}/{surahId}.json` and the +1,000,000 id-offset scheme.

- [ ] **Step 2: `doc/DECISIONS.md`** — ADR-017: "QUL reciter ingest = static-hosted timing JSON + offset ids". Context (QUL: no API, per-resource licensing, bulk download). Decision (build-time ingest CLI → static JSON on Pages; QUL ids offset +1e6; `CompositeAudioSource` routes by id; ships empty manifest = zero fabricated data; audio hotlinked from export URLs, only timing JSON hosted; no binding = no RULE-7). Consequences (operator clears license + downloads + ingests per reciter; picker grows automatically; per-reciter 🕌/attribution gate documented in README; future migration to KV/R2 possible if repo grows).

- [ ] **Step 3: Commit** — `git add doc/DATA.md doc/DECISIONS.md && git commit -m "docs(quran-m6): register ii-qul-* keys + ADR-017 QUL ingest"`

---

## Final review

Adversarial pass over `git diff main...HEAD`: (a) EMPTY-manifest parity — Module 3 behavior byte-identical when no QUL reciters; (b) id-offset collision-free + numeric (persistence unbroken); (c) all QUL fetches fail-graceful to `[]` (no throw, no console error); (d) qulCore transforms tolerant + correct segment mapping; (e) ingest CLI writes correct shape + upserts manifest + prints the licensing reminder; (f) NO copyrighted/fabricated data committed (manifest is `[]`, no reciter dirs); (g) README documents the per-reciter license + 🕌 gate; (h) only 1 script include added to quran.html, no CSS. Then finish via superpowers:finishing-a-development-branch.
