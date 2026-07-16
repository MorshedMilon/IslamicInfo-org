/* IslamicInfo.org — reflection-core.js
   Pure, DOM-free logic for the daily "Today's Reflection" trio: deterministic
   UTC-daily rotation, curated reflection verse-refs, and shape normalizers.
   UMD: Node + browser. */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  else { root.II = root.II || {}; root.II.reflectionCore = api; }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Deterministic index for the current UTC day — same content all day, worldwide.
  function dayIndex(nowMs, len) {
    if (!len || len < 1) return 0;
    var day = Math.floor(nowMs / 86400000);
    return ((day % len) + len) % len;
  }

  // Curated set of well-known reflection verses (surah:ayah). Text is fetched live
  // from alquran.cloud so nothing scripture is hand-transcribed.
  var VERSE_REFS = [
    '2:255', '2:286', '3:8', '3:139', '3:159', '3:173', '6:162', '13:28',
    '14:7', '20:25', '25:74', '39:53', '40:60', '65:2', '65:3', '93:5',
    '94:5', '94:6', '2:152', '2:186', '2:201', '17:80', '18:10', '21:87',
    '23:118', '28:24', '3:26', '7:23', '10:57', '16:97', '29:69', '42:19',
    '55:13', '67:2', '2:45', '13:11', '49:13', '64:11', '103:1', '112:1'
  ];
  function verseRefs() { return VERSE_REFS.slice(); }
  function verseRefForDay(nowMs) { return VERSE_REFS[dayIndex(nowMs, VERSE_REFS.length)]; }

  function slugifySurah(name) {
    return String(name || '').toLowerCase()
      .replace(/['’`]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  // Normalize an alquran.cloud /ayah multi-edition response → flat verse object.
  function normalizeVerse(apiJson) {
    var data = apiJson && apiJson.data;
    if (!Array.isArray(data) || !data.length) return null;
    var ar = null, en = null;
    data.forEach(function (d) {
      var t = d.edition && d.edition.type;
      if (t === 'quran' || (d.edition && d.edition.language === 'ar')) ar = d;
      else en = d;
    });
    ar = ar || data[0]; en = en || data[data.length - 1];
    var surah = ar.surah || en.surah || {};
    var name = surah.englishName || ('Surah ' + (surah.number || ''));
    return {
      arabic: ar.text || '',
      english: en.text || '',
      surahName: name,
      surahNumber: surah.number || null,
      ayah: ar.numberInSurah || en.numberInSurah || null,
      ref: name + ' ' + (surah.number || '') + ':' + (ar.numberInSurah || en.numberInSurah || ''),
      slug: slugifySurah(name)
    };
  }

  function pickForDay(list, nowMs) {
    if (!Array.isArray(list) || !list.length) return null;
    return list[dayIndex(nowMs, list.length)];
  }

  return {
    dayIndex: dayIndex, verseRefs: verseRefs, verseRefForDay: verseRefForDay,
    slugifySurah: slugifySurah, normalizeVerse: normalizeVerse, pickForDay: pickForDay
  };
});
