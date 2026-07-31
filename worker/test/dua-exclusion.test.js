/* The exclusion set is produced once (scripts/build-dua-occasions.mjs) and
   stamped into the corpus as meta.excluded. These tests lock the invariant that
   made it necessary: a record routed out of /duas/ at build time stayed fully
   reachable through on-site search, because noindex governs crawlers only.
   See ADR-059. */
import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { searchDuas, excludedIdSet } from '../src/lib/dua-search-core.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const CORPUS = resolve(root, 'src/data/dua/search-corpus.json');
const LIBRARY = resolve(root, 'src/data/dua/library.json');
const read = (p) => JSON.parse(readFileSync(p, 'utf8'));

test('corpus carries a meta.excluded stamp with reasons and a deduped id union', (t) => {
  if (!existsSync(CORPUS)) { t.skip('corpus not present'); return; }
  const { meta } = read(CORPUS);
  assert.ok(meta.excluded, 'meta.excluded missing — run scripts/build-dua-occasions.mjs');
  assert.ok(Array.isArray(meta.excluded.ids) && meta.excluded.ids.length, 'meta.excluded.ids must be a non-empty array');
  assert.equal(meta.excluded.count, meta.excluded.ids.length);
  assert.equal(new Set(meta.excluded.ids).size, meta.excluded.ids.length, 'ids must be deduped');
  for (const key of ['gate1-not-a-dua', 'guidance', 'no-translation'])
    assert.ok(Array.isArray(meta.excluded.reasons[key]), `missing reason bucket: ${key}`);
  // the union must be exactly the union of its reasons — no hand-added ids
  const union = new Set(Object.values(meta.excluded.reasons).flat());
  assert.deepEqual([...union].sort(), [...meta.excluded.ids].sort());
});

test('Ibn Majah 3590 is excluded — it publishes the wording its own narration prohibits', (t) => {
  if (!existsSync(CORPUS)) { t.skip('corpus not present'); return; }
  const { meta } = read(CORPUS);
  assert.ok(meta.excluded.ids.includes('ibnmajah:3590'));
  assert.ok(meta.excluded.reasons['gate1-not-a-dua'].includes('ibnmajah:3590'));
});

test('search returns no excluded record, including by its own text', (t) => {
  if (!existsSync(CORPUS)) { t.skip('corpus not present'); return; }
  const doc = read(CORPUS);
  const exclude = excludedIdSet(doc);
  assert.equal(exclude.size, doc.meta.excluded.ids.length);

  // the query that surfaced the defect: previously ibnmajah:3590, sole result
  assert.equal(searchDuas(doc.duas, 'definite in his asking', { exclude, limit: 50 }).total, 0);

  // every excluded record, queried by words drawn from its own translation
  let reachable = 0;
  for (const id of exclude) {
    const d = doc.duas.find((x) => x.id === id);
    if (!d || !d.translation) continue;
    const q = d.translation.split(/\s+/).filter((w) => w.length > 4).slice(0, 3).join(' ');
    if (!q) continue;
    if (searchDuas(doc.duas, q, { exclude, limit: 50 }).results.some((x) => x.id === id)) reachable++;
  }
  assert.equal(reachable, 0, 'an excluded record is still reachable by its own text');
});

test('omitting the exclude option does NOT silently filter — the corpus is unfiltered without it', (t) => {
  if (!existsSync(CORPUS)) { t.skip('corpus not present'); return; }
  const doc = read(CORPUS);
  // Guards the seam: if this ever passes, a caller could believe it is filtered
  // when it is not. The Worker must pass excludedIdSet(corpus) explicitly.
  assert.ok(searchDuas(doc.duas, 'definite in his asking', { limit: 50 }).total > 0);
});

test('library payload contains no excluded record', (t) => {
  if (!existsSync(CORPUS) || !existsSync(LIBRARY)) { t.skip('corpus or library not built'); return; }
  const excluded = new Set(read(CORPUS).meta.excluded.ids);
  const leaked = read(LIBRARY).duas.map((d) => d.i).filter((i) => excluded.has(i));
  assert.deepEqual(leaked, [], 'excluded records leaked into library.json — run scripts/build-dua-library.mjs');
});

test('no record asserts a source it cannot name', (t) => {
  if (!existsSync(LIBRARY)) { t.skip('library not built'); return; }
  const duas = read(LIBRARY).duas;
  assert.equal(duas.filter((d) => d.sl === 'Other source').length, 0, '"Other source" names nothing and must not fill the attribution slot');
  assert.equal(duas.filter((d) => d.sk === 'other').length, 0);
  // a record with no resolvable source omits the line entirely rather than guessing
  assert.ok(duas.some((d) => !d.s), 'expected at least one record to carry no source line');
});

test('entryTypes are recomputed from the records, not hand-set', (t) => {
  if (!existsSync(CORPUS)) { t.skip('corpus not present'); return; }
  const { duas, meta } = read(CORPUS);
  assert.equal(meta.entryTypes.supplications, duas.filter((d) => !d.entryType).length);
  assert.equal(meta.entryTypes.guidanceNarrations, duas.filter((d) => d.entryType === 'guidance').length);
  assert.equal(meta.entryTypes.contextual, duas.filter((d) => d.entryType === 'contextual').length);
});
