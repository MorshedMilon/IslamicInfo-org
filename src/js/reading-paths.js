/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — reading-paths.js  (Module 17, US-H22) — DOM layer.
   Fetches src/data/hadith/reading-paths.json, renders the sidebar
   Reading Paths section (first 3 rows + "View all →") and the deep-view
   reading-path strip, and owns all localStorage I/O. All decisions come
   from window.II.readingPaths (reading-paths-core.js).

   Curation-deferred posture: seed paths have empty hadithRefs, so every
   row renders the "Coming soon" state and the strip never mounts. The
   continue/complete/strip paths are built + covered by core unit tests
   against mocked populated paths, ready for the future curation task.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var core = (window.II && window.II.readingPaths) || null;
  if (!core) return;

  var SEED_URL = 'src/data/hadith/reading-paths.json';
  var STORAGE_KEY = 'islamicinfo-hadith-paths';
  var LIST_ID = 'reading-paths-list';
  var VISIBLE = 3; // sidebar shows first 3; rest behind "View all →"

  var paths = [];
  var expanded = false;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function loadStore() {
    var raw = null;
    try { raw = window.localStorage.getItem(STORAGE_KEY); } catch (e) {}
    return core.parseStoredPaths(raw);
  }

  // (used by the future curated Continue/Next flow; dormant for empty seed)
  function markRead(slug, id) {
    var store = loadStore();
    store[slug] = core.mergeReadRefs(store[slug], [id]);
    try { window.localStorage.setItem(STORAGE_KEY, core.serializeStoredPaths(store)); } catch (e) {}
  }

  function ringSVG(vm) {
    var stroke = vm.accent === 'gold' ? 'var(--gold-500)' : 'var(--teal-700)';
    return (
      '<div class="path-ring">' +
        '<svg viewBox="0 0 28 28" fill="none" width="28" height="28" aria-hidden="true">' +
          '<circle cx="14" cy="14" r="12" stroke="rgba(0,105,110,.15)" stroke-width="2.5"/>' +
          '<circle cx="14" cy="14" r="12" stroke="' + stroke + '" stroke-width="2.5" ' +
            'stroke-dasharray="' + vm.ring.dashArray.toFixed(2) + '" ' +
            'stroke-dashoffset="' + vm.ring.dashOffset.toFixed(2) + '" ' +
            'stroke-linecap="round" transform="rotate(-90 14 14)"/>' +
        '</svg>' +
        '<span class="path-ring-text">' + vm.percent + '%</span>' +
      '</div>'
    );
  }

  function continueControl(vm) {
    if (vm.continueState === 'coming-soon') {
      return '<span class="path-continue path-continue--soon" aria-disabled="true">Coming soon</span>';
    }
    if (vm.continueState === 'complete') {
      return '<span class="path-continue path-continue--done">Path complete ✓</span>';
    }
    return '<button class="path-continue" type="button" data-path-continue="' + esc(vm.slug) + '">Continue →</button>';
  }

  function rowHTML(path, readSet) {
    var vm = core.pathRowViewModel(path, readSet);
    return (
      '<div class="reading-path-row" data-path-slug="' + esc(vm.slug) + '">' +
        ringSVG(vm) +
        '<div class="reading-path-meta">' +
          '<div class="reading-path-name">' + esc(vm.name) + '</div>' +
          '<div class="reading-path-count">' + esc(vm.countLabel) + '</div>' +
        '</div>' +
        continueControl(vm) +
      '</div>'
    );
  }

  function render() {
    var list = document.getElementById(LIST_ID);
    if (!list) return;
    var store = loadStore();
    var shown = expanded ? paths : paths.slice(0, VISIBLE);
    var html = shown.map(function (p) {
      return rowHTML(p, core.readSetFor(store, p.slug));
    }).join('');
    if (!expanded && paths.length > VISIBLE) {
      html += '<button class="reading-path-viewall" type="button" id="reading-paths-viewall">View all →</button>';
    }
    list.innerHTML = html;
    var viewall = document.getElementById('reading-paths-viewall');
    if (viewall) viewall.addEventListener('click', function () { expanded = true; render(); });
    // Continue buttons are inert for the deferred seed (no rows emit them),
    // but wire them for the future curated data path.
    list.querySelectorAll('[data-path-continue]').forEach(function (btn) {
      btn.addEventListener('click', function () { openNextUnread(btn.getAttribute('data-path-continue')); });
    });
  }

  function openNextUnread(slug) {
    var path = paths.filter(function (p) { return p.slug === slug; })[0];
    if (!path) return;
    var next = core.nextUnread(path, core.readSetFor(loadStore(), slug));
    if (!next) return; // complete or empty
    // Path-based route (see hadith.js routePath/parseRoute): /hadith/[collection]/[book]/[hadith].
    location.href = '/hadith/' + next.collection + '/' + next.book + '/' + next.hadith;
  }

  function init() {
    var list = document.getElementById(LIST_ID);
    if (!list) return;
    fetch(SEED_URL)
      .then(function (r) { return r.json(); })
      .then(function (data) { paths = (data && data.paths) || []; render(); })
      .catch(function () { list.innerHTML = ''; }); // silent: sidebar section simply stays empty
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.II = window.II || {};
  window.II.readingPathsDOM = { render: render, markRead: markRead };
})();
