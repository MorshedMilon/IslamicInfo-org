const { test } = require('node:test');
const assert = require('node:assert');
const core = require('../src/js/quranly-ai-core.js');

function memStore() {
  const m = {};
  return { getItem: (k) => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); } };
}

test('chips are content-type aware with 5 buttons each', () => {
  assert.equal(core.chipsFor('quran')[0].label, 'Explain this Ayah');
  assert.equal(core.chipsFor('quran')[4].action, 'related_hadith');
  assert.equal(core.chipsFor('hadith')[0].label, 'Explain this Hadith');
  assert.equal(core.chipsFor('hadith')[4].action, 'verify');
  assert.equal(core.chipsFor('article')[0].label, 'Explain this Passage');
  assert.equal(core.chipsFor('dua')[0].label, 'Explain this Dua');
  ['quran', 'hadith', 'article', 'dua'].forEach((t) => {
    assert.equal(core.chipsFor(t).length, 5);
    assert.equal(core.chipsFor(t)[1].action, 'simple');
    assert.equal(core.chipsFor(t)[2].action, 'key_lessons');
  });
});

test('routeKind classifies actions', () => {
  assert.equal(core.routeKind('verify'), 'verify');
  assert.equal(core.routeKind('save'), 'save');
  assert.equal(core.routeKind('explain'), 'ai');
  assert.equal(core.routeKind('summarize'), 'ai');
  assert.equal(core.routeKind('related_verses'), 'ai');
});

test('verifyUrl encodes selected text + ref for the verify page', () => {
  assert.equal(core.verifyUrl({ rawText: 'x y', sourceRef: 'Bukhari:1' }),
    'verify.html?mode=hadith&q=x%20y&ref=Bukhari%3A1');
  assert.equal(core.verifyUrl({ rawText: 'a' }), 'verify.html?mode=hadith&q=a');
});

test('saveSelection persists and de-dupes', () => {
  const s = memStore();
  assert.equal(core.saveSelection(s, { rawText: 'hello world', type: 'hadith', sourceRef: 'Bukhari:1', ts: 1 }).saved, true);
  assert.equal(core.saveSelection(s, { rawText: 'hello world', type: 'hadith', ts: 2 }).saved, false);
  assert.equal(JSON.parse(s.getItem('ii-saved-selections')).length, 1);
  assert.equal(core.saveSelection(s, { rawText: '   ', type: 'dua', ts: 3 }).saved, false);
});
