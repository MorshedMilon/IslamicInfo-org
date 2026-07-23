import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

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
