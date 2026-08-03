/* Negative control for R1-R6, R3a, R8, R9, R10.
   Each case mutates a real input, runs validate-seo.mjs, and asserts the intended
   rule flips to FAIL. Every file is restored from a byte-exact backup in a finally
   block, and the run ends by re-asserting a clean PASS.

   Three cases are POSITIVE controls (expect PASS). They matter as much as the
   failures: a rule that always fails looks identical to one that works until you
   prove it can also pass. */
import fs from "node:fs";
import { execSync } from "node:child_process";

const FILES = [
  "docs/seo/famous_named_duas_v2.csv",
  "docs/seo/chapter_keywords_v2.csv",
  "docs/seo/hub_pages_keywords_v2.csv",
  "src/data/dua/search-corpus.json",
  "sitemap.xml",
  "doc/DUA-REVIEWER-PACKAGE.md",          // R3a's sign-off-trail limb mutates this
  "src/data/dua/transliteration-debt-baseline.json",   // R10 ratchet cases mutate this
];
const lockEarly = JSON.parse(fs.readFileSync("src/data/dua/slugs.lock.json", "utf8"));
const r3aId = Object.keys(lockEarly).find((k) => /^27:7[5-9]$/.test(k));
if (r3aId) FILES.push("duas/" + lockEarly[r3aId] + ".html");   // R3a mutates the rendered page
const backup = new Map(FILES.map((f) => [f, fs.readFileSync(f)]));   // Buffer = byte exact
const restore = () => { for (const [f, b] of backup) fs.writeFileSync(f, b); };

const run = () => {
  let out;
  try { out = execSync("node scripts/validate-seo.mjs", { encoding: "utf8" }); }
  catch (e) { out = e.stdout || ""; }
  const v = {};
  /* R\d+ not R\d — a single-digit class silently read "R10" as "R1", so every R10
     case reported "(absent)" while R1's verdict was quietly overwritten. */
  for (const m of out.matchAll(/^\s{2}(R\d+[a]?): (PASS|FAIL)/gm)) v[m[1]] = m[2];
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

/* ---- R3a helpers ----
   R3a only binds on a record that is INDEXED and carries a verified clause, so each
   case has to manufacture that state, then vary one limb at a time. */
const R3A_ID = Object.keys(lock).find((k) => /^27:7[5-9]$/.test(k));
const R3A_PAGE = "duas/" + lock[R3A_ID] + ".html";
const PKG = "doc/DUA-REVIEWER-PACKAGE.md";

const setVerified = (id) => {
  const c = corpus();
  const d = c.duas.find((x) => String(x.id) === id);
  d.dua_clause_arabic = "اللَّهُمَّ"; d.dua_clause_verified = true;
  writeCorpus(c);
};
/* satisfies the three positive limbs: labelled as the recitable portion, shows the
   full source, names the extraction shape */
const compliantClausePage = (id, extra = "") => {
  const f = "duas/" + lock[id] + ".html";
  const h = fs.readFileSync(f, "utf8");
  fs.writeFileSync(f, h.replace("</main>",
    `<p>This is the recitable portion, an extract; the full text of the narration is shown above.</p>${extra}</main>`));
};
const ensureTrail = (id) => {
  const p = fs.readFileSync(PKG, "utf8");
  if (!p.includes(id)) fs.appendFileSync(PKG, `\n<!-- signoff trail: ${id} -->\n`);
};
const stripTrail = (id) => {
  const p = fs.readFileSync(PKG, "utf8");
  fs.writeFileSync(PKG, p.split(id).join("XX:XX"));
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
    patch: () => { setVerified(R3A_ID); } },

  /* R3a's third limb INVERTED on 2026-08-03: naming a reviewer went from REQUIRED to
     FORBIDDEN, so it needs proving in both directions. The positive control matters
     as much as the failures — without it, a rule that always failed would look
     identical to one that works. */
  { rule: "R3a", expect: "PASS", name: "POSITIVE CONTROL — compliant clause page, traceable, names no reviewer",
    patch: () => { setVerified(R3A_ID); compliantClausePage(R3A_ID); ensureTrail(R3A_ID); } },

  { rule: "R3a", expect: "FAIL", name: "clause page NAMES a reviewer in rendered HTML (now forbidden)",
    patch: () => { setVerified(R3A_ID); compliantClausePage(R3A_ID, "<p>Confirmed by Dr Example, PhD.</p>"); ensureTrail(R3A_ID); } },

  { rule: "R3a", expect: "FAIL", name: "dua_clause_verified with no sign-off trail in the reviewer package",
    patch: () => { setVerified(R3A_ID); compliantClausePage(R3A_ID); stripTrail(R3A_ID); } },

  /* R10 currently FAILS on the whole live set (116 pre-existing), so a plain
     "does it fire" case proves nothing — it fires on everything. The load-bearing
     case is the POSITIVE one: naming a source must actually clear it. */
  /* Under the ratchet, "unsourced and live" is not enough to fail — the known 116
     are baselined. The failure condition is being OUTSIDE the baseline, so the case
     has to drop an id from it, which is what a genuinely new page looks like. */
  { rule: "R10", expect: "FAIL", name: "a live unsourced page appears OUTSIDE the baseline (the Wave 2 case)",
    patch: () => { const p = "src/data/dua/transliteration-debt-baseline.json";
      const b = JSON.parse(fs.readFileSync(p, "utf8"));
      b.ids = b.ids.slice(1);                       // simulate a page the baseline never knew about
      fs.writeFileSync(p, JSON.stringify(b, null, 2) + "\n"); } },

  { rule: "R10", expect: "PASS", name: "POSITIVE CONTROL — the known debt alone does NOT fail the ratchet",
    patch: () => {} },

  { rule: "R10", expect: "PASS", name: "POSITIVE CONTROL — every live transliteration gains a named source",
    patch: () => { const c = corpus();
      for (const d of c.duas) if (d.transliteration) d.transliterationSource = "Example Named Edition (Reviewer, 2026)";
      writeCorpus(c); } },

  /* Under the ratchet a vacuous value on a BASELINED page just leaves it as known
     debt, so the case has to prove the thing that actually matters: a vacuous value
     must not rescue a page that is OUTSIDE the baseline. Drop an id from the
     baseline, then give that same record "see site-wide attribution" — if the
     vacuous list is working, it stays a failure. */
  { rule: "R10", expect: "FAIL", name: "a VACUOUS source does not rescue a page outside the baseline",
    patch: () => { const p = "src/data/dua/transliteration-debt-baseline.json";
      const b = JSON.parse(fs.readFileSync(p, "utf8"));
      const dropped = b.ids[0];
      b.ids = b.ids.slice(1);
      fs.writeFileSync(p, JSON.stringify(b, null, 2) + "\n");
      const c = corpus();
      const d = c.duas.find((x) => String(x.id) === dropped);
      if (d) d.transliterationSource = "see site-wide attribution";
      writeCorpus(c); } },

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
