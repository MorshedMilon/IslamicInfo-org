# Design — IslamicInfo Auth Pages + Header Wiring

**Date:** 2026-07-25
**Status:** Approved (design)
**Author:** Claude Code session

## Context

The homepage header's interactive controls were reported as "not wired." Investigation
found most are already fully functional:

- **Nav links** (Quran Explorer → About) already route via plain root-level `href`s
  (`quran.html`, `hadith.html`, …). No work needed.
- **Moon/theme toggle** — fully wired inline (`index.html` ~L2207): toggles `data-theme`
  on `<html>`, persists to `localStorage['islamicinfo-theme']`, swaps sun/moon icon.
- **Language dropdown** — fully wired in `src/js/i18n.js` `buildDropdown()`: lists all 10
  locales, updates `lang`, flips `dir="rtl"` for Arabic/Urdu, persists to
  `localStorage['islamicinfo-lang']`, re-translates via `data-i18n`.

Two genuine gaps remained, plus a new directive from the owner:

1. **Search icon popup** opens but its Search button only `console.log`s the query
   (`index.html` ~L2250) — not connected to real search.
2. **Person icon** is an unwired `<button aria-label="Admin">` placeholder on all pages;
   no auth/login/signup/session system or `account.html` exists anywhere.

The owner supplied two polished auth pages from the sibling TravellyAi project
(`sign-in.html`, `sign-up.html`) and asked to reuse them, rebranded, for IslamicInfo.org.

## Decisions (owner-confirmed)

- Wire the person icon to `sign-in.html` on **all 14 pages**.
- Also create **`forgot-password.html`** (sign-in links to it).
- Also **fix the header search popup** in the same pass.

## Scope

### 1. Three new auth pages (rebrand of TravellyAi templates)

Create `sign-in.html`, `sign-up.html`, `forgot-password.html` — self-contained, keeping the
templates' layout, sub-states, validation, and animations.

Rebrand swaps (template → IslamicInfo):

- Fonts: `Inter` → `Libre Baskerville` (`--font-sans`/body); `JetBrains Mono` →
  `Shippori Mincho` (`--font-mono`); `Cormorant Garamond` unchanged (`--font-display`/serif).
  Google Fonts `<link>` updated to IslamicInfo's family set (matches existing pages).
- Brand block: TravellyAi mark/wordmark → IslamicInfo logo SVG + "Islamic**Info**" wordmark
  (lifted from existing header/footer).
- Copy: travel copy → knowledge copy (e.g. "Save your bookmarks, notes, reading progress &
  habits across devices").
- Legal links: `trust-center.html` → `privacy.html` / `terms.html`.
- Default theme: light (site default) rather than the templates' dark default; keep the
  shared `islamicinfo-theme` localStorage key so the choice syncs across the site.
- Footer line "Part of the IslamicInfo.org family" retained.

**Honesty constraint:** these remain mock/demo (no backend auth exists). Demo submit states
are kept and labeled plainly, consistent with the site's other "coming soon" states. No real
credentials are stored or transmitted. `forgot-password.html` cross-links back to sign-in;
sign-in ↔ sign-up ↔ forgot-password all linked.

### 2. Person icon → `sign-in.html` (all 14 pages)

Header person-button markup varies across pages (`icon-btn`, `ii-icon-btn`,
`title="Account"` with inline styles). Approach:

- Add a `data-account` hook + `aria-label="Sign in"` to each header person button (14 files).
- Add one `initAccountLink()` handler in `src/js/global.js` (loaded on every page) that
  routes `data-account` clicks to `sign-in.html`.

Centralized logic; no per-page restyling. Pages: index, quran, hadith, habits, dua, tools,
verify, about, contact, inheritance, islamic-studies, knowledge-hub, privacy, terms.

### 3. Header search popup fix (`index.html`)

Connect the popup's Search button and Enter key to the same dispatch the hero search uses
(`src/js/home-search-core.js` `dispatchTarget`), routing to `hadith.html?q=…`. Replace the
`console.log` stub. The popup has no content-type tabs, so it defaults to the Hadith route,
matching the hero's default tab. Empty query is a no-op.

## Out of scope

- Real authentication / session / backend (no such system exists; mock only).
- Nav links, theme toggle, language dropdown (already fully wired).
- Content-type tabs in the header search popup.

## Verification

- `npm test` remains green (no core logic changed; search reuses existing tested
  `dispatchTarget`).
- Manual: sign-in/up/forgot render correctly in light + dark; person icon routes from a
  sample of pages; popup search routes to `hadith.html?q=…`; empty query no-ops.
