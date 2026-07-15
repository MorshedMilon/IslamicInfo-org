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
           showBismillah, versesCacheKey, isFresh, attributionText, editionName };
});
