/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — narrator-match-core.js  (Itqan narrator reliability)
   Pure, DOM/network-free matching logic: normalize an English narrator
   name (from hadithapi `englishNarrator`) and resolve it to an Itqan
   narrator id via a CURATED English→id map. UMD: Node + browser.

   ADR-047: v1 matching is EXACT curated-map only. No algorithmic
   transliteration / fuzzy matching — an uncertain match on narrator
   reliability data risks mislabeling a narrator (religious
   misinformation), so no map hit → caller shows "not yet verified".
   Every map entry is verified against the real Arabic Itqan profile
   before inclusion; the map is expanded post-ingestion by querying the
   data (it is NOT AI-authored).
   ═══════════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  // Normalize an English narrator name to a stable lookup key: drop
  // diacritics, parentheticals and honorifics, unify ibn/bin/b and
  // abu/abi, punctuation → space, collapse whitespace, lowercase.
  var HONORIFICS = /\b(ra|rah|raa|anhu|anha|anhum|radiallahu|radiyallahu|rahimahullah|radi)\b/g;
  function normalizeName(s) {
    var out = String(s == null ? '' : s);
    if (out.normalize) out = out.normalize('NFD').replace(/[̀-ͯ]/g, '');   // strip Latin diacritics
    out = out.toLowerCase()
      .replace(/\([^)]*\)/g, ' ')                        // drop "(ra)", parentheticals
      .replace(/may allah be pleased with (him|her|them)/g, ' ')
      .replace(/['`’ʿʾ]/g, '')                           // ayn/hamza glottal marks → remove (Sa`id → said, 'Umar → umar)
      .replace(/[.,"]/g, ' ')                            // other punctuation → space
      .replace(/-/g, ' ')                                // hyphen → space
      .replace(/\b(bin|b|ibn)\b/g, 'ibn')                // unify ibn / bin / b.
      .replace(/\babi\b/g, 'abu')                        // abi → abu
      .replace(HONORIFICS, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return out;
  }

  // Resolve an English narrator name to { id, confidence:'high' } via the
  // curated map, or null (→ "not yet verified"). Exact normalized hit only.
  function matchNarrator(englishName, enMap) {
    var key = normalizeName(englishName);
    if (!key || !enMap) return null;
    var id = enMap[key];
    if (id == null) return null;
    return { id: id, confidence: 'high' };
  }

  var api = { normalizeName: normalizeName, matchNarrator: matchNarrator };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  else { root.II = root.II || {}; root.II.narratorMatch = api; }

}(typeof globalThis !== 'undefined' ? globalThis : window));
