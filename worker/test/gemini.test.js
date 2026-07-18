import { test } from 'node:test';
import assert from 'node:assert';
import { buildGeminiBody, parseGeminiResponse, callGemini } from '../src/lib/gemini.js';

test('buildGeminiBody nests system + user content and sets config', () => {
  const b = buildGeminiBody({ system: 'SYS', userContent: 'HI', maxTokens: 300 });
  assert.equal(b.system_instruction.parts[0].text, 'SYS');
  assert.equal(b.contents[0].role, 'user');
  assert.equal(b.contents[0].parts[0].text, 'HI');
  assert.equal(b.generationConfig.maxOutputTokens, 300);
  assert.equal(b.safetySettings.length, 4);
  assert.ok(b.safetySettings.every((s) => s.threshold === 'BLOCK_NONE'));
});

test('parseGeminiResponse extracts and joins candidate text parts', () => {
  const data = { candidates: [{ content: { parts: [{ text: 'Hello ' }, { text: 'world' }] }, finishReason: 'STOP' }] };
  assert.deepEqual(parseGeminiResponse(data), { text: 'Hello world', refusal: false });
});

test('parseGeminiResponse marks a blocked prompt (no candidates) as refusal', () => {
  assert.deepEqual(parseGeminiResponse({ promptFeedback: { blockReason: 'SAFETY' } }), { text: '', refusal: true });
});

test('parseGeminiResponse marks a SAFETY finishReason as refusal', () => {
  const data = { candidates: [{ content: { parts: [{ text: 'x' }] }, finishReason: 'SAFETY' }] };
  assert.deepEqual(parseGeminiResponse(data), { text: '', refusal: true });
});

test('parseGeminiResponse keeps truncated MAX_TOKENS text (not a refusal)', () => {
  const data = { candidates: [{ content: { parts: [{ text: 'partial' }] }, finishReason: 'MAX_TOKENS' }] };
  assert.deepEqual(parseGeminiResponse(data), { text: 'partial', refusal: false });
});

test('parseGeminiResponse treats empty/garbage as refusal', () => {
  assert.deepEqual(parseGeminiResponse({}), { text: '', refusal: true });
  assert.deepEqual(parseGeminiResponse({ candidates: [{ content: { parts: [] }, finishReason: 'STOP' }] }), { text: '', refusal: true });
});

test('callGemini wires fetch -> parse against a Gemini-shaped response (stubbed fetch)', async () => {
  const realFetch = globalThis.fetch;
  let capturedUrl = '', capturedHeaders = null;
  globalThis.fetch = async (url, opts) => {
    capturedUrl = url; capturedHeaders = opts.headers;
    return { ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: 'grounded answer' }] }, finishReason: 'STOP' }] }) };
  };
  try {
    const r = await callGemini({ GEMINI_API_KEY: 'k' }, { model: 'gemini-2.5-flash', system: 'S', userContent: 'U', maxTokens: 100 });
    assert.deepEqual(r, { text: 'grounded answer', refusal: false });
    assert.match(capturedUrl, /\/models\/gemini-2\.5-flash:generateContent$/);
    assert.equal(capturedHeaders['x-goog-api-key'], 'k');
  } finally {
    globalThis.fetch = realFetch;
  }
});

test('callGemini throws on a non-2xx status (orchestrator maps to 502)', async () => {
  const realFetch = globalThis.fetch;
  globalThis.fetch = async () => ({ ok: false, status: 429 });
  try {
    await assert.rejects(
      () => callGemini({ GEMINI_API_KEY: 'k' }, { model: 'm', system: 'S', userContent: 'U', maxTokens: 10 }),
      /gemini HTTP 429/
    );
  } finally {
    globalThis.fetch = realFetch;
  }
});
