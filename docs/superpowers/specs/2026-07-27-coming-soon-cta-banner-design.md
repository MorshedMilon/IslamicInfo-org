# Coming Soon CTA Banner — Design & Delivery

**Date:** 2026-07-27
**Status:** Implemented (uncommitted)
**Scope:** `islamic-studies.html`, `knowledge-hub.html`

## Problem

Both pages *look* complete in production but present **fabricated data as real** and
ship **call-to-action buttons that lead nowhere** — a direct violation of the site's
no-fabrication invariant. Audit findings (per-page, with line numbers) are summarized
below; the named page scripts (`islamic-studies.js`, `knowledge-hub.js`) are orphaned
dead code (ID mismatches — the live logic is inline).

## Decision (owner-directed)

- **Keep all existing content/"dummy data" as-is** (no sections removed, no numbers reset).
- On **every dead call-to-action button**, clicking it shows an honest **"Coming soon"**
  banner instead of doing nothing / faking success / leading to a dead link.
- **Do not touch** links that genuinely navigate to real pages (top nav, footer, the
  quran/hadith/verify portals, cross-links to islamic-studies / knowledge-hub) or
  controls that actually work (FAQ accordion, lesson track-tabs).

Also fixed in this pass:
- **Reflection authenticity bug** (islamic-studies): the Arabic was Al-Muddaththir
  74:31 under an Ad-Duhaa 93:7-8 translation+citation. Replaced with the authentic
  93:7-8 Arabic sourced from the site's own `src/data/quran/search-corpus.json`
  (`وَوَجَدَكَ ضَآلًّا فَهَدَىٰ وَوَجَدَكَ عَآئِلًا فَأَغْنَىٰ`).
- **Knowledge Hub hero search** now routes to the real `search-results.html?q=`
  (federated search) instead of the Coming Soon banner / FAQ scroll.

Deferred (not in this pass): resetting the fabricated metrics across the site, and
the CTA treatment for the other 3 pages (dua/tools/habits).

## Component — `src/js/coming-soon.js`

Single source of truth. ~200 lines, zero deps.

- Message lives in one place (`BODY` constant); optional i18n via `II.t` with the
  literal as fallback.
- Injects its own scoped CSS **using locked design tokens only** (`--surface-card`,
  `--ink-*`, `--teal-*`, `--r-xl`, `--ease`; shadow falls back `--e4` → `--elev-4` →
  literal, since the token name differs per page). Themes light/dark automatically.
  No new colors, no new fonts.
- Renders a centered 🚧 card in an accessible modal: `role="dialog"`, `aria-modal`,
  labelled/described, focus moved to the primary button on open and restored to the
  trigger on close, focus trap, dismiss via ✕ / "Got it" / backdrop / Esc, scroll lock,
  `prefers-reduced-motion` respected. Responsive (clamp-based sizing).
- **Delegated** click handler on `[data-coming-soon]`: `preventDefault()` → `show()`.
- Public API: `window.II.comingSoon.show()` / `.hide()`.

### Usage
1. Include `<script src="src/js/coming-soon.js"></script>` before `</body>`.
2. Add `data-coming-soon` to any not-ready CTA (`<button>` or `<a>`), **or** call
   `window.II.comingSoon.show()` from an existing handler.

## Wiring map

### islamic-studies.html — 12 CTAs marked `data-coming-soon`
- 3 pathway CTAs (Beginner/Intermediate/Advanced) — were `onclick="showToast(...)"`
- 6 lesson "Read →" links — pointed to bare knowledge-hub.html (no such lesson)
- "Continue Lesson 4", "Take Quiz" (no quiz exists), final "Start Foundations" — were toasts
- **Left working:** 4 track-tab buttons (`setTrack`), handoff/reflection/final nav links
  to knowledge-hub.html, nav, footer.

### knowledge-hub.html — 10 CTAs marked + 2 inline handlers rewritten
- 8 "Browse by Topic" cluster cards — were `onclick="filterCluster(...)"` (scrolled to FAQ)
- "See all trending" + "Browse all 2,400+ articles" — were `href="#"`
- **Hero search** (`doHeroSearch`) — FAQ-scroll fallback replaced with a real redirect to
  `search-results.html?q=` (still defers to `II.hub.search` if ever wired)
- **Newsletter "Get the Guide"** — fake "Guide sent! ✦" success replaced with
  `II.comingSoon.show()` (still defers to `II.hub.subscribe` if ever wired)
- **Left working:** quran/hadith/verify portals, "Islamic Studies →", FAQ accordion,
  nav, footer.

## Verification

- `node --check` on `coming-soon.js` and both edited inline `<script>` blocks — OK.
- DOM-shim functional test: click on a `[data-coming-soon]` element → `preventDefault`
  fired, overlay created with `.open`, scroll locked, style injected; `hide()` removes
  `.open` and restores scroll. All pass.
- Grep confirms: correct marker counts (12 / 10), no leftover fake handlers
  (`filterCluster` onclick, "Guide sent" runtime, FAQ-scroll), scripts included, and the
  genuinely-working links untouched.
- Not yet browser-verified in a real page (no headless browser in the environment);
  manual smoke recommended.

## Manual smoke checklist
1. Open each page (over HTTP, not file://). Console clean on load.
2. Click each wired CTA → 🚧 banner appears; ✕ / "Got it" / backdrop / Esc all dismiss;
   focus returns to the button.
3. Confirm real links still navigate: nav, footer, quran/hadith/verify portals,
   Islamic Studies link, FAQ accordion, lesson track-tabs.
4. Toggle dark mode → banner re-themes. Resize to mobile → card stays centered/readable.
