'use strict';
const test = require('node:test');
const assert = require('node:assert');
const core = require('../../src/js/reflection-core.js');

test('dayIndex is deterministic within a UTC day and bounded', () => {
  const midday = 1_752_600_000_000; // arbitrary fixed ms
  const i = core.dayIndex(midday, 10);
  assert.ok(i >= 0 && i < 10);
  // same day (add 6h) → same index
  assert.equal(core.dayIndex(midday + 6 * 3600e3, 10), i);
  // next day → advances by 1 (mod len)
  assert.equal(core.dayIndex(midday + 24 * 3600e3, 10), (i + 1) % 10);
  assert.equal(core.dayIndex(midday, 0), 0); // guard
});

test('verseRefForDay returns a valid ref from the curated list', () => {
  const refs = core.verseRefs();
  assert.ok(refs.length > 10);
  const r = core.verseRefForDay(1_752_600_000_000);
  assert.ok(refs.includes(r));
  assert.match(r, /^\d+:\d+$/);
});

test('pickForDay indexes hadith/dua arrays by day', () => {
  const arr = [{ x: 'a' }, { x: 'b' }, { x: 'c' }];
  const p = core.pickForDay(arr, 1_752_600_000_000);
  assert.ok(arr.includes(p));
  assert.equal(core.pickForDay([], 0), null);
});

test('slugifySurah', () => {
  assert.equal(core.slugifySurah('Al-Baqarah'), 'al-baqarah');
  assert.equal(core.slugifySurah("Ta-Ha"), 'ta-ha');
  assert.equal(core.slugifySurah("Al-A'raf"), 'al-araf');
});

test('normalizeVerse flattens alquran.cloud multi-edition response', () => {
  const j = { data: [
    { text: 'عربي', numberInSurah: 3, edition: { type: 'quran', language: 'ar' }, surah: { number: 65, englishName: 'At-Talaq' } },
    { text: 'And whoever relies upon Allah…', numberInSurah: 3, edition: { type: 'translation', language: 'en' }, surah: { number: 65, englishName: 'At-Talaq' } }
  ]};
  const v = core.normalizeVerse(j);
  assert.equal(v.arabic, 'عربي');
  assert.equal(v.english, 'And whoever relies upon Allah…');
  assert.equal(v.surahName, 'At-Talaq');
  assert.equal(v.ayah, 3);
  assert.equal(v.slug, 'at-talaq');
  assert.equal(core.normalizeVerse({ data: [] }), null);
});
