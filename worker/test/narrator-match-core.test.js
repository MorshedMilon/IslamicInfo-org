import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import core from '../../src/js/narrator-match-core.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const enMap = JSON.parse(
  readFileSync(join(__dirname, '../../src/data/narrator/narrator-en-map.json'), 'utf8')
).map;

/* Itqan narrator matching (ADR-047): exact curated-map only, no fuzzy. */

test('normalizeName: lowercases, drops (RA)/honorifics, unifies ibn/bin/b + abi/abu, collapses', () => {
  assert.equal(core.normalizeName('Abu Hurairah (RA)'), 'abu hurairah');
  assert.equal(core.normalizeName("'Umar bin al-Khattab"), 'umar ibn al khattab');
  assert.equal(core.normalizeName('Abdullah b. Abbas'), 'abdullah ibn abbas');
  assert.equal(core.normalizeName('Abu Sa`id  al-Khudri'), 'abu said al khudri');
  assert.equal(core.normalizeName('Abi Bakr'), 'abu bakr');
});

test('normalizeName: empty / null → empty string', () => {
  assert.equal(core.normalizeName(null), '');
  assert.equal(core.normalizeName(''), '');
  assert.equal(core.normalizeName('   '), '');
});

test('matchNarrator: exact curated hit → { id, confidence:high }', () => {
  assert.deepEqual(core.matchNarrator('Abu Hurairah', enMap), { id: 106, confidence: 'high' });
  assert.deepEqual(core.matchNarrator('Abu Huraira (RA)', enMap), { id: 106, confidence: 'high' });
});

test('matchNarrator: unknown narrator → null (never a fuzzy/guessed match)', () => {
  assert.equal(core.matchNarrator('Some Unlisted Narrator', enMap), null);
  assert.equal(core.matchNarrator('', enMap), null);
  assert.equal(core.matchNarrator('Abu Hurairah', null), null);
});

test('starter map: only verified entries; Abu Hurairah = Itqan id 106', () => {
  assert.equal(enMap['abu hurairah'], 106);
  // every value is a positive integer id (no placeholders / nulls)
  Object.values(enMap).forEach((id) => assert.ok(Number.isInteger(id) && id > 0));
});
