/* Build the browser payload for the dua library.
     node scripts/build-dua-library.mjs
   search-corpus.json stays the canonical record (landing pages, Worker API).
   This writes src/data/dua/library.json, which carries only what the page
   actually renders: unused fields are dropped, the source line is precomputed
   so hadithCitation need not ship, and keys are shortened because every key
   name is paid 500+ times. */
import fs from 'node:fs';
const c = JSON.parse(fs.readFileSync("./src/data/dua/search-corpus.json", "utf8"));

function sourceLine(d) {
  if (d.verseRef) return "Qur'an · " + d.verseRef;
  const h = d.hadithCitation;
  if (h && typeof h === 'object') return h.book + " " + h.number + (h.narrator ? " · " + h.narrator : "");
  if (h) return String(h);
  return "Hisn al-Muslim";
}
// guidance entries are never shown in the library
const src = c.duas.filter(d => d.translation && d.entryType !== 'guidance');
const notes = {};      // repeated prose stored once, referenced by index
const noteId = (s) => { if (!s) return undefined; if (!(s in notes)) notes[s] = Object.keys(notes).length; return notes[s]; };

const duas = src.map(d => {
  const o = { i: d.id, a: d.arabic, e: d.translation, c: d.category, s: sourceLine(d) };
  if (d.transliteration) o.t = d.transliteration;
  if (d.categorySlug) o.cs = d.categorySlug;
  if (d.occasion) { o.o = d.occasion; o.os = d.occasionSlug; o.oi = d.occasionIcon; }
  if (d.sourceLabel) { o.sl = d.sourceLabel; o.sk = d.sourceKey; }
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
console.log("entries:", duas.length, "(guidance dropped:", c.duas.length - duas.length + ")");
console.log("shared note strings:", doc.notes.length);
console.log("corpus  :", (before / 1024).toFixed(0) + "KB");
console.log("library :", (after / 1024).toFixed(0) + "KB  (-" + Math.round((1 - after / before) * 100) + "%)");
