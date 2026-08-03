/* build-wave1-readiness.mjs — READ ONLY. Emits doc/DUA-WAVE-1-READINESS.md.
 *
 * The one-page statement Session 4 is held against. Generated from the corpus, the famous-dua
 * CSV and the clause module, so it cannot drift from the data the way a hand-written status
 * table does.
 *
 *   node scripts/build-wave1-readiness.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

const corpus = JSON.parse(fs.readFileSync("src/data/dua/search-corpus.json", "utf8"));
const gate1 = JSON.parse(fs.readFileSync("src/data/dua/gate1-route-out.json", "utf8"));
const clause = require(path.resolve("src/js/dua-clause-core.js"));
const byId = Object.fromEntries(corpus.duas.map(d => [String(d.id), d]));
const excluded = new Set(corpus.meta.excluded.ids);
const BUNDLE_ANCHORS = { "28:101": "ربنا لا تؤاخذنا" };

const parse = (l) => { const o = []; let c = "", q = false;
  for (const ch of l) { if (ch === '"') q = !q; else if (ch === "," && !q) { o.push(c); c = ""; } else c += ch; }
  o.push(c); return o; };
const raw = fs.readFileSync("docs/seo/famous_named_duas_v2.csv", "utf8").split(/\r?\n/).filter(Boolean);
const H = parse(raw[0]), col = (n) => H.indexOf(n);
/* All non-dropped rows, not just build_wave 1. The wave a row was ASSIGNED is a keyword
   judgement made before any of the integrity work; the wave it can actually ship in is a
   property of its record. This document reports the second. */
const rows = raw.slice(1).map(parse).filter(f => f[col("build_status")] !== "dropped");

/* Defect signals, each independently determined from the record rather than from the CSV. */
const norm = (s) => clause.normalise(String(s || "")).out;
const NARRATION_PREFIX = [/^و?كان\s+(النبي|رسول|الرسول)/, /حدثنا|أخبرنا|حدثني|أخبرني/, /^و?عن\s+\S+/,
  /قال\s+رسول\s+الله|قال\s+النبي|^و?قال\s+صلى/, /سمعت\s+(رسول|النبي)/, /^و?كان\s/, /^قال\s+\S+/,
  /رضي\s+الله\s+عن(ه|ها|هم|هما)/, /^لما\s|^ركب\s|^طاف\s|^جعل\s/];
function prefixDefect(d) {
  const ar = d.arabic || ""; const i = ar.indexOf("((");
  if (i <= 0) return false;
  const pre = norm(ar.slice(0, i)).trim();
  return !!pre && NARRATION_PREFIX.some(rx => rx.test(pre));
}
const instructionInTranslation = (d) =>
  /^\(?\s*(place your hand|spit |get up|say(?:ing)? ?:|one should|he should|recited after)/i
    .test((d.translation || "").replace(/^[("'\[]+/, ""));

const out = [];
const P = (s = "") => out.push(s);
const esc = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ").trim();

P("# Wave readiness statement — all 48 famous-dua rows");
P("");
P(`Generated ${new Date().toISOString().slice(0, 10)} from \`search-corpus.json\` (${corpus.duas.length} records),`);
P("`famous_named_duas_v2.csv` and `src/js/dua-clause-core.js`. Regenerate with");
P("`node scripts/build-wave1-readiness.mjs` — do not hand-edit, it will drift.");
P("");
P("**This is the document Session 4 is held against.** A row may not be built unless its");
P("*Remaining* column is empty.");
P("");
P("> ## This document is the source of truth for wave membership");
P("> ");
P("> **The `build_wave` column in `docs/seo/famous_named_duas_v2.csv` is SUPERSEDED.** It records a");
P("> keyword-priority judgement made before any record was inspected. Where it and the");
P("> `wave_assignment` column below disagree — and they disagree substantially — **this document");
P("> governs**. Rank order does not govern the build sequence.");
P("> ");
P("> **The `1a` set below is an upper bound, further narrowed by**");
P("> **[`DUA-WAVE-1A-GATE-EVIDENCE.md`](DUA-WAVE-1A-GATE-EVIDENCE.md).** This generator tests what");
P("> is mechanically testable from the record. That document tests each `1a` row against Gates 1, 2");
P("> and 3 individually and **drops `49:148`, `60:165` and `85:196`**, leaving **10**. Where the two");
P("> disagree, the evidence document governs, and no row may be built on this document alone.");
P("");
P("## wave_assignment");
P("");
P("The `build_wave` column in the CSV records a **keyword-priority** judgement made before any of");
P("the integrity work. `wave_assignment` here records what the **record can actually support**.");
P("They disagree substantially, and where they do, this column governs.");
P("");
P("| Value | Meaning |");
P("|---|---|");
P("| `1a` | Buildable today. No extraction, no reviewer dependency, no Gate 1/2/3 remediation. |");
P("| `1b` | Was assigned Wave 1, but needs reviewer sign-off before it can be built. |");
P("| `2` | Assigned Wave 2 and also carries outstanding items. |");
P("| `blocked` | Carries a defect that is not merely a review — see the row's `status_note`. |");
P("");

const recs = rows.map(f => {
  const rank = Number(f[col("rank")]);
  const cid = (f[col("corpus_id")] || "").trim();
  const d = cid ? byId[cid] : null;
  const status = f[col("build_status")];
  const ex = d ? clause.extract(d, BUNDLE_ANCHORS[cid] ? { anchor: BUNDLE_ANCHORS[cid] } : undefined) : null;
  const shape = d ? (ex && ex.shape) || null : null;
  const gate1Hit = d && gate1.entries[cid];
  const blockers = [];
  if (!d) blockers.push("corpus record not found");
  if (status !== "ready") blockers.push(`status = ${status}`);
  if (d && excluded.has(cid)) blockers.push("record is in the Gate 1 excluded set");
  if (gate1Hit) blockers.push(`Gate 1 ${gate1Hit.class}, second signal ${gate1Hit.secondSignalConfirmed ? "confirmed" : "NOT confirmed"}`);
  if (shape) blockers.push(`clause extraction (${shape}) unverified`);
  if (d && prefixDefect(d)) blockers.push("Arabic opens with a narration prefix (Gate 3)");
  if (d && instructionInTranslation(d)) blockers.push("translation opens with an instruction, not the dua");
  if (d && !d.transliteration) blockers.push("no transliteration (Gate 2)");
  if (d && d.build_gate) blockers.push(`build_gate: ${d.build_gate}`);
  return { rank, name: f[col("dua_name")], cid, d, status, shape, ex, blockers,
           wave: Number(f[col("build_wave")]) };
});

const assign = (r) => r.status !== "ready" ? "blocked"
  : !r.blockers.length ? "1a"
  : r.wave === 1 ? "1b" : "2";
for (const r of recs) r.assignment = assign(r);
const ready = recs.filter(r => r.assignment === "1a");

P("## Summary");
P("");
P(`| wave_assignment | Rows |`);
P(`|---|---:|`);
for (const k of ["1a", "1b", "2", "blocked"])
  P(`| \`${k}\`${k === "1a" ? " — **buildable today**" : ""} | ${k === "1a" ? "**" + recs.filter(r => r.assignment === k).length + "**" : recs.filter(r => r.assignment === k).length} |`);
P(`| **total non-dropped** | **${recs.length}** |`);
P("");
P(`**${ready.length} rows are buildable today.** ${ready.length >= 12
  ? "That clears the 12-row threshold, so this set becomes Wave 1 and rank order stops governing the build sequence — a wave is only useful if it is large enough to read an index-rate signal from, and rank order was assigned before any record was inspected."
  : "That is below the 12-row threshold agreed for a wave that can produce a readable index-rate signal."}`);
P("");

P("## Wave 1a — buildable today");
P("");
P("Every row here needs no extraction, no reviewer dependency and no remediation. The");
P("qualifying test is the same for all of them: the record's Arabic field holds the supplication");
P("and nothing else, a transliteration is present, and no gate applies.");
P("");
P("| Rank | Dua | corpus_id | Why it qualifies |");
P("|---:|---|---|---|");
for (const r of ready.sort((a, b) => a.rank - b.rank)) {
  const ar = (r.d.arabic || "").trim();
  const why = [];
  why.push(ar.startsWith("((") ? "Arabic is a single delimited dua" : "Arabic is the dua text alone");
  why.push("transliteration present");
  if (!String(r.cid).startsWith("quran:")) why.push("not a full-āyah record");
  P(`| ${r.rank} | ${esc(r.name)} | \`${r.cid}\` | ${why.join("; ")} |`);
}
P("");

P("## All rows");
P("");
P("| Rank | wave_assignment | Dua | corpus_id | Extraction shape | Sign-off needed | Remaining |");
P("|---:|---|---|---|---|:--:|---|");
for (const r of recs.sort((a, b) => a.rank - b.rank)) {
  P(`| ${r.rank} | \`${r.assignment}\` | ${esc(r.name)} | \`${r.cid || "—"}\` | ${r.shape || "none"} | ${r.blockers.length ? "yes" : "no"} | ${esc(r.blockers.join("; ")) || "—"} |`);
}
P("");

P("## What each outstanding item means");
P("");
P("| Item | Who clears it | Where |");
P("|---|---|---|");
P("| `clause extraction (…) unverified` | reviewer | package Parts 4–5 |");
P("| `no transliteration (Gate 2)` | reviewer | package Part 3 |");
P("| `Arabic opens with a narration prefix` | reviewer, then a corpus edit | package Part 4 pattern |");
P("| `translation opens with an instruction` | reviewer, then a corpus edit | not yet in the package |");
P("| `build_gate: awaiting-original-rendering` | owner — original English rendering | — |");
P("| `Gate 1 …, second signal NOT confirmed` | reviewer | package Part 1 |");
P("| `status = blocked` | depends on the row's `status_note` | — |");
P("");

const shapes = {};
for (const r of recs) if (r.shape) shapes[r.shape] = (shapes[r.shape] || 0) + 1;
P("## Extraction shapes in Wave 1");
P("");
P("| Shape | Rows |");
P("|---|---:|");
for (const [k, v] of Object.entries(shapes)) P(`| \`${k}\` | ${v} |`);
P(`| none needed | ${recs.filter(r => !r.shape).length} |`);
P("");
P("Every extraction above is a **proposal**. `dua-clause-core.js` returns `verified: false` on");
P("every result it produces, and `DUA-PAGE-CONTENT-SPEC.md` §1.1 forbids rendering an unverified");
P("clause. Nothing has been written to the corpus.");

fs.writeFileSync("doc/DUA-WAVE-1-READINESS.md", out.join("\n") + "\n");
console.log("doc/DUA-WAVE-1-READINESS.md written");
const tally = {};
for (const r of recs) tally[r.assignment] = (tally[r.assignment] || 0) + 1;
console.log(`  rows: ${recs.length}   ${JSON.stringify(tally)}`);
console.log(`  1a (buildable today): ${ready.map(r => r.rank).join(", ")}`);
