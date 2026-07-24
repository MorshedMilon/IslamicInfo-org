/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — hadith-collections-core.js
   Pure, framework-free logic for the Hadith Library Stage-1 UI.
   UMD (window.II.hadithCollections in the browser; module.exports in tests),
   mirroring api.js. NO DOM, NO network — all inputs passed in.
   Rule: the live API governs authoritative fields; the curated meta map only
   fills presentation gaps; missing data → null / honest fallback (never faked).
   ═══════════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  // Shared citation builder (window.II.hadithCitation in the browser; required
  // in Node tests). Used so the Hadith-of-the-Day citation matches every other
  // hadith card: "[Collection] [Number]", no book number, no vendor.
  var citation = (typeof require !== 'undefined')
    ? require('./hadith-citation-core.js')
    : (root.II && root.II.hadithCitation);

  var CATEGORIES = {
    sittah:   ['sahih-bukhari', 'sahih-muslim', 'abu-dawood', 'al-tirmidhi', 'sunan-nasai', 'ibn-e-majah'],
    musnad:   ['musnad-ahmad'],
    selected: ['mishkat', 'al-silsila-sahiha'],
  };

  function mergeCollection(api, meta) {
    api = api || {};
    var slug = api.collectionSlug || null;
    var m = (meta && slug && meta[slug]) || {};
    var hc = (typeof api.hadithCount === 'number') ? api.hadithCount : null;
    var cc = (typeof api.chaptersCount === 'number') ? api.chaptersCount : null;
    return {
      slug: slug,
      nameEnglish: api.collectionName || m.nameEnglish || slug || 'Unknown',
      nameArabic: m.arabicName || null,
      compiler: api.compiler || m.compiler || null,
      lifespan: m.lifespan || null,
      motif: m.motif || null,
      hadithCount: hc,
      chaptersCount: cc,
      compiledPeriod: m.compiledPeriod || null,
      category: m.category || 'other',
      featured: m.featured === true,
      authLabel: m.authLabel || null,
      authTone: m.authTone || 'unknown',
    };
  }

  function inCategory(c, tab) {
    if (!c) return false;
    if (tab === 'all' || !tab) return true;
    return c.category === tab;
  }

  function aggregateStats(list) {
    list = Array.isArray(list) ? list : [];
    var total = 0, partial = false;
    for (var i = 0; i < list.length; i++) {
      var n = list[i] && list[i].hadithCount;
      if (typeof n === 'number' && n > 0) total += n; else partial = true;
    }
    return { collectionCount: list.length, totalHadiths: total, partial: partial, verifiedPct: 100 };
  }

  function formatCountK(n) {
    if (typeof n !== 'number' || !(n > 0)) return { lead: '—', suffix: '' };
    var k = Math.floor(n / 1000);
    return { lead: k + ',', suffix: 'K+' };
  }

  function formatInt(n) {
    if (typeof n !== 'number' || !(n >= 0)) return 'Unavailable';
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function hotdFields(d) {
    d = d || {};
    var grade = d.grade || {};
    var hasGrade = grade.value && grade.value !== 'unknown';
    var ref = (citation && citation.buildReference(d)) ||
              ((d.collectionName || d.collectionSlug) && d.hadithNumber != null
                 ? (d.collectionName || d.collectionSlug) + ' ' + d.hadithNumber
                 : '');
    return {
      arabic: d.arabicMatn || '',
      translation: (d.translation && d.translation.text) || '',
      reference: ref,
      narrator: (d.narrator && d.narrator.name) || null,
      gradeValue: hasGrade ? grade.value : 'unknown',
      gradeLabel: hasGrade ? (grade.label || grade.value) : 'Grade Unknown',
      grader: (hasGrade && grade.grader) ? grade.grader : null,
    };
  }

  function toneColor(tone) {
    switch (tone) {
      case 'hasan': return 'var(--grade-hasan)';
      case 'daif':  return 'var(--grade-daif)';
      case 'mawdu': return 'var(--grade-mawdu)';
      case 'sahih': return 'var(--grade-sahih)';
      default:      return 'var(--ink-muted)';
    }
  }

  function hotdGradeText(h) {
    h = h || {};
    if (!h.gradeValue || h.gradeValue === 'unknown') return 'Grade Unknown';
    var base = 'Graded ' + (h.gradeLabel || h.gradeValue);
    if (h.grader) return base + ' by ' + h.grader;
    return base + ' · grader not individually cited';
  }

  var core = {
    CATEGORIES: CATEGORIES,
    mergeCollection: mergeCollection,
    inCategory: inCategory,
    aggregateStats: aggregateStats,
    formatCountK: formatCountK,
    formatInt: formatInt,
    hotdFields: hotdFields,
    toneColor: toneColor,
    hotdGradeText: hotdGradeText,
  };

  if (typeof module !== 'undefined' && module.exports) { module.exports = core; }
  else { root.II = root.II || {}; root.II.hadithCollections = core; }

}(typeof globalThis !== 'undefined' ? globalThis : window));
