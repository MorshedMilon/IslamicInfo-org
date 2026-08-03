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
  console.log("R9 — HUB CARD TEXT vs §5 PAGE NAME");
  console.log("=".repeat(86));

  const slugToId = {};
  for (const [id, slug] of Object.entries(lock)) slugToId[slug] = String(id);

  let cards = 0, vsH1 = 0, vsCsv = 0, dupes = 0, hubs = 0;
  const shown = [];
  for (const dir of ["duas/occasion", "duas/source"]) {
    if (!fs.existsSync(P(dir))) continue;
    for (const f of fs.readdirSync(P(dir)).filter((x) => x.endsWith(".html"))) {
      hubs++;
      const html = fs.readFileSync(P(dir, f), "utf8");
      const seen = new Map();
      for (const m of html.matchAll(/<a href="\/duas\/([^"/]+)\.html">([\s\S]*?) &rarr;<\/a>/g)) {
        const slug = m[1], text = decode(m[2].replace(/<[^>]+>/g, "").trim());
        cards++;
        if (!seen.has(text)) seen.set(text, 0);
        seen.set(text, seen.get(text) + 1);

        const page = readPage(slug);
        if (!page) continue;                       // R8 owns "links a missing page"
        const h1 = decode(tagText(page, /<h1[^>]*>([\s\S]*?)<\/h1>/));
        if (text !== h1) {
          vsH1++;
          if (shown.length < 8) shown.push(`  FAIL ${dir}/${f}\n         card: ${JSON.stringify(text)}\n         H1  : ${JSON.stringify(h1)}`);
        }
        const d = byId[slugToId[slug]];
        const eH = d ? expectedH1(d) : null;
        if (eH && text !== eH) {
          vsCsv++;
          if (shown.length < 8) shown.push(`  FAIL ${dir}/${f}\n         card    : ${JSON.stringify(text)}\n         CSV §5  : ${JSON.stringify(eH)}`);
        }
      }
      for (const [, n] of seen) if (n > 1) dupes++;
    }
  }
  for (const s of shown) console.log(s);
  console.log(`  hub pages scanned          : ${hubs}`);
  console.log(`  cards checked              : ${cards}`);
  console.log(`  card text != linked H1     : ${vsH1}`);
  console.log(`  card text != CSV §5 H1     : ${vsCsv}`);
  console.log(`  duplicate labels in one hub: ${dupes}`);
  const r9 = vsH1 + vsCsv + dupes;
  console.log(r9 ? `  R9: FAIL (${r9})` : "  R9: PASS");
  failed += r9;
}

console.log("\n" + "-".repeat(86));
console.log(failed ? `RESULT: FAIL (${failed})` : "RESULT: PASS");
process.exitCode = failed ? 1 : 0;
