/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — global.js
   Load with <script src="../js/global.js"></script> at end of <body>.

   HEAD SNIPPET — paste inside <head> BEFORE any CSS link tags to
   prevent flash of wrong theme (FOUC):

   <script>
     (function(){
       var t = localStorage.getItem('islamicinfo-theme') || 'light';
       document.documentElement.setAttribute('data-theme', t);
     })();
   </script>

   localStorage key: 'islamicinfo-theme'  |  Default: 'light'
   data-theme lives on <html>, never on <body>.

   NOTE: theme-toggle (#themeBtn/applyTheme) and the header search
   popup (#searchTrigger/#searchPopup) are wired per-page in each
   page's own inline script. Do not re-add that wiring here — it
   double-binds the click handlers and cancels itself out.
   ═══════════════════════════════════════════════════════════════════ */


/* ─────────────────────────────────────────────────────────────────
   initHeaderScroll()
   Adds .scrolled to #siteHeader when page scrolls past 16 px.
   ───────────────────────────────────────────────────────────────── */

function initHeaderScroll() {
  const hdr = document.getElementById('siteHeader');
  if (!hdr) return;

  window.addEventListener('scroll', () => {
    hdr.classList.toggle('scrolled', window.scrollY > 16);
  }, { passive: true });
}


/* ─────────────────────────────────────────────────────────────────
   initAccountLink()
   Routes the header person/account button to the sign-in page.
   Each page's header button carries data-account; there is no
   session system yet, so it always goes to sign-in.html.
   ───────────────────────────────────────────────────────────────── */

function initAccountLink() {
  var btns = document.querySelectorAll('[data-account]');
  for (var i = 0; i < btns.length; i++) {
    btns[i].style.cursor = 'pointer';
    btns[i].addEventListener('click', function () {
      window.location.assign('sign-in.html');
    });
  }
}


/* ─────────────────────────────────────────────────────────────────
   openMM() / closeMM()
   Mobile menu overlay toggle. Must stay on window because the
   hamburger and close button call them via onclick="openMM()".
   ───────────────────────────────────────────────────────────────── */

function openMM() {
  const mm = document.getElementById('mobileMenu');
  if (mm) mm.classList.add('open');
}

function closeMM() {
  const mm = document.getElementById('mobileMenu');
  if (mm) mm.classList.remove('open');
}

window.openMM = openMM;
window.closeMM = closeMM;


/* ─────────────────────────────────────────────────────────────────
   initMobileMenu()
   Shared drawer dismissal wired once for every page's #mobileMenu
   (the full-screen .mobile-menu overlay). Replaces the per-page
   inline copies that used to live in each ii-nav page:
     • tapping any nav link inside the drawer closes it
     • tapping the empty backdrop area (the overlay itself, i.e.
       "outside" the stacked links) closes it
   The hamburger owns opening via onclick="openMM()"; Escape closes
   via the global keydown handler below.
   ───────────────────────────────────────────────────────────────── */

function initMobileMenu() {
  const mm = document.getElementById('mobileMenu');
  if (!mm) return;
  mm.addEventListener('click', e => {
    if (e.target.closest('.mm-link') || e.target === mm) closeMM();
  });
}


/* ─────────────────────────────────────────────────────────────────
   injectMobileChrome()
   Keeps the header compact on phones so the hamburger always fits.
   i18n.js expands the language label to the full name ("English"),
   which on narrow screens pushes the theme toggle + hamburger off
   the right edge. On mobile we hide the label + chevron (the globe
   icon still opens the language menu). Injected once here so every
   page gets it without editing 15 duplicated stylesheets.
   ───────────────────────────────────────────────────────────────── */

function injectMobileChrome() {
  if (document.getElementById('ii-mobile-chrome-css')) return;
  const s = document.createElement('style');
  s.id = 'ii-mobile-chrome-css';
  s.textContent =
    '@media(max-width:600px){' +
    '#langBtnLabel{display:none!important;}' +
    '.lang-chevron{display:none!important;}' +
    '}';
  (document.head || document.documentElement).appendChild(s);
}


/* ─────────────────────────────────────────────────────────────────
   Global Escape handler
   Closes both the mobile menu and search popup on Esc.
   ───────────────────────────────────────────────────────────────── */

document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  closeMM();
  const popup = document.getElementById('searchPopup');
  if (popup) popup.classList.remove('open');
});


/* ─────────────────────────────────────────────────────────────────
   initReveal()
   IntersectionObserver that adds .in to every .reveal element as
   it enters the viewport. Threshold 0.08 (fires earlier than the
   CLAUDE.md default of 0.12 — better for tall cards on mobile).
   ───────────────────────────────────────────────────────────────── */

function initReveal() {
  const ro = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        ro.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.reveal').forEach(el => ro.observe(el));
}


/* ─────────────────────────────────────────────────────────────────
   showToast(message, duration?)
   Creates a .toast node on first call; reuses it thereafter.
   Exposed on window so page scripts can trigger it:
     showToast('Prayer logged ✓');
     showToast('Copied!', 2000);
   ───────────────────────────────────────────────────────────────── */

function showToast(message, duration) {
  duration = duration !== undefined ? duration : 3000;

  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = '<span class="toast-dot"></span><span class="toast-msg"></span>';
    document.body.appendChild(toast);
  }

  const msgEl = toast.querySelector('.toast-msg');
  if (msgEl) msgEl.textContent = message;

  toast.classList.add('show');
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => toast.classList.remove('show'), duration);
}

window.showToast = showToast;


/* ─────────────────────────────────────────────────────────────────
   loadAnalytics() — inject the site-wide analytics layer (Module 18,
   DoD-17) on every page: analytics-core.js (KPI allowlist + gating)
   then analytics.js (II.track + GA4 loader + initial page_view).
   async=false preserves execution order (core before analytics).
   analytics.js is privacy-gated internally and self-activates once the
   GA4 id + consent resolve; it fires the page_view for visitor/traffic/
   geo reporting. Guarded against double-injection.
   ───────────────────────────────────────────────────────────────── */
function loadAnalytics() {
  if (window.II && window.II.analytics) return;         // already loaded
  if (document.getElementById('ii-analytics-core')) return;
  ['src/js/analytics-core.js', 'src/js/analytics.js'].forEach(function (src, i) {
    var s = document.createElement('script');
    s.src = src;
    s.async = false;                                     // keep core → analytics order
    if (i === 0) s.id = 'ii-analytics-core';
    document.body.appendChild(s);
  });
}


/* ─────────────────────────────────────────────────────────────────
   Boot — runs on DOMContentLoaded
   ───────────────────────────────────────────────────────────────── */

(function boot() {
  initHeaderScroll();
  initAccountLink();
  initReveal();
  initMobileMenu();
  injectMobileChrome();
  loadAnalytics();
})();
