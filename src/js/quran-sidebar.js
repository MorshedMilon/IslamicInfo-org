/* IslamicInfo.org — quran-sidebar.js
   DOM controller for the Quran Explorer sidebar (Module 1).
   Depends on: window.II.sidebarCore (quran-sidebar-core.js) loaded first. */
(function () {
  'use strict';

  var core = window.II && window.II.sidebarCore;
  var CACHE_KEY = 'ii-quran-chapters';
  var API_URL   = 'https://api.quran.com/api/v4/chapters?language=en';
  var SEED_URL  = 'src/data/chapters.json';

  var chapters = [];        // normalized Chapter[]
  var currentQuery = '';
  var currentFilter = 'all';
  var activeId = null;       // id of selected surah — re-applied on every re-render

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function sbList() { return document.getElementById('sbList'); }

  // ---- cache ----------------------------------------------------------------
  function readCache() {
    try {
      var raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var obj = JSON.parse(raw);
      if (!obj || !Array.isArray(obj.data)) return null;
      return obj;
    } catch (e) {
      try { localStorage.removeItem(CACHE_KEY); } catch (_) {}
      return null;
    }
  }
  function writeCache(data) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ fetchedAt: Date.now(), data: data })); }
    catch (e) { /* quota/unavailable — render still proceeds */ }
  }

  // ---- fetch ----------------------------------------------------------------
  function fetchChapters() {
    var ctrl = new AbortController();
    var t = setTimeout(function () { ctrl.abort(); }, 8000); // TechSpec §5.2: 8s
    return fetch(API_URL, { signal: ctrl.signal })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (j) {
        var list = (j.chapters || []).map(core.normalizeChapter).filter(Boolean);
        if (list.length < 1) throw new Error('empty chapters');
        return list;
      })
      .finally(function () { clearTimeout(t); });
  }
  function fetchSeed() {
    return fetch(SEED_URL).then(function (r) {
      if (!r.ok) throw new Error('seed HTTP ' + r.status);
      return r.json();
    }).then(function (arr) { return arr.map(core.normalizeChapter).filter(Boolean); });
  }

  // ---- render ---------------------------------------------------------------
  function clearRows() {
    var list = sbList(); if (!list) return;
    Array.prototype.slice.call(list.querySelectorAll('.surah-row, .sb-skeleton, .sb-empty, .sb-nomatch'))
      .forEach(function (n) { n.parentNode.removeChild(n); });
  }
  function insertPoint() {
    var list = sbList();
    return list ? list.querySelector('.sb-divider') : null; // rows go before divider
  }
  function buildRow(ch) {
    var type = core.revelationToType(ch.revelation_place);
    var row = document.createElement('div');
    row.className = 'surah-row';
    if (activeId != null && ch.id === activeId) row.classList.add('active');
    row.setAttribute('role', 'button');
    row.setAttribute('tabindex', '0');
    row.setAttribute('aria-label', ch.name_simple + ', ' + ch.verses_count + ' ayahs, ' + core.typeToLabel(type));
    row.dataset.id = String(ch.id);
    row.dataset.slug = ch.slug;
    row.dataset.type = type;
    row.dataset.name = ch.name_simple;
    row.dataset.ar = ch.name_arabic;
    row.dataset.meta = ch.verses_count + ' Ayahs';
    row.dataset.letter = (ch.name_arabic || '').charAt(0);

    var num = document.createElement('div');
    num.className = 'surah-num'; num.textContent = String(ch.id);

    var info = document.createElement('div'); info.className = 'surah-info';
    var en = document.createElement('div'); en.className = 'surah-en'; en.textContent = ch.name_simple;
    var metaRow = document.createElement('div'); metaRow.className = 'surah-meta-row';
    var chip = document.createElement('span');
    chip.className = 'surah-chip ' + core.typeToChipClass(type); chip.textContent = core.typeToLabel(type);
    var ayahs = document.createElement('span');
    ayahs.className = 'surah-ayahs'; ayahs.textContent = '· ' + ch.verses_count + ' ayahs';
    metaRow.appendChild(chip); metaRow.appendChild(ayahs);
    info.appendChild(en); info.appendChild(metaRow);

    var ar = document.createElement('div'); ar.className = 'surah-ar'; ar.textContent = ch.name_arabic;

    row.appendChild(num); row.appendChild(info); row.appendChild(ar);

    row.addEventListener('click', function () { window.selectSurah(row); });
    row.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); window.selectSurah(row); }
    });
    return row;
  }
  function renderRows(list) {
    var container = sbList(); if (!container) return;
    clearRows();
    var frag = document.createDocumentFragment();
    list.forEach(function (ch) { frag.appendChild(buildRow(ch)); });
    var before = insertPoint();
    if (before) container.insertBefore(frag, before); else container.appendChild(frag);
    applyVisibility();
  }
  function renderSkeleton() {
    var container = sbList(); if (!container) return;
    clearRows();
    var frag = document.createDocumentFragment();
    for (var i = 0; i < 8; i++) {
      var s = document.createElement('div');
      s.className = 'surah-row sb-skeleton';
      s.setAttribute('aria-hidden', 'true');
      s.style.pointerEvents = 'none';
      s.innerHTML = '<div class="surah-num"></div><div class="surah-info">' +
        '<div class="surah-en">&nbsp;</div><div class="surah-meta-row">' +
        '<span class="surah-chip">&nbsp;</span></div></div><div class="surah-ar"></div>';
      s.style.opacity = '0.5';
      frag.appendChild(s);
    }
    var before = insertPoint();
    if (before) container.insertBefore(frag, before); else container.appendChild(frag);
  }
  function renderEmpty() {
    var container = sbList(); if (!container) return;
    clearRows();
    var box = document.createElement('div');
    box.className = 'sb-empty';
    box.style.cssText = 'padding:16px 14px;font-size:12px;color:var(--ink-muted);';
    box.innerHTML = 'Couldn’t load the surah list. ' +
      '<button type="button" class="sb-retry" style="margin-top:8px;display:block;' +
      'font:inherit;font-size:12px;color:var(--teal-700);background:transparent;' +
      'border:.5px solid var(--teal-200);border-radius:8px;padding:6px 12px;cursor:pointer;">Retry</button>';
    box.querySelector('.sb-retry').addEventListener('click', initSidebar);
    var before = insertPoint();
    if (before) container.insertBefore(box, before); else container.appendChild(box);
  }

  // ---- visibility (search + filter) -----------------------------------------
  function applyVisibility() {
    var rows = sbList() ? sbList().querySelectorAll('.surah-row:not(.sb-skeleton)') : [];
    var shown = 0;
    Array.prototype.forEach.call(rows, function (row) {
      var id = Number(row.dataset.id);
      var ch = chapters.filter(function (c) { return c.id === id; })[0];
      if (!ch) { row.style.display = ''; return; }
      var vis = core.matchesSearch(ch, currentQuery) && core.matchesFilter(ch, currentFilter);
      row.style.display = vis ? '' : 'none';
      if (vis) shown++;
    });
    toggleNoMatch(shown === 0 && chapters.length > 0);
  }
  function toggleNoMatch(on) {
    var container = sbList(); if (!container) return;
    var existing = container.querySelector('.sb-nomatch');
    if (on && !existing) {
      var n = document.createElement('div');
      n.className = 'sb-nomatch';
      n.style.cssText = 'padding:12px 14px;font-size:12px;color:var(--ink-subtle);';
      n.textContent = 'No surahs match.';
      var before = insertPoint();
      if (before) container.insertBefore(n, before); else container.appendChild(n);
    } else if (!on && existing) {
      existing.parentNode.removeChild(existing);
    }
  }

  // ---- init -----------------------------------------------------------------
  function useData(list) { chapters = list; renderRows(list); applyUrlSurah(); }

  function initSidebar() {
    if (!core || !sbList()) return;
    var cached = readCache();
    if (cached && core.isFresh(cached.fetchedAt, Date.now())) {
      var norm = cached.data.map(core.normalizeChapter).filter(Boolean);
      if (norm.length) {
        useData(norm);
        fetchChapters().then(function (fresh) { writeCache(fresh); chapters = fresh; renderRows(fresh); })
          .catch(function () { /* keep cached */ });
        return;
      }
      /* cache present but unusable — fall through to fetch path */
    }
    renderSkeleton();
    fetchChapters()
      .then(function (fresh) { writeCache(fresh); useData(fresh); })
      .catch(function (e) {
        console.warn('[quran] chapters API failed, using seed:', e && e.message);
        return fetchSeed().then(useData);
      })
      .catch(function (e) {
        console.warn('[quran] seed failed:', e && e.message);
        renderEmpty();
      });
  }

  // ---- global overrides (reassign the locked page's inline demo fns) --------
  window.filterSurahs = function (value) {
    currentQuery = value || '';
    applyVisibility();
  };

  window.filterReveal = function (type, btn) {
    currentFilter = type || 'all';
    Array.prototype.forEach.call(document.querySelectorAll('.sb-filter'),
      function (b) { b.classList.remove('on'); });
    if (btn) btn.classList.add('on');
    applyVisibility();
  };

  // Minimal Module-1 hook; Module 2 replaces the body with real verse fetch.
  window.loadSurah = window.loadSurah || function (id) {
    /* Module 2: fetch + render verses for `id` here. */
  };

  window.selectSurah = function (row, name, ar, meta, type, letter) {
    if (!row) return;
    name   = name   || row.dataset.name;
    ar     = ar     || row.dataset.ar;
    meta   = meta   || row.dataset.meta;
    type   = type   || (row.dataset.type === 'makki' ? 'Makki' : 'Madani');
    letter = letter || row.dataset.letter || '';
    var id   = Number(row.dataset.id) || null;
    var slug = row.dataset.slug || (name ? core.slugify(name) : '');

    activeId = id;
    Array.prototype.forEach.call(document.querySelectorAll('.surah-row'),
      function (r) { r.classList.remove('active'); });
    row.classList.add('active');

    var set = function (sel, txt) { var el = $(sel); if (el) el.textContent = txt; };
    set('#bcTitle', name + ' · ' + ar);
    set('#bcType', type);
    set('#bcMeta', meta + ' · Juz 1');
    set('#apSurah', name + ' · ' + ar);
    set('#apArt', letter);
    var mName = $('.mushaf-surah-name'); if (mName) mName.textContent = 'سورة ' + ar;
    var mPage = $('.mushaf-page-num'); if (mPage) mPage.textContent = 'Page 1 · Juz 1 · ' + name;

    if (typeof window.masterStop === 'function') window.masterStop();

    if (slug) {
      try { history.pushState({ surah: id, slug: slug }, '', '?surah=' + slug); } catch (e) {}
    }
    if (typeof window.showToast === 'function') window.showToast('Loading ' + name + '…');
    window.loadSurah(id);

    // Jump to the reader (skip the hero) whenever a surah is explicitly selected —
    // sidebar click, ?surah= deep-link, or history nav. Mirrors the hadith page.
    // Fresh /quran.html loads render the default surah via loadSurah() directly (not
    // selectSurah), so the hero stays available for users who arrive that way.
    // scroll-margin-top:60px on .reader-shell clears the sticky site header.
    var shell = document.getElementById('readerShell');
    if (shell) shell.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  function selectSurahBySlug(slug) {
    if (!slug) return false;
    var row = document.querySelector('.surah-row[data-slug="' + slug + '"]');
    if (row) { window.selectSurah(row); return true; }
    return false;
  }

  function applyUrlSurah() {
    var params = new URLSearchParams(window.location.search);
    var slug = params.get('surah');
    if (slug && selectSurahBySlug(slug)) return;
    // default: Al-Fatihah (id 1) — set active only, no URL push, no toast spam
    var first = document.querySelector('.surah-row[data-id="1"]');
    if (first) { activeId = 1; first.classList.add('active'); }
    if (typeof window.loadSurah === 'function') window.loadSurah(1); // Module 2: render default surah
  }

  window.addEventListener('popstate', function () {
    var params = new URLSearchParams(window.location.search);
    var slug = params.get('surah');
    if (slug) selectSurahBySlug(slug);
  });

  // expose for Task 6 to extend + for tests/manual
  window.II = window.II || {};
  window.II.quranSidebar = {
    init: initSidebar,
    getChapters: function () { return chapters; },
    setQuery: function (q) { currentQuery = q; applyVisibility(); },
    setFilter: function (f) { currentFilter = f; applyVisibility(); },
    _applyVisibility: applyVisibility
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSidebar);
  } else { initSidebar(); }
})();
