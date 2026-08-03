/* align-quran-transliteration.mjs — assemble a transliteration for a stored Qur'anic
 * clause from quran.com's per-word transliteration.
 *
 *   node scripts/align-quran-transliteration.mjs            # all quran: records
 *   node scripts/align-quran-transliteration.mjs quran:10:85 quran:11:45
 *   node scripts/align-quran-transliteration.mjs --json     # machine-readable
 *
 * READ ONLY BY DESIGN. It never writes to the corpus and takes no --write flag.
 * Gate 2 requires a transliteration whose provenance is NAMED, and adopting
 * quran.com's word-by-word data is a licensing/attribution decision (ADR-063/064),
 * not something a script may make. Output is evidence for review.
 *
 * WHY WORD-LEVEL AND NOT RESOURCE 57
 * quran.com exposes a verse-level "Transliteration" as translation resource id 57.
 * It is NOT usable here:
 *   - tokenisation is broken   ("atinafee", "al-akhiratihasanatan")
 *   - it carries the `AA` romanisation artifact ("AAathaba") — the same artifact
 *     that contaminates 95 of our own 182 transliterations
 *   - author is literally "Transliteration"; no named edition, so it fails Gate 2's
 *     provenance limb on its face
 * The per-word field returns proper ALA-LC ("rabbanā lā tajʿalnā") and, being
 * per-word, ALIGNS TO A CLAUSE BOUNDARY — which is the whole problem for an
 * extracted clause. Verified 2026-08-03: 20 of 20 batch-2 records aligned exactly.
 */
import fs from "node:fs";

const API = "https://api.quran.com/api/v4/verses/by_key";
const args = process.argv.slice(2);
const asJson = args.includes("--json");
const wanted = args.filter((a) => !a.startsWith("--"));

const corpus = JSON.parse(fs.readFileSync("src/data/dua/search-corpus.json", "utf8"));

/* Strip only to LOCATE a boundary — the returned transliteration is quran.com's own,
   never reconstructed. Mirrors dua-clause-core.js's normalise() intent. */
const strip = (s) => String(s || "")
  .replace(/[ً-ْٰٓ-ٕۖ-ۭـ]/g, "")
  .replace(/ٱ/g, "ا").replace(/[أإآ]/g, "ا")
  .replace(/\s+/g, " ").trim();

async function alignOne(d) {
  const key = String(d.id).replace(/^quran:/, "");
  const url = `${API}/${key}?words=true&word_fields=text_uthmani,transliteration`;
  let words;
  try {
    const r = await fetch(url);
    if (!r.ok) return { id: d.id, ok: false, why: `HTTP ${r.status}` };
    const j = await r.json();
    words = (j.verse.words || []).filter((w) => w.char_type_name !== "end");
  } catch (e) { return { id: d.id, ok: false, why: "fetch failed: " + e.message }; }

  const clause = strip(d.arabic).split(" ").filter(Boolean);
  const norm = words.map((w) => strip(w.text_uthmani));
  let at = -1;
  for (let i = 0; i + clause.length <= norm.length; i++) {
    if (clause.every((c, k) => norm[i + k] === c)) { at = i; break; }
  }
  if (at === -1) {
    /* No exact window. Do NOT fall back to a fuzzy match: a near-alignment would
       silently attach the wrong words' transliteration to a clause, which is
       exactly the class of error this whole gate exists to prevent. */
    return { id: d.id, ok: false, why: "no exact word alignment", clauseWords: clause.length, ayahWords: norm.length };
  }
  const span = words.slice(at, at + clause.length);
  const translit = span.map((w) => (w.transliteration && w.transliteration.text) || "?").join(" ");
  return {
    id: d.id, ok: true,
    startWord: at + 1, ayahWords: norm.length, clauseWords: clause.length,
    frameStripped: at > 0,
    transliteration: translit,
    hasGap: translit.includes("?"),
    hasAaArtifact: /AA/.test(translit),
  };
}

const targets = corpus.duas.filter((d) => /^quran:/.test(String(d.id)))
  .filter((d) => !wanted.length || wanted.includes(String(d.id)));

const out = [];
for (const d of targets) out.push(await alignOne(d));

if (asJson) { console.log(JSON.stringify(out, null, 1)); process.exit(0); }

const ok = out.filter((o) => o.ok);
console.log("=".repeat(78));
console.log("QUR'ANIC CLAUSE ↔ WORD-LEVEL TRANSLITERATION ALIGNMENT  (read only)");
console.log("=".repeat(78));
for (const o of out.slice(0, 40)) {
  if (!o.ok) { console.log(`  ✗ ${o.id.padEnd(16)} ${o.why}${o.clauseWords ? ` (clause ${o.clauseWords}w vs ayah ${o.ayahWords}w)` : ""}`); continue; }
  console.log(`  ✓ ${o.id.padEnd(16)} w${o.startWord}/${o.ayahWords}  ${o.transliteration.slice(0, 62)}`);
}
if (out.length > 40) console.log(`  … ${out.length - 40} more`);
console.log("-".repeat(78));
console.log(`  records            : ${out.length}`);
console.log(`  aligned exactly    : ${ok.length}`);
console.log(`  NOT aligned        : ${out.length - ok.length}`);
console.log(`  frame stripped     : ${ok.filter((o) => o.frameStripped).length}  (clause starts mid-āyah)`);
console.log(`  missing a word     : ${ok.filter((o) => o.hasGap).length}`);
console.log(`  "AA" artifact      : ${ok.filter((o) => o.hasAaArtifact).length}`);
console.log("\n  Nothing was written. Adopting this output requires a Gate 2 provenance");
console.log("  decision on crediting quran.com word-by-word data (ADR-063/064).");
