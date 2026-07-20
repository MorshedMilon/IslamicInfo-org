import { test } from 'node:test';
import assert from 'node:assert';
import { ALLOWED_SLUGS, booksUrl, chaptersUrl, hadithsUrl, fetchJson } from '../src/lib/hadith-source.js';

const BASE = 'https://hadithapi.com';
const KEY = 'TESTKEY';

test('booksUrl targets the public books endpoint with the key', () => {
  assert.equal(booksUrl(BASE, KEY), 'https://hadithapi.com/public/api/books?apiKey=TESTKEY');
});

test('chaptersUrl embeds the book slug', () => {
  assert.equal(chaptersUrl(BASE, KEY, 'sahih-bukhari'),
    'https://hadithapi.com/api/sahih-bukhari/chapters?apiKey=TESTKEY');
});

test('hadithsUrl builds filters and URL-encodes the search term', () => {
  const u = new URL(hadithsUrl(BASE, KEY, { book: 'sahih-bukhari', chapter: 1, paginate: 25, page: 2 }));
  assert.equal(u.pathname, '/api/hadiths/');
  assert.equal(u.searchParams.get('apiKey'), 'TESTKEY');
  assert.equal(u.searchParams.get('book'), 'sahih-bukhari');
  assert.equal(u.searchParams.get('chapter'), '1');
  assert.equal(u.searchParams.get('paginate'), '25');
  assert.equal(u.searchParams.get('page'), '2');
});

test('hadithsUrl passes an English search term', () => {
  const u = new URL(hadithsUrl(BASE, KEY, { hadithEnglish: 'intention & deeds' }));
  assert.equal(u.searchParams.get('hadithEnglish'), 'intention & deeds');
});

test('ALLOWED_SLUGS contains the nine documented collections', () => {
  ['sahih-bukhari','sahih-muslim','al-tirmidhi','abu-dawood','ibn-e-majah',
   'sunan-nasai','mishkat','musnad-ahmad','al-silsila-sahiha']
   .forEach(s => assert.ok(ALLOWED_SLUGS.has(s), `${s} missing`));
});

test('fetchJson aborts and throws on a non-ok status', async () => {
  const fakeFetch = async () => ({ ok: false, status: 500, json: async () => ({}) });
  await assert.rejects(() => fetchJson('http://x', { fetcher: fakeFetch }), /HTTP 500/);
});

test('fetchJson returns parsed JSON on success', async () => {
  const fakeFetch = async () => ({ ok: true, status: 200, json: async () => ({ hi: 1 }) });
  assert.deepEqual(await fetchJson('http://x', { fetcher: fakeFetch }), { hi: 1 });
});
