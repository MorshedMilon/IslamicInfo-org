import { test } from 'node:test';
import assert from 'node:assert';
import {
  normalizeLang, explainCacheKey, parseExplainSections, SUPPORTED_EXPLAIN_LANGS,
  applyExplainSafety, EXPLAIN_FALLBACK,
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

test('applyExplainSafety: clean four-section output is safe and parsed', () => {
  const text = '### SUMMARY\nSincere intention.\n### VOCABULARY\nniyyah\n### CONTEXT\nn/a\n### LESSON\nBe sincere.';
  const d = applyExplainSafety({ text, refusal: false });
  assert.equal(d.safe, true);
  assert.equal(d.summary, 'Sincere intention.');
  assert.equal(d.lesson, 'Be sincere.');
});

test('applyExplainSafety: refusal → unsafe fallback', () => {
  const d = applyExplainSafety({ text: '', refusal: true });
  assert.equal(d.safe, false);
  assert.equal(d.fallback, EXPLAIN_FALLBACK);
});

test('applyExplainSafety: ADVERSARIAL — ruling framing is rejected wholesale', () => {
  // Simulates the model being coaxed (via injected content) into issuing a verdict.
  const rulingOutputs = [
    '### SUMMARY\nThis action is haram for everyone.',
    '### LESSON\nTherefore it is obligatory to fast today.',
    'Skipping this is a sin and it is forbidden.',
  ];
  for (const text of rulingOutputs) {
    const d = applyExplainSafety({ text, refusal: false });
    assert.equal(d.safe, false, `expected unsafe for: ${text}`);
    assert.equal(d.fallback, EXPLAIN_FALLBACK);
    assert.equal(d.summary, undefined); // no flagged text leaks into the payload
  }
});

test('applyExplainSafety: empty text → unsafe', () => {
  assert.equal(applyExplainSafety({ text: '', refusal: false }).safe, false);
});

test('applyExplainSafety: null/undefined/malformed result → unsafe, never throws', () => {
  assert.equal(applyExplainSafety(null).safe, false);
  assert.equal(applyExplainSafety(undefined).safe, false);
  assert.equal(applyExplainSafety({}).safe, false);
  assert.equal(applyExplainSafety({ text: 123 }).safe, false); // non-string text coerced, not crashed
});

test('applyExplainSafety: verdict language split across a newline is still caught', () => {
  // safety.js AI_VERDICT_FRAMING uses \s+ which spans newlines — confirm the gate catches it.
  const d = applyExplainSafety({ text: '### SUMMARY\nThis is\nharam here.', refusal: false });
  assert.equal(d.safe, false);
  assert.equal(d.fallback, EXPLAIN_FALLBACK);
  assert.equal(d.summary, undefined);
});
