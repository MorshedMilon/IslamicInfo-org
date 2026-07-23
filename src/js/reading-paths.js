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
    if (window.II && II.track) II.track('reading_path_progress', { slug: slug });
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

  // i18n: emit data-i18n keys with the English text as inline fallback.
  // i18nApply() (below) translates in place if the key exists in the active
  // locale; apply() leaves the English fallback untouched when it doesn't —
  // so this is i18n-ready with zero behavior change until the locale files
  // gain the keys (the in-progress 10-language i18n pass owns that).
  function continueControl(vm, continueHref) {
    // 'continue' with no href = partially-curated path whose curated refs are all read
    // but targetCount not yet reached (nextUnread null) → honest "Coming soon", not a
    // dead <a href="">.
    if (vm.continueState === 'coming-soon' || (vm.continueState === 'continue' && !continueHref)) {
      return '<span class="path-continue path-continue--soon" aria-disabled="true" data-i18n="hadith.paths.comingSoon">Coming soon</span>';
    }
    if (vm.continueState === 'complete') {
      return '<span class="path-continue path-continue--done" data-i18n="hadith.paths.complete">Path complete ✓</span>';
    }
    return '<a class="path-continue" href="' + esc(continueHref) + '" data-i18n="hadith.paths.continue">Continue →</a>';
  }

  function rowHTML(path, readSet) {
    var vm = core.pathRowViewModel(path, readSet);
    // Continue target is snapshotted at render (rows re-render on load / view-all).
    // nextUnread can be null even in the 'continue' state when a path is partially
    // curated (hadithRefs.length < targetCount) and every curated ref is read — guard it,
    // else routeFor(null) throws and the whole sidebar fails to render.
    var nextRef = vm.continueState === 'continue' ? core.nextUnread(path, readSet) : null;
    var continueHref = nextRef ? routeFor(nextRef) : '';
    return (
      '<div class="reading-path-row" data-path-slug="' + esc(vm.slug) + '">' +
        ringSVG(vm) +
        '<div class="reading-path-meta">' +
          '<div class="reading-path-name" data-i18n="hadith.paths.name.' + esc(vm.slug) + '">' + esc(vm.name) + '</div>' +
          '<div class="reading-path-count">' + esc(vm.countLabel) + '</div>' +
        '</div>' +
        continueControl(vm, continueHref) +
      '</div>'
    );
  }

  // Translate any data-i18n nodes just injected into `root` (the i18n boot
  // pass only ran over static markup present at load).
  function i18nApply(root) {
    if (window.II && window.II.i18n && typeof window.II.i18n.apply === 'function') {
      window.II.i18n.apply(root);
    }
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
      html += '<button class="reading-path-viewall" type="button" id="reading-paths-viewall" data-i18n="hadith.paths.viewAll">View all →</button>';
    }
    list.innerHTML = html;
    i18nApply(list);
    var viewall = document.getElementById('reading-paths-viewall');
    if (viewall) viewall.addEventListener('click', function () { expanded = true; render(); });
  }

  // Path-based deep-view route (see hadith.js routePath/parseRoute):
  // /hadith/[collection]/[book]/[hadith], each segment encoded to match
  // routePath's encodeURIComponent contract.
  function routeFor(ref) {
    return '/hadith/' + encodeURIComponent(ref.collection) +
      '/' + encodeURIComponent(ref.book) + '/' + encodeURIComponent(ref.hadith);
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

  // ── deep-view reading-path strip ──────────────────────────────────
  // Renders ONLY when the given hadith ref belongs to an active path.
  // With the deferred seed no path has members, so this never mounts —
  // built + core-tested (pathIndexOf) for the future curated data.
  function findPathContaining(id) {
    for (var i = 0; i < paths.length; i++) {
      if (core.pathIndexOf(paths[i], id) != null) return paths[i];
    }
    return null;
  }

  // ref = { collection, book, hadith }; call from the deep-view painter.
  function mountStrip(ref) {
    var slot = document.getElementById('reading-path-strip-slot');
    if (!slot) return;
    var id = core.refId(ref);
    var path = findPathContaining(id);
    if (!path) { slot.innerHTML = ''; return; } // not in any path → hidden
    var n = core.pathIndexOf(path, id);
    var prev = path.hadithRefs[n - 2];
    var next = path.hadithRefs[n];
    function navBtn(key, label, ref) {
      if (ref) return '<a class="path-nav-btn" href="' + esc(routeFor(ref)) + '" data-i18n="' + key + '">' + label + '</a>';
      return '<span class="path-nav-btn" aria-disabled="true" data-i18n="' + key + '">' + label + '</span>';
    }
    slot.innerHTML =
      '<div class="reading-path-strip fade-up">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>' +
        '<span>Reading: <strong>' + esc(path.name) + '</strong> · Hadith ' + n + ' of ' + path.targetCount + '</span>' +
        '<div class="path-nav-btns">' +
          navBtn('hadith.path.prev', '← Previous', prev) +
          navBtn('hadith.path.next', 'Next →', next) +
        '</div>' +
      '</div>';
    i18nApply(slot);
  }

  // Mark a just-viewed hadith as read in whatever path contains it (advances the
  // progress ring + makes "Continue" open the next unread), then refresh the sidebar.
  // No-op if the ref belongs to no path. Called from the deep-view painter.
  function markReadForRef(ref) {
    var id = core.refId(ref);
    var path = findPathContaining(id);
    if (!path) return;
    markRead(path.slug, id);
    render();
  }

  window.II = window.II || {};
  window.II.readingPathsDOM = { render: render, markRead: markRead, mountStrip: mountStrip, markReadForRef: markReadForRef };
})();
