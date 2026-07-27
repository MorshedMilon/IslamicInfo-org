'use strict';
const test = require('node:test');
const assert = require('node:assert');
const core = require('../../src/js/quran-tajweed-core.js');

test('mapClass folds API tajweed classes into 5 families', () => {
  assert.equal(core.mapClass('madda_normal'), 'tj-madd');
  assert.equal(core.mapClass('madda_obligatory'), 'tj-madd');
  assert.equal(core.mapClass('ghunnah'), 'tj-ghunna');
  assert.equal(core.mapClass('ikhafa'), 'tj-ikhfa');
  assert.equal(core.mapClass('ikhafa_shafawi'), 'tj-ikhfa');
  assert.equal(core.mapClass('idgham_wo_ghunnah'), 'tj-idgham');
  assert.equal(core.mapClass('iqlab'), 'tj-idgham');
  assert.equal(core.mapClass('qalqalah'), 'tj-qalqalah');
  assert.equal(core.mapClass('ham_wasl'), '');   // neutral
  assert.equal(core.mapClass('unknown_x'), '');
});

test('colorize replaces <tajweed class> spans with mapped classes, strips unknowns', () => {
  const html = '<tajweed class=madda_normal>ءَا</tajweed>ب<tajweed class="ham_wasl">ٱ</tajweed>';
  const out = core.colorize(html);
  assert.ok(out.indexOf('class="tj-madd"') !== -1);
  assert.ok(out.indexOf('tajweed') === -1);        // no raw <tajweed> tags
  assert.ok(out.indexOf('ham_wasl') === -1);       // neutral: span unwrapped to plain text
  assert.ok(out.indexOf('ب') !== -1);
});

test('colorize handles single-quoted and bare class attrs', () => {
  assert.ok(core.colorize("<tajweed class='qalqalah'>ق</tajweed>").indexOf('tj-qalqalah') !== -1);
  assert.ok(core.colorize('<tajweed class=ghunnah>ن</tajweed>').indexOf('tj-ghunna') !== -1);
});

test('colorize handles per-word <rule class=X> markup (word_fields=text_uthmani_tajweed)', () => {
  // Word-level tajweed uses <rule ...> instead of <tajweed ...>; both must map + close correctly.
  const out = core.colorize('<rule class=ham_wasl>ٱ</rule><rule class=laam_shamsiyah>ل</rule>رَّحۡمَ<rule class=madda_normal>ـٰ</rule>نِ');
  assert.ok(out.indexOf('class="tj-madd"') !== -1);   // madda_normal -> tj-madd
  assert.ok(out.indexOf('<rule') === -1);             // no raw <rule> tags left
  assert.ok(out.indexOf('ham_wasl') === -1);          // neutral rule unwrapped
  assert.ok(out.indexOf('ـٰ') !== -1);                 // glyph preserved
});
