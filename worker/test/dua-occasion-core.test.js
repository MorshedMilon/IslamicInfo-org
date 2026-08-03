import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import core from '../../src/js/dua-occasion-core.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const CORPUS = resolve(ROOT, 'src/data/dua/search-corpus.json');

/* The occasion facet is a DERIVED navigation bucket, not a source claim. It must
   come from a checked-in, deterministic rule table (scripts/build-dua-occasions.mjs
   + this core), never from values baked into the corpus by a script we no longer
   have. Rules, in order:
     1. the entry's own chapter label, when that label names an occasion
        (a book chapter such as "Kitab al-Da'awat" names no occasion — skip it)
     2. the entry's own text
     3. 'general' — never force an entry into a bucket to fill it out       */

test('BUCKETS: exactly the 20 published buckets, each with a label and an icon', () => {
  const slugs = Object.keys(core.BUCKETS);
  assert.equal(slugs.length, 20);
  for (const s of slugs) {
    assert.match(s, /^[a-z][a-z-]*$/, s + ' is a clean slug');
    assert.ok(core.BUCKETS[s].label, s + ' has a label');
    assert.ok(core.BUCKETS[s].icon, s + ' has an icon');
  }
  assert.ok(core.BUCKETS.general, 'general is the fallback bucket');
});

test('assign: returns the bucket slug, the reason and the rule that fired', () => {
  const r = core.assign({ category: 'What to say before sleeping', translation: 'In Your name, O Allah, I die and I live.' });
  assert.equal(r.slug, 'sleep-waking');
  assert.equal(r.via, 'chapter');
  assert.ok(r.rule, 'names the rule that fired, so a wrong bucket is traceable');
});

test('chapter rules beat text rules — the chapter label wins when it names an occasion', () => {
  // Ayat al-Kursi: its chapter names the occasion outright. Whatever its text
  // mentions, it is a morning/evening remembrance — it was in food-drink before.
  assert.equal(core.assign({
    category: 'Words of remembrance for morning and evening',
    translation: 'Allah - there is no deity except Him, the Ever-Living, the Self-Sustaining.'
  }).slug, 'morning-evening');

  assert.equal(core.assign({ category: 'Invocations during Sujood', translation: 'Glory to my Lord, the Most High.' }).slug, 'prayer');
  assert.equal(core.assign({ category: 'Invocations for the beginning of the prayer', translation: 'O Allah, distance me from my sins.' }).slug, 'prayer');
  assert.equal(core.assign({ category: 'What to say after completing the prayer', translation: 'I seek the forgiveness of Allah.' }).slug, 'prayer');
  assert.equal(core.assign({ category: 'supplications for when you wake up', translation: 'Praise is to Allah who gave us life.' }).slug, 'sleep-waking');
  assert.equal(core.assign({ category: 'Invocation for visiting the graves', translation: 'Peace be upon you, people of this abode.' }).slug, 'funeral-illness');
});

test('a more specific chapter rule beats a broader one that also matches', () => {
  // "Funeral prayer" contains "prayer": funeral must win, or every funeral dua
  // lands in Prayer (Salah).
  assert.equal(core.assign({ category: 'Invocations for the dead in the Funeral prayer', translation: 'O Allah, forgive him.' }).slug, 'funeral-illness');
  assert.equal(core.assign({ category: 'Invocations for a child in the Funeral prayer', translation: 'O Allah, make him a reward for his parents.' }).slug, 'funeral-illness');
  // "the Day of Arafat" is Hajj, not fasting, though Arafat is also a fast day.
  assert.equal(core.assign({ category: 'Invocation to be recited on the Day of Arafat', translation: 'None has the right to be worshipped but Allah alone.' }).slug, 'hajj-umrah');
});

test('a book chapter names no occasion, so the text decides', () => {
  // A label that is ONLY a book reference still defers to the text.
  assert.equal(core.assign({ category: "Chapters on Supplication (Kitab al-Da'awat)", translation: 'O Allah, forgive me my sins and have mercy on me.' }).via, 'text');
  assert.equal(core.assign({ category: "The Book on Al-Witr (Kitab al-Witr)", translation: 'O Allah, forgive me my sins.' }).via, 'text');
  assert.equal(core.assign({ category: "Supplication (Kitab al-Du'a)", translation: 'O Allah, I seek refuge in You from Your punishment.' }).slug, 'protection');
});

/* Previously this case asserted via:'text' → 'protection', using this very chapter as the
   example. That was the bug, not the contract: "Supplications in the Witr Prayer" names an
   occasion, and the trailing "(Kitab al-Witr)" is a citation appended to it. Reading the raw
   string put all 21 of the chapter's entries in Protection on the strength of the Qunut
   wording, which is why "dua qunut" had no candidate sitting in Prayer. The rule is now
   positional: strip the trailing citation, then ask whether what remains names an occasion. */
test('a citation appended to an occasion label does not hide the occasion', () => {
  const r = core.assign({
    category: "Supplications in the Witr Prayer (Kitab al-Witr)",
    translation: 'O Allah, I seek refuge in You from Your punishment.'
  });
  assert.equal(r.via, 'chapter', 'the label names the Witr prayer before the citation');
  assert.equal(r.slug, 'prayer');

  // The remainder must still be tested — a bare book name is not rescued by stripping.
  assert.equal(core.assign({ category: "Invocations (Kitab al-Da'awat)", translation: 'O Allah, forgive me.' }).via, 'text');
});

test('nothing lands in food-drink unless it is actually about food or drink', () => {
  for (const cat of ['Words of remembrance for morning and evening', 'What to say before sleeping',
    'Invocations during Sujood', 'Invocations for Qunut in the Witr prayer',
    'Invocations after the final Tash-ahhud and before ending the prayer']) {
    assert.notEqual(core.assign({ category: cat, translation: 'O Allah, I ask You for pardon.' }).slug, 'food-drink', cat);
  }
  assert.equal(core.assign({ category: 'Invocations before eating', translation: 'In the name of Allah.' }).slug, 'food-drink');
  assert.equal(core.assign({ category: 'Invocation for someone who gives you drink or offers it to you', translation: 'O Allah, feed him.' }).slug, 'food-drink');
});

test('unmatched entries fall back to general — never forced into a bucket', () => {
  const r = core.assign({ category: "Qur'anic supplications", translation: 'Our Lord, accept this from us.' });
  assert.equal(r.slug, 'general');
  assert.equal(r.via, 'fallback');
});

test('assign is deterministic and tolerates missing fields', () => {
  const e = { category: 'Invocations for anguish', translation: 'There is no deity but Allah, the Mighty, the Forbearing.' };
  assert.deepEqual(core.assign(e), core.assign(e));
  assert.equal(core.assign({}).slug, 'general');
  assert.equal(core.assign({ category: null, translation: null }).slug, 'general');
});

/* ---- the corpus itself must match what the generator produces ---- */

test('corpus: every occasion value is reproducible by re-running the rules', (t) => {
  if (!existsSync(CORPUS)) { t.skip('corpus not ingested'); return; }
  const c = JSON.parse(readFileSync(CORPUS, 'utf8'));
  const drift = [];
  for (const d of c.duas) {
    if (!d.occasionSlug) continue;                    // guidance/untranslated carry no facet
    const want = core.assign(d);
    if (want.slug !== d.occasionSlug) drift.push(d.id + ': corpus=' + d.occasionSlug + ' rules=' + want.slug);
  }
  assert.deepEqual(drift, [], 'run: node scripts/build-dua-occasions.mjs');
});

test('corpus: labels and icons come from the bucket table, never per-entry', (t) => {
  if (!existsSync(CORPUS)) { t.skip('corpus not ingested'); return; }
  const c = JSON.parse(readFileSync(CORPUS, 'utf8'));
  for (const d of c.duas) {
    if (!d.occasionSlug) continue;
    const b = core.BUCKETS[d.occasionSlug];
    assert.ok(b, d.id + ' uses an unknown bucket ' + d.occasionSlug);
    assert.equal(d.occasion, b.label, d.id + ' label');
    assert.equal(d.occasionIcon, b.icon, d.id + ' icon');
  }
});

test('corpus: the facet bucket list in meta matches the rule table', (t) => {
  if (!existsSync(CORPUS)) { t.skip('corpus not ingested'); return; }
  const c = JSON.parse(readFileSync(CORPUS, 'utf8'));
  const inMeta = c.meta.facets.occasion.buckets.map(b => b.slug).sort();
  assert.deepEqual(inMeta, Object.keys(core.BUCKETS).sort());
});

test('corpus: no chapter that names an occasion sits in a contradicting bucket', (t) => {
  if (!existsSync(CORPUS)) { t.skip('corpus not ingested'); return; }
  const c = JSON.parse(readFileSync(CORPUS, 'utf8'));
  // Independent of the rule table on purpose: a plain reader's expectation.
  const expect = [
    [/before sleeping|when you wake up|stir in the night|afraid to go to sleep/i, 'sleep-waking'],
    [/morning and evening/i, 'morning-evening'],
    [/funeral|the dead|grave|bereaved/i, 'funeral-illness'],
    [/sujood|ruki|tash-?ahhud|qunut|athan|ablution/i, 'prayer'],
  ];
  const bad = [];
  for (const d of c.duas) {
    if (!d.occasionSlug) continue;
    for (const [re, want] of expect) {
      if (re.test(d.category || '')) {
        if (d.occasionSlug !== want) bad.push(d.id + ' "' + d.category + '" -> ' + d.occasionSlug + ' (expected ' + want + ')');
        break;
      }
    }
  }
  assert.deepEqual(bad, []);
});
