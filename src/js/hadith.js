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
      isnad.onclick = function (e) { e.preventDefault(); e.stopPropagation(); ui.showToast('Verified isnad data unavailable'); };
    }
  }

  /* ── Live hadith feed (Module 2 · Stage-1) ───────────────────────────
     Renders the default supported book (Sahih al-Bukhari, Book 1) into the
     locked #hadith-feed. All card HTML + grade transparency + dedup live in
     the unit-tested II.hadithFeed core; this layer only does fetch + DOM +
     filter + pagination. Deep-link routing to other collections/books is a
     later module — the feed stays on the default here. */
  var FEED = { slug: 'sahih-bukhari', book: 1, page: 0, lastPage: null, total: null, filter: 'all', refs: null, loading: false };

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

  function applyGradeFilter() {
    var el = feedEl(); if (!el) return;
    var cards = el.querySelectorAll('.hadith-card[data-ref]');
    var shown = 0;
    cards.forEach(function (c) {
      var vis = FEED.filter === 'all' || c.getAttribute('data-grade') === FEED.filter;
      c.style.display = vis ? '' : 'none';
      if (vis) shown++;
    });
    var total = cards.length;
    if (FEED.filter === 'all') feedStatus('Showing ' + shown + ' hadith' + (shown === 1 ? '' : 's'));
    else if (shown === 0 && total > 0) feedStatus('No ' + FEED.filter + ' hadiths in the ' + total + ' loaded.');
    else feedStatus('Showing ' + shown + ' ' + FEED.filter + ' hadith' + (shown === 1 ? '' : 's') + ' of ' + total + ' loaded');
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
    else { FEED.refs = new Set(); ui.renderLoadingState(el, 3); setLoadMore('hide'); feedStatus('Loading hadiths…'); }

    var res;
    try { res = await api.fetchHadithList(FEED.slug, FEED.book, nextPage, 25); }
    catch (_) { res = null; }
    FEED.loading = false;

    if (!res || !res.ok || !res.data) {
      if (append) { setLoadMore('error'); ui.showToast('Could not load more — try again'); }
      else renderFeedError();
      return;
    }

    var data = res.data;
    var fresh = feed.dedupeByRef(FEED.refs, data.hadiths || []);
    fresh.forEach(function (h) { FEED.refs.add(feed.refOf(h)); });
    var html = fresh.map(feed.buildCardHTML).join('');

    if (append) { if (html) el.insertAdjacentHTML('beforeend', html); }
    else el.innerHTML = html || emptyFeedHTML();

    FEED.page = nextPage;
    FEED.lastPage = data.lastPage;
    FEED.total = data.total;
    applyGradeFilter();

    if (fresh.length === 0 && !append) setLoadMore('hide');
    else if (FEED.lastPage != null && FEED.page >= FEED.lastPage) setLoadMore('end');
    else setLoadMore('idle');
  }

  function wireGradeFilter() {
    var pills = document.querySelectorAll('.grade-filter .grade-filter-pill');
    pills.forEach(function (pill) {
      function activate() {
        pills.forEach(function (p) { p.classList.remove('on'); });
        pill.classList.add('on');
        var cl = pill.classList;
        FEED.filter = cl.contains('sahih') ? 'sahih' : cl.contains('hasan') ? 'hasan'
          : cl.contains('daif') ? 'daif' : cl.contains('mawdu') ? 'mawdu' : 'all';
        applyGradeFilter();
      }
      pill.setAttribute('role', 'button');
      pill.setAttribute('tabindex', '0');
      pill.addEventListener('click', activate);
      pill.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } });
    });
  }

  function wireLoadMore() {
    var btn = $('#ii-load-more');
    if (btn) btn.addEventListener('click', function () { loadHadithFeed(true); });
  }

  // Honest per-card actions. isnad/listen have no verified data at Stage 1;
  // full/bookmark/share/copy are later-stage UI. No dead or lying buttons.
  function wireFeedActions() {
    var el = feedEl(); if (!el) return;
    var MSG = {
      isnad: 'Verified isnad data unavailable',
      listen: 'Audio unavailable for this hadith',
      full: 'Full hadith view arrives in a later stage',
      bookmark: 'Bookmarking arrives in a later stage',
      share: 'Sharing arrives in a later stage',
      copy: 'Copying arrives in a later stage',
    };
    el.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('[data-act]');
      if (!btn || !el.contains(btn)) return;
      var msg = MSG[btn.getAttribute('data-act')];
      if (msg) ui.showToast(msg);
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
    try {
      var r = await ui.apiFetchWithTimeout(META_URL, { timeoutMs: 5000 });
      state.meta = await r.json();
    } catch (_) { state.meta = {}; }
    await loadCollections();
    wireFilterTabs();
    wireBrowse();
    wireSheet();
    loadHotD();
    if (feed) { wireGradeFilter(); wireLoadMore(); wireFeedActions(); loadHadithFeed(false); }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}());
