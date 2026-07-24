import { test } from 'node:test';
import assert from 'node:assert';
import core from '../../src/js/hadith-topics-core.js';

const KEYS = ['faith','prayer','charity','fast','hajj','purification','knowledge',
  'character','marriage','supplication','hereafter','trade','death','justice'];

test('TOPICS: exactly the 14 PRD hero-chip topics, in order', () => {
  assert.equal(core.TOPICS.length, 14);
  assert.deepEqual(core.TOPICS.map(t => t.key), KEYS);
  core.TOPICS.forEach(t => { assert.ok(t.label && t.keyword, 'label+keyword present'); });
});

test('topicByKey / isTopicKey', () => {
  assert.equal(core.topicByKey('prayer').label, 'Prayer (Salah)');
  assert.equal(core.topicByKey('nope'), null);
  assert.equal(core.isTopicKey('hajj'), true);
  assert.equal(core.isTopicKey('xyz'), false);
});

const H = (txt) => ({ text: txt });

test('coOccurringTopics: counts other-topic keyword co-occurrence among current-topic hadith', () => {
  const loaded = [
    H('prayer and charity'), H('prayer and charity again'),
    H('prayer and fast'), H('unrelated hajj text'),
  ];
  const co = core.coOccurringTopics(loaded, 'prayer', core.TOPICS);
  const charity = co.find(x => x.key === 'charity');
  const fast = co.find(x => x.key === 'fast');
  assert.equal(charity.count, 2);
  assert.equal(fast.count, 1);
  assert.ok(!co.find(x => x.key === 'hajj'), 'hajj not among prayer-matching hadith');
  assert.ok(!co.find(x => x.key === 'prayer'), 'current topic excluded');
  assert.ok(co.indexOf(charity) < co.indexOf(fast), 'sorted by count desc');
});

test('coOccurringTopics: empty when no hadith match the current topic, or blank keyword', () => {
  assert.deepEqual(core.coOccurringTopics([H('only hajj')], 'prayer', core.TOPICS), []);
  assert.deepEqual(core.coOccurringTopics([H('prayer')], '', core.TOPICS), []);
  assert.deepEqual(core.coOccurringTopics([], 'prayer', core.TOPICS), []);
});

test('coOccurringTopics: matching is case-insensitive', () => {
  const co = core.coOccurringTopics([H('PRAYER and CHARITY')], 'prayer', core.TOPICS);
  assert.equal(co.find(x => x.key === 'charity').count, 1);
});

test('topicSearchQuery: valid key → keyword, unknown → null', () => {
  assert.equal(core.topicSearchQuery('prayer'), 'prayer');
  assert.equal(core.topicSearchQuery('charity'), 'charity');
  assert.equal(core.topicSearchQuery('nope'), null);
  assert.equal(core.topicSearchQuery(null), null);
});

test('countKind: classifies the live-count copy path', () => {
  assert.equal(core.countKind(0), 'zero');
  assert.equal(core.countKind(1), 'one');
  assert.equal(core.countKind(2), 'many');
  assert.equal(core.countKind(312), 'many');
  assert.equal(core.countKind(null), 'more');      // total unavailable → page-scoped fallback
  assert.equal(core.countKind(undefined), 'more');
  assert.equal(core.countKind(-5), 'more');        // nonsense → safe fallback
});

test('radioState: one checked = tab stop; none checked = first is tab stop', () => {
  const keys = ['faith', 'prayer', 'charity'];

  const active = core.radioState(keys, 'prayer');
  assert.deepEqual(active.checked, { faith: false, prayer: true, charity: false });
  assert.deepEqual(active.tabindex, { faith: -1, prayer: 0, charity: -1 });

  const none = core.radioState(keys, null);
  assert.deepEqual(none.checked, { faith: false, prayer: false, charity: false });
  assert.deepEqual(none.tabindex, { faith: 0, prayer: -1, charity: -1 });

  const bad = core.radioState(keys, 'xyz');   // unknown active behaves like none
  assert.deepEqual(bad.checked, { faith: false, prayer: false, charity: false });
  assert.deepEqual(bad.tabindex, { faith: 0, prayer: -1, charity: -1 });
});
