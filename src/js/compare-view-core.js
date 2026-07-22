/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — compare-view-core.js  (Module 15)
   Pure builders + diff for Hadith Comparison Mode (2–3 items). NO DOM,
   NO network. §0 honesty: word-diff runs ONLY on arabicMatn (the
   narration); translations are shown but NEVER diff-highlighted; the
   chain-diverge (◆) layer is computed by diffChains but DORMANT in prod
   (isnad data is universally absent) — an honest "not yet available"
   note is shown instead. UMD (window.II.compareViewCore | module.exports).
   ═══════════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  var MAX_COMPARE = 3;

  /* ── selection Set logic (ordered, deduped, capped) ── */
  function addRef(list, ref) {
    var arr = Array.isArray(list) ? list.slice() : [];
    if (!ref || arr.indexOf(ref) !== -1) return { list: arr, added: false, full: arr.length >= MAX_COMPARE };
    if (arr.length >= MAX_COMPARE) return { list: arr, added: false, full: true };
    arr.push(ref);
    return { list: arr, added: true, full: arr.length >= MAX_COMPARE };
  }
  function removeRef(list, ref) { return (Array.isArray(list) ? list : []).filter(function (r) { return r !== ref; }); }
  function canCompare(list) { return (Array.isArray(list) ? list : []).length >= 2; }

  /* ── URL ref (de)serialization ── */
  function serializeRefs(refs) { return (Array.isArray(refs) ? refs : []).filter(Boolean).join(','); }
  function parseRefs(param) {
    var out = [], seen = {};
    String(param == null ? '' : param).split(',').forEach(function (r) {
      r = r.trim();
      if (!r || seen[r] || out.length >= MAX_COMPARE) return;
      seen[r] = 1; out.push(r);
    });
    return out;
  }

  var core = {
    esc: esc, MAX_COMPARE: MAX_COMPARE,
    addRef: addRef, removeRef: removeRef, canCompare: canCompare,
    serializeRefs: serializeRefs, parseRefs: parseRefs,
  };

  if (typeof module !== 'undefined' && module.exports) { module.exports = core; }
  else { root.II = root.II || {}; root.II.compareViewCore = core; }

}(typeof globalThis !== 'undefined' ? globalThis : window));
