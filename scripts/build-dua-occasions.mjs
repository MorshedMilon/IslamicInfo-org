/* Re-derive the occasion facet on every corpus entry from the checked-in rules
   in src/js/dua-occasion-core.js.

     node scripts/build-dua-occasions.mjs          # write + report
     node scripts/build-dua-occasions.mjs --dry    # report only, write nothing

   Writes occasion / occasionSlug / occasionIcon on each entry and refreshes
   meta.facets.occasion.buckets. It touches nothing else: Arabic, translation,
   transliteration, category, citation and grading are never modified here.

   Entries with no translation, and guidance narrations (which are narrations
   ABOUT practice, not supplications), carry no occasion at all and are skipped —
   they are not shown in the library and must not appear in a facet count.

   Run this, then rebuild what depends on it:
     node scripts/build-dua-library.mjs
     node scripts/build-dua-landing-pages.mjs                                */
import fs from 'node:fs';
import { createRequire } from 'node:module';
const core = createRequire(import.meta.url)('../src/js/dua-occasion-core.js');

const PATH = './src/data/dua/search-corpus.json';
const dry = process.argv.includes('--dry');
const c = JSON.parse(fs.readFileSync(PATH, 'utf8'));

const moved = [], via = { chapter: 0, text: 0, fallback: 0 };
const before = {}, after = {};

for (const d of c.duas) {
  // Same gate the library and landing pages use: no translation, or a guidance
  // narration -> not shown anywhere, so it gets no navigation facet.
  if (!d.translation || d.entryType === 'guidance') {
    delete d.occasion; delete d.occasionSlug; delete d.occasionIcon;
    continue;
  }
  const was = d.occasionSlug;
  const got = core.assign(d);
  const b = core.BUCKETS[got.slug];
  via[got.via]++;
  if (was) before[was] = (before[was] || 0) + 1;
  after[got.slug] = (after[got.slug] || 0) + 1;
  if (was !== got.slug) moved.push({ id: d.id, from: was || '(none)', to: got.slug, via: got.via, category: d.category || '' });
  d.occasionSlug = got.slug;
  d.occasion = b.label;
  d.occasionIcon = b.icon;
}

c.meta.facets.occasion.buckets = core.bucketList();
c.meta.facets.occasion.generator = 'scripts/build-dua-occasions.mjs + src/js/dua-occasion-core.js';
c.meta.facets.occasion.note =
  "Navigation facet derived by IslamicInfo, not a source claim: it never replaces the entry's own " +
  'category, citation or grading, which stay on the card as the compilation gives them. Derived by ' +
  'the checked-in rules in src/js/dua-occasion-core.js — first the chapter label when that label names ' +
  'an occasion (a book chapter such as "Kitab al-Da\'awat" does not), then the supplication\'s own ' +
  "meaning. Entries matching no rule are grouped as 'General Supplications' rather than being forced " +
  'into a bucket. Re-run scripts/build-dua-occasions.mjs after any corpus change.';

// Written minified with no trailing newline, matching how the corpus is already
// stored — this file is also bundled into the Worker, so formatting it would add
// ~250KB for nothing.
if (!dry) fs.writeFileSync(PATH, JSON.stringify(c));

const pad = (s, n) => String(s).padEnd(n);
console.log(dry ? '— DRY RUN, nothing written —' : 'wrote ' + PATH);
console.log('\nassigned by rule layer:  chapter ' + via.chapter + '  |  text ' + via.text + '  |  fallback ' + via.fallback);

console.log('\nbucket sizes (was -> now):');
for (const slug of Object.keys(core.BUCKETS)) {
  const w = before[slug] || 0, n = after[slug] || 0, d = n - w;
  console.log('  ' + pad(slug, 18) + pad(w, 5) + '-> ' + pad(n, 5) + (d ? (d > 0 ? '+' + d : d) : ''));
}

console.log('\nentries moved: ' + moved.length + ' of ' + (via.chapter + via.text + via.fallback));
for (const m of moved) {
  console.log('  ' + pad(m.id, 12) + pad(m.from, 17) + '-> ' + pad(m.to, 17) + '(' + m.via + ')  ' + m.category.slice(0, 46));
}
