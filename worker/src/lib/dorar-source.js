/* Dorar.net Hadith Encyclopedia (الموسوعة الحديثية) source client — server-side ONLY.
   Talks to the public dorar_api.json endpoint and returns the raw HTML result string.
   URL/param mechanics and the Silsila book id (561) are verified against the
   MIT-licensed wrapper github.com/AhmedElTabarani/dorar-hadith-api. `fetcher` is
   injectable so this is unit-testable without a network. */

export const SILSILA_BOOK_ID = '561'; // السلسلة الصحيحة (al-Albani) — dorar book id

// Build the Dorar API URL. Query goes in as `skey`; `s[]=561` scopes to Silsila.
export function dorarSearchUrl(query, page = 1) {
  const p = new URLSearchParams();
  p.set('skey', String(query == null ? '' : query));
  p.append('s[]', SILSILA_BOOK_ID);
  if (Number(page) > 1) p.set('page', String(parseInt(page, 10)));
  return `https://dorar.net/dorar_api.json?${p.toString()}`;
}

export async function fetchDorarResult(query, page = 1, { fetcher = fetch, timeoutMs = 8000 } = {}) {
  const url = dorarSearchUrl(query, page);
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetcher(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'IslamicInfo.org proxy (hello@islamicinfo.org)' },
    });
    if (!res.ok) throw new Error(`upstream HTTP ${res.status}`);
    const data = await res.json();
    const html = data && data.ahadith && data.ahadith.result;
    if (!html) throw new Error('missing ahadith.result in Dorar response');
    return html;
  } finally {
    clearTimeout(t);
  }
}
