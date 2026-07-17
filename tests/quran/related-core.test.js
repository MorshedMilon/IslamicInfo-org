'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const core = require('../../src/js/quran-related-core.js');

// verses_count for a few surahs, mirroring src/data/chapters.json
const AYAH_COUNTS = { 1: 7, 2: 286, 114: 6 };

test('isValidVerseKey accepts real keys, rejects malformed/out-of-range', () => {
  assert.equal(core.isValidVerseKey('2:153', AYAH_COUNTS), true);
  assert.equal(core.isValidVerseKey('1:7', AYAH_COUNTS), true);
  assert.equal(core.isValidVerseKey('114:6', AYAH_COUNTS), true);
  assert.equal(core.isValidVerseKey('2:287', AYAH_COUNTS), false);
  assert.equal(core.isValidVerseKey('115:1', AYAH_COUNTS), false);
  assert.equal(core.isValidVerseKey('2:0', AYAH_COUNTS), false);
  assert.equal(core.isValidVerseKey('2-153', AYAH_COUNTS), false);
  assert.equal(core.isValidVerseKey('', AYAH_COUNTS), false);
  assert.equal(core.isValidVerseKey(153, AYAH_COUNTS), false);
});

test('validateSource passes a clean source', () => {
  const src = {
    patience: { label: 'Patience (Sabr)', verses: [
      { key: '2:153', score: 9, sourceCitation: 'Index X, p.12' },
      { key: '1:5', score: 5, sourceCitation: 'Index X, p.12' }
    ] }
  };
  const r = core.validateSource(src, AYAH_COUNTS);
  assert.equal(r.ok, true);
  assert.deepEqual(r.errors, []);
});

test('validateSource rejects a non-object source (array / null / primitive)', () => {
  assert.equal(core.validateSource([], AYAH_COUNTS).ok, false);
  assert.equal(core.validateSource(null, AYAH_COUNTS).ok, false);
  assert.equal(core.validateSource('x', AYAH_COUNTS).ok, false);
  assert.ok(core.validateSource([], AYAH_COUNTS).errors.some(e => /object/i.test(e)));
});

test('validateSource rejects every violation with a message', () => {
  const src = {
    'Bad Slug': { label: 'x', verses: [{ key: '2:153', score: 5, sourceCitation: 'c' }] },
    empty: { label: 'E', verses: [] },
    noLabel: { label: '  ', verses: [{ key: '1:1', score: 5, sourceCitation: 'c' }] },
    scores: { label: 'S', verses: [{ key: '1:1', score: 0, sourceCitation: 'c' }] },
    cite: { label: 'C', verses: [{ key: '1:1', score: 5, sourceCitation: '' }] },
    badkey: { label: 'K', verses: [{ key: '9:999', score: 5, sourceCitation: 'c' }] },
    dup: { label: 'D', verses: [
      { key: '1:1', score: 5, sourceCitation: 'c' },
      { key: '1:1', score: 6, sourceCitation: 'c' }
    ] }
  };
  const r = core.validateSource(src, AYAH_COUNTS);
  assert.equal(r.ok, false);
  assert.ok(r.errors.some(e => /Bad Slug|kebab/.test(e)));
  assert.ok(r.errors.some(e => /empty.*non-empty|verses/i.test(e)));
  assert.ok(r.errors.some(e => /noLabel.*label/i.test(e)));
  assert.ok(r.errors.some(e => /score/i.test(e)));
  assert.ok(r.errors.some(e => /sourceCitation/i.test(e)));
  assert.ok(r.errors.some(e => /invalid verse key/i.test(e)));
  assert.ok(r.errors.some(e => /duplicate/i.test(e)));
});

test('compileIndex sorts by score desc, bakes translation + ref, builds reverse map', () => {
  const src = {
    patience: { label: 'Patience (Sabr)', verses: [
      { key: '1:5', score: 5, sourceCitation: 'c1' },
      { key: '2:153', score: 9, sourceCitation: 'c2' }
    ] },
    prayer: { label: 'Prayer (Salah)', verses: [
      { key: '2:153', score: 7, sourceCitation: 'c3' }
    ] }
  };
  const translations = {
    '1:5': { translation: 'It is You we worship…', translator: 'Saheeh International' },
    '2:153': { translation: 'seek help through patience…', translator: 'Saheeh International' }
  };
  const surahNames = { 1: 'Al-Fatihah', 2: 'Al-Baqarah' };
  const out = core.compileIndex(src, translations, surahNames);
  assert.deepEqual(out.topics.patience.verses.map(v => v.key), ['2:153', '1:5']);
  const row = out.topics.patience.verses[0];
  assert.equal(row.ref, 'Al-Baqarah 2:153');
  assert.equal(row.translation, 'seek help through patience…');
  assert.equal(row.translator, 'Saheeh International');
  assert.equal(row.sourceCitation, 'c2');
  assert.deepEqual(out.verseIndex['2:153'].sort(), ['patience', 'prayer']);
  assert.deepEqual(out.verseIndex['1:5'], ['patience']);
});

const TOPICS = {
  patience: { label: 'Patience (Sabr)', verses: [
    { key: '2:153', ref: 'Al-Baqarah 2:153', score: 9, translation: 'A', translator: 'Saheeh International', sourceCitation: 'c' },
    { key: '3:200', ref: 'Aal-Imran 3:200', score: 8, translation: 'B', translator: 'Saheeh International', sourceCitation: 'c' },
    { key: '1:5', ref: 'Al-Fatihah 1:5', score: 4, translation: 'C', translator: 'Saheeh International', sourceCitation: 'c' }
  ] },
  prayer: { label: 'Prayer (Salah)', verses: [
    { key: '2:153', ref: 'Al-Baqarah 2:153', score: 6, translation: 'A', translator: 'Saheeh International', sourceCitation: 'c' },
    { key: '1:5', ref: 'Al-Fatihah 1:5', score: 7, translation: 'C', translator: 'Saheeh International', sourceCitation: 'c' }
  ] }
};
const VERSE_INDEX = { '2:153': ['patience', 'prayer'], '3:200': ['patience'], '1:5': ['patience', 'prayer'] };

test('topicsForVerse returns the verse slugs, or [] when untagged', () => {
  assert.deepEqual(core.topicsForVerse('2:153', VERSE_INDEX), ['patience', 'prayer']);
  assert.deepEqual(core.topicsForVerse('9:1', VERSE_INDEX), []);
});

test('relatedVerses excludes self, dedups across topics (highest score), sorts desc', () => {
  const out = core.relatedVerses('2:153', TOPICS, VERSE_INDEX, { limit: 8 });
  assert.deepEqual(out.map(r => r.key), ['3:200', '1:5']);
  assert.equal(out.find(r => r.key === '1:5').score, 7);
});

test('relatedVerses respects limit and returns [] for untagged verse', () => {
  assert.equal(core.relatedVerses('2:153', TOPICS, VERSE_INDEX, { limit: 1 }).length, 1);
  assert.deepEqual(core.relatedVerses('9:1', TOPICS, VERSE_INDEX), []);
});
