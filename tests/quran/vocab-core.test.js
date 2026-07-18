'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const core = require('../../src/js/quran-vocab-core.js');

const TAX = { patience: 'Patience (Sabr)', 'fear-of-allah': 'Fear of Allah (Taqwa)' };

function goodTerm(over) {
  return Object.assign({
    arabic: 'تَقْوَىٰ', translit: 'Taqwā', shortDef: 'God-consciousness.',
    longDef: 'A fuller definition compiled from cited sources.',
    source: "Lane's Lexicon", topics: ['fear-of-allah']
  }, over || {});
}

test('validateSource passes a clean source', () => {
  const src = { taqwa: goodTerm() };
  const r = core.validateSource(src, TAX);
  assert.equal(r.ok, true);
  assert.deepEqual(r.errors, []);
});

test('validateSource enforces every fail-closed rule', () => {
  const src = {
    'Bad Slug': goodTerm(),
    blankdef: goodTerm({ shortDef: '  ' }),
    nosrc: goodTerm({ source: '' }),
    noar: goodTerm({ arabic: '' }),
    notopics: goodTerm({ topics: [] }),
    badtopic: goodTerm({ topics: ['nonexistent-topic'] })
  };
  const r = core.validateSource(src, TAX);
  assert.equal(r.ok, false);
  assert.ok(r.errors.some(e => /Bad Slug|kebab/.test(e)));
  assert.ok(r.errors.some(e => /blankdef.*shortDef/i.test(e)));
  assert.ok(r.errors.some(e => /nosrc.*source/i.test(e)));
  assert.ok(r.errors.some(e => /noar.*arabic/i.test(e)));
  assert.ok(r.errors.some(e => /notopics.*non-empty/i.test(e)));
  assert.ok(r.errors.some(e => /not in .*taxonomy/i.test(e)));
});

test('compileIndex emits term records + reverse topicTerms map (term under two topics appears under both)', () => {
  const src = {
    taqwa: goodTerm({ topics: ['fear-of-allah'] }),
    sabr: goodTerm({ translit: 'Sabr', topics: ['patience', 'fear-of-allah'] })
  };
  const out = core.compileIndex(src, TAX);
  assert.deepEqual(Object.keys(out.terms).sort(), ['sabr', 'taqwa']);
  assert.equal(out.terms.taqwa.translit, 'Taqwā');
  assert.deepEqual(out.terms.sabr.topics, ['patience', 'fear-of-allah']);
  assert.deepEqual(out.topicTerms.patience, ['sabr']);
  assert.deepEqual(out.topicTerms['fear-of-allah'].sort(), ['sabr', 'taqwa']);
});

const TERMS = {
  taqwa: { arabic: 'تقوى', translit: 'Taqwā', shortDef: 'God-consciousness.', longDef: 'L', source: 'S', topics: ['fear-of-allah'] },
  sabr:  { arabic: 'صبر', translit: 'Sabr', shortDef: 'Patient perseverance.', longDef: 'L', source: 'S', topics: ['patience', 'fear-of-allah'] }
};
const TOPICTERMS = { 'fear-of-allah': ['taqwa', 'sabr'], patience: ['sabr'] };
const VINDEX = { '2:153': ['patience', 'fear-of-allah'], '14:7': ['gratitude'] };

test('keyTermsForVerse returns the verse topics\' terms, dedups, sorts by translit', () => {
  const out = core.keyTermsForVerse('2:153', TOPICTERMS, VINDEX, TERMS);
  assert.deepEqual(out.map(t => t.slug), ['sabr', 'taqwa']);
  assert.equal(out[0].shortDef, 'Patient perseverance.');
  assert.deepEqual(core.keyTermsForVerse('9:1', TOPICTERMS, VINDEX, TERMS), []);
});

const RV_TOPICS = {
  patience: { label: 'Patience (Sabr)', verses: [
    { key: '2:153', ref: 'Al-Baqarah 2:153', score: 9, translation: 'A', translator: 'Saheeh International', sourceCitation: 'c' },
    { key: '3:200', ref: 'Aal-Imran 3:200', score: 8, translation: 'B', translator: 'Saheeh International', sourceCitation: 'c' }
  ] },
  'fear-of-allah': { label: 'Fear of Allah (Taqwa)', verses: [
    { key: '2:153', ref: 'Al-Baqarah 2:153', score: 5, translation: 'A', translator: 'Saheeh International', sourceCitation: 'c' }
  ] }
};
const RH_TOPICS = {
  patience: { label: 'Patience (Sabr)', hadith: [
    { collection: 'Sahih al-Bukhari', number: 1469, ref: 'Sahih al-Bukhari 1469', grade: 'Sahih', gradedBy: 'Al-Bukhari', english: 'E', arabic: 'A', narrator: 'N', isnadSummary: 'i', url: 'https://x', score: 9 }
  ] }
};

test('termCrossRefs gathers a term\'s topics\' verses+hadith, dedups, caps', () => {
  const out = core.termCrossRefs('sabr', TERMS, RV_TOPICS, RH_TOPICS, { vLimit: 3, hLimit: 2 });
  assert.deepEqual(out.verses.map(v => v.key), ['2:153', '3:200']);
  assert.equal(out.verses[0].score, 9);
  assert.deepEqual(out.hadith.map(h => h.ref), ['Sahih al-Bukhari 1469']);
  assert.equal(core.termCrossRefs('unknown', TERMS, RV_TOPICS, RH_TOPICS).verses.length, 0);
});
