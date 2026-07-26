# Search Slice 1: Qur'an Search Backend — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Ship `GET /api/quran/search?q=` returning real, sourced Qur'an verses (Arabic + Saheeh International edition 20), backed by an ingested static corpus scanned in the Worker with per-query KV cache.

**Architecture:** Node ingest → committed static JSON corpus → pure ESM search core (diacritic-insensitive) → Worker endpoint (module-global memo + KV cache), registered before the `/api/quran/` pending-stub. TDD for the core; integrity test for the corpus.

**Tech Stack:** Cloudflare Worker (`worker/`, ESM, `"type":"module"`), `node --test`, quran.com API v4.

**Conventions (verified against the codebase — follow exactly):**
- `worker/` is **ESM** (`"type":"module"`). All new `.js` files use `import`/`export`. **No `require`, no `module.exports`, no `__dirname`** (use `import.meta.url`).
- Worker-side core modules live in `worker/src/lib/` and use **named ESM exports** (pattern: `worker/src/lib/explain-core.js`). Tests use `import { … } from '../src/lib/…'` (pattern: `worker/test/explain-core.test.js`).
- Response/cache helpers: `json(data, origin, { status, maxAge })` from `worker/src/lib/cors.js`; `getJson(kv,key)`, `putJson(kv,key,value,ttlSeconds)`, `TTL` (`.HOUR`,`.DAY`) from `worker/src/lib/hadith-cache.js`. `hadith.js` defines local `ok`/`fail`/`posInt` — **replicate those locally in `quran-search.js`** (they are NOT exported):
  ```js
  function ok(data, source, origin, maxAge = 0) { return json({ ok: true, data, source }, origin, { maxAge }); }
  function fail(code, message, origin, status, retryable) { return json({ ok: false, error: { code, message, retryable }, source: 'fallback' }, origin, { status }); }
  function posInt(v) { const n = parseInt(v, 10); return Number.isInteger(n) && n > 0 ? n : null; }
  ```
- KV binding: `env.QURANLYAI_KV`.
- Router (`worker/src/index.js`, inside the GET block) has: `if (path.startsWith('/api/quran/') || PENDING.includes(path)) { return err(... 501); }`. The new branch goes **immediately before** it.
- `src/data/chapters.json` (repo root) holds surah metadata for English names.

---

## Task 1: Pure search core (TDD) — `worker/src/lib/quran-search-core.js`

**Files:**
- Create: `worker/src/lib/quran-search-core.js`
- Test: `worker/test/quran-search-core.test.js`

- [ ] **Step 1: Write failing tests** `worker/test/quran-search-core.test.js`:
```js
import { test } from 'node:test';
import assert from 'node:assert';
import { normalizeArabic, normalizeLatin, isArabic, tokenize, searchCorpus } from '../src/lib/quran-search-core.js';

const VERSES = [
  { verseKey:'1:1', surah:1, ayah:1, surahName:'Al-Fatihah', arabic:'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', translation:'In the name of Allah, the Entirely Merciful, the Especially Merciful.' },
  { verseKey:'2:255', surah:2, ayah:255, surahName:'Al-Baqarah', arabic:'ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ', translation:'Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence.' },
  { verseKey:'2:153', surah:2, ayah:153, surahName:'Al-Baqarah', arabic:'يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ ٱسْتَعِينُوا۟ بِٱلصَّبْرِ وَٱلصَّلَوٰةِ', translation:'O you who have believed, seek help through patience and prayer.' },
];

test('normalizeArabic strips diacritics and folds alef/ta-marbuta', () => {
  assert.strictEqual(normalizeArabic('ٱلرَّحْمَٰنِ'), normalizeArabic('الرحمن'));
  assert.strictEqual(/[ً-ْ]/.test(normalizeArabic('ٱلرَّحْمَٰنِ')), false); // no tashkeel left
});

test('isArabic detects script', () => {
  assert.strictEqual(isArabic('الرحمن'), true);
  assert.strictEqual(isArabic('mercy'), false);
});

test('tokenize splits normalized query', () => {
  assert.deepStrictEqual(tokenize('  Patience,  Prayer '), ['patience', 'prayer']);
});

test('Arabic query matches diacritic-insensitively', () => {
  const r = searchCorpus(VERSES, 'الرحمن', {});
  assert.strictEqual(r.total, 1);
  assert.strictEqual(r.results[0].verseKey, '1:1');
});

test('English query is case-insensitive and token-AND', () => {
  const r = searchCorpus(VERSES, 'Patience Prayer', {});
  assert.strictEqual(r.total, 1);
  assert.strictEqual(r.results[0].verseKey, '2:153');
});

test('non-match returns empty', () => {
  assert.strictEqual(searchCorpus(VERSES, 'zebra', {}).total, 0);
});

test('pagination slices and reports totals', () => {
  const r = searchCorpus(VERSES, 'merciful', { page:1, limit:1 });
  assert.strictEqual(r.total, 1);
  assert.strictEqual(r.totalPages, 1);
  assert.strictEqual(r.results.length, 1);
  const beyond = searchCorpus(VERSES, 'Allah', { page:9, limit:1 });
  assert.strictEqual(beyond.results.length, 0);
  assert.ok(beyond.total >= 1);
});
```

- [ ] **Step 2: Run — expect FAIL** (module not found): `cd worker && node --test test/quran-search-core.test.js`

- [ ] **Step 3: Implement** `worker/src/lib/quran-search-core.js` (unicode escapes only — no literal combining marks):
```js
/* IslamicInfo.org — quran-search-core.js
   Pure, diacritic-insensitive Qur'an keyword search over an ingested corpus.
   No I/O. ESM named exports (tested directly; imported by quran-search.js). */

// tashkeel + superscript alef + quranic annotation signs + tatweel
const AR_DIACRITICS = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g;
const AR_COMBINING  = /[̀-ͯ]/g;

export function normalizeArabic(s) {
  return String(s == null ? '' : s)
    .replace(AR_DIACRITICS, '')
    .replace(/[آأإٱ]/g, 'ا') // آأإٱ → ا
    .replace(/ة/g, 'ه')                     // ة → ه
    .replace(/ى/g, 'ي')                     // ى → ي
    .replace(/[ؤئ]/g, 'ء')             // ؤئ → ء
    .replace(/\s+/g, ' ').trim();
}

export function normalizeLatin(s) {
  return String(s == null ? '' : s)
    .normalize('NFD').replace(AR_COMBINING, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

export function isArabic(s) { return /[؀-ۿ]/.test(String(s || '')); }

function normalizeQuery(s) { return isArabic(s) ? normalizeArabic(s) : normalizeLatin(s); }

export function tokenize(s) { return normalizeQuery(s).split(' ').filter(Boolean); }

export function searchCorpus(verses, q, opts) {
  opts = opts || {};
  const page = opts.page > 0 ? Math.floor(opts.page) : 1;
  const limit = opts.limit > 0 ? Math.min(Math.floor(opts.limit), 50) : 20;
  const arabicQuery = isArabic(q);
  const tokens = tokenize(q);
  const norm = normalizeQuery(q);
  const matches = [];
  if (tokens.length) {
    for (const v of verses) {
      const hay = arabicQuery ? normalizeArabic(v.arabic) : normalizeLatin(v.translation);
      let all = true;
      for (const t of tokens) { if (hay.indexOf(t) === -1) { all = false; break; } }
      if (all) matches.push({ v, score: hay.indexOf(norm) !== -1 ? 2 : 1 });
    }
    matches.sort((a, b) =>
      b.score !== a.score ? b.score - a.score
      : a.v.surah !== b.v.surah ? a.v.surah - b.v.surah
      : a.v.ayah - b.v.ayah);
  }
  const total = matches.length;
  const totalPages = total ? Math.ceil(total / limit) : 0;
  const start = (page - 1) * limit;
  return { total, page, totalPages, limit, results: matches.slice(start, start + limit).map(m => m.v) };
}
```

- [ ] **Step 4: Run — expect PASS**: `cd worker && node --test test/quran-search-core.test.js`

- [ ] **Step 5: Commit**
```bash
git add worker/src/lib/quran-search-core.js worker/test/quran-search-core.test.js
git commit -m "feat(quran-search): pure diacritic-insensitive search core + tests"
```
(append `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`)

---

## Task 2: Ingest script — `worker/scripts/ingest-quran-corpus.mjs`

**Files:**
- Create: `worker/scripts/ingest-quran-corpus.mjs`
- Produces: `src/data/quran/search-corpus.json`

- [ ] **Step 1: Write the script** (ESM; uses `import.meta.url`, not `__dirname`):
```js
/* Ingest the full Qur'an search corpus from quran.com API v4.
   Arabic = text_uthmani; English = translation edition 20 (Saheeh International, pinned).
   Reproducible. Run: node worker/scripts/ingest-quran-corpus.mjs
   Writes <repo>/src/data/quran/search-corpus.json */
import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const EDITION_ID = 20;                 // Saheeh International (pinned)
const EDITION_NAME = 'Saheeh International';
const API = 'https://api.quran.com/api/v4/verses/by_chapter';
const __dir = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dir, '../../src/data/quran/search-corpus.json');
const CHAPTERS = resolve(__dir, '../../src/data/chapters.json');

const stripHtml = (s) => String(s || '').replace(/<sup[^>]*>.*?<\/sup>/gis, '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

async function loadSurahNames() {
  try {
    const raw = JSON.parse(await readFile(CHAPTERS, 'utf8'));
    const list = Array.isArray(raw) ? raw : (raw.chapters || []);
    const map = {};
    for (const c of list) {
      const id = c.id || c.chapter_number || c.number;
      const name = c.name_simple || c.nameSimple || c.englishName || c.name || ('Surah ' + id);
      if (id) map[id] = name;
    }
    return map;
  } catch { return {}; }
}

async function fetchChapter(id) {
  const out = [];
  let page = 1, totalPages = 1;
  do {
    const url = `${API}/${id}?language=en&fields=text_uthmani&translations=${EDITION_ID}&per_page=300&page=${page}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(`chapter ${id} p${page} HTTP ${r.status}`);
    const j = await r.json();
    for (const v of j.verses) {
      const tr = (v.translations && v.translations[0] && v.translations[0].text) || '';
      out.push({ verseKey: v.verse_key, surah: id, ayah: v.verse_number, arabic: v.text_uthmani, translation: stripHtml(tr) });
    }
    totalPages = (j.pagination && j.pagination.total_pages) || 1;
    page++;
  } while (page <= totalPages);
  return out;
}

async function main() {
  const names = await loadSurahNames();
  const verses = [];
  for (let id = 1; id <= 114; id++) {
    const rows = await fetchChapter(id);
    for (const row of rows) row.surahName = names[id] || ('Surah ' + id);
    verses.push(...rows);
    process.stderr.write(`surah ${id}: ${rows.length} (total ${verses.length})\n`);
  }
  if (verses.length !== 6236) throw new Error(`expected 6236 verses, got ${verses.length} — aborting write`);
  const doc = { meta: { source: 'quran.com API v4', arabicField: 'text_uthmani',
    translationEditionId: EDITION_ID, translationEditionName: EDITION_NAME,
    fetchedAt: new Date().toISOString(), verseCount: verses.length, schema: 1 }, verses };
  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(doc));
  process.stderr.write(`WROTE ${OUT} — ${verses.length} verses, ${(JSON.stringify(doc).length/1e6).toFixed(2)} MB\n`);
}
main().catch((e) => { process.stderr.write('INGEST FAILED: ' + e.message + '\n'); process.exit(1); });
```

- [ ] **Step 2: Run the ingest** (needs outbound network): `node worker/scripts/ingest-quran-corpus.mjs`
Expected: per-surah stderr lines, then `WROTE …/search-corpus.json — 6236 verses, ~2-3 MB`.
**If outbound network is blocked in this environment:** STOP and report BLOCKED with the exact command for the human to run where network exists. **Never hand-write or model-generate verse text** — it violates the no-fabrication invariant. Tasks 3–5 that depend on the corpus then wait; Task 1 (core) is already independently proven.

- [ ] **Step 3: Sanity-check**:
```bash
node -e "const d=require('./src/data/quran/search-corpus.json');console.log(d.meta);console.log('verses',d.verses.length);const a=d.verses.find(v=>v.verseKey==='1:1');console.log(a.arabic.slice(0,20),'|',a.translation.slice(0,30));console.log('2:255 tr:',d.verses.find(v=>v.verseKey==='2:255').translation.slice(0,25))"
```
(Root has no `package.json`, so plain `node -e` with a relative `require` of a JSON file works from repo root.) Expected: `verseCount:6236`, both fields non-empty, 2:255 begins "Allah - there is no deity".

- [ ] **Step 4: Commit**
```bash
git add worker/scripts/ingest-quran-corpus.mjs src/data/quran/search-corpus.json
git commit -m "feat(quran-search): ingest script + committed corpus (quran.com v4, edition 20)"
```

---

## Task 3: Corpus integrity test — `worker/test/quran-corpus.test.js`

**Files:**
- Create: `worker/test/quran-corpus.test.js`

- [ ] **Step 1: Write the test** (ESM; `import.meta.url` for path):
```js
import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const CORPUS = resolve(dirname(fileURLToPath(import.meta.url)), '../../src/data/quran/search-corpus.json');

test('quran corpus: 6236 sourced verses, edition 20, no empties', (t) => {
  if (!existsSync(CORPUS)) { t.skip('corpus not ingested yet (run worker/scripts/ingest-quran-corpus.mjs)'); return; }
  const d = JSON.parse(readFileSync(CORPUS, 'utf8'));
  assert.strictEqual(d.meta.translationEditionId, 20);
  assert.strictEqual(d.meta.verseCount, 6236);
  assert.strictEqual(d.verses.length, 6236);
  for (const v of d.verses) {
    assert.ok(v.verseKey && /^\d+:\d+$/.test(v.verseKey), 'verseKey ' + v.verseKey);
    assert.ok(v.arabic && v.arabic.trim().length, 'arabic empty at ' + v.verseKey);
    assert.ok(v.translation && v.translation.trim().length, 'translation empty at ' + v.verseKey);
  }
});
```

- [ ] **Step 2: Run** `cd worker && node --test test/quran-corpus.test.js` — PASS if corpus present (must PASS if Task 2 ran), SKIP if absent.

- [ ] **Step 3: Commit**
```bash
git add worker/test/quran-corpus.test.js
git commit -m "test(quran-search): corpus integrity (6236 verses, edition 20, no empties)"
```

---

## Task 4: Worker endpoint — `GET /api/quran/search`

**Files:**
- Create: `worker/src/quran-search.js`
- Modify: `worker/src/index.js`

- [ ] **Step 1: Create** `worker/src/quran-search.js`:
```js
/* GET /api/quran/search?q=&page=&limit= — keyword search over the ingested corpus.
   Corpus is a static Pages asset; loaded once per isolate (module-global memo),
   per-query results cached in KV. No upstream call at query time. */
import { json } from './lib/cors.js';
import { getJson, putJson, TTL } from './lib/hadith-cache.js';
import { isArabic, normalizeArabic, normalizeLatin, searchCorpus } from './lib/quran-search-core.js';

const DEFAULT_CORPUS_URL = 'https://islamicinfo.org/src/data/quran/search-corpus.json';
let CORPUS = null; // module-global memo, reused across requests on a warm isolate

function ok(data, source, origin, maxAge = 0) { return json({ ok: true, data, source }, origin, { maxAge }); }
function fail(code, message, origin, status, retryable) { return json({ ok: false, error: { code, message, retryable }, source: 'fallback' }, origin, { status }); }
function posInt(v) { const n = parseInt(v, 10); return Number.isInteger(n) && n > 0 ? n : null; }

async function loadCorpus(env) {
  if (CORPUS) return CORPUS;
  const url = (env && env.QURAN_CORPUS_URL) || DEFAULT_CORPUS_URL;
  const r = await fetch(url);
  if (!r.ok) throw new Error('corpus HTTP ' + r.status);
  const doc = await r.json();
  CORPUS = { verses: doc.verses || [], meta: doc.meta || {} };
  return CORPUS;
}

export async function handleQuranSearch(searchParams, env, origin) {
  const q = (searchParams.get('q') || '').trim();
  if (q.length < 2) return fail('bad_query', 'search query must be at least 2 characters', origin, 400, false);
  if (q.length > 100) return fail('bad_query', 'search query too long (max 100 chars)', origin, 400, false);
  const page = posInt(searchParams.get('page')) || 1;
  const limit = Math.min(posInt(searchParams.get('limit')) || 20, 50);

  const kv = env.QURANLYAI_KV;
  const norm = isArabic(q) ? normalizeArabic(q) : normalizeLatin(q);
  const cacheKey = `qsearch:${page}:${limit}:${norm}`;
  if (kv) { const hit = await getJson(kv, cacheKey); if (hit) return ok(hit, 'cache', origin, 0); }

  let corpus;
  try { corpus = await loadCorpus(env); }
  catch (_) { return fail('corpus_unavailable', "Qur'an search temporarily unavailable", origin, 503, true); }

  const r = searchCorpus(corpus.verses, q, { page, limit });
  const data = { query: q, page: r.page, totalPages: r.totalPages, total: r.total, results: r.results,
    source: corpus.meta.source || 'quran.com API v4',
    edition: (corpus.meta.translationEditionName || 'Saheeh International') + ' (' + (corpus.meta.translationEditionId || 20) + ')' };
  if (kv) await putJson(kv, cacheKey, data, TTL.HOUR);
  return ok(data, 'live', origin, TTL.HOUR);
}
```

- [ ] **Step 2: Wire the route in `worker/src/index.js`.** Add near the other handler imports (~line 25): `import { handleQuranSearch } from './quran-search.js';`. Then inside the GET handling, **immediately before** the line `if (path.startsWith('/api/quran/') || PENDING.includes(path)) {`, insert:
```js
        if (path === '/api/quran/search') {
          const res = await handleQuranSearch(url.searchParams, env, origin);
          if (res.status === 200) await cache.put(request, res.clone());
          return res;
        }
```
Verify this sits inside the same `if (request.method === 'GET' ...)`/`try` scope where `cache`, `url`, `origin`, `env` are in scope (same scope the `/api/hadith` branch uses). If the GET-guard structure differs, place it alongside the `/api/hadith` branch.

- [ ] **Step 3: Advertise it** in the root manifest (`path === '/' || path === '/api'` response): add `'/api/quran/search'` to the `live` array.

- [ ] **Step 4: Full regression** `cd worker && npm test` — expect all prior tests + Task 1 + Task 3 green.

- [ ] **Step 5: Smoke (only if `wrangler dev` + network available; else defer to deploy and note it).** Point the corpus at the committed file via env (e.g. run a static server for `src/data/...` and set `QURAN_CORPUS_URL`), then:
```bash
curl -s 'http://127.0.0.1:8787/api/quran/search?q=patience' | head -c 300
curl -s 'http://127.0.0.1:8787/api/quran/search?q=a' -o /dev/null -w '%{http_code}\n'   # expect 400
curl -s 'http://127.0.0.1:8787/api/quran/foo' -o /dev/null -w '%{http_code}\n'          # expect 501 (still pending)
```

- [ ] **Step 6: Commit**
```bash
git add worker/src/quran-search.js worker/src/index.js
git commit -m "feat(quran-search): GET /api/quran/search endpoint (corpus memo + KV cache)"
```

---

## Task 5: DECISION entries — `docs/DECISIONS.md`

**Files:**
- Modify: `docs/DECISIONS.md`

- [ ] **Step 1: Read the tail** of `docs/DECISIONS.md` for the ADR numbering/format.
- [ ] **Step 2: Append two ADRs** (next sequential numbers, matching heading style):
  1. **Qur'an search corpus source** — quran.com API v4; Arabic `text_uthmani`; English edition **20 (Saheeh International)**, pinned in `ingest-quran-corpus.mjs` (`EDITION_ID`) for reproducibility. Rationale: consistency with the existing Qur'an display module; verse text is ingested/sourced, never model-generated; attribution stored in corpus `meta`.
  2. **Qur'an search storage** — static JSON corpus scanned in the Worker (module-global memo) + per-query KV cache. **D1 + FTS5 = designated upgrade path** if corpus size/quality demands. Rationale: matches existing Worker+KV+static-JSON patterns; no new binding.
- [ ] **Step 3: Commit**
```bash
git add docs/DECISIONS.md
git commit -m "docs(decisions): log Qur'an search corpus source + storage ADRs"
```

---

## Self-review notes
- **ESM throughout** (verified `worker` is `"type":"module"`; tests + core + handler all `import`/`export`). Core placed in `worker/src/lib/` beside `explain-core.js`.
- **Spec coverage:** ingest+pinned edition (T2), diacritic-insensitive core (T1), endpoint+KV+route-before-stub (T4), integrity (T3), DECISIONs (T5).
- **No-fabrication:** verse text only from ingest (T2); network-blocked → BLOCKED, never hand-authored; integrity test (T3) enforces provenance shape.
- **Helper scoping resolved:** `quran-search.js` imports `json`/`getJson`/`putJson`/`TTL` from real modules and defines local `ok`/`fail`/`posInt` (mirroring `hadith.js`); `index.js` calls `handleQuranSearch(url.searchParams, env, origin)` with no helper injection.
- **Name consistency:** core exports `normalizeArabic/normalizeLatin/isArabic/tokenize/searchCorpus` used identically in T1 + T4; KV prefix `qsearch:`; response fields `query,page,totalPages,total,results,source,edition`.
- **Interop caveat:** `import searchCore` style avoided — core is native ESM named exports, so no CJS/ESM interop risk.
