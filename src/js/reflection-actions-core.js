/* IslamicInfo.org — reflection-actions-core.js
   Pure, DOM-free logic for the Daily Reflection card actions (bookmark / note /
   share). UMD: Node + browser. Shared by the home page and the Quran page. */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  else { root.II = root.II || {}; root.II.reflActionsCore = api; }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var TYPE_META = {
    verse:  { label: 'Verse of the Day',  emoji: '📖' },
    hadith: { label: 'Hadith of the Day', emoji: '📜' },
    dua:    { label: 'Dua of the Day',    emoji: '🤲' }
  };
  function typeMeta(type) { return TYPE_META[type] || { label: 'Reflection', emoji: '✦' }; }

  function normRef(ref) { return String(ref == null ? '' : ref).replace(/\s+/g, ' ').trim(); }
  // Stable id for one reflection's content (ref differs each day → unique per day).
  function reflId(type, ref) { return String(type || '') + '|' + normRef(ref); }

  function isSaved(list, id) {
    return (list || []).some(function (x) { return x && x.id === id; });
  }
  // Immutable toggle: remove if present, else prepend the item. Returns a new array.
  function toggleSaved(list, item) {
    list = Array.isArray(list) ? list : [];
    if (isSaved(list, item.id)) return list.filter(function (x) { return x.id !== item.id; });
    return [item].concat(list);
  }

  function findNote(notes, id) {
    var hit = (notes || []).filter(function (n) { return n && n.id === id; });
    return hit.length ? hit[0] : null;
  }
  // Immutable upsert: empty text removes the note; otherwise replaces/prepends. New array.
  function upsertNote(notes, id, text, ts) {
    notes = Array.isArray(notes) ? notes : [];
    var rest = notes.filter(function (n) { return n.id !== id; });
    var t = String(text == null ? '' : text).trim();
    if (!t) return rest;
    return [{ id: id, text: t, updatedAt: ts || 0 }].concat(rest);
  }

  function slug(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }
  function shareFilename(type, ref) {
    return 'islamicinfo-reflection-' + slug(type) + '-' + slug(ref) + '.png';
  }

  // Plain-text share payload (WhatsApp / SMS / copy), attribution preserved.
  function buildShareText(m, url) {
    m = m || {};
    var lines = [];
    var head = typeMeta(m.type).label;
    if (head) lines.push('📿 ' + head);
    if (m.arabic) lines.push(String(m.arabic));
    if (m.text) lines.push('"' + String(m.text).replace(/^["“”\s]+|["“”\s]+$/g, '') + '"');
    var attr = String(m.ref || '') + (m.grade ? ' · ' + String(m.grade).replace(/^✓\s*/, '') : '');
    if (attr.trim()) lines.push('— ' + attr.trim());
    if (url) lines.push(url);
    return lines.join('\n');
  }

  return {
    TYPE_META: TYPE_META, typeMeta: typeMeta, normRef: normRef, reflId: reflId,
    isSaved: isSaved, toggleSaved: toggleSaved, findNote: findNote, upsertNote: upsertNote,
    slug: slug, shareFilename: shareFilename, buildShareText: buildShareText
  };
});
