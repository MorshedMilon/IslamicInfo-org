/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — trace-view.js  (Module 14)
   DOM controller for the 3-column Hadith Trace View overlay.
   Host-injected by hadith.js init(). Reuses II.ui.focusTrap + the
   bookmarks-panel Escape/focus-return pattern; ships live (no flag).
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var II = window.II || {};
  var core = II.traceViewCore;
  var host = null;          // { ui, fetchHadithByRef, onTraceBookmark, onTraceShare, onTraceCopy, exitTrace }
  var state = { open: false, viaRoute: false, ref: null, route: null, hadith: null, lastFocus: null };

  function el(id) { return document.getElementById(id); }
  function overlay() { return el('trace-overlay'); }

  function onKey(e) { if (e.key === 'Escape' && state.open) { e.preventDefault(); close(); } }

  function wireActs() {
    var ov = overlay(); if (!ov || ov.dataset.wired) return;
    ov.dataset.wired = '1';
    if (II.ui && II.ui.focusTrap) II.ui.focusTrap(ov); // Tab-cycle (applied once)
    ov.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-trace-act], #trace-exit');
      if (!b) return;
      if (b.id === 'trace-exit') { close(); return; }
      var act = b.getAttribute('data-trace-act');
      if (!state.hadith || !host) return;
      if (act === 'bookmark') host.onTraceBookmark(state.hadith, b);
      else if (act === 'share') host.onTraceShare(state.hadith);
      else if (act === 'copy') host.onTraceCopy(state.hadith);
    });
  }

  function renderInto(hadith) {
    var bc = el('trace-breadcrumb'), layout = el('trace-layout');
    if (bc) bc.innerHTML = core.buildBreadcrumb(hadith);
    if (layout) layout.innerHTML = core.buildTraceHTML(hadith);
    // isnad rows with data-narrator-id are handled by the already-document-wired II.narratorPanelDom.
  }

  async function open(ref, opts) {
    opts = opts || {};
    if (!core || !host) return;
    wireActs();
    state.lastFocus = document.activeElement;
    var hadith = opts.hadith || (host.fetchHadithByRef ? await host.fetchHadithByRef(ref) : null);
    var ov = overlay(); if (!ov) return;
    state.open = true; state.viaRoute = !!opts.viaRoute; state.ref = ref; state.route = opts.route || null; state.hadith = hadith;
    if (hadith) renderInto(hadith);
    else { var l = el('trace-layout'); if (l) l.innerHTML = '<div class="dv-empty">This hadith could not be loaded. Please try again.</div>'; var bc = el('trace-breadcrumb'); if (bc) bc.textContent = ''; }
    ov.hidden = false; ov.classList.add('open');
    var main = document.querySelector('.main'); if (main) main.setAttribute('aria-hidden', 'true');
    document.addEventListener('keydown', onKey);
    var first = el('trace-exit'); if (first) first.focus();
  }

  function close(opts) {
    opts = opts || {};
    var ov = overlay();
    var exit = core ? core.resolveExitTarget({ viaRoute: state.viaRoute, route: state.route }) : { nav: false };
    if (ov) { ov.classList.remove('open'); ov.hidden = true; }
    var main = document.querySelector('.main'); if (main) main.removeAttribute('aria-hidden');
    document.removeEventListener('keydown', onKey);
    var lf = state.lastFocus;
    state.open = false; state.hadith = null; state.viaRoute = false; state.route = null; state.ref = null;
    // skipNav: caller (renderRoute reconcile during popstate) is ALREADY rendering the target,
    // so suppress exitTrace's redundant replaceState+renderRoute. The Exit button / Escape omit it.
    if (!opts.skipNav && exit.nav && host && host.exitTrace) host.exitTrace(exit.route); // route entry → sync URL to deep-view
    if (lf && lf.focus) { try { lf.focus(); } catch (_) {} }
  }

  function isOpen() { return state.open; }

  II.traceView = {
    init: function (h) { host = h; wireActs(); },
    open: open, close: close, isOpen: isOpen,
    _state: state,
  };
  window.II = II;
}());
