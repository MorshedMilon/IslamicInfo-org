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
