import { test } from 'node:test';
import assert from 'node:assert';
import { handleHadith } from '../src/hadith.js';

function fakeKV() {
  const store = new Map();
  return { async get(k){return store.has(k)?store.get(k):null;}, async put(k,v){store.set(k,v);} , _store: store };
}
const ORIGIN = 'https://islamicinfo.org';
const ENV = (over = {}) => ({ QURANLYAI_KV: fakeKV(), HADITH_API_KEY: 'K', HADITH_API_BASE_URL: 'https://hadithapi.com', ...over });

// Injectable fetcher returns an ASSUMPTION-shaped books payload.
const booksFetcher = async () => ({ ok: true, status: 200, json: async () => ({
  books: [{ bookName: 'Sahih Bukhari', bookSlug: 'sahih-bukhari', writerName: 'Imam Bukhari',
            hadiths_count: '7563', chapters_count: '97' }],
}) });

test('unknown sub-path returns a 404 envelope', async () => {
  const res = await handleHadith('/api/hadith/nope', new URLSearchParams(), ENV(), ORIGIN, {});
  assert.equal(res.status, 404);
  const b = await res.json();
  assert.equal(b.ok, false);
  assert.equal(b.error.retryable, false);
});

test('collections returns a normalized live envelope', async () => {
  const res = await handleHadith('/api/hadith/collections', new URLSearchParams(),
    ENV(), ORIGIN, { fetcher: booksFetcher });
  assert.equal(res.status, 200);
  const b = await res.json();
  assert.equal(b.ok, true);
  assert.equal(b.source, 'live');
  assert.equal(b.data[0].collectionSlug, 'sahih-bukhari');
  assert.equal(b.data[0].hadithCount, 7563);
});

test('collections serves cache on upstream failure', async () => {
  const env = ENV();
  await env.QURANLYAI_KV.put('hadith:collections', JSON.stringify([{ collectionSlug: 'sahih-muslim' }]));
  const failing = async () => { throw new Error('network down'); };
  const res = await handleHadith('/api/hadith/collections', new URLSearchParams(), env, ORIGIN, { fetcher: failing });
  const b = await res.json();
  assert.equal(b.source, 'cache');
  assert.equal(b.data[0].collectionSlug, 'sahih-muslim');
});

test('missing API key yields a 503 retryable envelope', async () => {
  const res = await handleHadith('/api/hadith/collections', new URLSearchParams(),
    ENV({ HADITH_API_KEY: '' }), ORIGIN, { fetcher: booksFetcher });
  assert.equal(res.status, 503);
  const b = await res.json();
  assert.equal(b.error.retryable, true);
});

const chaptersFetcher = async () => ({ ok: true, status: 200, json: async () => ({
  chapters: [{ chapterNumber: '1', chapterEnglish: 'Revelation', chapterArabic: 'الوحي', bookSlug: 'sahih-bukhari' }],
}) });

const listFetcher = async () => ({ ok: true, status: 200, json: async () => ({
  hadiths: { data: [{ hadithNumber: '1', hadithArabic: 'إنما الأعمال', hadithEnglish: 'Actions by intentions',
    englishNarrator: 'Umar', status: 'Sahih', book: { bookSlug: 'sahih-bukhari', bookName: 'Sahih Bukhari' },
    chapter: { chapterNumber: '1', chapterEnglish: 'Revelation' } }], last_page: 1, total: 1 },
}) });

test('chapters rejects a slug outside the allowlist', async () => {
  const res = await handleHadith('/api/hadith/collections/evil-book/books', new URLSearchParams(), ENV(), ORIGIN, {});
  assert.equal(res.status, 400);
  assert.equal((await res.json()).error.retryable, false);
});

test('chapters returns normalized books for a valid slug', async () => {
  const res = await handleHadith('/api/hadith/collections/sahih-bukhari/books', new URLSearchParams(),
    ENV(), ORIGIN, { fetcher: chaptersFetcher });
  const b = await res.json();
  assert.equal(b.ok, true);
  assert.equal(b.data[0].bookName, 'Revelation');
});

test('hadith list normalizes and echoes pagination', async () => {
  const res = await handleHadith('/api/hadith/collections/sahih-bukhari/books/1/hadiths',
    new URLSearchParams('page=1&limit=25'), ENV(), ORIGIN, { fetcher: listFetcher });
  const b = await res.json();
  assert.equal(b.ok, true);
  assert.equal(b.data.hadiths[0].hadithNumber, 1);
  assert.equal(b.data.hadiths[0].grade.value, 'sahih');
  assert.equal(b.data.page, 1);
});

test('single hadith rejects a non-positive number', async () => {
  const res = await handleHadith('/api/hadith/sahih-bukhari/1/0', new URLSearchParams(), ENV(), ORIGIN, {});
  assert.equal(res.status, 400);
});

test('single hadith returns one normalized record', async () => {
  const res = await handleHadith('/api/hadith/sahih-bukhari/1/1', new URLSearchParams(),
    ENV(), ORIGIN, { fetcher: listFetcher });
  const b = await res.json();
  assert.equal(b.data.hadithNumber, 1);
  assert.equal(b.data.collectionSlug, 'sahih-bukhari');
});
