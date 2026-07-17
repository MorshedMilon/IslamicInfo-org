'use strict';
const test = require('node:test');
const assert = require('node:assert');
const core = require('../../src/js/reflection-actions-core.js');

test('typeMeta returns label+emoji, falls back', () => {
  assert.equal(core.typeMeta('verse').label, 'Verse of the Day');
  assert.equal(core.typeMeta('hadith').emoji, '📜');
  assert.equal(core.typeMeta('dua').label, 'Dua of the Day');
  assert.equal(core.typeMeta('xxx').label, 'Reflection');
});

test('reflId is stable + whitespace-normalized', () => {
  assert.equal(core.reflId('verse', 'At-Talaq 65:3'), 'verse|At-Talaq 65:3');
  assert.equal(core.reflId('verse', '  At-Talaq   65:3 '), 'verse|At-Talaq 65:3'); // normalized
  assert.notEqual(core.reflId('verse', 'At-Talaq 65:3'), core.reflId('hadith', 'At-Talaq 65:3'));
});

test('isSaved / toggleSaved are immutable', () => {
  const a = { id: 'verse|X', ref: 'X' };
  const l0 = [];
  const l1 = core.toggleSaved(l0, a);
  assert.equal(core.isSaved(l1, 'verse|X'), true);
  assert.equal(l0.length, 0);                 // original untouched
  assert.equal(l1.length, 1);
  const l2 = core.toggleSaved(l1, a);         // toggling again removes
  assert.equal(core.isSaved(l2, 'verse|X'), false);
  // prepend order (newest first)
  const l3 = core.toggleSaved(l1, { id: 'hadith|Y' });
  assert.deepEqual(l3.map(x => x.id), ['hadith|Y', 'verse|X']);
});

test('findNote / upsertNote', () => {
  let notes = [];
  notes = core.upsertNote(notes, 'verse|X', 'my reflection', 100);
  assert.equal(core.findNote(notes, 'verse|X').text, 'my reflection');
  assert.equal(core.findNote(notes, 'verse|X').updatedAt, 100);
  notes = core.upsertNote(notes, 'verse|X', 'updated', 200);   // replace, not duplicate
  assert.equal(notes.length, 1);
  assert.equal(core.findNote(notes, 'verse|X').text, 'updated');
  notes = core.upsertNote(notes, 'verse|X', '   ', 300);       // empty removes
  assert.equal(core.findNote(notes, 'verse|X'), null);
  assert.equal(notes.length, 0);
});

test('shareFilename slugifies type + ref', () => {
  assert.equal(core.shareFilename('verse', 'At-Talaq 65:3'), 'islamicinfo-reflection-verse-at-talaq-65-3.png');
  assert.equal(core.shareFilename('hadith', 'Sahih al-Bukhari · 1'), 'islamicinfo-reflection-hadith-sahih-al-bukhari-1.png');
});

test('buildShareText: label, arabic, quoted text, attribution, url', () => {
  const t = core.buildShareText(
    { type: 'hadith', arabic: 'إِنَّمَا', text: '"The reward of deeds..."', ref: 'Sahih al-Bukhari · 1', grade: '✓ Sahih' },
    'https://islamicinfo.org');
  assert.match(t, /Hadith of the Day/);
  assert.match(t, /إِنَّمَا/);
  assert.match(t, /"The reward of deeds\.\.\."/);
  assert.match(t, /— Sahih al-Bukhari · 1 · Sahih/);   // ✓ stripped from grade
  assert.match(t, /https:\/\/islamicinfo\.org/);
});
