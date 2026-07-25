/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — API Proxy Worker  (v1.0 · Step 4)
   Serves the /api/* contract defined in src/js/api.js.

   LIVE in this version:
     GET /api/verse                      → alquran.cloud (daily, UTC bust)
     GET /api/prayer?city=&date=&method= → api.aladhan.com (24 h cache)

   ROUTED but pending (return 501 with a clear message):
     /api/geocode · /api/quran/[n] · /api/hadith · /api/nisab
     /api/verify · /api/ask-claude · /api/subscribe

   Caching: Cloudflare Cache API at the edge. Browsers also cache via
   Cache-Control (api.js additionally caches in localStorage).

   CORS: locked to the origins in ALLOWED_ORIGINS.
   ═══════════════════════════════════════════════════════════════════ */

import { todayUTC, secondsUntilUTCMidnight } from './lib/time.js';
import { ALLOWED_ORIGINS, corsHeaders, json, err } from './lib/cors.js';
import { ASK_CLAUDE_SYSTEM_PROMPT, AI_ATTRIBUTION, SCHOLAR_REDIRECT, verdictLangDetected } from './lib/safety.js';
import { callGemini } from './lib/gemini.js';
import { GEMINI_FLASH } from './lib/prompts.js';
import { handleQuranlyAiAsk } from './quranlyai.js';
import { handleHadith } from './hadith.js';
import { handleExplain } from './explain.js';
import { handleNarrator } from './narrator.js';
import { handleQuranSearch } from './quran-search.js';

/* ─── Upstream fetch with timeout ──────────────────────────────────── */
async function upstream(url, timeoutMs = 8000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'IslamicInfo.org proxy (hello@islamicinfo.org)' },
    });
    if (!res.ok) throw new Error(`upstream HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

/* ═══════════════════════════════════════════════════════════════════
   GET /api/verse — Verse of the Day
   Contract: { surahName, surahNumber, ayahNumber, arabic,
               translation, translator, reference }
   Deterministic daily pick across all 6,236 ayahs; same verse for
   every visitor worldwide until UTC midnight.
   ═══════════════════════════════════════════════════════════════════ */
export async function handleVerse(origin) {
  const epochDay = Math.floor(Date.now() / 86400000);
  const ayahGlobal = (epochDay % 6236) + 1; // 1..6236

  const data = await upstream(
    `https://api.alquran.cloud/v1/ayah/${ayahGlobal}/editions/quran-uthmani,en.sahih`
  );
  const ar = data?.data?.[0];
  const en = data?.data?.[1];
  if (!ar || !en) throw new Error('verse: unexpected upstream shape');

  const body = {
    surahName: ar.surah.englishName,
    surahNumber: ar.surah.number,
    ayahNumber: ar.numberInSurah,
    arabic: ar.text,
    translation: en.text,
    translator: 'Saheeh International',
    reference: `${ar.surah.englishName} ${ar.surah.number}:${ar.numberInSurah}`,
    date: todayUTC(),
    source: 'api.alquran.cloud',
  };
  return json(body, origin, { maxAge: secondsUntilUTCMidnight() });
}

/* ═══════════════════════════════════════════════════════════════════
   GET /api/prayer?city=&date=&method=
   Contract: { city, date, method,
               timings: { Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha },
               source }
   date in = YYYY-MM-DD (api.js) → AlAdhan wants DD-MM-YYYY.
   method default 3 (Muslim World League), matching the frontend.
   ═══════════════════════════════════════════════════════════════════ */
export async function handlePrayer(searchParams, origin) {
  const city = (searchParams.get('city') || '').trim();
  if (!city) return err('missing required parameter: city', origin, 400);
  if (city.length > 80) return err('city parameter too long', origin, 400);

  const dateIn = searchParams.get('date') || todayUTC();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateIn)) return err('date must be YYYY-MM-DD', origin, 400);
  const [y, m, d] = dateIn.split('-');

  const method = String(parseInt(searchParams.get('method') || '3', 10) || 3);

  const data = await upstream(
    `https://api.aladhan.com/v1/timingsByCity/${d}-${m}-${y}` +
    `?city=${encodeURIComponent(city)}&method=${method}`
  );
  const t = data?.data?.timings;
  if (!t) throw new Error('prayer: unexpected upstream shape');

  const clean = (s) => (s || '').split(' ')[0]; // strip timezone suffixes like "(BST)"
  const body = {
    city,
    date: dateIn,
    method: Number(method),
    timings: {
      Fajr: clean(t.Fajr),
      Sunrise: clean(t.Sunrise),
      Dhuhr: clean(t.Dhuhr),
      Asr: clean(t.Asr),
      Maghrib: clean(t.Maghrib),
      Isha: clean(t.Isha),
    },
    hijri: data?.data?.date?.hijri
      ? `${data.data.date.hijri.day} ${data.data.date.hijri.month?.en} ${data.data.date.hijri.year} AH`
      : undefined,
    source: 'api.aladhan.com',
  };
  return json(body, origin, { maxAge: 6 * 3600 }); // 6 h edge cache
}

/* ═══ POST /api/ask-claude — Gemini proxy (Module 5B) ═══ */
async function handleAskClaude(request, env, origin) {
  if (!ALLOWED_ORIGINS.includes(origin)) return err('forbidden origin', origin, 403);

  let body;
  try { body = await request.json(); } catch (_) { return err('invalid JSON body', origin, 400); }

  const context = typeof body.context === 'string' ? body.context : '';
  const question = typeof body.question === 'string' ? body.question : '';
  const sourceRef = typeof body.sourceRef === 'string' ? body.sourceRef : '';
  var ctxTrim = context.trim();
  // 4000-char ceiling covers the longest verse (Al-Baqarah 2:282) + translation;
  // input cost on the model is trivial, so max_tokens (output) is the real cost guard.
  if (!ctxTrim || ctxTrim.length < 3 || context.length > 4000) return err('context missing or too long', origin, 400);
  if (question.length > 200) return err('question too long', origin, 400);
  if (sourceRef.length > 40) return err('sourceRef too long', origin, 400);

  if (!env || !env.GEMINI_API_KEY) return err('AI temporarily unavailable', origin, 503);

  const userContent = context + '\n\n' + (question || 'Explain the meaning of this verse in simple, easy language for a general reader.');

  let result;
  try {
    result = await callGemini(env, { model: GEMINI_FLASH, system: ASK_CLAUDE_SYSTEM_PROMPT, userContent, maxTokens: 500 });
  } catch (e) {
    return err('AI explanation unavailable — please try again', origin, 502);
  }

  let answer = (result.text || '').trim();
  if (!answer || result.refusal) answer = SCHOLAR_REDIRECT;
  if (verdictLangDetected(answer)) {
    console.log('[ask-claude] stripped verdict-language response for ref=' + sourceRef);
    answer = SCHOLAR_REDIRECT;
  }

  return json({ answer: answer, attribution: AI_ATTRIBUTION, sourcesCited: sourceRef ? [sourceRef] : [] }, origin);
}

/* ═══════════════════════════════════════════════════════════════════
   Router
   ═══════════════════════════════════════════════════════════════════ */
const PENDING = ['/api/geocode', '/api/nisab',
                 '/api/verify', '/api/subscribe'];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const path = url.pathname.replace(/\/+$/, '') || '/';

    /* CORS preflight */
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    try {
      /* Edge cache for GETs */
      if (request.method === 'GET') {
        const cache = caches.default;
        const hit = await cache.match(request);
        if (hit) {
          const res = new Response(hit.body, hit);
          // Re-stamp CORS for this caller's origin
          Object.entries(corsHeaders(origin)).forEach(([k, v]) => res.headers.set(k, v));
          return res;
        }

        if (path.startsWith('/api/hadith')) {
          const ip = request.headers.get('CF-Connecting-IP') || '';
          const res = await handleHadith(path, url.searchParams, env, origin, { ip });
          if (res.status === 200) await cache.put(request, res.clone());
          return res;
        }

        if (path.startsWith('/api/narrator/')) {
          const res = await handleNarrator(path, env, origin);
          if (res.status === 200) await cache.put(request, res.clone());
          return res;
        }

        if (path === '/api/quran/search') {
          const res = await handleQuranSearch(url.searchParams, env, origin);
          if (res.status === 200) await cache.put(request, res.clone());
          return res;
        }

        let res = null;
        if (path === '/api/verse') res = await handleVerse(origin);
        else if (path === '/api/prayer') res = await handlePrayer(url.searchParams, origin);

        if (res) {
          if (res.status === 200) await cache.put(request, res.clone());
          return res;
        }
      }

      if (request.method === 'POST' && path === '/api/ask-claude') {
        return await handleAskClaude(request, env, origin);
      }

      if (request.method === 'POST' && path === '/api/quranlyai/ask') {
        return await handleQuranlyAiAsk(request, env, ctx, origin);
      }

      if (request.method === 'POST' && path === '/api/explain') {
        return await handleExplain(request, env, ctx, origin);
      }

      if (path.startsWith('/api/quran/') || PENDING.includes(path)) {
        return err(`endpoint ${path} is scheduled in a later roadmap step`, origin, 501);
      }

      if (path === '/' || path === '/api') {
        return json({
          service: 'IslamicInfo.org API proxy',
          live: ['/api/verse', '/api/prayer', '/api/quran/search'],
          pending: PENDING.concat('/api/quran/[surah]'),
        }, origin);
      }

      return err('not found', origin, 404);
    } catch (e) {
      return err(`upstream failure: ${e.message}`, origin, 502);
    }
  },
};
