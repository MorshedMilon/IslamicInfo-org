/* Generate the indexable dua hub pages from the corpus.
   Run after any change to src/data/dua/search-corpus.json, BEFORE build-dua-pages.mjs:
     node scripts/build-dua-landing-pages.mjs
     node scripts/build-dua-pages.mjs

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
const esc = (s) => String(s == null ? "" : s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const sha = (s) => crypto.createHash("sha1").update(s).digest("hex").slice(0, 16);
const snip = (s, n) => {
  const t = String(s || "").replace(/\s+/g, " ").trim();
  if (t.length <= n) return t;
  return t.slice(0, t.lastIndexOf(" ", n) > 0 ? t.lastIndexOf(" ", n) : n).replace(/[.,;:]$/, "") + "…";
};
const displayLabel = (l) => { const s = String(l); return s.charAt(0).toUpperCase() + s.slice(1); };

/* src/img/ does not exist in the repo and is not copied by the deploy workflow, so
   /src/img/og-default.png is a 404. MASTER SPEC §5(C) forbids inventing an image
   asset, so no og:image is emitted and the card falls back to `summary`. */
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
function anchorLabels(items) {
  const n = {};
  for (const d of items) n[d.category] = (n[d.category] || 0) + 1;
  const labels = items.map(d => n[d.category] > 1
    ? snip(displayLabel(d.category), 44) + " — " + snip(String(d.translation).replace(/^[("']+/, ""), 52)
    : snip(displayLabel(d.category), 84));
  const seen = {};
  return labels.map((l, i) => (seen[l] = (seen[l] || 0) + 1) > 1
    ? l + " · " + (SRC.assign(items[i]).reference || items[i].id) : l);
}

function page(o) {
  const listed = o.items.filter(d => lock[d.id]);
  const anchors = anchorLabels(listed);
  const ld = [{
    "@context": "https://schema.org", "@type": "CollectionPage",
    name: o.h1, url: o.url, description: o.desc, inLanguage: "en",
    isPartOf: { "@type": "WebSite", name: SITE, url: ORIGIN + "/" },
    mainEntity: { "@type": "ItemList", numberOfItems: listed.length,
      itemListElement: listed.map((d, i) => ({ "@type": "ListItem", position: i + 1,
        name: snip(displayLabel(d.category), 110), url: ORIGIN + "/duas/" + lock[d.id] + ".html" })) },
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
const occList = Object.entries(occMap).map(([s, v]) => ({ slug: s, label: v.label, n: v.items.length })).sort((a, b) => b.n - a.n);
const srcList = Object.entries(srcMap).map(([s, v]) => ({ slug: s, label: v.label, n: v.items.length })).sort((a, b) => b.n - a.n);

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

let xml = fs.readFileSync("sitemap.xml", "utf8");
xml = xml.replace(/ {2}<url>\s*<loc>[^<]*\/duas\/[^<]*<\/loc>[\s\S]*?<\/url>\n/g, "");
xml = xml.replace("</urlset>", urls.map(([u, p, lm]) =>
  "  <url>\n    <loc>" + u + "</loc>\n    <lastmod>" + lm + "</lastmod>\n    <priority>" + p + "</priority>\n  </url>\n").join("") + "</urlset>");
fs.writeFileSync("sitemap.xml", xml);

const orphans = browse.filter(d => lock[d.id]).length -
  new Set([...Object.values(occMap).flatMap(v => v.items.map(d => lock[d.id]))].filter(Boolean)).size;
console.log("occasion pages:", Object.keys(occMap).length, "| source pages:", Object.keys(srcMap).length,
            "(" + changed + " changed, " + unchanged + " unchanged)");
if (retired.length) console.log("retired hubs: ", retired.join(", "), "— recorded in redirects.json");
console.log("children linked:", new Set(Object.values(occMap).flatMap(v => v.items.map(d => lock[d.id])).filter(Boolean)).size,
            "| unlinked from an occasion hub:", orphans);
console.log("sitemap <loc>: ", (xml.match(/<loc>/g) || []).length);
