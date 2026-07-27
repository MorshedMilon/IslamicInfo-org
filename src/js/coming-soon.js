/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — coming-soon.js  (v1.0 · 2026-07)
   Reusable "Coming Soon" announcement, shown when a not-yet-ready
   call-to-action is clicked.

   WHY: several CTAs on some pages point at features that are still in
   progress. Rather than silently doing nothing (or leading to a dead
   link), a wired CTA honestly tells the visitor the feature is coming.
   No page content is removed or changed — only the click behaviour of
   the marked CTA.

   USAGE
     1. Include this script once, before </body>:
          <script src="src/js/coming-soon.js"></script>
     2. Mark any not-ready CTA with the attribute  data-coming-soon
        (works on <button> and <a>; the element's default action —
        navigation / form submit — is prevented).
     3. Or trigger it imperatively:  window.II.comingSoon.show();

   The MESSAGE lives in ONE place (below). Change it here and every
   wired CTA on every page updates.

   STYLING uses locked design-system tokens only, so it themes light/dark
   automatically and introduces no new colours or fonts. The single
   elevation token is named differently per page (--e4 on some, --elev-4
   on others), so the shadow falls back through both to a literal.
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── The single source of truth for the message ─────────────── */
  var ICON  = '🚧';
  var TITLE = 'Coming soon';
  var BODY  = 'Coming soon — our team is working on this feature to make ' +
              'sure it meets the quality you deserve. Thank you for your patience!';

  /* i18n: use the site helper when present, else the literal above */
  function tr(key, fallback) {
    if (window.II && typeof window.II.t === 'function') return window.II.t(key, fallback);
    return fallback;
  }

  /* ─── Scoped styles (tokens only + safe fallbacks) ───────────── */
  var CSS = [
    '.ii-cs-overlay{position:fixed;inset:0;z-index:9999;display:flex;',
    'align-items:center;justify-content:center;padding:20px;',
    'background:rgba(6,38,40,.52);backdrop-filter:blur(6px);',
    '-webkit-backdrop-filter:blur(6px);opacity:0;visibility:hidden;',
    'pointer-events:none;transition:opacity .3s var(--ease,ease),visibility .3s;}',
    '.ii-cs-overlay.open{opacity:1;visibility:visible;pointer-events:auto;}',

    '.ii-cs-card{position:relative;box-sizing:border-box;width:100%;',
    'max-width:460px;background:var(--surface-card,#FAFBFB);',
    'border:0.5px solid rgba(0,105,110,.16);border-radius:var(--r-xl,24px);',
    'box-shadow:var(--e4,var(--elev-4,0 24px 56px rgba(0,105,110,.16),0 8px 18px rgba(0,105,110,.08)));',
    'padding:clamp(28px,6vw,48px) clamp(22px,5vw,44px);text-align:center;',
    'transform:translateY(12px) scale(.97);opacity:0;',
    'transition:transform .34s var(--ease,cubic-bezier(.22,1,.36,1)),opacity .34s var(--ease,ease);}',
    '.ii-cs-overlay.open .ii-cs-card{transform:translateY(0) scale(1);opacity:1;}',

    '.ii-cs-icon{font-size:clamp(42px,9vw,58px);line-height:1;display:block;',
    'margin-bottom:16px;}',
    '.ii-cs-title{margin:0 0 10px;color:var(--ink-primary,#0F2A2C);',
    'font-size:clamp(20px,4.5vw,26px);font-weight:700;letter-spacing:-.01em;}',
    '.ii-cs-body{margin:0;color:var(--ink-muted,#3A4A4B);',
    'font-size:clamp(14px,3.4vw,16px);line-height:1.66;}',

    '.ii-cs-ok{margin-top:clamp(20px,4vw,28px);appearance:none;cursor:pointer;',
    'border:none;border-radius:999px;padding:11px 30px;',
    'font-size:14px;font-weight:600;font-family:inherit;color:var(--white,#fff);',
    'background:var(--teal-700,#00696E);',
    'transition:transform .2s var(--ease,ease),filter .2s;}',
    '.ii-cs-ok:hover{filter:brightness(1.06);transform:translateY(-1px);}',
    '.ii-cs-ok:focus-visible{outline:2px solid var(--teal-500,#2CA4AB);outline-offset:2px;}',

    '.ii-cs-x{position:absolute;top:12px;right:12px;width:34px;height:34px;',
    'display:flex;align-items:center;justify-content:center;cursor:pointer;',
    'border:none;background:transparent;border-radius:50%;',
    'color:var(--ink-muted,#3A4A4B);font-size:20px;line-height:1;',
    'transition:background .2s;}',
    '.ii-cs-x:hover{background:rgba(0,105,110,.08);}',
    '.ii-cs-x:focus-visible{outline:2px solid var(--teal-500,#2CA4AB);outline-offset:2px;}',

    '@media (prefers-reduced-motion:reduce){',
    '.ii-cs-overlay,.ii-cs-card,.ii-cs-ok{transition:none;}',
    '.ii-cs-card{transform:none;}}'
  ].join('');

  var overlay = null;   // built lazily on first show
  var lastFocus = null; // element to restore focus to on close

  function injectStyleOnce() {
    if (document.getElementById('ii-cs-style')) return;
    var s = document.createElement('style');
    s.id = 'ii-cs-style';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function build() {
    injectStyleOnce();

    overlay = document.createElement('div');
    overlay.className = 'ii-cs-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'ii-cs-title');
    overlay.setAttribute('aria-describedby', 'ii-cs-body');

    var card = document.createElement('div');
    card.className = 'ii-cs-card';

    var xBtn = document.createElement('button');
    xBtn.type = 'button';
    xBtn.className = 'ii-cs-x';
    xBtn.setAttribute('aria-label', tr('js.comingSoon.close', 'Close'));
    xBtn.innerHTML = '&times;';

    var icon = document.createElement('span');
    icon.className = 'ii-cs-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = ICON;

    var h = document.createElement('h2');
    h.className = 'ii-cs-title';
    h.id = 'ii-cs-title';
    h.textContent = tr('js.comingSoon.title', TITLE);

    var p = document.createElement('p');
    p.className = 'ii-cs-body';
    p.id = 'ii-cs-body';
    p.textContent = tr('js.comingSoon.body', BODY);

    var ok = document.createElement('button');
    ok.type = 'button';
    ok.className = 'ii-cs-ok';
    ok.textContent = tr('js.comingSoon.ok', 'Got it');

    card.appendChild(xBtn);
    card.appendChild(icon);
    card.appendChild(h);
    card.appendChild(p);
    card.appendChild(ok);
    overlay.appendChild(card);
    document.body.appendChild(overlay);

    /* Dismiss wiring */
    xBtn.addEventListener('click', hide);
    ok.addEventListener('click', hide);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) hide();          // backdrop click only
    });
    /* Basic focus trap: keep Tab inside the card */
    overlay.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { hide(); return; }
      if (e.key !== 'Tab') return;
      var f = [xBtn, ok];
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    overlay._ok = ok;
    return overlay;
  }

  function show() {
    if (!overlay) build();
    lastFocus = document.activeElement;
    overlay.classList.add('open');
    document.documentElement.style.overflow = 'hidden';   // lock scroll
    /* focus the primary action after the open transition begins */
    var ok = overlay._ok;
    if (ok) window.requestAnimationFrame(function () { ok.focus(); });
  }

  function hide() {
    if (!overlay) return;
    overlay.classList.remove('open');
    document.documentElement.style.overflow = '';
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    lastFocus = null;
  }

  /* ─── Delegated CTA interception ─────────────────────────────── */
  document.addEventListener('click', function (e) {
    var trigger = e.target.closest ? e.target.closest('[data-coming-soon]') : null;
    if (!trigger) return;
    e.preventDefault();
    show();
  }, false);

  /* ─── Public API ─────────────────────────────────────────────── */
  window.II = window.II || {};
  window.II.comingSoon = { show: show, hide: hide };

}());
