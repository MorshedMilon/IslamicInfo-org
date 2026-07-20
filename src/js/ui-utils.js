/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — ui-utils.js
   Shared, framework-free UI utilities. Loaded as a classic <script>
   (attaches to window.II.ui) or required/imported in tests
   (module.exports) — same UMD pattern as api.js. Pure helpers are
   unit-tested; DOM helpers no-op safely outside a browser. Adds NO
   markup to any page.
   ═══════════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  function escapeHTML(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function safeParse(raw, fallback) {
    if (fallback === undefined) fallback = null;
    try { return raw == null ? fallback : JSON.parse(raw); } catch (_) { return fallback; }
  }

  function safeLocalStorageGet(key, fallback) {
    if (fallback === undefined) fallback = null;
    try { return safeParse(localStorage.getItem(key), fallback); } catch (_) { return fallback; }
  }

  function safeLocalStorageSet(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (e) {
      if (e && e.name === 'QuotaExceededError') showToast('Storage full — clear some bookmarks or notes.');
      return false;
    }
  }

  async function apiFetchWithTimeout(url, opts) {
    opts = opts || {};
    var timeoutMs = opts.timeoutMs || 8000;
    var rest = Object.assign({}, opts); delete rest.timeoutMs;
    var ctrl = new AbortController();
    var t = setTimeout(function () { ctrl.abort(); }, timeoutMs);
    try { return await fetch(url, Object.assign({}, rest, { signal: ctrl.signal })); }
    finally { clearTimeout(t); }
  }

  function showToast(msg) {
    if (typeof document === 'undefined') return;
    var t = document.getElementById('hadith-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'hadith-toast';
      t.style.cssText = 'position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(12px);' +
        'background:var(--teal-900);color:rgba(255,255,255,.9);padding:10px 22px;border-radius:20px;font-size:13px;' +
        'font-weight:500;z-index:9999;opacity:0;transition:opacity .28s,transform .28s;pointer-events:none;' +
        'white-space:nowrap;box-shadow:0 8px 24px rgba(0,0,0,.25);';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = '1'; t.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(t._timer);
    t._timer = setTimeout(function () {
      t.style.opacity = '0'; t.style.transform = 'translateX(-50%) translateY(12px)';
    }, 2200);
  }

  function renderLoadingState(el, count) {
    if (!el) return;
    count = count || 3;
    var out = '';
    for (var i = 0; i < count; i++) {
      out += '<div class="hadith-card" aria-hidden="true" style="opacity:.5;"><div class="hadith-teal-bar"></div>' +
        '<div class="hadith-inner"><div style="height:14px;width:40%;background:rgba(0,105,110,.1);border-radius:6px;margin-bottom:14px;"></div>' +
        '<div style="height:60px;background:rgba(0,105,110,.06);border-radius:10px;"></div></div></div>';
    }
    el.innerHTML = out;
  }

  function renderErrorState(el, message, onRetry) {
    if (!el) return;
    el.innerHTML = '<div class="hadith-card"><div class="hadith-inner" style="text-align:center;padding:32px;">' +
      '<div style="color:var(--ink-muted);margin-bottom:14px;">' + escapeHTML(message) + '</div>' +
      '<button class="footer-action-btn primary" id="hadith-retry-btn">Try again</button></div></div>';
    var btn = el.querySelector('#hadith-retry-btn');
    if (btn && onRetry) btn.addEventListener('click', onRetry);
  }

  function focusTrap(container) {
    if (!container) return function () {};
    var sel = 'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])';
    function onKey(e) {
      if (e.key !== 'Tab') return;
      var items = Array.prototype.slice.call(container.querySelectorAll(sel)).filter(function (n) { return n.offsetParent !== null; });
      if (!items.length) return;
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    container.addEventListener('keydown', onKey);
    return function () { container.removeEventListener('keydown', onKey); };
  }

  var ui = {
    escapeHTML: escapeHTML,
    safeParse: safeParse,
    safeLocalStorageGet: safeLocalStorageGet,
    safeLocalStorageSet: safeLocalStorageSet,
    apiFetchWithTimeout: apiFetchWithTimeout,
    showToast: showToast,
    renderLoadingState: renderLoadingState,
    renderErrorState: renderErrorState,
    focusTrap: focusTrap,
  };

  /* Support both ES module (if bundled later) and plain <script> — mirrors api.js */
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ui;
  } else {
    root.II = root.II || {};
    root.II.ui = ui;
  }

}(typeof globalThis !== 'undefined' ? globalThis : window));
