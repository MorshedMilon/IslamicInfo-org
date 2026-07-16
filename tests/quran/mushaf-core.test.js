'use strict';
const test = require('node:test');
const assert = require('node:assert');
const core = require('../../src/js/quran-mushaf-core.js');

const chapters = { data: [
  { id: 1, pages: [1, 1], bismillah_pre: false },
  { id: 2, pages: [2, 49], bismillah_pre: true }
]};

test('pageOfSurah returns first page from chapters', () => {
  assert.equal(core.pageOfSurah(1, chapters), 1);
  assert.equal(core.pageOfSurah(2, chapters), 2);
  assert.equal(core.pageOfSurah(999, chapters), 1); // fallback
});

test('fontUrl builds correct CDN paths', () => {
  assert.equal(core.fontUrl(1, 'v2'),
    'https://verses.quran.foundation/fonts/quran/hafs/v2/woff2/p1.woff2');
  assert.equal(core.fontUrl(42, 'v4', 'light', false),
    'https://verses.quran.foundation/fonts/quran/hafs/v4/colrv1/woff2/p42.woff2');
  assert.equal(core.fontUrl(42, 'v4', 'dark', true),
    'https://verses.quran.foundation/fonts/quran/hafs/v4/ot-svg/dark/woff2/p42.woff2');
});

test('fontFamily naming', () => {
  assert.equal(core.fontFamily(3, 'v2'), 'p3-v2');
  assert.equal(core.fontFamily(3, 'v4'), 'p3-v4');
});

test('buildPageModel groups words by line, keeps end markers, extracts juz/hizb', () => {
  const apiJson = { verses: [
    { verse_key: '1:1', verse_number: 1, juz_number: 1, hizb_number: 1, words: [
      { char_type_name: 'word', code_v2: 'A', line_number: 2, position: 1 },
      { char_type_name: 'word', code_v2: 'B', line_number: 2, position: 2 },
      { char_type_name: 'end',  code_v2: '١', line_number: 2, position: 3 }
    ]},
    { verse_key: '1:2', verse_number: 2, juz_number: 1, hizb_number: 1, words: [
      { char_type_name: 'word', code_v2: 'C', line_number: 3, position: 1 }
    ]}
  ]};
  const m = core.buildPageModel(apiJson, chapters, 1);
  assert.equal(m.page, 1);
  assert.equal(m.juz, 1);
  assert.equal(m.hizb, 1);
  const line2 = m.lines.find(l => l.n === 2);
  assert.equal(line2.type, 'ayah');
  assert.equal(line2.words.length, 3);
  assert.equal(line2.words[2].type, 'end');
  assert.equal(line2.words[0].code, 'A');
});

test('buildPageModel derives a surah_name header (+basmala) above a surah start', () => {
  const apiJson = { verses: [
    { verse_key: '2:1', verse_number: 1, juz_number: 1, hizb_number: 1, words: [
      { char_type_name: 'word', code_v2: 'X', line_number: 4, position: 1 }
    ]}
  ]};
  const m = core.buildPageModel(apiJson, chapters, 2);
  const types = m.lines.map(l => l.type);
  assert.ok(types.includes('surah_name'));
  assert.ok(types.includes('basmallah')); // surah 2 has bismillah_pre
  const header = m.lines.find(l => l.type === 'surah_name');
  assert.equal(header.surah, 2);
  assert.equal(header.centered, true);
});

test('buildPageModel: surah 9 (no bismillah) gets header but NO basmala', () => {
  const ch = { data: [{ id: 9, pages: [187, 207], bismillah_pre: false }] };
  const apiJson = { verses: [
    { verse_key: '9:1', verse_number: 1, juz_number: 10, hizb_number: 19, words: [
      { char_type_name: 'word', code_v2: 'Y', line_number: 3, position: 1 }
    ]}
  ]};
  const m = core.buildPageModel(apiJson, ch, 187);
  assert.ok(m.lines.some(l => l.type === 'surah_name'));
  assert.ok(!m.lines.some(l => l.type === 'basmallah'));
});
