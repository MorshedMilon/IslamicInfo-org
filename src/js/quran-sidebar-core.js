/* IslamicInfo.org — quran-sidebar-core.js
   Pure, DOM-free logic for the Quran sidebar. UMD: Node + browser. */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  else { root.II = root.II || {}; root.II.sidebarCore = api; }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function slugify(name) {
    return String(name == null ? '' : name)
      .toLowerCase()
      .replace(/['’]/g, '')
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function revelationToType(place) {
    return place === 'makkah' ? 'makki' : 'madinah';
  }
  function typeToChipClass(type) { return type === 'makki' ? 'chip-makki' : 'chip-madani'; }
  function typeToLabel(type)     { return type === 'makki' ? 'Makki' : 'Madani'; }

  function normalizeChapter(raw) {
    if (!raw || typeof raw.id !== 'number' || !raw.name_simple) return null;
    return {
      id: raw.id,
      name_simple: raw.name_simple,
      name_arabic: raw.name_arabic || '',
      revelation_place: raw.revelation_place,
      verses_count: typeof raw.verses_count === 'number' ? raw.verses_count : 0,
      slug: slugify(raw.name_simple),
      pages: Array.isArray(raw.pages) ? raw.pages : undefined,          // Mushaf Mode start page
      bismillah_pre: typeof raw.bismillah_pre === 'boolean' ? raw.bismillah_pre : undefined
    };
  }

  function matchesSearch(chapter, q) {
    q = String(q == null ? '' : q).trim().toLowerCase();
    if (!q) return true;
    if (/^\d+$/.test(q)) return String(chapter.id).indexOf(q) === 0;
    return chapter.name_simple.toLowerCase().indexOf(q) !== -1
        || (chapter.name_arabic || '').toLowerCase().indexOf(q) !== -1;
  }

  function matchesFilter(chapter, type) {
    if (!type || type === 'all') return true;
    return revelationToType(chapter.revelation_place) === type;
  }

  function isFresh(fetchedAt, now, maxAgeMs) {
    if (typeof maxAgeMs !== 'number') maxAgeMs = 24 * 60 * 60 * 1000;
    return typeof fetchedAt === 'number' && (now - fetchedAt) < maxAgeMs;
  }

  return { slugify, revelationToType, typeToChipClass, typeToLabel,
           normalizeChapter, matchesSearch, matchesFilter, isFresh };
});
