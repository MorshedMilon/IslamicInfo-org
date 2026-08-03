/* Pre-render the dua page's first paint.
     node scripts/build-dua-page.mjs
   Injects into dua.html, between markers:
     - a small JSON block of facet counts, so the sidebar/chips/category grid
       render with no fetch at all
     - the first page of dua cards as real HTML, so LCP no longer waits on the
       ~600KB payload (the script hydrates over them after load)
   Run after scripts/build-dua-library.mjs. */
import fs from 'node:fs';
const doc = JSON.parse(fs.readFileSync("./src/data/dua/library.json", "utf8"));
const notes = doc.notes || [];
const PAGE = 12;
const esc = (s) => String(s == null ? "" : s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const rows = doc.duas;
const browse = rows.filter(r => r.vro !== 'variant');

function counts(keyLabel, keySlug, keyIcon) {
  const m = {};
  for (const r of rows) {
    const label = r[keyLabel]; if (!label) continue;
    if (!m[label]) m[label] = { label, n: 0, slug: r[keySlug], icon: keyIcon ? r[keyIcon] : undefined };
    m[label].n++;
  }
  return Object.values(m).sort((a, b) => b.n - a.n);
}
const facets = {
  total: rows.length,
  occasionCount: new Set(rows.map(r => r.c)).size,
  occasions: counts('o', 'os', 'oi'),
  sources: counts('sl', 'sk'),
  categories: counts('c', 'cs')
};

const ICON = {};
for (const r of rows) if (r.os && r.oi) ICON[r.os] = r.oi;

function card(r) {
  const note = r.cn !== undefined
    ? '<div class="dua-context-note"><span class="dcn-label">⚠ ' + esc(r.cl || 'Context') + '</span>' + esc(notes[r.cn]) + '</div>'
    : '';
  const translit = r.t ? '<div class="dua-transliteration">' + esc(r.t) + '</div>' : '';
  const edition = r.en !== undefined ? '<p class="dua-edition">' + esc(notes[r.en]) + '</p>' : '';
  return '<div data-ai-selectable="dua" class="card dua-card' + (r.et === 'contextual' ? ' is-contextual' : '') +
    '" data-id="' + esc(r.i) + '">' +
      '<div class="dua-card-header">' +
        '<div class="dua-tag">' + (r.oi || '🤲') + ' <span>' + esc(r.c) + '</span></div>' +
        '<div class="dua-card-actions-top">' +
          '<button class="dua-icon-btn" data-act="save" title="Save to bookmarks" aria-label="Save to bookmarks">' +
          '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg></button>' +
        '</div></div>' +
      note +
      '<div class="dua-arabic">' + esc(r.a) + '</div>' +
      translit +
      '<p class="dua-translation">' + esc(r.e) + '</p>' +
      edition +
      '<div class="dua-footer">' +
        '<div class="dua-source"><span class="dua-source-dot"></span>' + esc(r.s) + '</div>' +
      '</div>' +
    '</div>';
}
/* CARD HOLD, 2026-07-31.
   While the dua library is being rebuilt, this page publishes NO dua text.

   The hold is not a filter. These 12 cards linked to nothing — the detail
   pages they belong to have never been committed — and 7 of them carry
   sourceKey "other" or "dua-dhikr", labels that name no source. The cards
   return once detail pages exist for them to link to.

   The licensing question that first prompted this is settled: the owner
   lifted that hold in ADR-064. What keeps the cards out now is navigation
   and integrity, not permission.

   The page and all of its chrome stay; only the card region goes empty, with
   a note that says what is actually true. Facet counts are kept because they
   are navigation metadata and contain no dua text.

   Set CARDS_HOLD = false to restore, and re-run this script. */
const CARDS_HOLD = true;

const holdNote =
  '<p class="dua-empty" style="grid-column:1/-1;text-align:center;padding:32px 0;color:var(--ink-muted);">' +
  'The dua library is being rebuilt and will return here soon.</p>';

const cards = CARDS_HOLD ? holdNote : browse.slice(0, PAGE).map(card).join("\n");

/* ── P0: STATIC OCCASION-HUB LINKS ──────────────────────────────────────────
   Without these, /duas/ is an island: a crawl from index.html reached dua.html
   and stopped, because #catGrid is painted by JS (and is empty while
   LIBRARY_LIVE is false) and its links were `dua.html?occasion=` query facets,
   never the static hub pages. All 505 detail pages were unreachable from root.

   The detail pages' BreadcrumbList JSON-LD already asserts
   Home > Duas > Occasion > Dua. This makes the HTML implement the path the
   structured data claims: root -> dua.html (1) -> occasion hub (2) ->
   detail (3). Exactly the 3 clicks §17 requires.

   Occasion hubs only, not source hubs — ADR-053 A10 makes source collection
   metadata, never navigation, and adding both would double the links without
   adding reach, since the occasion facet already covers all 505 with no orphans.

   Markup reuses .cat-grid / .cat-card / .cat-icon / .cat-title / .cat-count,
   already defined in dua.html. No new CSS, no new classes. Counts come from
   the corpus, never hardcoded. */
const occHubs = facets.occasions
  .filter(o => o.slug)
  .map(o => '<a class="cat-card" href="/duas/occasion/' + esc(o.slug) + '.html">' +
    '<span class="cat-icon">' + (o.icon || '🤲') + '</span>' +
    '<div class="cat-title">' + esc(o.label) + '</div>' +
    '<div class="cat-count">' + o.n + (o.n === 1 ? ' dua' : ' duas') + '</div></a>')
  .join("\n            ");

const hubBlock =
  '<nav class="cat-grid reveal" aria-label="Browse duas by occasion">\n            ' +
  occHubs + '\n          </nav>';


/* ── (d) LIVE COUNTS — never hardcode the corpus size ───────────────────────
   dua.html shipped "536 supplications" in its meta description, og/twitter
   titles and descriptions, the stats strip, the categories sub-heading and the
   CTA badge. The real figure is the browsable library count, which moves every
   time the exclusion set changes — it was 536, is now {N}, and hardcoding it
   guarantees it goes stale again. Every occurrence is rewritten from the data
   at build time.

   browseCount counts what a reader can actually browse: library.json rows minus
   variants, which are folded into their primary's page rather than listed. */
const browseCount = browse.length;
const occasionCount = facets.occasions.filter(o => o.slug).length;

function retargetCounts(html) {
  let n = 0;
  const sub = (re, make) => { html = html.replace(re, (...a) => { n++; return make(...a); }); };
  // Match ANY number in these phrases rather than the literal 536, so the rewrite
  // is idempotent and keeps working the next time the count moves.
  sub(/\b\d+(\s+(?:supplications|Supplications|duas|Duas))/g, (m, tail) => browseCount + tail);
  sub(/\b\d+(\s+Source-Cited)/g, (m, tail) => browseCount + tail);
  sub(/(id="statDuaCount">)\d+(<)/g, (m, a, b) => a + browseCount + b);
  sub(/(id="statOccasionCount">)\d+(<)/g, (m, a, b) => a + occasionCount + b);
  return { html, n };
}

let h = fs.readFileSync("dua.html", "utf8");
const FS = '<!--DUA_FACETS_START-->', FE = '<!--DUA_FACETS_END-->';
const CS = '<!--DUA_CARDS_START-->', CE = '<!--DUA_CARDS_END-->';
const HS = '<!--DUA_HUBS_START-->', HE = '<!--DUA_HUBS_END-->';
const facetBlock = FS + '<script type="application/json" id="duaFacets">' + JSON.stringify(facets) + '</script>' + FE;

// facet block: keep it just before the closing </body> script tags
if (h.includes(FS)) h = h.replace(new RegExp(FS + "[\\s\\S]*?" + FE), facetBlock);
else h = h.replace('<script src="src/js/dua-library.js', facetBlock + '\n  <script src="src/js/dua-library.js');

// static occasion-hub links, immediately above the JS-painted #catGrid
const hubWrapped = HS + "\n          " + hubBlock + "\n          " + HE;
if (h.includes(HS)) h = h.replace(new RegExp(HS + "[\\s\\S]*?" + HE), hubWrapped);
else {
  const anchor = '<div class="cat-grid reveal" id="catGrid"';
  if (!h.includes(anchor)) { console.error("!! #catGrid not found — cannot place hub links"); process.exit(1); }
  h = h.replace(anchor, hubWrapped + "\n          " + anchor);
}

// first page of cards inside the grid
const gridRe = /(<div class="dua-grid" id="duaGrid"[^>]*>)([\s\S]*?)(<\/div>\s*<!-- \/dua-grid -->|<\/div>)/;
const block = CS + "\n" + cards + "\n" + CE;
if (h.includes(CS)) h = h.replace(new RegExp(CS + "[\\s\\S]*?" + CE), block);
else {
  const m = h.match(gridRe);
  if (!m) { console.error("!! #duaGrid not found"); process.exit(1); }
  h = h.replace(m[0], m[1] + "\n" + block + "\n              " + m[3]);
}
const rc = retargetCounts(h); h = rc.html;
fs.writeFileSync("dua.html", h);
console.log("facets: total", facets.total, "| occasions", facets.occasions.length,
            "| sources", facets.sources.length, "| categories", facets.categories.length);
console.log(CARDS_HOLD ? "pre-rendered cards: 0 (CARD HOLD active)" : "pre-rendered cards: " + Math.min(PAGE, browse.length));
console.log("occasion hub links:", occasionCount);
console.log("live counts rewritten:", rc.n, "-> browse=" + browseCount + ", occasions=" + occasionCount);
console.log("dua.html size:", (fs.statSync("dua.html").size / 1024).toFixed(0) + "KB");
