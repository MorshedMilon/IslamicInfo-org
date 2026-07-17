'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const core = require('../../src/js/quran-related-hadith-core.js');

const TAX = { patience: 'Patience (Sabr)', gratitude: 'Gratitude (Shukr)' };

function goodRow(over) {
  return Object.assign({
    collection: 'Sahih al-Bukhari', number: 1469, book: 'Book of Patience',
    arabic: 'ARABIC', english: 'ENGLISH', narrator: 'Abu Sa\'id al-Khudri',
    isnadSummary: 'A -> B -> Prophet', grade: 'Sahih', gradedBy: 'Al-Bukhari',
    url: 'https://hadithapi.com/x', score: 9, reviewed: false
  }, over || {});
}

test('validateSource passes a clean source', () => {
  const src = { patience: { label: 'Patience (Sabr)', hadith: [goodRow()] } };
  const r = core.validateSource(src, TAX);
  assert.equal(r.ok, true);
  assert.deepEqual(r.errors, []);
});

test('validateSource enforces every fail-closed rule', () => {
  const src = {
    'Bad Slug': { label: 'x', hadith: [goodRow()] },
    unknownslug: { label: 'Unknown', hadith: [goodRow()] },
    patience: { label: 'WRONG LABEL', hadith: [goodRow()] },
    gratitude: { label: 'Gratitude (Shukr)', hadith: [
      goodRow({ grade: 'Da\'eef' }),
      goodRow({ number: 2, gradedBy: '' }),
      goodRow({ number: 3, isnadSummary: '  ' }),
      goodRow({ number: 4, collection: 'Random Book' }),
      goodRow({ number: 5, url: 'http://x' }),
      goodRow({ number: 6, score: 0 }),
      goodRow({ number: 7, reviewed: 'yes' }),
      goodRow({ number: 8, english: '' }),
      goodRow({ number: 1469 }), goodRow({ number: 1469 })
    ] }
  };
  const r = core.validateSource(src, TAX);
  assert.equal(r.ok, false);
  assert.ok(r.errors.some(e => /kebab/.test(e)));
  assert.ok(r.errors.some(e => /not in .*taxonomy/i.test(e)));
  assert.ok(r.errors.some(e => /label.*!=|!= taxonomy/i.test(e)));
  assert.ok(r.errors.some(e => /grade must be Sahih or Hasan/i.test(e)));
  assert.ok(r.errors.some(e => /gradedBy/i.test(e)));
  assert.ok(r.errors.some(e => /isnadSummary/i.test(e)));
  assert.ok(r.errors.some(e => /collection not in allowed/i.test(e)));
  assert.ok(r.errors.some(e => /url must be an https/i.test(e)));
  assert.ok(r.errors.some(e => /score/i.test(e)));
  assert.ok(r.errors.some(e => /reviewed must be a boolean/i.test(e)));
  assert.ok(r.errors.some(e => /missing\/blank english/i.test(e)));
  assert.ok(r.errors.some(e => /duplicate/i.test(e)));
});
