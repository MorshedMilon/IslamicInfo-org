# Search Slice 2: Dua Search Backend — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans. Steps use `- [ ]`.

**Goal:** Ship `GET /api/dua/search?q=` returning real, sourced Hisn al-Muslim duas (Arabic + transliteration + English + category), backed by an ingested static corpus scanned in the Worker with per-query KV cache.

**Architecture:** Node ingest from `wafaaelmaandy/Hisn-Muslim-Json` → committed static JSON corpus → pure ESM dua-search core that **reuses** the Slice-1 normalizers → Worker endpoint (module-global memo + KV cache) registered in the GET block. TDD for the core; integrity test for the corpus. Mirrors the shipped Slice-1 Qur'an pattern exactly.

**Tech Stack:** Cloudflare Worker (`worker/`, ESM), `node --test`.

**Conventions (verified in Slice 1 — follow):**
- `worker/` is ESM. `import`/`export` only; `import.meta.url` not `__dirname`.
- Helpers: `json(data,origin,{status,maxAge})` from `./lib/cors.js`; `getJson`/`putJson`/`TTL` from `./lib/hadith-cache.js`; replicate local `ok`/`fail`/`posInt` (copy from `worker/src/quran-search.js`).
- KV binding `env.QURANLYAI_KV`.
- Route: add inside the GET block **next to the `/api/quran/search` branch** (that block is where `cache` is in scope — line ~205 of `index.js`). Do NOT place it after the GET block.
- Reference implementation: `worker/src/quran-search.js`, `worker/src/lib/quran-search-core.js`, `worker/scripts/ingest-quran-corpus.mjs` — read them; this slice is the same shape.

---

## Task 1: Pure dua-search core (TDD) — `worker/src/lib/dua-search-core.js`

**Files:** Create `worker/src/lib/dua-search-core.js`; Test `worker/test/dua-search-core.test.js`

- [ ] **Step 1: failing test** `worker/test/dua-search-core.test.js`:
```js
import { test } from 'node:test';
import assert from 'node:assert';
import { searchDuas } from '../src/lib/dua-search-core.js';

const DUAS = [
  { id:'1:1', category:'Supplications for when you wake up', arabic:'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا', transliteration:'Alhamdu lillahil-lathee ahyana', translation:'All praise is for Allah who gave us life after having taken it from us.' },
  { id:'2:5', category:'What to say when seeking forgiveness', arabic:'أَسْتَغْفِرُ اللَّهَ', transliteration:'Astaghfirullah', translation:'I seek the forgiveness of Allah.' },
  { id:'3:9', category:'Supplication before sleeping', arabic:'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا', transliteration:'Bismika Allahumma amootu wa-ahya', translation:'In Your name O Allah, I live and die.' },
];

test('English query matches translation', () => {
  const r = searchDuas(DUAS, 'forgiveness', {});
  assert.strictEqual(r.total, 1);
  assert.strictEqual(r.results[0].id, '2:5');
});
test('English query matches by category name', () => {
  const r = searchDuas(DUAS, 'sleeping', {});
  assert.strictEqual(r.total, 1);
  assert.strictEqual(r.results[0].id, '3:9');
});
test('Arabic query matches diacritic-insensitively', () => {
  const r = searchDuas(DUAS, 'استغفر', {});
  assert.strictEqual(r.total, 1);
  assert.strictEqual(r.results[0].id, '2:5');
});
test('token-AND + non-match', () => {
  assert.strictEqual(searchDuas(DUAS, 'praise Allah', {}).total, 1);
  assert.strictEqual(searchDuas(DUAS, 'zebra', {}).total, 0);
});
test('pagination', () => {
  const r = searchDuas(DUAS, 'Allah', { page:1, limit:2 });
  assert.ok(r.total >= 2);
  assert.strictEqual(r.results.length, 2);
  assert.strictEqual(r.totalPages, Math.ceil(r.total/2));
});
```

- [ ] **Step 2: run → FAIL**: `cd worker && node --test test/dua-search-core.test.js`

- [ ] **Step 3: implement** `worker/src/lib/dua-search-core.js` (reuses Slice-1 normalizers — do NOT re-implement them):
```js
/* IslamicInfo.org — dua-search-core.js
   Pure keyword search over the ingested Hisn al-Muslim corpus.
   Reuses the diacritic-insensitive normalizers from quran-search-core. */
import { isArabic, normalizeArabic, normalizeLatin } from './quran-search-core.js';

function tokens(norm) { return norm.split(' ').filter(Boolean); }

export function searchDuas(duas, q, opts) {
  opts = opts || {};
  const page = opts.page > 0 ? Math.floor(opts.page) : 1;
  const limit = opts.limit > 0 ? Math.min(Math.floor(opts.limit), 50) : 20;
  const arabicQuery = isArabic(q);
  const norm = arabicQuery ? normalizeArabic(q) : normalizeLatin(q);
  const toks = tokens(norm);
  const matches = [];
  if (toks.length) {
    for (const d of duas) {
      const hay = arabicQuery
        ? normalizeArabic(d.arabic)
        : normalizeLatin((d.translation || '') + ' ' + (d.category || '') + ' ' + (d.transliteration || ''));
      let all = true;
      for (const t of toks) { if (hay.indexOf(t) === -1) { all = false; break; } }
      if (all) matches.push({ d, score: hay.indexOf(norm) !== -1 ? 2 : 1 });
    }
    matches.sort((a, b) => b.score !== a.score ? b.score - a.score : String(a.d.id).localeCompare(String(b.d.id)));
  }
  const total = matches.length;
  const totalPages = total ? Math.ceil(total / limit) : 0;
  const start = (page - 1) * limit;
  return { total, page, totalPages, limit, results: matches.slice(start, start + limit).map(m => m.d) };
}
```

- [ ] **Step 4: run → PASS**, then full suite `cd worker && npm test` (expect prior total + 5 new, 0 fail).

- [ ] **Step 5: commit** `git add worker/src/lib/dua-search-core.js worker/test/dua-search-core.test.js && git commit -m "feat(dua-search): pure dua search core (reuses quran normalizers) + tests"` (+ Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>)

---

## Task 2: Ingest — `worker/scripts/ingest-dua-corpus.mjs`

**Files:** Create `worker/scripts/ingest-dua-corpus.mjs`; produces `src/data/dua/search-corpus.json`

- [ ] **Step 1: write** `worker/scripts/ingest-dua-corpus.mjs`:
```js
/* Ingest the Hisn al-Muslim (Fortress of the Muslim) dua corpus.
   Source dataset (pinned): github.com/wafaaelmaandy/Hisn-Muslim-Json (husn_en.json).
   Run: node worker/scripts/ingest-dua-corpus.mjs  →  <repo>/src/data/dua/search-corpus.json */
import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const SRC = 'https://raw.githubusercontent.com/wafaaelmaandy/Hisn-Muslim-Json/master/husn_en.json';
const __dir = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dir, '../../src/data/dua/search-corpus.json');
const clean = (s) => String(s == null ? '' : s).replace(/\s+/g, ' ').trim();

async function main() {
  const r = await fetch(SRC);
  if (!r.ok) throw new Error('source HTTP ' + r.status);
  const j = await r.json();
  const chapters = j.English || j.english || [];
  if (!Array.isArray(chapters) || !chapters.length) throw new Error('unexpected dataset shape (no English[] array)');
  const duas = [];
  let dropped = 0;
  for (const c of chapters) {
    const category = clean(c.TITLE);
    for (const t of (c.TEXT || [])) {
      const arabic = clean(t.ARABIC_TEXT);
      const translation = clean(t.TRANSLATED_TEXT);
      const transliteration = clean(t.LANGUAGE_ARABIC_TRANSLATED_TEXT);
      if (!arabic && !translation) { dropped++; continue; }
      duas.push({ id: `${c.ID}:${t.ID}`, category, arabic, transliteration, translation });
    }
  }
  if (duas.length < 250) throw new Error(`expected >=250 duas, got ${duas.length} — aborting write`);
  const doc = { meta: {
    source: "Hisn al-Muslim (Fortress of the Muslim), Sa'id al-Qahtani",
    sourceDataset: 'github.com/wafaaelmaandy/Hisn-Muslim-Json (husn_en.json)',
    licenseNote: 'dataset license unstated; text is the Hisn al-Muslim compilation',
    fetchedAt: new Date().toISOString(), count: duas.length, schema: 1 }, duas };
  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(doc));
  process.stderr.write(`WROTE ${OUT} — ${duas.length} duas (dropped ${dropped} empty), ${(JSON.stringify(doc).length/1e6).toFixed(2)} MB\n`);
}
main().catch((e) => { process.stderr.write('INGEST FAILED: ' + e.message + '\n'); process.exit(1); });
```

- [ ] **Step 2: run** `node worker/scripts/ingest-dua-corpus.mjs` (network CONFIRMED reachable for this dataset). Expected: `WROTE …/src/data/dua/search-corpus.json — ~267 duas (dropped N empty), ~0.2 MB`. If the count `< 250` or the shape assertion trips, investigate (do NOT weaken the assertion, do NOT hand-author duas). If network is blocked, report BLOCKED with the command.

- [ ] **Step 3: sanity-check**:
```bash
node -e "const d=require('./src/data/quran/search-corpus.json')&&0;" 2>/dev/null; node -e "const d=require('./src/data/dua/search-corpus.json');console.log(d.meta);console.log('duas',d.duas.length);const f=d.duas.find(x=>/forgiv/i.test(x.translation));console.log('sample forgiveness:',f&&f.id,f&&f.category);console.log('first:',JSON.stringify(d.duas[0]).slice(0,200))"
```
Expect: `count` ~267, `duas` == count, a forgiveness dua present, first record has arabic+translation+category. Confirm NO empty both-fields: `node -e "const d=require('./src/data/dua/search-corpus.json');console.log('empty both:',d.duas.filter(x=>!x.arabic&&!x.translation).length)"` → 0.

- [ ] **Step 4: commit** `git add worker/scripts/ingest-dua-corpus.mjs src/data/dua/search-corpus.json && git commit -m "feat(dua-search): ingest script + committed Hisn al-Muslim corpus"` (+ Co-Authored-By)

---

## Task 3: Corpus integrity test — `worker/test/dua-corpus.test.js`

- [ ] **Step 1: write** `worker/test/dua-corpus.test.js`:
```js
import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const CORPUS = resolve(dirname(fileURLToPath(import.meta.url)), '../../src/data/dua/search-corpus.json');

test('dua corpus: >=250 sourced duas, Hisn al-Muslim attribution, no empty records', (t) => {
  if (!existsSync(CORPUS)) { t.skip('corpus not ingested yet (run worker/scripts/ingest-dua-corpus.mjs)'); return; }
  const d = JSON.parse(readFileSync(CORPUS, 'utf8'));
  assert.ok(/Hisn al-Muslim/i.test(d.meta.source), 'source attribution');
  assert.ok(d.meta.count >= 250, 'count >= 250');
  assert.strictEqual(d.duas.length, d.meta.count);
  for (const x of d.duas) {
    assert.ok(x.id, 'id present');
    assert.ok((x.arabic && x.arabic.trim()) || (x.translation && x.translation.trim()), 'has arabic or translation at ' + x.id);
  }
});
```

- [ ] **Step 2: run** `cd worker && node --test test/dua-corpus.test.js` — PASS (corpus present).
- [ ] **Step 3: commit** `git add worker/test/dua-corpus.test.js && git commit -m "test(dua-search): corpus integrity (>=250 duas, Hisn al-Muslim attribution)"` (+ Co-Authored-By)

---

## Task 4: Endpoint — `GET /api/dua/search`

**Files:** Create `worker/src/dua-search.js`; Modify `worker/src/index.js`

- [ ] **Step 1: create** `worker/src/dua-search.js` (mirror `worker/src/quran-search.js`):
```js
/* GET /api/dua/search?q=&page=&limit= — keyword search over the ingested Hisn al-Muslim corpus. */
import { json } from './lib/cors.js';
import { getJson, putJson, TTL } from './lib/hadith-cache.js';
import { isArabic, normalizeArabic, normalizeLatin } from './lib/quran-search-core.js';
import { searchDuas } from './lib/dua-search-core.js';

const DEFAULT_CORPUS_URL = 'https://islamicinfo.org/src/data/dua/search-corpus.json';
let CORPUS = null;

function ok(data, source, origin, maxAge = 0) { return json({ ok: true, data, source }, origin, { maxAge }); }
function fail(code, message, origin, status, retryable) { return json({ ok: false, error: { code, message, retryable }, source: 'fallback' }, origin, { status }); }
function posInt(v) { const n = parseInt(v, 10); return Number.isInteger(n) && n > 0 ? n : null; }

async function loadCorpus(env) {
  if (CORPUS) return CORPUS;
  const url = (env && env.DUA_CORPUS_URL) || DEFAULT_CORPUS_URL;
  const r = await fetch(url);
  if (!r.ok) throw new Error('corpus HTTP ' + r.status);
  const doc = await r.json();
  CORPUS = { duas: doc.duas || [], meta: doc.meta || {} };
  return CORPUS;
}

export async function handleDuaSearch(searchParams, env, origin) {
  const q = (searchParams.get('q') || '').trim();
  if (q.length < 2) return fail('bad_query', 'search query must be at least 2 characters', origin, 400, false);
  if (q.length > 100) return fail('bad_query', 'search query too long (max 100 chars)', origin, 400, false);
  const page = posInt(searchParams.get('page')) || 1;
  const limit = Math.min(posInt(searchParams.get('limit')) || 20, 50);

  const kv = env.QURANLYAI_KV;
  const norm = isArabic(q) ? normalizeArabic(q) : normalizeLatin(q);
  const cacheKey = `dsearch:${page}:${limit}:${norm}`;
  if (kv) { const hit = await getJson(kv, cacheKey); if (hit) return ok(hit, 'cache', origin, 0); }

  let corpus;
  try { corpus = await loadCorpus(env); }
  catch (_) { return fail('corpus_unavailable', 'Dua search temporarily unavailable', origin, 503, true); }

  const r = searchDuas(corpus.duas, q, { page, limit });
  const data = { query: q, page: r.page, totalPages: r.totalPages, total: r.total, results: r.results,
    source: corpus.meta.source || 'Hisn al-Muslim', sourceDataset: corpus.meta.sourceDataset || null };
  if (kv) await putJson(kv, cacheKey, data, TTL.HOUR);
  return ok(data, 'live', origin, TTL.HOUR);
}
```

- [ ] **Step 2: wire route in `worker/src/index.js`.** Add import near the others: `import { handleDuaSearch } from './dua-search.js';`. Then find the existing `/api/quran/search` branch (inside the GET block) and add DIRECTLY AFTER it:
```js
        if (path === '/api/dua/search') {
          const res = await handleDuaSearch(url.searchParams, env, origin);
          if (res.status === 200) await cache.put(request, res.clone());
          return res;
        }
```
Read the surrounding code to confirm you're inside the GET block (where `cache`, `url`, `env`, `origin`, `request` are in scope), same place `/api/quran/search` sits.

- [ ] **Step 3: manifest** — add `'/api/dua/search'` to the `live` array in the root (`path === '/' || path === '/api'`) response.

- [ ] **Step 4: regression** `cd worker && npm test` — all green (Slice-1 total + Task 1 + Task 3).

- [ ] **Step 5: commit** `git add worker/src/dua-search.js worker/src/index.js && git commit -m "feat(dua-search): GET /api/dua/search endpoint (corpus memo + KV cache)"` (+ Co-Authored-By)

---

## Task 5: DECISION entry — `doc/DECISIONS.md`

- [ ] **Step 1:** append **ADR-051** (next number after ADR-050) in the file's existing heading style:
  - **Title:** `Dua search corpus = Hisn al-Muslim via wafaaelmaandy/Hisn-Muslim-Json; static JSON + Worker scan + KV; owner license/attribution gate before public`.
  - **Context:** hero-search Dua pill needs a real, sourced dua corpus; no dua dataset/endpoint existed.
  - **Decision:** ingest `husn_en.json` (132 categories / ~267 duas: Arabic, transliteration, English, category) → `src/data/dua/search-corpus.json`; `/api/dua/search` scans it in the Worker (module-global memo) + KV cache; reuses the Slice-1 diacritic-insensitive normalizers; D1+FTS5 = same upgrade path (ADR-050).
  - **Provenance/license:** text is the *Hisn al-Muslim* compilation (Sa'id al-Qahtani); dataset license **unstated**; no per-dua Quran/hadith citations. Attribution ("Hisn al-Muslim") stored in corpus `meta` and shown on results. **Owner-review gate:** owner confirms attribution/permission before the Dua pill goes public in Slice 3 (mirrors ADR-048's dorar.net terms gate); until cleared, the pill stays "coming soon".
  - **Consequences:** no-fabrication upheld (text only from the dataset; unreachable → BLOCKED, never authored). Reference the spec/plan.
- [ ] **Step 2: commit** `git add doc/DECISIONS.md && git commit -m "docs(decisions): log Dua search corpus + owner license gate (ADR-051)"` (+ Co-Authored-By)

---

## Self-review notes
- **Reuse, not duplication:** dua-search-core imports the Slice-1 normalizers; endpoint mirrors quran-search.js. Route placed WITH the quran-search branch (GET block, `cache` in scope) — the Slice-1 lesson.
- **No-fabrication + license honesty:** corpus text only from the verified dataset; provenance + license-unstated caveat + owner gate recorded (ADR-051); integrity test enforces attribution + shape.
- **Name consistency:** `searchDuas`, KV prefix `dsearch:`, response fields `query,page,totalPages,total,results,source,sourceDataset`.
- **Checklist gating:** Dua pill (Slice 3) stays "coming soon" until deploy smoke passes AND owner clears the license gate.
