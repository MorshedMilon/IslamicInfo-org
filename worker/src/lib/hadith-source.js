/* hadithapi.com source client. Server-side ONLY — the API key is a Worker
   secret and must never reach the browser. URL builders are pure; fetchJson
   takes an injectable `fetcher` so it is unit-testable without a network. */

export const ALLOWED_SLUGS = new Set([
  'sahih-bukhari', 'sahih-muslim', 'al-tirmidhi', 'abu-dawood', 'ibn-e-majah',
  'sunan-nasai', 'mishkat', 'musnad-ahmad', 'al-silsila-sahiha',
]);

export function booksUrl(base, key) {
  return `${base}/public/api/books?apiKey=${encodeURIComponent(key)}`;
}

export function chaptersUrl(base, key, slug) {
  return `${base}/api/${slug}/chapters?apiKey=${encodeURIComponent(key)}`;
}

export function hadithsUrl(base, key, params = {}) {
  const u = new URL(`${base}/api/hadiths/`);
  u.searchParams.set('apiKey', key);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') u.searchParams.set(k, String(v));
  }
  return u.toString();
}

export async function fetchJson(url, { timeoutMs = 8000, fetcher = fetch, allow404 = false } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetcher(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'IslamicInfo.org proxy (hello@islamicinfo.org)' },
    });
    // hadithapi.com answers a zero-match search with HTTP 404 { message: "Hadiths not found." }.
    // That is an empty result, not an outage — callers that pass allow404 get the parsed body
    // (which has no `hadiths` field) so it normalizes to an empty list instead of throwing.
    if (res.status === 404 && allow404) return await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`upstream HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}
