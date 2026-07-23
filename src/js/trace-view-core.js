/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — trace-view-core.js  (Module 14)
   Pure builders for the 3-column Hadith Trace View. NO DOM, NO network.
   Only matn/translation/grade are real; isnad, scholar commentary,
   related narrations/verses, topics render honest "not yet available"
   states — NEVER a paraphrase attributed to a named scholar.
   UMD (window.II.traceViewCore in browser; module.exports in tests).
   ═══════════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  var UNAVAIL_ISNAD = 'Chain of narration not available for this hadith.';
  var UNAVAIL_COMMENTARY = 'Commentary not yet available.'; // never a paraphrase attributed to a named scholar
  var UNAVAIL_RELATED = 'Related narrations are being compiled and will appear once verified against source chains.';
  var UNAVAIL_TOPICS = 'Topics are being compiled for this hadith.';
  var UNAVAIL_QVERSES = 'No linked Qur’anic verses yet.';

  function collectionTitle(h) { return (h && (h.collectionName || h.collectionSlug)) || 'Hadith'; }
  function bookTitle(h) { if (!h) return ''; if (h.bookName) return h.bookName; if (h.bookNumber != null) return 'Book ' + h.bookNumber; return ''; }

  function buildBreadcrumb(h) {
    var parts = [collectionTitle(h)];
    var b = bookTitle(h); if (b) parts.push(b);
    var num = (h && h.hadithNumber != null) ? ('#' + h.hadithNumber) : '';
    return parts.map(esc).join(' › ') + (num ? ' › <strong>' + esc(num) + '</strong>' : '');
  }

  function buildMatnColHTML(h) {
    h = h || {};
    var ar = h.arabicMatn || '';
    var tr = (h.translation && h.translation.text) || '';
    var narr = (h.narrator && h.narrator.name) || '';
    var topics = Array.isArray(h.topics) ? h.topics : [];
    var out = '<div class="trace-col trace-col-1"><div class="trace-col-label">Matn</div>';
    out += ar ? '<div class="trace-matn font-arabic" dir="rtl" lang="ar">' + esc(ar) + '</div>' : '<div class="dv-empty" role="note">Arabic text not available.</div>';
    if (tr) out += '<div class="trace-trans">' + esc(tr) + '</div>';
    if (narr) out += '<div class="trace-narrator">Narrated by ' + esc(narr) + '</div>';
    out += '<div class="trace-topics">' + (topics.length
      ? topics.map(function (t) { return '<span class="topic-chip">' + esc(t) + '</span>'; }).join('')
      : '<div class="dv-empty" role="note">' + UNAVAIL_TOPICS + '</div>') + '</div>';
    out += '<div class="trace-qverses"><div class="trace-sub-label">Related Qur’anic Verses</div><div class="dv-empty" role="note">' + UNAVAIL_QVERSES + '</div></div>';
    return out + '</div>';
  }

  function buildIsnadColHTML(h) {
    h = h || {};
    var nodes = (h.isnad && Array.isArray(h.isnad.narrators)) ? h.isnad.narrators : [];
    var head = '<div class="trace-col trace-col-2"><div class="trace-col-label">Isnad Chain (Click narrators for reliability)</div>';
    if (!nodes.length) return head + '<div class="dv-empty" role="note">' + UNAVAIL_ISNAD + '</div></div>';
    var chain = nodes.map(function (n, i) {
      n = n || {};
      var nm = n.fullName || n.arabicName || ('Narrator ' + (i + 1));
      var meta = [n.role, n.lifespan || n.era].filter(Boolean).map(esc).join(' · ');
      var idAttr = n.id ? ' data-narrator-id="' + esc(n.id) + '" tabindex="0" role="button" aria-expanded="false"' : '';
      var diverge = n.divergence ? '<span class="chain-diverge" title="Chain divergence">◆</span>' : '';
      return '<li class="trace-isnad-node"' + idAttr + '><span class="trace-isnad-name">' + esc(nm) + '</span>' +
        (meta ? '<span class="trace-isnad-meta">' + meta + '</span>' : '') + diverge + '</li>';
    }).join('');
    return head + '<ol class="trace-isnad-chain">' + chain + '</ol></div>';
  }

  function gradeBlockHTML(h) {
    var g = h && h.grade;
    if (g && g.value && g.value !== 'unknown') {
      var grader = g.grader ? esc(g.grader) : 'grader not individually cited';
      return '<div class="trace-grade grade-' + esc(g.value) + '"><span class="trace-grade-label">' + esc(g.label || g.value) + '</span>' +
        '<span class="trace-grade-grader">' + grader + '</span></div>';
    }
    if (h && h.gradeCharacterization) {
      return '<div class="trace-grade grade-unknown"><span class="trace-grade-label">' + esc(h.gradeCharacterization) + '</span>' +
        '<span class="trace-grade-grader">collection-level characterization; per-hadith grade not individually recorded.</span></div>';
    }
    return '<div class="dv-empty" role="note">Scholarly grading not individually recorded for this narration.</div>';
  }

  function commentaryBoxHTML(scholar) {
    return '<div class="trace-commentary"><div class="trace-sub-label">' + esc(scholar) + '</div><div class="dv-empty" role="note">' + UNAVAIL_COMMENTARY + '</div></div>';
  }

  function buildGradingColHTML(h) {
    return '<div class="trace-col trace-col-3"><div class="trace-col-label">Scholarly Grading</div>' +
      gradeBlockHTML(h) +
      commentaryBoxHTML('Ibn Hajar al-ʿAsqalani') +
      commentaryBoxHTML('Imam an-Nawawi') +
      '<div class="trace-related"><div class="trace-sub-label">Related Narrations</div><div class="dv-empty" role="note">' + UNAVAIL_RELATED + '</div></div>' +
      '</div>';
  }

  function buildTraceHTML(h) { return buildMatnColHTML(h) + buildIsnadColHTML(h) + buildGradingColHTML(h); }

  function buildCopyContent(h, sourceUrl) {
    h = h || {};
    return {
      arabic: h.arabicMatn || '',
      translation: (h.translation && h.translation.text) || '',
      narrator: (h.narrator && h.narrator.name) || '',
      reference: h.reference || '',
      grade: (h.grade && h.grade.label) || (h.gradeCharacterization || ''),
      sourceUrl: sourceUrl || '',
    };
  }

  function resolveExitTarget(state) {
    state = state || {};
    return (state.viaRoute && state.route) ? { nav: true, route: state.route } : { nav: false, route: null };
  }

  var core = {
    esc: esc, buildBreadcrumb: buildBreadcrumb,
    buildMatnColHTML: buildMatnColHTML, buildIsnadColHTML: buildIsnadColHTML, buildGradingColHTML: buildGradingColHTML,
    buildTraceHTML: buildTraceHTML, buildCopyContent: buildCopyContent, resolveExitTarget: resolveExitTarget,
    UNAVAIL_ISNAD: UNAVAIL_ISNAD, UNAVAIL_COMMENTARY: UNAVAIL_COMMENTARY, UNAVAIL_RELATED: UNAVAIL_RELATED,
    UNAVAIL_TOPICS: UNAVAIL_TOPICS, UNAVAIL_QVERSES: UNAVAIL_QVERSES,
  };

  if (typeof module !== 'undefined' && module.exports) { module.exports = core; }
  else { root.II = root.II || {}; root.II.traceViewCore = core; }

}(typeof globalThis !== 'undefined' ? globalThis : window));
