/* Generate the individual dua pages + chapter landing pages from the corpus.

   BUILD ORDER REVERSED 2026-08-03 — this script now runs FIRST:

     node scripts/build-dua-pages.mjs           # this: also writes page-names.json
     node scripts/build-dua-landing-pages.mjs   # then the hubs, labelled from it

   The old order existed only because the hub builder stripped every `/duas/` <url>
   from the sitemap and this script put them back. That is fixed — both scripts now
   replace only their own entries — and the hubs need this script's resolved H1s,
   which is why it has to go first.

   Writes duas/<categorySlug>-<idSlug>.html (506) and duas/chapter/<slug>.html,
   mints/reads src/data/dua/slugs.lock.json, maintains src/data/dua/page-state.json,
   writes src/data/dua/page-names.json (the ONE place a page's name is resolved),
   adds its own sitemap entries, and writes the QA reports into reports/dua/.

   Design: this reuses the *existing* landing-page design system verbatim — the same
   .top/.wrap/.hero/.crumb/.item/.ar/.tl/.tr/.meta/.also/.chips/.cta vocabulary that
   scripts/build-dua-landing-pages.mjs already emits. No new classes are introduced.
   Every authored section, including "Source & authenticity", is rendered with the
   existing `.also > h2 + .tr` pattern. See DESIGN_LOCK.md: tokens.css is linked
   before the page-local <style>.

   Content: sourced fields only — Arabic, transliteration (where it is genuinely
   romanised Arabic), translation, citation, and links derived from the corpus.
   Authored explication comes only from src/data/dua/page-copy.json, keyed by the
   frozen slug. No timing, repetition, reward or ruling is ever inferred.
   See doc/CONTENT-POLICY.md §5. */
import fs from 'node:fs';
import crypto from 'node:crypto';
import SRC from '../src/js/dua-source-core.js';
import REP from '../src/js/dua-repetition-core.js';
import FAQ from '../src/js/dua-faq-core.js';

// a repetition count stated by the Arabic text itself — never inferred.
// See src/js/dua-repetition-core.js for the whitelist and why it is so narrow.
const arabicCounts = REP.arabicCounts;

const ORIGIN = "https://islamicinfo.org", SITE = "IslamicInfo.org";
const TODAY = process.env.LASTMOD || new Date().toISOString().slice(0, 10);
const LOCK_PATH = "src/data/dua/slugs.lock.json";
const STATE_PATH = "src/data/dua/page-state.json";
const CHAPTER_MIN = 3; // DUA-URL-SCHEME.md D5
const REPORT_DIR = "reports/dua";

const readJson = (p, dflt) => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : dflt);

const c = readJson("./src/data/dua/search-corpus.json");

/* ── Gate 1 route-out (DUA-CONTENT-INTEGRITY-v1_0 §1.4, ADR-054) ────────────────
   45 pages rendered as duas that are not supplications a Muslim recites. The
   ruling is route out, not warn-and-keep: an on-page notice corrects the page and
   has no effect on the search result, because the SERP displays the title, and a
   page titled as a dua is received as a dua by everyone who never opens it.

   `removed`      no page is generated at all, and the entry disappears from the
                  hubs, the related rails and the sitemap. The corpus record is
                  left intact and the slug stays frozen in slugs.lock.json so it
                  can never be reissued to a different dua.
   `noindex-hold` the page is still generated but forced noindex,follow — see
                  indexDecision(). Provisional pending §1.5 second-signal
                  confirmation; not a final ruling. */
const gate1 = readJson("src/data/dua/gate1-route-out.json", { entries: {} });
const gate1Removed = new Set(
  Object.entries(gate1.entries).filter(([, v]) => v.status === "removed").map(([id]) => id));
const gate1Hold = new Map(
  Object.entries(gate1.entries).filter(([, v]) => v.status === "noindex-hold"));

const shown = c.duas.filter(d =>
  d.translation && d.entryType !== 'guidance' && !gate1Removed.has(d.id));
const browse = shown.filter(d => d.variantRole !== 'variant');
const variantsOf = {};
for (const d of shown) if (d.variantRole === 'variant' && d.variantGroup)
  (variantsOf[d.variantGroup] = variantsOf[d.variantGroup] || []).push(d);

const esc = (s) => String(s == null ? "" : s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const ldJson = (o) => JSON.stringify(o).replace(/</g, "\\u003c");
const sha = (s) => crypto.createHash("sha1").update(s).digest("hex").slice(0, 16);

/* ── slugs ─────────────────────────────────────────────────────────────────── */
// `27:75` -> hisn-27-75 | `quran:2:126` -> quran-2-126 | `nasai:5485` -> nasai-5485
const idSlug = (id) => (/^\d+:\d+$/.test(id) ? "hisn-" : "") + String(id).replace(/:/g, "-");
const mintSlug = (d) => d.categorySlug + "-" + idSlug(d.id);

const lock = readJson(LOCK_PATH, {});
let minted = 0;
for (const d of browse) if (!lock[d.id]) { lock[d.id] = mintSlug(d); minted++; }
const slugOf = (d) => lock[d.id];

{ // a published slug is frozen; a collision would silently move a live URL
  const seen = new Map();
  for (const d of browse) {
    const s = slugOf(d);
    if (seen.has(s)) throw new Error("slug collision: " + s + " (" + seen.get(s) + " vs " + d.id + ")");
    if (/^(occasion|source|chapter)$/.test(s)) throw new Error("slug shadows a facet directory: " + s);
    seen.set(s, d.id);
  }
}

/* ── authored page copy (sections 6/7/8) ───────────────────────────────────────
   src/data/dua/page-copy.json is keyed by the FROZEN slug. Each entry explicates
   that dua's own translation field and nothing else — see its _meta.authoringBasis
   and doc/CONTENT-POLICY.md §3/§5. A slug with no entry renders with no sections
   6/7/8 at all; we never emit a placeholder. */
const copyAll = readJson("src/data/dua/page-copy.json", {});
const copyOf = (slug) => (slug && slug !== "_meta" ? copyAll[slug] : null) || null;
const batchApproved = {};
for (const b of (copyAll._meta && copyAll._meta.batches) || []) batchApproved[b.batch] = !!b.approved;
// A batch is "reviewed" only when the owner has approved it (CONTENT-POLICY §5).
// Authored-but-unapproved prose is held, not published — see indexDecision().
const anyBatchApproved = Object.values(batchApproved).some(Boolean);

const redirects = readJson("src/data/dua/redirects.json", {});
const priority = readJson("src/data/dua/priority-pages.json", { slugs: [] });
const keywordMap = readJson("src/data/dua/keyword-map.json", {});
const altNames = readJson("src/data/dua/alternate-names.json", {});

/* ── source, reference, translator — one place, from dua-source-core ───────────
   `sourceKey` in the corpus recorded who TRANSLATED an entry, not which collection
   it came from, which put 60 entries behind "Other source" / "dua-dhikr collection".
   Everything below reads the core instead of the corpus field. */
const srcOf = (d) => SRC.assign(d);
const translitOf = (d) => SRC.usableTransliteration(d);

// the on-card citation — the reference, plus the narrator where one is recorded
function sourceLine(d) {
  const s = srcOf(d), n = SRC.narratorOf(d);
  if (!s.reference) return null;
  return s.reference + (n ? " · " + n : "");
}

const snip = (s, n) => {
  const t = String(s || "").replace(/\s+/g, " ").trim();
  if (t.length <= n) return t;
  return t.slice(0, t.lastIndexOf(" ", n) > 0 ? t.lastIndexOf(" ", n) : n).replace(/[.,;:]$/, "") + "…";
};
const words = (s) => String(s || "").trim().split(/\s+/).filter(Boolean).length;
const isGeneral = (slug) => slug === "general";
// the compilation's own wording, minus a trailing "(Kitab …)" locus. Used ONLY in
// the <title>, where the collection name that follows already localises it; the
// H1, breadcrumb and lede always carry the label unmodified.
const titleLabel = (label) => String(label).replace(/\s*\((Kitab|Kitaab)\s[^)]*\)\s*$/i, "").trim() || String(label);
// 6 chapter labels begin lower-case in the corpus ("supplications for when you
// wake up"). Sentence-casing the first letter for display is typography, not an
// edit to the wording. The corpus typo "vocation for someone who says…" is NOT
// silently repaired — it is reported instead.
const displayLabel = (label) => { const s = String(label); return s.charAt(0).toUpperCase() + s.slice(1); };

/* ── facets ────────────────────────────────────────────────────────────────── */
const byOcc = {}, bySrc = {}, byCat = {};
for (const d of browse) {
  (byOcc[d.occasionSlug] = byOcc[d.occasionSlug] || []).push(d);
  (bySrc[srcOf(d).key] = bySrc[srcOf(d).key] || []).push(d);
  (byCat[d.categorySlug] = byCat[d.categorySlug] || []).push(d);
}
const occLabel = {}, catLabel = {};
for (const d of browse) { occLabel[d.occasionSlug] = d.occasion; catLabel[d.categorySlug] = d.category; }

/* ── what actually ships (validator rule R8, owner decision 2026-08-03) ─────────
   A held page is built but NOT published — only indexable pages are committed and
   copied into the deploy artifact. So "exists as a file on this machine" and "is
   reachable in production" are different things, and every link into /duas/ must
   filter on the second one. Linking a held page from a published hub is a 404 for
   a reader and a crawl dead end, which is worse than the page being absent.

   `indexDecision` is a hoisted function declaration and all of its inputs (gate1Hold,
   copyOf, batchApproved, redirects) are read by line 108, so it is safe to call here.

   Note this is the PUBLISH set, not the "authored" set: a page held on R6 duplicate
   scripture is authored and approved but still unpublished, and must not be linked. */
const publishedIds = new Set(
  browse.filter(d => slugOf(d) && indexDecision(d, slugOf(d)).indexable).map(d => d.id));
const isPublished = (d) => publishedIds.has(d.id);

// Chapter grouping restricted to what ships. byCat stays whole — it describes the
// corpus and the reports read it — but chapter PAGES are built from the published
// subset, or a chapter page would list duas that cannot be opened.
const byCatPub = {};
for (const d of browse) if (isPublished(d)) (byCatPub[d.categorySlug] = byCatPub[d.categorySlug] || []).push(d);

// the chapters that clear the D5 threshold ON PUBLISHED PAGES — the only ones that
// get a URL, and therefore the only ones a footer may link to (never link a 404).
const chapterPages = new Set(Object.keys(byCatPub).filter(s => byCatPub[s].length >= CHAPTER_MIN));

/* ── duplicate detection (ADDENDUM §15) ────────────────────────────────────────
   Hisn al-Muslim deliberately lists the same words under more than one chapter —
   the same supplication is reported for both ruku' and sujood, and for both worry
   and debt. The owner's decision (2026-07-31) is to keep both URLs and state the
   distinction visibly from verified data, rather than 301 one away and make the
   compilation's own structure unrepresentable. */
const normAr = (s) => String(s || "").replace(/[ً-ْـۖ-ۭ]/g, "").replace(/[^ء-ي ]/g, " ").replace(/\s+/g, " ").trim();
const normEn = (s) => String(s || "").toLowerCase().replace(/[^a-z ]/g, " ").replace(/\s+/g, " ").trim();
const grams = (s, n) => {
  const w = String(s).split(" ").filter(Boolean), g = new Set();
  for (let i = 0; i + n <= w.length; i++) g.add(w.slice(i, i + n).join(" "));
  return g;
};
const jaccard = (a, b) => {
  if (!a.size || !b.size) return 0;
  let i = 0; for (const x of a) if (b.has(x)) i++;
  return i / (a.size + b.size - i);
};
/* Exact-match grouping is not enough. The three Ayat al-Kursi entries (Hisn 27:75
   morning/evening, 28:100 before sleeping, 25:71 after prayer) carry the same verse
   with small orthographic differences, so they score 0.85-0.94 on Arabic rather than
   1.0 and would slip past an equality test. §15 requires the 0.80-0.95 band to state
   its distinction visibly too, so both bands are collected here. */
const AR_NEAR = 0.80, EN_NEAR = 0.94;
const prof = browse.map(d => ({ d, ar: grams(normAr(d.arabic), 5), en: grams(normEn(d.translation), 5) }));
const sharedWith = new Map(); // id -> [other entries carrying the same wording]
const dupPairs = [];
for (let i = 0; i < prof.length; i++) for (let j = i + 1; j < prof.length; j++) {
  const arS = jaccard(prof[i].ar, prof[j].ar), enS = jaccard(prof[i].en, prof[j].en);
  if (arS < AR_NEAR && enS < EN_NEAR) continue;
  const a = prof[i].d, b = prof[j].d;
  const exact = arS >= 0.99 && enS >= 0.99;
  (sharedWith.get(a.id) || sharedWith.set(a.id, []).get(a.id)).push({ e: b, exact });
  (sharedWith.get(b.id) || sharedWith.set(b.id, []).get(b.id)).push({ e: a, exact });
  dupPairs.push({
    slugs: [lock[a.id], lock[b.id]], ids: [a.id, b.id],
    chapters: [a.category, b.category],
    arabicSimilarity: +arS.toFixed(3), translationSimilarity: +enS.toFixed(3),
    band: arS >= 0.95 && enS >= 0.90 ? "same-dua (>=0.95/0.90)" : "variant-narration (0.80-0.95)"
  });
}

/* ── related duas ──────────────────────────────────────────────────────────── */
// Rotated by the entry's own index so the 109 protection pages do not all list the
// same four neighbours. Deterministic: same corpus in, same picks out.
// A cap (§17) stops a handful of pages absorbing the whole internal link graph.
const REL_INBOUND_CAP = 15;
const inboundCount = new Map();
function rotate(pool, self, want) {
  const list = pool.filter(x => x.id !== self.id);
  if (!list.length || want <= 0) return [];
  const off = (pool.indexOf(self) + 1) % list.length;
  const out = [];
  for (let i = 0; i < list.length && out.length < want; i++) out.push(list[(off + i) % list.length]);
  return out;
}
function related(d, enforceCap) {
  const out = [], seen = new Set([d.id]);
  // R8: never surface a related dua that is not published — the rail would link a 404.
  const ok = (x) => isPublished(x) && (!enforceCap || (inboundCount.get(x.id) || 0) < REL_INBOUND_CAP);
  const add = (x) => { if (x && !seen.has(x.id) && out.length < 5 && ok(x)) { seen.add(x.id); out.push(x); } };
  rotate(byOcc[d.occasionSlug] || [], d, 40).forEach(add);
  if (out.length < 5) rotate((bySrc[srcOf(d).key] || []).filter(x => !seen.has(x.id)), d, 40).forEach(add);
  if (out.length < 5) rotate((byCat[d.categorySlug] || []).filter(x => !seen.has(x.id)), d, 40).forEach(add);
  return out; // may be < 5 — never padded with unrelated duas
}

/* relLabels() was REMOVED 2026-08-03. It re-derived a display name for the related
   rail — `chapterLabel — translationExcerpt`, with its own collision-escalation ladder
   — which made it a third naming path alongside the hub cards and the H1 itself. All
   three now read the single resolution produced by resolveUnique(). If a name ever
   needs to change, it changes in one place. See validator rule R9. */

/* ── metadata engine (MASTER SPEC §5, ADDENDUM §14/§21) ────────────────────────
   Chapter labels repeat heavily — 99 entries share "Qur'anic supplications" and 53
   share "Chapters on Supplication (Kitab al-Da'awat)" — so a title built from the
   label alone collided on 401 of 506 pages. Uniqueness is resolved deterministically
   against real data, in this order, and never by inventing a keyword:
     1. label + occasion
     2. + the entry's own source reference   (unique for Qur'an and hadith entries)
     3. + the opening words of its translation
     4. + the stable id                      (guaranteed unique, last resort)
   keyword-map.json titleOverride/descriptionOverride win over all of this when the
   owner has researched a page. */
/* Title format, revised by the owner 2026-07-31:
     "[Dua purpose] | IslamicInfo.org"
   The descriptive phrase " in Arabic, Transliteration & Meaning" is added ONLY when
   the whole title still lands under ~60 characters. In practice it never does — the
   phrase is 37 characters and the brand suffix 18, so it needs a chapter label of 5
   characters or fewer, and the shortest in the corpus is 11. The rule is kept in code
   anyway so a short label would pick it up. The previous build bolted that phrase onto
   every page, which pushed the median title to 86 characters.
   The label is capped HERE ONLY, and only at 62 so it bites on the handful of very
   long labels — the H1, breadcrumb and lede always carry it in full. */
const TITLE_TARGET = 60, BRAND = " | " + SITE;
/* §5: "{Primary keyword} – Arabic, Transliteration & Meaning"  <=60, degrading to
   "{KW} – Arabic & English Meaning" then "{KW}". The brand suffix is DROPPED on
   individual dua pages (§5) — it is kept on hubs only. */
function titleCandidates(d) {
  const r = chapterRow(d);
  const stem = stemOf(d);
  const LONG = " – Arabic, Transliteration & Meaning", MID = " – Arabic & English Meaning";
  const out = [];
  // a single-page chapter can use the CSV's pre-computed title verbatim
  if (r && r.title && !isMultiPage(d) && kwFor(d)) out.push(r.title);
  if (translitOf(d) && (stem + LONG).length <= TITLE_TARGET) out.push(stem + LONG);
  if ((stem + MID).length <= TITLE_TARGET) out.push(stem + MID);
  if (stem.length <= TITLE_TARGET) out.push(stem);
  out.push(snip(stem, TITLE_TARGET - 2));
  return [...new Set(out.filter(Boolean))];
}

/* The superseded format, kept solely so the batch review report can show old vs new
   side by side for this review round. Delete once the titles are signed off. */
function previousTitle(d) {
  const s = srcOf(d);
  const base = snip(titleLabel(displayLabel(d.category)), 48);
  const kind = translitOf(d) ? " in Arabic, Transliteration & Meaning" : " in Arabic & Meaning";
  return base + kind + BRAND;
}

/* Exactly one H1 per page, and it must not repeat across pages: 99 entries share the
   chapter label "Qur'anic supplications", which names a bucket rather than a purpose.
   The label is never rewritten or invented — where it repeats, the entry's own source
   reference is appended, which is the fact that actually distinguishes those pages. */
function h1Candidates(d) {
  const s = srcOf(d);
  const label = displayLabel(d.category);
  // Within one Hisn chapter the reference is shared, so the only real differentiator
  // left is the supplication's own opening words. The reference is dropped in that
  // shape because it already appears in the eyebrow directly beneath the H1.
  const body = d.translation.replace(/^[("']+/, "");
  const opens = snip(body, 42), longer = snip(body, 78);
  // a few entries in one chapter share even their opening clause, so the closing
  // words separate them; the entry number is the guaranteed-unique last resort
  const closes = body.length > 78 ? "…" + body.slice(body.length - 60).replace(/^\S*\s/, "") : longer;
  const entry = /^\d+:(\d+)$/.exec(String(d.id));
  /* §5: "H1: Primary keyword, natural language. MUST differ from every other H1."
     stemOf() is keyword-led and already carries this entry's own source reference
     where one chapter keyword covers several pages, so it is unique by construction.
     The later candidates only add separation if two ever collide. */
  const stem = stemOf(d);
  return [...new Set([
    stem,
    stem + " — “" + opens + "”",
    stem + " — “" + closes + "”",
    stem + (entry ? " · entry " + entry[1] : " · " + d.id)
  ])];
}
function ledeCandidates(d) {
  const s = srcOf(d), n = SRC.narratorOf(d), t = translitOf(d);
  const label = displayLabel(d.category);
  const body = d.translation.replace(/^[("']+/, "");
  const count = arabicCounts(d);
  const occ = isGeneral(d.occasionSlug)
    ? "is listed as a general supplication"
    : "is listed under " + d.occasion.toLowerCase();
  // sentence 1 — identity, collection, locus, occasion. All verified fields.
  // s.reference already carries the collection name ("Hisn al-Muslim 28",
  // "Sahih al-Bukhari 6114"), so naming the label again would read
  // "recorded in Hisn al-Muslim at Hisn al-Muslim 28".
  const hisnCh = s.key === 'hisn' ? String(s.reference).replace(s.label, "").trim() : null;
  const where = s.key === 'quran'
    ? "is a Qur'anic supplication at " + s.reference
    : hisnCh
      ? "is recorded in " + s.label + ", chapter " + hisnCh
      : "is recorded in " + s.reference + (n ? ", narrated by " + n : "");
  // "Qur'anic supplications is a Qur'anic supplication at Qur'an 2:126" reads as a
  // stutter, because for those 99 entries the chapter label names the bucket, not the
  // dua. There the verse reference leads instead.
  /* Sentence 1 was a single fixed shape, which put an identical 12-gram on up to 71
     pages. Selected by the same stable id hash as sentence 2 so the facts are
     unchanged but no one phrasing spans enough pages to read as boilerplate. */
  let h1sh = 0; for (const ch of String(d.id) + "|1") h1sh = (h1sh * 33 + ch.charCodeAt(0)) >>> 0;
  const occTail = occ.replace(/^is /, "");
  const ONE = s.key === 'quran' ? [
    () => s.reference + " is a Qur'anic supplication, and " + occ + " here.",
    () => "A Qur'anic supplication at " + s.reference + ", " + occTail + ".",
    () => "This is " + s.reference + " — a supplication from the Qur'an, " + occTail + ".",
    () => "Taken from the Qur'an at " + s.reference + "; " + occTail + ".",
    () => "The Qur'an records this at " + s.reference + ", and it " + occTail + "."
  ] : [
    () => label + " " + where + ", and " + occ + " here.",
    () => label + ": " + where + ". It " + occTail + ".",
    () => where.replace(/^is /, cap1(label) + " ") + ", " + occTail + ".",
    () => cap1(label) + " — " + where.replace(/^is /, "") + ". It " + occTail + ".",
    () => "In this library " + label + " " + where + " and " + occTail + "."
  ];
  const one = ONE[h1sh % ONE.length]();
  /* sentence 2 — exactly what this page carries, so the summary stays checkable.
     It used to be one fixed string, which put an identical 12-gram on 333 pages and
     was invisible to check-dua-a1-overlap.mjs (that check reads page-copy.json only).
     The wording is now selected by a stable hash of the entry id, so the sentence
     still states only verified facts but no phrasing spans enough pages to read as
     boilerplate. Owner decision 2026-08-02. */
  const SHAPES = t ? [
    (r) => "Arabic, transliteration and translation appear below, with " + r + " cited in full.",
    (r) => "Below: the Arabic, a transliteration, an English rendering, and the " + r + " citation.",
    (r) => "You will find the Arabic text, how it is pronounced, what it means, and " + r + ".",
    (r) => "Set out here are the original wording, its transliteration, its meaning and " + r + ".",
    (r) => "The page carries Arabic, transliteration, English, and the reference at " + r + ".",
    (r) => "Included: original Arabic, a romanised reading, the English sense, and " + r + "."
  ] : [
    (r) => "The Arabic and an English translation appear below, with " + r + " cited in full.",
    (r) => "Below: the Arabic wording, an English rendering, and the " + r + " citation.",
    (r) => "You will find the Arabic text, what it means, and " + r + ".",
    (r) => "Set out here are the original wording, its meaning and " + r + ".",
    (r) => "The page carries the Arabic, an English reading, and the reference at " + r + ".",
    (r) => "Included: the original Arabic, the English sense, and " + r + "."
  ];
  let hsh = 0; for (const ch of String(d.id)) hsh = (hsh * 31 + ch.charCodeAt(0)) >>> 0;
  const two = SHAPES[hsh % SHAPES.length](s.reference || s.label);
  // sentence 3 — the supplication's own opening (or closing) words. Separates pages
  // that share a chapter label; it is quotation, not authored prose.
  const opens = "It begins: “" + snip(body, 90) + "”";
  const closes = body.length > 90
    ? "It ends: “…" + body.slice(body.length - 88).replace(/^\S*\s/, "") + "”"
    : opens;
  const said = count ? "The Arabic text marks these words to be said " + count + "." : null;
  const base = one + " " + two;
  // ADDENDUM §21 targets 40-55 words. A two-sentence lede falls short for most
  // entries, so the quotation is included by default and only omitted when the
  // first two sentences already fill the window.
  const short = words(base) < 42;
  return [
    short ? base + " " + opens : base,
    base + " " + opens,
    said ? base + " " + said + " " + opens : base + " " + closes,
    base + " " + closes,
    base + " " + (said ? said + " " : "") + closes
  ];
}
function descCandidates(d) {
  const s = srcOf(d), t = translitOf(d);
  const label = titleLabel(displayLabel(d.category));
  const occ = isGeneral(d.occasionSlug) ? "general supplication" : String(d.occasion).toLowerCase();
  const tail = " Source: " + s.reference + ".";
  // Some chapter labels run to 68 characters, which alone consumed the whole 140-160
  // window and left no room for the quote that distinguishes one entry from its
  // neighbour. The label is therefore shortened HERE ONLY — never in the H1, the
  // breadcrumb or the lede — as far as is needed to guarantee MIN_QUOTE characters
  // of the supplication's own wording. §5(B) prefers accuracy over mechanical length.
  const MIN_QUOTE = 52;
  const prefix = "Arabic" + (t ? ", transliteration" : "") + " and English meaning of ";
  const fixed = prefix.length + (", a dua for " + occ + ".").length + tail.length;
  // never shorten a label that is already short — the floor keeps ordinary labels
  // ("What to say before sleeping", 27 chars) intact and only bites on the long ones
  const cap = Math.max(38, 160 - fixed - MIN_QUOTE - 4);
  const lead = prefix + (label.length <= cap ? label : snip(label, cap)) + ", a dua for " + occ + ".";
  const body = String(d.translation).replace(/^[("']+/, "");
  const count = arabicCounts(d);
  // a repetition count stated in the Arabic is real source data and is often the
  // only thing separating two entries whose translations are word-for-word identical
  const said = count ? " Said " + count + "." : "";
  /* §5 meta: "{KW} in Arabic with transliteration and English translation, with the
     source reference from {collection} and when to recite it."  <=155.
     The CSV's pre-computed meta_description is used verbatim only where the chapter
     has a single page; otherwise the formula runs on this page's own keyword stem. */
  const r = chapterRow(d), stem = stemOf(d), coll = s.label || "Hisn al-Muslim";
  const out = [];
  if (r && r.desc && !isMultiPage(d) && kwFor(d)) out.push(r.desc);
  const full = stem + " in Arabic with" + (t ? " transliteration and" : "") +
    " English translation, with the source reference from " + coll + " and when to recite it.";
  const shortF = stem + " in Arabic with" + (t ? " transliteration and" : "") +
    " English translation, with its source reference from " + coll + ".";
  const bare = stem + " in Arabic with English translation. Source: " + (s.reference || coll) + ".";
  for (const c of [full, shortF, bare]) if (c.length <= 155) out.push(c);
  out.push(snip(bare, 154));
  const keyworded = [...new Set(out.filter(Boolean))];
  return [...keyworded, ...descShapes(d, lead, tail, body, said)];
}

/* The five description shapes, tried in order until the value is globally unique.
   Two entries can share a chapter, an occasion and a Hisn chapter reference and
   still be different supplications, so the separators are, in order: the opening
   words, a repetition count the Arabic itself states, and the closing words —
   several pairs share a long opening clause and diverge only at the end. */
function descShapes(d, lead, tail, body, said) {
  // The first shape FITS the 140-160 window — it is what ~95% of pages use. The
  // later shapes exist only to break a collision, and there a minimum quote length
  // is enforced even if that runs the description past 160, because a unique and
  // accurate description matters more than a mechanical length (§5(B)).
  const room = (extra, floor) => Math.max(floor, 158 - lead.length - tail.length - extra.length - 3);
  const head = (extra, floor) => " “" + snip(body, room(extra, floor)) + "”";
  const fromEnd = (extra, floor) => {
    const r = room(extra, floor);
    if (body.length <= r) return head(extra, floor);
    const cut = body.slice(body.length - r);
    return " “…" + cut.slice(cut.indexOf(" ") + 1) + "”";
  };
  const FLOOR = 44;
  return [
    lead + head("", 0) + tail,
    lead + said + head(said, FLOOR) + tail,
    lead + fromEnd("", FLOOR) + tail,
    lead + said + fromEnd(said, FLOOR) + tail,
    lead + head("", FLOOR) + tail.replace(/\.$/, ", entry " + String(d.id).replace(":", ".") + ".")
  ];
}

// Resolve a family of per-page candidate strings to globally unique values.
function resolveUnique(entries, candidatesFor, overrideFor) {
  const chosen = new Map(), used = new Map();
  // pass 1: everyone takes their best candidate
  for (const d of entries) {
    const ov = overrideFor && overrideFor(d);
    const v = ov || candidatesFor(d)[0];
    chosen.set(d.id, v);
    (used.get(v) || used.set(v, []).get(v)).push(d.id);
  }
  // pass 2..n: anyone in a colliding group steps to their next candidate
  for (let level = 1; level < 6; level++) {
    const clashes = [...used.entries()].filter(([, ids]) => ids.length > 1);
    if (!clashes.length) break;
    for (const [v, ids] of clashes) {
      used.delete(v);
      for (const id of ids) {
        const d = entries.find(x => x.id === id);
        if (overrideFor && overrideFor(d)) { // an owner-set override is never overwritten
          chosen.set(id, overrideFor(d));
          (used.get(overrideFor(d)) || used.set(overrideFor(d), []).get(overrideFor(d))).push(id);
          continue;
        }
        const cands = candidatesFor(d);
        const next = cands[Math.min(level, cands.length - 1)];
        chosen.set(id, next);
        (used.get(next) || used.set(next, []).get(next)).push(id);
      }
    }
  }
  return chosen;
}

/* ── §5 target keyword ────────────────────────────────────────────────────────
   DUA-SEO-STRATEGY-v2 §5 builds title/H1/meta from the page's PRIMARY KEYWORD, and
   DUA-PAGE-CONTENT-SPEC §7 fixes where that keyword comes from:
     keyword_rule = use_as_is                     -> the chapter's primary_keyword
     keyword_rule = derive_per_entry_from_...     -> derived from THIS dua's own
       English. Never the chapter label — falling back to it is what produces 99
       pages fighting over one phrase.
   A chapter keyword is shared by every dua in its chapter, so where a chapter holds
   more than one page the entry's own verified source reference is appended, keeping
   §5's "H1 MUST differ from every other H1". Owner decision 2026-08-02. */
const CHAPTER_KW = (() => {
  const pc = (line) => { const o = []; let c = "", q = false;
    for (const ch of line) { if (ch === '"') q = !q; else if (ch === "," && !q) { o.push(c); c = ""; } else c += ch; }
    o.push(c); return o; };
  const lines = fs.readFileSync("docs/seo/chapter_keywords_v2.csv", "utf8").split(/\r?\n/).filter(Boolean);
  const H = pc(lines[0]), ix = (n) => H.indexOf(n);
  const m = {};
  for (const l of lines.slice(1)) { const r = pc(l);
    m[r[ix("chapter_slug")]] = { rule: r[ix("keyword_rule")], kw: r[ix("primary_keyword")].trim(),
      title: r[ix("title_tag")].trim(), desc: r[ix("meta_description")].trim(),
      sk: r[ix("secondary_keywords")].trim() }; }
  return m;
})();
const perChapter = {};
for (const d of browse) perChapter[d.categorySlug] = (perChapter[d.categorySlug] || 0) + 1;
const cap1 = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const chapterRow = (d) => CHAPTER_KW[d.categorySlug] || null;
const isMultiPage = (d) => (perChapter[d.categorySlug] || 0) > 1;
/* the differentiator — verified corpus fields only, never invented */
function baseRef(d) {
  const hc = d.hadithCitation;
  if (hc && typeof hc === "object" && hc.book) return String(hc.book + " " + hc.number).trim();
  if (typeof hc === "string" && hc.trim()) return hc.trim().split("(")[0].trim();
  return "Hisn al-Muslim " + String(d.id);
}
/* Some records share a citation verbatim (9:15 and 85:196 both carry Riyad as-Salihin
   152), so the citation alone does not identify a page. Where it is shared, the entry
   id is appended — the differentiator must be unique or two titles collide. */
const refShared = (() => { const c = {}; for (const d of browse) c[baseRef(d)] = (c[baseRef(d)] || 0) + 1; return c; })();
const refTag = (d) => baseRef(d) + (refShared[baseRef(d)] > 1 ? " · " + d.id : "");
/* the chapter keyword, or null when the rule says derive per entry */
const kwFor = (d) => { const r = chapterRow(d); return r && r.rule === "use_as_is" && r.kw ? r.kw : null; };
/* per-entry stem for derive chapters: the dua's own opening words, never the label */
const inciptOf = (d) => snip(String(d.translation || "").replace(/^[("'“]+/, ""), 46);
/* the keyword-led stem every §5 field is built from */
/* Always fits §5's 60-character title ceiling. Where a stem needs shortening it is
   the descriptive part that gives way, never the source reference — the reference is
   what makes two pages in one chapter distinguishable. */
function stemOf(d) {
  const kw = kwFor(d), ref = refTag(d), multi = isMultiPage(d);
  if (kw && !multi) return snip(cap1(kw), TITLE_TARGET - 2);
  /* The reference is what makes two pages in one chapter distinguishable, so it is
     never truncated — the descriptive part is shortened until the whole stem fits
     §5's 60-character ceiling. snip() appends an ellipsis, so the budget is walked
     down rather than computed once. */
  const lead = kw ? cap1(kw) : String(d.translation || "").replace(/^[("'“]+/, "");
  const wrap = (txt) => kw ? txt + " (" + ref + ")" : "“" + txt + "” (" + ref + ")";
  let budget = Math.max(12, TITLE_TARGET - ref.length - (kw ? 3 : 5));
  let stem = wrap(snip(lead, budget));
  while (stem.length > TITLE_TARGET && budget > 12) { budget -= 2; stem = wrap(snip(lead, budget)); }
  return stem;
}

/* Does this page render a transliteration whose provenance we cannot name?
   Shares its definition with validator rule R10 — same vacuous-value list, so the
   on-page disclosure and the validator can never disagree about which pages are
   affected. "see site-wide attribution" resolves to the compilation the TEXT came
   from; it names no transliterator, so it does not count. */
const TRANSLIT_SRC_VACUOUS = /^(|unknown|n\/?a|tbd|none|various|see site-wide attribution.*|site-wide.*)$/i;
const translitSourceNamed = (d) => typeof d.transliterationSource === "string"
  && d.transliterationSource.trim() !== "" && !TRANSLIT_SRC_VACUOUS.test(d.transliterationSource.trim());
const translitUnsourced = (d) => !!translitOf(d) && !translitSourceNamed(d);

/* PROVENANCE vs ACCURACY — split 2026-08-04 (owner ruling), and they must never be
   re-merged. `transliterationSource` answers "who wrote this and did a human read it"
   (Gate 2). It is what R10 counts, and adoption sets it. It says NOTHING about whether
   the transliteration actually renders the Arabic.

   `transliterationVerified` answers "has this been derived from the stored Arabic
   independently of the proposal it came from". Only that clears the reader-facing
   disclosure. ADOPTION MUST NOT SET IT — the whole point of the split is that adoption
   is a provenance event and the note is an accuracy signal.

   Why this exists: the re-derivation harness validates ALA-LC -> popular spelling only.
   It takes the ALA-LC as input, so it is structurally blind to an error inherited from
   the proposal. 97:208 is the proof — the proposal itself carried `aẓlaln`, the restyle
   preserved it faithfully, and the diff came back clean. Accuracy is unestablished
   corpus-wide until ADR-044 completes. See .claude/CLAUDE.md, Known Limitations. */
const translitVerified = (d) => typeof d.transliterationVerified === "string"
  && d.transliterationVerified.trim() !== "";
const translitUnverified = (d) => !!translitOf(d) && !translitVerified(d);

const kmOf = (d) => keywordMap[slugOf(d)] || null;
const TITLES = resolveUnique(browse, titleCandidates, (d) => (kmOf(d) || {}).titleOverride || null);
const H1S = resolveUnique(browse, h1Candidates, null);
const LEDES = resolveUnique(browse, ledeCandidates, null);
const DESCS = resolveUnique(browse, descCandidates, (d) => (kmOf(d) || {}).descriptionOverride || null);
/* The brand suffix costs 18 characters. Only 132 chapter labels cover 506 duas, so
   374 pages must carry a disambiguating parenthetical, and label + differentiator +
   brand lands around 65 characters however hard the label is capped. Keeping the
   brand only where the whole title still fits the 60-character target moves the
   median from 65 to 55 and puts 374 of 506 under it, at the cost of dropping " |
   IslamicInfo.org" from the longest 330. Titles stay unique either way. */
/* §5: "Drop '| IslamicInfo' on individual dua pages — it costs 14 chars and adds
   nothing on long-tail. Keep it on the 30 hub pages only." */
const titleOf = (d) => TITLES.get(d.id);
const h1Of = (d) => H1S.get(d.id);
const ledeOf = (d) => LEDES.get(d.id);
const descOf = (d) => DESCS.get(d.id);

/* ── indexability gate (ADDENDUM §16) ──────────────────────────────────────────
   noindex is a STAGING state, never a permanent one, and never applied merely for
   being short. Internal links stay intact on held pages so they remain crawlable
   and pass through to the hubs; nofollow is never used. Owner decision 2026-07-31:
   hold pages until their authored copy has been reviewed. */
function indexDecision(d, slug) {
  /* Gate 1 outranks every other signal, including an explicit page-copy.json
     override and batch approval. Checked first so approving a batch can never
     silently flip a not-a-dua page to indexable. */
  if (gate1Hold.has(d.id)) return { indexable: false, reason: "gate1-not-a-dua-hold" };
  const cp = copyOf(slug);
  if (cp && typeof cp.indexable === 'boolean')
    return { indexable: cp.indexable, reason: cp.indexReason || (cp.indexable ? "passed" : "held-for-editorial") };
  if (redirects[slug]) return { indexable: false, reason: "retired-duplicate" };
  if (!cp || !cp.meaning) return { indexable: false, reason: "no-authored-copy" };
  if (cp.reviewStatus === "reviewed") return { indexable: true, reason: "passed" };
  if (!anyBatchApproved) return { indexable: false, reason: "authored-pending-batch-approval" };
  return { indexable: cp.batch == null || batchApproved[cp.batch] === true, reason: batchApproved[cp.batch] ? "passed" : "authored-pending-batch-approval" };
}

/* ── page shell ────────────────────────────────────────────────────────────── */
/* Favicon + social card. src/img/og-default.png is a real committed asset
   (verified 1200x630 PNG) and src/img/ ships via the deploy workflow's
   `cp -r src/* _site/src/`, so both URLs resolve. MASTER SPEC §5(C) forbids
   inventing an image asset; this is the approved branded default, used on every
   generated page rather than a per-page image. */
const fonts = [
  '<link rel="preload" as="font" type="font/woff2" href="/src/fonts/libre-baskerville-400-normal-latin.woff2" crossorigin>',
  '<link rel="preload" as="font" type="font/woff2" href="/src/fonts/cormorant-garamond-500-normal-latin.woff2" crossorigin>',
  '<link rel="stylesheet" href="/src/css/tokens.css?v=20260730">',
  '<link rel="stylesheet" href="/src/css/fonts.css?v=20260730">'
].join("\n  ");

/* Copied verbatim from scripts/build-dua-landing-pages.mjs so the new pages are the
   same design system as their siblings in this directory. Not extended. */
const CSS = [
":root{--teal:var(--teal-700);--teal-d:#01474B;--ink:#132022;--muted:#4A5A5C;--bg:#F7FAFA;--card:#fff;--line:rgba(0,105,110,.14)}",
"*{box-sizing:border-box;margin:0;padding:0}",
"body{background:var(--bg);color:var(--ink);font-family:var(--font-sans);line-height:1.6;-webkit-font-smoothing:antialiased}",
"a{color:var(--teal)}",
".top{background:linear-gradient(120deg,var(--teal) 0%,var(--teal-d) 100%);color:#fff;padding:14px 0}",
".wrap{max-width:940px;margin:0 auto;padding:0 22px}",
".top a{color:#fff;text-decoration:underline;text-underline-offset:3px;font-weight:700}",
".top nav{float:right;font-size:13px}.top nav a{margin-left:16px;font-weight:400;opacity:.95;text-decoration:underline;text-underline-offset:3px}",
".hero{padding:44px 0 28px;border-bottom:1px solid var(--line);background:#fff}",
".crumb{font-size:12px;color:var(--muted);margin-bottom:12px}.crumb a{text-decoration:underline;text-underline-offset:2px}",
"h1{font-family:var(--font-serif);font-size:clamp(30px,5vw,44px);font-weight:500;line-height:1.15}",
".lede{margin-top:12px;color:var(--muted);font-size:16px;max-width:64ch}",
".count{margin-top:14px;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:var(--teal);font-weight:700}",
"main{padding:30px 0 50px}",
".item{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:22px 24px;margin-bottom:16px}",
".ar{font-family:var(--font-arabic);font-size:26px;line-height:2;direction:rtl;text-align:right;color:#0C1A1C;margin-bottom:12px}",
".tl{font-size:13.5px;font-style:italic;color:#7A6A45;margin-bottom:9px}",
".tr{font-size:15.5px;color:#223436}",
".note{margin:0 0 12px;font-size:12px;line-height:1.55;color:var(--muted);background:rgba(197,160,89,.10);border:1px solid rgba(197,160,89,.3);border-radius:10px;padding:9px 12px}",
".note b{display:block;font-size:10px;letter-spacing:.13em;text-transform:uppercase;margin-bottom:3px}",
".meta{margin-top:13px;padding-top:11px;border-top:1px solid var(--line);font-size:11.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}",
".ed{margin-top:6px;font-size:11px;font-style:italic;color:var(--muted);text-transform:none;letter-spacing:0}",
".also{margin:34px 0 0;padding-top:22px;border-top:1px solid var(--line)}",
".also h2{font-family:var(--font-serif);font-size:22px;font-weight:500;margin-bottom:12px}",
".chips{display:flex;flex-wrap:wrap;gap:8px}",
".chips a{display:inline-block;font-size:13px;text-decoration:none;padding:6px 13px;border:1px solid var(--line);border-radius:20px;background:#fff}",
".chips a:hover{border-color:var(--teal)}",
".cta{display:inline-block;margin-top:18px;background:var(--teal);color:#fff;text-decoration:none;padding:11px 22px;border-radius:24px;font-size:14px}",
"footer{border-top:1px solid var(--line);padding:22px 0 40px;font-size:12.5px;color:var(--muted);background:#fff}",
"@media(max-width:620px){.top nav{float:none;display:block;margin-top:8px}.top nav a{margin:0 14px 0 0}}"
].join("\n");

const ROBOTS_INDEX = "index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1";
const ROBOTS_HOLD = "noindex,follow";

function head(o) {
  return [
'<!doctype html><html lang="en"><head>',
'<meta charset="utf-8"/>',
'<meta name="viewport" content="width=device-width,initial-scale=1"/>',
'<title>' + esc(o.title) + '</title>',
'<meta name="description" content="' + esc(o.desc) + '"/>',
'<meta name="robots" content="' + (o.indexable ? ROBOTS_INDEX : ROBOTS_HOLD) + '"/>',
'<link rel="canonical" href="' + o.url + '"/>',
'<meta property="og:type" content="' + (o.ogType || "article") + '"/><meta property="og:site_name" content="' + SITE + '"/>',
'<meta property="og:title" content="' + esc(o.title) + '"/>',
'<meta property="og:description" content="' + esc(o.desc) + '"/>',
'<meta property="og:url" content="' + o.url + '"/>',
'<link rel="icon" href="/src/img/favicon.svg" type="image/svg+xml"/>',
'<meta property="og:image" content="https://islamicinfo.org/src/img/og-default.png"/>',
'<meta property="og:image:width" content="1200"/>',
'<meta property="og:image:height" content="630"/>',
'<meta property="og:image:alt" content="IslamicInfo — Quran, hadith, duas and learning resources, every claim source-cited"/>',
'<meta name="twitter:image" content="https://islamicinfo.org/src/img/og-default.png"/>',
'<meta name="twitter:card" content="summary"/>',
'<meta name="twitter:title" content="' + esc(o.title) + '"/>',
'<meta name="twitter:description" content="' + esc(o.desc) + '"/>',
'  ' + fonts,
'<style>' + CSS + '</style>',
o.ld.map(n => '<script type="application/ld+json">' + ldJson(n) + '</script>').join("\n"),
'</head><body>',
'<div class="top"><div class="wrap"><a href="/">IslamicInfo</a><nav><a href="/dua.html">Duas</a><a href="/quran.html">Qur’an</a><a href="/hadith.html">Hadith</a></nav></div></div>'
  ].join("\n");
}

// the core content block, one supplication. ADDENDUM §18: lang/dir go on the
// Arabic and transliteration elements themselves — attributes only, no styling.
function itemBlock(d, anchor) {
  const t = translitOf(d), line = sourceLine(d), s = srcOf(d);
  return [
'  <article class="item"' + (anchor ? ' id="n-' + esc(anchor) + '"' : '') + '>',
  d.contextNote ? '    <p class="note"><b>⚠ ' + esc(d.contextLabel || "Context") + '</b>' + esc(d.contextNote) + '</p>' : '',
  d.variantNote ? '    <p class="note"><b>Further narration</b>' + esc(d.variantNote) + '</p>' : '',
'    <p class="ar" lang="ar" dir="rtl">' + esc(d.arabic) + '</p>',
  // no usable transliteration -> the row is omitted entirely, never stubbed.
  // 20 entries hold English narration prose in this field; dua-source-core rejects them.
  t ? '    <p class="tl" lang="ar-Latn">' + esc(t) + '</p>' : '',
'    <p class="tr">' + esc(d.translation) + '</p>',
'    <p class="meta">' + (line ? esc(line) + ' · ' : '') +
  '<a href="/duas/source/' + s.key + '.html">' + esc(s.label) + '</a></p>',
  d.editionNote ? '    <p class="ed">' + esc(d.editionNote) + '</p>' : '',
'  </article>'
  ].filter(Boolean).join("\n");
}

/* sections 6-8 — authored explication of this dua's own translated wording.
   Design: built entirely from the existing .also / .also h2 / .tr / .note
   vocabulary. No new classes, no new UI pattern — see DESIGN_LOCK.md.
   Policy: §3 requires the non-sourced tier be distinguishable from the sourced
   text above, so every page carrying these sections also carries the .note
   disclosure stating what they are and what they are not. */
const sec = (h, body) =>
  '  <div class="also"><h2>' + esc(h) + '</h2>\n    <p class="tr">' + esc(body) + '</p></div>';

function copyBlocks(d, slug) {
  const cp = copyOf(slug);
  if (!cp || !cp.meaning) return ''; // no entry -> section omitted entirely
  const count = arabicCounts(d);
  // Section 7 prints ONLY what the data states. There is no site-wide "recite
  // whenever this situation arises" default any more — MASTER SPEC §4 names that
  // sentence as boilerplate. With no verified timing, the section is omitted.
  const timing = cp.timing
    ? cp.timing + (count ? " The Arabic text marks it to be said " + count + "." : "")
    : (count ? "The Arabic text marks these words to be said " + count + "." : null);
  return [
    sec("Context & meaning", cp.meaning),
    timing ? sec("When & how to recite", timing) : '',
    cp.reflection ? sec("Reflection", cp.reflection) : '',
    '  <div class="also"><p class="note"><b>About these notes</b>The notes above explain the ' +
    'wording of the supplication as it is translated on this page. They add no ' +
    'commentary, history or ruling beyond it.</p></div>'
  ].filter(Boolean).join("\n");
}

/* Block B4 — FAQ (DUA-PAGE-CONTENT-SPEC §3). Visible content only; §5 forbids the
   FAQPage schema and validate-seo.mjs asserts its absence. Answers are assembled by
   src/js/dua-faq-core.js from facts already on the page — never a new claim.
   ROLLOUT GATE: while the block is under review it renders only for the slugs in
   FAQ_PILOT. Empty the set to apply it library-wide. */
/* Rollout complete 2026-08-02 — the block renders on every page with authored copy.
   Re-populate this set to pin it back to a pilot subset. */
const FAQ_PILOT = new Set([]);
function faqBlock(d, slug) {
  if (FAQ_PILOT.size && !FAQ_PILOT.has(slug)) return '';
  const cp = copyOf(slug); if (!cp || !cp.meaning) return '';
  const s = srcOf(d), row = chapterRow(d);
  const items = FAQ.buildFaq({
    id: d.id, arabic: d.arabic, translation: d.translation,
    transliteration: translitOf(d) ? d.transliteration : null,
    reference: refTag(d) || s.reference || null, narrator: SRC.narratorOf(d) || null,
    count: arabicCounts(d), timing: cp.timing || null,
    meaningSentence: FAQ._firstSentence(cp.meaning),
    reflectionSentence: FAQ._firstSentence(cp.reflection),
    secondaryKeywords: row ? row.sk : ''
  });
  if (!items.length) return '';
  return '  <div class="also"><h2>Common questions</h2>\n' +
    items.map(x => '    <h3>' + esc(x.q) + '</h3>\n    <p class="tr">' + esc(x.a) + '</p>').join("\n") +
    '\n  </div>';
}

/* Section 9 — Source & authenticity. Rendered with the same `.also > h2` pattern
   the authored sections already use, so no new component is introduced. Shows only
   fields that exist; never a placeholder label. */
function sourceBlock(d) {
  const s = srcOf(d), n = SRC.narratorOf(d), tr = SRC.translationAttribution(d);
  const rows = [];
  if (s.label) {
    rows.push('    <p class="tr">Source: ' + esc(s.label) +
      (s.reference ? ' · Reference: ' + esc(s.reference) : '') + (n ? ' · Narrated by ' + esc(n) : '') + '</p>');
  } else {
    rows.push('    <p class="tr">Source information is unavailable in the current database.</p>');
  }
  if (tr) rows.push('    <p class="ed">Translation: ' + esc(tr) + '</p>');
  /* Romanisation disclosure (owner decision 2026-08-03). Sits HERE, beside the
     translation attribution, rather than under the transliteration itself: these are
     both provenance statements and belong together, and a caveat wedged between the
     transliteration and the translation breaks the read.

     It DISCLOSES the debt, it does not reduce it — R10's baseline is unchanged. The
     condition is the same `named()` test R10 uses, so the moment a record gains a real
     transliterationSource — including "Reviewer-written (adopted)" under the Talbiyah
     precedent — this line disappears on the next build with no further edit. That
     coupling is deliberate: a disclosure that outlives the problem is its own defect. */
  /* Gated on ACCURACY, not provenance. A named transliterationSource does not retire
     this line — only an independent derivation from the Arabic does. */
  /* Copy scope matters (owner ruling 2026-08-04): an unqualified "not verified" on a dua
     page reads as "this dua is unsourced", which is false. Name what IS verified first —
     the Arabic and its reference — then scope the caveat to the Latin rendering alone. */
  if (translitUnverified(d)) rows.push('    <p class="ed">The Arabic text above and its source ' +
    'reference are verified. The Latin-script transliteration has not yet been independently ' +
    'checked against the Arabic, and is provided as a pronunciation aid only.</p>');
  // ADDENDUM §15 — where this library lists the same supplication under another
  // chapter, say so and link it, so a reader who lands on either page can see why
  // two URLs carry the same words. Stated from the corpus only: which chapters list
  // it, and whether the Arabic is identical. No claim is made about which chapter
  // "owns" the supplication, or about any narration's authenticity.
  // R8: only cross-link a shared wording whose page actually ships. A held page is
  // still a real duplicate for the corpus, but saying so and linking a 404 helps nobody.
  const also = (sharedWith.get(d.id) || []).filter(x => lock[x.e.id] && publishedIds.has(x.e.id));
  if (also.length) {
    const exact = also.filter(x => x.exact), near = also.filter(x => !x.exact);
    const link = (x) => '<a href="/duas/' + lock[x.e.id] + '.html">' + esc(displayLabel(x.e.category)) + '</a>';
    if (exact.length) rows.push('    <p class="ed">The same wording is also listed in this library under ' +
      exact.map(link).join(", ") + '.</p>');
    if (near.length) rows.push('    <p class="ed">This supplication also appears, with small differences in the ' +
      'Arabic wording, under ' + near.map(link).join(", ") + '.</p>');
  }
  rows.push('    <p class="note">IslamicInfo presents the source information available in its ' +
    'current verified database and does not issue religious rulings.</p>');
  return '  <div class="also"><h2>Source &amp; authenticity</h2>\n' + rows.join("\n") + '</div>';
}

/* ── the individual dua page ───────────────────────────────────────────────── */
function duaPage(d) {
  const slug = slugOf(d);
  const url = ORIGIN + "/duas/" + slug + ".html";
  const occ = d.occasion, occSlug = d.occasionSlug;
  const label = displayLabel(d.category);
  const s = srcOf(d);
  const title = titleOf(d), desc = descOf(d);
  const idx = indexDecision(d, slug);
  const vars = (d.variantGroup && variantsOf[d.variantGroup]) || [];
  /* Related-dua chips carry the LINKED PAGE'S OWN H1 — the same rule as the hub
     cards (R9). This was the third render path for a page's name: relLabels() built
     `chapterLabel — translationExcerpt` with its own collision escalation, so the
     rail showed four chips reading "What to say after completing the… — <excerpt>"
     pointing at four different pages. h1Of() is resolveUnique()'s output and is
     unique library-wide, so no escalation is needed here at all. */
  const rel = related(d, true), relLab = rel.map(r => h1Of(r));
  for (const r of rel) inboundCount.set(r.id, (inboundCount.get(r.id) || 0) + 1);
  const hasChapterPage = chapterPages.has(d.categorySlug);
  const alt = altNames[slug] || null;
  const cp = copyOf(slug);

  const h1 = h1Of(d);
  const crumbs = [
    { name: "Home", item: ORIGIN + "/" },
    { name: "Duas", item: ORIGIN + "/dua.html" },
    { name: occ, item: ORIGIN + "/duas/occasion/" + occSlug + ".html" },
    { name: h1, item: url }
  ];
  // A page carrying authored explication is an Article; one that only presents the
  // sourced text is a CreativeWork. Neither claims an author, reviewer or publisher
  // logo, because no approved entity data exists (MASTER SPEC §7, ADDENDUM §20(D)).
  const main = {
    "@context": "https://schema.org",
    // §5: never emit Article on a page that is primarily a reproduced text
    "@type": "CreativeWork",
    headline: h1, name: h1, description: desc,
    mainEntityOfPage: url, url, inLanguage: "en",
    citation: s.reference || undefined,
    isPartOf: [
      { "@type": "CollectionPage", name: occ, url: ORIGIN + "/duas/occasion/" + occSlug + ".html" },
      { "@type": "CollectionPage", name: s.label, url: ORIGIN + "/duas/source/" + s.key + ".html" }
    ],
    dateModified: "__DATEMOD__"
  };
  if (alt && alt.verified && (alt.alternateNames || []).length) main.alternateName = alt.alternateNames;
  /* §5: "Schema: WebPage + BreadcrumbList". Nothing else is authorised — no Article
     (forbidden by name on a reproduced text), no FAQPage, no aggregateRating or
     ReviewAction, and no CreativeWork either: substituting it for Article in the
     2026-08-02 fix swapped one unauthorised type for another. `main` is no longer
     emitted; its citation survives as a property of the WebPage node. ListItem is
     kept only because BreadcrumbList requires it structurally. */
  const ld = [{
    "@context": "https://schema.org", "@type": "WebPage",
    "@id": url, url, name: h1, description: desc, inLanguage: "en",
    citation: s.reference || undefined,
    dateModified: "__DATEMOD__"
  }, {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: crumbs.map((b, i) => ({ "@type": "ListItem", position: i + 1, name: b.name, item: b.item }))
  }];

  const footLinks = [
    '    <a href="/duas/occasion/' + occSlug + '.html">' + esc(occ) + '</a>',
    '    <a href="/duas/source/' + s.key + '.html">' + esc(s.label) + '</a>',
    // the chapter tag is always shown, but it is only a link when that chapter
    // cleared the D5 threshold and actually has a page — nothing points at a 404.
    hasChapterPage
      ? '    <a href="/duas/chapter/' + d.categorySlug + '.html">' + esc(label) + '</a>'
      : '    <span>' + esc(label) + '</span>'
  ].join("\n");

  // ADDENDUM §13 — a single factual sentence, only for the few duas that have a
  // verified established popular name. Most entries have none, and emit nothing.
  const altLine = alt && alt.verified && (alt.alternateNames || []).length
    ? ' Also written as ' + esc(alt.alternateNames.join(" or ")) + '.' : '';

  return [
head({ title, desc, url, ld, indexable: idx.indexable }),
'<div class="hero"><div class="wrap">',
'  <div class="crumb"><a href="/">Home</a> &rsaquo; <a href="/dua.html">Duas</a> &rsaquo; ' +
  '<a href="/duas/occasion/' + occSlug + '.html">' + esc(occ) + '</a> &rsaquo; ' + esc(h1) + '</div>',
'  <h1>' + esc(h1) + '</h1>',
/* The generated page-intro sentence was removed 2026-08-02. It was a fixed template
   with only nouns swapped, putting an identical 12-gram on up to 333 pages, and no
   amount of shape-varying gets a generated sentence to zero across 515 pages. It
   carried no sourced fact the page does not already state: the Arabic, translation,
   Source & authenticity block and the authored Context & meaning all remain.
   The ADDENDUM §13 alternate-name line is a verified fact and is kept. */
altLine ? '  <p class="lede">' + altLine.trim() + '</p>' : '',
'  <p class="count">' + esc(s.reference || s.label) + '</p>',
'</div></div>',
'<main><div class="wrap">',
itemBlock(d),
vars.length ? vars.map(v => itemBlock(v, v.id)).join("\n") : '',
/* §5 body order: 1 Arabic, 2 transliteration, 3 English meaning, 4 SOURCE CITATION,
   5 "when to recite it" prose, 6 unique-value block, 7 related duas. The source block
   sat after the authored prose until 2026-08-02, putting the citation at position 8. */
sourceBlock(d),
copyBlocks(d, slug),
faqBlock(d, slug),
'  <a class="cta" href="/dua.html?occasion=' + occSlug + '">Browse every dua for ' +
  esc(isGeneral(occSlug) ? "general supplication" : String(occ).toLowerCase()) + ' &rarr;</a>',
rel.length ? [
'  <div class="also"><h2>Related duas</h2><div class="chips">',
rel.map((r, i) => '    <a href="/duas/' + slugOf(r) + '.html">' + esc(relLab[i]) + '</a>').join("\n"),
'  </div></div>'
].join("\n") : '',
'</div></main>',
'<footer><div class="wrap">',
'  <div class="chips">',
footLinks,
'  </div>',
'  <p style="margin-top:16px">This supplication is shown with the source it comes from. IslamicInfo publishes no rulings.<br/><a href="/dua.html">Back to the dua library</a></p>',
'</div></footer>',
'</body></html>'
  ].filter(Boolean).join("\n");
}

/* ── the chapter landing page (D5: chapters with >= 3 duas) ────────────────── */
function chapterPage(slug, items) {
  const label = displayLabel(catLabel[slug]);
  const url = ORIGIN + "/duas/chapter/" + slug + ".html";
  const sources = [...new Set(items.map(d => srcOf(d).label))];
  const desc = snip(items.length + " supplications recorded under " + label + " in " + sources.join(", ") +
    ", each with its Arabic text, English meaning and source reference.", 158);
  // ADDENDUM §22(A): hubs ship BEFORE their child detail pages, so a chapter hub is
  // always indexable even while its children are held for review. It carries its own
  // unique text and links, so it is not thin on its own.
  const indexable = true;
  const ld = [{
    "@context": "https://schema.org", "@type": "CollectionPage",
    name: label, url, description: desc, inLanguage: "en",
    isPartOf: { "@type": "WebSite", name: SITE, url: ORIGIN + "/" },
    mainEntity: { "@type": "ItemList", numberOfItems: items.length,
      itemListElement: items.map((d, i) => ({ "@type": "ListItem", position: i + 1,
        name: snip(d.translation, 110), url: ORIGIN + "/duas/" + slugOf(d) + ".html" })) },
    dateModified: "__DATEMOD__"
  }, {
    "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: ORIGIN + "/" },
      { "@type": "ListItem", position: 2, name: "Duas", item: ORIGIN + "/dua.html" },
      { "@type": "ListItem", position: 3, name: label, item: url }]
  }];
  // counts shown on these chips are PUBLISHED counts, so the number matches what the
  // reader finds when they follow the link (R8).
  const others = [...chapterPages].filter(s => s !== slug)
    .sort((a, b) => byCatPub[b].length - byCatPub[a].length).slice(0, 12);
  return [
head({ title: label + " — Duas with Sources | " + SITE, desc, url, ld, indexable, ogType: "website" }),
'<div class="hero"><div class="wrap">',
'  <div class="crumb"><a href="/">Home</a> &rsaquo; <a href="/dua.html">Duas</a> &rsaquo; ' + esc(label) + '</div>',
'  <h1>' + esc(label) + '</h1>',
'  <p class="lede">Supplications recorded under “' + esc(label) + '” in ' + esc(sources.join(", ")) +
  '. Each is shown with its Arabic text, its meaning in English, and the source it comes from.</p>',
'  <p class="count">' + items.length + ' supplication' + (items.length === 1 ? '' : 's') + ' &middot; every one with its source</p>',
'</div></div>',
'<main><div class="wrap">',
items.map(d => [
'  <article class="item">',
  d.contextNote ? '    <p class="note"><b>⚠ ' + esc(d.contextLabel || "Context") + '</b>' + esc(d.contextNote) + '</p>' : '',
'    <p class="ar" lang="ar" dir="rtl">' + esc(d.arabic) + '</p>',
  translitOf(d) ? '    <p class="tl" lang="ar-Latn">' + esc(translitOf(d)) + '</p>' : '',
'    <p class="tr">' + esc(d.translation) + '</p>',
'    <p class="meta">' + (sourceLine(d) ? esc(sourceLine(d)) + ' · ' : '') +
  '<a href="/duas/' + slugOf(d) + '.html">Open this dua &rarr;</a></p>',
'  </article>'].filter(Boolean).join("\n")).join("\n"),
  /* Romanisation disclosure, chapter variant (owner decision 2026-08-03). ONE note at
     the foot of the listing, not one per supplication: a chapter page shows many duas
     at once and repeating the same caveat under each would turn a disclosure into
     noise, which is how a caveat stops being read.

     Placed after the last item and before the CTA, so it is the closing statement
     about the supplications above rather than a footnote to the navigation below.
     Uses `.ed` — the same muted italic this template already shares with the detail
     pages — so no new class and no new style.

     Same translitUnverified() ACCURACY test the detail pages use, so the two retire in
     lockstep — and neither retires on adoption, which is a provenance event. Wording
     is plural because the subject is the
     page's whole list. */
  items.some(translitUnverified)
    ? '  <p class="ed">The Arabic texts above and their source references are verified. The ' +
      'Latin-script transliterations have not yet been independently checked against the Arabic, ' +
      'and are provided as a pronunciation aid only.</p>'
    : '',
'  <a class="cta" href="/dua.html?category=' + slug + '">Search and filter the full dua library &rarr;</a>',
'  <div class="also"><h2>Browse other chapters</h2><div class="chips">',
others.map(s => '    <a href="/duas/chapter/' + s + '.html">' + esc(snip(displayLabel(catLabel[s]), 64)) + ' (' + byCatPub[s].length + ')</a>').join("\n"),
'  </div></div>',
'</div></main>',
'<footer><div class="wrap">Every supplication above is shown with the source it comes from. IslamicInfo publishes no rulings.<br/><a href="/dua.html">Back to the dua library</a></div></footer>',
'</body></html>'
  ].filter(Boolean).join("\n");   // drops the disclosure slot cleanly when it does not apply
}

/* ── write ─────────────────────────────────────────────────────────────────────
   ADDENDUM §22(B): lastmod must track genuine content modification, not build
   time. Each page is rendered with a __DATEMOD__ placeholder, hashed, and compared
   with src/data/dua/page-state.json; the stored date is reused unless the hash
   moved. A rebuild that changes nothing therefore rewrites nothing. */
fs.mkdirSync("duas/chapter", { recursive: true });
fs.mkdirSync(REPORT_DIR, { recursive: true });
const state = readJson(STATE_PATH, {});
// this script owns the detail + chapter pages; build-dua-landing-pages.mjs owns the
// occasion/source hubs and writes them into the same file, so carry those through
const nextState = {};
for (const k of Object.keys(state)) if (/^duas\/(occasion|source)\//.test(k)) nextState[k] = state[k];
const urls = [];
const rows = [];   // seo-qa
const idxRows = []; // index-decision
let changed = 0, unchanged = 0;

function emit(path, key, html, priorityVal, indexable) {
  const hash = sha(html);
  const prev = state[key];
  const lastmod = prev && prev.hash === hash ? prev.lastmod : TODAY;
  if (!prev || prev.hash !== hash) changed++; else unchanged++;
  nextState[key] = { hash, lastmod };
  fs.writeFileSync(path, html.replace(/__DATEMOD__/g, lastmod));
  if (indexable) urls.push([ORIGIN + "/" + key, priorityVal, lastmod]);
  return lastmod;
}

for (const d of browse) {
  const slug = slugOf(d);
  const idx = indexDecision(d, slug);
  const html = duaPage(d);
  const lastmod = emit("duas/" + slug + ".html", "duas/" + slug + ".html", html, "0.6", idx.indexable);
  const s = srcOf(d), cp = copyOf(slug);
  const visible = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  rows.push({
    slug, id: d.id, url: ORIGIN + "/duas/" + slug + ".html",
    h1: h1Of(d),
    title: titleOf(d), titleLen: titleOf(d).length,
    titlePrevious: previousTitle(d), titlePreviousLen: previousTitle(d).length,
    description: descOf(d), descLen: descOf(d).length,
    canonical: ORIGIN + "/duas/" + slug + ".html",
    wordCount: words(visible),
    sourceLabel: s.label, sourceReference: s.reference, sourceStatus: s.key ? "mapped" : "unavailable",
    hasTransliteration: !!translitOf(d),
    shortSource: words(d.translation) < 25,
    relatedLinks: related(d, false).length,
    contentBasis: cp ? (cp.contentBasis || "translation-only") : "none",
    reviewStatus: cp ? (cp.reviewStatus || "generated") : "not-authored",
    indexable: idx.indexable, indexReason: idx.reason,
    duplicateWordingWith: (sharedWith.get(d.id) || []).map(x => lock[x.e.id]),
    lastmod
  });
  idxRows.push({ slug, indexable: idx.indexable, indexReason: idx.reason,
    inSitemap: idx.indexable, robots: idx.indexable ? ROBOTS_INDEX : ROBOTS_HOLD,
    nextAction: idx.indexable ? "none" :
      idx.reason === "gate1-not-a-dua-hold" ? "confirm against a second independent signal (DUA-CONTENT-INTEGRITY §1.5), then route out permanently or reinstate"
      : idx.reason === "no-authored-copy" ? "author sections 6/7/8, then owner review"
      : idx.reason === "authored-pending-batch-approval" ? "owner approves the batch in page-copy.json _meta.batches"
      : "editorial decision" });
}
for (const slug of chapterPages) {
  // byCatPub, not byCat — a chapter page lists only the duas a reader can open (R8).
  emit("duas/chapter/" + slug + ".html", "duas/chapter/" + slug + ".html",
       chapterPage(slug, byCatPub[slug]), "0.5", true);
}

/* Prune DETAIL pages whose record has left the build set — a Gate 1 route-out, a
   retired duplicate, or any other reason `browse` no longer contains it.

   Same defect class as the stale chapter pages below, found the same way: on
   2026-08-03 the owner ruled 8 records out of the corpus as narrative statements,
   the builder stopped generating them, and all 8 HTML files stayed on disk. That
   silently changed `pagesPerChapter` as validate-seo.mjs computes it — it counts
   pages ON DISK — so two surviving neighbours (`31:114`, `129:250`) were expected to
   carry a disambiguating source reference they no longer need, and failed §5.

   A routed-out page left on disk is worse than a build error: it is still a complete,
   renderable page for a record we have ruled is not a supplication. */
const expectedDetail = new Set(browse.map(d => slugOf(d)).filter(Boolean).map(s => s + ".html"));
const prunedDetail = [];
for (const f of fs.readdirSync("duas").filter(x => x.endsWith(".html"))) {
  if (expectedDetail.has(f)) continue;
  fs.unlinkSync("duas/" + f);
  delete nextState["duas/" + f];
  prunedDetail.push(f.replace(/\.html$/, ""));
}

/* Prune chapter pages that no longer qualify. The D5 >=3 threshold is now computed on
   PUBLISHED children, so a chapter drops out whenever its pages are held — and this
   script previously only ever wrote chapter files, never removed them. That left 18
   stale files on disk from an earlier 27-chapter build, still carrying their old
   unfiltered link lists, and R8 caught 306 links to held pages through them. A stale
   file is worse than a missing one: it is invisible to every check that iterates the
   CURRENT set, and it ships if anything copies the directory. */
const prunedChapters = [];
if (fs.existsSync("duas/chapter")) {
  for (const f of fs.readdirSync("duas/chapter").filter(x => x.endsWith(".html"))) {
    const slug = f.replace(/\.html$/, "");
    if (chapterPages.has(slug)) continue;
    fs.unlinkSync("duas/chapter/" + f);
    delete nextState["duas/chapter/" + f];
    prunedChapters.push(slug);
  }
}

fs.writeFileSync(LOCK_PATH, JSON.stringify(lock, null, 2) + "\n");
fs.writeFileSync(STATE_PATH, JSON.stringify(nextState, null, 2) + "\n");

/* ── resolved names, published for the hub builder ─────────────────────────────
   THE NAME IS COMPUTED ONCE, HERE, AND NOWHERE ELSE.

   The occasion/source hubs used to label each card `chapterLabel — translation
   excerpt`, taken straight off the corpus record. That was a SECOND naming path
   that never saw §5: on 2026-08-03 all 234 hub cards disagreed with the H1 of the
   page they linked to, and 154 of them sat in 30 groups sharing one visible label
   (24 cards all reading "Words of remembrance for morning and evening"). The H1s
   themselves were correct and keyword-led the whole time — only the hub text was
   wrong, the same class of gap as the dropped lede and the FAQ connectives.

   Re-deriving the rule in the hub builder would just be a third path to drift.
   Instead the resolution that already happened above — keyword stem, plus the
   source reference or opening words only where two pages would otherwise collide
   — is written out and consumed verbatim. `titleOf`/`h1Of` are the outputs of
   resolveUnique(), so the labels are unique by construction, library-wide. */
const NAMES_PATH = "src/data/dua/page-names.json";
const names = {
  _meta: {
    purpose: "Resolved per-page H1 and title for every built dua detail page, keyed by corpus id. WRITTEN BY scripts/build-dua-pages.mjs, READ BY scripts/build-dua-landing-pages.mjs so hub cards carry the same name as the page they link to.",
    doNotEdit: "Generated. Editing this by hand desynchronises the hub cards from the pages, which is the exact defect it exists to prevent (2026-08-03: 234/234 cards wrong).",
    rule: "H1 = §5 keyword stem, with the source reference or opening words appended ONLY where resolveUnique() had to separate a collision. Governed by doc/DUA-KEYWORD-NAMING-v1_0.md as amended by v1_1.",
    buildOrder: "build-dua-pages.mjs FIRST, then build-dua-landing-pages.mjs. The hub builder fails loudly if a page it must label is missing from this file.",
    generated: TODAY,
    count: 0,
  },
  pages: {},
};
for (const d of browse) {
  const slug = slugOf(d);
  if (!slug) continue;
  names.pages[d.id] = { slug, h1: h1Of(d), title: titleOf(d) };
}
names._meta.count = Object.keys(names.pages).length;
fs.writeFileSync(NAMES_PATH, JSON.stringify(names, null, 2) + "\n");

/* ── sitemap ───────────────────────────────────────────────────────────────── */
// Only this script's own URLs are replaced; the occasion/source entries written by
// build-dua-landing-pages.mjs are left untouched.
let xml = fs.readFileSync("sitemap.xml", "utf8");
/* `\r?\n`, not `\n`. sitemap.xml is checked in, and git restores it with CRLF on
   this platform, so a bare `\n` terminator silently matches ZERO existing entries
   whenever the file has just come from git — the strip becomes a no-op and every
   URL is appended a second time. That is the real cause of the "duplicate hub URLs"
   seen on 2026-08-01: the bug appears on a fresh checkout and hides itself as soon
   as one build has rewritten the file with LF. */
xml = xml.replace(/ {2}<url>\s*<loc>[^<]*<\/loc>[\s\S]*?<\/url>\r?\n/g, (block) => {
  const loc = (block.match(/<loc>([^<]*)<\/loc>/) || [])[1] || "";
  const mine = loc.includes("/duas/") && !loc.includes("/duas/occasion/") && !loc.includes("/duas/source/");
  return mine ? "" : block;
});
xml = xml.replace("</urlset>", urls.map(([u, p, lm]) =>
  "  <url>\n    <loc>" + u + "</loc>\n    <lastmod>" + lm + "</lastmod>\n    <priority>" + p + "</priority>\n  </url>\n").join("") + "</urlset>");
fs.writeFileSync("sitemap.xml", xml);

/* ── reports (MASTER SPEC §9, ADDENDUM §22(E)) ─────────────────────────────── */
const csv = (arr) => {
  if (!arr.length) return "";
  const keys = Object.keys(arr[0]);
  const cell = (v) => Array.isArray(v) ? '"' + v.join(" ") + '"'
    : typeof v === "string" && /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : String(v == null ? "" : v);
  return [keys.join(","), ...arr.map(r => keys.map(k => cell(r[k])).join(","))].join("\n") + "\n";
};
const write = (name, data) => {
  fs.writeFileSync(REPORT_DIR + "/" + name + ".json", JSON.stringify(data, null, 2) + "\n");
  if (Array.isArray(data)) fs.writeFileSync(REPORT_DIR + "/" + name + ".csv", csv(data));
};

write("seo-qa-report", rows);
write("index-decision-report", idxRows);
write("content-review-report", rows.map(r => ({
  slug: r.slug, contentBasis: r.contentBasis, reviewStatus: r.reviewStatus,
  shortSource: r.shortSource, wordCount: r.wordCount, indexable: r.indexable,
  needsReview: r.reviewStatus !== "reviewed"
})));
write("source-mapping-report", rows.filter(r => r.sourceStatus !== "mapped").map(r => ({
  slug: r.slug, id: r.id, reason: "no verifiable collection in id, verseRef or hadithCitation",
  recommendedAction: "render the unavailable line; do not fabricate a label"
})));

const dupMeta = (key) => {
  const m = new Map();
  for (const r of rows) (m.get(r[key]) || m.set(r[key], []).get(r[key])).push(r.slug);
  return [...m.entries()].filter(([, v]) => v.length > 1).map(([value, slugs]) => ({ field: key, value, count: slugs.length, slugs }));
};
write("duplicate-metadata-report", [...dupMeta("title"), ...dupMeta("description"), ...dupMeta("canonical")]);

write("duplication-report", dupPairs.map(p => ({
  ...p,
  bodySimilarity: null, // authored prose is compared separately by check-dua-page-copy.mjs
  actionTaken: "kept both URLs; each page states the other chapter under Source & authenticity",
  approvalStatus: "approved by the owner 2026-07-31 — consolidating would make the compilation's own chapter structure unrepresentable"
})));

/* Corpus defects that reach a page but must NOT be silently repaired: the slug is
   frozen and the label is the compilation's own wording. Flagged for editorial
   correction instead (checklist item 10). */
const KNOWN_TYPO = /^vocation\b/i;
write("corpus-issues-report", browse.flatMap(d => {
  const issues = [];
  if (KNOWN_TYPO.test(d.category)) issues.push({
    kind: "chapter-label-typo",
    detail: 'label begins "vocation" — almost certainly "Invocation" with the leading I dropped',
    reachesUrl: true,
    recommendedAction: "correct the label in the corpus; the frozen slug must stay as published"
  });
  if (/^[a-z]/.test(d.category)) issues.push({
    kind: "chapter-label-lowercase",
    detail: "label begins lower-case in the corpus; the builder sentence-cases it for display only",
    reachesUrl: true,
    recommendedAction: "normalise the label in the corpus if the casing is unintended"
  });
  if (SRC.transliterationIsProse(d)) issues.push({
    kind: "transliteration-holds-narration-prose",
    detail: "the transliteration field holds English narration, not romanised Arabic; it is excluded from all SEO text",
    reachesUrl: false,
    recommendedAction: "move the narration to contextNote, or clear the field"
  });
  return issues.map(i => ({ slug: lock[d.id], id: d.id, label: d.category, ...i }));
}));

/* The review packet the owner needs in order to approve a batch (checklist item:
   "Generate a review report listing each approved URL, title, meta description,
   canonical, robots directive, source label, and batch"). Lists every authored page,
   approved or not, so the pending ones can be worked through. */
const batchPacket = rows.filter(r => r.reviewStatus !== "not-authored").map(r => {
  const cp = copyAll[r.slug] || {};
  return {
    batch: cp.batch, slug: r.slug, url: r.url, h1: r.h1,
    title: r.title, titleLen: r.titleLen,
    titlePrevious: r.titlePrevious, titlePreviousLen: r.titlePreviousLen,
    metaDescription: r.description, metaDescriptionLen: r.descLen, canonical: r.canonical,
    robots: r.indexable ? ROBOTS_INDEX : ROBOTS_HOLD,
    sourceLabel: r.sourceLabel, sourceReference: r.sourceReference,
    contentBasis: r.contentBasis, reviewStatus: r.reviewStatus,
    wordCount: r.wordCount, shortSource: r.shortSource,
    duplicateWordingWith: r.duplicateWordingWith,
    batchApproved: batchApproved[cp.batch] === true,
    indexable: r.indexable
  };
}).sort((a, b) => (a.batch - b.batch) || a.slug.localeCompare(b.slug));
write("batch-review-report", batchPacket);
fs.writeFileSync(REPORT_DIR + "/batch-review.html", reviewHtml(batchPacket));

/* Human-readable review page for the batch packet above.
   reports/ is NOT copied by .github/workflows/deploy.yml, so this file is local-only
   and never reaches the public site. It still carries noindex, so that stays true if
   the workflow ever changes. Preview links are RELATIVE (../../duas/…) so they work
   both from file:// and from a local server rooted at the repo.
   Deliberately plain styling: this is a build artifact, not a site page, and must not
   be mistaken for one. It introduces nothing into the locked design system. */
function reviewHtml(packet) {
  const rowsJson = JSON.stringify(packet).replace(/</g, "\\u003c");
  const approved = packet.filter(r => r.batchApproved).length;
  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="robots" content="noindex,nofollow"/>
<title>Dua batch 1-2 review — ${packet.length} pages</title>
<style>
  :root{--ink:#16232b;--muted:#5b6b73;--line:#dfe5e8;--bg:#f6f8f9;--warn:#8a5a00;--warnbg:#fff6e0;--ok:#0a6b3d;--okbg:#e7f5ed;--hold:#7a2f2f;--holdbg:#fbecec}
  *{box-sizing:border-box}
  body{margin:0;padding:24px;background:var(--bg);color:var(--ink);font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
  h1{font-size:22px;margin:0 0 4px}
  .sub{color:var(--muted);margin-bottom:18px}
  .bar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-bottom:14px}
  input[type=search],select{padding:7px 10px;border:1px solid var(--line);border-radius:6px;background:#fff;font:inherit}
  input[type=search]{min-width:280px}
  .pill{padding:3px 9px;border-radius:20px;font-size:12px;font-weight:600;white-space:nowrap}
  .hold{background:var(--holdbg);color:var(--hold)}
  .ok{background:var(--okbg);color:var(--ok)}
  .warn{background:var(--warnbg);color:var(--warn)}
  .tablewrap{overflow-x:auto;background:#fff;border:1px solid var(--line);border-radius:8px}
  table{border-collapse:collapse;width:100%;min-width:1500px}
  th,td{padding:9px 11px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}
  th{position:sticky;top:0;background:#eef2f4;cursor:pointer;user-select:none;white-space:nowrap;font-size:12px;text-transform:uppercase;letter-spacing:.04em}
  th:hover{background:#e3e9ec}
  th.sorted::after{content:" \\25B2";font-size:10px}
  th.sorted.desc::after{content:" \\25BC"}
  td.num{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
  .len{font-size:11px;color:var(--muted);display:block}
  .len.bad{color:#a33}
  .len.old{margin-top:4px;color:#96a2a8;font-style:italic}
  .txt{max-width:420px}
  .mono{display:block;margin-top:3px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px;color:var(--muted);word-break:break-all}
  td:nth-child(7){max-width:230px}
  .txt{min-width:200px}
  a{color:#0b6b78}
  tr:hover td{background:#fafcfc}
  .empty{padding:26px;text-align:center;color:var(--muted)}
  footer{margin-top:16px;color:var(--muted);font-size:12.5px}
</style></head><body>
<h1>Dua detail pages — batch 1–2 review</h1>
<p class="sub">${packet.length} authored pages · <b>${approved}</b> approved · <b>${packet.length - approved}</b> awaiting your review.
Every page is currently <code>noindex,follow</code> and excluded from <code>sitemap.xml</code>.
Approve by setting <code>approved: true</code> for the batch in <code>src/data/dua/page-copy.json</code> → <code>_meta.batches</code>, then rebuild.</p>
<div class="bar">
  <input type="search" id="q" placeholder="Filter by slug, H1, title, source…" aria-label="Filter rows"/>
  <select id="batch"><option value="">All batches</option><option value="1">Batch 1</option><option value="2">Batch 2</option></select>
  <select id="flag"><option value="">All rows</option><option value="dupe">Shared wording only</option><option value="short">Short source only</option><option value="longtitle">Title &gt; 60 chars</option><option value="longdesc">Description outside 140–160</option></select>
  <span id="count" class="pill warn"></span>
</div>
<div class="tablewrap"><table id="t">
<thead><tr>
  <th data-k="batch" class="num">Batch</th>
  <th data-k="slug">Page</th>
  <th data-k="h1">H1</th>
  <th data-k="titleLen" class="num">Title len</th>
  <th data-k="title">SEO title (new vs old)</th>
  <th data-k="metaDescription">Meta description</th>
  <th data-k="canonical">Canonical</th>
  <th data-k="robots">Robots</th>
  <th data-k="sourceLabel">Source</th>
  <th data-k="wordCount" class="num">Words</th>
  <th data-k="dupeCount">Shared wording</th>
  <th data-k="status">Approval</th>
</tr></thead>
<tbody></tbody></table></div>
<div class="empty" id="empty" hidden>No rows match that filter.</div>
<footer>Generated by <code>scripts/build-dua-pages.mjs</code>. Machine-readable equivalents:
<code>reports/dua/batch-review-report.json</code> and <code>.csv</code>.
This file is not published — <code>reports/</code> is not copied by the deploy workflow.</footer>
<script>
const ROWS = ${rowsJson};
const esc = s => String(s==null?'':s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
for (const r of ROWS) { r.dupeCount = (r.duplicateWordingWith||[]).length; r.status = r.batchApproved ? 'approved' : 'pending review'; }
const tbody = document.querySelector('#t tbody');
let sortKey='batch', sortDir=1;
function lenNote(n, lo, hi){ const bad = n<lo||n>hi; return '<span class="len'+(bad?' bad':'')+'">'+n+' chars</span>'; }
function render(){
  const q=document.getElementById('q').value.toLowerCase().trim();
  const b=document.getElementById('batch').value, f=document.getElementById('flag').value;
  let rows = ROWS.filter(r=>{
    if(b && String(r.batch)!==b) return false;
    if(f==='dupe' && !r.dupeCount) return false;
    if(f==='short' && !r.shortSource) return false;
    if(f==='longtitle' && r.title.length<=60) return false;
    if(f==='longdesc' && r.metaDescription.length>=140 && r.metaDescription.length<=160) return false;
    if(q && !(r.slug+' '+r.h1+' '+r.title+' '+r.metaDescription+' '+r.sourceLabel+' '+r.sourceReference).toLowerCase().includes(q)) return false;
    return true;
  });
  rows.sort((x,y)=>{ const a=x[sortKey], c=y[sortKey];
    if(typeof a==='number'&&typeof c==='number') return (a-c)*sortDir;
    return String(a).localeCompare(String(c))*sortDir; });
  document.getElementById('count').textContent = rows.length+' of '+ROWS.length+' shown';
  document.getElementById('empty').hidden = rows.length>0;
  tbody.innerHTML = rows.map(r=>{
    const dupe = r.dupeCount
      ? '<span class="pill warn">shares wording &times;'+r.dupeCount+'</span><br/><span class="mono">'+r.duplicateWordingWith.map(esc).join('<br/>')+'</span>'
      : '<span style="color:#8a949a">\\u2014</span>';
    return '<tr>'
      + '<td class="num">'+r.batch+'</td>'
      + '<td class="txt"><a href="../../duas/'+esc(r.slug)+'.html">preview \\u2192</a>'
        + '<span class="mono">'+esc(r.slug)+'</span>'
        + (r.shortSource?'<span class="pill warn">short source</span>':'')+'</td>'
      + '<td class="txt">'+esc(r.h1)+lenNote(r.h1.length,0,999).replace(' chars',' chars (H1)')+'</td>'
      + '<td class="num">'+r.titleLen+(r.titleLen<=60?'':' <span class="pill warn">&gt;60</span>')+'</td>'
      + '<td class="txt"><b>'+esc(r.title)+'</b>'+lenNote(r.titleLen,0,60)
        + '<span class="len old">was: '+esc(r.titlePrevious)+' ('+r.titlePreviousLen+' chars)</span></td>'
      + '<td class="txt">'+esc(r.metaDescription)+lenNote(r.metaDescriptionLen,140,160)+'</td>'
      + '<td class="txt"><a class="mono" href="'+esc(r.canonical)+'">'+esc(r.canonical)+'</a></td>'
      + '<td><span class="pill '+(r.robots.indexOf('noindex')===0?'hold':'ok')+'">'+esc(r.robots)+'</span></td>'
      + '<td>'+esc(r.sourceLabel)+'<span class="len">'+esc(r.sourceReference)+'</span></td>'
      + '<td class="num">'+r.wordCount+'</td>'
      + '<td class="txt">'+dupe+'</td>'
      + '<td><span class="pill '+(r.batchApproved?'ok':'hold')+'">'+esc(r.status)+'</span>'
        + '<span class="len">'+esc(r.reviewStatus)+' · '+esc(r.contentBasis)+'</span></td>'
      + '</tr>';
  }).join('');
  document.querySelectorAll('th').forEach(th=>{
    th.classList.toggle('sorted', th.dataset.k===sortKey);
    th.classList.toggle('desc', th.dataset.k===sortKey && sortDir===-1);
  });
}
document.querySelectorAll('th').forEach(th=>th.addEventListener('click',()=>{
  const k=th.dataset.k; sortDir = (k===sortKey) ? -sortDir : 1; sortKey=k; render();
}));
for (const id of ['q','batch','flag']) document.getElementById(id).addEventListener('input', render);
render();
</script>
</body></html>`;
}

const inboundFinal = new Map();
for (const d of browse) for (const r of related(d, false)) inboundFinal.set(lock[r.id], (inboundFinal.get(lock[r.id]) || 0) + 1);
write("internal-link-report", rows.map(r => ({
  slug: r.slug, inboundRelated: inboundCount.get(rows.find(x => x.slug === r.slug).id) || 0,
  outboundRelated: r.relatedLinks,
  hubMembership: [
    "occasion/" + browse.find(d => lock[d.id] === r.slug).occasionSlug,
    "source/" + r.sourceLabel,
    chapterPages.has(browse.find(d => lock[d.id] === r.slug).categorySlug) ? "chapter/yes" : "chapter/none"
  ],
  crawlDepthFromRoot: 3
})));

/* ── console summary ───────────────────────────────────────────────────────── */
const indexable = rows.filter(r => r.indexable).length;
console.log("dua pages:       ", browse.length, "(" + changed + " changed, " + unchanged + " unchanged this build)" +
  (prunedDetail.length ? " | pruned " + prunedDetail.length + " routed-out/stale" : ""));
console.log("chapter pages:   ", chapterPages.size, "(of", Object.keys(byCat).length, "chapters, threshold >=" + CHAPTER_MIN + " PUBLISHED children)" +
  (prunedChapters.length ? " | pruned " + prunedChapters.length + " stale" : ""));
console.log("slugs minted:    ", minted, "| lockfile total:", Object.keys(lock).length);
console.log("sources mapped:  ", rows.filter(r => r.sourceStatus === "mapped").length, "/", browse.length,
            "| unavailable:", rows.filter(r => r.sourceStatus !== "mapped").length);
console.log("transliteration: ", rows.filter(r => r.hasTransliteration).length, "shown,",
            browse.length - rows.filter(r => r.hasTransliteration).length, "omitted (never stubbed)");
console.log("duplicate titles:", dupMeta("title").length, "| duplicate descriptions:", dupMeta("description").length);
console.log("INDEXABLE:       ", indexable, "/", browse.length,
            indexable === 0 ? "  <-- no batch approved yet; approve in page-copy.json _meta.batches" : "");
console.log("sitemap <loc>:   ", (xml.match(/<loc>/g) || []).length);
console.log("reports:         ", REPORT_DIR + "/");
