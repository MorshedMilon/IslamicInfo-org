/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — hadith-list-core.js
   Pure, framework-free logic for the Tier-3a endless collection list.
   NO DOM, NO network. UMD (window.II.hadithList in the browser;
   module.exports in tests). Companion to the DOM layer in tier3-deep-view.js.
   ═══════════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  // Classify a raw search-box value.
  //   all-digits            → { kind:'number' }  (jump to that hadith number)
  //   >=2 non-numeric chars → { kind:'keyword' } (text filter)
  //   empty                 → { kind:'empty' }
  //   1 non-numeric char    → { kind:'too-short' } (below the 2-char search floor)
  function parseSearchInput(raw) {
    var s = String(raw == null ? '' : raw).trim();
    if (!s) return { kind: 'empty', number: null, query: '' };
    if (/^\d+$/.test(s)) return { kind: 'number', number: parseInt(s, 10), query: s };
    if (s.length < 2) return { kind: 'too-short', number: null, query: s };
    return { kind: 'keyword', number: null, query: s };
  }

  // Given the page just loaded, decide the next fetch target (or that the stream is done).
  //   cur = { provider, book, page, lastPage, bookOrder }
  //   bookOrder = ordered array of hadithapi book numbers, or null (direct sources /
  //   hadithapi with no book list → single flat sequence within the current book).
  function computeListAdvance(cur) {
    cur = cur || {};
    var walk = (cur.provider === 'hadithapi' && Array.isArray(cur.bookOrder));
    var morePages = (cur.lastPage == null) ? false : (cur.page < cur.lastPage);
    if (morePages) return { done: false, book: cur.book, page: cur.page + 1 };
    if (!walk) return { done: true };                                  // flat sequence exhausted
    var i = cur.bookOrder.map(String).indexOf(String(cur.book));
    if (i === -1 || i >= cur.bookOrder.length - 1) return { done: true };  // last book exhausted
    return { done: false, book: cur.bookOrder[i + 1], page: 1 };       // walk to next book
  }

  // Load-More button state after a load.
  //   'hide'  → nothing loaded on the first page (empty collection/book)
  //   'end'   → stream is done
  //   'idle'  → more available
  function loadMoreMode(s) {
    s = s || {};
    if (!s.done) return 'idle';                 // more available (walk continues even if this page was empty)
    if (!s.append && !s.freshCount) return 'hide';  // first load, empty, and nothing more → truly empty
    return 'end';
  }

  // Common English question/filler words that carry no search signal against hadith
  // TRANSLATION text (the upstream does a literal substring match, so natural-language
  // phrases like "how do I pray" never match as a whole). Used to derive fallback keywords.
  var STOPWORDS = {
    how:1, what:1, when:1, where:1, why:1, who:1, whom:1, whose:1, which:1,
    do:1, does:1, did:1, is:1, are:1, was:1, were:1, be:1, been:1, being:1, am:1,
    can:1, could:1, should:1, would:1, shall:1, will:1, may:1, might:1, must:1,
    the:1, a:1, an:1, and:1, or:1, but:1, if:1, of:1, to:1, in:1, on:1, at:1, by:1,
    for:1, with:1, about:1, from:1, into:1, as:1, so:1, than:1, then:1, that:1, this:1,
    these:1, those:1, it:1, its:1, i:1, you:1, he:1, she:1, we:1, they:1, me:1, my:1,
    your:1, his:1, her:1, our:1, their:1, us:1, them:1, there:1, here:1, any:1, some:1,
    all:1, no:1, not:1, does:1, per:1, tell:1, show:1, find:1, give:1, get:1, want:1
  };

  // Derive ordered fallback keyword candidates from a free-text / natural-language query.
  // When the full phrase matches nothing (upstream is a literal substring search), the DOM
  // layer retries these one at a time and shows "Showing results for: <keyword>".
  // Returns significant content words (len >= 3, not a stopword), de-duplicated, ordered
  // longest-first (a proxy for specificity), capped. Never invents words — subset of input.
  function searchKeywordCandidates(query, max) {
    var s = String(query == null ? '' : query).toLowerCase();
    var tokens = s.split(/[^a-z0-9']+/).filter(Boolean);
    var seen = {}, uniq = [];
    for (var i = 0; i < tokens.length; i++) {
      var t = tokens[i].replace(/^'+|'+$/g, '');           // trim stray quotes
      if (t.length < 3 || STOPWORDS[t] || seen[t]) continue;
      seen[t] = 1; uniq.push(t);
    }
    uniq.sort(function (a, b) { return b.length - a.length; });
    var cap = (typeof max === 'number' && max > 0) ? max : 3;
    return uniq.slice(0, cap);
  }

  var core = { parseSearchInput: parseSearchInput, computeListAdvance: computeListAdvance, loadMoreMode: loadMoreMode, searchKeywordCandidates: searchKeywordCandidates };
  if (typeof module !== 'undefined' && module.exports) { module.exports = core; }
  else { root.II = root.II || {}; root.II.hadithList = core; }

}(typeof globalThis !== 'undefined' ? globalThis : window));
