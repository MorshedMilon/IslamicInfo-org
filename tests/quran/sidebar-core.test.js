'use strict';
const test = require('node:test');
const assert = require('node:assert');
const core = require('../../src/js/quran-sidebar-core.js');

test('slugify', () => {
  assert.equal(core.slugify('Al-Fatihah'), 'al-fatihah');
  assert.equal(core.slugify('Aal-Imran'), 'aal-imran');
  assert.equal(core.slugify("Al-An'am"), 'al-anam');
  assert.equal(core.slugify('An-Nisa'), 'an-nisa');
  assert.equal(core.slugify('An-Nas'), 'an-nas');
});

test('revelationToType', () => {
  assert.equal(core.revelationToType('makkah'), 'makki');
  assert.equal(core.revelationToType('madinah'), 'madinah');
});

test('typeToChipClass / typeToLabel', () => {
  assert.equal(core.typeToChipClass('makki'), 'chip-makki');
  assert.equal(core.typeToChipClass('madinah'), 'chip-madani');
  assert.equal(core.typeToLabel('makki'), 'Makki');
  assert.equal(core.typeToLabel('madinah'), 'Madani');
});

test('normalizeChapter valid + invalid', () => {
  const c = core.normalizeChapter({ id: 2, name_simple: 'Al-Baqarah', name_arabic: 'البقرة', revelation_place: 'madinah', verses_count: 286 });
  assert.equal(c.slug, 'al-baqarah');
  assert.equal(c.verses_count, 286);
  const cp = core.normalizeChapter({ id: 2, name_simple: 'Al-Baqarah', verses_count: 286, pages: [2, 49], bismillah_pre: true });
  assert.deepEqual(cp.pages, [2, 49]);
  assert.equal(cp.bismillah_pre, true);
  assert.equal(core.normalizeChapter(null), null);
  assert.equal(core.normalizeChapter({ id: 'x' }), null);
});

test('matchesSearch: english, arabic, numeric, empty', () => {
  const c = { id: 2, name_simple: 'Al-Baqarah', name_arabic: 'البقرة' };
  assert.equal(core.matchesSearch(c, ''), true);
  assert.equal(core.matchesSearch(c, 'baq'), true);
  assert.equal(core.matchesSearch(c, 'BAQ'), true);
  assert.equal(core.matchesSearch(c, 'البقرة'), true);
  assert.equal(core.matchesSearch(c, '2'), true);
  assert.equal(core.matchesSearch(c, '3'), false);
  assert.equal(core.matchesSearch(c, 'zzz'), false);
});

test('matchesFilter', () => {
  const makki = { revelation_place: 'makkah' };
  const madani = { revelation_place: 'madinah' };
  assert.equal(core.matchesFilter(makki, 'all'), true);
  assert.equal(core.matchesFilter(makki, 'makki'), true);
  assert.equal(core.matchesFilter(makki, 'madinah'), false);
  assert.equal(core.matchesFilter(madani, 'madinah'), true);
});

test('isFresh (24h window)', () => {
  const now = 1_000_000_000_000;
  assert.equal(core.isFresh(now - 23 * 3600e3, now), true);
  assert.equal(core.isFresh(now - 25 * 3600e3, now), false);
  assert.equal(core.isFresh(undefined, now), false);
});
