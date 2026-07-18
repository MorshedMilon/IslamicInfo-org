'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const core = require('../../src/js/quran-vocab-core.js');

const TAX = { patience: 'Patience (Sabr)', 'fear-of-allah': 'Fear of Allah (Taqwa)' };

function goodTerm(over) {
  return Object.assign({
    arabic: 'تَقْوَىٰ', translit: 'Taqwā', shortDef: 'God-consciousness.',
    longDef: 'A fuller definition compiled from cited sources.',
    source: "Lane's Lexicon", topics: ['fear-of-allah']
  }, over || {});
}

test('validateSource passes a clean source', () => {
  const src = { taqwa: goodTerm() };
  const r = core.validateSource(src, TAX);
  assert.equal(r.ok, true);
  assert.deepEqual(r.errors, []);
});

test('validateSource enforces every fail-closed rule', () => {
  const src = {
    'Bad Slug': goodTerm(),
    blankdef: goodTerm({ shortDef: '  ' }),
    nosrc: goodTerm({ source: '' }),
    noar: goodTerm({ arabic: '' }),
    notopics: goodTerm({ topics: [] }),
    badtopic: goodTerm({ topics: ['nonexistent-topic'] })
  };
  const r = core.validateSource(src, TAX);
  assert.equal(r.ok, false);
  assert.ok(r.errors.some(e => /Bad Slug|kebab/.test(e)));
  assert.ok(r.errors.some(e => /blankdef.*shortDef/i.test(e)));
  assert.ok(r.errors.some(e => /nosrc.*source/i.test(e)));
  assert.ok(r.errors.some(e => /noar.*arabic/i.test(e)));
  assert.ok(r.errors.some(e => /notopics.*non-empty/i.test(e)));
  assert.ok(r.errors.some(e => /not in .*taxonomy/i.test(e)));
});
