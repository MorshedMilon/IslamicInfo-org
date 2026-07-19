/* QuranlyAI — always-loaded controller. Exposes window.QuranlyAI, defines
   <quranly-floating-button>, and lazy-loads the panel on first open. Pure logic
   lives in quranly-ai-core.js (window.II.quranlyCore). */
(function () {
  'use strict';
  var core = (window.II && window.II.quranlyCore) || {};
  var SELF_SRC = (document.currentScript && document.currentScript.src) || '';
  // Propagate a ?v=<version> cache-buster (if this script was loaded with one) to the
  // lazily-loaded panel + CSS, so a version bump forces fresh copies everywhere.
  var VER = (SELF_SRC.match(/[?&]v=([^&]+)/) || [])[1];
  var Q = VER ? ('?v=' + VER) : '';
  var BASE = SELF_SRC.replace(/[?#].*$/, '');             // drop any query/hash
  var JS_DIR = BASE.replace(/[^/]*$/, '');                // .../src/js/
  var CSS_URL = JS_DIR.replace(/\/js\/$/, '/css/') + 'quranly-ai.css' + Q;
  var PANEL_URL = JS_DIR + 'quranly-ai-panel.js' + Q;

  var state = {
    inited: false,
    config: { apiBase: 'https://api.islamicinfo.org', maxPerDay: 3, cssUrl: CSS_URL },
    anonId: null,
    context: {},
    panelLoading: false,
    pending: []
  };

  /* ---- floating button web component ---- */
  var FAB_CSS =
    ':host{position:fixed;right:18px;bottom:24px;z-index:900;font-family:var(--font-body,Inter,system-ui,sans-serif);}' +
    'button{display:inline-flex;align-items:center;gap:8px;border:0;cursor:pointer;border-radius:999px;' +
    'padding:12px 18px;font-size:.9rem;font-weight:600;color:#1a1204;' +
    'background:linear-gradient(135deg,var(--gold-400,#D9B358),var(--gold-500,#C5A059));' +
    'box-shadow:var(--gold-aura,0 8px 24px rgba(197,160,89,.4));}' +
    '.label{white-space:nowrap;}' +
    '@media (max-width:480px){button{padding:12px;}.label{display:none;}}';

  function FloatingButton() { return Reflect.construct(HTMLElement, [], FloatingButton); }
  FloatingButton.prototype = Object.create(HTMLElement.prototype);
  FloatingButton.prototype.constructor = FloatingButton;
  FloatingButton.prototype.connectedCallback = function () {
    var sh = this.shadowRoot || this.attachShadow({ mode: 'open' });
    sh.innerHTML = '<style>' + FAB_CSS + '</style>' +
      '<button type="button" aria-label="Ask QuranlyAI"><span aria-hidden="true">✨</span>' +
      '<span class="label">Ask QuranlyAI</span></button>';
    var self = this;
    sh.querySelector('button').addEventListener('click', function () { window.QuranlyAI.open(); });
    this._reposition();
    this._onResize = function () { self._reposition(); };
    window.addEventListener('resize', this._onResize);
  };
  FloatingButton.prototype.disconnectedCallback = function () {
    if (this._onResize) window.removeEventListener('resize', this._onResize);
  };
  FloatingButton.prototype._reposition = function () {
    var bar = document.getElementById('audio-player') || document.querySelector('.audio-player');
    var rect = bar ? bar.getBoundingClientRect() : null;
    var bottom = core.fabBottomOffset(
      rect && rect.height ? { top: rect.top } : null,
      window.innerHeight, 24, 12
    );
    this.style.bottom = bottom + 'px';
    this.style.position = 'fixed';
    this.style.right = '18px';
    this.style.zIndex = '900';
  };
  if (!customElements.get('quranly-floating-button')) {
    customElements.define('quranly-floating-button', FloatingButton);
  }

  /* ---- lazy panel loader ---- */
  function ensurePanel(cb) {
    if (customElements.get('quranly-panel')) { mountPanel(); if (cb) cb(); return; }
    state.pending.push(cb);
    if (state.panelLoading) return;
    state.panelLoading = true;
    var s = document.createElement('script');
    s.src = PANEL_URL;
    s.onload = function () {
      mountPanel();
      state.panelLoading = false;
      var q = state.pending.slice(); state.pending.length = 0;
      q.forEach(function (fn) { if (fn) fn(); });
    };
    s.onerror = function () { state.panelLoading = false; console.error('[QuranlyAI] panel failed to load'); };
    document.head.appendChild(s);
  }
  function panelEl() { return document.querySelector('quranly-panel'); }
  function mountPanel() {
    if (!panelEl()) document.body.appendChild(document.createElement('quranly-panel'));
  }

  /* ---- public API ---- */
  window.QuranlyAI = {
    init: function (config) {
      if (state.inited) return;
      Object.assign(state.config, config || {});
      try { state.anonId = core.getOrCreateAnonId(window.localStorage); } catch (e) { state.anonId = 'anon-nostore'; }
      if (!document.querySelector('quranly-floating-button')) {
        document.body.appendChild(document.createElement('quranly-floating-button'));
      }
      state.inited = true;
    },
    setContext: function (ctx) { state.context = ctx || {}; },
    getState: function () { return state; }, // used by the panel component
    open: function (prefilledAction) {
      ensurePanel(function () {
        var p = panelEl();
        if (p && p.openPanel) p.openPanel(state.context, prefilledAction || null);
      });
    },
    close: function () { var p = panelEl(); if (p && p.closePanel) p.closePanel(); },
    ask: function (action, customQuestion) {
      ensurePanel(function () {
        var p = panelEl();
        if (p && p.runAsk) { if (p.openPanel) p.openPanel(state.context, null); p.runAsk(action, customQuestion || ''); }
      });
    },
    renderContextButton: function (targetElementId, label, defaultAction) {
      var host = document.getElementById(targetElementId);
      if (!host) { console.warn('[QuranlyAI] renderContextButton: #' + targetElementId + ' not found'); return; }
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'qa-context-btn';
      btn.textContent = label;
      btn.style.cssText = 'cursor:pointer;border:.5px solid var(--gold-500,#C5A059);background:transparent;' +
        'color:var(--ink-primary,#0F2A2C);border-radius:999px;padding:4px 10px;font:inherit;font-size:.85em;';
      btn.addEventListener('click', function () { window.QuranlyAI.open(defaultAction); });
      host.appendChild(btn);
      return btn;
    }
  };
})();
