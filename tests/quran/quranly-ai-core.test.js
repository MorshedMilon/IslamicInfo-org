'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const core = require('../../src/js/quranly-ai-core.js');

function fakeStorage(init) {
  const m = Object.assign({}, init);
  return { getItem: (k) => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); }, _m: m };
}

test('getOrCreateAnonId creates once and is stable on reread', () => {
  const s = fakeStorage();
  const a = core.getOrCreateAnonId(s);
  const b = core.getOrCreateAnonId(s);
  assert.equal(a, b);
  assert.equal(s._m['ii-anon-id'], a);
  assert.ok(a.length >= 8);
});

test('chipsFor returns the right chips per context type', () => {
  assert.deepEqual(core.chipsFor('quran').map((c) => c.action),
    ['explain', 'simple', 'key_lessons', 'related_verses', 'related_hadith']);
  assert.deepEqual(core.chipsFor('hadith').map((c) => c.action), ['explain', 'related_verses']);
  assert.deepEqual(core.chipsFor('dua').map((c) => c.action), ['explain']);
  assert.deepEqual(core.chipsFor('article').map((c) => c.action), ['summarize_tafsir']);
  assert.deepEqual(core.chipsFor('search').map((c) => c.action), ['custom']);
  assert.deepEqual(core.chipsFor(undefined).map((c) => c.action), ['explain', 'custom']);
});

test('buildAskPayload shapes the request body and omits customQuestion unless custom', () => {
  const ctx = { type: 'quran', surah: 2, ayah: 255, rawText: 'V' };
  const p = core.buildAskPayload(ctx, 'explain', '', 'fp-1');
  assert.deepEqual(p, { context: ctx, action: 'explain', userIdOrFingerprint: 'fp-1' });
  const p2 = core.buildAskPayload(ctx, 'custom', 'What is taqwa?', 'fp-1');
  assert.equal(p2.customQuestion, 'What is taqwa?');
});

test('quotaText formats remaining of max', () => {
  assert.equal(core.quotaText(2, 3), '2 of 3 questions remaining today');
  assert.equal(core.quotaText(null, 3), '3 of 3 questions remaining today');
});

test('containsVerdictLanguage matches parity with the AI backstop', () => {
  assert.equal(core.containsVerdictLanguage('This is haram.'), true);
  assert.equal(core.containsVerdictLanguage('This verse teaches patience.'), false);
  assert.match(core.SCHOLAR_REDIRECT, /qualified scholar/i);
});

test('fabBottomOffset clears the audio player bar when present', () => {
  assert.equal(core.fabBottomOffset(null, 800, 24, 12), 24);
  assert.equal(core.fabBottomOffset({ top: 740 }, 800, 24, 12), 72);
  assert.equal(core.fabBottomOffset({ top: 100 }, 800, 24, 12), 24 > 712 ? 24 : 712);
});
