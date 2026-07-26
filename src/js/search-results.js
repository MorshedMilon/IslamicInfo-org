/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — search-results.js
   Controller for search-results.html — the dedicated, indexable
   federated results page (Search Slice 3 / Task 4). Vanilla, guarded.

   Requires (loaded first): api.js (window.II.api), search-results-core.js
   (window.II.searchResults), hadith-citation-core.js + hadith-feed-core.js
   (window.II.hadithFeed, for Hadith cards).

   Query contract: search-results.html?scope=<all|hadith|quran|dua|verify>&q=<text>
   - No q            → neutral prompt, no fetch.
   - hadith / quran   → live card list + "Load more" pagination.
   - dua              → honest "coming soon" note unless DUA_SEARCH_PUBLIC.
   - all              → top-5-per-section federation (Hadith + Qur'an [+ Dua
                        if public]); Verify is intentionally NOT a section.
   - verify           → claim  → opens the QuranlyAI floating panel;
                        keyword → redirects to scope=hadith (same query).

   States follow site rules: plain copy, no urgency, no shimmer.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var api = window.II && window.II.api;
  var core = window.II && window.II.searchResults;
  if (!api || !core) { console.error('[search-results.js] api.js or search-results-core.js not loaded'); return; }
  var feed = window.II && window.II.hadithFeed;   // optional at parse time; guarded per-use

  var ALL_SECTIONS = [
    { key: 'hadith', label: 'Hadith' },
    { key: 'quran',  label: "Qur'an" },
  ];
  if (core.DUA_SEARCH_PUBLIC) ALL_SECTIONS.push({ key: 'dua', label: 'Dua' });

  var scope, q;                      // current state, mutated by navigateTo()/popstate
  var currentPage = 1;
  var reqToken = 0;                  // monotonic guard against out-of-order async responses

  var resultsEl, noteEl, inputEl, formEl, micEl, scopesEl;

  /* ─── small helpers ──────────────────────────────────────────── */

  function setNote(msg) {
    if (!noteEl) return;
    noteEl.textContent = msg || '';
    noteEl.hidden = !msg;
  }

  function setSeo(qVal) {
    if (!qVal) { document.title = 'Search | IslamicInfo'; return; }
    document.title = 'Search: ' + qVal + ' | IslamicInfo';
    var meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Search results for "' + qVal + '" across Qur’an and Hadith on IslamicInfo.org.');
  }

  function setActiveTab(s) {
    if (!scopesEl) return;
    var chips = scopesEl.querySelectorAll('.sr-chip');
    for (var i = 0; i < chips.length; i++) {
      var on = chips[i].getAttribute('data-scope') === s;
      chips[i].classList.toggle('active', on);
      chips[i].setAttribute('aria-selected', on ? 'true' : 'false');
    }
  }

  function cardBuilder(s) {
    if (s === 'hadith') return (feed && feed.buildCardHTML) || function () { return ''; };
    if (s === 'quran')  return core.buildVerseCardHTML;
    if (s === 'dua')    return core.buildDuaCardHTML;
    return function () { return ''; };
  }

  function fetchFor(s, qq, page) {
    if (s === 'hadith') return api.fetchHadithSearch(qq, 'en', page);
    if (s === 'quran')  return api.fetchQuranSearch(qq, page);
    if (s === 'dua')    return api.fetchDuaSearch(qq, page);
    return Promise.resolve(null);
  }

  // Hadith search's envelope uses `lastPage`; Qur'an/Dua search use `totalPages`
  // (see worker/src/hadith.js `search()` vs worker/src/quran-search.js / dua-search.js).
  function hasMorePages(s, data) {
    if (!data || typeof data.page !== 'number') return false;
    if (s === 'hadith') return typeof data.lastPage === 'number' && data.page < data.lastPage;
    return typeof data.totalPages === 'number' && data.page < data.totalPages;
  }

  /* ─── render states ──────────────────────────────────────────── */

  function renderPrompt() {
    resultsEl.innerHTML = '<p class="sr-prompt">Search the Qur’an and Hadith. Type a query above to begin.</p>';
  }

  function renderLoading() {
    resultsEl.innerHTML = '<div class="sr-loading"><div class="sr-spinner" role="status" aria-label="Loading"></div></div>';
  }

  function renderError() {
    resultsEl.innerHTML = '';
    setNote('Search is temporarily unavailable. Please try again.');
  }

  function renderZero(s) {
    resultsEl.innerHTML = '<p class="sr-heading">' + core.resultsHeading(s, q, 0) + ' — try different or more general terms.</p>';
  }

  function renderLoadMore(s, data) {
    var old = resultsEl.querySelector('.sr-more');
    if (old) old.remove();
    if (!hasMorePages(s, data)) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sr-more';
    btn.textContent = 'Load more';
    btn.addEventListener('click', function () {
      btn.disabled = true;
      btn.textContent = 'Loading…';
      currentPage += 1;
      var myToken = ++reqToken;
      fetchFor(s, q, currentPage).then(function (res) {
        if (myToken !== reqToken) return;   // scope/query changed while in flight
        if (!res || res.ok === false) {
          btn.disabled = false;
          btn.textContent = 'Load more';
          setNote('Search is temporarily unavailable. Please try again.');
          return;
        }
        appendResults(s, res.data || {});
      });
    });
    resultsEl.appendChild(btn);
  }

  function appendResults(s, data) {
    var results = Array.isArray(data.results) ? data.results : [];
    var build = cardBuilder(s);
    var wrap = resultsEl.querySelector('.sr-cards');
    if (wrap && results.length) wrap.insertAdjacentHTML('beforeend', results.map(build).join(''));
    renderLoadMore(s, data);
  }

  function renderSingleResults(s, data) {
    var results = Array.isArray(data.results) ? data.results : [];
    var totalKnown = typeof data.total === 'number';
    var total = totalKnown ? data.total : results.length;
    if (!results.length || total === 0) { renderZero(s); return; }
    var build = cardBuilder(s);
    // Hadith search can return total:null (worker/src/hadith.js `wrap.total ?? null`).
    // Never fabricate a count in that case — show a plain heading instead of
    // silently under-reporting via results.length as if it were authoritative.
    var heading = totalKnown ? core.resultsHeading(s, q, total) : ('Results for "' + core.escapeHTML(q) + '"');
    resultsEl.innerHTML =
      '<p class="sr-heading">' + heading + '</p>' +
      '<div class="sr-cards">' + results.map(build).join('') + '</div>';
    renderLoadMore(s, data);
  }

  /* ─── per-scope runners ──────────────────────────────────────── */

  function runSingle(s) {
    currentPage = 1;
    renderLoading();
    var myToken = ++reqToken;
    fetchFor(s, q, 1).then(function (res) {
      if (myToken !== reqToken) return;
      if (!res || res.ok === false) { renderError(); return; }
      renderSingleResults(s, res.data || {});
    });
  }

  function runAll() {
    renderLoading();
    var myToken = ++reqToken;
    Promise.all(ALL_SECTIONS.map(function (sec) { return fetchFor(sec.key, q, 1); })).then(function (resArr) {
      if (myToken !== reqToken) return;
      var sectionsHTML = '';
      var anyFailed = false;
      resArr.forEach(function (res, i) {
        var sec = ALL_SECTIONS[i];
        if (!res || res.ok === false) { anyFailed = true; return; }
        var data = res.data || {};
        var results = Array.isArray(data.results) ? data.results : [];
        var totalKnown = typeof data.total === 'number';
        var total = totalKnown ? data.total : results.length;
        if (!results.length || total === 0) return;   // silently omit empty sections
        var build = cardBuilder(sec.key);
        var top5 = results.slice(0, 5);
        // Hadith search can return total:null — don't gate "See all" on a possibly-
        // fabricated total>5; a live next-page (hasMorePages) also proves there's more.
        var showMore = hasMorePages(sec.key, data) || total > 5;
        var moreLabel = totalKnown
          ? ('See all ' + total + ' in ' + core.escapeHTML(sec.label) + ' →')
          : ('See more in ' + core.escapeHTML(sec.label) + ' →');
        var moreLink = showMore
          ? '<a class="sr-section-more" href="search-results.html?scope=' + sec.key + '&q=' + encodeURIComponent(q) + '">' + moreLabel + '</a>'
          : '';
        // Only show a count badge when the total is actually known — never
        // present results.length as if it were the authoritative total.
        var countHTML = totalKnown ? ('<span class="sr-section-count">' + total + ' result' + (total === 1 ? '' : 's') + '</span>') : '';
        sectionsHTML += '' +
          '<section class="sr-section">' +
            '<div class="sr-section-head"><h2>' + core.escapeHTML(sec.label) + '</h2>' + countHTML + '</div>' +
            '<div class="sr-cards">' + top5.map(build).join('') + '</div>' +
            moreLink +
          '</section>';
      });
      if (!sectionsHTML) {
        if (anyFailed && resArr.every(function (res) { return !res || res.ok === false; })) { renderError(); return; }
        renderZero('all');
        return;
      }
      resultsEl.innerHTML = sectionsHTML;
    });
  }

  // quranlyai-widget.js injects window.QuranlyAI ASYNCHRONOUSLY (it appends
  // quranly-ai-core.js to <head> and loads it over the network), so at
  // DOMContentLoaded time it is usually not ready yet. A one-shot guarded call
  // silently drops the claim on a cold load. Poll briefly (~6s budget) instead.
  function askQuranlyAI(qq) {
    if (window.QuranlyAI && typeof window.QuranlyAI.ask === 'function') {
      try {
        if (typeof window.QuranlyAI.setContext === 'function') {
          window.QuranlyAI.setContext({ type: 'claim', rawText: qq, language: (window.II && window.II.i18n && window.II.i18n.lang) || 'en' });
        }
      } catch (_) { /* non-fatal */ }
      window.QuranlyAI.ask('custom', qq);
      return true;
    }
    return false;
  }

  function askQuranlyAIWhenReady(qq, attempt) {
    if (askQuranlyAI(qq)) return;
    if ((attempt || 0) < 40) { setTimeout(function () { askQuranlyAIWhenReady(qq, (attempt || 0) + 1); }, 150); }
  }

  function runVerify() {
    var isClaim = core.detectClaim(q) === 'claim';
    if (!isClaim) {
      window.location.replace('search-results.html?scope=hadith&q=' + encodeURIComponent(q));
      return;
    }
    resultsEl.innerHTML = '';
    setNote('Verify uses the AI assistant — see the panel.');
    askQuranlyAIWhenReady(q, 0);
  }

  /* ─── boot / dispatch ────────────────────────────────────────── */

  function boot() {
    setNote('');
    if (!q) { renderPrompt(); return; }
    if (scope === 'verify') { runVerify(); return; }
    if (scope === 'dua' && !core.DUA_SEARCH_PUBLIC) {
      resultsEl.innerHTML = '';
      setNote('Dua search is coming soon.');
      return;
    }
    if (scope === 'all') { runAll(); return; }
    runSingle(scope);
  }

  function navigateTo(newScope, newQ, push) {
    scope = core.validateScope(newScope);
    q = String(newQ == null ? '' : newQ).trim();
    if (push) {
      try { history.pushState({ scope: scope, q: q }, '', 'search-results.html?scope=' + scope + '&q=' + encodeURIComponent(q)); }
      catch (_) { /* non-fatal */ }
    }
    setActiveTab(scope);
    if (inputEl) inputEl.value = q;
    setSeo(q);
    boot();
  }

  /* ─── wiring ─────────────────────────────────────────────────── */

  function wireForm() {
    if (!formEl) return;
    formEl.addEventListener('submit', function (e) {
      e.preventDefault();
      navigateTo(scope, inputEl ? inputEl.value : '', true);
    });
  }

  function wireTabs() {
    if (!scopesEl) return;
    var chips = scopesEl.querySelectorAll('.sr-chip');
    for (var i = 0; i < chips.length; i++) {
      chips[i].addEventListener('click', function (e) {
        navigateTo(e.currentTarget.getAttribute('data-scope'), inputEl ? inputEl.value : q, true);
      });
    }
  }

  function wireMic() {
    if (!micEl) return;
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { micEl.addEventListener('click', function () { setNote('Voice search isn’t supported in this browser.'); }); return; }
    micEl.addEventListener('click', function () {
      try {
        var rec = new SR();
        rec.lang = 'en-US'; rec.interimResults = false; rec.maxAlternatives = 1;
        micEl.classList.add('listening');
        rec.onresult = function (ev) {
          var txt = ev.results[0][0].transcript;
          if (inputEl) inputEl.value = txt;
          navigateTo(scope, txt, true);
        };
        rec.onerror = function () { setNote('Voice search didn’t catch that.'); };
        rec.onend = function () { micEl.classList.remove('listening'); };
        rec.start();
      } catch (_) { micEl.classList.remove('listening'); }
    });
  }

  // Delegated: the "Open Full View" action on a reused hadith-feed card routes to
  // the site's path-based deep view (/hadith/[collection]/[book]/[hadith], ADR-026).
  // Every other hadith-card action (bookmark/note/share/copy/trace/compare) is
  // intentionally inert here — this page is display + deep-link only; the full
  // interaction stack lives on hadith.html (design spec §"Out of scope").
  function wireHadithDeepLinks() {
    resultsEl.addEventListener('click', function (e) {
      var btn = e.target && e.target.closest ? e.target.closest('[data-act="full"]') : null;
      if (!btn) return;
      var card = btn.closest('.hadith-card');
      var ref = card && card.getAttribute('data-ref');
      if (!ref) return;
      var parts = ref.split(':');
      if (parts.length !== 3) return;
      window.location.assign('/hadith/' + encodeURIComponent(parts[0]) + '/' + encodeURIComponent(parts[1]) + '/' + encodeURIComponent(parts[2]));
    });
  }

  function onPopState() {
    var p = new URLSearchParams(location.search);
    scope = core.validateScope(p.get('scope'));
    q = (p.get('q') || '').trim();
    setActiveTab(scope);
    if (inputEl) inputEl.value = q;
    setSeo(q);
    boot();
  }

  function init() {
    resultsEl = document.getElementById('sr-results');
    noteEl = document.getElementById('sr-note');
    inputEl = document.getElementById('sr-input');
    formEl = document.getElementById('sr-form');
    micEl = document.getElementById('sr-mic');
    scopesEl = document.getElementById('sr-scopes');
    if (!resultsEl) return;

    var qs = new URLSearchParams(location.search);
    scope = core.validateScope(qs.get('scope'));
    q = (qs.get('q') || '').trim();

    setActiveTab(scope);
    if (inputEl) inputEl.value = q;
    setSeo(q);

    wireForm();
    wireTabs();
    wireMic();
    wireHadithDeepLinks();
    window.addEventListener('popstate', onPopState);

    boot();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

}());
