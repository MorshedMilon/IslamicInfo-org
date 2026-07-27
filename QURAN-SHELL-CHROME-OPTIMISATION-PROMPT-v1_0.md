# Claude Code Build Prompt — Quran Explorer Reading-Space Optimisation
**Target:** `quran.html` (IslamicInfo.org · Quran Explorer Shell)
**Spec version:** v1.0
**Build mode:** Phased. Run Phases 0–8 in **separate Claude Code sessions**. Do not attempt more than one phase per session.

---

## 0. How to use this document

1. Paste **Section 1 (Context & Governance)** plus **one phase section** into Claude Code per session.
2. At the end of each phase, Claude Code writes a `SESSION-CHECKPOINT.md` entry (template in §11) so the next session can resume without re-reading everything.
3. Do not let Claude Code start Phase N+1 until Phase N passes its acceptance criteria in §10.

---

## 1. Context & Governance (include in EVERY session)

### 1.1 Role

You are implementing UI chrome optimisation on an existing, working page. You are **not** redesigning the page. The visual identity, colour system, typography, and content are already correct and must not be altered.

### 1.2 Source of truth — read these first, in order

- `CLAUDE.md` (IslamicInfo.org governance — binding)
- `ISLAMICINFO_BRAND_IDENTITY.md`
- The design tokens stylesheet
- The `DECISIONS` / ADR log (append-only)
- `quran.html` and its associated CSS/JS

If any instruction in this document conflicts with `CLAUDE.md`, **`CLAUDE.md` wins**. Stop and report the conflict rather than resolving it yourself.

### 1.3 Hard constraints — non-negotiable

- **Surgical edits only.** Use `str_replace` exclusively. No file rewrites. No "cleaned up while I was in there." No reformatting of untouched lines.
- **Vanilla HTML/CSS/JS only.** No frameworks, no build step, no new npm dependencies, no CDN imports.
- **No new colours, fonts, or spacing values.** Every value comes from the existing token set. Three fonts only: Cormorant Garamond, Inter, Amiri.
- **No shimmer animations.** Anywhere. Ever.
- **No urgency copy. No fatwa language.** Applies to any new microcopy, tooltip, or empty state.
- **Grade colours stay on content modules only.** Do not introduce them into chrome.
- **`islamicinfo-theme` localStorage key is untouched.** New preferences go in a separate key (see §1.5).
- **No changes to Qur'anic text rendering, translation rendering, or tafsir content.** You are moving containers, not content.

### 1.4 Animation law

- Animate **`transform` and `opacity` only**. Never `height`, `width`, `margin`, `padding`, or `top/left`.
- **Zero cumulative layout shift.** Any chrome reveal or hide must overlay. The reading column's box must not move, ever, under any state transition.
- Every transition wrapped by `@media (prefers-reduced-motion: reduce)` → duration `0ms`, state change still applies instantly.
- Standard durations: enter `180ms`, exit `240ms`, easing `cubic-bezier(0.2, 0, 0, 1)`.

### 1.5 New preference key

Single JSON blob under `islamicinfo-reader-prefs`:

```json
{
  "sidebarPinned": false,
  "chromeAutoHide": true,
  "playerPosition": "docked",
  "focusMode": false
}
```

Read once on init, write on change, fail silently if storage is unavailable. Do not spread these across multiple keys.

### 1.6 Accessibility floor — every phase

- Hidden chrome stays in the DOM. Use `transform: translateY(-100%)` + `aria-hidden` + `inert`. **Never `display: none`** on navigation.
- Every hover-triggered reveal has a `:focus-within` equivalent.
- Every drag or hover interaction has a single-click / keyboard alternative (WCAG 2.2 SC 2.5.7).
- `Escape` from any state reveals all chrome and exits Focus Mode.
- Visible focus rings on all new controls, using the existing focus token.
- All new icon-only buttons carry `aria-label` and a `title`.

---

## 2. Phase 0 — Recon (NO EDITS)

Read `quran.html` and its stylesheet/script. Produce a written report only. Do not modify any file.

Report must contain:

1. **Chrome inventory.** Every fixed/sticky element, its selector, and its measured height in px at a 1440×900 viewport: site header, streak bar, surah title row, control chip row(s), audio bar, tafsir panel width.
2. **Total vertical chrome** as a px figure and as a % of 900px.
3. **The eleven control chips** — list each, its selector, and what it toggles.
4. **Existing state management.** How does the page currently track surah selection, reading mode, tafsir open/closed? Is there a central state object or is it ad-hoc DOM queries?
5. **Scroll container.** Is the reading column scrolling `window`, or an inner element with `overflow-y: auto`? This determines the entire Phase 4 approach — be certain.
6. **Risk list.** Anything in the current CSS that will fight `position: fixed` overlays — `overflow: hidden` on ancestors, `transform` on ancestors creating containing blocks, existing `z-index` values and their ranges.

Propose a z-index scale before writing any code. Reserve bands, e.g. content `0–99`, sidebar overlay `200`, chrome bars `300`, player `400`, modals `500`.

---

## 3. Phase 1 — Foundation

Build the plumbing. No visible change should result from this phase except that everything still works exactly as before.

**Deliverables:**

1. **CSS custom properties for chrome state**, set on `:root` or the shell root:
   - `--chrome-top-height`
   - `--chrome-top-offset` (0 when visible, negative when hidden)
   - `--sidebar-width-compact`
   - `--sidebar-width-full`
   - `--player-height-docked`
   - `--player-height-mini`

   The reading column's padding is computed from the *maximum* of these, fixed at load. It does not recompute on chrome state change — that is what guarantees zero layout shift.

2. **A single state module** (plain object + subscriber pattern, ~40 lines) holding: `sidebarCompact`, `sidebarPinned`, `sidebarHovered`, `chromeVisible`, `playerState`, `playerPosition`, `focusMode`. All later phases read and write through this. Do not query the DOM for state.

3. **Body-level state classes.** The module reflects state as classes on the shell root (`is-sidebar-compact`, `is-chrome-hidden`, `is-focus-mode`, `is-player-mini`). All CSS keys off these. No inline styles for state.

4. **`prefers-reduced-motion` block** and the global `Escape` handler, wired to the state module.

5. **Preference load/save** against `islamicinfo-reader-prefs`.

**Acceptance:** page looks and behaves byte-for-byte identically to before. State classes are togglable from the console and produce no visual change yet.

---

## 4. Phase 2 — Sidebar auto-compact

**Behaviour:**

- Default state on page load: sidebar exactly as it is today. No change.
- On surah selection: transition to compact.
- **Compact = surah number badge + English surah name only.** Hide Arabic name, Makki/Madani badge, ayah count. Do **not** reduce to a numbers-only rail.
- Hover or `:focus-within` on the compact sidebar → expand to full view as an **overlay**.

**Critical implementation rules:**

- Expansion **overlays** the reading column. `position: absolute`, elevation shadow from the existing token. The reading column's width and the ayah text position do not change by a single pixel.
- **Hover intent delay: 150ms to open, 300ms to close.** Cancel the pending timer on re-entry. Without this you get flicker when the cursor merely crosses the sidebar.
- Add a **pin / unpin toggle** at the top of the sidebar. Pinned = permanently full-width, in-flow, hover behaviour disabled. Persist to `sidebarPinned`. Label it "Keep sidebar open" / "Collapse sidebar" — plain, active voice, no jargon.
- The 3-day streak / habit tracker strip at the top of the sidebar collapses to the streak number only in compact mode.
- Scroll position within the surah list is preserved across compact ↔ full transitions.
- Keyboard: `Tab` into the list expands it and keeps it expanded until focus leaves.

**Acceptance:** repeatedly sweeping the cursor across the sidebar produces no flicker, no reflow of the Arabic text, and no scroll jump.

---

## 5. Phase 3 — Chrome consolidation

This phase saves more space than the auto-hide does. Do it before Phase 4.

**5.1 Merge the title row and the control row into one sticky bar.**

Surah title and metadata left, controls right, single row. This alone recovers roughly 60px.

**5.2 Reduce eleven chips to five plus overflow.**

Visible, always:
- Reciter selector
- Translation selector
- Tafsir toggle
- Reading / Mushaf mode toggle
- Overflow `⋯`

Behind the overflow menu:
- Word-by-word
- Study Mode
- Tajweed
- Compare
- Settings
- Bookmarks

Overflow is a standard menu button: `aria-haspopup="menu"`, `aria-expanded`, arrow-key navigation, `Escape` closes and returns focus to the trigger. Not a hover menu.

**5.3 Result:** one control row, not two. If the merged bar still wraps at 1280px width, move Reading/Mushaf into the overflow as well and report that you did.

**Acceptance:** at 1280×800, the merged bar is a single row at every supported zoom level up to 150%.

---

## 6. Phase 4 — Scroll-direction chrome auto-hide

**Trigger is scroll direction, not top-edge hover.** Top-edge hover is a secondary trigger only.

**Primary behaviour:**

- Scroll down past a 64px threshold → site header and the merged control bar translate up and out together, as one unit.
- Scroll up by more than 8px → both return.
- Scroll position at 0 → always visible, regardless of direction.
- Throttle to `requestAnimationFrame`. Do not run layout reads inside the scroll handler; cache `scrollTop` and compare.

**Secondary trigger:**

- A 64px-tall invisible hit band at the very top of the viewport. Entering it with 200ms of hover intent reveals the chrome. Leaving it re-hides after 400ms.
- This band must not swallow pointer events for anything beneath it when chrome is hidden — `pointer-events` on the band only, and only when chrome is hidden.

**Non-negotiable:**

- Chrome **overlays** on reveal. Reading column top padding is fixed from Phase 1 and never changes. Translucent background with `backdrop-filter: blur()` behind the revealed bar, using the existing surface token.
- Auto-hide never engages while a menu, dropdown, or dialog inside the chrome is open.
- Auto-hide never engages while the user is typing in the search field.
- `chromeAutoHide: false` in prefs disables the whole behaviour. Expose this as a checkbox in Settings labelled "Hide toolbar while scrolling."

**Acceptance:** scrolling through Al-Baqarah from ayah 1 to ayah 50 and back produces zero horizontal or vertical shift in the Arabic text. Verify with a Layout Shift observer logging to console during development; the sum must be 0.

---

## 7. Phase 5 — Audio player: mini-pill + snap positions

**7.1 Remove redundancy from the docked bar first.**

Current bar shows the reciter name twice and the surah title once, all of which are duplicated elsewhere on the page.

- Delete the reciter name from the left-hand title block. It stays in the right-hand selector only.
- Replace the surah title with the **currently playing ayah reference** — e.g. `Al-Baqarah · 2:14`. This updates as playback advances.
- Move the playback-speed control (`1×`) and the loop toggle into a player overflow menu or into Settings. They are set-once preferences.

Result: three control groups — transport, scrubber + ayah reference, reciter selector.

**7.2 Mini-pill state.**

- Collapse to a ~56px circular pill when playback is idle/paused, or when the user has scrolled away from the playing ayah.
- Pill contents: play/pause glyph with a circular progress ring. Current ayah number on hover or focus.
- Expands to the full transport on hover, focus, or tap; collapses again 2s after the pointer leaves.
- **The mini-pill doubles as the "Resume follow" affordance.** When the user scrolls away from the playing ayah, auto-scroll stops and the pill gains a subtle indicator; clicking it scrolls back to the playing ayah. One component, two jobs. Do not build a separate "Resume follow" pill.

**7.3 Three snap positions — no free drag.**

Free-drag repositioning is explicitly out of scope. Implement exactly three presets, cycled by a small position button in the player:

1. `docked` — full-width, bottom (default)
2. `float-right` — floating pill, bottom-right
3. `float-left` — floating pill, bottom-left

Rules:
- `float-right` must offset to avoid collision with the "Ask QuranlyAI" floating button. Detect its bounding box rather than hard-coding an offset.
- Persist to `playerPosition`. On load, validate the stored position fits the current viewport; fall back to `docked` if not.
- Below 768px viewport width, force `docked` and hide the position control.

**7.4 Auto-dim.**

While playing and after the user scrolls, drop the player to `opacity: 0.4`. Return to full opacity on hover, focus, or any playback state change. Never dim below 0.4 — it must remain legible and clickable.

**Acceptance:** the player never overlaps the Ask QuranlyAI button at any of 1920, 1440, 1280, or 1024px width. Resizing the window from 1920 to 1024 with `float-right` stored never leaves the player clipped or off-screen.

---

## 8. Phase 6 — Focus Mode + Tafsir drawer

**8.1 Focus Mode.**

The existing "Reading Mode" chip becomes a real Focus Mode. Activating it sets, in one action:

- Site header hidden
- Control bar hidden (revealed by top-edge hover or `Escape`)
- Sidebar fully collapsed to a thin edge tab
- Tafsir panel closed
- Audio player in mini-pill
- Overflow menu is the only chip access

Bind to a keyboard shortcut. Persist to `focusMode`. `Escape` exits. Show a one-time, non-blocking hint on first activation explaining how to exit — plain sentence, no urgency, dismissible, never shown again.

Ambient scroll-hide (Phase 4) handles the passive case. Focus Mode handles the intentional one. They coexist; Focus Mode simply forces all states at once.

**8.2 Tafsir panel becomes a drawer below 1440px.**

- Viewport ≥ 1440px: tafsir remains a third column, as today.
- Viewport < 1440px: tafsir becomes a right-side overlay drawer with a scrim. Opens over the reading column, does not compress it.
- The breakpoint transition must not lose scroll position within the tafsir content.
- `Escape` closes the drawer before it does anything else.

---

## 9. Phase 7 — Touch & small screens

Hover rules do not exist on touch. Specify separately; do not simulate hover.

- **Tap on the reading column toggles all chrome** (the Kindle pattern). Tap must not fire when the gesture was a scroll, a text selection, or a tap on an interactive element inside an ayah.
- **Surah list becomes a bottom sheet** invoked by a button in the control bar. No compact/expand hover behaviour.
- **Tafsir is always a full-height drawer.**
- **Audio player is always docked**, always mini-pill until tapped.
- Sidebar hover-expand, top-edge hover band, and player position cycling are all disabled below 768px.
- Minimum touch target 44×44px on every control, including the mini-pill.

---

## 10. Acceptance criteria — the whole build

These are pass/fail, not matters of taste. Report each with a measured number.

| # | Criterion | Target |
|---|---|---|
| 1 | Total vertical chrome, Focus Mode, 1440×900 | **≤ 120px** |
| 2 | Total vertical chrome, default mode, chrome visible, 1440×900 | ≤ 180px |
| 3 | Cumulative Layout Shift across a full scroll of Al-Baqarah with all chrome transitions firing | **0** |
| 4 | Reading column left edge x-position, sidebar compact vs. hover-expanded | identical |
| 5 | Animated properties across all new CSS | `transform` and `opacity` only |
| 6 | `prefers-reduced-motion: reduce` | all durations 0ms, all states still reachable |
| 7 | Full keyboard traversal of every new control, chrome hidden at start | reachable, visible focus ring on each |
| 8 | Screen reader: hidden chrome | present in DOM, correctly `aria-hidden`/`inert` |
| 9 | Merged control bar at 1280px, 150% zoom | single row, no wrap |
| 10 | New npm/CDN dependencies | 0 |
| 11 | Files rewritten rather than `str_replace`-edited | 0 |
| 12 | New colour/font/spacing values outside the token set | 0 |

---

## 11. Session checkpoint template

At the end of every phase, append to `SESSION-CHECKPOINT.md`:

```
## Phase N — <name> — <date>
Status: complete | blocked
Files touched: <list>
Selectors added: <list>
State keys added: <list>
Acceptance criteria met: <numbers from §10>
Measured chrome height: <px>
Measured CLS: <value>
Open questions for next session: <list>
Deviations from spec and why: <list>
```

---

## 12. ADR entries to append to the DECISIONS log

Append-only. Do not edit or renumber existing entries. Assign the next sequential IDs.

- **D-0xx — Sidebar auto-compacts on surah selection.** Hover and `:focus-within` expand it as an overlay, never as a push. Pin state persisted to `islamicinfo-reader-prefs`. Rationale: reflowing the Arabic text on incidental cursor movement is disorienting mid-ayah.

- **D-0xx — Chrome auto-hide is driven by scroll direction, not top-edge hover.** Top-edge hover retained as a secondary trigger with a 64px band and hover-intent delay. Rationale: the top few pixels of a maximised browser sit under the tab strip and bookmarks bar; top-edge hover fires accidentally, is undiscoverable, and does not exist on touch.

- **D-0xx — All chrome transitions animate `transform` and `opacity` only. Zero layout shift is an acceptance criterion, not a guideline.**

- **D-0xx — Chrome budget: ≤120px total vertical chrome in Focus Mode at 900px viewport height.**

- **D-0xx — Control chips reduced from eleven to five plus an overflow menu.** Title row and control row merged into one sticky bar.

- **D-0xx — Audio player position limited to three snap presets (docked, float-right, float-left). Free-drag repositioning explicitly rejected.** Rationale: persistence fragility across viewports, WCAG 2.2 SC 2.5.7 requires a non-drag alternative regardless, and a floating player relocates occlusion rather than reducing it.

- **D-0xx — Audio player collapses to a mini-pill when idle or after scroll-away; the pill doubles as the resume-follow control.**

- **D-0xx — Audio player displays the current ayah reference, not the surah title. Reciter name appears once, in the selector.**

- **D-0xx — Tafsir renders as a third column at ≥1440px and as an overlay drawer below that.**

- **D-0xx — Touch has its own chrome specification: tap-to-toggle, bottom-sheet surah list, always-docked player. Hover behaviours are disabled below 768px.**

---

## 13. Out of scope — do not build

- Free-drag / arbitrary positioning of any element
- Any change to Qur'anic text, translation, or tafsir content or its typography
- Any new colour, font, or animation vocabulary
- Resizable panels
- Multi-column reading layouts
- Any change to the `islamicinfo-theme` key or the theme system
- Refactoring of unrelated code encountered along the way — note it in the checkpoint and move on
