/* GET /api/dua/search?q=&page=&limit= — keyword search over the ingested Hisn al-Muslim corpus. */
import { json } from './lib/cors.js';
import { getJson, putJson, TTL } from './lib/hadith-cache.js';
import { isArabic, normalizeArabic, normalizeLatin } from './lib/quran-search-core.js';
import { searchDuas, excludedIdSet } from './lib/dua-search-core.js';

const DEFAULT_CORPUS_URL = 'https://islamicinfo.org/src/data/dua/search-corpus.json';
let CORPUS = null;

function ok(data, source, origin, maxAge = 0) { return json({ ok: true, data, source }, origin, { maxAge }); }
function fail(code, message, origin, status, retryable) { return json({ ok: false, error: { code, message, retryable }, source: 'fallback' }, origin, { status }); }
function posInt(v) { const n = parseInt(v, 10); return Number.isInteger(n) && n > 0 ? n : null; }

/* DELIBERATELY UNPUBLISHED, 2026-07-31.
   src/data/dua/search-corpus.json was untracked from git (git rm --cached) so
   GitHub Pages stops serving it while the licensing question in ADR-060 is
   open: 183 of 205 records carry English the corpus meta states was "fully
   replaced or nulled", byte-identical to an upstream dataset that carries no
   licence of any kind. This URL therefore 404s by design.

   The asset MUST be re-added before DUA_SEARCH_ENABLED goes back to "true".
   A backup lives outside the repo (see its README) because this is the corpus
   of record and the ingest that supposedly generates it is disarmed (ADR-058).

   The 404 fails HARD below — never an empty result set. A dua search that
   silently returns nothing looks identical to a search with no matches, and
   this module must not be able to report "no results" when what actually
   happened is that its data is gone. */
async function loadCorpus(env) {
  if (CORPUS) return CORPUS;
  const url = (env && env.DUA_CORPUS_URL) || DEFAULT_CORPUS_URL;
  const r = await fetch(url);
  if (r.status === 404) throw new Error(
    'dua corpus is deliberately unpublished (ADR-060 licence hold) — re-add ' +
    'src/data/dua/search-corpus.json to git before enabling DUA_SEARCH_ENABLED');
  if (!r.ok) throw new Error('corpus HTTP ' + r.status);
  const doc = await r.json();
  CORPUS = { duas: doc.duas || [], meta: doc.meta || {} };
  return CORPUS;
}

/* Kill switch, default OFF. The frontend flag only darkens the UI; this route
   stays directly callable, and it scans every corpus record with no exclusion,
   so Gate 1 not-a-dua entries come back as dua results. Both have to be dark.
   See DUA-CONTENT-INTEGRITY-v1_0 §1.4. Flip DUA_SEARCH_ENABLED to "true" only
   once the corpus-level exclusion ships and the owner re-approves. */
function duaSearchEnabled(env) { return String(env && env.DUA_SEARCH_ENABLED) === 'true'; }

export async function handleDuaSearch(searchParams, env, origin) {
  if (!duaSearchEnabled(env))
    return fail('disabled', 'Dua search is temporarily unavailable', origin, 503, true);
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

  const r = searchDuas(corpus.duas, q, { page, limit, exclude: excludedIdSet(corpus) });
  const data = { query: q, page: r.page, totalPages: r.totalPages, total: r.total, results: r.results,
    source: corpus.meta.source || 'Hisn al-Muslim', sourceDataset: corpus.meta.sourceDataset || null };
  if (kv) await putJson(kv, cacheKey, data, TTL.HOUR);
  return ok(data, 'live', origin, TTL.HOUR);
}
