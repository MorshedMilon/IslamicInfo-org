import { test } from 'node:test';
import assert from 'node:assert';
import core from '../../src/js/home-search-core.js';

test('dispatchTarget: hadith navigates to hadith.html?q=', () => {
  assert.deepEqual(core.dispatchTarget('hadith', ' patience '),
    { kind: 'navigate', url: 'hadith.html?q=patience' });
});

test('dispatchTarget: verify navigates to verify.html?claim=', () => {
  assert.deepEqual(core.dispatchTarget('verify', 'the prophet said X'),
    { kind: 'navigate', url: 'verify.html?claim=the%20prophet%20said%20X' });
});

test('dispatchTarget: coming-soon modes return an honest note (no navigation)', () => {
  ['quran', 'dua', 'all'].forEach(function (m) {
    var r = core.dispatchTarget(m, 'zakat');
    assert.equal(r.kind, 'note');
    assert.match(r.message, /coming soon/i);
  });
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
