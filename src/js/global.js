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
   ═══════════════════════════════════════════════════════════════════ */


/* ─────────────────────────────────────────────────────────────────
   Theme icons (SVG strings)
   ───────────────────────────────────────────────────────────────── */

const _ICON_SUN = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
  <circle cx="12" cy="12" r="4"/>
  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
</svg>`;

const _ICON_MOON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
</svg>`;


/* ─────────────────────────────────────────────────────────────────
   applyTheme(t)
   Sets data-theme on <html>, persists to localStorage, updates
   the theme button icon. Exposed on window for page scripts.
   ───────────────────────────────────────────────────────────────── */

function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('islamicinfo-theme', t);

  const btn = document.getElementById('themeBtn');
  if (btn) btn.innerHTML = t === 'dark' ? _ICON_SUN : _ICON_MOON;
}

window.applyTheme = applyTheme;


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
   initSearchPopup()
   Manages the header search popup: toggle, focus, outside-click
   dismiss, and the search button action stub.
   ───────────────────────────────────────────────────────────────── */

function initSearchPopup() {
  const trigger = document.getElementById('searchTrigger');
  const popup   = document.getElementById('searchPopup');
  const input   = document.getElementById('searchPopupInput');
  if (!trigger || !popup) return;

  const submitBtn = popup.querySelector('.search-popup-btn');

  trigger.addEventListener('click', e => {
    e.stopPropagation();
    const opening = popup.classList.toggle('open');
    if (opening && input) setTimeout(() => input.focus(), 50);
  });

  document.addEventListener('click', e => {
    if (!popup.contains(e.target) && e.target !== trigger) {
      popup.classList.remove('open');
    }
  });

  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      const q = input ? input.value.trim() : '';
      if (q) console.log('Search:', q); // TODO: wire to search backend
      popup.classList.remove('open');
    });
  }
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
   Boot — runs on DOMContentLoaded
   ───────────────────────────────────────────────────────────────── */

(function boot() {
  /* Apply saved theme (head snippet handles the pre-paint case;
     this covers the fallback when the snippet is absent). */
  applyTheme(localStorage.getItem('islamicinfo-theme') || 'light');

  /* Wire theme button */
  const themeBtn = document.getElementById('themeBtn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  initHeaderScroll();
  initSearchPopup();
  initReveal();
})();
