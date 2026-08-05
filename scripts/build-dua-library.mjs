/* Build the browser payload for the dua library.
     node scripts/build-dua-library.mjs
   search-corpus.json stays the canonical record (landing pages, Worker API).
   This writes src/data/dua/library.json, which carries only what the page
   actually renders: unused fields are dropped, the source line is precomputed
   so hadithCitation need not ship, and keys are shortened because every key
   name is paid 500+ times. */
import fs from 'node:fs';
const c = JSON.parse(fs.readFileSync("./src/data/dua/search-corpus.json", "utf8"));

/* No guessed attribution. This used to fall back to "Hisn al-Muslim" for any
   record without a verse ref or hadith citation, which stamped that compilation
   onto records drawn from three other sources. A record that cannot say where
   it comes from shows no source line at all. */
/* A label that names no source renders as no attribution: 'other' is literally
   "Other source", and 'dua-dhikr' names the dataset the English came from, not
   the collection the supplication is from. Neither causes exclusion — see
   doc/DUA-SOURCING-BACKLOG.md. */
const UNNAMED_SOURCE_KEYS = new Set(['other', 'dua-dhikr']);

function sourceLine(d) {
  if (d.verseRef) return "Qur'an · " + d.verseRef;
  const h = d.hadithCitation;
  if (h && typeof h === 'object') return h.book + " " + h.number + (h.narrator ? " · " + h.narrator : "");
  if (h) return String(h);
  if (d.sourceLabel && !UNNAMED_SOURCE_KEYS.has(d.sourceKey)) return d.sourceLabel;
  return null;
}

/* The exclusion set is read, never re-derived — it is produced once in
   scripts/build-dua-occasions.mjs and stamped into the corpus. Run that first;
   if the stamp is missing, fail loudly rather than ship an unfiltered library. */
const excluded = c.meta && c.meta.excluded && Array.isArray(c.meta.excluded.ids) ? c.meta.excluded.ids : null;
if (!excluded) {
  console.error('ABORTING — corpus has no meta.excluded stamp.\n' +
    'Run: node scripts/build-dua-occasions.mjs   (it produces the exclusion set)');
  process.exit(1);
}
const skip = new Set(excluded);

/* HELD RECORDS — added 2026-08-04 after they shipped to /dua.html.
   meta.excluded covers Gate 1 route-outs. It does NOT cover a HOLD, which is a
   different mechanism: page-copy.json `indexable:false` plus removing the detail
   page from the index. Without this filter a held record keeps its card on
   /dua.html, linking to a URL that now 404s — which is exactly what happened to
   27:90, 36:127 and 103:215.

   Read from page-copy.json, the same source the detail-page builder and the
   sitemap use, so a hold cannot mean one thing here and another there. */
const lock = JSON.parse(fs.readFileSync("./src/data/dua/slugs.lock.json", "utf8"));
const pageCopy = JSON.parse(fs.readFileSync("./src/data/dua/page-copy.json", "utf8"));
const held = new Set(c.duas
  .filter(d => { const s = lock[d.id]; return s && pageCopy[s] && pageCopy[s].indexable === false; })
  .map(d => d.id));
if (held.size) console.log("held records excluded from the library:", held.size, "(" + [...held].join(", ") + ")");

const src = c.duas.filter(d => d.translation && !skip.has(d.id) && !held.has(d.id));
const notes = {};      // repeated prose stored once, referenced by index
const noteId = (s) => { if (!s) return undefined; if (!(s in notes)) notes[s] = Object.keys(notes).length; return notes[s]; };

const duas = src.map(d => {
  const o = { i: d.id, a: d.arabic, e: d.translation, c: d.category };
  const sl = sourceLine(d); if (sl) o.s = sl;
  if (d.transliteration) o.t = d.transliteration;
  if (d.categorySlug) o.cs = d.categorySlug;
  if (d.occasion) { o.o = d.occasion; o.os = d.occasionSlug; o.oi = d.occasionIcon; }
  if (d.sourceLabel && !UNNAMED_SOURCE_KEYS.has(d.sourceKey)) { o.sl = d.sourceLabel; o.sk = d.sourceKey; }
  if (d.verseRef) o.vr = d.verseRef;
  if (d.variantRole) o.vro = d.variantRole;
  if (d.variantGroup) o.vg = d.variantGroup;
  if (d.variantLead) o.vl = 1;
  if (d.entryType) o.et = d.entryType;
  const n1 = noteId(d.editionNote); if (n1 !== undefined) o.en = n1;
  const n2 = noteId(d.occasionNote); if (n2 !== undefined) o.on = n2;
  const n3 = noteId(d.variantNote); if (n3 !== undefined) o.vn = n3;
  const n4 = noteId(d.contextNote); if (n4 !== undefined) o.cn = n4;
  if (d.contextLabel) o.cl = d.contextLabel;
  return o;
});
const doc = { v: 1, notes: Object.keys(notes), duas };
fs.writeFileSync("src/data/dua/library.json", JSON.stringify(doc));

const before = fs.statSync("src/data/dua/search-corpus.json").size;
const after = fs.statSync("src/data/dua/library.json").size;
console.log("entries:", duas.length, "of", c.duas.length, "(excluded:", skip.size, "+ no-translation/other drops)");
console.log("shared note strings:", doc.notes.length);
console.log("corpus  :", (before / 1024).toFixed(0) + "KB");
console.log("library :", (after / 1024).toFixed(0) + "KB  (-" + Math.round((1 - after / before) * 100) + "%)");
