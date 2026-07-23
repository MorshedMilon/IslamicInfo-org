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

  var core = {
    ringGeometry: ringGeometry,
    _clampPercent: clampPercent,
  };

  if (typeof module !== 'undefined' && module.exports) { module.exports = core; }
  else { root.II = root.II || {}; root.II.readingPaths = core; }

}(typeof globalThis !== 'undefined' ? globalThis : window));
