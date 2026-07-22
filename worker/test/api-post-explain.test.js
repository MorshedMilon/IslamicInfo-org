import { test } from 'node:test';
import assert from 'node:assert';
import api from '../../src/js/api.js';

test('postExplain: posts to /api/explain and returns parsed JSON', async () => {
  let seenUrl = null, seenBody = null;
  globalThis.fetch = async (url, opts) => {
    seenUrl = url; seenBody = JSON.parse(opts.body);
    return { ok: true, status: 200, async json() { return { safe: true, summary: 'ok' }; } };
  };
  const out = await api.postExplain({ type: 'hadith', ref: 'r', arabic: 'a', translation: 't', language: 'en' });
  assert.match(seenUrl, /\/api\/explain$/);
  assert.equal(seenBody.ref, 'r');
  assert.equal(out.summary, 'ok');
});

test('postExplain: 429 surfaces as { _status: 429 }', async () => {
  globalThis.fetch = async () => ({ ok: false, status: 429, async json() { return {}; } });
  const out = await api.postExplain({ ref: 'r' });
  assert.equal(out._status, 429);
});

test('postExplain: abort/timeout surfaces as { _error: "timeout" }', async () => {
  globalThis.fetch = async (url, opts) => {
    return await new Promise((_resolve, reject) => {
      opts.signal.addEventListener('abort', () => {
        const e = new Error('aborted'); e.name = 'AbortError'; reject(e);
      });
    });
  };
  const out = await api.postExplain({ ref: 'r' }, { timeoutMs: 10 });
  assert.equal(out._error, 'timeout');
});
