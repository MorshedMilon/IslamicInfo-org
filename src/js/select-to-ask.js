/* QuranlyAI — global "Select & Ask" menu. One tag on any page:
     <script src="src/js/select-to-ask.js?v=..."></script>
   Highlight text inside any [data-ai-selectable] container -> a floating Shadow-DOM
   menu appears at the selection -> the chosen action routes into window.QuranlyAI.
   Self-loads its pure core (select-to-ask-core.js) from the same folder. */
(function () {
  'use strict';
  var self = document.currentScript;
  var src = (self && self.src) || '';
  var q = (src.match(/[?&]v=[^&]+/) || [''])[0].replace(/^&/, '?');
  var dir = src.replace(/[?#].*$/, '').replace(/[^/]*$/, '');

  function boot() {
    var core = (window.II && window.II.selectCore) || {};
    var qcore = (window.II && window.II.quranlyCore) || {};
    if (!core.menuModel) { console.error('[select-to-ask] core did not load'); return; }

    var CSS =
      '.m{position:fixed;display:none;z-index:960;align-items:stretch;background:#0F2A2C;' +
      'border:.5px solid rgba(197,160,89,.4);border-radius:11px;overflow:hidden;' +
      'box-shadow:0 12px 34px rgba(0,0,0,.34);font:600 13px/1 var(--font-body,Inter,system-ui,sans-serif);}' +
      '.m.open{display:inline-flex;}' +
      '.mi{display:inline-flex;align-items:center;padding:10px 13px;color:#e9e3d5;white-space:nowrap;' +
      'cursor:pointer;border:0;background:transparent;border-right:.5px solid rgba(255,255,255,.08);}' +
      '.mi:last-child{border-right:0;}.mi:hover{background:rgba(255,255,255,.07);}';

    var host = document.createElement('div');
    host.setAttribute('data-qai-select', '1');
    var shadow = host.attachShadow({ mode: 'open' });
    shadow.innerHTML = '<style>' + CSS + '</style><div class="m" role="menu"></div>';
    var menuEl = shadow.querySelector('.m');
    document.body.appendChild(host);

    var current = null; // { attrs, text }

    function hide() { menuEl.classList.remove('open'); current = null; }

    function selectableAncestor(node) {
      var el = node ? (node.nodeType === 1 ? node : node.parentElement) : null;
      while (el) {
        if (el.getAttribute && el.getAttribute('data-ai-selectable')) return el;
        el = el.parentElement;
      }
      return null;
    }

    function readAttrs(el) {
      return {
        selectable: el.getAttribute('data-ai-selectable'),
        ref: el.getAttribute('data-ai-ref') || '',
        key: el.getAttribute('data-ai-key') || el.getAttribute('data-key') || ''
      };
    }

    function renderMenu(selectable) {
      menuEl.innerHTML = '';
      core.menuModel(selectable).forEach(function (it) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'mi'; b.textContent = it.label;
        b.addEventListener('mousedown', function (e) { e.preventDefault(); }); // keep selection alive
        b.addEventListener('click', function (e) { e.preventDefault(); pick(it.action); });
        menuEl.appendChild(b);
      });
    }

    function position(rect) {
      var mw = menuEl.offsetWidth || 260, mh = menuEl.offsetHeight || 42;
      var top = rect.top - mh - 8;
      if (top < 6) top = rect.bottom + 8;
      var left = rect.left + rect.width / 2 - mw / 2;
      left = Math.max(6, Math.min(left, window.innerWidth - mw - 6));
      menuEl.style.top = top + 'px';
      menuEl.style.left = left + 'px';
    }

    function onSelect() {
      var sel = window.getSelection && window.getSelection();
      if (!sel || sel.isCollapsed || !sel.rangeCount) { hide(); return; }
      var text = sel.toString();
      if (!core.eligible(text)) { hide(); return; }
      var a = selectableAncestor(sel.anchorNode), f = selectableAncestor(sel.focusNode);
      if (!a || a !== f) { hide(); return; }
      var rect = sel.getRangeAt(0).getBoundingClientRect();
      if (!rect || (!rect.width && !rect.height)) { hide(); return; }
      current = { attrs: readAttrs(a), text: text };
      renderMenu(current.attrs.selectable);
      menuEl.classList.add('open');
      position(rect);
    }

    function pick(action) {
      if (!current) return;
      var meta = core.buildMeta(current.attrs, current.text, Date.now());
      hide();
      try { window.getSelection().removeAllRanges(); } catch (e) {}
      if (window.QuranlyAI && window.QuranlyAI.route) window.QuranlyAI.route(action, meta);
    }

    var deb;
    function schedule() { clearTimeout(deb); deb = setTimeout(onSelect, 120); }

    document.addEventListener('mouseup', schedule);
    document.addEventListener('selectionchange', schedule);
    document.addEventListener('scroll', function () { if (current) hide(); }, true);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hide(); });
    document.addEventListener('mousedown', function (e) { if (current && e.target !== host && !host.contains(e.target)) hide(); });
    void qcore;
  }

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  if (window.II && window.II.selectCore) { ready(boot); return; }
  var s = document.createElement('script');
  s.src = dir + 'select-to-ask-core.js' + q;
  s.onload = function () { ready(boot); };
  s.onerror = function () { console.error('[select-to-ask] failed to load core'); };
  document.head.appendChild(s);
})();
