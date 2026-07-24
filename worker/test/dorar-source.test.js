import { test } from 'node:test';
import assert from 'node:assert';
import { SILSILA_BOOK_ID, dorarSearchUrl, fetchDorarResult } from '../src/lib/dorar-source.js';

test('SILSILA_BOOK_ID is the Dorar book id for al-Silsila as-Sahiha', () => {
  assert.equal(SILSILA_BOOK_ID, '561');
});

test('dorarSearchUrl encodes the query as skey and scopes to Silsila via s[]=561', () => {
  const u = dorarSearchUrl('النية', 1);
  assert.ok(u.startsWith('https://dorar.net/dorar_api.json?'));
  assert.match(u, /skey=%D8%A7%D9%84%D9%86%D9%8A%D8%A9/); // النية encoded
  assert.match(u, /s%5B%5D=561|s\[\]=561/);              // s[]=561 (encoded or raw)
});

test('dorarSearchUrl adds page when > 1', () => {
  assert.match(dorarSearchUrl('x', 3), /page=3/);
});

test('fetchDorarResult returns the ahadith.result HTML string via injected fetcher', async () => {
  const fakeFetcher = async () => ({ ok: true, json: async () => ({ ahadith: { result: '<div class="hadith-info"></div>' } }) });
  const html = await fetchDorarResult('x', 1, { fetcher: fakeFetcher });
  assert.equal(html, '<div class="hadith-info"></div>');
});

test('fetchDorarResult throws on non-ok upstream', async () => {
  const fakeFetcher = async () => ({ ok: false, status: 403, json: async () => ({}) });
  await assert.rejects(() => fetchDorarResult('x', 1, { fetcher: fakeFetcher }), /upstream/);
});

test('fetchDorarResult throws when ahadith.result missing', async () => {
  const fakeFetcher = async () => ({ ok: true, json: async () => ({}) });
  await assert.rejects(() => fetchDorarResult('x', 1, { fetcher: fakeFetcher }), /result/);
});
