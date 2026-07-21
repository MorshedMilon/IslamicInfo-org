/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — tier3-deep-view.js  (Module 7)
   DOM + data layer for Tier 3a (in-book list) and Tier 3b (deep-view).
   Pure HTML comes from II.tier3Core; this layer only does fetch + DOM +
   tab switching + localStorage + prev/next + error fallbacks.
   Host (setTier/tier2El/routeTo/api/ui/feed) is injected by hadith.js via
   II.tier3.init(host) so this file never reaches into hadith.js internals.
   ═══════════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  var II = root.II = root.II || {};
  var t3 = II.tier3Core;
  var host = null;                                   // set by init()
  var LANG_KEY = 'islamicinfo-hadith-lang';
  var GRADE_VALUES = { all: 1, sahih: 1, hasan: 1, daif: 1, mawdu: 1 };
  var BOOKLESS_DEFAULT = 1;                          // bookless collections use book segment 1

  function esc(s) { return (host && host.ui && host.ui.escapeHTML) ? host.ui.escapeHTML(s) : String(s == null ? '' : s); }
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }

  function init(h) { host = h; }

  /* ── shared: localStorage language preference ── */
  function readLang() {
    var v = host.ui && host.ui.safeLocalStorageGet ? host.ui.safeLocalStorageGet(LANG_KEY, null) : null;
    return (v && t3.LANG_LABELS[v]) ? v : 'en';
  }
  function writeLang(lang) {
    if (host.ui && host.ui.safeLocalStorageSet) host.ui.safeLocalStorageSet(LANG_KEY, lang);
  }

  /* ═══════════════ Tier 3a — in-book list ═══════════════ */

  function listHeaderHTML(c, bookNum, bookName, count) {
    var name = bookName || (bookNum != null ? ('Book ' + bookNum) : c.nameEnglish);
    var n = (count != null) ? (' · ' + count + ' hadith' + (count === 1 ? '' : 's')) : '';
    return '<div class="t3a-header">' +
      '<nav class="dv-breadcrumb" aria-label="Breadcrumb">' +
        '<a class="dv-crumb" href="/hadith.html">Hadith</a>' +
        '<span class="dv-crumb-sep" aria-hidden="true">›</span>' +
        '<a class="dv-crumb" href="/hadith/' + encodeURIComponent(c.slug) + '">' + esc(c.nameEnglish) + '</a>' +
        '<span class="dv-crumb-sep" aria-hidden="true">›</span>' +
        '<span class="dv-crumb dv-crumb-current" aria-current="page">' + esc(name) + n + '</span>' +
      '</nav></div>';
  }

  function gradePillsHTML(active) {
    var pills = [['all', 'All'], ['sahih', 'Sahih'], ['hasan', 'Hasan'], ['daif', "Da'if"], ['mawdu', "Mawdu'"]];
    return '<div class="grade-filter t3a-grade-filter" role="group" aria-label="Filter by grade">' +
      pills.map(function (p) {
        var on = p[0] === active;
        return '<button class="grade-filter-pill ' + p[0] + (on ? ' on' : '') + '" type="button" ' +
               'data-grade="' + p[0] + '" role="button" aria-pressed="' + (on ? 'true' : 'false') + '">' + p[1] + '</button>';
      }).join('') + '</div>';
  }

  function applyListGradeFilter(listEl, filter) {
    var cards = listEl.querySelectorAll('.hadith-card[data-ref]');
    var shown = 0;
    cards.forEach(function (card) {
      var vis = (filter === 'all' || card.getAttribute('data-grade') === filter);
      card.style.display = vis ? '' : 'none';
      if (vis) shown++;
    });
    var status = $('#t3a-status');
    if (status) status.textContent = 'Showing ' + shown + ' of ' + cards.length + ' loaded hadith' + (cards.length === 1 ? '' : 's');
  }

  function bookNavHTML(slug, books, currentBook) {
    if (!Array.isArray(books) || !books.length) return '';
    var nums = books.map(function (b) { return b.bookNumber; }).filter(function (n) { return n != null; });
    var i = nums.map(String).indexOf(String(currentBook));
    function link(num, dir, label) {
      if (num == null) return '<span class="dv-nav-btn dv-nav-' + dir + ' dv-nav-disabled" aria-disabled="true">' + label + '</span>';
      return '<a class="dv-nav-btn dv-nav-' + dir + '" href="/hadith/' + encodeURIComponent(slug) + '/' + encodeURIComponent(num) + '">' + label + '</a>';
    }
    var prev = (i > 0) ? nums[i - 1] : null, next = (i >= 0 && i < nums.length - 1) ? nums[i + 1] : null;
    return '<nav class="dv-prevnext t3a-booknav" aria-label="Book navigation">' +
      link(prev, 'prev', '← Previous book') + link(next, 'next', 'Next book →') + '</nav>';
  }

  async function renderList(r, c) {
    host.setTier(2);
    var el = host.tier2El(); if (!el) return;
    var slug = c.slug;
    var book = (r.book != null && r.book !== '') ? r.book : BOOKLESS_DEFAULT;
    var grade = 'all';
    var skeleton = '';
    for (var i = 0; i < 4; i++) skeleton += '<div class="hadith-card" aria-hidden="true" style="opacity:.5;height:120px;"></div>';
    el.innerHTML = listHeaderHTML(c, book, null, null) + gradePillsHTML(grade) +
      '<div id="t3a-status" class="ii-sr-live" aria-live="polite" style="font-size:12px;color:var(--ink-muted);margin:8px 0;"></div>' +
      '<div class="t3a-list" id="ii-t3a-list">' + skeleton + '</div>' +
      '<div id="ii-t3a-booknav"></div>';

    // hadiths (provider-routed) — handles hadithapi + direct sources
    var res;
    try { res = await host.api.fetchHadithsByBook(slug, book, 1, 25); } catch (_) { res = null; }
    var listEl = $('#ii-t3a-list'); if (!listEl) return;              // route changed mid-fetch
    if (!res || !res.ok || !res.data || !Array.isArray(res.data.hadiths)) {
      listEl.innerHTML = '<div class="books-error"><div class="books-empty-title">Hadiths temporarily unavailable</div>' +
        '<div>We couldn’t load the hadiths for this book.</div>' +
        '<button class="btn-glass" id="ii-t3a-retry" type="button" style="margin-top:14px;">Try again</button></div>';
      var retry = $('#ii-t3a-retry'); if (retry) retry.addEventListener('click', function () { renderList(r, c); });
      return;
    }
    var hadiths = res.data.hadiths;
    listEl.innerHTML = hadiths.length
      ? hadiths.map(host.feed.buildCardHTML).join('')
      : '<div class="books-empty"><div class="books-empty-title">No hadiths in this book.</div></div>';

    // header count (now known) + status
    var header = $('.t3a-header');
    if (header && res.data.total != null) header.outerHTML = listHeaderHTML(c, book, null, res.data.total);
    applyListGradeFilter(listEl, grade);

    // grade pills
    el.querySelectorAll('.t3a-grade-filter .grade-filter-pill').forEach(function (pill) {
      pill.addEventListener('click', function () {
        grade = pill.getAttribute('data-grade');
        el.querySelectorAll('.t3a-grade-filter .grade-filter-pill').forEach(function (p) {
          var on = p === pill; p.classList.toggle('on', on); p.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        applyListGradeFilter(listEl, grade);
      });
    });

    // "Open Full View" (data-act="full") on each card → Tier 3b
    listEl.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('[data-act="full"]');
      if (!btn || !listEl.contains(btn)) return;
      var card = btn.closest('.hadith-card'); if (!card) return;
      var ref = card.getAttribute('data-ref'); if (!ref) return;
      var parts = ref.split(':');                                     // slug:book:num
      host.routeTo({ collection: parts[0], book: parts[1], hadith: parts[2] }, true);
    });

    // book nav (deferred, non-blocking): needs the collection's book list
    host.api.fetchHadithBooks(slug).then(function (b) {
      var nav = $('#ii-t3a-booknav');
      if (nav && b && b.ok && Array.isArray(b.data)) nav.innerHTML = bookNavHTML(slug, b.data, book);
    }).catch(function () {});
  }

  /* ═══════════════ Tier 3b — deep-view ═══════════════ */

  function wireDeepView(el, r, slug, book) {
    // translation tab switching + persistence
    el.addEventListener('click', function (e) {
      var tab = e.target.closest && e.target.closest('.dv-tab[data-lang]');
      if (tab && el.contains(tab)) {
        var lang = tab.getAttribute('data-lang');
        el.querySelectorAll('.dv-tab[data-lang]').forEach(function (t) {
          var on = t === tab; t.classList.toggle('on', on); t.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        el.querySelectorAll('.dv-tr-pane[data-lang]').forEach(function (pane) {
          if (pane.getAttribute('data-lang') === lang) pane.removeAttribute('hidden'); else pane.setAttribute('hidden', '');
        });
        writeLang(lang);
        return;
      }
      // Module 10 wiring stub — honest toast, no dead onclick
      var act = e.target.closest && e.target.closest('.dv-action-btn[data-act]');
      if (act && el.contains(act) && host.ui && host.ui.showToast) {
        host.ui.showToast('This action arrives in a later update');
      }
    });
  }

  async function renderDeepView(r, c) {
    host.setTier(2);
    var el = host.tier2El(); if (!el) return;
    var slug = c.slug;
    var book = (r.book != null && r.book !== '') ? r.book : BOOKLESS_DEFAULT;
    var num = r.hadith;
    var activeLang = readLang();

    el.innerHTML = '<div class="dv dv-loading"><div class="dv-body-card" aria-hidden="true" style="opacity:.5;height:220px;"></div></div>';

    // 1) core single-hadith fetch (body block critical path)
    var res;
    try { res = await host.api.fetchSingleHadith(slug, book, num); } catch (_) { res = null; }
    if ($('#ii-tier2') !== el && !host.tier2El()) return;             // route changed mid-fetch
    var h = (res && res.ok && res.data) ? res.data : null;

    // 2) paint immediately with no neighbors yet (prev/next resolved after)
    el.innerHTML = t3.deepViewHTML(r, c, h, { activeLang: activeLang, neighbors: { prev: null, next: null }, book: book });
    wireDeepView(el, r, slug, book);

    // 3) deep-link scroll + gold pulse (TechSpec §3.5; respects reduced-motion)
    var body = el.querySelector('.dv-body-card');
    if (body) {
      body.scrollIntoView({ behavior: (root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches) ? 'auto' : 'smooth', block: 'start' });
      if (!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
        body.classList.add('pulse-gold');
        setTimeout(function () { body.classList.remove('pulse-gold'); }, 1600);
      }
    }

    // 4) resolve prev/next from the book list (deferred, non-blocking — never blocks body paint)
    host.api.fetchHadithsByBook(slug, book, 1, 1000).then(function (lst) {
      var slot = el.querySelector('.dv-prevnext-slot'); if (!slot) return;
      var list = (lst && lst.ok && lst.data && Array.isArray(lst.data.hadiths)) ? lst.data.hadiths : [];
      var neighbors = t3.resolveNeighbors(list, num);
      slot.innerHTML = t3.prevNextNavHTML(neighbors, slug, book);
    }).catch(function () {});

    // 5) record last-read (Continue Reading source) when the hadith loaded
    if (h && host.ui && host.ui.safeLocalStorageSet) {
      host.ui.safeLocalStorageSet('islamicinfo-hadith-last-read', { collectionSlug: slug, bookNum: book, hadithNum: num });
    }
  }

  II.tier3 = { init: init, renderList: renderList, renderDeepView: renderDeepView };

}(typeof globalThis !== 'undefined' ? globalThis : window));
