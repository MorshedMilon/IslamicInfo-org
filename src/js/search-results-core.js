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
  // TAKEN DARK 2026-07-31: the search path scans all 556 corpus records with no
  // exclusion, so every Gate 1 not-a-dua record is returned as a dua card —
  // "definite in his asking" returned ibnmajah:3590 as the sole site result, the
  // exact wording its own narration prohibits. noindex governs crawlers, not
  // on-site search. Stays false until the corpus-level exclusion ships and the
  // owner re-approves. See DUA-CONTENT-INTEGRITY-v1_0 §1.4.
  var DUA_SEARCH_PUBLIC = false;

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

  /* The attribution line is the record's OWN sourceLabel, never a constant.
     This card stamped every result "Hisn al-Muslim" while the corpus draws from
     four translation sources — so a Sunan Ibn Majah or Qur'anic record asserted
     a source its own data contradicts. A card claiming a source the record does
     not support is the same failure class as a hadith shown without its grade.
     A record with no sourceLabel shows NO attribution line rather than a guessed
     one, and belongs in the corpus exclusion set until it is sourced. */
  /* One rule: a label that names no source renders as no attribution.
       'other'      -> "Other source", which fills the slot while naming nothing
       'dua-dhikr'  -> names the DATASET the English came from, not the
                       collection the supplication is from
     Both are the same failure as a guessed source, so both take the same path
     as a missing one — the card renders no attribution element at all.

     These records are NOT excluded. Missing or vacuous attribution never
     causes exclusion on its own: it is a transparency gap, not a defective
     record. All 60 are logged in doc/DUA-SOURCING-BACKLOG.md. */
  var UNNAMED_SOURCE_KEYS = { other: 1, 'dua-dhikr': 1 };

  function duaSourceLabel(d) {
    if (d && UNNAMED_SOURCE_KEYS[d.sourceKey]) return null;
    var s = d && d.sourceLabel;
    return typeof s === 'string' && s.trim() ? s.trim() : null;
  }

  function buildDuaCardHTML(d) {
    d = d || {};
    var category = escapeHTML(d.category);
    var arabic = escapeHTML(d.arabic);
    var transliteration = escapeHTML(d.transliteration);
    var translation = escapeHTML(d.translation);
    var source = duaSourceLabel(d);
    return '' +
      '<article class="sr-card sr-card--dua">' +
        '<p class="sr-category">' + category + '</p>' +
        '<p class="sr-arabic" dir="rtl">' + arabic + '</p>' +
        '<p class="sr-transliteration">' + transliteration + '</p>' +
        '<p class="sr-translation">' + translation + '</p>' +
        (source ? '<p class="sr-attrib">' + escapeHTML(source) + '</p>' : '') +
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
    duaSourceLabel: duaSourceLabel,
    resultsHeading: resultsHeading,
    DUA_SEARCH_PUBLIC: DUA_SEARCH_PUBLIC,
    SCOPES: SCOPES,
  };
  if (typeof module !== 'undefined' && module.exports) { module.exports = core; }
  else { root.II = root.II || {}; root.II.searchResults = core; }

}(typeof globalThis !== 'undefined' ? globalThis : this));
