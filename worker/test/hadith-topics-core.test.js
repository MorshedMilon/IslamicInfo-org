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
