import { test } from 'node:test';
import assert from 'node:assert';
import core from '../../src/js/hadith-list-core.js';

test('parseSearchInput classifies numbers, keywords, empty, and too-short', () => {
  assert.deepEqual(core.parseSearchInput('  2500 '), { kind: 'number', number: 2500, query: '2500' });
  assert.deepEqual(core.parseSearchInput('patience'), { kind: 'keyword', number: null, query: 'patience' });
  assert.deepEqual(core.parseSearchInput(''), { kind: 'empty', number: null, query: '' });
  assert.deepEqual(core.parseSearchInput('a'), { kind: 'too-short', number: null, query: 'a' });
});

test('computeListAdvance: direct source advances page until lastPage', () => {
  assert.deepEqual(
    core.computeListAdvance({ provider: 'ahmedbaset', book: 1, page: 1, lastPage: 3, bookOrder: null }),
    { done: false, book: 1, page: 2 });
  assert.deepEqual(
    core.computeListAdvance({ provider: 'ahmedbaset', book: 1, page: 3, lastPage: 3, bookOrder: null }),
    { done: true });
});

test('computeListAdvance: hadithapi walks to the next book when a book is exhausted', () => {
  assert.deepEqual(
    core.computeListAdvance({ provider: 'hadithapi', book: 2, page: 1, lastPage: 4, bookOrder: [1,2,3] }),
    { done: false, book: 2, page: 2 });
  assert.deepEqual(
    core.computeListAdvance({ provider: 'hadithapi', book: 2, page: 4, lastPage: 4, bookOrder: [1,2,3] }),
    { done: false, book: 3, page: 1 });
  assert.deepEqual(
    core.computeListAdvance({ provider: 'hadithapi', book: 3, page: 4, lastPage: 4, bookOrder: [1,2,3] }),
    { done: true });
});

test('computeListAdvance: hadithapi with no book list falls back to single-book paging', () => {
  assert.deepEqual(
    core.computeListAdvance({ provider: 'hadithapi', book: 2, page: 1, lastPage: 2, bookOrder: null }),
    { done: false, book: 2, page: 2 });
  assert.deepEqual(
    core.computeListAdvance({ provider: 'hadithapi', book: 2, page: 2, lastPage: 2, bookOrder: null }),
    { done: true });
});

test('loadMoreMode maps fresh/append/end states', () => {
  assert.equal(core.loadMoreMode({ freshCount: 0, append: false, done: true }), 'hide');
  assert.equal(core.loadMoreMode({ freshCount: 25, append: false, done: false }), 'idle');
  assert.equal(core.loadMoreMode({ freshCount: 10, append: true, done: true }), 'end');
  assert.equal(core.loadMoreMode({ freshCount: 25, append: true, done: false }), 'idle');
});
