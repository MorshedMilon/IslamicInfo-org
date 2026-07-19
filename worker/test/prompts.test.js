import { test } from 'node:test';
import assert from 'node:assert';
import { QURANLYAI_SYSTEM_PROMPT, buildUserPrompt, maxTokensFor, chooseModel, GEMINI_FLASH } from '../src/lib/prompts.js';

test('system prompt bans rulings and mandates sources', () => {
  assert.match(QURANLYAI_SYSTEM_PROMPT, /do not issue fatwas/i);
  assert.match(QURANLYAI_SYSTEM_PROMPT, /Sources/);
  assert.match(QURANLYAI_SYSTEM_PROMPT, /Confidence/);
  // The grounding override must stay first-class — it enforces the no-hallucination charter.
  assert.match(QURANLYAI_SYSTEM_PROMPT, /SOURCE GROUNDING — HARD OVERRIDE/);
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

test('chooseModel returns gemini-2.5-flash for all actions', () => {
  assert.equal(GEMINI_FLASH, 'gemini-flash-latest');
  assert.equal(chooseModel('simple', false), GEMINI_FLASH);
  assert.equal(chooseModel('vocabulary', false), GEMINI_FLASH);
  assert.equal(chooseModel('custom', false), GEMINI_FLASH);
  assert.equal(chooseModel('explain', true), GEMINI_FLASH);
});

test('summarize builds a context-aware task line per type', () => {
  const h = buildUserPrompt('summarize', { rawText: 'X', type: 'hadith' }, '', null);
  assert.match(h, /Summarize the provided hadith in at most 5 bullet points/i);
  const d = buildUserPrompt('summarize', { rawText: 'X', type: 'dua' }, '', null);
  assert.match(d, /Summarize the provided dua/i);
  const a = buildUserPrompt('summarize', { rawText: 'X', type: 'article' }, '', null);
  assert.match(a, /Summarize the provided passage/i);
  const q = buildUserPrompt('summarize', { rawText: 'X', type: 'quran' }, '', null);
  assert.match(q, /Summarize the provided ayah/i);
});

test('summarize is capped at 400 output tokens', () => {
  assert.ok(maxTokensFor('summarize') <= 400);
});
