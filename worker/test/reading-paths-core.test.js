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
