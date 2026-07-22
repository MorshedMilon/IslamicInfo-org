import { test } from 'node:test';
import assert from 'node:assert';
import core from '../../src/js/compare-view-core.js';

test('MAX_COMPARE is 3', () => {
  assert.equal(core.MAX_COMPARE, 3);
});

test('addRef: appends when absent and under cap', () => {
  const r = core.addRef(['a:0:1'], 'b:0:2');
  assert.deepEqual(r.list, ['a:0:1', 'b:0:2']);
  assert.equal(r.added, true);
  assert.equal(r.full, false);
});

test('addRef: no duplicates', () => {
  const r = core.addRef(['a:0:1'], 'a:0:1');
  assert.deepEqual(r.list, ['a:0:1']);
  assert.equal(r.added, false);
});

test('addRef: refuses beyond cap and reports full', () => {
  const r = core.addRef(['a:0:1', 'b:0:2', 'c:0:3'], 'd:0:4');
  assert.deepEqual(r.list, ['a:0:1', 'b:0:2', 'c:0:3']);
  assert.equal(r.added, false);
  assert.equal(r.full, true);
});

test('addRef: full flag true when adding the 3rd item', () => {
  const r = core.addRef(['a:0:1', 'b:0:2'], 'c:0:3');
  assert.equal(r.added, true);
  assert.equal(r.full, true);
});

test('removeRef: drops the ref', () => {
  assert.deepEqual(core.removeRef(['a:0:1', 'b:0:2'], 'a:0:1'), ['b:0:2']);
});

test('canCompare: true at >=2', () => {
  assert.equal(core.canCompare(['a:0:1']), false);
  assert.equal(core.canCompare(['a:0:1', 'b:0:2']), true);
});

test('serializeRefs / parseRefs round-trip, cap at 3, dedupe, drop empties', () => {
  assert.equal(core.serializeRefs(['a:0:1', 'b:0:2']), 'a:0:1,b:0:2');
  assert.deepEqual(core.parseRefs('a:0:1,b:0:2'), ['a:0:1', 'b:0:2']);
  assert.deepEqual(core.parseRefs('a:0:1, a:0:1 ,,b:0:2'), ['a:0:1', 'b:0:2']);
  assert.deepEqual(core.parseRefs('a,b,c,d,e'), ['a', 'b', 'c']);
  assert.deepEqual(core.parseRefs(''), []);
  assert.deepEqual(core.parseRefs(null), []);
});

test('normalizeArabicToken: strips tashkeel, tatweel, and punctuation; keeps base letters', () => {
  // "الأعمالُ،" (with damma + Arabic comma) normalizes to the bare word "الأعمال"
  assert.equal(core.normalizeArabicToken('الأعمالُ،'), core.normalizeArabicToken('الأعمال'));
  // tatweel (ـ) removed
  assert.equal(core.normalizeArabicToken('الأعمـال'), core.normalizeArabicToken('الأعمال'));
});

test('tokenizeMatn: splits on whitespace with raw + normalized key', () => {
  const t = core.tokenizeMatn('إنما الأعمال');
  assert.equal(t.length, 2);
  assert.equal(t[0].raw, 'إنما');
  assert.ok(t[0].key.length > 0);
});

test('diffTwo: identical matns → zero highlights', () => {
  const a = core.tokenizeMatn('إنما الأعمال بالنيات');
  const b = core.tokenizeMatn('إنما الأعمال بالنيات');
  const d = core.diffTwo(a, b);
  assert.deepEqual(d.a, [false, false, false]);
  assert.deepEqual(d.b, [false, false, false]);
});

test('diffTwo: one changed word → exactly that word flagged on each side', () => {
  const a = core.tokenizeMatn('إنما الأعمال بالنيات');
  const b = core.tokenizeMatn('إنما الصيام بالنيات');
  const d = core.diffTwo(a, b);
  assert.deepEqual(d.a, [false, true, false]);
  assert.deepEqual(d.b, [false, true, false]);
});

test('diffTwo: VERIFICATION NOTE — punctuation/diacritic differences are NOT false positives', () => {
  // Same words, one side has extra diacritics + a trailing comma. Must show zero diff.
  const a = core.tokenizeMatn('إنما الأعمال بالنيات');
  const b = core.tokenizeMatn('إنَّما الأعمالُ بالنياتِ،');
  const d = core.diffTwo(a, b);
  assert.ok(d.a.every(function (x) { return x === false; }), 'no side-a false positives');
  assert.ok(d.b.every(function (x) { return x === false; }), 'no side-b false positives');
});
