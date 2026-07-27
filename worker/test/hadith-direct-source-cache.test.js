import { test } from 'node:test';
import assert from 'node:assert';

/* Regression guard for the localStorage-quota exhaustion bug that made hadith
   collections "stop loading" for returning visitors.

   The AhmedBaset/fawazahmed0 "direct-source" datasets are multi-MB JSON files
   (riyad ~3.3MB, musnad-ahmad ~3.1MB, bulugh ~2.8MB). Older builds cached each
   one WHOLE in localStorage under `islamicinfo-hadith-ab-*` / `-fawaz-*` keys
   (7-day TTL). Browsing a handful of the 9 direct-source collections filled the
   entire ~10MB per-origin localStorage quota — after which EVERY other write on
   the site failed silently (bookmarks, notes, progress, the collections seed),
   and already-cached entries froze stale for 7 days because refresh-writes then
   failed too. Net effect for the user: "18 books not loading, 9 AhmedBaset
   books missing."

   Permanent fix: never persist these large payloads in localStorage — cache
   them in-memory for the session (jsdelivr serves them immutably, so a reload
   re-fetch is served from the browser HTTP cache). Plus a one-time cleanup that
   purges any legacy oversized keys so wedged returning visitors recover. */

// --- stateful localStorage mock, pre-seeded with LEGACY oversized direct-source
//     entries (the exact thing that fills the quota) + one unrelated key ---
const store = new Map();
store.set('islamicinfo-hadith-ab-other-books-riyad-assalihin-json', JSON.stringify({ data: { hadiths: [] }, ts: Date.now() }));
store.set('islamicinfo-hadith-fawaz-eng-nawawi', JSON.stringify({ data: { hadiths: [] }, ts: Date.now() }));
store.set('ii-habits', '{"keep":1}');

const setCalls = [];
globalThis.localStorage = {
  get length() { return store.size; },
  key: (i) => Array.from(store.keys())[i] ?? null,
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => { setCalls.push(k); store.set(k, v); },
  removeItem: (k) => { store.delete(k); },
};

const realFetch = globalThis.fetch;
let fetchCount = 0;
globalThis.fetch = async (url) => {
  fetchCount++;
  // AhmedBaset by_book doc shape (idInBook/chapterId/english.text)
  return { ok: true, json: async () => ({ hadiths: [
    { id: 1, idInBook: 1, chapterId: 1, arabic: 'عربى', english: { narrator: 'Abu Hurayrah', text: 'A sample hadith translation.' } },
  ] }) };
};

const api = (await import('../../src/js/api.js')).default;

test('init purges legacy oversized direct-source localStorage entries (quota recovery)', () => {
  assert.strictEqual(store.has('islamicinfo-hadith-ab-other-books-riyad-assalihin-json'), false, 'legacy AhmedBaset blob must be purged on load');
  assert.strictEqual(store.has('islamicinfo-hadith-fawaz-eng-nawawi'), false, 'legacy fawaz blob must be purged on load');
  assert.strictEqual(store.get('ii-habits'), '{"keep":1}', 'unrelated localStorage keys must be untouched');
});

test('direct-source datasets are NEVER persisted to localStorage (no quota pollution)', async () => {
  setCalls.length = 0;
  const res = await api.fetchHadithsByBook('riyad-assalihin', null, 1, 3);
  assert.strictEqual(res.ok, true);
  assert.strictEqual(res.data.hadiths.length, 1);
  assert.ok(
    !setCalls.some((k) => k.startsWith('islamicinfo-hadith-ab-') || k.startsWith('islamicinfo-hadith-fawaz-')),
    'must not write multi-MB direct-source payloads to localStorage; wrote: ' + setCalls.join(','),
  );
});

test('direct-source datasets are cached in-memory for the session (one fetch per collection)', async () => {
  fetchCount = 0;
  await api.fetchHadithsByBook('bulugh-almaram', null, 1, 3);
  await api.fetchHadithsByBook('bulugh-almaram', null, 2, 3);
  assert.strictEqual(fetchCount, 1, 'second view of the same collection must be served from memory, not re-fetched');
  globalThis.fetch = realFetch;
});
