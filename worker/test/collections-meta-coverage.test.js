import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

/* Guards the reported bug: some seeded collections had no presentation metadata,
   so their cards rendered with no icon, no Arabic name, and "Grade Unavailable".
   Every collection in collections.json must have a collections-meta.json entry with
   an Arabic name, a motif (emoji fallback), a filter category, and an authenticity
   label. (The nicer per-slug SVG motif lives in src/js/hadith.js MOTIF_SVG — a DOM
   module not importable here — but the meta motif is the guaranteed fallback.) */

const dir = dirname(fileURLToPath(import.meta.url));
const load = (p) => JSON.parse(readFileSync(resolve(dir, p), 'utf8'));
const collections = load('../../src/data/hadith/collections.json');
const meta = load('../../src/data/hadith/collections-meta.json');
const list = Array.isArray(collections) ? collections : (collections.collections || []);

test('every seeded collection has presentation metadata (icon + arabic + grade label)', () => {
  const missing = [];
  for (const c of list) {
    const m = meta[c.slug];
    if (!m || !m.arabicName || !m.motif || !m.category || !m.authLabel) missing.push(c.slug);
  }
  assert.deepStrictEqual(missing, [], 'collections missing metadata: ' + missing.join(', '));
});

test('metadata has no orphan slugs (every meta key except _note is a real collection)', () => {
  const slugs = new Set(list.map((c) => c.slug));
  const orphans = Object.keys(meta).filter((k) => k !== '_note' && !slugs.has(k));
  assert.deepStrictEqual(orphans, [], 'orphan meta entries: ' + orphans.join(', '));
});
