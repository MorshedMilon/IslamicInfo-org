/* POST /api/quranlyai/ask — the 8-step pipeline (design spec §6). */
import { ALLOWED_ORIGINS, err, json } from './lib/cors.js';
import { todayUTC } from './lib/time.js';
import { resolveTier, getQuota, incrementQuota } from './lib/quota.js';
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
  'explain', 'simple', 'summarize_tafsir', 'key_lessons', 'related_verses',
  'related_hadith', 'asbab_al_nuzul', 'compare_translations', 'vocabulary', 'custom',
]);

function verseKeyOf(ctx) {
  return (ctx && ctx.surah != null && ctx.ayah != null) ? `${ctx.surah}:${ctx.ayah}` : '';
}

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
  // rawText is required for ungrounded actions; grounded actions can rely on the index.
  if (!GROUNDED_ACTIONS.has(action) && rawText.length < 3) return err('context.rawText missing or too short', origin, 400);

  if (!env || !env.GEMINI_API_KEY) return err('AI temporarily unavailable', origin, 503);
  if (!env.QURANLYAI_KV) return err('AI temporarily unavailable', origin, 503);

  const kv = env.QURANLYAI_KV;
  const date = todayUTC();
  const tier = resolveTier(request, env);

  // 3. Quota check (checked every request; incremented only on real generation)
  const quota = await getQuota(kv, fingerprint, date, tier);
  if (quota.blocked) return json({ remaining: 0 }, origin, { status: 429 });

  // 4. Cache check
  const key = await cacheKey(context, action, customQuestion);
  const cached = await getCached(kv, key);
  if (cached != null) {
    const meta = extractMeta(cached);
    return streamSafeText(cached, { ...meta, model: 'cache', cached: true, remaining: quota.remaining }, origin);
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
    incrementQuota(kv, fingerprint, date),
  ]));

  const meta = extractMeta(safe);
  return streamSafeText(safe, { ...meta, model, cached: false, remaining: Math.max(0, quota.remaining - 1) }, origin);
}
