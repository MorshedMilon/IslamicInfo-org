'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const core = require('../../src/js/select-to-ask-core.js');

test('maps data-ai-selectable values to QuranlyAI context types', () => {
  assert.equal(core.contextTypeFor('hadith'), 'hadith');
  assert.equal(core.contextTypeFor('dua'), 'dua');
  assert.equal(core.contextTypeFor('ayah'), 'quran');
  assert.equal(core.contextTypeFor('tafsir'), 'article');
  assert.equal(core.contextTypeFor('article'), 'article');
  assert.equal(core.contextTypeFor('unknown'), 'article');
});

test('menu is always 5 buttons; Ask leads, contextual 4th swaps by type', () => {
  const h = core.menuModel('hadith');
  assert.equal(h.length, 5);
  assert.deepEqual(h.map((i) => i.action), ['ask', 'summarize', 'explain', 'verify', 'save']);
  // tafsir / article / dua -> Translate in the contextual slot
  assert.deepEqual(core.menuModel('tafsir').map((i) => i.action), ['ask', 'summarize', 'explain', 'translate', 'save']);
  assert.equal(core.menuModel('article')[3].action, 'translate');
  assert.equal(core.menuModel('dua')[3].action, 'translate');
  // raw Quran ayah is charter-excluded from Translate -> keeps Related Verses
  assert.equal(core.menuModel('ayah')[3].action, 'related_verses');
});

test('eligible requires a minimum trimmed length', () => {
  assert.equal(core.eligible('   a   '), false);
  assert.equal(core.eligible('intentions'), true);
});

test('buildMeta parses key, caps text, passes ref + ts', () => {
  const m = core.buildMeta({ selectable: 'ayah', key: '2:255', ref: '' }, '  Ayat al-Kursi  ', 42);
  assert.equal(m.type, 'quran');
  assert.equal(m.surah, 2);
  assert.equal(m.ayah, 255);
  assert.equal(m.rawText, 'Ayat al-Kursi');
  assert.equal(m.ts, 42);
  const h = core.buildMeta({ selectable: 'hadith', ref: 'Bukhari:1' }, 'text', 1);
  assert.equal(h.sourceRef, 'Bukhari:1');
  assert.equal('surah' in h, false);
  assert.equal(core.buildMeta({ selectable: 'dua' }, 'x'.repeat(5000), 1).rawText.length, core.MAX_TEXT);
});
