import { test } from 'node:test';
import assert from 'node:assert';
import { corsHeaders, json, err, ALLOWED_ORIGINS } from '../src/lib/cors.js';

test('corsHeaders echoes an allowed origin', () => {
  const h = corsHeaders('https://islamicinfo.org');
  assert.equal(h['Access-Control-Allow-Origin'], 'https://islamicinfo.org');
});

test('corsHeaders falls back to first allowed origin for a bad origin', () => {
  const h = corsHeaders('https://evil.example');
  assert.equal(h['Access-Control-Allow-Origin'], ALLOWED_ORIGINS[0]);
});

test('json builds a JSON Response with status and CORS', async () => {
  const res = json({ ok: true }, 'https://islamicinfo.org', { status: 201 });
  assert.equal(res.status, 201);
  assert.equal(res.headers.get('Content-Type'), 'application/json; charset=utf-8');
  assert.deepEqual(await res.json(), { ok: true });
});

test('err builds an error JSON Response with the given status', async () => {
  const res = err('nope', 'https://islamicinfo.org', 400);
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { error: 'nope' });
});
