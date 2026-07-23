import { test } from 'node:test';
import assert from 'node:assert';
import core from '../../src/js/quran-tafsir-core.js';

/* Qur'an tafsir core — source registry + URL builders (incl. UmmahAPI fallback, ADR-045). */

test('sources: Ibn Kathir carries the UmmahAPI work key', () => {
  const ik = core.sourceByKey('ik');
  assert.equal(ik.label, 'Ibn Kathir');
  assert.equal(ik.ummah, 'ibn_kathir');
});

test('ummahUrl: builds the UmmahAPI tafsir endpoint for a source with an ummah key', () => {
  const ik = core.sourceByKey('ik');
  assert.equal(core.ummahUrl(ik, 2, 255), 'https://ummahapi.com/api/tafsir/ibn_kathir/surah/2/ayah/255');
});

test('ummahUrl: null for a source without an ummah key (no fabricated fallback)', () => {
  const ja = core.sourceByKey('ja'); // Al-Jalalayn — no UmmahAPI mirror
  assert.equal(ja.ummah, undefined);
  assert.equal(core.ummahUrl(ja, 1, 1), null);
});

test('spa5kUrl / quranUrl still correct (fallback chain order spa5k → quran.com → ummah)', () => {
  const ik = core.sourceByKey('ik');
  assert.equal(core.spa5kUrl(ik, 1, 1), 'https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/en-tafisr-ibn-kathir/1/1.json');
  assert.equal(core.quranUrl(ik, 1, 1), 'https://api.quran.com/api/v4/tafsirs/169/by_ayah/1:1');
});

test('formatTafsir: strips tags + splits paragraphs (XSS-safe)', () => {
  const paras = core.formatTafsir('<p>First para.</p><p>Second <b>bold</b> para.</p><script>alert(1)</script>', true);
  assert.deepEqual(paras, ['First para.', 'Second bold para.']);
});
