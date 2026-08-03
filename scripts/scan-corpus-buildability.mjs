/* scan-corpus-buildability.mjs — READ ONLY. Corpus-wide buildability scan.
 *
 * Runs every already-built detector — Gate 1 (gate1-route-out.json, meta.excluded,
 * entryType), Gate 2 (transliteration/translation presence), Gate 3
 * (scan-arabic-narration.mjs's frame check), and dua-clause-core.js's shape
 * detector/extractor — over every SLUGGED record (the browse/page-eligible layer,
 * src/data/dua/slugs.lock.json, 506 records) and sorts each into exactly one of
 * BUILDABLE / NOT_YET / NOT_BUILDABLE.
 *
 * Writes nothing to the corpus. Emits three CSVs under doc/.
 *
 *   node scripts/scan-corpus-buildability.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

const corpus = JSON.parse(fs.readFileSync("src/data/dua/search-corpus.json", "utf8"));
const gate1 = JSON.parse(fs.readFileSync("src/data/dua/gate1-route-out.json", "utf8"));
const slugs = JSON.parse(fs.readFileSync("src/data/dua/slugs.lock.json", "utf8"));
const clause = require(path.resolve("src/js/dua-clause-core.js"));

const byId = Object.fromEntries(corpus.duas.map(d => [String(d.id), d]));
const gate1Ids = new Set(Object.keys(gate1.entries));
const excludedIds = new Set(corpus.meta.excluded.ids || []);
const slugIds = Object.keys(slugs);

/* The reviewer-supplied anchor already established for the one verse-from-bundle case
   (build-wave1-readiness.mjs). Reused verbatim — not re-derived. */
const BUNDLE_ANCHORS = { "28:101": "ربنا لا تؤاخذنا" };

/* ---- Gate 3 arabic-frame check, reused verbatim from scan-arabic-narration.mjs ---- */
const bare = (s) => (s || "").replace(/[ً-ْٰۖ-ۭ]/g, "").replace(/\s+/g, " ").trim();
const FRAMES = [
  [/^و?كان\s+(النبي|رسول|الرسول)/, "'The Prophet was…' — narrative past"],
  [/حدثنا|أخبرنا|حدثني|أخبرني/, "isnad verb (حدثنا / أخبرنا)"],
  [/^و?عن\s+\S+/, "'on the authority of…'"],
  [/قال\s+رسول\s+الله|قال\s+النبي|^و?قال\s+صلى/, "'the Messenger of Allah said'"],
  [/سمعت\s+(رسول|النبي)/, "'I heard the Messenger…'"],
  [/^و?كان\s/, "'he/it was…' — narrative past"],
  [/^قال\s+\S+/, "opens with a reporting verb 'X said'"],
  [/رضي\s+الله\s+عن(ه|ها|هم|هما)/, "companion honorific — narration apparatus"],
  [/^لما\s|^ركب\s|^طاف\s|^جعل\s/, "narrative verb opening"],
];
const DUROOD = /اللهم\s+صل\s+على/;
const prefixOf = (b) => { const i = b.indexOf("(("); return i === -1 ? b : b.slice(0, i).trim(); };
function arabicFrameHit(d) {
  const b = bare(d.arabic || "");
  if (!b) return null;
  const pre = prefixOf(b);
  if (!pre) return null;
  if (DUROOD.test(pre)) return null;
  const why = FRAMES.filter(([rx]) => rx.test(pre)).map(([, w]) => w);
  return why.length ? why.join(", ") : null;
}
const QURAN_NARRATIVE = /^و?(ذا|إذ)\s|^و?أيوب|^و?نوح|قال\s+رب|فنادى|إذ\s+نادى|إذ\s+قال/;

/* ---- Gate 2 ---- */
const instructionInTranslation = (d) =>
  /^\(?\s*(place your hand|spit |get up|say(?:ing)? ?:|one should|he should|recited after)/i
    .test((d.translation || "").replace(/^[("'\[]+/, ""));

/* ---- classify one record ---- */
function classify(id) {
  const d = byId[id];
  const row = { id, category: d ? d.category : "", occasionSlug: d ? d.occasionSlug || "" : "",
    sourceKey: d ? d.sourceKey || "" : "" };
  if (!d) return { ...row, bucket: "NOT_BUILDABLE", reason: "slugged id not found in corpus", shape: "" };

  const arEmpty = !(d.arabic || "").trim();
  const trEmpty = !(d.translation || "").trim();
  const tlEmpty = !(d.transliteration || "").trim();
  const isQuran = id.startsWith("quran:");
  const gate1Hit = gate1Ids.has(id) || excludedIds.has(id);
  const entryTypeFlag = d.entryType && d.entryType !== "guidance" ? d.entryType : (d.entryType === "guidance" ? "guidance" : "");
  const instr = instructionInTranslation(d);
  const frame = !isQuran ? arabicFrameHit(d) : null;
  const quranNarrative = isQuran && QURAN_NARRATIVE.test(bare(d.arabic || "")) ? "yes" : "";

  const opts = BUNDLE_ANCHORS[id] ? { anchor: BUNDLE_ANCHORS[id] } : undefined;
  const ex = arEmpty ? null : clause.extract(d, opts);
  const shape = ex ? ex.shape : null;

  const common = { ...row, gate1Hit: gate1Hit ? "yes" : "", entryType: entryTypeFlag,
    arabicEmpty: arEmpty ? "yes" : "", translationEmpty: trEmpty ? "yes" : "",
    transliterationEmpty: tlEmpty ? "yes" : "", instructionInTranslation: instr ? "yes" : "",
    arabicFrameHit: frame || "", quranNarrativeSubclause: quranNarrative,
    shape: shape || "none", extractOk: ex ? (ex.ok ? "yes" : "no") : "", extractWhy: ex && !ex.ok ? ex.why : "" };

  /* ---- NOT BUILDABLE, checked in this priority order ---- */
  if (gate1Hit || d.entryType === "contextual")
    return { ...common, bucket: "NOT_BUILDABLE", reason: "Gate 1 route-out (not a dua to recite)" };
  if (arEmpty)
    return { ...common, bucket: "NOT_BUILDABLE", reason: "empty field: arabic — no dua text at all" };
  if (shape === "classb-isnad" && ex && !ex.ok)
    return { ...common, bucket: "NOT_BUILDABLE", reason: `isnad, no recoverable clause — ${ex.why}` };
  if (shape === "quran-clause" && ex && !ex.ok)
    return { ...common, bucket: "NOT_BUILDABLE", reason: `full āyah, no recoverable clause — ${ex.why}` };
  if (!shape || shape === "none") {
    if (frame)
      return { ...common, bucket: "NOT_BUILDABLE", reason: `narrator's frame in Arabic, no extraction shape applies — ${frame}` };
  }
  if (instr)
    return { ...common, bucket: "NOT_BUILDABLE", reason: "translation opens with an instruction, not the dua" };

  /* ---- NOT YET ---- */
  if (shape === "prefix-trim")
    return { ...common, bucket: "NOT_YET", reason: "Arabic-field defect — extractable", shape: "prefix-trim" };
  if (shape === "quran-clause")
    return { ...common, bucket: "NOT_YET", reason: "full āyah — supplication is one clause", shape: "quran-clause" };
  if (shape === "classb-isnad")
    return { ...common, bucket: "NOT_YET", reason: "isnad in Arabic field — extractable", shape: "classb-isnad" };
  if (shape === "verse-from-bundle")
    return { ...common, bucket: "NOT_YET", reason: "record holds >1 āyah — anchored", shape: "verse-from-bundle" };
  if (trEmpty)
    return { ...common, bucket: "NOT_YET", reason: "Gate 2 gap — translation missing, needs sourcing", shape: "gate2-gap:translation" };
  if (tlEmpty)
    return { ...common, bucket: "NOT_YET", reason: "Gate 2 gap — transliteration missing, needs sourcing", shape: "gate2-gap:transliteration" };

  /* ---- BUILDABLE ---- */
  return { ...common, bucket: "BUILDABLE", reason: "passes Gate 1/2/3 as currently coded" };
}

const rows = slugIds.map(classify);

const counts = { BUILDABLE: 0, NOT_YET: 0, NOT_BUILDABLE: 0 };
for (const r of rows) counts[r.bucket]++;

const COLS = ["id","category","occasionSlug","sourceKey","bucket","reason","shape","extractOk","extractWhy",
  "gate1Hit","entryType","arabicEmpty","translationEmpty","transliterationEmpty",
  "instructionInTranslation","arabicFrameHit","quranNarrativeSubclause"];
const csvEsc = (v) => { const s = String(v ?? ""); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
function writeCsv(file, list) {
  const out = [COLS.join(",")];
  for (const r of list) out.push(COLS.map(c => csvEsc(r[c])).join(","));
  fs.writeFileSync(file, out.join("\n") + "\n");
  console.log(`  ${file} — ${list.length} rows`);
}

writeCsv("doc/DUA-CORPUS-SCAN-BUILDABLE.csv", rows.filter(r => r.bucket === "BUILDABLE").sort((a,b)=>a.id.localeCompare(b.id)));
writeCsv("doc/DUA-CORPUS-SCAN-NOT-YET.csv", rows.filter(r => r.bucket === "NOT_YET").sort((a,b)=>a.id.localeCompare(b.id)));
writeCsv("doc/DUA-CORPUS-SCAN-NOT-BUILDABLE.csv", rows.filter(r => r.bucket === "NOT_BUILDABLE").sort((a,b)=>a.id.localeCompare(b.id)));

console.log("");
console.log(`universe: ${slugIds.length} slugged records`);
console.log(`BUILDABLE:     ${counts.BUILDABLE}`);
console.log(`NOT_YET:       ${counts.NOT_YET}`);
console.log(`NOT_BUILDABLE: ${counts.NOT_BUILDABLE}`);
console.log(`sum check: ${counts.BUILDABLE + counts.NOT_YET + counts.NOT_BUILDABLE} (should equal ${slugIds.length})`);

console.log("");
console.log("NOT_YET by shape:");
const byShape = {};
for (const r of rows) if (r.bucket === "NOT_YET") byShape[r.shape] = (byShape[r.shape]||0)+1;
for (const [k,v] of Object.entries(byShape).sort((a,b)=>b[1]-a[1])) console.log(`  ${k}: ${v}`);

console.log("");
console.log("NOT_BUILDABLE by reason class:");
const byReasonHead = {};
for (const r of rows) if (r.bucket === "NOT_BUILDABLE") {
  const head = r.reason.split(" — ")[0];
  byReasonHead[head] = (byReasonHead[head]||0)+1;
}
for (const [k,v] of Object.entries(byReasonHead).sort((a,b)=>b[1]-a[1])) console.log(`  ${k}: ${v}`);
