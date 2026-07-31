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

/* The card used to stamp every result "Hisn al-Muslim" as a literal, while the
   corpus draws from four translation sources. A card asserting a source the
   record contradicts is the same failure class as a hadith shown without its
   grade, so attribution now comes from the record and never from a constant. */
test('buildDuaCardHTML attributes to the record own sourceLabel', () => {
  const html = core.buildDuaCardHTML({ id:'1:1', category:'Cat<x>', arabic:'ع', transliteration:'tr', translation:'T', sourceLabel:'Hisn al-Muslim' });
  assert.ok(/Hisn al-Muslim/i.test(html));
  assert.ok(html.includes('&lt;x&gt;'));
});

test('buildDuaCardHTML never hardcodes Hisn al-Muslim onto a record from another source', () => {
  const html = core.buildDuaCardHTML({ id:'ibnmajah:3590', category:'Supplication', arabic:'ع', transliteration:'', translation:'T', sourceLabel:'Sunan Ibn Majah' });
  assert.ok(/Sunan Ibn Majah/.test(html));
  assert.ok(!/Hisn al-Muslim/i.test(html));
});

test('buildDuaCardHTML shows NO attribution rather than a guessed one', () => {
  for (const rec of [{}, { sourceLabel: null }, { sourceLabel: '' }, { sourceLabel: '   ' }]) {
    const html = core.buildDuaCardHTML(Object.assign({ id:'x', category:'C', arabic:'ع', transliteration:'', translation:'T' }, rec));
    assert.ok(!/sr-attrib/.test(html), 'no attribution element for ' + JSON.stringify(rec));
    assert.ok(!/Hisn al-Muslim/i.test(html));
  }
});

test('buildDuaCardHTML escapes the attribution', () => {
  const html = core.buildDuaCardHTML({ id:'x', category:'C', arabic:'ع', transliteration:'', translation:'T', sourceLabel:'<img src=x>' });
  assert.ok(!html.includes('<img'));
  assert.ok(html.includes('&lt;img'));
});

test('duaSourceLabel trims and rejects blank/non-string', () => {
  assert.equal(core.duaSourceLabel({ sourceLabel: '  The Qur\'an  ' }), "The Qur'an");
  assert.equal(core.duaSourceLabel({ sourceLabel: '   ' }), null);
  assert.equal(core.duaSourceLabel({ sourceLabel: 42 }), null);
  assert.equal(core.duaSourceLabel({}), null);
  assert.equal(core.duaSourceLabel(null), null);
});

test('resultsHeading is plain (no urgency), handles zero', () => {
  assert.ok(/No results for/i.test(core.resultsHeading('hadith','x',0)));
  assert.ok(/3 results for/i.test(core.resultsHeading('hadith','x',3)));
});
