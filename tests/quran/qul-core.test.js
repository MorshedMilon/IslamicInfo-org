'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const core = require('../../src/js/quran-qul-core.js');

test('id offset / detect / roundtrip', () => {
  assert.equal(core.QUL_OFFSET, 1000000);
  assert.equal(core.offsetId(406), 1000406);
  assert.equal(core.baseId(1000406), 406);
  assert.equal(core.isQulId(1000406), true);
  assert.equal(core.isQulId(7), false);
  assert.equal(core.isQulId('1000406'), true);
});
test('parseQulAyah tolerates field-name variants', () => {
  assert.deepEqual(core.parseQulAyah({ surah: 1, ayah: 2, audio_url: 'u', segments: [[1,0,5]] }),
    { surah: 1, ayah: 2, url: 'u', segments: [[1,0,5]] });
  assert.deepEqual(core.parseQulAyah({ sura_number: 3, verse_number: 4, audio: { url: 'a', segments: [[1,0,5]] } }),
    { surah: 3, ayah: 4, url: 'a', segments: [[1,0,5]] });
  assert.deepEqual(core.parseQulAyah({ chapter: 2, ayah_number: 5, url: 'z', segments: [] }),
    { surah: 2, ayah: 5, url: 'z', segments: [] });
});
test('qulSegments maps 3-tuple / 4-tuple / object; drops bad', () => {
  assert.deepEqual(core.qulSegments([[1, 0, 500], [2, 500, 900]]),
    [{ word: 1, start: 0, end: 500 }, { word: 2, start: 500, end: 900 }]);
  assert.deepEqual(core.qulSegments([[0, 2, 100, 400]]), [{ word: 2, start: 100, end: 400 }]); // 4-tuple
  assert.deepEqual(core.qulSegments([{ word: 3, start: 10, end: 20 }]), [{ word: 3, start: 10, end: 20 }]);
  assert.deepEqual(core.qulSegments('nope'), []);
});
test('toAyahAudio builds verse_key + segments; null on missing', () => {
  assert.deepEqual(core.toAyahAudio({ surah: 1, ayah: 1, audio_url: 'u', segments: [[1,0,9]] }),
    { verse_key: '1:1', url: 'u', segments: [{ word: 1, start: 0, end: 9 }] });
  assert.equal(core.toAyahAudio({ ayah: 1, audio_url: 'u' }), null);
});
test('groupBySurah groups + sorts by ayah', () => {
  const g = core.groupBySurah([
    { surah: 1, ayah: 2, audio_url: 'b', segments: [] },
    { surah: 1, ayah: 1, audio_url: 'a', segments: [] },
    { surah: 2, ayah: 1, audio_url: 'c', segments: [] },
  ]);
  assert.deepEqual(Object.keys(g).sort(), ['1', '2']);
  assert.deepEqual(g['1'].map(a => a.verse_key), ['1:1', '1:2']);
  assert.equal(g['2'][0].url, 'c');
});
