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
