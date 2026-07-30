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
const cards = browse.slice(0, PAGE).map(card).join("\n");

let h = fs.readFileSync("dua.html", "utf8");
const FS = '<!--DUA_FACETS_START-->', FE = '<!--DUA_FACETS_END-->';
const CS = '<!--DUA_CARDS_START-->', CE = '<!--DUA_CARDS_END-->';
const facetBlock = FS + '<script type="application/json" id="duaFacets">' + JSON.stringify(facets) + '</script>' + FE;

// facet block: keep it just before the closing </body> script tags
if (h.includes(FS)) h = h.replace(new RegExp(FS + "[\\s\\S]*?" + FE), facetBlock);
else h = h.replace('<script src="src/js/dua-library.js', facetBlock + '\n  <script src="src/js/dua-library.js');

// first page of cards inside the grid
const gridRe = /(<div class="dua-grid" id="duaGrid"[^>]*>)([\s\S]*?)(<\/div>\s*<!-- \/dua-grid -->|<\/div>)/;
const block = CS + "\n" + cards + "\n" + CE;
if (h.includes(CS)) h = h.replace(new RegExp(CS + "[\\s\\S]*?" + CE), block);
else {
  const m = h.match(gridRe);
  if (!m) { console.error("!! #duaGrid not found"); process.exit(1); }
  h = h.replace(m[0], m[1] + "\n" + block + "\n              " + m[3]);
}
fs.writeFileSync("dua.html", h);
console.log("facets: total", facets.total, "| occasions", facets.occasions.length,
            "| sources", facets.sources.length, "| categories", facets.categories.length);
console.log("pre-rendered cards:", Math.min(PAGE, browse.length));
console.log("dua.html size:", (fs.statSync("dua.html").size / 1024).toFixed(0) + "KB");
