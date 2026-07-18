/* AI response cache, backed by KV (binding injected for testability). */
import { hashContext } from './hash-context.js';

// 30 days: safe cache text is deterministic for a given verse+action+translation.
export const CACHE_TTL_SECONDS = 30 * 24 * 3600;

export async function cacheKey(context, action, customQuestion) {
  return `cache:${await hashContext(context, action, customQuestion)}`;
}

export async function getCached(kv, key) {
  return await kv.get(key);
}

export async function putCached(kv, key, text, ttl = CACHE_TTL_SECONDS) {
  await kv.put(key, text, { expirationTtl: ttl });
}
