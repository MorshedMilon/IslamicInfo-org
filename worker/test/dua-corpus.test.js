import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const CORPUS = resolve(dirname(fileURLToPath(import.meta.url)), '../../src/data/dua/search-corpus.json');

test('dua corpus: >=250 sourced duas, Hisn al-Muslim attribution, no empty records', (t) => {
  if (!existsSync(CORPUS)) { t.skip('corpus not ingested yet (run worker/scripts/ingest-dua-corpus.mjs)'); return; }
  const d = JSON.parse(readFileSync(CORPUS, 'utf8'));
  assert.ok(/Hisn al-Muslim/i.test(d.meta.source), 'source attribution');
  assert.ok(d.meta.count >= 250, 'count >= 250');
  assert.strictEqual(d.duas.length, d.meta.count);
  for (const x of d.duas) {
    assert.ok(x.id, 'id present');
    assert.ok((x.arabic && x.arabic.trim()) || (x.translation && x.translation.trim()), 'has arabic or translation at ' + x.id);
  }
});
