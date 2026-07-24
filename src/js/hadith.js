/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — hadith.js  (Module 1 · Stage-1 foundation)
   Wires hadith.html sidebar, collections grid, stats strip, Hadith of the
   Day, filter tabs, Browse routing, Continue-Reading, and the mobile
   bottom-sheet to live Module 0 data. No visual redesign.
   Requires (loaded before this): api.js (window.II.api), ui-utils.js
   (window.II.ui), hadith-collections-core.js (window.II.hadithCollections).
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var II = window.II || {};
  var api = II.api, ui = II.ui, core = II.hadithCollections, feed = II.hadithFeed;
  var RP = II.readingProgress;
  var actions = II.hadithActions;
  var topics = II.hadithTopics;
  var TOPIC = { active: null, ready: false, _lastCount: null };   // in-place Browse-by-Topic filter state
  var _topicTimer = null;
  function feedHadithText(h) {
    if (!h) return '';
    return [h.arabicMatn, h.translation && h.translation.text, h.reference,
            h.narrator && h.narrator.name].filter(Boolean).join(' ');
  }
  var BM_KEY = 'islamicinfo-hadith-bookmarks', NOTE_KEY = 'islamicinfo-hadith-notes';
  var TRANS_PREF_KEY = 'islamicinfo-hadith-translation-pref';   // US-H23 preferred translation edition
  // Canonical origin for copyable citations. No shared/exported constant exists in the codebase
  // (reflection-actions.js/quran-share.js each define their own literal), so follow that
  // per-module convention. Deliberately NOT location.origin — a localhost URL must never leak
  // into a hadith citation copied off the page.
  var SITE = 'https://islamicinfo.org';
  function getBookmarks() { var v = ui.safeLocalStorageGet(BM_KEY, []); return Array.isArray(v) ? v : []; }
  function setBookmarks(list) { ui.safeLocalStorageSet(BM_KEY, actions ? actions.dedupeByRef(list) : list); }
  function getNotes() { var v = ui.safeLocalStorageGet(NOTE_KEY, []); return Array.isArray(v) ? v : []; }
  function setNotes(list) { ui.safeLocalStorageSet(NOTE_KEY, list); }
  function parseRefParts(ref) {
    var parts = String(ref).split(':');
    return { slug: parts[0] || null, book: parts.length > 2 ? parts[1] : null, num: parts[parts.length - 1] || null };
  }
  if (!api || !ui || !core) { console.error('[hadith.js] missing II.api/ui/hadithCollections'); return; }

  var META_URL = 'src/data/hadith/collections-meta.json';
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var esc = ui.escapeHTML;

  var state = { collections: [], activeTab: 'all', meta: {} };

  /* ── Templates (reproduce locked .collection-card / .sidebar-item anatomy) ── */
  function toneStyle(tone) { return ' style="color:' + core.toneColor(tone) + ';"'; }
  function dotStyle(tone) { return ' style="background:' + core.toneColor(tone) + ';"'; }

  /* ── Module 12: illustrated collection motifs (US-H17) ──
     Custom inline line-art, one per collection that has full metadata (the 9 real slugs in
     collections-meta.json). 64×64 viewBox, currentColor stroke (themed teal via .card-motif-svg)
     + a single var(--gold-500) accent, no fills beyond the gold accent — readable at 32px.
     These are trusted code literals (not user/JSON data), so they are injected as raw HTML.
     Slugs not in this map fall back to the meta emoji. The other ~9 PRD collections are
     deferred until they exist as real collections (same gap as Module 1/2/11). */
  var MS_OPEN = '<svg class="card-motif-svg" width="44" height="44" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
  var MOTIF_SVG = {
    // 8-pointed star (square + diamond) with gold center — premier authenticity
    'sahih-bukhari': MS_OPEN + '<rect x="17" y="17" width="30" height="30"/><path d="M32 9 L55 32 L32 55 L9 32 Z"/><circle cx="32" cy="32" r="4.5" fill="var(--gold-500)" stroke="none"/></svg>',
    // Octagon (rub el hizb) with an inner gold 8-point star
    'sahih-muslim': MS_OPEN + '<path d="M22 8 H42 L56 22 V42 L42 56 H22 L8 42 V22 Z"/><path d="M32 20 L35 29 L44 32 L35 35 L32 44 L29 35 L20 32 L29 29 Z" fill="var(--gold-500)" stroke="none"/></svg>',
    // Open book with a gold spine
    'abu-dawood': MS_OPEN + '<path d="M32 18 C26 14 16 14 10 16 V46 C16 44 26 44 32 48"/><path d="M32 18 C38 14 48 14 54 16 V46 C48 44 38 44 32 48"/><path d="M32 18 V48" stroke="var(--gold-500)"/></svg>',
    // Crescent with a gold star
    'al-tirmidhi': MS_OPEN + '<path d="M42 14 A20 20 0 1 0 42 50 A15.5 15.5 0 1 1 42 14 Z"/><path d="M52 15 L54 21 L60 23 L54 25 L52 31 L50 25 L44 23 L50 21 Z" fill="var(--gold-500)" stroke="none"/></svg>',
    // Mihrab arch with a gold finial
    'sunan-nasai': MS_OPEN + '<path d="M16 53 V30 C16 20 23 13 32 13 C41 13 48 20 48 30 V53"/><path d="M14 53 H50"/><path d="M32 13 V7" stroke="var(--gold-500)"/><circle cx="32" cy="6" r="2.6" fill="var(--gold-500)" stroke="none"/></svg>',
    // Scroll with a gold wax seal
    'ibn-e-majah': MS_OPEN + '<path d="M20 15 H46 V45 C46 49 43 52 39 52 H17 C21 52 22 49 22 45 V17"/><path d="M20 15 C16 15 15 18 15 20 C15 22 17 23 20 23 H26"/><path d="M27 27 H40 M27 34 H40"/><circle cx="34" cy="47" r="3.6" fill="var(--gold-500)" stroke="none"/></svg>',
    // Stacked books, top edge gold
    'musnad-ahmad': MS_OPEN + '<rect x="13" y="41" width="38" height="9" rx="1.5"/><rect x="16" y="30" width="32" height="9" rx="1.5"/><rect x="19" y="19" width="26" height="9" rx="1.5" stroke="var(--gold-500)"/></svg>',
    // Niche (mishkat) holding a lamp with a gold flame
    'mishkat': MS_OPEN + '<path d="M16 53 V29 C16 20 23 12 32 12 C41 12 48 20 48 29 V53"/><path d="M32 21 V29"/><path d="M26 35 H38 L35 45 H29 Z"/><path d="M32 27 C34 30 34 33 32 35 C30 33 30 30 32 27 Z" fill="var(--gold-500)" stroke="none"/></svg>',
    // Chain links (silsila) with a gold end link
    'al-silsila-sahiha': MS_OPEN + '<rect x="9" y="27" width="20" height="10" rx="5"/><rect x="25" y="27" width="20" height="10" rx="5"/><rect x="41" y="27" width="14" height="10" rx="5" stroke="var(--gold-500)"/></svg>',
  };
  function motifHTML(c) {
    var svg = c && MOTIF_SVG[c.slug];
    if (svg) return '<div class="card-motif">' + svg + '</div>';
    return (c && c.motif) ? ('<div class="card-motif">' + esc(c.motif) + '</div>') : '';
  }

  function cardHTML(c) {
    var hadiths = core.formatInt(c.hadithCount);
    var books = core.formatInt(c.chaptersCount);
    var compiler = [c.compiler, c.lifespan].filter(Boolean).map(esc).join(' · ');
    var seal = c.featured ? '<div class="featured-seal">✦ Most Authentic</div>' : '';
    var third = c.compiledPeriod ? ('<div class="card-stat"><div class="card-stat-num">' + esc(c.compiledPeriod) + '</div><div class="card-stat-label">Compiled</div></div>') : '';
    var arabic = c.nameArabic ? ('<div class="card-arabic">' + esc(c.nameArabic) + '</div>') : '';
    var motif = motifHTML(c);
    return '' +
      '<div class="collection-card' + (c.featured ? ' featured' : '') + '" data-slug="' + esc(c.slug) + '" data-cat="' + esc(c.category) + '">' +
        seal + motif +
        '<div class="card-name">' + esc(c.nameEnglish) + '</div>' +
        arabic +
        (compiler ? '<div class="card-compiler">' + compiler + '</div>' : '') +
        '<div class="card-divider"></div>' +
        '<div class="card-stats">' +
          '<div class="card-stat"><div class="card-stat-num">' + esc(hadiths) + '</div><div class="card-stat-label">Hadiths</div></div>' +
          '<div class="card-stat"><div class="card-stat-num">' + esc(books) + '</div><div class="card-stat-label">Books</div></div>' +
          third +
        '</div>' +
        '<div class="card-footer">' +
          '<div class="authenticity-badge"' + toneStyle(c.authTone) + '><div class="authenticity-dot"' + dotStyle(c.authTone) + '></div><span>' + esc(c.authLabel || 'Grade Unavailable') + '</span></div>' +
          '<a class="browse-btn" href="/hadith/' + encodeURIComponent(c.slug) + '" data-browse="' + esc(c.slug) + '">Browse →</a>' +
        '</div>' +
      '</div>';
  }

  function sidebarRowHTML(c) {
    var count = c.hadithCount != null ? core.formatInt(c.hadithCount) : '';
    var badge = count ? ' <span class="count-badge">' + esc(count) + '</span>' : '';
    return '<a class="sidebar-item" href="/hadith/' + encodeURIComponent(c.slug) + '" data-browse="' + esc(c.slug) + '">' + esc(c.nameEnglish) + badge + '</a>';
  }

  function gridSkeleton(n) {
    var out = '';
    for (var i = 0; i < (n || 6); i++) {
      out += '<div class="collection-card" aria-hidden="true" style="opacity:.5;">' +
        '<div style="height:24px;width:40%;background:rgba(0,105,110,.1);border-radius:6px;margin-bottom:14px;"></div>' +
        '<div style="height:60px;background:rgba(0,105,110,.06);border-radius:10px;"></div></div>';
    }
    return out;
  }

  /* ── Renders ── */
  function renderGrid(list) {
    var grid = $('#collections'); if (!grid) return;
    if (!list.length) { grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--ink-muted);padding:32px;">No collections available.</div>'; return; }
    grid.innerHTML = list.map(cardHTML).join('');
  }

  function renderSidebar(list) {
    var box = $('#ii-sidebar-collections'); if (!box) return;
    box.innerHTML = list.map(sidebarRowHTML).join('');
  }

  function renderStats(list) {
    var s = core.aggregateStats(list);
    var total = $('#ii-stat-total');
    if (total) { var f = core.formatCountK(s.totalHadiths); total.innerHTML = esc(f.lead) + (f.suffix ? '<span>' + f.suffix + '</span>' : ''); }
    var colls = $('#ii-stat-collections');
    if (colls) colls.textContent = String(s.collectionCount);
  }

  function announce(list) {
    var el = $('#ii-filter-status'); if (el) el.textContent = 'Showing ' + list.length + ' collection' + (list.length === 1 ? '' : 's');
  }

  function applyFilter() {
    var visible = state.collections.filter(function (c) { return core.inCategory(c, state.activeTab); });
    renderGrid(visible); announce(visible);
    reflectActiveRoute();
  }

  /* ── Filter tabs (in-place, no route change) ── */
  function wireFilterTabs() {
    var tabs = document.querySelectorAll('.filter-tab');
    var MAP = ['all', 'sittah', 'musnad', 'selected'];
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.classList.remove('active'); t.setAttribute('aria-pressed', 'false'); });
        tab.classList.add('active'); tab.setAttribute('aria-pressed', 'true');
        state.activeTab = MAP[i] || 'all';
        applyFilter();
      });
      tab.setAttribute('aria-pressed', tab.classList.contains('active') ? 'true' : 'false');
    });
  }

  /* ── Path-based routing (ADR-026): /hadith/[collection]/[book]/[hadith] ──
     Tier 1 = /hadith.html (this file). Tier 2 (this module) = /hadith/[collection] (books grid).
     Tier 3a/3b = /hadith/[collection]/[book][/hadith] (Module 7 — honest placeholder here).
     Client nav = pushState; deep-link/refresh survives via the GitHub Pages 404.html SPA
     fallback which lands on /hadith.html?redirect=<path>, restored to a clean URL in init(). */

  // Collections with no fixed book structure — Browse skips Tier 2, straight to Tier 3a (TechSpec §10).
  var BOOKLESS = { 'riyad-assalihin': 1, 'nawawi40': 1, 'musnad-ahmad': 1 };
  // Direct-source collections (fawazahmed0 / AhmedBaset CDNs — Bulugh al-Maram, Muwatta,
  // al-Adab al-Mufrad, Shamail, Darimi, Forty Qudsi, Shah Waliullah, etc.) have no Tier-2
  // books endpoint on the hadithapi Worker, so their books grid failed ("Books temporarily
  // unavailable"). Treat every non-hadithapi collection as bookless → skip the grid and
  // render the flat Tier-3a hadith list directly (fetchHadithsByBook returns the whole
  // collection for direct sources). hadithapi collections keep their real books grid.
  function isBookless(slug) {
    if (BOOKLESS[slug]) return true;
    return !!(api && typeof api.hadithProviderOf === 'function' && api.hadithProviderOf(slug) !== 'hadithapi');
  }

  function collectionBySlug(slug) { return state.collections.filter(function (x) { return x.slug === slug; })[0] || null; }

  function parseRoute(path) {
    try { path = decodeURIComponent(path || location.pathname); } catch (_) { path = path || location.pathname; }
    var t = path.match(/^\/hadith\/trace\/([^\/?#]+)\/([^\/?#]+)\/([^\/?#]+)\/?$/);   // Module 14 trace route (4-seg; must precede the 3-seg match)
    if (t) return { trace: true, collection: t[1], book: t[2], hadith: t[3] };
    if (/^\/hadith\/compare\/?$/.test(path)) return { compare: true };   // Module 15 compare route (refs read from ?refs=)
    var m = path.match(/^\/hadith\/([^\/?#]+)(?:\/([^\/?#]+))?(?:\/([^\/?#]+))?\/?$/);
    if (!m) return { collection: null, book: null, hadith: null };
    return { collection: m[1] || null, book: m[2] || null, hadith: m[3] || null };
  }
  function routePath(r) {
    if (r && r.trace && r.collection) {   // Module 14 trace route
      return '/hadith/trace/' + encodeURIComponent(r.collection) + '/' + encodeURIComponent(r.book) + '/' + encodeURIComponent(r.hadith);
    }
    if (r && r.compare) return '/hadith/compare';   // Module 15 (refs live in ?refs=, added by openCompareRoute)
    if (!r || !r.collection) return '/hadith.html';
    var p = '/hadith/' + encodeURIComponent(r.collection);
    if (r.book != null && r.book !== '') { p += '/' + encodeURIComponent(r.book); if (r.hadith != null && r.hadith !== '') p += '/' + encodeURIComponent(r.hadith); }
    return p;
  }
  function currentSlug() { return parseRoute().collection; }

  function reflectActiveRoute(slug) {
    slug = slug || currentSlug();
    document.querySelectorAll('.sidebar-item[data-browse]').forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('data-browse') === slug);
    });
  }

  /* ── Tier 2 view container (created once in .main; CSS hides Tier-1 sections when data-tier=2) ── */
  function setTier(n) { var main = $('.main'); if (main) main.setAttribute('data-tier', n ? String(n) : '1'); }
  function tier2El() {
    var main = $('.main'); if (!main) return null;
    var el = $('#ii-tier2');
    if (!el) { el = document.createElement('div'); el.id = 'ii-tier2'; main.appendChild(el); }
    return el;
  }
  function collectionHeaderHTML(c) {
    var arabic = c.nameArabic ? '<div class="collection-header-arabic">' + esc(c.nameArabic) + '</div>' : '';
    var meta = [c.compiler, c.lifespan].filter(Boolean).map(esc).join(' · ');
    var crumbs = '<nav class="dv-breadcrumb" aria-label="Breadcrumb" style="margin-bottom:12px;">' +
      '<a class="dv-crumb" href="/hadith.html">Hadith</a>' +
      '<span class="dv-crumb-sep" aria-hidden="true">›</span>' +
      '<span class="dv-crumb dv-crumb-current" aria-current="page">' + esc(c.nameEnglish) + '</span>' +
      '</nav>';
    return '<div class="collection-header">' +
      '<a class="back-btn" href="/hadith.html">↩ All Collections</a>' + crumbs +
      '<h1 class="collection-header-name">' + esc(c.nameEnglish) + '</h1>' + arabic +
      (meta ? '<div class="collection-header-meta">' + meta + '</div>' : '') + '</div>';
  }
  function booksSkeleton() {
    var out = '';
    for (var i = 0; i < 6; i++) out += '<div class="book-card" aria-hidden="true" style="opacity:.5;"><div style="height:24px;width:30%;background:rgba(0,105,110,.1);border-radius:6px;"></div><div style="height:34px;margin-top:12px;background:rgba(0,105,110,.06);border-radius:8px;"></div></div>';
    return out;
  }
  function bookCardHTML(c, b) {
    var num = b.bookNumber;
    var count = (typeof b.hadithCount === 'number') ? core.formatInt(b.hadithCount) : '';
    var arabic = b.bookArabicName ? '<div class="book-arabic">' + esc(b.bookArabicName) + '</div>' : '';
    var badge = count ? '<span class="count-badge">' + esc(count) + ' hadiths</span>' : '';
    return '<a class="book-card" href="' + routePath({ collection: c.slug, book: num }) + '">' +
      '<span class="book-num">' + esc(num) + '</span>' +
      '<div class="book-name">' + esc(b.bookName || ('Book ' + num)) + '</div>' + arabic + badge +
      '<span class="book-browse">Browse hadiths →</span></a>';
  }
  function renderBooksError(c) {
    var grid = $('#ii-books-grid'); if (!grid) return;
    grid.innerHTML = '<div class="books-error"><div class="books-empty-title">Books temporarily unavailable</div>' +
      '<div>We couldn’t load the books for this collection.</div>' +
      '<button class="btn-glass" id="ii-books-retry" type="button" style="margin-top:14px;">Try again</button></div>';
    var retry = $('#ii-books-retry'); if (retry) retry.addEventListener('click', function () { loadBooksGrid(c); });
  }
  async function loadBooksGrid(c) {
    setTier(2);
    var el = tier2El(); if (!el) return;
    el.innerHTML = collectionHeaderHTML(c) + '<div class="books-grid" id="ii-books-grid">' + booksSkeleton() + '</div>';
    var res; try { res = await api.fetchHadithBooks(c.slug); } catch (_) { res = null; }
    var grid = $('#ii-books-grid'); if (!grid) return;                      // route changed mid-fetch
    if (!res || !res.ok || !Array.isArray(res.data) || !res.data.length) { renderBooksError(c); return; }
    grid.innerHTML = res.data.map(function (b) { return bookCardHTML(c, b); }).join('');
  }
  // Al-Silsila as-Sahiha has no structured browse endpoint → live Arabic keyword
  // search against the Worker's Dorar.net proxy (/api/hadith/dorar/search), rendered
  // with the pure II.dorarCard renderer. Never a static reference-link list (superseded).
  var SILSILA = { q: '', page: 1, items: [] };
  function renderSilsilaSearch(c) {
    setTier(2);
    var el = tier2El(); if (!el) return;
    el.innerHTML = collectionHeaderHTML(c) +
      '<form class="dorar-search" id="ii-dorar-form" role="search">' +
        '<input id="ii-dorar-q" type="search" dir="rtl" lang="ar" placeholder="ابحث في السلسلة الصحيحة…" aria-label="Search Silsila as-Sahiha (Arabic)">' +
        '<button class="btn-glass" type="submit">بحث</button>' +
      '</form>' +
      '<p class="dorar-help">Search Arabic keywords across al-Albani\'s Silsila as-Sahiha. Grading data from the Hadith Encyclopedia, Dorar.net (الدرر السنية).</p>' +
      '<div id="ii-dorar-results" aria-live="polite"></div>';
    var form = document.getElementById('ii-dorar-form');
    if (form) form.addEventListener('submit', function (e) {
      e.preventDefault();
      SILSILA.q = (document.getElementById('ii-dorar-q').value || '').trim();
      SILSILA.page = 1; SILSILA.items = [];
      if (SILSILA.q) runSilsilaSearch(true);
    });
  }
  async function runSilsilaSearch(reset) {
    var out = document.getElementById('ii-dorar-results'); if (!out) return;
    if (reset) out.innerHTML = '<div class="dorar-loading">Searching…</div>';
    var res; try { res = await api.fetchDorarSilsila(SILSILA.q, SILSILA.page); } catch (_) { res = null; }
    out = document.getElementById('ii-dorar-results'); if (!out) return;   // route may have changed mid-fetch
    if (!res || !res.ok) {
      var code = res && res.error && res.error.code;
      var msg = code === 'quota' ? 'Daily search limit reached — try again tomorrow.'
              : 'Search temporarily unavailable — try again.';
      if (!reset && SILSILA.items.length) {
        // Load-more failure: keep the results already shown, roll the page back to the last
        // successful one, and offer a retry — never wipe good cards on a transient error.
        SILSILA.page = Math.max(1, SILSILA.page - 1);
        var kept = SILSILA.items.map(function (it) { return II.dorarCard.buildDorarCardHTML(it); }).join('');
        out.innerHTML = '<div class="dorar-results-list">' + kept + '</div>' +
          '<div class="books-error"><div class="books-empty-title">' + msg + '</div>' +
          '<button class="dorar-more" id="ii-dorar-more" type="button">Try again</button></div>';
        var retry = document.getElementById('ii-dorar-more');
        if (retry) retry.addEventListener('click', function () { SILSILA.page += 1; runSilsilaSearch(false); });
        return;
      }
      out.innerHTML = '<div class="books-error"><div class="books-empty-title">' + msg + '</div></div>';
      return;
    }
    var items = (res.data && res.data.items) || [];
    if (reset && !items.length) { out.innerHTML = '<div class="books-empty"><div class="books-empty-title">No narrations matched.</div></div>'; return; }
    SILSILA.items = SILSILA.items.concat(items);
    var cards = SILSILA.items.map(function (it) { return II.dorarCard.buildDorarCardHTML(it); }).join('');
    var more = items.length ? '<button class="dorar-more" id="ii-dorar-more" type="button">Load more</button>' : '';
    out.innerHTML = '<div class="dorar-results-list">' + cards + '</div>' + more;
    var moreBtn = document.getElementById('ii-dorar-more');
    if (moreBtn) moreBtn.addEventListener('click', function () { SILSILA.page += 1; runSilsilaSearch(false); });
  }
  /* ── Module 11: topic index / landing ── */
  var TOPIC_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></svg>';
  function topicsBreadcrumb(currentLabel) {
    var crumbs = '<a class="dv-crumb" href="/hadith.html">Hadith</a><span class="dv-crumb-sep" aria-hidden="true">›</span>';
    if (currentLabel) {
      crumbs += '<a class="dv-crumb" href="/hadith/topics">Topics</a><span class="dv-crumb-sep" aria-hidden="true">›</span>' +
                '<span class="dv-crumb dv-crumb-current" aria-current="page">' + esc(currentLabel) + '</span>';
    } else {
      crumbs += '<span class="dv-crumb dv-crumb-current" aria-current="page">Topics</span>';
    }
    return '<nav class="dv-breadcrumb" aria-label="Breadcrumb" style="margin-bottom:12px;">' + crumbs + '</nav>';
  }
  function renderTopics(topicKey) {
    if (topicKey) renderTopicLanding(topicKey);
    else renderTopicIndex();
  }
  function renderTopicIndex() {
    setTier(2);
    var el = tier2El(); if (!el || !topics) return;
    var cards = topics.TOPICS.map(function (t) {
      return '<a class="topic-card" href="/hadith/topics/' + encodeURIComponent(t.key) + '">' +
        '<span class="topic-card-icon">' + TOPIC_ICON + '</span>' +
        '<span class="topic-card-name">' + esc(t.label) + '</span>' +
        '<span class="topic-card-cta">Study this topic →</span></a>';
    }).join('');
    el.innerHTML = topicsBreadcrumb('') +
      '<div class="topic-index-head"><h1 class="collection-header-name">Topics</h1>' +
      '<p class="topic-index-sub">Browse hadith by subject. Curated topic statistics and study aids are being prepared and will appear after review.</p></div>' +
      '<div class="topic-index-grid">' + cards + '</div>';
  }
  function renderTopicLanding(key) {
    var t = topics && topics.topicByKey(key);
    if (!t) { try { history.replaceState(null, '', '/hadith/topics'); } catch (_) {} renderTopicIndex(); return; }
    setTier(2);
    var el = tier2El(); if (!el) return;
    el.innerHTML = topicsBreadcrumb(t.label) +
      '<div class="topic-landing-head"><h1 class="collection-header-name">' + esc(t.label) + '</h1>' +
      '<p class="topic-landing-note">Curated study aids for this topic — scholarly summary, key narrations, and study order — are being prepared and will appear after review.</p></div>' +
      '<div class="topic-landing-body">' +
        '<div class="topic-feed">' +
          '<div class="topic-feed-label">Hadith matching “' + esc(t.label) + '” — a keyword match across the loaded hadith, not a curated topic classification.</div>' +
          '<div id="ii-topic-feed-list"></div>' +
        '</div>' +
        '<aside class="topic-rail" id="ii-topic-rail"></aside>' +
      '</div>';
    renderTopicFeed(t);
  }
  function loadedHadithArray() {
    return Object.keys(FEED.byRef).map(function (r) { return FEED.byRef[r]; });
  }
  function renderTopicFeed(t) {
    var listEl = $('#ii-topic-feed-list'); if (!listEl) return;
    var loaded = loadedHadithArray();
    if (!loaded.length) {                                  // direct deep-link before the feed loaded
      listEl.innerHTML = '<div class="topic-feed-loading">Loading hadith…</div>';
      loadHadithFeed(false).then(function () {
        if ($('#ii-topic-feed-list') !== listEl) return;   // navigated away
        if (loadedHadithArray().length) { renderTopicFeed(t); return; }   // feed arrived → render
        // zero hadith loaded → stop (never recurse); honest message, no re-fetch
        listEl.innerHTML = '<div class="topic-feed-empty">Hadith couldn’t be loaded right now — please try again shortly.</div>';
      });
      return;
    }
    var kw = t.keyword.toLowerCase();
    var matches = loaded.filter(function (h) { return feedHadithText(h).toLowerCase().indexOf(kw) !== -1; });
    if (!matches.length) {
      listEl.innerHTML = '<div class="topic-feed-empty">No matching hadith in the loaded set yet. Full cross-collection topic search arrives with curated topic data.</div>';
    } else {
      listEl.innerHTML = matches.map(feed.buildCardHTML).join('');
      markCardStates(listEl);                              // Module 10 gold dots
    }
    renderTopicRail(t, loaded);
  }
  function renderTopicRail(t, loaded) {
    var rail = $('#ii-topic-rail'); if (!rail || !topics) return;
    var withText = loaded.map(function (h) { return { text: feedHadithText(h) }; });
    var co = topics.coOccurringTopics(withText, t.keyword, topics.TOPICS);
    if (!co.length) { rail.style.display = 'none'; rail.innerHTML = ''; return; }   // honest empty → omit
    rail.style.display = '';
    rail.innerHTML = '<h2 class="topic-rail-title">Also appears in these hadith</h2>' +
      '<p class="topic-rail-note">Topics whose keywords co-occur in the loaded hadith — a text signal over the loaded sample, not a curated relationship.</p>' +
      '<ul class="topic-rail-list">' + co.map(function (x) {
        return '<li><a href="/hadith/topics/' + encodeURIComponent(x.key) + '">' + esc(x.label) +
          '</a><span class="topic-rail-count">' + x.count + '</span></li>';
      }).join('') + '</ul>';
  }

  // Tier 3a/3b live in Module 7; render an honest interim (back nav works) rather than faking a list.
  function renderTier3Placeholder(r, c) {
    setTier(2);
    var el = tier2El(); if (!el) return;
    var seg = r.hadith ? (' · Hadith ' + esc(r.hadith)) : (r.book ? (' · Book ' + esc(r.book)) : '');
    el.innerHTML = collectionHeaderHTML(c) +
      '<div class="books-empty"><div class="books-empty-title">' + esc(c.nameEnglish) + seg + '</div>' +
      '<div>The hadith reading view (Tier 3) arrives in the next module.</div></div>';
  }

  function renderRoute(r) {
    r = r || parseRoute();
    // Module 16: drop any standing Study/Reading <html> classes on every route change;
    // renderDeepView re-applies the mode synchronously for Tier-3b routes (no flash),
    // so non-deep-view routes (feed / list / grid / topics) render with normal chrome.
    if (II.tier3 && II.tier3.clearModeClasses) II.tier3.clearModeClasses();
    if (r.compare) {   // Module 15 — refs come from ?refs= (not the path), mirroring the grade-filter pattern
      var refsParam; try { refsParam = new URLSearchParams(location.search).get('refs'); } catch (_) { refsParam = ''; }
      var refs = compareCore() ? compareCore().parseRefs(refsParam) : [];
      if (II.compareView) II.compareView.open(refs, { viaRoute: true });
      return;
    }
    // Navigating to a NON-compare route while the compare overlay is open (Back/popstate):
    // close it with skipNav (renderRoute is already rendering the target). Runs only when leaving
    // compare because the compare branch above return's early on entry — no render/popstate loop.
    if (II.compareView && II.compareView.isOpen && II.compareView.isOpen()) { II.compareView.close({ skipNav: true }); }
    if (r.trace) {   // Module 14 — render the deep-view underneath, then open the trace overlay on top
      var tc = collectionBySlug(r.collection);
      if (!tc) { setTier(1); applyFilter(); try { history.replaceState(null, '', '/hadith.html'); } catch (_) {} return; }
      if (II.tier3) II.tier3.renderDeepView({ collection: r.collection, book: r.book, hadith: r.hadith }, tc);
      if (II.traceView) II.traceView.open((r.collection + ':' + r.book + ':' + r.hadith), { viaRoute: true, route: { collection: r.collection, book: r.book, hadith: r.hadith } });
      return;
    }
    // Navigating to a NON-trace route while the overlay is open (Back/popstate): hide the overlay
    // but pass skipNav — renderRoute is ALREADY rendering the target, so exitTrace's replaceState+
    // renderRoute must not fire (would double-render / fight history). close() has cleared state.open
    // before exitTrace, so no reentry loop here.
    if (II.traceView && II.traceView.isOpen && II.traceView.isOpen()) { II.traceView.close({ skipNav: true }); }
    reflectActiveRoute(r.collection);
    updateContinueReading(r.collection);
    if (!r.collection) {
      setTier(1);
      var tk = readTopicFromUrl();
      if (TOPIC.ready && tk && topics && topics.isTopicKey(tk)) {   // popstate → topic state
        if (TOPIC.active !== tk) selectTopic(tk, false, 0);
        return;
      }
      if (TOPIC.ready && !tk && TOPIC.active) { clearTopicFilter(false); return; }  // popstate → neutral
      applyFilter();
      return;
    }
    if (r.collection === 'topics') { renderTopics(r.book); return; }   // Module 11
    var c = collectionBySlug(r.collection);
    if (!c) { setTier(1); applyFilter(); try { history.replaceState(null, '', '/hadith.html'); } catch (_) {} return; } // invalid → Tier 1 (TechSpec §10)
    if (r.collection === 'al-silsila-sahiha') { renderSilsilaSearch(c); return; }   // no structured browse data → live Dorar search
    if (r.hadith) { if (II.tier3) II.tier3.renderDeepView(r, c); else renderTier3Placeholder(r, c); return; }   // Tier 3b
    if (r.book || isBookless(r.collection)) { if (II.tier3) II.tier3.renderList(r, c); else renderTier3Placeholder(r, c); return; }   // Tier 3a
    loadBooksGrid(c);
  }
  function routeTo(r, push) {
    r = r || { collection: null };
    if (push) { try { history.pushState(r, '', routePath(r)); } catch (_) {} }
    renderRoute(r);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function wireRouting() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a) return;
      var href = a.getAttribute('href');
      if (href && href.charAt(0) === '#') {                 // base-href would send #anchors to "/#…"; keep them on-page
        e.preventDefault();
        var id = href.slice(1);
        if (id) { var t = document.getElementById(id); if (t) t.scrollIntoView({ behavior: 'smooth' }); }
        return;
      }
      if (href === '/hadith.html' || /^\/hadith(\/|$)/.test(href)) {   // internal hadith route → client-side nav
        e.preventDefault();
        routeTo(href === '/hadith.html' ? { collection: null } : parseRoute(href), true);
      }
    });
    window.addEventListener('popstate', function () { renderRoute(parseRoute()); });
  }

  /* ── Reading-progress tracker (US-H23b / FIX-5) ─────────────────────
     One IntersectionObserver over .hadith-card[data-ref] across the Tier-1
     feed AND Tier-3a list (via host.observeFeed). A card counts as "read"
     after ≥3 continuous seconds ≥50% visible (IO + setTimeout combo; the
     pure rules live in II.readingProgress). On read → persist last-read. */
  var rpObserver = null, rpTracker = null, rpRecords = {}, rpTimer = null, rpCurrent = null;

  function prefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }
  // Shared deep-link pulse (TechSpec §3.5). Single source of truth: Module 7's
  // Tier-3b deep-view calls this via the tier3 host, and the Continue-Reading
  // deep-link reuses it through the normal deep-link render path. Reduced-motion
  // users get the §3.14 border highlight instead of the animation.
  function pulseRing(el) {
    if (!el) return;
    if (prefersReducedMotion()) { el.style.borderColor = 'rgba(197,160,89,.5)'; return; }
    el.classList.remove('pulse-gold');
    void el.offsetWidth;                                 // reflow so re-adding restarts the animation
    el.classList.add('pulse-gold');
    setTimeout(function () { el.classList.remove('pulse-gold'); }, 3700);   // 2 × 1.8s + buffer
  }
  function rpPersist(ref) {
    var payload = RP.payloadFromRef(ref, Date.now());
    if (payload) ui.safeLocalStorageSet('islamicinfo-hadith-last-read', payload);
  }
  function rpEvaluate() {
    var records = Object.keys(rpRecords).map(function (k) { return rpRecords[k]; });
    var top = RP.topmost(records);
    if (top === rpCurrent) return;                     // no change in topmost → nothing to do
    rpCurrent = top;
    rpTracker.update(top, Date.now());                 // (re)arm the dwell clock in the core
    if (rpTimer) { clearTimeout(rpTimer); rpTimer = null; }
    if (top) {
      rpTimer = setTimeout(function () {
        var read = rpTracker.update(rpCurrent, Date.now());
        if (read) rpPersist(read);
      }, RP.THRESHOLD_MS);
    }
  }
  function initReadingObserver() {
    if (!RP || typeof window.IntersectionObserver !== 'function') return;   // old browser → tracker no-ops
    rpTracker = RP.createTracker();
    var lastEval = 0, pending = false;
    rpObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var ref = en.target.getAttribute('data-ref'); if (!ref) return;
        if (en.isIntersecting && en.intersectionRatio >= RP.MIN_RATIO) {
          rpRecords[ref] = { ref: ref, ratio: en.intersectionRatio, top: en.boundingClientRect.top };
        } else { delete rpRecords[ref]; }
      });
      var now = Date.now();                            // throttle evaluate to ~1s (TechSpec §3.4)
      if (now - lastEval >= 1000) { lastEval = now; rpEvaluate(); }
      else if (!pending) { pending = true; setTimeout(function () { pending = false; lastEval = Date.now(); rpEvaluate(); }, 1000); }
    }, { threshold: [0, RP.MIN_RATIO, 1] });
  }
  // Reset tracker state when a feed/list is fully re-rendered (not on append).
  function resetReadingProgress() {
    rpRecords = {}; rpCurrent = null;
    if (rpTimer) { clearTimeout(rpTimer); rpTimer = null; }
    if (rpTracker) rpTracker.reset();
  }
  // Restore-scroll (TechSpec §3.4): on a non-deep-link load, scroll the Tier-1 feed to
  // the last-read card IF it is present in the currently-loaded default feed. One-shot.
  var rpRestored = false;
  function maybeRestoreScroll() {
    if (rpRestored || state.arrivedViaDeepLink) return;
    var lr = ui.safeLocalStorageGet('islamicinfo-hadith-last-read', null);
    if (!lr || lr.collectionSlug !== FEED.slug || String(lr.bookNum) !== String(FEED.book)) return;
    var el = feedEl(); if (!el) return;
    try {                                                // corrupt last-read must never throw (§7.4)
      var card = el.querySelector('.hadith-card[data-ref="' + FEED.slug + ':' + FEED.book + ':' + lr.hadithNum + '"]');
      if (card) {
        rpRestored = true;
        card.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
      }
    } catch (_) {}
  }
  // Module 10: apply .has-bookmark / .has-note (→ gold dot via CSS) to every card in a container.
  function markCardStates(container) {
    container = container || document;
    applyTransPref(container);   // Module 12: restore saved translation edition (no-op if single-edition)
    reflectCompareButtons();     // Module 15: compare-add state is independent of II.hadithActions — reflect before the actions guard
    if (!actions) return;
    var bm = {}; getBookmarks().forEach(function (b) { if (b && b.ref) bm[b.ref] = 1; });
    var nt = {}; getNotes().forEach(function (n) { if (n && n.hadithRef) nt[n.hadithRef] = 1; });
    container.querySelectorAll('.hadith-card[data-ref]').forEach(function (card) {
      var ref = card.getAttribute('data-ref');
      card.classList.toggle('has-bookmark', !!bm[ref]);
      card.classList.toggle('has-note', !!nt[ref]);
    });
  }
  // Observe all current .hadith-card[data-ref] in a container (Tier-1 feed or Tier-3a list).
  function observeFeed(container) {
    if (!container) return;
    markCardStates(container);                       // Module 10: gold dots (runs even if IO unsupported)
    if (!rpObserver) return;
    container.querySelectorAll('.hadith-card[data-ref]').forEach(function (card) { rpObserver.observe(card); });
  }

  /* ── Module 10: bookmark toggle + category tooltip ── */
  var catTimer = null, catEl = null;
  function hideCategoryTooltip() {
    if (catTimer) { clearTimeout(catTimer); catTimer = null; }
    if (catEl && catEl.parentNode) catEl.parentNode.removeChild(catEl);
    catEl = null;
  }
  function positionTooltip(el, anchor) {
    var rect = anchor.getBoundingClientRect();
    el.style.position = 'absolute';
    el.style.top = (window.pageYOffset + rect.bottom + 6) + 'px';
    el.style.left = (window.pageXOffset + rect.left) + 'px';
  }
  function showCategoryTooltip(btn, ref) {
    hideCategoryTooltip();
    var cats = actions.BUILTIN_CATEGORIES.concat(actions.customCategoriesOf(getBookmarks()));
    catEl = document.createElement('div');
    catEl.className = 'bm-cat-tooltip'; catEl.setAttribute('role', 'menu');
    catEl.innerHTML = cats.map(function (c) {
      return '<button type="button" class="bm-cat-opt" role="menuitem" data-cat="' + esc(c) + '">' + esc(c) + '</button>';
    }).join('') + '<button type="button" class="bm-cat-opt bm-cat-new" data-cat="__new__">+ New category</button>';
    document.body.appendChild(catEl);
    positionTooltip(catEl, btn);
    catEl.addEventListener('click', function (e) {
      var opt = e.target.closest && e.target.closest('.bm-cat-opt'); if (!opt) return;
      var cat = opt.getAttribute('data-cat');
      if (cat === '__new__') {
        var name = window.prompt('New category name:'); if (name == null) return;
        var add = actions.addCustomCategory(getBookmarks(), name);
        if (!add.ok) {
          ui.showToast(actions.customCategoriesOf(getBookmarks()).length >= actions.MAX_CUSTOM
            ? 'Maximum 5 custom categories.'
            : 'That category name can’t be used.');
          return;
        }
        cat = String(name).trim();
      }
      setBookmarks(actions.setCategory(getBookmarks(), ref, cat));
      ui.showToast('Saved to “' + cat + '”');
      hideCategoryTooltip();
    });
    catTimer = setTimeout(hideCategoryTooltip, 2500);   // 2.5s auto-dismiss
  }
  // Find an already-open sibling panel of the given class belonging to this card
  // (scans forward until the next .hadith-card). Fixes cross-panel toggle collisions.
  function findCardPanel(card, className) {
    var n = card.nextElementSibling;
    while (n && !n.classList.contains('hadith-card')) {
      if (n.classList.contains(className)) return n;
      n = n.nextElementSibling;
    }
    return null;
  }
  function onBookmark(card, btn, ref) {
    if (!actions) return;
    var r = parseRefParts(ref);
    var res = actions.toggleBookmark(getBookmarks(),
      { ref: ref, collectionSlug: r.slug, bookNum: r.book, hadithNum: r.num }, Date.now());
    setBookmarks(res.list);
    card.classList.toggle('has-bookmark', res.added);
    if (res.added) {
      btn.classList.add('active'); showCategoryTooltip(btn, ref);
      if (window.II && II.track) II.track('bookmark_saved', { collection: r.slug, book: r.book, hadith: r.num });
    }
    else { btn.classList.remove('active'); hideCategoryTooltip(); }
  }

  /* ── Module 10: note editor (sibling below card — Module 4 DoD) ── */
  function onNote(card, ref) {
    if (!actions) return;
    var existingEd = findCardPanel(card, 'note-editor');
    if (existingEd) { existingEd.parentNode.removeChild(existingEd); return; } // toggle closed
    var existing = actions.getNote(getNotes(), ref);
    var ed = document.createElement('div');
    ed.className = 'note-editor';
    ed.innerHTML =
      '<textarea class="note-textarea" maxlength="' + actions.MAX_NOTE + '" ' +
        'placeholder="Your note (private, saved on this device)…"></textarea>' +
      '<div class="note-editor-actions">' +
        '<span class="note-count"></span>' +
        '<button type="button" class="btn-glass note-cancel">Cancel</button>' +
        '<button type="button" class="btn-glass primary note-save">Save</button>' +
      '</div>';
    card.parentNode.insertBefore(ed, card.nextSibling);
    var ta = ed.querySelector('.note-textarea'), count = ed.querySelector('.note-count');
    ta.value = existing ? existing.text : '';           // set via .value (never innerHTML) — no injection
    function updateCount() { count.textContent = ta.value.length + ' / ' + actions.MAX_NOTE; }
    updateCount(); ta.addEventListener('input', updateCount); ta.focus();
    ed.querySelector('.note-cancel').addEventListener('click', function () {
      if (ed.parentNode) ed.parentNode.removeChild(ed);   // discard — never persists
    });
    ed.querySelector('.note-save').addEventListener('click', function () {
      var list = actions.upsertNote(getNotes(), actions.buildNote(ref, ta.value, Date.now()));
      setNotes(list);
      card.classList.toggle('has-note', !!ta.value.trim());
      ui.showToast('Note saved');
      if (window.II && II.track) { var nr = parseRefParts(ref); II.track('note_saved', { collection: nr.slug, book: nr.book, hadith: nr.num }); }
      if (ed.parentNode) ed.parentNode.removeChild(ed);
    });
  }

  /* ── Module 10: audio mini-player — honest unavailable-only.
     No hadith audio source exists (adapter audio.url/reciter are null for all;
     see api.js). We render the player chrome disabled + an honest notice, and
     NEVER print a reciter (null → would be fabrication). A functional player
     arrives when a real audio source lands. ── */
  function onListen(card, ref) {
    var existingP = findCardPanel(card, 'audio-mini-player');
    if (existingP) { existingP.parentNode.removeChild(existingP); return; }
    var p = document.createElement('div');
    p.className = 'audio-mini-player';
    p.innerHTML =
      '<div class="amp-controls">' +
        '<button type="button" class="amp-play" aria-disabled="true" disabled title="Audio unavailable">▶</button>' +
        '<div class="amp-progress"><div class="amp-progress-fill"></div></div>' +
        '<span class="amp-speed" aria-disabled="true">1×</span>' +
      '</div>' +
      '<div class="amp-unavailable">Audio unavailable for this hadith</div>';
    card.parentNode.insertBefore(p, card.nextSibling);
  }

  // Read the displayed hadith content from a rendered card (feed + Tier-3a). Displayed = sourced.
  function readCardContent(card) {
    function txt(sel) { var e = card.querySelector(sel); return e ? e.textContent.trim() : ''; }
    var refEl = card.querySelector('.hadith-ref'), reference = '';
    if (refEl) { var clone = refEl.cloneNode(true); var ic = clone.querySelector('.hadith-ref-icon'); if (ic) ic.parentNode.removeChild(ic); reference = clone.textContent.trim(); }
    return { arabic: txt('.hadith-arabic'), translation: txt('.hadith-text'),
             narrator: txt('.hadith-narrator'), reference: reference, grade: txt('.grade-badge') };
  }
  // Canonical citation URL for a card's hadith, built from its stable ref (no fabrication).
  function sourceUrlFor(ref) {
    var r = parseRefParts(ref);
    return SITE + routePath({ collection: r.slug, book: r.book, hadith: r.num });
  }
  // Shared clipboard writer with graceful execCommand fallback.
  function copyToClipboard(text, okMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { ui.showToast(okMsg); },
                                              function () { ui.showToast('Couldn’t copy'); });
    } else {
      try {
        var ta = document.createElement('textarea'); ta.value = text;
        ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta);
        ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
        ui.showToast(okMsg);
      } catch (_) { ui.showToast('Couldn’t copy'); }
    }
  }
  function onCopy(card, ref) {
    if (!actions) return;
    var content = readCardContent(card);
    content.sourceUrl = sourceUrlFor(ref);
    var text = actions.buildCopyText(content);
    if (!text) { ui.showToast('Nothing to copy'); return; }   // never copy an unattributed hadith
    copyToClipboard(text, 'Copied with citation ✦');
    if (window.II && II.track) { var cr = parseRefParts(ref); II.track('copy_with_citation', { collection: cr.slug, book: cr.book, hadith: cr.num }); }
  }
  // US-H16 Arabic-only copy: bare .hadith-arabic matn, no attribution (the attributed copy is
  // the main Copy button's job). Non-fabricating — equivalent to selecting the on-page Arabic.
  function onCopyArabic(card) {
    var el = card.querySelector('.hadith-arabic');
    var text = el ? el.textContent.trim() : '';
    if (!text) { ui.showToast('No Arabic text for this hadith'); return; }
    copyToClipboard(text, 'Copied Arabic text ✦');
  }
  // Silsila Dorar card "Ask QuranlyAI" — the card shows Arabic matn only (no on-page
  // translation), so route it into QuranlyAI's real hadith context + 'explain' action
  // (window.QuranlyAI.setContext/open — confirmed against quranly-ai.js/quranly-ai-panel.js
  // and doc/quranly-ai-integration.md's own hadith-page example). Guarded no-op if the
  // globally deferred-loaded widget (quranlyai-widget.js) hasn't booted yet.
  function onAskQai(card) {
    var matnEl = card.querySelector('.dorar-matn');
    var matn = matnEl ? matnEl.textContent.trim() : '';
    var ref = card.getAttribute('data-ref') || '';
    if (!window.QuranlyAI || typeof window.QuranlyAI.setContext !== 'function' || typeof window.QuranlyAI.open !== 'function') return;
    window.QuranlyAI.setContext({ type: 'hadith', hadithBook: ref, language: 'ar', rawText: matn });
    window.QuranlyAI.open('explain');
  }
  function onShare(card, ref) {
    var content = readCardContent(card);
    content.sourceUrl = sourceUrlFor(ref);   // canonical Source line in the shared text
    var url = content.sourceUrl;             // share the same canonical link the Copy action cites (never location.origin)
    if (navigator.share) {
      navigator.share({ title: 'Hadith · ' + (content.reference || 'IslamicInfo.org'),
                        text: (actions ? actions.buildCopyText(content) : ''), url: url }).catch(function () {});
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () { ui.showToast('Link copied'); },
                                            function () { ui.showToast('Couldn’t copy link'); });
    } else { ui.showToast('Sharing isn’t supported in this browser'); }
  }

  // --- Module 14 Trace View host handlers (reuse hadith-actions core, read a hadith OBJECT) ---
  async function fetchHadithByRef(ref) {
    if (!api || !api.fetchSingleHadith) return null;
    var r = parseRefParts(ref);
    try { var res = await api.fetchSingleHadith(r.slug, r.book, r.num); return (res && res.ok) ? res.data : null; }
    catch (_) { return null; }
  }
  function traceCopyContent(hadith) {
    // canonical source URL from the hadith's own identifiers (never location.origin)
    var url = SITE + routePath({ collection: hadith.collectionSlug, book: hadith.bookNumber, hadith: hadith.hadithNumber });
    return II.traceViewCore.buildCopyContent(hadith, url);
  }
  function onTraceCopy(hadith) {
    if (!actions || !hadith) return;
    var text = actions.buildCopyText(traceCopyContent(hadith));
    if (!text) { ui.showToast('Nothing to copy'); return; }
    copyToClipboard(text, 'Copied with citation ✦');
  }
  function onTraceShare(hadith) {
    if (!hadith) return;
    var content = traceCopyContent(hadith);
    if (navigator.share) { navigator.share({ title: 'Hadith · ' + (content.reference || 'IslamicInfo.org'), text: (actions ? actions.buildCopyText(content) : ''), url: content.sourceUrl }).catch(function () {}); }
    else if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(content.sourceUrl).then(function () { ui.showToast('Link copied'); }, function () { ui.showToast('Couldn’t copy link'); }); }
    else { ui.showToast('Sharing isn’t supported in this browser'); }
  }
  function onTraceBookmark(hadith, btn) {
    if (!actions || !hadith) return;
    var ref = hadith.reference || hadith.id;
    var res = actions.toggleBookmark(getBookmarks(), { ref: ref, collectionSlug: hadith.collectionSlug, bookNum: hadith.bookNumber, hadithNum: hadith.hadithNumber }, Date.now());
    setBookmarks(res.list);
    if (btn) btn.classList.toggle('active', res.added);
    ui.showToast(res.added ? 'Bookmarked ✦' : 'Bookmark removed');
  }
  function exitTrace(route) { try { history.replaceState(route, '', routePath(route)); } catch (_) {} renderRoute(route); }

  /* ── Module 15: Comparison Mode ── */
  var compareSet = [];   // in-memory ordered Set of refs (slug:book:num), max 3
  function compareCore() { return II.compareViewCore; }
  function renderCompareDrawer() {
    var drawer = document.getElementById('compare-drawer'); if (!drawer || !compareCore()) return;
    if (!compareSet.length) { drawer.classList.remove('open'); drawer.innerHTML = ''; return; }
    var hadiths = compareSet.map(function (ref) { return FEED.byRef[ref] || refStub(ref); });
    var chips = compareCore().buildHeaderChipsHTML(hadiths)
      .replace('<span class="cmp-comparing">Comparing</span>', '<span class="cmp-drawer-label">Comparing</span>')
      .replace(/<button type="button" class="cmp-add-more"[^>]*>[^<]*<\/button>/, '');
    var canGo = compareCore().canCompare(compareSet);
    drawer.innerHTML = chips +
      '<button class="footer-action-btn primary cmp-compare-go" type="button" data-cmp-go' +
      (canGo ? '' : ' disabled') + '>Compare →</button>';
    drawer.classList.add('open');
  }
  // Minimal hadith-like object so a drawer chip label renders before the feed object is present.
  function refStub(ref) {
    var p = parseRefParts(ref);
    return { collectionSlug: p.slug, collectionName: p.slug, bookNumber: p.book, hadithNumber: p.num };
  }
  function addToCompare(ref) {
    if (!compareCore()) return;
    var res = compareCore().addRef(compareSet, ref);
    compareSet = res.list;
    if (!res.added && res.full) ui.showToast('You can compare up to 3 hadiths');
    else if (res.added) ui.showToast('Added to comparison');
    reflectCompareButtons();
    renderCompareDrawer();
  }
  function removeFromCompare(ref) {
    if (!compareCore()) return;
    compareSet = compareCore().removeRef(compareSet, ref);
    reflectCompareButtons();
    renderCompareDrawer();
  }
  // Disable every compare-add button once at capacity; reflect "added" state per card.
  function reflectCompareButtons() {
    var full = compareSet.length >= (compareCore() ? compareCore().MAX_COMPARE : 3);
    document.querySelectorAll('.hadith-card [data-act="compare-add"]').forEach(function (b) {
      var card = b.closest('.hadith-card'); var ref = card && card.getAttribute('data-ref');
      var added = ref && compareSet.indexOf(ref) !== -1;
      b.classList.toggle('active', !!added);
      b.disabled = full && !added;
    });
  }
  function openCompareRoute() {
    if (!compareCore() || !compareCore().canCompare(compareSet)) return;
    var url = '/hadith/compare?refs=' + encodeURIComponent(compareCore().serializeRefs(compareSet));
    try { history.pushState({ compare: true }, '', url); } catch (_) {}
    renderRoute({ compare: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function exitCompare() { try { history.replaceState({ collection: null }, '', '/hadith.html'); } catch (_) {} renderRoute({ collection: null }); }
  function wireCompareDrawer() {
    var drawer = document.getElementById('compare-drawer'); if (!drawer || drawer.dataset.wired) return;
    drawer.dataset.wired = '1';
    drawer.addEventListener('click', function (e) {
      if (e.target.closest('[data-cmp-go]')) { openCompareRoute(); return; }
      var rm = e.target.closest('[data-cmp-remove]');
      if (rm) { removeFromCompare(rm.getAttribute('data-cmp-remove')); }
    });
  }

  // Module 10: one document-delegated handler for bookmark/note/listen/share/copy — works
  // in the Tier-1 feed AND the Tier-3a list (both render via feed.buildCardHTML). isnad/full
  // stay with wireFeedActions on #hadith-feed.
  function wireCardActions() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('.hadith-card [data-act]');
      if (!btn) return;
      if (btn.classList.contains('dv-action-btn')) return;   // Tier-3b deep-view actions stay deferred (their own handler)
      var act = btn.getAttribute('data-act');
      if (act !== 'bookmark' && act !== 'note' && act !== 'listen' && act !== 'share' &&
          act !== 'copy' && act !== 'copy-arabic' && act !== 'trace' && act !== 'compare-add' &&
          act !== 'ask-qai') return;
      var card = btn.closest('.hadith-card'); if (!card) return;
      var ref = card.getAttribute('data-ref'); if (!ref) return;
      e.preventDefault();
      if (act === 'bookmark') onBookmark(card, btn, ref);
      else if (act === 'note') onNote(card, ref);
      else if (act === 'listen') onListen(card, ref);
      else if (act === 'share') onShare(card, ref);
      else if (act === 'copy') onCopy(card, ref);
      else if (act === 'copy-arabic') onCopyArabic(card);
      else if (act === 'trace') { if (II.traceView) II.traceView.open(ref, { viaRoute: false }); }
      else if (act === 'compare-add') { addToCompare(ref); }
      else if (act === 'ask-qai') onAskQai(card);
    });
  }

  /* ── Module 12: translation compare (US-H23) ──
     One document-delegated handler for the '.dv-tab' edition selector. Dormant with today's
     single-edition data (feed-core renders no tabs when only one edition exists); activates
     automatically once >1 edition is present. Persists the chosen edition so it is restored
     on re-render. */
  function selectTranslation(wrap, ed) {
    wrap.querySelectorAll('.dv-tab').forEach(function (t) {
      var on = t.getAttribute('data-edition') === ed;
      t.classList.toggle('on', on); t.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    wrap.querySelectorAll('.trans-panel').forEach(function (p) {
      p.hidden = p.getAttribute('data-edition') !== ed;
    });
  }
  function wireTranslationTabs() {
    document.addEventListener('click', function (e) {
      var tab = e.target.closest && e.target.closest('.hadith-translations .dv-tab[data-edition]');
      if (!tab) return;
      var wrap = tab.closest('.hadith-translations'); if (!wrap) return;
      var ed = tab.getAttribute('data-edition');
      selectTranslation(wrap, ed);
      ui.safeLocalStorageSet(TRANS_PREF_KEY, ed);
    });
  }
  // Restore the saved edition on any multi-edition block within scope (no-op for single-edition).
  function applyTransPref(scope) {
    var ed = ui.safeLocalStorageGet(TRANS_PREF_KEY, null);
    if (!ed) return;
    (scope || document).querySelectorAll('.hadith-translations').forEach(function (wrap) {
      if (wrap.querySelector('.dv-tab[data-edition="' + (window.CSS && CSS.escape ? CSS.escape(ed) : ed) + '"]')) {
        selectTranslation(wrap, ed);
      }
    });
  }

  /* ── Module 10: bookmarks panel ── */
  var bmLastFocus = null;
  function onBmKey(e) { if (e.key === 'Escape') closeBookmarksPanel(); }
  function renderBookmarksPanel(filter) {
    var listEl = $('#ii-bookmarks-list'), chipRow = $('#ii-bookmarks-chips'); if (!listEl) return;
    var all = getBookmarks();
    var cats = ['all'].concat(actions.BUILTIN_CATEGORIES, actions.customCategoriesOf(all))
      .filter(function (c, i, a) { return a.indexOf(c) === i; });
    if (chipRow) chipRow.innerHTML = cats.map(function (c) {
      return '<button type="button" class="bm-chip' + (c === filter ? ' on' : '') + '" data-cat="' + esc(c) + '">' +
        esc(c === 'all' ? 'All' : c) + '</button>';
    }).join('');
    var rows = actions.panelFilter(all, filter);
    if (!rows.length) {
      listEl.innerHTML = '<div class="bm-empty">No bookmarks' + (filter === 'all' ? ' yet.' : ' in this category.') + '</div>';
      return;
    }
    listEl.innerHTML = rows.map(function (b) {
      var c = collectionBySlug(b.collectionSlug);
      var name = c ? c.nameEnglish : (b.collectionSlug || 'Hadith');
      return '<div class="bm-row" data-ref="' + esc(b.ref) + '">' +
        '<div class="bm-row-main"><div class="bm-row-title">' + esc(name) + ' · Hadith ' + esc(b.hadithNum) + '</div>' +
        '<div class="bm-row-cat">' + esc(b.category) + '</div></div>' +
        '<button type="button" class="bm-jump" data-ref="' + esc(b.ref) + '" title="Jump to hadith" aria-label="Jump to hadith">→</button>' +
        '<button type="button" class="bm-remove" data-ref="' + esc(b.ref) + '" title="Remove bookmark" aria-label="Remove bookmark">✕</button>' +
      '</div>';
    }).join('');
  }
  function openBookmarksPanel() {
    var panel = $('#ii-bookmarks-panel'), backdrop = $('#ii-bookmarks-backdrop');
    if (!panel || !backdrop || !actions) return;
    renderBookmarksPanel('all');
    backdrop.style.display = 'block';
    panel.classList.add('open'); panel.setAttribute('aria-hidden', 'false');
    bmLastFocus = document.activeElement;
    document.addEventListener('keydown', onBmKey);
    var first = panel.querySelector('button, a'); if (first) first.focus();
  }
  function closeBookmarksPanel() {
    var panel = $('#ii-bookmarks-panel'), backdrop = $('#ii-bookmarks-backdrop');
    if (backdrop) backdrop.style.display = 'none';
    if (panel) { panel.classList.remove('open'); panel.setAttribute('aria-hidden', 'true'); }
    document.removeEventListener('keydown', onBmKey);
    if (bmLastFocus && bmLastFocus.focus) bmLastFocus.focus();
  }
  function jumpToBookmark(ref) {
    closeBookmarksPanel();
    var r = parseRefParts(ref);
    routeTo({ collection: r.slug, book: r.book, hadith: r.num }, true);
    var sel = '.hadith-card[data-ref="' + ((window.CSS && CSS.escape) ? CSS.escape(ref) : ref) + '"]';
    var tries = 0;
    (function poll() {
      var card = document.querySelector(sel);
      if (card) {
        card.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
        pulseRing(card);
        return;
      }
      if (++tries < 20) setTimeout(poll, 120);   // up to ~2.4s for the async deep-view fetch
    }());
  }
  function wireBookmarksPanel() {
    var trigger = $('#ii-bookmarks-trigger'), closeBtn = $('#ii-bookmarks-close'),
        backdrop = $('#ii-bookmarks-backdrop'), chipRow = $('#ii-bookmarks-chips'), listEl = $('#ii-bookmarks-list'),
        panel = $('#ii-bookmarks-panel');
    if (panel) ui.focusTrap(panel);
    if (trigger) trigger.addEventListener('click', function (e) { e.preventDefault(); openBookmarksPanel(); });
    if (closeBtn) closeBtn.addEventListener('click', closeBookmarksPanel);
    if (backdrop) backdrop.addEventListener('click', closeBookmarksPanel);
    if (chipRow) chipRow.addEventListener('click', function (e) {
      var chip = e.target.closest && e.target.closest('.bm-chip'); if (!chip) return;
      renderBookmarksPanel(chip.getAttribute('data-cat'));
    });
    if (listEl) listEl.addEventListener('click', function (e) {
      var jump = e.target.closest && e.target.closest('.bm-jump');
      var rem = e.target.closest && e.target.closest('.bm-remove');
      if (jump) { jumpToBookmark(jump.getAttribute('data-ref')); return; }
      if (rem) {
        var ref = rem.getAttribute('data-ref');
        var res = actions.toggleBookmark(getBookmarks(), { ref: ref }, Date.now());
        setBookmarks(res.list);                          // toggle of a present ref → removes
        var active = $('#ii-bookmarks-chips .bm-chip.on');
        renderBookmarksPanel(active ? active.getAttribute('data-cat') : 'all');
        markCardStates(document);                        // clear the gold dot on any visible card
        var vc = document.querySelector('.hadith-card[data-ref="' + ((window.CSS && CSS.escape) ? CSS.escape(ref) : ref) + '"]');
        if (vc) { var vb = vc.querySelector('[data-act="bookmark"]'); if (vb) vb.classList.remove('active'); }
      }
    });
  }

  /* ── Module 10: tier-aware sidebar CTAs ──
     Verify a Source → verify.html always. Ask a Question → verify.html prefilled
     with the current hadith on Tier 3 (via actions.buildAskUrl), empty on Tier 1. ── */
  function ctaContext() {
    var r = parseRoute();
    if (!r.hadith) return { route: r, hadith: null };
    var ref = r.collection + ':' + (r.book == null ? 0 : r.book) + ':' + r.hadith;
    var h = FEED.byRef[ref];                              // prefer loaded feed data
    if (!h) {                                             // else read the rendered deep view (displayed = sourced)
      var tEl = document.querySelector('#ii-tier2 .hadith-text') || document.querySelector('#ii-tier2 .hadith-arabic');
      var matn = tEl ? tEl.textContent.trim() : '';
      if (matn) {
        var c = collectionBySlug(r.collection);
        var reference = [(c && c.nameEnglish) || r.collection,
          r.book != null ? ('Book ' + r.book) : null, 'Hadith ' + r.hadith].filter(Boolean).join(' · ');
        h = { translation: { text: matn }, reference: reference };
      }
    }
    return { route: r, hadith: h || null };
  }
  function wireSidebarCtas() {
    var verify = $('#ii-cta-verify'), ask = $('#ii-cta-ask');
    if (verify) { verify.style.cursor = 'pointer'; verify.addEventListener('click', function () { location.href = 'verify.html'; }); }
    if (ask) {
      ask.style.cursor = 'pointer';
      ask.addEventListener('click', function () {
        var ctx = ctaContext();
        location.href = actions ? actions.buildAskUrl(ctx.route, ctx.hadith) : 'verify.html';
      });
    }
  }

  /* ── Continue Reading (read-only; tracking is Module 7) ── */
  function renderContinueReading() {
    var el = $('#ii-continue-reading'); if (!el) return;
    if (currentSlug()) return;                          // explicit deep-link present → suppress (§10)
    var lr = ui.safeLocalStorageGet('islamicinfo-hadith-last-read', null);
    if (!lr || !lr.collectionSlug || lr.hadithNum == null) return;
    var c = state.collections.filter(function (x) { return x.slug === lr.collectionSlug; })[0];
    var name = c ? c.nameEnglish : lr.collectionSlug;
    var href = '/hadith/' + encodeURIComponent(lr.collectionSlug);
    if (lr.bookNum != null && lr.hadithNum != null) {   // deep-link → Tier-3b scroll + pulse reuse
      href += '/' + encodeURIComponent(lr.bookNum) + '/' + encodeURIComponent(lr.hadithNum);
    }
    el.textContent = 'Continue where you left off → ' + name + ', Hadith ' + lr.hadithNum;
    el.setAttribute('href', href);
    el.setAttribute('data-browse', lr.collectionSlug);
    el.style.display = 'inline-flex';
  }

  function updateContinueReading(slug) {
    var el = $('#ii-continue-reading'); if (!el) return;
    if (slug) { el.style.display = 'none'; return; }
    renderContinueReading();
  }

  /* ── Load collections ── */
  function collectionsError() {
    var grid = $('#collections'); if (!grid) return;
    ui.renderErrorState(grid, 'Collections temporarily unavailable.', function () { loadCollections(); });
  }

  async function loadCollections() {
    var grid = $('#collections'); if (grid) grid.innerHTML = gridSkeleton(6);
    var res = await api.fetchHadithCollections();
    if (!res || !res.ok || !Array.isArray(res.data) || !res.data.length) { collectionsError(); return; }
    state.collections = res.data.map(function (r) { return core.mergeCollection(r, state.meta); });
    renderSidebar(state.collections);
    renderStats(state.collections);
    renderContinueReading();
    renderRoute(parseRoute());
  }

  /* ── Hadith of the Day ── */
  async function loadHotD() {
    var res = await api.fetchHadithDaily();
    if (!res || !res.ok || !res.data) return;
    var h = core.hotdFields(res.data);
    if (!h.arabic && !h.translation) return; // empty payload — keep static fallback
    var ar = $('#ii-hotd-arabic'); if (ar) ar.textContent = h.arabic;
    var tx = $('#ii-hotd-text'); if (tx) tx.textContent = '"' + h.translation + '"';
    var ref = $('#ii-hotd-ref');
    if (ref) {
      var narr = h.narrator ? (' · Narrated by ' + h.narrator) : '';
      // Decision A (ADR-022/ADR-024): if the daily hadith is from a characterization-only
      // collection (grade === null + a collection-level characterization), show that
      // characterization — never a fabricated per-hadith grade, never "Grade Unknown".
      // Forward guard: /api/hadith/daily currently serves graded hadithapi collections only.
      var gradeText = (res.data && res.data.grade == null && res.data.gradeCharacterization)
        ? res.data.gradeCharacterization
        : core.hotdGradeText(h);
      ref.textContent = '📚 ' + h.reference + narr + ' · ' + gradeText;
    }
    var isnad = $('#ii-hotd-isnad-btn');
    if (isnad) {
      isnad.setAttribute('aria-disabled', 'true');
      isnad.setAttribute('title', 'Verified isnad data unavailable');
      isnad.style.opacity = '.55'; isnad.style.cursor = 'not-allowed';
      isnad.onclick = function (e) {
        e.preventDefault(); e.stopPropagation();
        ui.showToast('Verified isnad data unavailable');
        if (window.II && II.track) II.track('hotd_interacted', { action: 'view_isnad' });
      };
    }
  }

  /* ── Live hadith feed (Module 2 · Stage-1) ───────────────────────────
     Renders the default supported book (Sahih al-Bukhari, Book 1) into the
     locked #hadith-feed. All card HTML + grade transparency + dedup live in
     the unit-tested II.hadithFeed core; this layer only does fetch + DOM +
     filter + pagination. Deep-link routing to other collections/books is a
     later module — the feed stays on the default here. */
  var FEED = { slug: 'sahih-bukhari', book: 1, page: 0, lastPage: null, total: null, filter: 'all', query: '', refs: null, byRef: {}, loading: false };

  function feedEl() { return $('#hadith-feed'); }
  function feedStatus(msg) { var el = $('#ii-feed-status'); if (el) el.textContent = msg; }

  function emptyFeedHTML() {
    return '<div class="hadith-card"><div class="hadith-inner" style="text-align:center;padding:32px;color:var(--ink-muted);">No hadiths available for this book.</div></div>';
  }

  function setLoadMore(mode) {
    var wrap = $('#ii-load-more-wrap'), btn = $('#ii-load-more');
    if (!wrap || !btn) return;
    var lbl = btn.querySelector('span');
    if (mode === 'hide') { wrap.style.display = 'none'; return; }
    wrap.style.display = '';
    var end = $('#ii-feed-end'); if (end) end.remove();
    if (mode === 'end') {
      btn.style.display = 'none';
      var n = document.createElement('div'); n.id = 'ii-feed-end';
      n.style.cssText = 'font-size:12px;color:var(--ink-muted);';
      n.textContent = 'You’ve reached the end of this book.';
      wrap.appendChild(n); return;
    }
    btn.style.display = '';
    if (mode === 'loading') { btn.disabled = true; if (lbl) lbl.textContent = 'Loading…'; }
    else if (mode === 'error') { btn.disabled = false; if (lbl) lbl.textContent = 'Retry — load more'; }
    else { btn.disabled = false; if (lbl) lbl.textContent = 'Load more hadiths'; }
  }

  // Searchable text for a loaded card, sourced from the stored hadith object (never guessed).
  function cardText(c) {
    var h = FEED.byRef[c.getAttribute('data-ref')];
    if (h) return [h.arabicMatn, h.translation && h.translation.text, h.reference, h.narrator && h.narrator.name].filter(Boolean).join(' ');
    return c.textContent || '';
  }
  function cardMatchesQuery(c) {
    if (!FEED.query) return true;
    return cardText(c).toLowerCase().indexOf(FEED.query.toLowerCase()) !== -1;
  }
  // Unified in-place feed visibility: a card shows iff it matches the active grade pill AND the
  // active text query (hero search OR topic chip). No routing; aria-live announces the count.
  function applyGradeFilter() {
    var el = feedEl(); if (!el) return;
    var cards = el.querySelectorAll('.hadith-card[data-ref]');
    var shown = 0;
    cards.forEach(function (c) {
      var vis = (FEED.filter === 'all' || c.getAttribute('data-grade') === FEED.filter) && cardMatchesQuery(c);
      c.style.display = vis ? '' : 'none';
      if (vis) shown++;
    });
    var total = cards.length;
    var lbl = FEED.filter === 'all' ? '' : (FEED.filter + ' ');
    var suffix = FEED.query ? (' matching “' + FEED.query + '”') : '';
    var scoped = (FEED.filter !== 'all' || FEED.query);
    if (shown === 0 && total > 0) feedStatus('No ' + lbl + 'hadiths' + suffix + ' in the ' + total + ' loaded.');
    else feedStatus('Showing ' + shown + ' ' + lbl + 'hadith' + (shown === 1 ? '' : 's') + suffix + (scoped ? ' of ' + total + ' loaded' : ''));
  }

  function renderFeedError() {
    var el = feedEl(); if (!el) return;
    setLoadMore('hide');
    ui.renderErrorState(el, 'Hadiths temporarily unavailable — try again', function () { loadHadithFeed(false); });
  }

  async function loadHadithFeed(append) {
    var el = feedEl(); if (!el || !feed || FEED.loading) return;
    FEED.loading = true;
    var nextPage = append ? FEED.page + 1 : 1;
    if (append) setLoadMore('loading');
    else { FEED.refs = new Set(); FEED.byRef = {}; ui.renderLoadingState(el, 3); setLoadMore('hide'); feedStatus('Loading hadiths…'); }

    var res;
    try { res = await api.fetchHadithList(FEED.slug, FEED.book, nextPage, 25); }
    catch (_) { res = null; }
    FEED.loading = false;

    if (!res || !res.ok || !res.data) {
      if (append) { setLoadMore('error'); ui.showToast('Could not load more — try again'); }
      else renderFeedError();
      return;
    }

    if (!append && TOPIC.active) return;   // a topic filter took over while this neutral fetch was in flight
    var data = res.data;
    var fresh = feed.dedupeByRef(FEED.refs, data.hadiths || []);
    fresh.forEach(function (h) { var r = feed.refOf(h); FEED.refs.add(r); FEED.byRef[r] = h; });
    var html = fresh.map(feed.buildCardHTML).join('');

    if (append) { if (html) el.insertAdjacentHTML('beforeend', html); }
    else { resetReadingProgress(); el.innerHTML = html || emptyFeedHTML(); }
    observeFeed(el);   // Module 9: track topmost visible card for last-read
    if (!append) maybeRestoreScroll();

    FEED.page = nextPage;
    FEED.lastPage = data.lastPage;
    FEED.total = data.total;
    applyGradeFilter();
    if (FEED.query) highlightFeed();

    if (fresh.length === 0 && !append) setLoadMore('hide');
    else if (FEED.lastPage != null && FEED.page >= FEED.lastPage) setLoadMore('end');
    else setLoadMore('idle');
  }

  // Global hadith search (US-H07 real): runs /api/hadith/search and renders results
  // into the feed area with the existing card renderer. Shared by the hero search box
  // and the homepage (hadith.html?q=). Never fabricates; honest empty/error states.
  async function runGlobalHadithSearch(q) {
    var el = feedEl(); if (!el || !feed) return;
    q = (q || '').trim(); if (!q) return;
    FEED.query = '';   // server search already matched; grade pills must filter by grade only, not literal substring
    setLoadMore('hide');
    ui.renderLoadingState(el, 3); feedStatus('Searching “' + q + '”…');
    var res; try { res = await api.fetchHadithSearch(q, 'en', 1); } catch (_) { res = null; }
    if (!res || !res.ok || !res.data || !Array.isArray(res.data.results)) {
      ui.renderErrorState(el, 'Search temporarily unavailable — try again', function () { runGlobalHadithSearch(q); });
      return;
    }
    var results = res.data.results;
    FEED.byRef = {};
    results.forEach(function (h) { var r = feed.refOf(h); if (r) FEED.byRef[r] = h; });
    if (!results.length) {
      el.innerHTML = '<div class="hadith-card"><div class="hadith-inner" style="text-align:center;padding:32px;color:var(--ink-muted);">No results for “' + esc(q) + '”.</div></div>';
      feedStatus('No results for “' + q + '”.');
      return;
    }
    el.innerHTML = results.map(feed.buildCardHTML).join('');
    markCardStates(el);
    applyGradeFilter();
    feedStatus(results.length + ' result' + (results.length === 1 ? '' : 's') + ' for “' + q + '”');
  }

  /* ── Grade filter deep-link (?grade=, TechSpec §5.1; preserves the current path + other params) ── */
  var GRADE_VALUES = { all: 1, sahih: 1, hasan: 1, daif: 1, mawdu: 1 };
  function readGradeFromUrl() {
    var g; try { g = new URLSearchParams(location.search).get('grade'); } catch (_) { g = null; }
    return (g && GRADE_VALUES[g]) ? g : 'all';
  }
  function pillValue(pill) {
    var cl = pill.classList;
    return cl.contains('sahih') ? 'sahih' : cl.contains('hasan') ? 'hasan'
      : cl.contains('daif') ? 'daif' : cl.contains('mawdu') ? 'mawdu' : 'all';
  }
  function reflectGradePill() {
    document.querySelectorAll('.grade-filter .grade-filter-pill').forEach(function (pill) {
      var on = pillValue(pill) === FEED.filter;
      pill.classList.toggle('on', on);
      pill.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }
  function syncGradeUrl(push) {
    try {
      var params = new URLSearchParams(location.search);
      if (FEED.filter && FEED.filter !== 'all') params.set('grade', FEED.filter); else params.delete('grade');
      var qs = params.toString(), url = qs ? ('?' + qs) : location.pathname;
      if (push) history.pushState(history.state, '', url); else history.replaceState(history.state, '', url);
    } catch (_) {}
  }
  function setGradeFilter(grade, push) {
    FEED.filter = GRADE_VALUES[grade] ? grade : 'all';
    reflectGradePill();
    syncGradeUrl(push);
    applyGradeFilter();
  }

  function wireGradeFilter() {
    document.querySelectorAll('.grade-filter .grade-filter-pill').forEach(function (pill) {
      var val = pillValue(pill);
      function activate() { setGradeFilter(val, true); }
      pill.setAttribute('role', 'button');
      pill.setAttribute('tabindex', '0');
      pill.addEventListener('click', activate);
      pill.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } });
    });
    reflectGradePill();
    window.addEventListener('popstate', function () { setGradeFilter(readGradeFromUrl(), false); });
  }

  function wireLoadMore() {
    var btn = $('#ii-load-more');
    if (btn) btn.addEventListener('click', function () { loadHadithFeed(true); });
  }

  /* ── Search match highlight (US-H07 stub) ── */
  function highlightFeed() {
    var el = feedEl(); if (!el) return;
    var q = FEED.query.toLowerCase();
    el.querySelectorAll('.hadith-card[data-ref]').forEach(function (c) {
      var h = FEED.byRef[c.getAttribute('data-ref')];
      var textEl = c.querySelector('.hadith-text');
      if (!textEl || !h || !h.translation) return;
      var original = h.translation.text || '';
      if (!q) { textEl.innerHTML = esc(original); return; }
      var lower = original.toLowerCase(), out = '', i = 0, idx;
      while ((idx = lower.indexOf(q, i)) !== -1) {
        out += esc(original.slice(i, idx)) + '<mark>' + esc(original.slice(idx, idx + q.length)) + '</mark>';
        i = idx + q.length;
      }
      out += esc(original.slice(i));
      textEl.innerHTML = out;
    });
  }
  function setSearchQuery(q) { FEED.query = (q || '').trim(); applyGradeFilter(); highlightFeed(); }
  function scrollFeed() { var f = feedEl(); if (f) f.scrollIntoView({ behavior: 'smooth' }); }

  /* ── Hero search (US-H07) — client-side substring stub over the loaded feed.
     The real /api/hadith/search proxy (TechSpec §4.4) is a separate module (see TASKS.md). ── */
  function wireSearch() {
    var input = $('#hadith-search-input'), submit = $('#hadith-search-submit'), mic = $('#hadith-mic-btn');
    function run() { if (input && input.value.trim()) { runGlobalHadithSearch(input.value); scrollFeed(); } }
    if (input) input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); run(); } });
    if (submit) submit.addEventListener('click', function () { run(); });

    // Voice input — Web Speech API when present; silent, never throws when absent.
    if (mic) {
      var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) {
        mic.addEventListener('click', function () { ui.showToast('Voice search isn’t supported in this browser'); });
      } else {
        mic.addEventListener('click', function () {
          try {
            var rec = new SR(); rec.lang = 'en-US'; rec.interimResults = false; rec.maxAlternatives = 1;
            mic.classList.add('listening');
            rec.onresult = function (ev) { var txt = ev.results[0][0].transcript; if (input) { input.value = txt; run(); } };
            rec.onerror = function () { ui.showToast('Voice search didn’t catch that'); };
            rec.onend = function () { mic.classList.remove('listening'); };
            rec.start();
          } catch (_) { mic.classList.remove('listening'); }
        });
      }
    }

    // Scope chips are a visual selector; Stage-1 search is hadith-scoped (loaded feed). See verification note.
    document.querySelectorAll('.scope-chips .scope-chip').forEach(function (chip) {
      chip.setAttribute('role', 'button'); chip.setAttribute('tabindex', '0');
      function act() {
        document.querySelectorAll('.scope-chips .scope-chip').forEach(function (s) { s.classList.remove('active'); s.setAttribute('aria-pressed', 'false'); });
        chip.classList.add('active'); chip.setAttribute('aria-pressed', 'true');
      }
      chip.addEventListener('click', act);
      chip.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
    });
  }

  /* ── Browse by Topic (US-H06/H14) — Module 11 route-away pills are now an IN-PLACE,
     WHOLE-CORPUS keyword filter. A pill maps to a keyword; selecting it runs the corpus
     search (/api/hadith/search, NO collection= → all collections) and renders into
     #hadith-feed with ?topic= URL state, a truthful live count, and honest empty/error
     states. This is SEPARATE from per-collection book-scoped browsing (sidebar → book →
     chapter walk); the two filtering models are independent and must not be conflated.
     No curated topic taxonomy exists — keyword match is the honest proxy, disclosed in UI. ── */
  function topicChips() { return document.querySelectorAll('.topics-grid .topic-chip'); }
  function topicKeys() {
    return Array.prototype.map.call(topicChips(), function (c) { return c.getAttribute('data-topic'); });
  }
  function topicPill(key) { return document.querySelector('.topics-grid .topic-chip[data-topic="' + key + '"]'); }
  function topicLabelText(key) { var p = topicPill(key); return p ? (p.textContent || '').trim() : key; }
  function readTopicFromUrl() {
    try { return new URLSearchParams(location.search).get('topic'); } catch (_) { return null; }
  }
  function pushTopicUrl(key) {
    try { history.pushState({ topic: key || null }, '',
      location.pathname + (key ? ('?topic=' + encodeURIComponent(key)) : '')); } catch (_) {}
  }

  function applyRadioState(activeKey) {
    if (!topics) return;
    var st = topics.radioState(topicKeys(), activeKey);
    topicChips().forEach(function (c) {
      var k = c.getAttribute('data-topic'), on = !!st.checked[k];
      c.setAttribute('aria-checked', on ? 'true' : 'false');
      c.classList.toggle('featured-topic', on);
      c.setAttribute('tabindex', String(st.tabindex[k]));
    });
  }

  function hideTopicStatus() { var s = $('#ii-topic-status'); if (s) { s.hidden = true; s.innerHTML = ''; } }
  // opts: { key, label, count(number|null|undefined), loading?, error? }
  function topicStatus(opts) {
    var s = $('#ii-topic-status'); if (!s) return;
    var label = II.t('hadith.topics.filteredBy', 'Filtered by {topic}', { topic: opts.label });
    var count = '';
    if (!opts.loading && !opts.error) {
      var kind = topics.countKind(opts.count);
      if (kind === 'one')  count = II.t('hadith.topics.countOne', '{n} hadith', { n: opts.count });
      else if (kind === 'many') count = II.t('hadith.topics.countMany', '{n} hadiths', { n: opts.count });
      else if (kind === 'more') count = II.t('hadith.topics.countMore', '25+ — scroll for more');
      // kind === 'zero' → no count chip; the empty state carries the message
    }
    var note = II.t('hadith.topics.keywordNote', 'Matched by keyword across all collections');
    var clear = II.t('hadith.topics.clear', 'Clear');
    // Reveal the region BEFORE writing its content so the innerHTML mutation is announced
    // by assistive tech (a live region populated while still hidden can be missed by VoiceOver).
    s.hidden = false;
    s.innerHTML =
      '<span class="topic-status__label">' + esc(label) + '</span>' +
      (count ? '<span class="topic-status__count">· ' + esc(count) + '</span>' : '') +
      '<button type="button" class="topic-status__clear" id="ii-topic-clear">' + esc(clear) + '</button>' +
      '<span class="topic-status__note">' + esc(note) + '</span>';
    var btn = $('#ii-topic-clear');
    if (btn) btn.addEventListener('click', function () { clearTopicFilter(true); });
  }

  function topicEmptyHTML() {
    return '<div class="topic-empty" role="note">' +
      '<p class="topic-empty__title">' + esc(II.t('hadith.topics.empty', 'No hadith found for this topic yet')) + '</p>' +
      '<p class="topic-empty__hint">' + esc(II.t('hadith.topics.keywordNote', 'Matched by keyword across all collections')) + '</p>' +
      '</div>';
  }

  // Runs the corpus search for a topic keyword and renders results / empty / error.
  // lang is fixed 'en': topic keywords are English words matched against English text,
  // regardless of the UI language.
  async function runTopicFilter(key) {
    var el = feedEl(); if (!el || !feed || !topics) return;
    var kw = topics.topicSearchQuery(key);
    if (!kw) { clearTopicFilter(false); return; }
    var label = topicLabelText(key);
    FEED.query = '';
    setLoadMore('hide');
    ui.renderLoadingState(el, 3);            // skeleton while the query is in flight
    topicStatus({ key: key, label: label, loading: true });
    var res; try { res = await api.fetchHadithSearch(kw, 'en', 1); } catch (_) { res = null; }
    if (TOPIC.active !== key) return;        // selection changed mid-flight → drop stale response
    if (!res || !res.ok || !res.data || !Array.isArray(res.data.results)) {
      ui.renderErrorState(el, II.t('hadith.topics.error', 'Search temporarily unavailable — try again'),
        function () { runTopicFilter(key); });
      topicStatus({ key: key, label: label, error: true });
      return;
    }
    var results = res.data.results;
    FEED.byRef = {};
    results.forEach(function (h) { var r = feed.refOf(h); if (r) FEED.byRef[r] = h; });
    if (!results.length) {                   // genuine zero — NOT an error
      TOPIC._lastCount = 0;
      el.innerHTML = topicEmptyHTML();
      topicStatus({ key: key, label: label, count: 0 });
      return;
    }
    el.innerHTML = results.map(feed.buildCardHTML).join('');
    markCardStates(el);
    applyGradeFilter();
    var total = (typeof res.data.total === 'number') ? res.data.total : null;
    TOPIC._lastCount = total;
    topicStatus({ key: key, label: label, count: total });
  }

  function scheduleTopicFilter(key, delay) {
    if (_topicTimer) { clearTimeout(_topicTimer); _topicTimer = null; }
    if (!delay) { runTopicFilter(key); return; }
    _topicTimer = setTimeout(function () {
      _topicTimer = null; if (TOPIC.active === key) runTopicFilter(key);
    }, delay);
  }

  function selectTopic(key, push, delay) {
    if (!topics || !topics.isTopicKey(key)) return;
    if (push) pushTopicUrl(key);
    TOPIC.active = key;
    applyRadioState(key);
    scheduleTopicFilter(key, delay || 0);
  }

  function clearTopicFilter(push) {
    if (_topicTimer) { clearTimeout(_topicTimer); _topicTimer = null; }
    if (push) pushTopicUrl(null);
    TOPIC.active = null;
    TOPIC._lastCount = null;
    applyRadioState(null);
    hideTopicStatus();
    loadHadithFeed(false);                   // restore the neutral default feed
  }

  function wireTopics() {
    var chips = topicChips();
    applyRadioState(null);                    // no preselected default
    chips.forEach(function (chip, idx) {
      function activate() {
        var key = chip.getAttribute('data-topic');
        if (!key) return;
        if (TOPIC.active === key) clearTopicFilter(true);   // toggle the active pill → neutral
        else selectTopic(key, true, 0);
      }
      chip.addEventListener('click', activate);
      chip.addEventListener('keydown', function (e) {
        var k = e.key;
        if (k === 'Enter' || k === ' ' || k === 'Spacebar') { e.preventDefault(); activate(); return; }
        var dir = (k === 'ArrowRight' || k === 'ArrowDown') ? 1
                : (k === 'ArrowLeft'  || k === 'ArrowUp')   ? -1 : 0;
        var jump = (k === 'Home') ? 'first' : (k === 'End') ? 'last' : null;
        if (!dir && !jump) return;
        e.preventDefault();
        var n = chips.length;
        var next = jump === 'first' ? 0 : jump === 'last' ? n - 1 : (idx + dir + n) % n;
        var nextChip = chips[next], nextKey = nextChip.getAttribute('data-topic');
        selectTopic(nextKey, true, 300);      // radiogroup: arrow moves+selects; debounce the fetch
        nextChip.focus();
      });
    });
    // Re-render the status line (dynamic {topic}/{n} strings) when the language changes.
    document.addEventListener('ii:langchange', function () {
      if (TOPIC.active) topicStatus({ key: TOPIC.active, label: topicLabelText(TOPIC.active), count: TOPIC._lastCount });
    });
  }

  /* ── Isnad chain v1 (US-H05) — dots only; text panel is Module 8.
     RELIGIOUS ACCURACY GATE: names + roles come ONLY from the provider's isnad data (Module 0).
     hadithapi.com returns none today (isnad.status 'unavailable', narrators []), so the panel
     honestly shows "unavailable" — never the mockup's placeholder narrators, never a role or
     reliability guessed from a name. Unknown role → unlabeled node; unknown reliability → grey dot. ── */
  var ISNAD_ROLE = { prophet: 'prophet', companion: 'companion', tabii: 'tabii', 'tabi-al-tabii': 'tabii', compiler: 'compiler' };
  var ISNAD_REL = { thiqah: 'thiqah', 'thiqah-thabt': 'thiqah', saduq: 'saduq', daif: 'daif', matruk: 'daif' };
  function isnadNodeHTML(n) {
    n = n || {};
    var role = ISNAD_ROLE[n.role] || '';                       // unknown → unlabeled node (gate)
    var rel = ISNAD_REL[n.reliability] || 'unknown';           // unknown → grey dot (never guessed)
    var face = n.arabicName ? n.arabicName.slice(0, 2) : (n.fullName ? String(n.fullName).trim().charAt(0) : '·');
    var name = n.fullName ? '<div class="isnad-name">' + esc(n.fullName) + '</div>' : '';
    var life = (n.lifespan || n.era) ? '<div class="isnad-lifespan">' + esc([n.lifespan, n.era].filter(Boolean).join(' · ')) + '</div>' : '';
    var idAttr = n.id ? ' data-narrator-id="' + esc(n.id) + '" tabindex="0" aria-expanded="false"' : ' title="Unknown narrator"';
    return '<div class="isnad-link" role="listitem"' + idAttr + '>' +
      '<div class="isnad-avatar' + (role ? ' ' + role : '') + '">' + esc(face) + '</div>' +
      name + life + '<div class="reliability-dot ' + rel + '"></div></div>';
  }
  function isnadInnerHTML(h) {
    var isn = h && h.isnad;
    var nodes = (isn && Array.isArray(isn.narrators)) ? isn.narrators : [];
    var label = '<div class="isnad-label">Isnad Chain — Transmission from Prophet ﷺ to Compiler</div>';
    if (!nodes.length) return label + '<div class="isnad-unavailable">Verified isnad data unavailable for this hadith.</div>';
    return label + '<div class="isnad-chain" role="list">' + nodes.map(isnadNodeHTML).join('') + '</div>';
  }
  function toggleIsnad(card, btn) {
    if (!card) return;
    var ref = card.getAttribute('data-ref');
    var panel = findCardPanel(card, 'isnad-preview');
    if (!panel) {
      panel = document.createElement('div');
      panel.className = 'isnad-preview';
      panel.id = 'isnad-' + String(ref || '').replace(/[^a-z0-9]+/gi, '-');
      panel.innerHTML = isnadInnerHTML(FEED.byRef[ref]);
      card.parentNode.insertBefore(panel, card.nextSibling);
    }
    var open = panel.classList.toggle('open');
    if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open && window.II && II.track) {
      var ip = parseRefParts(ref);
      II.track('isnad_opened', { collection: ip.slug, book: ip.book, hadith: ip.num });
    }
  }

  // Per-card actions. isnad toggles the chain panel (US-H05); full routes into the
  // Tier-3b deep view. bookmark/note/listen/share/copy are live (Module 10) via the
  // document-delegated wireCardActions() below, so they are absent here on purpose
  // and simply no-op in this handler.
  function wireFeedActions() {
    var el = feedEl(); if (!el) return;
    el.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('[data-act]');
      if (!btn || !el.contains(btn)) return;
      var act = btn.getAttribute('data-act');
      if (act === 'isnad') { toggleIsnad(btn.closest('.hadith-card'), btn); return; }
      if (act === 'full') {
        var card = btn.closest('.hadith-card'); var ref = card && card.getAttribute('data-ref');
        if (ref) { var p = ref.split(':'); routeTo({ collection: p[0], book: p[1], hadith: p[2] }, true); }
        return;
      }
    });
  }

  /* ── Mobile bottom-sheet ── */
  function wireSheet() {
    var trigger = $('#ii-sheet-trigger'), backdrop = $('#ii-sheet-backdrop'),
        panel = $('#ii-sheet-panel'), listEl = $('#ii-sheet-list'), closeBtn = $('#ii-sheet-close');
    if (!trigger || !backdrop || !listEl) return;
    var lastFocus = null;
    function open() {
      listEl.innerHTML = state.collections.map(sidebarRowHTML).join('');
      lastFocus = document.activeElement;
      backdrop.style.display = 'block'; trigger.setAttribute('aria-expanded', 'true');
      var first = listEl.querySelector('a'); if (first) first.focus();
      document.addEventListener('keydown', onKey);
    }
    function close() {
      backdrop.style.display = 'none'; trigger.setAttribute('aria-expanded', 'false');
      document.removeEventListener('keydown', onKey);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    function onKey(e) { if (e.key === 'Escape') close(); }
    trigger.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    backdrop.addEventListener('click', function (e) { if (e.target === backdrop) close(); });
    ui.focusTrap(panel);
  }

  /* ── Init ── */
  async function init() {
    // GitHub Pages 404 SPA fallback (see 404.html): restore the intended clean /hadith/... URL (ADR-026).
    try { var rd = new URLSearchParams(location.search).get('redirect'); if (rd && rd.charAt(0) === '/') history.replaceState(null, '', rd); } catch (_) {}
    // Precedence (TechSpec §10): an explicit deep-link (a collection segment in the
    // resolved path) always wins over last-read restoration — suppress the prompt and
    // skip restore-scroll. Computed AFTER the ?redirect= restore above.
    state.arrivedViaDeepLink = !!parseRoute().collection;
    try {
      var r = await ui.apiFetchWithTimeout(META_URL, { timeoutMs: 5000 });
      state.meta = await r.json();
    } catch (_) { state.meta = {}; }
    // Register the Tier 3 host BEFORE loadCollections() — its final renderRoute()
    // can dispatch straight to a Tier 3a/3b view on a direct deep-link load, and
    // II.tier3.renderList/renderDeepView need the injected host to exist by then.
    if (II.tier3 && II.tier3.init) {
      II.tier3.init({
        setTier: setTier, tier2El: tier2El, routeTo: routeTo,
        api: api, ui: ui, feed: feed,
        observeFeed: observeFeed, pulseRing: pulseRing, resetReadingProgress: resetReadingProgress,
      });
    }
    if (II.narratorPanelDom && II.narratorPanelDom.init) {
      II.narratorPanelDom.init({ api: api, ui: ui });
      II.narratorPanelDom.wire(document);   // delegated, once — reachable when isnad nodes carry data-narrator-id
    }
    if (II.traceView && II.traceView.init) {
      II.traceView.init({ ui: ui, fetchHadithByRef: fetchHadithByRef,
        onTraceBookmark: onTraceBookmark, onTraceShare: onTraceShare, onTraceCopy: onTraceCopy, exitTrace: exitTrace });
    }
    if (II.compareView && II.compareView.init) {
      II.compareView.init({ ui: ui, fetchHadithByRef: fetchHadithByRef, exitCompare: exitCompare, addMore: exitCompare, removeFromCompare: removeFromCompare });
    }
    await loadCollections();
    wireFilterTabs();
    wireRouting();
    wireSheet();
    wireBookmarksPanel();
    wireSidebarCtas();
    wireSearch();
    wireTopics();
    loadHotD();
    initReadingObserver();
    if (feed) {
      FEED.filter = readGradeFromUrl(); wireGradeFilter(); wireLoadMore(); wireFeedActions();
      wireCardActions(); wireCompareDrawer(); wireTranslationTabs();
      var q0; try { q0 = new URLSearchParams(location.search).get('q'); } catch (_) { q0 = null; }
      var t0 = readTopicFromUrl();
      if (q0 && q0.trim()) {                       // ?q= (hero search) wins over ?topic=
        var si = $('#hadith-search-input'); if (si) si.value = q0;
        runGlobalHadithSearch(q0);
      } else if (t0 && topics && topics.isTopicKey(t0)) {   // deep-link ?topic=<key>
        selectTopic(t0, false, 0);
      } else {
        loadHadithFeed(false);
      }
      TOPIC.ready = true;
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}());
