/* Per-fingerprint daily quota, backed by KV. KV binding is injected so the logic
   is unit-testable with a fake. Eventual consistency makes this a soft cost guard,
   not a security control (documented in the design spec §10). */
import { secondsUntilUTCMidnight } from './time.js';

export const GUEST_DAILY_LIMIT = 3;

const LIMITS = { guest: GUEST_DAILY_LIMIT };

// The ONLY place tier logic lives. Accounts get wired in here later.
export function resolveTier(_request, _env) {
  return 'guest';
}

export function limitForTier(tier) {
  return LIMITS[tier] == null ? GUEST_DAILY_LIMIT : LIMITS[tier];
}

export function quotaKey(fingerprint, date) {
  return `quota:${fingerprint}:${date}`;
}

export async function getQuota(kv, fingerprint, date, tier = 'guest') {
  const raw = await kv.get(quotaKey(fingerprint, date));
  const count = raw ? parseInt(raw, 10) || 0 : 0;
  const limit = limitForTier(tier);
  const remaining = Math.max(0, limit - count);
  return { count, limit, remaining, blocked: count >= limit };
}

export async function incrementQuota(kv, fingerprint, date) {
  const key = quotaKey(fingerprint, date);
  const raw = await kv.get(key);
  const count = raw ? parseInt(raw, 10) || 0 : 0;
  await kv.put(key, String(count + 1), { expirationTtl: secondsUntilUTCMidnight() });
}
