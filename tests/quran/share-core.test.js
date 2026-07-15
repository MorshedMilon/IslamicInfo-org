'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const core = require('../../src/js/quran-share-core.js');

test('dims square/story', () => {
  assert.deepEqual(core.dims('square'), { w:1080, h:1080 });
  assert.deepEqual(core.dims('story'), { w:1080, h:1920 });
  assert.deepEqual(core.dims(), { w:1080, h:1080 });
});
test('slugFilename maps : to - and slugifies name', () => {
  assert.equal(core.slugFilename('Al-Fatihah', '1:1'), 'islamicinfo-al-fatihah-1-1.png');
  assert.equal(core.slugFilename("Ali 'Imran", '3:7'), 'islamicinfo-ali-imran-3-7.png');
});
test('stripQuotes trims straight and curly quotes', () => {
  assert.equal(core.stripQuotes('"hello"'), 'hello');
  assert.equal(core.stripQuotes('“hi”'), 'hi');
  assert.equal(core.stripQuotes('  plain  '), 'plain');
});
test('editionFromAttr takes text before middle dot', () => {
  assert.equal(core.editionFromAttr('Saheeh International · Al-Fatihah 1:1'), 'Saheeh International');
  assert.equal(core.editionFromAttr('Dr. Mustafa Khattab · X'), 'Dr. Mustafa Khattab');
  assert.equal(core.editionFromAttr('no dot'), 'no dot');
  assert.equal(core.editionFromAttr(''), '');
});
test('wrapText greedily wraps with an injected measurer', () => {
  const measure = (s) => s.length * 10; // 10px/char
  assert.deepEqual(core.wrapText('a b c', 100, measure), ['a b c']);
  assert.deepEqual(core.wrapText('aa bb cc dd', 50, measure), ['aa bb', 'cc dd']);
  assert.deepEqual(core.wrapText('supercalifragilistic short', 50, measure), ['supercalifragilistic', 'short']);
  assert.deepEqual(core.wrapText('   ', 100, measure), ['']);
  assert.deepEqual(core.wrapText('', 100, measure), ['']);
});
