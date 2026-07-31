# Hadith Module 9 — Breadcrumbs, Deep Links & Continue Reading — Design

**Date:** 2026-07-21
**Covers:** PRD §3.2 US-H13, §3.3 US-H23b · TechSpec §3.4, §3.5, §3.14, §10, §14.1
**Status:** Approved (brainstorming) — pending implementation plan

---

## 1. Context — repo is ahead of the module prompt

The Module 9 prompt assumes a greenfield build. It is not. **Module 7 (on `main`)
already shipped a large part of this module.** Module 9 is therefore a
**reconcile-and-fill-gaps job**, not a fresh build.

### Already built (Module 7)

| Feature | Where | Note |
|---|---|---|
| Tier-3a breadcrumb | `tier3-deep-view.js` `listHeaderHTML` (`dv-breadcrumb`) | `Hadith › Collection › Book · count`, working links |
| Tier-3b breadcrumb | `tier3-deep-view-core.js` `breadcrumbHTML` | `Hadith › Collection › Book › Hadith N` |
| Deep-link scroll + pulse | `tier3-deep-view.js` §3 (`renderDeepView`) | **1 iteration / 1.6s** — does NOT match §3.5 |
| Last-read **write** | `tier3-deep-view.js` §5 | only on Tier-3b deep-view load; NOT scroll-tracked |
| Continue Reading prompt (read side) | `hadith.js` `renderContinueReading` | Tier-1 hero `#ii-continue-reading` |
| `.pulse-gold` keyframe | `hadith.html:597-600` | `1.6s`, 1 run, ends at `--elev-1`; reduced-motion is `animation:none` only |
| `.breadcrumb` / `.dv-breadcrumb` CSS | `hadith.html:531, 708-711` | shared classes exist |

### Genuine gaps Module 9 fills

1. **Tier-2 (books grid) has no breadcrumb** — only a "↩ All Collections" back button.
2. **No IntersectionObserver reading-progress tracker** — the 3-second-dwell scroll
   tracker does not exist anywhere. This is the real new feature.
3. **`.pulse-gold` does not match §3.5** — wrong timing/iterations and missing the
   §3.14 reduced-motion `border-color` highlight.
4. **Restore-scroll-to-last-read** and **explicit-URL-suppresses-prompt precedence**
   not fully wired.

---

## 2. Architecture

New pure/testable core + thin DOM wiring, mirroring the Module 7/8
`-core.js` + DOM pattern.

### New: `src/js/reading-progress-core.js` (`II.readingProgress`)

Pure logic — no DOM, no `IntersectionObserver`, no timers, no `Date.now()` inside
(caller injects the timestamp so the core stays deterministic and unit-testable).

Responsibilities:
- **3-second dwell state machine** — `markVisible(ref)` / `markHidden(ref)` bookkeeping;
  a ref is "read" once continuously visible for the dwell threshold. The DOM layer owns
  the actual `setTimeout`; the core owns the *rules* (which ref is armed, when a
  visibility change cancels an arm) and exposes the threshold constant (`3000`).
- **Topmost-visible selection** — given a set of `{ref, ratio, top}` records, return the
  ref that should count as "current" (topmost card with ratio ≥ 0.5).
- **Payload builder** — `payloadFromRef(ref, timestamp)` parses `slug:book:hadith` →
  `{collectionSlug, bookNum, hadithNum, timestamp}`; handles bookless refs gracefully.

### `src/js/hadith.js` (DOM owner)

- Single `IntersectionObserver` (threshold `0.5`, throttled to ~1s) over
  `.hadith-card[data-ref]`.
- Feeds visibility events to `II.readingProgress`; on "read", stamps timestamp and
  `ui.safeLocalStorageSet('islamicinfo-hadith-last-read', payload)`.
- Tier-2 breadcrumb render (in `collectionHeaderHTML`).
- Restore-scroll on load; Continue Reading prompt precedence.
- Shared `pulseRing(el)` trigger fn (used by prompt-click and any Module 9 trigger).
- Exposes `observeFeed(containerEl)` on the tier3 host so Tier-3a list cards join the
  same observer.

### `src/js/tier3-deep-view.js` (thin hook only)

- After `renderList` paints the Tier-3a list, call `host.observeFeed(listEl)` so the
  **same** observer tracks list cards. No tracking logic duplicated here.
- Bump the Tier-3b pulse cleanup timeout `1600 → 3600` (2 × 1.8s) to match the new
  shared keyframe duration. Continue using the shared `.pulse-gold` class.

### Data flow (tracking)

```
IO callback → hadith.js records {ref, ratio, top}
  → readingProgress.topmost(records) → ref
  → arm 3s setTimeout for ref (cancel on markHidden)
  → timer fires → readingProgress.payloadFromRef(ref, now)
  → ui.safeLocalStorageSet('islamicinfo-hadith-last-read', payload)
```

---

## 3. Breadcrumbs (US-H13)

Tier 3 is already done. Fill **Tier-2 only**: add a `dv-breadcrumb` strip to
`collectionHeaderHTML` → `Hadith › {Collection}` (collection = current page,
`aria-current`). Reuse the existing `.dv-breadcrumb` classes so all tiers share one
breadcrumb system. Do **not** touch the static mockup block at `hadith.html:1431`.

**Mobile ≤700px ellipsis collapse:** one CSS rule on `.dv-breadcrumb` collapsing middle
segments to `…`; benefits Tier 3 as well. First and last segments always visible.

---

## 4. Pulse-ring reconcile (US-H23b / §3.5, §3.14)

Single source of truth — fix the shared class, both modules inherit it.

- Rewrite `.pulse-gold` keyframe to spec:
  `0% box-shadow 0 0 0 0 rgba(197,160,89,.5) → 50% 0 0 0 16px rgba(197,160,89,0) → 100% 0`,
  **1.8s, `ease-reverent`, 2 iterations**.
- `@media (prefers-reduced-motion: reduce)`: `.pulse-gold { animation: none;
  border-color: rgba(197,160,89,.5); }` — the §3.14 block, single definition.
- Add shared `pulseRing(el)` fn in `hadith.js` (used by Continue-Reading-prompt click).
- Tier-3b: bump cleanup timeout `1600 → 3600`.

**DECISIONS.md ADR** logging before (`1.6s × 1`, ends `--elev-1`) → after
(`1.8s × 2`, ring-expand), flagged as a **user-visible** change (existing users will
see the pulse now runs longer and repeats twice) → small manual QA check.

---

## 5. Last-read tracking, restore & precedence (§3.4, §10)

### Track
IO on feed + Tier-3a cards; ≥ 3 continuous seconds visible → persist
`{collectionSlug, bookNum, hadithNum, timestamp}`. Module 7's write-on-deep-view-load
stays as an additional correct write path (not removed).

### Restore
On load with **no explicit deep-link** and last-read present:
- Pre-select the last-read collection in the sidebar (already wired via `data-browse`
  in `renderContinueReading`).
- Scroll the feed to the last-read card **iff that card is in the currently-loaded
  default feed** (Tier-1 feed only holds Bukhari Book 1). If the last-read collection is
  elsewhere, the Continue Reading prompt is the honest navigation affordance — we do not
  fake a scroll to a card that isn't rendered.

### Precedence (highest-risk case — §10, TechSpec verification note)
**"Explicit deep-link" = the resolved path (after the `?redirect=` SPA restore in
`init()`) contains a collection segment (Tier 2+).** When present:
- Continue Reading prompt is **suppressed**.
- Restore-scroll does **not** run.
- Explicit URL always wins.

**Decision — path-based deep-links only (ADR-026).** The spec's `?collection=X&book=Y&
hadith=Z` query form is treated as vestigial; the live router is path-based and the only
query params in use are `?grade=` (filter) and `?redirect=` (SPA fallback). Query-param
deep-links do **not** count as "arrived via deep-link".

---

## 6. Edge cases

| Case | Handling |
|---|---|
| Bookless collection (Musnad Ahmad) last-read | `payloadFromRef` yields `bookNum` = the bookless default; breadcrumb/prompt render without a book segment |
| Stale last-read + explicit deep-link on same load | Explicit URL wins; prompt suppressed; no restore-scroll (§10) |
| Last-read collection ≠ default feed | Prompt shown (navigates); no restore-scroll (card not in DOM) |
| `prefers-reduced-motion` | No pulse animation; `border-color` highlight only; restore-scroll uses `behavior:auto` |
| Card leaves viewport before 3s | Dwell timer cancelled; not counted read |
| `IntersectionObserver` absent (old browser) | Tracker no-ops silently; prompt/restore still work from any existing last-read |
| localStorage unavailable / quota | `safeLocalStorageSet` swallows; tracker degrades to no-op |

---

## 7. Testing

**New `worker/test/reading-progress-core.test.js`:**
- 3s continuous visibility counts as read; **2s does not** (named §14.1 test).
- Topmost-visible selection picks the correct ref among multiple records.
- `payloadFromRef` parses `slug:book:hadith` → correct payload; bookless ref handled.
- Visibility change before threshold cancels the arm.

**DOM smoke (browser), as with prior modules:** tracker writes last-read after dwell;
Tier-2 breadcrumb renders + links work; pulse runs 2 iterations; reduced-motion shows
border highlight; **explicit deep-link + stale last-read → prompt suppressed** (the
flagged conflict case).

---

## 8. Files touched (wider than the prompt's stated list)

The prompt said `hadith.html` + `hadith.js` only. Reconciling with Module 7 requires:

- **new** `src/js/reading-progress-core.js`
- `src/js/hadith.js` (observer, breadcrumb, restore, precedence, `pulseRing`)
- `hadith.html` (Tier-2 breadcrumb slot if needed, `.pulse-gold` rewrite, mobile
  ellipsis CSS, `reading-progress-core.js` script include)
- `src/js/tier3-deep-view.js` (thin `observeFeed` hook + pulse timeout bump)
- **new** `worker/test/reading-progress-core.test.js`
- `doc/DECISIONS.md` (pulse-timing ADR)

---

## 9. Non-negotiables honored

- No fabricated hadith/isnad/grades — this module is navigation/UX only; no content
  authored.
- Design system locked — reuse existing `.dv-breadcrumb` classes and gold tokens
  (`rgba(197,160,89,…)`); no new colors/fonts.
- Honest states — restore-scroll never targets an un-rendered card; prompt is the
  fallback.
