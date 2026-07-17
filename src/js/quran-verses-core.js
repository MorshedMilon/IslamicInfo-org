/* IslamicInfo.org — quran-verses-core.js
   Pure, DOM-free logic for Study Mode verse rendering. UMD: Node + browser. */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  else { root.II = root.II || {}; root.II.versesCore = api; }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var EDITIONS = { 20: 'Saheeh International', 85: 'Abdul Haleem', 95: 'Maududi' };
  function editionName(id) { return EDITIONS[id] || 'Translation'; }

  // ── Translation catalog helpers (Task 7 — multiple translations) ──
  // Languages written right-to-left. Matched as substrings because some
  // quran.com language_name values are combined (e.g. "divehi, dhivehi, maldivian").
  var RTL_LANGS = ['arabic', 'urdu', 'persian', 'farsi', 'dari', 'pashto', 'sindhi',
    'uighur', 'uyghur', 'divehi', 'dhivehi', 'maldivian', 'hebrew', 'kurdish'];
  function isRtlLanguage(langName) {
    var l = String(langName == null ? '' : langName).toLowerCase();
    for (var i = 0; i < RTL_LANGS.length; i++) { if (l.indexOf(RTL_LANGS[i]) !== -1) return true; }
    return false;
  }

  function titleCase(s) {
    return String(s == null ? '' : s).replace(/\S+/g, function (w) {
      return w.charAt(0).toUpperCase() + w.slice(1);
    });
  }

  // Map an API /resources/translations item (or seed row) to a compact record.
  // Transliterations (e.g. Roman Urdu) carry an RTL language_name but are written
  // in Latin script — force them LTR so they don't get the Arabic font / alignment.
  function normalizeTranslation(x) {
    x = x || {};
    var lang = String(x.language_name || '').toLowerCase();
    var translit = /roman|translit/i.test([x.slug, x.name, x.author_name].join(' '));
    return {
      id: Number(x.id),
      name: x.author_name || x.name || ('Translation ' + x.id),
      language: lang,
      languageLabel: titleCase(lang || 'other'),
      dir: (isRtlLanguage(lang) && !translit) ? 'rtl' : 'ltr'
    };
  }

  // Group normalized translations by language; languages alphabetical but
  // English first; items sorted by name within each group.
  function groupTranslationsByLanguage(list) {
    var byLang = {};
    (list || []).forEach(function (t) {
      var k = t.language || 'other';
      (byLang[k] = byLang[k] || []).push(t);
    });
    var langs = Object.keys(byLang).sort(function (a, b) {
      if (a === 'english') return -1;
      if (b === 'english') return 1;
      return a < b ? -1 : (a > b ? 1 : 0);
    });
    return langs.map(function (lang) {
      var items = byLang[lang].slice().sort(function (a, b) {
        return a.name < b.name ? -1 : (a.name > b.name ? 1 : 0);
      });
      return { language: lang, languageLabel: items[0].languageLabel, items: items };
    });
  }

  function filterTranslations(list, query) {
    var q = String(query == null ? '' : query).trim().toLowerCase();
    if (!q) return (list || []).slice();
    return (list || []).filter(function (t) {
      return (t.name + ' ' + t.language + ' ' + t.languageLabel).toLowerCase().indexOf(q) !== -1;
    });
  }

  function translationsCacheKey() { return 'ii-quran-translations-list'; }

  // ── Compare helpers (Task 7b) ──
  // Curated popularity ranking (most popular first) per language. Verified real
  // quran.com ids. Languages not listed fall back to the API's own order.
  var POPULAR_BY_LANG = {
    english:    [20, 19, 22, 85, 84, 95],
    urdu:       [97, 234, 819, 54, 158],
    bengali:    [161, 213, 163, 162],
    turkish:    [77, 52, 210],
    indonesian: [134, 33, 141],
    french:     [31, 136, 779],
    spanish:    [83, 140, 199],
    german:     [27, 208],
    russian:    [45, 79, 78],
    hindi:      [122]
  };

  // Choose up to n translations to compare within one language: curated-popular
  // first (in ranked order), then any remaining translations in catalog order.
  function pickCompareSet(catalog, language, n) {
    if (typeof n !== 'number') n = 3;
    var lang = String(language == null ? '' : language).toLowerCase();
    var inLang = (catalog || []).filter(function (t) { return t.language === lang; });
    var byId = {}; inLang.forEach(function (t) { byId[t.id] = t; });
    var ranked = POPULAR_BY_LANG[lang] || [];
    var out = [];
    ranked.forEach(function (id) { if (byId[id] && out.indexOf(byId[id]) === -1) out.push(byId[id]); });
    inLang.forEach(function (t) { if (out.indexOf(t) === -1) out.push(t); });
    return out.slice(0, n);
  }

  // Map an API verse's translations[] onto an ordered id list → [{id, text}],
  // sanitized, preserving the requested order (missing ids yield empty text).
  function orderCompareTexts(apiTranslations, orderedIds) {
    var byId = {};
    (apiTranslations || []).forEach(function (t) { byId[t.resource_id] = t; });
    return (orderedIds || []).map(function (id) {
      var hit = byId[id];
      return { id: id, text: hit ? sanitizeTranslation(hit.text) : '' };
    });
  }

  function sanitizeTranslation(html) {
    return String(html == null ? '' : html)
      .replace(/<sup[^>]*>[\s\S]*?<\/sup>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function wbwWords(apiWords) {
    return (apiWords || [])
      .filter(function (w) { return w && w.char_type_name === 'word'; })
      .map(function (w) {
        return { ar: w.text_uthmani || '', en: (w.translation && w.translation.text) || '' };
      });
  }

  function pickTranslation(translations, editionId) {
    var list = translations || [];
    var hit = null;
    for (var i = 0; i < list.length; i++) {
      if (list[i].resource_id === editionId) { hit = list[i]; break; }
    }
    if (!hit) hit = list[0];
    return hit ? sanitizeTranslation(hit.text) : '';
  }

  function normalizeVerse(apiVerse, editionId) {
    return {
      verse_key: apiVerse.verse_key,
      verse_number: apiVerse.verse_number,
      text_uthmani: apiVerse.text_uthmani || '',
      text_uthmani_tajweed: apiVerse.text_uthmani_tajweed || '',
      translation: pickTranslation(apiVerse.translations, editionId),
      words: wbwWords(apiVerse.words)
    };
  }

  function showBismillah(surahId) { return Number(surahId) !== 9; }

  function versesCacheKey(surahId, editionId) { return 'ii-verses-' + surahId + '-' + editionId; }

  function isFresh(fetchedAt, now, maxAgeMs) {
    if (typeof maxAgeMs !== 'number') maxAgeMs = 24 * 60 * 60 * 1000;
    return typeof fetchedAt === 'number' && (now - fetchedAt) < maxAgeMs;
  }

  function attributionText(v, surahName, editionNm, url) {
    return v.translation + '\n' + v.arabic + '\n\n— ' + surahName + ' ' + v.verseKey +
           ' · ' + editionNm + '\n' + url;
  }

  return { sanitizeTranslation, wbwWords, pickTranslation, normalizeVerse,
           showBismillah, versesCacheKey, isFresh, attributionText, editionName,
           isRtlLanguage, normalizeTranslation, groupTranslationsByLanguage,
           filterTranslations, translationsCacheKey,
           POPULAR_BY_LANG, pickCompareSet, orderCompareTexts };
});
