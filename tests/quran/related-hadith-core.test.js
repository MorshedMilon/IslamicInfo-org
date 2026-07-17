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

test('compileIndex emits only reviewed:true, strips flag, composes ref, sorts, counts pending', () => {
  const src = {
    patience: { label: 'Patience (Sabr)', hadith: [
      goodRow({ number: 100, score: 5, reviewed: true }),
      goodRow({ number: 200, score: 9, reviewed: true }),
      goodRow({ number: 300, score: 8, reviewed: false })
    ] },
    gratitude: { label: 'Gratitude (Shukr)', hadith: [
      goodRow({ number: 400, reviewed: false })
    ] }
  };
  const out = core.compileIndex(src, TAX);
  assert.deepEqual(Object.keys(out.topics), ['patience']);
  assert.deepEqual(out.topics.patience.hadith.map(h => h.number), [200, 100]);
  const row = out.topics.patience.hadith[0];
  assert.equal(row.ref, 'Sahih al-Bukhari 200');
  assert.equal('reviewed' in row, false);
  assert.equal(row.grade, 'Sahih');
  assert.equal(out.pendingCount, 2);
});

const HTOPICS = {
  patience: { label: 'Patience (Sabr)', hadith: [
    { collection: 'Sahih al-Bukhari', number: 1469, ref: 'Sahih al-Bukhari 1469', book: '', arabic: 'A', english: 'EN-A', narrator: 'N1', isnadSummary: 'i', grade: 'Sahih', gradedBy: 'Al-Bukhari', url: 'https://x', score: 9 },
    { collection: 'Sahih Muslim', number: 55, ref: 'Sahih Muslim 55', book: '', arabic: 'B', english: 'EN-B', narrator: 'N2', isnadSummary: 'i', grade: 'Hasan', gradedBy: 'al-Albani', url: 'https://x', score: 4 }
  ] },
  gratitude: { label: 'Gratitude (Shukr)', hadith: [
    { collection: 'Sahih al-Bukhari', number: 1469, ref: 'Sahih al-Bukhari 1469', book: '', arabic: 'A', english: 'EN-A', narrator: 'N1', isnadSummary: 'i', grade: 'Sahih', gradedBy: 'Al-Bukhari', url: 'https://x', score: 6 }
  ] }
};
const VINDEX = { '2:153': ['patience', 'gratitude'], '14:7': ['gratitude'] };

test('relatedHadith gathers across topics, dedups by collection+number (highest score), sorts, caps', () => {
  const out = core.relatedHadith('2:153', HTOPICS, VINDEX, { limit: 5 });
  assert.deepEqual(out.map(h => h.ref), ['Sahih al-Bukhari 1469', 'Sahih Muslim 55']);
  assert.equal(out[0].score, 9);
  assert.equal(out[0].topic, 'Patience (Sabr)');
  assert.equal(core.relatedHadith('2:153', HTOPICS, VINDEX, { limit: 1 }).length, 1);
});

test('relatedHadith returns [] for an untagged verse', () => {
  assert.deepEqual(core.relatedHadith('9:1', HTOPICS, VINDEX), []);
});
