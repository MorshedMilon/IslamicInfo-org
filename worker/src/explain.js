/* POST /api/explain — hadith AI explanation. A THIN new entry point into the existing
   governed QuranlyAI pipeline: it reuses the locked QURANLYAI_SYSTEM_PROMPT, callGemini,
   and the safety.js verdict filter (via explain-core.applyExplainSafety). Blocking JSON:
   the filter clears the FULL text server-side before anything reaches the client (DoD-10).
   No governed file is modified — see docs/DECISIONS.md Module 13 (#1, #2, #5). */
import { ALLOWED_ORIGINS, corsHeaders, err, json } from './lib/cors.js';
import { getCached, putCached } from './lib/cache.js';
import { QURANLYAI_SYSTEM_PROMPT, GEMINI_FLASH, buildExplainUserPrompt } from './lib/prompts.js';
import { callGemini } from './lib/gemini.js';
import { explainCacheKey, normalizeLang, applyExplainSafety } from './lib/explain-core.js';
import { getExplainQuota, incrementExplainQuota } from './lib/explain-quota.js';

const EXPLAIN_TTL_SECONDS = 24 * 3600; // 24h, per spec
const MAX_TEXT = 4000;                  // matches the quranlyai context ceiling
const EXPLAIN_MAX_TOKENS = 700;

// SHA-256 the client IP so we rate-limit without storing raw IPs (zero-PII).
async function hashIp(ip) {
  const bytes = new TextEncoder().encode('qai-ip:' + ip);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function handleExplain(request, env, ctx, origin) {
  // 1. Origin
  if (!ALLOWED_ORIGINS.includes(origin)) return err('forbidden origin', origin, 403);

  // 2. Validate. ref/arabic/translation/language are user CONTENT (never prompt params).
  let body;
  try { body = await request.json(); } catch (_) { return err('invalid JSON body', origin, 400); }
  const ref = typeof body?.ref === 'string' ? body.ref.trim() : '';
  const arabic = typeof body?.arabic === 'string' ? body.arabic : '';
  const translation = typeof body?.translation === 'string' ? body.translation : '';
  const lang = normalizeLang(body?.language);
  if (!ref || ref.length > 120) return err('missing or invalid ref', origin, 400);
  if ((arabic.length + translation.length) > MAX_TEXT) return err('content too long', origin, 400);
  if (!arabic.trim() && !translation.trim()) return err('no hadith text provided', origin, 400);

  // 3. Env guard
  if (!env || !env.GEMINI_API_KEY || !env.QURANLYAI_KV) return err('AI temporarily unavailable', origin, 503);
  const kv = env.QURANLYAI_KV;
  const now = Date.now();

  // 4. Rate limit — 20/IP/hour, 429 + Retry-After
  const ipHash = await hashIp(request.headers.get('CF-Connecting-IP') || 'unknown');
  const quota = await getExplainQuota(kv, ipHash, now);
  if (quota.blocked) {
    return new Response(JSON.stringify({ error: 'rate limited' }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Retry-After': String(quota.retryAfter),
        ...corsHeaders(origin),
      },
    });
  }

  // 5. Cache (readable key, 24h TTL)
  const key = explainCacheKey(ref, lang);
  const cachedRaw = await getCached(kv, key);
  if (cachedRaw != null) {
    try {
      const parsed = JSON.parse(cachedRaw);
      if (parsed && parsed.safe === true) return json(parsed, origin);
      // wrong shape / not a safe payload — fall through and regenerate rather than trust it
    } catch (_) { /* corrupt JSON — regenerate */ }
  }

  // 6. Generate (locked system prompt + hadith user prompt; existing 15s abort inside callGemini)
  const userContent = buildExplainUserPrompt(ref, arabic, translation, lang);
  let result;
  try {
    result = await callGemini(env, { model: GEMINI_FLASH, system: QURANLYAI_SYSTEM_PROMPT, userContent, maxTokens: EXPLAIN_MAX_TOKENS });
  } catch (_) {
    return err('AI explanation unavailable — please try again', origin, 502);
  }

  // 7. Safety gate on the COMPLETE text, then parse
  const decision = applyExplainSafety(result);
  const payload = decision.safe
    ? { safe: true, ref, model: GEMINI_FLASH, summary: decision.summary, vocabulary: decision.vocabulary, context: decision.context, lesson: decision.lesson }
    : { safe: false, fallback: decision.fallback };

  // 8. Persist off the response path. Cache only safe results (so a flagged ref can be retried);
  //    increment quota either way (a real generation happened).
  if (decision.safe) {
    ctx.waitUntil(Promise.allSettled([
      putCached(kv, key, JSON.stringify(payload), EXPLAIN_TTL_SECONDS),
      incrementExplainQuota(kv, ipHash, now),
    ]));
  } else {
    console.log('[explain] blocked unsafe explanation (refusal or verdict language)');
    ctx.waitUntil(Promise.allSettled([incrementExplainQuota(kv, ipHash, now)]));
  }

  // 9. Respond (blocking JSON)
  return json(payload, origin);
}
