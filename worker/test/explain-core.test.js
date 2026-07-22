import { test } from 'node:test';
import assert from 'node:assert';
import {
  normalizeLang, explainCacheKey, parseExplainSections, SUPPORTED_EXPLAIN_LANGS,
} from '../src/lib/explain-core.js';

test('normalizeLang: known langs pass, unknown falls back to en', () => {
  assert.equal(normalizeLang('ar'), 'ar');
  assert.equal(normalizeLang('EN'), 'en');
  assert.equal(normalizeLang('  Ur '), 'ur');
  assert.equal(normalizeLang('klingon'), 'en');
  assert.equal(normalizeLang(undefined), 'en');
  assert.ok(SUPPORTED_EXPLAIN_LANGS.has('en'));
});

test('explainCacheKey: stable readable key with normalized lang', () => {
  assert.equal(explainCacheKey('sahih-bukhari:1:1', 'ar'), 'hadith_explain:sahih-bukhari:1:1:ar');
  assert.equal(explainCacheKey('sahih-bukhari:1:1', 'nope'), 'hadith_explain:sahih-bukhari:1:1:en');
});

test('parseExplainSections: extracts four labeled blocks', () => {
  const text = [
    '### SUMMARY', 'Intentions matter.',
    '### VOCABULARY', 'niyyah = intention',
    '### CONTEXT', 'Not available in provided sources.',
    '### LESSON', 'Check your intention before acting.',
  ].join('\n');
  const s = parseExplainSections(text);
  assert.equal(s.summary, 'Intentions matter.');
  assert.equal(s.vocabulary, 'niyyah = intention');
  assert.equal(s.context, 'Not available in provided sources.');
  assert.equal(s.lesson, 'Check your intention before acting.');
});

test('parseExplainSections: no labels → whole text becomes summary only', () => {
  const s = parseExplainSections('Just a blob with no headings.');
  assert.equal(s.summary, 'Just a blob with no headings.');
  assert.equal(s.vocabulary, '');
  assert.equal(s.context, '');
  assert.equal(s.lesson, '');
});

test('parseExplainSections: tolerant of missing sections', () => {
  const s = parseExplainSections('### SUMMARY\nOnly a summary here.\n### LESSON\nBe sincere.');
  assert.equal(s.summary, 'Only a summary here.');
  assert.equal(s.lesson, 'Be sincere.');
  assert.equal(s.vocabulary, '');
});

test('parseExplainSections: label-substring inside a body (mid-line) is not a boundary', () => {
  const s = parseExplainSections('### SUMMARY\nThe lesson here (see ### LESSON below) matters.\n### LESSON\nBe sincere.');
  assert.equal(s.summary, 'The lesson here (see ### LESSON below) matters.');
  assert.equal(s.lesson, 'Be sincere.');
});

test('parseExplainSections: CRLF line endings still parse', () => {
  const s = parseExplainSections('### SUMMARY\r\nHello.\r\n### LESSON\r\nBe sincere.');
  assert.equal(s.summary, 'Hello.');
  assert.equal(s.lesson, 'Be sincere.');
});

test('parseExplainSections: empty string input', () => {
  const s = parseExplainSections('');
  assert.deepEqual(s, { summary: '', vocabulary: '', context: '', lesson: '' });
});

test('parseExplainSections: duplicate label — only the first counts', () => {
  const s = parseExplainSections('### SUMMARY\nFirst.\n### SUMMARY\nSecond.');
  assert.equal(s.summary, 'First.\n### SUMMARY\nSecond.');
});
