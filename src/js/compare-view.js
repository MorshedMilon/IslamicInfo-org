/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — compare-view.js  (Module 15)
   DOM controller for the Comparison Mode overlay. Host-injected by
   hadith.js init(). Reuses II.ui.focusTrap + the trace-view Escape/
   focus-return + skipNav reconcile pattern. Fetches each ref fresh on
   open (deep-link/share safe); honest empty/error states, never a
   silent blank. Ships live (no flag) — reformats authenticated data only.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var II = window.II || {};
  var core = II.compareViewCore;
  var host = null;   // { ui, fetchHadithByRef, exitCompare, addMore }
  var state = { open: false, refs: [], hadiths: [], lastFocus: null };

  function el(id) { return document.getElementById(id); }
  function overlay() { return el('compare-overlay'); }

  function onKey(e) { if (e.key === 'Escape' && state.open) { e.preventDefault(); close(); } }

  function wireActs() {
    var ov = overlay(); if (!ov || ov.dataset.wired) return;
    ov.dataset.wired = '1';
    if (II.ui && II.ui.focusTrap) II.ui.focusTrap(ov);
    ov.addEventListener('click', function (e) {
      var exit = e.target.closest && e.target.closest('#compare-exit');
      if (exit) { close(); return; }
      var add = e.target.closest && e.target.closest('[data-cmp-add-more]');
      if (add) { close(); if (host && host.addMore) host.addMore(); return; }
      var rm = e.target.closest && e.target.closest('[data-cmp-remove]');
      if (rm) { removeRef(rm.getAttribute('data-cmp-remove')); return; }
    });
  }

  function isNarrow() { try { return window.matchMedia('(max-width:900px)').matches; } catch (_) { return false; } }

  function renderInto() {
    var header = el('compare-header'), body = el('compare-body');
    if (header) header.innerHTML = core.buildHeaderChipsHTML(state.hadiths);
    if (!body) return;
    if (!state.hadiths.length) { body.innerHTML = core.buildEmptyStateHTML('unfetchable'); return; }
    if (!core.canCompare(state.hadiths)) { body.innerHTML = core.buildEmptyStateHTML('need2'); return; }
    body.innerHTML = core.buildCompareHTML(state.hadiths);
    // DoD-3: on ≤900px the CSS hides all .cmp-col and shows only .cmp-tab-active, so we must
    // emit a tabbar and activate the first column; on wide screens columns show side-by-side.
    if (isNarrow()) applyTabs(body);
  }

  // Build a .cmp-tabbar (one button per column) and activate the first column.
  function applyTabs(body) {
    var cols = body.querySelectorAll('.cmp-col'); if (!cols.length) return;
    var bar = document.createElement('div'); bar.className = 'cmp-tabbar';
    cols.forEach(function (col, i) {
      var label = col.querySelector('.cmp-col-label');
      var btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'footer-action-btn cmp-tab-btn' + (i === 0 ? ' on' : '');
      btn.textContent = label ? label.textContent : ('Hadith ' + (i + 1));
      btn.setAttribute('data-cmp-tab', String(i));
      bar.appendChild(btn);
      col.classList.toggle('cmp-tab-active', i === 0);
    });
    var cont = body.querySelector('.cmp-cols');
    if (cont) cont.parentNode.insertBefore(bar, cont);
    bar.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-cmp-tab]'); if (!b) return;
      var idx = parseInt(b.getAttribute('data-cmp-tab'), 10);
      bar.querySelectorAll('.cmp-tab-btn').forEach(function (x, i) { x.classList.toggle('on', i === idx); });
      cols.forEach(function (col, i) { col.classList.toggle('cmp-tab-active', i === idx); });
    });
  }

  // Remove a ref via chip ×: rewrite ?refs= (replaceState, no history entry) and re-render.
  function removeRef(ref) {
    state.refs = core.removeRef(state.refs, ref);
    state.hadiths = state.hadiths.filter(function (h) { return refKey(h) !== ref; });
    syncUrl(true);
    renderInto();
  }
  function refKey(h) { h = h || {}; if (!h.collectionSlug || h.hadithNumber == null) return ''; return h.collectionSlug + ':' + (h.bookNumber == null ? 0 : h.bookNumber) + ':' + h.hadithNumber; }
  function syncUrl(replace) {
    var url = '/hadith/compare?refs=' + encodeURIComponent(core.serializeRefs(state.refs));
    try { if (replace) history.replaceState(history.state, '', url); else history.pushState(history.state, '', url); } catch (_) {}
  }

  async function open(refs, opts) {
    opts = opts || {};
    if (!core || !host) return;
    wireActs();
    state.lastFocus = document.activeElement;
    state.refs = (refs || []).slice(0, core.MAX_COMPARE);
    // Fetch each ref fresh (deep-link safe). Nulls dropped; honest state if <2 resolve.
    var fetched = [];
    for (var i = 0; i < state.refs.length; i++) {
      var h = host.fetchHadithByRef ? await host.fetchHadithByRef(state.refs[i]) : null;
      if (h) fetched.push(h);
    }
    state.hadiths = fetched;
    var ov = overlay(); if (!ov) return;
    state.open = true;
    renderInto();
    ov.hidden = false; ov.classList.add('open');
    var main = document.querySelector('.main'); if (main) main.setAttribute('aria-hidden', 'true');
    document.addEventListener('keydown', onKey);
    var first = el('compare-exit'); if (first) first.focus();
  }

  function close(opts) {
    opts = opts || {};
    var ov = overlay();
    if (ov) { ov.classList.remove('open'); ov.hidden = true; }
    var main = document.querySelector('.main'); if (main) main.removeAttribute('aria-hidden');
    document.removeEventListener('keydown', onKey);
    var lf = state.lastFocus;
    state.open = false; state.hadiths = []; state.refs = [];
    // skipNav: popstate reconcile is ALREADY rendering the target route → suppress our exit nav.
    if (!opts.skipNav && host && host.exitCompare) host.exitCompare();
    if (lf && lf.focus) { try { lf.focus(); } catch (_) {} }
  }

  function isOpen() { return state.open; }

  II.compareView = {
    init: function (h) { host = h; wireActs(); },
    open: open, close: close, isOpen: isOpen,
    _state: state,
  };
  window.II = II;
}());
