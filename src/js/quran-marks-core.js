/* IslamicInfo.org — quran-marks-core.js
   Pure, DOM-free bookmark/note array logic. UMD: Node + browser. */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  else { root.II = root.II || {}; root.II.marksCore = api; }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function isBookmarked(bookmarks, verseKey) {
    return (bookmarks || []).some(function (b) { return b.verseKey === verseKey; });
  }
  function toggleBookmark(bookmarks, bm) {
    var arr = bookmarks || [];
    if (arr.some(function (b) { return b.verseKey === bm.verseKey; })) {
      return arr.filter(function (b) { return b.verseKey !== bm.verseKey; });
    }
    return arr.concat([bm]);
  }
  function filterByCategory(bookmarks, category) {
    if (!category || category === 'All') return (bookmarks || []).slice();
    return (bookmarks || []).filter(function (b) { return b.category === category; });
  }
  function findNote(notes, verseKey) {
    var m = (notes || []).filter(function (n) { return n.verseKey === verseKey; });
    return m.length ? m[0] : null;
  }
  function upsertNote(notes, note) {
    var arr = notes || [], found = false;
    var out = arr.map(function (n) { if (n.verseKey === note.verseKey) { found = true; return note; } return n; });
    if (!found) out.push(note);
    return out;
  }
  function removeNote(notes, verseKey) {
    return (notes || []).filter(function (n) { return n.verseKey !== verseKey; });
  }
  function capText(s, max) {
    if (typeof max !== 'number') max = 2000;
    s = String(s == null ? '' : s).trim();
    return s.length > max ? s.slice(0, max) : s;
  }

  return { isBookmarked, toggleBookmark, filterByCategory, findNote, upsertNote, removeNote, capText };
});
