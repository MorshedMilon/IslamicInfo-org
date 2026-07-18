import { test } from 'node:test';
import assert from 'node:assert';
import { QURANLYAI_SYSTEM_PROMPT, buildUserPrompt, maxTokensFor, chooseModel, HAIKU, SONNET } from '../src/lib/prompts.js';

test('system prompt bans rulings and mandates sources', () => {
  assert.match(QURANLYAI_SYSTEM_PROMPT, /never issue a fatwa/i);
  assert.match(QURANLYAI_SYSTEM_PROMPT, /Sources/);
  assert.match(QURANLYAI_SYSTEM_PROMPT, /Confidence/);
});

test('buildUserPrompt embeds rawText and the action instruction', () => {
  const p = buildUserPrompt('simple', { rawText: 'VERSE TEXT' }, '', null);
  assert.match(p, /VERSE TEXT/);
  assert.match(p, /12-year-old/i);
});

test('buildUserPrompt injects grounding when present and forbids outside sources', () => {
  const p = buildUserPrompt('related_verses', { rawText: 'V' }, '', 'Verified related verses:\n- Al-Baqarah 2:155 ...');
  assert.match(p, /Verified related verses/);
  assert.match(p, /only the sources provided/i);
});

test('custom uses the customQuestion', () => {
  const p = buildUserPrompt('custom', { rawText: 'V' }, 'What is tawakkul?', null);
  assert.match(p, /What is tawakkul\?/);
});

test('maxTokensFor caps summarize and key_lessons lower', () => {
  assert.ok(maxTokensFor('summarize_tafsir') <= 400);
  assert.ok(maxTokensFor('key_lessons') <= 400);
  assert.ok(maxTokensFor('custom') >= 600);
});

test('chooseModel routes cheap vs strong correctly', () => {
  assert.equal(chooseModel('simple', false), HAIKU);
  assert.equal(chooseModel('vocabulary', false), HAIKU);
  assert.equal(chooseModel('custom', false), SONNET);
  assert.equal(chooseModel('explain', true), SONNET);   // ruling-adjacent upgrades
  assert.equal(chooseModel('explain', false), HAIKU);
});
