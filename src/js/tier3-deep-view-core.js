/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — tier3-deep-view-core.js  (Module 7)
   Pure, framework-free HTML builders + helpers for Tier 3a (in-book list)
   and Tier 3b (single-hadith deep-view). NO DOM, NO network — inputs passed
   in, builders return strings. UMD: window.II.tier3Core in the browser,
   module.exports in tests. Mirrors hadith-feed-core.js.

   Content-authenticity (see hadith-module-decisions memory + spec):
   - Grade badge / gradings table reuse hadith-feed-core gradeParts +
     gradeBadgeHTML (one source of truth); null grader → "grader not
     individually cited"; NEVER a fabricated second scholar.
   - Isnad / topics / extra translations render honest empty states when
     the provider supplies none (always, live).
   ═══════════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  var feed = (typeof require !== 'undefined')
    ? require('./hadith-feed-core.js')
    : (root.II && root.II.hadithFeed);

  function esc(s) {
    if (feed && typeof feed._esc === 'function') return feed._esc(s);
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // Canonical translation languages + display labels (TechSpec §2.7 order).
  var LANG_ORDER = ['en', 'ur', 'fr', 'id', 'tr'];
  var LANG_LABELS = { en: 'English', ur: 'اردو', fr: 'Français', id: 'Indonesia', tr: 'Türkçe' };

  // ── translationModel ──────────────────────────────────────────────
  // Present languages only. Live payload has a single `translation`; future
  // enrichment adds `translations[]`. Never fabricates a missing language.
  function translationModel(h) {
    var out = [];
    function push(t) {
      if (!t || !t.text) return;
      var lang = String(t.language || 'en').toLowerCase();
      if (lang === 'ar') lang = 'en';                 // provider text is the EN translation of AR matn
      if (out.some(function (o) { return o.lang === lang; })) return;
      out.push({ lang: lang, label: LANG_LABELS[lang] || lang.toUpperCase(),
                 text: t.text, translator: t.translator || null, edition: t.edition || null });
    }
    if (h && h.translation) push(h.translation);
    if (h && Array.isArray(h.translations)) h.translations.forEach(push);
    out.sort(function (a, b) {
      var ia = LANG_ORDER.indexOf(a.lang), ib = LANG_ORDER.indexOf(b.lang);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    });
    return out;
  }

  function chooseLang(model, preferred) {
    if (!model || !model.length) return null;
    var hit = preferred && model.filter(function (m) { return m.lang === preferred; })[0];
    return (hit || model[0]).lang;
  }

  var core = {
    _esc: esc,
    LANG_ORDER: LANG_ORDER,
    LANG_LABELS: LANG_LABELS,
    translationModel: translationModel,
    chooseLang: chooseLang,
  };

  if (typeof module !== 'undefined' && module.exports) { module.exports = core; }
  else { root.II = root.II || {}; root.II.tier3Core = core; }

}(typeof globalThis !== 'undefined' ? globalThis : window));
