/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — reading-paths-core.js  (Module 17, US-H22)
   Pure, framework-free logic for built-in Reading Paths. NO DOM, NO
   network, NO localStorage — the DOM layer (reading-paths.js) does all
   I/O and delegates every decision here. UMD: window.II.readingPaths in
   the browser, module.exports in tests. Mirrors hadith-display-mode-core.js.

   Posture (see design spec 2026-07-22 + ADR): paths ship with EMPTY
   hadithRefs (curation-pending). Navigation/completion logic is fully
   implemented and unit-tested against mocked populated paths, but stays
   dormant against the live seed, which renders the honest "Coming soon"
   empty state. No hadith reference is authored here.
   ═══════════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  function clampPercent(p) {
    p = Number(p);
    if (!isFinite(p)) return 0;
    if (p < 0) return 0;
    if (p > 100) return 100;
    return p;
  }

  // ── ringGeometry ──────────────────────────────────────────────────
  // SVG progress ring. dashArray = full circumference; dashOffset shrinks
  // from full (0%) to 0 (100%). r defaults to 12 (matches hadith.html
  // viewBox 0 0 28 28, r=12, stroke-width 2.5).
  function ringGeometry(percent, r) {
    r = r == null ? 12 : Number(r);
    var circ = 2 * Math.PI * r;
    var pct = clampPercent(percent);
    return { dashArray: circ, dashOffset: circ * (1 - pct / 100) };
  }

  // ── refId ─────────────────────────────────────────────────────────
  // Stable string id for a hadith reference (the value stored in the
  // per-path read array). Order: collection:book:hadith.
  function refId(ref) {
    if (!ref) return '';
    return [ref.collection, ref.book, ref.hadith].join(':');
  }

  // ── pathProgress ──────────────────────────────────────────────────
  // readSet is a Set of refId strings. Only refs that belong to THIS
  // path's hadithRefs count. percent is against targetCount (so a
  // deferred/empty path honestly reports 0%). complete requires a
  // non-empty target fully read.
  function pathProgress(path, readSet) {
    var refs = (path && path.hadithRefs) || [];
    var target = (path && path.targetCount) || 0;
    var read = 0;
    for (var i = 0; i < refs.length; i++) {
      if (readSet && readSet.has(refId(refs[i]))) read++;
    }
    var percent = target > 0 ? Math.round((read / target) * 100) : 0;
    return {
      readCount: read,
      targetCount: target,
      percent: percent,
      complete: target > 0 && read >= target,
    };
  }

  // ── nextUnread ────────────────────────────────────────────────────
  // First hadithRef (in path order) whose id is not in readSet, else
  // null (path complete OR empty/deferred).
  function nextUnread(path, readSet) {
    var refs = (path && path.hadithRefs) || [];
    for (var i = 0; i < refs.length; i++) {
      if (!readSet || !readSet.has(refId(refs[i]))) return refs[i];
    }
    return null;
  }

  // ── pathIndexOf ───────────────────────────────────────────────────
  // 1-based position of a refId string within the path (for the strip's
  // "Hadith N of M"); null if not a member.
  function pathIndexOf(path, id) {
    var refs = (path && path.hadithRefs) || [];
    for (var i = 0; i < refs.length; i++) {
      if (refId(refs[i]) === id) return i + 1;
    }
    return null;
  }

  // ── isEmptyPath ───────────────────────────────────────────────────
  // True when the path has no curated refs yet (deferred). Drives the
  // "Coming soon" muted control instead of Continue.
  function isEmptyPath(path) {
    if (!path) return true;
    if (path.status === 'curation-pending') return true;
    return !(path.hadithRefs && path.hadithRefs.length > 0);
  }

  // ── storage pure helpers ──────────────────────────────────────────
  // The DOM layer reads/writes localStorage['islamicinfo-hadith-paths'];
  // these pure helpers do the parse/merge/serialize so all logic is
  // testable. Shape: { [slug]: string[] } (arrays of refId strings).
  function parseStoredPaths(raw) {
    if (raw == null) return {};
    try {
      var obj = JSON.parse(raw);
      if (obj && typeof obj === 'object' && !Array.isArray(obj)) return obj;
      return {};
    } catch (e) {
      return {};
    }
  }

  function serializeStoredPaths(obj) {
    return JSON.stringify(obj || {});
  }

  // Union two id arrays, dedupe, keep first-seen order (existing first).
  function mergeReadRefs(existing, add) {
    var seen = Object.create(null);
    var out = [];
    var lists = [existing || [], add || []];
    for (var l = 0; l < lists.length; l++) {
      for (var i = 0; i < lists[l].length; i++) {
        var id = lists[l][i];
        if (!seen[id]) { seen[id] = 1; out.push(id); }
      }
    }
    return out;
  }

  function readSetFor(store, slug) {
    return new Set((store && store[slug]) || []);
  }

  var core = {
    ringGeometry: ringGeometry,
    _clampPercent: clampPercent,
    refId: refId,
    pathProgress: pathProgress,
    nextUnread: nextUnread,
    pathIndexOf: pathIndexOf,
    isEmptyPath: isEmptyPath,
    parseStoredPaths: parseStoredPaths,
    serializeStoredPaths: serializeStoredPaths,
    mergeReadRefs: mergeReadRefs,
    readSetFor: readSetFor,
  };

  if (typeof module !== 'undefined' && module.exports) { module.exports = core; }
  else { root.II = root.II || {}; root.II.readingPaths = core; }

}(typeof globalThis !== 'undefined' ? globalThis : window));
