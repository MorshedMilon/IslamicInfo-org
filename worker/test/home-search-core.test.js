import { test } from 'node:test';
import assert from 'node:assert';
import core from '../../src/js/home-search-core.js';

test('dispatchTarget: hadith navigates to the dedicated results page', () => {
  assert.deepEqual(core.dispatchTarget('hadith', ' patience '),
    { kind: 'navigate', url: 'search-results.html?scope=hadith&q=patience' });
});

test('dispatchTarget: quran navigates to the dedicated results page', () => {
  assert.deepEqual(core.dispatchTarget('quran', 'mercy'),
    { kind: 'navigate', url: 'search-results.html?scope=quran&q=mercy' });
});

test('dispatchTarget: all navigates to the dedicated results page', () => {
  assert.deepEqual(core.dispatchTarget('all', 'zakat'),
    { kind: 'navigate', url: 'search-results.html?scope=all&q=zakat' });
});

test('dispatchTarget: dua is public (DUA_SEARCH_PUBLIC=true) and navigates to the results page', () => {
  assert.deepEqual(core.dispatchTarget('dua', 'sleep'),
    { kind: 'navigate', url: 'search-results.html?scope=dua&q=sleep' });
});

test('dispatchTarget: verify keyword navigates to hadith results page', () => {
  assert.deepEqual(core.dispatchTarget('verify', 'ablution'),
    { kind: 'navigate', url: 'search-results.html?scope=hadith&q=ablution' });
});

test('dispatchTarget: verify claim routes to the QuranlyAI panel', () => {
  assert.deepEqual(core.dispatchTarget('verify', 'The Prophet said charity purifies wealth'),
    { kind: 'panel', query: 'The Prophet said charity purifies wealth' });
});

test('dispatchTarget: empty query is a noop for any mode', () => {
  assert.deepEqual(core.dispatchTarget('hadith', '   '), { kind: 'noop' });
  assert.deepEqual(core.dispatchTarget('verify', ''), { kind: 'noop' });
});

test('placeholderFor: verify differs from search modes', () => {
  assert.match(core.placeholderFor('verify'), /claim/i);
  assert.match(core.placeholderFor('hadith'), /search/i);
});

test('pickContinue: picks the record with the greater timestamp', () => {
  var h = { collectionSlug: 'sunan-nasai', collectionName: "Sunan an-Nasa'i", bookNum: 1, hadithNum: 3234, ts: 200 };
  var q = { surah: 2, ts: 100 };
  var r = core.pickContinue(h, q);
  assert.equal(r.kind, 'hadith');
  assert.equal(r.url, '/hadith/sunan-nasai/1/3234');
  assert.match(r.label, /Sunan an-Nasa'i.*3234/);
});

test('pickContinue: quran wins when newer; label + url correct', () => {
  var h = { collectionSlug: 'sahih-bukhari', bookNum: 1, hadithNum: 5, ts: 100 };
  var q = { surah: 18, ts: 500 };
  var r = core.pickContinue(h, q);
  assert.equal(r.kind, 'quran');
  assert.equal(r.url, 'quran.html');
  assert.match(r.label, /Surah 18/);
});

test('pickContinue: a record missing ts sorts oldest', () => {
  var h = { collectionSlug: 'sahih-muslim', bookNum: 2, hadithNum: 9 };   // no ts
  var q = { surah: 3, ts: 1 };
  assert.equal(core.pickContinue(h, q).kind, 'quran');
});

test('pickContinue: null when neither record exists', () => {
  assert.equal(core.pickContinue(null, null), null);
});

test('pickContinue: hadith label falls back to the slug when no name stored', () => {
  var h = { collectionSlug: 'sahih-bukhari', bookNum: 1, hadithNum: 1, ts: 5 };
  assert.match(core.pickContinue(h, null).label, /Sahih Bukhari.*1/);
});

test('pickContinue: honors `timestamp` (feed-scroll writer) as a synonym for ts', () => {
  var h = { collectionSlug: 'sahih-bukhari', bookNum: 1, hadithNum: 20, timestamp: 900 };  // no collectionName, no ts
  var q = { surah: 2, ts: 100 };
  var r = core.pickContinue(h, q);
  assert.equal(r.kind, 'hadith');
  assert.equal(r.url, '/hadith/sahih-bukhari/1/20');
});
