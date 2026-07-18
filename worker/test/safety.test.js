import { test } from 'node:test';
import assert from 'node:assert';
import {
  verdictLangDetected, looksRulingAdjacent,
  SCHOLAR_REDIRECT, RULING_DEFLECTION, ASK_CLAUDE_SYSTEM_PROMPT,
} from '../src/lib/safety.js';

test('verdictLangDetected flags ruling framing', () => {
  assert.equal(verdictLangDetected('This is haram for everyone.'), true);
  assert.equal(verdictLangDetected('It is obligatory to do this.'), true);
});

test('verdictLangDetected passes plain explanation', () => {
  assert.equal(verdictLangDetected('This verse teaches patience and trust in God.'), false);
});

test('looksRulingAdjacent catches fiqh keywords', () => {
  assert.equal(looksRulingAdjacent('Is interest (riba) allowed?'), true);
  assert.equal(looksRulingAdjacent('Is Bitcoin halal?'), true);
  assert.equal(looksRulingAdjacent('What does this verse mean?'), false);
});

test('exports the redirect and deflection strings', () => {
  assert.match(SCHOLAR_REDIRECT, /qualified scholar/i);
  assert.match(RULING_DEFLECTION, /qualified scholar/i);
  assert.ok(ASK_CLAUDE_SYSTEM_PROMPT.length > 0);
});
