import { test } from 'node:test';
import assert from 'node:assert';
import core from '../../src/js/home-search-core.js';

/* The hero search now routes Hadith → search-results.html (Slice 3). The
   hadith.html?q= entry point is preserved as an ALIAS (hadith.js is unmodified;
   its ?q= path calls api.fetchHadithSearch → /api/hadith/search?q=). These
   assertions lock the routing contract so the alias isn't silently broken by
   future dispatch edits. Full end-to-end hadith.html?q= render is covered by
   post-deploy manual smoke (no browser-automation harness in-repo). */

test('hero Hadith routing targets the results page and preserves the query', () => {
  const r = core.dispatchTarget('hadith', 'fasting');
  assert.match(r.url, /^search-results\.html\?scope=hadith&q=fasting$/);
});

test('verify keyword reaches Hadith search with the query preserved', () => {
  const r = core.dispatchTarget('verify', 'wudu');
  assert.match(r.url, /scope=hadith&q=wudu$/);
});

test('quran + all route to the results page with scope + query intact', () => {
  assert.match(core.dispatchTarget('quran', 'mercy').url, /^search-results\.html\?scope=quran&q=mercy$/);
  assert.match(core.dispatchTarget('all', 'zakat').url, /^search-results\.html\?scope=all&q=zakat$/);
});
