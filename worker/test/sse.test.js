import { test } from 'node:test';
import assert from 'node:assert';
import { streamSafeText } from '../src/lib/sse.js';

async function readAll(res) {
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let out = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    out += dec.decode(value, { stream: true });
  }
  return out;
}

test('streamSafeText emits SSE headers, data events, and a done event', async () => {
  const res = streamSafeText('Hello world this is safe text.', {
    sources: ['Quran 2:255'], confidence: 'High', model: 'claude-haiku-4-5', cached: false, remaining: 2,
  }, 'https://islamicinfo.org');
  assert.equal(res.headers.get('Content-Type'), 'text/event-stream; charset=utf-8');
  assert.equal(res.headers.get('X-Cache'), 'MISS');
  const body = await readAll(res);
  assert.match(body, /^data: /m);
  assert.match(body, /event: done/);
  assert.match(body, /"confidence":"High"/);
  assert.match(body, /"remaining":2/);
  // Reassembled deltas equal the original text.
  const deltas = [...body.matchAll(/data: (\{"delta".*?\})\n/g)].map((m) => JSON.parse(m[1]).delta);
  assert.equal(deltas.join(''), 'Hello world this is safe text.');
});

test('cached flag sets X-Cache HIT', async () => {
  const res = streamSafeText('x', { sources: [], confidence: 'Medium', model: 'm', cached: true, remaining: 0 }, 'https://islamicinfo.org');
  assert.equal(res.headers.get('X-Cache'), 'HIT');
});
