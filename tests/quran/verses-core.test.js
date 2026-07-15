'use strict';
const test = require('node:test');
const assert = require('node:assert');
const core = require('../../src/js/quran-verses-core.js');

test('sanitizeTranslation strips sup footnotes and tags', () => {
  assert.equal(
    core.sanitizeTranslation('In the name of Allah,<sup foot_note=195932>1</sup> the Merciful.'),
    'In the name of Allah, the Merciful.');
  assert.equal(core.sanitizeTranslation('Plain text'), 'Plain text');
  assert.equal(core.sanitizeTranslation('<i>x</i> y'), 'x y');
});

test('wbwWords keeps words, drops end markers, maps ar/en', () => {
  const out = core.wbwWords([
    { char_type_name: 'word', text_uthmani: 'بِسْمِ', translation: { text: 'In (the) name' } },
    { char_type_name: 'end',  text_uthmani: '١',      translation: { text: '(1)' } }
  ]);
  assert.deepEqual(out, [{ ar: 'بِسْمِ', en: 'In (the) name' }]);
});

test('pickTranslation selects by resource_id, falls back to first', () => {
  const t = [{ resource_id: 85, text: 'A' }, { resource_id: 20, text: 'B' }];
  assert.equal(core.pickTranslation(t, 20), 'B');
  assert.equal(core.pickTranslation(t, 999), 'A');
  assert.equal(core.pickTranslation([], 20), '');
});

test('normalizeVerse shape', () => {
  const v = core.normalizeVerse({
    verse_key: '1:2', verse_number: 2, text_uthmani: 'ٱلْحَمْدُ',
    translations: [{ resource_id: 20, text: 'All praise<sup foot_note=1>x</sup>' }],
    words: [{ char_type_name: 'word', text_uthmani: 'ٱلْحَمْدُ', translation: { text: 'All praises' } }]
  }, 20);
  assert.equal(v.verse_key, '1:2');
  assert.equal(v.text_uthmani, 'ٱلْحَمْدُ');
  assert.equal(v.translation, 'All praise');
  assert.deepEqual(v.words, [{ ar: 'ٱلْحَمْدُ', en: 'All praises' }]);
});

test('showBismillah true except Surah 9', () => {
  assert.equal(core.showBismillah(1), true);
  assert.equal(core.showBismillah(2), true);
  assert.equal(core.showBismillah(9), false);
});

test('versesCacheKey + isFresh', () => {
  assert.equal(core.versesCacheKey(2, 20), 'ii-verses-2-20');
  const now = 1e12;
  assert.equal(core.isFresh(now - 23 * 3600e3, now), true);
  assert.equal(core.isFresh(now - 25 * 3600e3, now), false);
});

test('attributionText format', () => {
  const s = core.attributionText(
    { verseKey: '1:2', arabic: 'ٱلْحَمْدُ', translation: 'All praise' },
    'Al-Fatihah', 'Saheeh International', 'https://x/quran?surah=al-fatihah');
  assert.equal(s,
    'All praise\nٱلْحَمْدُ\n\n— Al-Fatihah 1:2 · Saheeh International\nhttps://x/quran?surah=al-fatihah');
});

test('editionName maps 20, falls back', () => {
  assert.equal(core.editionName(20), 'Saheeh International');
  assert.equal(core.editionName(99999), 'Translation');
});
