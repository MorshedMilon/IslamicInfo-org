/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — hadith-actions-core.js  (Module 10)
   Pure, framework-free bookmark + note + category + CTA-URL logic for the
   per-hadith action suite. UMD (window.II.hadithActions in the browser;
   module.exports in tests). NO DOM, NO network, NO localStorage — all I/O
   is done by hadith.js. Keys (registered in doc/DATA.md §2):
   islamicinfo-hadith-bookmarks (HadithBookmark[]), islamicinfo-hadith-notes.
   Custom categories are DERIVED from bookmarks in use (no separate key).
   ═══════════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  var BUILTIN_CATEGORIES = ['General', 'For Memorisation', 'Reflection', 'To Verify'];
  var MAX_CUSTOM = 5;
  var MAX_NOTE = 2000;

  function isBuiltin(cat) { return BUILTIN_CATEGORIES.indexOf(cat) !== -1; }

  function buildBookmark(entry, now) {
    entry = entry || {};
    return {
      ref: entry.ref,
      collectionSlug: entry.collectionSlug || null,
      bookNum: (entry.bookNum == null ? null : entry.bookNum),
      hadithNum: (entry.hadithNum == null ? null : entry.hadithNum),
      category: entry.category || 'General',
      createdAt: (typeof now === 'number' ? now : 0),
    };
  }

  function indexOfRef(list, ref) {
    for (var i = 0; i < list.length; i++) { if (list[i] && list[i].ref === ref) return i; }
    return -1;
  }

  function dedupeByRef(list) {
    var seen = {}, out = [];
    (Array.isArray(list) ? list : []).forEach(function (b) {
      if (!b || !b.ref || seen[b.ref]) return;
      seen[b.ref] = 1; out.push(b);
    });
    return out;
  }

  // Idempotent: present → remove; absent → add. Returns { list, added }.
  function toggleBookmark(list, entry, now) {
    var arr = dedupeByRef(list);
    var i = indexOfRef(arr, entry.ref);
    if (i !== -1) { arr.splice(i, 1); return { list: arr, added: false }; }
    arr.push(buildBookmark(entry, now));
    return { list: arr, added: true };
  }

  function setCategory(list, ref, category) {
    var arr = dedupeByRef(list);
    var i = indexOfRef(arr, ref);
    if (i !== -1) arr[i] = Object.assign({}, arr[i], { category: category });
    return arr;
  }

  function getBookmarkCategory(list, ref) {
    var i = indexOfRef(Array.isArray(list) ? list : [], ref);
    return i !== -1 ? list[i].category : null;
  }

  var core = {
    BUILTIN_CATEGORIES: BUILTIN_CATEGORIES, MAX_CUSTOM: MAX_CUSTOM, MAX_NOTE: MAX_NOTE,
    isBuiltin: isBuiltin, buildBookmark: buildBookmark, dedupeByRef: dedupeByRef,
    toggleBookmark: toggleBookmark, setCategory: setCategory, getBookmarkCategory: getBookmarkCategory,
  };

  if (typeof module !== 'undefined' && module.exports) { module.exports = core; }
  else { root.II = root.II || {}; root.II.hadithActions = core; }

}(typeof globalThis !== 'undefined' ? globalThis : window));
