/* Canonical SHA-256 cache-key derivation. crypto.subtle is available in both
   Cloudflare Workers and Node 18+. */

const KEY_FIELDS = [
  'type', 'surah', 'ayah', 'hadithBook', 'hadithNumber',
  'duaId', 'articleId', 'translationId', 'tafsirSource', 'language',
];

function hasStableId(ctx) {
  return ctx.surah != null || ctx.hadithNumber != null ||
    ctx.duaId != null || ctx.articleId != null;
}

export async function hashContext(context, action, customQuestion) {
  const ctx = context || {};
  const parts = KEY_FIELDS.map((f) => `${f}=${ctx[f] == null ? '' : ctx[f]}`);
  parts.push(`action=${action || ''}`);
  parts.push(`q=${customQuestion || ''}`);
  // Free-form contexts (search, or no stable id) must fold rawText so distinct
  // texts do not collide on the same empty id-set.
  if (ctx.type === 'search' || !hasStableId(ctx)) {
    parts.push(`raw=${ctx.rawText || ''}`);
  }
  const canonical = parts.join('|');
  const bytes = new TextEncoder().encode(canonical);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
