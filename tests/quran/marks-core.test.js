'use strict';
const test = require('node:test');
const assert = require('node:assert');
const core = require('../../src/js/quran-marks-core.js');

test('isBookmarked', () => {
  assert.equal(core.isBookmarked([{verseKey:'1:1'}], '1:1'), true);
  assert.equal(core.isBookmarked([{verseKey:'1:1'}], '1:2'), false);
  assert.equal(core.isBookmarked(null, '1:1'), false);
});

test('toggleBookmark adds then removes, immutably', () => {
  const a = [];
  const b = core.toggleBookmark(a, {verseKey:'1:1',category:'General'});
  assert.equal(b.length, 1);
  assert.equal(a.length, 0);
  const c = core.toggleBookmark(b, {verseKey:'1:1'});
  assert.equal(c.length, 0);
});

test('filterByCategory', () => {
  const bms = [{verseKey:'1:1',category:'General'},{verseKey:'1:2',category:'Memorization'}];
  assert.equal(core.filterByCategory(bms, 'All').length, 2);
  assert.equal(core.filterByCategory(bms, 'Memorization').length, 1);
  assert.equal(core.filterByCategory(bms, 'Memorization')[0].verseKey, '1:2');
});

test('upsertNote replaces or appends', () => {
  let notes = core.upsertNote([], {verseKey:'1:1', text:'a', updatedAt:1});
  assert.equal(notes.length, 1);
  notes = core.upsertNote(notes, {verseKey:'1:1', text:'b', updatedAt:2});
  assert.equal(notes.length, 1);
  assert.equal(notes[0].text, 'b');
  notes = core.upsertNote(notes, {verseKey:'1:2', text:'c', updatedAt:3});
  assert.equal(notes.length, 2);
});

test('removeNote + findNote', () => {
  const notes = [{verseKey:'1:1',text:'a'},{verseKey:'1:2',text:'b'}];
  assert.equal(core.findNote(notes,'1:2').text, 'b');
  assert.equal(core.findNote(notes,'9:9'), null);
  assert.equal(core.removeNote(notes,'1:1').length, 1);
});

test('capText: trims + caps at 2000', () => {
  assert.equal(core.capText('  hi  '), 'hi');
  assert.equal(core.capText(null), '');
  assert.equal(core.capText('x'.repeat(2500)).length, 2000);
});
