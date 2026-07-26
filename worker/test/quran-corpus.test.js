import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const CORPUS = resolve(dirname(fileURLToPath(import.meta.url)), '../../src/data/quran/search-corpus.json');

test('quran corpus: 6236 sourced verses, edition 20, no empties', (t) => {
  if (!existsSync(CORPUS)) { t.skip('corpus not ingested yet (run worker/scripts/ingest-quran-corpus.mjs)'); return; }
  const d = JSON.parse(readFileSync(CORPUS, 'utf8'));
  assert.strictEqual(d.meta.translationEditionId, 20);
  assert.strictEqual(d.meta.verseCount, 6236);
  assert.strictEqual(d.verses.length, 6236);
  for (const v of d.verses) {
    assert.ok(v.verseKey && /^\d+:\d+$/.test(v.verseKey), 'verseKey ' + v.verseKey);
    assert.ok(v.arabic && v.arabic.trim().length, 'arabic empty at ' + v.verseKey);
    assert.ok(v.translation && v.translation.trim().length, 'translation empty at ' + v.verseKey);
  }
});
