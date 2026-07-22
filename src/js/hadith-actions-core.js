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

  function customCategoriesOf(list) {
    var seen = {}, out = [];
    (Array.isArray(list) ? list : []).forEach(function (b) {
      if (!b || !b.category || isBuiltin(b.category)) return;
      if (!seen[b.category]) { seen[b.category] = 1; out.push(b.category); }
    });
    return out;
  }

  // Returns { ok, customs }. ok:false when name blank/builtin, or 5 distinct customs already in use.
  function addCustomCategory(list, name) {
    var customs = customCategoriesOf(list);
    name = (name == null ? '' : String(name)).trim();
    if (!name || isBuiltin(name)) return { ok: false, customs: customs };
    if (customs.indexOf(name) !== -1) return { ok: true, customs: customs };
    if (customs.length >= MAX_CUSTOM) return { ok: false, customs: customs };
    return { ok: true, customs: customs.concat([name]) };
  }

  function panelFilter(list, category) {
    var arr = dedupeByRef(list);
    if (!category || category === 'all') return arr;
    return arr.filter(function (b) { return b.category === category; });
  }

  function clampNoteText(s) { return String(s == null ? '' : s).slice(0, MAX_NOTE); }

  function buildNote(ref, text, now) {
    return { hadithRef: ref, text: clampNoteText(text), updatedAt: (typeof now === 'number' ? now : 0) };
  }

  function getNote(list, ref) {
    var arr = Array.isArray(list) ? list : [];
    for (var i = 0; i < arr.length; i++) { if (arr[i] && arr[i].hadithRef === ref) return arr[i]; }
    return null;
  }

  // Upsert by hadithRef; a note whose text is empty is removed (a cleared note is not stored).
  function upsertNote(list, note) {
    var arr = (Array.isArray(list) ? list : []).filter(function (n) { return n && n.hadithRef !== note.hadithRef; });
    if (note.text && note.text.length) arr.push(note);
    return arr;
  }

  // Tier-aware "Ask a Question" target. Tier 3 (route.hadith present) with a resolvable
  // matn → verify.html prefill (?q=&ref=&mode=claim, matching verify.html's real handoff
  // contract at verify.html:1036). Otherwise → empty verify.html (Tier 1 focus behavior).
  function buildAskUrl(route, hadith) {
    var onTier3 = !!(route && route.hadith);
    var matn = hadith && ((hadith.translation && hadith.translation.text) || hadith.arabicMatn);
    if (!onTier3 || !matn) return 'verify.html';
    var ref = (hadith && hadith.reference) || '';
    var qs = 'q=' + encodeURIComponent(matn) + (ref ? '&ref=' + encodeURIComponent(ref) : '') + '&mode=claim';
    return 'verify.html?' + qs;
  }

  // Format a hadith for clipboard copy WITH attribution. Invariant: never emit an
  // unattributed hadith — returns '' when there is no reference/source.
  function buildCopyText(content) {
    content = content || {};
    var ref = (content.reference || '').trim();
    if (!ref) return '';
    var lines = [];
    if (content.arabic) lines.push(String(content.arabic).trim());
    var tr = (content.translation || '').trim();
    if (tr) { lines.push(''); lines.push('"' + tr + '"'); }
    if (content.narrator) lines.push('— ' + String(content.narrator).trim());
    lines.push('');
    lines.push(ref + (content.grade ? ' · ' + String(content.grade).trim() : ''));
    lines.push('via IslamicInfo.org');
    return lines.join('\n');
  }

  var core = {
    BUILTIN_CATEGORIES: BUILTIN_CATEGORIES, MAX_CUSTOM: MAX_CUSTOM, MAX_NOTE: MAX_NOTE,
    isBuiltin: isBuiltin, buildBookmark: buildBookmark, dedupeByRef: dedupeByRef,
    toggleBookmark: toggleBookmark, setCategory: setCategory, getBookmarkCategory: getBookmarkCategory,
    customCategoriesOf: customCategoriesOf, addCustomCategory: addCustomCategory, panelFilter: panelFilter,
    clampNoteText: clampNoteText, buildNote: buildNote, getNote: getNote, upsertNote: upsertNote,
    buildAskUrl: buildAskUrl, buildCopyText: buildCopyText,
  };

  if (typeof module !== 'undefined' && module.exports) { module.exports = core; }
  else { root.II = root.II || {}; root.II.hadithActions = core; }

}(typeof globalThis !== 'undefined' ? globalThis : window));
