/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — hadith-feed-core.js
   Pure, framework-free rendering + filtering logic for the Hadith Library
   Stage-1 live feed (Module 2). UMD (window.II.hadithFeed in the browser;
   module.exports in tests), mirroring hadith-collections-core.js.
   NO DOM, NO network — all inputs passed in; buildCardHTML returns a string.

   Binding content-authenticity rules (see hadith-module-decisions memory):
   1. grade.grader null (always, live) → "<Grade> · grader not individually
      cited". Never fabricate a grader name (mockup's "· Darussalam" is placeholder).
   2. grade.disputed → [GRADE DISPUTED] branch is built but unreachable from live
      data (adapter always sets disputed:false); covered by unit test only.
   3. Da'if / Mawdu' render only the grade badge + rule-1 fallback. NO extra
      "weak/fabricated" warning copy — that string is an open doc gap, undrafted.
   ═══════════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  // Self-contained escape (keeps this module dependency-free & unit-testable
  // without ui.js). Matches ui-utils.escapeHTML output exactly.
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // Canonical grade map — the ONLY source of grade class/label. Anything not
  // in this map (including a missing/blank status) collapses to 'unknown'.
  var GRADES = {
    sahih: 'Sahih',
    hasan: 'Hasan',
    daif: "Da'if",
    mawdu: "Mawdu'",
  };

  function gradeParts(h) {
    var g = (h && h.grade) || {};
    var raw = g.value;
    var known = Object.prototype.hasOwnProperty.call(GRADES, raw);
    var value = known ? raw : 'unknown';
    var label = known ? GRADES[value] : 'Grade Unknown';
    var grader = (known && g.grader) ? g.grader : null;
    var badgeGraderText;
    if (value === 'unknown') badgeGraderText = '';               // "Grade Unknown" stands alone
    else if (grader) badgeGraderText = ' · ' + grader;           // named grader (rule 1)
    else badgeGraderText = ' · grader not individually cited';   // honest fallback (rule 1)
    return {
      value: value,
      className: 'grade-' + value,
      label: label,
      grader: grader,
      badgeGraderText: badgeGraderText,
      disputed: g.disputed === true,
      alternates: Array.isArray(g.alternateGradings) ? g.alternateGradings : [],
      characterization: (h && h.gradeCharacterization) ? String(h.gradeCharacterization) : null,
    };
  }

  function refOf(h) {
    if (!h) return null;
    var slug = h.collectionSlug;
    var num = h.hadithNumber;
    if (!slug || num == null) return null;
    // Musnad Ahmad (and similar) have no fixed book structure (TechSpec §10) — bookNumber
    // may be null. Use a 0 book segment so the ref stays stable and dedupe still works;
    // the card renders flat (buildCardHTML omits the "Book N" label when bookNumber is null).
    var book = (h.bookNumber == null) ? 0 : h.bookNumber;
    return slug + ':' + book + ':' + num;
  }

  function matchesGrade(h, filter) {
    if (!filter || filter === 'all') return true;
    return gradeParts(h).value === filter;
  }

  function dedupeByRef(existing, hadiths) {
    var seen = (existing instanceof Set) ? new Set(existing) : new Set(existing || []);
    var out = [];
    (Array.isArray(hadiths) ? hadiths : []).forEach(function (h) {
      var ref = refOf(h);
      if (!ref || seen.has(ref)) return;   // drop null-ref (unrenderable) + already-seen
      seen.add(ref);
      out.push(h);
    });
    return out;
  }

  /* ── card fragments ── */

  function gradeBadgeHTML(p) {
    if (p.disputed) {
      var chips = [{ label: p.label, grader: p.grader }].concat(p.alternates.map(function (a) {
        return { label: a.label || a.value || 'Grade Unknown', grader: a.grader || null };
      })).map(function (c) {
        var by = c.grader ? (' · ' + esc(c.grader)) : ' · grader not individually cited';
        return esc(c.label) + by;
      }).join(' | ');
      return '<div class="grade-badge grade-disputed"><span class="grade-dot"></span>[GRADE DISPUTED]</div>' +
             '<span class="grade-disputed-detail">' + chips + '</span>';
    }
    if (p.value === 'unknown' && p.characterization) {
      // Characterization-only collections (ADR-022/024): show the collection-level
      // characterization, never "Grade Unknown", never a fabricated grade.
      return '<div class="grade-badge grade-unknown"><span class="grade-dot"></span>' + esc(p.characterization) + '</div>';
    }
    var graderSpan = p.badgeGraderText ? ('<span class="grader-label">' + esc(p.badgeGraderText) + '</span>') : '';
    return '<div class="grade-badge ' + p.className + '"><span class="grade-dot"></span>' + esc(p.label) + graderSpan + '</div>';
  }

  function actionBtn(act, title, svg) {
    return '<button class="hadith-action-btn" type="button" data-act="' + act + '" title="' + esc(title) + '">' + svg + '</button>';
  }

  var SVG_BOOKMARK = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>';
  var SVG_NOTE = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
  var SVG_SHARE = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>';
  var SVG_COPY = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
  // Copy-Arabic-only: copy box with right-aligned lines hinting RTL matn (distinct from SVG_COPY).
  var SVG_COPY_AR = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/><line x1="19" y1="13.5" x2="12.5" y2="13.5"/><line x1="19" y1="17.5" x2="14.5" y2="17.5"/></svg>';
  var SVG_ISNAD = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>';
  var SVG_LISTEN = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="5 3 19 12 5 21 5 3"/></svg>';

  // US-H23 translation compare — normalize the editions ACTUALLY present for a hadith.
  // Accepts today's single adapter shape (h.translation) or the future multi-edition shape
  // (h.translations[]). Filters out empty text and OMITS translator when null (same
  // never-fabricate rule as grader). First surviving edition is marked primary. Today this
  // yields length 1 → renderTranslations produces the plain single row (visual unchanged);
  // the compare UI activates automatically once >1 edition exists. Never returns an edition
  // that is not in provider data.
  function buildTranslations(h) {
    h = h || {};
    var list = (h.translations && h.translations.length) ? h.translations
             : (h.translation ? [h.translation] : []);
    var out = [];
    for (var i = 0; i < list.length; i++) {
      var t = list[i] || {};
      var text = (t.text || '').trim();
      if (!text) continue;
      var e = { text: text, language: t.language || null, edition: t.edition || null, primary: false };
      if (t.translator) e.translator = t.translator;
      out.push(e);
    }
    if (out.length) out[0].primary = true;
    return out;
  }

  // Render the translation block. 0 editions → ''. 1 edition → the plain '.hadith-text' row
  // (identical to the pre-Module-12 markup, so single-edition data looks unchanged). >1 →
  // a '.dv-tabs' tablist + one '.hadith-text.trans-panel' per edition, primary shown, others
  // hidden. prefEdition (optional, from localStorage) selects which tab is active when its
  // edition is present; the DOM layer also persists clicks. Translator label rendered only
  // when actually present.
  function renderTranslations(editions, prefEdition) {
    editions = editions || [];
    if (!editions.length) return '';
    function byLine(e) { return e.translator ? '<div class="hadith-tr-by">Translated by ' + esc(e.translator) + '</div>' : ''; }
    if (editions.length === 1) {
      return '<div class="hadith-text">' + esc(editions[0].text) + '</div>' + byLine(editions[0]);
    }
    var hasPref = false, i;
    for (i = 0; i < editions.length; i++) { if (prefEdition && editions[i].edition === prefEdition) { hasPref = true; break; } }
    function active(e, idx) { return hasPref ? (e.edition === prefEdition) : (idx === 0); }
    var tabs = '<div class="dv-tabs" role="tablist" aria-label="Translations">';
    var panels = '';
    for (i = 0; i < editions.length; i++) {
      var e = editions[i];
      var on = active(e, i);
      var key = e.edition || ('t' + i);
      var label = e.edition || ('Translation ' + (i + 1));
      tabs += '<button type="button" class="dv-tab' + (on ? ' on' : '') + '" role="tab" data-edition="' +
        esc(key) + '" aria-selected="' + (on ? 'true' : 'false') + '">' + esc(label) + '</button>';
      panels += '<div class="hadith-text trans-panel" data-edition="' + esc(key) + '"' +
        (on ? '' : ' hidden') + '>' + esc(e.text) + '</div>' + byLine(e);
    }
    tabs += '</div>';
    return '<div class="hadith-translations">' + tabs + panels + '</div>';
  }

  function buildCardHTML(h) {
    var ref = refOf(h);
    if (!ref) return '';   // never emit a card without a stable ref

    var p = gradeParts(h);
    var arabic = h.arabicMatn || '';
    var narratorName = (h.narrator && h.narrator.name) || '';
    var reference = h.reference || [h.collectionName || h.collectionSlug,
        h.bookNumber != null ? ('Book ' + h.bookNumber) : null,
        h.hadithNumber != null ? ('Hadith ' + h.hadithNumber) : null].filter(Boolean).join(' · ');

    var narratorHTML = narratorName ? ('<div class="hadith-narrator">' + esc(narratorName) + '</div>') : '';
    var arabicHTML = arabic ? ('<div class="hadith-arabic" dir="rtl" lang="ar">' + esc(arabic) + '</div>') : '';
    var textHTML = renderTranslations(buildTranslations(h));

    // Footer: View Isnad + Listen are honestly disabled (no verified isnad/audio
    // data exists at Stage 1); Open Full View routes in a later stage. All are
    // data-act hooks wired by the DOM layer — no dead/lying onclick.
    return '' +
      '<div class="hadith-card" data-ai-selectable="hadith" data-ref="' + esc(ref) + '" data-grade="' + esc(p.value) + '">' +
        '<div class="hadith-teal-bar"></div>' +
        '<div class="hadith-inner">' +
          '<div class="hadith-header">' +
            '<div class="hadith-meta">' +
              '<span class="hadith-num">Hadith #' + esc(h.hadithNumber) + '</span>' +
              gradeBadgeHTML(p) +
            '</div>' +
            '<div class="hadith-actions">' +
              actionBtn('bookmark', 'Bookmark', SVG_BOOKMARK) +
              actionBtn('note', 'Add a private note', SVG_NOTE) +
              actionBtn('share', 'Share', SVG_SHARE) +
              actionBtn('copy', 'Copy with citation', SVG_COPY) +
              actionBtn('copy-arabic', 'Copy Arabic text only', SVG_COPY_AR) +
            '</div>' +
          '</div>' +
          arabicHTML +
          '<div class="hadith-translation">' + narratorHTML + textHTML + '</div>' +
          '<div class="hadith-footer">' +
            '<div class="hadith-ref"><span class="hadith-ref-icon">📖</span>' + esc(reference) + '</div>' +
            '<div class="hadith-footer-actions">' +
              '<button class="footer-action-btn" type="button" data-act="isnad" aria-expanded="false" title="View the isnad (chain of narrators)">' + SVG_ISNAD + ' <span>View Isnad</span></button>' +
              '<button class="footer-action-btn" type="button" data-act="listen" aria-disabled="true" title="Audio unavailable for this hadith">' + SVG_LISTEN + ' <span>Listen</span></button>' +
              '<button class="footer-action-btn primary" type="button" data-act="full">Open Full View</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  var core = {
    gradeParts: gradeParts,
    gradeBadgeHTML: gradeBadgeHTML,
    refOf: refOf,
    matchesGrade: matchesGrade,
    dedupeByRef: dedupeByRef,
    buildTranslations: buildTranslations,
    renderTranslations: renderTranslations,
    buildCardHTML: buildCardHTML,
    _esc: esc,
  };

  if (typeof module !== 'undefined' && module.exports) { module.exports = core; }
  else { root.II = root.II || {}; root.II.hadithFeed = core; }

}(typeof globalThis !== 'undefined' ? globalThis : window));
