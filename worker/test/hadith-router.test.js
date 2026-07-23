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

test('hadith list survives a malformed record and returns the good ones', async () => {
  const mixedFetcher = async () => ({ ok: true, status: 200, json: async () => ({
    hadiths: { data: [null,
      { hadithNumber: '2', hadithArabic: 'x', hadithEnglish: 'y', status: 'Sahih',
        book: { bookSlug: 'sahih-bukhari', bookName: 'Sahih Bukhari' }, chapter: { chapterNumber: '1' } }],
      last_page: 1, total: 2 },
  }) });
  const res = await handleHadith('/api/hadith/collections/sahih-bukhari/books/1/hadiths',
    new URLSearchParams('page=1'), ENV(), ORIGIN, { fetcher: mixedFetcher });
  assert.equal(res.status, 200);
  const b = await res.json();
  assert.equal(b.data.hadiths.length, 1);
  assert.equal(b.data.hadiths[0].hadithNumber, 2);
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

test('search rejects q shorter than 2 chars', async () => {
  const res = await handleHadith('/api/hadith/search', new URLSearchParams('q=a'), ENV(), ORIGIN, {});
  assert.equal(res.status, 400);
});

test('search rejects a query longer than 100 chars', async () => {
  const res = await handleHadith('/api/hadith/search', new URLSearchParams('q=' + 'a'.repeat(101)),
    ENV(), ORIGIN, {});
  assert.equal(res.status, 400);
});

test('search returns 503 retryable when the API key is missing', async () => {
  const res = await handleHadith('/api/hadith/search', new URLSearchParams('q=mercy'),
    ENV({ HADITH_API_KEY: '' }), ORIGIN, {});
  assert.equal(res.status, 503);
  assert.equal((await res.json()).error.retryable, true);
});

test('search returns normalized results', async () => {
  const res = await handleHadith('/api/hadith/search', new URLSearchParams('q=intention'),
    ENV(), ORIGIN, { fetcher: listFetcher });
  const b = await res.json();
  assert.equal(b.ok, true);
  assert.equal(b.data.results[0].hadithNumber, 1);
});

test('daily falls back to the static hadith when upstream fails and cache is empty', async () => {
  const failing = async () => { throw new Error('down'); };
  const res = await handleHadith('/api/hadith/daily', new URLSearchParams(), ENV(), ORIGIN, { fetcher: failing });
  const b = await res.json();
  assert.equal(b.ok, true);
  assert.equal(b.source, 'fallback');
  assert.equal(b.data.collectionSlug, 'sahih-bukhari');
  assert.equal(b.data.grade.value, 'sahih');
});

test('narrators endpoint honestly reports unavailable', async () => {
  const res = await handleHadith('/api/hadith/narrators/123', new URLSearchParams(), ENV(), ORIGIN, {});
  assert.equal(res.status, 200);
  const b = await res.json();
  assert.equal(b.data.status, 'unavailable');
});

test('flat collection list returns a paginated envelope (book-only, no chapter)', async () => {
  let calledUrl = '';
  const spyFetcher = async (url) => { calledUrl = url; return {
    ok: true, status: 200, json: async () => ({
      hadiths: { data: [{ hadithNumber: '26', hadithArabic: 'ن', hadithEnglish: 'text',
        englishNarrator: 'Anas', status: 'Sahih',
        book: { bookSlug: 'sahih-bukhari', bookName: 'Sahih Bukhari' },
        chapter: { chapterNumber: '2', chapterEnglish: 'Faith' } }], last_page: 5, total: 120 },
    }) }; };
  const res = await handleHadith('/api/hadith/collections/sahih-bukhari/hadiths',
    new URLSearchParams('page=2&limit=25'), ENV(), ORIGIN, { fetcher: spyFetcher });
  assert.equal(res.status, 200);
  const b = await res.json();
  assert.equal(b.ok, true);
  assert.equal(b.data.hadiths.length, 1);
  assert.equal(b.data.page, 2);
  assert.equal(b.data.lastPage, 5);
  assert.equal(b.data.total, 120);
  assert.ok(!/chapter=/.test(calledUrl), 'flat list must NOT send a chapter param');
  assert.ok(/book=sahih-bukhari/.test(calledUrl), 'flat list filters by book slug');
});

test('flat collection route resolves a hadith number to its record', async () => {
  const res = await handleHadith('/api/hadith/collections/sahih-bukhari/hadiths',
    new URLSearchParams('hadithNumber=26'), ENV(), ORIGIN, { fetcher: async () => ({
      ok: true, status: 200, json: async () => ({
        hadiths: { data: [{ hadithNumber: '26', hadithArabic: 'ن', hadithEnglish: 'text',
          book: { bookSlug: 'sahih-bukhari', bookName: 'Sahih Bukhari' },
          chapter: { chapterNumber: '2', chapterEnglish: 'Faith' } }], last_page: 1, total: 1 },
      }) }) });
  const b = await res.json();
  assert.equal(b.ok, true);
  assert.equal(b.data.hadiths[0].hadithNumber, 26);
  assert.equal(b.data.hadiths[0].bookNumber, 2, 'resolver exposes the real book number');
});

test('flat collection route rejects a slug outside the allowlist', async () => {
  const res = await handleHadith('/api/hadith/collections/evil/hadiths',
    new URLSearchParams(), ENV(), ORIGIN, {});
  assert.equal(res.status, 400);
  assert.equal((await res.json()).error.retryable, false);
});

test('flat collection route yields 503 when API key is missing', async () => {
  const res = await handleHadith('/api/hadith/collections/sahih-bukhari/hadiths',
    new URLSearchParams(), ENV({ HADITH_API_KEY: '' }), ORIGIN, {});
  assert.equal(res.status, 503);
  assert.equal((await res.json()).error.retryable, true);
});
