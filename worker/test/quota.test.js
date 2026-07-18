import { test } from 'node:test';
import assert from 'node:assert';
import { GUEST_DAILY_LIMIT, resolveTier, quotaKey, getQuota, incrementQuota } from '../src/lib/quota.js';

function fakeKV(initial = {}) {
  const store = new Map(Object.entries(initial));
  const puts = [];
  return {
    async get(k) { return store.has(k) ? store.get(k) : null; },
    async put(k, v, opts) { store.set(k, v); puts.push({ k, v, opts }); },
    _store: store, _puts: puts,
  };
}

test('resolveTier returns guest today', () => {
  assert.equal(resolveTier({}, {}), 'guest');
});

test('quotaKey namespaces by fingerprint and date', () => {
  assert.equal(quotaKey('fp1', '2026-07-17'), 'quota:fp1:2026-07-17');
});

test('getQuota reports remaining and not blocked below the limit', async () => {
  const kv = fakeKV({ 'quota:fp1:2026-07-17': '1' });
  const q = await getQuota(kv, 'fp1', '2026-07-17', 'guest');
  assert.equal(q.count, 1);
  assert.equal(q.limit, GUEST_DAILY_LIMIT);
  assert.equal(q.remaining, GUEST_DAILY_LIMIT - 1);
  assert.equal(q.blocked, false);
});

test('getQuota blocks at the limit', async () => {
  const kv = fakeKV({ 'quota:fp1:2026-07-17': String(GUEST_DAILY_LIMIT) });
  const q = await getQuota(kv, 'fp1', '2026-07-17', 'guest');
  assert.equal(q.blocked, true);
  assert.equal(q.remaining, 0);
});

test('incrementQuota writes count+1 with a TTL', async () => {
  const kv = fakeKV({ 'quota:fp1:2026-07-17': '2' });
  await incrementQuota(kv, 'fp1', '2026-07-17');
  assert.equal(kv._store.get('quota:fp1:2026-07-17'), '3');
  assert.ok(kv._puts[0].opts.expirationTtl >= 60);
});
