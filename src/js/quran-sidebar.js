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
        clearTimeout(t);
        var list = (j.chapters || []).map(core.normalizeChapter).filter(Boolean);
        if (list.length < 1) throw new Error('empty chapters');
        return list;
      });
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
    Array.prototype.slice.call(list.querySelectorAll('.surah-row, .sb-skeleton, .sb-empty'))
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
      useData(norm);
      fetchChapters().then(function (fresh) { writeCache(fresh); chapters = fresh; renderRows(fresh); })
        .catch(function () { /* keep cached */ });
      return;
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

  // placeholder hooks — defined fully in Task 6
  window.selectSurah = window.selectSurah || function () {};
  function applyUrlSurah() {}   // replaced in Task 6

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
