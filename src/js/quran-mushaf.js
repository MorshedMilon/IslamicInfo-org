/* IslamicInfo.org — quran-mushaf.js
   Madina Mushaf (QCF v2) page rendering, font loading, mode switch + page nav.
   Depends on window.II.mushafCore. Ayah-level highlight only (word audio-sync out of scope). */
(function () {
  'use strict';
  var core = window.II && window.II.mushafCore;
  var host = function () { return document.getElementById('mushafRender'); };

  function updateNav(page) {
    var ind = document.getElementById('mushafPageNum'); if (ind) ind.textContent = page + ' / ' + core.PAGE_MAX;
    var prev = document.getElementById('mushafPrev'); if (prev) prev.disabled = page <= core.PAGE_MIN;
    var next = document.getElementById('mushafNext'); if (next) next.disabled = page >= core.PAGE_MAX;
  }
  var loaded = {};           // family -> true (font registered)
  var failed = {};           // family -> true (font failed to load)
  var state = { active: false, page: 1, variant: 'v2', zoom: 1 };
  try { var _z = parseFloat(localStorage.getItem('ii-quran-mushaf-zoom')); if (_z > 0) state.zoom = _z; } catch (e) {}
  // Recitation auto page-turn state (see mushafSync): while playing, when the reciting
  // ayah is not on the rendered page we turn to the next page and re-highlight once it loads.
  var navInFlight = false, pendingSyncKey = null, pendingSyncWord = 0;

  function isFirefox() { return /firefox/i.test(navigator.userAgent); }
  function theme() { return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; }

  // The QCF Tajweed V4 (colrv1) font ships a DARK palette (base-palette index 1) whose
  // base letters are light — needed so non-rule letters stay readable on a dark page.
  // Inject an @font-palette-values rule per v4 family and return its name.
  var paletteStyle = null;
  function ensureDarkPalette(fam) {
    if (!paletteStyle) {
      paletteStyle = document.createElement('style'); paletteStyle.id = 'ii-mushaf-palettes';
      document.head.appendChild(paletteStyle);
    }
    var name = '--iiDark-' + fam;
    if (paletteStyle.textContent.indexOf(name + '{') === -1) {
      paletteStyle.textContent += "@font-palette-values " + name +
        "{font-family:'" + fam + "';base-palette:1;}";
    }
    return name;
  }
  function chapters() { try { return JSON.parse(localStorage.getItem('ii-quran-chapters')); } catch (e) { return null; } }

  // Resolves to the family name on success; rejects if the font can't be loaded
  // (glyph codes are meaningless without their page font, so a failure must surface).
  function ensureFont(page, variant) {
    var fam = core.fontFamily(page, variant);
    if (loaded[fam]) return Promise.resolve(fam);
    if (failed[fam]) return Promise.reject(new Error('font previously failed: ' + fam));
    if (!window.FontFace) return Promise.reject(new Error('FontFace unsupported'));
    var url = core.fontUrl(page, variant, theme(), isFirefox());
    var ff = new FontFace(fam, "url('" + url + "') format('woff2')");
    return ff.load().then(function (f) { document.fonts.add(f); loaded[fam] = true; return fam; })
                    .catch(function (e) { failed[fam] = true; throw e; });
  }

  function surahNameArabic(surahId) {
    try {
      var c = chapters();
      var ch = c && c.data && c.data.filter(function (x) { return x.id === Number(surahId); })[0];
      return (ch && (ch.name_arabic || ch.name_simple)) || '';
    } catch (e) { return ''; }
  }

  // Size the Arabic so each line fills the content width naturally (like the printed
  // Madina page). We MEASURE the widest line's natural width and scale the whole page to
  // match — no CSS justify. This works identically for v2 and v4 (same glyph widths), so
  // toggling Tajweed never shifts the layout. Page scrolls vertically when tall.
  function sizeToWidth(sheet) {
    var pageEl = sheet.querySelector('.mushaf-page');
    if (!pageEl) return;
    // clientWidth INCLUDES the page's horizontal padding, but the text lays out inside
    // it — so subtract the padding to get the real text box. (Using clientWidth directly
    // oversized the font by ~2×padding, overflowing the box and clipping letters on the
    // left/right, most visibly on narrow mobile pages.)
    var cs = getComputedStyle(pageEl);
    var contentW = pageEl.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0);
    if (!contentW || contentW <= 0) return;
    var ayah = pageEl.querySelectorAll('.m-line--ayah');
    if (!ayah.length) { pageEl.style.fontSize = Math.max(24, Math.min(48, contentW / 24)) + 'px'; return; }
    var REF = 80;                                       // measure at a reference size (lines are nowrap)
    pageEl.style.fontSize = REF + 'px';
    var maxNat = 0;
    for (var i = 0; i < ayah.length; i++) { var w = ayah[i].scrollWidth; if (w > maxNat) maxNat = w; }
    if (!maxNat) return;
    var fs = REF * (contentW * 0.985 / maxNat);         // 1.5% safety so nowrap never overflows
    fs = Math.max(18, Math.min(64, fs));
    pageEl.style.fontSize = fs + 'px';
  }

  // Zoom the whole page (transform scale) — sizeToWidth already fills the width at 1×,
  // so scaling from there keeps the authentic per-line layout while enlarging/shrinking.
  // The mushaf view scrolls (safe-centered) when a zoomed-in page exceeds the canvas.
  function applyZoom(sheet) {
    var pageEl = (sheet || document).querySelector('.mushaf-page');
    if (!pageEl) return;
    var z = state.zoom || 1;
    pageEl.style.transformOrigin = 'top center';
    pageEl.style.transform = (z === 1) ? '' : 'scale(' + z + ')';
  }

  function renderModel(model, variant) {
    var h = host(); if (!h) return;
    var fam = core.fontFamily(model.page, variant);
    var sheet = document.createElement('div'); sheet.className = 'mushaf-sheet';
    var pageEl = document.createElement('div'); pageEl.className = 'mushaf-page'; pageEl.setAttribute('dir', 'rtl');
    // Dark mode + Tajweed (colrv1): select the font's dark palette so base letters are light.
    // (Firefox uses the ot-svg/dark font — colors baked in — so no palette needed there.)
    if (variant === 'v4' && theme() === 'dark' && !isFirefox()) {
      pageEl.style.fontPalette = ensureDarkPalette(fam);
    }

    model.lines.forEach(function (line) {
      var row = document.createElement('div');
      row.className = 'm-line m-line--' + line.type + (line.centered ? ' m-line--center' : '');
      if (line.type === 'surah_name') {
        row.innerHTML = '<span class="m-surah-frame">﴿ ' + surahNameArabic(line.surah) + ' ﴾</span>';
      } else if (line.type === 'basmallah') {
        row.innerHTML = '<span class="m-basmala">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</span>';
      } else {
        // Per-word spans carrying verse_key + position so recitation sync can highlight
        // the current ayah/word. In QCF v2 each word is a single PUA glyph code, so
        // wrapping each in an unstyled inline span is a zero-layout-change op (the old
        // distortion came from CSS justify, which is gone — we measure-and-scale instead).
        row.style.fontFamily = "'" + fam + "', 'Amiri', serif";
        row.innerHTML = line.words.map(function (w) {
          return '<span class="m-word" data-vk="' + w.verseKey + '" data-wp="' + w.position + '">' + w.code + '</span>';
        }).join('');
      }
      pageEl.appendChild(row);
    });

    var footer = document.createElement('div'); footer.className = 'mushaf-foot';
    footer.textContent = 'Page ' + model.page +
      (model.juz ? ' · Juz ' + model.juz : '') + (model.hizb ? ' · Hizb ' + model.hizb : '');
    sheet.appendChild(pageEl); sheet.appendChild(footer);
    h.innerHTML = ''; h.appendChild(sheet);
    requestAnimationFrame(function () { sizeToWidth(sheet); applyZoom(sheet); });
  }

  function showLoading() { var h = host(); if (h) h.innerHTML = '<div class="mushaf-loading">Loading page…</div>'; }
  function showError() {
    var h = host();
    if (h) h.innerHTML = '<div class="mushaf-error">Mushaf temporarily unavailable — returning to Study Mode.</div>';
    if (typeof window.switchToStudyMode === 'function') setTimeout(function () { window.switchToStudyMode(); }, 1600);
  }

  window.mushafGoToPage = function (page) {
    if (!core) return;
    page = Math.max(core.PAGE_MIN, Math.min(core.PAGE_MAX, Number(page) || 1));
    state.page = page; showLoading();
    var variant = state.variant;
    Promise.all([ core.fetchPage(page, { chapters: chapters() }), ensureFont(page, variant) ])
      .then(function (res) {
        renderModel(res[0], variant); updateNav(page);
        try { localStorage.setItem('ii-quran-mushaf-page', String(page)); } catch (e) {}
        if (page < core.PAGE_MAX) ensureFont(page + 1, variant).catch(function () {}); // prefetch next
        // Auto page-turn follow-up: re-highlight the reciting ayah on the freshly rendered page.
        navInFlight = false;
        if (pendingSyncKey) { var _k = pendingSyncKey, _w = pendingSyncWord; pendingSyncKey = null; mushafSync(_k, _w); }
      })
      .catch(function (e) { navInFlight = false; pendingSyncKey = null; console.warn('[mushaf] page ' + page + ' failed:', e && e.message); showError(); });
  };

  window.mushafChangePage = function (dir) { window.mushafGoToPage(state.page + dir); };

  // Re-render on theme switch so the Tajweed palette (and Firefox ot-svg light/dark font)
  // update live while the Mushaf is open.
  if (window.MutationObserver) {
    new MutationObserver(function () {
      if (state.active) window.mushafGoToPage(state.page);
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }

  // ── Recitation highlight on the QCF page ──────────────────────────────────
  // Driven by quran-audio.js (markPlaying/onTime) when Mushaf mode is active. Ayah
  // spans carry data-vk (verse_key) + data-wp (1-based word position). The audio
  // segment word index is 0-based over words, so the active word is data-wp = idx+1.
  var lastSyncAyah = null;
  function clearMushafHighlight() {
    var h = host(); if (!h) return;
    Array.prototype.forEach.call(h.querySelectorAll('.m-word.m-ayah-active, .m-word.word-active'),
      function (s) { s.classList.remove('m-ayah-active', 'word-active'); });
    lastSyncAyah = null;
  }
  // Center the ayah in the reader's OWN scroll container — never element.scrollIntoView(),
  // which also scrolls the window and pushes the always-visible toolbar off the top.
  function scrollAncestorIntoView(el) {
    var p = el && el.parentElement;
    while (p && p !== document.body && p !== document.documentElement) {
      var oy = getComputedStyle(p).overflowY;
      if ((oy === 'auto' || oy === 'scroll') && p.scrollHeight > p.clientHeight + 2) {
        var pr = p.getBoundingClientRect(), er = el.getBoundingClientRect();
        var delta = (er.top - pr.top) - (p.clientHeight / 2 - er.height / 2);
        try { p.scrollBy({ top: delta, behavior: 'smooth' }); } catch (e) { p.scrollTop += delta; }
        return;
      }
      p = p.parentElement;
    }
  }
  // Highlight the given ayah (and its current word) on the page. When the ayah isn't on
  // the rendered page, auto-advance to the next page (recitation is sequential) so the
  // Mushaf follows along by itself. Returns false if the ayah isn't on the current page.
  function mushafSync(verseKey, wordIdx0) {
    var h = host(); if (!h) return false;
    var ayahSpans = h.querySelectorAll('.m-word[data-vk="' + verseKey + '"]');
    if (!ayahSpans.length) {
      if (!navInFlight && state.active && state.page < core.PAGE_MAX) {
        navInFlight = true; pendingSyncKey = verseKey;
        pendingSyncWord = (typeof wordIdx0 === 'number' ? wordIdx0 : 0);
        window.mushafGoToPage(state.page + 1);      // turn the page; re-sync fires after render
      }
      if (lastSyncAyah !== null) clearMushafHighlight();
      return false;
    }
    if (verseKey !== lastSyncAyah) {
      clearMushafHighlight();
      // Word-by-word only (like Study Mode) — no whole-ayah/whole-line background.
      // We still track the ayah change here to clear prior highlights + follow-scroll.
      lastSyncAyah = verseKey;
      scrollAncestorIntoView(ayahSpans[0]);
    } else {
      Array.prototype.forEach.call(h.querySelectorAll('.m-word.word-active'),
        function (s) { s.classList.remove('word-active'); });
    }
    if (typeof wordIdx0 === 'number' && wordIdx0 >= 0) {
      var span = h.querySelector('.m-word[data-vk="' + verseKey + '"][data-wp="' + (wordIdx0 + 1) + '"]');
      if (span) span.classList.add('word-active');
    }
    return true;
  }

  window.II = window.II || {};
  window.II.mushaf = {
    current: function () { return state.page; },
    isActive: function () { return state.active; },
    sync: mushafSync,
    clearHighlight: clearMushafHighlight,
    _setActive: function (b) { state.active = !!b; if (!state.active) clearMushafHighlight(); },
    _variant: function () { return state.variant; },
    zoom: function () { return state.zoom; },
    // Scale the mushaf page; mirrored from the reader's A−/A+ control. Persisted.
    setZoom: function (z) {
      state.zoom = Math.max(0.5, Math.min(2.5, Number(z) || 1));
      try { localStorage.setItem('ii-quran-mushaf-zoom', String(state.zoom)); } catch (e) {}
      applyZoom();      // apply to the current page immediately
      return state.zoom;
    },
    // Swap the page font between plain (v2) and tajweed (v4); re-renders current page.
    _setVariant: function (v) {
      state.variant = (v === 'v4') ? 'v4' : 'v2';
      if (!state.active) return Promise.resolve();
      var page = state.page;
      return ensureFont(page, state.variant)
        .then(function () { return core.fetchPage(page, { chapters: chapters() }); })
        .then(function (m) { renderModel(m, state.variant); })
        .catch(function (e) { console.warn('[mushaf] variant swap failed:', e && e.message); showError(); });
    }
  };
})();
