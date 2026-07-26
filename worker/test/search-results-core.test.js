import { test } from 'node:test';
import assert from 'node:assert';
import core from '../../src/js/search-results-core.js';

test('validateScope', () => {
  ['all','hadith','quran','dua','verify'].forEach(s => assert.strictEqual(core.validateScope(s), s));
  assert.strictEqual(core.validateScope('xyz'), 'all');
  assert.strictEqual(core.validateScope(''), 'all');
  assert.strictEqual(core.validateScope(null), 'all');
});

test('detectClaim: multi-word keyword queries are NOT claims', () => {
  assert.strictEqual(core.detectClaim('sahih bukhari fasting ramadan'), 'keyword');
  assert.strictEqual(core.detectClaim('prayer'), 'keyword');
  assert.strictEqual(core.detectClaim('patience and gratitude'), 'keyword');
  assert.strictEqual(core.detectClaim('صحيح البخاري الصيام'), 'keyword');       // Arabic multi-word keyword
  assert.strictEqual(core.detectClaim('احاديث الصبر والصلاة'), 'keyword');       // Arabic keyword, no punct
});

test('detectClaim: sentence-like signals ARE claims', () => {
  assert.strictEqual(core.detectClaim('The Prophet said charity purifies wealth'), 'claim'); // marker
  assert.strictEqual(core.detectClaim('Did the Prophet permit this?'), 'claim');             // punctuation
  assert.strictEqual(core.detectClaim('fasting is obligatory in ramadan'), 'claim');         // >=5 words + verb
  assert.strictEqual(core.detectClaim('It was narrated by Abu Hurayrah'), 'claim');          // marker
  assert.strictEqual(core.detectClaim('هل الصيام واجب؟'), 'claim');                           // Arabic question mark
});

test('escapeHTML', () => {
  assert.strictEqual(core.escapeHTML('<b>"x"&\'</b>'), '&lt;b&gt;&quot;x&quot;&amp;&#39;&lt;/b&gt;');
});

test('buildVerseCardHTML escapes + carries attribution', () => {
  const html = core.buildVerseCardHTML({ verseKey:'2:255', surahName:'Al-Baqarah', ayah:255, arabic:'ا<x>', translation:'T<y>' });
  assert.ok(html.includes('Al-Baqarah'));
  assert.ok(html.includes('2:255'));
  assert.ok(/Saheeh International/i.test(html));
  assert.ok(!html.includes('<x>') && html.includes('&lt;x&gt;'));  // arabic escaped
  assert.ok(!html.includes('<y>') && html.includes('&lt;y&gt;'));  // translation escaped
});

test('buildDuaCardHTML escapes + carries Hisn al-Muslim attribution', () => {
  const html = core.buildDuaCardHTML({ id:'1:1', category:'Cat<x>', arabic:'ع', transliteration:'tr', translation:'T' });
  assert.ok(/Hisn al-Muslim/i.test(html));
  assert.ok(html.includes('&lt;x&gt;'));
});

test('resultsHeading is plain (no urgency), handles zero', () => {
  assert.ok(/No results for/i.test(core.resultsHeading('hadith','x',0)));
  assert.ok(/3 results for/i.test(core.resultsHeading('hadith','x',3)));
});
