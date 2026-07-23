# Module 18 — Hadith Engineering Hardening — Design

**Date:** 2026-07-22
**Scope:** engineering-only follow-ups (no scholar sign-off, no content authored)
**Posture:** three independent items in one spec/plan; any item can be sequenced or dropped without disturbing the others.

Covers three post-Stage-4 follow-ups surfaced by the Module-17 final review and the Module-7 open gaps:
1. Reading-path **SPA navigation** (anchor conversion) — defer mountStrip/markRead to curation.
2. **Empty-state unification + ARIA** across Module 8 (narrator) and Module 14 (trace).
3. **No-build performance levers** for the hadith base page (Module 7 DoD-15) + honest ADR.

---

## Item 1 — Reading-path SPA navigation

### Context
`reading-paths.js` currently navigates with `location.href = routeFor(ref)` (a **full page reload**) from a `<button>` + click listener, in `openNextUnread` (Continue) and the strip Prev/Next handlers. The rest of the hadith SPA navigates client-side: [`wireRouting()`](../../../src/js/hadith.js) installs a **document-level click interceptor** that catches any `<a href="/hadith/…">`, calls `e.preventDefault()`, and runs `routeTo(parseRoute(href), true)` = `history.pushState` + `renderRoute` (no reload). `routeTo` is private to `hadith.js`.

### Decision
Render the Continue control and strip Prev/Next as **anchors** (`<a href={routeFor(ref)}>` styled as buttons) instead of `<button>` + `location.href`. The existing `wireRouting` interceptor then provides SPA nav for free — no cross-module coupling, no `pushState` call in `reading-paths.js`. Remove `openNextUnread`, the `[data-path-continue]` click-listener block, and the two strip button `addEventListener` handlers. Keep the `routeFor(ref)` helper (now used to build hrefs).

**This is a code *simplification*, not speculative feature wiring.** It removes bespoke listener code and replaces it with plain anchors the app already knows how to route — it does *not* add new dormant coupling the way wiring `mountStrip`/`markRead` into `renderDeepView` would. That is why it is low-risk to do now even though, like all reading-path nav, it is dormant against the empty seed (Continue renders "Coming soon"; the strip never mounts) and is verifiable only via the existing mocked-path unit tests. `mountStrip`/`markRead` remain **unwired** — deferred to the scholar-gated curation task (ADR-042 / Module-17 verification note).

### Changes
- `src/js/reading-paths.js`:
  - `continueControl`: `'continue'` state → `<a class="path-continue" href="<routeFor(nextRef)>" data-i18n="hadith.paths.continue">Continue →</a>`. `nextRef` computed in `rowHTML` via `core.nextUnread(path, readSet)` (only when state is `'continue'`). `'coming-soon'` / `'complete'` unchanged (non-interactive spans).
  - Strip Prev/Next → `<a class="path-nav-btn" href="<routeFor(ref)>" …>`; when `prev`/`next` is absent (first/last hadith), render a disabled `<span class="path-nav-btn" aria-disabled="true">` (no href) instead of an anchor.
  - Remove `openNextUnread`, the `[data-path-continue]` listener loop, and both strip nav `addEventListener` calls.
- CSS: `.path-continue` / `.path-nav-btn` may need `text-decoration:none; display:inline-block` now that they are anchors (verify against existing rules; reuse tokens, no new colors).

### Verification
`node --check`; the Continue-target logic (`nextUnread`) already has core unit tests; a manual DOM smoke is deferred with the rest of the dormant reading-path surface. No behavior change is observable today.

---

## Item 2 — Empty-state unification + ARIA

### Context
Two divergent honest-empty patterns:
- `.dv-empty` ([hadith.html](../../../hadith.html)) — 14px, `--surface` bg, boxed padding; used widely in `trace-view-core.js` and `tier3-deep-view-core.js`.
- `.narrator-empty` — 12.5px, no bg, tight padding; used only in `narrator-panel-core.js`.

Both already render honest, non-fabricated notices and are unit-tested. The goal is **consistency + ARIA**, not new behavior. Per the agreed steer, **skip** speculative malformed-API hardening (no evidence of a real failure mode).

### Decision
Standardize on **`.dv-empty` as the single shared empty-state class**, with a `.dv-empty--compact` modifier preserving the narrator panel's density (12.5px, no bg, tight padding). Add **`role="note"`** to every empty notice (the correct non-live-region ARIA for supplementary "unavailable" text — **not** `role="status"`, which would announce as a live region on every deep-view paint). Remove the `.narrator-empty` rule.

### Changes
- `hadith.html` CSS: add `.dv-empty--compact { font-size:12.5px; background:none; padding:4px 0; }` (overrides on top of `.dv-empty`); remove `.narrator-empty`.
- `src/js/narrator-panel-core.js`: the two empty notices (`No scholar citations available…`, `Reliability data unavailable…`) → `<div class="dv-empty dv-empty--compact" role="note">…</div>`.
- `src/js/trace-view-core.js`: every `<div class="dv-empty">…</div>` empty notice gains `role="note"` (class already `.dv-empty`). (Do **not** add `role="note"` to `.dv-empty` used for genuine non-notice content if any — audit each; all current `.dv-empty` usages are unavailable-notices, so all get the role.)
- Keep all copy strings byte-identical (no content edits) except where unifying is purely structural.

### Verification (TDD)
`worker/test/narrator-panel-core.test.js` and `worker/test/trace-view-core.test.js` exist. Update their empty-state assertions to expect the unified class + `role="note"` (write the failing assertion first, then change the core). Full suite stays green.

---

## Item 3 — No-build performance levers (Module 7 DoD-15) + honest ADR

### Context
Module 7 DoD-15: Lighthouse Performance **62–65** vs the `<90` target on the hadith base page. Cause (logged, not a Module-7 defect): render-blocking fonts, ~43 KiB unminified JS, LCP 5–9 s, whole SPA loads per route. **ADR-001 forbids a build step** → minification/bundling/tree-shaking are off the table. The easy levers are **already applied**: the Google Fonts URL carries `&display=swap` and both `preconnect`s exist ([hadith.html:19–21](../../../hadith.html)).

### Decision
Apply the remaining **no-build** levers to `hadith.html`, measure honestly, and record the structural ceiling as an ADR rather than silently chasing a number a no-build page may not reach.

**Levers:**
1. **Non-render-blocking font stylesheet.** Convert the blocking `<link rel="stylesheet" href="…&display=swap">` to the preload-swap pattern:
   ```html
   <link rel="preload" as="style" href="…&display=swap" onload="this.onload=null;this.rel='stylesheet'">
   <noscript><link rel="stylesheet" href="…&display=swap"></noscript>
   ```
   (Biggest single available win — the font CSS is currently the top render-blocker.)
2. **Lazy-load post-interaction feature scripts.** `hadith-ai-core.js`, `hadith-ai.js`, `quranlyai-widget.js`, `select-to-ask.js` (the last four `<script>` tags) are only needed after user interaction (explain button, floating widget, text selection). Replace their blocking `<script>` tags with a small inline loader that injects them on `window` `load` (or `requestIdleCallback`). **Precondition:** verify each self-inits safely when loaded late (none is a first-paint dependency of `hadith.js`); if any is not safe to defer, leave it eager and note why.
3. **Measure** before/after with Lighthouse via the **web-perf skill** (Chrome DevTools MCP). If no browser automation is available in the session (as in prior modules), apply the levers, record that measurement is deferred to human sign-off, and do **not** fabricate a score.
4. **ADR-043** in `doc/DECISIONS.md`: the `<90` DoD-15 target may be **structurally capped by ADR-001's no-build constraint** — the dominant costs (unminified ~43 KiB JS, whole-SPA-per-route) are only removable with a build step; the applied no-build levers are the realistic ceiling until either ADR-001 is revisited or hosting/build changes. Frames it as a known, documented limit, not a silent workaround.

### Scope guard
Changes are localized to `hadith.html` (`<head>` font link + the four script tags) — reversible, no behavior change to features. The same pattern exists on other pages but propagating it is **out of scope** (this DoD is measured on `hadith.html`). Lazy-load must preserve feature-init behavior — verified per script.

---

## Out of scope (explicit)
- Wiring `mountStrip`/`markRead` and any reading-path progress recording — deferred to the scholar-gated curation task (ADR-042).
- Authoring any hadith content, reference, or curated data.
- Minification/bundling or any build step (ADR-001).
- Malformed-API defensive hardening for Module 8/14 (no evidence of a real failure mode).
- Propagating perf levers to non-hadith pages.
- Live browser / VoiceOver / NVDA verification beyond what a session's tooling allows — deferred to human sign-off, per every prior module.

## Definition of done
- **Item 1:** Continue + strip render as `/hadith/…` anchors; `location.href`/`openNextUnread`/strip listeners removed; `node --check` clean; suite green.
- **Item 2:** single `.dv-empty` (+`--compact`) pattern across Module 8 & 14; `role="note"` on every empty notice; `.narrator-empty` removed; updated unit tests pass; suite green.
- **Item 3:** font CSS non-render-blocking; four post-interaction scripts lazy-loaded (or documented why not); Lighthouse measured before/after (or measurement honestly deferred); ADR-043 recorded.
- No content authored; no new color tokens; ADR-001 not violated.
