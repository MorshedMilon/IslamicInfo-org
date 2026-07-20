/* KV JSON cache for the Hadith Library. All keys are `hadith:`-prefixed so
   they never collide with quota:/cache: keys in the shared namespace. Every
   function tolerates a falsy kv (no binding) as a safe no-op. */

export const TTL = {
  HOUR: 3600,
  DAY: 24 * 3600,
  WEEK: 7 * 24 * 3600,
};

export function hKey(...parts) {
  return 'hadith:' + parts.join(':');
}

export async function getJson(kv, key) {
  if (!kv) return null;
  try {
    const raw = await kv.get(key);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

export async function putJson(kv, key, value, ttlSeconds) {
  if (!kv) return;
  try {
    await kv.put(key, JSON.stringify(value), { expirationTtl: ttlSeconds });
  } catch (_) {
    /* cache write failures must never break a response */
  }
}
