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

/* ── IP-based safety cap (30-day beta) ──────────────────────────────────────────
   Per-user (fingerprint) is unlimited during the beta; the only hard block is a
   per-IP daily cap that stops bot abuse (a bot can rotate its fingerprint UUID but
   not its IP as freely). The caller passes a HASHED ip (no raw IPs stored — zero PII).
   POST-BETA: restore a per-user cap and revisit this number. */
export const IP_DAILY_LIMIT = 100;

export function ipKey(ipHash, date) {
  return `ip:${ipHash}:${date}`;
}

export async function getIpQuota(kv, ipHash, date) {
  const raw = await kv.get(ipKey(ipHash, date));
  const count = raw ? parseInt(raw, 10) || 0 : 0;
  const remaining = Math.max(0, IP_DAILY_LIMIT - count);
  return { count, limit: IP_DAILY_LIMIT, remaining, blocked: count >= IP_DAILY_LIMIT };
}

export async function incrementIpQuota(kv, ipHash, date) {
  const key = ipKey(ipHash, date);
  const raw = await kv.get(key);
  const count = raw ? parseInt(raw, 10) || 0 : 0;
  await kv.put(key, String(count + 1), { expirationTtl: secondsUntilUTCMidnight() });
}
