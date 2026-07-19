/* POST /api/quranlyai/ask — the 8-step pipeline (design spec §6). */
import { ALLOWED_ORIGINS, err, json } from './lib/cors.js';
import { todayUTC } from './lib/time.js';
import { getIpQuota, incrementIpQuota } from './lib/quota.js';
import { cacheKey, getCached, putCached } from './lib/cache.js';
import { buildGrounding, GROUNDED_ACTIONS } from './lib/grounding.js';
import { groundingData } from './lib/grounding-data.js';
import {
  QURANLYAI_SYSTEM_PROMPT, buildUserPrompt, maxTokensFor, chooseModel,
} from './lib/prompts.js';
import { callGemini } from './lib/gemini.js';
import { verdictLangDetected, looksRulingAdjacent, RULING_DEFLECTION } from './lib/safety.js';
import { streamSafeText } from './lib/sse.js';

const VALID_ACTIONS = new Set([
  'explain', 'simple', 'summarize', 'summarize_tafsir', 'key_lessons', 'related_verses',
  'related_hadith', 'asbab_al_nuzul', 'compare_translations', 'vocabulary', 'custom',
]);

function verseKeyOf(ctx) {
  return (ctx && ctx.surah != null && ctx.ayah != null) ? `${ctx.surah}:${ctx.ayah}` : '';
}

// SHA-256 the client IP so we rate-limit without storing raw IPs (zero-PII).
async function hashIp(ip) {
  const bytes = new TextEncoder().encode('qai-ip:' + ip);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Grounding-only: a free-text ask with no source text gets guidance, not an answer —
// the assistant never answers from the model's own memory (no-hallucination invariant).
const NO_SOURCE_MESSAGE =
  '**QuranlyAI**\nI explain a specific verse, hadith, or dua you’re viewing — open one and tap ✨ Ask QuranlyAI, or highlight a passage to ask about it.\n\n' +
  '**Note**: Educational assistant. Not a fatwa. Consult a qualified scholar for religious rulings.';

// Pull the Sources/Confidence out of the model text for the `done` metadata event.
function extractMeta(text) {
  const sources = [];
  const src = /\*\*Sources\*\*([\s\S]*?)(?:\n\*\*|$)/.exec(text);
  if (src) src[1].split('\n').forEach((l) => { const t = l.replace(/^[-\s]+/, '').trim(); if (t) sources.push(t); });
  const conf = /\*\*Confidence\*\*:\s*(High|Medium|Low)/i.exec(text);
  return { sources, confidence: conf ? conf[1] : 'Low' };
}

export async function handleQuranlyAiAsk(request, env, ctx, origin) {
  // 1. Origin
  if (!ALLOWED_ORIGINS.includes(origin)) return err('forbidden origin', origin, 403);

  // 2. Validate
  let body;
  try { body = await request.json(); } catch (_) { return err('invalid JSON body', origin, 400); }
  const context = (body && typeof body.context === 'object' && body.context) || {};
  const action = body && body.action;
  const customQuestion = typeof body?.customQuestion === 'string' ? body.customQuestion : '';
  const fingerprint = typeof body?.userIdOrFingerprint === 'string' ? body.userIdOrFingerprint.trim() : '';
  const rawText = typeof context.rawText === 'string' ? context.rawText.trim() : '';

  if (!VALID_ACTIONS.has(action)) return err('invalid or missing action', origin, 400);
  if (!fingerprint || fingerprint.length > 128) return err('missing userIdOrFingerprint', origin, 400);
  if (customQuestion.length > 200) return err('customQuestion too long', origin, 400);
  if ((context.rawText || '').length > 4000) return err('context.rawText too long', origin, 400);
  // Grounding-only: an ungrounded ask with no source text gets graceful guidance
  // (not a 400) — the global widget stays source-bound, never answers from memory.
  if (!GROUNDED_ACTIONS.has(action) && rawText.length < 3) {
    return streamSafeText(NO_SOURCE_MESSAGE, { sources: [], confidence: 'High', model: 'guidance', cached: false, remaining: null }, origin);
  }

  if (!env || !env.GEMINI_API_KEY) return err('AI temporarily unavailable', origin, 503);
  if (!env.QURANLYAI_KV) return err('AI temporarily unavailable', origin, 503);

  const kv = env.QURANLYAI_KV;
  const date = todayUTC();

  // 3. IP safety cap (beta): per-user is unlimited; the only hard block is a per-IP daily
  //    cap that stops bot abuse. Checked every request; incremented only on real generation.
  const ipHash = await hashIp(request.headers.get('CF-Connecting-IP') || 'unknown');
  const ipQuota = await getIpQuota(kv, ipHash, date);
  if (ipQuota.blocked) return json({ remaining: 0 }, origin, { status: 429 });

  // 4. Cache check
  const key = await cacheKey(context, action, customQuestion);
  const cached = await getCached(kv, key);
  if (cached != null) {
    const meta = extractMeta(cached);
    return streamSafeText(cached, { ...meta, model: 'cache', cached: true, remaining: ipQuota.remaining }, origin);
  }

  // 5. Grounding
  let groundingText = null;
  if (GROUNDED_ACTIONS.has(action) || action === 'asbab_al_nuzul') {
    const g = buildGrounding(action, verseKeyOf(context), groundingData);
    groundingText = g.text;
  }

  // 6. Model routing
  const rulingAdjacent = looksRulingAdjacent(customQuestion + ' ' + rawText);
  const model = chooseModel(action, rulingAdjacent);

  // 7. Generate + safety filter (buffered)
  const userContent = buildUserPrompt(action, context, customQuestion, groundingText);
  let result;
  try {
    result = await callGemini(env, { model, system: QURANLYAI_SYSTEM_PROMPT, userContent, maxTokens: maxTokensFor(action) });
  } catch (_) {
    return err('AI explanation unavailable — please try again', origin, 502);
  }
  let safe = result.text;
  if (!safe || result.refusal) safe = RULING_DEFLECTION;
  if (verdictLangDetected(safe)) {
    console.log('[quranlyai] stripped verdict-language response');
    safe = RULING_DEFLECTION + (groundingText ? '\n\n**Sources**\n' + groundingText : '');
  }

  // 8. Persist (off the response path) + 9. Stream
  ctx.waitUntil(Promise.allSettled([
    putCached(kv, key, safe),
    incrementIpQuota(kv, ipHash, date),
  ]));

  const meta = extractMeta(safe);
  return streamSafeText(safe, { ...meta, model, cached: false, remaining: Math.max(0, ipQuota.remaining - 1) }, origin);
}
