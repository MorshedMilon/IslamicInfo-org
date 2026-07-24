import { test } from 'node:test';
import assert from 'node:assert';
import core from '../../src/js/dorar-card-core.js';

const item = (over = {}) => Object.assign({
  arabicMatn: 'إنما الأعمال بالنيات', narrator: 'عائشة أم المؤمنين',
  ruling: 'رجاله ثقات رجال مسلم إلا أنه منقطع', grader: 'الألباني', rulingSource: 'Dorar.net',
  collectionSlug: 'al-silsila-sahiha', collectionName: 'Al-Silsilah al-Sahihah',
  numberOrPage: '6/778', reference: 'Al-Silsilah al-Sahihah — 6/778',
}, over);

test('buildDorarCardHTML renders RTL matn, narrator, verbatim ruling labelled to grader + Dorar, citation, Ask button', () => {
  const html = core.buildDorarCardHTML(item());
  assert.match(html, /dir="rtl"/);
  assert.match(html, /إنما الأعمال بالنيات/);
  assert.match(html, /عائشة أم المؤمنين/);
  assert.match(html, /رجاله ثقات رجال مسلم إلا أنه منقطع/);
  assert.match(html, /الألباني/);
  assert.match(html, /via Dorar\.net/);
  assert.match(html, /Al-Silsilah al-Sahihah — 6\/778/);
  assert.match(html, /data-act="ask-qai"/);
  assert.match(html, /data-ai-selectable="hadith"/);
});

test('buildDorarCardHTML: emits NO grade badge / grade vocab (ruling is never badge-mapped)', () => {
  const html = core.buildDorarCardHTML(item());
  assert.doesNotMatch(html, /grade-badge|grade-sahih|grade-daif|>Sahih<|Da'if/);
});

test('buildDorarCardHTML: grader null → honest "Grader\'s ruling" label, never fabricated', () => {
  const html = core.buildDorarCardHTML(item({ grader: null }));
  assert.match(html, /Grader's ruling · via Dorar\.net/);
});

test('buildDorarCardHTML: no number → citation is collection-only (no em-dash ref)', () => {
  const html = core.buildDorarCardHTML(item({ numberOrPage: null, reference: 'Al-Silsilah al-Sahihah' }));
  assert.match(html, /Al-Silsilah al-Sahihah/);
  assert.doesNotMatch(html, /Al-Silsilah al-Sahihah —/);
});

test('buildDorarCardHTML escapes matn/narrator/ruling (no raw HTML injection)', () => {
  const html = core.buildDorarCardHTML(item({ arabicMatn: '<script>alert(1)</script>', ruling: '<img src=x onerror=alert(2)>' }));
  assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/);
  assert.doesNotMatch(html, /<img src=x onerror/);
});

test('buildDorarCardHTML: only Dorar.net is cited (no backend vendor names)', () => {
  const html = core.buildDorarCardHTML(item());
  assert.doesNotMatch(html, /hadithapi|AhmedBaset|fawazahmed0/i);
});
