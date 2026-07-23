/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — analytics-core.js  (Module 18, DoD-17)
   Pure GA4 gating + KPI event-allowlist logic. NO DOM, NO gtag, NO
   network, NO storage — the DOM layer (analytics.js) does all I/O and
   delegates every decision here. UMD: window.II.analyticsCore in the
   browser, module.exports in tests. Mirrors the other -core modules.

   Privacy by default: nothing is enabled — and analytics.js loads NO
   third-party script — unless BOTH a GA4 measurement id is configured
   AND the user has granted consent. The 10 KPI event names (PRD §1) are
   an allowlist: track() drops anything not on it, so a typo or rogue
   call can never emit an unplanned event.
   ═══════════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  // The 10 KPI metrics from PRD §1 (Hadith Library).
  var KPI_EVENTS = [
    'hotd_interacted',
    'isnad_opened',
    'narrator_panel_opened',
    'tier3_pageview',
    'ai_explain_opened',
    'bookmark_saved',
    'note_saved',
    'trace_view_opened',
    'reading_path_progress',
    'copy_with_citation'
  ];

  function isKpiEvent(name) {
    return KPI_EVENTS.indexOf(name) !== -1;
  }

  // Enabled only when a GA4 measurement id is configured AND consent === 'granted'.
  function isEnabled(config) {
    config = config || {};
    return !!config.measurementId && config.consent === 'granted';
  }

  // Returns the sanitized { name, params } to send, or null to DROP (disabled,
  // no consent, unknown event). GA4 params must be string/number/boolean —
  // anything else (objects, null, functions) is stripped, never sent.
  function prepareEvent(name, params, config) {
    if (!isEnabled(config)) return null;
    if (!isKpiEvent(name)) return null;
    var out = {};
    if (params && typeof params === 'object') {
      for (var k in params) {
        if (!Object.prototype.hasOwnProperty.call(params, k)) continue;
        var v = params[k];
        var t = typeof v;
        if (t === 'string' || t === 'number' || t === 'boolean') out[k] = v;
      }
    }
    return { name: name, params: out };
  }

  var core = {
    KPI_EVENTS: KPI_EVENTS,
    isKpiEvent: isKpiEvent,
    isEnabled: isEnabled,
    prepareEvent: prepareEvent
  };

  if (typeof module !== 'undefined' && module.exports) { module.exports = core; }
  else { root.II = root.II || {}; root.II.analyticsCore = core; }

}(typeof globalThis !== 'undefined' ? globalThis : window));
