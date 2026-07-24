import { test } from 'node:test';
import assert from 'node:assert';
import { handleDorarSearch } from '../src/hadith.js';

function fakeKV() {
  const m = new Map();
  return { get: async (k) => m.get(k) ?? null, put: async (k, v) => void m.set(k, v), _m: m };
}
const RESULT = { ahadith: { result:
  '<div class="hadith">1 - إنما الأعمال بالنيات</div>' +
  '<div class="hadith-info">' +
  '<span class="info-subtitle">الراوي:</span> عمر' +
  '<span class="info-subtitle">المحدث:</span> الألباني' +
  '<span class="info-subtitle">المصدر:</span> السلسلة الصحيحة' +
  '<span class="info-subtitle">الصفحة أو الرقم:</span> 6/778' +
  '<span class="info-subtitle">خلاصة حكم المحدث:</span> رجاله ثقات</div>' } };
const ENV = (over = {}) => ({ QURANLYAI_KV: fakeKV(), HADITH_SILSILA_DORAR_ENABLED: 'true', ...over });
const okFetcher = async () => ({ ok: true, json: async () => RESULT });

test('flag OFF → disabled envelope, no upstream call', async () => {
  let called = false;
  const res = await handleDorarSearch({ query: 'x', page: 1, ip: '1.1.1.1' },
    ENV({ HADITH_SILSILA_DORAR_ENABLED: 'false' }), { fetcher: async () => { called = true; } });
  const body = await res.json();
  assert.equal(body.ok, false);
  assert.equal(body.error.code, 'disabled');
  assert.equal(called, false);
});

test('empty query → bad_query, no upstream call', async () => {
  let called = false;
  const res = await handleDorarSearch({ query: '   ', page: 1, ip: '1.1.1.1' },
    ENV(), { fetcher: async () => { called = true; } });
  const body = await res.json();
  assert.equal(body.ok, false);
  assert.equal(body.error.code, 'bad_query');
  assert.equal(called, false);
});

test('happy path → normalized items with reference + ruling set', async () => {
  const res = await handleDorarSearch({ query: 'النية', page: 1, ip: '1.1.1.1' }, ENV(), { fetcher: okFetcher });
  const body = await res.json();
  assert.equal(body.ok, true);
  assert.equal(body.data.items.length, 1);
  assert.equal(body.data.items[0].reference, 'Al-Silsilah al-Sahihah — 6/778');
  assert.equal(body.data.items[0].grader, 'الألباني');
  assert.match(body.data.items[0].ruling, /رجاله ثقات/);
  assert.equal(body.data.items[0].grade, undefined);
  assert.match(body.data.items[0].dorarUrl, /dorar\.net\/hadith\/search\?q=/);
  assert.equal(body.source, 'live');
});

test('second identical call is served from cache', async () => {
  const env = ENV();
  const args = { query: 'النية', page: 1, ip: '1.1.1.1' };
  await handleDorarSearch(args, env, { fetcher: okFetcher });
  const res2 = await handleDorarSearch(args, env, { fetcher: async () => { throw new Error('should not fetch'); } });
  const body = await res2.json();
  assert.equal(body.ok, true);
  assert.equal(body.source, 'cache');
});

test('upstream failure → fail-closed upstream error', async () => {
  const res = await handleDorarSearch({ query: 'x', page: 1, ip: '1.1.1.1' }, ENV(),
    { fetcher: async () => ({ ok: false, status: 403, json: async () => ({}) }) });
  const body = await res.json();
  assert.equal(body.ok, false);
  assert.equal(body.error.code, 'upstream');
});

test('over quota → quota error', async () => {
  const env = ENV();
  const fetcher = okFetcher;
  for (let i = 0; i < 100; i++) await handleDorarSearch({ query: 'q' + i, page: 1, ip: '9.9.9.9' }, env, { fetcher });
  const res = await handleDorarSearch({ query: 'again', page: 1, ip: '9.9.9.9' }, env, { fetcher });
  const body = await res.json();
  assert.equal(body.ok, false);
  assert.equal(body.error.code, 'quota');
});
