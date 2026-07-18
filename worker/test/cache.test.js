import { test } from 'node:test';
import assert from 'node:assert';
import { cacheKey, getCached, putCached } from '../src/lib/cache.js';

function fakeKV(initial = {}) {
  const store = new Map(Object.entries(initial));
  const puts = [];
  return {
    async get(k) { return store.has(k) ? store.get(k) : null; },
    async put(k, v, opts) { store.set(k, v); puts.push({ k, v, opts }); },
    _store: store, _puts: puts,
  };
}

const ctx = { type: 'quran', surah: 2, ayah: 255, translationId: 'en-saheeh', language: 'en' };

test('cacheKey is prefixed and stable', async () => {
  const k1 = await cacheKey(ctx, 'explain', '');
  const k2 = await cacheKey(ctx, 'explain', '');
  assert.equal(k1, k2);
  assert.match(k1, /^cache:[0-9a-f]{64}$/);
});

test('getCached returns null on a miss and the value on a hit', async () => {
  const kv = fakeKV();
  const key = await cacheKey(ctx, 'explain', '');
  assert.equal(await getCached(kv, key), null);
  await putCached(kv, key, 'SAFE TEXT', 100);
  assert.equal(await getCached(kv, key), 'SAFE TEXT');
});

test('putCached passes a TTL through to KV', async () => {
  const kv = fakeKV();
  await putCached(kv, 'cache:abc', 'x', 3600);
  assert.equal(kv._puts[0].opts.expirationTtl, 3600);
});
