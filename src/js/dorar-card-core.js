/* Pure renderer for a Dorar-sourced Silsila as-Sahiha result card. UMD:
   window.II.dorarCard in the browser, module.exports in tests. NO DOM, NO network.
   Arabic-only (translation is the "Ask QuranlyAI" button's job). al-Albani's ruling
   (خلاصة حكم المحدث) is shown VERBATIM, sourced to the grader + Dorar.net — never
   reduced to a one-word grade badge, never fabricated. Citation is the page-style
   reference the item already carries (built by dorar-parse's buildSilsilaReference). */
(function (root) {
  'use strict';
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  var SVG_QAI = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3l1.9 4.6L18.5 9l-4.6 1.9L12 15l-1.9-4.1L5.5 9l4.6-1.4z"/></svg>';

  // al-Albani's ruling, verbatim, labelled to the grader + Dorar.net. NEVER a badge.
  function rulingBlock(item) {
    if (!item.ruling) return '';
    var who = item.grader ? esc(item.grader) : "Grader's ruling";
    return '<div class="dorar-ruling">' +
      '<div class="dorar-ruling-label">' + who + ' · via Dorar.net</div>' +
      '<div class="dorar-ruling-text" dir="rtl" lang="ar">' + esc(item.ruling) + '</div>' +
    '</div>';
  }

  function buildDorarCardHTML(item) {
    item = item || {};
    var ref = item.reference || item.collectionName || 'Al-Silsilah al-Sahihah'; // raw; escaped at use
    // Clickable attribution back to the source (citation-transparency standard). Prefer the
    // query-specific Dorar search the item carries; fall back to Dorar's site if absent.
    var dorarUrl = item.dorarUrl || 'https://www.dorar.net';
    var srcLink = '<a href="' + esc(dorarUrl) + '" target="_blank" rel="noopener noreferrer">Dorar.net</a>';
    var matn = item.arabicMatn ? '<div class="hadith-arabic dorar-matn" dir="rtl" lang="ar">' + esc(item.arabicMatn) + '</div>' : '';
    var narr = item.narrator ? '<div class="hadith-narrator" dir="rtl" lang="ar">' + esc(item.narrator) + '</div>' : '';
    return '' +
      '<div class="hadith-card dorar-card" data-ai-selectable="hadith" data-ref="' + esc(ref) + '">' +
        '<div class="hadith-teal-bar"></div>' +
        '<div class="hadith-inner">' +
          matn + narr +
          rulingBlock(item) +
          '<div class="hadith-footer">' +
            '<div class="hadith-ref"><span class="hadith-ref-icon">📖</span>' + esc(ref) + '<span class="dorar-src"> · Source · ' + srcLink + '</span></div>' +
            '<div class="hadith-footer-actions">' +
              '<button class="footer-action-btn primary" type="button" data-act="ask-qai">' + SVG_QAI + ' <span>Ask QuranlyAI</span></button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  var api = { buildDorarCardHTML: buildDorarCardHTML, _esc: esc };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  else { root.II = root.II || {}; root.II.dorarCard = api; }
}(typeof globalThis !== 'undefined' ? globalThis : window));
