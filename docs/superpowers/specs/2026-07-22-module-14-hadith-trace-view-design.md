# Module 14 — Hadith Trace View (US-H18) — Design Spec

**Date:** 2026-07-22
**Covers:** PRD §3.4 US-H18 · PRD §4.8 [FIX-3] · TechSpec §2.8 · DoD-13
**Status:** Design approved (pending written-spec review). Ships LIVE (no runtime flag); manual assistive-tech verification is an explicit outstanding QA item.

---

## 0. Summary

Build the signature 3-column research view — **Matn · Isnad · Scholarly Grading** — reachable two ways: a real route `/hadith/trace/[collection]/[book]/[hadith]` (from a "View as Trace →" button on the deep-view page) and a full-screen overlay opened without a route change (from a hadith card action-row button). Both drive **one** overlay component.

Only the **Arabic matn + translation** (col 1) and the **grade label** (col 3) are backed by real data today. Isnad chain, per-narrator reliability, Ibn Hajar / an-Nawawi commentary, related narrations, related Qur'anic verses, and topic chips are all **data-absent** and render honest "being compiled / not yet available" states — **zero fabricated scholarly content** (the religious-accuracy gate). The view lights up automatically as each data source lands, with no rebuild required. This matches the honest-scaffold posture of Modules 7–11.

---

## 1. Key decisions (with rationale)

1. **Full 3-column honest scaffold, built now.** Complete layout; real matn/translation/grade; every absent section is a truthful "not yet available" state, never a paraphrase or placeholder standing in for real scholarly material.
2. **One overlay component; route = thin entry.** A single `.trace-overlay` (z-index 300, mirroring the built Qur'an-page overlay). Card button opens it with no URL change; deep-view "View as Trace →" pushes `/hadith/trace/[c]/[b]/[h]` then opens the same overlay; a fresh load of that URL renders the deep-view underneath first, then opens the overlay. One code path for both entry points.
3. **Ships LIVE (no runtime flag), unlike Module 13.** Rationale (→ `doc/DECISIONS.md` entry): Trace View authors no content and runs no LLM; it reformats already-authenticated matn/grade and shows honest-empty states. The residual risk is assistive-tech behavior on a **reused, production-proven** focus mechanism, not content correctness, so a content-style review gate does not apply. Manual VoiceOver + NVDA verification is tracked as outstanding QA and **never marked done** until a human runs it.
4. **Reuse Module 8 narrator panel as-is (do not rebuild)** and **reuse Module 10/12 action handlers as-is**. PRD says don't rebuild the panel; and with `narrators:[]` there is nothing to render/slide yet anyway.
5. **3 columns, not 4 (FIX-3 settled).** Do not reopen. Related narrations live in the right column's lower section, not a 4th column.

---

## 2. Architecture

```
Entry A (card action row):  [◈ Trace] button  → II.traceView.open(ref, {viaRoute:false})   (no URL change)
Entry B (deep-view header):  <a href="/hadith/trace/{c}/{b}/{h}">View as Trace →</a>
                               → existing wireRouting intercepts → history.pushState → renderRoute
                               → renders deep-view underneath, then II.traceView.open(ref,{viaRoute:true})
Fresh load / refresh of /hadith/trace/...:  404.html ?redirect restore → parseRoute {trace:true}
                               → renderRoute renders deep-view, then opens overlay

                         ┌─────────────── one .trace-overlay (role=dialog, aria-modal, z-index 300) ───────────────┐
                         │ top bar: breadcrumb | 🔖 ↗ 📋 (.trace-act) | "Exit Trace View →"                        │
                         │ .trace-layout  grid 1fr:1.2fr:1fr (≥1300) / 1fr 1fr (≤1300) / 1fr (≤900)                 │
                         │  col1 Matn (REAL)      col2 Isnad (honest)      col3 Grading (grade REAL, rest honest)    │
                         └───────────────────────────────────────────────────────────────────────────────────────┘

New modules (UMD, mirroring the core/DOM split used across the codebase):
  src/js/trace-view-core.js  → window.II.traceViewCore   (PURE: buildTraceHTML, breadcrumb, exit-target, honest states)
  src/js/trace-view.js       → window.II.traceView       (DOM: overlay open/close, focus trap, Escape, exit, route glue)

Composed in hadith.js init():
  II.traceView.init({ api, ui, actions, narratorPanelDom, focusTrap: ui.focusTrap,
                      onShare, onCopy, onBookmark, routeTo });
  (The deep-view-underneath render on route entry is owned by hadith.js renderRoute,
   NOT by traceView — so renderDeepView is not injected; traceView uses routeTo for Exit.)
```

---

## 3. `trace-view-core.js` (pure, unit-tested)

Exports on `window.II.traceViewCore` (UMD, `module.exports` for tests):

- `buildTraceHTML(hadith)` → the full `.trace-layout` inner HTML string for a hadith object (same shape as `api.fetchSingleHadith`). Delegates to the three column builders below. Never throws on missing fields.
- `buildMatnColHTML(hadith)` → Arabic matn (`font-arabic`, `dir="rtl"`) + `┃` teal-bar translation + topic chips (**or** honest "Topics being compiled" when `topics` empty) + related-Qur'an block (**honest "No linked Qur'anic verses yet"**; never invent a link).
- `buildIsnadColHTML(hadith)` → if `hadith.isnad.narrators.length`: rows each with `data-narrator-id`, `role="button"`, `tabindex="0"`, avatar + name/era + reliability dot + dashed connectors, ◆ divergence markers where `narrator.divergence`. **Else** honest "Isnad chain being compiled — not yet available" (mirrors `tier3-deep-view-core.js` isnad empty state). The label reads "Isnad Chain (Click narrators for reliability)".
- `buildGradingColHTML(hadith)` → grade block `grade-{value}` bg + label (real; `'unknown'`/"Grade Unknown" fallback, never omitted) + grader/citation honesty note (reuse the existing "grader not individually cited" / "collection-level characterization" copy) + **Ibn Hajar box → "Commentary not yet available"** + **an-Nawawi box → "Commentary not yet available"** + related-narrations block → "Related narrations are being compiled" (0 links).
- `buildBreadcrumb(hadith|ref)` → `Collection › Book › #Hadith` text (from the resolved collection/book/hadith identifiers).
- `resolveExitTarget({ viaRoute, ref })` → returns whether Exit should navigate to the deep-view route (`viaRoute:true`) or just close (`viaRoute:false`), and the deep-view path `/hadith/{c}/{b}/{h}`.

**Honesty constraint:** the Ibn Hajar / an-Nawawi / related-narration / topic / related-verse builders emit ONLY the honest-unavailable state today. No named-scholar prose is generated. When real curated data is present in the hadith object, the same builders render it — the empty state is data-driven, not hardcoded absence.

---

## 4. `trace-view.js` (DOM controller)

`window.II.traceView` singleton:

- `init(host)` — stores host (`api, ui, actions, narratorPanelDom, focusTrap, onShare, onCopy, onBookmark, routeTo`). Ensures the overlay element exists (or references the one in hadith.html).
- `open(ref, opts)` — `opts = { viaRoute:boolean, hadith?:object }`.
  1. Resolve the hadith: use `opts.hadith` if provided (card/deep-view already fetched it); else `await host.api.fetchSingleHadith(collection, book, hadith)`. On fetch failure → honest error state in the overlay (not a blank).
  2. Render `traceViewCore.buildTraceHTML(hadith)` + breadcrumb into the overlay; wire `.trace-act` buttons to `host.onBookmark/onShare/onCopy` (reads the same hadith/ref — no new copy-text logic); the isnad rows are covered by the already-document-wired `narratorPanelDom.wire(document)`.
  3. Record `triggerEl = document.activeElement`.
  4. `overlay.classList.add('open')`, set `aria-hidden` on the page shell, move focus to the first focusable (Exit button), apply `untrap = host.focusTrap(overlay)`, add a document `keydown` handler for **Escape → close()**.
  5. Store `{ viaRoute, ref }` for exit resolution.
- `close()` — remove `.open`, call `untrap()`, remove the Escape keydown, clear page-shell `aria-hidden`, **restore focus to `triggerEl`**. Then apply exit target: if the current state was `viaRoute` and the URL is a `/hadith/trace/...` path, navigate to `/hadith/{c}/{b}/{h}` (deep-view already rendered underneath; this syncs the URL + shows real content); if not viaRoute, just closing reveals the feed.
- "Exit Trace View →" button and the ✕/Escape all call `close()`.

**Nested-overlay Escape order:** matches the Qur'an precedent — Escape closes the topmost open surface first; Trace View's Escape only fires when the overlay is `.open`.

---

## 5. `hadith.html` changes

- **Add** the overlay markup as a top-level sibling of the page shell (outside `.main`), like the Qur'an page:
  `<div class="trace-overlay" id="trace-overlay" role="dialog" aria-modal="true" aria-label="Hadith Trace View" hidden> … top bar … <div class="trace-layout"></div> </div>`.
- **Add** the CSS: `.trace-overlay{position:fixed;inset:0;z-index:300;display:none;…}` / `.trace-overlay.open{display:flex;flex-direction:column}`; `.trace-layout{display:grid;grid-template-columns:1fr 1.2fr 1fr;gap:20px;…}` with `@media(max-width:1300px){grid-template-columns:1fr 1fr; .trace-col-3{grid-column:1/-1}}` and `@media(max-width:900px){grid-template-columns:1fr}`; each `.trace-col{overflow-y:auto}` scrolls independently; top-bar/`.trace-act`/`.trace-exit` styles (reuse existing tokens; no new colors). Honest-state styling reuses existing muted/empty classes.
- **Remove** the static demo `.trace-layout` block currently at hadith.html:1756-1815 (approved) so there is exactly one `.trace-layout`, owned by the overlay.
- **Add** a `[◈ View as Trace]`-style button to the hadith card action row (a `[data-act="trace"]` button, styled like the other `.hadith-action-btn`s, gated by nothing — ships live) so the card overlay entry works. Wired in hadith.js.
- **Add** the two script includes after `narrator-panel.js` and before `hadith.js` (core before DOM): `trace-view-core.js`, `trace-view.js` — verify hadith.js still loads last of the hadith modules so `II.traceView` is available for host injection.

---

## 6. `hadith.js` changes

- `parseRoute(path)` — add a trace branch: a path `/hadith/trace/{c}/{b}/{h}` → `{ trace:true, collection, book, hadith }`. (Guard: `trace` must be the first segment; a real collection is never named `trace`.)
- `routePath(r)` — when `r.trace`, build `/hadith/trace/{c}/{b}/{h}`.
- `renderRoute(r)` — if `r.trace`: render the deep-view for `{c,b,h}` into `#ii-tier2` (so real content sits underneath), then `II.traceView.open(ref, { viaRoute:true })`. All other branches unchanged.
- `init()` — add `II.traceView.init({...host})` alongside the other sub-module inits (it needs `api, ui, actions, narratorPanelDom, focusTrap: ui.focusTrap, onShare, onCopy, onBookmark, routeTo, renderDeepView`; `onShare/onCopy/onBookmark` are the existing module-private handlers).
- **Card trace button wiring** — extend the existing `wireCardActions()` `[data-act]` switch: `act === 'trace'` → read the card's `data-ref` + cached hadith → `II.traceView.open(ref, { viaRoute:false, hadith })`.

---

## 7. `tier3-deep-view-core.js` changes

- Add a **"View as Trace →"** control to the deep-view header (in `actionButtonsHTML` or the `deepViewHTML` header) as `<a class="dv-trace-link" href="/hadith/trace/{c}/{b}/{h}">View as Trace →</a>` so the existing `wireRouting` click-interceptor handles it (pushState → renderRoute). This is the only change to Tier-3b: a link, no behavior logic here.

---

## 8. DoD-13 — focus trap & accessibility

- `role="dialog"`, `aria-modal="true"`, `aria-label` on the overlay; page shell gets `aria-hidden="true"` while open.
- Tab-cycling via `II.ui.focusTrap(overlay)` (existing, production-proven).
- Escape-to-close + focus-return-to-trigger via the bookmarks-panel pattern (existing, production-proven).
- Run whatever automated a11y check is available in-environment (e.g. axe-core) and record the literal result.
- **Manual VoiceOver + NVDA verification is REQUIRED by DoD-13 and CANNOT be performed in this environment.** It ships as an explicit, tracked **outstanding QA item** and is **never marked done** until a human runs it. The verification note at session end must state which screen readers (if any) were actually testable here.

---

## 9. Files touched

| File | New/Mod | Responsibility |
|------|---------|----------------|
| `src/js/trace-view-core.js` | New | Pure: `buildTraceHTML` + column/breadcrumb/exit builders + honest states |
| `src/js/trace-view.js` | New | DOM: overlay open/close, focus trap, Escape, exit, route glue |
| `hadith.html` | Mod | Overlay markup + CSS grid/columns + card trace button + 2 script includes; REMOVE static demo `.trace-layout` |
| `src/js/hadith.js` | Mod | parseRoute/routePath/renderRoute trace branch; `II.traceView.init`; card `data-act="trace"` wiring |
| `src/js/tier3-deep-view-core.js` | Mod | "View as Trace →" link in the deep-view header |
| `doc/DECISIONS.md` | Mod | 1 entry: Trace View ships live (no flag) — rationale |
| `worker/test/trace-view-core.test.js` | New | Unit tests for the pure core (honest states, breadcrumb, exit target) |

**Reused, not rebuilt:** `II.narratorPanel`/`II.narratorPanelDom` (Module 8), `II.hadithActions` + `onShare/onCopy/onBookmark` (Modules 10/12), `II.ui.focusTrap` (ui-utils). **Not touched:** the hadith API/adapter, the narrator/grade data shape.

---

## 10. Scope guard (YAGNI / charter)

- Zero scholar content authored; all absent data → honest "not yet available" states (never a paraphrase attributed to a named scholar).
- No 4th column (FIX-3 settled — do not reopen).
- No new colors/fonts/tokens; design system locked; grid overrides mockup per PRD/TechSpec (`1fr:1.2fr:1fr`).
- Reuse the narrator panel, action handlers, and focus-trap helper — build none anew.
- Related-hadith soft-routing within Trace View is future-data behavior (0 links today); build the honest-empty state, not the routing.

---

## 11. Definition of Done

- [ ] 3-column layout matches the blueprint (3 columns, `1fr:1.2fr:1fr`, stacks; independent column scroll) — NOT the 4-column Functional Doc version.
- [ ] Both entry points work: deep-view "View as Trace →" (route + overlay, Exit → deep-view) and card button (overlay, no route, Exit → feed); fresh deep-link renders deep-view underneath then opens overlay.
- [ ] Every data-absent section renders an honest "not yet available / being compiled" state; **no fabricated scholar commentary** anywhere.
- [ ] `.trace-act` buttons reuse the existing bookmark/share/copy handlers; no new copy-text logic.
- [ ] Focus trap: Tab-cycle + Escape-close + focus-return-to-trigger + `role="dialog"`/`aria-modal`; automated a11y check run and recorded.
- [ ] Manual VoiceOver + NVDA verification flagged as OUTSTANDING QA (never marked done here).
- [ ] 1 DECISION entry (ships-live rationale) added.
- [ ] Pure core unit-tested (honest states, breadcrumb, exit target); full worker suite green.
