/* build-reviewer-package.mjs — READ ONLY. Emits doc/DUA-REVIEWER-PACKAGE.md.
 *
 * The Gate 1 / Gate 2 work package for a qualified reviewer who does not have the repo.
 * Everything needed to adjudicate is inlined: ids, Arabic, transliteration, translation,
 * chapter, citation. Sign-off columns are left blank for the reviewer to fill.
 *
 *   node scripts/build-reviewer-package.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

const corpus = JSON.parse(fs.readFileSync("src/data/dua/search-corpus.json", "utf8"));
const gate1 = JSON.parse(fs.readFileSync("src/data/dua/gate1-route-out.json", "utf8"));
const byId = Object.fromEntries(corpus.duas.map(d => [String(d.id), d]));
const excluded = new Set(corpus.meta.excluded.ids);

/* Track split per DUA-CONTENT-INTEGRITY-v1_0 Gate 2: Track A = occasion chapters,
   Track B = book-name chapters. Tested on the RAW label, which is how the split was
   originally measured. */
const BOOK_CHAPTER = /kitab\s*al|^the book on\b|^chapters on supplication\b/i;
const trackOf = (d) => String(d.id).startsWith("quran:") || BOOK_CHAPTER.test(d.category || "") ? "B" : "A";

const browse = corpus.duas.filter(d =>
  d.translation && d.entryType !== "guidance" && d.variantRole !== "variant");

const esc = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ").trim();

/* ── Arabic normalisation, used only to LOCATE a clause boundary. The text handed to the
   reviewer is always sliced out of the original, unmodified. 0653-0655 must be inside the
   stripped range or "لَّآ" fails to normalise to "لا". */
const DIAC = /[ً-ٰٕـۖ-ۭ‏‎]/;
function normalise(s) {
  let out = "", map = [];
  for (let i = 0; i < s.length; i++) {
    if (DIAC.test(s[i])) continue;
    let c = s[i];
    if ("أإآٱ".includes(c)) c = "ا";
    if (c === "ى") c = "ي"; if (c === "ة") c = "ه";
    out += c; map.push(i);
  }
  return { out, map };
}
const isQuranRec = (d) => String(d.id).startsWith("quran:");
const isClassB = (d) => !isQuranRec(d) && d.arabic && !d.arabic.includes("((") &&
  /حدثنا|أخبرنا|حدثني|أخبرني/.test(normalise(d.arabic).out);

/* All four extraction shapes come from the one module — this file must not carry its own
   copy of the rules, or the package and the build will drift. */
const clause = require(path.resolve("src/js/dua-clause-core.js"));

/* Anchors for SHAPE_VERSE_FROM_BUNDLE. The module refuses to guess which āyah a bundled
   record means, so the anchor is stated here per record and shown to the reviewer as part
   of what they are ruling on. */
const BUNDLE_ANCHORS = { "28:101": "ربنا لا تؤاخذنا" };
const extractFor = (d) => clause.extract(d, BUNDLE_ANCHORS[String(d.id)] ? { anchor: BUNDLE_ANCHORS[String(d.id)] } : undefined);

const parseCsv = (line) => { const o = []; let c = "", q = false;
  for (const ch of line) { if (ch === '"') q = !q; else if (ch === "," && !q) { o.push(c); c = ""; } else c += ch; }
  o.push(c); return o; };
const famRaw = fs.readFileSync("docs/seo/famous_named_duas_v2.csv", "utf8").split(/\r?\n/).filter(Boolean);
const FH = parseCsv(famRaw[0]), fcol = (n) => FH.indexOf(n);
const famRows = famRaw.slice(1).map(parseCsv);
const cite = (d) => d.hadithCitation
  ? `${d.hadithCitation.book || ""} ${d.hadithCitation.number || ""}`.trim() + (d.hadithCitation.narrator ? ` — ${d.hadithCitation.narrator}` : "")
  : (d.verseRef ? `Qur'an ${d.verseRef}` : "not recorded");

const out = [];
const P = (s = "") => out.push(s);

P("# Dua corpus — reviewer work package");
P("");
P("**For a qualified reviewer. No repository access required — every record is reproduced in full below.**");
P("");
P(`Generated from \`src/data/dua/search-corpus.json\` (${corpus.duas.length} records) and`);
P("`src/data/dua/gate1-route-out.json`. Governing spec: `DUA-CONTENT-INTEGRITY-v1_0.md`.");
P("");
P("Five independent asks. Each has its own table and its own sign-off column.");
P("Write directly in the **Reviewer ruling** and **Reviewer notes** columns; nothing else needs changing.");
P("");
P("Nothing in this package has been acted on. No page is being published on the strength of it.");
P("");
P("---");
P("");

/* ── Part 1 ────────────────────────────────────────────────────────────── */
const condemned = Object.entries(gate1.entries).filter(([, v]) => v.class === "condemned-speech");
P("## Part 1 — Condemned-speech route-out: second-signal confirmation");
P("");
P(`**${condemned.length} records.** Each was classified as speech the Qur'an quotes in order to report or`);
P("condemn it — not a supplication to recite. They are currently held `noindex` and are not");
P("published as duas.");
P("");
P("§1.5 of the spec requires that classification be confirmed against **a second independent");
P("signal — speaker attribution in the Arabic, or the surrounding ayat — rather than a single");
P("reading**, before any is routed out permanently. All are marked `secondSignalConfirmed: false`.");
P("");
P("> This cuts both ways: a page wrongly classified as condemned speech is removed for no reason.");
P("> If a record does **not** belong here, say so — that is as useful as confirming one.");
P("");
P("| # | Ref | Verse text (English) | Why it was flagged | **Reviewer ruling** (confirm / reject) | **Reviewer notes** |");
P("|---|---|---|---|---|---|");
condemned.forEach(([id, v], i) => {
  const d = byId[id];
  P(`| ${i + 1} | ${esc(v.ref)} | ${esc((d?.translation || "—").slice(0, 200))} | ${esc(v.reason)} | | |`);
});
P("");
P("### Arabic for Part 1");
P("");
P("Speaker attribution is usually visible in the Arabic, so it is given separately here at full length.");
P("");
condemned.forEach(([id, v]) => {
  const d = byId[id];
  P(`**${v.ref}** (\`${id}\`)`);
  P("");
  P("> " + (d?.arabic || "(no Arabic in record)"));
  P("");
});

/* ── Part 2 ────────────────────────────────────────────────────────────── */
P("---");
P("");
P("## Part 2 — Narrative-statement candidates");
P("");
P("**The spec states these are 19 records but does not enumerate them, and no register in the");
P("repository identifies them by id.** Deciding whether a passage is a supplication or a narrative");
P("statement is tafsir-level adjudication, which §1.3 explicitly places outside this project's");
P("competence. So this section does **not** claim to be \"the 19\".");
P("");
P("What follows is a **candidate pool built on one stated, mechanical signal**: the English reads as");
P("a third-person report or an instruction to a person, rather than as an address to Allah. It is");
P("offered as a starting set to narrow the reviewer's search, not as a finding. The true set may be");
P("larger or smaller, and membership here is not evidence of anything.");
P("");
P("§1.3 names `11:45` (Nuh's appeal, rebuked in the following verse) as the case where a");
P("plausible-looking reading produces a badly wrong page. It is included below where present.");
P("");

/* Mechanical signal only. No claim of correctness — the reviewer decides. */
const THIRD_PERSON = /^\s*\(?\s*(he |she |they |the prophet|the messenger|one should|whoever |get up|spit |say(?:ing)? ?:|it was narrated|allah said)/i;
const NO_PETITION = /^(?!.*\b(o allah|my lord|our lord|i seek|i ask|forgive|grant|guide me|protect|bless)\b)/i;
const cands = browse.filter(d => {
  const t = (d.translation || "").replace(/^[("'\[]+/, "");
  return THIRD_PERSON.test(t) && NO_PETITION.test(t.toLowerCase());
});
P(`Candidates surfaced: **${cands.length}**`);
P("");
P("| # | id | Chapter | English | Citation | **Reviewer ruling** (narrative / supplication) | **Notes** |");
P("|---|---|---|---|---|---|---|");
cands.forEach((d, i) => {
  P(`| ${i + 1} | \`${d.id}\` | ${esc((d.category || "").slice(0, 46))} | ${esc((d.translation || "").slice(0, 170))} | ${esc(cite(d))} | | |`);
});
P("");
P("### Arabic for Part 2");
P("");
cands.forEach(d => {
  P(`**\`${d.id}\`** — ${esc(d.category)}`);
  P("");
  P("> " + (d.arabic || "(no Arabic in record)"));
  P("");
});

/* ── Part 3 ────────────────────────────────────────────────────────────── */
P("---");
P("");
P("## Part 3 — Transliteration gap — 75 records, not the 38 previously quoted");
P("");
P("> ### ⚠ Workload change — please read before committing your time");
P("> An earlier estimate put this section at roughly **38** records. The correct figure is **75**.");
P("> The spec's Gate 2 figure (~28 for Track A) was measured before commit `2a7b68b` nulled 37");
P("> contaminated transliterations in the corpus; those records now have no transliteration at all,");
P("> so the gap grew by exactly 37. Adding the 10 newly ingested Qur'anic verses gives 75.");
P("> Nothing was hidden and nothing changed in the underlying texts — the earlier number was");
P("> simply stale. **This roughly doubles Part 3.** Parts 1, 2, 4 and 5 are unaffected.");
P("");
P("Gate 2 rule, unchanged from v1.1 §A1: **sourced or reviewed, never machine-generated and");
P("shipped unread; no page ships without it.**");
P("");
P("A transliteration is needed for each record below. It must come from a published edition the");
P("reviewer can name, or be written by the reviewer. We will not generate it.");
P("");

const gapA = browse.filter(d => trackOf(d) === "A" && !d.transliteration && !excluded.has(String(d.id)));
const gapNew = corpus.duas.filter(d => d.build_gate === "awaiting-original-rendering" && !d.transliteration);
const gapAExcluded = browse.filter(d => trackOf(d) === "A" && !d.transliteration && excluded.has(String(d.id)));

P(`- **Track A (occasion chapters), active: ${gapA.length}**`);
P(`- **Newly ingested Qur'anic verses: ${gapNew.length}** — added ${new Date().toISOString().slice(0, 10)} from quran.com edition 19 (Pickthall, public domain)`);
P(`- Track A but already routed out under Gate 1 (listed for completeness, **no work needed unless Part 1 reverses**): ${gapAExcluded.length}`);
P(`- **Total requiring a transliteration: ${gapA.length + gapNew.length}**`);
P("");
P("### 3a — Track A");
P("");
P("| # | id | Chapter | Arabic | English | **Transliteration (reviewer)** | **Source named** |");
P("|---|---|---|---|---|---|---|");
gapA.forEach((d, i) => {
  P(`| ${i + 1} | \`${d.id}\` | ${esc((d.category || "").slice(0, 40))} | ${esc(d.arabic)} | ${esc((d.translation || "").slice(0, 110))} | | |`);
});
P("");
P("### 3b — Newly ingested Qur'anic verses");
P("");
P("These carry `build_gate: awaiting-original-rendering` and cannot enter a sitemap until that is");
P("lifted. The English below is Pickthall (public domain), held as the corpus base — it is **not**");
P("the text that will publish.");
P("");
P("| # | id | Verse | Arabic | English (Pickthall, base only) | **Transliteration (reviewer)** | **Source named** |");
P("|---|---|---|---|---|---|---|");
gapNew.forEach((d, i) => {
  P(`| ${i + 1} | \`${d.id}\` | ${esc(d.verseRef)} | ${esc(d.arabic)} | ${esc((d.translation || "").slice(0, 110))} | | |`);
});
P("");
if (gapAExcluded.length) {
  P("### 3c — Track A, already routed out (no action unless Part 1 reverses a ruling)");
  P("");
  P("| id | Chapter | English |");
  P("|---|---|---|");
  gapAExcluded.forEach(d => P(`| \`${d.id}\` | ${esc((d.category || "").slice(0, 44))} | ${esc((d.translation || "").slice(0, 120))} |`));
  P("");
}

/* ── Part 4 ────────────────────────────────────────────────────────────── */
const classBAll = corpus.duas.filter(d => isClassB(d) && !excluded.has(String(d.id)));
const famResolved = famRows.map(f => {
  const cid = (f[fcol("corpus_id")] || "").trim();
  let d = cid ? byId[cid] : null;
  if (!d && f[fcol("content_type")] === "quran_verse") {
    const m = (f[fcol("source_ref")] || "").match(/(\d+):(\d+)/);
    if (m) d = byId[`quran:${m[1]}:${m[2]}`];
  }
  return { f, d, rank: Number(f[fcol("rank")]) };
});
const wave12ClassB = famResolved.filter(x => x.d && isClassB(x.d));

/* ── Part 4, widened ────────────────────────────────────────────────────────
   Originally "Class B only". One defect class per part turned out to be the wrong cut:
   a reviewer opening a record does not care which detector fired, they care that the
   Arabic field holds something other than the dua. All Arabic-field defects in Waves 1–2
   are now one part with one mental model. */
const NARR_PREFIX = [/^و?كان\s+(النبي|رسول|الرسول)/, /حدثنا|أخبرنا|حدثني|أخبرني/, /^و?عن\s+\S+/,
  /قال\s+رسول\s+الله|قال\s+النبي|^و?قال\s+صلى/, /سمعت\s+(رسول|النبي)/, /^و?كان\s/, /^قال\s+\S+/,
  /رضي\s+الله\s+عن(ه|ها|هم|هما)/, /^لما\s|^ركب\s|^طاف\s|^جعل\s/];
function arabicDefects(d) {
  const tags = [], ar = d.arabic || "";
  if (isClassB(d)) tags.push("full isnad stored in the Arabic field");
  const i = ar.indexOf("((");
  if (i > 0) {
    const pre = normalise(ar.slice(0, i)).out.trim();
    if (pre && NARR_PREFIX.some(rx => rx.test(pre))) tags.push("narrator's frame ahead of the dua");
  }
  const spans = (ar.match(/\(\(/g) || []).length;
  if (spans > 1) tags.push(`${spans} separate delimited duas in one record`);
  return tags;
}
const part4 = famResolved.filter(x => x.d && arabicDefects(x.d).length).sort((a, b) => a.rank - b.rank);
const transDefect = famResolved.filter(x => x.d &&
  /^\(?\s*(place your hand|spit |get up|say(?:ing)? ?:|one should|he should|recited after)/i
    .test((x.d.translation || "").replace(/^[("'\[]+/, "")));

P("---");
P("");
P("## Part 4 — Arabic-field defects, Waves 1–2");
P("");
P("Some records hold something other than the supplication in their Arabic field. The English");
P("field is usually correct; the Arabic is not. A page built from these would show a reader a");
P("chain of narrators, or a narrator's framing sentence, or two different duas run together, as");
P("the words to recite.");
P("");
P("**This part was previously scoped to one defect (records carrying a full isnad). That was the");
P(`wrong cut** — you would have met the other shapes cold in a later batch. All **${part4.length}** affected`);
P("rows across Waves 1–2 are now here, whichever detector found them.");
P("");
P("| # | Rank | id | Defect | English (believed correct) | Proposed Arabic | Confidence | **Correct? (Y/N)** | **Corrected Arabic** |");
P("|---|---:|---|---|---|---|---|---|---|");
part4.forEach((x, i) => {
  const e = extractFor(x.d);
  P(`| ${i + 1} | ${x.rank} | \`${x.d.id}\` | ${esc(arabicDefects(x.d).join("; "))} | ${esc((x.d.translation || "").slice(0, 110))} | ${esc(e.ok ? e.text : "—")} | ${e.confidence}${e.confidence === "low" ? " ⚠" : ""} | | |`);
});
P("");
P("**⚠ Every `low` row above is a guess you are being asked to overrule or confirm, not a");
P("proposal we have confidence in.** Three worked examples of why the delimiter cannot be trusted:");
P("");
P("- `96:207` (rank 20) — the takbīr and Qur'anic opening that sit *before* the delimiter are part");
P("  of the travel dua. Dropping them removes half the supplication.");
P("- `26:74` (rank 17) — the *only* delimited span is the instruction (\"let him pray two rakʿahs,");
P("  then let him say…\"). The istikhāra dua itself is not inside it.");
P("- `13:20` (rank 19) — here the pre-delimiter text genuinely is an instruction and dropping it is");
P("  correct. Same structure, opposite answer.");
P("");
P(`There are **${classBAll.length}** isnad-carrying records in the corpus in total. Only the ${part4.filter(x => isClassB(x.d)).length} needed for`);
P(`Waves 1–2 appear here; the remaining **${classBAll.length - part4.filter(x => isClassB(x.d)).length}** belong to Wave 3–4 chapter pages and are`);
P("deliberately held back. Please do not work ahead of this table.");
P("");
if (transDefect.length) {
  P("### 4b — translation-field defect");
  P("");
  P("Same effect, different field: the English opens with an instruction rather than the dua.");
  P("");
  P("| Rank | id | Translation as stored |");
  P("|---:|---|---|");
  transDefect.forEach(x => P(`| ${x.rank} | \`${x.d.id}\` | ${esc((x.d.translation || "").slice(0, 190))} |`));
  P("");
}
P("**Full source text for every row above, so each extraction can be checked in context:**");
P("");
part4.concat(transDefect.filter(t => !part4.some(p => p.rank === t.rank))).forEach(x => {
  P(`**\`${x.d.id}\`** (rank ${x.rank}) — ${esc(x.d.category)} — ${esc(cite(x.d))}`);
  P("");
  P("> " + (x.d.arabic || "(no Arabic in record)"));
  P("");
});

/* ── Part 5 ────────────────────────────────────────────────────────────── */
const quranFam = famResolved.filter(x => x.f[fcol("content_type")] === "quran_verse");
P("---");
P("");
P("## Part 5 — Qur'anic full-ayah rows: the supplication clause");
P("");
P(`**${quranFam.length} rows.** These records store the **complete āyah**. In most, the supplication is one`);
P("clause inside a longer narrative verse — `21:83` opens *\"And Job, when he cried unto his Lord\"*,");
P("and the dua proper begins several words later. An Arabic block rendering the whole āyah presents");
P("narrative as the words to recite.");
P("");
P("A rule was tested: locate the first vocative or address marker (`رَبَّنَا`, `رَبِّ`, `اللَّهُمَّ`,");
P("`حَسْبُنَا`, `لَا إِلَٰهَ إِلَّا أَنتَ`, …) and take the clause from there. It was checked against the");
P("transliterated incipit recorded independently in our keyword table.");
P("");
P("**It agreed with the expected incipit on 24 of 25 resolvable rows.** The proposal below is");
P("therefore likely to be right — but *likely* is not the standard this content is held to, so every");
P("row still needs your eye.");
P("");
P("### How your time splits on this part");
P("");
P("| | Rows | What you are doing |");
P("|---|---:|---|");
P("| Rule proposed a clause and it is probably right | **24** | **Checking** — read the proposal against the full āyah and accept or correct it |");
P("| Rule cannot help | **2** (ranks 1 and 3) | **Transcribing** — the clause has to be established by hand |");
P("");
P("The two hand rows are ranks 1 and 3, explained immediately below.");
P("");
P("> **A note on scope, so the numbers reconcile.** Five Wave 1 rows in total need hand treatment:");
P("> ranks **1, 3, 17, 19, 20**. Only **1 and 3** are Qur'anic and appear here; **17, 19 and 20** are");
P("> hadith records and are in Part 4. Across the whole famous-50 the hand-treatment count is 8 —");
P("> 7 `prefix-trim` (ranks 1, 17, 19, 20, 23, 34, 48) plus 1 `verse-from-bundle` (rank 3). If you");
P("> were told \"5 rows, all prefix-trim\", the set was right for Wave 1 but the label was not:");
P("> rank 3 is a different shape, and ranks 23, 34 and 48 are the same shape in Wave 2.");
P("");
P("### Two rows are a different shape — please read these first");
P("");
P("Most rows below are one supplication inside one verse. **Ranks 1 and 3 are not**, and each is the");
P("only example of its kind in this wave. They are shown here as worked examples so the shape is");
P("familiar when it recurs at scale in a later batch, rather than being met cold.");
P("");
const worked = [
  ["1", "27:75", "prefix trim",
   "Ayat al-Kursi is printed after a taʿawwudh (*A'ūdhu billāhi min ash-shayṭān ir-rajīm*). The taʿawwudh is said before reciting; it is not part of 2:255. It is also a declarative verse, not a petition, so the vocative rule correctly finds nothing to extract — the fix is to remove a prefix, not to locate a clause."],
  ["3", "28:101", "one verse from a bundle",
   "2:286 is stored together with 2:285 in a single record (the two closing verses of al-Baqarah, recited before sleeping). Taking the first vocative marker lands at the **end of 2:285** — *rabbanā wa ilayka al-maṣīr* — which is the wrong verse. The extractor therefore refuses to choose and requires an anchor naming the target verse's opening words. The anchor used is shown in the table."],
];
worked.forEach(([rank, id, shape, why]) => {
  P(`**Rank ${rank} — \`${id}\` — ${shape}**`);
  P("");
  P(why);
  P("");
  const d = byId[id];
  if (d) {
    const e = extractFor(d);
    P(`- Stored text: ${esc((d.arabic || "").slice(0, 220))}`);
    if (e.ok) {
      P(`- Proposed recitable portion: ${esc(e.text)}`);
      P(`- How: ${esc(e.via)}${e.removed ? " — removed: " + esc(e.removed) : ""}${e.anchor ? " — anchor: " + esc(e.anchor) : ""}`);
    } else P(`- Extractor declined: ${esc(e.why)}`);
    P("");
  }
});
P("| # | Rank | id | Verse | Shape | Proposed clause | % of record | How located | **Correct? (Y/N)** | **Corrected clause** |");
P("|---|---|---|---|---|---|---|---|---|---|");
quranFam.sort((a, b) => a.rank - b.rank).forEach((x, i) => {
  if (!x.d) {
    const m = (x.f[fcol("source_ref")] || "").match(/(\d+):(\d+)/);
    P(`| ${i + 1} | ${x.rank} | — | Qur'an ${m ? m[1] + ":" + m[2] : "?"} | — | **NOT IN CORPUS AS ITS OWN RECORD** | — | — | | |`);
    return;
  }
  const e = extractFor(x.d);
  const pct = e.ok ? Math.round(100 * e.text.length / (x.d.arabic || "").length) : 0;
  P(`| ${i + 1} | ${x.rank} | \`${x.d.id}\` | ${esc(x.d.verseRef || x.f[fcol("source_ref")])} | ${esc(e.shape || "—")} | ${esc(e.ok ? e.text : e.why)} | ${e.ok ? pct + "%" : "—"} | ${esc(e.ok ? e.via : "—")} | | |`);
});
P("");
P("**Full āyah text for each, for comparison:**");
P("");
quranFam.forEach(x => {
  if (!x.d) return;
  P(`**\`${x.d.id}\`** — Qur'an ${x.d.verseRef}`);
  P("");
  P("> " + (x.d.arabic || ""));
  P("");
});

P("---");
P("");
P("## Sign-off");
P("");
P("| | Name | Credentials | Date | Signature |");
P("|---|---|---|---|---|");
P("| Part 1 — condemned-speech confirmation | | | | |");
P("| Part 2 — narrative-statement ruling | | | | |");
P("| Part 3 — transliteration | | | | |");
P("| Part 4 — Class B Arabic (Wave 1–2) | | | | |");
P("| Part 5 — Qur'anic clause extraction | | | | |");
P("");
P("The reviewer's name and credentials appear on the site once any part is signed off");
P("(`DUA-SEO-STRATEGY-v2.md` §6). Please confirm you are content for them to be published.");

fs.writeFileSync("doc/DUA-REVIEWER-PACKAGE.md", out.join("\n") + "\n");
console.log(`doc/DUA-REVIEWER-PACKAGE.md written`);
console.log(`  Part 1 condemned-speech      : ${condemned.length}`);
console.log(`  Part 2 narrative candidates  : ${cands.length}  (candidate pool, NOT "the 19")`);
console.log(`  Part 3a Track A translit gap : ${gapA.length}`);
console.log(`  Part 3b new Qur'anic verses  : ${gapNew.length}`);
console.log(`  Part 3c routed-out (no work) : ${gapAExcluded.length}`);
console.log(`  TOTAL transliterations needed: ${gapA.length + gapNew.length}`);
console.log(`  Part 4 Arabic-field defects  : ${part4.length}  (${part4.filter(x => isClassB(x.d)).length} isnad of ${classBAll.length} in corpus; ${classBAll.length - part4.filter(x => isClassB(x.d)).length} held for Wave 3-4)`);
console.log(`  Part 4b translation defects  : ${transDefect.length}`);
console.log(`  Part 5 Qur'anic full-ayah    : ${quranFam.length}  (${quranFam.filter(x => !x.d).length} not in corpus as own record)`);
