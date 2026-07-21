import { test } from 'node:test';
import assert from 'node:assert';
import ui from '../../src/js/ui-utils.js';
import api from '../../src/js/api.js';

test('escapeHTML neutralizes markup', () => {
  assert.equal(ui.escapeHTML('<img src=x onerror=alert(1)>'), '&lt;img src=x onerror=alert(1)&gt;');
  assert.equal(ui.escapeHTML(`"a" & 'b'`), '&quot;a&quot; &amp; &#39;b&#39;');
});

test('safeParse returns fallback on bad JSON', () => {
  assert.deepEqual(ui.safeParse('{bad', { d: 1 }), { d: 1 });
  assert.deepEqual(ui.safeParse('{"a":2}', null), { a: 2 });
});

test('api.js exposes the Module 0 hadith REST methods', () => {
  ['fetchHadithCollections','fetchHadithBooks','fetchHadithList','fetchHadithOne','fetchHadithSearch','fetchHadithDaily']
    .forEach(fn => assert.equal(typeof api[fn], 'function', fn + ' missing'));
});

/* ── API_BASE seam (ADR-028): default '' = same-origin, INERT ── */
test('api.js API_BASE defaults to empty (same-origin, inert)', () => {
  assert.equal(api.API_BASE, '');
});
test('api.js _apiUrl: /api paths unchanged when API_BASE unset (same-origin preserved)', () => {
  assert.equal(api._apiUrl('/api/verse'), '/api/verse');
  assert.equal(api._apiUrl('/api/hadith/collections'), '/api/hadith/collections');
  assert.equal(api._apiUrl('/api/hadith/sahih-bukhari/1/1'), '/api/hadith/sahih-bukhari/1/1');
});
test('api.js _apiUrl: leaves absolute CDN + non-/api asset URLs untouched (only /api rebased)', () => {
  assert.equal(api._apiUrl('https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-nawawi.json'),
                           'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-nawawi.json');
  assert.equal(api._apiUrl('https://raw.githubusercontent.com/AhmedBaset/hadith-json/v1.2.0/db/x.json'),
                           'https://raw.githubusercontent.com/AhmedBaset/hadith-json/v1.2.0/db/x.json');
  assert.equal(api._apiUrl('src/data/hadith/collections.json'), 'src/data/hadith/collections.json');
});
