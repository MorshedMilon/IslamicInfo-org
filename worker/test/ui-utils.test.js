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
