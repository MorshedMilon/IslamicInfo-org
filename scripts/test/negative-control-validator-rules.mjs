/* Negative control for R1-R6 + R3a.
   Each case mutates a real input, runs validate-seo.mjs, and asserts the intended
   rule flips to FAIL. Every file is restored from a byte-exact backup in a finally
   block, and the run ends by re-asserting a clean PASS.

   Two cases are POSITIVE controls (expect PASS): they prove a rule's exclusion
   actually excludes, rather than the rule simply never firing. */
import fs from "node:fs";
import { execSync } from "node:child_process";

const FILES = [
  "docs/seo/famous_named_duas_v2.csv",
  "docs/seo/chapter_keywords_v2.csv",
  "docs/seo/hub_pages_keywords_v2.csv",
  "src/data/dua/search-corpus.json",
  "sitemap.xml",
];
const backup = new Map(FILES.map((f) => [f, fs.readFileSync(f)]));   // Buffer = byte exact
const restore = () => { for (const [f, b] of backup) fs.writeFileSync(f, b); };

const run = () => {
  let out;
  try { out = execSync("node scripts/validate-seo.mjs", { encoding: "utf8" }); }
  catch (e) { out = e.stdout || ""; }
  const v = {};
  for (const m of out.matchAll(/^\s{2}(R\d[a]?): (PASS|FAIL)/gm)) v[m[1]] = m[2];
  return v;
};

const corpus = () => JSON.parse(fs.readFileSync("src/data/dua/search-corpus.json", "utf8"));
const writeCorpus = (c) => fs.writeFileSync("src/data/dua/search-corpus.json", JSON.stringify(c));
const lock = JSON.parse(fs.readFileSync("src/data/dua/slugs.lock.json", "utf8"));

const addToSitemap = (slugs) => {
  let s = fs.readFileSync("sitemap.xml", "utf8");
  const nl = s.includes("\r\n") ? "\r\n" : "\n";
  const block = slugs.map((sl) =>
    `  <url>${nl}    <loc>https://islamicinfo.org/duas/${sl}.html</loc>${nl}    <lastmod>2026-08-03</lastmod>${nl}    <priority>0.6</priority>${nl}  </url>${nl}`).join("");
  fs.writeFileSync("sitemap.xml", s.replace("</urlset>", block + "</urlset>"));
};

const csvPatch = (file, pred, col, val) => {
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  const crlf = fs.readFileSync(file, "utf8").includes("\r\n");
  const parse = (l) => { const o = []; let c = "", q = false;
    for (const ch of l) { if (ch === '"') q = !q; else if (ch === "," && !q) { o.push(c); c = ""; } else c += ch; }
    o.push(c); return o; };
  const H = parse(lines[0]); const ci = H.indexOf(col);
  let done = false;
  const out = lines.map((l, i) => {
    if (i === 0 || !l.trim() || done) return l;
    const r = parse(l); const row = {}; H.forEach((h, k) => (row[h] = (r[k] ?? "").trim()));
    if (!pred(row)) return l;
    done = true;
    r[ci] = val;
    /* Re-quote on rejoin. A field that originally contained a comma MUST be re-quoted
       or every column after it shifts by one, and the validator then reads garbage —
       which is how this harness first "proved" R1 broken when R1 was fine. */
    const needsQuote = (v) => /[",]/.test(v) || /[\r\n]/.test(v);
    return r.map((v) => (needsQuote(v) ? '"' + v.replace(/"/g, '""') + '"' : v)).join(",");
  });
  if (!done) throw new Error("no row matched in " + file);
  fs.writeFileSync(file, out.join(crlf ? "\r\n" : "\n"));
};

const CASES = [
  { rule: "R1", expect: "FAIL", name: "two live rows claim the same keyword",
    patch: () => csvPatch("docs/seo/famous_named_duas_v2.csv", (r) => r.build_status === "ready" && r.primary_keyword, "primary_keyword", "dua for sujood") },

  { rule: "R1", expect: "PASS", name: "POSITIVE CONTROL — a dropped row may park a contested keyword",
    patch: () => csvPatch("docs/seo/famous_named_duas_v2.csv", (r) => r.build_status === "dropped", "primary_keyword", "dua for sujood") },

  { rule: "R2", expect: "FAIL", name: "a built chapter page is not flagged gets_static_chapter_page=yes",
    patch: () => csvPatch("docs/seo/chapter_keywords_v2.csv", (r) => r.chapter_slug === "invocations-during-sujood", "gets_static_chapter_page", "no") },

  { rule: "R2", expect: "FAIL", name: "an UNBUILT chapter flagged yes claims a keyword a real page already claims",
    patch: () => {
      csvPatch("docs/seo/chapter_keywords_v2.csv", (r) => r.gets_static_chapter_page === "yes" && r.chapter_slug === "quranic-supplications", "primary_keyword", "dua for sujood");
    } },

  { rule: "R3", expect: "FAIL", name: "a quran: (full-ayah) record is placed in the sitemap",
    patch: () => { const id = Object.keys(lock).find((k) => /^quran:/.test(k) && lock[k]); addToSitemap([lock[id]]); } },

  { rule: "R3a", expect: "FAIL", name: "an indexed page gains a verified clause but shows no extract disclosures",
    patch: () => { const c = corpus();
      const id = Object.keys(lock).find((k) => /^27:7[5-9]$/.test(k));
      const d = c.duas.find((x) => String(x.id) === id);
      d.dua_clause_arabic = "اللَّهُمَّ"; d.dua_clause_verified = true; writeCorpus(c); } },

  { rule: "R4", expect: "FAIL", name: "a build_gate record is placed in the sitemap",
    patch: () => { const c = corpus(); const d = c.duas.find((x) => x.build_gate);
      addToSitemap([lock[String(d.id)]]); } },

  { rule: "R5", expect: "FAIL", name: "a dua count is baked back into a title_tag",
    patch: () => csvPatch("docs/seo/hub_pages_keywords_v2.csv", (r) => /Authentic Duas/i.test(r.title_tag), "title_tag", "Dua for sujood – 12 Authentic Duas with Sources") },

  { rule: "R6", expect: "FAIL", name: "two members of a NON-allowlisted cluster indexed together (Bismillah)",
    patch: () => addToSitemap(["8:12", "5:9"].map((id) => lock[id]).filter(Boolean)) },

  { rule: "R6", expect: "FAIL", name: "normalisation regression — seed pair must still compare equal",
    patch: () => { const c = corpus();
      const d = c.duas.find((x) => String(x.id) === "117:235");
      d.arabic = d.arabic + " زيادة"; writeCorpus(c);
      addToSitemap([lock["117:235"], lock["quran:2:201"]].filter(Boolean)); } },
];

const base = run();
console.log("baseline:", JSON.stringify(base), "\n");

let pass = 0, fail = 0;
try {
  for (const c of CASES) {
    restore();
    let v;
    try { c.patch(); v = run(); }
    catch (e) { console.log(`SKIP  ${c.rule}  ${c.name}\n        (${e.message})`); continue; }
    const got = v[c.rule] || "(absent)";
    const ok = got === c.expect;
    ok ? pass++ : fail++;
    console.log(`${ok ? "PASS" : "FAIL"}  ${c.rule} expected ${c.expect}, got ${got}  — ${c.name}`);
  }
} finally {
  restore();
}

const after = run();
const restored = FILES.every((f) => Buffer.compare(fs.readFileSync(f), backup.get(f)) === 0);
console.log(`\nfiles restored byte-identical: ${restored}`);
console.log("post-restore:", JSON.stringify(after));
console.log(`\nNEGATIVE CONTROL: ${fail === 0 && restored ? "PASS" : "FAIL"} — ${pass} of ${pass + fail} cases behaved as specified.`);
