/* Generate the indexable dua hub pages from the corpus.
   BUILD ORDER CHANGED 2026-08-03 — this script now runs SECOND:
     node scripts/build-dua-pages.mjs          <- computes + writes page-names.json
     node scripts/build-dua-landing-pages.mjs  <- labels hub cards from it

   The old order existed only because this script used to strip every `/duas/` entry
   from the sitemap and the other put them back. That is fixed (see the sitemap block
   below), and the hub cards now need the resolved H1s, which only exist after
   build-dua-pages.mjs has run.

   Writes duas/occasion/<slug>.html + duas/source/<slug>.html and refreshes their
   entries in sitemap.xml. Content is rendered into the HTML rather than by JS,
   so each page is indexable on its own.

   HUBS ARE LINK LAYERS, NOT TEXT LAYERS (ADDENDUM §17, owner decision 2026-07-31).
   These pages used to reproduce every child dua's full Arabic and translation while
   linking to none of them: /duas/source/hisn.html was 164KB of text that also lived
   at 187 detail URLs, 123 duas were reachable from no hub at all, and the ItemList
   carried no item URLs. Each entry is now one descriptive link plus a short factual
   snippet, so the hub passes crawl equity down instead of competing with its own
   children for the same words.

   Design: existing .top/.wrap/.hero/.crumb/.item/.tr/.meta/.also/.chips/.cta
   vocabulary only. No new classes. See DESIGN_LOCK.md. */
import fs from 'node:fs';
import crypto from 'node:crypto';
import SRC from '../src/js/dua-source-core.js';

const ORIGIN = "https://islamicinfo.org", SITE = "IslamicInfo.org";
const TODAY = process.env.LASTMOD || new Date().toISOString().slice(0, 10);
const STATE_PATH = "src/data/dua/page-state.json";

const readJson = (p, dflt) => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : dflt);
const c = readJson("./src/data/dua/search-corpus.json");
const lock = readJson("src/data/dua/slugs.lock.json", {});
const redirects = readJson("src/data/dua/redirects.json", {});

/* ── Gate 1 route-out (DUA-CONTENT-INTEGRITY-v1_0 §1.4, ADR-054) ────────────────
   Entries registered `removed` are not supplications a Muslim recites and leave
   /duas/ entirely — no page, no sitemap entry, and no inbound link from an
   occasion or source hub. The record is NOT deleted from the corpus and the slug
   stays frozen in slugs.lock.json; a warning on the page would not have reached
   the SERP, which shows the title. `noindex-hold` entries still render and still
   link, so they are filtered here only on `removed`. */
const gate1 = readJson("src/data/dua/gate1-route-out.json", { entries: {} });
const gate1Removed = new Set(
  Object.entries(gate1.entries).filter(([, v]) => v.status === "removed").map(([id]) => id));

const shown = c.duas.filter(d =>
  d.translation && d.entryType !== 'guidance' && !gate1Removed.has(d.id));
const browse = shown.filter(d => d.variantRole !== 'variant');

/* ── what actually ships (validator rule R8, owner decision 2026-08-03) ─────────
   Only indexable detail pages are committed and copied into the deploy artifact, so
   a hub that lists every child links 408 files that do not exist in production. The
   hub is a LINK LAYER (ADDENDUM §17) — a link to a page nobody can open is the one
   thing it must never emit.

   Read straight from page-copy.json's per-entry `indexable`, which is the same field
   `indexDecision()` in build-dua-pages.mjs consults FIRST, so the two builders cannot
   disagree about what ships. Counts rendered on these hubs follow from this set, so
   they stay truthful as batches are approved. */
const pageCopy = readJson("src/data/dua/page-copy.json", {});
const isPublished = (d) => {
  const slug = lock[d.id];
  return !!(slug && pageCopy[slug] && pageCopy[slug].indexable === true);
};

/* ── resolved page names (see anchorLabels) ────────────────────────────────────
   Written by build-dua-pages.mjs, which MUST run first. A missing or stale entry is
   a hard failure, never a silent fallback to the chapter label: falling back is how
   this defect would return, and it would return invisibly. */
const NAMES = readJson("src/data/dua/page-names.json", null);
if (!NAMES || !NAMES.pages) {
  console.error("FATAL: src/data/dua/page-names.json is missing.\n" +
    "  Hub cards are labelled with each linked page's resolved H1, which is computed by\n" +
    "  scripts/build-dua-pages.mjs. Run that FIRST, then re-run this script.");
  process.exit(1);
}
function nameOf(d) {
  const n = NAMES.pages[d.id];
  if (!n || !n.h1) {
    console.error(`FATAL: no resolved name for ${d.id} (${lock[d.id] || "no slug"}) in page-names.json.\n` +
      "  page-names.json is stale relative to the corpus. Re-run scripts/build-dua-pages.mjs,\n" +
      "  then this script. Labelling the card from the chapter label instead is exactly the\n" +
      "  defect this file exists to prevent — so this is a build failure, not a fallback.");
    process.exit(1);
  }
  if (n.slug !== lock[d.id]) {
    console.error(`FATAL: page-names.json maps ${d.id} to slug "${n.slug}" but the lockfile says "${lock[d.id]}".`);
    process.exit(1);
  }
  return n;
}
const esc = (s) => String(s == null ? "" : s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const sha = (s) => crypto.createHash("sha1").update(s).digest("hex").slice(0, 16);
const snip = (s, n) => {
  const t = String(s || "").replace(/\s+/g, " ").trim();
  if (t.length <= n) return t;
  return t.slice(0, t.lastIndexOf(" ", n) > 0 ? t.lastIndexOf(" ", n) : n).replace(/[.,;:]$/, "") + "…";
};
const displayLabel = (l) => { const s = String(l); return s.charAt(0).toUpperCase() + s.slice(1); };

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

const ROBOTS_INDEX = "index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1";

const CSS = [
/* --teal is exactly --teal-700 from tokens.css, so it reads through. The rest of
   this block is page-local and still off-palette — tracked in DESIGN_LOCK.md §5. */
":root{--teal:var(--teal-700);--teal-d:#01474B;--ink:#132022;--muted:#4A5A5C;--bg:#F7FAFA;--card:#fff;--line:rgba(0,105,110,.14)}",
"*{box-sizing:border-box;margin:0;padding:0}",
"body{background:var(--bg);color:var(--ink);font-family:var(--font-sans);line-height:1.6;-webkit-font-smoothing:antialiased}",
"a{color:var(--teal)}",
".top{background:linear-gradient(120deg,var(--teal) 0%,var(--teal-d) 100%);color:#fff;padding:14px 0}",
".wrap{max-width:940px;margin:0 auto;padding:0 22px}",
/* underlined so links are not distinguished by colour alone */
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

/* Descriptive anchor text derived from the chapter label. Labels repeat inside a
   hub, so where one does, the supplication's own opening words separate them —
   never a generic anchor, never five identical link texts. */
/* Every entry gets a preview of the dua itself, not just its chapter name.
   Previously a chapter contributing exactly ONE entry to a hub was labelled with
   the bare chapter name — unique, but 192 of 1010 links told the reader nothing
   about the supplication. "Invocation for entering the restroom" is
   self-describing; "Qur'anic supplications" and "Chapters on Supplication
   (Kitab al-Da'awat)" are not, and a reader should never have to guess which
   links show the dua and which do not. Applied uniformly.

   Collisions are broken with the entry's reference, but that reference is NOT
   appended to the visible label: <p class="meta"> already prints it directly
   below, and printing it twice was doing nothing for 21 entries. Uniqueness now
   comes from the preview text, which differs per entry by construction. */
/* A card is labelled with the LINKED PAGE'S OWN H1 — never re-derived here.

   Until 2026-08-03 this function built `chapterLabel — translationExcerpt` from the
   corpus record, which made the hubs a second naming path that never saw §5. The
   audit that day: 234 of 234 cards disagreed with the H1 of the page they linked to,
   and 154 sat in 30 groups sharing one visible label — 24 cards on two different hubs
   all reading "Words of remembrance for morning and evening", differentiated only by
   a quoted excerpt. The detail-page H1s were already correct and keyword-led
   ("Dua after wudu (Sunan Abi Dawud 525)"); only this template was wrong.

   The names come from src/data/dua/page-names.json, written by build-dua-pages.mjs
   from the SAME resolveUnique() output that renders the H1. They are therefore
   unique library-wide by construction, and the §5 keyword rule is applied in exactly
   one place. Re-deriving it here would be a third path to drift. */
function anchorLabels(items) {
  return items.map(d => nameOf(d).h1);
}

function page(o) {
  // R8: a slug in the lockfile is not enough — the page must also ship.
  const listed = o.items.filter(d => lock[d.id] && isPublished(d));
  const anchors = anchorLabels(listed);
  const ld = [{
    "@context": "https://schema.org", "@type": "CollectionPage",
    name: o.h1, url: o.url, description: o.desc, inLanguage: "en",
    isPartOf: { "@type": "WebSite", name: SITE, url: ORIGIN + "/" },
    mainEntity: { "@type": "ItemList", numberOfItems: listed.length,
      /* name is the ITEM's own label, not its chapter. Using the chapter name gave
         every ListItem on a hub the same handful of values — on source/hisn.html,
         247 items collapsed to a few repeated names. anchors[i] is the same string
         the visible link shows, so the structured data and the page agree. */
      itemListElement: listed.map((d, i) => ({ "@type": "ListItem", position: i + 1,
        name: snip(anchors[i], 110), url: ORIGIN + "/duas/" + lock[d.id] + ".html" })) },
    dateModified: "__DATEMOD__"
  }, {
    "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: ORIGIN + "/" },
      { "@type": "ListItem", position: 2, name: "Duas", item: ORIGIN + "/dua.html" },
      { "@type": "ListItem", position: 3, name: o.crumbLabel, item: o.url }]
  }];
  // one link + one factual snippet per child. The full Arabic and translation live
  // on the detail page, which is the page we want to rank for those words.
  // ONE link per child. A second "Open this dua" anchor to the same target repeated
  // the 70-character slug on every row and added ~15KB to the largest hub without
  // giving the reader anything the title link does not already do.
  const items = listed.map((d, i) => {
    const s = SRC.assign(d), nar = SRC.narratorOf(d);
    return [
      '  <article class="item">',
      '    <p class="tr"><a href="/duas/' + lock[d.id] + '.html">' + esc(anchors[i]) + ' &rarr;</a></p>',
      '    <p class="meta">' + esc(s.reference || s.label) + (nar ? ' · ' + esc(nar) : '') + '</p>',
      '  </article>'
    ].join("\n");
  }).join("\n");
  const sibs = o.siblings.map(s => '    <a href="' + s.href + '">' + esc(s.label) + ' (' + s.n + ')</a>').join("\n");
  return [
'<!doctype html><html lang="en"><head>',
'<meta charset="utf-8"/>',
'<meta name="viewport" content="width=device-width,initial-scale=1"/>',
'<title>' + esc(o.title) + '</title>',
'<meta name="description" content="' + esc(o.desc) + '"/>',
'<meta name="robots" content="' + ROBOTS_INDEX + '"/>',
'<link rel="canonical" href="' + o.url + '"/>',
'<meta property="og:type" content="website"/><meta property="og:site_name" content="' + SITE + '"/>',
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
ld.map(n => '<script type="application/ld+json">' + JSON.stringify(n).replace(/</g, "\\u003c") + '</script>').join("\n"),
'</head><body>',
'<div class="top"><div class="wrap"><a href="/">IslamicInfo</a><nav><a href="/dua.html">Duas</a><a href="/quran.html">Qur’an</a><a href="/hadith.html">Hadith</a></nav></div></div>',
'<div class="hero"><div class="wrap">',
'  <div class="crumb"><a href="/">Home</a> &rsaquo; <a href="/dua.html">Duas</a> &rsaquo; ' + esc(o.crumbLabel) + '</div>',
'  <h1>' + esc(o.h1) + '</h1>',
'  <p class="lede">' + esc(o.lede) + '</p>',
'  <p class="count">' + listed.length + ' supplication' + (listed.length === 1 ? '' : 's') + ' &middot; every one with its source</p>',
'</div></div>',
'<main><div class="wrap">',
items,
'  <a class="cta" href="' + o.facetHref + '">Search and filter the full dua library &rarr;</a>',
'  <div class="also"><h2>' + esc(o.siblingTitle) + '</h2><div class="chips">',
sibs,
'  </div></div>',
'</div></main>',
'<footer><div class="wrap">Every supplication is shown with the source it comes from. IslamicInfo publishes no rulings.<br/><a href="/dua.html">Back to the dua library</a></div></footer>',
'</body></html>'
  ].join("\n");
}

fs.mkdirSync("duas/occasion", { recursive: true });
fs.mkdirSync("duas/source", { recursive: true });
const occMap = {}, srcMap = {};
for (const d of browse) (occMap[d.occasionSlug] = occMap[d.occasionSlug] || { label: d.occasion, items: [] }).items.push(d);
// the source facet comes from dua-source-core, not the corpus field — see that
// module's header for why. "other" and "dua-dhikr" are no longer source keys.
for (const d of browse) {
  const s = SRC.assign(d);
  (srcMap[s.key] = srcMap[s.key] || { label: s.label, items: [] }).items.push(d);
}
/* Sibling-chip counts are PUBLISHED counts (R8). Rendering the corpus total here put
   "(45)" on a chip leading to a hub that lists 3 — the same class of untruth R5 exists
   to stop, arrived at from the other direction. The count a reader sees must be the
   number of links they will find. */
const pubCount = (items) => items.filter(isPublished).length;
const occList = Object.entries(occMap).map(([s, v]) => ({ slug: s, label: v.label, n: pubCount(v.items) })).sort((a, b) => b.n - a.n);
const srcList = Object.entries(srcMap).map(([s, v]) => ({ slug: s, label: v.label, n: pubCount(v.items) })).sort((a, b) => b.n - a.n);

/* Retire hub pages that no longer have children. Recorded in redirects.json;
   GitHub Pages cannot 301, so these URLs 404 until an edge layer exists. */
const retired = [];
for (const f of fs.readdirSync("duas/source").filter(x => x.endsWith(".html"))) {
  const key = f.replace(/\.html$/, "");
  if (!srcMap[key]) { fs.unlinkSync("duas/source/" + f); retired.push("duas/source/" + f); }
}

const state = readJson(STATE_PATH, {});
// this script owns only the facet hubs; build-dua-pages.mjs owns the rest
for (const k of Object.keys(state)) if (/^duas\/(occasion|source)\//.test(k)) delete state[k];
const urls = [];
let changed = 0, unchanged = 0;

function emit(path, key, html, priorityVal) {
  const hash = sha(html);
  const prev = readJson(STATE_PATH, {})[key];
  const lastmod = prev && prev.hash === hash ? prev.lastmod : TODAY;
  if (!prev || prev.hash !== hash) changed++; else unchanged++;
  state[key] = { hash, lastmod };
  fs.writeFileSync(path, html.replace(/__DATEMOD__/g, lastmod));
  urls.push([ORIGIN + "/" + key, priorityVal, lastmod]);
}

for (const [slug, v] of Object.entries(occMap)) {
  const url = ORIGIN + "/duas/occasion/" + slug + ".html";
  const general = slug === "general";
  const n = v.items.length;
  emit("duas/occasion/" + slug + ".html", "duas/occasion/" + slug + ".html", page({
    title: (general ? "General Supplications" : "Duas for " + v.label) + " — with Arabic and Sources | " + SITE,
    h1: general ? v.label : "Duas for " + v.label,
    crumbLabel: v.label,
    desc: general
      ? n + " supplications that are not tied to one specific occasion, each linked to its own page with Arabic, English meaning and source reference."
      : n + " supplications for " + v.label.toLowerCase() + ", each linked to its own page with Arabic text, English meaning and the source reference.",
    lede: general
      ? "Supplications that are not tied to one specific occasion — mostly Qur’anic supplications and general remembrance. Each links to its own page, where the Arabic text, the English meaning and the source reference are shown together."
      : "Supplications grouped under " + v.label.toLowerCase() + ". Each links to its own page, where the Arabic text, the English meaning and the source it comes from are shown together.",
    url, items: v.items, facetHref: "/dua.html?occasion=" + slug,
    siblingTitle: "Browse other occasions",
    siblings: occList.filter(o => o.slug !== slug).map(o => ({ href: "/duas/occasion/" + o.slug + ".html", label: o.label, n: o.n }))
  }), "0.7");
}
for (const [slug, v] of Object.entries(srcMap)) {
  const url = ORIGIN + "/duas/source/" + slug + ".html";
  const n = v.items.length;
  emit("duas/source/" + slug + ".html", "duas/source/" + slug + ".html", page({
    title: "Duas from " + v.label + " — Arabic, Meaning and Reference | " + SITE,
    h1: "Duas from " + v.label, crumbLabel: v.label,
    desc: n + " supplications drawn from " + v.label + ", each linked to its own page with the Arabic text, English meaning and full reference.",
    lede: "Supplications in this library that come from " + v.label + ". Each links to its own page, where the Arabic text, its meaning in English and its reference are shown together.",
    url, items: v.items, facetHref: "/dua.html?source=" + slug,
    siblingTitle: "Browse other sources",
    siblings: srcList.filter(o => o.slug !== slug).map(o => ({ href: "/duas/source/" + o.slug + ".html", label: o.label, n: o.n }))
  }), "0.6");
}

fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2) + "\n");

/* Replace ONLY this script's own URLs. This used to strip every `/duas/` entry —
   including the 117 detail and 10 chapter pages owned by build-dua-pages.mjs — and
   re-add just the 28 hubs, which is the sole reason the build order was
   landing-then-pages: the destructive script had to go first so the other could put
   the entries back. That coupling is now gone, so the order is free to be
   pages-then-landing, which is what lets the hub cards read the resolved H1s.
   Mirrors the equivalent guard in build-dua-pages.mjs. */
let xml = fs.readFileSync("sitemap.xml", "utf8");
/* `\r?\n` — see the matching note in build-dua-pages.mjs. git restores sitemap.xml
   with CRLF, and a bare `\n` terminator makes this strip a silent no-op. */
xml = xml.replace(/ {2}<url>\s*<loc>[^<]*<\/loc>[\s\S]*?<\/url>\r?\n/g, (block) => {
  const loc = (block.match(/<loc>([^<]*)<\/loc>/) || [])[1] || "";
  const mine = loc.includes("/duas/occasion/") || loc.includes("/duas/source/");
  return mine ? "" : block;
});
xml = xml.replace("</urlset>", urls.map(([u, p, lm]) =>
  "  <url>\n    <loc>" + u + "</loc>\n    <lastmod>" + lm + "</lastmod>\n    <priority>" + p + "</priority>\n  </url>\n").join("") + "</urlset>");
fs.writeFileSync("sitemap.xml", xml);

/* Both figures below count PUBLISHED children only (R8). Before 2026-08-03 they
   counted every slugged record, so they reported "515 linked / 0 orphans" while the
   hubs actually emitted 107 links — a green number describing a page that no longer
   existed. The orphan check is only worth having if it watches the set that ships. */
const publishedChildren = (items) => items.map(d => isPublished(d) ? lock[d.id] : null).filter(Boolean);
const linkedFromOcc = new Set(Object.values(occMap).flatMap(v => publishedChildren(v.items)));
const orphans = browse.filter(d => lock[d.id] && isPublished(d)).length - linkedFromOcc.size;
console.log("occasion pages:", Object.keys(occMap).length, "| source pages:", Object.keys(srcMap).length,
            "(" + changed + " changed, " + unchanged + " unchanged)");
if (retired.length) console.log("retired hubs: ", retired.join(", "), "— recorded in redirects.json");
console.log("published children linked:", linkedFromOcc.size,
            "| unlinked from an occasion hub:", orphans,
            "| held (built, not published):", browse.filter(d => lock[d.id] && !isPublished(d)).length);
console.log("sitemap <loc>: ", (xml.match(/<loc>/g) || []).length);
