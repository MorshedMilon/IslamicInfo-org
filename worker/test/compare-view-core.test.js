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
