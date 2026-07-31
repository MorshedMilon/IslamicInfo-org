/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — hadith-display-mode-core.js  (Module 16)
   Pure, framework-free logic for the two deep-view display modes:
   Study Mode (US-H20, 4-quadrant focus) and Reading Mode (US-H21,
   single-column distraction-free). NO DOM, NO network — the DOM layer
   (tier3-deep-view.js) reads/writes location + storage + classList and
   delegates every decision here. UMD: window.II.hadithDisplayMode in
   the browser, module.exports in tests. Mirrors hadith-feed-core.js.

   Design decisions (see doc/DECISIONS.md ADR-040 + Module 16 memory):
   - Modes are mutually exclusive; there is never more than one root
     class. Toggling the active mode's own button clears to 'none';
     toggling the other mode switches straight to it.
   - Only Reading Mode is URL/storage-persisted (?mode=reading +
     islamicinfo-hadith-reading-mode='1'). Study Mode is session-only —
     it is a focus toggle, not a saved preference (PRD US-H20 has no
     restore clause; US-H21 does).
   - Reading Mode's gold surface reuses the existing --gold-50 token
     (#FDF8EC); the PRD's #FAF6EC is treated as a near-duplicate, not a
     new color (design-system "no new colors" invariant).
   ═══════════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  var NONE = 'none';
  var STUDY = 'study';
  var READING = 'reading';
  var MODES = { NONE: NONE, STUDY: STUDY, READING: READING };

  // Root <html> classes the DOM layer toggles. Names follow TechSpec v1.2
  // (reading-mode.css → html.reading-mode-hadith); study mirrors it.
  var STUDY_CLASS = 'study-mode-hadith';
  var READING_CLASS = 'reading-mode-hadith';

  // Persistence (Reading Mode only). Key is registered in DATA.md /
  // TechSpec §data registry.
  var STORAGE_KEY = 'islamicinfo-hadith-reading-mode';
  var URL_PARAM = 'mode';
  var URL_VALUE = 'reading';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // ── normalize ─────────────────────────────────────────────────────
  // Any unrecognized value collapses to 'none' (defensive against a
  // stale/garbage ?mode= or corrupted state var).
  function normalize(mode) {
    return (mode === STUDY || mode === READING) ? mode : NONE;
  }

  // ── toggle ────────────────────────────────────────────────────────
  // Click semantics for the two header buttons. Because modes are
  // mutually exclusive, switching to the other mode implicitly turns the
  // first off — a single root class is ever set. (This is also where the
  // "Reading Mode wins" precedent lives: requesting reading from study
  // yields reading, never both.)
  function toggle(current, target) {
    current = normalize(current);
    target = normalize(target);
    if (target === NONE) return NONE;
    return current === target ? NONE : target;
  }

  // ── rootClass ─────────────────────────────────────────────────────
  function rootClass(mode) {
    mode = normalize(mode);
    if (mode === STUDY) return STUDY_CLASS;
    if (mode === READING) return READING_CLASS;
    return '';
  }

  // ── URL helpers ───────────────────────────────────────────────────
  // hasReadingParam: does a raw location.search contain mode=reading?
  function hasReadingParam(search) {
    var qs = String(search == null ? '' : search).replace(/^\?/, '');
    if (!qs) return false;
    var params = new URLSearchParams(qs);
    return params.get(URL_PARAM) === URL_VALUE;
  }

  // setReadingParam: return a new search string (leading '?' when
  // non-empty) with mode=reading added or removed, preserving every
  // other param and their order — mirrors syncGradeUrl's contract.
  function setReadingParam(search, active) {
    var qs = String(search == null ? '' : search).replace(/^\?/, '');
    var params = new URLSearchParams(qs);
    if (active) params.set(URL_PARAM, URL_VALUE);
    else params.delete(URL_PARAM);
    var out = params.toString();
    return out ? '?' + out : '';
  }

  // ── storage helpers ───────────────────────────────────────────────
  function storageActive(rawValue) {
    return rawValue === '1';
  }
  // Value to persist, or null to signal "remove the key".
  function storageValue(active) {
    return active ? '1' : null;
  }

  // ── initialMode ───────────────────────────────────────────────────
  // Restore-on-load resolution. Reading is active when EITHER the URL
  // carries ?mode=reading (primary, shareable, matches DoD) OR the
  // storage key is '1' (preserves the preference across in-app
  // navigation that dropped the param). Study never restores.
  function initialMode(opts) {
    opts = opts || {};
    if (hasReadingParam(opts.search) || storageActive(opts.storageValue)) {
      return READING;
    }
    return NONE;
  }

  // ── studyBannerHTML ───────────────────────────────────────────────
  // Canonical markup from mockups/hadith.html (.study-mode-banner).
  // Colors/typography live in CSS classes (no raw inline hex, per design
  // system). The exit control is a real <button> with an aria-label.
  function studyBannerHTML() {
    return '<div class="study-mode-banner" role="status">' +
      '<div class="study-mode-indicator">' +
        '<span class="study-mode-dot" aria-hidden="true"></span>' +
        '<span class="study-mode-title">Study Mode Active</span>' +
      '</div>' +
      '<span class="study-mode-sub">4-quadrant focused layout · Sidebar collapsed · Distractions hidden</span>' +
      '<button class="exit-study" type="button" data-act="exit-study" aria-label="Exit Study Mode">Exit Study Mode ×</button>' +
    '</div>';
  }

  // ── modeButtonsHTML ───────────────────────────────────────────────
  // Two header toggle buttons. aria-pressed reflects the active mode so
  // screen-reader users hear the on/off state. Slots into .dv-header.
  function modeButtonsHTML(mode) {
    mode = normalize(mode);
    return '<div class="dv-modes" role="group" aria-label="Display mode">' +
      '<button class="dv-mode-btn" type="button" data-mode="' + STUDY + '"' +
        ' aria-pressed="' + (mode === STUDY) + '"' +
        ' title="Study Mode" aria-label="Toggle Study Mode">Study Mode</button>' +
      '<button class="dv-mode-btn" type="button" data-mode="' + READING + '"' +
        ' aria-pressed="' + (mode === READING) + '"' +
        ' title="Reading Mode" aria-label="Toggle Reading Mode">Reading Mode</button>' +
    '</div>';
  }

  var core = {
    MODES: MODES,
    NONE: NONE, STUDY: STUDY, READING: READING,
    STUDY_CLASS: STUDY_CLASS, READING_CLASS: READING_CLASS,
    STORAGE_KEY: STORAGE_KEY, URL_PARAM: URL_PARAM, URL_VALUE: URL_VALUE,
    _esc: esc,
    normalize: normalize,
    toggle: toggle,
    rootClass: rootClass,
    hasReadingParam: hasReadingParam,
    setReadingParam: setReadingParam,
    storageActive: storageActive,
    storageValue: storageValue,
    initialMode: initialMode,
    studyBannerHTML: studyBannerHTML,
    modeButtonsHTML: modeButtonsHTML,
  };

  if (typeof module !== 'undefined' && module.exports) { module.exports = core; }
  else { root.II = root.II || {}; root.II.hadithDisplayMode = core; }

}(typeof globalThis !== 'undefined' ? globalThis : window));
