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
  assert.deepEqual(core.chipsFor('hadith').map((c) => c.action),
    ['explain', 'simple', 'key_lessons', 'related_verses', 'verify']);
  assert.deepEqual(core.chipsFor('dua').map((c) => c.action),
    ['explain', 'simple', 'key_lessons', 'related_verses', 'related_hadith']);
  assert.deepEqual(core.chipsFor('article').map((c) => c.action),
    ['explain', 'simple', 'key_lessons', 'related_verses', 'related_hadith']);
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

test('containsVerdictLanguage does NOT fire on the mandated "Not a fatwa" footer', () => {
  const answer = '**Answer**\nThis verse teaches patience.\n\n' +
    '**Note**: Educational explanation only. Not a fatwa. Consult a qualified scholar for religious rulings.';
  assert.equal(core.containsVerdictLanguage(answer), false);
});

test('fabBottomOffset clears the audio player bar when present', () => {
  assert.equal(core.fabBottomOffset(null, 800, 24, 12), 24);
  assert.equal(core.fabBottomOffset({ top: 740 }, 800, 24, 12), 72);
  assert.equal(core.fabBottomOffset({ top: 100 }, 800, 24, 12), 24 > 712 ? 24 : 712);
});

test('parseSSE parses a single message frame and leaves no remainder', () => {
  const r = core.parseSSE('data: {"delta":"Hi"}\n\n');
  assert.equal(r.rest, '');
  assert.deepEqual(r.events, [{ event: 'message', data: { delta: 'Hi' } }]);
});

test('parseSSE returns multiple deltas in order', () => {
  const r = core.parseSSE('data: {"delta":"A"}\n\ndata: {"delta":"B"}\n\n');
  assert.deepEqual(r.events.map((e) => e.data.delta), ['A', 'B']);
  assert.equal(r.rest, '');
});

test('parseSSE carries an unterminated frame forward as rest', () => {
  const r = core.parseSSE('data: {"delta":"A"}\n\ndata: {"del');
  assert.equal(r.events.length, 1);
  assert.equal(r.rest, 'data: {"del');
});

test('parseSSE captures the done event with JSON metadata', () => {
  const r = core.parseSSE('event: done\ndata: {"remaining":2,"confidence":"High","sources":["Quran 2:255"]}\n\n');
  assert.equal(r.events[0].event, 'done');
  assert.equal(r.events[0].data.remaining, 2);
  assert.equal(r.events[0].data.confidence, 'High');
});

test('parseSSE ignores comments and blank lines, keeps raw string on non-JSON data', () => {
  const r = core.parseSSE(': keep-alive\n\ndata: plain text\n\n');
  assert.equal(r.events[r.events.length - 1].data, 'plain text');
});

test('chip labels are content-type aware for the first button', () => {
  assert.equal(core.chipsFor('quran')[0].label, 'Explain this Ayah');
  assert.equal(core.chipsFor('hadith')[0].label, 'Explain this Hadith');
  assert.equal(core.chipsFor('article')[0].label, 'Explain this Passage');
  assert.equal(core.chipsFor('dua')[0].label, 'Explain this Dua');
});

test('routeKind classifies actions into ai/verify/save', () => {
  assert.equal(core.routeKind('verify'), 'verify');
  assert.equal(core.routeKind('save'), 'save');
  assert.equal(core.routeKind('explain'), 'ai');
  assert.equal(core.routeKind('summarize'), 'ai');
  assert.equal(core.routeKind('related_verses'), 'ai');
});

test('verifyUrl encodes selected text + ref for the verify page', () => {
  assert.equal(core.verifyUrl({ rawText: 'x y', sourceRef: 'Bukhari:1' }),
    'verify.html?mode=hadith&q=x%20y&ref=Bukhari%3A1');
  assert.equal(core.verifyUrl({ rawText: 'a' }), 'verify.html?mode=hadith&q=a');
});

test('saveSelection persists to ii-saved-selections and de-dupes', () => {
  const s = fakeStorage();
  assert.equal(core.saveSelection(s, { rawText: 'hello world', type: 'hadith', sourceRef: 'Bukhari:1', ts: 1 }).saved, true);
  assert.equal(core.saveSelection(s, { rawText: 'hello world', type: 'hadith', ts: 2 }).saved, false);
  assert.equal(JSON.parse(s._m['ii-saved-selections']).length, 1);
  assert.equal(core.saveSelection(s, { rawText: '   ', type: 'dua', ts: 3 }).saved, false);
});
