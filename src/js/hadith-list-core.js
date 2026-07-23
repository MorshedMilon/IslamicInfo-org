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
    if (!s.append && !s.freshCount) return 'hide';
    if (s.done) return 'end';
    return 'idle';
  }

  var core = { parseSearchInput: parseSearchInput, computeListAdvance: computeListAdvance, loadMoreMode: loadMoreMode };
  if (typeof module !== 'undefined' && module.exports) { module.exports = core; }
  else { root.II = root.II || {}; root.II.hadithList = core; }

}(typeof globalThis !== 'undefined' ? globalThis : window));
