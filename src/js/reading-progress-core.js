/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — reading-progress-core.js  (Module 9)
   Pure read-detection rules for the Continue-Reading tracker. NO DOM, NO
   IntersectionObserver, NO timers, NO Date.now() — the caller injects the
   current time so this core is fully deterministic and unit-testable.
   UMD: window.II.readingProgress in the browser, module.exports in tests.
   Mirrors the hadith-feed-core / tier3-deep-view-core dual-export shape.
   ═══════════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  var THRESHOLD_MS = 3000;   // continuous-visibility dwell before a hadith counts as read (§3.4)
  var MIN_RATIO = 0.5;       // IntersectionObserver threshold a card must meet to be "visible"

  // Given records [{ref, ratio, top}], return the ref of the topmost card
  // (smallest boundingClientRect.top) whose ratio >= MIN_RATIO, else null.
  function topmost(records) {
    var best = null;
    (records || []).forEach(function (r) {
      if (!r || r.ratio < MIN_RATIO) return;
      if (best === null || r.top < best.top) best = r;
    });
    return best ? best.ref : null;
  }

  // Parse a feed data-ref ("slug:book:hadith") into the last-read payload,
  // stamping the caller-supplied timestamp. Malformed refs → null.
  function payloadFromRef(ref, timestamp) {
    if (!ref || typeof ref !== 'string') return null;
    var parts = ref.split(':');
    if (parts.length < 3 || !parts[0] || !parts[2]) return null;
    return {
      collectionSlug: parts[0],
      bookNum: parts[1],
      hadithNum: parts[2],
      timestamp: timestamp,
    };
  }

  // Time-injected dwell state machine. Call update(topRef, now) on every
  // observer/timer tick; it returns the ref that has just crossed the 3s
  // threshold exactly once, else null. Changing/losing the top ref re-arms.
  function createTracker() {
    var armedRef = null, armedSince = 0, firedRef = null;
    return {
      update: function (topRef, now) {
        if (topRef !== armedRef) {           // changed (incl. → null): re-arm
          armedRef = topRef;
          armedSince = topRef ? now : 0;
          firedRef = null;
          return null;
        }
        if (!armedRef || firedRef === armedRef) return null;   // nothing armed / already fired
        if (now - armedSince >= THRESHOLD_MS) { firedRef = armedRef; return armedRef; }
        return null;
      },
      reset: function () { armedRef = null; armedSince = 0; firedRef = null; },
    };
  }

  var api = {
    THRESHOLD_MS: THRESHOLD_MS,
    MIN_RATIO: MIN_RATIO,
    topmost: topmost,
    payloadFromRef: payloadFromRef,
    createTracker: createTracker,
  };

  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  else { root.II = root.II || {}; root.II.readingProgress = api; }

}(typeof globalThis !== 'undefined' ? globalThis : window));
