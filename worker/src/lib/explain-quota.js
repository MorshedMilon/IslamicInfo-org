/* Hourly per-IP quota for /api/explain — distinct from the daily quota in quota.js.
   Spec: 20 requests / IP / hour, 429 + Retry-After. Zero-PII (the caller passes a
   SHA-256 IP hash). Pure w.r.t. `now` (ms) so it is deterministic under test. */

export const EXPLAIN_HOURLY_LIMIT = 20;

export function hourStamp(now) {
  const d = new Date(now);
  const y = d.getUTCFullYear();
  const mo = String(d.getUTCMonth() + 1).padStart(2, '0');
  const da = String(d.getUTCDate()).padStart(2, '0');
  const h = String(d.getUTCHours()).padStart(2, '0');
  return `${y}${mo}${da}${h}`;
}

export function secondsUntilNextHour(now) {
  const msIntoHour = ((now % 3600000) + 3600000) % 3600000;
  return Math.max(1, Math.ceil((3600000 - msIntoHour) / 1000));
}

export function explainIpKey(ipHash, now) {
  return `explain_quota:${ipHash}:${hourStamp(now)}`;
}

export async function getExplainQuota(kv, ipHash, now) {
  const raw = await kv.get(explainIpKey(ipHash, now));
  const count = raw ? parseInt(raw, 10) || 0 : 0;
  const remaining = Math.max(0, EXPLAIN_HOURLY_LIMIT - count);
  return {
    count,
    limit: EXPLAIN_HOURLY_LIMIT,
    remaining,
    blocked: count >= EXPLAIN_HOURLY_LIMIT,
    retryAfter: secondsUntilNextHour(now),
  };
}

export async function incrementExplainQuota(kv, ipHash, now) {
  const key = explainIpKey(ipHash, now);
  const raw = await kv.get(key);
  const count = raw ? parseInt(raw, 10) || 0 : 0;
  // +60s cushion so the counter never expires before the hour it counts is over.
  await kv.put(key, String(count + 1), { expirationTtl: secondsUntilNextHour(now) + 60 });
}
