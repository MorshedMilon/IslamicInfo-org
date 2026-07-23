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
  var BOOKLESS_DEFAULT = 1;                          // bookless collections use book segment 1
  var GRADES = { sahih: 1, hasan: 1, daif: 1, mawdu: 1 };
  var listCore = II.hadithList;                      // pure logic (Task 4)

  function esc(s) { return (host && host.ui && host.ui.escapeHTML) ? host.ui.escapeHTML(s) : String(s == null ? '' : s); }
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }

  // ?grade= deep-link (TechSpec §4): read once on load; only a recognized
  // grade value is honored, else 'all' (never trust an arbitrary query string).
  function readGradeParam() {
    var g; try { g = new URLSearchParams(location.search).get('grade'); } catch (_) { g = null; }
    return (g && GRADES[g]) ? g : 'all';
  }

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
    var n = (count != null) ? (' · ' + esc(count) + ' hadith' + (count === 1 ? '' : 's')) : '';
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
               'data-grade="' + p[0] + '" aria-pressed="' + (on ? 'true' : 'false') + '">' + p[1] + '</button>';
      }).join('') + '</div>';
  }

  function applyListGradeFilterTo(cards, filter) {
    cards.forEach(function (card) {
      var vis = (filter === 'all' || card.getAttribute('data-grade') === filter);
      card.style.display = vis ? '' : 'none';
    });
  }
  function updateListStatus() {
    var listEl = $('#ii-t3a-list'); if (!listEl) return;
    var cards = listEl.querySelectorAll('.hadith-card[data-ref]');
    var loaded = cards.length, shown = 0;
    cards.forEach(function (c) { if (c.style.display !== 'none') shown++; });
    var status = $('#t3a-status'); if (!status) return;
    var where = (LIST.mode === 'book') ? ' in this book' : ' in this collection';
    if (LIST.grade !== 'all') {
      status.textContent = 'Showing ' + shown + ' of ' + loaded + ' loaded hadith' + (loaded === 1 ? '' : 's');
    } else if (LIST.bookTotal != null) {
      status.textContent = 'Loaded ' + loaded + ' of ' + LIST.bookTotal + where;
    } else {
      status.textContent = 'Loaded ' + loaded + ' hadith' + (loaded === 1 ? '' : 's');
    }
  }
  function applyListGradeFilter(listEl, filter) {
    applyListGradeFilterTo(listEl.querySelectorAll('.hadith-card[data-ref]'), filter);
    updateListStatus();
  }

  // Endless Load-More button (replaces the old book Prev/Next). One button; a
  // state machine drives its label/visibility. Reuses the .load-more-btn styles.
  function loadMoreHTML() {
    return '<div class="t3a-load-more" id="ii-t3a-lm-wrap" style="text-align:center;margin:8px 0 24px;">' +
      '<button class="load-more-btn" id="ii-t3a-lm" type="button">' +
      '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 5v14M5 12l7 7 7-7"/></svg> ' +
      '<span>Load more hadiths</span></button></div>';
  }
  function setListLoadMore(mode) {
    var wrap = $('#ii-t3a-lm-wrap'), btn = $('#ii-t3a-lm');
    if (!wrap || !btn) return;
    var lbl = btn.querySelector('span');
    var end = $('#ii-t3a-lm-end'); if (end) end.remove();
    if (mode === 'hide') { wrap.style.display = 'none'; return; }
    wrap.style.display = '';
    if (mode === 'end') {
      btn.style.display = 'none';
      var n = document.createElement('div'); n.id = 'ii-t3a-lm-end';
      n.style.cssText = 'font-size:13px;color:var(--ink-muted);';
      if (LIST.mode === 'book' && LIST.nextBook) {
        // Bounded book view: offer the deliberate jump to the next book (SPA-routed <a>).
        n.innerHTML = 'End of ' + esc(LIST.bookName || 'this book') + ' · ' +
          '<a class="t3a-next-book" href="/hadith/' + encodeURIComponent(LIST.slug) + '/' + encodeURIComponent(LIST.nextBook.num) + '">' +
          'Continue to ' + esc(LIST.nextBook.name) + ' →</a>';
      } else if (LIST.mode === 'book' && LIST.isLastBook) {
        // Only claim "last book" when the book list actually resolved and confirmed it.
        n.textContent = 'End of ' + (LIST.bookName || 'this book') + ' — the last book in this collection.';
      } else if (LIST.mode === 'book') {
        n.textContent = 'End of ' + (LIST.bookName || 'this book') + '.';   // next book unknown (list unavailable)
      } else {
        n.textContent = 'You’ve reached the end of this collection.';
      }
      wrap.appendChild(n); return;
    }
    btn.style.display = '';
    if (mode === 'loading') { btn.disabled = true; if (lbl) lbl.textContent = 'Loading…'; }
    else if (mode === 'error') { btn.disabled = false; if (lbl) lbl.textContent = 'Retry — load more'; }
    else { btn.disabled = false; if (lbl) lbl.textContent = 'Load more hadiths'; }
  }

  // Tier-3a list state. `mode` is 'book' (hadithapi collections — bounded to one book,
  // entered from the books grid) or 'flat' (direct-source bookless collections — one
  // continuous sequence). `next` holds the target for the following Load More.
  var LIST = { slug: null, collection: null, provider: null, mode: 'flat',
               book: null, page: 0, lastPage: null, bookOrder: null, books: null,
               bookName: null, bookTotal: null, nextBook: null, isLastBook: false,
               next: null, refs: null, byRef: {}, grade: 'all', loading: false, token: null };

  // Resolve the current book's name + total + the following book (for the "continue"
  // link) from the books list. Book mode only; no-op for flat/direct-source collections.
  function updateBookMeta() {
    LIST.bookName = null; LIST.nextBook = null; LIST.isLastBook = false;
    if (LIST.mode !== 'book' || !Array.isArray(LIST.books)) return;   // books unresolved → stay "unknown"
    var idx = -1;
    for (var i = 0; i < LIST.books.length; i++) {
      if (String(LIST.books[i].bookNumber) === String(LIST.book)) { idx = i; break; }
    }
    if (idx === -1) return;                                           // current book not in list → "unknown"
    var cur = LIST.books[idx];
    LIST.bookName = cur.bookName || ('Book ' + LIST.book);
    if (LIST.bookTotal == null && typeof cur.hadithCount === 'number' && cur.hadithCount > 0) LIST.bookTotal = cur.hadithCount;
    if (idx < LIST.books.length - 1) {
      var nx = LIST.books[idx + 1];
      LIST.nextBook = { num: nx.bookNumber, name: nx.bookName || ('Book ' + nx.bookNumber) };
    } else {
      LIST.isLastBook = true;                                         // confirmed last book in the resolved list
    }
  }

  // Re-render the breadcrumb header with the resolved book name + true total.
  function updateListHeader() {
    var host2 = host.tier2El(); if (!host2 || !LIST.collection) return;
    var header = host2.querySelector('.t3a-header'); if (!header) return;
    var bookNum = (LIST.mode === 'book') ? LIST.book : null;
    var name = (LIST.mode === 'book') ? (LIST.bookName || ('Book ' + LIST.book)) : LIST.collection.nameEnglish;
    header.outerHTML = listHeaderHTML(LIST.collection, bookNum, name, LIST.bookTotal);
  }

  // In-book (or in-collection) position label — a navigation aid, NEVER a citation
  // number. The canonical hadith number on the card is untouched.
  function posLabelHTML(pos) {
    var totalTxt = (LIST.bookTotal != null) ? (' of ' + LIST.bookTotal) : '';
    var where = (LIST.mode === 'book') ? ' in this book' : ' in this collection';
    return '<div class="t3a-inbook-pos">Position ' + pos + totalTxt + where + '</div>';
  }

  // Fetch one page for the current provider. hadithapi → that book's page (bounded);
  // direct sources → flat page over the whole collection. Returns the Worker envelope.
  function fetchListPage(book, page) {
    if (LIST.provider === 'hadithapi') return host.api.fetchHadithList(LIST.slug, book, page, 25);
    return host.api.fetchHadithsByBook(LIST.slug, BOOKLESS_DEFAULT, page, 25);
  }

  async function loadListPage(append) {
    var listEl = $('#ii-t3a-list'); if (!listEl || LIST.loading) return;
    LIST.loading = true;
    var target = append ? (LIST.next || { book: LIST.book, page: LIST.page + 1 })
                        : { book: LIST.book, page: 1 };
    if (append) setListLoadMore('loading');
    var token = LIST.token;
    var res; try { res = await fetchListPage(target.book, target.page); } catch (_) { res = null; }
    if (token !== LIST.token) { LIST.loading = false; return; }         // route changed mid-fetch
    LIST.loading = false;

    if (!res || !res.ok || !res.data || !Array.isArray(res.data.hadiths)) {
      if (append) { setListLoadMore('error'); if (host.ui.showToast) host.ui.showToast('Could not load more — try again'); }
      else {
        setListLoadMore('hide');
        listEl.innerHTML = '<div class="books-error"><div class="books-empty-title">Hadiths temporarily unavailable</div>' +
          '<div>We couldn’t load the hadiths for this collection.</div>' +
          '<button class="btn-glass" id="ii-t3a-retry" type="button" style="margin-top:14px;">Try again</button></div>';
        var retry = $('#ii-t3a-retry'); if (retry) retry.addEventListener('click', function () { loadListPage(false); });
      }
      return;
    }

    var data = res.data;
    if (data.total != null) LIST.bookTotal = data.total;     // authoritative book (or collection) total
    var base = (Math.max(1, target.page) - 1) * 25;          // in-book ordinal of this page's first hadith
    // Position map keyed off the RAW page order (before dedupe), so a dropped malformed
    // /duplicate record or a short page can't shift the labels of the cards that follow.
    var posByRef = {};
    (data.hadiths || []).forEach(function (h, j) {
      var rr = host.feed.refOf(h);
      if (rr && posByRef[rr] == null) posByRef[rr] = base + j + 1;
    });
    var fresh = host.feed.dedupeByRef(LIST.refs, data.hadiths);
    fresh.forEach(function (h) { var r = host.feed.refOf(h); LIST.refs.add(r); LIST.byRef[r] = h; });
    var html = fresh.map(host.feed.buildCardHTML).join('');
    var newCards;
    if (append) {
      var before = listEl.querySelectorAll('.hadith-card[data-ref]').length;
      if (html) listEl.insertAdjacentHTML('beforeend', html);
      if (host.observeFeed) host.observeFeed(listEl);          // IO.observe is idempotent
      var all = listEl.querySelectorAll('.hadith-card[data-ref]');
      newCards = Array.prototype.slice.call(all, before);
      applyListGradeFilterTo(newCards, LIST.grade);            // only NEW cards
    } else {
      listEl.innerHTML = html || '<div class="books-empty"><div class="books-empty-title">No hadiths available here.</div></div>';
      if (host.observeFeed) host.observeFeed(listEl);
      newCards = Array.prototype.slice.call(listEl.querySelectorAll('.hadith-card[data-ref]'), 0);
      applyListGradeFilterTo(newCards, LIST.grade);
    }
    // In-book position label (nav aid, not a citation) — placed right after the hadith
    // header so screen readers announce the canonical number first.
    newCards.forEach(function (card) {
      var pos = posByRef[card.getAttribute('data-ref')];
      var hdr = card.querySelector('.hadith-header');
      if (pos != null && hdr) hdr.insertAdjacentHTML('afterend', posLabelHTML(pos));
    });
    updateListStatus();
    if (!append) updateListHeader();                          // reflect the true total once known

    LIST.book = target.book; LIST.page = data.page || target.page; LIST.lastPage = data.lastPage;
    // Book-scoped (and flat) paging: page within the current book/sequence only — no
    // auto chapter-walk (bookOrder omitted). At the book's end a "Continue to next book"
    // link is offered instead (see setListLoadMore).
    var adv = listCore.computeListAdvance({ provider: LIST.provider, book: LIST.book,
      page: LIST.page, lastPage: LIST.lastPage, bookOrder: null });
    LIST.next = adv.done ? null : { book: adv.book, page: adv.page };

    setListLoadMore(listCore.loadMoreMode({ freshCount: fresh.length, append: append, done: adv.done }));
  }

  function wireListGradePills(el) {
    el.querySelectorAll('.t3a-grade-filter .grade-filter-pill').forEach(function (pill) {
      pill.addEventListener('click', function () {
        LIST.grade = pill.getAttribute('data-grade');
        el.querySelectorAll('.t3a-grade-filter .grade-filter-pill').forEach(function (p) {
          var on = p === pill; p.classList.toggle('on', on); p.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        applyListGradeFilter($('#ii-t3a-list'), LIST.grade);
      });
    });
  }
  function wireListLoadMore() {
    var btn = $('#ii-t3a-lm'); if (btn) btn.addEventListener('click', function () { loadListPage(true); });
  }
  function wireListFullView(el) {
    if (el.dataset.t3aFullWired) return;                 // #ii-tier2 persists across renders (only
    el.dataset.t3aFullWired = '1';                        // its innerHTML is replaced) — wire once.
    el.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('[data-act="full"]');
      if (!btn || !el.contains(btn)) return;
      var card = btn.closest('.hadith-card'); if (!card) return;
      var ref = card.getAttribute('data-ref'); if (!ref) return;
      var parts = ref.split(':');                                       // slug:book:num
      host.routeTo({ collection: parts[0], book: parts[1], hadith: parts[2] }, true);
    });
  }
  function searchBarHTML() {
    return '<form class="t3a-search" id="ii-t3a-search" role="search" aria-label="Search this collection">' +
      '<input id="ii-t3a-search-input" type="search" inputmode="text" ' +
      'placeholder="Search this collection — hadith number or keyword" ' +
      'aria-label="Search this collection by hadith number or keyword" autocomplete="off">' +
      '<button type="submit">Search</button></form>';
  }

  // Text used for client-side keyword matching against direct-source hadiths
  // (the Worker's /api/hadith/search only accepts the 9 hadithapi ALLOWED_SLUGS).
  function hadithSearchText(h) {
    return [h && h.arabicMatn, h && h.translation && h.translation.text, h && h.reference,
            h && h.narrator && h.narrator.name].filter(Boolean).join(' ');
  }

  // Bumps LIST.token to invalidate any in-flight loadListPage/search fetch that
  // resolves after a mode switch (search ↔ endless list), so stale results can
  // never be written into a list that's moved on.
  function bumpListToken() { LIST.token = LIST.slug + ':' + Date.now(); return LIST.token; }

  function wireListSearch(el, c) {
    var form = $('#ii-t3a-search', el), input = $('#ii-t3a-search-input', el);
    if (!form || !input) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var parsed = listCore.parseSearchInput(input.value);
      var status = $('#t3a-status');
      if (parsed.kind === 'number') { openHadithByNumber(c, parsed.number); return; }
      if (parsed.kind === 'keyword') { runKeywordSearch(c, parsed.query); return; }
      if (parsed.kind === 'too-short') { if (status) status.textContent = 'Type at least 2 characters, or a hadith number.'; return; }
      restoreFullList();   // empty → restore the full endless list
    });
  }

  // Number jump. hadithapi: resolve the number → its book, then open the deep view.
  // Direct sources: the deep view finds the hadith by number itself (book segment ignored).
  function openHadithByNumber(c, num) {
    var status = $('#t3a-status');
    // Fast path: if the number is already loaded in the current view, jump straight to it
    // (works instantly, and even if the number-resolver API route is unavailable).
    var refs = Object.keys(LIST.byRef);
    for (var k = 0; k < refs.length; k++) {
      var lh = LIST.byRef[refs[k]];
      if (lh && String(lh.hadithNumber) === String(num)) {
        host.routeTo({ collection: c.slug, book: (lh.bookNumber != null ? lh.bookNumber : LIST.book), hadith: num }, true);
        return;
      }
    }
    if (LIST.provider !== 'hadithapi') {
      host.routeTo({ collection: c.slug, book: BOOKLESS_DEFAULT, hadith: num }, true);
      return;
    }
    var token = LIST.token;
    if (status) status.textContent = 'Finding hadith #' + num + '…';
    host.api.fetchHadithByNumber(c.slug, num).then(function (res) {
      if (token !== LIST.token) return;                       // navigated away → drop stale result
      var h = res && res.ok && res.data && Array.isArray(res.data.hadiths) ? res.data.hadiths[0] : null;
      if (h && h.bookNumber != null) {
        host.routeTo({ collection: c.slug, book: h.bookNumber, hadith: num }, true);
      } else if (status) {
        status.textContent = 'No hadith #' + num + ' found in ' + c.nameEnglish + '.';
      }
    }).catch(function () { if (token === LIST.token && status) status.textContent = 'Couldn’t look up hadith #' + num + ' — try again.'; });
  }

  // Keyword search, scoped to the current collection. Renders results in the list
  // container and swaps Load More for a "clear search" control.
  function runKeywordSearch(c, q) {
    var listEl = $('#ii-t3a-list'), status = $('#t3a-status');
    if (!listEl) return;
    var token = bumpListToken();          // switch to search mode; invalidate any in-flight load-more
    LIST.loading = false;
    setListLoadMore('hide');
    listEl.innerHTML = '<div class="books-empty"><div class="books-empty-title">Searching “' + esc(q) + '”…</div></div>';
    var p = (LIST.provider === 'hadithapi')
      ? host.api.fetchHadithSearch(q, readLang(), 1, c.slug).then(function (res) {
          return (res && res.ok && res.data && Array.isArray(res.data.results)) ? res.data.results : null;
        })
      : host.api.fetchHadithsByBook(c.slug, BOOKLESS_DEFAULT, 1, 1000000).then(function (res) {
          if (!res || !res.ok || !res.data || !Array.isArray(res.data.hadiths)) return null;
          var needle = q.toLowerCase();
          return res.data.hadiths.filter(function (h) { return hadithSearchText(h).toLowerCase().indexOf(needle) !== -1; });
        });
    p.then(function (results) {
      if (token !== LIST.token) return;                        // navigated/re-searched → drop stale
      var listEl2 = $('#ii-t3a-list'); if (!listEl2) return;
      if (!results) {
        listEl2.innerHTML = '<div class="books-error"><div class="books-empty-title">Search unavailable</div><div>Please try again in a moment.</div></div>';
        return;
      }
      results = results.filter(function (h) { return !h.collectionSlug || h.collectionSlug === c.slug; });
      if (!results.length) {
        listEl2.innerHTML = '<div class="books-empty"><div class="books-empty-title">No matches for “' + esc(q) + '” in ' + esc(c.nameEnglish) + '.</div></div>';
      } else {
        results.forEach(function (h) { var r = host.feed.refOf(h); if (r) LIST.byRef[r] = h; });
        listEl2.innerHTML = results.map(host.feed.buildCardHTML).join('');
        if (host.observeFeed) host.observeFeed(listEl2);
        applyListGradeFilter(listEl2, LIST.grade);
      }
      renderSearchClear(q, results.length);
    }).catch(function () {
      if (token !== LIST.token) return;
      var listEl2 = $('#ii-t3a-list'); if (listEl2) listEl2.innerHTML = '<div class="books-error"><div class="books-empty-title">Search unavailable</div><div>Please try again.</div></div>';
    });
  }

  function renderSearchClear(q, count) {
    var listEl = $('#ii-t3a-list'); if (!listEl) return;
    var existing = document.querySelector('.t3a-search-clear'); if (existing) existing.remove();
    var bar = document.createElement('div');
    bar.className = 't3a-search-clear';
    bar.innerHTML = count + ' result' + (count === 1 ? '' : 's') + ' for “' + esc(q) + '” · ' +
      '<a href="#" id="ii-t3a-clear">Clear search — back to all hadith</a>';
    listEl.parentNode.insertBefore(bar, listEl);
    var link = $('#ii-t3a-clear');
    if (link) link.addEventListener('click', function (e) { e.preventDefault(); restoreFullList(); });
  }

  function restoreFullList() {
    var clear = document.querySelector('.t3a-search-clear'); if (clear) clear.remove();
    var input = $('#ii-t3a-search-input'); if (input) input.value = '';
    bumpListToken(); LIST.loading = false;                     // invalidate in-flight fetch; allow reload
    LIST.page = 0; LIST.lastPage = null; LIST.next = null; LIST.refs = new Set(); LIST.byRef = {};
    // Keep LIST.book — clearing a search returns to the SAME book/collection being browsed,
    // not back to book 1.
    loadListPage(false);
  }

  async function renderList(r, c) {
    host.setTier(2);
    if (host.resetReadingProgress) host.resetReadingProgress();
    var el = host.tier2El(); if (!el) return;
    var slug = c.slug;
    var grade = readGradeParam();
    var token = slug + ':' + Date.now();
    el.dataset.t3aToken = token;

    LIST.slug = slug; LIST.collection = c;
    LIST.provider = (host.api.hadithProviderOf ? host.api.hadithProviderOf(slug) : 'hadithapi');
    LIST.mode = (LIST.provider === 'hadithapi') ? 'book' : 'flat';   // hadithapi = bounded book; direct = flat
    LIST.page = 0; LIST.lastPage = null; LIST.bookOrder = null; LIST.books = null; LIST.next = null;
    LIST.bookName = null; LIST.bookTotal = null; LIST.nextBook = null;
    LIST.refs = new Set(); LIST.byRef = {}; LIST.grade = grade; LIST.loading = false;
    LIST.token = token;
    LIST.book = (LIST.mode === 'book' && r.book != null && r.book !== '') ? r.book
              : (LIST.mode === 'book' ? 1 : BOOKLESS_DEFAULT);

    var skeleton = '';
    for (var i = 0; i < 4; i++) skeleton += '<div class="hadith-card" aria-hidden="true" style="opacity:.5;height:120px;"></div>';
    // Initial header: "Book N" placeholder for book mode (real name arrives with the books list),
    // collection name for flat mode.
    var initName = (LIST.mode === 'book') ? null : c.nameEnglish;
    var initBookNum = (LIST.mode === 'book') ? LIST.book : null;
    el.innerHTML = listHeaderHTML(c, initBookNum, initName, null) + searchBarHTML() + gradePillsHTML(grade) +
      '<div id="t3a-status" class="ii-sr-live" aria-live="polite" style="font-size:12px;color:var(--ink-muted);margin:8px 0;"></div>' +
      '<div class="t3a-list" id="ii-t3a-list">' + skeleton + '</div>' + loadMoreHTML();

    wireListGradePills(el);
    wireListLoadMore();
    wireListFullView(el);
    wireListSearch(el, c);

    if (LIST.mode === 'book') {
      try {
        var b = await host.api.fetchHadithBooks(slug);
        if (LIST.token !== token) return;
        if (b && b.ok && Array.isArray(b.data)) {
          LIST.books = b.data;
          LIST.bookOrder = b.data.map(function (x) { return x.bookNumber; })
            .filter(function (n) { return n != null; });
          if ((r.book == null || r.book === '') && LIST.bookOrder.length) LIST.book = LIST.bookOrder[0];
          updateBookMeta();       // resolve current book name + next-book link
          updateListHeader();     // label the book (count fills in after the first page loads)
        }
      } catch (_) { /* no book list → header keeps the "Book N" label; still pages this book */ }
    }
    if (LIST.token !== token) return;
    loadListPage(false);
  }

  /* ═══════════════ Tier 3b — deep-view ═══════════════ */

  function wireDeepView(el) {
    if (el.dataset.dvWired) return;
    el.dataset.dvWired = '1';
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
      // Module 16 — display-mode toggles (Study / Reading) live in the header
      var mbtn = e.target.closest && e.target.closest('.dv-mode-btn[data-mode]');
      if (mbtn && el.contains(mbtn)) { toggleMode(mbtn.getAttribute('data-mode')); return; }
      var exitStudy = e.target.closest && e.target.closest('.exit-study');
      if (exitStudy && el.contains(exitStudy)) { exitMode(); return; }

      // Module 10 wiring stub — honest toast, no dead onclick
      var act = e.target.closest && e.target.closest('.dv-action-btn[data-act]');
      if (act && el.contains(act) && host.ui && host.ui.showToast) {
        host.ui.showToast('This action arrives in a later update');
      }
    });
  }

  /* ═══════════════ Module 16 — Study / Reading display modes ═══════════════
     Pure decisions come from II.hadithDisplayMode; this layer only mutates the
     <html> classList, the URL (?mode=reading), the storage mirror, and focus.
     Modes are mutually exclusive (a single root class ever set). Reading is
     persisted (URL primary + storage); Study is session-only (US-H20). */
  var dm = II.hadithDisplayMode;
  var currentMode = null;                 // null = not yet resolved from URL/storage
  var modeWired = false;                  // global (document-level) wiring installed once
  var readingExitBtn = null;

  function resolveInitialMode() {
    var stored = host && host.ui && host.ui.safeLocalStorageGet
      ? host.ui.safeLocalStorageGet(dm.STORAGE_KEY, null) : null;
    return dm.initialMode({ search: location.search, storageValue: stored });
  }

  // Persist Reading Mode: URL param is the source of truth (shareable, reload-
  // safe); the storage key mirrors it so the preference survives in-app
  // navigation that dropped the param. Study never persists.
  function syncReadingPersistence(active) {
    try {
      var search = dm.setReadingParam(location.search, active);
      history.replaceState(history.state, '', location.pathname + search + location.hash);
    } catch (_) {}
    try {
      if (active) { if (host.ui && host.ui.safeLocalStorageSet) host.ui.safeLocalStorageSet(dm.STORAGE_KEY, '1'); }
      else { localStorage.removeItem(dm.STORAGE_KEY); }
    } catch (_) {}
  }

  function reduceMotion() {
    return !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  // Inject / remove the Study Mode banner inside the current deep-view article.
  function syncStudyBanner(el, mode) {
    if (!el) return;
    var dv = el.querySelector('.dv');
    var existing = el.querySelector('.study-mode-banner');
    if (mode === dm.STUDY) {
      if (!existing && dv) dv.insertAdjacentHTML('afterbegin', dm.studyBannerHTML());
    } else if (existing && existing.parentNode) {
      existing.parentNode.removeChild(existing);
    }
  }

  // Reflect state onto the DOM. `persist` false during silent re-mounts so a
  // per-view repaint doesn't rewrite the URL/storage that already match.
  function applyMode(mode, persist) {
    mode = dm.normalize(mode);
    currentMode = mode;
    var el = host.tier2El();
    document.documentElement.classList.toggle(dm.STUDY_CLASS, mode === dm.STUDY);
    document.documentElement.classList.toggle(dm.READING_CLASS, mode === dm.READING);
    if (persist !== false) syncReadingPersistence(mode === dm.READING);
    // button pressed states
    if (el) el.querySelectorAll('.dv-mode-btn[data-mode]').forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-mode') === mode ? 'true' : 'false');
    });
    syncStudyBanner(el, mode);
  }

  // Return focus to a sensible control after a mode change (US-H20/H21: focus
  // returns to the deep-view page on exit).
  function focusFor(mode, previous) {
    var el = host.tier2El(); if (!el) return;
    var target = null;
    if (mode === dm.READING) target = readingExitBtn;
    else if (mode === dm.STUDY) target = el.querySelector('.exit-study');
    else target = el.querySelector('.dv-mode-btn[data-mode="' + (previous || dm.STUDY) + '"]')
              || el.querySelector('.dv-mode-btn');
    if (target && target.focus) { try { target.focus(); } catch (_) {} }
  }

  function toggleMode(targetMode) {
    var prev = currentMode;
    applyMode(dm.toggle(currentMode, targetMode), true);
    focusFor(currentMode, targetMode);
  }

  function exitMode() {
    var prev = currentMode;
    if (prev === dm.NONE) return;
    applyMode(dm.NONE, true);
    focusFor(dm.NONE, prev);
  }

  function ensureGlobalModeWiring() {
    if (modeWired) return;
    modeWired = true;
    // Fixed top-right Reading-Mode exit (× ); CSS shows it only in reading mode.
    readingExitBtn = document.createElement('button');
    readingExitBtn.type = 'button';
    readingExitBtn.className = 'reading-exit';
    readingExitBtn.setAttribute('aria-label', 'Exit Reading Mode');
    readingExitBtn.textContent = '×';
    readingExitBtn.addEventListener('click', exitMode);
    document.body.appendChild(readingExitBtn);
    // Escape exits whichever mode is active (Study or Reading).
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (currentMode && currentMode !== dm.NONE) { e.preventDefault(); exitMode(); }
    });
  }

  // Sync (no banner/persistence/focus): restore the standing mode's <html>
  // classes before the loading paint so hadith→hadith nav in a mode doesn't
  // flash the chrome. Resolves the initial mode on first deep-view load.
  function reapplyModeClasses() {
    if (!dm) return;
    if (currentMode === null) currentMode = resolveInitialMode();
    document.documentElement.classList.toggle(dm.STUDY_CLASS, currentMode === dm.STUDY);
    document.documentElement.classList.toggle(dm.READING_CLASS, currentMode === dm.READING);
  }

  // Remove the mode classes on route change. Reading Mode is a saved preference
  // (currentMode + storage retained → re-applied when a deep view renders); Study
  // Mode is a per-view focus toggle, so a route change drops it entirely.
  function clearModeClasses() {
    if (!dm) return;
    document.documentElement.classList.remove(dm.STUDY_CLASS, dm.READING_CLASS);
    if (currentMode === dm.STUDY) currentMode = dm.NONE;
  }

  // Called on every deep-view paint: install global wiring, inject the header
  // toggle buttons, and silently re-apply the standing mode (banner + classes)
  // without stealing focus or rewriting persistence.
  function mountModeControls(el) {
    if (!dm || !el) return;
    ensureGlobalModeWiring();
    if (currentMode === null) currentMode = resolveInitialMode();
    var header = el.querySelector('.dv-header');
    if (header && !header.querySelector('.dv-modes')) {
      header.insertAdjacentHTML('beforeend', dm.modeButtonsHTML(currentMode));
    }
    applyMode(currentMode, false);
  }

  async function renderDeepView(r, c) {
    host.setTier(2);
    reapplyModeClasses();   // Module 16: restore standing display mode before loading paint (no flash)
    if (host.resetReadingProgress) host.resetReadingProgress();   // Module 9: cancel any pending dwell timer from the previous view
    var el = host.tier2El(); if (!el) return;
    var slug = c.slug;
    var book = (r.book != null && r.book !== '') ? r.book : BOOKLESS_DEFAULT;
    var num = r.hadith;
    var activeLang = readLang();

    el.innerHTML = '<div class="dv dv-loading"><div class="dv-body-card" aria-hidden="true" style="opacity:.5;height:220px;"></div></div>';

    // 1) core single-hadith fetch (body block critical path)
    var token = slug + ':' + book + ':' + num + ':' + Date.now();
    el.dataset.t3bToken = token;
    var res;
    try { res = await host.api.fetchSingleHadith(slug, book, num); } catch (_) { res = null; }
    if (el.dataset.t3bToken !== token) return;   // a newer renderDeepView started during the await
    var h = (res && res.ok && res.data) ? res.data : null;

    // 2) paint immediately with no neighbors yet (prev/next resolved after)
    el.innerHTML = t3.deepViewHTML(r, c, h, { activeLang: activeLang, neighbors: { prev: null, next: null }, book: book });
    wireDeepView(el);
    mountModeControls(el);   // Module 16: header toggles + re-apply standing display mode

    // 3) deep-link scroll + shared gold pulse (TechSpec §3.5; pulse fn owns reduced-motion)
    var body = el.querySelector('.dv-body-card');
    if (body) {
      var reduce = root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches;
      body.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      if (host.pulseRing) host.pulseRing(body);
    }

    // 4) resolve prev/next from the book list (deferred, non-blocking — never blocks body paint)
    host.api.fetchHadithsByBook(slug, book, 1, 1000).then(function (lst) {
      if (el.dataset.t3bToken !== token) return;
      var slot = el.querySelector('.dv-prevnext-slot'); if (!slot) return;
      var list = (lst && lst.ok && lst.data && Array.isArray(lst.data.hadiths)) ? lst.data.hadiths : [];
      var neighbors = t3.resolveNeighbors(list, num);
      slot.innerHTML = t3.prevNextNavHTML(neighbors, slug, book);
    }).catch(function () {});

    // 5) record last-read (Continue Reading source) when the hadith loaded
    if (h && host.ui && host.ui.safeLocalStorageSet) {
      host.ui.safeLocalStorageSet('islamicinfo-hadith-last-read', { collectionSlug: slug, bookNum: book, hadithNum: num, collectionName: (c && c.nameEnglish) || null, ts: Date.now() });
    }
    if (h && window.II && II.track) II.track('tier3_pageview', { collection: slug, book: book, hadith: num });

    // 6) Reading paths (Module 17): if this hadith belongs to an active reading path,
    //    show the in-path strip (prev/next) and mark it read so progress advances and
    //    "Continue" opens the next unread. No-op when the hadith is in no path.
    if (window.II && II.readingPathsDOM) {
      var pathRef = { collection: slug, book: book, hadith: num };
      II.readingPathsDOM.mountStrip(pathRef);
      if (h) II.readingPathsDOM.markReadForRef(pathRef);
    }
  }

  II.tier3 = { init: init, renderList: renderList, renderDeepView: renderDeepView,
               clearModeClasses: clearModeClasses };

}(typeof globalThis !== 'undefined' ? globalThis : window));
