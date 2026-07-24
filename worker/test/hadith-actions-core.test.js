import { test } from 'node:test';
import assert from 'node:assert';
import core from '../../src/js/hadith-actions-core.js';

const entry = (over = {}) => Object.assign(
  { ref: 'sahih-bukhari:1:1', collectionSlug: 'sahih-bukhari', bookNum: 1, hadithNum: 1 }, over);

test('toggleBookmark: adds when absent, sets added:true', () => {
  const { list, added } = core.toggleBookmark([], entry(), 100);
  assert.equal(added, true);
  assert.equal(list.length, 1);
  assert.equal(list[0].ref, 'sahih-bukhari:1:1');
  assert.equal(list[0].category, 'General');
  assert.equal(list[0].createdAt, 100);
});

test('toggleBookmark: idempotent — second toggle removes (added:false)', () => {
  const first = core.toggleBookmark([], entry(), 100);
  const second = core.toggleBookmark(first.list, entry(), 200);
  assert.equal(second.added, false);
  assert.equal(second.list.length, 0);
});

test('dedupeByRef: drops duplicate refs, keeps first', () => {
  const out = core.dedupeByRef([entry({ category: 'A' }), entry({ category: 'B' }), null]);
  assert.equal(out.length, 1);
  assert.equal(out[0].category, 'A');
});

test('setCategory: updates matching ref only', () => {
  const list = [core.buildBookmark(entry(), 0), core.buildBookmark(entry({ ref: 'x:0:9', hadithNum: 9 }), 0)];
  const out = core.setCategory(list, 'sahih-bukhari:1:1', 'Reflection');
  assert.equal(core.getBookmarkCategory(out, 'sahih-bukhari:1:1'), 'Reflection');
  assert.equal(core.getBookmarkCategory(out, 'x:0:9'), 'General');
});

test('customCategoriesOf: distinct non-builtins in use', () => {
  const list = [
    core.buildBookmark({ ref: 'a:0:1', category: 'General' }, 0),
    core.buildBookmark({ ref: 'a:0:2', category: 'Fiqh' }, 0),
    core.buildBookmark({ ref: 'a:0:3', category: 'Fiqh' }, 0),
  ];
  assert.deepEqual(core.customCategoriesOf(list), ['Fiqh']);
});

test('addCustomCategory: rejects a 6th distinct custom (max 5)', () => {
  let list = [];
  ['c1','c2','c3','c4','c5'].forEach((name, i) => {
    list = list.concat(core.buildBookmark({ ref: 'a:0:' + i, category: name }, 0));
  });
  const res = core.addCustomCategory(list, 'c6');
  assert.equal(res.ok, false);
  assert.equal(res.customs.length, 5);
});

test('addCustomCategory: existing custom is ok (no new slot consumed)', () => {
  const list = [core.buildBookmark({ ref: 'a:0:1', category: 'Fiqh' }, 0)];
  const res = core.addCustomCategory(list, 'Fiqh');
  assert.equal(res.ok, true);
});

test('addCustomCategory: blank or builtin name rejected', () => {
  assert.equal(core.addCustomCategory([], '  ').ok, false);
  assert.equal(core.addCustomCategory([], 'General').ok, false);
});

test('panelFilter: all returns everything; a category filters', () => {
  const list = [
    core.buildBookmark({ ref: 'a:0:1', category: 'General' }, 0),
    core.buildBookmark({ ref: 'a:0:2', category: 'Reflection' }, 0),
  ];
  assert.equal(core.panelFilter(list, 'all').length, 2);
  assert.equal(core.panelFilter(list, 'Reflection').length, 1);
});

test('clampNoteText: caps at 2000 chars', () => {
  assert.equal(core.clampNoteText('x'.repeat(2500)).length, 2000);
});

test('upsertNote: inserts then replaces by hadithRef', () => {
  let list = core.upsertNote([], core.buildNote('a:0:1', 'first', 10));
  assert.equal(list.length, 1);
  list = core.upsertNote(list, core.buildNote('a:0:1', 'second', 20));
  assert.equal(list.length, 1);
  assert.equal(core.getNote(list, 'a:0:1').text, 'second');
});

test('upsertNote: empty text removes the note', () => {
  let list = core.upsertNote([], core.buildNote('a:0:1', 'hi', 10));
  list = core.upsertNote(list, core.buildNote('a:0:1', '', 20));
  assert.equal(list.length, 0);
  assert.equal(core.getNote(list, 'a:0:1'), null);
});

test('buildNote: clamps text and stamps updatedAt', () => {
  const n = core.buildNote('a:0:1', 'y'.repeat(3000), 55);
  assert.equal(n.hadithRef, 'a:0:1');
  assert.equal(n.text.length, 2000);
  assert.equal(n.updatedAt, 55);
});

test('buildAskUrl: Tier 1 (no hadith in route) → empty verify.html', () => {
  assert.equal(core.buildAskUrl({ collection: null }, null), 'verify.html');
});

test('buildAskUrl: Tier 3 with matn → prefilled q/ref/mode=claim', () => {
  const url = core.buildAskUrl(
    { collection: 'sahih-bukhari', book: 1, hadith: 1 },
    { translation: { text: 'The reward of deeds...' }, reference: 'Sahih al-Bukhari 1' });
  assert.ok(url.indexOf('verify.html?') === 0);
  assert.ok(url.indexOf('q=' + encodeURIComponent('The reward of deeds...')) !== -1);
  assert.ok(url.indexOf('ref=' + encodeURIComponent('Sahih al-Bukhari 1')) !== -1);
  assert.ok(url.indexOf('mode=claim') !== -1);
});

test('buildAskUrl: Tier 3 route but no resolvable matn → empty verify.html', () => {
  assert.equal(core.buildAskUrl({ collection: 'x', book: 1, hadith: 5 }, null), 'verify.html');
});

test('buildAskUrl: falls back to arabicMatn when translation missing', () => {
  const url = core.buildAskUrl({ collection: 'x', book: 1, hadith: 5 }, { arabicMatn: 'نص' });
  assert.ok(url.indexOf('q=' + encodeURIComponent('نص')) !== -1);
});

test('buildCopyText: single-string citation matches M12 template character-for-character', () => {
  const t = core.buildCopyText({
    translation: 'The reward of deeds depends upon the intentions',
    narrator: "Narrated 'Umar:",
    reference: 'Sahih al-Bukhari 1',
    grade: 'Sahih',
    sourceUrl: 'https://islamicinfo.org/hadith/sahih-bukhari/1/1',
  });
  assert.equal(t,
    '"The reward of deeds depends upon the intentions" — Narrated \'Umar. ' +
    'Sahih al-Bukhari 1. Grade: Sahih. ' +
    'Source: https://islamicinfo.org/hadith/sahih-bukhari/1/1');
});
test('buildCopyText: main copy excludes Arabic matn (that is the Arabic-only button)', () => {
  const t = core.buildCopyText({ arabic: 'نص عربي', translation: 'x', reference: 'Sahih Muslim 1' });
  assert.equal(t.indexOf('نص عربي'), -1);
});
test('buildCopyText: narrator de-doubling — no "Narrated by Narrated"', () => {
  const t = core.buildCopyText({ translation: 'x', narrator: "Narrated Anas:", reference: 'r' });
  assert.ok(t.indexOf('Narrated Anas.') !== -1);
  assert.equal(t.indexOf('Narrated by Narrated'), -1);
});
test('buildCopyText: prefixes "Narrated by" when the narrator name lacks it', () => {
  const t = core.buildCopyText({ translation: 'x', narrator: 'Aisha', reference: 'r' });
  assert.ok(t.indexOf('Narrated by Aisha.') !== -1);
});
test('buildCopyText: grade without grader emits no (grader, year) clause', () => {
  const t = core.buildCopyText({ translation: 'x', reference: 'r', grade: 'Hasan' });
  assert.ok(t.indexOf('Grade: Hasan.') !== -1);
  assert.equal(t.indexOf('('), -1);
});
test('buildCopyText: omits Source clause when no sourceUrl', () => {
  const t = core.buildCopyText({ translation: 'x', reference: 'r' });
  assert.equal(t.indexOf('Source:'), -1);
});
test('buildCopyText: returns empty string when no reference (never copy an unattributed hadith)', () => {
  assert.equal(core.buildCopyText({ arabic: 'نص', translation: 'x' }), '');
});
test('buildCopyText: works with translation-only (no narrator/grade/url)', () => {
  const t = core.buildCopyText({ translation: 'x', reference: 'Sunan Abu Dawud 5' });
  assert.equal(t, '"x" Sunan Abu Dawud 5.');
});
