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
   Boot — runs on DOMContentLoaded
   ───────────────────────────────────────────────────────────────── */

(function boot() {
  initHeaderScroll();
  initReveal();
})();
