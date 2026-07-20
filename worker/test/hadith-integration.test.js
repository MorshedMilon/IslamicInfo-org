import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';

/* index.js transitively loads grounding-data.js (esbuild-only raw .json
   imports) and relies on the Worker `caches` global, so it cannot be imported
   by the Node test runner. The router logic (handleHadith) is fully covered in
   hadith-router.test.js; here we assert the index.js wiring at the source level. */
const src = readFileSync(new URL('../src/index.js', import.meta.url), 'utf8');

test('index.js imports the hadith router', () => {
  assert.match(src, /import\s*\{\s*handleHadith\s*\}\s*from\s*['"]\.\/hadith\.js['"]/);
});

test('/api/hadith is no longer in the PENDING 501 list', () => {
  const m = src.match(/const PENDING = \[([^\]]*)\]/s);
  assert.ok(m, 'PENDING array not found');
  assert.ok(!/['"]\/api\/hadith['"]/.test(m[1]), '/api/hadith must not be in PENDING');
});

test('GET requests dispatch /api/hadith/* to handleHadith', () => {
  assert.match(src, /path\.startsWith\(['"]\/api\/hadith['"]\)/);
  assert.match(src, /handleHadith\(path,\s*url\.searchParams,\s*env,\s*origin/);
});
