import { test } from 'node:test';
import assert from 'node:assert';
import {
  EXPLAIN_HOURLY_LIMIT, hourStamp, secondsUntilNextHour, explainIpKey,
  getExplainQuota, incrementExplainQuota,
} from '../src/lib/explain-quota.js';

function fakeKV(initial = {}) {
  const store = new Map(Object.entries(initial));
  const puts = [];
  return {
    async get(k) { return store.has(k) ? store.get(k) : null; },
    async put(k, v, opts) { store.set(k, v); puts.push({ k, v, opts }); },
    _store: store, _puts: puts,
  };
}

// 2026-07-22T13:20:00Z
const NOW = Date.UTC(2026, 6, 22, 13, 20, 0);

test('hourStamp: UTC YYYYMMDDHH', () => {
  assert.equal(hourStamp(NOW), '2026072213');
});

test('secondsUntilNextHour: seconds remaining to the next hour boundary', () => {
  // 13:20:00 → 40 min = 2400s to 14:00
  assert.equal(secondsUntilNextHour(NOW), 2400);
  assert.equal(secondsUntilNextHour(Date.UTC(2026, 6, 22, 13, 59, 59)), 1);
});

test('explainIpKey: namespaced hourly key', () => {
  assert.equal(explainIpKey('abc', NOW), 'explain_quota:abc:2026072213');
});

test('getExplainQuota: fresh IP is not blocked, full remaining', async () => {
  const kv = fakeKV();
  const q = await getExplainQuota(kv, 'abc', NOW);
  assert.equal(q.blocked, false);
  assert.equal(q.remaining, EXPLAIN_HOURLY_LIMIT);
  assert.equal(q.retryAfter, 2400);
});

test('getExplainQuota: at limit → blocked with retryAfter', async () => {
  const kv = fakeKV({ 'explain_quota:abc:2026072213': String(EXPLAIN_HOURLY_LIMIT) });
  const q = await getExplainQuota(kv, 'abc', NOW);
  assert.equal(q.blocked, true);
  assert.equal(q.remaining, 0);
  assert.equal(q.retryAfter, 2400);
});

test('incrementExplainQuota: writes count+1 with a TTL that outlives the hour', async () => {
  const kv = fakeKV({ 'explain_quota:abc:2026072213': '4' });
  await incrementExplainQuota(kv, 'abc', NOW);
  assert.equal(kv._store.get('explain_quota:abc:2026072213'), '5');
  const put = kv._puts[kv._puts.length - 1];
  assert.ok(put.opts.expirationTtl >= 2400);
});
