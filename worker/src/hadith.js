/* Hadith Library router — owns all /api/hadith/* endpoints. Cache-first with
   graceful fallback; uniform { ok, data?, error?, source } envelope. The API
   key is read from env (Worker secret) and never leaves the server. `deps`
   lets tests inject a fetcher. */

import { json } from './lib/cors.js';
import { ALLOWED_SLUGS, booksUrl, chaptersUrl, hadithsUrl, fetchJson } from './lib/hadith-source.js';
import { normalizeBook, normalizeChapter, normalizeHadith } from './lib/hadith-adapter.js';
import { hKey, getJson, putJson, TTL } from './lib/hadith-cache.js';
import { fetchDorarResult } from './lib/dorar-source.js';
import { parseDorarResult } from './lib/dorar-parse.js';

// Static fallback for /api/hadith/daily — the Intentions hadith (Bukhari #1).
// Verified: Sahih al-Bukhari, Book of Revelation, Hadith 1. Graded Sahih.
const DAILY_FALLBACK = {
  id: 'sahih-bukhari:1:1', source: 'static', sourceId: null,
  collectionSlug: 'sahih-bukhari', collectionName: 'Sahih al-Bukhari', collectionArabicName: null,
  bookNumber: 1, bookName: 'Revelation', bookArabicName: null,
  hadithNumber: 1, reference: 'Sahih al-Bukhari 1',
  arabicMatn: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ',
  translation: { text: 'The reward of deeds depends upon the intentions.', language: 'en',
                 edition: null, translator: null },
  narrator: { id: null, name: "Umar ibn al-Khattab", arabicName: null },
  grade: { value: 'sahih', label: 'Sahih', grader: 'Imam al-Bukhari', sourceCitation: null,
           disputed: false, alternateGradings: [] },
  isnad: { status: 'unavailable', narrators: [] }, topics: [],
  audio: { status: 'unavailable', url: null, reciter: null },
  sourceMetadata: { fetchedAt: null, sourceUrlOrId: null, contentHash: 'static-bukhari-1', verificationStatus: 'curated' },
};

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

/* Map an upstream array to normalized items, dropping any null entry or any
   record that throws — one malformed record must not fail the whole batch
   (fail closed per-record). */
function safeMap(arr, fn) {
  const out = [];
  if (!Array.isArray(arr)) return out;
  for (const item of arr) {
    if (item == null) continue;
    try { out.push(fn(item)); } catch (_) { /* drop malformed record */ }
  }
  return out;
}

/* Fetch → normalize → cache; on any failure serve cache, else signal caller.
   `opts` (optional) is forwarded to fetchJson — e.g. { allow404: true } lets search
   treat hadithapi's "Hadiths not found" 404 as an empty result rather than an error. */
async function liveOrCache(kv, key, ttl, buildUrl, normalize, deps, opts) {
  const fetcher = deps.fetcher || fetch;
  try {
    const raw = await fetchJson(buildUrl(), { fetcher, ...(opts || {}) });
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
      (raw) => safeMap(raw.books, normalizeBook),   // VERIFIED 2026-07-19: top-level `books`
      deps,
    );
    return ok(data, source, origin, source === 'live' ? TTL.WEEK : 0);
  } catch (_) {
    return fail('upstream', 'Collections temporarily unavailable — try again', origin, 502, true);
  }
}

async function chapters(slug, env, origin, deps) {
  if (!ALLOWED_SLUGS.has(slug)) return fail('bad_slug', `unknown collection: ${slug}`, origin, 400, false);
  if (!env.HADITH_API_KEY) return fail('no_key', 'Hadith service temporarily unavailable', origin, 503, true);
  try {
    const { data, source } = await liveOrCache(
      env.QURANLYAI_KV, hKey('chapters', slug), TTL.WEEK,
      () => chaptersUrl(env.HADITH_API_BASE_URL, env.HADITH_API_KEY, slug),
      (raw) => safeMap(raw.chapters, normalizeChapter),   // VERIFIED 2026-07-19: top-level `chapters`
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
        const wrap = raw.hadiths || {};                       // VERIFIED 2026-07-19: `hadiths.data`
        return {
          hadiths: safeMap(wrap.data, (h) => normalizeHadith(h, {})),
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
        const first = (raw.hadiths && raw.hadiths.data && raw.hadiths.data[0]) || null;  // VERIFIED 2026-07-19
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

/* Flat whole-collection list (book-only, no chapter) + number resolver.
   ?page=&limit= → paginated flat list (VERIFY §5.1 before relying on this for
   listing; chapter-walk in the client does not depend on it).
   ?hadithNumber= → single-record resolve to expose its real bookNumber (used by
   the client to route a typed number into the deep view). */
async function collectionFlat(slug, searchParams, env, origin, deps) {
  if (!ALLOWED_SLUGS.has(slug)) return fail('bad_slug', `unknown collection: ${slug}`, origin, 400, false);
  if (!env.HADITH_API_KEY) return fail('no_key', 'Hadith service temporarily unavailable', origin, 503, true);
  const num = posInt(searchParams.get('hadithNumber'));
  const page = posInt(searchParams.get('page')) || 1;
  const limit = Math.min(posInt(searchParams.get('limit')) || 25, 200);
  const param = num
    ? { book: slug, hadithNumber: num, paginate: 1 }
    : { book: slug, paginate: limit, page };
  const key = num ? hKey('flatone', slug, num) : hKey('flatlist', slug, page, limit);
  try {
    const { data, source } = await liveOrCache(
      env.QURANLYAI_KV, key, TTL.DAY,
      () => hadithsUrl(env.HADITH_API_BASE_URL, env.HADITH_API_KEY, param),
      (raw) => {
        const wrap = raw.hadiths || {};                       // VERIFIED 2026-07-19: hadithapi shape hadiths.data
        return {
          hadiths: safeMap(wrap.data, (h) => normalizeHadith(h, {})),
          page: num ? 1 : page, limit: num ? 1 : limit,
          total: wrap.total ?? null, lastPage: wrap.last_page ?? null,
        };
      },
      deps,
    );
    return ok(data, source, origin, source === 'live' ? TTL.DAY : 0);
  } catch (_) {
    return fail('upstream', 'Hadiths temporarily unavailable — try again', origin, 502, true);
  }
}

async function search(searchParams, env, origin, deps) {
  const q = (searchParams.get('q') || '').trim();
  if (q.length < 2) return fail('bad_query', 'search query must be at least 2 characters', origin, 400, false);
  if (q.length > 100) return fail('bad_query', 'search query too long (max 100 chars)', origin, 400, false);
  const collection = searchParams.get('collection');
  if (collection && !ALLOWED_SLUGS.has(collection)) {
    return fail('bad_slug', `unknown collection: ${collection}`, origin, 400, false);
  }
  if (!env.HADITH_API_KEY) return fail('no_key', 'Hadith service temporarily unavailable', origin, 503, true);
  const page = posInt(searchParams.get('page')) || 1;
  const lang = searchParams.get('lang') === 'ar' ? 'ar' : 'en';
  const base = lang === 'ar' ? { hadithArabic: q } : { hadithEnglish: q };
  const param = collection ? { book: collection, ...base } : base;
  try {
    const { data, source } = await liveOrCache(
      env.QURANLYAI_KV, hKey('search', lang, collection || 'all', page, q), TTL.HOUR,
      () => hadithsUrl(env.HADITH_API_BASE_URL, env.HADITH_API_KEY, { ...param, paginate: 25, page }),
      (raw) => {
        // A zero-match query (hadithapi 404, passed through by allow404) has no `hadiths`
        // field → an honest empty result: 0 total, 1 page. Never a fabricated total.
        const arr = raw && raw.hadiths && raw.hadiths.data;
        const results = safeMap(arr, (h) => normalizeHadith(h, { language: lang }));
        return { results, page, query: q,
                 total: (raw && raw.hadiths && raw.hadiths.total != null) ? raw.hadiths.total : results.length,
                 lastPage: (raw && raw.hadiths && raw.hadiths.last_page) ?? 1 };
      },
      deps, { allow404: true },
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

/* Dorar.net Silsila search — flag-gated, KV-cached, per-IP daily quota.
   Fail-closed: any upstream/parse problem returns an `upstream` error and
   NEVER emits partial or fabricated items. */
export async function handleDorarSearch({ query, page = 1, ip } = {}, env, { fetcher = fetch, origin } = {}) {
  if (!dorarEnabled(env)) {
    return json({ ok: false, error: { code: 'disabled', message: 'Silsila search is not enabled', retryable: false }, source: 'fallback' }, origin, { status: 404 });
  }
  const q = String(query == null ? '' : query).trim().slice(0, 120);
  if (!q) {
    return json({ ok: false, error: { code: 'bad_query', message: 'Enter an Arabic search term', retryable: false }, source: 'fallback' }, origin, { status: 400 });
  }
  const pg = Math.max(1, parseInt(page, 10) || 1);

  const cacheKey = `dorar:search:${pg}:${q}`;
  const cached = await env.QURANLYAI_KV.get(cacheKey);
  if (cached) return json({ ok: true, data: JSON.parse(cached), source: 'cache' }, origin, { maxAge: 3600 });

  if (!(await dorarQuotaOk(env, ip))) {
    return json({ ok: false, error: { code: 'quota', message: 'Daily search limit reached — try again tomorrow', retryable: false }, source: 'fallback' }, origin, { status: 429 });
  }

  let items;
  try {
    const html = await fetchDorarResult(q, pg, { fetcher });
    // Attach a clickable "back to the source" link — Dorar's own search for this query
    // (per-hadith deep links aren't available from the API endpoint we use).
    const dorarUrl = 'https://www.dorar.net/hadith/search?q=' + encodeURIComponent(q);
    items = parseDorarResult(html).map((it) => ({ ...it, dorarUrl })); // items also carry `reference` + `ruling`
  } catch (e) {
    return json({ ok: false, error: { code: 'upstream', message: 'Search temporarily unavailable — try again', retryable: true }, source: 'fallback' }, origin, { status: 502 });
  }

  const data = { items, page: pg, query: q };
  // Cache real hits for 7d, but keep an empty result SHORT-lived: an empty parse can also
  // mean Dorar changed its HTML (fail-closed → items:[]), and we must not serve that as a
  // confident "no matches" for a week. 10 min bounds any silent-breakage window.
  const ttl = items.length ? DORAR_CACHE_TTL : 600;
  await env.QURANLYAI_KV.put(cacheKey, JSON.stringify(data), { expirationTtl: ttl });
  return json({ ok: true, data, source: 'live' }, origin, { maxAge: 3600 });
}

function narratorStub(origin) {
  // No curator store exists yet (design D4) — report honestly, never fabricate.
  return ok({ status: 'unavailable', message: 'No verified narrator data available for this narration.' }, 'fallback', origin, 0);
}

export async function handleHadith(path, searchParams, env, origin, deps = {}) {
  const rest = path.replace(/^\/api\/hadith\/?/, '');   // '', 'collections', 'collections/sahih-bukhari/books', ...
  const seg = rest.split('/').filter(Boolean);

  if (seg[0] === 'collections' && seg.length === 1) return collections(env, origin, deps);

  if (seg[0] === 'search' && seg.length === 1) return search(searchParams, env, origin, deps);
  if (seg[0] === 'daily' && seg.length === 1) return daily(env, origin, deps);
  if (seg[0] === 'narrators' && seg.length === 2) return narratorStub(origin);
  // /api/hadith/dorar/search?q=&page= — Silsila search (flag-gated)
  if (seg[0] === 'dorar' && seg[1] === 'search' && seg.length === 2) {
    return handleDorarSearch(
      { query: searchParams.get('q'), page: searchParams.get('page') || 1, ip: deps.ip },
      env, { fetcher: deps.fetcher, origin },
    );
  }

  // /api/hadith/collections/:slug/books
  if (seg[0] === 'collections' && seg.length === 3 && seg[2] === 'books') {
    return chapters(seg[1], env, origin, deps);
  }
  // /api/hadith/collections/:slug/hadiths  (flat list + number resolver)
  if (seg[0] === 'collections' && seg.length === 3 && seg[2] === 'hadiths') {
    return collectionFlat(seg[1], searchParams, env, origin, deps);
  }
  // /api/hadith/collections/:slug/books/:bookNum/hadiths
  if (seg[0] === 'collections' && seg.length === 5 && seg[2] === 'books' && seg[4] === 'hadiths') {
    return hadithList(seg[1], seg[3], searchParams, env, origin, deps);
  }
  // /api/hadith/:slug/:bookNum/:hadithNum
  if (seg.length === 3 && ALLOWED_SLUGS.has(seg[0])) {
    return singleHadith(seg[0], seg[1], seg[2], env, origin, deps);
  }

  return fail('not_found', `unknown hadith endpoint: /${rest}`, origin, 404, false);
}

// Re-export helpers so later tasks (and tests) can reuse them.
export { ok, fail, posInt, liveOrCache };
