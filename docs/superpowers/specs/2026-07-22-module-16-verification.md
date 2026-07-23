# Module 16 — Study Mode (US-H20) + Reading Mode (US-H21) · Verification

**Date:** 2026-07-22 · **Branch:** `main` (uncommitted working tree)
**Scope:** Two deep-view (Tier 3b) display toggles, implemented as CSS/state on the existing
`.dv` page (per §0 — not separate page builds).

## Files touched
- **NEW** `src/js/hadith-display-mode-core.js` — pure mode logic (mutual exclusion, `?mode=reading`
  parse/serialize, storage helpers, restore resolution, banner + toggle-button builders).
- **NEW** `worker/test/hadith-display-mode-core.test.js` — 26 tests.
- `src/js/tier3-deep-view.js` — DOM layer: `mountModeControls`, `applyMode`, `toggleMode`,
  `exitMode`, `reapplyModeClasses` (sync, no-flash), `clearModeClasses` (exported), fixed
  `.reading-exit` button, global Escape handler.
- `src/js/tier3-deep-view-core.js` — wrapped `topicsChipsHTML + relatedPlaceholderHTML` in
  `.dv-br-group` (BR quadrant; transparent in normal flow).
- `src/js/hadith.js` — `renderRoute` calls `clearModeClasses()` on every route change.
- `hadith.html` — `id="hadith-hero"` on hero div; new core `<script>`; Module-16 CSS block.

## Automated verification — DONE ✅
- **Full test suite: 369 / 369 pass** (`cd worker && node --test`) — 343 baseline + 26 new.
  `tier3-deep-view-core` stays green at 32 after the `.dv-br-group` wrap.
- **`node --check`** clean on all four edited/added JS files.
- **Integration smoke** (Node, real core builders): `.dv-br-group` wraps topics before related;
  `studyBannerHTML`/`modeButtonsHTML` emit canonical markup with correct `aria-pressed`;
  `toggle('study','reading') → 'reading'`; `initialMode({search:'?mode=reading'}) → 'reading'`;
  `setReadingParam('?grade=sahih', true) → '?grade=sahih&mode=reading'`.

## Behaviour implemented (maps to DoD)
- **Study 4-quadrant** (`@media (min-width:1440px)` on `html.study-mode-hadith .dv`): TL matn ·
  TR isnad · BL grading · BR topics+related. Sidebar/hero/collections/translations/prev-next/
  load-more hidden. Grid `height:calc(100vh-128px)`, rows `auto auto minmax(0,1fr) minmax(0,1fr)`,
  quadrants `overflow-y:auto; min-height:0` (long hadith scrolls *inside* its quadrant so the
  4-up layout never forces page scroll).
- **Study exit**: `.exit-study ×` in banner, the pressed Study toggle, or **Escape**. Focus
  returns to the deep-view (`focusFor`).
- **Reading**: single column max-720px centered; Arabic 26→32px, deep text 17→19px, tr-text
  16→18px; light-mode surface → `var(--gold-50)` (ADR-040), dark unchanged. Hides sidebar, hero,
  footer, `.cta-band`, `.dv-actions`, `.dv-modes`. Exit via fixed top-right `.reading-exit ×` or
  **Escape**.
- **Reading restore**: `?mode=reading` written on enter (`replaceState`, preserves other params) +
  storage mirror `islamicinfo-hadith-reading-mode='1'`; restored on load if **either** present
  (ADR-041). Survives in-app nav via module state + storage.
- **Mutual exclusion**: only one `<html>` class ever set; switching modes replaces.
- **Reduced motion**: `@media (prefers-reduced-motion: reduce)` sets `transition/animation:none`
  on `.dv`, `.dv-mode-btn`, `.reading-exit`, `.study-mode-dot` (pulsing dot stilled).

## OUTSTANDING — deferred to a human browser session ⚠️
No browser-automation tooling was available in the build session (Node test runner only), so the
following could **not** be machine-verified and are **not** claimed as passing. This matches the
posture of every prior hadith module (live browser + AT deferred to sign-off):

1. **DoD — Study Mode no-scroll at EXACTLY 1440×900.** The `calc(100vh-128px)` top-offset is a
   reasoned heuristic for the sticky header + `.main` padding; it needs a real 1440×900 viewport to
   confirm all four quadrants are visible with **zero page scroll**. Tune the `128px` offset if the
   page scrolls. **Test at exactly 1440×900, not just "large desktop."**
2. **DoD — Reading Mode restores from `?mode=reading` on reload** in a live browser (and the storage
   mirror path when the param is dropped by in-app nav).
3. **DoD — Escape exits whichever mode is active; focus returns correctly** — confirm with keyboard.
4. **A11y** — VoiceOver/NVDA over the banner (`role="status"`), the `aria-pressed` toggles, and the
   fixed reading-exit button; confirm the reduced-motion path visually.

### How to verify (human)
Serve the site (or use the live Worker once deployed) → open a Tier-3b deep view (e.g.
`/hadith/sahih-bukhari/1/1`) → set the browser window to **1440×900** → click **Study Mode**:
confirm 4 quadrants, no page scroll. Click **Reading Mode**: confirm single 720px column, gold
tint, enlarged Arabic, `?mode=reading` in the URL; reload and confirm it restores. Press **Escape**
in each mode and confirm exit + focus return.
