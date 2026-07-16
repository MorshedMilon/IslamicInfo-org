'use strict';
const test = require('node:test');
const assert = require('node:assert');
const core = require('../../src/js/quran-tafsir-core.js');

test('sources: 4 English tafsirs with keys ik/ma/ja/sa', () => {
  const s = core.sources();
  assert.equal(s.length, 4);
  assert.deepEqual(s.map(x => x.key), ['ik', 'ma', 'ja', 'sa']);
  assert.equal(core.sourceByKey('ma').label, "Ma'arif al-Qur'an");
  assert.equal(core.sourceByKey('sa').label, "As-Sa'di");
  assert.equal(core.sourceByKey('sa').staticBase, 'src/data/tafsir-saadi/');
  assert.equal(core.sourceByKey('zzz').key, 'ik'); // fallback to first
});

test('findBlock: exact range, then nearest-preceding fallback', () => {
  const blocks = [{ from: 1, to: 5, text: 'A' }, { from: 8, to: 10, text: 'B' }, { from: 11, to: 12, text: 'C' }];
  assert.equal(core.findBlock(blocks, 3).text, 'A');       // exact
  assert.equal(core.findBlock(blocks, 9).text, 'B');       // exact
  assert.equal(core.findBlock(blocks, 6).text, 'A');       // gap 6-7 → nearest preceding (1-5)
  assert.equal(core.findBlock(blocks, 12).text, 'C');
  assert.equal(core.findBlock(blocks, 1).text, 'A');
  assert.equal(core.findBlock([], 3), null);
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
