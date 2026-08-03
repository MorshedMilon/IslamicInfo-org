/* validate-seo.mjs — RENDERED-OUTPUT test for the individual dua pages.
 *
 * Source of truth: DUA-SEO-STRATEGY-v2.md §5 (on-page template) and
 * DUA-PAGE-CONTENT-SPEC.md §6/§7. This file encodes those RULES; the CSV columns
 * (primary_keyword / title_tag / meta_description) are the pre-computed values the
 * rules produce per chapter.
 *
 * It reads the BUILT HTML from duas/ and re-derives every expectation independently
 * from chapter_keywords_v2.csv + the corpus. It deliberately shares NO code with
 * scripts/build-dua-pages.mjs — if the builder falls back to chapter_label, source
 * data, or any field other than the CSV's own columns, this test fails.
 *
 *   node scripts/validate-seo.mjs            # 5 fixture rows + full-library audit
 *   node scripts/validate-seo.mjs --fixtures # fixture rows only
 *
 * Exit code 1 on any failure.
 *
 * RULES ENCODED (§5)
 *   Title  {Primary keyword} – Arabic, Transliteration & Meaning        <=60
 *          degrade: "{KW} – Arabic & English Meaning" then "{KW}"
 *          brand suffix "| IslamicInfo.org" is DROPPED on individual dua pages
 *   H1     Primary keyword, natural language. MUST differ from every other H1.
 *   Meta   {KW} in Arabic with transliteration and English translation, with the
 *          source reference from {collection} and when to recite it.    <=155
 *   Arabic <... lang="ar" dir="rtl">   required
 *   Schema WebPage + BreadcrumbList. NO FAQPage. NO Article.
 *
 * KEYWORD SOURCE (DUA-PAGE-CONTENT-SPEC §7)
 *   keyword_rule = use_as_is                   -> the chapter's primary_keyword
 *   keyword_rule = derive_per_entry_from_...   -> derived from THIS dua's own English.
 *                  Never the chapter label, never the chapter keyword (that is what
 *                  produces 99 pages fighting over one phrase).
 *
 * UNIQUENESS
 *   A chapter keyword is shared by every dua in its chapter, so where a chapter holds
 *   more than one dua the page appends its own verified source reference. Owner
 *   decision 2026-08-02: keyword-led H1, disambiguated by source reference.
 */
import fs from "node:fs";
import path from "node:path";
/* The canonical provenance mapping (sourceKey -> display label). This is a DATA
   module, the same class of input as the CSV — not the builder's template logic —
   so the test stays independent of how pages are rendered. */
import SRC from "../src/js/dua-source-core.js";

const ROOT = process.cwd();
const P = (...a) => path.join(ROOT, ...a);

/* ---------- inputs ---------- */
const parseCsv = (line) => {
  const out = []; let cur = "", q = false;
  for (const ch of line) {
    if (ch === '"') q = !q;
    else if (ch === "," && !q) { out.push(cur); cur = ""; }
    else cur += ch;
  }
  out.push(cur); return out;
};
const csvLines = fs.readFileSync(P("docs/seo/chapter_keywords_v2.csv"), "utf8").split(/\r?\n/).filter(Boolean);
const HEAD = parseCsv(csvLines[0]);
const ix = (n) => { const i = HEAD.indexOf(n); if (i < 0) throw new Error("CSV column missing: " + n); return i; };
const CHAPTER = {};
for (const line of csvLines.slice(1)) {
  const r = parseCsv(line);
  CHAPTER[r[ix("chapter_slug")]] = {
    slug: r[ix("chapter_slug")], label: r[ix("chapter_label")],
    rule: r[ix("keyword_rule")], kw: r[ix("primary_keyword")].trim(),
    title: r[ix("title_tag")].trim(), desc: r[ix("meta_description")].trim(),
  };
}
const corpus = JSON.parse(fs.readFileSync(P("src/data/dua/search-corpus.json"), "utf8"));
const lock = JSON.parse(fs.readFileSync(P("src/data/dua/slugs.lock.json"), "utf8"));
const byId = Object.fromEntries(corpus.duas.map((d) => [String(d.id), d]));

/* How many BUILT pages each chapter actually has — the count that decides whether a
   shared chapter keyword needs a per-entry differentiator. Derived from what exists
   on disk, never from the CSV's duas_in_chapter (which counts corpus rows, not pages). */
const pagesPerChapter = {};
for (const [id, slug] of Object.entries(lock)) {
  if (!fs.existsSync(P("duas", slug + ".html"))) continue;
  const d = byId[id]; if (!d) continue;
  pagesPerChapter[d.categorySlug] = (pagesPerChapter[d.categorySlug] || 0) + 1;
}

/* ---------- §5 rules, re-derived independently of the builder ---------- */
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const TITLE_MAX = 60, META_MAX = 155;

/* The reference that distinguishes two duas inside one chapter. Verified corpus
   fields only — hadithCitation where present, else the Hisn chapter:entry id. */
function baseRef(d) {
  const hc = d.hadithCitation;
  if (hc && typeof hc === "object" && hc.book) return `${hc.book} ${hc.number}`.trim();
  if (typeof hc === "string" && hc.trim()) return hc.trim().split("(")[0].trim();
  return "Hisn al-Muslim " + String(d.id);
}
/* A citation shared by two records (9:15 and 85:196 both carry Riyad as-Salihin 152)
   does not identify a page, so the entry id is appended where it is shared. */
const refCount = {};
for (const [id, slug] of Object.entries(lock)) {
  if (!fs.existsSync(P("duas", slug + ".html"))) continue;
  const d = byId[id]; if (!d) continue;
  refCount[baseRef(d)] = (refCount[baseRef(d)] || 0) + 1;
}
const refOf = (d) => baseRef(d) + (refCount[baseRef(d)] > 1 ? " · " + String(d.id) : "");

function keywordFor(d) {
  const row = CHAPTER[d.categorySlug];
  if (!row) return { kw: null, rule: null, row: null };
  if (row.rule === "use_as_is" && row.kw) return { kw: row.kw, rule: row.rule, row };
  return { kw: null, rule: row.rule, row };   // derive_per_entry: page must NOT use a chapter keyword
}

/* Same shortening rule the template documents: where a stem will not fit §5's
   60-character ceiling the descriptive part gives way, never the source reference. */
const snipV = (s, n) => { const t = String(s || "").replace(/\s+/g, " ").trim();
  if (t.length <= n) return t;
  return t.slice(0, t.lastIndexOf(" ", n) > 0 ? t.lastIndexOf(" ", n) : n).replace(/[.,;:]$/, "") + "…"; };
function stemV(d, kw) {
  const ref = refOf(d), multi = (pagesPerChapter[d.categorySlug] || 0) > 1;
  if (kw && !multi) return snipV(cap(kw), TITLE_MAX - 2);
  const lead = kw ? cap(kw) : String(d.translation || "").replace(/^[("'“]+/, "");
  const wrap = (t) => (kw ? `${t} (${ref})` : `“${t}” (${ref})`);
  let budget = Math.max(12, TITLE_MAX - ref.length - (kw ? 3 : 5));
  let stem = wrap(snipV(lead, budget));
  while (stem.length > TITLE_MAX && budget > 12) { budget -= 2; stem = wrap(snipV(lead, budget)); }
  return stem;
}
function expectedH1(d) {
  const { kw } = keywordFor(d);
  if (!kw) return null;                                   // derive case, checked separately
  return stemV(d, kw);
}

function expectedTitle(d) {
  const { kw, row } = keywordFor(d);
  if (!kw) return null;
  const multi = (pagesPerChapter[d.categorySlug] || 0) > 1;
  // A chapter with exactly one page can use the CSV's pre-computed title verbatim.
  if (!multi && row.title) return row.title;
  const stem = stemV(d, kw);
  const long = " – Arabic, Transliteration & Meaning";
  const mid = " – Arabic & English Meaning";
  if ((stem + long).length <= TITLE_MAX && d.transliteration) return stem + long;
  if ((stem + mid).length <= TITLE_MAX) return stem + mid;
  return stem;
}

/* §5 meta formula, with the same documented degrade chain the ceiling forces.
   Re-derived here from the CSV + corpus; it shares no code with the builder. */
function expectedDesc(d) {
  const { kw, row } = keywordFor(d);
  if (!kw) return null;
  const multi = (pagesPerChapter[d.categorySlug] || 0) > 1;
  if (!multi && row.desc) return row.desc;
  const stem = stemV(d, kw);
  /* The collection named in the meta is the record's own sourceLabel — the same
     provenance the page's Source & authenticity block shows. A Hisn record that
     cites Abu Dawud is still presented as Hisn al-Muslim. */
  const coll = (SRC.assign(d) || {}).label || "Hisn al-Muslim";
  const t = !!d.transliteration;
  const full = `${stem} in Arabic with${t ? " transliteration and" : ""} English translation, with the source reference from ${coll} and when to recite it.`;
  const shortF = `${stem} in Arabic with${t ? " transliteration and" : ""} English translation, with its source reference from ${coll}.`;
  const bare = `${stem} in Arabic with English translation. Source: ${(SRC.assign(d) || {}).reference || coll}.`;
  for (const c of [full, shortF, bare]) if (c.length <= META_MAX) return c;
  return null;   // builder falls back to a snipped form; length is asserted separately
}

/* ---------- assertions against RENDERED html ---------- */
function readPage(slug) {
  const f = P("duas", slug + ".html");
  return fs.existsSync(f) ? fs.readFileSync(f, "utf8") : null;
}
const tagText = (h, re) => { const m = h.match(re); return m ? m[1].replace(/<[^>]+>/g, "").trim() : null; };
const decode = (s) => (s == null ? s : s
  .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
  .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&rsquo;/g, "’")
  .replace(/&ndash;/g, "–").replace(/&mdash;/g, "—").replace(/&nbsp;/g, " "));

function checkPage(id) {
  const slug = lock[id], d = byId[id];
  const fails = [];
  if (!slug || !d) return [`${id}: no slug or corpus record`];
  const html = readPage(slug);
  if (!html) return [`${id}: page not built (duas/${slug}.html)`];

  const row = CHAPTER[d.categorySlug];
  if (!row) return [`${id}: chapter '${d.categorySlug}' has no row in chapter_keywords_v2.csv`];

  const title = decode(tagText(html, /<title>([\s\S]*?)<\/title>/));
  const h1 = decode(tagText(html, /<h1[^>]*>([\s\S]*?)<\/h1>/));
  const desc = decode((html.match(/<meta name="description" content="([^"]*)"/) || [])[1] ?? null);

  const eT = expectedTitle(d), eH = expectedH1(d), eD = expectedDesc(d);

  if (eH !== null) {
    if (h1 !== eH) fails.push(`${id} H1\n      expected: ${JSON.stringify(eH)}\n      actual  : ${JSON.stringify(h1)}`);
    if (eT !== null && title !== eT) fails.push(`${id} TITLE\n      expected: ${JSON.stringify(eT)}\n      actual  : ${JSON.stringify(title)}`);
    if (eD !== null && desc !== eD) fails.push(`${id} META\n      expected: ${JSON.stringify(eD)}\n      actual  : ${JSON.stringify(desc)}`);
  } else {
    /* derive_per_entry chapter: the page must NOT be titled from the chapter label
       or from any chapter keyword — that is the 99-pages-one-phrase failure. */
    const lab = row.label.toLowerCase();
    if (h1 && h1.toLowerCase().startsWith(lab.slice(0, Math.min(24, lab.length))))
      fails.push(`${id} H1 uses the raw chapter_label on a derive_per_entry chapter\n      actual: ${JSON.stringify(h1)}`);
    if (title && title.toLowerCase().startsWith(lab.slice(0, Math.min(24, lab.length))))
      fails.push(`${id} TITLE uses the raw chapter_label on a derive_per_entry chapter\n      actual: ${JSON.stringify(title)}`);
  }

  /* §5 invariants that hold on every page regardless of keyword source */
  if (title && title.length > TITLE_MAX) fails.push(`${id} title ${title.length} chars > ${TITLE_MAX}`);
  if (title && /\|\s*IslamicInfo/i.test(title)) fails.push(`${id} brand suffix must be dropped on individual dua pages (§5)`);
  if (desc && desc.length > META_MAX) fails.push(`${id} meta ${desc.length} chars > ${META_MAX}`);
  if (!/lang="ar"[^>]*dir="rtl"|dir="rtl"[^>]*lang="ar"/.test(html)) fails.push(`${id} Arabic block missing lang="ar" dir="rtl" (§5)`);
  if (/FAQPage/.test(html)) fails.push(`${id} FAQPage schema present — §5 forbids it`);
  if (/"@type"\s*:\s*"Article"/.test(html)) fails.push(`${id} Article schema present — §5: do not emit Article on a reproduced text`);

  /* §5 BODY ORDER — asserted as a SEQUENCE, not merely as presence. The source
     citation belongs at position 4, directly after the English meaning and before the
     "when to recite it" prose; it previously rendered last, which presence-only checks
     could not see. Item 6 (unique-value block) is not yet built and is not asserted. */
  const seq = [
    ["Arabic block", /<[^>]*lang="ar"[^>]*dir="rtl"|<[^>]*dir="rtl"[^>]*lang="ar"/],
    ["transliteration", /class="tl"/],
    ["English meaning", /class="tr"/],
    ["source citation", /Source &amp; authenticity/],
    ["when-to-recite prose", /Context &amp; meaning|When &amp; how|>Reflection</],
  ];
  const at = seq.map(([name, re]) => ({ name, i: html.search(re) })).filter((x) => x.i >= 0);
  for (let i = 1; i < at.length; i++) {
    if (at[i].i < at[i - 1].i)
      fails.push(`${id} §5 body order: "${at[i].name}" renders before "${at[i - 1].name}"`);
  }
  const srcAt = at.findIndex((x) => x.name === "source citation");
  const proseAt = at.findIndex((x) => x.name === "when-to-recite prose");
  if (srcAt >= 0 && proseAt >= 0 && srcAt > proseAt)
    fails.push(`${id} §5 body order: source citation must precede the "when to recite it" prose`);

  /* §5 SCHEMA — the exact node set, by name. WebPage + BreadcrumbList and nothing
     else; ListItem is permitted only because BreadcrumbList requires it. */
  const ALLOWED_TOP = ["WebPage", "BreadcrumbList"];
  const ALLOWED_NESTED = new Set([...ALLOWED_TOP, "ListItem"]);
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  const top = [];
  for (const b of blocks) {
    let j; try { j = JSON.parse(b[1]); } catch { fails.push(`${id} unparseable JSON-LD`); continue; }
    for (const node of Array.isArray(j) ? j : [j]) if (node && node["@type"]) top.push(node["@type"]);
    for (const t of JSON.stringify(j).match(/"@type":"([^"]+)"/g) || []) {
      const name = t.slice(9, -1);
      if (!ALLOWED_NESTED.has(name)) fails.push(`${id} schema type "${name}" is not authorised — §5 allows WebPage + BreadcrumbList only`);
    }
  }
  const missing = ALLOWED_TOP.filter((t) => !top.includes(t));
  if (missing.length) fails.push(`${id} schema missing required node(s): ${missing.join(", ")}`);
  return fails;
}

/* ---------- 5 known fixture rows ---------- */
const FIXTURES = [
  ["28:100", "use_as_is, multi-dua chapter with a computed title_tag"],
  ["28:101", "same chapter — H1 must differ from 28:100"],
  ["6:10", "use_as_is, single-page chapter, title_tag EMPTY -> §5 formula"],
  ["27:75", "derive_per_entry chapter — must NOT take the chapter label/keyword"],
  ["15:22", "use_as_is, no transliteration -> title degrades"],
];

let failed = 0;
console.log("=".repeat(86));
console.log("FIXTURES — rendered-output assertions (DUA-SEO-STRATEGY-v2 §5)");
console.log("=".repeat(86));
for (const [id, why] of FIXTURES) {
  const f = checkPage(id);
  console.log(`\n  ${id}  ${why}`);
  if (!f.length) console.log("    PASS");
  else { failed += f.length; f.forEach((x) => console.log("    FAIL " + x)); }
}

if (!process.argv.includes("--fixtures")) {
  console.log("\n" + "=".repeat(86));
  console.log("FULL LIBRARY AUDIT");
  console.log("=".repeat(86));
  const byKind = {}; let pages = 0, bad = 0;
  const h1seen = new Map(), tseen = new Map();
  for (const [id, slug] of Object.entries(lock)) {
    if (!readPage(slug)) continue;
    pages++;
    const f = checkPage(id);
    if (f.length) {
      bad++;
      if (bad <= 3) { console.log(""); f.forEach((x) => console.log("  FAIL " + x)); }
      for (const x of f) { const k = (x.split("\n")[0].split(" ").slice(1, 3).join(" ")); byKind[k] = (byKind[k] || 0) + 1; }
    }
    const html = readPage(slug);
    const h1 = decode(tagText(html, /<h1[^>]*>([\s\S]*?)<\/h1>/)) || "";
    const t = decode(tagText(html, /<title>([\s\S]*?)<\/title>/)) || "";
    h1seen.set(h1, (h1seen.get(h1) || 0) + 1); tseen.set(t, (tseen.get(t) || 0) + 1);
  }
  console.log(`  pages audited      : ${pages}`);
  console.log(`  pages with failures: ${bad}`);
  console.log("  failures by kind:");
  for (const [k, v] of Object.entries(byKind).sort((a, b) => b[1] - a[1])) console.log(`    ${String(v).padStart(4)}  ${k}`);
  const dupH = [...h1seen.values()].filter((v) => v > 1).reduce((a, b) => a + b, 0);
  const dupT = [...tseen.values()].filter((v) => v > 1).reduce((a, b) => a + b, 0);
  console.log(`  pages sharing a duplicate H1   : ${dupH}   (§5: must be unique)`);
  console.log(`  pages sharing a duplicate title: ${dupT}`);
  failed += bad + dupH + dupT;
}

/* ---------- R1-R6 — docs/seo/VALIDATOR-RULES-SESSION-1.md ------------------------
   Owner directive 2026-08-03: these six were recorded as rules but implemented by
   nothing. Until now `validate-seo.mjs` asserted §5 naming, rendered-output shape,
   R8 and R9 only. Each is written here on R8/R9's pattern, and each was put through
   a negative control before being trusted — see the report in that document.

   READ THE VACUITY NOTES. Four of the six pass today because of what the published
   SET happens to contain, not because anything was enforcing them. That distinction
   is the whole reason they are being implemented before Wave 2 authoring rather
   than after: Wave 2 is precisely what changes the set. Each block below states
   whether it currently binds anything. */
{
  const rawCsv = (p) => {
    const L = fs.readFileSync(P(p), "utf8").split(/\r?\n/).filter(Boolean);
    const H = parseCsv(L[0]);
    return L.slice(1).map((l) => { const r = parseCsv(l); const o = {}; H.forEach((h, i) => (o[h] = (r[i] ?? "").trim())); return o; });
  };
  const FAMOUS = rawCsv("docs/seo/famous_named_duas_v2.csv");
  const HUBS = rawCsv("docs/seo/hub_pages_keywords_v2.csv");
  const CHAPTERS = rawCsv("docs/seo/chapter_keywords_v2.csv");

  const sitemap = fs.existsSync(P("sitemap.xml")) ? fs.readFileSync(P("sitemap.xml"), "utf8") : "";
  const sitemapDetail = new Set([...sitemap.matchAll(/<loc>[^<]*\/duas\/([^<"/]+)\.html<\/loc>/g)].map((m) => m[1]));
  const builtChapters = new Set(fs.existsSync(P("duas/chapter"))
    ? fs.readdirSync(P("duas/chapter")).filter((f) => f.endsWith(".html")).map((f) => f.replace(/\.html$/, "")) : []);

  let rFail = 0;
  const head = (n, t) => console.log("\n" + "=".repeat(86) + `\n${n} — ${t}\n` + "=".repeat(86));
  const verdict = (n, bad, note) => {
    console.log(bad ? `  ${n}: FAIL (${bad})` : `  ${n}: PASS${note ? "   " + note : ""}`);
    rFail += bad;
  };

  /* ---- R1 — `dropped` rows are excluded from the keyword claim set ---------------
     A famous row with build_status=dropped keeps its primary_keyword so the term
     stays parked and nobody silently reassigns it. It builds no page, so it must not
     count as a claimant — otherwise the first page that legitimately targets a parked
     term fails against a row that does not exist. */
  head("R1", "KEYWORD CLAIM SET EXCLUDES `dropped` ROWS");
  const claimants = [];
  for (const r of FAMOUS) if (r.build_status !== "dropped" && r.primary_keyword) claimants.push({ kw: r.primary_keyword.toLowerCase(), from: `famous rank ${r.rank}` });
  for (const r of HUBS) if (r.primary_keyword) claimants.push({ kw: r.primary_keyword.toLowerCase(), from: `hub ${r.slug}` });
  /* R2's limb: a chapter claims only where a page ACTUALLY exists — see below. */
  for (const r of CHAPTERS) if (builtChapters.has(r.chapter_slug) && r.primary_keyword) claimants.push({ kw: r.primary_keyword.toLowerCase(), from: `chapter ${r.chapter_slug}` });
  const kwMap = {};
  for (const c of claimants) (kwMap[c.kw] = kwMap[c.kw] || []).push(c.from);
  const r1collide = Object.entries(kwMap).filter(([, v]) => v.length > 1);
  for (const [k, v] of r1collide.slice(0, 6)) console.log(`  FAIL keyword "${k}" claimed by ${v.length}: ${v.join(" | ")}`);
  const droppedParked = FAMOUS.filter((r) => r.build_status === "dropped" && r.primary_keyword);
  console.log(`  claimants                 : ${claimants.length}`);
  console.log(`  distinct keywords         : ${Object.keys(kwMap).length}`);
  console.log(`  dropped rows parking a kw : ${droppedParked.length}  ${droppedParked.map((r) => JSON.stringify(r.primary_keyword)).join(", ")}`);
  verdict("R1", r1collide.length,
    droppedParked.length && !droppedParked.some((r) => kwMap[r.primary_keyword.toLowerCase()])
      ? "(VACUOUS TODAY: no parked term is contested, so the exclusion changes no outcome)" : "");

  /* ---- R2 — a chapter claims its keyword only when it gets a static page ---------
     Re-checked EVERY build, never once: flipping gets_static_chapter_page to `yes` is
     a one-character edit that silently creates a collision — exactly how two chapter
     pages became live collisions between earlier sessions. Claimancy above is derived
     from what is BUILT, not from the CSV flag, so the CSV cannot grant a claim to a
     page that does not exist. This block asserts the two sets agree. */
  head("R2", "CHAPTER CLAIMS ITS KEYWORD ONLY WHERE A PAGE EXISTS");
  const csvYes = new Set(CHAPTERS.filter((r) => r.gets_static_chapter_page === "yes").map((r) => r.chapter_slug));
  const builtNotFlagged = [...builtChapters].filter((s) => !csvYes.has(s));
  const flaggedNotBuilt = [...csvYes].filter((s) => !builtChapters.has(s));
  for (const s of builtNotFlagged.slice(0, 6)) console.log(`  FAIL chapter page exists but CSV gets_static_chapter_page != yes: ${s}`);
  const ghostClaims = CHAPTERS.filter((r) => flaggedNotBuilt.includes(r.chapter_slug) && r.primary_keyword)
    .filter((r) => kwMap[r.primary_keyword.toLowerCase()]);
  for (const r of ghostClaims.slice(0, 6)) console.log(`  FAIL chapter "${r.chapter_slug}" is flagged yes but NOT built, and its keyword "${r.primary_keyword}" is claimed by a real page`);
  console.log(`  chapter pages built       : ${builtChapters.size}`);
  console.log(`  CSV rows flagged yes      : ${csvYes.size}`);
  console.log(`  flagged yes, not built    : ${flaggedNotBuilt.length}  (drift — the CSV over-promises; not a failure on its own)`);
  console.log(`  built but not flagged yes : ${builtNotFlagged.length}`);
  verdict("R2", builtNotFlagged.length + ghostClaims.length);

  /* ---- R3 / R3a — no Arabic block from an unverified Class B or full-ayah record --
     Class B = hadith-collection record holding the whole narration incl. isnad:
     no `((` delimiter AND an isnad verb present after diacritic stripping.
     Full ayah = every `quran:` record; the supplication is often one clause of a
     longer verse. Neither may render an Arabic block until a reviewer-verified
     clause field exists on the record. */
  head("R3", "NO ARABIC BLOCK FROM AN UNVERIFIED CLASS B OR FULL-AYAH RECORD");
  const ISNAD = /حدثنا|أخبرنا|حدثني|أخبرني/;
  const stripDia = (s) => String(s || "").replace(/[ً-ْٰ]/g, "");
  const isClassB = (d) => !/\(\(/.test(d.arabic || "") && ISNAD.test(stripDia(d.arabic));
  const isQuranRec = (d) => /^quran:/.test(String(d.id));
  const verifiedClause = (d) => !!(d.dua_clause_arabic && d.dua_clause_verified === true);
  const indexedRecords = [];
  for (const [id, slug] of Object.entries(lock)) if (sitemapDetail.has(slug) && byId[id]) indexedRecords.push(byId[id]);
  const r3bad = indexedRecords.filter((d) => (isClassB(d) || isQuranRec(d)) && !verifiedClause(d));
  for (const d of r3bad.slice(0, 6)) console.log(`  FAIL ${d.id} indexed as ${isQuranRec(d) ? "full-ayah (quran:)" : "Class B (isnad)"} with no verified clause field`);
  const cbTotal = corpus.duas.filter(isClassB).length, qTotal = corpus.duas.filter(isQuranRec).length;
  console.log(`  indexed pages             : ${indexedRecords.length}`);
  console.log(`  corpus Class B / quran:   : ${cbTotal} / ${qTotal}`);
  console.log(`  offending indexed pages   : ${r3bad.length}`);
  verdict("R3", r3bad.length, r3bad.length === 0 && (cbTotal + qTotal) > 0
    ? `(VACUOUS TODAY: ${cbTotal + qTotal} such records exist but NONE is indexed — this passes by set composition, not enforcement)` : "");

  /* R3a — a verified clause must be PRESENTED as an extract, and its verification
     must be INTERNAL. Amended 2026-08-03 (owner ruling).

     The original third limb required the A2 note to "name the confirming reviewer".
     That is withdrawn. It collided with the public-credit-deferred decision taken on
     editorial-policy.html the same day: the site publishes no reviewer name, no
     institutional credit, anywhere in rendered HTML. Requiring one on every clause
     page would have reintroduced by the back door exactly what that decision removed
     from the front.

     The requirement is not dropped, it is RELOCATED. Verification still has to be
     real and traceable — it just lives internally:
       - `dua_clause_verified: true` is set ONLY by owner sign-off (ADR-044),
         recorded in doc/DUA-REVIEWER-PACKAGE.md;
       - the record id must appear in that package, so a `true` cannot be set by a
         code change alone and leave no trail;
       - and the rendered page must name NO reviewer at all.

     So the third limb inverts: what R3a once REQUIRED in the HTML, it now FORBIDS. */
  const clauseRendered = indexedRecords.filter(verifiedClause);
  const reviewerPkg = fs.existsSync(P("doc/DUA-REVIEWER-PACKAGE.md"))
    ? fs.readFileSync(P("doc/DUA-REVIEWER-PACKAGE.md"), "utf8") : "";
  const CREDIT = /\b(confirmed|reviewed|verified|approved|checked)\s+by\b|\breviewer:|\bcredential/i;
  let r3a = 0;
  for (const d of clauseRendered) {
    const html = readPage(lock[String(d.id)]); if (!html) continue;
    const labelled = /recitable portion|the portion recited|extract/i.test(html);
    const showsFull = /full (text|ayah|narration)|complete (verse|narration)/i.test(html);
    const namesShape = /extract|clause/i.test(html);
    // strip comments before the credit scan — a commented note is not rendered text
    const visible = html.replace(/<!--[\s\S]*?-->/g, "");
    const namesReviewer = CREDIT.test(visible);
    const traceable = reviewerPkg.includes(String(d.id));
    if (!labelled) { r3a++; console.log(`  FAIL R3a ${d.id} does not label the clause as the recitable portion`); }
    if (!showsFull) { r3a++; console.log(`  FAIL R3a ${d.id} does not show or link the full source text`); }
    if (!namesShape) { r3a++; console.log(`  FAIL R3a ${d.id} A2 note does not name the extraction shape`); }
    if (namesReviewer) { r3a++; console.log(`  FAIL R3a ${d.id} names a reviewer in rendered HTML — verification is internal only`); }
    if (!traceable) { r3a++; console.log(`  FAIL R3a ${d.id} is dua_clause_verified but appears nowhere in doc/DUA-REVIEWER-PACKAGE.md — a verified flag must be traceable to a sign-off`); }
  }
  console.log(`  R3a — pages rendering a verified clause: ${clauseRendered.length}`);
  verdict("R3a", r3a, clauseRendered.length === 0 ? "(VACUOUS: no record carries dua_clause_verified yet, so nothing can violate it)" : "");

  /* ---- R4 — build_gate blocks indexing regardless of batch approval -------------- */
  head("R4", "`build_gate` BLOCKS INDEXING WHATEVER THE BATCH SAYS");
  const gatedRecs = corpus.duas.filter((d) => d.build_gate && String(d.build_gate).trim());
  const r4bad = gatedRecs.filter((d) => sitemapDetail.has(lock[String(d.id)]));
  for (const d of r4bad.slice(0, 6)) console.log(`  FAIL ${d.id} carries build_gate="${d.build_gate}" but is in the sitemap`);
  const gates = {};
  for (const d of gatedRecs) gates[d.build_gate] = (gates[d.build_gate] || 0) + 1;
  console.log(`  records carrying build_gate: ${gatedRecs.length}  ${JSON.stringify(gates)}`);
  console.log(`  of those, in the sitemap   : ${r4bad.length}`);
  verdict("R4", r4bad.length, r4bad.length === 0 && gatedRecs.length > 0
    ? `(VACUOUS TODAY: all ${gatedRecs.length} gated records are unapproved anyway, so the gate is not what is holding them)` : "");

  /* ---- R5 — hub dua counts are rendered, never baked into a title ----------------
     duas_covered in the CSV is documentation, not truth: counts move whenever the
     occasion facet or the exclusion set changes. The assertion is the REVERSE of what
     you would expect — fail if a title_tag has a count baked back in. */
  head("R5", "NO DUA COUNT BAKED INTO A title_tag");
  const allRows = [...FAMOUS, ...HUBS, ...CHAPTERS];
  const r5bad = allRows.filter((r) => /\d+\s*\+?\s*Authentic Duas/i.test(r.title_tag || ""));
  for (const r of r5bad.slice(0, 6)) console.log(`  FAIL title_tag has a baked count: ${JSON.stringify(r.title_tag)}`);
  const withPhrase = allRows.filter((r) => /Authentic Duas/i.test(r.title_tag || "")).length;
  console.log(`  rows carrying "Authentic Duas": ${withPhrase}`);
  console.log(`  of those, with a leading count: ${r5bad.length}`);
  verdict("R5", r5bad.length, withPhrase > 0 ? "(BINDING: the phrase is in use, so a re-baked count would be caught)" : "");

  /* ---- R6 — identical scripture across two indexed pages ------------------------
     NORMALISATION IS THE RULE, NOT A DETAIL. The pair this was created for is not
     byte-identical and is NOT equal under the corpus's ordinary diacritic strip — it
     differs in Uthmani orthography. A rule written on "identical arabic" is a no-op
     against the exact pair it was seeded with. Folds: harakat + Qur'anic marks,
     tatweel, alef wasla, hamza+alef / alef madda, orthographic variance, the `((` ))
     recitation delimiters and ornate ayah brackets, whitespace. */
  head("R6", "IDENTICAL SCRIPTURE ON TWO INDEXED PAGES MUST BE ALLOWLISTED");
  const HARAKAT = /[ً-ْٰٓ-ٕۖ-ۭ]/g;
  const normAr = (s) => String(s || "")
    .replace(HARAKAT, "").replace(/ـ/g, "")
    .replace(/ٱ/g, "ا").replace(/ءا/g, "ا").replace(/آ/g, "ا")
    .replace(/[أإ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه")
    .replace(/[()\[\]{}﴾﴿«»"'’‘.،,؛;:!?]/g, "").replace(/\s+/g, " ").trim();
  const allowFile = fs.existsSync(P("src/data/dua/duplicate-scripture-allowlist.json"))
    ? JSON.parse(fs.readFileSync(P("src/data/dua/duplicate-scripture-allowlist.json"), "utf8")) : { allowed: [] };
  const allowedSets = (allowFile.allowed || []).map((a) => new Set(a.cluster.map(String)));
  const clusterMap = new Map();
  for (const d of corpus.duas) {            // corpus-wide, so a pair is registered before either is approved
    const k = normAr(d.arabic); if (!k) continue;
    if (!clusterMap.has(k)) clusterMap.set(k, []);
    clusterMap.get(k).push(String(d.id));
  }
  let r6bad = 0, r6live = 0;
  for (const [, ids] of clusterMap) {
    const live = ids.filter((id) => sitemapDetail.has(lock[id]));   // fails only when 2+ index AT ONCE
    if (live.length < 2) continue;
    r6live++;
    if (!allowedSets.some((s) => live.every((m) => s.has(m)))) {
      r6bad++;
      if (r6bad <= 6) console.log(`  FAIL cluster indexed together and not allowlisted: ${live.join(", ")}`);
    }
  }
  // sanity: the seed pair must compare equal, or the normalisation has regressed
  const seedA = byId["117:235"], seedB = byId["quran:2:201"];
  const seedOk = !seedA || !seedB || normAr(seedA.arabic) === normAr(seedB.arabic);
  if (!seedOk) { console.log("  FAIL normalisation regressed: 117:235 and quran:2:201 no longer compare equal"); r6bad++; }
  console.log(`  corpus clusters (2+ members): ${[...clusterMap.values()].filter((v) => v.length > 1).length}`);
  console.log(`  clusters with 2+ INDEXED    : ${r6live}`);
  console.log(`  allowlisted clusters        : ${allowedSets.length}`);
  console.log(`  seed-pair normalisation     : ${seedOk ? "equal ✓" : "REGRESSED"}`);
  verdict("R6", r6bad, r6live > 0 ? `(BINDING: ${r6live} clusters are live together and pass only because they are allowlisted)` : "");

  failed += rFail;
}

/* ---------- R8 — no published page may link to a page that does not ship ----------
   docs/seo/VALIDATOR-RULES-SESSION-1.md R8, owner instruction 2026-08-03.

   Only INDEXABLE detail pages are committed and copied into the deploy artifact. Held
   pages are built on disk but never published, so "the file exists locally" proves
   nothing about production. Before this rule, the hubs listed all 515 children while
   107 shipped: 408 links to files that were not in the artifact — 404s served from
   live hub pages, and crawl dead ends on exactly the pages meant to pass equity down.

   Both limbs are asserted, because either alone is a false pass:
     • present in the build artifact  — the file exists to be copied
     • indexable in page-copy.json    — the deploy actually copies it
   A page can satisfy the first and fail the second (every held page does), which is the
   case the earlier hub-count fix taught us to enforce rather than trust.

   Chapter pages are covered too. They are published, so they must not list held duas,
   and the D5 >=3 threshold must be computed on published children or a chapter page can
   outlive the pages that justified it. */
{
  console.log("\n" + "=".repeat(86));
  console.log("R8 — INTERNAL LINKS FROM PUBLISHED PAGES");
  console.log("=".repeat(86));

  const pageCopy = JSON.parse(fs.readFileSync(P("src/data/dua/page-copy.json"), "utf8"));
  const publishedSlug = (slug) => !!(pageCopy[slug] && pageCopy[slug].indexable === true);
  const exists = (rel) => fs.existsSync(P(rel));

  // the set of pages that actually ship, and therefore whose links must all resolve
  const shipped = [];
  for (const dir of ["duas/occasion", "duas/source", "duas/chapter"]) {
    if (!exists(dir)) continue;
    for (const f of fs.readdirSync(P(dir)).filter((x) => x.endsWith(".html"))) shipped.push(dir + "/" + f);
  }
  for (const slug of Object.keys(pageCopy)) {
    if (slug === "_meta" || !publishedSlug(slug)) continue;
    if (exists("duas/" + slug + ".html")) shipped.push("duas/" + slug + ".html");
  }

  let r8 = 0, links = 0;
  const kinds = { held: 0, missing: 0 };
  for (const p of shipped) {
    const html = fs.readFileSync(P(p), "utf8");
    for (const m of html.matchAll(/href="\/duas\/([^"]+\.html)"/g)) {
      const target = m[1];
      links++;
      const file = "duas/" + target;
      if (!exists(file)) {
        if (r8 < 10) console.log(`  FAIL ${p}\n         -> /duas/${target} : no such file`);
        r8++; kinds.missing++; continue;
      }
      // a detail page (not occasion/, source/, chapter/) must additionally be published
      if (!/^(occasion|source|chapter)\//.test(target)) {
        const slug = target.replace(/\.html$/, "");
        if (!publishedSlug(slug)) {
          if (r8 < 10) console.log(`  FAIL ${p}\n         -> /duas/${target} : built but NOT indexable in page-copy.json (does not ship)`);
          r8++; kinds.held++;
        }
      }
    }
  }
  console.log(`  published pages scanned : ${shipped.length}`);
  console.log(`  /duas/ links checked    : ${links}`);
  console.log(`  links to a held page    : ${kinds.held}`);
  console.log(`  links to a missing file : ${kinds.missing}`);
  if (r8 > 10) console.log(`  … and ${r8 - 10} more`);
  console.log(r8 ? `  R8: FAIL (${r8})` : "  R8: PASS");
  failed += r8;
}

/* ---------- R9 — hub card text must be the linked page's §5 name ------------------
   docs/seo/VALIDATOR-RULES-SESSION-1.md R9, owner instruction 2026-08-03.

   The occasion/source hubs are a SECOND render path for a page's name, and it was
   never covered by the §5 fixtures — those only ever opened detail pages. On
   2026-08-03 all 234 hub cards disagreed with the H1 of the page they linked to:
   every card read `chapterLabel — translationExcerpt` off the corpus record, so 154
   of them sat in 30 groups sharing one visible label (24 cards reading "Words of
   remembrance for morning and evening" on two separate hubs). The detail pages were
   correct the whole time — "Dua after wudu (Sunan Abi Dawud 525)" — which is what
   made it invisible: every existing assertion passed.

   Two limbs, and the second is what ties this to the CSV rather than to itself:
     • card text === the linked page's rendered H1   (the two paths agree)
     • card text === expectedH1(record)              (and they agree with §5)
   expectedH1 is null for `derive_per_entry` chapters, where §5 sets no fixed
   keyword; those fall back to the first limb, which checkPage() has already tied to
   the CSV independently. Uniqueness within a hub is asserted too, since a hub whose
   cards repeat one label is unusable regardless of where the label came from. */
{
  console.log("\n" + "=".repeat(86));
  console.log("R9 — LINK TEXT TO A DETAIL PAGE vs ITS §5 NAME");
  console.log("=".repeat(86));

  const slugToId = {};
  for (const [id, slug] of Object.entries(lock)) slugToId[slug] = String(id);

  /* SCOPE — every published page, not just the hubs. Scoping this to
     duas/occasion + duas/source was itself the bug's next hiding place: the first
     version of R9 passed clean while the "Related duas" rail on every DETAIL page
     was still emitting `chapterLabel — excerpt`, because relLabels() was a THIRD
     naming path and nothing looked at it. A rule that names one directory only
     tests that directory. */
  const pageCopy = JSON.parse(fs.readFileSync(P("src/data/dua/page-copy.json"), "utf8"));
  const sources = [];
  for (const dir of ["duas/occasion", "duas/source", "duas/chapter"]) {
    if (!fs.existsSync(P(dir))) continue;
    for (const f of fs.readdirSync(P(dir)).filter((x) => x.endsWith(".html"))) sources.push(dir + "/" + f);
  }
  for (const [slug, v] of Object.entries(pageCopy)) {
    if (slug === "_meta" || v.indexable !== true) continue;
    if (fs.existsSync(P("duas", slug + ".html"))) sources.push("duas/" + slug + ".html");
  }

  /* Two link shapes are legitimately NOT the page's name, and are exempted by name
     so the exemption is a decision rather than a gap:
       - "Open this dua →" on chapter pages: generic, the dua is rendered above it.
       - the ADDENDUM §15 prose link ("also listed in this library under <chapter>"),
         which is inside <p class="ed"> and is a sentence ABOUT the chapter. Its text
         is the chapter label by design; naming the page there would break the
         sentence. */
  const EXEMPT_TEXT = /^Open this dua$/;

  let cards = 0, vsH1 = 0, vsCsv = 0, dupes = 0, hubs = 0;
  const shown = [];
  {
    for (const rel of sources) {
      hubs++;
      const html = fs.readFileSync(P(rel), "utf8");
      const f = rel;
      const seen = new Map();
      // strip the §15 prose paragraphs before scanning; they are exempt by design
      const scan = html.replace(/<p class="ed">[\s\S]*?<\/p>/g, "");
      for (const m of scan.matchAll(/<a href="\/duas\/([^"/]+)\.html">([\s\S]*?)<\/a>/g)) {
        const slug = m[1];
        const text = decode(m[2].replace(/<[^>]+>/g, "").replace(/\s*&rarr;\s*$/, "").replace(/\s*→\s*$/, "").trim());
        if (EXEMPT_TEXT.test(text)) continue;
        if (slug === rel.replace(/^duas\//, "").replace(/\.html$/, "")) continue;  // self-link
        cards++;
        if (!seen.has(text)) seen.set(text, 0);
        seen.set(text, seen.get(text) + 1);

        const page = readPage(slug);
        if (!page) continue;                       // R8 owns "links a missing page"
        const h1 = decode(tagText(page, /<h1[^>]*>([\s\S]*?)<\/h1>/));
        if (text !== h1) {
          vsH1++;
          if (shown.length < 8) shown.push(`  FAIL ${f}\n         link: ${JSON.stringify(text)}\n         H1  : ${JSON.stringify(h1)}`);
        }
        const d = byId[slugToId[slug]];
        const eH = d ? expectedH1(d) : null;
        if (eH && text !== eH) {
          vsCsv++;
          if (shown.length < 8) shown.push(`  FAIL ${f}\n         link    : ${JSON.stringify(text)}\n         CSV §5  : ${JSON.stringify(eH)}`);
        }
      }
      for (const [, n] of seen) if (n > 1) dupes++;
    }
  }
  for (const s of shown) console.log(s);
  console.log(`  published pages scanned    : ${hubs}`);
  console.log(`  detail-page links checked  : ${cards}`);
  console.log(`  link text != linked H1     : ${vsH1}`);
  console.log(`  link text != CSV §5 H1     : ${vsCsv}`);
  console.log(`  duplicate labels on a page : ${dupes}`);
  const r9 = vsH1 + vsCsv + dupes;
  console.log(r9 ? `  R9: FAIL (${r9})` : "  R9: PASS");
  failed += r9;
}

/* ---------- R10 — a rendered transliteration must name its source ----------------
   docs/seo/VALIDATOR-RULES-SESSION-1.md R10, owner instruction 2026-08-03.

   Gate 2 requires a transliteration whose provenance is NAMED — sourced or
   reviewer-supplied, never machine-generated. Nothing enforced that, which is how
   54 live pages shipped carrying a romanisation traced to an anonymous 2019 JSON
   dump with no README, no licence and no stated scheme, stored upstream in a field
   called `LANGUAGE_ARABIC_TRANSLATED_TEXT`.

   The rule is deliberately about the SOURCE FIELD, not the text. A transliteration
   can be perfectly rendered and still fail this: unattributable is unattributable
   however clean it looks. Conversely, fixing the `AA` artifact would not satisfy
   R10 by itself — which is exactly the confusion this rule exists to prevent.

   Vacuous values are rejected explicitly. "see site-wide attribution" resolves to
   meta.attribution, which names the compilation, which is where the text came from
   — circular, and it identifies no transliterator. */
{
  console.log("\n" + "=".repeat(86));
  console.log("R10 — A RENDERED TRANSLITERATION MUST NAME ITS SOURCE");
  console.log("=".repeat(86));

  const VACUOUS = /^(|unknown|n\/?a|tbd|none|various|see site-wide attribution.*|site-wide.*)$/i;
  const named = (v) => typeof v === "string" && v.trim() !== "" && !VACUOUS.test(v.trim());

  const sitemapSlugs = new Set([...(fs.existsSync(P("sitemap.xml")) ? fs.readFileSync(P("sitemap.xml"), "utf8") : "")
    .matchAll(/<loc>[^<]*\/duas\/([^<"/]+)\.html<\/loc>/g)].map((m) => m[1]));

  /* RATCHET, not a flat assertion (owner decision 2026-08-03). 116 live pages
     already carried an unsourced transliteration when this rule was written, and a
     permanently-red validator is a validator nobody reads — a real new failure would
     hide inside the noise. So: the pre-existing set is frozen in a baseline file,
     printed on EVERY run so it cannot go quiet, and R10 fails only when a page
     appears OUTSIDE it. The debt cannot grow; it can only shrink. */
  const baseline = fs.existsSync(P("src/data/dua/transliteration-debt-baseline.json"))
    ? JSON.parse(fs.readFileSync(P("src/data/dua/transliteration-debt-baseline.json"), "utf8"))
    : { ids: [] };
  const known = new Set(baseline.ids || []);

  let live = 0, held = 0;
  const fresh = [], stillKnown = [];
  for (const [id, slug] of Object.entries(lock)) {
    const d = byId[id]; if (!d) continue;
    if (!d.transliteration || !String(d.transliteration).trim()) continue;   // nothing rendered, nothing to source
    if (named(d.transliterationSource)) continue;
    const isLive = sitemapSlugs.has(slug);
    isLive ? live++ : held++;
    if (!isLive) continue;
    known.has(id) ? stillKnown.push(id) : fresh.push(id);
  }
  const cleared = [...known].filter((id) => !stillKnown.includes(id));

  for (const id of fresh.slice(0, 8)) console.log(`  FAIL ${id} is a NEW live page rendering a transliteration with no named transliterationSource`);
  if (fresh.length > 8) console.log(`  … and ${fresh.length - 8} more`);
  console.log(`  records carrying a transliteration : ${corpus.duas.filter((d) => d.transliteration && String(d.transliteration).trim()).length}`);
  console.log(`  with a NAMED transliterationSource : ${corpus.duas.filter((d) => named(d.transliterationSource)).length}`);
  console.log(`  unsourced but held (not published) : ${held}`);
  console.log(`  KNOWN DEBT (baseline ${baseline._meta ? baseline._meta.frozen : "?"}) : ${stillKnown.length} live pages` +
    (cleared.length ? `   (${cleared.length} cleared since — baseline may be pruned)` : ""));
  console.log(`  NEW since the baseline             : ${fresh.length}`);
  if (stillKnown.length) {
    console.log("  ↳ known debt is NOT a pass: these pages render a romanisation with no");
    console.log("    attributable source (doc/DUA-PARKED-REVIEWER-QUESTIONS.md item 8). The");
    console.log("    ratchet stops it growing; it does not make it acceptable.");
  }
  console.log(fresh.length ? `  R10: FAIL (${fresh.length})` : "  R10: PASS");
  failed += fresh.length;
}

console.log("\n" + "-".repeat(86));
console.log(failed ? `RESULT: FAIL (${failed})` : "RESULT: PASS");
process.exitCode = failed ? 1 : 0;
