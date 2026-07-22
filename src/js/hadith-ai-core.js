/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — hadith-ai-core.js  (Module 13)
   Pure, framework-free logic for the hadith AI Explanation button.
   UMD (window.II.hadithAICore in the browser; module.exports in tests).
   NO DOM, NO network — all I/O is done by hadith-ai.js.
   ═══════════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  // FEATURE FLAG — the AI Explanation button is DARK until a human reviewer signs off
  // on the system prompt + safety filter + adversarial-test evidence. Flipping this to
  // true is NOT an automatic build step (see docs/DECISIONS.md Module 13 #4).
  var HADITH_AI_EXPLAIN_ENABLED = false;

  function buildExplainPayload(card) {
    card = card || {};
    return {
      type: 'hadith',
      ref: card.ref || '',
      arabic: card.arabic || '',
      translation: card.translation || '',
      language: card.language || 'en',
    };
  }

  function hasText(card) {
    return !!(card && ((card.arabic && card.arabic.trim()) || (card.translation && card.translation.trim())));
  }

  var api = {
    HADITH_AI_EXPLAIN_ENABLED: HADITH_AI_EXPLAIN_ENABLED,
    buildExplainPayload: buildExplainPayload,
    hasText: hasText,
  };

  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  else { root.II = root.II || {}; root.II.hadithAICore = api; }
}(typeof globalThis !== 'undefined' ? globalThis : window));
