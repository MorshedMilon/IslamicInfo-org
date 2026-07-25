import { test } from 'node:test';
import assert from 'node:assert';
import { normalizeArabic, normalizeLatin, isArabic, tokenize, searchCorpus } from '../src/lib/quran-search-core.js';

const VERSES = [
  { verseKey:'1:1', surah:1, ayah:1, surahName:'Al-Fatihah', arabic:'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', translation:'In the name of Allah, the Entirely Merciful, the Especially Merciful.' },
  { verseKey:'2:255', surah:2, ayah:255, surahName:'Al-Baqarah', arabic:'ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ', translation:'Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence.' },
  { verseKey:'2:153', surah:2, ayah:153, surahName:'Al-Baqarah', arabic:'يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ ٱسْتَعِينُوا۟ بِٱلصَّبْرِ وَٱلصَّلَوٰةِ', translation:'O you who have believed, seek help through patience and prayer.' },
];

test('normalizeArabic strips diacritics and folds alef/ta-marbuta', () => {
  assert.strictEqual(normalizeArabic('ٱلرَّحْمَٰنِ'), normalizeArabic('الرحمن'));
  assert.strictEqual(/[ً-ْ]/.test(normalizeArabic('ٱلرَّحْمَٰنِ')), false);
});
test('isArabic detects script', () => {
  assert.strictEqual(isArabic('الرحمن'), true);
  assert.strictEqual(isArabic('mercy'), false);
});
test('tokenize splits normalized query', () => {
  assert.deepStrictEqual(tokenize('  Patience,  Prayer '), ['patience', 'prayer']);
});
test('Arabic query matches diacritic-insensitively', () => {
  const r = searchCorpus(VERSES, 'الرحمن', {});
  assert.strictEqual(r.total, 1);
  assert.strictEqual(r.results[0].verseKey, '1:1');
});
test('English query is case-insensitive and token-AND', () => {
  const r = searchCorpus(VERSES, 'Patience Prayer', {});
  assert.strictEqual(r.total, 1);
  assert.strictEqual(r.results[0].verseKey, '2:153');
});
test('non-match returns empty', () => {
  assert.strictEqual(searchCorpus(VERSES, 'zebra', {}).total, 0);
});
test('pagination slices and reports totals', () => {
  const r = searchCorpus(VERSES, 'merciful', { page:1, limit:1 });
  assert.strictEqual(r.total, 1);
  assert.strictEqual(r.totalPages, 1);
  assert.strictEqual(r.results.length, 1);
  const beyond = searchCorpus(VERSES, 'Allah', { page:9, limit:1 });
  assert.strictEqual(beyond.results.length, 0);
  assert.ok(beyond.total >= 1);
});
