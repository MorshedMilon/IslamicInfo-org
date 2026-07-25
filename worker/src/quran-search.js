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
