/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — narrator-panel-core.js  (Module 8)
   Pure, framework-free HTML builders for the narrator reliability panel
   (Isnad v2). NO DOM, NO network — inputs passed in, returns strings.
   UMD: window.II.narratorPanel in the browser; module.exports in tests.

   RELIGIOUS ACCURACY (highest-risk module): this file only RENDERS narrator
   data — it authors none. Reliability grades + scholar citations come solely
   from provider/curated `/data/narrator/{id}.json` (human, scholar-verified).
   Empty citations → honest "No scholar citations available" (never padded).
   Unknown reliability → grey 'unknown' (never guessed). See DoD-9 + ADR-029.
   ═══════════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // Canonical reliability map — the ONLY source of badge/dot class + label.
  // Anything not here (incl. missing) collapses to grey 'unknown' (never guessed).
  var REL = {
    thiqah: { label: 'Thiqah', dot: 'thiqah', badge: 'rel-thiqah' },
    saduq:  { label: 'Saduq',  dot: 'saduq',  badge: 'rel-saduq' },
    daif:   { label: "Da'if",  dot: 'daif',   badge: 'rel-daif' },
  };

  function reliabilityParts(grade) {
    var key = String(grade == null ? '' : grade).toLowerCase();
    var hit = Object.prototype.hasOwnProperty.call(REL, key) ? REL[key] : null;
    if (hit) return { grade: key, label: hit.label, dotClass: hit.dot, badgeClass: hit.badge, known: true };
    return { grade: 'unknown', label: 'Unknown', dotClass: 'unknown', badgeClass: 'rel-unknown', known: false };
  }

  // One row per citation. NEVER pads to a "minimum" — renders exactly what's
  // present; empty → honest note (never fabricated to fill the 3-row target).
  function graderRowsHTML(citations) {
    var list = Array.isArray(citations) ? citations : [];
    var rows = list.map(function (c) {
      c = c || {};
      var scholar = c.scholar ? esc(c.scholar) : '';
      var gradeText = c.gradeText ? esc(c.gradeText) : '';
      if (!scholar && !gradeText) return '';                 // never a blank/padded row
      var cite = [c.source, c.sourceRef].filter(Boolean).map(esc).join(', ');
      return '<div class="scholar-grading-row">' +
        '<span class="sg-scholar">' + scholar + '</span>' +
        '<span class="sg-grade">' + gradeText + '</span>' +
        (cite ? '<span class="sg-note">' + cite + '</span>' : '') +
      '</div>';
    }).filter(Boolean);
    if (!rows.length) return '<div class="dv-empty dv-empty--compact" role="note">No scholar citations available for this narrator</div>';
    return '<div class="scholar-gradings">' + rows.join('') + '</div>';
  }

  function buildNarratorPanelHTML(n) {
    if (!n) return '<div class="dv-empty dv-empty--compact" role="note">Reliability data unavailable for this narrator</div>';
    var rel = reliabilityParts(n.reliabilityGrade);
    var face = n.arabicName ? String(n.arabicName).slice(0, 2)
             : (n.fullName ? String(n.fullName).trim().charAt(0) : '·');
    var kunyaNasab = [n.kunya, n.nasab].filter(Boolean).map(esc).join(' ');
    var lifePlace = [n.lifespan, n.place || n.era].filter(Boolean).map(esc).join(' · ');
    var arabic = n.arabicName ? ' <span class="narrator-arabic" dir="rtl" lang="ar">' + esc(n.arabicName) + '</span>' : '';
    return '<div class="narrator-panel-inner">' +
      '<div class="narrator-panel-head">' +
        '<div class="narrator-avatar ' + rel.dotClass + '">' + esc(face) + '</div>' +
        '<div class="narrator-panel-id">' +
          '<div class="narrator-panel-name">' + (n.fullName ? esc(n.fullName) : 'Unknown narrator') + arabic + '</div>' +
          (kunyaNasab ? '<div class="narrator-panel-kunya">' + kunyaNasab + '</div>' : '') +
          (lifePlace ? '<div class="narrator-lifespan">' + lifePlace + '</div>' : '') +
        '</div>' +
        '<span class="rel-badge ' + rel.badgeClass + '"><span class="reliability-dot ' + rel.dotClass + '"></span>' + esc(rel.label) + '</span>' +
      '</div>' +
      graderRowsHTML(n.graderCitations) +
    '</div>';
  }

  var core = {
    reliabilityParts: reliabilityParts,
    graderRowsHTML: graderRowsHTML,
    buildNarratorPanelHTML: buildNarratorPanelHTML,
    _esc: esc,
  };

  if (typeof module !== 'undefined' && module.exports) { module.exports = core; }
  else { root.II = root.II || {}; root.II.narratorPanel = core; }

}(typeof globalThis !== 'undefined' ? globalThis : window));
