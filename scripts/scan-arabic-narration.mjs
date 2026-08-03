/* scan-arabic-narration.mjs — Gate 3 detector-gap closure. READ ONLY, writes nothing.
 *
 * DUA-INTEGRITY-SCAN.md ran narration-leakage detection over the TRANSLATION and
 * TRANSLITERATION fields. It did not run it over `arabic`. 106:218 was found by hand
 * during the famous-dua reconciliation with its Arabic opening
 * "كَانَ النَّبِيُّ ﷺ إِذَا أَتَاهُ الْأَمْرُ…" — a narrator's frame sitting where the
 * supplication should be. The scan could not have caught it.
 *
 * This closes that gap over every record. Precision-first, matching the parent scan's
 * stance: a false defect costs more than a missed one, because it puts sound text on a
 * repair list. Every hit prints its own text so a human adjudicates, not the detector.
 *
 *   node scripts/scan-arabic-narration.mjs
 */
import fs from "node:fs";

const raw = JSON.parse(fs.readFileSync("src/data/dua/search-corpus.json", "utf8"));
const all = raw.duas;
const excluded = new Set(raw.meta?.facets?.excluded?.ids || raw.meta?.excluded?.ids || []);

/* Diacritics carry no signal here and break naive matching; strip them for detection
   only. The reported text is always the original. */
const bare = (s) => (s || "").replace(/[ً-ْٰۖ-ۭ]/g, "").replace(/\s+/g, " ").trim();

/* FIRST ATTEMPT OVER-FIRED — 231 hits — and is recorded here because the failure is
   instructive. Scoring on the mere presence of ﷺ flags `27:87`
   ("…وَبِمُحَمَّدٍ ﷺ نَبِيّاً" — "and Muhammad ﷺ as my Prophet"), which is a sound dua:
   the compilation inserts the salutation wherever the Prophet is named, inside recitable
   text included. That is the same over-firing the parent scan rejected in its v1.
 *
 * The real signal in 106:218 is positional, not lexical. Hisn al-Muslim delimits the
 * recitable text with `((…))`. Narration leakage is therefore: a narrative frame sitting
 * in the PREFIX, before the first delimiter — text a reader would recite because the
 * page presents the whole field as the dua. A salutation inside the delimiter is not
 * leakage; a narrator's frame outside it is. */
const FRAMES = [
  [/^و?كان\s+(النبي|رسول|الرسول)/, "'The Prophet was…' — narrative past"],
  [/حدثنا|أخبرنا|حدثني|أخبرني/, "isnad verb (حدثنا / أخبرنا)"],
  [/^و?عن\s+\S+/, "'on the authority of…'"],
  [/قال\s+رسول\s+الله|قال\s+النبي|^و?قال\s+صلى/, "'the Messenger of Allah said'"],
  [/سمعت\s+(رسول|النبي)/, "'I heard the Messenger…'"],
  [/^و?كان\s/, "'he/it was…' — narrative past"],
  [/^قال\s+\S+/, "opens with a reporting verb 'X said'"],
  [/رضي\s+الله\s+عن(ه|ها|هم|هما)/, "companion honorific — narration apparatus"],
  [/^لما\s|^ركب\s|^طاف\s|^جعل\s/, "narrative verb opening (when… / he rode / he circled / he began)"],
];

/* A durood legitimately contains صل على محمد — an imperative addressed to Allah, not the
   honorific formula. Never leakage. */
const DUROOD = /اللهم\s+صل\s+على/;

/* Split the field at the compilation's recitation delimiter. Everything before the first
   `((` is prefix. No delimiter at all => the whole field is treated as prefix, because
   nothing marks where the recitable text starts. */
const prefixOf = (b) => {
  const i = b.indexOf("((");
  return i === -1 ? b : b.slice(0, i).trim();
};

const isQuran = (d) => String(d.id).startsWith("quran:");

const hits = [], quranNarrative = [], noArabic = [];

for (const d of all) {
  const ar = d.arabic || "";
  const b = bare(ar);
  if (!b) { noArabic.push(d); continue; }

  /* Qur'anic records are a different question and must not be conflated. A verse that
     narrates ("And Job, when he cried unto his Lord…") is the revealed text, not a
     defect — but the supplication inside it is a sub-clause, which is a real problem
     for an Arabic block that claims to BE the dua. Reported separately, never as
     leakage. */
  if (isQuran(d)) {
    if (/^و?(ذا|إذ)\s|^و?أيوب|^و?نوح|قال\s+رب|فنادى|إذ\s+نادى|إذ\s+قال/.test(b)) quranNarrative.push(d);
    continue;
  }

  const pre = prefixOf(b);
  if (!pre) continue;                       // field opens straight into recitable text
  if (DUROOD.test(pre)) continue;
  const why = FRAMES.filter(([rx]) => rx.test(pre)).map(([, w]) => w);
  if (why.length) hits.push({ d, why, pre });
}

const layer = (d) => excluded.has(String(d.id)) ? "excluded" : "active";

console.log("=".repeat(96));
console.log(`ARABIC-FIELD NARRATION LEAKAGE — ${all.length} records scanned`);
console.log("=".repeat(96));
console.log(`\nhits: ${hits.length}\n`);
for (const { d, why, pre } of hits) {
  console.log(`  ${String(d.id).padEnd(13)} [${layer(d)}]  ${d.categorySlug}`);
  console.log(`     why    : ${why[0]}`);
  console.log(`     PREFIX : ${pre.slice(0, 104)}`);
  console.log(`     recites: ${(d.arabic.split("((")[1] || "(no delimiter — whole field is prefix)").slice(0, 90)}`);
  console.log("");
}

console.log("=".repeat(96));
console.log(`QUR'ANIC RECORDS WHERE THE SUPPLICATION IS A SUB-CLAUSE OF THE VERSE — ${quranNarrative.length}`);
console.log("=".repeat(96));
console.log("Not leakage. The Arabic block renders the whole verse, so the narrative frame");
console.log("is presented as part of the dua. Affects Block A and the Arabic block.\n");
for (const d of quranNarrative) {
  const gate = d.build_gate ? ` build_gate=${d.build_gate}` : "";
  console.log(`  ${String(d.id).padEnd(13)} [${layer(d)}]${gate}`);
  console.log(`     ${(d.translation || "").slice(0, 130)}`);
}

console.log("\n" + "=".repeat(96));
console.log(`RECORDS WITH NO ARABIC — ${noArabic.length}`);
console.log("=".repeat(96));
for (const d of noArabic) console.log(`  ${String(d.id).padEnd(13)} [${layer(d)}]  ${(d.translation || "").slice(0, 90)}`);

console.log("\n" + "-".repeat(96));
console.log(`SUMMARY  arabic-narration=${hits.length}  quran-subclause=${quranNarrative.length}  no-arabic=${noArabic.length}`);
console.log(`         of the arabic-narration hits, active=${hits.filter(h => layer(h.d) === "active").length} excluded=${hits.filter(h => layer(h.d) === "excluded").length}`);
console.log("Recall is unmeasured, as in the parent scan. These are lower bounds.");
