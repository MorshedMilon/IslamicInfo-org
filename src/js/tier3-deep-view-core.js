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

  // Browser: hadith-feed-core.js MUST be loaded before this file (gradeParts/gradeBadgeHTML/refOf are used unguarded below).
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
    var p = feed.gradeParts(h);
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

  // ── bodyCardHTML (enlarged Tier 3b variant of the feed card) ──────
  function bodyCardHTML(h) {
    if (!h) return '<div class="dv-body-card dv-body-unavailable">Hadith temporarily unavailable</div>';
    var p = feed.gradeParts(h);
    var arabic = h.arabicMatn ? '<div class="hadith-arabic dv-arabic" dir="rtl" lang="ar">' + esc(h.arabicMatn) + '</div>' : '';
    var narrator = (h.narrator && h.narrator.name) ? '<div class="hadith-narrator">' + esc(h.narrator.name) + '</div>' : '';
    var text = (h.translation && h.translation.text) ? '<div class="hadith-text dv-text">' + esc(h.translation.text) + '</div>' : '';
    var ref = h.reference || '';
    return '<div class="hadith-card hadith-card--deep dv-body-card" data-ref="' + esc(feed.refOf(h) || '') + '" data-grade="' + esc(p.value) + '">' +
      '<div class="hadith-teal-bar"></div><div class="hadith-inner">' +
        '<div class="hadith-header"><div class="hadith-meta">' +
          '<span class="hadith-num">Hadith #' + esc(h.hadithNumber) + '</span>' + feed.gradeBadgeHTML(p) +
        '</div></div>' + arabic +
        '<div class="hadith-translation">' + narrator + text + '</div>' +
        (ref ? '<div class="hadith-footer"><div class="hadith-ref"><span class="hadith-ref-icon">📖</span>' + esc(ref) + '</div></div>' : '') +
      '</div></div>';
  }

  // ── isnadInlineHTML (inline, NOT modal — TechSpec §2.7) ───────────
  function isnadInlineHTML(h) {
    var isn = h && h.isnad;
    var nodes = (isn && Array.isArray(isn.narrators)) ? isn.narrators : [];
    if (!nodes.length) {
      return '<div class="dv-block dv-isnad"><h2 class="dv-block-title">Chain of Narration (Isnad)</h2>' +
             '<div class="dv-empty">Chain of narration not available for this hadith.</div></div>';
    }
    var chain = nodes.map(function (n, i) {
      n = n || {};
      var nm = n.fullName || n.arabicName || ('Narrator ' + (i + 1));
      var meta = [n.role, n.lifespan || n.era].filter(Boolean).map(esc).join(' · ');
      return '<li class="dv-isnad-node"><span class="dv-isnad-name">' + esc(nm) + '</span>' +
             (meta ? '<span class="dv-isnad-meta">' + meta + '</span>' : '') + '</li>';
    }).join('');
    return '<div class="dv-block dv-isnad"><h2 class="dv-block-title">Chain of Narration (Isnad)</h2>' +
           '<ol class="dv-isnad-chain">' + chain + '</ol></div>';
  }

  // ── topicsChipsHTML (hidden when empty — always, live) ────────────
  function topicsChipsHTML(h) {
    var topics = (h && Array.isArray(h.topics)) ? h.topics.filter(Boolean) : [];
    if (!topics.length) return '';
    var chips = topics.map(function (t) {
      var label = (typeof t === 'string') ? t : (t.name || t.label || '');
      return label ? '<span class="dv-topic-chip">' + esc(label) + '</span>' : '';
    }).join('');
    return '<div class="dv-block dv-topics"><h2 class="dv-block-title">Topics</h2><div class="dv-topic-chips">' + chips + '</div></div>';
  }

  // ── relatedPlaceholderHTML (Module 11 fills it) ───────────────────
  function relatedPlaceholderHTML() {
    return '<div class="dv-block dv-related"><h2 class="dv-block-title">Related Narrations</h2>' +
           '<div class="dv-empty">Related narrations arrive in a later update.</div></div>';
  }

  // ── breadcrumbHTML ────────────────────────────────────────────────
  function breadcrumbHTML(r, c, h) {
    var slug = r.collection;
    var collName = (c && c.nameEnglish) || (h && h.collectionName) || slug || '';
    var bookNum = (h && h.bookNumber != null) ? h.bookNumber : (r ? r.book : null);
    var bookName = (h && h.bookName) || (bookNum != null ? ('Book ' + bookNum) : '');
    var hadNum = (h && h.hadithNumber != null) ? h.hadithNumber : (r ? r.hadith : '');
    var parts = [
      '<a class="dv-crumb" href="/hadith.html">Hadith</a>',
      '<a class="dv-crumb" href="/hadith/' + encodeURIComponent(slug) + '">' + esc(collName) + '</a>',
    ];
    if (bookNum != null) parts.push('<a class="dv-crumb" href="/hadith/' + encodeURIComponent(slug) + '/' + encodeURIComponent(bookNum) + '">' + esc(bookName) + '</a>');
    parts.push('<span class="dv-crumb dv-crumb-current" aria-current="page">Hadith ' + esc(hadNum) + '</span>');
    return '<nav class="dv-breadcrumb" aria-label="Breadcrumb">' + parts.join('<span class="dv-crumb-sep" aria-hidden="true">›</span>') + '</nav>';
  }

  // ── actionButtonsHTML (rendered; wiring is Module 10 — no dead onclick) ──
  function actionButtonsHTML() {
    return '<div class="dv-actions">' +
      '<button class="dv-action-btn" type="button" data-act="bookmark" title="Bookmark" aria-label="Bookmark">🔖</button>' +
      '<button class="dv-action-btn" type="button" data-act="share" title="Share" aria-label="Share">↗</button>' +
      '<button class="dv-action-btn" type="button" data-act="copy" title="Copy with attribution" aria-label="Copy with attribution">📋</button>' +
    '</div>';
  }

  // ── resolveNeighbors (by list order, not contiguous-number assumption) ──
  function resolveNeighbors(list, currentNum) {
    var nums = (Array.isArray(list) ? list : []).map(function (x) {
      return (x && typeof x === 'object') ? x.hadithNumber : x;
    }).filter(function (n) { return n != null; });
    var i = nums.map(String).indexOf(String(currentNum));
    if (i === -1) return { prev: null, next: null };
    return { prev: i > 0 ? nums[i - 1] : null, next: i < nums.length - 1 ? nums[i + 1] : null };
  }

  // ── prevNextNavHTML ───────────────────────────────────────────────
  function prevNextNavHTML(neighbors, slug, book) {
    neighbors = neighbors || { prev: null, next: null };
    function btn(num, dir, label) {
      if (num == null) return '<span class="dv-nav-btn dv-nav-' + dir + ' dv-nav-disabled" aria-disabled="true">' + label + '</span>';
      var href = '/hadith/' + encodeURIComponent(slug) + '/' + encodeURIComponent(book) + '/' + encodeURIComponent(num);
      return '<a class="dv-nav-btn dv-nav-' + dir + '" href="' + href + '">' + label + '</a>';
    }
    return '<nav class="dv-prevnext" aria-label="Hadith navigation">' +
      btn(neighbors.prev, 'prev', '← Previous') + btn(neighbors.next, 'next', 'Next →') + '</nav>';
  }

  // ── deepViewHTML — assembles Tier 3b in EXACT TechSpec §2.7 order:
  //   header(breadcrumb+actions) → body card → isnad(inline) → gradings
  //   → translations → topics(hidden if empty) → related → prev/next.
  // opts: { activeLang, neighbors, book }. `book` for prev/next when h is null.
  function deepViewHTML(r, c, h, opts) {
    opts = opts || {};
    var book = (h && h.bookNumber != null) ? h.bookNumber : (opts.book != null ? opts.book : r.book);
    return '<article class="dv" data-slug="' + esc(r.collection) + '">' +
      '<header class="dv-header">' + breadcrumbHTML(r, c, h) + actionButtonsHTML() + '</header>' +
      bodyCardHTML(h) +
      isnadInlineHTML(h) +
      '<div class="dv-block dv-gradings-block"><h2 class="dv-block-title">Grading</h2>' +
        (h ? gradingsTableHTML(h) : '<div class="dv-empty">—</div>') + '</div>' +
      translationBlockHTML(translationModel(h), opts.activeLang) +
      topicsChipsHTML(h) +
      relatedPlaceholderHTML() +
      '<div class="dv-prevnext-slot">' + prevNextNavHTML(opts.neighbors, r.collection, book) + '</div>' +
    '</article>';
  }

  var core = {
    _esc: esc,
    LANG_ORDER: LANG_ORDER,
    LANG_LABELS: LANG_LABELS,
    translationModel: translationModel,
    chooseLang: chooseLang,
    gradingsTableHTML: gradingsTableHTML,
    translationBlockHTML: translationBlockHTML,
    bodyCardHTML: bodyCardHTML,
    isnadInlineHTML: isnadInlineHTML,
    topicsChipsHTML: topicsChipsHTML,
    relatedPlaceholderHTML: relatedPlaceholderHTML,
    breadcrumbHTML: breadcrumbHTML,
    actionButtonsHTML: actionButtonsHTML,
    resolveNeighbors: resolveNeighbors,
    prevNextNavHTML: prevNextNavHTML,
    deepViewHTML: deepViewHTML,
  };

  if (typeof module !== 'undefined' && module.exports) { module.exports = core; }
  else { root.II = root.II || {}; root.II.tier3Core = core; }

}(typeof globalThis !== 'undefined' ? globalThis : window));
