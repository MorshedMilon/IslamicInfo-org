# IslamicInfo.org — Hadith Library Build Sequence
**One module per Claude Code session. Do not batch modules. Prove each one end-to-end before starting the next.**

**Source of truth for every module below:** `IslamicInfo_HadithLibrary_PRD_v1_2_Final.md` (requirements, acceptance criteria, user story IDs) + `IslamicInfo_HadithLibrary_TechSpec_v1_2.md` (component markers, API map, data model). This build-sequence doc does not restate their content — it sequences it. Read the specific sections cited per module before writing code.

**Also read every session:** this project's `CLAUDE.md`, `ISLAMICINFO_BRAND_IDENTITY.md`, and the locked blueprint `hadith_module_enhanced__1_.html`. Design system and mockups are locked — this is an implementation build, not a design build. No new CSS tokens, radii, easing curves, or layout decisions outside what's already specified.

---

## Before Module 1 — two blocking prerequisites

Both are logged as OPEN in PRD v1.2 / TechSpec v1.2 §1.1. Neither should be resolved inside a Claude Code session without your sign-off — flagging here again so they don't get silently decided mid-build:

- **DECISION-1 (grade badges):** 8 of 18 collections have no per-hadith grade field. Every module below that touches a hadith card (Modules 1, 4, 7–9, 17–18) depends on this being settled first — omit badge / find supplementary grading source / collection-level badge instead.
- **DECISION-2 (blueprint layout):** confirm `hadith_module_enhanced__1_.html`'s sidebar and collections grid actually accommodate 18 cards/rows at every breakpoint (1100/900/760/700/440px) before Module 1. If the locked mockup was built for 9, this may need a design pass — flag back to me if so, that's outside what a text-spec fix can resolve.

## Module 0 — Data layer & source router (prerequisite, already scoped)

Already delivered as `IslamicInfo-HadithLibrary-Upgrade-Prompt.md`. Run this session first — every module below assumes the Cloudflare Worker proxy, the three normalizer adapters, and the unified internal schema already exist. Do not re-scope this here; use that file as-is.

---

## Stage 1 — Foundation

### Module 1 — Sidebar + Collections Grid
**Goal:** render the 18-collection sidebar and grid, live-wired to Module 0's data layer.
**Spec refs:** PRD §3.1 US-H01, §2.3 (collections table), §4 wireframes for sidebar/grid zones. TechSpec §2.1 zones 3a/6.
**Depends on:** Module 0, DECISION-1, DECISION-2.
**Watch for:** featured treatment on Sahih al-Bukhari card only; filter tabs (All · Kutub al-Sittah · Musnad · Selected) narrow in-place, no route change; no shimmer `::after`.
**Self-review:** all 18 collections render with correct source attribution (§2.3 Source column); grade badge present/absent per DECISION-1 resolution, not inconsistently.

### Module 2 — Stats Strip + Hero Eyebrow Badge
**Goal:** 4-metric stats strip and hero eyebrow badge, both showing 18 collections and a **live-computed** total hadith count (PRD v1.2 explicitly flags: do not hardcode this number — v1.0/v1.1's "61K+" was tied to the old 9-collection set and is now wrong).
**Spec refs:** PRD §3.1 US-H02, TechSpec §2.2 Hero, §2.1 zone 4.
**Depends on:** Module 1 (needs live collection data to sum).
**Self-review:** total is computed from actual fetched/cached data at render time, not a literal string anywhere in the code.

### Module 3 — Hadith of the Day / Daily Strip
**Goal:** daily rotation strip above the grid — Arabic matn, translation, reference, grade, bookmark/share/view-isnad actions.
**Spec refs:** PRD §3.1 (daily strip AC, search "delivers immediate value before I choose a collection"), TechSpec §4.2 Hadith of the Day Rotation.
**Depends on:** Module 0.
**Watch for:** rotation source is `/data/hotd.json` (day-of-year keyed) or Cloudflare KV cron key — not Redis (TechSpec v1.2 correction).
**Self-review:** fallback to Bukhari #1 (Intentions hadith) works when rotation data is unavailable.

### Module 4 — Hadith Feed (Tier 1 default view) + Grade Filter Pills
**Goal:** the default hadith list feed with grade filter pills above it.
**Spec refs:** PRD §3 Stage 1 user stories for the feed, TechSpec §2.1 zone 8.
**Depends on:** Module 0, DECISION-1.
**Self-review:** filter pills correctly show/hide cards for collections with a real grade field; behavior for the 8 ungraded collections matches DECISION-1's resolution exactly (not a workaround improvised mid-session).

### Module 5 — Isnād Modal v1
**Goal:** the "View Isnād" expandable/modal control per hadith card, rendering the Arabic chain from the source's `text_ar`/`hadithArabic` field.
**Spec refs:** PRD §3 (isnad chain visualisation differentiator, §1 Executive Summary), TechSpec §7.5 rule 2 (v1.2-corrected: real classical Arabic text from source APIs, never fabricated, never machine-translated back into a chain).
**Depends on:** Module 0.
**Self-review:** modal does not render when `text_ar` is missing for a given hadith (no empty state pretending to be a chain); RTL rendering correct; no attempt to parse individual narrator names out of the string.

### Module 6 — Global + Sidebar Search
**Goal:** hero search pill (voice + scope selector) and compact sidebar search filtering the visible collection/book list.
**Spec refs:** PRD §3 (search user story, "As a user, I want to search across all hadith collections"), TechSpec §4.4 Hadith Search Proxy, §5 API table (search row).
**Depends on:** Modules 1, 4.
**Watch for:** search only covers the 9 HadithAPI-sourced collections live via the Worker proxy; the other 9 need the self-hosted Meilisearch index (TechSpec v1.2 note) — confirm that index is seeded with all 18 collections' text before calling this module done, not just the 9.

---

## Stage 2 — Library Navigation

### Module 7 — Tier 2: Book List Page
**Goal:** `/hadith/[collection]` route — books grid scoped to one collection.
**Spec refs:** PRD §3 (browse books user story), §2.2 routes table, TechSpec §2.1 (Books Grid zone).
**Depends on:** Module 1.
**Self-review:** route works correctly for both HadithAPI-sourced collections (books come from the Worker) and AhmedBaset/fawazahmed0-sourced ones (books come from the static/direct fetch) — this is the first module where the routing split actually matters end-to-end; test one collection from each source before calling it done.

### Module 8 — Tier 3a: Hadith List Within a Book
**Goal:** `/hadith/[collection]/[book]` route — hadith feed scoped to one book.
**Spec refs:** PRD §2.2 routes table, §3 (browse within collection).
**Depends on:** Module 7.

### Module 9 — Tier 3b: Deep-View Single Hadith Page
**Goal:** `/hadith/[collection]/[book]/[hadith]` — single-hadith focus page, all blocks per PRD §2.7.
**Spec refs:** PRD §2.2, §2.7 (deep-view block spec), TechSpec §2.1 (Deep-View zone), §10 item 15 (this route is the Lighthouse benchmark page — Performance/Accessibility/Best Practices/SEO ≥ 90).
**Depends on:** Module 8, Module 5 (isnad reuse on deep-view).
**Self-review:** Lighthouse run against this exact route before marking done — it's the named benchmark in the Definition of Done, not just "a" page.

### Module 10 — Narrator Reliability Panel
**Goal:** panel showing narrator reliability grading, sourced from classical works.
**Spec refs:** PRD §10 item 9 (Definition of Done — every reliability text traces to a named classical work: Taqrib at-Tahdhib, Tahdhib al-Kamal, Siyar A'lam an-Nubala'; no fabricated gradings), TechSpec §4.3 Narrator Data Service.
**Depends on:** Module 9.
**Watch for:** this is independent of DECISION-1 (hadith grade) — narrator reliability is a separate data concern from per-hadith authenticity grade. Don't conflate the two while building.
**Self-review:** missing-data path renders "Reliability data unavailable for this narrator" — never a placeholder that looks like real data.

### Module 11 — Breadcrumbs + Deep Links + Continue Reading
**Goal:** `Hadith › Collection › Book` breadcrumb across Tier 2/3 routes, correct back/forward handling, and the US-H23b Continue Reading restoration (last-read pulled from `localStorage['islamicinfo-hadith-last-read']`).
**Spec refs:** PRD §3 US-H23b (added in v1.1 FIX-5), §10 item 2 (deep-link/share/back-forward acceptance).
**Depends on:** Modules 7–9.

### Module 12 — Verify a Source / Ask a Question CTA Wiring
**Goal:** wire both CTAs — "Verify a Source" opens the verify engine (empty on Tier 1, pre-filled with input on deeper tiers); "Ask a Question" pre-fills the active hadith on all Tier 3 routes.
**Spec refs:** PRD §10 item 12, §8 item 28.
**Depends on:** Module 9.

---

## Stage 3 — Scholarly Tooling

### Module 13 — Topic Index + Landing Pages
**Goal:** topic grid + individual topic landing pages, cross-collection.
**Spec refs:** PRD §3 (topic browsing user story), TechSpec §2.1 zone 7 (Topics Strip).
**Depends on:** Module 6 (shares search/filter plumbing).

### Module 14 — Related-Hadith Section (scoped)
**Goal:** a related-hadith list per deep-view page — **not** the full narration graph. PRD §9 Out of Scope explicitly excludes "full hadith narration graph (visual graph of overlapping isnads across the corpus)" as research-grade/expensive. This module is the smaller "related hadiths" list only.
**Spec refs:** PRD §9 (confirms graph is out of scope — read this before scoping the session), TechSpec §5 API table (`related hadiths` row).
**Depends on:** Module 9.
**Watch for:** don't let this module scope-creep into the excluded graph feature — if Claude Code proposes graph visualization, stop and flag back.

### Module 15 — Copy-with-Attribution + Share Image
**Goal:** copy button (full scholarly reference, never strippable) + canvas-based share image generator.
**Spec refs:** PRD §8 item 27 (copy with attribution — stripping not permitted), TechSpec §7.5 rule 4, "Canvas" row in §6.1 Frontend Stack.
**Depends on:** Module 9.
**Self-review:** the only "copy text only" variant permitted is Arabic-matn-only — there is no full-strip-attribution option, confirm this in the actual UI before done.

### Module 16 — Illustrated Motifs (18 SVGs)
**Goal:** custom illustrated motif SVG per collection card, replacing the emoji placeholders.
**Spec refs:** PRD §3.1 US-H17 (v1.2-corrected to 18 total, was 9), §7 Implementation Roadmap item 35.
**Depends on:** Module 1.
**Note:** this is a design-asset production task (18 SVGs, 64×64, per §7 item 35 spec), not just code — budget accordingly, it's bigger than the other modules in this stage.

---

## Stage 4 — Signature Features

### Module 17 — Hadith Trace View
**Goal:** full-screen 3-column view (Matn · Isnād · Scholarly Grading) — PRD v1.1 FIX-3 already documents this as a 3-column web implementation vs. a 4-column functional-spec deviation; that resolution stands, don't re-litigate it in this session.
**Spec refs:** PRD §4.8 (deviation note), §10 item 13 (focus-trap requirement), TechSpec §2.1 (Trace View zone).
**Depends on:** Module 9, Module 10, DECISION-1 (grading column needs the badge decision settled).
**Self-review:** focus-trap tested with VoiceOver and NVDA per §10 item 13 — this is explicitly required, not optional QA.

### Module 18 — Comparison Mode
**Goal:** 2–3 column side-by-side hadith comparison, `/hadith/compare` route.
**Spec refs:** PRD §9 (confirms comparison is matn+isnad across collections — translation-vs-translation is explicitly a *separate*, out-of-scope feature; also capped at 3 items max), TechSpec §2.1 (Comparison Mode zone).
**Depends on:** Module 9.

### Module 19 — Reading Paths (4 canonical)
**Goal:** the 4 canonical reading paths (v1.1 FIX-2 resolved this count — "Daily Sunnah" as a 5th path is explicitly deferred post-v1, don't add it back).
**Spec refs:** PRD §3.1 (Build Stage Overview theme), v1.1 FIX-2 note near the top of the PRD.
**Depends on:** Module 9.
**Self-review:** progress persists correctly in `localStorage['islamicinfo-hadith-paths']` across sessions; "Continue" opens the next unread hadith (§10 item 16).

### Module 20 — Reading Mode
**Goal:** distraction-free reading mode — sidebar collapses, prev/next/load-more/collections-grid distractions removed.
**Spec refs:** PRD §4 wireframe notes on reading mode, `localStorage['islamicinfo-hadith-reading-mode']`.
**Depends on:** Module 9.

---

## After Module 20 — full Definition of Done pass

Run PRD §10 (all 18 items) and §8 Design System Compliance Checklist (all items, now referencing 18 collections throughout per v1.2) as one final gating session before this ships — not per-module, since several items (dark-mode parity, breakpoint audit, GA4 events across 10 KPIs) only make sense once every module exists.
