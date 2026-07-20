import { test } from 'node:test';
import assert from 'node:assert';
import { hKey, getJson, putJson, TTL } from '../src/lib/hadith-cache.js';

function fakeKV(initial = {}) {
  const store = new Map(Object.entries(initial));
  const puts = [];
  return {
    async get(k) { return store.has(k) ? store.get(k) : null; },
    async put(k, v, opts) { store.set(k, v); puts.push({ k, v, opts }); },
    _store: store, _puts: puts,
  };
}

test('hKey builds prefixed keys', () => {
  assert.equal(hKey('collections'), 'hadith:collections');
  assert.equal(hKey('one', 'sahih-bukhari', 1, 1), 'hadith:one:sahih-bukhari:1:1');
});

test('getJson returns null on miss, parsed value on hit', async () => {
  const kv = fakeKV();
  assert.equal(await getJson(kv, 'hadith:x'), null);
  await putJson(kv, 'hadith:x', { a: 1 }, TTL.DAY);
  assert.deepEqual(await getJson(kv, 'hadith:x'), { a: 1 });
});

test('getJson tolerates corrupt JSON (returns null, no throw)', async () => {
  const kv = fakeKV({ 'hadith:bad': '{not json' });
  assert.equal(await getJson(kv, 'hadith:bad'), null);
});

test('missing KV binding is a safe no-op', async () => {
  assert.equal(await getJson(null, 'hadith:x'), null);
  await putJson(undefined, 'hadith:x', { a: 1 }, TTL.DAY); // must not throw
});

test('putJson passes TTL through', async () => {
  const kv = fakeKV();
  await putJson(kv, 'hadith:x', { a: 1 }, 3600);
  assert.equal(kv._puts[0].opts.expirationTtl, 3600);
});
