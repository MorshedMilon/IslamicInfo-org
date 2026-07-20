# Hadith Module 0 — Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the `/api/hadith` 501 stub into a real Cloudflare-Worker backend that proxies hadithapi.com, normalizes responses to a safe internal schema, caches in KV, and ships shared frontend utilities — with no change to the locked `hadith.html` design.

**Architecture:** Extend the existing Worker (`worker/src/index.js`). New pure libs (`hadith-source`, `hadith-adapter`, `hadith-cache`) + a router (`worker/src/hadith.js`) dispatched from index.js. Everything is cache-first with graceful fallback; enrichment (isnad/narrator/audio) is honestly `unavailable` until a curator store exists. Frontend gets safe utilities only (no markup wiring).

**Tech Stack:** Cloudflare Workers (ESM), Cloudflare KV (`env.QURANLYAI_KV`, `hadith:` key prefix), `node:test` + `node:assert` for unit tests, vanilla ES2022 client. Source: hadithapi.com (`?apiKey=`, server-side only).

---

## Conventions (read once)

- Tests: `node:test`. Run all with `cd worker && npm test`; a single file with `node --test test/<file>.test.js`.
- Response helpers already exist in `worker/src/lib/cors.js`: `json(data, origin, {status,maxAge})`, `err(msg, origin, status)`, `ALLOWED_ORIGINS`, `corsHeaders(origin)`.
- KV is injected as `env.QURANLYAI_KV`. All cache/quota logic takes `kv` as a param so it's testable with a fake KV (see the fake in `worker/test/cache.test.js`).
- Uniform hadith envelope (all `/api/hadith/*` responses): `{ ok, data?, error?:{code,message,retryable}, source:'live'|'cache'|'fallback' }`.
- **hadithapi.com response field names are unverified from public docs** — the adapter fixtures below are marked `ASSUMPTION`. Before the module is "done", confirm against one live response and adjust the adapter field reads only (tests stay the same shape).

---

## Task 1: Secrets & config wiring

**Files:**
- Modify: `worker/wrangler.toml`
- Modify: `worker/.env.example`
- Modify: `worker/.dev.vars`

- [ ] **Step 1: Add the public base-URL var to `wrangler.toml`** (append under the existing `[[kv_namespaces]]` block; the API key is a secret, never here):

```toml

# Hadith Library source (public base URL only; HADITH_API_KEY is a Worker secret,
# set via `npx wrangler secret put HADITH_API_KEY`, never committed).
[vars]
HADITH_API_BASE_URL = "https://hadithapi.com"
```

- [ ] **Step 2: Document the secret in `.env.example`** (append):

```
# hadithapi.com — register at https://hadithapi.com, key appears on your profile.
# Passed server-side as ?apiKey=. NEVER expose to the browser.
HADITH_API_KEY=your-hadithapi-key-here
```

- [ ] **Step 3: Add the key to local dev vars `worker/.dev.vars`** (append; this file is gitignored):

```
HADITH_API_KEY=your-hadithapi-key-here
```

- [ ] **Step 4: Commit**

```bash
git add worker/wrangler.toml worker/.env.example worker/.dev.vars
git commit -m "chore(hadith): add hadithapi base URL var + API key secret scaffolding"
```

---

## Task 2: hadithapi.com source client (`hadith-source.js`)

Pure URL construction + a fetch wrapper with an injectable fetcher (so tests never hit the network).

**Files:**
- Create: `worker/src/lib/hadith-source.js`
- Test: `worker/test/hadith-source.test.js`

- [ ] **Step 1: Write the failing test**

```js
import { test } from 'node:test';
import assert from 'node:assert';
import { ALLOWED_SLUGS, booksUrl, chaptersUrl, hadithsUrl, fetchJson } from '../src/lib/hadith-source.js';

const BASE = 'https://hadithapi.com';
const KEY = 'TESTKEY';

test('booksUrl targets the public books endpoint with the key', () => {
  assert.equal(booksUrl(BASE, KEY), 'https://hadithapi.com/public/api/books?apiKey=TESTKEY');
});

test('chaptersUrl embeds the book slug', () => {
  assert.equal(chaptersUrl(BASE, KEY, 'sahih-bukhari'),
    'https://hadithapi.com/api/sahih-bukhari/chapters?apiKey=TESTKEY');
});

test('hadithsUrl builds filters and URL-encodes the search term', () => {
  const u = new URL(hadithsUrl(BASE, KEY, { book: 'sahih-bukhari', chapter: 1, paginate: 25, page: 2 }));
  assert.equal(u.pathname, '/api/hadiths/');
  assert.equal(u.searchParams.get('apiKey'), 'TESTKEY');
  assert.equal(u.searchParams.get('book'), 'sahih-bukhari');
  assert.equal(u.searchParams.get('chapter'), '1');
  assert.equal(u.searchParams.get('paginate'), '25');
  assert.equal(u.searchParams.get('page'), '2');
});

test('hadithsUrl passes an English search term', () => {
  const u = new URL(hadithsUrl(BASE, KEY, { hadithEnglish: 'intention & deeds' }));
  assert.equal(u.searchParams.get('hadithEnglish'), 'intention & deeds');
});

test('ALLOWED_SLUGS contains the nine documented collections', () => {
  ['sahih-bukhari','sahih-muslim','al-tirmidhi','abu-dawood','ibn-e-majah',
   'sunan-nasai','mishkat','musnad-ahmad','al-silsila-sahiha']
   .forEach(s => assert.ok(ALLOWED_SLUGS.has(s), `${s} missing`));
});

test('fetchJson aborts and throws on a non-ok status', async () => {
  const fakeFetch = async () => ({ ok: false, status: 500, json: async () => ({}) });
  await assert.rejects(() => fetchJson('http://x', { fetcher: fakeFetch }), /HTTP 500/);
});

test('fetchJson returns parsed JSON on success', async () => {
  const fakeFetch = async () => ({ ok: true, status: 200, json: async () => ({ hi: 1 }) });
  assert.deepEqual(await fetchJson('http://x', { fetcher: fakeFetch }), { hi: 1 });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd worker && node --test test/hadith-source.test.js`
Expected: FAIL — `Cannot find module '../src/lib/hadith-source.js'`.

- [ ] **Step 3: Write the implementation**

```js
/* hadithapi.com source client. Server-side ONLY — the API key is a Worker
   secret and must never reach the browser. URL builders are pure; fetchJson
   takes an injectable `fetcher` so it is unit-testable without a network. */

export const ALLOWED_SLUGS = new Set([
  'sahih-bukhari', 'sahih-muslim', 'al-tirmidhi', 'abu-dawood', 'ibn-e-majah',
  'sunan-nasai', 'mishkat', 'musnad-ahmad', 'al-silsila-sahiha',
]);

export function booksUrl(base, key) {
  return `${base}/public/api/books?apiKey=${encodeURIComponent(key)}`;
}

export function chaptersUrl(base, key, slug) {
  return `${base}/api/${slug}/chapters?apiKey=${encodeURIComponent(key)}`;
}

export function hadithsUrl(base, key, params = {}) {
  const u = new URL(`${base}/api/hadiths/`);
  u.searchParams.set('apiKey', key);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') u.searchParams.set(k, String(v));
  }
  return u.toString();
}

export async function fetchJson(url, { timeoutMs = 8000, fetcher = fetch } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetcher(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'IslamicInfo.org proxy (hello@islamicinfo.org)' },
    });
    if (!res.ok) throw new Error(`upstream HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd worker && node --test test/hadith-source.test.js`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add worker/src/lib/hadith-source.js worker/test/hadith-source.test.js
git commit -m "feat(hadith): hadithapi.com source client (pure URL builders + fetchJson)"
```

---

## Task 3: Normalization adapter (`hadith-adapter.js`)

Converts hadithapi payloads → the internal safe schema. Defensive: unconfirmed fields become explicit status, never a guess, and the grade badge is never dropped.

**Files:**
- Create: `worker/src/lib/hadith-adapter.js`
- Test: `worker/test/hadith-adapter.test.js`

- [ ] **Step 1: Write the failing test**

```js
import { test } from 'node:test';
import assert from 'node:assert';
import { normalizeGrade, normalizeBook, normalizeHadith } from '../src/lib/hadith-adapter.js';

test('normalizeGrade maps known statuses', () => {
  assert.equal(normalizeGrade('Sahih').value, 'sahih');
  assert.equal(normalizeGrade('Hasan').value, 'hasan');
  assert.equal(normalizeGrade("Da'eef").value, 'daif');
});

test('normalizeGrade never drops the badge on missing/blank status', () => {
  const g = normalizeGrade('');
  assert.equal(g.value, 'unknown');
  assert.equal(g.label, 'Grade Unknown');
  assert.equal(g.disputed, false);
});

test('normalizeBook maps the ASSUMPTION source shape', () => {
  // ASSUMPTION — verify field names against a live books response.
  const raw = { bookName: 'Sahih Bukhari', bookSlug: 'sahih-bukhari',
    writerName: 'Imam Bukhari', hadiths_count: '7563', chapters_count: '97' };
  const b = normalizeBook(raw);
  assert.equal(b.collectionSlug, 'sahih-bukhari');
  assert.equal(b.collectionName, 'Sahih Bukhari');
  assert.equal(b.hadithCount, 7563);
  assert.equal(b.chaptersCount, 97);
});

test('normalizeHadith fills required fields and marks enrichment unavailable', () => {
  // ASSUMPTION — verify field names against a live hadiths response.
  const raw = {
    hadithNumber: '1', hadithArabic: 'إنما الأعمال بالنيات',
    hadithEnglish: 'Actions are by intentions', englishNarrator: 'Umar ibn al-Khattab',
    status: 'Sahih', book: { bookSlug: 'sahih-bukhari', bookName: 'Sahih Bukhari' },
    chapter: { chapterNumber: '1', chapterEnglish: 'Revelation' },
  };
  const h = normalizeHadith(raw, { language: 'en' });
  assert.equal(h.source, 'hadithapi');
  assert.equal(h.collectionSlug, 'sahih-bukhari');
  assert.equal(h.hadithNumber, 1);
  assert.equal(h.arabicMatn, 'إنما الأعمال بالنيات');
  assert.equal(h.translation.text, 'Actions are by intentions');
  assert.equal(h.grade.value, 'sahih');
  assert.equal(h.narrator.name, 'Umar ibn al-Khattab');
  assert.equal(h.isnad.status, 'unavailable');
  assert.equal(h.audio.status, 'unavailable');
  assert.ok(h.sourceMetadata.contentHash.length > 0);
});

test('normalizeHadith with no status still renders an unknown badge', () => {
  const h = normalizeHadith({ hadithNumber: 5, hadithArabic: 'x', hadithEnglish: 'y',
    book: { bookSlug: 'sahih-muslim' } }, {});
  assert.equal(h.grade.value, 'unknown');
  assert.equal(h.grade.label, 'Grade Unknown');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd worker && node --test test/hadith-adapter.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

```js
/* Normalizes hadithapi.com payloads into the internal safe schema.
   Rules: never fabricate; unconfirmed fields => explicit status; the grade
   badge is NEVER omitted (missing status => 'unknown'/'Grade Unknown').
   NOTE: source field reads marked ASSUMPTION need one live-response check. */

const GRADE_MAP = {
  'sahih': 'sahih', 'hasan': 'hasan', "da'eef": 'daif', 'daif': 'daif',
  "da'if": 'daif', 'zaeef': 'daif', 'maudu': 'mawdu', 'mawdu': 'mawdu',
};

function toInt(v) {
  const n = parseInt(String(v ?? '').replace(/[^0-9]/g, ''), 10);
  return Number.isFinite(n) ? n : null;
}

// Small, dependency-free stable hash (FNV-1a → hex) for audit/dedup.
function contentHash(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

export function normalizeGrade(status) {
  const key = String(status ?? '').trim().toLowerCase();
  const value = GRADE_MAP[key] || 'unknown';
  const label = value === 'unknown' ? 'Grade Unknown'
    : { sahih: 'Sahih', hasan: 'Hasan', daif: "Da'if", mawdu: "Mawdu'" }[value];
  return { value, label, grader: null, sourceCitation: null, disputed: false, alternateGradings: [] };
}

export function normalizeBook(raw = {}) {
  return {
    collectionSlug: raw.bookSlug || raw.bookslug || null,   // ASSUMPTION
    collectionName: raw.bookName || null,                   // ASSUMPTION
    collectionArabicName: raw.bookNameArabic || null,       // ASSUMPTION (may be absent)
    compiler: raw.writerName || null,                       // ASSUMPTION
    hadithCount: toInt(raw.hadiths_count),                  // ASSUMPTION
    chaptersCount: toInt(raw.chapters_count),               // ASSUMPTION
  };
}

export function normalizeChapter(raw = {}) {
  return {
    collectionSlug: raw.bookSlug || null,                   // ASSUMPTION
    bookNumber: toInt(raw.chapterNumber),                   // ASSUMPTION
    bookName: raw.chapterEnglish || null,                   // ASSUMPTION
    bookArabicName: raw.chapterArabic || null,              // ASSUMPTION
    hadithCount: toInt(raw.hadiths_count),                  // ASSUMPTION (may be absent)
  };
}

export function normalizeHadith(raw = {}, { language = 'en' } = {}) {
  const book = raw.book || {};                              // ASSUMPTION nested object
  const chapter = raw.chapter || {};                        // ASSUMPTION nested object
  const arabicMatn = raw.hadithArabic || '';                // ASSUMPTION
  const text = raw.hadithEnglish || '';                     // ASSUMPTION
  const slug = book.bookSlug || raw.bookSlug || null;
  const hadithNumber = toInt(raw.hadithNumber);
  const reference = slug && hadithNumber ? `${book.bookName || slug} · Hadith ${hadithNumber}` : null;

  return {
    id: slug && hadithNumber ? `${slug}:${toInt(chapter.chapterNumber) ?? 0}:${hadithNumber}` : null,
    source: 'hadithapi',
    sourceId: raw.id ?? null,
    collectionSlug: slug,
    collectionName: book.bookName || null,
    collectionArabicName: book.bookNameArabic || null,
    bookNumber: toInt(chapter.chapterNumber),
    bookName: chapter.chapterEnglish || null,
    bookArabicName: chapter.chapterArabic || null,
    hadithNumber,
    reference,
    arabicMatn,
    translation: { text, language, edition: 'hadithapi.com', translator: null },
    narrator: { id: null, name: raw.englishNarrator || null, arabicName: null },
    grade: normalizeGrade(raw.status),
    isnad: { status: 'unavailable', narrators: [] },
    topics: [],
    audio: { status: 'unavailable', url: null, reciter: null },
    sourceMetadata: {
      fetchedAt: new Date().toISOString(),
      sourceUrlOrId: raw.id != null ? `hadithapi:${raw.id}` : null,
      contentHash: contentHash(arabicMatn + '|' + text + '|' + (reference || '')),
      verificationStatus: 'source-only',
    },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd worker && node --test test/hadith-adapter.test.js`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add worker/src/lib/hadith-adapter.js worker/test/hadith-adapter.test.js
git commit -m "feat(hadith): defensive normalization adapter (grade badge never dropped)"
```

---

## Task 4: KV cache helpers (`hadith-cache.js`)

Generic JSON get/put over KV with `hadith:` keys. Tolerates a missing KV binding (returns null / no-ops) so the Worker still serves live+fallback without a namespace configured.

**Files:**
- Create: `worker/src/lib/hadith-cache.js`
- Test: `worker/test/hadith-cache.test.js`

- [ ] **Step 1: Write the failing test**

```js
import { test } from 'node:test';
import assert from 'node:assert';
import { hKey, getJson, putJson, TTL } from '../src/lib/hadith-cache.js';

function fakeKV(initial = {}) {
  const store = new Map(Object.entries(initial));
  const puts = [];
  return {
    async get(k) { return store.has(k) ? store.get(k) : null; },
    async put(k, v, opts) { store.set(k, v); puts.push({ k, v, opts }); },
    _store: store, _puts: puts,
  };
}

test('hKey builds prefixed keys', () => {
  assert.equal(hKey('collections'), 'hadith:collections');
  assert.equal(hKey('one', 'sahih-bukhari', 1, 1), 'hadith:one:sahih-bukhari:1:1');
});

test('getJson returns null on miss, parsed value on hit', async () => {
  const kv = fakeKV();
  assert.equal(await getJson(kv, 'hadith:x'), null);
  await putJson(kv, 'hadith:x', { a: 1 }, TTL.DAY);
  assert.deepEqual(await getJson(kv, 'hadith:x'), { a: 1 });
});

test('getJson tolerates corrupt JSON (returns null, no throw)', async () => {
  const kv = fakeKV({ 'hadith:bad': '{not json' });
  assert.equal(await getJson(kv, 'hadith:bad'), null);
});

test('missing KV binding is a safe no-op', async () => {
  assert.equal(await getJson(null, 'hadith:x'), null);
  await putJson(undefined, 'hadith:x', { a: 1 }, TTL.DAY); // must not throw
});

test('putJson passes TTL through', async () => {
  const kv = fakeKV();
  await putJson(kv, 'hadith:x', { a: 1 }, 3600);
  assert.equal(kv._puts[0].opts.expirationTtl, 3600);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd worker && node --test test/hadith-cache.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

```js
/* KV JSON cache for the Hadith Library. All keys are `hadith:`-prefixed so
   they never collide with quota:/cache: keys in the shared namespace. Every
   function tolerates a falsy kv (no binding) as a safe no-op. */

export const TTL = {
  HOUR: 3600,
  DAY: 24 * 3600,
  WEEK: 7 * 24 * 3600,
};

export function hKey(...parts) {
  return 'hadith:' + parts.join(':');
}

export async function getJson(kv, key) {
  if (!kv) return null;
  try {
    const raw = await kv.get(key);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

export async function putJson(kv, key, value, ttlSeconds) {
  if (!kv) return;
  try {
    await kv.put(key, JSON.stringify(value), { expirationTtl: ttlSeconds });
  } catch (_) {
    /* cache write failures must never break a response */
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd worker && node --test test/hadith-cache.test.js`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add worker/src/lib/hadith-cache.js worker/test/hadith-cache.test.js
git commit -m "feat(hadith): KV JSON cache helpers (missing-binding safe)"
```

---

## Task 5: Router core + validation + collections endpoint

`worker/src/hadith.js` owns all `/api/hadith/*` routing. This task builds the envelope helpers, path parsing, slug/number validation, and the first endpoint (`collections`) with cache-first + fallback.

**Files:**
- Create: `worker/src/hadith.js`
- Test: `worker/test/hadith-router.test.js`

- [ ] **Step 1: Write the failing test**

```js
import { test } from 'node:test';
import assert from 'node:assert';
import { handleHadith } from '../src/hadith.js';

function fakeKV() {
  const store = new Map();
  return { async get(k){return store.has(k)?store.get(k):null;}, async put(k,v){store.set(k,v);} , _store: store };
}
const ORIGIN = 'https://islamicinfo.org';
const ENV = (over = {}) => ({ QURANLYAI_KV: fakeKV(), HADITH_API_KEY: 'K', HADITH_API_BASE_URL: 'https://hadithapi.com', ...over });

// Injectable fetcher returns an ASSUMPTION-shaped books payload.
const booksFetcher = async () => ({ ok: true, status: 200, json: async () => ({
  books: [{ bookName: 'Sahih Bukhari', bookSlug: 'sahih-bukhari', writerName: 'Imam Bukhari',
            hadiths_count: '7563', chapters_count: '97' }],
}) });

test('unknown sub-path returns a 404 envelope', async () => {
  const res = await handleHadith('/api/hadith/nope', new URLSearchParams(), ENV(), ORIGIN, {});
  assert.equal(res.status, 404);
  const b = await res.json();
  assert.equal(b.ok, false);
  assert.equal(b.error.retryable, false);
});

test('collections returns a normalized live envelope', async () => {
  const res = await handleHadith('/api/hadith/collections', new URLSearchParams(),
    ENV(), ORIGIN, { fetcher: booksFetcher });
  assert.equal(res.status, 200);
  const b = await res.json();
  assert.equal(b.ok, true);
  assert.equal(b.source, 'live');
  assert.equal(b.data[0].collectionSlug, 'sahih-bukhari');
  assert.equal(b.data[0].hadithCount, 7563);
});

test('collections serves cache on upstream failure', async () => {
  const env = ENV();
  // seed cache
  await env.QURANLYAI_KV.put('hadith:collections', JSON.stringify([{ collectionSlug: 'sahih-muslim' }]));
  const failing = async () => { throw new Error('network down'); };
  const res = await handleHadith('/api/hadith/collections', new URLSearchParams(), env, ORIGIN, { fetcher: failing });
  const b = await res.json();
  assert.equal(b.source, 'cache');
  assert.equal(b.data[0].collectionSlug, 'sahih-muslim');
});

test('missing API key yields a 503 retryable envelope', async () => {
  const res = await handleHadith('/api/hadith/collections', new URLSearchParams(),
    ENV({ HADITH_API_KEY: '' }), ORIGIN, { fetcher: booksFetcher });
  assert.equal(res.status, 503);
  const b = await res.json();
  assert.equal(b.error.retryable, true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd worker && node --test test/hadith-router.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

```js
/* Hadith Library router — owns all /api/hadith/* endpoints. Cache-first with
   graceful fallback; uniform { ok, data?, error?, source } envelope. The API
   key is read from env (Worker secret) and never leaves the server. `deps`
   lets tests inject a fetcher. */

import { json } from './lib/cors.js';
import { ALLOWED_SLUGS, booksUrl, chaptersUrl, hadithsUrl, fetchJson } from './lib/hadith-source.js';
import { normalizeBook, normalizeChapter, normalizeHadith } from './lib/hadith-adapter.js';
import { hKey, getJson, putJson, TTL } from './lib/hadith-cache.js';

function ok(data, source, origin, maxAge = 0) {
  return json({ ok: true, data, source }, origin, { maxAge });
}
function fail(code, message, origin, status, retryable) {
  return json({ ok: false, error: { code, message, retryable }, source: 'fallback' }, origin, { status });
}

function posInt(v) {
  const n = parseInt(v, 10);
  return Number.isInteger(n) && n > 0 ? n : null;
}

/* Fetch → normalize → cache; on any failure serve cache, else signal caller. */
async function liveOrCache(kv, key, ttl, buildUrl, normalize, deps) {
  const fetcher = deps.fetcher || fetch;
  try {
    const raw = await fetchJson(buildUrl(), { fetcher });
    const data = normalize(raw);
    await putJson(kv, key, data, ttl);
    return { data, source: 'live' };
  } catch (e) {
    const cached = await getJson(kv, key);
    if (cached) return { data: cached, source: 'cache' };
    throw e;
  }
}

async function collections(env, origin, deps) {
  const kv = env.QURANLYAI_KV;
  if (!env.HADITH_API_KEY) return fail('no_key', 'Hadith service temporarily unavailable', origin, 503, true);
  try {
    const { data, source } = await liveOrCache(
      kv, hKey('collections'), TTL.WEEK,
      () => booksUrl(env.HADITH_API_BASE_URL, env.HADITH_API_KEY),
      (raw) => (raw.books || []).map(normalizeBook),   // ASSUMPTION: top-level `books`
      deps,
    );
    return ok(data, source, origin, source === 'live' ? TTL.WEEK : 0);
  } catch (_) {
    return fail('upstream', 'Collections temporarily unavailable — try again', origin, 502, true);
  }
}

export async function handleHadith(path, searchParams, env, origin, deps = {}) {
  const rest = path.replace(/^\/api\/hadith\/?/, '');   // '', 'collections', 'collections/sahih-bukhari/books', ...
  const seg = rest.split('/').filter(Boolean);

  if (seg[0] === 'collections' && seg.length === 1) return collections(env, origin, deps);

  return fail('not_found', `unknown hadith endpoint: /${rest}`, origin, 404, false);
}

// Re-export helpers so later tasks (and tests) can reuse them.
export { ok, fail, posInt, liveOrCache };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd worker && node --test test/hadith-router.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add worker/src/hadith.js worker/test/hadith-router.test.js
git commit -m "feat(hadith): router core + collections endpoint (cache-first, envelope)"
```

---

## Task 6: chapters, hadith list, and single-hadith endpoints

**Files:**
- Modify: `worker/src/hadith.js`
- Modify: `worker/test/hadith-router.test.js`

- [ ] **Step 1: Add failing tests** (append to `test/hadith-router.test.js`):

```js
const chaptersFetcher = async () => ({ ok: true, status: 200, json: async () => ({
  chapters: [{ chapterNumber: '1', chapterEnglish: 'Revelation', chapterArabic: 'الوحي', bookSlug: 'sahih-bukhari' }],
}) });

const listFetcher = async () => ({ ok: true, status: 200, json: async () => ({
  hadiths: { data: [{ hadithNumber: '1', hadithArabic: 'إنما الأعمال', hadithEnglish: 'Actions by intentions',
    englishNarrator: 'Umar', status: 'Sahih', book: { bookSlug: 'sahih-bukhari', bookName: 'Sahih Bukhari' },
    chapter: { chapterNumber: '1', chapterEnglish: 'Revelation' } }], last_page: 1, total: 1 },
}) });

test('chapters rejects a slug outside the allowlist', async () => {
  const res = await handleHadith('/api/hadith/collections/evil-book/books', new URLSearchParams(), ENV(), ORIGIN, {});
  assert.equal(res.status, 400);
  assert.equal((await res.json()).error.retryable, false);
});

test('chapters returns normalized books for a valid slug', async () => {
  const res = await handleHadith('/api/hadith/collections/sahih-bukhari/books', new URLSearchParams(),
    ENV(), ORIGIN, { fetcher: chaptersFetcher });
  const b = await res.json();
  assert.equal(b.ok, true);
  assert.equal(b.data[0].bookName, 'Revelation');
});

test('hadith list normalizes and echoes pagination', async () => {
  const res = await handleHadith('/api/hadith/collections/sahih-bukhari/books/1/hadiths',
    new URLSearchParams('page=1&limit=25'), ENV(), ORIGIN, { fetcher: listFetcher });
  const b = await res.json();
  assert.equal(b.ok, true);
  assert.equal(b.data.hadiths[0].hadithNumber, 1);
  assert.equal(b.data.hadiths[0].grade.value, 'sahih');
  assert.equal(b.data.page, 1);
});

test('single hadith rejects a non-positive number', async () => {
  const res = await handleHadith('/api/hadith/sahih-bukhari/1/0', new URLSearchParams(), ENV(), ORIGIN, {});
  assert.equal(res.status, 400);
});

test('single hadith returns one normalized record', async () => {
  const res = await handleHadith('/api/hadith/sahih-bukhari/1/1', new URLSearchParams(),
    ENV(), ORIGIN, { fetcher: listFetcher });
  const b = await res.json();
  assert.equal(b.data.hadithNumber, 1);
  assert.equal(b.data.collectionSlug, 'sahih-bukhari');
});
```

- [ ] **Step 2: Run to verify the new tests fail**

Run: `cd worker && node --test test/hadith-router.test.js`
Expected: FAIL — the 5 new cases 404 (routes not implemented yet).

- [ ] **Step 3: Implement the three endpoints** — add these functions to `worker/src/hadith.js` above `handleHadith`, and wire the routes inside `handleHadith` before the final `return fail(...)`:

```js
async function chapters(slug, env, origin, deps) {
  if (!ALLOWED_SLUGS.has(slug)) return fail('bad_slug', `unknown collection: ${slug}`, origin, 400, false);
  if (!env.HADITH_API_KEY) return fail('no_key', 'Hadith service temporarily unavailable', origin, 503, true);
  try {
    const { data, source } = await liveOrCache(
      env.QURANLYAI_KV, hKey('chapters', slug), TTL.WEEK,
      () => chaptersUrl(env.HADITH_API_BASE_URL, env.HADITH_API_KEY, slug),
      (raw) => (raw.chapters || []).map(normalizeChapter),   // ASSUMPTION: top-level `chapters`
      deps,
    );
    return ok(data, source, origin, source === 'live' ? TTL.WEEK : 0);
  } catch (_) {
    return fail('upstream', 'Books temporarily unavailable — try again', origin, 502, true);
  }
}

async function hadithList(slug, bookNum, searchParams, env, origin, deps) {
  if (!ALLOWED_SLUGS.has(slug)) return fail('bad_slug', `unknown collection: ${slug}`, origin, 400, false);
  if (!posInt(bookNum)) return fail('bad_book', 'book number must be a positive integer', origin, 400, false);
  if (!env.HADITH_API_KEY) return fail('no_key', 'Hadith service temporarily unavailable', origin, 503, true);
  const page = posInt(searchParams.get('page')) || 1;
  const limit = Math.min(posInt(searchParams.get('limit')) || 25, 200);
  try {
    const { data, source } = await liveOrCache(
      env.QURANLYAI_KV, hKey('list', slug, bookNum, page), TTL.DAY,
      () => hadithsUrl(env.HADITH_API_BASE_URL, env.HADITH_API_KEY,
              { book: slug, chapter: bookNum, paginate: limit, page }),
      (raw) => {
        const wrap = raw.hadiths || {};                       // ASSUMPTION: `hadiths.data`
        return {
          hadiths: (wrap.data || []).map((h) => normalizeHadith(h, {})),
          page, limit, total: wrap.total ?? null, lastPage: wrap.last_page ?? null,
        };
      },
      deps,
    );
    return ok(data, source, origin, source === 'live' ? TTL.DAY : 0);
  } catch (_) {
    return fail('upstream', 'Hadiths temporarily unavailable — try again', origin, 502, true);
  }
}

async function singleHadith(slug, bookNum, num, env, origin, deps) {
  if (!ALLOWED_SLUGS.has(slug)) return fail('bad_slug', `unknown collection: ${slug}`, origin, 400, false);
  if (!posInt(bookNum) || !posInt(num)) return fail('bad_ref', 'book and hadith numbers must be positive integers', origin, 400, false);
  if (!env.HADITH_API_KEY) return fail('no_key', 'Hadith service temporarily unavailable', origin, 503, true);
  try {
    const { data, source } = await liveOrCache(
      env.QURANLYAI_KV, hKey('one', slug, bookNum, num), TTL.DAY,
      () => hadithsUrl(env.HADITH_API_BASE_URL, env.HADITH_API_KEY,
              { book: slug, chapter: bookNum, hadithNumber: num, paginate: 1 }),
      (raw) => {
        const first = (raw.hadiths && raw.hadiths.data && raw.hadiths.data[0]) || null;  // ASSUMPTION
        if (!first) throw new Error('hadith not found');
        return normalizeHadith(first, {});
      },
      deps,
    );
    return ok(data, source, origin, source === 'live' ? TTL.DAY : 0);
  } catch (_) {
    return fail('upstream', 'Hadith temporarily unavailable — try again', origin, 502, true);
  }
}
```

Wire them inside `handleHadith` (insert before the final `return fail('not_found', ...)`):

```js
  // /api/hadith/collections/:slug/books
  if (seg[0] === 'collections' && seg.length === 3 && seg[2] === 'books') {
    return chapters(seg[1], env, origin, deps);
  }
  // /api/hadith/collections/:slug/books/:bookNum/hadiths
  if (seg[0] === 'collections' && seg.length === 5 && seg[2] === 'books' && seg[4] === 'hadiths') {
    return hadithList(seg[1], seg[3], searchParams, env, origin, deps);
  }
  // /api/hadith/:slug/:bookNum/:hadithNum
  if (seg.length === 3 && ALLOWED_SLUGS.has(seg[0])) {
    return singleHadith(seg[0], seg[1], seg[2], env, origin, deps);
  }
```

- [ ] **Step 4: Run to verify all pass**

Run: `cd worker && node --test test/hadith-router.test.js`
Expected: PASS (9 tests total).

- [ ] **Step 5: Commit**

```bash
git add worker/src/hadith.js worker/test/hadith-router.test.js
git commit -m "feat(hadith): chapters, hadith-list, and single-hadith endpoints"
```

---

## Task 7: search, daily, and narrators-stub endpoints

**Files:**
- Modify: `worker/src/hadith.js`
- Modify: `worker/test/hadith-router.test.js`

- [ ] **Step 1: Add failing tests** (append):

```js
test('search rejects q shorter than 2 chars', async () => {
  const res = await handleHadith('/api/hadith/search', new URLSearchParams('q=a'), ENV(), ORIGIN, {});
  assert.equal(res.status, 400);
});

test('search returns normalized results', async () => {
  const res = await handleHadith('/api/hadith/search', new URLSearchParams('q=intention'),
    ENV(), ORIGIN, { fetcher: listFetcher });
  const b = await res.json();
  assert.equal(b.ok, true);
  assert.equal(b.data.results[0].hadithNumber, 1);
});

test('daily falls back to the static hadith when upstream fails and cache is empty', async () => {
  const failing = async () => { throw new Error('down'); };
  const res = await handleHadith('/api/hadith/daily', new URLSearchParams(), ENV(), ORIGIN, { fetcher: failing });
  const b = await res.json();
  assert.equal(b.ok, true);
  assert.equal(b.source, 'fallback');
  assert.equal(b.data.collectionSlug, 'sahih-bukhari');
  assert.equal(b.data.grade.value, 'sahih');
});

test('narrators endpoint honestly reports unavailable', async () => {
  const res = await handleHadith('/api/hadith/narrators/123', new URLSearchParams(), ENV(), ORIGIN, {});
  assert.equal(res.status, 200);
  const b = await res.json();
  assert.equal(b.data.status, 'unavailable');
});
```

- [ ] **Step 2: Run to verify new tests fail**

Run: `cd worker && node --test test/hadith-router.test.js`
Expected: FAIL — 4 new cases.

- [ ] **Step 3: Implement.** Add a static daily fallback constant near the top of `worker/src/hadith.js` (after imports):

```js
// Static fallback for /api/hadith/daily — the Intentions hadith (Bukhari #1).
// Verified: Sahih al-Bukhari, Book of Revelation, Hadith 1. Graded Sahih.
const DAILY_FALLBACK = {
  id: 'sahih-bukhari:1:1', source: 'static', sourceId: null,
  collectionSlug: 'sahih-bukhari', collectionName: 'Sahih al-Bukhari', collectionArabicName: null,
  bookNumber: 1, bookName: 'Revelation', bookArabicName: null,
  hadithNumber: 1, reference: 'Sahih al-Bukhari · Book 1 · Hadith 1',
  arabicMatn: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ',
  translation: { text: 'The reward of deeds depends upon the intentions.', language: 'en',
                 edition: 'static', translator: null },
  narrator: { id: null, name: "Umar ibn al-Khattab", arabicName: null },
  grade: { value: 'sahih', label: 'Sahih', grader: 'Imam al-Bukhari', sourceCitation: null,
           disputed: false, alternateGradings: [] },
  isnad: { status: 'unavailable', narrators: [] }, topics: [],
  audio: { status: 'unavailable', url: null, reciter: null },
  sourceMetadata: { fetchedAt: null, sourceUrlOrId: null, contentHash: 'static-bukhari-1', verificationStatus: 'curated' },
};
```

Add the handlers above `handleHadith`:

```js
async function search(searchParams, env, origin, deps) {
  const q = (searchParams.get('q') || '').trim();
  if (q.length < 2) return fail('bad_query', 'search query must be at least 2 characters', origin, 400, false);
  if (!env.HADITH_API_KEY) return fail('no_key', 'Hadith service temporarily unavailable', origin, 503, true);
  const page = posInt(searchParams.get('page')) || 1;
  const lang = searchParams.get('lang') === 'ar' ? 'ar' : 'en';
  const param = lang === 'ar' ? { hadithArabic: q } : { hadithEnglish: q };
  try {
    const { data, source } = await liveOrCache(
      env.QURANLYAI_KV, hKey('search', lang, page, q), TTL.HOUR,
      () => hadithsUrl(env.HADITH_API_BASE_URL, env.HADITH_API_KEY, { ...param, paginate: 25, page }),
      (raw) => ({ results: ((raw.hadiths && raw.hadiths.data) || []).map((h) => normalizeHadith(h, { language: lang })),
                  page, query: q }),
      deps,
    );
    return ok(data, source, origin, source === 'live' ? TTL.HOUR : 0);
  } catch (_) {
    return fail('upstream', 'Search temporarily unavailable — try again', origin, 502, true);
  }
}

async function daily(env, origin, deps) {
  const kv = env.QURANLYAI_KV;
  const day = new Date().toISOString().slice(0, 10);
  const cached = await getJson(kv, hKey('daily', day));
  if (cached) return ok(cached, 'cache', origin, 0);
  if (env.HADITH_API_KEY) {
    try {
      const raw = await fetchJson(
        hadithsUrl(env.HADITH_API_BASE_URL, env.HADITH_API_KEY, { book: 'sahih-bukhari', hadithNumber: 1, paginate: 1 }),
        { fetcher: deps.fetcher || fetch });
      const first = (raw.hadiths && raw.hadiths.data && raw.hadiths.data[0]) || null;
      if (first) {
        const data = normalizeHadith(first, {});
        await putJson(kv, hKey('daily', day), data, TTL.DAY);
        return ok(data, 'live', origin, 0);
      }
    } catch (_) { /* fall through to static */ }
  }
  return ok(DAILY_FALLBACK, 'fallback', origin, 0);
}

function narratorStub(origin) {
  // No curator store exists yet (design D4) — report honestly, never fabricate.
  return ok({ status: 'unavailable', message: 'No verified narrator data available for this narration.' }, 'fallback', origin, 0);
}
```

Wire inside `handleHadith` (before the single-hadith 3-segment rule, since `search`/`daily`/`narrators` are also short paths — order matters):

```js
  if (seg[0] === 'search' && seg.length === 1) return search(searchParams, env, origin, deps);
  if (seg[0] === 'daily' && seg.length === 1) return daily(env, origin, deps);
  if (seg[0] === 'narrators' && seg.length === 2) return narratorStub(origin);
```

> **Ordering note:** place these three rules **before** the `seg.length === 3 && ALLOWED_SLUGS.has(seg[0])` single-hadith rule. `search`/`daily`/`narrators` are not allowed slugs, so they'd fall through anyway, but explicit ordering avoids surprises.

- [ ] **Step 4: Run to verify all pass**

Run: `cd worker && node --test test/hadith-router.test.js`
Expected: PASS (13 tests total).

- [ ] **Step 5: Commit**

```bash
git add worker/src/hadith.js worker/test/hadith-router.test.js
git commit -m "feat(hadith): search, daily (static fallback), narrators-stub endpoints"
```

---

## Task 8: Wire the router into the Worker

**Files:**
- Modify: `worker/src/index.js`
- Test: `worker/test/hadith-integration.test.js`

- [ ] **Step 1: Write the failing integration test**

```js
import { test } from 'node:test';
import assert from 'node:assert';
import worker from '../src/index.js';

function fakeKV(){ const s=new Map(); return {async get(k){return s.has(k)?s.get(k):null;},async put(k,v){s.set(k,v);}}; }
const ENV = { QURANLYAI_KV: fakeKV(), HADITH_API_KEY: '', HADITH_API_BASE_URL: 'https://hadithapi.com' };

function req(path){ return new Request('https://x' + path, { headers: { Origin: 'https://islamicinfo.org' } }); }

test('/api/hadith/collections is no longer a 501 stub', async () => {
  const res = await worker.fetch(req('/api/hadith/collections'), ENV, { waitUntil(){} });
  assert.notEqual(res.status, 501);
  // With no key it returns a 503 hadith envelope, not the generic PENDING 501.
  const b = await res.json();
  assert.equal(b.ok, false);
  assert.equal(b.error.code, 'no_key');
});

test('bare /api/hadith still 404s cleanly (no crash)', async () => {
  const res = await worker.fetch(req('/api/hadith'), ENV, { waitUntil(){} });
  assert.equal(res.status, 404);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd worker && node --test test/hadith-integration.test.js`
Expected: FAIL — `/api/hadith/collections` currently returns 501 (still in `PENDING`).

- [ ] **Step 3: Edit `worker/src/index.js`:**

3a. Add the import after the existing imports (after line 24):

```js
import { handleHadith } from './hadith.js';
```

3b. Remove `/api/hadith` from the `PENDING` array so it no longer short-circuits:

```js
const PENDING = ['/api/geocode', '/api/nisab',
                 '/api/verify', '/api/subscribe'];
```

3c. Dispatch hadith GETs. Inside the `if (request.method === 'GET') {` block, **after** the edge-cache `hit` check and **before** the `let res = null;` line, add:

```js
        if (path.startsWith('/api/hadith')) {
          const res = await handleHadith(path, url.searchParams, env, origin, {});
          if (res.status === 200) await cache.put(request, res.clone());
          return res;
        }
```

- [ ] **Step 4: Run to verify it passes + full suite green**

Run: `cd worker && node --test test/hadith-integration.test.js`
Expected: PASS (2 tests).
Run: `cd worker && npm test`
Expected: PASS — all worker tests (existing + new) green.

- [ ] **Step 5: Commit**

```bash
git add worker/src/index.js worker/test/hadith-integration.test.js
git commit -m "feat(hadith): dispatch /api/hadith/* from the Worker (remove 501 stub)"
```

---

## Task 9: Shared frontend utilities

Safe utilities only — no `hadith.html` markup change. Pure/logic parts are unit-tested; DOM-dependent parts (`showToast`, `renderLoadingState`, `focusTrap`) are thin and documented.

**Files:**
- Create: `src/js/ui-utils.js`
- Test: `src/js/__tests__/ui-utils.test.js`
- Modify: `src/js/api.js` (add REST methods)

- [ ] **Step 1: Write the failing test**

```js
import { test } from 'node:test';
import assert from 'node:assert';
import { escapeHTML, safeParse } from '../ui-utils.js';

test('escapeHTML neutralizes markup', () => {
  assert.equal(escapeHTML('<img src=x onerror=alert(1)>'), '&lt;img src=x onerror=alert(1)&gt;');
  assert.equal(escapeHTML(`"a" & 'b'`), '&quot;a&quot; &amp; &#39;b&#39;');
});

test('safeParse returns fallback on bad JSON', () => {
  assert.deepEqual(safeParse('{bad', { d: 1 }), { d: 1 });
  assert.deepEqual(safeParse('{"a":2}', null), { a: 2 });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --test src/js/__tests__/ui-utils.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/js/ui-utils.js`** (ESM exports for tests; also attaches to `window.II.ui` for classic-script pages):

```js
/* Shared, framework-free UI utilities. Pure helpers are exported for tests;
   DOM helpers no-op safely outside a browser. Layers onto existing pages —
   changes no markup. */

export function escapeHTML(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export function safeParse(raw, fallback = null) {
  try { return raw == null ? fallback : JSON.parse(raw); } catch (_) { return fallback; }
}

export function safeLocalStorageGet(key, fallback = null) {
  try { return safeParse(localStorage.getItem(key), fallback); } catch (_) { return fallback; }
}

export function safeLocalStorageSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch (e) {
    if (e && e.name === 'QuotaExceededError') showToast('Storage full — clear some bookmarks or notes.');
    return false;
  }
}

export async function apiFetchWithTimeout(url, { timeoutMs = 8000, ...opts } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...opts, signal: ctrl.signal });
    return res;
  } finally { clearTimeout(t); }
}

export function showToast(msg) {
  if (typeof document === 'undefined') return;
  let t = document.getElementById('hadith-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'hadith-toast';
    t.style.cssText = 'position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(12px);' +
      'background:#0A3A3D;color:rgba(255,255,255,.9);padding:10px 22px;border-radius:20px;font-size:13px;' +
      'font-weight:500;z-index:9999;opacity:0;transition:opacity .28s,transform .28s;pointer-events:none;' +
      'white-space:nowrap;box-shadow:0 8px 24px rgba(0,0,0,.25);';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = '1'; t.style.transform = 'translateX(-50%) translateY(0)';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(-50%) translateY(12px)'; }, 2200);
}

export function renderLoadingState(el, count = 3) {
  if (!el) return;
  el.innerHTML = Array.from({ length: count }, () =>
    '<div class="hadith-card" aria-hidden="true" style="opacity:.5;"><div class="hadith-teal-bar"></div>' +
    '<div class="hadith-inner"><div style="height:14px;width:40%;background:rgba(0,105,110,.1);border-radius:6px;margin-bottom:14px;"></div>' +
    '<div style="height:60px;background:rgba(0,105,110,.06);border-radius:10px;"></div></div></div>').join('');
}

export function renderErrorState(el, message, onRetry) {
  if (!el) return;
  el.innerHTML = '<div class="hadith-card"><div class="hadith-inner" style="text-align:center;padding:32px;">' +
    '<div style="color:var(--ink-muted);margin-bottom:14px;">' + escapeHTML(message) + '</div>' +
    '<button class="footer-action-btn primary" id="hadith-retry-btn">Try again</button></div></div>';
  const btn = el.querySelector('#hadith-retry-btn');
  if (btn && onRetry) btn.addEventListener('click', onRetry);
}

export function focusTrap(container) {
  if (!container) return () => {};
  const sel = 'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])';
  function onKey(e) {
    if (e.key !== 'Tab') return;
    const items = Array.from(container.querySelectorAll(sel)).filter((n) => n.offsetParent !== null);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  container.addEventListener('keydown', onKey);
  return () => container.removeEventListener('keydown', onKey);
}

/* Expose on window.II.ui for classic-script (non-module) pages. */
if (typeof window !== 'undefined') {
  window.II = window.II || {};
  window.II.ui = { escapeHTML, safeParse, safeLocalStorageGet, safeLocalStorageSet,
    apiFetchWithTimeout, showToast, renderLoadingState, renderErrorState, focusTrap };
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `node --test src/js/__tests__/ui-utils.test.js`
Expected: PASS (2 tests).

- [ ] **Step 5: Add REST client methods to `src/js/api.js`** — inside the `(function (root){ ... })` IIFE where the other `fetch*` functions live, add these to the exported API object (match the existing `window.II.api` export style already used in the file):

```js
  /* ─── Hadith Library REST endpoints (Module 0 · D3) ─────────────── */
  const API_BASE = (root.II && root.II.API_BASE) || 'https://islamicinfo-api.islamicinfo.workers.dev';

  async function _getJson(path) {
    try {
      const res = await fetch(API_BASE + path, { headers: { 'Accept': 'application/json' } });
      const body = await res.json();
      return body; // uniform { ok, data?, error?, source }
    } catch (_) {
      return { ok: false, error: { code: 'network', message: 'Network error', retryable: true }, source: 'fallback' };
    }
  }

  function fetchHadithCollections() { return _getJson('/api/hadith/collections'); }
  function fetchHadithBooks(slug) { return _getJson('/api/hadith/collections/' + encodeURIComponent(slug) + '/books'); }
  function fetchHadithList(slug, book, page = 1, limit = 25) {
    return _getJson('/api/hadith/collections/' + encodeURIComponent(slug) + '/books/' + book + '/hadiths?page=' + page + '&limit=' + limit);
  }
  function fetchHadithOne(slug, book, num) {
    return _getJson('/api/hadith/' + encodeURIComponent(slug) + '/' + book + '/' + num);
  }
  function fetchHadithSearch(q, lang = 'en', page = 1) {
    return _getJson('/api/hadith/search?q=' + encodeURIComponent(q) + '&lang=' + lang + '&page=' + page);
  }
  function fetchHadithDaily() { return _getJson('/api/hadith/daily'); }
```

Then add each name to the object assigned to `window.II.api` (the file already builds this object — append the six functions to it).

- [ ] **Step 6: Run the whole JS test set to confirm nothing broke**

Run: `node --test src/js/__tests__/*.test.js`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/js/ui-utils.js src/js/__tests__/ui-utils.test.js src/js/api.js
git commit -m "feat(hadith): shared UI utils + REST client methods (no markup change)"
```

---

## Task 10: Docs, ADRs & no-secret-leak guard

**Files:**
- Modify: `docs/API-SPEC.md`
- Modify: `docs/DATA.md`
- Modify: `docs/DECISIONS.md`
- Test: `worker/test/no-secret-leak.test.js`

- [ ] **Step 1: Write the failing guard test**

```js
import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';

// The API key must never appear in any client-shipped file.
const clientFiles = ['../src/js/api.js', '../src/js/hadith.js', '../src/js/ui-utils.js'];

test('no client file references the hadith API key or a raw hadithapi apiKey value', () => {
  for (const rel of clientFiles) {
    let src = '';
    try { src = readFileSync(new URL(rel, import.meta.url), 'utf8'); } catch (_) { continue; }
    assert.ok(!/HADITH_API_KEY/.test(src), `${rel} must not mention HADITH_API_KEY`);
    assert.ok(!/hadithapi\.com[^\s"']*apiKey=/.test(src), `${rel} must not build a hadithapi apiKey URL`);
  }
});
```

- [ ] **Step 2: Run to verify it passes immediately** (this is a guard, not TDD — it should already be green because client code never touches the key)

Run: `cd worker && node --test test/no-secret-leak.test.js`
Expected: PASS.

- [ ] **Step 3: Update `docs/API-SPEC.md`** — replace the `/api/hadith` row/section with the hadithapi-backed REST contract. Add this block after the existing `/api/hadith` GET section:

```markdown
## Hadith Library — `/api/hadith/*` (Module 0 · hadithapi.com-backed)

> Source is **hadithapi.com** (ADR-020), not Sunnah.com. Key is a Worker secret
> (`HADITH_API_KEY`), passed upstream as `?apiKey=`, never in client code.
> All responses use the envelope `{ ok, data?, error?:{code,message,retryable}, source:'live'|'cache'|'fallback' }`.

| Endpoint | Method | Cache | Notes |
|---|---|---|---|
| `/api/hadith/collections` | GET | KV 7d | normalized collections list |
| `/api/hadith/collections/:slug/books` | GET | KV 7d | chapters within a collection |
| `/api/hadith/collections/:slug/books/:bookNum/hadiths?page=&limit=` | GET | KV 24h | paginated feed (limit ≤200) |
| `/api/hadith/:slug/:bookNum/:hadithNum` | GET | KV 24h | single hadith |
| `/api/hadith/search?q=&scope=&lang=&page=` | GET | KV 1h | `q` trimmed ≥2 chars |
| `/api/hadith/daily` | GET | KV to UTC midnight | static Bukhari #1 fallback |
| `/api/hadith/narrators/:id` | GET | — | **stub** → `{status:'unavailable'}` (no curator store yet) |

Allowed slugs: `sahih-bukhari, sahih-muslim, al-tirmidhi, abu-dawood, ibn-e-majah, sunan-nasai, mishkat, musnad-ahmad, al-silsila-sahiha`.
Content: grade + grader always present (missing → "Grade Unknown"); isnad/narrator/audio render `unavailable` until curated.
```

- [ ] **Step 4: Update `docs/DATA.md`** — replace the three `islamicinfo-hadith-{...}` server/cache references that mention Sunnah.com, and add the KV cache keys. Append to the server-side cache-keys section:

```markdown
### Hadith Library KV cache (Module 0 — namespace `QURANLYAI_KV`, `hadith:` prefix)
| Key | TTL |
|---|---|
| `hadith:collections` | 7d |
| `hadith:chapters:{slug}` | 7d |
| `hadith:list:{slug}:{book}:{page}` | 24h |
| `hadith:one:{slug}:{book}:{num}` | 24h |
| `hadith:daily:{YYYY-MM-DD}` | to UTC midnight |
| `hadith:search:{lang}:{page}:{q}` | 1h |
```

- [ ] **Step 5: Add ADRs to `docs/DECISIONS.md`** (append):

```markdown
## ADR-020: hadithapi.com as the sole Hadith source (supersedes Sunnah.com)
**2026-07-19 · Accepted.** The PRD/TechSpec/API-SPEC were written around Sunnah.com.
Per product direction, hadithapi.com is now the only hadith source. Requires a
`HADITH_API_KEY` Worker secret; upstream auth is a `?apiKey=` query param (server-side only).
Consequence: all Sunnah.com references in the hadith docs are superseded.

## ADR-021: REST sub-path endpoints for the Hadith Library (supersedes query-param contract)
**2026-07-19 · Accepted.** The legacy `/api/hadith?collection=&book=` contract in api.js is
replaced by REST sub-paths (`/api/hadith/collections/:slug/books/:bookNum/hadiths`, etc.),
matching the PRD route map. Backend is the existing Cloudflare Worker + KV — **not** the
Supabase Postgres stack described in the Module 0 prompt (deferred as YAGNI until a curator
enrichment pipeline exists; Cloudflare D1 is the future relational option if needed).
```

- [ ] **Step 6: Commit**

```bash
git add docs/API-SPEC.md docs/DATA.md docs/DECISIONS.md worker/test/no-secret-leak.test.js
git commit -m "docs(hadith): API-SPEC/DATA hadithapi contract + ADR-020/021 + secret-leak guard"
```

---

## Final verification (run before declaring Module 0 done)

- [ ] **Full worker suite:** `cd worker && npm test` → all green.
- [ ] **Client JS tests:** `node --test src/js/__tests__/*.test.js` → all green.
- [ ] **No-secret guard:** confirmed green (Task 10).
- [ ] **Live field-map check (needs real key):** once `HADITH_API_KEY` is set, hit each endpoint via `npx wrangler dev` and confirm the adapter's `ASSUMPTION`-marked field reads match the real response; adjust field reads only.
- [ ] **Standard Module 0 report:** produce the required per-module report — (1) existing `hadith.html` elements handled (none rewired; utils layer only), (2) files/endpoints/tables added, (3) real data fields rendered, (4) acceptance checklist PASS/FAIL, (5) verification note (VERIFIED | SOURCE | UNAVAILABLE FIELDS | ASSUMPTIONS | HUMAN REVIEW REQUIRED).
- [ ] **DoD gates:** Universal + API gate (API-SPEC updated, no client key, fallback works) + Data gate (keys in DATA.md) per `DEFINITION-OF-DONE.md`.

---

## Self-Review Notes (author)

- **Spec coverage:** §4 API surface → Tasks 5–8; §5 adapter → Task 3; §6 KV → Task 4 + endpoints; §7 safety gate → Task 3 (grade never dropped) + enrichment-unavailable across Tasks 3/7 + narrators stub Task 7; §8 frontend utils → Task 9; §9 validation/secrets → Tasks 1,5,6,7; §10 tests → every task + Task 10 guard; §11 doc debt → Task 10.
- **Deferred per design (not gaps):** `verify-or-enrich` write path (D4) and Supabase tables (D1) are intentionally out of scope.
- **Known assumption:** hadithapi.com response field names — flagged inline and gated by the final live-key check.
