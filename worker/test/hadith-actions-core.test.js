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
