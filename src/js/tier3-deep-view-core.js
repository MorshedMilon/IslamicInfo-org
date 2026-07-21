/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — tier3-deep-view-core.js  (Module 7)
   Pure, framework-free HTML builders + helpers for Tier 3a (in-book list)
   and Tier 3b (single-hadith deep-view). NO DOM, NO network — inputs passed
   in, builders return strings. UMD: window.II.tier3Core in the browser,
   module.exports in tests. Mirrors hadith-feed-core.js.

   Content-authenticity (see hadith-module-decisions memory + spec):
   - Grade badge / gradings table reuse hadith-feed-core gradeParts +
     gradeBadgeHTML (one source of truth); null grader → "grader not
     individually cited"; NEVER a fabricated second scholar.
   - Isnad / topics / extra translations render honest empty states when
     the provider supplies none (always, live).
   ═══════════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  var feed = (typeof require !== 'undefined')
    ? require('./hadith-feed-core.js')
    : (root.II && root.II.hadithFeed);

  function esc(s) {
    if (feed && typeof feed._esc === 'function') return feed._esc(s);
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // Canonical translation languages + display labels (TechSpec §2.7 order).
  var LANG_ORDER = ['en', 'ur', 'fr', 'id', 'tr'];
  var LANG_LABELS = { en: 'English', ur: 'اردو', fr: 'Français', id: 'Indonesia', tr: 'Türkçe' };

  // ── translationModel ──────────────────────────────────────────────
  // Present languages only. Live payload has a single `translation`; future
  // enrichment adds `translations[]`. Never fabricates a missing language.
  function translationModel(h) {
    var out = [];
    function push(t) {
      if (!t || !t.text) return;
      var lang = String(t.language || 'en').toLowerCase();
      if (lang === 'ar') lang = 'en';                 // provider text is the EN translation of AR matn
      if (out.some(function (o) { return o.lang === lang; })) return;
      out.push({ lang: lang, label: LANG_LABELS[lang] || lang.toUpperCase(),
                 text: t.text, translator: t.translator || null, edition: t.edition || null });
    }
    if (h && h.translation) push(h.translation);
    if (h && Array.isArray(h.translations)) h.translations.forEach(push);
    out.sort(function (a, b) {
      var ia = LANG_ORDER.indexOf(a.lang), ib = LANG_ORDER.indexOf(b.lang);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    });
    return out;
  }

  function chooseLang(model, preferred) {
    if (!model || !model.length) return null;
    var hit = preferred && model.filter(function (m) { return m.lang === preferred; })[0];
    return (hit || model[0]).lang;
  }

  // ── gradingsTableHTML ─────────────────────────────────────────────
  // Reuses hadith-feed-core gradeParts (one grade source of truth). Live:
  // one row, grader null → fallback text, + gap note. Multi-row only when
  // real alternateGradings exist (future curated data). Never fabricates.
  function gradingsTableHTML(h) {
    var p = (h && h.value && h.className) ? h : feed.gradeParts(h);  // accept hadith OR gradeParts
    if (p.value === 'unknown') {
      return '<div class="dv-gradings-empty">Scholarly grading not individually recorded for this narration.</div>';
    }
    var rows = [{ label: p.label, grader: p.grader }];
    (p.alternates || []).forEach(function (a) {
      rows.push({ label: a.label || a.value || 'Grade Unknown', grader: a.grader || null });
    });
    var body = rows.map(function (row) {
      var grader = row.grader ? esc(row.grader) : 'grader not individually cited';
      return '<tr><td class="dv-grade-cell">' + esc(row.label) + '</td><td class="dv-grader-cell">' + grader + '</td></tr>';
    }).join('');
    var gap = (rows.length < 2)
      ? '<p class="dv-gradings-note">Additional scholarly gradings not yet available for this narration.</p>' : '';
    return '<table class="dv-gradings"><thead><tr><th scope="col">Grade</th><th scope="col">Graded by</th></tr></thead>' +
           '<tbody>' + body + '</tbody></table>' + gap;
  }

  // ── translationBlockHTML ──────────────────────────────────────────
  // Tab strip ONLY when >=2 languages present (a real choice). Single
  // language → no strip. Empty → honest unavailable.
  function translationBlockHTML(model, activeLang) {
    if (!model || !model.length) {
      return '<div class="dv-block dv-translations"><h2 class="dv-block-title">Translation</h2>' +
             '<div class="dv-empty">Translation temporarily unavailable.</div></div>';
    }
    activeLang = chooseLang(model, activeLang);
    var tabs = '';
    if (model.length >= 2) {
      tabs = '<div class="dv-tabs" role="tablist">' + model.map(function (m) {
        var on = m.lang === activeLang;
        return '<button class="dv-tab' + (on ? ' on' : '') + '" role="tab" type="button" ' +
               'aria-selected="' + (on ? 'true' : 'false') + '" data-lang="' + esc(m.lang) + '">' + esc(m.label) + '</button>';
      }).join('') + '</div>';
    }
    var panes = model.map(function (m) {
      var on = m.lang === activeLang;
      var by = m.translator ? ('<div class="dv-tr-by">— ' + esc(m.translator) + '</div>') : '';
      return '<div class="dv-tr-pane" role="tabpanel" data-lang="' + esc(m.lang) + '"' + (on ? '' : ' hidden') + '>' +
             '<p class="dv-tr-text">' + esc(m.text) + '</p>' + by + '</div>';
    }).join('');
    return '<div class="dv-block dv-translations"><h2 class="dv-block-title">Translation</h2>' + tabs + panes + '</div>';
  }

  var core = {
    _esc: esc,
    LANG_ORDER: LANG_ORDER,
    LANG_LABELS: LANG_LABELS,
    translationModel: translationModel,
    chooseLang: chooseLang,
    gradingsTableHTML: gradingsTableHTML,
    translationBlockHTML: translationBlockHTML,
  };

  if (typeof module !== 'undefined' && module.exports) { module.exports = core; }
  else { root.II = root.II || {}; root.II.tier3Core = core; }

}(typeof globalThis !== 'undefined' ? globalThis : window));
