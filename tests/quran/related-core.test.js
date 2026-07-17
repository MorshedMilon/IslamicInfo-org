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
