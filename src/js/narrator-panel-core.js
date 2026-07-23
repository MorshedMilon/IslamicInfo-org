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

  // ── Itqan Rijal profile rendering (ADR-046/047) ────────────────────
  // Consolidated grade as headline + the per-classical-text breakdown, so
  // scholar disagreement is visible (never flattened). Renders ONLY real
  // Itqan data; caller shows "not yet verified" when there is no match.
  var ITQAN_GRADE = {
    companion:       { label: 'Companion', cls: 'rel-thiqah' },
    reliable:        { label: 'Reliable (Thiqah)', cls: 'rel-thiqah' },
    mostly_reliable: { label: 'Mostly Reliable (Saduq)', cls: 'rel-saduq' },
    weak:            { label: "Weak (Da'if)", cls: 'rel-daif' },
    abandoned:       { label: 'Abandoned (Matruk)', cls: 'rel-daif' },
    fabricator:      { label: 'Fabricator (Kadhdhab)', cls: 'rel-daif' },
    unknown:         { label: 'Unknown (Majhul)', cls: 'rel-unknown' },
  };
  var TEXT_NAMES = {
    taqrib: 'Taqrib al-Tahdhib (Ibn Hajar)', tahdhib_tahdhib: 'Tahdhib al-Tahdhib (Ibn Hajar)',
    mizan: "Mizan al-I'tidal (al-Dhahabi)", lisan_mizan: 'Lisan al-Mizan (Ibn Hajar)',
    thiqat: 'Kitab al-Thiqat (Ibn Hibban)', jarh: "al-Jarh wa al-Ta'dil (Ibn Abi Hatim)",
    siyar: "Siyar A'lam al-Nubala (al-Dhahabi)", kashif: 'al-Kashif (al-Dhahabi)',
    isaba: 'al-Isaba (Ibn Hajar)', mughni_ducafa: "al-Mughni fi al-Du'afa (al-Dhahabi)",
    diwan_ducafa: "Diwan al-Du'afa (al-Dhahabi)",
  };
  function itqanGradeParts(g) {
    var key = String(g == null ? '' : g).toLowerCase();
    return Object.prototype.hasOwnProperty.call(ITQAN_GRADE, key) ? ITQAN_GRADE[key] : ITQAN_GRADE.unknown;
  }
  function classicalSourceRows(sources) {
    sources = sources || {};
    var keys = Object.keys(sources);
    if (!keys.length) return '';
    var rows = keys.map(function (k) {
      var s = sources[k] || {};
      var gp = itqanGradeParts(s.grade_en);
      var ar = s.grade_ar ? ' <span dir="rtl" lang="ar">' + esc(s.grade_ar) + '</span>' : '';
      return '<div class="itqan-src-row"><span class="itqan-src-text">' + esc(TEXT_NAMES[k] || k) + '</span>' +
        '<span class="itqan-src-grade ' + gp.cls + '">' + esc(gp.label) + ar + '</span></div>';
    });
    return '<div class="itqan-sources-label">Graded across classical texts</div>' +
      '<div class="itqan-sources">' + rows.join('') + '</div>';
  }
  // p = D1/endpoint profile: { full_name, kunya, grade_en, grade_ar, classical_sources }
  function itqanProfileHTML(p) {
    if (!p) return buildNarratorPanelHTML(null);
    var gp = itqanGradeParts(p.grade_en);
    var face = p.full_name ? String(p.full_name).trim().slice(0, 2) : '·';
    var name = p.full_name ? '<span class="narrator-arabic" dir="rtl" lang="ar">' + esc(p.full_name) + '</span>' : 'Unknown narrator';
    var kunya = p.kunya ? '<div class="narrator-panel-kunya" dir="rtl" lang="ar">' + esc(p.kunya) + '</div>' : '';
    var gradeAr = p.grade_ar ? ' <span dir="rtl" lang="ar">' + esc(p.grade_ar) + '</span>' : '';
    return '<div class="narrator-panel-inner">' +
      '<div class="narrator-panel-head">' +
        '<div class="narrator-avatar ' + gp.cls + '">' + esc(face) + '</div>' +
        '<div class="narrator-panel-id"><div class="narrator-panel-name">' + name + '</div>' + kunya + '</div>' +
        '<span class="rel-badge ' + gp.cls + '"><span class="reliability-dot ' + gp.cls + '"></span>' + esc(gp.label) + gradeAr + '</span>' +
      '</div>' +
      classicalSourceRows(p.classical_sources) +
      '<div class="tp-attr">Source: Itqan Rijal Database — classical rijal texts (public domain)</div>' +
    '</div>';
  }

  var core = {
    reliabilityParts: reliabilityParts,
    graderRowsHTML: graderRowsHTML,
    buildNarratorPanelHTML: buildNarratorPanelHTML,
    itqanGradeParts: itqanGradeParts,
    itqanProfileHTML: itqanProfileHTML,
    _esc: esc,
  };

  if (typeof module !== 'undefined' && module.exports) { module.exports = core; }
  else { root.II = root.II || {}; root.II.narratorPanel = core; }

}(typeof globalThis !== 'undefined' ? globalThis : window));
