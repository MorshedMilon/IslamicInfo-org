/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — search-results-core.js
   Pure logic for the federated search results page: scope validation,
   tightened claim detection, and escaped verse/dua card builders.
   NO DOM, NO network. UMD (window.II.searchResults in the browser;
   module.exports in tests).
   ═══════════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  var VALID_SCOPES = ['all', 'hadith', 'quran', 'dua', 'verify'];

  // Single source of truth for the Dua-search go-public gate (ADR-051).
  var DUA_SEARCH_PUBLIC = true;

  function validateScope(s) {
    return VALID_SCOPES.indexOf(s) !== -1 ? s : 'all';
  }

  function escapeHTML(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // Tightened claim-vs-keyword heuristic. Word count ALONE never triggers
  // 'claim' — it always requires a verb signal alongside >=5 words.
  function detectClaim(q) {
    var s = String(q == null ? '' : q).trim();
    if (!s) return 'keyword';
    if (/[.?!؟]$/.test(s)) return 'claim';                       // ends with . ? ! or Arabic ؟
    if (/["'«»“”‘’]/.test(s)) return 'claim';                      // any quote
    if (/\b(said|narrated|reported|claims|claim that|prophet|sunnah says)\b/i.test(s)) return 'claim';
    var words = s.split(/\s+/).filter(Boolean);
    if (words.length >= 5 && /\b(is|was|are|were|will|would|should|must|did|does|has|have|can)\b/i.test(s)) return 'claim';
    return 'keyword';
  }

  function buildVerseCardHTML(v) {
    v = v || {};
    var verseKey = escapeHTML(v.verseKey);
    var surahName = escapeHTML(v.surahName);
    var arabic = escapeHTML(v.arabic);
    var translation = escapeHTML(v.translation);
    return '' +
      '<article class="sr-card sr-card--verse">' +
        '<p class="sr-arabic" dir="rtl">' + arabic + '</p>' +
        '<p class="sr-translation">' + translation + '</p>' +
        '<p class="sr-citation">Qur\'an &middot; ' + surahName + ' ' + verseKey + '</p>' +
        '<p class="sr-attrib">Saheeh International &middot; quran.com</p>' +
        '<a class="sr-context-link" href="quran.html?verse=' + encodeURIComponent(v.verseKey || '') + '">Read in context</a>' +
      '</article>';
  }

  function buildDuaCardHTML(d) {
    d = d || {};
    var category = escapeHTML(d.category);
    var arabic = escapeHTML(d.arabic);
    var transliteration = escapeHTML(d.transliteration);
    var translation = escapeHTML(d.translation);
    return '' +
      '<article class="sr-card sr-card--dua">' +
        '<p class="sr-category">' + category + '</p>' +
        '<p class="sr-arabic" dir="rtl">' + arabic + '</p>' +
        '<p class="sr-transliteration">' + transliteration + '</p>' +
        '<p class="sr-translation">' + translation + '</p>' +
        '<p class="sr-attrib">Hisn al-Muslim</p>' +
      '</article>';
  }

  function resultsHeading(scope, q, total) {
    var esc = escapeHTML(q);
    if (total > 0) return total + ' result' + (total === 1 ? '' : 's') + ' for "' + esc + '"';
    return 'No results for "' + esc + '"';
  }

  var SCOPES = [
    { key: 'all',    label: 'All',      state: 'live' },
    { key: 'hadith', label: 'Hadith',   state: 'live' },
    { key: 'quran',  label: "Qur'an",   state: 'live' },
    { key: 'dua',    label: 'Dua',      state: DUA_SEARCH_PUBLIC ? 'live' : 'held' },
    { key: 'verify', label: 'Verify',   state: 'panel' },
  ];

  var core = {
    validateScope: validateScope,
    escapeHTML: escapeHTML,
    detectClaim: detectClaim,
    buildVerseCardHTML: buildVerseCardHTML,
    buildDuaCardHTML: buildDuaCardHTML,
    resultsHeading: resultsHeading,
    DUA_SEARCH_PUBLIC: DUA_SEARCH_PUBLIC,
    SCOPES: SCOPES,
  };
  if (typeof module !== 'undefined' && module.exports) { module.exports = core; }
  else { root.II = root.II || {}; root.II.searchResults = core; }

}(typeof globalThis !== 'undefined' ? globalThis : this));
