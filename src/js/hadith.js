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
  var api = II.api, ui = II.ui, core = II.hadithCollections;
  if (!api || !ui || !core) { console.error('[hadith.js] missing II.api/ui/hadithCollections'); return; }

  var META_URL = 'src/data/hadith/collections-meta.json';
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var esc = ui.escapeHTML;

  var state = { collections: [], activeTab: 'all', meta: {} };

  /* ── Templates (reproduce locked .collection-card / .sidebar-item anatomy) ── */
  function toneStyle(tone) { return ' style="color:' + core.toneColor(tone) + ';"'; }
  function dotStyle(tone) { return ' style="background:' + core.toneColor(tone) + ';"'; }

  function cardHTML(c) {
    var hadiths = core.formatInt(c.hadithCount);
    var books = core.formatInt(c.chaptersCount);
    var compiler = [c.compiler, c.lifespan].filter(Boolean).map(esc).join(' · ');
    var seal = c.featured ? '<div class="featured-seal">✦ Most Authentic</div>' : '';
    var third = c.compiledPeriod ? ('<div class="card-stat"><div class="card-stat-num">' + esc(c.compiledPeriod) + '</div><div class="card-stat-label">Compiled</div></div>') : '';
    var arabic = c.nameArabic ? ('<div class="card-arabic">' + esc(c.nameArabic) + '</div>') : '';
    var motif = c.motif ? ('<div class="card-motif">' + esc(c.motif) + '</div>') : '';
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
          '<a class="browse-btn" href="?collection=' + encodeURIComponent(c.slug) + '" data-browse="' + esc(c.slug) + '">Browse →</a>' +
        '</div>' +
      '</div>';
  }

  function sidebarRowHTML(c) {
    var count = c.hadithCount != null ? core.formatInt(c.hadithCount) : '';
    var badge = count ? ' <span class="count-badge">' + esc(count) + '</span>' : '';
    return '<a class="sidebar-item" href="?collection=' + encodeURIComponent(c.slug) + '" data-browse="' + esc(c.slug) + '">' + esc(c.nameEnglish) + badge + '</a>';
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

  /* ── Browse / route (?collection=slug + loading shell; no faked Tier 2) ── */
  function currentSlug() { try { return new URLSearchParams(location.search).get('collection'); } catch (_) { return null; } }

  function reflectActiveRoute() {
    var slug = currentSlug();
    document.querySelectorAll('.sidebar-item[data-browse]').forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('data-browse') === slug);
    });
  }

  function showLoadingShell(slug) {
    var c = state.collections.filter(function (x) { return x.slug === slug; })[0];
    var name = c ? c.nameEnglish : slug;
    var grid = $('#collections'); if (!grid) return;
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--ink-muted);">' +
      '<div style="font-family:var(--font-display);font-size:22px;color:var(--ink-primary);margin-bottom:8px;">' + esc(name) + '</div>' +
      '<div>Loading collection… the full library view arrives soon.</div>' +
      '<a class="browse-btn" href="?" data-browse="" style="margin-top:14px;display:inline-block;">← All collections</a></div>';
  }

  function routeTo(slug, push) {
    if (push) { try { history.pushState({ collection: slug }, '', slug ? ('?collection=' + encodeURIComponent(slug)) : location.pathname); } catch (_) {} }
    reflectActiveRoute();
    updateContinueReading(slug);
    if (slug) showLoadingShell(slug); else applyFilter();
  }

  function wireBrowse() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('[data-browse]');
      if (!a) return;
      e.preventDefault();
      routeTo(a.getAttribute('data-browse'), true);
      var main = document.querySelector('.main'); if (main) main.scrollIntoView({ behavior: 'smooth' });
    });
    window.addEventListener('popstate', function () { var s = currentSlug(); routeTo(s, false); });
  }

  /* ── Continue Reading (read-only; tracking is Module 7) ── */
  function renderContinueReading() {
    var el = $('#ii-continue-reading'); if (!el) return;
    if (currentSlug()) return;
    var lr = ui.safeLocalStorageGet('islamicinfo-hadith-last-read', null);
    if (!lr || !lr.collectionSlug || lr.hadithNum == null) return;
    var c = state.collections.filter(function (x) { return x.slug === lr.collectionSlug; })[0];
    var name = c ? c.nameEnglish : lr.collectionSlug;
    el.textContent = 'Continue where you left off → ' + name + ', Hadith ' + lr.hadithNum;
    el.setAttribute('href', '?collection=' + encodeURIComponent(lr.collectionSlug));
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
    var slug = currentSlug();
    if (slug) { reflectActiveRoute(); showLoadingShell(slug); } else { applyFilter(); }
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
      ref.textContent = '📚 ' + h.reference + narr + ' · ' + core.hotdGradeText(h);
    }
    var isnad = $('#ii-hotd-isnad-btn');
    if (isnad) {
      isnad.setAttribute('aria-disabled', 'true');
      isnad.setAttribute('title', 'Verified isnad data unavailable');
      isnad.style.opacity = '.55'; isnad.style.cursor = 'not-allowed';
      isnad.onclick = function (e) { e.preventDefault(); e.stopPropagation(); ui.showToast('Verified isnad data unavailable'); };
    }
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
    try {
      var r = await ui.apiFetchWithTimeout(META_URL, { timeoutMs: 5000 });
      state.meta = await r.json();
    } catch (_) { state.meta = {}; }
    await loadCollections();
    wireFilterTabs();
    wireBrowse();
    wireSheet();
    loadHotD();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}());
