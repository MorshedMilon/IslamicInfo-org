'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const core = require('../../src/js/quran-ai-core.js');

test('slugEdition normalizes', () => {
  assert.equal(core.slugEdition('Saheeh International'), 'saheeh-international');
  assert.equal(core.slugEdition('Dr. Mustafa Khattab'), 'dr-mustafa-khattab');
  assert.equal(core.slugEdition(''), '');
});

test('aiCacheKey composes stable key', () => {
  assert.equal(core.aiCacheKey('1:1', 'Saheeh International'), 'ii-quran-ai-1:1-saheeh-international');
});

test('editionFromAttr takes text before the middle dot', () => {
  assert.equal(core.editionFromAttr('Saheeh International · Al-Fatihah 1:1'), 'Saheeh International');
  assert.equal(core.editionFromAttr('No middle dot here'), 'No middle dot here');
  assert.equal(core.editionFromAttr(''), '');
});

test('buildAskPayload assembles context + fixed question + ref', () => {
  const p = core.buildAskPayload({ arabic: 'ARB', translation: 'the mercy', ref: 'Al-Fatihah 1:1', edition: 'Saheeh International' });
  assert.ok(p.context.includes('ARB'));
  assert.ok(p.context.includes('the mercy'));
  assert.ok(p.context.includes('Saheeh International'));
  assert.match(p.question, /simple/i);
  assert.equal(p.sourceRef, 'Al-Fatihah 1:1');
  // edition absent → no trailing parens
  const p2 = core.buildAskPayload({ arabic: 'ARB', translation: 'x', ref: 'r', edition: '' });
  assert.ok(!/\(\)/.test(p2.context));
});

test('containsVerdictLanguage flags ruling framing, not proper nouns or descriptions', () => {
  // TRUE — verdict framing / ruling terms
  assert.equal(core.containsVerdictLanguage('This is halal to eat'), true);
  assert.equal(core.containsVerdictLanguage('It is haram'), true);
  assert.equal(core.containsVerdictLanguage('eating it is forbidden'), true);
  assert.equal(core.containsVerdictLanguage('prayer is obligatory'), true);
  assert.equal(core.containsVerdictLanguage('it is not permissible'), true);
  assert.equal(core.containsVerdictLanguage('it is strictly forbidden'), true);
  assert.equal(core.containsVerdictLanguage('a fatwa on this'), true);
  assert.equal(core.containsVerdictLanguage('That is a fatwā'), true);
  assert.equal(core.containsVerdictLanguage('it is a sin to lie'), true);
  assert.equal(core.containsVerdictLanguage("it's a sin"), true);
  // FALSE — proper nouns / descriptive mentions / innocent words
  assert.equal(core.containsVerdictLanguage('The verse speaks of mercy and gratitude'), false);
  assert.equal(core.containsVerdictLanguage('wholeheartedly and hallowed'), false);
  assert.equal(core.containsVerdictLanguage('They prayed at al-Masjid al-Haram in Mecca'), false);
  assert.equal(core.containsVerdictLanguage('The sacred Haram is a holy site'), false);
  assert.equal(core.containsVerdictLanguage('God forbade them from the tree'), false);
  assert.equal(core.containsVerdictLanguage('This verse mentions halal foods'), false);
});

test('isFresh respects the 30-day window', () => {
  const now = 1000 * 60 * 60 * 24 * 40; // day 40
  assert.equal(core.isFresh(now - 1000, now), true);
  assert.equal(core.isFresh(now - (29 * 24 * 3600 * 1000), now), true);
  assert.equal(core.isFresh(now - (31 * 24 * 3600 * 1000), now), false);
});
