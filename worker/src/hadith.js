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
