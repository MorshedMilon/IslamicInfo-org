/* ═══════════════════════════════════════════════════════════════════
   IslamicInfo.org — dua-browse-sheet.js  (v1.0 · 2026-07)

   Opens the dua sidebar as a bottom sheet on phones and tablets.

   WHY: below 900px the sidebar was display:none, so "Browse by Source"
   and "Browse by Chapter" — the only way to reach most of the corpus —
   had no mobile entry point at all. The visitor was left with the seven
   occasion chips. This mirrors the hadith page's collections sheet so
   both browse experiences behave the same way.

   The sheet IS the existing <aside class="dua-sidebar">, repositioned by
   CSS (see the ≤900px block in dua.html). It is deliberately not a copy:
   dua-library.js paints into #dsbAll / #dsbSources / #dsbChapters /
   #dsbList by id and routes facet clicks with closest('#dsbList, …'), so
   a cloned panel would either duplicate those ids or silently fail to
   filter. Nothing here re-renders the sidebar — this file only moves it
   on and off screen.

   Above 900px every listener no-ops and the aside renders exactly as it
   always has.
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var MQ       = '(max-width: 900px)';
  var OPEN_CLS = 'dua-sheet-open';

  var root     = document.documentElement;
  var sidebar  = document.getElementById('duaSidebar');
  var trigger  = document.getElementById('duaSheetTrigger');
  var backdrop = document.getElementById('duaSheetBackdrop');
  var closeBtn = document.getElementById('duaSheetClose');
  if (!sidebar || !trigger || !backdrop) return;

  var mql        = window.matchMedia ? window.matchMedia(MQ) : null;
  var lastFocus  = null;
  var prevBodyOverflow = '';

  function isMobile() { return mql ? mql.matches : window.innerWidth <= 900; }
  function isOpen()   { return root.classList.contains(OPEN_CLS); }

  function open() {
    if (!isMobile() || isOpen()) return;
    lastFocus = document.activeElement;
    root.classList.add(OPEN_CLS);
    trigger.setAttribute('aria-expanded', 'true');
    // the aside is a plain complementary landmark on desktop; it only becomes a
    // modal dialog while it is actually acting as the sheet
    sidebar.setAttribute('role', 'dialog');
    sidebar.setAttribute('aria-modal', 'true');
    prevBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // focus the first facet link so the panel reads immediately to AT; fall back
    // to the close button before the corpus has hydrated and the list is empty
    var first = sidebar.querySelector('.dsb-item') || closeBtn;
    if (first && first.focus) first.focus();
    document.addEventListener('keydown', onKey, true);
  }

  /* restoreFocus is skipped when the sheet closes because a facet was chosen:
     the grid behind has just been refiltered, so pulling focus back to the pill
     would drop the reader at the bottom edge instead of their results. */
  function close(restoreFocus) {
    if (!isOpen()) return;
    root.classList.remove(OPEN_CLS);
    trigger.setAttribute('aria-expanded', 'false');
    sidebar.removeAttribute('role');
    sidebar.removeAttribute('aria-modal');
    document.body.style.overflow = prevBodyOverflow;
    document.removeEventListener('keydown', onKey, true);
    if (restoreFocus !== false && lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function onKey(e) {
    if (e.key === 'Escape') { e.stopPropagation(); close(); return; }
    if (e.key !== 'Tab') return;
    // keep Tab inside the sheet while it is modal
    var items = sidebar.querySelectorAll('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])');
    if (!items.length) return;
    var first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  trigger.addEventListener('click', open);
  if (closeBtn) closeBtn.addEventListener('click', function () { close(); });
  backdrop.addEventListener('click', function () { close(); });

  /* Choosing a facet dismisses the sheet. dua-library.js's own delegated
     handler does the filtering; this only takes the panel down so the results
     are not hidden behind the overlay that produced them. Delegated because the
     sidebar is repainted on every facet change. */
  sidebar.addEventListener('click', function (e) {
    if (!isOpen()) return;
    if (e.target.closest && e.target.closest('.dsb-item')) close(false);
  });

  /* Rotating to a wide tablet layout mid-open would otherwise leave the page
     scroll-locked behind an invisible backdrop. */
  function onBreakpoint() { if (!isMobile()) close(false); }
  if (mql) {
    if (mql.addEventListener) mql.addEventListener('change', onBreakpoint);
    else if (mql.addListener) mql.addListener(onBreakpoint);   // Safari < 14
  } else {
    window.addEventListener('resize', onBreakpoint);
  }
})();
