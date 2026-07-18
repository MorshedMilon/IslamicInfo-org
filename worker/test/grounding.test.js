import { test } from 'node:test';
import assert from 'node:assert';
import { buildGrounding, GROUNDED_ACTIONS } from '../src/lib/grounding.js';
import relatedCore from '../../src/js/quran-related-core.js';
import hadithCore from '../../src/js/quran-related-hadith-core.js';
import vocabCore from '../../src/js/quran-vocab-core.js';

// Minimal compiled-shape fixtures.
const relatedTopics = {
  patience: { label: 'Patience (Sabr)', verses: [
    { key: '2:153', ref: 'Al-Baqarah 2:153', score: 9, translation: 'O you who believe, seek help through patience and prayer.', translator: 'Saheeh International', sourceCitation: 'Quran 2:153' },
    { key: '2:155', ref: 'Al-Baqarah 2:155', score: 7, translation: 'We will surely test you...', translator: 'Saheeh International', sourceCitation: 'Quran 2:155' },
  ] },
};
const verseIndex = { '2:153': ['patience'], '2:155': ['patience'] };
const hadithTopics = {}; // staged/empty, as in the live repo
const terms = { sabr: { arabic: 'صَبْر', translit: 'Ṣabr', shortDef: 'Patience.', longDef: 'Patient perseverance.', source: "Lane's Lexicon", topics: ['patience'] } };
const topicTerms = { patience: ['sabr'] };

const data = { relatedCore, hadithCore, vocabCore, relatedTopics, verseIndex, hadithTopics, terms, topicTerms };

test('GROUNDED_ACTIONS lists exactly the three grounded actions', () => {
  assert.deepEqual([...GROUNDED_ACTIONS].sort(), ['related_hadith', 'related_verses', 'vocabulary']);
});

test('related_verses returns verified rows with citations', () => {
  const g = buildGrounding('related_verses', '2:153', data);
  assert.equal(g.found, true);
  assert.match(g.text, /2:155/);
  assert.match(g.text, /Saheeh International|Quran 2:155/);
});

test('related_hadith with empty dataset returns not-documented', () => {
  const g = buildGrounding('related_hadith', '2:153', data);
  assert.equal(g.found, false);
  assert.match(g.text, /not documented in available sources/i);
});

test('vocabulary returns verified terms', () => {
  const g = buildGrounding('vocabulary', '2:153', data);
  assert.equal(g.found, true);
  assert.match(g.text, /Ṣabr|Sabr/);
  assert.match(g.text, /Patience/);
});

test('asbab_al_nuzul has no dataset -> not-documented', () => {
  const g = buildGrounding('asbab_al_nuzul', '2:153', data);
  assert.equal(g.found, false);
  assert.match(g.text, /not documented in available sources/i);
});
