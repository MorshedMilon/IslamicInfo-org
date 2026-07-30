/* Dua Library — renders the real dua corpus into the page.
   Data: src/data/dua/search-corpus.json (see its meta for sources + attribution).
   Owns search, category filtering, pagination and the live counts, so the page
   never ships hardcoded dua content. Never fabricates a source line: a card
   shows a Qur'an reference, a hadith citation, or the compilation name — the
   only three things the data actually carries. */
(function () {
  'use strict';

  // Compact UI payload (scripts/build-dua-library.mjs). search-corpus.json stays
  // the canonical record but is far larger and is not needed by the browser.
  var CORPUS_URL = 'src/data/dua/library.json';
  var PAGE_SIZE = 12;
  var facetData = null;   // counts inlined at build time, so nav paints with no fetch
  var hydrated = false;

  // short keys keep ~90KB off the wire; expand once so the rest of the code is unchanged
  var KEYMAP = { i: 'id', a: 'arabic', t: 'transliteration', e: 'translation', c: 'category',
    s: 'sourceText', cs: 'categorySlug', o: 'occasion', os: 'occasionSlug', oi: 'occasionIcon',
    sl: 'sourceLabel', sk: 'sourceKey', vr: 'verseRef', vro: 'variantRole', vg: 'variantGroup',
    vl: 'variantLead', et: 'entryType', cl: 'contextLabel' };
  var NOTEKEYS = { en: 'editionNote', on: 'occasionNote', vn: 'variantNote', cn: 'contextNote' };
  function expand(doc) {
    var notes = doc.notes || [];
    return (doc.duas || []).map(function (r) {
      var d = {};
      for (var k in r) { if (KEYMAP[k]) d[KEYMAP[k]] = r[k]; }
      for (var n in NOTEKEYS) { if (r[n] !== undefined) d[NOTEKEYS[n]] = notes[r[n]]; }
      return d;
    });
  }

  var all = [];        // published duas only
  var view = [];       // current filtered set
  var shown = 0;
  var query = '';
  var baseTitle = '';

  var grid, searchEl, loadMoreBtn;

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function normLatin(s) {
    return String(s || '').toLowerCase().replace(/[^a-z0-9\s]+/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function normArabic(s) {
    return String(s || '')
      .replace(/[ً-ٰٕۖ-ۭـ]/g, '')
      .replace(/[آأإٱى]/g, 'ا')
      .replace(/ء/g, '')
      .replace(/ة/g, 'ه')
      .replace(/\s+/g, ' ').trim();
  }
  function hasArabic(s) { return /[؀-ۿ]/.test(s); }

  /* Source line — only ever states what the record carries. */
  function sourceLine(d) {
    if (d.sourceText) return d.sourceText;     // precomputed at build time
    if (d.verseRef) return "Qur'an · " + d.verseRef;
    var c = d.hadithCitation;
    if (c && typeof c === 'object') {
      return c.book + ' ' + c.number + (c.narrator ? ' · ' + c.narrator : '');
    }
    if (c) return String(c);
    return 'Hisn al-Muslim';
  }

  var CAT_ICON = [
    [/qur'?an/i, '📖'], [/morning|evening/i, '🌅'], [/sleep|bed|wake/i, '🛌'],
    [/prayer|salah|athan|adhan|ruki|sujood|tash|mosque/i, '🕌'],
    [/forgive|repent/i, '🤲'], [/travel|journey|vehicle|riding/i, '🧳'],
    [/food|eat|drink|meal|fast/i, '🍽️'], [/rain|wind|thunder|moon/i, '🌧️'],
    [/ill|sick|pain|cure/i, '💊'], [/dead|funeral|grave|calamity/i, '🤍'],
    [/hajj|umrah|kaaba|safa|pilgrim/i, '🕋'], [/anguish|worry|grief|distress|debt/i, '⚡'],
    [/protect|refuge|evil|enemy/i, '🛡️'], [/marriage|child|family|wedding/i, '👶'],
    [/knowledge|study/i, '📚']
  ];
  function iconFor(cat) {
    for (var i = 0; i < CAT_ICON.length; i++) if (CAT_ICON[i][0].test(cat)) return CAT_ICON[i][1];
    return '🤲';
  }

  /* ---------- facet state ----------
     Three ways in, all driven by the data: occasion (derived navigation facet),
     source (which collection), and category (the compilation's own chapter
     label — all 132 stay browseable). Each maps to a shareable URL. */
  var facet = { kind: 'all', value: '' };

  function facetFromURL() {
    var p = new URLSearchParams(location.search);
    var o = p.get('occasion'), s = p.get('source'), c = p.get('category') || p.get('cat');
    if (o) return { kind: 'occasion', value: o };
    if (s) return { kind: 'source', value: s };
    if (c) return { kind: 'category', value: c };
    return { kind: 'all', value: '' };
  }
  function facetURL(kind, value) {
    if (kind === 'all' || !value) return 'dua.html';
    return 'dua.html?' + kind + '=' + encodeURIComponent(value);
  }
  function inFacet(d) {
    if (facet.kind === 'all') return true;
    if (facet.kind === 'occasion') return d.occasionSlug === facet.value;
    if (facet.kind === 'source') return d.sourceKey === facet.value;
    if (facet.kind === 'category') return d.categorySlug === facet.value || matchesCat(d, facet.value);
    return true;
  }
  function facetLabel() {
    if (facet.kind === 'all') return null;
    var hit = all.filter(inFacet)[0];
    if (!hit) return facet.value;
    if (facet.kind === 'occasion') return hit.occasion;
    if (facet.kind === 'source') return hit.sourceLabel;
    return hit.category;
  }
  function groupCounts(key) {
    // before hydration the counts come from the build-time facet block, so the
    // sidebar, chips and category grid render without waiting on the payload
    if (!all.length && facetData) {
      var src = key === 'occasion' ? facetData.occasions
        : key === 'sourceLabel' ? facetData.sources : facetData.categories;
      return (src || []).slice();
    }
    var m = {};
    all.forEach(function (d) {
      var k = d[key]; if (!k) return;
      if (!m[k]) m[k] = { n: 0, slug: d[key === 'occasion' ? 'occasionSlug' : (key === 'sourceLabel' ? 'sourceKey' : 'categorySlug')], icon: d.occasionIcon };
      m[k].n++;
    });
    return Object.keys(m).map(function (k) { return { label: k, n: m[k].n, slug: m[k].slug, icon: m[k].icon }; })
      .sort(function (a, b) { return b.n - a.n; });
  }

  /* Legacy slug matcher, still used by ?cat= links that predate the facets. */
  var CAT_RULES = {
    'morning':        /morning|evening/,
    'morning-evening': /morning|evening/,
    'prayer':         /prayer|salah|athan|adhan|ruki|sujood|tash-?ahhud|mosque|witr|qunut/,
    'sleep':          /sleep|bed|wake|waking|night/,
    'protection':     /protect|refuge|evil|enemy|harm|jinn|satan|devil/,
    'forgiveness':    /forgive|repent|istighfar/,
    'food-drink':     /food|eat|drink|meal|host|guest|milk|breaking the fast/,
    'illness':        /ill|sick|pain|cure|patient|ruqyah/,
    'travel':         /travel|journey|vehicle|riding|returning/,
    'family':         /marriage|child|family|wedding|newborn|spouse|parent|birth/,
    'knowledge':      /knowledge|study|learning/,
    'anxiety':        /anguish|worry|grief|distress|debt|anxiety|sorrow|hardship|difficult/,
    'ramadan':        /fast|ramadan|laylat|decree/,
    'hajj-umrah':     /hajj|umrah|kaaba|safa|marwah|pilgrim|talbiyah|ihram|stoning|arafah|tawaf/
  };
  function matchesCat(d, cat) {
    if (!cat || cat === 'all') return true;
    if (cat === 'quran') return !!d.verseRef;
    // The compilation has no "knowledge" chapter; the duas that actually ask for
    // knowledge are identified by their text, not their chapter title.
    if (cat === 'knowledge') return /beneficial knowledge/i.test(d.translation || '');
    var c = (d.category || '').toLowerCase();
    var re = CAT_RULES[cat];
    if (re) return re.test(c);
    return c.indexOf(String(cat).replace(/-/g, ' ')) !== -1;
  }

  /* Other narrations of the same core supplication. Every one keeps its own full
     text and citation — this only collapses the browse view. */
  function variantBlock(d) {
    var sibs = all.filter(function (x) {
      return x.variantGroup === d.variantGroup && x.variantRole === 'variant';
    });
    if (!sibs.length) return '';
    // A family can span collections, so each variant carries its OWN citation and
    // edition — the lead's edition note must not be read as covering them.
    var items = sibs.map(function (v) {
      var ed = v.edition ? ' · ' + v.edition.replace(/^.*\(standard /, '').replace(/ English edition\)$/, ' edition') : '';
      return '<li><p>' + esc(v.translation) + '</p><cite>' + esc(sourceLine(v) + ed) + '</cite></li>';
    }).join('');
    return '<details class="dua-variants">' +
      '<summary>' + sibs.length + ' further narration' + (sibs.length === 1 ? '' : 's') +
      ' of this supplication</summary>' +
      (d.variantNote ? '<p class="dv-note">' + esc(d.variantNote) + '</p>' : '') +
      '<ul>' + items + '</ul></details>';
  }

  /* ---------- rendering ---------- */
  function cardHTML(d) {
    var cat = d.category || '';
    var translit = d.transliteration
      ? '<div class="dua-transliteration">' + esc(d.transliteration) + '</div>' : '';
    // Contextual entries are quoted in the Qur'an as examples, not as supplications
    // to recite — say so on the card rather than letting it read as a recommendation.
    var note = d.contextNote
      ? '<div class="dua-context-note"><span class="dcn-label">⚠ ' +
        esc(d.contextLabel || 'Context') + '</span>' + esc(d.contextNote) + '</div>' : '';
    // The lead card of a variant group carries its other narrations, so the grid
    // shows one supplication instead of a run of near-identical cards.
    var variants = d.variantLead ? variantBlock(d) : '';
    return '' +
      '<div data-ai-selectable="dua" class="card dua-card' + (d.entryType === 'contextual' ? ' is-contextual' : '') + '" data-id="' + esc(d.id) + '">' +
        '<div class="dua-card-header">' +
          '<div class="dua-tag">' + iconFor(cat) + ' <span>' + esc(cat) + '</span></div>' +
          '<div class="dua-card-actions-top">' +
            '<button class="dua-icon-btn" data-act="save" title="Save to bookmarks" aria-label="Save to bookmarks">' +
              '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>' +
            '</button>' +
          '</div>' +
        '</div>' +
        note +
        '<div class="dua-arabic">' + esc(d.arabic) + '</div>' +
        translit +
        '<p class="dua-translation">' + esc(d.translation) + '</p>' +
        variants +
        // Which English edition this reading comes from. Phrased as an attribution,
        // never as "translated by" — the dataset names only the collection's author.
        (d.editionNote ? '<p class="dua-edition">' + esc(d.editionNote) + '</p>' : '') +
        '<div class="dua-footer">' +
          '<div class="dua-source"><span class="dua-source-dot"></span>' + esc(sourceLine(d)) + '</div>' +
          '<div class="dua-actions">' +
            '<button class="dua-btn" data-act="copy">' +
              '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>' +
              '<span>Copy</span></button>' +
            '<button class="dua-btn" data-act="share">' +
              '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>' +
              '<span>Share</span></button>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function renderPage(reset) {
    if (!grid) return;
    if (reset) { grid.innerHTML = ''; shown = 0; }
    if (!view.length) {
      grid.innerHTML = '<p class="dua-empty" style="grid-column:1/-1;text-align:center;padding:32px 0;color:var(--ink-muted);">' +
        'No duas match that search yet. Try a different word, or clear the filter.</p>';
      if (loadMoreBtn) loadMoreBtn.style.display = 'none';
      return;
    }
    var next = view.slice(shown, shown + PAGE_SIZE);
    var html = '';
    for (var i = 0; i < next.length; i++) html += cardHTML(next[i]);
    grid.insertAdjacentHTML('beforeend', html);
    shown += next.length;
    if (loadMoreBtn) loadMoreBtn.style.display = shown < view.length ? '' : 'none';
  }

  function applyFilters() {
    // before the payload lands the grid holds the build-time cards; filtering
    // against an empty set would blank them out
    if (!hydrated) return;
    var q = query.trim();
    var qa = hasArabic(q) ? normArabic(q) : '';
    var ql = qa ? '' : normLatin(q);
    view = all.filter(function (d) {
      if (!inFacet(d)) return false;
      // Browsing shows one card per supplication; a search is intent-driven, so
      // variant narrations become findable again.
      if (!q && d.variantRole === 'variant') return false;
      if (!q) return true;
      if (qa) return normArabic(d.arabic).indexOf(qa) !== -1;
      var hay = normLatin((d.translation || '') + ' ' + (d.category || '') + ' ' + (d.transliteration || '') + ' ' + sourceLine(d));
      return hay.indexOf(ql) !== -1;
    });
    renderPage(true);
    updateResultCount();
  }

  function updateResultCount() {
    var el = document.getElementById('duaResultCount');
    if (el) el.textContent = view.length + (view.length === 1 ? ' dua' : ' duas');
  }

  /* ---------- facet navigation, rendered from the data ---------- */
  function goto(kind, value, push) {
    facet = { kind: kind, value: value };
    if (push !== false) history.pushState({ kind: kind, value: value }, '', facetURL(kind, value));
    paintNav(); paintHeading(); applyFilters();
    var sec = document.getElementById('duas-section');
    if (sec && kind !== 'all') sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function paintNav() {
    var occ = groupCounts('occasion');
    var sideAll = document.getElementById('dsbAll');
    if (sideAll) {
      sideAll.innerHTML = '<a class="dsb-item' + (facet.kind === 'all' ? ' active' : '') +
        '" href="dua.html" data-kind="all" data-value=""><span class="dsb-icon">🤲</span><span>All Duas</span>' +
        // before hydration `all` is empty; fall back to the build-time total so the
        // badge never paints a "0" the page then has to correct
        '<span class="dsb-count">' + (all.length || (facetData && facetData.total) || '') + '</span></a>';
    }
    var side = document.getElementById('dsbList');
    if (side) {
      side.innerHTML =
        occ.map(function (o) {
          var tip = o.slug === 'general'
            ? ' title="Miscellaneous duas that are not tied to one specific occasion"' : '';
          return '<a class="dsb-item' + (facet.kind === 'occasion' && facet.value === o.slug ? ' active' : '') +
            '" href="' + facetURL('occasion', o.slug) + '" data-kind="occasion" data-value="' + esc(o.slug) + '"' + tip + '>' +
            '<span class="dsb-icon">' + (o.icon || '🤲') + '</span><span>' + esc(o.label) + '</span>' +
            '<span class="dsb-count">' + o.n + '</span></a>';
        }).join('');
    }

    // Sources and the largest chapters, surfaced in the sidebar so the library's
    // breadth is visible without opening a disclosure. Both reuse the existing
    // ?source= / ?category= URLs — no new parameters.
    var HIDE_SOURCES = { other: 1, 'dua-dhikr': 1 }; // labels that name no source
    var CHAPTER_MIN = 15;   // natural break in the data: the next value down is 12

    var sideSrc = document.getElementById('dsbSources');
    if (sideSrc) {
      sideSrc.innerHTML = groupCounts('sourceLabel')
        .filter(function (s) { return !HIDE_SOURCES[s.slug]; })
        .map(function (s) {
          return '<a class="dsb-item' +
            (facet.kind === 'source' && facet.value === s.slug ? ' active' : '') +
            '" href="' + facetURL('source', s.slug) +
            '" data-kind="source" data-value="' + esc(s.slug) + '">' +
            '<span>' + esc(s.label) + '</span>' +
            '<span class="dsb-count">' + s.n + '</span></a>';
        }).join('');
    }

    var sideCh = document.getElementById('dsbChapters');
    if (sideCh) {
      sideCh.innerHTML = groupCounts('category')
        .filter(function (c) { return c.n >= CHAPTER_MIN; })
        .map(function (c) {
          return '<a class="dsb-item' +
            (facet.kind === 'category' && facet.value === c.slug ? ' active' : '') +
            '" href="' + facetURL('category', c.slug) +
            '" data-kind="category" data-value="' + esc(c.slug) + '">' +
            '<span>' + esc(c.label) + '</span>' +
            '<span class="dsb-count">' + c.n + '</span></a>';
        }).join('');
    }

    var chips = document.getElementById('catChips');
    if (chips) {
      chips.innerHTML = '<span class="cat-chip' + (facet.kind === 'all' ? ' active' : '') +
        '" data-kind="all" data-value="" role="button" tabindex="0">All</span>' +
        occ.slice(0, 7).map(function (o) {
          return '<span class="cat-chip' + (facet.kind === 'occasion' && facet.value === o.slug ? ' active' : '') +
            '" data-kind="occasion" data-value="' + esc(o.slug) + '" role="button" tabindex="0">' + esc(o.label) + '</span>';
        }).join('');
    }
    var grid = document.getElementById('catGrid');
    if (grid) {
      grid.innerHTML = occ.map(function (o) {
        return '<a class="cat-card" href="' + facetURL('occasion', o.slug) + '" data-kind="occasion" data-value="' + esc(o.slug) + '">' +
          '<span class="cat-icon">' + (o.icon || '🤲') + '</span>' +
          '<div class="cat-title">' + esc(o.label) + '</div>' +
          '<div class="cat-count">' + o.n + (o.n === 1 ? ' dua' : ' duas') + '</div></a>';
      }).join('') + allCategoriesHTML();
    }
  }

  /* Every one of the compilation's own chapter labels stays reachable, so the
     derived occasion facet never hides part of the library. */
  /* The chapter list is 132 links. Building it on every load put a large,
     immediately-styled subtree in the document for a panel most visitors never
     open, so it is filled in the first time the disclosure is opened. */
  function allCategoriesHTML() {
    var cats = groupCounts('category');
    var srcs = groupCounts('sourceLabel');
    return '<details class="all-cats" style="grid-column:1/-1;">' +
      '<summary>All ' + cats.length + ' chapter headings</summary>' +
      '<div class="src-row" style="margin-top:12px;">' + srcs.map(function (s) {
        return '<button class="src-chip' + (facet.kind === 'source' && facet.value === s.slug ? ' active' : '') +
          '" data-kind="source" data-value="' + esc(s.slug) + '">' + esc(s.label) + ' · ' + s.n + '</button>';
      }).join('') + '</div><ul data-lazy="chapters"></ul></details>';
  }
  function fillChapterList(ul) {
    if (!ul || ul.dataset.filled) return;
    ul.dataset.filled = '1';
    ul.innerHTML = groupCounts('category').map(function (c) {
      return '<li><a href="' + facetURL('category', c.slug) + '" data-kind="category" data-value="' + esc(c.slug) + '">' +
        esc(c.label) + ' <em>' + c.n + '</em></a></li>';
    }).join('');
  }

  function paintHeading() {
    var el = document.getElementById('catHeading');
    if (!el) return;
    if (facet.kind === 'all') { el.hidden = true; el.innerHTML = ''; document.title = baseTitle; return; }
    var label = facelabelSafe();
    var hits = all.filter(inFacet);
    // count what the grid actually shows; collapsed variants are stated, not hidden
    var shownN = hits.filter(function (d) { return d.variantRole !== 'variant'; }).length;
    var collapsed = hits.length - shownN;
    el.hidden = false;
    var note = hits[0] && hits[0].occasionNote && facet.kind === 'occasion' ? hits[0].occasionNote : '';
    el.innerHTML = '<h2>' + esc(label) + '</h2>' +
      (note ? '<p class="ch-meta" style="margin-bottom:3px;">' + esc(note) + '</p>' : '') +
      '<p class="ch-meta">' + shownN + (shownN === 1 ? ' supplication' : ' supplications') +
      (facet.kind === 'occasion' ? ' · grouped by occasion' : facet.kind === 'source' ? ' · from this collection' : ' · from this chapter') +
      (collapsed ? ' · ' + collapsed + ' further narration' + (collapsed === 1 ? '' : 's') + ' grouped under their lead card' : '') +
      '</p><button class="ch-back" data-kind="all" data-value="">← All duas</button>';
    document.title = label + ' — Duas — IslamicInfo';
  }
  function facelabelSafe() { return facetLabel() || 'Duas'; }

  /* ---------- live counts (never hardcoded) ---------- */
  function paintCounts() {
    var total, occasions;
    if (!all.length && facetData) { total = facetData.total; occasions = facetData.occasionCount; }
    else {
      total = all.length;
      var cats = {};
      all.forEach(function (d) { cats[d.category] = (cats[d.category] || 0) + 1; });
      occasions = Object.keys(cats).length;
    }

    var s1 = document.getElementById('statDuaCount');       if (s1) s1.textContent = total;
    var s2 = document.getElementById('statOccasionCount');  if (s2) s2.textContent = occasions;
    var sb = document.getElementById('sidebarAllCount');    if (sb) sb.textContent = total;

  }

  /* ---------- Dua of the Day ----------
     Rotates once per UTC day so every visitor sees the same dua on a given day
     (matching the site's other daily rotations), and prev/next step through the
     pool from that day's position. Contextual/guidance entries are excluded —
     the featured slot is a recommendation. */
  var fd = { pool: [], i: 0 };

  function fdRender() {
    var d = fd.pool[((fd.i % fd.pool.length) + fd.pool.length) % fd.pool.length];
    if (!d) return;
    var host = document.querySelector('.featured-dua');
    if (!host) return;
    var set = function (sel, text) {
      var el = host.querySelector(sel);
      if (!el) return;
      el.removeAttribute('data-i18n');      // stop i18n re-writing live data
      el.removeAttribute('data-i18n-html');
      el.textContent = text;
      el.style.display = text ? '' : 'none';
    };
    set('.fd-badge', '✦ ' + (d.category || 'Supplication'));
    set('.fd-arabic', d.arabic || '');
    set('.fd-transliteration', d.transliteration || '');
    set('.fd-trans', d.translation || '');
    set('.fd-source', '📖 ' + sourceLine(d));
    host.dataset.duaId = d.id;
  }

  function fdInit() {
    var host = document.querySelector('.featured-dua');
    if (!host) return;
    fd.pool = all.filter(function (x) { return !x.entryType && x.arabic && x.translation; });
    if (!fd.pool.length) return;
    fd.i = Math.floor(Date.now() / 86400000) % fd.pool.length;   // UTC-daily
    fdRender();

    var nav = host.querySelectorAll('.fd-nav-btn');
    if (nav.length >= 2) {
      nav[0].addEventListener('click', function (e) { e.preventDefault(); fd.i--; fdRender(); });
      nav[1].addEventListener('click', function (e) { e.preventDefault(); fd.i++; fdRender(); });
    }
    // featured copy / share / save act on whichever dua is showing
    host.querySelectorAll('.fd-action-btn').forEach(function (btn, idx) {
      btn.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation();
        var d = all.find(function (x) { return x.id === host.dataset.duaId; });
        if (!d) return;
        if (idx === 0) {
          navigator.clipboard.writeText(copyText(d))
            .then(function () { toast('Dua copied with source ✦'); })
            .catch(function () { toast('Could not copy'); });
        } else if (idx === 1) {
          if (navigator.share) navigator.share({ title: 'Dua — IslamicInfo', text: copyText(d) }).catch(function () {});
          else navigator.clipboard.writeText(copyText(d)).then(function () { toast('Dua copied to share ✦'); }).catch(function () {});
        } else {
          try {
            var key = 'ii-dua-bookmarks';
            var saved = JSON.parse(localStorage.getItem(key) || '[]');
            var at = saved.indexOf(d.id);
            if (at === -1) { saved.push(d.id); toast('Saved ✦'); } else { saved.splice(at, 1); toast('Removed from saved'); }
            localStorage.setItem(key, JSON.stringify(saved));
          } catch (err) { toast('Could not save (storage full)'); }
        }
      }, true);
    });
  }

  /* ---------- interactions (delegated: cards are dynamic) ---------- */
  function toast(msg) {
    var t = document.getElementById('dua-toast');
    if (!t) { t = document.createElement('div'); t.id = 'dua-toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove('show'); }, 2000);
  }

  function copyText(d) {
    var parts = [d.arabic];
    if (d.transliteration) parts.push(d.transliteration);
    parts.push(d.translation, '— ' + sourceLine(d));
    // the caveat travels with the text, so a copied contextual verse is never
    // mistaken for a recommended supplication
    if (d.contextNote) parts.push('[' + (d.contextLabel || 'Context') + '] ' + d.contextNote);
    return parts.filter(Boolean).join('\n\n');
  }

  function wireDelegates() {
    if (!grid) return;
    grid.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-act]');
      if (!btn || !grid.contains(btn)) return;
      var card = btn.closest('.dua-card');
      if (!card) return;
      var d = all.find(function (x) { return String(x.id) === card.dataset.id; });
      if (!d) return;
      var act = btn.dataset.act;

      if (act === 'copy') {
        navigator.clipboard.writeText(copyText(d))
          .then(function () { toast('Dua copied with source ✦'); })
          .catch(function () { toast('Could not copy'); });
      } else if (act === 'share') {
        var text = copyText(d);
        if (navigator.share) navigator.share({ title: 'Dua — IslamicInfo', text: text }).catch(function () {});
        else navigator.clipboard.writeText(text).then(function () { toast('Dua copied to share ✦'); }).catch(function () {});
      } else if (act === 'save') {
        try {
          var key = 'ii-dua-bookmarks';
          var saved = JSON.parse(localStorage.getItem(key) || '[]');
          var i = saved.indexOf(d.id);
          if (i === -1) { saved.push(d.id); btn.classList.add('saved'); toast('Saved ✦'); }
          else { saved.splice(i, 1); btn.classList.remove('saved'); toast('Removed from saved'); }
          localStorage.setItem(key, JSON.stringify(saved));
        } catch (err) { toast('Could not save (storage full)'); }
      }
    });
  }

  function wireControls() {
    if (searchEl) {
      var t;
      searchEl.addEventListener('input', function () {
        query = this.value;
        clearTimeout(t); t = setTimeout(applyFilters, 140);
      });
    }
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', function (e) { e.preventDefault(); renderPage(false); });
    }
    // One delegated handler for every facet control — the nav is re-rendered on
    // each change, so per-element listeners would go stale.
    document.addEventListener('click', function (e) {
      var el = e.target.closest('[data-kind]');
      if (!el) return;
      var host = el.closest('#dsbAll, #dsbList, #dsbSources, #dsbChapters, #catChips, #catGrid, #catHeading, .all-cats');
      if (!host) return;
      e.preventDefault();
      goto(el.dataset.kind, el.dataset.value || '');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var el = e.target.closest && e.target.closest('.cat-chip[data-kind]');
      if (!el) return;
      e.preventDefault(); goto(el.dataset.kind, el.dataset.value || '');
    });
    // fill the chapter list only when its disclosure is first opened
    document.addEventListener('toggle', function (e) {
      if (e.target.classList && e.target.classList.contains('all-cats') && e.target.open) {
        fillChapterList(e.target.querySelector('ul[data-lazy="chapters"]'));
      }
    }, true);
    // browser back/forward moves between category views
    window.addEventListener('popstate', function () {
      facet = facetFromURL(); paintNav(); paintHeading(); applyFilters();
    });
  }

  /* ---------- boot ---------- */
  function fail(msg) {
    if (!grid) return;
    grid.innerHTML = '<p class="dua-empty" style="grid-column:1/-1;text-align:center;padding:32px 0;color:var(--ink-muted);">' + esc(msg) + '</p>';
    if (loadMoreBtn) loadMoreBtn.style.display = 'none';
  }

  function init() {
    grid = document.querySelector('.dua-grid');
    searchEl = document.getElementById('duaSearch');
    loadMoreBtn = document.querySelector('.load-more-btn');
    if (!grid) return;

    baseTitle = document.title;
    facet = facetFromURL();
    var q = new URLSearchParams(location.search).get('q');
    if (q) { query = q; if (searchEl) searchEl.value = q; }

    // 1. paint from what is already in the HTML: counts, nav, and the first page
    //    of cards are rendered at build time, so nothing here waits on a fetch.
    var inline = document.getElementById('duaFacets');
    if (inline) { try { facetData = JSON.parse(inline.textContent); } catch (e) { facetData = null; } }
    if (facetData) { paintCounts(); paintNav(); }
    wireControls();

    // 2. fetch the payload only after first paint, so it can never delay LCP
    var start = function () {
      fetch(CORPUS_URL)
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (doc) {
          all = expand(doc).filter(function (d) {
            return d && d.translation && String(d.translation).trim() && d.entryType !== 'guidance';
          });
          if (!all.length) return fail('Dua library is unavailable right now.');
          hydrated = true;
          wireDelegates(); fdInit();
          // The build-time cards are already the correct first page of the
          // default view, so re-rendering them just costs layout work. Adopt
          // them instead and only render when the view actually changes.
          var pre = grid.querySelectorAll('.dua-card').length;
          var untouched = facet.kind === 'all' && !query.trim() && pre > 0;
          if (untouched) {
            view = all.filter(function (d) { return d.variantRole !== 'variant'; });
            shown = pre;
            if (loadMoreBtn) loadMoreBtn.style.display = shown < view.length ? '' : 'none';
            updateResultCount();
          } else {
            paintHeading();
            applyFilters();
          }
        })
        .catch(function () {
          // the pre-rendered cards stay on screen; only the live features are lost
          if (searchEl) { searchEl.disabled = true; searchEl.placeholder = 'Search is unavailable — please refresh'; }
        });
    };
    // The first screen is already usable from the HTML, so the payload waits for
    // idle time rather than competing with the page's other scripts — but any
    // interaction that needs live data pulls it in immediately.
    var started = false;
    var kick = function () {
      if (started) return; started = true;
      if (window.requestIdleCallback) requestIdleCallback(start, { timeout: 4000 });
      else setTimeout(start, 300);
    };
    var eager = function () { if (!started) { started = true; start(); } };
    ['focus', 'input'].forEach(function (ev) { if (searchEl) searchEl.addEventListener(ev, eager, { once: true }); });
    document.addEventListener('pointerdown', function (e) {
      if (e.target.closest && e.target.closest('[data-kind],.load-more-btn,.fd-nav-btn')) eager();
    }, true);
    if (document.readyState === 'complete') kick();
    else window.addEventListener('load', kick);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
