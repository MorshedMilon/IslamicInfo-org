/* Generate the indexable dua landing pages from the corpus.
   Run after any change to src/data/dua/search-corpus.json:
     node scripts/build-dua-landing-pages.mjs
   Writes duas/occasion/<slug>.html + duas/source/<slug>.html and refreshes their
   entries in sitemap.xml. Content is rendered into the HTML rather than by JS,
   so each page is indexable on its own. */
import fs from 'node:fs';
const ORIGIN = "https://islamicinfo.org", SITE = "IslamicInfo.org";
const LASTMOD = process.env.LASTMOD || new Date().toISOString().slice(0, 10);

const c = JSON.parse(fs.readFileSync("./src/data/dua/search-corpus.json", "utf8"));
const shown = c.duas.filter(d => d.translation && d.entryType !== 'guidance');
const browse = shown.filter(d => d.variantRole !== 'variant');
const esc = (s) => String(s == null ? "" : s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// reuse the site's own font links so landing pages match the rest of the site
const duaHtml = fs.readFileSync("dua.html", "utf8");
const fonts = (duaHtml.match(/<link[^>]*fonts\.(googleapis|gstatic)[^>]*>/g) || []).join("\n  ");

function sourceLine(d) {
  if (d.verseRef) return "Qur'an · " + d.verseRef;
  const h = d.hadithCitation;
  if (h && typeof h === 'object') return h.book + " " + h.number + (h.narrator ? " · " + h.narrator : "");
  if (h) return String(h);
  return "Hisn al-Muslim";
}

const CSS = [
":root{--teal:#00696E;--teal-d:#01474B;--ink:#132022;--muted:#4A5A5C;--bg:#F7FAFA;--card:#fff;--line:rgba(0,105,110,.14)}",
"*{box-sizing:border-box;margin:0;padding:0}",
"body{background:var(--bg);color:var(--ink);font-family:'Libre Baskerville',Georgia,serif;line-height:1.6;-webkit-font-smoothing:antialiased}",
"a{color:var(--teal)}",
".top{background:linear-gradient(120deg,var(--teal) 0%,var(--teal-d) 100%);color:#fff;padding:14px 0}",
".wrap{max-width:940px;margin:0 auto;padding:0 22px}",
".top a{color:#fff;text-decoration:none;font-weight:700}",
".top nav{float:right;font-size:13px}.top nav a{margin-left:16px;font-weight:400;opacity:.9}",
".hero{padding:44px 0 28px;border-bottom:1px solid var(--line);background:#fff}",
".crumb{font-size:12px;color:var(--muted);margin-bottom:12px}.crumb a{text-decoration:none}",
"h1{font-family:'Cormorant Garamond',Georgia,serif;font-size:clamp(30px,5vw,44px);font-weight:500;line-height:1.15}",
".lede{margin-top:12px;color:var(--muted);font-size:16px;max-width:64ch}",
".count{margin-top:14px;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:var(--teal);font-weight:700}",
"main{padding:30px 0 50px}",
".item{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:22px 24px;margin-bottom:16px}",
".ar{font-family:'Amiri','Scheherazade New',serif;font-size:26px;line-height:2;direction:rtl;text-align:right;color:#0C1A1C;margin-bottom:12px}",
".tl{font-size:13.5px;font-style:italic;color:#7A6A45;margin-bottom:9px}",
".tr{font-size:15.5px;color:#223436}",
".note{margin:0 0 12px;font-size:12px;line-height:1.55;color:var(--muted);background:rgba(197,160,89,.10);border:1px solid rgba(197,160,89,.3);border-radius:10px;padding:9px 12px}",
".note b{display:block;font-size:10px;letter-spacing:.13em;text-transform:uppercase;margin-bottom:3px}",
".meta{margin-top:13px;padding-top:11px;border-top:1px solid var(--line);font-size:11.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}",
".ed{margin-top:6px;font-size:11px;font-style:italic;color:var(--muted);text-transform:none;letter-spacing:0}",
".also{margin:34px 0 0;padding-top:22px;border-top:1px solid var(--line)}",
".also h2{font-family:'Cormorant Garamond',Georgia,serif;font-size:22px;font-weight:500;margin-bottom:12px}",
".chips{display:flex;flex-wrap:wrap;gap:8px}",
".chips a{display:inline-block;font-size:13px;text-decoration:none;padding:6px 13px;border:1px solid var(--line);border-radius:20px;background:#fff}",
".chips a:hover{border-color:var(--teal)}",
".cta{display:inline-block;margin-top:18px;background:var(--teal);color:#fff;text-decoration:none;padding:11px 22px;border-radius:24px;font-size:14px}",
"footer{border-top:1px solid var(--line);padding:22px 0 40px;font-size:12.5px;color:var(--muted);background:#fff}",
"@media(max-width:620px){.top nav{float:none;display:block;margin-top:8px}.top nav a{margin:0 14px 0 0}}"
].join("\n");

function page(o) {
  const ld = {
    "@context": "https://schema.org", "@type": "CollectionPage",
    name: o.h1, url: o.url, description: o.desc, inLanguage: "en",
    isPartOf: { "@type": "WebSite", name: SITE, url: ORIGIN + "/" },
    breadcrumb: { "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: ORIGIN + "/" },
      { "@type": "ListItem", position: 2, name: "Duas", item: ORIGIN + "/dua.html" },
      { "@type": "ListItem", position: 3, name: o.crumbLabel, item: o.url }] },
    mainEntity: { "@type": "ItemList", numberOfItems: o.items.length,
      itemListElement: o.items.slice(0, 60).map((d, i) =>
        ({ "@type": "ListItem", position: i + 1, name: String(d.translation).slice(0, 110) })) }
  };
  const items = o.items.map(d => [
    '  <article class="item">',
    d.contextNote ? '    <p class="note"><b>⚠ ' + esc(d.contextLabel || "Context") + '</b>' + esc(d.contextNote) + '</p>' : '',
    '    <p class="ar">' + esc(d.arabic) + '</p>',
    d.transliteration ? '    <p class="tl">' + esc(d.transliteration) + '</p>' : '',
    '    <p class="tr">' + esc(d.translation) + '</p>',
    '    <p class="meta">' + esc(sourceLine(d)) + (d.category ? ' · ' + esc(d.category) : '') + '</p>',
    d.editionNote ? '    <p class="ed">' + esc(d.editionNote) + '</p>' : '',
    '  </article>'
  ].filter(Boolean).join("\n")).join("\n");
  const sibs = o.siblings.map(s => '    <a href="' + s.href + '">' + esc(s.label) + ' (' + s.n + ')</a>').join("\n");
  return [
'<!doctype html><html lang="en"><head>',
'<meta charset="utf-8"/>',
'<meta name="viewport" content="width=device-width,initial-scale=1"/>',
'<title>' + esc(o.title) + '</title>',
'<meta name="description" content="' + esc(o.desc) + '"/>',
'<link rel="canonical" href="' + o.url + '"/>',
'<meta property="og:type" content="website"/><meta property="og:site_name" content="' + SITE + '"/>',
'<meta property="og:title" content="' + esc(o.title) + '"/>',
'<meta property="og:description" content="' + esc(o.desc) + '"/>',
'<meta property="og:url" content="' + o.url + '"/>',
'<meta property="og:image" content="' + ORIGIN + '/src/img/og-default.png"/>',
'<meta property="og:image:width" content="1200"/><meta property="og:image:height" content="630"/>',
'<meta name="twitter:card" content="summary_large_image"/>',
'<meta name="twitter:title" content="' + esc(o.title) + '"/>',
'<meta name="twitter:description" content="' + esc(o.desc) + '"/>',
'<meta name="twitter:image" content="' + ORIGIN + '/src/img/og-default.png"/>',
'  ' + fonts,
'<style>' + CSS + '</style>',
'<script type="application/ld+json">' + JSON.stringify(ld) + '</script>',
'</head><body>',
'<div class="top"><div class="wrap"><a href="/">IslamicInfo</a><nav><a href="/dua.html">Duas</a><a href="/quran.html">Qur’an</a><a href="/hadith.html">Hadith</a></nav></div></div>',
'<div class="hero"><div class="wrap">',
'  <div class="crumb"><a href="/">Home</a> &rsaquo; <a href="/dua.html">Duas</a> &rsaquo; ' + esc(o.crumbLabel) + '</div>',
'  <h1>' + esc(o.h1) + '</h1>',
'  <p class="lede">' + esc(o.lede) + '</p>',
'  <p class="count">' + o.items.length + ' supplication' + (o.items.length === 1 ? '' : 's') + ' &middot; every one with its source</p>',
'</div></div>',
'<main><div class="wrap">',
items,
'  <a class="cta" href="' + o.facetHref + '">Search and filter the full dua library &rarr;</a>',
'  <div class="also"><h2>' + esc(o.siblingTitle) + '</h2><div class="chips">',
sibs,
'  </div></div>',
'</div></main>',
'<footer><div class="wrap">Every supplication above is shown with the source it comes from. IslamicInfo publishes no rulings.<br/><a href="/dua.html">Back to the dua library</a></div></footer>',
'</body></html>'
  ].join("\n");
}

fs.mkdirSync("duas/occasion", { recursive: true });
fs.mkdirSync("duas/source", { recursive: true });
const occMap = {}, srcMap = {};
for (const d of browse) (occMap[d.occasionSlug] = occMap[d.occasionSlug] || { label: d.occasion, items: [] }).items.push(d);
for (const d of browse) (srcMap[d.sourceKey] = srcMap[d.sourceKey] || { label: d.sourceLabel, items: [] }).items.push(d);
const occList = Object.entries(occMap).map(([s, v]) => ({ slug: s, label: v.label, n: v.items.length })).sort((a, b) => b.n - a.n);
const srcList = Object.entries(srcMap).map(([s, v]) => ({ slug: s, label: v.label, n: v.items.length })).sort((a, b) => b.n - a.n);
const urls = [];

for (const [slug, v] of Object.entries(occMap)) {
  const url = ORIGIN + "/duas/occasion/" + slug + ".html";
  const general = slug === "general";
  fs.writeFileSync("duas/occasion/" + slug + ".html", page({
    title: v.label + " — Duas with Sources — IslamicInfo",
    h1: general ? v.label : "Duas for " + v.label,
    crumbLabel: v.label,
    desc: general
      ? v.items.length + " supplications that are not tied to one specific occasion, each with its Arabic, meaning and source."
      : v.items.length + " supplications for " + v.label.toLowerCase() + ", each with its Arabic, meaning and source from the Qur’an or hadith.",
    lede: general
      ? "Supplications that are not tied to one specific occasion — mostly Qur’anic supplications and general remembrance. Each is shown with its Arabic text, its meaning in English, and the source it comes from."
      : "Supplications grouped under " + v.label.toLowerCase() + ". Each one is shown with its Arabic text, its meaning in English, and the source it comes from.",
    url, items: v.items, facetHref: "/dua.html?occasion=" + slug,
    siblingTitle: "Browse other occasions",
    siblings: occList.filter(o => o.slug !== slug).map(o => ({ href: "/duas/occasion/" + o.slug + ".html", label: o.label, n: o.n }))
  }));
  urls.push([url, "0.7"]);
}
for (const [slug, v] of Object.entries(srcMap)) {
  const url = ORIGIN + "/duas/source/" + slug + ".html";
  fs.writeFileSync("duas/source/" + slug + ".html", page({
    title: "Duas from " + v.label + " — IslamicInfo",
    h1: "Duas from " + v.label, crumbLabel: v.label,
    desc: v.items.length + " supplications drawn from " + v.label + ", each shown with its Arabic, meaning and full reference.",
    lede: "Supplications in our library that come from " + v.label + ". Each is shown with its Arabic text, its meaning in English, and its reference.",
    url, items: v.items, facetHref: "/dua.html?source=" + slug,
    siblingTitle: "Browse other sources",
    siblings: srcList.filter(o => o.slug !== slug).map(o => ({ href: "/duas/source/" + o.slug + ".html", label: o.label, n: o.n }))
  }));
  urls.push([url, "0.6"]);
}
let xml = fs.readFileSync("sitemap.xml", "utf8");
xml = xml.replace(/ {2}<url>\s*<loc>[^<]*\/duas\/[^<]*<\/loc>[\s\S]*?<\/url>\n/g, "");
xml = xml.replace("</urlset>", urls.map(([u, p]) =>
  "  <url>\n    <loc>" + u + "</loc>\n    <lastmod>" + LASTMOD + "</lastmod>\n    <priority>" + p + "</priority>\n  </url>\n").join("") + "</urlset>");
fs.writeFileSync("sitemap.xml", xml);
console.log("occasion pages:", Object.keys(occMap).length, "| source pages:", Object.keys(srcMap).length,
            "| sitemap <loc>:", (xml.match(/<loc>/g) || []).length);
