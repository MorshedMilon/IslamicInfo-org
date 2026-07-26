import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

/* Guards the card "Books: Unavailable" bug for the direct-source collections.
   Direct-source (fawazahmed0/ahmedbaset) collections have no hadithapi books
   endpoint, so their chaptersCount was null → the card showed "Unavailable".
   Real chapter counts (from each source file's `chapters` array) are now seeded,
   and _seedToCollection must pass chaptersCount through (it previously hardcoded null). */

const here = dirname(fileURLToPath(import.meta.url));
const load = (p) => JSON.parse(readFileSync(resolve(here, p), 'utf8'));
const seed = load('../../src/data/hadith/collections.json');
const list = seed.collections || [];

test('every direct-source collection has a real numeric book/chapter count (no "Unavailable")', () => {
  const direct = list.filter((c) => c.source === 'ahmedbaset' || c.source === 'fawazahmed0');
  assert.ok(direct.length >= 9, 'expected the direct-source collections to be present');
  const missing = direct.filter((c) => typeof c.chaptersCount !== 'number' || c.chaptersCount < 1);
  assert.deepStrictEqual(missing.map((c) => c.slug), [], 'direct-source collections missing chaptersCount');
});

test('_seedToCollection passes chaptersCount through (not hardcoded null)', () => {
  const src = readFileSync(resolve(here, '../../src/js/api.js'), 'utf8');
  const fn = src.slice(src.indexOf('function _seedToCollection'), src.indexOf('function _seedToCollection') + 500);
  assert.match(fn, /chaptersCount:\s*\(typeof c\.chaptersCount === 'number'\)/, '_seedToCollection must read c.chaptersCount');
  assert.doesNotMatch(fn, /chaptersCount:\s*null\s*,/, '_seedToCollection must not hardcode chaptersCount: null');
});
