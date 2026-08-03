import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import core from '../../src/js/dua-source-core.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const CORPUS = resolve(ROOT, 'src/data/dua/search-corpus.json');
const corpus = JSON.parse(readFileSync(CORPUS, 'utf8'));
const browse = corpus.duas.filter(
  (d) => d.translation && d.entryType !== 'guidance' && d.variantRole !== 'variant'
);

/* The source facet states WHICH COLLECTION a supplication comes from. The corpus
   originally derived it from WHO TRANSLATED the entry, collapsing two different
   facts into one field, which put 60 entries behind "Other source" and
   "dua-dhikr collection" — neither of which is a collection. These tests lock
   the two facts apart and assert no placeholder can reach the source slot. */

test('SOURCES: only real collections, no catch-all and no dataset names', () => {
  const keys = Object.keys(core.SOURCES);
  assert.equal(keys.length, 8);
  for (const k of keys) {
    assert.match(k, /^[a-z][a-z-]*$/, k + ' is a clean slug');
    assert.ok(core.SOURCES[k].label, k + ' has a label');
  }
  assert.ok(!('other' in core.SOURCES), '"other" is not a collection');
  assert.ok(!('dua-dhikr' in core.SOURCES), '"dua-dhikr" is a translation dataset, not a collection');
});

test('no label is a placeholder', () => {
  const banned = /other source|unknown|n\/a|default|collection$/i;
  for (const k of Object.keys(core.SOURCES)) {
    assert.ok(!banned.test(core.SOURCES[k].label), k + ' label is not a placeholder: ' + core.SOURCES[k].label);
  }
});

test("Hisn's N:M id resolves to Hisn al-Muslim, chapter N as the reference", () => {
  const r = core.assign({ id: '28:100' });
  assert.equal(r.key, 'hisn');
  assert.equal(r.label, 'Hisn al-Muslim');
  assert.equal(r.reference, 'Hisn al-Muslim 28');
  assert.equal(r.via, 'id');
});

test('an explicit verseRef wins and produces a Qur\'an reference', () => {
  const r = core.assign({ id: 'quran:2:255', verseRef: '2:255' });
  assert.equal(r.key, 'quran');
  assert.equal(r.reference, "Qur'an 2:255");
  assert.equal(r.via, 'verseRef');
});

test('an explicit hadithCitation wins over the id shape', () => {
  const r = core.assign({ id: 'bukhari:6114', hadithCitation: { book: 'Sahih al-Bukhari', number: 6114, narrator: 'Anas' } });
  assert.equal(r.key, 'bukhari');
  assert.equal(r.reference, 'Sahih al-Bukhari 6114');
  assert.equal(r.via, 'hadithCitation');
  assert.equal(core.narratorOf({ hadithCitation: { book: 'x', number: 1, narrator: 'Anas' } }), 'Anas');
});

test('an unrecognisable entry makes NO source claim', () => {
  const r = core.assign({ id: 'mystery-entry' });
  assert.equal(r.key, null);
  assert.equal(r.label, null);
  assert.equal(r.reference, null);
  assert.equal(r.via, 'none');
});

test('narrator is never invented', () => {
  assert.equal(core.narratorOf({}), null);
  assert.equal(core.narratorOf({ hadithCitation: { book: 'x', number: 1 } }), null);
});

/* ── the whole corpus ─────────────────────────────────────────────────────── */

test('every browse entry resolves to a real collection', () => {
  const unresolved = browse.filter((d) => !core.assign(d).key);
  assert.deepEqual(unresolved.map((d) => d.id), [], 'no entry may be left without a source');
});

test('every browse entry gets a reference, and none is bare label repetition', () => {
  for (const d of browse) {
    const r = core.assign(d);
    assert.ok(r.reference, d.id + ' has a reference');
    assert.notEqual(r.reference, r.label, d.id + ' reference is not just the label repeated');
  }
});

test('the 60 previously-unmapped entries are all Hisn al-Muslim', () => {
  const was = browse.filter((d) => d.sourceKey === 'other' || d.sourceKey === 'dua-dhikr');
  assert.equal(was.length, 60, 'the corpus still carries the 60 mislabelled entries');
  for (const d of was) {
    const r = core.assign(d);
    assert.equal(r.key, 'hisn', d.id + ' is a Hisn al-Muslim entry');
    assert.match(r.reference, /^Hisn al-Muslim \d+$/);
  }
});

test('no rendered source label can be a placeholder, across the whole corpus', () => {
  const banned = /other source|unknown source|dua-dhikr collection|\bN\/A\b|undefined|null/i;
  for (const d of browse) {
    const r = core.assign(d);
    assert.ok(!banned.test(r.label), d.id + ' label: ' + r.label);
    assert.ok(!banned.test(r.reference), d.id + ' reference: ' + r.reference);
  }
});

test('translator provenance is kept separate from the source and returned verbatim', () => {
  const d = browse.find((x) => x.id === '28:100');
  assert.equal(core.assign(d).label, 'Hisn al-Muslim');
  assert.equal(core.translationAttribution(d), d.translationSource);
  assert.match(core.translationAttribution(d), /quran\.com/, 'the translator is still stated, just not as the source');
  assert.equal(core.translationAttribution({}), null);
});

/* ── transliteration hygiene ──────────────────────────────────────────────── */

test('English narration prose is not treated as a transliteration', () => {
  assert.ok(core.transliterationIsProse({ transliteration: "(AAabdullah Ibn Sarjis said: 'I went to see the Prophet" }));
  assert.equal(core.usableTransliteration({ transliteration: "(Ibn AAabbas related that the Messenger of Allah used to" }), null);
});

test('genuine romanised Arabic is kept', () => {
  const t = 'bismika allahumma amutu wa ahya';
  assert.ok(!core.transliterationIsProse({ transliteration: t }));
  assert.equal(core.usableTransliteration({ transliteration: t }), t);
});

/* Numbers updated 2026-08-02. Commit 2a7b68b nulled the contaminated transliterations in
   the corpus itself, which moved all three counts and was never reflected here — the test
   had been asserting the pre-nulling shape (219 / 20 / 199) ever since.

   `prose` is now 0, and that is the substantive change: the runtime filter has nothing
   left to catch because the defect was removed at the data layer instead. The assertion is
   kept rather than deleted — it is now a regression guard proving no prose transliteration
   has been reintroduced. If it ever goes non-zero again, an ingest has regressed.
   The 182 does NOT include the 10 Qur'anic records added by ingest-dua-quran-gaps.mjs;
   those carry transliteration: null pending the Gate 2 reviewer. */
test('no prose transliteration survives in the corpus', () => {
  const withT = browse.filter((d) => d.transliteration);
  const prose = withT.filter((d) => core.transliterationIsProse(d));
  assert.equal(withT.length, 182);
  assert.equal(prose.length, 0, 'a prose transliteration has been reintroduced');
  assert.equal(browse.filter((d) => core.usableTransliteration(d)).length, 182);
});

test('a missing transliteration is null, never a placeholder string', () => {
  assert.equal(core.usableTransliteration({}), null);
  assert.equal(core.usableTransliteration({ transliteration: '' }), null);
});
