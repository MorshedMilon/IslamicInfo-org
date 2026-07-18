import { test } from 'node:test';
import assert from 'node:assert';
import { hashContext } from '../src/lib/hash-context.js';

const base = {
  context: { type: 'quran', surah: 2, ayah: 255, translationId: 'en-saheeh', language: 'en' },
  action: 'explain',
};

test('hashContext is deterministic', async () => {
  const a = await hashContext(base.context, base.action, '');
  const b = await hashContext(base.context, base.action, '');
  assert.equal(a, b);
  assert.match(a, /^[0-9a-f]{64}$/);
});

test('different action changes the hash', async () => {
  const a = await hashContext(base.context, 'explain', '');
  const b = await hashContext(base.context, 'simple', '');
  assert.notEqual(a, b);
});

test('different translation changes the hash', async () => {
  const a = await hashContext({ ...base.context, translationId: 'en-saheeh' }, 'explain', '');
  const b = await hashContext({ ...base.context, translationId: 'en-pickthall' }, 'explain', '');
  assert.notEqual(a, b);
});

test('free-form search folds rawText into the hash', async () => {
  const ctx1 = { type: 'search', language: 'en', rawText: 'mercy' };
  const ctx2 = { type: 'search', language: 'en', rawText: 'patience' };
  assert.notEqual(await hashContext(ctx1, 'custom', 'q'), await hashContext(ctx2, 'custom', 'q'));
});
