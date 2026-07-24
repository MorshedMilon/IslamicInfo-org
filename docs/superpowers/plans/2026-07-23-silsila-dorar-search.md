# Silsila as-Sahiha — Dorar Arabic Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static "reference-linked" Silsila as-Sahiha page with an Arabic keyword-search interface into Dorar.net (scoped to al-Albani's Silsila), rendering each narration's Arabic text + al-Albani's ruling (خلاصة حكم المحدث) shown VERBATIM + a per-card "Ask QuranlyAI" button, shipped behind a default-OFF flag.

**Architecture:** A new Cloudflare Worker endpoint `GET /api/hadith/dorar/search` calls dorar.net's public `dorar_api.json` endpoint server-side (filtered to Silsila book id 561), parses the returned HTML fragment into normalized items with a pure parser, caches in KV, and applies a per-IP quota. The frontend Silsila route becomes a search view rendering Dorar cards via a pure `dorar-card-core.js`. Everything is gated by `HADITH_SILSILA_DORAR_ENABLED` (default OFF) so the current reference card keeps shipping until the terms/reachability gates clear.

**Tech Stack:** Cloudflare Worker (ES modules), KV cache, vanilla UMD `-core.js` frontend modules, `node --test` (worker/), existing `hadith-citation-core` + `window.QuranlyAI` panel.

**Design source:** `docs/superpowers/specs/2026-07-23-silsila-sahiha-dorar-search-design.md`

**Test runner:** all worker tests run from `worker/` with `npm test` (`node --test "test/*.test.js"`). Individual file: `node --test test/<name>.test.js`.

**Reference constants (verified from the MIT wrapper `AhmedElTabarani/dorar-hadith-api`, ported logic credited in code):**
- API endpoint: `https://dorar.net/dorar_api.json?skey={q}` (JSONish: `{ ahadith: { result: "<html fragment>" } }`)
- Silsila as-Sahiha book filter: `s[]=561` (from the wrapper's `data/book.json`, `{key:"561", value:"السلسلة الصحيحة"}`)
- Result HTML: each `<div class="hadith">` matn node is immediately followed by a `<div class="hadith-info">` block; inside it, `.info-subtitle` labels precede their values. Parse by LABEL, not position (labels vary).
- Arabic labels: الراوي (narrator) / المحدث (grader) / المصدر (book) / الصفحة أو الرقم (page/number) / **خلاصة حكم المحدث (ruling — the field Silsila actually uses)** / درجة الحديث (one-word grade — usually ABSENT for Silsila).
- **Verified (Task 0 live fixture):** Silsila entries carry خلاصة حكم المحدث (paragraph ruling), never درجة الحديث; `numberOrPage` is page-style (e.g. "6/778"). Ruling is shown verbatim, never mapped to a grade badge (owner decision 2026-07-23).

---

## File structure

**Create:**
- `worker/src/lib/dorar-source.js` — pure URL builder + fetch of the Dorar API (injectable fetcher). One job: talk to dorar.net, return the raw HTML result string.
- `worker/src/lib/dorar-parse.js` — pure parser: HTML fragment → normalized Silsila items (label-keyed extraction, ruling verbatim, `buildSilsilaReference`, book post-filter, fail-closed drop). No network, no DOM API.
- `src/js/dorar-card-core.js` — pure UMD: `buildDorarCardHTML(item)` → card string (Arabic RTL, grade badge, citation, Source·Dorar.net, Ask button). Escapes all text.
- `worker/test/dorar-source.test.js`, `worker/test/dorar-parse.test.js`, `worker/test/dorar-card-core.test.js`, `worker/test/dorar-endpoint.test.js`
- `worker/test/fixtures/dorar-silsila-api.json` — a REAL captured Dorar response (Task 0).

**Modify:**
- `worker/src/hadith.js` — add the `/api/hadith/dorar/search` route (guard, quota, cache, source+parse, envelope, flag gate).
- `worker/src/lib/hadith-cache.js` — add a KV key helper + TTL for dorar search (if not reusable as-is).
- `src/js/api.js` — add `fetchDorarSilsila(q, page)`.
- `src/js/hadith.js` — Silsila route → search view; remove `REFERENCE_LINKED`/`renderReferenceCard`/`↗ ref` badge/route branch; wire search box + cards + Ask button.
- `hadith.html` — add `<script>` tags for `dorar-card-core.js` + the QuranlyAI widget; remove now-dead `.ref-collection` CSS if unused.
- `src/data/hadith/collections.json` — re-flag `al-silsila-sahiha` as Dorar-search-backed.
- `worker/wrangler.toml` — declare `HADITH_SILSILA_DORAR_ENABLED` var (default "false").
- `doc/API-SPEC.md`, `doc/DATA.md`, `doc/DECISIONS.md` — document endpoint + ADR reversing 35bcc19.

---

## Task 0: Probe & pin the live Dorar response (capture fixture)

**Why first:** the parser must be written against Dorar's REAL HTML, and we must confirm (a) the Worker's server-side fetch isn't 403-blocked and (b) `s[]=561` actually scopes to Silsila. This task produces the fixture every later test depends on.

**Files:**
- Create: `worker/test/fixtures/dorar-silsila-api.json`

- [ ] **Step 1: Fetch a real Silsila search response and save it**

Run (from repo root):
```bash
curl -s -A "IslamicInfo.org proxy (hello@islamicinfo.org)" \
  "https://dorar.net/dorar_api.json?skey=%D8%A7%D9%84%D9%86%D9%8A%D8%A9&s[]=561" \
  -o worker/test/fixtures/dorar-silsila-api.json
head -c 600 worker/test/fixtures/dorar-silsila-api.json
```
(`skey` here is "النية" URL-encoded.)

Expected: a JSON body containing `"ahadith"` and a `"result"` string with HTML including `hadith-info` and `info-subtitle`. If you get HTTP 403 / a Cloudflare challenge / empty body, **STOP** and report: the Worker path is blocked and we must fall back to self-hosting the MIT wrapper (out of scope for this plan — raise with the owner).

- [ ] **Step 2: Confirm the fixture is Silsila-scoped and inspect structure**

Run:
```bash
node -e "const d=require('./worker/test/fixtures/dorar-silsila-api.json'); const h=d.ahadith.result; console.log('has hadith-info:', h.includes('hadith-info')); console.log('has info-subtitle:', h.includes('info-subtitle')); console.log('mentions Silsila:', h.includes('السلسلة الصحيحة'));"
```
Expected: all three `true`. Read the raw `result` HTML and note the exact tag wrapping around `.hadith-info` and each `.info-subtitle` value — this is the ground truth for the Task 2 regex. If `s[]=561` did NOT scope to Silsila (blocks cite other books), note it: the parser's book post-filter (Task 2) is the safety net, keep going.

- [ ] **Step 3: Commit the fixture**

```bash
git add worker/test/fixtures/dorar-silsila-api.json
git commit -m "test(dorar): capture real Silsila search fixture from dorar_api.json"
```

---

## Task 1: `dorar-source.js` — build URL + fetch (pure, injectable)

**Files:**
- Create: `worker/src/lib/dorar-source.js`
- Test: `worker/test/dorar-source.test.js`

- [ ] **Step 1: Write the failing test**

```js
// worker/test/dorar-source.test.js
import { test } from 'node:test';
import assert from 'node:assert';
import { SILSILA_BOOK_ID, dorarSearchUrl, fetchDorarResult } from '../src/lib/dorar-source.js';

test('SILSILA_BOOK_ID is the Dorar book id for al-Silsila as-Sahiha', () => {
  assert.equal(SILSILA_BOOK_ID, '561');
});

test('dorarSearchUrl encodes the query as skey and scopes to Silsila via s[]=561', () => {
  const u = dorarSearchUrl('النية', 1);
  assert.ok(u.startsWith('https://dorar.net/dorar_api.json?'));
  assert.match(u, /skey=%D8%A7%D9%84%D9%86%D9%8A%D8%A9/); // النية encoded
  assert.match(u, /s%5B%5D=561|s\[\]=561/);              // s[]=561 (encoded or raw)
});

test('dorarSearchUrl adds page when > 1', () => {
  assert.match(dorarSearchUrl('x', 3), /page=3/);
});

test('fetchDorarResult returns the ahadith.result HTML string via injected fetcher', async () => {
  const fakeFetcher = async () => ({ ok: true, json: async () => ({ ahadith: { result: '<div class="hadith-info"></div>' } }) });
  const html = await fetchDorarResult('x', 1, { fetcher: fakeFetcher });
  assert.equal(html, '<div class="hadith-info"></div>');
});

test('fetchDorarResult throws on non-ok upstream', async () => {
  const fakeFetcher = async () => ({ ok: false, status: 403, json: async () => ({}) });
  await assert.rejects(() => fetchDorarResult('x', 1, { fetcher: fakeFetcher }), /upstream/);
});

test('fetchDorarResult throws when ahadith.result missing', async () => {
  const fakeFetcher = async () => ({ ok: true, json: async () => ({}) });
  await assert.rejects(() => fetchDorarResult('x', 1, { fetcher: fakeFetcher }), /result/);
});
```

- [ ] **Step 2: Run it, verify it fails**

Run: `cd worker && node --test test/dorar-source.test.js`
Expected: FAIL (`Cannot find module '../src/lib/dorar-source.js'`).

- [ ] **Step 3: Implement `dorar-source.js`**

```js
// worker/src/lib/dorar-source.js
/* Dorar.net Hadith Encyclopedia (الموسوعة الحديثية) source client — server-side ONLY.
   Talks to the public dorar_api.json endpoint and returns the raw HTML result string.
   URL/param mechanics and the Silsila book id (561) are verified against the
   MIT-licensed wrapper github.com/AhmedElTabarani/dorar-hadith-api. `fetcher` is
   injectable so this is unit-testable without a network. */

export const SILSILA_BOOK_ID = '561'; // السلسلة الصحيحة (al-Albani) — dorar book id

// Build the Dorar API URL. Query goes in as `skey`; `s[]=561` scopes to Silsila.
export function dorarSearchUrl(query, page = 1) {
  const p = new URLSearchParams();
  p.set('skey', String(query == null ? '' : query));
  p.append('s[]', SILSILA_BOOK_ID);
  if (Number(page) > 1) p.set('page', String(parseInt(page, 10)));
  return `https://dorar.net/dorar_api.json?${p.toString()}`;
}

export async function fetchDorarResult(query, page = 1, { fetcher = fetch, timeoutMs = 8000 } = {}) {
  const url = dorarSearchUrl(query, page);
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetcher(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'IslamicInfo.org proxy (hello@islamicinfo.org)' },
    });
    if (!res.ok) throw new Error(`upstream HTTP ${res.status}`);
    const data = await res.json();
    const html = data && data.ahadith && data.ahadith.result;
    if (!html) throw new Error('missing ahadith.result in Dorar response');
    return html;
  } finally {
    clearTimeout(t);
  }
}
```

- [ ] **Step 4: Run tests, verify pass**

Run: `cd worker && node --test test/dorar-source.test.js`
Expected: PASS (6/6).

- [ ] **Step 5: Commit**

```bash
git add worker/src/lib/dorar-source.js worker/test/dorar-source.test.js
git commit -m "feat(dorar): Silsila source client (URL builder + injectable fetch)"
```

---

## Task 2: `dorar-parse.js` — HTML fragment → normalized items (pure)

**Files:**
- Create: `worker/src/lib/dorar-parse.js`
- Test: `worker/test/dorar-parse.test.js`

Parser strategy (Workers have no DOM/cheerio; keep it dependency-free and fail-closed): a global regex pairs each `<div class="hadith">…</div>` (matn) with the immediately-following `<div class="hadith-info">…</div>` (info). Fields are keyed **by Arabic label** (order varies — the grade label may be absent), not by position. The ruling is `خلاصة حكم المحدث` **verbatim** (fallback `درجة الحديث` only if that's the sole ruling label). `numberOrPage` is kept **verbatim** (page-style like "6/778", never coerced to an integer). Drop any pair without an Arabic matn AND a ruling AND book === Silsila. **A dropped block is correct behaviour — never emit a half-parsed narration, never derive a grade badge.**

- [ ] **Step 1: Write the failing test (inline fixtures mirror the real Task-0 structure)**

```js
// worker/test/dorar-parse.test.js
import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { parseDorarResult, buildSilsilaReference } from '../src/lib/dorar-parse.js';

// Mirrors the real dorar_api.json result: a `.hadith` matn div then a `.hadith-info`
// block of `.info-subtitle` labels. Silsila entries use خلاصة حكم المحدث (a paragraph),
// NOT درجة الحديث. Task 0's captured fixture is the ground truth for the wrapping.
const BLOCK = (over = {}) => `
  <div class="hadith" style="text-align:justify;">1 -   ${'matn' in over ? over.matn : 'إنما الأعمال بالنيات'}</div>
  <div class="hadith-info">
    <span class="info-subtitle">الراوي:</span> ${over.rawi ?? 'عائشة أم المؤمنين'}</span>
    <span class="info-subtitle">المحدث:</span> ${over.mohdith ?? 'الألباني'}
    <span class="info-subtitle">المصدر:</span>  ${over.book ?? 'السلسلة الصحيحة'}
    <span class="info-subtitle">الصفحة أو الرقم:</span>  ${'num' in over ? over.num : '6/778'}
    <span class="info-subtitle">خلاصة حكم المحدث:</span>  <span >${'ruling' in over ? over.ruling : 'رجاله ثقات رجال مسلم إلا أنه منقطع'}</span>
  </div>`;

test('buildSilsilaReference: verbatim ref when present, collection-only when absent', () => {
  assert.equal(buildSilsilaReference('6/778'), 'Al-Silsilah al-Sahihah — 6/778');
  assert.equal(buildSilsilaReference('52'), 'Al-Silsilah al-Sahihah — 52');
  assert.equal(buildSilsilaReference(''), 'Al-Silsilah al-Sahihah');
  assert.equal(buildSilsilaReference(null), 'Al-Silsilah al-Sahihah');
});

test('parseDorarResult returns one normalized Silsila item (ruling verbatim, page-style ref)', () => {
  const items = parseDorarResult(BLOCK());
  assert.equal(items.length, 1);
  const it = items[0];
  assert.match(it.arabicMatn, /إنما الأعمال بالنيات/);
  assert.ok(!/^\s*1\s*-/.test(it.arabicMatn));      // leading "1 -" stripped
  assert.equal(it.narrator, 'عائشة أم المؤمنين');
  assert.equal(it.ruling, 'رجاله ثقات رجال مسلم إلا أنه منقطع'); // VERBATIM, unmapped
  assert.equal(it.grader, 'الألباني');
  assert.equal(it.rulingSource, 'Dorar.net');
  assert.equal(it.collectionSlug, 'al-silsila-sahiha');
  assert.equal(it.numberOrPage, '6/778');           // verbatim page-style, not coerced
  assert.equal(it.reference, 'Al-Silsilah al-Sahihah — 6/778');
  assert.equal(it.grade, undefined);                // NO grade vocab/badge field
});

test('parseDorarResult: falls back to درجة الحديث when it is the only ruling label', () => {
  const html = `
    <div class="hadith">1 - متن</div>
    <div class="hadith-info">
      <span class="info-subtitle">المحدث:</span> الألباني
      <span class="info-subtitle">المصدر:</span> السلسلة الصحيحة
      <span class="info-subtitle">درجة الحديث:</span> صحيح
    </div>`;
  const it = parseDorarResult(html)[0];
  assert.equal(it.ruling, 'صحيح');                  // used verbatim, still not badge-mapped
});

test('parseDorarResult: no number at all → reference is collection-only', () => {
  const items = parseDorarResult(BLOCK({ num: '' }));
  assert.equal(items[0].numberOrPage, null);
  assert.equal(items[0].reference, 'Al-Silsilah al-Sahihah');
});

test('parseDorarResult drops a block whose book is not Silsila (scope safety net)', () => {
  assert.equal(parseDorarResult(BLOCK({ book: 'صحيح البخاري' })).length, 0);
});

test('parseDorarResult drops a block with no matn or no ruling (never half-parsed)', () => {
  assert.equal(parseDorarResult(BLOCK({ matn: '' })).length, 0);
  assert.equal(parseDorarResult(BLOCK({ ruling: '' })).length, 0);
});

test('parseDorarResult handles the real captured fixture: 1 item, ruling + reference set', () => {
  const d = JSON.parse(readFileSync(new URL('./fixtures/dorar-silsila-api.json', import.meta.url)));
  const items = parseDorarResult(d.ahadith.result);
  assert.equal(items.length, 1);
  assert.equal(items[0].grader, 'الألباني');
  assert.match(items[0].ruling, /رجاله ثقات/);
  assert.equal(items[0].numberOrPage, '6/778');
  assert.equal(items[0].reference, 'Al-Silsilah al-Sahihah — 6/778');
});
```

- [ ] **Step 2: Run it, verify it fails**

Run: `cd worker && node --test test/dorar-parse.test.js`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `dorar-parse.js`**

```js
// worker/src/lib/dorar-parse.js
/* Pure parser: Dorar dorar_api.json HTML `result` fragment → normalized Silsila
   items. NO network, NO DOM API (runs in a Worker). Structure ported from the
   MIT-licensed github.com/AhmedElTabarani/dorar-hadith-api: each hadith text
   (`<div class="hadith">`) precedes a `<div class="hadith-info">` block whose
   `.info-subtitle` labels are the Arabic field names. We key by LABEL (order
   varies), not by position.

   Silsila entries carry خلاصة حكم المحدث (al-Albani's paragraph ruling), NOT a
   clean درجة الحديث grade (verified against live data 2026-07-23). We keep the
   ruling VERBATIM and never derive a one-word grade — reducing a nuanced ruling
   to a badge would misrepresent it. Fail-closed: a pair without an Arabic matn
   AND a ruling AND book === Silsila is DROPPED. */

const SILSILA_BOOK = 'السلسلة الصحيحة';
const L = {
  narrator: 'الراوي',
  grader: 'المحدث',
  book: 'المصدر',
  numberOrPage: 'الصفحة أو الرقم',
  ruling: 'خلاصة حكم المحدث',
  grade: 'درجة الحديث', // fallback ruling label (rare for Silsila)
};

// Strip tags → plain text, collapse whitespace, decode the few entities Dorar emits.
function textOf(html) {
  return String(html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ').trim();
}

// "Al-Silsilah al-Sahihah — <ref>" (ref VERBATIM, e.g. "6/778"), or collection-only.
export function buildSilsilaReference(numberOrPage) {
  const ref = String(numberOrPage == null ? '' : numberOrPage).trim();
  return ref ? 'Al-Silsilah al-Sahihah — ' + ref : 'Al-Silsilah al-Sahihah';
}

// Parse one `.hadith-info` inner HTML into { arabicLabel -> value }, keyed by the
// text of each `.info-subtitle` (order-independent). Value = text after the label's
// closing </span> up to the next `.info-subtitle`.
function parseInfo(infoHtml) {
  const out = {};
  const parts = String(infoHtml).split(/<span[^>]*class="[^"]*info-subtitle[^"]*"[^>]*>/i);
  for (let i = 1; i < parts.length; i++) {
    const chunk = parts[i];
    const close = chunk.indexOf('</span>');
    if (close === -1) continue;
    const label = textOf(chunk.slice(0, close)).replace(/:\s*$/, '').trim();
    if (label) out[label] = textOf(chunk.slice(close + '</span>'.length));
  }
  return out;
}

export function parseDorarResult(resultHtml) {
  const html = String(resultHtml || '');
  // Pair each matn div with the immediately-following hadith-info div. `class="hadith"`
  // (optionally with more classes) must NOT match `class="hadith-info"` — the
  // `(?:\s[^"]*)?"` guard requires a quote or space after "hadith", excluding "hadith-info".
  const re = /<div\s+class="hadith(?:\s[^"]*)?"[^>]*>([\s\S]*?)<\/div>\s*<div\s+class="hadith-info(?:\s[^"]*)?"[^>]*>([\s\S]*?)<\/div>/gi;
  const items = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    const matn = textOf(m[1]).replace(/^\d+\s*-\s*/, '').trim();
    const info = parseInfo(m[2]);
    const book = info[L.book] || '';
    const ruling = info[L.ruling] || info[L.grade] || '';     // paragraph verbatim; درجة fallback
    const numberOrPage = info[L.numberOrPage] || null;

    if (!matn) continue;                                      // no text → drop
    if (!ruling) continue;                                    // no ruling → drop (never unattributed)
    if (book.indexOf(SILSILA_BOOK) === -1) continue;          // scope safety net

    items.push({
      arabicMatn: matn,
      narrator: info[L.narrator] || null,
      ruling: ruling,                                         // VERBATIM — never badge-mapped
      grader: info[L.grader] || null,
      rulingSource: 'Dorar.net',
      collectionSlug: 'al-silsila-sahiha',
      collectionName: 'Al-Silsilah al-Sahihah',
      numberOrPage: numberOrPage,                             // verbatim page-style string or null
      reference: buildSilsilaReference(numberOrPage),
    });
  }
  return items;
}
```

- [ ] **Step 4: Run tests; iterate the regex against the REAL fixture if needed**

Run: `cd worker && node --test test/dorar-parse.test.js`
Expected: PASS (7/7). If the "real captured fixture" test fails, open `worker/test/fixtures/dorar-silsila-api.json`, compare the actual tag/attribute wrapping to the pairing regex / `parseInfo`, and adjust the regex to match the real markup — keeping every assertion unchanged. (Expected TDD iteration against an undocumented HTML source, not a rewrite.)

- [ ] **Step 5: Commit**

```bash
git add worker/src/lib/dorar-parse.js worker/test/dorar-parse.test.js
git commit -m "feat(dorar): pure parser for Silsila (label-keyed, ruling verbatim, fail-closed)"
```

---

## Task 3: Citation (Silsila-specific — NOT `hadith-citation-core`)

**No work here.** Silsila's ref is page-style (e.g. "6/778"), so it does NOT use
the site-wide `[Collection] [Number]` format. Citation is built by
`buildSilsilaReference(numberOrPage)` in `dorar-parse.js`, already implemented and
tested in Task 2 (`"Al-Silsilah al-Sahihah — 6/778"` / `"Al-Silsilah al-Sahihah"`).
`hadith-citation-core.js` is left untouched. Skip to Task 4.

---

## Task 4: Worker endpoint `/api/hadith/dorar/search`

**Files:**
- Modify: `worker/src/hadith.js`
- Test: `worker/test/dorar-endpoint.test.js`

The endpoint: flag gate → query guard → per-IP daily quota → KV cache → `fetchDorarResult` → `parseDorarResult` → set `reference` via `buildReference` → envelope. Fail-closed on any upstream/parse error.

- [ ] **Step 1: Read the current router shape**

Read `worker/src/hadith.js` (the `ok`/`fail` helpers, how routes are dispatched, how KV + `HADITH_API_*` env are read, and the existing quota pattern if present — otherwise mirror the QuranlyAI quota in `worker/src/quranlyai.js`). Note the exact function that maps a request path to a handler.

- [ ] **Step 2: Write the failing test**

```js
// worker/test/dorar-endpoint.test.js
import { test } from 'node:test';
import assert from 'node:assert';
import { handleDorarSearch } from '../src/hadith.js';

function fakeKV() {
  const m = new Map();
  return { get: async (k) => m.get(k) ?? null, put: async (k, v) => void m.set(k, v), _m: m };
}
const RESULT = { ahadith: { result:
  '<div class="hadith">1 - إنما الأعمال بالنيات</div>' +
  '<div class="hadith-info">' +
  '<span class="info-subtitle">الراوي:</span> عمر' +
  '<span class="info-subtitle">المحدث:</span> الألباني' +
  '<span class="info-subtitle">المصدر:</span> السلسلة الصحيحة' +
  '<span class="info-subtitle">الصفحة أو الرقم:</span> 6/778' +
  '<span class="info-subtitle">خلاصة حكم المحدث:</span> رجاله ثقات</div>' } };
const ENV = (over = {}) => ({ QURANLYAI_KV: fakeKV(), HADITH_SILSILA_DORAR_ENABLED: 'true', ...over });
const okFetcher = async () => ({ ok: true, json: async () => RESULT });

test('flag OFF → 404-style disabled envelope, no upstream call', async () => {
  let called = false;
  const res = await handleDorarSearch({ query: 'x', page: 1, ip: '1.1.1.1' },
    ENV({ HADITH_SILSILA_DORAR_ENABLED: 'false' }), { fetcher: async () => { called = true; } });
  const body = await res.json();
  assert.equal(body.ok, false);
  assert.equal(body.error.code, 'disabled');
  assert.equal(called, false);
});

test('empty query → bad_query, no upstream call', async () => {
  let called = false;
  const res = await handleDorarSearch({ query: '   ', page: 1, ip: '1.1.1.1' },
    ENV(), { fetcher: async () => { called = true; } });
  const body = await res.json();
  assert.equal(body.ok, false);
  assert.equal(body.error.code, 'bad_query');
  assert.equal(called, false);
});

test('happy path → normalized items with reference set', async () => {
  const res = await handleDorarSearch({ query: 'النية', page: 1, ip: '1.1.1.1' }, ENV(), { fetcher: okFetcher });
  const body = await res.json();
  assert.equal(body.ok, true);
  assert.equal(body.data.items.length, 1);
  assert.equal(body.data.items[0].reference, 'Al-Silsilah al-Sahihah — 6/778');
  assert.equal(body.data.items[0].grader, 'الألباني');
  assert.match(body.data.items[0].ruling, /رجاله ثقات/);
  assert.equal(body.data.items[0].grade, undefined); // no grade badge/vocab
  assert.equal(body.source, 'live');
});

test('second identical call is served from cache', async () => {
  const env = ENV();
  const args = { query: 'النية', page: 1, ip: '1.1.1.1' };
  await handleDorarSearch(args, env, { fetcher: okFetcher });
  const res2 = await handleDorarSearch(args, env, { fetcher: async () => { throw new Error('should not fetch'); } });
  const body = await res2.json();
  assert.equal(body.ok, true);
  assert.equal(body.source, 'cache');
});

test('upstream failure → fail-closed upstream error', async () => {
  const res = await handleDorarSearch({ query: 'x', page: 1, ip: '1.1.1.1' }, ENV(),
    { fetcher: async () => ({ ok: false, status: 403, json: async () => ({}) }) });
  const body = await res.json();
  assert.equal(body.ok, false);
  assert.equal(body.error.code, 'upstream');
});

test('over quota → quota error', async () => {
  const env = ENV();
  const fetcher = okFetcher;
  for (let i = 0; i < 100; i++) await handleDorarSearch({ query: 'q' + i, page: 1, ip: '9.9.9.9' }, env, { fetcher });
  const res = await handleDorarSearch({ query: 'again', page: 1, ip: '9.9.9.9' }, env, { fetcher });
  const body = await res.json();
  assert.equal(body.ok, false);
  assert.equal(body.error.code, 'quota');
});
```

- [ ] **Step 3: Run it, verify it fails**

Run: `cd worker && node --test test/dorar-endpoint.test.js`
Expected: FAIL (`handleDorarSearch` not exported).

- [ ] **Step 4: Implement `handleDorarSearch` + wire the route in `worker/src/hadith.js`**

Add imports at the top:
```js
import { fetchDorarResult } from './lib/dorar-source.js';
import { parseDorarResult } from './lib/dorar-parse.js';
```
(No citation import — `parseDorarResult` already sets each item's `reference` via `buildSilsilaReference`.)

Add the handler (uses the existing `json(...)` envelope helper; mirror the QuranlyAI KV quota):
```js
const DORAR_QUOTA_PER_DAY = 100;
const DORAR_CACHE_TTL = 60 * 60 * 24 * 7; // 7 days

function dorarEnabled(env) { return String(env.HADITH_SILSILA_DORAR_ENABLED) === 'true'; }

async function dorarQuotaOk(env, ip) {
  const day = new Date().toISOString().slice(0, 10);
  const key = `dorar:quota:${day}:${ip || 'anon'}`;
  const n = parseInt((await env.QURANLYAI_KV.get(key)) || '0', 10);
  if (n >= DORAR_QUOTA_PER_DAY) return false;
  await env.QURANLYAI_KV.put(key, String(n + 1), { expirationTtl: 60 * 60 * 25 });
  return true;
}

export async function handleDorarSearch({ query, page = 1, ip } = {}, env, { fetcher = fetch, origin } = {}) {
  if (!dorarEnabled(env)) return json({ ok: false, error: { code: 'disabled', message: 'Silsila search is not enabled', retryable: false }, source: 'fallback' }, origin, { status: 404 });
  const q = String(query == null ? '' : query).trim().slice(0, 120);
  if (!q) return json({ ok: false, error: { code: 'bad_query', message: 'Enter an Arabic search term', retryable: false }, source: 'fallback' }, origin, { status: 400 });
  const pg = Math.max(1, parseInt(page, 10) || 1);

  const cacheKey = `dorar:search:${pg}:${q}`;
  const cached = await env.QURANLYAI_KV.get(cacheKey);
  if (cached) return json({ ok: true, data: JSON.parse(cached), source: 'cache' }, origin, { maxAge: 3600 });

  if (!(await dorarQuotaOk(env, ip))) return json({ ok: false, error: { code: 'quota', message: 'Daily search limit reached — try again tomorrow', retryable: false }, source: 'fallback' }, origin, { status: 429 });

  let items;
  try {
    const html = await fetchDorarResult(q, pg, { fetcher });
    items = parseDorarResult(html); // each item already carries `reference` + `ruling`
  } catch (e) {
    return json({ ok: false, error: { code: 'upstream', message: 'Search temporarily unavailable — try again', retryable: true }, source: 'fallback' }, origin, { status: 502 });
  }

  const data = { items, page: pg, query: q };
  await env.QURANLYAI_KV.put(cacheKey, JSON.stringify(data), { expirationTtl: DORAR_CACHE_TTL });
  return json({ ok: true, data, source: 'live' }, origin, { maxAge: 3600 });
}
```
Then dispatch it in the router: in the request handler that matches `/api/hadith/*`, add a branch for `GET /api/hadith/dorar/search` that reads `q`, `page` from the URL and `ip` from `request.headers.get('CF-Connecting-IP')`, then `return handleDorarSearch({ query, page, ip }, env, { origin });`.

- [ ] **Step 5: Run tests, verify pass**

Run: `cd worker && node --test test/dorar-endpoint.test.js`
Expected: PASS (6/6). Then run the full suite: `cd worker && npm test` → all green.

- [ ] **Step 6: Commit**

```bash
git add worker/src/hadith.js worker/test/dorar-endpoint.test.js
git commit -m "feat(dorar): /api/hadith/dorar/search endpoint (flag-gated, cached, quota, fail-closed)"
```

---

## Task 5: `dorar-card-core.js` — pure card renderer

**Files:**
- Create: `src/js/dorar-card-core.js`
- Test: `worker/test/dorar-card-core.test.js`

- [ ] **Step 1: Write the failing test**

```js
// worker/test/dorar-card-core.test.js
import { test } from 'node:test';
import assert from 'node:assert';
import core from '../../src/js/dorar-card-core.js';

const item = (over = {}) => Object.assign({
  arabicMatn: 'إنما الأعمال بالنيات', narrator: 'عائشة أم المؤمنين',
  ruling: 'رجاله ثقات رجال مسلم إلا أنه منقطع', grader: 'الألباني', rulingSource: 'Dorar.net',
  collectionSlug: 'al-silsila-sahiha', collectionName: 'Al-Silsilah al-Sahihah',
  numberOrPage: '6/778', reference: 'Al-Silsilah al-Sahihah — 6/778',
}, over);

test('buildDorarCardHTML renders RTL matn, narrator, verbatim ruling labelled to grader + Dorar, citation, Ask button', () => {
  const html = core.buildDorarCardHTML(item());
  assert.match(html, /dir="rtl"/);
  assert.match(html, /إنما الأعمال بالنيات/);
  assert.match(html, /عائشة أم المؤمنين/);
  assert.match(html, /رجاله ثقات رجال مسلم إلا أنه منقطع/); // ruling VERBATIM
  assert.match(html, /الألباني/);                           // grader in the ruling label
  assert.match(html, /via Dorar\.net/);
  assert.match(html, /Al-Silsilah al-Sahihah — 6\/778/);
  assert.match(html, /data-act="ask-qai"/);
  assert.match(html, /data-ai-selectable="hadith"/);
});

test('buildDorarCardHTML: emits NO grade badge / grade vocab (ruling is never badge-mapped)', () => {
  const html = core.buildDorarCardHTML(item());
  assert.doesNotMatch(html, /grade-badge|grade-sahih|grade-daif|>Sahih<|Da'if/);
});

test('buildDorarCardHTML: grader null → honest "Grader\'s ruling" label, never fabricated', () => {
  const html = core.buildDorarCardHTML(item({ grader: null }));
  assert.match(html, /Grader's ruling · via Dorar\.net/);
});

test('buildDorarCardHTML: no number → citation is collection-only (no em-dash ref)', () => {
  const html = core.buildDorarCardHTML(item({ numberOrPage: null, reference: 'Al-Silsilah al-Sahihah' }));
  assert.match(html, /Al-Silsilah al-Sahihah/);
  assert.doesNotMatch(html, /Al-Silsilah al-Sahihah —/);
});

test('buildDorarCardHTML escapes matn/narrator/ruling (no raw HTML injection)', () => {
  const html = core.buildDorarCardHTML(item({ arabicMatn: '<script>alert(1)</script>', ruling: '<img src=x onerror=alert(2)>' }));
  assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/);
  assert.doesNotMatch(html, /<img src=x onerror/);
});

test('buildDorarCardHTML: only Dorar.net is cited (no backend vendor names)', () => {
  const html = core.buildDorarCardHTML(item());
  assert.doesNotMatch(html, /hadithapi|AhmedBaset|fawazahmed0/i);
});
```

- [ ] **Step 2: Run it, verify it fails**

Run: `cd worker && node --test test/dorar-card-core.test.js`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `dorar-card-core.js`**

```js
// src/js/dorar-card-core.js
/* Pure renderer for a Dorar-sourced Silsila as-Sahiha result card. UMD:
   window.II.dorarCard in the browser, module.exports in tests. NO DOM, NO network.
   Arabic-only (translation is the "Ask QuranlyAI" button's job). al-Albani's ruling
   (خلاصة حكم المحدث) is shown VERBATIM, sourced to the grader + Dorar.net — never
   reduced to a one-word grade badge, never fabricated. Citation is the page-style
   reference the item already carries (built by dorar-parse's buildSilsilaReference). */
(function (root) {
  'use strict';
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  var SVG_QAI = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3l1.9 4.6L18.5 9l-4.6 1.9L12 15l-1.9-4.1L5.5 9l4.6-1.4z"/></svg>';

  // al-Albani's ruling, verbatim, labelled to the grader + Dorar.net. NEVER a badge.
  function rulingBlock(item) {
    if (!item.ruling) return '';
    var who = item.grader ? esc(item.grader) : "Grader's ruling";
    return '<div class="dorar-ruling">' +
      '<div class="dorar-ruling-label">' + who + ' · via Dorar.net</div>' +
      '<div class="dorar-ruling-text" dir="rtl" lang="ar">' + esc(item.ruling) + '</div>' +
    '</div>';
  }

  function buildDorarCardHTML(item) {
    item = item || {};
    var ref = item.reference || item.collectionName || 'Al-Silsilah al-Sahihah'; // raw; escaped at use
    var matn = item.arabicMatn ? '<div class="hadith-arabic dorar-matn" dir="rtl" lang="ar">' + esc(item.arabicMatn) + '</div>' : '';
    var narr = item.narrator ? '<div class="hadith-narrator" dir="rtl" lang="ar">' + esc(item.narrator) + '</div>' : '';
    return '' +
      '<div class="hadith-card dorar-card" data-ai-selectable="hadith" data-ref="' + esc(ref) + '">' +
        '<div class="hadith-teal-bar"></div>' +
        '<div class="hadith-inner">' +
          matn + narr +
          rulingBlock(item) +
          '<div class="hadith-footer">' +
            '<div class="hadith-ref"><span class="hadith-ref-icon">📖</span>' + esc(ref) + '<span class="dorar-src"> · Source · Dorar.net</span></div>' +
            '<div class="hadith-footer-actions">' +
              '<button class="footer-action-btn primary" type="button" data-act="ask-qai">' + SVG_QAI + ' <span>Ask QuranlyAI</span></button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  var api = { buildDorarCardHTML: buildDorarCardHTML, _esc: esc };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  else { root.II = root.II || {}; root.II.dorarCard = api; }
}(typeof globalThis !== 'undefined' ? globalThis : window));
```

- [ ] **Step 4: Run tests, verify pass**

Run: `cd worker && node --test test/dorar-card-core.test.js`
Expected: PASS (5/5).

- [ ] **Step 5: Commit**

```bash
git add src/js/dorar-card-core.js worker/test/dorar-card-core.test.js
git commit -m "feat(dorar): pure Silsila result card renderer (Arabic, grade, citation, Ask button)"
```

---

## Task 6: `api.js` — `fetchDorarSilsila(q, page)`

**Files:**
- Modify: `src/js/api.js`
- Test: add to `worker/test/ui-utils.test.js` (the file that already exercises `api.js` methods) or a new `worker/test/api-dorar.test.js`.

- [ ] **Step 1: Write the failing test**

```js
// worker/test/api-dorar.test.js
import { test } from 'node:test';
import assert from 'node:assert';
import api from '../../src/js/api.js';

test('api exposes fetchDorarSilsila', () => {
  assert.equal(typeof api.fetchDorarSilsila, 'function');
});
test('fetchDorarSilsila builds the /api/hadith/dorar/search URL with q + page', () => {
  const u = api._dorarUrl ? api._dorarUrl('النية', 2) : null;
  assert.ok(u && u.indexOf('/api/hadith/dorar/search') !== -1);
  assert.match(u, /q=/);
  assert.match(u, /page=2/);
});
```
(If `api.js` isn't importable as default in this harness, mirror how `worker/test/ui-utils.test.js` imports it.)

- [ ] **Step 2: Run it, verify it fails**

Run: `cd worker && node --test test/api-dorar.test.js`
Expected: FAIL.

- [ ] **Step 3: Implement in `api.js`**

Near the other hadith fetchers, add (using the existing `_apiUrl` rebasing + `_get`/fetch helpers — match the surrounding style):
```js
function _dorarUrl(q, page) {
  return _apiUrl('/api/hadith/dorar/search?q=' + encodeURIComponent(q || '') + '&page=' + (parseInt(page, 10) || 1));
}
async function fetchDorarSilsila(q, page) {
  try {
    const res = await fetch(_dorarUrl(q, page), { headers: { 'Accept': 'application/json' } });
    return await res.json();
  } catch (_) {
    return { ok: false, error: { code: 'network', message: 'Search temporarily unavailable', retryable: true }, source: 'fallback' };
  }
}
```
Export both on the `api` object (`fetchDorarSilsila`, and `_dorarUrl` for the test).

- [ ] **Step 4: Run tests, verify pass**

Run: `cd worker && node --test test/api-dorar.test.js` → PASS. Then `npm test` → all green.

- [ ] **Step 5: Commit**

```bash
git add src/js/api.js worker/test/api-dorar.test.js
git commit -m "feat(dorar): api.fetchDorarSilsila client method"
```

---

## Task 7: Frontend glue — Silsila route becomes search; remove reference card

**Files:**
- Modify: `src/js/hadith.js`, `hadith.html`

This task is DOM glue (not unit-tested); correctness rests on the tested cores + the manual smoke in Task 10. Work in small commits.

- [ ] **Step 1: Add script tags to `hadith.html`**

After `src/js/hadith-citation-core.js` add `<script src="src/js/dorar-card-core.js"></script>`. Add the QuranlyAI widget loader before `src/js/hadith.js` (match the snippet in `doc/quranly-ai-integration.md`), e.g.:
```html
<script src="src/js/dorar-card-core.js"></script>
<script src="src/js/quranlyai-widget.js" data-api-base="https://islamicinfo-api.islamicinfo.workers.dev"></script>
```
Commit: `git commit -am "chore(hadith): load dorar-card-core + QuranlyAI widget on hadith.html"`

- [ ] **Step 2: Remove the reference-linked mechanism**

In `src/js/hadith.js` delete: the `REFERENCE_LINKED` object (~196–204), `renderReferenceCard` (~288–300), the `REFERENCE_LINKED[c.slug]` badge branch in the sidebar builder (~112–113, keep the plain sidebar item), and the dispatch `if (REFERENCE_LINKED[r.collection]) { renderReferenceCard(...); return; }` (~432). Grep to confirm zero remaining references: `grep -n "REFERENCE_LINKED\|renderReferenceCard" src/js/hadith.js` → no matches.
Commit: `git commit -am "refactor(hadith): remove Silsila reference-linked card (superseded by Dorar search)"`

- [ ] **Step 3: Add the Silsila search view + render + Ask wiring**

In the route dispatcher, where a collection view is chosen, add: `if (r.collection === 'al-silsila-sahiha') { renderSilsilaSearch(collectionBySlug(r.collection)); return; }` (before the normal books-grid path). Then add these functions (reuse `setTier(2)`, `tier2El()`, `collectionHeaderHTML(c)`, `esc`):
```js
var SILSILA = { q: '', page: 1, items: [] };
function renderSilsilaSearch(c) {
  setTier(2);
  var el = tier2El(); if (!el) return;
  el.innerHTML = collectionHeaderHTML(c) +
    '<form class="dorar-search" id="ii-dorar-form" role="search">' +
      '<input id="ii-dorar-q" type="search" dir="rtl" lang="ar" placeholder="ابحث في السلسلة الصحيحة…" aria-label="Search Silsila as-Sahiha (Arabic)">' +
      '<button class="btn-glass" type="submit">بحث</button>' +
    '</form>' +
    '<p class="dorar-help">Search Arabic keywords across al-Albani\'s Silsila as-Sahiha. Grading data from the Hadith Encyclopedia, Dorar.net (الدرر السنية).</p>' +
    '<div id="ii-dorar-results" aria-live="polite"></div>';
  var form = document.getElementById('ii-dorar-form');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    SILSILA.q = (document.getElementById('ii-dorar-q').value || '').trim();
    SILSILA.page = 1; SILSILA.items = [];
    if (SILSILA.q) runSilsilaSearch(true);
  });
}
async function runSilsilaSearch(reset) {
  var out = document.getElementById('ii-dorar-results'); if (!out) return;
  if (reset) out.innerHTML = '<div class="dorar-loading">Searching…</div>';
  var res; try { res = await api.fetchDorarSilsila(SILSILA.q, SILSILA.page); } catch (_) { res = null; }
  out = document.getElementById('ii-dorar-results'); if (!out) return; // route may have changed
  if (!res || !res.ok) {
    var code = res && res.error && res.error.code;
    var msg = code === 'quota' ? 'Daily search limit reached — try again tomorrow.'
            : 'Search temporarily unavailable — try again.';
    out.innerHTML = '<div class="books-error"><div class="books-empty-title">' + msg + '</div></div>';
    return;
  }
  var items = (res.data && res.data.items) || [];
  if (reset && !items.length) { out.innerHTML = '<div class="books-empty"><div class="books-empty-title">No narrations matched.</div></div>'; return; }
  SILSILA.items = SILSILA.items.concat(items);
  var cards = SILSILA.items.map(function (it) { return II.dorarCard.buildDorarCardHTML(it); }).join('');
  var more = items.length ? '<button class="btn-glass" id="ii-dorar-more" type="button" style="margin-top:16px;">Load more</button>' : '';
  out.innerHTML = '<div class="dorar-results-list">' + cards + '</div>' + more;
  var moreBtn = document.getElementById('ii-dorar-more');
  if (moreBtn) moreBtn.addEventListener('click', function () { SILSILA.page += 1; runSilsilaSearch(false); });
}
```
Wire the Ask button via delegation (near other card action handlers). It must pass the Arabic matn + reference into QuranlyAI with the translate/explain prompt. Read `src/js/quranly-ai-panel.js` (`openPanel(context, prefilledAction)`) and `src/js/select-to-ask.js` (`window.QuranlyAI.route`) to confirm the exact public call, then:
```js
document.addEventListener('click', function (e) {
  var btn = e.target.closest && e.target.closest('[data-act="ask-qai"]');
  if (!btn) return;
  var card = btn.closest('.dorar-card'); if (!card) return;
  var matn = (card.querySelector('.dorar-matn') || {}).textContent || '';
  var ref = (card.getAttribute('data-ref') || '');
  var prompt = 'Translate and explain this hadith, citing your sources:\n\n' + matn + '\n(' + ref + ')';
  if (window.QuranlyAI) {
    if (typeof window.QuranlyAI.ask === 'function') window.QuranlyAI.ask(prompt, { type: 'hadith', ref: ref });
    else if (typeof window.QuranlyAI.openPanel === 'function') window.QuranlyAI.openPanel({ type: 'hadith', text: matn, ref: ref }, prompt);
    else if (typeof window.QuranlyAI.route === 'function') window.QuranlyAI.route('ask', { selectable: 'hadith', text: matn, ref: ref, prompt: prompt });
  }
});
```
(Keep only the branch that matches the real API once confirmed; leave the graceful `if (window.QuranlyAI)` guard so a missing widget is a no-op, not an error.)
Commit: `git commit -am "feat(hadith): Silsila Dorar search view + result cards + Ask QuranlyAI wiring"`

- [ ] **Step 4: Minimal CSS**

Add styles for `.dorar-search`, `.dorar-help`, `.dorar-results-list`, `.dorar-matn` (RTL, larger Arabic line-height), `.dorar-ruling` (a bordered/muted block), `.dorar-ruling-label` (small, muted, the grader · via Dorar.net line), `.dorar-ruling-text` (RTL Arabic), and `.dorar-src` (muted), reusing existing tokens (no raw hex). Put them with the other hadith styles in `hadith.html`. Remove now-unused `.ref-collection*` rules.
Commit: `git commit -am "style(hadith): Dorar search view styles; drop dead reference-card CSS"`

---

## Task 8: Collection metadata + flag + docs

**Files:**
- Modify: `src/data/hadith/collections.json`, `worker/wrangler.toml`, `doc/API-SPEC.md`, `doc/DATA.md`, `doc/DECISIONS.md`

- [ ] **Step 1: Re-flag the collection**

In `collections.json`, the `al-silsila-sahiha` entry: keep name/compiler/characterization; if it carries any `referenceLinked`/`source: 'reference'` style flag, change it to reflect Dorar search backing (e.g. add `"search": "dorar"`, drop reference-link flags). Do NOT assert a `hadithCount` (search-only). Commit.

- [ ] **Step 2: Declare the flag (default OFF)**

In `worker/wrangler.toml` `[vars]`, add `HADITH_SILSILA_DORAR_ENABLED = "false"`. Commit.

- [ ] **Step 3: Docs + ADR**

- `doc/API-SPEC.md`: document `GET /api/hadith/dorar/search?q=&page=` (params, envelope, cache, quota, flag).
- `doc/DATA.md`: note the Dorar item shape if any localStorage/state keys are added (none expected).
- `doc/DECISIONS.md`: add an ADR reversing the 35bcc19 reference-link decision → Dorar search; record the hadith-number-only citation reuse, the flag gate, and the two launch gates (owner terms review + Worker reachability).
Commit: `git commit -m "docs(dorar): API-SPEC + ADR reversing Silsila reference-link decision"`

---

## Task 9: Full suite + attribution sweep

- [ ] **Step 1: Run the whole worker suite**

Run: `cd worker && npm test`
Expected: all green (previous 469 + the new dorar tests).

- [ ] **Step 2: No-vendor / attribution sweep**

Run: `grep -rn "Dorar.net" src/js/dorar-card-core.js && grep -rn "hadithapi\|AhmedBaset\|fawazahmed0" src/js/dorar-card-core.js`
Expected: `Dorar.net` present; no backend-vendor names. Confirm `dorar-parse.js` header credits the MIT wrapper.

- [ ] **Step 3: Commit any fixups**, then stop for the launch-gate review (Task 10).

---

## Task 10: Launch gates (owner) — DO NOT flip the flag until both clear

These are explicit human gates from the spec; the feature is fully built but ships OFF.

- [ ] **Gate A — Dorar terms/attribution:** Owner reviews dorar.net/article/389 (bot-blocked to automated fetch) + the site terms. Add any required attribution to `.dorar-help` / card footer. Record the outcome in the ADR.
- [ ] **Gate B — Worker reachability:** Deploy to a preview and hit `/api/hadith/dorar/search?q=%D8%A7%D9%84%D9%86%D9%8A%D8%A9` with the flag ON in preview. Confirm real results (not a 403/challenge). If blocked, fall back to self-hosting the MIT wrapper and point `dorar-source.js` at it (URL change only) — separate follow-up.
- [ ] **Gate C — Manual smoke:** With the flag ON in preview: search returns Arabic cards with grade+grader+citation; "Ask QuranlyAI" opens the panel prefilled with the Arabic + prompt; empty/no-result/error/quota states render honestly; the old reference card is gone.
- [ ] **Flip `HADITH_SILSILA_DORAR_ENABLED=true`** in production only after A+B+C pass.

---

## Self-review notes (author)

- **Spec coverage:** §3.1 endpoint→Task 4; §3.2 item shape→Task 2; §3.3 search view/card→Tasks 5,7; §3.4 Ask→Task 7; §4 removals→Task 7; §5 citation→Task 2 (`buildSilsilaReference`); §6 attribution+flag gates→Tasks 8,10; §7 error table→Task 4 tests; §8 testing→Tasks 1,2,4,5,6.
- **Types consistent:** item fields (`arabicMatn`, `narrator`, `ruling`, `grader`, `rulingSource`, `collectionSlug`, `collectionName`, `numberOrPage`, `reference`) identical across parser, endpoint, card, and tests. NO `grade` object / grade vocab anywhere (owner decision 2026-07-23: ruling shown verbatim, never badge-mapped).
- **Live-probe honesty:** the real fixture (Task 0) confirmed Silsila has no clean grade field — only خلاصة حكم المحدث — which drove the ruling-verbatim design. The exact inner-HTML wrapping is captured in that fixture and the Task 2 regex is iterated against it — not a placeholder.
