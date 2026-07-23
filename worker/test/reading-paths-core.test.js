import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import core from '../../src/js/reading-paths-core.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const seed = JSON.parse(
  readFileSync(join(__dirname, '../../src/data/hadith/reading-paths.json'), 'utf8')
);

// ── seed shape (DoD: exactly 4 canonical paths, no 5th) ──────────────
test('seed: exactly 4 canonical paths in canonical order', () => {
  assert.equal(seed.paths.length, 4);
  assert.deepEqual(
    seed.paths.map((p) => p.slug),
    ['nawawi-40', 'kutub-sittah-basics', 'faith-foundations', 'prophetic-character']
  );
});

test('seed: canonical target counts per FIX-2', () => {
  assert.deepEqual(
    seed.paths.map((p) => p.targetCount),
    [42, 50, 30, 25]
  );
});

test('seed: no 5th "Daily Sunnah" path (deferred post-v1)', () => {
  assert.ok(!seed.paths.some((p) => /daily.?sunnah/i.test(p.slug + p.name)));
});

test('seed: every path ships with deferred (empty) hadithRefs — no unverified refs', () => {
  for (const p of seed.paths) {
    assert.equal(p.status, 'curation-pending');
    assert.deepEqual(p.hadithRefs, []);
  }
});

// ── ringGeometry (DoD §5: stroke-dashoffset correct at 0/50/100%) ────
test('ringGeometry: circumference = 2πr for default r=12', () => {
  const g = core.ringGeometry(0);
  assert.ok(Math.abs(g.dashArray - 2 * Math.PI * 12) < 1e-6);
});

test('ringGeometry: 0% → dashOffset === full circumference (empty arc)', () => {
  const g = core.ringGeometry(0);
  assert.ok(Math.abs(g.dashOffset - g.dashArray) < 1e-6);
});

test('ringGeometry: 50% → dashOffset === half circumference', () => {
  const g = core.ringGeometry(50);
  assert.ok(Math.abs(g.dashOffset - g.dashArray / 2) < 1e-6);
});

test('ringGeometry: 100% → dashOffset === 0 (full arc)', () => {
  const g = core.ringGeometry(100);
  assert.ok(Math.abs(g.dashOffset - 0) < 1e-6);
});

test('ringGeometry: out-of-range percent is clamped to [0,100]', () => {
  assert.ok(Math.abs(core.ringGeometry(-20).dashOffset - core.ringGeometry(0).dashOffset) < 1e-6);
  assert.ok(Math.abs(core.ringGeometry(140).dashOffset - core.ringGeometry(100).dashOffset) < 1e-6);
});

test('ringGeometry: custom radius honored', () => {
  const g = core.ringGeometry(100, 20);
  assert.ok(Math.abs(g.dashArray - 2 * Math.PI * 20) < 1e-6);
});

// ── pathProgress ─────────────────────────────────────────────────────
const MOCK_PATH = {
  slug: 'mock', name: 'Mock', targetCount: 4, status: 'ready',
  hadithRefs: [
    { collection: 'sahih-bukhari', book: '1', hadith: '1' },
    { collection: 'sahih-bukhari', book: '1', hadith: '2' },
    { collection: 'sahih-muslim', book: '1', hadith: '3' },
    { collection: 'sahih-muslim', book: '1', hadith: '4' }
  ]
};

test('pathProgress: empty read set → 0 of targetCount, 0%, not complete', () => {
  const p = core.pathProgress(MOCK_PATH, new Set());
  assert.deepEqual(
    { readCount: p.readCount, targetCount: p.targetCount, percent: p.percent, complete: p.complete },
    { readCount: 0, targetCount: 4, percent: 0, complete: false }
  );
});

test('pathProgress: partial read set → correct count + rounded percent', () => {
  const p = core.pathProgress(MOCK_PATH, new Set(['sahih-bukhari:1:1', 'sahih-bukhari:1:2']));
  assert.equal(p.readCount, 2);
  assert.equal(p.percent, 50);
  assert.equal(p.complete, false);
});

test('pathProgress: all read → complete true, 100%', () => {
  const all = new Set(MOCK_PATH.hadithRefs.map(core.refId));
  const p = core.pathProgress(MOCK_PATH, all);
  assert.equal(p.readCount, 4);
  assert.equal(p.percent, 100);
  assert.equal(p.complete, true);
});

test('pathProgress: only refs IN the path count (stray read ids ignored)', () => {
  const p = core.pathProgress(MOCK_PATH, new Set(['some-other:9:9']));
  assert.equal(p.readCount, 0);
});

test('pathProgress: empty deferred path (targetCount>0, no refs) → 0%, not complete', () => {
  const deferred = { slug: 'x', targetCount: 42, hadithRefs: [] };
  const p = core.pathProgress(deferred, new Set());
  assert.deepEqual(
    { readCount: p.readCount, targetCount: p.targetCount, percent: p.percent, complete: p.complete },
    { readCount: 0, targetCount: 42, percent: 0, complete: false }
  );
});

// ── nextUnread ───────────────────────────────────────────────────────
test('nextUnread: none read → first ref', () => {
  assert.equal(core.refId(core.nextUnread(MOCK_PATH, new Set())), 'sahih-bukhari:1:1');
});

test('nextUnread: some read → first not-yet-read in order', () => {
  const r = core.nextUnread(MOCK_PATH, new Set(['sahih-bukhari:1:1']));
  assert.equal(core.refId(r), 'sahih-bukhari:1:2');
});

test('nextUnread: all read → null (complete)', () => {
  const all = new Set(MOCK_PATH.hadithRefs.map(core.refId));
  assert.equal(core.nextUnread(MOCK_PATH, all), null);
});

test('nextUnread: empty deferred path → null', () => {
  assert.equal(core.nextUnread({ hadithRefs: [], targetCount: 42 }, new Set()), null);
});

// ── pathIndexOf ──────────────────────────────────────────────────────
test('pathIndexOf: member ref → 1-based position', () => {
  assert.equal(core.pathIndexOf(MOCK_PATH, 'sahih-muslim:1:3'), 3);
});

test('pathIndexOf: non-member → null', () => {
  assert.equal(core.pathIndexOf(MOCK_PATH, 'not:in:path'), null);
});

// ── isEmptyPath (drives "Coming soon" state) ─────────────────────────
test('isEmptyPath: curation-pending status → true', () => {
  assert.equal(core.isEmptyPath({ status: 'curation-pending', hadithRefs: [] }), true);
});

test('isEmptyPath: empty refs regardless of status → true', () => {
  assert.equal(core.isEmptyPath({ status: 'ready', hadithRefs: [] }), true);
});

test('isEmptyPath: populated path → false', () => {
  assert.equal(core.isEmptyPath(MOCK_PATH), false);
});

// ── storage pure helpers (DOM layer owns actual localStorage) ────────
test('parseStoredPaths: valid JSON object → same object', () => {
  assert.deepEqual(core.parseStoredPaths('{"mock":["a","b"]}'), { mock: ['a', 'b'] });
});

test('parseStoredPaths: null / garbage / array → empty object (never throws)', () => {
  assert.deepEqual(core.parseStoredPaths(null), {});
  assert.deepEqual(core.parseStoredPaths('not json'), {});
  assert.deepEqual(core.parseStoredPaths('[1,2,3]'), {});
});

test('mergeReadRefs: unions + dedupes, order-stable (existing first)', () => {
  assert.deepEqual(core.mergeReadRefs(['a', 'b'], ['b', 'c', 'c']), ['a', 'b', 'c']);
});

test('mergeReadRefs: missing/empty inputs handled', () => {
  assert.deepEqual(core.mergeReadRefs(undefined, ['a']), ['a']);
  assert.deepEqual(core.mergeReadRefs(['a'], undefined), ['a']);
});

test('serializeStoredPaths: round-trips through parse', () => {
  const obj = { mock: ['a', 'b'] };
  assert.deepEqual(core.parseStoredPaths(core.serializeStoredPaths(obj)), obj);
});

test('readSetFor: builds a Set of ids for a given slug', () => {
  const set = core.readSetFor({ mock: ['a', 'b'] }, 'mock');
  assert.ok(set.has('a') && set.has('b') && set.size === 2);
});

test('readSetFor: unknown slug → empty Set', () => {
  assert.equal(core.readSetFor({}, 'nope').size, 0);
});
