import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

/* Regression guard for the AhmedBaset/fawazahmed0 "direct-source" collections.
   Two failures this locks down:
   1. The browse feed loader must use the PROVIDER-ROUTED fetch (fetchHadithsByBook),
      not the Worker-only fetchHadithList — the Worker rejects direct-source slugs
      with `bad_slug`, so browsing them showed no hadiths.
   2. The AhmedBaset base URL must be the immutable jsdelivr CDN, not the rate-limited
      raw.githubusercontent.com (which throttles 2-3 MB files under real traffic). */

const here = dirname(fileURLToPath(import.meta.url));

// --- shims so the browser UMD api.js loads + runs under node ---
globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const calls = [];
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, opts) => {
  calls.push(String(url));
  if (String(url).includes('jsdelivr') || String(url).includes('githubusercontent')) {
    // AhmedBaset by_book doc shape
    return { ok: true, json: async () => ({ metadata: {}, hadiths: [
      { id: 1, idInBook: 1, chapterId: 1, arabic: 'عربى', english: { narrator: 'Abu Hurayrah', text: 'A sample hadith translation.' } },
    ] }) };
  }
  // Worker envelope for hadithapi delegation
  return { ok: true, json: async () => ({ ok: true, data: { hadiths: [], page: 1, total: 0, lastPage: 1 }, source: 'live' }) };
};

const api = (await import('../../src/js/api.js')).default;
globalThis.fetch = realFetch; // restore for other tests

test('AhmedBaset base URL is the immutable jsdelivr CDN (not rate-limited raw.githubusercontent)', () => {
  const src = readFileSync(resolve(here, '../../src/js/api.js'), 'utf8');
  const m = src.match(/ahmedbaset:\s*'([^']+)'/);
  assert.ok(m, 'HADITH_DIRECT_BASE.ahmedbaset defined');
  assert.match(m[1], /cdn\.jsdelivr\.net/, 'AhmedBaset must be served via jsdelivr CDN');
  assert.doesNotMatch(m[1], /raw\.githubusercontent\.com/, 'must not use rate-limited raw.githubusercontent');
});

test('fetchHadithsByBook routes a direct (ahmedbaset) slug to the CDN and normalizes hadiths', async () => {
  calls.length = 0;
  globalThis.fetch = async (url) => {
    calls.push(String(url));
    return { ok: true, json: async () => ({ hadiths: [
      { id: 1, idInBook: 1, chapterId: 1, arabic: 'عربى', english: { narrator: 'Abu Hurayrah', text: 'A sample hadith translation.' } },
    ] }) };
  };
  const res = await api.fetchHadithsByBook('riyad-assalihin', null, 1, 3);
  globalThis.fetch = realFetch;
  assert.strictEqual(res.ok, true);
  assert.strictEqual(res.data.hadiths.length, 1);
  assert.strictEqual(res.data.hadiths[0].translation.text, 'A sample hadith translation.');
  assert.ok(calls.some((u) => u.includes('cdn.jsdelivr.net') && u.includes('riyad_assalihin')), 'fetched the jsdelivr AhmedBaset file; got: ' + calls.join(','));
});

test('the browse feed loader is wired to the provider-routed fetch (not Worker-only)', () => {
  const src = readFileSync(resolve(here, '../../src/js/hadith.js'), 'utf8');
  const loader = src.slice(src.indexOf('async function loadHadithFeed'), src.indexOf('async function loadHadithFeed') + 700);
  assert.match(loader, /api\.fetchHadithsByBook\(/, 'loadHadithFeed must call fetchHadithsByBook so direct-source collections load');
  assert.doesNotMatch(loader, /api\.fetchHadithList\(/, 'loadHadithFeed must not call the Worker-only fetchHadithList (rejects direct-source slugs)');
});
