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

/* ── API_BASE seam (ADR-028): ACTIVE — rebases /api/* onto the Worker origin ── */
test('api.js API_BASE is active (non-empty https Worker origin)', () => {
  assert.ok(typeof api.API_BASE === 'string' && /^https:\/\//.test(api.API_BASE),
            'API_BASE should point at an https origin once the /api layer is activated');
});
test('api.js _apiUrl: /api paths are rebased onto API_BASE (relationship, robust to the exact origin)', () => {
  assert.equal(api._apiUrl('/api/verse'), api.API_BASE + '/api/verse');
  assert.equal(api._apiUrl('/api/hadith/collections'), api.API_BASE + '/api/hadith/collections');
  assert.equal(api._apiUrl('/api/hadith/sahih-bukhari/1/1'), api.API_BASE + '/api/hadith/sahih-bukhari/1/1');
});
test('api.js _apiUrl: leaves absolute CDN + non-/api asset URLs untouched (only /api rebased)', () => {
  assert.equal(api._apiUrl('https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-nawawi.json'),
                           'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-nawawi.json');
  assert.equal(api._apiUrl('https://raw.githubusercontent.com/AhmedBaset/hadith-json/v1.2.0/db/x.json'),
                           'https://raw.githubusercontent.com/AhmedBaset/hadith-json/v1.2.0/db/x.json');
  assert.equal(api._apiUrl('src/data/hadith/collections.json'), 'src/data/hadith/collections.json');
});

test('api.js exposes fetchNarrator (Module 8) and it targets /data/narrator (not /api, so API_BASE-exempt)', () => {
  assert.equal(typeof api.fetchNarrator, 'function');
  // /data/ path is NOT rebased by _apiUrl (only /api/ is) — stays same-origin static asset
  assert.equal(api._apiUrl('/data/narrator/x.json'), '/data/narrator/x.json');
});
