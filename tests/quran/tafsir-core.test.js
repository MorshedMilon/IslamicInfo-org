'use strict';
const test = require('node:test');
const assert = require('node:assert');
const core = require('../../src/js/quran-tafsir-core.js');

test('sources: 3 English tafsirs with keys ik/ma/ja', () => {
  const s = core.sources();
  assert.equal(s.length, 3);
  assert.deepEqual(s.map(x => x.key), ['ik', 'ma', 'ja']);
  assert.equal(core.sourceByKey('ma').label, "Ma'arif al-Qur'an");
  assert.equal(core.sourceByKey('zzz').key, 'ik'); // fallback to first
});

test('spa5kUrl / quranUrl build correct URLs', () => {
  const ik = core.sourceByKey('ik');
  assert.equal(core.spa5kUrl(ik, 2, 255),
    'https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/en-tafisr-ibn-kathir/2/255.json');
  assert.equal(core.quranUrl(ik, 2, 255), 'https://api.quran.com/api/v4/tafsirs/169/by_ayah/2:255');
  assert.equal(core.quranUrl(core.sourceByKey('ja'), 1, 1), null); // Jalalayn has no quran.com id
});

test('formatTafsir plain text → paragraphs', () => {
  const out = core.formatTafsir('First para.\n\nSecond para.\nStill second.', false);
  assert.deepEqual(out, ['First para.', 'Second para.', 'Still second.']);
});

test('formatTafsir HTML → paragraphs, tags stripped, entities decoded', () => {
  const html = '<h1>Intro</h1><p>Bismillah &amp; mercy</p><p>Second</p><script>alert(1)</script>';
  const out = core.formatTafsir(html, true);
  assert.ok(out.includes('Intro'));
  assert.ok(out.includes('Bismillah & mercy'));
  assert.ok(out.includes('Second'));
  assert.ok(!out.join(' ').includes('alert'));       // script dropped
  assert.ok(!out.join(' ').includes('<'));           // no tags survive
});

test('decodeEntities handles numeric + named', () => {
  assert.equal(core.decodeEntities('a &amp; b &#39;c&#39; &lt;x&gt;'), "a & b 'c' <x>");
});
