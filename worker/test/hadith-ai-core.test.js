import { test } from 'node:test';
import assert from 'node:assert';
import core from '../../src/js/hadith-ai-core.js';

test('feature flag defaults to false (dark until human sign-off)', () => {
  assert.equal(core.HADITH_AI_EXPLAIN_ENABLED, false);
});

test('buildExplainPayload maps card fields to the /api/explain body', () => {
  const p = core.buildExplainPayload({ ref: 'sahih-bukhari:1:1', arabic: 'إنما', translation: 'Actions…', language: 'ar' });
  assert.deepEqual(p, { type: 'hadith', ref: 'sahih-bukhari:1:1', arabic: 'إنما', translation: 'Actions…', language: 'ar' });
});

test('buildExplainPayload defaults language to en and tolerates missing fields', () => {
  const p = core.buildExplainPayload({ ref: 'r' });
  assert.equal(p.language, 'en');
  assert.equal(p.arabic, '');
  assert.equal(p.translation, '');
});

test('hasText: true only when arabic or translation is non-empty', () => {
  assert.equal(core.hasText({ arabic: 'x' }), true);
  assert.equal(core.hasText({ translation: ' y ' }), true);
  assert.equal(core.hasText({ arabic: '  ', translation: '' }), false);
  assert.equal(core.hasText(null), false);
});
