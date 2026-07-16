/* IslamicInfo.org — quran-mushaf.js
   Madina Mushaf (QCF v2) page rendering, font loading, mode switch + page nav.
   Depends on window.II.mushafCore. Ayah-level highlight only (word audio-sync out of scope). */
(function () {
  'use strict';
  var core = window.II && window.II.mushafCore;
  var host = function () { return document.getElementById('mushafPageView'); };
  var loaded = {};           // family -> true (font registered)
  var failed = {};           // family -> true (font failed to load)
  var state = { active: false, page: 1, variant: 'v2' };

  function isFirefox() { return /firefox/i.test(navigator.userAgent); }
  function theme() { return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; }
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

  function fitToHeight(sheet) {
    var va = document.getElementById('versesArea');
    var pageEl = sheet.querySelector('.mushaf-page');
    if (!va || !pageEl) return;
    var avail = va.clientHeight - 96;            // minus footer + sheet padding
    var over = pageEl.scrollHeight;
    if (over > avail && avail > 120) {
      var cur = parseFloat(getComputedStyle(pageEl).fontSize);
      pageEl.style.fontSize = Math.max(15, cur * (avail / over)) + 'px';
    }
  }

  function renderModel(model, variant) {
    var h = host(); if (!h) return;
    var fam = core.fontFamily(model.page, variant);
    var sheet = document.createElement('div'); sheet.className = 'mushaf-sheet';
    var pageEl = document.createElement('div'); pageEl.className = 'mushaf-page'; pageEl.setAttribute('dir', 'rtl');

    model.lines.forEach(function (line) {
      var row = document.createElement('div');
      row.className = 'm-line m-line--' + line.type + (line.centered ? ' m-line--center' : '');
      if (line.type === 'surah_name') {
        row.innerHTML = '<span class="m-surah-frame">﴿ ' + surahNameArabic(line.surah) + ' ﴾</span>';
      } else if (line.type === 'basmallah') {
        row.innerHTML = '<span class="m-basmala">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</span>';
      } else {
        var words = line.words.map(function (w) {
          return '<span class="mushaf-word' + (w.type === 'end' ? ' m-end' : '') +
                 '" data-vk="' + (w.verseKey || '') + '">' + w.code + '</span>';
        }).join('');
        row.style.fontFamily = "'" + fam + "', 'Amiri', serif";
        row.innerHTML = words;   // PUA glyphs — must be innerHTML
      }
      pageEl.appendChild(row);
    });

    var footer = document.createElement('div'); footer.className = 'mushaf-foot';
    footer.textContent = 'Page ' + model.page +
      (model.juz ? ' · Juz ' + model.juz : '') + (model.hizb ? ' · Hizb ' + model.hizb : '');
    sheet.appendChild(pageEl); sheet.appendChild(footer);
    h.innerHTML = ''; h.appendChild(sheet);
    requestAnimationFrame(function () { fitToHeight(sheet); });
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
        renderModel(res[0], variant);
        try { localStorage.setItem('ii-quran-mushaf-page', String(page)); } catch (e) {}
        if (page < core.PAGE_MAX) ensureFont(page + 1, variant).catch(function () {}); // prefetch next
      })
      .catch(function (e) { console.warn('[mushaf] page ' + page + ' failed:', e && e.message); showError(); });
  };

  window.mushafChangePage = function (dir) { window.mushafGoToPage(state.page + dir); };

  window.II = window.II || {};
  window.II.mushaf = {
    current: function () { return state.page; },
    isActive: function () { return state.active; },
    _setActive: function (b) { state.active = !!b; },
    _variant: function () { return state.variant; },
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
